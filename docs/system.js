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

  const SystemCopy = Object.freeze({
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
      respectNoChain: "Цепочка A->B->A сегодня недоступна.",
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
    try {
      const json = JSON.stringify(value);
      return json && json !== "{}" ? json : "";
    } catch (_) {
      return "";
    }
  }

  function renderTemplate(template, ctx){
    const source = String(template || "");
    const data = (ctx && typeof ctx === "object") ? ctx : {};
    return source.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => safeValue(data[key])).replace(/\s+/g, " ").trim();
  }

  function say(kind, code, ctx){
    const group = normalizeKind(kind);
    const bucket = group && SystemCopy[group] && typeof SystemCopy[group] === "object" ? SystemCopy[group] : null;
    const key = String(code || "").trim();
    const template = bucket && Object.prototype.hasOwnProperty.call(bucket, key) ? bucket[key] : FALLBACK_MESSAGE;
    const rendered = renderTemplate(template, ctx);
    return rendered || FALLBACK_MESSAGE;
  }


  const SYSTEM_COPY_REQUIRED_AREAS = Object.freeze([
    "economyDeltas", "dm", "battles", "events", "reports", "rematch", "escape", "training", "respect"
  ]);

  const SYSTEM_COPY_INVENTORY = Object.freeze([
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaPlusOne", file: "AsyncScene/Web/events.js", surface: "system", callsite: "Game.UI.pushSystem(Game.System.say(\"notifications\", \"pointsDeltaPlusOne\"))", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "repDeltaPlusOne", file: "AsyncScene/Web/events.js", surface: "system", callsite: "Game.UI.pushSystem(Game.System.say(\"notifications\", \"repDeltaPlusOne\"))", directHardcoded: false },
    { area: "economyDeltas", kind: "notifications", code: "pointsDeltaVoteCost", file: "AsyncScene/Web/events.js", surface: "system", callsite: "Game.UI.pushSystem(Game.System.say(\"notifications\", \"pointsDeltaVoteCost\", { voteCost }))", directHardcoded: false },
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
    { area: "escape", kind: "notifications", code: "escapePaid", file: "AsyncScene/Web/ui/ui-battles.js", surface: "toast", callsite: "escape action label via Game.System.say(\"notifications\", \"escapePaid\")", directHardcoded: false },
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
    requiredGroups: REQUIRED_SYSTEM_COPY_GROUPS,
    requiredInventoryAreas: SYSTEM_COPY_REQUIRED_AREAS,
    copyInventory: SYSTEM_COPY_INVENTORY,
    codeTaxonomy: SYSTEM_COPY_CODE_TAXONOMY,
    taxonomyAudit: SYSTEM_COPY_TAXONOMY_AUDIT,
    coverageRowsFromInventory,
    taxonomyEntries,
    systemCopyTaxonomyRows,
    normalizeKind,
    languageProfile: SYSTEM_LANGUAGE_PROFILE,
    lintSystemLanguageLine,
    reviewSystemLanguageLine,
    lintSystemCopy,
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
})();
