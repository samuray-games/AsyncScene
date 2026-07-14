from __future__ import annotations

import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from plugins.asynchronia.model_selector import (  # noqa: E402
    MAINTENANCE_TASK_ID,
    SNAPSHOT_PATH,
    SnapshotError,
    authorize_continue,
    build_candidate_matrix,
    canonical_hash,
    load_snapshot,
    run_preflight,
    validate_snapshot,
)


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

    def test_preflight_prints_complete_inventory_and_exact_responses(self) -> None:
        preflight = run_preflight(thread_id="thread-1")
        self.assertEqual(preflight.status, "WAITING_FOR_INVENTORY_CONFIRMATION")
        self.assertIn("model count: 6", preflight.output)
        self.assertIn("model-effort pair count: 29", preflight.output)
        self.assertIn("gpt-5.6-sol / ultra", preflight.output)
        self.assertIn("recommended lowest reliable pair:", preflight.output)
        ok = run_preflight("INVENTORY_OK", thread_id="thread-1")
        self.assertEqual(ok.status, "WAITING_FOR_MODEL_SELECTION")
        self.assertEqual(authorize_continue(ok, " CONTINUE ", thread_id="thread-1"), "IMPLEMENTATION_ALLOWED")
        with self.assertRaises(SnapshotError):
            authorize_continue(ok, "CONTINUE", thread_id="thread-2")
        changed = run_preflight("INVENTORY_CHANGED", thread_id="thread-1")
        self.assertEqual(changed.status, "BLOCKED_MODEL_INVENTORY_CHANGED")
        self.assertIn(MAINTENANCE_TASK_ID, changed.output)
        with self.assertRaises(SnapshotError):
            authorize_continue(changed, "CONTINUE", thread_id="thread-1")

    def test_maintenance_requires_explicit_confirmation(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            replacement = Path(directory) / "replacement.json"
            replacement.write_text(json.dumps(self.snapshot), encoding="utf-8")
            command = [sys.executable, "tools/maintain-asynchronia-model-snapshot.py", str(replacement)]
            result = subprocess.run(command, capture_output=True, text=True, check=False)
            self.assertEqual(result.returncode, 2)
            self.assertIn("EXPLICIT_CONFIRMATION_REQUIRED", result.stdout)
            self.assertEqual(load_snapshot()["snapshotRevision"], "20260714.1")


if __name__ == "__main__":
    unittest.main()
