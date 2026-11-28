"""Isolated V129 author tests. All positive authorities below are TEST-ONLY HMAC fixtures."""
from __future__ import annotations
import concurrent.futures
import hashlib
import hmac
import json
import pathlib
import shutil
import sqlite3
import sys
import tempfile
import threading
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from bridge import TerminalSeam,Denied,WitnessBlocked,canonical,digest

NOW=1800000060000
TEST_SECRET=b'non-production-synthetic-HMAC-only'
FIXTURE_VERSION='chat05b-deterministic-fixture-v1'


def sign(data):
    return hmac.new(TEST_SECRET,canonical(data).encode(),hashlib.sha256).hexdigest()


def connect(path):
    c=sqlite3.connect(path,isolation_level=None,timeout=10)
    c.execute('PRAGMA foreign_keys=ON')
    c.execute('PRAGMA busy_timeout=10000')
    c.execute('PRAGMA recursive_triggers=OFF')
    return c


def install(c):
    for p in sorted((ROOT/'fixtures/migrations').glob('*.sql')):
        c.executescript(p.read_text())
    c.executescript((ROOT/'fixtures/upstream/v128_candidate.sql').read_text())
    c.executescript((ROOT/'seam.sql').read_text())
    assert c.execute('PRAGMA quick_check').fetchone()[0]=='ok'
    assert not c.execute('PRAGMA foreign_key_check').fetchall()
    return c


def seed(c,*,battle='battle-1',choice='A',closed=True):
    state={'battleId':battle,'version':3,'rulesVersion':'tactical_v1','phase':'revealed',
           'createdAt':100,'deadlineAt':200,
           'participants':{'A':{'id':'person-A'},'B':{'id':'person-B'}},
           'mechanicalOutcome':'DRAW','socialVoteTrigger':'DRAW','events':[]}
    c.execute('INSERT INTO gameplay_battles VALUES(?,?,?,?,?,?,?)',
             (battle,3,'tactical_v1','revealed',canonical(state),100,500))
    for side,person in (('A','person-A'),('B','person-B')):
        c.execute('INSERT OR IGNORE INTO gameplay_persons(person_id,created_at_ms) VALUES(?,?)',(person,100))
        c.execute('INSERT INTO gameplay_battle_persons VALUES(?,?,?)',(battle,side,person))
    vote='vote-'+battle
    c.execute('INSERT INTO gameplay_social_votes(vote_id,battle_id,trigger_reason,status,created_at_ms) VALUES(?,?,?,?,?)',
              (vote,battle,'DRAW','open',NOW-60000))
    c.execute('INSERT INTO gameplay_social_vote_deadlines(vote_id,opened_at_ms,duration_ms,deadline_at_ms,quorum,status) VALUES(?,?,?,?,?,?)',
              (vote,NOW-60000,60000,NOW,3,'open'))
    if closed:
        other='B' if choice=='A' else 'A'
        for slot,pick in ((1,choice),(2,choice),(3,other)):
            c.execute('INSERT INTO gameplay_social_npc_ballots VALUES(?,?,?,?,?)',
                      (vote,slot,FIXTURE_VERSION,pick,NOW))
        c.execute('''UPDATE gameplay_social_vote_deadlines SET status=?,closed_at_ms=?,human_count=?,npc_count=?,count_a=?,count_b=?,final_choice=? WHERE vote_id=?''',
                  ('closed',NOW+1,0,3,2 if choice=='A' else 1,1 if choice=='A' else 2,choice,vote))
    c.execute('INSERT INTO v128_issuer_fixture VALUES(?,?,?,?,?,?)',
              (battle,'FINAL',vote,'synthetic-proof-FINAL',7,NOW+5000))
    c.execute('INSERT INTO v128_issuer_fixture VALUES(?,?,?,?,?,?)',
              (battle,'CANCEL',vote,'synthetic-proof-CANCEL',7,NOW+5000))
    c.execute('INSERT INTO v128_binding_fixture VALUES(?,?,?,?,?,?,?,?)',
              (battle,7,'person-A','person-B',11,12,101,201))
    for person,generation in (('person-A',101),('person-B',201)):
        c.execute('INSERT INTO v128_occupancy_fixture VALUES(?,?,?,?,?)',
                  (person,battle,generation,'ACTIVE',None))
    c.execute('INSERT INTO v128_occupancy_fixture VALUES(?,?,?,?,?)',
              ('person-A','other-battle',999,'ACTIVE',None))
    return state


def bind_state(c,battle):
    r=c.execute('''SELECT battle_generation,side_a_person_id,side_b_person_id,
             side_a_binding_epoch,side_b_binding_epoch,side_a_occupancy_generation,side_b_occupancy_generation
             FROM v128_binding_fixture WHERE battle_id=?''',(battle,)).fetchone()
    if r is None:return None
    return dict(zip(('battle_generation','side_a_person_id','side_b_person_id','side_a_binding_epoch',
                     'side_b_binding_epoch','side_a_occupancy_generation','side_b_occupancy_generation'),r))


def side_state(c,battle):
    r=c.execute('''SELECT d.vote_id,d.status,d.final_choice,d.count_a,d.count_b,
             d.human_count,d.npc_count,d.quorum,d.deadline_at_ms,d.closed_at_ms
             FROM gameplay_social_votes v JOIN gameplay_social_vote_deadlines d ON d.vote_id=v.vote_id
             WHERE v.battle_id=?''',(battle,)).fetchone()
    if r is None:return None
    return dict(zip(('vote_id','status','final_choice','count_a','count_b','human_count',
                     'npc_count','quorum','deadline_at_ms','closed_at_ms'),r))


class TestBinding:
    def verify(self,request,b):
        if not hmac.compare_digest(request.get('binding_signature',''),sign(b)):
            raise Denied('FORGED_BINDING_PROOF')
        return {'verified':True,'digest':digest(b)}


class TestSidecar:
    def verify(self,request,s):
        if not hmac.compare_digest(request.get('sidecar_signature',''),sign(s)):
            raise Denied('FORGED_05B_CLOSED_SIDECAR')
        return {'verified':True,'digest':digest(s)}


class TestIssuer:
    def verify(self,request,context):
        att=request.get('issuer_claim')
        if not isinstance(att,dict) or not hmac.compare_digest(request.get('issuer_signature',''),sign(att)):
            raise Denied('FORGED_TRUSTED_ISSUER')
        proof=att.get('issuer_proof_digest')
        return {**att,'verified':True,'proof_sha256':digest({'issuer_proof_digest':proof,
                                                           'eventId':att.get('canonical_event_id')})}


class TestWitness:
    """Durable fixture in a second SQLite file, NOT an approved independent witness."""
    def __init__(self,path):
        self.path=path
        self.offline=False
        c=connect(self.path)
        c.execute('CREATE TABLE IF NOT EXISTS monotonic_witness (battle_id TEXT PRIMARY KEY,receipt_sha256 TEXT NOT NULL)')
        c.close()
    def get(self,battle_id):
        if self.offline:raise WitnessBlocked('WITNESS_OFFLINE')
        c=connect(self.path)
        try:
            r=c.execute('SELECT receipt_sha256 FROM monotonic_witness WHERE battle_id=?',(battle_id,)).fetchone()
            return r[0] if r else None
        finally:c.close()
    def seal(self,battle_id,receipt_sha256):
        if self.offline:raise WitnessBlocked('WITNESS_OFFLINE')
        c=connect(self.path)
        try:
            c.execute('INSERT OR IGNORE INTO monotonic_witness VALUES(?,?)',(battle_id,receipt_sha256))
        finally:c.close()
        if self.get(battle_id)!=receipt_sha256:raise WitnessBlocked('WITNESS_CONFLICT')
    def verify(self,battle_id,receipt_sha256):
        return self.get(battle_id)==receipt_sha256


def signed_request(c,*,battle='battle-1',kind='FINAL',command=None,event=None,recognized=None,**changes):
    bind=bind_state(c,battle)
    side=side_state(c,battle)
    if bind is None or side is None:raise Denied('MISSING_TEST_FIXTURE')
    event=event or ('event-'+kind.lower())
    command=command or ('command-'+kind.lower())
    if recognized is None and kind=='FINAL':
        recognized={'A':'A_WIN','B':'B_WIN'}.get(side['final_choice'])
    claim={
       'battle_id':battle,'kind':kind,'source_system':'gameplay-server',
       'canonical_event_id':event,'commit_identity':'commit-'+event,
       'command_id':command,'fingerprint':'fingerprint-'+command,
       'issuer_proof_digest':'synthetic-proof-'+kind,'battle_generation':bind['battle_generation'],
       'vote_id':side['vote_id'],'mechanical_outcome':'DRAW','recognized_outcome':recognized,
       'binding_digest':digest(bind),'sidecar_digest':digest(side) if kind=='FINAL' else None,
       'expected_version':3,
    }
    claim.update(changes)
    return dict(battle_id=battle,kind=kind,command_id=command,
                fingerprint=claim['fingerprint'],expected_version=claim['expected_version'],
                binding_signature=sign(bind),sidecar_signature=sign(side),
                issuer_claim=claim,issuer_signature=sign(claim))


TABLES=('v129_seam_commands','v129_terminal_receipts','v128_terminal_proposal',
        'gameplay_command_receipts','gameplay_event_outbox','v128_settlement_intent',
        'v128_vote_terminal_disposition')


def counts(c):return {x:c.execute('SELECT COUNT(*) FROM '+x).fetchone()[0] for x in TABLES}


class SeamTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='05c-v129-')
        self.addCleanup(self.temp.cleanup)
        self.path=pathlib.Path(self.temp.name)/'game.db'
        self.c=install(connect(self.path))
        self.addCleanup(self.c.close)
        self.witness=TestWitness(pathlib.Path(self.temp.name)/'witness.db')
        self.seam=TerminalSeam(self.c,issuer=TestIssuer(),sidecar=TestSidecar(),
                                binding=TestBinding(),witness=self.witness,clock=lambda:NOW+2)

    def test_01_final_one_receipt_one_event_one_intent_two_releases(self):
        seed(self.c)
        x=self.seam.commit(signed_request(self.c))
        self.assertEqual(x['status'],'SEALED_COMMITTED')
        self.assertEqual({k:v for k,v in counts(self.c).items() if k in ('v129_terminal_receipts','gameplay_event_outbox','v128_settlement_intent')},
                         dict(v129_terminal_receipts=1,gameplay_event_outbox=1,v128_settlement_intent=1))
        self.assertEqual(self.c.execute("SELECT COUNT(*) FROM v128_occupancy_fixture WHERE status='RELEASED'").fetchone()[0],2)
        self.assertEqual(self.c.execute("SELECT status FROM v128_occupancy_fixture WHERE battle_id='other-battle'").fetchone()[0],'ACTIVE')
        self.assertEqual(self.witness.get('battle-1'),x['receipt_sha256'])

    def test_02_cancel_one_event_no_settlement_and_two_releases(self):
        seed(self.c,closed=False)
        x=self.seam.commit(signed_request(self.c,kind='CANCEL'))
        self.assertEqual(x['receipt']['recognizedOutcome'],None)
        self.assertEqual(self.c.execute('SELECT COUNT(*) FROM v128_settlement_intent').fetchone()[0],0)
        self.assertEqual(self.c.execute('SELECT COUNT(*) FROM v129_terminal_receipts').fetchone()[0],1)
        self.assertEqual(self.c.execute("SELECT status FROM gameplay_social_vote_deadlines").fetchone()[0],'open')
        self.assertEqual(self.c.execute("SELECT COUNT(*) FROM v128_occupancy_fixture WHERE status='RELEASED'").fetchone()[0],2)

    def test_03_exact_retry_after_lost_ack_reuses_receipt(self):
        seed(self.c)
        p=signed_request(self.c)
        a=self.seam.commit(p)
        b=self.seam.commit(p)
        self.assertEqual(b['status'],'SEALED_REPLAY')
        self.assertEqual(a['receipt_sha256'],b['receipt_sha256'])
        self.assertTrue(all(x==1 for k,x in counts(self.c).items() if k in TABLES[:7]))

    def test_04_fake_issuer_signature_denied_without_writes(self):
        seed(self.c)
        p=signed_request(self.c)
        p['issuer_signature']='0'*64
        with self.assertRaisesRegex(Denied,'FORGED_TRUSTED_ISSUER'):
            self.seam.commit(p)
        self.assertTrue(all(v==0 for v in counts(self.c).values()))

    def test_05_battle_id_receipt_claim_mismatch_denied(self):
        seed(self.c)
        p=signed_request(self.c)
        p['issuer_claim']['battle_id']='other-battle'
        p['issuer_signature']=sign(p['issuer_claim'])
        with self.assertRaisesRegex(Denied,'ISSUER_BATTLE_KIND_MISMATCH'):
            self.seam.commit(p)
        self.assertTrue(all(v==0 for v in counts(self.c).values()))

    def test_06_signed_wrong_recognized_DRAW_vs_A_WIN_denied(self):
        seed(self.c)
        p=signed_request(self.c,recognized='DRAW')
        with self.assertRaisesRegex(Denied,'ISSUER_OUTCOME_MISMATCH'):
            self.seam.commit(p)

    def test_07_non_A_win_B_is_accepted_only_for_real_B_tally(self):
        seed(self.c,choice='B')
        x=self.seam.commit(signed_request(self.c))
        self.assertEqual(x['receipt']['recognizedOutcome'],'B_WIN')

    def test_08_final_before_real_closed_sidecar_denied(self):
        seed(self.c,closed=False)
        with self.assertRaisesRegex(Denied,'CLOSED_SIDECAR_REQUIRED'):
            self.seam.commit(signed_request(self.c))

    def test_09_forged_sidecar_proof_denied(self):
        seed(self.c)
        p=signed_request(self.c);p['sidecar_signature']='f'*64
        with self.assertRaisesRegex(Denied,'FORGED_05B_CLOSED_SIDECAR'):
            self.seam.commit(p)

    def test_10_forged_binding_proof_denied(self):
        seed(self.c)
        p=signed_request(self.c);p['binding_signature']='f'*64
        with self.assertRaisesRegex(Denied,'FORGED_BINDING_PROOF'):
            self.seam.commit(p)

    def test_11_no_second_final_or_cancel_even_new_event(self):
        seed(self.c)
        self.seam.commit(signed_request(self.c))
        before=counts(self.c)
        with self.assertRaises(Denied):self.seam.commit(signed_request(self.c,kind='CANCEL',event='e2',command='c2'))
        with self.assertRaises(Denied):self.seam.commit(signed_request(self.c,event='e3',command='c3'))
        self.assertEqual(before,counts(self.c))

    def test_12_changed_fingerprint_same_command_is_not_a_retry(self):
        seed(self.c)
        self.seam.commit(signed_request(self.c))
        p=signed_request(self.c)
        p['fingerprint']='changed';p['issuer_claim']['fingerprint']='changed'
        p['issuer_signature']=sign(p['issuer_claim'])
        with self.assertRaisesRegex(Denied,'TERMINAL_REPLAY_IDENTITY_CONFLICT'):
            self.seam.commit(p)

    def test_13_changed_event_signed_again_is_not_a_retry(self):
        seed(self.c)
        self.seam.commit(signed_request(self.c))
        with self.assertRaisesRegex(Denied,'TERMINAL_REPLAY_IDENTITY_CONFLICT'):
            self.seam.commit(signed_request(self.c,event='event-other'))

    def test_14_partial_commit_outbox_collision_rolls_back_all(self):
        seed(self.c)
        # conflicting unrelated pre-existing event_id; AFTER trigger fails late
        self.c.execute('INSERT INTO gameplay_event_outbox(event_id,battle_id,version,event_type,payload_json,created_at_ms) VALUES(?,?,?,?,?,?)',
                       ('event-final','battle-1',3,'battle.created','{}',NOW-3))
        previous=counts(self.c)
        with self.assertRaises(sqlite3.IntegrityError):self.seam.commit(signed_request(self.c))
        self.assertEqual(previous,counts(self.c))
        self.assertEqual(self.c.execute("SELECT COUNT(*) FROM v128_occupancy_fixture WHERE status='RELEASED'").fetchone()[0],0)

    def test_15_direct_V128_terminal_requires_trusted_seam(self):
        seed(self.c)
        with self.assertRaisesRegex(sqlite3.IntegrityError,'V129_SEAM_REQUIRED'):
            self.c.execute("INSERT INTO v128_terminal_proposal(battle_id,kind,canonical_event_id) VALUES('battle-1','FINAL','e1')")

    def test_16_insert_fake_receipt_without_terminal_denied(self):
        seed(self.c)
        with self.assertRaises(sqlite3.IntegrityError):
            self.c.execute("INSERT INTO v129_terminal_receipts(battle_id,canonical_event_id,command_id,fingerprint,kind,receipt_json,receipt_sha256,issuer_attestation_sha256,binding_attestation_sha256,commit_identity,source_system,committed_version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                           ('battle-1','e1','c1','fp','FINAL','{}','f'*64,'a'*64,'b'*64,'id','gameplay-server',4))

    def test_17_receipt_and_outbox_are_immutable_even_replace(self):
        seed(self.c);self.seam.commit(signed_request(self.c))
        with self.assertRaises(sqlite3.IntegrityError):
            self.c.execute("UPDATE v129_terminal_receipts SET receipt_sha256=? WHERE battle_id=?",('0'*64,'battle-1'))
        with self.assertRaises(sqlite3.IntegrityError):
            self.c.execute("UPDATE gameplay_command_receipts SET code='OTHER'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.c.execute("INSERT OR REPLACE INTO v129_terminal_receipts SELECT * FROM v129_terminal_receipts")
        with self.assertRaises(sqlite3.IntegrityError):
            self.c.execute("UPDATE gameplay_event_outbox SET event_type='other'")

    def test_18_witness_outage_after_commit_is_fail_closed_but_recoverable(self):
        seed(self.c)
        p=signed_request(self.c)
        real_seal=self.witness.seal
        def refuse(*args):raise WitnessBlocked('TEST_NETWORK_FAIL')
        self.witness.seal=refuse
        with self.assertRaisesRegex(WitnessBlocked,'WITNESS_PENDING_FAIL_CLOSED'):
            self.seam.commit(p)
        self.assertEqual(self.c.execute('SELECT count(*) FROM v129_terminal_receipts').fetchone()[0],1)
        self.witness.seal=real_seal
        second=self.seam.commit(p)
        self.assertEqual(second['status'],'SEALED_REPLAY')
        self.assertEqual(self.c.execute('SELECT count(*) FROM v129_terminal_receipts').fetchone()[0],1)

    def test_19_no_new_commit_when_witness_preflight_unavailable(self):
        seed(self.c)
        self.witness.offline=True
        with self.assertRaises(WitnessBlocked):self.seam.commit(signed_request(self.c))
        self.assertTrue(all(v==0 for v in counts(self.c).values()))

    def test_20_restored_old_snapshot_conflicts_with_external_witness(self):
        seed(self.c)
        self.c.execute('PRAGMA wal_checkpoint(FULL)')
        pre=pathlib.Path(self.temp.name)/'before.sqlite'
        dest=sqlite3.connect(pre)
        try:self.c.backup(dest)
        finally:dest.close()
        p=signed_request(self.c)
        self.seam.commit(p)
        self.c.close()
        shutil.copy2(pre,self.path)
        other=connect(self.path)
        try:
            obj=TerminalSeam(other,issuer=TestIssuer(),sidecar=TestSidecar(),binding=TestBinding(),
                             witness=self.witness,clock=lambda:NOW+2)
            with self.assertRaisesRegex(WitnessBlocked,'ROLLBACK_WITNESS_CONFLICT'):
                obj.commit(p)
        finally:other.close()

    def test_21_authoritative_generation_mismatch_denied(self):
        seed(self.c)
        p=signed_request(self.c,battle_generation=999)
        with self.assertRaisesRegex(Denied,'ISSUER_GENERATION_MISMATCH'):
            self.seam.commit(p)

    def test_22_signed_wrong_vote_id_denied(self):
        seed(self.c)
        p=signed_request(self.c,vote_id='vote-other')
        with self.assertRaisesRegex(Denied,'ISSUER_VOTE_MISMATCH'):
            self.seam.commit(p)

    def test_23_cancel_replay_is_stable_and_never_rewards(self):
        seed(self.c,closed=False)
        p=signed_request(self.c,kind='CANCEL')
        a=self.seam.commit(p)
        b=self.seam.commit(p)
        self.assertEqual(b['status'],'SEALED_REPLAY')
        self.assertEqual(a['receipt_sha256'],b['receipt_sha256'])
        self.assertEqual(self.c.execute('SELECT count(*) FROM v128_settlement_intent').fetchone()[0],0)

    def test_24_concurrent_two_terminal_attempts_only_one_wins(self):
        seed(self.c,closed=True)
        p_final=signed_request(self.c,kind='FINAL')
        p_cancel=signed_request(self.c,kind='CANCEL')
        barrier=threading.Barrier(2)
        def run(p):
            db=connect(self.path)
            try:
                seam=TerminalSeam(db,issuer=TestIssuer(),sidecar=TestSidecar(),binding=TestBinding(),
                                  witness=self.witness,clock=lambda:NOW+2)
                barrier.wait(timeout=5)
                try:return seam.commit(p)['status']
                except (Denied,sqlite3.IntegrityError):return 'CONFLICT'
            finally:db.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            r=list(pool.map(run,[p_final,p_cancel]))
        self.assertEqual(sorted(r),['CONFLICT','SEALED_COMMITTED'])
        self.assertEqual(self.c.execute('SELECT count(*) FROM v129_terminal_receipts').fetchone()[0],1)
        self.assertEqual(self.c.execute('SELECT count(*) FROM gameplay_event_outbox').fetchone()[0],1)
        self.assertEqual(self.c.execute("SELECT COUNT(*) FROM v128_occupancy_fixture WHERE status='RELEASED'").fetchone()[0],2)

    def test_25_v129_midway_receipt_abort_rolls_back_cas_and_effects(self):
        seed(self.c)
        self.c.executescript("""CREATE TRIGGER v129_test_reject_terminal_receipt
        BEFORE INSERT ON v129_terminal_receipts
        BEGIN SELECT RAISE(ABORT,'INJECTED_LATE_RECEIPT_ABORT'); END;""")
        before=counts(self.c)
        with self.assertRaisesRegex(sqlite3.IntegrityError,'INJECTED_LATE_RECEIPT_ABORT'):
            self.seam.commit(signed_request(self.c))
        self.assertEqual(counts(self.c),before)
        self.assertEqual(self.c.execute("SELECT phase FROM gameplay_battles").fetchone()[0],'revealed')
        self.assertEqual(self.c.execute("SELECT COUNT(*) FROM v128_occupancy_fixture WHERE status='RELEASED'").fetchone()[0],0)

    def test_26_generation_release_cannot_precede_authorized_receipt(self):
        seed(self.c)
        with self.assertRaisesRegex(sqlite3.IntegrityError,'V128_UNAUTHORIZED_OCCUPANCY_RELEASE'):
            self.c.execute("UPDATE v128_occupancy_fixture SET status='RELEASED',released_by_event_id='fake' WHERE person_id='person-A' AND battle_id='battle-1'")
        self.assertEqual(self.c.execute("SELECT COUNT(*) FROM v128_occupancy_fixture WHERE status='ACTIVE'").fetchone()[0],3)

    def test_27_alternate_signed_B_WIN_mismatching_A_tally_is_rejected(self):
        seed(self.c,choice='A')
        p=signed_request(self.c,recognized='B_WIN')
        with self.assertRaisesRegex(Denied,'ISSUER_OUTCOME_MISMATCH'):
            self.seam.commit(p)

    def test_28_proof_bound_to_fingerprint_and_event(self):
        seed(self.c)
        p=signed_request(self.c)
        p['issuer_claim']['canonical_event_id']='forged-other'
        with self.assertRaisesRegex(Denied,'FORGED_TRUSTED_ISSUER'):
            self.seam.commit(p)

    def test_29_constructor_never_supplies_default_issuer(self):
        with self.assertRaisesRegex(Denied,'MISSING_TRUSTED_BOUNDARY'):
            TerminalSeam(self.c,issuer=None,sidecar=TestSidecar(),binding=TestBinding(),witness=self.witness,clock=lambda:NOW)

    def test_30_cancel_receipt_rejects_any_direct_economic_intent(self):
        seed(self.c,closed=False)
        self.seam.commit(signed_request(self.c,kind='CANCEL'))
        with self.assertRaisesRegex(sqlite3.IntegrityError,'V128_NO_SETTLEMENT_WITHOUT_FINAL'):
            self.c.execute("INSERT INTO v128_settlement_intent VALUES(?,?,?,?)",('battle-1','event-cancel','settlement-intent:battle-1','f'*64))

    def test_31_one_terminal_receipt_cannot_be_replaced_with_other_digest(self):
        seed(self.c)
        self.seam.commit(signed_request(self.c))
        r=self.c.execute('SELECT * FROM v129_terminal_receipts').fetchone()
        forged=list(r);forged[6]='0'*64
        with self.assertRaises(sqlite3.IntegrityError):
            self.c.execute('INSERT OR REPLACE INTO v129_terminal_receipts VALUES('+','.join('?' for _ in r)+')',forged)

    def test_32_signed_cancel_cannot_claim_A_WIN_reward(self):
        seed(self.c,closed=False)
        p=signed_request(self.c,kind='CANCEL',recognized_outcome='A_WIN')
        with self.assertRaisesRegex(Denied,'ISSUER_OUTCOME_MISMATCH'):
            self.seam.commit(p)

    def test_25_exact_receipt_survives_process_like_reopen(self):
        seed(self.c)
        p=signed_request(self.c)
        a=self.seam.commit(p)
        db=connect(self.path)
        try:
            seam=TerminalSeam(db,issuer=TestIssuer(),sidecar=TestSidecar(),binding=TestBinding(),
                              witness=self.witness,clock=lambda:NOW+2)
            b=seam.commit(p)
            self.assertEqual(b['status'],'SEALED_REPLAY')
            self.assertEqual(a['receipt_sha256'],b['receipt_sha256'])
        finally:db.close()


if __name__=='__main__':unittest.main()
