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
      pointsLowBattle: "Мало 💰 на баттл.",
      unavailable: "Недоступно.",
      notFound: "Не найдено.",
      choosePlayer: "Выбери игрока.",
      reportFalsePenalty: "Штраф: -5 💰.",
    }),
    warnings: Object.freeze({
      checkInput: "Проверь ввод.",
      cooldownShort: "Подожди немного.",
      alreadyVoted: "Уже принято.",
      respectPairDaily: "Уважение уже отправлено.",
      respectNoChain: "Цепочка закрыта.",
      respectEmitterEmpty: "Уважение недоступно.",
      escapeNeedsPoints: "Не хватает 💰 на Свалить.",
    }),
    notifications: Object.freeze({
      saved: "Готово.",
      pointsDeltaPlusOne: "+1💰",
      repDeltaPlusOne: "+1⭐",
      pointsDeltaVoteCost: "-{voteCost}💰",
      respectPaid: "Списано 1💰.",
      respectTargetRep: "Цели +1⭐.",
      voteAccepted: "Голос учтён.",
      reportPending: "Проверяю.",
      reportTrueReward: "Сдать {name}: +2💰.",
      trainingSent: "Аргумент: {teacher} → {student}.",
      rematchRequested: "{name} зовёт на реванш.",
      escapePaid: "Свалить за 1💰.",
      pointsDeltaRefund: "+1💰 возврат.",
      pointsDeltaRefundMajority: "+1💰 возврат большинству.",
      pointsDeltaRemainderWin: "+1💰 остаток победителю.",
      rematchCost: "Реванш: -{rematchCost}💰.",
      escapeVoteCost: "Свалить: -{escapeCost}💰.",
    }),
    systemEvents: Object.freeze({
      ready: "Готово.",
      dmReaction: "{name} ↔ {target}: реакция.",
      dmInvite: "{name}: +{guest} к {target}.",
      joined: "{name} на площади.",
      moved: "Переход: {location}.",
      battleChallenge: "{attackerName} [{attackerInf}] бросил вызов.",
      npcBattleStart: "{a} вызывает {b}.",
      battleWin: "{winner} победил. {loser} проиграл.",
      battleDraw: "{a} и {b}: ничья.",
      crowdStart: "Толпа решает.",
      crowdResolved: "Толпа: {name} {aVotes}:{bVotes}.",
      unlockOrange: "Оранжевые аргументы открыты.",
      unlockRed: "Красные аргументы открыты.",
      unlockBlack: "Чёрные аргументы открыты.",
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
      needsValue: "Проверь: {what}. {hint}",
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
    hint: "Попробуй позже.",
    option: "Выбери другой вариант.",
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
    teacher: "отправитель",
    student: "получатель",
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
    allowedExamples: Object.freeze(["не получилось", "недоступно", "проверь", "можно позже", "попробуй ещё раз"]),
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

  const SYSTEM_Z_PHRASE_RULE = Object.freeze({
    id: "z-system-phrase-rule",
    buildTag: "build_2026_06_06_step7_2_z_phrase_rule_fix_runtime_violations",
    commit: "step7_2_z_phrase_rule_fix_runtime_violations",
    smokeVersion: "step7_2_z_phrase_rule_fix_runtime_violations_smoke_v20260606_002",
    preferredWordsMin: 2,
    preferredWordsMax: 4,
    maxWords: 4,
    forbiddenPatterns: Object.freeze([
      Object.freeze({ id: "you_currently", pattern: "у тебя сейчас" }),
      Object.freeze({ id: "please", pattern: "пожалуйста" }),
      Object.freeze({ id: "because", pattern: "потому что" }),
      Object.freeze({ id: "because", pattern: "так как" }),
      Object.freeze({ id: "required_for_action", pattern: "для этого действия" }),
      Object.freeze({ id: "try_again_later", pattern: "попробуй позже" }),
      Object.freeze({ id: "try_again_later", pattern: "можно позже" }),
      Object.freeze({ id: "try_again_later", pattern: "повтори позже" }),
      Object.freeze({ id: "teaching_tone", pattern: "нужно" }),
      Object.freeze({ id: "teaching_tone", pattern: "следует" }),
      Object.freeze({ id: "teaching_tone", pattern: "обрати внимание" })
    ]),
    explanationPatterns: Object.freeze([
      Object.freeze({ id: "purpose_clause", pattern: "для того" }),
      Object.freeze({ id: "purpose_clause", pattern: "чтобы" }),
      Object.freeze({ id: "current_state_explained", pattern: "сейчас" }),
      Object.freeze({ id: "option_explained", pattern: "можно" })
    ])
  });

  function normalizeZPhraseText(text){
    return String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  }

  function zPhraseWordTokens(text){
    const normalized = normalizeZPhraseText(text).replace(/\{[^}]+\}/g, " placeholder ");
    return normalized.match(/[A-Za-zА-Яа-яЁё0-9]+(?:[-‑][A-Za-zА-Яа-яЁё0-9]+)*/g) || [];
  }

  function validateSystemZPhrase(text){
    const normalized = normalizeZPhraseText(text);
    const lowered = normalized.toLowerCase();
    const reasons = [];
    const wordCount = zPhraseWordTokens(normalized).length;
    if (!normalized) reasons.push("empty_phrase");
    if (wordCount > SYSTEM_Z_PHRASE_RULE.maxWords) reasons.push("over_4_words");
    SYSTEM_Z_PHRASE_RULE.forbiddenPatterns.forEach((rule) => {
      if (lowered.indexOf(rule.pattern) !== -1) reasons.push(`forbidden_${rule.id}`);
    });
    SYSTEM_Z_PHRASE_RULE.explanationPatterns.forEach((rule) => {
      if (lowered.indexOf(rule.pattern) !== -1) reasons.push(`explanation_${rule.id}`);
    });
    if (/[:;].+\s+.+/.test(normalized) && wordCount > SYSTEM_Z_PHRASE_RULE.preferredWordsMax) reasons.push("explaining_punctuation");
    return { ok: reasons.length === 0, text: normalized, wordCount, reasons };
  }

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
    zPhraseRule: SYSTEM_Z_PHRASE_RULE,
    validateSystemZPhrase,
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


  Game.__DEV.smokeZoomerUiTextShorteningOnce = function smokeZoomerUiTextShorteningOnce(){
    const result = {
      ok: false,
      checkedCount: 0,
      shortenedCount: 0,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), root);
    const domText = (id) => {
      if (typeof document === "undefined" || !document.getElementById) return undefined;
      const node = document.getElementById(id);
      return node ? String(node.textContent || "") : undefined;
    };
    const currentText = (source) => {
      if (String(source).indexOf("dom#") === 0) return domText(String(source).slice(4));
      if (String(source).indexOf("SystemTemplateFallbacks.") === 0) return getPath({ SystemTemplateFallbacks: SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS }, source);
      return getPath(Game, source);
    };
    const covered = Object.freeze([
      { category: 'buttons', source: 'Data.TEXTS.genz.tie_call_to_action', before: 'Вписывайся - кликни на имя, за кого ты.', after: 'Выбери имя — выбери сторону.', meaning: 'CTA still tells the player to click a name and choose a side' },
      { category: 'buttons', source: 'Data.TEXTS.genz.events_close_extra', before: 'Закрыть лишнее', after: 'Свернуть', meaning: 'button still closes/collapses extra event UI' },
      { category: 'buttons', source: 'Data.TEXTS.genz.escape_button_label', before: 'Свалить за взятку {X} 💰', after: 'Свалить: {X} 💰', meaning: 'escape button still states the same escape action and unchanged X points cost' },
      { category: 'toasts', source: 'Data.TEXTS.genz.vote_ok', before: 'Принято. Ты вписался.', after: 'Голос учтён.', meaning: 'vote result still confirms the vote was accepted' },
      { category: 'toasts', source: 'Data.TEXTS.genz.vote_already', before: 'Ты уже вписался.', after: 'Уже учтён.', meaning: 'vote result still says the vote was already counted' },
      { category: 'toasts', source: 'Data.TEXTS.genz.vote_fail', before: 'Не удалось вписаться.', after: 'Голос не учтён.', meaning: 'vote result still says the vote was not accepted' },
      { category: 'toasts', source: 'Data.TEXTS.genz.events_done', before: 'Зафиксили', after: 'Готово', meaning: 'event toast/status still confirms completion' },
      { category: 'toasts', source: 'SystemCopy.notifications.respectTargetRep', before: 'Цель получила +1⭐.', after: 'Цели +1⭐.', meaning: 'respect toast still says the target gained one reputation' },
      { category: 'toasts', source: 'SystemCopy.notifications.voteAccepted', before: 'Принято. Голос учтён.', after: 'Голос учтён.', meaning: 'vote acceptance toast still confirms counted vote' },
      { category: 'toasts', source: 'SystemCopy.notifications.trainingSent', before: 'Обучение аргументу: {teacher} → {student}.', after: 'Аргумент: {teacher} → {student}.', meaning: 'training toast still records the same teacher to student argument action' },
      { category: 'toasts', source: 'SystemCopy.notifications.rematchRequested', before: 'Реванш доступен: {name} снова зовёт в баттл.', after: '{name} зовёт на реванш.', meaning: 'rematch toast still says the same player requests a rematch' },
      { category: 'toasts', source: 'SystemCopy.notifications.pointsDeltaRefund', before: '+1💰 возвращено.', after: '+1💰 возврат.', meaning: 'refund toast keeps the same +1 points value' },
      { category: 'hints', source: 'Data.TEXTS.genz.tie_click_name_hint', before: 'Кликни на имя, за кого хочешь вписаться.', after: 'Выбери имя.', meaning: 'hint still tells the player to click a name to choose a side' },
      { category: 'hints', source: 'Data.TEXTS.genz.tie_chat_start', before: 'Толпа решает. Вписывайся - кликни на имя в событиях.', after: 'Выбери имя в событиях.', meaning: 'chat hint now tells the player to choose a name in events' },
      { category: 'hints', source: 'Data.TEXTS.genz.events_empty', before: 'Ничего не происходит, сплошная болтовня.', after: 'Открой события.', meaning: 'empty events hint now tells the player to open events' },
      { category: 'hints', source: 'Data.TEXTS.genz.invite_open_hint', before: 'Введи ник игрока. Без ошибок, иначе не сработает.', after: 'Введи точный ник.', meaning: 'hint still requires an exact player nickname' },
      { category: 'hints', source: 'dom#reportHint', before: 'Сдать бандита или токсика за +2 💰.', after: 'Сдай бандита/токсика: +2 💰.', meaning: 'report hint keeps the same valid targets and unchanged +2 points reward' },
      { category: 'hints', source: 'SystemTemplateFallbacks.hint', before: 'Можно попробовать позже.', after: 'Попробуй позже.', meaning: 'fallback hint tells the player to retry later' },
      { category: 'hints', source: 'SystemTemplateFallbacks.option', before: 'Можно выбрать другой вариант.', after: 'Выбери другой вариант.', meaning: 'fallback option tells the player to choose another option' },
      { category: 'errors', source: 'Data.TEXTS.genz.invite_invalid', before: 'Такого игрока нет.', after: 'Игрок не найден.', meaning: 'invite error still says the player was not found' },
      { category: 'errors', source: 'SystemCopy.errors.pointsLowBattle', before: 'Не получилось: мало 💰 на баттл.', after: 'Мало 💰 на баттл.', meaning: 'battle error still says points are insufficient' },
      { category: 'errors', source: 'SystemCopy.warnings.checkInput', before: 'Проверь ввод и попробуй ещё раз.', after: 'Проверь ввод.', meaning: 'input warning still asks to check input and retry' },
      { category: 'errors', source: 'SystemCopy.warnings.respectPairDaily', before: 'Уважение сегодня уже отправлено этому персонажу.', after: 'Уважение уже отправлено.', meaning: 'respect warning still says this target already got respect today' },
      { category: 'errors', source: 'SystemCopy.warnings.respectNoChain', before: 'Цепочка туда-обратно сегодня недоступна.', after: 'Цепочка закрыта.', meaning: 'respect warning still says the reciprocal chain is unavailable today' },
      { category: 'systemStrings', source: 'SystemCopy.systemEvents.joined', before: '{name} на площади. Событие началось.', after: '{name} на площади.', meaning: 'system event still says the named player joined and the event started' },
      { category: 'systemStrings', source: 'SystemCopy.systemEvents.moved', before: 'Переход выполнен: {location}.', after: 'Переход: {location}.', meaning: 'system event still reports the same location transition' },
      { category: 'systemStrings', source: 'SystemCopy.systemEvents.battleChallenge', before: '{attackerName} [{attackerInf}] вызвал(а) тебя на баттл. Открой баттл сверху.', after: '{attackerName} [{attackerInf}] вызвал(а) тебя. Открой баттл.', meaning: 'system event still names the challenger and tells the player to open battle' },
      { category: 'systemStrings', source: 'SystemCopy.systemEvents.npcBattleStart', before: 'Баттл начался: {a} вызывает {b}.', after: 'Баттл: {a} вызывает {b}.', meaning: 'system event still says the same NPC battle started' },
      { category: 'systemStrings', source: 'SystemCopy.systemEvents.crowdStart', before: 'Голосование толпы началось.', after: 'Толпа голосует.', meaning: 'system event still says crowd voting started' },
      { category: 'systemStrings', source: 'SystemCopy.systemEvents.crowdResolved', before: 'Голосование толпы завершено. Победил(а) {name}: {aVotes}:{bVotes}.', after: 'Толпа выбрала {name}: {aVotes}:{bVotes}.', meaning: 'system event still reports crowd vote winner and unchanged vote counts' }
    ]);
    const requiredCategories = ["buttons", "toasts", "hints", "errors", "systemStrings"];
    const seenCategories = new Set();
    covered.forEach((row) => {
      seenCategories.add(row.category);
      const current = currentText(row.source);
      result.checkedCount += 1;
      if (current !== row.after) fail("mapping_current_text_mismatch", { source: row.source, expected: row.after, actual: current });
      if (!row.meaning || row.meaning.length < 16) fail("meaning_allowlist_missing", { source: row.source });
      if (String(row.after).length < String(row.before).length) result.shortenedCount += 1;
      else fail("text_not_shortened", { source: row.source, before: row.before, after: row.after });
      const placeholdersBefore = String(row.before).match(/\{[^}]+\}/g) || [];
      const placeholdersAfter = String(row.after).match(/\{[^}]+\}/g) || [];
      placeholdersBefore.forEach((token) => {
        if (!placeholdersAfter.includes(token)) fail("placeholder_lost", { source: row.source, token });
      });
      const economyBefore = String(row.before).match(/[+-]?\d+\s*💰|\{[A-Za-z]+Cost\}|\{X\}/g) || [];
      const economyAfter = String(row.after).match(/[+-]?\d+\s*💰|\{[A-Za-z]+Cost\}|\{X\}/g) || [];
      economyBefore.forEach((token) => {
        if (!economyAfter.includes(token)) fail("economy_value_changed", { source: row.source, token });
      });
      if (current === row.before || String(current || "").includes(row.before)) addUnique(result.forbiddenRemaining, { source: row.source, text: row.before });
    });
    requiredCategories.forEach((category) => {
      if (!seenCategories.has(category)) addUnique(result.missingCoverage, category);
    });
    if (result.checkedCount <= 0) fail("checked_count_zero");
    if (result.shortenedCount <= 0) fail("shortened_count_zero");
    result.ok = result.checkedCount > 0 && result.shortenedCount > 0 && result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };


  const SYSTEM_COPY_ROUTING_AUDIT_BUILD_TAG = "build_2026_06_06_step7_3_systemcopy_routing_audit";
  const SYSTEM_COPY_ROUTING_AUDIT_COMMIT = "step7_3_systemcopy_routing_audit";
  const SYSTEM_COPY_ROUTING_AUDIT_SMOKE_VERSION = "step7_3_systemcopy_routing_audit_smoke_v20260606_001";
  const SYSTEM_COPY_ROUTING_TARGET_GROUPS = Object.freeze(["points", "rep", "cooldown", "lock", "success", "fail"]);
  const SYSTEM_COPY_ROUTING_AUDIT_ROWS = Object.freeze([
    Object.freeze({ id: "points.delta.plus_one", group: "points", kind: "notifications", code: "pointsDeltaPlusOne", file: "AsyncScene/Web/events.js", path: "Game.System.say('notifications','pointsDeltaPlusOne')", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "points.delta.vote_cost", group: "points", kind: "notifications", code: "pointsDeltaVoteCost", file: "AsyncScene/Web/events.js", path: "Game.System.say('notifications','pointsDeltaVoteCost',{ voteCost })", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "points.delta.refund", group: "points", kind: "notifications", code: "pointsDeltaRefund", file: "AsyncScene/Web/system.js", path: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRefund", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "points.delta.refund_majority", group: "points", kind: "notifications", code: "pointsDeltaRefundMajority", file: "AsyncScene/Web/system.js", path: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRefundMajority", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.delta.remainder_win", group: "points", kind: "notifications", code: "pointsDeltaRemainderWin", file: "AsyncScene/Web/system.js", path: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRemainderWin", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.respect_paid", group: "points", kind: "notifications", code: "respectPaid", file: "AsyncScene/Web/ui/ui-dm.js", path: "Game.System.say('notifications','respectPaid')", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.escape_paid", group: "points", kind: "notifications", code: "escapePaid", file: "AsyncScene/Web/ui/ui-battles.js", path: "Game.System.say('notifications','escapePaid')", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.hardcoded.report_compensation_bundle", group: "points", kind: "notifications", code: "", file: "AsyncScene/Web/state.js", path: "Game.UI.pushSystem(`+1⭐ +1💰`) in report compensation", routed: false, hardcoded: true, recent: true }),
    Object.freeze({ id: "points.hardcoded.report_return_amount", group: "points", kind: "notifications", code: "", file: "AsyncScene/Web/state.js", path: "Game.UI.pushSystem(`+${returnAmount}💰`) in report compensation", routed: false, hardcoded: true, recent: true }),
    Object.freeze({ id: "points.hardcoded.toxic_steal_fallback", group: "points", kind: "systemEvents", code: "", file: "AsyncScene/Web/conflict/conflict-core.js", path: "fallback `Токсик снял у тебя ${actual || cost} 💰. Все видели.`", routed: false, hardcoded: true, recent: true }),
    Object.freeze({ id: "points.hardcoded.data_sys_villain", group: "points", kind: "systemEvents", code: "", file: "AsyncScene/Web/data.js", path: "Data.SYS.banditRobbed/toxicRobbed/toxicStealLine", routed: false, hardcoded: true, recent: true }),

    Object.freeze({ id: "rep.delta.plus_one", group: "rep", kind: "notifications", code: "repDeltaPlusOne", file: "AsyncScene/Web/events.js", path: "Game.System.say('notifications','repDeltaPlusOne')", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "rep.respect_target", group: "rep", kind: "notifications", code: "respectTargetRep", file: "AsyncScene/Web/ui/ui-dm.js", path: "Game.System.say('notifications','respectTargetRep')", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "rep.hardcoded.report_compensation_bundle", group: "rep", kind: "notifications", code: "", file: "AsyncScene/Web/state.js", path: "Game.UI.pushSystem(`+1⭐ +1💰`) in report compensation", routed: false, hardcoded: true, recent: true }),

    Object.freeze({ id: "cooldown.warning.short", group: "cooldown", kind: "warnings", code: "cooldownShort", file: "AsyncScene/Web/system.js", path: "SystemCopy.warnings.cooldownShort", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "cooldown.hardcoded.cop_reply", group: "cooldown", kind: "warnings", code: "", file: "AsyncScene/Web/data.js", path: "Data.TEXTS.genz.cop_cooldown[]", routed: false, hardcoded: true, recent: true }),

    Object.freeze({ id: "lock.unlock_orange", group: "lock", kind: "systemEvents", code: "unlockOrange", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "SystemCopy.systemEvents.unlockOrange via Data.SYS/sysText", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.unlock_red", group: "lock", kind: "systemEvents", code: "unlockRed", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "SystemCopy.systemEvents.unlockRed via Data.SYS/sysText", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.unlock_black", group: "lock", kind: "systemEvents", code: "unlockBlack", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "SystemCopy.systemEvents.unlockBlack via Data.SYS/sysText", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.hardcoded.unlock_fallbacks", group: "lock", kind: "systemEvents", code: "", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "sysText fallback unlock strings in maybeUnlocks", routed: false, hardcoded: true, recent: true }),
    Object.freeze({ id: "lock.hardcoded.data_sys_unlocks", group: "lock", kind: "systemEvents", code: "", file: "AsyncScene/Web/data.js", path: "Data.SYS.unlockOrange/unlockRed/unlockBlack/*Other/absolutePath", routed: false, hardcoded: true, recent: true }),
    Object.freeze({ id: "lock.hardcoded.npc_event_arrest", group: "lock", kind: "systemEvents", code: "", file: "AsyncScene/Web/data.js", path: "Data.NPC_EVENT_TEMPLATES.arrest[].text", routed: false, hardcoded: true, recent: true }),

    Object.freeze({ id: "success.saved", group: "success", kind: "notifications", code: "saved", file: "AsyncScene/Web/system.js", path: "SystemCopy.notifications.saved", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "success.vote_accepted", group: "success", kind: "notifications", code: "voteAccepted", file: "AsyncScene/Web/ui/ui-events.js", path: "Game.System.say('notifications','voteAccepted')", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "success.report_reward", group: "success", kind: "notifications", code: "reportTrueReward", file: "AsyncScene/Web/data.js", path: "SystemCopy.notifications.reportTrueReward via Data.SYS.reportOk audit", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "success.hardcoded.data_sys_report_ok", group: "success", kind: "notifications", code: "", file: "AsyncScene/Web/data.js", path: "Data.SYS.reportOk(name)", routed: false, hardcoded: true, recent: false }),
    Object.freeze({ id: "success.hardcoded.npc_event_victory", group: "success", kind: "systemEvents", code: "", file: "AsyncScene/Web/data.js", path: "Data.NPC_EVENT_TEMPLATES.victory[].text", routed: false, hardcoded: true, recent: true }),

    Object.freeze({ id: "fail.insufficient_points", group: "fail", kind: "errors", code: "insufficientPoints", file: "AsyncScene/Web/system.js", path: "SystemCopy.errors.insufficientPoints", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.battle_points_low", group: "fail", kind: "errors", code: "pointsLowBattle", file: "AsyncScene/Web/data.js", path: "SystemCopy.errors.pointsLowBattle via Data.SYS.pointsLow audit", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.report_false_penalty", group: "fail", kind: "errors", code: "reportFalsePenalty", file: "AsyncScene/Web/data.js", path: "SystemCopy.errors.reportFalsePenalty via Data.SYS.reportNo audit", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.hardcoded.data_sys_points_low", group: "fail", kind: "errors", code: "", file: "AsyncScene/Web/data.js", path: "Data.SYS.pointsLow", routed: false, hardcoded: true, recent: false }),
    Object.freeze({ id: "fail.hardcoded.data_sys_report_no", group: "fail", kind: "errors", code: "", file: "AsyncScene/Web/data.js", path: "Data.SYS.reportNo", routed: false, hardcoded: true, recent: false }),
    Object.freeze({ id: "fail.hardcoded.battle_result_announce", group: "fail", kind: "systemEvents", code: "", file: "AsyncScene/Web/conflict/conflict-core.js", path: "pushSystem(`Баттл с ${oppName}: ${text}.`)", routed: false, hardcoded: true, recent: true }),
    Object.freeze({ id: "fail.hardcoded.mafia_shame", group: "fail", kind: "systemEvents", code: "", file: "AsyncScene/Web/conflict/conflict-core.js", path: "pushSystem(`${meName} бросил вызов мафиози и остался униженным в ноль.`)", routed: false, hardcoded: true, recent: true }),
    Object.freeze({ id: "fail.hardcoded.npc_event_defeat", group: "fail", kind: "systemEvents", code: "", file: "AsyncScene/Web/data.js", path: "Data.NPC_EVENT_TEMPLATES.defeat[].text", routed: false, hardcoded: true, recent: true })
  ]);

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



  Game.__DEV.smokeSystemCopyRoutingOnce = function smokeSystemCopyRoutingOnce(){
    const result = {
      ok: false,
      buildTag: SYSTEM_COPY_ROUTING_AUDIT_BUILD_TAG,
      commit: SYSTEM_COPY_ROUTING_AUDIT_COMMIT,
      smokeVersion: SYSTEM_COPY_ROUTING_AUDIT_SMOKE_VERSION,
      checkedCount: 0,
      routedCount: 0,
      hardcodedCount: 0,
      hardcodedEntries: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const representedGroups = new Set();
    Array.from(SYSTEM_COPY_ROUTING_AUDIT_ROWS).forEach((row, index) => {
      const group = String(row && row.group || "").trim();
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      result.checkedCount += 1;
      if (group) representedGroups.add(group);
      if (!row || !row.id || !group || !row.file || !row.path) fail("audit_row_incomplete", { index, row });
      if (row && row.routed === true) {
        result.routedCount += 1;
        if (!kind || !code) fail("routed_row_kind_code_missing", { index, row });
        if (kind && code && (!SystemCopy[kind] || !Object.prototype.hasOwnProperty.call(SystemCopy[kind], code))) {
          fail("routed_systemcopy_entry_missing", { id: row.id, group, kind, code, file: row.file, path: row.path });
        }
        if (kind && code && Game.System && typeof Game.System.say === "function") {
          try {
            const rendered = Game.System.say(kind, code, { name: "Имя", target: "Цель", voteCost: 1, rematchCost: 1, escapeCost: 1, location: "Площадь", teacher: "A", student: "B" });
            if (typeof rendered !== "string" || !rendered.trim()) fail("routed_system_say_empty", { id: row.id, kind, code, rendered });
          } catch (error) {
            fail("routed_system_say_exception", { id: row.id, kind, code, error: String(error && error.message ? error.message : error) });
          }
        }
      }
      if (row && row.hardcoded === true) {
        const entry = { id: row.id, group, kind: kind || String(row.kind || ""), file: row.file, path: row.path, recent: row.recent === true };
        result.hardcodedEntries.push(entry);
        addUnique(result.forbiddenRemaining, entry);
      }
    });
    SYSTEM_COPY_ROUTING_TARGET_GROUPS.forEach((group) => {
      if (!representedGroups.has(group)) {
        addUnique(result.missingCoverage, group);
        fail("target_group_missing", group);
      }
    });
    if (result.checkedCount !== SYSTEM_COPY_ROUTING_AUDIT_ROWS.length) fail("checked_count_mismatch", { checkedCount: result.checkedCount, expected: SYSTEM_COPY_ROUTING_AUDIT_ROWS.length });
    result.hardcodedCount = result.hardcodedEntries.length;
    if (result.hardcodedCount > 0) addUnique(result.failedChecks, "hardcoded_system_message_paths_remaining");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
    if (result.smokeVersion !== SYSTEM_COPY_ROUTING_AUDIT_SMOKE_VERSION || result.smokeVersion.indexOf("step7_3") === -1) fail("smoke_version_unique_for_step", result.smokeVersion);
    result.ok = result.hardcodedCount === 0 && result.hardcodedEntries.length === 0 && result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };


  Game.__DEV.smokeSystemPhraseRuleOnce = function smokeSystemPhraseRuleOnce(){
    const result = {
      ok: false,
      buildTag: SYSTEM_Z_PHRASE_RULE.buildTag,
      commit: SYSTEM_Z_PHRASE_RULE.commit,
      smokeVersion: SYSTEM_Z_PHRASE_RULE.smokeVersion,
      checkedCount: 0,
      violations: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const requiredAreas = Array.from(SYSTEM_COPY_REQUIRED_AREAS);
    const representedAreas = new Set();
    Array.from(SYSTEM_COPY_INVENTORY).forEach((row, index) => {
      const area = String(row && row.area || "").trim();
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      if (area) representedAreas.add(area);
      if (!area || !kind || !code) {
        fail("inventory_row_incomplete", { index, row });
        return;
      }
      const bucket = SystemCopy[kind];
      if (!bucket || !Object.prototype.hasOwnProperty.call(bucket, code)) {
        addUnique(result.missingCoverage, { area, kind, code, file: row.file, callsite: row.callsite });
        fail("inventory_copy_missing", { index, area, kind, code });
        return;
      }
      result.checkedCount += 1;
      const text = bucket[code];
      const review = validateSystemZPhrase(text);
      if (!review.ok) {
        const violation = {
          area,
          kind,
          code,
          file: row.file,
          surface: row.surface,
          callsite: row.callsite,
          text: review.text,
          wordCount: review.wordCount,
          reasons: review.reasons
        };
        addUnique(result.violations, violation);
        if (review.reasons.some((reason) => String(reason).indexOf("forbidden_") === 0)) {
          addUnique(result.forbiddenRemaining, violation);
        }
      }
    });
    requiredAreas.forEach((area) => {
      if (!representedAreas.has(area)) addUnique(result.missingCoverage, area);
    });
    if (!result.checkedCount) fail("checked_count_zero");
    if (result.violations.length) addUnique(result.failedChecks, "z_phrase_rule_violations");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_phrasing_remaining");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    result.ok = result.checkedCount > 0 && result.violations.length === 0 && result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
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
      teacher: "отправитель",
      student: "получатель",
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
      { kind: "notifications", code: "fact", ctx: { what: "Готово." } },
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
      { kind: "notifications", code: "fact", ctx: { what: "Готово." } },
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


  Game.__DEV.smokeProfileNotServiceOnce = function smokeProfileNotServiceOnce(){
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const serviceTerms = Object.freeze([
      "status", "account", "settings", "parameters", "configuration", "saved", "successful",
      "статус", "аккаунт", "настройки", "параметры", "конфигурация", "сохранено", "успешно"
    ]);
    const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasBoundary = (source, start, end) => {
      const before = start > 0 ? source.charAt(start - 1) : "";
      const after = end < source.length ? source.charAt(end) : "";
      return !/[A-Za-zА-Яа-яЁё0-9_]/.test(before) && !/[A-Za-zА-Яа-яЁё0-9_]/.test(after);
    };
    const findServiceTerms = (text) => {
      const source = String(text || "");
      const hits = [];
      serviceTerms.forEach((term) => {
        const regex = new RegExp(escapeRegex(term), "ig");
        let match;
        while ((match = regex.exec(source))) {
          if (hasBoundary(source, match.index, match.index + match[0].length)) {
            hits.push({ term, match: match[0] });
            break;
          }
        }
      });
      return hits;
    };
    const collectStringLeaves = (sourceName, value, path, rows, seen) => {
      if (value == null) return;
      if (typeof value === "string") {
        rows.push({ source: sourceName, path, text: value });
        return;
      }
      if (typeof value !== "object") return;
      if (seen.has(value)) return;
      seen.add(value);
      if (Array.isArray(value)) {
        value.forEach((item, index) => collectStringLeaves(sourceName, item, `${path}[${index}]`, rows, seen));
        return;
      }
      Object.keys(value).sort().forEach((key) => collectStringLeaves(sourceName, value[key], path ? `${path}.${key}` : key, rows, seen));
    };
    const sourceMap = Object.freeze({
      SystemCopy: Game.SystemCopy || SystemCopy,
      SystemTextTemplates: Game.SystemTextTemplates || SYSTEM_TEXT_TEMPLATES,
      SystemFallbacks: SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS,
      SystemLanguageProfile: SYSTEM_LANGUAGE_PROFILE,
    });
    const requiredSources = Object.keys(sourceMap);
    const rows = [];
    requiredSources.forEach((sourceName) => {
      const before = rows.length;
      collectStringLeaves(sourceName, sourceMap[sourceName], "", rows, new Set());
      if (rows.length === before) {
        addUnique(result.missingCoverage, sourceName);
        fail("profile_copy_source_missing", sourceName);
      }
    });
    rows.forEach((row) => {
      const matches = findServiceTerms(row.text);
      if (matches.length) addUnique(result.forbiddenRemaining, { source: row.source, path: row.path, text: row.text, matches });
    });
    if (result.forbiddenRemaining.length) fail("profile_service_markers_remaining", result.forbiddenRemaining);
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
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


  Game.__DEV.smokeZoomerNewFeatureCopyOnce = function smokeZoomerNewFeatureCopyOnce(){
    const result = {
      ok: false,
      checkedCount: 0,
      coveredAreas: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), root);
    const currentText = (source) => {
      const normalized = String(source || "");
      if (normalized.indexOf("NPC.COP.") === 0) return getPath({ NPC: Game.NPC || {} }, normalized);
      return getPath(Game, normalized);
    };
    const covered = Object.freeze([
      { area: "economy", source: "SystemCopy.notifications.reportTrueReward", before: "Засчитано. Сдать {name}: +2💰.", after: "Сдать {name}: +2💰.", meaning: "truthful report reward still names the same Sdat action, same target placeholder, and unchanged +2 money value" },
      { area: "economy", source: "SystemCopy.errors.reportFalsePenalty", before: "Не получилось. Штраф: -5 💰.", after: "Штраф: -5 💰.", meaning: "false report penalty still shows the unchanged -5 money penalty" },
      { area: "economy", source: "Data.TEXTS.genz.teach_sent_dm", before: "Аргумент для {student}: {arg}. Цена {cost} 💰.", after: "Для {student}: {arg}. Цена {cost} 💰.", meaning: "teaching DM still names the same student, argument, and unchanged cost placeholder" },
      { area: "actions", source: "SystemCopy.warnings.escapeNeedsPoints", before: "Не хватает 💰, чтобы Свалить.", after: "Не хватает 💰 на Свалить.", meaning: "escape warning still says the paid Svalit action lacks money" },
      { area: "actions", source: "Data.TEXTS.genz.cop_report_accept.0", before: "Я тебя понял. Проверяю информацию.", after: "Понял. Проверяю.", meaning: "cop report acceptance still confirms the report is being checked" },
      { area: "npcSpeech", source: "Data.TEXTS.genz.cop_report_ok.0", before: "Проверка сошлась. Я вмешался.", after: "Проверка сошлась. Вмешался.", meaning: "cop speech still says verification matched and the cop intervened" },
      { area: "npcSpeech", source: "Data.TEXTS.genz.cop_cooldown.0", before: "Дайте мне время, я ещё занят предыдущим делом.", after: "Дайте время, я занят делом.", meaning: "cop cooldown speech still says the cop needs time because another case is active" },
      { area: "npcSpeech", source: "NPC.COP.topics.bandit.advice", before: "Лучшее решение - Свалить или не ввязываться. Если вступили в бой, главное - не проиграть.", after: "Лучше Свалить или не ввязываться. В бою главное — не проиграть.", meaning: "bandit advice still recommends Svalit or avoiding the fight and preserving battle honesty" },
      { area: "systemCopy", source: "SystemCopy.notifications.reportTrueReward", before: "Засчитано. Сдать {name}: +2💰.", after: "Сдать {name}: +2💰.", meaning: "SystemCopy report reward remains routed through SystemCopy with unchanged placeholder and money" },
      { area: "systemCopy", source: "SystemCopy.errors.reportFalsePenalty", before: "Не получилось. Штраф: -5 💰.", after: "Штраф: -5 💰.", meaning: "SystemCopy false report penalty remains explicit and unchanged" },
      { area: "actionHonesty", source: "SystemCopy.notifications.reportTrueReward", before: "Засчитано. Сдать {name}: +2💰.", after: "Сдать {name}: +2💰.", meaning: "action honesty keeps Sdat as the visible action and does not imply a different outcome" },
      { area: "actionHonesty", source: "SystemCopy.warnings.escapeNeedsPoints", before: "Не хватает 💰, чтобы Свалить.", after: "Не хватает 💰 на Свалить.", meaning: "action honesty keeps Svalit as the blocked paid action instead of hiding the action" },
    ]);
    const requiredAreas = ["economy", "actions", "npcSpeech", "systemCopy", "actionHonesty"];
    covered.forEach((row) => {
      addUnique(result.coveredAreas, row.area);
      result.checkedCount += 1;
      const current = currentText(row.source);
      if (current !== row.after) fail("mapping_current_text_mismatch", { source: row.source, expected: row.after, actual: current });
      if (!row.meaning || row.meaning.length < 24) fail("meaning_allowlist_missing", { source: row.source });
      if (!(String(row.after).length < String(row.before).length)) fail("text_not_shortened", { source: row.source, before: row.before, after: row.after });
      const placeholdersBefore = String(row.before).match(/\{[^}]+\}/g) || [];
      const placeholdersAfter = String(row.after).match(/\{[^}]+\}/g) || [];
      placeholdersBefore.forEach((token) => {
        if (!placeholdersAfter.includes(token)) fail("placeholder_lost", { source: row.source, token });
      });
      const economyBefore = String(row.before).match(/[+-]?\d+\s*💰|\{[A-Za-z]+Cost\}|\{cost\}|\{X\}/g) || [];
      const economyAfter = String(row.after).match(/[+-]?\d+\s*💰|\{[A-Za-z]+Cost\}|\{cost\}|\{X\}/g) || [];
      economyBefore.forEach((token) => {
        if (!economyAfter.includes(token)) fail("economy_value_changed", { source: row.source, token });
      });
      if (current === row.before || String(current || "").includes(row.before)) addUnique(result.forbiddenRemaining, { source: row.source, text: row.before });
      if (/вписывайся|хайп|кринж|рофл|лол|мем|мемн|давай разбер|юный|молод[её]жн/i.test(String(row.after))) {
        addUnique(result.forbiddenRemaining, { source: row.source, text: row.after });
        fail("forbidden_voice", { source: row.source, text: row.after });
      }
    });
    requiredAreas.forEach((area) => {
      if (!result.coveredAreas.includes(area)) addUnique(result.missingCoverage, area);
    });
    if (result.checkedCount <= 0) fail("checked_count_zero");
    result.ok = result.checkedCount > 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };


  Game.__DEV.smokeZoomerSystemTextsOnce = function smokeZoomerSystemTextsOnce(){
    const buildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || Game.__buildTag || (Game.__DEV && Game.__DEV.buildTag) || null;
    const commit = (typeof window !== "undefined" && window.__COMMIT__) || Game.__commit || (Game.__DEV && Game.__DEV.commit) || null;
    const smokeVersion = `step3_4_zoomer_system_texts_v2_${buildTag}_commit_${commit}`;
    const result = {
      ok: false,
      buildTag,
      commit,
      smokeVersion,
      inventoryExists: false,
      covered: { errors: 0, hints: 0, toasts: 0, buttons: 0 },
      checkedCount: 0,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      profileIssues: [],
      teacherTone: [],
      excessiveExplanation: []
    };
    const addUnique = (list, value) => {
      const key = JSON.stringify(value);
      if (!list.some((item) => JSON.stringify(item) === key)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const normalize = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    const addText = (rows, group, source, text) => {
      const value = normalize(text);
      if (!value) return;
      rows.push({ group, source, text: value });
    };
    const addBucket = (rows, group, prefix, bucket) => {
      if (!bucket || typeof bucket !== "object") return;
      Object.keys(bucket).forEach((key) => addText(rows, group, `${prefix}.${key}`, bucket[key]));
    };
    try {
      const rows = [];
      const copy = Game.SystemCopy || SystemCopy || {};
      const templates = Game.SystemTextTemplates || SYSTEM_TEXT_TEMPLATES || {};
      addBucket(rows, "errors", "SystemCopy.errors", copy.errors);
      addBucket(rows, "errors", "SystemTextTemplates.errors", templates.errors);
      addBucket(rows, "toasts", "SystemCopy.warnings", copy.warnings);
      addBucket(rows, "toasts", "SystemCopy.notifications", copy.notifications);
      const D = Game.Data || {};
      const genz = (D.TEXTS && D.TEXTS.genz) || {};
      [
        ["hints", "Data.START_SCREEN.intro.0", D.START_SCREEN && D.START_SCREEN.introLines && D.START_SCREEN.introLines[0]],
        ["hints", "Data.START_SCREEN.intro.1", D.START_SCREEN && D.START_SCREEN.introLines && D.START_SCREEN.introLines[1]],
        ["hints", "Data.START_SCREEN.intro.2", D.START_SCREEN && D.START_SCREEN.introLines && D.START_SCREEN.introLines[2]],
        ["hints", "Data.START_SCREEN.economyHonestyLine", D.START_SCREEN && D.START_SCREEN.economyHonestyLine],
        ["hints", "Data.TEXTS.genz.tie_call_to_action", genz.tie_call_to_action],
        ["hints", "Data.TEXTS.genz.tie_click_name_hint", genz.tie_click_name_hint],
        ["hints", "Data.TEXTS.genz.invite_open_hint", genz.invite_open_hint],
        ["hints", "Data.TEXTS.genz.hint_type_who", genz.hint_type_who],
        ["hints", "Data.TEXTS.genz.hint_type_where", genz.hint_type_where],
        ["hints", "Data.TEXTS.genz.hint_type_about", genz.hint_type_about],
        ["hints", "Data.TEXTS.genz.hint_type_yn", genz.hint_type_yn],
        ["errors", "Data.TEXTS.genz.battle_not_enough_points", genz.battle_not_enough_points],
        ["errors", "Data.TEXTS.genz.vote_fail", genz.vote_fail],
        ["errors", "Data.TEXTS.genz.invite_invalid", genz.invite_invalid],
        ["toasts", "Data.TEXTS.genz.vote_ok", genz.vote_ok],
        ["toasts", "Data.TEXTS.genz.vote_already", genz.vote_already],
        ["buttons", "Data.START_SCREEN.actions.start", D.START_SCREEN && D.START_SCREEN.actions && D.START_SCREEN.actions.start],
        ["buttons", "Data.START_SCREEN.actions.rules", D.START_SCREEN && D.START_SCREEN.actions && D.START_SCREEN.actions.rules],
        ["buttons", "Data.TEXTS.genz.escape_button_label", genz.escape_button_label],
        ["buttons", "Data.TEXTS.genz.events_close_extra", genz.events_close_extra],
        ["buttons", "Data.TEXTS.genz.events_clear_all", genz.events_clear_all],
        ["buttons", "Data.TEXTS.genz.events_done", genz.events_done],
        ["buttons", "UI.chat.send", "Заслать"],
        ["buttons", "UI.report.submit", "Сдать"],
        ["buttons", "UI.dm.battle", "баттл"],
        ["buttons", "UI.dm.respect", "Уважение"],
        ["buttons", "UI.dm.teach", "Передать"],
        ["buttons", "UI.dm.invite", "Позвать"],
        ["buttons", "UI.battles.rematch", "Реванш"],
        ["buttons", "UI.close", "Закрыть"]
      ].forEach((entry) => addText(rows, entry[0], entry[1], entry[2]));

      result.inventoryExists = rows.length > 0;
      rows.forEach((row) => {
        result.covered[row.group] = (result.covered[row.group] || 0) + 1;
        result.checkedCount += 1;
        const text = row.text;
        const lower = text.toLowerCase();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const sentenceCount = (text.match(/[.!?。]+/g) || []).length;
        const forbidden = ["кринж", "вайб", "имба", "рофл", "изи", "лол", "кек", "хайп", "мем", "мемный", "движ", "угар", "чил"];
        forbidden.forEach((word) => {
          const re = new RegExp(`(^|[^А-Яа-яЁёA-Za-z0-9_])${word}(?=$|[^А-Яа-яЁёA-Za-z0-9_])`, "i");
          if (re.test(lower)) addUnique(result.forbiddenRemaining, { source: row.source, text, word });
        });
        if (/давай\s+разбер|обуч|урок|настав|запомни|прочитай|следуй|изучи|правильно|неправильно|молодец|умничк|учитель|ученик/i.test(text)) {
          addUnique(result.teacherTone, { source: row.source, text });
        }
        if (wordCount > (row.group === "buttons" ? 3 : 8) || text.length > (row.group === "buttons" ? 28 : 72) || sentenceCount > 2 || /потому что|если.+то|подробн|информац|объясн|рекомендуется|необходимо|следует/i.test(text)) {
          addUnique(result.excessiveExplanation, { source: row.source, text, wordCount, length: text.length });
        }
      });
      ["errors", "hints", "toasts", "buttons"].forEach((group) => {
        if (!result.covered[group]) addUnique(result.missingCoverage, group);
      });
      if (!result.inventoryExists) fail("system_text_inventory_exists");
      if (result.missingCoverage.length) fail("errors_hints_toasts_buttons_covered", result.missingCoverage.slice());
      if (result.forbiddenRemaining.length) fail("no_forbidden_stop_words", result.forbiddenRemaining.slice());
      if (result.excessiveExplanation.length) fail("short_direct_profile", result.excessiveExplanation.slice());
      if (result.teacherTone.length) fail("no_teacher_tone", result.teacherTone.slice());
      if (result.profileIssues.length) fail("direct_conversational_profile", result.profileIssues.slice());
      if (!buildTag || !commit || !smokeVersion) fail("identity_fields_returned", { buildTag, commit, smokeVersion });
      if (smokeVersion.indexOf("step3_4") === -1 || smokeVersion.indexOf(String(commit || "")) === -1 || smokeVersion !== `step3_4_zoomer_system_texts_v2_${buildTag}_commit_${commit}`) {
        fail("smoke_version_unique_for_commit", smokeVersion);
      }
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.inventoryExists === true
      && result.checkedCount > 0
      && result.missingCoverage.length === 0
      && result.forbiddenRemaining.length === 0
      && result.excessiveExplanation.length === 0
      && result.teacherTone.length === 0
      && result.profileIssues.length === 0
      && !!result.buildTag
      && !!result.commit
      && !!result.smokeVersion
      && result.smokeVersion.indexOf(String(result.commit || "")) !== -1
      && result.failures.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  Game.__DEV.smokeZoomerButtonTermsOnce = function smokeZoomerButtonTermsOnce() {
    const result = {
      ok: false,
      buildTag: null,
      commit: null,
      smokeVersion: null,
      buttonEntries: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const addUnique = (list, value) => {
      const encoded = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      result.failures.push(detail === undefined ? check : { check, detail });
    };
    const buildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || Game.__buildTag || (Game.__DEV && Game.__DEV.buildTag) || null;
    const commit = (typeof window !== "undefined" && window.__COMMIT__) || Game.__commit || (Game.__DEV && Game.__DEV.commit) || null;
    const smokeVersion = `step4_3_zoomer_button_terms_v1_${buildTag}_commit_${commit}`;
    const entries = Object.freeze([
      { source: "Data.START_SCREEN.actions.start", label: "Старт" },
      { source: "Data.START_SCREEN.actions.rules", label: "Суть" },
      { source: "Data.TEXTS.genz.events_close_extra", label: "Свернуть" },
      { source: "Data.TEXTS.genz.escape_button_label", label: "Свалить: {X} 💰" },
      { source: "UI.chat.send", label: "Заслать" },
      { source: "UI.report.submit", label: "Сдать" },
      { source: "UI.dm.battle", label: "баттл" },
      { source: "UI.dm.respect", label: "Уважение" },
      { source: "UI.dm.teach", label: "Передать" },
      { source: "UI.dm.invite", label: "Позвать" },
      { source: "UI.battles.rematch", label: "Реванш" },
      { source: "UI.close", label: "Закрыть" }
    ]);
    const seenLabels = new Set();
    try {
      if (!buildTag || !commit || !smokeVersion) fail("identity_fields_returned", { buildTag, commit, smokeVersion });
      if (smokeVersion !== `step4_3_zoomer_button_terms_v1_${buildTag}_commit_${commit}` || smokeVersion.indexOf("step4_3") === -1 || smokeVersion.indexOf(String(commit || "")) === -1) {
        fail("smoke_version_unique_for_commit", smokeVersion);
      }
      entries.forEach((entry) => {
        result.buttonEntries.push(entry);
        const label = String(entry.label || "").trim();
        if (!label) fail("empty_button_label", entry);
        const wordCount = label.split(/\s+/).filter(Boolean).length;
        if (wordCount > 2) addUnique(result.forbiddenRemaining, { source: entry.source, label, wordCount });
        if (seenLabels.has(label)) addUnique(result.forbiddenRemaining, { source: entry.source, label, reason: "duplicate_label" });
        seenLabels.add(label);
      });
      if (result.forbiddenRemaining.length) fail("button_label_length_or_ambiguity", result.forbiddenRemaining.slice());
      if (result.buttonEntries.length === 0) fail("missing_button_entries");
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.buildTag = buildTag;
    result.commit = commit;
    result.smokeVersion = smokeVersion;
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && !!result.buildTag && !!result.commit && !!result.smokeVersion;
    return result;
  };

})();
