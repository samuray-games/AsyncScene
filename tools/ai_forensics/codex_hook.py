"""Codex hook entrypoint for local-first forensic capture."""

from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path
import fcntl
import json
import os
import subprocess
import sys
import tempfile
from typing import Any

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from tools.ai_forensics import schema  # type: ignore[import-not-found]
    from tools.ai_forensics.git_evidence import collect_git_evidence  # type: ignore[import-not-found]
    from tools.ai_forensics.publish import default_spool_root, flush_pending, stage_run_package  # type: ignore[import-not-found]
    from tools.ai_forensics.redact import sanitize_json_compatible, sanitize_text  # type: ignore[import-not-found]
else:
    from . import schema
    from .git_evidence import collect_git_evidence
    from .publish import default_spool_root, flush_pending, stage_run_package
    from .redact import sanitize_json_compatible, sanitize_text

EVENTS = (
    "SessionStart",
    "UserPromptSubmit",
    "PostToolUse",
    "SubagentStart",
    "SubagentStop",
    "Stop",
)


def _session_root(spool_root: Path, session_id: str) -> Path:
    return spool_root / "sessions" / schema.stable_slug(session_id)


def normalize_hook_event(event_name: str, payload: dict[str, Any]) -> dict[str, Any]:
    if event_name not in EVENTS:
        raise ValueError(f"unsupported hook event: {event_name}")
    session_id = payload.get("session_id") or payload.get("sessionId") or "unknown-session"
    turn_id = payload.get("turn_id") or payload.get("turnId")
    tool_name = payload.get("tool_name") or payload.get("toolName")
    normalized = {
        "event": event_name,
        "observedAtUtc": schema.utc_now_iso(),
        "sessionId": session_id,
        "turnId": turn_id,
        "cwd": payload.get("cwd"),
        "model": payload.get("model"),
        "permissionMode": payload.get("permission_mode") or payload.get("permissionMode"),
        "transcriptPath": payload.get("transcript_path") or payload.get("transcriptPath"),
        "toolName": tool_name,
        "payload": payload,
    }
    if event_name == "Stop":
        normalized["finalAssistantMessage"] = payload.get("last_assistant_message") or payload.get("lastAssistantMessage")
    return normalized


class SessionLock:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.handle: Any | None = None

    def __enter__(self) -> "SessionLock":
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.handle = self.path.open("a+", encoding="utf-8")
        fcntl.flock(self.handle.fileno(), fcntl.LOCK_EX)
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        if self.handle is None:
            return
        fcntl.flock(self.handle.fileno(), fcntl.LOCK_UN)
        self.handle.close()


def _append_event(path: Path, event: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(schema.compact_json_dumps(event))
        handle.write("\n")
        handle.flush()
        try:
            os.fsync(handle.fileno())
        except OSError:
            pass


def _load_or_init_session(spool_root: Path, session_id: str) -> dict[str, Any]:
    session_root = _session_root(spool_root, session_id)
    metadata_path = session_root / "session.json"
    if metadata_path.exists():
        return json.loads(metadata_path.read_text(encoding="utf-8"))
    run_id = schema.generate_run_id("CODEX", session_id)
    metadata = {
        "sessionId": session_id,
        "sessionRunId": run_id,
        "turnSequence": 0,
        "nextEventIndex": 0,
        "createdAtUtc": schema.utc_now_iso(),
    }
    session_root.mkdir(parents=True, exist_ok=True)
    schema.atomic_write_json(metadata_path, metadata)
    return metadata


def _save_session(spool_root: Path, session_id: str, metadata: dict[str, Any]) -> None:
    session_root = _session_root(spool_root, session_id)
    schema.atomic_write_json(session_root / "session.json", metadata)


def _turn_identity(session_meta: dict[str, Any], stop_event: dict[str, Any]) -> tuple[str, int]:
    turn_id = stop_event.get("turnId")
    if isinstance(turn_id, str) and turn_id.strip():
        sequence = int(session_meta.get("turnSequence", 0)) + 1
        return schema.stable_slug(turn_id), sequence
    sequence = int(session_meta.get("turnSequence", 0)) + 1
    nonce = schema.generate_run_id("CODEX", "turn").rsplit("-", 1)[-1]
    return f"turn-{sequence:06d}-{nonce}", sequence


def _load_valid_events(events_path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    events: list[dict[str, Any]] = []
    malformed: list[str] = []
    if not events_path.exists():
        return events, malformed
    for line_number, line in enumerate(events_path.read_text(encoding="utf-8", errors="replace").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            parsed = json.loads(line)
        except json.JSONDecodeError as exc:
            malformed.append(f"line {line_number}: {exc}")
            continue
        if isinstance(parsed, dict):
            events.append(parsed)
        else:
            malformed.append(f"line {line_number}: non-object event")
    return events, malformed


def _launch_detached_publisher(repo_root: Path) -> None:
    subprocess.Popen(
        [sys.executable, str(Path(__file__).with_name("publish.py")), "--repo", str(repo_root), "--flush-pending"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )


def _stage_completed_turn(
    spool_root: Path,
    session_meta: dict[str, Any],
    repo_root: Path,
    stop_event: dict[str, Any],
) -> tuple[Path, int]:
    session_root = _session_root(spool_root, session_meta["sessionId"])
    events_path = session_root / "events.raw.jsonl"
    all_events, malformed_lines = _load_valid_events(events_path)
    start_index = int(session_meta.get("nextEventIndex", 0))
    if start_index < 0 or start_index > len(all_events):
        raise RuntimeError(f"invalid nextEventIndex {start_index} for session {session_meta['sessionId']}")
    turn_events = all_events[start_index:]
    if not turn_events:
        raise RuntimeError("no turn events captured for completed Stop")
    current_stop = turn_events[-1]
    if current_stop.get("event") != "Stop":
        raise RuntimeError("completed turn does not end with Stop")
    if stop_event.get("observedAtUtc") and current_stop.get("observedAtUtc") != stop_event.get("observedAtUtc"):
        raise RuntimeError("completed turn Stop does not match current Stop event")

    sanitized_events, replacements, reasons, blocked = sanitize_json_compatible(turn_events)
    turn_slug = session_meta["activeTurnSlug"]
    run_id = schema.generate_run_id("CODEX", f"{session_meta['sessionId']}-{turn_slug}")
    if blocked:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=run_id,
            status="UPLOAD_BLOCKED_REDACTION_FAIL",
            repository="samuray-games/AsyncScene",
            branch="HEAD",
            task_id=None,
        )
        run_dir = stage_run_package(
            manifest=manifest,
            events=[],
            summary={"blocked": True, "reason": "redaction fail"},
            git_evidence={"blocked": True},
            redaction_report={"blocked": True, "replacements": replacements, "reasons": reasons},
            spool_root=spool_root,
        )
        return run_dir, len(all_events)

    manifest = schema.build_manifest(
        actor="CODEX",
        run_id=run_id,
        status="UPLOAD_PENDING",
        repository="samuray-games/AsyncScene",
        branch="HEAD",
        task_id=None,
    )
    summary = {
        "eventCount": len(sanitized_events),
        "sessionId": session_meta["sessionId"],
        "sessionRunId": session_meta.get("sessionRunId"),
        "turnSlug": turn_slug,
        "turnSequence": session_meta.get("turnSequence"),
        "finalEvent": sanitized_events[-1]["event"] if sanitized_events else "NONE",
        "sessionEventStartIndex": start_index,
        "sessionEventEndIndex": len(all_events),
        "sessionEventWindow": f"{start_index}:{len(all_events)}",
        "malformedEventLines": malformed_lines,
    }
    extras: dict[str, Any] = {}
    sanitized_stop = sanitized_events[-1] if sanitized_events and sanitized_events[-1].get("event") == "Stop" else None
    if sanitized_stop and sanitized_stop.get("finalAssistantMessage"):
        final_message = sanitize_text(str(sanitized_stop["finalAssistantMessage"]))
        extras["final-response.txt"] = final_message.text
    transcript_path = next(
        (event.get("transcriptPath") for event in reversed(sanitized_events) if event.get("transcriptPath")),
        None,
    )
    if transcript_path:
        transcript = sanitize_text(str(transcript_path))
        extras["transcript-pointer.txt"] = transcript.text
    run_dir = stage_run_package(
        manifest=manifest,
        events=sanitized_events,
        summary=summary,
        git_evidence=collect_git_evidence(repo_root),
        redaction_report={"blocked": False, "replacements": replacements, "reasons": reasons},
        extras=extras,
        spool_root=spool_root,
    )
    return run_dir, len(all_events)


def capture_event(
    event_name: str,
    payload: dict[str, Any],
    repo_root: Path,
    spool_root: Path | None = None,
    *,
    launch_publisher: bool = True,
) -> dict[str, Any]:
    spool_root = spool_root or default_spool_root()
    normalized = normalize_hook_event(event_name, payload)
    session_root = _session_root(spool_root, normalized["sessionId"])
    run_dir: Path | None = None
    with SessionLock(session_root / "session.lock"):
        session_meta = _load_or_init_session(spool_root, normalized["sessionId"])
        if event_name == "Stop":
            turn_slug, turn_sequence = _turn_identity(session_meta, normalized)
            session_meta["activeTurnSlug"] = turn_slug
            session_meta["turnSequence"] = turn_sequence
            normalized["turnSequence"] = turn_sequence
            normalized["turnSlug"] = turn_slug
        _append_event(session_root / "events.raw.jsonl", normalized)
        if event_name == "Stop":
            previous_event_index = int(session_meta.get("nextEventIndex", 0))
            run_dir, next_event_index = _stage_completed_turn(spool_root, session_meta, repo_root, normalized)
            session_meta["nextEventIndex"] = next_event_index
            completed = session_meta.setdefault("completedTurns", [])
            completed.append(
                {
                    "turnSlug": session_meta["activeTurnSlug"],
                    "runDir": str(run_dir),
                    "eventWindow": f"{previous_event_index}:{next_event_index}",
                }
            )
            session_meta.pop("activeTurnSlug", None)
        _save_session(spool_root, normalized["sessionId"], session_meta)

    if launch_publisher and event_name == "SessionStart":
        _launch_detached_publisher(repo_root)
    if launch_publisher and event_name == "Stop":
        _launch_detached_publisher(repo_root)
    if run_dir is not None:
        return {"session": session_meta, "runDir": str(run_dir)}
    return {"session": session_meta}


def run_self_test() -> int:
    with tempfile.TemporaryDirectory(prefix="ai-forensics-hook-selftest-") as directory:
        root = Path(directory)
        repo_root = root / "repo"
        repo_root.mkdir()
        subprocess.run(["git", "init"], cwd=repo_root, check=True, capture_output=True)
        subprocess.run(["git", "config", "user.name", "Codex"], cwd=repo_root, check=True, capture_output=True)
        subprocess.run(["git", "config", "user.email", "codex@local.invalid"], cwd=repo_root, check=True, capture_output=True)
        subprocess.run(["git", "commit", "--allow-empty", "-m", "init"], cwd=repo_root, check=True, capture_output=True)
        spool_root = root / "spool"
        capture_event("SessionStart", {"session_id": "s1", "cwd": str(repo_root)}, repo_root, spool_root, launch_publisher=False)
        capture_event("PostToolUse", {"session_id": "s1", "tool_name": "exec", "cwd": str(repo_root)}, repo_root, spool_root, launch_publisher=False)
        result = capture_event(
            "Stop",
            {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "done"},
            repo_root,
            spool_root,
            launch_publisher=False,
        )
        if not Path(result["runDir"]).exists():
            raise RuntimeError("expected staged run directory")
        flush_pending(repo_root=repo_root, spool_root=spool_root, dry_run=True)
    print("AI_FORENSICS_CODEX_HOOK_SELF_TEST_PASS")
    return 0


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("event", nargs="?")
    parser.add_argument("--repo", default=".")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return run_self_test()

    if not args.event:
        parser.error("event is required")
        return 2

    raw = sys.stdin.read()
    payload = json.loads(raw) if raw.strip() else {}
    result = capture_event(args.event, payload, Path(args.repo).resolve())
    sys.stdout.write(schema.deterministic_json_dumps(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
