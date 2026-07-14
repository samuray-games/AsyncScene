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
    MAINTENANCE_TASK_ID,
    AuthorizationError,
    SnapshotError,
    TaskDescriptionError,
    build_candidate_matrix,
    canonical_hash,
    evaluate_task,
    load_snapshot,
    start_preflight,
    validate_snapshot,
)


def task(**overrides: object) -> dict[str, object]:
    result: dict[str, object] = {
        "taskId": "TASK-TEST-1", "taskType": "PLUGIN_POLICY", "objective": "correct selector",
        "readScope": ["plugins/asynchronia"], "writeScope": ["plugins/asynchronia/model_selector.py"],
        "affectedSystems": ["policy", "state"], "runtimeSensitivity": "low", "architectureImpact": "high",
        "securityImpact": "medium", "economyImpact": "low", "releaseImpact": "high",
        "validationComplexity": "high", "expectedImplementationSize": "large",
        "ambiguityNovelty": "medium", "concurrencyBranchRisk": "medium",
    }
    result.update(overrides)
    return result


class ModelSelectorSnapshotTests(unittest.TestCase):
    def setUp(self) -> None:
        self.snapshot = load_snapshot()

    def test_schema_hash_counts_matrix_and_order(self) -> None:
        self.assertEqual(self.snapshot["schemaVersion"], "1.0.10")
        self.assertEqual(self.snapshot["canonicalContentHash"], canonical_hash(self.snapshot))
        self.assertEqual(self.snapshot["completeModelCount"], len(self.snapshot["models"]))
        self.assertEqual(self.snapshot["completeModelEffortPairCount"], len(build_candidate_matrix(self.snapshot)))
        self.assertEqual([candidate.model for candidate in build_candidate_matrix(self.snapshot)[:4]], ["gpt-5.4-mini"] * 4)
        self.assertEqual(build_candidate_matrix(self.snapshot)[4].effort, "low")

    def test_invalid_snapshot_shapes_fail_closed(self) -> None:
        cases = []
        duplicate_model = copy.deepcopy(self.snapshot); duplicate_model["models"].append(copy.deepcopy(duplicate_model["models"][0])); cases.append(duplicate_model)
        duplicate_effort = copy.deepcopy(self.snapshot); duplicate_effort["models"][0]["supportedEfforts"].append("low"); cases.append(duplicate_effort)
        empty_effort = copy.deepcopy(self.snapshot); empty_effort["models"][0]["supportedEfforts"] = []; cases.append(empty_effort)
        malformed = copy.deepcopy(self.snapshot); malformed["models"] = "not-a-list"; cases.append(malformed)
        stale = copy.deepcopy(self.snapshot); stale["status"] = "INFERRED"; cases.append(stale)
        for case in cases:
            with self.subTest(case=case):
                with self.assertRaises(SnapshotError):
                    validate_snapshot(case)
        bad_hash = copy.deepcopy(self.snapshot); bad_hash["canonicalContentHash"] = "sha256:" + "0" * 64
        with self.assertRaises(SnapshotError):
            validate_snapshot(bad_hash)

    def test_task_dependent_evaluation_and_lowest_reliable_recommendation(self) -> None:
        low_task = task(
            runtimeSensitivity="low", architectureImpact="low", securityImpact="low", releaseImpact="low",
            validationComplexity="low", expectedImplementationSize="small", ambiguityNovelty="low", concurrencyBranchRisk="low",
            affectedSystems=["policy"],
        )
        high_task = task(
            runtimeSensitivity="critical", architectureImpact="critical", securityImpact="high", releaseImpact="critical",
            validationComplexity="critical", expectedImplementationSize="very_large", ambiguityNovelty="high", concurrencyBranchRisk="critical",
            affectedSystems=["policy", "state", "release"],
        )
        low_report = evaluate_task(self.snapshot, low_task)
        high_report = evaluate_task(self.snapshot, high_task)
        self.assertNotEqual((low_report.recommendation.model, low_report.recommendation.effort), (high_report.recommendation.model, high_report.recommendation.effort))
        self.assertEqual(len(low_report.evaluations), 29)
        self.assertEqual(len(high_report.evaluations), 29)
        self.assertTrue(any(item.verdict != "RELIABLE" for item in high_report.evaluations))
        self.assertEqual(sum(1 for item in high_report.evaluations if item.verdict == "RELIABLE"), len(high_report.evaluations[high_report.evaluations.index(high_report.recommendation):]))
        self.assertEqual(low_report.recommendation, next(item for item in low_report.evaluations if item.verdict == "RELIABLE"))

    def test_insufficient_task_input_fails_closed(self) -> None:
        with self.assertRaises(TaskDescriptionError):
            evaluate_task(self.snapshot, {"taskId": "incomplete"})

    def test_durable_cli_state_and_identity_invalidation(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            task_file = Path(directory) / "task.json"
            task_file.write_text(json.dumps(task()), encoding="utf-8")
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            common = ["--thread-id", "thread-a", "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", "baseline-a", "--branch", "branch-a"]
            start = subprocess.run(command + ["start", *common], capture_output=True, text=True, check=False)
            self.assertEqual(start.returncode, 0)
            ok = subprocess.run(command + ["inventory-ok", *common], capture_output=True, text=True, check=False)
            self.assertEqual(ok.returncode, 0)
            cross_thread = subprocess.run(command + ["continue", "--thread-id", "thread-b", "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", "baseline-a", "--branch", "branch-a", "--token", "CONTINUE"], capture_output=True, text=True, check=False)
            self.assertNotEqual(cross_thread.returncode, 0)
            valid = subprocess.run(command + ["continue", *common, "--token", "CONTINUE"], capture_output=True, text=True, check=False)
            self.assertEqual(valid.returncode, 0)
            inspect = subprocess.run(command + ["inspect", "--thread-id", "thread-a", "--state-dir", str(state_dir)], capture_output=True, text=True, check=False)
            self.assertIn("IMPLEMENTATION_ALLOWED", inspect.stdout)
            task_file.write_text(json.dumps(task(objective="changed task")), encoding="utf-8")
            changed_task = subprocess.run(command + ["continue", *common, "--token", "CONTINUE"], capture_output=True, text=True, check=False)
            self.assertNotEqual(changed_task.returncode, 0)

    def test_inventory_changed_and_no_repo_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            before = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True).stdout
            start_preflight(task(), "thread-changed", "baseline", branch="branch", state_dir=state_dir)
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py", "inventory-changed", "--thread-id", "thread-changed", "--state-dir", str(state_dir)]
            result = subprocess.run(command, capture_output=True, text=True, check=False)
            self.assertEqual(result.returncode, 0)
            self.assertIn(MAINTENANCE_TASK_ID, result.stdout)
            after = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True).stdout
            self.assertEqual(before, after)

    def test_snapshot_branch_baseline_and_stale_state_invalidate_authorization(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            task_file = Path(directory) / "task.json"
            task_file.write_text(json.dumps(task()), encoding="utf-8")
            command = [sys.executable, "tools/run-asynchronia-model-preflight.py"]
            def run(name: str, thread: str, baseline: str, branch: str, snapshot: Path | None = None) -> subprocess.CompletedProcess[str]:
                args = [name, "--thread-id", thread, "--state-dir", str(state_dir), "--task-file", str(task_file), "--baseline", baseline, "--branch", branch]
                if snapshot:
                    args.extend(["--snapshot", str(snapshot)])
                return subprocess.run(command + args, capture_output=True, text=True, check=False)

            self.assertEqual(run("start", "thread-snapshot", "base", "branch").returncode, 0)
            changed_snapshot = Path(directory) / "changed-snapshot.json"
            snapshot_copy = copy.deepcopy(self.snapshot)
            snapshot_copy["snapshotRevision"] = "20260714.2"
            snapshot_copy["canonicalContentHash"] = canonical_hash(snapshot_copy)
            changed_snapshot.write_text(json.dumps(snapshot_copy), encoding="utf-8")
            self.assertEqual(run("inventory-ok", "thread-snapshot", "base", "branch", changed_snapshot).returncode, 1)

            self.assertEqual(run("start", "thread-branch", "base", "branch").returncode, 0)
            self.assertEqual(run("inventory-ok", "thread-branch", "base", "other-branch").returncode, 1)
            self.assertEqual(run("start", "thread-baseline", "base", "branch").returncode, 0)
            self.assertEqual(run("inventory-ok", "thread-baseline", "other-base", "branch").returncode, 1)

            self.assertEqual(run("start", "thread-stale", "base", "branch").returncode, 0)
            state_path = state_dir / (hashlib.sha256(b"thread-stale").hexdigest() + ".json")
            stale_state = json.loads(state_path.read_text(encoding="utf-8"))
            stale_state["createdAt"] = "2000-01-01T00:00:00Z"
            state_path.write_text(json.dumps(stale_state), encoding="utf-8")
            self.assertEqual(run("inventory-ok", "thread-stale", "base", "branch").returncode, 1)

    def test_maintenance_requires_explicit_confirmation(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            replacement = Path(directory) / "replacement.json"
            replacement.write_text(json.dumps(self.snapshot), encoding="utf-8")
            command = [sys.executable, "tools/maintain-asynchronia-model-snapshot.py", str(replacement)]
            result = subprocess.run(command, capture_output=True, text=True, check=False)
            self.assertEqual(result.returncode, 2)
            self.assertIn("EXPLICIT_CONFIRMATION_REQUIRED", result.stdout)
            confirmed = subprocess.run(command + ["--confirm", "--snapshot", str(replacement)], capture_output=True, text=True, check=False)
            self.assertEqual(confirmed.returncode, 0)
            self.assertIn("SNAPSHOT_REPLACED", confirmed.stdout)
            self.assertEqual(load_snapshot()["snapshotRevision"], "20260714.1")


if __name__ == "__main__":
    unittest.main()
