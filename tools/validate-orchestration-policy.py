#!/usr/bin/env python3
"""Fail-closed consistency checks for Asynchronia process policy."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "agents": ROOT / "AGENTS.md",
    "override": ROOT / "AGENTS.override.md",
    "root_sync": ROOT / "PROCESS_ROOT_SYNC.md",
    "orchestration": ROOT / "ORCHESTRATION.md",
    "bridge": ROOT / "BRIDGE.md",
    "pull": ROOT / "GIT_PULL.md",
    "push": ROOT / "GIT_PUSH.md",
}
PHASES = (
    "CLOSED",
    "SCOPE_FREEZE",
    "READY_FOR_CODEX",
    "EXECUTE_AND_PUBLISH",
    "OUTBOX_PUBLISHED_AWAITING_CHATGPT",
    "CORRECTION_REQUIRED",
    "READY_FOR_SAFARI",
    "AWAITING_SAFARI",
    "PASS_ACCEPTED",
    "BLOCKED_EXTERNAL",
)


def require(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle not in text:
        failures.append(f"{label}: missing {needle!r}")


def forbid(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle in text:
        failures.append(f"{label}: forbidden {needle!r}")


def main() -> int:
    failures: list[str] = []
    missing = [str(path.relative_to(ROOT)) for path in FILES.values() if not path.is_file()]
    if missing:
        print(json.dumps({"ok": False, "failures": [f"missing: {missing}"]}, ensure_ascii=False, indent=2))
        return 1

    docs = {name: path.read_text(encoding="utf-8") for name, path in FILES.items()}

    require(docs["agents"], "BRIDGE_PROTOCOL: 3.1", "AGENTS.md", failures)
    require(docs["override"], "OVERRIDE_VERSION: ORCHESTRATION_3_1", "AGENTS.override.md", failures)
    require(docs["orchestration"], "ORCHESTRATION_VERSION: 3.1", "ORCHESTRATION.md", failures)
    require(docs["bridge"], "BRIDGE_PROTOCOL: 3.1", "BRIDGE.md", failures)
    require(docs["pull"], "PROTOCOL_VERSION: GIT_PULL_3_1", "GIT_PULL.md", failures)
    require(docs["push"], "PROTOCOL_VERSION: GIT_PUSH_3_1", "GIT_PUSH.md", failures)
    require(docs["root_sync"], "PROCESS_ROOT_SYNC_VERSION: 2", "PROCESS_ROOT_SYNC.md", failures)

    for label, text in docs.items():
        require(text, "ROOT_CAUSE_SYNC: REQUIRED", FILES[label].name, failures)
        require(text, "NO_OP_COMPLETION: FORBIDDEN", FILES[label].name, failures)
        forbid(text, "BRIDGE_PROTOCOL: 3.0", FILES[label].name, failures)
        forbid(text, "ORCHESTRATION_VERSION: 3.0", FILES[label].name, failures)
        forbid(text, "MODEL_PREFLIGHT_ONLY", FILES[label].name, failures)

    for text_name in ("agents", "override", "orchestration", "bridge"):
        require(docs[text_name], "FAIL_NO_EXECUTION_EVIDENCE", FILES[text_name].name, failures)
        require(docs[text_name], "THREAD_ROTATION_REQUIRED", FILES[text_name].name, failures)
        require(docs[text_name], "EXECUTION_EPOCH", FILES[text_name].name, failures)

    for phase in PHASES:
        require(docs["orchestration"], f"`{phase}`", "ORCHESTRATION.md", failures)

    require(docs["bridge"], "Manual SHA transcription is forbidden.", "BRIDGE.md", failures)
    require(docs["push"], "BLOCKED_MAIN_BASELINE_MOVED", "GIT_PUSH.md", failures)
    require(docs["override"], "BLOCKED_PUSH_AUTH", "AGENTS.override.md", failures)

    result = {
        "ok": not failures,
        "orchestrationVersion": "3.1",
        "rootCauseSync": "REQUIRED",
        "noOpCompletion": "FORBIDDEN",
        "checkedFiles": [str(path.relative_to(ROOT)) for path in FILES.values()],
        "canonicalPhaseCount": len(PHASES),
        "failures": failures,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
