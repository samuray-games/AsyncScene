from __future__ import annotations

import unittest

import tools.closed_loop_contract as c

GOOD_SHA = "0123456789abcdef0123456789abcdef01234567"
GOOD_SHA2 = "89abcdef0123456789abcdef0123456789abcdef"
GOOD_SHA3 = "13579bdf2468ace013579bdf2468ace013579bdf"
GOOD_SHA4 = "02468ace13579bdf02468ace13579bdf02468ace"


def outbox(**overrides):
    payload = {
        "status": "PASS_PUSHED",
        "completionMode": "PRIMARY_DELTA",
        "phase": "AWAITING_CHATGPT_VERIFICATION",
        "verifierClassification": "SOURCE_IMPLEMENTATION_PENDING_CHATGPT",
        "recoveryClassification": "NONE",
        "nextActionCode": c.SUCCESS_ACTION_CODE,
        "nextActionText": c.SUCCESS_ACTION_TEXT,
        "activeIdentity": dict(c.ACTIVE_IDENTITY),
        "stateBlobSha": GOOD_SHA,
        "mailboxParentCommit": GOOD_SHA2,
        "primaryCommitSha": GOOD_SHA3,
        "primaryParent": c.BASE_COMMIT,
        "changedPaths": list(c.AUTHORIZED_PATHS),
        "authorizedPaths": list(c.AUTHORIZED_PATHS),
        "validationResults": ["py_compile: PASS", "unittest: PASS", "policy: PASS", "diff_check: PASS"],
    }
    payload.update(overrides)
    return payload


def receipt(**overrides):
    payload = outbox()
    payload["outboxPublicationCommit"] = GOOD_SHA4
    payload["outboxBlobSha"] = GOOD_SHA2
    payload.update(overrides)
    return payload


class ClosedLoopContractTest(unittest.TestCase):
    def assert_rejects(self, func, *args, **kwargs):
        with self.assertRaises(ValueError):
            func(*args, **kwargs)

    def test_active_identity_exact_062(self):
        state = c.active_state()
        self.assertEqual(state.threadId, "BRIDGE-20260710-062")
        self.assertEqual(state.generation, 17)
        self.assertEqual(state.baseline, c.BASE_COMMIT)
        c.validate_identity(state)
        with self.assertRaises(TypeError):
            c.ACTIVE_IDENTITY["threadId"] = "BRIDGE-20260710-061"  # type: ignore[index]

    def test_stale_identities_052_through_061_rejected(self):
        for n in range(52, 62):
            candidate = dict(c.ACTIVE_IDENTITY, threadId=f"BRIDGE-20260710-{n:03d}")
            self.assert_rejects(c.validate_identity, candidate)

    def test_generic_identity_comparison_accepts_supplied_active_only(self):
        active = dict(c.ACTIVE_IDENTITY, threadId="BRIDGE-CUSTOM", expectedOutboxPath=".ai-bridge/outbox/BRIDGE-CUSTOM-02-chatgpt.md")
        c.validate_identity(active, active)
        self.assert_rejects(c.validate_identity, c.ACTIVE_IDENTITY, active)

    def test_strict_sha_validation(self):
        c.require_sha(c.BASE_COMMIT, "base")
        for bad in (c.BASE_COMMIT.upper(), "cafebabe" * 5, "deadbeef" * 5, "feedface" * 5, "a" * 40, "b" * 40, "g" * 40):
            self.assert_rejects(c.require_sha, bad, "bad")

    def test_all_legal_and_illegal_transitions_against_oracle(self):
        for current in c.LEGAL_STATES:
            for target in c.LEGAL_STATES:
                if (current, target) in c.TRANSITION_ORACLE:
                    c.validate_transition(current, target)
                else:
                    self.assert_rejects(c.validate_transition, current, target)

    def test_outbox_pre_publication_schema_and_receipt_schema_are_separate(self):
        c.validate_outbox(outbox())
        self.assert_rejects(c.validate_outbox, receipt())
        c.validate_receipt(receipt())
        self.assert_rejects(c.validate_receipt, outbox())

    def test_no_delta_schema_is_distinct(self):
        payload = outbox(
            status="PASS_VERIFIED_NO_DELTA",
            completionMode="VERIFIED_NO_DELTA",
            primaryCommitSha=c.BASE_COMMIT,
            primaryParent="N/A",
            changedPaths=[],
            authorizedPaths=list(c.AUTHORIZED_PATHS),
            reasonNoSourceDelta="deterministic regeneration produced zero diff",
        )
        c.validate_outbox(payload)
        payload["changedPaths"] = list(c.AUTHORIZED_PATHS)
        self.assert_rejects(c.validate_outbox, payload)

    def test_terminal_tuples_are_exact(self):
        c.validate_terminal_tuple(outbox())
        self.assert_rejects(c.validate_terminal_tuple, outbox(nextActionCode="RETURN_TO_CHATGPT"))
        for illegal in c.ILLEGAL_PRIMARY_REQUIRED_STATUSES:
            self.assert_rejects(c.validate_terminal_tuple, {"status": illegal})

    def test_changed_paths_exact_scope_and_mailbox_absence(self):
        c.validate_changed_paths(list(c.AUTHORIZED_PATHS), list(c.AUTHORIZED_PATHS))
        self.assert_rejects(c.validate_changed_paths, ["AGENTS.md"], list(c.AUTHORIZED_PATHS))
        bad = list(c.AUTHORIZED_PATHS) + [".ai-bridge/outbox/BRIDGE-20260710-062-02-chatgpt.md"]
        self.assert_rejects(c.validate_changed_paths, bad, list(c.AUTHORIZED_PATHS))
        self.assert_rejects(c.validate_main_absence, [".ai-bridge/claims/BRIDGE-20260710-062-claim-v1-codex.md"])
        self.assert_rejects(c.validate_main_absence, [], main_tree_paths=[".ai-bridge/STATE.md"], main_commit=c.BASE_COMMIT)

    def test_acceptance_requires_source_and_canary_not_plugin(self):
        self.assertFalse(c.accept_closed_loop_source({"sourceImplementationAccepted": True, "canaryAccepted": False}))
        self.assertFalse(c.accept_closed_loop_source({"sourceImplementationAccepted": False, "canaryAccepted": True}))
        self.assertTrue(c.accept_closed_loop_source({"sourceImplementationAccepted": True, "canaryAccepted": True, "pluginPackageAccepted": True}))
        self.assertTrue(c.accept_closed_loop_source({"sourceImplementationAccepted": True, "canaryAccepted": True, "pluginPackageAccepted": False}))

    def test_unknown_controls_fail_closed(self):
        self.assert_rejects(c.evaluate_control, "unknown", {})

    def test_real_mutation_proofs_cover_evaluator_families(self):
        original = c.LEGAL_TRANSITIONS["CLOSED"]
        try:
            c.LEGAL_TRANSITIONS["CLOSED"] = ("PREPARING", "EXECUTING")
            self.assert_rejects(c.self_check)
        finally:
            c.LEGAL_TRANSITIONS["CLOSED"] = original
        expected = {"identity", "sha", "transition", "outbox", "receipt_separation", "receipt", "path", "main_absence", "terminal_tuple", "acceptance", "cloud_report", "evaluate_control"}
        self.assertEqual(set(c.mutation_proof_matrix()), expected)
        patches = {
            "identity": ("validate_identity", lambda *args, **kwargs: None),
            "sha": ("require_sha", lambda *args, **kwargs: None),
            "transition": ("validate_transition", lambda *args, **kwargs: None),
            "outbox": ("validate_outbox", lambda *args, **kwargs: None),
            "receipt_separation": ("validate_receipt_separation", lambda *args, **kwargs: None),
            "receipt": ("validate_receipt", lambda *args, **kwargs: None),
            "path": ("validate_changed_paths", lambda *args, **kwargs: None),
            "main_absence": ("validate_main_absence", lambda *args, **kwargs: None),
            "terminal_tuple": ("validate_terminal_tuple", lambda *args, **kwargs: None),
            "acceptance": ("accept_closed_loop_source", lambda report: True),
            "cloud_report": ("validate_cloud_execution_report", lambda *args, **kwargs: None),
            "evaluate_control": ("evaluate_control", lambda *args, **kwargs: True),
        }
        for family, (name, replacement) in patches.items():
            original_func = getattr(c, name)
            try:
                setattr(c, name, replacement)
                with self.assertRaises(ValueError):
                    c.mutation_proof_matrix()
            finally:
                setattr(c, name, original_func)


    def test_all_status_specific_outbox_schemas_execute(self):
        status_payloads = {
            "BLOCKED_EXTERNAL": outbox(
                status="BLOCKED_EXTERNAL", completionMode="BLOCKED", phase="BLOCKED_EXTERNAL",
                verifierClassification="BLOCKED", recoveryClassification="EXTERNAL",
                nextActionCode="RESOLVE_EXTERNAL_BLOCKER",
                nextActionText="Resolve the external blocker and rerun the same bridge command.",
                externalBlocker="remote write access unavailable",
            ),
            "BLOCKED_OUTBOX_PUBLICATION": outbox(
                status="BLOCKED_OUTBOX_PUBLICATION", completionMode="PUBLICATION_RECOVERY_REQUIRED", phase="RECOVERY_REQUIRED",
                verifierClassification="FAILED", recoveryClassification="PUBLICATION",
                nextActionCode="REPAIR_OUTBOX_PUBLICATION",
                nextActionText="Repair outbox publication and rerun the same bridge command.",
                publicationFailure="mailbox fast-forward push rejected",
            ),
            "CORRECTION_REQUIRED": outbox(
                status="CORRECTION_REQUIRED", completionMode="CORRECTION_REQUIRED", phase="CORRECTION_REQUIRED",
                verifierClassification="FAILED", recoveryClassification="SOURCE",
                nextActionCode="IMPLEMENT_CORRECTION_AND_RERUN",
                nextActionText="Implement the correction and rerun the same bridge command.",
                correctionRequired="independent review found remaining defects",
            ),
        }
        for status, payload in status_payloads.items():
            c.validate_outbox(payload)
            extra_key_payload = dict(payload, reasonNoSourceDelta="not valid for this status")
            self.assert_rejects(c.validate_outbox, extra_key_payload)

    def test_cloud_execution_report_issue_195_schema_and_head_binding(self):
        report = {
            "threadId": c.ACTIVE_IDENTITY["threadId"],
            "executionEpoch": c.ACTIVE_IDENTITY["executionEpoch"],
            "taskNonce": c.ACTIVE_IDENTITY["taskNonce"],
            "baseCommit": c.BASE_COMMIT,
            "headCommit": GOOD_SHA4,
            "changedPaths": list(c.AUTHORIZED_PATHS),
            "validationResults": {"py_compile": "PASS", "unittest": "PASS", "policy": "PASS", "diff_check": "PASS"},
            "mutationFamiliesTested": sorted(c.mutation_proof_matrix()),
            "protectedPathsChanged": False,
            "mailboxPathsChanged": False,
            "nextActionCode": c.PR_NEXT_ACTION_CODE,
        }
        c.validate_cloud_execution_report(report, expected_head=GOOD_SHA4)
        self.assert_rejects(c.validate_cloud_execution_report, dict(report, validationResults={"py_compile": "PASS"}), expected_head=GOOD_SHA4)
        self.assert_rejects(c.validate_cloud_execution_report, dict(report, headCommit=GOOD_SHA3), expected_head=GOOD_SHA4)
        legacy = dict(report)
        legacy["base"] = legacy.pop("baseCommit")
        self.assert_rejects(c.validate_cloud_execution_report, legacy, expected_head=GOOD_SHA4)

    def test_evaluate_control_main_absence_requires_tree_evidence(self):
        self.assertTrue(c.evaluate_control("main_absence", {"mainCommit": c.BASE_COMMIT}))
        self.assert_rejects(c.evaluate_control, "main_absence", {"mainTreePaths": [], "mainCommit": GOOD_SHA4})
        self.assert_rejects(c.evaluate_control, "main_absence", {"pathsOnMain": []})

    def test_self_check(self):
        report = c.self_check()
        self.assertEqual(report["contractVersion"], "2.0.0")
        self.assertEqual(report["activeIdentity"]["threadId"], "BRIDGE-20260710-062")


if __name__ == "__main__":
    unittest.main()
