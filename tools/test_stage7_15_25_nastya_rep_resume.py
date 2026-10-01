from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STATE = ROOT / "AsyncScene/Web/state.js"
STATE_DOCS = ROOT / "docs/state.js"

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const stateSource = fs.readFileSync("AsyncScene/Web/state.js", "utf8");
const restoreStart = stateSource.indexOf("  function restoreRepSnapshot(value, source){");
const restoreEnd = stateSource.indexOf("\n  function maybeDailyRepBonus", restoreStart);
assert(restoreStart >= 0 && restoreEnd > restoreStart, "StateAPI snapshot restore method missing");
const restoreFunction = stateSource.slice(restoreStart, restoreEnd);
assert(stateSource.includes("    restoreRepSnapshot,") && stateSource.includes("StateAPI.restoreRepSnapshot"), "REP restore must be exported and protected by StateAPI");
assert(fs.readFileSync("docs/state.js").includes(restoreFunction), "deployed state mirror lacks the authorized restore method");
const storage = new Map();

function guardedState(data, startRep) {
  let rep = startRep;
  let writeDepth = 0;
  const state = { ...data };
  delete state.rep;
  Object.defineProperty(state, "rep", {
    configurable: true, enumerable: true,
    get() { return rep; },
    set(value) { if (writeDepth > 0) rep = Number.isFinite(Number(value)) ? Number(value) | 0 : 0; },
  });
  return { state, withRepWrite(fn) { writeDepth += 1; try { return fn(); } finally { writeDepth -= 1; } } };
}

function runtime(guarded) {
  const { state, withRepWrite } = guarded;
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  const document = { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } };
  const UI = {
    S: state, renderAll() {}, requestRenderAll() {}, renderEvents() {}, renderBattles() {},
    ensurePanelExpanded() {}, ensureEventsExpanded() {}, setPanelSize() {},
    pushChat(entry) { state.chat = state.chat || []; state.chat.push(entry); }, pushSystem() {}, sendChat() {},
  };
  const stateContext = { State: state, withRepWrite, Number };
  vm.createContext(stateContext);
  vm.runInContext(restoreFunction + "\nthis.restoreRepSnapshot = restoreRepSnapshot;", stateContext);
  const Game = {
    __S: state, UI, Data: { START_POINTS_NPC: 10, t: () => "Споры" },
    Telemetry: { action() {} }, __A: { syncMeToPlayers() {}, restoreRepSnapshot: stateContext.restoreRepSnapshot },
  };
  const window = { Game, localStorage, document, location: { search: "" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval };
  window.window = window;
  const context = { window, document, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console };
  vm.runInNewContext(source, context);
  return { state, UI, Game };
}

const baselineRep = 3;
const postWinQuestion = "Ладно, возможно я была неправа. На сколько твоя репутация выросла от победы над оранжевым тоном?";
const settled = guardedState({
  flags: { stage715Demo: true, stage715DemoPhase: "nastya_post_win_waiting_reply", stage715NastyaPostWinQuestionShown: true },
  me: { id: "me", name: "Тестер", points: 9, wins: 1 }, rep: baselineRep + 2,
  players: { npc_stage7_mika: { id: "npc_stage7_mika", name: "Настя", npc: true, role: "crowd", points: 10 } },
  battles: [{ id: "stage7_15_nastya_battle", status: "finished", resolved: true, finished: true, result: "win",
    attack: { text: "Ты на проблемы нарываешься?", color: "o", _color: "o" },
    meta: { stage715DemoBattle: true, stage715NastyaRewardsApplied: true,
      stage715NastyaRewardBaseline: { rep: baselineRep, points: 7, wins: 0 },
      stage715NastyaReward: { rep: 2, money: 2, wins: 1 },
      stage715NastyaPostWinQuestionShown: true } }],
  events: [], chat: [{ name: "Настя", text: postWinQuestion }],
}, baselineRep + 2);
const first = runtime(settled);
assert.strictEqual(first.Game.Stage715Demo.claimResume({ state: settled.state, UI: first.UI, playerName: "Тестер" }).claimed, true);
assert.strictEqual(settled.state.rep - baselineRep, 2, "Nastya correct-win checkpoint must contain REP +2");
assert.strictEqual(settled.state.me.points, 9, "money checkpoint must contain exactly +2");
assert.strictEqual(settled.state.me.wins, 1, "wins checkpoint must contain exactly +1");
assert.strictEqual(settled.state.chat.filter((entry) => entry.text === postWinQuestion).length, 1);
assert(storage.has("AsyncScene_stage715_gameplay_v1"), "Stage 7.15 save/checkpoint was not written");

const restored = guardedState({ flags: {}, me: {}, players: {}, battles: [], events: [], chat: [] }, 0);
const second = runtime(restored);
assert.strictEqual(second.Game.Stage715Demo.hasPersistedCheckpoint(), true);
assert.strictEqual(second.Game.Stage715Demo.claimResume({ state: restored.state, UI: second.UI, playerName: "Тестер" }).claimed, true);
assert.strictEqual(restored.state.rep - baselineRep, 2,
  "RED: authorized REP checkpoint restore must preserve the settled +2 after reload/resume");
assert.strictEqual(restored.state.me.points, 9, "reload changed persisted money");
assert.strictEqual(restored.state.me.wins, 1, "reload changed persisted wins");
assert.strictEqual(restored.state.battles[0].meta.stage715NastyaRewardsApplied, true);
assert.strictEqual(restored.state.battles.some((battle) => battle.id === "stage7_15_oleg_battle"), false,
  "Oleg battle started before the player's answer to Nastya");
assert.strictEqual(restored.state.chat.filter((entry) => entry.text === postWinQuestion).length, 1,
  "reload duplicated or lost the exact post-win Nastya question");
assert.strictEqual(restored.state.flags.stage715NastyaPostWinQuestionShown, true);

const ordinary = guardedState({ flags: {}, me: {}, players: {}, battles: [], events: [], chat: [] }, 1);
const ordinaryContext = { State: ordinary.state, withRepWrite: ordinary.withRepWrite, Number };
vm.createContext(ordinaryContext);
vm.runInContext(restoreFunction + "\nthis.restoreRepSnapshot = restoreRepSnapshot;", ordinaryContext);
assert.strictEqual(ordinaryContext.restoreRepSnapshot(5, "stage715_checkpoint").ok, false,
  "ordinary state must not use the Stage 7.15-only snapshot restore");
assert.strictEqual(ordinary.state.rep, 1, "unauthorized ordinary restore changed REP");
console.log("PASS_STAGE7_15_25_NASTYA_REP_RESUME");
process.exit(0);
'''

if __name__ == "__main__":
    subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
