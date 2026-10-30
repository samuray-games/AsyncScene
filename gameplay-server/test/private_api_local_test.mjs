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
import { deriveSocialVoteId } from "../src/social-vote-contract.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = process.env.WRANGLER_BIN || path.resolve(root, "../node_modules/.bin/wrangler");
const cfg = "wrangler.api-local-test.jsonc";
const dir = mkdtempSync(path.join(os.tmpdir(), "chat03b2-private-api-"));
const env = { ...process.env, WRANGLER_SEND_METRICS: "false" };
const admin = "local-test-admin-" + "a".repeat(48);
const operatorReadToken = "local-test-readonly-operator-" + "b".repeat(40);
let worker, logs = "", workerStdout = "", workerStderr = "";
let lastSuccessfulHttpAt = null;
const d1SyncStats = { count: 0, totalMs: 0, lastMs: 0, maxMs: 0 };
const selection = { attackColor: "y", defenseColor: "y", attackType: "N", defenseType: "S", role: "citizen" };

function runD1Sync(args, options, kind) {
  const startedAt = Date.now();
  const result = spawnSync(cli, args, options);
  const durationMs = Date.now() - startedAt;
  d1SyncStats.count++;
  d1SyncStats.totalMs += durationMs;
  d1SyncStats.lastMs = durationMs;
  d1SyncStats.maxMs = Math.max(d1SyncStats.maxMs, durationMs);
  d1SyncStats.lastKind = kind;
  return result;
}
function safeLogTail(value) {
  return value.slice(-1000).replace(/[A-Za-z0-9._-]{32,}/g, "[REDACTED]");
}

function writeTestWorkerWrapper() {
  const workerModule = path.join(root, "src/worker.js");
  const wrapperPath = path.join(dir, "private-api-test-wrapper.mjs");
  const wrapperConfigPath = path.join(dir, "wrangler.private-api-test-wrapper.jsonc");
  writeFileSync(wrapperPath, `
import worker from ${JSON.stringify(workerModule)};
let targetBattleId = null;
let dropNextOperatorResponse = false, droppedOperatorResponse = null;
let forcedServerNowMs = null;
let delayNextSocialBallotReadMs = 0;
const nativeDateNow = Date.now.bind(Date);
Date.now = () => forcedServerNowMs === null ? nativeDateNow() : forcedServerNowMs;
function wrapStatement(statement, sql, params, db) {
  return new Proxy(statement, { get(target, property) {
    if (property === "bind") return (...values) => wrapStatement(target.bind(...values), sql, values, db);
    if (property === "first") return async (...values) => {
      if (delayNextSocialBallotReadMs > 0 && sql.includes("SELECT choice FROM gameplay_social_ballots")) {
        const delayMs = delayNextSocialBallotReadMs;
        delayNextSocialBallotReadMs = 0;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      const row = await target.first(...values);
      if (row && targetBattleId && params[0] === targetBattleId &&
          sql.includes("SELECT side,participant_id,token_sha256,generation") &&
          sql.includes("FROM gameplay_battle_capabilities")) {
        // Deterministically commit a generation change after the real auth
        // SELECT returns, before its captured generation reaches Worker code.
        await db.prepare("UPDATE gameplay_battle_capabilities SET status='revoked',generation=2 WHERE battle_id=? AND side='A'")
          .bind(targetBattleId).run();
        targetBattleId = null;
      }
      return row;
    };
    const value = Reflect.get(target, property, target);
    return typeof value === "function" ? value.bind(target) : value;
  }});
}
function wrapDatabase(db) {
  return new Proxy(db, { get(target, property) {
    if (property === "prepare") return sql => wrapStatement(target.prepare(sql), sql, [], target);
    const value = Reflect.get(target, property, target);
    return typeof value === "function" ? value.bind(target) : value;
  }});
}
function wrappedEnv(env, request = null) {
  const wrapped = { ...env, DB: wrapDatabase(env.DB) };
  // These headers exist only in this disposable test wrapper to prove that
  // status readback needs neither mutation authority nor an absent read key.
  if (request?.headers.has("x-test-omit-operator-read-token")) delete wrapped.OPERATOR_READ_TOKEN;
  if (request?.headers.has("x-test-omit-admin-control-token")) delete wrapped.ADMIN_CONTROL_TOKEN;
  if (request?.headers.has("x-test-match-admin-read-token")) {
    wrapped.OPERATOR_READ_TOKEN = wrapped.ADMIN_CONTROL_TOKEN;
  }
  if (request?.headers.has("x-test-match-admin-read-token-long")) {
    wrapped.ADMIN_CONTROL_TOKEN = "x".repeat(513);
    wrapped.OPERATOR_READ_TOKEN = wrapped.ADMIN_CONTROL_TOKEN;
  }
  return wrapped;
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/__test/generation-race/arm" && request.method === "POST") {
      const body = await request.json();
      targetBattleId = body.battleId;
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/__test/ballot-read-delay" && request.method === "POST") {
      const body = await request.json();
      if (!Number.isSafeInteger(body.delayMs) || body.delayMs < 1 || body.delayMs > 1000) {
        return Response.json({ error: "INVALID_TEST_DELAY" }, { status: 400 });
      }
      delayNextSocialBallotReadMs = body.delayMs;
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/__test/clock/set" && request.method === "POST") {
      const body = await request.json();
      if (body.nowMs === null) forcedServerNowMs = null;
      else if (Number.isSafeInteger(body.nowMs) && body.nowMs >= 0) forcedServerNowMs = body.nowMs;
      else return Response.json({ error: "INVALID_TEST_CLOCK" }, { status: 400 });
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/__test/admin-response/drop-next" && request.method === "POST") {
      dropNextOperatorResponse = true;
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/__test/admin-response/last-dropped" && request.method === "GET") {
      return Response.json(droppedOperatorResponse);
    }
    const response = await worker.fetch(request, wrappedEnv(env, request), ctx);
    if (dropNextOperatorResponse && url.pathname.includes("/capabilities/") && url.pathname.endsWith("/replace")) {
      dropNextOperatorResponse = false;
      droppedOperatorResponse = await response.clone().json();
      return new Response(null, { status: 502 });
    }
    return response;
  },
  async scheduled(event, env, ctx) {
    return worker.scheduled(event, wrappedEnv(env), ctx);
  },
};
`);
  writeFileSync(wrapperConfigPath, JSON.stringify({
    name: "asynchronia-chat03b2-private-api-test-wrapper",
    main: wrapperPath,
    compatibility_date: "2026-10-01",
    workers_dev: false,
    vars: { SOCIAL_VOTE_QUORUM: "7", SOCIAL_VOTE_DURATION_MS: "60000" },
    d1_databases: [{
      binding: "DB",
      database_name: "asynchronia-chat03b2-local-test",
      database_id: "00000000-0000-4000-8000-000000000442",
      migrations_dir: path.join(root, "migrations"),
    }],
  }, null, 2));
  return wrapperConfigPath;
}

async function pickPort() {
  const s = net.createServer();
  await new Promise(r => s.listen(0, "127.0.0.1", r));
  const port = s.address().port;
  await new Promise(r => s.close(r));
  return port;
}
function migrate(file) {
  const r = runD1Sync(["d1", "execute", "DB", "--local", "--config", cfg,
    "--file", file, "--persist-to", dir, "--yes"], {
    cwd: root, env, encoding: "utf8", timeout: 60000,
  }, "migration");
  if (r.error || r.status !== 0) throw Error("MIGRATION_FAILED " +
    file + " " + String(r.error || "") + " " + (r.stderr || "").slice(-2500));
}
function query(sql) {
  const r = runD1Sync(["d1", "execute", "DB", "--local", "--config", cfg,
    "--command", sql, "--json", "--persist-to", dir, "--yes"], {
    cwd: root, env, encoding: "utf8", timeout: 60000,
  }, "query");
  if (r.error || r.status !== 0) throw Error("QUERY_FAILED " + String(r.error || "") + " " + (r.stderr || "").slice(-2500));
  const parsed = JSON.parse(r.stdout);
  const rows = parsed?.[0]?.results ?? parsed?.results;
  assert.ok(Array.isArray(rows), "unexpected Wrangler D1 JSON output: " + r.stdout.slice(0, 1000));
  return rows;
}
function executeSql(sql) {
  const r = runD1Sync(["d1", "execute", "DB", "--local", "--config", cfg,
    "--command", sql, "--json", "--persist-to", dir, "--yes"], {
    cwd: root, env, encoding: "utf8", timeout: 60000,
  }, "execute");
  if (r.error || r.status !== 0) throw Error("EXECUTE_FAILED " + String(r.error || "") + " " + (r.stderr || "").slice(-2500));
}
function executeSqlAsync(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(cli, ["d1", "execute", "DB", "--local", "--config", cfg,
      "--command", sql, "--json", "--persist-to", dir, "--yes"], {
      cwd: root, env, stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    child.stdout.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", code => code === 0 ? resolve(stdout)
      : reject(Error("ASYNC_SQL_FAILED " + code + " " + stderr.slice(-2500))));
  });
}
function executeSqlExpectFailure(sql, marker) {
  const r = runD1Sync(["d1", "execute", "DB", "--local", "--config", cfg,
    "--command", sql, "--json", "--persist-to", dir, "--yes"], {
    cwd: root, env, encoding: "utf8", timeout: 60000,
  }, "expect-failure");
  assert.ok(r.error || r.status !== 0, "expected local D1 statement to be rejected");
  assert.match((r.stderr || "") + (r.stdout || ""), new RegExp(marker));
}
const registeredTestPeople = new Map();
async function registerTestPerson(base, stableKey) {
  if (registeredTestPeople.has(stableKey)) return registeredTestPeople.get(stableKey);
  const idempotencyKey = createHash("sha256").update("chat05a-test-person:" + stableKey).digest("hex");
  const registered = await request(base, "POST", "/v1/admin/persons", admin, {}, null,
    { "idempotency-key": idempotencyKey });
  assert.ok([200, 201].includes(registered.status), JSON.stringify(registered));
  assert.match(registered.personId, /^[0-9a-f-]{36}$/i);
  registeredTestPeople.set(stableKey, registered.personId);
  return registered.personId;
}
async function registeredIds(base, participants) {
  return {
    A: await registerTestPerson(base, participants.A.id),
    B: await registerTestPerson(base, participants.B.id),
  };
}

async function request(base, method, route, token, body, origin, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (token) headers.authorization = "Bearer " + token;
  if (body) headers["content-type"] = "application/json";
  if (origin) headers.origin = origin;
  // Avoid reusing a keep-alive socket after test-side synchronous Wrangler
  // D1 commands block this Node event loop. Requests are never retried.
  headers.connection = "close";
  const now = Date.now();
  const idleSincePreviousResponseMs = lastSuccessfulHttpAt === null ? null : now - lastSuccessfulHttpAt;
  let r;
  try {
    r = await fetch(base + route, { method, headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(9000),
    });
  } catch (error) {
    console.error("LOCAL_HTTP_TRANSPORT_DIAGNOSTIC", JSON.stringify({
      method, route, causeCode: error?.cause?.code || error?.code || error?.name,
      idleSincePreviousResponseMs,
      d1SyncStats,
      worker: { pid: worker?.pid ?? null, exitCode: worker?.exitCode ?? null,
        signalCode: worker?.signalCode ?? null, killed: worker?.killed ?? null },
    }));
    console.error("LOCAL_WORKER_STDOUT_TAIL", safeLogTail(workerStdout));
    console.error("LOCAL_WORKER_STDERR_TAIL", safeLogTail(workerStderr));
    throw error;
  }
  const json = await r.json();
  lastSuccessfulHttpAt = Date.now();
  return { status: r.status, ...json };
}
async function setTestClock(base, nowMs) {
  await testControl(base, "/__test/clock/set", { nowMs });
}
async function openSocialVote(base, name) {
  const battle = await create(base, name);
  const pair = findSelectionPair("DRAW");
  const a = await commit(base, battle, "A", name + "-A", { selection: pair.A });
  const b = await commit(base, battle, "B", name + "-B", { selection: pair.B });
  assert.equal(a.status, 200, JSON.stringify(a));
  assert.equal(b.status, 200, JSON.stringify(b));
  const voteId = await deriveSocialVoteId(battle.battleId);
  const session = query(`SELECT opened_at_ms,deadline_at_ms,duration_ms,quorum,status
    FROM gameplay_social_vote_deadlines WHERE vote_id='${voteId}'`)[0];
  assert.ok(session, "social vote opening must persist its deadline policy");
  assert.equal(session.status, "open");
  return { battle, voteId, session };
}
async function issueSocialVoteCapabilities(base, battle, people) {
  const capabilities = [];
  for (const person of people) {
    const result = await request(base, "POST",
      `/v1/admin/battles/${battle.battleId}/spectators/${person}/capability`, admin,
      { expectedGeneration: 0 });
    assert.equal(result.status, 201, JSON.stringify(result));
    capabilities.push(result);
  }
  return capabilities;
}

async function testControl(base, route, body = null) {
  const response = await fetch(base + route, {
    method: body ? "POST" : "GET",
    headers: { connection: "close", ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok && response.status !== 204) throw Error("TEST_CONTROL_FAILED " + route + " " + response.status);
  return response.status === 204 ? null : response.json();
}
async function start(base) {
  for (let i = 0; i < 120; i++) {
    if (worker.exitCode !== null) throw Error("WRANGLER_EXIT " + logs.slice(-3500));
    try {
      const r = await fetch(base + "/not-found", {
        headers: { connection: "close" }, signal: AbortSignal.timeout(300),
      });
      if (r.status) return;
    } catch { /* workerd warming up */ }
    await new Promise(r => setTimeout(r, 200));
  }
  throw Error("WRANGLER_TIMEOUT " + logs.slice(-3500));
}
async function createRequest(base, name, idempotencyKey) {
  const participants = {
    A: { id: name + "-A", role: "citizen" },
    B: { id: name + "-B", role: "citizen" },
  };
  return request(base, "POST", "/v1/admin/battles", admin, {
    participants, personIds: await registeredIds(base, participants),
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
async function operatorRequest(base, battle, side, operation, expectedGeneration, token = admin, origin = null) {
  return request(base, "POST", `/v1/admin/battles/${battle.battleId}/capabilities/${side}/${operation}`,
    token, { expectedGeneration }, origin);
}
async function capabilityStatus(base, battleId, side, token = operatorReadToken, options = {}) {
  const headers = { connection: "close", ...(options.extraHeaders || {}) };
  if (token) headers.authorization = "Bearer " + token;
  if (options.origin) headers.origin = options.origin;
  const response = await fetch(base + `/v1/admin/battles/${battleId}/capabilities/${side}/status`, {
    method: options.method || "GET", headers, signal: AbortSignal.timeout(9000),
  });
  return { httpStatus: response.status, ...await response.json() };
}
async function get(base, battle, token) {
  return request(base, "GET", "/v1/battles/" + battle.battleId, token);
}
async function commit(base, battle, side, commandId, extra = {}) {
  return request(base, "POST", "/v1/battles/" + battle.battleId + "/commit",
    battle.capabilities[side].token, { commandId, selection, ...extra });
}

function findSelectionPair(targetOutcome) {
  const choices = [];
  for (const attackColor of ["y", "o", "r"]) {
    for (const defenseColor of ["y", "o", "r"]) {
      for (const attackType of ["N", "P", "T"]) {
        for (const defenseType of ["S", "C", "G"]) {
          choices.push({ attackColor, defenseColor, attackType, defenseType, role: "citizen" });
        }
      }
    }
  }
  for (const a of choices) for (const b of choices) {
    const result = globalThis.Game.TacticalCombatV1.resolve(a, b, "tactical_v1");
    if (result?.ok && result.mechanicalOutcome === targetOutcome) return { A: a, B: b };
  }
  throw Error("NO_SELECTION_PAIR_FOR_OUTCOME " + targetOutcome);
}

try {
  migrate("migrations/0001_tactical_state.sql");
  migrate("migrations/0002_battle_capabilities.sql");
  migrate("migrations/0003_idempotent_battle_creation.sql");
  migrate("migrations/0004_capability_generation.sql");
  migrate("migrations/0005_participant_transition_fence.sql");
  migrate("migrations/0006_creation_recovery_lifecycle.sql");
  migrate("migrations/0007_capability_operator_lifecycle.sql");
  migrate("migrations/0008_chat05a_people_and_votes.sql");
  migrate("migrations/0009_chat05a_authored_text_commits.sql");
  migrate("migrations/0010_chat05a_authored_vote_triggers.sql");
  {
    const pureLifecycle = globalThis.TacticalCombatLifecycleV1.createLifecycle(globalThis.Game.TacticalCombatV1);
    const pair = findSelectionPair("A_WIN");
    const aId = "lifecycle-a", bId = "lifecycle-b";
    const created = pureLifecycle.createBattle({ battleId: "chat05a-lifecycle-authored",
      createdAt: 0, deadlineAt: Number.MAX_SAFE_INTEGER,
      participants: { A: { id: aId, role: "citizen" }, B: { id: bId, role: "citizen" } } });
    let state = created.state;
    for (const [side, participantId, move, version] of [
      ["A", aId, pair.A, 0], ["B", bId, pair.B, 1],
    ]) {
      const committed = pureLifecycle.execute(state, { commandId: "commit-" + side, expectedVersion: version,
        type: "commit", actorId: participantId, participantId, selection: move }, version + 1);
      assert.equal(committed.ok, true);
      state = committed.state;
    }
    const revealed = pureLifecycle.execute(state, { commandId: "reveal", expectedVersion: 2, type: "reveal",
      actorId: "system", socialVoteTrigger: "AUTHORED_TEXT" }, 3);
    assert.equal(revealed.ok, true);
    assert.equal(revealed.state.socialOutcome, "PENDING");
    const bypass = pureLifecycle.execute(revealed.state, { commandId: "legacy-finalize", expectedVersion: 3,
      type: "finalize", actorId: "system", recognizedOutcome: "A_WIN" }, 4);
    assert.equal(bypass.ok, false);
    assert.equal(bypass.error, "FINALIZATION_GATE_REQUIRED");
    const forgedFinal = structuredClone(revealed.state);
    forgedFinal.version += 1;
    forgedFinal.phase = "final";
    forgedFinal.socialOutcome = "NONE";
    forgedFinal.recognizedOutcome = "A_WIN";
    forgedFinal.events.push({ eventId: forgedFinal.battleId + ":final", type: "battle.finalized" });
    assert.equal(pureLifecycle.restore(JSON.stringify(forgedFinal)).ok, false,
      "serialized final state cannot erase a pending authored-text vote trigger");
  }
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
  // Keep this deliberately healthy backlog non-due throughout the complete
  // local API suite; its only purpose is reveal-priority, not expiry batching.
  const pendingUntil = backloggedAt + 600_000;
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
  const staleId = "44444444-4444-4444-8444-444444444444";
  const staleToken = "stale-generation-token-" + "s".repeat(24);
  const staleGenesis = lc.createBattle({
    battleId: staleId, createdAt: 0, deadlineAt: 1000,
    participants: { A: { id: "stale-A", role: "citizen" },
                    B: { id: "stale-B", role: "citizen" } },
  });
  assert.equal(staleGenesis.ok, true);
  const staleCommit = lc.execute(staleGenesis.state, {
    type: "commit", commandId: "stale-generation-command", expectedVersion: 0,
    actorId: "stale-A", participantId: "stale-A", selection,
  }, 500);
  assert.equal(staleCommit.ok, true);
  const staleEvents = staleCommit.state.events.filter(e => staleCommit.eventIds.includes(e.eventId));
  const staleDigest = createHash("sha256").update(staleToken).digest("hex");
  fixtureSql += genesisSql(staleGenesis.state);
  fixtureSql += `INSERT INTO gameplay_battle_capabilities
    (battle_id,side,participant_id,token_sha256,created_at_ms)
    VALUES (${sqlq(staleId)},'A','stale-A',${sqlq(staleDigest)},0);
    UPDATE gameplay_battle_capabilities SET status='revoked',generation=2
    WHERE battle_id=${sqlq(staleId)} AND side='A';`;
  const fixturePath = path.join(dir, "expired-fixture.sql");
  writeFileSync(fixturePath, fixtureSql);
  migrate(fixturePath);
  // Populate a legacy 0010 human ballot in real local D1 before applying 0011.
  // The fixture temporarily removes only the two insertion predicates so the
  // legacy row can be seeded against an existing battle; original triggers are
  // read back from sqlite_master and restored verbatim before the migration.
  const legacyVote = "chat05b-d1-migration-preservation";
  const legacyPerson = "chat05b-d1-legacy-spectator";
  const legacyVoteGate = query("SELECT sql FROM sqlite_master WHERE type='trigger' AND name='trg_gameplay_social_vote_gate'")[0].sql;
  const legacyBallotGate = query("SELECT sql FROM sqlite_master WHERE type='trigger' AND name='trg_gameplay_social_ballot_authorization_guard'")[0].sql;
  executeSql(`DROP TRIGGER trg_gameplay_social_vote_gate; DROP TRIGGER trg_gameplay_social_ballot_authorization_guard;
    INSERT INTO gameplay_persons(person_id,created_at_ms) VALUES ('${legacyPerson}',500);
    INSERT INTO gameplay_social_votes(vote_id,battle_id,trigger_reason,status,created_at_ms)
      VALUES ('${legacyVote}','${oneSideId}','DRAW','open',500);
    INSERT INTO gameplay_social_ballots(vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms)
      VALUES ('${legacyVote}','${legacyPerson}','B','${"a".repeat(64)}',1,501);`);
  executeSql(legacyVoteGate);
  executeSql(legacyBallotGate);
  const legacyBallotBeforeMigration = query(`SELECT vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms
    FROM gameplay_social_ballots WHERE vote_id='${legacyVote}'`);
  migrate("migrations/0011_chat05b_vote_deadlines_and_fill.sql");
  assert.deepEqual(query(`SELECT vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms
    FROM gameplay_social_ballots WHERE vote_id='${legacyVote}'`), legacyBallotBeforeMigration,
    "real D1 migration must preserve the exact legacy human ballot row");
  assert.deepEqual(query(`SELECT vote_id,opened_at_ms,status FROM gameplay_social_vote_deadlines WHERE vote_id='${legacyVote}'`),
    [{ vote_id: legacyVote, opened_at_ms: 500, status: "unconfigured" }]);
  console.log("PASS: D1 migrations 0001 through 0011 and local fixtures");
  const testWrapperConfig = writeTestWorkerWrapper();
  executeSqlExpectFailure(`INSERT INTO gameplay_apply_participant_transition (
      battle_id,expected_version,command_id,fingerprint,receipt_code,
      receipt_event_ids_json,next_state_json,events_json,trusted_now_ms,
      capability_side,capability_token_sha256,expected_generation)
    VALUES (${sqlq(staleId)},0,'A:stale-generation','fixture','COMMITTED',
      ${sqlq(JSON.stringify(staleCommit.eventIds))},${sqlq(JSON.stringify(staleCommit.state))},
      ${sqlq(JSON.stringify(staleEvents))},500,'A',${sqlq(staleDigest)},1);`, "INVALID_CAPABILITY");
  const staleRows = query(`SELECT b.version,
      (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${staleId}'`)[0];
  assert.deepEqual(staleRows, { version: 0, receipts: 0, outbox: 1 });
  console.log("PASS: local D1 rejects stale expected generation with no state/receipt/outbox writes");
  const port = await pickPort();
  const base = "http://127.0.0.1:" + port;
  let recoveryCurrent = "testV1";
  let recoveryKeys = { testV1: Buffer.alloc(32, 7).toString("base64url") };
  function spawnApi() {
    const args = [
      "dev", "--test-scheduled", "--config", testWrapperConfig,
      "--ip", "127.0.0.1", "--port", String(port),
      "--persist-to", dir,
      "--var", "ADMIN_CONTROL_TOKEN:" + admin,
      "--var", "OPERATOR_READ_TOKEN:" + operatorReadToken,
      // Crypto failure coverage restarts the local Worker several times.
      // Keep unrelated battle fixtures live throughout slower CI runners.
      "--var", "COMMIT_WINDOW_MS:600000",
      "--var", "ALLOWED_ORIGIN:https://game.example.test",
      "--var", "CREATE_RECOVERY_KEY_CURRENT:" + recoveryCurrent,
      "--var", "CREATE_RECOVERY_KEYS:" + JSON.stringify(recoveryKeys),
    ];
    const child = spawn(cli, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.setEncoding("utf8").on("data", value => {
      workerStdout = (workerStdout + value).slice(-5000);
      logs = (logs + value).slice(-30000);
    });
    child.stderr.setEncoding("utf8").on("data", value => {
      workerStderr = (workerStderr + value).slice(-5000);
      logs = (logs + value).slice(-30000);
    });
    return child;
  }
  async function restartApi() {
    const previous = worker;
    if (previous && previous.exitCode === null) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(Error("LOCAL_WORKER_RESTART_TIMEOUT")), 10000);
        previous.once("exit", () => { clearTimeout(timeout); resolve(); });
        previous.kill("SIGTERM");
      });
    }
    worker = spawnApi();
    await start(base);
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
  const creationHash = createHash("sha256").update("chat03b2:create-battle:v1:" + alphaKey).digest("hex");
  const freshRecovery = query(`SELECT lifecycle_state,original_a_token_sha256,original_a_generation,
      original_b_token_sha256,original_b_generation FROM gameplay_battle_creations
      WHERE idempotency_key_sha256='${creationHash}'`)[0];
  assert.equal(freshRecovery.lifecycle_state, "RECOVERABLE");
  assert.equal(freshRecovery.original_a_token_sha256,
    createHash("sha256").update(battle.capabilities.A.token).digest("hex"));
  assert.equal(freshRecovery.original_b_token_sha256,
    createHash("sha256").update(battle.capabilities.B.token).digest("hex"));
  assert.deepEqual([freshRecovery.original_a_generation, freshRecovery.original_b_generation], [1, 1]);

  const statusProbeBattle = await create(base, "operator-status-probe");
  const statusPath = side => `/v1/admin/battles/${statusProbeBattle.battleId}/capabilities/${side}/status`;
  const rawStatus = async (side, headers = {}, method = "GET") => {
    const response = await fetch(base + statusPath(side), {
      method, headers: { connection: "close", ...headers },
      signal: AbortSignal.timeout(9000),
    });
    return { response, payload: await response.json() };
  };
  const statusBefore = query(`SELECT b.version,b.state_json,
      (SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id=b.battle_id) outbox,
      (SELECT group_concat(side || ':' || status || ':' || generation || ':' || token_sha256, '|')
         FROM gameplay_battle_capabilities WHERE battle_id=b.battle_id) capabilities,
      (SELECT COUNT(*) FROM gameplay_capability_digest_history h
         JOIN gameplay_battle_capabilities c ON c.token_sha256=h.token_sha256 WHERE c.battle_id=b.battle_id) digest_history,
      (SELECT lifecycle_state FROM gameplay_battle_creations WHERE battle_id=b.battle_id) recovery_state,
      (SELECT capabilities_ciphertext_base64url FROM gameplay_battle_creations WHERE battle_id=b.battle_id) ciphertext
    FROM gameplay_battles b WHERE b.battle_id='${statusProbeBattle.battleId}'`)[0];
  assert.deepEqual((await capabilityStatus(base, statusProbeBattle.battleId, "A", null)),
    { httpStatus: 401, error: "UNAUTHORIZED" }, "missing read-only key must fail closed");
  assert.deepEqual((await capabilityStatus(base, statusProbeBattle.battleId, "A", "bad-read-key")),
    { httpStatus: 401, error: "UNAUTHORIZED" }, "incorrect read-only key must fail closed");
  assert.deepEqual((await capabilityStatus(base, statusProbeBattle.battleId, "A", admin)),
    { httpStatus: 401, error: "UNAUTHORIZED" }, "mutation credential must not authorize readback");
  assert.deepEqual(await capabilityStatus(base, statusProbeBattle.battleId, "A", admin, {
    extraHeaders: { "x-test-match-admin-read-token": "1" },
  }), { httpStatus: 401, error: "UNAUTHORIZED" },
  "a read key misconfigured equal to the admin credential must fail closed");
  assert.deepEqual(await request(base, "POST",
    `/v1/admin/battles/${statusProbeBattle.battleId}/capabilities/A/revoke`, admin,
    { expectedGeneration: 1 }, null, { "x-test-match-admin-read-token": "1" }),
  { status: 500, error: "SERVER_ERROR" },
  "shared read/admin configuration must disable mutation routes too");
  assert.deepEqual(await request(base, "GET", `/v1/battles/${statusProbeBattle.battleId}`,
    statusProbeBattle.capabilities.A.token, null, null, { "x-test-match-admin-read-token-long": "1" }),
  { status: 500, error: "SERVER_ERROR" },
  "shared read/admin credentials longer than the bearer comparison limit must invalidate participant routes too");
  assert.deepEqual(await request(base, "GET", statusPath("A"), operatorReadToken, null, null,
    { "x-test-omit-operator-read-token": "1" }),
  { status: 401, error: "UNAUTHORIZED" }, "missing Worker read-key configuration must fail closed");
  const { response: independentAuthResponse, payload: activeAStatus } = await rawStatus("A", {
    authorization: "Bearer " + operatorReadToken,
    "x-test-omit-admin-control-token": "1",
  });
  assert.equal(independentAuthResponse.status, 200,
    "readback must use the independent least-privileged key, without admin mutation authority");
  assert.deepEqual(activeAStatus, { generation: 1, status: "active" });
  assert.equal(independentAuthResponse.headers.get("cache-control"), "no-store");
  assert.equal(independentAuthResponse.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(await capabilityStatus(base, statusProbeBattle.battleId, "B"),
    { httpStatus: 200, generation: 1, status: "active" });
  assert.deepEqual(await capabilityStatus(base, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "A"),
    { httpStatus: 404, error: "NOT_FOUND" });
  assert.deepEqual(await capabilityStatus(base, "not-a-battle-id", "A"),
    { httpStatus: 404, error: "NOT_FOUND" });
  assert.deepEqual(await capabilityStatus(base, statusProbeBattle.battleId, "C"),
    { httpStatus: 404, error: "NOT_FOUND" });
  const { response: originStatusResponse, payload: originStatusPayload } = await rawStatus("A", {
    authorization: "Bearer " + operatorReadToken, origin: "https://game.example.test",
  });
  assert.equal(originStatusResponse.status, 403);
  assert.deepEqual(originStatusPayload, { error: "ORIGIN_FORBIDDEN" });
  assert.equal(originStatusResponse.headers.get("access-control-allow-origin"), null);
  const { response: preflightResponse } = await rawStatus("A", {
    origin: "https://game.example.test", "access-control-request-method": "GET",
  }, "OPTIONS");
  assert.equal(preflightResponse.status, 403);
  assert.equal(preflightResponse.headers.get("access-control-allow-origin"), null);
  const { response: postStatusResponse } = await rawStatus("A", {
    authorization: "Bearer " + operatorReadToken,
  }, "POST");
  assert.equal(postStatusResponse.status, 405);
  assert.deepEqual(await request(base, "POST", statusPath("A"), operatorReadToken, { status: "revoked" }),
    { status: 405, error: "METHOD_NOT_ALLOWED" });
  const activeStatusJson = JSON.stringify(activeAStatus);
  for (const sensitive of [statusProbeBattle.capabilities.A.token, statusProbeBattle.capabilities.B.token,
    createHash("sha256").update(statusProbeBattle.capabilities.A.token).digest("hex"),
    createHash("sha256").update(statusProbeBattle.capabilities.B.token).digest("hex"),
    "operator-status-probe-A", "operator-status-probe-B", "ciphertext"]) {
    assert.equal(activeStatusJson.includes(sensitive), false, "status readback leaked " + sensitive);
  }
  assert.deepEqual(query(`SELECT b.version,b.state_json,
      (SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id=b.battle_id) outbox,
      (SELECT group_concat(side || ':' || status || ':' || generation || ':' || token_sha256, '|')
         FROM gameplay_battle_capabilities WHERE battle_id=b.battle_id) capabilities,
      (SELECT COUNT(*) FROM gameplay_capability_digest_history h
         JOIN gameplay_battle_capabilities c ON c.token_sha256=h.token_sha256 WHERE c.battle_id=b.battle_id) digest_history,
      (SELECT lifecycle_state FROM gameplay_battle_creations WHERE battle_id=b.battle_id) recovery_state,
      (SELECT capabilities_ciphertext_base64url FROM gameplay_battle_creations WHERE battle_id=b.battle_id) ciphertext
    FROM gameplay_battles b WHERE b.battle_id='${statusProbeBattle.battleId}'`)[0], statusBefore,
  "status endpoint must be read-only across battle, receipts, outbox, credentials, and recovery ciphertext");
  assert.equal(activeAStatus.status, "active");
  console.log("PASS: separate read-only operator auth, fail-closed invalid/missing access, origin/preflight/method guards, exact response shape, no secret leakage, and no D1 writes");

  const operatorRevokedBattle = await create(base, "operator-revoke");
  const operatorReceipt = await commit(base, operatorRevokedBattle, "A", "operator-revoke-receipt");
  assert.equal(operatorReceipt.status, 200);
  const operatorBefore = query(`SELECT b.version,b.state_json,
      (SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${operatorRevokedBattle.battleId}'`)[0];
  assert.deepEqual(await operatorRequest(base, operatorRevokedBattle, "A", "revoke", 1, null),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await operatorRequest(base, operatorRevokedBattle, "A", "revoke", 1, "bad-admin"),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await operatorRequest(base, operatorRevokedBattle, "A", "revoke", null),
    { status: 400, error: "INVALID_EXPECTED_GENERATION" });
  assert.deepEqual(await operatorRequest(base, operatorRevokedBattle, "A", "revoke", 1, admin,
    "https://game.example.test"), { status: 403, error: "ORIGIN_FORBIDDEN" });
  const operatorOptions = await fetch(base + `/v1/admin/battles/${operatorRevokedBattle.battleId}/capabilities/A/revoke`, {
    method: "OPTIONS", headers: { origin: "https://game.example.test", connection: "close" },
  });
  assert.equal(operatorOptions.status, 403);
  assert.equal(operatorOptions.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(await request(base, "POST",
    `/v1/admin/battles/${operatorRevokedBattle.battleId}/capabilities/A/revoke`, admin,
    { expectedGeneration: 1, action: "expire" }),
    { status: 400, error: "INVALID_EXPECTED_GENERATION" });
  assert.deepEqual(await request(base, "POST",
    `/v1/admin/battles/${operatorRevokedBattle.battleId}/capabilities/A/expire`, admin,
    { expectedGeneration: 1 }), { status: 404, error: "NOT_FOUND" });
  const revokedByOperator = await operatorRequest(base, operatorRevokedBattle, "A", "revoke", 1);
  assert.deepEqual(revokedByOperator, { status: 200, generation: 2 });
  assert.deepEqual(await capabilityStatus(base, operatorRevokedBattle.battleId, "A"),
    { httpStatus: 200, generation: 2, status: "revoked" });
  assert.deepEqual(await capabilityStatus(base, operatorRevokedBattle.battleId, "B"),
    { httpStatus: 200, generation: 1, status: "active" });
  const revokedOperatorRow = query(`SELECT status,generation,token_sha256 FROM gameplay_battle_capabilities
    WHERE battle_id='${operatorRevokedBattle.battleId}' AND side='A'`)[0];
  assert.deepEqual(revokedOperatorRow, { status: "revoked", generation: 2,
    token_sha256: createHash("sha256").update(operatorRevokedBattle.capabilities.A.token).digest("hex") });
  assert.deepEqual(await operatorRequest(base, operatorRevokedBattle, "A", "revoke", 1),
    { status: 409, error: "STALE_GENERATION" });
  assert.deepEqual(await get(base, operatorRevokedBattle, operatorRevokedBattle.capabilities.A.token),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await commit(base, operatorRevokedBattle, "A", "operator-revoke-receipt"),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await commit(base, operatorRevokedBattle, "A", "operator-revoke-fresh"),
    { status: 401, error: "UNAUTHORIZED" });
  assert.equal((await get(base, operatorRevokedBattle, operatorRevokedBattle.capabilities.B.token)).version, 1);
  const operatorRecovery = query(`SELECT lifecycle_state,capabilities_ciphertext_base64url
    FROM gameplay_battle_creations WHERE battle_id='${operatorRevokedBattle.battleId}'`)[0];
  assert.deepEqual(operatorRecovery, { lifecycle_state: "CLOSED", capabilities_ciphertext_base64url: null });
  const operatorAfter = query(`SELECT b.version,b.state_json,
      (SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${operatorRevokedBattle.battleId}'`)[0];
  assert.deepEqual(operatorAfter, operatorBefore);
  console.log("PASS: admin-only revoke advances generation, closes recovery, preserves battle/receipt/outbox, and fences old read/replay/commit while B remains valid");

  const operatorReplaceBattle = await create(base, "operator-replace");
  assert.equal((await commit(base, operatorReplaceBattle, "A", "operator-replace-receipt")).status, 200);
  const replaced = await operatorRequest(base, operatorReplaceBattle, "A", "replace", 1);
  assert.equal(replaced.status, 200, JSON.stringify(replaced));
  assert.equal(replaced.generation, 2);
  assert.match(replaced.token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(replaced.token, operatorReplaceBattle.capabilities.A.token);
  const operatorReplacementDigest = createHash("sha256").update(replaced.token).digest("hex");
  assert.deepEqual(query(`SELECT status,generation,token_sha256 FROM gameplay_battle_capabilities
    WHERE battle_id='${operatorReplaceBattle.battleId}' AND side='A'`)[0],
    { status: "active", generation: 2, token_sha256: operatorReplacementDigest });
  assert.equal(query(`SELECT token_sha256 FROM gameplay_capability_digest_history WHERE token_sha256='${operatorReplacementDigest}'`).length, 1);
  assert.deepEqual(await get(base, operatorReplaceBattle, operatorReplaceBattle.capabilities.A.token),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await commit(base, operatorReplaceBattle, "A", "operator-replace-receipt"),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await commit(base, operatorReplaceBattle, "A", "operator-replace-fresh"),
    { status: 401, error: "UNAUTHORIZED" });
  assert.equal((await get(base, operatorReplaceBattle, replaced.token)).version, 1);
  assert.equal((await get(base, operatorReplaceBattle, operatorReplaceBattle.capabilities.B.token)).version, 1);
  assert.deepEqual(await operatorRequest(base, operatorReplaceBattle, "A", "replace", 1),
    { status: 409, error: "STALE_GENERATION" });
  console.log("PASS: replacement issues a fresh one-time bearer, old A token is fenced, B is unaffected, and stale retry cannot disclose/overwrite");

  const duplicateReplaceBattle = await create(base, "operator-duplicate-replace");
  const duplicateReplace = await Promise.all([
    operatorRequest(base, duplicateReplaceBattle, "A", "replace", 1),
    operatorRequest(base, duplicateReplaceBattle, "A", "replace", 1),
  ]);
  assert.equal(duplicateReplace.filter(x => x.status === 200).length, 1, JSON.stringify(duplicateReplace));
  assert.equal(duplicateReplace.filter(x => x.status === 409).length, 1, JSON.stringify(duplicateReplace));
  assert.equal(query(`SELECT generation FROM gameplay_battle_capabilities WHERE battle_id='${duplicateReplaceBattle.battleId}' AND side='A'`)[0].generation, 2);
  console.log("PASS: concurrent duplicate replacements have one winner and cannot silently overwrite");

  const concurrentReadBattle = await create(base, "operator-concurrent-read-replace");
  const [concurrentRead, concurrentReadReplace] = await Promise.all([
    capabilityStatus(base, concurrentReadBattle.battleId, "A"),
    operatorRequest(base, concurrentReadBattle, "A", "replace", 1),
  ]);
  assert.equal(concurrentRead.httpStatus, 200);
  assert.ok([1, 2].includes(concurrentRead.generation), JSON.stringify(concurrentRead));
  assert.equal(concurrentRead.status, "active");
  assert.equal(concurrentReadReplace.status, 200, JSON.stringify(concurrentReadReplace));
  assert.deepEqual(await capabilityStatus(base, concurrentReadBattle.battleId, "A"),
    { httpStatus: 200, generation: 2, status: "active" });
  assert.deepEqual(await capabilityStatus(base, concurrentReadBattle.battleId, "B"),
    { httpStatus: 200, generation: 1, status: "active" });
  console.log("PASS: concurrent status read and replacement observe a valid generation boundary without changing the other side");

  const revokeReplaceRaceBattle = await create(base, "operator-revoke-replace-race");
  const revokeReplaceRace = await Promise.all([
    operatorRequest(base, revokeReplaceRaceBattle, "A", "revoke", 1),
    operatorRequest(base, revokeReplaceRaceBattle, "A", "replace", 1),
  ]);
  assert.equal(revokeReplaceRace.filter(x => x.status === 200).length, 1, JSON.stringify(revokeReplaceRace));
  assert.equal(revokeReplaceRace.filter(x => x.status === 409).length, 1, JSON.stringify(revokeReplaceRace));
  assert.equal(query(`SELECT generation FROM gameplay_battle_capabilities WHERE battle_id='${revokeReplaceRaceBattle.battleId}' AND side='A'`)[0].generation, 2);
  console.log("PASS: concurrent revoke/replace requests at one expected generation have exactly one winner");

  const lostResponseBattle = await create(base, "operator-lost-response");
  await testControl(base, "/__test/admin-response/drop-next", {});
  const lostResponse = await fetch(base + `/v1/admin/battles/${lostResponseBattle.battleId}/capabilities/A/replace`, {
    method: "POST", headers: { authorization: "Bearer " + admin, "content-type": "application/json", connection: "close" },
    body: JSON.stringify({ expectedGeneration: 1 }), signal: AbortSignal.timeout(9000),
  });
  assert.equal(lostResponse.status, 502, "test wrapper must drop the successful response after D1 commit");
  const lostOnlyInTestHarness = await testControl(base, "/__test/admin-response/last-dropped");
  assert.equal(lostOnlyInTestHarness.generation, 2);
  const lostTokenDigest = createHash("sha256").update(lostOnlyInTestHarness.token).digest("hex");
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battle_capabilities WHERE token_sha256='${lostTokenDigest}'`)[0].count, 1);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battle_capabilities WHERE token_sha256='${lostOnlyInTestHarness.token}'`)[0].count, 0);
  const beforeReadback = query(`SELECT status,generation,token_sha256 FROM gameplay_battle_capabilities
    WHERE battle_id='${lostResponseBattle.battleId}' AND side='A'`)[0];
  const ambiguousReadback = await capabilityStatus(base, lostResponseBattle.battleId, "A");
  assert.deepEqual(ambiguousReadback, { httpStatus: 200, generation: 2, status: "active" });
  assert.equal(JSON.stringify(ambiguousReadback).includes(lostOnlyInTestHarness.token), false);
  assert.equal(JSON.stringify(ambiguousReadback).includes(lostTokenDigest), false);
  assert.deepEqual(query(`SELECT status,generation,token_sha256 FROM gameplay_battle_capabilities
    WHERE battle_id='${lostResponseBattle.battleId}' AND side='A'`)[0], beforeReadback,
  "readback must not automatically replace or mutate the credential");
  const inspectedGeneration = ambiguousReadback.generation;
  assert.equal(inspectedGeneration, 2);
  const recoveredByIntentionalRotation = await operatorRequest(base, lostResponseBattle, "A", "replace", inspectedGeneration);
  assert.equal(recoveredByIntentionalRotation.status, 200);
  assert.equal(recoveredByIntentionalRotation.generation, 3);
  assert.deepEqual(await get(base, lostResponseBattle, lostOnlyInTestHarness.token),
    { status: 401, error: "UNAUTHORIZED" });
  assert.equal((await get(base, lostResponseBattle, recoveredByIntentionalRotation.token)).version, 0);
  assert.deepEqual(await capabilityStatus(base, lostResponseBattle.battleId, "A"),
    { httpStatus: 200, generation: 3, status: "active" });
  console.log("PASS: lost replace response -> read-only HTTP generation/status -> no implicit write -> deliberate existing replace invalidates unknown bearer; plaintext remains unrecoverable");
  const repeatedCreate = await create(base, "alpha", alphaKey);
  assert.equal(repeatedCreate.battleId, battle.battleId,
    "repeating the same authorized create request must return the original battle");
  assert.deepEqual(repeatedCreate.capabilities, battle.capabilities,
    "idempotent recovery must return the original participant capabilities");
  const encryptedRecord = query(`SELECT * FROM gameplay_battle_creations WHERE idempotency_key_sha256='${creationHash}'`)[0];
  assert.ok(encryptedRecord, "idempotency recovery row missing");
  assert.ok(!Object.keys(encryptedRecord).some(k => /token(_value)?$/i.test(k)), "raw token column must not exist");
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
    "gameplay_battle_creations", "gameplay_command_receipts", "gameplay_event_outbox",
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
  const changedParticipants = {
    A: { id: "changed-A", role: "citizen" }, B: { id: "changed-B", role: "citizen" },
  };
  const changedCreate = await request(base, "POST", "/v1/admin/battles", admin, {
    participants: changedParticipants,
    personIds: await registeredIds(base, changedParticipants),
  }, null, { "idempotency-key": alphaKey });
  assert.equal(changedCreate.status, 409, JSON.stringify(changedCreate));
  assert.equal(changedCreate.error, "IDEMPOTENCY_KEY_REUSE");
  assert.ok(!("capabilities" in changedCreate) && !("battleId" in changedCreate));
  console.log("PASS: idempotency key cannot be reused with changed participants");

  const failedCommitBattle = await create(base, "failed-first-commit");
  const failedCommitHash = createHash("sha256")
    .update("chat03b2:create-battle:v1:" + testCreateKey("failed-first-commit")).digest("hex");
  const failedCommitResult = await commit(base, failedCommitBattle, "A", "invalid-first-commit", {
    selection: { ...selection, attackColor: "invalid" },
  });
  assert.equal(failedCommitResult.status, 409);
  const failedCommitRecovery = query(`SELECT lifecycle_state,capabilities_ciphertext_base64url
    FROM gameplay_battle_creations WHERE idempotency_key_sha256='${failedCommitHash}'`)[0];
  assert.equal(failedCommitRecovery.lifecycle_state, "RECOVERABLE");
  assert.ok(failedCommitRecovery.capabilities_ciphertext_base64url);
  const failedCommitReplay = await createRequest(base, "failed-first-commit", testCreateKey("failed-first-commit"));
  assert.equal(failedCommitReplay.status, 200);
  assert.deepEqual(failedCommitReplay.capabilities, failedCommitBattle.capabilities);
  console.log("PASS: rejected first commit preserves eligible recovery and exact idempotent replay");

  const rotationBattle = await create(base, "rotation-closes-recovery");
  const rotationKey = testCreateKey("rotation-closes-recovery");
  const rotationHash = createHash("sha256").update("chat03b2:create-battle:v1:" + rotationKey).digest("hex");
  const replacementDigest = createHash("sha256").update("synthetic-rotated-capability").digest("hex");
  executeSql(`UPDATE gameplay_battle_capabilities SET token_sha256='${replacementDigest}',generation=2
    WHERE battle_id='${rotationBattle.battleId}' AND side='A'`);
  const rotatedRecovery = query(`SELECT lifecycle_state,capabilities_ciphertext_base64url
    FROM gameplay_battle_creations WHERE idempotency_key_sha256='${rotationHash}'`)[0];
  assert.equal(rotatedRecovery.lifecycle_state, "CLOSED");
  assert.equal(rotatedRecovery.capabilities_ciphertext_base64url, null);
  assert.deepEqual(await createRequest(base, "rotation-closes-recovery", rotationKey),
    { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  assert.deepEqual(await get(base, rotationBattle, rotationBattle.capabilities.A.token),
    { status: 401, error: "UNAUTHORIZED" });
  console.log("PASS: capability digest/generation rotation atomically closes replay and invalidates the old token");

  const tombstoneBattle = await create(base, "tombstone-replay");
  const tombstoneKey = testCreateKey("tombstone-replay");
  const tombstoneHash = createHash("sha256").update("chat03b2:create-battle:v1:" + tombstoneKey).digest("hex");
  assert.equal((await commit(base, tombstoneBattle, "A", "close-for-tombstone")).status, 200);
  executeSql(`UPDATE gameplay_battle_creations SET lifecycle_state='TOMBSTONE',
    request_fingerprint_sha256=NULL,battle_id=NULL,deadline_at_ms=NULL,
    recovery_key_version=NULL,recovery_nonce_base64url=NULL,
    capabilities_ciphertext_base64url=NULL,original_a_token_sha256=NULL,
    original_a_generation=NULL,original_b_token_sha256=NULL,
    original_b_generation=NULL,created_at_ms=NULL
    WHERE idempotency_key_sha256='${tombstoneHash}'`);
  const tombstone = query(`SELECT * FROM gameplay_battle_creations
    WHERE idempotency_key_sha256='${tombstoneHash}'`)[0];
  assert.deepEqual(Object.values(tombstone), [tombstoneHash, null, "TOMBSTONE", null,
    null, null, null, null, null, null, null, null, null]);
  const countBeforeTombstoneReplay = query("SELECT COUNT(*) count FROM gameplay_battles")[0].count;
  assert.deepEqual(await createRequest(base, "tombstone-replay", tombstoneKey),
    { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  assert.deepEqual(await request(base, "POST", "/v1/admin/battles", admin, {
    participants: { A: { id: "different-A", role: "citizen" }, B: { id: "different-B", role: "citizen" } },
    personIds: await registeredIds(base, {
      A: { id: "different-A" }, B: { id: "different-B" },
    }),
  }, null, { "idempotency-key": tombstoneKey }),
  { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  assert.equal(query("SELECT COUNT(*) count FROM gameplay_battles")[0].count, countBeforeTombstoneReplay);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_event_outbox WHERE battle_id='${tombstoneBattle.battleId}'`)[0].count, 2);
  console.log("PASS: digest-only tombstone blocks same/changed replay without deleting battle history or minting a replacement");

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
  const firstCommitRecovery = query(`SELECT lifecycle_state,recovery_key_version,
      recovery_nonce_base64url,capabilities_ciphertext_base64url,original_a_token_sha256,
      original_a_generation,original_b_token_sha256,original_b_generation
      FROM gameplay_battle_creations WHERE idempotency_key_sha256='${creationHash}'`)[0];
  assert.equal(firstCommitRecovery.lifecycle_state, "CLOSED");
  assert.deepEqual(Object.values(firstCommitRecovery).slice(1), Array(7).fill(null));
  const closedReplay = await createRequest(base, "alpha", alphaKey);
  assert.deepEqual(closedReplay, { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  assert.ok(!("battleId" in closedReplay) && !("capabilities" in closedReplay));
  console.log("PASS: first successful participant commit atomically closes and erases recovery; replay is deterministic 410");
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

  // Keep SQL predicate probes as supporting evidence; HTTP tests below execute
  // the real Worker with an isolated test wrapper that interposes one auth read.
  const aCapabilityDigest = createHash("sha256").update(battle.capabilities.A.token).digest("hex");
  const earlierAuthorization = query(`SELECT side,participant_id,token_sha256,generation
    FROM gameplay_battle_capabilities WHERE battle_id='${battle.battleId}'
      AND token_sha256='${aCapabilityDigest}' AND status='active'`)[0];
  assert.deepEqual(earlierAuthorization, {
    side: "A", participant_id: "alpha-A", token_sha256: aCapabilityDigest, generation: 1,
  });
  const readAuthorizedState = (authorization = earlierAuthorization) => query(`SELECT b.version,b.state_json
    FROM gameplay_battles AS b
    JOIN gameplay_battle_capabilities AS c ON c.battle_id=b.battle_id
    WHERE b.battle_id='${battle.battleId}' AND c.side='${authorization.side}'
      AND c.participant_id='${authorization.participant_id}'
      AND c.token_sha256='${authorization.token_sha256}'
      AND c.status='active' AND c.generation=${authorization.generation}
      AND json_extract(b.state_json,'$.participants.' || c.side || '.id')=c.participant_id`);
  const readAuthorizedReceipt = (authorization = earlierAuthorization) => query(`SELECT r.fingerprint,r.code,r.event_ids_json,r.recorded_version
    FROM gameplay_command_receipts AS r
    WHERE r.battle_id='${battle.battleId}' AND r.command_id='A:command-alpha-A'
      AND EXISTS (
        SELECT 1 FROM gameplay_battle_capabilities AS c
        WHERE c.battle_id=r.battle_id AND c.side='${authorization.side}'
          AND c.participant_id='${authorization.participant_id}'
          AND c.token_sha256='${authorization.token_sha256}'
          AND c.status='active' AND c.generation=${authorization.generation}
      )`);
  assert.equal(readAuthorizedState().length, 1);
  assert.equal(readAuthorizedReceipt().length, 1);
  for (const alteredAuthorization of [
    { ...earlierAuthorization, side: "B" },
    { ...earlierAuthorization, participant_id: "other-participant" },
    { ...earlierAuthorization, token_sha256: "f".repeat(64) },
    { ...earlierAuthorization, generation: 2 },
  ]) {
    assert.deepEqual(readAuthorizedState(alteredAuthorization), []);
    assert.deepEqual(readAuthorizedReceipt(alteredAuthorization), []);
  }
  console.log("PASS: local D1 participant read predicates reject wrong side, ID, digest and generation");

  // Case A: a temporary wrapper commits generation 2 immediately after the
  // real Worker authorization SELECT returns generation 1 and before that row
  // reaches Worker code. The protected state/receipt read must reject it.
  const staleGenerationBattle = await create(base, "stale-generation-http");
  await testControl(base, "/__test/generation-race/arm", { battleId: staleGenerationBattle.battleId });
  const staleGenerationResult = await commit(base, staleGenerationBattle, "A", "stale-generation-http-command");
  const staleGenerationCapability = query(`SELECT status,generation
    FROM gameplay_battle_capabilities WHERE battle_id='${staleGenerationBattle.battleId}' AND side='A'`)[0];
  assert.deepEqual(staleGenerationCapability, { status: "revoked", generation: 2 });
  assert.deepEqual(staleGenerationResult, { status: 401, error: "UNAUTHORIZED" });
  const staleGenerationSnapshot = query(`SELECT b.version,
      (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${staleGenerationBattle.battleId}'`)[0];
  assert.deepEqual(staleGenerationSnapshot, { version: 0, receipts: 0, outbox: 1 });
  console.log("PASS: Worker HTTP rejects revocation after original auth read without participant transition writes");

  // Case B: verify a SQL revocation remains fenced after the Worker process exits.
  const revokedBattle = await create(base, "revoked-status-only");
  const revokedSeed = await commit(base, revokedBattle, "A", "revoked-status-only-receipt");
  assert.equal(revokedSeed.status, 200, JSON.stringify(revokedSeed));
  const revokedBefore = query(`SELECT b.version,b.state_json,
      (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox,
      (SELECT status FROM gameplay_battle_capabilities c WHERE c.battle_id=b.battle_id AND c.side='A') status,
      (SELECT generation FROM gameplay_battle_capabilities c WHERE c.battle_id=b.battle_id AND c.side='A') generation
    FROM gameplay_battles b WHERE b.battle_id='${revokedBattle.battleId}'`)[0];
  assert.deepEqual({ status: revokedBefore.status, generation: revokedBefore.generation },
    { status: "active", generation: 1 });
  executeSql(`UPDATE gameplay_battle_capabilities SET status='revoked',generation=2
    WHERE battle_id='${revokedBattle.battleId}' AND side='A'`);
  const revokedCapability = query(`SELECT status,generation FROM gameplay_battle_capabilities
    WHERE battle_id='${revokedBattle.battleId}' AND side='A'`)[0];
  assert.deepEqual(revokedCapability, { status: "revoked", generation: 2 });
  assert.deepEqual(await commit(base, revokedBattle, "A", "revoked-status-only-receipt"),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await commit(base, revokedBattle, "A", "revoked-status-only-fresh-command"),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await get(base, revokedBattle, revokedBattle.capabilities.A.token),
    { status: 401, error: "UNAUTHORIZED" });
  const revokedAfter = query(`SELECT b.version,b.state_json,
      (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox
    FROM gameplay_battles b WHERE b.battle_id='${revokedBattle.battleId}'`)[0];
  assert.deepEqual(revokedAfter, {
    version: revokedBefore.version, state_json: revokedBefore.state_json,
    receipts: revokedBefore.receipts, outbox: revokedBefore.outbox,
  });
  console.log("PASS: revoked token cannot replay, commit fresh, or read; state/receipt/outbox unchanged");

  const revokeRace = await create(base, "revoke-race");
  const revokeRaceRequest = commit(base, revokeRace, "A", "concurrent-revoke-command");
  const revokeRaceMutation = executeSqlAsync(`UPDATE gameplay_battle_capabilities SET status='revoked',generation=2
    WHERE battle_id='${revokeRace.battleId}' AND side='A'`);
  const [revokeRaceResult] = await Promise.all([revokeRaceRequest, revokeRaceMutation]);
  assert.ok([200, 401, 403].includes(revokeRaceResult.status), JSON.stringify(revokeRaceResult));
  const revokeRaceSnapshot = query(`SELECT b.version,
      (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox,
      (SELECT status FROM gameplay_battle_capabilities c WHERE c.battle_id=b.battle_id AND c.side='A') status
    FROM gameplay_battles b WHERE b.battle_id='${revokeRace.battleId}'`)[0];
  assert.equal(revokeRaceSnapshot.status, "revoked");
  if (revokeRaceResult.status === 200) {
    assert.equal(revokeRaceResult.code, "COMMITTED",
      "a fenced commit that linearizes before revocation keeps its success response");
    assert.deepEqual(revokeRaceSnapshot, { version: 1, receipts: 1, outbox: 2, status: "revoked" });
  } else {
    assert.deepEqual(revokeRaceSnapshot, { version: 0, receipts: 0, outbox: 1, status: "revoked" });
  }
  console.log("PASS: concurrent local D1 revoke/commit linearizes as full commit-before-revoke or zero-write revoke-before-commit");

  const recoveryRaceKey = testCreateKey("recover-revoke-commit-race");
  const recoveryRaceBattle = await create(base, "recover-revoke-commit-race", recoveryRaceKey);
  const recoveryRaceHash = createHash("sha256")
    .update("chat03b2:create-battle:v1:" + recoveryRaceKey).digest("hex");
  const [recoveryRaceReplay, recoveryRaceCommit] = await Promise.all([
    createRequest(base, "recover-revoke-commit-race", recoveryRaceKey),
    commit(base, recoveryRaceBattle, "A", "recovery-revoke-commit-race"),
    executeSqlAsync(`UPDATE gameplay_battle_capabilities SET status='revoked',generation=2
      WHERE battle_id='${recoveryRaceBattle.battleId}' AND side='A'`),
  ]).then(values => [values[0], values[1]]);
  assert.ok([200, 410].includes(recoveryRaceReplay.status), JSON.stringify(recoveryRaceReplay));
  if (recoveryRaceReplay.status === 200) {
    assert.equal(recoveryRaceReplay.battleId, recoveryRaceBattle.battleId);
    assert.deepEqual(recoveryRaceReplay.capabilities, recoveryRaceBattle.capabilities);
  } else {
    assert.deepEqual(recoveryRaceReplay, { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  }
  assert.ok([200, 401].includes(recoveryRaceCommit.status), JSON.stringify(recoveryRaceCommit));
  const recoveryRaceState = query(`SELECT b.version,
      (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) receipts,
      (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) outbox,
      (SELECT status FROM gameplay_battle_capabilities c WHERE c.battle_id=b.battle_id AND c.side='A') status,
      (SELECT lifecycle_state FROM gameplay_battle_creations c WHERE c.battle_id=b.battle_id) lifecycle_state,
      (SELECT capabilities_ciphertext_base64url FROM gameplay_battle_creations c WHERE c.battle_id=b.battle_id) ciphertext
    FROM gameplay_battles b WHERE b.battle_id='${recoveryRaceBattle.battleId}'`)[0];
  assert.equal(recoveryRaceState.status, "revoked");
  assert.equal(recoveryRaceState.lifecycle_state, "CLOSED");
  assert.equal(recoveryRaceState.ciphertext, null);
  if (recoveryRaceCommit.status === 200) {
    assert.deepEqual([recoveryRaceState.version, recoveryRaceState.receipts, recoveryRaceState.outbox], [1, 1, 2]);
  } else {
    assert.deepEqual(recoveryRaceCommit, { status: 401, error: "UNAUTHORIZED" });
    assert.deepEqual([recoveryRaceState.version, recoveryRaceState.receipts, recoveryRaceState.outbox], [0, 0, 1]);
  }
  assert.deepEqual(await get(base, recoveryRaceBattle, recoveryRaceBattle.capabilities.A.token),
    { status: 401, error: "UNAUTHORIZED" });
  assert.deepEqual(await createRequest(base, "recover-revoke-commit-race", recoveryRaceKey),
    { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battle_creations
    WHERE idempotency_key_sha256='${recoveryRaceHash}'`)[0].count, 1);
  console.log("PASS: concurrent replay/commit/revoke serializes; any returned old token is unusable after revoke");

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
  assert.equal(afterRestart.revealed, true, JSON.stringify(afterRestart));
  assert.deepEqual(await get(base, operatorRevokedBattle, operatorRevokedBattle.capabilities.A.token),
    { status: 401, error: "UNAUTHORIZED" }, "Worker restart revived an operator-revoked credential");
  const replayAfterRestart = await commit(base, battle, "A", "command-alpha-A");
  assert.equal(replayAfterRestart.status, 200, JSON.stringify(replayAfterRestart));
  assert.equal(replayAfterRestart.replayed, true);
  assert.equal((await get(base, battle, battle.capabilities.B.token)).revealed, true);
  const replayBAfterRestart = await commit(base, battle, "B", "command-alpha-B");
  assert.equal(replayBAfterRestart.status, 200, JSON.stringify(replayBAfterRestart));
  assert.equal(replayBAfterRestart.replayed, true);
  const createReplayAfterRestart = await createRequest(base, "alpha", alphaKey);
  assert.deepEqual(createReplayAfterRestart, { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  assert.equal(query(`SELECT recovery_key_version FROM gameplay_battle_creations WHERE idempotency_key_sha256='${creationHash}'`)[0].recovery_key_version, null);
  console.log("PASS: Worker restart/reconnect receipts remain durable; closed creation replay never returns credentials");

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
  assert.equal(unstuck.mechanicalOutcome, "DRAW");
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_votes WHERE battle_id='${stuckId}'`)[0].count, 0,
    "legacy DRAW without trusted person bindings reveals but cannot open a vote");
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

  const scheduledRecoveryKey = testCreateKey("scheduler-closes-recovery");
  const scheduledRecoveryBattle = await create(base, "scheduler-closes-recovery", scheduledRecoveryKey);
  const scheduledRecoveryHash = createHash("sha256")
    .update("chat03b2:create-battle:v1:" + scheduledRecoveryKey).digest("hex");
  const dueState = JSON.parse(query(`SELECT state_json FROM gameplay_battles
    WHERE battle_id='${scheduledRecoveryBattle.battleId}'`)[0].state_json);
  dueState.deadlineAt = Date.now() - 1;
  executeSql(`UPDATE gameplay_battles SET state_json=${sqlq(JSON.stringify(dueState))}
    WHERE battle_id='${scheduledRecoveryBattle.battleId}'`);
  const expiryCron = await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
  assert.equal(expiryCron.status, 200);
  const scheduledRecoveryState = query(`SELECT b.phase,
      c.lifecycle_state,c.recovery_key_version,c.recovery_nonce_base64url,
      c.capabilities_ciphertext_base64url,c.original_a_token_sha256
    FROM gameplay_battles b JOIN gameplay_battle_creations c ON c.battle_id=b.battle_id
    WHERE b.battle_id='${scheduledRecoveryBattle.battleId}'`)[0];
  assert.equal(scheduledRecoveryState.phase, "expired");
  assert.equal(scheduledRecoveryState.lifecycle_state, "CLOSED");
  assert.deepEqual(Object.values(scheduledRecoveryState).slice(2), [null, null, null, null]);
  assert.deepEqual(await createRequest(base, "scheduler-closes-recovery", scheduledRecoveryKey),
    { status: 410, error: "CREATION_RECOVERY_CLOSED" });
  console.log("PASS: terminal scheduler expiry atomically closes and erases create recovery");
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

  // Chat05A: operator registry is idempotent and accepts no browser identity fields.
  const registryKey = createHash("sha256").update("chat05a-registry-idempotent-test").digest("hex");
  const registryFirst = await request(base, "POST", "/v1/admin/persons", admin, {}, null,
    { "idempotency-key": registryKey });
  const registryReplay = await request(base, "POST", "/v1/admin/persons", admin, {}, null,
    { "idempotency-key": registryKey });
  assert.ok([200, 201].includes(registryFirst.status));
  assert.equal(registryReplay.status, 200);
  assert.equal(registryReplay.personId, registryFirst.personId);
  assert.equal((await request(base, "POST", "/v1/admin/persons", "not-admin", {}, null,
    { "idempotency-key": createHash("sha256").update("denied-person").digest("hex") })).status, 401);
  assert.equal((await request(base, "POST", "/v1/admin/persons", admin,
    { name: "must-not-be-stored" }, null,
    { "idempotency-key": createHash("sha256").update("invalid-person").digest("hex") })).status, 400);

  // Chat05A: the Worker opens the stable DRAW vote in the same D1 batch as reveal.
  const drawBattle = await create(base, "chat05a-draw-vote");
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_votes WHERE battle_id='${drawBattle.battleId}'`)[0].count, 0,
    "vote must not exist before a trigger");
  const drawA = await commit(base, drawBattle, "A", "chat05a-draw-A");
  const drawB = await commit(base, drawBattle, "B", "chat05a-draw-B");
  assert.equal(drawA.status, 200, JSON.stringify(drawA));
  assert.equal(drawB.status, 200, JSON.stringify(drawB));
  const expectedVoteId = await deriveSocialVoteId(drawBattle.battleId);
  let persistedVote = query(`SELECT vote_id,status FROM gameplay_social_votes WHERE battle_id='${drawBattle.battleId}'`);
  assert.deepEqual(persistedVote, [{ vote_id: expectedVoteId, status: "open" }]);
  assert.equal((await get(base, drawBattle, drawBattle.capabilities.A.token)).phase, "revealed");
  const reloadCron = await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
  assert.equal(reloadCron.status, 200);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_votes WHERE battle_id='${drawBattle.battleId}'`)[0].count, 1,
    "reload/retry must retain exactly one vote ID");
  console.log("PASS: DRAW reveal atomically creates one stable vote ID across reload/retry");

  // Synthetic text fixtures are test-only and are provisioned by the trusted
  // operator route; they are not game-canon phrases.
  const textBattle = await create(base, "chat05a-text-commit");
  const textOffers = {
    catalogVersion: "fixture-chat05a-v1",
    offers: [
      { side: "A", channel: "attack", offerId: "a-attack-1", text: "Готовая атака." },
      { side: "A", channel: "attack", offerId: "a-attack-2", text: "Другая готовая атака." },
      { side: "A", channel: "defense", offerId: "a-defense-1", text: "Готовая защита." },
      { side: "B", channel: "attack", offerId: "b-attack-1", text: "Ответная атака." },
      { side: "B", channel: "attack", offerId: "b-attack-2", text: "Обновлённая атака." },
      { side: "B", channel: "defense", offerId: "b-defense-1", text: "Ответная защита." },
    ],
  };
  const textOfferPath = `/v1/admin/battles/${textBattle.battleId}/text-offers`;
  assert.equal((await request(base, "POST", textOfferPath, textBattle.capabilities.A.token, textOffers)).status, 401,
    "participant capability cannot provision trusted text offers");
  assert.equal((await request(base, "POST", textOfferPath, admin, textOffers, "https://allowed.example")).status, 403,
    "operator text provisioning is server-to-server only");
  const incompleteCatalog = await request(base, "POST", textOfferPath, admin, {
    ...textOffers, offers: textOffers.offers.filter(x => !(x.side === "A" && x.channel === "defense")),
  });
  assert.equal(incompleteCatalog.status, 400, "all A/B attack/defense offer groups are required");
  const pinned = await request(base, "POST", textOfferPath, admin, textOffers);
  assert.deepEqual(pinned, { status: 201, catalogVersion: "fixture-chat05a-v1", normalizationVersion: "chat01-unicode-words-ucd-15.0.0-v2" });
  assert.equal((await request(base, "POST", textOfferPath, admin, textOffers)).status, 409,
    "a pinned battle catalog cannot be replaced");
  executeSqlExpectFailure(`INSERT INTO gameplay_battle_text_offers (battle_id,side,channel,offer_id,phrase_text,word_signature) VALUES ('${textBattle.battleId}','A','attack','late-extra','Late offer.','["late","offer"]')`, "TEXT_CATALOG_IMMUTABLE");
  const offeredToA = await get(base, textBattle, textBattle.capabilities.A.token);
  const offeredToB = await get(base, textBattle, textBattle.capabilities.B.token);
  assert.equal(offeredToA.readyTextOffers.offers.some(x => x.offer_id === "a-attack-1"), true);
  assert.equal(offeredToA.readyTextOffers.offers.some(x => x.offer_id.startsWith("b-")), false);
  assert.equal(offeredToB.readyTextOffers.offers.some(x => x.offer_id === "b-attack-1"), true);
  assert.equal(Object.hasOwn(offeredToA, "committedTexts"), false);

  const textIntentA = {
    attack: { offerId: "a-attack-1", finalText: "Готовая атака, но теперь добавлены слова 👍" },
    defense: { offerId: "a-defense-1", finalText: "ГОТОВАЯ защита!!!" },
  };
  const forgedText = await commit(base, textBattle, "A", "chat05a-forged-text", {
    textIntent: textIntentA, nextTextOrigin: "authored",
  });
  assert.equal(forgedText.status, 400, "browser-supplied provenance is rejected");
  const invalidUnicode = await commit(base, textBattle, "A", "chat05a-invalid-unicode", {
    textIntent: { ...textIntentA, attack: { offerId: "a-attack-1", finalText: "\ud800" } },
  });
  assert.equal(invalidUnicode.status, 400, "unpaired UTF-16 surrogate is rejected");
  const missingIntent = await commit(base, textBattle, "A", "chat05a-missing-text", {});
  assert.equal(missingIntent.status, 409, "text-enabled battles require both channels atomically");
  const forgedOffer = await commit(base, textBattle, "A", "chat05a-forged-offer", {
    textIntent: { ...textIntentA, attack: { offerId: "b-attack-1", finalText: "Чужой offer" } },
  });
  assert.equal(forgedOffer.status, 409, JSON.stringify(forgedOffer));
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battle_text_commits WHERE battle_id='${textBattle.battleId}'`)[0].count, 0,
    "invalid/forged text cannot partially commit");
  const drawPair = findSelectionPair("DRAW");
  const textA = await commit(base, textBattle, "A", "chat05a-text-A", { selection: drawPair.A, textIntent: textIntentA });
  assert.equal(textA.status, 200, JSON.stringify(textA));
  const privateViewForB = await get(base, textBattle, textBattle.capabilities.B.token);
  assert.equal(Object.hasOwn(privateViewForB, "committedTexts"), false);
  assert.equal(JSON.stringify(privateViewForB).includes("добавлены слова"), false,
    "opponent cannot read A's final text before reveal");
  const replayTextA = await commit(base, textBattle, "A", "chat05a-text-A", { textIntent: textIntentA });
  assert.equal(replayTextA.replayed, true);
  const alteredReplay = await commit(base, textBattle, "A", "chat05a-text-A", {
    textIntent: { ...textIntentA, attack: { ...textIntentA.attack, finalText: "Подмена после подтверждения" } },
  });
  assert.equal(alteredReplay.status, 409, "same command ID with altered text is rejected");
  const alteredFresh = await commit(base, textBattle, "A", "chat05a-text-A-fresh", {
    textIntent: { ...textIntentA, attack: { ...textIntentA.attack, finalText: "Подмена после подтверждения" } },
  });
  assert.equal(alteredFresh.status, 409, "fresh command ID cannot replace confirmed text");

  const textIntentB = {
    attack: { offerId: "b-attack-2" }, // ↻ to another ready phrase is not authored.
    defense: { offerId: "b-defense-1", finalText: "Ответная защита с новыми словами ✨" },
  };
  const textB = await commit(base, textBattle, "B", "chat05a-text-B", { selection: drawPair.B, textIntent: textIntentB });
  assert.equal(textB.status, 200, JSON.stringify(textB));
  assert.equal(textB.view.phase, "revealed");
  assert.equal(textB.view.mechanicalOutcome, "DRAW");
  assert.equal(textB.view.socialVoteTrigger, "BOTH");
  assert.equal(textB.view.socialOutcome, "PENDING");
  assert.equal(textB.view.recognizedOutcome, "PENDING");
  const bothVoteId = await deriveSocialVoteId(textBattle.battleId);
  assert.deepEqual(query(`SELECT vote_id,trigger_reason FROM gameplay_social_votes WHERE battle_id='${textBattle.battleId}'`),
    [{ vote_id: bothVoteId, trigger_reason: "BOTH" }]);
  assert.deepEqual(query(`SELECT side,attack_words_edited,defense_words_edited FROM gameplay_battle_text_commits WHERE battle_id='${textBattle.battleId}' ORDER BY side`),
    [{ side: "A", attack_words_edited: 1, defense_words_edited: 0 },
     { side: "B", attack_words_edited: 0, defense_words_edited: 1 }]);
  assert.equal(textB.view.committedTexts.A.attack.text, textIntentA.attack.finalText);
  assert.equal(textB.view.committedTexts.A.defense.wordsEdited, false);
  assert.equal(textB.view.committedTexts.B.attack.offerId, "b-attack-2");
  assert.equal(textB.view.committedTexts.B.attack.wordsEdited, false);
  assert.equal((await request(base, "POST",
    `/v1/admin/battles/${drawBattle.battleId}/text-offers`, admin, textOffers)).status, 409,
    "legacy/revealed battle cannot receive a retroactive text catalog");
  const catalogAfterCommit = await request(base, "POST", textOfferPath, admin, textOffers);
  assert.equal(catalogAfterCommit.status, 409, "catalog remains immutable after commit");
  await restartApi();
  const textAfterRestart = await get(base, textBattle, textBattle.capabilities.A.token);
  assert.equal(textAfterRestart.committedTexts.B.defense.wordsEdited, true);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battle_text_commits WHERE battle_id='${textBattle.battleId}'`)[0].count, 2);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_votes WHERE battle_id='${textBattle.battleId}'`)[0].count, 1);
  const duplicateRevealRequests = await Promise.all([fetch(cronUrl), fetch(cronUrl)]);
  assert.deepEqual(duplicateRevealRequests.map(x => x.status), [200, 200]);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_votes WHERE battle_id='${textBattle.battleId}'`)[0].count, 1);

  async function runTextTriggerCase(name, outcome, editedSide, expectedReason) {
    const battle = await create(base, name);
    const offersPath = `/v1/admin/battles/${battle.battleId}/text-offers`;
    assert.equal((await request(base, "POST", offersPath, admin, textOffers)).status, 201);
    const pair = findSelectionPair(outcome);
    function intent(side) {
      const attackOffer = side === "A" ? "a-attack-1" : "b-attack-1";
      const refreshedAttack = side === "A" ? "a-attack-2" : "b-attack-2";
      const defenseOffer = side === "A" ? "a-defense-1" : "b-defense-1";
      const intent = {
        attack: { offerId: editedSide === side ? attackOffer : refreshedAttack,
          ...(editedSide === side ? { finalText: "Автор добавил новые осмысленные слова." } : {}) },
        defense: { offerId: defenseOffer,
          ...(editedSide === side ? { finalText: "Изменённый текст защиты с новыми словами." }
            : { finalText: side === "A" ? "Готовая защита!!!" : "ОТВЕТНАЯ защита..." }) },
      };
      if (intent.attack.finalText === undefined) delete intent.attack.finalText;
      return intent;
    }
    for (const side of ["A", "B"]) {
      const response = await commit(base, battle, side, name + "-" + side, {
        selection: pair[side], textIntent: intent(side),
      });
      assert.equal(response.status, 200, JSON.stringify(response));
    }
    const revealed = await get(base, battle, battle.capabilities.A.token);
    assert.equal(revealed.phase, "revealed");
    assert.equal(revealed.mechanicalOutcome, outcome);
    assert.equal(revealed.socialVoteTrigger, expectedReason);
    assert.equal(revealed.socialOutcome, expectedReason === "NONE" ? "NONE" : "PENDING");
    assert.equal(revealed.recognizedOutcome, "PENDING");
    const votes = query(`SELECT vote_id,trigger_reason FROM gameplay_social_votes WHERE battle_id='${battle.battleId}'`);
    if (expectedReason === "NONE") assert.deepEqual(votes, []);
    else assert.deepEqual(votes, [{ vote_id: await deriveSocialVoteId(battle.battleId), trigger_reason: expectedReason }]);
    const again = await Promise.all([fetch(cronUrl), fetch(cronUrl)]);
    assert.deepEqual(again.map(x => x.status), [200, 200]);
    assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_votes WHERE battle_id='${battle.battleId}'`)[0].count,
      expectedReason === "NONE" ? 0 : 1);
    return { battle, revealed };
  }

  await runTextTriggerCase("chat05a-draw-no-edit", "DRAW", null, "DRAW");
  await runTextTriggerCase("chat05a-authored-a-win", "A_WIN", "A", "AUTHORED_TEXT");
  await runTextTriggerCase("chat05a-authored-b-win", "B_WIN", "B", "AUTHORED_TEXT");
  await runTextTriggerCase("chat05a-no-trigger-a-win", "A_WIN", null, "NONE");
  console.log("PASS: reveal trigger matrix DRAW, BOTH, AUTHORED_TEXT on A_WIN/B_WIN, and NONE; concurrent retries remain single-vote");

  // Both participant text commits race from the same initial snapshot. D1 CAS
  // plus the text-transition view must retain both complete rows exactly once.
  const concurrentTextBattle = await create(base, "chat05a-text-concurrent");
  assert.equal((await request(base, "POST", `/v1/admin/battles/${concurrentTextBattle.battleId}/text-offers`, admin, textOffers)).status, 201);
  const concurrentResults = await Promise.all([
    commit(base, concurrentTextBattle, "A", "chat05a-text-race-A", {
      textIntent: { attack: { offerId: "a-attack-2" }, defense: { offerId: "a-defense-1" } },
    }),
    commit(base, concurrentTextBattle, "B", "chat05a-text-race-B", {
      textIntent: { attack: { offerId: "b-attack-1" }, defense: { offerId: "b-defense-1" } },
    }),
  ]);
  assert.deepEqual(concurrentResults.map(x => x.status).sort(), [200, 200]);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battle_text_commits WHERE battle_id='${concurrentTextBattle.battleId}'`)[0].count, 2);
  assert.equal((await get(base, concurrentTextBattle, concurrentTextBattle.capabilities.A.token)).phase, "revealed");
  const sameSideTextRaceBattle = await create(base, "chat05a-text-same-side-race");
  assert.equal((await request(base, "POST", `/v1/admin/battles/${sameSideTextRaceBattle.battleId}/text-offers`, admin, textOffers)).status, 201);
  const sameSideTextRace = await Promise.all([
    commit(base, sameSideTextRaceBattle, "A", "chat05a-text-same-side-race-1", {
      textIntent: { attack: { offerId: "a-attack-1" }, defense: { offerId: "a-defense-1" } },
    }),
    commit(base, sameSideTextRaceBattle, "A", "chat05a-text-same-side-race-2", {
      textIntent: { attack: { offerId: "a-attack-1" }, defense: { offerId: "a-defense-1" } },
    }),
  ]);
  assert.deepEqual(sameSideTextRace.map(x => x.status).sort(), [200, 409]);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_battle_text_commits WHERE battle_id='${sameSideTextRaceBattle.battleId}' AND side='A'`)[0].count, 1,
    "parallel same-side commands cannot replace the first immutable text commitment");

  console.log("PASS: trusted offers, authenticated atomic text commits, privacy, replay, immutability, and restart persistence");

  const spectatorOne = await registerTestPerson(base, "chat05a-spectator-one");
  const spectatorTwo = await registerTestPerson(base, "chat05a-spectator-two");
  const spectatorThree = await registerTestPerson(base, "chat05a-spectator-three");
  const issueSpectator = (personId, expectedGeneration = 0, origin = null) =>
    request(base, "POST", `/v1/admin/battles/${drawBattle.battleId}/spectators/${personId}/capability`,
      admin, { expectedGeneration }, origin);
  const participantPerson = query(`SELECT person_id FROM gameplay_battle_persons
    WHERE battle_id='${drawBattle.battleId}' AND side='A'`)[0].person_id;
  assert.equal((await issueSpectator(participantPerson)).status, 409,
    "a participant personId must not receive a spectator capability");
  assert.equal((await issueSpectator(spectatorOne, 0, "https://allowed.example")).status, 403,
    "spectator capabilities are server-to-server operator actions");
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    "uninvited-" + "x".repeat(40), { choice: "A" })).status, 401);
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    drawBattle.capabilities.A.token, { choice: "A" })).status, 401);
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    drawBattle.capabilities.B.token, { choice: "B" })).status, 401);

  const capOne = await issueSpectator(spectatorOne);
  const capTwo = await issueSpectator(spectatorTwo);
  const capThree = await issueSpectator(spectatorThree);
  assert.equal(capOne.status, 201, JSON.stringify(capOne));
  assert.equal(capTwo.status, 201, JSON.stringify(capTwo));
  assert.equal(capThree.status, 201, JSON.stringify(capThree));
  const forged = await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capOne.token, { choice: "A", personId: participantPerson });
  assert.equal(forged.status, 400, JSON.stringify(forged));
  assert.equal(forged.error, "INVALID_BALLOT");

  const firstBallot = await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capOne.token, { choice: "A" });
  assert.deepEqual(firstBallot, { status: 200, voteId: expectedVoteId, choice: "A", replayed: false });
  const ballotAfterReload = await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capOne.token, { choice: "A" });
  assert.deepEqual(ballotAfterReload, { status: 200, voteId: expectedVoteId, choice: "A", replayed: true });
  await restartApi(); // same local D1 persist directory, new Worker process
  const ballotAfterWorkerRestart = await request(base, "POST",
    `/v1/battles/${drawBattle.battleId}/votes`, capOne.token, { choice: "A" });
  assert.deepEqual(ballotAfterWorkerRestart,
    { status: 200, voteId: expectedVoteId, choice: "A", replayed: true });
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_votes WHERE battle_id='${drawBattle.battleId}'`)[0].count, 1);
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capOne.token, { choice: "B" })).status, 409);
  const storedSecret = query(`SELECT token_sha256 FROM gameplay_battle_spectator_capabilities
    WHERE battle_id='${drawBattle.battleId}' AND person_id='${spectatorOne}'`)[0].token_sha256;
  assert.equal(storedSecret, createHash("sha256").update(capOne.token).digest("hex"));
  assert.notEqual(storedSecret, capOne.token);

  const samePersonRace = await Promise.all([
    request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`, capTwo.token, { choice: "A" }),
    request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`, capTwo.token, { choice: "B" }),
  ]);
  assert.equal(samePersonRace.filter(x => x.status === 200).length, 1, JSON.stringify(samePersonRace));
  assert.equal(samePersonRace.filter(x => x.status === 409).length, 1, JSON.stringify(samePersonRace));
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_ballots
    WHERE vote_id='${expectedVoteId}' AND person_id='${spectatorTwo}'`)[0].count, 1);
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capThree.token, { choice: "B" })).status, 200,
    "another invited person may vote independently");

  const revoked = await request(base, "POST",
    `/v1/admin/battles/${drawBattle.battleId}/spectators/${spectatorOne}/capability/revoke`,
    admin, { expectedGeneration: 1 });
  assert.deepEqual(revoked, { status: 200, personId: spectatorOne, capabilityStatus: "revoked", generation: 2 });
  const revokedStatus = await request(base, "GET",
    `/v1/admin/battles/${drawBattle.battleId}/spectators/${spectatorOne}/capability/status`,
    admin);
  assert.deepEqual(revokedStatus, { status: 200, generation: 2, capabilityStatus: "revoked" });
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capOne.token, { choice: "A" })).status, 401,
    "revoked bearer must not authenticate on reload");
  const capOneReissued = await issueSpectator(spectatorOne, 2);
  assert.equal(capOneReissued.status, 200, JSON.stringify(capOneReissued));
  assert.equal(capOneReissued.generation, 3);
  assert.notEqual(capOneReissued.token, capOne.token);
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capOneReissued.token, { choice: "A" })).replayed, true);
  assert.equal((await request(base, "POST", `/v1/battles/${drawBattle.battleId}/votes`,
    capOneReissued.token, { choice: "B" })).status, 409,
    "reissue must not replace an immutable person ballot");
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_ballots
    WHERE vote_id='${expectedVoteId}' AND person_id='${spectatorOne}'`)[0].count, 1);
  console.log("PASS: server identity, participant exclusion, forged identity, ballot races, revocation, and reissue");

  // Chat05B uses explicit test policy values supplied only by this disposable
  // local Worker wrapper. Seven is a test matrix value, not a game balance.
  const socialPeople = [];
  for (let i = 0; i < 8; i++) socialPeople.push(await registerTestPerson(base, `chat05b-spectator-${i}`));
  const boundaryVote = await openSocialVote(base, "chat05b-deadline-boundary");
  assert.equal(boundaryVote.session.quorum, 7);
  assert.equal(boundaryVote.session.duration_ms, 60000);
  assert.equal(boundaryVote.session.deadline_at_ms,
    boundaryVote.session.opened_at_ms + boundaryVote.session.duration_ms);
  const boundaryCaps = await issueSocialVoteCapabilities(base, boundaryVote.battle, socialPeople.slice(0, 3));
  await setTestClock(base, boundaryVote.session.deadline_at_ms - 1);
  const beforeDeadline = await request(base, "POST", `/v1/battles/${boundaryVote.battle.battleId}/votes`,
    boundaryCaps[0].token, { choice: "A" });
  assert.equal(beforeDeadline.status, 200, JSON.stringify(beforeDeadline));
  assert.equal(query(`SELECT cast_at_ms FROM gameplay_social_ballots
    WHERE vote_id='${boundaryVote.voteId}'`)[0].cast_at_ms, boundaryVote.session.deadline_at_ms - 1);
  await setTestClock(base, boundaryVote.session.deadline_at_ms);
  const exactlyAtDeadline = await request(base, "POST", `/v1/battles/${boundaryVote.battle.battleId}/votes`,
    boundaryCaps[1].token, { choice: "B" });
  assert.equal(exactlyAtDeadline.status, 409, JSON.stringify(exactlyAtDeadline));
  assert.equal(exactlyAtDeadline.error, "VOTE_CLOSED");
  await setTestClock(base, boundaryVote.session.deadline_at_ms + 1);
  const afterDeadline = await request(base, "POST", `/v1/battles/${boundaryVote.battle.battleId}/votes`,
    boundaryCaps[2].token, { choice: "B" });
  assert.equal(afterDeadline.status, 409, JSON.stringify(afterDeadline));
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_ballots WHERE vote_id='${boundaryVote.voteId}'`)[0].count, 1);
  assert.deepEqual(query(`SELECT status,closed_at_ms,human_count,npc_count,count_a,count_b,final_choice
    FROM gameplay_social_vote_deadlines WHERE vote_id='${boundaryVote.voteId}'`),
  [{ status: "closed", closed_at_ms: boundaryVote.session.deadline_at_ms,
    human_count: 1, npc_count: 6,
    count_a: query(`SELECT COUNT(*) count FROM gameplay_social_npc_ballots
      WHERE vote_id='${boundaryVote.voteId}' AND choice='A'`)[0].count + 1,
    count_b: query(`SELECT COUNT(*) count FROM gameplay_social_npc_ballots
      WHERE vote_id='${boundaryVote.voteId}' AND choice='B'`)[0].count,
    final_choice: query(`SELECT final_choice FROM gameplay_social_vote_deadlines
      WHERE vote_id='${boundaryVote.voteId}'`)[0].final_choice }]);
  await setTestClock(base, null);
  console.log("PASS: server-created immutable deadline; human votes accepted strictly before and rejected at/after it");

  // Delay the authoritative ballot lookup across the deadline. The server clock
  // advances while the request is suspended; the SQL write boundary must reject.
  const delayedBoundary = await openSocialVote(base, "chat05b-delayed-boundary-write");
  const delayedCaps = await issueSocialVoteCapabilities(base, delayedBoundary.battle, socialPeople.slice(0, 2));
  await setTestClock(base, delayedBoundary.session.deadline_at_ms - 1);
  await testControl(base, "/__test/ballot-read-delay", { delayMs: 150 });
  const delayedCast = request(base, "POST", `/v1/battles/${delayedBoundary.battle.battleId}/votes`,
    delayedCaps[0].token, { choice: "A" });
  await new Promise(resolve => setTimeout(resolve, 25));
  await setTestClock(base, delayedBoundary.session.deadline_at_ms);
  const delayedResult = await delayedCast;
  assert.equal(delayedResult.status, 409, JSON.stringify(delayedResult));
  assert.equal(delayedResult.error, "VOTE_CLOSED");
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_ballots WHERE vote_id='${delayedBoundary.voteId}'`)[0].count, 0,
    "time spent in a prior read cannot authorize a write after the deadline");
  await setTestClock(base, null);
  console.log("PASS: delayed capability/ballot read crossing deadline is rejected at SQL INSERT");

  // Required 0/1/4/6/7 human matrix with exact NPC top-up to the odd test quorum.
  const matrix = [];
  for (const humanCount of [0, 1, 4, 6, 7]) {
    const opened = await openSocialVote(base, `chat05b-matrix-${humanCount}`);
    const caps = await issueSocialVoteCapabilities(base, opened.battle, socialPeople);
    for (let i = 0; i < humanCount; i++) {
      const cast = await request(base, "POST", `/v1/battles/${opened.battle.battleId}/votes`,
        caps[i].token, { choice: i % 2 === 0 ? "A" : "B" });
      assert.equal(cast.status, 200, JSON.stringify(cast));
    }
    if (humanCount === 7) {
      await setTestClock(base, opened.session.deadline_at_ms - 1);
      const eighth = await request(base, "POST", `/v1/battles/${opened.battle.battleId}/votes`,
        caps[7].token, { choice: "B" });
      assert.equal(eighth.status, 409, JSON.stringify(eighth));
      assert.equal(eighth.error, "SOCIAL_VOTE_QUORUM_REACHED");
      assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_ballots WHERE vote_id='${opened.voteId}'`)[0].count, 7);
      await setTestClock(base, null);
    }
    await setTestClock(base, opened.session.deadline_at_ms + 1);
    let result;
    if (humanCount === 0) {
      const closes = await Promise.all([
        request(base, "GET", `/v1/battles/${opened.battle.battleId}/votes`, caps[0].token),
        request(base, "GET", `/v1/battles/${opened.battle.battleId}/votes`, caps[1].token),
      ]);
      assert.deepEqual(closes.map(row => row.status), [200, 200]);
      assert.deepEqual(closes[0], closes[1], "concurrent timeout closures must replay the same stored result");
      result = closes[0];
    } else {
      result = await request(base, "GET", `/v1/battles/${opened.battle.battleId}/votes`, caps[0].token);
    }
    assert.equal(result.status, 200, JSON.stringify(result));
    assert.equal(result.voteStatus, "closed");
    assert.equal(result.humanVotes, humanCount);
    assert.equal(result.npcVotes, 7 - humanCount);
    assert.equal(result.humanVotes + result.npcVotes, 7);
    assert.notEqual(result.countA, result.countB);
    assert.equal(result.finalChoice, result.countA > result.countB ? "A" : "B");
    const savedBallots = query(`SELECT person_id,choice FROM gameplay_social_ballots
      WHERE vote_id='${opened.voteId}' ORDER BY person_id`);
    assert.equal(savedBallots.length, humanCount, "every human ballot remains present after close");
    assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_npc_ballots WHERE vote_id='${opened.voteId}'`)[0].count,
      7 - humanCount);
    const npcRowsBeforeReplay = query(`SELECT fixture_slot,fixture_version,choice,cast_at_ms
      FROM gameplay_social_npc_ballots WHERE vote_id='${opened.voteId}' ORDER BY fixture_slot`);
    const closedRowBeforeReplay = query(`SELECT * FROM gameplay_social_vote_deadlines WHERE vote_id='${opened.voteId}'`)[0];
    const replay = await request(base, "GET", `/v1/battles/${opened.battle.battleId}/votes`, caps[0].token);
    assert.deepEqual(replay, result, "reload/replay must return the same closed result");
    await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
    await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
    assert.deepEqual(query(`SELECT fixture_slot,fixture_version,choice,cast_at_ms
      FROM gameplay_social_npc_ballots WHERE vote_id='${opened.voteId}' ORDER BY fixture_slot`), npcRowsBeforeReplay,
      "repeated timeout must not insert NPC ballots");
    assert.deepEqual(query(`SELECT * FROM gameplay_social_vote_deadlines WHERE vote_id='${opened.voteId}'`)[0], closedRowBeforeReplay,
      "closed result is immutable under repeated timeout");
    matrix.push({ humanCount, npcCount: result.npcVotes, countA: result.countA, countB: result.countB });
    await setTestClock(base, null);
    if (humanCount === 4) {
      await restartApi();
      const afterWorkerRestart = await request(base, "GET", `/v1/battles/${opened.battle.battleId}/votes`, caps[0].token);
      assert.deepEqual(afterWorkerRestart, result, "Worker restart must preserve the final result");
    }
  }
  assert.deepEqual(matrix.map(row => [row.humanCount, row.npcCount]), [[0,7],[1,6],[4,3],[6,1],[7,0]]);
  console.log("PASS: 0/1/4/6/7 human matrix; quorum cap; deterministic NPC-only top-up; no ties; concurrent close/replay/restart");

  // Race the last human ballot with timeout at the exact boundary. The SQL
  // write guard and close transaction serialize; the ballot is rejected and
  // six committed people plus one NPC close the vote atomically.
  const lastVoteRace = await openSocialVote(base, "chat05b-last-human-close-race");
  const raceCaps = await issueSocialVoteCapabilities(base, lastVoteRace.battle, socialPeople);
  for (let i = 0; i < 6; i++) {
    const cast = await request(base, "POST", `/v1/battles/${lastVoteRace.battle.battleId}/votes`,
      raceCaps[i].token, { choice: i % 2 ? "B" : "A" });
    assert.equal(cast.status, 200, JSON.stringify(cast));
  }
  await setTestClock(base, lastVoteRace.session.deadline_at_ms);
  const simultaneous = await Promise.all([
    request(base, "POST", `/v1/battles/${lastVoteRace.battle.battleId}/votes`,
      raceCaps[6].token, { choice: "A" }),
    request(base, "GET", `/v1/battles/${lastVoteRace.battle.battleId}/votes`, raceCaps[0].token),
  ]);
  assert.equal(simultaneous[0].status, 409, JSON.stringify(simultaneous));
  assert.equal(simultaneous[1].status, 200, JSON.stringify(simultaneous));
  assert.equal(simultaneous[1].humanVotes, 6);
  assert.equal(simultaneous[1].npcVotes, 1);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_ballots WHERE vote_id='${lastVoteRace.voteId}'`)[0].count, 6);
  await setTestClock(base, null);
  console.log("PASS: last-human request racing timeout is serialized at D1 and cannot alter the closed result");

  // Inject a real D1 statement failure after the first NPC INSERT in a batch.
  // The batch must roll back every inserted fixture and leave the vote open.
  const rollbackVote = await openSocialVote(base, "chat05b-close-rollback");
  const rollbackCaps = await issueSocialVoteCapabilities(base, rollbackVote.battle, socialPeople.slice(0, 2));
  const retainedHuman = await request(base, "POST", `/v1/battles/${rollbackVote.battle.battleId}/votes`,
    rollbackCaps[0].token, { choice: "B" });
  assert.equal(retainedHuman.status, 200);
  executeSql(`CREATE TRIGGER chat05b_test_fail_npc_insert BEFORE INSERT ON gameplay_social_npc_ballots
    WHEN NEW.fixture_slot=2 BEGIN SELECT RAISE(ABORT,'CHAT05B_INJECTED_BATCH_FAILURE'); END`);
  await setTestClock(base, rollbackVote.session.deadline_at_ms + 1);
  const failedClose = await request(base, "GET", `/v1/battles/${rollbackVote.battle.battleId}/votes`, rollbackCaps[1].token);
  assert.equal(failedClose.status, 503, JSON.stringify(failedClose));
  assert.equal(failedClose.error, "SOCIAL_VOTE_CLOSE_RETRY_REQUIRED");
  assert.equal(query(`SELECT status FROM gameplay_social_vote_deadlines WHERE vote_id='${rollbackVote.voteId}'`)[0].status, "open");
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_npc_ballots WHERE vote_id='${rollbackVote.voteId}'`)[0].count, 0,
    "failed D1 batch must roll back the earlier NPC insert");
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_ballots WHERE vote_id='${rollbackVote.voteId}'`)[0].count, 1,
    "failed close must retain the human ballot");
  executeSql("DROP TRIGGER chat05b_test_fail_npc_insert");
  const recoveredClose = await request(base, "GET", `/v1/battles/${rollbackVote.battle.battleId}/votes`, rollbackCaps[1].token);
  assert.equal(recoveredClose.status, 200, JSON.stringify(recoveredClose));
  assert.equal(recoveredClose.voteStatus, "closed");
  assert.equal(recoveredClose.humanVotes, 1);
  assert.equal(recoveredClose.npcVotes, 6);
  assert.equal(query(`SELECT COUNT(*) count FROM gameplay_social_npc_ballots WHERE vote_id='${rollbackVote.voteId}'`)[0].count, 6);
  await setTestClock(base, null);
  console.log("PASS: injected local D1 batch failure rolls back partial NPC fill and retry completes once");

  // Keep an open human ballot durable across a Worker restart, deliberately skip
  // the scheduler, then prove the normal request path catches up from D1.
  const missedSchedulerVote = await openSocialVote(base, "chat05b-missed-scheduler");
  const missedCaps = await issueSocialVoteCapabilities(base, missedSchedulerVote.battle, socialPeople.slice(0, 1));
  const durableHuman = await request(base, "POST", `/v1/battles/${missedSchedulerVote.battle.battleId}/votes`,
    missedCaps[0].token, { choice: "B" });
  assert.equal(durableHuman.status, 200, JSON.stringify(durableHuman));
  const humanRowsBeforeRestart = query(`SELECT vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms
    FROM gameplay_social_ballots WHERE vote_id='${missedSchedulerVote.voteId}' ORDER BY person_id`);
  assert.equal(humanRowsBeforeRestart.length, 1);
  await restartApi();
  await setTestClock(base, missedSchedulerVote.session.deadline_at_ms + 1);
  const recoveredMissedCron = await request(base, "GET", `/v1/battles/${missedSchedulerVote.battle.battleId}/votes`, missedCaps[0].token);
  assert.equal(recoveredMissedCron.status, 200);
  assert.equal(recoveredMissedCron.voteStatus, "closed");
  assert.equal(recoveredMissedCron.humanVotes, 1);
  assert.equal(recoveredMissedCron.npcVotes, 6);
  assert.deepEqual(query(`SELECT vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms
    FROM gameplay_social_ballots WHERE vote_id='${missedSchedulerVote.voteId}' ORDER BY person_id`), humanRowsBeforeRestart,
    "restart recovery must preserve every existing human ballot byte-for-byte");
  await setTestClock(base, null);
  console.log("PASS: open human ballot survives Worker restart; request-path catch-up closes after missed scheduler without changing human rows");

  console.log("LOCAL_D1_SYNC_DIAGNOSTICS", JSON.stringify({ ...d1SyncStats,
    worker: { pid: worker?.pid ?? null, exitCode: worker?.exitCode ?? null,
      signalCode: worker?.signalCode ?? null, killed: worker?.killed ?? null },
  }));
  console.log("CHAT03B2_LOCAL_PRIVATE_API_PASS (NOT PRODUCTION_AUTH_PASS)");
} catch (error) {
  console.error("CHAT03B2_LOCAL_PRIVATE_API_FAIL", error);
  process.exitCode = 1;
} finally {
  if (worker && worker.exitCode === null) worker.kill("SIGTERM");
  try { rmSync(dir, { recursive: true, force: true }); }
  catch (error) { console.error("SCRATCH_CLEANUP_WARNING", error.message); }
}
