from pathlib import Path
import subprocess
import tempfile

CONTROLLER = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
CONTROLLER_DOCS = Path("docs/ui/ui-stage7-first-experience.js")
DM = Path("AsyncScene/Web/ui/ui-dm.js")
DM_DOCS = Path("docs/ui/ui-dm.js")
INDEX = Path("AsyncScene/Web/index.html")
INDEX_DOCS = Path("docs/index.html")
CACHE = "stage7_13_aftermath_dm_follow_up_20260806a"

controller = CONTROLLER.read_text(encoding="utf-8")
dm = DM.read_text(encoding="utf-8")
index = INDEX.read_text(encoding="utf-8")
assert controller == CONTROLLER_DOCS.read_text(encoding="utf-8")
assert dm == DM_DOCS.read_text(encoding="utf-8")
assert index == INDEX_DOCS.read_text(encoding="utf-8")
for marker in [
    "aftermathDmStatus", "aftermathDmUsedAt", "aftermathDmUseCount",
    "consumeFirstBattleAftermathDmReply", "first_real_battle_aftermath_dm_used",
    "firstBattleAftermathDmFollowUp", "firstBattleAftermathDmExactlyOnce",
    "firstBattleAftermathDmTargetIsolated",
]:
    assert marker in controller, marker
for marker in ["consumeStage7AftermathDmOnOpen", "consumeFirstBattleAftermathDmReply", "dmPushLine(id"]:
    assert marker in dm, marker
assert dm.count("consumeStage7AftermathDmOnOpen(id);") == 1
assert f'ui/ui-stage7-first-experience.js?v={CACHE}' in index
assert f'ui/ui-dm.js?v={CACHE}' in index
assert f'ui/ui-stage7-first-experience.css?v={CACHE}' in index
for path in [CONTROLLER, CONTROLLER_DOCS, DM, DM_DOCS]:
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
global.location = { search: "?stage7test=1&stage7testrun=stage7-13-dm" };
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
const state = { me: { id: "me", points: 50 }, players: {}, battles: [] };
let incomingCalls = 0;
window.Game = {
  __S: state, State: state, Data: { START_POINTS_NPC: 10 },
  __A: { transferRep() { return { ok: true }; } },
  ConflictEconomy: { transferPoints() { return { ok: true }; } },
  Conflict: { incoming(opponentId) {
    incomingCalls += 1;
    const battle = {
      id: `stage7_dm_real_${incomingCalls}`, opponentId, status: "pickDefense", resolved: false, finished: false,
      attack: { id: "canon_R1_yn_dm", text: "Ты отвечаешь?", type: "yn", group: "yn", _color: "r" }, meta: {},
    };
    state.battles.unshift(battle);
    return { ok: true, battleId: battle.id, battle };
  } },
  UI: {},
};
const UI = { S: state, pushSystem() {}, pushChat() {}, requestRenderAll() {}, renderAll() {} };
const context = { state, UI, playerName: "Тестер", startNormalWorld() {} };
vm.runInThisContext(fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8"), { filename: "ui-stage7-first-experience.js" });
const dev = Game.__DEV;

function reset() {
  dev.resetStage7FirstExperience();
  state.battles.length = 0;
  state.players = {};
}
function finish(branchId, choiceId, result) {
  assert.strictEqual(Game.Stage7FirstExperience.claimFreshStart(context).claimed, true);
  assert.strictEqual(dev.completeStage7RoundOne(branchId), true);
  assert.strictEqual(dev.settleStage7Intermission("foreground"), true);
  assert.strictEqual(dev.resolveStage7RoundTwo(choiceId), true);
  assert.strictEqual(dev.openStage7Questions(), true);
  for (let i = 0; i < 6; i += 1) assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
  let snap = dev.getStage7FirstExperienceSnapshot();
  const battle = state.battles.find(item => item && item.id === snap.realBattleBridge.battleId);
  assert(battle);
  battle.resolved = true; battle.finished = true; battle.status = "finished"; battle.result = result;
  assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true);
  return dev.getStage7FirstExperienceSnapshot();
}
function runCase(branchId, choiceId, result, targetId, wrongId, expectedFragment) {
  reset();
  let snap = finish(branchId, choiceId, result);
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "pending");
  assert.strictEqual(dev.consumeStage7FirstBattleAftermathDmReply(targetId), null, "must wait for acknowledgement");
  assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), true);
  assert.strictEqual(dev.consumeStage7FirstBattleAftermathDmReply(wrongId), null, "wrong NPC must not consume");
  snap = dev.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "pending");
  const stored = JSON.parse(Array.from(storage.values())[0]);
  assert.strictEqual(stored.realBattleBridge.aftermathDmStatus, "pending", "pending reply must be persisted");
  const consumed = dev.consumeStage7FirstBattleAftermathDmReply(targetId);
  assert(consumed && consumed.consumed === true);
  assert.strictEqual(consumed.targetNpcId, targetId);
  assert.strictEqual(consumed.dmStatus, "used");
  assert.strictEqual(consumed.dmUseCount, 1);
  assert(consumed.reply.includes(expectedFragment), consumed.reply);
  assert.strictEqual(dev.consumeStage7FirstBattleAftermathDmReply(targetId), null, "reply must be exactly once");
  snap = dev.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "used");
  assert.strictEqual(snap.realBattleBridge.aftermathDmUseCount, 1);
  assert.strictEqual(snap.npcMemory[targetId].firstRealBattleAftermath.dmStatus, "used");
  assert.strictEqual(snap.npcMemory[targetId].firstRealBattleAftermath.dmUseCount, 1);
}
runCase("deny", "primary", "win", "npc_stage7_mika", "npc_stage7_ken", "выдержал публичный спор");
runCase("accuse_ken", "secondary", "lose", "npc_stage7_ken", "npc_stage7_mika", "выиграл публично");
runCase("pay", "secondary", "ignored", "npc_bandit", "npc_stage7_ken", "Оплата осталась спорной");
Game.Stage7FirstExperience.destroy();
console.log("STAGE7_13_AFTERMATH_DM_DYNAMIC_OK");
'''
with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=False, text=True, capture_output=True)
    if completed.returncode != 0:
        raise AssertionError("node harness failed\nSTDOUT:\n" + completed.stdout + "\nSTDERR:\n" + completed.stderr)
    assert "STAGE7_13_AFTERMATH_DM_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)
print("STAGE7_13_AFTERMATH_DM_FOLLOW_UP_OK")
