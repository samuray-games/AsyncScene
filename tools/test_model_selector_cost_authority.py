from __future__ import annotations

import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from plugins.asynchronia import model_selector as selector
from plugins.asynchronia.model_selector_costs import CostAuthorityError, build_cost_tiers, canonical_hash, load_cost_authority
from tools.test_model_selector_snapshot import task


ROOT = Path(__file__).resolve().parents[1]
AUTHORITY_PATH = ROOT / "plugins/asynchronia/model-selector-cost-authority.json"


class CostAuthorityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.snapshot = selector.load_snapshot()
        self.inventory_ids = [model["modelIdentifier"] for model in self.snapshot["models"]]
        self.authority = load_cost_authority(inventory_model_ids=self.inventory_ids, repository_root=ROOT)

    def test_schema_blob_hash_vectors_and_five_tiers(self) -> None:
        self.assertEqual(self.authority.schemaVersion, "1.0.0")
        self.assertEqual(self.authority.authorityRevision, "20260801.1")
        self.assertEqual(self.authority.pricingBasis, "CODEX_CREDITS_PER_1M_TOKENS_STANDARD_SPEED")
        self.assertEqual(self.authority.sourceArtifactBlobSha, "d308a4a7d0ec19305c4db6b4e67951ee8b83fc77")
        self.assertEqual(self.authority.canonicalContentHash, canonical_hash(json.loads(AUTHORITY_PATH.read_text())))
        self.assertEqual(self.authority.models["gpt-5.6-luna"].outputCredits, "30")
        self.assertEqual([tier.modelIdentifiers for tier in self.authority.tiers], [
            ("gpt-5.6-luna",), ("gpt-5.4-mini",), ("gpt-5.6-terra",),
            ("gpt-5.4",), ("gpt-5.5", "gpt-5.6-sol"),
        ])

    def test_exact_schema_and_provenance_validation_fail_closed(self) -> None:
        mutations = (
            ("unsupported schema version", lambda value: value.update(schemaVersion="1.0.1")),
            ("non-string schema version", lambda value: value.update(schemaVersion=1)),
            ("malformed timestamp", lambda value: value.update(confirmedTimestamp="2026-08-01")),
            ("non-string timestamp", lambda value: value.update(confirmedTimestamp=None)),
            ("non-UTC offset", lambda value: value.update(confirmedTimestamp="2026-08-01T07:34:14+00:00")),
            ("impossible UTC date", lambda value: value.update(confirmedTimestamp="2026-02-30T07:34:14Z")),
            ("wrong official URL", lambda value: value.update(officialSourceUrl="https://help.openai.com/en/articles/other")),
            ("URL suffix", lambda value: value.update(officialSourceUrl="https://help.openai.com/en/articles/20001106-codex-rate-card?ref=authority")),
            ("alternate relative artifact path", lambda value: value.update(sourceArtifactPath="./.ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801/OFFICIAL-CODEX-RATE-CARD.md")),
            ("absolute artifact path", lambda value: value.update(sourceArtifactPath=str(ROOT / ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801/OFFICIAL-CODEX-RATE-CARD.md"))),
            ("traversal artifact path", lambda value: value.update(sourceArtifactPath=".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801/../TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801/OFFICIAL-CODEX-RATE-CARD.md")),
        )
        for label, mutation in mutations:
            with self.subTest(label=label):
                candidate = copy.deepcopy(json.loads(AUTHORITY_PATH.read_text()))
                mutation(candidate)
                candidate["canonicalContentHash"] = canonical_hash(candidate)
                with self.assertRaises(CostAuthorityError):
                    load_cost_authority_from_mapping(candidate)

    def test_decimal_safe_comparison_and_incomparable_fail_closed(self) -> None:
        vectors = {
            "a": self.authority.models["gpt-5.6-luna"],
            "b": self.authority.models["gpt-5.4-mini"],
        }
        self.assertEqual(build_cost_tiers(vectors)[0].modelIdentifiers, ("a",))
        with self.assertRaises(CostAuthorityError):
            build_cost_tiers({
                "a": type(vectors["a"])("1", "2", "3"),
                "b": type(vectors["a"])("2", "1", "4"),
            })

    def test_missing_extra_duplicate_malformed_and_negative_models_fail_closed(self) -> None:
        raw = json.loads(AUTHORITY_PATH.read_text())
        for mutation in (
            lambda value: value["models"].pop(),
            lambda value: value["models"].append(copy.deepcopy(value["models"][0]) | {"modelIdentifier": "gpt-extra"}),
            lambda value: value["models"].append(copy.deepcopy(value["models"][0])),
            lambda value: value["models"][0].update(inputCredits="not-a-decimal"),
            lambda value: value["models"][0].update(inputCredits="-1"),
        ):
            candidate = copy.deepcopy(raw)
            mutation(candidate)
            candidate["canonicalContentHash"] = canonical_hash(candidate)
            with self.assertRaises(CostAuthorityError):
                load_cost_authority_from_mapping(candidate)

    def test_cost_authority_identity_binds_state_and_stale_hash_rejects(self) -> None:
        report = selector.evaluate_task(self.snapshot, task())
        state = selector._identity(task(), self.snapshot, report, "cost-thread", "branch", "baseline")
        self.assertEqual(state["costAuthorityRevision"], "20260801.1")
        self.assertEqual(state["costAuthorityHash"], self.authority.canonicalContentHash)
        stale = dict(state, costAuthorityHash="sha256:stale")
        with self.assertRaises(selector.AuthorizationError):
            selector._assert_identity(stale, task(), self.snapshot, report, "cost-thread", "branch", "baseline")

    def test_29_pair_order_capability_math_recommendations_and_cost_evidence(self) -> None:
        policy_task = {
            "taskId": "TASK-LOW-RISK",
            "taskType": "PLUGIN_POLICY",
            "objective": "validate calibrated scalar bands",
            "readScope": ["plugins/asynchronia"],
            "writeScope": ["plugins/asynchronia/model_selector.py"],
            "affectedSystems": ["selector"],
            "runtimeSensitivity": "low",
            "architectureImpact": "low",
            "securityImpact": "low",
            "economyImpact": "low",
            "releaseImpact": "low",
            "validationComplexity": "low",
            "expectedImplementationSize": "small",
            "ambiguityNovelty": "low",
            "concurrencyBranchRisk": "low",
        }
        expected_pairs = {
            range(10, 20): ("gpt-5.6-luna", "light"),
            range(20, 30): ("gpt-5.6-luna", "medium"),
            range(30, 38): ("gpt-5.6-luna", "high"),
            range(38, 40): ("gpt-5.6-luna", "max"),
        }
        for required in range(10, 40):
            with patch.object(selector, "_required_score", return_value=required):
                report = selector.evaluate_task(self.snapshot, policy_task)
            expected = next(pair for band, pair in expected_pairs.items() if required in band)
            self.assertEqual((report.recommendation.modelIdentifier, report.recommendation.effortIdentifier), expected)
            self.assertEqual(len(report.evaluations), 29)
            self.assertEqual(len({(item.modelIdentifier, item.effortIdentifier) for item in report.evaluations}), 29)
            self.assertEqual(report.evaluations[12].capabilityScore, 40)
            self.assertEqual(report.evaluations[12].costTierIndex, 1)
            self.assertEqual(report.evaluations[12].costVector, ("5", "0.5", "30"))

    def test_cheapest_rejected_and_next_more_capable_are_cost_aware(self) -> None:
        policy_task = {
            "taskId": "TASK-LOW-RISK",
            "taskType": "PLUGIN_POLICY",
            "objective": "validate calibrated frontier outputs",
            "readScope": ["plugins/asynchronia"],
            "writeScope": ["plugins/asynchronia/model_selector.py"],
            "affectedSystems": ["selector"],
            "runtimeSensitivity": "low",
            "architectureImpact": "low",
            "securityImpact": "low",
            "economyImpact": "low",
            "releaseImpact": "low",
            "validationComplexity": "low",
            "expectedImplementationSize": "small",
            "ambiguityNovelty": "low",
            "concurrencyBranchRisk": "low",
        }
        with patch.object(selector, "_required_score", return_value=24):
            report = selector.evaluate_task(self.snapshot, policy_task)
        self.assertEqual((report.cheapestRejected.modelIdentifier, report.cheapestRejected.effortIdentifier), ("gpt-5.6-luna", "light"))
        self.assertEqual((report.nextMoreCapable.modelIdentifier, report.nextMoreCapable.effortIdentifier), ("gpt-5.6-luna", "high"))
        rendered = selector._output(self.snapshot, report, "WAITING_FOR_INVENTORY_CONFIRMATION", "INVENTORY_OK")
        self.assertEqual(sum("credits=" in line for line in rendered.splitlines()), 29)
        self.assertIn("cost=TIER_1; cost-tier=1; credits=5/0.5/30", rendered)

    def test_read_only_still_skips_matrix_and_recommendation(self) -> None:
        read_only = task()
        read_only["writeScope"] = ["NONE_READ_ONLY"]
        with tempfile.TemporaryDirectory() as directory:
            plugin_root = Path(directory) / "plugin"
            manifest = plugin_root / ".codex-plugin"
            manifest.mkdir(parents=True)
            (manifest / "plugin.json").write_text(json.dumps({"name": "asynchronia", "version": "1.0.18"}))
            output = selector.start_preflight(read_only, "read-only-cost", "baseline", branch=selector.current_branch(), plugin_root=plugin_root).output
        self.assertIn("cost authority validation result: PASS", output)
        self.assertNotIn("evaluation matrix:", output)
        self.assertNotIn("recommended pair:", output)


def load_cost_authority_from_mapping(value: dict[str, object]):
    from plugins.asynchronia.model_selector_costs import validate_authority
    return validate_authority(value, repository_root=ROOT, inventory_model_ids=["gpt-5.4-mini", "gpt-5.4", "gpt-5.5", "gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"])


if __name__ == "__main__":
    unittest.main()
