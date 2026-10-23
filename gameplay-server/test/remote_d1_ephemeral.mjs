// Retired Chat03B1 hosted D1 runner. This module keeps offline SQL fixture
// helpers for tests; invoking it as a CLI always fails closed.

import assert from "node:assert/strict";
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
    commits: {},
    events: [{
      eventId: id + ":v0:battle.created", battleId: id, version: 0,
      type: "battle.created", payload: { rulesVersion: "tactical_v1" },
    }],
    commandReceipts: {},
  };
}
export function createSql(state) {
  assert.match(state.battleId, /^scratch-[a-z0-9-]+$/);
  return `INSERT INTO gameplay_create_battle
    (battle_id, initial_state_json, creation_event_json, trusted_now_ms)
    VALUES (${quoteSql(state.battleId)},${quoteSql(JSON.stringify(state))},
    ${quoteSql(JSON.stringify(state.events[0]))},0)`;
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.error("LEGACY_HOSTED_RUNNER_DISABLED: retired; use the separately authorized Chat03B2 preflight only after its integration is complete.");
  process.exitCode = 1;
}
