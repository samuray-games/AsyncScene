from pathlib import Path
import subprocess
import tempfile

CONTROLLER = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
CONTROLLER_DOCS = Path("docs/ui/ui-stage7-first-experience.js")
INDEX = Path("AsyncScene/Web/index.html")
INDEX_DOCS = Path("docs/index.html")

controller = CONTROLLER.read_text(encoding="utf-8")
assert controller == CONTROLLER_DOCS.read_text(encoding="utf-8")
assert INDEX.read_text(encoding="utf-8") == INDEX_DOCS.read_text(encoding="utf-8")

for marker in [
    "stage7_first_real_battle_aftermath_v1",
    "aftermathStatus",
    "recordFirstBattleAftermath",
    "renderFirstBattleAftermath",
    "acknowledgeFirstBattleAftermath",
    "first_real_battle_aftermath_recorded",
    "first_real_battle_aftermath_acknowledged",
    "battle_aftermath_resume",
    "preservePanel",
    "stage7-first-battle-aftermath",
]:
    assert marker in controller, marker

for text in [INDEX.read_text(encoding="utf-8"), INDEX_DOCS.read_text(encoding="utf-8")]:
    assert text.count("stage7_13_aftermath_dm_followup_20260806a") >= 2

for path in [CONTROLLER, CONTROLLER_DOCS]:
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
global.location = { search: "?stage7test=1&stage7testrun=stage7-12-aftermath" };
window.location = global.location;

const nodes = Object.create(null);
let controlledMode = null;
function createNode(tag) {
  return {
    tagName: String(tag || "").toUpperCase(), id: "", className: "", hidden: false,
    innerHTML: "", attributes: Object.create(null), listeners: Object.create(null),
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    remove() { if (this.id) delete nodes[this.id]; },
  };
}
const blocks = {
  id: "blocks", firstChild: null,
  insertBefore(node) { this.firstChild = node; if (node.id) nodes[node.id] = node; },
};
nodes.blocks = blocks;
global.document = {
  hidden: false,
  documentElement: { classList: { toggle(name, value) { if (name === "stage7-first-experience-active") controlledMode = !!value; } } },
  getElementById(id) { return nodes[id] || null; },
  createElement(tag) { return createNode(tag); },
  addEventListener() {},
};

const visibleLines = [];
const state = { me: { id: "me", points: 50 }, players: {}, battles: [], rep: 0 };
let incomingCalls = 0;
let normalWorldStarts = 0;
window.Game = {
  __S: state, State: state, Data: { START_POINTS_NPC: 10 },
  __A: { transferRep() { return { ok: true }; } },
  ConflictEconomy: { transferPoints() { return { ok: true }; } },
  Conflict: {
    incoming(opponentId) {
      incomingCalls += 1;
      const battle = {
        id: `stage7_aftermath_real_${incomingCalls}`,
        opponentId, fromThem: true, status: "pickDefense", resolved: false, finished: false,
        attack: { id: "canon_R1_yn_aftermath", text: "Ты отвечаешь за это?", type: "yn", group: "yn", _color: "r" },
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
const context = {
  state, UI, playerName: "Тестер",
  startNormalWorld() { normalWorldStarts += 1; },
};

vm.runInThisContext(fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8"), { filename: "ui-stage7-first-experience.js" });
const dev = Game.__DEV;

function resetScenario() {
  Game.__DEV.resetStage7FirstExperience();
  state.battles.length = 0;
  state.players = {};
  controlledMode = null;
  normalWorldStarts = 0;
  visibleLines.length = 0;
}

function beginScenario(branchId, choiceId) {
  const claimed = Game.Stage7FirstExperience.claimFreshStart(context);
  assert.strictEqual(claimed.claimed, true);
  assert.strictEqual(dev.completeStage7RoundOne(branchId), true);
  assert.strictEqual(dev.settleStage7Intermission("foreground"), true);
  assert.strictEqual(dev.resolveStage7RoundTwo(choiceId), true);
  assert.strictEqual(dev.openStage7Questions(), true);
  for (let i = 0; i < 6; i += 1) assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
  const snap = dev.getStage7FirstExperienceSnapshot();
  const battle = state.battles.find(item => item && item.id === snap.realBattleBridge.battleId);
  assert(battle, "exact bridge battle missing");
  assert.strictEqual(snap.realBattleBridge.status, "created");
  return battle;
}

function finishBattle(battle, result) {
  battle.resolved = true;
  battle.finished = true;
  battle.status = "finished";
  battle.result = result;
  assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true);
  return dev.getStage7FirstExperienceSnapshot();
}

function assertAftermath(branchId, choiceId, rawResult, kind, targetNpcId) {
  resetScenario();
  const battle = beginScenario(branchId, choiceId);
  const snap = finishBattle(battle, rawResult);
  const bridge = snap.realBattleBridge;
  assert.strictEqual(bridge.status, "completed");
  assert.strictEqual(bridge.outcome, rawResult);
  assert.strictEqual(bridge.aftermathStatus, "pending");
  assert.strictEqual(bridge.aftermathBranchId, branchId);
  assert.strictEqual(bridge.aftermathSecondRoundChoiceId, choiceId);
  assert.strictEqual(bridge.aftermathOutcomeRaw, rawResult);
  assert.strictEqual(bridge.aftermathOutcomeKind, kind);
  assert.strictEqual(bridge.aftermathTargetNpcId, targetNpcId);
  assert.strictEqual(bridge.aftermathApplyCount, 1);
  const memory = snap.npcMemory[targetNpcId].firstRealBattleAftermath;
  assert.strictEqual(memory.status, "pending");
  assert.strictEqual(memory.outcomeRaw, rawResult);
  assert.strictEqual(memory.outcomeKind, kind);
  assert.strictEqual(memory.applyCount, 1);
  assert.strictEqual(state.players[targetNpcId].meta.stage7FirstExperience.firstRealBattleAftermath.outcomeRaw, rawResult);
  const panel = document.getElementById("stage7FirstExperiencePanel");
  assert(panel, "aftermath panel missing");
  assert(panel.innerHTML.includes('data-testid="stage7-first-battle-aftermath"'));
  assert(panel.innerHTML.includes("Игра уже открыта"));
  assert.strictEqual(controlledMode, false);
  assert(normalWorldStarts >= 1);
  assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), false);
  assert.strictEqual(dev.getStage7FirstExperienceSnapshot().realBattleBridge.aftermathApplyCount, 1);
  return { battle, panel };
}

// Exact battle identity: another completed battle with the same bridge tag cannot create aftermath.
resetScenario();
let exact = beginScenario("deny", "primary");
const impostor = {
  id: "ordinary_tagged_impostor", resolved: true, finished: true, status: "finished", result: "win",
  meta: { stage7OnboardingBridgeId: "stage7_first_real_argument_battle_v1" },
};
state.battles.unshift(impostor);
assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), false);
assert.strictEqual(dev.getStage7FirstExperienceSnapshot().realBattleBridge.aftermathStatus, "not_applicable");
state.battles.shift();
let snap = finishBattle(exact, "win");
assert.strictEqual(snap.realBattleBridge.aftermathTargetNpcId, "npc_stage7_mika");
assert.strictEqual(snap.realBattleBridge.aftermathApplyCount, 1);

// Pending aftermath survives destroy/load, keeps normal world open, and acknowledges exactly once.
Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, true);
assert.strictEqual(resumed.mode, "battle_aftermath_resume");
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.aftermathStatus, "pending");
assert.strictEqual(snap.realBattleBridge.aftermathApplyCount, 1);
assert(document.getElementById("stage7FirstExperiencePanel").innerHTML.includes("Настя"));
assert.strictEqual(controlledMode, false);
assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.aftermathStatus, "acknowledged");
assert.strictEqual(snap.realBattleBridge.aftermathApplyCount, 1);
assert.strictEqual(snap.npcMemory.npc_stage7_mika.firstRealBattleAftermath.status, "acknowledged");
assert.strictEqual(document.getElementById("stage7FirstExperiencePanel"), null);
assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), false);
Game.Stage7FirstExperience.destroy();
assert.strictEqual(Game.Stage7FirstExperience.claimResume(context).claimed, false);

// Branch and actual-result mapping.
let run = assertAftermath("accuse_ken", "secondary", "lose", "lose", "npc_stage7_ken");
assert(run.panel.innerHTML.includes("Райхан"));
assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), true);

run = assertAftermath("pay", "secondary", "ignored", "interrupted", "npc_bandit");
assert(run.panel.innerHTML.includes("Олег"));
assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), true);

Game.Stage7FirstExperience.destroy();
console.log("STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_DYNAMIC_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=False, text=True, capture_output=True)
    if completed.returncode != 0:
        raise AssertionError("node harness failed\nSTDOUT:\n" + completed.stdout + "\nSTDERR:\n" + completed.stderr)
    assert "STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)

print("STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_OK")
