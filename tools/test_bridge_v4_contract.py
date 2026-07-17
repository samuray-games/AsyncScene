import unittest

from tools.bridge_v4_contract import (
    mailbox_ref,
    memory_path,
    task_branch_prefix,
    validate_command,
    validate_cross_slot_immutability,
    validate_publication,
    render_slot_policy,
    validate_policy,
    validate_snapshot,
    validate_state,
)


class BridgeV4ContractTests(unittest.TestCase):
    def valid_state(self, slot: int) -> str:
        return "\n".join(
            [
                "BRIDGE_PROTOCOL: 4.0",
                f"SLOT: {slot}",
                f"BRANCH_MAILBOX: {mailbox_ref(slot)}",
                f"BRANCH_TASK: {task_branch_prefix(slot)}BRIDGE-20260711-TEST",
                "THREAD: BRIDGE-20260711-TEST",
                "GENERATION: 1",
                "TASK: TEST",
            ]
        )

    def manifest_state(self, slot: int, thread: str) -> str:
        return "\n".join(
            [
                "TASK_ID: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714",
                "PIPELINE_VERSION: 1.0.3",
                f"SLOT: {slot}",
                "STATUS: READY_FOR_MODEL_PREFLIGHT",
                f"THREAD: {thread}",
                "GENERATION: 2",
                "TASK: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714",
                f"BRANCH_MAILBOX: {mailbox_ref(slot)}",
                f"BRANCH_TASK: {task_branch_prefix(slot)}{thread}",
                "EXECUTION_EPOCH: BRIDGE-123-S1-CANARY-G2-20260714",
                "AUTHORIZED_BASELINE: c15aac9b203b4a92e5b1115a0c120519b61423d8",
                f"INBOX: .ai-bridge/inbox/{thread}-01-chatgpt.md",
                f"CLAIM: .ai-bridge/claims/{thread}-claim-v1-codex.md",
                f"EXPECTED_OUTBOX: .ai-bridge/outbox/{thread}-01-codex.md",
                f"EXPECTED_RECEIPT: .ai-bridge/receipts/{thread}-01-receipt.md",
                "MODEL_PREFLIGHT_STATUS: REQUIRED",
                "CONTINUATION_STATUS: SAME_THREAD_CONTINUE_REQUIRED",
                "SAFARI_STATUS: N/A",
            ]
        )

    def test_one_to_one_command_routing(self):
        for slot in (1, 2, 3):
            self.assertEqual([], validate_command(slot, mailbox_ref(slot), task_branch_prefix(slot) + "thread"))

    def test_wrong_mailbox_fails_closed(self):
        errors = validate_command(1, mailbox_ref(2), "bridge/1/thread")
        self.assertTrue(any("FAIL_CROSS_SLOT_MAILBOX" in error for error in errors))

    def test_wrong_task_branch_fails_closed(self):
        errors = validate_command(1, mailbox_ref(1), "bridge/2/thread")
        self.assertTrue(any("FAIL_TASK_BRANCH" in error for error in errors))

    def test_direct_main_publication_fails(self):
        errors = validate_command(1, mailbox_ref(1), "main")
        self.assertTrue(any("FAIL_DIRECT_MAIN_PUBLICATION" in error for error in errors))

    def test_shared_activation_pointers_fail(self):
        state = self.valid_state(1) + "\nPRIMARY_ACTIVE_SLOT: 1\nOPEN_SLOT_COUNT: 3\n"
        errors = validate_state(1, state)
        self.assertEqual(2, sum("FAIL_SHARED_ACTIVATION_POINTER" in error for error in errors))

    def test_state_merge_markers_and_duplicate_fields_fail_closed(self):
        state = self.valid_state(1) + "\nSLOT: 1\n<<<<<<< HEAD\n"
        errors = validate_state(1, state)
        self.assertTrue(any("FAIL_UNRESOLVED_MERGE_MARKERS" in error for error in errors))
        self.assertTrue(any("FAIL_DUPLICATE_UPPERCASE_FIELD: SLOT" in error for error in errors))

    def test_state_cannot_name_other_slot(self):
        state = self.valid_state(1) + "\nFOREIGN_BRANCH: bridge/2/BRIDGE-20260714-123-091\n"
        errors = validate_state(1, state)
        self.assertTrue(any("FAIL_CROSS_SLOT_STATE" in error for error in errors))

    def test_state_foreign_mailbox_ref_fails_closed(self):
        state = self.valid_state(1) + "\nFOREIGN_REF: coordination/chatgpt-codex-bridge-2\n"
        errors = validate_state(1, state)
        self.assertTrue(any("FAIL_CROSS_SLOT_STATE: FOREIGN_REF references slot 2" == error for error in errors))

    def test_state_foreign_task_branch_fails_closed(self):
        state = self.valid_state(1) + "\nFOREIGN_BRANCH: bridge/2/BRIDGE-20260714-123-091\n"
        errors = validate_state(1, state)
        self.assertTrue(any("FAIL_CROSS_SLOT_STATE: FOREIGN_BRANCH references slot 2" == error for error in errors))

    def test_manifest_slot1_identity_passes_own_slot(self):
        self.assertEqual([], validate_state(1, self.manifest_state(1, "BRIDGE-20260714-123-101")))

    def test_manifest_slot2_identity_passes_own_slot(self):
        self.assertEqual([], validate_state(2, self.manifest_state(2, "BRIDGE-20260714-123-091")))

    def test_manifest_slot3_identity_passes_own_slot(self):
        self.assertEqual([], validate_state(3, self.manifest_state(3, "BRIDGE-20260714-123-301")))

    def test_exact_remote_slot1_state_fixture_passes(self):
        state = "\n".join(
            (
                "TASK_ID: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714",
                "PIPELINE_VERSION: 1.0.3",
                "SLOT: 1",
                "STATUS: READY_FOR_MODEL_PREFLIGHT",
                "THREAD: BRIDGE-20260714-123-101",
                "GENERATION: 2",
                "TASK: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714",
                "BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-1",
                "BRANCH_TASK: bridge/1/BRIDGE-20260714-123-101",
                "EXECUTION_EPOCH: BRIDGE-123-S1-CANARY-G2-20260714",
                "AUTHORIZED_BASELINE: c15aac9b203b4a92e5b1115a0c120519b61423d8",
                "INBOX: .ai-bridge/inbox/BRIDGE-20260714-123-101-01-chatgpt.md",
                "CLAIM: .ai-bridge/claims/BRIDGE-20260714-123-101-claim-v1-codex.md",
                "EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260714-123-101-01-codex.md",
                "EXPECTED_RECEIPT: .ai-bridge/receipts/BRIDGE-20260714-123-101-01-receipt.md",
                "MODEL_PREFLIGHT_STATUS: REQUIRED",
                "CONTINUATION_STATUS: SAME_THREAD_CONTINUE_REQUIRED",
                "SAFARI_STATUS: N/A",
            )
        )
        self.assertEqual([], validate_state(1, state))

    def test_slot_local_publication_accepts_ai_bridge_artifact(self):
        self.assertEqual([], validate_publication(3, mailbox_ref(3), [".ai-bridge/outbox/thread.md"]))

    def test_cross_slot_publication_fails(self):
        errors = validate_publication(1, mailbox_ref(2), [".ai-bridge/outbox/thread.md"])
        self.assertTrue(any("FAIL_CROSS_SLOT_MAILBOX" in error for error in errors))

    def test_non_mailbox_path_fails(self):
        errors = validate_publication(1, mailbox_ref(1), ["AGENTS.md"])
        self.assertTrue(any("FAIL_MAILBOX_PATH" in error for error in errors))

    def test_other_slot_state_remains_byte_identical(self):
        before = {1: "one-a", 2: "two-a", 3: "three-a"}
        after = {1: "one-b", 2: "two-a", 3: "three-a"}
        self.assertEqual([], validate_cross_slot_immutability(before, after, 1))

    def test_other_slot_mutation_is_rejected(self):
        before = {1: "one-a", 2: "two-a", 3: "three-a"}
        after = {1: "one-b", 2: "two-b", 3: "three-a"}
        errors = validate_cross_slot_immutability(before, after, 1)
        self.assertEqual(["FAIL_CROSS_SLOT_MUTATION: slot 2 changed while mutating slot 1"], errors)

    def test_memory_paths_are_separate(self):
        self.assertEqual(3, len({memory_path(slot) for slot in (1, 2, 3)}))

    def test_rendered_policy_matches_its_state(self):
        self.assertEqual([], validate_policy(1, render_slot_policy(1), self.valid_state(1)))

    def test_policy_and_snapshot_merge_markers_fail_closed(self):
        policy = render_slot_policy(2) + "SLOT: 2\n"
        snapshot = "\n".join(("SLOT: 3", "BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-3", "STATUS: AVAILABLE", "CURRENT_THREAD: NONE", "CURRENT_TASK_BRANCH: bridge/3/AVAILABLE", "SLOT: 3", ">>>>>>> branch"))
        state = self.valid_state(2) + "\nSLOT: 2\n=======\n"
        self.assertTrue(any("FAIL_DUPLICATE_UPPERCASE_FIELD: SLOT" in error for error in validate_policy(2, policy)))
        self.assertTrue(any("FAIL_UNRESOLVED_MERGE_MARKERS" in error for error in validate_snapshot(3, snapshot, self.valid_state(3))))
        self.assertTrue(any("FAIL_UNRESOLVED_MERGE_MARKERS" in error for error in validate_policy(2, render_slot_policy(2), state)))

    def test_missing_or_wrong_policy_fails_closed(self):
        self.assertIn("FAIL_POLICY_RENDER_MISMATCH", validate_policy(2, "", self.valid_state(2)))
        self.assertIn("FAIL_POLICY_STATE_IDENTITY_MISMATCH", validate_policy(2, render_slot_policy(2), self.valid_state(1)))

    def test_policy_cross_slot_reference_fails(self):
        policy = render_slot_policy(1) + "OTHER: coordination/chatgpt-codex-bridge-2\n"
        self.assertTrue(any("FAIL_POLICY_CROSS_SLOT_REFERENCE" in error for error in validate_policy(1, policy)))

    def test_snapshot_must_match_state(self):
        snapshot = "\n".join(("SLOT: 3", "BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-3", "STATUS: AVAILABLE", "CURRENT_THREAD: NONE", "CURRENT_TASK_BRANCH: bridge/3/AVAILABLE"))
        state = "\n".join(("SLOT: 3", "BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-3", "STATUS: AVAILABLE", "THREAD: NONE", "TASK: NONE", "BRANCH_TASK: bridge/3/AVAILABLE"))
        self.assertEqual([], validate_snapshot(3, snapshot, state))
        self.assertIn("FAIL_SNAPSHOT_STATE_STATUS_MISMATCH", validate_snapshot(3, snapshot, state.replace("STATUS: AVAILABLE", "STATUS: READY")))

    def test_available_state_requires_empty_identity(self):
        snapshot = "\n".join(("SLOT: 3", "BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-3", "STATUS: AVAILABLE", "CURRENT_THREAD: task", "CURRENT_TASK_BRANCH: bridge/3/task"))
        state = "\n".join(("SLOT: 3", "BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-3", "STATUS: AVAILABLE", "THREAD: task", "TASK: task", "BRANCH_TASK: bridge/3/task"))
        self.assertIn("FAIL_AVAILABLE_STATE_IDENTITY", validate_snapshot(3, snapshot, state))


if __name__ == "__main__":
    unittest.main()
