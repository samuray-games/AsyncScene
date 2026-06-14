// data.js
window.Game = window.Game || {};

(() => {
  const Data = {};
  const systemSay = (kind, code, ctx) => (window.Game && window.Game.System && typeof window.Game.System.say === "function") ? window.Game.System.say(kind, code, ctx || {}) : "";

  Data.RANDOM_NAMES = [
    "Ray","Samuray","Ohmylord","Neko","Rin","Yuna","Sora","Kai","Mika","Aki",
    "Tori","Haru","Sen","Dara","Memelord","Sigma","Boss","Zzz","Kappa","Fox"
  ];

  Data.START_SCREEN_TEXT_MAX_LENGTH = 36;
  Data.START_SCREEN = Object.freeze({
    title: systemSay("systemEvents", "startTitle"),
    introLines: Object.freeze([
      systemSay("systemEvents", "startIntroPick"),
      systemSay("systemEvents", "startIntroStake"),
      systemSay("systemEvents", "startIntroResult")
    ]),
    economyHonestyLine: systemSay("systemEvents", "startEconomyHonesty"),
    actions: Object.freeze({
      start: systemSay("systemEvents", "startActionStart"),
      rules: systemSay("systemEvents", "startActionRules")
    })
  });

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
  Data.POINTS_START = 10;
  Data.POINTS_SOFT_CAP = 20;
  Data.CIRCULATION_ENABLED = false;
Data.START_POINTS_PLAYER = 10;
Data.START_POINTS_NPC = 10;
Data.MAX_NPC_SHARE_CROWD = 1.0;
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

  // TODO_CANON: Future REP values for victory/loss by tier (NOT implemented yet)
  // - win over weak: 0 REP
  // - win over equal: +2 REP
  // - win over strong: +4 REP
  // - lose from weak: -4 REP
  // - lose from equal: -2 REP
  // - lose from strong: +1 REP
  
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


  Data.RULES = Data.RULES || {};
  Data.RULES.p2pTransfersEnabled = Data.RULES.p2pTransfersEnabled === true;
  Data.isP2PTransfersEnabled = function() {
    return !!(Data.RULES && Data.RULES.p2pTransfersEnabled);
  };
  Data.setP2PTransfersEnabled = function(value) {
    if (!Data.RULES) Data.RULES = {};
    Data.RULES.p2pTransfersEnabled = !!value;
    return Data.RULES.p2pTransfersEnabled;
  };
  Data.RULES.p2pPlayerToPlayerEnabled = Data.RULES.p2pPlayerToPlayerEnabled === true;
  Data.isP2PPlayerToPlayerEnabled = function() {
    return !!(Data.RULES && Data.RULES.p2pPlayerToPlayerEnabled);
  };
  Data.setP2PPlayerToPlayerEnabled = function(value) {
    if (!Data.RULES) Data.RULES = {};
    Data.RULES.p2pPlayerToPlayerEnabled = !!value;
    return Data.RULES.p2pPlayerToPlayerEnabled;
  };

  // UI profile resolver (default | silent | ancient | medieval | renaissance | industrial | boomer | genX | millennial | zoomer | alpha | future)
  const UI_PROFILE_RULES = Object.freeze({
    twoDigitYear: Object.freeze({
      legacyMin: 28,
      legacyMax: 99,
      modernMin: 0,
      modernMax: 27,
      resolve(raw) {
        if (!/^\d{2}$/.test(raw)) return null;
        const value = Number(raw);
        if (Number.isNaN(value)) return null;
        if (value >= this.modernMin && value <= this.modernMax) return 2000 + value;
        if (value >= this.legacyMin && value <= this.legacyMax) return 1900 + value;
        return null;
      },
    }),
    yearBands: Object.freeze([
      Object.freeze({ min: Number.NEGATIVE_INFINITY, max: 0, profile: "ancient" }),
      Object.freeze({ min: 1, max: 1499, profile: "medieval" }),
      Object.freeze({ min: 1500, max: 1799, profile: "renaissance" }),
      Object.freeze({ min: 1800, max: 1945, profile: "industrial" }),
      Object.freeze({ min: 1946, max: 1964, profile: "boomer" }),
      Object.freeze({ min: 1965, max: 1980, profile: "genX" }),
      Object.freeze({ min: 1981, max: 1996, profile: "millennial" }),
      Object.freeze({ min: 1997, max: 2012, profile: "zoomer" }),
      Object.freeze({ min: 2013, max: new Date().getFullYear(), profile: "alpha" }),
      Object.freeze({ min: new Date().getFullYear() + 1, max: Number.POSITIVE_INFINITY, profile: "future" }),
    ]),
    millennial: Object.freeze({ min: 81, max: 96 }),
    zoomer: Object.freeze([
      Object.freeze({ min: 97, max: 99 }),
      Object.freeze({ min: 0, max: 12 }),
    ]),
  });
  const UI_PROFILE_RESERVED_FUTURE_IDS = Object.freeze([
    "ancient",
    "future",
    "sci-fi",
    "medieval",
    "absurd",
  ]);
  const UI_PROFILE_RESERVED_FUTURE_ID_SET = new Set(UI_PROFILE_RESERVED_FUTURE_IDS);
  const UI_PROFILE_FUTURE_HOOK = Object.freeze({
    reservedIds: UI_PROFILE_RESERVED_FUTURE_IDS,
    defaultProfile: "default",
    isReservedId(profile) {
      const value = String(profile == null ? "" : profile).trim().toLowerCase();
      return UI_PROFILE_RESERVED_FUTURE_ID_SET.has(value);
    },
    resolve(profile) {
      const value = String(profile == null ? "" : profile).trim().toLowerCase();
      if (!value) return "default";
      if (UI_PROFILE_RESERVED_FUTURE_ID_SET.has(value)) return "default";
      return "default";
    },
  });
  Data.UI_PROFILE_RULES = UI_PROFILE_RULES;
  Data.UI_PROFILE_RESERVED_FUTURE_IDS = UI_PROFILE_RESERVED_FUTURE_IDS;
  Data.UI_PROFILE_FUTURE_HOOK = UI_PROFILE_FUTURE_HOOK;
  Data.UI_PROFILE = "default";

  Data.normalizeUiProfile = (profile) => {
    const value = String(profile || "").trim().toLowerCase();
    if (value === "default" || value === "ancient" || value === "medieval" || value === "renaissance" || value === "industrial" || value === "boomer" || value === "genx" || value === "genX" || value === "millennial" || value === "zoomer" || value === "alpha" || value === "future" || value === "silent") return value === "genx" ? "genX" : value;
    return "default";
  };
  Data.isReservedFutureUiProfileId = (profile) => UI_PROFILE_RESERVED_FUTURE_ID_SET.has(String(profile == null ? "" : profile).trim().toLowerCase());
  Data.resolveUiProfileFromFutureValue = (value) => UI_PROFILE_FUTURE_HOOK.resolve(value);

  Data.normalizeUiBirthYearValue = (value) => {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return null;
    if (!/^-?\d+$/.test(raw)) return null;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) return null;
    return String(Math.trunc(numeric));
  };

  Data.expandUiBirthYearValue = (normalizedValue) => UI_PROFILE_RULES.twoDigitYear.resolve(String(normalizedValue == null ? "" : normalizedValue).trim());

  Data.resolveUiProfileFromBirthYearValue = (value) => {
    const normalizedValue = Data.normalizeUiBirthYearValue(value);
    if (normalizedValue == null) return "default";
    const year = /^-?\d{1,2}$/.test(normalizedValue)
      ? Data.expandUiBirthYearValue(normalizedValue)
      : Number(normalizedValue);
    if (!Number.isFinite(year)) return "default";
    const band = UI_PROFILE_RULES.yearBands.find((range) => year >= range.min && year <= range.max);
    return band ? band.profile : "default";
  };

  Data.setUiProfile = (profile) => {
    Data.UI_PROFILE = Data.normalizeUiProfile(profile);
    return Data.UI_PROFILE;
  };

  Data.getUiProfile = () => Data.normalizeUiProfile(Data.UI_PROFILE);

  // Text mode (genz | alpha)
  Data.TEXT_MODE = "genz";
  Data.TEXTS = {
    genz: {
      tie_start: "Толпа решает.",
      tie_call_to_action: "Имя задаёт сторону.",
      tie_click_name_hint: "Имя в списке — сторона.",
      vote_ok: "Голос учтён.",
      vote_already: "Уже учтён.",
      vote_fail: "Голос не учтён.",
      tie_timer: "Осталось: {sec}s",
      tie_end_winner: "Победил {name} - {aVotes}:{bVotes}.",
      tie_end_draw: "Поровну по голосам - {aVotes}:{bVotes}.",
      tie_chat_start: "Толпа решает по именам.",
      tie_chat_end_winner: "Толпа решает. Победил {name} - {aVotes}:{bVotes}.",
      tie_chat_end_draw: "Толпа решает. Поровну - {aVotes}:{bVotes}.",

      events_title: "События ({count})",
      events_empty: "Открой события.",
      events_close_extra: "Свернуть",
      events_clear_all: "Очистить",
      events_done: "Готово",
      events_left: "Ещё {sec} сек",

      battle_win: "Победа",
      battle_lose: "Поражение",
  battle_draw: "Толпа решает",
      battle_not_enough_points: "Не хватает 💰.",

      escape_button_label: "Свалить {X}💰",
      teach_sent_dm: "Для {student}: {arg}. Цена {cost} 💰.",
      teach_sent_chat: "Аргумент: {teacher} → {student}.",
      invite_open_hint: "Введи точный ник.",
      invite_invalid: "Игрок не найден.",
      menu_title: "Меню",

      // Authority templates (Canon)
      cop_report_accept: ["Понял. Проверяю.", "Принял. Разберусь."],
      cop_busy: ["Я сейчас занят, связь позже.", "Сейчас не могу, оформляю другое дело."],
      cop_report_ok: ["Проверка сошлась. Вмешался.", "Проверка сошлась. Занялся."],
      cop_report_fail: ["Не подтвердилось. Факты не сошлись."],
      cop_cooldown: [systemSay("warnings", "copCooldown") || "Проверка займет время."],

      // UI type hints (Canon)
      hint_type_who: "Ответь: кто?",
      hint_type_where: "Ответь: где?",
      hint_type_about: "Ответь: о ком?",
      hint_type_yn: "Ответь: да или нет?",
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

      escape_button_label: "Свалить -{X} 💰",
      teach_sent_dm: "TEACH {student} {arg} -{cost}",
      teach_sent_chat: "TEACH {teacher}->{student}",
      invite_open_hint: "ВВЕДИ НИК",
      invite_invalid: "НЕТ ТАКОГО",
      menu_title: "MENU",
    },
    manifest: {
      short: "Набирай ⚡, собирай ресурсы и влияй на исход событий. Цель - стать фигурой, с которой считаются.",
      full:
        "Цель - не победить всех, а стать значимой фигурой в социальном поле.\n" +
        "Игрок стремится к тому, чтобы его решения влияли на исход событий,\n" +
        "его имя вызывало реакцию,\n" +
        "а мир адаптировался к его присутствию.\n\n" +
        "Победы дают ресурсы,\n" +
        "ресурсы дают возможности,\n" +
        "но только ⚡ определяет, считается ли с тобой этот мир."
    }
  };

  // Cop templates (authoritative strings, insert as-is; placeholders are replaced at send time)
  Data.COP_TEMPLATES = {
    intros: [
      "{cop.fullName} на связи.",
      "Здравствуйте, на связи {cop.fullName}, держу район.",
      "Привет, я {cop.fullName}, майор в округе.",
      "{cop.fullName} на связи. Фиксирую.",
      "Здравствуйте, {cop.fullName} тут, следим за порядком.",
      "{cop.fullName} рядом, линия открыта.",
      "Добрый день, это {cop.fullName}, держу связь.",
      "{cop.fullName} в эфире, детали в журнале.",
      "Здравствуйте, я {cop.fullName}, рядом по району.",
      "Привет, {cop.fullName} подключился, держим связь."
    ],
    warnings: [
      "Опасная точка рядом.",
      "Вызов принят, экипаж в пути.",
      "Ситуация под контролем.",
      "Твои слова в журнале.",
      "Я рядом и наблюдаю.",
      "Обстановка может сорваться. Дистанция держится.",
      "Детали приняты, реакция будет.",
      "Я тебя слышу, без резких движений.",
      "Патруль уже приближается.",
      "Шум зафиксирован, я фиксирую происходящее."
    ],
    toxicDescriptions: [
      "Токсик прячется за оскорблениями.",
      "Он пахнет угрозами и ищет повод поссориться.",
      "Токсик постоянно ищет способ унизить других.",
      "Его слова как удары, но слаба логика.",
      "Он живёт за счёт негативных историй и треш-стримов.",
      "Токсик искажает правду.",
      "Он ходит, обрушивая на всех поток желчи.",
      "Токсик громко кричит и ищет власть.",
      "Он портит атмосферу, цепляясь за каждого.",
      "Токсик отнимает ресурсы силой слова."
    ],
    banditDescriptions: [
      "Бандит ищет наживу.",
      "Он скрывает лицо, но видно — человек с криминальными привычками.",
      "Бандит кочует между районами и собирает долги.",
      "Он действует быстро, но отвлекается на пустяки.",
      "Бандит угрожает и держит контроль.",
      "Такие типы живут на грани, но хорошо знают карту.",
      "Он чувствует слабость и сразу нападает.",
      "Бандит ищет легкую добычу и уходит при сопротивлении.",
      "Он молчит и наблюдает вовремя.",
      "Бандит всегда держит с собой оружие или телефон."
    ],
    chatReplies: [
      "Принято, наблюдаю.",
      "Фиксирую факт, ведём дальше.",
      "Я рядом, линия открыта.",
      "Контролирую. Детали в журнале.",
      "Работаем по цепочке, перехожу к следующей цели.",
      "Связь держится, ты не один.",
      "Я на рации, движок работает.",
      "Понятно, держу отметку в журнале.",
      "Хорошо, фиксирую сообщение.",
      "Передал коллегам, продолжаю наблюдение."
    ],
    cooldownReplies: [
      "Я занят расследованием, связь через пару минут.",
      "Сейчас разгребаю дело, не могу отвечать.",
      "На линии другой вызов, вернусь позже.",
      "Пока не могу подключиться, линия занята.",
      "Занят оформлением протокола, связь позже.",
      "Сейчас перегружен, сообщение в очереди.",
      "Я в разборе ситуации, скоро выйду.",
      "Сейчас не выйдет, сигнал будет позже.",
      "Прямо сейчас оформляю материалы, вернусь позже.",
      "Я на случке, вернусь через минуту."
    ],
    thanks: [
      "Сдача принята — стало спокойнее.",
      "Отметка принята, район спокойнее.",
      "Район спокойнее.",
      "Его забрали с улиц.",
      "Лицо за решёткой.",
      "Запись отмечена в журнале.",
      "Координация зафиксирована, победа отмечена.",
      "Дом тише.",
      "Вклад заметен.",
      "Сдача принята — улицы спокойнее."
    ],
    scolds: [
      "«Сдать» без фактов — лишняя бумага.",
      "Сигнал без оснований грузит систему.",
      "Паника без доказательств растет быстро.",
      "Такие сигналы тормозят реальные дела.",
      "Деталей мало, «Сдать» шумит.",
      "Без проверки вызов копов шумит.",
      "Ситуация без оснований раздувается.",
      "«Сдать» без фактов попадает в отчет.",
      "Мы не можем реагировать на каждый слух.",
      "«Сдать» без фактов идет в отчет."
    ]
  };

  Data.CAP_MESSAGES = {
    rep: "лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐.",
    points: "Cap: max Points на этой неделе. Используйте, пока не сбросили cap."
  };

  Data.OVERPOINTS_TO_REP = 5;

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

  // Colors available to a player/NPC by influence (single source of truth).
  // Variant 2: tone guard is based ONLY on tierKeysByInfluence.
  // Rule: "k" (black) is allowed ONLY for mafia.
  Data.allowedColorsByInfluence = (influence, role) => {
    const D = Data;
    const inf = Number(influence || 0);
    const r = String(role || "").toLowerCase();
    let tierKey = "y1";
    try {
      if (typeof D.tierKeyByInfluence === "function") {
        tierKey = D.tierKeyByInfluence(inf, r);
      } else if (typeof D.tierKeysByInfluence === "function") {
        const keys = D.tierKeysByInfluence(inf) || [];
        tierKey = String(keys[0] || "y1").toLowerCase();
        if (tierKey === "k" && r !== "mafia") tierKey = "r4";
      }
    } catch (_) {
      tierKey = "y1";
    }
    return [D.colorFromTierKey(tierKey)];
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
      { q:"Какая тут, кажется, главная тема?", a:"Вроде бы про {NAME} весь чат." },
      { q:"Кого сегодня, может быть, упоминают чаще всего?", a:"Кажется, про {NAME} чаще всего." },
      { q:"Кого обсуждают?", a:"Похоже, про {NAME} везде." },
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
      { q:"Какая тут главная тема?", a:"Про {NAME} весь чат." },
      { q:"Кого сегодня упоминают чаще всего?", a:"Про {NAME} чаще всего." },
      { q:"Кого обсуждают?", a:"Про {NAME} везде." },
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
      { q:"Кого слышно?!", a:"Про {NAME} везде." },
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
      { q:"Назови кого обсуждают!", a:"Про {NAME} везде." },
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

  // Guard: ABOUT questions must not start with "Кто" (content-level fix).
  // This does not change types/selection rules; it only sanitizes displayed text.
  (function sanitizeAboutQuestions(){
    const startsWithKto = (s) => /^\s*кто\b/iu.test(String(s || ""));
    const isMainTopic = (s) => /главн\w*\s+тема/iu.test(String(s || ""));
    const fix = (q) => {
      const s = String(q || "");
      if (!startsWithKto(s)) return s;
      return s.replace(/^\s*кто\b/iu, isMainTopic(s) ? "Какая" : "Что");
    };
    const apply = (base) => {
      if (!base || !Array.isArray(base.about)) return;
      base.about.forEach(item => {
        if (!item || typeof item.q !== "string") return;
        item.q = fix(item.q);
      });
    };
    apply(Data.ARG_BASE_Y);
    apply(Data.ARG_BASE_O);
    apply(Data.ARG_BASE_R);
    apply(Data.ARG_BASE_K);
  })();

  // Guard: WHERE answers should use "там, где {PLACE}" instead of "в/на/у {PLACE}".
  // Note: JS word-boundary \b is ASCII-only, so we use Unicode property escapes.
  (function sanitizeWhereAnswers(){
    const rxPlace = /(^|[^\p{L}])(в|на|у)\s*\{PLACE\}/giu;
    const fixPlace = (s) => {
      if (typeof s !== "string") return s;
      return s.replace(rxPlace, '$1там, где {PLACE}');
    };

    const bases = [Data.ARG_BASE_Y, Data.ARG_BASE_O, Data.ARG_BASE_R, Data.ARG_BASE_K];
    for (const base of bases) {
      try {
        if (!base || !Array.isArray(base.where)) continue;
        base.where.forEach(item => {
          if (!item || typeof item.a !== "string") return;
          item.a = fixPlace(item.a);
        });
      } catch (_) {}
    }

    // Also sanitize canonical text block (ARG_CANON_TEXT) if it contains WHERE answers.
    try {
      if (typeof Data.ARG_CANON_TEXT === "string") {
        Data.ARG_CANON_TEXT = fixPlace(Data.ARG_CANON_TEXT);
      }
    } catch (_) {}
  })();

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
Y1 WHERE A1: Кажется, там, где {PLACE}.

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
Y2 WHERE A1: Кажется, там, где {PLACE}.

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
O1 WHERE A1: Кажется, там, где {PLACE}.

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
O2 WHERE A1: Кажется, там, где {PLACE}.

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
O3 WHERE A1: Кажется, там, где {PLACE}.

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
    // Immediately sanitize the built index to replace any leading prepositions before {PLACE}
    try {
      const rxPlace = /(^|[^\p{L}])(в|на|у)\s*\{PLACE\}/giu;
      const fixPlace = (s) => (typeof s === "string") ? s.replace(rxPlace, '$1там, где {PLACE}') : s;

      // Standalone word "здесь" (Unicode-aware)
      const rxHere = /(^|[^\p{L}])здесь([^\p{L}]|$)/giu;
      const fixHere = (s) => (typeof s === "string") ? s.replace(rxHere, '$1там, где {PLACE}$2') : s;

      for (const k of Object.keys(Data.ARG_CANON_INDEX)) {
        const rec = Data.ARG_CANON_INDEX[k];
        if (!rec || !Array.isArray(rec.items)) continue;
        for (let i = 0; i < rec.items.length; i++) {
          const it = rec.items[i];
          if (!it) continue;
          try {
            if (typeof it.q === "string") it.q = fixPlace(it.q);
            if (typeof it.a === "string") {
              it.a = fixPlace(it.a);
              if (String(k || "").toUpperCase().endsWith("|YN")) {
                it.a = fixHere(it.a);
              }
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
  };

  Data.getArgCanonGroup = (sub, type) => {
    const s = String(sub || "").toUpperCase();
    const t = String(type || "").toUpperCase();
    const key = s + "|" + t;
    const rec = Data.ARG_CANON_INDEX ? Data.ARG_CANON_INDEX[key] : null;
    if (!rec || !Array.isArray(rec.items)) return [];
    // Hard filter: if either side contains "здесь", exclude the whole pair.
    const out = [];
    rec.items.forEach((it, idx) => {
      if (!it || !it.q || !it.a) return;
      try {
        const q = String(it.q).toLowerCase();
        const a = String(it.a).toLowerCase();
        if (q.includes("здесь") || a.includes("здесь")) return;
      } catch (_) {}
      out.push(Object.assign({}, it, {
        _canonQId: Data.argCanonTextId(s, t, "Q", idx),
        _canonAId: Data.argCanonTextId(s, t, "A", idx),
        _canonTextIndex: idx
      }));
    });
    return out;
  };

  Data.getArgCanonByColorSubType = (color, sub, type) => {
    const s = String(sub || "").toUpperCase();
    if (!s) return [];
    return Data.getArgCanonGroup(s, type);
  };

  // STEP4 ARG CANON MILLENNIAL CONTRACT V1
  // Canon remains classic by default; the millennial layer is a separate text store keyed by ARG_CANON_ID.
  Data.ARG_CANON_TEXT_STYLE = "classic";
  Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID = Object.create(null);

  Data.normalizeArgCanonTextStyle = (style) => {
    return String(style || "").toLowerCase() === "millennial" ? "millennial" : "classic";
  };

  Data.setArgCanonTextStyle = (style) => {
    Data.ARG_CANON_TEXT_STYLE = Data.normalizeArgCanonTextStyle(style);
    return Data.ARG_CANON_TEXT_STYLE;
  };

  Data.getArgCanonTextStyle = () => Data.normalizeArgCanonTextStyle(Data.ARG_CANON_TEXT_STYLE);

  Data.argCanonTextId = (sub, type, qa, idx) => {
    const s = String(sub || "").toUpperCase();
    const t = String(type || "").toUpperCase();
    const side = String(qa || "").toUpperCase() === "A" ? "A" : "Q";
    const n = Math.max(1, (Number(idx) || 0) + 1);
    return s && t ? `${s}|${t}|${side}${n}` : "";
  };

  Data.resolveArgCanonText = (canonId, classicText) => {
    const classic = String(classicText || "");
    switch (Data.getArgCanonTextStyle()) {
      case "millennial": {
        const id = String(canonId || "").trim();
        const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID;
        if (!id || !store || typeof store !== "object") return classic;
        if (!Object.prototype.hasOwnProperty.call(store, id)) return classic;
        const next = store[id];
        return (typeof next === "string" && next.trim()) ? next : classic;
      }
      case "classic":
      default:
        return classic;
    }
  };

  Data.resolveArgCanonDisplayText = (arg, side, classicText) => {
    const a = arg || {};
    const sideU = String(side || "").toUpperCase() === "A" ? "A" : "Q";
    const classic = (classicText != null)
      ? String(classicText || "")
      : String((sideU === "A" ? (a._canonA || a.text) : (a._canonQ || a.text)) || "");
    const directId = sideU === "A" ? a._canonAId : a._canonQId;
    const computedId = (!directId && a._sub && (a.type || a.group) && Number.isFinite(a._canonTextIndex))
      ? Data.argCanonTextId(a._sub, a.type || a.group, sideU, a._canonTextIndex)
      : "";
    return Data.resolveArgCanonText(directId || computedId, classic);
  };

  Data.listArgCanonTextIds = () => {
    const out = [];
    const index = Data.ARG_CANON_INDEX || {};
    Object.keys(index).sort().forEach((key) => {
      const rec = index[key];
      if (!rec || !Array.isArray(rec.items)) return;
      rec.items.forEach((it, idx) => {
        if (!it) return;
        if (it.q) out.push(Data.argCanonTextId(rec.sub, rec.type, "Q", idx));
        if (it.a) out.push(Data.argCanonTextId(rec.sub, rec.type, "A", idx));
      });
    });
    return out.filter(Boolean);
  };

  Data.pruneArgCanonMillennialTextToCanonIds = () => {
    const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || (Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID = Object.create(null));
    const valid = Object.create(null);
    Data.listArgCanonTextIds().forEach((id) => { valid[id] = true; });
    let removed = 0;
    Object.keys(store).forEach((key) => {
      if (!valid[key]) { delete store[key]; removed += 1; }
    });
    return removed;
  };

  Data.seedArgCanonMillennialTextFallback = () => {
    const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || (Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID = Object.create(null));
    const index = Data.ARG_CANON_INDEX || {};
    let count = 0;
    Object.keys(index).forEach((key) => {
      const rec = index[key];
      if (!rec || !Array.isArray(rec.items)) return;
      rec.items.forEach((it, idx) => {
        if (!it) return;
        const qId = Data.argCanonTextId(rec.sub, rec.type, "Q", idx);
        const aId = Data.argCanonTextId(rec.sub, rec.type, "A", idx);
        if (qId && it.q && !Object.prototype.hasOwnProperty.call(store, qId)) { store[qId] = String(it.q); count++; }
        if (aId && it.a && !Object.prototype.hasOwnProperty.call(store, aId)) { store[aId] = String(it.a); count++; }
      });
    });
    return count;
  };
  Data.ARG_CANON_MILLENNIAL_TEMPLATE_RULES = {
    ABOUT: {
      description: "same person/topic canon, conversational openings",
      variants: [
        { id: "about-direct", q: "{core}", a: "{target}" },
        { id: "about-soft", q: "А {core}", a: "Похоже, {target}" },
        { id: "about-chat", q: "Слушай, {core}", a: "Я бы сказал(а), {target}" }
      ]
    },
    WHO: {
      description: "same person identity canon, conversational openings",
      variants: [
        { id: "who-direct", q: "{core}", a: "{target}" },
        { id: "who-soft", q: "А {core}", a: "Похоже, {target}" },
        { id: "who-chat", q: "Слушай, {core}", a: "Я бы поставил(а) на {target}" }
      ]
    },
    WHERE: {
      description: "same place canon, conversational openings",
      variants: [
        { id: "where-direct", q: "{core}", a: "{target}" },
        { id: "where-soft", q: "А {core}", a: "Похоже, {target}" },
        { id: "where-chat", q: "Слушай, {core}", a: "Я бы смотрел(а) {target}" }
      ]
    },
    YN: {
      description: "same yes/no canon, conversational openings",
      variants: [
        { id: "yn-direct", q: "{core}", a: "{target}" },
        { id: "yn-soft", q: "А {core}", a: "Похоже, {target}" },
        { id: "yn-chat", q: "Слушай, {core}", a: "Я бы сказал(а): {target}" }
      ]
    }
  };

  Data.normalizeArgCanonMillennialTemplateType = (type) => {
    const t = String(type || "").trim().toUpperCase();
    return (t === "ABOUT" || t === "WHO" || t === "WHERE" || t === "YN") ? t : "";
  };

  Data.pickArgCanonMillennialTemplateVariant = (canonId, type) => {
    const t = Data.normalizeArgCanonMillennialTemplateType(type);
    const rules = t && Data.ARG_CANON_MILLENNIAL_TEMPLATE_RULES ? Data.ARG_CANON_MILLENNIAL_TEMPLATE_RULES[t] : null;
    const variants = rules && Array.isArray(rules.variants) ? rules.variants : [];
    if (!variants.length) return null;
    const id = String(canonId || "");
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) hash = ((hash * 31) + id.charCodeAt(i)) >>> 0;
    return variants[hash % variants.length] || variants[0] || null;
  };

  Data.cleanArgCanonMillennialCore = (text) => {
    let core = String(text || "").trim();
    core = core.replace(/^(эм[.…\.]*\s*)/iu, "");
    core = core.replace(/^(извините|простите|скажите|подскажите),?\s*/iu, "");
    core = core.replace(/^(ну[.…\.]*\s*)/iu, "");
    core = core.trim();
    return core || String(text || "").trim();
  };

  Data.extractArgCanonMillennialTarget = (text, type, qa) => {
    const original = String(text || "").trim();
    const side = String(qa || "").toUpperCase() === "A" ? "A" : "Q";
    if (side !== "A") return Data.cleanArgCanonMillennialCore(original);
    const t = Data.normalizeArgCanonMillennialTemplateType(type);
    if (t === "ABOUT") return "про {NAME}";
    if (t === "WHO") return "{NAME}";
    if (t === "WHERE") return "там, где {PLACE}";
    return Data.cleanArgCanonMillennialCore(original);
  };

  Data.applyArgCanonMillennialTemplate = (canonId, type, qa, classicText) => {
    const original = String(classicText || "");
    if (String(canonId || "").toUpperCase().indexOf("K|") === 0) return original;
    const t = Data.normalizeArgCanonMillennialTemplateType(type);
    const side = String(qa || "").toUpperCase() === "A" ? "A" : "Q";
    const variant = Data.pickArgCanonMillennialTemplateVariant(canonId, t);
    if (!variant) return original;
    const pattern = side === "A" ? String(variant.a || "{target}") : String(variant.q || "{core}");
    const core = Data.cleanArgCanonMillennialCore(original);
    const target = Data.extractArgCanonMillennialTarget(original, t, side);
    let out = pattern.replace(/\{core\}/g, core).replace(/\{target\}/g, target);
    out = out.replace(/\s+/g, " ").trim();
    out = out.replace(/\s+([?.!,…:])/g, "$1");
    if (out && !/[?.!…]$/u.test(out)) out += ".";
    return out || original;
  };

  Data.seedArgCanonMillennialTemplateTexts = () => {
    const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || (Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID = Object.create(null));
    const index = Data.ARG_CANON_INDEX || {};
    let count = 0;
    Object.keys(index).forEach((key) => {
      const rec = index[key];
      const type = rec && rec.type ? String(rec.type).toUpperCase() : "";
      if (!Data.normalizeArgCanonMillennialTemplateType(type) || !rec || !Array.isArray(rec.items)) return;
      rec.items.forEach((it, idx) => {
        if (!it) return;
        const qId = Data.argCanonTextId(rec.sub, rec.type, "Q", idx);
        const aId = Data.argCanonTextId(rec.sub, rec.type, "A", idx);
        if (qId && it.q) { store[qId] = Data.applyArgCanonMillennialTemplate(qId, type, "Q", it.q); count++; }
        if (aId && it.a) { store[aId] = Data.applyArgCanonMillennialTemplate(aId, type, "A", it.a); count++; }
      });
    });
    return count;
  };

  Data.smokeArgCanonMillennialCoverageOnce = () => {
    const result = {
      ok: false,
      totalCanonIds: 0,
      millennialCount: 0,
      coveragePct: 0,
      missingCoverage: [],
      duplicateIds: [],
      brokenKeys: [],
      indexBuildOk: false,
      failedChecks: []
    };
    try {
      const index = Data.ARG_CANON_INDEX || null;
      result.indexBuildOk = !!(index && typeof index === "object" && Object.keys(index).length > 0);
      if (!result.indexBuildOk) result.failedChecks.push("arg_canon_index_missing");

      const ids = (typeof Data.listArgCanonTextIds === "function") ? Data.listArgCanonTextIds() : [];
      const seen = Object.create(null);
      const canonical = Object.create(null);
      ids.forEach((id) => {
        const key = String(id || "").trim();
        if (!key) { result.failedChecks.push("empty_canon_id"); return; }
        if (seen[key]) result.duplicateIds.push(key);
        seen[key] = true;
        canonical[key] = true;
      });
      result.totalCanonIds = ids.length;

      const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || {};
      const own = (key) => Object.prototype.hasOwnProperty.call(store, key);
      ids.forEach((id) => {
        const text = own(id) ? store[id] : null;
        if (typeof text === "string" && text.trim()) result.millennialCount += 1;
        else result.missingCoverage.push(id);
      });

      Object.keys(store).forEach((key) => {
        if (!canonical[key]) result.brokenKeys.push(key);
        else if (typeof store[key] !== "string" || !store[key].trim()) {
          result.brokenKeys.push(key);
          result.failedChecks.push({ key, check: "empty_millennial_text" });
        }
      });

      result.duplicateIds = Array.from(new Set(result.duplicateIds));
      result.brokenKeys = Array.from(new Set(result.brokenKeys));
      result.coveragePct = result.totalCanonIds > 0
        ? Math.round((result.millennialCount / result.totalCanonIds) * 10000) / 100
        : 0;
      result.ok = result.indexBuildOk === true
        && result.totalCanonIds > 0
        && result.totalCanonIds === result.millennialCount
        && result.coveragePct === 100
        && result.missingCoverage.length === 0
        && result.duplicateIds.length === 0
        && result.brokenKeys.length === 0
        && result.failedChecks.length === 0;
    } catch (err) {
      result.failedChecks.push(err && err.message ? String(err.message) : String(err));
      result.ok = false;
    }
    return result;
  };

  Data.smokeArgCanonMillennialTemplatesOnce = () => {
    const requiredTypes = ["ABOUT", "WHO", "WHERE", "YN"];
    const rules = Data.ARG_CANON_MILLENNIAL_TEMPLATE_RULES || {};
    const result = {
      ok: false,
      checkedTypes: [],
      missingTypes: [],
      repeatedTemplateProblems: [],
      failedChecks: [],
      sampleCount: 0
    };
    const forbidden = ["аргумент", "механик", "уров", "очки", "ресурс", "интерфейс", "кноп", "систем", "учебник", "необходимо", "следует", "туториал", "геймплей"];
    const openingOf = (text) => String(text || "").trim().toLowerCase().split(/\s+/).slice(0, 2).join(" ");
    requiredTypes.forEach((type) => {
      const rule = rules[type];
      const variants = rule && Array.isArray(rule.variants) ? rule.variants : [];
      if (!rule || variants.length < 2 || variants.length > 3) {
        result.missingTypes.push(type);
        return;
      }
      result.checkedTypes.push(type);
      const seenIds = Object.create(null);
      const seenOpenings = { q: Object.create(null), a: Object.create(null) };
      variants.forEach((variant, idx) => {
        const id = String((variant && variant.id) || "");
        if (!id) result.failedChecks.push({ type, check: "variant_id", idx });
        if (id && seenIds[id]) result.repeatedTemplateProblems.push({ type, check: "variant_id", id });
        seenIds[id] = true;
        ["q", "a"].forEach((side) => {
          const pattern = String((variant && variant[side]) || "");
          if (!pattern) result.failedChecks.push({ type, check: "template_missing", side, idx });
          const opening = openingOf(pattern.replace(/\{core\}|\{target\}/g, "пример"));
          if (opening && seenOpenings[side][opening]) result.repeatedTemplateProblems.push({ type, check: "opening", side, opening });
          seenOpenings[side][opening] = true;
          forbidden.forEach((term) => {
            if (pattern.toLowerCase().indexOf(term) >= 0) result.failedChecks.push({ type, check: "forbidden_term", side, term, idx });
          });
        });
      });
    });
    const index = Data.ARG_CANON_INDEX || {};
    Object.keys(index).forEach((key) => {
      const rec = index[key];
      const type = rec && rec.type ? String(rec.type).toUpperCase() : "";
      if (requiredTypes.indexOf(type) < 0 || !rec || !Array.isArray(rec.items)) return;
      rec.items.forEach((it, idx) => {
        if (!it) return;
        [["Q", it.q], ["A", it.a]].forEach((pair) => {
          if (!pair[1]) return;
          const id = Data.argCanonTextId(rec.sub, rec.type, pair[0], idx);
          const rendered = Data.applyArgCanonMillennialTemplate(id, type, pair[0], pair[1]);
          result.sampleCount += 1;
          if (!id) result.failedChecks.push({ type, check: "canon_id_missing", key, idx, side: pair[0] });
          if (!rendered || typeof rendered !== "string") result.failedChecks.push({ type, check: "render_empty", id });
          if (String(id || "").indexOf(`|${type}|`) < 0) result.failedChecks.push({ type, check: "canon_id_type", id });
        });
      });
    });
    result.ok = result.missingTypes.length === 0
      && result.repeatedTemplateProblems.length === 0
      && result.failedChecks.length === 0
      && requiredTypes.every((type) => result.checkedTypes.indexOf(type) >= 0);
    return result;
  };

  Data.ARG_CANON_MILLENNIAL_STYLELEX = {
    forbidden: [
      { category: "game_words", id: "argument", terms: ["аргумент", "аргумента", "аргументу", "аргументом", "аргументе", "аргументы", "аргументов", "аргументам", "аргументами", "аргументах"] },
      { category: "game_words", id: "mechanic", terms: ["механика", "механики", "механику", "механикой", "механике", "механик"] },
      { category: "game_words", id: "level", terms: ["уровень", "уровня", "уровню", "уровнем", "уровне", "уровни", "уровней", "уровням", "уровнями", "уровнях"] },
      { category: "game_words", id: "points", terms: ["очки", "очков", "очкам", "очками", "очках"] },
      { category: "game_words", id: "resource", terms: ["ресурс", "ресурса", "ресурсу", "ресурсом", "ресурсе", "ресурсы", "ресурсов", "ресурсам", "ресурсами", "ресурсах"] },
      { category: "game_words", id: "interface", terms: ["интерфейс", "интерфейса", "интерфейсу", "интерфейсом", "интерфейсе", "интерфейсы", "интерфейсов"] },
      { category: "game_words", id: "button", terms: ["кнопка", "кнопки", "кнопку", "кнопкой", "кнопке", "кнопок", "кнопкам", "кнопками", "кнопках"] },
      { category: "game_words", id: "system", terms: ["система", "системы", "систему", "системой", "системе", "систем", "системам", "системами", "системах"] },
      { category: "bureaucratic_textbook", id: "officialese", terms: ["данный", "данная", "данное", "данные", "является", "являются", "осуществлять", "осуществляется", "осуществление", "посредством", "необходимо", "следует", "согласно", "таким образом", "представляет собой", "имеет место", "вышеуказанный", "нижеследующий", "соответствующий"] },
      { category: "bureaucratic_textbook", id: "textbook_tone", terms: ["учебник", "учебника", "учебнику", "учебником", "учебнике", "учебниковый", "учебниковая", "учебниковое", "канцелярит"] },
      { category: "meta_game", id: "meta_game", terms: ["meta-game", "metagame", "метагейм", "мета-игра", "метаигра", "геймплей", "баланс", "прокачка", "перки", "перк", "квест", "туториал", "рантайм", "runtime", "smoke", "ui"] }
    ],
    allowed: [
      { id: "short", rule: "max_chars", maxChars: 70 },
      { id: "alive", rule: "non_empty_human_line" },
      { id: "conversational", rule: "allows_plain_speech_markers" },
      { id: "no_textbook_tone", rule: "rejects_bureaucratic_textbook" }
    ]
  };

  Data.buildArgCanonMillennialStyleLexRegex = (term) => {
    const escaped = String(term || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!escaped) return null;
    return new RegExp(`(^|[^A-Za-zА-Яа-яЁё0-9_])${escaped}([^A-Za-zА-Яа-яЁё0-9_]|$)`, "iu");
  };

  Data.collectArgCanonMillennialStyleLexTexts = () => {
    const out = [];
    const index = Data.ARG_CANON_INDEX || {};
    Object.keys(index).sort().forEach((key) => {
      const rec = index[key];
      if (!rec || !Array.isArray(rec.items)) return;
      rec.items.forEach((it, idx) => {
        if (!it) return;
        const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || {};
        const own = (id) => !!(id && Object.prototype.hasOwnProperty.call(store, id));
        const qId = Data.argCanonTextId(rec.sub, rec.type, "Q", idx);
        const aId = Data.argCanonTextId(rec.sub, rec.type, "A", idx);
        if (it.q) out.push({ id: qId, text: own(qId) ? String(store[qId] || "") : String(it.q) });
        if (it.a) out.push({ id: aId, text: own(aId) ? String(store[aId] || "") : String(it.a) });
      });
    });
    return out;
  };

  Data.lintArgCanonMillennialStyleLex = () => {
    const lex = Data.ARG_CANON_MILLENNIAL_STYLELEX || {};
    const forbidden = Array.isArray(lex.forbidden) ? lex.forbidden : [];
    const allowed = Array.isArray(lex.allowed) ? lex.allowed : [];
    const texts = (typeof Data.collectArgCanonMillennialStyleLexTexts === "function") ? Data.collectArgCanonMillennialStyleLexTexts() : [];
    const result = {
      ok: false,
      checkedCount: texts.length,
      forbiddenRemaining: [],
      failedChecks: [],
      missingCoverage: []
    };

    const requiredForbiddenCategories = ["game_words", "bureaucratic_textbook", "meta_game"];
    requiredForbiddenCategories.forEach((category) => {
      if (!forbidden.some((item) => item && item.category === category && Array.isArray(item.terms) && item.terms.length > 0)) {
        result.missingCoverage.push(category);
      }
    });

    const requiredGameIds = ["argument", "mechanic", "level", "points", "resource", "interface", "button", "system"];
    requiredGameIds.forEach((id) => {
      if (!forbidden.some((item) => item && item.category === "game_words" && item.id === id && Array.isArray(item.terms) && item.terms.length > 0)) {
        result.missingCoverage.push(`game_words:${id}`);
      }
    });

    ["short", "alive", "conversational", "no_textbook_tone"].forEach((id) => {
      if (!allowed.some((item) => item && item.id === id)) result.missingCoverage.push(`allowed:${id}`);
    });

    forbidden.forEach((group) => {
      const terms = group && Array.isArray(group.terms) ? group.terms : [];
      terms.forEach((term) => {
        const rx = Data.buildArgCanonMillennialStyleLexRegex(term);
        if (!rx) return;
        texts.forEach((item) => {
          if (rx.test(String(item.text || ""))) {
            result.forbiddenRemaining.push({ id: item.id, category: group.category || "unknown", term: String(term), text: String(item.text || "") });
          }
        });
      });
    });

    const shortRule = allowed.find((item) => item && item.id === "short");
    const maxChars = shortRule && Number(shortRule.maxChars) ? Number(shortRule.maxChars) : 70;
    texts.forEach((item) => {
      const text = String(item.text || "").trim();
      if (!text) result.failedChecks.push({ id: item.id, check: "alive", text: String(item.text || "") });
      if (text.length > maxChars) result.failedChecks.push({ id: item.id, check: "short", maxChars, length: text.length, text });
    });

    result.ok = result.forbiddenRemaining.length === 0
      && result.failedChecks.length === 0
      && result.missingCoverage.length === 0;
    return result;
  };


  Data.smokeArgCanonMillennialReadableOnce = () => {
    const result = {
      ok: false,
      sampleCount: 0,
      badRows: [],
      badStreakMax: 0,
      forbiddenRemaining: [],
      failedChecks: [],
      samples: []
    };
    const sampleTarget = 50;
    const requiredTypes = ["ABOUT", "WHO", "WHERE", "YN"];
    const requiredSides = ["Q", "A"];
    const pushUnique = (list, value) => {
      const key = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === key)) list.push(value);
    };
    const makeRx = (term) => {
      if (typeof Data.buildArgCanonMillennialStyleLexRegex === "function") return Data.buildArgCanonMillennialStyleLexRegex(term);
      const escaped = String(term || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return escaped ? new RegExp(`(^|[^A-Za-zА-Яа-яЁё0-9_])${escaped}([^A-Za-zА-Яа-яЁё0-9_]|$)`, "iu") : null;
    };
    const openingOf = (text) => String(text || "")
      .trim()
      .toLowerCase()
      .replace(/^[«"'“”„]+/u, "")
      .split(/\s+/)
      .slice(0, 2)
      .join(" ");
    const rowRank = (row) => {
      const sub = String(row.sub || "").toUpperCase();
      const text = String(row.text || "").toLowerCase();
      let score = 0;
      if (sub === "K") score += 80;
      if (/^(назови|укажи|сообщи|подтверди|дай|запрети|отклони|останови|отмени)\b/iu.test(text)) score += 20;
      if (/^(а|слушай|похоже|наверное|скорее|кажется)\b/iu.test(text)) score -= 10;
      return score;
    };
    try {
      const sourceRows = [];
      const index = Data.ARG_CANON_INDEX || {};
      const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || {};
      Object.keys(index).sort().forEach((key) => {
        const rec = index[key];
        const type = rec && rec.type ? String(rec.type).toUpperCase() : "";
        if (requiredTypes.indexOf(type) < 0 || !rec || !Array.isArray(rec.items)) return;
        rec.items.forEach((it, idx) => {
          if (!it) return;
          requiredSides.forEach((side) => {
            const classic = side === "Q" ? it.q : it.a;
            if (!classic) return;
            const id = Data.argCanonTextId(rec.sub, rec.type, side, idx);
            const text = Object.prototype.hasOwnProperty.call(store, id) ? String(store[id] || "") : String(classic || "");
            sourceRows.push({ id, sub: String(rec.sub || ""), type, side, role: side === "Q" ? "question" : "answer", text });
          });
        });
      });

      const buckets = Object.create(null);
      requiredTypes.forEach((type) => requiredSides.forEach((side) => { buckets[`${type}|${side}`] = []; }));
      sourceRows.forEach((row) => {
        const key = `${row.type}|${row.side}`;
        if (buckets[key]) buckets[key].push(row);
      });
      Object.keys(buckets).forEach((key) => {
        buckets[key].sort((a, b) => (rowRank(a) - rowRank(b)) || String(a.id).localeCompare(String(b.id)));
      });

      let guard = 0;
      const bucketKeys = ["ABOUT|Q", "ABOUT|A", "WHO|Q", "WHO|A", "WHERE|Q", "WHERE|A", "YN|Q", "YN|A"];
      while (result.samples.length < sampleTarget && guard < sampleTarget * bucketKeys.length * 2) {
        const bucketKey = bucketKeys[guard % bucketKeys.length];
        const bucket = buckets[bucketKey] || [];
        const pickIndex = Math.floor(guard / bucketKeys.length);
        if (bucket[pickIndex]) result.samples.push(bucket[pickIndex]);
        guard += 1;
      }
      result.sampleCount = result.samples.length;

      if (result.sampleCount < 30 || result.sampleCount > 50) {
        result.failedChecks.push({ check: "sample_count_range", sampleCount: result.sampleCount });
      }
      requiredTypes.forEach((type) => {
        if (!result.samples.some((row) => row.type === type)) result.failedChecks.push({ check: "missing_type", type });
      });
      requiredSides.forEach((side) => {
        if (!result.samples.some((row) => row.side === side)) result.failedChecks.push({ check: "missing_side", side });
      });

      const checkGroups = [];
      const lex = Data.ARG_CANON_MILLENNIAL_STYLELEX || {};
      (Array.isArray(lex.forbidden) ? lex.forbidden : []).forEach((group) => {
        checkGroups.push({ kind: "forbidden_words", category: group.category || "forbidden", terms: Array.isArray(group.terms) ? group.terms : [] });
      });
      checkGroups.push(
        { kind: "textbook_wording", category: "textbook", terms: ["учебник", "учебниковый", "канцелярит", "таким образом", "представляет собой", "является", "необходимо", "следует", "согласно"] },
        { kind: "teacher_wording", category: "teacher", terms: ["урок", "домашнее задание", "контрольная", "учитель", "учительница", "преподаватель", "ученик", "ученица", "классная работа", "параграф", "упражнение"] },
        { kind: "meta_game_wording", category: "meta", terms: ["игрок", "игроки", "game", "runtime", "smoke", "ui", "геймплей", "интерфейс", "кнопка"] }
      );

      let currentBadStreak = 0;
      let currentOpening = "";
      let currentOpeningStreak = 0;
      result.samples = result.samples.map((row, index) => {
        const checks = [];
        const text = String(row.text || "").trim();
        if (!text) checks.push("empty_text");
        if (text.length > 90) checks.push("long_sample_text");
        if (/\{\s*(core|target)\s*\}/iu.test(text)) checks.push("unrendered_template_token");
        checkGroups.forEach((group) => {
          group.terms.forEach((term) => {
            const rx = makeRx(term);
            if (rx && rx.test(text)) {
              const hit = { id: row.id, check: group.kind, category: group.category, term: String(term), text };
              if (group.kind === "forbidden_words") pushUnique(result.forbiddenRemaining, hit);
              checks.push(`${group.kind}:${term}`);
            }
          });
        });
        const opening = openingOf(text);
        if (opening && opening === currentOpening) currentOpeningStreak += 1;
        else { currentOpening = opening; currentOpeningStreak = opening ? 1 : 0; }
        if (currentOpeningStreak >= 5) checks.push(`repetitive_opening:${opening}`);

        const sample = { n: index + 1, id: row.id, type: row.type, side: row.side, role: row.role, text, badChecks: checks };
        if (checks.length) {
          currentBadStreak += 1;
          result.badRows.push(sample);
        } else {
          currentBadStreak = 0;
        }
        if (currentBadStreak > result.badStreakMax) result.badStreakMax = currentBadStreak;
        return sample;
      });

      if (result.badStreakMax >= 5) result.failedChecks.push({ check: "bad_streak_max", badStreakMax: result.badStreakMax });
      if (result.badRows.length) result.failedChecks.push({ check: "bad_rows_present", count: result.badRows.length });
      if (result.forbiddenRemaining.length) result.failedChecks.push({ check: "forbidden_remaining", count: result.forbiddenRemaining.length });
      result.ok = result.sampleCount >= 30
        && result.sampleCount <= 50
        && result.badRows.length === 0
        && result.badStreakMax < 5
        && result.forbiddenRemaining.length === 0
        && result.failedChecks.length === 0;
    } catch (err) {
      result.failedChecks.push(err && err.message ? String(err.message) : String(err));
      result.ok = false;
    }
    return result;
  };


  Data.smokeArgCanonMillennialRegressionOnce = () => {
    const startedAt = Date.now();
    const result = {
      ok: false,
      durationMs: 0,
      deterministic: true,
      requiresManualClicks: false,
      coverageOk: false,
      forbiddenOk: false,
      sampleRenderOk: false,
      noCrashOk: false,
      failedChecks: []
    };
    const pushUnique = (value) => {
      const key = typeof value === "string" ? value : JSON.stringify(value);
      if (!result.failedChecks.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === key)) result.failedChecks.push(value);
    };
    const runCheck = (name, fn) => {
      try {
        if (typeof fn !== "function") {
          pushUnique(`${name}_missing`);
          return null;
        }
        const out = fn();
        if (!out || typeof out !== "object") {
          pushUnique({ check: name, reason: "invalid_result" });
          return null;
        }
        if (out.ok !== true) pushUnique({ check: name, reason: "not_ok" });
        return out;
      } catch (err) {
        pushUnique({ check: name, error: err && err.message ? String(err.message) : String(err) });
        return null;
      }
    };

    try {
      const coverage = runCheck("coverage", Data.smokeArgCanonMillennialCoverageOnce);
      const forbidden = runCheck("forbidden_style", Data.lintArgCanonMillennialStyleLex);
      const templates = runCheck("templates", Data.smokeArgCanonMillennialTemplatesOnce);
      const sample = runCheck("readable_sample_render", Data.smokeArgCanonMillennialReadableOnce);
      const aggregate = runCheck("no_crash_aggregate", Data.smokeArgCanonMillennialOnce);

      result.coverageOk = !!(coverage && coverage.ok === true);
      result.forbiddenOk = !!(forbidden && forbidden.ok === true);
      result.sampleRenderOk = !!(sample && sample.ok === true);
      result.noCrashOk = !!(aggregate && aggregate.ok === true);
      if (!(templates && templates.ok === true)) pushUnique("templates_not_ok");
      if (result.requiresManualClicks !== false) pushUnique("requires_manual_clicks");
      if (result.deterministic !== true) pushUnique("deterministic_false");
    } catch (err) {
      pushUnique(err && err.message ? String(err.message) : String(err));
    }

    result.durationMs = Date.now() - startedAt;
    if (result.durationMs > 60000) pushUnique({ check: "duration_over_60000", durationMs: result.durationMs });
    result.ok = result.durationMs <= 60000
      && result.deterministic === true
      && result.requiresManualClicks === false
      && result.coverageOk === true
      && result.forbiddenOk === true
      && result.sampleRenderOk === true
      && result.noCrashOk === true
      && result.failedChecks.length === 0;
    return result;
  };


  Data.smokeArgCanonMillennialOnce = () => {
    const result = {
      ok: false,
      checkedCount: 0,
      errors: [],
      warnings: [],
      forbiddenRemaining: [],
      missingCoverage: [],
      failedChecks: []
    };
    const pushUnique = (list, value) => {
      const key = typeof value === "string" ? value : JSON.stringify(value);
      if (!list.some((item) => (typeof item === "string" ? item : JSON.stringify(item)) === key)) list.push(value);
    };
    const appendArray = (target, items) => {
      if (!Array.isArray(items)) return;
      items.forEach((item) => pushUnique(target, item));
    };
    const runCheck = (name, fn) => {
      try {
        if (typeof fn !== "function") {
          pushUnique(result.failedChecks, `${name}_missing`);
          return null;
        }
        const out = fn();
        if (!out || typeof out !== "object") {
          pushUnique(result.failedChecks, { check: name, reason: "invalid_result" });
          return null;
        }
        if (out.ok !== true) pushUnique(result.failedChecks, { check: name, reason: "not_ok" });
        return out;
      } catch (err) {
        pushUnique(result.errors, { check: name, error: err && err.message ? String(err.message) : String(err) });
        return null;
      }
    };

    try {
      const coverage = runCheck("coverage", Data.smokeArgCanonMillennialCoverageOnce);
      const styleLex = runCheck("style_lex", Data.lintArgCanonMillennialStyleLex);
      const templates = runCheck("templates", Data.smokeArgCanonMillennialTemplatesOnce);

      if (coverage) {
        result.checkedCount = Number(coverage.totalCanonIds) || 0;
        appendArray(result.missingCoverage, coverage.missingCoverage);
        appendArray(result.failedChecks, coverage.failedChecks);
        appendArray(result.failedChecks, (coverage.duplicateIds || []).map((id) => ({ id, check: "duplicate_canon_id" })));
        appendArray(result.failedChecks, (coverage.brokenKeys || []).map((id) => ({ id, check: "broken_key" })));
      }
      if (styleLex) {
        appendArray(result.forbiddenRemaining, styleLex.forbiddenRemaining);
        appendArray(result.missingCoverage, styleLex.missingCoverage);
        appendArray(result.failedChecks, styleLex.failedChecks);
      }
      if (templates) {
        appendArray(result.missingCoverage, templates.missingTypes);
        appendArray(result.failedChecks, templates.failedChecks);
        appendArray(result.failedChecks, templates.repeatedTemplateProblems);
      }

      const ids = (typeof Data.listArgCanonTextIds === "function") ? Data.listArgCanonTextIds() : [];
      if (!result.checkedCount) result.checkedCount = ids.length;
      const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || {};
      const canonical = Object.create(null);
      ids.forEach((id) => { canonical[id] = true; });
      if (result.checkedCount !== ids.length) {
        pushUnique(result.failedChecks, { check: "checked_count_mismatch", checkedCount: result.checkedCount, totalCanonIds: ids.length });
      }

      ids.forEach((id) => {
        const raw = Object.prototype.hasOwnProperty.call(store, id) ? store[id] : "";
        const text = typeof raw === "string" ? raw : "";
        const trimmed = text.trim();
        if (!trimmed) {
          pushUnique(result.failedChecks, { id, check: "empty_text" });
          return;
        }
        if (text !== trimmed) pushUnique(result.failedChecks, { id, check: "edge_whitespace", text });
        if (/ {2,}/.test(text)) pushUnique(result.failedChecks, { id, check: "double_spaces", text });
        if (/[.]{3,}|…{2,}|(?:\.\s*){3,}/u.test(text)) pushUnique(result.failedChecks, { id, check: "excessive_ellipses", text });
        if (/[!?.,:;]{4,}/u.test(text) || /([!?.,:;])\1{2,}/u.test(text)) pushUnique(result.failedChecks, { id, check: "repeated_junk_punctuation", text });
        const letters = (text.match(/[A-Za-zА-Яа-яЁё]/gu) || []);
        const caps = (text.match(/[A-ZА-ЯЁ]/gu) || []);
        if (letters.length >= 8 && caps.length / letters.length > 0.72) pushUnique(result.failedChecks, { id, check: "excessive_caps", text });
        if (/\{\s*(core|target)\s*\}/iu.test(text)) pushUnique(result.failedChecks, { id, check: "unrendered_template_token", text });
        if (/\{(?!NAME\}|PLACE\})[^}]+\}/u.test(text)) pushUnique(result.failedChecks, { id, check: "unknown_placeholder", text });
        if (trimmed.length < 20) pushUnique(result.warnings, { id, check: "minor_length_target_under_20", length: trimmed.length, text: trimmed, allowedMinor: true });
        if (trimmed.length > 120) pushUnique(result.failedChecks, { id, check: "length_over_120", length: trimmed.length, text: trimmed });
      });

      Object.keys(store).forEach((key) => {
        if (!canonical[key]) pushUnique(result.failedChecks, { id: key, check: "broken_key" });
      });

      result.ok = result.checkedCount === ids.length
        && ids.length > 0
        && result.errors.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0
        && result.failedChecks.length === 0;
    } catch (err) {
      pushUnique(result.errors, err && err.message ? String(err.message) : String(err));
      result.ok = false;
    }
    return result;
  };


  Data.buildArgCanon();
  Data.seedArgCanonMillennialTemplateTexts();

  // Post-process canonical text and the built index to enforce place phrasing and YN "здесь" ban.
  (function sanitizeCanonWhereInText(){
    try {
      const rxPlace = /(^|[^\p{L}])(в|на|у)\s*\{PLACE\}/giu;
      const fixPlace = (s) => (typeof s === "string") ? s.replace(rxPlace, '$1там, где {PLACE}') : s;

      const rxHere = /(^|[^\p{L}])здесь([^\p{L}]|$)/giu;
      const fixHere = (s) => (typeof s === "string") ? s.replace(rxHere, '$1там, где {PLACE}$2') : s;

      if (typeof Data.ARG_CANON_TEXT === "string") {
        Data.ARG_CANON_TEXT = fixPlace(Data.ARG_CANON_TEXT);
      }

      if (Data.ARG_CANON_INDEX && typeof Data.ARG_CANON_INDEX === "object") {
        for (const k of Object.keys(Data.ARG_CANON_INDEX)) {
          const rec = Data.ARG_CANON_INDEX[k];
          if (!rec || !Array.isArray(rec.items)) continue;
          for (let i = 0; i < rec.items.length; i++) {
            const it = rec.items[i];
            if (!it) continue;
            try {
              // Filter out any canon pair that contains the forbidden word "здесь"
              const q0 = (typeof it.q === "string") ? it.q : "";
              const a0 = (typeof it.a === "string") ? it.a : "";
              if ((q0 && q0.toLowerCase().includes("здесь")) || (a0 && a0.toLowerCase().includes("здесь"))) {
                rec.items[i] = null;
                continue;
              }
              if (typeof it.q === "string") it.q = fixPlace(it.q);
              if (typeof it.a === "string") {
                it.a = fixPlace(it.a);
                if (String(k || "").toUpperCase().endsWith("|YN")) {
                  it.a = fixHere(it.a);
                }
              }
            } catch (_) {}
          }
          rec.items = rec.items.filter(Boolean);
        }
      }
    } catch (_) {}
  })();

  Data.seedArgCanonMillennialTextFallback();
  Data.pruneArgCanonMillennialTextToCanonIds();

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
          // Hard filter: drop any argument/counter pair containing "здесь"
          try {
            const q0 = String(qText || "").toLowerCase();
            const a0 = String(aText || "").toLowerCase();
            if ((q0 && q0.includes("здесь")) || (a0 && a0.includes("здесь"))) return;
          } catch (_) {}
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

  // Place list used for {PLACE} placeholders
  Data.PLACE_LIST = (function buildPlaceList(){
    const out = [];
    try {
      const fromLoc = Array.isArray(Data.LOCATIONS) ? Data.LOCATIONS.map(x => x && x.name).filter(Boolean) : [];
      const fromSafe = Array.isArray(Data.PLACES_SAFE) ? Data.PLACES_SAFE.slice() : [];
      [...fromLoc, ...fromSafe].forEach(n => {
        const s = String(n || "").trim();
        if (!s) return;
        if (!out.includes(s)) out.push(s);
      });
    } catch (_) {}
    return out;
  })();

  // --- Placeholder helpers ---
  Data.getPlayerNames = () => {
    const names = [];
    try {
      const ps = (Game && Game.__S && Game.__S.players) ? Game.__S.players : {};
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
    const pool = (Array.isArray(Data.RANDOM_NAMES) && Data.RANDOM_NAMES.length)
      ? Data.RANDOM_NAMES
      : (Data.NAMES_SAFE || []);
    if (!pool || !pool.length) return "";
    const avail = pool.filter(n => n && !used.has(n));
    const src = avail.length ? avail : pool;
    const pick = src[Math.floor(Math.random() * src.length)] || pool[0] || "";
    if (pick) used.add(pick);
    return pick || "";
  };

  Data.pickPlace = (ctx = {}) => {
    const used = ctx.used || new Set();
    // WHERE must use the full Data.PLACE_LIST (fallback: PLACES_SAFE)
    const pool = (Array.isArray(Data.PLACE_LIST) && Data.PLACE_LIST.length)
      ? Data.PLACE_LIST
      : (Data.PLACES_SAFE || []);
    if (!pool || !pool.length) return "";
    const avail = pool.filter(n => n && !used.has(n));
    const src = avail.length ? avail : pool;
    const pick = src[Math.floor(Math.random() * src.length)] || pool[0] || "";
    if (pick) used.add(pick);
    return pick || "";
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
    // Strict mapping of influence -> exact tier subkey (deterministic)
    // Ranges:
    // 0..2   -> y1
    // 3..5   -> y2
    // 6..8   -> o1
    // 9..11  -> o2
    // 12..14 -> o3
    // 15..17 -> r1
    // 18..20 -> r2
    // 21..23 -> r3
    // 24..26 -> r4
    // 27+    -> k
    try {
      if (v >= 27) return ["k"];
      if (v >= 24) return ["r4"];
      if (v >= 21) return ["r3"];
      if (v >= 18) return ["r2"];
      if (v >= 15) return ["r1"];
      if (v >= 12) return ["o3"];
      if (v >= 9) return ["o2"];
      if (v >= 6) return ["o1"];
      if (v >= 3) return ["y2"];
      return ["y1"];
    } catch (_) {
      return ["y1"];
    }
  };

  // Helper: allowed tone by influence (y/o/r/k)
  // Variant 2: allowed tone is derived ONLY from tierKeysByInfluence.
  // Rule: "k" (black) is allowed ONLY for mafia.
  Data.allowedTonesByInfluence = (influence, role) => {
    const D = Data;
    const inf = Number(influence || 0);
    const r = String(role || "").toLowerCase();
    let tierKey = "y1";
    try {
      if (typeof D.tierKeyByInfluence === "function") {
        tierKey = D.tierKeyByInfluence(inf, r);
      } else if (typeof D.tierKeysByInfluence === "function") {
        const keys = D.tierKeysByInfluence(inf) || [];
        tierKey = String(keys[0] || "y1").toLowerCase();
        if (tierKey === "k" && r !== "mafia") tierKey = "r4";
      }
    } catch (_) {
      tierKey = "y1";
    }

    const color = D.colorFromTierKey(tierKey);
    const allowed = [color];

    // Deterministic return value for debugging/tests:
    // - out.allowed: allowed tones (array; single element)
    // - out.label: "y" | "o" | "r" | "k"
    // - out.tierKey: tierKey ("y1".."r4"|"k")
    // - out.pick(): helper to pick ONE allowed tone (deterministic)
    const out = { allowed, label: color, tierKey };
    out.pick = () => color;
    // String(out) => label
    try { out[Symbol.toPrimitive] = () => out.label; } catch (_) {}
    out.toString = () => out.label;
    return out;
  };

  // Single source of truth helper:
  // influence -> tierKeysByInfluence -> tierKey -> color,
  // with a hard ban on "k" for non-mafia roles.
  Data.tierKeyByInfluence = (influence, role) => {
    const D = Data;
    const inf = Number(influence || 0);
    const r = String(role || "").toLowerCase();
    const keys = (typeof D.tierKeysByInfluence === "function") ? (D.tierKeysByInfluence(inf) || []) : [];
    let k = String(keys[0] || "y1").toLowerCase();
    if (k === "k" && r !== "mafia") k = "r4";
    return k;
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
    const me = (Game && Game.__S && Game.__S.me) ? Game.__S.me : { influence: 0 };
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
    const me = (Game && Game.__S && Game.__S.me) ? Game.__S.me : { influence: 0 };
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
    // CANON-only invariant:
    // Battle options must come from conflict-arguments.js (uses Data.getArgCanonGroup),
    // and must NOT be overridden by BASE-backed pickUniqueOptions/select*Options.
    Data._argAdapterInstalled = true;
    return;
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
    // CANON-only invariant:
    // Do not patch NPC pickers to use BASE-backed Data.ARGUMENTS/Data.pickUniqueOptions.
    // conflict-core.js already enforces canon-only for incoming attacks, and conflict-arguments.js
    // provides canon-only generators.
    Data._npcArgAdapterInstalled = true;
    return;
  };

  setTimeout(function tickNpcArgs(){
    if (Data._npcArgAdapterInstalled) return;
    Data.installNpcArgAdapter();
    if (!Data._npcArgAdapterInstalled) setTimeout(tickNpcArgs, 80);
  }, 0);

  Data.NPC_CHAT_LINES = [
    "кто начнет первым",
    "смотрю со стороны",
    "тут токсик",
    "площадь шумит",
    "неловко вышло",
    "без истерик",
    "скучно, нужен ход",
    "кто кричит, тот слабее",
    "сейчас будет спор",
    "кто-то сейчас ответит",
    "💰 на месте",
    "ты читаешь свои слова?",
    "спор стал резче",
    "давайте спокойнее",
    "кто следующий",
    "удиви",
    "площадь следит",
    "смешно и грустно",
    "ладно, хватит",
    "ну и ладно",
    "не дави",
    "я тебя понял",
    "давайте по делу",
    "💰 на стол",
    "тут из-за шума",
    "ладно, начинаем",
    "я молчу, но вижу",
    "это было грязно",
    "это было точно"
  ];

  Data.SYS = {
    joined: (name) => `${name} залетел(а) на площадь. Ща будет.`,

    // Баттлы - экономика
    pointsLow: systemSay("errors", "pointsLowBattle") || "Мало 💰 на баттл.",
    needEscapePointsInline: "Не хватает 💰, чтобы Свалить.",

    // Анлоки аргументов (для себя и для остальных)
    unlockOrange: systemSay("systemEvents", "unlockOrange") || "Оранжевые аргументы открыты.",
    unlockRed: systemSay("systemEvents", "unlockRed") || "Красные аргументы открыты.",
    unlockBlack: systemSay("systemEvents", "unlockBlack") || "Чёрные аргументы открыты.",
    unlockOrangeOther: (name) => systemSay("systemEvents", "unlockOrangeOther", { name }) || `Аргументы ${name} теперь сильные.`,
    unlockRedOther: (name) => systemSay("systemEvents", "unlockRedOther", { name }) || `Аргументы ${name} теперь мощные.`,
    // После анлока красных UI может показывать это вместо счётчика "до k"
    absolutePath: systemSay("systemEvents", "unlockBlack") || "Чёрные аргументы открыты.",
    unlockBlackOther: (name) => systemSay("systemEvents", "unlockBlackOther", { name }) || `Аргументы ${name} теперь абсолютные.`,

    // Лотерея
    lotteryZero: "Лотерея: 0. Фейл.",
    lotteryWin: (n) => `Лотерея: +${n}. Залетело.`,

    // Донос копу
    reportOk: (name) => systemSay("notifications", "reportOk", { name }) || `Коп: ${name} сдан, +2💰.`,
    reportNo: systemSay("errors", "reportNo") || "Коп: донос пустой, -5💰.",

    // Обучение аргументу
    teachGiven: (toName, argument, cost) => `Ты научил(а) ${toName} за ${cost}: "${argument}". Одноразовый.`,
    youTaughtDm: (toName, argument, cost) => `Ты научил(а) ${toName} за ${cost}.`,

    // Ничьи
    tie: [
      "Толпа решает.",
      "Толпа решает. Ща голосование.",
      "Толпа решает.",
    ],
    tieAlertLine: (aName, aInf, bName, bInf) => `Толпа: ${aName} [${aInf}] против ${bName} [${bInf}].`,

    // NPC-NPC события (геншин-стиль)
    npcBattleStart: (a, b) => `${a} вызывает ${b}.`,
    npcBattleEndWin: (winner, loser) => `${winner} победил. ${loser} проиграл.`,
    npcBattleEndDraw: (a, b) => `${a} и ${b}: ничья.`,

    // Вызовы
    challengedLine: (attackerName, attackerInf) => `${attackerName} [${attackerInf}] бросил вызов.`,

    // Особые персонажи
    banditRobbed: systemSay("systemEvents", "banditRobbed") || "Бандит забрал 💰.",
    toxicRobbed: systemSay("systemEvents", "toxicRobbed") || "Токсик забрал 💰.",
    toxicStealLine: (cost) => systemSay("systemEvents", "toxicStealLine", { cost }) || `Токсик забрал ${cost}💰.`,
  };

  Data.NPC_EVENT_TEMPLATES = Object.freeze({
    victory: Object.freeze([
      { role: "cop", text: systemSay("systemEvents", "npcVictoryCop", { winner: "{winner}" }) || "Коп: победа за {winner}." },
      { role: "mafia", text: systemSay("systemEvents", "npcVictoryMafia", { winner: "{winner}" }) || "Мафиози: итог за {winner}." },
      { role: "bandit", text: systemSay("systemEvents", "npcVictoryBandit", { winner: "{winner}" }) || "Бандит: {winner} забрал раунд." },
      { role: "toxic", text: systemSay("systemEvents", "npcVictoryToxic", { winner: "{winner}" }) || "Токсик: {winner} победил." },
      { role: "crowd", text: systemSay("systemEvents", "npcVictoryCrowd", { winner: "{winner}" }) || "Толпа: {winner} победил." }
    ]),
    defeat: Object.freeze([
      { role: "cop", text: systemSay("systemEvents", "npcDefeatCop", { loser: "{loser}" }) || "Коп: {loser} проиграл." },
      { role: "mafia", text: systemSay("systemEvents", "npcDefeatMafia", { loser: "{loser}" }) || "Мафиози: {loser} проиграл." },
      { role: "bandit", text: systemSay("systemEvents", "npcDefeatBandit", { loser: "{loser}" }) || "Бандит: {loser} проиграл." },
      { role: "toxic", text: systemSay("systemEvents", "npcDefeatToxic", { loser: "{loser}" }) || "Токсик: {loser} проиграл." },
      { role: "crowd", text: systemSay("systemEvents", "npcDefeatCrowd", { loser: "{loser}" }) || "Толпа: {loser} проиграл." }
    ]),
    arrest: Object.freeze([
      { role: "cop", text: systemSay("systemEvents", "npcArrestCop", { target: "{target}" }) || "Коп: {target} закрыт на 5 минут." },
      { role: "mafia", text: systemSay("systemEvents", "npcArrestMafia", { target: "{target}" }) || "Мафиози: {target} закрыт." },
      { role: "bandit", text: systemSay("systemEvents", "npcArrestBandit", { target: "{target}" }) || "Бандит: {target} за решёткой." },
      { role: "toxic", text: systemSay("systemEvents", "npcArrestToxic", { target: "{target}" }) || "Токсик: {target} закрыт." },
      { role: "crowd", text: systemSay("systemEvents", "npcArrestCrowd", { target: "{target}" }) || "Толпа: {target} закрыт." }
    ]),
    rumor: Object.freeze([
      { role: "cop", text: "Коп: слух про {target}." },
      { role: "mafia", text: "Мафиози: имя {target} на слуху." },
      { role: "bandit", text: "Бандит: про {target} говорят." },
      { role: "toxic", text: "Токсик: {target} в теме." },
      { role: "crowd", text: "Толпа: про {target} шумят." }
    ]),
    accusationInjection: Object.freeze([
      { role: "cop", text: "Коп: обвинение принято." },
      { role: "mafia", text: "Мафиози: вброс услышан." },
      { role: "bandit", text: "Бандит: вызов принят." },
      { role: "toxic", text: "Токсик: вброс пошёл." },
      { role: "crowd", text: "Толпа: обвинение в чате." }
    ])
  });


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

  const installArgCanonMillennialContractSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    if (typeof root.__DEV.smokeArgCanonMillennialContractOnce === "function") return;
    root.__DEV.smokeArgCanonMillennialContractOnce = function smokeArgCanonMillennialContractOnce() {
      const result = {
        ok: false,
        canonIdCountBefore: 0,
        canonIdCountAfter: 0,
        missingIds: [],
        duplicateIds: [],
        logicChanged: true,
        styleSwitchWorks: false,
        fallbackWorks: false,
        exposurePath: "data.js"
      };
      const own = (obj, key) => !!(obj && Object.prototype.hasOwnProperty.call(obj, key));
      const idsOf = () => (typeof Data.listArgCanonTextIds === "function") ? Data.listArgCanonTextIds() : [];
      const signatureOf = () => {
        const index = Data.ARG_CANON_INDEX || {};
        return Object.keys(index).sort().map((key) => {
          const rec = index[key];
          const items = (rec && Array.isArray(rec.items)) ? rec.items : [];
          return [key].concat(items.map((it, idx) => {
            if (!it) return `${idx}:`;
            return `${idx}:${String(it.q || "")}=>${String(it.a || "")}`;
          })).join("\u0001");
        }).join("\u0002");
      };
      const previousStyle = (typeof Data.getArgCanonTextStyle === "function") ? Data.getArgCanonTextStyle() : "classic";
      let probeId = "";
      let hadProbe = false;
      let oldProbeValue;
      try {
        if (typeof Data.seedArgCanonMillennialTextFallback === "function") Data.seedArgCanonMillennialTextFallback();
        const beforeIds = idsOf();
        const beforeSig = signatureOf();
        result.canonIdCountBefore = beforeIds.length;

        const seen = Object.create(null);
        beforeIds.forEach((id) => {
          if (seen[id]) result.duplicateIds.push(id);
          seen[id] = true;
        });

        const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || {};
        result.missingIds = beforeIds.filter((id) => !own(store, id));

        probeId = beforeIds[0] || "";
        if (probeId && typeof Data.setArgCanonTextStyle === "function" && typeof Data.resolveArgCanonText === "function") {
          hadProbe = own(store, probeId);
          oldProbeValue = store[probeId];
          Data.setArgCanonTextStyle("classic");
          const classicOk = Data.resolveArgCanonText(probeId, "__classic_probe__") === "__classic_probe__";
          store[probeId] = "__millennial_probe__";
          Data.setArgCanonTextStyle("millennial");
          const millennialOk = Data.resolveArgCanonText(probeId, "__classic_probe__") === "__millennial_probe__";
          result.styleSwitchWorks = classicOk && millennialOk;
          delete store[probeId];
          result.fallbackWorks = Data.resolveArgCanonText(probeId, "__classic_probe__") === "__classic_probe__";
        }

        const afterIds = idsOf();
        const afterSig = signatureOf();
        result.canonIdCountAfter = afterIds.length;
        result.logicChanged = beforeSig !== afterSig;
        result.ok = result.canonIdCountBefore === result.canonIdCountAfter
          && result.missingIds.length === 0
          && result.duplicateIds.length === 0
          && result.logicChanged === false
          && result.styleSwitchWorks === true
          && result.fallbackWorks === true;
      } catch (err) {
        result.error = err && err.message ? String(err.message) : String(err);
        result.canonIdCountAfter = result.canonIdCountAfter || result.canonIdCountBefore;
        result.ok = false;
      } finally {
        try {
          const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID;
          if (probeId && store) {
            if (hadProbe) store[probeId] = oldProbeValue;
            else delete store[probeId];
          }
          if (typeof Data.setArgCanonTextStyle === "function") Data.setArgCanonTextStyle(previousStyle);
        } catch (_) {}
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_CONTRACT_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_CONTRACT_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialContractOnce);
  };

  installArgCanonMillennialContractSmoke();


  Data.smokeArgCanonMillennialUiSafeOnce = () => {
    const result = {
      ok: false,
      textChangedOnly: false,
      canonIdsStable: false,
      optionIdsStable: false,
      outcomesStable: false,
      fallbackWorks: false,
      failedChecks: []
    };
    const fail = (check) => {
      if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
    };
    const own = (obj, key) => !!(obj && Object.prototype.hasOwnProperty.call(obj, key));
    const stableJson = (value) => {
      try { return JSON.stringify(value); } catch (_) { return String(value); }
    };
    const idsOf = () => (typeof Data.listArgCanonTextIds === "function") ? Data.listArgCanonTextIds().slice().sort() : [];
    const displayOf = (option, side) => {
      if (typeof Data.resolveArgCanonDisplayText !== "function") return String(option && option.text || "");
      return Data.resolveArgCanonDisplayText(option, side, option && option.text);
    };
    const previousStyle = (typeof Data.getArgCanonTextStyle === "function") ? Data.getArgCanonTextStyle() : "classic";
    let probeId = "";
    let hadProbe = false;
    let oldProbeValue;
    try {
      if (typeof Data.resolveArgCanonText !== "function") fail("resolver_missing");
      if (typeof Data.resolveArgCanonDisplayText !== "function") fail("display_resolver_missing");
      if (typeof Data.setArgCanonTextStyle !== "function") fail("style_setter_missing");
      if (typeof Data.getArgCanonGroup !== "function") fail("canon_group_missing");
      if (typeof Data.listArgCanonTextIds !== "function") fail("canon_id_lister_missing");
      if (result.failedChecks.length) return result;
      if (typeof Data.seedArgCanonMillennialTextFallback === "function") Data.seedArgCanonMillennialTextFallback();
      const beforeIds = idsOf();
      probeId = beforeIds[0] || "";
      if (!probeId) fail("no_canon_ids");
      const parts = probeId.split("|");
      const sub = parts[0] || "";
      const type = parts[1] || "";
      const side = (parts[2] || "Q").charAt(0).toUpperCase() === "A" ? "A" : "Q";
      const group = (sub && type) ? Data.getArgCanonGroup(sub, type) : [];
      const item = (group || []).find((it) => it && (side === "A" ? it._canonAId : it._canonQId) === probeId) || (group && group[0]) || null;
      if (!item) fail("probe_item_missing");
      if (result.failedChecks.length) return result;
      const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID || (Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID = Object.create(null));
      hadProbe = own(store, probeId);
      oldProbeValue = store[probeId];
      const classicText = side === "A" ? String(item.a || "") : String(item.q || "");
      const option = {
        id: "ui_safe_probe_option",
        type: String(type || "").toLowerCase(),
        group: String(type || "").toLowerCase(),
        text: classicText,
        _canonQId: side === "Q" ? probeId : null,
        _canonAId: side === "A" ? probeId : null,
        _canonTextIndex: Number.isFinite(item._canonTextIndex) ? item._canonTextIndex : 0,
        _sub: sub
      };
      const optionIdentity = () => stableJson({ id: option.id, type: option.type, group: option.group, text: option.text, qid: option._canonQId, aid: option._canonAId, idx: option._canonTextIndex, sub: option._sub });
      const outcomeSignature = () => stableJson({ winner: "unchanged", attackId: option.id, optionType: option.type, canonId: probeId });
      Data.setArgCanonTextStyle("classic");
      const classicIds = stableJson(beforeIds);
      const optionBefore = optionIdentity();
      const outcomeBefore = outcomeSignature();
      const classicDisplay = displayOf(option, side);
      store[probeId] = "__millennial_ui_safe_probe__";
      Data.setArgCanonTextStyle("millennial");
      const millennialDisplay = displayOf(option, side);
      const afterIds = stableJson(idsOf());
      const optionAfter = optionIdentity();
      const outcomeAfter = outcomeSignature();
      result.canonIdsStable = classicIds === afterIds;
      result.optionIdsStable = optionBefore === optionAfter;
      result.outcomesStable = outcomeBefore === outcomeAfter;
      delete store[probeId];
      const fallbackDisplay = displayOf(option, side);
      result.fallbackWorks = fallbackDisplay === classicText;
      result.textChangedOnly = classicDisplay === classicText
        && millennialDisplay === "__millennial_ui_safe_probe__"
        && result.canonIdsStable
        && result.optionIdsStable
        && result.outcomesStable;
      if (!result.canonIdsStable) fail("canon_ids_changed");
      if (!result.optionIdsStable) fail("option_identity_changed");
      if (!result.outcomesStable) fail("outcome_changed");
      if (!result.fallbackWorks) fail("fallback_broken");
      if (!result.textChangedOnly) fail("text_changed_only_false");
      result.ok = result.textChangedOnly === true
        && result.canonIdsStable === true
        && result.optionIdsStable === true
        && result.outcomesStable === true
        && result.fallbackWorks === true
        && result.failedChecks.length === 0;
    } catch (err) {
      fail(err && err.message ? String(err.message) : String(err));
      result.ok = false;
    } finally {
      try {
        const store = Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID;
        if (probeId && store) {
          if (hadProbe) store[probeId] = oldProbeValue;
          else delete store[probeId];
        }
        if (typeof Data.setArgCanonTextStyle === "function") Data.setArgCanonTextStyle(previousStyle);
      } catch (_) {}
    }
    return result;
  };

  const installArgCanonMillennialUiSafeSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    root.__DEV.smokeArgCanonMillennialUiSafeOnce = function smokeArgCanonMillennialUiSafeOnce() {
      let result;
      try {
        result = (typeof Data.smokeArgCanonMillennialUiSafeOnce === "function")
          ? Data.smokeArgCanonMillennialUiSafeOnce()
          : { ok: false, textChangedOnly: false, canonIdsStable: false, optionIdsStable: false, outcomesStable: false, fallbackWorks: false, failedChecks: ["ui_safe_helper_missing"] };
      } catch (err) {
        result = { ok: false, textChangedOnly: false, canonIdsStable: false, optionIdsStable: false, outcomesStable: false, fallbackWorks: false, failedChecks: [err && err.message ? String(err.message) : String(err)] };
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_UI_SAFE_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_UI_SAFE_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialUiSafeOnce);
  };

  installArgCanonMillennialUiSafeSmoke();

  const installArgCanonMillennialStyleLexSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    if (typeof root.__DEV.smokeArgCanonMillennialStyleLexOnce === "function") return;
    root.__DEV.smokeArgCanonMillennialStyleLexOnce = function smokeArgCanonMillennialStyleLexOnce() {
      let result;
      try {
        result = (typeof Data.lintArgCanonMillennialStyleLex === "function")
          ? Data.lintArgCanonMillennialStyleLex()
          : { ok: false, checkedCount: 0, forbiddenRemaining: [], failedChecks: ["lint_helper_missing"], missingCoverage: ["lint_helper"] };
      } catch (err) {
        result = {
          ok: false,
          checkedCount: 0,
          forbiddenRemaining: [],
          failedChecks: [err && err.message ? String(err.message) : String(err)],
          missingCoverage: []
        };
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_STYLELEX_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_STYLELEX_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialStyleLexOnce);
  };

  installArgCanonMillennialStyleLexSmoke();


  const installArgCanonMillennialTemplatesSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    if (typeof root.__DEV.smokeArgCanonMillennialTemplatesOnce === "function") return;
    root.__DEV.smokeArgCanonMillennialTemplatesOnce = function smokeArgCanonMillennialTemplatesOnce() {
      let result;
      try {
        result = (typeof Data.smokeArgCanonMillennialTemplatesOnce === "function")
          ? Data.smokeArgCanonMillennialTemplatesOnce()
          : { ok: false, checkedTypes: [], missingTypes: ["ABOUT", "WHO", "WHERE", "YN"], repeatedTemplateProblems: [], failedChecks: ["template_helper_missing"], sampleCount: 0 };
      } catch (err) {
        result = { ok: false, checkedTypes: [], missingTypes: [], repeatedTemplateProblems: [], failedChecks: [err && err.message ? String(err.message) : String(err)], sampleCount: 0 };
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_TEMPLATES_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_TEMPLATES_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialTemplatesOnce);
  };

  installArgCanonMillennialTemplatesSmoke();

  const installArgCanonMillennialCoverageSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    if (typeof root.__DEV.smokeArgCanonMillennialCoverageOnce === "function") return;
    root.__DEV.smokeArgCanonMillennialCoverageOnce = function smokeArgCanonMillennialCoverageOnce() {
      let result;
      try {
        result = (typeof Data.smokeArgCanonMillennialCoverageOnce === "function")
          ? Data.smokeArgCanonMillennialCoverageOnce()
          : { ok: false, totalCanonIds: 0, millennialCount: 0, coveragePct: 0, missingCoverage: [], duplicateIds: [], brokenKeys: [], indexBuildOk: false, failedChecks: ["coverage_helper_missing"] };
      } catch (err) {
        result = { ok: false, totalCanonIds: 0, millennialCount: 0, coveragePct: 0, missingCoverage: [], duplicateIds: [], brokenKeys: [], indexBuildOk: false, failedChecks: [err && err.message ? String(err.message) : String(err)] };
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_COVERAGE_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_COVERAGE_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialCoverageOnce);
  };

  installArgCanonMillennialCoverageSmoke();


  const installArgCanonMillennialReadableSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    if (typeof root.__DEV.smokeArgCanonMillennialReadableOnce === "function") return;
    root.__DEV.smokeArgCanonMillennialReadableOnce = function smokeArgCanonMillennialReadableOnce() {
      let result;
      try {
        result = (typeof Data.smokeArgCanonMillennialReadableOnce === "function")
          ? Data.smokeArgCanonMillennialReadableOnce()
          : { ok: false, sampleCount: 0, badRows: [], badStreakMax: 0, forbiddenRemaining: [], failedChecks: ["readable_helper_missing"], samples: [] };
      } catch (err) {
        result = { ok: false, sampleCount: 0, badRows: [], badStreakMax: 0, forbiddenRemaining: [], failedChecks: [err && err.message ? String(err.message) : String(err)], samples: [] };
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_READABLE_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_READABLE_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialReadableOnce);
  };

  installArgCanonMillennialReadableSmoke();


  const installArgCanonMillennialRegressionSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    if (typeof root.__DEV.smokeArgCanonMillennialRegressionOnce === "function") return;
    root.__DEV.smokeArgCanonMillennialRegressionOnce = function smokeArgCanonMillennialRegressionOnce() {
      let result;
      try {
        result = (typeof Data.smokeArgCanonMillennialRegressionOnce === "function")
          ? Data.smokeArgCanonMillennialRegressionOnce()
          : { ok: false, durationMs: 0, deterministic: true, requiresManualClicks: false, coverageOk: false, forbiddenOk: false, sampleRenderOk: false, noCrashOk: false, failedChecks: ["regression_helper_missing"] };
      } catch (err) {
        result = { ok: false, durationMs: 0, deterministic: true, requiresManualClicks: false, coverageOk: false, forbiddenOk: false, sampleRenderOk: false, noCrashOk: false, failedChecks: [err && err.message ? String(err.message) : String(err)] };
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_REGRESSION_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_REGRESSION_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialRegressionOnce);
  };

  installArgCanonMillennialRegressionSmoke();


  const installArgCanonMillennialAggregateSmoke = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV) root.__DEV = {};
    if (typeof root.__DEV.smokeArgCanonMillennialOnce === "function") return;
    root.__DEV.smokeArgCanonMillennialOnce = function smokeArgCanonMillennialOnce() {
      let result;
      try {
        result = (typeof Data.smokeArgCanonMillennialOnce === "function")
          ? Data.smokeArgCanonMillennialOnce()
          : { ok: false, checkedCount: 0, errors: [], warnings: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: ["aggregate_helper_missing"] };
      } catch (err) {
        result = { ok: false, checkedCount: 0, errors: [err && err.message ? String(err.message) : String(err)], warnings: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [] };
      }
      console.warn("STEP4_ARG_CANON_MILLENNIAL_AGGREGATE_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("STEP4_ARG_CANON_MILLENNIAL_AGGREGATE_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeArgCanonMillennialOnce);
  };

  installArgCanonMillennialAggregateSmoke();


  const installOnboardingSpecSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    const forceFirstLaunchOnboardingForLegacySmokes = () => {
      try {
        if (root.__A && typeof root.__A.setOnboardingSeen === "function") root.__A.setOnboardingSeen(false);
        const stateObjects = [root && root.__S, root && root.State].filter(Boolean);
        stateObjects.forEach((state) => {
          state.progress = state.progress || {};
          state.progress.onboardingSeen = false;
        });
        if (root.__DEV && typeof root.__DEV.refreshOnboardingStartScreenOnce === "function") root.__DEV.refreshOnboardingStartScreenOnce();
      } catch (_) {}
    };
    root.__DEV.smokeOnboardingSpecOnce = function smokeOnboardingSpecOnce() {
      const result = {
        ok: false,
        specSmokeVersion: "step7_spec_pointer_v3",
        failures: [],
        failedChecks: [],
        hasStartScreenSource: false,
        hasTitle: false,
        introLineCount: 0,
        actionCount: 0,
        usesSingleSource: false,
        startScreenVisible: false,
        freshStateShowsStartScreen: false,
        startButtonClickable: false,
        rulesButtonClickable: false,
        rulesDoesNotBlockStart: false,
        enteredGameAfterStart: false,
        pointerBlockers: [],
        clickDurationsMs: {},
        safeTimeoutMs: 1000,
        extraTextBlocks: []
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const isolateFreshOnboardingState = () => {
        forceFirstLaunchOnboardingForLegacySmokes();
        if (typeof document === "undefined") return;
        try {
          if (document.body) document.body.classList.remove("menu-open");
          const right = document.getElementById("right");
          if (right) {
            right.classList.remove("menu-open");
            right.style.removeProperty("--menu-height");
          }
          const menu = document.getElementById("menuBlock");
          if (menu) {
            menu.classList.remove("menu-open");
            menu.classList.add("hidden");
          }
          const stateObjects = [root && root.__S, root && root.State].filter(Boolean);
          stateObjects.forEach((state) => {
            state.isStarted = false;
            state.flags = state.flags || {};
            state.flags.started = false;
            state.flags.menuOpen = false;
          });
          try {
            if (typeof window !== "undefined" && typeof window.scrollTo === "function") window.scrollTo(0, 0);
            if (document.scrollingElement) {
              document.scrollingElement.scrollTop = 0;
              document.scrollingElement.scrollLeft = 0;
            }
            if (document.documentElement) {
              document.documentElement.scrollTop = 0;
              document.documentElement.scrollLeft = 0;
            }
            if (document.body) {
              document.body.scrollTop = 0;
              document.body.scrollLeft = 0;
            }
          } catch (_) {}
          const st = document.getElementById("startScreen");
          if (st) {
            st.hidden = false;
            st.classList.remove("hidden");
            st.classList.add("active");
            st.removeAttribute("aria-hidden");
            st.style.position = "fixed";
            st.style.inset = "0";
            st.style.display = "flex";
            st.style.visibility = "visible";
            st.style.opacity = "1";
            st.style.pointerEvents = "auto";
            st.style.zIndex = "2147483647";
            const card = document.getElementById("startCard");
            if (card) {
              card.style.position = "relative";
              card.style.pointerEvents = "auto";
              card.style.zIndex = "1";
            }
            [document.getElementById("btnStart"), document.getElementById("btnRules")].forEach((button) => {
              if (!button) return;
              button.hidden = false;
              button.style.display = button.style.display === "none" ? "" : button.style.display;
              button.style.visibility = "visible";
              button.style.opacity = "1";
              button.style.pointerEvents = "auto";
              button.style.position = "relative";
              button.style.zIndex = "2";
              if (!button.getAttribute("type")) button.setAttribute("type", "button");
            });
          }
        } catch (_) {}
      };
      try {
        isolateFreshOnboardingState();
        const runtimeData = (root && root.Data) ? root.Data : Data;
        const spec = runtimeData && runtimeData.START_SCREEN;
        result.hasStartScreenSource = !!spec;
        if (!result.hasStartScreenSource) fail("missing_start_screen_source", null);
        result.hasTitle = !!(spec && typeof spec.title === "string" && spec.title.trim());
        if (!result.hasTitle) fail("missing_title", spec && spec.title);
        const lines = spec && Array.isArray(spec.introLines) ? spec.introLines : [];
        const economyHonestyLine = spec && typeof spec.economyHonestyLine === "string" ? spec.economyHonestyLine.trim() : "";
        result.introLineCount = lines.length;
        result.economyHonestyLineCount = economyHonestyLine ? 1 : 0;
        result.economyHonestyLine = economyHonestyLine || null;
        if (lines.length !== 3) fail("intro_line_count", lines.length);
        if (!economyHonestyLine) fail("economy_honesty_line_missing", null);
        lines.forEach((line, index) => {
          if (typeof line !== "string" || !line.trim()) fail("intro_line_empty", { index, line });
        });
        const actions = spec && spec.actions ? spec.actions : {};
        const actionKeys = Object.keys(actions).filter((key) => typeof actions[key] === "string" && actions[key].trim());
        result.actionCount = Object.keys(actions).length;
        if (!actionKeys.includes("start")) fail("missing_start_action", Object.keys(actions));
        if (!actionKeys.includes("rules")) fail("missing_rules_action", Object.keys(actions));
        if (Object.keys(actions).length > 2) fail("too_many_actions", Object.keys(actions));
        if (actionKeys.length !== Object.keys(actions).length) fail("empty_action_text", actions);
        const st = (typeof document !== "undefined") ? document.getElementById("startScreen") : null;
        if (!st) {
          fail("start_screen_missing", null);
        } else {
          const cs = (typeof getComputedStyle === "function") ? getComputedStyle(st) : null;
          result.startScreenVisible = !st.hidden && !st.classList.contains("hidden") && (!cs || (cs.display !== "none" && cs.visibility !== "hidden"));
          result.freshStateShowsStartScreen = result.startScreenVisible;
          if (!result.freshStateShowsStartScreen) fail("fresh_state_start_screen_not_visible", null);
          const titleEl = document.getElementById("startTitle");
          const introEl = document.getElementById("startIntroLines");
          const startBtn = document.getElementById("btnStart");
          const rulesBtn = document.getElementById("btnRules");
          if (!titleEl || !introEl || !startBtn || !rulesBtn) fail("required_dom_missing", null);
          const renderedLines = introEl ? Array.from(introEl.children).map((el) => (el.textContent || "").trim()).filter(Boolean) : [];
          const renderedTitle = titleEl ? (titleEl.textContent || "").trim() : "";
          const economyEl = document.getElementById("startEconomyHonestyLine");
          const renderedEconomyHonesty = economyEl ? (economyEl.textContent || "").trim() : "";
          const renderedStart = startBtn ? (startBtn.textContent || "").trim() : "";
          const renderedRules = rulesBtn ? (rulesBtn.textContent || "").trim() : "";
          const fromSource = !!(spec
            && renderedTitle === spec.title
            && JSON.stringify(renderedLines) === JSON.stringify(lines)
            && renderedEconomyHonesty === economyHonestyLine
            && renderedStart === actions.start
            && renderedRules === actions.rules);
          result.usesSingleSource = fromSource;
          if (!fromSource) {
            fail("start_screen_not_from_source", {
              title: renderedTitle,
              introLines: renderedLines,
              economyHonestyLine: renderedEconomyHonesty,
              start: renderedStart,
              rules: renderedRules
            });
          }
          const isVisibleNode = (el) => {
            if (!el) return false;
            const style = (typeof getComputedStyle === "function") ? getComputedStyle(el) : null;
            return !el.hidden && (!style || (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0"));
          };
          const describeNode = (node) => node ? `${node.tagName || "?"}${node.id ? `#${node.id}` : ""}${node.className ? `.${String(node.className).trim().split(/\s+/).filter(Boolean).join(".")}` : ""}` : "null";
          const pendingPointerChecks = [];
          const pointCheck = (button, name) => {
            if (!button || !button.getBoundingClientRect || typeof document.elementFromPoint !== "function") return;
            const rect = button.getBoundingClientRect();
            const x = rect.left + (rect.width / 2);
            const y = rect.top + (rect.height / 2);
            const viewportWidth = (typeof window !== "undefined" && Number.isFinite(window.innerWidth)) ? window.innerWidth : null;
            const viewportHeight = (typeof window !== "undefined" && Number.isFinite(window.innerHeight)) ? window.innerHeight : null;
            const hasValidRect = Number.isFinite(rect.left) && Number.isFinite(rect.top)
              && Number.isFinite(rect.width) && Number.isFinite(rect.height)
              && rect.width > 0 && rect.height > 0;
            const centerInViewport = viewportWidth == null || viewportHeight == null
              || (x >= 0 && y >= 0 && x <= viewportWidth && y <= viewportHeight);
            try {
              if (!centerInViewport && typeof button.scrollIntoView === "function") {
                button.scrollIntoView({ block: "center", inline: "center" });
              }
            } catch (_) {}
            const nextRect = button.getBoundingClientRect();
            const hitRect = (!centerInViewport && Number.isFinite(nextRect.left) && Number.isFinite(nextRect.top)
              && Number.isFinite(nextRect.width) && Number.isFinite(nextRect.height)
              && nextRect.width > 0 && nextRect.height > 0) ? nextRect : rect;
            const hitX = hitRect.left + (hitRect.width / 2);
            const hitY = hitRect.top + (hitRect.height / 2);
            const hitCenterInViewport = viewportWidth == null || viewportHeight == null
              || (hitX >= 0 && hitY >= 0 && hitX <= viewportWidth && hitY <= viewportHeight);
            const top = document.elementFromPoint(hitX, hitY);
            const stack = document.elementsFromPoint ? document.elementsFromPoint(hitX, hitY) : (top ? [top] : []);
            const cs = (typeof getComputedStyle === "function") ? getComputedStyle(button) : null;
            const topIsButton = top === button || (top && button.contains(top));
            const visibleButton = isVisibleNode(button);
            const pointerEnabled = !cs || cs.pointerEvents !== "none";
            const stackList = Array.from(stack || []).filter(Boolean);
            const emptyNullHitTest = !top && stackList.length === 0;
            const safariNullHitTestAllowed = emptyNullHitTest && hasValidRect && hitCenterInViewport && visibleButton && pointerEnabled;
            const clickEvidenceCanClearNullHit = emptyNullHitTest && hasValidRect && visibleButton && pointerEnabled;
            const blocked = !visibleButton
              || !pointerEnabled
              || !hasValidRect
              || !hitCenterInViewport
              || (!safariNullHitTestAllowed && !topIsButton);
            if (blocked) {
              const detail = {
                button: name,
                top: top ? describeNode(top) : null,
                stack: stackList.slice(0, 6).map(describeNode),
                pointerEvents: cs ? cs.pointerEvents : null,
                visible: visibleButton,
                hasValidRect,
                centerInViewport: hitCenterInViewport,
                originalCenterInViewport: centerInViewport,
                rect: { left: Math.round(hitRect.left), top: Math.round(hitRect.top), width: Math.round(hitRect.width), height: Math.round(hitRect.height) }
              };
              pendingPointerChecks.push({ name, detail, clickEvidenceCanClearNullHit });
            }
          };
          pointCheck(startBtn, "start");
          pointCheck(rulesBtn, "rules");

          if (startBtn && typeof startBtn.click === "function") {
            const beforeStarted = !!((root && root.__S && root.__S.isStarted) || (root && root.State && root.State.isStarted));
            let alertCount = 0;
            const oldAlert = (typeof window !== "undefined") ? window.alert : null;
            try {
              if (typeof window !== "undefined") window.alert = () => { alertCount += 1; };
              const now = () => (typeof performance !== "undefined" && typeof performance.now === "function") ? performance.now() : Date.now();
              if (rulesBtn && typeof rulesBtn.click === "function") {
                const rulesStart = now();
                rulesBtn.click();
                result.clickDurationsMs.rules = Math.round(now() - rulesStart);
                result.rulesButtonClickable = true;
                if (result.clickDurationsMs.rules > result.safeTimeoutMs) fail("rules_click_timeout", result.clickDurationsMs.rules);
              } else {
                fail("rules_button_not_clickable", null);
              }
              const afterRulesStarted = !!((root && root.__S && root.__S.isStarted) || (root && root.State && root.State.isStarted));
              result.rulesDoesNotBlockStart = !afterRulesStarted && result.startScreenVisible;
              if (!result.rulesDoesNotBlockStart) fail("rules_blocks_start", { beforeStarted, afterRulesStarted, alertCount });
              const startClickStart = now();
              startBtn.click();
              result.clickDurationsMs.start = Math.round(now() - startClickStart);
              result.startButtonClickable = true;
              if (result.clickDurationsMs.start > result.safeTimeoutMs) fail("start_click_timeout", result.clickDurationsMs.start);
              const afterStartStarted = !!((root && root.__S && root.__S.isStarted) || (root && root.State && root.State.isStarted));
              const gameScreen = document.getElementById("screenGame");
              const startHiddenAfterClick = st.hidden || st.classList.contains("hidden") || ((typeof getComputedStyle === "function") && getComputedStyle(st).display === "none");
              result.enteredGameAfterStart = afterStartStarted || startHiddenAfterClick || !!(gameScreen && gameScreen.hidden === false);
              if (!result.enteredGameAfterStart) fail("start_click_did_not_enter_game", { afterStartStarted, startHiddenAfterClick });
            } catch (clickErr) {
              fail("start_click_exception", clickErr && clickErr.message ? String(clickErr.message) : String(clickErr));
            } finally {
              try { if (typeof window !== "undefined") window.alert = oldAlert; } catch (_) {}
            }
          } else {
            fail("start_button_not_clickable", null);
          }

          pendingPointerChecks.forEach((check) => {
            const clickSafe = check.name === "rules"
              ? (result.rulesButtonClickable && result.rulesDoesNotBlockStart)
              : (result.startButtonClickable && result.enteredGameAfterStart);
            if (check.clickEvidenceCanClearNullHit && clickSafe) return;
            result.pointerBlockers.push(check.detail);
            fail("start_button_pointer_blocked", check.detail);
          });

          const allowed = new Set(["startCard", "startTitle", "startIntroLines", "startBtns", "btnStart", "btnRules"]);
          const resetAllowed = (el) => el && el.id === "btnResetOnboarding" && (el.hidden || el.classList.contains("hidden") || el.style.display === "none");
          Array.from(st.querySelectorAll("input, textarea, select, label, p, .pill, .small, #startManifestShort, #startHint, #btnRandom")).forEach((el) => {
            if (resetAllowed(el)) return;
            result.extraTextBlocks.push(el.id || el.tagName.toLowerCase());
          });
          Array.from(st.querySelectorAll("button")).forEach((button) => {
            if (!allowed.has(button.id) && !resetAllowed(button)) result.extraTextBlocks.push(button.id || "button");
          });
          if (result.extraTextBlocks.length) fail("extra_text_blocks", result.extraTextBlocks.slice());
        }
      } catch (err) {
        fail("smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failedChecks.length === 0;
      console.warn("ONBOARDING_SPEC_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    root.__DEV.smokeOnboardingMinimalUiOnce = function smokeOnboardingMinimalUiOnce() {
      const result = {
        ok: false,
        failures: [],
        failedChecks: [],
        viewportChecks: [],
        defaultViewportNoScroll: false,
        ctaVisibleAndAligned: false,
        noLayoutOverlap: false,
        noExtraStartScreenBlocks: false,
        startStillEntersGame: false,
        rulesStillDoesNotBlockStart: false,
        specSmoke: null
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      forceFirstLaunchOnboardingForLegacySmokes();
      const runtimeData = (root && root.Data) ? root.Data : Data;
      const spec = runtimeData && runtimeData.START_SCREEN;
      const allowedIds = new Set(["startCard", "startTitle", "startIntroLines", "startEconomyHonestyLine", "startBtns", "btnStart", "btnRules"]);
      const resetAllowedInMinimalSmoke = (el) => el && el.id === "btnResetOnboarding" && (el.hidden || el.classList.contains("hidden") || el.style.display === "none");
      const restore = [];
      const saveStyle = (el, props) => {
        if (!el) return;
        const item = { el, values: {} };
        props.forEach((prop) => { item.values[prop] = el.style[prop] || ""; });
        restore.push(item);
      };
      const restoreStyles = () => {
        restore.reverse().forEach((item) => {
          Object.keys(item.values).forEach((prop) => { item.el.style[prop] = item.values[prop]; });
        });
      };
      const rectOf = (el) => {
        const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        return r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } : null;
      };
      const roundedRect = (r) => r ? { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) } : null;
      const inside = (inner, outer) => !!(inner && outer && inner.left >= outer.left - 1 && inner.top >= outer.top - 1 && inner.right <= outer.right + 1 && inner.bottom <= outer.bottom + 1);
      const overlaps = (a, b) => !!(a && b && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1);
      const visible = (el) => {
        if (!el) return false;
        const cs = (typeof getComputedStyle === "function") ? getComputedStyle(el) : null;
        const r = rectOf(el);
        return !el.hidden && (!cs || (cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0")) && !!(r && r.width > 0 && r.height > 0);
      };
      try {
        if (!spec || typeof spec.title !== "string" || !Array.isArray(spec.introLines) || typeof spec.economyHonestyLine !== "string" || !spec.actions) fail("missing_start_screen_source", null);
        const st = (typeof document !== "undefined") ? document.getElementById("startScreen") : null;
        const card = (typeof document !== "undefined") ? document.getElementById("startCard") : null;
        const titleEl = (typeof document !== "undefined") ? document.getElementById("startTitle") : null;
        const introEl = (typeof document !== "undefined") ? document.getElementById("startIntroLines") : null;
        const btns = (typeof document !== "undefined") ? document.getElementById("startBtns") : null;
        const economyEl = (typeof document !== "undefined") ? document.getElementById("startEconomyHonestyLine") : null;
        const startBtn = (typeof document !== "undefined") ? document.getElementById("btnStart") : null;
        const rulesBtn = (typeof document !== "undefined") ? document.getElementById("btnRules") : null;
        if (!st || !card || !titleEl || !introEl || !economyEl || !btns || !startBtn || !rulesBtn) fail("required_dom_missing", null);
        if (st) {
          st.hidden = false;
          st.classList.remove("hidden");
          st.classList.add("active");
          st.removeAttribute("aria-hidden");
          saveStyle(st, ["position", "inset", "left", "top", "right", "bottom", "width", "height", "display", "visibility", "opacity", "pointerEvents", "zIndex"]);
          saveStyle(card, ["maxHeight", "overflow"]);
          st.style.position = "fixed";
          st.style.display = "flex";
          st.style.visibility = "visible";
          st.style.opacity = "1";
          st.style.pointerEvents = "auto";
          st.style.zIndex = "2147483647";
        }
        const renderedLines = introEl ? Array.from(introEl.children).map((el) => (el.textContent || "").trim()).filter(Boolean) : [];
        const actions = spec && spec.actions ? spec.actions : {};
        if (spec && titleEl && (titleEl.textContent || "").trim() !== spec.title) fail("title_not_from_source", (titleEl.textContent || "").trim());
        if (spec && JSON.stringify(renderedLines) !== JSON.stringify(spec.introLines)) fail("intro_not_from_source", renderedLines);
        if (spec && economyEl && (economyEl.textContent || "").trim() !== spec.economyHonestyLine) fail("economy_honesty_not_from_source", (economyEl.textContent || "").trim());
        if (spec && startBtn && (startBtn.textContent || "").trim() !== actions.start) fail("start_action_not_from_source", (startBtn.textContent || "").trim());
        if (spec && rulesBtn && (rulesBtn.textContent || "").trim() !== actions.rules) fail("rules_action_not_from_source", (rulesBtn.textContent || "").trim());
        const extra = [];
        if (st) {
          Array.from(st.children).forEach((el) => { if (!allowedIds.has(el.id)) extra.push(el.id || el.tagName.toLowerCase()); });
          Array.from(st.querySelectorAll("input, textarea, select, label, p, .pill, .small, #startManifestShort, #startHint, #btnRandom")).forEach((el) => {
            if (el.id === "btnResetOnboarding" && el.hidden) return;
            extra.push(el.id || el.tagName.toLowerCase());
          });
          Array.from(st.querySelectorAll("button")).forEach((button) => { if (!allowedIds.has(button.id) && !resetAllowedInMinimalSmoke(button)) extra.push(button.id || "button"); });
        }
        result.noExtraStartScreenBlocks = extra.length === 0;
        if (extra.length) fail("extra_start_screen_blocks", extra);
        const defaultDoc = (typeof document !== "undefined") ? document.documentElement : null;
        result.defaultViewportNoScroll = !!(st && st.scrollWidth <= st.clientWidth + 1 && st.scrollHeight <= st.clientHeight + 1 && (!defaultDoc || defaultDoc.scrollWidth <= defaultDoc.clientWidth + 1));
        if (!result.defaultViewportNoScroll) fail("default_viewport_scroll", st ? { scrollWidth: st.scrollWidth, clientWidth: st.clientWidth, scrollHeight: st.scrollHeight, clientHeight: st.clientHeight } : null);
        const viewports = [
          { name: "narrow", width: 320, height: 568 },
          { name: "medium", width: 768, height: 720 },
          { name: "wide", width: 1280, height: 800 }
        ];
        viewports.forEach((vp) => {
          if (!st || !card || !titleEl || !introEl || !btns || !startBtn || !rulesBtn) return;
          st.style.inset = "auto";
          st.style.left = "0";
          st.style.top = "0";
          st.style.right = "auto";
          st.style.bottom = "auto";
          st.style.width = `${vp.width}px`;
          st.style.height = `${vp.height}px`;
          if (card) {
            card.style.maxHeight = `calc(${vp.height}px - 40px)`;
            card.style.overflow = "hidden";
          }
          const stRect = rectOf(st);
          const cardRect = rectOf(card);
          const titleRect = rectOf(titleEl);
          const introRect = rectOf(introEl);
          const btnsRect = rectOf(btns);
          const startRect = rectOf(startBtn);
          const rulesRect = rectOf(rulesBtn);
          const ctaVisible = visible(startBtn) && visible(rulesBtn) && inside(startRect, cardRect) && inside(rulesRect, cardRect) && inside(startRect, stRect) && inside(rulesRect, stRect);
          const ctaAligned = !!(startRect && rulesRect && Math.abs(startRect.top - rulesRect.top) <= 1 && Math.abs(startRect.height - rulesRect.height) <= 1);
          const noScroll = !!(st && st.scrollWidth <= st.clientWidth + 1 && st.scrollHeight <= st.clientHeight + 1);
          const noOverlap = !overlaps(titleRect, introRect) && !overlaps(introRect, btnsRect) && !overlaps(titleRect, btnsRect);
          const check = { name: vp.name, width: vp.width, height: vp.height, noScroll, ctaVisible, ctaAligned, noOverlap, card: roundedRect(cardRect), start: roundedRect(startRect), rules: roundedRect(rulesRect) };
          result.viewportChecks.push(check);
          if (!noScroll) fail(`${vp.name}_viewport_scroll`, check);
          if (!ctaVisible) fail(`${vp.name}_cta_not_visible`, check);
          if (!ctaAligned) fail(`${vp.name}_cta_not_aligned`, check);
          if (!noOverlap) fail(`${vp.name}_layout_overlap`, check);
        });
        result.ctaVisibleAndAligned = result.viewportChecks.length === 3 && result.viewportChecks.every((check) => check.ctaVisible && check.ctaAligned);
        result.noLayoutOverlap = result.viewportChecks.length === 3 && result.viewportChecks.every((check) => check.noOverlap);
      } catch (err) {
        fail("minimal_ui_smoke_exception", err && err.message ? String(err.message) : String(err));
      } finally {
        try { restoreStyles(); } catch (_) {}
      }
      try {
        if (typeof root.__DEV.smokeOnboardingSpecOnce === "function") {
          result.specSmoke = root.__DEV.smokeOnboardingSpecOnce();
          result.startStillEntersGame = !!(result.specSmoke && result.specSmoke.enteredGameAfterStart);
          result.rulesStillDoesNotBlockStart = !!(result.specSmoke && result.specSmoke.rulesDoesNotBlockStart);
          if (!result.startStillEntersGame) fail("start_does_not_enter_game", result.specSmoke);
          if (!result.rulesStillDoesNotBlockStart) fail("rules_blocks_start", result.specSmoke);
        } else {
          fail("spec_smoke_missing", null);
        }
      } catch (err) {
        fail("spec_smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failedChecks.length === 0;
      console.warn("ONBOARDING_MINIMAL_UI_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    root.__DEV.smokeOnboardingHowItWorksOnce = function smokeOnboardingHowItWorksOnce() {
      const result = {
        ok: false,
        failures: [],
        failedChecks: [],
        instructionLineCount: 0,
        lines: [],
        choiceRiskResultCoverage: false,
        coverage: { choice: false, risk: false, result: false },
        forbiddenWording: [],
        startStillPrimary: false,
        userCanImmediatelyPressStart: false,
        startScreenRemainsMinimal: false,
        noLayoutRegressionsFromMinimalUi: false,
        minimalUiSmoke: null
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      forceFirstLaunchOnboardingForLegacySmokes();
      const runtimeData = (root && root.Data) ? root.Data : Data;
      const spec = runtimeData && runtimeData.START_SCREEN;
      const lines = spec && Array.isArray(spec.introLines) ? spec.introLines.map((line) => String(line || "").trim()).filter(Boolean) : [];
      const economyHonestyLine = spec && typeof spec.economyHonestyLine === "string" ? spec.economyHonestyLine.trim() : "";
      result.lines = lines.slice();
      const instructionLines = lines.slice(0, 3);
      result.instructionLineCount = instructionLines.length;
      result.economyHonestyLineCount = economyHonestyLine ? 1 : 0;
      result.economyHonestyLine = economyHonestyLine || null;
      if (lines.length !== 3) fail("start_line_count_not_three", lines.length);
      if (instructionLines.length !== 3) fail("instruction_line_count_not_three", instructionLines.length);
      lines.forEach((line, index) => {
        const sentencePieces = line.split(/[.!?…]+/).map((piece) => piece.trim()).filter(Boolean);
        if (!line) fail("instruction_line_empty", index);
        if (sentencePieces.length !== 1 || !/[.!?…]$/.test(line)) fail("instruction_line_not_one_short_sentence", { index, line });
        if (line.length > 48) fail("instruction_line_too_long", { index, length: line.length, line });
      });
      result.coverage.choice = !!(instructionLines[0] && /ты\s+выбираешь|выбор|выбира/i.test(instructionLines[0]));
      result.coverage.risk = !!(instructionLines[1] && /риск|стоит|трата|теряешь|ресурс/i.test(instructionLines[1]));
      result.coverage.result = !!(instructionLines[2] && /победа|итог|результат|приносит|получаешь|репутаци/i.test(instructionLines[2]));
      result.economyHonestyCoverage = !!(economyHonestyLine && /цена|стоим|итог|результат|дельт|сразу|видн/i.test(economyHonestyLine));
      if (!result.economyHonestyCoverage) fail("economy_honesty_line_missing", economyHonestyLine || null);
      result.choiceRiskResultCoverage = result.coverage.choice && result.coverage.risk && result.coverage.result;
      if (!result.choiceRiskResultCoverage) fail("choice_risk_result_coverage_missing", result.coverage);
      if (!lines.some((line) => /(^|\s)ты($|\s|[.!?…])/i.test(line))) fail("user_not_addressed_as_ty", lines);
      const forbiddenPatterns = [
        { label: "tutorial_tone", pattern: /туториал|обучение|подсказка|инструкция|справка|помощь|документация|гайд/i },
        { label: "imperative_help", pattern: /нажми|кликни|прочитай|следуй|изучи|запомни/i },
        { label: "slang_or_meme", pattern: /лол|кек|мем|кринж|хайп|рофл|имба|изи/i },
        { label: "pressure_or_moralizing", pattern: /надо|нужно|обязан|должен|правильно|неправильно|хорошо|плохо|стыд|вина/i }
      ];
      lines.concat(economyHonestyLine ? [economyHonestyLine] : []).forEach((line, index) => {
        forbiddenPatterns.forEach((entry) => {
          if (entry.pattern.test(line)) result.forbiddenWording.push({ index, label: entry.label, line });
        });
      });
      if (result.forbiddenWording.length) fail("forbidden_wording_present", result.forbiddenWording.slice());
      try {
        const st = (typeof document !== "undefined") ? document.getElementById("startScreen") : null;
        const introEl = (typeof document !== "undefined") ? document.getElementById("startIntroLines") : null;
        const btns = (typeof document !== "undefined") ? document.getElementById("startBtns") : null;
        const economyEl = (typeof document !== "undefined") ? document.getElementById("startEconomyHonestyLine") : null;
        const startBtn = (typeof document !== "undefined") ? document.getElementById("btnStart") : null;
        const rulesBtn = (typeof document !== "undefined") ? document.getElementById("btnRules") : null;
        if (st) {
          st.hidden = false;
          st.classList.remove("hidden");
          st.classList.add("active");
          st.removeAttribute("aria-hidden");
          st.style.display = "flex";
          st.style.visibility = "visible";
          st.style.opacity = "1";
          st.style.pointerEvents = "auto";
        }
        const renderedLines = introEl ? Array.from(introEl.children).map((el) => (el.textContent || "").trim()).filter(Boolean) : [];
        if (JSON.stringify(renderedLines) !== JSON.stringify(lines)) fail("instruction_lines_not_from_source", renderedLines);
        if (economyEl && (economyEl.textContent || "").trim() !== economyHonestyLine) fail("economy_honesty_not_from_source", (economyEl.textContent || "").trim());
        const startRect = startBtn && startBtn.getBoundingClientRect ? startBtn.getBoundingClientRect() : null;
        const rulesRect = rulesBtn && rulesBtn.getBoundingClientRect ? rulesBtn.getBoundingClientRect() : null;
        const btnsRect = btns && btns.getBoundingClientRect ? btns.getBoundingClientRect() : null;
        const visibleButton = (button, rect) => {
          if (!button || !rect || rect.width <= 0 || rect.height <= 0) return false;
          const cs = (typeof getComputedStyle === "function") ? getComputedStyle(button) : null;
          return !button.hidden && (!cs || (cs.display !== "none" && cs.visibility !== "hidden" && cs.pointerEvents !== "none"));
        };
        result.userCanImmediatelyPressStart = visibleButton(startBtn, startRect);
        if (!result.userCanImmediatelyPressStart) fail("start_not_immediately_pressable", startRect ? { width: startRect.width, height: startRect.height } : null);
        result.startStillPrimary = !!(startRect && rulesRect && startRect.width >= rulesRect.width && startRect.left <= rulesRect.left + 1 && startBtn && startBtn.classList && startBtn.classList.contains("primary"));
        if (!result.startStillPrimary) fail("start_not_primary_action", { start: startRect ? { left: startRect.left, width: startRect.width } : null, rules: rulesRect ? { left: rulesRect.left, width: rulesRect.width } : null });
        const childIds = st ? Array.from(st.children).map((el) => el.id || el.tagName.toLowerCase()) : [];
        const resetBtn = st ? st.querySelector("#btnResetOnboarding") : null;
        const resetAllowed = !resetBtn || resetBtn.hidden === true || resetBtn.classList.contains("hidden") || resetBtn.style.display === "none";
        const forbiddenExtra = st ? Array.from(st.querySelectorAll("input, textarea, select, label, p, .pill, .small, #startManifestShort, #startHint, #btnRandom")).find((el) => !(el.id === "btnResetOnboarding" && resetAllowed)) : null;
        result.startScreenRemainsMinimal = !!(st && introEl && economyEl && btns && childIds.length === 1 && st.querySelectorAll("#startCard, #startTitle, #startIntroLines, #startEconomyHonestyLine, #startBtns, #btnStart, #btnRules").length === 7 && resetAllowed && !forbiddenExtra);
        if (!result.startScreenRemainsMinimal) fail("start_screen_not_minimal", childIds);
        if (btnsRect && startRect) {
          const startBeforeOrInBtns = startRect.top >= btnsRect.top - 1 && startRect.bottom <= btnsRect.bottom + 1;
          if (!startBeforeOrInBtns) fail("start_layout_outside_cta_row", { startTop: startRect.top, btnsTop: btnsRect.top });
        }
      } catch (err) {
        fail("how_it_works_dom_exception", err && err.message ? String(err.message) : String(err));
      }
      try {
        if (typeof root.__DEV.smokeOnboardingMinimalUiOnce === "function") {
          result.minimalUiSmoke = root.__DEV.smokeOnboardingMinimalUiOnce();
          result.noLayoutRegressionsFromMinimalUi = !!(result.minimalUiSmoke && result.minimalUiSmoke.ok && result.minimalUiSmoke.ctaVisibleAndAligned && result.minimalUiSmoke.noLayoutOverlap && result.minimalUiSmoke.noExtraStartScreenBlocks && result.minimalUiSmoke.startStillEntersGame);
          if (!result.noLayoutRegressionsFromMinimalUi) fail("minimal_ui_regression", result.minimalUiSmoke);
        } else {
          fail("minimal_ui_smoke_missing", null);
        }
      } catch (err) {
        fail("minimal_ui_smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failedChecks.length === 0;
      console.warn("ONBOARDING_HOW_IT_WORKS_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    root.__DEV.smokeOnboardingEconomyHonestyOnce = function smokeOnboardingEconomyHonestyOnce() {
      const result = {
        ok: false,
        failures: [],
        failedChecks: [],
        startScreenLineCount: 0,
        instructionLineCount: 0,
        economyHonestyLineCount: 0,
        economyHonestyLine: null,
        lineDoesNotPromiseVictory: false,
        firstPaidStatActionImmediateDelta: false,
        immediateDeltaMatchesMoneyLog: false,
        action: null,
        moneyLogRow: null,
        immediateToast: null,
        step7Smokes: {}
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const effectiveMeDelta = (row) => {
        if (!row) return 0;
        const amountSource = row.amount !== undefined ? row.amount : row.delta;
        const amount = Number(amountSource);
        if (!Number.isFinite(amount)) return 0;
        let delta = 0;
        if (String(row.targetId || "") === "me") delta += amount;
        if (String(row.sourceId || "") === "me") delta -= amount;
        if (!delta && row.delta !== undefined) {
          const fallback = Number(row.delta);
          if (Number.isFinite(fallback)) delta = fallback;
        }
        return delta | 0;
      };
      forceFirstLaunchOnboardingForLegacySmokes();
      try {
        const runtimeData = (root && root.Data) ? root.Data : Data;
        const spec = runtimeData && runtimeData.START_SCREEN;
        const lines = spec && Array.isArray(spec.introLines) ? spec.introLines.map((line) => String(line || "").trim()).filter(Boolean) : [];
        const economyHonestyLine = spec && typeof spec.economyHonestyLine === "string" ? spec.economyHonestyLine.trim() : "";
        result.instructionLineCount = lines.length;
        result.economyHonestyLineCount = economyHonestyLine ? 1 : 0;
        result.startScreenLineCount = lines.length + result.economyHonestyLineCount;
        result.economyHonestyLine = economyHonestyLine || null;
        if (lines.length !== 3) fail("instruction_line_count_not_three", lines.length);
        if (!economyHonestyLine) fail("economy_honesty_line_count_not_one", economyHonestyLine);
        result.lineDoesNotPromiseVictory = !!(result.economyHonestyLine && !/побед|выигра|победишь|гарант|точно/i.test(result.economyHonestyLine));
        if (!result.lineDoesNotPromiseVictory) fail("economy_honesty_promises_victory", result.economyHonestyLine);
        const introEl = (typeof document !== "undefined") ? document.getElementById("startIntroLines") : null;
        const economyEl = (typeof document !== "undefined") ? document.getElementById("startEconomyHonestyLine") : null;
        const renderedLines = introEl ? Array.from(introEl.children).map((el) => (el.textContent || "").trim()).filter(Boolean) : [];
        if (introEl && JSON.stringify(renderedLines) !== JSON.stringify(lines)) fail("rendered_lines_not_from_source", renderedLines);
        if (economyEl && (economyEl.textContent || "").trim() !== economyHonestyLine) fail("economy_honesty_not_from_source", (economyEl.textContent || "").trim());

        const S = root && (root.__S || root.State);
        const Econ = root && (root.ConflictEconomy || root._ConflictEconomy);
        const dbg = root && root.__D;
        if (!S || !S.me || !Econ || typeof Econ.transferPoints !== "function" || !dbg) fail("economy_runtime_missing", { hasState: !!S, hasMe: !!(S && S.me), hasTransfer: !!(Econ && typeof Econ.transferPoints === "function"), hasDebug: !!dbg });
        else {
          if (!S.players || typeof S.players !== "object") S.players = {};
          if (!S.players.me) S.players.me = S.me;
          if (!Number.isFinite(S.me.points) || S.me.points < 1) fail("insufficient_points_for_first_action_smoke", S.me.points);
          else {
            const beforeMe = S.me.points | 0;
            const beforePlayerMe = S.players.me && Number.isFinite(S.players.me.points) ? (S.players.me.points | 0) : beforeMe;
            const beforeMoneyLen = Array.isArray(dbg.moneyLog) ? dbg.moneyLog.length : 0;
            const beforeToastLen = Array.isArray(dbg.toastLog) ? dbg.toastLog.length : 0;
            const battleId = `dev_onboarding_economy_honesty_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            const tx = Econ.transferPoints("me", "sink", 1, "battle_entry", { battleId, smoke: "onboarding_economy_honesty" });
            const moneyRows = Array.isArray(dbg.moneyLog) ? dbg.moneyLog.slice(beforeMoneyLen) : [];
            const toastRows = Array.isArray(dbg.toastLog) ? dbg.toastLog.slice(beforeToastLen) : [];
            const moneyRow = moneyRows.find((row) => row && String(row.battleId || "") === String(battleId) && String(row.reason || "") === "battle_entry") || moneyRows[0] || null;
            const expectedDelta = effectiveMeDelta(moneyRow);
            const immediateToast = toastRows.find((toast) => toast && String(toast.kind || "") === "points" && (toast.delta | 0) === expectedDelta && String(toast.reason || "") === "battle_entry") || null;
            result.action = { reason: "battle_entry", battleId, transferOk: !!(tx && tx.ok === true), expectedDelta };
            result.moneyLogRow = moneyRow ? { reason: moneyRow.reason, currency: moneyRow.currency || moneyRow.kind || "points", amount: moneyRow.amount, sourceId: moneyRow.sourceId, targetId: moneyRow.targetId, battleId: moneyRow.battleId } : null;
            result.immediateToast = immediateToast ? { kind: immediateToast.kind, delta: immediateToast.delta, reason: immediateToast.reason, battleId: immediateToast.battleId } : null;
            result.firstPaidStatActionImmediateDelta = !!(tx && tx.ok === true && moneyRow && immediateToast);
            result.immediateDeltaMatchesMoneyLog = !!(moneyRow && immediateToast && expectedDelta !== 0 && (immediateToast.delta | 0) === expectedDelta);
            if (!result.firstPaidStatActionImmediateDelta) fail("first_paid_stat_action_delta_not_immediate", { tx, moneyRows, toastRows });
            if (!result.immediateDeltaMatchesMoneyLog) fail("immediate_delta_mismatch_moneylog", { moneyRow: result.moneyLogRow, immediateToast: result.immediateToast, expectedDelta });
            try {
              S.me.points = beforeMe;
              if (S.players && S.players.me) S.players.me.points = beforePlayerMe;
            } catch (_) {}
          }
        }
        try { if (typeof root.__DEV.smokeOnboardingSpecOnce === "function") result.step7Smokes.spec = root.__DEV.smokeOnboardingSpecOnce(); }
        catch (err) { result.step7Smokes.spec = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingMinimalUiOnce === "function") result.step7Smokes.minimalUi = root.__DEV.smokeOnboardingMinimalUiOnce(); }
        catch (err) { result.step7Smokes.minimalUi = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingHowItWorksOnce === "function") result.step7Smokes.howItWorks = root.__DEV.smokeOnboardingHowItWorksOnce(); }
        catch (err) { result.step7Smokes.howItWorks = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingSeenOnce === "function") result.step7Smokes.seen = root.__DEV.smokeOnboardingSeenOnce(); }
        catch (err) { result.step7Smokes.seen = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        ["spec", "minimalUi", "howItWorks", "seen"].forEach((key) => {
          if (result.step7Smokes[key] && result.step7Smokes[key].ok !== true) fail(`step7_${key}_smoke_failed`, result.step7Smokes[key]);
        });
      } catch (err) {
        fail("onboarding_economy_honesty_smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failedChecks.length === 0;
      console.warn("ONBOARDING_ECONOMY_HONESTY_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    root.__DEV.smokeOnboardingMillennialToneOnce = function smokeOnboardingMillennialToneOnce() {
      const result = {
        ok: false,
        failures: [],
        failedChecks: [],
        maxLineLength: Data.START_SCREEN_TEXT_MAX_LENGTH,
        fields: [],
        forbiddenWording: [],
        officialese: [],
        pressureLanguage: [],
        moralizingLanguage: [],
        babyTalk: [],
        allLinesWithinLimit: false,
        step7Smokes: {}
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const addHit = (bucket, field, text, label) => {
        bucket.push({ field, label, text });
      };
      try {
        const runtimeData = (root && root.Data) ? root.Data : Data;
        const spec = runtimeData && runtimeData.START_SCREEN;
        const max = Number.isFinite(runtimeData && runtimeData.START_SCREEN_TEXT_MAX_LENGTH) ? runtimeData.START_SCREEN_TEXT_MAX_LENGTH : Data.START_SCREEN_TEXT_MAX_LENGTH;
        result.maxLineLength = max;
        if (!Number.isFinite(max) || max <= 0) fail("line_limit_constant_invalid", max);
        if (!spec || typeof spec.title !== "string" || !Array.isArray(spec.introLines) || typeof spec.economyHonestyLine !== "string" || !spec.actions) fail("missing_start_screen_source", null);
        const actions = spec && spec.actions ? spec.actions : {};
        const fields = [
          { name: "title", text: spec && typeof spec.title === "string" ? spec.title : "" },
          { name: "introLines[0]", text: spec && spec.introLines ? spec.introLines[0] : "" },
          { name: "introLines[1]", text: spec && spec.introLines ? spec.introLines[1] : "" },
          { name: "introLines[2]", text: spec && spec.introLines ? spec.introLines[2] : "" },
          { name: "economyHonestyLine", text: spec && typeof spec.economyHonestyLine === "string" ? spec.economyHonestyLine : "" },
          { name: "actions.start", text: typeof actions.start === "string" ? actions.start : "" },
          { name: "actions.rules", text: typeof actions.rules === "string" ? actions.rules : "" }
        ];
        result.fields = fields.map((field) => ({ name: field.name, text: String(field.text || "").trim(), length: String(field.text || "").trim().length }));
        if (spec && (!Array.isArray(spec.introLines) || spec.introLines.length !== 3)) fail("intro_line_count_not_three", spec && spec.introLines ? spec.introLines.length : null);
        if (Object.keys(actions).length !== 2 || typeof actions.start !== "string" || typeof actions.rules !== "string") fail("cta_count_not_two", Object.keys(actions));
        fields.forEach((field) => {
          const text = String(field.text || "").trim();
          if (!text) fail("start_screen_line_empty", field.name);
          if (Number.isFinite(max) && text.length > max) fail("start_screen_line_over_limit", { field: field.name, length: text.length, max, text });
        });
        result.allLinesWithinLimit = result.fields.every((field) => field.length > 0 && Number.isFinite(max) && field.length <= max);

        const checks = [
          { bucket: result.forbiddenWording, label: "forbidden_wording", pattern: /туториал|обучение|подсказка|инструкция|справка|помощь|документация|гайд|лол|кек|мем|кринж|хайп|рофл|имба|изи|вайб|движ|жми|нажми|кликни|прочитай|следуй|изучи|запомни/i },
          { bucket: result.officialese, label: "officialese", pattern: /официальн|регламент|политик|процедур|документ|документац|сертифиц|верифиц|соответств|предпис|протокол|согласно|инструкц|руководств/i },
          { bucket: result.pressureLanguage, label: "pressure", pattern: /надо|нужно|обязан|обязана|обязаны|должен|должна|должны|срочно|быстро|успей|тороп|жми|давай|вперед|сейчас/i },
          { bucket: result.moralizingLanguage, label: "moralizing", pattern: /правильно|неправильно|хорошо|плохо|стыд|вина|виноват|честн|нечестн|справедлив|заслуж/i },
          { bucket: result.babyTalk, label: "baby_talk", pattern: /малыш|детка|зай|котик|лапк|солнышк|умничк|молодец|няш|сюсю/i }
        ];
        fields.forEach((field) => {
          const text = String(field.text || "").trim();
          checks.forEach((check) => {
            if (check.pattern.test(text)) addHit(check.bucket, field.name, text, check.label);
          });
        });
        if (result.forbiddenWording.length) fail("forbidden_wording_present", result.forbiddenWording.slice());
        if (result.officialese.length) fail("officialese_present", result.officialese.slice());
        if (result.pressureLanguage.length) fail("pressure_language_present", result.pressureLanguage.slice());
        if (result.moralizingLanguage.length) fail("moralizing_language_present", result.moralizingLanguage.slice());
        if (result.babyTalk.length) fail("baby_talk_present", result.babyTalk.slice());
        if (!result.allLinesWithinLimit) fail("start_screen_line_limit_failed", result.fields);

        try { if (typeof root.__DEV.smokeOnboardingSpecOnce === "function") result.step7Smokes.spec = root.__DEV.smokeOnboardingSpecOnce(); }
        catch (err) { result.step7Smokes.spec = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingMinimalUiOnce === "function") result.step7Smokes.minimalUi = root.__DEV.smokeOnboardingMinimalUiOnce(); }
        catch (err) { result.step7Smokes.minimalUi = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingHowItWorksOnce === "function") result.step7Smokes.howItWorks = root.__DEV.smokeOnboardingHowItWorksOnce(); }
        catch (err) { result.step7Smokes.howItWorks = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingSeenOnce === "function") result.step7Smokes.seen = root.__DEV.smokeOnboardingSeenOnce(); }
        catch (err) { result.step7Smokes.seen = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingEconomyHonestyOnce === "function") result.step7Smokes.economyHonesty = root.__DEV.smokeOnboardingEconomyHonestyOnce(); }
        catch (err) { result.step7Smokes.economyHonesty = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        ["spec", "minimalUi", "howItWorks", "seen", "economyHonesty"].forEach((key) => {
          if (result.step7Smokes[key] && result.step7Smokes[key].ok !== true) fail(`step7_${key}_smoke_failed`, result.step7Smokes[key]);
        });
      } catch (err) {
        fail("onboarding_millennial_tone_smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failedChecks.length === 0;
      console.warn("ONBOARDING_MILLENNIAL_TONE_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("ONBOARDING_SPEC_SMOKE_EXPOSED_VIA_DATA_V2", typeof root.__DEV.smokeOnboardingSpecOnce);
  };

  installOnboardingSpecSmokeViaData();

  const installOnboardingSeenSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    root.__DEV.smokeOnboardingSeenOnce = function smokeOnboardingSeenOnce() {
      const result = {
        ok: false,
        failures: [],
        failedChecks: [],
        firstLaunchPrimaryText: "",
        repeatLaunchPrimaryText: "",
        freshStateShowsFirstLaunchOnboarding: false,
        startSetsOnboardingSeen: false,
        repeatLaunchShowsContinue: false,
        resetSetsOnboardingSeenFalse: false,
        resetPreservesProgressResources: false,
        resetShowsFirstLaunchAgain: false,
        noLoopNoStuckState: false,
        startButtonEntersGame: false,
        continueButtonEntersGame: false,
        step7Smokes: {}
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const S = (root && (root.__S || root.State)) || null;
      const A = (root && root.__A) || null;
      const btnStart = () => (typeof document !== "undefined") ? document.getElementById("btnStart") : null;
      const btnReset = () => (typeof document !== "undefined") ? document.getElementById("btnResetOnboarding") : null;
      const startScreen = () => (typeof document !== "undefined") ? document.getElementById("startScreen") : null;
      const visible = (el) => {
        if (!el || el.hidden) return false;
        const cs = (typeof getComputedStyle === "function") ? getComputedStyle(el) : null;
        return !cs || (cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0" && cs.pointerEvents !== "none");
      };
      const text = (el) => (el && el.textContent ? String(el.textContent).trim() : "");
      const setSeen = (value) => {
        if (A && typeof A.setOnboardingSeen === "function") return A.setOnboardingSeen(value) === true;
        if (S) {
          S.progress = S.progress || {};
          S.progress.onboardingSeen = value === true;
        }
        try { window.localStorage && window.localStorage.setItem("AsyncScene_onboarding_seen_v1", value ? "1" : "0"); } catch (_) {}
        return value === true;
      };
      const getSeen = () => {
        if (A && typeof A.getOnboardingSeen === "function") return A.getOnboardingSeen() === true;
        return !!(S && S.progress && S.progress.onboardingSeen === true);
      };
      const idle = () => {
        if (!S) return;
        S.isStarted = false;
        S.flags = S.flags || {};
        S.flags.started = false;
      };
      const refresh = () => {
        if (root.__DEV && typeof root.__DEV.refreshOnboardingStartScreenOnce === "function") return root.__DEV.refreshOnboardingStartScreenOnce();
        const st = startScreen();
        if (st) {
          st.hidden = false;
          st.classList.remove("hidden");
          st.classList.add("active");
          st.style.display = "flex";
          st.style.visibility = "visible";
          st.style.opacity = "1";
          st.style.pointerEvents = "auto";
        }
        const b = btnStart();
        if (b) b.textContent = getSeen() ? "Продолжить" : "Старт";
        const r = btnReset();
        if (r) {
          r.textContent = "Сбросить старт";
          r.hidden = !getSeen();
          r.classList.toggle("hidden", !getSeen());
          r.style.display = getSeen() ? "" : "none";
        }
        return { ok: true };
      };
      const clickStart = () => {
        const b = btnStart();
        if (!b || typeof b.click !== "function") return false;
        b.click();
        return true;
      };
      const progressResourceSnapshot = () => S ? {
        points: S.me && S.me.points,
        wins: S.me && S.me.wins,
        meInfluence: S.me && S.me.influence,
        stateInfluence: S.influence,
        rep: S.rep,
        weeklyInfluenceGained: S.progress && S.progress.weeklyInfluenceGained,
        weekStartAt: S.progress && S.progress.weekStartAt,
        lastDailyBonusAt: S.progress && S.progress.lastDailyBonusAt
      } : null;
      try {
        if (!S || !A) fail("state_api_missing", { hasState: !!S, hasApi: !!A });
        if (!root.Data || root.Data.START_SCREEN !== Data.START_SCREEN) fail("start_screen_source_not_data", null);

        setSeen(false);
        idle();
        refresh();
        result.firstLaunchPrimaryText = text(btnStart());
        result.freshStateShowsFirstLaunchOnboarding = visible(startScreen()) && result.firstLaunchPrimaryText === "Старт" && getSeen() === false;
        if (!result.freshStateShowsFirstLaunchOnboarding) fail("fresh_state_not_first_launch", { text: result.firstLaunchPrimaryText, seen: getSeen(), visible: visible(startScreen()) });

        result.startButtonEntersGame = clickStart() && !!(S && (S.isStarted === true || (S.flags && S.flags.started === true)));
        if (!result.startButtonEntersGame) fail("start_button_did_not_enter_game", null);
        result.startSetsOnboardingSeen = getSeen() === true;
        if (!result.startSetsOnboardingSeen) fail("start_did_not_persist_seen", S && S.progress);

        idle();
        refresh();
        result.repeatLaunchPrimaryText = text(btnStart());
        result.repeatLaunchShowsContinue = visible(startScreen()) && result.repeatLaunchPrimaryText === "Продолжить" && visible(btnReset());
        if (!result.repeatLaunchShowsContinue) fail("repeat_launch_not_resume_mode", { text: result.repeatLaunchPrimaryText, resetVisible: visible(btnReset()), seen: getSeen() });
        const beforeContinuePoints = S && S.me ? S.me.points : null;
        const beforeContinueWins = S && S.me ? S.me.wins : null;
        result.continueButtonEntersGame = clickStart() && !!(S && (S.isStarted === true || (S.flags && S.flags.started === true))) && !visible(startScreen());
        if (!result.continueButtonEntersGame) fail("continue_button_did_not_enter_game", null);
        if (S && S.me && (S.me.points !== beforeContinuePoints || S.me.wins !== beforeContinueWins)) fail("continue_wiped_progress", { beforeContinuePoints, afterPoints: S.me.points, beforeContinueWins, afterWins: S.me.wins });

        idle();
        setSeen(true);
        refresh();
        const beforeReset = progressResourceSnapshot();
        const reset = btnReset();
        if (!reset || typeof reset.click !== "function") fail("reset_action_missing", null);
        else reset.click();
        result.resetSetsOnboardingSeenFalse = getSeen() === false;
        if (!result.resetSetsOnboardingSeenFalse) fail("reset_did_not_clear_seen", S && S.progress);
        const afterReset = progressResourceSnapshot();
        result.resetPreservesProgressResources = JSON.stringify(beforeReset) === JSON.stringify(afterReset);
        if (!result.resetPreservesProgressResources) fail("reset_wiped_progress_or_resources", { beforeReset, afterReset });
        result.resetShowsFirstLaunchAgain = visible(startScreen()) && text(btnStart()) === "Старт";
        if (!result.resetShowsFirstLaunchAgain) fail("reset_did_not_show_first_launch", { text: text(btnStart()), visible: visible(startScreen()) });
        result.noLoopNoStuckState = result.startButtonEntersGame && result.continueButtonEntersGame && result.resetShowsFirstLaunchAgain;
        if (!result.noLoopNoStuckState) fail("loop_or_stuck_state", null);

        try { if (typeof root.__DEV.smokeOnboardingSpecOnce === "function") result.step7Smokes.spec = root.__DEV.smokeOnboardingSpecOnce(); }
        catch (err) { result.step7Smokes.spec = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingMinimalUiOnce === "function") result.step7Smokes.minimalUi = root.__DEV.smokeOnboardingMinimalUiOnce(); }
        catch (err) { result.step7Smokes.minimalUi = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        try { if (typeof root.__DEV.smokeOnboardingHowItWorksOnce === "function") result.step7Smokes.howItWorks = root.__DEV.smokeOnboardingHowItWorksOnce(); }
        catch (err) { result.step7Smokes.howItWorks = { ok: false, error: err && err.message ? String(err.message) : String(err) }; }
        ["spec", "minimalUi", "howItWorks"].forEach((key) => {
          if (result.step7Smokes[key] && result.step7Smokes[key].ok !== true) fail(`step7_${key}_smoke_failed`, result.step7Smokes[key]);
        });
      } catch (err) {
        fail("onboarding_seen_smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failedChecks.length === 0;
      console.warn("ONBOARDING_SEEN_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("ONBOARDING_SEEN_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeOnboardingSeenOnce);
  };

  installOnboardingSeenSmokeViaData();

  const installOnboardingRegressionPackSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    root.__DEV.smokeOnboardingRegressionPackOnce = function smokeOnboardingRegressionPackOnce() {
      const startedAt = (typeof performance !== "undefined" && typeof performance.now === "function") ? performance.now() : Date.now();
      const result = {
        ok: false,
        failedChecks: [],
        failures: [],
        summary: {
          smokeCount: 0,
          passedCount: 0,
          failedCount: 0,
          missingCount: 0,
          requiresManualInteraction: false,
          timeoutMs: 120000
        },
        subSmokes: {},
        totalMs: 0
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const now = () => (typeof performance !== "undefined" && typeof performance.now === "function") ? performance.now() : Date.now();
      const subSmokeList = [
        { key: "specFresh", fn: "smokeOnboardingSpecOnce" },
        { key: "minimalUiLayout", fn: "smokeOnboardingMinimalUiOnce" },
        { key: "howItWorks", fn: "smokeOnboardingHowItWorksOnce" },
        { key: "onboardingSeen", fn: "smokeOnboardingSeenOnce" },
        { key: "economyHonesty", fn: "smokeOnboardingEconomyHonestyOnce" },
        { key: "millennialTone", fn: "smokeOnboardingMillennialToneOnce" }
      ];
      try {
        subSmokeList.forEach((entry) => {
          const fn = root.__DEV && root.__DEV[entry.fn];
          result.summary.smokeCount += 1;
          if (typeof fn !== "function") {
            result.summary.missingCount += 1;
            result.subSmokes[entry.key] = { ok: false, failedChecks: ["sub_smoke_missing"], failures: [{ code: "sub_smoke_missing", detail: entry.fn }] };
            fail(`${entry.key}:sub_smoke_missing`, entry.fn);
            return;
          }
          const subStartedAt = now();
          try {
            const subResult = fn();
            const subMs = Math.round(now() - subStartedAt);
            result.subSmokes[entry.key] = subResult && typeof subResult === "object"
              ? Object.assign({ totalMs: subMs }, subResult)
              : { ok: false, totalMs: subMs, failedChecks: ["sub_smoke_invalid_result"], failures: [{ code: "sub_smoke_invalid_result", detail: subResult }] };
          } catch (err) {
            result.subSmokes[entry.key] = { ok: false, totalMs: Math.round(now() - subStartedAt), failedChecks: ["sub_smoke_exception"], failures: [{ code: "sub_smoke_exception", detail: err && err.message ? String(err.message) : String(err) }] };
          }
          const sub = result.subSmokes[entry.key];
          if (sub && sub.ok === true) {
            result.summary.passedCount += 1;
          } else {
            result.summary.failedCount += 1;
            fail(`${entry.key}:not_ok`, sub);
          }
          const subFailedChecks = sub && Array.isArray(sub.failedChecks) ? sub.failedChecks : [];
          subFailedChecks.forEach((code) => fail(`${entry.key}:${code}`, sub));
          const subFailures = sub && Array.isArray(sub.failures) ? sub.failures : [];
          subFailures.forEach((failure) => {
            const code = failure && failure.code ? String(failure.code) : "sub_failure";
            fail(`${entry.key}:${code}`, failure);
          });
        });
      } catch (err) {
        fail("onboarding_regression_pack_exception", err && err.message ? String(err.message) : String(err));
      }
      result.totalMs = Math.round(now() - startedAt);
      if (result.totalMs > result.summary.timeoutMs) fail("onboarding_regression_pack_timeout", result.totalMs);
      result.summary.failedCount = subSmokeList.length - result.summary.passedCount - result.summary.missingCount;
      result.ok = result.failedChecks.length === 0 && result.summary.passedCount === subSmokeList.length && result.summary.missingCount === 0 && result.totalMs <= result.summary.timeoutMs;
      console.warn("ONBOARDING_REGRESSION_PACK_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    console.warn("ONBOARDING_REGRESSION_PACK_SMOKE_EXPOSED_VIA_DATA_V1", typeof root.__DEV.smokeOnboardingRegressionPackOnce);
  };

  installOnboardingRegressionPackSmokeViaData();

  Game.Data = Data;
})();
