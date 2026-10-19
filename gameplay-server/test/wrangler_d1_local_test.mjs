// Executes the committed migration through Wrangler's local D1 engine and
// drives its D1 Worker binding. NEVER uses --remote or production credentials.
// This does not prove real remote Cloudflare D1 behavior.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const cli = process.env.WRANGLER_BIN ?? path.resolve(root, "../node_modules/.bin/wrangler");
const cfg = "wrangler.local-test.jsonc";
const persist = mkdtempSync(path.join(os.tmpdir(), "asynchronia-chat03b1-d1-"));
const env = { ...process.env, WRANGLER_SEND_METRICS: "false", NO_D1_WARNING: "true" };
let worker;
let logs = "";

async function pickPort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function genesis(id) {
  return {
    schemaVersion: 1,
    battleId: id,
    version: 0,
    rulesVersion: "tactical_v1",
    phase: "created",
    createdAt: 0,
    deadlineAt: 1000,
    participants: { A: { id: "A" }, B: { id: "B" } },
    commits: {},
    events: [],
  };
}

function event(id, version = 1) {
  return {
    eventId: id,
    version,
    type: "battle.selection_committed",
    payload: { side: "A" },
  };
}

function makeTransition(state, commandId, events = [], receiptEventIds = events.map((e) => e.eventId)) {
  return {
    battleId: state.battleId,
    expectedVersion: state.version,
    commandId,
    fingerprint: "fingerprint:" + commandId,
    trustedNowMs: 123,
    nextState: { ...state, version: state.version + 1, phase: "waiting" },
    events,
    receiptEventIds,
  };
}

async function request(base, route, data) {
  const res = await fetch(base + route, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(8000),
  });
  const json = await res.json();
  return { status: res.status, ...json };
}

async function check(base, id, version, receipts, outbox) {
  const result = await request(base, "/inspect", { battleId: id });
  assert.equal(result.status, 200, JSON.stringify(result));
  assert.equal(result.row.version, version);
  assert.equal(result.row.receiptCount, receipts);
  assert.equal(result.row.outboxCount, outbox);
  assert.equal(JSON.parse(result.row.stateJson).version, version);
}

async function health(base) {
  for (let i = 0; i < 120; i++) {
    if (worker.exitCode !== null) throw Error("wrangler dev exited: " + logs.slice(-5000));
    try {
      const response = await fetch(base + "/health", { signal: AbortSignal.timeout(300) });
      if (response.ok) return;
    } catch { /* workerd still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw Error("Wrangler local D1 did not start: " + logs.slice(-5000));
}

try {
  const migration = spawnSync(cli, [
    "d1", "execute", "DB", "--local", "--config", cfg,
    "--file", "migrations/0001_tactical_state.sql",
    "--persist-to", persist, "--yes",
  ], { cwd: root, env, encoding: "utf8", timeout: 60000 });
  if (migration.error || migration.status !== 0) {
    throw Error("WRANGLER_D1_MIGRATION_FAILURE " +
      String(migration.error || "") + "\n" +
      (migration.stdout || "").slice(-9000) + "\n" + (migration.stderr || "").slice(-9000));
  }
  console.log("PASS: committed SQL migration loaded in Wrangler local D1 engine");

  const port = await pickPort();
  const base = "http://127.0.0.1:" + port;
  worker = spawn(cli, [
    "dev", "--config", cfg, "--ip", "127.0.0.1",
    "--port", String(port), "--persist-to", persist,
  ], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
  for (const stream of [worker.stdout, worker.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", (data) => { logs = (logs + data).slice(-30000); });
  }
  await health(base);
  console.log("PASS: local workerd Worker D1 binding initialized");

  const good = genesis("wrangler-valid");
  assert.equal((await request(base, "/create", { state: good })).status, 200);
  const e1 = event("valid:e1");
  const e2 = event("valid:e2");
  const accepted = await request(base, "/apply",
    makeTransition(good, "valid-command", [e1, e2], ["valid:e2", "valid:e1"]));
  assert.equal(accepted.status, 200, JSON.stringify(accepted));
  await check(base, good.battleId, 1, 1, 2);
  console.log("PASS: D1 Worker binding CAS + receipt/outbox + unordered bijection");

  const stale = await request(base, "/apply", makeTransition(good, "stale-command"));
  assert.equal(stale.status, 409, JSON.stringify(stale));
  await check(base, good.battleId, 1, 1, 2);
  console.log("PASS: stale version rejected atomically");

  const duplicate = genesis("wrangler-duplicate");
  assert.equal((await request(base, "/create", { state: duplicate })).status, 200);
  const invalidIds = await request(base, "/apply", makeTransition(
    duplicate, "dupe-receipt", [event("dupe:e1"), event("dupe:e2")], ["dupe:e1", "dupe:e1"]));
  assert.equal(invalidIds.status, 409, JSON.stringify(invalidIds));
  await check(base, duplicate.battleId, 0, 0, 0);
  console.log("PASS: duplicate/omitted receipt IDs rollback all three tables");

  const version = genesis("wrangler-forged-version");
  assert.equal((await request(base, "/create", { state: version })).status, 200);
  const forged = await request(base, "/apply", makeTransition(version,
    "forged-event-version", [event("version:event", 999)]));
  assert.equal(forged.status, 409, JSON.stringify(forged));
  await check(base, version.battleId, 0, 0, 0);
  console.log("PASS: forged outbox version rejected atomically");

  const race = genesis("wrangler-race");
  assert.equal((await request(base, "/create", { state: race })).status, 200);
  const contenders = await Promise.all([
    request(base, "/apply", makeTransition(race, "race-A")),
    request(base, "/apply", makeTransition(race, "race-B")),
  ]);
  assert.equal(contenders.filter((x) => x.status === 200).length, 1, JSON.stringify(contenders));
  assert.equal(contenders.filter((x) => x.status === 409).length, 1, JSON.stringify(contenders));
  await check(base, race.battleId, 1, 1, 0);
  console.log("PASS: concurrent same-version D1 Worker submissions have exactly one winner");

  console.log("WRANGLER_LOCAL_D1_PASS (NOT REMOTE_D1_PASS)");
} catch (error) {
  console.error("WRANGLER_LOCAL_D1_FAIL", error);
  process.exitCode = 1;
} finally {
  if (worker && worker.exitCode === null) worker.kill("SIGTERM");
  // Do not persist synthetic battle payloads outside this test execution.
  try { rmSync(persist, { recursive: true, force: true }); }
  catch (error) { console.error("Cleanup warning:", error.message); }
}
