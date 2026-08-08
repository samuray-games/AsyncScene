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
CORE = Path("AsyncScene/Web/ui/ui-core.js")
DM = Path("AsyncScene/Web/ui/ui-dm.js")
EVENTS = Path("AsyncScene/Web/ui/ui-events.js")
BATTLES = Path("AsyncScene/Web/ui/ui-battles.js")
assert "showStatNameToast" in CORE.read_text(encoding="utf-8")
assert "bindStatNameToastInteractions" in CORE.read_text(encoding="utf-8")
assert "toast.onclick = () => dismissDeltaToast(kind);" in CORE.read_text(encoding="utf-8")
assert "Действие недоступно." in DM.read_text(encoding="utf-8")
assert "isDevCrowdMode" in EVENTS.read_text(encoding="utf-8")
assert "isDevCrowdMode" in BATTLES.read_text(encoding="utf-8")

CORE_DOCS = Path("docs/ui/ui-core.js")
DM_DOCS = Path("docs/ui/ui-dm.js")
EVENTS_DOCS = Path("docs/ui/ui-events.js")
BATTLES_DOCS_UI = Path("docs/ui/ui-battles.js")
core = CORE.read_text(encoding="utf-8")
dm = DM.read_text(encoding="utf-8")
events = EVENTS.read_text(encoding="utf-8")
battles_text = BATTLES.read_text(encoding="utf-8")
for source, mirror in [
    (CORE, CORE_DOCS),
    (DM, DM_DOCS),
    (EVENTS, EVENTS_DOCS),
    (BATTLES, BATTLES_DOCS_UI),
]:
    assert source.read_bytes() == mirror.read_bytes(), (source, mirror)
assert 'showStatNameToast("rep", "Репутация")' in core
assert 'setTimeout(() => showStatNameToast("points", "Баланс"), 350);' in core
assert 'chip.addEventListener("click"' in core
assert 'toast.onclick = () => dismissDeltaToast(kind);' in core
assert 'const securityMessage = isDevUi()' in dm
assert 'dmPushLine(withId, "Система", `Служба безопасности блокирует баттл.' not in dm
assert 'return isDevCrowdMode ? `${n} [${inf}]` : n;' in battles_text
assert 'Служба безопасности блокирует баттл.' in battles_text
assert 'Действие недоступно.' in battles_text
assert "stage7Transition" in controller
assert "Пока Райхан собирает сторонников" in controller
assert "хочет обсудить, чем закончился спор" in controller
battles = BATTLES.read_text(encoding="utf-8")
assert controller == CONTROLLER_DOCS.read_text(encoding="utf-8")
assert "Теперь ты с Райханом обвиняете друг друга. Остальные должны решить, кому верить." in controller
assert "После настоящего баттла" not in controller
assert "Ты победил Райхана в публичном реванше. Теперь ему придётся считаться с твоей версией." in controller
assert "встречное обвинение выдержало настоящий спор" not in controller
assert battles == BATTLES_DOCS.read_text(encoding="utf-8")
assert INDEX.read_text(encoding="utf-8") == INDEX_DOCS.read_text(encoding="utf-8")
conflict_api = CONFLICT_API.read_text(encoding="utf-8")
assert "Array.isArray(battle._defenseChoices)" in conflict_api
assert "this._findArgById(battle._defenseChoices.filter" in conflict_api
for marker in [
    "stage7_accuse_ken_tactical_v1",
    "accusePayoffStatus",
    "useAccuseKenRematchOptions",
    "chooseAccuseKenRematchDefenseChoices",
    "accuse_ken_payoff_applied",
    "accuse_ken_payoff_expired",
]:
    assert marker in controller, marker
for marker in [
    "stage7AccuseKenPayoff",
    "Сменить ответы",
    "stage7-accuse-rematch-refresh",
    "stage7-accuse-witness-revealed",
]:
    assert marker in battles, marker
for text in [INDEX.read_text(encoding="utf-8"), INDEX_DOCS.read_text(encoding="utf-8")]:
    assert text.count("stage7_cosmetic_cleanup_20260808a") >= 2

subprocess.run(["node", "--check", str(CONTROLLER)], check=True)
subprocess.run(["node", "--check", str(CONTROLLER_DOCS)], check=True)
subprocess.run(["node", "--check", str(BATTLES)], check=True)
subprocess.run(["node", "--check", str(BATTLES_DOCS)], check=True)

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
global.location = { search: "?stage7test=1&stage7testrun=stage7-10-accuse" };
window.location = global.location;

const nodes = Object.create(null);
function createNode(tag) {
  return {
    tagName: String(tag || "").toUpperCase(),
    id: "",
    className: "",
    hidden: false,
    innerHTML: "",
    attributes: Object.create(null),
    listeners: Object.create(null),
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    remove() { if (this.id) delete nodes[this.id]; },
  };
}
const blocks = {
  id: "blocks",
  firstChild: null,
  insertBefore(node) { this.firstChild = node; if (node.id) nodes[node.id] = node; },
};
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
  __S: state,
  State: state,
  Data: { START_POINTS_NPC: 10 },
  __A: { transferRep() { return { ok: true }; } },
  ConflictEconomy: { transferPoints() { return { ok: true }; } },
  Conflict: {
    incoming(opponentId) {
      incomingCalls += 1;
      const battle = {
        id: `stage7_real_${incomingCalls}`,
        opponentId,
        fromThem: true,
        status: "pickDefense",
        attack: { id: "canon_R1_yn_test", text: "Ты сам начал этот спор?", type: "yn", _color: "r" },
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
  requestRenderAll() {},
  renderAll() {},
};
const context = { state, UI, playerName: "Тестер", startNormalWorld() {} };

vm.runInThisContext(
  fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8"),
  { filename: "ui-stage7-first-experience.js" }
);
const dev = Game.__DEV;

function runAccuse(choice) {
  Game.Stage7FirstExperience.claimFreshStart(context);
  assert.strictEqual(dev.completeStage7RoundOne("accuse_ken"), true);
  assert.strictEqual(dev.settleStage7Intermission("foreground"), true);
  assert.strictEqual(dev.resolveStage7RoundTwo(choice), true);
  assert.strictEqual(dev.openStage7Questions(), true);
  for (let i = 0; i < 6; i += 1) assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
  const snap = dev.getStage7FirstExperienceSnapshot();
  const battle = state.battles[0];
  assert(battle, "real battle missing");
  return { snap, battle };
}

let first = runAccuse("primary");
assert.strictEqual(first.snap.realBattleBridge.accusePayoffMode, "public_rematch");
assert.strictEqual(first.snap.realBattleBridge.accusePayoffStatus, "pending");
assert.strictEqual(first.snap.realBattleBridge.accusePayoffApplyCount, 0);
assert.strictEqual(first.battle.meta.stage7AccuseKenPayoff.mode, "public_rematch");
assert.strictEqual(first.battle.meta.stage7AccuseKenPayoff.status, "pending");
const previousChoices = [
  { id: "canon_d1", color: "y", group: "yn", type: "yn", text: "Старый ответ один", _canonAId: "old_1" },
  { id: "canon_d2", color: "y", group: "who", type: "who", text: "Старый ответ два", _canonAId: "old_2" },
  { id: "canon_d3", color: "y", group: "where", type: "where", text: "Старый ответ три", _canonAId: "old_3" },
];
const freshCandidates = [
  { id: "canon_d4", color: "y", group: "yn", type: "yn", text: "Новый ответ один", _canonAId: "new_1" },
  { id: "canon_d5", color: "y", group: "about", type: "about", text: "Новый ответ два", _canonAId: "new_2" },
  { id: "canon_d6", color: "y", group: "who", type: "who", text: "Новый ответ три", _canonAId: "new_3" },
];
assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, previousChoices, freshCandidates), true);
let selected = Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices(first.battle.id);
assert.deepStrictEqual(selected.map((choice) => choice.id), ["canon_d4", "canon_d5", "canon_d6"]);
let snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.accusePayoffStatus, "used");
assert.strictEqual(snap.realBattleBridge.accusePayoffApplyCount, 1);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffPreviousDefenseIds, ["canon_d1", "canon_d2", "canon_d3"]);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseIds, ["canon_d4", "canon_d5", "canon_d6"]);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseChoices.map((choice) => choice.text), ["Новый ответ один", "Новый ответ два", "Новый ответ три"]);
assert.deepStrictEqual(first.battle.meta.stage7AccuseKenPayoff.defenseIds, ["canon_d4", "canon_d5", "canon_d6"]);
assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, freshCandidates, previousChoices), false);
selected = Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices(first.battle.id);
assert.deepStrictEqual(selected.map((choice) => choice.id), ["canon_d4", "canon_d5", "canon_d6"]);
assert.strictEqual(visibleLines.filter((line) => line.system && String(line.text).includes("сменил варианты ответа")).length, 1);
Game.Stage7FirstExperience.destroy();
const activeResume = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(activeResume.claimed, true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.accusePayoffApplyCount, 1);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseIds, ["canon_d4", "canon_d5", "canon_d6"]);
assert.deepStrictEqual(
  Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices(first.battle.id).map((choice) => choice.text),
  ["Новый ответ один", "Новый ответ два", "Новый ответ три"]
);
assert.strictEqual(visibleLines.filter((line) => line.system && String(line.text).includes("сменил варианты ответа")).length, 1);

const ordinary = { id: "ordinary", status: "pickDefense", attack: { _color: "y" }, meta: {} };
state.battles.unshift(ordinary);
assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions("ordinary", previousChoices, freshCandidates), false);
assert.strictEqual(Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices("ordinary"), null);
assert.strictEqual(ordinary.meta.stage7AccuseKenPayoff, undefined);
state.battles.shift();

Game.__DEV.resetStage7FirstExperience();
state.battles.length = 0;
first = runAccuse("secondary");
assert.strictEqual(first.snap.realBattleBridge.accusePayoffMode, "witness");
assert.strictEqual(first.snap.realBattleBridge.accusePayoffStatus, "revealed");
assert.strictEqual(first.snap.realBattleBridge.accusePayoffApplyCount, 1);
assert.strictEqual(first.battle.attack.color, "r");
assert.strictEqual(first.battle.meta.stage7AccuseKenPayoff.mode, "witness");
assert.strictEqual(first.battle.meta.stage7AccuseKenPayoff.status, "revealed");
assert.strictEqual(visibleLines.filter((line) => line.system && String(line.text).includes("Настя привела свидетеля")).length, 1);
Game.Stage7FirstExperience.destroy();
assert.strictEqual(Game.Stage7FirstExperience.claimResume(context).claimed, true);
assert.strictEqual(dev.getStage7FirstExperienceSnapshot().realBattleBridge.accusePayoffApplyCount, 1);
assert.strictEqual(visibleLines.filter((line) => line.system && String(line.text).includes("Настя привела свидетеля")).length, 1);

Game.__DEV.resetStage7FirstExperience();
state.battles.length = 0;
first = runAccuse("primary");
first.battle.resolved = true;
first.battle.finished = true;
first.battle.status = "finished";
first.battle.result = "lose";
assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.accusePayoffStatus, "expired");
assert.strictEqual(first.battle.meta.stage7AccuseKenPayoff.status, "expired");
assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, previousChoices, freshCandidates), false);

Game.Stage7FirstExperience.destroy();
console.log("STAGE7_10_ACCUSE_KEN_PAYOFFS_DYNAMIC_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=False, text=True, capture_output=True)
    if completed.returncode != 0:
        raise AssertionError("node harness failed\nSTDOUT:\n" + completed.stdout + "\nSTDERR:\n" + completed.stderr)
    assert "STAGE7_10_ACCUSE_KEN_PAYOFFS_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)

print("STAGE7_10_ACCUSE_KEN_PAYOFFS_OK")
