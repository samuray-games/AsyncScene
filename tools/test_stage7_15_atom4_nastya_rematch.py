from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"
UI = ROOT / "AsyncScene/Web/ui/ui-battles.js"
UI_DEPLOYED = ROOT / "docs/ui/ui-battles.js"

require_parity = SOURCE.read_bytes() == DEPLOYED.read_bytes()
if not require_parity:
    raise AssertionError("Stage 7.15 controller source/docs mirror mismatch")
if UI.read_bytes() != UI_DEPLOYED.read_bytes():
    raise AssertionError("battle UI source/docs mirror mismatch")

node = r'''
const fs = require("fs");
const vm = require("vm");
const cp = require("child_process");
const assert = require("assert");
const currentSource = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const uiSource = fs.readFileSync("AsyncScene/Web/ui/ui-battles.js", "utf8");
const baselineSource = cp.execFileSync("git", ["show", "HEAD:AsyncScene/Web/ui/ui-stage7-first-experience.js"], { encoding: "utf8" });

function makeRuntime(source, phase = "nastya_battle", persistedStore = new Map()) {
  let now = 1000;
  let nextId = 1;
  const timers = new Map();
  const timerLog = [];
  const setTimeoutFake = (fn, delay = 0) => {
    const id = nextId++;
    const ms = Math.max(0, Number(delay) || 0);
    timers.set(id, { fn, at: now + ms });
    timerLog.push(ms);
    return id;
  };
  const clearFake = (id) => timers.delete(id);
  const advance = (ms) => {
    const stopAt = now + ms;
    while (true) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= stopAt).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      const [id, timer] = due;
      now = timer.at;
      timers.delete(id);
      timer.fn();
    }
    now = stopAt;
  };
  class FakeDate extends Date { static now() { return now; } }
  const ledger = [];
  const chat = [];
  const storageMap = persistedStore;
  const localStorage = {
    getItem(key) { return storageMap.get(key) || null; },
    setItem(key, value) { storageMap.set(key, String(value)); },
    removeItem(key) { storageMap.delete(key); },
  };
  const sourceAccounts = persistedStore._economyAccounts || (persistedStore._economyAccounts = { sink: { points: 0 }, crowd_pool: { rep: 0 } });
  const state = {
    flags: { stage715Demo: true, stage715DemoPhase: phase, stage715EventsPanelRevealed: false },
    me: { id: "me", name: "Тестер", points: 10, wins: 0, influence: 0 }, rep: 3,
    players: {
      npc_stage7_mika: { id: "npc_stage7_mika", name: "Настя", npc: true, role: "crowd", points: 10, influence: 8 },
      npc_stage7_ken: { id: "npc_stage7_ken", name: "Райхан", npc: true, role: "crowd", points: 10, influence: 5 },
      ...Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`voter_${i}`, { id: `voter_${i}`, name: `Голос ${i}`, npc: true, role: "crowd", points: 10 }]))
    }, battles: [], events: [], chat,
  };
  const makeChoices = (isRematch) => (isRematch
    ? [
      { id: "canon_who", group: "who", type: "who" },
      { id: "canon_yn", group: "yn", type: "yn" },
      { id: "canon_where", group: "where", type: "where" },
    ]
    : [
      { id: "canon_yn", group: "yn", type: "yn", stage715DisplayText: "Кажется, нет…", stage715ScriptedChoiceId: "yn_no" },
      { id: "canon_who", group: "who", type: "who", stage715DisplayText: "Думаю, Олег, но это не точно…", stage715ScriptedChoiceId: "who_oleg" },
      { id: "canon_where", group: "where", type: "where", stage715DisplayText: "Похоже, там, где Америка…", stage715ScriptedChoiceId: "where_america" },
    ]);
  let battle = {
    id: "stage7_15_nastya_battle", battleId: "stage7_15_nastya_battle", opponentId: "npc_stage7_mika",
    fromThem: true, status: "pickDefense", resolved: false, finished: false, result: null,
    attackHidden: true,
    attack: { id: "nastya_prompt", text: "Ты на проблемы нарываешься?", displayText: "Ты на проблемы нарываешься?", color: "o", _color: "o", group: "yn", type: "yn" },
    meta: { stage715DemoBattle: true, stage715BattleId: "stage7_15_nastya_battle", stage715NastyaBattle: true },
    _defenseChoices: makeChoices(false),
  };
  state.battles.push(battle);
  const UI = {
    S: state, pushChat(entry) { state.chat.push(entry); if (state.chat !== chat) chat.push(entry); }, pushSystem(text) { const entry = { system: true, text }; state.chat.push(entry); if (state.chat !== chat) chat.push(entry); },
    renderAll() {}, requestRenderAll() {}, renderEvents() {}, renderBattles() {},
    ensurePanelExpanded() {}, ensureEventsExpanded() {}, setPanelSize() {},
    displayNameByIdOrName(id) { return id === "me" ? state.me.name : (state.players[id] || {}).name; },
    sendChat() {},
  };
  const document = { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } };
  const Game = {
    __S: state, UI, __D: { moneyLog: [] }, Data: { START_POINTS_NPC: 10, t: () => "Споры" }, Telemetry: { action() {} },
    ConflictEconomy: {
      transferPoints(from, to, amount, reason, meta = {}) {
        const src = from === "me" ? state.me : sourceAccounts[from];
        const dst = to === "me" ? state.me : sourceAccounts[to];
        if (!src || !dst || src.points < amount) return { ok: false, reason: "insufficient_points" };
        src.points -= amount; dst.points += amount;
        const row = { sourceId: from, targetId: to, amount, reason, battleId: meta.battleId };
        ledger.push(row); Game.__D.moneyLog.push(row); return { ok: true };
      },
    },
    __A: {
      transferRep(from, to, amount, reason, battleId) {
        if (from === "me" && state.rep < amount) return { ok: false, reason: "insufficient_rep" };
        state.rep += (to === "me" ? amount : -amount);
        return { ok: true, reason, battleId };
      },
      restoreRepSnapshot(value) { state.rep = Number(value) | 0; return { ok: true }; },
      emitStatDelta() {}, syncMeToPlayers() {},
    },
    Conflict: {
      myDefenseOptions() { return makeChoices(true); },
      pickDefense(id, choiceId) {
        const selected = battle._defenseChoices.find((choice) => choice.id === choiceId);
        battle.defense = selected; battle.status = "finished"; battle.result = "lose";
        battle.outcome = "lose"; battle.resolved = battle.finished = true;
        const points = Game.ConflictEconomy.transferPoints("me", "sink", 3, "battle_generic_loss", { battleId: id });
        if (points.ok) Game.__A.transferRep("me", "crowd_pool", 1, "generic_loss", id);
        return true;
      },
    },
    Events: {
      addEvent(event) { if (!state.events.some((item) => item.id === event.id)) state.events.push(event); },
      finalizeOpenEventNow(event) {
        event.resolved = true; event.state = "resolved"; event.crowd.decided = true; event.crowd.winner = "a";
        return true;
      },
    },
  };
  const window = { Game, document, localStorage, location: { search: "" }, URLSearchParams,
    setTimeout: setTimeoutFake, clearTimeout: clearFake, setInterval() { return nextId++; }, clearInterval: clearFake };
  window.window = window;
  const context = { window, document, URLSearchParams, Date: FakeDate, Math: Object.create(Math),
    setTimeout: setTimeoutFake, clearTimeout: clearFake, setInterval: window.setInterval,
    clearInterval: clearFake, localStorage, console };
  context.Math.random = () => 0;
  vm.runInNewContext(source, context);
  const controller = Game.Stage715Demo;
  controller.claimResume({ state, UI, playerName: "Тестер" });
  battle = state.battles.find((entry) => entry.id === "stage7_15_nastya_battle") || battle;
  return { state, battle, Game, controller, get chat() { return state.chat; }, ledger, timerLog, advance, localStorage, storage: storageMap, context, UI };
}

// Reconstruct exact baseline behavior with the same semantic interaction path.
const baseline = makeRuntime(baselineSource);
baseline.controller.handleNastyaDefenseChoice(baseline.battle.id, "canon_who");
const baselineRed = {
  exactLossGateMissing: baseline.battle.meta.stage715NastyaRematchGate !== true,
  scriptedLossLineMissing: !baseline.chat.some((m) => m.text === "Что ж, за слова отвечать надо, иногда даже толпа тебя не спасёт. Вызывай на реванш за 1💰!"),
  selectedAnswerMorphsOrMissing: baseline.battle.meta.stage715SelectedDefenseText !== "Думаю, Олег, но это не точно…",
  initialEconomyWrong: baseline.state.rep !== 2 || baseline.state.me.points !== 8,
  onlyRematchActionUnavailable: typeof baseline.Game.Stage715Demo.startNastyaRematch !== "function",
};
console.log("RED_BASELINE_73494758000c5666aeb77f408094f9b99fc16584 " + JSON.stringify({
  defects: baselineRed,
  observed: { result: baseline.battle.result, repDelta: baseline.state.rep - 3,
    moneyDelta: baseline.state.me.points - 10, scriptedLossLineCount: baseline.chat.filter((m) => m.text === "Что ж, за слова отвечать надо, иногда даже толпа тебя не спасёт. Вызывай на реванш за 1💰!").length,
    rematchGate: baseline.battle.meta.stage715NastyaRematchGate === true,
    selectedText: baseline.battle.meta.stage715SelectedDefenseText },
}));
assert(Object.values(baselineRed).some(Boolean), "baseline must reproduce the authorized Atom 4 defect");

function chooseWrong(rt, initial = false) {
  const choice = initial ? "canon_who" : "canon_yn";
  assert.strictEqual(rt.controller.handleNastyaDefenseChoice(rt.battle.id, choice), true);
}
function simulateInterruptedChatCommit(storage, line) {
  for (const [key, raw] of storage.entries()) {
    if (typeof raw !== "string" || !raw.startsWith("{\"version\":1,")) continue;
    const envelope = JSON.parse(raw);
    if (!envelope.state || !Array.isArray(envelope.state.chat)) continue;
    envelope.state.chat = envelope.state.chat.filter((entry) => entry.text !== line);
    storage.set(key, JSON.stringify(envelope));
    return true;
  }
  return false;
}

let loop = makeRuntime(currentSource);
loop.controller.handleNastyaDefenseChoice(loop.battle.id, "canon_who");
loop.advance(2500);
assert.strictEqual(loop.battle.meta.stage715SelectedDefenseText, "Думаю, Олег, но это не точно…");
assert.strictEqual(loop.battle.result, "lose");
assert.strictEqual(loop.state.rep, 2);
assert.strictEqual(loop.state.me.points, 8);
assert.strictEqual(loop.chat.filter((m) => m.text === "Что ж, за слова отвечать надо, иногда даже толпа тебя не спасёт. Вызывай на реванш за 1💰!").length, 1);
assert.strictEqual(loop.battle.meta.stage715NastyaRematchGate, true);
assert.strictEqual(loop.battle.attack.text, "Ты на проблемы нарываешься?");
assert.strictEqual(loop.battle.attack.color, "o");
assert.strictEqual(loop.battle.defense.color, "y");
assert.strictEqual(loop.battle.crowd, null);
assert.strictEqual(simulateInterruptedChatCommit(loop.storage, "Что ж, за слова отвечать надо, иногда даже толпа тебя не спасёт. Вызывай на реванш за 1💰!"), true);
let resumed = makeRuntime(currentSource, "intro", loop.storage);
resumed.advance(3000);
assert.strictEqual(resumed.battle.meta.stage715NastyaRematchGate, true);
assert.strictEqual(resumed.state.me.points, 8); assert.strictEqual(resumed.state.rep, 2);
assert.strictEqual(resumed.chat.filter((m) => m.text === "Что ж, за слова отвечать надо, иногда даже толпа тебя не спасёт. Вызывай на реванш за 1💰!").length, 1);
loop = resumed;
assert.strictEqual(loop.Game.Stage715Demo.startNastyaRematch(loop.battle.id), true);
assert.strictEqual(loop.state.me.points, 7);
assert.strictEqual(loop.battle.attack.text, "Ну и кто всё это начал?");
assert.strictEqual(JSON.stringify(loop.battle._defenseChoices.map((choice) => choice.stage715DisplayText)), JSON.stringify(["Кажется, Райхан…", "Похоже, нет…", "Наверное, там, где Площадь…"]));
resumed = makeRuntime(currentSource, "intro", loop.storage);
assert.strictEqual(resumed.state.me.points, 7, "reload after rematch purchase charged again");
assert.strictEqual(resumed.battle.meta.stage715NastyaPaidRematches, 1);
loop = resumed;
chooseWrong(loop);
assert.strictEqual(loop.battle.meta.stage715NastyaFailedPaidRematches, 1);
assert.strictEqual(loop.state.me.points, 7, "wrong rematch must not charge generic loss economy");
assert.strictEqual(loop.state.rep, 2, "wrong rematch must not repeat initial REP penalty");
assert.strictEqual(loop.battle.meta.stage715NastyaRematchGate, true);
assert.strictEqual(loop.battle.attack.text, "Ну и кто всё это начал?", "failed paid rematch must preserve its prompt");
assert.strictEqual(loop.battle.attack.color, "o");
assert.strictEqual(loop.battle.defense.color, "y");
resumed = makeRuntime(currentSource, "intro", loop.storage);
assert.strictEqual(resumed.battle.meta.stage715NastyaFailedPaidRematches, 1);
assert.strictEqual(resumed.state.me.points, 7, "failed-rematch reload charged or changed money");
loop = resumed;
assert.strictEqual(loop.Game.Stage715Demo.startNastyaRematch(loop.battle.id), true);
assert.strictEqual(loop.state.me.points, 6);
resumed = makeRuntime(currentSource, "intro", loop.storage);
assert.strictEqual(resumed.state.me.points, 6, "reload after second purchase charged again");
assert.strictEqual(resumed.battle.attack.text, "Ну и кто всё это начал?");
loop = resumed;
chooseWrong(loop);
loop.advance(2500);
assert.strictEqual(loop.battle.meta.stage715NastyaFailedPaidRematches, 2);
assert.strictEqual(loop.battle.meta.stage715NastyaRematchGate, false);
assert.strictEqual(loop.chat.filter((m) => m.text === "Хорош деньги сливать, я сдаюсь. Не злишься?").length, 1);
assert.strictEqual(loop.state.rep, 2);
assert.strictEqual(loop.state.me.points, 6, "surrender must not charge a third rematch");
assert.strictEqual(loop.battle.result, "lose", "surrender must wait before victory");
assert.strictEqual(loop.state.me.wins, 0);
resumed = makeRuntime(currentSource, "intro", loop.storage);
assert.strictEqual(resumed.battle.meta.stage715NastyaSurrenderWaitingReply, true);
assert.strictEqual(resumed.battle.attack.text, "Ну и кто всё это начал?", "surrender checkpoint must preserve the paid rematch prompt");
assert.strictEqual(resumed.battle.attack.color, "o");
assert.strictEqual(resumed.battle.defense.color, "y");
assert.strictEqual(resumed.battle.result, "lose");
assert.strictEqual(resumed.state.me.points, 6); assert.strictEqual(resumed.state.rep, 2);
assert.strictEqual(resumed.state.me.wins, 0);
assert.strictEqual(resumed.chat.filter((m) => m.text === "Хорош деньги сливать, я сдаюсь. Не злишься?").length, 1);
loop = resumed;
assert.strictEqual(loop.controller.handlePlayerMessage("да, нормально"), true);
loop.advance(3500);
assert.strictEqual(loop.battle.result, "win");
assert.strictEqual(loop.state.rep, 4);
assert.strictEqual(loop.state.me.points, 8);
assert.strictEqual(loop.state.me.wins, 1);
assert.strictEqual(loop.chat.filter((m) => m.text === "Ладно, возможно я была неправа. На сколько твоя репутация выросла от победы над оранжевым тоном?").length, 1);
assert.strictEqual(loop.state.battles.some((b) => b.meta && b.meta.stage715OlegBattle), false);
resumed = makeRuntime(currentSource, "intro", loop.storage);
assert.strictEqual(resumed.state.rep, 4); assert.strictEqual(resumed.state.me.points, 8); assert.strictEqual(resumed.state.me.wins, 1);
assert.strictEqual(resumed.battle.meta.stage715NastyaRewardsApplied, true);
assert.strictEqual(resumed.chat.filter((m) => m.text === "Хорош деньги сливать, я сдаюсь. Не злишься?").length, 1);
assert.strictEqual(resumed.chat.filter((m) => m.text === "Ладно, возможно я была неправа. На сколько твоя репутация выросла от победы над оранжевым тоном?").length, 1);

const correct = makeRuntime(currentSource);
correct.controller.handleNastyaDefenseChoice(correct.battle.id, "canon_who");
correct.controller.startNastyaRematch(correct.battle.id);
const nastyaExplanation = "Видишь, у меня аргумент оранжевый, а у тебя жёлтые? Это значит у меня выше влияние и поэтому тон сильнее, поэтому тут тебе просто так не выкрутиться. Толпа решит твою судьбу. Ясно тебе?";
const explanationCountBeforeRematchAnswer = correct.chat.filter((m) => m.text === nastyaExplanation).length;
assert.strictEqual(correct.controller.handleNastyaDefenseChoice(correct.battle.id, "canon_who"), true);
assert.strictEqual(correct.state.events.length, 1, "correct paid rematch must start Events voting immediately");
assert.strictEqual(correct.battle.meta.stage715NastyaChatReplyPending, false, "correct rematch must not create a chat gate");
assert.strictEqual(correct.chat.filter((m) => m.text === nastyaExplanation).length, explanationCountBeforeRematchAnswer,
  "correct rematch must not emit the Atom 3 Nastya explanation again");
assert.strictEqual(correct.battle.meta.stage715NastyaSelectedAnswer, "Кажется, Райхан…");
assert.strictEqual(correct.battle.crowd, null, "Events, not Battles, must own the crowd");
assert.strictEqual(correct.state.flags.stage715EventsPanelRevealed, true);
const correctResume = makeRuntime(currentSource, "intro", correct.storage);
assert.strictEqual(correctResume.state.events.length, 1, "reload during direct Events vote must not duplicate or lose the event");
assert.strictEqual(correctResume.battle.meta.stage715NastyaSelectedAnswer, "Кажется, Райхан…");
assert.strictEqual(correctResume.state.me.points, 7, "reload after correct paid rematch must not charge again");
assert.strictEqual(correctResume.battle.meta.stage715NastyaChatReplyPending, false);
correctResume.advance(15000);
const event = correctResume.state.events[0];
assert.strictEqual(Object.keys(event.crowd.voters).length, 5);
assert.strictEqual(event.crowd.aVotes, 3); assert.strictEqual(event.crowd.bVotes, 2);
assert(event.crowd.scriptedVoteAt.every((at, i, list) => !i || (at-list[i-1] >= 1000 && at-list[i-1] <= 2000)));
assert.strictEqual(correctResume.battle.result, "win");
assert.strictEqual(correctResume.state.rep, 4, "correct rematch must converge to the canonical +2 REP victory settlement");
assert.strictEqual(correctResume.state.me.points, 9, "correct rematch must settle +2 money after initial loss and one paid rematch");
assert.strictEqual(correctResume.state.me.wins, 1);
assert(correctResume.chat.some((m) => m.text === "Тебя поддержало большинство."));
assert.strictEqual(correctResume.chat.filter((m) => m.text === "Тебя поддержало большинство.").length, 1);
assert.strictEqual(correctResume.chat.filter((m) => m.text === "Ладно, возможно я была неправа. На сколько твоя репутация выросла от победы над оранжевым тоном?").length, 1);
assert.strictEqual(correctResume.state.battles.some((b) => b.meta && b.meta.stage715OlegBattle), false);
const lossUiBranch = uiSource.slice(uiSource.indexOf('if (b.meta && b.meta.stage715NastyaBattle === true\n        && (b.meta.stage715NastyaRematchGate'), uiSource.indexOf('emitBattleCardRenderLog(b.id, isOutgoingCard, logMeta);', uiSource.indexOf('if (b.meta && b.meta.stage715NastyaBattle === true\n        && (b.meta.stage715NastyaRematchGate')));
assert(lossUiBranch.includes('argumentColors: getBattleArgumentColorKeys(b)'), "loss card must use existing revealed argument color keys");
assert(lossUiBranch.includes('labels: { opponent: "Аргумент", mine: "Твой контраргумент" }'), "loss card must use canonical argument labels");
assert(lossUiBranch.includes('"stage715-nastya-loss-prompt"') && lossUiBranch.includes('"stage715-nastya-selected-answer"'),
  "loss card must expose focused prompt and counterargument DOM markers");
assert(lossUiBranch.includes('rematch.textContent = "Реванш!"'), "loss gate must expose the single rematch action");
assert(!lossUiBranch.includes('"Закрыть"') && !lossUiBranch.includes('"Уйти"') && !lossUiBranch.includes('"Отойти"'),
  "forced loss/surrender branch must not add unrelated actions");
assert(uiSource.includes('chip.className = clsForColor(resolvedColorKey)'), "the shared resolved renderer must map revealed colors to visible chip classes");
console.log("PASS_STAGE7_15_ATOM4_NASTYA_REMATCH_SEMANTIC_RUNTIME");
'''

subprocess.run(["node", "-e", node], cwd=ROOT, check=True)
print("PASS_STAGE7_15_ATOM4_NASTYA_REMATCH")
