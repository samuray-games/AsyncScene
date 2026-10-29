// Chat 03B2 PRIVATE ALPHA PROTOTYPE. NOT DEPLOYED.
// Separate gameplay D1, separate admin secret; never telemetry owner credentials.
// Participants authenticate by server-minted, battle-scoped random capabilities.
// The bootstrap admin distributes each capability privately. This is NOT
// permanent account identity and must pass a separate auth/privacy review.

import "../../AsyncScene/Web/conflict/tactical-resolver.js";
import "../../AsyncScene/Web/conflict/tactical-lifecycle.js";

const lifecycle = globalThis.TacticalCombatLifecycleV1.createLifecycle(globalThis.Game.TacticalCombatV1);
const MAX_BODY = 8192;
const MAX_COMMAND_RETRIES = 5;
const te = new TextEncoder();
const SELECTION_FIELDS = ["attackColor", "defenseColor", "attackType", "defenseType", "role"];
const SELECTION_COLORS = new Set(["y", "o", "r", "k"]);
const SELECTION_ATTACKS = new Set(["N", "P", "T"]);
const SELECTION_DEFENSES = new Set(["S", "C", "G"]);

function normalizeSelection(selection, expectedRole) {
  if (!selection || typeof selection !== "object" || Array.isArray(selection) ||
      Object.keys(selection).some(key => !SELECTION_FIELDS.includes(key)) ||
      SELECTION_FIELDS.some(key => !Object.prototype.hasOwnProperty.call(selection, key) ||
        typeof selection[key] !== "string")) return null;
  if (!SELECTION_COLORS.has(selection.attackColor) || !SELECTION_COLORS.has(selection.defenseColor) ||
      !SELECTION_ATTACKS.has(selection.attackType) || !SELECTION_DEFENSES.has(selection.defenseType) ||
      !selection.role.trim() || selection.role.trim() !== selection.role ||
      selection.role !== expectedRole ||
      (selection.role !== "mafia" && (selection.attackColor === "k" || selection.defenseColor === "k"))) {
    return null;
  }
  return Object.fromEntries(SELECTION_FIELDS.map(key => [key, selection[key]]));
}

function encodeJSON(value, status = 200, origin = null) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  if (origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
    headers.set("access-control-allow-headers", "Authorization, Content-Type");
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  }
  return new Response(JSON.stringify(value), { status, headers });
}

function canonical(x) {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return "[" + x.map(canonical).join(",") + "]";
  return "{" + Object.keys(x).sort().map(key => JSON.stringify(key) + ":" + canonical(x[key])).join(",") + "}";
}

function secretEquals(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length > 512) return false;
  const x = te.encode(a), y = te.encode(b);
  let delta = x.length ^ y.length;
  const count = Math.max(x.length, y.length);
  for (let i = 0; i < count; i++) delta |= (x[i] || 0) ^ (y[i] || 0);
  return delta === 0;
}

function bearer(request) {
  const auth = request.headers.get("authorization") || "";
  return /^Bearer [A-Za-z0-9_-]{32,512}$/.test(auth) ? auth.slice(7) : null;
}

async function sha256hex(value) {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", te.encode(value)));
  return Array.from(hash, b => b.toString(16).padStart(2, "0")).join("");
}

function newCapability() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function bytesToBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw Error("INVALID_RECOVERY_KEY");
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function recoveryKeyring(env) {
  let keys;
  try { keys = JSON.parse(env.CREATE_RECOVERY_KEYS || "{}"); }
  catch (_) { throw Error("CREATE_RECOVERY_CONFIG_INVALID"); }
  const currentVersion = env.CREATE_RECOVERY_KEY_CURRENT;
  if (!keys || typeof keys !== "object" || Array.isArray(keys) ||
      typeof currentVersion !== "string" || !Object.prototype.hasOwnProperty.call(keys, currentVersion)) {
    throw Error("CREATE_RECOVERY_CONFIG_INVALID");
  }
  for (const [version, encoded] of Object.entries(keys)) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(version) || base64UrlToBytes(encoded).length !== 32) {
      throw Error("CREATE_RECOVERY_CONFIG_INVALID");
    }
  }
  return { keys, currentVersion };
}

async function encryptCapabilities(tokens, keyVersion, encodedKey, aad) {
  const key = await crypto.subtle.importKey("raw", base64UrlToBytes(encodedKey), "AES-GCM", false, ["encrypt"]);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({
    name: "AES-GCM", iv: nonce, additionalData: te.encode(aad), tagLength: 128,
  }, key, te.encode(JSON.stringify(tokens))));
  return { keyVersion, nonce: bytesToBase64Url(nonce), ciphertext: bytesToBase64Url(ciphertext) };
}

async function decryptCapabilities(row, keyring, aad) {
  const encodedKey = keyring.keys[row.recovery_key_version];
  if (!encodedKey) throw Error("CREATE_RECOVERY_KEY_UNAVAILABLE");
  const key = await crypto.subtle.importKey("raw", base64UrlToBytes(encodedKey), "AES-GCM", false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({
    name: "AES-GCM", iv: base64UrlToBytes(row.recovery_nonce_base64url),
    additionalData: te.encode(aad), tagLength: 128,
  }, key, base64UrlToBytes(row.capabilities_ciphertext_base64url));
  const recovered = JSON.parse(new TextDecoder().decode(plaintext));
  if (!recovered || !Number.isSafeInteger(recovered.deadlineAt) ||
      !recovered.capabilities?.A || !recovered.capabilities?.B ||
      !/^[A-Za-z0-9_-]{2,64}$/.test(recovered.capabilities.A.participantId || "") ||
      !/^[A-Za-z0-9_-]{2,64}$/.test(recovered.capabilities.B.participantId || "") ||
      !/^[A-Za-z0-9_-]{43}$/.test(recovered.capabilities.A.token || "") ||
      !/^[A-Za-z0-9_-]{43}$/.test(recovered.capabilities.B.token || "")) {
    throw Error("CREATE_RECOVERY_RECORD_INVALID");
  }
  return recovered;
}

function adminAuthorized(req, env) {
  const secret = env.ADMIN_CONTROL_TOKEN;
  return typeof secret === "string" && secret.length >= 32 &&
    secretEquals(bearer(req), secret);
}

function operatorReadAuthorized(req, env) {
  const secret = env.OPERATOR_READ_TOKEN;
  const adminSecret = env.ADMIN_CONTROL_TOKEN;
  return typeof secret === "string" && secret.length >= 32 &&
    !(typeof adminSecret === "string" && secretEquals(secret, adminSecret)) &&
    secretEquals(bearer(req), secret);
}

function config(env) {
  if (!env.DB || typeof env.ADMIN_CONTROL_TOKEN !== "string" || env.ADMIN_CONTROL_TOKEN.length < 32) {
    throw new Error("GAMEPLAY_CONFIG_MISSING");
  }
  if (typeof env.OPERATOR_READ_TOKEN === "string" &&
      env.OPERATOR_READ_TOKEN === env.ADMIN_CONTROL_TOKEN) {
    throw new Error("GAMEPLAY_CONFIG_INVALID");
  }
  const windowMs = Number(env.COMMIT_WINDOW_MS);
  if (!Number.isSafeInteger(windowMs) || windowMs < 60000 || windowMs > 604800000) {
    throw new Error("GAMEPLAY_WINDOW_POLICY_MISSING");
  }
  return windowMs;
}

async function parseBody(request) {
  // Reject oversized bodies *while reading*, including chunked uploads with
  // no Content-Length. A post-read string-length check is too late and counts
  // UTF-16 code units instead of UTF-8 bytes.
  const advertised = request.headers.get("content-length");
  if (advertised !== null && Number(advertised) > MAX_BODY) throw Error("BODY_TOO_LARGE");
  if (!request.body) throw Error("INVALID_BODY");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let totalBytes = 0, jsonText = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY) throw Error("BODY_TOO_LARGE");
      jsonText += decoder.decode(value, { stream: true });
    }
    jsonText += decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const obj = JSON.parse(jsonText);
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw Error("INVALID_BODY");
  return obj;
}

function exactKeys(obj, keys) {
  return Object.keys(obj).every(k => keys.includes(k));
}

function participantValid(p) {
  return p && typeof p === "object" && !Array.isArray(p) &&
    exactKeys(p, ["id", "role"]) &&
    typeof p.id === "string" && /^[A-Za-z0-9_-]{2,64}$/.test(p.id) &&
    typeof p.role === "string" && /^[A-Za-z0-9_-]{2,32}$/.test(p.role) &&
    p.role !== "mafia"; // V12 black-color/mafia gate not approved
}

async function load(db, id) {
  const row = await db.prepare(
    "SELECT version,state_json FROM gameplay_battles WHERE battle_id=?"
  ).bind(id).first();
  if (!row) return null;
  const restored = lifecycle.restore(row.state_json);
  if (!restored.ok || restored.state.version !== row.version) throw Error("CORRUPT_BATTLE");
  return restored.state;
}

async function loadAuthorized(db, id, authorized) {
  // Keep authorization and the battle snapshot in one read statement. A
  // revocation committed before this query returns no state. A revoke after
  // this query's SQLite read snapshot may still race network response delivery.
  const row = await db.prepare(
    `SELECT b.version,b.state_json
     FROM gameplay_battles AS b
     JOIN gameplay_battle_capabilities AS c ON c.battle_id=b.battle_id
     WHERE b.battle_id=? AND c.side=? AND c.participant_id=?
       AND c.token_sha256=? AND c.status='active' AND c.generation=?
       AND json_extract(b.state_json,'$.participants.' || c.side || '.id')=c.participant_id`
  ).bind(id, authorized.side, authorized.participant_id,
    authorized.token_sha256, authorized.generation).first();
  if (!row) return null;
  const restored = lifecycle.restore(row.state_json);
  if (!restored.ok || restored.state.version !== row.version) throw Error("CORRUPT_BATTLE");
  return restored.state;
}

async function authorizePlayer(db, id, token) {
  if (!token) return null;
  const key = await sha256hex(token);
  return db.prepare(
    `SELECT side,participant_id,token_sha256,generation
     FROM gameplay_battle_capabilities
     WHERE battle_id=? AND token_sha256=? AND status='active'`
  ).bind(id, key).first();
}

async function storedReceipt(db, id, commandId) {
  return db.prepare(
    "SELECT fingerprint,code,event_ids_json,recorded_version FROM gameplay_command_receipts WHERE battle_id=? AND command_id=?"
  ).bind(id, commandId).first();
}

async function storedParticipantReceipt(db, id, commandId, authorized) {
  // Receipt disclosure is authorized by one SQL read that linearizes against
  // revocation/generation changes. A later revoke may race response delivery,
  // but a capability already revoked at this read cannot retrieve a receipt.
  return db.prepare(
    `SELECT r.fingerprint,r.code,r.event_ids_json,r.recorded_version
     FROM gameplay_command_receipts AS r
     WHERE r.battle_id=? AND r.command_id=?
       AND EXISTS (
         SELECT 1 FROM gameplay_battle_capabilities AS c
         WHERE c.battle_id=r.battle_id AND c.side=?
           AND c.participant_id=? AND c.token_sha256=?
           AND c.status='active' AND c.generation=?
       )`
  ).bind(id, commandId, authorized.side, authorized.participant_id,
    authorized.token_sha256, authorized.generation).first();
}

function insertTransition(db, current, result, commandId, fingerprint, now) {
  const newlyEmitted = result.state.events.filter(x => result.eventIds.includes(x.eventId));
  if (newlyEmitted.length !== result.eventIds.length) throw Error("EVENT_SOURCE_MISMATCH");
  return db.prepare(
    `INSERT INTO gameplay_apply_transition (
       battle_id,expected_version,command_id,fingerprint,receipt_code,
       receipt_event_ids_json,next_state_json,events_json,trusted_now_ms)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(
    current.battleId, current.version, commandId, fingerprint, result.code,
    JSON.stringify(result.eventIds), JSON.stringify(result.state), JSON.stringify(newlyEmitted), now,
  ).run();
}

function insertParticipantTransition(db, current, result, commandId, fingerprint, now, authorized) {
  const newlyEmitted = result.state.events.filter(x => result.eventIds.includes(x.eventId));
  if (newlyEmitted.length !== result.eventIds.length) throw Error("EVENT_SOURCE_MISMATCH");
  return db.prepare(
    `INSERT INTO gameplay_apply_participant_transition (
       battle_id,expected_version,command_id,fingerprint,receipt_code,
       receipt_event_ids_json,next_state_json,events_json,trusted_now_ms,
       capability_side,capability_token_sha256,expected_generation)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    current.battleId, current.version, commandId, fingerprint, result.code,
    JSON.stringify(result.eventIds), JSON.stringify(result.state), JSON.stringify(newlyEmitted), now,
    authorized.side, authorized.token_sha256, authorized.generation,
  ).run();
}

async function storedCreation(db, idempotencyHash) {
  return db.prepare(
    `SELECT idempotency_key_sha256,request_fingerprint_sha256,battle_id,deadline_at_ms,
            lifecycle_state,recovery_key_version,recovery_nonce_base64url,
            capabilities_ciphertext_base64url,original_a_token_sha256,
            original_a_generation,original_b_token_sha256,original_b_generation
     FROM gameplay_battle_creations WHERE idempotency_key_sha256=?`
  ).bind(idempotencyHash).first();
}

async function recoverCreation(row, fingerprint, idempotencyHash, env) {
  if (row.request_fingerprint_sha256 !== null && row.request_fingerprint_sha256 !== fingerprint) {
    return { error: "IDEMPOTENCY_KEY_REUSE", status: 409 };
  }
  if (row.lifecycle_state !== "RECOVERABLE") {
    return { error: "CREATION_RECOVERY_CLOSED", status: 410 };
  }
  // One SQL snapshot proves that recovery remains open and that both original
  // capability digests and generations are still active. A subsequent revoke
  // may race delivery, but its SQL update also invalidates these credentials.
  const eligible = await env.DB.prepare(
    `SELECT a.participant_id AS participant_a_id,
            b.participant_id AS participant_b_id
     FROM gameplay_battle_creations r
     JOIN gameplay_battle_capabilities a ON a.battle_id=r.battle_id AND a.side='A'
     JOIN gameplay_battle_capabilities b ON b.battle_id=r.battle_id AND b.side='B'
     WHERE r.idempotency_key_sha256=? AND r.lifecycle_state='RECOVERABLE'
       AND r.request_fingerprint_sha256=?
       AND a.status='active' AND a.token_sha256=r.original_a_token_sha256
       AND a.generation=r.original_a_generation
       AND b.status='active' AND b.token_sha256=r.original_b_token_sha256
       AND b.generation=r.original_b_generation`
  ).bind(idempotencyHash, fingerprint).first();
  if (!eligible) return { error: "CREATION_RECOVERY_CLOSED", status: 410 };
  const keyring = recoveryKeyring(env);
  const aad = canonical({
    purpose: "chat03b2-battle-create-v1", idempotencyHash, fingerprint,
    battleId: row.battle_id, deadlineAt: row.deadline_at_ms,
    keyVersion: row.recovery_key_version,
  });
  const recovered = await decryptCapabilities(row, keyring, aad);
  if (recovered.deadlineAt !== row.deadline_at_ms) throw Error("CREATE_RECOVERY_RECORD_INVALID");
  if (eligible.participant_a_id !== recovered.capabilities.A.participantId ||
      eligible.participant_b_id !== recovered.capabilities.B.participantId ||
      await sha256hex(recovered.capabilities.A.token) !== row.original_a_token_sha256 ||
      await sha256hex(recovered.capabilities.B.token) !== row.original_b_token_sha256) {
    throw Error("CREATE_RECOVERY_RECORD_INVALID");
  }
  return { battleId: row.battle_id, ...recovered, status: 200 };
}

async function createBattle(db, body, env, idempotencyKey) {
  if (!exactKeys(body, ["participants"])) return { error: "INVALID_CREATE", status: 400 };
  const ps = body.participants;
  if (!ps || !participantValid(ps.A) || !participantValid(ps.B) ||
      !exactKeys(ps, ["A", "B"]) || ps.A.id === ps.B.id) {
    return { error: "INVALID_PARTICIPANTS", status: 400 };
  }
  const idempotencyHash = await sha256hex("chat03b2:create-battle:v1:" + idempotencyKey);
  const fingerprint = await sha256hex(canonical({ participants: ps }));
  const prior = await storedCreation(db, idempotencyHash);
  if (prior) return recoverCreation(prior, fingerprint, idempotencyHash, env);
  const now = Date.now();
  const deadline = now + config(env);
  if (!Number.isSafeInteger(deadline)) return { error: "INVALID_DEADLINE", status: 500 };
  const id = crypto.randomUUID();
  const created = lifecycle.createBattle({
    battleId: id, participants: ps, createdAt: now, deadlineAt: deadline,
  });
  if (!created.ok) return { error: "INVALID_CREATE", status: 400 };
  const a = newCapability(), b = newCapability();
  const digestA = await sha256hex(a), digestB = await sha256hex(b);
  const generation = 1;
  const { keys, currentVersion } = recoveryKeyring(env);
  const aad = canonical({
    purpose: "chat03b2-battle-create-v1", idempotencyHash, fingerprint,
    battleId: id, deadlineAt: deadline, keyVersion: currentVersion,
  });
  const encrypted = await encryptCapabilities({
    deadlineAt: deadline,
    capabilities: {
      A: { participantId: ps.A.id, token: a },
      B: { participantId: ps.B.id, token: b },
    },
  }, currentVersion, keys[currentVersion], aad);
  const writes = [
    db.prepare(
      "INSERT INTO gameplay_create_battle (battle_id,initial_state_json,creation_event_json,trusted_now_ms) VALUES (?,?,?,?)"
    ).bind(id, JSON.stringify(created.state), JSON.stringify(created.state.events[0]), now),
    db.prepare(
      `INSERT INTO gameplay_battle_capabilities
       (battle_id,side,participant_id,token_sha256,created_at_ms,status,generation)
       VALUES (?,?,?,?,?,'active',?)`
    ).bind(id, "A", ps.A.id, digestA, now, generation),
    db.prepare(
      `INSERT INTO gameplay_battle_capabilities
       (battle_id,side,participant_id,token_sha256,created_at_ms,status,generation)
       VALUES (?,?,?,?,?,'active',?)`
    ).bind(id, "B", ps.B.id, digestB, now, generation),
    db.prepare(
      `INSERT INTO gameplay_battle_creations
       (idempotency_key_sha256,request_fingerprint_sha256,battle_id,deadline_at_ms,
        lifecycle_state,recovery_key_version,recovery_nonce_base64url,
        capabilities_ciphertext_base64url,original_a_token_sha256,original_a_generation,
        original_b_token_sha256,original_b_generation,created_at_ms)
       VALUES (?,?,?,?, 'RECOVERABLE',?,?,?,?,?,?,?,?)`
    ).bind(idempotencyHash, fingerprint, id, deadline, encrypted.keyVersion,
      encrypted.nonce, encrypted.ciphertext, digestA, generation, digestB, generation, now),
  ];
  // The unique idempotency hash arbitrates concurrent creates. D1 batch is
  // one transaction, so a losing request cannot leave a second genesis.
  try {
    await db.batch(writes);
  } catch (error) {
    const winner = await storedCreation(db, idempotencyHash);
    if (winner) return recoverCreation(winner, fingerprint, idempotencyHash, env);
    throw error;
  }
  return { battleId: id, deadlineAt: deadline, capabilities: {
    A: { participantId: ps.A.id, token: a },
    B: { participantId: ps.B.id, token: b },
  }, status: 201 };
}

async function mutateCapability(db, battleId, side, operation, expectedGeneration) {
  if (!Number.isSafeInteger(expectedGeneration) || expectedGeneration < 1 ||
      expectedGeneration >= 9007199254740991) {
    return { error: "INVALID_EXPECTED_GENERATION", status: 400 };
  }
  const current = await db.prepare(
    `SELECT participant_id,status,generation FROM gameplay_battle_capabilities
     WHERE battle_id=? AND side=?`
  ).bind(battleId, side).first();
  if (!current) return { error: "BATTLE_OR_CAPABILITY_NOT_FOUND", status: 404 };
  if (current.generation !== expectedGeneration) return { error: "STALE_GENERATION", status: 409 };
  if (operation === "revoke" && current.status !== "active") {
    return { error: "CAPABILITY_NOT_ACTIVE", status: 409 };
  }

  // A replacement response is the sole disclosure of its fresh bearer token.
  // If that response is lost, never replay the POST: inspect the current
  // generation through trusted D1 administration, then intentionally replace
  // again at that generation to invalidate the unknown token and receive a
  // different one. The endpoint never stores or recovers plaintext tokens.
  const replacementToken = operation === "replace" ? newCapability() : null;
  const replacementDigest = replacementToken ? await sha256hex(replacementToken) : null;
  const result = operation === "revoke"
    ? await db.prepare(
      `UPDATE gameplay_battle_capabilities
       SET status='revoked',generation=generation+1
       WHERE battle_id=? AND side=? AND status='active' AND generation=?
       RETURNING generation`
    ).bind(battleId, side, expectedGeneration).all()
    : await db.prepare(
      `UPDATE gameplay_battle_capabilities
       SET status='active',token_sha256=?,generation=generation+1
       WHERE battle_id=? AND side=? AND status=? AND generation=?
         AND token_sha256<>?
       RETURNING generation`
    ).bind(replacementDigest, battleId, side, current.status, expectedGeneration,
      replacementDigest).all();

  if (result.results?.length !== 1 || result.results[0].generation !== expectedGeneration + 1) {
    return { error: "STALE_GENERATION", status: 409 };
  }
  return operation === "replace"
    ? { generation: expectedGeneration + 1, token: replacementToken, status: 200 }
    : { generation: expectedGeneration + 1, status: 200 };
}

async function applySystem(db, id, type) {
  const commandId = "system:" + type + ":" + id;
  const fingerprint = canonical({ actor: "system", type });
  for (let attempt = 0; attempt < MAX_COMMAND_RETRIES; attempt++) {
    const prior = await storedReceipt(db, id, commandId);
    if (prior) return true;
    const state = await load(db, id);
    if (!state) return false;
    if (type === "reveal" && state.phase !== "committed") return false;
    if (type === "expire" && (!["created", "waiting"].includes(state.phase) || Date.now() < state.deadlineAt)) return false;
    const now = Date.now();
    const result = lifecycle.execute(state, {
      commandId, expectedVersion: state.version, type, actorId: "system",
    }, now);
    if (!result.ok) return false;
    try {
      await insertTransition(db, state, result, commandId, fingerprint, now);
      return true;
    } catch (error) {
      if (!String(error).includes("VERSION_CONFLICT")) throw error;
    }
  }
  return false;
}

async function commit(db, id, authorized, body) {
  if (!exactKeys(body, ["commandId", "selection"]) ||
      typeof body.commandId !== "string" || !/^[A-Za-z0-9:_-]{4,100}$/.test(body.commandId) ||
      !body.selection || typeof body.selection !== "object" || Array.isArray(body.selection)) {
    return { error: "INVALID_COMMAND", status: 400 };
  }
  // Per-player command namespace: two clients may independently generate
  // the same local id. Never let A claim, collide with, or probe B's receipt.
  const scopedCommandId = authorized.side + ":" + body.commandId;
  const fingerprint = canonical({ side: authorized.side, commandId: body.commandId, selection: body.selection });
  for (let attempt = 0; attempt < MAX_COMMAND_RETRIES; attempt++) {
    const prior = await storedParticipantReceipt(db, id, scopedCommandId, authorized);
    if (prior) {
      // The receipt lookup and response view are separate reads. Revalidate at
      // the state read that supplies the replay response, before inspecting its
      // fingerprint or disclosing the stored receipt.
      const current = await loadAuthorized(db, id, authorized);
      if (!current) return { error: "UNAUTHORIZED", status: 401 };
      if (prior.fingerprint !== fingerprint) return { error: "COMMAND_ID_REUSE", status: 409 };
      return {
        code: prior.code, replayed: true, eventIds: JSON.parse(prior.event_ids_json),
        version: prior.recorded_version,
        view: lifecycle.getPublicView(current, authorized.participant_id),
      };
    }
    // Recheck the complete capability tuple in the same read that supplies
    // state used for command outcomes such as ALREADY_COMMITTED.
    const state = await loadAuthorized(db, id, authorized);
    if (!state) return { error: "UNAUTHORIZED", status: 401 };
    if (state.participants[authorized.side]?.id !== authorized.participant_id) {
      return { error: "INVALID_CAPABILITY", status: 403 };
    }
    // A confirmed choice is immutable. Fresh command IDs cannot turn an
    // already-committed intent into a state transition or durable receipt.
    // If two first-commit requests race, the loser retries after the SQL CAS
    // conflict and reaches this guard against the winning snapshot.
    if (Object.prototype.hasOwnProperty.call(state.commits, authorized.side)) {
      const expectedRole = state.participants[authorized.side].role;
      const requestedSelection = normalizeSelection(body.selection, expectedRole);
      if (!requestedSelection) return { error: "INVALID_SELECTION", status: 409 };
      const committedSelection = normalizeSelection(state.commits[authorized.side].selection, expectedRole);
      return {
        error: committedSelection && canonical(requestedSelection) === canonical(committedSelection)
          ? "ALREADY_COMMITTED" : "COMMIT_IMMUTABLE",
        status: 409,
      };
    }
    const now = Date.now();
    const command = {
      type: "commit", commandId: scopedCommandId, expectedVersion: state.version,
      actorId: authorized.participant_id, participantId: authorized.participant_id,
      selection: body.selection,
    };
    const result = lifecycle.execute(state, command, now);
    if (!result.ok) return { error: result.error, status: 409 };
    try {
      await insertParticipantTransition(db, state, result, command.commandId, fingerprint, now, authorized);
      // Disclosure requires both commits; automatically reveal without trusting
      // client/system credentials. Cron also retries if interrupted here.
      if (result.state.phase === "committed") {
        try { await applySystem(db, id, "reveal"); } catch (_) { /* recover via cron */ }
      }
      // The participant write fence already linearized this transition. Keep
      // its durable success response if revocation lands before HTTP delivery;
      // an in-flight response cannot be reliably cancelled after that commit.
      const latest = await load(db, id);
      return { code: result.code, replayed: false, eventIds: result.eventIds,
        version: result.state.version,
        view: lifecycle.getPublicView(latest, authorized.participant_id) };
    } catch (error) {
      if (String(error).includes("INVALID_CAPABILITY")) {
        return { error: "INVALID_CAPABILITY", status: 403 };
      }
      if (!String(error).includes("VERSION_CONFLICT")) throw error;
      // Retry against the latest authoritative snapshot, re-evaluating
      // the intent under the same original request fingerprint.
    }
  }
  return { error: "CONFLICT_RETRY_EXHAUSTED", status: 409 };
}

async function api(request, env) {
  const pathname = new URL(request.url).pathname;
  const capabilityStatusMatch = /^\/v1\/admin\/battles\/([^/]+)\/capabilities\/([^/]+)\/status$/.exec(pathname);
  if (capabilityStatusMatch) {
    // Status readback is a separate server-to-server, read-only credential.
    // It never opts into browser CORS and does not require mutation authority.
    if (request.headers.has("origin") || request.method === "OPTIONS") {
      return encodeJSON({ error: "ORIGIN_FORBIDDEN" }, 403);
    }
    if (request.method !== "GET") return encodeJSON({ error: "METHOD_NOT_ALLOWED" }, 405);
    const [, battleId, side] = capabilityStatusMatch;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(battleId) ||
        !["A", "B"].includes(side)) {
      return encodeJSON({ error: "NOT_FOUND" }, 404);
    }
    if (!operatorReadAuthorized(request, env)) return encodeJSON({ error: "UNAUTHORIZED" }, 401);
    if (!env.DB) throw new Error("GAMEPLAY_CONFIG_MISSING");
    const capability = await env.DB.prepare(
      `SELECT generation,status FROM gameplay_battle_capabilities
       WHERE battle_id=? AND side=?`
    ).bind(battleId, side).first();
    if (!capability) return encodeJSON({ error: "NOT_FOUND" }, 404);
    return encodeJSON({ generation: capability.generation, status: capability.status });
  }

  config(env);
  const origin = request.headers.get("origin");
  if (origin && (typeof env.ALLOWED_ORIGIN !== "string" || origin !== env.ALLOWED_ORIGIN)) {
    return encodeJSON({ error: "ORIGIN_FORBIDDEN" }, 403);
  }
  const operatorMatch = /^\/v1\/admin\/battles\/([a-f0-9-]{36})\/capabilities\/([AB])\/(revoke|replace)$/.exec(pathname);
  if (operatorMatch) {
    // These server-to-server controls never opt into browser CORS, including
    // preflight from the otherwise allowed gameplay origin.
    if (request.headers.has("origin") || request.method === "OPTIONS") {
      return encodeJSON({ error: "ORIGIN_FORBIDDEN" }, 403);
    }
    if (request.method !== "POST") return encodeJSON({ error: "METHOD_NOT_ALLOWED" }, 405);
    if (!adminAuthorized(request, env)) return encodeJSON({ error: "UNAUTHORIZED" }, 401);
    const body = await parseBody(request);
    if (!exactKeys(body, ["expectedGeneration"]) ||
        !Number.isSafeInteger(body.expectedGeneration) || body.expectedGeneration < 1) {
      return encodeJSON({ error: "INVALID_EXPECTED_GENERATION" }, 400);
    }
    const [, battleId, side, operation] = operatorMatch;
    const result = await mutateCapability(env.DB, battleId, side, operation, body.expectedGeneration);
    const { status, ...payload } = result;
    return encodeJSON(payload, status, null);
  }
  if (request.method === "OPTIONS") return encodeJSON({ ok: true }, 200, origin);
  if (pathname === "/v1/admin/battles" && request.method === "POST") {
    if (!adminAuthorized(request, env)) return encodeJSON({ error: "UNAUTHORIZED" }, 401, origin);
    const body = await parseBody(request);
    const idempotencyKey = request.headers.get("idempotency-key") || "";
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(idempotencyKey)) {
      return encodeJSON({ error: "INVALID_IDEMPOTENCY_KEY" }, 400, origin);
    }
    const result = await createBattle(env.DB, body, env, idempotencyKey);
    const { status, ...payload } = result;
    return encodeJSON(payload, status || 200, origin);
  }
  const match = /^\/v1\/battles\/([a-f0-9-]{36})(?:\/(commit))?$/.exec(pathname);
  if (!match) return encodeJSON({ error: "NOT_FOUND" }, 404, origin);
  const id = match[1];
  const auth = await authorizePlayer(env.DB, id, bearer(request));
  if (!auth) return encodeJSON({ error: "UNAUTHORIZED" }, 401, origin);
  if (match[2] === "commit" && request.method === "POST") {
    const result = await commit(env.DB, id, auth, await parseBody(request));
    const { status, ...payload } = result;
    return encodeJSON(payload, status || 200, origin);
  }
  if (!match[2] && request.method === "GET") {
    const state = await loadAuthorized(env.DB, id, auth);
    return state ? encodeJSON(lifecycle.getPublicView(state, auth.participant_id), 200, origin)
      : encodeJSON({ error: "UNAUTHORIZED" }, 401, origin);
  }
  return encodeJSON({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
}

export default {
  async fetch(request, env) {
    try {
      return await api(request, env);
    } catch (error) {
      const message = String(error?.message || "");
      const input = message.includes("BODY_TOO_LARGE") ? 413
        : message.includes("INVALID_BODY") || error instanceof SyntaxError ? 400 : 500;
      // No stack, SQL, secret or internal private state in client responses.
      return encodeJSON({ error: input === 500 ? "SERVER_ERROR" : "BAD_REQUEST" }, input);
    }
  },
  async scheduled(_event, env) {
    try {
      config(env);
      const rows = await env.DB.prepare(
        `SELECT battle_id,phase,state_json
         FROM gameplay_battles
         WHERE phase = 'committed'
            OR (phase IN ('created','waiting')
                AND json_extract(state_json,'$.deadlineAt') <= ?)
         ORDER BY CASE WHEN phase = 'committed' THEN 0 ELSE 1 END,
                  updated_at_ms
         LIMIT 100`
      ).bind(Date.now()).all();
      for (const row of rows.results || []) {
        try {
          if (row.phase === "committed") await applySystem(env.DB, row.battle_id, "reveal");
          else if (JSON.parse(row.state_json).deadlineAt <= Date.now()) {
            await applySystem(env.DB, row.battle_id, "expire");
          }
        } catch (_) { /* next cron pass retries; no secret logging */ }
      }
    } catch (_) { /* fail closed; do not expose game state */ }
  },
};
