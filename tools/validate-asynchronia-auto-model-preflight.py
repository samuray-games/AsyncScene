#!/usr/bin/env python3
"""Validate the Asynchronia 1.0.14 bridge-derived model-preflight contract."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_VERSION = "1.0.14"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def main() -> int:
    failures: list[str] = []

    manifest = json.loads(read("plugins/asynchronia/.codex-plugin/plugin.json"))
    marketplace = json.loads(read(".agents/plugins/marketplace.json"))
    entry = next((item for item in marketplace.get("plugins", []) if item.get("name") == "asynchronia"), None)
    if manifest.get("version") != EXPECTED_VERSION:
        failures.append("plugin manifest version mismatch")
    if not entry or entry.get("version") != EXPECTED_VERSION:
        failures.append("marketplace version mismatch")

    runtime = read("plugins/asynchronia/model_selector_runtime.py")
    selector = read("plugins/asynchronia/model_selector.py")
    bridge = read("plugins/asynchronia/bridge_task_descriptor.py")
    cli = read("tools/run-asynchronia-model-preflight.py")
    skill = read("plugins/asynchronia/skills/model-selector/SKILL.md")
    override = read("AGENTS.override.md")

    required_selector = (
        'PLUGIN_VERSION = "1.0.14"',
        "asynchronia/model-selector-state",
        '"WAITING_FOR_INVENTORY_CONFIRMATION"',
        '"WAITING_FOR_MODEL_SELECTION"',
        '"IMPLEMENTATION_ALLOWED"',
        "taskDescriptionHash",
        "completeMatrixHash",
    )
    for needle in required_selector:
        if needle not in selector and needle not in runtime:
            failures.append(f"selector missing contract: {needle}")
    if '.asynchronia" / "model-selector-state' in runtime:
        failures.append("legacy home-directory state path remains")

    required_bridge = (
        'PROFILE_VERSION = "BRIDGE_TASK_PROFILE_1"',
        '"NO_MAIN_DELTA_TRANSPORT_CANARY"',
        "selected branch must be",
        "origin/main head",
        "classificationReasons",
        "unregistered bridge task profile",
    )
    for needle in required_bridge:
        if needle not in bridge:
            failures.append(f"bridge adapter missing contract: {needle}")

    for command in ("bridge-start", "bridge-inventory-ok", "bridge-continue"):
        if command not in cli:
            failures.append(f"CLI missing {command}")
    if "reserved bridge tasks must use bridge-start" not in cli:
        failures.append("generic CLI does not reject fabricated bridge task input")

    required_policy = (
        "bridge-start",
        "WAITING_FOR_INVENTORY_CONFIRMATION",
        "INVENTORY_OK",
        "WAITING_FOR_MODEL_SELECTION",
        "bridge-continue",
        "never search historical task folders",
        "never hand-author JSON risk fields",
        "Git-private",
    )
    for needle in required_policy:
        if needle not in skill and needle not in override:
            failures.append(f"active policy missing: {needle}")
    if "pause with `WAITING_FOR_MODEL_SELECTION` and one standalone fenced `CONTINUE` block" in override:
        failures.append("superseded direct WAITING_FOR_MODEL_SELECTION override remains")

    selector_task = {
        "taskId": "TASK-VALIDATE-AUTO-MODEL-PREFLIGHT",
        "taskType": "PLUGIN_POLICY",
        "objective": "validate selector user-visible output contract",
        "readScope": ["plugins/asynchronia"],
        "writeScope": ["plugins/asynchronia/model_selector.py"],
        "affectedSystems": ["selector", "state"],
        "runtimeSensitivity": "low",
        "architectureImpact": "high",
        "securityImpact": "medium",
        "economyImpact": "low",
        "releaseImpact": "medium",
        "validationComplexity": "high",
        "expectedImplementationSize": "medium",
        "ambiguityNovelty": "low",
        "concurrencyBranchRisk": "medium",
    }
    with tempfile.TemporaryDirectory() as directory:
        task_path = Path(directory) / "task.json"
        state_dir = Path(directory) / "state"
        task_path.write_text(json.dumps(selector_task), encoding="utf-8")
        command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
        common = ["--thread-id", "validate-auto-model", "--state-dir", str(state_dir), "--task-file", str(task_path), "--baseline", "validate-baseline"]
        start = subprocess.run(command + ["start", *common], cwd=ROOT, capture_output=True, text=True, check=False)
        ok = subprocess.run(command + ["inventory-ok", *common], cwd=ROOT, capture_output=True, text=True, check=False)
        if start.returncode != 0:
            failures.append("selector start stdout regression failed: " + (start.stderr.strip() or start.stdout.strip()))
        else:
            for needle in (
                "status: WAITING_FOR_INVENTORY_CONFIRMATION",
                "recommended pair:",
                "exact next response: INVENTORY_OK",
            ):
                if needle not in start.stdout:
                    failures.append(f"selector start stdout missing: {needle}")
        if ok.returncode != 0:
            failures.append("selector inventory-ok stdout regression failed: " + (ok.stderr.strip() or ok.stdout.strip()))
        else:
            for needle in (
                "status: WAITING_FOR_MODEL_SELECTION",
                "recommended pair:",
                "instruction: select the recommended pair in the Codex UI",
                "mutation authorization: not yet authorized",
                "exact next response: CONTINUE",
            ):
                if needle not in ok.stdout:
                    failures.append(f"selector inventory-ok stdout missing: {needle}")

    tests = subprocess.run(
        [
            sys.executable,
            "-m",
            "unittest",
            "tools.test_model_selector_runtime",
            "tools.test_bridge_model_preflight",
            "tools.test_model_selector_full_regression",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if tests.returncode != 0:
        failures.append("unit/E2E/full-regression suite failed: " + (tests.stderr.strip() or tests.stdout.strip()))

    if failures:
        print(json.dumps({"status": "FAIL_AUTO_MODEL_PREFLIGHT", "pluginVersion": EXPECTED_VERSION, "failureCount": len(failures), "failures": failures}, indent=2))
        return 1
    print(
        json.dumps(
            {
                "status": "PASS_AUTO_MODEL_PREFLIGHT",
                "pluginVersion": EXPECTED_VERSION,
                "bridgeAuthorityAdapter": "PASS",
                "deterministicBridgeClassification": "PASS",
                "gitPrivateDurableState": "PASS",
                "inventoryConfirmationGate": "PASS",
                "sameThreadContinueGate": "PASS",
                "mailboxMovementInvalidation": "PASS",
                "fabricatedBridgeTaskRejection": "PASS",
                "fullCanonicalSelectorRegression": "PASS",
                "unitAndBridgeE2E": "PASS",
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
