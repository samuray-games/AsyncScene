#!/usr/bin/env python3
"""Fail-closed consistency checks for Asynchronia process policy."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FILES = {
    "override": ROOT / "AGENTS.override.md",
    "root_sync": ROOT / "PROCESS_ROOT_SYNC.md",
    "orchestration": ROOT / "ORCHESTRATION.md",
    "bridge": ROOT / "BRIDGE.md",
    "pull": ROOT / "GIT_PULL.md",
    "push": ROOT / "GIT_PUSH.md",
}

CANONICAL_PHASES = (
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


def read_all() -> dict[str, str]:
    missing = [str(path.relative_to(ROOT)) for path in FILES.values() if not path.is_file()]
    if missing:
        raise AssertionError(f"missing policy files: {missing}")
    return {name: path.read_text(encoding="utf-8") for name, path in FILES.items()}


def require(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle not in text:
        failures.append(f"{label}: missing {needle!r}")


def forbid(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle in text:
        failures.append(f"{label}: forbidden active token {needle!r}")


def main() -> int:
    docs = read_all()
    failures: list[str] = []

    require(docs["orchestration"], "ORCHESTRATION_VERSION: 3.1", "ORCHESTRATION.md", failures)
    require(docs["orchestration"], "BRIDGE_PROTOCOL: 3.1", "ORCHESTRATION.md", failures)
    require(docs["override"], "OVERRIDE_VERSION: ORCHESTRATION_3_1", "AGENTS.override.md", failures)
    require(docs["bridge"], "BRIDGE_PROTOCOL: 3.1", "BRIDGE.md", failures)
    require(docs["pull"], "PROTOCOL_VERSION: GIT_PULL_3_1", "GIT_PULL.md", failures)
    require(docs["push"], "PROTOCOL_VERSION: GIT_PUSH_3_1", "GIT_PUSH.md", failures)
    require(docs["root_sync"], "PROCESS_ROOT_SYNC_VERSION: 1", "PROCESS_ROOT_SYNC.md", failures)

    for label, text in docs.items():
        require(text, "ROOT_CAUSE_SYNC: REQUIRED", FILES[label].name, failures)

    for command in ("мост 1", "мост 2", "мост 3"):
        require(docs["orchestration"], command, "ORCHESTRATION.md", failures)
        require(docs["bridge"], command, "BRIDGE.md", failures)

    for legacy in ("запуль", "запушь"):
        require(docs["override"], legacy, "AGENTS.override.md", failures)
        require(docs["bridge"], legacy, "BRIDGE.md", failures)

    for phase in CANONICAL_PHASES:
        require(docs["orchestration"], f"`{phase}`", "ORCHESTRATION.md", failures)
        require(docs["bridge"], f"`{phase}`", "BRIDGE.md", failures)

    for label in ("override", "orchestration", "bridge", "push"):
        require(docs[label], "BLOCKED_PUSH_AUTH", FILES[label].name, failures)
        require(docs[label], "PROCESS_ROOT_SYNC.md", FILES[label].name, failures)

    require(docs["orchestration"], "BLOCKED_MAIN_BASELINE_MOVED", "ORCHESTRATION.md", failures)
    require(docs["bridge"], "BLOCKED_MAIN_BASELINE_MOVED", "BRIDGE.md", failures)
    require(docs["push"], "BLOCKED_MAIN_BASELINE_MOVED", "GIT_PUSH.md", failures)

    require(docs["root_sync"], "manual SHA transcription is forbidden", "PROCESS_ROOT_SYNC.md", failures)
    require(docs["orchestration"], "machine-derived", "ORCHESTRATION.md", failures)
    require(docs["bridge"], "Manual SHA transcription is forbidden.", "BRIDGE.md", failures)
    require(docs["push"], "Manual SHA transcription is forbidden.", "GIT_PUSH.md", failures)

    for label, text in docs.items():
        forbid(text, "ORCHESTRATION_VERSION: 3.0", FILES[label].name, failures)
        forbid(text, "BRIDGE_PROTOCOL: 3.0", FILES[label].name, failures)
        forbid(text, "BLOCKED_GIT_AUTH_ONE_TIME_SETUP", FILES[label].name, failures)
        forbid(text, "BLOCKED_MAILBOX_AUTH", FILES[label].name, failures)

    result = {
        "ok": not failures,
        "orchestrationVersion": "3.1",
        "rootCauseSync": "REQUIRED",
        "checkedFiles": [str(path.relative_to(ROOT)) for path in FILES.values()],
        "canonicalPhaseCount": len(CANONICAL_PHASES),
        "failures": failures,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
