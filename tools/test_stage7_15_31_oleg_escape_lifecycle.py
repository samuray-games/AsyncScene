from pathlib import Path
import os
import subprocess

ROOT = Path(__file__).resolve().parents[1]
CORE_SOURCE = Path(os.environ.get(
    "STAGE715_CORE_SOURCE", str(ROOT / "AsyncScene/Web/conflict/conflict-core.js")
))
STAGE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
BATTLE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-battles.js"


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


def expression_source(source, marker):
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
    raise AssertionError(f"could not extract expression {marker}")


core_text = CORE_SOURCE.read_text(encoding="utf-8")
stage_text = STAGE_SOURCE.read_text(encoding="utf-8")
battle_text = BATTLE_SOURCE.read_text(encoding="utf-8")
core_functions = "\n".join(function_source(core_text, name) for name in (
    "applyScriptedEscapeVote",
    "resolveCrowdCore",
    "ensureBattleCrowdCap",
    "getCrowdTotalVotes",
    "finalizeEscapeVote",
    "applyEscapeVoteTick",
    "stage715OlegEscapeBattleById",
    "startEscapeVoteTimer",
))
stage_functions = "\n".join(function_source(stage_text, name) for name in (
    "stateFor",
    "stage715BattleById",
    "isOlegEscapeBattle",
    "olegEscapeMoneyLedgerEntry",
    "compensateOlegEscapeRep",
    "ensureOlegEscapePayment",
    "settleOlegEscapeRep",
    "pushOlegEscapeDm",
    "pushOlegEscapeSystem",
    "isCoreSettledOlegEscapeFailure",
    "markOlegEscapeVoteRecovery",
    "settleOlegEscapeOutcome",
    "persistOlegEscapeVoteProgress",
    "startOlegEscape",
    "openNextScriptedFlow",
    "shuffleStage715VoteSides",
    "nastyaEventVoteDelay",
))
battle_functions = "\n".join(function_source(battle_text, name) for name in (
    "formatCrowdEligibleLine",
    "updateCrowdEligibleLine",
    "getRawCountsFromVoters",
))
escape_vote_button = expression_source(battle_text, "const mkVoteBtn = (label, votes) => {")
escape_vote_update = expression_source(battle_text, "const update = (bb) => {")

harness = r'''const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const clock = { now: 10000 };
class FakeDate extends Date { static now() { return clock.now; } }
const ledger = { money: [], rep: [], system: [], dm: [], telemetry: [] };
const repActions = new Set();
const moneyActions = new Set();
let coreEscapeTimerCallback = null;
let coreEscapeTimerDelay = null;
let nextIntervalId = 0;
let nextRepTransferResult = { ok: true };
let nextMoneyChargeResult = { ok: true };
let repTransferCalls = 0;
class FakeUiElement {
  constructor() { this.children = []; this.style = {}; this.attributes = {}; this.textContent = ""; this.className = ""; this.isConnected = true; }
  get childElementCount() { return this.children.length; }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
}
const escapeDom = { currentVoteRow: new FakeUiElement() };
const escapeVoteInfo = new FakeUiElement();
const escapeVoteCard = { querySelector(selector) { return selector === ".eventVoteRow" ? escapeDom.currentVoteRow : null; } };
const escapeVoteBody = { querySelector(selector) {
  return selector.includes("stage7_15_oleg_escape_battle") ? escapeVoteCard : null;
} };
const testDocument = {
  createElement() { return new FakeUiElement(); },
  getElementById(id) {
    if (id === "battlesBody") return escapeVoteBody;
    if (id === "escapeInfo_stage7_15_oleg_escape_battle") return escapeVoteInfo;
    return null;
  },
  querySelector(selector) { return selector.includes("stage7_15_oleg_escape_battle") ? escapeVoteCard : null; }
};
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
        Game.__S.rep = Math.max(0, (Game.__S.rep | 0) - amount);
        const entry = { sourceId: from, targetId: to, amount, reason, battleId, currency: "rep", actionId };
        ledger.rep.push(entry);
        Game.__D.moneyLog.push(entry);
      }
      if (reason === "rep_stage715_escape_payment_compensation") {
        Game.__S.rep += amount;
        const entry = { sourceId: from, targetId: to, amount, reason, battleId, currency: "rep", actionId: options && options.actionId };
        ledger.rep.push(entry);
        Game.__D.moneyLog.push(entry);
      }
      return nextRepTransferResult;
    },
    pushDm(id, name, text) { ledger.dm.push({ id, name, text }); return true; }
  },
  _ConflictEconomy: {
    calcFinalPrice({ basePrice, priceKey, context }) { return { basePrice, finalPrice: basePrice, priceKey, context }; },
    chargePriceOnce({ context, basePrice, reason, fromId, toId, battleId, actorPoints, priceKey, extraMeta }) {
      if (!nextMoneyChargeResult || nextMoneyChargeResult.ok !== true) return nextMoneyChargeResult;
      const actionId = context && context.actionNonce;
      const idempotencyKey = [priceKey, "me", battleId, context && context.rematchOf, context && context.mode,
        context && context.targetId, context && context.argKey, actionId].filter(Boolean).join("|");
      if (reason === "escape_vote_cost" && !moneyActions.has(actionId)) {
        moneyActions.add(actionId);
        const entry = { sourceId: fromId, targetId: toId, amount: basePrice, reason, battleId,
          meta: { idempotencyKey, context, actorPoints, ...extraMeta } };
        ledger.money.push(entry);
        Game.__D.moneyLog.push(entry);
        Game.__S.me.points -= basePrice;
      }
      return { ok: true, idempotencyKey };
    },
    getCrowdPoolId(id) { return `crowd:${id}`; }, ensurePool() {},
    transferPoints(from, to, amount, reason, meta = {}) {
      if (from === "npc_oleg") Game.__S.me.points += amount;
      Game.__D.moneyLog.push({ sourceId: from, targetId: to, amount, reason, battleId: meta.battleId, meta });
      return { ok: true };
    }, transferFromPool() { return { ok: true }; }
  }
};
const vmContext = {
  Game, assert, ledger, clock, clone, persistedState, repActions, moneyActions,
  window: { location: { search: "" }, CSS: { escape(value) { return String(value); } }, __testEscapeVoteRow: escapeDom.currentVoteRow },
  FakeUiElement, escapeDom, escapeVoteInfo,
  document: testDocument,
  $(id) { return testDocument.getElementById(id); },
  isDevCrowdMode: false,
  console: { warn() {}, error() {}, log: console.log },
  skipPreIntervalProbe: process.env.STAGE715_SKIP_PRE_INTERVAL_PROBE === "1",
  URLSearchParams, Date: FakeDate, Math: Object.create(Math),
  setInterval(callback, delay) { coreEscapeTimerCallback = callback; coreEscapeTimerDelay = delay; nextIntervalId += 1; return nextIntervalId; },
  clearInterval() {},
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
  setMoneyChargeResult(value) { nextMoneyChargeResult = value; },
  getCoreEscapeTimerCallback() { return coreEscapeTimerCallback; },
  getCoreEscapeTimerDelay() { return coreEscapeTimerDelay; },
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
vm.runInContext(process.argv[4], vmContext);
const uiUpdateSource = [
  "(() => {",
  '  const voteLabelA = "Уйти"; const voteLabelB = "Остаться";',
  "  const diagLine = { style: {} }; const timerLine = null;",
  "  let voteRowEl = window.__testEscapeVoteRow;",
  process.argv[5] + ";",
  process.argv[6] + ";",
  "  return update;",
  "})()"
].join("\n");
vmContext.updateEscapeVoteRow = vm.runInContext(uiUpdateSource, vmContext);
vm.runInContext(`
  Game.Stage715Demo = { persistOlegEscapeVoteProgress };
  // RED-first resource preflight contract: an unaffordable attempt must keep
  // the scripted card ready, leave both balances and ledgers untouched, and
  // remain retryable without consuming an attempt number.
  const preflightBattle = Game.__S.battles[0];
  Game.__S.me.points = 20;
  Game.__S.rep = 0;
  Game.__S.me.rep = 0;
  const moneyBalanceBeforePreflight = Game.__S.me.points;
  const repBalanceBeforePreflight = Game.__S.rep;
  assert.strictEqual(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), false,
    "Oleg escape must not begin if either required resource is missing");
  assert.strictEqual(preflightBattle.meta.stage715Escape.attempt, 0,
    "a rejected attempt must not increment its attempt number");
  assert.strictEqual(preflightBattle.escapeVote, undefined,
    "a rejected attempt must not start voting");
  assert.strictEqual(Game.__S.me.points, moneyBalanceBeforePreflight,
    "a rejected attempt must not charge money");
  assert.strictEqual(Game.__S.rep, repBalanceBeforePreflight,
    "a rejected attempt must not charge REP");
  assert.strictEqual(ledger.money.length, 0, "a rejected attempt must not append a money transfer");
  assert.strictEqual(ledger.rep.length, 0, "a rejected attempt must not append a REP transfer");
  assert(preflightBattle.meta.stage715Escape.preflightFailureReason,
    "the scripted card must explain why the attempt was rejected");
  Game.__S.me.points = 20;
  Game.__S.rep = 5;
  Game.__S.me.rep = 5;
  Game.NPC = { poolSize: 3, poolCalls: 0, voteAttempts: 0,
    getVotingPool() { this.poolCalls += 1; return Array.from({ length: this.poolSize }, (_, index) => ({ id: "pool_" + index })); },
    voteInDraw() { this.voteAttempts += 1; return { voterId: "ordinary_npc_vote", side: "attacker" }; } };
  assert(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), "controller should start the first escape through Core.escape; "+JSON.stringify({meta:preflightBattle.meta.stage715Escape, vote:preflightBattle.escapeVote, status:preflightBattle.status}));
  let authoritative = Game.__S.battles[0];
  const vote = authoritative.escapeVote;
  assert(vote && vote.scriptedVoteSequence.length === 5);
  assert.strictEqual(getCoreEscapeTimerDelay(), 100, "Core must create the dedicated 100ms Stage 7.15 timer");
  assert.strictEqual(typeof getCoreEscapeTimerCallback(), "function", "Core must retain the actual timer callback");
  assert.strictEqual(Game._ConflictCore.resumeStage715OlegEscapeVote(authoritative.id), true,
    "resume must report success only while that Core timer is active");
  assert.strictEqual(vote.scriptedVoteSequence.slice(0, 4).filter(side => side === "a").length, 2);
  assert.strictEqual(vote.scriptedVoteSequence[4], "b");
  const persistStageProgress = Game.Stage715Demo.persistOlegEscapeVoteProgress;
  const progress = [];
  const visibleVoteStates = [];
  function captureVisibleVote(attempt, label) {
    const renderedBattle = Game.UI.S.battles.find((entry) => entry && entry.id === authoritative.id);
    updateEscapeVoteRow(renderedBattle);
    const canonicalVote = authoritative.escapeVote;
    const visible = escapeDom.currentVoteRow.children.map((button) => button.textContent);
    const expectedA = Object.values(canonicalVote.voters || {}).filter((side) => side === "a").length;
    const expectedB = Object.values(canonicalVote.voters || {}).filter((side) => side === "b").length;
    assert.strictEqual(JSON.stringify(visible), JSON.stringify(["Уйти - " + expectedA, "Остаться - " + expectedB]),
      "the actual escape vote row must render Core's current tally at " + label);
    assert.strictEqual(escapeVoteInfo.textContent, "Толпа решает: " + (expectedA + expectedB) + "/5",
      "the visible vote progress must reflect Core's current count at " + label);
    const item = { attempt, label, atMs: clock.now, row: visible.slice(), info: escapeVoteInfo.textContent };
    visibleVoteStates.push(item);
    return item;
  }
  captureVisibleVote(1, "started");
  for (let index = 0; index < 5; index += 1) {
    if (index === 0 && !skipPreIntervalProbe) {
      clock.now = authoritative.escapeVote.stage715NextVoteAtMs - 1;
      getCoreEscapeTimerCallback()();
      assert.strictEqual(Game.NPC.voteAttempts, 0,
        "a scripted Oleg timer tick before its scheduled interval must not fall through to ordinary NPC voting");
    }
    clock.now = authoritative.escapeVote.stage715NextVoteAtMs;
    const timerCallback = getCoreEscapeTimerCallback();
    timerCallback();
    const voteAfterTick = authoritative.escapeVote;
    if (voteAfterTick) {
      const scheduledIntervals = voteAfterTick.stage715VoteIntervals || [];
      assert(scheduledIntervals.every((delay) => delay >= 1000 && delay <= 2000),
        "Core must persist every vote interval within 1-2 seconds");
    }
    const captured = captureVisibleVote(1, "vote-" + (index + 1));
    assert.strictEqual(captured.row[0].split(" - ")[1] * 1 + captured.row[1].split(" - ")[1] * 1,
      index + 1, "each Core timer tick must create exactly one separately rendered vote (" + (index + 1) + ")");
    const tickResult = { ok: true, totalVotes: authoritative.escapeVote
      ? Object.keys(authoritative.escapeVote.voters || {}).length : 5 };
    const visible = Game.UI.S.battles[0].escapeVote;
    progress.push({ tickResult, now: clock.now, source: authoritative.escapeVote && Object.keys(authoritative.escapeVote.voters || {}).length, mirror: visible && Object.keys(visible.voters || {}).length, next: authoritative.escapeVote && authoritative.escapeVote.stage715NextVoteAtMs });
    if (index === 2) {
      assert.strictEqual(authoritative.resolved, false, "the real Core timer must not settle the scripted escape at vote three; " + JSON.stringify({ status: authoritative.status, result: authoritative.result, escapeVote: authoritative.escapeVote }));
      assert(authoritative.escapeVote && Object.keys(authoritative.escapeVote.voters || {}).length === 3,
        "the real Core timer must retain the active scripted vote after vote three; " + JSON.stringify({ status: authoritative.status, result: authoritative.result, inlineNote: authoritative.inlineNote, escapeVote: authoritative.escapeVote }));
      assert.strictEqual(Game.NPC.poolCalls, 0, "scripted Oleg timer must bypass the ordinary NPC-pool cutoff");
      assert.strictEqual(authoritative.status, "escape_vote", "NPC pool size three must not finalize the scripted escape after vote three");
      assert.strictEqual(authoritative.escapeVote.cap, 5, "scripted Oleg escape cap must remain five");
      assert.strictEqual(authoritative.escapeVote.votesA + authoritative.escapeVote.votesB, 3);
    }
    if (index === 3) assert(visible && Object.keys(visible.voters).length === 4, "2:2 must be visible after vote four; progress=" + JSON.stringify(progress) + " mirror=" + JSON.stringify(Game.UI.S.battles[0]));
    if (index === 3) assert.strictEqual(JSON.stringify(captured.row), JSON.stringify(["Уйти - 2", "Остаться - 2"]), "the rendered fourth vote must show 2:2");
    if (index === 4) assert.strictEqual(JSON.stringify(captured.row), JSON.stringify(["Уйти - 2", "Остаться - 3"]), "the rendered fifth vote must show 2:3 before settlement");
    if (index === 1) {
      const savedCheckpoint = clone(persistedState);
      const savedVote = savedCheckpoint.battles[0].escapeVote;
      assert.strictEqual(Object.keys(savedVote.voters).length, 2, "the persisted checkpoint must contain exactly two completed votes");
      const savedNextVoteAtMs = savedVote.stage715NextVoteAtMs;
      const savedMoneyLog = clone(Game.__D.moneyLog);
      const repCallsBeforeReload = getRepTransferCalls();
      const moneyRowsBeforeReload = ledger.money.length;
      const repRowsBeforeReload = ledger.rep.length;
      escapeDom.currentVoteRow.isConnected = false;
      escapeDom.currentVoteRow = new FakeUiElement();
      window.__testEscapeVoteRow = escapeDom.currentVoteRow;
      for (const key of Object.keys(persistedState)) delete persistedState[key];
      Object.assign(persistedState, clone(savedCheckpoint));
      Game.__S = clone(savedCheckpoint);
      Game.UI.S = clone(savedCheckpoint);
      Game.__D.moneyLog = clone(savedMoneyLog);
      authoritative = Game.__S.battles[0];
      assert.notStrictEqual(authoritative, preflightBattle, "reload must hydrate a distinct canonical battle object");
      assert.strictEqual(authoritative.escapeVote.stage715NextVoteAtMs, savedNextVoteAtMs,
        "reload must retain the scheduled next vote time");
      assert.strictEqual(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), true,
        "the real Stage controller must resume the saved vote without starting a new attempt");
      assert.strictEqual(Object.keys(authoritative.escapeVote.voters).length, 2,
        "resume must not replay either completed vote");
      assert.strictEqual(authoritative.escapeVote.stage715NextVoteAtMs, savedNextVoteAtMs,
        "resume must preserve the saved interval rather than completing immediately");
      assert.strictEqual(getRepTransferCalls(), repCallsBeforeReload, "reload/resume must not transfer REP again");
      assert.strictEqual(ledger.rep.length, repRowsBeforeReload, "reload/resume must not create a second REP row");
      assert.strictEqual(ledger.money.length, moneyRowsBeforeReload, "reload/resume must not create a second money row");
      assert.strictEqual(Game.__D.moneyLog.filter((entry) => entry.reason === "escape_vote_cost"
        && entry.meta && entry.meta.actionId === "stage715_oleg_escape_1").length, 1,
      "the persisted money action receipt must remain unique after reload");
      const restoredCallback = getCoreEscapeTimerCallback();
      clock.now = savedNextVoteAtMs - 1;
      restoredCallback();
      assert.strictEqual(Object.keys(authoritative.escapeVote.voters).length, 2,
        "the resumed Core timer must wait until the persisted next-vote deadline");
      captureVisibleVote(1, "reload-resumed-2-votes");
    }
  }
  assert.strictEqual(authoritative.escapeVote.votesA + authoritative.escapeVote.votesB, 5,
    "the fifth vote tally remains available to the UI before Core settlement");
  assert.strictEqual(authoritative.resolved, false,
    "Core must keep the fifth tally visible for its separate outcome interval");
  // Reproduce the production split-store failure window at the later Core
  // settlement callback. No result fields are injected.
  Game.Stage715Demo.persistOlegEscapeVoteProgress = () => false;
  clock.now = authoritative.escapeVote.stage715FinalizeAtMs;
  getCoreEscapeTimerCallback()();
  Game.Stage715Demo.persistOlegEscapeVoteProgress = persistStageProgress;
  assert.strictEqual(authoritative.status, "pickDefense", "Core must settle the 2:3 loss and restore pickDefense");
  assert.strictEqual(authoritative.escapeVote, null, "Core settlement consumes the authoritative vote state");
  assert(Game.UI.S.battles[0].escapeVote, "the failure fixture must retain a stale UI vote mirror after Core settlement");
  const observed = stage715BattleById(OLEG_ESCAPE_BATTLE_ID);
  assert.strictEqual(observed, authoritative, "Stage watcher must observe the settled authoritative battle, not stale UI mirror");
  assert.strictEqual(Game._ConflictCore.resumeStage715OlegEscapeVote(OLEG_ESCAPE_BATTLE_ID), false,
    "Core resume must not restart a timer against a stale UI mirror after authoritative settlement");
  persistStageProgress(OLEG_ESCAPE_BATTLE_ID);
  // Recreate a historical save from the pre-preflight build: the fifth vote
  // and money transfer are already canonical, but its REP action never ran.
  Game.__D.moneyLog = Game.__D.moneyLog.filter(entry => entry.reason !== "rep_stage715_escape_bribe");
  ledger.rep.length = 0;
  repActions.delete("stage715_escape_1");
  Game.__S.rep = 0;
  observed.meta.stage715Escape.repSettled = false;
  const repBeforeFailure = ledger.rep.length;
  setRepTransferResult({ ok: false, reason: "insufficient_rep", available: 0, requested: 1 });
  assert.strictEqual(settleOlegEscapeOutcome(observed), false, "insufficient REP must not fabricate a successful settlement");
  assert.strictEqual(observed.meta.stage715Escape.repSettled, false);
  assert.strictEqual(observed.meta.stage715Escape.outcomeHandled, false);
  assert.strictEqual(observed.meta.stage715Escape.repSettlementFailureReason, "insufficient_rep");
  assert.strictEqual(ledger.rep.length, repBeforeFailure, "insufficient REP must not append a debit");
  assert.strictEqual(ledger.system.length, 0, "insufficient REP must not publish an outcome");
  assert.strictEqual(ledger.dm.length, 0, "insufficient REP must not publish an outcome DM");
  assert.strictEqual(observed.meta.stage715Escape.status, "payment_recovery_required",
    "a historical settled vote must be explicitly recoverable instead of waiting forever");
  assert.strictEqual(observed.escapeVote, null, "payment recovery must not restart the historical vote");
  Game.__S.rep = 1;
  setRepTransferResult({ ok: false, reason: "security_blocked" });
  assert.strictEqual(settleOlegEscapeOutcome(observed), false, "other economy errors must also fail closed");
  assert.strictEqual(observed.meta.stage715Escape.repSettlementFailureReason, "security_blocked",
    "the controller must preserve the concrete economy error instead of collapsing it");
  assert.strictEqual(ledger.rep.length, repBeforeFailure);
  setRepTransferResult({ ok: true });
  Game.__S.rep = 1;
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

  // RED-first recovery contract for the observed saved-state defect: Stage says
  // voting, but Core has already consumed the vote and no live timer remains.
  const firstAttempt = Game.__S.battles[0];
  const repRowsBeforeStaleVotingRetry = ledger.rep.length;
  const moneyRowsBeforeStaleVotingRetry = ledger.money.length;
  const repBalanceBeforeStaleVotingRetry = Game.__S.rep;
  const moneyBalanceBeforeStaleVotingRetry = Game.__S.me.points;
  firstAttempt.meta.stage715Escape.status = "voting";
  firstAttempt.inlineNote = null;
  assert.strictEqual(firstAttempt.escapeVote, null, "Core has no active vote after its settled failure");
  const resumeStage715OlegEscapeVote = Game._ConflictCore.resumeStage715OlegEscapeVote;
  Game._ConflictCore.resumeStage715OlegEscapeVote = () => false;
  assert.strictEqual(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), false,
    "status=voting without an active canonical escapeVote/timer must not claim a vote started");
  assert.strictEqual(ledger.rep.length, repRowsBeforeStaleVotingRetry,
    "stale voting recovery must not repeat the REP debit");
  assert.strictEqual(ledger.money.length, moneyRowsBeforeStaleVotingRetry,
    "stale voting recovery must not repeat the money debit");
  assert.strictEqual(Game.__S.rep, repBalanceBeforeStaleVotingRetry);
  assert.strictEqual(Game.__S.me.points, moneyBalanceBeforeStaleVotingRetry);
  assert.strictEqual(firstAttempt.meta.stage715Escape.status, "vote_recovery_required",
    "the unresolved save must expose an explicit recoverable state");
  assert.strictEqual(ledger.system.filter(text => text === "У Тест не получилось уйти от Олега!").length, 1,
    "recovery must not duplicate the first attempt system line");
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_FAILED_DM_LINE).length, 1,
    "recovery must not duplicate the first attempt DM");
  firstAttempt.meta.stage715Escape.status = "failed";
  persistStageProgress(OLEG_ESCAPE_BATTLE_ID);
  Game._ConflictCore.resumeStage715OlegEscapeVote = resumeStage715OlegEscapeVote;
  Game.__S.me.points = 20;
  assert.strictEqual(ledger.money.filter(entry => entry.meta.actionId === "stage715_oleg_escape_1").length, 1,
    "canonical money ledger identifies the first escape with its actionId");
  assert.strictEqual(Game.UI.S.battles[0].meta.stage715Escape.status, "failed", "render mirror reflects the failed Stage outcome");
  const firstReload = clone(persistedState);
  assert.strictEqual(firstReload.battles[0].meta.stage715Escape.status, "failed", "failed attempt survives reload");
  assert.strictEqual(firstReload.battles[0].id, OLEG_ESCAPE_BATTLE_ID, "reload retains the same scripted card");
  assert.strictEqual(settleOlegEscapeOutcome(firstReload.battles[0]), false,
    "reloading a completed failed attempt must not settle it or publish messages again");
  assert.strictEqual(ledger.rep.filter(entry => entry.actionId === "stage715_escape_1").length, 1,
    "the failed attempt REP action remains unique across a post-settlement reload");
  assert.strictEqual(ledger.money.filter(entry => entry.meta && entry.meta.actionId === "stage715_oleg_escape_1").length, 1,
    "the failed attempt money action remains unique across a post-settlement reload");
  assert.strictEqual(ledger.system.filter(text => text === "У Тест не получилось уйти от Олега!").length, 1,
    "post-settlement reload must preserve one failure system line");
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_FAILED_DM_LINE).length, 1,
    "post-settlement reload must preserve one failure DM");
  // Replaying the canonical REP helper recognizes its persisted settlement.
  assert(settleOlegEscapeRep(authoritative, 1));
  assert.strictEqual(ledger.rep.filter(entry => entry.actionId === "stage715_escape_1").length, 1,
    "recovery must not debit REP a second time");
  assert.strictEqual(JSON.stringify(ledger.rep[0]), JSON.stringify({
    sourceId: "me", targetId: "crowd_pool", amount: 1,
    reason: "rep_stage715_escape_bribe", battleId: OLEG_ESCAPE_BATTLE_ID,
    currency: "rep", actionId: "stage715_escape_1"
  }), "the REP journal must identify the first attempt by its stable actionId");
  Game.__S.rep = 5;
  const moneyEntriesBeforeRejectedRetry = ledger.money.length;
  const repEntriesBeforeRejectedRetry = ledger.rep.length;
  Game.__S.me.points = 0;
  assert.strictEqual(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), false,
    "a second escape must not start without its money resource");
  assert.strictEqual(authoritative.meta.stage715Escape.attempt, 1,
    "a rejected money preflight must not increment the attempt number");
  assert.strictEqual(ledger.money.length, moneyEntriesBeforeRejectedRetry,
    "a rejected money preflight must not append a ledger row");
  assert.strictEqual(ledger.rep.length, repEntriesBeforeRejectedRetry,
    "a rejected money preflight must not partially charge REP");
  Game.__S.me.points = 20;
  setMoneyChargeResult({ ok: false, reason: "money_transfer_rejected" });
  const repBeforeCompensatedChargeFailure = Game.__S.rep;
  assert.strictEqual(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), false,
    "a failed canonical money transfer must not start voting");
  assert.strictEqual(Game.__S.rep, repBeforeCompensatedChargeFailure,
    "a failed money transfer must compensate its earlier REP debit");
  assert.strictEqual(ledger.money.length, moneyEntriesBeforeRejectedRetry,
    "a failed money transfer must not append a successful money charge");
  assert.strictEqual(authoritative.meta.stage715Escape.status, "payment_recovery_required",
    "a failed payment transaction remains explicitly recoverable");
  setMoneyChargeResult({ ok: true });
  Game.NPC.poolSize = 4;
  assert(startOlegEscape(OLEG_ESCAPE_BATTLE_ID), "controller should start the second escape through Core.escape");
  escapeDom.currentVoteRow.isConnected = false;
  escapeDom.currentVoteRow = new FakeUiElement();
  window.__testEscapeVoteRow = escapeDom.currentVoteRow;
  captureVisibleVote(2, "started");
  assert.strictEqual(Game.__S.rep, repBeforeCompensatedChargeFailure - 1,
    "retry after a compensating REP refund must charge exactly one net REP");
  const second = Game.__S.battles[0];
  assert.strictEqual(second.meta.stage715Escape.attempt, 2);
  assert.strictEqual(second.escapeVote.scriptedVoteSequence.slice(0, 4).filter(side => side === "a").length, 2);
  assert.strictEqual(second.escapeVote.scriptedVoteSequence[4], "a");
  for (let index = 0; index < 5; index += 1) {
    clock.now = second.escapeVote.stage715NextVoteAtMs;
    getCoreEscapeTimerCallback()();
    if (second.escapeVote) {
      assert((second.escapeVote.stage715VoteIntervals || []).every((delay) => delay >= 1000 && delay <= 2000),
        "Core must retain each second-attempt vote interval within 1-2 seconds");
    }
    const secondRendered = captureVisibleVote(2, "vote-" + (index + 1));
    assert.strictEqual(Number(secondRendered.row[0].split(" - ")[1])
      + Number(secondRendered.row[1].split(" - ")[1]), index + 1,
    "each second-attempt timer tick must render one separate vote (" + (index + 1) + ")");
    const tickResult = { decided: second.resolved, totalVotes: second.escapeVote ? Object.keys(second.escapeVote.voters || {}).length : 5 };
    if (index === 3) {
      assert.strictEqual(second.status, "escape_vote", "NPC pool size four must not finalize a scripted 2:2 tie");
      assert.strictEqual(second.escapeVote.cap, 5);
      const vote = Game.UI.S.battles[0].escapeVote;
      assert(vote && vote.votesA === 2 && vote.votesB === 2, "second escape shows 2:2 after vote four");
      assert.strictEqual(JSON.stringify(secondRendered.row), JSON.stringify(["Уйти - 2", "Остаться - 2"]), "the rendered second-attempt fourth vote must show 2:2");
    }
    if (index === 4) {
      assert.strictEqual(tickResult.decided, false, "Core publishes the fifth vote before settlement");
      assert.strictEqual(tickResult.totalVotes, 5);
      assert(second.escapeVote && second.escapeVote.votesA === 3 && second.escapeVote.votesB === 2,
        "the visible fifth tally is 3:2 before the outcome");
      assert.strictEqual(JSON.stringify(secondRendered.row), JSON.stringify(["Уйти - 3", "Остаться - 2"]), "the rendered fifth vote must show 3:2 before settlement");
      clock.now = second.escapeVote.stage715FinalizeAtMs;
      getCoreEscapeTimerCallback()();
    }
  }
  assert(second.resolved && second.result === "escaped", "Core settles the second 3:2 vote as escaped");
  assert(settleOlegEscapeOutcome(stage715BattleById(OLEG_ESCAPE_BATTLE_ID)), "Stage outcome settles after Core success");
  assert.strictEqual(second.meta.stage715Escape.status, "success");
  assert.strictEqual(ledger.system.filter(text => text === "У Тест получилось уйти от Олега!").length, 1, "one success system message");
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_SUCCESS_DM_LINE).length, 1, "one Oleg success DM");
  assert.strictEqual(persistedState.flags.stage715NextScriptedFlowReady, true, "success opens the independent-battle instruction gate");
  assert.strictEqual(persistedState.flags.stage715NextScriptedFlowReason, "escape_success");
  assert.strictEqual(phase, "next_scripted_flow", "Core success must release the Stage controller into the next scripted flow");
  const repNet = ledger.rep.reduce((sum, entry) => sum
    + (entry.sourceId === "me" && entry.targetId === "crowd_pool" ? Number(entry.amount) : 0)
    - (entry.sourceId === "crowd_pool" && entry.targetId === "me" ? Number(entry.amount) : 0), 0);
  assert.strictEqual(repNet, 2, "REP debits and compensation reconcile to one net charge per escape attempt");
  assert.strictEqual(ledger.money.length, 2, "one money charge per escape attempt");
  assert.strictEqual(ledger.money.filter(entry => entry.meta.actionId === "stage715_oleg_escape_2").length, 1,
    "canonical money ledger identifies the second escape with its actionId");
  assert.strictEqual(ledger.rep.filter(entry => entry.reason === "rep_stage715_escape_bribe"
    && entry.actionId === "stage715_escape_2").length, 1,
  "canonical REP ledger identifies exactly one second-attempt debit by its actionId");
  assert.strictEqual(ledger.money.filter(entry => entry.reason === "escape_vote_cost"
    && entry.meta && entry.meta.actionId === "stage715_oleg_escape_1").length, 1,
  "canonical money ledger contains exactly one first-attempt debit by its actionId");
  assert.strictEqual(Game.UI.S.battles[0].meta.stage715Escape.status, "success", "render mirror reflects final Stage outcome");
  const secondReload = clone(persistedState);
  assert.strictEqual(secondReload.battles[0].meta.stage715Escape.status, "success", "successful attempt survives reload");
  assert.strictEqual(secondReload.battles[0].id, OLEG_ESCAPE_BATTLE_ID, "success retains the scripted battle identity");
  assert.strictEqual(settleOlegEscapeOutcome(second), false, "replaying the Stage watcher cannot duplicate settlement");
  assert.strictEqual(repNet, 2);
  assert.strictEqual(ledger.money.length, 2);
  assert.strictEqual(ledger.system.filter(text => text === "У Тест получилось уйти от Олега!").length, 1);
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_SUCCESS_DM_LINE).length, 1);
  console.log("OLEG_VOTE_VISIBLE_UI_TRACE " + JSON.stringify(visibleVoteStates));

  // A reload clears the runtime-only logs while preserving the paid action
  // receipt and settled Core outcome in the Stage checkpoint. Resume must use
  // those stable action IDs without charging again or leaving the result pending.
  const reloadedSuccess = clone(second);
  reloadedSuccess.meta.stage715Escape.status = "voting";
  reloadedSuccess.meta.stage715Escape.outcomeHandled = false;
  reloadedSuccess.meta.stage715Escape.repSettled = true;
  reloadedSuccess.meta.stage715Escape.moneySettled = true;
  reloadedSuccess.meta.stage715Escape.repActionId = "stage715_escape_2";
  reloadedSuccess.meta.stage715Escape.moneyActionId = "stage715_oleg_escape_2";
  Game.__D.moneyLog = [];
  ledger.rep.length = 0;
  ledger.money.length = 0;
  repActions.clear();
  moneyActions.clear();
  Game.__S.rep = 0;
  Game.__S.me.points = 14;
  const repTransfersBeforeReloadResume = getRepTransferCalls();
  assert.strictEqual(settleOlegEscapeOutcome(reloadedSuccess), true,
    "a reload must complete the already-paid successful Core result from its persisted action receipts");
  assert.strictEqual(reloadedSuccess.meta.stage715Escape.status, "success");
  assert.strictEqual(getRepTransferCalls(), repTransfersBeforeReloadResume,
    "reload resume must not call the canonical REP transfer a second time");
  assert.strictEqual(ledger.rep.length, 0, "reload resume must not create another REP ledger row");
  assert.strictEqual(ledger.money.length, 0, "reload resume must not create another money ledger row");
  assert.strictEqual(ledger.system.filter(text => text === "У Тест получилось уйти от Олега!").length, 1,
    "reload resume must not duplicate the success system line");
  assert.strictEqual(ledger.dm.filter(message => message.text === OLEG_ESCAPE_SUCCESS_DM_LINE).length, 1,
    "reload resume must not duplicate the success DM");

  // Exercise every unique ordering through the production Core timer callback.
  const previousProgressPersist = Game.Stage715Demo.persistOlegEscapeVoteProgress;
  Game.Stage715Demo.persistOlegEscapeVoteProgress = null;
  const prefixes = [["a", "a", "b", "b"], ["a", "b", "a", "b"], ["a", "b", "b", "a"],
    ["b", "a", "a", "b"], ["b", "a", "b", "a"], ["b", "b", "a", "a"]];
  let permutationIndex = 0;
  for (const attempt of [1, 2]) {
    Game.NPC.poolSize = attempt === 1 ? 3 : 4;
    for (const prefix of prefixes) {
      const sequence = prefix.concat(attempt === 1 ? "b" : "a");
      const id = "timer-permutation-" + attempt + "-" + (++permutationIndex);
      const candidate = {
        id, opponentId: "npc_oleg", attackerId: "npc_oleg", defenderId: "me",
        status: "escape_vote", result: "escape_vote", resolved: false, finished: false,
        _escapePrev: { status: "pickDefense", result: null, note: null, resultLine: null, finished: false, resolved: false },
        meta: { stage715BattleId: "stage7_15_oleg_escape_battle", stage715OlegEscape: true,
          stage715Escape: { attempt, scriptedVoteSequence: sequence.slice() } },
        escapeVote: { cap: 5, votesA: 0, votesB: 0, voters: {}, decided: false, mode: "smyt",
          attackerId: "npc_oleg", defenderId: "me", scriptedVoteSequence: sequence.slice(),
          stage715NextVoteAtMs: clock.now }
      };
      Game.__S.battles.push(candidate);
      assert.strictEqual(Game._ConflictCore.resumeStage715OlegEscapeVote(id), true,
        "production Core resumes the active scripted timer for " + id);
      for (let voteIndex = 0; voteIndex < 5; voteIndex += 1) {
        const activeVote = candidate.escapeVote;
        clock.now = activeVote.stage715NextVoteAtMs;
        getCoreEscapeTimerCallback()();
        if (voteIndex < 4) {
          assert(candidate.escapeVote && !candidate.escapeVote.decided,
            "Core must retain the scripted vote before vote five: " + id + " vote " + (voteIndex + 1));
          assert.strictEqual(candidate.escapeVote.cap, 5);
        }
        if (voteIndex === 3) {
          assert.strictEqual(candidate.escapeVote.votesA, 2, "four votes produce A=2 for " + id);
          assert.strictEqual(candidate.escapeVote.votesB, 2, "four votes produce B=2 for " + id);
        }
        if (voteIndex === 4) {
          assert(candidate.escapeVote && !candidate.escapeVote.decided,
            "the fifth tally must be visible in Core before its result is finalized: " + id);
          assert.strictEqual(Object.keys(candidate.escapeVote.voters).length, 5);
          assert.strictEqual(candidate.escapeVote.votesA + candidate.escapeVote.votesB, 5);
          assert(Number.isFinite(candidate.escapeVote.stage715FinalizeAtMs),
            "the fifth tally must persist a separate outcome interval: " + id);
          assert.strictEqual(candidate.result, "escape_vote", "result must wait until the fifth tally has been published");
          clock.now = candidate.escapeVote.stage715FinalizeAtMs;
          getCoreEscapeTimerCallback()();
        }
      }
      const expectsSuccess = attempt === 2;
      assert.strictEqual(candidate.result === "escaped", expectsSuccess,
        "Core final result must follow the fifth scripted vote for " + id + ": " + JSON.stringify({ result: candidate.result, note: candidate.inlineNote }));
      assert.strictEqual(candidate.escapeVote, expectsSuccess ? candidate.escapeVote : null);
      if (expectsSuccess) assert.strictEqual(candidate.escapeVote.votesA + candidate.escapeVote.votesB, 5);
      else assert.strictEqual(candidate.inlineNote, "Свалить не удалось.");
    }
  }
  Game.Stage715Demo.persistOlegEscapeVoteProgress = previousProgressPersist;

  // The same real timer still honors a smaller pool for an ordinary escape.
  Game.NPC.poolSize = 3;
  Game.NPC.voteInDraw = () => null;
  const ordinaryBattle = {
    id: "ordinary-small-pool-escape", opponentId: "npc_oleg", attackerId: "npc_oleg", defenderId: "me",
    status: "pickDefense", resolved: false, finished: false, _defenseChoices: ["x", "y", "z"], meta: {}
  };
  Game.__S.battles.push(ordinaryBattle);
  assert.strictEqual(Game._ConflictCore.escape(ordinaryBattle.id).pending, true, "ordinary escape starts its normal Core timer");
  ordinaryBattle.escapeVote.voters = { ordinary_1: "a", ordinary_2: "a", ordinary_3: "b" };
  ordinaryBattle.escapeVote.votesA = 2;
  ordinaryBattle.escapeVote.votesB = 1;
  ordinaryBattle.escapeVote.cap = 5;
  getCoreEscapeTimerCallback()();
  assert.strictEqual(ordinaryBattle.result, "escaped", "ordinary escape still finalizes at its three-person pool");
  assert.strictEqual(ordinaryBattle.escapeVote.cap, 3, "ordinary NPC-pool shortcut remains unchanged");
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
     'function getPlayer(id){return Game.__S.players[id] || null;}',
     battle_functions, escape_vote_button, escape_vote_update],
    cwd=ROOT,
    capture_output=True, text=True,
)
if result.returncode:
    raise AssertionError(result.stderr[-2500:])
print(result.stdout, end="")
print("PASS_STAGE7_15_31_OLEG_ESCAPE_LIFECYCLE")

watch_test = f'''const vm = require("vm");
const assert = require("assert");
const battle = {{
  id: "stage7_15_oleg_escape_battle", status: "pickDefense", resolved: false,
  inlineNote: "Свалить не удалось.", escapeVote: null,
  meta: {{ stage715OlegEscape: true, stage715Escape: {{ status: "voting", outcomeHandled: false }} }},
}};
let watcherCallback = null;
let settled = 0;
let escapeWatchTimer = null;
const context = {{
  G: {{ _ConflictCore: {{ resumeStage715OlegEscapeVote() {{ return false; }} }} }},
  active: true,
  escapeWatchTimer: null,
  OLEG_ESCAPE_BATTLE_ID: "stage7_15_oleg_escape_battle",
  stage715BattleById() {{ return battle; }},
  isOlegEscapeBattle(value) {{ return value === battle; }},
  isCoreSettledOlegEscapeFailure(value) {{ return value === battle && value.inlineNote === "Свалить не удалось."; }},
  settleOlegEscapeOutcome(value) {{ assert.strictEqual(value, battle); settled += 1; return true; }},
  setInterval(callback) {{ watcherCallback = callback; return 10; }},
  clearInterval() {{ watcherCallback = null; }},
}};
vm.createContext(context);
vm.runInContext({function_source(stage_text, "watchOlegEscape")!r}, context);
context.watchOlegEscape();
assert.strictEqual(typeof watcherCallback, "function");
watcherCallback();
assert.strictEqual(settled, 1,
  "after Core consumes vote five, the Stage watcher must settle the canonical Oleg loss and deliver its outcome");
console.log("PASS_STAGE715_OLEG_POSTVOTE_WATCHER_SETTLEMENT");
'''
subprocess.run(["node", "-e", watch_test], cwd=ROOT, check=True)
