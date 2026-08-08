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
    { id: "mika_missing_money", at: 3500, name: "Настя", text: "Из общей кассы пропали деньги." },
    { id: "oleg_context", at: 6500, name: "Олег", text: "Пропажу заметили ещё до появления новичка?" },
    { id: "ken_hint", at: 9500, name: "Райхан", text: "Новичок пришёл — и деньги исчезли. Странное совпадение." },
    { id: "mika_brake", at: 12500, name: "Настя", text: "Без доказательств никого не обвиняем." },
    { id: "ken_accusation", at: 15000, name: "Райхан", text: "Это сделал ты. Деньги пропали после твоего появления." },
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
      role: "обвинитель",
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
      role: "свидетель",
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
      role: "наблюдатель",
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
      worldAdvanceDueAt: Number.isFinite(Number(raw.worldAdvanceDueAt)) ? Number(raw.worldAdvanceDueAt) : null,
      worldAdvanceSettled: raw.worldAdvanceSettled === true && typeof raw.worldAdvanceId === "string" && raw.worldAdvanceId.length > 0,
      worldAdvancePresented: raw.worldAdvancePresented === true,
      worldAdvancePresentationMode: ["foreground", "return"].includes(raw.worldAdvancePresentationMode) ? raw.worldAdvancePresentationMode : null,
      branchFollowUpPending: raw.branchFollowUpPending === true,
      followUpChoiceId: ["primary", "secondary"].includes(raw.followUpChoiceId) ? raw.followUpChoiceId : null,
      followUpSettled: raw.followUpSettled === true,
      roundTwoResultAcknowledged: raw.roundTwoResultAcknowledged === true,
      onboardingUnlocked: raw.onboardingUnlocked === true || legacyCompleted,
      unlockedAt: Number.isFinite(Number(raw.unlockedAt)) ? Number(raw.unlockedAt) : null,
      lastHiddenAt: Number.isFinite(Number(raw.lastHiddenAt)) ? Number(raw.lastHiddenAt) : null,
      npcMemory: raw.npcMemory && typeof raw.npcMemory === "object" ? raw.npcMemory : {},
      realBattleBridge: sanitizeRealBattleBridge(raw.realBattleBridge),
      evidence: sanitizeEvidence(raw.evidence),
      telemetry: Array.isArray(raw.telemetry) ? raw.telemetry.slice(-80) : [],
    });
    if (normalized.onboardingUnlocked) {
      normalized.stateId = "main_unlocked";
      normalized.awaitingWorldAdvance = false;
      normalized.worldAdvancePresented = false;
      normalized.worldAdvanceSettled = true;
      normalized.branchFollowUpPending = false;
      normalized.followUpSettled = true;
      normalized.evidence.questionnaireOpen = false;
      normalized.evidence.answersComplete = true;
      return normalized;
    }
    if (!hasCorridorContract && normalized.stateId === "intermission") {
      const startedAt = normalized.cycleCompletedAt || Date.now();
      normalized.intermissionStartedAt = startedAt;
      normalized.worldAdvanceDueAt = normalized.worldAdvanceDueAt || (startedAt + INTERMISSION_DELAY_MS);
      normalized.awaitingWorldAdvance = true;
      normalized.worldAdvancePresented = false;
      normalized.worldAdvanceSettled = false;
      normalized.branchFollowUpPending = false;
      normalized.followUpSettled = false;
    }
    if (!hasCorridorContract && normalized.stateId === "round_two") {
      normalized.awaitingWorldAdvance = true;
      normalized.worldAdvancePresented = true;
      normalized.worldAdvanceSettled = false;
      normalized.branchFollowUpPending = true;
      normalized.followUpSettled = false;
    }
    return normalized;
  }

  function loadSnapshot() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return sanitize(JSON.parse(raw));
    } catch (_) {
      return null;
    }
  }

  function saveSnapshot() {
    if (!snapshot) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (_) {
      return false;
    }
  }

  function telemetry(name, meta) {
    if (!snapshot) return;
    snapshot.telemetrySeq = (snapshot.telemetrySeq | 0) + 1;
    snapshot.telemetry = Array.isArray(snapshot.telemetry) ? snapshot.telemetry : [];
    snapshot.telemetry.push({ seq: snapshot.telemetrySeq, name, at: Date.now(), meta: meta || null });
    if (snapshot.telemetry.length > 80) snapshot.telemetry.splice(0, snapshot.telemetry.length - 80);
    saveSnapshot();
  }

  function getState() {
    return context && context.state ? context.state : (G.__S || (G.UI && G.UI.S) || G.State || null);
  }

  function ensureScenarioPlayers() {
    const S = getState();
    if (!S) return;
    S.players = S.players || {};
    const startNpcPoints = G.Data && Number.isFinite(G.Data.START_POINTS_NPC)
      ? (G.Data.START_POINTS_NPC | 0)
      : (G.Data && Number.isFinite(G.Data.POINTS_START_NPC) ? (G.Data.POINTS_START_NPC | 0) : 10);
    if (!S.players.npc_stage7_ken) S.players.npc_stage7_ken = { id: "npc_stage7_ken", name: "Райхан", role: "crowd", npc: true, points: startNpcPoints, meta: {} };
    if (!S.players.npc_stage7_mika) S.players.npc_stage7_mika = { id: "npc_stage7_mika", name: "Настя", role: "crowd", npc: true, points: startNpcPoints, meta: {} };
    if (!S.players.npc_bandit) S.players.npc_bandit = { id: "npc_bandit", name: "Олег", role: "bandit", npc: true, points: startNpcPoints, meta: {} };
    ["npc_stage7_ken", "npc_stage7_mika", "npc_bandit"].forEach((id) => {
      const player = S.players[id];
      if (!player) return;
      player.meta = player.meta && typeof player.meta === "object" ? player.meta : {};
      player.meta.stage7FirstExperience = Object.assign(
        {},
        player.meta.stage7FirstExperience || {},
        snapshot && snapshot.npcMemory && snapshot.npcMemory[id] || {}
      );
    });
  }

  function pushLine(entry) {
    if (!entry || !context || !context.UI) return;
    const UI = context.UI;
    if (entry.system && typeof UI.pushSystem === "function") UI.pushSystem(entry.text);
    else if (typeof UI.pushChat === "function") UI.pushChat({ name: entry.name, text: entry.text, system: false });
    if (typeof UI.requestRenderAll === "function") UI.requestRenderAll();
    else if (typeof UI.renderAll === "function") UI.renderAll();
  }

  function emitPrelude(entry) {
    if (!snapshot || snapshot.shownMessageIds.includes(entry.id)) return false;
    snapshot.shownMessageIds.push(entry.id);
    if (entry.id === "ken_accusation") {
      snapshot.preludeComplete = true;
      snapshot.stateId = "accusation";
    }
    saveSnapshot();
    const renderedEntry = entry.id === "ken_accusation"
      ? Object.assign({}, entry, {
        text: `@${context.playerName || (getState() && getState().me && getState().me.name) || "Игрок"}, это ты. Деньги пропали после твоего появления.`,
      })
      : entry;
    pushLine(renderedEntry);
    telemetry("first_experience.prelude_message_shown", { messageId: entry.id });
    if (entry.id === "room_entered") telemetry("first_experience.room_entered");
    if (entry.id === "ken_accusation") telemetry("first_experience.accusation_triggered");
    render();
    return true;
  }

  function ensurePanel() {
    let panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel) return panel;
    const blocks = document.getElementById("blocks");
    if (!blocks) return null;
    panel = document.createElement("section");
    panel.id = "stage7FirstExperiencePanel";
    panel.className = "block panel stage7FirstExperiencePanel";
    panel.setAttribute("aria-live", "polite");
    panel.addEventListener("click", onPanelClick);
    blocks.insertBefore(panel, blocks.firstChild || null);
    return panel;
  }

  function setControlledMode(active) {
    const root = document.documentElement;
    if (root) root.classList.toggle("stage7-first-experience-active", !!active);
  }

  function actionButton(label, action, extra) {
    return `<button class="btn primary stage7FirstExperienceAction" type="button" data-stage7-action="${action}" ${extra || ""}>${label}</button>`;
  }

  function getIntermissionNpc(npcId) {
    return INTERMISSION_NPCS.find((npc) => npc.id === npcId) || null;
  }

  function getIntermissionLine(npc) {
    if (!npc || !snapshot || !snapshot.branchId) return "";
    const lines = npc.lines[snapshot.branchId] || [];
    const visits = snapshot.intermissionNpcVisits && Number(snapshot.intermissionNpcVisits[npc.id]) || 0;
    return lines.length ? lines[Math.max(0, visits - 1) % lines.length] : "";
  }

  function renderIntermission(panel) {
    const remainingMs = Math.max(0, Number(snapshot.worldAdvanceDueAt || 0) - Date.now());
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const message = snapshot.intermissionNpcMessage;
    const cards = INTERMISSION_NPCS.map((npc) => `
      <button class="btn stage7NpcAction" type="button" data-stage7-action="talk-intermission-npc" data-intermission-npc="${npc.id}">
        <strong>${npc.name}</strong><span>${npc.role}</span>
      </button>`).join("");
    panel.innerHTML = `
      <div class="stage7Intermission">
        <div class="stage7EvidenceBadge">Первый раунд завершён</div>
        <h2>В комнате остались трое</h2>
        <p>До второго раунда ${remainingSeconds > 0 ? `примерно ${remainingSeconds} сек.` : "считанные секунды"} Можно поговорить с участниками, подождать или отлучиться.</p>
        <div class="stage7IntermissionGrid" aria-label="Три доступных персонажа">${cards}</div>
        ${message ? `<div class="stage7NpcReply"><strong>${message.name}</strong><p>${message.text}</p></div>` : ""}
        <div class="stage7Support">Полная игра пока закрыта. Если уйдёшь, второй раунд встретит тебя после возвращения. Всё сохранено.</div>
      </div>`;
  }

  function renderVotes(branch) {
    return `<div class="stage7VoteRow" aria-label="Пять голосов">${branch.vote.map((side, index) => {
      const resolved = index < snapshot.voteStep;
      const cls = !resolved ? "pending" : (side ? "player" : "ken");
      const text = !resolved ? "•" : (side ? "За тебя" : "За Райхана");
      return `<span class="stage7VoteMarker ${cls}" data-vote-index="${index}">${text}</span>`;
    }).join("")}</div>`;
  }

  function renderWorldAdvance(panel) {
    const branch = BRANCHES[snapshot.branchId];
    const offer = BRANCH_FOLLOW_UPS[snapshot.branchId];
    if (!branch || !offer) return;
    const header = snapshot.worldAdvancePresentationMode === "return" ? "Пока тебя не было..." : "Второй раунд начался";
    panel.innerHTML = `
      <div class="stage7WorldAdvance">
        <div class="stage7EvidenceBadge">${header}</div>
        <h2>${offer.title}</h2>
        <p><strong>${branch.change}</strong></p>
        <p>${branch.cause}</p>
        <p class="stage7DecisionHook">${offer.prompt}</p>
        <div class="stage7ChoiceGrid">
          ${actionButton(offer.primaryLabel, "resolve-branch-follow-up", 'data-follow-up="primary"')}
          ${actionButton(offer.secondaryLabel, "resolve-branch-follow-up", 'data-follow-up="secondary"')}
        </div>
        <div class="stage7Support">Это второй и последний учебный раунд перед проверкой понимания.</div>
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
        <div class="stage7EvidenceBadge">Проверка понимания · ${evidence.questionIndex + 1}/${questions.length}</div>
        <h2 id="stage7EvidenceQuestionTitle">${question.prompt}</h2>
        <div class="stage7EvidenceOptions">${options}</div>
        <div class="stage7Support">Ответ не останавливает прохождение. Важно закончить все шесть вопросов.</div>
      </div>`;
  }

  function getRoundTwoResult() {
    if (!snapshot || !snapshot.followUpSettled || !snapshot.followUpChoiceId) return null;
    const offer = BRANCH_FOLLOW_UPS[snapshot.branchId];
    if (!offer) return null;
    const reaction = snapshot.followUpChoiceId === "primary" ? offer.primaryReaction : offer.secondaryReaction;
    const memory = snapshot.npcMemory && snapshot.npcMemory[offer.memoryTarget];
    if (!reaction || !memory || Number(memory[reaction.memoryKey]) < 1) return null;
    return reaction;
  }

  function renderRoundTwoResult(panel) {
    const result = getRoundTwoResult();
    if (!result) return;
    panel.innerHTML = `
      <div class="stage7BranchFollowUp" role="dialog" aria-modal="true" aria-labelledby="stage7RoundTwoResultTitle">
        <div class="stage7EvidenceBadge">Второй раунд завершён</div>
        <h2 id="stage7RoundTwoResultTitle">${result.title}</h2>
        <p>${result.body}</p>
        <div class="stage7Support">После вопросов откроется полная игра.</div>
        <p class="stage7Transition">Пока Райхан собирает сторонников, ответь на 6 простых вопросов — так ты поймёшь, как работает игра.</p>
        ${actionButton("Перейти к вопросам", "open-onboarding-questionnaire")}
      </div>`;
  }


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
      dmStatus: bridge.aftermathDmStatus,
      dmLineId: bridge.aftermathDmLineId,
      dmDeliveredAt: bridge.aftermathDmDeliveredAt,
      dmDeliveryCount: bridge.aftermathDmDeliveryCount,
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
    bridge.aftermathDmStatus = "locked";
    bridge.aftermathDmLineId = null;
    bridge.aftermathDmDeliveredAt = null;
    bridge.aftermathDmDeliveryCount = 0;

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
      dmStatus: "locked",
      dmLineId: null,
      dmDeliveredAt: null,
      dmDeliveryCount: 0,
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


  function getFirstBattleAftermathDmContactRecord() {
    const current = snapshot || loadSnapshot();
    if (!current || current.onboardingUnlocked !== true) return null;
    const bridge = sanitizeRealBattleBridge(current.realBattleBridge);
    if (bridge.status !== "completed"
      || bridge.aftermathStatus !== "acknowledged"
      || !["pending", "delivered"].includes(bridge.aftermathDmStatus)) return null;
    const branchId = RESPONSE_IDS.includes(bridge.aftermathBranchId)
      ? bridge.aftermathBranchId
      : bridge.branchId;
    const expectedTarget = branchId ? FIRST_BATTLE_AFTERMATH_TARGETS[branchId] : null;
    const target = bridge.aftermathTargetNpcId || expectedTarget;
    if (!branchId || !target || target !== expectedTarget) return null;
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
    const lineId = bridge.aftermathDmLineId
      || `${FIRST_BATTLE_AFTERMATH_DM_ID}:${bridge.battleId}:${target}`;
    return {
      contactId: FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID,
      lineId,
      targetNpcId: target,
      npcName: copyGroup.npcName,
      battleId: bridge.battleId,
      branchId,
      outcomeKind,
      dmStatus: bridge.aftermathDmStatus,
      text,
    };
  }

  function restoreFirstBattleAftermathDmHistory(contact) {
    if (!contact || contact.dmStatus !== "delivered") return false;
    ensureScenarioPlayers();
    const logs = getDmLogsForNpc(contact.targetNpcId);
    const UI = G.UI;
    if (!logs || !UI || typeof UI.dmPushLine !== "function") return false;
    const existing = logs.find((item) => item
      && item.stage7AftermathReplyId === contact.lineId
      && item.stage7AftermathBattleId === contact.battleId);
    if (existing) return true;
    UI.dmPushLine(contact.targetNpcId, contact.npcName, contact.text);
    const line = logs[logs.length - 1] || null;
    if (!line) return false;
    line.stage7AftermathReplyId = contact.lineId;
    line.stage7AftermathBattleId = contact.battleId;
    line.stage7AftermathOutcomeKind = contact.outcomeKind;
    line.stage7AftermathHistoryRestored = true;
    return true;
  }

  function renderFirstBattleAftermathDmContact(panel) {
    const contact = getFirstBattleAftermathDmContactRecord();
    if (!panel || !contact) return false;
    const statusText = contact.dmStatus === "pending"
      ? `${contact.npcName} хочет обсудить, чем закончился спор. Открой личку, когда будешь готов.`
      : `Сообщение от ${contact.npcName} уже в переписке. Открой личку, чтобы перечитать его.`;
    panel.innerHTML = `
      <div class="stage7BranchFollowUp stage7AftermathDmContact" data-testid="stage7-aftermath-dm-contact">
        <div class="stage7EvidenceBadge">Личный контакт</div>
        <h2>${contact.npcName}</h2>
        <p>${statusText}</p>
        ${actionButton(`Открыть личку: ${contact.npcName}`, "open-aftermath-dm-contact")}
        <div class="stage7Support">Открой личку, когда будешь готов. После обновления страницы она сама не откроется.</div>
      </div>`;
    return true;
  }

  function openFirstBattleAftermathDmContact() {
    const contact = getFirstBattleAftermathDmContactRecord();
    const UI = G.UI;
    if (!contact || !UI || typeof UI.openDM !== "function") return false;
    ensureScenarioPlayers();
    if (contact.dmStatus === "delivered") restoreFirstBattleAftermathDmHistory(contact);
    const result = UI.openDM(contact.targetNpcId);
    if (result === false) return false;
    if (contact.dmStatus === "delivered") restoreFirstBattleAftermathDmHistory(contact);
    telemetry("first_experience.first_real_battle_aftermath_dm_contact_opened", {
      contactId: FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID,
      targetNpcId: contact.targetNpcId,
      branchId: contact.branchId,
      battleId: contact.battleId,
      outcomeKind: contact.outcomeKind,
      dmStatus: contact.dmStatus,
    });
    render();
    return true;
  }


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

  function render() {
    if (!snapshot) return;
    const panel = ensurePanel();
    if (!panel) return;
    const branch = snapshot.branchId ? BRANCHES[snapshot.branchId] : null;

    if (snapshot.onboardingUnlocked) {
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
      if (bridge
        && bridge.status === "completed"
        && bridge.aftermathStatus === "acknowledged"
        && ["pending", "delivered"].includes(bridge.aftermathDmStatus)) {
        releaseNormalWorldOnce({ preservePanel: true });
        panel.hidden = false;
        if (renderFirstBattleAftermathDmContact(panel)) return;
      }
      panel.remove();
      releaseNormalWorldOnce();
      return;
    }

    if (snapshot.evidence && snapshot.evidence.questionnaireOpen && !snapshot.evidence.answersComplete) {
      panel.hidden = false;
      setControlledMode(true);
      renderEvidenceQuestion(panel);
      return;
    }

    if (snapshot.stateId === "round_two" && snapshot.worldAdvancePresented && !snapshot.worldAdvanceSettled) {
      panel.hidden = false;
      setControlledMode(true);
      renderWorldAdvance(panel);
      return;
    }

    if (snapshot.stateId === "round_two_result" && snapshot.followUpSettled) {
      panel.hidden = false;
      setControlledMode(true);
      renderRoundTwoResult(panel);
      return;
    }

    if (snapshot.stateId === "intermission") {
      panel.hidden = false;
      setControlledMode(true);
      renderIntermission(panel);
      return;
    }

    if (!snapshot.preludeComplete) {
      panel.hidden = true;
      panel.innerHTML = "";
      setControlledMode(true);
      return;
    }

    panel.hidden = false;
    setControlledMode(true);
    if (snapshot.stateId === "accusation") {
      panel.innerHTML = `<h2>Райхан обвиняет тебя в краже.</h2><p>Все это видят.</p>${actionButton("Ответить", "open-answer")}`;
      return;
    }
    if (snapshot.stateId === "answer") {
      panel.innerHTML = `<h2>Что ответить?</h2><div class="stage7ChoiceGrid">
        ${actionButton("Отрицать", "choose", 'data-branch="deny"')}
        ${actionButton("Обвинить Райхана", "choose", 'data-branch="accuse_ken"')}
        ${actionButton("Заплатить", "choose", 'data-branch="pay"')}
      </div>`;
      return;
    }
    if (!branch) {
      panel.innerHTML = `<h2>Первый конфликт</h2><p>Восстанавливаем сохранённое состояние.</p>`;
      return;
    }
    if (snapshot.stateId === "reaction") {
      panel.innerHTML = `<h2>Твой ответ</h2><p>${branch.player}</p>${actionButton("Посмотреть реакцию", "show-reaction")}`;
      return;
    }
    if (snapshot.stateId === "vote") {
      const complete = snapshot.voteStep >= 5;
      panel.innerHTML = `<h2>Реакция Насти</h2><p>${branch.reaction}</p>
        ${renderVotes(branch)}
        ${complete
          ? `<p class="stage7Result">${branch.result}</p>${actionButton("Принять последствие", "accept-consequence")}`
          : (snapshot.voteStarted
            ? `<div class="stage7Support">Голоса появляются по очереди.</div>`
            : actionButton("Увидеть голосование", "start-vote"))}`;
      return;
    }
    if (snapshot.stateId === "consequence") {
      panel.innerHTML = `<h2>${branch.result}</h2><p>${branch.consequence}</p><p class="stage7KenLine">Райхан: Это ещё не конец. Я требую второй раунд.</p>${actionButton("Ответить", "accept-rematch")}`;
      return;
    }
    if (snapshot.stateId === "rematch") {
      panel.innerHTML = `<h2>Первый раунд завершён.</h2><p>До второго раунда можно осмотреться и поговорить с тремя участниками.</p>${actionButton("Осмотреться", "explore-world")}`;
    }
  }

  function getMoneyLogRows() {
    const stores = [G.__D && G.__D.moneyLog, G.State && G.State.moneyLog, G.__S && G.__S.moneyLog];
    return stores.find(Array.isArray) || [];
  }

  function ledgerHasMoneySettlement(id) {
    return getMoneyLogRows().some((row) => row && row.meta && (
      row.meta.settlementId === id || row.meta.idempotencyKey === id
    ));
  }

  function applySettlement() {
    if (!snapshot || !snapshot.branchId) return false;
    const branchId = snapshot.branchId;
    const evidence = snapshot.evidence;
    const settlementBase = `first_experience_settlement_v1:${branchId}`;
    const settlementId = snapshot.settlementId || (TEST_MODE && evidence
      ? `${settlementBase}:${evidence.sessionId}`
      : settlementBase);
    snapshot.settlementId = settlementId;
    saveSnapshot();
    if (snapshot.settled || (branchId === "pay" && ledgerHasMoneySettlement(settlementId))) {
      snapshot.settled = true;
      saveSnapshot();
      return true;
    }
    const meta = {
      scenarioId: SCENARIO_ID,
      branchId,
      settlementId,
      actionId: settlementId,
      idempotencyKey: settlementId,
    };
    let result = null;
    if (branchId === "pay") {
      const S = getState();
      const currentPoints = S && S.me && Number.isFinite(S.me.points) ? (S.me.points | 0) : 0;
      if (currentPoints < 3) return false;
      const economy = G.ConflictEconomy || G._ConflictEconomy;
      if (!economy || typeof economy.transferPoints !== "function") return false;
      result = economy.transferPoints("me", "sink", 3, "first_experience_compensation", meta);
    } else {
      if (!G.__A || typeof G.__A.transferRep !== "function") return false;
      result = G.__A.transferRep("crowd_pool", "me", 2, "first_experience_reputation_result", settlementId, meta);
    }
    if (result && result.ok === false && result.reason !== "duplicate") return false;
    snapshot.settled = true;
    if (TEST_MODE && evidence) evidence.settlementAppliedCount += 1;
    if (branchId === "accuse_ken") {
      snapshot.npcMemory.npc_stage7_ken = Object.assign({}, snapshot.npcMemory.npc_stage7_ken || {}, { ken_escalation: 1 });
    }
    saveSnapshot();
    telemetry("first_experience.settlement_applied", { branchId, settlementId });
    if (context && context.UI && typeof context.UI.requestRenderAll === "function") context.UI.requestRenderAll();
    return true;
  }

  function scheduleVoteStep() {
    if (voteTimer || !snapshot || snapshot.stateId !== "vote" || !snapshot.voteStarted || snapshot.voteStep >= 5) return;
    voteTimer = setTimeout(() => {
      voteTimer = null;
      if (!snapshot || snapshot.stateId !== "vote") return;
      if (document.hidden) {
        scheduleVoteStep();
        return;
      }
      snapshot.voteStep = Math.min(5, (snapshot.voteStep | 0) + 1);
      saveSnapshot();
      render();
      if (snapshot.voteStep >= 5) telemetry("first_experience.vote_completed", { branchId: snapshot.branchId });
      else scheduleVoteStep();
    }, 500);
  }

  function completeCycle() {
    if (!snapshot || !snapshot.branchId) return;
    snapshot.cycleCompletedAt = Date.now();
    snapshot.intermissionStartedAt = snapshot.cycleCompletedAt;
    snapshot.intermissionNpcVisits = {};
    snapshot.intermissionNpcMessage = null;
    snapshot.stateId = "intermission";
    snapshot.awaitingWorldAdvance = true;
    snapshot.worldAdvanceDueAt = snapshot.cycleCompletedAt + INTERMISSION_DELAY_MS;
    const worldAdvanceBase = `first_experience_world_advance_v2:${snapshot.branchId}`;
    snapshot.worldAdvanceId = TEST_MODE && snapshot.evidence
      ? `${worldAdvanceBase}:${snapshot.evidence.sessionId}`
      : worldAdvanceBase;
    snapshot.worldAdvanceSettled = false;
    snapshot.worldAdvancePresented = false;
    snapshot.worldAdvancePresentationMode = null;
    snapshot.branchFollowUpPending = false;
    snapshot.followUpChoiceId = null;
    snapshot.followUpSettled = false;
    snapshot.roundTwoResultAcknowledged = false;
    snapshot.onboardingUnlocked = false;
    if (snapshot.evidence) snapshot.evidence.branchId = snapshot.branchId;
    hydrateBranchMemory();
    saveSnapshot();
    telemetry("first_experience.round_one_completed", { branchId: snapshot.branchId });
    telemetry("first_experience.intermission_opened", {
      branchId: snapshot.branchId,
      dueAt: snapshot.worldAdvanceDueAt,
      npcCount: INTERMISSION_NPCS.length,
    });
    render();
  }

  function presentWorldAdvance(mode) {
    if (!snapshot
      || snapshot.stateId !== "intermission"
      || snapshot.worldAdvanceSettled
      || snapshot.worldAdvancePresented
      || !snapshot.awaitingWorldAdvance) return false;
    snapshot.stateId = "round_two";
    snapshot.worldAdvancePresented = true;
    snapshot.worldAdvancePresentationMode = mode === "return" ? "return" : "foreground";
    snapshot.branchFollowUpPending = true;
    markEvidenceWorldAdvancePresented(snapshot.worldAdvancePresentationMode);
    saveSnapshot();
    telemetry("first_experience.round_two_presented", {
      mode: snapshot.worldAdvancePresentationMode,
      worldAdvanceId: snapshot.worldAdvanceId,
      branchId: snapshot.branchId,
    });
    render();
    return true;
  }

  function hydrateBranchMemory() {
    if (!snapshot) return;
    if (snapshot.branchId === "deny") {
      snapshot.npcMemory.npc_stage7_ken = Object.assign({}, snapshot.npcMemory.npc_stage7_ken || {}, { rebuildingSupport: 1 });
      snapshot.npcMemory.npc_stage7_mika = Object.assign({}, snapshot.npcMemory.npc_stage7_mika || {}, { asksForEvidence: 1 });
    } else if (snapshot.branchId === "accuse_ken") {
      snapshot.npcMemory.npc_stage7_ken = Object.assign({}, snapshot.npcMemory.npc_stage7_ken || {}, { ken_escalation: 1, publicRematch: 1 });
    } else if (snapshot.branchId === "pay") {
      snapshot.npcMemory.npc_bandit = Object.assign({}, snapshot.npcMemory.npc_bandit || {}, { pressureWorked: 1 });
      snapshot.npcMemory.npc_stage7_mika = Object.assign({}, snapshot.npcMemory.npc_stage7_mika || {}, { uncertainMotive: 1 });
    }
    ensureScenarioPlayers();
  }

  function getBridgeState() {
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

  function syncRealArgumentBattleLifecycle() {
    const bridge = getBridgeState();
    if (!bridge || bridge.status !== "created") return false;
    const battle = getBridgeBattleList().find((item) => item && (
      (item.id === bridge.battleId || item.battleId === bridge.battleId)
      && item.meta
      && item.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID
    ));
    if (!battle) return false;
    const completed = battle.resolved === true
      || battle.finished === true
      || battle.status === "finished";
    if (!completed) return false;
    bridge.status = "completed";
    bridge.completedAt = bridge.completedAt || Date.now();
    bridge.outcome = typeof battle.result === "string" && battle.result ? battle.result : null;
    bridge.lastFailureReason = null;
    if (bridge.evidencePayoffStatus === "pending") {
      bridge.evidencePayoffStatus = "expired";
      if (battle.meta && battle.meta.stage7DenyEvidencePayoff) {
        battle.meta.stage7DenyEvidencePayoff.status = "expired";
      }
      telemetry("first_experience.deny_evidence_payoff_expired", {
        payoffId: DENY_EVIDENCE_PAYOFF_ID,
        battleId: bridge.battleId,
        mode: bridge.evidencePayoffMode,
      });
    }
    if (bridge.accusePayoffStatus === "pending") {
      bridge.accusePayoffStatus = "expired";
      if (battle.meta && battle.meta.stage7AccuseKenPayoff) {
        battle.meta.stage7AccuseKenPayoff.status = "expired";
      }
      telemetry("first_experience.accuse_ken_payoff_expired", {
        payoffId: ACCUSE_KEN_PAYOFF_ID,
        battleId: bridge.battleId,
        mode: bridge.accusePayoffMode,
      });
    }
    if (bridge.payPayoffStatus === "pending") {
      bridge.payPayoffStatus = "expired";
      if (battle.meta && battle.meta.stage7PayPayoff) {
        battle.meta.stage7PayPayoff.status = "expired";
      }
      telemetry("first_experience.pay_payoff_expired", {
        payoffId: PAY_PAYOFF_ID,
        battleId: bridge.battleId,
        mode: bridge.payPayoffMode,
      });
    }
    recordFirstBattleAftermath(battle);
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_completed", {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      battleId: bridge.battleId,
      outcome: bridge.outcome,
    });
    render();
    return true;
  }

  function getRealBattleInjection() {
    const branchId = snapshot && snapshot.branchId;
    const choiceId = snapshot && snapshot.followUpChoiceId;
    const branch = branchId && REAL_BATTLE_INJECTIONS[branchId];
    return branch && branch[choiceId]
      ? branch[choiceId]
      : "Первый спор был разминкой. Теперь отвечай публично - аргументом.";
  }

  function getDenyEvidencePayoffMode() {
    if (!snapshot || snapshot.branchId !== "deny") return null;
    const memory = snapshot.npcMemory && snapshot.npcMemory.npc_stage7_mika
      ? snapshot.npcMemory.npc_stage7_mika
      : {};
    if (memory.evidenceShared) return "shared";
    if (memory.evidenceHeld) return "held";
    if (snapshot.followUpChoiceId === "primary") return "shared";
    if (snapshot.followUpChoiceId === "secondary") return "held";
    return null;
  }

  function ensureDenyEvidencePayoff(battle) {
    const bridge = getBridgeState();
    const mode = getDenyEvidencePayoffMode();
    if (!bridge || !battle || !mode) return false;
    const battleId = battle.id || battle.battleId || null;
    const taggedBridgeBattle = !!(battle.meta
      && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID);
    if (!taggedBridgeBattle || !battleId
      || (bridge.battleId && bridge.battleId !== battleId)) return false;
    if (!bridge.evidencePayoffMode) bridge.evidencePayoffMode = mode;
    if (bridge.evidencePayoffMode !== mode
      && !["revealed", "expired"].includes(bridge.evidencePayoffStatus)) {
      bridge.evidencePayoffMode = mode;
    }
    if (bridge.evidencePayoffStatus === "not_applicable") bridge.evidencePayoffStatus = "pending";
    battle.meta = battle.meta && typeof battle.meta === "object" ? battle.meta : {};
    battle.meta.stage7DenyEvidencePayoff = Object.assign(
      {},
      battle.meta.stage7DenyEvidencePayoff || {},
      {
        payoffId: DENY_EVIDENCE_PAYOFF_ID,
        mode: bridge.evidencePayoffMode,
        status: bridge.evidencePayoffStatus,
        revealedAt: bridge.evidencePayoffRevealedAt,
        revealCount: bridge.evidencePayoffRevealCount,
      }
    );
    return true;
  }

  function revealDenyEvidencePayoff(battle, trigger) {
    if (!battle || !ensureDenyEvidencePayoff(battle)) return false;
    const bridge = getBridgeState();
    const payoff = battle.meta && battle.meta.stage7DenyEvidencePayoff;
    if (!bridge || !payoff) return false;
    if (bridge.evidencePayoffStatus === "revealed") return true;
    if (bridge.evidencePayoffStatus === "expired") return false;
    if (battle.resolved === true || battle.finished === true || battle.status === "finished") return false;
    if (battle.status !== "pickDefense" || !battle.attack) return false;
    const trueColor = battle.attack._color || battle.attack.color || null;
    if (!trueColor) return false;

    battle.attack.color = trueColor;
    battle.attackHidden = false;
    battle.revealColor = trueColor;
    bridge.evidencePayoffStatus = "revealed";
    bridge.evidencePayoffRevealedAt = bridge.evidencePayoffRevealedAt || Date.now();
    bridge.evidencePayoffRevealCount = Math.max(1, bridge.evidencePayoffRevealCount + 1);
    payoff.status = "revealed";
    payoff.revealedAt = bridge.evidencePayoffRevealedAt;
    payoff.revealCount = bridge.evidencePayoffRevealCount;
    payoff.trigger = trigger === "held_manual" ? "held_manual" : "shared_auto";
    saveSnapshot();
    telemetry("first_experience.deny_evidence_payoff_revealed", {
      payoffId: DENY_EVIDENCE_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      mode: bridge.evidencePayoffMode,
      trigger: payoff.trigger,
      color: trueColor,
      revealCount: bridge.evidencePayoffRevealCount,
    });
    pushLine({
      system: true,
      text: bridge.evidencePayoffMode === "held"
        ? "Ты предъявил сохранённое доказательство. Цвет вброса Райхана раскрыт."
        : "Настя уже показала доказательство. Цвет вброса Райхана раскрыт.",
    });
    return true;
  }

  function initializeDenyEvidencePayoff(battle) {
    if (!ensureDenyEvidencePayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge) return false;
    saveSnapshot();
    if (bridge.evidencePayoffMode === "shared" && bridge.evidencePayoffStatus === "pending") {
      return revealDenyEvidencePayoff(battle, "shared_auto");
    }
    return true;
  }

  function revealHeldDenyEvidence(battleId) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureDenyEvidencePayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.evidencePayoffMode !== "held") return false;
    return revealDenyEvidencePayoff(battle, "held_manual");
  }


  function getAccuseKenPayoffMode() {
    if (!snapshot || snapshot.branchId !== "accuse_ken") return null;
    const memory = snapshot.npcMemory && snapshot.npcMemory.npc_stage7_ken
      ? snapshot.npcMemory.npc_stage7_ken
      : {};
    if (memory.publicRematchAccepted) return "public_rematch";
    if (memory.witnessRequested) return "witness";
    if (snapshot.followUpChoiceId === "primary") return "public_rematch";
    if (snapshot.followUpChoiceId === "secondary") return "witness";
    return null;
  }

  function syncAccuseKenPayoffMeta(battle) {
    const bridge = getBridgeState();
    if (!bridge || !battle || !battle.meta) return false;
    battle.meta.stage7AccuseKenPayoff = Object.assign(
      {},
      battle.meta.stage7AccuseKenPayoff || {},
      {
        payoffId: ACCUSE_KEN_PAYOFF_ID,
        mode: bridge.accusePayoffMode,
        status: bridge.accusePayoffStatus,
        appliedAt: bridge.accusePayoffAppliedAt,
        applyCount: bridge.accusePayoffApplyCount,
        previousDefenseIds: bridge.accusePayoffPreviousDefenseIds.slice(),
        defenseIds: bridge.accusePayoffDefenseIds.slice(),
        previousDefenseChoices: clone(bridge.accusePayoffPreviousDefenseChoices) || [],
        defenseChoices: clone(bridge.accusePayoffDefenseChoices) || [],
      }
    );
    return true;
  }

  function ensureAccuseKenPayoff(battle) {
    const bridge = getBridgeState();
    const mode = getAccuseKenPayoffMode();
    if (!bridge || !battle || !mode) return false;
    const battleId = battle.id || battle.battleId || null;
    const taggedBridgeBattle = !!(battle.meta
      && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID);
    if (!taggedBridgeBattle || !battleId
      || (bridge.battleId && bridge.battleId !== battleId)) return false;
    if (!bridge.accusePayoffMode) bridge.accusePayoffMode = mode;
    if (bridge.accusePayoffMode !== mode
      && !["used", "revealed", "expired"].includes(bridge.accusePayoffStatus)) {
      bridge.accusePayoffMode = mode;
    }
    if (bridge.accusePayoffStatus === "not_applicable") bridge.accusePayoffStatus = "pending";
    battle.meta = battle.meta && typeof battle.meta === "object" ? battle.meta : {};
    return syncAccuseKenPayoffMeta(battle);
  }

  function applyAccuseKenWitnessPayoff(battle) {
    if (!battle || !ensureAccuseKenPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "witness") return false;
    if (bridge.accusePayoffStatus === "expired") return false;
    if (battle.resolved === true || battle.finished === true || battle.status === "finished") return false;
    if (battle.status !== "pickDefense" || !battle.attack) return false;
    const trueColor = battle.attack._color || battle.attack.color || null;
    if (!trueColor) return false;
    if (bridge.accusePayoffStatus === "revealed") {
      battle.attack.color = trueColor;
      battle.attackHidden = false;
      battle.revealColor = trueColor;
      syncAccuseKenPayoffMeta(battle);
      return true;
    }

    battle.attack.color = trueColor;
    battle.attackHidden = false;
    battle.revealColor = trueColor;
    bridge.accusePayoffStatus = "revealed";
    bridge.accusePayoffAppliedAt = bridge.accusePayoffAppliedAt || Date.now();
    bridge.accusePayoffApplyCount = Math.max(1, bridge.accusePayoffApplyCount + 1);
    syncAccuseKenPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.accuse_ken_payoff_applied", {
      payoffId: ACCUSE_KEN_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      mode: bridge.accusePayoffMode,
      color: trueColor,
      applyCount: bridge.accusePayoffApplyCount,
    });
    pushLine({
      system: true,
      text: "Настя привела свидетеля. Цвет первого вброса Райхана раскрыт.",
    });
    return true;
  }

  function initializeAccuseKenPayoff(battle) {
    if (!ensureAccuseKenPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge) return false;
    saveSnapshot();
    if (bridge.accusePayoffMode === "witness") return applyAccuseKenWitnessPayoff(battle);
    return true;
  }

  function useAccuseKenRematchOptions(battleId, currentDefenseChoices, candidateChoices) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureAccuseKenPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "public_rematch" || bridge.accusePayoffStatus !== "pending") return false;
    if (battle.resolved === true || battle.finished === true || battle.status === "finished") return false;
    if (battle.status !== "pickDefense") return false;

    const previousChoices = sanitizeDefenseChoices(currentDefenseChoices).slice(0, 3);
    const candidates = sanitizeDefenseChoices(candidateChoices);
    if (previousChoices.length !== 3 || candidates.length < 3) return false;
    const previousFingerprints = new Set(previousChoices.map(defenseChoiceFingerprint).filter(Boolean));
    const selected = [];
    const selectedFingerprints = new Set();
    const appendChoice = (choice, requireNew) => {
      if (!choice || selected.length >= 3) return;
      const fingerprint = defenseChoiceFingerprint(choice);
      if (!fingerprint || selectedFingerprints.has(fingerprint)) return;
      if (requireNew && previousFingerprints.has(fingerprint)) return;
      selected.push(choice);
      selectedFingerprints.add(fingerprint);
    };
    candidates.forEach((choice) => appendChoice(choice, true));
    candidates.forEach((choice) => appendChoice(choice, false));
    if (selected.length !== 3) return false;
    if (!selected.some((choice) => !previousFingerprints.has(defenseChoiceFingerprint(choice)))) return false;

    bridge.accusePayoffStatus = "used";
    bridge.accusePayoffAppliedAt = bridge.accusePayoffAppliedAt || Date.now();
    bridge.accusePayoffApplyCount = Math.max(1, bridge.accusePayoffApplyCount + 1);
    bridge.accusePayoffPreviousDefenseChoices = clone(previousChoices) || [];
    bridge.accusePayoffDefenseChoices = clone(selected) || [];
    bridge.accusePayoffPreviousDefenseIds = previousChoices.map((choice) => choice.id);
    bridge.accusePayoffDefenseIds = selected.map((choice) => choice.id);
    syncAccuseKenPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.accuse_ken_payoff_applied", {
      payoffId: ACCUSE_KEN_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      mode: bridge.accusePayoffMode,
      previousDefenseIds: bridge.accusePayoffPreviousDefenseIds.slice(),
      defenseIds: bridge.accusePayoffDefenseIds.slice(),
      applyCount: bridge.accusePayoffApplyCount,
    });
    pushLine({
      system: true,
      text: "Ты принял публичный реванш и один раз сменил варианты ответа.",
    });
    return true;
  }

  function chooseAccuseKenRematchDefenseChoices(battleId) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureAccuseKenPayoff(battle)) return null;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "public_rematch" || bridge.accusePayoffStatus !== "used") return null;
    const saved = sanitizeDefenseChoices(bridge.accusePayoffDefenseChoices).slice(0, 3);
    if (saved.length !== 3) return null;
    bridge.accusePayoffDefenseChoices = clone(saved) || [];
    bridge.accusePayoffDefenseIds = saved.map((choice) => choice.id);
    syncAccuseKenPayoffMeta(battle);
    return clone(saved);
  }

  function chooseAccuseKenRematchDefenseIds(battleId) {
    const choices = chooseAccuseKenRematchDefenseChoices(battleId);
    return Array.isArray(choices) ? choices.map((choice) => choice.id) : null;
  }

  function normalizePayArgumentGroup(value) {
    const raw = value && (value.group || value.type || value.qtype || value.kind || value.questionType);
    const normalized = String(raw || "").trim().toLowerCase();
    if (["yesno", "yes-no", "yes_no", "да/нет", "да-нет"].includes(normalized)) return "yn";
    if (["topic", "о чем", "о-чем", "о_чем"].includes(normalized)) return "about";
    if (["what", "who/what", "who-what", "кто", "что", "кто/что", "кто-что"].includes(normalized)) return "who";
    return normalized;
  }

  function getPayPayoffMode() {
    if (!snapshot || snapshot.branchId !== "pay") return null;
    const memory = snapshot.npcMemory && snapshot.npcMemory.npc_bandit
      ? snapshot.npcMemory.npc_bandit
      : {};
    if (memory.receiptDemanded) return "receipt";
    if (memory.pressureIgnored) return "pressure";
    if (snapshot.followUpChoiceId === "primary") return "receipt";
    if (snapshot.followUpChoiceId === "secondary") return "pressure";
    return null;
  }

  function syncPayPayoffMeta(battle) {
    const bridge = getBridgeState();
    if (!bridge || !battle) return false;
    battle.meta = battle.meta && typeof battle.meta === "object" ? battle.meta : {};
    battle.meta.stage7PayPayoff = Object.assign({}, battle.meta.stage7PayPayoff || {}, {
      payoffId: PAY_PAYOFF_ID,
      mode: bridge.payPayoffMode,
      status: bridge.payPayoffStatus,
      appliedAt: bridge.payPayoffAppliedAt,
      applyCount: bridge.payPayoffApplyCount,
      defenseChoices: clone(bridge.payPayoffDefenseChoices) || [],
      markedDefenseId: bridge.payPayoffMarkedDefenseId,
      markedFingerprint: bridge.payPayoffMarkedFingerprint,
    });
    return true;
  }

  function ensurePayPayoff(battle) {
    const bridge = getBridgeState();
    const mode = getPayPayoffMode();
    if (!bridge || !battle || !mode) return false;
    const battleId = battle.id || battle.battleId || null;
    const taggedBridgeBattle = !!(battle.meta
      && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID);
    if (!taggedBridgeBattle || !battleId
      || (bridge.battleId && bridge.battleId !== battleId)) return false;
    if (!bridge.payPayoffMode) bridge.payPayoffMode = mode;
    if (bridge.payPayoffMode !== mode
      && !["marked", "used", "expired"].includes(bridge.payPayoffStatus)) {
      bridge.payPayoffMode = mode;
    }
    if (bridge.payPayoffStatus === "not_applicable") bridge.payPayoffStatus = "pending";
    return syncPayPayoffMeta(battle);
  }

  function choosePayDefenseChoices(battleId) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensurePayPayoff(battle)) return null;
    const bridge = getBridgeState();
    if (!bridge || !["receipt", "pressure"].includes(bridge.payPayoffMode)) return null;
    const saved = sanitizeDefenseChoices(bridge.payPayoffDefenseChoices).slice(0, 3);
    if (saved.length !== 3) return null;
    bridge.payPayoffDefenseChoices = clone(saved) || [];
    syncPayPayoffMeta(battle);
    return clone(saved);
  }

  function preparePayDefenseChoices(battleId, currentDefenseChoices) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensurePayPayoff(battle)) return null;
    const bridge = getBridgeState();
    if (!bridge || battle.status !== "pickDefense"
      || battle.resolved === true || battle.finished === true) return null;

    const alreadySaved = sanitizeDefenseChoices(bridge.payPayoffDefenseChoices).slice(0, 3);
    if (alreadySaved.length === 3) {
      bridge.payPayoffDefenseChoices = clone(alreadySaved) || [];
      syncPayPayoffMeta(battle);
      return clone(alreadySaved);
    }

    const choices = sanitizeDefenseChoices(currentDefenseChoices).slice(0, 3);
    if (choices.length !== 3) return null;
    bridge.payPayoffDefenseChoices = clone(choices) || [];

    if (bridge.payPayoffMode === "receipt" && bridge.payPayoffStatus === "pending") {
      const attackGroup = normalizePayArgumentGroup(battle.attack);
      const matching = choices.find((choice) => normalizePayArgumentGroup(choice) === attackGroup) || null;
      if (!matching) return null;
      bridge.payPayoffStatus = "marked";
      bridge.payPayoffAppliedAt = bridge.payPayoffAppliedAt || Date.now();
      bridge.payPayoffApplyCount = Math.max(1, bridge.payPayoffApplyCount + 1);
      bridge.payPayoffMarkedDefenseId = matching.id;
      bridge.payPayoffMarkedFingerprint = defenseChoiceFingerprint(matching);
      telemetry("first_experience.pay_payoff_applied", {
        payoffId: PAY_PAYOFF_ID,
        battleId,
        mode: bridge.payPayoffMode,
        markedDefenseId: matching.id,
        applyCount: bridge.payPayoffApplyCount,
      });
      pushLine({
        system: true,
        text: "Расписка Олега помогла отделить подходящий по типу ответ.",
      });
    }

    syncPayPayoffMeta(battle);
    saveSnapshot();
    return clone(choices);
  }

  function usePayPressureAnalysis(battleId, currentDefenseChoices) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensurePayPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.payPayoffMode !== "pressure" || bridge.payPayoffStatus !== "pending") return false;
    if (battle.status !== "pickDefense" || battle.resolved === true || battle.finished === true) return false;

    const choices = sanitizeDefenseChoices(currentDefenseChoices).slice(0, 3);
    if (choices.length !== 3) return false;
    const attackGroup = normalizePayArgumentGroup(battle.attack);
    const wrong = choices.find((choice) => normalizePayArgumentGroup(choice) !== attackGroup) || null;
    if (!wrong) return false;

    bridge.payPayoffStatus = "used";
    bridge.payPayoffAppliedAt = bridge.payPayoffAppliedAt || Date.now();
    bridge.payPayoffApplyCount = Math.max(1, bridge.payPayoffApplyCount + 1);
    bridge.payPayoffDefenseChoices = clone(choices) || [];
    bridge.payPayoffMarkedDefenseId = wrong.id;
    bridge.payPayoffMarkedFingerprint = defenseChoiceFingerprint(wrong);
    syncPayPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.pay_payoff_applied", {
      payoffId: PAY_PAYOFF_ID,
      battleId,
      mode: bridge.payPayoffMode,
      markedDefenseId: wrong.id,
      applyCount: bridge.payPayoffApplyCount,
    });
    pushLine({
      system: true,
      text: "Ты разобрал давление Олега и заметил один ответ, который не подходит к типу вброса.",
    });
    return true;
  }

  function initializePayPayoff(battle) {
    if (!ensurePayPayoff(battle)) return false;
    saveSnapshot();
    return true;
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
    initializeDenyEvidencePayoff(battle);
    initializeAccuseKenPayoff(battle);
    initializePayPayoff(battle);
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
    if (realBattleBridgeInFlight) return true;
    realBattleBridgeInFlight = true;
    try {

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
    } finally {
      realBattleBridgeInFlight = false;
    }
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

  function releaseNormalWorldOnce(options) {
    setControlledMode(false);
    const preservePanel = !!(options && options.preservePanel === true);
    const panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel && !preservePanel) panel.remove();
    if (normalWorldReleased) return;
    normalWorldReleased = true;
    if (context && typeof context.startNormalWorld === "function") context.startNormalWorld();
  }

  function settleBranchFollowUp(choiceId) {
    if (!snapshot
      || snapshot.stateId !== "round_two"
      || !snapshot.worldAdvancePresented
      || snapshot.worldAdvanceSettled
      || snapshot.followUpSettled) return false;
    const offer = BRANCH_FOLLOW_UPS[snapshot.branchId];
    if (!offer || !["primary", "secondary"].includes(choiceId)) return false;
    const memory = choiceId === "primary" ? offer.primaryMemory : offer.secondaryMemory;
    snapshot.followUpChoiceId = choiceId;
    snapshot.followUpSettled = true;
    snapshot.branchFollowUpPending = false;
    snapshot.awaitingWorldAdvance = false;
    snapshot.worldAdvanceSettled = true;
    snapshot.worldAdvancePresented = false;
    snapshot.stateId = "round_two_result";
    snapshot.npcMemory[offer.memoryTarget] = Object.assign(
      {},
      snapshot.npcMemory[offer.memoryTarget] || {},
      memory
    );
    ensureScenarioPlayers();
    if (TEST_MODE && snapshot.evidence) snapshot.evidence.worldAdvanceSettledCount += 1;
    saveSnapshot();
    telemetry("first_experience.round_two_settled", {
      branchId: snapshot.branchId,
      choiceId,
      worldAdvanceId: snapshot.worldAdvanceId,
    });
    render();
    return true;
  }

  function talkToIntermissionNpc(npcId) {
    if (!snapshot || snapshot.stateId !== "intermission") return false;
    const npc = getIntermissionNpc(npcId);
    if (!npc) return false;
    snapshot.intermissionNpcVisits = snapshot.intermissionNpcVisits || {};
    snapshot.intermissionNpcVisits[npc.id] = (Number(snapshot.intermissionNpcVisits[npc.id]) | 0) + 1;
    const text = getIntermissionLine(npc);
    snapshot.intermissionNpcMessage = { npcId: npc.id, name: npc.name, text, at: Date.now() };
    saveSnapshot();
    pushLine({ name: npc.name, text });
    telemetry("first_experience.intermission_npc_talked", {
      npcId: npc.id,
      visit: snapshot.intermissionNpcVisits[npc.id],
      branchId: snapshot.branchId,
    });
    render();
    return true;
  }

  function openOnboardingQuestionnaire() {
    if (!snapshot || snapshot.stateId !== "round_two_result" || !snapshot.followUpSettled) return false;
    snapshot.roundTwoResultAcknowledged = true;
    snapshot.stateId = "questionnaire";
    snapshot.evidence = snapshot.evidence || defaultEvidence();
    snapshot.evidence.questionnaireOpen = true;
    snapshot.evidence.questionIndex = 0;
    snapshot.evidence.answers = {};
    snapshot.evidence.answersComplete = false;
    saveSnapshot();
    telemetry("first_experience.questionnaire_opened", {
      branchId: snapshot.branchId,
      secondRoundChoiceId: snapshot.followUpChoiceId,
    });
    render();
    return true;
  }

  function answerOnboardingQuestion(questionId, answerId) {
    if (!snapshot || snapshot.stateId !== "questionnaire" || !snapshot.evidence || !snapshot.evidence.questionnaireOpen) return false;
    const questions = evidenceQuestions();
    const question = questions[snapshot.evidence.questionIndex];
    if (!question || question.id !== questionId || !question.options.some((option) => option.id === answerId)) return false;
    snapshot.evidence.answers[question.id] = answerId;
    snapshot.evidence.questionIndex += 1;
    if (snapshot.evidence.questionIndex < questions.length) {
      saveSnapshot();
      render();
      return true;
    }
    snapshot.evidence.answersComplete = true;
    snapshot.evidence.questionnaireOpen = false;
    snapshot.evidence.completedAt = Date.now();
    snapshot.evidence.cycleCompletedAt = snapshot.evidence.completedAt;
    snapshot.evidence.cycleMs = Math.max(0, snapshot.evidence.completedAt - snapshot.evidence.startedAt);
    snapshot.evidence.comprehensionScore = questions.reduce(
      (score, item) => score + (snapshot.evidence.answers[item.id] === item.correct ? 1 : 0),
      0
    );
    snapshot.onboardingUnlocked = true;
    snapshot.unlockedAt = Date.now();
    snapshot.stateId = "main_unlocked";
    snapshot.realBattleBridge = Object.assign(defaultRealBattleBridge(), {
      status: "pending",
      branchId: snapshot.branchId,
      secondRoundChoiceId: snapshot.followUpChoiceId,
      queuedAt: Date.now(),
    });
    saveSnapshot();
    if (TEST_MODE) {
      snapshot.evidence.finalReport = getObservedEvidenceReport();
      saveSnapshot();
    }
    telemetry("first_experience.questionnaire_completed", {
      score: snapshot.evidence.comprehensionScore,
      total: questions.length,
      branchId: snapshot.branchId,
      secondRoundChoiceId: snapshot.followUpChoiceId,
    });
    telemetry("first_experience.full_game_unlocked", { branchId: snapshot.branchId });
    releaseNormalWorldOnce();
    if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
    return true;
  }

  function runAction(action, button) {
    if (!snapshot) return;
    if (action === "open-answer" && snapshot.stateId === "accusation") {
      markEvidenceFirstAction();
      snapshot.stateId = "answer";
      saveSnapshot();
      telemetry("first_experience.answer_opened");
      render();
    } else if (action === "choose" && snapshot.stateId === "answer") {
      const branchId = button && button.getAttribute("data-branch");
      if (!RESPONSE_IDS.includes(branchId)) return;
      snapshot.branchId = branchId;
      if (snapshot.evidence) snapshot.evidence.branchId = branchId;
      snapshot.selectedAt = Date.now();
      snapshot.stateId = "reaction";
      saveSnapshot();
      pushLine({ name: context && context.playerName || "Игрок", text: BRANCHES[branchId].player });
      telemetry("first_experience.answer_selected", { branchId });
      render();
    } else if (action === "show-reaction" && snapshot.stateId === "reaction") {
      pushLine({ name: "Настя", text: BRANCHES[snapshot.branchId].reaction });
      snapshot.stateId = "vote";
      saveSnapshot();
      telemetry("first_experience.reaction_shown", { branchId: snapshot.branchId });
      render();
    } else if (action === "start-vote" && snapshot.stateId === "vote" && snapshot.voteStep < 5) {
      snapshot.voteStarted = true;
      saveSnapshot();
      telemetry("first_experience.vote_started", { branchId: snapshot.branchId });
      render();
      scheduleVoteStep();
    } else if (action === "accept-consequence" && snapshot.stateId === "vote" && snapshot.voteStep >= 5) {
      if (!applySettlement()) return;
      snapshot.stateId = "consequence";
      saveSnapshot();
      telemetry("first_experience.consequence_shown", { branchId: snapshot.branchId });
      render();
    } else if (action === "accept-rematch" && snapshot.stateId === "consequence") {
      snapshot.stateId = "rematch";
      saveSnapshot();
      telemetry("first_experience.rematch_shown", { branchId: snapshot.branchId });
      render();
    } else if (action === "explore-world" && snapshot.stateId === "rematch") {
      completeCycle();
    } else if (action === "talk-intermission-npc" && snapshot.stateId === "intermission") {
      talkToIntermissionNpc(button && button.getAttribute("data-intermission-npc"));
    } else if (action === "resolve-branch-follow-up" && snapshot.stateId === "round_two") {
      settleBranchFollowUp(button && button.getAttribute("data-follow-up"));
    } else if (action === "open-onboarding-questionnaire" && snapshot.stateId === "round_two_result") {
      openOnboardingQuestionnaire();
    } else if (action === "answer-evidence-question" && snapshot.stateId === "questionnaire") {
      answerOnboardingQuestion(
        button && button.getAttribute("data-evidence-question"),
        button && button.getAttribute("data-evidence-answer")
      );
    } else if (action === "acknowledge-first-battle-aftermath" && snapshot.onboardingUnlocked) {
      acknowledgeFirstBattleAftermath();
    } else if (action === "open-aftermath-dm-contact" && snapshot.onboardingUnlocked) {
      openFirstBattleAftermathDmContact();
    }
  }

  function onPanelClick(event) {
    const button = event.target && event.target.closest ? event.target.closest("button[data-stage7-action]") : null;
    if (!button || interactionLock) return;
    event.preventDefault();
    interactionLock = true;
    button.disabled = true;
    try { runAction(button.getAttribute("data-stage7-action"), button); }
    finally { interactionLock = false; }
  }

  function schedulerTick() {
    if (!snapshot || !context) return;
    syncRealArgumentBattleLifecycle();
    const nowMono = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    if (!lastTickAt) lastTickAt = nowMono;
    if (!document.hidden && !snapshot.preludeComplete) {
      const delta = Math.max(0, Math.min(1000, nowMono - lastTickAt));
      snapshot.foregroundElapsedMs += delta;
      const due = PRELUDE.find((entry) => !snapshot.shownMessageIds.includes(entry.id) && snapshot.foregroundElapsedMs >= entry.at);
      if (due && Date.now() >= nextPreludeEligibleAt) {
        emitPrelude(due);
        nextPreludeEligibleAt = Date.now() + PRELUDE_MIN_GAP_MS;
      }
      saveSnapshot();
    }
    lastTickAt = nowMono;
    const roundTwoDue = snapshot.stateId === "intermission"
      && snapshot.awaitingWorldAdvance
      && !snapshot.worldAdvanceSettled
      && !snapshot.worldAdvancePresented
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (!document.hidden && roundTwoDue) {
      presentWorldAdvance("foreground");
      return;
    }
    if (!document.hidden && snapshot.stateId === "intermission") {
      const second = Math.max(0, Math.ceil((Number(snapshot.worldAdvanceDueAt || 0) - Date.now()) / 1000));
      if (second !== lastIntermissionSecond) {
        lastIntermissionSecond = second;
        render();
      }
    }
  }

  function startScheduler() {
    if (scheduler) return;
    lastTickAt = 0;
    scheduler = setInterval(schedulerTick, 250);
    if (!visibilityBound) {
      document.addEventListener("visibilitychange", () => {
        lastTickAt = 0;
        lastIntermissionSecond = null;
        if (!snapshot) return;
        if (document.hidden) {
          snapshot.lastHiddenAt = Date.now();
          saveSnapshot();
          return;
        }
        const due = snapshot.stateId === "intermission"
          && snapshot.awaitingWorldAdvance
          && !snapshot.worldAdvanceSettled
          && !snapshot.worldAdvancePresented
          && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
        if (due) {
          presentWorldAdvance("return");
        } else {
          snapshot.lastHiddenAt = null;
          saveSnapshot();
          render();
        }
      });
      visibilityBound = true;
    }
  }

  function attach(nextContext) {
    context = nextContext || {};
    normalWorldReleased = false;
    ensureScenarioPlayers();
    startScheduler();
    if (snapshot && snapshot.stateId === "vote" && snapshot.voteStarted && snapshot.voteStep < 5) scheduleVoteStep();
    render();
  }

  function claimFreshStart(nextContext) {
    const existing = loadSnapshot();
    if (existing && existing.onboardingUnlocked) {
      const bridge = sanitizeRealBattleBridge(existing.realBattleBridge);
      const resumeState = nextContext && nextContext.state
        ? nextContext.state
        : (G.__S || G.State || null);
      const resumedBattle = resumeState && Array.isArray(resumeState.battles)
        ? resumeState.battles.find((battle) => battle && (
          (battle.meta && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID)
          || (bridge.battleId && (battle.id === bridge.battleId || battle.battleId === bridge.battleId))
        ))
        : null;
      if (bridge.status === "created" && resumedBattle) {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        initializeDenyEvidencePayoff(resumedBattle);
        releaseNormalWorldOnce();
        syncRealArgumentBattleLifecycle();
        return { claimed: true, mode: "battle_bridge_active_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
      }
      if (bridge.status === "created" && !resumedBattle) {
        bridge.status = "pending";
        bridge.battleId = null;
        bridge.attemptCount = 0;
        bridge.lastFailureReason = "created_battle_missing_after_resume";
      }
      if (bridge.status === "pending") {
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
      if (bridge.status === "completed"
        && bridge.aftermathStatus === "acknowledged"
        && ["pending", "delivered"].includes(bridge.aftermathDmStatus)) {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        return {
          claimed: true,
          mode: "battle_aftermath_dm_contact_resume",
          stateId: snapshot.stateId,
          releaseNormalWorld: () => releaseNormalWorldOnce({ preservePanel: true }),
        };
      }
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    snapshot = existing || defaultSnapshot();
    attach(nextContext);
    telemetry("first_experience.entry_opened", { mode: existing ? "fresh_resume" : "fresh" });
    telemetry("first_experience.year_submitted");
    if (!snapshot.preludeComplete) telemetry("first_experience.prelude_started");
    return { claimed: true, mode: existing ? "fresh_resume" : "fresh", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
  }

  function claimResume(nextContext) {
    const existing = loadSnapshot();
    if (existing && existing.onboardingUnlocked) {
      const bridge = sanitizeRealBattleBridge(existing.realBattleBridge);
      const resumeState = nextContext && nextContext.state
        ? nextContext.state
        : (G.__S || G.State || null);
      const resumedBattle = resumeState && Array.isArray(resumeState.battles)
        ? resumeState.battles.find((battle) => battle && (
          (battle.meta && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID)
          || (bridge.battleId && (battle.id === bridge.battleId || battle.battleId === bridge.battleId))
        ))
        : null;
      if (bridge.status === "created" && resumedBattle) {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        releaseNormalWorldOnce();
        syncRealArgumentBattleLifecycle();
        return { claimed: true, mode: "battle_bridge_active_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
      }
      if (bridge.status === "created" && !resumedBattle) {
        bridge.status = "pending";
        bridge.battleId = null;
        bridge.attemptCount = 0;
        bridge.lastFailureReason = "created_battle_missing_after_resume";
      }
      if (bridge.status === "pending") {
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
      if (bridge.status === "completed"
        && bridge.aftermathStatus === "acknowledged"
        && ["pending", "delivered"].includes(bridge.aftermathDmStatus)) {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        return {
          claimed: true,
          mode: "battle_aftermath_dm_contact_resume",
          stateId: snapshot.stateId,
          releaseNormalWorld: () => releaseNormalWorldOnce({ preservePanel: true }),
        };
      }
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    const migratedLegacySave = !existing;
    snapshot = existing || defaultSnapshot();
    attach(nextContext);
    const dueOnReturn = snapshot.stateId === "intermission"
      && snapshot.awaitingWorldAdvance
      && !snapshot.worldAdvancePresented
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (dueOnReturn) presentWorldAdvance("return");
    telemetry("first_experience.entry_opened", { mode: migratedLegacySave ? "legacy_resume_migration" : "resume" });
    if (migratedLegacySave) {
      telemetry("first_experience.legacy_save_migrated");
      telemetry("first_experience.prelude_started");
    }
    return {
      claimed: true,
      mode: migratedLegacySave ? "legacy_resume_migration" : "resume",
      stateId: snapshot.stateId,
      releaseNormalWorld: releaseNormalWorldOnce,
    };
  }

  function isPending() {
    const current = snapshot || loadSnapshot();
    if (!current) return false;
    if (!current.onboardingUnlocked) return true;
    const bridge = sanitizeRealBattleBridge(current.realBattleBridge);
    return bridge.status === "completed" && (
      bridge.aftermathStatus === "pending"
      || (bridge.aftermathStatus === "acknowledged"
        && ["pending", "delivered"].includes(bridge.aftermathDmStatus))
    );
  }

  function getSnapshot() {
    return clone(snapshot || loadSnapshot());
  }

  function resetForDev() {
    destroy();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    snapshot = null;
    const panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel) panel.remove();
    setControlledMode(false);
    return true;
  }

  function advanceForegroundForDev(ms) {
    if (!snapshot) snapshot = loadSnapshot();
    if (!snapshot) return null;
    snapshot.foregroundElapsedMs += Math.max(0, Number(ms) || 0);
    PRELUDE.forEach((entry) => {
      if (!snapshot.shownMessageIds.includes(entry.id) && snapshot.foregroundElapsedMs >= entry.at) emitPrelude(entry);
    });
    saveSnapshot();
    render();
    return getSnapshot();
  }

  function settleWorldAdvanceForDev(mode) {
    if (!snapshot) snapshot = loadSnapshot();
    if (!snapshot || snapshot.stateId !== "intermission") return false;
    snapshot.worldAdvanceDueAt = Date.now() - 1;
    saveSnapshot();
    return presentWorldAdvance(mode === "return" ? "return" : "foreground");
  }

  function completeRoundOneForDev(branchId) {
    if (!snapshot) snapshot = defaultSnapshot();
    if (!RESPONSE_IDS.includes(branchId)) return false;
    snapshot.preludeComplete = true;
    snapshot.branchId = branchId;
    snapshot.stateId = "rematch";
    snapshot.settlementId = `dev_settlement:${branchId}:${Date.now()}`;
    snapshot.settled = true;
    if (snapshot.evidence) {
      snapshot.evidence.branchId = branchId;
      snapshot.evidence.settlementAppliedCount = 1;
      snapshot.evidence.firstActionAt = snapshot.evidence.firstActionAt || Date.now();
      snapshot.evidence.firstActionMs = snapshot.evidence.firstActionMs == null ? 1 : snapshot.evidence.firstActionMs;
    }
    completeCycle();
    return true;
  }

  function resolveRoundTwoForDev(choiceId) {
    return settleBranchFollowUp(choiceId);
  }

  function openQuestionsForDev() {
    return openOnboardingQuestionnaire();
  }

  function answerCurrentQuestionCorrectForDev() {
    if (!snapshot || !snapshot.evidence) return false;
    const question = evidenceQuestions()[snapshot.evidence.questionIndex];
    if (!question) return false;
    return answerOnboardingQuestion(question.id, question.correct);
  }

  function talkIntermissionNpcForDev(npcId) {
    return talkToIntermissionNpc(npcId);
  }

  function destroy() {
    if (scheduler) clearInterval(scheduler);
    if (voteTimer) clearTimeout(voteTimer);
    if (realBattleBridgeTimer) clearTimeout(realBattleBridgeTimer);
    scheduler = null;
    voteTimer = null;
    realBattleBridgeTimer = null;
    realBattleBridgeInFlight = false;
    context = null;
    lastTickAt = 0;
    nextPreludeEligibleAt = 0;
    lastIntermissionSecond = null;
  }

  G.Stage7FirstExperience = {
    claimFreshStart,
    claimResume,
    isPending,
    getSnapshot,
    getObservedEvidenceReport,
    revealHeldDenyEvidence,
    useAccuseKenRematchOptions,
    chooseAccuseKenRematchDefenseChoices,
    chooseAccuseKenRematchDefenseIds,
    preparePayDefenseChoices,
    choosePayDefenseChoices,
    usePayPressureAnalysis,
    acknowledgeFirstBattleAftermath,
    getFirstBattleAftermathRecord,
    getFirstBattleAftermathDmRecord,
    getFirstBattleAftermathDmContactRecord,
    openFirstBattleAftermathDmContact,
    restoreFirstBattleAftermathDmHistory,
    deliverFirstBattleAftermathDm,
    installFirstBattleAftermathDmHook,
    resetForDev,
    advanceForegroundForDev,
    destroy,
  };

  if (!G.__DEV || typeof G.__DEV !== "object") G.__DEV = {};
  G.__DEV.getStage7FirstExperienceSnapshot = getSnapshot;
  G.__DEV.getStage7ObservedEvidenceReport = getObservedEvidenceReport;
  G.__DEV.resetStage7FirstExperience = resetForDev;
  G.__DEV.advanceStage7FirstExperienceForeground = advanceForegroundForDev;
  G.__DEV.completeStage7RoundOne = completeRoundOneForDev;
  G.__DEV.settleStage7Intermission = settleWorldAdvanceForDev;
  G.__DEV.talkStage7IntermissionNpc = talkIntermissionNpcForDev;
  G.__DEV.resolveStage7RoundTwo = resolveRoundTwoForDev;
  G.__DEV.openStage7Questions = openQuestionsForDev;
  G.__DEV.answerStage7CurrentQuestionCorrect = answerCurrentQuestionCorrectForDev;
  G.__DEV.runStage7RealArgumentBattleBridge = attemptRealArgumentBattleBridge;
  G.__DEV.syncStage7RealArgumentBattleLifecycle = syncRealArgumentBattleLifecycle;
  G.__DEV.getStage7FirstBattleAftermath = getFirstBattleAftermathRecord;
  G.__DEV.acknowledgeStage7FirstBattleAftermath = acknowledgeFirstBattleAftermath;
  G.__DEV.getStage7FirstBattleAftermathDm = getFirstBattleAftermathDmRecord;
  G.__DEV.getStage7FirstBattleAftermathDmContact = getFirstBattleAftermathDmContactRecord;
  G.__DEV.openStage7FirstBattleAftermathDmContact = openFirstBattleAftermathDmContact;
  G.__DEV.restoreStage7FirstBattleAftermathDmHistory = restoreFirstBattleAftermathDmHistory;
  G.__DEV.deliverStage7FirstBattleAftermathDm = deliverFirstBattleAftermathDm;
  G.__DEV.installStage7FirstBattleAftermathDmHook = installFirstBattleAftermathDmHook;
  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;
  G.__DEV.useStage7AccuseKenRematchOptions = useAccuseKenRematchOptions;
  G.__DEV.chooseStage7AccuseKenRematchDefenseChoices = chooseAccuseKenRematchDefenseChoices;
  G.__DEV.chooseStage7AccuseKenRematchDefenseIds = chooseAccuseKenRematchDefenseIds;
  G.__DEV.getStage7IntermissionNpcIds = () => INTERMISSION_NPCS.map((npc) => npc.id);
  installFirstBattleAftermathDmHook();
  G.__DEV.smokeStage7FirstCausalVerticalSlice = () => ({
    ok: !!G.Stage7FirstExperience,
    storageKey: STORAGE_KEY,
    scenarioId: SCENARIO_ID,
    states: STATES.slice(),
    responses: RESPONSE_IDS.slice(),
    worldAdvanceDelayMs: WORLD_ADVANCE_DELAY_MS,
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
    continuationStateEvidence: true,
    stage: "7.14",
    onboardingFlowVersion: ONBOARDING_FLOW_VERSION,
    intermissionDelayMs: INTERMISSION_DELAY_MS,
    limitedNpcCount: INTERMISSION_NPCS.length,
    secondRoundBeforeQuestions: true,
    fullUnlockAfterQuestions: true,
    realArgumentBattleBridgePending: false,
    realArgumentBattleBridgeId: REAL_BATTLE_BRIDGE_ID,
    denyEvidencePayoffId: DENY_EVIDENCE_PAYOFF_ID,
    denyEvidenceSharedAutoReveal: true,
    denyEvidenceHeldManualReveal: true,
    accuseKenPayoffId: ACCUSE_KEN_PAYOFF_ID,
    accuseKenPublicRematchDefenseRefresh: true,
    accuseKenWitnessAutoReveal: true,
    firstBattleAftermathId: FIRST_BATTLE_AFTERMATH_ID,
    firstBattleAftermathPersisted: true,
    firstBattleAftermathNonBlocking: true,
    firstBattleAftermathExactlyOnce: true,
    firstBattleAftermathDmFollowUpId: FIRST_BATTLE_AFTERMATH_DM_ID,
    firstBattleAftermathDmTargetBound: true,
    firstBattleAftermathDmExactlyOnce: true,
    firstBattleAftermathDmRefreshSafe: true,
    firstBattleAftermathDmContactId: FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID,
    firstBattleAftermathDmContactDurable: true,
    firstBattleAftermathDmContactNoAutoOpen: true,
    firstBattleAftermathDmHistoryRestoredOnDemand: true,
  });
})();
