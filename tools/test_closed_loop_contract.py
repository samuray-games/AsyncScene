from __future__ import annotations

import unittest

from tools.closed_loop_contract import (
    BRIDGE_PROTOCOL,
    CONTRACT_VERSION,
    LEGAL_STATES,
    LEGAL_TRANSITIONS,
    NEGATIVE_CONTROLS,
    POSITIVE_CONTROLS,
    REPORT_SCHEMA_KEYS,
    ClosedLoopState,
    accept_product_work,
    classify_recovery,
    load_state,
    self_check,
    serialize,
    validate_identity,
    validate_outbox_path,
    validate_report_schema,
    validate_transition,
)


def sample_state(**overrides: object) -> ClosedLoopState:
    data = dict(
        bridge_slot=3,
        thread_id="BRIDGE-20260709-052",
        lane_id="PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION",
        task_id="TASK-PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION",
        execution_epoch="CLOSED-LOOP-SOURCE-R1-20260709-2138JST",
        task_nonce="CLV1-052-SOURCE-9B17-2138",
        coordinator_memory_rev="2026-07-09-2138-JST",
        baseline_sha="9b170097e1ff0889ae0cb1e127516c51440c4c3d",
        inbox_path=".ai-bridge/inbox/BRIDGE-20260709-052-01-chatgpt.md",
        claim_path=".ai-bridge/claims/BRIDGE-20260709-052-claim-v1-codex.md",
        expected_outbox_path=".ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md",
        remote_state_sha="feedfacefeedfacefeedfacefeedfacefeedface",
        completion_mode="PRIMARY_DELTA",
        result_status="PASS_PUSHED",
        next_action="Open a fresh ChatGPT conversation and send мост 3.",
        current_state="PRIMARY_PUBLISHED",
        remote_mailbox_commit="deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        primary_commit_sha="cafebabecafebabecafebabecafebabecafebabe",
        primary_parent_sha="9b170097e1ff0889ae0cb1e127516c51440c4c3d",
        changed_paths=(".ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md",),
        authorized_paths=(".ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md",),
        validation_results=("py_compile: PASS",),
        negative_controls=NEGATIVE_CONTROLS,
        positive_controls=POSITIVE_CONTROLS,
        recovery_classification="CORRECTION_REQUIRED",
        byte_equality="MATCH",
        primary_changed=True,
    )
    data.update(overrides)
    return ClosedLoopState(**data)


class ClosedLoopContractTest(unittest.TestCase):
    def test_contract_identity(self) -> None:
        self.assertEqual(CONTRACT_VERSION, "1.0.1")
        self.assertEqual(BRIDGE_PROTOCOL, "3.3")
        self.assertEqual(len(LEGAL_STATES), 12)

    def test_round_trip(self) -> None:
        state = sample_state()
        payload = serialize(state)
        self.assertEqual(payload["bridge_slot"], 3)
        self.assertEqual(load_state(payload), state)
        validate_identity(state)
        validate_outbox_path(payload["expected_outbox_path"])

    def test_all_legal_transitions(self) -> None:
        for current, targets in LEGAL_TRANSITIONS.items():
            for target in targets:
                validate_transition(current, target)

    def test_illegal_transitions_raise(self) -> None:
        for current, target in (("CLOSED", "EXECUTING"), ("PRIMARY_PUBLISHED", "READY_FOR_CODEX"), ("SUPERSEDED", "CLOSED")):
            with self.assertRaises(ValueError):
                validate_transition(current, target)

    def test_identity_mismatch_raises(self) -> None:
        with self.assertRaises(ValueError):
            validate_identity(sample_state(bridge_slot=4))

    def test_memory_pending_requires_identity(self) -> None:
        with self.assertRaises(ValueError):
            validate_identity(sample_state(coordinator_memory_rev=""))

    def test_orphan_artifacts_are_rejected(self) -> None:
        with self.assertRaises(ValueError):
            validate_identity(sample_state(expected_outbox_path=".ai-bridge/outbox/BRIDGE-20260709-052-01-chatgpt.md"))

    def test_missing_inbox_or_claim_rejected(self) -> None:
        with self.assertRaises(ValueError):
            validate_identity(sample_state(inbox_path=""))
        with self.assertRaises(ValueError):
            validate_identity(sample_state(claim_path=""))

    def test_startup_outbox_absence_allowed(self) -> None:
        state = sample_state(current_state="CLOSED", completion_mode="STARTUP", primary_changed=False)
        self.assertEqual(state.expected_outbox_path, ".ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md")

    def test_foreign_preexisting_outbox_detected(self) -> None:
        with self.assertRaises(ValueError):
            validate_outbox_path(".ai-bridge/outbox/BRIDGE-20260709-052-01-chatgpt.md")

    def test_premature_schema_checks(self) -> None:
        with self.assertRaises(ValueError):
            validate_report_schema({"status": "OK"})

    def test_report_schema_rejects_extra_keys(self) -> None:
        payload = {field: "x" for field in REPORT_SCHEMA_KEYS}
        payload["extra"] = "nope"
        with self.assertRaises(ValueError):
            validate_report_schema(payload)

    def test_report_schema_rejects_wrong_types(self) -> None:
        payload = {field: "x" for field in REPORT_SCHEMA_KEYS}
        payload["primaryChanged"] = "false"
        with self.assertRaises(ValueError):
            validate_report_schema(payload)

    def test_report_schema_rejects_empty_values(self) -> None:
        payload = {field: "x" for field in REPORT_SCHEMA_KEYS}
        payload["status"] = " "
        with self.assertRaises(ValueError):
            validate_report_schema(payload)

    def test_report_schema_accepts_complete_payload(self) -> None:
        payload = {
            "status": "PASS_PUSHED",
            "completionMode": "PRIMARY_DELTA",
            "primaryChanged": True,
            "verifiedPrimarySha": "cafebabecafebabecafebabecafebabecafebabe",
            "primaryParent": "9b170097e1ff0889ae0cb1e127516c51440c4c3d",
            "changedPaths": [".ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md"],
            "authorizedPaths": [".ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md"],
            "validationResults": ["py_compile: PASS", "unittest: PASS"],
            "negativeControls": list(NEGATIVE_CONTROLS),
            "positiveControls": list(POSITIVE_CONTROLS),
            "recoveryClassification": "CORRECTION_REQUIRED",
            "nextAction": "Open a fresh ChatGPT conversation and send мост 3.",
            "remoteMailboxCommit": "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
            "remoteStateSha": "feedfacefeedfacefeedfacefeedfacefeedface",
            "byteEquality": "MATCH",
            "outboxPath": ".ai-bridge/outbox/BRIDGE-20260709-053-02-codex.md",
            "baselineSha": "8134d3660eccf999a12e594d8642d90215a75a76",
            "bridgeSlot": 3,
            "threadId": "BRIDGE-20260709-053",
            "laneId": "PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION",
            "taskId": "TASK-PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION",
            "executionEpoch": "CLOSED-LOOP-SOURCE-R2-20260709-2154JST",
            "taskNonce": "CLV1-053-SOURCE-8134-2154",
            "coordinatorMemoryRev": "2026-07-09-2154-JST",
            "policyVersion": "CODEX_AUTOPILOT_2026_07_09_CLOSED_LOOP_V1_1",
        }
        validate_report_schema(payload)

    def test_recovery_selection(self) -> None:
        self.assertEqual(classify_recovery({"status": "BLOCKED_EXTERNAL"}), "BLOCKED_EXTERNAL")
        self.assertEqual(classify_recovery({"publicationRecovery": True}), "PUBLICATION_RECOVERY_REQUIRED")
        self.assertEqual(classify_recovery({"reportRecovery": True}), "REPORT_RECOVERY_REQUIRED")
        self.assertEqual(classify_recovery({}), "CORRECTION_REQUIRED")

    def test_canary_gate(self) -> None:
        self.assertFalse(accept_product_work({"canaryAccepted": False, "currentState": "ACCEPTED"}))
        self.assertTrue(accept_product_work({"canaryAccepted": True, "currentState": "ACCEPTED"}))

    def test_controls_inventory(self) -> None:
        self.assertGreaterEqual(len(POSITIVE_CONTROLS), 42)
        self.assertEqual(len(NEGATIVE_CONTROLS), 52)
        self.assertEqual(len(set(POSITIVE_CONTROLS)), len(POSITIVE_CONTROLS))
        self.assertEqual(len(set(NEGATIVE_CONTROLS)), len(NEGATIVE_CONTROLS))

    def test_self_check(self) -> None:
        result = self_check()
        self.assertEqual(result["contractVersion"], "1.0.1")
        self.assertEqual(len(result["states"]), 12)
        self.assertEqual(len(result["negativeControls"]), 52)
        self.assertEqual(len(result["positiveControls"]), len(POSITIVE_CONTROLS))


if __name__ == "__main__":
    unittest.main()
