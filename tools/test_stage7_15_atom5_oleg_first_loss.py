from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
BATTLES = ROOT / "AsyncScene/Web/ui/ui-battles.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
BATTLES_DOCS = ROOT / "docs/ui/ui-battles.js"
INDEX = ROOT / "AsyncScene/Web/index.html"
INDEX_DOCS = ROOT / "docs/index.html"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


stage = STAGE.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")

# The greeting belongs in public chat once; the prompt and answer set belong
# only to the battle card.
start = stage[stage.index("  function startOlegBattle()") : stage.index("  function watchOlegBattle()")]
require(start.count("text: OLEG_BATTLE_LINE") == 1, "Oleg greeting must be emitted exactly once")
require("OLEG_BATTLE_PROMPT}\\n1." not in start, "Oleg prompt and choices must not be duplicated in public chat")
require("OLEG_FIRST_LOSS_DELAY_MS" in stage, "scripted Oleg sequence must own its explicit timing interval")
require(re.search(r"OLEG_FIRST_LOSS_DELAY_MS\s*=\s*1_?000", stage), "scripted Oleg delays must be exactly 1000 ms")

# The first selected answer resolves once, while presentation and follow-up
# are staged by durable Oleg metadata rather than the generic battle clock.
for marker in (
    "stage715OlegBattle",
    "stage715OlegResultRevealAt",
    "stage715OlegPublicLossAt",
    "stage715OlegDmAt",
    "stage715OlegResultRecorded",
):
    require(marker in stage, f"missing durable Oleg checkpoint: {marker}")
require("rematchRequestCount" not in stage, "the first-loss controller must not gate the tutorial on rematches")
require("OLEG_REMATCH_LINE" not in stage, "the obsolete mandatory rematch dialogue gate must be removed")

# A resolved first-loss card is retained without actions; generic battles keep
# their existing action path because these rules are behind explicit metadata.
require("stage715OlegNoPostLossActions" in battles, "first-loss Oleg card must explicitly suppress all actions")
require("stage715OlegResultRevealed !== true" in battles, "Oleg result and colors must stay hidden until the scripted reveal")
require("if (!stage715OlegNoPostLossActions)" in battles, "first-loss Oleg card must omit the close action")
require("clsForColor(stage715OlegDemo ? null : p.color, stage715OlegDemo)" not in battles,
        "Oleg defense colors must not be deliberately suppressed before selection")
require(re.search(r"chip\.className\s*=\s*clsForColor\(stage715OlegDemo\s*\?\s*\"y\"\s*:\s*p\.color\)", battles),
        "Oleg defense choices must render their yellow player color before selection")
require("isStage715OlegScriptedBattle(b)" in battles, "Oleg-only UI behavior must use explicit script metadata")

for source, deployed in ((STAGE, STAGE_DOCS), (BATTLES, BATTLES_DOCS)):
    require(source.read_bytes() == deployed.read_bytes(), f"mirror mismatch: {source.name}")
    subprocess.run(["node", "--check", str(source)], cwd=ROOT, check=True)

require(INDEX.read_bytes() == INDEX_DOCS.read_bytes(), "Web/docs index mirror mismatch")
for script in ("ui-battles.js", "ui-stage7-first-experience.js"):
    require(re.search(rf'{re.escape(script)}\?v=[A-Za-z0-9_-]+', INDEX.read_text(encoding="utf-8")),
            f"deployment cache token missing for {script}")

runtime_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");

function makeClock() {
  let now = 100000;
  let nextId = 1;
  const timers = new Map();
  function add(fn, delay, interval) {
    const id = nextId++;
    timers.set(id, { id, fn, at: now + Math.max(0, Number(delay) || 0), interval });
    return id;
  }
  function clear(id) { timers.delete(id); }
  function tick(ms) {
    const end = now + ms;
    while (true) {
      const next = [...timers.values()].filter((timer) => timer.at <= end)
        .sort((a, b) => a.at - b.at || a.id - b.id)[0];
      if (!next) break;
      now = next.at;
      if (!timers.has(next.id)) continue;
      if (next.interval) next.at += next.interval;
      else timers.delete(next.id);
      next.fn();
    }
    now = end;
  }
  class FakeDate extends Date { static now() { return now; } }
  return { tick, now: () => now, setTimeout: (fn, ms) => add(fn, ms, 0),
    clearTimeout: clear, setInterval: (fn, ms) => add(fn, ms, ms), clearInterval: clear, FakeDate };
}

function runChoice(choiceIndex, reloadBeforeReveal, reloadBeforeDm = false) {
  const clock = makeClock();
  const storage = new Map();
  const choices = [
    { id: "canon_where", group: "where" },
    { id: "canon_who", group: "who" },
    { id: "canon_yn", group: "yn" },
  ];
  const expectedText = ["Возможно, там, где Подворотня…", "Думаю, Райхан…", "Кажется, нет…"];
  const state = {
    flags: { stage715Demo: true, stage715DemoPhase: "next_scripted_flow", stage715NastyaPostWinReplyReceived: true, stage715NastyaWon: true },
    me: { id: "me", name: "Тестер", points: 10, wins: 2 }, rep: 1,
    players: { me: { id: "me", name: "Тестер", points: 10 } }, battles: [{
      id: "stage7_15_nastya_battle", status: "finished", result: "win", outcome: "win", resolved: true, finished: true,
      meta: { stage715NastyaBattle: true, stage715BattleId: "stage7_15_nastya_battle", stage715NastyaPostWinQuestionShown: true },
    }], events: [], chat: [{ name: "Настя", text: "Ладно, возможно я была неправа. На сколько твоя репутация выросла от победы над оранжевым тоном?" }],
  };
  const UI = {
    S: state, openIds: [],
    pushChat(entry) { this.S.chat.push(entry); }, pushSystem() {}, requestRenderAll() {}, renderAll() {},
    renderBattles() {}, renderDM() {}, openDM(id) { this.openIds.push(id); },
    ensurePanelExpanded() {}, ensureEventsExpanded() {}, setPanelSize() {},
  };
  let dmLines = [];
  let settlementCount = 0;
  const Game = {
    __S: state, UI, Data: { START_POINTS_NPC: 10, t: () => "Споры" }, Telemetry: { action() {} },
    __A: { pushDm(id, name, text) { dmLines.push({ id, name, text }); }, syncMeToPlayers() {} },
    Conflict: {
      incoming(opponentId) {
        const battle = { id: "stage7_15_oleg_battle", opponentId, status: "pickDefense", resolved: false,
          finished: false, result: null, outcome: null, attackHidden: true, meta: {}, defense: null };
        state.battles.push(battle);
        return battle;
      },
      myDefenseOptions() { return choices; },
      pickDefense(id, choiceId) {
        const battle = state.battles.find((entry) => entry.id === id);
        const choice = battle._defenseChoices.find((entry) => entry.id === choiceId);
        if (battle.meta.settled) return false;
        battle.meta.settled = true;
        settlementCount += 1;
        state.me.points -= 2; state.rep -= 2;
        battle.defense = { text: choice.stage715DisplayText, stage715DisplayText: choice.stage715DisplayText, color: "y" };
        battle.attack.color = "r"; battle.attackHidden = false;
        battle.result = battle.outcome = "lose"; battle.status = "finished"; battle.resolved = battle.finished = true;
        return true;
      },
    },
  };
  const document = { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } };
  const localStorage = { getItem(k) { return storage.get(k) || null; }, setItem(k, v) { storage.set(k, String(v)); }, removeItem(k) { storage.delete(k); } };
  function boot(nextState) {
    const game = Game;
    game.__S = nextState; game.UI.S = nextState;
    const window = { Game: game, localStorage, document, location: { search: "" }, URLSearchParams,
      Date: clock.FakeDate, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
      setInterval: clock.setInterval, clearInterval: clock.clearInterval };
    window.window = window;
    const context = { window, document, URLSearchParams, Date: clock.FakeDate,
      setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
      setInterval: clock.setInterval, clearInterval: clock.clearInterval, console };
    vm.runInNewContext(source, context);
    const result = game.Stage715Demo.claimResume({ state: nextState, UI: game.UI });
    assert.strictEqual(result.claimed, true);
    return game.Stage715Demo;
  }
  let controller = boot(state);
  let visibleState = state;
  const greetingDelay = Math.max(1100, Math.min(2800, "слыш ты, совсем нюх потерялся да? надо тебя на место поставить.".length * 24));
  clock.tick(greetingDelay - 1);
  assert.strictEqual(state.chat.filter((line) => line.text === "слыш ты, совсем нюх потерялся да? надо тебя на место поставить.").length, 0,
    "greeting appeared before its scripted typing completed");
  clock.tick(1);
  assert.strictEqual(state.chat.filter((line) => line.text === "слыш ты, совсем нюх потерялся да? надо тебя на место поставить.").length, 1);
  assert.strictEqual(state.battles.some((battle) => battle.meta.stage715OlegBattle === true), false,
    "battle card appeared before the 1000 ms post-greeting delay");
  clock.tick(999);
  assert.strictEqual(state.battles.some((battle) => battle.meta.stage715OlegBattle === true), false);
  clock.tick(1);
  let battle = state.battles.find((entry) => entry.meta.stage715OlegBattle === true);
  assert(battle, "Oleg card did not appear at the 1000 ms checkpoint");
  assert.strictEqual(battle.attackHidden, true, "Oleg argument color revealed before selection");
  assert.strictEqual(JSON.stringify(battle._defenseChoices.map((choice) => choice.stage715DisplayText)), JSON.stringify(expectedText));
  controller.handleOlegDefenseChoice(battle.id, battle._defenseChoices[choiceIndex].id);
  assert.strictEqual(battle.meta.stage715SelectedDefenseText, expectedText[choiceIndex], "selected answer text changed");
  assert.strictEqual(battle.meta.stage715OlegResultRevealed, false, "result revealed immediately after answer");
  assert.strictEqual(state.chat.some((line) => line.text.startsWith("нефига лезть на взрослых дядек!")), false);
  assert.strictEqual(dmLines.length, 0);
  assert.strictEqual(settlementCount, 1);
  assert.strictEqual(state.me.points, 8);
  assert.strictEqual(state.rep, -1);
  assert.strictEqual(state.me.wins, 2);
  if (reloadBeforeReveal) {
    controller.destroy();
    const resumed = { flags: {}, me: {}, players: {}, battles: [], events: [], chat: [] };
    controller = boot(resumed);
    assert.strictEqual(resumed.battles.length, 2, "reload duplicated/lost the preserved battle checkpoint");
    assert.strictEqual(settlementCount, 1, "reload repeated resource settlement");
    visibleState = resumed;
    battle = resumed.battles.find((entry) => entry.meta.stage715OlegBattle === true);
  }
  clock.tick(999);
  assert.strictEqual(battle.meta.stage715OlegResultRevealed, false, "result/colors appeared before 1000 ms");
  clock.tick(1);
  assert.strictEqual(battle.meta.stage715OlegResultRevealed, true);
  assert.strictEqual(visibleState.chat.some((line) => line.text.startsWith("нефига лезть на взрослых дядек!")), false,
    "public loss line appeared before its follow-up delay");
  clock.tick(999);
  assert.strictEqual(visibleState.chat.some((line) => line.text.startsWith("нефига лезть на взрослых дядек!")), false);
  clock.tick(1);
  assert.strictEqual(visibleState.chat.filter((line) => line.text.startsWith("нефига лезть на взрослых дядек!")).length, 1);
  assert.strictEqual(dmLines.length, 0, "DM appeared without its 1000 ms post-message delay");
  if (reloadBeforeDm) {
    controller.destroy();
    const resumed = { flags: {}, me: {}, players: {}, battles: [], events: [], chat: [] };
    controller = boot(resumed);
    visibleState = resumed;
    battle = resumed.battles.find((entry) => entry.meta.stage715OlegBattle === true);
    assert(battle && battle.meta.stage715OlegPublicLossLineShown === true);
    assert.strictEqual(visibleState.chat.filter((line) => line.text.startsWith("нефига лезть на взрослых дядек!")).length, 1,
      "resume duplicated the public loss line");
  }
  clock.tick(999);
  assert.strictEqual(dmLines.length, 0);
  clock.tick(1);
  assert.strictEqual(dmLines.length, 1);
  assert.deepStrictEqual(UI.openIds, ["npc_bandit"]);
  assert.strictEqual(visibleState.flags.stage715DmPanelRevealed, true);
  controller.destroy();
}

runChoice(0, true);
runChoice(1, false);
runChoice(2, false, true);
console.log("PASS_STAGE7_15_ATOM5_OLEG_SEQUENCE_FAKE_TIMERS");
'''
subprocess.run(["node", "-e", runtime_test], cwd=ROOT, check=True)

print("PASS_STAGE7_15_ATOM5_OLEG_FIRST_LOSS_CONTRACT")
