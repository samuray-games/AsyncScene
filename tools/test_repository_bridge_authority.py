import unittest
from dataclasses import replace
from tools.repository_bridge_authority import BridgeAuthority, validate_authority, validate_continuation

class BridgeAuthorityTests(unittest.TestCase):
    def a(self, **kw):
        return replace(BridgeAuthority(1,"coordination/chatgpt-codex-bridge-1","a"*40,"T1","TASK1","E1",1,"bridge/1/T1","b"*40,".ai-bridge/claims/T1.md","T1",".ai-bridge/inbox/T1.md","T1",("AsyncScene/Web/x.js",),"branch/1/T1"), **kw)
    def test_valid(self): self.assertEqual([], validate_authority(self.a()))
    def test_wrong_slot_mailbox_branch_baseline(self):
        for f,v,e in (("slot",4,"FAIL_SLOT_IDENTITY"),("mailbox_ref","wrong","FAIL_MAILBOX_REF"),("task_branch","main","FAIL_TASK_BRANCH"),("authorized_baseline","bad","FAIL_AUTHORIZED_BASELINE")):
            self.assertIn(e, validate_authority(self.a(**{f:v})))
    def test_claim_inbox_scope_main_and_cross_slot(self):
        self.assertIn("FAIL_CLAIM_IDENTITY",validate_authority(self.a(claim_path=".ai-bridge/claims/other.md")))
        self.assertIn("FAIL_INBOX_IDENTITY",validate_authority(self.a(inbox_path=".ai-bridge/inbox/other.md")))
        self.assertIn("FAIL_EMPTY_WRITE_SCOPE",validate_authority(self.a(authorized_write_scope=())))
        self.assertIn("FAIL_DIRECT_MAIN_PUBLICATION",validate_authority(self.a(publication_target="main")))
        self.assertIn("FAIL_CROSS_SLOT_CONTAMINATION",validate_authority(self.a(authorized_write_scope=("bridge/2/x",))))
    def test_movement_and_continuation(self):
        self.assertIn("FAIL_AUTHORITY_MOVED: mailbox_head",validate_authority(self.a(),self.a(mailbox_head="c"*40)))
        req=self.a(requires_continuation=True)
        self.assertEqual([],validate_continuation(req,"CONTINUE","T1"))
        self.assertIn("FAIL_CONTINUATION_TOKEN",validate_continuation(req,"","T1"))
        self.assertIn("FAIL_CONTINUATION_THREAD",validate_continuation(req,"CONTINUE","other"))
    def test_non_continuation_needs_no_token(self): self.assertEqual([],validate_continuation(self.a(),"",""))
