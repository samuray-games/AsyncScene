#!/usr/bin/env python3
"""Fail closed when root Bridge v4 authority documents disagree."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ("AGENTS.md", "AGENTS.override.md", "BRIDGE.md")
REQUIRED_MARKERS = (
    "BRIDGE_PROTOCOL: 4.0",
    "coordination/chatgpt-codex-bridge-1",
    "coordination/chatgpt-codex-bridge-2",
    "coordination/chatgpt-codex-bridge-3",
    "CROSS_SLOT_BLINDNESS: REQUIRED",
    "DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN",
)
FORBIDDEN_ACTIVE_MARKERS = (
    "BRIDGE_PROTOCOL: 3.3",
    "BRIDGE_PROTOCOL: 3.4",
    "fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`",
)


def validate_authority(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    for relative in FILES:
        path = root / relative
        if not path.is_file():
            errors.append(f"FAIL_AUTHORITY_MISSING: {relative}")
            continue
        text = path.read_text(encoding="utf-8")
        for marker in REQUIRED_MARKERS:
            if marker not in text:
                errors.append(f"FAIL_AUTHORITY_REQUIRED_MARKER: {relative}: {marker}")
        for marker in FORBIDDEN_ACTIVE_MARKERS:
            if marker in text:
                errors.append(f"FAIL_AUTHORITY_STALE_MARKER: {relative}: {marker}")
    return errors


def main() -> int:
    errors = validate_authority()
    if errors:
        print("\n".join(errors))
        return 1
    print("PASS_BRIDGE_V4_ROOT_AUTHORITY")
    return 0


if __name__ == "__main__":
    sys.exit(main())
