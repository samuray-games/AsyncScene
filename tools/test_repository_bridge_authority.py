import unittest
from dataclasses import replace

from tools.repository_bridge_authority import BridgeAuthority, validate_authority, validate_continuation


class RepositoryBridgeAuthorityTests(unittest.TestCase):
    def authority(self, **changes):
        base = BridgeAuthority(
            slot=1, mailbox_ref="coordination/chatgpt-codex-bridge-1", mailbox_head="a" * 40,
            thread_id="BRIDGE-1", task_id="TASK-1", execution_epoch="EPOCH-1", generation=1,
            task_branch="bridge/1/BRIDGE-1", authorized_baseline="b" * 40,
            claim_path=".ai-bridge/claims/BRIDGE-1-claim.md", claim_identity="BRIDGE-1",
            inbox_path=".ai-bridge/inbox/BRIDGE-1.md", inbox_identity="BRIDGE-1",
            authorized_write_scope=("AsyncScene/Web/example.js",), publication_target="bridge/1/BRIDGE-1",
        )
        return replace(base, **changes)

    def assert_code(self, code, authority):
        self.assertTrue(any(code in error for error in validate_authority(authority)), validate_authority(authority))

    def test_valid_current_authority_passes(self):
        self.assertEqual([], validate_authority(self.authority()))

    def test_identity_and_route_fail_closed(self):
        for field, value, code in (
            ("slot", 4, "FAIL_SLOT_IDENTITY"), ("mailbox_ref", "coordination/chatgpt-codex-bridge-2", "FAIL_MAILBOX_REF"),
            ("task_branch", "bridge/2/BRIDGE-1", "FAIL_TASK_BRANCH"), ("authorized_baseline", "bad", "FAIL_AUTHORIZED_BASELINE"),
            ("claim_path", ".ai-bridge/claims/other.md", "FAIL_CLAIM_IDENTITY"), ("inbox_path", ".ai-bridge/inbox/other.md", "FAIL_INBOX_IDENTITY"),
            ("authorized_write_scope", (), "FAIL_EMPTY_WRITE_SCOPE"), ("publication_target", "main", "FAIL_DIRECT_MAIN_PUBLICATION"),
        ):
            with self.subTest(field=field):
                self.assert_code(code, self.authority(**{field: value}))

    def test_cross_slot_and_movement_fail_closed(self):
        self.assert_code("FAIL_CROSS_SLOT_CONTAMINATION", self.authority(authorized_write_scope=("bridge/2/foreign",)))
        self.assertTrue(any("mailbox_head" in e for e in validate_authority(self.authority(), self.authority(mailbox_head="c" * 40))))
        self.assertTrue(any("claim_path" in e for e in validate_authority(self.authority(claim_path=".ai-bridge/claims/BRIDGE-1-new.md"), self.authority())))
        self.assertTrue(any("inbox_path" in e for e in validate_authority(self.authority(inbox_path=".ai-bridge/inbox/BRIDGE-1-new.md"), self.authority())))

    def test_continuation_is_same_thread_and_claim_specific(self):
        authority = self.authority(requires_continuation=True)
        self.assertEqual([], validate_continuation(authority, "CONTINUE", "BRIDGE-1"))
        self.assertTrue(any("FAIL_CONTINUATION_THREAD" in e for e in validate_continuation(authority, "CONTINUE", "OTHER")))
        self.assertTrue(any("FAIL_CONTINUATION_TOKEN" in e for e in validate_continuation(authority, "", "BRIDGE-1")))

    def test_no_continuation_claim_does_not_require_token(self):
        self.assertEqual([], validate_continuation(self.authority(), "", ""))


if __name__ == "__main__":
    unittest.main()
