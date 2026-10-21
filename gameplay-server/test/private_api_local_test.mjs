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
async function request(base, method, route, token, body, origin) {
  const headers = {};
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
async function create(base, name) {
  const r = await request(base, "POST", "/v1/admin/battles", admin, {
    participants: {
      A: { id: name + "-A", role: "citizen" },
      B: { id: name + "-B", role: "citizen" },
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r));
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
  const fixtureSql = `INSERT INTO gameplay_create_battle
    (battle_id,initial_state_json,creation_event_json,trusted_now_ms)
    VALUES (${sqlq(expiredId)},${sqlq(JSON.stringify(origin.state))},
            ${sqlq(JSON.stringify(origin.state.events[0]))},0);
    INSERT INTO gameplay_battle_capabilities
    (battle_id,side,participant_id,token_sha256,created_at_ms)
    VALUES (${sqlq(expiredId)},'A','expired-A',${sqlq(digest)},0);`;
  const fixturePath = path.join(dir, "expired-fixture.sql");
  writeFileSync(fixturePath, fixtureSql);
  migrate(fixturePath);
  console.log("PASS: both D1 migrations and expired genesis fixture");
  const port = await pickPort();
  const base = "http://127.0.0.1:" + port;
  const args = [
    "dev", "--test-scheduled", "--config", cfg, "--ip", "127.0.0.1", "--port", String(port),
    "--persist-to", dir,
    "--var", "ADMIN_CONTROL_TOKEN:" + admin,
    "--var", "COMMIT_WINDOW_MS:60000",
    "--var", "ALLOWED_ORIGIN:https://game.example.test",
  ];
  function spawnApi() {
    const child = spawn(cli, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
    for (const stream of [child.stdout, child.stderr]) {
      stream.setEncoding("utf8");
      stream.on("data", v => { logs = (logs + v).slice(-30000); });
    }
    return child;
  }
  worker = spawnApi();
  await start(base);

  const denyAdmin = await request(base, "POST", "/v1/admin/battles", "not-the-admin", {});
  assert.equal(denyAdmin.status, 401);
  const battle = await create(base, "alpha");
  assert.equal((await request(base, "GET", "/v1/battles/" + battle.battleId)).status, 401);
  assert.equal((await get(base, battle, battle.capabilities.A.token)).version, 0);
  const originBlocked = await request(base, "GET", "/v1/battles/" + battle.battleId,
    battle.capabilities.A.token, null, "https://evil.example.test");
  assert.equal(originBlocked.status, 403);
  console.log("PASS: admin bootstrap, isolated player tokens and forbidden origins");

  const invalidSpoof = await commit(base, battle, "A", "command-spoof", { actorId: "alpha-B" });
  assert.equal(invalidSpoof.status, 400);
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

  const aReplay = await commit(base, battle, "A", "command-alpha-A");
  assert.equal(aReplay.status, 200);
  assert.equal(aReplay.replayed, true);
  const badReplay = await commit(base, battle, "A", "command-alpha-A", {
    selection: { ...selection, attackColor: "o" },
  });
  assert.equal(badReplay.status, 409);
  console.log("PASS: idempotent replay across devices and changed-command rejection");

  const b = await commit(base, battle, "B", "command-alpha-B");
  assert.equal(b.status, 200, JSON.stringify(b));
  const publicA = await get(base, battle, battle.capabilities.A.token);
  const publicB = await get(base, battle, battle.capabilities.B.token);
  assert.equal(publicA.revealed, true, JSON.stringify(publicA));
  assert.equal(publicB.revealed, true, JSON.stringify(publicB));
  assert.ok(publicA.version >= 3 && publicB.version >= 3);
  console.log("PASS: two real lifecycle commits and trusted automatic reveal");

  // Simulate process exit after a durable commit, then reconnect with the
  // same bearer capability and replay the original command safely.
  const beforeRestart = worker;
  beforeRestart.kill("SIGTERM");
  await new Promise(resolve => beforeRestart.once("close", resolve));
  worker = spawnApi();
  await start(base);
  const afterRestart = await get(base, battle, battle.capabilities.A.token);
  assert.equal(afterRestart.revealed, true);
  const replayAfterRestart = await commit(base, battle, "A", "command-alpha-A");
  assert.equal(replayAfterRestart.status, 200, JSON.stringify(replayAfterRestart));
  assert.equal(replayAfterRestart.replayed, true);
  console.log("PASS: Worker restart, durable reconnect and original receipt replay");

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

  const cronUrl = base + "/cdn-cgi/local/scheduled?format=json";
  const firstCron = await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
  assert.equal(firstCron.status, 200, "local scheduled handler unavailable");
  const expired = await get(base, { battleId: expiredId }, expiryToken);
  assert.equal(expired.status, 200, JSON.stringify(expired));
  assert.equal(expired.phase, "expired", JSON.stringify(expired));
  assert.equal(expired.version, 1);
  const secondCron = await fetch(cronUrl, { signal: AbortSignal.timeout(9000) });
  assert.equal(secondCron.status, 200);
  const after = await get(base, { battleId: expiredId }, expiryToken);
  assert.equal(after.phase, "expired");
  assert.equal(after.version, 1);
  console.log("PASS: scheduled timeout/no-show once, repeated cron has no new transition");

  console.log("CHAT03B2_LOCAL_PRIVATE_API_PASS (NOT PRODUCTION_AUTH_PASS)");
} catch (error) {
  console.error("CHAT03B2_LOCAL_PRIVATE_API_FAIL", error);
  process.exitCode = 1;
} finally {
  if (worker && worker.exitCode === null) worker.kill("SIGTERM");
  try { rmSync(dir, { recursive: true, force: true }); }
  catch (error) { console.error("SCRATCH_CLEANUP_WARNING", error.message); }
}
