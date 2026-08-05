from pathlib import Path

SOURCE = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
DOCS = Path("docs/ui/ui-stage7-first-experience.js")
SOURCE_INDEX = Path("AsyncScene/Web/index.html")
DOCS_INDEX = Path("docs/index.html")
TEST = Path("tools/test_stage7_7_preunlock_corridor.py")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


bridge_constants = r'''  const REAL_BATTLE_BRIDGE_ID = "stage7_first_real_argument_battle_v1";
  const REAL_BATTLE_OPPONENT_ID = "npc_stage7_ken";
  const REAL_BATTLE_RETRY_MS = 250;
  const REAL_BATTLE_MAX_ATTEMPTS = 40;
  const REAL_BATTLE_INJECTIONS = {
    deny: {
      primary: "Настя показала твоё доказательство. Но оно доказывает только то, что ты успел подготовить оправдание. Отвечай публично.",
      secondary: "Доказательство опять осталось у тебя. Значит, его никто не видел. Отвечай публично.",
    },
    accuse_ken: {
      primary: "Ты сам принял реванш. Хватит прятаться за словами - отвечай аргументом.",
      secondary: "Приводи свидетеля. А сначала объясни всем, почему обвиняешь меня.",
    },
    pay: {
      primary: "Расписка подтверждает платёж, а не невиновность. Объясни это всем.",
      secondary: "Ты заплатил и оставил всё как есть. Для остальных это выглядит как признание.",
    },
  };

'''

bridge_state_helpers = r'''  function defaultRealBattleBridge() {
    return {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      status: "not_started",
      battleId: null,
      branchId: null,
      secondRoundChoiceId: null,
      queuedAt: null,
      createdAt: null,
      injectionShown: false,
      injectionShownAt: null,
      attemptCount: 0,
      lastAttemptAt: null,
      lastFailureReason: null,
    };
  }

  function sanitizeRealBattleBridge(raw) {
    const base = defaultRealBattleBridge();
    if (!raw || typeof raw !== "object") return base;
    return Object.assign(base, raw, {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      status: ["not_started", "pending", "created"].includes(raw.status) ? raw.status : "not_started",
      battleId: typeof raw.battleId === "string" && raw.battleId ? raw.battleId : null,
      branchId: RESPONSE_IDS.includes(raw.branchId) ? raw.branchId : null,
      secondRoundChoiceId: ["primary", "secondary"].includes(raw.secondRoundChoiceId) ? raw.secondRoundChoiceId : null,
      queuedAt: Number.isFinite(Number(raw.queuedAt)) ? Number(raw.queuedAt) : null,
      createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : null,
      injectionShown: raw.injectionShown === true,
      injectionShownAt: Number.isFinite(Number(raw.injectionShownAt)) ? Number(raw.injectionShownAt) : null,
      attemptCount: Math.max(0, Number(raw.attemptCount) | 0),
      lastAttemptAt: Number.isFinite(Number(raw.lastAttemptAt)) ? Number(raw.lastAttemptAt) : null,
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
    });
  }

'''

bridge_runtime = r'''  function getBridgeState() {
    if (!snapshot) return null;
    snapshot.realBattleBridge = sanitizeRealBattleBridge(snapshot.realBattleBridge);
    return snapshot.realBattleBridge;
  }

  function getBridgeBattleList() {
    const state = context && context.state
      ? context.state
      : (G.__S || G.State || null);
    return state && Array.isArray(state.battles) ? state.battles : [];
  }

  function findExistingRealBattle() {
    return getBridgeBattleList().find((battle) => battle
      && battle.meta
      && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID) || null;
  }

  function getRealBattleInjection() {
    const branchId = snapshot && snapshot.branchId;
    const choiceId = snapshot && snapshot.followUpChoiceId;
    const branch = branchId && REAL_BATTLE_INJECTIONS[branchId];
    return branch && branch[choiceId]
      ? branch[choiceId]
      : "Первый спор был разминкой. Теперь отвечай публично - аргументом.";
  }

  function adoptRealBattle(battle) {
    const bridge = getBridgeState();
    if (!bridge || !battle) return false;
    battle.meta = Object.assign({}, battle.meta || {}, {
      stage7OnboardingBridgeId: REAL_BATTLE_BRIDGE_ID,
      stage7BranchId: snapshot.branchId,
      stage7SecondRoundChoiceId: snapshot.followUpChoiceId,
    });
    bridge.status = "created";
    bridge.battleId = battle.id || battle.battleId || bridge.battleId;
    bridge.createdAt = bridge.createdAt || Date.now();
    bridge.lastFailureReason = null;
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_created", {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      battleId: bridge.battleId,
      branchId: snapshot.branchId,
      secondRoundChoiceId: snapshot.followUpChoiceId,
    });
    if (realBattleBridgeTimer) {
      clearTimeout(realBattleBridgeTimer);
      realBattleBridgeTimer = null;
    }
    if (context && context.UI) {
      const UI = context.UI;
      if (typeof UI.requestRenderAll === "function") UI.requestRenderAll();
      else if (typeof UI.renderAll === "function") UI.renderAll();
    }
    return true;
  }

  function attemptRealArgumentBattleBridge() {
    if (!snapshot || !snapshot.onboardingUnlocked) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.status !== "pending") return bridge && bridge.status === "created";

    const existing = findExistingRealBattle();
    if (existing) return adoptRealBattle(existing);

    releaseNormalWorldOnce();
    ensureScenarioPlayers();
    const state = context && context.state ? context.state : (G.__S || G.State || null);
    const rayhan = state && state.players ? state.players[REAL_BATTLE_OPPONENT_ID] : null;
    if (rayhan) rayhan.name = "Райхан";

    if (!bridge.injectionShown) {
      bridge.injectionShown = true;
      bridge.injectionShownAt = Date.now();
      saveSnapshot();
      pushLine({ name: "Райхан", text: getRealBattleInjection() });
      pushLine({ system: true, text: "Райхан перевёл спор в баттл. Выбери аргумент защиты." });
    }

    bridge.attemptCount += 1;
    bridge.lastAttemptAt = Date.now();
    saveSnapshot();

    const conflict = G.Conflict;
    if (!conflict || typeof conflict.incoming !== "function") {
      bridge.lastFailureReason = "conflict_api_not_ready";
      saveSnapshot();
      return false;
    }

    const result = conflict.incoming(REAL_BATTLE_OPPONENT_ID, {
      stage7OnboardingBridgeId: REAL_BATTLE_BRIDGE_ID,
      branchId: snapshot.branchId,
      secondRoundChoiceId: snapshot.followUpChoiceId,
    });
    const battle = result && result.ok === true
      ? (result.battle || getBridgeBattleList().find((item) => item && (item.id === result.battleId || item.battleId === result.battleId)) || null)
      : (result && (result.id || result.battleId) ? result : null);
    if (battle) return adoptRealBattle(battle);

    bridge.lastFailureReason = result && (result.reason || result.error)
      ? String(result.reason || result.error)
      : "incoming_failed";
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_retry", {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      attemptCount: bridge.attemptCount,
      reason: bridge.lastFailureReason,
    });
    return false;
  }

  function scheduleRealArgumentBattleBridge() {
    const bridge = getBridgeState();
    if (!bridge || bridge.status !== "pending" || realBattleBridgeTimer) return false;
    if (bridge.attemptCount >= REAL_BATTLE_MAX_ATTEMPTS) return false;
    realBattleBridgeTimer = setTimeout(() => {
      realBattleBridgeTimer = null;
      if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
    }, REAL_BATTLE_RETRY_MS);
    return true;
  }

'''

for path in [SOURCE, DOCS]:
    text = path.read_text(encoding="utf-8")
    text = replace_once(text, '  const ONBOARDING_FLOW_VERSION = 2;\n', '  const ONBOARDING_FLOW_VERSION = 3;\n', f"{path}: flow version")
    text = replace_once(text, '  let context = null;\n', bridge_constants + '  let context = null;\n', f"{path}: bridge constants")
    text = replace_once(text, '  let lastIntermissionSecond = null;\n', '  let lastIntermissionSecond = null;\n  let realBattleBridgeTimer = null;\n', f"{path}: bridge timer")
    text = replace_once(text, '  function defaultSnapshot() {\n', bridge_state_helpers + '  function defaultSnapshot() {\n', f"{path}: bridge state helpers")
    text = replace_once(text, '      npcMemory: {},\n      evidence: defaultEvidence(),\n', '      npcMemory: {},\n      realBattleBridge: defaultRealBattleBridge(),\n      evidence: defaultEvidence(),\n', f"{path}: default bridge state")
    text = replace_once(text, '      npcMemory: raw.npcMemory && typeof raw.npcMemory === "object" ? raw.npcMemory : {},\n      evidence: sanitizeEvidence(raw.evidence),\n', '      npcMemory: raw.npcMemory && typeof raw.npcMemory === "object" ? raw.npcMemory : {},\n      realBattleBridge: sanitizeRealBattleBridge(raw.realBattleBridge),\n      evidence: sanitizeEvidence(raw.evidence),\n', f"{path}: sanitize bridge state")
    text = replace_once(text, '  function releaseNormalWorldOnce() {\n', bridge_runtime + '  function releaseNormalWorldOnce() {\n', f"{path}: bridge runtime")
    text = replace_once(
        text,
        '''    if (snapshot.onboardingUnlocked) {\n      setControlledMode(false);\n      panel.remove();\n      return;\n    }\n''',
        '''    if (snapshot.onboardingUnlocked) {\n      setControlledMode(false);\n      panel.remove();\n      const bridge = getBridgeState();\n      if (bridge && bridge.status === "pending") {\n        releaseNormalWorldOnce();\n        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();\n      }\n      return;\n    }\n''',
        f"{path}: render bridge",
    )
    text = replace_once(
        text,
        '''    snapshot.onboardingUnlocked = true;\n    snapshot.unlockedAt = Date.now();\n    snapshot.stateId = "main_unlocked";\n''',
        '''    snapshot.onboardingUnlocked = true;\n    snapshot.unlockedAt = Date.now();\n    snapshot.stateId = "main_unlocked";\n    snapshot.realBattleBridge = Object.assign(defaultRealBattleBridge(), {\n      status: "pending",\n      branchId: snapshot.branchId,\n      secondRoundChoiceId: snapshot.followUpChoiceId,\n      queuedAt: Date.now(),\n    });\n''',
        f"{path}: queue bridge",
    )
    text = replace_once(
        text,
        '''    releaseNormalWorldOnce();\n    return true;\n  }\n\n  function runAction''',
        '''    releaseNormalWorldOnce();\n    if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();\n    return true;\n  }\n\n  function runAction''',
        f"{path}: start bridge after questions",
    )
    text = replace_once(
        text,
        '''    if (existing && existing.onboardingUnlocked) {\n      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };\n    }\n    snapshot = existing || defaultSnapshot();\n''',
        '''    if (existing && existing.onboardingUnlocked) {\n      const bridge = sanitizeRealBattleBridge(existing.realBattleBridge);\n      if (bridge.status === "pending") {\n        snapshot = Object.assign(existing, { realBattleBridge: bridge });\n        attach(nextContext);\n        releaseNormalWorldOnce();\n        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();\n        return { claimed: true, mode: "battle_bridge_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };\n      }\n      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };\n    }\n    snapshot = existing || defaultSnapshot();\n''',
        f"{path}: fresh bridge resume",
    )
    text = replace_once(
        text,
        '''    if (existing && existing.onboardingUnlocked) {\n      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };\n    }\n    const migratedLegacySave = !existing;\n''',
        '''    if (existing && existing.onboardingUnlocked) {\n      const bridge = sanitizeRealBattleBridge(existing.realBattleBridge);\n      if (bridge.status === "pending") {\n        snapshot = Object.assign(existing, { realBattleBridge: bridge });\n        attach(nextContext);\n        releaseNormalWorldOnce();\n        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();\n        return { claimed: true, mode: "battle_bridge_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };\n      }\n      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };\n    }\n    const migratedLegacySave = !existing;\n''',
        f"{path}: resume bridge recovery",
    )
    text = replace_once(
        text,
        '''    if (scheduler) clearInterval(scheduler);\n    if (voteTimer) clearTimeout(voteTimer);\n    scheduler = null;\n    voteTimer = null;\n''',
        '''    if (scheduler) clearInterval(scheduler);\n    if (voteTimer) clearTimeout(voteTimer);\n    if (realBattleBridgeTimer) clearTimeout(realBattleBridgeTimer);\n    scheduler = null;\n    voteTimer = null;\n    realBattleBridgeTimer = null;\n''',
        f"{path}: destroy bridge timer",
    )
    text = replace_once(
        text,
        '''  G.__DEV.answerStage7CurrentQuestionCorrect = answerCurrentQuestionCorrectForDev;\n  G.__DEV.getStage7IntermissionNpcIds = () => INTERMISSION_NPCS.map((npc) => npc.id);\n''',
        '''  G.__DEV.answerStage7CurrentQuestionCorrect = answerCurrentQuestionCorrectForDev;\n  G.__DEV.runStage7RealArgumentBattleBridge = attemptRealArgumentBattleBridge;\n  G.__DEV.getStage7IntermissionNpcIds = () => INTERMISSION_NPCS.map((npc) => npc.id);\n''',
        f"{path}: dev bridge hook",
    )
    text = replace_once(text, '    stage: "7.7",\n', '    stage: "7.8",\n', f"{path}: smoke stage")
    text = replace_once(text, '    realArgumentBattleBridgePending: true,\n', '    realArgumentBattleBridgePending: false,\n    realArgumentBattleBridgeId: REAL_BATTLE_BRIDGE_ID,\n', f"{path}: smoke bridge status")
    path.write_text(text, encoding="utf-8")

for path in [SOURCE_INDEX, DOCS_INDEX]:
    text = path.read_text(encoding="utf-8")
    count = text.count("stage7_7_preunlock_corridor_20260805a")
    if count < 2:
        raise SystemExit(f"{path}: expected at least two Stage 7.7 cache tokens, found {count}")
    text = text.replace("stage7_7_preunlock_corridor_20260805a", "stage7_8_real_argument_battle_20260806a")
    path.write_text(text, encoding="utf-8")

text = TEST.read_text(encoding="utf-8")
text = replace_once(text, 'assert "const ONBOARDING_FLOW_VERSION = 2" in source\n', 'assert "const ONBOARDING_FLOW_VERSION = 3" in source\n', "test flow version")
text = replace_once(text, 'assert "realArgumentBattleBridgePending: true" in source\n', 'assert "realArgumentBattleBridgePending: false" in source\nassert "stage7_first_real_argument_battle_v1" in source\n', "test bridge smoke")
text = replace_once(text, 'assert "Game.Conflict.incoming" not in source, "real combat bridge belongs to the next atomic PR"\n', 'assert "conflict.incoming(REAL_BATTLE_OPPONENT_ID" in source\nassert "stage7OnboardingBridgeId" in source\n', "test bridge call")
text = replace_once(text, 'assert index.count("stage7_7_preunlock_corridor_20260805a") >= 2\n', 'assert index.count("stage7_8_real_argument_battle_20260806a") >= 2\n', "test cache token")
text = replace_once(
    text,
    '''let normalWorldStarts = 0;\nconst state = {\n''',
    '''let normalWorldStarts = 0;\nlet incomingCalls = 0;\nconst visibleLines = [];\nconst state = {\n''',
    "test counters",
)
text = replace_once(
    text,
    '''  ConflictEconomy: { transferPoints() { return { ok: true }; } },\n  UI: {},\n};\nconst UI = {\n  S: state,\n  pushSystem() {},\n  pushChat() {},\n''',
    '''  ConflictEconomy: { transferPoints() { return { ok: true }; } },\n  Conflict: {\n    incoming(opponentId) {\n      incomingCalls += 1;\n      const battle = {\n        id: `stage7_real_battle_${incomingCalls}`,\n        opponentId,\n        fromThem: true,\n        status: "pickDefense",\n        attack: { id: "canon_Y1_yn_test", text: "Ты опять уходишь от ответа?", type: "yn", _color: "y" },\n        meta: {},\n      };\n      state.battles.unshift(battle);\n      return { ok: true, battleId: battle.id, battle };\n    },\n  },\n  UI: {},\n};\nconst UI = {\n  S: state,\n  pushSystem(text) { visibleLines.push({ system: true, text }); },\n  pushChat(entry) { visibleLines.push(entry); },\n''',
    "test conflict stub",
)
text = replace_once(
    text,
    '''assert.strictEqual(snap.stateId, "main_unlocked");\nassert.strictEqual(normalWorldStarts, 1);\nconst report = dev.getStage7ObservedEvidenceReport();\n''',
    '''assert.strictEqual(snap.stateId, "main_unlocked");\nassert.strictEqual(normalWorldStarts, 1);\nassert.strictEqual(incomingCalls, 1);\nassert.strictEqual(snap.realBattleBridge.status, "created");\nassert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_1");\nassert.strictEqual(state.battles.length, 1);\nassert.strictEqual(state.battles[0].meta.stage7OnboardingBridgeId, "stage7_first_real_argument_battle_v1");\nassert.strictEqual(state.battles[0].meta.stage7BranchId, "deny");\nassert.strictEqual(state.battles[0].meta.stage7SecondRoundChoiceId, "primary");\nassert(visibleLines.some((line) => line && line.name === "Райхан"), "Rayhan injection missing");\nassert(visibleLines.some((line) => line && line.system === true && String(line.text).includes("баттл")), "battle transition line missing");\nconst report = dev.getStage7ObservedEvidenceReport();\n''',
    "test created bridge",
)
text = replace_once(
    text,
    '''Game.Stage7FirstExperience.destroy();\nconst resumed = Game.Stage7FirstExperience.claimResume(context);\nassert.strictEqual(resumed.claimed, false, "completed corridor replayed after refresh");\nassert.strictEqual(normalWorldStarts, 1);\n\nGame.__DEV.resetStage7FirstExperience();\n''',
    '''const storageKey = Array.from(storage.keys()).find((key) => String(key).includes("stage7-7-node"));\nassert(storageKey, "Stage 7 storage key missing");\nconst pendingRecovery = JSON.parse(storage.get(storageKey));\npendingRecovery.realBattleBridge.status = "pending";\npendingRecovery.realBattleBridge.battleId = null;\nstorage.set(storageKey, JSON.stringify(pendingRecovery));\nGame.Stage7FirstExperience.destroy();\nconst recovered = Game.Stage7FirstExperience.claimResume(context);\nassert.strictEqual(recovered.claimed, true, "pending real battle bridge was not recovered");\nsnap = dev.getStage7FirstExperienceSnapshot();\nassert.strictEqual(snap.realBattleBridge.status, "created");\nassert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_1");\nassert.strictEqual(incomingCalls, 1, "existing bridge battle was duplicated");\nGame.Stage7FirstExperience.destroy();\nconst resumed = Game.Stage7FirstExperience.claimResume(context);\nassert.strictEqual(resumed.claimed, false, "completed corridor replayed after bridge recovery");\nassert.strictEqual(incomingCalls, 1);\n\nGame.__DEV.resetStage7FirstExperience();\n''',
    "test bridge recovery",
)
text = replace_once(text, 'console.log("STAGE7_7_PREUNLOCK_CORRIDOR_DYNAMIC_OK");\n', 'console.log("STAGE7_8_REAL_ARGUMENT_BATTLE_DYNAMIC_OK");\n', "test dynamic marker")
text = replace_once(text, 'assert "STAGE7_7_PREUNLOCK_CORRIDOR_DYNAMIC_OK" in completed.stdout\n', 'assert "STAGE7_8_REAL_ARGUMENT_BATTLE_DYNAMIC_OK" in completed.stdout\n', "test dynamic assertion")
text = replace_once(text, 'print("STAGE7_7_PREUNLOCK_CORRIDOR_OK")\n', 'print("STAGE7_8_REAL_ARGUMENT_BATTLE_OK")\n', "test final marker")
TEST.write_text(text, encoding="utf-8")

print("STAGE7_8_REAL_ARGUMENT_BATTLE_PATCH_OK")
