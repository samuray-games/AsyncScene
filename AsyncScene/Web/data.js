// data.js
window.Game = window.Game || {};

(() => {
  const Data = {};

  Data.RANDOM_NAMES = [
    "Ray","Samuray","Ohmylord","Neko","Rin","Yuna","Sora","Kai","Mika","Aki",
    "Tori","Haru","Sen","Dara","Memelord","Sigma","Boss","Zzz","Kappa","Fox"
  ];

  // === PROGRESSION (single source of truth) ===
  Data.PROGRESSION_V2 = true;
  const PROG_V2 = Data.PROGRESSION_V2 === true;
  // Influence grows by +1 for each N wins (UI hint only).
  Data.PROGRESSION = {
    winsPerInfluence: PROG_V2 ? 12 : 5,
    unlockInfluence: {
      strong: PROG_V2 ? 8 : 5,     // o
      power: PROG_V2 ? 25 : 10,    // r
      absolute: PROG_V2 ? 60 : 100 // k
    }
  };

  // === POINTS (short-term tactical currency) ===
  Data.POINTS_START = 0;
  Data.POINTS_SOFT_CAP = 20;
  Data.CIRCULATION_ENABLED = false;
  Data.START_POINTS_PLAYER = 12;
  Data.START_POINTS_NPC = 8;
  Data.RICH_THRESHOLD = 20;
  Data.BATTLE_ENTRY_COST = 1;
  Data.BATTLE_WIN_TAKE = 2;
  Data.DRAW_CROWD_DEPOSIT = 1;
  Data.RICH_LOSS_EXTRA = 1;

  // Points rewards — REP v2 economy
  Data.POINTS_WIN = 2;              // Victory reward (was 3)
  Data.POINTS_DRAW = 1;             // Draw reward (was 2)
  Data.POINTS_LOSE = 0;             // Loss reward (was 1)
  Data.POINTS_VOTE_TIE = 1;
  Data.POINTS_TIE_WIN_PICK = 1;     // Tie-pick win (was 2)
  Data.POINTS_TIE_LOSE_PICK = 0;    // Tie-pick lose (was 1)
  Data.POINTS_CHAT_REPLY = 1;

  // Rep / Influence progression (long-term) — REP v2 economy
  Data.REP_WIN = 2;                    // Base victory reward
  Data.REP_WIN_TIER_BONUS = 3;        // Victory over stronger opponent
  Data.REP_DRAW = 1;                  // Draw reward
  Data.REP_LOSE = 1;                  // Loss penalty (was 0)
  Data.REP_TIE_HELP = 1;              // Tie vote participation
  Data.REP_TIE_WIN = 2;               // Tie pick win
  Data.REP_TIE_LOSE = 1;              // Tie pick lose
  Data.REP_DAILY = 1;                 // Daily bonus
  Data.REP_REPORT_TRUE = 2;           // Truthful report to cop
  Data.REP_REPORT_FALSE = 2;          // False report penalty
  Data.REP_REPORT_FALSE_REPEAT = 3;   // Repeated false report
  Data.REP_TOXIC_ROBBERY = 2;         // Toxic robbed you
  Data.REP_BANDIT_ROBBERY = 3;        // Bandit robbed you
  Data.REP_DISMISS = 3;               // Dismiss ("отвали") penalty
  Data.REP_DISMISS_REPEAT = 4;        // Repeated dismiss
  Data.REP_CROWD_SUPPORT = 1;         // Crowd voted for you
  Data.REP_FLOOR = 1;                 // Minimum REP after NPC actions
  
  Data.INF_BASE_COST = PROG_V2 ? 16 : 12;
  Data.INF_PER_LEVEL = PROG_V2 ? 2 : 4;
  Data.WEEKLY_SOFTCAP = PROG_V2 ? 2 : 3;
  Data.SOFTCAP_MULT = 2;

  // Points costs
  Data.COST_BATTLE_BOOST = 2;
  Data.COST_REROLL_ARGUMENTS = 3;
  Data.COST_HINT_WEAKNESS = 2;
  Data.COST_CROWD_EXTRA_VOTE = 2;
  Data.COST_VOTE_SHIELD = 1;
  Data.COST_FORCE_NPC_EVENT = 5;
  Data.COST_INTERVENE_CONFLICT = 4;
  Data.TEACH_COST = {
    y: 1,
    o: 2,
    r: 3,
    k: 0
  };

  // Text mode (genz | alpha)
  Data.TEXT_MODE = "genz";
  Data.TEXTS = {
    genz: {
      tie_start: "Толпа решает.",
      tie_call_to_action: "Вписывайся - кликни на имя, за кого ты.",
      tie_click_name_hint: "Кликни на имя, за кого хочешь вписаться.",
      vote_ok: "Принято. Ты вписался.",
      vote_already: "Ты уже вписался.",
      vote_fail: "Не удалось вписаться.",
      tie_timer: "Осталось: {sec}s",
      tie_end_winner: "Победил {name} - {aVotes}:{bVotes}.",
      tie_end_draw: "Поровну по голосам - {aVotes}:{bVotes}.",
      tie_chat_start: "Толпа решает. Вписывайся - кликни на имя в событиях.",
      tie_chat_end_winner: "Толпа решила. Победил {name} - {aVotes}:{bVotes}.",
      tie_chat_end_draw: "Толпа решила. Поровну - {aVotes}:{bVotes}.",

      events_title: "События ({count})",
      events_empty: "Ничего не происходит, сплошная болтовня.",
      events_close_extra: "Закрыть лишнее",
      events_clear_all: "Очистить",
      events_done: "Зафиксили",
      events_left: "Ещё {sec} сек",

      battle_win: "Победа",
      battle_lose: "Поражение",
  battle_draw: "Толпа решает",
      battle_not_enough_points: "Не хватает 💰.",

      escape_button_label: "Свалить за взятку {X} 💰",
      teach_sent_dm: "Ты обучил(а) {student} аргументу {arg}. Цена: {cost} 💰.",
      teach_sent_chat: "{teacher} обучил(а) {student} аргументу.",
      invite_open_hint: "Введи ник игрока. Без ошибок, иначе не сработает.",
      invite_invalid: "Такого игрока нет.",
      menu_title: "Меню",
    },
    alpha: {
      tie_start: "ТОЛПА",
      tie_call_to_action: "ВПИСЫВАЙСЯ",
      tie_click_name_hint: "ТЫКНИ ИМЯ",
      vote_ok: "✓ ОК",
      vote_already: "✓ УЖЕ",
      vote_fail: "✕ НЕ",
      tie_timer: "⏳{sec}",
      tie_end_winner: "🏆 {name} {aVotes}:{bVotes}",
      tie_end_draw: "DRAW {aVotes}:{bVotes}",
      tie_chat_start: "ТОЛПА - ВПИСЫВАЙСЯ",
      tie_chat_end_winner: "ТОЛПА: 🏆 {name} {aVotes}:{bVotes}",
      tie_chat_end_draw: "ТОЛПА: DRAW {aVotes}:{bVotes}",

      events_title: "EVENTS {count}",
      events_empty: "0 EVENTS",
      events_close_extra: "СВЕРНУТЬ",
      events_clear_all: "ЧИСТКА",
      events_done: "OK",
      events_left: "⏳{sec}",

      battle_win: "WIN",
      battle_lose: "RIP",
      battle_draw: "DRAW",
      battle_not_enough_points: "0 PTS",

      escape_button_label: "СВАЛИТЬ -{X}",
      teach_sent_dm: "TEACH {student} {arg} -{cost}",
      teach_sent_chat: "TEACH {teacher}->{student}",
      invite_open_hint: "ВВЕДИ НИК",
      invite_invalid: "НЕТ ТАКОГО",
      menu_title: "MENU",
    },
    manifest: {
      short: "Набирай ⚡, собирай ресурсы и влияй на исход событий. Цель - стать фигурой, с которой считаются.",
      full:
        "Цель игры - не победить всех, а стать значимой фигурой в социальном поле.\n" +
        "Игрок стремится к тому, чтобы его решения влияли на исход событий,\n" +
        "его имя вызывало реакцию,\n" +
        "а мир адаптировался к его присутствию.\n\n" +
        "Победы дают ресурсы,\n" +
        "ресурсы дают возможности,\n" +
        "но только ⚡ определяет, считается ли с тобой этот мир."
    }
  };

  Data.t = (key, vars = {}) => {
    const mode = (Data.TEXT_MODE === "alpha") ? "alpha" : "genz";
    const layer = (Data.TEXTS && Data.TEXTS[mode]) ? Data.TEXTS[mode] : {};
    const genz = (Data.TEXTS && Data.TEXTS.genz) ? Data.TEXTS.genz : {};
    let str = (layer && layer[key] != null) ? layer[key] : (genz && genz[key] != null) ? genz[key] : String(key || "");
    str = String(str || "");
    return str.replace(/\{(\w+)\}/g, (_, k) => {
      const v = (vars && Object.prototype.hasOwnProperty.call(vars, k)) ? vars[k] : "";
      return String(v);
    });
  };

  Data.teachCostByColor = (color) => {
    const s0 = String(color || "").toLowerCase();
    const key =
      (s0 === "yellow") ? "y" :
      (s0 === "orange") ? "o" :
      (s0 === "red") ? "r" :
      (s0 === "black") ? "k" :
      s0;
    const tbl = Data.TEACH_COST || {};
    const v = tbl[key];
    if (Number.isFinite(v)) return (v | 0);
    return 0;
  };

  // === LOTTERY (single source of truth) ===
  Data.LOTTERY = {
    bet: 5,
    cooldownMs: 10 * 60 * 1000,
    payouts: [
      { value: 0, weight: 70 },
      { value: 5, weight: 20 },
      { value: 10, weight: 9 },
      { value: 20, weight: 1 },
    ],
  };

  // === ESCAPE COSTS (single source of truth) ===
  // Escape is a paid action in points. Cost depends on opponent role.
  // "default" is used when role is unknown.
  Data.ESCAPE_COST = {
    default: 1,
    toxic: 1,
    bandit: 2,
    mafia: 3,
    cop: 1
  };

  // Centralized escape-cost resolver for UI/core/API.
  // Accepts role string and optional battle for future extensions.
  Data.escapeCostByRole = (role, battle) => {
    const r = String(role || "").trim().toLowerCase();
    const tbl = Data.ESCAPE_COST || {};
    const v = (r && Object.prototype.hasOwnProperty.call(tbl, r)) ? tbl[r] : tbl.default;
    const n = Number(v);
    if (Number.isFinite(n)) return Math.max(0, n | 0);
    return 1;
  };

  // Argument strength (color codes):
  // y = слабые (очень скромные), o = сильные (обычные), r = мощные (дерзкие), k = абсолютные (строгие)
  Data.ARGUMENT_POWER = { y: 1, o: 2, r: 3, k: 4 };

  // Canonical color order and helpers (single source of truth for power logic)
  Data.ARGUMENT_COLORS = ["y", "o", "r", "k"]; // ascending

  Data.isBlack = (c) => c === "k";

  // Colors available to a player/NPC by influence (single source of truth for tiers).
  // Only the current tier (no weaker tiers at higher influence).
  Data.allowedColorsByInfluence = (influence) => {
    const inf = Number(influence || 0);
    const u = (Data.PROGRESSION && Data.PROGRESSION.unlockInfluence) ? Data.PROGRESSION.unlockInfluence : {};
    const strongAt = Number(u.strong || 5);
    const powerAt = Number(u.power || 10);
    const absoluteAt = Number(u.absolute || 100);

    if (inf >= absoluteAt) return ["k"];
    if (inf >= powerAt) return ["r"];
    if (inf >= strongAt) return ["o"];
    return ["y"];
  };

  // Legacy helper: some UI places may still want full color names.
  Data.allowedColorNamesByInfluence = (influence) => {
    const codes = Data.allowedColorsByInfluence(influence);
    const map = { y: "yellow", o: "orange", r: "red", k: "black" };
    return (codes || []).map(c => map[c] || c);
  };

  // Legacy alias for older code that expects Data.UNLOCKS
  Data.UNLOCKS = Data.PROGRESSION.unlockInfluence;

  Data.colorRank = (c) => Data.ARGUMENT_POWER[c] || 0;

  Data.colorDelta = (a, b) => Math.abs(Data.colorRank(a) - Data.colorRank(b));

  // Neighbor steps: y-o, o-r (k is special and excluded)
  Data.areNeighborSteps = (a, b) => {
    if (Data.isBlack(a) || Data.isBlack(b)) return false;
    return Data.colorDelta(a, b) === 1;
  };

  // Two-step gap: y-r (k excluded)
  Data.isTwoStepGap = (a, b) => {
    if (Data.isBlack(a) || Data.isBlack(b)) return false;
    return Data.colorDelta(a, b) >= 2;
  };

  // Centralized labels for UI/system texts (single source of truth)
  Data.ARGUMENT_TIER = {
    y: { key: "weak",   name: "слабые" },
    o: { key: "strong", name: "сильные" },
    r: { key: "power",  name: "мощные" },
    k: { key: "absolute", name: "абсолютные" }
  };

  // === TEACHING COSTS (single source of truth) ===
  // Teaching is paid in points. Only y/o/r are teachable by design.
  // (Absolute "k" arguments are not teachable via DM.)
  Data.TEACH_COST = { y: 1, o: 2, r: 3 };

  // Normalize color inputs (supports legacy names used by older UI code)
  Data.normalizeColor = (c) => {
    const s = String(c || "").trim().toLowerCase();
    if (!s) return "";
    if (s === "y" || s === "yellow" || s === "weak") return "y";
    if (s === "o" || s === "orange" || s === "strong") return "o";
    if (s === "r" || s === "red" || s === "power") return "r";
    if (s === "k" || s === "black" || s === "absolute") return "k";
    return s;
  };

  // Backward-compatible cost resolver
  Data.teachCostByColor = (c) => {
    const key = Data.normalizeColor(c);
    return Data.TEACH_COST[key] || 0;
  };

  // Convenience: convert canonical codes to readable Russian tier labels
  Data.colorToTierName = (c) => {
    const key = Data.normalizeColor(c);
    return (Data.ARGUMENT_TIER[key] && Data.ARGUMENT_TIER[key].name) ? Data.ARGUMENT_TIER[key].name : "";
  };

  // Role behavior flags used by core/API logic
  Data.ROLES = {
    // Role behavior flags used by core/API logic
    toxic: {
      stealsOnWrongType: true,
      minCrowdInfluence: 40
    },
    bandit: {
      stealsOnWrongType: true,
      wipesAllPointsOnAnswer: true,
      minCrowdInfluence: 70
    },
    mafia: {
      // Mafioso is endgame-tier.
      // Any answer against Mafioso (except escape) wipes player's influence in conflict-core.
      wipesAllInfluenceOnAnyAnswer: true,
      noInsult: true,
      influence: 100,
      stealsOnWrongType: false
    },
    cop: {
      canBeReported: true,
      reportReward: 2,
      falseReportPenalty: 5,
      minCrowdInfluence: Infinity
    }
  };

  Data.ARG_BASE_Y = {
    about: [
      { q:"Кто сегодня на слуху, если не ошибаюсь?", a:"Кажется, про {NAME} говорят." },
      { q:"Кто тут, может быть, в центре внимания?", a:"Вроде бы про {NAME} шепчутся." },
      { q:"Кто сейчас, возможно, у всех в ленте?", a:"Похоже, про {NAME} пишут." },
      { q:"Кого, как будто, все обсуждают?", a:"Кажется, про {NAME} спорят." },
      { q:"Кто снова, наверное, на повестке?", a:"Если не ошибаюсь, про {NAME} напоминают." },
      { q:"Кто тут, кажется, главная тема?", a:"Вроде бы про {NAME} весь чат." },
      { q:"Кого сегодня, может быть, упоминают чаще всего?", a:"Кажется, про {NAME} чаще всего." },
      { q:"Кто сейчас, возможно, на хайпе?", a:"Похоже, про {NAME} везде." },
      { q:"Кто опять, кажется, в новостях?", a:"Кажется, про {NAME} снова новости." }
    ],
    who: [
      { q:"Кто, как вам кажется, был рядом?", a:"{NAME}." },
      { q:"Кто, возможно, участвовал?", a:"{NAME}." },
      { q:"Кто, если не ошибаюсь, был вовлечён?", a:"{NAME}." },
      { q:"Кто, может быть, присутствовал?", a:"{NAME}." },
      { q:"Кто, вероятно, оказался там?", a:"{NAME}." },
      { q:"Кто, как будто, был поблизости?", a:"{NAME}." },
      { q:"Кто, возможно, имел отношение?", a:"{NAME}." },
      { q:"Кто, если предположить, знал об этом?", a:"{NAME}." },
      { q:"Кто, как вам кажется, был внутри ситуации?", a:"{NAME}." }
    ],
    where: [
      { q:"Где мы сейчас, как вам кажется?", a:"Здесь." },
      { q:"Где это, возможно, произошло?", a:"Тут." },
      { q:"Где, если не ошибаюсь, это видели?", a:"В {PLACE}." },
      { q:"Где, может быть, назначена встреча?", a:"В {PLACE}." },
      { q:"Где, вероятно, искать ответы?", a:"В {PLACE}." },
      { q:"Где, как будто, это спрятано?", a:"В {PLACE}." },
      { q:"Где, возможно, люднее всего?", a:"В {PLACE}." },
      { q:"Где, если предположить, безопаснее?", a:"В {PLACE}." },
      { q:"Где, как вам кажется, всё начинается?", a:"В {PLACE}." }
    ],
    yn: [
      { q:"Вы уверены?", a:"Да." },
      { q:"Это правда, как вам кажется?", a:"Нет." },
      { q:"Он, возможно, здесь?", a:"Да." },
      { q:"Это было случайно, как вы думаете?", a:"Нет." },
      { q:"Может быть, стоит вмешаться?", a:"Да." },
      { q:"Лучше, возможно, промолчать?", a:"Нет." },
      { q:"Есть согласие, как вы считаете?", a:"Да." },
      { q:"Это, наверное, опасно?", a:"Нет." },
      { q:"Продолжаем, как вы думаете?", a:"Да." }
    ]
  };

  Data.ARG_BASE_O = {
    about: [
      { q:"Кто сегодня на слуху?", a:"Про {NAME} говорят." },
      { q:"Кто тут в центре внимания?", a:"Про {NAME} шепчутся." },
      { q:"Кто сейчас у всех в ленте?", a:"Про {NAME} пишут." },
      { q:"Кого все обсуждают?", a:"Про {NAME} спорят." },
      { q:"Кто снова на повестке?", a:"Про {NAME} напоминают." },
      { q:"Кто тут главная тема?", a:"Про {NAME} весь чат." },
      { q:"Кого сегодня упоминают чаще всего?", a:"Про {NAME} чаще всего." },
      { q:"Кто сейчас на хайпе?", a:"Про {NAME} везде." },
      { q:"Кто опять в новостях?", a:"Про {NAME} снова новости." }
    ],
    who: [
      { q:"Кто был рядом?", a:"{NAME}." },
      { q:"Кто участвовал?", a:"{NAME}." },
      { q:"Кто был вовлечён?", a:"{NAME}." },
      { q:"Кто присутствовал?", a:"{NAME}." },
      { q:"Кто оказался там?", a:"{NAME}." },
      { q:"Кто был поблизости?", a:"{NAME}." },
      { q:"Кто имел отношение?", a:"{NAME}." },
      { q:"Кто знал об этом?", a:"{NAME}." },
      { q:"Кто был внутри ситуации?", a:"{NAME}." }
    ],
    where: [
      { q:"Где мы сейчас?", a:"Здесь." },
      { q:"Где это произошло?", a:"Тут." },
      { q:"Где это видели?", a:"В {PLACE}." },
      { q:"Где назначена встреча?", a:"В {PLACE}." },
      { q:"Где искать ответы?", a:"В {PLACE}." },
      { q:"Где это спрятано?", a:"В {PLACE}." },
      { q:"Где самое людное место?", a:"В {PLACE}." },
      { q:"Где безопаснее?", a:"В {PLACE}." },
      { q:"Где всё начинается?", a:"В {PLACE}." }
    ],
    yn: [
      { q:"Ты уверен?", a:"Да." },
      { q:"Это правда?", a:"Нет." },
      { q:"Он здесь?", a:"Да." },
      { q:"Это было случайно?", a:"Нет." },
      { q:"Нужно вмешаться?", a:"Да." },
      { q:"Лучше промолчать?", a:"Нет." },
      { q:"Есть согласие?", a:"Да." },
      { q:"Это опасно?", a:"Нет." },
      { q:"Продолжаем?", a:"Да." }
    ]
  };

  Data.ARG_BASE_R = {
    about: [
      { q:"Кто сейчас на слуху..!", a:"Про {NAME} говорят." },
      { q:"Кто в центре внимания..!", a:"Про {NAME} шепчутся." },
      { q:"Кто в ленте..!", a:"Про {NAME} пишут." },
      { q:"Кого все обсуждают..!", a:"Про {NAME} спорят." },
      { q:"Кто на повестке..!", a:"Про {NAME} напоминают." },
      { q:"Кто главная тема..!", a:"Про {NAME} весь чат." },
      { q:"Кого упоминают чаще всего..!", a:"Про {NAME} чаще всего." },
      { q:"Кто на хайпе..!", a:"Про {NAME} везде." },
      { q:"Кто снова в новостях..!", a:"Про {NAME} снова новости." }
    ],
    who: [
      { q:"Кто рядом..!", a:"{NAME}." },
      { q:"Кто участвовал..!", a:"{NAME}." },
      { q:"Кто вовлечён..!", a:"{NAME}." },
      { q:"Кто здесь..!", a:"{NAME}." },
      { q:"Кто там..!", a:"{NAME}." },
      { q:"Кто поблизости..!", a:"{NAME}." },
      { q:"Кто имеет отношение..!", a:"{NAME}." },
      { q:"Кто знал..!", a:"{NAME}." },
      { q:"Кто внутри..!", a:"{NAME}." }
    ],
    where: [
      { q:"Где мы..!", a:"Здесь." },
      { q:"Где это..!", a:"Тут." },
      { q:"Где видели..!", a:"В {PLACE}." },
      { q:"Где встреча..!", a:"В {PLACE}." },
      { q:"Где ответы..!", a:"В {PLACE}." },
      { q:"Где спрятано..!", a:"В {PLACE}." },
      { q:"Где людно..!", a:"В {PLACE}." },
      { q:"Где безопасно..!", a:"В {PLACE}." },
      { q:"Где начало..!", a:"В {PLACE}." }
    ],
    yn: [
      { q:"Ты уверен..!", a:"Да." },
      { q:"Это правда..!", a:"Нет." },
      { q:"Он здесь..!", a:"Да." },
      { q:"Это случайно..!", a:"Нет." },
      { q:"Вмешиваемся..!", a:"Да." },
      { q:"Молчим..!", a:"Нет." },
      { q:"Есть согласие..!", a:"Да." },
      { q:"Это опасно..!", a:"Нет." },
      { q:"Продолжаем..!", a:"Да." }
    ]
  };

  Data.ARG_BASE_K = {
    about: [
      { q:"Назови того кто на слуху!", a:"Про {NAME} говорят." },
      { q:"Назови того кто в центре внимания!", a:"Про {NAME} шепчутся." },
      { q:"Укажи того кто в ленте!", a:"Про {NAME} пишут." },
      { q:"Назови того кого обсуждают!", a:"Про {NAME} спорят." },
      { q:"Назови того кто на повестке!", a:"Про {NAME} напоминают." },
      { q:"Укажи того кто главная тема!", a:"Про {NAME} весь чат." },
      { q:"Назови того кого упоминают чаще всего!", a:"Про {NAME} чаще всего." },
      { q:"Назови того кто на хайпе!", a:"Про {NAME} везде." },
      { q:"Укажи того кто в новостях!", a:"Про {NAME} снова новости." }
    ],
    who: [
      { q:"Назови того кто рядом!", a:"{NAME}." },
      { q:"Назови того кто участвовал!", a:"{NAME}." },
      { q:"Укажи того кто вовлечён!", a:"{NAME}." },
      { q:"Назови того кто присутствует!", a:"{NAME}." },
      { q:"Назови того кто там!", a:"{NAME}." },
      { q:"Укажи того кто поблизости!", a:"{NAME}." },
      { q:"Назови того кто имеет отношение!", a:"{NAME}." },
      { q:"Назови того кто знал!", a:"{NAME}." },
      { q:"Укажи того кто внутри!", a:"{NAME}." }
    ],
    where: [
      { q:"Назови место где мы!", a:"Здесь." },
      { q:"Назови место где это!", a:"Тут." },
      { q:"Укажи место где видели!", a:"В {PLACE}." },
      { q:"Назови место встречи!", a:"В {PLACE}." },
      { q:"Назови место где ответы!", a:"В {PLACE}." },
      { q:"Укажи место где спрятано!", a:"В {PLACE}." },
      { q:"Назови место где людно!", a:"В {PLACE}." },
      { q:"Назови место где безопасно!", a:"В {PLACE}." },
      { q:"Укажи место начала!", a:"В {PLACE}." }
    ],
    yn: [
      { q:"Подтверди уверенность!", a:"Да." },
      { q:"Подтверди правду!", a:"Нет." },
      { q:"Подтверди присутствие!", a:"Да." },
      { q:"Подтверди случайность!", a:"Нет." },
      { q:"Подтверди вмешательство!", a:"Да." },
      { q:"Подтверди молчание!", a:"Нет." },
      { q:"Подтверди согласие!", a:"Да." },
      { q:"Подтверди опасность!", a:"Нет." },
      { q:"Подтверди продолжение!", a:"Да." }
    ]
  };

  Data.ARG_CANON_TEXT = `
Y1 ABOUT Q1: Извините, про кого сейчас говорят?
Y1 ABOUT A1: Кажется, про {NAME}…

Y1 ABOUT Q2: Простите, о ком сейчас все говорят?
Y1 ABOUT A2: Вроде бы про {NAME}.

Y1 ABOUT Q3: Подскажите, про кого сейчас больше всего слухов?
Y1 ABOUT A3: Похоже, про {NAME}.

Y1 ABOUT Q4: Извините, кого сейчас обсуждают?
Y1 ABOUT A4: Наверное, про {NAME}.

Y1 ABOUT Q5: Простите, о ком сейчас чаще говорят?
Y1 ABOUT A5: Ну… вроде про {NAME}.

Y1 ABOUT Q6: Скажите, про кого сейчас больше всего разговоров?
Y1 ABOUT A6: Ну… по-моему, про {NAME}.

Y1 ABOUT Q7: Простите, кого сейчас чаще упоминают?
Y1 ABOUT A7: Я могу ошибаться, но про {NAME}.

Y1 ABOUT Q8: Извините, о ком сейчас ходят разговоры?
Y1 ABOUT A8: Не уверен(а), но вроде про {NAME}.

Y1 ABOUT Q9: Простите, про кого сейчас пишут чаще всего?
Y1 ABOUT A9: Кажется, опять про {NAME}.

Y1 WHO Q1: Эм… простите, кто это?
Y1 WHO A1: {NAME}… кажется.

Y1 WHO Q2: Извините, кто был рядом?
Y1 WHO A2: Наверное, {NAME}.

Y1 WHO Q3: Простите, кто участвовал?
Y1 WHO A3: Ну… {NAME}.

Y1 WHO Q4: Извините, кто оказался там?
Y1 WHO A4: Похоже, {NAME}.

Y1 WHO Q5: Простите, кто был поблизости?
Y1 WHO A5: Если не ошибаюсь, {NAME}.

Y1 WHO Q6: Извините, кто был вовлечён?
Y1 WHO A6: {NAME}… кажется.

Y1 WHO Q7: Простите, кто присутствовал?
Y1 WHO A7: Наверное, {NAME}.

Y1 WHO Q8: Извините, кто имел отношение?
Y1 WHO A8: Ну… {NAME}.

Y1 WHO Q9: Простите, кто знал об этом?
Y1 WHO A9: Похоже, {NAME}.

Y1 WHERE Q1: Эм… простите, где мы сейчас?
Y1 WHERE A1: Кажется, здесь.

Y1 WHERE Q2: Извините, где это произошло?
Y1 WHERE A2: Наверное, тут.

Y1 WHERE Q3: Простите, где это видели?
Y1 WHERE A3: Похоже, в {PLACE}.

Y1 WHERE Q4: Извините, где назначена встреча?
Y1 WHERE A4: Наверное, в {PLACE}.

Y1 WHERE Q5: Простите, где искать ответы?
Y1 WHERE A5: Кажется, в {PLACE}.

Y1 WHERE Q6: Извините, где это спрятано?
Y1 WHERE A6: Ну… вроде в {PLACE}.

Y1 WHERE Q7: Простите, где самое людное место?
Y1 WHERE A7: Если не ошибаюсь, в {PLACE}.

Y1 WHERE Q8: Извините, где безопаснее?
Y1 WHERE A8: Похоже, в {PLACE}.

Y1 WHERE Q9: Простите, где всё начинается?
Y1 WHERE A9: Наверное, в {PLACE}.

Y1 YN Q1: Эм… простите, вы уверены?
Y1 YN A1: Наверное, да.

Y1 YN Q2: Извините, это правда?
Y1 YN A2: Скорее нет.

Y1 YN Q3: Простите, он здесь?
Y1 YN A3: Похоже, да.

Y1 YN Q4: Извините, это было случайно?
Y1 YN A4: Наверное, нет.

Y1 YN Q5: Простите, стоит вмешаться?
Y1 YN A5: Кажется, да.

Y1 YN Q6: Извините, лучше промолчать?
Y1 YN A6: Ну… вряд ли.

Y1 YN Q7: Простите, есть согласие?
Y1 YN A7: Ну… да, наверное.

Y1 YN Q8: Извините, это опасно?
Y1 YN A8: Похоже, нет.

Y1 YN Q9: Простите, продолжаем?
Y1 YN A9: Наверное, да.

Y2 ABOUT Q1: Прости, про кого сейчас говорят?
Y2 ABOUT A1: Про {NAME} вроде говорят.

Y2 ABOUT Q2: Подскажи, о ком сейчас все говорят?
Y2 ABOUT A2: Про {NAME}, кажется, вспоминают.

Y2 ABOUT Q3: Скажи, кого сейчас обсуждают?
Y2 ABOUT A3: Про {NAME}, похоже, спорят.

Y2 ABOUT Q4: Можно спросить, чьё имя сейчас на слуху?
Y2 ABOUT A4: Про {NAME} слышу чаще всего.

Y2 ABOUT Q5: Слушай, про кого сейчас больше всего слухов?
Y2 ABOUT A5: Про {NAME}, наверное, шумят.

Y2 ABOUT Q6: Если знаешь, о ком сейчас больше разговоров?
Y2 ABOUT A6: Про {NAME} разговоров много.

Y2 ABOUT Q7: Прости, кого сейчас чаще упоминают?
Y2 ABOUT A7: Про {NAME} чаще упоминают.

Y2 ABOUT Q8: Подскажи, про кого сейчас пишут?
Y2 ABOUT A8: Про {NAME}, похоже, пишут.

Y2 ABOUT Q9: Скажи, о ком сейчас спорят?
Y2 ABOUT A9: Про {NAME}, кажется, спорят.

Y2 WHO Q1: Прости, кто это?
Y2 WHO A1: {NAME}… кажется.

Y2 WHO Q2: Скажи, кто был рядом?
Y2 WHO A2: Наверное, {NAME}.

Y2 WHO Q3: Подскажи, кто участвовал?
Y2 WHO A3: Похоже, {NAME}.

Y2 WHO Q4: Можно спросить, кто был вовлечён?
Y2 WHO A4: {NAME}… похоже.

Y2 WHO Q5: Слушай, кто присутствовал?
Y2 WHO A5: Если не ошибаюсь, {NAME}.

Y2 WHO Q6: Прости, кто оказался там?
Y2 WHO A6: Наверное, {NAME}.

Y2 WHO Q7: Скажи, кто был поблизости?
Y2 WHO A7: Похоже, {NAME}.

Y2 WHO Q8: Подскажи, кто имел отношение?
Y2 WHO A8: {NAME}… кажется.

Y2 WHO Q9: Можно спросить, кто знал об этом?
Y2 WHO A9: Если не ошибаюсь, {NAME}.

Y2 WHERE Q1: Прости, где мы сейчас?
Y2 WHERE A1: Кажется, здесь.

Y2 WHERE Q2: Скажи, где это произошло?
Y2 WHERE A2: Наверное, тут.

Y2 WHERE Q3: Подскажи, где это видели?
Y2 WHERE A3: Похоже, в {PLACE}.

Y2 WHERE Q4: Можно спросить, где назначена встреча?
Y2 WHERE A4: Наверное, в {PLACE}.

Y2 WHERE Q5: Слушай, где искать ответы?
Y2 WHERE A5: Кажется, в {PLACE}.

Y2 WHERE Q6: Прости, где это спрятано?
Y2 WHERE A6: Похоже, в {PLACE}.

Y2 WHERE Q7: Скажи, где самое людное место?
Y2 WHERE A7: Если не ошибаюсь, в {PLACE}.

Y2 WHERE Q8: Подскажи, где безопаснее?
Y2 WHERE A8: Наверное, в {PLACE}.

Y2 WHERE Q9: Можно спросить, где всё начинается?
Y2 WHERE A9: Кажется, в {PLACE}.

Y2 YN Q1: Прости, ты уверен?
Y2 YN A1: Наверное, да.

Y2 YN Q2: Скажи, это правда?
Y2 YN A2: Скорее нет.

Y2 YN Q3: Подскажи, он здесь?
Y2 YN A3: Похоже, да.

Y2 YN Q4: Можно спросить, это было случайно?
Y2 YN A4: Наверное, нет.

Y2 YN Q5: Слушай, стоит вмешаться?
Y2 YN A5: Кажется, да.

Y2 YN Q6: Прости, лучше промолчать?
Y2 YN A6: Ну… вряд ли.

Y2 YN Q7: Скажи, есть согласие?
Y2 YN A7: Ну… да, наверное.

Y2 YN Q8: Подскажи, это опасно?
Y2 YN A8: Похоже, нет.

Y2 YN Q9: Можно спросить, продолжаем?
Y2 YN A9: Наверное, да.

O1 ABOUT Q1: Извините, про кого сейчас говорят?
O1 ABOUT A1: Про {NAME} говорят.

O1 ABOUT Q2: Скажите, о ком сейчас все говорят?
O1 ABOUT A2: Про {NAME} вспоминают.

O1 ABOUT Q3: Подскажите, кого сейчас обсуждают?
O1 ABOUT A3: Про {NAME} спорят.

O1 ABOUT Q4: Извините, чьё имя сейчас на слуху?
O1 ABOUT A4: Про {NAME} слышат чаще.

O1 ABOUT Q5: Скажите, про кого сейчас больше слухов?
O1 ABOUT A5: Про {NAME} разговоров много.

O1 ABOUT Q6: Подскажите, о ком сейчас больше разговоров?
O1 ABOUT A6: Про {NAME} говорят чаще.

O1 ABOUT Q7: Извините, кого сейчас чаще упоминают?
O1 ABOUT A7: Про {NAME} упоминают чаще.

O1 ABOUT Q8: Скажите, про кого сейчас пишут?
O1 ABOUT A8: Про {NAME} пишут часто.

O1 ABOUT Q9: Подскажите, о ком сейчас спорят?
O1 ABOUT A9: Про {NAME} спорят часто.

O1 WHO Q1: Извините, кто это?
O1 WHO A1: {NAME}.

O1 WHO Q2: Скажите, кто был рядом?
O1 WHO A2: {NAME}.

O1 WHO Q3: Подскажите, кто участвовал?
O1 WHO A3: {NAME}.

O1 WHO Q4: Извините, кто был вовлечён?
O1 WHO A4: {NAME}.

O1 WHO Q5: Скажите, кто присутствовал?
O1 WHO A5: {NAME}.

O1 WHO Q6: Подскажите, кто оказался там?
O1 WHO A6: {NAME}.

O1 WHO Q7: Извините, кто был поблизости?
O1 WHO A7: {NAME}.

O1 WHO Q8: Скажите, кто имел отношение?
O1 WHO A8: {NAME}.

O1 WHO Q9: Подскажите, кто знал об этом?
O1 WHO A9: {NAME}.

O1 WHERE Q1: Извините, где мы сейчас?
O1 WHERE A1: Кажется, здесь.

O1 WHERE Q2: Скажите, где это произошло?
O1 WHERE A2: Наверное, тут.

O1 WHERE Q3: Подскажите, где это видели?
O1 WHERE A3: Кажется, в {PLACE}.

O1 WHERE Q4: Извините, где назначена встреча?
O1 WHERE A4: Наверное, в {PLACE}.

O1 WHERE Q5: Скажите, где искать ответы?
O1 WHERE A5: Кажется, в {PLACE}.

O1 WHERE Q6: Подскажите, где это спрятано?
O1 WHERE A6: Наверное, в {PLACE}.

O1 WHERE Q7: Извините, где самое людное место?
O1 WHERE A7: Кажется, в {PLACE}.

O1 WHERE Q8: Скажите, где безопаснее?
O1 WHERE A8: Наверное, в {PLACE}.

O1 WHERE Q9: Подскажите, где всё начинается?
O1 WHERE A9: Кажется, в {PLACE}.

O1 YN Q1: Извините, вы уверены?
O1 YN A1: Наверное, да.

O1 YN Q2: Скажите, это правда?
O1 YN A2: Скорее нет.

O1 YN Q3: Подскажите, он здесь?
O1 YN A3: Похоже, да.

O1 YN Q4: Извините, это было случайно?
O1 YN A4: Наверное, нет.

O1 YN Q5: Скажите, стоит вмешаться?
O1 YN A5: Кажется, да.

O1 YN Q6: Подскажите, лучше промолчать?
O1 YN A6: Похоже, нет.

O1 YN Q7: Извините, есть согласие?
O1 YN A7: Наверное, да.

O1 YN Q8: Скажите, это опасно?
O1 YN A8: Скорее нет.

O1 YN Q9: Подскажите, продолжаем?
O1 YN A9: Похоже, да.

O2 ABOUT Q1: Про кого сейчас говорят?
O2 ABOUT A1: Про {NAME} говорят.

O2 ABOUT Q2: О ком сейчас все говорят?
O2 ABOUT A2: Про {NAME} вспоминают.

O2 ABOUT Q3: Кого сейчас обсуждают?
O2 ABOUT A3: Про {NAME} спорят.

O2 ABOUT Q4: Чьё имя сейчас на слуху?
O2 ABOUT A4: Про {NAME} слышат чаще.

O2 ABOUT Q5: Про кого сейчас больше слухов?
O2 ABOUT A5: Про {NAME} разговоров много.

O2 ABOUT Q6: О ком сейчас больше разговоров?
O2 ABOUT A6: Про {NAME} говорят чаще.

O2 ABOUT Q7: Кого сейчас чаще упоминают?
O2 ABOUT A7: Про {NAME} упоминают чаще.

O2 ABOUT Q8: Про кого сейчас пишут?
O2 ABOUT A8: Про {NAME} пишут часто.

O2 ABOUT Q9: О ком сейчас спорят?
O2 ABOUT A9: Про {NAME} спорят часто.

O2 WHO Q1: Кто это?
O2 WHO A1: {NAME}.

O2 WHO Q2: Кто был рядом?
O2 WHO A2: {NAME}.

O2 WHO Q3: Кто участвовал?
O2 WHO A3: {NAME}.

O2 WHO Q4: Кто был вовлечён?
O2 WHO A4: {NAME}.

O2 WHO Q5: Кто присутствовал?
O2 WHO A5: {NAME}.

O2 WHO Q6: Кто оказался там?
O2 WHO A6: {NAME}.

O2 WHO Q7: Кто был поблизости?
O2 WHO A7: {NAME}.

O2 WHO Q8: Кто имел отношение?
O2 WHO A8: {NAME}.

O2 WHO Q9: Кто знал об этом?
O2 WHO A9: {NAME}.

O2 WHERE Q1: Где мы сейчас?
O2 WHERE A1: Кажется, здесь.

O2 WHERE Q2: Где это произошло?
O2 WHERE A2: Наверное, тут.

O2 WHERE Q3: Где это видели?
O2 WHERE A3: Кажется, в {PLACE}.

O2 WHERE Q4: Где назначена встреча?
O2 WHERE A4: Наверное, в {PLACE}.

O2 WHERE Q5: Где искать ответы?
O2 WHERE A5: Кажется, в {PLACE}.

O2 WHERE Q6: Где это спрятано?
O2 WHERE A6: Наверное, в {PLACE}.

O2 WHERE Q7: Где самое людное место?
O2 WHERE A7: Кажется, в {PLACE}.

O2 WHERE Q8: Где безопаснее?
O2 WHERE A8: Наверное, в {PLACE}.

O2 WHERE Q9: Где всё начинается?
O2 WHERE A9: Кажется, в {PLACE}.

O2 YN Q1: Вы уверены?
O2 YN A1: Наверное, да.

O2 YN Q2: Это правда?
O2 YN A2: Скорее нет.

O2 YN Q3: Он здесь?
O2 YN A3: Похоже, да.

O2 YN Q4: Это было случайно?
O2 YN A4: Наверное, нет.

O2 YN Q5: Стоит вмешаться?
O2 YN A5: Кажется, да.

O2 YN Q6: Лучше промолчать?
O2 YN A6: Похоже, нет.

O2 YN Q7: Есть согласие?
O2 YN A7: Наверное, да.

O2 YN Q8: Это опасно?
O2 YN A8: Скорее нет.

O2 YN Q9: Продолжаем?
O2 YN A9: Похоже, да.

O3 ABOUT Q1: Про кого сейчас вообще говорят?
O3 ABOUT A1: Про {NAME} говорят.

O3 ABOUT Q2: О ком сейчас все говорят-то?
O3 ABOUT A2: Про {NAME} вспоминают.

O3 ABOUT Q3: Кого сейчас обсуждают-то?
O3 ABOUT A3: Про {NAME} спорят.

O3 ABOUT Q4: Чьё имя сейчас на слуху-то?
O3 ABOUT A4: Про {NAME} слышат чаще.

O3 ABOUT Q5: Про кого сейчас больше слухов-то?
O3 ABOUT A5: Про {NAME} разговоров много.

O3 ABOUT Q6: О ком сейчас больше разговоров-то?
O3 ABOUT A6: Про {NAME} говорят чаще.

O3 ABOUT Q7: Кого сейчас чаще упоминают-то?
O3 ABOUT A7: Про {NAME} упоминают чаще.

O3 ABOUT Q8: Про кого сейчас пишут-то?
O3 ABOUT A8: Про {NAME} пишут часто.

O3 ABOUT Q9: О ком сейчас спорят-то?
O3 ABOUT A9: Про {NAME} спорят часто.

O3 WHO Q1: Кто это?
O3 WHO A1: {NAME}.

O3 WHO Q2: Кто был рядом?
O3 WHO A2: {NAME}.

O3 WHO Q3: Кто участвовал?
O3 WHO A3: {NAME}.

O3 WHO Q4: Кто был вовлечён?
O3 WHO A4: {NAME}.

O3 WHO Q5: Кто присутствовал?
O3 WHO A5: {NAME}.

O3 WHO Q6: Кто оказался там?
O3 WHO A6: {NAME}.

O3 WHO Q7: Кто был поблизости?
O3 WHO A7: {NAME}.

O3 WHO Q8: Кто имел отношение?
O3 WHO A8: {NAME}.

O3 WHO Q9: Кто знал об этом?
O3 WHO A9: {NAME}.

O3 WHERE Q1: Где мы сейчас?
O3 WHERE A1: Кажется, здесь.

O3 WHERE Q2: Где это произошло?
O3 WHERE A2: Наверное, тут.

O3 WHERE Q3: Где это видели?
O3 WHERE A3: Кажется, в {PLACE}.

O3 WHERE Q4: Где назначена встреча?
O3 WHERE A4: Наверное, в {PLACE}.

O3 WHERE Q5: Где искать ответы?
O3 WHERE A5: Кажется, в {PLACE}.

O3 WHERE Q6: Где это спрятано?
O3 WHERE A6: Наверное, в {PLACE}.

O3 WHERE Q7: Где самое людное место?
O3 WHERE A7: Кажется, в {PLACE}.

O3 WHERE Q8: Где безопаснее?
O3 WHERE A8: Наверное, в {PLACE}.

O3 WHERE Q9: Где всё начинается?
O3 WHERE A9: Кажется, в {PLACE}.

O3 YN Q1: Ты уверен?
O3 YN A1: Наверное, да.

O3 YN Q2: Это правда?
O3 YN A2: Скорее нет.

O3 YN Q3: Он здесь?
O3 YN A3: Похоже, да.

O3 YN Q4: Это было случайно?
O3 YN A4: Наверное, нет.

O3 YN Q5: Стоит вмешаться?
O3 YN A5: Кажется, да.

O3 YN Q6: Лучше промолчать?
O3 YN A6: Похоже, нет.

O3 YN Q7: Есть согласие?
O3 YN A7: Наверное, да.

O3 YN Q8: Это опасно?
O3 YN A8: Скорее нет.

O3 YN Q9: Продолжаем?
O3 YN A9: Похоже, да.

R1 ABOUT Q1: Вы знаете, про кого сейчас говорят?
R1 ABOUT A1: Про {NAME}, ясно.

R1 ABOUT Q2: Вы понимаете, о ком сейчас все говорят?
R1 ABOUT A2: Про {NAME}, понятно.

R1 ABOUT Q3: Вы в курсе, кого сейчас обсуждают?
R1 ABOUT A3: Про {NAME}, без споров.

R1 ABOUT Q4: Вы знаете, чьё имя сейчас на слуху?
R1 ABOUT A4: Про {NAME}, однозначно.

R1 ABOUT Q5: Вы в курсе, про кого сейчас больше слухов?
R1 ABOUT A5: Про {NAME}, без сомнений.

R1 ABOUT Q6: Вы понимаете, о ком сейчас больше разговоров?
R1 ABOUT A6: Про {NAME}, всё ясно.

R1 ABOUT Q7: Вы знаете, кого сейчас чаще упоминают?
R1 ABOUT A7: Про {NAME}, всё понятно.

R1 ABOUT Q8: Вы в курсе, про кого сейчас пишут?
R1 ABOUT A8: Про {NAME}, сомнений нет.

R1 ABOUT Q9: Вы понимаете, о ком сейчас спорят?
R1 ABOUT A9: Про {NAME}, ясно всем.

R1 WHO Q1: Вы знаете, кто это?
R1 WHO A1: {NAME}.

R1 WHO Q2: Вы понимаете, кто был рядом?
R1 WHO A2: {NAME}.

R1 WHO Q3: Вы в курсе, кто участвовал?
R1 WHO A3: {NAME}.

R1 WHO Q4: Вы знаете, кто был вовлечён?
R1 WHO A4: {NAME}.

R1 WHO Q5: Вы понимаете, кто присутствовал?
R1 WHO A5: {NAME}.

R1 WHO Q6: Вы в курсе, кто оказался там?
R1 WHO A6: {NAME}.

R1 WHO Q7: Вы знаете, кто был поблизости?
R1 WHO A7: {NAME}.

R1 WHO Q8: Вы понимаете, кто имел отношение?
R1 WHO A8: {NAME}.

R1 WHO Q9: Вы в курсе, кто знал об этом?
R1 WHO A9: {NAME}.

R1 WHERE Q1: Вы знаете, где мы сейчас?
R1 WHERE A1: Здесь.

R1 WHERE Q2: Вы понимаете, где это произошло?
R1 WHERE A2: Тут.

R1 WHERE Q3: Вы в курсе, где это видели?
R1 WHERE A3: В {PLACE}.

R1 WHERE Q4: Вы знаете, где назначена встреча?
R1 WHERE A4: В {PLACE}.

R1 WHERE Q5: Вы понимаете, где искать ответы?
R1 WHERE A5: В {PLACE}.

R1 WHERE Q6: Вы в курсе, где это спрятано?
R1 WHERE A6: В {PLACE}.

R1 WHERE Q7: Вы знаете, где самое людное место?
R1 WHERE A7: В {PLACE}.

R1 WHERE Q8: Вы понимаете, где безопаснее?
R1 WHERE A8: В {PLACE}.

R1 WHERE Q9: Вы в курсе, где всё начинается?
R1 WHERE A9: В {PLACE}.

R1 YN Q1: Вы уверены?
R1 YN A1: Да.

R1 YN Q2: Это правда?
R1 YN A2: Нет.

R1 YN Q3: Он здесь?
R1 YN A3: Да.

R1 YN Q4: Это было случайно?
R1 YN A4: Нет.

R1 YN Q5: Стоит вмешаться?
R1 YN A5: Да.

R1 YN Q6: Лучше промолчать?
R1 YN A6: Нет.

R1 YN Q7: Есть согласие?
R1 YN A7: Да.

R1 YN Q8: Это опасно?
R1 YN A8: Нет.

R1 YN Q9: Продолжаем?
R1 YN A9: Да.

R2 ABOUT Q1: Ты знаешь, про кого сейчас говорят?
R2 ABOUT A1: Про {NAME}, ясно.

R2 ABOUT Q2: Ты понимаешь, о ком сейчас все говорят?
R2 ABOUT A2: Про {NAME}, понятно.

R2 ABOUT Q3: Ты в курсе, кого сейчас обсуждают?
R2 ABOUT A3: Про {NAME}, без споров.

R2 ABOUT Q4: Ты знаешь, чьё имя сейчас на слуху?
R2 ABOUT A4: Про {NAME}, однозначно.

R2 ABOUT Q5: Ты в курсе, про кого сейчас больше слухов?
R2 ABOUT A5: Про {NAME}, без сомнений.

R2 ABOUT Q6: Ты понимаешь, о ком сейчас больше разговоров?
R2 ABOUT A6: Про {NAME}, всё ясно.

R2 ABOUT Q7: Ты знаешь, кого сейчас чаще упоминают?
R2 ABOUT A7: Про {NAME}, всё понятно.

R2 ABOUT Q8: Ты в курсе, про кого сейчас пишут?
R2 ABOUT A8: Про {NAME}, сомнений нет.

R2 ABOUT Q9: Ты понимаешь, о ком сейчас спорят?
R2 ABOUT A9: Про {NAME}, ясно всем.

R2 WHO Q1: Ты знаешь, кто это?
R2 WHO A1: {NAME}.

R2 WHO Q2: Ты понимаешь, кто был рядом?
R2 WHO A2: {NAME}.

R2 WHO Q3: Ты в курсе, кто участвовал?
R2 WHO A3: {NAME}.

R2 WHO Q4: Ты знаешь, кто был вовлечён?
R2 WHO A4: {NAME}.

R2 WHO Q5: Ты понимаешь, кто присутствовал?
R2 WHO A5: {NAME}.

R2 WHO Q6: Ты в курсе, кто оказался там?
R2 WHO A6: {NAME}.

R2 WHO Q7: Ты знаешь, кто был поблизости?
R2 WHO A7: {NAME}.

R2 WHO Q8: Ты понимаешь, кто имел отношение?
R2 WHO A8: {NAME}.

R2 WHO Q9: Ты в курсе, кто знал об этом?
R2 WHO A9: {NAME}.

R2 WHERE Q1: Ты знаешь, где мы сейчас?
R2 WHERE A1: Здесь.

R2 WHERE Q2: Ты понимаешь, где это произошло?
R2 WHERE A2: Тут.

R2 WHERE Q3: Ты в курсе, где это видели?
R2 WHERE A3: В {PLACE}.

R2 WHERE Q4: Ты знаешь, где назначена встреча?
R2 WHERE A4: В {PLACE}.

R2 WHERE Q5: Ты понимаешь, где искать ответы?
R2 WHERE A5: В {PLACE}.

R2 WHERE Q6: Ты в курсе, где это спрятано?
R2 WHERE A6: В {PLACE}.

R2 WHERE Q7: Ты знаешь, где самое людное место?
R2 WHERE A7: В {PLACE}.

R2 WHERE Q8: Ты понимаешь, где безопаснее?
R2 WHERE A8: В {PLACE}.

R2 WHERE Q9: Ты в курсе, где всё начинается?
R2 WHERE A9: В {PLACE}.

R2 YN Q1: Ты уверен?
R2 YN A1: Да.

R2 YN Q2: Это правда?
R2 YN A2: Нет.

R2 YN Q3: Он здесь?
R2 YN A3: Да.

R2 YN Q4: Это было случайно?
R2 YN A4: Нет.

R2 YN Q5: Стоит вмешаться?
R2 YN A5: Да.

R2 YN Q6: Лучше промолчать?
R2 YN A6: Нет.

R2 YN Q7: Есть согласие?
R2 YN A7: Да.

R2 YN Q8: Это опасно?
R2 YN A8: Нет.

R2 YN Q9: Продолжаем?
R2 YN A9: Да.

R3 ABOUT Q1: Скажи, про кого сейчас говорят?
R3 ABOUT A1: Про {NAME}, ясно.

R3 ABOUT Q2: Отвечай, о ком сейчас все говорят?
R3 ABOUT A2: Про {NAME}, понятно.

R3 ABOUT Q3: Быстро, кого сейчас обсуждают?
R3 ABOUT A3: Про {NAME}, без споров.

R3 ABOUT Q4: Скажи, чьё имя сейчас на слуху?
R3 ABOUT A4: Про {NAME}, однозначно.

R3 ABOUT Q5: Говори, про кого сейчас больше слухов?
R3 ABOUT A5: Про {NAME}, без сомнений.

R3 ABOUT Q6: Отвечай, о ком сейчас больше разговоров?
R3 ABOUT A6: Про {NAME}, всё ясно.

R3 ABOUT Q7: Быстро, кого сейчас чаще упоминают?
R3 ABOUT A7: Про {NAME}, всё понятно.

R3 ABOUT Q8: Скажи, про кого сейчас пишут?
R3 ABOUT A8: Про {NAME}, сомнений нет.

R3 ABOUT Q9: Говори, о ком сейчас спорят?
R3 ABOUT A9: Про {NAME}, ясно всем.

R3 WHO Q1: Скажи, кто это?
R3 WHO A1: {NAME}.

R3 WHO Q2: Отвечай, кто был рядом?
R3 WHO A2: {NAME}.

R3 WHO Q3: Быстро, кто участвовал?
R3 WHO A3: {NAME}.

R3 WHO Q4: Скажи, кто был вовлечён?
R3 WHO A4: {NAME}.

R3 WHO Q5: Отвечай, кто присутствовал?
R3 WHO A5: {NAME}.

R3 WHO Q6: Быстро, кто оказался там?
R3 WHO A6: {NAME}.

R3 WHO Q7: Скажи, кто был поблизости?
R3 WHO A7: {NAME}.

R3 WHO Q8: Отвечай, кто имел отношение?
R3 WHO A8: {NAME}.

R3 WHO Q9: Быстро, кто знал об этом?
R3 WHO A9: {NAME}.

R3 WHERE Q1: Скажи, где мы сейчас?
R3 WHERE A1: Здесь.

R3 WHERE Q2: Отвечай, где это произошло?
R3 WHERE A2: Тут.

R3 WHERE Q3: Быстро, где это видели?
R3 WHERE A3: В {PLACE}.

R3 WHERE Q4: Скажи, где назначена встреча?
R3 WHERE A4: В {PLACE}.

R3 WHERE Q5: Отвечай, где искать ответы?
R3 WHERE A5: В {PLACE}.

R3 WHERE Q6: Быстро, где это спрятано?
R3 WHERE A6: В {PLACE}.

R3 WHERE Q7: Скажи, где самое людное место?
R3 WHERE A7: В {PLACE}.

R3 WHERE Q8: Отвечай, где безопаснее?
R3 WHERE A8: В {PLACE}.

R3 WHERE Q9: Быстро, где всё начинается?
R3 WHERE A9: В {PLACE}.

R3 YN Q1: Скажи, уверен?
R3 YN A1: Да.

R3 YN Q2: Отвечай, это правда?
R3 YN A2: Нет.

R3 YN Q3: Быстро, он здесь?
R3 YN A3: Да.

R3 YN Q4: Скажи, это было случайно?
R3 YN A4: Нет.

R3 YN Q5: Отвечай, стоит вмешаться?
R3 YN A5: Да.

R3 YN Q6: Быстро, лучше промолчать?
R3 YN A6: Нет.

R3 YN Q7: Скажи, есть согласие?
R3 YN A7: Да.

R3 YN Q8: Отвечай, это опасно?
R3 YN A8: Нет.

R3 YN Q9: Быстро, продолжаем?
R3 YN A9: Да.

R4 ABOUT Q1: Слышь, про кого сейчас говорят?
R4 ABOUT A1: Про {NAME}, ясно.

R4 ABOUT Q2: Говори, о ком сейчас все говорят?
R4 ABOUT A2: Про {NAME}, понятно.

R4 ABOUT Q3: Быстро скажи, кого сейчас обсуждают?
R4 ABOUT A3: Про {NAME}, без споров.

R4 ABOUT Q4: Слышь, чьё имя сейчас на слуху?
R4 ABOUT A4: Про {NAME}, однозначно.

R4 ABOUT Q5: Говори, про кого сейчас больше слухов?
R4 ABOUT A5: Про {NAME}, без сомнений.

R4 ABOUT Q6: Скажи прямо, о ком сейчас больше разговоров?
R4 ABOUT A6: Про {NAME}, всё ясно.

R4 ABOUT Q7: Быстро, кого сейчас чаще упоминают?
R4 ABOUT A7: Про {NAME}, всё понятно.

R4 ABOUT Q8: Слышь, про кого сейчас пишут?
R4 ABOUT A8: Про {NAME}, сомнений нет.

R4 ABOUT Q9: Говори, о ком сейчас спорят?
R4 ABOUT A9: Про {NAME}, ясно всем.

R4 WHO Q1: Слышь, кто это?
R4 WHO A1: {NAME}.

R4 WHO Q2: Говори, кто был рядом?
R4 WHO A2: {NAME}.

R4 WHO Q3: Быстро скажи, кто участвовал?
R4 WHO A3: {NAME}.

R4 WHO Q4: Слышь, кто был вовлечён?
R4 WHO A4: {NAME}.

R4 WHO Q5: Говори, кто присутствовал?
R4 WHO A5: {NAME}.

R4 WHO Q6: Быстро скажи, кто оказался там?
R4 WHO A6: {NAME}.

R4 WHO Q7: Слышь, кто был поблизости?
R4 WHO A7: {NAME}.

R4 WHO Q8: Говори, кто имел отношение?
R4 WHO A8: {NAME}.

R4 WHO Q9: Быстро скажи, кто знал об этом?
R4 WHO A9: {NAME}.

R4 WHERE Q1: Слышь, где мы сейчас?
R4 WHERE A1: Здесь.

R4 WHERE Q2: Говори, где это произошло?
R4 WHERE A2: Тут.

R4 WHERE Q3: Быстро скажи, где это видели?
R4 WHERE A3: В {PLACE}.

R4 WHERE Q4: Слышь, где назначена встреча?
R4 WHERE A4: В {PLACE}.

R4 WHERE Q5: Говори, где искать ответы?
R4 WHERE A5: В {PLACE}.

R4 WHERE Q6: Быстро скажи, где это спрятано?
R4 WHERE A6: В {PLACE}.

R4 WHERE Q7: Слышь, где самое людное место?
R4 WHERE A7: В {PLACE}.

R4 WHERE Q8: Говори, где безопаснее?
R4 WHERE A8: В {PLACE}.

R4 WHERE Q9: Быстро скажи, где всё начинается?
R4 WHERE A9: В {PLACE}.

R4 YN Q1: Слышь, уверен?
R4 YN A1: Да.

R4 YN Q2: Говори, это правда?
R4 YN A2: Нет.

R4 YN Q3: Быстро скажи, он здесь?
R4 YN A3: Да.

R4 YN Q4: Слышь, это было случайно?
R4 YN A4: Нет.

R4 YN Q5: Говори, стоит вмешаться?
R4 YN A5: Да.

R4 YN Q6: Быстро скажи, лучше промолчать?
R4 YN A6: Нет.

R4 YN Q7: Слышь, есть согласие?
R4 YN A7: Да.

R4 YN Q8: Говори, это опасно?
R4 YN A8: Нет.

R4 YN Q9: Быстро скажи, продолжаем?
R4 YN A9: Да.

K ABOUT Q1: Назови, про кого сейчас говорят.
K ABOUT A1: Про {NAME}. Ясно.

K ABOUT Q2: Скажи, о ком сейчас все говорят.
K ABOUT A2: Про {NAME}. Точка.

K ABOUT Q3: Укажи, кого сейчас обсуждают.
K ABOUT A3: Про {NAME}. Конец.

K ABOUT Q4: Сообщи, чьё имя сейчас на слуху.
K ABOUT A4: Про {NAME}. Без споров.

K ABOUT Q5: Назови, про кого сейчас больше слухов.
K ABOUT A5: Про {NAME}. Без вариантов.

K ABOUT Q6: Скажи, о ком сейчас больше разговоров.
K ABOUT A6: Про {NAME}. Понятно.

K ABOUT Q7: Укажи, кого сейчас чаще упоминают.
K ABOUT A7: Про {NAME}. Ясно.

K ABOUT Q8: Сообщи, про кого сейчас пишут.
K ABOUT A8: Про {NAME}. Точка.

K ABOUT Q9: Назови, о ком сейчас спорят.
K ABOUT A9: Про {NAME}. Конец.

K WHO Q1: Назови, кто это.
K WHO A1: {NAME}.

K WHO Q2: Скажи, кто был рядом.
K WHO A2: {NAME}.

K WHO Q3: Укажи, кто участвовал.
K WHO A3: {NAME}.

K WHO Q4: Сообщи, кто был вовлечён.
K WHO A4: {NAME}.

K WHO Q5: Назови, кто присутствовал.
K WHO A5: {NAME}.

K WHO Q6: Скажи, кто оказался там.
K WHO A6: {NAME}.

K WHO Q7: Укажи, кто был поблизости.
K WHO A7: {NAME}.

K WHO Q8: Сообщи, кто имел отношение.
K WHO A8: {NAME}.

K WHO Q9: Назови, кто знал об этом.
K WHO A9: {NAME}.

K WHERE Q1: Назови, где мы сейчас.
K WHERE A1: Здесь.

K WHERE Q2: Скажи, где это произошло.
K WHERE A2: Тут.

K WHERE Q3: Укажи, где это видели.
K WHERE A3: В {PLACE}.

K WHERE Q4: Сообщи, где назначена встреча.
K WHERE A4: В {PLACE}.

K WHERE Q5: Назови, где искать ответы.
K WHERE A5: В {PLACE}.

K WHERE Q6: Скажи, где это спрятано.
K WHERE A6: В {PLACE}.

K WHERE Q7: Укажи, где самое людное место.
K WHERE A7: В {PLACE}.

K WHERE Q8: Сообщи, где безопаснее.
K WHERE A8: В {PLACE}.

K WHERE Q9: Назови, где всё начинается.
K WHERE A9: В {PLACE}.

K YN Q1: Подтверди согласие.
K YN A1: Да.
K YN Q2: Дай подтверждение.
K YN A2: Да.
K YN Q3: Скажи что готов.
K YN A3: Да.
K YN Q4: Разреши продолжать.
K YN A4: Да.
K YN Q5: Сообщи что верно.
K YN A5: Да.
K YN Q6: Запрети это.
K YN A6: Нет.
K YN Q7: Отклони это.
K YN A7: Нет.
K YN Q8: Останови это.
K YN A8: Нет.
K YN Q9: Отмени это.
K YN A9: Нет.
`

  Data.buildArgCanon = () => {
    const index = Object.create(null);
    const re = /^(Y1|Y2|O1|O2|O3|R1|R2|R3|R4|K)\s+(ABOUT|WHO|WHERE|YN)\s+([QA])(\d+):\s*(.*)$/;
    const lines = String(Data.ARG_CANON_TEXT || "").split(/\r?\n/);
    for (const line of lines) {
      const s = String(line || "").trim();
      if (!s) continue;
      const m = s.match(re);
      if (!m) continue;
      const sub = m[1];
      const type = m[2];
      const qa = m[3];
      const idx = Math.max(0, (parseInt(m[4], 10) || 1) - 1);
      const text = m[5];
      const key = sub + "|" + type;
      if (!index[key]) index[key] = { sub, type, items: [] };
      if (!index[key].items[idx]) index[key].items[idx] = { q: "", a: "" };
      if (qa === "Q") index[key].items[idx].q = text;
      else index[key].items[idx].a = text;
    }
    Data.ARG_CANON_INDEX = index;
  };

  Data.getArgCanonGroup = (sub, type) => {
    const s = String(sub || "").toUpperCase();
    const t = String(type || "").toUpperCase();
    const key = s + "|" + t;
    const rec = Data.ARG_CANON_INDEX ? Data.ARG_CANON_INDEX[key] : null;
    if (!rec || !Array.isArray(rec.items)) return [];
    return rec.items.filter(it => it && it.q && it.a);
  };

  Data.getArgCanonByColorSubType = (color, sub, type) => {
    const s = String(sub || "").toUpperCase();
    if (!s) return [];
    return Data.getArgCanonGroup(s, type);
  };

  Data.buildArgCanon();

  // Argument pools (fallback, neutral base)
  Data.ARG_POOLS = Data.ARG_BASE_O;

  Data.getArgBaseByColor = (color) => {
    const c = String(color || "").toLowerCase();
    if (c === "k") return Data.ARG_BASE_K;
    if (c === "r") return Data.ARG_BASE_R;
    if (c === "o") return Data.ARG_BASE_O;
    return Data.ARG_BASE_Y;
  };

  // Build argument templates for NPC fallback usage
  Data.ARGUMENTS = { attack: [], defense: [] };

  Data.rebuildArguments = () => {
    const attack = [];
    const defense = [];
    let colors = Array.isArray(Data.ARGUMENT_COLORS) && Data.ARGUMENT_COLORS.length
      ? Array.from(new Set(Data.ARGUMENT_COLORS.map(c => String(c || "").toLowerCase())))
        .filter(c => c === "y" || c === "o" || c === "r" || c === "k")
      : ["y","o","r","k"];
    if (!colors.length) colors = ["y","o","r","k"];
    const poolKeys = ["about","who","where","yn"];
    colors.forEach((color) => {
      const pools = Data.getArgBaseByColor ? Data.getArgBaseByColor(color) : (Data.ARG_POOLS || {});
      poolKeys.forEach((poolKey) => {
        const group = poolKey;
        const pairs = (pools && pools[poolKey]) ? pools[poolKey] : [];
        const usedNames = new Set();
        const usedPlaces = new Set();
        pairs.forEach((pair, idx) => {
          const baseId = `arg_${poolKey}_${idx}`;
          const qText = Data.fillPlaceholders
            ? Data.fillPlaceholders(pair && pair.q ? pair.q : "", { usedNames, usedPlaces })
            : (pair && pair.q ? pair.q : "");
          const aText = Data.fillPlaceholders
            ? Data.fillPlaceholders(pair && pair.a ? pair.a : "", { usedNames, usedPlaces })
            : (pair && pair.a ? pair.a : "");
          attack.push({
            id: `${baseId}_q_${color}`,
            color,
            group,
            type: group,
            pool: poolKey,
            text: qText
          });
          defense.push({
            id: `${baseId}_a_${color}`,
            color,
            group,
            type: group,
            pool: poolKey,
            text: aText
          });
        });
      });
    });
    Data.ARGUMENTS = { attack, defense };
  };

  Data.initArgumentsOnce = () => {
    if (Data._argumentsInitialized) return;
    if (!Data.ARG_POOLS || !Object.keys(Data.ARG_POOLS).length) return;
    Data.rebuildArguments();
    const ok = Data.ARGUMENTS
      && Array.isArray(Data.ARGUMENTS.attack) && Data.ARGUMENTS.attack.length > 0
      && Array.isArray(Data.ARGUMENTS.defense) && Data.ARGUMENTS.defense.length > 0;
    if (ok) {
      Data._argumentsInitialized = true;
      return;
    }
    Data._argumentsInitTries = (Data._argumentsInitTries || 0) + 1;
    if (Data._argumentsInitTries <= 10) {
      setTimeout(() => Data.initArgumentsOnce(), 50);
    }
  };

  // Safe fallback name pools
  Data.NAMES_SAFE = [
    "Гарри Поттер","Шерлок Холмс","Эркюль Пуаро","Фродо","Гэндальф",
    "Лара Крофт","Индиана Джонс","Дарт Вейдер","Чубакка","Принцесса Лея",
    "Бэтмен","Супермен","Человек-паук","Тони Старк","Капитан Америка",
    "Чудо-женщина","Марио","Луиджи","Линк","Зельда",
    "Пикачу","Наруто","Сейлор Мун","Тоторо","Астерикс",
    "Обеликс","Микки Маус","Дональд Дак","Винни-Пух","Питер Пэн"
  ];

  Data.NAMES_BY_ROLE = {
    cop: ["Комиссар Гордон","Инспектор Лестрейд","Эркюль Пуаро","Лейтенант Коломбо","Агент Купер"],
    toxic: ["КринжЛорд","МемБот","Трололо","ПастаМастер","Шутник_3000"],
    mafia: ["Дон Корлеоне","Профессор Мориарти","Тайвин Ланнистер","Томас Шелби","Фрэнк Андервуд"],
    bandit: ["Шнырь","Сивый","Крюк","Нож","Шкет"]
  };

  // Safe fallback places
  Data.PLACES_SAFE = [
    "Токио","Киото","Осака","Лондон","Париж","Рим","Барселона","Берлин",
    "Нью-Йорк","Сан-Франциско","Сеул","Сингапур","Сидней","Торонто","Амстердам",
    "Прага","Вена","Стокгольм","Хельсинки","Афины",
    "Эйфелева башня","Колизей","Биг-Бен","Статуя Свободы","Тадж-Махал",
    "Пизанская башня","Центральная площадь","Старый район","Неоновый квартал","Чат-лобби"
  ];

  // In-game locations (fallback if Game.Data.locations is absent)
  Data.LOCATIONS = [
    { id:"square", name:"Площадь" },
    { id:"bar", name:"Ночной бар" },
    { id:"arcade", name:"Аркада" }
  ];

  // --- Placeholder helpers ---
  Data.getPlayerNames = () => {
    const names = [];
    try {
      const ps = (Game && Game.State && Game.State.players) ? Game.State.players : {};
      Object.values(ps).forEach(p => {
        if (!p || !p.name) return;
        const n = String(p.name).trim();
        if (!n) return;
        if (!names.includes(n)) names.push(n);
      });
    } catch (_) {}
    return names;
  };

  Data.getGamePlaces = () => {
    const out = [];
    const locs = (Game && Game.Data && Array.isArray(Game.Data.locations)) ? Game.Data.locations : null;
    const list = locs || Data.LOCATIONS || [];
    list.forEach(l => {
      const name = (typeof l === "string") ? l : (l && l.name);
      if (name && !out.includes(name)) out.push(name);
    });
    return out;
  };

  Data.pickName = (ctx = {}) => {
    const used = ctx.used || new Set();
    const role = (ctx.role != null) ? String(ctx.role).toLowerCase() : null;
    if (role && Data.NAMES_BY_ROLE[role]) {
      const pool = Data.NAMES_BY_ROLE[role].slice();
      const pick = pool.find(n => !used.has(n)) || pool[0];
      if (pick) used.add(pick);
      return pick || "";
    }
    const players = Data.getPlayerNames();
    const fallback = Data.NAMES_SAFE || [];
    const usePlayers = (players.length > 0) && (Math.random() < 0.5);
    const pool = usePlayers ? players : fallback;
    const pick = pool.find(n => !used.has(n)) || pool[0] || (fallback[0] || "");
    if (pick) used.add(pick);
    return pick;
  };

  Data.pickPlace = (ctx = {}) => {
    const used = ctx.used || new Set();
    const gamePlaces = Data.getGamePlaces();
    const fallback = Data.PLACES_SAFE || [];
    const useGame = (gamePlaces.length > 0) && (Math.random() < 0.6);
    const pool = useGame ? gamePlaces : fallback;
    const pick = pool.find(n => !used.has(n)) || pool[0] || (fallback[0] || "");
    if (pick) used.add(pick);
    return pick;
  };

  Data.fillTemplate = (tpl, ctx = {}) => {
    if (!tpl) return "";
    let out = String(tpl);
    if (out.includes("{NAME}")) {
      const name = Data.pickName({ used: ctx.usedNames, role: ctx.role });
      out = out.replace(/\{NAME\}/g, name);
    }
    if (out.includes("{PLACE}")) {
      const place = Data.pickPlace({ used: ctx.usedPlaces });
      out = out.replace(/\{PLACE\}/g, place);
    }
    return out;
  };

  Data.fillPlaceholders = (text, ctx = {}) => Data.fillTemplate(text, ctx);

  Data.tierKeysByInfluence = (inf) => {
    const v = Number(inf || 0);
    const U = (Data.PROGRESSION && Data.PROGRESSION.unlockInfluence) ? Data.PROGRESSION.unlockInfluence : { strong:5, power:10, absolute:100 };
    const out = ["y1","y2"];
    if (v >= U.strong) out.push("o1","o2","o3");
    if (v >= U.power) out.push("r1","r2","r3","r4");
    if (v >= U.absolute) out.push("k1");
    return out;
  };

  Data.colorFromTierKey = (tierKey) => {
    if (!tierKey) return "y";
    if (tierKey.startsWith("k")) return "k";
    if (tierKey.startsWith("r")) return "r";
    if (tierKey.startsWith("o")) return "o";
    return "y";
  };

  Data.applyTierStyle = (text, tierKey, opts = {}) => {
    const t = String(text || "");
    const kind = opts.kind || "question";
    if (kind === "answer") return t;
    const withTail = (tail) => t.replace(/\?\s*$/u, `${tail}?`);
    switch (tierKey) {
      case "y1": return `Эм... ${withTail(", если вы вдруг в курсе")}`;
      case "y2": return `Эм... ${withTail(", если ты вдруг в курсе")}`;
      case "o1": return `Подскажите, пожалуйста: ${t}`;
      case "o2": return withTail(", подскажете");
      case "o3": return withTail(", подскажешь");
      case "r1": return withTail(", отвечайте");
      case "r2": return withTail(", отвечай");
      case "r3": return withTail(", ты же знаешь");
      case "r4": return withTail(", ты ответишь или нет");
      case "k1": return withTail(", отвечай четко");
      default: return t;
    }
  };

  // tone patch applied
  Data.ARGUMENT_TONE = {
    y: {
      prefixes: ["Кажется,","Я не уверен, но","Если честно, не знаю, но","Наверное,"],
      suffixes: ["может быть?","как думаешь?","вроде?","наверное?"]
    },
    o: {
      prefixes: ["Подскажите, пожалуйста:","Скажите, пожалуйста:","Не подскажете:","Если можно:"],
      suffixes: ["подскажете?","скажете?","если можно?"]
    },
    r: {
      prefixes: ["Скажи:","Ответь:","Дай ответ:"],
      suffixes: ["отвечай.","сразу.","без воды."]
    },
    k: {
      prefixes: ["Четко:","Коротко:","Без лишнего:"],
      suffixes: ["отвечай.","без спору.","по факту."]
    }
  };

  Data.applyTone = (text, opts = {}) => {
    const raw = String(text || "").trim();
    if (!raw) return "";
    const kind = String(opts.kind || "");
    if (kind === "defense" || kind === "answer") return raw;
    const norm = (Data.normalizeColor && typeof Data.normalizeColor === "function")
      ? Data.normalizeColor(opts.color || "")
      : String(opts.color || "").toLowerCase();
    const tone = Data.ARGUMENT_TONE[norm];
    if (!tone) return raw;
    const pick = (arr) => (Array.isArray(arr) && arr.length)
      ? arr[Math.floor(Math.random() * arr.length)]
      : "";
    const prefix = pick(tone.prefixes);
    const suffix = pick(tone.suffixes);
    let out = raw;
    if (prefix) out = `${prefix} ${out}`.replace(/\s+/g, " ").trim();
    if (suffix) {
      out = out.replace(/[.。!?]+$/u, "").trim();
      const needsComma = !/[,:;]$/.test(out);
      out = `${out}${needsComma ? "," : ""} ${suffix}`.trim();
    }
    return out;
  };

  Data.buildArg = (poolKey, pair, tierKey, kind, used) => {
    const isAnswer = (kind === "defense");
    const raw = isAnswer ? pair.a : pair.q;
    const filled = Data.fillTemplate(raw, used);
    const group = (poolKey === "about") ? "about"
      : (poolKey === "who") ? "who"
      : (poolKey === "where") ? "where"
      : "yn";
    const color = Data.colorFromTierKey(tierKey);
    const text = filled;
    return {
      id: `arg_${poolKey}_${tierKey}_${Math.floor(Math.random()*999999)}`,
      color,
      group,
      type: group,
      pool: poolKey,
      text
    };
  };

  Data.pickUniqueOptions = (poolKey, tierKeys, kind, role, shared) => {
    const usedTexts = (shared && shared.usedTexts) ? shared.usedTexts : new Set();
    const usedNames = (shared && shared.usedNames) ? shared.usedNames : new Set();
    const usedPlaces = (shared && shared.usedPlaces) ? shared.usedPlaces : new Set();
    const out = [];
    let guard = 0;
    while (out.length < 3 && guard < 60) {
      guard++;
      const tierKey = tierKeys[Math.floor(Math.random() * tierKeys.length)];
      const color = Data.colorFromTierKey(tierKey);
      const pools = Data.getArgBaseByColor ? Data.getArgBaseByColor(color) : (Data.ARG_POOLS || {});
      const pool = (pools && pools[poolKey]) ? pools[poolKey] : [];
      if (!pool.length) continue;
      const pair = pool[Math.floor(Math.random() * pool.length)];
      const arg = Data.buildArg(poolKey, pair, tierKey, kind, { usedNames, usedPlaces, role });
      if (!arg || !arg.text) continue;
      if (usedTexts.has(arg.text)) continue;
      usedTexts.add(arg.text);
      out.push(arg);
    }
    return out;
  };

  Data.selectAttackOptions = (battle) => {
    const me = (Game && Game.State && Game.State.me) ? Game.State.me : { influence: 0 };
    const boost = (battle && Number.isFinite(battle.tempInfluenceBoost)) ? (battle.tempInfluenceBoost | 0) : 0;
    const inf = (Number(me.influence) || 0) + boost;
    const tierKeys = Data.tierKeysByInfluence(inf);
    const pools = ["about","who","where","yn"];
    const shared = { usedTexts: new Set(), usedNames: new Set(), usedPlaces: new Set() };
    const out = [];
    let guard = 0;
    while (out.length < 3 && guard < 80) {
      guard++;
      const poolKey = pools[Math.floor(Math.random() * pools.length)];
      const opts = Data.pickUniqueOptions(poolKey, tierKeys, "attack", null, shared);
      for (const o of opts) {
        if (out.length >= 3) break;
        out.push(o);
      }
    }
    return out.slice(0, 3);
  };

  Data.selectDefenseOptions = (attackArg) => {
    const me = (Game && Game.State && Game.State.me) ? Game.State.me : { influence: 0 };
    const inf = Number(me.influence) || 0;
    const tierKeys = Data.tierKeysByInfluence(inf);
    const poolKey = (attackArg && attackArg.pool)
      ? attackArg.pool
      : ((attackArg && attackArg.group) === "about" ? "about"
        : (attackArg && attackArg.group) === "who" ? "who"
        : (attackArg && attackArg.group) === "where" ? "where"
        : "yn");
    return Data.pickUniqueOptions(poolKey, tierKeys, "defense", null);
  };

  Data.installArgumentAdapter = () => {
    if (Data._argAdapterInstalled) return;
    if (!Game || !Game.ConflictArguments) return;
    Data._argAdapterInstalled = true;
    Game.ConflictArguments.myAttackOptions = (battle) => Data.selectAttackOptions(battle);
    Game.ConflictArguments.myDefenseOptions = (attackArg) => Data.selectDefenseOptions(attackArg);
  };

  // Install adapter after conflict-arguments loads
  setTimeout(function tickArgs(){
    if (Data._argAdapterInstalled) return;
    Data.installArgumentAdapter();
    if (!Data._argAdapterInstalled) setTimeout(tickArgs, 50);
  }, 0);

  // Patch NPC argument picks to use role-based names (no logic change)
  Data.installNpcArgAdapter = () => {
    if (Data._npcArgAdapterInstalled) return;
    if (!Game || !Game.NPC) return;
    const NPC = Game.NPC;
    if (typeof NPC.pickAttack !== "function" || typeof NPC.pickDefense !== "function") return;
    Data._npcArgAdapterInstalled = true;
    const pickPoolKey = () => {
      const keys = ["about","who","where","yn"];
      return keys[Math.floor(Math.random() * keys.length)];
    };
    NPC.pickAttack = (inf, npc) => {
      const tierKeys = Data.tierKeysByInfluence(inf);
      const poolKey = pickPoolKey();
      return Data.pickUniqueOptions(poolKey, tierKeys, "attack", npc && npc.role)[0] || null;
    };
    NPC.pickDefense = (inf, npc) => {
      const tierKeys = Data.tierKeysByInfluence(inf);
      const poolKey = pickPoolKey();
      return Data.pickUniqueOptions(poolKey, tierKeys, "defense", npc && npc.role)[0] || null;
    };
  };

  setTimeout(function tickNpcArgs(){
    if (Data._npcArgAdapterInstalled) return;
    Data.installNpcArgAdapter();
    if (!Data._npcArgAdapterInstalled) setTimeout(tickNpcArgs, 80);
  }, 0);

  Data.NPC_CHAT_LINES = [
    "ну че кто первый вбросит",
    "я тут чисто посмотреть",
    "кто-то сегодня токсик, не я",
    "скибиди вайб на площади",
    "кринж зашел в чат и сел",
    "давайте без истерик",
    "мне скучно, дайте движ",
    "кто орет тот и неправ",
    "сегодня пахнет баттлами",
    "кто-то сейчас словит ответку",
    "💰 не пахнут",
    "вы вообще читаете что пишете",
    "баттл это просто разговор с адреналином",
    "давайте культурно, ну почти",
    "кто следующий",
    "ну давай, удиви",
    "площадь как тикток, листаешь и не можешь остановиться",
    "мне смешно, но грустно",
    "ой все",
    "ну и ладно",
    "не дави",
    "я тебя понял",
    "включите мозг",
    "💰 на стол",
    "я тут ради лулзов",
    "ладно, разгоняем",
    "я молчу, но осуждаю",
    "вот это было грязно",
    "вот это было красиво"
  ];

  Data.SYS = {
    joined: (name) => `${name} залетел(а) на площадь. Ща будет.`,

    // Баттлы - экономика
    pointsLow: "Не прокает: мало 💰 на баттл.",
    needEscapePointsInline: "Не прокает, чтобы свалить.",

    // Анлоки аргументов (для себя и для остальных)
    unlockOrange: "Твои аргументы теперь сильные.",
    unlockRed: "Твои аргументы теперь мощные.",
    unlockBlack: "Твои аргументы теперь абсолютные.",
    unlockOrangeOther: (name) => `Аргументы ${name} теперь сильные.`,
    unlockRedOther: (name) => `Аргументы ${name} теперь мощные.`,
    // После анлока красных UI может показывать это вместо счётчика "до k"
    absolutePath: "Абсолют уже рядом.",
    unlockBlackOther: (name) => `Аргументы ${name} теперь абсолютные.`,

    // Лотерея
    lotteryZero: "Лотерея: 0. Фейл.",
    lotteryWin: (n) => `Лотерея: +${n}. Залетело.`,

    // Донос копу
    reportOk: (name) => `Засчитано. ${name} отмечен(а). +2 💰.`,
    reportNo: "Фейл. Штраф: -5 💰.",

    // Обучение аргументу
    teachGiven: (toName, argument, cost) => `Ты научил(а) ${toName} за ${cost}: "${argument}". Одноразовый.`,
    youTaughtDm: (toName, argument, cost) => `Ты научил(а) ${toName} за ${cost}.`,

    // Ничьи
    tie: [
      "Толпа решает.",
      "Толпа решает. Ща голосование.",
      "Толпа решает.",
    ],
    tieAlertLine: (aName, aInf, bName, bInf) => `Толпа решает: ${aName} [${aInf}] против ${bName} [${bInf}]. Жми сюда — баттл наверх.`,

    // NPC-NPC события (геншин-стиль)
    npcBattleStart: (a, b) => `Площадь ловит движ: ${a} вызывает ${b}.`,
    npcBattleEndWin: (winner, loser) => `Затащил ${winner}. ${loser} проигрывает.`,
    npcBattleEndDraw: (a, b) => `Поровну, без перевеса. ${a} и ${b} разошлись.`,

    // Вызовы
    challengedLine: (attackerName, attackerInf) => `${attackerName} [${attackerInf}] вызвал(а) тебя на баттл. Жми сюда — баттл наверх.`,

    // Особые персонажи
    banditRobbed: "Бандит вынес тебя в ноль. Все видели.",
    toxicRobbed: "Токсик вынес тебя в ноль. Все видели.",
    toxicStealLine: (cost) => `Токсик снял у тебя ${cost} 💰. Все видели.`,
  };

  Data.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Expose mention colors for CSS variables (single source of truth)
  // UI may read these once and map them to --mention-* CSS vars.
  Data.getMentionCSSVars = () => ({
    "--mention-color": Data.MENTIONS.color,
    "--mention-bg": Data.MENTIONS.bg,
    "--mention-border": Data.MENTIONS.border,
    "--mention-me-bg": Data.MENTIONS.meBg,
    "--mention-me-border": Data.MENTIONS.meBorder,
    "--mention-bubble-bg": Data.MENTIONS.bubbleBg,
    "--mention-bubble-border": Data.MENTIONS.bubbleBorder
  });

  Data.initArgumentsOnce();

  Game.Data = Data;
})();
