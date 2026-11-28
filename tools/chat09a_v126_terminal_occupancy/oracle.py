"""Isolated SQLite NEGATIVE ORACLE. Synthetic trust inputs, no server wiring.

Both admission (two person-wide reservations) and terminal (FINAL xor CANCEL,
exact generation release for both people, receipt/outbox) are *single SQLite
statements* through INSTEAD-OF INSERT triggers. This is NOT D1/Worker proof.
"""
import hashlib
import json
import sqlite3
from dataclasses import dataclass


def digest(*values):
    return hashlib.sha256(json.dumps(values, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


SCHEMA = r'''
PRAGMA foreign_keys=ON;
CREATE TABLE metadata (one INTEGER PRIMARY KEY CHECK(one=1), serial INTEGER NOT NULL);
INSERT INTO metadata VALUES (1,0);
CREATE TABLE person_clock (person_id TEXT PRIMARY KEY, generation INTEGER NOT NULL CHECK(generation>=1));
CREATE TABLE battle (
 battle_id TEXT PRIMARY KEY, person_a TEXT NOT NULL, person_b TEXT NOT NULL,
 gen_a INTEGER NOT NULL, gen_b INTEGER NOT NULL,
 version INTEGER NOT NULL DEFAULT 0, state TEXT NOT NULL DEFAULT 'ACTIVE'
 CHECK(state IN ('ACTIVE','FINAL','CANCELLED')),
 CHECK(person_a <> person_b)
);
CREATE TABLE reservation (
 person_id TEXT NOT NULL, generation INTEGER NOT NULL, battle_id TEXT NOT NULL
 REFERENCES battle(battle_id) ON DELETE RESTRICT,
 state TEXT NOT NULL CHECK(state IN ('ACTIVE','RELEASED')),
 released_kind TEXT, released_receipt TEXT,
 PRIMARY KEY(person_id,generation), UNIQUE(battle_id,person_id)
);
CREATE UNIQUE INDEX one_person_wide_active ON reservation(person_id) WHERE state='ACTIVE';
CREATE TABLE admission_receipt (
 request_id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL,
 battle_id TEXT NOT NULL UNIQUE REFERENCES battle(battle_id) ON DELETE RESTRICT,
 code TEXT NOT NULL DEFAULT 'ADMITTED'
);
CREATE TABLE pair_attempt_history (
 battle_id TEXT PRIMARY KEY REFERENCES battle(battle_id) ON DELETE RESTRICT,
 person_low TEXT NOT NULL, person_high TEXT NOT NULL,
 kind TEXT NOT NULL DEFAULT 'ADMISSION_ATTEMPT'
);
CREATE TRIGGER pair_history_no_delete BEFORE DELETE ON pair_attempt_history BEGIN SELECT RAISE(ABORT, 'IMMUTABLE_HISTORY'); END;
CREATE TRIGGER pair_history_no_update BEFORE UPDATE ON pair_attempt_history BEGIN SELECT RAISE(ABORT, 'IMMUTABLE_HISTORY'); END;
CREATE TABLE cooldown_history (
 event_id TEXT PRIMARY KEY, person_id TEXT NOT NULL, marker TEXT NOT NULL
);
CREATE TRIGGER cooldown_no_delete BEFORE DELETE ON cooldown_history BEGIN SELECT RAISE(ABORT,'IMMUTABLE_COOLDOWN'); END;
CREATE TRIGGER cooldown_no_update BEFORE UPDATE ON cooldown_history BEGIN SELECT RAISE(ABORT,'IMMUTABLE_COOLDOWN'); END;
CREATE TABLE newbie_history (
 event_id TEXT PRIMARY KEY, person_id TEXT NOT NULL, marker TEXT NOT NULL
);
CREATE TRIGGER newbie_no_delete BEFORE DELETE ON newbie_history BEGIN SELECT RAISE(ABORT,'IMMUTABLE_NEWBIE'); END;
CREATE TRIGGER newbie_no_update BEFORE UPDATE ON newbie_history BEGIN SELECT RAISE(ABORT,'IMMUTABLE_NEWBIE'); END;
CREATE TABLE terminal_receipt (
 battle_id TEXT PRIMARY KEY REFERENCES battle(battle_id) ON DELETE RESTRICT,
 kind TEXT NOT NULL CHECK(kind IN ('FINAL','CANCELLED')),
 proof_id TEXT NOT NULL, fingerprint TEXT NOT NULL,
 receipt_id TEXT NOT NULL UNIQUE
);
CREATE TABLE final_result_marker (
 battle_id TEXT PRIMARY KEY REFERENCES terminal_receipt(battle_id) ON DELETE RESTRICT,
 proof_id TEXT NOT NULL
);
CREATE TABLE event_outbox (
 event_id TEXT PRIMARY KEY,
 battle_id TEXT NOT NULL REFERENCES battle(battle_id) ON DELETE RESTRICT,
 kind TEXT NOT NULL
);
CREATE VIEW v_admit AS SELECT
 NULL battle_id,NULL request_id,NULL fingerprint,NULL person_a,NULL person_b,NULL synthetic_preflight WHERE 0;
CREATE TRIGGER admit_pair INSTEAD OF INSERT ON v_admit BEGIN
 SELECT CASE WHEN NEW.synthetic_preflight IS NOT 1 THEN RAISE(ABORT,'UNTRUSTED_ADMISSION') END;
 SELECT CASE WHEN typeof(NEW.battle_id)!='text' OR length(NEW.battle_id)=0 OR
  typeof(NEW.request_id)!='text' OR length(NEW.request_id)=0 OR
  typeof(NEW.fingerprint)!='text' OR length(NEW.fingerprint)!=64 OR
  typeof(NEW.person_a)!='text' OR length(NEW.person_a)=0 OR
  typeof(NEW.person_b)!='text' OR length(NEW.person_b)=0 OR
  NEW.person_a=NEW.person_b THEN RAISE(ABORT,'INVALID_ADMISSION') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM reservation WHERE person_id IN (NEW.person_a,NEW.person_b) AND state='ACTIVE')
  THEN RAISE(ABORT,'PERSON_BUSY') END;
 INSERT INTO person_clock(person_id,generation) VALUES(NEW.person_a,1)
  ON CONFLICT(person_id) DO UPDATE SET generation=generation+1;
 INSERT INTO person_clock(person_id,generation) VALUES(NEW.person_b,1)
  ON CONFLICT(person_id) DO UPDATE SET generation=generation+1;
 INSERT INTO battle(battle_id,person_a,person_b,gen_a,gen_b)
 SELECT NEW.battle_id,NEW.person_a,NEW.person_b,
  (SELECT generation FROM person_clock WHERE person_id=NEW.person_a),
  (SELECT generation FROM person_clock WHERE person_id=NEW.person_b);
 INSERT INTO reservation(person_id,generation,battle_id,state)
 SELECT person_a,gen_a,battle_id,'ACTIVE' FROM battle WHERE battle_id=NEW.battle_id;
 INSERT INTO reservation(person_id,generation,battle_id,state)
 SELECT person_b,gen_b,battle_id,'ACTIVE' FROM battle WHERE battle_id=NEW.battle_id;
 INSERT INTO admission_receipt(request_id,fingerprint,battle_id) VALUES(NEW.request_id,NEW.fingerprint,NEW.battle_id);
 INSERT INTO pair_attempt_history(battle_id,person_low,person_high)
 VALUES (NEW.battle_id, min(NEW.person_a,NEW.person_b), max(NEW.person_a,NEW.person_b));
 INSERT INTO event_outbox VALUES(NEW.battle_id||':admitted',NEW.battle_id,'ADMITTED');
 UPDATE metadata SET serial=serial+1 WHERE one=1;
END;
CREATE VIEW v_terminal AS SELECT
 NULL battle_id,NULL kind,NULL proof_id,NULL fingerprint,NULL receipt_id,
 NULL expected_version,NULL gen_a,NULL gen_b,NULL synthetic_trust,NULL fail_after_first WHERE 0;
CREATE TRIGGER terminal_cas INSTEAD OF INSERT ON v_terminal BEGIN
 SELECT CASE WHEN NEW.synthetic_trust IS NOT 1 THEN RAISE(ABORT,'UNTRUSTED_TERMINAL') END;
 SELECT CASE WHEN NEW.kind NOT IN ('FINAL','CANCELLED') OR NEW.proof_id IS NULL OR length(NEW.proof_id)=0
  OR NEW.fingerprint IS NULL OR length(NEW.fingerprint)!=64 OR
  NEW.receipt_id IS NULL OR length(NEW.receipt_id)=0
  THEN RAISE(ABORT,'INVALID_TERMINAL') END;
 SELECT CASE WHEN NOT EXISTS (
   SELECT 1 FROM battle WHERE battle_id=NEW.battle_id AND state='ACTIVE' AND version=NEW.expected_version
     AND gen_a=NEW.gen_a AND gen_b=NEW.gen_b
   ) THEN RAISE(ABORT,'TERMINAL_VERSION_OR_GENERATION_CONFLICT') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM terminal_receipt WHERE battle_id=NEW.battle_id)
   THEN RAISE(ABORT,'TERMINAL_ALREADY_COMMITTED') END;
 SELECT CASE WHEN (
  SELECT count(*) FROM reservation r JOIN battle b ON b.battle_id=r.battle_id
  WHERE b.battle_id=NEW.battle_id AND r.state='ACTIVE' AND
   ((r.person_id=b.person_a AND r.generation=NEW.gen_a) OR
    (r.person_id=b.person_b AND r.generation=NEW.gen_b))
 )!=2 THEN RAISE(ABORT,'EXACT_TWO_ACTIVE_REQUIRED') END;
 UPDATE reservation SET state='RELEASED', released_kind=NEW.kind, released_receipt=NEW.receipt_id
 WHERE state='ACTIVE' AND person_id=(SELECT person_a FROM battle WHERE battle_id=NEW.battle_id)
  AND battle_id=NEW.battle_id AND generation=NEW.gen_a;
 SELECT CASE WHEN changes()!=1 THEN RAISE(ABORT,'FIRST_RELEASE_CAS_FAILED') END;
 SELECT CASE WHEN NEW.fail_after_first IS 1 THEN RAISE(ABORT,'INJECTED_MID_RELEASE_FAILURE') END;
 UPDATE reservation SET state='RELEASED', released_kind=NEW.kind, released_receipt=NEW.receipt_id
 WHERE state='ACTIVE' AND person_id=(SELECT person_b FROM battle WHERE battle_id=NEW.battle_id)
  AND battle_id=NEW.battle_id AND generation=NEW.gen_b;
 SELECT CASE WHEN changes()!=1 THEN RAISE(ABORT,'SECOND_RELEASE_CAS_FAILED') END;
 SELECT CASE WHEN (SELECT count(*) FROM reservation WHERE battle_id=NEW.battle_id
  AND state='RELEASED' AND released_receipt=NEW.receipt_id)!=2
  THEN RAISE(ABORT,'PAIR_RELEASE_COUNT_MISMATCH') END;
 UPDATE battle SET state=NEW.kind,version=version+1 WHERE battle_id=NEW.battle_id AND state='ACTIVE'
  AND version=NEW.expected_version;
 SELECT CASE WHEN changes()!=1 THEN RAISE(ABORT,'BATTLE_TERMINAL_CAS_FAILED') END;
 INSERT INTO terminal_receipt VALUES(NEW.battle_id,NEW.kind,NEW.proof_id,NEW.fingerprint,NEW.receipt_id);
 INSERT INTO event_outbox VALUES(NEW.battle_id||':terminal', NEW.battle_id, NEW.kind);
 INSERT INTO final_result_marker(battle_id,proof_id)
 SELECT NEW.battle_id,NEW.proof_id WHERE NEW.kind='FINAL';
 UPDATE metadata SET serial=serial+1 WHERE one=1;
END;
'''

class Denied(Exception):
    pass

@dataclass
class SimulatedExternalWitness:
    # Deliberately NOT durable or attested: only a controllable negative witness.
    highwater: int = 0


class Cutset:
    def __init__(self, path, witness):
        self.path, self.witness = path, witness
        c=self._connect()
        c.executescript(SCHEMA) if not self._existing(c) else None
        c.close()

    @staticmethod
    def _existing(c):
        return c.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='metadata'").fetchone()[0] > 0

    def _connect(self):
        c=sqlite3.connect(self.path, timeout=15, isolation_level=None)
        c.execute('PRAGMA foreign_keys=ON')
        c.execute('PRAGMA busy_timeout=15000')
        c.row_factory=sqlite3.Row
        return c

    def _guard(self,c):
        if self.witness is None or not isinstance(self.witness,SimulatedExternalWitness):
            raise Denied('STOP_NO_INDEPENDENT_HIGHWATER_WITNESS')
        serial=c.execute('SELECT serial FROM metadata WHERE one=1').fetchone()['serial']
        if serial != self.witness.highwater:
            raise Denied('QUARANTINE_HIGHWATER_MISMATCH')

    def _transaction(self, operation):
        c=self._connect()
        try:
            c.execute('BEGIN IMMEDIATE')
            self._guard(c)
            result=operation(c)
            seq=c.execute('SELECT serial FROM metadata WHERE one=1').fetchone()['serial']
            c.execute('COMMIT')
            # Simulated external publication after SQL commit: NOT crash-atomic across stores.
            self.witness.highwater=seq
            return result
        except (sqlite3.IntegrityError,sqlite3.OperationalError) as e:
            c.execute('ROLLBACK')
            raise Denied(str(e)) from e
        except Exception:
            c.execute('ROLLBACK')
            raise
        finally:
            c.close()

    def admit(self,battle_id,person_a,person_b,request_id,*,trusted=False):
        fp=digest('admit/v126',battle_id,person_a,person_b,request_id)
        def op(c):
            if not trusted: raise Denied('UNTRUSTED_ADMISSION')
            old=c.execute('SELECT * FROM admission_receipt WHERE request_id=?',(request_id,)).fetchone()
            if old:
                if old['fingerprint']!=fp or old['battle_id']!=battle_id:
                    raise Denied('ADMISSION_REQUEST_CONFLICT')
                return {'code':'REUSED','battle_id':old['battle_id']}
            c.execute('INSERT INTO v_admit VALUES (?,?,?,?,?,?)',(battle_id,request_id,fp,person_a,person_b,1))
            return {'code':'ADMITTED','battle_id':battle_id}
        return self._transaction(op)

    def terminal(self,battle_id,kind,proof_id,expected_version,gen_a,gen_b,
                 *,trusted=False,fail_after_first=False):
        fp=digest('terminal/v126',battle_id,kind,proof_id,expected_version,gen_a,gen_b)
        receipt_id='term:'+battle_id+':'+fp[:20]
        def op(c):
            if not trusted: raise Denied('UNTRUSTED_TERMINAL')
            old=c.execute('SELECT * FROM terminal_receipt WHERE battle_id=?',(battle_id,)).fetchone()
            if old:
                if old['kind']==kind and old['fingerprint']==fp and old['proof_id']==proof_id:
                    return {'code':'REUSED','receipt_id':old['receipt_id'],'kind':old['kind']}
                raise Denied('FINAL_XOR_CANCEL_CONFLICT')
            c.execute('INSERT INTO v_terminal VALUES(?,?,?,?,?,?,?,?,?,?)',
                      (battle_id,kind,proof_id,fp,receipt_id,expected_version,gen_a,gen_b,1,int(fail_after_first)))
            return {'code':'COMMITTED','receipt_id':receipt_id,'kind':kind}
        return self._transaction(op)

    def signal(self,battle_id,signal):
        # No trusted event => no release API path. Requests are recorded nowhere.
        if signal not in ('logout','ui_timeout','lost_connection','vote_close','proposal_expiry',
                          'battle.timed_out','request_review','zone_change','delivery_ack'):
            raise Denied('UNRECOGNIZED_SIGNAL')
        def op(c):
            if not c.execute('SELECT 1 FROM battle WHERE battle_id=?',(battle_id,)).fetchone():
                raise Denied('UNKNOWN_BATTLE')
            return {'code':'RETAINED','signal':signal}
        return self._transaction(op)

    def seed_history(self,event_id,person_id,which='cooldown'):
        def op(c):
            table={'cooldown':'cooldown_history','newbie':'newbie_history'}[which]
            c.execute('INSERT INTO '+table+' VALUES(?,?,?)',(event_id,person_id,'IMMUTABLE_PRIOR_HISTORY'))
            c.execute('UPDATE metadata SET serial=serial+1 WHERE one=1')
        return self._transaction(op)

    def snapshot(self):
        c=self._connect()
        try:
            rows={}
            for table in ('metadata','battle','reservation','person_clock','admission_receipt',
                          'pair_attempt_history','cooldown_history','newbie_history',
                          'terminal_receipt','final_result_marker','event_outbox'):
                rows[table]=[dict(row) for row in c.execute('SELECT * FROM '+table+' ORDER BY 1,2')]
            return rows
        finally:c.close()

    def gens(self,battle_id):
        c=self._connect()
        try:
            row=c.execute('SELECT version,gen_a,gen_b FROM battle WHERE battle_id=?',(battle_id,)).fetchone()
            return tuple(row) if row else None
        finally:c.close()


def raw_process_admit(args):
    """DB-only race runner. Bypasses fake external witness, never server auth proof."""
    path,battle_id,a,b,req=args
    c=sqlite3.connect(path,timeout=15,isolation_level=None)
    c.execute('PRAGMA busy_timeout=15000')
    c.execute('PRAGMA foreign_keys=ON')
    try:
        c.execute('BEGIN IMMEDIATE')
        c.execute('INSERT INTO v_admit VALUES(?,?,?,?,?,1)',
                  (battle_id,req,digest('admit/v126',battle_id,a,b,req),a,b))
        c.execute('COMMIT')
        return 'ADMITTED'
    except sqlite3.Error:
        c.execute('ROLLBACK')
        return 'BUSY_OR_CONFLICT'
    finally:c.close()


def raw_process_terminal(args):
    """SQL race only, independent process. Synthetic proof, no live issuer."""
    path, battle_id, kind, proof, version, ga, gb = args
    fp = digest('terminal/v126', battle_id, kind, proof, version, ga, gb)
    c=sqlite3.connect(path,timeout=15,isolation_level=None)
    c.execute('PRAGMA busy_timeout=15000')
    c.execute('PRAGMA foreign_keys=ON')
    try:
        c.execute('BEGIN IMMEDIATE')
        c.execute('INSERT INTO v_terminal VALUES(?,?,?,?,?,?,?,?,?,?)',
           (battle_id,kind,proof,fp,'term:'+battle_id+':'+fp[:20],version,ga,gb,1,0))
        c.execute('COMMIT')
        return kind
    except sqlite3.Error:
        c.execute('ROLLBACK')
        return 'REJECTED'
    finally:c.close()
