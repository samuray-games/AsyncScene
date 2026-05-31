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
      social: ["уважение", "репутация", "доверие", "донос", "штраф"],
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
      social: ["уважение", "репутация", "доверие", "донос", "штраф"],
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

  try {
    console.warn(proof.ok ? "STYLELEX_CONTRACT_V1_PASS" : "STYLELEX_CONTRACT_V1_FAIL", proof);
  } catch (_) {}
})();
