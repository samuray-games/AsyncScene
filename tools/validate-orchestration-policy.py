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


def _git_lines(*args: str) -> list[str]:
    import subprocess
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).splitlines()


def _sample_outbox(status: str = "PASS_PUSHED") -> dict[str, object]:
    base = {
        "status": status,
        "completionMode": "PRIMARY_DELTA",
        "phase": "AWAITING_CHATGPT_VERIFICATION",
        "verifierClassification": "SOURCE_IMPLEMENTATION_PENDING_CHATGPT",
        "recoveryClassification": "NONE",
        "nextActionCode": CONTRACT.SUCCESS_ACTION_CODE,
        "nextActionText": CONTRACT.SUCCESS_ACTION_TEXT,
        "activeIdentity": CONTRACT.ACTIVE_IDENTITY,
        "stateBlobSha": "0123456789abcdef0123456789abcdef01234567",
        "mailboxParentCommit": "89abcdef0123456789abcdef0123456789abcdef",
        "primaryCommitSha": "13579bdf2468ace013579bdf2468ace013579bdf",
        "primaryParent": CONTRACT.BASE_COMMIT,
        "changedPaths": list(CONTRACT.AUTHORIZED_PATHS),
        "authorizedPaths": list(CONTRACT.AUTHORIZED_PATHS),
        "validationResults": ["py_compile: PASS", "unittest: PASS", "policy: PASS", "diff_check: PASS"],
    }
    if status == "PASS_VERIFIED_NO_DELTA":
        base.update({
            "completionMode": "VERIFIED_NO_DELTA",
            "primaryCommitSha": CONTRACT.BASE_COMMIT,
            "primaryParent": "N/A",
            "changedPaths": [],
            "reasonNoSourceDelta": "deterministic regeneration produced zero diff",
        })
    return base


def main() -> int:
    failures: list[str] = []
    result = CONTRACT.self_check()
    if result["activeIdentity"]["baseline"] != CONTRACT.BASE_COMMIT:
        failures.append("contract baseline mismatch")
    implementation_edges = frozenset((s, t) for s, targets in CONTRACT.LEGAL_TRANSITIONS.items() for t in targets)
    if implementation_edges != CONTRACT.TRANSITION_ORACLE:
        failures.append("transition oracle is not equal to implementation table")
    if "062-02-chatgpt.md" not in CONTRACT.ACTIVE_IDENTITY["expectedOutboxPath"]:
        failures.append("active identity expected outbox is not ChatGPT-owned")
    for status in CONTRACT.ILLEGAL_PRIMARY_REQUIRED_STATUSES:
        try:
            CONTRACT.validate_terminal_tuple({"status": status})
        except ValueError:
            pass
        else:
            failures.append(f"illegal status accepted: {status}")
    try:
        CONTRACT.validate_outbox(dict(_sample_outbox(), outboxPublicationCommit="02468ace13579bdf02468ace13579bdf02468ace", outboxBlobSha="89abcdef0123456789abcdef0123456789abcdef"))
        failures.append("outbox accepted receipt-only publication evidence")
    except ValueError:
        pass
    try:
        CONTRACT.validate_outbox(_sample_outbox("PASS_VERIFIED_NO_DELTA"))
    except ValueError as exc:
        failures.append(f"verified-no-delta empty changed paths rejected: {exc}")
    if not CONTRACT.accept_closed_loop_source({"sourceImplementationAccepted": True, "canaryAccepted": True, "pluginPackageAccepted": True}):
        failures.append("plugin package state still gates source+canary acceptance")
    try:
        main_paths = _git_lines("ls-tree", "-r", "--name-only", "HEAD")
        CONTRACT.validate_main_absence([], main_tree_paths=main_paths, main_commit=_git_lines("rev-parse", "HEAD")[0])
    except Exception as exc:
        failures.append(f"main artifact absence check failed: {exc}")
    changed = _git_lines("diff", "--name-only", f"{CONTRACT.BASE_COMMIT}..HEAD")
    if sorted(changed) != sorted(CONTRACT.AUTHORIZED_PATHS):
        failures.append(f"changed paths do not match frozen scope: {changed}")
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
