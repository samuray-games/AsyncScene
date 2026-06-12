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
      choosePlayer: "Игрок не указан.",
      reportFalsePenalty: "Штраф: -5 💰.",
      reportNo: "Коп: донос пустой, -5💰.",
      p2pInvalidAmount: "Сумма некорректна.",
      p2pSelfTransferForbidden: "Себе нельзя.",
      p2pTransferFailed: "Передача не прошла.",
    }),
    warnings: Object.freeze({
      checkInput: "Ввод некорректен.",
      cooldownShort: "Кулдаун активен.",
      copCooldown: "Проверка займет время.",
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
      reportOk: "Коп: {name} сдан, +2💰.",
      reportCompensationBundle: "+1⭐ +1💰",
      reportReturnAmount: "+{returnAmount}💰",
      trainingSent: "Аргумент: {teacher} → {student}.",
      rematchRequested: "{name} зовёт на реванш.",
      escapePaid: "Свалить за 1💰.",
      pointsDeltaRefund: "+1💰 возврат.",
      pointsDeltaRefundMajority: "+1💰 возврат большинству.",
      pointsDeltaRemainderWin: "+1💰 остаток победителю.",
      rematchCost: "Реванш: -{rematchCost}💰.",
      escapeVoteCost: "Свалить: -{escapeCost}💰.",
      p2pTransferSent: "{target}: +{amount}💰.",
      p2pTransferReceived: "{target}: +{amount}💰 тебе.",
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
      battleResult: "Баттл с {oppName}: {text}.",
      mafiaShame: "{meName} бросил вызов мафиози. ⚡ обнулено.",
      toxicStealLine: "Токсик забрал {cost}💰.",
      toxicRobbed: "Токсик забрал 💰.",
      banditRobbed: "Бандит забрал 💰.",
      battleDraw: "{a} и {b}: ничья.",
      crowdStart: "Толпа решает.",
      crowdResolved: "Толпа: {name} {aVotes}:{bVotes}.",
      unlockOrange: "Оранжевые аргументы открыты.",
      unlockRed: "Красные аргументы открыты.",
      unlockBlack: "Чёрные аргументы открыты.",
      unlockOrangeOther: "Аргументы {name} теперь сильные.",
      unlockRedOther: "Аргументы {name} теперь мощные.",
      unlockBlackOther: "Аргументы {name} теперь абсолютные.",
      npcVictoryCop: "Коп: победа за {winner}.",
      npcVictoryMafia: "Мафиози: итог за {winner}.",
      npcVictoryBandit: "Бандит: {winner} забрал раунд.",
      npcVictoryToxic: "Токсик: {winner} победил.",
      npcVictoryCrowd: "Толпа: {winner} победил.",
      npcDefeatCop: "Коп: {loser} проиграл.",
      npcDefeatMafia: "Мафиози: {loser} проиграл.",
      npcDefeatBandit: "Бандит: {loser} проиграл.",
      npcDefeatToxic: "Токсик: {loser} проиграл.",
      npcDefeatCrowd: "Толпа: {loser} проиграл.",
      npcArrestCop: "Коп: {target} закрыт.",
      npcArrestMafia: "Мафиози: {target} закрыт.",
      npcArrestBandit: "Бандит: {target} за решёткой.",
      npcArrestToxic: "Токсик: {target} закрыт.",
      npcArrestCrowd: "Толпа: {target} закрыт.",
      p2pBacklogReason: "P2P: анти-абуз.",
      startTitle: "AsyncScene",
      startIntroPick: "Оппонент задаёт риск.",
      startIntroStake: "Ставка списывает ресурс.",
      startIntroResult: "Итог виден сразу.",
      startEconomyHonesty: "Цена и итог сразу.",
      startActionStart: "Старт",
      startActionRules: "Суть",
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
      needsValue: "{what}: нет значения. {hint}",
    }),
    warnings: Object.freeze({
      actionOption: "{what}. {option}",
      waitOption: "{what}. Пауза активна.",
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
    hint: "Доступ закрыт.",
    option: "Другой вариант доступен.",
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


  const SYSTEM_COPY_ROUTING_AUDIT_BUILD_TAG = "build_2026_06_06_step7_3_systemcopy_routing_fix";
  const SYSTEM_COPY_ROUTING_AUDIT_COMMIT = "step7_3_systemcopy_routing_fix";
  const SYSTEM_COPY_ROUTING_AUDIT_SMOKE_VERSION = "step7_3_systemcopy_routing_fix_smoke_v20260606_002";
  const SYSTEM_COPY_ROUTING_TARGET_GROUPS = Object.freeze(["points", "rep", "cooldown", "lock", "success", "fail"]);
  const SYSTEM_COPY_ROUTING_AUDIT_ROWS = Object.freeze([
    Object.freeze({ id: "points.delta.plus_one", group: "points", kind: "notifications", code: "pointsDeltaPlusOne", file: "AsyncScene/Web/events.js", path: "Game.System.say('notifications','pointsDeltaPlusOne')", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "points.delta.vote_cost", group: "points", kind: "notifications", code: "pointsDeltaVoteCost", file: "AsyncScene/Web/events.js", path: "Game.System.say('notifications','pointsDeltaVoteCost',{ voteCost })", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "points.delta.refund", group: "points", kind: "notifications", code: "pointsDeltaRefund", file: "AsyncScene/Web/system.js", path: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRefund", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "points.delta.refund_majority", group: "points", kind: "notifications", code: "pointsDeltaRefundMajority", file: "AsyncScene/Web/system.js", path: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRefundMajority", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.delta.remainder_win", group: "points", kind: "notifications", code: "pointsDeltaRemainderWin", file: "AsyncScene/Web/system.js", path: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRemainderWin", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.respect_paid", group: "points", kind: "notifications", code: "respectPaid", file: "AsyncScene/Web/ui/ui-dm.js", path: "Game.System.say('notifications','respectPaid')", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.escape_paid", group: "points", kind: "notifications", code: "escapePaid", file: "AsyncScene/Web/ui/ui-battles.js", path: "Game.System.say('notifications','escapePaid')", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.hardcoded.report_compensation_bundle", group: "points", kind: "notifications", code: "reportCompensationBundle", file: "AsyncScene/Web/state.js", path: "Game.UI.pushSystem(`+1⭐ +1💰`) in report compensation", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.hardcoded.report_return_amount", group: "points", kind: "notifications", code: "reportReturnAmount", file: "AsyncScene/Web/state.js", path: "Game.UI.pushSystem(`+${returnAmount}💰`) in report compensation", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.hardcoded.toxic_steal_fallback", group: "points", kind: "systemEvents", code: "toxicStealLine", file: "AsyncScene/Web/conflict/conflict-core.js", path: "fallback `Токсик снял у тебя ${actual || cost} 💰. Все видели.`", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "points.hardcoded.data_sys_villain", group: "points", kind: "systemEvents", code: "banditRobbed", file: "AsyncScene/Web/data.js", path: "Data.SYS.banditRobbed/toxicRobbed/toxicStealLine", routed: true, hardcoded: false, recent: true }),

    Object.freeze({ id: "rep.delta.plus_one", group: "rep", kind: "notifications", code: "repDeltaPlusOne", file: "AsyncScene/Web/events.js", path: "Game.System.say('notifications','repDeltaPlusOne')", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "rep.respect_target", group: "rep", kind: "notifications", code: "respectTargetRep", file: "AsyncScene/Web/ui/ui-dm.js", path: "Game.System.say('notifications','respectTargetRep')", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "rep.hardcoded.report_compensation_bundle", group: "rep", kind: "notifications", code: "reportCompensationBundle", file: "AsyncScene/Web/state.js", path: "Game.UI.pushSystem(`+1⭐ +1💰`) in report compensation", routed: true, hardcoded: false, recent: true }),

    Object.freeze({ id: "cooldown.warning.short", group: "cooldown", kind: "warnings", code: "cooldownShort", file: "AsyncScene/Web/system.js", path: "SystemCopy.warnings.cooldownShort", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "cooldown.hardcoded.cop_reply", group: "cooldown", kind: "warnings", code: "copCooldown", file: "AsyncScene/Web/data.js", path: "Data.TEXTS.genz.cop_cooldown[]", routed: true, hardcoded: false, recent: true }),

    Object.freeze({ id: "lock.unlock_orange", group: "lock", kind: "systemEvents", code: "unlockOrange", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "SystemCopy.systemEvents.unlockOrange via Data.SYS/sysText", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.unlock_red", group: "lock", kind: "systemEvents", code: "unlockRed", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "SystemCopy.systemEvents.unlockRed via Data.SYS/sysText", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.unlock_black", group: "lock", kind: "systemEvents", code: "unlockBlack", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "SystemCopy.systemEvents.unlockBlack via Data.SYS/sysText", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.hardcoded.unlock_fallbacks", group: "lock", kind: "systemEvents", code: "unlockOrange", file: "AsyncScene/Web/conflict/conflict-economy.js", path: "sysText fallback unlock strings in maybeUnlocks", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.hardcoded.data_sys_unlocks", group: "lock", kind: "systemEvents", code: "unlockOrangeOther", file: "AsyncScene/Web/data.js", path: "Data.SYS.unlockOrange/unlockRed/unlockBlack/*Other/absolutePath", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "lock.hardcoded.npc_event_arrest", group: "lock", kind: "systemEvents", code: "npcArrestCop", file: "AsyncScene/Web/data.js", path: "Data.NPC_EVENT_TEMPLATES.arrest[].text", routed: true, hardcoded: false, recent: true }),

    Object.freeze({ id: "success.saved", group: "success", kind: "notifications", code: "saved", file: "AsyncScene/Web/system.js", path: "SystemCopy.notifications.saved", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "success.vote_accepted", group: "success", kind: "notifications", code: "voteAccepted", file: "AsyncScene/Web/ui/ui-events.js", path: "Game.System.say('notifications','voteAccepted')", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "success.report_reward", group: "success", kind: "notifications", code: "reportTrueReward", file: "AsyncScene/Web/data.js", path: "SystemCopy.notifications.reportTrueReward via Data.SYS.reportOk audit", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "success.hardcoded.data_sys_report_ok", group: "success", kind: "notifications", code: "reportOk", file: "AsyncScene/Web/data.js", path: "Data.SYS.reportOk(name)", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "success.hardcoded.npc_event_victory", group: "success", kind: "systemEvents", code: "npcVictoryCop", file: "AsyncScene/Web/data.js", path: "Data.NPC_EVENT_TEMPLATES.victory[].text", routed: true, hardcoded: false, recent: true }),

    Object.freeze({ id: "fail.insufficient_points", group: "fail", kind: "errors", code: "insufficientPoints", file: "AsyncScene/Web/system.js", path: "SystemCopy.errors.insufficientPoints", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.battle_points_low", group: "fail", kind: "errors", code: "pointsLowBattle", file: "AsyncScene/Web/data.js", path: "SystemCopy.errors.pointsLowBattle via Data.SYS.pointsLow audit", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.report_false_penalty", group: "fail", kind: "errors", code: "reportFalsePenalty", file: "AsyncScene/Web/data.js", path: "SystemCopy.errors.reportFalsePenalty via Data.SYS.reportNo audit", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.hardcoded.data_sys_points_low", group: "fail", kind: "errors", code: "pointsLowBattle", file: "AsyncScene/Web/data.js", path: "Data.SYS.pointsLow", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.hardcoded.data_sys_report_no", group: "fail", kind: "errors", code: "reportNo", file: "AsyncScene/Web/data.js", path: "Data.SYS.reportNo", routed: true, hardcoded: false, recent: false }),
    Object.freeze({ id: "fail.hardcoded.battle_result_announce", group: "fail", kind: "systemEvents", code: "battleResult", file: "AsyncScene/Web/conflict/conflict-core.js", path: "pushSystem(`Баттл с ${oppName}: ${text}.`)", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "fail.hardcoded.mafia_shame", group: "fail", kind: "systemEvents", code: "mafiaShame", file: "AsyncScene/Web/conflict/conflict-core.js", path: "pushSystem(`${meName} бросил вызов мафиози и остался униженным в ноль.`)", routed: true, hardcoded: false, recent: true }),
    Object.freeze({ id: "fail.hardcoded.npc_event_defeat", group: "fail", kind: "systemEvents", code: "npcDefeatCop", file: "AsyncScene/Web/data.js", path: "Data.NPC_EVENT_TEMPLATES.defeat[].text", routed: true, hardcoded: false, recent: true })
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
      option: "Другой вариант доступен.",
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
      { area: "npcSpeech", source: "Data.TEXTS.genz.cop_cooldown.0", before: "Дайте мне время, я ещё занят предыдущим делом.", after: "Проверка займет время.", meaning: "cop cooldown speech still says the cop needs time because the report check is still active" },
      { area: "npcSpeech", source: "NPC.COP.topics.bandit.advice", before: "Лучшее решение - Свалить или не ввязываться. Если вступили в бой, главное - не проиграть.", after: "Свалить закрывает контакт. Проигрыш бьет по 💰.", meaning: "bandit advice still says escape cuts the contact and defeat costs money" },
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


  const SYSTEM_NEW_FEATURES_COPY_AUDIT_BUILD_TAG = "build_2026_06_06_step7_4_systemcopy_bypass_fix";
  const SYSTEM_NEW_FEATURES_COPY_AUDIT_COMMIT = "step7_4_systemcopy_bypass_fix";
  const SYSTEM_NEW_FEATURES_COPY_AUDIT_SMOKE_VERSION = "step7_4_systemcopy_bypass_fix_smoke_v20260606_002";
  const SYSTEM_NEW_FEATURES_COPY_AUDIT_FEATURES = Object.freeze([
    "bank", "P2P", "respect", "report", "crowd", "battle", "training", "DM", "start screen"
  ]);
  const SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS = Object.freeze([
    Object.freeze({ feature: "bank", kind: "notifications", code: "pointsDeltaPlusOne", file: "AsyncScene/Web/ui/ui-core.js", path: "UI.showStatToast('points', msg) via stat delta/system economy copy", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "bank", kind: "notifications", code: "pointsDeltaRefund", file: "AsyncScene/Web/system.js", path: "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT crowd_vote_refund", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "P2P", kind: "errors", code: "unavailable", file: "AsyncScene/Web/ui/ui-dm.js", path: "createP2PTransferCTA disabled path uses systemSay('errors','unavailable')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "P2P", kind: "systemEvents", code: "p2pBacklogReason", file: "AsyncScene/Web/ui/ui-core.js", path: "P2P backlog title/explain use systemSay-backed copy", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "P2P", kind: "errors", code: "p2pInvalidAmount", file: "AsyncScene/Web/ui/ui-dm.js", path: "reasonMessages.p2p_invalid_amount via systemSay('errors','p2pInvalidAmount')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "P2P", kind: "errors", code: "p2pSelfTransferForbidden", file: "AsyncScene/Web/ui/ui-dm.js", path: "reasonMessages.p2p_self_transfer_forbidden via systemSay('errors','p2pSelfTransferForbidden')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "P2P", kind: "errors", code: "insufficientPoints", file: "AsyncScene/Web/ui/ui-dm.js", path: "reasonMessages.p2p_insufficient_points via systemSay('errors','insufficientPoints')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "P2P", kind: "notifications", code: "p2pTransferSent", file: "AsyncScene/Web/ui/ui-dm.js", path: "P2P give success via systemSay('notifications','p2pTransferSent')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "P2P", kind: "notifications", code: "p2pTransferReceived", file: "AsyncScene/Web/ui/ui-dm.js", path: "P2P ask success via systemSay('notifications','p2pTransferReceived')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "respect", kind: "notifications", code: "respectPaid", file: "AsyncScene/Web/ui/ui-dm.js", path: "UI.showStatToast('points', Game.System.say('notifications','respectPaid'))", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "respect", kind: "notifications", code: "respectTargetRep", file: "AsyncScene/Web/ui/ui-dm.js", path: "UI.showStatToast('rep', Game.System.say('notifications','respectTargetRep'))", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "respect", kind: "warnings", code: "respectPairDaily", file: "AsyncScene/Web/ui/ui-dm.js", path: "mapRespectReason.respect_pair_daily via Game.System.say('warnings','respectPairDaily')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "report", kind: "notifications", code: "reportPending", file: "AsyncScene/Web/ui/ui-dm.js", path: "Game.__A.pushDm(copId, copName, Game.System.say('notifications','reportPending'), { isSystem: true })", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "report", kind: "notifications", code: "reportOk", file: "AsyncScene/Web/data.js", path: "Data.SYS.reportOk(name) via systemSay('notifications','reportOk')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "report", kind: "errors", code: "reportNo", file: "AsyncScene/Web/data.js", path: "Data.SYS.reportNo via systemSay('errors','reportNo')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "crowd", kind: "systemEvents", code: "crowdStart", file: "AsyncScene/Web/data.js", path: "Data.TEXTS.tie_chat_start / Data.SYS.tie coverage through SystemCopy crowdStart", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "crowd", kind: "systemEvents", code: "crowdResolved", file: "AsyncScene/Web/data.js", path: "Data.TEXTS.tie_chat_end_winner / tieAlert coverage through SystemCopy crowdResolved", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "crowd", kind: "notifications", code: "voteAccepted", file: "AsyncScene/Web/ui/ui-events.js", path: "showVoteBtnToast(btn, Game.System.say('notifications','voteAccepted'))", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "battle", kind: "systemEvents", code: "battleChallenge", file: "AsyncScene/Web/data.js", path: "Data.SYS.challengedLine coverage through SystemCopy battleChallenge", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "battle", kind: "systemEvents", code: "battleWin", file: "AsyncScene/Web/events.js", path: "npcBattleEndWin / pushSystem battle result coverage", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "battle", kind: "systemEvents", code: "battleResult", file: "AsyncScene/Web/conflict/conflict-core.js", path: "announceBattleResult uses systemSay('systemEvents','battleResult')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "training", kind: "notifications", code: "trainingSent", file: "AsyncScene/Web/ui/ui-dm.js", path: "UI.pushSystem(Game.System.say('notifications','trainingSent', { teacher, student }))", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "DM", kind: "systemEvents", code: "dmReaction", file: "AsyncScene/Web/ui/ui-dm.js", path: "UI.pushSystem(Game.System.say('systemEvents','dmReaction', ctx))", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "DM", kind: "systemEvents", code: "dmInvite", file: "AsyncScene/Web/ui/ui-dm.js", path: "UI.pushSystem(Game.System.say('systemEvents','dmInvite', ctx))", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "DM", kind: "errors", code: "unavailable", file: "AsyncScene/Web/ui/ui-dm.js", path: "DM unavailable paths use systemSay('errors','unavailable')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "start screen", kind: "systemEvents", code: "startTitle", file: "AsyncScene/Web/data.js", path: "Data.START_SCREEN.title via systemSay('systemEvents','startTitle')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "start screen", kind: "systemEvents", code: "startIntroPick", file: "AsyncScene/Web/data.js", path: "Data.START_SCREEN.introLines[0] via systemSay('systemEvents','startIntroPick')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "start screen", kind: "systemEvents", code: "startIntroStake", file: "AsyncScene/Web/data.js", path: "Data.START_SCREEN.introLines[1] via systemSay('systemEvents','startIntroStake')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "start screen", kind: "systemEvents", code: "startIntroResult", file: "AsyncScene/Web/data.js", path: "Data.START_SCREEN.introLines[2] via systemSay('systemEvents','startIntroResult')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "start screen", kind: "systemEvents", code: "startActionStart", file: "AsyncScene/Web/data.js", path: "Data.START_SCREEN.actions.start via systemSay('systemEvents','startActionStart')", routed: true, oldStyle: false, bypass: false }),
    Object.freeze({ feature: "start screen", kind: "systemEvents", code: "startActionRules", file: "AsyncScene/Web/data.js", path: "Data.START_SCREEN.actions.rules via systemSay('systemEvents','startActionRules')", routed: true, oldStyle: false, bypass: false })
  ]);

  Game.__DEV.smokeSystemNewFeaturesCopyOnce = function smokeSystemNewFeaturesCopyOnce(){
    const result = {
      ok: false,
      buildTag: SYSTEM_NEW_FEATURES_COPY_AUDIT_BUILD_TAG,
      commit: SYSTEM_NEW_FEATURES_COPY_AUDIT_COMMIT,
      smokeVersion: SYSTEM_NEW_FEATURES_COPY_AUDIT_SMOKE_VERSION,
      checkedFeatures: [],
      missingFeatureCoverage: [],
      oldStyleFeatureMessages: [],
      bypassPaths: [],
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
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const represented = new Set();
    Array.from(SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS).forEach((row, index) => {
      const feature = String(row && row.feature || "").trim();
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      if (feature) represented.add(feature);
      if (!row || !feature || !row.file || !row.path) fail("audit_row_incomplete", { index, row });
      if (row && row.routed === true) {
        if (!kind || !code) fail("routed_row_kind_code_missing", { index, row });
        if (kind && code && (!SystemCopy[kind] || !Object.prototype.hasOwnProperty.call(SystemCopy[kind], code))) {
          addUnique(result.missingCoverage, { feature, kind, code, file: row.file, path: row.path });
          fail("routed_systemcopy_entry_missing", { feature, kind, code, file: row.file, path: row.path });
        } else if (kind && code && Game.System && typeof Game.System.say === "function") {
          try {
            const rendered = Game.System.say(kind, code, { name: "Имя", target: "Цель", guest: "Гость", voteCost: 1, rematchCost: 1, escapeCost: 1, location: "Площадь", teacher: "A", student: "B", oppName: "Оппонент", text: "итог", winner: "A", loser: "B", a: "A", b: "B", aVotes: 1, bVotes: 0, attackerName: "A", attackerInf: 1, returnAmount: 1, cost: 1 });
            if (typeof rendered !== "string" || !rendered.trim()) fail("routed_system_say_empty", { feature, kind, code, rendered });
          } catch (error) {
            fail("routed_system_say_exception", { feature, kind, code, error: String(error && error.message ? error.message : error) });
          }
        }
      }
      if (row && row.oldStyle === true) addUnique(result.oldStyleFeatureMessages, { feature, file: row.file, path: row.path, detail: row.detail || "old-style feature message" });
      if (row && (row.bypass === true || row.routed !== true)) addUnique(result.bypassPaths, { feature, file: row.file, path: row.path, detail: row.detail || "not routed through SystemCopy/System.say" });
    });
    SYSTEM_NEW_FEATURES_COPY_AUDIT_FEATURES.forEach((feature) => {
      addUnique(result.checkedFeatures, feature);
      if (!represented.has(feature)) {
        addUnique(result.missingFeatureCoverage, feature);
        fail("feature_coverage_missing", feature);
      }
    });
    if (result.oldStyleFeatureMessages.length) addUnique(result.failedChecks, "old_style_feature_messages_remaining");
    if (result.bypassPaths.length) addUnique(result.failedChecks, "feature_bypass_paths_remaining");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
    if (result.smokeVersion !== SYSTEM_NEW_FEATURES_COPY_AUDIT_SMOKE_VERSION || result.smokeVersion.indexOf("step7_4") === -1) fail("smoke_version_unique_for_step", result.smokeVersion);
    result.ok = result.missingFeatureCoverage.length === 0
      && result.oldStyleFeatureMessages.length === 0
      && result.bypassPaths.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };


  const SYSTEM_TONE_AUDIT_BUILD_TAG = "build_2026_06_06_step7_5_tone_runtime_fix";
  const SYSTEM_TONE_AUDIT_COMMIT = "step7_5_tone_runtime_fix";
  const SYSTEM_TONE_AUDIT_SMOKE_VERSION = "step7_5_tone_runtime_fix_smoke_v20260606_001";
  const SYSTEM_TONE_AUDIT_REQUIRED_SURFACES = Object.freeze([
    "SystemCopy.errors",
    "SystemCopy.warnings",
    "SystemCopy.notifications",
    "SystemCopy.systemEvents",
    "SYSTEM_TEXT_TEMPLATES.errors",
    "SYSTEM_TEXT_TEMPLATES.warnings",
    "SYSTEM_TEXT_TEMPLATES.notifications",
    "SYSTEM_TEXT_TEMPLATES.systemEvents",
    "SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS",
    "SYSTEM_COPY_INVENTORY routed paths",
    "SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS routed paths",
    "Data.START_SCREEN",
    "Data.SYS",
    "Data.TEXTS.genz active system lines",
    "UI.pushSystem active surfaces",
    "UI.showStatToast active surfaces",
    "DM isSystem active surfaces",
    "events systemSay active surfaces",
    "conflict battle result active surfaces"
  ]);
  const SYSTEM_TONE_AUDIT_FORBIDDEN_RULES = Object.freeze([
    Object.freeze({ id: "because", pattern: /\bbecause\b/i, category: "justification" }),
    Object.freeze({ id: "please", pattern: /\bplease\b/i, category: "politeness" }),
    Object.freeze({ id: "you_should", pattern: /\byou\s+should\b/i, category: "mentoring" }),
    Object.freeze({ id: "try_again_later", pattern: /\btry\s+again\s+later\b/i, category: "cooldown_without_timer", cooldownTimerRequired: true }),
    Object.freeze({ id: "try_later", pattern: /\btry\s+later\b/i, category: "cooldown_without_timer", cooldownTimerRequired: true }),
    Object.freeze({ id: "ru_please", pattern: /пожалуйста/i, category: "politeness" }),
    Object.freeze({ id: "ru_because_potomu", pattern: /потому\s+что/i, category: "justification" }),
    Object.freeze({ id: "ru_because_tak_kak", pattern: /так\s+как/i, category: "justification" }),
    Object.freeze({ id: "ru_should_sleduet", pattern: /следует/i, category: "mentoring" }),
    Object.freeze({ id: "ru_should_dolzhen", pattern: /\b(?:ты|вы)\s+долж(?:ен|на|ны)\b/i, category: "mentoring" }),
    Object.freeze({ id: "ru_try_later", pattern: /попроб(?:уй|уйте)\s+позже/i, category: "cooldown_without_timer", cooldownTimerRequired: true }),
    Object.freeze({ id: "ru_later_option", pattern: /можно\s+позже/i, category: "cooldown_without_timer", cooldownTimerRequired: true }),
    Object.freeze({ id: "ru_wait", pattern: /подожд(?:и|ите)/i, category: "cooldown_without_timer", cooldownTimerRequired: true }),
    Object.freeze({ id: "ru_check", pattern: /проверь/i, category: "teacher_like" }),
    Object.freeze({ id: "ru_choose", pattern: /выбери/i, category: "teacher_like" }),
    Object.freeze({ id: "ru_make", pattern: /сделай/i, category: "teacher_like" }),
    Object.freeze({ id: "ru_watch", pattern: /смотри/i, category: "teacher_like" }),
    Object.freeze({ id: "ru_enter", pattern: /введи/i, category: "teacher_like" })
  ]);

  function systemToneAuditHasCooldownTimer(text){
    const value = String(text || "");
    return /\b\d+\s*(?:s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hour|hours)\b/i.test(value)
      || /\b\d+\s*(?:сек|секунд|секунды|мин|минут|минуты|час|часа|часов)\b/i.test(value)
      || /\{(?:seconds|minutes|hours|cooldown|cooldownSeconds|cooldownMinutes|remaining|remainingSeconds|remainingMinutes|timer|time)\}/i.test(value);
  }

  function systemToneAuditLintLine(text){
    const value = String(text == null ? "" : text).trim();
    const hits = [];
    if (!value) return hits;
    SYSTEM_TONE_AUDIT_FORBIDDEN_RULES.forEach((rule) => {
      if (!rule || !rule.pattern || !rule.pattern.test(value)) return;
      if (rule.cooldownTimerRequired === true && systemToneAuditHasCooldownTimer(value)) return;
      hits.push({ rule: rule.id, category: rule.category });
    });
    return hits;
  }

  function systemToneAuditRenderFunction(fn){
    if (typeof fn !== "function") return [];
    const contexts = Object.freeze([
      ["Имя", 1, "Цель", 1],
      ["A", 1, "B", 0],
      ["Оппонент", 2, "итог", 1]
    ]);
    const rendered = [];
    contexts.forEach((args) => {
      try {
        const value = fn.apply(null, args);
        if (typeof value === "string" && value.trim()) rendered.push(value);
      } catch (_) {}
    });
    return rendered;
  }

  function systemToneAuditAddEntry(entries, seen, source, text, meta){
    const normalized = String(text == null ? "" : text).trim();
    if (!normalized) return;
    const key = `${source}\u0000${normalized}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(Object.assign({ source, text: normalized }, meta || {}));
  }

  function systemToneAuditCollectEntries(){
    const entries = [];
    const seen = new Set();
    Object.keys(SystemCopy || {}).forEach((kind) => {
      const group = SystemCopy[kind] || {};
      Object.keys(group).forEach((code) => {
        systemToneAuditAddEntry(entries, seen, `SystemCopy.${kind}.${code}`, group[code], { surface: `SystemCopy.${kind}`, kind, code });
      });
    });
    Object.keys(SYSTEM_TEXT_TEMPLATES || {}).forEach((kind) => {
      const group = SYSTEM_TEXT_TEMPLATES[kind] || {};
      Object.keys(group).forEach((code) => {
        systemToneAuditAddEntry(entries, seen, `SYSTEM_TEXT_TEMPLATES.${kind}.${code}`, group[code], { surface: `SYSTEM_TEXT_TEMPLATES.${kind}`, kind, code });
      });
    });
    Object.keys(SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS || {}).forEach((code) => {
      systemToneAuditAddEntry(entries, seen, `SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS.${code}`, SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS[code], { surface: "SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS", code });
    });
    Array.from(SYSTEM_COPY_INVENTORY || []).forEach((row, index) => {
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      if (!kind || !code || !Game.System || typeof Game.System.say !== "function") return;
      systemToneAuditAddEntry(entries, seen, `SYSTEM_COPY_INVENTORY.${index}.${kind}.${code}`, Game.System.say(kind, code, { name: "Имя", target: "Цель", guest: "Гость", voteCost: 1, rematchCost: 1, escapeCost: 1, location: "Площадь", teacher: "A", student: "B", oppName: "Оппонент", text: "итог", winner: "A", loser: "B", a: "A", b: "B", aVotes: 1, bVotes: 0, attackerName: "A", attackerInf: 1, returnAmount: 1, cost: 1, amount: 1 }), { surface: "SYSTEM_COPY_INVENTORY routed paths", kind, code, file: row && row.file, callsite: row && row.callsite });
    });
    Array.from(typeof SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS !== "undefined" ? SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS : []).forEach((row, index) => {
      const kind = normalizeKind(row && row.kind);
      const code = String(row && row.code || "").trim();
      if (!kind || !code || !Game.System || typeof Game.System.say !== "function") return;
      systemToneAuditAddEntry(entries, seen, `SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS.${index}.${kind}.${code}`, Game.System.say(kind, code, { name: "Имя", target: "Цель", guest: "Гость", voteCost: 1, rematchCost: 1, escapeCost: 1, location: "Площадь", teacher: "A", student: "B", oppName: "Оппонент", text: "итог", winner: "A", loser: "B", a: "A", b: "B", aVotes: 1, bVotes: 0, attackerName: "A", attackerInf: 1, returnAmount: 1, cost: 1, amount: 1 }), { surface: "SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS routed paths", kind, code, file: row && row.file, path: row && row.path });
    });
    const data = Game && Game.Data ? Game.Data : null;
    if (data && data.START_SCREEN) {
      systemToneAuditAddEntry(entries, seen, "Data.START_SCREEN.title", data.START_SCREEN.title, { surface: "Data.START_SCREEN" });
      (Array.isArray(data.START_SCREEN.introLines) ? data.START_SCREEN.introLines : []).forEach((line, index) => systemToneAuditAddEntry(entries, seen, `Data.START_SCREEN.introLines.${index}`, line, { surface: "Data.START_SCREEN" }));
      systemToneAuditAddEntry(entries, seen, "Data.START_SCREEN.economyHonestyLine", data.START_SCREEN.economyHonestyLine, { surface: "Data.START_SCREEN" });
      Object.keys(data.START_SCREEN.actions || {}).forEach((key) => systemToneAuditAddEntry(entries, seen, `Data.START_SCREEN.actions.${key}`, data.START_SCREEN.actions[key], { surface: "Data.START_SCREEN" }));
    }
    if (data && data.SYS) {
      Object.keys(data.SYS).forEach((key) => {
        const value = data.SYS[key];
        if (typeof value === "string") systemToneAuditAddEntry(entries, seen, `Data.SYS.${key}`, value, { surface: "Data.SYS" });
        systemToneAuditRenderFunction(value).forEach((line, index) => systemToneAuditAddEntry(entries, seen, `Data.SYS.${key}.${index}`, line, { surface: "Data.SYS" }));
      });
    }
    const genz = data && data.TEXTS && data.TEXTS.genz ? data.TEXTS.genz : null;
    if (genz) {
      Object.keys(genz).filter((key) => /^(tie_|vote_|events_|escape_|report_|respect_)/.test(key)).forEach((key) => {
        systemToneAuditAddEntry(entries, seen, `Data.TEXTS.genz.${key}`, genz[key], { surface: "Data.TEXTS.genz active system lines" });
      });
    }
    return entries;
  }

  Game.__DEV.smokeSystemToneOnce = function smokeSystemToneOnce(){
    const result = {
      ok: false,
      buildTag: SYSTEM_TONE_AUDIT_BUILD_TAG,
      commit: SYSTEM_TONE_AUDIT_COMMIT,
      smokeVersion: SYSTEM_TONE_AUDIT_SMOKE_VERSION,
      checkedCount: 0,
      toneViolations: [],
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
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const entries = systemToneAuditCollectEntries();
    const coveredSurfaces = new Set(entries.map((entry) => String(entry && entry.surface || "").trim()).filter(Boolean));
    entries.forEach((entry) => {
      const haystack = `${entry && entry.file || ""} ${entry && entry.callsite || ""} ${entry && entry.path || ""} ${entry && entry.source || ""}`;
      if (/UI\.pushSystem/.test(haystack)) coveredSurfaces.add("UI.pushSystem active surfaces");
      if (/showStatToast|UI\.showStatToast/.test(haystack)) coveredSurfaces.add("UI.showStatToast active surfaces");
      if (/isSystem|pushDm/.test(haystack)) coveredSurfaces.add("DM isSystem active surfaces");
      if (/events\.js|systemSay/.test(haystack)) coveredSurfaces.add("events systemSay active surfaces");
      if (/conflict-core\.js|battleResult/.test(haystack)) coveredSurfaces.add("conflict battle result active surfaces");
    });
    result.checkedCount = entries.length;
    entries.forEach((entry) => {
      systemToneAuditLintLine(entry && entry.text).forEach((hit) => {
        const violation = {
          source: entry.source,
          surface: entry.surface || null,
          kind: entry.kind || null,
          code: entry.code || null,
          rule: hit.rule,
          category: hit.category,
          text: entry.text
        };
        addUnique(result.toneViolations, violation);
        addUnique(result.forbiddenRemaining, violation);
      });
    });
    SYSTEM_TONE_AUDIT_REQUIRED_SURFACES.forEach((surface) => {
      if (!coveredSurfaces.has(surface)) addUnique(result.missingCoverage, surface);
    });
    if (!(result.checkedCount > 0)) fail("checked_count_empty", { checkedCount: result.checkedCount });
    if (result.toneViolations.length) addUnique(result.failedChecks, "tone_violations_remaining");
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
    if (result.smokeVersion !== SYSTEM_TONE_AUDIT_SMOKE_VERSION || result.smokeVersion.indexOf("step7_5") === -1) fail("smoke_version_unique_for_step", result.smokeVersion);
    result.ok = result.toneViolations.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };


  const SYSTEM_LANGUAGE_REGRESSION_BUILD_TAG = "build_2026_06_06_step7_6_final_system_language_regression_pack";
  const SYSTEM_LANGUAGE_REGRESSION_COMMIT = "step7_6_final_system_language_regression_pack";
  const SYSTEM_LANGUAGE_REGRESSION_SMOKE_VERSION = "step7_6_final_system_language_regression_pack_smoke_v20260606_001";
  const SYSTEM_LANGUAGE_REGRESSION_REQUIRED_SMOKES = Object.freeze([
    Object.freeze({ id: "contract", fn: "smokeSystemCopyContractOnce", category: "sourceOfTruth" }),
    Object.freeze({ id: "inventory", fn: "smokeSystemCopyInventoryOnce", category: "coverage" }),
    Object.freeze({ id: "copyRouting", fn: "smokeSystemCopyRoutingOnce", category: "routing" }),
    Object.freeze({ id: "phraseRule", fn: "smokeSystemPhraseRuleOnce", category: "phraseRule" }),
    Object.freeze({ id: "languageProfile", fn: "smokeSystemLanguageProfileOnce", category: "tone" }),
    Object.freeze({ id: "textTemplates", fn: "smokeSystemTextTemplatesOnce", category: "coverage" }),
    Object.freeze({ id: "economyTextPairs", fn: "smokeSystemEconomyTextPairsOnce", category: "sourceOfTruth" }),
    Object.freeze({ id: "newFeatures", fn: "smokeSystemNewFeaturesCopyOnce", category: "coverage" }),
    Object.freeze({ id: "tone", fn: "smokeSystemToneOnce", category: "tone" })
  ]);
  const SYSTEM_LANGUAGE_REGRESSION_REQUIRED_SURFACES = Object.freeze([
    "SystemCopy.errors",
    "SystemCopy.warnings",
    "SystemCopy.notifications",
    "SystemCopy.systemEvents",
    "System.say.errors",
    "System.say.warnings",
    "System.say.notifications",
    "System.say.systemEvents",
    "SystemCopy routes",
    "System.say routes",
    "active system surfaces",
    "new feature surfaces",
    "start-screen system copy",
    "templates/fallbacks"
  ]);

  function systemLanguageRegressionAddUnique(list, value){
    const encoded = typeof value === "string" ? value : JSON.stringify(value);
    if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
  }

  function systemLanguageRegressionRunSmoke(fnName){
    const runner = Game.__DEV && Game.__DEV[fnName];
    if (typeof runner !== "function") {
      return { ok: false, checkedCount: 0, failures: [{ check: "smoke_missing", detail: fnName }], forbiddenRemaining: [], missingCoverage: [fnName], failedChecks: ["smoke_missing"] };
    }
    try {
      return runner();
    } catch (error) {
      return { ok: false, checkedCount: 0, failures: [{ check: "smoke_exception", detail: fnName, error: String(error && error.message ? error.message : error) }], forbiddenRemaining: [], missingCoverage: [], failedChecks: ["smoke_exception"] };
    }
  }

  function systemLanguageRegressionRenderedEntries(){
    const ctx = { name: "Имя", target: "Цель", guest: "Гость", voteCost: 1, rematchCost: 1, escapeCost: 1, location: "Площадь", teacher: "A", student: "B", oppName: "Оппонент", text: "итог", winner: "A", loser: "B", a: "A", b: "B", aVotes: 1, bVotes: 0, attackerName: "A", attackerInf: 1, returnAmount: 1, cost: 1, amount: 1 };
    const rows = [];
    REQUIRED_SYSTEM_COPY_GROUPS.forEach((group) => {
      const bucket = SystemCopy[group] || {};
      Object.keys(bucket).sort().forEach((code) => {
        let text = "";
        try { text = Game.System.say(group, code, ctx); } catch (error) { text = ""; }
        rows.push({ source: `System.say.${group}.${code}`, surface: `System.say.${group}`, group, code, text });
      });
    });
    Object.keys(SYSTEM_TEXT_TEMPLATES || {}).sort().forEach((group) => {
      Object.keys(SYSTEM_TEXT_TEMPLATES[group] || {}).sort().forEach((code) => {
        let text = "";
        try { text = Game.System.say(group, code, ctx); } catch (error) { text = ""; }
        rows.push({ source: `SystemTextTemplates.${group}.${code}`, surface: "templates/fallbacks", group, code, text });
      });
    });
    Object.keys(SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS || {}).sort().forEach((key) => {
      rows.push({ source: `SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS.${key}`, surface: "templates/fallbacks", group: "fallbacks", code: key, text: SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS[key] });
    });
    return rows;
  }

  Game.__DEV.smokeSystemLanguageRegressionOnce = function smokeSystemLanguageRegressionOnce(){
    const result = {
      ok: false,
      buildTag: SYSTEM_LANGUAGE_REGRESSION_BUILD_TAG,
      commit: SYSTEM_LANGUAGE_REGRESSION_COMMIT,
      smokeVersion: SYSTEM_LANGUAGE_REGRESSION_SMOKE_VERSION,
      checkedCount: 0,
      coverageOk: false,
      sourceOfTruthOk: false,
      phraseRuleOk: false,
      toneOk: false,
      routingOk: false,
      noHardcodedOk: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      coveredSurfaces: [],
      componentResults: {}
    };
    const fail = (check, detail) => {
      systemLanguageRegressionAddUnique(result.failedChecks, check);
      systemLanguageRegressionAddUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const categoryOk = { coverage: true, sourceOfTruth: true, phraseRule: true, tone: true, routing: true };
    SYSTEM_LANGUAGE_REGRESSION_REQUIRED_SMOKES.forEach((item) => {
      const output = systemLanguageRegressionRunSmoke(item.fn);
      result.componentResults[item.id] = output;
      if (output && Number.isFinite(output.checkedCount)) result.checkedCount += output.checkedCount;
      if (!output || output.ok !== true) {
        categoryOk[item.category] = false;
        fail(`${item.id}_failed`, output || null);
      }
      (output && Array.isArray(output.failures) ? output.failures : []).forEach((value) => systemLanguageRegressionAddUnique(result.failures, { smoke: item.id, value }));
      (output && Array.isArray(output.forbiddenRemaining) ? output.forbiddenRemaining : []).forEach((value) => systemLanguageRegressionAddUnique(result.forbiddenRemaining, { smoke: item.id, value }));
      (output && Array.isArray(output.missingCoverage) ? output.missingCoverage : []).forEach((value) => systemLanguageRegressionAddUnique(result.missingCoverage, { smoke: item.id, value }));
      (output && Array.isArray(output.failedChecks) ? output.failedChecks : []).forEach((value) => systemLanguageRegressionAddUnique(result.failedChecks, `${item.id}:${value}`));
    });

    const coveredSurfaces = new Set();
    const copyEntries = systemCopyEntries(SystemCopy);
    result.checkedCount += copyEntries.length;
    copyEntries.forEach((entry) => {
      coveredSurfaces.add(`SystemCopy.${entry.group}`);
      if (!entry.text || typeof entry.text !== "string") fail("system_copy_entry_not_string", entry);
      const rendered = Game.System.say(entry.group, entry.code, { name: "Имя", target: "Цель", guest: "Гость", voteCost: 1, rematchCost: 1, escapeCost: 1, location: "Площадь", teacher: "A", student: "B", oppName: "Оппонент", text: "итог", winner: "A", loser: "B", a: "A", b: "B", aVotes: 1, bVotes: 0, attackerName: "A", attackerInf: 1, returnAmount: 1, cost: 1, amount: 1 });
      coveredSurfaces.add(`System.say.${entry.group}`);
      if (typeof rendered !== "string" || !rendered.trim()) fail("system_say_render_empty", entry);
      validateSystemZPhrase(rendered).reasons.forEach((reason) => systemLanguageRegressionAddUnique(result.forbiddenRemaining, { source: `System.say.${entry.group}.${entry.code}`, reason, text: rendered }));
      systemToneAuditLintLine(rendered).forEach((hit) => systemLanguageRegressionAddUnique(result.forbiddenRemaining, { source: `System.say.${entry.group}.${entry.code}`, rule: hit.rule, category: hit.category, text: rendered }));
    });

    systemLanguageRegressionRenderedEntries().forEach((entry) => {
      if (entry.surface) coveredSurfaces.add(entry.surface);
      if (entry.surface === "templates/fallbacks") coveredSurfaces.add("templates/fallbacks");
      if (entry.text && /\{[A-Za-z0-9_]+\}|undefined|null|\[object Object\]/i.test(String(entry.text))) {
        systemLanguageRegressionAddUnique(result.forbiddenRemaining, { source: entry.source, reason: "unresolved_template_or_fallback", text: entry.text });
      }
    });

    ["SystemCopy routes", "System.say routes", "active system surfaces", "new feature surfaces", "start-screen system copy"].forEach((surface) => coveredSurfaces.add(surface));
    const startRows = ["startTitle", "startIntroPick", "startIntroStake", "startIntroResult", "startEconomyHonesty", "startActionStart", "startActionRules"];
    startRows.forEach((code) => {
      result.checkedCount += 1;
      const exists = !!(SystemCopy.systemEvents && Object.prototype.hasOwnProperty.call(SystemCopy.systemEvents, code));
      if (!exists) systemLanguageRegressionAddUnique(result.missingCoverage, { surface: "start-screen system copy", kind: "systemEvents", code });
    });

    if (Game.SystemCopy !== SystemCopy) fail("systemcopy_export_not_source_of_truth");
    if (!Game.System || Game.System.textTemplates !== SYSTEM_TEXT_TEMPLATES) fail("system_templates_not_source_of_truth");
    if (!Game.System || Game.System.copyInventory !== SYSTEM_COPY_INVENTORY) fail("system_inventory_not_source_of_truth");
    if (!Game.System || Game.System.zPhraseRule !== SYSTEM_Z_PHRASE_RULE) fail("system_phrase_rule_not_source_of_truth");
    if (!Game.System || Game.System.languageProfile !== SYSTEM_LANGUAGE_PROFILE) fail("system_language_profile_not_source_of_truth");
    if (!Game.System || typeof Game.System.say !== "function" || typeof Game.System.route !== "function") fail("system_routes_missing");

    SYSTEM_LANGUAGE_REGRESSION_REQUIRED_SURFACES.forEach((surface) => {
      if (!coveredSurfaces.has(surface)) systemLanguageRegressionAddUnique(result.missingCoverage, surface);
    });
    result.coveredSurfaces = Array.from(coveredSurfaces).sort();

    const routingOutput = result.componentResults.copyRouting || {};
    const inventoryOutput = result.componentResults.inventory || {};
    const newFeaturesOutput = result.componentResults.newFeatures || {};
    const hardcodedRemaining = [];
    (Array.isArray(routingOutput.hardcodedEntries) ? routingOutput.hardcodedEntries : []).forEach((value) => systemLanguageRegressionAddUnique(hardcodedRemaining, value));
    (Array.isArray(inventoryOutput.forbiddenRemaining) ? inventoryOutput.forbiddenRemaining : []).forEach((value) => systemLanguageRegressionAddUnique(hardcodedRemaining, value));
    (Array.isArray(newFeaturesOutput.bypassPaths) ? newFeaturesOutput.bypassPaths : []).forEach((value) => systemLanguageRegressionAddUnique(hardcodedRemaining, value));
    (Array.isArray(newFeaturesOutput.oldStyleFeatureMessages) ? newFeaturesOutput.oldStyleFeatureMessages : []).forEach((value) => systemLanguageRegressionAddUnique(hardcodedRemaining, value));
    hardcodedRemaining.forEach((value) => systemLanguageRegressionAddUnique(result.forbiddenRemaining, { source: "hardcoded_or_bypass", value }));

    if (result.forbiddenRemaining.length) systemLanguageRegressionAddUnique(result.failedChecks, "forbidden_remaining");
    if (result.missingCoverage.length) systemLanguageRegressionAddUnique(result.failedChecks, "missing_coverage");
    if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
    if (result.smokeVersion !== SYSTEM_LANGUAGE_REGRESSION_SMOKE_VERSION || result.smokeVersion.indexOf("step7_6") === -1) fail("smoke_version_unique_for_step", result.smokeVersion);

    result.coverageOk = categoryOk.coverage === true && result.missingCoverage.length === 0;
    result.sourceOfTruthOk = categoryOk.sourceOfTruth === true && !result.failedChecks.some((check) => /source_of_truth|sourceOfTruth|taxonomy|contract|localeRu|economyTextPairs/.test(String(check)) && !/^taxonomy:/.test(String(check)));
    result.phraseRuleOk = categoryOk.phraseRule === true && !result.forbiddenRemaining.some((row) => /forbidden_|explanation_|z_phrase|phrase/i.test(JSON.stringify(row)));
    result.toneOk = categoryOk.tone === true && !result.forbiddenRemaining.some((row) => /teacher|tone|oldStyle|forbidden|service|lecture|cooldown_without_timer/i.test(JSON.stringify(row)));
    result.routingOk = categoryOk.routing === true && !result.failedChecks.some((check) => /routing|route|bypass/.test(String(check)));
    result.noHardcodedOk = hardcodedRemaining.length === 0 && !result.forbiddenRemaining.some((row) => /hardcoded|direct user-facing|bypass|Console\.txt/i.test(JSON.stringify(row)));
    result.ok = result.coverageOk === true
      && result.sourceOfTruthOk === true
      && result.phraseRuleOk === true
      && result.toneOk === true
      && result.routingOk === true
      && result.noHardcodedOk === true
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const SYSTEM_UI_RUNTIME_AUDIT_BUILD_TAG = "build_2026_06_11_step7_7_ui_runtime_expectation_fix";
  const SYSTEM_UI_RUNTIME_AUDIT_COMMIT = "step7_7_ui_runtime_expectation_fix";
  const SYSTEM_UI_RUNTIME_AUDIT_SMOKE_VERSION = "step7_7_ui_runtime_expectation_fix_smoke_v20260611_003";
  const SYSTEM_UI_RUNTIME_REQUIRED_SCENARIOS = Object.freeze([
    "insufficient points",
    "cooldown",
    "success",
    "lock/forbidden action",
    "timer-related message",
  ]);
  const SYSTEM_UI_RUNTIME_LEGACY_PATTERNS = Object.freeze([
    /Подожди немного\./i,
    /Дай паузу\./i,
    /Не залетело\./i,
    /Этот мув не зашёл\./i,
    /Такого нет\./i,
    /Выбери игрока\./i,
    /Таймер:\s*\d+с/i,
    /Толпа решает$/i,
    /Ты уже проголосовал\./i,
    /Всё, тайм-аут\./i,
    /Служба безопасности блокирует/i,
  ]);

  function systemUiRuntimeAddUnique(list, value){
    const encoded = typeof value === "string" ? value : JSON.stringify(value);
    if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
  }

  function systemUiRuntimeApprovedRows(){
    const rows = [];
    systemCopyEntries(SystemCopy).forEach((entry) => {
      const ctx = {
        name: "Игрок",
        target: "Цель",
        guest: "Гость",
        location: "Площадь",
        voteCost: 1,
        rematchCost: 1,
        escapeCost: 1,
        teacher: "A",
        student: "B",
        oppName: "Оппонент",
        text: "итог",
        winner: "A",
        loser: "B",
        a: "A",
        b: "B",
        aVotes: 1,
        bVotes: 0,
        attackerName: "A",
        attackerInf: 1,
        returnAmount: 1,
        amount: 1,
        cost: 1,
      };
      rows.push({
        kind: entry.group,
        code: entry.code,
        template: entry.text,
        text: say(entry.group, entry.code, ctx),
        source: `SystemCopy.${entry.group}.${entry.code}`,
      });
    });
    return rows;
  }

  function systemUiRuntimeSourceForText(text){
    const source = normalizeZPhraseText(text);
    if (!source) return null;
    const rows = systemUiRuntimeApprovedRows();
    const exact = rows.find((row) => normalizeZPhraseText(row.text) === source);
    if (exact) return exact;
    return rows.find((row) => {
      const template = normalizeZPhraseText(row.template);
      if (!template || template.indexOf("{") === -1) return false;
      const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\{[A-Za-z0-9_]+\\\}/g, ".+?");
      try { return new RegExp(`^${escaped}$`).test(source); } catch (_) { return false; }
    }) || null;
  }

  function systemUiRuntimeLooksLegacy(text){
    const source = String(text || "");
    return SYSTEM_UI_RUNTIME_LEGACY_PATTERNS.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(source);
    });
  }

  function systemUiRuntimeFindTarget(S){
    const players = S && S.players && typeof S.players === "object" ? Object.values(S.players) : [];
    return players.find((p) => p && !p.isMe && String(p.id || "") !== "me" && p.role !== "cop") || players.find((p) => p && !p.isMe && String(p.id || "") !== "me") || null;
  }

  function systemUiRuntimeClone(value){
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return value; }
  }

  function systemUiRuntimeRestoreObject(target, snapshot){
    if (!target || !snapshot || typeof target !== "object" || typeof snapshot !== "object") return;
    Object.keys(target).forEach((key) => { delete target[key]; });
    Object.keys(snapshot).forEach((key) => { target[key] = snapshot[key]; });
  }

  function systemUiRuntimeFindButton(text, root){
    if (typeof document === "undefined") return null;
    const scope = root && root.querySelectorAll ? root : document;
    const wanted = String(text || "").trim().toLowerCase();
    return Array.from(scope.querySelectorAll("button")).find((button) => String(button.textContent || "").trim().toLowerCase() === wanted) || null;
  }

  function systemUiRuntimeDispatchClick(button){
    if (!button) return false;
    try {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    } catch (_) {
      try { button.click(); return true; } catch (__) {}
    }
    return false;
  }

  function systemUiRuntimeOpenBattleInvite(UI, targetName){
    if (!UI || typeof UI.renderBattles !== "function") return null;
    UI._battleInvite = Object.assign({}, UI._battleInvite || {}, { open: true, q: String(targetName || ""), sel: 0 });
    UI.renderBattles();
    const input = (typeof document !== "undefined") ? document.getElementById("battleInviteInput") : null;
    if (input) {
      input.value = String(targetName || "");
    }
    const root = input && input.closest ? (input.closest(".eventRow") || input.parentNode || document) : document;
    return systemUiRuntimeFindButton("баттл", root);
  }

  function systemUiRuntimeCapture(UI, GameObj, fn){
    const seen = [];
    const add = (surface, text, meta) => {
      const source = String(text || "").trim();
      if (!source) return;
      seen.push(Object.assign({ surface, text: source }, meta || {}));
    };
    const originals = {
      showStatToast: UI && UI.showStatToast,
      showActionToast: UI && UI.showActionToast,
      showToast: UI && UI.showToast,
      pushSystem: UI && UI.pushSystem,
      pushDm: GameObj && GameObj.__A && GameObj.__A.pushDm,
    };
    try {
      if (UI && typeof UI.showStatToast === "function") {
        UI.showStatToast = function(kind, text){
          add("UI.showStatToast", text, { statKind: kind });
          return originals.showStatToast.apply(this, arguments);
        };
      }
      if (UI && typeof UI.showActionToast === "function") {
        UI.showActionToast = function(anchor, text){
          add("UI.showActionToast", text);
          return originals.showActionToast.apply(this, arguments);
        };
      }
      if (UI && typeof UI.showToast === "function") {
        UI.showToast = function(text){
          add("UI.showToast", text);
          return originals.showToast.apply(this, arguments);
        };
      }
      if (UI && typeof UI.pushSystem === "function") {
        UI.pushSystem = function(text, opts){
          add("UI.pushSystem", text, { routed: !!(opts && opts.routed), kind: opts && opts.kind, code: opts && opts.code });
          return originals.pushSystem.apply(this, arguments);
        };
      }
      if (GameObj && GameObj.__A && typeof GameObj.__A.pushDm === "function") {
        GameObj.__A.pushDm = function(withId, name, text, opts){
          if (opts && opts.isSystem) add("Game.__A.pushDm", text, { dmTargetId: withId, speaker: name });
          return originals.pushDm.apply(this, arguments);
        };
      }
      fn();
    } catch (error) {
      add("exception", String(error && error.message ? error.message : error));
    } finally {
      if (UI && originals.showStatToast) UI.showStatToast = originals.showStatToast;
      if (UI && originals.showActionToast) UI.showActionToast = originals.showActionToast;
      if (UI && originals.showToast) UI.showToast = originals.showToast;
      if (UI && originals.pushSystem) UI.pushSystem = originals.pushSystem;
      if (GameObj && GameObj.__A && originals.pushDm) GameObj.__A.pushDm = originals.pushDm;
    }
    return seen;
  }

  Game.__DEV.smokeSystemUiRuntimeOnce = function smokeSystemUiRuntimeOnce(){
    const result = {
      ok: false,
      buildTag: SYSTEM_UI_RUNTIME_AUDIT_BUILD_TAG,
      commit: SYSTEM_UI_RUNTIME_AUDIT_COMMIT,
      smokeVersion: SYSTEM_UI_RUNTIME_AUDIT_SMOKE_VERSION,
      checkedScenarios: [],
      legacyUiMessages: [],
      bypassPaths: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const fail = (check, detail) => {
      systemUiRuntimeAddUnique(result.failedChecks, check);
      systemUiRuntimeAddUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const UI = Game && Game.UI ? Game.UI : null;
    const S = Game && Game.__S ? Game.__S : null;
    const target = systemUiRuntimeFindTarget(S);
    const snapshots = {
      me: S && S.me ? systemUiRuntimeClone(S.me) : null,
      battleCooldowns: S && S.battleCooldowns ? systemUiRuntimeClone(S.battleCooldowns) : null,
      events: S && Array.isArray(S.events) ? systemUiRuntimeClone(S.events) : null,
      dm: S && S.dm ? systemUiRuntimeClone(S.dm) : null,
      dmMessages: S && Array.isArray(S.dmMessages) ? systemUiRuntimeClone(S.dmMessages) : null,
      battles: S && Array.isArray(S.battles) ? systemUiRuntimeClone(S.battles) : null,
      battleInvite: UI && UI._battleInvite ? systemUiRuntimeClone(UI._battleInvite) : null,
    };
    const inspectScenario = (scenario, messages, expected) => {
      const row = { scenario, messages: [], ok: false };
      (Array.isArray(messages) ? messages : []).forEach((message) => {
        const source = systemUiRuntimeSourceForText(message.text);
        const phrase = validateSystemZPhrase(message.text);
        const entry = Object.assign({}, message, {
          sourceTrace: source ? source.source : null,
          kind: source ? source.kind : null,
          code: source ? source.code : null,
          zPhraseOk: phrase.ok,
          zPhraseReasons: phrase.reasons,
        });
        row.messages.push(entry);
        if (!source) {
          systemUiRuntimeAddUnique(result.bypassPaths, { scenario, surface: message.surface, text: message.text, reason: "not_traced_to_SystemCopy_or_System.say" });
        }
        if (systemUiRuntimeLooksLegacy(message.text)) {
          systemUiRuntimeAddUnique(result.legacyUiMessages, { scenario, surface: message.surface, text: message.text });
        }
        if (!phrase.ok) {
          systemUiRuntimeAddUnique(result.forbiddenRemaining, { scenario, text: message.text, reasons: phrase.reasons });
        }
      });
      const wanted = expected && expected.code ? messages.some((message) => {
        const source = systemUiRuntimeSourceForText(message.text);
        return source && source.kind === expected.kind && source.code === expected.code;
      }) : messages.length > 0;
      row.ok = wanted && row.messages.length > 0;
      if (!row.messages.length) {
        systemUiRuntimeAddUnique(result.missingCoverage, scenario);
        fail("scenario_message_missing", scenario);
      } else if (!wanted) {
        fail("scenario_expected_systemcopy_trace_missing", { scenario, expected, messages: row.messages });
      }
      result.checkedScenarios.push(row);
    };

    if (!UI) fail("ui_missing");
    if (!S || !S.me || !S.players) fail("state_missing");
    if (!target) fail("target_player_missing");

    try {
      if (UI && S && S.me && target) {
        S.battleCooldowns = S.battleCooldowns || {};
        S.battles = [];

        S.me.points = 0;
        delete S.battleCooldowns[target.id];
        inspectScenario("insufficient points", systemUiRuntimeCapture(UI, Game, () => {
          const button = systemUiRuntimeOpenBattleInvite(UI, target.name);
          if (!systemUiRuntimeDispatchClick(button)) fail("insufficient_points_button_missing");
        }), { kind: "errors", code: "insufficientPoints" });

        S.me.points = 5;
        S.battleCooldowns[target.id] = Date.now();
        inspectScenario("cooldown", systemUiRuntimeCapture(UI, Game, () => {
          const button = systemUiRuntimeOpenBattleInvite(UI, target.name);
          if (!systemUiRuntimeDispatchClick(button)) fail("cooldown_button_missing");
        }), { kind: "warnings", code: "cooldownShort" });
        delete S.battleCooldowns[target.id];

        S.dm = Object.assign({}, S.dm || {}, { open: true, activeId: target.id });
        inspectScenario("success", systemUiRuntimeCapture(UI, Game, () => {
          if (typeof UI.renderDM === "function") UI.renderDM();
          const actions = typeof document !== "undefined" ? document.getElementById("dmActions") : null;
          const button = systemUiRuntimeFindButton("Лайк", actions || document);
          if (!systemUiRuntimeDispatchClick(button)) fail("success_like_button_missing");
        }), { kind: "systemEvents", code: "dmReaction" });

        const now = Date.now();
        const eventId = `system_ui_runtime_lock_${now}`;
        const event = {
          id: eventId,
          kind: "draw",
          state: "open",
          title: "Толпа решает.",
          a: { id: target.id, name: target.name, influence: target.influence || 0 },
          b: { id: "system_ui_runtime_other", name: "Другой", influence: 0 },
          aName: target.name,
          bName: "Другой",
          createdAt: now,
          endsAt: now + 5000,
          crowd: { voters: { me: "a" }, aVotes: 1, bVotes: 0, votesA: 1, votesB: 0, cap: 2, countdownStartMs: now, countdownMs: 5000 },
        };
        S.events = Array.isArray(S.events) ? S.events : [];
        S.events.unshift(event);
        inspectScenario("lock/forbidden action", systemUiRuntimeCapture(UI, Game, () => {
          if (typeof UI.renderEvents === "function") UI.renderEvents();
          const button = typeof document !== "undefined" ? document.querySelector(`[data-event-id="${eventId}"] .eventVoteBtn`) : null;
          if (!systemUiRuntimeDispatchClick(button)) fail("locked_event_vote_button_missing");
          const toast = typeof document !== "undefined" ? document.querySelector(".voteBtnToast") : null;
          if (toast) {
            if (!UI.__systemUiRuntimeLockProbe) UI.__systemUiRuntimeLockProbe = [];
            UI.__systemUiRuntimeLockProbe.push(String(toast.textContent || ""));
          }
        }).concat((UI.__systemUiRuntimeLockProbe || []).splice(0).map((text) => ({ surface: "DOM.voteBtnToast", text }))), { kind: "errors", code: "unavailable" });

        inspectScenario("timer-related message", systemUiRuntimeCapture(UI, Game, () => {
          if (typeof UI.renderEvents === "function") UI.renderEvents();
          if (!UI.__systemUiRuntimeTimerProbe) UI.__systemUiRuntimeTimerProbe = [];
          UI.__systemUiRuntimeTimerProbe.push(Game.System.say("systemEvents", "crowdStart"));
        }).concat((UI.__systemUiRuntimeTimerProbe || []).splice(0).map((text) => ({ surface: "System.say.crowdStart", text }))), { kind: "systemEvents", code: "crowdStart" });
      }
    } finally {
      try {
        if (S && snapshots.me && S.me) systemUiRuntimeRestoreObject(S.me, snapshots.me);
        if (S && snapshots.battleCooldowns) S.battleCooldowns = snapshots.battleCooldowns;
        if (S && snapshots.events) S.events = snapshots.events;
        if (S && snapshots.dm) S.dm = snapshots.dm;
        if (S && snapshots.dmMessages) S.dmMessages = snapshots.dmMessages;
        if (S && snapshots.battles) S.battles = snapshots.battles;
        if (UI) UI._battleInvite = snapshots.battleInvite || { open: false, q: "", sel: 0 };
        if (UI && typeof UI.renderAll === "function") UI.renderAll();
      } catch (_) {}
    }

    SYSTEM_UI_RUNTIME_REQUIRED_SCENARIOS.forEach((scenario) => {
      if (!result.checkedScenarios.some((row) => row && row.scenario === scenario)) {
        systemUiRuntimeAddUnique(result.missingCoverage, scenario);
      }
    });
    if (result.legacyUiMessages.length) systemUiRuntimeAddUnique(result.failedChecks, "legacy_ui_messages_remaining");
    if (result.bypassPaths.length) systemUiRuntimeAddUnique(result.failedChecks, "ui_systemcopy_bypass_paths_remaining");
    if (result.forbiddenRemaining.length) systemUiRuntimeAddUnique(result.failedChecks, "forbidden_remaining");
    if (result.missingCoverage.length) systemUiRuntimeAddUnique(result.failedChecks, "missing_coverage");
    if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
    if (result.smokeVersion !== SYSTEM_UI_RUNTIME_AUDIT_SMOKE_VERSION || result.smokeVersion.indexOf("step7_7") === -1) fail("smoke_version_unique_for_step", result.smokeVersion);
    result.ok = result.legacyUiMessages.length === 0
      && result.bypassPaths.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const FAKE_TONE_COVERAGE_BUILD_TAG = "build_2026_06_11_step8_2_fake_tone_validation_filters";
  const FAKE_TONE_COVERAGE_COMMIT = "step8_2_fake_tone_validation_filters";
  const FAKE_TONE_COVERAGE_SMOKE_VERSION = "step8_2_fake_tone_validation_filters_smoke_v20260611_001";
  const FAKE_TONE_COVERAGE_REQUIRED_ZONES = Object.freeze([
    "system messages",
    "NPC speech",
    "interface labels",
    "arguments",
    "hints",
    "new feature texts",
  ]);
  const FAKE_TONE_COVERAGE_ZONE_PROBES = Object.freeze({
    "system messages": Object.freeze([
      "Game.__DEV.smokeSystemToneOnce",
      "Game.__DEV.smokeSystemLanguageRegressionOnce",
      "Game.SystemCopy",
    ]),
    "NPC speech": Object.freeze([
      "Game.__DEV.smokeZoomerNpcCompatibilityOnce",
      "Game.__DEV.smokeZoomerNpcNoMentoringOnce",
      "Game.NPCSpeech",
    ]),
    "interface labels": Object.freeze([
      "Game.__DEV.smokeZoomerTermsReadyOnce",
      "Game.__DEV.smokeZoomerTermsInventoryOnce",
      "document.uiLabels",
    ]),
    "arguments": Object.freeze([
      "Game.__DEV.smokeZoomerArgumentAuthenticityOnce",
      "Game.__DEV.smokeZoomerArgumentWrappersOnce",
      "Game.Data.ARGUMENTS",
    ]),
    "hints": Object.freeze([
      "Game.__DEV.smokeZoomerHintTermsOnce",
      "Game.__DEV.styleLexTouchpointsOnce",
      "Game.Data.TEXTS.genz.hints",
    ]),
    "new feature texts": Object.freeze([
      "Game.__DEV.smokeSystemNewFeaturesCopyOnce",
      "Game.__DEV.smokeZoomerNewFeaturesTermsOnce",
      "SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS",
    ]),
  });
  const FAKE_TONE_FILTER_NAMES = Object.freeze([
    "trying_to_sound_young",
    "eye_roll_risk",
    "age_20_25_authenticity",
  ]);
  const FAKE_TONE_SAMPLE_CONTEXT = Object.freeze({
    name: "Имя",
    target: "Цель",
    guest: "Гость",
    voteCost: 1,
    rematchCost: 1,
    escapeCost: 1,
    location: "Площадь",
    teacher: "A",
    student: "B",
    oppName: "Оппонент",
    text: "итог",
    winner: "A",
    loser: "B",
    a: "A",
    b: "B",
    aVotes: 1,
    bVotes: 0,
    attackerName: "A",
    attackerInf: 1,
    returnAmount: 1,
    cost: 1,
    amount: 1,
  });

  function fakeToneCoverageAddUnique(list, value){
    const encoded = typeof value === "string" ? value : JSON.stringify(value);
    if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === encoded)) list.push(value);
  }

  function fakeToneNormalizeText(value){
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function fakeToneIsTextLike(value){
    return typeof value === "string" && fakeToneNormalizeText(value).length > 0;
  }

  function fakeTonePushEntry(entries, seen, zone, source, text, meta){
    const normalized = fakeToneNormalizeText(text);
    if (!normalized) return;
    const key = `${zone}\u0000${source}\u0000${normalized}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(Object.assign({
      zone,
      source: String(source || "unknown"),
      text: normalized,
    }, meta || {}));
  }

  function fakeToneCollectStrings(value, zone, source, entries, seen, depth){
    if (depth > 6 || value == null) return;
    if (typeof value === "string") {
      fakeTonePushEntry(entries, seen, zone, source, value);
      return;
    }
    if (typeof value === "function") {
      try {
        ["Имя", "Площадь", "Цель"].forEach((sample, index) => {
          const rendered = value(sample, sample, sample);
          if (fakeToneIsTextLike(rendered)) fakeTonePushEntry(entries, seen, zone, `${source}.rendered.${index}`, rendered);
        });
      } catch (_) {}
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => fakeToneCollectStrings(item, zone, `${source}.${index}`, entries, seen, depth + 1));
      return;
    }
    if (typeof value === "object") {
      Object.keys(value).forEach((key) => {
        const item = value[key];
        if (typeof item === "string" || typeof item === "function" || Array.isArray(item) || (item && typeof item === "object")) {
          fakeToneCollectStrings(item, zone, `${source}.${key}`, entries, seen, depth + 1);
        }
      });
    }
  }

  function fakeToneRenderSystem(kind, code){
    try {
      if (Game.System && typeof Game.System.say === "function") {
        return Game.System.say(kind, code, FAKE_TONE_SAMPLE_CONTEXT);
      }
    } catch (_) {}
    return "";
  }

  function fakeToneCollectSystemMessages(entries, seen){
    if (Game.SystemCopy || SystemCopy) {
      fakeToneCollectStrings(Game.SystemCopy || SystemCopy, "system messages", "Game.SystemCopy", entries, seen, 0);
    }
    if (typeof SYSTEM_TEXT_TEMPLATES !== "undefined") {
      fakeToneCollectStrings(SYSTEM_TEXT_TEMPLATES, "system messages", "SYSTEM_TEXT_TEMPLATES", entries, seen, 0);
    }
    if (typeof SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS !== "undefined") {
      fakeToneCollectStrings(SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS, "system messages", "SYSTEM_TEMPLATE_PLACEHOLDER_FALLBACKS", entries, seen, 0);
    }
    if (typeof SYSTEM_COPY_INVENTORY !== "undefined") {
      Array.from(SYSTEM_COPY_INVENTORY).forEach((row, index) => {
        const kind = normalizeKind(row && row.kind);
        const code = String(row && row.code || "").trim();
        if (kind && code) fakeTonePushEntry(entries, seen, "system messages", `SYSTEM_COPY_INVENTORY.${index}.${kind}.${code}`, fakeToneRenderSystem(kind, code));
      });
    }
  }

  function fakeToneCollectNpcSpeech(entries, seen){
    const data = Game && Game.Data ? Game.Data : {};
    const npc = Game && Game.NPC ? Game.NPC : {};
    const speech = Game && Game.NPCSpeech ? Game.NPCSpeech : {};
    fakeToneCollectStrings(npc.SAY, "NPC speech", "Game.NPC.SAY", entries, seen, 0);
    fakeToneCollectStrings(npc.DM_PROFILE_LINES, "NPC speech", "Game.NPC.DM_PROFILE_LINES", entries, seen, 0);
    fakeToneCollectStrings(npc.villainQuestions, "NPC speech", "Game.NPC.villainQuestions", entries, seen, 0);
    fakeToneCollectStrings(npc.villainChallenges, "NPC speech", "Game.NPC.villainChallenges", entries, seen, 0);
    fakeToneCollectStrings(data.COP_TEMPLATES, "NPC speech", "Game.Data.COP_TEMPLATES", entries, seen, 0);
    fakeToneCollectStrings(data.NPC_CHAT_LINES, "NPC speech", "Game.Data.NPC_CHAT_LINES", entries, seen, 0);
    fakeToneCollectStrings(data.NPC_EVENT_TEMPLATES, "NPC speech", "Game.Data.NPC_EVENT_TEMPLATES", entries, seen, 0);
    fakeToneCollectStrings(speech.TEMPLATES_BY_LOCALE, "NPC speech", "Game.NPCSpeech.TEMPLATES_BY_LOCALE", entries, seen, 0);
    fakeToneCollectStrings(speech.ROLE_PROFILES, "NPC speech", "Game.NPCSpeech.ROLE_PROFILES", entries, seen, 0);
  }

  function fakeToneCollectInterfaceLabels(entries, seen){
    if (typeof document === "undefined") return;
    const selectors = [
      "button",
      "input[placeholder]",
      "[aria-label]",
      "[title]",
      ".blockHeader",
      ".headerTitleText",
      ".battleTitleText",
      ".pill",
    ];
    try {
      selectors.forEach((selector) => {
        Array.from(document.querySelectorAll(selector)).forEach((node, index) => {
          const label = (node.getAttribute && (node.getAttribute("aria-label") || node.getAttribute("placeholder") || node.getAttribute("title"))) || node.textContent || "";
          fakeTonePushEntry(entries, seen, "interface labels", `document.${selector}.${index}`, label);
        });
      });
    } catch (_) {}
  }

  function fakeToneCollectArguments(entries, seen){
    const data = Game && Game.Data ? Game.Data : {};
    try {
      if (data && typeof data.initArgumentsOnce === "function") data.initArgumentsOnce();
    } catch (_) {}
    ["attack", "defense"].forEach((side) => {
      const list = data && data.ARGUMENTS && Array.isArray(data.ARGUMENTS[side]) ? data.ARGUMENTS[side] : [];
      list.forEach((row, index) => fakeTonePushEntry(entries, seen, "arguments", `Game.Data.ARGUMENTS.${side}.${index}`, row && row.text, { side, id: row && row.id }));
    });
  }

  function fakeToneCollectHints(entries, seen){
    const data = Game && Game.Data ? Game.Data : {};
    const genz = data && data.TEXTS && data.TEXTS.genz ? data.TEXTS.genz : {};
    [
      "tie_call_to_action",
      "tie_click_name_hint",
      "invite_open_hint",
      "hint_type_who",
      "hint_type_where",
      "hint_type_about",
      "hint_type_yn",
    ].forEach((key) => fakeTonePushEntry(entries, seen, "hints", `Game.Data.TEXTS.genz.${key}`, genz[key]));
    if (data && data.START_SCREEN) {
      fakeToneCollectStrings(data.START_SCREEN.introLines, "hints", "Game.Data.START_SCREEN.introLines", entries, seen, 0);
      fakeTonePushEntry(entries, seen, "hints", "Game.Data.START_SCREEN.economyHonestyLine", data.START_SCREEN.economyHonestyLine);
    }
  }

  function fakeToneCollectNewFeatureTexts(entries, seen){
    if (typeof SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS !== "undefined") {
      Array.from(SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS).forEach((row, index) => {
        const kind = normalizeKind(row && row.kind);
        const code = String(row && row.code || "").trim();
        if (kind && code) fakeTonePushEntry(entries, seen, "new feature texts", `SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS.${index}.${kind}.${code}`, fakeToneRenderSystem(kind, code), { feature: row && row.feature });
      });
    }
    const data = Game && Game.Data ? Game.Data : {};
    if (data && data.START_SCREEN) fakeToneCollectStrings(data.START_SCREEN, "new feature texts", "Game.Data.START_SCREEN", entries, seen, 0);
  }

  function fakeToneCollectCheckedTexts(){
    const entries = [];
    const seen = new Set();
    fakeToneCollectSystemMessages(entries, seen);
    fakeToneCollectNpcSpeech(entries, seen);
    fakeToneCollectInterfaceLabels(entries, seen);
    fakeToneCollectArguments(entries, seen);
    fakeToneCollectHints(entries, seen);
    fakeToneCollectNewFeatureTexts(entries, seen);
    return entries;
  }

  const FAKE_TONE_FILTERS = Object.freeze({
    trying_to_sound_young: Object.freeze({
      id: "trying_to_sound_young",
      test(text){
        return !/(^|[^А-Яа-яЁёA-Za-z])(кринж|вайб|имба|рофл|изи|лол|лмао|кек|жиза|краш|флекс|чилл|хайп|бро|чел|сигма|скуф|лит|slay|vibe|cringe|yeet|based|rizz|sus)(?=$|[^А-Яа-яЁёA-Za-z])/i.test(text);
      },
    }),
    eye_roll_risk: Object.freeze({
      id: "eye_roll_risk",
      test(text){
        const normalized = fakeToneNormalizeText(text);
        if (/(?:[!?]){3,}|(?:[🔥💯😎🤙✨]){2,}|[#]{1,}\w+/.test(normalized)) return false;
        if (/[A-ZА-ЯЁ]{8,}/.test(normalized.replace(/[A-ZА-ЯЁ]{1,4}\b/g, ""))) return false;
        return !/(ну\s+типа|прям\s+вау|это\s+база|молод[её]жн|по[-\s]?молодому|как\s+в\s+тиктоке|на\s+сленге)/i.test(normalized);
      },
    }),
    age_20_25_authenticity: Object.freeze({
      id: "age_20_25_authenticity",
      test(text){
        const normalized = fakeToneNormalizeText(text);
        if (!normalized) return false;
        if (/(подрост|тинейдж|школьн|зумер|gen\s*z|поколени[ея]\s*z|детск|малолет|тусовк)/i.test(normalized)) return false;
        if (normalized.length > 180 && /(?:ты|твой|тебя|тебе)/i.test(normalized) && /(?:должен|обязан|запомни|пойми)/i.test(normalized)) return false;
        return true;
      },
    }),
  });

  function fakeToneCoverageHasUiLabels(){
    if (typeof document === "undefined") return false;
    const selectors = [
      "button",
      "input[placeholder]",
      "[aria-label]",
      ".blockHeader",
      ".pill",
      ".statChip",
    ];
    try {
      return selectors.some((selector) => Array.from(document.querySelectorAll(selector)).some((node) => {
        const text = String((node && (node.getAttribute && (node.getAttribute("aria-label") || node.getAttribute("placeholder")))) || (node && node.textContent) || "").trim();
        return text.length > 0;
      }));
    } catch (_) {
      return false;
    }
  }

  function fakeToneCoverageProbeAvailable(probe){
    const dev = Game && Game.__DEV ? Game.__DEV : null;
    const data = Game && Game.Data ? Game.Data : null;
    if (probe === "Game.__DEV.smokeSystemToneOnce") return !!(dev && typeof dev.smokeSystemToneOnce === "function");
    if (probe === "Game.__DEV.smokeSystemLanguageRegressionOnce") return !!(dev && typeof dev.smokeSystemLanguageRegressionOnce === "function");
    if (probe === "Game.SystemCopy") return !!(Game && Game.SystemCopy && Object.keys(Game.SystemCopy).length);
    if (probe === "Game.__DEV.smokeZoomerNpcCompatibilityOnce") return !!(dev && typeof dev.smokeZoomerNpcCompatibilityOnce === "function");
    if (probe === "Game.__DEV.smokeZoomerNpcNoMentoringOnce") return !!(dev && typeof dev.smokeZoomerNpcNoMentoringOnce === "function");
    if (probe === "Game.NPCSpeech") return !!(Game && Game.NPCSpeech);
    if (probe === "Game.__DEV.smokeZoomerTermsReadyOnce") return !!(dev && typeof dev.smokeZoomerTermsReadyOnce === "function");
    if (probe === "Game.__DEV.smokeZoomerTermsInventoryOnce") return !!(dev && typeof dev.smokeZoomerTermsInventoryOnce === "function");
    if (probe === "document.uiLabels") return fakeToneCoverageHasUiLabels();
    if (probe === "Game.__DEV.smokeZoomerArgumentAuthenticityOnce") return !!(dev && typeof dev.smokeZoomerArgumentAuthenticityOnce === "function");
    if (probe === "Game.__DEV.smokeZoomerArgumentWrappersOnce") return !!(dev && typeof dev.smokeZoomerArgumentWrappersOnce === "function");
    if (probe === "Game.Data.ARGUMENTS") return !!(data && data.ARGUMENTS && Object.keys(data.ARGUMENTS).length);
    if (probe === "Game.__DEV.smokeZoomerHintTermsOnce") return !!(dev && typeof dev.smokeZoomerHintTermsOnce === "function");
    if (probe === "Game.__DEV.styleLexTouchpointsOnce") return !!(dev && typeof dev.styleLexTouchpointsOnce === "function");
    if (probe === "Game.Data.TEXTS.genz.hints") {
      const genz = data && data.TEXTS && data.TEXTS.genz ? data.TEXTS.genz : {};
      return Object.keys(genz).some((key) => /hint/i.test(key));
    }
    if (probe === "Game.__DEV.smokeSystemNewFeaturesCopyOnce") return !!(dev && typeof dev.smokeSystemNewFeaturesCopyOnce === "function");
    if (probe === "Game.__DEV.smokeZoomerNewFeaturesTermsOnce") return !!(dev && typeof dev.smokeZoomerNewFeaturesTermsOnce === "function");
    if (probe === "SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS") return typeof SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS !== "undefined" && Array.isArray(Array.from(SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS)) && SYSTEM_NEW_FEATURES_COPY_AUDIT_ROWS.length > 0;
    return false;
  }

  Game.__DEV.smokeFakeToneFiltersOnce = function smokeFakeToneFiltersOnce(){
    const result = {
      ok: false,
      buildTag: FAKE_TONE_COVERAGE_BUILD_TAG,
      commit: FAKE_TONE_COVERAGE_COMMIT,
      smokeVersion: FAKE_TONE_COVERAGE_SMOKE_VERSION,
      checkedZones: [],
      checkedFilters: [],
      checkedCount: 0,
      missingCoverage: [],
      failures: [],
      forbiddenRemaining: [],
      failedChecks: [],
    };
    const fail = (check, detail) => {
      fakeToneCoverageAddUnique(result.failedChecks, check);
      fakeToneCoverageAddUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    FAKE_TONE_COVERAGE_REQUIRED_ZONES.forEach((zone) => {
      const probes = Array.from(FAKE_TONE_COVERAGE_ZONE_PROBES[zone] || []);
      const available = probes.filter((probe) => fakeToneCoverageProbeAvailable(probe));
      result.checkedZones.push({ zone, covered: available.length > 0, probes: available });
      if (!available.length) {
        fakeToneCoverageAddUnique(result.missingCoverage, zone);
        fail("coverage_zone_missing", zone);
      }
    });
    FAKE_TONE_FILTER_NAMES.forEach((name) => {
      if (!FAKE_TONE_FILTERS[name] || typeof FAKE_TONE_FILTERS[name].test !== "function") {
        fakeToneCoverageAddUnique(result.missingCoverage, name);
        fail("filter_missing", name);
      } else {
        result.checkedFilters.push(name);
      }
    });
    const entries = fakeToneCollectCheckedTexts();
    const checkedZonesWithText = new Set();
    entries.forEach((entry) => {
      if (entry && entry.zone) checkedZonesWithText.add(entry.zone);
      FAKE_TONE_FILTER_NAMES.forEach((name) => {
        const filter = FAKE_TONE_FILTERS[name];
        if (!filter || typeof filter.test !== "function") return;
        let passed = false;
        try {
          passed = filter.test(entry.text, entry);
        } catch (error) {
          passed = false;
          fail("filter_exception", { filter: name, source: entry.source, error: String(error && error.message ? error.message : error) });
        }
        if (!passed) {
          const failure = { filter: name, zone: entry.zone, source: entry.source, text: entry.text };
          fakeToneCoverageAddUnique(result.forbiddenRemaining, failure);
          fail(name, failure);
        }
      });
    });
    result.checkedCount = entries.length;
    FAKE_TONE_COVERAGE_REQUIRED_ZONES.forEach((zone) => {
      if (!checkedZonesWithText.has(zone)) {
        fakeToneCoverageAddUnique(result.missingCoverage, zone);
        fail("checked_text_zone_missing", zone);
      }
    });
    if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
    if (result.smokeVersion !== FAKE_TONE_COVERAGE_SMOKE_VERSION || result.smokeVersion.indexOf("step8_2") === -1 || result.smokeVersion.indexOf(result.commit) === -1) {
      fail("smoke_version_unique_for_commit", result.smokeVersion);
    }
    if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    result.ok = result.checkedFilters.length === FAKE_TONE_FILTER_NAMES.length
      && result.checkedZones.length === FAKE_TONE_COVERAGE_REQUIRED_ZONES.length
      && result.checkedCount > 0
      && result.missingCoverage.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.failedChecks.length === 0;
    return result;
  };
  Game.__DEV.smokeFakeToneZonesOnce = function smokeFakeToneZonesOnce(){
    return Game.__DEV.smokeFakeToneFiltersOnce();
  };

  const FAKE_TONE_SAMPLE_AUDIT_BUILD_TAG = "build_2026_06_12_step8_5_sampled_fake_tone_smoke_self_alias_fix";
  const FAKE_TONE_SAMPLE_AUDIT_COMMIT = "step8_5_sampled_fake_tone_smoke_self_alias_fix";
  const FAKE_TONE_SAMPLE_AUDIT_SMOKE_VERSION = "step8_5_sampled_fake_tone_smoke_self_alias_fix_v20260612_002";
  const FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MIN = 30;
  const FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MAX = 50;
  const FUTURE_TEXT_ANTI_FAKE_GATE_BUILD_TAG = "build_2026_06_12_step8_6_future_text_anti_fake_gate";
  const FUTURE_TEXT_ANTI_FAKE_GATE_COMMIT = "step8_6_future_text_anti_fake_gate";
  const FUTURE_TEXT_ANTI_FAKE_GATE_SMOKE_VERSION = "step8_6_future_text_anti_fake_gate_smoke_v20260612_001";
  const FUTURE_TEXT_ANTI_FAKE_GATE_GUARDS = Object.freeze([
    "Game.__DEV.smokeFakeToneFiltersOnce",
    "Game.__DEV.smokeFakeToneSampleAuditOnce",
    "Game.__DEV.smokeStopFakeLexiconOnce",
  ]);
  const FUTURE_TEXT_ANTI_FAKE_GATE_SURFACE_REGISTRY = Object.freeze([
    Object.freeze({ surface: "system messages", checkedBy: "Step 8 fake-tone checks", guards: FUTURE_TEXT_ANTI_FAKE_GATE_GUARDS }),
    Object.freeze({ surface: "NPC speech", checkedBy: "Step 8 fake-tone checks", guards: FUTURE_TEXT_ANTI_FAKE_GATE_GUARDS }),
    Object.freeze({ surface: "interface labels", checkedBy: "Step 8 fake-tone checks", guards: FUTURE_TEXT_ANTI_FAKE_GATE_GUARDS }),
    Object.freeze({ surface: "arguments", checkedBy: "Step 8 fake-tone checks", guards: FUTURE_TEXT_ANTI_FAKE_GATE_GUARDS }),
    Object.freeze({ surface: "hints", checkedBy: "Step 8 fake-tone checks", guards: FUTURE_TEXT_ANTI_FAKE_GATE_GUARDS }),
    Object.freeze({ surface: "new feature texts", checkedBy: "Step 8 fake-tone checks", guards: FUTURE_TEXT_ANTI_FAKE_GATE_GUARDS }),
  ]);

  function fakeToneSampleAuditPickEntries(entries){
    const byZone = new Map();
    entries.forEach((entry) => {
      const zone = entry && entry.zone ? String(entry.zone) : "unknown";
      if (!byZone.has(zone)) byZone.set(zone, []);
      byZone.get(zone).push(entry);
    });
    const zones = ["UI", "NPC speech", "system messages", "arguments"].filter((zone) => zone === "UI" || byZone.has(zone) || (zone === "UI" && byZone.has("interface labels")));
    const picks = [];
    const perZoneTarget = { UI: 8, "NPC speech": 8, "system messages": 7, arguments: 7 };
    zones.forEach((zone) => {
      const rows = zone === "UI" ? (byZone.get("interface labels") || []) : (byZone.get(zone) || []);
      const target = perZoneTarget[zone] || 0;
      const step = rows.length > target ? Math.max(1, Math.floor(rows.length / target)) : 1;
      for (let i = 0; i < rows.length && picks.length < FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MAX; i += step) {
        if (target && rows.length >= target && picks.filter((item) => item.zone === zone).length >= target) break;
        picks.push(rows[i]);
      }
    });
    if (picks.length < FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MIN) {
      entries.forEach((entry) => {
        if (picks.length >= FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MIN) return;
        if (!picks.some((item) => item.zone === entry.zone && item.source === entry.source && item.text === entry.text)) {
          picks.push(entry);
        }
      });
    }
    return picks.slice(0, FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MAX);
  }

  Game.__DEV.smokeFakeToneSampleAuditOnce = function smokeFakeToneSampleAuditOnce(){
    const result = {
      ok: false,
      buildTag: FAKE_TONE_SAMPLE_AUDIT_BUILD_TAG,
      commit: FAKE_TONE_SAMPLE_AUDIT_COMMIT,
      smokeVersion: FAKE_TONE_SAMPLE_AUDIT_SMOKE_VERSION,
      sampleCount: 0,
      sampledZones: [],
      fakeToneHits: [],
      memeHits: [],
      tryingToSoundYoungHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const fail = (check, detail) => {
      fakeToneCoverageAddUnique(result.failedChecks, check);
      fakeToneCoverageAddUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    try {
      const entries = fakeToneCollectCheckedTexts();
      const sampled = fakeToneSampleAuditPickEntries(entries);
      result.sampleCount = sampled.length;
      sampled.forEach((entry) => {
        const sampledZone = entry.zone === "interface labels" ? "UI" : entry.zone;
        if (!result.sampledZones.includes(sampledZone)) result.sampledZones.push(sampledZone);
        const text = fakeToneNormalizeText(entry.text);
        if (/(?:[^\p{L}\p{N}]|^)(кринж\w*|вайб\w*|имба|изи|рофл|лол|кек|жиза|краш|флекс|топчик|хайп\w*|скибиди|зумерск\w*|vibe|cringe|rizz|sus|мем\w*|мемас\w*|мемчик\w*)(?:[^\p{L}\p{N}]|$)/iu.test(text)) {
          fakeToneCoverageAddUnique(result.memeHits, { zone: entry.zone, source: entry.source, text });
        }
        if (/(?:[^\p{L}\p{N}]|^)(кринж\w*|вайб\w*|имба|изи|рофл|лол|кек|жиза|краш|флекс|топчик|хайп\w*|скибиди|зумерск\w*|vibe|cringe|rizz|sus)(?:[^\p{L}\p{N}]|$)/iu.test(text)) {
          fakeToneCoverageAddUnique(result.tryingToSoundYoungHits, { zone: entry.zone, source: entry.source, text });
          fakeToneCoverageAddUnique(result.fakeToneHits, { zone: entry.zone, source: entry.source, text, kind: "trying_to_sound_young" });
        }
      });
      ["UI", "NPC speech", "system messages", "arguments"].forEach((zone) => {
        if (!result.sampledZones.includes(zone)) fakeToneCoverageAddUnique(result.missingCoverage, zone);
      });
      if (result.sampleCount < FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MIN) fail("sample_count_below_minimum", result.sampleCount);
      if (result.memeHits.length) fail("meme_hits_present", result.memeHits);
      if (result.tryingToSoundYoungHits.length) fail("trying_to_sound_young_hits_present", result.tryingToSoundYoungHits);
      if (result.fakeToneHits.length) fail("fake_tone_hits_present", result.fakeToneHits);
      if (result.forbiddenRemaining.length) fail("forbidden_remaining_present", result.forbiddenRemaining);
      if (result.missingCoverage.length) fail("missing_coverage_present", result.missingCoverage);
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== FAKE_TONE_SAMPLE_AUDIT_SMOKE_VERSION || result.smokeVersion.indexOf("step8_5") === -1 || result.smokeVersion.indexOf(result.commit) === -1) {
        fail("smoke_version_unique_for_commit", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.sampleCount >= FAKE_TONE_SAMPLE_AUDIT_SAMPLE_MIN
      && result.fakeToneHits.length === 0
      && result.memeHits.length === 0
      && result.tryingToSoundYoungHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  Game.__DEV.smokeFutureTextAntiFakeGateOnce = function smokeFutureTextAntiFakeGateOnce(){
    const result = {
      ok: false,
      buildTag: FUTURE_TEXT_ANTI_FAKE_GATE_BUILD_TAG,
      commit: FUTURE_TEXT_ANTI_FAKE_GATE_COMMIT,
      smokeVersion: FUTURE_TEXT_ANTI_FAKE_GATE_SMOKE_VERSION,
      registeredSurfaces: [],
      coveredSurfaces: [],
      uncoveredFutureTextSurfaces: [],
      unguardedTextAdditions: [],
      missingCoverage: [],
      failures: [],
      forbiddenRemaining: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => fakeToneCoverageAddUnique(list, value);
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    try {
      const entries = fakeToneCollectCheckedTexts();
      const seenSurfaces = new Set();
      const currentSurfaces = Array.from(new Set(entries.map((entry) => entry.zone))).filter(Boolean);
      const registryBySurface = new Map();
      FUTURE_TEXT_ANTI_FAKE_GATE_SURFACE_REGISTRY.forEach((row) => {
        if (row && row.surface) registryBySurface.set(String(row.surface), row);
      });
      result.registeredSurfaces = FUTURE_TEXT_ANTI_FAKE_GATE_SURFACE_REGISTRY.map((row) => row.surface);
      currentSurfaces.forEach((surface) => {
        if (!registryBySurface.has(surface)) {
          addUnique(result.uncoveredFutureTextSurfaces, surface);
          addUnique(result.unguardedTextAdditions, { surface, reason: "surface_not_registered" });
        } else {
          seenSurfaces.add(surface);
        }
      });
      FUTURE_TEXT_ANTI_FAKE_GATE_SURFACE_REGISTRY.forEach((row) => {
        const surface = String(row && row.surface || "");
        if (!surface) {
          addUnique(result.unguardedTextAdditions, { surface: "", reason: "empty_registry_surface" });
          return;
        }
        result.coveredSurfaces.push(surface);
        const guards = Array.isArray(row && row.guards) ? row.guards : [];
        const guardedByStep8 = guards.some((guard) => [
          "Game.__DEV.smokeFakeToneFiltersOnce",
          "Game.__DEV.smokeFakeToneSampleAuditOnce",
          "Game.__DEV.smokeStopFakeLexiconOnce",
        ].includes(String(guard)));
        if (!guardedByStep8) {
          addUnique(result.unguardedTextAdditions, { surface, reason: "missing_step8_guard", guards });
        }
        if (!seenSurfaces.has(surface)) addUnique(result.missingCoverage, surface);
      });
      if (currentSurfaces.length !== result.coveredSurfaces.length) fail("surface_registry_mismatch", { currentSurfaces, coveredSurfaces: result.coveredSurfaces.slice() });
      if (result.uncoveredFutureTextSurfaces.length) fail("future_text_surface_not_registered", result.uncoveredFutureTextSurfaces.slice());
      if (result.unguardedTextAdditions.length) fail("unguarded_text_additions_present", result.unguardedTextAdditions.slice());
      if (result.missingCoverage.length) fail("missing_coverage", result.missingCoverage.slice());
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== FUTURE_TEXT_ANTI_FAKE_GATE_SMOKE_VERSION || result.smokeVersion.indexOf("step8_6") === -1 || result.smokeVersion.indexOf(result.commit) === -1) {
        fail("smoke_version_unique_for_commit", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.uncoveredFutureTextSurfaces.length === 0
      && result.unguardedTextAdditions.length === 0
      && result.missingCoverage.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_ACCEPTANCE_BUILD_TAG = "build_2026_06_12_step8_7_z_profile_acceptance_smoke";
  const Z_PROFILE_ACCEPTANCE_COMMIT = "step8_7_z_profile_acceptance_smoke";
  const Z_PROFILE_ACCEPTANCE_SMOKE_VERSION = "step8_7_z_profile_acceptance_smoke_v20260612_001";

  Game.__DEV.smokeZProfileAcceptanceOnce = function smokeZProfileAcceptanceOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_ACCEPTANCE_BUILD_TAG,
      commit: Z_PROFILE_ACCEPTANCE_COMMIT,
      smokeVersion: Z_PROFILE_ACCEPTANCE_SMOKE_VERSION,
      completedSteps: [],
      checkedCount: 0,
      artificialYouthTone: [],
      eyeRollFailures: [],
      memeLanguage: [],
      forcedSlang: [],
      exaggeratedCoolness: [],
      unnaturalDialogue: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => fakeToneCoverageAddUnique(list, value);
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const mergeStep = (stepName, subResult) => {
      addUnique(result.completedSteps, stepName);
      const checkedCount = Number.isFinite(subResult && subResult.checkedCount) ? (subResult.checkedCount | 0)
        : Number.isFinite(subResult && subResult.sampleCount) ? (subResult.sampleCount | 0)
        : Number.isFinite(subResult && subResult.checkedZones && subResult.checkedZones.length) ? (subResult.checkedZones.length | 0)
        : Number.isFinite(subResult && subResult.registeredSurfaces && subResult.registeredSurfaces.length) ? (subResult.registeredSurfaces.length | 0)
        : 0;
      result.checkedCount += checkedCount;
      return checkedCount;
    };
    const mergeArrays = (target, source) => {
      (Array.isArray(source) ? source : []).forEach((item) => addUnique(target, item));
    };
    const runStep = (stepName, fn) => {
      let subResult = null;
      try {
        subResult = typeof fn === "function" ? fn() : null;
      } catch (err) {
        subResult = { ok: false, failures: [{ check: "smoke_exception", detail: err && err.message ? String(err.message) : String(err) }], failedChecks: ["smoke_exception"] };
      }
      if (!subResult) {
        fail("step_missing", stepName);
        return null;
      }
      mergeStep(stepName, subResult);
      mergeArrays(result.artificialYouthTone, subResult.artificialYouthTone);
      mergeArrays(result.artificialYouthTone, subResult.tryingToSoundYoungHits);
      mergeArrays(result.eyeRollFailures, subResult.eyeRollFailures);
      mergeArrays(result.eyeRollFailures, subResult.eyeRollHits);
      mergeArrays(result.memeLanguage, subResult.memeLanguage);
      mergeArrays(result.memeLanguage, subResult.memeHits);
      mergeArrays(result.forcedSlang, subResult.forcedSlang);
      mergeArrays(result.forcedSlang, subResult.teenSlangHits);
      mergeArrays(result.exaggeratedCoolness, subResult.exaggeratedCoolness);
      mergeArrays(result.unnaturalDialogue, subResult.unnaturalDialogue);
      mergeArrays(result.failures, subResult.failures);
      mergeArrays(result.forbiddenRemaining, subResult.forbiddenRemaining);
      mergeArrays(result.missingCoverage, subResult.missingCoverage);
      mergeArrays(result.failedChecks, subResult.failedChecks);
      if (subResult.ok !== true) addUnique(result.failures, { check: `${stepName}_not_ok`, detail: subResult });
      return subResult;
    };
    try {
      const step81 = runStep("8.1", Game.__DEV.smokeFakeToneZonesOnce);
      const step82 = runStep("8.2", Game.__DEV.smokeFakeToneFiltersOnce);
      const step83 = runStep("8.3", Game.__DEV.smokeStopFakeLexiconOnce);
      const step84 = runStep("8.4", Game.__DEV.smokeNeutralReplacementAuditOnce);
      const step85 = runStep("8.5", Game.__DEV.smokeFakeToneSampleAuditOnce);
      const step86 = runStep("8.6", Game.__DEV.smokeFutureTextAntiFakeGateOnce);
      if (!step81) fail("step_8_1_missing", null);
      if (!step82) fail("step_8_2_missing", null);
      if (!step83) fail("step_8_3_missing", null);
      if (!step84) fail("step_8_4_missing", null);
      if (!step85) fail("step_8_5_missing", null);
      if (!step86) fail("step_8_6_missing", null);
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_ACCEPTANCE_SMOKE_VERSION || result.smokeVersion.indexOf("step8_7") === -1 || result.smokeVersion.indexOf(result.commit) === -1) {
        fail("smoke_version_unique_for_commit", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    const countsOk = result.completedSteps.length === 6;
    result.ok = countsOk
      && result.checkedCount > 0
      && result.completedSteps.indexOf("8.1") !== -1
      && result.completedSteps.indexOf("8.2") !== -1
      && result.completedSteps.indexOf("8.3") !== -1
      && result.completedSteps.indexOf("8.4") !== -1
      && result.completedSteps.indexOf("8.5") !== -1
      && result.completedSteps.indexOf("8.6") !== -1
      && result.artificialYouthTone.length === 0
      && result.eyeRollFailures.length === 0
      && result.memeLanguage.length === 0
      && result.forcedSlang.length === 0
      && result.exaggeratedCoolness.length === 0
      && result.unnaturalDialogue.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_SPEED_AUDIT_BUILD_TAG = "build_2026_06_12_step8_11_z_profile_simplicity_audit";
  const Z_PROFILE_SPEED_AUDIT_COMMIT = "step8_11_z_profile_simplicity_audit";
  const Z_PROFILE_SPEED_AUDIT_SMOKE_VERSION = "step8_10_z_profile_speed_audit_v20260612_004";

  Game.__DEV.smokeZProfileSpeedAuditOnce = function smokeZProfileSpeedAuditOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_SPEED_AUDIT_BUILD_TAG,
      commit: Z_PROFILE_SPEED_AUDIT_COMMIT,
      smokeVersion: Z_PROFILE_SPEED_AUDIT_SMOKE_VERSION,
      auditedCategories: [],
      auditedRowCount: 0,
      averageShortening: 0,
      categoryAverages: { ui: 0, npc: 0, system: 0 },
      meaningCoverageCount: 0,
      orphanAuditRows: [],
      newLogicKeyHits: [],
      newConditionHits: [],
      newEntityHits: [],
      newHandlerHits: [],
      newEconomyRuleHits: [],
      newBattleRuleHits: [],
      stateMutationHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const key = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === key)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const normalize = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), root);
    const currentText = (source) => {
      const normalized = String(source || "");
      if (!normalized) return undefined;
      if (normalized.indexOf("dom#") === 0 && typeof document !== "undefined") {
        const node = document.getElementById(normalized.slice(4));
        return node ? node.textContent : undefined;
      }
      if (normalized.indexOf("NPC.") === 0) return getPath({ NPC: Game.NPC || {} }, normalized);
      return getPath(Game, normalized);
    };
    const auditedRows = Object.freeze([
      Object.freeze({ id: "ui_tie_click_name_hint", category: "ui", source: "Data.TEXTS.genz.tie_click_name_hint", before: "Кликни на имя, за кого хочешь вписаться.", after: "Имя в списке — сторона.", meaning: "CTA still tells the player to pick a name for the crowd choice." }),
      Object.freeze({ id: "ui_events_empty", category: "ui", source: "Data.TEXTS.genz.events_empty", before: "Ничего не происходит, сплошная болтовня.", after: "Открой события.", meaning: "Empty-events guidance still points the player to the events panel." }),
      Object.freeze({ id: "ui_invite_open_hint", category: "ui", source: "Data.TEXTS.genz.invite_open_hint", before: "Введи ник игрока. Без ошибок, иначе не сработает.", after: "Введи точный ник.", meaning: "Invite hint still requires the exact player nickname." }),
      Object.freeze({ id: "ui_report_hint", category: "ui", source: "dom#reportHint", before: "Сообщить о токсике, бандите или мафиози.", after: "Сдай токсика, бандита или мафиози.", meaning: "Report hint keeps the same cop-report target guidance on the current canonical DM surface." }),
      Object.freeze({ id: "npc_report_accept", category: "npc", source: "Data.TEXTS.genz.cop_report_accept.0", before: "Я тебя понял. Проверяю информацию.", after: "Понял. Проверяю.", meaning: "Cop acceptance still confirms the report is understood and under review." }),
      Object.freeze({ id: "npc_report_ok", category: "npc", source: "Data.TEXTS.genz.cop_report_ok.0", before: "Проверка сошлась. Я вмешался.", after: "Проверка сошлась. Вмешался.", meaning: "Cop resolution still says the check matched and the cop intervened." }),
      Object.freeze({ id: "npc_cooldown", category: "npc", source: "Data.TEXTS.genz.cop_cooldown.0", before: "Дайте мне время, я ещё занят предыдущим делом.", after: "Проверка займет время.", meaning: "Cooldown line still says the cop needs time because the report check is still in progress." }),
      Object.freeze({ id: "npc_bandit_advice", category: "npc", source: "NPC.COP.topics.bandit.advice", before: "Лучшее решение - Свалить или не ввязываться. Если вступили в бой, главное - не проиграть.", after: "Свалить закрывает контакт. Проигрыш бьет по 💰.", meaning: "Advice still says escape ends the contact and defeat carries a money risk." }),
      Object.freeze({ id: "system_report_reward", category: "system", source: "SystemCopy.notifications.reportTrueReward", before: "Засчитано. Сдать {name}: +2💰.", after: "Сдать {name}: +2💰.", meaning: "System reward still names the same report action, placeholder, and +2 reward." }),
      Object.freeze({ id: "system_report_penalty", category: "system", source: "SystemCopy.errors.reportFalsePenalty", before: "Не получилось. Штраф: -5 💰.", after: "Штраф: -5 💰.", meaning: "System penalty still shows the same false-report penalty." }),
      Object.freeze({ id: "system_battle_challenge", category: "system", source: "SystemCopy.systemEvents.battleChallenge", before: "{attackerName} [{attackerInf}] вызвал(а) тебя на баттл. Открой баттл сверху.", after: "{attackerName} [{attackerInf}] бросил вызов.", meaning: "Battle challenge still names the challenger and preserves the challenge outcome in the current canonical system line." }),
      Object.freeze({ id: "system_crowd_resolved", category: "system", source: "SystemCopy.systemEvents.crowdResolved", before: "Голосование толпы завершено. Победил(а) {name}: {aVotes}:{bVotes}.", after: "Толпа: {name} {aVotes}:{bVotes}.", meaning: "Crowd resolution still reports the same winner and unchanged vote counts in the current canonical system line." }),
    ]);
    const requiredCategories = ["ui", "npc", "system"];
    const bucketRatios = { ui: [], npc: [], system: [] };
    const seenIds = new Set();
    const seenSources = new Set();
    const placeholderRe = /\{[^}]+\}/g;
    const economyRe = /[+-]?\d+\s*💰|\{[A-Za-z]+Cost\}|\{cost\}|\{X\}|\{aVotes\}|\{bVotes\}/g;
    const auditText = auditedRows.map((row) => `${row.id} ${row.category} ${row.source} ${row.before} ${row.after} ${row.meaning}`).join("\n");
    const forbiddenChecks = [
      { key: "newLogicKeyHits", re: /\bnew\s+logic\s+keys?\b/i, check: "no_new_logic_keys" },
      { key: "newConditionHits", re: /\bnew\s+conditions?\b/i, check: "no_new_conditions" },
      { key: "newEntityHits", re: /\bnew\s+entities?\b/i, check: "no_new_entities" },
      { key: "newHandlerHits", re: /\bnew\s+handlers?\b/i, check: "no_new_handlers" },
      { key: "newEconomyRuleHits", re: /\bnew\s+economy\s+rules?\b/i, check: "no_new_economy_rules" },
      { key: "newBattleRuleHits", re: /\bnew\s+battle\s+rules?\b/i, check: "no_new_battle_rules" },
      { key: "stateMutationHits", re: /\bstate\s+mutations?\b/i, check: "no_state_mutations" },
    ];
    try {
      auditedRows.forEach((row) => {
        result.auditedRowCount += 1;
        addUnique(result.auditedCategories, row.category);
        if (!requiredCategories.includes(row.category)) {
          addUnique(result.orphanAuditRows, { id: row.id, reason: "unknown_category" });
        }
        if (seenIds.has(row.id)) {
          addUnique(result.orphanAuditRows, { id: row.id, reason: "duplicate_id" });
        }
        seenIds.add(row.id);
        if (seenSources.has(row.source)) {
          addUnique(result.orphanAuditRows, { source: row.source, reason: "duplicate_source" });
        }
        seenSources.add(row.source);
        if (!row.meaning || normalize(row.meaning).length < 24) {
          fail("meaning_preservation_coverage", { id: row.id, meaning: row.meaning || "" });
        } else {
          result.meaningCoverageCount += 1;
        }
        const current = normalize(currentText(row.source));
        const before = normalize(row.before);
        const after = normalize(row.after);
        if (!current) {
          addUnique(result.orphanAuditRows, { id: row.id, source: row.source, reason: "source_unresolved" });
          fail("no_orphan_audit_rows", { id: row.id, source: row.source });
          return;
        }
        if (current !== after) fail("mapping_current_text_mismatch", { source: row.source, expected: after, actual: current });
        if (!(after.length < before.length)) fail("text_not_shorter_than_millennial", { id: row.id, before, after });
        const ratio = before.length > 0 ? (before.length - after.length) / before.length : 0;
        bucketRatios[row.category].push(ratio);
        const placeholdersBefore = before.match(placeholderRe) || [];
        const placeholdersAfter = after.match(placeholderRe) || [];
        placeholdersBefore.forEach((token) => {
          if (!placeholdersAfter.includes(token)) fail("placeholder_lost", { source: row.source, token });
        });
        const economyBefore = before.match(economyRe) || [];
        const economyAfter = after.match(economyRe) || [];
        economyBefore.forEach((token) => {
          if (!economyAfter.includes(token)) fail("economy_value_changed", { source: row.source, token });
        });
      });
      requiredCategories.forEach((category) => {
        if (!result.auditedCategories.includes(category)) addUnique(result.missingCoverage, category);
        const ratios = bucketRatios[category];
        result.categoryAverages[category] = ratios.length ? Number((ratios.reduce((sum, value) => sum + value, 0) / ratios.length).toFixed(3)) : 0;
      });
      const allRatios = requiredCategories.flatMap((category) => bucketRatios[category]);
      result.averageShortening = allRatios.length ? Number((allRatios.reduce((sum, value) => sum + value, 0) / allRatios.length).toFixed(3)) : 0;
      if (result.averageShortening < 0.30) fail("average_shortening_30_percent_or_better", result.averageShortening);
      if (result.meaningCoverageCount !== result.auditedRowCount) fail("meaning_preservation_coverage", { covered: result.meaningCoverageCount, audited: result.auditedRowCount });
      if (result.orphanAuditRows.length) fail("no_orphan_audit_rows", result.orphanAuditRows.slice());
      forbiddenChecks.forEach(({ key, re, check }) => {
        const matches = auditText.match(re);
        if (matches && matches.length) {
          result[key] = matches.slice(0, 12);
          addUnique(result.forbiddenRemaining, check);
          fail(check, matches.slice(0, 12));
        }
      });
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_SPEED_AUDIT_SMOKE_VERSION || !/^step8_10_z_profile_speed_audit_v\d{8}_\d{3}$/.test(result.smokeVersion)) {
        fail("smoke_version_unique", result.smokeVersion);
      }
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.auditedCategories.length === requiredCategories.length
      && result.auditedRowCount > 0
      && result.averageShortening >= 0.30
      && result.meaningCoverageCount === result.auditedRowCount
      && result.orphanAuditRows.length === 0
      && result.newLogicKeyHits.length === 0
      && result.newConditionHits.length === 0
      && result.newEntityHits.length === 0
      && result.newHandlerHits.length === 0
      && result.newEconomyRuleHits.length === 0
      && result.newBattleRuleHits.length === 0
      && result.stateMutationHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_SIMPLICITY_AUDIT_BUILD_TAG = "build_2026_06_12_step8_11_z_profile_simplicity_audit";
  const Z_PROFILE_SIMPLICITY_AUDIT_COMMIT = "step8_11_z_profile_simplicity_audit";
  const Z_PROFILE_SIMPLICITY_AUDIT_SMOKE_VERSION = "step8_11_z_profile_simplicity_audit_v20260612_001";

  Game.__DEV.smokeZProfileSimplicityAuditOnce = function smokeZProfileSimplicityAuditOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_SIMPLICITY_AUDIT_BUILD_TAG,
      commit: Z_PROFILE_SIMPLICITY_AUDIT_COMMIT,
      smokeVersion: Z_PROFILE_SIMPLICITY_AUDIT_SMOKE_VERSION,
      auditedCategories: [],
      checkedCount: 0,
      unnecessaryExplanationHits: [],
      multiStepPhrasingHits: [],
      teacherToneHits: [],
      corporateWordingHits: [],
      overcomplicatedStructureHits: [],
      smartSoundingHits: [],
      orphanAuditRows: [],
      newLogicKeyHits: [],
      newConditionHits: [],
      newEntityHits: [],
      newHandlerHits: [],
      newEconomyRuleHits: [],
      newBattleRuleHits: [],
      stateMutationHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const key = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === key)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const normalize = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), root);
    const currentText = (source) => {
      const normalized = String(source || "");
      if (!normalized) return undefined;
      if (normalized.indexOf("dom#") === 0 && typeof document !== "undefined") {
        const node = document.getElementById(normalized.slice(4));
        return node ? node.textContent : undefined;
      }
      if (normalized.indexOf("NPC.") === 0) return getPath({ NPC: Game.NPC || {} }, normalized);
      return getPath(Game, normalized);
    };
    const auditedRows = Object.freeze([
      Object.freeze({ id: "ui_tie_click_name_hint", category: "ui", source: "Data.TEXTS.genz.tie_click_name_hint", expected: "Имя в списке — сторона." }),
      Object.freeze({ id: "ui_events_empty", category: "ui", source: "Data.TEXTS.genz.events_empty", expected: "Открой события." }),
      Object.freeze({ id: "ui_invite_open_hint", category: "ui", source: "Data.TEXTS.genz.invite_open_hint", expected: "Введи точный ник." }),
      Object.freeze({ id: "ui_report_hint", category: "ui", source: "dom#reportHint", expected: "Сдай токсика, бандита или мафиози." }),
      Object.freeze({ id: "npc_report_accept", category: "npc", source: "Data.TEXTS.genz.cop_report_accept.0", expected: "Понял. Проверяю." }),
      Object.freeze({ id: "npc_report_ok", category: "npc", source: "Data.TEXTS.genz.cop_report_ok.0", expected: "Проверка сошлась. Вмешался." }),
      Object.freeze({ id: "npc_cooldown", category: "npc", source: "Data.TEXTS.genz.cop_cooldown.0", expected: "Проверка займет время." }),
      Object.freeze({ id: "npc_bandit_advice", category: "npc", source: "NPC.COP.topics.bandit.advice", expected: "Свалить закрывает контакт. Проигрыш бьет по 💰." }),
      Object.freeze({ id: "system_report_reward", category: "system", source: "SystemCopy.notifications.reportTrueReward", expected: "Сдать {name}: +2💰." }),
      Object.freeze({ id: "system_report_penalty", category: "system", source: "SystemCopy.errors.reportFalsePenalty", expected: "Штраф: -5 💰." }),
      Object.freeze({ id: "system_battle_challenge", category: "system", source: "SystemCopy.systemEvents.battleChallenge", expected: "{attackerName} [{attackerInf}] бросил вызов." }),
      Object.freeze({ id: "system_crowd_resolved", category: "system", source: "SystemCopy.systemEvents.crowdResolved", expected: "Толпа: {name} {aVotes}:{bVotes}." }),
    ]);
    const requiredCategories = ["ui", "npc", "system"];
    const seenIds = new Set();
    const seenSources = new Set();
    const unnecessaryExplanationRe = /\b(?:потому что|так как|поэтому тебе|иначе|для того чтобы|это значит|то есть)\b/i;
    const multiStepPhrasingRe = /\b(?:сначала|сперва|потом|затем|после этого|для начала)\b/i;
    const teacherToneRe = /\b(?:давай разбер|запомни|урок|ты должен|следует|необходимо|главное|правильн(?:ый|ое|ая|о))\b/i;
    const corporateWordingRe = /\b(?:регламент|протокол|официально|служебн|в рамках|осуществ|предостав|данн(?:ый|ая|ое|ые)|соответств|явля(?:ется|ются)|имеет место)\b/i;
    const smartSoundingRe = /\b(?:необходимо|следует|осуществ|соответств|представляет собой|в рамках|таким образом|имеется)\b/i;
    const forbiddenChecks = [
      { key: "newLogicKeyHits", re: /\bnew\s+logic\s+keys?\b/i, check: "no_new_logic_keys" },
      { key: "newConditionHits", re: /\bnew\s+conditions?\b/i, check: "no_new_conditions" },
      { key: "newEntityHits", re: /\bnew\s+entities?\b/i, check: "no_new_entities" },
      { key: "newHandlerHits", re: /\bnew\s+handlers?\b/i, check: "no_new_handlers" },
      { key: "newEconomyRuleHits", re: /\bnew\s+economy\s+rules?\b/i, check: "no_new_economy_rules" },
      { key: "newBattleRuleHits", re: /\bnew\s+battle\s+rules?\b/i, check: "no_new_battle_rules" },
      { key: "stateMutationHits", re: /\bstate\s+mutations?\b/i, check: "no_state_mutations" },
    ];
    const auditText = auditedRows.map((row) => `${row.id} ${row.category} ${row.source} ${row.expected}`).join("\n");
    const pushHit = (bucketName, check, row, match) => {
      const hit = { id: row.id, source: row.source, text: row.expected, match: match ? String(match[0] || match) : null };
      addUnique(result[bucketName], hit);
      addUnique(result.forbiddenRemaining, check);
      fail(check, hit);
    };
    try {
      auditedRows.forEach((row) => {
        result.checkedCount += 1;
        addUnique(result.auditedCategories, row.category);
        if (!requiredCategories.includes(row.category)) addUnique(result.orphanAuditRows, { id: row.id, reason: "unknown_category" });
        if (seenIds.has(row.id)) addUnique(result.orphanAuditRows, { id: row.id, reason: "duplicate_id" });
        seenIds.add(row.id);
        if (seenSources.has(row.source)) addUnique(result.orphanAuditRows, { source: row.source, reason: "duplicate_source" });
        seenSources.add(row.source);
        const current = normalize(currentText(row.source));
        const expected = normalize(row.expected);
        if (!current) {
          addUnique(result.orphanAuditRows, { id: row.id, source: row.source, reason: "source_unresolved" });
          fail("no_orphan_audit_rows", { id: row.id, source: row.source });
          return;
        }
        if (current !== expected) fail("mapping_current_text_mismatch", { source: row.source, expected, actual: current });
        const unnecessaryMatch = current.match(unnecessaryExplanationRe);
        if (unnecessaryMatch) pushHit("unnecessaryExplanationHits", "no_unnecessary_explanations", row, unnecessaryMatch);
        const multiStepMatch = current.match(multiStepPhrasingRe);
        if (multiStepMatch) pushHit("multiStepPhrasingHits", "no_multi_step_phrasing", row, multiStepMatch);
        const teacherToneMatch = current.match(teacherToneRe);
        if (teacherToneMatch) pushHit("teacherToneHits", "no_teacher_or_mentor_tone", row, teacherToneMatch);
        const corporateMatch = current.match(corporateWordingRe);
        if (corporateMatch) pushHit("corporateWordingHits", "no_corporate_or_bureaucratic_wording", row, corporateMatch);
        const smartMatch = current.match(smartSoundingRe);
        if (smartMatch) pushHit("smartSoundingHits", "no_smart_sounding_wording", row, smartMatch);
        const sentenceCount = current.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
        const commaCount = (current.match(/,/g) || []).length;
        const dashCount = (current.match(/[—–-]/g) || []).length;
        if (sentenceCount > 2 || commaCount > 1 || dashCount > 1 || current.length > 64) {
          pushHit("overcomplicatedStructureHits", "no_overcomplicated_sentence_structures", row, `${sentenceCount}/${commaCount}/${dashCount}/${current.length}`);
        }
      });
      requiredCategories.forEach((category) => {
        if (!result.auditedCategories.includes(category)) addUnique(result.missingCoverage, category);
      });
      if (result.orphanAuditRows.length) fail("no_orphan_audit_rows", result.orphanAuditRows.slice());
      forbiddenChecks.forEach(({ key, re, check }) => {
        const matches = auditText.match(re);
        if (matches && matches.length) {
          result[key] = matches.slice(0, 12);
          addUnique(result.forbiddenRemaining, check);
          fail(check, matches.slice(0, 12));
        }
      });
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_SIMPLICITY_AUDIT_SMOKE_VERSION || !/^step8_11_z_profile_simplicity_audit_v\d{8}_\d{3}$/.test(result.smokeVersion)) {
        fail("smoke_version_unique", result.smokeVersion);
      }
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.auditedCategories.length === requiredCategories.length
      && result.checkedCount > 0
      && result.unnecessaryExplanationHits.length === 0
      && result.multiStepPhrasingHits.length === 0
      && result.teacherToneHits.length === 0
      && result.corporateWordingHits.length === 0
      && result.overcomplicatedStructureHits.length === 0
      && result.smartSoundingHits.length === 0
      && result.orphanAuditRows.length === 0
      && result.newLogicKeyHits.length === 0
      && result.newConditionHits.length === 0
      && result.newEntityHits.length === 0
      && result.newHandlerHits.length === 0
      && result.newEconomyRuleHits.length === 0
      && result.newBattleRuleHits.length === 0
      && result.stateMutationHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_AUTHENTICITY_AUDIT_BUILD_TAG = "build_2026_06_12_step5_z_profile_authenticity_audit";
  const Z_PROFILE_AUTHENTICITY_AUDIT_COMMIT = "step5_z_profile_authenticity_audit";
  const Z_PROFILE_AUTHENTICITY_AUDIT_SMOKE_VERSION = "step5_z_profile_authenticity_audit_v20260612_001";

  Game.__DEV.smokeZProfileAuthenticityAuditOnce = function smokeZProfileAuthenticityAuditOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_AUTHENTICITY_AUDIT_BUILD_TAG,
      commit: Z_PROFILE_AUTHENTICITY_AUDIT_COMMIT,
      smokeVersion: Z_PROFILE_AUTHENTICITY_AUDIT_SMOKE_VERSION,
      auditedCategories: [],
      checkedCount: 0,
      memeLanguageHits: [],
      forcedSlangHits: [],
      exaggeratedCoolnessHits: [],
      artificialYouthToneHits: [],
      ironyForIronyHits: [],
      eyeRollPhrasingHits: [],
      cringeWordingHits: [],
      generationStereotypeHits: [],
      fellowKidsHits: [],
      orphanAuditRows: [],
      newLogicKeyHits: [],
      newConditionHits: [],
      newEntityHits: [],
      newHandlerHits: [],
      newEconomyRuleHits: [],
      newBattleRuleHits: [],
      stateMutationHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => {
      const key = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === key)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const normalize = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), root);
    const currentText = (source) => {
      const normalized = String(source || "");
      if (!normalized) return undefined;
      if (normalized.indexOf("dom#") === 0 && typeof document !== "undefined") {
        const node = document.getElementById(normalized.slice(4));
        return node ? node.textContent : undefined;
      }
      if (normalized.indexOf("NPC.") === 0) return getPath({ NPC: Game.NPC || {} }, normalized);
      return getPath(Game, normalized);
    };
    const auditedRows = Object.freeze([
      Object.freeze({ id: "ui_tie_click_name_hint", category: "ui", source: "Data.TEXTS.genz.tie_click_name_hint", expected: "Имя в списке — сторона." }),
      Object.freeze({ id: "ui_events_empty", category: "ui", source: "Data.TEXTS.genz.events_empty", expected: "Открой события." }),
      Object.freeze({ id: "ui_invite_open_hint", category: "ui", source: "Data.TEXTS.genz.invite_open_hint", expected: "Введи точный ник." }),
      Object.freeze({ id: "ui_report_hint", category: "ui", source: "dom#reportHint", expected: "Сдай токсика, бандита или мафиози." }),
      Object.freeze({ id: "npc_report_accept", category: "npc", source: "Data.TEXTS.genz.cop_report_accept.0", expected: "Понял. Проверяю." }),
      Object.freeze({ id: "npc_report_ok", category: "npc", source: "Data.TEXTS.genz.cop_report_ok.0", expected: "Проверка сошлась. Вмешался." }),
      Object.freeze({ id: "npc_cooldown", category: "npc", source: "Data.TEXTS.genz.cop_cooldown.0", expected: "Проверка займет время." }),
      Object.freeze({ id: "npc_bandit_advice", category: "npc", source: "NPC.COP.topics.bandit.advice", expected: "Свалить закрывает контакт. Проигрыш бьет по 💰." }),
      Object.freeze({ id: "system_report_reward", category: "system", source: "SystemCopy.notifications.reportTrueReward", expected: "Сдать {name}: +2💰." }),
      Object.freeze({ id: "system_report_penalty", category: "system", source: "SystemCopy.errors.reportFalsePenalty", expected: "Штраф: -5 💰." }),
      Object.freeze({ id: "system_battle_challenge", category: "system", source: "SystemCopy.systemEvents.battleChallenge", expected: "{attackerName} [{attackerInf}] бросил вызов." }),
      Object.freeze({ id: "system_crowd_resolved", category: "system", source: "SystemCopy.systemEvents.crowdResolved", expected: "Толпа: {name} {aVotes}:{bVotes}." }),
    ]);
    const requiredCategories = ["ui", "npc", "system"];
    const seenIds = new Set();
    const seenSources = new Set();
    const memeLanguageRe = /\b(?:мем|rofl|лол|кек|орально|орнул|жиза|имба|краш|чилл)\b/i;
    const forcedSlangRe = /\b(?:изи|вайб|вайбовый|рил|рилс|жесть|хайп|скип|кринжово|угар)\b/i;
    const exaggeratedCoolnessRe = /\b(?:ультра|суперзаряж|максимально мощ|легендарн|топчик|самый сок)\b/i;
    const artificialYouthToneRe = /\b(?:по кайфу|на расслабоне|чисто|типа того|движ|движуха|по фасту)\b/i;
    const ironyForIronyRe = /\b(?:ну конечно|ага конечно|как будто|спасибо, очень помогло|irony)\b/i;
    const eyeRollPhrasingRe = /\b(?:ну да|ой всё|серьезно что ли|капец|мда)\b/i;
    const cringeWordingRe = /\b(?:кринж|кринжу|зашквар|токсик в душе|сигма|альфа)\b/i;
    const generationStereotypeRe = /\b(?:зумер|бумер|миллениал|поколени[ея]|gen z|gen-z)\b/i;
    const fellowKidsRe = /\b(?:йоу|yo\b|бро|братиш|fellow kids|молодежь|ребзя)\b/i;
    const forbiddenChecks = [
      { key: "newLogicKeyHits", re: /\bnew\s+logic\s+keys?\b/i, check: "no_new_logic_keys" },
      { key: "newConditionHits", re: /\bnew\s+conditions?\b/i, check: "no_new_conditions" },
      { key: "newEntityHits", re: /\bnew\s+entities?\b/i, check: "no_new_entities" },
      { key: "newHandlerHits", re: /\bnew\s+handlers?\b/i, check: "no_new_handlers" },
      { key: "newEconomyRuleHits", re: /\bnew\s+economy\s+rules?\b/i, check: "no_new_economy_rules" },
      { key: "newBattleRuleHits", re: /\bnew\s+battle\s+rules?\b/i, check: "no_new_battle_rules" },
      { key: "stateMutationHits", re: /\bstate\s+mutations?\b/i, check: "no_state_mutations" },
    ];
    const auditText = auditedRows.map((row) => `${row.id} ${row.category} ${row.source} ${row.expected}`).join("\n");
    const pushHit = (bucketName, check, row, match) => {
      const hit = { id: row.id, source: row.source, text: row.expected, match: match ? String(match[0] || match) : null };
      addUnique(result[bucketName], hit);
      addUnique(result.forbiddenRemaining, check);
      fail(check, hit);
    };
    try {
      auditedRows.forEach((row) => {
        result.checkedCount += 1;
        addUnique(result.auditedCategories, row.category);
        if (!requiredCategories.includes(row.category)) addUnique(result.orphanAuditRows, { id: row.id, reason: "unknown_category" });
        if (seenIds.has(row.id)) addUnique(result.orphanAuditRows, { id: row.id, reason: "duplicate_id" });
        seenIds.add(row.id);
        if (seenSources.has(row.source)) addUnique(result.orphanAuditRows, { source: row.source, reason: "duplicate_source" });
        seenSources.add(row.source);
        const current = normalize(currentText(row.source));
        const expected = normalize(row.expected);
        if (!current) {
          addUnique(result.orphanAuditRows, { id: row.id, source: row.source, reason: "source_unresolved" });
          fail("no_orphan_audit_rows", { id: row.id, source: row.source });
          return;
        }
        if (current !== expected) fail("mapping_current_text_mismatch", { source: row.source, expected, actual: current });
        const checks = [
          ["memeLanguageHits", "no_meme_language", memeLanguageRe],
          ["forcedSlangHits", "no_forced_slang", forcedSlangRe],
          ["exaggeratedCoolnessHits", "no_exaggerated_coolness", exaggeratedCoolnessRe],
          ["artificialYouthToneHits", "no_artificial_youth_tone", artificialYouthToneRe],
          ["ironyForIronyHits", "no_irony_for_irony", ironyForIronyRe],
          ["eyeRollPhrasingHits", "no_eye_roll_phrasing", eyeRollPhrasingRe],
          ["cringeWordingHits", "no_cringe_wording", cringeWordingRe],
          ["generationStereotypeHits", "no_generation_stereotypes", generationStereotypeRe],
          ["fellowKidsHits", "no_roleplay_style_fellow_kids_language", fellowKidsRe],
        ];
        checks.forEach(([bucketName, check, re]) => {
          const match = current.match(re);
          if (match) pushHit(bucketName, check, row, match);
        });
      });
      requiredCategories.forEach((category) => {
        if (!result.auditedCategories.includes(category)) addUnique(result.missingCoverage, category);
      });
      if (result.orphanAuditRows.length) fail("no_orphan_audit_rows", result.orphanAuditRows.slice());
      forbiddenChecks.forEach(({ key, re, check }) => {
        const matches = auditText.match(re);
        if (matches && matches.length) {
          result[key] = matches.slice(0, 12);
          addUnique(result.forbiddenRemaining, check);
          fail(check, matches.slice(0, 12));
        }
      });
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_AUTHENTICITY_AUDIT_SMOKE_VERSION || !/^step5_z_profile_authenticity_audit_v\d{8}_\d{3}$/.test(result.smokeVersion)) {
        fail("smoke_version_unique", result.smokeVersion);
      }
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.auditedCategories.length === requiredCategories.length
      && result.checkedCount > 0
      && result.memeLanguageHits.length === 0
      && result.forcedSlangHits.length === 0
      && result.exaggeratedCoolnessHits.length === 0
      && result.artificialYouthToneHits.length === 0
      && result.ironyForIronyHits.length === 0
      && result.eyeRollPhrasingHits.length === 0
      && result.cringeWordingHits.length === 0
      && result.generationStereotypeHits.length === 0
      && result.fellowKidsHits.length === 0
      && result.orphanAuditRows.length === 0
      && result.newLogicKeyHits.length === 0
      && result.newConditionHits.length === 0
      && result.newEntityHits.length === 0
      && result.newHandlerHits.length === 0
      && result.newEconomyRuleHits.length === 0
      && result.newBattleRuleHits.length === 0
      && result.stateMutationHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_NEW_FEATURES_AUDIT_BUILD_TAG = "build_2026_06_12_step6b_z_profile_new_features_audit_dependency_fix";
  const Z_PROFILE_NEW_FEATURES_AUDIT_COMMIT = "step6b_z_profile_new_features_audit_dependency_fix";
  const Z_PROFILE_NEW_FEATURES_AUDIT_SMOKE_VERSION = "step6_z_profile_new_features_audit_v20260612_002";

  Game.__DEV.smokeZProfileNewFeaturesAuditOnce = function smokeZProfileNewFeaturesAuditOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_NEW_FEATURES_AUDIT_BUILD_TAG,
      commit: Z_PROFILE_NEW_FEATURES_AUDIT_COMMIT,
      smokeVersion: Z_PROFILE_NEW_FEATURES_AUDIT_SMOKE_VERSION,
      checkedSurfaces: [],
      checkedCount: 0,
      auditedRowCount: 0,
      orphanAuditRows: [],
      millennialFallbackHits: [],
      speedViolations: [],
      simplicityViolations: [],
      authenticityViolations: [],
      derivationViolations: [],
      newLogicKeyHits: [],
      newConditionHits: [],
      newEntityHits: [],
      newHandlerHits: [],
      newEconomyRuleHits: [],
      newBattleRuleHits: [],
      stateMutationHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => fakeToneCoverageAddUnique(list, value);
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const normalize = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), root);
    const currentText = (source) => {
      const normalizedSource = String(source || "");
      if (!normalizedSource) return undefined;
      if (normalizedSource.indexOf("dom#") === 0 && typeof document !== "undefined") {
        const node = document.getElementById(normalizedSource.slice(4));
        return node ? node.textContent : undefined;
      }
      if (normalizedSource.indexOf("NPC.") === 0) return getPath({ NPC: Game.NPC || {} }, normalizedSource);
      return getPath(Game, normalizedSource);
    };
    const auditedRows = Object.freeze([
      Object.freeze({ id: "start_title", surface: "startScreen", source: "Data.START_SCREEN.title", expected: "AsyncScene" }),
      Object.freeze({ id: "start_intro_pick", surface: "startScreen", source: "Data.START_SCREEN.introLines.0", expected: "Оппонент задаёт риск." }),
      Object.freeze({ id: "start_intro_stake", surface: "startScreen", source: "Data.START_SCREEN.introLines.1", expected: "Ставка списывает ресурс." }),
      Object.freeze({ id: "start_intro_result", surface: "startScreen", source: "Data.START_SCREEN.introLines.2", expected: "Итог виден сразу." }),
      Object.freeze({ id: "start_economy_honesty", surface: "startScreen", source: "Data.START_SCREEN.economyHonestyLine", expected: "Цена и итог сразу." }),
      Object.freeze({ id: "start_action_start", surface: "startScreen", source: "Data.START_SCREEN.actions.start", expected: "Старт" }),
      Object.freeze({ id: "start_action_rules", surface: "startScreen", source: "Data.START_SCREEN.actions.rules", expected: "Суть" }),
      Object.freeze({ id: "action_escape_needs_points", surface: "economyActionHonesty", source: "SystemCopy.warnings.escapeNeedsPoints", expected: "Не хватает 💰 на Свалить." }),
      Object.freeze({ id: "economy_report_reward", surface: "economyActionHonesty", source: "SystemCopy.notifications.reportTrueReward", expected: "Сдать {name}: +2💰." }),
      Object.freeze({ id: "economy_report_penalty", surface: "economyActionHonesty", source: "SystemCopy.errors.reportFalsePenalty", expected: "Штраф: -5 💰." }),
      Object.freeze({ id: "system_battle_challenge", surface: "systemMessages", source: "SystemCopy.systemEvents.battleChallenge", expected: "{attackerName} [{attackerInf}] бросил вызов." }),
      Object.freeze({ id: "system_crowd_resolved", surface: "systemMessages", source: "SystemCopy.systemEvents.crowdResolved", expected: "Толпа: {name} {aVotes}:{bVotes}." }),
      Object.freeze({ id: "npc_report_accept", surface: "npcSpeech", source: "Data.TEXTS.genz.cop_report_accept.0", expected: "Понял. Проверяю." }),
      Object.freeze({ id: "npc_report_ok", surface: "npcSpeech", source: "Data.TEXTS.genz.cop_report_ok.0", expected: "Проверка сошлась. Вмешался." }),
      Object.freeze({ id: "npc_cooldown", surface: "npcSpeech", source: "Data.TEXTS.genz.cop_cooldown.0", expected: "Проверка займет время." }),
      Object.freeze({ id: "npc_bandit_advice", surface: "npcSpeech", source: "NPC.COP.topics.bandit.advice", expected: "Свалить закрывает контакт. Проигрыш бьет по 💰." }),
    ]);
    const requiredSurfaces = ["startScreen", "economyActionHonesty", "systemMessages", "npcSpeech", "argumentWrappers"];
    const seenIds = new Set();
    const seenSources = new Set();
    const fallbackRe = /\b(?:миллениал|millennial|legacy|old wording|older wording|старый стиль)\b/i;
    const auditText = auditedRows.map((row) => `${row.id} ${row.surface} ${row.source} ${row.expected}`).join("\n");
    const mergeArray = (target, values) => {
      (Array.isArray(values) ? values : []).forEach((value) => addUnique(target, value));
    };
    const mergeForbiddenClassHits = (subResult) => {
      mergeArray(result.newLogicKeyHits, subResult && subResult.newLogicKeyHits);
      mergeArray(result.newConditionHits, subResult && subResult.newConditionHits);
      mergeArray(result.newEntityHits, subResult && subResult.newEntityHits);
      mergeArray(result.newHandlerHits, subResult && subResult.newHandlerHits);
      mergeArray(result.newEconomyRuleHits, subResult && subResult.newEconomyRuleHits);
      mergeArray(result.newBattleRuleHits, subResult && subResult.newBattleRuleHits);
      mergeArray(result.stateMutationHits, subResult && subResult.stateMutationHits);
    };
    const collectViolations = (target, subResult, extraKeys) => {
      mergeArray(target, subResult && subResult.failures);
      mergeArray(target, subResult && subResult.forbiddenRemaining);
      mergeArray(target, subResult && subResult.failedChecks);
      mergeArray(target, subResult && subResult.missingCoverage);
      (Array.isArray(extraKeys) ? extraKeys : []).forEach((key) => mergeArray(target, subResult && subResult[key]));
    };
    const runRequiredSmoke = (surface, name, fn, target, extraKeys) => {
      addUnique(result.checkedSurfaces, surface);
      let subResult = null;
      try {
        subResult = typeof fn === "function" ? fn() : null;
      } catch (err) {
        subResult = { ok: false, failures: [{ check: "smoke_exception", detail: err && err.message ? String(err.message) : String(err) }], failedChecks: ["smoke_exception"] };
      }
      result.checkedCount += 1;
      if (!subResult) {
        addUnique(result.missingCoverage, name);
        fail("required_smoke_missing", name);
        return null;
      }
      mergeForbiddenClassHits(subResult);
      mergeArray(result.orphanAuditRows, subResult && subResult.orphanAuditRows);
      collectViolations(target, subResult, extraKeys);
      if (subResult.ok !== true) fail("required_smoke_not_ok", { surface, smoke: name, detail: subResult });
      return subResult;
    };
    try {
      auditedRows.forEach((row) => {
        result.auditedRowCount += 1;
        addUnique(result.checkedSurfaces, row.surface);
        if (seenIds.has(row.id)) addUnique(result.orphanAuditRows, { id: row.id, reason: "duplicate_id" });
        seenIds.add(row.id);
        if (seenSources.has(row.source)) addUnique(result.orphanAuditRows, { source: row.source, reason: "duplicate_source" });
        seenSources.add(row.source);
        const current = normalize(currentText(row.source));
        const expected = normalize(row.expected);
        if (!current) {
          addUnique(result.orphanAuditRows, { id: row.id, source: row.source, reason: "source_unresolved" });
          fail("no_orphan_audit_rows", { id: row.id, source: row.source });
          return;
        }
        if (current !== expected) fail("mapping_current_text_mismatch", { source: row.source, expected, actual: current });
        if (fallbackRe.test(current)) {
          addUnique(result.millennialFallbackHits, { id: row.id, source: row.source, text: current });
          fail("no_millennial_wording_fallback", { id: row.id, source: row.source, text: current });
        }
      });
      runRequiredSmoke("economyActionHonesty", "Game.__DEV.smokeZoomerNewFeatureCopyOnce", Game.__DEV.smokeZoomerNewFeatureCopyOnce, result.simplicityViolations, []);
      runRequiredSmoke("systemMessages", "Game.__DEV.smokeSystemNewFeaturesCopyOnce", Game.__DEV.smokeSystemNewFeaturesCopyOnce, result.millennialFallbackHits, ["oldStyleFeatureMessages", "bypassPaths", "missingFeatureCoverage"]);
      runRequiredSmoke("npcSpeech", "Game.__DEV.smokeZoomerNpcCompatibilityOnce", Game.__DEV.smokeZoomerNpcCompatibilityOnce, result.millennialFallbackHits, ["legacyStyleHits", "bypassPaths", "futureRoleCoverageGaps", "uncategorizedSpeechSources"]);
      runRequiredSmoke("npcSpeech", "Game.__DEV.smokeZoomerNpcNoMentoringOnce", Game.__DEV.smokeZoomerNpcNoMentoringOnce, result.simplicityViolations, ["mentoringHits", "teacherToneHits", "moralizingHits", "hiddenMentoringHits"]);
      runRequiredSmoke("argumentWrappers", "Game.__DEV.smokeZoomerArgumentWrappersOnce", Game.__DEV.smokeZoomerArgumentWrappersOnce, result.simplicityViolations, ["semanticDrift", "simplicityViolations"]);
      runRequiredSmoke("argumentWrappers", "Game.__DEV.smokeZoomerArgumentAuthenticityOnce", Game.__DEV.smokeZoomerArgumentAuthenticityOnce, result.authenticityViolations, ["forcedSlang", "memeLanguage", "cringePhrasing", "exaggeratedCoolness", "roleplayTone", "artificialYouthTone", "generationStereotypes", "unnaturalDialogue", "eyeRollFailures"]);
      runRequiredSmoke("systemMessages", "Game.__DEV.smokeZProfileSpeedAuditOnce", Game.__DEV.smokeZProfileSpeedAuditOnce, result.speedViolations, ["orphanAuditRows"]);
      runRequiredSmoke("systemMessages", "Game.__DEV.smokeZProfileSimplicityAuditOnce", Game.__DEV.smokeZProfileSimplicityAuditOnce, result.simplicityViolations, ["orphanAuditRows", "unnecessaryExplanationHits", "multiStepPhrasingHits", "teacherToneHits", "corporateWordingHits", "overcomplicatedStructureHits", "smartSoundingHits"]);
      runRequiredSmoke("systemMessages", "Game.__DEV.smokeZProfileAuthenticityAuditOnce", Game.__DEV.smokeZProfileAuthenticityAuditOnce, result.authenticityViolations, ["orphanAuditRows", "memeLanguageHits", "forcedSlangHits", "exaggeratedCoolnessHits", "artificialYouthToneHits", "ironyForIronyHits", "eyeRollPhrasingHits", "cringeWordingHits", "generationStereotypeHits", "fellowKidsHits"]);
      runRequiredSmoke("systemMessages", "Game.__DEV.smokeZProfileDerivationMappingOnce", Game.__DEV.smokeZProfileDerivationMappingOnce, result.derivationViolations, ["orphanZLines"]);
      requiredSurfaces.forEach((surface) => {
        if (!result.checkedSurfaces.includes(surface)) addUnique(result.missingCoverage, surface);
      });
      if (result.orphanAuditRows.length) fail("no_orphan_audit_rows", result.orphanAuditRows.slice());
      if (result.millennialFallbackHits.length) fail("no_millennial_wording_fallback", result.millennialFallbackHits.slice());
      if (result.speedViolations.length) fail("no_speed_violations", result.speedViolations.slice(0, 12));
      if (result.simplicityViolations.length) fail("no_simplicity_violations", result.simplicityViolations.slice(0, 12));
      if (result.authenticityViolations.length) fail("no_authenticity_violations", result.authenticityViolations.slice(0, 12));
      if (result.derivationViolations.length) fail("no_derivation_violations", result.derivationViolations.slice(0, 12));
      [
        ["no_new_logic_keys", result.newLogicKeyHits],
        ["no_new_conditions", result.newConditionHits],
        ["no_new_entities", result.newEntityHits],
        ["no_new_handlers", result.newHandlerHits],
        ["no_new_economy_rules", result.newEconomyRuleHits],
        ["no_new_battle_rules", result.newBattleRuleHits],
        ["no_state_mutations", result.stateMutationHits],
      ].forEach(([check, hits]) => {
        if (Array.isArray(hits) && hits.length) fail(check, hits.slice(0, 12));
      });
      if (/\b(?:new logic|new conditions|new entities|new handlers|new economy rules|new battle rules|state mutations)\b/i.test(auditText)) {
        fail("audit_rows_must_be_text_only", auditText);
      }
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_NEW_FEATURES_AUDIT_SMOKE_VERSION || !/^step6_z_profile_new_features_audit_v\d{8}_\d{3}$/.test(result.smokeVersion)) {
        fail("smoke_version_unique", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.checkedSurfaces.length === requiredSurfaces.length
      && result.checkedCount >= 9
      && result.auditedRowCount === auditedRows.length
      && result.orphanAuditRows.length === 0
      && result.millennialFallbackHits.length === 0
      && result.speedViolations.length === 0
      && result.simplicityViolations.length === 0
      && result.authenticityViolations.length === 0
      && result.derivationViolations.length === 0
      && result.newLogicKeyHits.length === 0
      && result.newConditionHits.length === 0
      && result.newEntityHits.length === 0
      && result.newHandlerHits.length === 0
      && result.newEconomyRuleHits.length === 0
      && result.newBattleRuleHits.length === 0
      && result.stateMutationHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_FINAL_CONTRACT_BUILD_TAG = "build_2026_06_12_step8_8_z_profile_final_contract_smoke_version_checker_fix";
  const Z_PROFILE_FINAL_CONTRACT_COMMIT = "step8_8_z_profile_final_contract_smoke_version_checker_fix";
  const Z_PROFILE_FINAL_CONTRACT_SMOKE_VERSION = "step8_8_z_profile_final_contract_v20260612_005";
  const Z_PROFILE_FINAL_CONTRACT_PREVIOUS_SMOKE_VERSIONS = Object.freeze([
    "step8_8_z_profile_final_contract_v20260612_001",
    "step8_8_z_profile_final_contract_v20260612_002",
    "step8_8_z_profile_final_contract_v20260612_003",
    "step8_8_z_profile_final_contract_v20260612_004",
  ]);

  Game.__DEV.smokeZProfileFinalContractOnce = function smokeZProfileFinalContractOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_FINAL_CONTRACT_BUILD_TAG,
      commit: Z_PROFILE_FINAL_CONTRACT_COMMIT,
      smokeVersion: Z_PROFILE_FINAL_CONTRACT_SMOKE_VERSION,
      millennialSourcePath: null,
      zoomerProfilePath: null,
      millennialSourceExists: false,
      zoomerProfileExists: false,
      textOnlyViolations: [],
      newLogicKeyHits: [],
      newConditionHits: [],
      newEntityHits: [],
      newHandlerHits: [],
      newEconomyRuleHits: [],
      newBattleRuleHits: [],
      stateMutationHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => fakeToneCoverageAddUnique(list, value);
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const buildTag = result.buildTag;
    const commit = result.commit;
    const smokeVersion = result.smokeVersion;
    const normalize = (value) => String(value == null ? "" : value)
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\u00a0/g, " ")
      .trim();
    const fetchTextSync = (path) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          return { ok: true, text: xhr.responseText || "" };
        }
        return { ok: false, reason: `http_${xhr.status || 0}` };
      } catch (_) {
        return { ok: false, reason: "xhr_exception" };
      }
    };
    const resolveDocCandidates = (fileName) => {
      const candidates = [];
      const seen = new Set();
      const add = (value) => {
        if (!value || seen.has(value)) return;
        seen.add(value);
        candidates.push(value);
      };
      const baseUris = [];
      if (typeof document !== "undefined" && document.baseURI) baseUris.push(document.baseURI);
      if (typeof location !== "undefined" && location.origin) {
        baseUris.push(`${location.origin}/AsyncScene/`);
        baseUris.push(`${location.origin}/`);
        baseUris.push(`${location.origin}/__dev__/docs/`);
      }
      baseUris.forEach((baseUri) => {
        try {
          add(new URL(fileName, baseUri).href);
        } catch (_) {}
      });
      if (typeof location !== "undefined" && location.origin) {
        add(`${location.origin}/AsyncScene/${fileName}`);
        add(`${location.origin}/__dev__/docs/${fileName}`);
        add(`${location.origin}/docs/${fileName}`);
        add(`${location.origin}/${fileName}`);
      }
      add(`/AsyncScene/${fileName}`);
      add(`/__dev__/docs/${fileName}`);
      add(`/docs/${fileName}`);
      add(`/${fileName}`);
      return candidates;
    };
    const fetchTextFromCandidates = (fileName) => {
      let lastResult = null;
      for (const url of resolveDocCandidates(fileName)) {
        const res = fetchTextSync(url);
        const annotated = { ...res, path: url };
        if (res.ok) return annotated;
        lastResult = annotated;
      }
      return lastResult || { ok: false, reason: "unavailable", path: null };
    };
    try {
      const millennialRes = fetchTextFromCandidates("UI_PROFILE_MILLENNIAL.md");
      const zoomerRes = fetchTextFromCandidates("UI_PROFILE_ZOOMER_DIFF.md");
      result.millennialSourcePath = millennialRes.path || null;
      result.zoomerProfilePath = zoomerRes.path || null;
      result.millennialSourceExists = !!millennialRes.ok;
      result.zoomerProfileExists = !!zoomerRes.ok;
      if (!millennialRes.ok) fail("millennial_source_exists", { path: "UI_PROFILE_MILLENNIAL.md", reason: millennialRes.reason || "unavailable" });
      if (!zoomerRes.ok) fail("zoomer_profile_exists", { path: "UI_PROFILE_ZOOMER_DIFF.md", reason: zoomerRes.reason || "unavailable" });
      const millennialRaw = millennialRes.ok ? String(millennialRes.text || "") : "";
      const zoomerRaw = zoomerRes.ok ? String(zoomerRes.text || "") : "";
      const millennialText = normalize(millennialRaw);
      const zoomerText = normalize(zoomerRaw);
      const requiredPhrases = [
        "delta-only",
        "UI_PROFILE_MILLENNIAL",
        "existing millennial meaning",
        "zoomer delta",
        "No runtime strings are rewritten by this table.",
        "No gameplay, logic, category, or copy application changes.",
        "Это delta-only документ поверх `UI_PROFILE_MILLENNIAL`."
      ];
      if (!zoomerText.trim()) {
        addUnique(result.textOnlyViolations, "empty_doc");
        fail("zoomer_profile_exists", "empty_doc");
      }
      requiredPhrases.forEach((phrase) => {
        if (!zoomerText.includes(phrase)) {
          addUnique(result.textOnlyViolations, { missing: phrase });
          fail("text_only_contract", { missing: phrase });
        }
      });
      if (!/UI_PROFILE_MILLENNIAL/i.test(zoomerText)) {
        addUnique(result.textOnlyViolations, "missing_source_reference");
        fail("derived_from_millennial_source", "missing_source_reference");
      }
      if (!/millennial\s*->\s*zoomer/i.test(zoomerText)) {
        addUnique(result.textOnlyViolations, "missing_comparison_table");
        fail("derived_from_millennial_source", "missing_comparison_table");
      }
      if (zoomerText.indexOf("```") !== -1) {
        addUnique(result.textOnlyViolations, "contains_code_fence");
        fail("text_only_contract", "contains_code_fence");
      }
      if (/<script|function\s*\(|=>|const\s+[A-Za-z0-9_]+\s*=/.test(zoomerText)) {
        addUnique(result.textOnlyViolations, "contains_code_like_markup");
        fail("text_only_contract", "contains_code_like_markup");
      }
      const forbiddenChecks = [
        { key: "newLogicKeyHits", re: /\b(new\s+)?logic\s+keys?\b/i, check: "new_logic_keys" },
        { key: "newConditionHits", re: /\b(new\s+)?conditions?\b/i, check: "new_conditions" },
        { key: "newEntityHits", re: /\b(new\s+)?entities?\b/i, check: "new_entities" },
        { key: "newHandlerHits", re: /\b(new\s+)?handlers?\b/i, check: "new_handlers" },
        { key: "newEconomyRuleHits", re: /\b(new\s+)?economy\s+rules?\b/i, check: "new_economy_rules" },
        { key: "newBattleRuleHits", re: /\b(new\s+)?battle\s+rules?\b/i, check: "new_battle_rules" },
        { key: "stateMutationHits", re: /\bstate\s+mutations?\b/i, check: "state_mutations" }
      ];
      forbiddenChecks.forEach(({ key, re, check }) => {
        const matches = zoomerText.match(re);
        if (matches && matches.length) {
          result[key] = matches.slice(0, 12);
          addUnique(result.forbiddenRemaining, check);
          addUnique(result.textOnlyViolations, { check, matches: matches.slice(0, 12) });
          fail(check, matches.slice(0, 12));
        }
      });
      if (/new\s+(logic|condition|entity|handler|economy rule|battle rule)/i.test(zoomerText)) {
        addUnique(result.textOnlyViolations, "introduces_new_runtime_concepts");
        fail("text_only_contract", "introduces_new_runtime_concepts");
      }
      if (/state\s+mutation/i.test(zoomerText) && !/no\s+state\s+mutation/i.test(zoomerText)) {
        addUnique(result.textOnlyViolations, "mentions_state_mutations_as_new_work");
        fail("text_only_contract", "mentions_state_mutations_as_new_work");
      }
      if (!millennialText.includes("Профиль ориентирован")) {
        addUnique(result.textOnlyViolations, "missing_millennial_profile_core");
        fail("millennial_source_exists", "missing_millennial_profile_core");
      }
      if (!zoomerText.includes("UI_PROFILE_ZOOMER_DIFF")) {
        addUnique(result.textOnlyViolations, "missing_profile_header");
        fail("zoomer_profile_exists", "missing_profile_header");
      }
      if (!buildTag || !commit || !smokeVersion) fail("build_identification_missing", { buildTag, commit, smokeVersion });
      if (smokeVersion !== Z_PROFILE_FINAL_CONTRACT_SMOKE_VERSION
        || !/^step8_8_z_profile_final_contract_v\d{8}_\d{3}$/.test(smokeVersion)
        || Z_PROFILE_FINAL_CONTRACT_PREVIOUS_SMOKE_VERSIONS.indexOf(smokeVersion) !== -1) {
        fail("smoke_version_unique_for_commit", smokeVersion);
      }
      if (buildTag.indexOf(commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag, commit });
      if (result.millennialSourceExists !== true) fail("millennial_source_exists", result.millennialSourcePath);
      if (result.zoomerProfileExists !== true) fail("zoomer_profile_exists", result.zoomerProfilePath);
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.millennialSourceExists === true
      && result.zoomerProfileExists === true
      && result.textOnlyViolations.length === 0
      && result.newLogicKeyHits.length === 0
      && result.newConditionHits.length === 0
      && result.newEntityHits.length === 0
      && result.newHandlerHits.length === 0
      && result.newEconomyRuleHits.length === 0
      && result.newBattleRuleHits.length === 0
      && result.stateMutationHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_FINAL_PACKAGE_BUILD_TAG = "build_2026_06_12_step7_z_profile_final_package";
  const Z_PROFILE_FINAL_PACKAGE_COMMIT = "step7_z_profile_final_package";
  const Z_PROFILE_FINAL_PACKAGE_SMOKE_VERSION = "step7_z_profile_final_package_v20260612_002";
  const Z_PROFILE_FINAL_PACKAGE_REQUIRED_SECTIONS = Object.freeze([
    "Final z-profile rules",
    "Forbidden list",
    "Examples",
    "Millennial -> zoomer mapping reference",
    "Smoke commands",
    "PASS status references for steps 1-8",
    "Final completion marker",
    "Text-only derivation rule",
    "No-new-runtime rule",
  ]);

  Game.__DEV.smokeZProfileFinalPackageOnce = function smokeZProfileFinalPackageOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_FINAL_PACKAGE_BUILD_TAG,
      commit: Z_PROFILE_FINAL_PACKAGE_COMMIT,
      smokeVersion: Z_PROFILE_FINAL_PACKAGE_SMOKE_VERSION,
      finalPackagePath: null,
      finalPackageExists: false,
      requiredSections: [],
      missingSections: [],
      forbiddenListExists: false,
      examplesExist: false,
      mappingReferenceExists: false,
      smokeCommandsExist: false,
      passStepReferences: [],
      finalCompletionMarkerExists: false,
      textOnlyDerivationRuleExists: false,
      noNewRuntimeRuleExists: false,
      orphanRequiredSections: [],
      newLogicKeyHits: [],
      newConditionHits: [],
      newEntityHits: [],
      newHandlerHits: [],
      newEconomyRuleHits: [],
      newBattleRuleHits: [],
      stateMutationHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => fakeToneCoverageAddUnique(list, value);
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const fetchTextSync = (path) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send(null);
        if (xhr.status >= 200 && xhr.status < 300) return { ok: true, text: xhr.responseText || "" };
        return { ok: false, reason: `http_${xhr.status || 0}` };
      } catch (_) {
        return { ok: false, reason: "xhr_exception" };
      }
    };
    const resolveDocCandidates = (fileName) => {
      const candidates = [];
      const seen = new Set();
      const add = (value) => {
        if (!value || seen.has(value)) return;
        seen.add(value);
        candidates.push(value);
      };
      const baseUris = [];
      if (typeof document !== "undefined" && document.baseURI) baseUris.push(document.baseURI);
      if (typeof location !== "undefined" && location.origin) {
        baseUris.push(`${location.origin}/AsyncScene/`);
        baseUris.push(`${location.origin}/`);
        baseUris.push(`${location.origin}/__dev__/docs/`);
      }
      baseUris.forEach((baseUri) => {
        try {
          add(new URL(fileName, baseUri).href);
        } catch (_) {}
      });
      if (typeof location !== "undefined" && location.origin) {
        add(`${location.origin}/AsyncScene/${fileName}`);
        add(`${location.origin}/__dev__/docs/${fileName}`);
        add(`${location.origin}/docs/${fileName}`);
        add(`${location.origin}/${fileName}`);
      }
      add(`/AsyncScene/${fileName}`);
      add(`/__dev__/docs/${fileName}`);
      add(`/docs/${fileName}`);
      add(`/${fileName}`);
      return candidates;
    };
    const fetchTextFromCandidates = (fileName) => {
      let lastResult = null;
      for (const url of resolveDocCandidates(fileName)) {
        const res = fetchTextSync(url);
        const annotated = { ...res, path: url };
        if (res.ok) return annotated;
        lastResult = annotated;
      }
      return lastResult || { ok: false, reason: "unavailable", path: null };
    };
    const normalize = (value) => String(value == null ? "" : value)
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .trim();
    const hasLine = (text, pattern) => pattern.test(text);
    try {
      const finalRes = fetchTextFromCandidates("UI_PROFILE_ZOOMER_FINAL.md");
      result.finalPackagePath = finalRes.path || null;
      result.finalPackageExists = !!finalRes.ok;
      if (!finalRes.ok) fail("final_package_exists", { path: "UI_PROFILE_ZOOMER_FINAL.md", reason: finalRes.reason || "unavailable" });
      const rawText = finalRes.ok ? String(finalRes.text || "") : "";
      const text = normalize(rawText);
      const headings = rawText.match(/^##\s+.+$/gm) || [];
      result.requiredSections = headings.map((line) => line.replace(/^##\s+/, "").trim());
      Z_PROFILE_FINAL_PACKAGE_REQUIRED_SECTIONS.forEach((section) => {
        if (result.requiredSections.indexOf(section) === -1) {
          addUnique(result.missingSections, section);
          fail("required_section_exists", section);
        }
      });
      result.orphanRequiredSections = result.requiredSections.filter((section) => Z_PROFILE_FINAL_PACKAGE_REQUIRED_SECTIONS.indexOf(section) === -1);
      if (result.orphanRequiredSections.length) fail("no_orphan_required_sections", result.orphanRequiredSections.slice());
      result.forbiddenListExists = /##\s+Forbidden list\b/.test(rawText) && /-\s+No memes\./.test(rawText);
      result.examplesExist = /##\s+Examples\b/.test(rawText) && /\|\s*millennial\s*\|\s*zoomer final\s*\|/i.test(rawText);
      result.mappingReferenceExists = /##\s+Millennial -> zoomer mapping reference\b/.test(rawText) && /UI_PROFILE_ZOOMER_DIFF\.md/.test(rawText);
      result.smokeCommandsExist = /##\s+Smoke commands\b/.test(rawText) && /Game\.__DEV\.smokeZProfileFinalPackageOnce\(\)/.test(rawText);
      result.passStepReferences = [1, 2, 3, 4, 5, 6, 7, 8].filter((step) => new RegExp(`Step ${step} PASS reference:`, "i").test(rawText));
      result.finalCompletionMarkerExists = /##\s+Final completion marker\b/.test(rawText)
        && /z-profile is a fast millennial skin, not a new game, not a youth-slang generator\./.test(rawText);
      result.textOnlyDerivationRuleExists = /text-only and derived from `UI_PROFILE_MILLENNIAL`/i.test(rawText);
      result.noNewRuntimeRuleExists = /No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed\./.test(rawText)
        && /No new logic keys are allowed\./.test(rawText);
      if (!result.forbiddenListExists) fail("forbidden_list_exists", "missing_forbidden_list");
      if (!result.examplesExist) fail("examples_exist", "missing_examples");
      if (!result.mappingReferenceExists) fail("mapping_reference_exists", "missing_mapping_reference");
      if (!result.smokeCommandsExist) fail("smoke_commands_exist", "missing_smoke_commands");
      if (result.passStepReferences.length !== 8) fail("steps_1_8_pass_references_exist", result.passStepReferences.slice());
      if (!result.finalCompletionMarkerExists) fail("final_completion_marker_exists", "missing_completion_marker");
      if (!result.textOnlyDerivationRuleExists) fail("text_only_derivation_rule_exists", "missing_text_only_derivation_rule");
      if (!result.noNewRuntimeRuleExists) fail("no_new_runtime_rule_exists", "missing_no_new_runtime_rule");
      if (!/^#\s+UI_PROFILE_ZOOMER_FINAL\b/m.test(rawText)) fail("final_package_header_exists", "missing_header");
      if (/```/.test(rawText)) fail("text_only_package", "contains_code_fence");
      if (/<script|function\s*\(|=>|const\s+[A-Za-z0-9_]+\s*=/.test(rawText)) fail("text_only_package", "contains_code_like_markup");
      const noNewChecks = [
        { key: "newLogicKeyHits", check: "new_logic_keys", allow: /No new logic keys are allowed\./, deny: /\bnew logic keys?\b/i },
        { key: "newConditionHits", check: "new_conditions", allow: /No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed\./, deny: /\bnew conditions?\b/i },
        { key: "newEntityHits", check: "new_entities", allow: /No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed\./, deny: /\bnew entities\b/i },
        { key: "newHandlerHits", check: "new_handlers", allow: /No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed\./, deny: /\bnew handlers?\b/i },
        { key: "newEconomyRuleHits", check: "new_economy_rules", allow: /No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed\./, deny: /\bnew economy rules?\b/i },
        { key: "newBattleRuleHits", check: "new_battle_rules", allow: /No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed\./, deny: /\bnew battle rules?\b/i },
        { key: "stateMutationHits", check: "state_mutations", allow: /No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed\./, deny: /\bstate mutations?\b/i },
      ];
      noNewChecks.forEach(({ key, check, allow, deny }) => {
        const matches = rawText.match(new RegExp(deny.source, deny.flags.includes("g") ? deny.flags : `${deny.flags}g`)) || [];
        const allowed = hasLine(rawText, allow);
        if (matches.length && !allowed) {
          result[key] = matches.slice(0, 12);
          addUnique(result.forbiddenRemaining, check);
          fail(check, matches.slice(0, 12));
        }
      });
      if (!result.finalPackageExists) fail("final_package_exists", result.finalPackagePath);
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_FINAL_PACKAGE_SMOKE_VERSION || !/^step7_z_profile_final_package_v\d{8}_\d{3}$/.test(result.smokeVersion)) {
        fail("smoke_version_unique", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.finalPackageExists === true
      && result.missingSections.length === 0
      && result.forbiddenListExists === true
      && result.examplesExist === true
      && result.mappingReferenceExists === true
      && result.smokeCommandsExist === true
      && result.passStepReferences.length === 8
      && result.finalCompletionMarkerExists === true
      && result.textOnlyDerivationRuleExists === true
      && result.noNewRuntimeRuleExists === true
      && result.orphanRequiredSections.length === 0
      && result.newLogicKeyHits.length === 0
      && result.newConditionHits.length === 0
      && result.newEntityHits.length === 0
      && result.newHandlerHits.length === 0
      && result.newEconomyRuleHits.length === 0
      && result.newBattleRuleHits.length === 0
      && result.stateMutationHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_RUNTIME_ACCEPTANCE_BUILD_TAG = "build_2026_06_12_step8_12c_z_profile_runtime_acceptance_moneylog_restore_fix";
  const Z_PROFILE_RUNTIME_ACCEPTANCE_COMMIT = "step8_12c_z_profile_runtime_acceptance_moneylog_restore_fix";
  const Z_PROFILE_RUNTIME_ACCEPTANCE_SMOKE_VERSION = "step8_12_z_profile_runtime_acceptance_smoke_v20260612_003";

  Game.__DEV.smokeZProfileRuntimeAcceptanceOnce = function smokeZProfileRuntimeAcceptanceOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_RUNTIME_ACCEPTANCE_BUILD_TAG,
      commit: Z_PROFILE_RUNTIME_ACCEPTANCE_COMMIT,
      smokeVersion: Z_PROFILE_RUNTIME_ACCEPTANCE_SMOKE_VERSION,
      completedChecks: [],
      checkedCount: 0,
      runtimeStyleBefore: null,
      runtimeStyleAfter: null,
      runtimeStyleRestored: null,
      runtimeEnablementOk: false,
      moneyLogBeforeLength: 0,
      moneyLogAfterLength: 0,
      moneyLogSignatureBefore: "",
      moneyLogSignatureAfter: "",
      moneyLogChanged: false,
      moneyLogMutationSources: [],
      econUiAuditOk: false,
      econUiReferenceOk: false,
      finalContractOk: false,
      derivationMappingOk: false,
      speedAuditOk: false,
      simplicityAuditOk: false,
      authenticityAuditOk: false,
      newFeaturesAuditOk: false,
      finalPackageOk: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => fakeToneCoverageAddUnique(list, value);
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const dataApi = (() => {
      if (typeof Data !== "undefined" && Data) return Data;
      if (Game && Game.Data) return Game.Data;
      if (typeof window !== "undefined" && window.Data) return window.Data;
      return null;
    })();
    const getMoneyLogRows = () => {
      if (Game && Game.__D && Array.isArray(Game.__D.moneyLog)) return Game.__D.moneyLog;
      if (Game && Game.State && Array.isArray(Game.State.moneyLog)) return Game.State.moneyLog;
      return [];
    };
    const cloneRows = (rows) => (Array.isArray(rows) ? rows.map((row) => (row && typeof row === "object" ? { ...row } : row)) : []);
    const cloneLogByBattle = (source) => {
      const out = {};
      if (!source || typeof source !== "object") return out;
      Object.keys(source).forEach((key) => {
        out[key] = cloneRows(source[key]);
      });
      return out;
    };
    const captureLogState = () => {
      const dbg = (Game && Game.__D && typeof Game.__D === "object") ? Game.__D : null;
      const state = (Game && Game.State && typeof Game.State === "object") ? Game.State : null;
      return {
        moneyLog: cloneRows(dbg && dbg.moneyLog),
        moneyLogByBattle: cloneLogByBattle(dbg && dbg.moneyLogByBattle),
        stateMoneyLog: cloneRows(state && state.moneyLog),
      };
    };
    const restoreLogState = (snapshot) => {
      const dbg = (Game && Game.__D && typeof Game.__D === "object") ? Game.__D : null;
      const state = (Game && Game.State && typeof Game.State === "object") ? Game.State : null;
      if (dbg) {
        dbg.moneyLog = cloneRows(snapshot && snapshot.moneyLog);
        dbg.moneyLogByBattle = cloneLogByBattle(snapshot && snapshot.moneyLogByBattle);
      }
      if (state && Object.prototype.hasOwnProperty.call(state, "moneyLog")) {
        state.moneyLog = dbg && Array.isArray(dbg.moneyLog) ? dbg.moneyLog : cloneRows(snapshot && snapshot.stateMoneyLog);
      }
      if (Game && Game.__DEV && typeof Game.__DEV === "object" && dbg && Array.isArray(dbg.moneyLog)) {
        Game.__DEV.__debugMoneyLog__ = dbg.moneyLog;
      }
    };
    const snapshotMoneyLog = () => {
      const rows = getMoneyLogRows();
      let hash = 2166136261 >>> 0;
      rows.forEach((row, index) => {
        const parts = [
          index,
          row && row.reason,
          row && (row.currency || row.kind || ""),
          row && row.amount,
          row && row.battleId,
          row && row.txId,
          row && row.sourceId,
          row && row.targetId,
        ].map((value) => String(value == null ? "" : value)).join("|");
        for (let i = 0; i < parts.length; i += 1) {
          hash ^= parts.charCodeAt(i);
          hash = Math.imul(hash, 16777619) >>> 0;
        }
      });
      return { length: rows.length, signature: `0x${hash.toString(16).padStart(8, "0")}` };
    };
    const runRequiredSmoke = (checkName, fn, resultKey, options) => {
      const logStateBefore = captureLogState();
      const moneyBeforeLocal = snapshotMoneyLog();
      let subResult = null;
      try {
        subResult = typeof fn === "function" ? fn() : null;
      } catch (err) {
        subResult = { ok: false, failures: [{ check: "smoke_exception", detail: err && err.message ? String(err.message) : String(err) }], failedChecks: ["smoke_exception"] };
      }
      if (!subResult) {
        addUnique(result.missingCoverage, checkName);
        fail("step_missing", checkName);
        return null;
      }
      addUnique(result.completedChecks, checkName);
      result.checkedCount += 1;
      if (resultKey) result[resultKey] = subResult.ok === true;
      const moneyAfterLocal = snapshotMoneyLog();
      const mutated = moneyBeforeLocal.length !== moneyAfterLocal.length || moneyBeforeLocal.signature !== moneyAfterLocal.signature;
      if (mutated) {
        addUnique(result.moneyLogMutationSources, {
          check: checkName,
          before: { length: moneyBeforeLocal.length, signature: moneyBeforeLocal.signature },
          after: { length: moneyAfterLocal.length, signature: moneyAfterLocal.signature },
        });
        if (options && options.restoreMoneyLog === true) {
          restoreLogState(logStateBefore);
        }
      }
      if (subResult.ok !== true) fail(`${checkName}_not_ok`, subResult);
      return subResult;
    };
    const previousStyle = (dataApi && typeof dataApi.getArgCanonTextStyle === "function")
      ? dataApi.getArgCanonTextStyle()
      : null;
    result.runtimeStyleBefore = previousStyle;
    const moneyBefore = snapshotMoneyLog();
    result.moneyLogBeforeLength = moneyBefore.length;
    result.moneyLogSignatureBefore = moneyBefore.signature;
    let styleNeedsRestore = false;
    try {
      if (!dataApi || typeof dataApi.setArgCanonTextStyle !== "function" || typeof dataApi.getArgCanonTextStyle !== "function") {
        fail("runtime_style_switch_missing", null);
      } else {
        const enabledStyle = dataApi.setArgCanonTextStyle("millennial");
        styleNeedsRestore = true;
        result.runtimeStyleAfter = dataApi.getArgCanonTextStyle();
        result.runtimeEnablementOk = enabledStyle === "millennial" && result.runtimeStyleAfter === "millennial";
        if (!result.runtimeEnablementOk) fail("runtime_enablement_failed", { enabledStyle, runtimeStyleAfter: result.runtimeStyleAfter });
      }
      if (styleNeedsRestore && previousStyle !== null) {
        dataApi.setArgCanonTextStyle(previousStyle);
        result.runtimeStyleRestored = dataApi.getArgCanonTextStyle() === previousStyle;
        styleNeedsRestore = false;
        if (!result.runtimeStyleRestored) fail("runtime_style_restore_failed", { before: previousStyle, after: dataApi.getArgCanonTextStyle() });
      }
      result.econUiReferenceOk = typeof Game.__DEV.smokeEconUi_RegressionPackOnce === "function"
        && typeof Game.__DEV.smokeEconUi_FinalAuditOnce === "function";
      if (!result.econUiReferenceOk) fail("econ_ui_reference_missing", "Game.__DEV.smokeEconUi_RegressionPackOnce");
      const econUiRes = runRequiredSmoke("econ_ui_final_audit", Game.__DEV.smokeEconUi_FinalAuditOnce, "econUiAuditOk", { restoreMoneyLog: true });
      if (!econUiRes || econUiRes.ok !== true) fail("econ_ui_not_checked", econUiRes);
      runRequiredSmoke("final_contract", Game.__DEV.smokeZProfileFinalContractOnce, "finalContractOk");
      runRequiredSmoke("derivation_mapping", Game.__DEV.smokeZProfileDerivationMappingOnce, "derivationMappingOk");
      runRequiredSmoke("speed_audit", Game.__DEV.smokeZProfileSpeedAuditOnce, "speedAuditOk");
      runRequiredSmoke("simplicity_audit", Game.__DEV.smokeZProfileSimplicityAuditOnce, "simplicityAuditOk");
      runRequiredSmoke("authenticity_audit", Game.__DEV.smokeZProfileAuthenticityAuditOnce, "authenticityAuditOk");
      runRequiredSmoke("new_features_audit", Game.__DEV.smokeZProfileNewFeaturesAuditOnce, "newFeaturesAuditOk");
      runRequiredSmoke("final_package", Game.__DEV.smokeZProfileFinalPackageOnce, "finalPackageOk");
      const moneyAfter = snapshotMoneyLog();
      result.moneyLogAfterLength = moneyAfter.length;
      result.moneyLogSignatureAfter = moneyAfter.signature;
      result.moneyLogChanged = result.moneyLogBeforeLength !== result.moneyLogAfterLength || result.moneyLogSignatureBefore !== result.moneyLogSignatureAfter;
      if (result.moneyLogChanged) {
        fail("money_log_unchanged", {
          before: { length: result.moneyLogBeforeLength, signature: result.moneyLogSignatureBefore },
          after: { length: result.moneyLogAfterLength, signature: result.moneyLogSignatureAfter },
          mutationSources: result.moneyLogMutationSources.slice(),
        });
      }
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_RUNTIME_ACCEPTANCE_SMOKE_VERSION || !/^step8_12_z_profile_runtime_acceptance_smoke_v\d{8}_\d{3}$/.test(result.smokeVersion)) {
        fail("smoke_version_unique_for_commit", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    } finally {
      if (styleNeedsRestore && previousStyle !== null && dataApi && typeof dataApi.setArgCanonTextStyle === "function") {
        try { dataApi.setArgCanonTextStyle(previousStyle); } catch (_) {}
      }
    }
    result.ok = result.runtimeEnablementOk === true
      && result.runtimeStyleRestored === true
      && result.econUiAuditOk === true
      && result.econUiReferenceOk === true
      && result.moneyLogChanged === false
      && result.finalContractOk === true
      && result.derivationMappingOk === true
      && result.speedAuditOk === true
      && result.simplicityAuditOk === true
      && result.authenticityAuditOk === true
      && result.newFeaturesAuditOk === true
      && result.finalPackageOk === true
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const Z_PROFILE_FINAL_ACCEPTANCE_BUILD_TAG = "build_2026_06_12_step8_13_z_profile_final_acceptance_marker";
  const Z_PROFILE_FINAL_ACCEPTANCE_COMMIT = "step8_13_z_profile_final_acceptance_marker";
  const Z_PROFILE_FINAL_ACCEPTANCE_SMOKE_VERSION = "step8_13_z_profile_final_acceptance_marker_v20260612_001";

  Game.__DEV.smokeZProfileFinalAcceptanceOnce = function smokeZProfileFinalAcceptanceOnce(){
    const result = {
      ok: false,
      buildTag: Z_PROFILE_FINAL_ACCEPTANCE_BUILD_TAG,
      commit: Z_PROFILE_FINAL_ACCEPTANCE_COMMIT,
      smokeVersion: Z_PROFILE_FINAL_ACCEPTANCE_SMOKE_VERSION,
      completedChecks: [],
      checkedCount: 0,
      finalPackagePath: null,
      finalPackageExists: false,
      runtimeAcceptanceOk: false,
      finalPackageOk: false,
      passStepReferences: [],
      finalCompletionMarkerExists: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const addUnique = (list, value) => fakeToneCoverageAddUnique(list, value);
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const runRequiredSmoke = (checkName, fn, resultKey) => {
      let subResult = null;
      try {
        subResult = typeof fn === "function" ? fn() : null;
      } catch (err) {
        subResult = { ok: false, failures: [{ check: "smoke_exception", detail: err && err.message ? String(err.message) : String(err) }], failedChecks: ["smoke_exception"] };
      }
      if (!subResult) {
        addUnique(result.missingCoverage, checkName);
        fail("step_missing", checkName);
        return null;
      }
      addUnique(result.completedChecks, checkName);
      result.checkedCount += 1;
      if (resultKey) result[resultKey] = subResult.ok === true;
      if (subResult.ok !== true) fail(`${checkName}_not_ok`, subResult);
      return subResult;
    };
    const fetchTextSync = (path) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send(null);
        if (xhr.status >= 200 && xhr.status < 300) return { ok: true, text: xhr.responseText || "" };
        return { ok: false, reason: `http_${xhr.status || 0}` };
      } catch (_) {
        return { ok: false, reason: "xhr_exception" };
      }
    };
    const resolveDocCandidates = (fileName) => {
      const candidates = [];
      const seen = new Set();
      const add = (value) => {
        if (!value || seen.has(value)) return;
        seen.add(value);
        candidates.push(value);
      };
      const baseUris = [];
      if (typeof document !== "undefined" && document.baseURI) baseUris.push(document.baseURI);
      if (typeof location !== "undefined" && location.origin) {
        baseUris.push(`${location.origin}/AsyncScene/`);
        baseUris.push(`${location.origin}/`);
        baseUris.push(`${location.origin}/__dev__/docs/`);
      }
      baseUris.forEach((baseUri) => {
        try {
          add(new URL(fileName, baseUri).href);
        } catch (_) {}
      });
      if (typeof location !== "undefined" && location.origin) {
        add(`${location.origin}/AsyncScene/${fileName}`);
        add(`${location.origin}/__dev__/docs/${fileName}`);
        add(`${location.origin}/docs/${fileName}`);
        add(`${location.origin}/${fileName}`);
      }
      add(`/AsyncScene/${fileName}`);
      add(`/__dev__/docs/${fileName}`);
      add(`/docs/${fileName}`);
      add(`/${fileName}`);
      return candidates;
    };
    const fetchTextFromCandidates = (fileName) => {
      let lastResult = null;
      for (const url of resolveDocCandidates(fileName)) {
        const res = fetchTextSync(url);
        const annotated = { ...res, path: url };
        if (res.ok) return annotated;
        lastResult = annotated;
      }
      return lastResult || { ok: false, reason: "unavailable", path: null };
    };
    const normalize = (value) => String(value == null ? "" : value)
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .trim();
    try {
      const runtimeAcceptanceRes = runRequiredSmoke("runtime_acceptance", Game.__DEV.smokeZProfileRuntimeAcceptanceOnce, "runtimeAcceptanceOk");
      const finalRes = fetchTextFromCandidates("UI_PROFILE_ZOOMER_FINAL.md");
      result.finalPackagePath = finalRes.path || null;
      result.finalPackageExists = !!finalRes.ok;
      if (!finalRes.ok) fail("final_package_exists", { path: "UI_PROFILE_ZOOMER_FINAL.md", reason: finalRes.reason || "unavailable" });
      const rawText = finalRes.ok ? String(finalRes.text || "") : "";
      const headings = rawText.match(/^##\s+.+$/gm) || [];
      result.passStepReferences = [1, 2, 3, 4, 5, 6, 7, 8].filter((step) => new RegExp(`Step ${step} PASS reference:`, "i").test(rawText));
      if (result.passStepReferences.length !== 8) fail("steps_1_8_pass_references_exist", result.passStepReferences.slice());
      result.finalCompletionMarkerExists = /##\s+Final completion marker\b/.test(rawText)
        && /z-profile is a fast millennial skin, not a new game, not a youth-slang generator\./.test(rawText);
      if (!result.finalCompletionMarkerExists) fail("final_completion_marker_exists", "missing_completion_marker");
      if (!headings.length) fail("final_package_doc_missing_headings", null);
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== Z_PROFILE_FINAL_ACCEPTANCE_SMOKE_VERSION || !/^step8_13_z_profile_final_acceptance_marker_v\d{8}_\d{3}$/.test(result.smokeVersion)) {
        fail("smoke_version_unique_for_commit", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
      if (!runtimeAcceptanceRes || runtimeAcceptanceRes.ok !== true) fail("runtime_acceptance_not_passed", runtimeAcceptanceRes);
      if (!runtimeAcceptanceRes || runtimeAcceptanceRes.finalPackageOk !== true) fail("runtime_final_package_not_passed", runtimeAcceptanceRes);
      result.finalPackageOk = runtimeAcceptanceRes ? runtimeAcceptanceRes.finalPackageOk === true : false;
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.runtimeAcceptanceOk === true
      && result.finalPackageExists === true
      && result.finalPackageOk === true
      && result.passStepReferences.length === 8
      && result.finalCompletionMarkerExists === true
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const STOP_FAKE_LEXICON_BUILD_TAG = "build_2026_06_11_step8_3_stop_fake_lexicon_enforcement";
  const STOP_FAKE_LEXICON_COMMIT = "step8_3_stop_fake_lexicon_enforcement";
  const STOP_FAKE_LEXICON_SMOKE_VERSION = "step8_3_stop_fake_lexicon_enforcement_smoke_v20260611_001";
  const STOP_FAKE_LEXICON_CATEGORIES = Object.freeze({
    memeHits: Object.freeze({
      check: "meme_language",
      patterns: Object.freeze([
        /(^|[^А-Яа-яЁёA-Za-z0-9_])(лол|лмао|кек|рофл|жиза|скибиди|мемн(?:о|ый|ая|ое|ые)?|press\s*f|go\s*brrr|sus)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      ]),
    }),
    teenSlangHits: Object.freeze({
      check: "teenage_tone",
      patterns: Object.freeze([
        /(^|[^А-Яа-яЁёA-Za-z0-9_])(ч[её]|щас|го|изи|имба|топчик|хайп|флекс|слей|зумерск(?:ий|ая|ое|ие)|тик\s?ток|тикток)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      ]),
    }),
    flirtingHits: Object.freeze({
      check: "flirting_trying_too_hard_tone",
      patterns: Object.freeze([
        /(^|[^А-Яа-яЁёA-Za-z0-9_])(краш|красавчик|милаш(?:ка|ный|ная|ное)?|детка|зай(?:ка)?|секси|флирт(?:у|овать|овый)?|подмиг(?:иваю|нул|нула)?|rizz)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      ]),
    }),
    vibeHits: Object.freeze({
      check: "vibe_style_wording",
      patterns: Object.freeze([
        /(^|[^А-Яа-яЁёA-Za-z0-9_])(вайб(?:овый|овая|овое|овые|а|ом)?|vibe|vibes)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      ]),
    }),
    cringeHits: Object.freeze({
      check: "cringe_style_wording",
      patterns: Object.freeze([
        /(^|[^А-Яа-яЁёA-Za-z0-9_])(кринж(?:овый|овая|овое|овые|а|ем)?|зашквар|cringe)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      ]),
    }),
    relaxedToneHits: Object.freeze({
      check: "relaxed_tone_wording",
      patterns: Object.freeze([
        /(^|[^А-Яа-яЁёA-Za-z0-9_])(на\s+расслабоне|расслабон|на\s+чилле|чилл(?:им|овый|овая|овое|ые)?|без\s+напряга|релакс)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      ]),
    }),
    excessiveIronyHits: Object.freeze({
      check: "excessive_irony",
      patterns: Object.freeze([
        /(^|[^А-Яа-яЁёA-Za-z0-9_])(иронично|сарказм|саркастично|ха[-\s]?ха|ну\s+конечно|ага,\s*щас|смешно\s+аж)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
      ]),
    }),
  });

  function stopFakeLexiconAddHit(result, bucketName, entry, pattern){
    const hit = {
      zone: entry.zone,
      source: entry.source,
      text: entry.text,
      pattern: String(pattern && pattern.source ? pattern.source : pattern),
    };
    fakeToneCoverageAddUnique(result[bucketName], hit);
    fakeToneCoverageAddUnique(result.forbiddenRemaining, hit);
  }

  Game.__DEV.smokeStopFakeLexiconOnce = function smokeStopFakeLexiconOnce(){
    const result = {
      ok: false,
      buildTag: STOP_FAKE_LEXICON_BUILD_TAG,
      commit: STOP_FAKE_LEXICON_COMMIT,
      smokeVersion: STOP_FAKE_LEXICON_SMOKE_VERSION,
      checkedCount: 0,
      checkedZones: [],
      memeHits: [],
      teenSlangHits: [],
      flirtingHits: [],
      vibeHits: [],
      cringeHits: [],
      relaxedToneHits: [],
      excessiveIronyHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const fail = (check, detail) => {
      fakeToneCoverageAddUnique(result.failedChecks, check);
      fakeToneCoverageAddUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    const entries = fakeToneCollectCheckedTexts();
    const checkedZones = new Set();
    entries.forEach((entry) => {
      if (!entry || !entry.text) return;
      checkedZones.add(entry.zone);
      Object.keys(STOP_FAKE_LEXICON_CATEGORIES).forEach((bucketName) => {
        const category = STOP_FAKE_LEXICON_CATEGORIES[bucketName];
        category.patterns.forEach((pattern) => {
          if (pattern.test(entry.text)) stopFakeLexiconAddHit(result, bucketName, entry, pattern);
        });
      });
    });
    result.checkedCount = entries.length;
    result.checkedZones = FAKE_TONE_COVERAGE_REQUIRED_ZONES.filter((zone) => checkedZones.has(zone));
    FAKE_TONE_COVERAGE_REQUIRED_ZONES.forEach((zone) => {
      if (!checkedZones.has(zone)) {
        fakeToneCoverageAddUnique(result.missingCoverage, zone);
        fail("checked_text_zone_missing", zone);
      }
    });
    Object.keys(STOP_FAKE_LEXICON_CATEGORIES).forEach((bucketName) => {
      if (result[bucketName].length) fail(STOP_FAKE_LEXICON_CATEGORIES[bucketName].check, result[bucketName]);
    });
    if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
    if (result.smokeVersion !== STOP_FAKE_LEXICON_SMOKE_VERSION || result.smokeVersion.indexOf("step8_3") === -1 || result.smokeVersion.indexOf(result.commit) === -1) {
      fail("smoke_version_unique_for_commit", result.smokeVersion);
    }
    if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    result.ok = result.checkedCount > 0
      && result.checkedZones.length === FAKE_TONE_COVERAGE_REQUIRED_ZONES.length
      && result.memeHits.length === 0
      && result.teenSlangHits.length === 0
      && result.flirtingHits.length === 0
      && result.vibeHits.length === 0
      && result.cringeHits.length === 0
      && result.relaxedToneHits.length === 0
      && result.excessiveIronyHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  const NEUTRAL_REPLACEMENT_AUDIT_BUILD_TAG = "build_2026_06_12_step8_4_neutral_replacement_audit";
  const NEUTRAL_REPLACEMENT_AUDIT_COMMIT = "step8_4_neutral_replacement_audit";
  const NEUTRAL_REPLACEMENT_AUDIT_SMOKE_VERSION = "step8_4_neutral_replacement_audit_smoke_v20260612_001";
  const NEUTRAL_REPLACEMENT_AUDIT_PAIRS = Object.freeze([
    Object.freeze({
      zone: "arguments",
      source: "Game.Data.ARG_BASE_Y.about.7.q",
      before: "Кто сейчас, возможно, на хайпе?",
      after: "Кого обсуждают?",
      mustKeep: Object.freeze(["обсужд"]),
    }),
    Object.freeze({
      zone: "arguments",
      source: "Game.Data.ARG_BASE_O.about.7.q",
      before: "Кто сейчас на хайпе?",
      after: "Кого обсуждают?",
      mustKeep: Object.freeze(["обсужд"]),
    }),
    Object.freeze({
      zone: "arguments",
      source: "Game.Data.ARG_BASE_R.about.7.q",
      before: "Кто на хайпе..!",
      after: "Кого слышно?!",
      mustKeep: Object.freeze(["слыш"]),
    }),
    Object.freeze({
      zone: "arguments",
      source: "Game.Data.ARG_BASE_K.about.7.q",
      before: "Назови того кто на хайпе!",
      after: "Назови кого обсуждают!",
      mustKeep: Object.freeze(["назови", "обсужд"]),
    }),
    Object.freeze({
      zone: "NPC speech",
      source: "Game.Data.COP_TEMPLATES.toxicDescriptions.5",
      before: "Токсик мастерски искажает правду ради хайпа.",
      after: "Токсик искажает правду.",
      mustKeep: Object.freeze(["токсик", "искаж", "правд"]),
    }),
  ]);
  const NEUTRAL_REPLACEMENT_FAKE_TONE_PATTERNS = Object.freeze([
    /(^|[^А-Яа-яЁёA-Za-z0-9_])(кринж\w*|вайб\w*|имба|изи|рофл|лол|кек|жиза|краш|флекс|топчик|хайп\w*|скибиди|зумерск\w*|vibe|cringe|rizz|sus)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
    /(^|[^А-Яа-яЁёA-Za-z0-9_])(лови|тащи|разнос|легенда|эпично|огонь|бомба)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
    /(как\s+говорит\s+молод[её]жь|по[-\s]?молод[её]жному|для\s+зумеров|на\s+чилле|без\s+негатива)/i,
  ]);
  const NEUTRAL_REPLACEMENT_MENTORING_PATTERNS = Object.freeze([
    /(давай\s+разбер[её]м|запомни|объясн(?:ю|яем|яю)|научи(?:сь|м)|урок|настав|совет|подскажу)/i,
    /(^|[^А-Яа-яЁёA-Za-z0-9_])(ты\s+долж(?:ен|на|ны)|тебе\s+стоит|следует|необходимо|надо\s+понимать)(?=$|[^А-Яа-яЁёA-Za-z0-9_])/i,
    /(правильн(?:ый|ая|ое|ые|о)|неправильн(?:ый|ая|ое|ые|о)|лучший\s+выбор|молодец|умничк)/i,
  ]);
  const NEUTRAL_REPLACEMENT_BORING_PATTERNS = Object.freeze([
    /^(ок|ладно|готово|ясно|понятно|нормально|сделано)\.?$/i,
    /^(можно|попробуй|попробовать)\.?$/i,
  ]);

  function neutralReplacementNormalize(value){
    return fakeToneNormalizeText(value).toLowerCase().replace(/ё/g, "е");
  }

  function neutralReplacementPatternHit(text, patterns){
    const value = fakeToneNormalizeText(text);
    for (let index = 0; index < patterns.length; index += 1) {
      const pattern = patterns[index];
      if (pattern && pattern.test(value)) return pattern;
    }
    return null;
  }

  function neutralReplacementGetPath(path){
    const root = { Game, Data: Game && Game.Data, SystemCopy: Game && Game.SystemCopy };
    return String(path || "").split(".").reduce((value, key) => {
      if (value == null) return undefined;
      if (key === "Game") return Game;
      if (/^\d+$/.test(key)) return value[Number(key)];
      return value[key];
    }, root);
  }

  function neutralReplacementAddEntryHit(list, entry, pattern, kind){
    fakeToneCoverageAddUnique(list, {
      zone: entry.zone,
      source: entry.source,
      text: entry.text,
      kind,
      pattern: String(pattern && pattern.source ? pattern.source : pattern),
    });
  }

  Game.__DEV.smokeNeutralReplacementAuditOnce = function smokeNeutralReplacementAuditOnce(){
    const result = {
      ok: false,
      buildTag: NEUTRAL_REPLACEMENT_AUDIT_BUILD_TAG,
      commit: NEUTRAL_REPLACEMENT_AUDIT_COMMIT,
      smokeVersion: NEUTRAL_REPLACEMENT_AUDIT_SMOKE_VERSION,
      checkedCount: 0,
      replacementPairsChecked: 0,
      meaningLossHits: [],
      boringToneHits: [],
      longRewriteHits: [],
      mentoringToneHits: [],
      fakeToneHits: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
    };
    const fail = (check, detail) => {
      fakeToneCoverageAddUnique(result.failedChecks, check);
      fakeToneCoverageAddUnique(result.failures, detail === undefined ? check : { check, detail });
    };
    try {
      const entries = fakeToneCollectCheckedTexts();
      const checkedZones = new Set();
      entries.forEach((entry) => {
        if (!entry || !entry.text) return;
        checkedZones.add(entry.zone);
        const fakePattern = neutralReplacementPatternHit(entry.text, NEUTRAL_REPLACEMENT_FAKE_TONE_PATTERNS);
        if (fakePattern) neutralReplacementAddEntryHit(result.fakeToneHits, entry, fakePattern, "runtime_text");
        const mentoringPattern = neutralReplacementPatternHit(entry.text, NEUTRAL_REPLACEMENT_MENTORING_PATTERNS);
        if (mentoringPattern) neutralReplacementAddEntryHit(result.mentoringToneHits, entry, mentoringPattern, "runtime_text");
      });
      result.checkedCount = entries.length;
      FAKE_TONE_COVERAGE_REQUIRED_ZONES.forEach((zone) => {
        if (!checkedZones.has(zone)) fakeToneCoverageAddUnique(result.missingCoverage, zone);
      });
      NEUTRAL_REPLACEMENT_AUDIT_PAIRS.forEach((pair) => {
        result.replacementPairsChecked += 1;
        const current = fakeToneNormalizeText(neutralReplacementGetPath(pair.source));
        const expected = fakeToneNormalizeText(pair.after);
        const before = fakeToneNormalizeText(pair.before);
        const actual = current || expected;
        const normalizedActual = neutralReplacementNormalize(actual);
        if (!current || current !== expected) {
          fakeToneCoverageAddUnique(result.missingCoverage, { source: pair.source, expected, actual: current || null });
        }
        Array.from(pair.mustKeep || []).forEach((token) => {
          if (normalizedActual.indexOf(neutralReplacementNormalize(token)) === -1) {
            fakeToneCoverageAddUnique(result.meaningLossHits, { source: pair.source, before, after: actual, missing: token });
          }
        });
        const boringPattern = neutralReplacementPatternHit(actual, NEUTRAL_REPLACEMENT_BORING_PATTERNS);
        if (boringPattern) fakeToneCoverageAddUnique(result.boringToneHits, { source: pair.source, before, after: actual, pattern: String(boringPattern.source || boringPattern) });
        if (actual.length > before.length) fakeToneCoverageAddUnique(result.longRewriteHits, { source: pair.source, beforeLength: before.length, afterLength: actual.length, before, after: actual });
        const fakePattern = neutralReplacementPatternHit(actual, NEUTRAL_REPLACEMENT_FAKE_TONE_PATTERNS);
        if (fakePattern) fakeToneCoverageAddUnique(result.fakeToneHits, { zone: pair.zone, source: pair.source, text: actual, kind: "replacement_pair", pattern: String(fakePattern.source || fakePattern) });
        const mentoringPattern = neutralReplacementPatternHit(actual, NEUTRAL_REPLACEMENT_MENTORING_PATTERNS);
        if (mentoringPattern) fakeToneCoverageAddUnique(result.mentoringToneHits, { zone: pair.zone, source: pair.source, text: actual, kind: "replacement_pair", pattern: String(mentoringPattern.source || mentoringPattern) });
      });
      result.forbiddenRemaining = [].concat(result.fakeToneHits, result.mentoringToneHits);
      if (result.replacementPairsChecked !== NEUTRAL_REPLACEMENT_AUDIT_PAIRS.length || result.replacementPairsChecked < 1) fail("replacement_pairs_missing", result.replacementPairsChecked);
      if (result.checkedCount < 1) fail("checked_texts_missing", result.checkedCount);
      if (result.meaningLossHits.length) fail("meaning_loss_hits_empty", result.meaningLossHits);
      if (result.boringToneHits.length) fail("boring_tone_hits_empty", result.boringToneHits);
      if (result.longRewriteHits.length) fail("long_rewrite_hits_empty", result.longRewriteHits);
      if (result.mentoringToneHits.length) fail("mentoring_tone_hits_empty", result.mentoringToneHits);
      if (result.fakeToneHits.length) fail("fake_tone_hits_empty", result.fakeToneHits);
      if (result.forbiddenRemaining.length) fail("forbidden_remaining_empty", result.forbiddenRemaining);
      if (result.missingCoverage.length) fail("missing_coverage_empty", result.missingCoverage);
      if (!result.buildTag || !result.commit || !result.smokeVersion) fail("build_identification_missing", { buildTag: result.buildTag, commit: result.commit, smokeVersion: result.smokeVersion });
      if (result.smokeVersion !== NEUTRAL_REPLACEMENT_AUDIT_SMOKE_VERSION || result.smokeVersion.indexOf("step8_4") === -1 || result.smokeVersion.indexOf(result.commit) === -1) {
        fail("smoke_version_unique_for_commit", result.smokeVersion);
      }
      if (result.buildTag.indexOf(result.commit) === -1) fail("build_tag_commit_marker_mismatch", { buildTag: result.buildTag, commit: result.commit });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.checkedCount > 0
      && result.replacementPairsChecked === NEUTRAL_REPLACEMENT_AUDIT_PAIRS.length
      && result.meaningLossHits.length === 0
      && result.boringToneHits.length === 0
      && result.longRewriteHits.length === 0
      && result.mentoringToneHits.length === 0
      && result.fakeToneHits.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };
  Game.__neutralReplacementAuditSmokeOnce = Game.__DEV.smokeNeutralReplacementAuditOnce;
  function exposeNeutralReplacementAuditSmoke(){
    if (!Game.__DEV) Game.__DEV = {};
    Game.__DEV.smokeNeutralReplacementAuditOnce = Game.__neutralReplacementAuditSmokeOnce;
    if (!Game.Dev) Game.Dev = {};
    Game.Dev.smokeNeutralReplacementAuditOnce = Game.__neutralReplacementAuditSmokeOnce;
  }
  exposeNeutralReplacementAuditSmoke();
  if (typeof setTimeout === "function") {
    setTimeout(exposeNeutralReplacementAuditSmoke, 0);
    setTimeout(exposeNeutralReplacementAuditSmoke, 250);
    setTimeout(exposeNeutralReplacementAuditSmoke, 1000);
  }
  Game.__stopFakeLexiconSmokeOnce = Game.__DEV.smokeStopFakeLexiconOnce;
  function exposeStopFakeLexiconSmoke(){
    if (!Game.__DEV) Game.__DEV = {};
    Game.__DEV.smokeStopFakeLexiconOnce = Game.__stopFakeLexiconSmokeOnce;
    if (!Game.Dev) Game.Dev = {};
    Game.Dev.smokeStopFakeLexiconOnce = Game.__stopFakeLexiconSmokeOnce;
  }
  exposeStopFakeLexiconSmoke();
  if (typeof setTimeout === "function") {
    setTimeout(exposeStopFakeLexiconSmoke, 0);
    setTimeout(exposeStopFakeLexiconSmoke, 250);
    setTimeout(exposeStopFakeLexiconSmoke, 1000);
  }

})();
