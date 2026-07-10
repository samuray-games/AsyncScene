from __future__ import annotations

import copy
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
        "activeIdentity": c.ACTIVE_IDENTITY,
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

    def test_stale_identities_052_through_061_rejected(self):
        for n in range(52, 62):
            candidate = dict(c.ACTIVE_IDENTITY, threadId=f"BRIDGE-20260710-{n:03d}")
            self.assert_rejects(c.validate_identity, candidate)

    def test_generic_identity_comparison_accepts_supplied_active_only(self):
        active = dict(c.ACTIVE_IDENTITY, threadId="BRIDGE-CUSTOM", expectedOutboxPath=".ai-bridge/outbox/BRIDGE-CUSTOM-02-codex.md")
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
            authorizedPaths=[],
            reasonNoSourceDelta="deterministic regeneration produced zero diff",
        )
        # verified-no-delta is schema-distinct but primary-required bridge 062 uses path equality; empty path is rejected.
        self.assert_rejects(c.validate_outbox, payload)
        payload["changedPaths"] = list(c.AUTHORIZED_PATHS)
        payload["authorizedPaths"] = list(c.AUTHORIZED_PATHS)
        c.validate_outbox(payload)

    def test_terminal_tuples_are_exact(self):
        c.validate_terminal_tuple(outbox())
        self.assert_rejects(c.validate_terminal_tuple, outbox(nextActionCode="RETURN_TO_CHATGPT"))
        for illegal in c.ILLEGAL_PRIMARY_REQUIRED_STATUSES:
            self.assert_rejects(c.validate_terminal_tuple, {"status": illegal})

    def test_changed_paths_exact_scope_and_mailbox_absence(self):
        c.validate_changed_paths(list(c.AUTHORIZED_PATHS), list(c.AUTHORIZED_PATHS))
        self.assert_rejects(c.validate_changed_paths, ["AGENTS.md"], list(c.AUTHORIZED_PATHS))
        bad = list(c.AUTHORIZED_PATHS) + [".ai-bridge/outbox/BRIDGE-20260710-062-02-codex.md"]
        self.assert_rejects(c.validate_changed_paths, bad, list(c.AUTHORIZED_PATHS))
        self.assert_rejects(c.validate_main_absence, [".ai-bridge/claims/BRIDGE-20260710-062-claim-v1-codex.md"])

    def test_acceptance_requires_source_and_canary_not_plugin(self):
        self.assertFalse(c.accept_closed_loop_source({"sourceImplementationAccepted": True, "canaryAccepted": False}))
        self.assertFalse(c.accept_closed_loop_source({"sourceImplementationAccepted": False, "canaryAccepted": True}))
        self.assertFalse(c.accept_closed_loop_source({"sourceImplementationAccepted": True, "canaryAccepted": True, "pluginPackageAccepted": True}))
        self.assertTrue(c.accept_closed_loop_source({"sourceImplementationAccepted": True, "canaryAccepted": True, "pluginPackageAccepted": False}))

    def test_unknown_controls_fail_closed(self):
        self.assert_rejects(c.evaluate_control, "unknown", {})

    def test_real_mutation_proofs_cover_evaluator_families(self):
        mutations = []
        bad_identity = copy.deepcopy(c.ACTIVE_IDENTITY); bad_identity["threadId"] = "BRIDGE-20260710-061"
        mutations.append((c.validate_identity, (bad_identity,)))
        mutations.append((c.require_sha, ("ABCDEF0123456789ABCDEF0123456789ABCDEF01", "sha")))
        mutations.append((c.validate_transition, ("CLOSED", "EXECUTING")))
        bad_outbox = outbox(nextActionText="wrong")
        mutations.append((c.validate_outbox, (bad_outbox,)))
        bad_receipt = receipt(outboxPublicationCommit="a" * 40)
        mutations.append((c.validate_receipt, (bad_receipt,)))
        bad_paths = list(c.AUTHORIZED_PATHS); bad_paths[0] = "node_modules/fsevents/package.json"
        mutations.append((c.validate_changed_paths, (bad_paths, list(c.AUTHORIZED_PATHS))))
        mutations.append((c.validate_main_absence, ([c.ACTIVE_IDENTITY["expectedOutboxPath"]],)))
        for func, args in mutations:
            self.assert_rejects(func, *args)

    def test_self_check(self):
        report = c.self_check()
        self.assertEqual(report["contractVersion"], "2.0.0")
        self.assertEqual(report["activeIdentity"]["threadId"], "BRIDGE-20260710-062")


if __name__ == "__main__":
    unittest.main()
