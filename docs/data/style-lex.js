// data/style-lex.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  const Data = Game.Data || (Game.Data = {});

  const styleLex = {
    version: "style-lex-runtime-contract-v1",
    address: "ты",
    stance: "partner",
    phraseLength: {
      min: 1,
      max: 2,
      unit: "short phrases",
      rules: [
        "Пиши 1-2 короткие фразы.",
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
        "ты должен": ["можно", "выбери"],
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

  const isGuidanceList = (value) => Array.isArray(value)
    && value.length >= 1
    && value.length <= 2
    && value.every((hint) => typeof hint === "string" && hint.trim().length > 0);

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
    const taboosOk = forbiddenProof.ok;
    const contractOk = !!lex
      && lex.address === "ты"
      && lex.stance === "partner"
      && requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(lex, key))
      && allowedDomainsOk
      && taboosOk;

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

  try {
    console.warn(proof.ok ? "STYLELEX_CONTRACT_V1_PASS" : "STYLELEX_CONTRACT_V1_FAIL", proof);
  } catch (_) {}
})();
