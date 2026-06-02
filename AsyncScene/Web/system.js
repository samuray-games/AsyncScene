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
    coverageRowsFromInventory,
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
