"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const modulePath = path.join(__dirname, "..", "AsyncScene", "Web", "conflict", "tactical-lifecycle.js");
const source = fs.readFileSync(modulePath, "utf8");
function loadStandalone(file) {
  const sandbox = { module: { exports: {} } };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: path.basename(file) });
  return sandbox.module.exports;
}
const resolver = loadStandalone(path.join(__dirname, "..", "AsyncScene", "Web", "conflict", "tactical-resolver.js"));
const lifecycleModule = loadStandalone(modulePath);
let resolverCalls = 0;
const countedResolver = {
  resolve(...args) {
    resolverCalls++;
    return resolver.resolve(...args);
  }
};
const lifecycle = lifecycleModule.createLifecycle(countedResolver);
let assertions = 0;
function check(value, message) { assert.ok(value, message); assertions++; }
function equal(actual, expected, message) {
  const normalize = value => value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
  assert.deepStrictEqual(normalize(actual), normalize(expected), message);
  assertions++;
}
function rejected(result, code, message) {
  check(result.ok === false && result.error === code, message + ": " + JSON.stringify(result));
}
function selection(attackColor, defenseColor, role = "citizen", attackType = "N", defenseType = "C") {
  return { attackColor, defenseColor, attackType, defenseType, role };
}
function created(id = "battle-test", deadlineAt = 1000) {
  const result = lifecycle.createBattle({
    battleId: id,
    createdAt: 0,
    deadlineAt,
    participants: { A: { id: "player-a", role: "citizen" }, B: { id: "player-b", role: "citizen" } }
  });
  check(result.ok, "battle creates");
  return result.state;
}
function command(state, commandId, type, participantId, payload = {}, at = 10, expectedVersion = state.version) {
  return {
    commandId, type, participantId, expectedVersion, at,
    ...payload
  };
}
function apply(state, cmd) {
  const result = lifecycle.execute(state, cmd);
  check(result.ok, cmd.type + " succeeds: " + JSON.stringify(result));
  return result.state;
}
function commit(state, side, choice, id = "commit-" + side, at = 10) {
  const participantId = side === "A" ? "player-a" : "player-b";
  return apply(state, command(state, id, "commit", participantId, { selection: choice }, at));
}
function assertRoundTrip(state, phase) {
  const serialized = lifecycle.serialize(state);
  check(typeof serialized === "string", phase + " serializes");
  const restored = lifecycle.restore(serialized);
  check(restored.ok, phase + " restores: " + JSON.stringify(restored));
  equal(restored.state, state, phase + " round trip preserves complete internal state");
  return restored.state;
}

check(typeof lifecycleModule.persistenceAdapterContract.compareAndSwap === "string",
  "future atomic persistence adapter contract is exported");
check(lifecycleModule.persistenceAdapterContract.requirements.some(item => item.includes("localStorage")),
  "adapter contract explicitly prohibits localStorage");

// A commits first. B's choice and mechanics stay private until both commits and reveal.
{
  const a = selection("y", "y");
  const b = selection("r", "o");
  let state = created("a-first");
  equal(state.version, 0, "created state starts at version zero");
  equal(state.phase, "created", "initial phase is created");
  state = assertRoundTrip(state, "created");
  state = commit(state, "A", a);
  equal(state.phase, "waiting", "first independent commit waits for opponent");
  state = assertRoundTrip(state, "waiting");
  const viewA = lifecycle.getPublicView(state, "player-a");
  const viewB = lifecycle.getPublicView(state, "player-b");
  check(viewA.selfCommitted && !viewA.opponentCommitted, "A view reports only public commit status");
  check(!viewB.selfCommitted && viewB.opponentCommitted, "B view reports opposite commit status");
  for (const view of [viewA, viewB]) {
    check(!Object.hasOwn(view, "selections") && !Object.hasOwn(view, "resolution") &&
      !Object.hasOwn(view, "mechanicalOutcome"), "pre-reveal participant view has no hidden choices or outcome");
    check(!JSON.stringify(view).includes('"attackColor"'), "pre-reveal view contains no selection fields");
  }
  equal(resolverCalls, 0, "resolver has not run after one commit");
  const early = lifecycle.execute(state, command(state, "early-reveal", "reveal", null));
  rejected(early, "REVEAL_NOT_READY", "reveal cannot happen before the second commit");
  equal(early.state, undefined, "rejected reveal does not return a mutated state");
  equal(resolverCalls, 0, "early reveal does not call resolver");
  state = commit(state, "B", b);
  equal(state.phase, "committed", "second commit moves to committed phase");
  state = assertRoundTrip(state, "committed");
  equal(resolverCalls, 0, "resolver has not run merely because both committed");
  const revealCommand = command(state, "reveal-a-first", "reveal", null);
  const reveal = lifecycle.execute(state, revealCommand);
  check(reveal.ok && reveal.code === "FINALIZED", "reveal finalizes after both commits");
  state = reveal.state;
  equal(state.phase, "final", "reveal transitions to final");
  equal(resolverCalls, 1, "resolver is called exactly once for first reveal");
  equal(state.mechanicalOutcome, state.resolution.mechanicalOutcome, "stored outcome is resolver outcome");
  state = assertRoundTrip(state, "final");
  const publicA = lifecycle.getPublicView(state, "player-a");
  const publicB = lifecycle.getPublicView(state, "player-b");
  check(publicA.revealed && publicB.revealed, "both participants see reveal after finalization");
  equal(publicA.selections, { A: a, B: b }, "A sees both selections after reveal");
  equal(publicB.resolution, state.resolution, "B sees the same mechanical result after reveal");
  const revealEvent = state.events.filter(event => event.type === "battle.revealed");
  const finalEvents = state.events.filter(event => event.type === "battle.finalized");
  equal(revealEvent.length, 1, "one reveal event exists");
  equal(finalEvents.length, 1, "one final event exists");
  equal(new Set(state.events.map(event => event.eventId)).size, state.events.length, "event ids are unique");
  const repeatReveal = lifecycle.execute(state, revealCommand);
  check(repeatReveal.ok && repeatReveal.replayed, "same reveal command replays idempotently");
  equal(repeatReveal.state, state, "replayed reveal leaves current state unchanged");
  equal(resolverCalls, 1, "repeat reveal does not rerun resolver");
  equal(repeatReveal.eventIds, reveal.eventIds, "repeat reveal returns original event ids");
}

// B commits first; the same lifecycle semantics hold in reverse order.
{
  let state = created("b-first");
  state = commit(state, "B", selection("o", "y"), "b-first-commit");
  equal(state.phase, "waiting", "B-first commit enters waiting");
  check(!Object.hasOwn(state.commits, "A") && Object.hasOwn(state.commits, "B"), "B can commit independently first");
  state = commit(state, "A", selection("y", "o"), "a-second-commit");
  equal(state.phase, "committed", "A second commit opens reveal stage");
  state = assertRoundTrip(state, "B-first committed");
  const revealed = lifecycle.execute(state, command(state, "b-first-reveal", "reveal", null));
  check(revealed.ok && revealed.state.phase === "final", "B-first order can reveal");
}

// Semantic duplicate commit, exact command retry, altered command-id reuse, and immutable choice.
{
  let state = created("idempotency");
  const first = command(state, "same-commit", "commit", "player-a", { selection: selection("y", "y") });
  state = apply(state, first);
  const versionAfterFirst = state.version;
  const exactRetry = lifecycle.execute(state, first);
  check(exactRetry.ok && exactRetry.replayed, "exact commandId retry returns the recorded response");
  equal(exactRetry.state, state, "exact retry does not change current state");
  equal(exactRetry.eventIds.length, 1, "exact retry points to original event");
  const alteredReuse = lifecycle.execute(state, {
    ...first,
    selection: selection("o", "o"),
    expectedVersion: state.version
  });
  rejected(alteredReuse, "COMMAND_ID_REUSE", "same commandId with different content is rejected");
  equal(alteredReuse.state, undefined, "altered command-id reuse cannot mutate state");
  const sameChoice = lifecycle.execute(state, command(state, "duplicate-commit", "commit", "player-a", {
    selection: selection("y", "y")
  }));
  check(sameChoice.ok && sameChoice.code === "ALREADY_COMMITTED", "same selection under a new id is idempotent");
  equal(sameChoice.state.commits.A.selection, selection("y", "y"), "repeat commit preserves original selection");
  equal(sameChoice.state.events.filter(event => event.type === "battle.selection_committed").length, 1,
    "repeat commit does not duplicate commit event");
  const beforeMutation = JSON.stringify(sameChoice.state);
  const changed = lifecycle.execute(sameChoice.state, command(sameChoice.state, "attempt-change", "commit", "player-a", {
    selection: selection("r", "r")
  }));
  rejected(changed, "COMMIT_IMMUTABLE", "participant cannot change confirmed selection");
  equal(JSON.stringify(sameChoice.state), beforeMutation, "rejected commit mutation leaves state byte-identical");
  check(sameChoice.state.version > versionAfterFirst, "distinct idempotent command receipt is versioned");
}

// Expected-version conflict has no side effect; stale retries with known command ids still replay.
{
  let state = created("versioning");
  state = commit(state, "A", selection("y", "y"), "versioned-A");
  const stale = lifecycle.execute(state, command(state, "stale-B", "commit", "player-b", {
    selection: selection("o", "o")
  }, 20, 0));
  rejected(stale, "VERSION_CONFLICT", "stale expected version is rejected");
  equal(stale.state, undefined, "version conflict returns no changed state");
  equal(state.version, 1, "version conflict does not advance state");
}

// Timeout is deterministic at each waiting stage and never implies a winner or a mechanical result.
{
  let state = created("timeout-created", 100);
  const early = lifecycle.execute(state, command(state, "early-expire", "expire", null, {}, 99));
  rejected(early, "DEADLINE_NOT_REACHED", "timeout before deadline is rejected");
  state = assertRoundTrip(state, "pre-timeout created");
  const expireCommand = command(state, "expire-created", "expire", null, {}, 100);
  const timed = lifecycle.execute(state, expireCommand);
  check(timed.ok && timed.code === "TIMED_OUT", "created battle expires at exact deadline");
  state = timed.state;
  equal(state.phase, "expired", "created timeout enters expired phase");
  equal(state.expiredStage, "created", "created timeout records its stage");
  equal(state.missingParticipants, ["player-a", "player-b"], "created timeout identifies both missing participants");
  equal(state.mechanicalOutcome, null, "no-show timeout assigns no mechanical winner");
  equal(state.events.filter(event => event.type === "battle.finalized").length, 0, "timeout emits no final outcome event");
  state = assertRoundTrip(state, "expired created");
  const repeat = lifecycle.execute(state, expireCommand);
  check(repeat.ok && repeat.replayed, "timeout command retry replays");
  equal(state.events.filter(event => event.type === "battle.timed_out").length, 1, "timeout event is emitted once");
}
{
  let state = created("timeout-waiting", 100);
  state = commit(state, "A", selection("y", "y"), "timeout-waiting-A", 20);
  const timed = lifecycle.execute(state, command(state, "expire-waiting", "expire", null, {}, 101));
  check(timed.ok && timed.state.expiredStage === "waiting", "timeout after one commit records waiting stage");
  equal(timed.state.missingParticipants, ["player-b"], "timeout after one commit names only missing participant");
  equal(timed.state.mechanicalOutcome, null, "partial-commit timeout does not calculate outcome");
  state = assertRoundTrip(timed.state, "expired waiting");
}
{
  let state = created("timeout-committed", 100);
  state = commit(state, "A", selection("y", "y"), "timeout-committed-A", 20);
  state = commit(state, "B", selection("r", "r"), "timeout-committed-B", 30);
  const timed = lifecycle.execute(state, command(state, "expire-committed", "expire", null, {}, 100));
  check(timed.ok && timed.state.expiredStage === "committed", "both commits without reveal expire deterministically");
  equal(timed.state.missingParticipants, [], "both-committed timeout has no missing participant");
  equal(timed.state.mechanicalOutcome, null, "timeout before reveal does not invoke mechanics");
  equal(resolverCalls, 2, "only two explicit reveal scenarios above invoked resolver");
  state = assertRoundTrip(timed.state, "expired committed");
  const lateReveal = lifecycle.execute(state, command(state, "late-reveal", "reveal", null, {}, 110));
  rejected(lateReveal, "BATTLE_EXPIRED", "expired battle cannot reveal");
}

// Deadline check precedes late commits, with a stable timeout event and no implicit victory.
{
  let state = created("late-commit", 50);
  const late = lifecycle.execute(state, command(state, "commit-at-deadline", "commit", "player-a", {
    selection: selection("y", "y")
  }, 50));
  check(late.ok && late.code === "TIMED_OUT", "commit at deadline deterministically expires first");
  equal(late.state.phase, "expired", "late commit does not enter waiting");
  equal(late.state.commits, {}, "late commit is not stored");
  equal(late.state.mechanicalOutcome, null, "late commit does not assign a winner");
}

// Creation and restored participant views are independent copies; unknown users see no private state.
{
  const state = created("view-isolation");
  rejected(lifecycle.getPublicView(state, "intruder"), "UNKNOWN_PARTICIPANT", "unknown participant has no view");
  const snapshot = lifecycle.getInternalSnapshot(state);
  check(snapshot.ok, "trusted internal snapshot is available for serialization adapter");
  snapshot.state.participants.A.id = "mutated-copy";
  equal(state.participants.A.id, "player-a", "internal snapshot is detached from owned state");
}

// Standalone browser-style evaluation has no active runtime, storage, clock, timers, RNG or network access.
{
  const sandbox = {};
  sandbox.globalThis = sandbox;
  for (const name of ["document", "window", "localStorage", "fetch", "setTimeout", "Date"]) {
    Object.defineProperty(sandbox, name, { get() { throw new Error(name + " accessed"); } });
  }
  Object.defineProperty(sandbox, "Math", {
    get() { throw new Error("Math/RNG accessed"); }
  });
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "tactical-lifecycle.js" });
  check(typeof sandbox.TacticalCombatLifecycleV1.createLifecycle === "function",
    "browser-style load exports only the standalone lifecycle factory");
  check(!sandbox.Game, "module does not create or connect active Game runtime");
}

console.log("PASS tactical lifecycle v1: " + assertions + " assertions; deterministic state, timeout, idempotency, privacy, replay, and restore.");
