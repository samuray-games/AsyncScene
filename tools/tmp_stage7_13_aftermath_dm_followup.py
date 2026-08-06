from pathlib import Path

SOURCE = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
MIRROR = Path("docs/ui/ui-stage7-first-experience.js")
OLD_CACHE = "stage7_12_first_battle_aftermath_20260806a"
NEW_CACHE = "stage7_13_aftermath_dm_followup_20260806a"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


def insert_before(text: str, marker: str, addition: str, label: str) -> str:
    count = text.count(marker)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one marker, found {count}")
    return text.replace(marker, addition + marker, 1)


text = SOURCE.read_text(encoding="utf-8")
if text != MIRROR.read_text(encoding="utf-8"):
    raise SystemExit("Stage 7 controller mirrors differ before patch")

text = replace_once(
    text,
    '  const FIRST_BATTLE_AFTERMATH_ID = "stage7_first_real_battle_aftermath_v1";\n',
    '''  const FIRST_BATTLE_AFTERMATH_ID = "stage7_first_real_battle_aftermath_v1";
  const FIRST_BATTLE_AFTERMATH_DM_ID = "stage7_first_real_battle_dm_followup_v1";
  const FIRST_BATTLE_AFTERMATH_DM_COPY = Object.freeze({
    deny: Object.freeze({
      npcName: "Настя",
      win: "После баттла я больше не считаю твою версию неподтверждённой. Ты выдержал публичную проверку.",
      lose: "Публичный спор ты проиграл. Если хочешь, чтобы я поверила твоей версии, в следующий раз одних приготовленных ответов будет мало.",
      interrupted: "Для меня спор всё ещё не закрыт. Победителя не было, и обвинение осталось без окончательной проверки.",
    }),
    accuse_ken: Object.freeze({
      npcName: "Райхан",
      win: "Реванш ты выиграл. Я это запомнил. В следующий раз мне придётся заходить сильнее.",
      lose: "Я вернул инициативу в публичном споре. Теперь комната снова слышит мою версию первой.",
      interrupted: "Наш спор не закончен. Без ясного исхода я не считаю, что ты опроверг моё обвинение.",
    }),
    pay: Object.freeze({
      npcName: "Олег",
      win: "Ты заплатил, но потом выиграл публичный спор. Давить на тебя тем же способом второй раз уже не получится.",
      lose: "Оплата и проигранный баттл сделали мою версию удобнее для остальных. Я это запомнил.",
      interrupted: "Баттл ничего не закрыл. Пока нет ясного исхода, история с оплатой всё ещё работает против тебя.",
    }),
  });
''',
    "aftermath DM constants",
)

text = replace_once(
    text,
    '''      aftermathAcknowledgedAt: null,
      aftermathApplyCount: 0,
      lastFailureReason: null,
''',
    '''      aftermathAcknowledgedAt: null,
      aftermathApplyCount: 0,
      aftermathDmStatus: "not_applicable",
      aftermathDmLineId: null,
      aftermathDmDeliveredAt: null,
      aftermathDmDeliveryCount: 0,
      lastFailureReason: null,
''',
    "default bridge DM fields",
)

text = replace_once(
    text,
    '''      aftermathApplyCount: Math.max(0, Number(raw.aftermathApplyCount) | 0),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
''',
    '''      aftermathApplyCount: Math.max(0, Number(raw.aftermathApplyCount) | 0),
      aftermathDmStatus: ["not_applicable", "locked", "pending", "delivered"].includes(raw.aftermathDmStatus)
        ? raw.aftermathDmStatus
        : (raw.aftermathStatus === "acknowledged"
          ? "pending"
          : (raw.aftermathStatus === "pending" ? "locked" : "not_applicable")),
      aftermathDmLineId: typeof raw.aftermathDmLineId === "string" && raw.aftermathDmLineId
        ? raw.aftermathDmLineId
        : null,
      aftermathDmDeliveredAt: Number.isFinite(Number(raw.aftermathDmDeliveredAt))
        ? Number(raw.aftermathDmDeliveredAt)
        : null,
      aftermathDmDeliveryCount: Math.max(0, Number(raw.aftermathDmDeliveryCount) | 0),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
''',
    "sanitize bridge DM fields",
)

text = replace_once(
    text,
    '''      acknowledgedAt: bridge.aftermathAcknowledgedAt,
      applyCount: bridge.aftermathApplyCount,
      title: copy.title,
''',
    '''      acknowledgedAt: bridge.aftermathAcknowledgedAt,
      applyCount: bridge.aftermathApplyCount,
      dmStatus: bridge.aftermathDmStatus,
      dmLineId: bridge.aftermathDmLineId,
      dmDeliveredAt: bridge.aftermathDmDeliveredAt,
      dmDeliveryCount: bridge.aftermathDmDeliveryCount,
      title: copy.title,
''',
    "aftermath record DM view",
)

text = replace_once(
    text,
    '''    bridge.aftermathAcknowledgedAt = null;
    bridge.aftermathApplyCount = Math.max(1, bridge.aftermathApplyCount + 1);

    const record = {
''',
    '''    bridge.aftermathAcknowledgedAt = null;
    bridge.aftermathApplyCount = Math.max(1, bridge.aftermathApplyCount + 1);
    bridge.aftermathDmStatus = "locked";
    bridge.aftermathDmLineId = null;
    bridge.aftermathDmDeliveredAt = null;
    bridge.aftermathDmDeliveryCount = 0;

    const record = {
''',
    "record bridge DM lock",
)

text = replace_once(
    text,
    '''      acknowledgedAt: null,
      applyCount: bridge.aftermathApplyCount,
    };
''',
    '''      acknowledgedAt: null,
      applyCount: bridge.aftermathApplyCount,
      dmStatus: "locked",
      dmLineId: null,
      dmDeliveredAt: null,
      dmDeliveryCount: 0,
    };
''',
    "record NPC DM lock",
)

text = replace_once(
    text,
    '''    bridge.aftermathStatus = "acknowledged";
    bridge.aftermathAcknowledgedAt = acknowledgedAt;
    if (record && record.aftermathId === FIRST_BATTLE_AFTERMATH_ID) {
      record.status = "acknowledged";
      record.acknowledgedAt = acknowledgedAt;
    }
''',
    '''    bridge.aftermathStatus = "acknowledged";
    bridge.aftermathAcknowledgedAt = acknowledgedAt;
    bridge.aftermathDmStatus = "pending";
    bridge.aftermathDmLineId = null;
    bridge.aftermathDmDeliveredAt = null;
    bridge.aftermathDmDeliveryCount = 0;
    if (record && record.aftermathId === FIRST_BATTLE_AFTERMATH_ID) {
      record.status = "acknowledged";
      record.acknowledgedAt = acknowledgedAt;
      record.dmStatus = "pending";
      record.dmLineId = null;
      record.dmDeliveredAt = null;
      record.dmDeliveryCount = 0;
    }
''',
    "acknowledgement unlocks DM",
)

addition = r'''
  function getFirstBattleAftermathDmRecord(targetNpcId) {
    const current = snapshot || loadSnapshot();
    if (!current || current.onboardingUnlocked !== true) return null;
    const bridge = sanitizeRealBattleBridge(current.realBattleBridge);
    if (bridge.status !== "completed"
      || bridge.aftermathStatus !== "acknowledged"
      || bridge.aftermathDmStatus !== "pending") return null;
    const branchId = RESPONSE_IDS.includes(bridge.aftermathBranchId)
      ? bridge.aftermathBranchId
      : bridge.branchId;
    const expectedTarget = branchId ? FIRST_BATTLE_AFTERMATH_TARGETS[branchId] : null;
    const target = bridge.aftermathTargetNpcId || expectedTarget;
    if (!branchId || !target || target !== expectedTarget) return null;
    if (targetNpcId != null && String(targetNpcId) !== target) return null;
    const memory = current.npcMemory && current.npcMemory[target];
    const saved = memory && memory.firstRealBattleAftermath;
    if (!saved
      || saved.aftermathId !== FIRST_BATTLE_AFTERMATH_ID
      || saved.status !== "acknowledged"
      || !saved.battleId
      || saved.battleId !== bridge.battleId
      || saved.targetNpcId !== target
      || saved.branchId !== branchId) return null;
    const outcomeKind = ["win", "lose", "interrupted"].includes(bridge.aftermathOutcomeKind)
      ? bridge.aftermathOutcomeKind
      : normalizeFirstBattleAftermathOutcome(bridge.aftermathOutcomeRaw || bridge.outcome);
    const copyGroup = FIRST_BATTLE_AFTERMATH_DM_COPY[branchId];
    const text = copyGroup && copyGroup[outcomeKind];
    if (!copyGroup || !text) return null;
    const lineId = `${FIRST_BATTLE_AFTERMATH_DM_ID}:${bridge.battleId}:${target}`;
    return {
      followUpId: FIRST_BATTLE_AFTERMATH_DM_ID,
      lineId,
      targetNpcId: target,
      npcName: copyGroup.npcName,
      battleId: bridge.battleId,
      branchId,
      outcomeKind,
      text,
    };
  }

  function getDmLogsForNpc(targetNpcId) {
    const state = getState();
    if (!state) return null;
    state.dm = state.dm && typeof state.dm === "object" ? state.dm : {};
    state.dm.logs = state.dm.logs && typeof state.dm.logs === "object" ? state.dm.logs : {};
    const id = String(targetNpcId || "");
    if (!id) return null;
    state.dm.logs[id] = Array.isArray(state.dm.logs[id]) ? state.dm.logs[id] : [];
    return state.dm.logs[id];
  }

  function deliverFirstBattleAftermathDm(targetNpcId) {
    const pending = getFirstBattleAftermathDmRecord(targetNpcId);
    if (!pending) return false;
    if (!snapshot) snapshot = loadSnapshot();
    if (!snapshot) return false;
    ensureScenarioPlayers();
    const logs = getDmLogsForNpc(pending.targetNpcId);
    const UI = G.UI;
    if (!logs || !UI || typeof UI.dmPushLine !== "function") return false;
    let line = logs.find((item) => item
      && item.stage7AftermathReplyId === pending.lineId
      && item.stage7AftermathBattleId === pending.battleId) || null;
    if (!line) {
      UI.dmPushLine(pending.targetNpcId, pending.npcName, pending.text);
      line = logs[logs.length - 1] || null;
      if (!line) return false;
      line.stage7AftermathReplyId = pending.lineId;
      line.stage7AftermathBattleId = pending.battleId;
      line.stage7AftermathOutcomeKind = pending.outcomeKind;
    }

    const bridge = getBridgeState();
    const memory = snapshot.npcMemory && snapshot.npcMemory[pending.targetNpcId];
    const record = memory && memory.firstRealBattleAftermath;
    if (!bridge || !record || record.battleId !== pending.battleId) return false;
    const deliveredAt = Date.now();
    bridge.aftermathDmStatus = "delivered";
    bridge.aftermathDmLineId = pending.lineId;
    bridge.aftermathDmDeliveredAt = bridge.aftermathDmDeliveredAt || deliveredAt;
    bridge.aftermathDmDeliveryCount = Math.max(1, bridge.aftermathDmDeliveryCount || 0);
    record.dmStatus = "delivered";
    record.dmLineId = pending.lineId;
    record.dmDeliveredAt = record.dmDeliveredAt || bridge.aftermathDmDeliveredAt;
    record.dmDeliveryCount = Math.max(1, record.dmDeliveryCount || 0);
    ensureScenarioPlayers();
    saveSnapshot();
    telemetry("first_experience.first_real_battle_aftermath_dm_delivered", {
      followUpId: FIRST_BATTLE_AFTERMATH_DM_ID,
      lineId: pending.lineId,
      targetNpcId: pending.targetNpcId,
      branchId: pending.branchId,
      battleId: pending.battleId,
      outcomeKind: pending.outcomeKind,
      deliveryCount: bridge.aftermathDmDeliveryCount,
    });
    if (typeof UI.requestRenderAll === "function") UI.requestRenderAll();
    else if (typeof UI.renderAll === "function") UI.renderAll();
    return true;
  }

  function installFirstBattleAftermathDmHook() {
    const UI = G.UI;
    if (!UI || typeof UI.openDM !== "function") return false;
    if (UI.openDM.__stage7AftermathDmHook === true) return true;
    const originalOpenDM = UI.openDM;
    const wrappedOpenDM = function stage7AftermathOpenDM(playerId, ...args) {
      const pending = getFirstBattleAftermathDmRecord(playerId);
      if (pending) {
        if (!snapshot) snapshot = loadSnapshot();
        ensureScenarioPlayers();
      }
      const result = originalOpenDM.apply(this, [playerId, ...args]);
      if (result !== false) deliverFirstBattleAftermathDm(playerId);
      return result;
    };
    Object.defineProperty(wrappedOpenDM, "__stage7AftermathDmHook", {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false,
    });
    Object.defineProperty(wrappedOpenDM, "__stage7AftermathDmOriginal", {
      configurable: false,
      enumerable: false,
      value: originalOpenDM,
      writable: false,
    });
    UI.openDM = wrappedOpenDM;
    return true;
  }

'''
text = insert_before(
    text,
    '  function render() {\n    if (!snapshot) return;\n',
    addition,
    "DM functions before render",
)

text = replace_once(
    text,
    '''    acknowledgeFirstBattleAftermath,
    getFirstBattleAftermathRecord,
    resetForDev,
''',
    '''    acknowledgeFirstBattleAftermath,
    getFirstBattleAftermathRecord,
    getFirstBattleAftermathDmRecord,
    deliverFirstBattleAftermathDm,
    installFirstBattleAftermathDmHook,
    resetForDev,
''',
    "public Stage 7 DM API",
)

text = replace_once(
    text,
    '''  G.__DEV.getStage7FirstBattleAftermath = getFirstBattleAftermathRecord;
  G.__DEV.acknowledgeStage7FirstBattleAftermath = acknowledgeFirstBattleAftermath;
''',
    '''  G.__DEV.getStage7FirstBattleAftermath = getFirstBattleAftermathRecord;
  G.__DEV.acknowledgeStage7FirstBattleAftermath = acknowledgeFirstBattleAftermath;
  G.__DEV.getStage7FirstBattleAftermathDm = getFirstBattleAftermathDmRecord;
  G.__DEV.deliverStage7FirstBattleAftermathDm = deliverFirstBattleAftermathDm;
  G.__DEV.installStage7FirstBattleAftermathDmHook = installFirstBattleAftermathDmHook;
''',
    "dev Stage 7 DM API",
)

text = replace_once(
    text,
    '''  G.__DEV.getStage7IntermissionNpcIds = () => INTERMISSION_NPCS.map((npc) => npc.id);
  G.__DEV.smokeStage7FirstCausalVerticalSlice = () => ({
''',
    '''  G.__DEV.getStage7IntermissionNpcIds = () => INTERMISSION_NPCS.map((npc) => npc.id);
  installFirstBattleAftermathDmHook();
  G.__DEV.smokeStage7FirstCausalVerticalSlice = () => ({
''',
    "install DM hook",
)

text = replace_once(text, '    stage: "7.12",\n', '    stage: "7.13",\n', "smoke stage")
text = replace_once(
    text,
    '''    firstBattleAftermathExactlyOnce: true,
  });
''',
    '''    firstBattleAftermathExactlyOnce: true,
    firstBattleAftermathDmFollowUpId: FIRST_BATTLE_AFTERMATH_DM_ID,
    firstBattleAftermathDmTargetBound: true,
    firstBattleAftermathDmExactlyOnce: true,
    firstBattleAftermathDmRefreshSafe: true,
  });
''',
    "smoke DM markers",
)

SOURCE.write_text(text, encoding="utf-8")
MIRROR.write_text(text, encoding="utf-8")

cache_files = [
    Path("AsyncScene/Web/index.html"),
    Path("docs/index.html"),
    Path("tools/test_stage7_observed_evidence_harness.py"),
    Path("tools/test_stage7_first_causal_vertical_slice.py"),
    Path("tools/test_stage7_9_deny_evidence_payoff.py"),
    Path("tools/test_stage7_10_accuse_ken_payoffs.py"),
    Path("tools/test_stage7_11_pay_branch_payoffs.py"),
    Path("tools/test_stage7_7_preunlock_corridor.py"),
    Path("tools/test_stage7_12_first_real_battle_aftermath.py"),
]
for path in cache_files:
    current = path.read_text(encoding="utf-8")
    if OLD_CACHE not in current:
        raise SystemExit(f"missing old cache token in {path}")
    path.write_text(current.replace(OLD_CACHE, NEW_CACHE), encoding="utf-8")

new_test = r'''from pathlib import Path
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
    assert text.count("stage7_13_aftermath_dm_followup_20260806a") >= 2

for path in [CONTROLLER, CONTROLLER_DOCS]:
    subprocess.run(["node", "--check", str(path)], check=True)

node_harness = r'''
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
  assert.strictEqual(run.G.Stage7FirstExperience.claimResume(rt.context).claimed, false);
  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
  assert.strictEqual((rt.state.dm.logs[targetNpcId] || []).length, 1);
  return rt;
}

runCase("deny-win", "deny", "primary", "win", "npc_stage7_mika", "npc_stage7_ken", "выдержал публичную проверку");
runCase("accuse-lose", "accuse_ken", "secondary", "lose", "npc_stage7_ken", "npc_bandit", "вернул инициативу");
runCase("pay-interrupted", "pay", "secondary", "ignored", "npc_bandit", "npc_stage7_mika", "Баттл ничего не закрыл");

// Legacy accepted Stage 7.12 saves without new DM fields migrate to one pending reply.
const legacySource = makeRuntime("legacy-source");
const prepared = prepareAcknowledged(legacySource, "deny", "secondary", "win");
assert.strictEqual(prepared.dev.acknowledgeStage7FirstBattleAftermath(), true);
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
'''

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
'''
Path("tools/test_stage7_13_aftermath_dm_followup.py").write_text(new_test, encoding="utf-8")

print("STAGE7_13_AFTERMATH_DM_FOLLOWUP_PATCH_OK")
