from pathlib import Path
import json
import subprocess
import tempfile

SOURCE = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
DOCS = Path("docs/ui/ui-stage7-first-experience.js")
SOURCE_CSS = Path("AsyncScene/Web/ui/ui-stage7-first-experience.css")
DOCS_CSS = Path("docs/ui/ui-stage7-first-experience.css")
SOURCE_INDEX = Path("AsyncScene/Web/index.html")
DOCS_INDEX = Path("docs/index.html")

source = SOURCE.read_text(encoding="utf-8")
docs = DOCS.read_text(encoding="utf-8")
css = SOURCE_CSS.read_text(encoding="utf-8")
docs_css = DOCS_CSS.read_text(encoding="utf-8")
source_index = SOURCE_INDEX.read_text(encoding="utf-8")
docs_index = DOCS_INDEX.read_text(encoding="utf-8")

assert source == docs, "source/docs controller mirrors diverged"
assert css == docs_css, "source/docs CSS mirrors diverged"
assert "const ONBOARDING_FLOW_VERSION = 3" in source
assert "const INTERMISSION_DELAY_MS = WORLD_ADVANCE_DELAY_MS" in source
assert '"intermission", "round_two", "round_two_result", "questionnaire"' in source
assert "const INTERMISSION_NPCS = [" in source
for npc_id in ["npc_stage7_ken", "npc_stage7_mika", "npc_bandit"]:
    assert npc_id in source
assert "limitedNpcCount: INTERMISSION_NPCS.length" in source
assert "secondRoundBeforeQuestions: true" in source
assert "fullUnlockAfterQuestions: true" in source
assert "realArgumentBattleBridgePending: false" in source
assert "stage7_first_real_argument_battle_v1" in source
assert "Проверка понимания" in source
assert "Перейти к 6 вопросам" in source
assert "После вопросов откроется полная игра" in source
assert "snapshot.onboardingUnlocked = true" in source
assert "releaseNormalWorldOnce();" in source
assert "conflict.incoming(REAL_BATTLE_OPPONENT_ID" in source
assert "stage7OnboardingBridgeId" in source
assert "realBattleBridgeInFlight" in source
assert "syncRealArgumentBattleLifecycle" in source
assert "real_argument_battle_completed" in source
for stale in [
    "FOLLOW_UP_REACTION_DELAY_MS",
    "presentFollowUpReaction",
    "settleFollowUpReaction",
    "renderFreedomCard",
    "finish-evidence-report",
    "ack-follow-up-reaction",
]:
    assert stale not in source, f"superseded Stage 7.6 marker remains: {stale}"
for network_primitive in ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"]:
    assert network_primitive not in source, f"network primitive forbidden in onboarding controller: {network_primitive}"
assert "Stage 7.7 locked three-NPC intermission" in css
assert "stage7IntermissionGrid" in css
for index in [source_index, docs_index]:
    assert index.count("stage7_12_first_battle_aftermath_20260806a") >= 2

subprocess.run(["node", "--check", str(SOURCE)], check=True)
subprocess.run(["node", "--check", str(DOCS)], check=True)

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
global.location = { search: "?stage7test=1&stage7testrun=stage7-7-node" };
window.location = global.location;

const nodes = Object.create(null);
const docListeners = Object.create(null);
function createNode(tag) {
  const node = {
    tagName: String(tag || "").toUpperCase(),
    id: "",
    className: "",
    hidden: false,
    innerHTML: "",
    attributes: Object.create(null),
    listeners: Object.create(null),
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    remove() {
      if (this.id) delete nodes[this.id];
      if (blocks.firstChild === this) blocks.firstChild = null;
    },
  };
  return node;
}
const blocks = {
  id: "blocks",
  firstChild: null,
  insertBefore(node) {
    this.firstChild = node;
    if (node.id) nodes[node.id] = node;
  },
};
nodes.blocks = blocks;
global.document = {
  hidden: false,
  documentElement: { classList: { toggle() {} } },
  getElementById(id) { return nodes[id] || null; },
  createElement(tag) { return createNode(tag); },
  addEventListener(name, fn) { docListeners[name] = fn; },
};

let normalWorldStarts = 0;
let incomingCalls = 0;
let reentrantBridgeProbe = false;
const visibleLines = [];
const state = {
  me: { id: "me", points: 20 },
  players: {},
  battles: [],
  rep: 0,
};
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
        id: `stage7_real_battle_${incomingCalls}`,
        opponentId,
        fromThem: true,
        status: "pickDefense",
        attack: { id: "canon_Y1_yn_test", text: "Ты опять уходишь от ответа?", type: "yn", _color: "y" },
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
  requestRenderAll() {
    if (reentrantBridgeProbe && Game.__DEV && typeof Game.__DEV.runStage7RealArgumentBattleBridge === "function") {
      Game.__DEV.runStage7RealArgumentBattleBridge();
    }
  },
  renderAll() {},
};
const context = {
  state,
  UI,
  playerName: "Тестер",
  startNormalWorld() { normalWorldStarts += 1; },
};

const code = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
vm.runInThisContext(code, { filename: "ui-stage7-first-experience.js" });
const dev = Game.__DEV;
assert.deepStrictEqual(dev.getStage7IntermissionNpcIds(), ["npc_stage7_ken", "npc_stage7_mika", "npc_bandit"]);

Game.Stage7FirstExperience.claimFreshStart(context);
assert.strictEqual(dev.completeStage7RoundOne("deny"), true);
let snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.stateId, "intermission");
assert.strictEqual(snap.onboardingUnlocked, false);
assert.strictEqual(normalWorldStarts, 0);
let panel = document.getElementById("stage7FirstExperiencePanel");
assert(panel, "intermission panel missing");
assert.strictEqual((panel.innerHTML.match(/data-intermission-npc=/g) || []).length, 3);
assert.strictEqual(dev.talkStage7IntermissionNpc("npc_stage7_ken"), true);
assert.strictEqual(dev.talkStage7IntermissionNpc("npc_stage7_mika"), true);
assert.strictEqual(dev.talkStage7IntermissionNpc("npc_bandit"), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(Object.keys(snap.intermissionNpcVisits).length, 3);
assert.strictEqual(normalWorldStarts, 0);

assert.strictEqual(dev.settleStage7Intermission("return"), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.stateId, "round_two");
assert.strictEqual(snap.worldAdvancePresentationMode, "return");
assert.strictEqual(snap.evidence.worldAdvancePresentedCount, 1);
assert.strictEqual(dev.settleStage7Intermission("foreground"), false, "round two replayed");
assert.strictEqual(normalWorldStarts, 0);

assert.strictEqual(dev.resolveStage7RoundTwo("primary"), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.stateId, "round_two_result");
assert.strictEqual(snap.followUpChoiceId, "primary");
assert.strictEqual(snap.npcMemory.npc_stage7_mika.evidenceShared, 1);
assert.strictEqual(snap.evidence.worldAdvanceSettledCount, 1);
assert.strictEqual(dev.resolveStage7RoundTwo("secondary"), false, "second round settled twice");
assert.strictEqual(normalWorldStarts, 0);

assert.strictEqual(dev.openStage7Questions(), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.stateId, "questionnaire");
for (let i = 0; i < 5; i += 1) {
  assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
  assert.strictEqual(normalWorldStarts, 0, "world unlocked before sixth question");
}
reentrantBridgeProbe = true;
assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
reentrantBridgeProbe = false;
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.onboardingUnlocked, true);
assert.strictEqual(snap.stateId, "main_unlocked");
assert.strictEqual(normalWorldStarts, 1);
assert.strictEqual(incomingCalls, 1);
assert.strictEqual(snap.realBattleBridge.status, "created");
assert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_1");
assert.strictEqual(state.battles.length, 1);
assert.strictEqual(state.battles[0].meta.stage7OnboardingBridgeId, "stage7_first_real_argument_battle_v1");
assert.strictEqual(state.battles[0].meta.stage7BranchId, "deny");
assert.strictEqual(state.battles[0].meta.stage7SecondRoundChoiceId, "primary");
Game.Stage7FirstExperience.destroy();
const activeResume = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(activeResume.claimed, true, "active real battle did not reattach lifecycle tracking");
assert.strictEqual(activeResume.mode, "battle_bridge_active_resume");
assert.strictEqual(incomingCalls, 1, "active resume duplicated the battle");
assert(visibleLines.some((line) => line && line.name === "Райхан"), "Rayhan injection missing");
assert(visibleLines.some((line) => line && line.system === true && String(line.text).includes("баттл")), "battle transition line missing");
const report = dev.getStage7ObservedEvidenceReport();
assert(report, "test report missing");
assert.strictEqual(report.comprehensionScore, 6);
assert.strictEqual(report.comprehensionTotal, 6);
assert.strictEqual(report.continuationPath, "return");
assert.strictEqual(report.settlementAppliedCount, 1);
assert.strictEqual(report.worldAdvancePresentedCount, 1);
assert.strictEqual(report.worldAdvanceSettledCount, 1);
assert.strictEqual(report.secondRoundChoiceId, "primary");
assert.strictEqual(report.onboardingUnlocked, true);

const storageKey = Array.from(storage.keys()).find((key) => String(key).includes("stage7-7-node"));
assert(storageKey, "Stage 7 storage key missing");
const pendingRecovery = JSON.parse(storage.get(storageKey));
pendingRecovery.realBattleBridge.status = "pending";
pendingRecovery.realBattleBridge.battleId = null;
storage.set(storageKey, JSON.stringify(pendingRecovery));
Game.Stage7FirstExperience.destroy();
const recovered = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(recovered.claimed, true, "pending real battle bridge was not recovered");
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.status, "created");
assert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_1");
assert.strictEqual(incomingCalls, 1, "existing bridge battle was duplicated");
const createdButMissing = JSON.parse(storage.get(storageKey));
createdButMissing.realBattleBridge.status = "created";
createdButMissing.realBattleBridge.battleId = "stage7_real_battle_1";
storage.set(storageKey, JSON.stringify(createdButMissing));
state.battles.length = 0;
Game.Stage7FirstExperience.destroy();
const recreated = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(recreated.claimed, true, "missing created battle was not recovered");
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(incomingCalls, 2, "missing battle was not recreated exactly once");
assert.strictEqual(state.battles.length, 1);
assert.strictEqual(snap.realBattleBridge.status, "created");
assert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_2");
state.battles[0].resolved = true;
state.battles[0].finished = true;
state.battles[0].status = "finished";
state.battles[0].result = "win";
assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true, "finished battle lifecycle was not recorded");
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.status, "completed");
assert.strictEqual(snap.realBattleBridge.outcome, "win");
state.battles.length = 0;
Game.Stage7FirstExperience.destroy();
const aftermathResume = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(aftermathResume.claimed, true, "pending aftermath was not restored after refresh");
assert.strictEqual(aftermathResume.mode, "battle_aftermath_resume");
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.aftermathStatus, "pending");
assert.strictEqual(snap.realBattleBridge.aftermathApplyCount, 1);
assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), true);
Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, false, "acknowledged aftermath replayed after refresh");
assert.strictEqual(incomingCalls, 2);

Game.__DEV.resetStage7FirstExperience();
Game.Stage7FirstExperience.claimFreshStart(context);
assert.strictEqual(dev.completeStage7RoundOne("pay"), true);
assert.strictEqual(dev.settleStage7Intermission("foreground"), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.evidence.continuationPath, "foreground");
assert.strictEqual(dev.resolveStage7RoundTwo("secondary"), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.npcMemory.npc_bandit.pressureIgnored, 1);
Game.Stage7FirstExperience.destroy();

console.log("STAGE7_8_REAL_ARGUMENT_BATTLE_DYNAMIC_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=True, text=True, capture_output=True)
    assert "STAGE7_8_REAL_ARGUMENT_BATTLE_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)

print("STAGE7_8_REAL_ARGUMENT_BATTLE_OK")
