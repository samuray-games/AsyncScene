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


def read_only_task(**overrides: object) -> dict[str, object]:
    result = task(writeScope=[])
    result.update(overrides)
    return result


def snapshot_copy() -> dict[str, object]:
    return copy.deepcopy(load_snapshot())


class ModelSelectorAuthorityTests(unittest.TestCase):
    def test_historical_selector_artifacts_remain_stale_fixtures_only(self) -> None:
        legacy_plan = (
            ROOT
            / ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712/02-work-plan.md"
        ).read_text(encoding="utf-8")
        project_memory = (ROOT / "PROJECT_MEMORY.md").read_text(encoding="utf-8")
        self.assertIn("WAITING_FOR_MODEL_SELECTION", legacy_plan)
        self.assertIn("PROJECT_MEMORY.md", legacy_plan)
        self.assertIn("INSTALLED_PLUGIN_VERSION: 1.0.8", project_memory)
        with tempfile.TemporaryDirectory() as directory:
            result = start_preflight(
                task(
                    taskId="TASK-HISTORICAL-FIXTURE",
                    objective="prove stale selector artifacts cannot override executable authority",
                ),
                "thread-historical",
                "baseline-historical",
                branch="branch-historical",
                state_dir=Path(directory) / "state",
            )
        self.assertEqual(result.status, "MUTATION_PREFLIGHT_REQUIRED")
        self.assertIn("exact next response: INVENTORY_OK or INVENTORY_CHANGED", result.output)
        self.assertNotIn("WAITING_FOR_MODEL_SELECTION", result.output)

    def test_read_only_canary_short_circuits_without_mutation_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            task_file = Path(directory) / "task.json"
            task_file.write_text(json.dumps(read_only_task()), encoding="utf-8")
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            common = ["--thread-id", "thread-read", "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", "baseline-read", "--branch", "branch-read"]
            start = subprocess.run(command + ["start", *common], capture_output=True, text=True, check=False)
            self.assertEqual(start.returncode, 0)
            self.assertIn("READ_ONLY_ALLOWED", start.stdout)
            self.assertIn("plugin version:", start.stdout)
            self.assertIn("authority validation result:", start.stdout)
            self.assertIn("read-only scope:", start.stdout)
            self.assertNotIn("recommended pair:", start.stdout)
            self.assertNotIn("INVENTORY_OK", start.stdout)
            self.assertNotIn("CONTINUE", start.stdout)
            self.assertNotIn("model count:", start.stdout)
            self.assertNotIn("model-effort pair count:", start.stdout)
            inventory_ok = subprocess.run(command + ["inventory-ok", *common], capture_output=True, text=True, check=False)
            self.assertNotEqual(inventory_ok.returncode, 0)

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

    def test_mutation_task_enters_mutation_preflight_required(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            task_file = Path(directory) / "task.json"
            task_file.write_text(json.dumps(task()), encoding="utf-8")
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            common = ["--thread-id", "thread-a", "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", "baseline-a", "--branch", "branch-a"]
            start = subprocess.run(command + ["start", *common], capture_output=True, text=True, check=False)
            self.assertEqual(start.returncode, 0)
            self.assertIn("status: MUTATION_PREFLIGHT_REQUIRED", start.stdout)
            self.assertIn("evaluated pair count: 29/29", start.stdout)
            self.assertNotIn("READ_ONLY_ALLOWED", start.stdout)

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

    def test_authority_binding_rejects_tampered_snapshot_and_artifact_changes(self) -> None:
        snapshot = snapshot_copy()
        with tempfile.TemporaryDirectory() as directory:
            snapshot_path = Path(directory) / "tampered.json"
            tampered = copy.deepcopy(snapshot)
            tampered["models"] = list(reversed(tampered["models"]))
            tampered["canonicalContentHash"] = canonical_hash(tampered)
            snapshot_path.write_text(json.dumps(tampered, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            with self.assertRaises(SnapshotError):
                load_snapshot(snapshot_path)

    def test_authority_binding_rejects_changed_model_and_effort_structure(self) -> None:
        snapshot = snapshot_copy()
        with tempfile.TemporaryDirectory() as directory:
            model_order = copy.deepcopy(snapshot)
            model_order["models"] = list(reversed(model_order["models"]))
            model_order["canonicalContentHash"] = canonical_hash(model_order)
            model_path = Path(directory) / "model-order.json"
            model_path.write_text(json.dumps(model_order, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            with self.assertRaises(SnapshotError):
                load_snapshot(model_path)

            effort_change = copy.deepcopy(snapshot)
            effort_change["models"][0]["supportedEfforts"] = effort_change["models"][0]["supportedEfforts"][:-1]
            effort_change["completeModelEffortPairCount"] = sum(len(model["supportedEfforts"]) for model in effort_change["models"])
            effort_change["canonicalContentHash"] = canonical_hash(effort_change)
            effort_path = Path(directory) / "effort-change.json"
            effort_path.write_text(json.dumps(effort_change, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            with self.assertRaises(SnapshotError):
                load_snapshot(effort_path)

    def test_authority_binding_rejects_mismatched_source_path(self) -> None:
        snapshot = snapshot_copy()
        with tempfile.TemporaryDirectory() as directory:
            temp_dir = Path(directory)
            artifact_copy = temp_dir / "inventory.md"
            artifact_copy.write_text(Path(ARTIFACT_PATH).read_text(encoding="utf-8"), encoding="utf-8")
            manifest = {
                "inventoryArtifactPath": str(artifact_copy),
                "inventoryParser": "markdown-bullet-inventory-v1",
                "provenanceType": "repository-markdown",
                "lastAcceptedBlobSha": snapshot["sourceArtifact"]["blobSha"],
                "currentSnapshotRevision": snapshot["snapshotRevision"],
            }
            changed_snapshot = copy.deepcopy(snapshot)
            changed_snapshot["sourceArtifact"]["path"] = str(Path(ARTIFACT_PATH))
            changed_snapshot["canonicalContentHash"] = canonical_hash(changed_snapshot)
            snapshot_path = temp_dir / "path-mismatch.json"
            snapshot_path.write_text(json.dumps(changed_snapshot, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            manifest_path = temp_dir / "authority.json"
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            from plugins.asynchronia import model_selector as selector  # noqa: WPS433

            original_manifest = selector.AUTHORITY_MANIFEST_PATH
            try:
                selector.AUTHORITY_MANIFEST_PATH = manifest_path
                with self.assertRaises(SnapshotError):
                    load_snapshot(snapshot_path)
            finally:
                selector.AUTHORITY_MANIFEST_PATH = original_manifest

    def test_authority_binding_rejects_mismatched_source_blob_sha(self) -> None:
        snapshot = snapshot_copy()
        with tempfile.TemporaryDirectory() as directory:
            temp_dir = Path(directory)
            artifact_copy = temp_dir / "inventory.md"
            artifact_copy.write_text(Path(ARTIFACT_PATH).read_text(encoding="utf-8"), encoding="utf-8")
            manifest = {
                "inventoryArtifactPath": str(artifact_copy),
                "inventoryParser": "markdown-bullet-inventory-v1",
                "provenanceType": "repository-markdown",
                "lastAcceptedBlobSha": snapshot["sourceArtifact"]["blobSha"],
                "currentSnapshotRevision": snapshot["snapshotRevision"],
            }
            changed_snapshot = copy.deepcopy(snapshot)
            changed_snapshot["sourceArtifact"]["path"] = str(artifact_copy)
            changed_snapshot["sourceArtifact"]["blobSha"] = "0" * 40
            changed_snapshot["canonicalContentHash"] = canonical_hash(changed_snapshot)
            snapshot_path = temp_dir / "blob-mismatch.json"
            snapshot_path.write_text(json.dumps(changed_snapshot, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            manifest_path = temp_dir / "authority.json"
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            from plugins.asynchronia import model_selector as selector  # noqa: WPS433

            original_manifest = selector.AUTHORITY_MANIFEST_PATH
            try:
                selector.AUTHORITY_MANIFEST_PATH = manifest_path
                with self.assertRaises(SnapshotError):
                    load_snapshot(snapshot_path)
            finally:
                selector.AUTHORITY_MANIFEST_PATH = original_manifest

    def test_authority_binding_rejects_manifest_revision_mismatch(self) -> None:
        snapshot = snapshot_copy()
        with tempfile.TemporaryDirectory() as directory:
            temp_dir = Path(directory)
            artifact_copy = temp_dir / "inventory.md"
            artifact_copy.write_text(Path(ARTIFACT_PATH).read_text(encoding="utf-8"), encoding="utf-8")
            manifest = {
                "inventoryArtifactPath": str(artifact_copy),
                "inventoryParser": "markdown-bullet-inventory-v1",
                "provenanceType": "repository-markdown",
                "lastAcceptedBlobSha": snapshot["sourceArtifact"]["blobSha"],
                "currentSnapshotRevision": "20260715.2",
            }
            manifest_path = temp_dir / "authority.json"
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            from plugins.asynchronia import model_selector as selector  # noqa: WPS433

            original_manifest = selector.AUTHORITY_MANIFEST_PATH
            try:
                selector.AUTHORITY_MANIFEST_PATH = manifest_path
                with self.assertRaises(SnapshotError):
                    load_snapshot()
            finally:
                selector.AUTHORITY_MANIFEST_PATH = original_manifest

    def test_start_preflight_fails_closed_when_authority_binding_fails(self) -> None:
        snapshot = snapshot_copy()
        with tempfile.TemporaryDirectory() as directory:
            temp_dir = Path(directory)
            manifest = {
                "inventoryArtifactPath": str(temp_dir / "missing.md"),
                "inventoryParser": "markdown-bullet-inventory-v1",
                "provenanceType": "repository-markdown",
                "lastAcceptedBlobSha": snapshot["sourceArtifact"]["blobSha"],
                "currentSnapshotRevision": snapshot["snapshotRevision"],
            }
            manifest_path = temp_dir / "authority.json"
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            from plugins.asynchronia import model_selector as selector  # noqa: WPS433

            original_manifest = selector.AUTHORITY_MANIFEST_PATH
            try:
                selector.AUTHORITY_MANIFEST_PATH = manifest_path
                with self.assertRaises(SnapshotError):
                    start_preflight(task(), "thread-bind", "baseline-bind", branch="branch-bind", state_dir=temp_dir / "state")
            finally:
                selector.AUTHORITY_MANIFEST_PATH = original_manifest

    def test_authority_binding_rejects_modified_markdown_bytes(self) -> None:
        snapshot = snapshot_copy()
        with tempfile.TemporaryDirectory() as directory:
            temp_dir = Path(directory)
            artifact_copy = temp_dir / "inventory.md"
            artifact_copy.write_text(Path(ARTIFACT_PATH).read_text(encoding="utf-8") + "\n", encoding="utf-8")
            manifest = {
                "inventoryArtifactPath": str(artifact_copy),
                "inventoryParser": "markdown-bullet-inventory-v1",
                "provenanceType": "repository-markdown",
                "lastAcceptedBlobSha": snapshot["sourceArtifact"]["blobSha"],
                "currentSnapshotRevision": snapshot["snapshotRevision"],
            }
            changed_snapshot = copy.deepcopy(snapshot)
            changed_snapshot["sourceArtifact"]["path"] = str(artifact_copy)
            changed_snapshot["sourceArtifact"]["blobSha"] = snapshot["sourceArtifact"]["blobSha"]
            changed_snapshot["canonicalContentHash"] = canonical_hash(changed_snapshot)
            snapshot_path = temp_dir / "artifact-bytes.json"
            snapshot_path.write_text(json.dumps(changed_snapshot, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            manifest_path = temp_dir / "authority.json"
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            from plugins.asynchronia import model_selector as selector  # noqa: WPS433

            original_manifest = selector.AUTHORITY_MANIFEST_PATH
            try:
                selector.AUTHORITY_MANIFEST_PATH = manifest_path
                with self.assertRaises(SnapshotError):
                    load_snapshot(snapshot_path)
            finally:
                selector.AUTHORITY_MANIFEST_PATH = original_manifest

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
            self.assertIn("MUTATION_PREFLIGHT_REQUIRED", inspect.stdout)
            ok = subprocess.run(command + ["inventory-ok", *common], capture_output=True, text=True, check=False)
            self.assertEqual(ok.returncode, 0)
            self.assertIn("WAITING_FOR_MODEL_SELECTION", ok.stdout)
            cont = subprocess.run(command + ["continue", *common, "--token", "CONTINUE"], capture_output=True, text=True, check=False)
            self.assertEqual(cont.returncode, 0)

    def test_cheapest_rejected_pair_and_rendered_output_match_lowest_frontier_rejection(self) -> None:
        snapshot = load_snapshot()
        selected_task = task(
            objective="branch synchronization and proof",
            runtimeSensitivity="critical",
            architectureImpact="critical",
            securityImpact="critical",
            economyImpact="critical",
            releaseImpact="critical",
            validationComplexity="critical",
            expectedImplementationSize="very_large",
            ambiguityNovelty="high",
            concurrencyBranchRisk="critical",
        )
        report = evaluate_task(snapshot, selected_task)
        rejected = [evaluation for evaluation in report.evaluations if evaluation.verdict != "SUITABLE"]
        expected = min(rejected, key=lambda item: report.evaluations.index(item))
        self.assertEqual((report.cheapestRejected.modelIdentifier, report.cheapestRejected.effortIdentifier), (expected.modelIdentifier, expected.effortIdentifier))
        with tempfile.TemporaryDirectory() as directory:
            result = start_preflight(selected_task, "thread-render", "baseline-render", branch="render-branch", state_dir=Path(directory))
            self.assertIn(f"cheapest rejected pair: {expected.modelLabel} / {expected.effortLabel}", result.output)

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

    def test_stale_artifacts_do_not_override_read_only_or_mutation_paths(self) -> None:
        legacy_plan = (ROOT / ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712/02-work-plan.md").read_text(encoding="utf-8")
        project_memory = (ROOT / "PROJECT_MEMORY.md").read_text(encoding="utf-8")
        self.assertIn("WAITING_FOR_MODEL_SELECTION", legacy_plan)
        self.assertIn("1.0.8", project_memory)
        with tempfile.TemporaryDirectory() as directory:
            read_state_dir = Path(directory) / "read-state"
            write_state_dir = Path(directory) / "write-state"
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            read_task_file = Path(directory) / "read-task.json"
            write_task_file = Path(directory) / "write-task.json"
            read_task_file.write_text(json.dumps(read_only_task()), encoding="utf-8")
            write_task_file.write_text(json.dumps(task()), encoding="utf-8")
            read_common = ["--thread-id", "thread-read-override", "--state-dir", str(read_state_dir), "--task-file", str(read_task_file), "--baseline", "baseline-read", "--branch", "branch-read"]
            write_common = ["--thread-id", "thread-write-override", "--state-dir", str(write_state_dir), "--task-file", str(write_task_file), "--baseline", "baseline-write", "--branch", "branch-write"]
            read_result = subprocess.run(command + ["start", *read_common], capture_output=True, text=True, check=False)
            write_result = subprocess.run(command + ["start", *write_common], capture_output=True, text=True, check=False)
            self.assertEqual(read_result.returncode, 0)
            self.assertEqual(write_result.returncode, 0)
            self.assertIn("READ_ONLY_ALLOWED", read_result.stdout)
            self.assertIn("MUTATION_PREFLIGHT_REQUIRED", write_result.stdout)
            self.assertNotIn("recommended pair:", read_result.stdout)
            self.assertIn("recommended pair:", write_result.stdout)


if __name__ == "__main__":
    unittest.main()
