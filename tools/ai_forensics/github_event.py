"""GitHub Actions event producer for immutable forensics packages."""

from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path
import json
import os
import sys
import tempfile
from typing import Any

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from tools.ai_forensics import schema  # type: ignore[import-not-found]
    from tools.ai_forensics.git_evidence import collect_git_evidence  # type: ignore[import-not-found]
    from tools.ai_forensics.publish import publish_staged_run, stage_run_package  # type: ignore[import-not-found]
    from tools.ai_forensics.redact import sanitize_json_compatible  # type: ignore[import-not-found]
else:
    from . import schema
    from .git_evidence import collect_git_evidence
    from .publish import publish_staged_run, stage_run_package
    from .redact import sanitize_json_compatible

SUPPORTED_EVENTS = {"push", "pull_request", "issues", "issue_comment", "workflow_dispatch"}


def _valid_sha(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    candidate = value.strip()
    if len(candidate) == 40 and all(char in "0123456789abcdefABCDEF" for char in candidate):
        return candidate.lower()
    return None


def _approved_task_id(payload: dict[str, Any]) -> str | None:
    direct = payload.get("task_id") or payload.get("taskId")
    if isinstance(direct, str) and direct.strip():
        return direct.strip()
    inputs = payload.get("inputs")
    if isinstance(inputs, dict):
        for key in ("task_id", "taskId", "task"):
            value = inputs.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    return None


def _github_sha_metadata(event_name: str, payload: dict[str, Any], env: dict[str, str]) -> dict[str, Any]:
    checkout_sha = _valid_sha(env.get("GITHUB_SHA"))
    if event_name == "push":
        source_sha = _valid_sha(payload.get("before")) or checkout_sha
        result_sha = _valid_sha(payload.get("after")) or checkout_sha
        return {
            "sourceSha": source_sha,
            "sourceShaSemantics": "push.before" if _valid_sha(payload.get("before")) else ("checked_out_head_fallback" if source_sha else None),
            "resultSha": result_sha,
            "resultShaSemantics": "push.after" if _valid_sha(payload.get("after")) else ("checked_out_head_fallback" if result_sha else None),
            "sourceBranch": env.get("GITHUB_REF_NAME") or env.get("GITHUB_REF", "UNKNOWN"),
        }
    semantics = "checked_out_head" if checkout_sha else None
    return {
        "sourceSha": checkout_sha,
        "sourceShaSemantics": semantics,
        "resultSha": checkout_sha,
        "resultShaSemantics": semantics,
        "sourceBranch": env.get("GITHUB_REF_NAME") or env.get("GITHUB_REF", "UNKNOWN"),
    }


def build_record(
    event_name: str,
    payload: dict[str, Any],
    env: dict[str, str],
) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any], dict[str, Any], dict[str, Any]]:
    if event_name not in SUPPORTED_EVENTS:
        raise ValueError(f"unsupported event: {event_name}")
    repository = env.get("GITHUB_REPOSITORY", "samuray-games/AsyncScene")
    run_id = schema.generate_run_id("GITHUB", env.get("GITHUB_RUN_ID", event_name))
    sha_metadata = _github_sha_metadata(event_name, payload, env)
    manifest = schema.build_manifest(
        actor="GITHUB",
        run_id=run_id,
        status="UPLOAD_PENDING",
        repository=repository,
        branch=env.get("GITHUB_REF_NAME") or env.get("GITHUB_REF", "UNKNOWN"),
        task_id=_approved_task_id(payload),
    )
    events = [
        {
            "event": event_name,
            "observedAtUtc": schema.utc_now_iso(),
            "deliveryId": env.get("GITHUB_RUN_ID"),
            "action": payload.get("action"),
        }
    ]
    summary = {
        "eventName": event_name,
        "repository": repository,
        "workflow": env.get("GITHUB_WORKFLOW"),
        "runId": env.get("GITHUB_RUN_ID"),
        "sourceSha": sha_metadata.get("sourceSha"),
        "sourceShaSemantics": sha_metadata.get("sourceShaSemantics"),
        "resultSha": sha_metadata.get("resultSha"),
        "resultShaSemantics": sha_metadata.get("resultShaSemantics"),
    }
    sanitized_payload, replacements, reasons, blocked = sanitize_json_compatible(payload)
    redaction_report = {
        "blocked": blocked,
        "replacements": replacements,
        "reasons": reasons,
    }
    return manifest, events, summary, {"payload": sanitized_payload, "redactionReport": redaction_report}, sha_metadata


def run_self_test() -> int:
    with tempfile.TemporaryDirectory(prefix="ai-forensics-github-selftest-") as directory:
        root = Path(directory)
        repo_root = root / "repo"
        repo_root.mkdir()
        manifest, events, summary, extras, metadata_updates = build_record(
            "workflow_dispatch",
            {"inputs": {"task": "self-test"}},
            {
                "GITHUB_REPOSITORY": "samuray-games/AsyncScene",
                "GITHUB_REF_NAME": "main",
                "GITHUB_RUN_ID": "1234",
                "GITHUB_SHA": "0123456789abcdef0123456789abcdef01234567",
            },
        )
        run_dir = stage_run_package(
            manifest=manifest,
            events=events,
            summary=summary,
            git_evidence={"commands": []},
            redaction_report=extras["redactionReport"],
            extras={"event.json": extras["payload"]},
            spool_root=root / "spool",
            metadata_updates=metadata_updates,
        )
        metadata = publish_staged_run(run_dir, repo_root=repo_root, dry_run=True)
        if metadata.get("dryRun") is not True:
            raise RuntimeError("expected dry run metadata")
    print("AI_FORENSICS_GITHUB_EVENT_SELF_TEST_PASS")
    return 0


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--event-path")
    parser.add_argument("--event-name")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return run_self_test()

    event_path = args.event_path or os.environ.get("GITHUB_EVENT_PATH")
    event_name = args.event_name or os.environ.get("GITHUB_EVENT_NAME")
    if not event_path or not event_name:
        parser.error("event path and event name are required")
        return 2

    payload = json.loads(Path(event_path).read_text(encoding="utf-8"))
    manifest, events, summary, extras, metadata_updates = build_record(event_name, payload, dict(os.environ))
    run_dir = stage_run_package(
        manifest=manifest,
        events=events,
        summary=summary,
        git_evidence=collect_git_evidence(args.repo, refs=["origin/main"]),
        redaction_report=extras["redactionReport"],
        extras={"event.json": extras["payload"]},
        metadata_updates=metadata_updates,
    )
    metadata = publish_staged_run(run_dir, repo_root=Path(args.repo).resolve(), dry_run=args.dry_run)
    print(schema.deterministic_json_dumps(metadata))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
