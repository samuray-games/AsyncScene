const GENESIS = '0'.repeat(64);

async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function eventDigest(previousDigest, seq, operationId, payloadJson) {
  return digest(`${previousDigest}\n${seq}\n${operationId}\n${payloadJson}`);
}

function statement(db, event) {
  const p = event.payload;
  if (event.kind === 'operation') {
    return db.prepare(`INSERT INTO auth_operation_commits
      (operation_id, purpose, actor_id, invitation_id, preauth_id, challenge_id, recovery_code_id, session_id, expected_epoch, expected_counter, credential_id, payload_hash, payload_json, occurred_at, authority_seq, authority_digest)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(p.operationId, p.purpose, p.actorId, p.invitationId, p.preauthId, p.challengeId, p.recoveryCodeId, p.sessionId,
        p.expectedEpoch, p.expectedCounter, p.credentialId, p.payloadHash, p.payloadJson, p.occurredAt, event.seq, event.digest);
  }
  if (event.kind === 'invite_revoke') {
    return db.prepare(`UPDATE auth_invitations SET revoked_at = ? WHERE invitation_id = ?
      AND revoked_at IS NULL AND consumed_at IS NULL`).bind(p.revokedAt, p.invitationId);
  }
  throw new Error('AUTHORITY_EVENT_INVALID');
}

async function readCheckpoint(db) {
  return db.prepare('SELECT seq, digest, operation_id FROM auth_checkpoint WHERE singleton = 1').first();
}

/** Local SQLite model of an independent, serialized checkpoint authority.
 * It is deliberately not a Durable Object implementation. */
export class LocalCheckpointAuthority {
  constructor(db) {
    this.db = db;
    this.tail = Promise.resolve();
    this.available = true;
    this.failAt = null;
  }

  async initialize({ bootstrap = false } = {}) {
    await this.db.exec(`CREATE TABLE IF NOT EXISTS checkpoint_state (
      singleton INTEGER PRIMARY KEY CHECK(singleton = 1), head_seq INTEGER NOT NULL, head_digest TEXT NOT NULL,
      pending_seq INTEGER, pending_digest TEXT, pending_json TEXT
    );
    CREATE TABLE IF NOT EXISTS checkpoint_events (
      seq INTEGER PRIMARY KEY, operation_id TEXT NOT NULL UNIQUE, previous_digest TEXT NOT NULL,
      digest TEXT NOT NULL UNIQUE, payload_json TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('prepared','committed'))
    );
    CREATE TRIGGER IF NOT EXISTS checkpoint_event_before_insert
    BEFORE INSERT ON checkpoint_events BEGIN
      SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM checkpoint_state s WHERE s.singleton = 1
        AND s.pending_seq IS NULL AND NEW.seq = s.head_seq + 1 AND NEW.previous_digest = s.head_digest
        AND NEW.status = 'prepared') THEN RAISE(ABORT, 'AUTHORITY_CAS') END;
    END;
    CREATE TRIGGER IF NOT EXISTS checkpoint_event_before_update
    BEFORE UPDATE ON checkpoint_events BEGIN
      SELECT CASE WHEN OLD.status != 'prepared' OR NEW.status != 'committed'
        OR NEW.seq != OLD.seq OR NEW.operation_id != OLD.operation_id OR NEW.previous_digest != OLD.previous_digest
        OR NEW.digest != OLD.digest OR NEW.payload_json != OLD.payload_json
        OR NOT EXISTS (SELECT 1 FROM checkpoint_state s WHERE s.singleton = 1
          AND s.pending_seq = OLD.seq AND s.pending_digest = OLD.digest)
        THEN RAISE(ABORT, 'AUTHORITY_CAS') END;
    END;
    CREATE TRIGGER IF NOT EXISTS checkpoint_event_before_delete
    BEFORE DELETE ON checkpoint_events BEGIN
      SELECT CASE WHEN OLD.status != 'prepared' OR NOT EXISTS (SELECT 1 FROM checkpoint_state s WHERE s.singleton = 1
        AND s.pending_seq = OLD.seq AND s.pending_digest = OLD.digest AND s.head_seq + 1 = OLD.seq)
        THEN RAISE(ABORT, 'AUTHORITY_CAS') END;
    END;
    CREATE TRIGGER IF NOT EXISTS checkpoint_state_before_update
    BEFORE UPDATE ON checkpoint_state BEGIN
      SELECT CASE WHEN NEW.singleton != OLD.singleton THEN RAISE(ABORT, 'AUTHORITY_CAS') END;
      SELECT CASE WHEN NEW.head_seq = OLD.head_seq AND NEW.head_digest = OLD.head_digest
        AND OLD.pending_seq IS NULL AND NEW.pending_seq = OLD.head_seq + 1
        AND NEW.pending_digest IS NOT NULL AND NEW.pending_json IS NOT NULL
        AND EXISTS (SELECT 1 FROM checkpoint_events e WHERE e.seq = NEW.pending_seq AND e.digest = NEW.pending_digest AND e.status = 'prepared') THEN NULL
        WHEN NEW.head_seq = OLD.head_seq + 1 AND NEW.pending_seq IS NULL AND NEW.pending_digest IS NULL AND NEW.pending_json IS NULL
        AND OLD.pending_seq = NEW.head_seq AND OLD.pending_digest = NEW.head_digest
        AND EXISTS (SELECT 1 FROM checkpoint_events e WHERE e.seq = NEW.head_seq AND e.digest = NEW.head_digest AND e.status = 'committed') THEN NULL
        WHEN NEW.head_seq = OLD.head_seq AND NEW.head_digest = OLD.head_digest AND OLD.pending_seq IS NOT NULL
        AND NEW.pending_seq IS NULL AND NEW.pending_digest IS NULL AND NEW.pending_json IS NULL
        AND NOT EXISTS (SELECT 1 FROM checkpoint_events e WHERE e.seq = OLD.pending_seq) THEN NULL
        ELSE RAISE(ABORT, 'AUTHORITY_CAS') END;
    END;
    CREATE TRIGGER IF NOT EXISTS checkpoint_state_before_delete
    BEFORE DELETE ON checkpoint_state BEGIN SELECT RAISE(ABORT, 'AUTHORITY_CAS'); END;`);
    if (bootstrap) await this.db.prepare('INSERT OR IGNORE INTO checkpoint_state(singleton, head_seq, head_digest) VALUES(1, 0, ?)').bind(GENESIS).run();
  }

  async runExclusive(fn) {
    const prior = this.tail;
    let release;
    this.tail = new Promise((resolve) => { release = resolve; });
    await prior;
    try {
      if (!this.available) throw new Error('AUTHORITY_UNAVAILABLE');
      return await fn();
    } finally { release(); }
  }

  async hit(point) {
    if (this.failAt === point) { this.failAt = null; throw new Error(`INJECTED_CRASH_${point}`); }
  }

  async prepare(kind, payload) {
    const state = await this.db.prepare('SELECT * FROM checkpoint_state WHERE singleton = 1').first();
    if (!state || state.pending_seq !== null) throw new Error('AUTHORITY_PENDING');
    const seq = Number(state.head_seq) + 1;
    const operationId = payload.operationId;
    const payloadJson = JSON.stringify({ kind, payload });
    const nextDigest = await eventDigest(state.head_digest, seq, operationId, payloadJson);
    const result = await this.db.batch([
      this.db.prepare(`INSERT INTO checkpoint_events(seq, operation_id, previous_digest, digest, payload_json, status) VALUES (?, ?, ?, ?, ?, 'prepared')`)
        .bind(seq, operationId, state.head_digest, nextDigest, payloadJson),
      this.db.prepare('UPDATE checkpoint_state SET pending_seq = ?, pending_digest = ?, pending_json = ? WHERE singleton = 1')
        .bind(seq, nextDigest, payloadJson),
    ]);
    if (result[1]?.meta?.changes !== 1) throw new Error('AUTHORITY_CONCURRENT_CHANGE');
    await this.hit('after_prepare');
    return { seq, digest: nextDigest, previousSeq: Number(state.head_seq), previousDigest: state.head_digest,
      operationId, kind, payload };
  }

  async apply(db, event) {
    const prior = await readCheckpoint(db);
    if (!prior || Number(prior.seq) !== event.seq - 1 || prior.digest !== event.previousDigest) {
      if (Number(prior?.seq) === event.seq && prior?.digest === event.digest) return;
      throw new Error('AUTH_CHECKPOINT_MISMATCH');
    }
    const update = db.prepare(`UPDATE auth_checkpoint SET seq = ?, digest = ?, operation_id = ? WHERE singleton = 1`)
      .bind(event.seq, event.digest, event.operationId);
    const mutation = statement(db, event);
    const guard = db.prepare(`INSERT INTO auth_checkpoint_apply_guard(singleton, operation_id, seq, previous_digest, digest, kind, invitation_id, occurred_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(event.operationId, event.seq, event.previousDigest, event.digest, event.kind, event.payload.invitationId || null,
        event.payload.occurredAt || event.payload.revokedAt);
    const clearGuard = db.prepare('DELETE FROM auth_checkpoint_apply_guard WHERE singleton = 1 AND operation_id = ?').bind(event.operationId);
    const result = await db.batch([guard, mutation, update, clearGuard]);
    if (result[0]?.meta?.changes !== 1) throw new Error('AUTHORITY_OPERATION_REJECTED');
    if (result[2]?.meta?.changes !== 1 || result[3]?.meta?.changes !== 1) throw new Error('AUTH_CHECKPOINT_MISMATCH');
    await this.hit('after_auth_commit');
  }

  async finalize(event) {
    const result = await this.db.batch([
      this.db.prepare(`UPDATE checkpoint_events SET status = 'committed' WHERE seq = ? AND digest = ? AND status = 'prepared'`).bind(event.seq, event.digest),
      this.db.prepare(`UPDATE checkpoint_state SET head_seq = ?, head_digest = ?, pending_seq = NULL, pending_digest = NULL, pending_json = NULL
        WHERE singleton = 1 AND pending_seq = ? AND pending_digest = ?`).bind(event.seq, event.digest, event.seq, event.digest),
    ]);
    if (result.some((item) => item?.meta?.changes !== 1)) throw new Error('AUTHORITY_FINALIZE_FAILED');
    await this.hit('after_finalize');
  }

  async discardRejected(event) {
    const cp = await readCheckpoint(event.db);
    if (!cp || Number(cp.seq) !== event.seq - 1 || cp.digest !== event.previousDigest) throw new Error('AUTH_CHECKPOINT_MISMATCH');
    const result = await this.db.batch([
      this.db.prepare(`DELETE FROM checkpoint_events WHERE seq = ? AND digest = ? AND status = 'prepared'`).bind(event.seq, event.digest),
      this.db.prepare(`UPDATE checkpoint_state SET pending_seq = NULL, pending_digest = NULL, pending_json = NULL
        WHERE singleton = 1 AND pending_seq = ? AND pending_digest = ?`).bind(event.seq, event.digest),
    ]);
    if (result.some((item) => item?.meta?.changes !== 1)) throw new Error('AUTHORITY_REJECT_DISCARD_FAILED');
  }

  async reconcile(db) {
    if (!this.available) throw new Error('AUTHORITY_UNAVAILABLE');
    const state = await this.db.prepare('SELECT * FROM checkpoint_state WHERE singleton = 1').first();
    if (!state) throw new Error('AUTHORITY_MISSING');
    const cp = await readCheckpoint(db);
    if (!cp) throw new Error('AUTH_CHECKPOINT_MISSING');
    if (state.pending_seq !== null) {
      const eventRow = await this.db.prepare('SELECT * FROM checkpoint_events WHERE seq = ? AND status = ?')
        .bind(state.pending_seq, 'prepared').first();
      if (!eventRow || Number(eventRow.seq) !== Number(state.head_seq) + 1 || eventRow.previous_digest !== state.head_digest
        || eventRow.digest !== state.pending_digest
        || await eventDigest(eventRow.previous_digest, eventRow.seq, eventRow.operation_id, eventRow.payload_json) !== eventRow.digest) {
        throw new Error('AUTHORITY_CONTRADICTORY');
      }
      const eventPayload = JSON.parse(eventRow.payload_json);
      const event = { seq: Number(eventRow.seq), operationId: eventRow.operation_id, previousDigest: eventRow.previous_digest,
        digest: eventRow.digest, kind: eventPayload.kind, payload: eventPayload.payload };
      if (Number(cp.seq) === event.seq && cp.digest === event.digest) await this.finalize(event);
      else {
        if (Number(cp.seq) !== event.seq - 1 || cp.digest !== event.previousDigest) throw new Error('AUTH_CHECKPOINT_MISMATCH');
        try { await this.apply(db, event); }
        catch (error) {
          if (!String(error?.message || '').includes('AUTH_GUARD')) throw error;
          // This exact prepared event was not applied: SQLite rolled back the
          // whole batch on the invariant trigger, and the prior checkpoint is
          // still present. Discarding it cannot roll back committed auth state.
          event.db = db;
          await this.discardRejected(event);
          return true;
        }
        await this.finalize(event);
      }
      return this.reconcile(db);
    }
    if (Number(cp.seq) > Number(state.head_seq)) throw new Error('AUTH_CHECKPOINT_AHEAD');
    if (Number(cp.seq) === Number(state.head_seq)) {
      if (cp.digest !== state.head_digest) throw new Error('AUTH_CHECKPOINT_MISMATCH');
      if (Number(state.head_seq) > 0) {
        const head = await this.db.prepare('SELECT * FROM checkpoint_events WHERE seq = ? AND status = ?').bind(state.head_seq, 'committed').first();
        if (!head || head.digest !== state.head_digest
          || await eventDigest(head.previous_digest, head.seq, head.operation_id, head.payload_json) !== head.digest) {
          throw new Error('AUTHORITY_CONTRADICTORY');
        }
      }
      return true;
    }
    // A finalized history mismatch means the auth DB was restored or altered.
    // Do not silently replay old finalized operations and resume service.
    throw new Error(Number(cp.seq) < Number(state.head_seq) ? 'AUTH_CHECKPOINT_BEHIND' : 'AUTH_CHECKPOINT_AHEAD');
  }

  async commitOperation(db, fields) {
    const event = await this.prepare('operation', fields);
    event.db = db;
    try { await this.apply(db, event); }
    catch (error) {
      // SQLite batch guarantees rollback on a trigger abort. Discard only this
      // known pre-commit business rejection; unknown I/O failures stay pending.
      if (String(error?.message || '').includes('AUTH_GUARD')) await this.discardRejected(event);
      throw error;
    }
    await this.finalize(event);
  }

  async revokeInvitation(db, invitationId, revokedAt) {
    const event = await this.prepare('invite_revoke', { operationId: `invite-revoke:${invitationId}:${revokedAt}`,
      invitationId, revokedAt });
    event.db = db;
    try { await this.apply(db, event); }
    catch (error) {
      if (String(error?.message || '').includes('AUTH_GUARD')) await this.discardRejected(event);
      throw error;
    }
    await this.finalize(event);
  }
}

export async function initializeAuthCheckpoint(db) {
  const columns = await db.prepare('PRAGMA table_info(auth_operation_commits)').all();
  const known = new Set(columns.results.map((column) => column.name));
  if (!known.has('authority_seq')) await db.exec('ALTER TABLE auth_operation_commits ADD COLUMN authority_seq INTEGER NOT NULL DEFAULT 0');
  if (!known.has('authority_digest')) await db.exec(`ALTER TABLE auth_operation_commits ADD COLUMN authority_digest TEXT NOT NULL DEFAULT '${GENESIS}'`);
  await db.exec(`CREATE TABLE IF NOT EXISTS auth_checkpoint (
    singleton INTEGER PRIMARY KEY CHECK(singleton = 1), seq INTEGER NOT NULL CHECK(seq >= 0),
    digest TEXT NOT NULL CHECK(length(digest) = 64), operation_id TEXT
  );
  INSERT OR IGNORE INTO auth_checkpoint(singleton, seq, digest) VALUES(1, 0, '${GENESIS}');
  CREATE TABLE IF NOT EXISTS auth_checkpoint_apply_guard (
    singleton INTEGER PRIMARY KEY CHECK(singleton = 1), operation_id TEXT NOT NULL UNIQUE,
    seq INTEGER NOT NULL, previous_digest TEXT NOT NULL, digest TEXT NOT NULL,
    kind TEXT NOT NULL CHECK(kind IN ('operation', 'invite_revoke')), invitation_id TEXT, occurred_at INTEGER NOT NULL
  );
  CREATE TRIGGER IF NOT EXISTS auth_checkpoint_guard_before_insert
  BEFORE INSERT ON auth_checkpoint_apply_guard BEGIN
    SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint c WHERE c.singleton = 1
      AND c.seq = NEW.seq - 1 AND c.digest = NEW.previous_digest)
      THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
    SELECT CASE WHEN NEW.kind = 'invite_revoke' AND NOT EXISTS (SELECT 1 FROM auth_invitations i
      WHERE i.invitation_id = NEW.invitation_id AND i.revoked_at IS NULL AND i.consumed_at IS NULL)
      THEN RAISE(ABORT, 'AUTH_GUARD') END;
    SELECT CASE WHEN EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard)
      THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
  END;
  CREATE TRIGGER IF NOT EXISTS auth_checkpoint_guard_update
  BEFORE UPDATE ON auth_checkpoint WHEN EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard) BEGIN
    SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard g WHERE g.operation_id = NEW.operation_id
      AND NEW.seq = g.seq AND NEW.digest = g.digest AND OLD.seq = g.seq - 1 AND OLD.digest = g.previous_digest)
      THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
  END;
  CREATE TRIGGER IF NOT EXISTS auth_checkpoint_guard_no_delete
  BEFORE DELETE ON auth_checkpoint BEGIN SELECT RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH'); END;
  CREATE TRIGGER IF NOT EXISTS auth_operation_checkpoint_guard
  BEFORE INSERT ON auth_operation_commits WHEN NEW.purpose != 'session_fence' BEGIN
    SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard g WHERE g.kind = 'operation'
      AND g.operation_id = NEW.operation_id AND g.seq = NEW.authority_seq AND g.digest = NEW.authority_digest)
      THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
  END;
  CREATE TRIGGER IF NOT EXISTS auth_invite_revoke_checkpoint_guard
  BEFORE UPDATE OF revoked_at ON auth_invitations WHEN OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL BEGIN
    SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard g WHERE g.kind = 'invite_revoke'
      AND g.invitation_id = NEW.invitation_id AND g.occurred_at = NEW.revoked_at)
      THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
  END;`);
}
