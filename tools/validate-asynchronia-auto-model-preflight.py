#!/usr/bin/env python3
"""Validate the Asynchronia 1.0.13 Markdown-authority preflight contract."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PLUGIN_VERSION = "1.0.13"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def validate_manifests(failures: list[str]) -> None:
    manifest = json.loads(read("plugins/asynchronia/.codex-plugin/plugin.json"))
    marketplace = json.loads(read(".agents/plugins/marketplace.json"))
    require(manifest.get("name") == "asynchronia", "manifest name mismatch", failures)
    require(manifest.get("version") == EXPECTED_PLUGIN_VERSION, "manifest version mismatch", failures)
    entry = next((item for item in marketplace.get("plugins", []) if item.get("name") == "asynchronia"), None)
    require(entry is not None and entry.get("version") == EXPECTED_PLUGIN_VERSION, "marketplace version mismatch", failures)


def validate_policy(failures: list[str]) -> None:
    manifest = json.loads(read("plugins/asynchronia/.codex-plugin/plugin.json"))
    selector = read("plugins/asynchronia/skills/model-selector/SKILL.md")
    required = (
        "model-selector-authority.json", "repository-markdown", "complete candidate matrix",
        "structured task description", "evaluates every snapshot model-effort pair exactly once",
        "READ_ONLY_ALLOWED", "MUTATION_PREFLIGHT_REQUIRED", "INVENTORY_OK", "INVENTORY_CHANGED", "same-thread `CONTINUE`", "durable state artifact",
        "taskDescriptionHash", "complete matrix hash", "lowest-cost pair",
        "does not require or attempt `codex app-server`",
        "no matrix evaluation", "no recommendation", "plugin root", "manifest path", "manifest version", "manifest sha256",
        "IMPLEMENTATION_ALLOWED", "mutation guard",
    )
    for needle in required:
        require(needle in selector, f"active policy missing {needle}", failures)
    forbidden_active = (
        "must start the local `codex app-server`", "call `model/list`", "current UI picker evidence controls",
        "request a current screenshot", "BLOCKED_MODEL_INVENTORY_UNAVAILABLE",
        "USER_UI_INVENTORY_REQUIRED", "APP_SERVER_CATALOG_EVIDENCE_RECORDED",
        "PREFLIGHT_REQUIRED -> WAITING_FOR_INVENTORY_CONFIRMATION -> INVENTORY_CONFIRMED -> WAITING_FOR_MODEL_SELECTION -> CONTINUE_RECEIVED -> SCOPE_REVALIDATED -> IMPLEMENTATION_ALLOWED",
    )
    for needle in forbidden_active:
        require(needle not in selector, f"contradictory legacy policy remains: {needle}", failures)
    manifest_required = (
        "Use the executable selector CLI at tools/run-asynchronia-model-preflight.py for the production preflight; do not manually simulate selector analysis in prose.",
        "Treat plugins/asynchronia/model-selector-authority.json and the bound snapshot as the only active selector authority.",
        "Do not use PROJECT_MEMORY.md, .ai-memory files, or superseded .ai-work/tasks/** selector artifacts as active selector contract or current inventory authority.",
        "The mutation path starts at MUTATION_PREFLIGHT_REQUIRED, then enters WAITING_FOR_INVENTORY_CONFIRMATION after the executable selector CLI completes the complete matrix preflight.",
        "Read-only canary tasks with empty or NONE_READ_ONLY write scope must short-circuit to READ_ONLY_ALLOWED with no matrix evaluation, recommendation, INVENTORY_OK, or CONTINUE.",
        "Pause with WAITING_FOR_MODEL_SELECTION and wait for exact same-thread CONTINUE before any edits on the mutation path only.",
        "The first selector status must be WAITING_FOR_INVENTORY_CONFIRMATION and the only exact next response at that stage is INVENTORY_OK or INVENTORY_CHANGED.",
        "Only after exact same-thread INVENTORY_OK may the selector enter WAITING_FOR_MODEL_SELECTION and wait for exact same-thread CONTINUE before any edits.",
        "When reporting installed plugin path or version, use runtime filesystem readback evidence rather than repository memory or historical notes.",
        "Report the exact selector CLI command and its exit status when preflight evidence is requested.",
    )
    prompt = manifest.get("interface", {}).get("defaultPrompt", [])
    require(isinstance(prompt, list), "manifest defaultPrompt must be a list", failures)
    for needle in manifest_required:
        require(needle in prompt, f"manifest defaultPrompt missing {needle}", failures)
    prompt_forbidden = (
        "Pause with WAITING_FOR_MODEL_SELECTION and wait for exact same-thread CONTINUE before any edits.",
    )
    for needle in prompt_forbidden:
        require(needle not in prompt, f"manifest defaultPrompt retains superseded instruction: {needle}", failures)


def validate_selector(failures: list[str]) -> None:
    sys.path.insert(0, str(ROOT))
    try:
        from plugins.asynchronia.model_selector import (  # pylint: disable=import-outside-toplevel
            build_candidate_matrix,
            evaluate_task,
            load_snapshot,
        )
        snapshot = load_snapshot()
        candidates = build_candidate_matrix(snapshot)
        task = {
            "taskId": "VALIDATOR-TASK", "taskType": "PLUGIN_POLICY", "objective": "validate",
            "readScope": ["plugins/asynchronia"], "writeScope": ["plugins/asynchronia/model_selector.py"],
            "affectedSystems": ["policy"], "runtimeSensitivity": "low", "architectureImpact": "medium",
            "securityImpact": "low", "economyImpact": "low", "releaseImpact": "medium",
            "validationComplexity": "medium", "expectedImplementationSize": "medium",
            "ambiguityNovelty": "medium", "concurrencyBranchRisk": "low",
        }
        report = evaluate_task(snapshot, task)
    except Exception as exc:  # pragma: no cover
        failures.append(f"selector execution failed: {exc}")
        return
    require(snapshot["status"] == "PENDING_CONFIRMATION", "snapshot status mismatch", failures)
    require(len(candidates) == snapshot["completeModelEffortPairCount"], "complete matrix count mismatch", failures)
    require(len(report.evaluations) == len(candidates), "not every pair evaluated", failures)
    require(any(item.verdict != "SUITABLE" for item in report.evaluations), "all candidates are unconditionally suitable", failures)
    require("29" not in read("plugins/asynchronia/model_selector.py"), "runtime selector contains static pair count", failures)


def validate_cli(failures: list[str]) -> None:
    sys.path.insert(0, str(ROOT))
    from plugins.asynchronia.model_selector import current_branch  # pylint: disable=import-outside-toplevel
    checked_out_branch = current_branch()
    mutation_task = {
        "taskId": "VALIDATOR-CLI-TASK", "taskType": "PLUGIN_POLICY", "objective": "validate durable state",
        "readScope": ["plugins/asynchronia"], "writeScope": ["tools"], "affectedSystems": ["selector", "state"],
        "runtimeSensitivity": "low", "architectureImpact": "high", "securityImpact": "medium",
        "economyImpact": "low", "releaseImpact": "high", "validationComplexity": "high",
        "expectedImplementationSize": "large", "ambiguityNovelty": "medium", "concurrencyBranchRisk": "medium",
    }
    read_only_task = {
        "taskId": "VALIDATOR-CLI-READONLY-TASK", "taskType": "PLUGIN_POLICY", "objective": "validate read-only durable state",
        "readScope": ["plugins/asynchronia"], "writeScope": [], "affectedSystems": ["selector", "state"],
        "runtimeSensitivity": "low", "architectureImpact": "low", "securityImpact": "low",
        "economyImpact": "low", "releaseImpact": "low", "validationComplexity": "low",
        "expectedImplementationSize": "small", "ambiguityNovelty": "low", "concurrencyBranchRisk": "low",
    }
    with tempfile.TemporaryDirectory() as state_dir:
        mutation_task_file = Path(state_dir) / "task.json"
        mutation_task_file.write_text(json.dumps(mutation_task), encoding="utf-8")
        read_only_task_file = Path(state_dir) / "read-only-task.json"
        read_only_task_file.write_text(json.dumps(read_only_task), encoding="utf-8")
        base = [sys.executable, str(ROOT / "tools/run-asynchronia-model-preflight.py")]
        mutation_common = ["--thread-id", "validator-thread", "--state-dir", state_dir, "--task-file", str(mutation_task_file), "--baseline", "validator-baseline", "--branch", checked_out_branch]
        read_only_common = ["--thread-id", "validator-readonly-thread", "--state-dir", state_dir, "--task-file", str(read_only_task_file), "--baseline", "validator-baseline", "--branch", checked_out_branch]
        start = subprocess.run(base + ["start", *mutation_common], capture_output=True, text=True, check=False)
        ok = subprocess.run(base + ["inventory-ok", *mutation_common], capture_output=True, text=True, check=False)
        cont = subprocess.run(base + ["continue", *mutation_common, "--token", "CONTINUE"], capture_output=True, text=True, check=False)
        inspect = subprocess.run(base + ["inspect", "--thread-id", "validator-thread", "--state-dir", state_dir], capture_output=True, text=True, check=False)
        read_only = subprocess.run(base + ["start", *read_only_common], capture_output=True, text=True, check=False)
        read_only_continue = subprocess.run(base + ["continue", *read_only_common, "--token", "CONTINUE"], capture_output=True, text=True, check=False)
    require(start.returncode == 0, "CLI start failed", failures)
    require("status: WAITING_FOR_INVENTORY_CONFIRMATION" in start.stdout, "CLI start status mismatch", failures)
    require("authorization path: MUTATION_PREFLIGHT_REQUIRED" in start.stdout, "CLI start authorization path mismatch", failures)
    require(ok.returncode == 0 and "WAITING_FOR_MODEL_SELECTION" in ok.stdout, "CLI INVENTORY_OK failed", failures)
    require(cont.returncode == 0 and "IMPLEMENTATION_ALLOWED" in cont.stdout, "CLI CONTINUE failed", failures)
    require(inspect.returncode == 0 and "IMPLEMENTATION_ALLOWED" in inspect.stdout, "CLI state did not persist", failures)
    require(read_only.returncode == 0 and "READ_ONLY_ALLOWED" in read_only.stdout, "CLI read-only start failed", failures)
    require("recommended pair:" not in read_only.stdout and "INVENTORY_OK" not in read_only.stdout and "CONTINUE" not in read_only.stdout, "CLI read-only output leaked mutation contract", failures)
    require(read_only_continue.returncode != 0, "CLI read-only mutation unexpectedly succeeded", failures)


def main() -> int:
    failures: list[str] = []
    validate_manifests(failures)
    validate_policy(failures)
    validate_selector(failures)
    validate_cli(failures)
    if failures:
        print(json.dumps({"status": "FAIL_AUTO_MODEL_PREFLIGHT", "failureCount": len(failures), "failures": failures}, indent=2))
        return 1
    print(json.dumps({"status": "PASS_AUTO_MODEL_PREFLIGHT", "pluginVersion": EXPECTED_PLUGIN_VERSION, "confirmedSnapshot": "PASS", "taskSpecificEvaluation": "PASS", "durableSameThreadCli": "PASS", "noLiveInventoryDependency": "PASS"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
