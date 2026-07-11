import unittest

from tools.bridge_v4_contract import (
    mailbox_ref,
    memory_path,
    task_branch_prefix,
    validate_command,
    validate_cross_slot_immutability,
    validate_publication,
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

    def test_state_cannot_name_other_slot(self):
        state = self.valid_state(1).replace("BRIDGE-20260711-TEST", "BRIDGE-2-FOREIGN")
        errors = validate_state(1, state)
        self.assertTrue(any("FAIL_CROSS_SLOT_STATE" in error for error in errors))

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


if __name__ == "__main__":
    unittest.main()
