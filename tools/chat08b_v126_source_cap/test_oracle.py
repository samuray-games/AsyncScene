"""R268-01..22 file-backed SQLite oracle acceptance tests, synthetic only."""
from __future__ import annotations

import concurrent.futures
import dataclasses
import multiprocessing
import sqlite3
import tempfile
import threading
import unittest
from pathlib import Path

from oracle import (Candidate, InjectedProof, SyntheticAuthority, ClosingConnection, commit_action,
                    connect, initialize, inner_r01, readback, rows, source_cap)


def worker_submit(path: str, proof: InjectedProof):
    return commit_action(Path(path), proof)


class R268SQLiteAcceptance(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix="r268-standalone-")
        self.addCleanup(self.temp.cleanup)
        self.db=Path(self.temp.name)/"cap.sqlite3"
        initialize(self.db)
        self.auth=SyntheticAuthority(self.db)
        self.p=InjectedProof(npc="npc-A")

    def prepare(self, *, npc="npc-A", event="battle-e1:final", battle="battle-e1",
                candidates=(Candidate(),), grant_epoch=1, allowed=True, system="gameplay"):
        self.assertEqual(self.auth.register_final(event,battle,system),"REGISTERED")
        self.auth.grant(npc,grant_epoch)
        self.auth.effect(npc,event,system)
        for c in candidates:
            self.auth.policy(npc,c.target,allowed)
        self.auth.decide(npc,event,system,candidates)
        return InjectedProof(npc=npc,system=system,event=event,battle=battle,recipient=npc,grant_epoch=grant_epoch)

    def assert_one(self):
        self.assertEqual(rows(self.db),(1,1,1))
        caps,reservations,outbox=readback(self.db)
        self.assertEqual(caps[0][5],reservations[0][9])
        self.assertEqual(caps[0][5],outbox[0][0])
        self.assertEqual(caps[0][6],reservations[0][0])
        self.assertEqual(caps[0][0],reservations[0][1])
        self.assertEqual(caps[0][0],outbox[0][1])
        self.assertEqual(reservations[0][0],outbox[0][2])

    def test_R268_01_one_final_one_action(self):
        p=self.prepare(candidates=(Candidate(action="CHALLENGE_PROPOSAL"),))
        r=commit_action(self.db,p)
        self.assertEqual(r.status,"CONFIRMED")
        self.assertEqual(r.cap,source_cap("npc-A","gameplay","battle-e1:final"))
        self.assertEqual(r.inner,inner_r01("npc-A","human-A","gameplay","battle-e1:final","CHALLENGE_PROPOSAL","rules-v1"))
        self.assert_one()

    def test_R268_02_two_real_finals_independent_caps(self):
        p1=self.prepare()
        p2=self.prepare(event="battle-e2:final",battle="battle-e2")
        self.assertEqual(commit_action(self.db,p1).status,"CONFIRMED")
        self.assertEqual(commit_action(self.db,p2).status,"CONFIRMED")
        self.assertEqual(rows(self.db),(2,2,2))

    def test_R268_03_same_battle_alias_quarantined(self):
        p=self.prepare()
        self.assertEqual(commit_action(self.db,p).status,"CONFIRMED")
        self.assertEqual(self.auth.register_final("battle-e1:final:alias","battle-e1"),"CONFLICT_QUARANTINE")
        self.assertEqual(commit_action(self.db,dataclasses.replace(p,event="battle-e1:final:alias")).status,"DENIED")
        self.assert_one()

    def test_R268_04_two_relays_one_source_cap(self):
        p=self.prepare()
        self.assertEqual(self.auth.register_knowledge(kind="VERIFIED_OUTCOME",relay="direct"),"REGISTERED")
        original=commit_action(self.db,p)
        for relay in ("trusted-relay-1","trusted-relay-2"):
            self.assertEqual(self.auth.register_knowledge(relay=relay),"REGISTERED")
            updated=dataclasses.replace(p,relay=relay,knowledge_key="knowledge-"+relay)
            result=commit_action(self.db,updated)
            self.assertEqual(result.action_id,original.action_id)
            self.assertEqual(result.receipt,original.receipt)
        with connect(self.db) as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM synthetic_knowledge").fetchone()[0],3)
        self.assert_one()

    def test_R268_05_only_heard_claims_no_action(self):
        for relay in ("relay-1","relay-2"):
            self.assertEqual(self.auth.register_knowledge(relay=relay),"REGISTERED")
            p=dataclasses.replace(self.p,kind="HEARD_CLAIM",relay=relay)
            self.assertEqual(commit_action(self.db,p).status,"DENIED")
        self.assertEqual(rows(self.db),(0,0,0))

    def test_R268_06_verified_utterance_and_altered_claim_cannot_promote(self):
        self.prepare()
        self.assertEqual(self.auth.register_knowledge(kind="VERIFIED_UTTERANCE",relay="committed-npc-action"),"REGISTERED")
        self.assertEqual(self.auth.register_knowledge(relay="claim-1",text_digest="legitimate-digest"),"REGISTERED")
        self.assertEqual(self.auth.register_knowledge(relay="claim-1",text_digest="changed-text"),"CONFLICT_QUARANTINE")
        for kind,relay in (("VERIFIED_UTTERANCE","committed-npc-action"),("HEARD_CLAIM","claim-1")):
            p=dataclasses.replace(self.p,kind=kind,relay=relay)
            self.assertEqual(commit_action(self.db,p).status,"DENIED")
        self.assertEqual(rows(self.db),(0,0,0))

    def test_R268_07_new_target_cannot_rearm(self):
        p=self.prepare()
        old=commit_action(self.db,p)
        self.auth.policy(target="human-B",allowed=True)
        with self.assertRaises(sqlite3.IntegrityError):
            self.auth.decide(candidates=(Candidate(target="human-B"),))
        self.assertEqual(commit_action(self.db,p).action_id,old.action_id)
        self.assert_one()

    def test_R268_08_no_tiebreaker_means_no_action(self):
        p=self.prepare(candidates=(Candidate(),Candidate(action="CHALLENGE_PROPOSAL")))
        a=commit_action(self.db,p)
        b=commit_action(self.db,p)
        self.assertEqual(a.status,"NO_ACTION")
        self.assertEqual(b.receipt,a.receipt)
        self.assertEqual(rows(self.db),(1,0,0))

    def test_R268_09_new_rules_cannot_rearm(self):
        p=self.prepare()
        old=commit_action(self.db,p)
        with self.assertRaises(sqlite3.IntegrityError):
            self.auth.decide(candidates=(Candidate(rules="rules-v2"),))
        self.assertEqual(commit_action(self.db,p).action_id,old.action_id)
        self.assert_one()

    def test_R268_10_different_npcs_independent(self):
        p1=self.prepare()
        self.auth.grant("npc-B")
        self.auth.effect("npc-B")
        self.auth.policy("npc-B","human-A")
        self.auth.decide(npc="npc-B")
        p2=dataclasses.replace(p1,npc="npc-B",recipient="npc-B")
        self.assertEqual(commit_action(self.db,p1).status,"CONFIRMED")
        self.assertEqual(commit_action(self.db,p2).status,"CONFIRMED")
        self.assertEqual(rows(self.db),(2,2,2))

    def test_R268_11_revoke_before_commit_no_outbox(self):
        p=self.prepare()
        self.auth.grant(epoch=2,active=False)
        self.assertEqual(commit_action(self.db,p).status,"DENIED")
        self.assertEqual(rows(self.db),(0,0,0))

    def test_R268_12_old_epoch_cannot_confirm_after_regrant(self):
        p=self.prepare(grant_epoch=7)
        self.auth.grant(epoch=8,active=False)
        self.auth.grant(epoch=9,active=True)
        self.assertEqual(commit_action(self.db,p).status,"DENIED")
        self.assertEqual(rows(self.db),(0,0,0))

    def test_R268_13_replay_same_immutable_record(self):
        p=self.prepare()
        a=commit_action(self.db,p)
        before=readback(self.db)
        for i in range(3):
            replay=commit_action(self.db,p)
            self.assertEqual((replay.action_id,replay.receipt),(a.action_id,a.receipt))
        self.assertEqual(readback(self.db),before)
        self.assert_one()

    def test_R268_14_crash_before_commit_no_orphan_reserved(self):
        p=self.prepare()
        with self.assertRaisesRegex(sqlite3.OperationalError,"INJECTED_ABORT"):
            commit_action(self.db,p,injected_abort=True)
        self.assertEqual(rows(self.db),(0,0,0))
        self.assertEqual(commit_action(self.db,p).status,"CONFIRMED")
        self.assert_one()

    def test_R268_15_lost_ack_retry_identical(self):
        p=self.prepare()
        commit_action(self.db,p)  # response deliberately discarded
        after=readback(self.db)
        re=commit_action(self.db,p)
        self.assertEqual(re.status,"ALREADY_CONFIRMED")
        self.assertEqual(readback(self.db),after)
        self.assert_one()

    def test_R268_16_two_process_workers_one_outbox(self):
        p=self.prepare()
        ctx=multiprocessing.get_context("spawn")
        with concurrent.futures.ProcessPoolExecutor(max_workers=2,mp_context=ctx) as pool:
            xs=list(pool.map(worker_submit,[str(self.db)]*2,[p,p]))
        self.assertEqual(sorted(x.status for x in xs),["ALREADY_CONFIRMED","CONFIRMED"])
        self.assertEqual(xs[0].action_id,xs[1].action_id)
        self.assert_one()

    def test_R268_17_competing_actions_no_random_http_winner(self):
        p=self.prepare(candidates=(Candidate(),Candidate(action="CHALLENGE_PROPOSAL",target="human-B")))
        barrier=threading.Barrier(2)
        def task():
            barrier.wait(timeout=5)
            return commit_action(self.db,p)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            x=[pool.submit(task) for _ in range(2)]
            results=[f.result(timeout=15) for f in x]
        self.assertEqual(set(r.status for r in results),{"NO_ACTION","ALREADY_NO_ACTION"})
        self.assertEqual(rows(self.db),(1,0,0))

    def test_R268_18_untrusted_forgery_and_wrong_npc_denied(self):
        p=self.prepare()
        variants=(dataclasses.replace(p,issuer="client"),dataclasses.replace(p,recipient="other"),
                  dataclasses.replace(p,battle="not-the-real-battle"),dataclasses.replace(p,event="fake-final"),
                  dataclasses.replace(p,grant_epoch=99),dataclasses.replace(p,kind="VERIFIED_UTTERANCE"),
                  dataclasses.replace(p,authority_class="NPC_ACTION_DERIVATIVE"))
        for variant in variants:
            self.assertEqual(commit_action(self.db,variant).status,"DENIED")
        self.assertEqual(rows(self.db),(0,0,0))

    def test_R268_19_target_consent_or_policy_denied(self):
        p=self.prepare(allowed=False)
        self.assertEqual(commit_action(self.db,p).status,"NO_ACTION")
        self.assertEqual(rows(self.db),(1,0,0))
        self.auth.policy(allowed=True)
        self.assertEqual(commit_action(self.db,p).status,"ALREADY_NO_ACTION")
        self.assertEqual(rows(self.db),(1,0,0))

    def test_R268_20_cooldown_or_recursive_action_not_trigger(self):
        p=self.prepare()
        self.auth.grant(can_proact=False) # fixture-only current cooldown/rate gate
        self.assertEqual(commit_action(self.db,p).status,"DENIED")
        q=dataclasses.replace(p,kind="VERIFIED_UTTERANCE",authority_class="NPC_ACTION_DERIVATIVE")
        self.assertEqual(commit_action(self.db,q).status,"DENIED")
        self.assertEqual(rows(self.db),(0,0,0))

    def test_R268_21_injected_sql_abort_is_atomic_across_reopen(self):
        p=self.prepare()
        before=readback(self.db)
        with self.assertRaises(sqlite3.OperationalError):
            commit_action(self.db,p,injected_abort=True)
        self.assertEqual(readback(self.db),before)
        self.assertEqual(commit_action(self.db,p).status,"CONFIRMED")
        self.assert_one()

    def test_R268_22_external_rollback_witness_model_fail_closed(self):
        p=self.prepare()
        # Backup predating the committed cap: only authority rows exist.
        backup=Path(self.temp.name)/"backup.sqlite3"
        with connect(self.db) as original, sqlite3.connect(backup, factory=ClosingConnection) as saved:
            original.backup(saved)
        r=commit_action(self.db,p)
        self.assert_one()
        # Model *injected* out-of-band witnessed cap; NOT a running witness service.
        witnessed=frozenset([r.cap])
        restored=Path(self.temp.name)/"restored.sqlite3"
        with sqlite3.connect(backup, factory=ClosingConnection) as old, sqlite3.connect(restored, factory=ClosingConnection) as output:
            old.backup(output)
        self.assertEqual(commit_action(restored,p,external_known_caps=witnessed).status,"STOP_RESTORE_ROLLBACK_DETECTED")
        self.assertEqual(rows(restored),(0,0,0))

    def test_extra_immutable_r01_outbox_rows(self):
        p=self.prepare()
        commit_action(self.db,p)
        with connect(self.db) as db:
            for table in ("source_caps","r01_reservations","action_outbox"):
                with self.assertRaises(sqlite3.DatabaseError):
                    db.execute(f"DELETE FROM {table}")
        self.assert_one()

    def test_extra_inner_key_and_cap_ignores_relay_and_epoch(self):
        base=source_cap("npc-A","gameplay","battle-e1:final")
        self.assertEqual(base,source_cap("npc-A","gameplay","battle-e1:final"))
        self.assertNotEqual(base,source_cap("npc-B","gameplay","battle-e1:final"))
        self.assertNotEqual(base,source_cap("npc-A","gameplay","battle-e2:final"))
        self.assertNotEqual(inner_r01("npc-A","h1","gameplay","e1","PUBLIC_SUPPORT","v1"),
                            inner_r01("npc-A","h2","gameplay","e1","PUBLIC_SUPPORT","v1"))


if __name__=="__main__":
    unittest.main(verbosity=2)
