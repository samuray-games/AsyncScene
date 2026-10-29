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
const lifecycle = lifecycleModule.createLifecycle({
  resolve(...args) { resolverCalls++; return resolver.resolve(...args); }
});
let assertions = 0;
function check(value, message) { assert.ok(value, message); assertions++; }
function equal(actual, expected, message) {
  const norm = value => value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
  assert.deepStrictEqual(norm(actual), norm(expected), message);
  assertions++;
}
function rejects(result, code, message) {
  check(!result.ok && result.error === code, message + ": " + JSON.stringify(result));
}
function selection(attackColor, defenseColor, role = "citizen", attackType = "N", defenseType = "C") {
  return { attackColor, defenseColor, attackType, defenseType, role };
}
function create(id = "battle-test", deadlineAt = 100) {
  const result = lifecycle.createBattle({
    battleId: id, createdAt: 0, deadlineAt,
    participants: { A: { id: "player-a", role: "citizen" }, B: { id: "player-b", role: "citizen" } }
  });
  check(result.ok, "battle creates");
  return result.state;
}
function cmd(state, commandId, type, actorId, data = {}, expectedVersion = state.version) {
  return { commandId, type, actorId, expectedVersion, ...data };
}
function execute(state, command, trustedNowMs = 10) {
  return lifecycle.execute(state, command, trustedNowMs);
}
function apply(state, command, now = 10) {
  const result = execute(state, command, now);
  check(result.ok, command.type + " succeeds: " + JSON.stringify(result));
  return result.state;
}
function commit(state, side, choice, commandId = "commit-" + side, now = 10) {
  const participantId = side === "A" ? "player-a" : "player-b";
  return apply(state, cmd(state, commandId, "commit", participantId, {
    participantId, selection: choice
  }), now);
}
function systemCommand(state, id, type, extra = {}) {
  return cmd(state, id, type, "system", extra);
}
function roundTrip(state, label) {
  const serialized = lifecycle.serialize(state);
  check(typeof serialized === "string", label + " serializes");
  const restored = lifecycle.restore(serialized);
  check(restored.ok, label + " restores: " + JSON.stringify(restored));
  equal(restored.state, state, label + " preserves complete state");
  return restored.state;
}
function finalizeNonDraw(state, id, now = 500) {
  check(state.phase === "revealed" && state.mechanicalOutcome !== "DRAW", "fixture is eligible for explicit finalization");
  return execute(state, systemCommand(state, id, "finalize", {
    recognizedOutcome: state.mechanicalOutcome
  }), now);
}

check(typeof lifecycleModule.persistenceAdapterContract.compareAndSwap === "string",
  "future atomic persistence adapter is described");
const contract = lifecycleModule.persistenceAdapterContract.requirements.join(" ");
check(contract.includes("trustedNowMs") && contract.includes("excluded from the commandId fingerprint"),
  "trusted clock and clock-independent retry contract are explicit");

// Timely independent commits survive the commit deadline; reveal and finalization are separate transitions.
{
  const a = selection("y", "y");
  const b = selection("r", "o");
  let state = create("timely-after-deadline", 100);
  state = roundTrip(state, "created");
  state = commit(state, "A", a, "timely-A", 90);
  state = roundTrip(state, "waiting");
  const viewBefore = lifecycle.getPublicView(state, "player-b");
  check(!Object.hasOwn(viewBefore, "selections") && !Object.hasOwn(viewBefore, "mechanicalOutcome"),
    "unrevealed participant view does not leak choices or mechanics");
  const earlyReveal = execute(state, systemCommand(state, "reveal-early", "reveal"), 95);
  rejects(earlyReveal, "REVEAL_NOT_READY", "reveal before second commit is rejected");
  equal(earlyReveal.state, undefined, "rejected reveal has no mutated state");
  state = commit(state, "B", b, "timely-B", 99);
  equal(state.phase, "committed", "second timely commit closes commit window");
  state = roundTrip(state, "committed");
  const revealCommand = systemCommand(state, "reveal-after-deadline", "reveal");
  const revealed = execute(state, revealCommand, 500);
  check(revealed.ok && revealed.code === "REVEALED", "deadline does not expire two timely commits");
  state = revealed.state;
  equal(state.phase, "revealed", "reveal is not finalization");
  equal(state.mechanicalOutcome, state.resolution.mechanicalOutcome, "reveal stores one mechanical result");
  equal(state.events.filter(event => event.type === "battle.finalized").length, 0,
    "mechanical reveal emits no final event");
  equal(resolverCalls, 1, "resolver runs exactly once at reveal");
  state = roundTrip(state, "revealed");
  const view = lifecycle.getPublicView(state, "player-a");
  check(view.revealed, "public view marks revealed phase");
  equal(view.selections, { A: a, B: b }, "public view exposes both choices only after reveal");
  const repeatReveal = execute(state, revealCommand, 900);
  check(repeatReveal.ok && repeatReveal.replayed, "reveal retry uses stable request body despite new clock");
  equal(repeatReveal.state, state, "replayed reveal does not mutate state");
  equal(resolverCalls, 1, "reveal retry does not calculate mechanics again");

  const finalized = finalizeNonDraw(state, "finalize-explicitly");
  check(finalized.ok && finalized.code === "FINALIZED", "non-draw requires a separate explicit finalization");
  equal(finalized.state.phase, "final", "explicit recognition gate transitions to final");
  const finalEvents = finalized.state.events.filter(event => event.type === "battle.finalized");
  equal(finalEvents.length, 1, "one final event is emitted");
  equal(finalEvents[0].eventId, "timely-after-deadline:final", "final event id is battle-stable");
  equal(finalEvents[0].version, finalized.state.version, "event records transition version separately");
  roundTrip(finalized.state, "final");
}

// B can commit first; the mechanical draw remains revealed/pending and cannot be made final by this atom.
{
  let state = create("b-first-draw");
  state = commit(state, "B", selection("y", "y"), "B-first", 20);
  equal(state.phase, "waiting", "B may commit first");
  state = commit(state, "A", selection("y", "y"), "A-second", 30);
  const reveal = execute(state, systemCommand(state, "draw-reveal", "reveal"), 200);
  check(reveal.ok, "draw mechanics can be revealed after commit deadline");
  state = reveal.state;
  equal(state.phase, "revealed", "DRAW does not automatically become FINAL");
  equal(state.mechanicalOutcome, "DRAW", "mechanical draw remains immutable");
  equal(state.socialOutcome, "PENDING", "draw social gate remains pending");
  equal(state.recognizedOutcome, "PENDING", "recognized outcome remains pending");
  equal(state.events.filter(event => event.type === "battle.finalized").length, 0,
    "DRAW reveal has no finalization event");
  const finishDraw = execute(state, systemCommand(state, "draw-finalize", "finalize", {
    recognizedOutcome: "DRAW"
  }), 250);
  rejects(finishDraw, "FINALIZATION_GATE_REQUIRED", "DRAW requires an external approved recognition gate");
  equal(JSON.stringify(finishDraw.state), undefined, "rejected draw finalization returns no mutated state");
  equal(state.phase, "revealed", "rejected draw finalization preserves revealed state");
  roundTrip(state, "draw awaiting recognition");
}

// Auth, command type, payload, and expected version are validated before any timeout side effect.
{
  const invalidCases = [
    [cmd(create("invalid-unknown", 50), "bad-type", "not-a-command", "attacker"), "UNKNOWN_COMMAND"],
    [cmd(create("invalid-actor", 50), "bad-actor", "commit", "attacker", {
      participantId: "player-a", selection: selection("y", "y")
    }), "ACTOR_MISMATCH"],
    [cmd(create("invalid-selection", 50), "bad-selection", "commit", "player-a", {
      participantId: "player-a", selection: { attackColor: "invalid" }
    }), "INVALID_SELECTION"],
    [cmd(create("invalid-field", 50), "client-time", "commit", "player-a", {
      participantId: "player-a", selection: selection("y", "y"), at: 50
    }), "UNTRUSTED_TIME_FIELD"]
  ];
  for (const [badCommand, expected] of invalidCases) {
    const before = JSON.stringify(badCommand.type === "commit" ? null : null);
    void before;
    const id = badCommand.commandId.replace("bad-", "invalid-");
    const battleId = id === "invalid-type" ? "invalid-unknown" :
      id === "invalid-actor" ? "invalid-actor" : id === "invalid-selection" ? "invalid-selection" : "invalid-field";
    const state = create(battleId, 50);
    const beforeState = JSON.stringify(state);
    const result = execute(state, badCommand, 50);
    rejects(result, expected, "invalid deadline command is rejected before timeout");
    equal(JSON.stringify(state), beforeState, "invalid command leaves state byte-identical");
    equal(result.state, undefined, "invalid command returns no transition state");
  }
  const state = create("stale-at-deadline", 50);
  const stale = execute(state, cmd(state, "stale", "commit", "player-a", {
    participantId: "player-a", selection: selection("y", "y")
  }, 4), 50);
  rejects(stale, "VERSION_CONFLICT", "stale version at deadline cannot expire state");
  equal(state.phase, "created", "version conflict leaves battle unexpired");
  const earlyExpire = execute(state, systemCommand(state, "too-soon", "expire"), 49);
  rejects(earlyExpire, "DEADLINE_NOT_REACHED", "system cannot expire before trusted deadline");
  equal(state.phase, "created", "early timeout request leaves state unchanged");
}

// Only a validated late participant commit or trusted system expiry may expire an incomplete battle.
{
  let state = create("late-commit", 50);
  const late = execute(state, cmd(state, "late-A", "commit", "player-a", {
    participantId: "player-a", selection: selection("y", "y")
  }), 50);
  check(late.ok && late.code === "TIMED_OUT", "authenticated valid late commit deterministically expires incomplete battle");
  equal(late.state.phase, "expired", "late commit does not become a stored selection");
  equal(late.state.commits, {}, "late selection is not committed");
  equal(late.state.mechanicalOutcome, null, "late commit cannot imply a winner");
  roundTrip(late.state, "late commit timeout");

  state = create("explicit-timeout", 60);
  const expiry = execute(state, systemCommand(state, "system-expire", "expire"), 60);
  check(expiry.ok && expiry.code === "TIMED_OUT", "trusted system expiry is accepted at deadline");
  equal(expiry.state.expiredStage, "created", "timeout records incomplete stage");
  equal(expiry.state.events.filter(event => event.type === "battle.timed_out").length, 1,
    "timeout emits one stable lifecycle event");
}

// Retrying a commandId ignores regenerated trusted time but rejects altered payload.
{
  let state = create("retry-clock", 100);
  const firstCommand = cmd(state, "retry-once", "commit", "player-a", {
    participantId: "player-a", selection: selection("y", "y")
  });
  state = apply(state, firstCommand, 10);
  const retry = execute(state, firstCommand, 99);
  check(retry.ok && retry.replayed, "same commandId and body replays with regenerated trusted time");
  equal(retry.state, state, "replay does not advance version");
  const changed = cmd(state, "retry-once", "commit", "player-a", {
    participantId: "player-a", selection: selection("o", "o")
  });
  rejects(execute(state, changed, 99), "COMMAND_ID_REUSE", "changed payload under commandId is rejected");
  const stale = execute(state, cmd(state, "stale-new", "commit", "player-b", {
    participantId: "player-b", selection: selection("o", "o")
  }, 0), 100);
  rejects(stale, "VERSION_CONFLICT", "clock crossing deadline does not bypass version check");
  equal(state.phase, "waiting", "retries and stale commands preserve state");
}

// Safe receipt maps support command IDs that collide with JavaScript object prototype properties.
{
  for (const id of ["__proto__", "constructor", "toString"]) {
    let state = create("special-" + id);
    const command = cmd(state, id, "commit", "player-a", {
      participantId: "player-a", selection: selection("y", "y")
    });
    state = apply(state, command);
    check(Object.prototype.hasOwnProperty.call(state.commandReceipts, id), id + " receipt is an own property");
    const restored = roundTrip(state, id + " receipt").commandReceipts;
    check(Object.prototype.hasOwnProperty.call(restored, id), id + " survives JSON restore as an own property");
    const replay = execute({ ...state, commandReceipts: restored }, command, 999);
    check(replay.ok && replay.replayed, id + " exact retry works after restore and clock change");
    equal(replay.state.version, state.version, id + " replay does not mutate state");
  }
}

// Final event identity is battleId-stable despite extra idempotent commit commands changing versions.
{
  function runWithDuplicate(intermediateDuplicate) {
    let state = create("stable-final-event");
    state = commit(state, "A", selection("y", "y"), "stable-A");
    state = commit(state, "B", selection("o", "o"), "stable-B");
    if (intermediateDuplicate) {
      state = apply(state, cmd(state, "extra-A-retry", "commit", "player-a", {
        participantId: "player-a", selection: selection("y", "y")
      }));
    }
    state = apply(state, systemCommand(state, "stable-reveal", "reveal"));
    return finalizeNonDraw(state, "stable-finalize").state;
  }
  const first = runWithDuplicate(false);
  const second = runWithDuplicate(true);
  const finalA = first.events.find(event => event.type === "battle.finalized");
  const finalB = second.events.find(event => event.type === "battle.finalized");
  equal(finalA.eventId, "stable-final-event:final", "first run uses stable terminal id");
  equal(finalB.eventId, finalA.eventId, "intermediate repeats cannot change terminal id");
  check(finalA.version !== finalB.version, "fixture actually has different intermediate versions");
}

// Standalone module has no live runtime, storage, clock, timer, RNG, or network dependency.
{
  const sandbox = {};
  sandbox.globalThis = sandbox;
  for (const name of ["document", "window", "localStorage", "fetch", "setTimeout", "Date", "Math"]) {
    Object.defineProperty(sandbox, name, { get() { throw new Error(name + " accessed"); } });
  }
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "tactical-lifecycle.js" });
  check(typeof sandbox.TacticalCombatLifecycleV1.createLifecycle === "function", "standalone factory exports");
  check(!sandbox.Game, "standalone lifecycle does not connect active Game runtime");
}

console.log("PASS tactical lifecycle repair: " + assertions +
  " assertions; deadline/auth ordering, reveal vs final, stable event identity, special IDs, trusted time.");
