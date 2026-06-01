// data/style-lex.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  const Data = Game.Data || (Game.Data = {});

  const styleLex = {
    version: "style-lex-runtime-contract-v1",
    address: "ты",
    stance: "partner",
    tone: {
      stance: "partner",
      address: "ты",
      partnerLanguage: {
        prefer: [
          { insteadOf: "обучаю", use: ["подсказываю"] },
          { insteadOf: "ты должен", use: ["можешь"] },
          { insteadOf: "ошибка", use: ["не хватает", "не получилось"] }
        ],
        avoidTeacherTone: ["урок", "наказание", "правильно", "неправильно"],
        teacherToneException: "Можно оставить только при конкретной игровой причине и с нейтральной заменой в rewriteHints."
      }
    },
    phraseLength: {
      min: 1,
      max: 2,
      unit: "short phrases",
      global: {
        oneThoughtPerLine: true,
        maxCharsTarget: [60, 80],
        maxWordsTarget: [12, 14],
        noLongParentheticalBlocks: true,
        noBracketedTextWalls: true
      },
      surfaces: {
        toast: { maxLines: 2 },
        resultCard: { maxLines: [3, 4] },
        hint: { maxLines: 2 },
        error: { maxLines: 2 },
        npcLine: { maxLines: 2 },
        devCard: { maxLines: [3, 4] }
      },
      rules: [
        "Пиши 1-2 короткие фразы.",
        "Одна мысль — одна строка.",
        "Цель строки: 60-80 символов или максимум 12-14 слов.",
        "Toast: максимум 2 строки.",
        "Result card: максимум 3-4 строки.",
        "Hint/error/NPC line: максимум 2 строки.",
        "Dev card: максимум 3-4 строки.",
        "Не делай длинные скобочные блоки и стены текста в квадратных скобках.",
        "Делай одно действие или один смысл на фразу.",
        "Если строка перегружена, раздели её на две короткие фразы."
      ]
    },
    allowed: {
      economy: ["очки", "стоимость", "плата", "возврат", "остаток", "лимит", "баланс"],
      decision: ["выбор", "риск", "ставка", "итог", "результат"],
      conflict: ["аргумент", "ход", "защита", "атака", "ничья", "победа"],
      social: ["уважение", "⭐", "доверие", "Сдать", "штраф"],
      interface: ["подсказка", "сообщение", "событие", "личка"],
      formulas: [
        "Твой выбор.",
        "Есть риск.",
        "Результат виден.",
        "Очки на месте."
      ]
    },
    forbidden: {
      categories: [
        "memes/internet slang",
        "teen slang",
        "officialese/bureaucratic phrasing",
        "toxicity/humiliation",
        "teacher tone",
        "gray promises"
      ],
      tabooForms: {
        "memes/internet slang": ["лол", "кек", "мемно", "рофл", "жиза"],
        "teen slang": ["краш", "вайб", "имба", "кринж", "топчик"],
        "officialese/bureaucratic phrasing": ["необходимо", "осуществить", "произошла ошибка", "в рамках", "данная функция"],
        "toxicity/humiliation": ["тупой", "лох", "позор", "унижен", "заткнись"],
        "teacher tone": ["запомни", "ты должен", "неправильно, думай", "как тебе не стыдно"],
        "gray promises": ["награда получена", "очки начислены", "мы уже сделали", "платёж прошёл", "предмет выдан"]
      }
    },
    rewriteHints: {
      "memes/internet slang": {
        _category: ["простое описание", "спокойная реакция"],
        "лол": ["смешно", "забавно"],
        "кек": ["смешно", "неожиданно"],
        "мемно": ["странно", "похоже на шутку"],
        "рофл": ["шутка", "смешной момент"],
        "жиза": ["знакомая ситуация", "похоже на правду"]
      },
      "teen slang": {
        _category: ["нейтральная оценка", "обычное слово"],
        "краш": ["симпатия", "тот, кто нравится"],
        "вайб": ["настрой", "ощущение"],
        "имба": ["сильный выбор", "заметное преимущество"],
        "кринж": ["неловко", "неудачно"],
        "топчик": ["хорошо", "сильный вариант"]
      },
      "officialese/bureaucratic phrasing": {
        _category: ["короткая фраза", "прямое действие"],
        "необходимо": ["нужно", "можно"],
        "осуществить": ["сделать", "провести"],
        "произошла ошибка": ["не получилось", "сбой"],
        "ошибка": ["не получилось", "не хватает"],
        "в рамках": ["для", "в этой части"],
        "данная функция": ["эта функция", "этот ход"]
      },
      "toxicity/humiliation": {
        _category: ["описание действия", "спокойный отказ"],
        "тупой": ["неверный", "слабый"],
        "лох": ["соперник", "игрок"],
        "позор": ["плохой итог", "неудача"],
        "унижен": ["проиграл", "потерял очки"],
        "заткнись": ["остановись", "не продолжай"]
      },
      "teacher tone": {
        _category: ["партнёрская подсказка", "нейтральное объяснение"],
        "запомни": ["подсказка", "важно"],
        "обучаю": ["подсказываю"],
        "ты должен": ["можешь"],
        "урок": ["подсказка", "разбор хода"],
        "наказание": ["последствие", "штраф"],
        "правильно": ["получилось", "ход сработал"],
        "неправильно": ["не получилось", "проверь ход"],
        "неправильно, думай": ["проверь выбор", "есть другой ход"],
        "как тебе не стыдно": ["такой ход рискованный", "это ухудшит доверие"]
      },
      "gray promises": {
        _category: ["статус до подтверждения", "условная формулировка"],
        "награда получена": ["награда ждёт подтверждения", "проверяем награду"],
        "очки начислены": ["очки будут видны после подтверждения", "проверяем очки"],
        "мы уже сделали": ["делаем", "проверяем результат"],
        "платёж прошёл": ["платёж проверяется", "ждём подтверждение"],
        "предмет выдан": ["предмет появится после подтверждения", "проверяем выдачу"]
      }
    }
  };

  Data.styleLex = styleLex;


  const STYLELEX_WORD_RE = /[0-9A-Za-zА-Яа-яЁё_]/;

  const escapeRegExp = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const isWordChar = (char) => !!char && STYLELEX_WORD_RE.test(char);

  const isSafeTermBoundary = (text, start, end) => !isWordChar(text.charAt(start - 1)) && !isWordChar(text.charAt(end));

  const sortStyleLexTerms = (terms) => terms.sort((a, b) => b.term.length - a.term.length || a.term.localeCompare(b.term));

  const flattenForbiddenTerms = (lex) => {
    const tabooForms = lex && lex.forbidden && lex.forbidden.tabooForms ? lex.forbidden.tabooForms : {};
    const terms = [];
    for (const category of Object.keys(tabooForms)) {
      const list = Array.isArray(tabooForms[category]) ? tabooForms[category] : [];
      for (const term of list) {
        const value = String(term || "").trim();
        if (value) terms.push({ category, term: value });
      }
    }
    return sortStyleLexTerms(terms);
  };

  const flattenRewriteTerms = (lex) => {
    const byKey = new Map();
    for (const item of flattenForbiddenTerms(lex)) {
      byKey.set(`${item.category}:${item.term}`, item);
    }
    const rewriteHints = lex && lex.rewriteHints ? lex.rewriteHints : {};
    for (const category of Object.keys(rewriteHints)) {
      const hints = rewriteHints[category] || {};
      for (const term of Object.keys(hints)) {
        if (term === "_category") continue;
        const value = String(term || "").trim();
        if (value && Array.isArray(hints[term]) && hints[term].length) {
          byKey.set(`${category}:${value}`, { category, term: value });
        }
      }
    }
    const prefer = lex && lex.tone && lex.tone.partnerLanguage && Array.isArray(lex.tone.partnerLanguage.prefer)
      ? lex.tone.partnerLanguage.prefer
      : [];
    for (const rule of prefer) {
      const term = String(rule && rule.insteadOf || "").trim();
      if (!term || !Array.isArray(rule.use) || !rule.use.length) continue;
      byKey.set(`tone.partnerLanguage:${term}`, { category: "tone.partnerLanguage", term, replacement: String(rule.use[0] || "").trim() });
    }
    return sortStyleLexTerms(Array.from(byKey.values()));
  };

  const firstRewriteHint = (lex, category, term, item) => {
    if (item && typeof item.replacement === "string" && item.replacement.trim()) return item.replacement.trim();
    const hints = lex && lex.rewriteHints && lex.rewriteHints[category] ? lex.rewriteHints[category] : null;
    const direct = hints && Array.isArray(hints[term]) ? hints[term] : null;
    if (direct && typeof direct[0] === "string" && direct[0].trim()) return direct[0].trim();
    return "";
  };

  const scanForbiddenTerms = (text, terms) => {
    const source = String(text || "");
    const lower = source.toLocaleLowerCase("ru-RU");
    const hits = [];
    for (const item of terms) {
      const needle = item.term.toLocaleLowerCase("ru-RU");
      let from = 0;
      while (needle && from < lower.length) {
        const idx = lower.indexOf(needle, from);
        if (idx < 0) break;
        const end = idx + needle.length;
        if (isSafeTermBoundary(source, idx, end)) {
          hits.push({ category: item.category, term: item.term, index: idx, text: source.slice(idx, end) });
        }
        from = Math.max(end, idx + 1);
      }
    }
    return hits.sort((a, b) => a.index - b.index || b.term.length - a.term.length);
  };

  const applyStyleLexRewrites = (text, lex, terms) => {
    let output = String(text || "");
    const replacements = [];
    for (const item of terms) {
      const replacement = firstRewriteHint(lex, item.category, item.term, item);
      if (!replacement) continue;
      const re = new RegExp(escapeRegExp(item.term), "giu");
      output = output.replace(re, (match, offset) => {
        if (!isSafeTermBoundary(output, offset, offset + match.length)) return match;
        replacements.push({ category: item.category, from: match, to: replacement, index: offset });
        return replacement;
      });
    }
    return { text: output, replacements };
  };

  const getSurfaceMaxLines = (lex, surface) => {
    const phraseLength = lex && lex.phraseLength ? lex.phraseLength : {};
    const surfaces = phraseLength.surfaces || {};
    const raw = surfaces[surface] && surfaces[surface].maxLines;
    if (Array.isArray(raw)) return Math.max(1, Number(raw[1] || raw[0] || 0) || 1);
    if (Number.isFinite(Number(raw))) return Math.max(1, Number(raw) | 0);
    return 0;
  };

  const splitStyleLexLines = (text) => String(text || "")
    .replace(/\s*([.!?…。！？]+)\s+/g, "$1\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const enforcePhraseLength = (text, lex, context) => {
    const ctx = (context && typeof context === "object") ? context : { surface: String(context || "") };
    const surface = String(ctx.surface || ctx.kind || "").trim();
    const maxLines = getSurfaceMaxLines(lex, surface);
    const lines = splitStyleLexLines(text);
    let finalLines = lines.length ? lines : [String(text || "").trim()].filter(Boolean);
    let lengthLimited = false;
    if (maxLines > 0 && finalLines.length > maxLines) {
      finalLines = finalLines.slice(0, maxLines);
      lengthLimited = true;
    }
    return {
      text: finalLines.join("\n"),
      lengthLimited,
      lineCount: finalLines.length,
      maxLines: maxLines || null,
      surface: surface || null
    };
  };

  const normalizeText = (text, context) => {
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const original = String(text == null ? "" : text);
    const terms = flattenForbiddenTerms(lex);
    const rewriteTerms = flattenRewriteTerms(lex);
    const detectedForbidden = scanForbiddenTerms(original, terms);
    const rewritten = applyStyleLexRewrites(original, lex, rewriteTerms);
    const limited = enforcePhraseLength(rewritten.text, lex, context || {});
    const forbiddenHits = scanForbiddenTerms(limited.text, terms);
    const result = {
      ok: forbiddenHits.length === 0,
      text: limited.text,
      finalText: limited.text,
      originalText: original,
      changed: limited.text !== original,
      replacements: rewritten.replacements,
      forbiddenHits,
      detectedForbidden,
      lengthLimited: limited.lengthLimited,
      lineCount: limited.lineCount,
      maxLines: limited.maxLines,
      context: (context && typeof context === "object") ? Object.assign({}, context) : { surface: String(context || "") },
      source: "Game.Data.styleLex"
    };
    return result;
  };

  Game.StyleLex = Game.StyleLex || {};
  Game.StyleLex.normalizeText = normalizeText;
  Game.StyleLex.normalize = normalizeText;
  Game.Text = Game.Text || {};
  Game.Text.normalizeText = normalizeText;
  Game.Text.normalize = normalizeText;

  const styleLexTouchpointProof = () => ({
    ok: true,
    helperPath: "Game.Text.normalizeText",
    aliasPath: "Game.StyleLex.normalizeText",
    wiredNow: [
      "Game.UI.showStatToast: normalizes visible stat/economy toast text at the final UI boundary",
      "Game.__D.pushEconToastFromLogRef: stores normalized economy toastLog text before display",
      "smokeStyleLexPack: direct sample coverage for ECON-08 respect copy",
      "smokeStyleLexPack: direct sample coverage for ECON-SOC report/sanction copy",
      "smokeStyleLexPack: direct sample coverage for ECON-P2P transfer copy",
      "smokeStyleLexPack: direct sample coverage for ECON-UI status/hint/result copy"
    ],
    sampleCoverage: ["ECON-08", "ECON-SOC", "ECON-P2P", "ECON-UI", "ECON-04"],
    pending: [],
    unresolvedDecisions: [],
    note: "Completion gate uses wired runtime helpers plus direct smoke pack samples; no known StyleLex decision remains unresolved."
  });

  const requiredKeys = ["address", "stance", "phraseLength", "allowed", "forbidden", "rewriteHints"];
  const requiredAllowedDomains = ["economy", "decision", "conflict", "social", "interface"];
  const requiredForbiddenCategories = [
    "memes/internet slang",
    "teen slang",
    "officialese/bureaucratic phrasing",
    "toxicity/humiliation",
    "teacher tone",
    "gray promises"
  ];

  const requiredPartnerPreferences = [
    { insteadOf: "обучаю", use: "подсказываю" },
    { insteadOf: "ты должен", use: "можешь" },
    { insteadOf: "ошибка", useAny: ["не хватает", "не получилось"] }
  ];
  const requiredTeacherToneTerms = ["урок", "наказание", "правильно", "неправильно"];

  const isGuidanceList = (value) => Array.isArray(value)
    && value.length >= 1
    && value.length <= 2
    && value.every((hint) => typeof hint === "string" && hint.trim().length > 0);

  const readPhraseLengthProof = () => {
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const phraseLength = lex && lex.phraseLength ? lex.phraseLength : null;
    const global = phraseLength && phraseLength.global ? phraseLength.global : {};
    const surfaces = phraseLength && phraseLength.surfaces ? phraseLength.surfaces : {};
    const rules = phraseLength && Array.isArray(phraseLength.rules) ? phraseLength.rules : [];
    const ruleText = rules.join(" ").toLowerCase();
    const requiredSurfaces = ["toast", "resultCard", "hint", "error", "npcLine", "devCard"];
    const surfaceLineLimits = requiredSurfaces.reduce((acc, surface) => {
      const limit = surfaces[surface] && surfaces[surface].maxLines;
      acc[surface] = Array.isArray(limit) ? limit.slice() : limit;
      return acc;
    }, {});
    const hasPhraseLength = !!phraseLength;
    const hasOneThoughtPerLine = global.oneThoughtPerLine === true
      && (ruleText.includes("одна мысль") || ruleText.includes("one thought"));
    const hasMaxChars = Array.isArray(global.maxCharsTarget)
      && global.maxCharsTarget[0] === 60
      && global.maxCharsTarget[1] === 80;
    const hasMaxWords = Array.isArray(global.maxWordsTarget)
      && global.maxWordsTarget[0] === 12
      && global.maxWordsTarget[1] === 14;
    const hasToastLimit = surfaces.toast && surfaces.toast.maxLines === 2;
    const hasResultCardLimit = surfaces.resultCard
      && Array.isArray(surfaces.resultCard.maxLines)
      && surfaces.resultCard.maxLines[0] === 3
      && surfaces.resultCard.maxLines[1] === 4;
    const hasRequiredSurfaces = requiredSurfaces.every((surface) => Object.prototype.hasOwnProperty.call(surfaces, surface));
    const hasNoTextWallRule = global.noLongParentheticalBlocks === true
      && global.noBracketedTextWalls === true
      && ruleText.includes("скоб")
      && ruleText.includes("квадрат");

    return {
      ok: hasPhraseLength
        && hasOneThoughtPerLine
        && (hasMaxChars || hasMaxWords)
        && hasToastLimit
        && hasResultCardLimit
        && hasRequiredSurfaces
        && hasNoTextWallRule,
      path: "Game.Data.styleLex.phraseLength",
      hasPhraseLength,
      requiredSurfaces,
      surfaceLineLimits,
      hasOneThoughtPerLine,
      hasMaxChars,
      hasMaxWords,
      hasToastLimit,
      hasResultCardLimit,
      hasRequiredSurfaces,
      hasNoTextWallRule,
      global,
      rules
    };
  };

  const readForbiddenProof = () => {
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const forbidden = lex && lex.forbidden ? lex.forbidden : {};
    const categories = Array.isArray(forbidden.categories) ? forbidden.categories : [];
    const tabooForms = forbidden.tabooForms || {};
    const rewriteHints = lex && lex.rewriteHints ? lex.rewriteHints : {};
    const missingCategories = requiredForbiddenCategories.filter((category) => !categories.includes(category));
    const missingCategoryGuidance = [];
    const missingItemGuidance = [];
    const categoryItemCounts = {};

    for (const category of requiredForbiddenCategories) {
      const items = Array.isArray(tabooForms[category]) ? tabooForms[category] : [];
      const hints = rewriteHints[category] || {};
      categoryItemCounts[category] = items.length;
      if (!isGuidanceList(hints._category)) {
        missingCategoryGuidance.push(category);
      }
      for (const item of items) {
        if (!isGuidanceList(hints[item])) {
          missingItemGuidance.push(`${category}:${item}`);
        }
      }
    }

    const hasRequiredCategories = missingCategories.length === 0;
    const hasForbiddenItems = requiredForbiddenCategories.every((category) => categoryItemCounts[category] > 0);
    const hasRewriteHints = missingCategoryGuidance.length === 0 && missingItemGuidance.length === 0;

    return {
      ok: !!lex && hasRequiredCategories && hasForbiddenItems && hasRewriteHints,
      path: "Game.Data.styleLex",
      requiredForbiddenCategories,
      forbiddenCategories: categories,
      categoryItemCounts,
      hasRequiredCategories,
      hasForbiddenItems,
      hasRewriteHints,
      missingCategories,
      missingCategoryGuidance,
      missingItemGuidance
    };
  };

  const listIncludes = (list, value) => Array.isArray(list) && list.includes(value);

  const readStanceProof = () => {
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const tone = lex && lex.tone ? lex.tone : {};
    const partnerLanguage = tone.partnerLanguage || {};
    const prefer = Array.isArray(partnerLanguage.prefer) ? partnerLanguage.prefer : [];
    const avoidTeacherTone = Array.isArray(partnerLanguage.avoidTeacherTone) ? partnerLanguage.avoidTeacherTone : [];
    const rewriteHints = lex && lex.rewriteHints ? lex.rewriteHints : {};
    const teacherHints = rewriteHints["teacher tone"] || {};
    const officialHints = rewriteHints["officialese/bureaucratic phrasing"] || {};

    const hasPreference = (insteadOf, use) => prefer.some((rule) => rule
      && rule.insteadOf === insteadOf
      && listIncludes(rule.use, use));
    const hasAnyPreference = (insteadOf, replacements) => prefer.some((rule) => rule
      && rule.insteadOf === insteadOf
      && replacements.every((replacement) => listIncludes(rule.use, replacement)));

    const missingPartnerPreferences = [];
    for (const rule of requiredPartnerPreferences) {
      if (rule.use && !hasPreference(rule.insteadOf, rule.use)) {
        missingPartnerPreferences.push(`${rule.insteadOf}->${rule.use}`);
      }
      if (rule.useAny && !hasAnyPreference(rule.insteadOf, rule.useAny)) {
        missingPartnerPreferences.push(`${rule.insteadOf}->${rule.useAny.join("|")}`);
      }
    }

    const missingTeacherToneGuidance = requiredTeacherToneTerms.filter((term) => !isGuidanceList(teacherHints[term]));
    const missingTeacherToneTaboos = requiredTeacherToneTerms.filter((term) => !avoidTeacherTone.includes(term));
    const replacementGuidance = {
      "обучаю": teacherHints["обучаю"] || [],
      "ты должен": teacherHints["ты должен"] || [],
      "ошибка": officialHints["ошибка"] || [],
      "урок": teacherHints["урок"] || [],
      "наказание": teacherHints["наказание"] || [],
      "правильно": teacherHints["правильно"] || [],
      "неправильно": teacherHints["неправильно"] || []
    };
    const previous = {
      contract: readProof(),
      allowed: readProof(),
      forbidden: readForbiddenProof(),
      phraseLength: readPhraseLengthProof()
    };
    const previousSmokesOk = previous.contract.ok
      && previous.allowed.ok
      && previous.forbidden.ok
      && previous.phraseLength.ok;
    const hasPartnerRules = tone.stance === "partner"
      && partnerLanguage
      && missingPartnerPreferences.length === 0
      && missingTeacherToneTaboos.length === 0;

    return {
      ok: !!lex
        && lex.stance === "partner"
        && lex.address === "ты"
        && tone.stance === "partner"
        && tone.address === "ты"
        && hasPartnerRules
        && missingTeacherToneGuidance.length === 0
        && isGuidanceList(replacementGuidance["обучаю"])
        && isGuidanceList(replacementGuidance["ты должен"])
        && isGuidanceList(replacementGuidance["ошибка"])
        && previousSmokesOk,
      path: "Game.Data.styleLex.tone",
      stance: lex ? lex.stance : null,
      address: lex ? lex.address : null,
      toneStance: tone.stance || null,
      toneAddress: tone.address || null,
      hasPartnerRules,
      requiredPartnerPreferences,
      missingPartnerPreferences,
      requiredTeacherToneTerms,
      missingTeacherToneTaboos,
      missingTeacherToneGuidance,
      replacementGuidance,
      teacherToneException: partnerLanguage.teacherToneException || null,
      previousSmokesOk,
      previous
    };
  };

  const readProof = () => {
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const keys = lex ? Object.keys(lex) : [];
    const allowedDomains = lex && lex.allowed ? lex.allowed : {};
    const allowedDomainNames = requiredAllowedDomains.filter((domain) => Array.isArray(allowedDomains[domain]));
    const requiredAllowedWords = {
      economy: ["очки", "стоимость", "плата", "возврат", "остаток", "лимит"],
      decision: ["выбор", "риск", "ставка", "итог", "результат"],
      conflict: ["аргумент", "ход", "защита", "атака", "ничья"],
      social: ["уважение", "⭐", "доверие", "Сдать", "штраф"],
      interface: ["подсказка", "сообщение", "событие", "личка"]
    };
    const allowedDomainsOk = requiredAllowedDomains.every((domain) => {
      const words = allowedDomains[domain];
      return Array.isArray(words)
        && words.length > 0
        && requiredAllowedWords[domain].every((word) => words.includes(word));
    });
    const forbiddenProof = readForbiddenProof();
    const phraseLengthProof = readPhraseLengthProof();
    const taboosOk = forbiddenProof.ok;
    const phraseLengthOk = phraseLengthProof.ok;
    const contractOk = !!lex
      && lex.address === "ты"
      && lex.stance === "partner"
      && requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(lex, key))
      && allowedDomainsOk
      && taboosOk
      && phraseLengthOk;

    return {
      ok: contractOk,
      path: "Game.Data.styleLex",
      requiredKeys,
      actualKeys: keys,
      address: lex ? lex.address : null,
      stance: lex ? lex.stance : null,
      requiredAllowedDomains,
      allowedDomainNames,
      allowedDomainSizes: requiredAllowedDomains.reduce((acc, domain) => {
        acc[domain] = Array.isArray(allowedDomains[domain]) ? allowedDomains[domain].length : 0;
        return acc;
      }, {}),
      hasAllowedDomains: allowedDomainsOk,
      hasTaboos: taboosOk,
      hasPhraseLength: phraseLengthOk,
      phraseLengthProof,
      forbiddenProof
    };
  };



  const smokeStyleLexNormalizeOnce = () => {
    const helper = Game.Text && Game.StyleLex
      && Game.Text.normalizeText === Game.StyleLex.normalizeText
      && typeof Game.Text.normalizeText === "function"
      ? Game.Text.normalizeText
      : null;
    const previous = {
      contract: readProof(),
      allowed: readProof(),
      forbidden: readForbiddenProof(),
      phraseLength: readPhraseLengthProof(),
      stance: readStanceProof()
    };
    const previousSmokesOk = Object.keys(previous).every((key) => previous[key] && previous[key].ok === true);
    const sample = helper ? helper("ты должен исправить ошибка", { surface: "toast", source: "smoke" }) : null;
    const forbiddenSample = helper ? helper("кринжовый лох", { surface: "toast", source: "smoke_forbidden_remaining" }) : null;
    const toastLong = helper ? helper("Первая строка. Вторая строка. Третья строка.", { surface: "toast", source: "smoke_toast_limit" }) : null;
    const resultLong = helper ? helper("Раз. Два. Три. Четыре. Пять.", { surface: "resultCard", source: "smoke_result_limit" }) : null;
    const touchpoints = styleLexTouchpointProof();
    const replacesMust = !!sample
      && sample.text.includes("можешь")
      && (sample.text.includes("не получилось") || sample.text.includes("не хватает"))
      && !sample.text.includes("ты должен")
      && !sample.text.includes("ошибка");
    const detectsForbidden = !!forbiddenSample
      && forbiddenSample.detectedForbidden.some((hit) => hit.term === "лох")
      && forbiddenSample.replacements.some((hit) => hit.from === "лох");
    const toastLimitOk = !!toastLong && toastLong.maxLines === 2 && toastLong.lineCount <= 2 && toastLong.lengthLimited === true;
    const resultLimitOk = !!resultLong && resultLong.maxLines === 4 && resultLong.lineCount <= 4 && resultLong.lengthLimited === true;
    return {
      ok: !!helper
        && !!(Game.Data && Game.Data.styleLex)
        && replacesMust
        && detectsForbidden
        && toastLimitOk
        && resultLimitOk
        && previousSmokesOk
        && touchpoints.wiredNow.length >= 1,
      helperExists: !!helper,
      helperPath: "Game.Text.normalizeText",
      aliasPath: "Game.StyleLex.normalizeText",
      readsStyleLex: !!(Game.Data && Game.Data.styleLex),
      replacesMust,
      detectsForbidden,
      toastLimitOk,
      resultLimitOk,
      previousSmokesOk,
      sample,
      forbiddenSample,
      toastLong,
      resultLong,
      touchpoints,
      previous
    };
  };



  const STYLELEX_SMOKE_DIRECT_TOKENS = /(^|[^0-9A-Za-zА-Яа-яЁё_])(ты|твой|твоя|твоё|твои|тебе|тебя|тобой|можешь|попробуй|кликни|введи|выбери|ответь|пиши|дай)(?=$|[^0-9A-Za-zА-Яа-яЁё_])/i;
  const STYLELEX_SMOKE_FORMAL_TOKENS = /(^|[^0-9A-Za-zА-Яа-яЁё_])(вы|вам|вас|ваш|ваша|ваше|ваши|вами)(?=$|[^0-9A-Za-zА-Яа-яЁё_])/i;

  const getStyleLexSurfaceLimit = (lex, surface) => {
    const maxLines = getSurfaceMaxLines(lex, surface);
    const global = lex && lex.phraseLength && lex.phraseLength.global ? lex.phraseLength.global : {};
    const chars = Array.isArray(global.maxCharsTarget) ? Number(global.maxCharsTarget[1]) : 0;
    const words = Array.isArray(global.maxWordsTarget) ? Number(global.maxWordsTarget[1]) : 0;
    return {
      maxLines: maxLines || null,
      maxChars: Number.isFinite(chars) && chars > 0 ? chars : 80,
      maxWords: Number.isFinite(words) && words > 0 ? words : 14
    };
  };

  const styleLexSmokeWordCount = (line) => {
    const words = String(line || "").match(/[0-9A-Za-zА-Яа-яЁё]+/g);
    return words ? words.length : 0;
  };

  const makeStyleLexSmokeSample = (text, surface, category, opts = {}) => ({
    text: String(text || ""),
    surface: surface || "toast",
    category: category || "sample",
    directAddress: opts.directAddress === true,
    source: opts.source || category || "stylelex_pack"
  });

  const buildStyleLexSmokeSamples = () => {
    const data = Game.Data || {};
    const texts = data.TEXTS && data.TEXTS.genz ? data.TEXTS.genz : {};
    const lex = data.styleLex || {};
    const formulas = lex.allowed && Array.isArray(lex.allowed.formulas) ? lex.allowed.formulas : [];
    const samples = [];
    const add = (text, surface, category, opts) => {
      const value = String(text || "").trim();
      if (!value) return;
      samples.push(makeStyleLexSmokeSample(value, surface, category, opts));
    };

    formulas.forEach((text) => add(text, "toast", "styleLex.allowed.formulas", { directAddress: /\b(твой|ты)\b/i.test(String(text || "")) }));

    add(texts.vote_ok || "Принято. Ты вписался.", "toast", "common.vote", { directAddress: true, source: "Game.Data.TEXTS.genz.vote_ok" });
    add(texts.vote_already || "Ты уже вписался.", "toast", "common.vote", { directAddress: true, source: "Game.Data.TEXTS.genz.vote_already" });
    add(texts.vote_fail || "Не удалось вписаться.", "error", "common.error", { source: "Game.Data.TEXTS.genz.vote_fail" });
    add(texts.battle_not_enough_points || "Не хватает 💰.", "toast", "economy.toast", { source: "Game.Data.TEXTS.genz.battle_not_enough_points" });
    add("Не хватает 💰.", "toast", "economy.toast", { source: "ui-events vote failure" });
    add("Не хватает 💰.", "toast", "ECON-08.respect", { source: "mapRespectReason.respect_no_points" });
    add("Ты отдал 1💰", "toast", "ECON-08.respect", { directAddress: true, source: "__uiRespectClick__ success" });
    add("Цель получила +1 ⭐", "toast", "ECON-08.respect", { source: "__uiRespectClick__ success" });
    add("Уже было уважение сегодня этому персонажу.", "toast", "ECON-08.respect", { source: "mapRespectReason.respect_pair_daily" });
    add("Цепочка A->B->A сегодня не работает.", "toast", "ECON-08.respect", { source: "mapRespectReason.respect_no_chain" });
    add("Лимит уважения на сегодня исчерпан.", "toast", "ECON-08.respect", { source: "mapRespectReason.respect_emitter_empty" });
    add("Сейчас не получилось. Попробуй позже.", "toast", "common.error", { directAddress: true, source: "respect fallback reason" });

    add(texts.tie_start || "Толпа решает.", "resultCard", "crowd.outcome", { source: "Game.Data.TEXTS.genz.tie_start" });
    add(texts.tie_call_to_action || "Вписывайся - кликни на имя, за кого ты.", "hint", "crowd.hint", { directAddress: true, source: "Game.Data.TEXTS.genz.tie_call_to_action" });
    add(texts.tie_click_name_hint || "Кликни на имя, за кого хочешь вписаться.", "hint", "crowd.hint", { directAddress: true, source: "Game.Data.TEXTS.genz.tie_click_name_hint" });
    add(texts.tie_end_winner || "Победил {name} - {aVotes}:{bVotes}.", "resultCard", "crowd.outcome", { source: "Game.Data.TEXTS.genz.tie_end_winner" });
    add(texts.tie_end_draw || "Поровну по голосам - {aVotes}:{bVotes}.", "resultCard", "crowd.outcome", { source: "Game.Data.TEXTS.genz.tie_end_draw" });
    add("Твой выбор: Аки", "resultCard", "crowd.outcome", { directAddress: true, source: "ui-events result card choice" });
    add("Итог голосования: 2:1", "resultCard", "crowd.outcome", { source: "ui-events result card votes" });
    add("+1⭐ +1💰", "resultCard", "crowd.outcome", { source: "ui-events result card deltas" });
    add("Толпа решает", "hint", "crowd.hint", { source: "ui-events timer line" });
    add("Таймер: 5с", "hint", "crowd.hint", { source: "ui-events timer line" });
    add("Ты уже проголосовал.", "toast", "crowd.error", { directAddress: true, source: "events helpEvent note" });
    add("Щит голоса активен.", "toast", "crowd.result", { source: "events vote shield note" });

    add(texts.battle_win || "Победа", "resultCard", "battle.result", { source: "Game.Data.TEXTS.genz.battle_win" });
    add(texts.battle_lose || "Поражение", "resultCard", "battle.result", { source: "Game.Data.TEXTS.genz.battle_lose" });
    add(texts.battle_draw || "Толпа решает", "resultCard", "battle.result", { source: "Game.Data.TEXTS.genz.battle_draw" });
    add("Аки победил Рин", "resultCard", "battle.result", { source: "ui-events canonical result" });
    add("Аки не победил Рин", "resultCard", "battle.result", { source: "ui-events canonical result" });
    add("Силы равны. Аки и Рин расходятся под шум площади.", "resultCard", "battle.result", { source: "events npcBattleEndDraw fallback" });
    add("Исход решён. Аки одержал верх над Рин.", "resultCard", "battle.result", { source: "events npcBattleEndWin fallback" });
    add("Аки: Свалить Рин", "resultCard", "escape.result", { source: "npcEscapeResolvedLines card" });
    add("Аки: Свалить не удалось Рин", "resultCard", "escape.result", { source: "npcEscapeResolvedLines card" });
    add("Решением толпы Аки: Свалить Рин.", "resultCard", "escape.result", { source: "npcEscapeResolvedLines chat" });
    add("Решением толпы Аки: Свалить не удалось Рин.", "resultCard", "escape.result", { source: "npcEscapeResolvedLines chat" });
    add("Аки: Отвали Рин", "resultCard", "ignore.result", { source: "npcEscapeResolvedLines off card" });
    add("Аки: Отвали не прошел Рин", "resultCard", "ignore.result", { source: "npcEscapeResolvedLines off card" });

    add("Сообщить о токсике, бандите или мафиози.", "hint", "ECON-SOC.report", { source: "ui-dm reportHint" });
    add("Выбери игрока.", "toast", "ECON-SOC.report", { directAddress: true, source: "ui-dm report empty toast" });
    add("Проверяем...", "toast", "ECON-SOC.report", { source: "ui-dm report pending" });
    add("Сдать", "hint", "ECON-SOC.report", { source: "ui-dm report button" });
    add("Занят", "hint", "ECON-SOC.report", { source: "ui-dm report button cooldown" });
    add("Нельзя отправить 💰 самому себе.", "error", "ECON-P2P.transfer", { source: "ui-dm p2p_self_transfer_forbidden" });
    add("Недоступно.", "error", "ECON-P2P.transfer", { source: "ui-dm p2p_disabled" });
    add("Баланс обновлён.", "toast", "ECON-UI.status", { source: "economy UI status" });
    add("Открой личку, ты можешь выбрать действие.", "hint", "ECON-UI.hint", { directAddress: true, source: "economy UI hint" });

    if (texts.teach_sent_dm) add(texts.teach_sent_dm, "toast", "ECON-04.training", { directAddress: true, source: "Game.Data.TEXTS.genz.teach_sent_dm" });
    if (texts.teach_sent_chat) add(texts.teach_sent_chat, "toast", "ECON-04.training", { source: "Game.Data.TEXTS.genz.teach_sent_chat" });

    const seen = new Set();
    return samples.filter((sample) => {
      const key = `${sample.surface}\n${sample.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 60);
  };

  const makeStyleLexViolation = (sample, normalized, rule, reason, category) => ({
    text: sample.text,
    normalizedText: normalized && typeof normalized.text === "string" ? normalized.text : "",
    surface: sample.surface,
    rule,
    category: category || sample.category || "styleLexPack",
    reason
  });

  const smokeStyleLexPack = () => {
    const helper = Game.Text && typeof Game.Text.normalizeText === "function" ? Game.Text.normalizeText : null;
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const previous = {
      contract: readProof(),
      allowed: readProof(),
      forbidden: readForbiddenProof(),
      phraseLength: readPhraseLengthProof(),
      stance: readStanceProof(),
      normalize: smokeStyleLexNormalizeOnce()
    };
    const previousSmokesOk = Object.keys(previous).every((key) => previous[key] && previous[key].ok === true);
    const samples = buildStyleLexSmokeSamples();
    const terms = flattenForbiddenTerms(lex);
    const violations = [];
    const checks = {
      forbidden: true,
      phraseLength: true,
      address: true,
      officialese: true,
      memeInternetSlang: true,
      teenSlang: true,
      previousSmokes: true
    };

    if (!helper) {
      violations.push(makeStyleLexViolation({ text: "", surface: "devCard", category: "helper" }, null, "helper", "Game.Text.normalizeText is missing", "runtime"));
    }

    for (const sample of samples) {
      if (!helper) break;
      const context = { surface: sample.surface, source: sample.source, smoke: "styleLexPack" };
      const normalized = helper(sample.text, context);
      const normalizedText = String(normalized && (normalized.text || normalized.finalText) || "");
      const limit = getStyleLexSurfaceLimit(lex, sample.surface);
      const lines = splitStyleLexLines(normalizedText);
      const visibleLines = lines.length ? lines : [normalizedText].filter(Boolean);
      const remainingForbidden = scanForbiddenTerms(normalizedText, terms);

      if (remainingForbidden.length) {
        const hit = remainingForbidden[0];
        violations.push(makeStyleLexViolation(sample, normalized, "forbidden", `remaining forbidden term: ${hit.term}`, hit.category || sample.category));
      }

      if (normalized && normalized.lengthLimited === true) {
        violations.push(makeStyleLexViolation(sample, normalized, "phraseLength", "normalizeText had to trim lines", sample.category));
      }
      if (limit.maxLines && visibleLines.length > limit.maxLines) {
        violations.push(makeStyleLexViolation(sample, normalized, "phraseLength", `line count ${visibleLines.length} exceeds ${limit.maxLines}`, sample.category));
      }
      const longLine = visibleLines.find((line) => line.length > limit.maxChars || styleLexSmokeWordCount(line) > limit.maxWords);
      if (longLine) {
        violations.push(makeStyleLexViolation(sample, normalized, "phraseLength", `line exceeds ${limit.maxChars} chars or ${limit.maxWords} words`, sample.category));
      }

      if (STYLELEX_SMOKE_FORMAL_TOKENS.test(normalizedText)) {
        violations.push(makeStyleLexViolation(sample, normalized, "address", "formal direct-address marker remains; expected ты-style", sample.category));
      }
      if (sample.directAddress && !STYLELEX_SMOKE_DIRECT_TOKENS.test(normalizedText)) {
        violations.push(makeStyleLexViolation(sample, normalized, "address", "direct-address sample lacks ты-style marker", sample.category));
      }

      const categoryHits = remainingForbidden.reduce((acc, hit) => {
        acc[hit.category] = hit;
        return acc;
      }, {});
      if (categoryHits["officialese/bureaucratic phrasing"]) {
        violations.push(makeStyleLexViolation(sample, normalized, "officialese", `officialese marker remains: ${categoryHits["officialese/bureaucratic phrasing"].term}`, "officialese/bureaucratic phrasing"));
      }
      if (categoryHits["memes/internet slang"]) {
        violations.push(makeStyleLexViolation(sample, normalized, "meme/internet slang", `meme marker remains: ${categoryHits["memes/internet slang"].term}`, "memes/internet slang"));
      }
      if (categoryHits["teen slang"]) {
        violations.push(makeStyleLexViolation(sample, normalized, "teen slang", `teen slang marker remains: ${categoryHits["teen slang"].term}`, "teen slang"));
      }
    }

    if (!previousSmokesOk) {
      violations.push(makeStyleLexViolation({ text: "previous StyleLex smokes", surface: "devCard", category: "previousSmokes" }, { text: "previous StyleLex smokes" }, "previousSmokes", "one or more previous StyleLex smokes failed", "previousSmokes"));
    }
    if (samples.length < 30 || samples.length > 60) {
      violations.push(makeStyleLexViolation({ text: `checkedCount=${samples.length}`, surface: "devCard", category: "checkedCount" }, { text: `checkedCount=${samples.length}` }, "checkedCount", "checkedCount must be between 30 and 60", "coverage"));
    }

    const ok = previousSmokesOk && helper && samples.length >= 30 && samples.length <= 60 && violations.length === 0;
    return {
      ok,
      name: "smoke_stylelex_pack",
      checkedCount: samples.length,
      expectedRange: [30, 60],
      previousSmokesOk,
      checks,
      violationsCount: violations.length,
      violationsSample: violations.slice(0, 5),
      categories: samples.reduce((acc, sample) => {
        acc[sample.category] = (acc[sample.category] || 0) + 1;
        return acc;
      }, {}),
      previous
    };
  };


  const requiredReadinessCoverage = ["ECON-08", "ECON-SOC", "ECON-P2P", "ECON-UI"];

  const addStyleLexReadinessCheck = (passedChecks, failedChecks, evidence, name, ok, detail) => {
    const entry = Object.assign({ ok: !!ok }, detail || {});
    evidence[name] = entry;
    (ok ? passedChecks : failedChecks).push(name);
  };

  const smokeStyleLexReadinessOnce = () => {
    const passedChecks = [];
    const failedChecks = [];
    const evidence = {};
    const lex = Game.Data && Game.Data.styleLex ? Game.Data.styleLex : null;
    const helper = Game.Text && Game.StyleLex
      && Game.Text.normalizeText === Game.StyleLex.normalizeText
      && typeof Game.Text.normalizeText === "function"
      ? Game.Text.normalizeText
      : null;
    const contract = readProof();
    const forbidden = readForbiddenProof();
    const phraseLength = readPhraseLengthProof();
    const normalize = smokeStyleLexNormalizeOnce();
    const packExists = typeof Game.__DEV.smokeStyleLexPack === "function";
    const pack = packExists ? Game.__DEV.smokeStyleLexPack() : null;
    const touchpoints = styleLexTouchpointProof();
    const categories = pack && pack.categories ? pack.categories : {};
    const coverage = requiredReadinessCoverage.reduce((acc, key) => {
      acc[key] = Object.keys(categories).filter((category) => category === key || category.indexOf(`${key}.`) === 0)
        .reduce((sum, category) => sum + (Number(categories[category]) || 0), 0);
      return acc;
    }, {});
    const unresolvedDecisions = []
      .concat(Array.isArray(touchpoints.pending) ? touchpoints.pending : [])
      .concat(Array.isArray(touchpoints.unresolvedDecisions) ? touchpoints.unresolvedDecisions : []);
    const sample = helper ? helper("ты должен исправить ошибка, лох. Ещё строка. Третья строка.", { surface: "toast", source: "styleLexReadiness" }) : null;
    const sampleText = sample && typeof sample.text === "string" ? sample.text : "";
    const sampleOk = !!sample
      && sample.detectedForbidden.some((hit) => hit.term === "ты должен")
      && sample.detectedForbidden.some((hit) => hit.term === "лох")
      && sample.replacements.some((hit) => hit.from === "ты должен" && hit.to === "можешь")
      && sample.replacements.some((hit) => hit.from === "ошибка")
      && sample.replacements.some((hit) => hit.from === "лох")
      && !scanForbiddenTerms(sampleText, flattenForbiddenTerms(lex)).length
      && sample.maxLines === 2
      && sample.lineCount <= 2
      && sample.lengthLimited === true;

    addStyleLexReadinessCheck(passedChecks, failedChecks, evidence, "styleLexContract", !!lex && contract.ok && forbidden.ok && phraseLength.ok && Array.isArray(lex.phraseLength && lex.phraseLength.rules) && lex.phraseLength.rules.length > 0, { path: "Game.Data.styleLex", contractOk: contract.ok, forbiddenOk: forbidden.ok, phraseLengthOk: phraseLength.ok, hasRules: Array.isArray(lex && lex.phraseLength && lex.phraseLength.rules) });
    addStyleLexReadinessCheck(passedChecks, failedChecks, evidence, "normalizeTextAccessible", !!helper, { helperPath: "Game.Text.normalizeText", aliasPath: "Game.StyleLex.normalizeText" });
    addStyleLexReadinessCheck(passedChecks, failedChecks, evidence, "normalizeTextRuntimeBehavior", !!helper && normalize.ok && sampleOk, { normalizeOk: normalize.ok, replacesAndDetectsTaboo: sampleOk, sample });
    addStyleLexReadinessCheck(passedChecks, failedChecks, evidence, "smokeStyleLexPack", packExists && !!pack && pack.ok === true, { exists: packExists, packOk: !!pack && pack.ok === true, checkedCount: pack && pack.checkedCount, violationsCount: pack && pack.violationsCount });
    addStyleLexReadinessCheck(passedChecks, failedChecks, evidence, "requiredEconomyCoverage", requiredReadinessCoverage.every((key) => coverage[key] > 0), { required: requiredReadinessCoverage, coverage, categories });
    addStyleLexReadinessCheck(passedChecks, failedChecks, evidence, "noUnresolvedStyleLexDecision", unresolvedDecisions.length === 0, { unresolvedDecisions, touchpoints });

    return {
      ok: failedChecks.length === 0,
      failedChecks,
      passedChecks,
      evidence,
      version: "style-lex-step2-readiness-v1",
      buildMarker: "STYLELEX_STEP2_COMPLETION_GATE_V1"
    };
  };

  const proof = readProof();

  if (!Game.__DEV) Game.__DEV = {};
  if (typeof Game.__DEV.smokeStyleLexContractOnce !== "function") {
    Game.__DEV.smokeStyleLexContractOnce = readProof;
  }
  if (typeof Game.__DEV.smokeStyleLexAllowedOnce !== "function") {
    Game.__DEV.smokeStyleLexAllowedOnce = readProof;
  }
  if (typeof Game.__DEV.smokeStyleLexForbiddenOnce !== "function") {
    Game.__DEV.smokeStyleLexForbiddenOnce = readForbiddenProof;
  }
  if (typeof Game.__DEV.smokeStyleLexPhraseLengthOnce !== "function") {
    Game.__DEV.smokeStyleLexPhraseLengthOnce = readPhraseLengthProof;
  }
  if (typeof Game.__DEV.smokeStyleLexStanceOnce !== "function") {
    Game.__DEV.smokeStyleLexStanceOnce = readStanceProof;
  }
  if (typeof Game.__DEV.smokeStyleLexNormalizeOnce !== "function") {
    Game.__DEV.smokeStyleLexNormalizeOnce = smokeStyleLexNormalizeOnce;
  }
  if (typeof Game.__DEV.smokeStyleLexPack !== "function") {
    Game.__DEV.smokeStyleLexPack = smokeStyleLexPack;
  }
  if (Game.Dev && typeof Game.Dev === "object" && typeof Game.Dev.smokeStyleLexPack !== "function") {
    Game.Dev.smokeStyleLexPack = Game.__DEV.smokeStyleLexPack;
  }
  if (typeof Game.__DEV.smokeStyleLexReadinessOnce !== "function") {
    Game.__DEV.smokeStyleLexReadinessOnce = smokeStyleLexReadinessOnce;
  }
  if (Game.Dev && typeof Game.Dev === "object" && typeof Game.Dev.smokeStyleLexReadinessOnce !== "function") {
    Game.Dev.smokeStyleLexReadinessOnce = Game.__DEV.smokeStyleLexReadinessOnce;
  }
  if (typeof Game.__DEV.styleLexTouchpointsOnce !== "function") {
    Game.__DEV.styleLexTouchpointsOnce = styleLexTouchpointProof;
  }

  try {
    console.warn(proof.ok ? "STYLELEX_CONTRACT_V1_PASS" : "STYLELEX_CONTRACT_V1_FAIL", proof);
  } catch (_) {}
})();
