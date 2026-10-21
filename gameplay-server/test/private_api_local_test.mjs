// Reproducible PRIVATE local workerd/D1 API integration. No real Cloudflare
// credentials, no telemetry binding and no public Worker deployment.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  console.log("PASS: both D1 migrations loaded in isolated local DB");
  const port = await pickPort();
  const base = "http://127.0.0.1:" + port;
  worker = spawn(cli, [
    "dev", "--config", cfg, "--ip", "127.0.0.1", "--port", String(port),
    "--persist-to", dir,
    "--var", "ADMIN_CONTROL_TOKEN:" + admin,
    "--var", "COMMIT_WINDOW_MS:60000",
    "--var", "ALLOWED_ORIGIN:https://game.example.test",
  ], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
  for (const stream of [worker.stdout, worker.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", v => { logs = (logs + v).slice(-30000); });
  }
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

  console.log("CHAT03B2_LOCAL_PRIVATE_API_PASS (NOT PRODUCTION_AUTH_PASS)");
} catch (error) {
  console.error("CHAT03B2_LOCAL_PRIVATE_API_FAIL", error);
  process.exitCode = 1;
} finally {
  if (worker && worker.exitCode === null) worker.kill("SIGTERM");
  try { rmSync(dir, { recursive: true, force: true }); }
  catch (error) { console.error("SCRATCH_CLEANUP_WARNING", error.message); }
}
