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

function adminAuthorized(req, env) {
  const secret = env.ADMIN_CONTROL_TOKEN;
  return typeof secret === "string" && secret.length >= 32 &&
    secretEquals(bearer(req), secret);
}

function config(env) {
  if (!env.DB || typeof env.ADMIN_CONTROL_TOKEN !== "string" || env.ADMIN_CONTROL_TOKEN.length < 32) {
    throw new Error("GAMEPLAY_CONFIG_MISSING");
  }
  const windowMs = Number(env.COMMIT_WINDOW_MS);
  if (!Number.isSafeInteger(windowMs) || windowMs < 60000 || windowMs > 604800000) {
    throw new Error("GAMEPLAY_WINDOW_POLICY_MISSING");
  }
  return windowMs;
}

async function parseBody(request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (text.length > MAX_BODY) throw new Error("BODY_TOO_LARGE");
  const obj = JSON.parse(text);
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("INVALID_BODY");
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

async function authorizePlayer(db, id, token) {
  if (!token) return null;
  const key = await sha256hex(token);
  return db.prepare(
    "SELECT side,participant_id FROM gameplay_battle_capabilities WHERE battle_id=? AND token_sha256=?"
  ).bind(id, key).first();
}

async function storedReceipt(db, id, commandId) {
  return db.prepare(
    "SELECT fingerprint,code,event_ids_json,recorded_version FROM gameplay_command_receipts WHERE battle_id=? AND command_id=?"
  ).bind(id, commandId).first();
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

async function createBattle(db, body, env) {
  if (!exactKeys(body, ["participants"])) return { error: "INVALID_CREATE", status: 400 };
  const ps = body.participants;
  if (!ps || !participantValid(ps.A) || !participantValid(ps.B) ||
      !exactKeys(ps, ["A", "B"]) || ps.A.id === ps.B.id) {
    return { error: "INVALID_PARTICIPANTS", status: 400 };
  }
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
  // D1 batch executes as an atomic transaction. If either insert fails,
  // the battle/origin event and both capability rows roll back together.
  await db.batch([
    db.prepare(
      "INSERT INTO gameplay_create_battle (battle_id,initial_state_json,creation_event_json,trusted_now_ms) VALUES (?,?,?,?)"
    ).bind(id, JSON.stringify(created.state), JSON.stringify(created.state.events[0]), now),
    db.prepare(
      "INSERT INTO gameplay_battle_capabilities (battle_id,side,participant_id,token_sha256,created_at_ms) VALUES (?,?,?,?,?)"
    ).bind(id, "A", ps.A.id, digestA, now),
    db.prepare(
      "INSERT INTO gameplay_battle_capabilities (battle_id,side,participant_id,token_sha256,created_at_ms) VALUES (?,?,?,?,?)"
    ).bind(id, "B", ps.B.id, digestB, now),
  ]);
  return { battleId: id, deadlineAt: deadline, capabilities: {
    A: { participantId: ps.A.id, token: a },
    B: { participantId: ps.B.id, token: b },
  }, status: 201 };
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
  const fingerprint = canonical({ side: authorized.side, commandId: body.commandId, selection: body.selection });
  for (let attempt = 0; attempt < MAX_COMMAND_RETRIES; attempt++) {
    const prior = await storedReceipt(db, id, body.commandId);
    if (prior) {
      if (prior.fingerprint !== fingerprint) return { error: "COMMAND_ID_REUSE", status: 409 };
      const current = await load(db, id);
      return {
        code: prior.code, replayed: true, eventIds: JSON.parse(prior.event_ids_json),
        version: prior.recorded_version,
        view: lifecycle.getPublicView(current, authorized.participant_id),
      };
    }
    const state = await load(db, id);
    if (!state) return { error: "NOT_FOUND", status: 404 };
    if (state.participants[authorized.side]?.id !== authorized.participant_id) {
      return { error: "INVALID_CAPABILITY", status: 403 };
    }
    const now = Date.now();
    const command = {
      type: "commit", commandId: body.commandId, expectedVersion: state.version,
      actorId: authorized.participant_id, participantId: authorized.participant_id,
      selection: body.selection,
    };
    const result = lifecycle.execute(state, command, now);
    if (!result.ok) return { error: result.error, status: 409 };
    try {
      await insertTransition(db, state, result, command.commandId, fingerprint, now);
      // Disclosure requires both commits; automatically reveal without trusting
      // client/system credentials. Cron also retries if interrupted here.
      if (result.state.phase === "committed") {
        try { await applySystem(db, id, "reveal"); } catch (_) { /* recover via cron */ }
      }
      const latest = await load(db, id);
      return { code: result.code, replayed: false, eventIds: result.eventIds,
        version: result.state.version,
        view: lifecycle.getPublicView(latest, authorized.participant_id) };
    } catch (error) {
      if (!String(error).includes("VERSION_CONFLICT")) throw error;
      // Retry against the latest authoritative snapshot, re-evaluating
      // the intent under the same original request fingerprint.
    }
  }
  return { error: "CONFLICT_RETRY_EXHAUSTED", status: 409 };
}

async function api(request, env) {
  config(env);
  const origin = request.headers.get("origin");
  if (origin && (typeof env.ALLOWED_ORIGIN !== "string" || origin !== env.ALLOWED_ORIGIN)) {
    return encodeJSON({ error: "ORIGIN_FORBIDDEN" }, 403);
  }
  if (request.method === "OPTIONS") return encodeJSON({ ok: true }, 204, origin);
  const pathname = new URL(request.url).pathname;
  if (pathname === "/v1/admin/battles" && request.method === "POST") {
    if (!adminAuthorized(request, env)) return encodeJSON({ error: "UNAUTHORIZED" }, 401, origin);
    const body = await parseBody(request);
    const result = await createBattle(env.DB, body, env);
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
    const state = await load(env.DB, id);
    return state ? encodeJSON(lifecycle.getPublicView(state, auth.participant_id), 200, origin)
      : encodeJSON({ error: "NOT_FOUND" }, 404, origin);
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
        "SELECT battle_id,phase,state_json FROM gameplay_battles WHERE phase IN ('created','waiting','committed') ORDER BY updated_at_ms LIMIT 100"
      ).all();
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
