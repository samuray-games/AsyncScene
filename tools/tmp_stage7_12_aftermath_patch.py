from pathlib import Path

CTRL = Path('AsyncScene/Web/ui/ui-stage7-first-experience.js')
CTRL_DOCS = Path('docs/ui/ui-stage7-first-experience.js')
INDEX = Path('AsyncScene/Web/index.html')
INDEX_DOCS = Path('docs/index.html')
OLD_CACHE = 'stage7_11_pay_branch_payoffs_20260806a'
NEW_CACHE = 'stage7_12_first_battle_aftermath_20260806a'


def read(path):
    return path.read_text(encoding='utf-8')


def write(path, text):
    path.write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


text = read(CTRL)

text = replace_once(
    text,
    '  const PAY_PAYOFF_ID = "stage7_pay_tactical_v1";\n  const REAL_BATTLE_INJECTIONS = {',
    '''  const PAY_PAYOFF_ID = "stage7_pay_tactical_v1";
  const FIRST_BATTLE_AFTERMATH_ID = "stage7_first_real_battle_aftermath_v1";
  const FIRST_BATTLE_AFTERMATH_TARGETS = Object.freeze({
    deny: "npc_stage7_mika",
    accuse_ken: "npc_stage7_ken",
    pay: "npc_bandit",
  });
  const FIRST_BATTLE_AFTERMATH_COPY = Object.freeze({
    deny: Object.freeze({
      npcName: "Настя",
      win: Object.freeze({
        title: "Настя запомнила исход",
        body: "Ты отбил обвинение Райхана в настоящем баттле. Настя теперь помнит, что твоя версия выдержала публичную проверку.",
      }),
      lose: Object.freeze({
        title: "Настя запомнила исход",
        body: "Ты проиграл публичный спор Райхану. Настя запомнила, что подготовленного ответа оказалось недостаточно.",
      }),
      interrupted: Object.freeze({
        title: "Настя считает спор незакрытым",
        body: "Баттл закончился без ясной победы. Настя запомнила, что обвинение так и не было окончательно проверено.",
      }),
    }),
    accuse_ken: Object.freeze({
      npcName: "Райхан",
      win: Object.freeze({
        title: "Райхан запомнил поражение",
        body: "Ты победил Райхана в публичном реванше. Он запомнил, что встречное обвинение выдержало настоящий спор.",
      }),
      lose: Object.freeze({
        title: "Райхан вернул инициативу",
        body: "Райхан выиграл публичный реванш. Он запомнил, что сумел снова навязать комнате свою версию.",
      }),
      interrupted: Object.freeze({
        title: "Райхан считает реванш незавершённым",
        body: "Баттл закончился без ясной победы. Райхан запомнил конфликт как незакрытый.",
      }),
    }),
    pay: Object.freeze({
      npcName: "Олег",
      win: Object.freeze({
        title: "Олег увидел предел давления",
        body: "Ты отбил давление в публичном споре. Олег запомнил, что оплата не стала признанием вины.",
      }),
      lose: Object.freeze({
        title: "Олег запомнил, что давление сработало",
        body: "Ты проиграл спор после оплаты. Олег решил, что этот способ давления можно использовать снова.",
      }),
      interrupted: Object.freeze({
        title: "Олег оставил давление в запасе",
        body: "Баттл закончился без ясной победы. Олег запомнил, что вопрос об оплате остался открытым.",
      }),
    }),
  });
  const REAL_BATTLE_INJECTIONS = {''',
    'aftermath constants',
)

text = replace_once(
    text,
    '      payPayoffMarkedFingerprint: null,\n      lastFailureReason: null,',
    '''      payPayoffMarkedFingerprint: null,
      aftermathStatus: "not_applicable",
      aftermathTargetNpcId: null,
      aftermathBranchId: null,
      aftermathSecondRoundChoiceId: null,
      aftermathOutcomeRaw: null,
      aftermathOutcomeKind: null,
      aftermathRecordedAt: null,
      aftermathAcknowledgedAt: null,
      aftermathApplyCount: 0,
      lastFailureReason: null,''',
    'default aftermath fields',
)

text = replace_once(
    text,
    '''      payPayoffMarkedFingerprint: typeof raw.payPayoffMarkedFingerprint === "string" && raw.payPayoffMarkedFingerprint
        ? raw.payPayoffMarkedFingerprint
        : null,
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,''',
    '''      payPayoffMarkedFingerprint: typeof raw.payPayoffMarkedFingerprint === "string" && raw.payPayoffMarkedFingerprint
        ? raw.payPayoffMarkedFingerprint
        : null,
      aftermathStatus: ["not_applicable", "pending", "acknowledged"].includes(raw.aftermathStatus)
        ? raw.aftermathStatus
        : "not_applicable",
      aftermathTargetNpcId: Object.values(FIRST_BATTLE_AFTERMATH_TARGETS).includes(raw.aftermathTargetNpcId)
        ? raw.aftermathTargetNpcId
        : null,
      aftermathBranchId: RESPONSE_IDS.includes(raw.aftermathBranchId) ? raw.aftermathBranchId : null,
      aftermathSecondRoundChoiceId: ["primary", "secondary"].includes(raw.aftermathSecondRoundChoiceId)
        ? raw.aftermathSecondRoundChoiceId
        : null,
      aftermathOutcomeRaw: typeof raw.aftermathOutcomeRaw === "string" && raw.aftermathOutcomeRaw
        ? raw.aftermathOutcomeRaw
        : null,
      aftermathOutcomeKind: ["win", "lose", "interrupted"].includes(raw.aftermathOutcomeKind)
        ? raw.aftermathOutcomeKind
        : null,
      aftermathRecordedAt: Number.isFinite(Number(raw.aftermathRecordedAt)) ? Number(raw.aftermathRecordedAt) : null,
      aftermathAcknowledgedAt: Number.isFinite(Number(raw.aftermathAcknowledgedAt)) ? Number(raw.aftermathAcknowledgedAt) : null,
      aftermathApplyCount: Math.max(0, Number(raw.aftermathApplyCount) | 0),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,''',
    'sanitize aftermath fields',
)

helpers = r'''
  function normalizeFirstBattleAftermathOutcome(rawOutcome) {
    const raw = String(rawOutcome || "").trim().toLowerCase();
    if (raw === "win") return "win";
    if (raw === "lose" || raw === "cop_penalty") return "lose";
    return "interrupted";
  }

  function getFirstBattleAftermathRecord() {
    const bridge = getBridgeState();
    if (!bridge || !["pending", "acknowledged"].includes(bridge.aftermathStatus)) return null;
    const branchId = RESPONSE_IDS.includes(bridge.aftermathBranchId)
      ? bridge.aftermathBranchId
      : bridge.branchId;
    const outcomeKind = ["win", "lose", "interrupted"].includes(bridge.aftermathOutcomeKind)
      ? bridge.aftermathOutcomeKind
      : normalizeFirstBattleAftermathOutcome(bridge.aftermathOutcomeRaw || bridge.outcome);
    const copyGroup = branchId ? FIRST_BATTLE_AFTERMATH_COPY[branchId] : null;
    const copy = copyGroup && copyGroup[outcomeKind] ? copyGroup[outcomeKind] : null;
    if (!branchId || !copyGroup || !copy) return null;
    return {
      aftermathId: FIRST_BATTLE_AFTERMATH_ID,
      status: bridge.aftermathStatus,
      targetNpcId: bridge.aftermathTargetNpcId || FIRST_BATTLE_AFTERMATH_TARGETS[branchId],
      npcName: copyGroup.npcName,
      branchId,
      secondRoundChoiceId: bridge.aftermathSecondRoundChoiceId,
      battleId: bridge.battleId,
      outcomeRaw: bridge.aftermathOutcomeRaw || bridge.outcome,
      outcomeKind,
      recordedAt: bridge.aftermathRecordedAt,
      acknowledgedAt: bridge.aftermathAcknowledgedAt,
      applyCount: bridge.aftermathApplyCount,
      title: copy.title,
      body: copy.body,
    };
  }

  function recordFirstBattleAftermath(battle) {
    const bridge = getBridgeState();
    if (!bridge || !battle || bridge.status !== "completed") return false;
    if (["pending", "acknowledged"].includes(bridge.aftermathStatus)) return false;
    const battleId = battle.id || battle.battleId || null;
    const exactBridgeBattle = !!(battleId
      && bridge.battleId === battleId
      && battle.meta
      && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID);
    if (!exactBridgeBattle) return false;
    const branchId = RESPONSE_IDS.includes(bridge.branchId) ? bridge.branchId : snapshot.branchId;
    const targetNpcId = branchId ? FIRST_BATTLE_AFTERMATH_TARGETS[branchId] : null;
    if (!branchId || !targetNpcId) return false;
    const outcomeRaw = typeof battle.result === "string" && battle.result
      ? battle.result
      : (bridge.outcome || "unknown");
    const outcomeKind = normalizeFirstBattleAftermathOutcome(outcomeRaw);
    const recordedAt = Date.now();
    bridge.aftermathStatus = "pending";
    bridge.aftermathTargetNpcId = targetNpcId;
    bridge.aftermathBranchId = branchId;
    bridge.aftermathSecondRoundChoiceId = bridge.secondRoundChoiceId || snapshot.followUpChoiceId || null;
    bridge.aftermathOutcomeRaw = outcomeRaw;
    bridge.aftermathOutcomeKind = outcomeKind;
    bridge.aftermathRecordedAt = recordedAt;
    bridge.aftermathAcknowledgedAt = null;
    bridge.aftermathApplyCount = Math.max(1, bridge.aftermathApplyCount + 1);

    const record = {
      aftermathId: FIRST_BATTLE_AFTERMATH_ID,
      status: "pending",
      targetNpcId,
      branchId,
      secondRoundChoiceId: bridge.aftermathSecondRoundChoiceId,
      battleId,
      outcomeRaw,
      outcomeKind,
      recordedAt,
      acknowledgedAt: null,
      applyCount: bridge.aftermathApplyCount,
    };
    snapshot.npcMemory[targetNpcId] = Object.assign({}, snapshot.npcMemory[targetNpcId] || {}, {
      firstRealBattleAftermath: record,
    });
    ensureScenarioPlayers();
    saveSnapshot();
    telemetry("first_experience.first_real_battle_aftermath_recorded", {
      aftermathId: FIRST_BATTLE_AFTERMATH_ID,
      targetNpcId,
      branchId,
      secondRoundChoiceId: bridge.aftermathSecondRoundChoiceId,
      battleId,
      outcomeRaw,
      outcomeKind,
      applyCount: bridge.aftermathApplyCount,
    });
    return true;
  }

  function renderFirstBattleAftermath(panel) {
    const record = getFirstBattleAftermathRecord();
    if (!panel || !record || record.status !== "pending") return false;
    panel.innerHTML = `
      <div class="stage7BranchFollowUp stage7FirstBattleAftermath" data-testid="stage7-first-battle-aftermath">
        <div class="stage7EvidenceBadge">После настоящего баттла</div>
        <h2>${record.title}</h2>
        <p>${record.body}</p>
        ${actionButton("Понятно", "acknowledge-first-battle-aftermath")}
        <div class="stage7Support">Игра уже открыта. Эта реакция не блокирует остальные действия.</div>
      </div>`;
    return true;
  }

  function acknowledgeFirstBattleAftermath() {
    const bridge = getBridgeState();
    if (!bridge || bridge.aftermathStatus !== "pending") return false;
    const targetNpcId = bridge.aftermathTargetNpcId;
    const memory = targetNpcId && snapshot.npcMemory ? snapshot.npcMemory[targetNpcId] : null;
    const record = memory && memory.firstRealBattleAftermath;
    const acknowledgedAt = Date.now();
    bridge.aftermathStatus = "acknowledged";
    bridge.aftermathAcknowledgedAt = acknowledgedAt;
    if (record && record.aftermathId === FIRST_BATTLE_AFTERMATH_ID) {
      record.status = "acknowledged";
      record.acknowledgedAt = acknowledgedAt;
    }
    ensureScenarioPlayers();
    saveSnapshot();
    telemetry("first_experience.first_real_battle_aftermath_acknowledged", {
      aftermathId: FIRST_BATTLE_AFTERMATH_ID,
      targetNpcId,
      branchId: bridge.aftermathBranchId,
      battleId: bridge.battleId,
      outcomeRaw: bridge.aftermathOutcomeRaw,
      outcomeKind: bridge.aftermathOutcomeKind,
      applyCount: bridge.aftermathApplyCount,
    });
    render();
    return true;
  }

'''
text = replace_once(text, '  function render() {', helpers + '  function render() {', 'aftermath helpers')

text = replace_once(
    text,
    '''    if (snapshot.onboardingUnlocked) {
      setControlledMode(false);
      panel.remove();
      const bridge = getBridgeState();
      if (bridge && bridge.status === "pending") {
        releaseNormalWorldOnce();
        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
      }
      return;
    }''',
    '''    if (snapshot.onboardingUnlocked) {
      setControlledMode(false);
      const bridge = getBridgeState();
      if (bridge && bridge.status === "pending") {
        panel.remove();
        releaseNormalWorldOnce();
        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
        return;
      }
      if (bridge && bridge.aftermathStatus === "pending") {
        releaseNormalWorldOnce({ preservePanel: true });
        panel.hidden = false;
        renderFirstBattleAftermath(panel);
        return;
      }
      panel.remove();
      releaseNormalWorldOnce();
      return;
    }''',
    'onboarding unlocked render',
)

text = replace_once(
    text,
    '''    const battle = findExistingRealBattle();
    if (!battle) return false;
    const completed = battle.resolved === true''',
    '''    const battle = getBridgeBattleList().find((item) => item && (
      (item.id === bridge.battleId || item.battleId === bridge.battleId)
      && item.meta
      && item.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID
    ));
    if (!battle) return false;
    const completed = battle.resolved === true''',
    'exact lifecycle battle',
)

text = replace_once(
    text,
    '''    saveSnapshot();
    telemetry("first_experience.real_argument_battle_completed", {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      battleId: bridge.battleId,
      outcome: bridge.outcome,
    });
    return true;
  }

  function getRealBattleInjection() {''',
    '''    recordFirstBattleAftermath(battle);
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_completed", {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      battleId: bridge.battleId,
      outcome: bridge.outcome,
    });
    render();
    return true;
  }

  function getRealBattleInjection() {''',
    'record aftermath on completion',
)

text = replace_once(
    text,
    '''  function releaseNormalWorldOnce() {
    setControlledMode(false);
    const panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel) panel.remove();''',
    '''  function releaseNormalWorldOnce(options) {
    setControlledMode(false);
    const preservePanel = !!(options && options.preservePanel === true);
    const panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel && !preservePanel) panel.remove();''',
    'preserve aftermath panel',
)

text = replace_once(
    text,
    '''    } else if (action === "answer-evidence-question" && snapshot.stateId === "questionnaire") {
      answerOnboardingQuestion(
        button && button.getAttribute("data-evidence-question"),
        button && button.getAttribute("data-evidence-answer")
      );
    }
  }''',
    '''    } else if (action === "answer-evidence-question" && snapshot.stateId === "questionnaire") {
      answerOnboardingQuestion(
        button && button.getAttribute("data-evidence-question"),
        button && button.getAttribute("data-evidence-answer")
      );
    } else if (action === "acknowledge-first-battle-aftermath" && snapshot.onboardingUnlocked) {
      acknowledgeFirstBattleAftermath();
    }
  }''',
    'aftermath action',
)

resume_block = '''      if (bridge.status === "pending") {
        bridge.attemptCount = 0;
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        releaseNormalWorldOnce();
        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
        return { claimed: true, mode: "battle_bridge_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
      }
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };'''
resume_replacement = '''      if (bridge.status === "pending") {
        bridge.attemptCount = 0;
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        releaseNormalWorldOnce();
        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
        return { claimed: true, mode: "battle_bridge_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
      }
      if (bridge.status === "completed" && bridge.aftermathStatus === "pending") {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        return {
          claimed: true,
          mode: "battle_aftermath_resume",
          stateId: snapshot.stateId,
          releaseNormalWorld: () => releaseNormalWorldOnce({ preservePanel: true }),
        };
      }
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };'''
count = text.count(resume_block)
if count != 2:
    raise SystemExit(f'resume blocks: expected two, found {count}')
text = text.replace(resume_block, resume_replacement)

text = replace_once(
    text,
    '''  function isPending() {
    const current = snapshot || loadSnapshot();
    return !!(current && !current.onboardingUnlocked);
  }''',
    '''  function isPending() {
    const current = snapshot || loadSnapshot();
    if (!current) return false;
    if (!current.onboardingUnlocked) return true;
    const bridge = sanitizeRealBattleBridge(current.realBattleBridge);
    return bridge.status === "completed" && bridge.aftermathStatus === "pending";
  }''',
    'pending aftermath claim',
)

text = replace_once(
    text,
    '''    usePayPressureAnalysis,
    resetForDev,''',
    '''    usePayPressureAnalysis,
    acknowledgeFirstBattleAftermath,
    getFirstBattleAftermathRecord,
    resetForDev,''',
    'public aftermath exports',
)

text = replace_once(
    text,
    '''  G.__DEV.syncStage7RealArgumentBattleLifecycle = syncRealArgumentBattleLifecycle;
  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;''',
    '''  G.__DEV.syncStage7RealArgumentBattleLifecycle = syncRealArgumentBattleLifecycle;
  G.__DEV.getStage7FirstBattleAftermath = getFirstBattleAftermathRecord;
  G.__DEV.acknowledgeStage7FirstBattleAftermath = acknowledgeFirstBattleAftermath;
  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;''',
    'dev aftermath exports',
)

text = replace_once(text, '    stage: "7.10",', '    stage: "7.12",', 'smoke stage')
text = replace_once(
    text,
    '''    accuseKenWitnessAutoReveal: true,
  });''',
    '''    accuseKenWitnessAutoReveal: true,
    firstBattleAftermathId: FIRST_BATTLE_AFTERMATH_ID,
    firstBattleAftermathPersisted: true,
    firstBattleAftermathNonBlocking: true,
    firstBattleAftermathExactlyOnce: true,
  });''',
    'smoke aftermath fields',
)

write(CTRL, text)
write(CTRL_DOCS, text)

for path in (INDEX, INDEX_DOCS):
    data = read(path)
    if data.count(OLD_CACHE) < 2:
        raise SystemExit(f'cache marker missing in {path}')
    write(path, data.replace(OLD_CACHE, NEW_CACHE))

current_tests = [
    Path('tools/test_stage7_7_preunlock_corridor.py'),
    Path('tools/test_stage7_9_deny_evidence_payoff.py'),
    Path('tools/test_stage7_10_accuse_ken_payoffs.py'),
    Path('tools/test_stage7_11_pay_branch_payoffs.py'),
    Path('tools/test_stage7_first_causal_vertical_slice.py'),
    Path('tools/test_stage7_observed_evidence_harness.py'),
]
for path in current_tests:
    data = read(path)
    if OLD_CACHE not in data:
        raise SystemExit(f'old cache marker missing in {path}')
    write(path, data.replace(OLD_CACHE, NEW_CACHE))

print('STAGE7_12_AFTERMATH_PATCH_OK')
