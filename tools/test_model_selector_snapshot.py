from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from plugins.asynchronia.model_selector import (  # noqa: E402
    AUTHORITY_MANIFEST_PATH,
    MAINTENANCE_TASK_ID,
    AuthorizationError,
    SnapshotError,
    TaskDescriptionError,
    _build_snapshot_from_inventory,
    build_candidate_matrix,
    canonical_hash,
    evaluate_task,
    load_snapshot,
    load_task,
    record_inventory_changed,
    start_preflight,
    validate_snapshot,
)
from plugins.asynchronia.model_selector_inventory import parse_inventory_markdown  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_PATH = ROOT / ".ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/UI-VISIBLE-MODEL-INVENTORY.md"


def task(**overrides: object) -> dict[str, object]:
    result: dict[str, object] = {
        "taskId": "TASK-TEST-1",
        "taskType": "PLUGIN_POLICY",
        "objective": "correct selector",
        "readScope": ["plugins/asynchronia"],
        "writeScope": ["plugins/asynchronia/model_selector.py"],
        "affectedSystems": ["policy", "state"],
        "runtimeSensitivity": "low",
        "architectureImpact": "high",
        "securityImpact": "medium",
        "economyImpact": "low",
        "releaseImpact": "high",
        "validationComplexity": "high",
        "expectedImplementationSize": "large",
        "ambiguityNovelty": "medium",
        "concurrencyBranchRisk": "medium",
    }
    result.update(overrides)
    return result


class ModelSelectorAuthorityTests(unittest.TestCase):
    def test_authority_manifest_and_direct_markdown_parse(self) -> None:
        manifest = json.loads(AUTHORITY_MANIFEST_PATH.read_text(encoding="utf-8"))
        parsed = parse_inventory_markdown(Path(ARTIFACT_PATH))
        self.assertEqual(manifest["inventoryArtifactPath"], str(Path(".ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/UI-VISIBLE-MODEL-INVENTORY.md")))
        self.assertEqual(manifest["lastAcceptedBlobSha"], "3d77fba4924a200bef9cb7ec7ef76f3aeb45cbdb")
        self.assertEqual(parsed.model_count, 6)
        self.assertEqual(parsed.pair_count, 29)

    def test_generated_snapshot_matches_authority_and_persists_provenance(self) -> None:
        snapshot = _build_snapshot_from_inventory()
        parsed = parse_inventory_markdown(Path(ARTIFACT_PATH))
        self.assertEqual(snapshot["completeModelCount"], parsed.model_count)
        self.assertEqual(snapshot["completeModelEffortPairCount"], parsed.pair_count)
        self.assertEqual(snapshot["sourceArtifact"]["path"], str(Path(".ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/UI-VISIBLE-MODEL-INVENTORY.md")))
        self.assertEqual(snapshot["sourceArtifact"]["blobSha"], "3d77fba4924a200bef9cb7ec7ef76f3aeb45cbdb")
        self.assertEqual(snapshot["status"], "PENDING_CONFIRMATION")
        self.assertEqual(snapshot["canonicalContentHash"], canonical_hash(snapshot))

    def test_exact_labels_survive_generation_and_ids_remain_separate(self) -> None:
        snapshot = _build_snapshot_from_inventory()
        parsed = parse_inventory_markdown(Path(ARTIFACT_PATH))
        self.assertEqual([model["modelLabel"] for model in snapshot["models"]], [model["modelLabel"] for model in parsed.models])
        self.assertEqual([[effort["effortLabel"] for effort in model["supportedEfforts"]] for model in snapshot["models"]], [[effort["effortLabel"] for effort in model["supportedEfforts"]] for model in parsed.models])
        self.assertEqual([model["modelIdentifier"] for model in snapshot["models"]], [model["modelIdentifier"] for model in parsed.models])
        self.assertEqual([[effort["effortIdentifier"] for effort in model["supportedEfforts"]] for model in snapshot["models"]], [[effort["effortIdentifier"] for effort in model["supportedEfforts"]] for model in parsed.models])

    def test_current_snapshot_loads_and_normal_output_uses_picker_labels(self) -> None:
        snapshot = load_snapshot()
        report = evaluate_task(snapshot, task())
        self.assertEqual(snapshot["snapshotRevision"], "20260715.1")
        self.assertEqual(snapshot["status"], "PENDING_CONFIRMATION")
        self.assertTrue(all(item.modelLabel and item.effortLabel for item in report.evaluations))
        self.assertEqual(len(build_candidate_matrix(snapshot)), snapshot["completeModelEffortPairCount"])

    def test_inventory_changed_resolves_authority_and_differs_from_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            task_file = Path(directory) / "task.json"
            task_file.write_text(json.dumps(task()), encoding="utf-8")
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            common = ["--thread-id", "thread-a", "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", "baseline-a", "--branch", "branch-a"]
            self.assertEqual(subprocess.run(command + ["start", *common], capture_output=True, text=True, check=False).returncode, 0)
            result = subprocess.run(command + ["inventory-changed", "--thread-id", "thread-a", "--state-dir", str(state_dir)], capture_output=True, text=True, check=False)
            self.assertEqual(result.returncode, 0)
            self.assertIn(MAINTENANCE_TASK_ID, result.stdout)
            self.assertIn("authority artifact:", result.stdout)
            self.assertIn("model diff:", result.stdout)

    def test_missing_or_malformed_authority_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            from plugins.asynchronia import model_selector as selector  # noqa: WPS433

            original = selector.AUTHORITY_MANIFEST_PATH
            try:
                selector.AUTHORITY_MANIFEST_PATH = Path(directory) / "missing.json"
                with self.assertRaises(SnapshotError):
                    selector._manifest()
                bad_manifest = Path(directory) / "authority.json"
                bad_manifest.write_text(json.dumps({"inventoryArtifactPath": "missing"}), encoding="utf-8")
                selector.AUTHORITY_MANIFEST_PATH = bad_manifest
                with self.assertRaises(SnapshotError):
                    selector._manifest()
            finally:
                selector.AUTHORITY_MANIFEST_PATH = original

    def test_pending_until_inventory_ok_and_stale_auth_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            task_file = Path(directory) / "task.json"
            task_file.write_text(json.dumps(task()), encoding="utf-8")
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            common = ["--thread-id", "thread-a", "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", "baseline-a", "--branch", "branch-a"]
            start = subprocess.run(command + ["start", *common], capture_output=True, text=True, check=False)
            self.assertEqual(start.returncode, 0)
            inspect = subprocess.run(command + ["inspect", "--thread-id", "thread-a", "--state-dir", str(state_dir)], capture_output=True, text=True, check=False)
            self.assertIn("WAITING_FOR_INVENTORY_CONFIRMATION", inspect.stdout)
            ok = subprocess.run(command + ["inventory-ok", *common], capture_output=True, text=True, check=False)
            self.assertEqual(ok.returncode, 0)
            self.assertIn("WAITING_FOR_MODEL_SELECTION", ok.stdout)
            cont = subprocess.run(command + ["continue", *common, "--token", "CONTINUE"], capture_output=True, text=True, check=False)
            self.assertEqual(cont.returncode, 0)

    def test_every_candidate_evaluated_once_and_no_unconditional_fallback(self) -> None:
        snapshot = load_snapshot()
        report = evaluate_task(snapshot, task())
        self.assertEqual(len(report.evaluations), snapshot["completeModelEffortPairCount"])
        self.assertEqual(len({(item.modelIdentifier, item.effortIdentifier) for item in report.evaluations}), len(report.evaluations))
        selector_text = (ROOT / "plugins/asynchronia/model_selector.py").read_text(encoding="utf-8")
        self.assertNotIn('"RELIABLE"', selector_text)

    def test_validation_and_load_fail_closed_for_bad_snapshot(self) -> None:
        snapshot = load_snapshot()
        broken = copy.deepcopy(snapshot)
        broken["status"] = "BROKEN"
        with self.assertRaises(SnapshotError):
            validate_snapshot(broken)
        broken = copy.deepcopy(snapshot)
        broken["sourceArtifact"]["path"] = ""
        with self.assertRaises(SnapshotError):
            validate_snapshot(broken)

    def test_task_input_load_and_stateful_invalidation(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            task_file = Path(directory) / "task.json"
            task_file.write_text(json.dumps(task()), encoding="utf-8")
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            common = ["--thread-id", "thread-b", "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", "baseline-b", "--branch", "branch-b"]
            self.assertEqual(subprocess.run(command + ["start", *common], capture_output=True, text=True, check=False).returncode, 0)
            self.assertEqual(subprocess.run(command + ["invalidate", "--thread-id", "thread-b", "--state-dir", str(state_dir)], capture_output=True, text=True, check=False).returncode, 0)
            self.assertNotEqual(subprocess.run(command + ["continue", *common, "--token", "CONTINUE"], capture_output=True, text=True, check=False).returncode, 0)


if __name__ == "__main__":
    unittest.main()
