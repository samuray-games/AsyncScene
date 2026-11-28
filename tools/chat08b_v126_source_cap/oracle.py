"""Standalone, SYNTHETIC SQLite oracle for owner R268. Never a production adapter.

Everything acting as an issuer, 07B grant or 08A effect is a *test fixture* in
this one SQLite file. This is intentionally NOT a Cloudflare D1 claim.
"""
from __future__ import annotations

import dataclasses
import hashlib
import json
import secrets
import sqlite3
from pathlib import Path

DOMAIN = "npc-proactive-source-cap/v1"
R01_FIELDS = ("npcId", "targetActorId", "sourceSystem", "sourceEventId", "actionKind", "rulesVersion")
ACTIONS = frozenset(("PUBLIC_SUPPORT", "CHALLENGE_PROPOSAL"))


def compact(values: list[str]) -> str:
    return json.dumps(values, ensure_ascii=False, separators=(",", ":"))


def source_cap(npc: str, system: str, event: str) -> str:
    return compact([DOMAIN, npc, system, event])


def inner_r01(npc: str, target: str, system: str, event: str, action: str, rules: str) -> str:
    return compact([npc, target, system, event, action, rules])


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf8")).hexdigest()


@dataclasses.dataclass(frozen=True)
class InjectedProof:
    """Caller-supplied *synthetic* proof, checked against test-only registry."""
    npc: str
    system: str = "gameplay"
    event: str = "battle-e1:final"
    battle: str = "battle-e1"
    kind: str = "VERIFIED_OUTCOME"
    authority_class: str = "BATTLE_TERMINAL_FINAL"
    recipient: str = "npc-A"
    grant_epoch: int = 1
    issuer: str = "synthetic-05c"
    relay: str = "direct"
    knowledge_key: str = "test-knowledge"


@dataclasses.dataclass(frozen=True)
class Candidate:
    target: str = "human-A"
    action: str = "PUBLIC_SUPPORT"
    rules: str = "rules-v1"
    payload: str = "synthetic approved text"

    def fingerprint(self) -> str:
        return digest(compact([self.target, self.action, self.rules, self.payload]))


@dataclasses.dataclass(frozen=True)
class Result:
    status: str
    cap: str | None = None
    inner: str | None = None
    action_id: str | None = None
    receipt: str | None = None


class ClosingConnection(sqlite3.Connection):
    """Context manager closes the connection after commit or rollback."""
    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            return super().__exit__(exc_type, exc_val, exc_tb)
        finally:
            self.close()


def connect(path: Path) -> sqlite3.Connection:
    db = sqlite3.connect(str(path), timeout=10, isolation_level=None, factory=ClosingConnection)
    db.execute("PRAGMA busy_timeout = 10000")
    db.execute("PRAGMA foreign_keys = ON")
    return db


SCHEMA = """
CREATE TABLE synthetic_finals(
  source_system TEXT NOT NULL, canonical_event_id TEXT NOT NULL,
  battle_id TEXT NOT NULL, issuer TEXT NOT NULL,
  authority_class TEXT NOT NULL CHECK(authority_class='BATTLE_TERMINAL_FINAL'),
  PRIMARY KEY(source_system,canonical_event_id), UNIQUE(source_system,battle_id)
);
CREATE TABLE synthetic_grants(
  npc_id TEXT PRIMARY KEY, grant_epoch INTEGER NOT NULL, active INTEGER NOT NULL,
  can_proact INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE synthetic_effects(
  npc_id TEXT NOT NULL, source_system TEXT NOT NULL, canonical_event_id TEXT NOT NULL,
  effect_kind TEXT NOT NULL CHECK(effect_kind='verified_outcome'),
  PRIMARY KEY(npc_id,source_system,canonical_event_id)
);
CREATE TABLE synthetic_decisions(
  cap_key TEXT PRIMARY KEY, verdict TEXT NOT NULL CHECK(verdict IN ('SELECT','NO_ACTION')),
  target_actor_id TEXT, action_kind TEXT, rules_version TEXT, payload TEXT,
  fingerprint TEXT,
  CHECK((verdict='NO_ACTION' AND target_actor_id IS NULL AND fingerprint IS NULL)
       OR (verdict='SELECT' AND target_actor_id IS NOT NULL AND fingerprint IS NOT NULL))
);
CREATE TABLE synthetic_policy(
  npc_id TEXT NOT NULL, target_actor_id TEXT NOT NULL, allowed INTEGER NOT NULL,
  PRIMARY KEY(npc_id,target_actor_id)
);
CREATE TABLE synthetic_knowledge(
  npc_id TEXT NOT NULL, recipient_id TEXT NOT NULL,source_system TEXT NOT NULL,
  canonical_event_id TEXT NOT NULL, kind TEXT NOT NULL,relay_receipt_id TEXT NOT NULL,
  text_digest TEXT NOT NULL,
  PRIMARY KEY(npc_id,recipient_id,source_system,canonical_event_id,kind,relay_receipt_id)
);
CREATE TABLE source_caps(
  cap_key TEXT PRIMARY KEY, npc_id TEXT NOT NULL, source_system TEXT NOT NULL,
  canonical_event_id TEXT NOT NULL, verdict TEXT NOT NULL CHECK(verdict IN ('ACTION','NO_ACTION')),
  action_id TEXT UNIQUE, inner_key TEXT UNIQUE, receipt TEXT NOT NULL UNIQUE,
  CHECK((verdict='ACTION' AND action_id IS NOT NULL AND inner_key IS NOT NULL)
       OR (verdict='NO_ACTION' AND action_id IS NULL AND inner_key IS NULL)),
  UNIQUE(npc_id,source_system,canonical_event_id)
);
CREATE TABLE r01_reservations(
  inner_key TEXT PRIMARY KEY, cap_key TEXT NOT NULL UNIQUE REFERENCES source_caps(cap_key),
  npc_id TEXT NOT NULL,target_actor_id TEXT NOT NULL,source_system TEXT NOT NULL,
  source_event_id TEXT NOT NULL,action_kind TEXT NOT NULL,rules_version TEXT NOT NULL,
  payload_fingerprint TEXT NOT NULL,action_id TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK(state='CONFIRMED'),
  UNIQUE(npc_id,target_actor_id,source_system,source_event_id,action_kind,rules_version)
);
CREATE TABLE action_outbox(
  action_id TEXT PRIMARY KEY, cap_key TEXT NOT NULL UNIQUE REFERENCES source_caps(cap_key),
  inner_key TEXT NOT NULL UNIQUE REFERENCES r01_reservations(inner_key),
  payload_fingerprint TEXT NOT NULL, status TEXT NOT NULL CHECK(status='PENDING_DELIVERY')
);
"""


def initialize(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with connect(path) as db:
        db.executescript(SCHEMA)
        # Once emitted, receipt, reservation and outbox are immutable in this model.
        for table in ("source_caps", "r01_reservations", "action_outbox", "synthetic_finals", "synthetic_decisions"):
            for op in ("UPDATE", "DELETE"):
                db.execute(f"CREATE TRIGGER {table}_{op.lower()} BEFORE {op} ON {table} "
                           f"BEGIN SELECT RAISE(ABORT,'IMMUTABLE_{table}'); END")


class SyntheticAuthority:
    """Fixture issuer ONLY. Separate write methods serialize through same SQLite file."""
    def __init__(self, path: Path):
        self.path = path

    def register_final(self, event: str = "battle-e1:final", battle: str = "battle-e1", system: str = "gameplay") -> str:
        try:
            with connect(self.path) as db:
                db.execute("INSERT INTO synthetic_finals VALUES(?,?,?,?,?)",
                           (system,event,battle,"synthetic-05c","BATTLE_TERMINAL_FINAL"))
            return "REGISTERED"
        except sqlite3.IntegrityError:
            return "CONFLICT_QUARANTINE"

    def grant(self, npc: str = "npc-A", epoch: int = 1, active: bool = True, can_proact: bool = True) -> None:
        with connect(self.path) as db:
            db.execute("INSERT INTO synthetic_grants VALUES(?,?,?,?) ON CONFLICT(npc_id) DO UPDATE SET "
                       "grant_epoch=excluded.grant_epoch,active=excluded.active,can_proact=excluded.can_proact",
                       (npc,epoch,int(active),int(can_proact)))

    def effect(self, npc: str = "npc-A", event: str = "battle-e1:final", system: str = "gameplay") -> None:
        with connect(self.path) as db:
            db.execute("INSERT OR IGNORE INTO synthetic_effects VALUES(?,?,?,'verified_outcome')",(npc,system,event))

    def policy(self, npc: str = "npc-A", target: str = "human-A", allowed: bool = True) -> None:
        with connect(self.path) as db:
            db.execute("INSERT INTO synthetic_policy VALUES(?,?,?) ON CONFLICT(npc_id,target_actor_id) "
                       "DO UPDATE SET allowed=excluded.allowed",(npc,target,int(allowed)))

    def register_knowledge(self, *, npc: str = "npc-A", recipient: str = "npc-A",
                           system: str = "gameplay", event: str = "battle-e1:final",
                           kind: str = "HEARD_CLAIM", relay: str = "relay-1",
                           text_digest: str = "digest-1") -> str:
        """Synthetic 07B-only provenance table, not a source of action rights."""
        with connect(self.path) as db:
            old=db.execute("SELECT text_digest FROM synthetic_knowledge WHERE npc_id=? AND recipient_id=? "
                           "AND source_system=? AND canonical_event_id=? AND kind=? AND relay_receipt_id=?",
                           (npc,recipient,system,event,kind,relay)).fetchone()
            if old:
                return "ALREADY" if old[0]==text_digest else "CONFLICT_QUARANTINE"
            db.execute("INSERT INTO synthetic_knowledge VALUES(?,?,?,?,?,?,?)",
                       (npc,recipient,system,event,kind,relay,text_digest))
            return "REGISTERED"

    def decide(self, npc: str = "npc-A", event: str = "battle-e1:final", system: str = "gameplay",
               candidates: tuple[Candidate, ...] = (Candidate(),)) -> str:
        """A fixed synthetic selector: only ONE valid option is unambiguous.

        No first-writer-wins action lottery: ambiguous list becomes NO_ACTION.
        This is a proposal, NOT an owner-approved production tie breaker.
        """
        cap=source_cap(npc,system,event)
        good = [c for c in candidates if c.action in ACTIONS and c.target and c.rules]
        chosen=good[0] if len(good)==1 and len(candidates)==1 else None
        row=(cap,"SELECT",chosen.target,chosen.action,chosen.rules,chosen.payload,chosen.fingerprint()) if chosen else (cap,"NO_ACTION",None,None,None,None,None)
        with connect(self.path) as db:
            db.execute("INSERT INTO synthetic_decisions VALUES(?,?,?,?,?,?,?)",row)
        return "SELECT" if chosen else "NO_ACTION"


def authorize(db: sqlite3.Connection, p: InjectedProof) -> bool:
    if p.kind!="VERIFIED_OUTCOME" or p.authority_class!="BATTLE_TERMINAL_FINAL" or p.recipient!=p.npc:
        return False
    src=db.execute("SELECT battle_id,issuer,authority_class FROM synthetic_finals WHERE source_system=? AND canonical_event_id=?",
                   (p.system,p.event)).fetchone()
    if src!=(p.battle,p.issuer,p.authority_class):
        return False
    grant=db.execute("SELECT grant_epoch,active,can_proact FROM synthetic_grants WHERE npc_id=?",(p.npc,)).fetchone()
    if grant!=(p.grant_epoch,1,1):
        return False
    effect=db.execute("SELECT 1 FROM synthetic_effects WHERE npc_id=? AND source_system=? AND canonical_event_id=? AND effect_kind='verified_outcome'",(p.npc,p.system,p.event)).fetchone()
    return effect is not None


def commit_action(path: Path, p: InjectedProof, *,
                  injected_abort: bool = False, external_known_caps: frozenset[str] = frozenset()) -> Result:
    """ONE BEGIN IMMEDIATE -> source cap + R01 + one outbox + receipt.

    External known caps are an INJECTED fixture of an out-of-band high-water
    witness, NOT an actual implemented rollback service.
    """
    db=connect(path)
    try:
        db.execute("BEGIN IMMEDIATE")
        actual={row[0] for row in db.execute("SELECT cap_key FROM source_caps")}
        if not external_known_caps.issubset(actual):
            db.execute("ROLLBACK")
            return Result("STOP_RESTORE_ROLLBACK_DETECTED")
        cap=source_cap(p.npc,p.system,p.event)
        # Check source/grant/rights *at transaction time*, not after a stale precheck.
        if not authorize(db,p):
            db.execute("ROLLBACK")
            return Result("DENIED")
        row=db.execute("SELECT verdict,inner_key,action_id,receipt FROM source_caps WHERE cap_key=?",(cap,)).fetchone()
        if row:
            db.execute("COMMIT")
            return Result("ALREADY_CONFIRMED" if row[0]=="ACTION" else "ALREADY_NO_ACTION",cap,row[1],row[2],row[3])
        d=db.execute("SELECT verdict,target_actor_id,action_kind,rules_version,payload,fingerprint FROM synthetic_decisions WHERE cap_key=?",(cap,)).fetchone()
        if not d:
            db.execute("ROLLBACK")
            return Result("STOP_NO_FROZEN_SELECTION")
        verdict,target,kind,rules,payload,fp=d
        permit=db.execute("SELECT allowed FROM synthetic_policy WHERE npc_id=? AND target_actor_id=?",(p.npc,target)).fetchone() if target else None
        if verdict=="NO_ACTION" or not permit or permit[0]!=1:
            receipt="no-action:"+digest(cap)
            db.execute("INSERT INTO source_caps VALUES(?,?,?,?,?,?,?,?)",
                       (cap,p.npc,p.system,p.event,"NO_ACTION",None,None,receipt))
            if injected_abort:
                raise sqlite3.OperationalError("INJECTED_ABORT_BEFORE_COMMIT")
            db.execute("COMMIT")
            return Result("NO_ACTION",cap,None,None,receipt)
        if kind not in ACTIONS or fp!=Candidate(target,kind,rules,payload).fingerprint():
            db.execute("ROLLBACK")
            return Result("CONFLICT_QUARANTINE")
        inner=inner_r01(p.npc,target,p.system,p.event,kind,rules)
        action_id="synthetic-action:"+secrets.token_hex(16)
        receipt="synthetic-receipt:"+secrets.token_hex(16)
        db.execute("INSERT INTO source_caps VALUES(?,?,?,?,?,?,?,?)",
                   (cap,p.npc,p.system,p.event,"ACTION",action_id,inner,receipt))
        db.execute("INSERT INTO r01_reservations VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                   (inner,cap,p.npc,target,p.system,p.event,kind,rules,fp,action_id,"CONFIRMED"))
        if injected_abort:
            raise sqlite3.OperationalError("INJECTED_ABORT_BEFORE_OUTBOX")
        db.execute("INSERT INTO action_outbox VALUES(?,?,?,?,'PENDING_DELIVERY')",(action_id,cap,inner,fp))
        db.execute("COMMIT")
        return Result("CONFIRMED",cap,inner,action_id,receipt)
    except Exception:
        if db.in_transaction:
            db.execute("ROLLBACK")
        raise
    finally:
        db.close()


def rows(path: Path) -> tuple[int,int,int]:
    with connect(path) as db:
        return tuple(db.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in ("source_caps","r01_reservations","action_outbox"))


def readback(path: Path):
    with connect(path) as db:
        return tuple(tuple(db.execute(f"SELECT * FROM {t} ORDER BY 1").fetchall()) for t in ("source_caps","r01_reservations","action_outbox"))
