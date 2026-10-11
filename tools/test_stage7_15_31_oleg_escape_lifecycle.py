from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
CORE_SOURCE = ROOT / "AsyncScene/Web/conflict/conflict-core.js"
STAGE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"


def function_source(source, name):
    marker = f"function {name}("
    start = source.index(marker)
    opening = source.index("{", start)
    depth = 0
    quote = None
    escaped = False
    line_comment = False
    block_comment = False
    index = opening
    while index < len(source):
        char = source[index]
        following = source[index + 1] if index + 1 < len(source) else ""
        if line_comment:
            if char == "\n":
                line_comment = False
        elif block_comment:
            if char == "*" and following == "/":
                block_comment = False
                index += 1
        elif quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
        elif char == "/" and following == "/":
            line_comment = True
            index += 1
        elif char == "/" and following == "*":
            block_comment = True
            index += 1
        elif char in ("'", '"', "`"):
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[start:index + 1]
        index += 1
    raise AssertionError(f"could not extract {name}()")


core_text = CORE_SOURCE.read_text(encoding="utf-8")
stage_text = STAGE_SOURCE.read_text(encoding="utf-8")
core_functions = "\n".join(function_source(core_text, name) for name in (
    "applyScriptedEscapeVote",
    "resolveCrowdCore",
    "ensureBattleCrowdCap",
    "getCrowdTotalVotes",
    "finalizeEscapeVote",
    "applyEscapeVoteTick",
))
stage_functions = "\n".join(function_source(stage_text, name) for name in (
    "stateFor",
    "stage715BattleById",
    "isOlegEscapeBattle",
    "settleOlegEscapeRep",
    "pushOlegEscapeDm",
    "pushOlegEscapeSystem",
    "settleOlegEscapeOutcome",
    "persistOlegEscapeVoteProgress",
    "startOlegEscape",
    "openNextScriptedFlow",
    "shuffleStage715VoteSides",
    "nastyaEventVoteDelay",
))

harness = r'''const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const clock = { now: 10000 };
class FakeDate extends Date { static now() { return clock.now; } }
const ledger = { money: [], rep: [], system: [], dm: [], telemetry: [] };
const repActions = new Set();
const moneyActions = new Set();
let nextRepTransferResult = { ok: true };
let repTransferCalls = 0;
const player = { id: "me", name: "Тест", points: 20, influence: 4, rep: 5, isMe: true };
const oleg = { id: "npc_oleg", name: "Олег", points: 10, influence: 6, type: "npc", npc: true };
const battle = {
  id: "stage7_15_oleg_escape_battle", opponentId: oleg.id, attackerId: oleg.id, defenderId: player.id,
  status: "pickDefense", resolved: false, finished: false, attackHidden: true,
  _defenseChoices: ["yellow_1", "yellow_2", "yellow_3"],
  meta: { stage715BattleId: "stage7_15_oleg_escape_battle", stage715OlegEscape: true,
    stage715Escape: { attempt: 0, status: "ready", outcomeHandled: false, repSettled: false } }
};
const clone = value => JSON.parse(JSON.stringify(value));
const canonicalState = { me: player, players: { me: player, [oleg.id]: oleg }, battles: [battle], flags: {} };
const persistedState = { me: clone(player), players: { me: clone(player), [oleg.id]: clone(oleg) }, battles: [clone(battle)], flags: {} };
const renderState = { me: clone(player), players: { me: clone(player), [oleg.id]: clone(oleg) }, battles: [clone(battle)], flags: {} };
assert.notStrictEqual(canonicalState, renderState);
assert.notStrictEqual(canonicalState.battles[0], renderState.battles[0]);
const Game = {
  __S: canonicalState,
  __D: { moneyLog: [] },
  UI: { S: renderState, pushSystem(text) { ledger.system.push(text); }, renderAll() {}, requestRenderAll() {} },
  Data: { resolveUiTextProfileName() { return "millennial"; }, TEXTS: { millennial: {
    "battle.draw_fallback": "Толпа решает", "battle.escaped_fallback": "Свалить", "battle.ignored_fallback": "Отвали"
  } }, PROGRESSION: { unlockInfluence: { strong: 5, power: 10, absolute: 100 } } },
  __A: {
    ensureNonNegativePoints() {}, syncMeToPlayers() {}, emitStatDelta() {},
    transferRep(from, to, amount, reason, battleId, options) {
      repTransferCalls += 1;
      if (!nextRepTransferResult || nextRepTransferResult.ok !== true) return nextRepTransferResult;
      const actionId = options && options.actionId;
      if (reason === "rep_stage715_escape_bribe" && !repActions.has(actionId)) {
        repActions.add(actionId);
        const entry = { sourceId: from, targetId: to, amount, reason, battleId, currency: "rep", actionId };
        ledger.rep.push(entry);
        Game.__D.moneyLog.push(entry);
      }
      return nextRepTransferResult;
    },
    pushDm(id, name, text) { ledger.dm.push({ id, name, text }); return true; }
  },
  _ConflictEconomy: {
    calcFinalPrice({ basePrice, priceKey, context }) { return { basePrice, finalPrice: basePrice, priceKey, context }; },
    chargePriceOnce({ context, basePrice, reason }) {
      const actionId = context && context.actionNonce;
      if (reason === "escape_vote_cost" && !moneyActions.has(actionId)) { moneyActions.add(actionId); ledger.money.push({ amount: basePrice, actionId }); }
      return { ok: true };
    },
    getCrowdPoolId(id) { return `crowd:${id}`; }, ensurePool() {}, transferPoints() { return { ok: true }; }, transferFromPool() { return { ok: true }; }
  }
};
const vmContext = {
  Game, assert, ledger, clock, clone, persistedState, window: { location: { search: "" } }, console: { warn() {}, error() {}, log: console.log },
  URLSearchParams, Date: FakeDate, Math: Object.create(Math), setInterval() { return 1; }, clearInterval() {},
  setTimeout, clearTimeout, OLEG_ESCAPE_BATTLE_ID: "stage7_15_oleg_escape_battle",
  FIRST_BATTLE_ID: "stage7_15_rayhan_battle", G: Game,
  OLEG_DM_ID: "npc_oleg",
  OLEG_ESCAPE_FAILED_DM_LINE: "слыш трусишка, кудааа, не так быстро! ладно, можешь ещё разок попробовать.",
  OLEG_ESCAPE_SUCCESS_DM_LINE: "трусишек не уважают, поэтому репутация понизилась, но ничего, уверен ты всё наверстаешь, а это был неприятный, но полезный урок. без обид?",
  OLEG_ESCAPE_SUCCESS_RESULT: "У тебя получилось уйти от конфликта за взятку, все довольны.",
  context: { state: persistedState, UI: Game.UI, openNextScriptedFlow() { Game.__S.flags.nextInstruction = true; } },
  phase: "oleg_escape_ready", active: true,
  telemetry(name) { ledger.telemetry.push(name); }, render() {}, saveState() {},
  watchOlegEscape() {},
  rayhanBattleState() { return Game.UI.S; }, battleOutcome() { return null; },
  getTotalPlayersCount() { return Object.keys(Game.__S.players).length; },
  logBattleVoteAllowedFlow() {}, logCrowdCapDebugRaw() {},
  applyBattleCrowdEconomy() {}, now() { return FakeDate.now(); },
  getName(id) { return id === "npc_oleg" ? "Олег" : "Тест"; },
  pushSystem(text) { ledger.system.push(text); }, systemSay(_a, _b, values) { return `Баттл с ${values.oppName}: ${values.text}.`; },
  battleFallbackText(key) { return key === "battle.escaped_fallback" ? "Свалить" : "Отвали"; },
  battleFallbackSentence(_key, punctuation) { return `Свалить${punctuation}`; },
  isCirculationEnabled() { return false; }, getCrowdTotalVotes(v) { return Object.keys(v.voters || {}).length; },
  ensurePointsField(p) { if (!Number.isFinite(p.points)) p.points = 0; }, clamp0(value) { return Math.max(0, value | 0); },
  attackerDefenderIds(b) { return { attackerId: b.attackerId, defenderId: b.defenderId }; },
  calcFinalPriceForActor(base) { return { finalPrice: base, priceKey: "escape", context: {} }; },
  getPlayer(id) { return Game.__S.players[id] || null; },
  escapeCostForBattle() { return 1; },
  pushNpc() {},
  stage715OlegEscapeLiveTimers: new WeakMap(),
  setRepTransferResult(value) { nextRepTransferResult = value; },
  getRepTransferCalls() { return repTransferCalls; },
  getEcon() { return null; }, useWeightedTally() { return false; },
  ensureBattleCrowdCap() {},
  isEscapeVote(b) { return !!(b && b.escapeVote && !b.escapeVote.decided); },
  logCrowdCapDebugRaw() {},
  GameState: null
};
vmContext.Math.random = () => 0;
vm.createContext(vmContext);
vm.runInContext(process.argv[1], vmContext);
vm.runInContext(process.argv[2], vmContext);
vm.runInContext(process.argv[3], vmContext);
vm.runInContext(`
  Game.Stage715Demo = { persistOlegEscapeVoteProgress };
  assert(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), "controller should start the first escape through Core.escape");
  const authoritative = Game.__S.battles[0];
  const vote = authoritative.escapeVote;
  assert(vote && vote.scriptedVoteSequence.length === 5);
  assert.strictEqual(vote.scriptedVoteSequence.slice(0, 4).filter(side => side === "a").length, 2);
  assert.strictEqual(vote.scriptedVoteSequence[4], "b");
  const persistStageProgress = Game.Stage715Demo.persistOlegEscapeVoteProgress;
  const progress = [];
  for (let index = 0; index < 5; index += 1) {
    clock.now = authoritative.escapeVote.stage715NextVoteAtMs;
    // Reproduce the production split-store failure window: Core completes its
    // own fifth-vote settlement while UI.S still holds the last pending vote.
    // No result fields are injected; Core remains the only settlement owner.
    if (index === 4) Game.Stage715Demo.persistOlegEscapeVoteProgress = () => false;
    const tickResult = Game._ConflictCore.applyEscapeVoteTick(authoritative.id);
    if (index === 4) Game.Stage715Demo.persistOlegEscapeVoteProgress = persistStageProgress;
    const visible = Game.UI.S.battles[0].escapeVote;
    progress.push({ tickResult, now: clock.now, source: authoritative.escapeVote && Object.keys(authoritative.escapeVote.voters || {}).length, mirror: visible && Object.keys(visible.voters || {}).length, next: authoritative.escapeVote && authoritative.escapeVote.stage715NextVoteAtMs });
    if (index === 3) assert(visible && Object.keys(visible.voters).length === 4, "2:2 must be visible after vote four; progress=" + JSON.stringify(progress) + " mirror=" + JSON.stringify(Game.UI.S.battles[0]));
  }
  assert.strictEqual(authoritative.status, "pickDefense", "Core must settle the 2:3 loss and restore pickDefense");
  assert.strictEqual(authoritative.escapeVote, null, "Core settlement consumes the authoritative vote state");
  assert(Game.UI.S.battles[0].escapeVote, "the failure fixture must retain a stale UI vote mirror after Core settlement");
  const observed = stage715BattleById(OLEG_ESCAPE_BATTLE_ID);
  assert.strictEqual(observed, authoritative, "Stage watcher must observe the settled authoritative battle, not stale UI mirror");
  assert.strictEqual(Game._ConflictCore.resumeStage715OlegEscapeVote(OLEG_ESCAPE_BATTLE_ID), false,
    "Core resume must not restart a timer against a stale UI mirror after authoritative settlement");
  persistStageProgress(OLEG_ESCAPE_BATTLE_ID);
  const repBeforeFailure = ledger.rep.length;
  setRepTransferResult({ ok: false, reason: "insufficient_rep", available: 0, requested: 1 });
  assert.strictEqual(settleOlegEscapeOutcome(observed), false, "insufficient REP must not fabricate a successful settlement");
  assert.strictEqual(observed.meta.stage715Escape.repSettled, false);
  assert.strictEqual(observed.meta.stage715Escape.outcomeHandled, false);
  assert.strictEqual(observed.meta.stage715Escape.repSettlementFailureReason, "insufficient_rep");
  assert.strictEqual(ledger.rep.length, repBeforeFailure, "insufficient REP must not append a debit");
  assert.strictEqual(ledger.system.length, 0, "insufficient REP must not publish an outcome");
  assert.strictEqual(ledger.dm.length, 0, "insufficient REP must not publish an outcome DM");
  setRepTransferResult({ ok: false, reason: "security_blocked" });
  assert.strictEqual(settleOlegEscapeOutcome(observed), false, "other economy errors must also fail closed");
  assert.strictEqual(observed.meta.stage715Escape.repSettlementFailureReason, "security_blocked",
    "the controller must preserve the concrete economy error instead of collapsing it");
  assert.strictEqual(ledger.rep.length, repBeforeFailure);
  setRepTransferResult({ ok: true });
  // Model a real interrupted lifecycle boundary: the canonical REP transfer
  // succeeds, then Stage outcome handling runs on the already-settled state.
  assert(settleOlegEscapeRep(observed, 1), "canonical REP action settles before the Stage outcome watcher");
  assert.strictEqual(observed.meta.stage715Escape.repSettled, true);
  assert.strictEqual(observed.meta.stage715Escape.outcomeHandled, false);
  const transferCallsAfterSettlement = getRepTransferCalls();
  observed.meta.stage715Escape.repSettled = false;
  const recoveredTransfer = settleOlegEscapeRep(observed, 1);
  assert(recoveredTransfer.alreadySettled, "a durable canonical REP ledger entry recovers an interrupted flag write");
  assert.strictEqual(getRepTransferCalls(), transferCallsAfterSettlement, "ledger recovery must not call transferRep again");
  assert.strictEqual(ledger.rep.length, 1, "ledger recovery must not debit REP twice");
  assert(settleOlegEscapeOutcome(observed), "Stage outcome must settle after Core settlement");
  assert.strictEqual(observed.meta.stage715Escape.status, "failed");
  assert.strictEqual(ledger.system.filter(text => text === "У Тест не получилось уйти от Олега!").length, 1, "one loss system message");
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_FAILED_DM_LINE).length, 1, "one Oleg failure DM");
  assert.strictEqual(observed.id, OLEG_ESCAPE_BATTLE_ID, "the same scripted battle card is restored");
  assert.strictEqual(observed._defenseChoices.length, 3, "restored card retains the three scripted choices");
  assert.strictEqual(ledger.rep.length, 1, "REP settles once for the first attempt");
  assert.strictEqual(ledger.money.length, 1, "money settles once for the first attempt");
  assert.strictEqual(Game.UI.S.battles[0].meta.stage715Escape.status, "failed", "render mirror reflects the failed Stage outcome");
  const firstReload = clone(persistedState);
  assert.strictEqual(firstReload.battles[0].meta.stage715Escape.status, "failed", "failed attempt survives reload");
  assert.strictEqual(firstReload.battles[0].id, OLEG_ESCAPE_BATTLE_ID, "reload retains the same scripted card");
  // Replaying the canonical REP helper recognizes its persisted settlement.
  assert(settleOlegEscapeRep(authoritative, 1));
  assert.strictEqual(ledger.rep.filter(entry => entry.actionId === "stage715_escape_1").length, 1,
    "recovery must not debit REP a second time");
  assert.strictEqual(JSON.stringify(ledger.rep[0]), JSON.stringify({
    sourceId: "me", targetId: "crowd_pool", amount: 1,
    reason: "rep_stage715_escape_bribe", battleId: OLEG_ESCAPE_BATTLE_ID,
    currency: "rep", actionId: "stage715_escape_1"
  }), "the REP journal must identify the first attempt by its stable actionId");
  assert(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), "controller should start the second escape through Core.escape");
  const second = Game.__S.battles[0];
  assert.strictEqual(second.meta.stage715Escape.attempt, 2);
  assert.strictEqual(second.escapeVote.scriptedVoteSequence.slice(0, 4).filter(side => side === "a").length, 2);
  assert.strictEqual(second.escapeVote.scriptedVoteSequence[4], "a");
  for (let index = 0; index < 5; index += 1) {
    clock.now = second.escapeVote.stage715NextVoteAtMs;
    const tickResult = Game._ConflictCore.applyEscapeVoteTick(second.id);
    if (index === 3) {
      const vote = Game.UI.S.battles[0].escapeVote;
      assert(vote && vote.votesA === 2 && vote.votesB === 2, "second escape shows 2:2 after vote four");
    }
    if (index === 4) assert(tickResult.decided && tickResult.totalVotes === 5, "Core settles only after vote five");
  }
  assert(second.resolved && second.result === "escaped", "Core settles the second 3:2 vote as escaped");
  assert(settleOlegEscapeOutcome(stage715BattleById(OLEG_ESCAPE_BATTLE_ID)), "Stage outcome settles after Core success");
  assert.strictEqual(second.meta.stage715Escape.status, "success");
  assert.strictEqual(ledger.system.filter(text => text === "У Тест получилось уйти от Олега!").length, 1, "one success system message");
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_SUCCESS_DM_LINE).length, 1, "one Oleg success DM");
  assert.strictEqual(persistedState.flags.stage715NextScriptedFlowReady, true, "success opens the independent-battle instruction gate");
  assert.strictEqual(persistedState.flags.stage715NextScriptedFlowReason, "escape_success");
  assert.strictEqual(ledger.rep.length, 2, "one REP charge per escape attempt");
  assert.strictEqual(ledger.money.length, 2, "one money charge per escape attempt");
  assert.strictEqual(Game.UI.S.battles[0].meta.stage715Escape.status, "success", "render mirror reflects final Stage outcome");
  const secondReload = clone(persistedState);
  assert.strictEqual(secondReload.battles[0].meta.stage715Escape.status, "success", "successful attempt survives reload");
  assert.strictEqual(secondReload.battles[0].id, OLEG_ESCAPE_BATTLE_ID, "success retains the scripted battle identity");
  assert.strictEqual(settleOlegEscapeOutcome(second), false, "replaying the Stage watcher cannot duplicate settlement");
  assert.strictEqual(ledger.rep.length, 2);
  assert.strictEqual(ledger.money.length, 2);
  assert.strictEqual(ledger.system.filter(text => text === "У Тест получилось уйти от Олега!").length, 1);
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_SUCCESS_DM_LINE).length, 1);
  console.log("PASS_STAGE715_OLEG_SPLIT_STORE_CORE_TO_STAGE_LIFECYCLE");
`, vmContext);
'''

result = subprocess.run(
    ["node", "-e", harness, CORE_SOURCE.read_text(encoding="utf-8"), stage_functions,
     'function isEscapeVote(b){return !!(b && b.escapeVote && !b.escapeVote.decided);}'
     'function now(){return Date.now();}'
     'function getTotalPlayersCount(){return Object.keys(Game.__S.players).length;}'
     'function logBattleVoteAllowedFlow(){} function logCrowdCapDebugRaw(){}'
     'function applyBattleCrowdEconomy(){} function getName(id){return Game.__S.players[id]?.name || "Олег";}'
     'function battleFallbackText(key){return key === "battle.escaped_fallback" ? "Свалить" : "Отвали";}'
     'function battleFallbackSentence(_key,punctuation){return "Свалить"+punctuation;}'
     'function systemSay(_a,_b,v){return `Баттл с ${v.oppName}: ${v.text}.`;}'
     'function getPlayer(id){return Game.__S.players[id] || null;}'],
    cwd=ROOT,
    capture_output=True, text=True,
)
if result.returncode:
    raise AssertionError(result.stderr[-2500:])
print(result.stdout, end="")
print("PASS_STAGE7_15_31_OLEG_ESCAPE_LIFECYCLE")
