#!/usr/bin/env python3
"""Validate plugin-independent bridge 062 closed-loop policy."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "tools/closed_loop_contract.py"
SPEC = importlib.util.spec_from_file_location("closed_loop_contract", CONTRACT_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("unable to load contract")
CONTRACT = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CONTRACT
SPEC.loader.exec_module(CONTRACT)

REQUIRED_DOCS = (
    "AGENTS.md", "AGENTS.override.md", "PROCESS_ROOT_SYNC.md", "ORCHESTRATION.md", "BRIDGE.md",
    "CODEX_BRIDGE_BOOTSTRAP.md", "CODEX_BRIDGE_RECOVERY.md", "CLOSED_LOOP_PROTOCOL.md", "TASKS.md", "PROJECT_MEMORY.md",
)
REQUIRED_MARKERS = (
    "BRIDGE-20260710-062",
    "CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST",
    "OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND",
    "plugin-independent bridge transport",
    "source implementation acceptance",
    "separate canary acceptance",
)


def main() -> int:
    failures: list[str] = []
    result = CONTRACT.self_check()
    if result["activeIdentity"]["baseline"] != CONTRACT.BASE_COMMIT:
        failures.append("contract baseline mismatch")
    for status in CONTRACT.ILLEGAL_PRIMARY_REQUIRED_STATUSES:
        try:
            CONTRACT.validate_terminal_tuple({"status": status})
        except ValueError:
            pass
        else:
            failures.append(f"illegal status accepted: {status}")
    for path in REQUIRED_DOCS:
        full = ROOT / path
        if not full.is_file():
            failures.append(f"missing required doc: {path}")
            continue
        text = full.read_text(encoding="utf-8")
        for marker in REQUIRED_MARKERS:
            if marker not in text:
                failures.append(f"{path}: missing {marker}")
    for protected in (ROOT / ".ai-bridge", ROOT / "node_modules"):
        if protected.exists():
            # Validator proves the policy excludes these from the contract scope; it does not traverse generated deps.
            if any(str(p).startswith(str(protected)) for p in (ROOT / q for q in CONTRACT.AUTHORIZED_PATHS)):
                failures.append(f"protected path authorized: {protected.name}")
    print(json.dumps({"ok": not failures, "failures": failures, "contract": result}, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
