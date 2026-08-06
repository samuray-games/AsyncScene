from pathlib import Path

CONTROLLER_PATHS = [
    Path("AsyncScene/Web/ui/ui-stage7-first-experience.js"),
    Path("docs/ui/ui-stage7-first-experience.js"),
]
DM_PATHS = [Path("AsyncScene/Web/ui/ui-dm.js"), Path("docs/ui/ui-dm.js")]
INDEX_PATHS = [Path("AsyncScene/Web/index.html"), Path("docs/index.html")]
CACHE_OLD = "stage7_12_first_battle_aftermath_20260806a"
CACHE_NEW = "stage7_13_aftermath_dm_follow_up_20260806a"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


def patch_controller(text: str) -> str:
    replies = {
        "Ты отбил обвинение Райхана в настоящем баттле. Настя теперь помнит, что твоя версия выдержала публичную проверку.":
            "Я видела, как ты выдержал публичный спор. Теперь твоим словам я верю больше, но доказательства всё равно важны.",
        "Ты проиграл публичный спор Райхану. Настя запомнила, что подготовленного ответа оказалось недостаточно.":
            "После проигрыша одних слов мало. Принеси доказательство, и тогда вернёмся к разговору.",
        "Баттл закончился без ясной победы. Настя запомнила, что обвинение так и не было окончательно проверено.":
            "Для меня спор не закрыт. Пока нет ясного исхода, я не стану вставать ни на чью сторону.",
        "Ты победил Райхана в публичном реванше. Он запомнил, что встречное обвинение выдержало настоящий спор.":
            "Ты победил один раз. Теперь я знаю, что ты умеешь отвечать, но вопрос для меня не закрыт.",
        "Райхан выиграл публичный реванш. Он запомнил, что сумел снова навязать комнате свою версию.":
            "Я выиграл публично. Если хочешь продолжать, приходи с новым аргументом.",
        "Баттл закончился без ясной победы. Райхан запомнил конфликт как незакрытый.":
            "Реванш не закончен. Следующий спор начнём с того места, где остановились.",
        "Ты отбил давление в публичном споре. Олег запомнил, что оплата не стала признанием вины.":
            "Ладно, оплата не была признанием. Второй раз на этом я тебя не прижму.",
        "Ты проиграл спор после оплаты. Олег решил, что этот способ давления можно использовать снова.":
            "Ты заплатил и проиграл спор. Значит, давление всё ещё работает.",
        "Баттл закончился без ясной победы. Олег запомнил, что вопрос об оплате остался открытым.":
            "Оплата осталась спорной. Я пока не отказываюсь от этой версии.",
    }
    for body, reply in replies.items():
        old = f'        body: "{body}",\n      }}),'
        new = f'        body: "{body}",\n        dmReply: "{reply}",\n      }}),'
        text = replace_once(text, old, new, f"aftermath copy: {body[:24]}")

    text = replace_once(
        text,
        '      aftermathApplyCount: 0,\n      lastFailureReason: null,',
        '      aftermathApplyCount: 0,\n      aftermathDmStatus: "not_applicable",\n      aftermathDmUsedAt: null,\n      aftermathDmUseCount: 0,\n      lastFailureReason: null,',
        "default aftermath DM fields",
    )
    text = replace_once(
        text,
        '      aftermathApplyCount: Math.max(0, Number(raw.aftermathApplyCount) | 0),\n      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,',
        '''      aftermathApplyCount: Math.max(0, Number(raw.aftermathApplyCount) | 0),
      aftermathDmStatus: ["not_applicable", "pending", "used"].includes(raw.aftermathDmStatus)
        ? raw.aftermathDmStatus
        : ((["pending", "acknowledged"].includes(raw.aftermathStatus)
          && Object.values(FIRST_BATTLE_AFTERMATH_TARGETS).includes(raw.aftermathTargetNpcId)
          && ["win", "lose", "interrupted"].includes(raw.aftermathOutcomeKind))
          ? "pending"
          : "not_applicable"),
      aftermathDmUsedAt: Number.isFinite(Number(raw.aftermathDmUsedAt)) ? Number(raw.aftermathDmUsedAt) : null,
      aftermathDmUseCount: Math.max(0, Number(raw.aftermathDmUseCount) | 0),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,''',
        "sanitize aftermath DM fields",
    )
    text = replace_once(
        text,
        '      applyCount: bridge.aftermathApplyCount,\n      title: copy.title,\n      body: copy.body,',
        '      applyCount: bridge.aftermathApplyCount,\n      dmStatus: bridge.aftermathDmStatus,\n      dmUsedAt: bridge.aftermathDmUsedAt,\n      dmUseCount: bridge.aftermathDmUseCount,\n      title: copy.title,\n      body: copy.body,\n      dmReply: copy.dmReply,',
        "aftermath record read model",
    )
    text = replace_once(
        text,
        '    bridge.aftermathApplyCount = Math.max(1, bridge.aftermathApplyCount + 1);\n\n    const record = {',
        '    bridge.aftermathApplyCount = Math.max(1, bridge.aftermathApplyCount + 1);\n    bridge.aftermathDmStatus = "pending";\n    bridge.aftermathDmUsedAt = null;\n    bridge.aftermathDmUseCount = 0;\n\n    const record = {',
        "record bridge DM pending",
    )
    text = replace_once(
        text,
        '      acknowledgedAt: null,\n      applyCount: bridge.aftermathApplyCount,\n    };',
        '      acknowledgedAt: null,\n      applyCount: bridge.aftermathApplyCount,\n      dmStatus: "pending",\n      dmUsedAt: null,\n      dmUseCount: 0,\n    };',
        "record nested DM pending",
    )

    consume_function = r'''
  function consumeFirstBattleAftermathDmReply(targetNpcId) {
    const stored = loadSnapshot();
    if (stored) snapshot = stored;
    if (!snapshot || !snapshot.onboardingUnlocked) return null;
    const bridge = getBridgeState();
    const targetId = String(targetNpcId || "");
    if (!bridge
      || bridge.status !== "completed"
      || bridge.aftermathStatus !== "acknowledged"
      || bridge.aftermathDmStatus !== "pending"
      || !targetId
      || targetId !== bridge.aftermathTargetNpcId) return null;
    const record = getFirstBattleAftermathRecord();
    if (!record || record.targetNpcId !== targetId || !record.dmReply) return null;

    const usedAt = Date.now();
    bridge.aftermathDmStatus = "used";
    bridge.aftermathDmUsedAt = usedAt;
    bridge.aftermathDmUseCount = Math.max(1, bridge.aftermathDmUseCount + 1);
    const memory = snapshot.npcMemory && snapshot.npcMemory[targetId];
    const storedRecord = memory && memory.firstRealBattleAftermath;
    if (storedRecord && storedRecord.aftermathId === FIRST_BATTLE_AFTERMATH_ID) {
      storedRecord.dmStatus = "used";
      storedRecord.dmUsedAt = usedAt;
      storedRecord.dmUseCount = bridge.aftermathDmUseCount;
    }
    ensureScenarioPlayers();
    saveSnapshot();
    telemetry("first_experience.first_real_battle_aftermath_dm_used", {
      aftermathId: FIRST_BATTLE_AFTERMATH_ID,
      targetNpcId: targetId,
      branchId: bridge.aftermathBranchId,
      battleId: bridge.battleId,
      outcomeKind: bridge.aftermathOutcomeKind,
      useCount: bridge.aftermathDmUseCount,
    });
    return Object.assign({}, record, {
      dmStatus: "used",
      dmUsedAt: usedAt,
      dmUseCount: bridge.aftermathDmUseCount,
      consumed: true,
      reply: record.dmReply,
    });
  }

'''
    text = replace_once(text, '\n  function render() {', '\n' + consume_function + '  function render() {', "consume DM function")
    text = replace_once(
        text,
        '    acknowledgeFirstBattleAftermath,\n    getFirstBattleAftermathRecord,',
        '    acknowledgeFirstBattleAftermath,\n    getFirstBattleAftermathRecord,\n    consumeFirstBattleAftermathDmReply,',
        "public consume API",
    )
    text = replace_once(
        text,
        '  G.__DEV.acknowledgeStage7FirstBattleAftermath = acknowledgeFirstBattleAftermath;\n  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;',
        '  G.__DEV.acknowledgeStage7FirstBattleAftermath = acknowledgeFirstBattleAftermath;\n  G.__DEV.consumeStage7FirstBattleAftermathDmReply = consumeFirstBattleAftermathDmReply;\n  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;',
        "dev consume API",
    )
    text = replace_once(text, '    stage: "7.12",', '    stage: "7.13",', "smoke stage")
    text = replace_once(
        text,
        '    firstBattleAftermathExactlyOnce: true,\n  });',
        '    firstBattleAftermathExactlyOnce: true,\n    firstBattleAftermathDmFollowUp: true,\n    firstBattleAftermathDmExactlyOnce: true,\n    firstBattleAftermathDmTargetIsolated: true,\n  });',
        "smoke DM flags",
    )
    return text


def patch_dm(text: str) -> str:
    helper = r'''

  function consumeStage7AftermathDmOnOpen(playerId) {
    const id = String(playerId || "");
    const stage7 = Game.Stage7FirstExperience;
    if (!id || !stage7 || typeof stage7.consumeFirstBattleAftermathDmReply !== "function") return null;
    let result = null;
    try { result = stage7.consumeFirstBattleAftermathDmReply(id); } catch (_) { return null; }
    if (!result || result.consumed !== true || !result.reply) return null;
    const S = getS();
    const target = S && S.players ? S.players[id] : null;
    dmPushLine(id, target && target.name ? target.name : id, result.reply);
    return result;
  }
  Game.__DEV.consumeStage7AftermathDmOnOpen = consumeStage7AftermathDmOnOpen;
'''
    text = replace_once(text, '  UI.dmPushLine = dmPushLine;\n', '  UI.dmPushLine = dmPushLine;' + helper + '\n', "DM consume helper")
    text = replace_once(
        text,
        '    S.dm.withId = id; // compat alias\n    S.dm.open = true;\n\n    // Ensure the DM becomes a visible tab even before any incoming messages.',
        '    S.dm.withId = id; // compat alias\n    S.dm.open = true;\n    consumeStage7AftermathDmOnOpen(id);\n\n    // Ensure the DM becomes a visible tab even before any incoming messages.',
        "DM open consume hook",
    )
    return text


def make_test() -> str:
    return r'''from pathlib import Path
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
'''


source_controller = CONTROLLER_PATHS[0].read_text(encoding="utf-8")
source_dm = DM_PATHS[0].read_text(encoding="utf-8")
source_index = INDEX_PATHS[0].read_text(encoding="utf-8")
patched_controller = patch_controller(source_controller)
patched_dm = patch_dm(source_dm)
patched_index = source_index.replace(CACHE_OLD, CACHE_NEW)
patched_index = replace_once(
    patched_index,
    'ui/ui-dm.js?v=step9_security_ui_respect_state_access_20260802a',
    f'ui/ui-dm.js?v={CACHE_NEW}',
    "DM cache marker",
)

for path in CONTROLLER_PATHS:
    path.write_text(patched_controller, encoding="utf-8")
for path in DM_PATHS:
    path.write_text(patched_dm, encoding="utf-8")
for path in INDEX_PATHS:
    path.write_text(patched_index, encoding="utf-8")

marker_tests = [
    Path("tools/test_stage7_12_first_real_battle_aftermath.py"),
    Path("tools/test_stage7_11_pay_branch_payoffs.py"),
    Path("tools/test_stage7_10_accuse_ken_payoffs.py"),
    Path("tools/test_stage7_9_deny_evidence_payoff.py"),
    Path("tools/test_stage7_7_preunlock_corridor.py"),
    Path("tools/test_stage7_first_causal_vertical_slice.py"),
    Path("tools/test_stage7_observed_evidence_harness.py"),
]
for path in marker_tests:
    text = path.read_text(encoding="utf-8")
    if CACHE_OLD not in text:
        raise SystemExit(f"missing cache marker in {path}")
    path.write_text(text.replace(CACHE_OLD, CACHE_NEW), encoding="utf-8")

Path("tools/test_stage7_13_aftermath_dm_follow_up.py").write_text(make_test(), encoding="utf-8")
print("STAGE7_13_PATCH_APPLIED")
