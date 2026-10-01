from __future__ import annotations

import json
import unittest
from pathlib import Path

from plugins.asynchronia.model_selector import (
    AUTHORITY_MANIFEST_PATH,
    MODEL_STABLE_FLOOR_RANK_ANCHORS,
    MODEL_STABLE_FLOOR_RANK_POLICY,
    MODEL_STABLE_FLOOR_RANKS,
    SNAPSHOT_PATH,
    TaskDescriptionError,
    _build_snapshot_from_inventory,
    _manifest,
    _model_floor_index,
    build_candidate_matrix,
    evaluate_task,
    extend_model_stable_floor_ranks,
    load_snapshot,
)
from plugins.asynchronia.model_selector_costs import load_cost_authority
from plugins.asynchronia.model_selector_inventory import parse_inventory_markdown


ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / ".ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20261001/UI-VISIBLE-MODEL-INVENTORY.md"
EXPECTED_INVENTORY = [
    ("6.1 Sol", "gpt-6.1-sol", ["Light", "Medium", "High", "Extra High", "Max", "Ultra"]),
    ("6 Astra", "gpt-6-astra", ["Light", "Medium", "High", "Extra High", "Max", "Ultra"]),
    ("6 Sol", "gpt-6-sol", ["Light", "Medium", "High", "Extra High", "Max", "Ultra"]),
    ("6 Luna", "gpt-6-luna", ["Light", "Medium", "High", "Extra High", "Max"]),
    ("5.6 Sol", "gpt-5.6-sol", ["Light", "Medium", "High", "Extra High", "Max", "Ultra"]),
    ("5.6 Terra", "gpt-5.6-terra", ["Light", "Medium", "High", "Extra High", "Max", "Ultra"]),
    ("5.6 Luna", "gpt-5.6-luna", ["Light", "Medium", "High", "Extra High", "Max"]),
    ("5.5", "gpt-5.5", ["Light", "Medium", "High", "Extra High"]),
]


def selector_task() -> dict[str, object]:
    return {
        "taskId": "TASK-TEST-INVENTORY-MAINTENANCE",
        "taskType": "PLUGIN_POLICY",
        "objective": "exercise the full model-effort candidate matrix",
        "readScope": ["plugins/asynchronia"],
        "writeScope": ["plugins/asynchronia/model_selector.py"],
        "affectedSystems": ["selector", "inventory"],
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


class ModelSelectorInventoryMaintenanceTests(unittest.TestCase):
    def test_canonical_inventory_has_exact_eight_models_and_44_pairs(self) -> None:
        inventory = parse_inventory_markdown(INVENTORY_PATH)
        self.assertEqual(inventory.model_count, 8)
        self.assertEqual(inventory.pair_count, 44)
        self.assertEqual(
            [
                (model["modelLabel"], model["modelIdentifier"], [effort["effortLabel"] for effort in model["supportedEfforts"]])
                for model in inventory.models
            ],
            EXPECTED_INVENTORY,
        )

    def test_effort_exclusions_are_exact(self) -> None:
        models = {model["modelIdentifier"]: model for model in load_snapshot()["models"]}
        self.assertEqual(len(models["gpt-5.5"]["supportedEfforts"]), 4)
        self.assertNotIn("max", [effort["effortIdentifier"] for effort in models["gpt-5.5"]["supportedEfforts"]])
        self.assertNotIn("ultra", [effort["effortIdentifier"] for effort in models["gpt-5.5"]["supportedEfforts"]])
        for model_id in ("gpt-6-luna", "gpt-5.6-luna"):
            self.assertNotIn("ultra", [effort["effortIdentifier"] for effort in models[model_id]["supportedEfforts"]])

    def test_snapshot_and_authority_are_bound_and_reproducible(self) -> None:
        manifest = _manifest()
        snapshot = load_snapshot()
        generated = _build_snapshot_from_inventory()
        stored = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
        self.assertEqual(snapshot, stored)
        self.assertEqual(generated, stored)
        self.assertEqual(snapshot["snapshotRevision"], "20261001.1")
        self.assertEqual(snapshot["sourceArtifact"]["path"], manifest["inventoryArtifactPath"])
        self.assertEqual(snapshot["sourceArtifact"]["blobSha"], manifest["lastAcceptedBlobSha"])
        self.assertEqual(snapshot["completeModelCount"], 8)
        self.assertEqual(snapshot["completeModelEffortPairCount"], 44)

    def test_all_inventory_models_have_floor_ranks_and_old_active_ranks_are_stable(self) -> None:
        ids = [model["modelIdentifier"] for model in load_snapshot()["models"]]
        self.assertEqual(list(MODEL_STABLE_FLOOR_RANKS), ids)
        self.assertEqual(set(MODEL_STABLE_FLOOR_RANKS), set(ids))
        self.assertEqual(
            {model_id: MODEL_STABLE_FLOOR_RANKS[model_id] for model_id in ("gpt-5.5", "gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol")},
            {"gpt-5.5": -1, "gpt-5.6-luna": 0, "gpt-5.6-terra": 1, "gpt-5.6-sol": 2},
        )
        self.assertNotIn("gpt-5.4", MODEL_STABLE_FLOOR_RANKS)
        self.assertNotIn("gpt-5.4-mini", MODEL_STABLE_FLOOR_RANKS)
        self.assertEqual(_manifest()["modelStableFloorRanks"], MODEL_STABLE_FLOOR_RANKS)
        self.assertEqual(_manifest()["modelStableFloorRankAnchors"], MODEL_STABLE_FLOOR_RANK_ANCHORS)
        self.assertEqual(_manifest()["modelStableFloorRankPolicy"], MODEL_STABLE_FLOOR_RANK_POLICY)

    def test_floor_extension_preserves_anchors_and_inventory_order(self) -> None:
        ids = [model["modelIdentifier"] for model in load_snapshot()["models"]]
        ranks = extend_model_stable_floor_ranks(ids, MODEL_STABLE_FLOOR_RANK_ANCHORS)
        self.assertEqual(ranks, MODEL_STABLE_FLOOR_RANKS)
        self.assertEqual(list(ranks.values()), [4, 3, 3, 3, 2, 1, 0, -1])
        self.assertTrue(all(left >= right for left, right in zip(ranks.values(), list(ranks.values())[1:])))
        self.assertEqual({key: ranks[key] for key in MODEL_STABLE_FLOOR_RANK_ANCHORS}, MODEL_STABLE_FLOOR_RANK_ANCHORS)

    def test_floor_extension_rule_handles_leading_interior_and_trailing_runs(self) -> None:
        order = ["new-top-a", "new-top-b", "anchor-high", "new-middle-a", "new-middle-b", "anchor-low", "new-tail-a", "new-tail-b"]
        ranks = extend_model_stable_floor_ranks(order, {"anchor-high": 2, "anchor-low": 0})
        self.assertEqual(list(ranks.values()), [4, 3, 2, 2, 2, 0, -1, -2])
        self.assertEqual((ranks["anchor-high"], ranks["anchor-low"]), (2, 0))
        with self.assertRaises(TaskDescriptionError):
            extend_model_stable_floor_ranks(["new", "anchor"], {"missing": 1})
        with self.assertRaises(TaskDescriptionError):
            extend_model_stable_floor_ranks(["anchor-low", "anchor-high"], {"anchor-low": 0, "anchor-high": 2})

    def test_unknown_floor_still_fails_closed(self) -> None:
        with self.assertRaisesRegex(TaskDescriptionError, "unknown model floor: gpt-unknown"):
            _model_floor_index("gpt-unknown")
        for model_id in (model[1] for model in EXPECTED_INVENTORY):
            self.assertIsInstance(_model_floor_index(model_id), int)

    def test_cost_authority_covers_exact_inventory_without_price_based_ranks(self) -> None:
        ids = [model["modelIdentifier"] for model in load_snapshot()["models"]]
        costs = load_cost_authority(repository_root=ROOT, inventory_model_ids=ids)
        self.assertEqual(set(costs.models), set(ids))
        self.assertEqual(len(costs.tiers), 8)
        self.assertEqual(MODEL_STABLE_FLOOR_RANKS["gpt-6.1-sol"], 4)
        self.assertEqual(MODEL_STABLE_FLOOR_RANKS["gpt-6-astra"], 3)
        self.assertEqual(MODEL_STABLE_FLOOR_RANKS["gpt-6-sol"], 3)
        self.assertEqual(MODEL_STABLE_FLOOR_RANKS["gpt-6-luna"], 3)

    def test_every_model_effort_pair_is_evaluated_once(self) -> None:
        candidates = build_candidate_matrix(load_snapshot())
        report = evaluate_task(load_snapshot(), selector_task())
        expected_pairs = {(model_id, effort_id) for _, model_id, efforts in EXPECTED_INVENTORY for effort_id in (effort.lower().replace(" ", "-") for effort in efforts)}
        evaluated_pairs = {(item.modelIdentifier, item.effortIdentifier) for item in report.evaluations}
        self.assertEqual(len(candidates), 44)
        self.assertEqual(len(report.evaluations), 44)
        self.assertEqual(len(evaluated_pairs), 44)
        self.assertEqual(evaluated_pairs, expected_pairs)


if __name__ == "__main__":
    unittest.main()
