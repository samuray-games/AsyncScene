#!/usr/bin/env python3
"""Validate the Asynchronia 1.0.11 Markdown-authority preflight contract."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PLUGIN_VERSION = "1.0.11"


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
    selector = read("plugins/asynchronia/skills/model-selector/SKILL.md")
    required = (
        "model-selector-authority.json", "repository-markdown", "complete candidate matrix",
        "structured task description", "evaluates every snapshot model-effort pair exactly once",
        "INVENTORY_OK", "INVENTORY_CHANGED", "same-thread `CONTINUE`", "durable state artifact",
        "taskDescriptionHash", "complete matrix hash", "lowest-cost pair",
        "does not require or attempt `codex app-server`",
    )
    for needle in required:
        require(needle in selector, f"active policy missing {needle}", failures)
    forbidden_active = (
        "must start the local `codex app-server`", "call `model/list`", "current UI picker evidence controls",
        "request a current screenshot", "BLOCKED_MODEL_INVENTORY_UNAVAILABLE",
        "USER_UI_INVENTORY_REQUIRED", "APP_SERVER_CATALOG_EVIDENCE_RECORDED",
    )
    for needle in forbidden_active:
        require(needle not in selector, f"contradictory legacy policy remains: {needle}", failures)


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
    task = {
        "taskId": "VALIDATOR-CLI-TASK", "taskType": "PLUGIN_POLICY", "objective": "validate durable state",
        "readScope": ["plugins/asynchronia"], "writeScope": ["tools"], "affectedSystems": ["selector", "state"],
        "runtimeSensitivity": "low", "architectureImpact": "high", "securityImpact": "medium",
        "economyImpact": "low", "releaseImpact": "high", "validationComplexity": "high",
        "expectedImplementationSize": "large", "ambiguityNovelty": "medium", "concurrencyBranchRisk": "medium",
    }
    with tempfile.TemporaryDirectory() as state_dir:
        task_file = Path(state_dir) / "task.json"
        task_file.write_text(json.dumps(task), encoding="utf-8")
        base = [sys.executable, str(ROOT / "tools/run-asynchronia-model-preflight.py")]
        common = ["--thread-id", "validator-thread", "--state-dir", state_dir, "--task-file", str(task_file), "--baseline", "validator-baseline", "--branch", "validator-branch"]
        start = subprocess.run(base + ["start", *common], capture_output=True, text=True, check=False)
        ok = subprocess.run(base + ["inventory-ok", *common], capture_output=True, text=True, check=False)
        cont = subprocess.run(base + ["continue", *common, "--token", "CONTINUE"], capture_output=True, text=True, check=False)
        inspect = subprocess.run(base + ["inspect", "--thread-id", "validator-thread", "--state-dir", state_dir], capture_output=True, text=True, check=False)
    require(start.returncode == 0, "CLI start failed", failures)
    require(ok.returncode == 0 and "WAITING_FOR_MODEL_SELECTION" in ok.stdout, "CLI INVENTORY_OK failed", failures)
    require(cont.returncode == 0 and "IMPLEMENTATION_ALLOWED" in cont.stdout, "CLI CONTINUE failed", failures)
    require(inspect.returncode == 0 and "IMPLEMENTATION_ALLOWED" in inspect.stdout, "CLI state did not persist", failures)


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
