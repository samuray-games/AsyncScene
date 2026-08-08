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
    "stage7_first_real_battle_dm_followup_v1",
    "aftermathDmStatus",
    "getFirstBattleAftermathDmRecord",
    "deliverFirstBattleAftermathDm",
    "installFirstBattleAftermathDmHook",
    "first_real_battle_aftermath_dm_delivered",
    "__stage7AftermathDmHook",
    "stage7AftermathReplyId",
]:
    assert marker in controller, marker

for copy in [
    "После баттла я больше не считаю твою версию неподтверждённой.",
    "Публичный спор ты проиграл.",
    "Для меня спор всё ещё не закрыт.",
    "Реванш ты выиграл.",
    "Я вернул инициативу в публичном споре.",
    "Наш спор не закончен.",
    "Ты заплатил, но потом выиграл публичный спор.",
    "Оплата и проигранный баттл сделали мою версию удобнее",
    "Баттл ничего не закрыл.",
]:
    assert copy in controller, copy

for text in [INDEX.read_text(encoding="utf-8"), INDEX_DOCS.read_text(encoding="utf-8")]:
    assert text.count("stage7_14_durable_aftermath_dm_contact_20260807a") >= 2

for path in [CONTROLLER, CONTROLLER_DOCS]:
    subprocess.run(["node", "--check", str(path)], check=True)

node_harness = r"""
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");

function makeRuntime(token, seedEntries) {
  const storage = new Map(seedEntries || []);
  const nodes = Object.create(null);
  let controlledMode = null;
  const openCalls = [];
  const visibleLines = [];
  const state = { me: { id: "me", points: 50 }, players: {}, battles: [], rep: 0, dm: { logs: {}, openIds: [] } };
  let incomingCalls = 0;
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
  const UI = {
    S: state,
    nowHHMM() { return "12:00"; },
    pushSystem(text) { visibleLines.push({ system: true, text }); },
    pushChat(entry) { visibleLines.push(entry); },
    requestRenderAll() {}, renderAll() {},
    dmPushLine(whoId, from, text) {
      state.dm.logs[whoId] = state.dm.logs[whoId] || [];
      state.dm.logs[whoId].push({ t: "12:00", from, text });
    },
    openDM(playerId) {
      if (!state.players[playerId]) return false;
      openCalls.push(playerId);
      state.dm.openIds.push(playerId);
      return `opened:${playerId}`;
    },
  };
  const sandbox = {
    console, require, setTimeout, clearTimeout, setInterval, clearInterval,
    URLSearchParams, Date, Math, JSON, Object, Array, String, Number, Boolean, Set, Map,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); },
    },
    location: { search: `?stage7test=1&stage7testrun=${token}` },
    document: {
      hidden: false,
      documentElement: { classList: { toggle(name, value) { if (name === "stage7-first-experience-active") controlledMode = !!value; } } },
      getElementById(id) { return nodes[id] || null; },
      createElement(tag) { return createNode(tag); },
      addEventListener() {},
    },
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.Game = {
    __S: state, State: state, Data: { START_POINTS_NPC: 10 },
    __A: { transferRep() { return { ok: true }; } },
    ConflictEconomy: { transferPoints() { return { ok: true }; } },
    Conflict: {
      incoming(opponentId) {
        incomingCalls += 1;
        const battle = {
          id: `stage7_dm_real_${incomingCalls}`,
          opponentId, fromThem: true, status: "pickDefense", resolved: false, finished: false,
          attack: { id: "canon_R1_yn_dm", text: "Ты отвечаешь за это?", type: "yn", group: "yn", _color: "r" },
          meta: {},
        };
        state.battles.unshift(battle);
        return { ok: true, battleId: battle.id, battle };
      },
    },
    UI,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "ui-stage7-first-experience.js" });
  const context = { state, UI, playerName: "Тестер", startNormalWorld() {} };
  return { sandbox, storage, state, UI, openCalls, visibleLines, context, get controlledMode() { return controlledMode; } };
}

function prepareAcknowledged(rt, branchId, choiceId, result) {
  const G = rt.sandbox.Game;
  const dev = G.__DEV;
  assert.strictEqual(G.Stage7FirstExperience.claimFreshStart(rt.context).claimed, true);
  assert.strictEqual(dev.completeStage7RoundOne(branchId), true);
  assert.strictEqual(dev.settleStage7Intermission("foreground"), true);
  assert.strictEqual(dev.resolveStage7RoundTwo(choiceId), true);
  assert.strictEqual(dev.openStage7Questions(), true);
  for (let i = 0; i < 6; i += 1) assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
  let snap = dev.getStage7FirstExperienceSnapshot();
  const battle = rt.state.battles.find(item => item && item.id === snap.realBattleBridge.battleId);
  assert(battle);
  battle.resolved = true;
  battle.finished = true;
  battle.status = "finished";
  battle.result = result;
  assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true);
  snap = dev.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathStatus, "pending");
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "locked");
  return { G, dev, battle, snap };
}

function runCase(token, branchId, choiceId, result, targetNpcId, wrongNpcId, expectedText) {
  const rt = makeRuntime(token);
  const run = prepareAcknowledged(rt, branchId, choiceId, result);
  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
  assert.strictEqual((rt.state.dm.logs[targetNpcId] || []).length, 0, "DM must stay locked before acknowledgement");
  assert.strictEqual(run.dev.acknowledgeStage7FirstBattleAftermath(), true);
  let snap = run.dev.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "pending");
  assert.strictEqual(rt.UI.openDM(wrongNpcId), `opened:${wrongNpcId}`);
  assert.strictEqual((rt.state.dm.logs[wrongNpcId] || []).length, 0);
  assert.strictEqual(run.dev.getStage7FirstBattleAftermathDm(targetNpcId).targetNpcId, targetNpcId);
  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
  const logs = rt.state.dm.logs[targetNpcId] || [];
  assert.strictEqual(logs.length, 1);
  assert(logs[0].text.includes(expectedText));
  assert(logs[0].stage7AftermathReplyId.includes("stage7_first_real_battle_dm_followup_v1"));
  snap = run.dev.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "delivered");
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
  assert.strictEqual(snap.npcMemory[targetNpcId].firstRealBattleAftermath.dmStatus, "delivered");
  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
  assert.strictEqual((rt.state.dm.logs[targetNpcId] || []).length, 1);
  assert.strictEqual(run.dev.deliverStage7FirstBattleAftermathDm(targetNpcId), false);
  run.G.Stage7FirstExperience.destroy();
  const resumedClaim = run.G.Stage7FirstExperience.claimResume(rt.context);
  assert.strictEqual(resumedClaim.claimed, true);
  assert.strictEqual(resumedClaim.mode, "battle_aftermath_dm_contact_resume");
  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
  assert.strictEqual((rt.state.dm.logs[targetNpcId] || []).length, 1);
  run.G.Stage7FirstExperience.destroy();
  return rt;
}

runCase("deny-win", "deny", "primary", "win", "npc_stage7_mika", "npc_stage7_ken", "выдержал публичную проверку");
runCase("accuse-lose", "accuse_ken", "secondary", "lose", "npc_stage7_ken", "npc_bandit", "вернул инициативу");
runCase("pay-interrupted", "pay", "secondary", "ignored", "npc_bandit", "npc_stage7_mika", "Баттл ничего не закрыл");

// Legacy accepted Stage 7.12 saves without new DM fields migrate to one pending reply.
const legacySource = makeRuntime("legacy-source");
const prepared = prepareAcknowledged(legacySource, "deny", "secondary", "win");
assert.strictEqual(prepared.dev.acknowledgeStage7FirstBattleAftermath(), true);
prepared.G.Stage7FirstExperience.destroy();
const entries = Array.from(legacySource.storage.entries());
assert.strictEqual(entries.length, 1);
const legacyPayload = JSON.parse(entries[0][1]);
delete legacyPayload.realBattleBridge.aftermathDmStatus;
delete legacyPayload.realBattleBridge.aftermathDmLineId;
delete legacyPayload.realBattleBridge.aftermathDmDeliveredAt;
delete legacyPayload.realBattleBridge.aftermathDmDeliveryCount;
const legacyRecord = legacyPayload.npcMemory.npc_stage7_mika.firstRealBattleAftermath;
delete legacyRecord.dmStatus;
delete legacyRecord.dmLineId;
delete legacyRecord.dmDeliveredAt;
delete legacyRecord.dmDeliveryCount;
const legacy = makeRuntime("legacy-source", [[entries[0][0], JSON.stringify(legacyPayload)]]);
assert.strictEqual(legacy.UI.openDM("npc_stage7_mika"), "opened:npc_stage7_mika");
assert.strictEqual(legacy.state.dm.logs.npc_stage7_mika.length, 1);
assert.strictEqual(legacy.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot().realBattleBridge.aftermathDmStatus, "delivered");
assert.strictEqual(legacy.UI.openDM("npc_stage7_mika"), "opened:npc_stage7_mika");
assert.strictEqual(legacy.state.dm.logs.npc_stage7_mika.length, 1);

// No Stage 7 aftermath means ordinary DM openings have no injected reply.
const ordinary = makeRuntime("ordinary");
ordinary.state.players.npc_stage7_mika = { id: "npc_stage7_mika", name: "Настя", npc: true };
assert.strictEqual(ordinary.sandbox.Game.__DEV.deliverStage7FirstBattleAftermathDm("npc_stage7_mika"), false);
assert.strictEqual(ordinary.UI.openDM("npc_stage7_mika"), "opened:npc_stage7_mika");
assert.strictEqual((ordinary.state.dm.logs.npc_stage7_mika || []).length, 0);

console.log("STAGE7_13_AFTERMATH_DM_FOLLOWUP_DYNAMIC_OK");
"""

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=False, text=True, capture_output=True)
    if completed.returncode != 0:
        raise AssertionError("node harness failed\nSTDOUT:\n" + completed.stdout + "\nSTDERR:\n" + completed.stderr)
    assert "STAGE7_13_AFTERMATH_DM_FOLLOWUP_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)

print("STAGE7_13_AFTERMATH_DM_FOLLOWUP_OK")
