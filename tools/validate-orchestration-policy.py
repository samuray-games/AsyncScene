#!/usr/bin/env python3
"""Validate the Asynchronia orchestration policy surface."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = {
    "agents": ROOT / "AGENTS.md",
    "override": ROOT / "AGENTS.override.md",
    "root_sync": ROOT / "PROCESS_ROOT_SYNC.md",
    "orchestration": ROOT / "ORCHESTRATION.md",
    "bridge": ROOT / "BRIDGE.md",
    "pull": ROOT / "GIT_PULL.md",
    "push": ROOT / "GIT_PUSH.md",
    "stage6_plan": ROOT / "STAGE6_PARALLEL_EXECUTION_PLAN.md",
    "plugin": ROOT / "plugins/asynchronia/.codex-plugin/plugin.json",
}
WORKFLOW = ROOT / ".github/workflows/orchestration-policy.yml"
SKILLS_DIR = ROOT / "plugins/asynchronia/skills"

REQUIRED_ROOT_POLICY_TEXT = (
    "ROOT_CAUSE_SYNC: REQUIRED",
    "NO_OP_COMPLETION: FORBIDDEN",
)
FORBIDDEN_MARKERS = (
    "RUNTIME_SAFETY_GATE_REQUIRED",
    "runtime-safety-gate",
    "approval-required",
    "approval-invalidated",
)
FORBIDDEN_PHRASES = (
    "runtime approval",
    "runtime slot",
    "runtime authorization",
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


def exact(value: str, expected: str, label: str, failures: list[str]) -> None:
    if value != expected:
        failures.append(f"{label}: expected exact text {expected!r}")


def skill_paths() -> list[Path]:
    return sorted(path for path in SKILLS_DIR.rglob("SKILL.md") if path.is_file())


def main() -> int:
    failures: list[str] = []
    skill_files = skill_paths()
    required_files = [*ROOT_FILES.values(), WORKFLOW, *skill_files]
    missing = [str(path.relative_to(ROOT)) for path in required_files if not path.is_file()]
    if missing:
        print(json.dumps({"ok": False, "failures": [f"missing: {missing}"]}, ensure_ascii=False, indent=2))
        return 1

    docs = {key: path.read_text(encoding="utf-8") for key, path in ROOT_FILES.items()}
    workflow = WORKFLOW.read_text(encoding="utf-8")
    scanned_paths = [str(path.relative_to(ROOT)) for path in required_files]

    require(docs["agents"], "BRIDGE_PROTOCOL: 3.2", "AGENTS.md", failures)
    require(docs["override"], "OVERRIDE_VERSION: ORCHESTRATION_3_2", "AGENTS.override.md", failures)
    require(docs["root_sync"], "PROCESS_ROOT_SYNC_VERSION: 2", "PROCESS_ROOT_SYNC.md", failures)
    require(docs["orchestration"], "ORCHESTRATION_VERSION: 3.2", "ORCHESTRATION.md", failures)
    require(docs["bridge"], "BRIDGE_PROTOCOL: 3.2", "BRIDGE.md", failures)
    require(docs["pull"], "PROTOCOL_VERSION: GIT_PULL_3_2", "GIT_PULL.md", failures)
    require(docs["push"], "PROTOCOL_VERSION: GIT_PUSH_3_2", "GIT_PUSH.md", failures)
    require(docs["stage6_plan"], "BRIDGE_PROTOCOL: 3.2", "STAGE6_PARALLEL_EXECUTION_PLAN.md", failures)

    for name in ("agents", "override", "root_sync", "orchestration", "bridge", "pull", "push", "stage6_plan"):
        text = docs[name]
        label = ROOT_FILES[name].name
        for marker in REQUIRED_ROOT_POLICY_TEXT:
            require(text, marker, label, failures)
        for marker in FORBIDDEN_MARKERS:
            forbid(text, marker, label, failures)
        lowered = text.lower()
        for phrase in FORBIDDEN_PHRASES:
            if phrase in lowered:
                failures.append(f"{label}: forbidden semantic phrase {phrase!r}")

    for phase in PHASES:
        require(docs["orchestration"], f"`{phase}`", "ORCHESTRATION.md", failures)

    require(docs["agents"], "scope-isolation-check", "AGENTS.md", failures)
    require(docs["agents"], "BLOCKED_SCOPE_COLLISION", "AGENTS.md", failures)
    require(docs["orchestration"], "scope-isolation-check", "ORCHESTRATION.md", failures)
    require(docs["orchestration"], "BLOCKED_SCOPE_COLLISION", "ORCHESTRATION.md", failures)
    require(docs["bridge"], "scope-isolation-check", "BRIDGE.md", failures)
    require(docs["bridge"], "BLOCKED_SCOPE_COLLISION", "BRIDGE.md", failures)

    require(docs["push"], "PASS_PUSHED", "GIT_PUSH.md", failures)
    require(docs["push"], "BLOCKED_MAIN_BASELINE_MOVED", "GIT_PUSH.md", failures)
    require(docs["override"], "BLOCKED_PUSH_AUTH", "AGENTS.override.md", failures)

    plugin = json.loads(docs["plugin"])
    exact(str(plugin.get("name")), "asynchronia", "plugin.json name", failures)
    exact(str(plugin.get("version")), "1.0.4", "plugin.json version", failures)
    exact(
        str(plugin.get("description")),
        "Project-specific scope checks and evidence workflows for Codex work in the Asynchronia repository.",
        "plugin.json description",
        failures,
    )
    interface = plugin.get("interface", {})
    exact(str(interface.get("shortDescription")), "Apply Asynchronia repository scope checks.", "plugin.json shortDescription", failures)
    exact(str(interface.get("category")), "Developer Tools", "plugin.json category", failures)
    exact(str(plugin.get("skills")), "./skills/", "plugin.json skills path", failures)

    required_skill_names = {
        "acceptance-evidence-gate",
        "acceptance-pipeline-controller",
        "canon-audit",
        "deployment-verifier",
        "economy-invariant-audit",
        "evidence-bundle-and-artifact-identity",
        "failure-routing-and-corrective-loop",
        "mirror-audit",
        "model-selector",
        "parallel-scope-planner",
        "pipeline-state-and-resume-contract",
        "scope-isolation-check",
        "smoke-orchestrator",
        "task-router",
    }
    discovered_skill_names = {path.parent.name for path in skill_files}
    if discovered_skill_names != required_skill_names:
        failures.append(
            "plugins/asynchronia/skills: expected exact skill set "
            f"{sorted(required_skill_names)} got {sorted(discovered_skill_names)}"
        )

    for skill_path in skill_files:
        text = skill_path.read_text(encoding="utf-8")
        label = str(skill_path.relative_to(ROOT))
        for marker in FORBIDDEN_MARKERS:
            forbid(text, marker, label, failures)
        lowered = text.lower()
        for phrase in FORBIDDEN_PHRASES:
            if phrase in lowered:
                failures.append(f"{label}: forbidden semantic phrase {phrase!r}")
        if label.endswith(("acceptance-pipeline-controller/SKILL.md", "pipeline-state-and-resume-contract/SKILL.md", "task-router/SKILL.md", "model-selector/SKILL.md")):
            require(text, "model-selector", label, failures)

    for rel in (
        "AGENTS.md",
        "AGENTS.override.md",
        "PROCESS_ROOT_SYNC.md",
        "ORCHESTRATION.md",
        "BRIDGE.md",
        "GIT_PULL.md",
        "GIT_PUSH.md",
        "STAGE6_PARALLEL_EXECUTION_PLAN.md",
        "plugins/asynchronia/.codex-plugin/plugin.json",
    ):
        count = workflow.count(rel)
        if count != 2:
            failures.append(
                f".github/workflows/orchestration-policy.yml: expected push and pull_request coverage for {rel!r}, found {count}"
            )

    require(workflow, "plugins/asynchronia/skills/**/*.md", ".github/workflows/orchestration-policy.yml", failures)

    print(json.dumps({"ok": not failures, "failures": failures, "scannedPaths": scanned_paths}, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
