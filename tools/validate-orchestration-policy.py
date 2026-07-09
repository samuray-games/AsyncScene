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
    "stage6_plan": ROOT / "STAGE6_PARALLEL_EXECUTION_PLAN.md",
    "validator": ROOT / "tools/validate-orchestration-policy.py",
    "plugin": ROOT / "plugins/asynchronia/.codex-plugin/plugin.json",
    "scope_skill": ROOT / "plugins/asynchronia/skills/scope-isolation-check/SKILL.md",
    "router_skill": ROOT / "plugins/asynchronia/skills/task-router/SKILL.md",
    "planner_skill": ROOT / "plugins/asynchronia/skills/parallel-scope-planner/SKILL.md",
    "canon_skill": ROOT / "plugins/asynchronia/skills/canon-audit/SKILL.md",
    "mirror_skill": ROOT / "plugins/asynchronia/skills/mirror-audit/SKILL.md",
    "economy_skill": ROOT / "plugins/asynchronia/skills/economy-invariant-audit/SKILL.md",
    "pipeline_skill": ROOT / "plugins/asynchronia/skills/acceptance-pipeline-controller/SKILL.md",
    "failure_skill": ROOT / "plugins/asynchronia/skills/failure-routing-and-corrective-loop/SKILL.md",
    "smoke_skill": ROOT / "plugins/asynchronia/skills/smoke-orchestrator/SKILL.md",
    "deploy_skill": ROOT / "plugins/asynchronia/skills/deployment-verifier/SKILL.md",
    "accept_skill": ROOT / "plugins/asynchronia/skills/acceptance-evidence-gate/SKILL.md",
    "state_skill": ROOT / "plugins/asynchronia/skills/pipeline-state-and-resume-contract/SKILL.md",
    "evidence_skill": ROOT / "plugins/asynchronia/skills/evidence-bundle-and-artifact-identity/SKILL.md",
}
WORKFLOW = ROOT / ".github/workflows/orchestration-policy.yml"
WORKFLOW_POLICY_PATHS = (
    "AGENTS.md",
    "AGENTS.override.md",
    "PROCESS_ROOT_SYNC.md",
    "ORCHESTRATION.md",
    "BRIDGE.md",
    "GIT_PULL.md",
    "GIT_PUSH.md",
    "STAGE6_PARALLEL_EXECUTION_PLAN.md",
    "tools/validate-orchestration-policy.py",
    ".github/workflows/orchestration-policy.yml",
    "plugins/asynchronia/.codex-plugin/plugin.json",
    "plugins/asynchronia/skills/scope-isolation-check/SKILL.md",
    "plugins/asynchronia/skills/task-router/SKILL.md",
    "plugins/asynchronia/skills/parallel-scope-planner/SKILL.md",
    "plugins/asynchronia/skills/canon-audit/SKILL.md",
    "plugins/asynchronia/skills/mirror-audit/SKILL.md",
    "plugins/asynchronia/skills/economy-invariant-audit/SKILL.md",
    "plugins/asynchronia/skills/acceptance-pipeline-controller/SKILL.md",
    "plugins/asynchronia/skills/failure-routing-and-corrective-loop/SKILL.md",
    "plugins/asynchronia/skills/smoke-orchestrator/SKILL.md",
    "plugins/asynchronia/skills/deployment-verifier/SKILL.md",
    "plugins/asynchronia/skills/acceptance-evidence-gate/SKILL.md",
    "plugins/asynchronia/skills/pipeline-state-and-resume-contract/SKILL.md",
    "plugins/asynchronia/skills/evidence-bundle-and-artifact-identity/SKILL.md",
)
FORBIDDEN_MARKERS = (
    "RUNTIME_SAFETY_GATE_REQUIRED",
    "RUNTIME_GATE_REQUIRED",
    "runtime-safety-gate",
    "Runtime Safety Gate",
    "runtime_approval_required",
    "wait_for_runtime_approval",
    "mandatory runtime approval",
    "scope-isolation approval",
    "approval-only",
    "isolated runtime slots",
    "runtime gate requirement",
    "required runtime approval",
    "approval-required",
    "approval-invalidated",
    "MODEL_PREFLIGHT_ONLY",
)
FORBIDDEN_PHRASES = (
    "runtime approval",
    "runtime slot",
    "runtime authorization",
)
REQUIRED_SCOPE_TERMS = ("SAFE_TO_PROCEED", "BLOCKED_SCOPE_COLLISION", "exact paths", "owners", "dependencies")
ROOT_POLICY_KEYS = ("agents", "override", "root_sync", "orchestration", "bridge", "pull", "push")
PLUGIN_KEYS = (
    "plugin",
    "scope_skill",
    "router_skill",
    "planner_skill",
    "canon_skill",
    "mirror_skill",
    "economy_skill",
    "pipeline_skill",
    "failure_skill",
    "smoke_skill",
    "deploy_skill",
    "accept_skill",
    "state_skill",
    "evidence_skill",
)
CORRECTION_SCOPE = (
    "AGENTS.md",
    "STAGE6_PARALLEL_EXECUTION_PLAN.md",
    ".github/workflows/orchestration-policy.yml",
    "tools/validate-orchestration-policy.py",
    "plugins/asynchronia/.codex-plugin/plugin.json",
    "plugins/asynchronia/skills/acceptance-evidence-gate/SKILL.md",
    "plugins/asynchronia/skills/acceptance-pipeline-controller/SKILL.md",
    "plugins/asynchronia/skills/canon-audit/SKILL.md",
    "plugins/asynchronia/skills/deployment-verifier/SKILL.md",
    "plugins/asynchronia/skills/economy-invariant-audit/SKILL.md",
    "plugins/asynchronia/skills/failure-routing-and-corrective-loop/SKILL.md",
    "plugins/asynchronia/skills/mirror-audit/SKILL.md",
    "plugins/asynchronia/skills/parallel-scope-planner/SKILL.md",
    "plugins/asynchronia/skills/pipeline-state-and-resume-contract/SKILL.md",
    "plugins/asynchronia/skills/smoke-orchestrator/SKILL.md",
    "plugins/asynchronia/skills/task-router/SKILL.md",
)
PHASES = (
    "CLOSED",
    "SCOPE_FREEZE",
    "READY_FOR_CODEX",
    "EXECUTE_AND_PUBLISH",
    "OUTBOX_PUBLISHED_AWAITING_CHATGPT",
    "VERIFIED_NO_DELTA_AWAITING_CHATGPT",
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


def require_exact(text: str, expected: str, label: str, failures: list[str]) -> None:
    if text != expected:
        failures.append(f"{label}: expected exact text {expected!r}")


def main() -> int:
    failures: list[str] = []
    required_files = (*FILES.values(), WORKFLOW)
    missing = [str(path.relative_to(ROOT)) for path in required_files if not path.is_file()]
    if missing:
        print(json.dumps({"ok": False, "failures": [f"missing: {missing}"]}, ensure_ascii=False, indent=2))
        return 1

    docs = {name: path.read_text(encoding="utf-8") for name, path in FILES.items()}
    workflow = WORKFLOW.read_text(encoding="utf-8")
    scanned_paths = [str(path.relative_to(ROOT)) for path in required_files]

    require(docs["agents"], "BRIDGE_PROTOCOL: 3.2", "AGENTS.md", failures)
    require(docs["override"], "OVERRIDE_VERSION: ORCHESTRATION_3_2", "AGENTS.override.md", failures)
    require(docs["orchestration"], "ORCHESTRATION_VERSION: 3.2", "ORCHESTRATION.md", failures)
    require(docs["bridge"], "BRIDGE_PROTOCOL: 3.2", "BRIDGE.md", failures)
    require(docs["pull"], "PROTOCOL_VERSION: GIT_PULL_3_2", "GIT_PULL.md", failures)
    require(docs["push"], "PROTOCOL_VERSION: GIT_PUSH_3_2", "GIT_PUSH.md", failures)
    require(docs["root_sync"], "PROCESS_ROOT_SYNC_VERSION: 2", "PROCESS_ROOT_SYNC.md", failures)
    require(docs["stage6_plan"], "BRIDGE_PROTOCOL: 3.2", "STAGE6_PARALLEL_EXECUTION_PLAN.md", failures)

    for text_name in (*ROOT_POLICY_KEYS, "stage6_plan"):
        text = docs[text_name]
        require(text, "ROOT_CAUSE_SYNC: REQUIRED", FILES[text_name].name, failures)
        require(text, "NO_OP_COMPLETION: FORBIDDEN", FILES[text_name].name, failures)
        forbid(text, "BRIDGE_PROTOCOL: 3.0", FILES[text_name].name, failures)
        forbid(text, "ORCHESTRATION_VERSION: 3.0", FILES[text_name].name, failures)
        for marker in FORBIDDEN_MARKERS:
            forbid(text, marker, FILES[text_name].name, failures)
        lowered = text.lower()
        for phrase in FORBIDDEN_PHRASES:
            if phrase in lowered:
                failures.append(f"{FILES[text_name].name}: forbidden semantic phrase {phrase!r}")

    for text_name in ("agents", "override", "orchestration", "bridge"):
        require(docs[text_name], "FAIL_NO_EXECUTION_EVIDENCE", FILES[text_name].name, failures)
        require(docs[text_name], "THREAD_ROTATION_REQUIRED", FILES[text_name].name, failures)
        if "execution epoch" not in docs[text_name].lower():
            failures.append(f"{FILES[text_name].name}: missing execution epoch rule")

    for text_name in ("override", "root_sync", "orchestration", "bridge", "push"):
        require(docs[text_name], "VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE", FILES[text_name].name, failures)

    for text_name in ("override", "orchestration", "bridge", "push"):
        require(docs[text_name], "ALLOW_VERIFIED_NO_DELTA: true", FILES[text_name].name, failures)
        require(docs[text_name], "PASS_VERIFIED_NO_DELTA", FILES[text_name].name, failures)
        require(docs[text_name], "primaryChanged:false", FILES[text_name].name, failures)

    for text_name in ("override", "root_sync", "orchestration", "bridge", "push"):
        require(docs[text_name], "Empty primary commits are forbidden.", FILES[text_name].name, failures)

    for phase in PHASES:
        require(docs["orchestration"], f"`{phase}`", "ORCHESTRATION.md", failures)

    require(docs["bridge"], "Manual SHA transcription is forbidden.", "BRIDGE.md", failures)
    require(docs["push"], "BLOCKED_MAIN_BASELINE_MOVED", "GIT_PUSH.md", failures)
    require(docs["override"], "BLOCKED_PUSH_AUTH", "AGENTS.override.md", failures)

    for policy_path in WORKFLOW_POLICY_PATHS:
        occurrence_count = workflow.count(f"- {policy_path}")
        if occurrence_count != 2:
            failures.append(
                f"{WORKFLOW.relative_to(ROOT)}: expected push and pull_request coverage for "
                f"{policy_path!r}, found {occurrence_count}"
            )

    for required in ("scope-isolation-check", "BLOCKED_SCOPE_COLLISION"):
        require(docs["agents"], required, "AGENTS.md", failures)
        require(docs["orchestration"], required, "ORCHESTRATION.md", failures)
        require(docs["bridge"], required, "BRIDGE.md", failures)
    require(docs["agents"], "SAFE_TO_PROCEED", "AGENTS.md", failures)
    for term in REQUIRED_SCOPE_TERMS:
        require(docs["agents"], term, "AGENTS.md", failures)
    require(docs["stage6_plan"], "collision-free runtime lane executes immediately", "STAGE6_PARALLEL_EXECUTION_PLAN.md", failures)

    for text_name in ("override", "orchestration", "bridge", "push"):
        require(docs[text_name], "PASS_PUSHED", FILES[text_name].name, failures)
        require(docs[text_name], "PASS_VERIFIED_NO_DELTA", FILES[text_name].name, failures)

    plugin = json.loads(docs["plugin"])
    require_exact(plugin.get("version"), "1.0.3", "plugin.json version", failures)
    require_exact(plugin.get("name"), "asynchronia", "plugin.json name", failures)
    interface = plugin.get("interface", {})
    require_exact(interface.get("shortDescription"), "Apply Asynchronia repository scope checks.", "plugin.json shortDescription", failures)
    require_exact(plugin.get("description"), "Project-specific scope checks and evidence workflows for Codex work in the Asynchronia repository.", "plugin.json description", failures)
    require_exact(interface.get("category"), "Developer Tools", "plugin.json category", failures)
    require_exact(plugin.get("skills"), "./skills/", "plugin.json skills path", failures)

    for skill_name, path_key in (
        ("scope-isolation-check", "scope_skill"),
        ("task-router", "router_skill"),
        ("parallel-scope-planner", "planner_skill"),
        ("canon-audit", "canon_skill"),
        ("mirror-audit", "mirror_skill"),
        ("economy-invariant-audit", "economy_skill"),
        ("acceptance-pipeline-controller", "pipeline_skill"),
        ("failure-routing-and-corrective-loop", "failure_skill"),
        ("smoke-orchestrator", "smoke_skill"),
        ("deployment-verifier", "deploy_skill"),
        ("acceptance-evidence-gate", "accept_skill"),
        ("pipeline-state-and-resume-contract", "state_skill"),
        ("evidence-bundle-and-artifact-identity", "evidence_skill"),
    ):
        require(docs[path_key], f"name: {skill_name}", FILES[path_key].name, failures)

    for text_name in PLUGIN_KEYS:
        text = docs[text_name]
        for marker in FORBIDDEN_MARKERS:
            forbid(text, marker, FILES[text_name].name, failures)
        lowered = text.lower()
        for phrase in FORBIDDEN_PHRASES:
            if phrase in lowered:
                failures.append(f"{FILES[text_name].name}: forbidden semantic phrase {phrase!r}")

    expected_scanned = set(CORRECTION_SCOPE) | {
        "AGENTS.override.md",
        "PROCESS_ROOT_SYNC.md",
        "ORCHESTRATION.md",
        "BRIDGE.md",
        "GIT_PULL.md",
        "GIT_PUSH.md",
        "plugins/asynchronia/skills/scope-isolation-check/SKILL.md",
        "plugins/asynchronia/skills/evidence-bundle-and-artifact-identity/SKILL.md",
    }
    actual_scanned = set(scanned_paths)
    if actual_scanned != expected_scanned:
        failures.append(
            "scanned path mismatch: expected "
            f"{sorted(expected_scanned)} got {sorted(actual_scanned)}"
        )
    for correction_path in CORRECTION_SCOPE:
        if correction_path not in scanned_paths:
            failures.append(f"missing correction-scope path in scanned list: {correction_path}")
        if correction_path not in WORKFLOW_POLICY_PATHS and correction_path != "tools/validate-orchestration-policy.py":
            failures.append(f"missing correction-scope path in workflow coverage: {correction_path}")

    print(json.dumps({"scannedPaths": scanned_paths}, ensure_ascii=False))

    result = {
        "ok": not failures,
        "orchestrationVersion": "3.2",
        "rootCauseSync": "REQUIRED",
        "noOpCompletion": "FORBIDDEN",
        "verifiedNoDelta": "ALLOWED_WITH_EVIDENCE",
        "checkedFiles": scanned_paths,
        "canonicalPhaseCount": len(PHASES),
        "workflowPolicyPathCount": len(WORKFLOW_POLICY_PATHS),
        "failures": failures,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
