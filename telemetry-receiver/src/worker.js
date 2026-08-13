const CONTRACT_VERSION = 1;
const EVENT_SCHEMA_VERSION = 1;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_EVENTS_PER_BATCH = 50;
const DEFAULT_RETENTION_DAYS = 30;
const MAX_EXPORT_ROWS = 10000;
const MAX_CLOCK_SKEW_FUTURE_MS = 5 * 60 * 1000;
const MAX_EVENT_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/;

const EVENT_TYPES = new Set([
  "session_start", "session_end",
  "screen_enter", "screen_exit",
  "modal_open", "modal_close",
  "button_click", "action",
  "choice_selected", "state_changed",
  "question_shown", "question_answered",
  "visibility_hidden", "visibility_visible",
  "abandon", "return",
  "cycle_started", "cycle_completed",
]);

const CONTEXT_KEYS = new Set(["screenId", "modalId", "questionId", "cycleId"]);
const PAYLOAD_KEYS = Object.freeze({
  session_start: new Set(["returnVisit", "transportEnabled"]),
  session_end: new Set(["reason", "durationMs", "foregroundDwellMs", "screenId", "modalId", "questionId", "cycleId"]),
  screen_enter: new Set(["screenId", "reason"]),
  screen_exit: new Set(["screenId", "foregroundDwellMs", "reason"]),
  modal_open: new Set(["modalId"]),
  modal_close: new Set(["modalId", "foregroundDwellMs", "reason"]),
  button_click: new Set(["actionId", "elementId", "firstActionMs"]),
  action: new Set([
    "actionId", "aftermathId", "targetNpcId", "branchId", "secondRoundChoiceId",
    "battleId", "outcomeRaw", "outcomeKind", "applyCount", "contactId", "dmStatus",
    "followUpId", "lineId", "deliveryCount", "settlementId", "dueAt", "npcCount",
    "mode", "worldAdvanceId", "payoffId", "markedDefenseId", "attemptCount", "reason",
    "choiceId", "npcId", "visit", "score", "total", "bridgeId", "status",
    "revealedAttackColorId", "payoffStatus", "firstActionMs", "foregroundDwellMs",
    "color", "outcome", "revealCount", "trigger",
  ]),
  choice_selected: new Set(["flowId", "stateId", "choiceId", "questionId", "battleId"]),
  state_changed: new Set(["flowId", "fromStateId", "toStateId"]),
  question_shown: new Set(["flowId", "questionId"]),
  question_answered: new Set(["flowId", "questionId", "answerId", "foregroundDwellMs"]),
  visibility_hidden: new Set(["foregroundElapsedMs"]),
  visibility_visible: new Set(["hiddenMs", "foregroundElapsedMs"]),
  abandon: new Set(["priorSessionId", "screenId", "questionId", "cycleId", "elapsedMs"]),
  return: new Set(["priorSessionId", "elapsedMs", "reason"]),
  cycle_started: new Set(["flowId", "cycleId"]),
  cycle_completed: new Set(["flowId", "cycleId", "foregroundDwellMs", "outcomeId"]),
});

const EVENT_KEYS = new Set([
  "schemaVersion", "eventId", "sequence", "type", "occurredAt", "monotonicMs",
  "anonymousId", "sessionId", "pageViewId", "context", "payload",
]);
const ENVELOPE_KEYS = new Set([
  "contractVersion", "schemaVersion", "batchId", "mode", "cohortId", "events",
]);
const BOOLEAN_FIELDS = new Set(["returnVisit", "transportEnabled"]);
const NUMBER_FIELDS = new Set([
  "durationMs", "foregroundDwellMs", "firstActionMs", "applyCount", "deliveryCount",
  "dueAt", "npcCount", "attemptCount", "visit", "score", "total", "revealCount",
  "foregroundElapsedMs", "hiddenMs", "elapsedMs",
]);

function exactKeys(value, allowed) {
  return value && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).every((key) => allowed.has(key));
}

function safeId(value) {
  return typeof value === "string" && SAFE_ID.test(value);
}

function safeField(key, value) {
  if (BOOLEAN_FIELDS.has(key)) return typeof value === "boolean";
  if (NUMBER_FIELDS.has(key)) return Number.isSafeInteger(value) && value >= 0;
  return safeId(value);
}

function validateBag(value, allowedKeys) {
  if (!exactKeys(value, allowedKeys)) return false;
  return Object.entries(value).every(([key, item]) => safeField(key, item));
}

export function validateEnvelope(input, expectedCohort, now = Date.now()) {
  if (!exactKeys(input, ENVELOPE_KEYS)) return { ok: false, error: "invalid_envelope_keys" };
  if (input.contractVersion !== CONTRACT_VERSION || input.schemaVersion !== EVENT_SCHEMA_VERSION) {
    return { ok: false, error: "unsupported_contract" };
  }
  if (input.mode !== "private_friends_alpha" || input.cohortId !== expectedCohort || !safeId(input.cohortId)) {
    return { ok: false, error: "invalid_cohort" };
  }
  if (!safeId(input.batchId)) return { ok: false, error: "invalid_batch_id" };
  if (!Array.isArray(input.events) || input.events.length < 1 || input.events.length > MAX_EVENTS_PER_BATCH) {
    return { ok: false, error: "invalid_batch_size" };
  }

  let anonymousId = null;
  const eventIds = new Set();
  for (const event of input.events) {
    if (!exactKeys(event, EVENT_KEYS)) return { ok: false, error: "invalid_event_keys" };
    if (event.schemaVersion !== EVENT_SCHEMA_VERSION || !EVENT_TYPES.has(event.type)) {
      return { ok: false, error: "invalid_event_type" };
    }
    for (const key of ["eventId", "anonymousId", "sessionId", "pageViewId"]) {
      if (!safeId(event[key])) return { ok: false, error: `invalid_${key}` };
    }
    if (eventIds.has(event.eventId)) return { ok: false, error: "duplicate_event_id_in_batch" };
    eventIds.add(event.eventId);
    if (anonymousId === null) anonymousId = event.anonymousId;
    if (event.anonymousId !== anonymousId) return { ok: false, error: "mixed_anonymous_ids" };
    if (!Number.isSafeInteger(event.sequence) || event.sequence < 1) return { ok: false, error: "invalid_sequence" };
    if (!Number.isSafeInteger(event.occurredAt)
      || event.occurredAt < now - MAX_EVENT_AGE_MS
      || event.occurredAt > now + MAX_CLOCK_SKEW_FUTURE_MS) {
      return { ok: false, error: "invalid_occurred_at" };
    }
    if (!Number.isSafeInteger(event.monotonicMs) || event.monotonicMs < 0 || event.monotonicMs > MAX_EVENT_AGE_MS) {
      return { ok: false, error: "invalid_monotonic_ms" };
    }
    if (!validateBag(event.context, CONTEXT_KEYS)) return { ok: false, error: "invalid_context" };
    if (!validateBag(event.payload, PAYLOAD_KEYS[event.type])) return { ok: false, error: "invalid_payload" };
  }
  return { ok: true, anonymousId };
}

function securityHeaders(extra = {}) {
  return {
    "cache-control": "no-store",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    ...extra,
  };
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders({ "content-type": "application/json; charset=utf-8", ...headers }),
  });
}

function allowedOrigins(env) {
  return new Set(String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean));
}

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

function isAuthorized(request, env) {
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${String(env.OWNER_TOKEN || "")}`;
  if (!env.OWNER_TOKEN || supplied.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < supplied.length; index += 1) {
    mismatch |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

function normalizedEvent(event, batchId, receivedAt) {
  const context = event.context || {};
  const payload = event.payload || {};
  const pick = (key) => payload[key] || context[key] || null;
  const dwell = payload.foregroundDwellMs;
  return [
    event.eventId, batchId, event.schemaVersion, event.type, event.occurredAt, receivedAt,
    event.sequence, event.monotonicMs, event.anonymousId, event.sessionId, event.pageViewId,
    pick("screenId"), pick("modalId"), pick("questionId"), pick("cycleId"),
    pick("actionId"), pick("choiceId"), pick("flowId"), pick("stateId"),
    pick("fromStateId"), pick("toStateId"), pick("battleId"), pick("answerId"),
    pick("outcomeId"), pick("reason"), Number.isSafeInteger(dwell) ? dwell : null,
    JSON.stringify(context), JSON.stringify(payload),
  ];
}

async function ingest(request, env) {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigins(env).has(origin)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  const cors = corsHeaders(origin);
  if ((request.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    return json({ ok: false, error: "content_type_required" }, 415, cors);
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413, cors);

  let text;
  try {
    text = await request.text();
  } catch (_) {
    return json({ ok: false, error: "body_unreadable" }, 400, cors);
  }
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413, cors);
  }

  let input;
  try {
    input = JSON.parse(text);
  } catch (_) {
    return json({ ok: false, error: "invalid_json" }, 400, cors);
  }
  const validated = validateEnvelope(input, String(env.COHORT_ID || ""));
  if (!validated.ok) return json({ ok: false, error: validated.error }, 400, cors);

  const existing = await env.DB.prepare(
    "SELECT anonymous_id, submitted_event_count, inserted_event_count FROM telemetry_batches WHERE batch_id = ?"
  ).bind(input.batchId).first();
  if (existing) {
    if (existing.anonymous_id !== validated.anonymousId
      || Number(existing.submitted_event_count) !== input.events.length) {
      return json({ ok: false, error: "batch_id_conflict" }, 409, cors);
    }
    return json({ ok: true, duplicate: true, accepted: Number(existing.inserted_event_count || 0), batchId: input.batchId }, 200, cors);
  }

  if (!env.INGEST_RATE_LIMITER || typeof env.INGEST_RATE_LIMITER.limit !== "function") {
    return json({ ok: false, error: "rate_limiter_unavailable" }, 503, { ...cors, "retry-after": "10" });
  }
  const limited = await env.INGEST_RATE_LIMITER.limit({ key: `ingest:${validated.anonymousId}` });
  if (!limited.success) return json({ ok: false, error: "rate_limited" }, 429, { ...cors, "retry-after": "60" });

  const recentVolume = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM telemetry_events WHERE anonymous_id = ? AND received_at >= ?"
  ).bind(validated.anonymousId, Date.now() - 60 * 60 * 1000).first();
  if (Number(recentVolume && recentVolume.count || 0) + input.events.length > 5000) {
    return json({ ok: false, error: "hourly_event_limit" }, 429, { ...cors, "retry-after": "3600" });
  }

  const receivedAt = Date.now();
  const placeholders = input.events.map(() => "?").join(", ");
  const priorEvents = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM telemetry_events WHERE event_id IN (${placeholders})`
  ).bind(...input.events.map((event) => event.eventId)).first();
  const insertedEventCount = Math.max(0, input.events.length - Number(priorEvents && priorEvents.count || 0));
  const insertEventSql = `INSERT OR IGNORE INTO telemetry_events (
    event_id, batch_id, schema_version, event_type, occurred_at, received_at,
    sequence, monotonic_ms, anonymous_id, session_id, page_view_id,
    screen_id, modal_id, question_id, cycle_id, action_id, choice_id, flow_id,
    state_id, from_state_id, to_state_id, battle_id, answer_id, outcome_id,
    reason_id, foreground_dwell_ms, context_json, payload_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const eventStatements = input.events.map((event) => env.DB.prepare(insertEventSql)
    .bind(...normalizedEvent(event, input.batchId, receivedAt)));
  const batchStatement = env.DB.prepare(`INSERT INTO telemetry_batches (
    batch_id, contract_version, schema_version, cohort_id, anonymous_id,
    received_at, submitted_event_count, inserted_event_count
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(input.batchId, CONTRACT_VERSION, EVENT_SCHEMA_VERSION, input.cohortId,
      validated.anonymousId, receivedAt, input.events.length, insertedEventCount);

  try {
    await env.DB.batch([batchStatement, ...eventStatements]);
  } catch (_) {
    return json({ ok: false, error: "storage_unavailable" }, 503, { ...cors, "retry-after": "10" });
  }
  return json({ ok: true, duplicate: false, accepted: insertedEventCount, batchId: input.batchId }, 202, cors);
}

function clampDays(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) ? Math.min(90, Math.max(1, parsed)) : fallback;
}

async function adminSummary(request, env) {
  if (!isAuthorized(request, env)) return json({ ok: false, error: "unauthorized" }, 401, { "www-authenticate": "Bearer" });
  const url = new URL(request.url);
  const days = clampDays(url.searchParams.get("days"), 30);
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const [totals, types, screens, questions, actions, choices, exits, funnel, sessionEvents] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS event_count, COUNT(DISTINCT anonymous_id) AS anonymous_count, COUNT(DISTINCT session_id) AS session_count FROM telemetry_events WHERE received_at >= ?").bind(since),
    env.DB.prepare("SELECT event_type, COUNT(*) AS count FROM telemetry_events WHERE received_at >= ? GROUP BY event_type ORDER BY count DESC, event_type").bind(since),
    env.DB.prepare("SELECT screen_id, COUNT(*) AS exits, SUM(foreground_dwell_ms) AS foreground_dwell_ms FROM telemetry_events WHERE received_at >= ? AND event_type = 'screen_exit' AND screen_id IS NOT NULL GROUP BY screen_id ORDER BY exits DESC, screen_id").bind(since),
    env.DB.prepare("SELECT question_id, COUNT(*) AS answers, SUM(foreground_dwell_ms) AS foreground_dwell_ms FROM telemetry_events WHERE received_at >= ? AND event_type = 'question_answered' AND question_id IS NOT NULL GROUP BY question_id ORDER BY answers DESC, question_id").bind(since),
    env.DB.prepare("SELECT action_id, COUNT(*) AS count FROM telemetry_events WHERE received_at >= ? AND action_id IS NOT NULL GROUP BY action_id ORDER BY count DESC, action_id LIMIT 200").bind(since),
    env.DB.prepare("SELECT choice_id, COUNT(*) AS count FROM telemetry_events WHERE received_at >= ? AND choice_id IS NOT NULL GROUP BY choice_id ORDER BY count DESC, choice_id LIMIT 200").bind(since),
    env.DB.prepare(`SELECT event_type, screen_id, question_id, COUNT(*) AS session_count FROM (
      SELECT event_type, screen_id, question_id,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY occurred_at DESC, sequence DESC, event_id DESC) AS row_number
      FROM telemetry_events WHERE received_at >= ?
    ) WHERE row_number = 1
    GROUP BY event_type, screen_id, question_id
    ORDER BY session_count DESC, event_type, screen_id, question_id LIMIT 200`).bind(since),
    env.DB.prepare(`SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'session_start' THEN session_id END) AS sessions_started,
      COUNT(DISTINCT CASE WHEN event_type = 'button_click' THEN session_id END) AS sessions_with_click,
      COUNT(DISTINCT CASE WHEN event_type = 'choice_selected' THEN session_id END) AS sessions_with_choice,
      COUNT(DISTINCT CASE WHEN event_type = 'question_shown' THEN session_id END) AS sessions_with_question,
      COUNT(DISTINCT CASE WHEN event_type = 'question_answered' THEN session_id END) AS sessions_with_answer,
      COUNT(DISTINCT CASE WHEN event_type = 'cycle_completed' THEN session_id END) AS sessions_with_completed_cycle,
      COUNT(DISTINCT CASE WHEN event_type = 'return' THEN session_id END) AS returning_sessions
      FROM telemetry_events WHERE received_at >= ?`).bind(since),
    env.DB.prepare(`SELECT session_id, occurred_at, sequence, event_type FROM (
      SELECT session_id, occurred_at, sequence, event_type, received_at, event_id
      FROM telemetry_events WHERE received_at >= ?
      ORDER BY received_at DESC, event_id DESC LIMIT 5000
    ) ORDER BY session_id, occurred_at, sequence`).bind(since),
  ]);
  const pathMap = new Map();
  for (const row of sessionEvents.results || []) {
    const item = pathMap.get(row.session_id) || {
      session_id: row.session_id,
      started_at: row.occurred_at,
      ended_at: row.occurred_at,
      event_count: 0,
      path: [],
    };
    item.started_at = Math.min(item.started_at, row.occurred_at);
    item.ended_at = Math.max(item.ended_at, row.occurred_at);
    item.event_count += 1;
    item.path.push(row.event_type);
    pathMap.set(row.session_id, item);
  }
  const recentSessionPaths = Array.from(pathMap.values())
    .sort((left, right) => right.started_at - left.started_at)
    .slice(0, 200)
    .map((item) => ({ ...item, path: item.path.join(">") }));
  return json({
    ok: true,
    contractVersion: CONTRACT_VERSION,
    generatedAt: Date.now(),
    windowDays: days,
    totals: totals.results && totals.results[0] || {},
    eventTypes: types.results || [],
    screens: screens.results || [],
    questions: questions.results || [],
    actions: actions.results || [],
    choices: choices.results || [],
    exitPoints: exits.results || [],
    funnel: funnel.results && funnel.results[0] || {},
    recentSessionPaths,
  });
}

async function adminSessions(request, env) {
  if (!isAuthorized(request, env)) return json({ ok: false, error: "unauthorized" }, 401, { "www-authenticate": "Bearer" });
  const url = new URL(request.url);
  const days = clampDays(url.searchParams.get("days"), 30);
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const sessionId = url.searchParams.get("sessionId") || "";
  if (sessionId) {
    if (!safeId(sessionId)) return json({ ok: false, error: "invalid_session_id" }, 400);
    const result = await env.DB.prepare(`SELECT event_id, event_type, occurred_at, sequence,
      monotonic_ms, screen_id, modal_id, question_id, cycle_id, action_id, choice_id,
      flow_id, state_id, from_state_id, to_state_id, battle_id, answer_id, outcome_id,
      reason_id, foreground_dwell_ms, context_json, payload_json
      FROM telemetry_events WHERE session_id = ? AND received_at >= ?
      ORDER BY occurred_at, sequence, event_id LIMIT 2000`).bind(sessionId, since).all();
    return json({
      ok: true,
      contractVersion: CONTRACT_VERSION,
      generatedAt: Date.now(),
      windowDays: days,
      sessionId,
      events: result.results || [],
    });
  }
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "100", 10);
  const limit = Math.min(200, Math.max(1, Number.isFinite(requestedLimit) ? requestedLimit : 100));
  const result = await env.DB.prepare(`SELECT session_id, anonymous_id,
    MIN(occurred_at) AS started_at, MAX(occurred_at) AS ended_at,
    COUNT(*) AS event_count,
    SUM(CASE WHEN event_type = 'return' THEN 1 ELSE 0 END) AS return_count,
    SUM(CASE WHEN event_type = 'choice_selected' THEN 1 ELSE 0 END) AS choice_count,
    SUM(CASE WHEN event_type = 'button_click' THEN 1 ELSE 0 END) AS click_count
    FROM telemetry_events WHERE received_at >= ?
    GROUP BY session_id, anonymous_id ORDER BY started_at DESC LIMIT ?`).bind(since, limit).all();
  return json({
    ok: true,
    contractVersion: CONTRACT_VERSION,
    generatedAt: Date.now(),
    windowDays: days,
    sessions: result.results || [],
  });
}

async function adminExport(request, env) {
  if (!isAuthorized(request, env)) return json({ ok: false, error: "unauthorized" }, 401, { "www-authenticate": "Bearer" });
  const url = new URL(request.url);
  const days = clampDays(url.searchParams.get("days"), 30);
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "1000", 10);
  const limit = Math.min(MAX_EXPORT_ROWS, Math.max(1, Number.isFinite(requestedLimit) ? requestedLimit : 1000));
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const cursor = Math.max(0, Number.parseInt(url.searchParams.get("afterReceivedAt") || "0", 10) || 0);
  const afterEventId = safeId(url.searchParams.get("afterEventId")) ? url.searchParams.get("afterEventId") : "";
  const result = await env.DB.prepare(`SELECT * FROM telemetry_events
    WHERE received_at >= ? AND (received_at > ? OR (received_at = ? AND event_id > ?))
    ORDER BY received_at, event_id LIMIT ?`).bind(since, cursor, cursor, afterEventId, limit).all();
  const rows = result.results || [];
  const body = rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : "");
  return new Response(body, {
    status: 200,
    headers: securityHeaders({
      "content-type": "application/x-ndjson; charset=utf-8",
      "content-disposition": `attachment; filename="asynchronia-telemetry-${Date.now()}.ndjson"`,
      "x-next-received-at": String(rows.length ? rows[rows.length - 1].received_at : cursor),
      "x-next-event-id": String(rows.length ? rows[rows.length - 1].event_id : afterEventId),
    }),
  });
}

async function removeExpired(env) {
  const retentionDays = clampDays(env.RETENTION_DAYS, DEFAULT_RETENTION_DAYS);
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM telemetry_events WHERE received_at < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM telemetry_batches WHERE received_at < ?").bind(cutoff),
  ]);
}

async function route(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS" && url.pathname === "/v1/events") {
    const origin = request.headers.get("origin") || "";
    if (!allowedOrigins(env).has(origin)) return new Response(null, { status: 403, headers: securityHeaders() });
    return new Response(null, { status: 204, headers: securityHeaders(corsHeaders(origin)) });
  }
  if (request.method === "POST" && url.pathname === "/v1/events") return ingest(request, env);
  if (request.method === "GET" && url.pathname === "/v1/health") {
    return json({ ok: true, contractVersion: CONTRACT_VERSION, schemaVersion: EVENT_SCHEMA_VERSION });
  }
  if (request.method === "GET" && url.pathname === "/v1/admin/summary") return adminSummary(request, env);
  if (request.method === "GET" && url.pathname === "/v1/admin/sessions") return adminSessions(request, env);
  if (request.method === "GET" && url.pathname === "/v1/admin/export") return adminExport(request, env);
  return json({ ok: false, error: "not_found" }, 404);
}

export default {
  fetch(request, env) {
    return route(request, env);
  },
  async scheduled(_controller, env, context) {
    context.waitUntil(removeExpired(env));
  },
};
