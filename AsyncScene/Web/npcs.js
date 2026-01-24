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
      const me = Game.State && Game.State.me;
      return me && me.name ? `@${String(me.name)}` : "ты";
    } catch (_) {
      return "ты";
    }
  };

  NPC.SAY = {
    toxic: {
      m: [
        "слыш, ты кто такой тут",
        "че по 💰, при бабле",
        "пошли выйдем, побазарим",
        "ты ща ответишь, не тяни",
        "не умничай, просто скажи",
        "давай, не прячься за толпой",
        "сейчас проверим кто тут главный",
        "ну что, готов к баттлу",
        "не мажь, отвечай по делу",
        "а ну-ка, покажи аргумент"
      ],
      f: [
        "ты вообще понимаешь где находишься",
        "давай без цирка, отвечай",
        "я тебя внимательно слушаю",
        "не тяни, скажи прямо",
        "не пытайся юлить"
      ]
    },
    bandit: {
      m: [
        "я тебя вижу",
        "💰 на стол",
        "не дергайся, это в твоих интересах",
        "давай без героизма",
        "я не торгуюсь долго",
        "либо отвечаешь, либо платишь",
        "сейчас проверим сколько ты стоишь",
        "не тяни, я не люблю ожидание",
        "сделай шаг назад и послушай",
        "лучший ход для тебя это смыться",
        "ну что, решился или дрогнул",
        "если полезешь в ответ, останешься без всего"
      ],
      f: [
        "я тебя заметила",
        "давай без резких движений",
        "я не люблю когда мне мешают",
        "либо отвечай, либо уходи",
        "не усложняй себе жизнь",
        "я не повторяю дважды",
        "ты правда хочешь это проверить",
        "лучше решим это прямо сейчас",
        "я предупреждаю один раз",
        "сделай правильный выбор"
      ]
    },
    cop: {
      m: [
        "Коп на связи. Держим порядок",
        "Фиксирую нарушение. Не лезьте",
        "Провокации — мимо",
        "Не лезь к агрессивным",
        "Увидел токсика/бандита — пиши в личку"
      ],
      f: [
        "Коп на связи. Держим порядок",
        "Фиксирую нарушение. Не лезьте",
        "Провокации — мимо",
        "Не лезь к агрессивным",
        "Увидел токсика/бандита — пиши в личку"
      ]
    },
    mafia: {
      m: [
        "Добрый день. Прошу говорить спокойно и по делу",
        "Благодарю за внимание. Давайте без лишних эмоций",
        "Мне важно, чтобы вы понимали последствия своих действий",
        "Не торопитесь. В этом месте спешка обычно дорого стоит",
        "Сохраните достоинство. Если сомневаетесь, лучше уйдите",
        "Я предпочитаю вежливость. И точность",
        "Давайте договоримся без шума. Это будет разумно"
      ],
      f: [
        "Добрый день. Прошу говорить спокойно и по делу",
        "Благодарю за внимание. Давайте без лишних эмоций",
        "Мне важно, чтобы вы понимали последствия своих действий",
        "Не торопитесь. В этом месте спешка обычно дорого стоит",
        "Сохраните достоинство. Если сомневаетесь, лучше уйдите",
        "Я предпочитаю вежливость. И точность",
        "Давайте договоримся без шума. Это будет разумно"
      ]
    },
    crowd: {
      m: [
        "ну че кто первый вбросит",
        "щас будет жарко",
        "ну давай, тащи",
        "я в шоке, но читаю дальше",
        "кринж на площади, но я остаюсь"
      ],
      f: [
        "интересно, чем это закончится",
        "что-то накаляется",
        "давайте посмотрим что будет",
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
    const S = Game.State;
    if (!S || !S.players) return [];
    return Object.values(S.players).filter(p => p.npc === true);
  };

  NPC.getById = (id) => {
    const S = Game.State;
    if (!S || !S.players) return null;
    return S.players[id] || null;
  };

  NPC.randomAny = () => {
    const all = NPC.getAll();
    return all.length ? all[Math.floor(Math.random() * all.length)] : null;
  };

  // Biased pickers for behavior loops (do NOT use these for crowd voting)
  NPC.randomForChat = () => {
    const all = NPC.getAll();
    const list = all.map(p => ({ item: p, weight: roleWeight(p, "chat") }));
    return pickWeightedPlayer(list);
  };

  NPC.randomForBattle = () => {
    const pool = NPC.getAll().filter(p => {
      if (!p) return false;
      if (p.role === "cop" || p.role === "mafia") return false;
      try {
        if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function" && Game.StateAPI.isNpcJailed(p.id)) return false;
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

  NPC.generateChatLine = (npc) => {
    if (!Game.Data) return "";

    const n = npc || NPC.randomAny();
    if (!n) return "";

    // Cop MAY post messages to the public chat on its own (warnings and descriptions).
    if (n.role === "cop") {
      const line = pickBySex(NPC.SAY.cop, n.sex);
      return normalizeCopLine(line);
    }

    // Mafioso is calm, polite, and uses ideal punctuation.
    if (n.role === "mafia") {
      const line = pickBySex(NPC.SAY.mafia, n.sex);
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

    const line = prefix + base;
    return prefix ? normalizeLineKeepPunct(line) : normalizeLine(line);
  };

  // DM line without mentions (keeps NPC style, but avoids @names)
  NPC.generateDmLine = (npc) => {
    if (!Game.Data) return "";
    const n = npc || NPC.randomAny();
    if (!n) return "";

    if (n.role === "cop" || n.role === "mafia") {
      const line = pickBySex(NPC.SAY[n.role], n.sex);
      return normalizeCopLine(line);
    }

    let base = "";
    if (n.role === "toxic") base = pickBySex(NPC.SAY.toxic, n.sex);
    else if (n.role === "bandit") base = pickBySex(NPC.SAY.bandit, n.sex);
    else if (Math.random() < 0.25) base = pickBySex(NPC.SAY.crowd, n.sex);
    else base = pickOne(Game.Data.NPC_CHAT_LINES);

    return normalizeLine(base);
  };

  // Villain DM flow: question -> challenge
  const villainQuestions = [
    "ты точно тут? да или нет?",
    "это про тебя? отвечай",
    "тут кто главный?",
    "ты уверен(а), что это твоя тема?",
    "ну что, впишешься или мимо?"
  ];
  const villainChallenges = [
    "го порубимся. давай раундик",
    "вызывай на батл, если не зассал(а)",
    "батл? давай проверим тебя",
    "ну чё, на батл или стесняешься?"
  ];

  NPC.generateVillainQuestion = (npc) => {
    const line = pickOne(villainQuestions);
    return normalizeLine(line);
  };

  NPC.generateVillainChallenge = (npc) => {
    const line = pickOne(villainChallenges);
    return normalizeLine(line);
  };

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
        risk: "Если вы проиграете ему, он может обнулить ваши 💰.",
        advice: "Лучшее решение - смыться или не ввязываться. Если вступили в бой, главное - не проиграть."
      },
      mafia: {
        title: "Мафиози",
        style: "Вежливый тон, но холодная логика. Говорит спокойно и давит без крика.",
        risk: "Опасен тем, что после контакта вы теряете ⚡.",
        advice: "Не вступайте в спор. Если он рядом, лучший выбор - смыться."
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
    return normalizeCopLine("Я на связи. Нужна помощь — спроси про токсика, бандита или мафиози, либо кинь донос в личку");
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
      : (Game.State && Game.State.me && Game.State.me.name) ? String(Game.State.me.name).trim()
      : "";
    const mention = me ? `@${me}` : "";

    let text = NPC.generateChatLine(n);

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

  // Boot hook: ensure NPCs are seeded as soon as Game.State exists.
  // This prevents "Game.NPC.getAll is not a function" / empty NPC lists when UI starts.
  (function bootSeedNPCs(){
    const trySeed = () => {
      try {
        if (Game && Game.State) NPC.seedPlayers(Game.State);
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
      if ((Game && Game.State && Game.State._seededNPCs) || attempts >= maxAttempts) return;
      setTimeout(tick, 50);
    };
    if (!(Game && Game.State && Game.State._seededNPCs)) setTimeout(tick, 0);
  })();
})();
