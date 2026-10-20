// Isolated REMOTE Cloudflare D1 acceptance probe for Asynchronia Chat 03B1.
// No Worker deployment. No access to telemetry database. No token persistence.
// Requires an existing Cloudflare account + narrowly scoped D1 API token.
// Creates one random scratch D1, tests it, and deletes THAT DB in finally.
//
// Execute only with:
//   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... \\
//   CHAT03B1_REMOTE_D1_APPROVED=YES node gameplay-server/test/remote_d1_ephemeral.mjs
//
// This tests Cloudflare-hosted D1 SQL transactions through its official API;
// it is NOT a deployed Worker binding or an authenticated gameplay service.

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SCRATCH_PREFIX = "asynchronia-chat03b1-scratch-";
export function quoteSql(value) {
  assert.equal(typeof value, "string", "only internal string literals are allowed");
  return "'" + value.replaceAll("'", "''") + "'";
}
export function initialState(id) {
  return {
    schemaVersion: 1, battleId: id, version: 0, rulesVersion: "tactical_v1",
    phase: "created", createdAt: 0, deadlineAt: 1000,
    participants: { A: { id: "test-A", role: "citizen" }, B: { id: "test-B", role: "citizen" } },
    commits: {}, events: [], commandReceipts: {},
  };
}
export function createSql(state) {
  assert.match(state.battleId, /^scratch-[a-z0-9-]+$/);
  return `INSERT INTO gameplay_battles (
    battle_id, version, rules_version, phase, state_json, created_at_ms, updated_at_ms)
    VALUES (${quoteSql(state.battleId)},0,'tactical_v1','created',
    ${quoteSql(JSON.stringify(state))},0,0)`;
}
export function transitionSql(state, commandId, eventIds = [], events = [], clock = 123) {
  assert.match(state.battleId, /^scratch-[a-z0-9-]+$/);
  assert.match(commandId, /^[a-z0-9-]+$/);
  assert(Number.isSafeInteger(clock) && clock >= 0);
  const next = { ...state, version: state.version + 1, phase: "waiting" };
  return `INSERT INTO gameplay_apply_transition
    (battle_id,expected_version,command_id,fingerprint,receipt_code,
     receipt_event_ids_json,next_state_json,events_json,trusted_now_ms)
    VALUES (
      ${quoteSql(state.battleId)},${state.version},${quoteSql(commandId)},
      ${quoteSql("fp:" + commandId)},'COMMITTED',${quoteSql(JSON.stringify(eventIds))},
      ${quoteSql(JSON.stringify(next))},${quoteSql(JSON.stringify(events))},${clock})`;
}
export function probeEvent(id, version = 1) {
  return { eventId: id, version, type: "battle.selection_committed", payload: { side: "A" } };
}

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PROJECT = fileURLToPath(new URL("../..", import.meta.url));
function getEnv() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token || process.env.CHAT03B1_REMOTE_D1_APPROVED !== "YES") {
    throw Error("BLOCKED_AUTH: set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CHAT03B1_REMOTE_D1_APPROVED=YES");
  }
  if (!/^[a-f0-9]{32}$/i.test(accountId)) throw Error("INVALID_ACCOUNT_ID");
  return { accountId, token };
}

async function remoteApi(auth, suffix, method = "GET", data) {
  const response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/" + auth.accountId + suffix,
    {
      method,
      headers: {
        Authorization: "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      signal: AbortSignal.timeout(30000),
    },
  );
  const result = await response.json().catch(() => ({}));
  return { httpStatus: response.status, ...result };
}

function apiSuccess(result) {
  return result.httpStatus >= 200 && result.httpStatus < 300 &&
    result.success === true &&
    (!Array.isArray(result.result) || result.result.every((entry) => entry.success !== false));
}
function cloudflareError(result) {
  const code = result.errors?.[0]?.code;
  return "HTTP " + result.httpStatus + (code === undefined ? "" : ", code " + code);
}

async function execute(auth, id, sql) {
  const result = await remoteApi(auth, "/d1/database/" + encodeURIComponent(id) + "/query", "POST", { sql });
  if (!apiSuccess(result)) throw Error("SQL_REJECTED " + cloudflareError(result));
  return result.result?.[0]?.results || [];
}
async function tryExecute(auth, id, sql) {
  const result = await remoteApi(auth, "/d1/database/" + encodeURIComponent(id) + "/query", "POST", { sql });
  return apiSuccess(result);
}
async function inspect(auth, id, battleId, expectedVersion, receipts, outbox) {
  const rows = await execute(auth, id, `SELECT version, state_json,
     (SELECT COUNT(*) FROM gameplay_command_receipts AS r WHERE r.battle_id=b.battle_id) AS receipts,
     (SELECT COUNT(*) FROM gameplay_event_outbox AS e WHERE e.battle_id=b.battle_id) AS outbox
     FROM gameplay_battles AS b WHERE battle_id=${quoteSql(battleId)}`);
  assert.equal(rows.length, 1, "missing state");
  assert.equal(rows[0].version, expectedVersion, "unexpected state version");
  assert.equal(rows[0].receipts, receipts, "receipt mismatch");
  assert.equal(rows[0].outbox, outbox, "outbox mismatch");
  assert.equal(JSON.parse(rows[0].state_json).version, expectedVersion, "state JSON rollback failure");
}

async function runProbes(auth, dbId) {
  const valid = initialState("scratch-valid");
  await execute(auth, dbId, createSql(valid));
  const events = [probeEvent("scratch-e1"), probeEvent("scratch-e2")];
  await execute(auth, dbId, transitionSql(valid, "valid", ["scratch-e2", "scratch-e1"], events));
  await inspect(auth, dbId, valid.battleId, 1, 1, 2);
  console.log("PASS: hosted D1 atomic state+receipt+outbox CAS, unordered IDs");

  assert.equal(await tryExecute(auth, dbId, transitionSql(valid, "stale")), false);
  await inspect(auth, dbId, valid.battleId, 1, 1, 2);
  console.log("PASS: hosted D1 rejects stale CAS with no partial changes");

  const invalidIds = initialState("scratch-duplicate");
  await execute(auth, dbId, createSql(invalidIds));
  assert.equal(await tryExecute(auth, dbId, transitionSql(invalidIds, "invalid-ids",
    ["e1", "e1"], [probeEvent("e1"), probeEvent("e2")])), false);
  await inspect(auth, dbId, invalidIds.battleId, 0, 0, 0);
  console.log("PASS: hosted D1 aborts bad receipt/outbox bijection");

  const invalidVersion = initialState("scratch-version");
  await execute(auth, dbId, createSql(invalidVersion));
  assert.equal(await tryExecute(auth, dbId, transitionSql(invalidVersion, "invalid-version",
    ["evt"], [probeEvent("evt", 999)])), false);
  await inspect(auth, dbId, invalidVersion.battleId, 0, 0, 0);
  console.log("PASS: hosted D1 aborts forged outbox version");

  const concurrent = initialState("scratch-race");
  await execute(auth, dbId, createSql(concurrent));
  const commands = await Promise.all([
    tryExecute(auth, dbId, transitionSql(concurrent, "race-a")),
    tryExecute(auth, dbId, transitionSql(concurrent, "race-b")),
  ]);
  assert.equal(commands.filter(Boolean).length, 1, "two competing CAS transitions committed");
  await inspect(auth, dbId, concurrent.battleId, 1, 1, 0);
  console.log("PASS: hosted D1 concurrent requests, exactly one winner");

  console.log("HOSTED_D1_SQL_CAS_PASS (NOT REMOTE_WORKER_AUTH_PASS)");
}

async function main() {
  const auth = getEnv();
  const scratchName = SCRATCH_PREFIX + randomBytes(7).toString("hex");
  const temp = mkdtempSync(path.join(os.tmpdir(), "chat03b1-remote-d1-"));
  let createdId;
  try {
    console.log("Provisioning isolated Cloudflare D1:", scratchName);
    const created = await remoteApi(auth, "/d1/database", "POST", {
      name: scratchName, read_replication: { mode: "disabled" },
    });
    if (!apiSuccess(created) || !/^[a-f0-9-]{36}$/i.test(created.result?.uuid || "")) {
      throw Error("SCRATCH_CREATE_FAILED " + cloudflareError(created));
    }
    createdId = created.result.uuid;
    assert.equal(created.result.name, scratchName, "Cloudflare returned unexpected scratch name");

    // Generated from the newly created DB UUID; impossible to bind to the
    // existing telemetry database because that ID is never read or accepted.
    const configPath = path.join(temp, "wrangler.remote.json");
    writeFileSync(configPath, JSON.stringify({
      name: "asynchronia-chat03b1-remote-test-only",
      compatibility_date: "2026-10-01",
      main: path.join(ROOT, "test/d1_probe_worker.mjs"),
      d1_databases: [{
        binding: "SCRATCH_DB", database_name: scratchName, database_id: createdId,
      }],
    }), { mode: 0o600 });

    const wrangler = process.env.WRANGLER_BIN || path.join(PROJECT, "node_modules", ".bin", "wrangler");
    const migration = path.join(ROOT, "migrations/0001_tactical_state.sql");
    const applied = spawnSync(wrangler, [
      "d1", "execute", "SCRATCH_DB", "--remote", "--config", configPath,
      "--file", migration, "--yes",
    ], { cwd: PROJECT, encoding: "utf8", timeout: 120000, env: process.env });
    if (applied.status !== 0 || applied.error) {
      // Only show the error category, never full wrangler output or secrets.
      throw Error("HOSTED_D1_MIGRATION_FAILED " + (applied.error?.code || "WRANGLER_NONZERO"));
    }
    console.log("PASS: remote D1 migration applied in isolated scratch DB");
    await runProbes(auth, createdId);
  } finally {
    if (createdId) {
      // Delete ONLY the database whose ID came from this invocation's CREATE.
      try {
        const deleted = await remoteApi(auth, "/d1/database/" + encodeURIComponent(createdId), "DELETE");
        if (!apiSuccess(deleted)) throw Error(cloudflareError(deleted));
        console.log("PASS: isolated scratch D1 cleaned up");
      } catch (error) {
        console.error("SCRATCH_CLEANUP_FAILED name=" + scratchName +
          " id=" + createdId + " category=" + error.message);
        process.exitCode = 1;
      }
    }
    rmSync(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("REMOTE_D1_TEST_FAIL " + error.message);
    process.exitCode = 1;
  });
}
