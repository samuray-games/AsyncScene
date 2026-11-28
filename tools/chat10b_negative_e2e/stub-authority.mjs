// Contract simulator only. NO Worker, D1, SQL, HTTP, or real-user authority.
// This file must never be identified as a source-backed E2E implementation.
import { createHash } from 'node:crypto';

const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
class Rejection extends Error {
  constructor(code) { super(code); this.code = code; }
}
const reject = (code) => { throw new Rejection(code); };

export class StubAuthority {
  constructor() {
    this.db = {
      revision: 0, head: 'fixture-genesis', persons: new Map(), sessions: new Map(),
      battles: new Map(), active: new Map(), generations: new Map(),
      receipts: new Map(), outbox: new Map(), messages: new Map(),
      npcGrants: new Map(), sourceCaps: new Map(), knowledge: new Map(),
      rewardCount: 0, antiFarmCount: 0,
    };
    // This witness intentionally lives outside snapshot() to model the future
    // independent high-water proof. It is not a real immutable external witness.
    this.witness = { revision: 0, head: 'fixture-genesis' };
    this.quarantined = false;
    for (const personId of ['person-A', 'person-B', 'person-C', 'person-D']) {
      this.db.persons.set(personId, { authEpoch: 1, bindingEpoch: 1, consentEpoch: 1 });
      this.db.sessions.set(`session-${personId}`, { personId, epoch: 1, revoked: false });
      this.db.generations.set(personId, 0);
    }
    this.db.npcGrants.set('npc-1', { epoch: 1, revoked: false });
  }
  assertCurrent() {
    if (this.quarantined || this.db.revision !== this.witness.revision ||
        this.db.head !== this.witness.head) reject('QUARANTINED');
  }
  transaction(op, callback) {
    try {
      this.assertCurrent();
      // Independent in-memory copy provides rollback semantics for STUB ONLY.
      const draft = structuredClone(this.db);
      const result = callback(draft);
      // A duplicate, conflicting intent, or non-authoritative observation must
      // not increment the simulated authority revision or move its witness.
      if (['REUSED', 'CONFLICT', 'NO_VERIFIED_OUTCOME'].includes(result?.code)) return result;
      draft.revision += 1;
      draft.head = digest([this.witness.head, op, draft.revision]);
      this.db = draft;
      this.witness = { revision: draft.revision, head: draft.head };
      return result;
    } catch (err) {
      if (err instanceof Rejection) return { code: err.code };
      throw err;
    }
  }
  sessionAllowed(db, sessionId, personId) {
    const s = db.sessions.get(sessionId), p = db.persons.get(personId);
    if (!s || !p || s.personId !== personId || s.revoked || s.epoch !== p.authEpoch) reject('DENY');
  }
  revoke(sessionId) {
    return this.transaction(`revoke:${sessionId}`, (db) => {
      const s = db.sessions.get(sessionId);
      if (!s) reject('DENY');
      const key = `revoke:${sessionId}`;
      if (db.receipts.has(key)) return { code: 'REUSED', receipt: db.receipts.get(key) };
      s.revoked = true;
      db.persons.get(s.personId).authEpoch += 1;
      const receipt = { id: key, epoch: db.persons.get(s.personId).authEpoch };
      db.receipts.set(key, receipt);
      return { code: 'REVOKED', receipt };
    });
  }
  issueNewSession(personId, sessionId) {
    return this.transaction(`session:${sessionId}`, (db) => {
      if (db.sessions.has(sessionId)) reject('CONFLICT');
      const p = db.persons.get(personId);
      if (!p) reject('DENY');
      db.sessions.set(sessionId, { personId, epoch: p.authEpoch, revoked: false });
      return { code: 'ACTIVE' };
    });
  }
  admit({ battleId, people, sessions, nonce, injectFailureAfterFirst = false }) {
    return this.transaction(`admit:${nonce}`, (db) => {
      if (people.length !== 2 || new Set(people).size !== 2 || sessions.length !== 2) reject('DENY');
      const fingerprint = digest({ battleId, people, sessions, nonce });
      const key = `admit:${nonce}`;
      // A prior receipt is not permission for a revoked session to read it.
      for (let i = 0; i < 2; i++) this.sessionAllowed(db, sessions[i], people[i]);
      if (db.receipts.has(key)) {
        const old = db.receipts.get(key);
        return old.fingerprint === fingerprint ? { code: 'REUSED', receipt: old } : { code: 'CONFLICT' };
      }
      if (db.battles.has(battleId)) reject('CONFLICT');
      for (let i = 0; i < 2; i++) {
        if (db.active.has(people[i])) reject('CONFLICT');
        const generation = db.generations.get(people[i]) + 1;
        db.generations.set(people[i], generation);
        db.active.set(people[i], { battleId, generation });
        if (i === 0 && injectFailureAfterFirst) reject('INJECTED_ROLLBACK');
      }
      const reservation = people.map(personId => ({ personId, ...db.active.get(personId) }));
      db.battles.set(battleId, { battleId, people, reservation, phase: 'ACTIVE', terminal: null });
      const receipt = { id: key, battleId, fingerprint, reservation };
      db.receipts.set(key, receipt);
      db.outbox.set(`genesis:${battleId}`, { type: 'battle.created', battleId });
      db.antiFarmCount += 1;
      return { code: 'CREATED', receipt };
    });
  }
  send({ sessionId, messageId, text }) {
    return this.transaction(`send:${messageId}`, db => {
      const session = db.sessions.get(sessionId);
      if (!session) reject('DENY');
      this.sessionAllowed(db, sessionId, session.personId);
      const fingerprint = digest([sessionId, messageId, text]);
      const key = `send:${messageId}`;
      if (db.receipts.has(key)) {
        const old = db.receipts.get(key);
        return old.fingerprint === fingerprint ? { code: 'REUSED', receipt: old } : { code: 'CONFLICT' };
      }
      const receipt = { id: key, fingerprint };
      db.receipts.set(key, receipt);
      db.messages.set(messageId, { messageId, text });
      db.outbox.set(key, { kind: 'SEND', messageId });
      return { code: 'SENT', receipt };
    });
  }
  terminal({ battleId, type, outcome = null, receiptId, injectFailureAfterFirst = false }) {
    return this.transaction(`terminal:${battleId}:${type}`, db => {
      if (!['FINAL', 'CANCEL'].includes(type)) reject('DENY');
      const battle = db.battles.get(battleId);
      if (!battle) reject('DENY');
      const fingerprint = digest([battleId, type, outcome, receiptId]);
      if (battle.terminal) {
        if (battle.terminal.fingerprint === fingerprint)
          return { code: 'REUSED', receipt: battle.terminal.receipt };
        return { code: 'CONFLICT' };
      }
      for (let i = 0; i < 2; i++) {
        const owner = battle.reservation[i];
        const current = db.active.get(owner.personId);
        if (!current || current.battleId !== owner.battleId || current.generation !== owner.generation)
          reject('CONFLICT');
        db.active.delete(owner.personId);
        if (i === 0 && injectFailureAfterFirst) reject('INJECTED_ROLLBACK');
      }
      const receipt = { id: receiptId, battleId, type, fingerprint };
      battle.phase = type;
      battle.terminal = { fingerprint, receipt, outcome: type === 'FINAL' ? outcome : null };
      db.receipts.set(`terminal:${battleId}`, receipt);
      db.outbox.set(`terminal:${battleId}`, { type: type === 'FINAL' ? 'battle.finalized' : 'battle.cancelled', battleId });
      if (type === 'FINAL') db.rewardCount += 1;
      return { code: type === 'FINAL' ? 'FINALIZED' : 'CANCELLED', receipt };
    });
  }
  observeNpc({ npcId = 'npc-1', knowledgeKind, battleId }) {
    return this.transaction(`observe:${npcId}:${knowledgeKind}`, db => {
      // A rumor and a public NPC utterance are NEVER authoritative outcome.
      if (knowledgeKind !== 'VERIFIED_OUTCOME') return { code: 'NO_VERIFIED_OUTCOME' };
      if (db.battles.get(battleId)?.phase !== 'FINAL') reject('DENY');
      const key = `${npcId}|${battleId}|VERIFIED_OUTCOME`;
      if (db.knowledge.has(key)) return { code: 'REUSED' };
      db.knowledge.set(key, { kind: knowledgeKind, source: battleId });
      return { code: 'VERIFIED_OUTCOME' };
    });
  }
  revokeNpcGrant(npcId = 'npc-1') {
    return this.transaction(`npcRevoke:${npcId}`, db => {
      const g = db.npcGrants.get(npcId);
      if (!g) reject('DENY');
      g.revoked = true; g.epoch += 1;
      return { code: 'REVOKED', epoch: g.epoch };
    });
  }
  regrantNpc(npcId = 'npc-1') {
    return this.transaction(`npcRegrant:${npcId}`, db => {
      const g = db.npcGrants.get(npcId);
      if (!g) reject('DENY');
      g.revoked = false; g.epoch += 1;
      return { code: 'GRANTED', epoch: g.epoch };
    });
  }
  npcAction({ npcId = 'npc-1', battleId, grantEpoch, kind = 'PUBLIC_SUPPORT', target = 'person-A', rulesVersion = 'v1' }) {
    return this.transaction(`npcAction:${npcId}:${battleId}`, db => {
      const grant = db.npcGrants.get(npcId);
      if (!grant || grant.revoked || grant.epoch !== grantEpoch) reject('DENY');
      if (db.battles.get(battleId)?.phase !== 'FINAL') reject('DENY');
      const capKey = `${npcId}|gameplay.battle.finalized|${battleId}`;
      const fingerprint = digest([kind, target, rulesVersion]);
      if (db.sourceCaps.has(capKey)) {
        const old = db.sourceCaps.get(capKey);
        return old.fingerprint === fingerprint ? { code: 'REUSED', actionId: old.actionId } : { code: 'CONFLICT' };
      }
      const actionId = `npc-action:${npcId}:${battleId}`;
      db.sourceCaps.set(capKey, { actionId, fingerprint });
      db.outbox.set(actionId, { type: kind, actionId });
      return { code: 'CREATED', actionId };
    });
  }
  snapshot() { this.assertCurrent(); return structuredClone(this.db); }
  restoreSnapshot(snapshot) {
    // The external witness must never be rewound to match restored bytes.
    this.db = structuredClone(snapshot);
    this.quarantined = this.db.revision !== this.witness.revision || this.db.head !== this.witness.head;
    return { code: this.quarantined ? 'QUARANTINED' : 'RESTORED_SAME_REVISION' };
  }
  inspect() {
    return structuredClone({
      revision: this.db.revision, witnessRevision: this.witness.revision,
      quarantined: this.quarantined,
      battles: [...this.db.battles.entries()], active: [...this.db.active.entries()],
      receipts: [...this.db.receipts.entries()], messages: [...this.db.messages.entries()],
      outbox: [...this.db.outbox.entries()], sourceCaps: [...this.db.sourceCaps.entries()],
      knowledge: [...this.db.knowledge.entries()], rewardCount: this.db.rewardCount,
      antiFarmCount: this.db.antiFarmCount,
    });
  }
}

export const createStubAuthority = () => new StubAuthority();
export const STUB_PROVENANCE = Object.freeze({
  kind: 'STUB', module: 'tools/chat10b_negative_e2e/stub-authority.mjs',
  workerD1Executed: false, authDbExecuted: false, realSourceModuleImported: false,
});
