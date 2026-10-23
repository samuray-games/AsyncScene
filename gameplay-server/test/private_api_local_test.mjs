// Reproducible PRIVATE local workerd/D1 API integration. No real Cloudflare
// credentials, no telemetry binding and no public Worker deployment.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../../AsyncScene/Web/conflict/tactical-resolver.js";
import "../../AsyncScene/Web/conflict/tactical-lifecycle.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = process.env.WRANGLER_BIN || path.resolve(root, "../node_modules/.bin/wrangler");
const cfg = "wrangler.api-local-test.jsonc";
const dir = mkdtempSync(path.join(os.tmpdir(), "chat03b2-private-api-"));
const env = { ...process.env, WRANGLER_SEND_METRICS: "false" };
const admin = "local-test-admin-" + "a".repeat(48);
let worker, logs = "";
const selection = { attackColor: "y", defenseColor: "y", attackType: "N", defenseType: "S", role: "citizen" };

async function pickPort() {
  const s = net.createServer();
  await new Promise(r => s.listen(0, "127.0.0.1", r));
  const port = s.address().port;
  await new Promise(r => s.close(r));
  return port;
}
function migrate(file) {
  const r = spawnSync(cli, ["d1", "execute", "DB", "--local", "--config", cfg,
    "--file", file, "--persist-to", dir, "--yes"], {
    cwd: root, env, encoding: "utf8", timeout: 60000,
  });
  if (r.error || r.status !== 0) throw Error("MIGRATION_FAILED " +
    file + " " + String(r.error || "") + " " + (r.stderr || "").slice(-2500));
}
function query(sql) {
  const r = spawnSync(cli, ["d1", "execute", "DB", "--local", "--config", cfg,
    "--command", sql, "--json", "--persist-to", dir, "--yes"], {
    cwd: root, env, encoding: "utf8", timeout: 60000,
  });
  if (r.error || r.status !== 0) throw Error("QUERY_FAILED " + String(r.error || "") + " " + (r.stderr || "").slice(-2500));
  const parsed = JSON.parse(r.stdout);
  const rows = parsed?.[0]?.results ?? parsed?.results;
  assert.ok(Array.isArray(rows), "unexpected Wrangler D1 JSON output: " + r.stdout.slice(0, 1000));
  return rows;
}
function executeSql(sql) {
  const r = spawnSync(cli, ["d1", "execute", "DB", "--local", "--config", cfg,
    "--command", sql, "--json", "--persist-to", dir, "--yes"], {
    cwd: root, env, encoding: "utf8", timeout: 60000,
  });
  if (r.error || r.status !== 0) throw Error("EXECUTE_FAILED " + String(r.error || "") + " " + (r.stderr || "").slice(-2500));
}
async function request(base, method, route, token, body, origin, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (token) headers.authorization = "Bearer " + token;
  if (body) headers["content-type"] = "application/json";
  if (origin) headers.origin = origin;
  const r = await fetch(base + route, { method, headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(9000),
  });
  const json = await r.json();
  return { status: r.status, ...json };
}
async function start(base) {
  for (let i = 0; i < 120; i++) {
    if (worker.exitCode !== null) throw Error("WRANGLER_EXIT " + logs.slice(-3500));
    try {
      const r = await fetch(base + "/not-found", { signal: AbortSignal.timeout(300) });
      if (r.status) return;
    } catch { /* workerd warming up */ }
    await new Promise(r => setTimeout(r, 200));
  }
  throw Error("WRANGLER_TIMEOUT " + logs.slice(-3500));
}
async function createRequest(base, name, idempotencyKey) {
  return request(base, "POST", "/v1/admin/battles", admin, {
    participants: {
      A: { id: name + "-A", role: "citizen" },
      B: { id: name + "-B", role: "citizen" },
    },
  }, null, { "idempotency-key": idempotencyKey });
}
function testCreateKey(name) { return (`test-create-${name}-key-000000000001`).padEnd(48, "x"); }
async function create(base, name, idempotencyKey = testCreateKey(name)) {
  const r = await createRequest(base, name, idempotencyKey);
  assert.ok([200, 201].includes(r.status), JSON.stringify(r));
  assert.match(r.battleId, /^[a-f0-9-]{36}$/);
  assert.ok(r.capabilities?.A?.token && r.capabilities?.B?.token);
  assert.notEqual(r.capabilities.A.token, r.capabilities.B.token);
  return r;
}
async function get(base, battle, token) {
  return request(base, "GET", "/v1/battles/" + battle.battleId, token);
}
async function commit(base, battle, side, commandId, extra = {}) {
  return request(base, "POST", "/v1/battles/" + battle.battleId + "/commit",
    battle.capabilities[side].token, { commandId, selection, ...extra });
}

try {
  migrate("migrations/0001_tactical_state.sql");
  migrate("migrations/0002_battle_capabilities.sql");
  migrate("migrations/0003_idempotent_battle_creation.sql");
  migrate("migrations/0004_capability_generation.sql");
  migrate("migrations/0005_participant_transition_fence.sql");
  const expiredId = "11111111-1111-4111-8111-111111111111";
  const expiryToken = "expired-access-" + "z".repeat(36);
  const lc = globalThis.TacticalCombatLifecycleV1.createLifecycle(globalThis.Game.TacticalCombatV1);
  const origin = lc.createBattle({
    battleId: expiredId, createdAt: 0, deadlineAt: 1000,
    participants: { A: { id: "expired-A", role: "citizen" },
                    B: { id: "expired-B", role: "citizen" } },
  });
  assert.equal(origin.ok, true, JSON.stringify(origin));
  const sqlq = x => "'" + String(x).replaceAll("'", "''") + "'";
  const digest = createHash("sha256").update(expiryToken).digest("hex");
  const oneSideId = "33333333-3333-4333-8333-333333333333";
  const oneSideToken = "one-side-access-" + "w".repeat(32);
  const oneSideGenesis = lc.createBattle({
    battleId: oneSideId, createdAt: 0, deadlineAt: 1000,
    participants: { A: { id: "one-side-A", role: "citizen" },
                    B: { id: "no-show-B", role: "citizen" } },
  });
  const oneSideCommit = lc.execute(oneSideGenesis.state, {
    type: "commit", commandId: "one-side-commit-A", expectedVersion: 0,
    actorId: "one-side-A", participantId: "one-side-A", selection,
  }, 500);
  assert.equal(oneSideCommit.ok, true, JSON.stringify(oneSideCommit));
  const oneSideEvents = oneSideCommit.state.events.filter(e => oneSideCommit.eventIds.includes(e.eventId));
  let fixtureSql = `INSERT INTO gameplay_create_battle
    (battle_id,initial_state_json,creation_event_json,trusted_now_ms)
    VALUES (${sqlq(expiredId)},${sqlq(JSON.stringify(origin.state))},
            ${sqlq(JSON.stringify(origin.state.events[0]))},0);
    INSERT INTO gameplay_battle_capabilities
    (battle_id,side,participant_id,token_sha256,created_at_ms)
    VALUES (${sqlq(expiredId)},'A','expired-A',${sqlq(digest)},0);`;
  fixtureSql += `INSERT INTO gameplay_create_battle
    (battle_id,initial_state_json,creation_event_json,trusted_now_ms)
    VALUES (${sqlq(oneSideId)},${sqlq(JSON.stringify(oneSideGenesis.state))},
      ${sqlq(JSON.stringify(oneSideGenesis.state.events[0]))},0);
    INSERT INTO gameplay_apply_transition
      (battle_id,expected_version,command_id,fingerprint,receipt_code,
       receipt_event_ids_json,next_state_json,events_json,trusted_now_ms)
      VALUES (${sqlq(oneSideId)},0,'one-side-commit-A','fixture','COMMITTED',
        ${sqlq(JSON.stringify(oneSideCommit.eventIds))},${sqlq(JSON.stringify(oneSideCommit.state))},
        ${sqlq(JSON.stringify(oneSideEvents))},500);
    INSERT INTO gameplay_battle_capabilities
      (battle_id,side,participant_id,token_sha256,created_at_ms)
      VALUES (${sqlq(oneSideId)},'A','one-side-A',
        ${sqlq(createHash("sha256").update(oneSideToken).digest("hex"))},0);`;
  // Cron must NOT let a backlog of healthy, not-yet-due battles starve a
  // newer committed battle awaiting trusted reveal. 101 > the 100-row cap.
  const backloggedAt = Date.now() - 30_000;
  const pendingUntil = backloggedAt + 120_000;
  function genesisSql(battle) {
    return `INSERT INTO gameplay_create_battle
      (battle_id,initial_state_json,creation_event_json,trusted_now_ms)
      VALUES (${sqlq(battle.battleId)},${sqlq(JSON.stringify(battle))},
      ${sqlq(JSON.stringify(battle.events[0]))},${battle.createdAt});`;
  }
  for (let i = 0; i < 101; i++) {
    const b = lc.createBattle({
      battleId: "healthy-backlog-" + i, createdAt: backloggedAt,
      deadlineAt: pendingUntil,
      participants: { A: { id: "healthy-A", role: "citizen" },
                      B: { id: "healthy-B", role: "citizen" } },
    });
    assert.equal(b.ok, true);
    fixtureSql += genesisSql(b.state);
  }
  const stuckId = "22222222-2222-4222-8222-222222222222";
  const stuckToken = "stuck-reveal-" + "q".repeat(36);
  const stuckCreatedAt = backloggedAt + 10_000;
  const stuckGenesis = lc.createBattle({
    battleId: stuckId, createdAt: stuckCreatedAt,
    deadlineAt: pendingUntil,
    participants: { A: { id: "stuck-A", role: "citizen" },
                    B: { id: "stuck-B", role: "citizen" } },
  });
  assert.equal(stuckGenesis.ok, true);
  fixtureSql += genesisSql(stuckGenesis.state);
  fixtureSql += `INSERT INTO gameplay_battle_capabilities
    (battle_id,side,participant_id,token_sha256,created_at_ms)
    VALUES (${sqlq(stuckId)},'A','stuck-A',
      ${sqlq(createHash("sha256").update(stuckToken).digest("hex"))},${stuckCreatedAt});`;
  let beforeReveal = stuckGenesis.state;
  for (const side of ["A", "B"]) {
    const at = stuckCreatedAt + (side === "A" ? 1000 : 2000);
    const cmd = { type: "commit", commandId: "stuck-" + side,
      actorId: "stuck-" + side, participantId: "stuck-" + side,
      expectedVersion: beforeReveal.version, selection };
    const result = lc.execute(beforeReveal, cmd, at);
    assert.equal(result.ok, true, JSON.stringify(result));
    const events = result.state.events.filter(e => result.eventIds.includes(e.eventId));
    fixtureSql += `INSERT INTO gameplay_apply_transition
      (battle_id,expected_version,command_id,fingerprint,receipt_code,
       receipt_event_ids_json,next_state_json,events_json,trusted_now_ms)
      VALUES (${sqlq(stuckId)},${beforeReveal.version},${sqlq(cmd.commandId)},
        'fixture',${sqlq(result.code)},${sqlq(JSON.stringify(result.eventIds))},
        ${sqlq(JSON.stringify(result.state))},${sqlq(JSON.stringify(events))},${at});`;
    beforeReveal = result.state;
  }
  assert.equal(beforeReveal.phase, "committed");
  const fixturePath = path.join(dir, "expired-fixture.sql");
  writeFileSync(fixturePath, fixtureSql);
  migrate(fixturePath);
  console.log("PASS: both D1 migrations and expired genesis fixture");
  const port = await pickPort();
  const base = "http://127.0.0.1:" + port;
  let recoveryCurrent = "testV1";
  let recoveryKeys = { testV1: Buffer.alloc(32, 7).toString("base64url") };
  function spawnApi() {
    const args = [
      "dev", "--test-scheduled", "--config", cfg, "--ip", "127.0.0.1", "--port", String(port),
      "--persist-to", dir,
      "--var", "ADMIN_CONTROL_TOKEN:" + admin,
      // Crypto failure coverage restarts the local Worker several times.
      // Keep unrelated battle fixtures live throughout slower CI runners.
      "--var", "COMMIT_WINDOW_MS:600000",
      "--var", "ALLOWED_ORIGIN:https://game.example.test",
      "--var", "CREATE_RECOVERY_KEY_CURRENT:" + recoveryCurrent,
      "--var", "CREATE_RECOVERY_KEYS:" + JSON.stringify(recoveryKeys),
    ];
    const child = spawn(cli, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
    for (const stream of [child.stdout, child.stderr]) {
      stream.setEncoding("utf8");
      stream.on("data", v => { logs = (logs + v).slice(-30000); });
    }
    return child;
  }
  worker = spawnApi();
  await start(base);

  const alphaKey = testCreateKey("alpha");
  const alphaBody = { participants: {
    A: { id: "alpha-A", role: "citizen" }, B: { id: "alpha-B", role: "citizen" },
  } };
  const battleCountBeforeUnauthorizedCreate = query("SELECT COUNT(*) count FROM gameplay_battles")[0].count;
  const denyAdmin = await request(base, "POST", "/v1/admin/battles", "not-the-admin", alphaBody,
    null, { "idempotency-key": alphaKey });
  assert.equal(denyAdmin.status, 401);
  assert.deepEqual(denyAdmin, { status: 401, error: "UNAUTHORIZED" });
  assert.equal(query("SELECT COUNT(*) count FROM gameplay_battles")[0].count, battleCountBeforeUnauthorizedCreate,
    "unauthorized create must not reveal or create a battle");
  const missingKey = await request(base, "POST", "/v1/admin/battles", admin, alphaBody);
  assert.equal(missingKey.status, 400);
  assert.equal(missingKey.error, "INVALID_IDEMPOTENCY_KEY");
  assert.equal(query("SELECT COUNT(*) count FROM gameplay_battles")[0].count, battleCountBeforeUnauthorizedCreate);
  // Verify enforcement even if Content-Length is absent: the Worker must
  // stop an oversized streaming body before parsing or writing to D1.
  const giant = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"participants":' + " ".repeat(9000) + '}'));
      controller.close();
    },
  });
  const oversized = await fetch(base + "/v1/admin/battles", {
    method: "POST",
    headers: { authorization: "Bearer " + admin, "content-type": "application/json" },
    body: giant, duplex: "half", signal: AbortSignal.timeout(9000),
  });
  assert.equal(oversized.status, 413, "stream without Content-Length bypassed body limit");
  console.log("PASS: oversized streaming request rejected before JSON parsing");
  const battle = await create(base, "alpha", alphaKey);
  const repeatedCreate = await create(base, "alpha", alphaKey);
  assert.equal(repeatedCreate.battleId, battle.battleId,
    "repeating the same authorized create request must return the original battle");
  assert.deepEqual(repeatedCreate.capabilities, battle.capabilities,
    "idempotent recovery must return the original participant capabilities");
  const creationHash = createHash("sha256").update("chat03b2:create-battle:v1:" + alphaKey).digest("hex");
  const encryptedRecord = query(`SELECT * FROM gameplay_battle_creations WHERE idempotency_key_sha256='${creationHash}'`)[0];
  assert.ok(encryptedRecord, "idempotency recovery row missing");
  assert.ok(!Object.keys(encryptedRecord).some(k => /token/i.test(k)), "raw token column must not exist");
  assert.ok(!encryptedRecord.capabilities_ciphertext_base64url.includes(battle.capabilities.A.token));
  assert.ok(!encryptedRecord.capabilities_ciphertext_base64url.includes(battle.capabilities.B.token));
  const tamperedCiphertext = (encryptedRecord.capabilities_ciphertext_base64url[0] === "A" ? "B" : "A") +
    encryptedRecord.capabilities_ciphertext_base64url.slice(1);
  executeSql(`UPDATE gameplay_battle_creations SET capabilities_ciphertext_base64url='${tamperedCiphertext}' WHERE idempotency_key_sha256='${creationHash}'`);
  const corruptRecovery = await createRequest(base, "alpha", alphaKey);
  assert.equal(corruptRecovery.status, 500);
  assert.deepEqual(corruptRecovery, { status: 500, error: "SERVER_ERROR" },
    "AEAD failures must not disclose recovery details");
  executeSql(`UPDATE gameplay_battle_creations SET capabilities_ciphertext_base64url='${encryptedRecord.capabilities_ciphertext_base64url}' WHERE idempotency_key_sha256='${creationHash}'`);
  console.log("PASS: recovery tokens are ciphertext-only and AEAD tampering returns a generic error");

  // Negative-path crypto coverage exercises the real admin-create replay
  // branch against this local workerd instance and its isolated D1 binding.
  const originalNonce = encryptedRecord.recovery_nonce_base64url;
  const originalDeadline = encryptedRecord.deadline_at_ms;
  const originalKeyVersion = encryptedRecord.recovery_key_version;
  const originalRecoveryCurrent = recoveryCurrent;
  const originalRecoveryKeys = { ...recoveryKeys };
  const testV2Key = Buffer.alloc(32, 8).toString("base64url");
  const countRecoveryRows = () => Object.fromEntries([
    "gameplay_battles", "gameplay_battle_capabilities",
    "gameplay_battle_creations", "gameplay_event_outbox",
  ].map(table => [table, query(`SELECT COUNT(*) count FROM ${table}`)[0].count]));
  let recoveryRowCounts = countRecoveryRows();
  const sensitiveRecoveryValues = [
    battle.capabilities.A.token, battle.capabilities.B.token, admin, alphaKey,
    originalRecoveryKeys.testV1, testV2Key,
    originalNonce, encryptedRecord.capabilities_ciphertext_base64url,
  ].filter(value => typeof value === "string" && value.length > 0);
  async function assertRejectedRecovery(label) {
    const response = await createRequest(base, "alpha", alphaKey);
    assert.equal(response.status, 500, `${label}: expected generic server failure`);
    assert.deepEqual(response, { status: 500, error: "SERVER_ERROR" },
      `${label}: public response must contain only the generic error`);
    const publicBody = JSON.stringify(response);
    for (const secret of sensitiveRecoveryValues) {
      assert.ok(!publicBody.includes(secret), `${label}: public response exposed sensitive recovery material`);
    }
    assert.deepEqual(countRecoveryRows(), recoveryRowCounts,
      `${label}: failure must not create a battle, capability, creation or outbox row`);
    const replay = await query(`SELECT battle_id,deadline_at_ms,recovery_key_version,
      recovery_nonce_base64url,capabilities_ciphertext_base64url
      FROM gameplay_battle_creations WHERE idempotency_key_sha256='${creationHash}'`)[0];
    assert.equal(replay.battle_id, battle.battleId, `${label}: recovery row identity changed`);
    return response;
  }
  async function restartWorker() {
    const previous = worker;
    previous.kill("SIGTERM");
    await new Promise(resolve => previous.once("close", resolve));
    worker = spawnApi();
    await start(base);
  }
  function setRecoveryRecord({ nonce = originalNonce, deadline = originalDeadline,
    keyVersion = originalKeyVersion, ciphertext = encryptedRecord.capabilities_ciphertext_base64url } = {}) {
    executeSql(`UPDATE gameplay_battle_creations SET
      recovery_nonce_base64url='${nonce}', deadline_at_ms=${deadline},
      recovery_key_version='${keyVersion}',
      capabilities_ciphertext_base64url='${ciphertext}'
      WHERE idempotency_key_sha256='${creationHash}'`);
  }

  const nonceBytes = Buffer.alloc(12, 0x5a);
  const tamperedNonce = nonceBytes.toString("base64url");
  assert.equal(Buffer.from(tamperedNonce, "base64url").length, 12, "fixture nonce must be valid 96-bit GCM nonce");
  assert.notEqual(tamperedNonce, originalNonce);
  setRecoveryRecord({ nonce: tamperedNonce });
  await assertRejectedRecovery("valid-length recovery nonce tampering");
  setRecoveryRecord();
  console.log("PASS: altered valid 96-bit recovery nonce fails AEAD without writes or disclosure");

  setRecoveryRecord({ deadline: originalDeadline + 1 });
  await assertRejectedRecovery("deadline AAD tampering");
  setRecoveryRecord();
  console.log("PASS: altered deadline AAD fails authentication without writes or disclosure");

  recoveryKeys = { ...originalRecoveryKeys, testV2: testV2Key };
  await restartWorker();
  assert.equal(Buffer.from(recoveryKeys.testV2, "base64url").length, 32,
    "test requires a valid second recovery key version");
  setRecoveryRecord({ keyVersion: "testV2" });
  await assertRejectedRecovery("existing but incorrect recovery key version AAD");
  setRecoveryRecord();
  console.log("PASS: substituted existing recovery key version fails authentication without writes");

  recoveryCurrent = "testV2";
  recoveryKeys = { testV2: testV2Key };
  assert.equal(Buffer.from(recoveryKeys[recoveryCurrent], "base64url").length, 32,
    "missing historical-key scenario must use a valid current 256-bit key");
  await restartWorker();
  const keyringSmokeKey = testCreateKey("valid-keyring-smoke");
  const keyringSmoke = await createRequest(base, "valid-keyring-smoke", keyringSmokeKey);
  assert.equal(keyringSmoke.status, 201,
    "current testV2 keyring must successfully create a separate synthetic battle before historical replay");
  assert.ok(keyringSmoke.battleId && keyringSmoke.capabilities?.A?.token && keyringSmoke.capabilities?.B?.token,
    "valid keyring smoke create must return its synthetic battle and capabilities");
  sensitiveRecoveryValues.push(keyringSmoke.capabilities.A.token, keyringSmoke.capabilities.B.token);
  const keyringSmokeHash = createHash("sha256")
    .update("chat03b2:create-battle:v1:" + keyringSmokeKey).digest("hex");
  assert.equal(query(`SELECT recovery_key_version FROM gameplay_battle_creations
    WHERE idempotency_key_sha256='${keyringSmokeHash}'`)[0].recovery_key_version, "testV2",
    "positive keyring smoke must persist the active testV2 version");
  assert.equal(originalKeyVersion, "testV1", "replay target must still reference the historical testV1 key");
  assert.equal(recoveryCurrent, "testV2", "missing-key scenario must keep testV2 as the active key version");
  assert.equal(Object.hasOwn(recoveryKeys, originalKeyVersion), false,
    "historical testV1 key must be absent from the otherwise-valid keyring");
  recoveryRowCounts = countRecoveryRows();
  await assertRejectedRecovery("missing historical recovery key after Worker restart");
  recoveryKeys = { ...originalRecoveryKeys };
  recoveryCurrent = originalRecoveryCurrent;
  await restartWorker();
  console.log("PASS: valid testV2 keyring creates successfully, then missing testV1 replay fails without writes/disclosure");

  recoveryKeys = { ...originalRecoveryKeys, testV1: Buffer.alloc(32, 0x39).toString("base64url") };
  await restartWorker();
  await assertRejectedRecovery("wrong valid 256-bit historical recovery key after Worker restart");
  recoveryKeys = { ...originalRecoveryKeys };
  await restartWorker();
  console.log("PASS: wrong 256-bit historical key fails AEAD after restart without writes or disclosure");

  setRecoveryRecord();
  const restoredReplay = await createRequest(base, "alpha", alphaKey);
  assert.equal(restoredReplay.status, 200, "restored crypto inputs must recover the original create response");
  assert.equal(restoredReplay.battleId, battle.battleId);
  assert.equal(restoredReplay.deadlineAt, battle.deadlineAt);
  assert.deepEqual(restoredReplay.capabilities, battle.capabilities);
  assert.deepEqual(countRecoveryRows(), recoveryRowCounts,
    "restored replay must not create additional battles, capabilities, creation rows or events");
  console.log("PASS: restored nonce, AAD record and historical key recover original battle/deadline/capabilities");

  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_event_outbox WHERE battle_id='${battle.battleId}'`)[0].count, 1,
    "creation retry must not duplicate genesis event");
  console.log("PASS: repeated create returns one battle, original capabilities and one genesis event");
  const changedCreate = await request(base, "POST", "/v1/admin/battles", admin, {
    participants: {
      A: { id: "changed-A", role: "citizen" }, B: { id: "changed-B", role: "citizen" },
    },
  }, null, { "idempotency-key": alphaKey });
  assert.equal(changedCreate.status, 409, JSON.stringify(changedCreate));
  assert.equal(changedCreate.error, "IDEMPOTENCY_KEY_REUSE");
  assert.ok(!("capabilities" in changedCreate) && !("battleId" in changedCreate));
  console.log("PASS: idempotency key cannot be reused with changed participants");
  assert.equal((await request(base, "GET", "/v1/battles/" + battle.battleId)).status, 401);
  assert.equal((await get(base, battle, battle.capabilities.A.token)).version, 0);
  assert.equal((await request(base, "POST", "/v1/battles/" + battle.battleId + "/finalize",
    battle.capabilities.A.token, { recognizedOutcome: "A_WIN" })).status, 404,
  "Chat05 recognition/finalization must not be exposed by Chat03");
  const originBlocked = await request(base, "GET", "/v1/battles/" + battle.battleId,
    battle.capabilities.A.token, null, "https://evil.example.test");
  assert.equal(originBlocked.status, 403);
  console.log("PASS: admin bootstrap, isolated player tokens and forbidden origins");

  const invalidSpoof = await commit(base, battle, "A", "command-spoof", { actorId: "alpha-B" });
  assert.equal(invalidSpoof.status, 400);
  const publicTransitionSelector = await request(base, "POST",
    "/v1/battles/" + battle.battleId + "/transition", battle.capabilities.A.token,
    { transition: "system", commandId: "public-system-selector", selection });
  assert.equal(publicTransitionSelector.status, 404,
    "public HTTP must not expose the unrestricted Worker scheduler transition path");
  const a = await commit(base, battle, "A", "command-alpha-A");
  assert.equal(a.status, 200, JSON.stringify(a));
  assert.equal(a.code, "COMMITTED");
  const viewB = await get(base, battle, battle.capabilities.B.token);
  assert.equal(viewB.version, 1);
  assert.equal(viewB.opponentCommitted, true);
  assert.equal(viewB.selfCommitted, false);
  assert.equal(viewB.revealed, false);
  assert.ok(!JSON.stringify(viewB).includes("attackColor"), "leaked secret selection to B before reveal");
  console.log("PASS: actor spoof blocked; selection remains hidden after first commit");

  const committedSnapshot = query(`SELECT b.version,b.state_json,
    (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
    (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${battle.battleId}'`)[0];
  assert.ok(committedSnapshot, "committed battle was not persisted");
  const committedState = JSON.parse(committedSnapshot.state_json);
  const committedSnapshotAfterRejectedCommands = () => query(`SELECT b.version,b.state_json,
    (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
    (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${battle.battleId}'`)[0];
  for (let i = 0; i < 100; i++) {
    const duplicate = await commit(base, battle, "A", `fresh-command-${String(i).padStart(3, "0")}`);
    assert.equal(duplicate.status, 409, `fresh command ${i} must not mutate accepted choice: ${JSON.stringify(duplicate)}`);
    assert.equal(duplicate.error, "ALREADY_COMMITTED");
  }
  const concurrentDuplicates = await Promise.all(Array.from({ length: 16 }, (_, i) =>
    commit(base, battle, "A", `parallel-fresh-${String(i).padStart(3, "0")}`)));
  assert.ok(concurrentDuplicates.every(x => x.status === 409), JSON.stringify(concurrentDuplicates));
  const afterDuplicates = query(`SELECT b.version,b.state_json,
    (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
    (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${battle.battleId}'`)[0];
  assert.equal(afterDuplicates.version, committedSnapshot.version);
  assert.equal(afterDuplicates.receipts, committedSnapshot.receipts);
  assert.equal(afterDuplicates.outbox, committedSnapshot.outbox);
  assert.deepEqual(JSON.parse(afterDuplicates.state_json), committedState);
  const changedSelection = await commit(base, battle, "A", "fresh-command-different-selection", {
    selection: { ...selection, attackColor: "o" },
  });
  assert.equal(changedSelection.status, 409, JSON.stringify(changedSelection));
  assert.equal(changedSelection.error, "COMMIT_IMMUTABLE", JSON.stringify(changedSelection));
  const identicalSelection = await commit(base, battle, "A", "fresh-command-identical-selection");
  assert.equal(identicalSelection.status, 409, JSON.stringify(identicalSelection));
  assert.equal(identicalSelection.error, "ALREADY_COMMITTED", JSON.stringify(identicalSelection));
  const unauthorizedCommit = await request(base, "POST", "/v1/battles/" + battle.battleId + "/commit",
    "not-a-capability", { commandId: "unauthorized-command", selection: { ...selection, attackColor: "o" } });
  assert.deepEqual(unauthorizedCommit, { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(committedSnapshotAfterRejectedCommands(), committedSnapshot);
  console.log("PASS: 100 fresh IDs plus 16 concurrent fresh IDs cannot grow committed state/receipts/outbox");

  const aReplay = await commit(base, battle, "A", "command-alpha-A");
  assert.equal(aReplay.status, 200);
  assert.equal(aReplay.replayed, true);
  const badReplay = await commit(base, battle, "A", "command-alpha-A", {
    selection: { ...selection, attackColor: "o" },
  });
  assert.equal(badReplay.status, 409);
  assert.equal(badReplay.error, "COMMAND_ID_REUSE");
  assert.deepEqual(committedSnapshotAfterRejectedCommands(), committedSnapshot);
  console.log("PASS: idempotent replay across devices and changed-command rejection");

  executeSql(`UPDATE gameplay_battle_capabilities SET status='revoked'
    WHERE battle_id='${battle.battleId}' AND side='A'`);
  const revokedReplay = await commit(base, battle, "A", "command-alpha-A");
  assert.deepEqual(revokedReplay, { status: 401, error: "UNAUTHORIZED" });
  const revokedRead = await get(base, battle, battle.capabilities.A.token);
  assert.deepEqual(revokedRead, { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(committedSnapshotAfterRejectedCommands(), committedSnapshot,
    "revoked read/replay must disclose no receipt and write no gameplay rows");
  console.log("PASS: revoked capability cannot read battle state or replay a stored receipt");

  const b = await commit(base, battle, "B", "command-alpha-B");
  assert.equal(b.status, 200, JSON.stringify(b));
  const publicA = await get(base, battle, battle.capabilities.A.token);
  const publicB = await get(base, battle, battle.capabilities.B.token);
  assert.equal(publicA.revealed, true, JSON.stringify(publicA));
  assert.equal(publicB.revealed, true, JSON.stringify(publicB));
  assert.equal(publicA.version, 3);
  assert.equal(publicB.version, 3);
  const completed = query(`SELECT b.state_json,
    (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
    (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${battle.battleId}'`)[0];
  const completedState = JSON.parse(completed.state_json);
  assert.deepEqual(completedState.commits.A.selection, selection);
  assert.deepEqual(completedState.commits.B.selection, selection);
  assert.equal(completedState.events.filter(e => e.type === "battle.revealed").length, 1);
  assert.equal(completed.receipts, 3, "two player receipts plus one system reveal receipt");
  assert.equal(completed.outbox, 4, "genesis, two commits and one reveal event");
  console.log("PASS: two real lifecycle commits and trusted automatic reveal");

  // Simulate process exit after a durable commit, then reconnect with the
  // same bearer capability and replay the original command safely.
  const beforeRestart = worker;
  beforeRestart.kill("SIGTERM");
  await new Promise(resolve => beforeRestart.once("close", resolve));
  // Rotate the active key while retaining the old decrypt-only key so an
  // uncertain create response remains recoverable across process restarts.
  recoveryCurrent = "testV2";
  recoveryKeys = { ...recoveryKeys, testV2: Buffer.alloc(32, 8).toString("base64url") };
  worker = spawnApi();
  await start(base);
  const afterRestart = await get(base, battle, battle.capabilities.A.token);
  assert.deepEqual(afterRestart, { status: 401, error: "UNAUTHORIZED" });
  const replayAfterRestart = await commit(base, battle, "A", "command-alpha-A");
  assert.deepEqual(replayAfterRestart, { status: 401, error: "UNAUTHORIZED" });
  assert.equal((await get(base, battle, battle.capabilities.B.token)).revealed, true);
  const replayBAfterRestart = await commit(base, battle, "B", "command-alpha-B");
  assert.equal(replayBAfterRestart.status, 200, JSON.stringify(replayBAfterRestart));
  assert.equal(replayBAfterRestart.replayed, true);
  const createReplayAfterRestart = await create(base, "alpha", alphaKey);
  assert.equal(createReplayAfterRestart.battleId, battle.battleId);
  assert.deepEqual(createReplayAfterRestart.capabilities, battle.capabilities);
  assert.equal(createReplayAfterRestart.status, 200);
  assert.equal(query(`SELECT recovery_key_version FROM gameplay_battle_creations WHERE idempotency_key_sha256='${creationHash}'`)[0].recovery_key_version, "testV1");
  console.log("PASS: Worker restart, durable reconnect, original receipt and encrypted create replay");

  const race = await create(base, "race");
  const both = await Promise.all([
    commit(base, race, "A", "race-command-A"),
    commit(base, race, "B", "race-command-B"),
  ]);
  assert.equal(both.filter(x => x.status === 200).length, 2, JSON.stringify(both));
  const racePublic = await get(base, race, race.capabilities.A.token);
  assert.equal(racePublic.revealed, true);
  assert.ok(racePublic.version >= 3);
  console.log("PASS: both simultaneous participant commits survive CAS and reveal");

  const concurrentCreateKey = testCreateKey("parallel");
  const concurrentCreate = await Promise.all([
    createRequest(base, "parallel-create", concurrentCreateKey),
    createRequest(base, "parallel-create", concurrentCreateKey),
  ]);
  assert.deepEqual(concurrentCreate.map(x => x.status).sort(), [200, 201], JSON.stringify(concurrentCreate));
  assert.equal(concurrentCreate[0].battleId, concurrentCreate[1].battleId, JSON.stringify(concurrentCreate));
  assert.deepEqual(concurrentCreate[0].capabilities, concurrentCreate[1].capabilities);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battles WHERE battle_id='${concurrentCreate[0].battleId}'`)[0].count, 1);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_event_outbox WHERE battle_id='${concurrentCreate[0].battleId}'`)[0].count, 1);
  const parallelCreateHash = createHash("sha256").update("chat03b2:create-battle:v1:" + concurrentCreateKey).digest("hex");
  assert.equal(query(`SELECT recovery_key_version FROM gameplay_battle_creations WHERE idempotency_key_sha256='${parallelCreateHash}'`)[0].recovery_key_version, "testV2");
  console.log("PASS: concurrent identical creates persist one battle/genesis and recover the same capabilities");

  const sameSideRace = await create(base, "same-side-race");
  const competingA = await Promise.all([
    commit(base, sameSideRace, "A", "same-side-race-A-one"),
    commit(base, sameSideRace, "A", "same-side-race-A-two"),
  ]);
  assert.equal(competingA.filter(x => x.status === 200).length, 1, JSON.stringify(competingA));
  assert.equal(competingA.filter(x => x.status === 409).length, 1, JSON.stringify(competingA));
  const afterSameSideRace = query(`SELECT b.version,
    (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
    (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${sameSideRace.battleId}'`)[0];
  assert.equal(afterSameSideRace.version, 1);
  assert.equal(afterSameSideRace.receipts, 1);
  assert.equal(afterSameSideRace.outbox, 2);
  assert.equal((await commit(base, sameSideRace, "B", "same-side-race-B")).status, 200);
  assert.equal((await get(base, sameSideRace, sameSideRace.capabilities.A.token)).revealed, true);
  console.log("PASS: same-side concurrent first commits produce one transition; B still completes reveal");

  const sharedIds = await create(base, "shared");
  const sameLocalIds = await Promise.all([
    commit(base, sharedIds, "A", "client-command-001"),
    commit(base, sharedIds, "B", "client-command-001"),
  ]);
  assert.equal(sameLocalIds.filter(x => x.status === 200).length, 2,
    "independent client command IDs must not collide: " + JSON.stringify(sameLocalIds));
  assert.equal((await get(base, sharedIds, sharedIds.capabilities.A.token)).revealed, true);
  const sharedReplayA = await commit(base, sharedIds, "A", "client-command-001");
  const sharedReplayB = await commit(base, sharedIds, "B", "client-command-001");
  assert.equal(sharedReplayA.replayed, true, JSON.stringify(sharedReplayA));
  assert.equal(sharedReplayB.replayed, true, JSON.stringify(sharedReplayB));
  assert.equal((await request(base, "GET", "/v1/battles/" + sharedIds.battleId,
    battle.capabilities.A.token)).status, 401, "token from other battle worked");
  console.log("PASS: identical client command IDs from A/B are independently durable");
  console.log("PASS: battle-scoped bearer token cannot read another battle");

  const awaitingBefore = await get(base, { battleId: stuckId }, stuckToken);
  assert.equal(awaitingBefore.phase, "committed");
  assert.equal(awaitingBefore.version, 2);
  const cronUrl = base + "/cdn-cgi/local/scheduled?format=json";
  const firstCron = await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
  assert.equal(firstCron.status, 200, "local scheduled handler unavailable");
  const unstuck = await get(base, { battleId: stuckId }, stuckToken);
  assert.equal(unstuck.phase, "revealed", "101 healthy battles blocked reveal");
  assert.equal(unstuck.version, 3);
  console.log("PASS: pending 101 healthy battles cannot starve committed reveal");
  const expired = await get(base, { battleId: expiredId }, expiryToken);
  assert.equal(expired.status, 200, JSON.stringify(expired));
  assert.equal(expired.phase, "expired", JSON.stringify(expired));
  assert.equal(expired.version, 1);
  const secondCron = await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
  assert.equal(secondCron.status, 200);
  const after = await get(base, { battleId: expiredId }, expiryToken);
  assert.equal(after.phase, "expired");
  assert.equal(after.version, 1);
  const oneSideExpired = await get(base, { battleId: oneSideId }, oneSideToken);
  assert.equal(oneSideExpired.phase, "expired");
  assert.equal(oneSideExpired.expiredStage, "waiting");
  assert.deepEqual(oneSideExpired.missingParticipants, ["no-show-B"]);
  assert.equal(oneSideExpired.version, 2);
  const oneSideRows = query(`SELECT b.state_json,
    (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
    (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${oneSideId}'`)[0];
  assert.equal(JSON.parse(oneSideRows.state_json).events.filter(e => e.type === "battle.timed_out").length, 1);
  assert.equal(oneSideRows.receipts, 2);
  assert.equal(oneSideRows.outbox, 3);
  console.log("PASS: timeout/no-show is once-only with both sides absent and after one side commits");

  console.log("CHAT03B2_LOCAL_PRIVATE_API_PASS (NOT PRODUCTION_AUTH_PASS)");
} catch (error) {
  console.error("CHAT03B2_LOCAL_PRIVATE_API_FAIL", error);
  process.exitCode = 1;
} finally {
  if (worker && worker.exitCode === null) worker.kill("SIGTERM");
  try { rmSync(dir, { recursive: true, force: true }); }
  catch (error) { console.error("SCRATCH_CLEANUP_WARNING", error.message); }
}
