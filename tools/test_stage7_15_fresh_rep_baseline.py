from pathlib import Path
import os
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
BOOT = ROOT / "AsyncScene/Web/ui/ui-boot.js"
BOOT_DOCS = ROOT / "docs/ui/ui-boot.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(STAGE.read_bytes() == STAGE_DOCS.read_bytes(), "Stage 7.15 controller mirrors differ")
for boot in (BOOT.read_text(encoding="utf-8"), BOOT_DOCS.read_text(encoding="utf-8")):
    require("claimStage715FreshStart(G, UI, S, name, startNormalWorld)" in boot,
            "production fresh-start route missing from a boot mirror")

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const stageSource = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const bootSource = fs.readFileSync(process.env.STAGE715_BOOT_SOURCE || "AsyncScene/Web/ui/ui-boot.js", "utf8");
const saved = new Map();
const ledger = [];
let renders = 0;
let transferResult = null;

function element(value = "") {
  return { value, textContent: "", innerHTML: "", dataset: {}, hidden: false,
    style: { removeProperty() {}, setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, appendChild() {}, removeChild() {}, remove() {},
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; }, focus() {}, click() {} };
}

// The browser UI and StateAPI references are intentionally independent to
// reproduce the reported mirror condition while running the real boot and
// Stage 7.15 production entry points.
const canonical = { flags: {}, me: { id: "me", name: "", points: 10, influence: 0, wins: 0 }, rep: 0,
  players: {}, battles: [], events: [], chat: [], progress: {} };
const uiMirror = { flags: {}, me: { id: "me", name: "", points: 10, influence: 0, wins: 0 }, rep: 0,
  players: {}, battles: [], events: [], chat: [], progress: {} };
const document = { readyState: "complete", body: element(), documentElement: element(),
  getElementById(id) { if (!elements.has(id)) elements.set(id, element(id === "nameInput" ? "Тестер" : "")); return elements.get(id); },
  querySelector() { return null; }, querySelectorAll() { return []; }, createElement: () => element(), addEventListener() {} };
const elements = new Map();
const localStorage = { getItem(k) { return saved.has(k) ? saved.get(k) : null; },
  setItem(k, v) { saved.set(k, String(v)); }, removeItem(k) { saved.delete(k); } };
const UI = { S: uiMirror, $: (id) => document.getElementById(id),
  renderAll() { renders += 1; }, renderAllMinimal() {}, requestRenderAll() {}, renderEvents() {}, renderBattles() {},
  buildPlayers() {}, applyMobilePanelDefaults() {}, startLoops() {}, closeDM() {},
  ensurePanelExpanded() {}, ensureEventsExpanded() {}, setPanelSize() {}, pushChat(entry) { uiMirror.chat.push(entry); },
  pushSystem() {}, sendChat() {}, withPointsWrite(fn) { fn(); } };
const StateAPI = {
  resetAll() { canonical.rep = 0; canonical.flags = {}; canonical.battles = []; canonical.chat = []; canonical.events = []; },
  getOnboardingSeen() { return true; },
  seedPlayers() {}, syncMeToPlayers() {},
  transferRep(from, to, amount, reason, battleId, meta) {
    transferResult = { ok: true, amount };
    canonical.rep += amount;
    ledger.push({ sourceId: from, targetId: to, amount, reason, battleId, actionId: meta && meta.actionId, context: meta && meta.context });
    return transferResult;
  },
};
const Game = { __S: canonical, UI, StateAPI, __A: StateAPI, __D: { moneyLog: ledger },
  Data: { START_POINTS_PLAYER: 0, START_POINTS_NPC: 10, RANDOM_NAMES: ["Тестер"], pick: (xs) => xs[0], t: () => "Споры" },
  Telemetry: { action() {}, setGameplayNickname() {} }, NPC: { seedPlayers() {} } };
const window = { Game, localStorage, document, location: { search: "" }, URLSearchParams, addEventListener() {}, removeEventListener() {} };
window.window = window;
const context = { window, document, location: window.location, navigator: {}, URLSearchParams,
  setTimeout, clearTimeout, setInterval, clearInterval, console, Date, Event: function Event() {} };
vm.runInNewContext(stageSource, context);
vm.runInNewContext(bootSource, context);

assert.notStrictEqual(Game.__S, UI.S, "fixture must exercise distinct Core and UI state objects");
assert.strictEqual(Game.__S.rep, 0, "precondition: canonical REP before Fresh Start");
assert.strictEqual(UI.S.rep, 0, "precondition: UI mirror REP before Fresh Start");
const start = document.getElementById("btnStart");
assert.strictEqual(typeof start.onclick, "function", "production Start handler was not installed");
start.onclick({ preventDefault() {}, stopPropagation() {} });

console.log(JSON.stringify({
  identities: { coreEqualsUi: Game.__S === UI.S, apiTargetEqualsCore: StateAPI === Game.StateAPI },
  rep: { immediatelyAfterBootReset: 0, afterTransferCore: Game.__S.rep, afterTransferUi: UI.S.rep },
  transferResult,
  ledgerRows: ledger,
  flags: { core: Game.__S.flags, ui: UI.S.flags },
  savedRep: saved.has("AsyncScene_stage715_gameplay_v1")
    ? JSON.parse(saved.get("AsyncScene_stage715_gameplay_v1")).state.rep : null,
  renders,
}));
assert.deepStrictEqual(transferResult, { ok: true, amount: 1 }, "canonical baseline transfer must succeed exactly once");
assert.strictEqual(ledger.length, 1, "baseline transfer must have one canonical ledger row");
assert.strictEqual(ledger[0].actionId, "stage7_15_initial_rep_baseline");
assert.strictEqual(Game.__S.rep, 1, "canonical REP after baseline transfer");
assert.strictEqual(UI.S.rep, 1, "UI mirror REP after fresh start");
assert.strictEqual(UI.S.flags.stage715InitialRepBaselineApplied, true);
assert.strictEqual(Game.__S.flags.stage715InitialRepBaselineApplied, true);
assert(saved.has("AsyncScene_stage715_gameplay_v1"), "production Stage save was not written");
const persisted = JSON.parse(saved.get("AsyncScene_stage715_gameplay_v1"));
assert.strictEqual(persisted.state.rep, 1, "saved fresh-start checkpoint must retain REP=1");
assert(renders > 0, "production Fresh Start did not render");

// A new controller instance restores the saved snapshot through the
// production Stage checkpoint path and must not replay the initial transfer.
const reloaded = JSON.parse(JSON.stringify(persisted.state));
reloaded.rep = 0;
const UI2 = Object.assign({}, UI, { S: reloaded, pushChat(entry) { reloaded.chat.push(entry); } });
const StateAPI2 = Object.assign({}, StateAPI, {
  restoreRepSnapshot(value, source) {
    assert.strictEqual(source, "stage715_checkpoint");
    reloaded.rep = value | 0;
    return { ok: true };
  },
});
const Game2 = Object.assign({}, Game, { __S: reloaded, UI: UI2, StateAPI: StateAPI2, __A: StateAPI2,
  __D: { moneyLog: ledger } });
UI2.Game = Game2;
const window2 = { Game: Game2, localStorage, document, location: { search: "" }, URLSearchParams,
  addEventListener() {}, removeEventListener() {} };
window2.window = window2;
vm.runInNewContext(stageSource, { window: window2, document, location: window2.location,
  URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console, Date });
assert.strictEqual(Game2.Stage715Demo.claimResume({ state: reloaded, UI: UI2, playerName: "Тестер" }).claimed, true);
assert.strictEqual(reloaded.rep, 1, "reload must restore REP=1 through the authorized checkpoint API");
assert.strictEqual(ledger.length, 1, "reload must not add a duplicate baseline ledger row");
assert.strictEqual(transferResult.amount, 1, "reload must not replay the baseline REP transfer");
console.log(JSON.stringify({ canonicalRep: Game.__S.rep, uiRep: UI.S.rep, savedRep: persisted.state.rep,
  reloadedRep: reloaded.rep, ledgerRows: ledger.length, alias: Game.__S === UI.S, renders }));
'''

subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
