import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  SCRATCH_PREFIX, quoteSql, initialState, createSql, transitionSql, probeEvent,
} from "./remote_d1_ephemeral.mjs";

test("remote test always provisions unique scratch name prefix", () => {
  assert.equal(SCRATCH_PREFIX, "asynchronia-chat03b1-scratch-");
});

test("SQL escaping is safe for internal synthetic fixture strings", () => {
  assert.equal(quoteSql("a'b"), "'a''b'");
  assert.throws(() => quoteSql(123));
});

test("synthetic battle cannot refer to telemetry or arbitrary DB state", () => {
  assert.throws(() => createSql(initialState("telemetry_events")));
  assert.match(createSql(initialState("scratch-test")), /gameplay_create_battle/);
});

test("transition request includes version and exact receipt/outbox fixture", () => {
  const state = initialState("scratch-test");
  const e = probeEvent("evt");
  const sql = transitionSql(state, "commit-a", [e.eventId], [e]);
  assert.match(sql, /gameplay_apply_transition/);
  assert.match(sql, /"eventId":"evt"/);
  assert.match(sql, /"version":1/);
  assert.match(sql, /'fp:commit-a'/);
  assert.throws(() => transitionSql(state, "bad command"));
  assert.throws(() => transitionSql(state, "good", [], [], 0.5));
});

test("legacy CLI fails closed with synthetic valid credentials and never calls fetch", () => {
  const filename = fileURLToPath(new URL("./remote_d1_ephemeral.mjs", import.meta.url));
  const fetchTrap = "globalThis.fetch = async () => { throw new Error('NETWORK_ATTEMPT') }";
  const child = spawnSync(process.execPath, [
    "--import", `data:text/javascript,${encodeURIComponent(fetchTrap)}`, filename,
  ], {
    env: {
      PATH: process.env.PATH,
      CLOUDFLARE_ACCOUNT_ID: "0123456789abcdef0123456789abcdef",
      CLOUDFLARE_API_TOKEN: "synthetic-valid-looking-token-for-offline-test",
      CLOUDFLARE_API_KEY: "synthetic-valid-looking-key-for-offline-test",
      CLOUDFLARE_EMAIL: "synthetic@example.invalid",
      CHAT03B1_REMOTE_D1_APPROVED: "YES",
      WRANGLER_BIN: "/synthetic/wrangler",
    },
    encoding: "utf8", timeout: 7000,
  });
  assert.equal(child.status, 1, child.stderr || child.stdout);
  assert.match(child.stderr || "", /LEGACY_HOSTED_RUNNER_DISABLED/);
  assert.doesNotMatch(child.stderr || "", /synthetic-valid-looking|synthetic@example/);
  assert.doesNotMatch(child.stderr || "", /NETWORK_ATTEMPT/);
  assert.doesNotMatch(child.stdout || "", /Provisioning isolated|HOSTED_D1_SQL_CAS_PASS/);
});
