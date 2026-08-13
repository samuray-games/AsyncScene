import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
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
    if (this.sql.includes("COUNT(*) AS count") && this.sql.includes("event_id IN")) {
      return { count: this.args.filter((id) => this.db.eventIds.has(id)).length };
    }
    if (this.sql.includes("COUNT(*) AS count") && this.sql.includes("anonymous_id = ?")) return { count: this.db.recentVolume };
    return null;
  }
  async all() { return { results: [] }; }
}

class FakeDB {
  constructor() { this.batches = new Map(); this.eventIds = new Set(); this.recentVolume = 0; }
  prepare(sql) { return new Statement(this, sql); }
  async batch(statements) {
    for (const statement of statements) {
      if (statement.sql.includes("INSERT INTO telemetry_batches")) {
        this.batches.set(statement.args[0], {
          anonymous_id: statement.args[4],
          submitted_event_count: statement.args[6],
          inserted_event_count: statement.args[7],
        });
      } else if (statement.sql.includes("INSERT OR IGNORE INTO telemetry_events")) {
        this.eventIds.add(statement.args[0]);
      }
    }
    return statements.map(() => ({ success: true, results: [] }));
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
  });
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
  assert(Array.isArray((await detail.json()).events));

  const exported = await worker.fetch(new Request("https://receiver.test/v1/admin/export?limit=10", { headers: authorization }), runtime);
  assert.equal(exported.status, 200);
  assert.equal(exported.headers.get("content-type"), "application/x-ndjson; charset=utf-8");
});
