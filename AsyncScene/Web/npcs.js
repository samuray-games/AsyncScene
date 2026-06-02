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
        "ты уверен в этой позиции",
        "слабое место уже видно",
        "говори прямо, без обходов",
        "не тяни, ответ нужен сейчас",
        "толпа услышала, теперь докажи",
        "выглядит хрупко, продолжай",
        "сейчас станет ясно, кто держит удар",
        "раунд открыт, говори точнее",
        "не мажь, отвечай по делу",
        "покажи аргумент, если он есть"
      ],
      f: [
        "ты понимаешь, куда зашел",
        "без шума, отвечай по сути",
        "я слушаю, но терпение короткое",
        "не тяни, скажи прямо",
        "не прячь слабый ход за словами"
      ]
    },
    bandit: {
      m: [
        "я тебя вижу",
        "деньги на стол",
        "стой ровно",
        "без героизма",
        "я долго не торгуюсь",
        "отвечай или плати",
        "посмотрим, сколько держишь",
        "не тяни",
        "шаг назад и слушай",
        "Свалить будет дешевле",
        "решился или нет",
        "лезешь в ответ — теряешь больше"
      ],
      f: [
        "я тебя заметила",
        "без резких движений",
        "не мешай мне",
        "отвечай или уходи",
        "не усложняй",
        "дважды не говорю",
        "хочешь проверить — проверяй",
        "решим сейчас",
        "предупреждаю один раз",
        "выбирай быстрее"
      ]
    },
    cop: {
      m: [
        "Я на связи. Держим дистанцию",
        "Вижу конфликт. Не ускоряй его",
        "Провокацию лучше пропустить",
        "К агрессивным лучше не лезть",
        "Увидел токсика или бандита — пиши в личку"
      ],
      f: [
        "Я на связи. Держим дистанцию",
        "Вижу конфликт. Не ускоряй его",
        "Провокацию лучше пропустить",
        "К агрессивным лучше не лезть",
        "Увидел токсика или бандита — пиши в личку"
      ]
    },
    mafia: {
      m: [
        "Добрый вечер. Говорим спокойно",
        "Лишний шум редко помогает",
        "Подумай, какой след оставит этот ход",
        "Не спеши. Спешка здесь дорогая",
        "Сомневаешься — лучше отойди",
        "Я ценю точность. И тишину",
        "Можно договориться без лишних свидетелей"
      ],
      f: [
        "Добрый вечер. Говорим спокойно",
        "Лишний шум редко помогает",
        "Подумай, какой след оставит этот ход",
        "Не спеши. Спешка здесь дорогая",
        "Сомневаешься — лучше отойди",
        "Я ценю точность. И тишину",
        "Можно договориться без лишних свидетелей"
      ]
    },
    crowd: {
      m: [
        "кто начнет первым",
        "становится напряженно",
        "посмотрим на доводы",
        "неожиданно, читаю дальше",
        "шумно на площади, но я остаюсь"
      ],
      f: [
        "интересно, чем это закончится",
        "напряжение растет",
        "посмотрим, что будет",
        "я внимательно читаю",
        "атмосфера напряженная"
      ]
    }
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
    if (n.role === "toxic") base = pickBySex(NPC.SAY.toxic, n.sex);
    else if (n.role === "bandit") base = pickBySex(NPC.SAY.bandit, n.sex);
    else if (Math.random() < 0.25) base = pickBySex(NPC.SAY.crowd, n.sex);
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
    const generatedBase = Game.NPCSpeech && typeof Game.NPCSpeech.generateRuntimeNpcLine === "function"
      ? Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx(n, {
          source: opts.source || "event",
          block: opts.block || "neutral",
          channel: opts.channel || "event",
          tick: opts.tick,
          vars: opts.vars || {}
        }), base)
      : base;
    const line = prefix + generatedBase;
    return prefix ? normalizeLineKeepPunct(line) : normalizeLine(line);
  };

  // DM line without mentions (keeps NPC style, but avoids @names)
  NPC.generateDmLine = (npc, opts = {}) => {
    if (!Game.Data) return "";
    const n = npc || NPC.randomAny();
    if (!n) return "";

    if (n.role === "cop" || n.role === "mafia") {
      const fallback = pickBySex(NPC.SAY[n.role], n.sex);
      const line = Game.NPCSpeech && typeof Game.NPCSpeech.generateRuntimeNpcLine === "function"
        ? Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx(n, { source: opts.source || "dm", block: opts.block || "neutral", channel: "dm", tick: opts.tick, vars: opts.vars || {} }), fallback)
        : fallback;
      return normalizeCopLine(line);
    }

    let base = "";
    if (n.role === "toxic") base = pickBySex(NPC.SAY.toxic, n.sex);
    else if (n.role === "bandit") base = pickBySex(NPC.SAY.bandit, n.sex);
    else if (Math.random() < 0.25) base = pickBySex(NPC.SAY.crowd, n.sex);
    else base = pickOne(Game.Data.NPC_CHAT_LINES);

    const line = Game.NPCSpeech && typeof Game.NPCSpeech.generateRuntimeNpcLine === "function"
      ? Game.NPCSpeech.generateRuntimeNpcLine(Game.NPCSpeech.makeCtx(n, {
          source: opts.source || "dm",
          block: opts.block || "neutral",
          channel: "dm",
          tick: opts.tick,
          vars: opts.vars || {}
        }), base)
      : base;
    return normalizeLine(line);
  };

  // Villain DM flow: question -> challenge
  const villainQuestions = [
    "ты здесь? отвечай",
    "это про тебя? отвечай",
    "кто тут держит слово?",
    "уверен(а), что это твоя тема?",
    "впишешься или пройдешь мимо?"
  ];
  const villainChallenges = [
    "разберем это в раунде",
    "вызывай на спор, если готов(а)",
    "раунд покажет, что у тебя есть",
    "готов(а) к спору или отходишь?"
  ];

  NPC.generateVillainQuestion = (npc) => {
    const line = pickOne(villainQuestions);
    return normalizeLine(line);
  };

  NPC.generateVillainChallenge = (npc) => {
    const line = pickOne(villainChallenges);
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
        risk: "Если ответить слишком быстро, он может нанести урон по 💰.",
        advice: "Лучше не отвечать на провокации и не торопиться. Если сомневаетесь, выбирайте безопасный вариант или уходите."
      },
      bandit: {
        title: "Бандит",
        style: "Говорит ультиматумами и угрозами. Давит на '💰' и заставляет действовать.",
        risk: "Если ты проиграешь ему, он может обнулить твои 💰.",
        advice: "Лучшее решение - Свалить или не ввязываться. Если вступили в бой, главное - не проиграть."
      },
      mafia: {
        title: "Мафиози",
        style: "Вежливый тон, но холодная логика. Говорит спокойно и давит без крика.",
        risk: "Опасен тем, что после контакта ты теряешь ⚡.",
        advice: "Не вступайте в спор. Если он рядом, лучший выбор - Свалить."
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
      const msg = `${b.title}. ${b.style} ${b.risk} ${b.advice}`;
      return normalizeCopLine(msg);
    }

    // Default neutral advice
    return normalizeCopLine("Я на связи. Нужна помощь — спроси про токсика, бандита или мафиози, либо нажми «Сдать» в личке");
  };

  // Dev-only NPC speech template scaffold (Step 5.3).
  // No gameplay code reads this object yet; it is exposed for runtime smoke coverage only.
  const buildNpcSpeechTemplates = () => {
    const blocks = ["greetings", "threats", "victory", "defeat", "neutral"];
    const roles = ["cop", "mafia", "bandit", "toxic", "neutral"];
    const channels = ["dm", "event", "battle"];
    const intensities = ["y", "o", "r", "k"];
    const roleLines = {
      greetings: {
        cop: ["вижу тебя на {PLACE}, держим дистанцию", "привет, спокойно смотрим на ситуацию"],
        mafia: ["добрый вечер, {PLAYER}, говорим тихо", "обсудим {TOPIC} без лишних ушей"],
        bandit: ["{PLAYER}, стой ровно, разговор короткий", "вижу тебя у {PLACE}, без движений"],
        toxic: ["{PLAYER}, покажи позицию", "подошел к {TOPIC}, говори прямо"],
        neutral: ["привет, {PLAYER}, тема открыта", "вижу разговор у {PLACE}, я рядом"]
      },
      threats: {
        cop: ["не дави на людей, отойди", "сбавь темп, так безопаснее"],
        mafia: ["спокойствие не значит слабость", "шаг назад будет разумнее"],
        bandit: ["{PLAYER}, деньги ближе и отвечай", "не тяни, терпение короткое"],
        toxic: ["сейчас видно, чего ты стоишь", "говори по делу, не прячься"],
        neutral: ["конфликт растет, это заметно", "тема уже на грани"]
      },
      victory: {
        cop: ["конфликт закрыт, идем дальше", "шум стих, идем дальше"],
        mafia: ["итог понятен, слов не нужно", "тишина закрепит результат"],
        bandit: ["вот так, {PLAYER}", "забрал свое, разговор окончен"],
        toxic: ["теперь видно, кто держит раунд", "разложил жестко и точно"],
        neutral: ["раунд закрыт спокойно", "площадь выдохнула"]
      },
      defeat: {
        cop: ["вижу ошибку, идем дальше", "проигрыш не ломает маршрут"],
        mafia: ["бывает, не суетись", "поражение тоже учит"],
        bandit: ["не вывез, плати вниманием", "слабый ход, {PLAYER}"],
        toxic: ["тема оказалась тяжелее", "уверенность просела"],
        neutral: ["не пошло, бывает", "проигран раунд, не вся игра"]
      },
      neutral: {
        cop: ["держим дистанцию", "если что, пиши по делу"],
        mafia: ["тихий разговор дешевле шума", "лучше выбрать точные слова"],
        bandit: ["смотрю, пока без движений", "тишина тоже давит"],
        toxic: ["интересно, чем ответишь", "слушаю, но недолго"],
        neutral: ["площадь шумит, тема живая", "смотрим на {TOPIC} без спешки"]
      }
    };
    const channelLead = {
      dm: ["личка:", "между нами:"],
      event: ["у {PLACE}:", "на площади:"],
      battle: ["раунд про {TOPIC}:", "спор на столе:"]
    };
    const intensityTail = {
      y: ["ровно и по делу", "без лишнего жара"],
      o: ["жестче, но ровно", "темп выше, слова точнее"],
      r: ["жестко, но без грязи", "давим смыслом, не криком"],
      k: ["холодно и коротко", "крайний тон, без истерики"]
    };
    const out = {};
    blocks.forEach(block => {
      out[block] = {};
      roles.forEach(role => {
        out[block][role] = {};
        channels.forEach(channel => {
          out[block][role][channel] = {};
          intensities.forEach(intensity => {
            const base = roleLines[block][role];
            const lead = channelLead[channel];
            const tail = intensityTail[intensity];
            out[block][role][channel][intensity] = [
              `${lead[0]} ${base[0]}, ${tail[0]}`,
              `${lead[1]} ${base[1]}, ${tail[1]}`
            ];
          });
        });
      });
    });
    return out;
  };

  const NPCSpeech = {};
  NPCSpeech.BLOCKS = ["greetings", "threats", "victory", "defeat", "neutral"];
  NPCSpeech.ROLES = ["cop", "mafia", "bandit", "toxic", "neutral"];
  NPCSpeech.CHANNELS = ["dm", "event", "battle"];
  NPCSpeech.INTENSITIES = ["y", "o", "r", "k"];
  NPCSpeech.DEFAULT_LOCALE = "ru";
  NPCSpeech.SUPPORTED_LOCALES = ["ru"];
  NPCSpeech.FUTURE_LOCALES = ["en", "ja"];
  NPCSpeech.TEMPLATES_BY_LOCALE = { ru: buildNpcSpeechTemplates() };
  NPCSpeech.TEMPLATES = NPCSpeech.TEMPLATES_BY_LOCALE.ru;
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

  Game.NPCSpeech = NPCSpeech;
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

  Game.__DEV.smokeNpcSpeechMillennialWordingOnce = function smokeNpcSpeechMillennialWordingOnce() {
    return Game.NPCSpeech && typeof Game.NPCSpeech.smokeMillennialWordingOnce === "function"
      ? Game.NPCSpeech.smokeMillennialWordingOnce()
      : { ok: false, failures: [{ code: "npc_speech_missing" }], forbiddenRemaining: [], missingCoverage: ["Game.NPCSpeech"], failedChecks: ["npc_speech_missing"] };
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
        ? Game.__DEV.__probeNpcSpeechReportReactionLine(cop, "Принял. Сейчас разберёмся.")
        : speech.generateRuntimeNpcLine(speech.makeCtx(cop, { source: "report_reaction", channel: "dm", tick: "runtime_smoke" }), "Принял. Сейчас разберёмся.");
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
