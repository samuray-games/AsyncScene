"""Codex hook entrypoint for local-first forensic capture."""

from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path
import json
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


def _append_event(path: Path, event: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=False, sort_keys=True))
        handle.write("\n")


def _load_or_init_session(spool_root: Path, session_id: str) -> dict[str, Any]:
    session_root = _session_root(spool_root, session_id)
    metadata_path = session_root / "session.json"
    if metadata_path.exists():
        return json.loads(metadata_path.read_text(encoding="utf-8"))
    run_id = schema.generate_run_id("CODEX", session_id)
    metadata = {
        "sessionId": session_id,
        "runId": run_id,
        "createdAtUtc": schema.utc_now_iso(),
    }
    session_root.mkdir(parents=True, exist_ok=True)
    metadata_path.write_text(schema.deterministic_json_dumps(metadata), encoding="utf-8")
    return metadata


def _launch_detached_publisher(repo_root: Path) -> None:
    subprocess.Popen(
        [sys.executable, str(Path(__file__).with_name("publish.py")), "--repo", str(repo_root), "--flush-pending"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )


def _stage_completed_session(spool_root: Path, session_meta: dict[str, Any], repo_root: Path) -> Path:
    session_root = _session_root(spool_root, session_meta["sessionId"])
    events_path = session_root / "events.raw.jsonl"
    events = [
        json.loads(line)
        for line in events_path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    sanitized_events, replacements, reasons, blocked = sanitize_json_compatible(events)
    if blocked:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=session_meta["runId"],
            status="UPLOAD_BLOCKED_REDACTION_FAIL",
            repository="samuray-games/AsyncScene",
            branch="HEAD",
            task_id=None,
        )
        return stage_run_package(
            manifest=manifest,
            events=[],
            summary={"blocked": True, "reason": "redaction fail"},
            git_evidence={"blocked": True},
            redaction_report={"blocked": True, "replacements": replacements, "reasons": reasons},
            spool_root=spool_root,
        )

    manifest = schema.build_manifest(
        actor="CODEX",
        run_id=session_meta["runId"],
        status="UPLOAD_PENDING",
        repository="samuray-games/AsyncScene",
        branch="HEAD",
        task_id=None,
    )
    summary = {
        "eventCount": len(sanitized_events),
        "sessionId": session_meta["sessionId"],
        "finalEvent": sanitized_events[-1]["event"] if sanitized_events else "NONE",
    }
    extras: dict[str, Any] = {}
    stop_event = next((event for event in sanitized_events if event["event"] == "Stop"), None)
    if stop_event and stop_event.get("finalAssistantMessage"):
        final_message = sanitize_text(str(stop_event["finalAssistantMessage"]))
        extras["final-response.txt"] = final_message.text
    transcript_path = next((event.get("transcriptPath") for event in sanitized_events if event.get("transcriptPath")), None)
    if transcript_path:
        transcript = sanitize_text(str(transcript_path))
        extras["transcript-pointer.txt"] = transcript.text
    return stage_run_package(
        manifest=manifest,
        events=sanitized_events,
        summary=summary,
        git_evidence=collect_git_evidence(repo_root),
        redaction_report={"blocked": False, "replacements": replacements, "reasons": reasons},
        extras=extras,
        spool_root=spool_root,
    )


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
    session_meta = _load_or_init_session(spool_root, normalized["sessionId"])
    session_root = _session_root(spool_root, normalized["sessionId"])
    _append_event(session_root / "events.raw.jsonl", normalized)
    if launch_publisher and event_name in {"SessionStart", "Stop"}:
        _launch_detached_publisher(repo_root)
    if event_name == "Stop":
        run_dir = _stage_completed_session(spool_root, session_meta, repo_root)
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
