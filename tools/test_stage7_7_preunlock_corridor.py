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
assert "const ONBOARDING_FLOW_VERSION = 2" in source
assert "const INTERMISSION_DELAY_MS = WORLD_ADVANCE_DELAY_MS" in source
assert '"intermission", "round_two", "round_two_result", "questionnaire"' in source
assert "const INTERMISSION_NPCS = [" in source
for npc_id in ["npc_stage7_ken", "npc_stage7_mika", "npc_bandit"]:
    assert npc_id in source
assert "limitedNpcCount: INTERMISSION_NPCS.length" in source
assert "secondRoundBeforeQuestions: true" in source
assert "fullUnlockAfterQuestions: true" in source
assert "realArgumentBattleBridgePending: true" in source
assert "Проверка понимания" in source
assert "Перейти к 6 вопросам" in source
assert "После вопросов откроется полная игра" in source
assert "snapshot.onboardingUnlocked = true" in source
assert "releaseNormalWorldOnce();" in source
assert "Game.Conflict.incoming" not in source, "real combat bridge belongs to the next atomic PR"
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
    assert index.count("stage7_7_preunlock_corridor_20260805a") >= 2

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
  UI: {},
};
const UI = {
  S: state,
  pushSystem() {},
  pushChat() {},
  requestRenderAll() {},
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
assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.onboardingUnlocked, true);
assert.strictEqual(snap.stateId, "main_unlocked");
assert.strictEqual(normalWorldStarts, 1);
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

Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, false, "completed corridor replayed after refresh");
assert.strictEqual(normalWorldStarts, 1);

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

console.log("STAGE7_7_PREUNLOCK_CORRIDOR_DYNAMIC_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=True, text=True, capture_output=True)
    assert "STAGE7_7_PREUNLOCK_CORRIDOR_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)

print("STAGE7_7_PREUNLOCK_CORRIDOR_OK")
