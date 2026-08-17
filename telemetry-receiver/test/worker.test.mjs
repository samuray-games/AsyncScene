import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import worker, { validateEnvelope } from "../src/worker.js";

const NOW = Date.now();
const ORIGIN = "https://samuray-games.github.io";
const COHORT = "private_friends_alpha_2026_08";

function event(overrides = {}) {
  return {
    schemaVersion: 1,
    eventId: "event:00000000-0000-4000-8000-000000000001",
    sequence: 1,
    type: "screen_enter",
    occurredAt: NOW,
    monotonicMs: 10,
    anonymousId: "anon:00000000-0000-4000-8000-000000000002",
    sessionId: "session:00000000-0000-4000-8000-000000000003",
    pageViewId: "page:00000000-0000-4000-8000-000000000004",
    context: {},
    payload: { screenId: "start", reason: "session_start" },
    ...overrides,
  };
}

function envelope(overrides = {}) {
  return {
    contractVersion: 1,
    schemaVersion: 1,
    batchId: "batch:00000000-0000-4000-8000-000000000005",
    mode: "private_friends_alpha",
    cohortId: COHORT,
    events: [event()],
    ...overrides,
  };
}

class Statement {
  constructor(db, sql) { this.db = db; this.sql = sql; this.args = []; }
  bind(...args) { this.args = args; return this; }
  async first() {
    if (this.sql.includes("FROM telemetry_batches")) return this.db.batches.get(this.args[0]) || null;
    if (this.sql.includes("FROM telemetry_sessions") && this.sql.includes("WHERE session_id = ?")) {
      return this.db.sessions.get(this.args[0]) || null;
    }
    if (this.sql.includes("COUNT(*) AS count") && this.sql.includes("event_id IN")) {
      return { count: this.args.filter((id) => this.db.eventIds.has(id)).length };
    }
    if (this.sql.includes("COUNT(*) AS count") && this.sql.includes("anonymous_id = ?")) return { count: this.db.recentVolume };
    return null;
  }
  async all() {
    if (this.sql.includes("FROM telemetry_sessions")) {
      const requested = this.args.length ? new Set(this.args) : null;
      return { results: Array.from(this.db.sessions.values()).filter((row) => !requested || requested.has(row.session_id)) };
    }
    if (this.sql.includes("GROUP BY e.session_id")) {
      return { results: Array.from(this.db.sessions.values()).map((session) => ({
        ...session,
        started_at: NOW,
        ended_at: NOW,
        event_count: this.db.events.filter((eventRow) => eventRow.session_id === session.session_id).length,
        return_count: 0,
        choice_count: 0,
        click_count: 0,
      })) };
    }
    if (this.sql.includes("FROM telemetry_events")) {
      const rows = this.db.events.filter((row) => !this.sql.includes("WHERE session_id = ?") || row.session_id === this.args[0]);
      return { results: rows };
    }
    return { results: [] };
  }
}

class FakeDB {
  constructor() { this.batches = new Map(); this.eventIds = new Set(); this.events = []; this.sessions = new Map(); this.recentVolume = 0; }
  prepare(sql) { return new Statement(this, sql); }
  async batch(statements) {
    const results = [];
    for (const statement of statements) {
      if (statement.sql.includes("INSERT INTO telemetry_batches")) {
        this.batches.set(statement.args[0], {
          anonymous_id: statement.args[4],
          submitted_event_count: statement.args[6],
          inserted_event_count: statement.args[7],
        });
      } else if (statement.sql.includes("INSERT OR IGNORE INTO telemetry_events")) {
        this.eventIds.add(statement.args[0]);
        this.events.push({
          event_id: statement.args[0],
          batch_id: statement.args[1],
          event_type: statement.args[3],
          occurred_at: statement.args[4],
          received_at: statement.args[5],
          sequence: statement.args[6],
          anonymous_id: statement.args[8],
          session_id: statement.args[9],
        });
      } else if (statement.sql.includes("INSERT INTO telemetry_sessions")) {
        const [session_id, anonymous_id, nickname, city, first_received_at, last_received_at] = statement.args;
        const existing = this.sessions.get(session_id);
        this.sessions.set(session_id, {
          session_id,
          anonymous_id,
          nickname: nickname || existing?.nickname || null,
          city: existing?.city || city || null,
          first_received_at: existing?.first_received_at || first_received_at,
          last_received_at,
        });
      }
      if (statement.sql.includes("nickname, city FROM (")) {
        results.push({ success: true, results: this.events.map((eventRow) => {
          const session = this.sessions.get(eventRow.session_id);
          return { ...eventRow, nickname: session?.nickname || null, city: session?.city || null };
        }) });
      } else {
        results.push({ success: true, results: [] });
      }
    }
    return results;
  }
}

function env() {
  return {
    ALLOWED_ORIGINS: ORIGIN,
    COHORT_ID: COHORT,
    RETENTION_DAYS: "30",
    OWNER_TOKEN: "owner-test-token",
    DB: new FakeDB(),
    INGEST_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };
}

test("accepts the exact minimized contract", () => {
  assert.deepEqual(validateEnvelope(envelope(), COHORT, NOW), {
    ok: true,
    anonymousId: event().anonymousId,
    sessionMetadata: [],
  });
});

test("accepts only a short voluntary gameplay nickname as session metadata", () => {
  const accepted = validateEnvelope(envelope({ sessionMetadata: [{ sessionId: event().sessionId, nickname: "Райхан_7" }] }), COHORT, NOW);
  assert.deepEqual(accepted.sessionMetadata, [{ sessionId: event().sessionId, nickname: "Райхан_7" }]);
  assert.equal(validateEnvelope(envelope({ sessionMetadata: [{ sessionId: event().sessionId, nickname: "player@example.com" }] }), COHORT, NOW).error, "invalid_session_metadata");
  assert.equal(validateEnvelope(envelope({ sessionMetadata: [{ sessionId: "session:not-in-events", nickname: "Ray" }] }), COHORT, NOW).error, "invalid_session_metadata");
  assert.equal(validateEnvelope(envelope({ city: "Tokyo" }), COHORT, NOW).error, "invalid_envelope_keys");
  assert.equal(validateEnvelope(envelope({ ip: "203.0.113.9" }), COHORT, NOW).error, "invalid_envelope_keys");
});

test("rejects forbidden event fields and payload keys", () => {
  const withUrl = envelope({ events: [event({ payload: { screenId: "start", url: "https://example.invalid/private" } })] });
  assert.equal(validateEnvelope(withUrl, COHORT, NOW).error, "invalid_payload");
  const withProfile = envelope({ events: [{ ...event(), profile: { name: "private" } }] });
  assert.equal(validateEnvelope(withProfile, COHORT, NOW).error, "invalid_event_keys");
  const wrongIdType = envelope({ events: [event({ payload: { screenId: true, reason: "session_start" } })] });
  assert.equal(validateEnvelope(wrongIdType, COHORT, NOW).error, "invalid_payload");
  const wrongNumberType = envelope({ events: [event({
    type: "screen_exit",
    payload: { screenId: "start", reason: "transition", foregroundDwellMs: "10" },
  })] });
  assert.equal(validateEnvelope(wrongNumberType, COHORT, NOW).error, "invalid_payload");
});

test("rejects mixed anonymous identities, stale events and oversized batches", () => {
  const mixed = envelope({ events: [event(), event({ eventId: "event:second", anonymousId: "anon:different" })] });
  assert.equal(validateEnvelope(mixed, COHORT, NOW).error, "mixed_anonymous_ids");
  const stale = envelope({ events: [event({ occurredAt: NOW - 31 * 24 * 60 * 60 * 1000 })] });
  assert.equal(validateEnvelope(stale, COHORT, NOW).error, "invalid_occurred_at");
  const tooMany = envelope({ events: Array.from({ length: 51 }, (_, index) => event({ eventId: `event:${index}` })) });
  assert.equal(validateEnvelope(tooMany, COHORT, NOW).error, "invalid_batch_size");
});

test("enforces origin, CORS, auth and idempotent ingest", async () => {
  const runtime = env();
  const denied = await worker.fetch(new Request("https://receiver.test/v1/events", {
    method: "POST",
    headers: { origin: "https://evil.invalid", "content-type": "application/json" },
    body: JSON.stringify(envelope()),
  }), runtime);
  assert.equal(denied.status, 403);

  const preflight = await worker.fetch(new Request("https://receiver.test/v1/events", {
    method: "OPTIONS",
    headers: { origin: ORIGIN },
  }), runtime);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), ORIGIN);

  const request = () => new Request("https://receiver.test/v1/events", {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json" },
    body: JSON.stringify(envelope()),
  });
  const accepted = await worker.fetch(request(), runtime);
  assert.equal(accepted.status, 202);
  assert.equal((await accepted.json()).accepted, 1);
  const duplicate = await worker.fetch(request(), runtime);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);

  runtime.INGEST_RATE_LIMITER = { limit: async () => ({ success: false }) };
  const duplicateWhileLimited = await worker.fetch(request(), runtime);
  assert.equal(duplicateWhileLimited.status, 200);
  assert.equal((await duplicateWhileLimited.json()).duplicate, true);

  const conflicting = envelope({
    events: [event({ anonymousId: "anon:different" })],
  });
  const conflict = await worker.fetch(new Request("https://receiver.test/v1/events", {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json" },
    body: JSON.stringify(conflicting),
  }), runtime);
  assert.equal(conflict.status, 409);
  assert.equal((await conflict.json()).error, "batch_id_conflict");

  const adminDenied = await worker.fetch(new Request("https://receiver.test/v1/admin/export"), runtime);
  assert.equal(adminDenied.status, 401);
});

test("fails closed when rate limiting is unavailable and enforces volume limits", async () => {
  const request = () => new Request("https://receiver.test/v1/events", {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json" },
    body: JSON.stringify(envelope()),
  });
  const missingLimiter = env();
  delete missingLimiter.INGEST_RATE_LIMITER;
  const unavailable = await worker.fetch(request(), missingLimiter);
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).error, "rate_limiter_unavailable");

  const limited = env();
  limited.DB.recentVolume = 5000;
  const overVolume = await worker.fetch(request(), limited);
  assert.equal(overVolume.status, 429);
  assert.equal((await overVolume.json()).error, "hourly_event_limit");
});

function requestWithCloudflareCity(body, city) {
  const request = new Request("https://receiver.test/v1/events", {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" },
    body: JSON.stringify(body),
  });
  if (city !== undefined) Object.defineProperty(request, "cf", { value: { city } });
  return request;
}

test("derives city only from Cloudflare metadata and persists no IP", async () => {
  const runtime = env();
  const body = envelope({ sessionMetadata: [{ sessionId: event().sessionId, nickname: "Ray_7" }] });
  const accepted = await worker.fetch(requestWithCloudflareCity(body, "Tokyo"), runtime);
  assert.equal(accepted.status, 202);
  const stored = runtime.DB.sessions.get(event().sessionId);
  assert.deepEqual(stored.nickname, "Ray_7");
  assert.deepEqual(stored.city, "Tokyo");
  assert.equal(JSON.stringify(stored).includes("203.0.113.9"), false);
  assert.equal(Object.keys(stored).some((key) => /ip|address|geo|coordinate/i.test(key)), false);

  const missingCity = env();
  const missing = await worker.fetch(requestWithCloudflareCity(envelope(), undefined), missingCity);
  assert.equal(missing.status, 202);
  assert.equal(missingCity.DB.sessions.get(event().sessionId).city, null);
});

test("additive migration creates session metadata without changing event storage", () => {
  const migration = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations/0002_session_metadata.sql"), "utf8");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS telemetry_sessions/);
  assert.match(migration, /nickname TEXT/);
  assert.match(migration, /city TEXT/);
  assert.equal(/\bDROP\b|ALTER TABLE telemetry_events/i.test(migration), false);
});

test("network smoke keeps health public and admin data private", {
  skip: process.env.ALLOW_NETWORK_SMOKE !== "1",
}, async (t) => {
  const runtime = env();
  const server = http.createServer(async (incoming, outgoing) => {
    const chunks = [];
    for await (const chunk of incoming) chunks.push(chunk);
    const request = new Request(`http://127.0.0.1${incoming.url}`, {
      method: incoming.method,
      headers: incoming.headers,
      body: ["GET", "HEAD"].includes(incoming.method) ? undefined : Buffer.concat(chunks),
    });
    const response = await worker.fetch(request, runtime);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  assert.equal((await fetch(`${base}/v1/health`)).status, 200);
  assert.equal((await fetch(`${base}/v1/admin/summary`)).status, 401);
  assert.equal((await fetch(`${base}/v1/admin/sessions`)).status, 401);
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});

test("owner readback exposes bounded summary, session list, detail and export", async () => {
  const runtime = env();
  const authorization = { authorization: "Bearer owner-test-token" };
  const summary = await worker.fetch(new Request("https://receiver.test/v1/admin/summary?days=30", { headers: authorization }), runtime);
  assert.equal(summary.status, 200);
  const summaryBody = await summary.json();
  assert.equal(summaryBody.ok, true);
  for (const field of ["totals", "eventTypes", "screens", "questions", "actions", "choices", "exitPoints", "funnel", "recentSessionPaths"]) {
    assert(Object.hasOwn(summaryBody, field), `summary missing ${field}`);
  }

  const sessions = await worker.fetch(new Request("https://receiver.test/v1/admin/sessions?limit=10", { headers: authorization }), runtime);
  assert.equal(sessions.status, 200);
  assert(Array.isArray((await sessions.json()).sessions));

  const detail = await worker.fetch(new Request(`https://receiver.test/v1/admin/sessions?sessionId=${encodeURIComponent(event().sessionId)}`, { headers: authorization }), runtime);
  assert.equal(detail.status, 200);
  const detailBody = await detail.json();
  assert(Array.isArray(detailBody.events));
  assert.equal(detailBody.session, null);

  const exported = await worker.fetch(new Request("https://receiver.test/v1/admin/export?limit=10", { headers: authorization }), runtime);
  assert.equal(exported.status, 200);
  assert.equal(exported.headers.get("content-type"), "application/x-ndjson; charset=utf-8");
});

test("owner session list, detail and export read session metadata once", async () => {
  const runtime = env();
  const body = envelope({ sessionMetadata: [{ sessionId: event().sessionId, nickname: "Ray_7" }] });
  await worker.fetch(requestWithCloudflareCity(body, "Tokyo"), runtime);
  const headers = { authorization: "Bearer owner-test-token" };
  const summary = await worker.fetch(new Request("https://receiver.test/v1/admin/summary?days=30", { headers }), runtime);
  const path = (await summary.json()).recentSessionPaths[0];
  assert.equal(path.nickname, "Ray_7");
  assert.equal(path.city, "Tokyo");
  const sessions = await worker.fetch(new Request("https://receiver.test/v1/admin/sessions?limit=10", { headers }), runtime);
  const sessionList = (await sessions.json()).sessions;
  assert.equal(sessionList[0].nickname, "Ray_7");
  assert.equal(sessionList[0].city, "Tokyo");

  const detail = await worker.fetch(new Request(`https://receiver.test/v1/admin/sessions?sessionId=${encodeURIComponent(event().sessionId)}`, { headers }), runtime);
  const detailBody = await detail.json();
  assert.equal(detailBody.session.nickname, "Ray_7");
  assert.equal(detailBody.session.city, "Tokyo");

  const exported = await worker.fetch(new Request("https://receiver.test/v1/admin/export?limit=10", { headers }), runtime);
  const records = (await exported.text()).trim().split("\n").map(JSON.parse);
  assert.deepEqual(records[0], { recordType: "session_metadata", session: runtime.DB.sessions.get(event().sessionId) });
  assert.equal(records.filter((record) => record.recordType === "event").length, 1);
  assert.equal(JSON.stringify(records).includes("203.0.113.9"), false);
});
