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

test("no credentials or approval means no network provisioning", () => {
  const filename = fileURLToPath(new URL("./remote_d1_ephemeral.mjs", import.meta.url));
  const child = spawnSync(process.execPath, [filename], {
    env: { PATH: process.env.PATH, CHAT03B1_REMOTE_D1_APPROVED: "NO" },
    encoding: "utf8", timeout: 7000,
  });
  assert.notEqual(child.status, 0);
  assert.match(child.stderr || "", /BLOCKED_AUTH/);
  assert.doesNotMatch(child.stdout || "", /Provisioning isolated/);
});
