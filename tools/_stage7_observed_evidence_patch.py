#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS_A = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
JS_B = ROOT / "docs/ui/ui-stage7-first-experience.js"
CSS_A = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.css"
CSS_B = ROOT / "docs/ui/ui-stage7-first-experience.css"
INDEX_A = ROOT / "AsyncScene/Web/index.html"
INDEX_B = ROOT / "docs/index.html"
TEST_STAGE71 = ROOT / "tools/test_stage7_first_causal_vertical_slice.py"
TEST_STAGE72 = ROOT / "tools/test_stage7_observed_evidence_harness.py"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, got {count}")
    return text.replace(old, new, 1)


if JS_A.read_bytes() != JS_B.read_bytes():
    raise SystemExit("controller mirrors differ before patch")
if CSS_A.read_bytes() != CSS_B.read_bytes():
    raise SystemExit("style mirrors differ before patch")
if INDEX_A.read_bytes() != INDEX_B.read_bytes():
    raise SystemExit("index mirrors differ before patch")

js = JS_A.read_text(encoding="utf-8")

old_header = '''  const G = window.Game;
  const STORAGE_KEY = "AsyncScene_first_experience_v1";
  const SCENARIO_ID = "first_experience_personal_conflict_v1";
  const WORLD_ADVANCE_DELAY_MS = 45_000;
  const PRELUDE_MIN_GAP_MS = 800;
'''
new_header = '''  const G = window.Game;
  const TEST_MODE_PARAM = "stage7test";
  const TEST_RUN_PARAM = "stage7testrun";
  const SEARCH_PARAMS = typeof location !== "undefined" ? new URLSearchParams(location.search || "") : new URLSearchParams();
  const TEST_MODE = SEARCH_PARAMS.get(TEST_MODE_PARAM) === "1";
  const TEST_RUN_TOKEN = (SEARCH_PARAMS.get(TEST_RUN_PARAM) || "default")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40) || "default";
  const STORAGE_KEY_NORMAL = "AsyncScene_first_experience_v1";
  const STORAGE_KEY_TEST_PREFIX = "AsyncScene_first_experience_evidence_v1";
  const STORAGE_KEY = TEST_MODE ? `${STORAGE_KEY_TEST_PREFIX}:${TEST_RUN_TOKEN}` : STORAGE_KEY_NORMAL;
  const SCENARIO_ID = "first_experience_personal_conflict_v1";
  const WORLD_ADVANCE_DELAY_MS = 45_000;
  const PRELUDE_MIN_GAP_MS = 800;
  const FIRST_ACTION_TARGET_MS = 30_000;
  const COMPLETE_CYCLE_TARGET_MS = 180_000;
  const COMPREHENSION_PASS_MIN = 4;
'''
js = replace_once(js, old_header, new_header, "header")

old_clone = '''  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
  }

  function defaultSnapshot() {
'''
new_clone = '''  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
  }

  function defaultEvidence() {
    if (!TEST_MODE) return null;
    const startedAt = Date.now();
    return {
      schemaVersion: 1,
      enabled: true,
      runToken: TEST_RUN_TOKEN,
      sessionId: `stage7_evidence:${TEST_RUN_TOKEN}:${startedAt}`,
      startedAt,
      firstActionAt: null,
      firstActionMs: null,
      cycleCompletedAt: null,
      cycleMs: null,
      branchId: null,
      continuationPath: null,
      settlementAppliedCount: 0,
      worldAdvancePresentedCount: 0,
      worldAdvanceSettledCount: 0,
      questionnaireOpen: false,
      questionIndex: 0,
      answers: {},
      answersComplete: false,
      comprehensionScore: null,
      continuationInterest: null,
      reportReady: false,
      reportDismissed: false,
      completedAt: null,
      finalReport: null,
    };
  }

  function sanitizeEvidence(raw) {
    if (!TEST_MODE) return null;
    const base = defaultEvidence();
    if (!raw || typeof raw !== "object") return base;
    const answers = raw.answers && typeof raw.answers === "object" ? raw.answers : {};
    return Object.assign(base, raw, {
      schemaVersion: 1,
      enabled: true,
      runToken: TEST_RUN_TOKEN,
      sessionId: typeof raw.sessionId === "string" && raw.sessionId ? raw.sessionId : base.sessionId,
      startedAt: Number.isFinite(Number(raw.startedAt)) ? Number(raw.startedAt) : base.startedAt,
      firstActionAt: Number.isFinite(Number(raw.firstActionAt)) ? Number(raw.firstActionAt) : null,
      firstActionMs: Number.isFinite(Number(raw.firstActionMs)) ? Math.max(0, Number(raw.firstActionMs)) : null,
      cycleCompletedAt: Number.isFinite(Number(raw.cycleCompletedAt)) ? Number(raw.cycleCompletedAt) : null,
      cycleMs: Number.isFinite(Number(raw.cycleMs)) ? Math.max(0, Number(raw.cycleMs)) : null,
      branchId: RESPONSE_IDS.includes(raw.branchId) ? raw.branchId : null,
      continuationPath: ["foreground", "return"].includes(raw.continuationPath) ? raw.continuationPath : null,
      settlementAppliedCount: Math.max(0, Number(raw.settlementAppliedCount) | 0),
      worldAdvancePresentedCount: Math.max(0, Number(raw.worldAdvancePresentedCount) | 0),
      worldAdvanceSettledCount: Math.max(0, Number(raw.worldAdvanceSettledCount) | 0),
      questionnaireOpen: raw.questionnaireOpen === true,
      questionIndex: Math.max(0, Math.min(5, Number(raw.questionIndex) | 0)),
      answers,
      answersComplete: raw.answersComplete === true,
      comprehensionScore: Number.isFinite(Number(raw.comprehensionScore)) ? Number(raw.comprehensionScore) : null,
      continuationInterest: ["yes", "unsure", "no"].includes(raw.continuationInterest) ? raw.continuationInterest : null,
      reportReady: raw.reportReady === true,
      reportDismissed: raw.reportDismissed === true,
      completedAt: Number.isFinite(Number(raw.completedAt)) ? Number(raw.completedAt) : null,
      finalReport: raw.finalReport && typeof raw.finalReport === "object" ? raw.finalReport : null,
    });
  }

  function evidenceQuestions() {
    const branchId = snapshot && snapshot.branchId;
    const branch = branchId ? BRANCHES[branchId] : null;
    const reactionOptions = RESPONSE_IDS.map((id) => ({ id, label: BRANCHES[id].reaction }));
    const causeOptions = RESPONSE_IDS.map((id) => ({ id, label: BRANCHES[id].cause }));
    return [
      {
        id: "accusation",
        prompt: "В чём тебя обвинили?",
        correct: "theft",
        options: [
          { id: "theft", label: "В краже денег из общей кассы" },
          { id: "insult", label: "В оскорблении Кена" },
          { id: "vote", label: "В проигранном голосовании" },
        ],
      },
      {
        id: "action",
        prompt: "Как ты ответил?",
        correct: branchId,
        options: RESPONSE_IDS.map((id) => ({ id, label: BRANCHES[id].label })),
      },
      {
        id: "reaction",
        prompt: "Что произошло сразу после твоего ответа?",
        correct: branchId,
        options: reactionOptions,
      },
      {
        id: "resource",
        prompt: "Какой ресурс изменился из-за решения?",
        correct: branchId === "pay" ? "money" : "reputation",
        options: [
          { id: "reputation", label: "Репутация выросла на 2" },
          { id: "money", label: "Деньги уменьшились на 3" },
          { id: "none", label: "Ни деньги, ни репутация не изменились" },
        ],
      },
      {
        id: "cause",
        prompt: "Почему мир изменился позже?",
        correct: branchId,
        options: causeOptions,
      },
      {
        id: "interest",
        prompt: "Хочется узнать, что будет дальше?",
        correct: null,
        options: [
          { id: "yes", label: "Да" },
          { id: "unsure", label: "Пока не уверен" },
          { id: "no", label: "Нет" },
        ],
      },
    ].filter((question) => question.id === "interest" || branch);
  }

  function getObservedEvidenceReport() {
    const evidence = snapshot && snapshot.evidence;
    if (!TEST_MODE || !evidence) return null;
    const scoredQuestions = evidenceQuestions().filter((question) => question.correct !== null);
    const comprehensionScore = scoredQuestions.reduce(
      (score, question) => score + (evidence.answers[question.id] === question.correct ? 1 : 0),
      0
    );
    const firstActionPass = Number.isFinite(evidence.firstActionMs) && evidence.firstActionMs <= FIRST_ACTION_TARGET_MS;
    const cyclePass = Number.isFinite(evidence.cycleMs) && evidence.cycleMs <= COMPLETE_CYCLE_TARGET_MS;
    const comprehensionPass = comprehensionScore >= COMPREHENSION_PASS_MIN;
    const continuationPathPass = ["foreground", "return"].includes(evidence.continuationPath);
    const exactlyOncePass = evidence.settlementAppliedCount === 1
      && evidence.worldAdvancePresentedCount === 1
      && evidence.worldAdvanceSettledCount === 1;
    return {
      schemaVersion: 1,
      testMode: true,
      runToken: evidence.runToken,
      sessionId: evidence.sessionId,
      branchId: evidence.branchId,
      continuationPath: evidence.continuationPath,
      firstActionMs: evidence.firstActionMs,
      firstActionTargetMs: FIRST_ACTION_TARGET_MS,
      firstActionPass,
      cycleMs: evidence.cycleMs,
      cycleTargetMs: COMPLETE_CYCLE_TARGET_MS,
      cyclePass,
      comprehensionScore,
      comprehensionTotal: scoredQuestions.length,
      comprehensionPass,
      continuationInterest: evidence.continuationInterest,
      settlementAppliedCount: evidence.settlementAppliedCount,
      worldAdvancePresentedCount: evidence.worldAdvancePresentedCount,
      worldAdvanceSettledCount: evidence.worldAdvanceSettledCount,
      exactlyOncePass,
      continuationPathPass,
      answers: clone(evidence.answers),
      overallPass: firstActionPass && cyclePass && comprehensionPass && continuationPathPass && exactlyOncePass,
    };
  }

  function markEvidenceFirstAction() {
    const evidence = snapshot && snapshot.evidence;
    if (!TEST_MODE || !evidence || evidence.firstActionAt) return;
    evidence.firstActionAt = Date.now();
    evidence.firstActionMs = Math.max(0, evidence.firstActionAt - evidence.startedAt);
  }

  function markEvidenceWorldAdvancePresented(mode) {
    const evidence = snapshot && snapshot.evidence;
    if (!TEST_MODE || !evidence) return;
    evidence.continuationPath = mode === "return" ? "return" : "foreground";
    evidence.worldAdvancePresentedCount += 1;
  }

  function hasPendingEvidenceReport(value) {
    return !!(TEST_MODE && value && value.evidence && value.evidence.reportReady && !value.evidence.reportDismissed);
  }

  function defaultSnapshot() {
'''
js = replace_once(js, old_clone, new_clone, "evidence helpers")

js = replace_once(
    js,
    '''      npcMemory: {},
      telemetry: [],
''',
    '''      npcMemory: {},
      evidence: defaultEvidence(),
      telemetry: [],
''',
    "default snapshot evidence",
)

js = replace_once(
    js,
    '''      npcMemory: raw.npcMemory && typeof raw.npcMemory === "object" ? raw.npcMemory : {},
      telemetry: Array.isArray(raw.telemetry) ? raw.telemetry.slice(-80) : [],
''',
    '''      npcMemory: raw.npcMemory && typeof raw.npcMemory === "object" ? raw.npcMemory : {},
      evidence: sanitizeEvidence(raw.evidence),
      telemetry: Array.isArray(raw.telemetry) ? raw.telemetry.slice(-80) : [],
''',
    "sanitize evidence",
)

old_world_render = '''  function renderWorldAdvance(panel) {
    const branch = BRANCHES[snapshot.branchId];
    if (!branch) return;
    const header = snapshot.worldAdvancePresentationMode === "return" ? "Пока тебя не было..." : "События продолжились";
    panel.innerHTML = `
      <div class="stage7WorldAdvance">
        <h2>${header}</h2>
        <p><strong>${branch.change}</strong></p>
        <p>${branch.cause}</p>
        <p class="stage7DecisionHook">${branch.hook}</p>
        ${actionButton("Продолжить", "ack-world-advance")}
      </div>`;
  }

  function render() {
'''
new_world_render = '''  function renderWorldAdvance(panel) {
    const branch = BRANCHES[snapshot.branchId];
    if (!branch) return;
    const header = snapshot.worldAdvancePresentationMode === "return" ? "Пока тебя не было..." : "События продолжились";
    const nextAction = TEST_MODE
      ? actionButton("Ответить на 6 вопросов", "open-evidence-questionnaire")
      : actionButton("Продолжить", "ack-world-advance");
    panel.innerHTML = `
      <div class="stage7WorldAdvance">
        <h2>${header}</h2>
        <p><strong>${branch.change}</strong></p>
        <p>${branch.cause}</p>
        <p class="stage7DecisionHook">${branch.hook}</p>
        ${nextAction}
      </div>`;
  }

  function renderEvidenceQuestion(panel) {
    const evidence = snapshot && snapshot.evidence;
    const questions = evidenceQuestions();
    const question = evidence && questions[evidence.questionIndex];
    if (!evidence || !question) return;
    const options = question.options.map((option) => actionButton(
      option.label,
      "answer-evidence-question",
      `data-evidence-question="${question.id}" data-evidence-answer="${option.id}"`
    )).join("");
    panel.innerHTML = `
      <div class="stage7EvidenceQuestion" role="group" aria-labelledby="stage7EvidenceQuestionTitle">
        <div class="stage7EvidenceBadge">Тест Stage 7.2 · ${evidence.questionIndex + 1}/${questions.length}</div>
        <h2 id="stage7EvidenceQuestionTitle">${question.prompt}</h2>
        <div class="stage7EvidenceOptions">${options}</div>
      </div>`;
  }

  function renderEvidenceReport(panel) {
    const report = getObservedEvidenceReport();
    if (!report) return;
    const status = (pass) => `<span class="stage7EvidenceStatus ${pass ? "pass" : "fail"}">${pass ? "PASS" : "FAIL"}</span>`;
    const interestLabels = { yes: "Да", unsure: "Пока не уверен", no: "Нет" };
    panel.innerHTML = `
      <div class="stage7EvidenceReport" role="dialog" aria-modal="true" aria-labelledby="stage7EvidenceReportTitle">
        <div class="stage7EvidenceBadge">Тест Stage 7.2 завершён</div>
        <h2 id="stage7EvidenceReportTitle">Отчёт о первом цикле</h2>
        <div class="stage7EvidenceMetric"><span>Первое действие</span><strong>${Math.round(report.firstActionMs || 0)} мс ${status(report.firstActionPass)}</strong></div>
        <div class="stage7EvidenceMetric"><span>Полный цикл</span><strong>${Math.round(report.cycleMs || 0)} мс ${status(report.cyclePass)}</strong></div>
        <div class="stage7EvidenceMetric"><span>Понимание причин</span><strong>${report.comprehensionScore}/${report.comprehensionTotal} ${status(report.comprehensionPass)}</strong></div>
        <div class="stage7EvidenceMetric"><span>Продолжение</span><strong>${report.continuationPath || "нет"} ${status(report.continuationPathPass)}</strong></div>
        <div class="stage7EvidenceMetric"><span>Exactly once</span><strong>${report.settlementAppliedCount}/${report.worldAdvancePresentedCount}/${report.worldAdvanceSettledCount} ${status(report.exactlyOncePass)}</strong></div>
        <div class="stage7EvidenceMetric"><span>Хочется продолжения</span><strong>${interestLabels[report.continuationInterest] || "нет ответа"}</strong></div>
        <p class="stage7EvidenceOverall">Итог: ${status(report.overallPass)}</p>
        ${actionButton("Продолжить в мир", "finish-evidence-report")}
        <div class="stage7Support">Отчёт сохранён только в этом браузере. Ничего не отправляется в сеть.</div>
      </div>`;
  }

  function render() {
'''
js = replace_once(js, old_world_render, new_world_render, "evidence rendering")

js = replace_once(
    js,
    '''    const branch = snapshot.branchId ? BRANCHES[snapshot.branchId] : null;

    if (snapshot.worldAdvancePresented && !snapshot.worldAdvanceSettled) {
''',
    '''    const branch = snapshot.branchId ? BRANCHES[snapshot.branchId] : null;

    if (TEST_MODE && snapshot.evidence && snapshot.evidence.reportReady && !snapshot.evidence.reportDismissed) {
      panel.hidden = false;
      setControlledMode(true);
      renderEvidenceReport(panel);
      return;
    }

    if (TEST_MODE && snapshot.evidence && snapshot.evidence.questionnaireOpen && !snapshot.evidence.answersComplete) {
      panel.hidden = false;
      setControlledMode(true);
      renderEvidenceQuestion(panel);
      return;
    }

    if (snapshot.worldAdvancePresented && !snapshot.worldAdvanceSettled) {
''',
    "render evidence gates",
)

old_settlement_start = '''    const branchId = snapshot.branchId;
    const settlementId = snapshot.settlementId || `first_experience_settlement_v1:${branchId}`;
    snapshot.settlementId = settlementId;
'''
new_settlement_start = '''    const branchId = snapshot.branchId;
    const evidence = snapshot.evidence;
    const settlementBase = `first_experience_settlement_v1:${branchId}`;
    const settlementId = snapshot.settlementId || (TEST_MODE && evidence
      ? `${settlementBase}:${evidence.sessionId}`
      : settlementBase);
    snapshot.settlementId = settlementId;
'''
js = replace_once(js, old_settlement_start, new_settlement_start, "settlement id")

js = replace_once(
    js,
    '''    snapshot.settled = true;
    if (branchId === "accuse_ken") {
''',
    '''    snapshot.settled = true;
    if (TEST_MODE && evidence) evidence.settlementAppliedCount += 1;
    if (branchId === "accuse_ken") {
''',
    "settlement evidence count",
)

old_complete = '''    snapshot.stateId = "completed";
    snapshot.cycleCompletedAt = Date.now();
    snapshot.awaitingWorldAdvance = true;
    snapshot.worldAdvanceDueAt = snapshot.cycleCompletedAt + WORLD_ADVANCE_DELAY_MS;
    snapshot.worldAdvanceId = `first_experience_world_advance_v1:${snapshot.branchId}`;
'''
new_complete = '''    snapshot.stateId = "completed";
    snapshot.cycleCompletedAt = Date.now();
    if (TEST_MODE && snapshot.evidence) {
      snapshot.evidence.cycleCompletedAt = snapshot.cycleCompletedAt;
      snapshot.evidence.cycleMs = Math.max(0, snapshot.cycleCompletedAt - snapshot.evidence.startedAt);
      snapshot.evidence.branchId = snapshot.branchId;
    }
    snapshot.awaitingWorldAdvance = true;
    snapshot.worldAdvanceDueAt = snapshot.cycleCompletedAt + WORLD_ADVANCE_DELAY_MS;
    const worldAdvanceBase = `first_experience_world_advance_v1:${snapshot.branchId}`;
    snapshot.worldAdvanceId = TEST_MODE && snapshot.evidence
      ? `${worldAdvanceBase}:${snapshot.evidence.sessionId}`
      : worldAdvanceBase;
'''
js = replace_once(js, old_complete, new_complete, "cycle evidence")

js = replace_once(
    js,
    '''    snapshot.worldAdvancePresentationMode = mode === "return" ? "return" : "foreground";
    saveSnapshot();
''',
    '''    snapshot.worldAdvancePresentationMode = mode === "return" ? "return" : "foreground";
    markEvidenceWorldAdvancePresented(snapshot.worldAdvancePresentationMode);
    saveSnapshot();
''',
    "world advance presentation evidence",
)

old_ack = '''  function acknowledgeWorldAdvance() {
    if (!snapshot || snapshot.worldAdvanceSettled) return;
    hydrateBranchMemory();
    snapshot.awaitingWorldAdvance = false;
    snapshot.worldAdvanceSettled = true;
    snapshot.worldAdvancePresented = false;
    saveSnapshot();
    telemetry("first_experience.world_advance_settled", { worldAdvanceId: snapshot.worldAdvanceId });
    releaseNormalWorldOnce();
  }
'''
new_ack = '''  function acknowledgeWorldAdvance(options) {
    if (!snapshot || snapshot.worldAdvanceSettled) return false;
    const deferRelease = !!(options && options.deferRelease);
    hydrateBranchMemory();
    snapshot.awaitingWorldAdvance = false;
    snapshot.worldAdvanceSettled = true;
    snapshot.worldAdvancePresented = false;
    if (TEST_MODE && snapshot.evidence) {
      snapshot.evidence.worldAdvanceSettledCount += 1;
      if (deferRelease) {
        snapshot.evidence.reportReady = true;
        snapshot.evidence.completedAt = Date.now();
        snapshot.evidence.finalReport = getObservedEvidenceReport();
      }
    }
    saveSnapshot();
    telemetry("first_experience.world_advance_settled", { worldAdvanceId: snapshot.worldAdvanceId });
    if (deferRelease) {
      if (snapshot.evidence) snapshot.evidence.finalReport = getObservedEvidenceReport();
      saveSnapshot();
      render();
      return true;
    }
    releaseNormalWorldOnce();
    return true;
  }
'''
js = replace_once(js, old_ack, new_ack, "deferred world advance acknowledgement")

js = replace_once(
    js,
    '''    if (action === "open-answer" && snapshot.stateId === "accusation") {
      snapshot.stateId = "answer";
''',
    '''    if (action === "open-answer" && snapshot.stateId === "accusation") {
      markEvidenceFirstAction();
      snapshot.stateId = "answer";
''',
    "first action timing",
)

js = replace_once(
    js,
    '''      snapshot.branchId = branchId;
      snapshot.selectedAt = Date.now();
''',
    '''      snapshot.branchId = branchId;
      if (TEST_MODE && snapshot.evidence) snapshot.evidence.branchId = branchId;
      snapshot.selectedAt = Date.now();
''',
    "branch evidence",
)

old_action_tail = '''    } else if (action === "ack-world-advance" && snapshot.worldAdvancePresented) {
      acknowledgeWorldAdvance();
    }
  }
'''
new_action_tail = '''    } else if (action === "open-evidence-questionnaire" && TEST_MODE && snapshot.worldAdvancePresented) {
      snapshot.evidence.questionnaireOpen = true;
      snapshot.evidence.questionIndex = 0;
      saveSnapshot();
      telemetry("stage7_evidence.questionnaire_opened");
      render();
    } else if (action === "answer-evidence-question" && TEST_MODE && snapshot.evidence && snapshot.evidence.questionnaireOpen) {
      const questions = evidenceQuestions();
      const question = questions[snapshot.evidence.questionIndex];
      const questionId = button && button.getAttribute("data-evidence-question");
      const answerId = button && button.getAttribute("data-evidence-answer");
      if (!question || question.id !== questionId || !question.options.some((option) => option.id === answerId)) return;
      snapshot.evidence.answers[question.id] = answerId;
      if (question.id === "interest") snapshot.evidence.continuationInterest = answerId;
      snapshot.evidence.questionIndex += 1;
      if (snapshot.evidence.questionIndex >= questions.length) {
        snapshot.evidence.answersComplete = true;
        const report = getObservedEvidenceReport();
        snapshot.evidence.comprehensionScore = report ? report.comprehensionScore : null;
        saveSnapshot();
        telemetry("stage7_evidence.questionnaire_completed", {
          score: snapshot.evidence.comprehensionScore,
          interest: snapshot.evidence.continuationInterest,
        });
        acknowledgeWorldAdvance({ deferRelease: true });
      } else {
        saveSnapshot();
        render();
      }
    } else if (action === "finish-evidence-report" && TEST_MODE && snapshot.evidence && snapshot.evidence.reportReady) {
      snapshot.evidence.reportDismissed = true;
      saveSnapshot();
      telemetry("stage7_evidence.report_dismissed", { overallPass: !!(getObservedEvidenceReport() || {}).overallPass });
      releaseNormalWorldOnce();
    } else if (action === "ack-world-advance" && snapshot.worldAdvancePresented) {
      acknowledgeWorldAdvance();
    }
  }
'''
js = replace_once(js, old_action_tail, new_action_tail, "evidence actions")

js = replace_once(
    js,
    '''        const due = snapshot.stateId === "main_unlocked"
          && snapshot.awaitingWorldAdvance
          && !snapshot.worldAdvanceSettled
          && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
''',
    '''        const due = snapshot.stateId === "main_unlocked"
          && snapshot.awaitingWorldAdvance
          && !snapshot.worldAdvanceSettled
          && !snapshot.worldAdvancePresented
          && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
''',
    "visibility exactly-once guard",
)

js = replace_once(
    js,
    '''    if (existing && existing.worldAdvanceSettled) {
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    snapshot = existing || defaultSnapshot();
''',
    '''    if (existing && existing.worldAdvanceSettled && !hasPendingEvidenceReport(existing)) {
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    snapshot = existing || defaultSnapshot();
''',
    "fresh evidence report resume",
)

js = replace_once(
    js,
    '''    if (existing && existing.worldAdvanceSettled) {
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    const migratedLegacySave = !existing;
''',
    '''    if (existing && existing.worldAdvanceSettled && !hasPendingEvidenceReport(existing)) {
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    const migratedLegacySave = !existing;
''',
    "resume evidence report gate",
)

js = replace_once(
    js,
    '''    const dueOnReturn = snapshot.stateId === "main_unlocked"
      && snapshot.awaitingWorldAdvance
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (dueOnReturn) {
      snapshot.worldAdvancePresented = true;
      snapshot.worldAdvancePresentationMode = "return";
''',
    '''    const dueOnReturn = snapshot.stateId === "main_unlocked"
      && snapshot.awaitingWorldAdvance
      && !snapshot.worldAdvancePresented
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (dueOnReturn) {
      snapshot.worldAdvancePresented = true;
      snapshot.worldAdvancePresentationMode = "return";
      markEvidenceWorldAdvancePresented("return");
''',
    "return evidence presentation",
)

js = replace_once(
    js,
    '''    getSnapshot,
    resetForDev,
''',
    '''    getSnapshot,
    getObservedEvidenceReport,
    resetForDev,
''',
    "public evidence API",
)

js = replace_once(
    js,
    '''  G.__DEV.getStage7FirstExperienceSnapshot = getSnapshot;
  G.__DEV.resetStage7FirstExperience = resetForDev;
''',
    '''  G.__DEV.getStage7FirstExperienceSnapshot = getSnapshot;
  G.__DEV.getStage7ObservedEvidenceReport = getObservedEvidenceReport;
  G.__DEV.resetStage7FirstExperience = resetForDev;
''',
    "developer evidence API",
)

js = replace_once(
    js,
    '''    worldAdvanceDelayMs: WORLD_ADVANCE_DELAY_MS,
  });
})();
''',
    '''    worldAdvanceDelayMs: WORLD_ADVANCE_DELAY_MS,
  });
  G.__DEV.smokeStage7ObservedEvidenceHarness = () => ({
    ok: TEST_MODE && !!G.__DEV.getStage7ObservedEvidenceReport,
    testMode: TEST_MODE,
    runToken: TEST_RUN_TOKEN,
    storageKey: STORAGE_KEY,
    firstActionTargetMs: FIRST_ACTION_TARGET_MS,
    completeCycleTargetMs: COMPLETE_CYCLE_TARGET_MS,
    comprehensionPassMin: COMPREHENSION_PASS_MIN,
    networkTransmission: false,
  });
})();
''',
    "evidence smoke",
)

JS_A.write_text(js, encoding="utf-8")
JS_B.write_text(js, encoding="utf-8")

css = CSS_A.read_text(encoding="utf-8")
css_addition = '''

/* Stage 7.2 explicit observed-evidence test mode */
.stage7EvidenceBadge {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 5px 9px;
  border-radius: 999px;
  border: 1px solid var(--border, rgba(255,255,255,.16));
  font-size: 12px;
  font-weight: 700;
}
.stage7EvidenceOptions {
  display: grid;
  gap: 8px;
}
.stage7EvidenceOptions .stage7FirstExperienceAction {
  width: 100%;
  text-align: left;
  white-space: normal;
  line-height: 1.35;
}
.stage7EvidenceReport {
  display: grid;
  gap: 10px;
}
.stage7EvidenceMetric {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--border, rgba(255,255,255,.12));
}
.stage7EvidenceMetric strong { text-align: right; }
.stage7EvidenceStatus { font-size: 12px; font-weight: 800; }
.stage7EvidenceStatus.pass { opacity: 1; }
.stage7EvidenceStatus.fail { text-decoration: underline; }
.stage7EvidenceOverall { font-size: 18px; font-weight: 800; }
'''
if "Stage 7.2 explicit observed-evidence test mode" in css:
    raise SystemExit("Stage 7.2 CSS already present")
css += css_addition
CSS_A.write_text(css, encoding="utf-8")
CSS_B.write_text(css, encoding="utf-8")

index = INDEX_A.read_text(encoding="utf-8")
index = replace_once(
    index,
    "ui/ui-stage7-first-experience.css?v=stage7_first_causal_slice_20260805a",
    "ui/ui-stage7-first-experience.css?v=stage7_observed_evidence_20260805c",
    "CSS cache buster",
)
index = replace_once(
    index,
    "ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805b",
    "ui/ui-stage7-first-experience.js?v=stage7_observed_evidence_20260805c",
    "JS cache buster",
)
INDEX_A.write_text(index, encoding="utf-8")
INDEX_B.write_text(index, encoding="utf-8")

stage71 = TEST_STAGE71.read_text(encoding="utf-8")
stage71 = replace_once(
    stage71,
    "const STORAGE_KEY = \"AsyncScene_first_experience_v1\"",
    "const STORAGE_KEY_NORMAL = \"AsyncScene_first_experience_v1\"",
    "Stage 7.1 storage assertion",
)
stage71 = replace_once(
    stage71,
    "ui/ui-stage7-first-experience.css?v=stage7_first_causal_slice_20260805a",
    "ui/ui-stage7-first-experience.css?v=stage7_observed_evidence_20260805c",
    "Stage 7.1 CSS reference",
)
stage71 = replace_once(
    stage71,
    "ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805b",
    "ui/ui-stage7-first-experience.js?v=stage7_observed_evidence_20260805c",
    "Stage 7.1 JS reference",
)
TEST_STAGE71.write_text(stage71, encoding="utf-8")

TEST_STAGE72.write_text('''#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
JS_A = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
JS_B = ROOT / "docs/ui/ui-stage7-first-experience.js"
CSS_A = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.css"
CSS_B = ROOT / "docs/ui/ui-stage7-first-experience.css"
INDEX_A = ROOT / "AsyncScene/Web/index.html"
INDEX_B = ROOT / "docs/index.html"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(JS_A.read_bytes() == JS_B.read_bytes(), "Stage 7.2 JS mirrors differ")
require(CSS_A.read_bytes() == CSS_B.read_bytes(), "Stage 7.2 CSS mirrors differ")
require(INDEX_A.read_bytes() == INDEX_B.read_bytes(), "Stage 7.2 index mirrors differ")

js = JS_A.read_text(encoding="utf-8")
css = CSS_A.read_text(encoding="utf-8")
index = INDEX_A.read_text(encoding="utf-8")

for token in (
    'const TEST_MODE_PARAM = "stage7test"',
    'const TEST_RUN_PARAM = "stage7testrun"',
    'const STORAGE_KEY_NORMAL = "AsyncScene_first_experience_v1"',
    'const STORAGE_KEY_TEST_PREFIX = "AsyncScene_first_experience_evidence_v1"',
    'const FIRST_ACTION_TARGET_MS = 30_000',
    'const COMPLETE_CYCLE_TARGET_MS = 180_000',
    'const COMPREHENSION_PASS_MIN = 4',
    'getStage7ObservedEvidenceReport',
    'smokeStage7ObservedEvidenceHarness',
):
    require(token in js, f"missing Stage 7.2 contract token: {token}")

for question in (
    "В чём тебя обвинили?",
    "Как ты ответил?",
    "Что произошло сразу после твоего ответа?",
    "Какой ресурс изменился из-за решения?",
    "Почему мир изменился позже?",
    "Хочется узнать, что будет дальше?",
):
    require(question in js, f"missing evidence question: {question}")

require('settlementAppliedCount === 1' in js, "settlement exactly-once assertion missing")
require('worldAdvancePresentedCount === 1' in js, "presentation exactly-once assertion missing")
require('worldAdvanceSettledCount === 1' in js, "world settlement exactly-once assertion missing")
require('!snapshot.worldAdvancePresented' in js, "return presentation duplicate guard missing")
require('acknowledgeWorldAdvance({ deferRelease: true })' in js, "report-before-release gate missing")
require('networkTransmission: false' in js, "local-only evidence declaration missing")
for forbidden in ("fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"):
    require(forbidden not in js, f"network transmission primitive forbidden: {forbidden}")

require("Stage 7.2 explicit observed-evidence test mode" in css, "Stage 7.2 CSS missing")
require("stage7_observed_evidence_20260805c" in index, "Stage 7.2 cache buster missing")
require(index.count("stage7_observed_evidence_20260805c") == 2, "expected JS and CSS cache-buster references")
require(not re.search(r"\bS\.me\.points\s*=", js), "direct point mutation forbidden")
require(not re.search(r"\bS\.rep\s*=", js), "direct reputation mutation forbidden")

print("PASS_STAGE7_OBSERVED_EVIDENCE_HARNESS")
''', encoding="utf-8")

print("PASS_STAGE7_OBSERVED_EVIDENCE_PATCH")
