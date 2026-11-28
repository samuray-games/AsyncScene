"""Run: python3 -m unittest -v test_oracle.py, offline fixture only."""
import concurrent.futures
import os
import shutil
import sqlite3
import tempfile
import unittest
from pathlib import Path
from oracle import Cutset, Denied, SimulatedExternalWitness, raw_process_admit, raw_process_terminal


class TerminalCutset(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path=str(Path(self.tmp.name)/'v126.sqlite')
        self.w=SimulatedExternalWitness()
        self.o=Cutset(self.path,self.w)

    def admit(self,b='E1',a='person:A',c='person:B',r='R1'):
        return self.o.admit(b,a,c,r,trusted=True)

    def finish(self,b='E1',kind='FINAL',proof='trusted-assumed-proof'):
        version,ga,gb=self.o.gens(b)
        return self.o.terminal(b,kind,proof,version,ga,gb,trusted=True)

    def count(self,t): return len(self.o.snapshot()[t])
    def states(self,b='E1'):
        return [r['state'] for r in self.o.snapshot()['reservation'] if r['battle_id']==b]

    def test_01_admission_single_commit_two_seats(self):
        self.assertEqual(self.admit()['code'],'ADMITTED')
        self.assertEqual(self.states(),['ACTIVE','ACTIVE'])
        self.assertEqual(self.count('pair_attempt_history'),1)

    def test_02_two_devices_same_person_busy(self):
        self.admit()
        with self.assertRaisesRegex(Denied,'PERSON_BUSY'): self.admit('E2','person:A','person:C','R2')
        self.assertEqual(self.count('reservation'),2)

    def test_03_e2_participant_busy(self):
        self.admit()
        with self.assertRaisesRegex(Denied,'PERSON_BUSY'): self.admit('E2','person:C','person:B','R2')

    def test_04_other_npc_does_not_bypass_busy(self):
        self.admit('E1','npc:1','person:A')
        with self.assertRaisesRegex(Denied,'PERSON_BUSY'): self.admit('E2','npc:2','person:A','R2')

    def test_05_request_exact_replay(self):
        self.admit()
        self.assertEqual(self.admit()['code'],'REUSED')
        self.assertEqual(self.count('admission_receipt'),1)

    def test_06_request_fingerprint_collision(self):
        self.admit()
        with self.assertRaisesRegex(Denied,'ADMISSION_REQUEST_CONFLICT'):
            self.admit('E2','person:C','person:D','R1')

    def test_07_invalid_same_person_twice(self):
        with self.assertRaisesRegex(Denied,'INVALID_ADMISSION'):
            self.admit('E1','person:A','person:A')
        self.assertEqual(self.count('reservation'),0)

    def test_08_untrusted_admission(self):
        with self.assertRaisesRegex(Denied,'UNTRUSTED_ADMISSION'):
            self.o.admit('E1','a','b','r',trusted=False)
        self.assertEqual(self.count('battle'),0)

    def test_09_parallel_admissions_actual_sqlite_processes(self):
        jobs=[(self.path,f'E{i}', 'shared',f'other:{i}',f'R{i}') for i in range(8)]
        with concurrent.futures.ProcessPoolExecutor(max_workers=4) as ex:
            answers=list(ex.map(raw_process_admit,jobs))
        self.assertEqual(answers.count('ADMITTED'),1)
        snap=self.o.snapshot()
        self.assertEqual(len([r for r in snap['reservation'] if r['state']=='ACTIVE']),2)
        self.assertEqual(len(snap['admission_receipt']),1)
        # raw process runner used DB only; align fake witness with model for readback.
        self.assertNotEqual(snap['metadata'][0]['serial'],self.w.highwater)

    def test_10_two_person_atomic_admission_failure(self):
        self.admit()
        old=self.o.snapshot()
        with self.assertRaises(Denied): self.admit('E2','person:C','person:A','R2')
        self.assertEqual(self.o.snapshot(),old)

    def test_11_no_release_on_nonterminal_signals(self):
        self.admit()
        for signal in ('logout','ui_timeout','lost_connection','vote_close','proposal_expiry',
                       'battle.timed_out','request_review','zone_change','delivery_ack'):
            with self.subTest(signal=signal):
                self.assertEqual(self.o.signal('E1',signal)['code'],'RETAINED')
                self.assertEqual(self.states(),['ACTIVE','ACTIVE'])
        self.assertEqual(self.count('terminal_receipt'),0)

    def test_12_final_releases_both_exact_generations(self):
        self.admit(); g=self.o.gens('E1')
        self.assertEqual(self.finish()['code'],'COMMITTED')
        self.assertEqual(self.states(),['RELEASED','RELEASED'])
        self.assertEqual(self.o.gens('E1'),(g[0]+1,g[1],g[2]))

    def test_13_cancel_releases_both_without_result(self):
        self.admit()
        self.assertEqual(self.finish(kind='CANCELLED')['code'],'COMMITTED')
        self.assertEqual(self.states(),['RELEASED','RELEASED'])
        self.assertEqual(self.count('final_result_marker'),0)

    def test_14_final_result_marker_once(self):
        self.admit(); self.finish()
        self.assertEqual(self.count('final_result_marker'),1)
        self.assertEqual(self.count('terminal_receipt'),1)

    def test_15_final_exact_replay(self):
        self.admit(); gen=self.o.gens('E1'); a=self.finish()
        b=self.o.terminal('E1','FINAL','trusted-assumed-proof',*gen,trusted=True)
        self.assertEqual((b['code'],b['receipt_id']),('REUSED',a['receipt_id']))
        self.assertEqual(self.count('event_outbox'),2)

    def test_16_cancel_exact_replay(self):
        self.admit();gen=self.o.gens('E1');a=self.finish(kind='CANCELLED')
        b=self.o.terminal('E1','CANCELLED','trusted-assumed-proof',*gen,trusted=True)
        self.assertEqual(b['receipt_id'],a['receipt_id'])
        self.assertEqual(self.count('terminal_receipt'),1)

    def test_17_final_then_cancel_xor(self):
        self.admit();g=self.o.gens('E1');self.finish()
        with self.assertRaisesRegex(Denied,'FINAL_XOR_CANCEL_CONFLICT'):
            self.o.terminal('E1','CANCELLED','other-proof',*g,trusted=True)
        self.assertEqual(self.count('final_result_marker'),1)

    def test_18_cancel_then_final_xor(self):
        self.admit();g=self.o.gens('E1');self.finish(kind='CANCELLED')
        with self.assertRaisesRegex(Denied,'FINAL_XOR_CANCEL_CONFLICT'):
            self.o.terminal('E1','FINAL','other-proof',*g,trusted=True)
        self.assertEqual(self.count('final_result_marker'),0)

    def test_19_same_kind_different_evidence_conflict(self):
        self.admit();g=self.o.gens('E1');self.finish()
        with self.assertRaisesRegex(Denied,'FINAL_XOR_CANCEL_CONFLICT'):
            self.o.terminal('E1','FINAL','different',*g,trusted=True)

    def test_20_untrusted_final_rejected(self):
        self.admit();g=self.o.gens('E1')
        with self.assertRaisesRegex(Denied,'UNTRUSTED_TERMINAL'):
            self.o.terminal('E1','FINAL','fake',*g,trusted=False)
        self.assertEqual(self.states(),['ACTIVE','ACTIVE'])

    def test_21_untrusted_cancel_rejected(self):
        self.admit();g=self.o.gens('E1')
        with self.assertRaisesRegex(Denied,'UNTRUSTED_TERMINAL'):
            self.o.terminal('E1','CANCELLED','fake',*g,trusted=False)

    def test_22_wrong_version_no_release(self):
        self.admit();_,a,b=self.o.gens('E1')
        with self.assertRaisesRegex(Denied,'TERMINAL_VERSION_OR_GENERATION_CONFLICT'):
            self.o.terminal('E1','FINAL','proof',9,a,b,trusted=True)
        self.assertEqual(self.states(),['ACTIVE','ACTIVE'])

    def test_23_wrong_generation_no_release(self):
        self.admit();v,a,b=self.o.gens('E1')
        with self.assertRaisesRegex(Denied,'TERMINAL_VERSION_OR_GENERATION_CONFLICT'):
            self.o.terminal('E1','FINAL','proof',v,a,b+1,trusted=True)
        self.assertEqual(self.states(),['ACTIVE','ACTIVE'])

    def test_24_one_missing_seat_rolls_back(self):
        self.admit();v,a,b=self.o.gens('E1')
        with sqlite3.connect(self.path) as c: c.execute("DELETE FROM reservation WHERE person_id='person:B'")
        old=self.o.snapshot()
        with self.assertRaisesRegex(Denied,'EXACT_TWO_ACTIVE_REQUIRED'):
            self.o.terminal('E1','FINAL','proof',v,a,b,trusted=True)
        self.assertEqual(self.o.snapshot(),old)

    def test_25_fail_after_first_seat_is_full_rollback(self):
        self.admit();v,a,b=self.o.gens('E1');old=self.o.snapshot()
        with self.assertRaisesRegex(Denied,'INJECTED_MID_RELEASE_FAILURE'):
            self.o.terminal('E1','FINAL','proof',v,a,b,trusted=True,fail_after_first=True)
        self.assertEqual(self.o.snapshot(),old)

    def test_26_outbox_collision_rolls_back_both_releases(self):
        self.admit();v,a,b=self.o.gens('E1')
        with sqlite3.connect(self.path) as c: c.execute("INSERT INTO event_outbox VALUES ('E1:terminal','E1','SYNTHETIC_CONFLICT')")
        old=self.o.snapshot()
        with self.assertRaises(Denied):self.o.terminal('E1','FINAL','proof',v,a,b,trusted=True)
        self.assertEqual(self.o.snapshot(),old)

    def test_27_stale_cancel_cannot_unlock_next_generation(self):
        self.admit();g=self.o.gens('E1');self.finish(kind='CANCELLED')
        self.admit('E2','person:A','person:C','R2')
        before=self.o.snapshot()
        self.assertEqual(self.o.gens('E2')[1],g[1]+1)
        self.assertEqual(self.o.terminal('E1','CANCELLED','trusted-assumed-proof',*g,trusted=True)['code'],'REUSED')
        self.assertEqual(self.o.snapshot(),before)
        self.assertEqual(self.states('E2'),['ACTIVE','ACTIVE'])

    def test_28_stale_wrong_cancel_conflicts_after_reuse(self):
        self.admit();g=self.o.gens('E1');self.finish(kind='CANCELLED')
        self.admit('E2','person:A','person:C','R2');_,x,y=self.o.gens('E2')
        with self.assertRaisesRegex(Denied,'FINAL_XOR_CANCEL_CONFLICT'):
            self.o.terminal('E1','CANCELLED','fake-new-proof',g[0],x,y,trusted=True)
        self.assertEqual(self.states('E2'),['ACTIVE','ACTIVE'])

    def test_29_new_battle_requires_new_explicit_server_admission(self):
        self.admit();self.finish()
        self.assertEqual(self.count('battle'),1)
        self.admit('E2','person:A','person:B','R2')
        self.assertEqual(self.states('E2'),['ACTIVE','ACTIVE'])
        self.assertEqual(self.o.gens('E2')[1:],(2,2))

    def test_30_final_retains_pair_history(self):
        self.admit();old=self.o.snapshot()['pair_attempt_history'];self.finish()
        self.assertEqual(self.o.snapshot()['pair_attempt_history'],old)

    def test_31_cancel_retains_pair_anti_farm(self):
        self.admit();old=self.o.snapshot()['pair_attempt_history'];self.finish(kind='CANCELLED')
        self.assertEqual(self.o.snapshot()['pair_attempt_history'],old)

    def test_32_cancel_retains_cooldown_newbie(self):
        self.o.seed_history('C1','person:A','cooldown');self.o.seed_history('N1','person:B','newbie')
        self.admit();s=self.o.snapshot();self.finish(kind='CANCELLED');t=self.o.snapshot()
        self.assertEqual((s['cooldown_history'],s['newbie_history']),
                         (t['cooldown_history'],t['newbie_history']))

    def test_33_rollback_aborted_terminal_keeps_history(self):
        self.admit();old=self.o.snapshot();v,a,b=self.o.gens('E1')
        with self.assertRaises(Denied):
            self.o.terminal('E1','CANCELLED','proof',v,a,b,trusted=True,fail_after_first=True)
        self.assertEqual(self.o.snapshot(),old)

    def test_34_restart_and_lost_ack_replay(self):
        self.admit();g=self.o.gens('E1');done=self.finish()
        reopened=Cutset(self.path,self.w)
        again=reopened.terminal('E1','FINAL','trusted-assumed-proof',*g,trusted=True)
        self.assertEqual(again['receipt_id'],done['receipt_id'])
        self.assertEqual(reopened.snapshot(),self.o.snapshot())

    def test_35_restart_replay_does_not_reset_anti_farm(self):
        self.admit();self.finish(kind='CANCELLED')
        reopened=Cutset(self.path,self.w)
        self.assertEqual(len(reopened.snapshot()['pair_attempt_history']),1)
        reopened.admit('E2','person:A','person:B','R2',trusted=True)
        self.assertEqual(len(reopened.snapshot()['pair_attempt_history']),2)

    def test_36_missing_witness_fail_closed(self):
        oracle=Cutset(self.path,None)
        with self.assertRaisesRegex(Denied,'STOP_NO_INDEPENDENT_HIGHWATER_WITNESS'):
            oracle.admit('E1','a','b','R',trusted=True)

    def test_37_restored_old_snapshot_quarantine(self):
        self.admit();backup=str(Path(self.tmp.name)/'prior.sqlite')
        shutil.copyfile(self.path,backup)
        self.finish(); self.assertEqual(self.w.highwater,2)
        shutil.copyfile(backup,self.path)
        restored=Cutset(self.path,self.w)
        with self.assertRaisesRegex(Denied,'QUARANTINE_HIGHWATER_MISMATCH'):
            restored.admit('E2','person:C','person:D','R2',trusted=True)
        self.assertEqual(self.states(),['ACTIVE','ACTIVE'])

    def test_38_witness_ahead_blocks_all_terminal(self):
        self.admit(); self.w.highwater+=1;g=self.o.gens('E1')
        with self.assertRaisesRegex(Denied,'QUARANTINE_HIGHWATER_MISMATCH'):
            self.o.terminal('E1','CANCELLED','proof',*g,trusted=True)

    def test_39_witness_behind_blocks_all_admissions(self):
        self.admit();self.w.highwater=0
        with self.assertRaisesRegex(Denied,'QUARANTINE_HIGHWATER_MISMATCH'):
            self.admit('E2','person:C','person:D','R2')

    def test_40_two_processes_final_vs_cancel_cas(self):
        self.admit(); g=self.o.gens('E1')
        jobs=[(self.path,'E1','FINAL','final-proof',*g),
              (self.path,'E1','CANCELLED','cancel-proof',*g)]
        with concurrent.futures.ProcessPoolExecutor(max_workers=2) as ex:
            answers=list(ex.map(raw_process_terminal,jobs))
        self.assertEqual(answers.count('REJECTED'),1)
        self.assertEqual(len([x for x in answers if x in ('FINAL','CANCELLED')]),1)
        snap=self.o.snapshot()
        self.assertEqual(len(snap['terminal_receipt']),1)
        self.assertEqual(len([r for r in snap['reservation'] if r['state']=='RELEASED']),2)
        self.assertEqual(len(snap['event_outbox']),2)
        self.assertEqual(len(snap['final_result_marker']),1 if 'FINAL' in answers else 0)

    def test_41_two_processes_duplicate_final_single_receipt(self):
        self.admit(); g=self.o.gens('E1')
        jobs=[(self.path,'E1','FINAL','same-proof',*g)]*2
        with concurrent.futures.ProcessPoolExecutor(max_workers=2) as ex:
            answers=list(ex.map(raw_process_terminal,jobs))
        self.assertEqual(sorted(answers),['FINAL','REJECTED'])
        self.assertEqual(self.count('terminal_receipt'),1)

    def test_42_untrusted_admission_replay_no_receipt_disclosure(self):
        self.admit()
        with self.assertRaisesRegex(Denied,'UNTRUSTED_ADMISSION'):
            self.o.admit('E1','person:A','person:B','R1',trusted=False)

    def test_43_untrusted_final_replay_no_receipt_disclosure(self):
        self.admit(); g=self.o.gens('E1'); self.finish()
        with self.assertRaisesRegex(Denied,'UNTRUSTED_TERMINAL'):
            self.o.terminal('E1','FINAL','trusted-assumed-proof',*g,trusted=False)

    def test_44_attested_receipt_is_still_assumption(self):
        # Synthetic trust flag is trivially settable by a caller: this test
        # intentionally proves the MODEL CANNOT authenticate a real issuer.
        self.admit()
        self.assertEqual(self.finish(proof='unverified-injected-string')['code'],'COMMITTED')
        self.assertEqual(self.count('terminal_receipt'),1)

if __name__=='__main__':unittest.main()
