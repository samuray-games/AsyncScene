import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  MIGRATION_FILES, SCRATCH_PREFIX, isDatabaseUuid, isScratchName, makeCreateBatch,
  newScratchName, runHostedPreflight, sha256, validateOptIn,
} from "./hosted_chat03b2_d1_preflight.mjs";

const UUID = "7a5e9bf4-6255-4e0d-9a45-9b0a8453a818";
const ACCOUNT = "a".repeat(32);
const TOKEN = "offline-secret-sentinel-never-print";
const APPROVED = {
  CHAT03B2_HOSTED_D1_APPROVED: "YES",
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT,
  CLOUDFLARE_API_TOKEN: TOKEN,
};

function tempPaths() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "chat03b2-hosted-offline-"));
  return { dir, pendingPath: path.join(dir, "pending.json"), lockPath: path.join(dir, "lock") };
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
}

test("approval is fail-closed before any Cloudflare request", async () => {
  const p = tempPaths();
  let calls = 0;
  try {
    assert.throws(() => validateOptIn({}), /BLOCKED_APPROVAL_REQUIRED/);
    await assert.rejects(runHostedPreflight({
      env: { ...APPROVED, CHAT03B2_HOSTED_D1_APPROVED: "NO" },
      pendingPath: p.pendingPath, lockPath: p.lockPath,
      fetchImpl: async () => { calls++; throw Error("must not fetch"); },
    }), /BLOCKED_APPROVAL_REQUIRED/);
    assert.equal(calls, 0);
    assert.equal(existsSync(p.lockPath), false);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("only fixed random scratch names, valid Cloudflare UUIDs and migration order are accepted", () => {
  const name = newScratchName(Buffer.alloc(10, 0xab));
  assert.equal(name, SCRATCH_PREFIX + "ab".repeat(10));
  assert.equal(isScratchName(name), true);
  assert.equal(isScratchName("asynchronia-chat03b2-scratch-production"), false);
  assert.equal(isDatabaseUuid(UUID), true);
  assert.equal(isDatabaseUuid("telemetry_events"), false);
  assert.deepEqual(MIGRATION_FILES, [
    "0001_tactical_state.sql", "0002_battle_capabilities.sql", "0003_idempotent_battle_creation.sql",
  ]);
  for (const file of MIGRATION_FILES) assert.ok(readFileSync(new URL("../migrations/" + file, import.meta.url), "utf8").length > 0);
  assert.throws(() => validateOptIn({ ...APPROVED, CLOUDFLARE_ACCOUNT_ID: "bad" }), /INVALID_ACCOUNT_ID/);
  assert.throws(() => validateOptIn({ ...APPROVED, CLOUDFLARE_API_TOKEN: "" }), /MISSING_CLOUDFLARE_API_TOKEN/);
});

test("an existing cleanup marker blocks a new database before network access", async () => {
  const p = tempPaths();
  let calls = 0;
  try {
    writeFileSync(p.pendingPath, JSON.stringify({
      schema: 1, accountId: ACCOUNT, databaseId: UUID,
      databaseName: SCRATCH_PREFIX + "ab".repeat(10),
    }), { mode: 0o600 });
    await assert.rejects(runHostedPreflight({
      env: APPROVED, pendingPath: p.pendingPath, lockPath: p.lockPath,
      fetchImpl: async () => { calls++; throw Error("must not fetch"); },
    }), /PENDING_CLEANUP_BLOCKS_NEW_DATABASE/);
    assert.equal(calls, 0);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("an existing lock fails closed before a second run can create a database", async () => {
  const p = tempPaths();
  let calls = 0;
  try {
    writeFileSync(p.lockPath, JSON.stringify({ pid: process.pid, createdAt: Date.now() }), { mode: 0o600 });
    await assert.rejects(runHostedPreflight({ env: APPROVED, pendingPath: p.pendingPath,
      lockPath: p.lockPath, fetchImpl: async () => { calls++; throw Error("must not fetch"); } }),
    /PREFLIGHT_ALREADY_RUNNING_OR_STALE_LOCK/);
    assert.equal(calls, 0);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("a stale lock is not removed speculatively and blocks network operations", async () => {
  const p = tempPaths();
  let calls = 0;
  try {
    writeFileSync(p.lockPath, JSON.stringify({ pid: 2147483647, createdAt: 1 }), { mode: 0o600 });
    await assert.rejects(runHostedPreflight({ env: APPROVED, pendingPath: p.pendingPath,
      lockPath: p.lockPath, fetchImpl: async () => { calls++; throw Error("must not fetch"); }, log: () => {} }),
    /PREFLIGHT_ALREADY_RUNNING_OR_STALE_LOCK/);
    assert.equal(calls, 0);
    assert.equal(existsSync(p.lockPath), true);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("an unreadable lock fails closed rather than being removed speculatively", async () => {
  const p = tempPaths();
  let calls = 0;
  try {
    writeFileSync(p.lockPath, "unknown owner", { mode: 0o600 });
    await assert.rejects(runHostedPreflight({ env: APPROVED, pendingPath: p.pendingPath,
      lockPath: p.lockPath, fetchImpl: async () => { calls++; throw Error("must not fetch"); }, log: () => {} }),
    /PREFLIGHT_LOCK_RECORD_INVALID/);
    assert.equal(calls, 0);
    assert.equal(existsSync(p.lockPath), true);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("migration failure still deletes and verifies only the UUID returned by CREATE", async () => {
  const p = tempPaths();
  const seen = [];
  const migrations = [];
  try {
    const fetchImpl = async (url, options = {}) => {
      const parsed = new URL(url);
      const body = options.body ? JSON.parse(options.body) : null;
      seen.push({ method: options.method || "GET", path: parsed.pathname, body, auth: options.headers?.Authorization });
      if (parsed.pathname.endsWith("/d1/database") && options.method === "POST") {
        return jsonResponse(200, { success: true, result: { uuid: UUID, name: body.name } });
      }
      if (parsed.pathname.endsWith("/raw")) {
        migrations.push(body.sql);
        return jsonResponse(400, { success: false, errors: [{ code: 1000 }] });
      }
      if (parsed.pathname.endsWith("/" + UUID) && options.method === "DELETE") {
        return jsonResponse(200, { success: true, result: { uuid: UUID } });
      }
      if (parsed.pathname.endsWith("/" + UUID) && options.method === "GET") return jsonResponse(404, { success: false });
      throw Error("unexpected request");
    };
    await assert.rejects(runHostedPreflight({ env: APPROVED, pendingPath: p.pendingPath,
      lockPath: p.lockPath, fetchImpl, log: () => {} }), /HOSTED_D1_RAW_FAILED/);
    assert.equal(migrations.length, 1);
    assert.equal(seen.filter(x => x.method === "DELETE").length, 1);
    assert.equal(seen.find(x => x.method === "DELETE").path.endsWith("/" + UUID), true);
    assert.equal(seen.some(x => x.path.includes("telemetry")), false);
    assert.ok(seen.every(x => x.path.includes("/d1/database")));
    assert.ok(seen.every(x => x.auth === "Bearer " + TOKEN));
    assert.equal(existsSync(p.pendingPath), false);
    assert.ok(!JSON.stringify(seen).includes("ADMIN_CONTROL_TOKEN"));
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("cleanup failure persists exact target and blocks normal rerun until explicit verified cleanup retry", async () => {
  const p = tempPaths();
  let failDelete = true;
  let batchCount = 0;
  let goodId;
  let goodState;
  let scratchName;
  let resourceExists = true;
  const calls = [];
  const migrationSql = [];
  try {
    const fetchImpl = async (url, options = {}) => {
      const parsed = new URL(url);
      const body = options.body ? JSON.parse(options.body) : null;
      const method = options.method || "GET";
      calls.push({ method, path: parsed.pathname, body });
      if (parsed.pathname.endsWith("/d1/database") && method === "POST") {
        scratchName = body.name;
        return jsonResponse(200, { success: true, result: { uuid: UUID, name: body.name } });
      }
      if (parsed.pathname.endsWith("/raw")) {
        if (typeof body.sql === "string") {
          migrationSql.push(body.sql);
          return jsonResponse(200, { success: true, result: [] });
        }
        batchCount++;
        if (batchCount === 1) {
          goodId = body.batch[0].params[0];
          goodState = JSON.parse(body.batch[0].params[1]);
          return jsonResponse(200, { success: true, result: [{ success: true }] });
        }
        return jsonResponse(400, { success: false, errors: [{ code: 1001 }] });
      }
      if (parsed.pathname.endsWith("/query")) {
        const sql = body.sql;
        if (sql.includes("COUNT(*)") && sql.includes("genesis_events")) {
          const id = body.params[0];
          return jsonResponse(200, { success: true, result: [{ results: [id === goodId
            ? { battles: 1, genesis_events: 1, capabilities: 2, creations: 1 }
            : { battles: 0, genesis_events: 0, capabilities: 0, creations: 0 }] }] });
        }
        if (sql.startsWith("SELECT side")) return jsonResponse(200, { success: true, result: [{ results: [
          { side: "A", participant_id: "test-A", digest_length: 64 },
          { side: "B", participant_id: "test-B", digest_length: 64 },
        ] }] });
        if (sql.startsWith("SELECT version,state_json")) {
          return jsonResponse(200, { success: true, result: [{ results: [{ version: 0, state_json: JSON.stringify(goodState) }] }] });
        }
        if (sql.includes("recovery_nonce_base64url")) return jsonResponse(200,
          { success: true, result: [{ results: [{ nonce_length: 16, ciphertext_length: 64 }] }] });
        if (sql.includes("sqlite_master")) return jsonResponse(200, { success: true, result: [{ results: [
          { name: "gameplay_battle_capabilities" }, { name: "gameplay_battle_creations" },
          { name: "gameplay_battles" }, { name: "gameplay_event_outbox" },
        ] }] });
        if (sql.includes("AS battles")) return jsonResponse(200,
          { success: true, result: [{ results: [{ battles: 0, events: 0, capabilities: 0, creations: 0 }] }] });
        throw Error("unexpected query");
      }
      if (parsed.pathname.endsWith("/" + UUID) && method === "DELETE") {
        if (failDelete) return jsonResponse(500, { success: false, errors: [{ code: 9999 }] });
        resourceExists = false;
        return jsonResponse(200, { success: true, result: { uuid: UUID } });
      }
      if (parsed.pathname.endsWith("/" + UUID) && method === "GET") {
        if (resourceExists) return jsonResponse(200, { success: true, result: { uuid: UUID, name: scratchName } });
        return jsonResponse(404, { success: false });
      }
      throw Error("unexpected request");
    };

    // The API is mocked through all migrations and SQL probes; cleanup is then
    // forced to fail so the durable marker and rerun guard can be checked.
    await assert.rejects(runHostedPreflight({ env: APPROVED, pendingPath: p.pendingPath,
      lockPath: p.lockPath, fetchImpl, log: () => {} }), /SCRATCH_CLEANUP_FAILED/);
    assert.equal(existsSync(p.pendingPath), true);
    assert.deepEqual(migrationSql, MIGRATION_FILES.map(file =>
      readFileSync(new URL("../migrations/" + file, import.meta.url), "utf8")));
    const marker = JSON.parse(readFileSync(p.pendingPath, "utf8"));
    assert.equal(marker.databaseId, UUID);
    const countBeforeRerun = calls.length;
    await assert.rejects(runHostedPreflight({ env: APPROVED, pendingPath: p.pendingPath,
      lockPath: p.lockPath, fetchImpl, log: () => {} }), /PENDING_CLEANUP_BLOCKS_NEW_DATABASE/);
    assert.equal(calls.length, countBeforeRerun, "normal rerun must not issue Cloudflare requests");

    failDelete = false;
    await runHostedPreflight({ env: { ...APPROVED, CHAT03B2_HOSTED_D1_RETRY_CLEANUP: "YES" },
      pendingPath: p.pendingPath, lockPath: p.lockPath, fetchImpl, log: () => {} });
    assert.equal(existsSync(p.pendingPath), false);
    const retryCalls = calls.slice(countBeforeRerun);
    assert.ok(retryCalls.every(x => x.path.endsWith("/" + UUID)));
    assert.equal(retryCalls.some(x => x.method === "POST" && x.path.endsWith("/d1/database")), false);
    assert.deepEqual(retryCalls.map(x => x.method), ["GET", "DELETE", "GET"]);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("cleanup retry fails closed if stored UUID no longer names the recorded scratch database", async () => {
  const p = tempPaths();
  try {
    writeFileSync(p.pendingPath, JSON.stringify({ schema: 1, accountId: ACCOUNT,
      databaseId: UUID, databaseName: SCRATCH_PREFIX + "ab".repeat(10) }), { mode: 0o600 });
    const methods = [];
    const fetchImpl = async (_url, options = {}) => {
      methods.push(options.method || "GET");
      return jsonResponse(200, { success: true, result: { uuid: UUID, name: "production-d1" } });
    };
    await assert.rejects(runHostedPreflight({
      env: { ...APPROVED, CHAT03B2_HOSTED_D1_RETRY_CLEANUP: "YES" },
      pendingPath: p.pendingPath, lockPath: p.lockPath, fetchImpl, log: () => {},
    }), /PENDING_CLEANUP_RESOURCE_IDENTITY_MISMATCH/);
    assert.deepEqual(methods, ["GET"]);
    assert.equal(existsSync(p.pendingPath), true);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test("network exceptions are sanitized and fixture SQL contains only digests/ciphertext", async () => {
  const p = tempPaths();
  try {
    const fixture = makeCreateBatch("scratch-safety-fixture", "safety");
    const serialized = JSON.stringify(fixture.batch);
    assert.ok(!serialized.includes(TOKEN));
    assert.ok(!serialized.includes("ADMIN_CONTROL_TOKEN"));
    assert.match(serialized, new RegExp(sha256("chat03b2-test-capability:A:safety")));
    await assert.rejects(runHostedPreflight({ env: APPROVED, pendingPath: p.pendingPath,
      lockPath: p.lockPath, fetchImpl: async () => { throw Error(TOKEN); }, log: () => {} }), error => {
        assert.match(error.message, /CLOUDFLARE_API_REQUEST_FAILED/);
        assert.ok(!error.message.includes(TOKEN));
        return true;
      });
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});
