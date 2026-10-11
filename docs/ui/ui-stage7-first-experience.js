Warning: truncated output (original token count: 73733)
Total output lines: 6449

// Stage 7.1 deterministic first causal experience.
window.Game = window.Game || {};

(() => {
  const G = window.Game;
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
  const ONBOARDING_FLOW_VERSION = 3;
  const WORLD_ADVANCE_DELAY_MS = 45_000;
  const INTERMISSION_DELAY_MS = WORLD_ADVANCE_DELAY_MS;
  const PRELUDE_MIN_GAP_MS = 800;
  const FIRST_ACTION_TARGET_MS = 30_000;
  const COMPLETE_CYCLE_TARGET_MS = 180_000;
  const COMPREHENSION_PASS_MIN = 5;
  const STATES = ["accusation", "answer", "reaction", "vote", "consequence", "rematch", "intermission", "round_two", "round_two_result", "questionnaire", "main_unlocked"];
  const RESPONSE_IDS = ["deny", "accuse_ken", "pay"];
  const PRELUDE = [
    { id: "room_entered", at: 1000, name: "System", text: "Ты вошёл в комнату.", system: true },
    { id: "mika_missing_money", at: 3500, name: "Настя", text: "из общей кассы пропали деньги!!!", preserveText: true },
    { id: "oleg_context", at: 6500, name: "Олег", text: "пропажу заметили ещё до появления новичка!", preserveText: true },
    { id: "ken_hint", at: 9500, name: "Райхан", text: "новичок пришёл - и деньги исчезли, странное совпадение", preserveText: true },
    { id: "mika_brake", at: 12500, name: "Настя", text: "без доказательств никого не обвиняем!", preserveText: true },
    { id: "ken_accusation", at: 15000, name: "Райхан", text: "Это сделал ты!!! Деньги пропали после твоего появления!", preserveText: true },
  ];
  const BRANCHES = {
    deny: {
      id: "deny",
      label: "Отрицать",
      player: "Я ничего не крал.",
      reaction: "Райхан не показал доказательств. Остальные должны решить, кому верить.",
      result: "Большинство встало на твою сторону.",
      consequence: "Репутация выросла. Райхан потерял поддержку.",
      vote: [1, 0, 1, 1, 0],
      change: "Райхан убедил одного человека поддержать его.",
      cause: "После твоего отрицания он начал искать подтверждение своей версии.",
      hook: "Настя просит доказательство. Сначала ответить ей или поговорить с Олегом?",
    },
    accuse_ken: {
      id: "accuse_ken",
      label: "Обвинить Райхана",
      player: "Это Райхан пытается свалить кражу на меня.",
      reaction: "Теперь ты с Райханом обвиняете друг друга. Остальные должны решить, кому верить.",
      result: "Большинство встало на твою сторону.",
      consequence: "Репутация выросла. Конфликт обострился.",
      vote: [0, 1, 1, 0, 1],
      change: "Райхан объявил, что добьётся публичного реванша.",
      cause: "Твоё встречное обвинение превратило спор в личную борьбу.",
      hook: "Подготовить доказательства или попытаться лишить Райхана поддержки?",
    },
    pay: {
      id: "pay",
      label: "Заплатить",
      player: "Я возмещу пропажу, но кражу не признаю.",
      reaction: "Оплата вернёт деньги, но не докажет вину. Остальные должны решить, кому верить.",
      result: "Большинство решило, что обвинение не доказано.",
      consequence: "Деньги уменьшились. Репутация не пострадала.",
      vote: [1, 0, 0, 1, 1],
      change: "Олег рассказал другим, что на тебя можно давить.",
      cause: "Ты заплатил, чтобы закрыть ущерб, и он запомнил этот способ.",
      hook: "Объясниться с Настей или потребовать от Олега молчания?",
    },
  };

  const BRANCH_FOLLOW_UPS = {
    deny: {
      title: "Доказательство у тебя",
      prompt: "Настя ждёт доказательство. Что сделать сейчас?",
      primaryLabel: "Показать доказательство",
      secondaryLabel: "Оставить при себе",
      memoryTarget: "npc_stage7_mika",
      primaryMemory: { evidenceShared: 1 },
      secondaryMemory: { evidenceHeld: 1 },
      primaryReaction: {
        memoryKey: "evidenceShared",
        title: "Настя подтвердила доказательство",
        body: "Настя показала доказательство остальным. Райхан потерял возможность ссылаться только на подозрение.",
      },
      secondaryReaction: {
        memoryKey: "evidenceHeld",
        title: "Райхан использовал паузу",
        body: "Ты оставил доказательство при себе. Райхан сказал остальным, что подтверждения твоих слов никто не видел.",
      },
    },
    accuse_ken: {
      title: "Конфликт не закончился",
      prompt: "Райхан требует продолжения. Как поступить?",
      primaryLabel: "Принять реванш",
      secondaryLabel: "Потребовать свидетеля",
      memoryTarget: "npc_stage7_ken",
      primaryMemory: { publicRematchAccepted: 1 },
      secondaryMemory: { witnessRequested: 1 },
      primaryReaction: {
        memoryKey: "publicRematchAccepted",
        title: "Райхан объявил реванш",
        body: "Ты принял реванш. Райхан назначил публичный спор и начал собирать сторонников.",
      },
      secondaryReaction: {
        memoryKey: "witnessRequested",
        title: "Настя нашла свидетеля",
        body: "Ты потребовал свидетеля. Настя нашла человека, который видел начало конфликта, и Райхану придётся отвечать при нём.",
      },
    },
    pay: {
      title: "Оплата не закрыла вопрос",
      prompt: "Олег понял, что на тебя можно давить. Что сделать сейчас?",
      primaryLabel: "Потребовать расписку",
      secondaryLabel: "Оставить всё как есть",
      memoryTarget: "npc_bandit",
      primaryMemory: { receiptDemanded: 1 },
      secondaryMemory: { pressureIgnored: 1 },
      primaryReaction: {
        memoryKey: "receiptDemanded",
        title: "Олег подтвердил оплату",
        body: "Ты потребовал расписку. Олег подтвердил получение денег и больше не может выдать оплату за признание вины.",
      },
      secondaryReaction: {
        memoryKey: "pressureIgnored",
        title: "Олег усилил давление",
        body: "Ты оставил всё как есть. Олег рассказал другим, что подтверждения оплаты нет, и решил давить снова.",
      },
    },
  };

  const INTERMISSION_NPCS = [
    {
      id: "npc_stage7_ken",
      name: "Райхан",
      role: "хозяин магазина",
      lines: {
        deny: [
          "Я найду того, кто подтвердит мою версию. Второй раунд всё решит.",
          "Пока ты молчишь о доказательствах, подозрение работает на меня.",
        ],
        accuse_ken: [
          "Ты сделал это личным. Во втором раунде отвечать будем публично.",
          "Свидетель или нет, я соберу людей и потребую ответа.",
        ],
        pay: [
          "Заплатил - значит, было за что. Я эту версию не отпущу.",
          "Деньги вернулись, но вопрос о виновнике никуда не делся.",
        ],
      },
    },
    {
      id: "npc_stage7_mika",
      name: "Настя",
      role: "кассирша",
      lines: {
        deny: [
          "Если у тебя есть доказательство, реши, когда его показать.",
          "Во втором раунде одних слов уже будет мало.",
        ],
        accuse_ken: [
          "Встречное обвинение требует свидетеля, иначе спор зациклится.",
          "Я попробую восстановить, кто первым заметил пропажу.",
        ],
        pay: [
          "Оплата вернула деньги, но не объяснила, что случилось.",
          "Без расписки каждый истолкует твой платёж по-своему.",
        ],
      },
    },
    {
      id: "npc_bandit",
      name: "Олег",
      role: "покупатель",
      lines: {
        deny: [
          "Райхан уже ищет поддержку. Пауза играет на того, кто громче.",
          "До второго раунда ещё можно понять, кому выгоден этот шум.",
        ],
        accuse_ken: [
          "Публичный спор быстро собирает толпу. Потом факты тонут в голосах.",
          "Если требуешь свидетеля, назови его раньше Райхана.",
        ],
        pay: [
          "Без расписки люди будут трактовать оплату как захотят.",
          "Когда давление срабатывает один раз, его обычно повторяют.",
        ],
      },
    },
  ];

  const REAL_BATTLE_BRIDGE_ID = "stage7_first_real_argument_battle_v1";
  const REAL_BATTLE_OPPONENT_ID = "npc_stage7_ken";
  const REAL_BATTLE_RETRY_MS = 250;
  const REAL_BATTLE_MAX_ATTEMPTS = 40;
  const DENY_EVIDENCE_PAYOFF_ID = "stage7_deny_evidence_reveal_v1";
  const ACCUSE_KEN_PAYOFF_ID = "stage7_accuse_ken_tactical_v1";
  const PAY_PAYOFF_ID = "stage7_pay_tactical_v1";
  const FIRST_BATTLE_AFTERMATH_ID = "stage7_first_real_battle_aftermath_v1";
  const FIRST_BATTLE_AFTERMATH_DM_ID = "stage7_first_real_battle_dm_followup_v1";
  const FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID = "stage7_first_real_battle_dm_contact_v1";
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
        body: "Ты победил Райхана в публичном реванше. Теперь ему придётся считаться с твоей версией.",
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

  let context = null;
  let snapshot = null;
  let scheduler = null;
  let lastTickAt = 0;
  let nextPreludeEligibleAt = 0;
  let voteTimer = null;
  let interactionLock = false;
  let normalWorldReleased = false;
  let visibilityBound = false;
  let lastIntermissionSecond = null;
  let realBattleBridgeTimer = null;
  let realBattleBridgeInFlight = false;
  let productionStateId = null;

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
  }

  function defaultEvidence() {
    const startedAt = Date.now();
    return {
      schemaVersion: 2,
      enabled: TEST_MODE,
      runToken: TEST_RUN_TOKEN,
      sessionId: `stage7_evidence:${TEST_RUN_TOKEN}:${startedAt}`,
      startedAt,
      firstActionAt: null,
      firstActionMs: null,
      cycleCompletedAt: null,
      cycleMs: null,
      branchId: null,
      continuationPath: null,
      continuationStateValid: null,
      presentedBranchId: null,
      presentedWorldAdvanceId: null,
      settlementAppliedCount: 0,
      worldAdvancePresentedCount: 0,
      worldAdvanceSettledCount: 0,
      questionnaireOpen: false,
      questionIndex: 0,
      answers: {},
      answersComplete: false,
      comprehensionScore: null,
      reportReady: false,
      reportDismissed: true,
      completedAt: null,
      finalReport: null,
    };
  }

  function sanitizeEvidence(raw) {
    const base = defaultEvidence();
    if (!raw || typeof raw !== "object") return base;
    const answers = raw.answers && typeof raw.answers === "object" ? raw.answers : {};
    return Object.assign(base, raw, {
      schemaVersion: 2,
      enabled: TEST_MODE,
      runToken: TEST_RUN_TOKEN,
      sessionId: typeof raw.sessionId === "string" && raw.sessionId ? raw.sessionId : base.sessionId,
      startedAt: Number.isFinite(Number(raw.startedAt)) ? Number(raw.startedAt) : base.startedAt,
      firstActionAt: Number.isFinite(Number(raw.firstActionAt)) ? Number(raw.firstActionAt) : null,
      firstActionMs: Number.isFinite(Number(raw.firstActionMs)) ? Math.max(0, Number(raw.firstActionMs)) : null,
      cycleCompletedAt: Number.isFinite(Number(raw.cycleCompletedAt)) ? Number(raw.cycleCompletedAt) : null,
      cycleMs: Number.isFinite(Number(raw.cycleMs)) ? Math.max(0, Number(raw.cycleMs)) : null,
      branchId: RESPONSE_IDS.includes(raw.branchId) ? raw.branchId : null,
      continuationPath: ["foreground", "return"].includes(raw.continuationPath) ? raw.continuationPath : null,
      continuationStateValid: raw.continuationStateValid === true,
      presentedBranchId: RESPONSE_IDS.includes(raw.presentedBranchId) ? raw.presentedBranchId : null,
      presentedWorldAdvanceId: typeof raw.presentedWorldAdvanceId === "string" && raw.presentedWorldAdvanceId ? raw.presentedWorldAdvanceId : null,
      settlementAppliedCount: Math.max(0, Number(raw.settlementAppliedCount) | 0),
      worldAdvancePresentedCount: Math.max(0, Number(raw.worldAdvancePresentedCount) | 0),
      worldAdvanceSettledCount: Math.max(0, Number(raw.worldAdvanceSettledCount) | 0),
      questionnaireOpen: raw.questionnaireOpen === true,
      questionIndex: Math.max(0, Math.min(5, Number(raw.questionIndex) | 0)),
      answers,
      answersComplete: raw.answersComplete === true,
      comprehensionScore: Number.isFinite(Number(raw.comprehensionScore)) ? Number(raw.comprehensionScore) : null,
      reportReady: raw.reportReady === true,
      reportDismissed: raw.reportDismissed !== false,
      completedAt: Number.isFinite(Number(raw.completedAt)) ? Number(raw.completedAt) : null,
      finalReport: raw.finalReport && typeof raw.finalReport === "object" ? raw.finalReport : null,
    });
  }

  function evidenceQuestions() {
    const branchId = snapshot && snapshot.branchId;
    const branch = branchId ? BRANCHES[branchId] : null;
    const offer = branchId ? BRANCH_FOLLOW_UPS[branchId] : null;
    if (!branch || !offer) return [];
    const reactionOptions = RESPONSE_IDS.map((id) => ({ id, label: BRANCHES[id].reaction }));
    const causeOptions = RESPONSE_IDS.map((id) => ({ id, label: BRANCHES[id].cause }));
    return [
      {
        id: "accusation",
        prompt: "В чём тебя обвинили?",
        correct: "theft",
        options: [
          { id: "theft", label: "В краже денег из общей кассы" },
          { id: "insult", label: "В оскорблении Райхана" },
          { id: "vote", label: "В проигранном голосовании" },
        ],
      },
      {
        id: "action",
        prompt: "Как ты ответил в первом раунде?",
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
        prompt: "Какой ресурс изменился после первого раунда?",
        correct: branchId === "pay" ? "money" : "reputation",
        options: [
          { id: "reputation", label: "Репутация выросла на 2" },
          { id: "money", label: "Деньги уменьшились на 3" },
          { id: "none", label: "Ни деньги, ни репутация не изменились" },
        ],
      },
      {
        id: "cause",
        prompt: "Почему начался второй раунд?",
        correct: branchId,
        options: causeOptions,
      },
      {
        id: "second_round",
        prompt: "Что ты решил во втором раунде?",
        correct: snapshot.followUpChoiceId,
        options: [
          { id: "primary", label: offer.primaryLabel },
          { id: "secondary", label: offer.secondaryLabel },
        ],
      },
    ];
  }

  function getObservedEvidenceReport() {
    const evidence = snapshot && snapshot.evidence;
    if (!TEST_MODE || !evidence) return null;
    const scoredQuestions = evidenceQuestions();
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
    const continuationStatePass = evidence.continuationStateValid === true
      && evidence.presentedBranchId === evidence.branchId
      && evidence.presentedWorldAdvanceId === snapshot.worldAdvanceId;
    return {
      schemaVersion: 2,
      testMode: true,
      runToken: evidence.runToken,
      sessionId: evidence.sessionId,
      branchId: evidence.branchId,
      secondRoundChoiceId: snapshot.followUpChoiceId,
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
      settlementAppliedCount: evidence.settlementAppliedCount,
      worldAdvancePresentedCount: evidence.worldAdvancePresentedCount,
      worldAdvanceSettledCount: evidence.worldAdvanceSettledCount,
      exactlyOncePass,
      continuationPathPass,
      continuationStatePass,
      continuationStateValid: evidence.continuationStateValid,
      presentedBranchId: evidence.presentedBranchId,
      presentedWorldAdvanceId: evidence.presentedWorldAdvanceId,
      answers: clone(evidence.answers),
      onboardingUnlocked: snapshot.onboardingUnlocked === true,
      overallPass: firstActionPass && cyclePass && comprehensionPass && continuationPathPass && continuationStatePass && exactlyOncePass,
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
    evidence.presentedBranchId = snapshot.branchId;
    evidence.presentedWorldAdvanceId = snapshot.worldAdvanceId;
    evidence.continuationStateValid = evidence.branchId === snapshot.branchId
      && evidence.presentedWorldAdvanceId === snapshot.worldAdvanceId;
    evidence.worldAdvancePresentedCount += 1;
  }

  function hasPendingEvidenceReport() {
    return false;
  }

  function sanitizeDefenseChoice(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = typeof raw.id === "string" && raw.id.startsWith("canon_") ? raw.id : null;
    const text = typeof raw.text === "string" && raw.text.trim() ? raw.text : null;
    if (!id || !text) return null;
    const type = typeof raw.type === "string" && raw.type ? raw.type : null;
    const group = typeof raw.group === "string" && raw.group ? raw.group : type;
    return {
      id,
      color: ["y", "o", "r", "k"].includes(raw.color) ? raw.color : null,
      group,
      type: type || group,
      text,
      displayText: typeof raw.displayText === "string" && raw.displayText ? raw.displayText : text,
      _canonA: typeof raw._canonA === "string" && raw._canonA ? raw._canonA : null,
      _canonAId: typeof raw._canonAId === "string" && raw._canonAId ? raw._canonAId : null,
      _canonTextIndex: Number.isFinite(Number(raw._canonTextIndex)) ? Number(raw._canonTextIndex) : null,
      _sub: typeof raw._sub === "string" && raw._sub ? raw._sub : null,
    };
  }

  function defenseChoiceFingerprint(raw) {
    const choice = sanitizeDefenseChoice(raw);
    if (!choice) return null;
    if (choice._canonAId) return `canon:${choice._canonAId}`;
    return [choice.group || choice.type || "", choice.color || "", choice.text].join("|");
  }

  function sanitizeDefenseChoices(raw) {
    const out = [];
    const seenIds = new Set();
    (Array.isArray(raw) ? raw : []).forEach((item) => {
      const choice = sanitizeDefenseChoice(item);
      if (!choice || seenIds.has(choice.id)) return;
      seenIds.add(choice.id);
      out.push(choice);
    });
    return out.slice(0, 12);
  }

  function defaultRealBattleBridge() {
    return {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      status: "not_started",
      battleId: null,
      branchId: null,
      secondRoundChoiceId: null,
      queuedAt: null,
      createdAt: null,
      completedAt: null,
      outcome: null,
      injectionShown: false,
      injectionShownAt: null,
      attemptCount: 0,
      lastAttemptAt: null,
      evidencePayoffMode: null,
      evidencePayoffStatus: "not_applicable",
      evidencePayoffRevealedAt: null,
      evidencePayoffRevealCount: 0,
      accusePayoffMode: null,
      accusePayoffStatus: "not_applicable",
      accusePayoffAppliedAt: null,
      accusePayoffApplyCount: 0,
      accusePayoffPreviousDefenseIds: [],
      accusePayoffDefenseIds: [],
      accusePayoffPreviousDefenseChoices: [],
      accusePayoffDefenseChoices: [],
      payPayoffMode: null,
      payPayoffStatus: "not_applicable",
      payPayoffAppliedAt: null,
      payPayoffApplyCount: 0,
      payPayoffDefenseChoices: [],
      payPayoffMarkedDefenseId: null,
      payPayoffMarkedFingerprint: null,
      aftermathStatus: "not_applicable",
      aftermathTargetNpcId: null,
      aftermathBranchId: null,
      aftermathSecondRoundChoiceId: null,
      aftermathOutcomeRaw: null,
      aftermathOutcomeKind: null,
      aftermathRecordedAt: null,
      aftermathAcknowledgedAt: null,
      aftermathApplyCount: 0,
      aftermathDmStatus: "not_applicable",
      aftermathDmLineId: null,
      aftermathDmDeliveredAt: null,
      aftermathDmDeliveryCount: 0,
      aftermathDmContactPromptDismissed: false,
      lastFailureReason: null,
    };
  }

  function sanitizeRealBattleBridge(raw) {
    const base = defaultRealBattleBridge();
    if (!raw || typeof raw !== "object") return base;
    return Object.assign(base, raw, {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      status: ["not_started", "pending", "created", "completed"].includes(raw.status) ? raw.status : "not_started",
      battleId: typeof raw.battleId === "string" && raw.battleId ? raw.battleId : null,
      branchId: RESPONSE_IDS.includes(raw.branchId) ? raw.branchId : null,
      secondRoundChoiceId: ["primary", "secondary"].includes(raw.secondRoundChoiceId) ? raw.secondRoundChoiceId : null,
      queuedAt: Number.isFinite(Number(raw.queuedAt)) ? Number(raw.queuedAt) : null,
      createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : null,
      completedAt: Number.isFinite(Number(raw.completedAt)) ? Number(raw.completedAt) : null,
      outcome: typeof raw.outcome === "string" && raw.outcome ? raw.outcome : null,
      injectionShown: raw.injectionShown === true,
      injectionShownAt: Number.isFinite(Number(raw.injectionShownAt)) ? Number(raw.injectionShownAt) : null,
      attemptCount: Math.max(0, Number(raw.attemptCount) | 0),
      lastAttemptAt: Number.isFinite(Number(raw.lastAttemptAt)) ? Number(raw.lastAttemptAt) : null,
      evidencePayoffMode: ["shared", "held"].includes(raw.evidencePayoffMode) ? raw.evidencePayoffMode : null,
      evidencePayoffStatus: ["not_applicable", "pending", "revealed", "expired"].includes(raw.evidencePayoffStatus)
        ? raw.evidencePayoffStatus
        : "not_applicable",
      evidencePayoffRevealedAt: Number.isFinite(Number(raw.evidencePayoffRevealedAt)) ? Number(raw.evidencePayoffRevealedAt) : null,
      evidencePayoffRevealCount: Math.max(0, Number(raw.evidencePayoffRevealCount) | 0),
      accusePayoffMode: ["public_rematch", "witness"].includes(raw.accusePayoffMode) ? raw.accusePayoffMode : null,
      accusePayoffStatus: ["not_applicable", "pending", "used", "revealed", "expired"].includes(raw.accusePayoffStatus)
        ? raw.accusePayoffStatus
        : "not_applicable",
      accusePayoffAppliedAt: Number.isFinite(Number(raw.accusePayoffAppliedAt)) ? Number(raw.accusePayoffAppliedAt) : null,
      accusePayoffApplyCount: Math.max(0, Number(raw.accusePayoffApplyCount) | 0),
      accusePayoffPreviousDefenseIds: Array.from(new Set(Array.isArray(raw.accusePayoffPreviousDefenseIds)
        ? raw.accusePayoffPreviousDefenseIds.map(String).filter(Boolean).slice(0, 6)
        : [])),
      accusePayoffDefenseIds: Array.from(new Set(Array.isArray(raw.accusePayoffDefenseIds)
        ? raw.accusePayoffDefenseIds.map(String).filter(Boolean).slice(0, 6)
        : [])),
      accusePayoffPreviousDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffPreviousDefenseChoices).slice(0, 3),
      accusePayoffDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffDefenseChoices).slice(0, 3),
      payPayoffMode: ["receipt", "pressure"].includes(raw.payPayoffMode) ? raw.payPayoffMode : null,
      payPayoffStatus: ["not_applicable", "pending", "marked", "used", "expired"].includes(raw.payPayoffStatus)
        ? raw.payPayoffStatus
        : "not_applicable",
      payPayoffAppliedAt: Number.isFinite(Number(raw.payPayoffAppliedAt)) ? Number(raw.payPayoffAppliedAt) : null,
      payPayoffApplyCount: Math.max(0, Number(raw.payPayoffApplyCount) | 0),
      payPayoffDefenseChoices: sanitizeDefenseChoices(raw.payPayoffDefenseChoices).slice(0, 3),
      payPayoffMarkedDefenseId: typeof raw.payPayoffMarkedDefenseId === "string" && raw.payPayoffMarkedDefenseId
        ? raw.payPayoffMarkedDefenseId
        : null,
      payPayoffMarkedFingerprint: typeof raw.payPayoffMarkedFingerprint === "string" && raw.payPayoffMarkedFingerprint
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
      aftermathDmContactPromptDismissed: raw.aftermathDmContactPromptDismissed === true,
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
    });
  }

  function defaultSnapshot() {
    return {
      schemaVersion: 2,
      onboardingFlowVersion: ONBOARDING_FLOW_VERSION,
      scenarioId: SCENARIO_ID,
      stateId: "accusation",
      preludeComplete: false,
      branchId: null,
      shownMessageIds: [],
      foregroundElapsedMs: 0,
      selectedAt: null,
      settlementId: null,
      settled: false,
      voteStep: 0,
      voteStarted: false,
      cycleCompletedAt: null,
      intermissionStartedAt: null,
      intermissionNpcVisits: {},
      intermissionNpcMessage: null,
      awaitingWorldAdvance: false,
      worldAdvanceDueAt: null,
      worldAdvanceId: null,
      worldAdvanceSettled: false,
      worldAdvancePresented: false,
      worldAdvancePresentationMode: null,
      branchFollowUpPending: false,
      followUpChoiceId: null,
      followUpSettled: false,
      roundTwoResultAcknowledged: false,
      onboardingUnlocked: false,
      unlockedAt: null,
      lastHiddenAt: null,
      npcMemory: {},
      realBattleBridge: defaultRealBattleBridge(),
      evidence: defaultEvidence(),
      telemetry: [],
      telemetrySeq: 0,
    };
  }

  function sanitize(raw) {
    const base = defaultSnapshot();
    if (!raw || typeof raw !== "object") return base;
    const inputStateId = STATES.includes(raw.stateId) ? raw.stateId : "accusation";
    const branchId = RESPONSE_IDS.includes(raw.branchId) ? raw.branchId : null;
    const shown = Array.from(new Set(Array.isArray(raw.shownMessageIds) ? raw.shownMessageIds.map(String) : []));
    const voteStep = Math.max(0, Math.min(5, Number(raw.voteStep) | 0));
    const hasCorridorContract = Number(raw.onboardingFlowVersion) >= ONBOARDING_FLOW_VERSION
      || Object.prototype.hasOwnProperty.call(raw, "intermissionStartedAt")
      || Object.prototype.hasOwnProperty.call(raw, "onboardingUnlocked");
    const legacyCompleted = !hasCorridorContract && raw.worldAdvanceSettled === true && raw.followUpSettled === true;
    let stateId = inputStateId;
    if (!hasCorridorContract && !legacyCompleted && (stateId === "completed" || stateId === "main_unlocked")) {
      stateId = raw.branchFollowUpPending === true && raw.followUpSettled !== true ? "round_two" : "intermission";
    }
    const normalized = Object.assign(base, raw, {
      schemaVersion: 2,
      onboardingFlowVersion: ONBOARDING_FLOW_VERSION,
      scenarioId: SCENARIO_ID,
      stateId,
      branchId,
      shownMessageIds: shown,
      foregroundElapsedMs: Math.max(0, Number(raw.foregroundElapsedMs) || 0),
      voteStep,
      preludeComplete: raw.preludeComplete === true || shown.includes("ken_accusation"),
      voteStarted: raw.voteStarted === true,
      settled: raw.settled === true && typeof raw.settlementId === "string" && raw.settlementId.length > 0,
      cycleCompletedAt: Number.isFinite(Number(raw.cycleCompletedAt)) ? Number(raw.cycleCompletedAt) : null,
      intermissionStartedAt: Number.isFinite(Number(raw.intermissionStartedAt)) ? Number(raw.intermissionStartedAt) : null,
      intermissionNpcVisits: raw.intermissionNpcVisits && typeof raw.intermissionNpcVisits === "object" ? raw.intermissionNpcVisits : {},
      intermissionNpcMessage: raw.intermissionNpcMessage && typeof raw.intermissionNpcMessage === "object" ? raw.intermissionNpcMessage : null,
      awaitingWorldAdvance: raw.awaitingWorldAdvance === true,
     …53733 tokens truncated… { ok: true, moneyEntry, repEntry, moneyWasAlreadySettled, repWasAlreadySettled };
  }

  function settleOlegEscapeRep(battle, attempt) {
    const escape = battle && battle.meta && battle.meta.stage715Escape;
    if (!escape) return { ok: false, reason: "escape_state_missing" };
    const actionId = String(escape.repActionId || `stage715_escape_${attempt}`);
    const repLog = G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : [];
    const priorTransfer = repLog.find((entry) => entry
      && String(entry.actionId || "") === actionId
      && String(entry.reason || "") === "rep_stage715_escape_bribe"
      && String(entry.battleId || "") === String(battle.id)
      && String(entry.sourceId || "") === "me"
      && String(entry.targetId || "") === "crowd_pool"
      && Number(entry.amount) === 1);
    if (priorTransfer) {
      escape.repSettled = true;
      escape.repActionId = actionId;
      delete escape.repSettlementFailureReason;
      return { ok: true, alreadySettled: true, ledgerEntry: priorTransfer };
    }
    escape.repSettled = false;
    const transferRep = G.__A && typeof G.__A.transferRep === "function" ? G.__A.transferRep : null;
    const settled = transferRep
      ? transferRep("me", "crowd_pool", 1, "rep_stage715_escape_bribe", battle.id, {
        actionId,
        context: "stage715_escape_bribe",
      })
      : { ok: false, reason: "transfer_rep_unavailable" };
    if (!settled || settled.ok !== true) {
      return {
        ok: false,
        reason: String(settled && settled.reason || "rep_transfer_failed"),
        available: settled && settled.available,
        requested: settled && settled.requested,
      };
    }
    escape.repSettled = true;
    escape.repActionId = actionId;
    delete escape.repSettlementFailureReason;
    return { ok: true, newlySettled: true };
  }

  function pushOlegEscapeDm(text, flag) {
    const state = stateFor();
    if (!state || !flag || state.flags && state.flags[flag] === true) return false;
    if (!G.__A || typeof G.__A.pushDm !== "function") return false;
    G.__A.pushDm(OLEG_DM_ID, "Олег", text, { isSystem: false, playerId: OLEG_DM_ID });
    state.flags = state.flags || {};
    state.flags[flag] = true;
    return true;
  }

  function pushOlegEscapeSystem(text, flag) {
    const state = stateFor();
    const UI = context && context.UI;
    if (!state || !UI || !flag || state.flags && state.flags[flag] === true) return false;
    if (typeof UI.pushSystem !== "function") return false;
    UI.pushSystem(text);
    state.flags = state.flags || {};
    state.flags[flag] = true;
    return true;
  }

  function settleOlegEscapeOutcome(battle) {
    if (!isOlegEscapeBattle(battle)) return false;
    const escape = battle.meta.stage715Escape || {};
    const recoveryOutcomePending = escape.status === "payment_recovery_required" && escape.outcomePending === true;
    if ((escape.status !== "voting" && !recoveryOutcomePending) || escape.outcomeHandled === true) return false;
    const state = stateFor();
    const attempt = escape.attempt | 0;
    const playerName = String(state && state.me && state.me.name || context && context.playerName || "игрок").trim() || "игрок";
    const succeeded = battle.resolved === true && battle.result === "escaped";
    if (!succeeded && battle.escapeVote) return false;
    const payment = ensureOlegEscapePayment(battle, attempt, { outcomePending: true });
    if (!payment || payment.ok !== true) {
      const reason = String(payment && payment.reason || "escape_payment_failed");
      escape.status = "payment_recovery_required";
      escape.outcomePending = true;
      escape.paymentRecovery = { missingResource: reason, requested: payment && payment.requested, available: payment && payment.available };
      battle.inlineNote = reason === "insufficient_rep"
        ? "Голоса уже завершены. Для завершения исхода нужен 1 REP. Получи REP и вернись к этой карточке."
        : reason === "insufficient_money"
          ? "Голоса уже завершены. Для завершения исхода нужна 1 монета. Получи её и вернись к этой карточке."
          : "Голоса уже завершены, но оплата не подтверждена. Исход сохранён и будет восстановлен после решения ошибки оплаты.";
      escape.repSettlementFailureReason = reason;
      persistOlegEscapeVoteProgress(battle.id);
      return false;
    }
    delete escape.repSettlementFailureReason;
    delete escape.paymentRecovery;
    delete escape.outcomePending;
    escape.outcomeHandled = true;
    if (succeeded) {
      escape.status = "success";
      battle.meta.stage715OlegEscapeCompleted = true;
      battle.meta.stage715OlegNoPostLossActions = true;
      battle.resultLine = OLEG_ESCAPE_SUCCESS_RESULT;
      pushOlegEscapeSystem(`У ${playerName} получилось уйти от Олега!`, "stage715OlegEscapeSuccessSystemShown");
      pushOlegEscapeDm(OLEG_ESCAPE_SUCCESS_DM_LINE, "stage715OlegEscapeSuccessDmSent");
      telemetry("stage715_escape_success");
      openNextScriptedFlow("escape_success");
    } else {
      escape.status = "failed";
      battle.inlineNote = "Не получилось уйти. Можно попробовать ещё раз.";
      pushOlegEscapeSystem(`У ${playerName} не получилось уйти от Олега!`, "stage715OlegEscapeFailedSystemShown");
      pushOlegEscapeDm(OLEG_ESCAPE_FAILED_DM_LINE, "stage715OlegEscapeFailedDmSent");
      telemetry("stage715_escape_failed");
      phase = "oleg_escape_ready";
      saveState();
    }
    // Core owns vote resolution; this controller owns the Stage 7.15 outcome.
    // Publish that outcome back to the persistence and render mirrors before
    // their next read so reload and the restored scripted card agree.
    persistOlegEscapeVoteProgress(battle.id);
    render();
    return true;
  }

  function watchOlegEscape() {
    if (escapeWatchTimer) return;
    escapeWatchTimer = setInterval(() => {
      const battle = stage715BattleById(OLEG_ESCAPE_BATTLE_ID);
      if (!battle || !isOlegEscapeBattle(battle)) {
        clearInterval(escapeWatchTimer);
        escapeWatchTimer = null;
        return;
      }
      if (battle.escapeVote && !battle.escapeVote.decided) {
        const Core = G._ConflictCore || G.ConflictCore;
        if (Core && typeof Core.resumeStage715OlegEscapeVote === "function") {
          Core.resumeStage715OlegEscapeVote(battle.id);
        }
      }
      settleOlegEscapeOutcome(battle);
      const escape = battle.meta && battle.meta.stage715Escape;
      if (escape && escape.outcomeHandled === true) {
        clearInterval(escapeWatchTimer);
        escapeWatchTimer = null;
      }
    }, 100);
  }

  function persistOlegEscapeVoteProgress(battleId) {
    const authoritative = G.__S && Array.isArray(G.__S.battles)
      ? G.__S.battles.find((entry) => entry && String(entry.id) === String(battleId)) : null;
    if (!authoritative || !isOlegEscapeBattle(authoritative)) return false;
    const persistenceState = stateFor();
    const stores = [persistenceState, G.UI && G.UI.S]
      .filter((store, index, all) => store && all.indexOf(store) === index);
    stores.forEach((store) => {
      store.battles = Array.isArray(store.battles) ? store.battles : [];
      let target = store.battles.find((entry) => entry
        && (String(entry.id) === String(battleId)
          || String(entry.meta && entry.meta.stage715BattleId || "") === OLEG_ESCAPE_BATTLE_ID));
      if (!target) {
        target = Object.assign({}, authoritative);
        store.battles.push(target);
      }
      if (target === authoritative) return;
      ["status", "result", "outcome", "note", "resultLine", "inlineNote", "resolved", "finished",
        "draw", "crowd", "attackHidden", "updatedAt", "_repEscapeClickApplied", "_repEscapeRefundApplied"].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(authoritative, key)) target[key] = authoritative[key];
        else delete target[key];
      });
      target.escapeVote = authoritative.escapeVote
        ? Object.assign({}, authoritative.escapeVote, {
          voters: Object.assign({}, authoritative.escapeVote.voters || {}),
          scriptedVoteSequence: Array.isArray(authoritative.escapeVote.scriptedVoteSequence)
            ? authoritative.escapeVote.scriptedVoteSequence.slice() : [],
          stage715VoteIntervals: Array.isArray(authoritative.escapeVote.stage715VoteIntervals)
            ? authoritative.escapeVote.stage715VoteIntervals.slice() : [],
        })
        : null;
      target._escapePrev = authoritative._escapePrev
        ? Object.assign({}, authoritative._escapePrev) : null;
      target.meta = Object.assign({}, target.meta || {}, authoritative.meta || {}, {
        stage715Escape: Object.assign({}, authoritative.meta.stage715Escape || {}),
      });
    });
    saveState();
    return true;
  }

  function startOlegEscape(battleId) {
    const state = stateFor();
    const battle = stage715BattleById(OLEG_ESCAPE_BATTLE_ID);
    if (!state || !battle || String(battle.id) !== String(battleId) || !isOlegEscapeBattle(battle)) return false;
    const previous = battle.meta.stage715Escape || {};
    if (previous.status === "voting" || previous.status === "success") return true;
    if (previous.status === "payment_recovery_required" && previous.outcomePending === true) {
      return settleOlegEscapeOutcome(battle);
    }
    const retryingPayment = previous.status === "starting" || previous.status === "payment_recovery_required";
    const attempt = retryingPayment && Number.isFinite(previous.attempt)
      ? previous.attempt | 0
      : Number.isFinite(previous.attempt) ? (previous.attempt | 0) + 1 : 1;
    const scriptedVotes = attempt === 1 ? { a: 2, b: 3 } : { a: 3, b: 2 };
    const scriptedVoteSequence = retryingPayment && Array.isArray(previous.scriptedVoteSequence)
      ? previous.scriptedVoteSequence.slice()
      : shuffleStage715VoteSides(["a", "a", "b", "b"]).concat(attempt === 1 ? "b" : "a");
    const mirroredBattles = [battle]
      .concat([G.__S, stateFor(), G.UI && G.UI.S].flatMap((store) => Array.isArray(store && store.battles) ? store.battles : []))
      .filter((entry, index, all) => entry
        && entry.meta
        && entry.meta.stage715BattleId === OLEG_ESCAPE_BATTLE_ID
        && all.indexOf(entry) === index);
    if (previous.status === "failed") {
      mirroredBattles.forEach((entry) => {
        entry.resolved = false;
        entry.finished = false;
        entry.status = "pickDefense";
        entry.result = null;
        entry.resultLine = null;
        entry.note = null;
        entry.inlineNote = null;
        entry.draw = false;
        entry.escapeVote = null;
        entry.attackHidden = true;
      });
    }
    const Core = G._ConflictCore || G.ConflictCore;
    if (!Core || typeof Core.escape !== "function") return false;
    const attemptMetadata = Object.assign({}, previous, {
      attempt, status: "starting", scriptedVoteSequence,
      repActionId: retryingPayment && previous.repActionId
        ? String(previous.repActionId) : `stage715_escape_${attempt}`,
    });
    mirroredBattles.forEach((entry) => {
      entry.meta = Object.assign({}, entry.meta || {}, { stage715Escape: attemptMetadata });
    });
    battle.inlineNote = null;
    persistOlegEscapeVoteProgress(battle.id);
    const payment = ensureOlegEscapePayment(battle, attempt);
    if (!payment || payment.ok !== true) {
      const reason = String(payment && payment.reason || "escape_payment_failed");
      const recoveryRequired = battle.meta.stage715Escape
        && battle.meta.stage715Escape.status === "payment_recovery_required";
      if (!recoveryRequired) {
        mirroredBattles.forEach((entry) => {
          entry.meta = Object.assign({}, entry.meta || {}, {
            stage715Escape: Object.assign({}, previous, { preflightFailureReason: reason }),
          });
          entry.inlineNote = reason === "insufficient_rep"
            ? "Не хватает 1 REP для побега. Получи REP и повтори действие."
            : reason === "insufficient_money"
              ? "Не хватает 1 монеты для побега. Получи монету и повтори действие."
              : "Оплату не удалось подтвердить. Голосование не началось; повтори действие после устранения причины.";
        });
      }
      persistOlegEscapeVoteProgress(battle.id);
      render();
      return false;
    }
    attemptMetadata.moneySettled = true;
    attemptMetadata.moneyActionId = `stage715_oleg_escape_${attempt}`;
    attemptMetadata.repSettled = true;
    mirroredBattles.forEach((entry) => {
      entry.meta = Object.assign({}, entry.meta || {}, { stage715Escape: attemptMetadata });
    });
    persistOlegEscapeVoteProgress(battle.id);
    const started = Core.escape(battle.id, { mode: "smyt", cost: 1 });
    if (!started || started.ok !== true) {
      mirroredBattles.forEach((entry) => {
        entry.meta = Object.assign({}, entry.meta || {}, { stage715Escape: Object.assign({}, attemptMetadata, {
          status: "payment_recovery_required", outcomePending: false,
          paymentRecovery: { missingStep: "core_escape_start", reason: String(started && started.reason || "core_escape_start_failed") },
        }) });
        entry.inlineNote = "Оплата сохранена, но голосование не стартовало. Повтори действие, чтобы продолжить эту же попытку без повторного списания.";
      });
      persistOlegEscapeVoteProgress(battle.id);
      return false;
    }
    const activeBattle = stage715BattleById(OLEG_ESCAPE_BATTLE_ID) || battle;
    if (!activeBattle.escapeVote) {
      mirroredBattles.forEach((entry) => {
        entry.meta = Object.assign({}, entry.meta || {}, { stage715Escape: Object.assign({}, attemptMetadata, {
          status: "payment_recovery_required", outcomePending: false,
          paymentRecovery: { missingStep: "core_escape_vote_state", reason: "core_escape_vote_state_missing" },
        }) });
        entry.inlineNote = "Оплата сохранена, но голосование не стартовало. Повтори действие, чтобы продолжить эту же попытку без повторного списания.";
      });
      persistOlegEscapeVoteProgress(battle.id);
      return false;
    }
    const escapeMetadata = {
      attempt,
      status: "voting",
      outcomeHandled: false,
      repSettled: true,
      repActionId: attemptMetadata.repActionId,
      moneySettled: true,
      moneyActionId: `stage715_oleg_escape_${attempt}`,
      scriptedVotes,
      scriptedVoteSequence,
    };
    const mirroredVoteBattles = [battle, activeBattle]
      .concat([G.__S, stateFor(), G.UI && G.UI.S].flatMap((store) => Array.isArray(store && store.battles) ? store.battles : []))
      .filter((entry, index, all) => entry
        && entry.meta
        && entry.meta.stage715BattleId === OLEG_ESCAPE_BATTLE_ID
        && all.indexOf(entry) === index);
    mirroredVoteBattles.forEach((entry) => {
      if (entry.escapeVote) {
        entry.escapeVote.scriptedVotes = scriptedVotes;
        entry.escapeVote.scriptedVoteSequence = scriptedVoteSequence.slice();
        entry.escapeVote.stage715ScriptedVoteIndex = Object.keys(entry.escapeVote.voters || {}).length;
        if (!Number.isFinite(entry.escapeVote.stage715NextVoteAtMs)) {
          const delay = nastyaEventVoteDelay();
          entry.escapeVote.stage715VoteIntervals = [delay];
          entry.escapeVote.stage715NextVoteAtMs = Date.now() + delay;
        }
        entry.escapeVote.cap = 5;
      }
      entry.meta = Object.assign({}, entry.meta || {}, { stage715Escape: Object.assign({}, previous, escapeMetadata) });
    });
    persistOlegEscapeVoteProgress(activeBattle.id);
    state.flags = state.flags || {};
    state.flags.stage715OlegEscapeAttempts = attempt;
    phase = "oleg_escape_vote";
    saveState();
    if (Core && typeof Core.resumeStage715OlegEscapeVote === "function") {
      Core.resumeStage715OlegEscapeVote(activeBattle.id);
    }
    telemetry("stage715_escape_started");
    watchOlegEscape();
    render();
    return true;
  }

  function openNextScriptedFlow(reason) {
    phase = "next_scripted_flow";
    const state = stateFor();
    if (state) {
      state.flags = state.flags || {};
      state.flags.stage715NextScriptedFlowReady = true;
      state.flags.stage715NextScriptedFlowReason = reason || "loss";
    }
    saveState();
    if (context && typeof context.openNextScriptedFlow === "function") {
      try { context.openNextScriptedFlow({ reason: reason || "loss" }); } catch (_) {}
    }
    render();
  }

  function revealNastyaBattle(battle, outcome, options = {}) {
    if (!battle || !battle.attack || outcome !== "win") return false;
    const state = stateFor();
    if (state) {
      state.flags = state.flags || {};
      state.flags.stage715NastyaWon = true;
    }
    const trueColor = battle.attack._color || battle.attack.color || "o";
    battle.attack.color = trueColor;
    battle.attackHidden = false;
    battle.revealColor = trueColor;
    battle.meta = Object.assign({}, battle.meta || {}, {
      stage715NastyaPayoff: {
        status: "revealed",
        color: trueColor,
        outcome: outcome || null,
      },
      stage715NastyaVote: { a: 3, b: 2, cap: 5 },
    });
    if (battle.meta.stage715NastyaRewardsApplied !== true) {
      const baseline = battle.meta.stage715NastyaRewardBaseline || { rep: currentPlayerStat(G.__S || state, "rep"), points: currentPlayerStat(G.__S || state, "points"), wins: currentPlayerStat(G.__S || state, "wins") };
      const authoritative = G.__S && G.__S.me ? G.__S : state;
      if (battle.meta.stage715NastyaWinApplied !== true) {
        const me = authoritative && authoritative.me;
        if (me) {
          me.wins = (Number(me.wins) | 0) + 1;
          const mirrors = [G.__S, G.UI && G.UI.S].filter((store, index, all) => store && store !== authoritative && all.indexOf(store) === index);
          mirrors.forEach((store) => {
            if (store.me) store.me.wins = me.wins;
            if (store.players && store.players.me) store.players.me.wins = me.wins;
          });
          if (authoritative.players && authoritative.players.me) authoritative.players.me.wins = me.wins;
          if (G.__A && typeof G.__A.emitStatDelta === "function") {
            G.__A.emitStatDelta("wins", 1, { reason: "stage715_nastya_win", battleId: battle.id || NASTYA_BATTLE_ID });
          }
          battle.meta.stage715NastyaWinApplied = true;
        }
      }
      const repDelta = currentPlayerStat(authoritative, "rep") - (Number(baseline.rep) | 0);
      const pointsDelta = currentPlayerStat(authoritative, "points") - (Number(baseline.points) | 0);
      const economy = G.ConflictEconomy || G._ConflictEconomy;
      if (pointsDelta < 2 && economy && typeof economy.transferPoints === "function") {
        economy.transferPoints("sink", "me", 2 - pointsDelta, "stage715_nastya_exact_reward", { battleId: NASTYA_BATTLE_ID, context: "stage715_nastya_win" });
      } else if (pointsDelta > 2 && economy && typeof economy.transferPoints === "function") {
        economy.transferPoints("me", "sink", pointsDelta - 2, "stage715_nastya_exact_reward_rebalance", { battleId: NASTYA_BATTLE_ID, context: "stage715_nastya_win" });
      }
      if (repDelta < 2 && G.__A && typeof G.__A.transferRep === "function") {
        G.__A.transferRep("crowd_pool", "me", 2 - repDelta, "rep_stage715_nastya_win", NASTYA_BATTLE_ID, { context: "stage715_nastya_win" });
      } else if (repDelta > 2 && G.__A && typeof G.__A.transferRep === "function") {
        G.__A.transferRep("me", "crowd_pool", repDelta - 2, "rep_stage715_nastya_win_rebalance", NASTYA_BATTLE_ID, { context: "stage715_nastya_win" });
      }
      battle.meta.stage715NastyaRewardsApplied = true;
      battle.meta.stage715NastyaReward = { rep: 2, money: 2, wins: 1 };
    }
    if (!options.skipMajority && battle.meta.stage715NastyaMajorityLineShown !== true) {
      if (context && context.UI && typeof context.UI.pushSystem === "function") context.UI.pushSystem("Тебя поддержало большинство.");
      else pushNpc({ name: "", system: true, text: "Тебя поддержало большинство." });
      battle.meta.stage715NastyaMajorityLineShown = true;
    }
    if (!options.skipExplanation && !battle.meta.stage715NastyaExplanationShown) {
      pushNpc({ speakerId: "npc_stage7_mika", name: "Настя", text: NASTYA_EXPLANATION });
      battle.meta.stage715NastyaExplanationShown = true;
    }
    telemetry("stage715_nastya_battle_result", {
      battleId: battle.id,
      outcome: outcome || null,
      color: trueColor,
      voteStarted: outcome === "draw",
    });
    ensureNastyaScriptedChatLine("stage715NastyaPostWinQuestionShown", NASTYA_POST_WIN_QUESTION);
    phase = "nastya_post_win_waiting_reply";
    saveState();
    render();
    return true;
  }

  function syncNastyaBattleOutcome() {
    const battle = stage715BattleById(NASTYA_BATTLE_ID);
    if (phase === "nastya_waiting_chat_reply") return true;
    const outcome = battleOutcome(battle);
    if (!battle || !outcome) return false;
    if (battle.meta && battle.meta.stage715NastyaPayoff && battle.meta.stage715NastyaPayoff.status === "revealed") return true;
    if (battle.meta && battle.meta.stage715NastyaResultRecorded === true) return true;
    if (outcome === "win") return revealNastyaBattle(battle, outcome);
    if (outcome === "draw") return true;
    battle.meta = Object.assign({}, battle.meta || {}, { stage715NastyaResultRecorded: true });
    telemetry("stage715_nastya_battle_result", { battleId: battle.id, outcome, nextFlow: "scripted" });
    openNextScriptedFlow("loss");
    openOlegDmAfterLoss();
    return true;
  }

  function settleNastyaAutomaticVictory() {
    const battle = stage715BattleById(NASTYA_BATTLE_ID);
    if (!battle || !battle.meta) return false;
    if (battle.meta.stage715NastyaAutomaticVictoryApplied === true
      && battle.meta.stage715NastyaPayoff && battle.meta.stage715NastyaPayoff.status === "revealed") return true;
    battle.meta.stage715NastyaAutomaticVictoryApplied = true;
    battle.meta.stage715NastyaRematchGate = false;
    battle.meta.stage715NastyaRematchDirectVoteAllowed = false;
    battle.meta.stage715NastyaChatReplyPending = false;
    battle.meta.stage715NastyaSurrenderWaitingReply = false;
    battle.meta.stage715NastyaPhase = "automatic_victory_settlement";
    battle.attackHidden = false;
    battle.attack = Object.assign({}, battle.attack || {}, { color: "o", _color: "o" });
    battle.status = battle.result = battle.outcome = "win";
    battle.resolved = battle.finished = true;
    battle.draw = false;
    battle.crowd = null;
    battle.meta.stage715NastyaRewardBaseline = {
      rep: currentPlayerStat(stateFor(), "rep"),
      points: currentPlayerStat(stateFor(), "points"),
      wins: currentPlayerStat(stateFor(), "wins"),
    };
    phase = "nastya_automatic_victory_settlement";
    const settled = revealNastyaBattle(battle, "win", { skipMajority: true, skipExplanation: true });
    if (settled) {
      battle.meta.stage715NastyaPhase = "post_win_waiting_reply";
      saveState();
    }
    return settled;
  }

  function removeResolvedNastyaBattle(battleId) {
    const stores = [stateFor(), G.__S, G.UI && G.UI.S, context && context.state]
      .filter((store, index, all) => store && all.indexOf(store) === index);
    const target = stores.flatMap((store) => Array.isArray(store.battles) ? store.battles : [])
      .find((battle) => battle && String(battle.id || battle.battleId || "") === String(battleId || "")
        && battle.meta && battle.meta.stage715NastyaBattle === true);
    if (!target) return false;
    const targetId = String(target.id || target.battleId || "");
    let removed = false;
    stores.forEach((store) => {
      if (!Array.isArray(store.battles)) return;
      const before = store.battles.length;
      store.battles = store.battles.filter((battle) => !battle
        || (String(battle.id || battle.battleId || "") !== targetId
          && !(battle.meta && battle.meta.stage715NastyaBattle === true
            && battle.meta.stage715BattleId === NASTYA_BATTLE_ID)));
      removed = removed || store.battles.length !== before;
    });
    if (removed) saveState();
    return removed;
  }

  function watchNastyaBattle() {
    if (battleWatchTimer) clearInterval(battleWatchTimer);
    battleWatchTimer = setInterval(() => {
      if (phase !== "nastya_battle" && phase !== "nastya_waiting_chat_reply"
        && phase !== "nastya_initial_wrong_waiting_rematch"
        && phase !== "nastya_rematch_available" && phase !== "nastya_rematch_paid"
        && phase !== "nastya_rematch_awaiting_answer" && phase !== "nastya_rematch_wrong"
        && phase !== "nastya_surrender_waiting_reply" && phase !== "nastya_automatic_victory_settlement"
        && phase !== "nastya_crowd_vote" && phase !== "nastya_post_win_waiting_reply"
        && phase !== "next_scripted_flow") return;
      syncNastyaBattleOutcome();
    }, 250);
  }

  function playIntro() {
    const introEntries = INTRO_LINES.concat([
      Object.freeze({ id: "rayhan_directed_greeting", speakerId: "npc_stage7_ken", name: "Райхан", text: `привет, ${playerNickname()}` }),
    ]);
    introEntries.forEach((entry, index) => {
      const timer = setTimeout(() => {
        if (!active || phase === "tone_prompted") return;
        const isLastIntroEntry = index === introEntries.length - 1;
        pushNpc(isLastIntroEntry ? Object.assign({}, entry, {
          onComplete: () => {
            if (!active || phase !== "intro") return;
            phase = "awaiting_first";
            saveState();
            scheduleSilencePrompt();
          },
        }) : entry);
      }, index * INTRO_STEP_DELAY_MS);
      introTimers.push(timer);
    });
  }

  function start(nextContext, mode) {
    clearTimers();
    context = nextContext || {};
    if (mode === "fresh") resetStage715FreshState(context);
    active = true;
    phase = restorePhase(context, mode);
    // Every production boot path must reattach the Stage 7.15 handlers.
    installChatHook();
    installDemoInteractionGuards();
    const state = stateFor(context);
    ensurePlayers(state);
    normalizeResolvedNastyaCheckpoint(state);
    const pendingOlegEscape = stage715BattleById(OLEG_ESCAPE_BATTLE_ID);
    const pendingOlegEscapeState = pendingOlegEscape && pendingOlegEscape.meta
      ? pendingOlegEscape.meta.stage715Escape : null;
    if (pendingOlegEscapeState && pendingOlegEscapeState.status === "voting"
      && (!pendingOlegEscape.escapeVote || pendingOlegEscape.escapeVote.decided)) {
      // A Core settlement can survive reload before Stage metadata is updated.
      // Reconcile it on controller startup even if an older saved phase no
      // longer points at the escape screen.
      settleOlegEscapeOutcome(pendingOlegEscape);
    }
    const nastyaCheckpoint = stage715BattleById(NASTYA_BATTLE_ID);
    if (nastyaCheckpoint && nastyaCheckpoint.meta) {
      if (nastyaCheckpoint.meta.stage715NastyaLossLineShown === true) {
        ensureNastyaScriptedChatLine("stage715NastyaLossLineShown", NASTYA_INITIAL_WRONG_LINE);
      }
      if (nastyaCheckpoint.meta.stage715NastyaSurrenderLineShown === true) {
        ensureNastyaScriptedChatLine("stage715NastyaSurrenderLineShown", NASTYA_SURRENDER_LINE);
      }
      if (nastyaCheckpoint.meta.stage715NastyaPostWinQuestionShown === true) {
        ensureNastyaScriptedChatLine("stage715NastyaPostWinQuestionShown", NASTYA_POST_WIN_QUESTION);
      }
    }
    if (state && state.me && state.players && state.players.me && state.me.name) {
      state.players.me.name = state.me.name;
    }
    initializeStage715InitialRepBaseline(state, mode);
    saveState();
    initializeProgressiveDisclosure(mode);
    setStage715EventsPanelVisible(!!(state.flags && state.flags[STAGE715_EVENTS_REVEALED_FLAG] === true));
    telemetry("demo_enter_chat");
    if (phase === "intro") playIntro();
    if (["nastya_battle", "nastya_initial_wrong_waiting_rematch", "nastya_rematch_available",
      "nastya_rematch_paid", "nastya_rematch_awaiting_answer", "nastya_rematch_wrong",
      "nastya_surrender_waiting_reply", "nastya_automatic_victory_settlement",
      "nastya_waiting_chat_reply", "nastya_crowd_vote", "nastya_post_win_waiting_reply"].includes(phase)) {
      watchNastyaBattle();
    }
    if (phase === "nastya_rematch_awaiting_answer") {
      const rematch = stage715BattleById(NASTYA_BATTLE_ID);
      if (rematch && rematch.meta && rematch.meta.stage715NastyaPhase === "rematch_awaiting_answer") {
        rematch.attack = Object.assign({}, rematch.attack || {}, {
          text: "Ну и кто всё это начал?", displayText: "Ну и кто всё это начал?",
          color: "o", _color: "o", type: "who", qtype: "who", group: "who",
        });
        if (!Array.isArray(rematch._defenseChoices)
          || rematch._defenseChoices.length !== 3
          || rematch._defenseChoices.some((choice, index) => choice.stage715DisplayText !== NASTYA_REMATCH_CHOICES[index].text)) {
          prepareNastyaDefenseChoices(rematch, NASTYA_REMATCH_CHOICES);
        }
      }
    }
    if (phase === "nastya_surrender_waiting_reply") {
      const surrendered = stage715BattleById(NASTYA_BATTLE_ID);
      if (surrendered && surrendered.meta && surrendered.meta.stage715NastyaSurrenderReplyReceived === true) {
        phase = "nastya_automatic_victory_settlement";
        settleNastyaAutomaticVictory();
      }
    } else if (phase === "nastya_automatic_victory_settlement") {
      settleNastyaAutomaticVictory();
    }
    if (phase === "nastya_crowd_vote") {
      const battle = stage715BattleById(NASTYA_BATTLE_ID);
      const eventId = battle && battle.meta && battle.meta.stage715NastyaEventId;
      const event = eventId && (state.events || []).find((item) => item && item.id === eventId);
      if (event && event.resolved) finishNastyaEventVote(event);
      else if (event) scheduleNastyaEventVotes(event);
    }
    if (phase === "next_scripted_flow") {
      const nastya = stage715BattleById(NASTYA_BATTLE_ID);
      const postWinReplyReceived = !!(state && state.flags
        && state.flags.stage715NastyaPostWinReplyReceived === true);
      const nastyaWon = battleOutcome(nastya) === "win"
        || !!(state && state.flags && state.flags.stage715NastyaWon === true);
      if (postWinReplyReceived && nastyaWon && !stage715BattleById(OLEG_BATTLE_ID)) startOlegBattle();
    }
    if (phase === "battle_unlocked" || phase === "first_battle") watchRayhanBattle();
    if (phase === "battle_unlocked" || phase === "first_battle") {
      const resumedRayhan = stage715BattleById(FIRST_BATTLE_ID);
      if (battleOutcome(resumedRayhan) === "win") settleRayhanWinRewards(resumedRayhan);
    }
    if (phase === "rayhan_event_vote") {
      watchRayhanBattle();
      resumeRayhanEventVote();
    }
    if (phase === "oleg_battle") {
      if (stage715BattleById(OLEG_BATTLE_ID)) watchOlegBattle();
      else startOlegBattle();
    }
    if (phase === "oleg_dm") {
      openOlegDmAfterLoss();
    }
    if (phase === "oleg_escape_ready" || phase === "oleg_escape_vote") {
      unlockOlegEscapeBattle();
    }
    if (phase === "first_independent_battle") watchFirstIndependentBattle();
    return { claimed: true, mode, stateId: "stage7_15_demo_chat", releaseNormalWorld: () => {} };
  }

  function claimFreshStart(nextContext) {
    if (!isActive(nextContext)) return { claimed: false };
    resetStage715FreshState(nextContext);
    return start(nextContext, "fresh");
  }

  function claimResume(nextContext) {
    restorePersistedStage715State(nextContext);
    if (!isActive(nextContext)) return { claimed: false };
    const result = start(nextContext, "resume");
    installChatHook();
    installDemoInteractionGuards();
    return result;
  }

  function handlePlayerMessage(text) {
    if (!active || !String(text || "").trim()) return false;
    pushPlayer(String(text).trim());
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = null;
    if (phase === "awaiting_first" || phase === "awaiting_first_after_nudge" || phase === "awaiting_second") {
      phase = "tone_prompted";
      saveState();
      telemetry("demo_first_player_message");
      telemetry("stage715_tone_seen");
      pushNpc({ speakerId: "npc_stage7_ken", name: "Райхан", text: TONE_PROMPT });
      return true;
    }
    if (phase === "tone_prompted") {
      phase = "tone_answered";
      saveState();
      telemetry("stage715_tone_answered");
      pushNpc({ speakerId: "npc_stage7_ken", name: "Райхан", text: TONE_ACK });
      pushNpc({
        speakerId: "npc_stage7_ken",
        name: "Райхан",
        text: rayhanBattleInviteText(),
        onComplete: () => {
          const result = unlockFirstBattle();
          if (!result || result.ok !== true) {
            lastRayhanFailure = result || { ok: false, reason: "Rayhan challenge unlock failed" };
          }
          return result;
        },
      });
      return true;
    }
    if (phase === "rayhan_win_waiting_reply") {
      showNastyaAfterRayhanReply();
      return true;
    }
    if (phase === "rayhan_wrong_waiting_reply") {
      const battle = stage715BattleById(FIRST_BATTLE_ID);
      const pendingChoiceId = battle && battle.meta && battle.meta.stage715RayhanPendingChoiceId;
      const choice = battle && (battle._defenseChoices || []).find((item) => String(item.id) === String(pendingChoiceId));
      if (battle && choice) {
        battle.meta.stage715RayhanPendingChoiceId = null;
        battle.meta.stage715RayhanAnswerPending = false;
        battle.defense = Object.assign({}, choice);
        if (choice.stage715DisplayText) {
          preserveStage715SelectedDefenseText(FIRST_BATTLE_ID, choice.stage715DisplayText);
        }
        startRayhanEventVote(battle);
        saveState();
      }
      return true;
    }
    if (phase === "first_battle" || phase === "battle_unlocked") {
      const firstBattle = stage715BattleById(FIRST_BATTLE_ID);
      if (battleOutcome(firstBattle) === "win") {
        settleRayhanWinRewards(firstBattle);
        if (phase === "rayhan_win_waiting_reply") showNastyaAfterRayhanReply();
      }
      return true;
    }
    if (phase === "rayhan_event_vote") return true;
    if (phase === "nastya_prompt") {
      // The first Nastya chat reply only acknowledges the challenge. The
      // scripted counterargument is selected from the battle card that this
      // reply opens, not parsed as a chat command.
      startNastyaBattle();
      return true;
    }
    if (phase === "nastya_waiting_chat_reply") {
      startNastyaCrowdVote();
      return true;
    }
    if (phase === "nastya_surrender_waiting_reply") {
      const battle = stage715BattleById(NASTYA_BATTLE_ID);
      if (battle && battle.meta) battle.meta.stage715NastyaSurrenderReplyReceived = true;
      phase = "nastya_automatic_victory_settlement";
      saveState();
      return settleNastyaAutomaticVictory();
    }
    if (phase === "nastya_post_win_waiting_reply") {
      phase = "next_scripted_flow";
      const state = stateFor();
      if (state && state.flags) state.flags.stage715NastyaPostWinReplyReceived = true;
      saveState();
      const nastya = stage715BattleById(NASTYA_BATTLE_ID);
      const nastyaWon = battleOutcome(nastya) === "win"
        || !!(state && state.flags && state.flags.stage715NastyaWon === true);
      if (nastyaWon && !stage715BattleById(OLEG_BATTLE_ID)) startOlegBattle();
      return true;
    }
    if (phase === "next_scripted_flow") {
      const state = stateFor();
      const nastya = stage715BattleById(NASTYA_BATTLE_ID);
      const nastyaWon = battleOutcome(nastya) === "win"
        || !!(state && state.flags && state.flags.stage715NastyaWon === true);
      if (nastyaWon && !stage715BattleById(OLEG_BATTLE_ID)) startOlegBattle();
      return true;
    }
    return true;
  }

  function installChatHook() {
    const UI = G.UI;
    if (!UI || typeof UI.sendChat !== "function" || UI.sendChat.__stage715DemoWrapped) return;
    const original = UI.sendChat;
    const wrapped = function (...args) {
      if (active) {
        const input = document.getElementById("chatInput");
        const text = input ? String(input.value || "").trim() : "";
        if (!text) return;
        if (input) input.value = "";
        handlePlayerMessage(text);
        return;
      }
      return original.apply(this, args);
    };
    wrapped.__stage715DemoWrapped = true;
    UI.sendChat = wrapped;
  }

  function installDemoInteractionGuards() {
    const input = document.getElementById("chatInput");
    if (input && !input.__stage715DemoInteractionGuard) {
      const blockMentionInteraction = (event) => {
        if (!active) return;
        const mentionList = document.getElementById("mentionList");
        if (mentionList) mentionList.remove();
        try { event.stopImmediatePropagation(); } catch (_) {}
      };
      ["focus", "click", "input"].forEach((type) => input.addEventListener(type, blockMentionInteraction, true));
      input.addEventListener("keydown", (event) => {
        if (!active) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          try { event.stopImmediatePropagation(); } catch (_) {}
        }
      }, true);
      input.__stage715DemoInteractionGuard = true;
    }
    const chatLog = document.getElementById("chatLog");
    if (chatLog && !chatLog.__stage715DemoInteractionGuard) {
      chatLog.addEventListener("click", (event) => {
        if (!active) return;
        const bubble = event.target && event.target.closest ? event.target.closest(".bubble") : null;
        if (!bubble) return;
        try { event.preventDefault(); event.stopImmediatePropagation(); } catch (_) {}
      }, true);
      chatLog.__stage715DemoInteractionGuard = true;
    }
  }

  function destroy() {
    clearTimers();
    active = false;
    phase = "idle";
    context = null;
  }

  installChatHook();
  installDemoInteractionGuards();
  G.Stage715Demo = {
    isActive,
    hasPersistedCheckpoint,
    restorePersistedCheckpoint: restorePersistedStage715State,
    claimFreshStart,
    claimResume,
    handlePlayerMessage,
    handleRayhanDefenseChoice,
    handleNastyaDefenseChoice,
    startNastyaRematch,
    removeResolvedNastyaBattle,
    handleOlegDefenseChoice,
    getOlegEscapeDefenseChoices,
    handleOlegDmReply,
    persistOlegEscapeVoteProgress,
    revealBattlesPanel,
    revealEventsPanel,
    shouldRevealBattleBlock,
    isOlegDmRestrictedThread,
    isOlegEscapeBattle,
    isChallengeButtonAvailable: () => {
      if (!active) return true;
      const state = stateFor();
      return isFirstIndependentBattleReady(state);
    },
    firstIndependentBattleStartOptions,
    firstIndependentBattleStarted,
    isFirstEventEligible,
    startOlegEscape,
    destroy,
    getState: () => ({ active, phase, sourceTag: DEMO_SOURCE_TAG, typingName: npcTyping && npcTyping.name || null }),
    getLastFailure: () => (lastRayhanFailure ? Object.assign({}, lastRayhanFailure) : null),
  };
  if (!G.__DEV || typeof G.__DEV !== "object") G.__DEV = {};
  G.__DEV.getStage715DemoState = () => ({ active, phase, enabled: isActive() });
})();
