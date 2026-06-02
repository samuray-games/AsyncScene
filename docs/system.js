// system.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;

  const REQUIRED_SYSTEM_COPY_GROUPS = Object.freeze(["errors", "warnings", "notifications", "systemEvents"]);
  const SYSTEM_COPY_KIND_ALIASES = Object.freeze({
    error: "errors",
    errors: "errors",
    warning: "warnings",
    warnings: "warnings",
    notification: "notifications",
    notifications: "notifications",
    event: "systemEvents",
    events: "systemEvents",
    systemEvent: "systemEvents",
    systemEvents: "systemEvents",
    "system event": "systemEvents",
    "system events": "systemEvents",
    system_event: "systemEvents",
    system_events: "systemEvents",
  });

  const SYSTEM_DEFAULT_LOCALE = "ru";
  const SYSTEM_SUPPORTED_LOCALES = Object.freeze(["ru"]);

  const SYSTEM_COPY_RU = Object.freeze({
    errors: Object.freeze({
      missingMessage: "Сообщение недоступно.",
      insufficientPoints: "Не хватает 💰.",
      pointsLowBattle: "Не получилось: мало 💰 на баттл.",
      unavailable: "Недоступно.",
      notFound: "Не найдено.",
      choosePlayer: "Выбери игрока.",
      reportFalsePenalty: "Не получилось. Штраф: -5 💰.",
    }),
    warnings: Object.freeze({
      checkInput: "Проверь ввод и попробуй ещё раз.",
      cooldownShort: "Подожди немного.",
      alreadyVoted: "Уже принято.",
      respectPairDaily: "Уважение сегодня уже отправлено этому персонажу.",
      respectNoChain: "Цепочка туда-обратно сегодня недоступна.",
      respectEmitterEmpty: "Уважение сегодня недоступно.",
      escapeNeedsPoints: "Не хватает 💰, чтобы Свалить.",
    }),
    notifications: Object.freeze({
      saved: "Сохранено.",
      pointsDeltaPlusOne: "+1💰",
      repDeltaPlusOne: "+1⭐",
      pointsDeltaVoteCost: "-{voteCost}💰",
      respectPaid: "Списано 1💰.",
      respectTargetRep: "Цель получила +1⭐.",
      voteAccepted: "Принято. Голос учтён.",
      reportPending: "Проверка идёт.",
      reportTrueReward: "Засчитано. Сдать {name}: +2💰.",
      trainingSent: "Обучение аргументу: {teacher} → {student}.",
      rematchRequested: "Реванш доступен: {name} снова зовёт в баттл.",
      escapePaid: "Свалить за 1💰.",
      pointsDeltaRefund: "+1💰 возвращено.",
      pointsDeltaRefundMajority: "+1💰 возврат большинству.",
      pointsDeltaRemainderWin: "+1💰 остаток победителю.",
      rematchCost: "Реванш: -{rematchCost}💰.",
      escapeVoteCost: "Свалить: -{escapeCost}💰.",
    }),
    systemEvents: Object.freeze({
      ready: "Система готова.",
      dmReaction: "{name} обменялся(ась) реакцией с {target}.",
      dmInvite: "{name} позвал(а) {guest} в личку к {target}.",
      joined: "{name} на площади. Событие началось.",
      moved: "Переход выполнен: {location}.",
      battleChallenge: "{attackerName} [{attackerInf}] вызвал(а) тебя на баттл. Открой баттл сверху.",
      npcBattleStart: "Баттл начался: {a} вызывает {b}.",
      battleWin: "Победил(а) {winner}. {loser} проиграл(а).",
      battleDraw: "Ничья. {a} и {b} разошлись.",
      crowdStart: "Голосование толпы началось.",
      crowdResolved: "Голосование толпы завершено. Победил(а) {name}: {aVotes}:{bVotes}.",
      unlockOrange: "Оранжевые аргументы доступны.",
      unlockRed: "Красные аргументы доступны.",
      unlockBlack: "Чёрные аргументы доступны.",
    }),
  });

  const SYSTEM_COPY_LOCALES = Object.freeze({
    ru: SYSTEM_COPY_RU,
  });
  const SystemCopy = SYSTEM_COPY_RU;

  const SYSTEM_TEXT_TEMPLATES_RU = Object.freeze({
    errors: Object.freeze({
      blockedWithHint: "Не получилось: {what}. {hint}",
      unavailableWithHint: "Недоступно: {what}. {hint}",
      needsValue: "Нужно: {what}. {hint}",
    }),
    warnings: Object.freeze({
      actionOption: "{what}. {option}",
      waitOption: "{what}. Можно позже.",
      noEffectOption: "{what}. {option}",
    }),
    notifications: Object.freeze({
      fact: "{what}",
      savedValue: "{what}: {value}",
      delta: "{what} {value}",
    }),
    systemEvents: Object.freeze({
      value: "{what}: {value}",
      route: "{what}: {value}",
      pair: "{what}: {a} → {b}",
    }),
  });

  const SYSTEM_TEXT_TEMPLATE_LOCALES = Object.freeze({
    ru: SYSTEM_TEXT_TEMPLATES_RU,
  });
  const SYSTEM_TEXT_TEMPLATES = SYSTEM_TEXT_TEMPLATES_RU;

  const SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS = Object.freeze({
    what: "действие",
    hint: "Можно попробовать позже.",
    option: "Можно выбрать другой вариант.",
    value: "—",
    a: "участник",
    b: "участник",
    name: "участник",
    target: "цель",
    guest: "гость",
    location: "локация",
    voteCost: "0",
    rematchCost: "1",
    escapeCost: "1",
    teacher: "учитель",
    student: "ученик",
  });

  const SYSTEM_COPY_CODE_TAXONOMY = Object.freeze({
    errors: Object.freeze({
      E_NET: Object.freeze({ meaning: "network failure or unreachable external transport" }),
      E_STATE: Object.freeze({ meaning: "invalid or missing local state for the requested action" }),
      E_RULES: Object.freeze({ meaning: "action blocked by game rules" }),
      E_COOLDOWN: Object.freeze({ meaning: "action blocked until a cooldown expires" }),
      E_NOT_FOUND: Object.freeze({ meaning: "requested entity was not found" }),
      E_UNAVAILABLE: Object.freeze({ meaning: "requested surface or action is unavailable" }),
      E_MESSAGE_MISSING: Object.freeze({ meaning: "system message fallback for unavailable copy" }),
      E_POINTS_INSUFFICIENT: Object.freeze({ meaning: "generic points balance is insufficient" }),
      E_BATTLE_POINTS_LOW: Object.freeze({ meaning: "battle start failed because points are too low" }),
      E_PLAYER_REQUIRED: Object.freeze({ meaning: "player selection is required" }),
      E_REPORT_FALSE_PENALTY: Object.freeze({ meaning: "false report failed and applied the configured penalty" }),
    }),
    warnings: Object.freeze({
      W_RATE_LIMIT: Object.freeze({ meaning: "action frequency is limited for now" }),
      W_PARTIAL: Object.freeze({ meaning: "operation completed only partially" }),
      W_NO_EFFECT: Object.freeze({ meaning: "operation is valid but changes nothing" }),
      W_INPUT_CHECK: Object.freeze({ meaning: "input needs correction before retry" }),
      W_ALREADY_ACCEPTED: Object.freeze({ meaning: "the current decision was already accepted" }),
      W_RESPECT_DAILY_PAIR: Object.freeze({ meaning: "respect for this pair was already sent today" }),
      W_RESPECT_NO_CHAIN: Object.freeze({ meaning: "reciprocal respect chain is unavailable today" }),
      W_RESPECT_EMITTER_EMPTY: Object.freeze({ meaning: "respect emitter has no available respect today" }),
      W_ESCAPE_POINTS_REQUIRED: Object.freeze({ meaning: "escape action requires more points" }),
    }),
    notifications: Object.freeze({
      N_OK: Object.freeze({ meaning: "operation accepted successfully" }),
      N_SAVED: Object.freeze({ meaning: "data was saved" }),
      N_UPDATED: Object.freeze({ meaning: "data was updated" }),
      N_SENT: Object.freeze({ meaning: "message or action was sent" }),
      N_REFUNDED: Object.freeze({ meaning: "points or resources were refunded" }),
      N_POINTS_DELTA_PLUS_ONE: Object.freeze({ meaning: "points increased by one" }),
      N_REP_DELTA_PLUS_ONE: Object.freeze({ meaning: "reputation increased by one" }),
      N_POINTS_DELTA_VOTE_COST: Object.freeze({ meaning: "vote cost points were deducted" }),
      N_RESPECT_PAID: Object.freeze({ meaning: "respect action deducted one point" }),
      N_RESPECT_TARGET_REP: Object.freeze({ meaning: "respect target gained one reputation" }),
      N_REPORT_PENDING: Object.freeze({ meaning: "report review is pending" }),
      N_REPORT_TRUE_REWARD: Object.freeze({ meaning: "true report accepted and reward granted" }),
      N_TRAINING_SENT: Object.freeze({ meaning: "argument training was sent" }),
      N_REMATCH_REQUESTED: Object.freeze({ meaning: "rematch request became available" }),
      N_ESCAPE_PAID: Object.freeze({ meaning: "escape action payment was accepted" }),
      N_POINTS_DELTA_REFUND: Object.freeze({ meaning: "one point was refunded" }),
      N_POINTS_DELTA_REFUND_MAJORITY: Object.freeze({ meaning: "one point was refunded to the majority voter" }),
      N_POINTS_DELTA_REMAINDER_WIN: Object.freeze({ meaning: "one remaining crowd point was awarded to the winner" }),
      N_REMATCH_COST: Object.freeze({ meaning: "rematch request cost points were deducted" }),
      N_ESCAPE_VOTE_COST: Object.freeze({ meaning: "escape vote cost points were deducted" }),
    }),
    systemEvents: Object.freeze({
      S_DAY_ROLLOVER: Object.freeze({ meaning: "game day rolled over" }),
      S_MODE_SWITCH: Object.freeze({ meaning: "game mode switched" }),
      S_PROFILE_LOADED: Object.freeze({ meaning: "player profile loaded" }),
      S_READY: Object.freeze({ meaning: "system is ready" }),
      S_DM_REACTION: Object.freeze({ meaning: "DM reaction exchange was posted" }),
      S_DM_INVITE: Object.freeze({ meaning: "DM invite was posted" }),
      S_PLAYER_JOINED: Object.freeze({ meaning: "player joined the square event" }),
      S_LOCATION_MOVED: Object.freeze({ meaning: "location transition completed" }),
      S_BATTLE_CHALLENGE: Object.freeze({ meaning: "battle challenge was posted" }),
      S_NPC_BATTLE_START: Object.freeze({ meaning: "NPC battle started" }),
      S_BATTLE_WIN: Object.freeze({ meaning: "battle ended with a winner" }),
      S_BATTLE_DRAW: Object.freeze({ meaning: "battle ended in a draw" }),
      S_CROWD_START: Object.freeze({ meaning: "crowd voting started" }),
      S_CROWD_RESOLVED: Object.freeze({ meaning: "crowd voting resolved with a winner" }),
      S_UNLOCK_ORANGE: Object.freeze({ meaning: "orange arguments unlocked" }),
      S_UNLOCK_RED: Object.freeze({ meaning: "red arguments unlocked" }),
      S_UNLOCK_BLACK: Object.freeze({ meaning: "black arguments unlocked" }),
    }),
  });

  const SYSTEM_COPY_TAXONOMY_AUDIT = Object.freeze({
    "errors.missingMessage": "E_MESSAGE_MISSING",
    "errors.insufficientPoints": "E_POINTS_INSUFFICIENT",
    "errors.pointsLowBattle": "E_BATTLE_POINTS_LOW",
    "errors.unavailable": "E_UNAVAILABLE",
    "errors.notFound": "E_NOT_FOUND",
    "errors.choosePlayer": "E_PLAYER_REQUIRED",
    "errors.reportFalsePenalty": "E_REPORT_FALSE_PENALTY",
    "warnings.checkInput": "W_INPUT_CHECK",
    "warnings.cooldownShort": "E_COOLDOWN",
    "warnings.alreadyVoted": "W_ALREADY_ACCEPTED",
    "warnings.respectPairDaily": "W_RESPECT_DAILY_PAIR",
    "warnings.respectNoChain": "W_RESPECT_NO_CHAIN",
    "warnings.respectEmitterEmpty": "W_RESPECT_EMITTER_EMPTY",
    "warnings.escapeNeedsPoints": "W_ESCAPE_POINTS_REQUIRED",
    "notifications.saved": "N_SAVED",
    "notifications.pointsDeltaPlusOne": "N_POINTS_DELTA_PLUS_ONE",
    "notifications.repDeltaPlusOne": "N_REP_DELTA_PLUS_ONE",
    "notifications.pointsDeltaVoteCost": "N_POINTS_DELTA_VOTE_COST",
    "notifications.respectPaid": "N_RESPECT_PAID",
    "notifications.respectTargetRep": "N_RESPECT_TARGET_REP",
    "notifications.voteAccepted": "N_OK",
    "notifications.reportPending": "N_REPORT_PENDING",
    "notifications.reportTrueReward": "N_REPORT_TRUE_REWARD",
    "notifications.trainingSent": "N_TRAINING_SENT",
    "notifications.rematchRequested": "N_REMATCH_REQUESTED",
    "notifications.escapePaid": "N_ESCAPE_PAID",
    "notifications.pointsDeltaRefund": "N_POINTS_DELTA_REFUND",
    "notifications.pointsDeltaRefundMajority": "N_POINTS_DELTA_REFUND_MAJORITY",
    "notifications.pointsDeltaRemainderWin": "N_POINTS_DELTA_REMAINDER_WIN",
    "notifications.rematchCost": "N_REMATCH_COST",
    "notifications.escapeVoteCost": "N_ESCAPE_VOTE_COST",
    "systemEvents.ready": "S_READY",
    "systemEvents.dmReaction": "S_DM_REACTION",
    "systemEvents.dmInvite": "S_DM_INVITE",
    "systemEvents.joined": "S_PLAYER_JOINED",
    "systemEvents.moved": "S_LOCATION_MOVED",
    "systemEvents.battleChallenge": "S_BATTLE_CHALLENGE",
    "systemEvents.npcBattleStart": "S_NPC_BATTLE_START",
    "systemEvents.battleWin": "S_BATTLE_WIN",
    "systemEvents.battleDraw": "S_BATTLE_DRAW",
    "systemEvents.crowdStart": "S_CROWD_START",
    "systemEvents.crowdResolved": "S_CROWD_RESOLVED",
    "systemEvents.unlockOrange": "S_UNLOCK_ORANGE",
    "systemEvents.unlockRed": "S_UNLOCK_RED",
    "systemEvents.unlockBlack": "S_UNLOCK_BLACK",
  });

  const FALLBACK_MESSAGE = SystemCopy.errors.missingMessage;

  const SYSTEM_LANGUAGE_PROFILE = Object.freeze({
    name: "System Language Profile",
    scope: "SystemCopy",
    locale: SYSTEM_DEFAULT_LOCALE,
    activeLocale: SYSTEM_DEFAULT_LOCALE,
    defaultLocale: SYSTEM_DEFAULT_LOCALE,
    fallbackLocale: SYSTEM_DEFAULT_LOCALE,
    style: "short-neutral-fact-consequence-next-step",
    sampleMin: 30,
    sampleMax: 50,
    allowedExamples: Object.freeze(["не получилось", "недоступно", "нужно", "можно позже", "попробуй ещё раз"]),
    forbidden: Object.freeze({
      evaluative: /(^|[^А-Яа-яЁёA-Za-z0-9_])(плохо|неправильно|стыдно|фейл|позор|зашквар|тупо|глупо)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      pressure: /(^|[^А-Яа-яЁёA-Za-z0-9_])(ты\s+обязан|срочно|немедленно|прямо\s+сейчас)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      cutesy: /(^|[^А-Яа-яЁёA-Za-z0-9_])(солнышко|ой|пожалуйста-пожалуйста|лапочка|котик)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
    }),
    manualReview: Object.freeze({
      longLine: 72,
      manySentences: 2,
      patterns: Object.freeze({
        slang: /(^|[^А-Яа-яЁёA-Za-z0-9_])(прокает|движ|ща|залетел|затащил|вписался|рофл|лол)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
        loudPunctuation: /!|…|\.\.\./,
        directPressureReview: /(^|[^А-Яа-яЁёA-Za-z0-9_])(жми|быстрее|давай)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      }),
    }),
  });


  function normalizeSystemLocale(locale){
    const raw = String(locale || "").trim().toLowerCase().replace(/_/g, "-");
    const base = raw.split("-")[0];
    if (SYSTEM_SUPPORTED_LOCALES.includes(raw)) return raw;
    if (SYSTEM_SUPPORTED_LOCALES.includes(base)) return base;
    return SYSTEM_DEFAULT_LOCALE;
  }

  function activeSystemLocale(ctx){
    const candidates = [
      ctx && ctx.locale,
      ctx && ctx.userLocale,
      Game && Game.userLocale,
      Game && Game.locale,
      Game && Game.Settings && Game.Settings.locale,
      Game && Game.Profile && Game.Profile.locale,
      typeof navigator !== "undefined" && navigator.language,
    ];
    for (let i = 0; i < candidates.length; i += 1) {
      if (candidates[i]) return normalizeSystemLocale(candidates[i]);
    }
    return SYSTEM_DEFAULT_LOCALE;
  }

  function systemCopyForLocale(locale){
    const key = normalizeSystemLocale(locale);
    return SYSTEM_COPY_LOCALES[key] || SYSTEM_COPY_LOCALES[SYSTEM_DEFAULT_LOCALE];
  }

  function systemTemplatesForLocale(locale){
    const key = normalizeSystemLocale(locale);
    return SYSTEM_TEXT_TEMPLATE_LOCALES[key] || SYSTEM_TEXT_TEMPLATE_LOCALES[SYSTEM_DEFAULT_LOCALE];
  }

  function systemCopyEntries(copy){
    const source = copy && typeof copy === "object" ? copy : SystemCopy;
    const rows = [];
    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      const bucket = source[group];
      if (!bucket || typeof bucket !== "object") return;
      Object.keys(bucket).sort().forEach((code) => {
        rows.push({ group, code, text: String(bucket[code] || "") });
      });
    });
    return rows;
  }

  function lintSystemLanguageLine(text){
    const source = String(text || "");
    const matches = [];
    Object.keys(SYSTEM_LANGUAGE_PROFILE.forbidden).forEach((category) => {
      const regex = SYSTEM_LANGUAGE_PROFILE.forbidden[category];
      regex.lastIndex = 0;
      const match = source.match(regex);
      if (match) matches.push({ category, match: match[2] || match[1] || match[0] });
    });
    return matches;
  }

  function reviewSystemLanguageLine(text){
    const source = String(text || "");
    const review = [];
    const sentenceCount = (source.match(/[.!?。]+/g) || []).length;
    if (source.length > SYSTEM_LANGUAGE_PROFILE.manualReview.longLine) review.push("longLine");
    if (sentenceCount > SYSTEM_LANGUAGE_PROFILE.manualReview.manySentences) review.push("manySentences");
    Object.keys(SYSTEM_LANGUAGE_PROFILE.manualReview.patterns).forEach((name) => {
      const regex = SYSTEM_LANGUAGE_PROFILE.manualReview.patterns[name];
      regex.lastIndex = 0;
      if (regex.test(source)) review.push(name);
    });
    if (!source.trim()) review.push("emptyLine");
    return review;
  }

  function lintSystemCopy(copy){
    const entries = systemCopyEntries(copy);
    const forbiddenRemaining = [];
    const detectedCategories = [];
    const manualReview = [];
    const addCategory = (category) => {
      if (!detectedCategories.includes(category)) detectedCategories.push(category);
    };
    entries.forEach((entry) => {
      const matches = lintSystemLanguageLine(entry.text);
      matches.forEach((item) => addCategory(item.category));
      if (matches.length) forbiddenRemaining.push({ group: entry.group, code: entry.code, text: entry.text, matches });
      const review = reviewSystemLanguageLine(entry.text);
      if (review.length) manualReview.push({ group: entry.group, code: entry.code, text: entry.text, review });
    });
    return { entries, forbiddenRemaining, detectedCategories: detectedCategories.sort(), manualReview };
  }


  function taxonomyEntries(taxonomy){
    const source = taxonomy && typeof taxonomy === "object" ? taxonomy : SYSTEM_COPY_CODE_TAXONOMY;
    const rows = [];
    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      const bucket = source[group];
      if (!bucket || typeof bucket !== "object") return;
      Object.keys(bucket).sort().forEach((canonicalCode) => {
        const meta = bucket[canonicalCode] && typeof bucket[canonicalCode] === "object" ? bucket[canonicalCode] : {};
        rows.push({ group, canonicalCode, meaning: String(meta.meaning || "") });
      });
    });
    return rows;
  }

  function canonicalCodeExists(canonicalCode){
    const key = String(canonicalCode || "").trim();
    return taxonomyEntries(SYSTEM_COPY_CODE_TAXONOMY).some((entry) => entry.canonicalCode === key);
  }

  function systemCopyTaxonomyRows(copy, audit){
    const sourceAudit = audit && typeof audit === "object" ? audit : SYSTEM_COPY_TAXONOMY_AUDIT;
    return systemCopyEntries(copy).map((entry) => {
      const key = `${entry.group}.${entry.code}`;
      return {
        group: entry.group,
        code: entry.code,
        key,
        canonicalCode: String(sourceAudit[key] || ""),
        text: entry.text,
      };
    });
  }

  function normalizeKind(kind){
    const key = String(kind || "").trim();
    return SYSTEM_COPY_KIND_ALIASES[key] || SYSTEM_COPY_KIND_ALIASES[key.toLowerCase()] || "";
  }

  function safeValue(value){
    if (value === undefined || value === null) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map((item) => safeValue(item)).filter(Boolean).join(", ");
    if (typeof value === "object") {
      const preferred = ["text", "label", "name", "title", "value"].map((key) => safeValue(value[key])).find(Boolean);
      return preferred || "";
    }
    return "";
  }

  function compactRenderedTemplate(text){
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/\s+([.,:;!?])/g, "$1")
      .replace(/([.!?])\.+/g, "$1")
      .replace(/([:;])\s*([.,;])/g, "$1")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim();
  }

  function renderTemplate(template, ctx){
    const source = String(template || "");
    const data = (ctx && typeof ctx === "object") ? ctx : {};
    return compactRenderedTemplate(source.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => {
      const rendered = safeValue(data[key]);
      return rendered || SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS[key] || "—";
    }));
  }

  function resolveSystemTemplate(group, code, ctx){
    const key = String(code || "").trim();
    const locale = activeSystemLocale(ctx);
    const copy = systemCopyForLocale(locale);
    const bucket = group && copy && copy[group] && typeof copy[group] === "object" ? copy[group] : null;
    if (bucket && Object.prototype.hasOwnProperty.call(bucket, key)) return bucket[key];
    const templates = systemTemplatesForLocale(locale);
    const family = group && templates && templates[group] && typeof templates[group] === "object" ? templates[group] : null;
    if (family && Object.prototype.hasOwnProperty.call(family, key)) return family[key];
    const fallbackCopy = systemCopyForLocale(SYSTEM_DEFAULT_LOCALE);
    return (fallbackCopy && fallbackCopy.errors && fallbackCopy.errors.missingMessage) || FALLBACK_MESSAGE;
  }

  function say(kind, code, ctx){
    const group = normalizeKind(kind);
    const safeCtx = (ctx && typeof ctx === "object") ? ctx : {};
    const template = resolveSystemTemplate(group, code, safeCtx);
    const rendered = renderTemplate(template, safeCtx);
    return rendered || FALLBACK_MESSAGE;
  }

  const SYSTEM_DELIVERY_POLICY = Object.freeze({
    errors: Object.freeze({ toast: true, devLog: true, chat: false, silent: false }),
    warnings: Object.freeze({ toast: true, devLog: true, chat: false, silent: false }),
    notifications: Object.freeze({ toast: true, devLog: false, chat: false, silent: false }),
    systemEvents: Object.freeze({ toast: false, devLog: true, chat: false, silent: true }),
  });

  const ECONOMY_NOTIFICATION_CODES = Object.freeze([
    "pointsDeltaPlusOne", "repDeltaPlusOne", "pointsDeltaVoteCost", "respectPaid",
    "respectTargetRep", "reportTrueReward", "escapePaid", "pointsDeltaRefund",
    "pointsDeltaRefundMajority", "pointsDeltaRemainderWin", "rematchCost", "escapeVoteCost"
  ]);


  const SYSTEM_ECONOMY_TEXT_REASON_CONTRACT = Object.freeze([
    Object.freeze({ reason: "crowd_vote_refund", aliases: Object.freeze(["points_delta_plus_one"]), kind: "notifications", code: "pointsDeltaPlusOne", currency: "points", direction: "credit", textProof: "+", reasonProof: "generic plus-one points delta text has refund transaction coverage" }),
    Object.freeze({ reason: "rep_crowd_vote_participation", aliases: Object.freeze(["rep_delta_plus_one"]), kind: "notifications", code: "repDeltaPlusOne", currency: "rep", direction: "credit", textProof: "+", reasonProof: "generic plus-one rep delta text has reputation transaction coverage" }),
    Object.freeze({ reason: "crowd_vote_cost", aliases: Object.freeze(["vote_cost"]), kind: "notifications", code: "pointsDeltaVoteCost", currency: "points", direction: "debit", textProof: "-", reasonProof: "crowd vote cost transfer" }),
    Object.freeze({ reason: "crowd_vote_refund", aliases: Object.freeze(["refund"]), kind: "notifications", code: "pointsDeltaRefund", currency: "points", direction: "credit", textProof: "+", reasonProof: "crowd vote refund transfer" }),
    Object.freeze({ reason: "crowd_vote_refund_majority", aliases: Object.freeze(["refund_majority"]), kind: "notifications", code: "pointsDeltaRefundMajority", currency: "points", direction: "credit", textProof: "+", reasonProof: "majority vote refund transfer" }),
    Object.freeze({ reason: "crowd_vote_remainder_win", aliases: Object.freeze(["remainder"]), kind: "notifications", code: "pointsDeltaRemainderWin", currency: "points", direction: "credit", textProof: "+", reasonProof: "crowd remainder winner transfer" }),
    Object.freeze({ reason: "crowd_vote_remainder_split_a", aliases: Object.freeze(["remainder_split_a"]), kind: "notifications", code: "pointsDeltaRemainderWin", currency: "points", direction: "credit", textProof: "+", reasonProof: "crowd remainder split transfer" }),
    Object.freeze({ reason: "crowd_vote_remainder_split_b", aliases: Object.freeze(["remainder_split_b"]), kind: "notifications", code: "pointsDeltaRemainderWin", currency: "points", direction: "credit", textProof: "+", reasonProof: "crowd remainder split transfer" }),
    Object.freeze({ reason: "rematch_request_cost", aliases: Object.freeze(["rematch_cost"]), kind: "notifications", code: "rematchCost", currency: "points", direction: "debit", textProof: "-", reasonProof: "rematch request cost transfer" }),
    Object.freeze({ reason: "escape_vote_cost", aliases: Object.freeze(["escape_vote_cost"]), kind: "notifications", code: "escapeVoteCost", currency: "points", direction: "debit", textProof: "-", reasonProof: "escape vote cost transfer" }),
    Object.freeze({ reason: "escape_vote_cost", aliases: Object.freeze(["escape_paid_text"]), kind: "notifications", code: "escapePaid", currency: "points", direction: "debit", textProof: "за 1💰", reasonProof: "existing escape paid text is covered by escape vote cost transfer" }),
    Object.freeze({ reason: "points_respect_cost", aliases: Object.freeze(["respect_cost"]), kind: "notifications", code: "respectPaid", currency: "points", direction: "debit", textProof: "Списано", reasonProof: "respect points cost transfer" }),
    Object.freeze({ reason: "rep_respect_given", aliases: Object.freeze(["rep_respect_given"]), kind: "notifications", code: "respectTargetRep", currency: "rep", direction: "credit", textProof: "+", reasonProof: "respect target reputation transfer" }),
    Object.freeze({ reason: "report_true_compensation", aliases: Object.freeze(["report_true_reward"]), kind: "notifications", code: "reportTrueReward", currency: "points", direction: "credit", textProof: "+", reasonProof: "true report compensation transfer" }),
    Object.freeze({ reason: "report_false_penalty", aliases: Object.freeze(["report_false_cost"]), kind: "errors", code: "reportFalsePenalty", currency: "points", direction: "debit", textProof: "-", reasonProof: "false report penalty transfer" })
  ]);

  function isEconomyNotification(group, code, text){
    if (group !== "notifications") return false;
    const key = String(code || "").trim();
    if (ECONOMY_NOTIFICATION_CODES.includes(key)) return true;
    return /[💰⭐🏆⚡]/.test(String(text || ""));
  }

  function statKindForText(text){
    const msg = String(text || "");
    if (msg.includes("💰")) return "points";
    if (msg.includes("⭐")) return "rep";
    if (msg.includes("🏆")) return "wins";
    if (msg.includes("⚡")) return "influence";
    return "points";
  }

  function deliveryPolicy(kind, code, ctx){
    const group = normalizeKind(kind) || "systemEvents";
    const text = say(group, code, ctx);
    const base = SYSTEM_DELIVERY_POLICY[group] || SYSTEM_DELIVERY_POLICY.systemEvents;
    const playerVisible = !!(ctx && (ctx.playerVisible === true || ctx.visible === true));
    const economy = isEconomyNotification(group, code, text);
    const policy = {
      kind: group,
      code: String(code || "").trim(),
      text,
      toast: !!base.toast,
      chat: !!base.chat,
      devLog: !!base.devLog,
      silent: !!base.silent,
      panel: ctx && ctx.panel ? String(ctx.panel) : null,
      statKind: statKindForText(text),
      economy,
      playerVisible,
    };
    if (group === "systemEvents" && playerVisible) {
      policy.silent = false;
      policy.chat = true;
      policy.toast = !!(ctx && ctx.toast === true);
    }
    if ((group === "errors" || group === "warnings") && ctx && ctx.devLog === false) {
      policy.devLog = false;
    }
    if (economy) {
      policy.toast = true;
      policy.chat = false;
      policy.silent = false;
      policy.economySync = "moneyLog/delta";
    }
    return policy;
  }

  function route(kind, code, ctx){
    return deliveryPolicy(kind, code, ctx);
  }

  function deliver(kind, code, ctx, opts){
    const policy = deliveryPolicy(kind, code, ctx);
    const options = (opts && typeof opts === "object") ? opts : {};
    const UI = Game && Game.UI ? Game.UI : null;
    if (policy.devLog && Game.__DEV && Array.isArray(Game.__DEV.systemLog)) {
      try { Game.__DEV.systemLog.push({ kind: policy.kind, code: policy.code, text: policy.text, ts: Date.now() }); } catch (_) {}
    }
    if (options.silentIncoming && policy.panel && UI && typeof UI.pushIncomingSystem === "function") {
      UI.pushIncomingSystem(policy.panel, policy.kind, policy.code, ctx, Object.assign({}, options, { text: policy.text, policy }));
      return policy;
    }
    if (policy.toast && UI && typeof UI.showStatToast === "function") {
      UI.showStatToast(policy.statKind, policy.text);
      return policy;
    }
    if (policy.chat && UI && typeof UI.pushSystem === "function") {
      UI.pushSystem(policy.text, Object.assign({}, options, { routed: true, policy }));
      return policy;
    }
    return policy;
  }


  const SYSTEM_COPY_REQUIRED_AREAS = Object.freeze([
    "economyDeltas", "dm", "battles", "events", "reports", "rematch", "escape", "training", "respect"
  ]);

  const SYSTEM_COPY_INVENTORY = Object.freeze([
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaPlusOne", file: "AsyncScene/Web/events.js", surface: "system", callsite: "Game.UI.pushSystem(Game.System.say(\"notifications\", \"pointsDeltaPlusOne\"))", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "repDeltaPlusOne", file: "AsyncScene/Web/events.js", surface: "system", callsite: "Game.UI.pushSystem(Game.System.say(\"notifications\", \"repDeltaPlusOne\"))", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaVoteCost", file: "AsyncScene/Web/events.js", surface: "system", callsite: "Game.UI.pushSystem(Game.System.say(\"notifications\", \"pointsDeltaVoteCost\", { voteCost }))", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaRefund", file: "AsyncScene/Web/system.js", surface: "contract", callsite: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT crowd_vote_refund", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaRefundMajority", file: "AsyncScene/Web/system.js", surface: "contract", callsite: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT crowd_vote_refund_majority", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaRemainderWin", file: "AsyncScene/Web/system.js", surface: "contract", callsite: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT crowd_vote_remainder_*", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaPlusOne", file: "AsyncScene/Web/ui/ui-core.js", surface: "toast", callsite: "UI.showStatToast('points', msg)", directHardcoded: false },

    { area: "dm", kind: "systemEvents", code: "dmReaction", file: "AsyncScene/Web/ui/ui-dm.js", surface: "system", callsite: "UI.pushSystem(Game.System.say(\"systemEvents\", \"dmReaction\", ctx))", directHardcoded: false },
    { area: "dm", kind: "systemEvents", code: "dmInvite", file: "AsyncScene/Web/ui/ui-dm.js", surface: "system", callsite: "UI.pushSystem(Game.System.say(\"systemEvents\", \"dmInvite\", ctx))", directHardcoded: false },
    { area: "dm", kind: "errors", code: "unavailable", file: "AsyncScene/Web/ui/ui-dm.js", surface: "toast", callsite: "SystemCopy-routed unavailable DM system text", directHardcoded: false },

    { area: "battles", kind: "systemEvents", code: "battleChallenge", file: "AsyncScene/Web/data.js", surface: "system", callsite: "Data.SYS.challengedLine(attackerName, attackerInf)", directHardcoded: false },
    { area: "battles", kind: "systemEvents", code: "battleWin", file: "AsyncScene/Web/events.js", surface: "system", callsite: "pushSystem(line) from npcBattleEndWin", directHardcoded: false },
    { area: "battles", kind: "systemEvents", code: "battleDraw", file: "AsyncScene/Web/events.js", surface: "system", callsite: "pushSystem(line) from npcBattleEndDraw", directHardcoded: false },
    { area: "battles", kind: "errors", code: "pointsLowBattle", file: "AsyncScene/Web/data.js", surface: "toast/system", callsite: "Data.SYS.pointsLow", directHardcoded: false },

    { area: "events", kind: "systemEvents", code: "crowdStart", file: "AsyncScene/Web/data.js", surface: "system", callsite: "Data.TEXTS.tie_chat_start / Data.SYS.tie", directHardcoded: false },
    { area: "events", kind: "systemEvents", code: "crowdResolved", file: "AsyncScene/Web/data.js", surface: "system", callsite: "Data.TEXTS.tie_chat_end_winner", directHardcoded: false },
    { area: "events", kind: "notifications", code: "voteAccepted", file: "AsyncScene/Web/ui/ui-events.js", surface: "toast", callsite: "showVoteBtnToast(btn, msg)", directHardcoded: false },
    { area: "events", kind: "warnings", code: "alreadyVoted", file: "AsyncScene/Web/data.js", surface: "toast", callsite: "Data.TEXTS.vote_already", directHardcoded: false },

    { area: "reports", kind: "notifications", code: "reportPending", file: "AsyncScene/Web/ui/ui-dm.js", surface: "dm", callsite: "Game.__A.pushDm(copId, copName, Game.System.say(\"notifications\", \"reportPending\"), { isSystem: true })", directHardcoded: false },
    { area: "reports", kind: "notifications", code: "reportTrueReward", file: "AsyncScene/Web/data.js", surface: "system", callsite: "Data.SYS.reportOk(name)", directHardcoded: false },
    { area: "reports", kind: "errors", code: "reportFalsePenalty", file: "AsyncScene/Web/data.js", surface: "system", callsite: "Data.SYS.reportNo", directHardcoded: false },

    { area: "rematch", kind: "notifications", code: "rematchRequested", file: "AsyncScene/Web/ui/ui-battles.js", surface: "toast", callsite: "rematch/retry battle action toasts", directHardcoded: false },
    { area: "rematch", kind: "notifications", code: "rematchCost", file: "AsyncScene/Web/conflict/conflict-core.js", surface: "contract", callsite: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT rematch_request_cost", directHardcoded: false },
    { area: "escape", kind: "notifications", code: "escapePaid", file: "AsyncScene/Web/ui/ui-battles.js", surface: "toast", callsite: "escape action label via Game.System.say(\"notifications\", \"escapePaid\")", directHardcoded: false },
    { area: "escape", kind: "notifications", code: "escapeVoteCost", file: "AsyncScene/Web/conflict/conflict-core.js", surface: "contract", callsite: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT escape_vote_cost", directHardcoded: false },
    { area: "escape", kind: "warnings", code: "escapeNeedsPoints", file: "AsyncScene/Web/data.js", surface: "toast", callsite: "Data.SYS.needEscapePointsInline", directHardcoded: false },
    { area: "training", kind: "notifications", code: "trainingSent", file: "AsyncScene/Web/ui/ui-dm.js", surface: "system", callsite: "UI.pushSystem(t('teach_sent_chat', ...))", directHardcoded: false },

    { area: "respect", kind: "notifications", code: "respectPaid", file: "AsyncScene/Web/ui/ui-dm.js", surface: "toast", callsite: "UI.showStatToast('points', Game.System.say(\"notifications\", \"respectPaid\"))", directHardcoded: false },
    { area: "respect", kind: "notifications", code: "respectTargetRep", file: "AsyncScene/Web/ui/ui-dm.js", surface: "toast", callsite: "UI.showStatToast('rep', Game.System.say(\"notifications\", \"respectTargetRep\"))", directHardcoded: false },
    { area: "respect", kind: "warnings", code: "respectPairDaily", file: "AsyncScene/Web/ui/ui-dm.js", surface: "toast", callsite: "mapRespectReason.respect_pair_daily via Game.System.say(\"warnings\", \"respectPairDaily\")", directHardcoded: false },
    { area: "respect", kind: "warnings", code: "respectNoChain", file: "AsyncScene/Web/ui/ui-dm.js", surface: "toast", callsite: "mapRespectReason.respect_no_chain via Game.System.say(\"warnings\", \"respectNoChain\")", directHardcoded: false },
    { area: "respect", kind: "warnings", code: "respectEmitterEmpty", file: "AsyncScene/Web/ui/ui-dm.js", surface: "toast", callsite: "mapRespectReason.respect_emitter_empty via Game.System.say(\"warnings\", \"respectEmitterEmpty\")", directHardcoded: false }
  ]);

  function coverageRowsFromInventory(inventory){
    const counts = Object.create(null);
    (Array.isArray(inventory) ? inventory : []).forEach((row) => {
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      if (!kind || !code) return;
      const key = `${kind}\u0000${code}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).sort().map((key) => {
      const parts = key.split("\u0000");
      return { kind: parts[0], code: parts[1], countCallsites: counts[key] };
    });
  }

  Game.SystemCopy = SystemCopy;
  Game.System = Object.freeze({
    say,
    defaultLocale: SYSTEM_DEFAULT_LOCALE,
    supportedLocales: SYSTEM_SUPPORTED_LOCALES,
    activeLocale: activeSystemLocale,
    normalizeLocale: normalizeSystemLocale,
    copyLocales: SYSTEM_COPY_LOCALES,
    requiredGroups: REQUIRED_SYSTEM_COPY_GROUPS,
    requiredInventoryAreas: SYSTEM_COPY_REQUIRED_AREAS,
    copyInventory: SYSTEM_COPY_INVENTORY,
    codeTaxonomy: SYSTEM_COPY_CODE_TAXONOMY,
    taxonomyAudit: SYSTEM_COPY_TAXONOMY_AUDIT,
    textTemplates: SYSTEM_TEXT_TEMPLATES,
    renderTemplate,
    deliveryPolicy,
    route,
    deliver,
    deliveryPolicies: SYSTEM_DELIVERY_POLICY,
    economyNotificationCodes: ECONOMY_NOTIFICATION_CODES,
    coverageRowsFromInventory,
    taxonomyEntries,
    systemCopyTaxonomyRows,
    normalizeKind,
    languageProfile: SYSTEM_LANGUAGE_PROFILE,
    lintSystemLanguageLine,
    reviewSystemLanguageLine,
    lintSystemCopy,
    economyTextReasonContract: SYSTEM_ECONOMY_TEXT_REASON_CONTRACT,
  });

  if (!Game.__DEV || typeof Game.__DEV !== "object") Game.__DEV = {};

  Game.__DEV.smokeSystemCopyInventoryOnce = function smokeSystemCopyInventoryOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      coverage: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const inventory = Array.from(SYSTEM_COPY_INVENTORY);
    const requiredAreas = Array.from(SYSTEM_COPY_REQUIRED_AREAS);
    const representedAreas = new Set();

    inventory.forEach((row, index) => {
      const area = String(row && row.area || "").trim();
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      if (area) representedAreas.add(area);
      if (!area) fail("inventory_callsite_area_missing", { index, row });
      if (!kind || !code) fail("inventory_callsite_kind_code_missing", { index, row });
      if (kind && code && (!SystemCopy[kind] || !Object.prototype.hasOwnProperty.call(SystemCopy[kind], code))) {
        fail("inventory_callsite_copy_missing", { index, area, kind, code, file: row && row.file, callsite: row && row.callsite });
      }
      if (!row || !row.file || !row.callsite || !row.surface) {
        fail("inventory_callsite_source_missing", { index, row });
      }
      if (row && row.directHardcoded === true) {
        addUnique(result.forbiddenRemaining, {
          area,
          kind: kind || String(row.kind || ""),
          code,
          file: row.file,
          callsite: row.callsite,
          reason: "direct user-facing hardcoded string remains outside dev-only; inventoried only, copy not rewritten"
        });
      }
    });

    requiredAreas.forEach((area) => {
      if (!representedAreas.has(area)) {
        addUnique(result.missingCoverage, area);
        fail("required_area_missing", area);
      }
    });

    result.coverage = coverageRowsFromInventory(inventory);
    if (!result.coverage.length) fail("coverage_rows_missing", "no coverage rows generated");
    result.coverage.forEach((row) => {
      if (!row || !normalizeKind(row.kind) || !String(row.code || "").trim()) fail("coverage_row_kind_code_missing", row);
      if (!row || !(Number(row.countCallsites) > 0)) fail("coverage_row_count_missing", row);
    });

    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "direct_hardcoded_strings_reported");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };


  Game.__DEV.smokeSystemCodeTaxonomyOnce = function smokeSystemCodeTaxonomyOnce(){
    const requiredCanonicalCodes = Object.freeze([
      "E_NET", "E_STATE", "E_RULES", "E_COOLDOWN", "E_NOT_FOUND", "E_UNAVAILABLE",
      "W_RATE_LIMIT", "W_PARTIAL", "W_NO_EFFECT",
      "N_OK", "N_SAVED", "N_UPDATED", "N_SENT", "N_REFUNDED",
      "S_DAY_ROLLOVER", "S_MODE_SWITCH", "S_PROFILE_LOADED",
    ]);
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      duplicateCodes: [],
      unmappedCodes: [],
      totalCodes: 0,
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const taxonomy = taxonomyEntries(SYSTEM_COPY_CODE_TAXONOMY);
    const taxonomyCodes = new Set(taxonomy.map((entry) => entry.canonicalCode));
    const auditRows = systemCopyTaxonomyRows(Game.SystemCopy || SystemCopy, SYSTEM_COPY_TAXONOMY_AUDIT);
    const auditKeys = new Set(auditRows.map((row) => row.key));
    const auditValues = Object.keys(SYSTEM_COPY_TAXONOMY_AUDIT).map((key) => ({ key, canonicalCode: SYSTEM_COPY_TAXONOMY_AUDIT[key] }));
    const identityUse = Object.create(null);
    const normalizedTextUse = Object.create(null);
    const meaningUse = Object.create(null);

    result.totalCodes = auditRows.length;

    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      if (!SYSTEM_COPY_CODE_TAXONOMY[group] || typeof SYSTEM_COPY_CODE_TAXONOMY[group] !== "object") {
        addUnique(result.missingCoverage, group);
        fail("taxonomy_group_missing", group);
      }
    });

    requiredCanonicalCodes.forEach((canonicalCode) => {
      if (!taxonomyCodes.has(canonicalCode)) {
        addUnique(result.missingCoverage, canonicalCode);
        fail("required_canonical_code_missing", canonicalCode);
      }
    });

    taxonomy.forEach((entry) => {
      const meaningKey = entry.meaning.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!entry.meaning.trim()) fail("taxonomy_meaning_missing", entry.canonicalCode);
      if (meaningKey) {
        if (!meaningUse[meaningKey]) meaningUse[meaningKey] = [];
        meaningUse[meaningKey].push(entry.canonicalCode);
      }
    });

    Object.keys(meaningUse).sort().forEach((meaningKey) => {
      if (meaningUse[meaningKey].length > 1) {
        const duplicate = { kind: "meaning", meaning: meaningKey, canonicalCodes: meaningUse[meaningKey] };
        addUnique(result.duplicateCodes, duplicate);
        fail("duplicate_taxonomy_meaning", duplicate);
      }
    });

    auditRows.forEach((row) => {
      if (!row.canonicalCode) {
        addUnique(result.unmappedCodes, row.key);
        fail("system_copy_code_unmapped", row.key);
        return;
      }
      if (!taxonomyCodes.has(row.canonicalCode)) {
        addUnique(result.unmappedCodes, { key: row.key, canonicalCode: row.canonicalCode });
        fail("system_copy_canonical_code_unknown", { key: row.key, canonicalCode: row.canonicalCode });
        return;
      }
      if (!identityUse[row.canonicalCode]) identityUse[row.canonicalCode] = [];
      identityUse[row.canonicalCode].push(row.key);
      const textKey = row.text.toLowerCase().replace(/\{[A-Za-z0-9_]+\}/g, "{}").replace(/\s+/g, " ").trim();
      if (textKey) {
        if (!normalizedTextUse[textKey]) normalizedTextUse[textKey] = [];
        normalizedTextUse[textKey].push({ key: row.key, canonicalCode: row.canonicalCode });
      }
    });

    auditValues.forEach((row) => {
      if (!auditKeys.has(row.key)) {
        addUnique(result.unmappedCodes, { key: row.key, canonicalCode: row.canonicalCode, reason: "audit_entry_without_system_copy" });
        fail("taxonomy_audit_entry_without_system_copy", row);
      }
    });

    Object.keys(identityUse).sort().forEach((canonicalCode) => {
      if (identityUse[canonicalCode].length > 1) {
        const duplicate = { kind: "canonicalIdentity", canonicalCode, keys: identityUse[canonicalCode] };
        addUnique(result.duplicateCodes, duplicate);
        fail("duplicate_canonical_identity", duplicate);
      }
    });

    Object.keys(normalizedTextUse).sort().forEach((textKey) => {
      const rows = normalizedTextUse[textKey];
      const canonicalCodes = Array.from(new Set(rows.map((row) => row.canonicalCode)));
      if (rows.length > 1 || canonicalCodes.length > 1) {
        const duplicate = { kind: "messageText", text: textKey, rows };
        addUnique(result.duplicateCodes, duplicate);
        fail("duplicate_message_text", duplicate);
      }
    });

    if (result.unmappedCodes.length) addUnique(result.failedChecks, "unmapped_codes");
    if (result.duplicateCodes.length) addUnique(result.failedChecks, "duplicate_codes");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && result.duplicateCodes.length === 0 && result.unmappedCodes.length === 0;
    return result;
  };

  Game.__DEV.smokeSystemEconomyTextPairsOnce = function smokeSystemEconomyTextPairsOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      checkedReasons: [],
      textWithoutTransaction: [],
      transactionWithoutText: [],
      semanticMismatches: []
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail, bucket) => {
      addUnique(result.failedChecks, check);
      const payload = detail === undefined ? check : { check, detail };
      addUnique(result.failures, payload);
      if (bucket && result[bucket]) addUnique(result[bucket], detail === undefined ? check : detail);
    };
    const requiredAliases = ["vote_cost", "refund_majority", "remainder", "rematch_cost", "escape_vote_cost", "rep_respect_given"];
    const contract = Array.from(SYSTEM_ECONOMY_TEXT_REASON_CONTRACT);
    const textKeys = Object.create(null);
    ECONOMY_NOTIFICATION_CODES.forEach((code) => {
      const text = say("notifications", code, { voteCost: 1, rematchCost: 1, escapeCost: 1, name: "цель" });
      textKeys[`notifications.${code}`] = { kind: "notifications", code, text, reason: null };
    });
    const transactionKeys = Object.create(null);
    const aliasKeys = Object.create(null);
    const signed = (text) => ({ plus: /\+|получ|возврат|зачисл|цель получила/i.test(String(text || "")), minus: /-|списано|штраф|стоим|свалить за/i.test(String(text || "")) });
    const hasCurrency = (text, currency) => {
      const source = String(text || "");
      if (currency === "points") return source.includes("💰");
      if (currency === "rep") return source.includes("⭐");
      return true;
    };

    contract.forEach((row, index) => {
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      const reason = String(row && row.reason || "").trim();
      const aliases = Array.isArray(row && row.aliases) ? row.aliases.map((x) => String(x || "").trim()).filter(Boolean) : [];
      const currency = String(row && row.currency || "").trim();
      const direction = String(row && row.direction || "").trim();
      const text = kind && code ? say(kind, code, { voteCost: 1, rematchCost: 1, escapeCost: 1, name: "цель" }) : "";
      const proof = { kind, code, text, reason, aliases, currency, direction };
      if (!kind || !code || !reason) fail("contract_row_identity_missing", Object.assign({ index }, proof), "missingCoverage");
      if (!kind || !SystemCopy[kind] || !Object.prototype.hasOwnProperty.call(SystemCopy[kind], code)) {
        fail("system_copy_line_missing", Object.assign({ index }, proof), "transactionWithoutText");
      }
      if (!text || text === FALLBACK_MESSAGE) fail("system_copy_text_missing", Object.assign({ index }, proof), "transactionWithoutText");
      if (!currency || !hasCurrency(text, currency)) fail("currency_mismatch", proof, "semanticMismatches");
      const sign = signed(text);
      if (direction === "credit" && !sign.plus) fail("credit_text_missing_plus_semantics", proof, "semanticMismatches");
      if (direction === "debit" && !sign.minus) fail("debit_text_missing_minus_semantics", proof, "semanticMismatches");
      if (reason) {
        transactionKeys[reason] = true;
        result.checkedReasons.push(Object.assign({}, proof, { reasonProof: row.reasonProof || reason }));
      }
      aliases.forEach((alias) => {
        aliasKeys[alias] = true;
        transactionKeys[alias] = true;
        result.checkedReasons.push(Object.assign({}, proof, { reason: alias, actualReason: reason, reasonProof: row.reasonProof || reason }));
      });
      if (kind && code) textKeys[`${kind}.${code}`] = { kind, code, text, reason };
    });

    requiredAliases.forEach((alias) => {
      if (!aliasKeys[alias] && !transactionKeys[alias]) fail("required_reason_alias_missing", alias, "missingCoverage");
    });
    Object.keys(transactionKeys).sort().forEach((reason) => {
      const covered = result.checkedReasons.some((row) => row && String(row.reason || "") === reason);
      if (!covered) fail("transaction_without_text", reason, "transactionWithoutText");
    });
    Object.keys(textKeys).sort().forEach((key) => {
      const covered = result.checkedReasons.some((row) => row && `${row.kind}.${row.code}` === key);
      if (!covered) fail("text_without_transaction", textKeys[key], "textWithoutTransaction");
    });
    if (!result.checkedReasons.length) fail("checked_reasons_empty", "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT", "missingCoverage");
    result.checkedReasons.forEach((row) => {
      if (!row.kind || !row.code || !row.text || !row.reason) fail("checked_reason_proof_incomplete", row, "missingCoverage");
    });
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && result.textWithoutTransaction.length === 0 && result.transactionWithoutText.length === 0 && result.semanticMismatches.length === 0;
    return result;
  };

  Game.__DEV.smokeSystemLanguageProfileOnce = function smokeSystemLanguageProfileOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      sampleCount: 0,
      detectedCategories: [],
      quickReviewSample: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const lint = lintSystemCopy(Game.SystemCopy || SystemCopy);
    const entries = lint.entries.slice(0, SYSTEM_LANGUAGE_PROFILE.sampleMax);
    const sampledGroups = new Set(entries.map((entry) => entry.group));
    result.sampleCount = entries.length;
    result.forbiddenRemaining = lint.forbiddenRemaining;
    result.detectedCategories = lint.detectedCategories;

    if (result.sampleCount < SYSTEM_LANGUAGE_PROFILE.sampleMin || result.sampleCount > SYSTEM_LANGUAGE_PROFILE.sampleMax) {
      fail("sample_count_between_30_and_50", result.sampleCount);
    }
    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      if (!sampledGroups.has(group)) {
        addUnique(result.missingCoverage, group);
        fail("required_group_missing_from_sample", group);
      }
    });
    if (result.forbiddenRemaining.length) fail("forbidden_patterns_detected", result.forbiddenRemaining);
    if (!SYSTEM_LANGUAGE_PROFILE || SYSTEM_LANGUAGE_PROFILE.scope !== "SystemCopy") fail("profile_scope_system_copy", SYSTEM_LANGUAGE_PROFILE && SYSTEM_LANGUAGE_PROFILE.scope);
    if (!SYSTEM_LANGUAGE_PROFILE.style || SYSTEM_LANGUAGE_PROFILE.style.indexOf("short-neutral") === -1) fail("profile_style_contract_missing", SYSTEM_LANGUAGE_PROFILE && SYSTEM_LANGUAGE_PROFILE.style);

    const reviewRows = lint.manualReview.length ? lint.manualReview : entries.slice(0, 5).map((entry) => ({
      group: entry.group,
      code: entry.code,
      text: entry.text,
      review: ["quickReview"],
    }));
    result.quickReviewSample = reviewRows.slice(0, 10);
    if (!result.quickReviewSample.length) fail("quick_review_sample_generated", "empty quick review sample");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };

  Game.__DEV.smokeSystemLocaleRuOnce = function smokeSystemLocaleRuOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      sampleCount: 0,
      localeUsed: activeSystemLocale({ locale: SYSTEM_DEFAULT_LOCALE }),
      nonRuMessages: [],
      foreignTermsDetected: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const ruCtx = Object.freeze({
      locale: "ru",
      userLocale: "ru",
      what: "действие",
      hint: "Можно позже.",
      option: "Выбери другой вариант.",
      value: "значение",
      a: "Анна",
      b: "Борис",
      name: "цель",
      target: "цель",
      guest: "гость",
      location: "площадь",
      voteCost: 1,
      rematchCost: 1,
      escapeCost: 1,
      teacher: "учитель",
      student: "ученик",
      attackerName: "соперник",
      attackerInf: 2,
      winner: "победитель",
      loser: "соперник",
      aVotes: 2,
      bVotes: 1,
    });
    const foreignTermPatterns = Object.freeze([
      { term: "cooldown", regex: /(^|[^a-z])cool\s*down(?=$|[^a-z])|(^|[^a-z])cooldown(?=$|[^a-z])/i },
      { term: "rate limit", regex: /(^|[^a-z])rate\s+limit(?=$|[^a-z])/i },
      { term: "saved", regex: /(^|[^a-z])saved(?=$|[^a-z])/i },
      { term: "updated", regex: /(^|[^a-z])updated(?=$|[^a-z])/i },
      { term: "loading", regex: /(^|[^a-z])loading(?=$|[^a-z])/i },
      { term: "error", regex: /(^|[^a-z])error(?=$|[^a-z])/i },
      { term: "warning", regex: /(^|[^a-z])warning(?=$|[^a-z])/i },
      { term: "notification", regex: /(^|[^a-z])notification(?=$|[^a-z])/i },
      { term: "system", regex: /(^|[^a-z])system(?=$|[^a-z])/i },
      { term: "pending", regex: /(^|[^a-z])pending(?=$|[^a-z])/i },
      { term: "unavailable", regex: /(^|[^a-z])unavailable(?=$|[^a-z])/i },
      { term: "ready", regex: /(^|[^a-z])ready(?=$|[^a-z])/i },
    ]);
    const hasCyrillic = (text) => /[А-Яа-яЁё]/.test(String(text || ""));
    const latinWords = (text) => String(text || "").match(/[A-Za-z][A-Za-z-]*/g) || [];
    const isRuSystemText = (text) => {
      const source = String(text || "").trim();
      if (!source) return false;
      if (latinWords(source).length) return false;
      return hasCyrillic(source) || /^[\s\d+\-:.,;()\[\]{}→/💰⭐🏆⚡—]+$/.test(source);
    };
    const inspectText = (sample) => {
      const text = String(sample && sample.text || "");
      if (!isRuSystemText(text)) {
        addUnique(result.nonRuMessages, Object.assign({}, sample, { latinWords: latinWords(text) }));
        fail("non_ru_message", sample);
      }
      foreignTermPatterns.forEach((row) => {
        row.regex.lastIndex = 0;
        if (row.regex.test(text)) {
          const hit = Object.assign({}, sample, { term: row.term });
          addUnique(result.foreignTermsDetected, hit);
          fail("foreign_term_detected", hit);
        }
      });
      const forbidden = lintSystemLanguageLine(text);
      if (forbidden.length) {
        const hit = Object.assign({}, sample, { matches: forbidden });
        addUnique(result.forbiddenRemaining, hit);
        fail("forbidden_patterns_detected", hit);
      }
    };

    if (result.localeUsed !== "ru") fail("active_locale_ru", result.localeUsed);
    if (normalizeSystemLocale("en-US") !== "ru" || normalizeSystemLocale("unknown") !== "ru") fail("unknown_locale_falls_back_ru");
    if (!SYSTEM_COPY_LOCALES.ru || SYSTEM_COPY_LOCALES.ru !== SystemCopy) fail("ru_copy_profile_active");
    if (!SYSTEM_TEXT_TEMPLATE_LOCALES.ru || SYSTEM_TEXT_TEMPLATE_LOCALES.ru !== SYSTEM_TEXT_TEMPLATES) fail("ru_template_profile_active");
    if (!SYSTEM_LANGUAGE_PROFILE || SYSTEM_LANGUAGE_PROFILE.activeLocale !== "ru" || SYSTEM_LANGUAGE_PROFILE.fallbackLocale !== "ru") fail("language_profile_ru", SYSTEM_LANGUAGE_PROFILE);

    const ruEntries = systemCopyEntries(systemCopyForLocale("ru"));
    const activeEntries = systemCopyEntries(systemCopyForLocale(activeSystemLocale({ locale: "ru" })));
    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      const bucket = systemCopyForLocale("ru")[group];
      if (!bucket || typeof bucket !== "object" || !Object.keys(bucket).length) {
        addUnique(result.missingCoverage, group);
        fail("ru_group_missing", group);
      }
    });
    if (ruEntries.length !== activeEntries.length) fail("active_ru_entry_count", { ru: ruEntries.length, active: activeEntries.length });

    ruEntries.forEach((entry) => {
      if (!String(entry.text || "").trim()) {
        addUnique(result.missingCoverage, `${entry.group}.${entry.code}`);
        fail("ru_entry_empty", entry);
      }
      const text = say(entry.group, entry.code, ruCtx);
      inspectText({ source: "SystemCopy", kind: entry.group, code: entry.code, text });
      const fallbackText = say(entry.group, entry.code, Object.assign({}, ruCtx, { locale: "zz-ZZ", userLocale: "zz-ZZ" }));
      if (fallbackText !== text) fail("unknown_locale_entry_fallback_mismatch", { kind: entry.group, code: entry.code, text, fallbackText });
    });

    const templateSamples = Object.freeze([
      { kind: "errors", code: "blockedWithHint", ctx: { what: "нет доступа", hint: "Можно позже." } },
      { kind: "errors", code: "unavailableWithHint", ctx: { what: "раздел", hint: "Открой профиль." } },
      { kind: "errors", code: "needsValue", ctx: { what: "выбор", hint: "Проверь ввод." } },
      { kind: "warnings", code: "actionOption", ctx: { what: "Проверь ввод", option: "Можно ещё раз." } },
      { kind: "warnings", code: "waitOption", ctx: { what: "Подожди немного" } },
      { kind: "warnings", code: "noEffectOption", ctx: { what: "Уже принято", option: "Можно позже." } },
      { kind: "notifications", code: "fact", ctx: { what: "Сохранено." } },
      { kind: "notifications", code: "savedValue", ctx: { what: "Баланс", value: "три" } },
      { kind: "notifications", code: "delta", ctx: { what: "Баланс", value: "+1💰" } },
      { kind: "systemEvents", code: "value", ctx: { what: "Переход", value: "площадь" } },
      { kind: "systemEvents", code: "route", ctx: { what: "Событие", value: "началось" } },
      { kind: "systemEvents", code: "pair", ctx: { what: "Баттл", a: "Анна", b: "Борис" } },
    ]);
    templateSamples.forEach((sample) => {
      const text = say(sample.kind, sample.code, Object.assign({}, ruCtx, sample.ctx, { locale: "ru" }));
      inspectText({ source: "SystemTemplateSample", kind: sample.kind, code: sample.code, text });
      const fallbackText = say(sample.kind, sample.code, Object.assign({}, ruCtx, sample.ctx, { locale: "en-US", userLocale: "en-US" }));
      if (fallbackText !== text) fail("unknown_locale_template_fallback_mismatch", { kind: sample.kind, code: sample.code, text, fallbackText });
    });

    result.sampleCount = ruEntries.length + templateSamples.length;
    if (result.sampleCount < ruEntries.length) fail("sample_count_covers_registered_entries", { sampleCount: result.sampleCount, entryCount: ruEntries.length });
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    if (result.nonRuMessages.length) addUnique(result.failedChecks, "non_ru_messages");
    if (result.foreignTermsDetected.length) addUnique(result.failedChecks, "foreign_terms_detected");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && result.nonRuMessages.length === 0 && result.foreignTermsDetected.length === 0 && result.localeUsed === "ru";
    return result;
  };

  Game.__DEV.smokeSystemTextTemplatesOnce = function smokeSystemTextTemplatesOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      sampleCount: 0,
      renderedSamples: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const readableChecks = Object.freeze({
      emptyBraces: /\{\s*\}/,
      unresolvedPlaceholders: /\{[A-Za-z0-9_]+\}/,
      undefinedToken: /undefined/i,
      nullToken: /null/i,
      objectObjectToken: /\[object Object\]/,
      doubleSpaces: / {2,}/,
      brokenPunctuation: /(^|[\s([{])[:;,.!?]|[:;]\s*[,.!?]|[.!?]{2,}|,\s*[.!?]|\s+[.,:;!?]/,
    });
    const samples = Object.freeze([
      { kind: "errors", code: "blockedWithHint", ctx: { what: "нет доступа", hint: "Открой профиль." } },
      { kind: "errors", code: "blockedWithHint", ctx: { what: "мало 💰", hint: undefined } },
      { kind: "errors", code: "needsValue", ctx: { what: null, hint: "Проверь выбор." } },
      { kind: "warnings", code: "actionOption", ctx: { what: "Проверь ввод", option: "Можно попробовать ещё раз." } },
      { kind: "warnings", code: "waitOption", ctx: { what: "Кулдаун активен" } },
      { kind: "warnings", code: "noEffectOption", ctx: { what: "Уже принято", option: { next: "можно выбрать другого" } } },
      { kind: "notifications", code: "fact", ctx: { what: "Сохранено." } },
      { kind: "notifications", code: "savedValue", ctx: { what: "Баланс", value: 3 } },
      { kind: "notifications", code: "delta", ctx: { what: "+1💰", value: true } },
      { kind: "systemEvents", code: "value", ctx: { what: "Переход выполнен", value: "Площадь" } },
      { kind: "systemEvents", code: "pair", ctx: { what: "Баттл начался", a: "Аня", b: "Боря" } },
      { kind: "systemEvents", code: "route", ctx: { what: "Событие", value: ["старт"] } },
    ]);
    const coveredKinds = new Set();

    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      const family = SYSTEM_TEXT_TEMPLATES[group];
      if (!family || typeof family !== "object" || Object.keys(family).length < 2) {
        addUnique(result.missingCoverage, group);
        fail("template_family_minimum_missing", group);
      }
    });

    samples.forEach((sample, index) => {
      const kind = normalizeKind(sample.kind);
      if (kind) coveredKinds.add(kind);
      let text = "";
      try {
        text = say(sample.kind, sample.code, sample.ctx);
      } catch (error) {
        fail("template_render_no_crash", { index, sample, error: String(error && error.message ? error.message : error) });
      }
      result.renderedSamples.push({ kind: sample.kind, code: sample.code, text });
      if (typeof text !== "string" || !text.trim()) fail("rendered_text_non_empty", { index, sample, text });
      Object.keys(readableChecks).forEach((name) => {
        const regex = readableChecks[name];
        regex.lastIndex = 0;
        if (regex.test(String(text || ""))) fail(name, { index, kind: sample.kind, code: sample.code, text });
      });
      const forbidden = lintSystemLanguageLine(text);
      if (forbidden.length) {
        result.forbiddenRemaining.push({ index, kind: sample.kind, code: sample.code, text, matches: forbidden });
        fail("forbidden_patterns_detected", { index, text, forbidden });
      }
    });

    result.sampleCount = samples.length;
    if (result.sampleCount < 10) fail("sample_count_minimum_10", result.sampleCount);
    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      if (!coveredKinds.has(group)) {
        addUnique(result.missingCoverage, group);
        fail("required_kind_missing_from_samples", group);
      }
    });
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && result.sampleCount >= 10;
    return result;
  };


  Game.__DEV.smokeSystemRoutingOnce = function smokeSystemRoutingOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      routingCoverage: [],
      focusChanged: false,
      panelOpened: false,
      autoScrolled: false,
      counterAdvanced: false,
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const UI = Game && Game.UI ? Game.UI : null;
    const S = (Game && (Game.__S || (UI && UI.S))) ? (Game.__S || UI.S) : null;
    const beforeActive = (typeof document !== "undefined") ? document.activeElement : null;
    const beforeScrollX = (typeof window !== "undefined" && Number.isFinite(window.scrollX)) ? window.scrollX : 0;
    const beforeScrollY = (typeof window !== "undefined" && Number.isFinite(window.scrollY)) ? window.scrollY : 0;
    const beforeSizes = {};
    const beforeCounters = {};
    const beforeDmOpen = !!(S && S.dm && S.dm.open);
    const beforeDmActive = S && S.dm ? (S.dm.activeId || null) : null;
    const beforeToastCount = Game.__DEV.__toastCallCount__ || 0;
    const beforeToastLog = Game.__D && Array.isArray(Game.__D.toastLog) ? Game.__D.toastLog.length : 0;
    const beforeTape = Array.isArray(Game.__DEV.__toastTape__) ? Game.__DEV.__toastTape__.length : 0;
    const panels = ["dm", "battles", "events"];

    try {
      panels.forEach((panel) => {
        beforeSizes[panel] = UI && typeof UI.getPanelSize === "function" ? UI.getPanelSize(panel) : "";
        beforeCounters[panel] = UI && typeof UI.getCollapsedCounter === "function" ? UI.getCollapsedCounter(panel) : 0;
        if (UI && typeof UI.setPanelSize === "function") UI.setPanelSize(panel, "collapsed");
      });
    } catch (error) {
      fail("collapse_panels_for_smoke", String(error && error.message ? error.message : error));
    }

    const baselineActive = (typeof document !== "undefined") ? document.activeElement : beforeActive;
    const baselineScrollX = (typeof window !== "undefined" && Number.isFinite(window.scrollX)) ? window.scrollX : beforeScrollX;
    const baselineScrollY = (typeof window !== "undefined" && Number.isFinite(window.scrollY)) ? window.scrollY : beforeScrollY;
    const baselineDmOpen = !!(S && S.dm && S.dm.open);
    const baselineDmActive = S && S.dm ? (S.dm.activeId || null) : beforeDmActive;

    const routed = [
      route("errors", "unavailable", { panel: "dm" }),
      route("warnings", "alreadyVoted", { panel: "events" }),
      route("notifications", "saved", { panel: "dm" }),
      route("systemEvents", "ready", { panel: "events" }),
    ];
    result.routingCoverage = Array.from(new Set(routed.map((row) => row.kind))).sort();
    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      if (!result.routingCoverage.includes(group)) addUnique(result.missingCoverage, group);
    });
    const byKind = Object.create(null);
    routed.forEach((row) => { byKind[row.kind] = row; });
    if (!byKind.errors || byKind.errors.toast !== true) fail("errors_route_to_toast", byKind.errors || null);
    if (!byKind.warnings || byKind.warnings.toast !== true) fail("warnings_route_to_toast", byKind.warnings || null);
    if (!byKind.systemEvents || byKind.systemEvents.silent !== true || byKind.systemEvents.toast === true || byKind.systemEvents.chat === true) fail("system_events_default_silent_log_only", byKind.systemEvents || null);

    let econToastCalls = 0;
    const originalShowToast = UI && UI.showStatToast;
    try {
      if (UI && typeof UI.showStatToast === "function") {
        UI.showStatToast = function(kind, text){
          econToastCalls += /[💰⭐]/.test(String(text || "")) ? 1 : 0;
          return originalShowToast.apply(this, arguments);
        };
      }
      deliver("notifications", "pointsDeltaPlusOne", { panel: "events" });
    } catch (error) {
      fail("economy_route_delivery_no_crash", String(error && error.message ? error.message : error));
    } finally {
      if (UI && originalShowToast) UI.showStatToast = originalShowToast;
    }
    if (econToastCalls !== 1) {
      addUnique(result.forbiddenRemaining, "duplicate_economy_notification_delivery");
      fail("economy_notification_exactly_one_toast", { econToastCalls });
    }

    try {
      if (UI && typeof UI.pushIncomingSystem === "function") {
        UI.pushIncomingSystem("dm", "systemEvents", "dmReaction", { name: "A", target: "B" }, { silentIncoming: true });
        UI.pushIncomingSystem("battles", "systemEvents", "battleChallenge", { attackerName: "A", attackerInf: 1 }, { silentIncoming: true });
        UI.pushIncomingSystem("events", "systemEvents", "crowdStart", {}, { silentIncoming: true });
      } else fail("incoming_system_helper_missing");
    } catch (error) {
      fail("silent_incoming_no_crash", String(error && error.message ? error.message : error));
    }

    const afterCounters = {};
    panels.forEach((panel) => {
      afterCounters[panel] = UI && typeof UI.getCollapsedCounter === "function" ? UI.getCollapsedCounter(panel) : beforeCounters[panel];
    });
    result.counterAdvanced = panels.every((panel) => (afterCounters[panel] || 0) > (beforeCounters[panel] || 0));
    if (!result.counterAdvanced) fail("collapsed_counters_advanced", { beforeCounters, afterCounters });

    result.focusChanged = !!(baselineActive && typeof document !== "undefined" && document.activeElement !== baselineActive);
    const afterScrollX = (typeof window !== "undefined" && Number.isFinite(window.scrollX)) ? window.scrollX : baselineScrollX;
    const afterScrollY = (typeof window !== "undefined" && Number.isFinite(window.scrollY)) ? window.scrollY : baselineScrollY;
    result.autoScrolled = (afterScrollX !== baselineScrollX) || (afterScrollY !== baselineScrollY);
    const afterSizes = {};
    panels.forEach((panel) => { afterSizes[panel] = UI && typeof UI.getPanelSize === "function" ? UI.getPanelSize(panel) : ""; });
    result.panelOpened = panels.some((panel) => afterSizes[panel] !== "collapsed") || (!!(S && S.dm && S.dm.open) && !baselineDmOpen);
    if (S && S.dm && baselineDmActive !== (S.dm.activeId || null)) fail("active_dm_changed", { before: baselineDmActive, after: S.dm.activeId || null });
    if (result.focusChanged) fail("focus_changed");
    if (result.autoScrolled) fail("auto_scrolled");
    if (result.panelOpened) fail("panel_opened", { beforeSizes, afterSizes, beforeDmOpen: baselineDmOpen, afterDmOpen: !!(S && S.dm && S.dm.open) });

    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    const afterToastCount = Game.__DEV.__toastCallCount__ || beforeToastCount;
    const afterToastLog = Game.__D && Array.isArray(Game.__D.toastLog) ? Game.__D.toastLog.length : beforeToastLog;
    const afterTape = Array.isArray(Game.__DEV.__toastTape__) ? Game.__DEV.__toastTape__.length : beforeTape;
    result.toastDelta = { callCount: afterToastCount - beforeToastCount, toastLog: afterToastLog - beforeToastLog, tape: afterTape - beforeTape };
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && result.panelOpened === false && result.autoScrolled === false && result.focusChanged === false && result.counterAdvanced === true;
    return result;
  };

  Game.__DEV.smokeSystemCopyContractOnce = function smokeSystemCopyContractOnce(){
    const requiredGroups = Array.from(REQUIRED_SYSTEM_COPY_GROUPS);
    const bannedToneWords = Object.freeze([
      "moral", "immoral", "shame", "guilt", "right thing", "wrong thing",
      "must", "should", "hurry", "urgent", "now now", "pressure",
      "cute", "cutesy", "silly", "lol", "lmao", "vibe", "awesome"
    ]);
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      if (!list.includes(value)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const hasBadToken = (text) => /undefined|null|\[object Object\]/.test(String(text || ""));
    const textHasBannedTone = (text) => {
      const lower = String(text || "").toLowerCase();
      return bannedToneWords.filter((word) => lower.includes(word));
    };

    if (!Game.SystemCopy || typeof Game.SystemCopy !== "object") {
      fail("system_copy_exists", "Game.SystemCopy is missing");
    }
    if (!Game.System || typeof Game.System.say !== "function") {
      fail("system_say_exists", "Game.System.say is missing");
    }

    const profileLint = lintSystemCopy(Game.SystemCopy || SystemCopy);
    if (profileLint.forbiddenRemaining.length) {
      profileLint.forbiddenRemaining.forEach((item) => result.forbiddenRemaining.push(item));
      addUnique(result.failedChecks, "system_language_profile_forbidden_patterns");
    }

    requiredGroups.forEach((group) => {
      const bucket = Game.SystemCopy && Game.SystemCopy[group];
      if (!bucket || typeof bucket !== "object") {
        addUnique(result.missingCoverage, group);
        fail("required_groups_exist", group);
        return;
      }
      const codes = Object.keys(bucket).filter((key) => String(key || "").trim());
      if (!codes.length) {
        addUnique(result.missingCoverage, group);
        fail("required_groups_have_codes", group);
        return;
      }
      const code = codes[0];
      let text = "";
      try {
        text = Game.System.say(group, code, { actor: "tester", payload: { nested: true } });
      } catch (error) {
        fail("system_say_no_crash", { group, code, error: String(error && error.message ? error.message : error) });
        return;
      }
      if (typeof text !== "string" || !text.trim()) fail("system_say_non_empty", { group, code, text });
      if (hasBadToken(text)) fail("no_bad_generated_tokens", { group, code, text });
      const banned = textHasBannedTone(text);
      if (banned.length) {
        result.forbiddenRemaining.push({ group, code, text, banned });
        addUnique(result.failedChecks, "no_banned_tone_words");
      }
    });

    try {
      const missingKind = Game.System && typeof Game.System.say === "function" ? Game.System.say("missingKind", "missingCode") : "";
      const missingCode = Game.System && typeof Game.System.say === "function" ? Game.System.say("errors", "missingCode") : "";
      [missingKind, missingCode].forEach((text, index) => {
        if (typeof text !== "string" || !text.trim()) fail("missing_kind_code_fallback", { index, text });
        if (hasBadToken(text)) fail("no_bad_fallback_tokens", { index, text });
        const banned = textHasBannedTone(text);
        if (banned.length) {
          result.forbiddenRemaining.push({ group: "fallback", code: index === 0 ? "missingKind" : "missingCode", text, banned });
          addUnique(result.failedChecks, "no_banned_tone_words");
        }
      });
    } catch (error) {
      fail("missing_kind_code_fallback", String(error && error.message ? error.message : error));
    }

    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };

  Game.__DEV.smokeSystemMessagesFinalOnce = function smokeSystemMessagesFinalOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      directStringsRemaining: [],
      systemCopyOk: false,
      regressionOk: false,
      economyDeltaPairsOk: false,
      summary: {
        step: "Step 6 [10] System Messages final readiness gate",
        status: "PENDING",
        composedChecks: [],
        passedChecks: [],
        failedChecks: [],
        requiredCoverage: ["contract", "inventory", "languageProfile", "taxonomy", "textTemplates", "routing", "economyTextPairs", "ruLocale", "regressionPack"],
        directStringsOk: false,
        systemCopyCatalogOk: false,
      },
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const addAll = (list, values) => {
      if (!Array.isArray(values)) return;
      values.forEach((value) => addUnique(list, value));
    };
    const checks = Object.freeze([
      { id: "contract", fn: "smokeSystemCopyContractOnce", role: "systemCopy" },
      { id: "inventory", fn: "smokeSystemCopyInventoryOnce", role: "systemCopy" },
      { id: "languageProfile", fn: "smokeSystemLanguageProfileOnce", role: "systemCopy" },
      { id: "taxonomy", fn: "smokeSystemCodeTaxonomyOnce", role: "systemCopy" },
      { id: "textTemplates", fn: "smokeSystemTextTemplatesOnce", role: "systemCopy" },
      { id: "routing", fn: "smokeSystemRoutingOnce", role: "routing" },
      { id: "economyTextPairs", fn: "smokeSystemEconomyTextPairsOnce", role: "economy" },
      { id: "ruLocale", fn: "smokeSystemLocaleRuOnce", role: "systemCopy" },
      { id: "regressionPack", fn: "smokeSystemMessagesRegressionOnce", role: "regression" },
    ]);
    const checkResults = Object.create(null);
    checks.forEach((check) => {
      result.summary.composedChecks.push(check.id);
      const runner = Game.__DEV && Game.__DEV[check.fn];
      let output = null;
      if (typeof runner !== "function") {
        output = { ok: false, failures: [`${check.fn} missing`], forbiddenRemaining: [], missingCoverage: [check.id], failedChecks: ["missing_smoke"] };
      } else {
        try {
          output = runner();
        } catch (error) {
          output = { ok: false, failures: [{ check: "smoke_exception", detail: String(error && error.message ? error.message : error) }], forbiddenRemaining: [], missingCoverage: [], failedChecks: ["smoke_exception"] };
        }
      }
      checkResults[check.id] = output;
      if (output && output.ok === true) result.summary.passedChecks.push(check.id);
      else {
        result.summary.failedChecks.push(check.id);
        addUnique(result.failedChecks, check.id);
        addUnique(result.failures, { check: check.id, result: output });
      }
      addAll(result.forbiddenRemaining, output && output.forbiddenRemaining);
      addAll(result.missingCoverage, output && output.missingCoverage);
      addAll(result.failedChecks, output && output.failedChecks);
      if (check.id === "inventory") addAll(result.directStringsRemaining, output && output.forbiddenRemaining);
      if (check.id === "regressionPack") {
        const directStringHits = (output && Array.isArray(output.forbiddenRemaining) ? output.forbiddenRemaining : []).filter((row) => row && (row.rule === "no_console_txt" || /direct|hardcoded|Console\.txt/i.test(JSON.stringify(row))));
        addAll(result.directStringsRemaining, directStringHits);
      }
    });

    const requiredCoverage = result.summary.requiredCoverage;
    requiredCoverage.forEach((id) => {
      if (!Object.prototype.hasOwnProperty.call(checkResults, id)) addUnique(result.missingCoverage, id);
    });
    const catalogHasCodes = !!(Game.SystemCopy && REQUIRED_SYSTEM_COPY_GROUPS.every((group) => Game.SystemCopy[group] && Object.keys(Game.SystemCopy[group]).length));
    const systemCopyChecks = ["contract", "inventory", "languageProfile", "taxonomy", "textTemplates", "ruLocale"];
    result.summary.systemCopyCatalogOk = catalogHasCodes && systemCopyChecks.every((id) => checkResults[id] && checkResults[id].ok === true);
    result.summary.directStringsOk = result.directStringsRemaining.length === 0;
    result.systemCopyOk = result.summary.systemCopyCatalogOk;
    result.regressionOk = !!(checkResults.regressionPack && checkResults.regressionPack.ok === true);
    result.economyDeltaPairsOk = !!(checkResults.economyTextPairs && checkResults.economyTextPairs.ok === true);
    if (!catalogHasCodes) addUnique(result.failedChecks, "system_copy_catalog_missing_codes");
    if (!result.summary.directStringsOk) addUnique(result.failedChecks, "direct_strings_remaining");
    if (!result.regressionOk) addUnique(result.failedChecks, "regression_pack_failed");
    if (!result.economyDeltaPairsOk) addUnique(result.failedChecks, "economy_delta_pairs_failed");
    if (!result.systemCopyOk) addUnique(result.failedChecks, "system_copy_failed");
    result.summary.status = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && result.directStringsRemaining.length === 0 && result.systemCopyOk === true && result.regressionOk === true && result.economyDeltaPairsOk === true ? "READY_FOR_RUNTIME_SMOKE" : "BLOCKED";
    result.ok = result.summary.status === "READY_FOR_RUNTIME_SMOKE";
    return result;
  };

})();
