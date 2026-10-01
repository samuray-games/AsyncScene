from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "docs/ui/ui-stage7-first-experience.js"
STAGE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
BOOT = ROOT / "docs/ui/ui-boot.js"
BOOT_SOURCE = ROOT / "AsyncScene/Web/ui/ui-boot.js"
INDEX = ROOT / "docs/index.html"
INDEX_SOURCE = ROOT / "AsyncScene/Web/index.html"
BASELINE = "5eb5b1eb9c72699fafae6594133005a16df20f6b"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(STAGE.read_bytes() == STAGE_SOURCE.read_bytes(), "Stage 7.15 controller mirrors differ")
require(BOOT.exists() and BOOT_SOURCE.exists(), "boot mirrors missing")
stage_url = re.search(r"ui/ui-stage7-first-experience\.js\?v=([^\"']+)", INDEX.read_text())
baseline_index = subprocess.check_output(["git", "show", f"{BASELINE}:docs/index.html"], cwd=ROOT, text=True)
baseline_url = re.search(r"ui/ui-stage7-first-experience\.js\?v=([^\"']+)", baseline_index)
require(stage_url and baseline_url, "Stage 7.15 controller cache-bust URL missing")
baseline_stage = subprocess.check_output(["git", "show", f"{BASELINE}:docs/ui/ui-stage7-first-experience.js"], cwd=ROOT)
if STAGE.read_bytes() != baseline_stage:
    require(stage_url.group(1) != baseline_url.group(1), "changed deployed controller keeps the baseline cache-bust token")
for path in (STAGE, STAGE_DOCS, STAGE_SOURCE, BOOT, BOOT_SOURCE):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const stageSource = fs.readFileSync("docs/ui/ui-stage7-first-experience.js", "utf8");
const bootSource = fs.readFileSync("docs/ui/ui-boot.js", "utf8");
const storage = new Map();
const canonical = "ладно ладно, я понял, не ори. смари у тебя репутация выросла, денежек больше стало и победа первая появилась. кликни по этим “+1” чтоб не мусорили экран, заодно посмотри чо там в меню и дай знать когда закончишь";

function element(value = "") {
  return {
    value, textContent: "", innerHTML: "", dataset: {}, hidden: false,
    style: { removeProperty() {}, setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, appendChild() {}, removeChild() {}, remove() {},
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; }, focus() {}, click() {},
  };
}

function stageRuntime(state) {
  const document = { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } };
  const UI = {
    S: state, renderAll() {}, requestRenderAll() {}, renderEvents() {}, renderBattles() {},
    ensurePanelExpanded() {}, ensureEventsExpanded() {}, setPanelSize() {},
    pushChat(entry) { state.chat = state.chat || []; state.chat.push(entry); }, pushSystem() {}, sendChat() {},
  };
  const Game = {
    __S: state, UI, Data: { START_POINTS_NPC: 10, t: () => "Споры" },
    Telemetry: { action() {} }, __D: { moneyLog: [], toastLog: [] },
    __A: {
      transferRep(from, to, amount) { assert.strictEqual(from, "crowd_pool"); assert.strictEqual(to, "me"); state.rep += amount; return { ok: true }; },
      emitStatDelta() {}, syncMeToPlayers() {},
    },
    ConflictEconomy: {
      transferPoints(from, to, amount) {
        assert.strictEqual(from, "npc_stage7_ken"); assert.strictEqual(to, "me");
        state.players[from].points -= amount; state.me.points += amount;
        Game.__D.moneyLog.push({ sourceId: from, targetId: to, amount, currency: "points", battleId: "stage7_15_first_battle" });
        return { ok: true };
      },
    },
  };
  const immediateTimeout = (fn) => { fn(); return 1; };
  const window = { Game, localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) }, document,
    location: { search: "" }, URLSearchParams, setTimeout: immediateTimeout, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {} };
  window.window = window;
  const context = { window, document, URLSearchParams, setTimeout: immediateTimeout, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {}, console };
  vm.runInNewContext(stageSource, context);
  return { Game, UI, state };
}

const initial = {
  flags: { stage715Demo: true, stage715DemoPhase: "battle_unlocked", started: true }, isStarted: true,
  progress: { onboardingSeen: true }, me: { id: "me", name: "Тестер", points: 0, wins: 1 }, rep: 0,
  players: { npc_stage7_ken: { id: "npc_stage7_ken", name: "Райхан", npc: true, role: "crowd", points: 10 } },
  battles: [{ id: "stage7_15_first_battle", status: "finished", resolved: true, finished: true, result: "win",
    opponentId: "npc_stage7_ken", meta: { stage715DemoBattle: true, stage715BattleId: "stage7_15_first_battle",
      stage715RayhanRewardBaseline: { rep: 0, points: 0, wins: 0, rayhanPoints: 10 } } }],
  events: [], chat: [{ name: "Райхан", text: "всем привет в этом чатике!" }],
};
const produced = stageRuntime(initial);
assert.strictEqual(produced.Game.Stage715Demo.claimResume({ state: initial, UI: produced.UI, playerName: "Тестер" }).claimed, true);
assert.strictEqual(initial.flags.stage715DemoPhase, "rayhan_win_waiting_reply");
assert.strictEqual(initial.chat.filter((entry) => entry.text === canonical).length, 1, "canonical line missing before leaving gameplay");
const before = JSON.stringify({ phase: initial.flags.stage715DemoPhase, chat: initial.chat, rep: initial.rep, me: initial.me, battle: initial.battles[0] });
const persisted = JSON.parse(storage.get("AsyncScene_stage715_gameplay_v1"));
assert.strictEqual(persisted.state.flags.stage715DemoPhase, "rayhan_win_waiting_reply");
assert.strictEqual(persisted.state.flags.stage715RayhanRewardChatShown, true);
assert.strictEqual(persisted.state.chat.filter((entry) => entry.text === canonical).length, 1, "snapshot omitted canonical line");

function bootRuntime(state) {
  const elements = new Map();
  const getElementById = (id) => {
    if (!elements.has(id)) elements.set(id, element(id === "nameInput" ? "Тестер" : ""));
    return elements.get(id);
  };
  const document = { readyState: "complete", body: element(), documentElement: element(), getElementById,
    querySelector() { return null; }, querySelectorAll() { return []; }, createElement: () => element(), addEventListener() {} };
  let loops = 0;
  const UI = { S: state, $: getElementById, renderAll() {}, renderAllMinimal() {}, requestRenderAll() {}, renderEvents() {}, renderBattles() {},
    buildPlayers() {}, applyMobilePanelDefaults() {}, startLoops() { loops += 1; }, ensurePanelExpanded() {}, ensureEventsExpanded() {}, setPanelSize() {},
    pushChat(entry) { state.chat = state.chat || []; state.chat.push(entry); }, pushSystem() {}, sendChat() {} };
  const localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
  const Game = { __S: state, UI, Data: { START_POINTS_NPC: 10, START_POINTS_PLAYER: 0, t: () => "Споры", RANDOM_NAMES: ["Тестер"], pick: (items) => items[0] },
    Telemetry: { action() {}, setGameplayNickname() {} }, __A: { syncMeToPlayers() {}, seedPlayers() {} } };
  const window = { Game, localStorage, document, location: { search: "" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval,
    addEventListener() {}, removeEventListener() {} };
  window.window = window;
  const context = { window, document, URLSearchParams, location: window.location, navigator: {}, setTimeout, clearTimeout, setInterval, clearInterval, console, Date, Event: function Event() {} };
  vm.runInNewContext(stageSource, context);
  let claimCalls = 0;
  const claim = Game.Stage715Demo.claimResume;
  Game.Stage715Demo.claimResume = (next) => { claimCalls += 1; return claim(next); };
  vm.runInNewContext(bootSource, context);
  return { state, UI, Game, claimCalls: () => claimCalls, loops: () => loops };
}

const resumed = bootRuntime({ flags: {}, me: {}, players: {}, battles: [], events: [], chat: [] });
assert.strictEqual(resumed.claimCalls(), 1, "boot did not restore the persisted checkpoint");
assert.strictEqual(resumed.state.flags.stage715DemoPhase, "rayhan_win_waiting_reply");
assert.strictEqual(resumed.state.chat.filter((entry) => entry.text === canonical).length, 1);
const afterBoot = JSON.stringify({ phase: resumed.state.flags.stage715DemoPhase, chat: resumed.state.chat, rep: resumed.state.rep, me: resumed.state.me, battle: resumed.state.battles[0] });
assert.strictEqual(afterBoot, before, "boot restore changed durable checkpoint state");

// This is the repository-owned equivalent of Menu -> К старту -> Continue.
resumed.UI.returnToStartScreen();
assert.strictEqual(resumed.UI.$("startScreen").hidden, false);
resumed.UI.$("btnStart").onclick({ preventDefault() {}, stopPropagation() {} });
assert.strictEqual(resumed.claimCalls(), 2, "Continue did not use the boot resume path");
assert.strictEqual(resumed.state.flags.stage715DemoPhase, "rayhan_win_waiting_reply");
assert.strictEqual(resumed.state.chat.filter((entry) => entry.text === canonical).length, 1, "Continue duplicated or lost canonical line");
assert.strictEqual(JSON.stringify({ phase: resumed.state.flags.stage715DemoPhase, chat: resumed.state.chat, rep: resumed.state.rep, me: resumed.state.me, battle: resumed.state.battles[0] }), before);

const repeated = bootRuntime({ flags: {}, me: {}, players: {}, battles: [], events: [], chat: [] });
assert.strictEqual(repeated.claimCalls(), 1, "repeated reload did not use persisted checkpoint");
assert.strictEqual(repeated.state.chat.filter((entry) => entry.text === canonical).length, 1, "repeated reload duplicated canonical line");

storage.delete("AsyncScene_stage715_gameplay_v1");
const ordinary = bootRuntime({ flags: { started: true }, progress: { onboardingSeen: true }, me: { name: "Обычный" }, chat: [] });
assert.strictEqual(ordinary.claimCalls(), 0, "ordinary non-Stage7.15 resume entered Stage 7.15 path");

console.log("PASS_STAGE7_15_ATOM1_RAYHAN_POST_WIN_BOOT_CONTINUE_RESUME");
process.exit(0);
'''
subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
print("PASS_STAGE7_15_ATOM1_RAYHAN_RESUME_REGRESSION")
