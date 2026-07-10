#!/usr/bin/env python3
"""Validate plugin-independent bridge 062 closed-loop policy."""

from __future__ import annotations

import importlib.util
import json
import subprocess
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
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).splitlines()


def _run_validation_command(command: list[str]) -> tuple[bool, str]:
    completed = subprocess.run(command, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    return completed.returncode == 0, completed.stdout.strip()


def _record_command_result(
    key: str,
    command: list[str],
    validation_results: dict[str, str],
    validation_outputs: dict[str, str],
    failures: list[str],
) -> None:
    passed, output = _run_validation_command(command)
    validation_outputs[key] = output
    validation_results[key] = "PASS" if passed else "FAIL"
    if not passed:
        failures.append(f"{key} command failed: {output}")


def _sample_outbox(status: str = "PASS_PUSHED") -> dict[str, object]:
    base = {
        "status": status,
        "completionMode": "PRIMARY_DELTA",
        "phase": "AWAITING_CHATGPT_VERIFICATION",
        "verifierClassification": "SOURCE_IMPLEMENTATION_PENDING_CHATGPT",
        "recoveryClassification": "NONE",
        "nextActionCode": CONTRACT.SUCCESS_ACTION_CODE,
        "nextActionText": CONTRACT.SUCCESS_ACTION_TEXT,
        "activeIdentity": dict(CONTRACT.ACTIVE_IDENTITY),
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


def _cloud_execution_report(head: str, changed: list[str], validation_results: dict[str, str]) -> dict[str, object]:
    protected_paths_changed = any(path not in CONTRACT.AUTHORIZED_PATHS for path in changed)
    mailbox_paths_changed = any(path.startswith(".ai-bridge/") for path in changed)
    return {
        "threadId": CONTRACT.ACTIVE_IDENTITY["threadId"],
        "executionEpoch": CONTRACT.ACTIVE_IDENTITY["executionEpoch"],
        "taskNonce": CONTRACT.ACTIVE_IDENTITY["taskNonce"],
        "baseCommit": CONTRACT.BASE_COMMIT,
        "headCommit": head,
        "changedPaths": changed,
        "validationResults": validation_results,
        "mutationFamiliesTested": sorted(CONTRACT.mutation_proof_matrix()),
        "protectedPathsChanged": protected_paths_changed,
        "mailboxPathsChanged": mailbox_paths_changed,
        "nextActionCode": CONTRACT.PR_NEXT_ACTION_CODE,
    }


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
        CONTRACT.ensure_frozen_base_evidence_available()
        main_paths = _git_lines("ls-tree", "-r", "--name-only", CONTRACT.BASE_COMMIT)
        CONTRACT.validate_main_absence([], main_tree_paths=main_paths, main_commit=CONTRACT.BASE_COMMIT)
    except Exception as exc:
        failures.append(f"main artifact absence check failed: {exc}")
    CONTRACT.ensure_frozen_base_evidence_available()
    changed = _git_lines("diff", "--name-only", f"{CONTRACT.BASE_COMMIT}..HEAD")
    if sorted(changed) != sorted(CONTRACT.AUTHORIZED_PATHS):
        failures.append(f"changed paths do not match frozen scope: {changed}")
    validation_outputs: dict[str, str] = {}
    validation_results: dict[str, str] = {}
    _record_command_result(
        "py_compile",
        [sys.executable, "-m", "py_compile", "tools/closed_loop_contract.py", "tools/test_closed_loop_contract.py", "tools/validate-orchestration-policy.py"],
        validation_results,
        validation_outputs,
        failures,
    )
    _record_command_result(
        "unittest",
        [sys.executable, "-m", "unittest", "tools.test_closed_loop_contract"],
        validation_results,
        validation_outputs,
        failures,
    )
    _record_command_result(
        "diff_check",
        ["git", "diff", "--check", f"{CONTRACT.BASE_COMMIT}...HEAD"],
        validation_results,
        validation_outputs,
        failures,
    )
    protected_paths_changed = any(path not in CONTRACT.AUTHORIZED_PATHS for path in changed)
    mailbox_paths_changed = any(path.startswith(".ai-bridge/") for path in changed)
    if protected_paths_changed:
        failures.append(f"protected paths changed: {[path for path in changed if path not in CONTRACT.AUTHORIZED_PATHS]}")
    if mailbox_paths_changed:
        failures.append(f"mailbox paths changed: {[path for path in changed if path.startswith('.ai-bridge/')]}")
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
    validation_results["policy"] = "PASS" if not failures else "FAIL"
    head = _git_lines("rev-parse", "HEAD")[0]
    report = _cloud_execution_report(head, changed, validation_results)
    if not failures:
        try:
            CONTRACT.validate_cloud_execution_report(report, expected_head=head)
        except Exception as exc:
            failures.append(f"cloud execution report invalid: {exc}")
            validation_results["policy"] = "FAIL"
            report = _cloud_execution_report(head, changed, validation_results)
    output = {"ok": not failures, "failures": failures, "validationOutputs": validation_outputs, "contract": result}
    if not failures:
        output["cloudExecutionReport"] = report
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
