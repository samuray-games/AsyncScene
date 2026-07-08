#!/usr/bin/env python3
"""Fail-closed consistency checks for Asynchronia process policy."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FILES = {
    "override": ROOT / "AGENTS.override.md",
    "orchestration": ROOT / "ORCHESTRATION.md",
    "bridge": ROOT / "BRIDGE.md",
    "pull": ROOT / "GIT_PULL.md",
    "push": ROOT / "GIT_PUSH.md",
}

CANONICAL_PHASES = (
    "CLOSED",
    "SCOPE_FREEZE",
    "MODEL_PREFLIGHT_ONLY",
    "AWAITING_USER_CONTINUE",
    "EXECUTE_NOW",
    "MAIN_PUBLISHED_AWAITING_OUTBOX",
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

    require(docs["orchestration"], "ORCHESTRATION_VERSION: 3.0", "ORCHESTRATION.md", failures)
    require(docs["orchestration"], "BRIDGE_PROTOCOL: 3.0", "ORCHESTRATION.md", failures)
    require(docs["override"], "OVERRIDE_VERSION: ORCHESTRATION_3_0", "AGENTS.override.md", failures)
    require(docs["bridge"], "BRIDGE_PROTOCOL: 3.0", "BRIDGE.md", failures)
    require(docs["pull"], "PROTOCOL_VERSION: GIT_PULL_3_0", "GIT_PULL.md", failures)
    require(docs["push"], "PROTOCOL_VERSION: GIT_PUSH_3_0", "GIT_PUSH.md", failures)

    for command in ("мост 1", "мост 2", "мост 3", "пул", "пуш"):
        require(docs["orchestration"], command, "ORCHESTRATION.md", failures)

    for legacy in ("запуль", "запушь"):
        require(docs["override"], legacy, "AGENTS.override.md", failures)
        require(docs["bridge"], legacy, "BRIDGE.md", failures)

    require(docs["pull"], "COMMAND_ALIAS: `пул`", "GIT_PULL.md", failures)
    require(docs["push"], "COMMAND_ALIAS: `пуш`", "GIT_PUSH.md", failures)

    for phase in CANONICAL_PHASES:
        require(docs["orchestration"], f"`{phase}`", "ORCHESTRATION.md", failures)
        require(docs["bridge"], f"`{phase}`", "BRIDGE.md", failures)

    for label, text in docs.items():
        if label in {"orchestration", "override", "bridge", "push"}:
            require(text, "BLOCKED_PUSH_AUTH", FILES[label].name, failures)

    require(
        docs["orchestration"],
        "No second `APPROVE` round is required for a numbered bridge task.",
        "ORCHESTRATION.md",
        failures,
    )
    require(
        docs["override"],
        "No additional `APPROVE` round is required for that numbered bridge task.",
        "AGENTS.override.md",
        failures,
    )
    require(
        docs["bridge"],
        "No additional `APPROVE` is required.",
        "BRIDGE.md",
        failures,
    )

    for label in ("orchestration", "override", "bridge", "push"):
        require(docs[label], "recovery bundle", FILES[label].name, failures)

    forbid(docs["override"], "BLOCKED_MAILBOX_AUTH", "AGENTS.override.md", failures)
    forbid(docs["bridge"], "BLOCKED_MAILBOX_AUTH", "BRIDGE.md", failures)
    forbid(docs["push"], "BLOCKED_MAILBOX_AUTH", "GIT_PUSH.md", failures)

    require(
        docs["orchestration"],
        "No extra `продолжаем` command is required",
        "ORCHESTRATION.md",
        failures,
    )
    require(
        docs["orchestration"],
        "A SHA-only report is insufficient.",
        "ORCHESTRATION.md",
        failures,
    )
    require(
        docs["push"],
        "A SHA-only report is invalid.",
        "GIT_PUSH.md",
        failures,
    )

    result = {
        "ok": not failures,
        "orchestrationVersion": "3.0",
        "checkedFiles": [str(path.relative_to(ROOT)) for path in FILES.values()],
        "canonicalPhaseCount": len(CANONICAL_PHASES),
        "failures": failures,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as exc:
        print(json.dumps({"ok": False, "failures": [str(exc)]}, ensure_ascii=False, indent=2))
        raise SystemExit(1)
