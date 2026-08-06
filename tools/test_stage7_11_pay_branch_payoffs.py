from pathlib import Path
import subprocess
import tempfile

CONTROLLER = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
CONTROLLER_DOCS = Path("docs/ui/ui-stage7-first-experience.js")
BATTLES = Path("AsyncScene/Web/ui/ui-battles.js")
BATTLES_DOCS = Path("docs/ui/ui-battles.js")
INDEX = Path("AsyncScene/Web/index.html")
INDEX_DOCS = Path("docs/index.html")
CONFLICT_API = Path("AsyncScene/Web/conflict/conflict-api.js")

controller = CONTROLLER.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
assert controller == CONTROLLER_DOCS.read_text(encoding="utf-8")
assert battles == BATTLES_DOCS.read_text(encoding="utf-8")
assert INDEX.read_text(encoding="utf-8") == INDEX_DOCS.read_text(encoding="utf-8")
conflict_api = CONFLICT_API.read_text(encoding="utf-8")
assert "Array.isArray(battle._defenseChoices)" in conflict_api
assert "this._findArgById(battle._defenseChoices.filter" in conflict_api
for marker in [
    "stage7_pay_tactical_v1",
    "payPayoffStatus",
    "preparePayDefenseChoices",
    "choosePayDefenseChoices",
    "usePayPressureAnalysis",
    "pay_payoff_applied",
    "pay_payoff_expired",
]:
    assert marker in controller, marker
for marker in [
    "stage7PayPayoff",
    "Разобрать давление",
    "stage7-pay-pressure-analyze",
    "stage7-pay-receipt-marked-defense",
    "stage7-pay-pressure-marked-defense",
]:
    assert marker in battles, marker
for text in [INDEX.read_text(encoding="utf-8"), INDEX_DOCS.read_text(encoding="utf-8")]:
    assert text.count("stage7_12_first_battle_aftermath_20260806a") >= 2

for path in [CONTROLLER, CONTROLLER_DOCS, BATTLES, BATTLES_DOCS]:
    subprocess.run(["node", "--check", str(path)], check=True)

node_harness = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const storage = new Map();
global.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
};
global.window = global;
global.location = { search: "?stage7test=1&stage7testrun=stage7-11-pay" };
window.location = global.location;

const nodes = Object.create(null);
function createNode(tag) {
  return {
    tagName: String(tag || "").toUpperCase(), id: "", className: "", hidden: false,
    innerHTML: "", attributes: Object.create(null), listeners: Object.create(null),
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    remove() { if (this.id) delete nodes[this.id]; },
  };
}
const blocks = { id: "blocks", firstChild: null, insertBefore(node) { this.firstChild = node; if (node.id) nodes[node.id] = node; } };
nodes.blocks = blocks;
global.document = {
  hidden: false,
  documentElement: { classList: { toggle() {} } },
  getElementById(id) { return nodes[id] || null; },
  createElement(tag) { return createNode(tag); },
  addEventListener() {},
};

const visibleLines = [];
const state = { me: { id: "me", points: 20 }, players: {}, battles: [], rep: 0 };
let incomingCalls = 0;
window.Game = {
  __S: state, State: state, Data: { START_POINTS_NPC: 10 },
  __A: { transferRep() { return { ok: true }; } },
  ConflictEconomy: { transferPoints() { return { ok: true }; } },
  Conflict: {
    incoming(opponentId) {
      incomingCalls += 1;
      const battle = {
        id: `stage7_pay_real_${incomingCalls}`,
        opponentId, fromThem: true, status: "pickDefense",
        attack: { id: "canon_R1_yn_pay", text: "Ты признал вину оплатой?", type: "yn", group: "yn", _color: "r" },
        meta: {},
      };
      state.battles.unshift(battle);
      return { ok: true, battleId: battle.id, battle };
    },
  },
  UI: {},
};
const UI = {
  S: state,
  pushSystem(text) { visibleLines.push({ system: true, text }); },
  pushChat(entry) { visibleLines.push(entry); },
  requestRenderAll() {}, renderAll() {},
};
const context = { state, UI, playerName: "Тестер", startNormalWorld() {} };

vm.runInThisContext(fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8"), { filename: "ui-stage7-first-experience.js" });
const dev = Game.__DEV;

function runPay(choice) {
  Game.Stage7FirstExperience.claimFreshStart(context);
  assert.strictEqual(dev.completeStage7RoundOne("pay"), true);
  assert.strictEqual(dev.settleStage7Intermission("foreground"), true);
  assert.strictEqual(dev.resolveStage7RoundTwo(choice), true);
  assert.strictEqual(dev.openStage7Questions(), true);
  for (let i = 0; i < 6; i += 1) assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
  const snap = dev.getStage7FirstExperienceSnapshot();
  const battle = state.battles[0];
  assert(battle, "real battle missing");
  return { snap, battle };
}

const choices = [
  { id: "canon_pay_yn", color: "y", group: "yn", type: "yn", text: "Да, я вернул деньги, но вину не признавал.", _canonAId: "pay_yn" },
  { id: "canon_pay_who", color: "y", group: "who", type: "who", text: "Это видел Олег.", _canonAId: "pay_who" },
  { id: "canon_pay_where", color: "y", group: "where", type: "where", text: "Расписка лежит у входа.", _canonAId: "pay_where" },
];

let first = runPay("primary");
assert.strictEqual(first.snap.realBattleBridge.payPayoffMode, "receipt");
assert.strictEqual(first.snap.realBattleBridge.payPayoffStatus, "pending");
let prepared = Game.Stage7FirstExperience.preparePayDefenseChoices(first.battle.id, choices);
assert.deepStrictEqual(prepared.map(x => x.id), choices.map(x => x.id));
let snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.payPayoffStatus, "marked");
assert.strictEqual(snap.realBattleBridge.payPayoffApplyCount, 1);
assert.strictEqual(snap.realBattleBridge.payPayoffMarkedDefenseId, "canon_pay_yn");
assert.deepStrictEqual(snap.realBattleBridge.payPayoffDefenseChoices.map(x => x.text), choices.map(x => x.text));
assert.strictEqual(first.battle.meta.stage7PayPayoff.mode, "receipt");
assert.strictEqual(first.battle.meta.stage7PayPayoff.markedDefenseId, "canon_pay_yn");
assert.strictEqual(visibleLines.filter(x => x.system && String(x.text).includes("Расписка Олега")).length, 1);
assert.deepStrictEqual(Game.Stage7FirstExperience.choosePayDefenseChoices(first.battle.id).map(x => x.id), choices.map(x => x.id));
Game.Stage7FirstExperience.destroy();
assert.strictEqual(Game.Stage7FirstExperience.claimResume(context).claimed, true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.payPayoffApplyCount, 1);
assert.deepStrictEqual(Game.Stage7FirstExperience.choosePayDefenseChoices(first.battle.id).map(x => x.text), choices.map(x => x.text));
assert.strictEqual(visibleLines.filter(x => x.system && String(x.text).includes("Расписка Олега")).length, 1);

const ordinary = { id: "ordinary", status: "pickDefense", attack: { type: "yn", _color: "y" }, meta: {} };
state.battles.unshift(ordinary);
assert.strictEqual(Game.Stage7FirstExperience.preparePayDefenseChoices("ordinary", choices), null);
assert.strictEqual(Game.Stage7FirstExperience.choosePayDefenseChoices("ordinary"), null);
assert.strictEqual(Game.Stage7FirstExperience.usePayPressureAnalysis("ordinary", choices), false);
assert.strictEqual(ordinary.meta.stage7PayPayoff, undefined);
state.battles.shift();

Game.__DEV.resetStage7FirstExperience();
state.battles.length = 0;
first = runPay("secondary");
assert.strictEqual(first.snap.realBattleBridge.payPayoffMode, "pressure");
assert.strictEqual(first.snap.realBattleBridge.payPayoffStatus, "pending");
prepared = Game.Stage7FirstExperience.preparePayDefenseChoices(first.battle.id, choices);
assert.deepStrictEqual(prepared.map(x => x.id), choices.map(x => x.id));
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.payPayoffStatus, "pending");
assert.strictEqual(snap.realBattleBridge.payPayoffApplyCount, 0);
assert.strictEqual(Game.Stage7FirstExperience.usePayPressureAnalysis(first.battle.id, choices), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.payPayoffStatus, "used");
assert.strictEqual(snap.realBattleBridge.payPayoffApplyCount, 1);
assert(["canon_pay_who", "canon_pay_where"].includes(snap.realBattleBridge.payPayoffMarkedDefenseId));
assert.notStrictEqual(snap.realBattleBridge.payPayoffMarkedDefenseId, "canon_pay_yn");
assert.strictEqual(Game.Stage7FirstExperience.usePayPressureAnalysis(first.battle.id, choices), false);
assert.strictEqual(visibleLines.filter(x => x.system && String(x.text).includes("разобрал давление Олега")).length, 1);
Game.Stage7FirstExperience.destroy();
assert.strictEqual(Game.Stage7FirstExperience.claimResume(context).claimed, true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.payPayoffApplyCount, 1);
assert.deepStrictEqual(Game.Stage7FirstExperience.choosePayDefenseChoices(first.battle.id).map(x => x.text), choices.map(x => x.text));
assert.strictEqual(visibleLines.filter(x => x.system && String(x.text).includes("разобрал давление Олега")).length, 1);

Game.__DEV.resetStage7FirstExperience();
state.battles.length = 0;
first = runPay("secondary");
Game.Stage7FirstExperience.preparePayDefenseChoices(first.battle.id, choices);
first.battle.resolved = true;
first.battle.finished = true;
first.battle.status = "finished";
first.battle.result = "lose";
assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.payPayoffStatus, "expired");
assert.strictEqual(first.battle.meta.stage7PayPayoff.status, "expired");
assert.strictEqual(Game.Stage7FirstExperience.usePayPressureAnalysis(first.battle.id, choices), false);

Game.Stage7FirstExperience.destroy();
console.log("STAGE7_11_PAY_BRANCH_PAYOFFS_DYNAMIC_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=False, text=True, capture_output=True)
    if completed.returncode != 0:
        raise AssertionError("node harness failed\nSTDOUT:\n" + completed.stdout + "\nSTDERR:\n" + completed.stderr)
    assert "STAGE7_11_PAY_BRANCH_PAYOFFS_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)

print("STAGE7_11_PAY_BRANCH_PAYOFFS_OK")
