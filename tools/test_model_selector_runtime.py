from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from plugins.asynchronia import model_selector as selector_core  # noqa: E402
from plugins.asynchronia.model_selector_runtime import (  # noqa: E402
    PLUGIN_VERSION,
    AuthorizationError,
    TaskDescriptionError,
    build_candidate_matrix,
    evaluate_task,
    inspect_state,
    load_snapshot,
    mutation_authorization_guard,
    record_continue,
    record_inventory_ok,
    resolve_default_state_dir,
    start_preflight,
    task_hash,
)

TEST_BRANCH = "test/model-selector-attached-branch"


def task(**overrides: object) -> dict[str, object]:
    value: dict[str, object] = {
        "taskId": "TASK-TEST-1",
        "taskType": "PLUGIN_POLICY",
        "objective": "validate selector mutation authorization",
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
    value.update(overrides)
    return value


class ModelSelectorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.original_current_branch = selector_core.current_branch
        selector_core.current_branch = lambda: TEST_BRANCH

    @classmethod
    def tearDownClass(cls) -> None:
        selector_core.current_branch = cls.original_current_branch

    def test_plugin_version_and_inventory_authority(self) -> None:
        self.assertEqual(PLUGIN_VERSION, "1.0.18")
        snapshot = load_snapshot()
        candidates = build_candidate_matrix(snapshot)
        self.assertEqual(snapshot["snapshotRevision"], "20260801.1")
        self.assertEqual(snapshot["confirmedTimestamp"], "2026-08-01T05:31:00Z")
        self.assertEqual(len(candidates), snapshot["completeModelEffortPairCount"])
        self.assertEqual(snapshot["completeModelCount"], 6)
        self.assertEqual(snapshot["completeModelEffortPairCount"], 29)
        self.assertEqual(len(candidates), 29)
        self.assertEqual(
            [(candidate.modelLabel, candidate.effortLabel) for candidate in candidates],
            [
                ("5.4 Mini", "Light"), ("5.4 Mini", "Medium"), ("5.4 Mini", "High"), ("5.4 Mini", "Extra High"),
                ("5.4", "Light"), ("5.4", "Medium"), ("5.4", "High"), ("5.4", "Extra High"),
                ("5.5", "Light"), ("5.5", "Medium"), ("5.5", "High"), ("5.5", "Extra High"),
                ("5.6 Luna", "Light"), ("5.6 Luna", "Medium"), ("5.6 Luna", "High"),
                ("5.6 Luna", "Extra High"), ("5.6 Luna", "Max"),
                ("5.6 Terra", "Light"), ("5.6 Terra", "Medium"), ("5.6 Terra", "High"),
                ("5.6 Terra", "Extra High"), ("5.6 Terra", "Max"), ("5.6 Terra", "Ultra"),
                ("5.6 Sol", "Light"), ("5.6 Sol", "Medium"), ("5.6 Sol", "High"),
                ("5.6 Sol", "Extra High"), ("5.6 Sol", "Max"), ("5.6 Sol", "Ultra"),
            ],
        )
        report = evaluate_task(snapshot, task())
        self.assertEqual(len(report.evaluations), 29)
        self.assertTrue(report.recommendation.modelLabel)
        self.assertEqual(len({(item.modelIdentifier, item.effortIdentifier) for item in report.evaluations}), 29)
        self.assertNotIn("gpt-5.6-terra-sol", {item.modelIdentifier for item in report.evaluations})

    def test_default_state_is_git_private_and_not_legacy_home_path(self) -> None:
        state_dir = resolve_default_state_dir(ROOT)
        common = subprocess.run(
            ["git", "-C", str(ROOT), "rev-parse", "--git-common-dir"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        common_path = Path(common)
        if not common_path.is_absolute():
            common_path = ROOT / common_path
        common_path = common_path.resolve()
        self.assertTrue(state_dir == common_path or common_path in state_dir.parents)
        self.assertNotEqual(state_dir, Path.home() / ".asynchronia" / "model-selector-state")
        self.assertIn("asynchronia/model-selector-state", state_dir.as_posix())

    def test_relative_state_override_fails_closed(self) -> None:
        previous = os.environ.get("ASYNCHRONIA_SELECTOR_STATE_DIR")
        os.environ["ASYNCHRONIA_SELECTOR_STATE_DIR"] = "relative/state"
        try:
            with self.assertRaises(AuthorizationError):
                resolve_default_state_dir(ROOT)
        finally:
            if previous is None:
                os.environ.pop("ASYNCHRONIA_SELECTOR_STATE_DIR", None)
            else:
                os.environ["ASYNCHRONIA_SELECTOR_STATE_DIR"] = previous

    def test_mutation_state_machine_requires_inventory_ok_then_continue(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            selected = task()
            start = start_preflight(selected, "thread-state", "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            self.assertEqual(start.status, "WAITING_FOR_INVENTORY_CONFIRMATION")
            self.assertIn("recommended pair:", start.output)
            self.assertIn("exact next response: INVENTORY_OK or INVENTORY_CHANGED", start.output)
            with self.assertRaises(AuthorizationError):
                record_continue("thread-state", "CONTINUE", selected, "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            waiting = record_inventory_ok("thread-state", selected, "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            self.assertEqual(waiting.status, "WAITING_FOR_MODEL_SELECTION")
            self.assertIn("exact next response: CONTINUE", waiting.output)
            result = record_continue("thread-state", "CONTINUE", selected, "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            self.assertIn("IMPLEMENTATION_ALLOWED", result)
            state = inspect_state("thread-state", state_dir=state_dir)
            self.assertEqual(state["state"], "IMPLEMENTATION_ALLOWED")
            guarded = mutation_authorization_guard("thread-state", selected, "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            self.assertEqual(guarded["taskDescriptionHash"], task_hash(selected))

    def test_task_identity_drift_invalidates_authorization(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            original = task()
            start_preflight(original, "thread-drift", "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            with self.assertRaises(AuthorizationError):
                record_inventory_ok(
                    "thread-drift",
                    task(validationComplexity="critical"),
                    "baseline",
                    branch=TEST_BRANCH,
                    state_dir=state_dir,
                )

    def test_read_only_short_circuits_without_state(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest_dir = root / "installed" / ".codex-plugin"
            manifest_dir.mkdir(parents=True)
            source = json.loads((ROOT / "plugins/asynchronia/.codex-plugin/plugin.json").read_text())
            (manifest_dir / "plugin.json").write_text(json.dumps(source), encoding="utf-8")
            state_dir = root / "state"
            read_task = task(writeScope=[])
            result = start_preflight(
                read_task,
                "thread-read",
                "baseline",
                branch=TEST_BRANCH,
                state_dir=state_dir,
                plugin_root=manifest_dir.parent,
            )
            self.assertEqual(result.status, "READ_ONLY_ALLOWED")
            self.assertNotIn("recommended pair:", result.output)
            self.assertEqual(list(state_dir.glob("*.json")), [])

    def test_docs_only_mutation_recommendation_remains_luna_light(self) -> None:
        docs_task = task(
            writeScope=["plugins/asynchronia/notes.md"],
            runtimeSensitivity="low",
            architectureImpact="low",
            securityImpact="low",
            economyImpact="low",
            releaseImpact="low",
            validationComplexity="low",
            expectedImplementationSize="small",
            ambiguityNovelty="low",
            concurrencyBranchRisk="low",
        )
        report = evaluate_task(load_snapshot(), docs_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Luna")
        self.assertEqual(report.recommendation.effortLabel, "Light")

    def test_luna_floor_rejects_lower_family_models(self) -> None:
        self.assertLess(selector_core._model_floor_index("gpt-5.4-mini"), selector_core._model_floor_index("gpt-5.6-luna"))
        self.assertLess(selector_core._model_floor_index("gpt-5.4"), selector_core._model_floor_index("gpt-5.6-luna"))
        self.assertLess(selector_core._model_floor_index("gpt-5.5"), selector_core._model_floor_index("gpt-5.6-luna"))

    def test_unknown_model_and_effort_identities_fail_closed(self) -> None:
        with self.assertRaises(TaskDescriptionError):
            selector_core._model_floor_index("gpt-unknown")
        with self.assertRaises(TaskDescriptionError):
            selector_core._effort_floor_index("mystery")

    def test_runtime_floor_raises_effort_without_leaving_luna_family(self) -> None:
        runtime_task = task(
            runtimeSensitivity="high",
            architectureImpact="low",
            securityImpact="low",
            economyImpact="low",
            releaseImpact="low",
            validationComplexity="low",
            ambiguityNovelty="low",
            concurrencyBranchRisk="low",
        )
        report = evaluate_task(load_snapshot(), runtime_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Luna")
        self.assertEqual(report.recommendation.effortLabel, "High")

    def test_required_score_out_of_bounds_fail_closed(self) -> None:
        with patch.object(selector_core, "_required_score", return_value=9):
            with self.assertRaises(TaskDescriptionError):
                evaluate_task(load_snapshot(), task())
        with patch.object(selector_core, "_required_score", return_value=40):
            with self.assertRaises(TaskDescriptionError):
                evaluate_task(load_snapshot(), task())

    def test_security_floor_escalates_to_terra_light(self) -> None:
        security_task = task(
            securityImpact="high",
            runtimeSensitivity="low",
            architectureImpact="low",
            economyImpact="low",
            releaseImpact="low",
            validationComplexity="low",
            ambiguityNovelty="low",
            concurrencyBranchRisk="low",
        )
        report = evaluate_task(load_snapshot(), security_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Terra")
        self.assertEqual(report.recommendation.effortLabel, "Light")

    def test_injected_evaluator_cannot_promote_below_floor(self) -> None:
        security_task = task(
            securityImpact="high",
            runtimeSensitivity="low",
            architectureImpact="low",
            economyImpact="low",
            releaseImpact="low",
            validationComplexity="low",
            ambiguityNovelty="low",
            concurrencyBranchRisk="low",
        )
        report = evaluate_task(load_snapshot(), security_task, evaluator=lambda *_: "SUITABLE")
        self.assertEqual(report.recommendation.modelLabel, "5.6 Terra")
        self.assertEqual(report.recommendation.effortLabel, "Light")

    def test_injected_evaluator_cannot_promote_effort_below_required_floor(self) -> None:
        runtime_task = task(
            runtimeSensitivity="high",
            architectureImpact="low",
            securityImpact="low",
            economyImpact="low",
            releaseImpact="low",
            validationComplexity="low",
            ambiguityNovelty="low",
            concurrencyBranchRisk="low",
        )
        report = evaluate_task(load_snapshot(), runtime_task, evaluator=lambda *_: "SUITABLE")
        self.assertEqual(report.recommendation.effortLabel, "High")

    def test_broad_cross_cutting_escalates_to_sol_light(self) -> None:
        broad_task = task(
            architectureImpact="high",
            securityImpact="high",
            economyImpact="high",
            releaseImpact="high",
            validationComplexity="high",
            concurrencyBranchRisk="high",
            runtimeSensitivity="low",
            ambiguityNovelty="low",
            expectedImplementationSize="very_large",
            affectedSystems=["a", "b", "c"],
        )
        report = evaluate_task(load_snapshot(), broad_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Sol")
        self.assertEqual(report.recommendation.effortLabel, "High")

    def test_broad_and_architecture_keeps_higher_effort_floor(self) -> None:
        broad_task = task(
            architectureImpact="high",
            securityImpact="high",
            economyImpact="high",
            releaseImpact="high",
            validationComplexity="high",
            concurrencyBranchRisk="high",
            runtimeSensitivity="low",
            ambiguityNovelty="low",
            expectedImplementationSize="very_large",
            affectedSystems=["a", "b", "c"],
        )
        report = evaluate_task(load_snapshot(), broad_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Sol")
        self.assertEqual(report.recommendation.effortLabel, "High")

    def test_broad_and_runtime_combination_escalates_to_sol_high(self) -> None:
        broad_task = task(
            architectureImpact="high",
            securityImpact="high",
            economyImpact="high",
            releaseImpact="high",
            validationComplexity="high",
            concurrencyBranchRisk="high",
            runtimeSensitivity="high",
            ambiguityNovelty="low",
            expectedImplementationSize="very_large",
            affectedSystems=["a", "b", "c"],
        )
        report = evaluate_task(load_snapshot(), broad_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Sol")
        self.assertEqual(report.recommendation.effortLabel, "High")

    def test_broad_and_ambiguity_concurrency_preserves_medium_floor(self) -> None:
        broad_task = task(
            architectureImpact="high",
            securityImpact="high",
            economyImpact="high",
            releaseImpact="high",
            validationComplexity="high",
            concurrencyBranchRisk="high",
            runtimeSensitivity="low",
            ambiguityNovelty="high",
            expectedImplementationSize="very_large",
            affectedSystems=["a", "b", "c"],
        )
        report = evaluate_task(load_snapshot(), broad_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Sol")
        self.assertGreaterEqual(selector_core._effort_floor_index(report.recommendation.effortIdentifier), selector_core._effort_floor_index("medium"))

    def test_broad_with_scalar_38_reaches_sol_max(self) -> None:
        broad_task = task(
            architectureImpact="high",
            securityImpact="high",
            economyImpact="high",
            releaseImpact="high",
            validationComplexity="high",
            concurrencyBranchRisk="high",
            runtimeSensitivity="low",
            ambiguityNovelty="low",
            expectedImplementationSize="very_large",
            affectedSystems=["a", "b", "c"],
        )
        with patch.object(selector_core, "_required_score", return_value=38):
            report = evaluate_task(load_snapshot(), broad_task)
        self.assertEqual(report.recommendation.modelLabel, "5.6 Sol")
        self.assertEqual(report.recommendation.effortLabel, "Max")

    def test_task_schema_rejects_missing_classification(self) -> None:
        broken = task()
        broken.pop("securityImpact")
        with self.assertRaises(TaskDescriptionError):
            evaluate_task(load_snapshot(), broken)


if __name__ == "__main__":
    unittest.main()
