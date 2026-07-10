#!/usr/bin/env python3
"""Validate the Asynchronia orchestration policy surface."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "tools/closed_loop_contract.py"
WORKFLOW = ROOT / ".github/workflows/orchestration-policy.yml"
SKILLS_DIR = ROOT / "plugins/asynchronia/skills"
PLUGIN = ROOT / "plugins/asynchronia/.codex-plugin/plugin.json"

ROOT_FILES = (
    ROOT / "AGENTS.md",
    ROOT / "AGENTS.override.md",
    ROOT / "PROCESS_ROOT_SYNC.md",
    ROOT / "ORCHESTRATION.md",
    ROOT / "BRIDGE.md",
    ROOT / "CODEX_BRIDGE_BOOTSTRAP.md",
    ROOT / "CODEX_BRIDGE_RECOVERY.md",
    ROOT / "GIT_PULL.md",
    ROOT / "GIT_PUSH.md",
    ROOT / "STAGE6_PARALLEL_EXECUTION_PLAN.md",
    ROOT / "CLOSED_LOOP_PROTOCOL.md",
)

SPEC = importlib.util.spec_from_file_location("closed_loop_contract", CONTRACT_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("unable to load closed loop contract")
CONTRACT = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CONTRACT
SPEC.loader.exec_module(CONTRACT)


def require(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle not in text:
        failures.append(f"{label}: missing {needle!r}")


def main() -> int:
    failures: list[str] = []
    contract_result = CONTRACT.self_check()

    if len(CONTRACT.LEGAL_STATES) != 12:
        failures.append("contract: expected 12 legal states")
    if set(CONTRACT.LEGAL_STATES) != {
        "CLOSED",
        "PREPARING",
        "READY_FOR_CODEX",
        "EXECUTING",
        "PRIMARY_PUBLISHED",
        "OUTBOX_PUBLISHING",
        "AWAITING_CHATGPT_VERIFICATION",
        "ACCEPTED",
        "CORRECTION_REQUIRED",
        "RECOVERY_REQUIRED",
        "BLOCKED_EXTERNAL",
        "SUPERSEDED",
    }:
        failures.append("contract: legal states mismatch")
    if "PRIMARY_PUBLISHED" not in CONTRACT.LEGAL_TRANSITIONS or "OUTBOX_PUBLISHING" not in CONTRACT.LEGAL_TRANSITIONS["PRIMARY_PUBLISHED"]:
        failures.append("contract: transition table incomplete")
    if len(CONTRACT.POSITIVE_CONTROLS) < 42:
        failures.append("contract: positive controls too small")
    if len(CONTRACT.NEGATIVE_CONTROLS) != 52:
        failures.append("contract: negative controls count mismatch")

    for current, targets in CONTRACT.LEGAL_TRANSITIONS.items():
        for target in targets:
            CONTRACT.validate_transition(current, target)
    for current in CONTRACT.LEGAL_STATES:
        for target in CONTRACT.LEGAL_STATES:
            if target in CONTRACT.LEGAL_TRANSITIONS[current]:
                continue
            try:
                CONTRACT.validate_transition(current, target)
            except ValueError:
                continue
            failures.append(f"contract: illegal transition unexpectedly allowed {current} -> {target}")
    CONTRACT.validate_report_schema(
        {
            "status": "PASS_PUSHED",
            "completionMode": "PRIMARY_DELTA",
            "primaryChanged": True,
            "verifiedPrimarySha": "e599beddbbd03c8585f9c44f0f7c190338e123e7",
            "primaryParent": "e599beddbbd03c8585f9c44f0f7c190338e123e7",
            "changedPaths": [".ai-bridge/outbox/BRIDGE-20260710-058-02-codex.md"],
            "authorizedPaths": [".ai-bridge/outbox/BRIDGE-20260710-058-02-codex.md"],
            "validationResults": ["py_compile: PASS", "unittest: PASS"],
            "negativeControls": list(CONTRACT.NEGATIVE_CONTROLS),
            "positiveControls": list(CONTRACT.POSITIVE_CONTROLS),
            "recoveryClassification": "CORRECTION_REQUIRED",
            "nextAction": "Open a fresh ChatGPT conversation and send мост 3.",
            "remoteMailboxCommit": "e599beddbbd03c8585f9c44f0f7c190338e123e7",
            "remoteStateSha": "e599beddbbd03c8585f9c44f0f7c190338e123e7",
            "byteEquality": "MATCH",
            "outboxPath": ".ai-bridge/outbox/BRIDGE-20260710-058-02-codex.md",
            "baselineSha": "e599beddbbd03c8585f9c44f0f7c190338e123e7",
            "bridgeSlot": 3,
            "threadId": "BRIDGE-20260710-058",
            "laneId": "PROCESS-CLOSED-LOOP-CORE-COMPLETION",
            "taskId": "TASK-PROCESS-CLOSED-LOOP-CORE-COMPLETION",
            "executionEpoch": "CLOSED-LOOP-CORE-R2-20260710-1146JST",
            "taskNonce": "CLV1-058-CORE-E599-1146",
            "coordinatorMemoryRev": "2026-07-10-1146-JST",
            "policyVersion": CONTRACT.POLICY_VERSION,
        }
    )
    try:
        CONTRACT.evaluate_control("not_a_control")
    except ValueError:
        pass
    else:
        failures.append("contract: unknown control unexpectedly accepted")
    CONTRACT.validate_identity(CONTRACT.ClosedLoopState(
        bridge_slot=3,
        thread_id="BRIDGE-20260710-058",
        lane_id="PROCESS-CLOSED-LOOP-CORE-COMPLETION",
        task_id="TASK-PROCESS-CLOSED-LOOP-CORE-COMPLETION",
        execution_epoch="CLOSED-LOOP-CORE-R2-20260710-1146JST",
        task_nonce="CLV1-058-CORE-E599-1146",
        coordinator_memory_rev="2026-07-10-1146-JST",
        baseline_sha="e599beddbbd03c8585f9c44f0f7c190338e123e7",
        inbox_path=".ai-bridge/inbox/BRIDGE-20260710-058-01-chatgpt.md",
        claim_path=".ai-bridge/claims/BRIDGE-20260710-058-claim-v1-codex.md",
        expected_outbox_path=".ai-bridge/outbox/BRIDGE-20260710-058-02-codex.md",
        remote_state_sha="e599beddbbd03c8585f9c44f0f7c190338e123e7",
        completion_mode="PRIMARY_DELTA",
        result_status="PASS_PUSHED",
        next_action="Open a fresh ChatGPT conversation and send мост 3.",
        current_state="PRIMARY_PUBLISHED",
    ))

    docs = {path.name: path.read_text(encoding="utf-8") for path in ROOT_FILES}
    for path in ROOT_FILES:
        if not path.is_file():
            failures.append(f"missing file: {path.relative_to(ROOT)}")

    require(docs["AGENTS.md"], "scope-isolation-check", "AGENTS.md", failures)
    require(docs["ORCHESTRATION.md"], "scope-isolation-check", "ORCHESTRATION.md", failures)
    require(docs["BRIDGE.md"], "scope-isolation-check", "BRIDGE.md", failures)
    require(docs["AGENTS.md"], "BLOCKED_SCOPE_COLLISION", "AGENTS.md", failures)
    require(docs["ORCHESTRATION.md"], "BLOCKED_SCOPE_COLLISION", "ORCHESTRATION.md", failures)
    require(docs["BRIDGE.md"], "BLOCKED_SCOPE_COLLISION", "BRIDGE.md", failures)
    require(docs["AGENTS.md"], "BRIDGE_PROTOCOL: 3.3", "AGENTS.md", failures)
    require(docs["ORCHESTRATION.md"], "ORCHESTRATION_VERSION: 3.3", "ORCHESTRATION.md", failures)
    require(docs["BRIDGE.md"], "BRIDGE_PROTOCOL: 3.3", "BRIDGE.md", failures)
    require(docs["CLOSED_LOOP_PROTOCOL.md"], "CLOSED LOOP", "CLOSED_LOOP_PROTOCOL.md", failures)
    require(docs["CLOSED_LOOP_PROTOCOL.md"], "PRIMARY_PUBLISHED", "CLOSED_LOOP_PROTOCOL.md", failures)

    plugin = json.loads(PLUGIN.read_text(encoding="utf-8"))
    if plugin.get("version") != "1.0.5":
        failures.append("plugin.json: expected version 1.0.5")

    skill_names = {path.parent.name for path in SKILLS_DIR.rglob("SKILL.md")}
    for required in (
        "task-router",
        "scope-isolation-check",
        "model-selector",
        "parallel-scope-planner",
        "closed-loop-controller",
        "failure-routing-and-corrective-loop",
    ):
        if required not in skill_names:
            failures.append(f"missing skill: {required}")
    if "runtime-safety-gate" in skill_names:
        failures.append("forbidden skill present: runtime-safety-gate")

    task_router = (SKILLS_DIR / "task-router" / "SKILL.md").read_text(encoding="utf-8")
    require(task_router, "scope-isolation-check", "task-router/SKILL.md", failures)
    require(task_router, "model-selector", "task-router/SKILL.md", failures)
    require(task_router, "parallel-scope-planner", "task-router/SKILL.md", failures)
    require(task_router, "closed-loop-controller", "task-router/SKILL.md", failures)
    require(task_router, "failure-routing-and-corrective-loop", "task-router/SKILL.md", failures)
    require(task_router, "task-router before implementation", "task-router/SKILL.md", failures)

    closed_loop = (SKILLS_DIR / "closed-loop-controller" / "SKILL.md").read_text(encoding="utf-8")
    require(closed_loop, "bridgeSlot", "closed-loop-controller/SKILL.md", failures)
    require(closed_loop, "expectedOutbox", "closed-loop-controller/SKILL.md", failures)
    require(closed_loop, "fresh remote state", "closed-loop-controller/SKILL.md", failures)
    require(closed_loop, "missing keys, extra keys, wrong types, empty values, and placeholder values", "closed-loop-controller/SKILL.md", failures)
    require(closed_loop, "report schema must reject missing keys, extra keys, wrong types, empty values, and placeholder values", "closed-loop-controller/SKILL.md", failures)

    workflow = WORKFLOW.read_text(encoding="utf-8")
    require(workflow, "tools/closed_loop_contract.py", ".github/workflows/orchestration-policy.yml", failures)
    require(workflow, "tools/test_closed_loop_contract.py", ".github/workflows/orchestration-policy.yml", failures)
    require(workflow, "tools/validate-orchestration-policy.py", ".github/workflows/orchestration-policy.yml", failures)
    require(workflow, "python3 -m py_compile tools/closed_loop_contract.py tools/test_closed_loop_contract.py tools/validate-orchestration-policy.py", ".github/workflows/orchestration-policy.yml", failures)
    require(workflow, "python3 -m unittest tools.test_closed_loop_contract", ".github/workflows/orchestration-policy.yml", failures)

    print(
        json.dumps(
            {
                "ok": not failures,
                "failures": failures,
                "contract": contract_result,
                "positiveControls": list(CONTRACT.POSITIVE_CONTROLS),
                "negativeControls": list(CONTRACT.NEGATIVE_CONTROLS),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
