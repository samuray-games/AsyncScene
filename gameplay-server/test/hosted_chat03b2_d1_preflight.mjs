// Hosted D1 SQL-only preflight for Chat03B2. This script is intentionally
// offline by default and never creates/deploys a Worker.
// See gameplay-server/CHAT03B2.md before any separately authorized run.

import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { closeSync, existsSync, fsyncSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync, writeSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialState } from "./remote_d1_ephemeral.mjs";

export const SCRATCH_PREFIX = "asynchronia-chat03b2-scratch-";
export const MIGRATION_FILES = Object.freeze([
  "0001_tactical_state.sql",
  "0002_battle_capabilities.sql",
  "0003_idempotent_battle_creation.sql",
]);
const API_ROOT = "https://api.cloudflare.com/client/v4";
const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEFAULT_PENDING = path.join(os.tmpdir(), "asynchronia-chat03b2-hosted-d1-pending-cleanup.json");
const DEFAULT_LOCK = path.join(os.tmpdir(), "asynchronia-chat03b2-hosted-d1.lock");

export function validateOptIn(env) {
  if (env.CHAT03B2_HOSTED_D1_APPROVED !== "YES") throw new Error("BLOCKED_APPROVAL_REQUIRED");
  if (!env.CLOUDFLARE_ACCOUNT_ID || !/^[a-f0-9]{32}$/i.test(env.CLOUDFLARE_ACCOUNT_ID)) {
    throw new Error("INVALID_ACCOUNT_ID");
  }
  if (!env.CLOUDFLARE_API_TOKEN) throw new Error("MISSING_CLOUDFLARE_API_TOKEN");
  if (env.CHAT03B2_HOSTED_D1_RETRY_CLEANUP !== undefined &&
      env.CHAT03B2_HOSTED_D1_RETRY_CLEANUP !== "YES") throw new Error("INVALID_CLEANUP_OPT_IN");
  return { accountId: env.CLOUDFLARE_ACCOUNT_ID, token: env.CLOUDFLARE_API_TOKEN };
}

export function isScratchName(name) {
  return typeof name === "string" && /^asynchronia-chat03b2-scratch-[a-f0-9]{20}$/.test(name);
}

export function isDatabaseUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

export function newScratchName(bytes = randomBytes(10)) {
  assert.equal(bytes.length, 10);
  return SCRATCH_PREFIX + bytes.toString("hex");
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function makeCreateBatch(battleId, suffix = "valid", { idempotencyKeyHash } = {}) {
  assert.match(battleId, /^scratch-[a-z0-9-]+$/);
  const state = initialState(battleId);
  const keyHash = idempotencyKeyHash || sha256("chat03b2-test-idempotency:" + suffix);
  const fingerprint = sha256("chat03b2-test-request:" + suffix);
  // Synthetic digests and ciphertext-shaped bytes exercise only SQL storage
  // constraints. They are not live bearer tokens or valid AES-GCM payloads.
  const capA = sha256("chat03b2-test-capability:A:" + suffix);
  const capB = sha256("chat03b2-test-capability:B:" + suffix);
  const insert = (sql, params) => ({ sql, params });
  return {
    state,
    keyHash,
    batch: [
      insert("INSERT INTO gameplay_create_battle (battle_id,initial_state_json,creation_event_json,trusted_now_ms) VALUES (?,?,?,0)",
        [battleId, JSON.stringify(state), JSON.stringify(state.events[0])]),
      insert("INSERT INTO gameplay_battle_capabilities (battle_id,side,participant_id,token_sha256,created_at_ms) VALUES (?,'A',?,?,0)",
        [battleId, state.participants.A.id, capA]),
      insert("INSERT INTO gameplay_battle_capabilities (battle_id,side,participant_id,token_sha256,created_at_ms) VALUES (?,'B',?,?,0)",
        [battleId, state.participants.B.id, capB]),
      insert(`INSERT INTO gameplay_battle_creations
        (idempotency_key_sha256,request_fingerprint_sha256,battle_id,deadline_at_ms,
         recovery_key_version,recovery_nonce_base64url,capabilities_ciphertext_base64url,created_at_ms)
        VALUES (?,?,?,1000,'offline-fixture-v1',?,?,0)`,
        [keyHash, fingerprint, battleId, Buffer.alloc(12, 1).toString("base64url"),
          Buffer.alloc(48, 2).toString("base64url")]),
    ],
  };
}

function apiErrorCode(response) {
  const code = response.payload?.errors?.[0]?.code;
  return Number.isInteger(code) ? String(code) : "HTTP_" + response.status;
}

function apiOk(response) {
  return response.status >= 200 && response.status < 300 && response.payload?.success === true &&
    (!Array.isArray(response.payload.result) || response.payload.result.every(row => row?.success !== false));
}

function apiUrl(accountId, suffix) {
  return API_ROOT + "/accounts/" + encodeURIComponent(accountId) + suffix;
}

async function cloudRequest(auth, suffix, method, body, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(apiUrl(auth.accountId, suffix), {
      method,
      redirect: "error",
      headers: { Authorization: "Bearer " + auth.token, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error("CLOUDFLARE_API_REQUEST_FAILED");
  }
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

function writePending(pendingPath, record) {
  const tempPath = pendingPath + ".tmp-" + process.pid + "-" + randomBytes(4).toString("hex");
  const fd = openSync(tempPath, "wx", 0o600);
  try {
    writeFileSync(fd, JSON.stringify(record));
    fsyncSync(fd);
  } finally { closeSync(fd); }
  renameSync(tempPath, pendingPath);
  const dirFd = openSync(path.dirname(pendingPath), "r");
  try { fsyncSync(dirFd); } finally { closeSync(dirFd); }
}

function readPending(pendingPath) {
  if (!existsSync(pendingPath)) return null;
  let value;
  try { value = JSON.parse(readFileSync(pendingPath, "utf8")); }
  catch { throw new Error("PENDING_CLEANUP_RECORD_INVALID"); }
  const status = value?.status || (isDatabaseUuid(value?.databaseId) ? "READY_FOR_CLEANUP" : null);
  if (!value || value.schema !== 1 || !/^[a-f0-9]{32}$/i.test(value.accountId || "") ||
      !isScratchName(value.databaseName) ||
      !["CREATE_IN_FLIGHT", "CREATE_AMBIGUOUS", "CREATE_RESPONSE_MISMATCH", "READY_FOR_CLEANUP"].includes(status) ||
      (status === "READY_FOR_CLEANUP" ? !isDatabaseUuid(value.databaseId) :
        (value.databaseId !== null && value.databaseId !== undefined && !isDatabaseUuid(value.databaseId)))) {
    throw new Error("PENDING_CLEANUP_RECORD_INVALID");
  }
  return { ...value, status };
}

function clearPending(pendingPath) {
  if (existsSync(pendingPath)) unlinkSync(pendingPath);
}

function acquireLock(lockPath) {
  try {
    const fd = openSync(lockPath, "wx", 0o600);
    try { writeSync(fd, JSON.stringify({ pid: process.pid, createdAt: Date.now() })); }
    catch {
      closeSync(fd);
      try { unlinkSync(lockPath); } catch { /* fail closed below */ }
      throw new Error("PREFLIGHT_LOCK_FAILED");
    }
    return fd;
  } catch (error) {
    if (error?.code !== "EEXIST") throw new Error("PREFLIGHT_LOCK_FAILED");
    let owner;
    try { owner = JSON.parse(readFileSync(lockPath, "utf8")); }
    catch { throw new Error("PREFLIGHT_LOCK_RECORD_INVALID"); }
    if (!Number.isSafeInteger(owner?.pid) || owner.pid < 1) throw new Error("PREFLIGHT_LOCK_RECORD_INVALID");
    throw new Error("PREFLIGHT_ALREADY_RUNNING_OR_STALE_LOCK");
  }
}

async function databaseRequest(auth, id, method, fetchImpl) {
  return cloudRequest(auth, "/d1/database/" + encodeURIComponent(id), method, undefined, fetchImpl);
}

async function verifyDatabaseAbsent(auth, id, fetchImpl) {
  const response = await databaseRequest(auth, id, "GET", fetchImpl);
  if (response.status === 404) return true;
  if (apiOk(response)) return false;
  throw new Error("CLEANUP_VERIFY_FAILED " + apiErrorCode(response));
}

async function deleteAndVerify(auth, record, fetchImpl) {
  const current = await databaseRequest(auth, record.databaseId, "GET", fetchImpl);
  if (current.status === 404) return { alreadyAbsent: true };
  if (!apiOk(current) || current.payload?.result?.uuid !== record.databaseId ||
      current.payload?.result?.name !== record.databaseName) {
    throw new Error("SCRATCH_CLEANUP_RESOURCE_IDENTITY_MISMATCH");
  }
  const response = await databaseRequest(auth, record.databaseId, "DELETE", fetchImpl);
  if (!apiOk(response) && response.status !== 404) throw new Error("SCRATCH_DELETE_FAILED " + apiErrorCode(response));
  if (!await verifyDatabaseAbsent(auth, record.databaseId, fetchImpl)) {
    throw new Error("SCRATCH_DELETE_NOT_CONFIRMED");
  }
  return { alreadyAbsent: false };
}

async function retryPending(auth, pendingPath, fetchImpl, log) {
  const record = readPending(pendingPath);
  if (!record) throw new Error("NO_PENDING_CLEANUP");
  if (record.accountId !== auth.accountId) throw new Error("PENDING_CLEANUP_ACCOUNT_MISMATCH");
  if (record.status !== "READY_FOR_CLEANUP") throw new Error("PENDING_AMBIGUOUS_CREATE_REQUIRES_MANUAL_RESOLUTION");
  await deleteAndVerify(auth, record, fetchImpl);
  clearPending(pendingPath);
  log("PASS: pending scratch D1 deletion verified");
}

function resolveAmbiguousCreate({ env = process.env, pendingPath = DEFAULT_PENDING } = {}) {
  if (env.CHAT03B2_HOSTED_D1_RESOLVE_AMBIGUOUS !== "YES") throw new Error("AMBIGUOUS_RESOLUTION_OPT_IN_REQUIRED");
  const record = readPending(pendingPath);
  if (!record || !["CREATE_IN_FLIGHT", "CREATE_AMBIGUOUS", "CREATE_RESPONSE_MISMATCH"].includes(record.status)) {
    throw new Error("NO_AMBIGUOUS_CREATE_TO_RESOLVE");
  }
  const resolution = env.CHAT03B2_HOSTED_D1_RESOLUTION;
  if (!/^[a-f0-9]{32}$/i.test(env.CHAT03B2_HOSTED_D1_RESOLUTION_ACCOUNT_ID || "") ||
      env.CHAT03B2_HOSTED_D1_RESOLUTION_ACCOUNT_ID !== record.accountId ||
      env.CHAT03B2_HOSTED_D1_RESOLUTION_NAME !== record.databaseName ||
      !["VERIFIED_ABSENT", "VERIFIED_DELETED"].includes(resolution)) {
    throw new Error("AMBIGUOUS_RESOLUTION_IDENTITY_MISMATCH");
  }
  clearPending(pendingPath);
  return "AMBIGUOUS_CREATE_RESOLVED";
}

async function query(auth, databaseId, sql, params, fetchImpl) {
  const response = await cloudRequest(auth,
    "/d1/database/" + encodeURIComponent(databaseId) + "/query", "POST", { sql, params }, fetchImpl);
  if (!apiOk(response)) throw new Error("HOSTED_D1_QUERY_FAILED " + apiErrorCode(response));
  return response.payload.result?.[0]?.results || [];
}

async function raw(auth, databaseId, body, fetchImpl, expectSuccess = true) {
  const response = await cloudRequest(auth,
    "/d1/database/" + encodeURIComponent(databaseId) + "/raw", "POST", body, fetchImpl);
  const ok = apiOk(response);
  if (expectSuccess && !ok) throw new Error("HOSTED_D1_RAW_FAILED " + apiErrorCode(response));
  return ok;
}

async function applyMigrations(auth, databaseId, fetchImpl, log) {
  for (const file of MIGRATION_FILES) {
    const sql = readFileSync(path.join(ROOT, "migrations", file), "utf8");
    await raw(auth, databaseId, { sql }, fetchImpl);
    log("PASS: hosted migration applied " + file);
  }
}

async function assertAbsent(auth, databaseId, battleId, fetchImpl) {
  const rows = await query(auth, databaseId, `SELECT
    (SELECT COUNT(*) FROM gameplay_battles WHERE battle_id=?) AS battles,
    (SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id=?) AS events,
    (SELECT COUNT(*) FROM gameplay_battle_capabilities WHERE battle_id=?) AS capabilities,
    (SELECT COUNT(*) FROM gameplay_battle_creations WHERE battle_id=?) AS creations`,
  [battleId, battleId, battleId, battleId], fetchImpl);
  assert.deepEqual(rows[0], { battles: 0, events: 0, capabilities: 0, creations: 0 });
}

async function assertCreated(auth, databaseId, fixture, fetchImpl) {
  const id = fixture.state.battleId;
  const rows = await query(auth, databaseId, `SELECT
    (SELECT COUNT(*) FROM gameplay_battles WHERE battle_id=?) AS battles,
    (SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id=? AND event_id=? AND version=0 AND event_type='battle.created') AS genesis_events,
    (SELECT COUNT(*) FROM gameplay_battle_capabilities WHERE battle_id=?) AS capabilities,
    (SELECT COUNT(*) FROM gameplay_battle_creations WHERE battle_id=? AND idempotency_key_sha256=?) AS creations`,
  [id, id, id + ":v0:battle.created", id, id, fixture.keyHash], fetchImpl);
  assert.deepEqual(rows[0], { battles: 1, genesis_events: 1, capabilities: 2, creations: 1 });
  const caps = await query(auth, databaseId,
    "SELECT side,participant_id,length(token_sha256) AS digest_length FROM gameplay_battle_capabilities WHERE battle_id=? ORDER BY side",
    [id], fetchImpl);
  assert.deepEqual(caps, [
    { side: "A", participant_id: "test-A", digest_length: 64 },
    { side: "B", participant_id: "test-B", digest_length: 64 },
  ]);
  const stateRows = await query(auth, databaseId,
    "SELECT version,state_json FROM gameplay_battles WHERE battle_id=?", [id], fetchImpl);
  assert.equal(stateRows[0].version, 0);
  assert.equal(JSON.parse(stateRows[0].state_json).events.length, 1);
  const recovery = await query(auth, databaseId,
    "SELECT length(recovery_nonce_base64url) AS nonce_length,length(capabilities_ciphertext_base64url) AS ciphertext_length FROM gameplay_battle_creations WHERE battle_id=?",
    [id], fetchImpl);
  assert.deepEqual(recovery, [{ nonce_length: 16, ciphertext_length: 64 }]);
}

async function runSqlProbes(auth, databaseId, fetchImpl = fetch, log = console.log) {
  const suffix = randomBytes(8).toString("hex");
  const good = makeCreateBatch("scratch-valid-" + suffix, "valid-" + suffix);
  assert.equal(await raw(auth, databaseId, { batch: good.batch }, fetchImpl), true);
  await assertCreated(auth, databaseId, good, fetchImpl);
  log("PASS: one D1 batch atomically creates battle, genesis, both capability digests and idempotency row");

  const duplicateKey = makeCreateBatch("scratch-duplicate-key-" + suffix, "duplicate-key-" + suffix,
    { idempotencyKeyHash: good.keyHash });
  assert.equal(await raw(auth, databaseId, { batch: duplicateKey.batch }, fetchImpl, false), false);
  await assertAbsent(auth, databaseId, duplicateKey.state.battleId, fetchImpl);
  log("PASS: idempotency uniqueness failure rolls back genesis, capabilities and battle");

  const invalidCapability = makeCreateBatch("scratch-invalid-cap-" + suffix, "invalid-cap-" + suffix);
  const invalidCapBatch = invalidCapability.batch.map((item, index) => index === 2
    ? { ...item, params: [invalidCapability.state.battleId, "test-B", sha256("invalid")], sql: item.sql.replace("'B'", "'X'") }
    : item);
  assert.equal(await raw(auth, databaseId, { batch: invalidCapBatch }, fetchImpl, false), false);
  await assertAbsent(auth, databaseId, invalidCapability.state.battleId, fetchImpl);
  log("PASS: capability CHECK failure rolls back the complete create batch");

  const invalidRecovery = makeCreateBatch("scratch-invalid-recovery-" + suffix, "invalid-recovery-" + suffix);
  invalidRecovery.batch[3].params[3] = "short-nonce";
  assert.equal(await raw(auth, databaseId, { batch: invalidRecovery.batch }, fetchImpl, false), false);
  await assertAbsent(auth, databaseId, invalidRecovery.state.battleId, fetchImpl);
  log("PASS: idempotency recovery CHECK failure rolls back battle and capabilities");

  const invalidGenesis = makeCreateBatch("scratch-invalid-genesis-" + suffix, "invalid-genesis-" + suffix);
  invalidGenesis.batch[0].params[2] = JSON.stringify({ ...invalidGenesis.state.events[0], eventId: "forged-origin" });
  assert.equal(await raw(auth, databaseId, { batch: invalidGenesis.batch }, fetchImpl, false), false);
  await assertAbsent(auth, databaseId, invalidGenesis.state.battleId, fetchImpl);
  log("PASS: malformed genesis/origin is rejected with no partial create rows");

  const schema = await query(auth, databaseId,
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('gameplay_battles','gameplay_event_outbox','gameplay_battle_capabilities','gameplay_battle_creations') ORDER BY name",
    [], fetchImpl);
  assert.deepEqual(schema.map(row => row.name), [
    "gameplay_battle_capabilities", "gameplay_battle_creations", "gameplay_battles", "gameplay_event_outbox",
  ]);
}

export async function runHostedPreflight({
  env = process.env, fetchImpl = fetch, pendingPath = DEFAULT_PENDING, lockPath = DEFAULT_LOCK,
  log = console.log,
} = {}) {
  const manualResolution = env.CHAT03B2_HOSTED_D1_RESOLVE_AMBIGUOUS !== undefined;
  const auth = manualResolution ? null : validateOptIn(env);
  const lockFd = acquireLock(lockPath);
  let record = null;
  let pendingPersisted = false;
  let primaryFailure = null;
  try {
    if (manualResolution) {
      resolveAmbiguousCreate({ env, pendingPath });
      log("PASS: ambiguous CREATE marker cleared after explicit exact-name manual resolution");
      return;
    }
    if (env.CHAT03B2_HOSTED_D1_RETRY_CLEANUP === "YES") {
      await retryPending(auth, pendingPath, fetchImpl, log);
      return;
    }
    if (existsSync(pendingPath)) throw new Error("PENDING_CLEANUP_BLOCKS_NEW_DATABASE");

    const name = newScratchName();
    record = { schema: 1, status: "CREATE_IN_FLIGHT", accountId: auth.accountId,
      databaseId: null, databaseName: name };
    writePending(pendingPath, record);
    pendingPersisted = true;
    log("Creating isolated hosted D1 scratch database " + name);
    let created;
    try {
      created = await cloudRequest(auth, "/d1/database", "POST", {
        name, read_replication: { mode: "disabled" },
      }, fetchImpl);
    } catch (error) {
      record = { ...record, status: "CREATE_AMBIGUOUS" };
      try { writePending(pendingPath, record); } catch { /* CREATE_IN_FLIGHT marker still blocks reruns */ }
      throw error;
    }
    const createdId = created.payload?.result?.uuid;
    if (isDatabaseUuid(createdId) && created.payload?.result?.name !== name) {
      record = { ...record, status: "CREATE_RESPONSE_MISMATCH", databaseId: createdId,
        createResponseName: typeof created.payload?.result?.name === "string" ? created.payload.result.name : null };
      try { writePending(pendingPath, record); } catch { /* previous CREATE_IN_FLIGHT marker still blocks reruns */ }
      throw new Error("SCRATCH_CREATE_RESOURCE_IDENTITY_MISMATCH");
    }
    if (!apiOk(created) || !isDatabaseUuid(createdId)) {
      record = { ...record, status: "CREATE_AMBIGUOUS" };
      try { writePending(pendingPath, record); } catch { /* previous CREATE_IN_FLIGHT marker still blocks reruns */ }
      throw new Error("SCRATCH_CREATE_FAILED " + apiErrorCode(created));
    }
    record = { schema: 1, status: "READY_FOR_CLEANUP", accountId: auth.accountId,
      databaseId: createdId, databaseName: name, createResponseName: name };
    writePending(pendingPath, record);

    await applyMigrations(auth, createdId, fetchImpl, log);
    await runSqlProbes(auth, createdId, fetchImpl, log);
    primaryFailure = null;
  } catch (error) {
    primaryFailure = error instanceof Error ? error : new Error("HOSTED_PREFLIGHT_FAILED");
  } finally {
    if (record?.status === "READY_FOR_CLEANUP") {
      try {
        const cleanup = await deleteAndVerify(auth, record, fetchImpl);
        clearPending(pendingPath);
        log(cleanup.alreadyAbsent
          ? "PASS: scratch D1 was already absent and cleanup verified"
          : "PASS: scratch D1 deleted after identity verification and absence verified");
      } catch {
        try {
          writePending(pendingPath, record);
          pendingPersisted = true;
        } catch {
          try {
            const saved = readPending(pendingPath);
            pendingPersisted = saved?.accountId === record.accountId && saved?.databaseId === record.databaseId;
          } catch { pendingPersisted = false; }
        }
        primaryFailure = new Error((primaryFailure ? primaryFailure.message + "; " : "") +
          "SCRATCH_CLEANUP_FAILED id=" + record.databaseId + (pendingPersisted
            ? "; retry only with CHAT03B2_HOSTED_D1_RETRY_CLEANUP=YES"
            : "; PENDING_CLEANUP_RECORD_MISSING; manual Cloudflare inspection required"));
      }
    } else if (record && pendingPersisted) {
      primaryFailure = new Error((primaryFailure ? primaryFailure.message + "; " : "") +
        "PENDING_AMBIGUOUS_CREATE_REQUIRES_MANUAL_RESOLUTION");
    }
    closeSync(lockFd);
    try { unlinkSync(lockPath); } catch { /* leave a stale lock to fail closed */ }
  }
  if (primaryFailure) throw primaryFailure;
  log("HOSTED_D1_SQL_API_PASS (NOT WORKER_AUTH_PASS)");
}

async function main() {
  try {
    await runHostedPreflight();
  } catch (error) {
    console.error("HOSTED_D1_PREFLIGHT_FAIL " + (error instanceof Error ? error.message : "UNKNOWN"));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
