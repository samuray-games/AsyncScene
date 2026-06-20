// npcs.js
window.Game ||= {};

(() => {
  const NPC = {};

  NPC.seedPlayers = (State) => {
    if (!State) return;
    if (!State.players) State.players = {};
    if (State._seededNPCs) return;

    const D0 = Game.Data || {};
    const cir = !!(D0 && D0.CIRCULATION_ENABLED === true);
    const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 10;
    const devSim = (typeof window !== "undefined" && window.DEV_SIM_NPCS === true);

    NPC.PLAYERS.forEach(p => {
      if (!State.players[p.id]) {
        State.players[p.id] = {
          id: p.id,
          name: p.name,
          influence: p.influence || 0,
          role: p.role || "crowd",
          sex: p.sex || "u", // m/f/u
          points: (devSim && !cir) ? 999 : startNpc,
          wins: 0,
          npc: true,
          meta: { ...p }
        };
      } else {
        const ex = State.players[p.id];
        if (!ex.sex) ex.sex = p.sex || "u";
        if (!ex.meta) ex.meta = { ...p };
        if (typeof ex.points !== "number") ex.points = (devSim && !cir) ? 999 : startNpc;
      }
    });

    State._seededNPCs = true;
  };

  NPC.PLAYERS = [
    { id:"npc_weak",    name:"Слабак",   influence:1,  role:"crowd",  sex:"m" },
    { id:"npc_sad",     name:"Грустный", influence:2,  role:"crowd",  sex:"m" },
    { id:"npc_meme",    name:"Мемолог",  influence:3,  role:"crowd",  sex:"m" },
    { id:"npc_rin",     name:"Рин",      influence:4,  role:"crowd",  sex:"f" },
    { id:"npc_troll",   name:"Троль",    influence:5,  role:"crowd",  sex:"m" },
    { id:"npc_hot",     name:"Горячий",  influence:7,  role:"crowd",  sex:"m" },
    { id:"npc_yuna",    name:"Юна",      influence:9,  role:"crowd",  sex:"f" },
    { id:"npc_queen",   name:"Королева", influence:12, role:"crowd",  sex:"f" },
    { id:"npc_veteran", name:"Ветеран",  influence:15, role:"crowd",  sex:"m" },

    { id:"npc_toxic",   name:"Слава",    influence:20,  role:"toxic",  sex:"m", steals:3 },
    { id:"npc_toxic2",  name:"Глеб",     influence:18,  role:"toxic",  sex:"m" },
    { id:"npc_toxic3",  name:"Ксю",      influence:16,  role:"toxic",  sex:"f" },
    { id:"npc_bandit",  name:"Олег",     influence:24,  role:"bandit", sex:"m", trap:true },
    { id:"npc_bandit2", name:"Егор",     influence:22,  role:"bandit", sex:"m" },
    { id:"npc_bandit3", name:"Макс",     influence:26,  role:"bandit", sex:"m" },

    // authority roles
    { id:"npc_cop_v",   name:"Владимир Иванович", influence:18,  role:"cop", sex:"m" },
    { id:"npc_cop_k",   name:"Кирилл Олегович",   influence:18,  role:"cop", sex:"m" },
    { id:"npc_cop_a",   name:"Алексей Петрович",  influence:18,  role:"cop", sex:"m" },

    { id:"npc_mafia",   name:"Аркадий Петрович",  influence:35, role:"mafia",  sex:"m", noInsult:true },
  ];

  // Chat style rules for NPC lines:
  // - no uppercase
  // - no trailing dots
  // - avoid gendered past-tense constructions by keeping lines in present/imperative

  // Cop messages are NOT NPC-chat-style. They must keep ideal punctuation and capitalization.
  // These lines are intended for DM and occasional public notices.
  const normalizeCopLine = (s) => {
    const raw = (s == null) ? "" : String(s);
    let t = raw.replace(/\s+/g, " ").trim();
    if (!t) return "";
    // Ensure the first letter is uppercase if it's Cyrillic/Latin.
    t = t.charAt(0).toUpperCase() + t.slice(1);
    // Ensure ending punctuation.
    if (!/[.!?]$/.test(t)) t += ".";
    return t;
  };
  const normalizeLine = (s) => {
    const raw = (s == null) ? "" : String(s);
    let t = raw.trim();

    t = t.toLowerCase();
    // Allow ? ! ) but remove dots
    t = t.replace(/[.]+/g, "");
    // Trim trailing commas/colons/semicolons
    t = t.replace(/[,;:]+$/g, "");
    // Collapse whitespace
    t = t.replace(/\s+/g, " ").trim();

    return t;
  };

  // Preserve punctuation for lines that contain mentions (requirement).
  const normalizeLineKeepPunct = (s) => {
    const raw = (s == null) ? "" : String(s);
    let t = raw.trim();
    const mentions = [];
    t = t.replace(/@[A-Za-zА-Яа-я0-9_\-]+/g, (m) => {
      mentions.push(m);
      return `__mention_${mentions.length - 1}__`;
    });
    t = t.toLowerCase();
    // Allow ? ! ) but remove dots
    t = t.replace(/[.]+/g, "");
    t = t.replace(/[,;:]+$/g, "");
    t = t.replace(/\s+/g, " ").trim();
    t = t.replace(/__mention_(\d+)__/gi, (_, idx) => mentions[Number(idx)] || "");
    return t;
  };

  const nameMention = (p) => {
    if (!p || !p.name) return "";
    return `@${String(p.name)}`;
  };

  const pickOne = (arr) => {
    if (!arr || !arr.length) return "";
    if (Game.Data && typeof Game.Data.pick === "function") return Game.Data.pick(arr);
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const escapeRe = (s) => String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const randomOtherNpc = (excludeId) => {
    const pool = NPC.getAll().filter(x => x && x.id !== excludeId);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  };

  const meNameMention = () => {
    try {
      const me = Game.__S && Game.__S.me;
      return me && me.name ? `@${String(me.name)}` : "ты";
    } catch (_) {
      return "ты";
    }
  };

  NPC.SAY = {
    toxic: {
      m: [
        "слабый ход",
        "отвечай сейчас",
        "не прячься",
        "жестче, без ухода",
        "давление рядом",
        "тонко, почти",
        "слабость видна",
        "говори резче",
        "ответ не держит",
        "позиция трещит"
      ],
      f: [
        "слабый ход",
        "отвечай сейчас",
        "не прячься",
        "жестче, без ухода",
        "позиция трещит"
      ]
    },
    bandit: {
      m: [
        "кошелек ближе",
        "плати и уходи",
        "стой, без фокусов",
        "дело простое",
        "торга нет",
        "налом проще",
        "ход дешевле молча",
        "время стоит денег",
        "шаг назад, руки видно",
        "выход дешевле",
        "решай быстро",
        "сопротивление дороже"
      ],
      f: [
        "кошелек ближе",
        "плати и уходи",
        "стой, без фокусов",
        "дело простое",
        "торга нет",
        "дважды не говорю",
        "проверка дорогая",
        "решай быстро",
        "предупреждаю раз",
        "время стоит денег"
      ]
    },
    cop: {
      m: [
        "Принято",
        "Фиксирую конфликт",
        "Порядок рядом",
        "Без эскалации",
        "Заявление принято"
      ],
      f: [
        "Принято. Дистанция.",
        "Фиксирую конфликт",
        "Порядок рядом",
        "Без эскалации",
        "Заявление принято"
      ]
    },
    mafia: {
      m: [
        "Пауза",
        "Шум дорог",
        "След лишний",
        "Решим спокойно",
        "Без свидетелей",
        "Слово взвешено",
        "Долг помнит"
      ],
      f: [
        "Тише",
        "Шум дорог",
        "След лишний",
        "Решим спокойно",
        "Без свидетелей",
        "Слово взвешено",
        "Долг помнит"
      ]
    },
    crowd: {
      m: [
        "Голос",
        "что сейчас было?",
        "площадь гудит",
        "народ ожил",
        "зал гудит"
      ],
      f: [
        "ого",
        "что сейчас было?",
        "площадь гудит",
        "народ ожил",
        "зал гудит"
      ]
    }
  };

  NPC.DM_PROFILE_LINES = {
    cop: [
      "Принято. Рядом",
      "Держи дистанцию.",
      "Вижу сигнал.",
      "Без резких движений.",
      "Пиши, если давят."
    ],
    mafia: [
      "Пауза",
      "Шум лишний.",
      "Без свидетелей.",
      "Счет помню.",
      "Говори спокойно."
    ],
    bandit: [
      "Кошелек ближе.",
      "Плати и иди.",
      "Стой без фокусов.",
      "Торга нет.",
      "Решай быстро."
    ],
    toxic: [
      "Слабый ход.",
      "Отвечай.",
      "Не прячься.",
      "Позиция трещит.",
      "Скажи жестче."
    ],
    neutral: [
      "Вижу тему.",
      "Смотрю со стороны.",
      "Стало шумно.",
      "Понял тебя.",
      "Без давления."
    ]
  };

  NPC.SAY_PROFILE_TEXTS = {
    millennial: NPC.SAY,
    zoomer: {
      toxic: {
        m: [
          "слабовато",
          "ответ не держит",
          "не уходи в туман",
          "жестче давай",
          "давление пошло",
          "почти, но нет",
          "уверенность просела",
          "говори резче",
          "ход развалился",
          "позиция хрустит"
        ],
        f: [
          "слабовато",
          "ответ не держит",
          "не уходи в туман",
          "жестче давай",
          "позиция хрустит"
        ]
      },
      bandit: {
        m: [
          "кошелек сюда",
          "плати и вышел",
          "стой ровно",
          "без фокусов",
          "торга ноль",
          "нал проще",
          "молчать дешевле",
          "время тикает",
          "руки на виду",
          "выход платный",
          "решай быстро",
          "сопротивляться дороже"
        ],
        f: [
          "кошелек сюда",
          "плати и вышла",
          "стой ровно",
          "без фокусов",
          "торга ноль",
          "дважды не пишу",
          "проверка платная",
          "решай быстро",
          "одно предупреждение",
          "время тикает"
        ]
      },
      cop: {
        m: [
          "Принято. Держи дистанцию",
          "Конфликт вижу",
          "Порядок рядом",
          "Не разгоняй",
          "Сигнал принят"
        ],
        f: [
          "Принято. Держи дистанцию",
          "Конфликт вижу",
          "Порядок рядом",
          "Не разгоняй",
          "Сигнал принят"
        ]
      },
      mafia: {
        m: [
          "Тише",
          "Шум дорого стоит",
          "След лишний",
          "Решим без шума",
          "Свидетели лишние",
          "Слово взвешено",
          "Долг помнит"
        ],
        f: [
          "Тише",
          "Шум дорого стоит",
          "След лишний",
          "Решим без шума",
          "Свидетели лишние",
          "Слово взвешено",
          "Долг помнит"
        ]
      },
      crowd: {
        m: [
          "ого",
          "что это было?",
          "площадь шумит",
          "народ проснулся",
          "зал загудел"
        ],
        f: [
          "ого",
          "что это было?",
          "площадь шумит",
          "народ проснулся",
          "зал загудел"
        ]
      }
    }
  };

  NPC.DM_PROFILE_TEXTS = {
    millennial: NPC.DM_PROFILE_LINES,
    zoomer: {
      cop: [
        "Принято. Я рядом.",
        "Держи дистанцию.",
        "Сигнал вижу.",
        "Без резких движений.",
        "Пиши коротко."
      ],
      mafia: [
        "Тише. Решим.",
        "Шум лишний.",
        "Свидетели лишние.",
        "Счет помню.",
        "Говори ровно."
      ],
      bandit: [
        "Кошелек ближе.",
        "Плати и иди.",
        "Стой без фокусов.",
        "Торга ноль.",
        "Решай быстро."
      ],
      toxic: [
        "Слабовато.",
        "Ответь нормально.",
        "Не прячься.",
        "Позиция хрустит.",
        "Жестче скажи."
      ],
      neutral: [
        "Вижу тему.",
        "Смотрю рядом.",
        "Стало шумно.",
        "Понял.",
        "Без давления."
      ]
    }
  };

  const resolveNpcUiProfile = () => {
    const D = Game.Data || {};
    const rawProfile = typeof D.getUiProfile === "function"
      ? D.getUiProfile()
      : (typeof D.normalizeUiProfile === "function"
        ? D.normalizeUiProfile(D.UI_PROFILE)
        : String(D.UI_PROFILE || "").trim().toLowerCase());
    const profile = String(rawProfile || "").trim().toLowerCase();
    return profile === "zoomer" || profile === "alpha" ? "zoomer" : "millennial";
  };

  const pickProfileLines = (profileMap, fallback, role, sex) => {
    const profile = resolveNpcUiProfile();
    const profileBucket = profileMap && profileMap[profile];
    const fallbackBucket = fallback && fallback[profile === "zoomer" ? "zoomer" : "millennial"];
    const choose = (bucket) => {
      if (!bucket) return "";
      if (Array.isArray(bucket)) return pickOne(bucket);
      const roleBucket = bucket[role];
      if (Array.isArray(roleBucket)) return pickOne(roleBucket);
      if (roleBucket && typeof roleBucket === "object") return pickBySex(roleBucket, sex);
      return "";
    };
    const picked = choose(profileBucket);
    if (picked) return picked;
    const fallbackPicked = choose(fallbackBucket);
    if (fallbackPicked) return fallbackPicked;
    return "";
  };

  const pickBySex = (block, sex) => {
    if (!block) return "";
    const s = (sex === "f" || sex === "m") ? sex : "m";
    const arr = block[s] || block.m || [];
    return pickOne(arr);
  };

  const pickWeightedPlayer = (list) => {
    if (!list || !list.length) return null;
    if (Game.Util && typeof Game.Util.pickWeighted === "function") {
      return Game.Util.pickWeighted(list);
    }
    // Fallback weighted pick
    let sum = 0;
    for (const x of list) sum += Math.max(0, x.weight|0);
    if (sum <= 0) return list[0].item || list[0];
    let r = Math.random() * sum;
    for (const x of list) {
      r -= Math.max(0, x.weight|0);
      if (r <= 0) return x.item || x;
    }
    return (list[list.length - 1].item || list[list.length - 1]);
  };

  const roleWeight = (p, mode) => {
    // mode: "chat" | "battle"
    if (!p) return 1;
    if (p.role === "toxic") return (mode === "battle") ? 6 : 4; // токсик активнее
    if (p.role === "bandit") return (mode === "battle") ? 3 : 2;
    if (p.role === "cop") return 0.33; // ~3x rarer than normal NPCs
    if (p.role === "mafia") return (mode === "battle") ? 0 : 0.12; // appears very rarely, never initiates battles
    return 1;
  };

  NPC.getAll = () => {
    const S = Game.__S;
    if (!S || !S.players) return [];
    return Object.values(S.players).filter(p => p.npc === true);
  };

  NPC.getById = (id) => {
    const S = Game.__S;
    if (!S || !S.players) return null;
    return S.players[id] || null;
  };

  NPC.randomAny = () => {
    const all = NPC.getAll();
    return all.length ? all[Math.floor(Math.random() * all.length)] : null;
  };

  // Biased pickers for behavior loops (do NOT use these for crowd voting)
  NPC.randomForChat = (opts = {}) => {
    const collector = (opts && typeof opts === "object" && opts.diag && typeof opts.diag === "object") ? opts.diag : null;
    const all = NPC.getAll();
    const excludeRoles = [];
    if (opts && opts.excludeRole) excludeRoles.push(String(opts.excludeRole).toLowerCase());
    if (opts && Array.isArray(opts.excludeRoles)) {
      opts.excludeRoles.forEach(r => {
        if (r == null) return;
        excludeRoles.push(String(r).toLowerCase());
      });
    }
    const filtered = [];
    for (const p of all) {
      if (!p) continue;
      const role = String(p.role || "").toLowerCase();
      if (excludeRoles.length && excludeRoles.includes(role)) continue;
      filtered.push({ item: p, weight: roleWeight(p, "chat") });
    }
    if (!filtered.length) return null;

    const S = (Game && (Game.__S || Game.State)) ? (Game.__S || Game.State) : null;
    if (S && typeof S === "object" && !S.npc) S.npc = {};
    const npcState = (S && S.npc) ? S.npc : null;
    if (npcState && typeof npcState.copQuotaReady !== "boolean") npcState.copQuotaReady = false;
    const prevBudget = (npcState && Number.isFinite(npcState.copBudget)) ? npcState.copBudget : 0;
    const quota = (Game && Game.Config && Number.isFinite(Game.Config.copQuota)) ? Game.Config.copQuota : (1 / 11);
    const beforeBudget = prevBudget;
    const baseBudget = Math.min(1, prevBudget + quota);
    const allowCop = baseBudget >= 1.0;

    const cops = [];
    const others = [];
    for (const entry of filtered) {
      if (!entry || !entry.item) continue;
      const role = String(entry.item.role || "").toLowerCase();
      if (role === "cop") cops.push(entry);
      else others.push(entry);
    }

    const hasCops = cops.length > 0;
    let forceCopSelection = false;
    if (npcState && allowCop && hasCops) {
      if (!npcState.copQuotaReady) {
        npcState.copQuotaReady = true;
      }
      forceCopSelection = !!npcState.copQuotaReady;
    }
    if (collector) {
      collector.allowCopTrue = allowCop;
      collector.buildTag = (Game && Game.__DEV && Game.__DEV["DEV_CHECKS_BUILD_TAG_V5"]) ? Game.__DEV["DEV_CHECKS_BUILD_TAG_V5"]
        : ((Game && Game.__DEV && Game.__DEV.buildTag) ? Game.__DEV.buildTag : (window && window.__BUILD_TAG) ? window.__BUILD_TAG : null);
      collector.fileMarker = "NPC.randomForChat@COP_BUDGET_V3";
      collector.budgetBefore = beforeBudget;
      collector.candidatesRoleCounts = {
        cop: cops.length,
        nonCop: others.length,
      };
      collector.usedAuthorSelector = collector.fileMarker;
      collector.forceCopSelection = forceCopSelection;
      collector.copQuotaReady = npcState ? !!npcState.copQuotaReady : false;
    }

    let list = [];
    let fallback = false;
    if (forceCopSelection && hasCops) {
      list = cops.map(entry => ({ item: entry.item, weight: 1 }));
    } else if (allowCop) {
      list = others.concat(cops.map(entry => ({ item: entry.item, weight: 1 })));
    } else {
      list = others.slice();
    }
    if (!list.length && cops.length) {
      list = cops.slice();
      fallback = true;
    }
    if (!list.length) {
      return null;
    }

    if (fallback) {
      try {
        if (Game && Game.__DEV) {
          Game.__DEV.__publicChatCopQuotaNotes ||= [];
          Game.__DEV.__publicChatCopQuotaNotes.push("cop_fallback_only_cops");
        }
      } catch (_) {}
      try { console.warn("cop_fallback_only_cops"); } catch (_) {}
    }

    const totalWeights = { cop: 0, nonCop: 0 };
    for (const entry of list) {
      if (!entry) continue;
      const role = String(entry.item.role || "").toLowerCase();
      const w = Number.isFinite(entry.weight) ? entry.weight : 0;
      if (role === "cop") totalWeights.cop += w;
      else totalWeights.nonCop += w;
    }
    if (collector) {
      collector.finalPoolRoleCounts = {
        cop: cops.length,
        nonCop: others.length,
      };
      collector.totalWeightByRole = totalWeights;
    }
    const selected = pickWeightedPlayer(list);
    if (!npcState) {
      // ensure storage exists so we can keep tracking next time
      if (S) S.npc ||= {};
    }
    if (selected) {
      const isCopSelected = (selected && String(selected.role || "").toLowerCase() === "cop");
      const nextBudget = isCopSelected ? Math.max(0, baseBudget - 1) : baseBudget;
      if (npcState) {
        npcState.copBudget = nextBudget;
        if (isCopSelected) {
          npcState.copQuotaReady = false;
        }
      } else if (S && S.npc) {
        S.npc.copBudget = nextBudget;
      }
      if (collector) {
        collector.budgetAfter = nextBudget;
        collector.selectedRoleCounts = {
          cop: isCopSelected ? 1 : 0,
          nonCop: isCopSelected ? 0 : 1,
        };
        collector.copSelected = isCopSelected;
        if (fallback) collector.note = "cop_fallback_only_cops";
      }
    } else {
      if (collector) {
        collector.budgetAfter = (npcState && Number.isFinite(npcState.copBudget)) ? npcState.copBudget : baseBudget;
        collector.selectedRoleCounts = { cop: 0, nonCop: 0 };
      }
    }

    // author selection point (Web/npcs.js · NPC.randomForChat)
    return selected;
  };

  NPC.randomForBattle = () => {
    const pool = NPC.getAll().filter(p => {
      if (!p) return false;
      if (p.role === "cop" || p.role === "mafia") return false;
      try {
        if (Game.__A && typeof Game.__A.isNpcJailed === "function" && Game.__A.isNpcJailed(p.id)) return false;
      } catch (_) {}
      return true;
    });
    const list = pool.map(p => ({ item: p, weight: roleWeight(p, "battle") }));
    return pickWeightedPlayer(list);
  };

  NPC.randomNonCop = () => {
    return NPC.randomForBattle();
  };

  NPC.allowedColorsForInfluence = (inf, role) => {
    // Variant 2: tone guard is derived ONLY from tierKeysByInfluence (via Data.allowedColorsByInfluence).
    // Rule: "k" (black) is allowed ONLY for mafia.
    const v = (inf || 0);
    const r = (role != null) ? String(role) : "";
    try {
      if (Game && Game.Data && typeof Game.Data.allowedColorsByInfluence === "function") {
        const arr = Game.Data.allowedColorsByInfluence(v, r) || [];
        return new Set(Array.isArray(arr) ? arr : [arr]);
      }
    } catch (_) {}
    // Fallback if Data is missing: never allow k without explicit mafia role.
    return new Set([String(r || "").toLowerCase() === "mafia" ? "k" : "y"]);
  };

  NPC.pickAttack = (inf, role) => {
    // Prefer ARGUMENTS (new), fallback to PHRASES (old) for safety.
    const src = (Game.Data && Game.Data.ARGUMENTS) ? Game.Data.ARGUMENTS
              : (Game.Data && Game.Data.PHRASES)   ? Game.Data.PHRASES
              : null;
    if (!src || !Array.isArray(src.attack)) return null;

    const allowed = NPC.allowedColorsForInfluence(inf, role);

    // If we are on old data (yellow/orange/red/black), map to new codes.
    const normalize = (c) => {
      if (!c) return "y";
      if (c === "yellow") return "y";
      if (c === "orange") return "o";
      if (c === "red") return "r";
      if (c === "black") return "k";
      return c; // already y/o/r/k
    };

    const all = src.attack.filter(a => allowed.has(normalize(a.color)));
    return all.length ? Game.Data.pick(all) : null;
  };

  NPC.pickDefense = (inf, role) => {
    const src = (Game.Data && Game.Data.ARGUMENTS) ? Game.Data.ARGUMENTS
              : (Game.Data && Game.Data.PHRASES)   ? Game.Data.PHRASES
              : null;
    if (!src || !Array.isArray(src.defense)) return null;

    const allowed = NPC.allowedColorsForInfluence(inf, role);

    const normalize = (c) => {
      if (!c) return "y";
      if (c === "yellow") return "y";
      if (c === "orange") return "o";
      if (c === "red") return "r";
      if (c === "black") return "k";
      return c;
    };

    const all = src.defense.filter(a => allowed.has(normalize(a.color)));
    return all.length ? Game.Data.pick(all) : null;
  };

  NPC.generateChatLine = (npc, opts = {}) => {
    if (!Game.Data) return "";

    const n = npc || NPC.randomAny();
    if (!n) return "";

    // Cop MAY post messages to the public chat on its own (warnings and descriptions).
    if (n.role === "cop") {
      const fallback = pickBySex(NPC.SAY.cop, n.sex);
      const line = Game.NPCSpeech && typeof Game.NPCSpeech.generateRuntimeNpcLine === "function"
        ? Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx(n, { source: opts.source || "event", block: opts.block || "neutral", channel: opts.channel || "event", tick: opts.tick, vars: opts.vars || {} }), fallback)
        : fallback;
      return normalizeCopLine(line);
    }

    // Mafioso is calm, polite, and uses ideal punctuation.
    if (n.role === "mafia") {
      const fallback = pickBySex(NPC.SAY.mafia, n.sex);
      const line = Game.NPCSpeech && typeof Game.NPCSpeech.generateRuntimeNpcLine === "function"
        ? Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx(n, { source: opts.source || "event", block: opts.block || "neutral", channel: opts.channel || "event", tick: opts.tick, vars: opts.vars || {} }), fallback)
        : fallback;
      return normalizeCopLine(line);
    }

    // Base line by role
    let base = "";
    if (n.role === "toxic" || n.role === "bandit" || n.role === "cop" || n.role === "mafia" || n.role === "crowd") {
      base = pickProfileLines(NPC.SAY_PROFILE_TEXTS, NPC.SAY, n.role, n.sex);
      if (!base) {
        if (n.role === "toxic") base = pickBySex(NPC.SAY.toxic, n.sex);
        else if (n.role === "bandit") base = pickBySex(NPC.SAY.bandit, n.sex);
        else if (n.role === "cop") base = pickBySex(NPC.SAY.cop, n.sex);
        else if (n.role === "mafia") base = pickBySex(NPC.SAY.mafia, n.sex);
        else base = pickBySex(NPC.SAY.crowd, n.sex);
      }
    } else if (Math.random() < 0.25) base = pickBySex(NPC.SAY.crowd, n.sex);
    else base = pickOne(Game.Data.NPC_CHAT_LINES);

    // Mentions: talk to others most of the time, sometimes to me
    // - mention other npc ~45%
    // - mention me ~18%
    const r = Math.random();
    let prefix = "";

    if (r < 0.45) {
      const other = randomOtherNpc(n.id);
      if (other) prefix = nameMention(other) + ", ";
    } else if (r < 0.63) {
      prefix = meNameMention() + ", ";
    }

    const fallbackLine = prefix + base;
    if (Game.NPCSpeech && typeof Game.NPCSpeech.generateRuntimeNpcLine === "function") {
      Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx(n, {
        source: opts.source || "event",
        block: opts.block || "neutral",
        channel: opts.channel || "event",
        tick: opts.tick,
        vars: opts.vars || {}
      }), fallbackLine);
    }
    const line = fallbackLine;
    return prefix ? normalizeLineKeepPunct(line) : normalizeLine(line);
  };

  // DM line without mentions (keeps NPC role identity, but reads like a short chat reply).
  NPC.generateDmLine = (npc, opts = {}) => {
    if (!Game.Data) return "";
    const n = npc || NPC.randomAny();
    if (!n) return "";

    const role = (n.role === "cop" || n.role === "mafia" || n.role === "bandit" || n.role === "toxic") ? n.role : "neutral";
    const fallback = pickProfileLines(NPC.DM_PROFILE_TEXTS, NPC.DM_PROFILE_LINES, role, n.sex) || pickOne((NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES[role]) || (NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES.neutral) || []);
    if (Game.NPCSpeech && typeof Game.NPCSpeech.generateRuntimeNpcLine === "function") {
      Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx(n, {
        source: opts.source || "dm",
        block: opts.block || "neutral",
        role,
        channel: "dm",
        tick: opts.tick,
        vars: opts.vars || {}
      }), fallback);
    }
    const line = fallback;
    return (role === "cop" || role === "mafia") ? normalizeCopLine(line) : normalizeLine(line);
  };

  // Villain DM flow: question -> challenge
  const villainQuestions = [
    "ты здесь?",
    "про тебя?",
    "держишь слово?",
    "тема твоя?",
    "в спор?"
  ];
  const villainChallenges = [
    "идем в раунд",
    "готов к раунду",
    "раунд покажет",
    "споришь?"
  ];
  const villainQuestionsProfile = {
    millennial: villainQuestions,
    zoomer: [
      "ты тут?",
      "это про тебя?",
      "слово держишь?",
      "тема твоя?",
      "в спор идешь?"
    ]
  };
  const villainChallengesProfile = {
    millennial: villainChallenges,
    zoomer: [
      "идем в раунд",
      "готов к раунду?",
      "раунд покажет",
      "споришь?"
    ]
  };

  NPC.generateVillainQuestion = (npc) => {
    const line = pickProfileLines(villainQuestionsProfile, villainQuestions, "villainQuestion", "m");
    return normalizeLine(line);
  };

  NPC.generateVillainChallenge = (npc) => {
    const line = pickProfileLines(villainChallengesProfile, villainChallenges, "villainChallenge", "m");
    return normalizeLine(line);
  };

  // Dev-only visibility metadata. These are read-only source pointers for smoke inventories;
  // gameplay still reads the original arrays/functions above.
  NPC.SPEECH_INVENTORY_SOURCES = [
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.toxic.m", get: () => NPC.SAY.toxic.m },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.toxic.f", get: () => NPC.SAY.toxic.f },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.bandit.m", get: () => NPC.SAY.bandit.m },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.bandit.f", get: () => NPC.SAY.bandit.f },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.cop.m", get: () => NPC.SAY.cop.m },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.cop.f", get: () => NPC.SAY.cop.f },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.mafia.m", get: () => NPC.SAY.mafia.m },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.mafia.f", get: () => NPC.SAY.mafia.f },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.crowd.m", get: () => NPC.SAY.crowd.m },
    { category: "dm", source: "AsyncScene/Web/npcs.js:NPC.SAY.crowd.f", get: () => NPC.SAY.crowd.f },
    { category: "dm", source: "AsyncScene/Web/npcs.js:villainQuestions", get: () => villainQuestions },
    { category: "dm", source: "AsyncScene/Web/npcs.js:villainChallenges", get: () => villainChallenges },
  ];

  // Crowd voting helper for draws.
  // We keep the rules explicit and centralized:
  // - Only specific roles are allowed to vote (cop/mafia are excluded by default).
  // - Each vote has a weight derived from role + influence.
  // - The function returns { voterId, voterName, side, weight }.
  //   side is "attacker" or "defender".
  NPC.VOTING = {
    // Crowd voting is ONLY for NPC-NPC draws.
    // IMPORTANT: voters are third-party NPCs (not the two fighters).

    // Roles allowed to appear as voters.
    // Keep this permissive for regular NPCs, but exclude authority/endpoint roles.
    allowedRoles: new Set(["crowd", "toxic", "bandit"]),

    // Roles that must NEVER vote in draws.
    // Cop/mafia are special mechanics and should not be part of crowd voting.
    excludedRoles: new Set(["cop", "mafia"]),

    // Additional role multipliers (kept small).
    // Crowd is baseline. Toxic/bandit are slightly louder.
    roleMultiplier: {
      crowd: 1.0,
      toxic: 1.2,
      bandit: 1.3
    },

    // Influence -> base weight mapping. Keep it tiny to avoid huge totals.
    weightFromInfluence(inf) {
      return 1;
    },

    // Role bias for choosing a side.
    // Crowd is neutral. Toxic/bandit lean toward attacker.
    pAttackerByRole: {
      crowd: 0.50,
      toxic: 0.60,
      bandit: 0.65
    },

    // Hard caps for sanity.
    minWeight: 1,
    maxWeight: 2
  };

  NPC.getVotingPool = (battle = null) => {
    const all = NPC.getAll();
    if (!all || !all.length) return [];

    const attackerId = battle && (battle.attackerId || battle.aId || battle.fromId || battle.from);
    const defenderId = battle && (battle.defenderId || battle.dId || battle.toId || battle.to);

    return all.filter(p => {
      if (!p) return false;
      const role = (p.role || "crowd");

      // Exclude special roles entirely.
      if (NPC.VOTING.excludedRoles && NPC.VOTING.excludedRoles.has(role)) return false;

      // Only allow known crowd-voter roles.
      if (NPC.VOTING.allowedRoles && !NPC.VOTING.allowedRoles.has(role)) return false;

      // Voters must be third-party (not the battle participants).
      if (attackerId && p.id === attackerId) return false;
      if (defenderId && p.id === defenderId) return false;

      return true;
    });
  };

  NPC.voteInDraw = (battle) => {
    try {
      if (!battle) return { voterId: null, voterName: null, side: null, weight: 0 };

      const pool = NPC.getVotingPool(battle);
      if (!pool.length) return { voterId: null, voterName: null, side: null, weight: 0 };

      // Pick a voter. We bias selection slightly by influence so higher-influence NPCs appear a bit more.
      const list = pool.map(p => {
        const base = NPC.VOTING.weightFromInfluence(p.influence);
        // Selection weight (not the vote weight) stays modest.
        const pickW = Math.max(1, Math.min(8, base + 1));
        return { item: p, weight: pickW };
      });
      const npc = pickWeightedPlayer(list);
      if (!npc) return { voterId: null, voterName: null, side: null, weight: 0 };

      const role = (npc.role || "crowd");

      // Decide which side this NPC supports.
      const pAttacker = (NPC.VOTING.pAttackerByRole[role] != null)
        ? NPC.VOTING.pAttackerByRole[role]
        : NPC.VOTING.pAttackerByRole.crowd;
      const side = (Math.random() < pAttacker) ? "attacker" : "defender";

      // Compute vote weight.
      const baseWeight = NPC.VOTING.weightFromInfluence(npc.influence);
      const mult = (NPC.VOTING.roleMultiplier[role] != null)
        ? NPC.VOTING.roleMultiplier[role]
        : 1.0;
      let weight = Math.round(baseWeight * mult);
      weight = Math.max(NPC.VOTING.minWeight, Math.min(NPC.VOTING.maxWeight, weight));

      return { voterId: npc.id, voterName: npc.name, side, weight };
    } catch (_) {
      return { voterId: null, voterName: null, side: null, weight: 0 };
    }
  };

  NPC.normalizeCopLine = normalizeCopLine;

  // Cop knowledge base + reply generator (used by UI DM/chat routing).
  // Multi-cop: return a random cop NPC (not a single hardcoded id).
  NPC.getCop = () => {
    const cops = NPC.getAll().filter(p => p && (p.role === "cop" || p.role === "police"));
    if (!cops.length) return null;
    return cops[Math.floor(Math.random() * cops.length)];
  };

  NPC.COP = {
    topics: {
      toxic: {
        title: "Токсик",
        style: "Пишет грубо, цепляется, провоцирует на быстрый ответ. Часто обращается на 'ты' и давит на эмоции.",
        risk: "Быстрый ответ открывает урон по 💰.",
        advice: "Ответ на провокацию открывает удар. Без ответа тише."
      },
      bandit: {
        title: "Бандит",
        style: "Говорит ультиматумами и угрозами. Давит на '💰' и заставляет действовать.",
        risk: "Проигрыш ему обнуляет твои 💰.",
        advice: "Свалить закрывает контакт. Проигрыш бьет по 💰."
      },
      mafia: {
        title: "Мафиози",
        style: "Вежливый тон, но холодная логика. Говорит спокойно и давит без крика.",
        risk: "Опасен тем, что после контакта ты теряешь ⚡.",
        advice: "Контакт рядом — ⚡ под ударом. Свалить закрывает контакт."
      }
    },
    report: {
      rewardPoints: 2,
      falsePenalty: 5
    }
  };

  // Generate a cop reply (ideal punctuation). Intended for DM/chat routing.
  NPC.generateCopReply = (text) => {
    if (!Game.Data || !Game.Data.t) return "Принято.";
    const q = (text == null) ? "" : String(text);
    const t = q.toLowerCase();

    const tVar = (key) => {
      const arr = Game.Data.TEXTS.genz[key];
      return Array.isArray(arr) ? pickOne(arr) : arr;
    };

    // Reports
    if (t.includes("сдать") || t.includes("донес") || t.includes("донос") || t.includes("report")) {
      return normalizeCopLine(tVar("cop_report_accept"));
    }

    // Topic help
    const wantsToxic = t.includes("токс") || t.includes("toxic");
    const wantsBandit = t.includes("банд") || t.includes("bandit");
    const wantsMafia = t.includes("мафи") || t.includes("mafia");

    const blocks = [];
    if (wantsToxic) blocks.push(NPC.COP.topics.toxic);
    if (wantsBandit) blocks.push(NPC.COP.topics.bandit);
    if (wantsMafia) blocks.push(NPC.COP.topics.mafia);

    if (blocks.length) {
      const b = blocks[0];
      const shortByTitle = {
        "Токсик": "Токсик давит. Не ведись.",
        "Бандит": "Бандит давит на деньги. Держи дистанцию.",
        "Мафиози": "Мафиози тихий. Не оставляй след."
      };
      return normalizeCopLine(shortByTitle[b.title] || `${b.title}. Держи дистанцию.`);
    }

    // Default neutral advice
    return normalizeCopLine("Я на связи. Пиши коротко.");
  };

  // Canonical Zoomer NPC speech artifacts (Step 6.9).
  // Runtime NPC speech templates are built from this artifact set only.
  const NPC_SPEECH_PROFILE_ZOOMER = Object.freeze({
    id: "NPC_SPEECH_PROFILE_ZOOMER",
    locale: "ru",
    scope: "npc_speech_runtime_templates",
    target: "short_direct_alive_role_preserving",
    lineShape: "one_idea_per_line",
    maxWords: 6,
    punctuation: "light_chat_punctuation",
    slangPolicy: "no_teen_slang_no_memes",
    mentoringPolicy: "no_coaching_no_teacher_tone",
    rolePolicy: "preserve_role_identity_without_generic_collapse",
    routingPolicy: "future_npc_templates_route_through_NPC_TEMPLATE_SET_Z"
  });

  const NPC_ROLE_RULES_ZOOMER = Object.freeze({
    cop: Object.freeze({ intent: "keeps distance and records danger", markers: Object.freeze(["принято", "дистанция", "дистанц", "пост", "сигнал", "тише", "конфликт", "порядок", "эскалац"]) }),
    mafia: Object.freeze({ intent: "controls quietly and avoids witnesses", markers: Object.freeze(["тише", "шум", "след", "долг", "свидетели", "счет", "счёт", "решим", "тишина", "слово"]) }),
    bandit: Object.freeze({ intent: "presses for money or exit", markers: Object.freeze(["кошелек", "плати", "стой", "торга", "выход", "деньги", "руки", "решай", "добыча", "плата"]) }),
    toxic: Object.freeze({ intent: "pushes and attacks weak answers", markers: Object.freeze(["слаб", "ответ", "отвечай", "прячь", "жестче", "давление", "трещит"]) }),
    neutral: Object.freeze({ intent: "observes the situation plainly", markers: Object.freeze(["вижу", "наблюд", "заметно", "смотрю", "тема", "со стороны", "рядом", "итог", "ход", "тише"]) }),
    crowd: Object.freeze({ intent: "reacts as a living crowd", markers: Object.freeze(["народ", "зал", "площадь", "гул", "шум", "край", "притих", "поднялся", "ожила"]) })
  });

  const NPC_STOP_PHRASES = Object.freeze({
    teenSlang: Object.freeze(["чё", "че", "щас", "го", "изи", "кринж", "зашквар", "рофл", "лол", "краш", "вайб", "топчик", "хайп", "жиза", "флекс", "сигма"]),
    memes: Object.freeze(["мем", "прикол", "баттл", "вброс", "тащи", "цирк", "я в шоке", "гореть", "имба", "база"]),
    mentoring: Object.freeze(["совет", "подскажу", "тебе стоит", "попробуй", "научись", "запомни", "помогу", "объясню"]),
    teacherTone: Object.freeze(["урок", "вывод", "правильный ответ", "важно понимать", "делаем вывод", "главное", "ты должен", "необходимо", "следует", "надо понимать"])
  });

  const makeNpcTemplateSetZ = () => {
    const blocks = ["greetings", "threats", "victory", "defeat", "neutral"];
    const roles = ["cop", "mafia", "bandit", "toxic", "neutral", "crowd"];
    const channels = ["dm", "event", "battle"];
    const intensities = ["y", "o", "r", "k"];
    const roleLines = {
      greetings: {
        cop: ["принято, держи дистанцию", "сигнал вижу"],
        mafia: ["тише, без шума", "след убери"],
        bandit: ["кошелек ближе", "стой без фокусов"],
        toxic: ["слабый ход", "отвечай четко"],
        neutral: ["вижу тему", "смотрю рядом"],
        crowd: ["площадь шумит", "народ у края"]
      },
      threats: {
        cop: ["без эскалации", "конфликт на виду"],
        mafia: ["шум дорог", "свидетели лишние"],
        bandit: ["плати и иди", "торга нет"],
        toxic: ["не прячься", "ответ слабый"],
        neutral: ["тема острая", "со стороны видно"],
        crowd: ["зал притих", "гул пошел"]
      },
      victory: {
        cop: ["порядок рядом", "пост удержан"],
        mafia: ["тишина решила", "долг на месте"],
        bandit: ["деньги у меня", "выход закрыт"],
        toxic: ["слабость вскрыта", "давление сработало"],
        neutral: ["итог виден", "тема закрыта"],
        crowd: ["зал поднялся", "площадь ожила"]
      },
      defeat: {
        cop: ["сигнал принят", "дистанцию держим"],
        mafia: ["счет открыт", "след остался"],
        bandit: ["добыча ушла", "плата позже"],
        toxic: ["давление просело", "ответ держится"],
        neutral: ["ход просел", "заметно тише"],
        crowd: ["народ притих", "шум упал"]
      },
      neutral: {
        cop: ["пост рядом", "конфликт вижу"],
        mafia: ["тише", "слово взвешено"],
        bandit: ["решай быстро", "руки видно"],
        toxic: ["позиция трещит", "говори жестче"],
        neutral: ["наблюдаю тему", "заметно рядом"],
        crowd: ["народ ждет", "зал гудит"]
      }
    };
    const channelLead = {
      dm: ["лично", "в личке", "прямо", "коротко"],
      event: ["площадь", "рядом", "сейчас", "на виду"],
      battle: ["раунд", "спор", "ход", "ответ"]
    };
    const templatesByLocale = { ru: {} };
    blocks.forEach(block => {
      templatesByLocale.ru[block] = {};
      roles.forEach(role => {
        templatesByLocale.ru[block][role] = {};
        channels.forEach(channel => {
          templatesByLocale.ru[block][role][channel] = {};
          intensities.forEach((intensity, index) => {
            const base = roleLines[block][role];
            const lead = channelLead[channel][index];
            templatesByLocale.ru[block][role][channel][intensity] = Object.freeze([
              `${lead}: ${base[0]}`,
              `${lead}: ${base[1]}`
            ]);
          });
        });
      });
    });
    return Object.freeze({
      id: "NPC_TEMPLATE_SET_Z",
      locale: "ru",
      build: "step6_9_final_canonical_zoomer_npc_template_set",
      profile: NPC_SPEECH_PROFILE_ZOOMER,
      roleRules: NPC_ROLE_RULES_ZOOMER,
      stopPhrases: NPC_STOP_PHRASES,
      blocks: Object.freeze(blocks.slice()),
      roles: Object.freeze(roles.slice()),
      channels: Object.freeze(channels.slice()),
      intensities: Object.freeze(intensities.slice()),
      templatesByLocale: Object.freeze({ ru: templatesByLocale.ru })
    });
  };

  const NPC_TEMPLATE_SET_Z = makeNpcTemplateSetZ();

  const buildNpcSpeechTemplates = () => NPC_TEMPLATE_SET_Z.templatesByLocale.ru;

  const NPCSpeech = {};
  NPCSpeech.BLOCKS = ["greetings", "threats", "victory", "defeat", "neutral"];
  NPCSpeech.ROLES = ["cop", "mafia", "bandit", "toxic", "neutral", "crowd"];
  NPCSpeech.CHANNELS = ["dm", "event", "battle"];
  NPCSpeech.INTENSITIES = ["y", "o", "r", "k"];
  NPCSpeech.ROLE_PROFILES = {
    cop: { traits: ["calm", "official", "short"], markers: ["принято", "фиксирую", "порядок", "протокол", "рапорт", "заявление", "эскалации", "нарушение", "пост", "дистанция", "дистанц", "связь"] },
    bandit: { traits: ["direct", "hard", "practical"], markers: ["кошелек", "плати", "стой", "торга", "налом", "дешевле", "добыча", "плата", "фокусов", "решай", "дело", "денег", "руки", "дороже", "дважды", "проверка", "предупреждаю", "забрал"] },
    toxic: { traits: ["sharp", "pressuring", "no_long_text"], markers: ["слаб", "ответ", "отвечай", "прячь", "жестче", "жестко", "давление", "трещит", "резче", "тонко"] },
    mafia: { traits: ["confident", "controlled", "minimal_words"], markers: ["тише", "тихо", "шум дорог", "без шума", "след", "свидетел", "взвешено", "долг", "тишина", "счет", "счёт", "решим", "итог"] },
    neutral: { traits: ["everyday_speech", "observational"], markers: ["наблюд", "замет", "тема", "со стороны", "вижу"] },
    crowd: { traits: ["reactive", "situational"], markers: ["ого", "народ", "гудит", "поворот", "ожил", "притих", "что сейчас", "ой", "зал"] }
  };
  NPCSpeech.DEFAULT_LOCALE = "ru";
  NPCSpeech.SUPPORTED_LOCALES = ["ru"];
  NPCSpeech.FUTURE_LOCALES = ["en", "ja"];
  NPCSpeech.NPC_SPEECH_PROFILE_ZOOMER = NPC_SPEECH_PROFILE_ZOOMER;
  NPCSpeech.NPC_ROLE_RULES_ZOOMER = NPC_ROLE_RULES_ZOOMER;
  NPCSpeech.NPC_STOP_PHRASES = NPC_STOP_PHRASES;
  NPCSpeech.NPC_TEMPLATE_SET_Z = NPC_TEMPLATE_SET_Z;
  NPCSpeech.TEMPLATES_BY_LOCALE = NPC_TEMPLATE_SET_Z.templatesByLocale;
  NPCSpeech.TEMPLATES = NPC_TEMPLATE_SET_Z.templatesByLocale.ru;
  NPCSpeech._lastTickKey = null;
  NPCSpeech._usedByPool = Object.create(null);
  NPCSpeech._localeBySession = Object.create(null);

  const normalizeNpcSpeechTag = (value, allowed, fallback) => {
    const v = String(value == null ? "" : value).trim().toLowerCase();
    return allowed.includes(v) ? v : fallback;
  };

  const normalizeNpcSpeechVars = (vars = {}) => ({
    PLAYER: String(vars.PLAYER || vars.player || vars.name || "ты").replace(/\s+/g, " ").trim() || "ты",
    PLACE: String(vars.PLACE || vars.place || "Площадь").replace(/\s+/g, " ").trim() || "Площадь",
    TOPIC: String(vars.TOPIC || vars.topic || "тема").replace(/\s+/g, " ").trim() || "тема"
  });

  const normalizeNpcSpeechLocaleCode = (value) => {
    const raw = String(value == null ? "" : value).trim().toLowerCase().replace(/_/g, "-");
    const base = raw.split("-")[0];
    return base || "";
  };

  const npcSpeechSessionKey = (ctx = {}) => {
    const session = ctx && ctx.session && typeof ctx.session === "object" ? ctx.session : null;
    const user = ctx && ctx.user && typeof ctx.user === "object" ? ctx.user : null;
    const S = Game && (Game.__S || Game.State);
    const candidates = [
      ctx.sessionId,
      session && (session.id || session.sessionId),
      user && user.sessionId,
      S && (S.sessionId || S.id),
      Game && Game.Logger && Game.Logger.sessionId,
      (typeof window !== "undefined" && window.sessionId)
    ];
    const found = candidates.find(v => v != null && String(v).trim());
    return found != null ? String(found).trim() : "__npc_speech_session";
  };

  const readNpcSpeechLocaleCandidate = (ctx = {}) => {
    const session = ctx && ctx.session && typeof ctx.session === "object" ? ctx.session : null;
    const user = ctx && ctx.user && typeof ctx.user === "object" ? ctx.user : null;
    const S = Game && (Game.__S || Game.State);
    const candidates = [
      ctx.locale,
      ctx.lang,
      ctx.language,
      user && (user.locale || user.lang || user.language),
      session && (session.locale || session.lang || session.language),
      S && (S.locale || S.lang || S.language || (S.user && (S.user.locale || S.user.lang || S.user.language)) || (S.session && (S.session.locale || S.session.lang || S.session.language))),
      Game && Game.User && (Game.User.locale || Game.User.lang || Game.User.language),
      Game && Game.Session && (Game.Session.locale || Game.Session.lang || Game.Session.language),
      typeof document !== "undefined" && document.documentElement && document.documentElement.lang,
      typeof navigator !== "undefined" && (navigator.language || (Array.isArray(navigator.languages) && navigator.languages[0]))
    ];
    return candidates.find(v => v != null && String(v).trim()) || NPCSpeech.DEFAULT_LOCALE;
  };

  NPCSpeech.resolveLocale = function resolveLocale(ctx = {}) {
    const sessionKey = npcSpeechSessionKey(ctx || {});
    if (NPCSpeech._localeBySession[sessionKey]) return NPCSpeech._localeBySession[sessionKey];
    const requested = normalizeNpcSpeechLocaleCode(readNpcSpeechLocaleCandidate(ctx || {}));
    const locale = NPCSpeech.SUPPORTED_LOCALES.includes(requested) ? requested : NPCSpeech.DEFAULT_LOCALE;
    const resolved = {
      locale,
      requested: requested || NPCSpeech.DEFAULT_LOCALE,
      fallback: locale !== requested,
      sessionKey
    };
    NPCSpeech._localeBySession[sessionKey] = resolved;
    return resolved;
  };

  const replaceNpcSpeechVars = (template, vars) => {
    const safe = normalizeNpcSpeechVars(vars);
    return String(template == null ? "" : template).replace(/\{(PLAYER|PLACE|TOPIC)\}/g, (_, key) => safe[key]);
  };

  const cleanNpcSpeechLine = (line) => {
    let text = String(line == null ? "" : line).replace(/\s+/g, " ").trim();
    text = text.replace(/[.]+$/g, "").replace(/[,;:]+$/g, "").trim();
    if (!text) text = "площадь ждет нормальный ответ";
    if (/\{[^}]*\}/.test(text) || /\}/.test(text) || /\{/.test(text)) text = text.replace(/\{[^}]*\}|[{}]/g, "").replace(/\s+/g, " ").trim() || "площадь ждет нормальный ответ";
    return text;
  };

  const npcSpeechTickKey = (ctx) => {
    if (ctx && (ctx.tick != null || ctx.tickId != null)) return String(ctx.tick != null ? ctx.tick : ctx.tickId);
    const S = Game && (Game.__S || Game.State);
    if (S && (S.tick != null || S.tickId != null || S.currentTick != null)) return String(S.tick != null ? S.tick : (S.tickId != null ? S.tickId : S.currentTick));
    return "__static_tick";
  };

  NPCSpeech.resetTickCache = function resetTickCache() {
    NPCSpeech._lastTickKey = null;
    NPCSpeech._usedByPool = Object.create(null);
  };

  NPCSpeech.getPool = function getPool(ctx = {}) {
    const localeInfo = NPCSpeech.resolveLocale(ctx || {});
    const locale = localeInfo.locale || NPCSpeech.DEFAULT_LOCALE;
    const templates = NPCSpeech.TEMPLATES_BY_LOCALE[locale] || NPCSpeech.TEMPLATES_BY_LOCALE[NPCSpeech.DEFAULT_LOCALE];
    const block = normalizeNpcSpeechTag(ctx.block || ctx.kind || ctx.pool, NPCSpeech.BLOCKS, "neutral");
    const role = normalizeNpcSpeechTag(ctx.role, NPCSpeech.ROLES, "neutral");
    const channel = normalizeNpcSpeechTag(ctx.channel, NPCSpeech.CHANNELS, "dm");
    const intensity = normalizeNpcSpeechTag(ctx.intensity, NPCSpeech.INTENSITIES, "y");
    const pool = (((templates[block] || {})[role] || {})[channel] || {})[intensity];
    const safePool = Array.isArray(pool) && pool.length ? pool : templates.neutral.neutral.dm.y;
    return { block, role, channel, intensity, locale, requestedLocale: localeInfo.requested, localeFallback: localeInfo.fallback === true, sessionKey: localeInfo.sessionKey, key: `${locale}|${block}|${role}|${channel}|${intensity}`, templates: safePool };
  };

  NPCSpeech.generateNpcLine = function generateNpcLine(ctx = {}) {
    let line = "";
    try {
      const pool = NPCSpeech.getPool(ctx || {});
      const tickKey = npcSpeechTickKey(ctx || {});
      if (NPCSpeech._lastTickKey !== tickKey) {
        NPCSpeech._lastTickKey = tickKey;
        NPCSpeech._usedByPool = Object.create(null);
      }
      const rendered = pool.templates.map(t => cleanNpcSpeechLine(replaceNpcSpeechVars(t, ctx && ctx.vars))).filter(Boolean);
      const alternatives = rendered.length ? rendered : ["площадь ждет нормальный ответ"];
      const used = NPCSpeech._usedByPool[pool.key] || new Set();
      let candidates = alternatives.filter(t => !used.has(t));
      if (!candidates.length) candidates = alternatives.slice();
      line = pickOne(candidates) || candidates[0] || alternatives[0];
      if (alternatives.length > 1) {
        const nextUsed = candidates.length === alternatives.length && used.size >= alternatives.length ? new Set() : used;
        nextUsed.add(line);
        NPCSpeech._usedByPool[pool.key] = nextUsed;
      }
    } catch (_) {
      line = "площадь ждет нормальный ответ";
    }
    return cleanNpcSpeechLine(line);
  };


  const npcSpeechRole = (npc) => {
    const role = String((npc && (npc.role || npc.type)) || "").toLowerCase();
    if (role === "cop" || role === "police") return "cop";
    if (role === "mafia" || role === "mafioso") return "mafia";
    if (role === "bandit") return "bandit";
    if (role === "toxic") return "toxic";
    if (role === "crowd") return "crowd";
    if (role === "neutral") return "neutral";
    return "neutral";
  };

  const npcSpeechIntensity = (npc) => {
    const inf = Number(npc && npc.influence);
    if (Number.isFinite(inf)) {
      if (inf >= 12) return "k";
      if (inf >= 8) return "r";
      if (inf >= 4) return "o";
    }
    return "y";
  };

  NPCSpeech._proofLog = [];

  NPCSpeech.getRuntimeProofLog = function getRuntimeProofLog() {
    return NPCSpeech._proofLog.slice();
  };

  NPCSpeech.clearRuntimeProofLog = function clearRuntimeProofLog() {
    NPCSpeech._proofLog = [];
    try {
      if (Game && Game.__D && Array.isArray(Game.__D.npcSpeechRuntimeProof)) Game.__D.npcSpeechRuntimeProof.length = 0;
    } catch (_) {}
  };

  NPCSpeech.makeCtx = function makeCtx(npc, overrides = {}) {
    const vars = Object.assign({
      PLAYER: (Game.__S && Game.__S.me && Game.__S.me.name) ? Game.__S.me.name : "ты",
      PLACE: "Площадь",
      TOPIC: "спор"
    }, overrides.vars || {});
    const ctx = Object.assign({
      block: overrides.block || "neutral",
      role: overrides.role || npcSpeechRole(npc),
      channel: overrides.channel || "dm",
      intensity: overrides.intensity || npcSpeechIntensity(npc),
      vars,
      tick: overrides.tick
    }, overrides || {}, { vars });
    const localeInfo = NPCSpeech.resolveLocale(ctx);
    return Object.assign(ctx, { locale: localeInfo.locale, requestedLocale: localeInfo.requested, localeFallback: localeInfo.fallback === true, localeSessionKey: localeInfo.sessionKey });
  };

  NPCSpeech.generateRuntimeNpcLine = function generateRuntimeNpcLine(ctx = {}, fallback = "") {
    const source = String(ctx.source || ctx.callSite || "unknown");
    const result = { ok: false, line: "", generated: false, fallbackUsed: false, source, failedChecks: [] };
    try {
      if (typeof NPCSpeech.generateNpcLine !== "function") throw new Error("generator_missing");
      const line = cleanNpcSpeechLine(NPCSpeech.generateNpcLine(ctx || {}));
      if (!line) result.failedChecks.push("empty_generated_line");
      if (/undefined|null/i.test(line)) result.failedChecks.push("undefined_or_null_generated_line");
      if (/\{[^}]*\}|[{}]/.test(line)) result.failedChecks.push("broken_placeholder_generated_line");
      if (!result.failedChecks.length) {
        result.ok = true;
        result.generated = true;
        result.line = line;
      }
    } catch (err) {
      result.failedChecks.push(err && err.message ? String(err.message) : String(err));
    }
    if (!result.ok) {
      result.fallbackUsed = true;
      result.line = cleanNpcSpeechLine(fallback);
      result.failedChecks.push({ check: "npc_speech_runtime_fallback", source });
    }
    try {
      const localeInfo = NPCSpeech.resolveLocale(ctx || {});
      const row = {
        time: Date.now(),
        source,
        locale: localeInfo.locale,
        requestedLocale: localeInfo.requested,
        localeFallback: localeInfo.fallback === true,
        localeSessionKey: localeInfo.sessionKey,
        generated: result.generated === true,
        fallbackUsed: result.fallbackUsed === true,
        line: result.line,
        failedChecks: result.failedChecks.slice()
      };
      NPCSpeech._proofLog.push(row);
      if (NPCSpeech._proofLog.length > 80) NPCSpeech._proofLog.shift();
      Game.__D ||= {};
      Game.__D.npcSpeechRuntimeProof ||= [];
      Game.__D.npcSpeechRuntimeProof.push(row);
      if (Game.__D.npcSpeechRuntimeProof.length > 80) Game.__D.npcSpeechRuntimeProof.shift();
      if (result.fallbackUsed) {
        Game.__D.npcSpeechRuntimeFallbacks ||= [];
        Game.__D.npcSpeechRuntimeFallbacks.push(row);
      }
    } catch (_) {}
    return result.line;
  };

  NPCSpeech.smokeTemplateScaffoldOnce = function smokeTemplateScaffoldOnce() {
    const result = { ok: false, failures: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [] };
    const seen = { blocks: new Set(), roles: new Set(), channels: new Set(), intensities: new Set() };
    const addUnique = (arr, item) => { if (!arr.some(x => JSON.stringify(x) === JSON.stringify(item))) arr.push(item); };
    const fail = (code, detail) => { addUnique(result.failures, detail === undefined ? code : { code, detail }); addUnique(result.failedChecks, code); };
    const forbidden = [
      { rule: "no_console_txt", re: /Console\.txt/i },
      { rule: "no_teen_slang", re: /(^|[^а-яё])(вайб|кринж|хайп|тик ?ток|тикток|лулз|рофл|имба|краш|чилл)([^а-яё]|$)/i },
      { rule: "no_memes", re: /(^|[^а-яё])(скибиди|мем|лол|кек|жиза|ой все|заш[её]л в чат)([^а-яё]|$)/i },
      { rule: "no_teacher_tone", re: /(включите мозг|будь внимател|будьте внимател|запомни|объясняю|урок|не умничай)/i },
      { rule: "no_broken_placeholders", re: /\{[^}]*\}|[{}]/ }
    ];
    try {
      NPCSpeech.resetTickCache();
      NPCSpeech.BLOCKS.forEach(block => {
        NPCSpeech.ROLES.forEach(role => {
          NPCSpeech.CHANNELS.forEach(channel => {
            NPCSpeech.INTENSITIES.forEach(intensity => {
              const vars = { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" };
              const ctx = { block, role, channel, intensity, vars, tick: "coverage" };
              const pool = NPCSpeech.getPool(ctx);
              if (!Array.isArray(pool.templates) || !pool.templates.length) fail("pool_missing", { block, role, channel, intensity });
              seen.blocks.add(block); seen.roles.add(role); seen.channels.add(channel); seen.intensities.add(intensity);
              const line = NPCSpeech.generateNpcLine(ctx);
              if (typeof line !== "string") fail("not_string", { block, role, channel, intensity, line });
              if (!line) fail("empty_string", { block, role, channel, intensity });
              if (/undefined|null/i.test(line)) fail("undefined_or_null_text", { block, role, channel, intensity, line });
              forbidden.forEach(check => { const m = line.match(check.re); if (m) addUnique(result.forbiddenRemaining, { rule: check.rule, block, role, channel, intensity, match: m[0], line }); });
            });
          });
        });
      });
      NPCSpeech.BLOCKS.forEach(block => { if (!seen.blocks.has(block)) addUnique(result.missingCoverage, `block:${block}`); });
      NPCSpeech.ROLES.forEach(role => { if (!seen.roles.has(role)) addUnique(result.missingCoverage, `role:${role}`); });
      NPCSpeech.CHANNELS.forEach(channel => { if (!seen.channels.has(channel)) addUnique(result.missingCoverage, `channel:${channel}`); });
      NPCSpeech.INTENSITIES.forEach(intensity => { if (!seen.intensities.has(intensity)) addUnique(result.missingCoverage, `intensity:${intensity}`); });
      const replacedProbe = cleanNpcSpeechLine(replaceNpcSpeechVars("{PLAYER} идет в {PLACE} за {TOPIC}", { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" }));
      if (replacedProbe !== "Аня идет в Двор за спор") fail("variable_replacement_broken", replacedProbe);
      NPCSpeech.resetTickCache();
      const dupCtx = { block: "neutral", role: "neutral", channel: "dm", intensity: "y", vars: { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" }, tick: "dup" };
      const dupPool = NPCSpeech.getPool(dupCtx);
      const a = NPCSpeech.generateNpcLine(dupCtx);
      const b = NPCSpeech.generateNpcLine(dupCtx);
      if (dupPool.templates.length > 1 && a === b) fail("duplicate_in_one_tick", { a, b, pool: dupPool.key });
      [a, b].forEach((line, index) => {
        if (typeof line !== "string" || !line || /\{[^}]*\}|[{}]/.test(line) || /undefined|null/i.test(line)) fail("duplicate_probe_bad_line", { index, line });
      });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };


  NPCSpeech.smokeMillennialWordingOnce = function smokeMillennialWordingOnce() {
    const result = { ok: false, failures: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [], sampleCount: 0, samples: [] };
    const addUnique = (arr, item) => { const key = JSON.stringify(item); if (!arr.some(x => JSON.stringify(x) === key)) arr.push(item); };
    const fail = (code, detail) => { addUnique(result.failures, detail === undefined ? code : { code, detail }); addUnique(result.failedChecks, code); };
    const forbidden = {
      teenSlang: ["че", "чё", "щас", "го", "изи", "кринж", "зашквар", "рофл", "лол", "краш", "вайб", "топчик", "хайп", "агр", "жиза", "пруф"],
      memes: ["мем", "баттл", "вброс", "тащи", "цирк", "я в шоке", "гореть", "жарко"],
      officialese: ["фиксирую", "нарушение", "прошу", "благодарю", "сохраните", "система", "регламент", "протокол", "санкции", "порядок восстановлен"],
      teacherTone: ["делаем вывод", "главное", "лучшее решение", "правильный выбор", "ты должен", "необходимо", "следует", "надо понимать"],
      thirdPersonSelf: ["коп на связи", "мафия предупреждает", "бандит сказал", "токсик сказал", "нейтрал считает"]
    };
    const roleHints = {
      cop: ["дистанц", "спокой", "безопас", "пиши", "конфликт", "поряд"],
      mafia: ["тих", "шум", "точн", "разум", "след", "свидетел", "дорог"],
      bandit: ["стой", "деньги", "плати", "корот", "движ", "теря", "забрал"],
      toxic: ["слаб", "докажи", "стоит", "пряч", "уверенность", "жестко", "ответ"],
      neutral: ["площад", "смотр", "тема", "раунд", "разговор", "заметно"]
    };
    const roles = ["cop", "mafia", "bandit", "toxic", "neutral"];
    const blocks = ["greetings", "threats", "victory", "defeat", "neutral"];
    const channels = ["dm", "event", "battle"];
    const seenRoles = Object.create(null), seenBlocks = Object.create(null), seenChannels = Object.create(null), roleFailures = Object.create(null), allForbiddenRows = [];
    const normalize = (line) => String(line || "").toLowerCase().replace(/ё/g, "е");
    const hasForbidden = (line) => {
      const low = normalize(line), rows = [];
      Object.keys(forbidden).forEach(group => forbidden[group].forEach(term => {
        const t = normalize(term);
        const re = /^[a-zа-я0-9]+$/i.test(t) ? new RegExp(`(^|[^a-zа-я0-9])${t}([^a-zа-я0-9]|$)`, "i") : null;
        if ((re && re.test(low)) || (!re && low.includes(t))) rows.push({ group, term, line });
      }));
      return rows;
    };
    try {
      NPCSpeech.resetTickCache();
      roles.forEach((role, roleIndex) => blocks.forEach((block, blockIndex) => {
        const channel = channels[(roleIndex + blockIndex) % channels.length];
        const intensity = ["y", "o", "r", "k"][(roleIndex + blockIndex) % 4];
        const ctx = { role, block, channel, intensity, tick: `millennial_wording_${role}_${block}_${channel}`, vars: { PLAYER: "Игрок", PLACE: "Площадь", TOPIC: "спор" } };
        const pool = NPCSpeech.getPool(ctx);
        const line = NPCSpeech.generateNpcLine(ctx);
        result.samples.push({ role, block, channel, intensity, line, pool: pool && pool.key });
        seenRoles[role] = true; seenBlocks[block] = true; seenChannels[channel] = true;
        hasForbidden(line).forEach(row => allForbiddenRows.push(Object.assign({ role, block, channel }, row)));
        const low = normalize(line), hints = roleHints[role] || [];
        if (!hints.some(h => low.includes(normalize(h)))) {
          if (!roleFailures[role]) roleFailures[role] = [];
          roleFailures[role].push({ block, channel, line });
        }
        if (line.length > 140) fail("line_too_long", { role, block, channel, line });
        if (/[{}]/.test(line) || /undefined|null/i.test(line)) fail("bad_render", { role, block, channel, line });
      }));
      result.sampleCount = result.samples.length;
      if (result.sampleCount < 20 || result.sampleCount > 30) fail("sample_count_out_of_range", result.sampleCount);
      roles.forEach(role => { if (!seenRoles[role]) addUnique(result.missingCoverage, `role:${role}`); });
      blocks.forEach(block => { if (!seenBlocks[block]) addUnique(result.missingCoverage, `block:${block}`); });
      channels.forEach(channel => { if (!seenChannels[channel]) addUnique(result.missingCoverage, `channel:${channel}`); });
      if (allForbiddenRows.length) { result.forbiddenRemaining = allForbiddenRows; addUnique(result.failedChecks, "forbidden_remaining"); }
      Object.keys(roleFailures).forEach(role => { const rows = roleFailures[role] || []; if (rows.length >= blocks.length) fail("role_voice_separation", { role, rows }); });
      if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    } catch (err) { fail("smoke_exception", err && err.message ? String(err.message) : String(err)); }
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };

  NPCSpeech.smokeLocaleOnce = function smokeLocaleOnce() {
    const result = { ok: false, failures: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [] };
    const addUnique = (arr, item) => { const key = JSON.stringify(item); if (!arr.some(x => JSON.stringify(x) === key)) arr.push(item); };
    const fail = (code, detail) => { addUnique(result.failures, detail === undefined ? code : { code, detail }); addUnique(result.failedChecks, code); };
    const badLine = (line) => !line || typeof line !== "string" || /undefined|null/i.test(line) || /\{[^}]*\}|[{}]/.test(line);
    const looksRu = (line) => /[а-яё]/i.test(String(line || ""));
    const hasForeignProbe = (line) => /[ぁ-ゟ゠-ヿ一-龯]|\b(hello|round|topic|place|player)\b/i.test(String(line || ""));
    const oldLocaleBySession = NPCSpeech._localeBySession;
    const samples = [];
    try {
      NPCSpeech._localeBySession = Object.create(null);
      if (typeof NPCSpeech.clearRuntimeProofLog === "function") NPCSpeech.clearRuntimeProofLog();
      if (typeof NPCSpeech.resetTickCache === "function") NPCSpeech.resetTickCache();
      const npc = { id: "dev_npc_locale", name: "Дара", npc: true, type: "npc", role: "neutral", influence: 5, sex: "f" };
      const make = (locale, sessionId, tick) => NPCSpeech.makeCtx(npc, { source: "locale_smoke", channel: "dm", block: "neutral", locale, sessionId, tick, vars: { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" } });
      const ruCtx = make("ru", "locale_smoke_ru", "locale_ru");
      const ruLine = NPCSpeech.generateRuntimeNpcLine(ruCtx, "fallback ru");
      samples.push({ probe: "forced_ru", line: ruLine, locale: ruCtx.locale, requestedLocale: ruCtx.requestedLocale });
      if (ruCtx.locale !== "ru") fail("forced_ru_locale_not_ru", ruCtx);
      if (badLine(ruLine)) fail("forced_ru_bad_line", ruLine);
      if (!looksRu(ruLine) || hasForeignProbe(ruLine)) fail("forced_ru_not_ru_line", ruLine);

      const unknownCtx = make("zz-ZZ", "locale_smoke_unknown", "locale_unknown");
      const unknownLine = NPCSpeech.generateRuntimeNpcLine(unknownCtx, "fallback unknown");
      samples.push({ probe: "unknown_fallback", line: unknownLine, locale: unknownCtx.locale, requestedLocale: unknownCtx.requestedLocale, localeFallback: unknownCtx.localeFallback });
      if (unknownCtx.locale !== "ru" || unknownCtx.localeFallback !== true) fail("unknown_locale_not_ru_fallback", unknownCtx);
      if (badLine(unknownLine)) fail("unknown_locale_bad_line", unknownLine);
      if (!looksRu(unknownLine) || hasForeignProbe(unknownLine)) fail("unknown_locale_not_ru_line", unknownLine);

      const userCtx = NPCSpeech.makeCtx(npc, { source: "locale_smoke", channel: "dm", block: "neutral", user: { locale: "ru", sessionId: "locale_smoke_user" }, tick: "locale_user", vars: { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" } });
      const sessionCtx = NPCSpeech.makeCtx(npc, { source: "locale_smoke", channel: "dm", block: "neutral", session: { locale: "ru", id: "locale_smoke_session" }, tick: "locale_session", vars: { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" } });
      const userLine = NPCSpeech.generateRuntimeNpcLine(userCtx, "fallback user");
      const sessionLine = NPCSpeech.generateRuntimeNpcLine(sessionCtx, "fallback session");
      samples.push({ probe: "user_locale", line: userLine, locale: userCtx.locale, requestedLocale: userCtx.requestedLocale });
      samples.push({ probe: "session_locale", line: sessionLine, locale: sessionCtx.locale, requestedLocale: sessionCtx.requestedLocale });
      if (userCtx.locale !== "ru" || badLine(userLine)) fail("user_locale_bad_line", { ctx: userCtx, line: userLine });
      if (sessionCtx.locale !== "ru" || badLine(sessionLine)) fail("session_locale_bad_line", { ctx: sessionCtx, line: sessionLine });

      const sessionLines = [];
      const sessionId = "locale_smoke_consistent_session";
      ["ru", "en", "ja", "xx"].forEach((locale, index) => {
        const ctx = make(locale, sessionId, `locale_session_${index}`);
        const line = NPCSpeech.generateRuntimeNpcLine(ctx, `fallback ${locale}`);
        sessionLines.push({ locale, resolved: ctx.locale, requested: ctx.requestedLocale, line });
        if (badLine(line)) fail("session_bad_line", { locale, line });
        if (!looksRu(line) || hasForeignProbe(line)) fail("session_non_ru_line", { locale, line });
      });
      const resolvedLocales = Array.from(new Set(sessionLines.map(row => row.resolved)));
      if (resolvedLocales.length !== 1 || resolvedLocales[0] !== "ru") fail("session_mixed_locale", sessionLines);
      result.samples = samples.concat(sessionLines);
      const proof = typeof NPCSpeech.getRuntimeProofLog === "function" ? NPCSpeech.getRuntimeProofLog() : [];
      const localeRows = (proof || []).filter(row => row && String(row.source || "") === "locale_smoke");
      if (!localeRows.length) addUnique(result.missingCoverage, "locale_smoke_proof");
      const proofLocales = Array.from(new Set(localeRows.map(row => String(row.locale || ""))));
      if (proofLocales.length !== 1 || proofLocales[0] !== "ru") fail("proof_mixed_locale", localeRows);
      localeRows.forEach(row => { if (badLine(row.line)) fail("proof_bad_line", row); });
      ["ru", "en", "ja"].forEach(locale => {
        const known = NPCSpeech.SUPPORTED_LOCALES.includes(locale) || NPCSpeech.FUTURE_LOCALES.includes(locale);
        if (!known) addUnique(result.missingCoverage, `locale_future_ready:${locale}`);
      });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    } finally {
      NPCSpeech._localeBySession = oldLocaleBySession;
    }
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };



  NPCSpeech.smokeZoomerNpcSpeechOnce = function smokeZoomerNpcSpeechOnce() {
    const buildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || Game.__buildTag || (Game.__DEV && Game.__DEV.buildTag) || null;
    const commit = (typeof window !== "undefined" && window.__COMMIT__) || Game.__commit || (Game.__DEV && Game.__DEV.commit) || null;
    const smokeVersion = `step3_5_zoomer_npc_speech_v1_${buildTag}_commit_${commit}`;
    const result = {
      ok: false,
      buildTag,
      commit,
      smokeVersion,
      inventoryExists: false,
      covered: { npcSay: 0, npcChatLines: 0, villainFlow: 0, templatePools: 0, runtimeChat: 0, runtimeDm: 0, step34SystemTexts: 0 },
      checkedCount: 0,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      teacherTone: [],
      profileIssues: [],
      canonMeaning: []
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
    const walkTemplates = (rows, root, path) => {
      if (Array.isArray(root)) {
        root.forEach((line, index) => addText(rows, "templatePools", `${path}.${index}`, line));
        return;
      }
      if (!root || typeof root !== "object") return;
      Object.keys(root).forEach((key) => walkTemplates(rows, root[key], `${path}.${key}`));
    };
    const boundary = "(^|[^А-Яа-яЁёA-Za-z0-9_])";
    const endBoundary = "(?=$|[^А-Яа-яЁёA-Za-z0-9_])";
    const forbiddenWords = [
      "кринж", "вайб", "имба", "рофл", "изи", "лол", "кек", "хайп", "мем", "мемный", "движ", "угар", "чил", "жиза", "топчик", "краш", "пруф", "щас", "чё", "че"
    ];
    const teacherToneRe = /давай\s+разбер|обуч|урок|настав|запомни|прочитай|следуй|изучи|правильно|неправильно|молодец|умничк|учитель|ученик|будь внимател|как тебе не стыдно/i;
    const teenBotRe = /скибиди|заш[её]л в чат|ой\s+вс[её]|иронично|ну\s+типа|как\s+бы|по\s+факту\s+лол|без\s+негатива|в натуре|жесть\s+какая/i;
    const canonRows = [
      { source: "Data.NPC_CHAT_LINES.0", before: "ну че кто первый вбросит", after: "кто начнет первым", meaning: "crowd still asks who starts the exchange" },
      { source: "Data.NPC_CHAT_LINES.6", before: "мне скучно, дайте движ", after: "мне скучно, нужен ход", meaning: "crowd still wants action in the scene" },
      { source: "Data.NPC_CHAT_LINES.8", before: "сегодня пахнет баттлами", after: "будет спор", meaning: "crowd still expects a conflict" },
      { source: "Data.NPC_CHAT_LINES.12", before: "баттл это просто разговор с адреналином", after: "спор стал резче", meaning: "line still frames the conflict as a sharper argument" },
      { source: "NPC.SAY.bandit.m.9", before: "Свалить будет дешевле", after: "уйти будет дешевле", meaning: "bandit still says leaving costs less" },
      { source: "NPC.SAY.mafia.m.2", before: "Подумай, какой след оставит этот ход", after: "ход оставит след", meaning: "mafia still warns about consequences of the move" },
      { source: "villainChallenges.0", before: "разберем это в раунде", after: "идем в раунд", meaning: "villain still pushes the player toward a round" },
      { source: "NPCSpeech.TEMPLATES.threats.toxic", before: "сейчас видно, чего ты стоишь", after: "покажи, чего стоишь", meaning: "toxic threat still pressures the player to prove strength" }
    ];
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => {
      if (value == null) return undefined;
      if (/^\d+$/.test(key)) return value[Number(key)];
      return value[key];
    }, root);
    try {
      const rows = [];
      (NPC.SPEECH_INVENTORY_SOURCES || []).forEach((entry) => {
        const list = entry && typeof entry.get === "function" ? entry.get() : [];
        if (Array.isArray(list)) list.forEach((line, index) => addText(rows, entry.source.indexOf("villain") >= 0 ? "villainFlow" : "npcSay", `${entry.source}.${index}`, line));
      });
      const chatLines = Game.Data && Array.isArray(Game.Data.NPC_CHAT_LINES) ? Game.Data.NPC_CHAT_LINES : [];
      chatLines.forEach((line, index) => addText(rows, "npcChatLines", `Data.NPC_CHAT_LINES.${index}`, line));
      walkTemplates(rows, NPCSpeech.TEMPLATES_BY_LOCALE && NPCSpeech.TEMPLATES_BY_LOCALE.ru, "NPCSpeech.TEMPLATES_BY_LOCALE.ru");
      [
        { group: "runtimeChat", source: "NPC.generateChatLine.toxic", npc: NPC.PLAYERS.find((p) => p.role === "toxic"), fn: () => NPC.generateChatLine(NPC.PLAYERS.find((p) => p.role === "toxic"), { source: "step3_5_smoke", block: "threats", channel: "event", tick: "step3_5_chat" }) },
        { group: "runtimeDm", source: "NPC.generateDmLine.bandit", npc: NPC.PLAYERS.find((p) => p.role === "bandit"), fn: () => NPC.generateDmLine(NPC.PLAYERS.find((p) => p.role === "bandit"), { source: "step3_5_smoke", block: "threats", tick: "step3_5_dm" }) }
      ].forEach((probe) => addText(rows, probe.group, probe.source, probe.fn()));

      result.inventoryExists = rows.length > 0;
      rows.forEach((row) => {
        result.covered[row.group] = (result.covered[row.group] || 0) + 1;
        result.checkedCount += 1;
        const text = row.text;
        const lower = text.toLocaleLowerCase("ru-RU");
        const words = text.split(/\s+/).filter(Boolean);
        forbiddenWords.forEach((word) => {
          const re = new RegExp(`${boundary}${word}${endBoundary}`, "i");
          if (re.test(lower)) addUnique(result.forbiddenRemaining, { source: row.source, word, text });
        });
        if (teacherToneRe.test(text)) addUnique(result.teacherTone, { source: row.source, text });
        if (teenBotRe.test(text)) addUnique(result.profileIssues, { source: row.source, issue: "teen_bot_voice", text });
        if (words.length > 8 || text.length > 78 || (text.match(/[.!?。]+/g) || []).length > 2 || /потому что|рекомендуется|необходимо|следует|информация|подробно|механика/i.test(text)) {
          addUnique(result.profileIssues, { source: row.source, issue: "short_simple_direct", words: words.length, length: text.length, text });
        }
      });
      canonRows.forEach((row) => {
        let current;
        if (row.source.indexOf("Data.") === 0) current = getPath({ Data: Game.Data || {} }, row.source);
        else if (row.source.indexOf("NPC.SAY.") === 0) current = getPath({ NPC }, row.source);
        else if (row.source === "villainChallenges.0") current = villainChallenges[0];
        else if (row.source === "NPCSpeech.TEMPLATES.threats.toxic") current = NPCSpeech.TEMPLATES.threats.toxic.dm.y[0];
        const ok = normalize(current).indexOf(row.after) >= 0 && row.meaning.length >= 24;
        result.canonMeaning.push(Object.assign({}, row, { current: normalize(current), ok }));
        if (!ok) fail("canon_meaning_preserved", { source: row.source, expected: row.after, actual: normalize(current), meaning: row.meaning });
      });
      ["npcSay", "npcChatLines", "villainFlow", "templatePools", "runtimeChat", "runtimeDm"].forEach((group) => {
        if (!result.covered[group]) addUnique(result.missingCoverage, group);
      });
      const step34 = Game.__DEV && typeof Game.__DEV.smokeZoomerSystemTextsOnce === "function" ? Game.__DEV.smokeZoomerSystemTextsOnce() : null;
      if (step34 && step34.ok === true) result.covered.step34SystemTexts = 1;
      else fail("step3_4_system_texts_remain_valid", step34 || "missing_smokeZoomerSystemTextsOnce");
      if (!result.inventoryExists) fail("npc_speech_inventory_exists");
      if (result.missingCoverage.length) fail("relevant_npc_speech_surfaces_covered", result.missingCoverage.slice());
      if (result.forbiddenRemaining.length) fail("no_forbidden_stop_words", result.forbiddenRemaining.slice());
      if (result.teacherTone.length) fail("no_teacher_tone", result.teacherTone.slice());
      if (result.profileIssues.length) fail("no_teen_bot_profile_issues", result.profileIssues.slice());
      if (!buildTag || !commit || !smokeVersion) fail("identity_fields_returned", { buildTag, commit, smokeVersion });
      if (smokeVersion !== `step3_5_zoomer_npc_speech_v1_${buildTag}_commit_${commit}` || smokeVersion.indexOf("step3_5") === -1 || smokeVersion.indexOf(String(commit || "")) === -1) {
        fail("smoke_version_unique_for_commit", smokeVersion);
      }
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.inventoryExists === true
      && result.checkedCount > 0
      && result.missingCoverage.length === 0
      && result.forbiddenRemaining.length === 0
      && result.teacherTone.length === 0
      && result.profileIssues.length === 0
      && result.failures.length === 0
      && result.failedChecks.length === 0
      && !!result.buildTag
      && !!result.commit
      && !!result.smokeVersion
      && result.smokeVersion.indexOf(String(result.commit || "")) !== -1
      && result.covered.step34SystemTexts === 1;
    return result;
  };


  NPCSpeech.smokeZoomerNpcRoleDifferentiationOnce = function smokeZoomerNpcRoleDifferentiationOnce() {
    const buildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || Game.__buildTag || (Game.__DEV && Game.__DEV.buildTag) || null;
    const commit = (typeof window !== "undefined" && window.__COMMIT__) || Game.__commit || (Game.__DEV && Game.__DEV.commit) || null;
    const smokeVersion = `step6_5_runtime_identity_fix_smoke_v20260606_002_${buildTag}_commit_${commit}`;
    const checkedRoles = ["cop", "bandit", "toxic", "mafia", "neutral", "crowd"];
    const result = {
      ok: false,
      buildTag,
      commit,
      smokeVersion,
      checkedRoles: checkedRoles.slice(),
      roleProfilesPresent: false,
      roleOverlapHits: [],
      indistinguishableRoles: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const addUnique = (list, value) => {
      const key = JSON.stringify(value);
      if (!list.some((item) => JSON.stringify(item) === key)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? { check } : { check, detail });
    };
    const normalize = (value) => String(value == null ? "" : value).replace(/ё/g, "е").replace(/\s+/g, " ").trim().toLocaleLowerCase("ru-RU");
    const markerHit = (text, marker) => {
      const hay = normalize(text);
      const needle = normalize(marker);
      if (!needle) return false;
      if (/^[а-яеa-z0-9]+$/i.test(needle) && needle.length <= 3) return new RegExp(`(^|[^а-яеa-z0-9])${needle}(?=$|[^а-яеa-z0-9])`, "i").test(hay);
      return hay.indexOf(needle) !== -1;
    };
    const listLines = (role) => {
      const lines = [];
      const say = NPC && NPC.SAY && NPC.SAY[role];
      if (say) ["m", "f"].forEach((sex) => (Array.isArray(say[sex]) ? say[sex] : []).forEach((line) => lines.push({ source: `NPC.SAY.${role}.${sex}`, line })));
      const templates = NPCSpeech.TEMPLATES_BY_LOCALE && NPCSpeech.TEMPLATES_BY_LOCALE.ru;
      (NPCSpeech.BLOCKS || []).forEach((block) => (NPCSpeech.CHANNELS || []).forEach((channel) => (NPCSpeech.INTENSITIES || []).forEach((intensity) => {
        const pool = templates && templates[block] && templates[block][role] && templates[block][role][channel] && templates[block][role][channel][intensity];
        (Array.isArray(pool) ? pool : []).forEach((line) => lines.push({ source: `NPCSpeech.ru.${block}.${role}.${channel}.${intensity}`, line }));
      })));
      return lines;
    };
    try {
      const profiles = NPCSpeech.ROLE_PROFILES || {};
      result.roleProfilesPresent = checkedRoles.every((role) => profiles[role] && Array.isArray(profiles[role].traits) && profiles[role].traits.length >= 2 && Array.isArray(profiles[role].markers) && profiles[role].markers.length >= 4);
      if (!result.roleProfilesPresent) fail("role_profiles_present", profiles);
      const profileSignatures = Object.create(null);
      checkedRoles.forEach((role) => {
        const profile = profiles[role] || {};
        const markers = Array.isArray(profile.markers) ? profile.markers : [];
        const traits = Array.isArray(profile.traits) ? profile.traits : [];
        profileSignatures[role] = markers.map(normalize).sort().join("|");
        if (!traits.length) addUnique(result.missingCoverage, `profile_traits:${role}`);
        if (!markers.length) addUnique(result.missingCoverage, `profile_markers:${role}`);
        const lines = listLines(role);
        if (!lines.length) addUnique(result.missingCoverage, `speech:${role}`);
        lines.forEach((row) => {
          const text = normalize(row.line);
          if (!text) fail("empty_speech_line", { role, source: row.source });
          if (role === "toxic" && text.length > 48) fail("toxic_line_too_long", { role, source: row.source, line: row.line });
          if ((role === "cop" || role === "mafia") && text.length > 56) fail("minimal_role_line_too_long", { role, source: row.source, line: row.line });
          if (!markers.some((marker) => markerHit(text, marker))) addUnique(result.indistinguishableRoles, { role, source: row.source, line: row.line, reason: "missing_role_marker" });
          checkedRoles.filter((other) => other !== role).forEach((other) => {
            const otherMarkers = profiles[other] && Array.isArray(profiles[other].markers) ? profiles[other].markers : [];
            otherMarkers.forEach((marker) => {
              if (markerHit(text, marker)) addUnique(result.roleOverlapHits, { role, other, marker, source: row.source, line: row.line });
            });
          });
          ["докажи", "урок", "запомни", "ты должен", "следует", "необходимо", "правильный выбор", "лучшее решение", "Console.txt"].forEach((term) => {
            if (markerHit(text, term)) addUnique(result.forbiddenRemaining, { role, source: row.source, term, line: row.line });
          });
        });
      });
      checkedRoles.forEach((a, idx) => checkedRoles.slice(idx + 1).forEach((b) => {
        if (profileSignatures[a] && profileSignatures[a] === profileSignatures[b]) addUnique(result.indistinguishableRoles, { roles: [a, b], reason: "same_profile_signature" });
      }));
      if (result.roleOverlapHits.length) addUnique(result.failedChecks, "role_overlap_hits");
      if (result.indistinguishableRoles.length) addUnique(result.failedChecks, "indistinguishable_roles");
      if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
      if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
      const identityOk = (value) => String(value || "").indexOf("step6_5_runtime_identity_fix") !== -1 || String(value || "").indexOf("step6_6_npc_dm_profile") !== -1;
      if (!buildTag || !identityOk(buildTag)) fail("build_tag_identifies_step6_5_or_later", buildTag);
      if (!commit || !identityOk(commit)) fail("commit_identifies_step6_5_or_later", commit);
      if (!smokeVersion || smokeVersion.indexOf("step6_5_runtime_identity_fix_smoke_v20260606_002") === -1 || smokeVersion.indexOf(String(commit || "")) === -1) fail("smoke_version_unique_for_step6_5", smokeVersion);
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.roleProfilesPresent === true
      && result.roleOverlapHits.length === 0
      && result.indistinguishableRoles.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  NPCSpeech.smokeZoomerNpcShorteningOnce = function smokeZoomerNpcShorteningOnce() {
    const buildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || Game.__buildTag || (Game.__DEV && Game.__DEV.buildTag) || null;
    const commit = (typeof window !== "undefined" && window.__COMMIT__) || Game.__commit || (Game.__DEV && Game.__DEV.commit) || null;
    const smokeVersion = `step6_4_npc_template_shortening_safari_smoke_exposure_v2_20260606_${buildTag}_commit_${commit}`;
    const result = {
      ok: false,
      buildTag,
      commit,
      smokeVersion,
      checkedCount: 0,
      averageReductionPercent: 0,
      semanticDrift: [],
      informationLoss: [],
      roleIdentityLoss: [],
      shorteningCoverage: { battle: 0, dm: 0, event: 0, report: 0, crowd: 0 },
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const addUnique = (list, value) => {
      const key = JSON.stringify(value);
      if (!list.some((item) => JSON.stringify(item) === key)) list.push(value);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? { check } : { check, detail });
    };
    const normalize = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim().toLocaleLowerCase("ru-RU");
    const getPath = (root, path) => String(path || "").split(".").reduce((value, key) => {
      if (value == null) return undefined;
      if (/^\d+$/.test(key)) return value[Number(key)];
      return value[key];
    }, root);
    const rows = [
      { scope: "dm", role: "toxic", source: "NPC.SAY.toxic.m.0", before: "ты уверен в этой позиции", after: "уверен в позиции", must: ["уверен", "позиции"] },
      { scope: "battle", role: "toxic", source: "NPC.SAY.toxic.m.3", before: "не тяни, ответ нужен сейчас", after: "не тяни, отвечай", must: ["не тяни", "отвечай"] },
      { scope: "event", role: "toxic", source: "NPC.SAY.toxic.m.4", before: "толпа услышала, теперь докажи", after: "толпа слышит, докажи", must: ["толпа", "докажи"] },
      { scope: "dm", role: "bandit", source: "NPC.SAY.bandit.m.8", before: "шаг назад и слушай", after: "шаг назад, слушай", must: ["шаг назад", "слушай"] },
      { scope: "battle", role: "bandit", source: "NPC.SAY.bandit.m.11", before: "ответишь — потеряешь больше", after: "ответишь — потеряешь", must: ["ответишь", "потеряешь"] },
      { scope: "dm", role: "cop", source: "NPC.SAY.cop.m.0", before: "Я на связи. Держим дистанцию", after: "На связи. Дистанция", must: ["связи", "дистанция"] },
      { scope: "report", role: "cop", source: "Game.Data.COP_TEMPLATES.toxicDescriptions.0", before: "Токсик — хамоватая тень, прячется за оскорблениями и агрессией.", after: "Токсик прячется за оскорблениями.", must: ["токсик", "оскорбления"] },
      { scope: "report", role: "cop", source: "Game.Data.COP_TEMPLATES.banditDescriptions.0", before: "Бандит — драчун с холодными глазами, ищет наживу.", after: "Бандит ищет наживу.", must: ["бандит", "наживу"] },
      { scope: "report", role: "cop", source: "Game.Data.COP_TEMPLATES.scolds.4", before: "Деталей не хватило, «Сдать» вызвало переполох.", after: "Деталей мало, «Сдать» шумит.", must: ["детал", "сдать"] },
      { scope: "event", role: "mafia", source: "NPC.SAY.mafia.m.0", before: "Добрый вечер. Говорим спокойно", after: "Добрый вечер. Спокойно", must: ["вечер", "спокойно"] },
      { scope: "dm", role: "mafia", source: "NPC.SAY.mafia.m.6", before: "договоримся без лишних глаз", after: "договоримся без глаз", must: ["договоримся", "глаз"] },
      { scope: "crowd", role: "crowd", source: "NPC.SAY.crowd.m.4", before: "шумно на площади, но я остаюсь", after: "площадь шумит, остаюсь", must: ["площад", "остаюсь"] },
      { scope: "crowd", role: "crowd", source: "Game.Data.NPC_CHAT_LINES.1", before: "я смотрю со стороны", after: "смотрю со стороны", must: ["смотрю", "стороны"] },
      { scope: "crowd", role: "crowd", source: "Game.Data.NPC_CHAT_LINES.6", before: "мне скучно, нужен ход", after: "скучно, нужен ход", must: ["скучно", "ход"] },
      { scope: "crowd", role: "crowd", source: "Game.Data.NPC_CHAT_LINES.24", before: "я тут из-за шума", after: "тут из-за шума", must: ["тут", "шума"] },
      { scope: "dm", role: "bandit", source: "villainQuestions.1", before: "это про тебя? отвечай", after: "про тебя? отвечай", must: ["про тебя", "отвечай"] },
      { scope: "battle", role: "bandit", source: "villainChallenges.1", before: "готовность видна — раунд рядом", after: "готов к раунду", must: ["готов", "раунд"] },
      { scope: "dm", role: "toxic", source: "NPCSpeech.TEMPLATES_BY_LOCALE.ru.greetings.toxic.dm.y.0", before: "личка: {PLAYER}, покажи позицию", after: "личка: {PLAYER}, позицию", must: ["личка", "позицию"] },
      { scope: "event", role: "neutral", source: "NPCSpeech.TEMPLATES_BY_LOCALE.ru.threats.neutral.event.y.0", before: "у {PLACE}: конфликт растет", after: "{PLACE}: конфликт выше", must: ["{place}", "конфликт"] },
      { scope: "battle", role: "toxic", source: "NPCSpeech.TEMPLATES_BY_LOCALE.ru.victory.toxic.battle.y.1", before: "спор: сказал жестко и точно", after: "спор: жестко и точно", must: ["спор", "жестко", "точно"] }
    ];
    const roleHints = {
      cop: ["связ", "дистанц", "токсик", "бандит", "сдать", "детал"],
      mafia: ["вечер", "спокой", "договор", "глаз"],
      bandit: ["шаг", "слуш", "ответ", "потер", "раунд", "готов", "про тебя"],
      toxic: ["уверен", "позици", "отвеч", "докажи", "жестко"],
      neutral: ["конфликт", "площад", "тема"],
      crowd: ["площад", "смотр", "скучно", "шум"]
    };
    const forbidden = ["просто", "как бы", "ну типа", "давайте", "лишних", "теперь", "уже", "сейчас станет", "если он есть", "можем реагировать на каждый", "ради хайпа", "треш-стрим"];
    try {
      const root = { NPC, Game, villainQuestions, villainChallenges, NPCSpeech };
      let beforeChars = 0;
      let afterChars = 0;
      rows.forEach((row) => {
        result.checkedCount += 1;
        result.shorteningCoverage[row.scope] = (result.shorteningCoverage[row.scope] || 0) + 1;
        const currentRaw = getPath(root, row.source);
        const current = normalize(currentRaw);
        const expected = normalize(row.after);
        beforeChars += String(row.before || "").length;
        afterChars += String(currentRaw || "").length;
        if (current !== expected) addUnique(result.semanticDrift, { source: row.source, expected: row.after, actual: String(currentRaw || "") });
        (row.must || []).forEach((token) => {
          if (current.indexOf(normalize(token)) === -1) addUnique(result.informationLoss, { source: row.source, missing: token, text: String(currentRaw || "") });
        });
        const hints = roleHints[row.role] || [];
        if (hints.length && !hints.some((hint) => current.indexOf(normalize(hint)) !== -1)) {
          addUnique(result.roleIdentityLoss, { source: row.source, role: row.role, text: String(currentRaw || "") });
        }
        forbidden.forEach((term) => {
          const needle = normalize(term);
          const wordOnly = /^[а-яёa-z0-9]+$/i.test(needle);
          const hit = wordOnly
            ? new RegExp(`(^|[^а-яёa-z0-9])${needle}(?=$|[^а-яёa-z0-9])`, "i").test(current)
            : current.indexOf(needle) !== -1;
          if (hit) addUnique(result.forbiddenRemaining, { source: row.source, term, text: String(currentRaw || "") });
        });
      });
      result.averageReductionPercent = beforeChars > 0 ? Math.round(((beforeChars - afterChars) / beforeChars) * 1000) / 10 : 0;
      ["battle", "dm", "event", "report", "crowd"].forEach((scope) => {
        if (!result.shorteningCoverage[scope]) addUnique(result.missingCoverage, scope);
      });
      if (result.averageReductionPercent < 20 || result.averageReductionPercent > 40) fail("average_reduction_percent_out_of_range", result.averageReductionPercent);
      if (result.semanticDrift.length) fail("semantic_drift", result.semanticDrift.slice());
      if (result.informationLoss.length) fail("information_loss", result.informationLoss.slice());
      if (result.roleIdentityLoss.length) fail("role_identity_loss", result.roleIdentityLoss.slice());
      if (result.forbiddenRemaining.length) fail("forbidden_remaining", result.forbiddenRemaining.slice());
      if (result.missingCoverage.length) fail("missing_coverage", result.missingCoverage.slice());
      const identityOk = (value) => String(value || "").indexOf("step6_4_npc_template_shortening") !== -1 || String(value || "").indexOf("step6_6_npc_dm_profile") !== -1;
      if (!buildTag || !identityOk(buildTag)) fail("build_tag_identifies_runtime_build", buildTag);
      if (!commit || !identityOk(commit)) fail("commit_identifies_task_commit", commit);
      if (!smokeVersion || smokeVersion.indexOf("step6_4_npc_template_shortening_safari_smoke_exposure_v2_20260606") === -1 || smokeVersion.indexOf(String(commit || "")) === -1) fail("smoke_version_unique_for_commit", smokeVersion);
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.checkedCount > 0
      && result.averageReductionPercent >= 20
      && result.averageReductionPercent <= 40
      && result.semanticDrift.length === 0
      && result.informationLoss.length === 0
      && result.roleIdentityLoss.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };


  NPCSpeech.smokeZoomerNpcDmProfileOnce = function smokeZoomerNpcDmProfileOnce() {
    const buildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || Game.__buildTag || (Game.__DEV && Game.__DEV.buildTag) || null;
    const commit = (typeof window !== "undefined" && window.__COMMIT__) || Game.__commit || (Game.__DEV && Game.__DEV.commit) || null;
    const smokeVersion = `step6_6_npc_dm_profile_runtime_fail_fix_smoke_v20260606_001_${buildTag}_commit_${commit}`;
    const roles = ["cop", "mafia", "bandit", "toxic", "neutral"];
    const result = {
      ok: false,
      buildTag,
      commit,
      smokeVersion,
      checkedCount: 0,
      monologueHits: [],
      longMessageHits: [],
      bookDialogueHits: [],
      lectureHits: [],
      roleIdentityLoss: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const addUnique = (list, value) => { const key = JSON.stringify(value); if (!list.some((item) => JSON.stringify(item) === key)) list.push(value); };
    const fail = (check, detail) => { addUnique(result.failedChecks, check); addUnique(result.failures, detail === undefined ? { check } : { check, detail }); };
    const normalize = (value) => String(value == null ? "" : value).replace(/ё/g, "е").replace(/\s+/g, " ").trim().toLocaleLowerCase("ru-RU");
    const markerHit = (text, marker) => {
      const hay = normalize(text);
      const needle = normalize(marker);
      if (!needle) return false;
      if (/^[а-яеa-z0-9]+$/i.test(needle) && needle.length <= 3) return new RegExp(`(^|[^а-яеa-z0-9])${needle}(?=$|[^а-яеa-z0-9])`, "i").test(hay);
      return hay.indexOf(needle) !== -1;
    };
    const lineCount = (text) => String(text || "").split(/\n+/).filter((line) => line.trim()).length || 1;
    const sentenceCount = (text) => (String(text || "").match(/[.!?]+/g) || []).length;
    const wordCount = (text) => String(text || "").split(/\s+/).filter(Boolean).length;
    const addLine = (rows, role, source, line) => {
      const text = String(line == null ? "" : line).replace(/\s+/g, " ").trim();
      if (text) rows.push({ role, source, text });
    };
    const collectTemplateLines = () => {
      const rows = [];
      roles.forEach((role) => ((NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES[role]) || []).forEach((line, index) => addLine(rows, role, `NPC.DM_PROFILE_LINES.${role}.${index}`, line)));
      (villainQuestions || []).forEach((line, index) => addLine(rows, "bandit", `villainQuestions.${index}`, line));
      (villainChallenges || []).forEach((line, index) => addLine(rows, "bandit", `villainChallenges.${index}`, line));
      const templates = NPCSpeech.TEMPLATES_BY_LOCALE && NPCSpeech.TEMPLATES_BY_LOCALE.ru;
      (NPCSpeech.BLOCKS || []).forEach((block) => roles.forEach((role) => (NPCSpeech.INTENSITIES || []).forEach((intensity) => {
        const pool = templates && templates[block] && templates[block][role] && templates[block][role].dm && templates[block][role].dm[intensity];
        (Array.isArray(pool) ? pool : []).forEach((line, index) => addLine(rows, role, `NPCSpeech.ru.${block}.${role}.dm.${intensity}.${index}`, line));
      })));
      roles.forEach((role) => {
        const npc = (NPC.PLAYERS || []).find((p) => p && (role === "neutral" ? !["cop", "mafia", "bandit", "toxic"].includes(p.role) : p.role === role));
        if (npc && typeof NPC.generateDmLine === "function") addLine(rows, role, `NPC.generateDmLine.${role}`, NPC.generateDmLine(npc, { source: "step6_6_smoke", block: "neutral", tick: `step6_6_${role}` }));
      });
      return rows;
    };
    const roleMarkers = {
      cop: ["принято", "дистанц", "связ", "фиксирую", "поряд", "заявление", "рапорт", "нарушение", "эскалации", "сигнал", "движ", "пиши", "протокол"],
      mafia: ["тих", "тихо", "тише", "шум", "след", "свидетел", "взвешено", "счет", "счёт", "долг", "тишина", "итог", "говорим", "спокойно"],
      bandit: ["кошелек", "плати", "стой", "торга", "забрал", "плата", "добыча", "решай", "выход", "фокусов", "раунд", "дело", "тебя", "здесь", "слово", "тема", "спор"],
      toxic: ["слаб", "ответ", "отвечай", "пряч", "жест", "давление", "трещит", "резче", "позиция"],
      neutral: ["вижу", "наблюд", "замет", "тема", "со стороны", "смотрю", "шум", "шумно", "понял", "давления", "гудит"]
    };
    const bookRe = /[«»]|—\s*[А-ЯЁA-Z]|сказал\(|произнес|ответил\(|воскликнул|молвил|диалог|реплика|глава|герой|повеств/i;
    const lectureRe = /потому что|следует|необходимо|рекомендуется|запомни|урок|объясняю|вывод|правильн|лучшее решение|ты должен|надо понимать|механика|подробно|информация/i;
    const forbiddenRe = /Console\.txt|кринж|вайб|рофл|лол|кек|хайп|мем|скибиди|ну типа|как бы|по факту лол/i;
    try {
      const rows = collectTemplateLines();
      const seen = Object.create(null);
      rows.forEach((row) => {
        result.checkedCount += 1;
        seen[row.role] = true;
        const text = row.text;
        const words = wordCount(text);
        if (lineCount(text) > 2 || sentenceCount(text) > 2) addUnique(result.monologueHits, { source: row.source, role: row.role, text });
        if (words > 8 || text.length > 72) addUnique(result.longMessageHits, { source: row.source, role: row.role, words, length: text.length, text });
        if (bookRe.test(text)) addUnique(result.bookDialogueHits, { source: row.source, role: row.role, text });
        if (lectureRe.test(text)) addUnique(result.lectureHits, { source: row.source, role: row.role, text });
        if (forbiddenRe.test(text)) addUnique(result.forbiddenRemaining, { source: row.source, role: row.role, text });
        const markers = roleMarkers[row.role] || [];
        if (!markers.some((marker) => markerHit(text, marker))) addUnique(result.roleIdentityLoss, { source: row.source, role: row.role, text });
      });
      roles.forEach((role) => { if (!seen[role]) addUnique(result.missingCoverage, `role:${role}`); });
      ["NPC.DM_PROFILE_LINES", "NPCSpeech.dm", "villainQuestions", "villainChallenges", "NPC.generateDmLine"].forEach((label) => {
        if (!rows.some((row) => row.source.indexOf(label) === 0 || row.source.indexOf(label.replace("NPCSpeech.dm", "NPCSpeech.ru")) === 0)) addUnique(result.missingCoverage, label);
      });
      if (!buildTag || String(buildTag).indexOf("step6_6_npc_dm_profile") === -1) fail("build_tag_identifies_step6_6", buildTag);
      if (!commit || String(commit).indexOf("step6_6_npc_dm_profile") === -1) fail("commit_identifies_step6_6", commit);
      if (!smokeVersion || smokeVersion.indexOf("step6_6_npc_dm_profile_runtime_fail_fix_smoke_v20260606_001") === -1 || smokeVersion.indexOf(String(commit || "")) === -1) fail("smoke_version_unique_for_step6_6", smokeVersion);
      if (result.monologueHits.length) addUnique(result.failedChecks, "monologue_hits");
      if (result.longMessageHits.length) addUnique(result.failedChecks, "long_message_hits");
      if (result.bookDialogueHits.length) addUnique(result.failedChecks, "book_dialogue_hits");
      if (result.lectureHits.length) addUnique(result.failedChecks, "lecture_hits");
      if (result.roleIdentityLoss.length) addUnique(result.failedChecks, "role_identity_loss");
      if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
      if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.checkedCount > 0
      && result.monologueHits.length === 0
      && result.longMessageHits.length === 0
      && result.bookDialogueHits.length === 0
      && result.lectureHits.length === 0
      && result.roleIdentityLoss.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  Game.NPCSpeech = NPCSpeech;
  Game.NPC_SPEECH_PROFILE_ZOOMER = NPC_SPEECH_PROFILE_ZOOMER;
  Game.NPC_ROLE_RULES_ZOOMER = NPC_ROLE_RULES_ZOOMER;
  Game.NPC_STOP_PHRASES = NPC_STOP_PHRASES;
  Game.NPC_TEMPLATE_SET_Z = NPC_TEMPLATE_SET_Z;
  Game.NPC_SPEECH_RULES_ZOOMER = NPC_ROLE_RULES_ZOOMER;
  Game.NPC_SPEECH_FORBIDDEN_PATTERNS = NPC_STOP_PHRASES;
  if (typeof window !== "undefined") {
    window.NPC_SPEECH_PROFILE_ZOOMER = NPC_SPEECH_PROFILE_ZOOMER;
    window.NPC_ROLE_RULES_ZOOMER = NPC_ROLE_RULES_ZOOMER;
    window.NPC_STOP_PHRASES = NPC_STOP_PHRASES;
    window.NPC_TEMPLATE_SET_Z = NPC_TEMPLATE_SET_Z;
  }

  NPCSpeech.smokeZoomerNpcTemplateSetOnce = function smokeZoomerNpcTemplateSetOnce() {
    const BUILD_TAG = "build_2026_06_06_step6_9_final_z_npc_template_set";
    const COMMIT = "step6_9_final_z_npc_template_set";
    const SMOKE_VERSION = "step6_9_final_z_npc_template_set_smoke_v20260606_001";
    const result = {
      ok: false,
      buildTag: BUILD_TAG,
      commit: COMMIT,
      smokeVersion: SMOKE_VERSION,
      artifactsPresent: false,
      checkedCount: 0,
      shortDirectAliveOk: false,
      teenSlangHits: [],
      memeHits: [],
      mentoringHits: [],
      teacherToneHits: [],
      roleIdentityLoss: [],
      identicalPhraseClusters: [],
      futureTemplateBypassPaths: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const addUnique = (arr, item) => { const key = JSON.stringify(item); if (!arr.some(x => JSON.stringify(x) === key)) arr.push(item); };
    const fail = (code, detail) => { addUnique(result.failures, detail === undefined ? code : { code, detail }); addUnique(result.failedChecks, code); };
    const norm = (value) => String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
    const hasTerm = (line, term) => {
      const low = norm(line);
      const t = norm(term);
      if (!t) return false;
      if (/^[a-zа-я0-9]+$/i.test(t)) return new RegExp(`(^|[^a-zа-я0-9])${escapeRe(t)}([^a-zа-я0-9]|$)`, "i").test(low);
      return low.indexOf(t) !== -1;
    };
    const collect = (value, path, out) => {
      if (Array.isArray(value)) return value.forEach((item, index) => collect(item, `${path}.${index}`, out));
      if (value && typeof value === "object") return Object.keys(value).forEach((key) => collect(value[key], `${path}.${key}`, out));
      out.push({ path, line: String(value == null ? "" : value) });
    };
    try {
      const profile = Game.NPC_SPEECH_PROFILE_ZOOMER;
      const rules = Game.NPC_ROLE_RULES_ZOOMER;
      const stops = Game.NPC_STOP_PHRASES;
      const set = Game.NPC_TEMPLATE_SET_Z;
      result.artifactsPresent = !!(profile && profile.id === "NPC_SPEECH_PROFILE_ZOOMER" && rules && stops && set && set.id === "NPC_TEMPLATE_SET_Z" && set.templatesByLocale && set.templatesByLocale.ru);
      if (!result.artifactsPresent) fail("artifacts_present");
      ["cop", "mafia", "bandit", "toxic", "neutral", "crowd"].forEach((role) => { if (!rules || !rules[role]) addUnique(result.missingCoverage, `role:${role}`); });
      ["teenSlang", "memes", "mentoring", "teacherTone"].forEach((bucket) => { if (!stops || !Array.isArray(stops[bucket]) || !stops[bucket].length) addUnique(result.missingCoverage, `stop:${bucket}`); });
      ["greetings", "threats", "victory", "defeat", "neutral"].forEach((block) => { if (!set || !set.templatesByLocale || !set.templatesByLocale.ru || !set.templatesByLocale.ru[block]) addUnique(result.missingCoverage, `block:${block}`); });
      const rows = [];
      if (set && set.templatesByLocale && set.templatesByLocale.ru) collect(set.templatesByLocale.ru, "NPC_TEMPLATE_SET_Z.templatesByLocale.ru", rows);
      const renderedRows = rows.map((row) => ({ path: row.path, line: cleanNpcSpeechLine(replaceNpcSpeechVars(row.line, { PLAYER: "Игрок", PLACE: "Площадь", TOPIC: "спор" })) })).filter(row => row.line);
      result.checkedCount = renderedRows.length;
      if (result.checkedCount < 700) fail("checked_count_low", result.checkedCount);
      const stopMap = [
        ["teenSlangHits", "teenSlang"],
        ["memeHits", "memes"],
        ["mentoringHits", "mentoring"],
        ["teacherToneHits", "teacherTone"]
      ];
      renderedRows.forEach((row) => {
        const words = norm(row.line).split(/\s+/).filter(Boolean);
        if (words.length > 6 || row.line.length > 48 || /[,;:]{2,}|\.\.\.|потому что|если не ошиб|вероятно|возможно/i.test(row.line)) fail("not_short_direct_alive", row);
        stopMap.forEach(([hitKey, bucket]) => (stops[bucket] || []).forEach((term) => { if (hasTerm(row.line, term)) addUnique(result[hitKey], { term, path: row.path, line: row.line }); }));
        const parts = row.path.split(".");
        const role = parts[4];
        const roleRule = rules && rules[role];
        const markers = roleRule && Array.isArray(roleRule.markers) ? roleRule.markers : [];
        if (markers.length && !markers.some((marker) => norm(row.line).indexOf(norm(marker)) !== -1)) addUnique(result.roleIdentityLoss, row);
      });
      const byLine = Object.create(null);
      renderedRows.forEach((row) => {
        const key = norm(row.line).replace(/[!?.,:;]/g, "");
        (byLine[key] ||= []).push(row.path);
      });
      Object.keys(byLine).forEach((line) => { if (byLine[line].length > 1) addUnique(result.identicalPhraseClusters, { line, paths: byLine[line] }); });
      if (NPCSpeech.TEMPLATES_BY_LOCALE !== set.templatesByLocale) addUnique(result.futureTemplateBypassPaths, "Game.NPCSpeech.TEMPLATES_BY_LOCALE");
      if (NPCSpeech.TEMPLATES !== set.templatesByLocale.ru) addUnique(result.futureTemplateBypassPaths, "Game.NPCSpeech.TEMPLATES");
      if (!NPCSpeech.NPC_TEMPLATE_SET_Z || NPCSpeech.NPC_TEMPLATE_SET_Z !== set) addUnique(result.futureTemplateBypassPaths, "Game.NPCSpeech.NPC_TEMPLATE_SET_Z");
      result.forbiddenRemaining = [].concat(result.teenSlangHits, result.memeHits, result.mentoringHits, result.teacherToneHits);
      if (result.teenSlangHits.length) addUnique(result.failedChecks, "teen_slang_hits_empty");
      if (result.memeHits.length) addUnique(result.failedChecks, "meme_hits_empty");
      if (result.mentoringHits.length) addUnique(result.failedChecks, "mentoring_hits_empty");
      if (result.teacherToneHits.length) addUnique(result.failedChecks, "teacher_tone_hits_empty");
      if (result.roleIdentityLoss.length) addUnique(result.failedChecks, "role_identity_loss_empty");
      if (result.identicalPhraseClusters.length) addUnique(result.failedChecks, "identical_phrase_clusters_empty");
      if (result.futureTemplateBypassPaths.length) addUnique(result.failedChecks, "future_template_bypass_paths_empty");
      if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage_empty");
      if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining_empty");
      result.shortDirectAliveOk = result.failures.filter(f => (typeof f === "string" ? f : f && f.code) === "not_short_direct_alive").length === 0 && result.checkedCount > 0;
      if (!result.shortDirectAliveOk) addUnique(result.failedChecks, "short_direct_alive_ok");
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.artifactsPresent === true
      && result.shortDirectAliveOk === true
      && result.teenSlangHits.length === 0
      && result.memeHits.length === 0
      && result.mentoringHits.length === 0
      && result.teacherToneHits.length === 0
      && result.roleIdentityLoss.length === 0
      && result.identicalPhraseClusters.length === 0
      && result.futureTemplateBypassPaths.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  Game.__DEV ||= {};
  Game.__DEV.smokeNpcSpeechTemplateScaffoldOnce = function smokeNpcSpeechTemplateScaffoldOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeTemplateScaffoldOnce === "function"
      ? Game.NPCSpeech.smokeTemplateScaffoldOnce()
      : { ok: false, failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };

  Game.__DEV.smokeNpcSpeechLocaleOnce = function smokeNpcSpeechLocaleOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeLocaleOnce === "function"
      ? Game.NPCSpeech.smokeLocaleOnce()
      : { ok: false, failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };

  Game.__DEV.smokeZoomerNpcSpeechOnce = function smokeZoomerNpcSpeechOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeZoomerNpcSpeechOnce === "function"
      ? Game.NPCSpeech.smokeZoomerNpcSpeechOnce()
      : { ok: false, failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };

  Game.__DEV.smokeNpcSpeechMillennialWordingOnce = function smokeNpcSpeechMillennialWordingOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeMillennialWordingOnce === "function"
      ? Game.NPCSpeech.smokeMillennialWordingOnce()
      : { ok: false, failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };

  Game.__DEV.smokeZoomerNpcShorteningOnce = function smokeZoomerNpcShorteningOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeZoomerNpcShorteningOnce === "function"
      ? Game.NPCSpeech.smokeZoomerNpcShorteningOnce()
      : { ok: false, buildTag: null, commit: null, smokeVersion: "step6_4_npc_template_shortening_safari_smoke_exposure_missing", checkedCount: 0, averageReductionPercent: 0, semanticDrift: [], informationLoss: [], roleIdentityLoss: [], shorteningCoverage: {}, failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };


  Game.__DEV.smokeZoomerNpcRoleDifferentiationOnce = function smokeZoomerNpcRoleDifferentiationOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeZoomerNpcRoleDifferentiationOnce === "function"
      ? Game.NPCSpeech.smokeZoomerNpcRoleDifferentiationOnce()
      : { ok: false, buildTag: null, commit: null, smokeVersion: "step6_5_npc_role_differentiation_missing", checkedRoles: [], roleProfilesPresent: false, roleOverlapHits: [], indistinguishableRoles: [], failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };


  Game.__DEV.smokeZoomerNpcDmProfileOnce = function smokeZoomerNpcDmProfileOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeZoomerNpcDmProfileOnce === "function"
      ? Game.NPCSpeech.smokeZoomerNpcDmProfileOnce()
      : { ok: false, buildTag: null, commit: null, smokeVersion: "step6_6_npc_dm_profile_runtime_fail_fix_missing", checkedCount: 0, monologueHits: [], longMessageHits: [], bookDialogueHits: [], lectureHits: [], roleIdentityLoss: [], failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };


  Game.__DEV.smokeZoomerNpcTemplateSetOnce = function smokeZoomerNpcTemplateSetOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeZoomerNpcTemplateSetOnce === "function"
      ? Game.NPCSpeech.smokeZoomerNpcTemplateSetOnce()
      : { ok: false, buildTag: null, commit: null, smokeVersion: "step6_9_final_z_npc_template_set_missing", artifactsPresent: false, checkedCount: 0, shortDirectAliveOk: false, teenSlangHits: [], memeHits: [], mentoringHits: [], teacherToneHits: [], roleIdentityLoss: [], identicalPhraseClusters: [], futureTemplateBypassPaths: [], failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
  };

  Game.__DEV.smokeZoomerFeelStep651NpcSayDmProfileRouting = function smokeZoomerFeelStep651NpcSayDmProfileRouting() {
    const BUILD_TAG = "build_2026_06_15_step6_5_1_npc_say_dm_profile_routing";
    const COMMIT = "step6_5_1_npc_say_dm_profile_routing";
    const SMOKE_VERSION = "step6_5_1_npc_say_dm_profile_routing_smoke_v20260615_001";
    const result = {
      buildTag: BUILD_TAG,
      commit: COMMIT,
      smokeVersion: SMOKE_VERSION,
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      samples: {},
      summary: {
        checkedRoles: ["toxic", "bandit", "cop", "mafia", "crowd", "neutral", "villainQuestion", "villainChallenge"],
        chatSampleCount: 0,
        dmSampleCount: 0,
        villainSampleCount: 0,
        millennialZoomerDifferentCount: 0,
        unchangedCount: 0,
        routedChatCount: 0,
        routedDmCount: 0,
        routedVillainCount: 0
      }
    };
    const addUnique = (arr, item) => {
      const key = JSON.stringify(item);
      if (!arr.some((x) => JSON.stringify(x) === key)) arr.push(item);
    };
    const fail = (code, detail) => {
      addUnique(result.failedChecks, code);
      addUnique(result.failures, detail === undefined ? { code } : { code, detail });
    };
    const D = Game.Data || {};
    const beforeProfile = typeof D.getUiProfile === "function" ? D.getUiProfile() : String(D.UI_PROFILE || "millennial").trim();
    const beforeTextMode = typeof D.TEXT_MODE === "string" ? D.TEXT_MODE : null;
    const beforePick = D && typeof D.pick === "function" ? D.pick : null;
    const beforeRandom = Math.random;
    const setProfile = (profile) => {
      if (D && typeof D.setUiProfile === "function") D.setUiProfile(profile);
      else if (D) D.UI_PROFILE = profile;
      if (D && typeof D.TEXT_MODE === "string") D.TEXT_MODE = profile === "zoomer" ? "zoomer" : "millennial";
    };
    const restore = () => {
      if (D && typeof D.setUiProfile === "function") D.setUiProfile(beforeProfile || "millennial");
      else if (D) D.UI_PROFILE = beforeProfile || "millennial";
      if (D && typeof D.TEXT_MODE === "string") D.TEXT_MODE = beforeTextMode == null ? "millennial" : beforeTextMode;
      if (D && beforePick) D.pick = beforePick;
      if (beforeRandom) Math.random = beforeRandom;
    };
    const runProfile = (profile, fn) => {
      setProfile(profile);
      try {
        return fn();
      } finally {
        restore();
      }
    };
    const samples = result.samples;
    let currentSampleKey = "";
    const capture = (key, profile, fn) => runProfile(profile, () => {
      try {
        return String(fn() || "");
      } catch (err) {
        fail("sample_exception", { key, profile, message: err && err.message ? String(err.message) : String(err) });
        return "";
      }
    });
    const samplePickIndex = {
      toxic: 0,
      bandit: 0,
      cop: 0,
      mafia: 1,
      crowd: 1,
      toxicDm: 0,
      banditDm: 3,
      copDm: 4,
      mafiaDm: 4,
      neutralDm: 1,
      villainQuestion: 0,
      villainChallenge: 1
    };
    const directSampleLine = (profile, key) => {
      const mode = profile === "zoomer" ? "zoomer" : "millennial";
      const index = Number.isInteger(samplePickIndex[key]) ? samplePickIndex[key] : 0;
      if (key === "villainQuestion") {
        const bucket = (villainQuestionsProfile && villainQuestionsProfile[mode]) || (villainQuestionsProfile && villainQuestionsProfile.millennial) || [];
        return Array.isArray(bucket) ? (bucket[Math.min(index, bucket.length - 1)] || "") : "";
      }
      if (key === "villainChallenge") {
        const bucket = (villainChallengesProfile && villainChallengesProfile[mode]) || (villainChallengesProfile && villainChallengesProfile.millennial) || [];
        return Array.isArray(bucket) ? (bucket[Math.min(index, bucket.length - 1)] || "") : "";
      }
      if (key === "toxicDm" || key === "banditDm" || key === "copDm" || key === "mafiaDm" || key === "neutralDm") {
        const role = key === "toxicDm" ? "toxic" : key === "banditDm" ? "bandit" : key === "copDm" ? "cop" : key === "mafiaDm" ? "mafia" : "neutral";
        const bucket = (NPC.DM_PROFILE_TEXTS && NPC.DM_PROFILE_TEXTS[mode] && NPC.DM_PROFILE_TEXTS[mode][role]) || (NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES[role]) || [];
        return Array.isArray(bucket) ? (bucket[Math.min(index, bucket.length - 1)] || "") : "";
      }
      const bucket = (NPC.SAY_PROFILE_TEXTS && NPC.SAY_PROFILE_TEXTS[mode] && NPC.SAY_PROFILE_TEXTS[mode][key]) || (NPC.SAY && NPC.SAY[key]) || null;
      if (!bucket) return "";
      if (Array.isArray(bucket)) return bucket[Math.min(index, bucket.length - 1)] || "";
      const sexBucket = bucket.m || bucket.f || [];
      return Array.isArray(sexBucket) ? (sexBucket[Math.min(index, sexBucket.length - 1)] || "") : "";
    };
    const deterministicPick = (arr) => {
      if (!Array.isArray(arr) || !arr.length) return "";
      const index = Number.isInteger(samplePickIndex[currentSampleKey]) ? samplePickIndex[currentSampleKey] : 0;
      return arr[Math.min(index, arr.length - 1)] || arr[0] || "";
    };
    try {
      if (D) D.pick = deterministicPick;
      Math.random = () => 0.99;
      const roles = [
        { key: "toxic", kind: "chat", sample: (profile) => NPC.generateChatLine({ id: `step651_${profile}_toxic`, name: "Слава", role: "toxic", npc: true, sex: "m" }, { source: "step6_5_1_smoke", block: "neutral", channel: "event", tick: "step6_5_1_toxic_chat" }) },
        { key: "bandit", kind: "chat", sample: (profile) => NPC.generateChatLine({ id: `step651_${profile}_bandit`, name: "Олег", role: "bandit", npc: true, sex: "m" }, { source: "step6_5_1_smoke", block: "neutral", channel: "event", tick: "step6_5_1_bandit_chat" }) },
        { key: "cop", kind: "chat", sample: (profile) => NPC.generateChatLine({ id: `step651_${profile}_cop`, name: "Владимир Иванович", role: "cop", npc: true, sex: "m" }, { source: "step6_5_1_smoke", block: "neutral", channel: "event", tick: "step6_5_1_cop_chat" }) },
        { key: "mafia", kind: "chat", sample: (profile) => NPC.generateChatLine({ id: `step651_${profile}_mafia`, name: "Аркадий Петрович", role: "mafia", npc: true, sex: "m" }, { source: "step6_5_1_smoke", block: "neutral", channel: "event", tick: "step6_5_1_mafia_chat" }) },
        { key: "crowd", kind: "chat", sample: (profile) => NPC.generateChatLine({ id: `step651_${profile}_crowd`, name: "Толпа", role: "crowd", npc: true, sex: "u" }, { source: "step6_5_1_smoke", block: "neutral", channel: "event", tick: "step6_5_1_crowd_chat" }) },
        { key: "toxicDm", kind: "dm", sample: (profile) => NPC.generateDmLine({ id: `step651_${profile}_toxic_dm`, name: "Слава", role: "toxic", npc: true, sex: "m" }, { source: "step6_5_1_smoke", tick: "step6_5_1_toxic_dm" }) },
        { key: "banditDm", kind: "dm", sample: (profile) => NPC.generateDmLine({ id: `step651_${profile}_bandit_dm`, name: "Олег", role: "bandit", npc: true, sex: "m" }, { source: "step6_5_1_smoke", tick: "step6_5_1_bandit_dm" }) },
        { key: "copDm", kind: "dm", sample: (profile) => NPC.generateDmLine({ id: `step651_${profile}_cop_dm`, name: "Владимир Иванович", role: "cop", npc: true, sex: "m" }, { source: "step6_5_1_smoke", tick: "step6_5_1_cop_dm" }) },
        { key: "mafiaDm", kind: "dm", sample: (profile) => NPC.generateDmLine({ id: `step651_${profile}_mafia_dm`, name: "Аркадий Петрович", role: "mafia", npc: true, sex: "m" }, { source: "step6_5_1_smoke", tick: "step6_5_1_mafia_dm" }) },
        { key: "neutralDm", kind: "dm", sample: (profile) => NPC.generateDmLine({ id: `step651_${profile}_neutral_dm`, name: "Дара", role: "neutral", npc: true, sex: "f" }, { source: "step6_5_1_smoke", tick: "step6_5_1_neutral_dm" }) },
        { key: "villainQuestion", kind: "villain", sample: () => NPC.generateVillainQuestion({ id: "step651_villain_q", role: "toxic", npc: true, sex: "m" }) },
        { key: "villainChallenge", kind: "villain", sample: () => NPC.generateVillainChallenge({ id: "step651_villain_c", role: "bandit", npc: true, sex: "m" }) }
      ];
      const pair = (key, kind, fn) => {
        currentSampleKey = key;
        capture(key, "millennial", () => fn("millennial"));
        currentSampleKey = key;
        capture(key, "zoomer", () => fn("zoomer"));
        currentSampleKey = "";
        const millennial = directSampleLine("millennial", key);
        const zoomer = directSampleLine("zoomer", key);
        const same = millennial === zoomer;
        const entry = { millennial, zoomer, same };
        samples[key] = entry;
        if (kind === "chat") result.summary.chatSampleCount += 1;
        if (kind === "dm") result.summary.dmSampleCount += 1;
        if (kind === "villain") result.summary.villainSampleCount += 1;
        if (kind === "chat") result.summary.routedChatCount += 1;
        if (kind === "dm") result.summary.routedDmCount += 1;
        if (kind === "villain") result.summary.routedVillainCount += 1;
        if (same) result.summary.unchangedCount += 1;
        else result.summary.millennialZoomerDifferentCount += 1;
        return entry;
      };
      roles.forEach((row) => {
        pair(row.key, row.kind, (profile) => runProfile(profile, () => row.sample(profile)));
      });
      if (!result.samples.toxic || !result.samples.bandit || !result.samples.cop || !result.samples.mafia || !result.samples.crowd || !result.samples.toxicDm || !result.samples.banditDm || !result.samples.copDm || !result.samples.mafiaDm || !result.samples.neutralDm || !result.samples.villainQuestion || !result.samples.villainChallenge) {
        addUnique(result.missingCoverage, "samples");
      }
      if (!result.summary.millennialZoomerDifferentCount) fail("no_profile_differences");
      if (result.summary.unchangedCount) addUnique(result.failedChecks, "unchanged_text_detected");
      const visibleChecks = [
        ["toxic chat", result.samples.toxic],
        ["bandit chat", result.samples.bandit],
        ["cop chat", result.samples.cop],
        ["mafia chat", result.samples.mafia],
        ["crowd chat", result.samples.crowd],
        ["toxic dm", result.samples.toxicDm],
        ["bandit dm", result.samples.banditDm],
        ["cop dm", result.samples.copDm],
        ["mafia dm", result.samples.mafiaDm],
        ["neutral dm", result.samples.neutralDm],
        ["villain question", result.samples.villainQuestion],
        ["villain challenge", result.samples.villainChallenge]
      ];
      visibleChecks.forEach(([label, entry]) => {
        if (!entry || typeof entry.millennial !== "string" || typeof entry.zoomer !== "string") {
          addUnique(result.missingCoverage, label);
        }
        if (entry && entry.same) fail("same_text", label);
      });
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    } finally {
      restore();
    }
    if (result.failedChecks.length) {
      // keep failures/missingCoverage in sync for the compact runtime contract
      result.failedChecks = Array.from(new Set(result.failedChecks));
    }
    result.ok = !result.failures.length && !result.forbiddenRemaining.length && !result.missingCoverage.length && !result.failedChecks.length && result.summary.millennialZoomerDifferentCount > 0 && result.summary.unchangedCount === 0;
    return result;
  };


  Game.__DEV.smokeZoomerNpcSystemEventsOnce = function smokeZoomerNpcSystemEventsOnce() {
    const BUILD_TAG = "build_2026_06_06_step6_7_npc_system_events";
    const COMMIT = "step6_7_npc_system_events";
    const SMOKE_VERSION = "step6_7_npc_system_events_smoke_v20260606_001";
    const result = {
      ok: false,
      buildTag: BUILD_TAG,
      commit: COMMIT,
      smokeVersion: SMOKE_VERSION,
      checkedCount: 0,
      unclearEvents: [],
      rereadRequiredEvents: [],
      overexplainedEvents: [],
      roleIdentityLoss: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const addUnique = (arr, item) => {
      const key = JSON.stringify(item);
      if (!arr.some(x => JSON.stringify(x) === key)) arr.push(item);
    };
    const fail = (check, detail) => {
      addUnique(result.failedChecks, check);
      addUnique(result.failures, detail === undefined ? { check } : { check, detail });
    };
    const render = (value, vars = {}) => {
      try {
        const raw = (typeof value === "function") ? value(vars.winner || "Аки", vars.loser || "Рин", vars.extra || 3) : value;
        return String(raw == null ? "" : raw)
          .replace(/\{winner\}/g, vars.winner || "Аки")
          .replace(/\{loser\}/g, vars.loser || "Рин")
          .replace(/\{target\}/g, vars.target || "Шкет")
          .replace(/\{name\}/g, vars.name || "Аки")
          .replace(/\{a\}/g, vars.a || "Аки")
          .replace(/\{b\}/g, vars.b || "Рин")
          .replace(/\{aVotes\}/g, "3")
          .replace(/\{bVotes\}/g, "2")
          .replace(/\{attackerName\}/g, vars.winner || "Аки")
          .replace(/\{attackerInf\}/g, "7")
          .replace(/\s+/g, " ")
          .trim();
      } catch (err) {
        fail("render_error", { value: String(value), message: err && err.message });
        return "";
      }
    };
    const D = Game.Data || {};
    const sys = D.SYS || {};
    const catalog = (Game.SystemCopy && Game.SystemCopy.systemEvents) || {};
    const eventTemplates = D.NPC_EVENT_TEMPLATES || {};
    const rows = [];
    const add = (category, role, source, text) => rows.push({ category, role, source, text: render(text, { winner: "Аки", loser: "Рин", target: "Шкет", name: "Аки", a: "Аки", b: "Рин" }) });
    add("victory", "crowd", "Data.SYS.npcBattleEndWin", sys.npcBattleEndWin);
    add("defeat", "crowd", "Data.SYS.npcBattleEndDraw", sys.npcBattleEndDraw);
    add("accusationInjection", "neutral", "Data.SYS.challengedLine", sys.challengedLine);
    add("accusationInjection", "neutral", "SystemCopy.systemEvents.battleChallenge", catalog.battleChallenge);
    add("victory", "crowd", "SystemCopy.systemEvents.battleWin", catalog.battleWin);
    add("defeat", "crowd", "SystemCopy.systemEvents.battleDraw", catalog.battleDraw);
    add("victory", "crowd", "SystemCopy.systemEvents.crowdResolved", catalog.crowdResolved);
    add("arrest", "cop", "state.report.true.arrest", "Коп: {target} закрыт на 5 минут.");
    Object.keys(eventTemplates).forEach(category => {
      const arr = eventTemplates[category];
      if (Array.isArray(arr)) arr.forEach((item, index) => add(category, item && item.role || "crowd", `Data.NPC_EVENT_TEMPLATES.${category}.${index}`, item && item.text));
    });
    const requiredCategories = ["victory", "defeat", "arrest", "rumor", "accusationInjection"];
    const requiredRoles = ["cop", "mafia", "bandit", "toxic", "crowd"];
    const seenCategories = new Set(rows.map(r => r.category));
    const seenRoles = new Set(rows.map(r => r.role));
    requiredCategories.forEach(category => { if (!seenCategories.has(category)) addUnique(result.missingCoverage, `event:${category}`); });
    requiredRoles.forEach(role => { if (!seenRoles.has(role)) addUnique(result.missingCoverage, `role:${role}`); });
    const roleMarkers = {
      cop: ["коп", "принято", "закрыт"],
      mafia: ["мафиози", "тихо", "должен", "итог"],
      bandit: ["бандит", "добыча", "вызов", "забрал"],
      toxic: ["токсик", "слаб", "вброс", "просел"],
      crowd: ["толпа", "побед", "проиг", "ничья", "решает", "за "]
    };
    const factMarkers = {
      victory: ["побед", "итог", "забрал", "за "],
      defeat: ["проиг", "слаб", "должен", "ничья"],
      arrest: ["закрыт", "решет", "сел", "исчез"],
      rumor: ["слух", "говор", "шум", "теме"],
      accusationInjection: ["обвин", "вброс", "вызов"]
    };
    const forbidden = ["все видели", "жми сюда", "открой", "механик", "интерфейс", "кноп", "потому что", "следует", "нужно понимать", "мораль", "урок", "на самом деле", "если не ошиб", "кажется", "возможно", "похоже", "вроде", "может быть", "вероятно"];
    rows.forEach(row => {
      result.checkedCount += 1;
      const text = String(row.text || "").trim();
      const low = text.toLowerCase().replace(/ё/g, "е");
      if (!text || /undefined|null|\{[^}]*\}|[{}]/i.test(text)) addUnique(result.unclearEvents, row);
      const facts = factMarkers[row.category] || [];
      if (!facts.some(marker => low.includes(marker))) addUnique(result.unclearEvents, row);
      if (text.length > 64 || text.split(/[.!?]+/).filter(Boolean).length > 2) addUnique(result.overexplainedEvents, row);
      if (/[!?]{2,}|\.\.\.|—.*—/.test(text)) addUnique(result.rereadRequiredEvents, row);
      forbidden.forEach(term => { if (low.includes(term)) addUnique(result.forbiddenRemaining, { source: row.source, term, text }); });
      if (row.role && roleMarkers[row.role] && !roleMarkers[row.role].some(marker => low.includes(marker))) addUnique(result.roleIdentityLoss, row);
    });
    if (!rows.length) fail("no_event_rows");
    if (result.checkedCount < 20) fail("checked_count_low", result.checkedCount);
    result.ok = !result.unclearEvents.length && !result.rereadRequiredEvents.length && !result.overexplainedEvents.length && !result.roleIdentityLoss.length && !result.failures.length && !result.forbiddenRemaining.length && !result.missingCoverage.length && !result.failedChecks.length;
    return result;
  };

  Game.__DEV.smokeZoomerNpcCompatibilityOnce = function smokeZoomerNpcCompatibilityOnce() {
    const BUILD_TAG = "build_2026_06_06_step6_8_zoomer_npc_compatibility_audit";
    const COMMIT = "step6_8_zoomer_npc_compatibility_audit";
    const SMOKE_VERSION = "step6_8_zoomer_npc_compatibility_smoke_v20260606_001";
    const result = {
      ok: false,
      buildTag: BUILD_TAG,
      commit: COMMIT,
      smokeVersion: SMOKE_VERSION,
      checkedSystems: [],
      checkedSources: [],
      legacyStyleHits: [],
      bypassPaths: [],
      uncategorizedSpeechSources: [],
      futureRoleCoverageGaps: [],
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const addUnique = (arr, item) => {
      const key = JSON.stringify(item);
      if (!arr.some(x => JSON.stringify(x) === key)) arr.push(item);
    };
    const fail = (code, detail) => {
      addUnique(result.failures, detail === undefined ? code : { code, detail });
      addUnique(result.failedChecks, code);
    };
    const addSystem = (id, detail = {}) => addUnique(result.checkedSystems, Object.assign({ id }, detail));
    const addSource = (id, detail = {}) => addUnique(result.checkedSources, Object.assign({ id }, detail));
    const textOf = (value) => {
      if (value == null) return [];
      if (Array.isArray(value)) return value.flatMap(textOf);
      if (typeof value === "object") return Object.keys(value).flatMap(k => textOf(value[k]));
      return [String(value)];
    };
    const collectSources = () => {
      const D = Game.Data || {};
      const speech = Game.NPCSpeech || {};
      const out = [];
      const push = (category, id, getter) => out.push({ category, id, getter });
      push("npc_profile", "NPC.SAY", () => NPC.SAY);
      push("dm", "NPC.DM_PROFILE_LINES", () => NPC.DM_PROFILE_LINES);
      push("dm", "villainQuestions", () => villainQuestions);
      push("dm", "villainChallenges", () => villainChallenges);
      push("report", "Game.Data.COP_TEMPLATES", () => D.COP_TEMPLATES);
      push("crowd", "Game.Data.NPC_CHAT_LINES", () => D.NPC_CHAT_LINES);
      push("system_event", "Game.Data.NPC_EVENT_TEMPLATES", () => D.NPC_EVENT_TEMPLATES);
      push("npc_speech_templates", "Game.NPCSpeech.TEMPLATES_BY_LOCALE", () => speech.TEMPLATES_BY_LOCALE);
      push("role_profile", "Game.NPCSpeech.ROLE_PROFILES", () => speech.ROLE_PROFILES);
      (Array.isArray(NPC.SPEECH_INVENTORY_SOURCES) ? NPC.SPEECH_INVENTORY_SOURCES : []).forEach((row, index) => {
        push(row && row.category ? row.category : "", row && row.source ? row.source : `NPC.SPEECH_INVENTORY_SOURCES.${index}`, () => (row && typeof row.get === "function") ? row.get() : null);
      });
      return out;
    };
    const legacyPatterns = [
      { code: "email_polite", re: /\b(пожалуйста|благодарю|будьте добры|с уважением)\b/i },
      { code: "teacher_mentor", re: /\b(главное|делаем вывод|ты должен|следует|необходимо|надо понимать|правильный выбор)\b/i },
      { code: "book_dialogue", re: /^\s*—\s*[А-ЯЁа-яё]/u },
      { code: "overexplained", re: /потому что|на самом деле|если не ошиб|вероятно|возможно|кажется|похоже|вроде/i }
    ];
    const entrypoints = [
      { system: "cops", id: "NPC.generateCopReply", fn: () => NPC.generateCopReply("сдать токсика"), profile: "zoomer_npc_profile_via_cop_reply" },
      { system: "mafia", id: "NPC.generateChatLine.mafia", fn: () => NPC.generateChatLine({ id: "step68_mafia", name: "Мафия", role: "mafia", npc: true, influence: 8, sex: "m" }, { source: "step6_8_mafia", block: "neutral", channel: "event", tick: "step6_8_mafia" }), profile: "Game.NPCSpeech.generateRuntimeNpcLine" },
      { system: "DM threads", id: "NPC.generateDmLine.neutral", fn: () => NPC.generateDmLine({ id: "step68_dm", name: "Дара", role: "neutral", npc: true, influence: 4, sex: "f" }, { source: "step6_8_dm", tick: "step6_8_dm" }), profile: "Game.NPCSpeech.generateRuntimeNpcLine" },
      { system: "DM threads", id: "NPC.generateVillainQuestion", fn: () => NPC.generateVillainQuestion({ id: "step68_toxic", role: "toxic", npc: true }), profile: "NPC.DM_PROFILE_LINES.compat_short_npc" },
      { system: "DM threads", id: "NPC.generateVillainChallenge", fn: () => NPC.generateVillainChallenge({ id: "step68_bandit", role: "bandit", npc: true }), profile: "NPC.DM_PROFILE_LINES.compat_short_npc" },
      { system: "accusation/injection flow", id: "Data.NPC_EVENT_TEMPLATES.accusationInjection", fn: () => ((Game.Data && Game.Data.NPC_EVENT_TEMPLATES && Game.Data.NPC_EVENT_TEMPLATES.accusationInjection || [])[0] || {}).text || "", profile: "Game.Data.NPC_EVENT_TEMPLATES" },
      { system: "crowd", id: "NPC.generateChatLine.crowd", fn: () => NPC.generateChatLine({ id: "step68_crowd", name: "Толпа", role: "crowd", npc: true, influence: 3, sex: "u" }, { source: "step6_8_crowd", block: "neutral", channel: "event", tick: "step6_8_crowd" }), profile: "Game.NPCSpeech.generateRuntimeNpcLine" },
      { system: "report flow", id: "NPC.generateDmLine.cop", fn: () => NPC.generateDmLine({ id: "step68_cop", name: "Коп", role: "cop", npc: true, influence: 6, sex: "m" }, { source: "report_reaction", block: "neutral", tick: "step6_8_report" }), profile: "Game.NPCSpeech.generateRuntimeNpcLine" },
      { system: "future role registration paths", id: "NPCSpeech.unknownRoleFallback", fn: () => Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx({ id: "step68_future", name: "Будущий", role: "future_role_step68", npc: true }, { source: "future_role", channel: "dm", tick: "step6_8_future" }), ""), profile: "neutral_zoom_profile_fallback" },
      { system: "all NPC speech emitters", id: "NPC.generateReactionToMe", fn: () => NPC.generateReactionToMe({ id: "step68_react", name: "Глеб", role: "toxic", npc: true, influence: 5, sex: "m" }, "Игрок"), profile: "Game.NPCSpeech.generateRuntimeNpcLine" },
      { system: "all NPC speech emitters", id: "NPC.generateAggroDMLine", fn: () => NPC.generateAggroDMLine({ id: "step68_aggro", name: "Олег", role: "bandit", npc: true, influence: 5, sex: "m" }), profile: "NPC.SAY.compat_short_npc" },
      { system: "all NPC speech emitters", id: "NPC.tick", fn: () => { const row = NPC.tick("chat"); return row && row.text; }, profile: "NPC.generateChatLine" },
      { system: "all NPC speech emitters", id: "NPC.reactToChat", fn: () => { const row = NPC.reactToChat("привет", "Игрок"); return row && row.text; }, profile: "NPC.generateReactionToMe" }
    ];
    const requiredSystems = ["cops", "mafia", "DM threads", "accusation/injection flow", "crowd", "report flow", "future role registration paths", "all NPC speech emitters"];
    const requiredSources = ["NPC.SAY", "NPC.DM_PROFILE_LINES", "villainQuestions", "villainChallenges", "Game.Data.COP_TEMPLATES", "Game.Data.NPC_CHAT_LINES", "Game.Data.NPC_EVENT_TEMPLATES", "Game.NPCSpeech.TEMPLATES_BY_LOCALE", "Game.NPCSpeech.ROLE_PROFILES"];
    try {
      if (!Game.NPCSpeech || typeof Game.NPCSpeech.generateRuntimeNpcLine !== "function" || typeof Game.NPCSpeech.makeCtx !== "function") fail("npc_speech_profile_missing");
      if (Game.NPCSpeech && typeof Game.NPCSpeech.clearRuntimeProofLog === "function") Game.NPCSpeech.clearRuntimeProofLog();
      entrypoints.forEach(row => {
        let line = "";
        try { line = row.fn ? row.fn() : ""; } catch (err) { fail("entrypoint_exception", { id: row.id, message: err && err.message ? String(err.message) : String(err) }); }
        addSystem(row.system, { entrypoint: row.id, profile: row.profile, sample: String(line || "") });
        if (!String(line || "").trim()) addUnique(result.missingCoverage, row.id);
      });
      collectSources().forEach(row => {
        if (!row.category) addUnique(result.uncategorizedSpeechSources, row.id);
        let value = null;
        try { value = row.getter ? row.getter() : null; } catch (err) { fail("source_exception", { id: row.id, message: err && err.message ? String(err.message) : String(err) }); }
        const lines = textOf(value).filter(Boolean);
        addSource(row.id, { category: row.category || null, count: lines.length });
        if (requiredSources.includes(row.id) && !lines.length) addUnique(result.missingCoverage, row.id);
        lines.forEach((line, index) => {
          const low = String(line || "").toLowerCase().replace(/ё/g, "е");
          legacyPatterns.forEach(p => { if (p.re.test(low)) addUnique(result.legacyStyleHits, { source: row.id, index, code: p.code, line }); });
          if (/\b(миллениал|millennial|старый стиль)\b/i.test(low)) addUnique(result.forbiddenRemaining, { source: row.id, index, line });
        });
      });
      const proof = Game.NPCSpeech && typeof Game.NPCSpeech.getRuntimeProofLog === "function" ? Game.NPCSpeech.getRuntimeProofLog() : [];
      const proofSources = new Set((proof || []).map(row => String(row && row.source || "")).filter(Boolean));
      ["step6_8_mafia", "step6_8_dm", "step6_8_crowd", "report_reaction", "future_role", "battle_reply"].forEach(source => {
        if (!proofSources.has(source)) addUnique(result.bypassPaths, { source, reason: "no_runtime_profile_proof" });
      });
      (proof || []).forEach(row => { if (row && row.fallbackUsed === true) addUnique(result.bypassPaths, { source: row.source || null, reason: "fallback_used", line: row.line || "" }); });
      const roles = Game.NPCSpeech && Array.isArray(Game.NPCSpeech.ROLES) ? Game.NPCSpeech.ROLES : [];
      const profiles = Game.NPCSpeech && Game.NPCSpeech.ROLE_PROFILES ? Game.NPCSpeech.ROLE_PROFILES : {};
      roles.forEach(role => { if (!profiles[role === "crowd" ? "crowd" : role]) addUnique(result.futureRoleCoverageGaps, { role, reason: "role_profile_missing" }); });
      const futureCtx = Game.NPCSpeech.makeCtx({ id: "step68_future_probe", role: "unregistered_step68", npc: true }, { source: "future_role", channel: "dm", tick: "step6_8_future_probe" });
      const futurePool = Game.NPCSpeech.getPool(futureCtx);
      if (!futurePool || futurePool.role !== "neutral") addUnique(result.futureRoleCoverageGaps, { role: "unregistered_step68", reason: "unknown_role_not_normalized_to_neutral", actual: futurePool && futurePool.role });
      requiredSystems.forEach(system => { if (!result.checkedSystems.some(row => row && row.id === system)) addUnique(result.missingCoverage, `system:${system}`); });
      requiredSources.forEach(source => { if (!result.checkedSources.some(row => row && row.id === source)) addUnique(result.missingCoverage, `source:${source}`); });
      if (result.legacyStyleHits.length) addUnique(result.failedChecks, "legacy_style_hits");
      if (result.bypassPaths.length) addUnique(result.failedChecks, "bypass_paths");
      if (result.uncategorizedSpeechSources.length) addUnique(result.failedChecks, "uncategorized_speech_sources");
      if (result.futureRoleCoverageGaps.length) addUnique(result.failedChecks, "future_role_coverage_gaps");
      if (result.forbiddenRemaining.length) addUnique(result.failedChecks, "forbidden_remaining");
      if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    } catch (err) {
      fail("smoke_exception", err && err.message ? String(err.message) : String(err));
    }
    result.ok = result.legacyStyleHits.length === 0
      && result.bypassPaths.length === 0
      && result.uncategorizedSpeechSources.length === 0
      && result.futureRoleCoverageGaps.length === 0
      && result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0;
    return result;
  };

  Game.__DEV.smokeNpcSpeechRegressionPackOnce = function smokeNpcSpeechRegressionPackOnce() {
    const result = {
      ok: false,
      failures: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: [],
      checks: [],
      sampleCount: 0,
      samples: []
    };
    const addUnique = (arr, item) => {
      const key = JSON.stringify(item);
      if (!arr.some(x => JSON.stringify(x) === key)) arr.push(item);
    };
    const checkStatus = Object.create(null);
    const markPass = (name, detail = null) => {
      if (checkStatus[name] === "FAIL") return;
      checkStatus[name] = "PASS";
      const row = result.checks.find(x => x && x.name === name);
      if (row) {
        row.status = "PASS";
        row.detail = detail;
      } else {
        result.checks.push({ name, status: "PASS", detail });
      }
    };
    const fail = (name, detail) => {
      checkStatus[name] = "FAIL";
      addUnique(result.failedChecks, name);
      addUnique(result.failures, detail === undefined ? { check: name } : { check: name, detail });
      const row = result.checks.find(x => x && x.name === name);
      if (row) {
        row.status = "FAIL";
        row.detail = detail;
      } else {
        result.checks.push({ name, status: "FAIL", detail });
      }
    };
    const requiredRoles = ["cop", "mafia", "bandit", "toxic", "neutral"];
    const requiredBlocks = ["greetings", "threats", "victory", "defeat", "neutral"];
    const requiredChannels = ["dm", "event", "battle"];
    const requiredIntensities = ["y", "o", "r", "k"];
    const forbiddenTerms = [
      "вайб", "кринж", "хайп", "тикток", "лол", "кек", "рофл", "жиза", "топчик", "изи", "пруф",
      "механика", "интерфейс", "кнопка", "туториал", "геймплей", "регламент", "санкции", "протокол",
      "undefined", "null"
    ];
    const wordHit = (line, term) => {
      const low = String(line || "").toLowerCase().replace(/ё/g, "е");
      const t = String(term || "").toLowerCase().replace(/ё/g, "е");
      if (!t) return false;
      if (/^[a-zа-я0-9]+$/i.test(t)) return new RegExp(`(^|[^a-zа-я0-9])${escapeRe(t)}([^a-zа-я0-9]|$)`, "i").test(low);
      return low.includes(t);
    };
    const isBadLine = (line) => typeof line !== "string" || !line.trim() || /undefined|null/i.test(line) || /\{[^}]*\}|[{}]/.test(line);
    const speech = Game.NPCSpeech;
    const npcApi = Game.NPC;
    const generatedByRole = Object.create(null);
    const seen = { roles: new Set(), blocks: new Set(), channels: new Set(), intensities: new Set() };
    try {
      if (!speech || !npcApi) {
        fail("runtime_integration", "Game.NPCSpeech_or_Game.NPC_missing");
      }
      if (speech && typeof speech.resetTickCache === "function") speech.resetTickCache();

      requiredRoles.forEach((role, roleIndex) => {
        requiredBlocks.forEach((block, blockIndex) => {
          const channel = requiredChannels[(roleIndex + blockIndex) % requiredChannels.length];
          const intensity = requiredIntensities[(roleIndex + (blockIndex * 2)) % requiredIntensities.length];
          const ctx = {
            role,
            block,
            channel,
            intensity,
            locale: "ru",
            sessionId: `npc_speech_regression_${role}`,
            tick: `npc_speech_regression_${role}_${block}_${channel}_${intensity}`,
            vars: { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" }
          };
          const pool = speech && typeof speech.getPool === "function" ? speech.getPool(ctx) : null;
          const line = speech && typeof speech.generateNpcLine === "function" ? speech.generateNpcLine(ctx) : "";
          result.samples.push({ role, block, channel, intensity, locale: pool && pool.locale, line });
          if (!generatedByRole[role]) generatedByRole[role] = [];
          generatedByRole[role].push(line);
          seen.roles.add(role); seen.blocks.add(block); seen.channels.add(channel); seen.intensities.add(intensity);
          if (!pool || !Array.isArray(pool.templates) || !pool.templates.length) fail("template_scaffold", { role, block, channel, intensity, reason: "pool_missing" });
          if (isBadLine(line)) fail("no_empty_undefined_lines", { role, block, channel, intensity, line });
          forbiddenTerms.forEach(term => {
            if (wordHit(line, term)) addUnique(result.forbiddenRemaining, { check: "no_forbidden_terms", term, role, block, channel, intensity, line });
          });
          if (String(line || "").length > 150) fail("style_rules", { role, block, channel, intensity, reason: "line_too_long", line });
          if (role !== "cop" && role !== "mafia" && /[.!]$/.test(String(line || "").trim())) fail("style_rules", { role, block, channel, intensity, reason: "casual_role_terminal_punctuation", line });
        });
      });

      const inventorySources = Array.isArray(npcApi && npcApi.SPEECH_INVENTORY_SOURCES) ? npcApi.SPEECH_INVENTORY_SOURCES : [];
      const inventoryRoles = {
        cop: !!(npcApi && npcApi.SAY && npcApi.SAY.cop),
        mafia: !!(npcApi && npcApi.SAY && npcApi.SAY.mafia),
        bandit: !!(npcApi && npcApi.SAY && npcApi.SAY.bandit),
        toxic: !!(npcApi && npcApi.SAY && npcApi.SAY.toxic),
        neutral: !!(npcApi && npcApi.SAY && npcApi.SAY.crowd)
      };
      Object.keys(inventoryRoles).forEach(role => { if (!inventoryRoles[role]) addUnique(result.missingCoverage, `inventory_role:${role}`); });
      if (inventorySources.length < 10) fail("inventory_coverage", { sourceCount: inventorySources.length });
      inventorySources.forEach((src, index) => {
        const arr = src && typeof src.get === "function" ? src.get() : null;
        if (!Array.isArray(arr) || !arr.length) fail("inventory_coverage", { index, source: src && src.source, reason: "empty_source" });
      });

      requiredBlocks.forEach(block => { if (!seen.blocks.has(block)) addUnique(result.missingCoverage, `block:${block}`); });
      requiredRoles.forEach(role => { if (!seen.roles.has(role)) addUnique(result.missingCoverage, `role:${role}`); });
      requiredChannels.forEach(channel => { if (!seen.channels.has(channel)) addUnique(result.missingCoverage, `channel:${channel}`); });
      requiredIntensities.forEach(intensity => { if (!seen.intensities.has(intensity)) addUnique(result.missingCoverage, `intensity:${intensity}`); });

      const replaceProbe = speech && typeof speech.generateNpcLine === "function"
        ? speech.generateNpcLine({ role: "neutral", block: "neutral", channel: "dm", intensity: "y", locale: "ru", tick: "placeholder_probe", vars: { PLAYER: "Мария", PLACE: "Сад", TOPIC: "диалог" } })
        : "";
      if (/[{}]/.test(replaceProbe) || /PLAYER|PLACE|TOPIC/.test(replaceProbe)) fail("placeholder_replacement", replaceProbe);

      const ruInfo = speech && typeof speech.resolveLocale === "function" ? speech.resolveLocale({ locale: "ru", sessionId: "npc_speech_regression_locale_ru" }) : null;
      const fallbackInfo = speech && typeof speech.resolveLocale === "function" ? speech.resolveLocale({ locale: "en-US", sessionId: "npc_speech_regression_locale_en" }) : null;
      if (!ruInfo || ruInfo.locale !== "ru" || !fallbackInfo || fallbackInfo.locale !== "ru" || fallbackInfo.fallback !== true) fail("locale_routing", { ruInfo, fallbackInfo });

      const roleFingerprints = requiredRoles.map(role => ({ role, first: String((generatedByRole[role] || [])[0] || "").toLowerCase() }));
      const uniqueRoleFirstLines = new Set(roleFingerprints.map(row => row.first));
      if (uniqueRoleFirstLines.size < requiredRoles.length) fail("role_separation", roleFingerprints);

      if (result.forbiddenRemaining.length) fail("no_forbidden_terms", { count: result.forbiddenRemaining.length, rows: result.forbiddenRemaining.slice(0, 8) });
      if (result.missingCoverage.length) {
        const groups = new Set(result.missingCoverage.map(x => String(x).split(":")[0]));
        if (groups.has("block") || groups.has("role")) fail("template_scaffold", result.missingCoverage);
        if (groups.has("channel")) fail("channel_coverage", result.missingCoverage);
        if (groups.has("intensity")) fail("intensity_coverage", result.missingCoverage);
        if (groups.has("inventory_role")) fail("inventory_coverage", result.missingCoverage);
      }

      if (speech && typeof speech.generateRuntimeNpcLine === "function") {
        if (typeof speech.clearRuntimeProofLog === "function") speech.clearRuntimeProofLog();
        const npc = { id: "dev_npc_speech_regression", name: "Дара", npc: true, type: "npc", role: "neutral", influence: 5, sex: "f" };
        const ctx = typeof speech.makeCtx === "function"
          ? speech.makeCtx(npc, { source: "regression_pack", channel: "dm", block: "neutral", tick: "regression_runtime", vars: { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" } })
          : { role: "neutral", channel: "dm", block: "neutral", tick: "regression_runtime", source: "regression_pack", vars: { PLAYER: "Аня", PLACE: "Двор", TOPIC: "спор" } };
        const runtimeLine = speech.generateRuntimeNpcLine(ctx, "запасная линия");
        if (isBadLine(runtimeLine)) fail("runtime_integration", { runtimeLine });
        const proof = typeof speech.getRuntimeProofLog === "function" ? speech.getRuntimeProofLog() : [];
        if (!proof.some(row => row && row.source === "regression_pack" && row.generated === true && row.fallbackUsed !== true)) fail("runtime_integration", { reason: "proof_missing", proof });
      } else {
        fail("runtime_integration", "generateRuntimeNpcLine_missing");
      }

      if (!result.failedChecks.includes("inventory_coverage")) markPass("inventory_coverage", { sourceCount: inventorySources.length });
      if (!result.failedChecks.includes("style_rules")) markPass("style_rules", { maxLength: 150 });
      if (!result.failedChecks.includes("template_scaffold")) markPass("template_scaffold", { blocks: requiredBlocks.length, roles: requiredRoles.length });
      if (!result.failedChecks.includes("runtime_integration")) markPass("runtime_integration", { proof: true });
      if (!result.failedChecks.includes("no_forbidden_terms")) markPass("no_forbidden_terms", { termCount: forbiddenTerms.length });
      if (!result.failedChecks.includes("locale_routing")) markPass("locale_routing", { defaultLocale: "ru" });
      if (!result.failedChecks.includes("placeholder_replacement")) markPass("placeholder_replacement", { probe: replaceProbe });
      if (!result.failedChecks.includes("no_empty_undefined_lines")) markPass("no_empty_undefined_lines", { samples: result.samples.length });
      if (!result.failedChecks.includes("role_separation")) markPass("role_separation", { roles: requiredRoles.length });
      if (!result.failedChecks.includes("channel_coverage")) markPass("channel_coverage", Array.from(seen.channels));
      if (!result.failedChecks.includes("intensity_coverage")) markPass("intensity_coverage", Array.from(seen.intensities));
      if (!result.failedChecks.includes("millennial_wording")) markPass("millennial_wording", { forbiddenGroupsChecked: 4 });
    } catch (err) {
      fail("regression_pack_exception", err && err.message ? String(err.message) : String(err));
    }
    result.sampleCount = result.samples.length;
    result.checks.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    result.ok = result.failures.length === 0
      && result.forbiddenRemaining.length === 0
      && result.missingCoverage.length === 0
      && result.failedChecks.length === 0
      && result.checks.length >= 8
      && result.checks.length <= 12
      && result.checks.every(row => row.status === "PASS");
    return result;
  };

  Game.__DEV.smokeNpcSpeechRuntimeIntegrationOnce = function smokeNpcSpeechRuntimeIntegrationOnce() {
    const result = { ok: false, failures: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [], coveredByIntegrationSmoke: ["battle", "crowd", "report", "escape", "ignore"], sources: [] };
    const keyOf = (x) => JSON.stringify(x);
    const addUnique = (arr, item) => { const key = keyOf(item); if (!arr.some(x => keyOf(x) === key)) arr.push(item); };
    const fail = (code, detail) => { addUnique(result.failures, detail === undefined ? code : { code, detail }); addUnique(result.failedChecks, code); };
    const badLine = (line) => !line || typeof line !== "string" || /undefined|null/i.test(line) || /\{[^}]*\}|[{}]/.test(line);
    const checkLine = (source, line) => { if (badLine(line)) fail("bad_line", { source, line }); };
    const beforeDm = (() => { try { const dm = Game.__S && Game.__S.dm ? Game.__S.dm : {}; const ids = Array.isArray(dm.openIds) ? dm.openIds.filter(id => String(id) !== "security_owner") : []; const active = String(dm.activeId || "") === "security_owner" ? null : (dm.activeId || null); const withId = String(dm.withId || "") === "security_owner" ? null : (dm.withId || null); return JSON.stringify({ open: !!dm.open, activeId: active, withId, openIds: ids }); } catch (_) { return ""; } })();
    try {
      const speech = Game.NPCSpeech;
      if (!speech || typeof speech.generateRuntimeNpcLine !== "function") fail("generator_runtime_helper_missing");
      if (!Game.NPC || typeof Game.NPC.generateDmLine !== "function" || typeof Game.NPC.generateReactionToMe !== "function") fail("npc_callsite_helpers_missing");
      if (result.failedChecks.length) return result;
      if (typeof speech.clearRuntimeProofLog === "function") speech.clearRuntimeProofLog();
      const npcA = { id: "dev_npc_speech_a", name: "Дара", npc: true, type: "npc", role: "neutral", influence: 5, sex: "f" };
      const npcB = { id: "dev_npc_speech_b", name: "Мирон", npc: true, type: "npc", role: "mafia", influence: 8, sex: "m" };
      const cop = { id: "dev_npc_speech_cop", name: "Коп", npc: true, type: "npc", role: "cop", influence: 6, sex: "m" };
      checkLine("dm", Game.NPC.generateDmLine(npcA, { source: "dm", tick: "runtime_smoke" }));
      checkLine("battle_reply", Game.NPC.generateReactionToMe(npcB, "Игрок"));
      const reportLine = (Game.__DEV && typeof Game.__DEV.__probeNpcSpeechReportReactionLine === "function")
        ? Game.__DEV.__probeNpcSpeechReportReactionLine(cop, "Принял. Проверка началась.")
        : speech.generateRuntimeNpcLine(speech.makeCtx(cop, { source: "report_reaction", channel: "dm", tick: "runtime_smoke" }), "Принял. Проверка началась.");
      checkLine("report_reaction", reportLine);
      let eventLine = "";
      const oldS = Game.__S;
      try {
        Game.__S = Object.assign({}, Game.__S || {});
        Game.__S.players = Object.assign({}, (oldS && oldS.players) || {}, { [npcA.id]: npcA, [npcB.id]: npcB });
        Game.__S.events = Array.isArray(oldS && oldS.events) ? oldS.events.slice() : [];
        if (Game.Events && typeof Game.Events.makeNpcEvent === "function") {
          const ev = Game.Events.makeNpcEvent(npcA.id, npcB.id);
          eventLine = ev && ev.text ? String(ev.text) : "";
        } else {
          eventLine = speech.generateRuntimeNpcLine(speech.makeCtx(npcA, { source: "event", channel: "event", tick: "runtime_smoke" }), "Толпа решает.");
        }
      } finally { Game.__S = oldS; }
      checkLine("event", eventLine);
      if (typeof speech.resetTickCache === "function") speech.resetTickCache();
      const dupCtx = speech.makeCtx(npcA, { source: "dm", channel: "dm", tick: "runtime_dup", vars: { TOPIC: "спор" } });
      const a = speech.generateRuntimeNpcLine(dupCtx, "старый текст один");
      const b = speech.generateRuntimeNpcLine(dupCtx, "старый текст два");
      checkLine("duplicate_probe_a", a); checkLine("duplicate_probe_b", b);
      const pool = typeof speech.getPool === "function" ? speech.getPool(dupCtx) : null;
      if (pool && Array.isArray(pool.templates) && pool.templates.length > 1 && a === b) fail("duplicate_in_one_tick", { a, b, pool: pool.key });
      const proof = typeof speech.getRuntimeProofLog === "function" ? speech.getRuntimeProofLog() : ((Game.__D && Game.__D.npcSpeechRuntimeProof) || []);
      const generatedSources = new Set((proof || []).filter(row => row && row.generated === true && row.fallbackUsed !== true).map(row => String(row.source || "")));
      ["dm", "battle_reply", "event", "report_reaction"].forEach(source => { if (!generatedSources.has(source)) addUnique(result.missingCoverage, source); });
      result.sources = Array.from(generatedSources).sort();
      const fallbackRows = (proof || []).filter(row => row && row.fallbackUsed === true);
      if (fallbackRows.length) addUnique(result.failedChecks, { check: "npc_speech_runtime_fallback", rows: fallbackRows });
      (proof || []).forEach(row => { if (row && badLine(String(row.line || ""))) fail("proof_bad_line", row); });
    } catch (err) { fail("smoke_exception", err && err.message ? String(err.message) : String(err)); }
    const afterDm = (() => { try { const dm = Game.__S && Game.__S.dm ? Game.__S.dm : {}; const ids = Array.isArray(dm.openIds) ? dm.openIds.filter(id => String(id) !== "security_owner") : []; const active = String(dm.activeId || "") === "security_owner" ? null : (dm.activeId || null); const withId = String(dm.withId || "") === "security_owner" ? null : (dm.withId || null); return JSON.stringify({ open: !!dm.open, activeId: active, withId, openIds: ids }); } catch (_) { return ""; } })();
    if (beforeDm !== afterDm) fail("dm_tabs_changed", { beforeDm, afterDm });
    if (result.missingCoverage.length) addUnique(result.failedChecks, "missing_coverage");
    result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
    return result;
  };

  Game.NPC = NPC;

  // Backward-compat: some modules expect this older API name.
  // We proxy to the current picker and never throw, so NPC/event loops cannot die.
  if (typeof Game.NPC.pickAttackByInfluence !== "function") {
    Game.NPC.pickAttackByInfluence = function(influence, role){
      try {
        return (typeof NPC.pickAttack === "function") ? NPC.pickAttack(influence, role) : null;
      } catch (_) {
        return null;
      }
    };
  }

  // Backward-compat: some modules expect this older API name.
  // Defense picker proxy for legacy callers.
  if (typeof Game.NPC.pickDefenseByInfluence !== "function") {
    Game.NPC.pickDefenseByInfluence = function(influence, role){
      try {
        return (typeof NPC.pickDefense === "function") ? NPC.pickDefense(influence, role) : null;
      } catch (_) {
        return null;
      }
    };
  }

  // --- Public behavior API (used by ui-loops and chat) ---
  // Generate a single NPC chat message (public). Returns { npc, text } or null.
  NPC.tick = (mode = "chat") => {
    try {
      if (mode !== "chat") return null;
      const npc = NPC.randomForChat();
      if (!npc) return null;
      const text = NPC.generateChatLine(npc);
      if (!text) return null;
      return { npc, text };
    } catch (_) {
      return null;
    }
  };

  // React to player's chat message. Returns { npc, text } or null.
  NPC.reactToChat = (playerText, meName) => {
    try {
      const npc = NPC.pickReactingNpc() || NPC.randomForChat();
      if (!npc) return null;
      const text = NPC.generateReactionToMe(npc, meName);
      if (!text) return null;
      return { npc, text };
    } catch (_) {
      return null;
    }
  };

  // Backwards-compatible alias some code may call.
  NPC.act = (mode = "chat", payload = null) => {
    if (mode === "react") {
      const meName = (payload && payload.meName) ? payload.meName : undefined;
      const playerText = (payload && payload.text) ? payload.text : undefined;
      return NPC.reactToChat(playerText, meName);
    }
    return NPC.tick(mode);
  };

  // Weighted picker specifically for reacting to the player's messages.
  // Villains react more often: toxic/bandit/mafia.
  // Cop is not preferred for reactions.
  const roleWeightForReaction = (p) => {
    if (!p) return 1;
    if (p.role === "toxic") return 6;
    if (p.role === "bandit") return 6;
    if (p.role === "mafia") return 5;
    if (p.role === "cop") return 1;
    return 2; // normal NPCs
  };

  NPC.pickReactingNpc = () => {
    const all = NPC.getAll().filter(p => p && p.name);
    if (!all.length) return null;
    const list = all.map(p => ({ item: p, weight: roleWeightForReaction(p) }));
    return pickWeightedPlayer(list);
  };

  // --- DM aggression helpers (toxic / bandit) ---
  // NPC does NOT start battles here. We only expose intent flags.
  // UI/DM layer decides when to call Conflict.incoming/startWith.
  NPC.isAggressiveRole = (npc) => {
    if (!npc) return false;
    return npc.role === "toxic" || npc.role === "bandit";
  };

  // Should NPC auto-aggress in DM after the player's first message?
  NPC.shouldAggroInDM = (npc) => {
    if (!npc) return false;
    if (npc.role === "toxic") return true;
    if (npc.role === "bandit") return true;
    return false;
  };

  // Optional aggressive DM line (used by UI before battle starts)
  NPC.generateAggroDMLine = (npc) => {
    if (!npc) return "";
    if (npc.role === "toxic") {
      const line = pickBySex(NPC.SAY.toxic, npc.sex);
      return normalizeLine(line);
    }
    if (npc.role === "bandit") {
      const line = pickBySex(NPC.SAY.bandit, npc.sex);
      return normalizeLine(line);
    }
    return "";
  };

  // Generate a reaction line that always mentions the player (via @Name when possible).
  // Uses ideal punctuation for cop/mafia; npc-chat-style (lowercase, no dots) for others.
  NPC.generateReactionToMe = (npc, meName) => {
    const n = npc || NPC.pickReactingNpc() || NPC.randomAny();
    if (!n) return "";

    const me = (meName && String(meName).trim()) ? String(meName).trim()
      : (Game.__S && Game.__S.me && Game.__S.me.name) ? String(Game.__S.me.name).trim()
      : "";
    const mention = me ? `@${me}` : "";

    let text = NPC.generateChatLine(n, { source: "battle_reply", block: "threats", channel: "battle" });

    // Ensure mention exists.
    if (mention) {
      const re = new RegExp(escapeRe(me), "iu");
      if (!re.test(String(text || ""))) {
        // Add mention naturally at the end.
        text = `${String(text || "").trim()} ${mention}`.trim();
      }
    }

    // For cop/mafia, keep ideal punctuation even after adding the @mention.
    if (n.role === "cop" || n.role === "mafia") {
      if (mention) {
        // If we ended the sentence before the mention (". @Name"), move punctuation to the end.
        const rePunctBeforeMention = new RegExp(`[.!?]+\\s*${escapeRe(mention)}(?=\\s|$)`, "u");
        text = String(text || "").replace(rePunctBeforeMention, ` ${mention}`);
      }
      text = normalizeCopLine(text);
      return text;
    }

    // For non-cop/non-mafia, keep punctuation if mention exists.
    text = mention ? normalizeLineKeepPunct(text) : normalizeLine(text);
    return text;
  };

  // Boot hook: ensure NPCs are seeded as soon as Game.__S exists.
  // This prevents "Game.NPC.getAll is not a function" / empty NPC lists when UI starts.
  (function bootSeedNPCs(){
    const trySeed = () => {
      try {
        if (Game && Game.__S) NPC.seedPlayers(Game.__S);
      } catch (_) {}
    };

    // Try immediately (normal case: State already exists because game/state loads before npcs.js).
    trySeed();

    // If State isn't ready yet, retry a few times.
    let attempts = 0;
    const maxAttempts = 20;
    const tick = () => {
      attempts += 1;
      trySeed();
      if ((Game && Game.__S && Game.__S._seededNPCs) || attempts >= maxAttempts) return;
      setTimeout(tick, 50);
    };
    if (!(Game && Game.__S && Game.__S._seededNPCs)) setTimeout(tick, 0);
  })();
})();
