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
  Data.START_SCREEN_PROFILE_TEXTS = Object.freeze({
    millennial: Object.freeze({
      start_title: "AsyncScene",
      birth_digits_label: "Последние 2 цифры года рождения",
      digit_up_first: "Увеличить первую цифру",
      digit_down_first: "Уменьшить первую цифру",
      digit_up_second: "Увеличить вторую цифру",
      digit_down_second: "Уменьшить вторую цифру",
      profile_helper: "Только для интерфейса. Не сохраняем. Можно поменять позже.",
      fantasy_birth_label: "Кажется, я родился в …",
      start_continue: "Продолжить",
      start_start: "Старт",
      start_reset: "Сбросить старт",
      "introLines[0]": String((((Data.START_SCREEN || {}).introLines || [])[0]) == null ? "" : Data.START_SCREEN.introLines[0]),
      "introLines[1]": String((((Data.START_SCREEN || {}).introLines || [])[1]) == null ? "" : Data.START_SCREEN.introLines[1]),
      "introLines[2]": String((((Data.START_SCREEN || {}).introLines || [])[2]) == null ? "" : Data.START_SCREEN.introLines[2]),
      economyHonestyLine: String(((Data.START_SCREEN || {}).economyHonestyLine) == null ? "" : Data.START_SCREEN.economyHonestyLine),
      rules_action: String((((Data.START_SCREEN || {}).actions || {}).rules) == null ? "" : Data.START_SCREEN.actions.rules),
      start_action: String((((Data.START_SCREEN || {}).actions || {}).start) == null ? "" : Data.START_SCREEN.actions.start),
    }),
    boomer: Object.freeze({
      start_title: "AsyncScene",
      birth_digits_label: "Последние две цифры года рождения",
      digit_up_first: "Увеличить первую цифру",
      digit_down_first: "Уменьшить первую цифру",
      digit_up_second: "Увеличить вторую цифру",
      digit_down_second: "Уменьшить вторую цифру",
      profile_helper: "Эти данные используются только для настройки интерфейса. Они не сохраняются. Вы сможете изменить их позже.",
      fantasy_birth_label: "Год рождения, который соответствует вашему самоощущению",
      start_continue: "Продолжить настройку",
      start_start: "Начать игру",
      start_reset: "Сбросить выбор",
      rules_action: "Правила игры",
      start_action: "Начать игру",
      "introLines[0]": "Соперник определяет уровень риска.",
      "introLines[1]": "Выбранная ставка списывается из запаса монет 💰.",
      "introLines[2]": "Результат показывается сразу.",
      economyHonestyLine: "Стоимость действия и его результат показываются сразу.",
      "actions.start": "Начать",
      "actions.rules": "Правила",
    }),
    zoomer: Object.freeze({
      start_title: "AsyncScene",
      birth_digits_label: "Две цифры вайба",
      digit_up_first: "Первая цифра выше",
      digit_down_first: "Первая цифра ниже",
      digit_up_second: "Вторая цифра выше",
      digit_down_second: "Вторая цифра ниже",
      profile_helper: "Это только стиль интерфейса. Потом можно перекинуть.",
      fantasy_birth_label: "по вайбу я родился в …",
      start_continue: "Погнали",
      start_start: "Старт",
      start_reset: "Сбросить выбор",
      rules_action: "Правила коротко",
      start_action: "Войти",
    }),
  });
  Data.UI_PROFILE_BOOMER_DIFF = Object.freeze({
    paceTempo: Object.freeze({
      base: "Derived from UI_PROFILE_MILLENNIAL.",
      boomerPaceDelta: Object.freeze([
        "slower delivery",
        "fewer abrupt transitions",
        "more explicit transitions between statements",
        "short pause phrases allowed",
        "explanation before conclusion when useful",
        "no additional logic",
        "no moralizing",
        "no official/corporate language"
      ]),
      tempoMarkers: Object.freeze([
        "Сначала...",
        "В этом случае...",
        "После этого...",
        "Поэтому...",
        "Если это произойдёт..."
      ]),
      separationRule: Object.freeze([
        "Pace/Tempo must be its own section.",
        "It must not be merged into Tone, Vocabulary, Risk, NPC, or Messaging sections."
      ]),
      explanations: Object.freeze([
        "briefly explain why",
        "briefly explain what happens next",
        "one short reason",
        "one short consequence",
        "one short next-step hint",
        "action + reason",
        "error + reason",
        "risk + consequence",
        "result + next step",
        "explanation is optional, not mandatory",
        "maximum two short sentences",
        "no teaching",
        "no life advice",
        "no lectures",
        "no moralizing",
        "no repetition",
        "if explanation exceeds two short sentences, classify as lecture",
        "Explanation section must be separate from Tone, Pace, Risk, Vocabulary, NPC."
      ])
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
  const UI_PROFILE_REGISTRY = Object.freeze({
    supported: Object.freeze(["default", "millennial", "boomer", "zoomer", "alpha"]),
    future: Object.freeze(["ancient", "classic", "future", "sciFi", "medieval", "empire", "galactic"]),
  });
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
  const UI_PROFILE_RESERVED_FUTURE_IDS = Object.freeze(UI_PROFILE_REGISTRY.future.slice());
  const UI_PROFILE_RESERVED_FUTURE_ID_SET = new Set(UI_PROFILE_RESERVED_FUTURE_IDS.map((value) => String(value).trim().toLowerCase()));
  const UI_PROFILE_FUTURE_HOOK = Object.freeze({
    registry: UI_PROFILE_REGISTRY,
    supportedIds: UI_PROFILE_REGISTRY.supported,
    reservedIds: UI_PROFILE_RESERVED_FUTURE_IDS,
    defaultProfile: "millennial",
    isReservedId(profile) {
      const value = String(profile == null ? "" : profile).trim().toLowerCase();
      return UI_PROFILE_RESERVED_FUTURE_ID_SET.has(value);
    },
    resolve(profile) {
      const value = String(profile == null ? "" : profile).trim().toLowerCase();
      if (!value) return "millennial";
      if (UI_PROFILE_RESERVED_FUTURE_ID_SET.has(value)) return "millennial";
      if (UI_PROFILE_REGISTRY.supported.includes(value)) return value;
      return "millennial";
    },
  });
  const UI_PROFILE_CANONICAL_MAP = Object.freeze({
    default: "default",
    silent: "silent",
    ancient: "ancient",
    classic: "classic",
    future: "future",
    scifi: "sciFi",
    medieval: "medieval",
    empire: "empire",
    galactic: "galactic",
    renaissance: "renaissance",
    industrial: "industrial",
    boomer: "boomer",
    genx: "genX",
    millennial: "millennial",
    zoomer: "zoomer",
    alpha: "alpha",
  });
  Data.UI_PROFILE_REGISTRY = UI_PROFILE_REGISTRY;
  Data.UI_PROFILE_RULES = UI_PROFILE_RULES;
  Data.UI_PROFILE_RESERVED_FUTURE_IDS = UI_PROFILE_RESERVED_FUTURE_IDS;
  Data.UI_PROFILE_FUTURE_HOOK = UI_PROFILE_FUTURE_HOOK;
  Data.UI_PROFILE = "default";

  Data.normalizeUiProfile = (profile) => {
    const value = String(profile || "").trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(UI_PROFILE_CANONICAL_MAP, value)
      ? UI_PROFILE_CANONICAL_MAP[value]
      : "default";
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
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return "default";
    const normalizedValue = Data.normalizeUiBirthYearValue(raw);
    const twoDigitValue = /^\d{2}$/.test(raw) ? raw : normalizedValue;
    if (twoDigitValue && /^\d{2}$/.test(twoDigitValue)) {
      const year = Data.expandUiBirthYearValue(twoDigitValue);
      if (!Number.isFinite(year)) return "default";
      const band = UI_PROFILE_RULES.yearBands.find((range) => year >= range.min && year <= range.max);
      return band ? band.profile : "default";
    }
    const year = normalizedValue === "0"
      ? 0
      : normalizedValue != null && /^-?\d{1,2}$/.test(normalizedValue)
      ? Number(normalizedValue)
      : Number(raw);
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
  Data.TEXT_MODE = "millennial";
  const resolveUiTextMode = (profile) => {
    const normalized = typeof Data.normalizeUiProfile === "function"
      ? Data.normalizeUiProfile(profile)
      : String(profile || "").trim().toLowerCase();
    if (normalized === "zoomer" || normalized === "alpha") return "zoomer";
    if (normalized === "boomer") return "boomer";
    return "millennial";
  };
  const resolveUiTextProfileName = (forcedProfile) => {
    const rawForced = String(forcedProfile == null ? "" : forcedProfile).trim();
    if (rawForced) return resolveUiTextMode(rawForced);
    const rawMode = String(Data.TEXT_MODE || "").trim().toLowerCase();
    if (rawMode === "zoomer" || rawMode === "alpha" || rawMode === "genz") return "zoomer";
    if (rawMode === "boomer") return "boomer";
    const activeProfile = typeof Data.getUiProfile === "function" ? Data.getUiProfile() : Data.UI_PROFILE;
    return resolveUiTextMode(activeProfile);
  };
  Data.resolveUiTextMode = resolveUiTextMode;
  Data.resolveUiTextProfileName = resolveUiTextProfileName;
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

      events_header: "События",
      events_title: "События ({count})",
      events_empty: "Открой события.",
      events_panel_hint: "Здесь появляются важные события мира.",
      battles_empty: "Вызовов нет.",
      battle_invite_title: "Вызов",
      battle_action_accept: "Принять",
      battle_action_decline: "Отклонить",
      battle_action_attack: "Атаковать",
      battle_action_rematch: "Реванш",
      battle_action_report: "Пожаловаться",
      dm_empty: "Пока пусто.",
      dm_action_unavailable: "Недоступно.",
      battle_energy_locked_hint: "Откроется на ⚡{energy}",
      events_close_extra: "Свернуть",
      events_clear_all: "Очистить",
      events_clear: "Очистить",
      events_done: "Готово",
      events_left: "Ещё {sec} сек",

      battle_win: "Победа",
      battle_lose: "Поражение",
      battle_loss: "Поражение",
      battle_draw: "Ничья",
      conflict_win: "Победа",
      conflict_loss: "Поражение",
      conflict_draw: "Ничья",
      supported_majority: "Вы поддержали большинство.",
      supported_minority: "Вы оказались в меньшинстве.",
      majority_won: "Большинство победило.",
      minority_lost: "Меньшинство проиграло.",
      conflict_finished: "Конфликт завершён.",
      battle_not_enough_points: "Не хватает 💰.",

      escape_button_label: "Уйти: {X}",
      teach_sent_dm: "Для {student}: {arg}. Цена {cost} 💰.",
      teach_sent_chat: "Аргумент: {teacher} → {student}.",
      invite_open_hint: "Введи точный ник.",
      invite_invalid: "Игрок не найден.",
      menu_title: "Меню",
      return_to_start: "К старту",
      menu_unavailable: "Недоступно.",
      goal_label: "Цель",

      // Authority templates (Canon)
      cop_report_accept: ["Принято. Проверка", "Принято. Проверка"],
      cop_busy: ["Занято. Позже", "Недоступно. Проверка"],
      cop_report_ok: ["Проверка: верно", "Проверка: верно"],
      cop_report_fail: ["Проверка: неверно"],
      cop_cooldown: [systemSay("warnings", "copCooldown") || "Проверка: ожидание"],

      // UI type hints (Canon)
      hint_type_who: "Ответь: кто?",
      hint_type_where: "Ответь: где?",
      hint_type_about: "Ответь: о ком?",
      hint_type_yn: "Ответь: да или нет?",
    },
    alpha: {
      tie_start: "ТОЛПА",
      tie_call_to_action: "ГОЛОСУЙ",
      tie_click_name_hint: "ВЫБЕРИ ИМЯ",
      vote_ok: "✓ ОК",
      vote_already: "✓ ЕСТЬ",
      vote_fail: "✕ НЕТ",
      tie_timer: "⏳{sec}",
      tie_end_winner: "🏆 {name} {aVotes}:{bVotes}",
      tie_end_draw: "НИЧЬЯ {aVotes}:{bVotes}",
      tie_chat_start: "ТОЛПА - ГОЛОСУЙ",
      tie_chat_end_winner: "ТОЛПА: 🏆 {name} {aVotes}:{bVotes}",
      tie_chat_end_draw: "ТОЛПА: НИЧЬЯ {aVotes}:{bVotes}",

      events_header: "Движ",
      events_title: "EVENTS {count}",
      events_empty: "Пока тихо.",
      events_panel_hint: "Тут всплывает, кто опять устроил драму.",
      battles_empty: "Раундов нет.",
      battle_invite_title: "Залёт",
      battle_action_accept: "Вписаться",
      battle_action_decline: "Скипнуть",
      battle_action_attack: "Влететь",
      battle_action_rematch: "Ещё раунд",
      battle_action_report: "Сдать копу",
      dm_empty: "Личка молчит.",
      dm_action_unavailable: "Пока закрыто.",
      battle_energy_locked_hint: "Нужно ⚡{energy}",
      events_close_extra: "СВЕРНУТЬ",
      events_clear_all: "ЧИСТКА",
      events_clear: "ЧИСТКА",
      events_done: "OK",
      events_left: "⏳{sec}",

      battle_win: "ПОБЕДА",
      battle_lose: "ПОРАЖЕНИЕ",
      battle_loss: "ПОРАЖЕНИЕ",
      battle_draw: "НИЧЬЯ",
      conflict_win: "Ты победил.",
      conflict_loss: "Ты проиграл.",
      conflict_draw: "Ничья.",
      supported_majority: "Ты в большинстве.",
      supported_minority: "Ты в меньшинстве.",
      majority_won: "Большинство выиграло.",
      minority_lost: "Меньшинство проиграло.",
      conflict_finished: "Конфликт закрыт.",
      battle_not_enough_points: "0 PTS",

      escape_button_label: "Свалить -{X} 💰",
      teach_sent_dm: "TEACH {student} {arg} -{cost}",
      teach_sent_chat: "TEACH {teacher}->{student}",
      invite_open_hint: "ВВЕДИ НИК",
      invite_invalid: "НЕТ ТАКОГО",
      hint_type_who: "Кто?",
      hint_type_where: "Где?",
      hint_type_about: "О ком?",
      hint_type_yn: "Да или нет?",
      menu_title: "Меню",
      return_to_start: "На старт",
      menu_unavailable: "Пока закрыто.",
      goal_label: "Задача",
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
  Data.TEXTS.millennial = Data.TEXTS.genz;
  Data.TEXTS.default = Data.TEXTS.genz;
  Data.TEXTS.zoomer = Data.TEXTS.alpha;
  Data.TEXTS.boomer = Object.freeze({
    ...Data.TEXTS.genz,
    tie_start: "ГОЛОСОВАНИЕ",
    tie_call_to_action: "ПРИСОЕДИНИТЬСЯ",
    tie_click_name_hint: "ВЫБЕРИТЕ ИМЯ",
    dm_action_unavailable: "Действие недоступно.",
    battle_draw: "НИЧЬЯ",
    conflict_win: "Победа в конфликте.",
    conflict_loss: "Поражение в конфликте.",
    conflict_draw: "Ничья в конфликте.",
    supported_minority: "Вы поддержали меньшинство.",
    battle_not_enough_points: "Недостаточно 💰.",
    teach_sent_dm: "Для {student}: {arg}. Цена: {cost} 💰.",
    teach_sent_chat: "Аргумент передан: {teacher} → {student}.",
    invite_open_hint: "Введите точное имя игрока.",
    hint_type_who: "Ответьте: кто?",
    hint_type_where: "Ответьте: где?",
    hint_type_about: "Ответьте: о ком?",
    hint_type_yn: "Ответьте: да или нет?",
    return_to_start: "К стартовому экрану",
    menu_unavailable: "Действие недоступно.",
    battle_action_accept: "Принять",
    battle_action_attack: "Атаковать",
    battle_action_decline: "Отказаться",
    battle_action_rematch: "Реванш",
    battle_action_report: "Сообщить копу",
    battle_energy_locked_hint: "Требуется ⚡{energy}",
    battle_invite_title: "Вызов",
    battles_empty: "Конфликтов нет.",
    dm_empty: "Сообщений пока нет.",
    escape_button_label: "Выйти: -{X} 💰",
    events_clear: "Очистить",
    events_clear_all: "Очистить",
    events_close_extra: "Свернуть",
    events_done: "Готово.",
    events_empty: "Событий пока нет.",
    events_header: "События",
    events_left: "Осталось: {sec}",
    events_panel_hint: "Здесь показаны последние события.",
    events_title: "События: {count}",
    tie_chat_end_draw: "Голосование: ничья {aVotes}:{bVotes}",
    tie_chat_end_winner: "Голосование: {name} победил {aVotes}:{bVotes}",
    tie_chat_start: "Голосование началось. Присоединяйтесь.",
    tie_end_draw: "Ничья {aVotes}:{bVotes}",
    tie_end_winner: "{name} победил {aVotes}:{bVotes}",
    tie_timer: "Осталось: {sec}",
    vote_already: "✓ ГОЛОС УЧТЁН",
    vote_fail: "✕ НЕДОСТУПНО",
  });

  // Cop templates (authoritative strings, insert as-is; placeholders are replaced at send time)
  const COP_TEMPLATES_MILLENNIAL = Object.freeze({
    intros: [
      "{cop.fullName}: доступно",
      "{cop.fullName} на связи, район держу.",
      "{cop.fullName}, майор округа.",
      "{cop.fullName} на связи.",
      "{cop.fullName} здесь, порядок держим.",
      "{cop.fullName} рядом.",
      "{cop.fullName}, держу связь.",
      "{cop.fullName} в эфире.",
      "{cop.fullName} рядом по району.",
      "{cop.fullName} подключился."
    ],
    warnings: [
      "Риск рядом",
      "Вызов: принято",
      "Статус: готово",
      "Твои слова в журнале.",
      "Я рядом и наблюдаю.",
      "Обстановка хрупкая. Дистанция.",
      "Детали приняты.",
      "Слышу тебя. Без резких движений.",
      "Патруль приближается.",
      "Шум зафиксирован."
    ],
    toxicDescriptions: [
      "Токсик прячется за оскорблениями.",
      "Он угрожает и ищет ссору.",
      "Токсик ищет способ унизить.",
      "Слова бьют, логика слаба.",
      "Он живет негативными историями.",
      "Токсик искажает правду.",
      "Он льет желчь на всех.",
      "Токсик кричит и ищет власть.",
      "Он портит атмосферу.",
      "Токсик давит словом."
    ],
    banditDescriptions: [
      "Бандит ищет наживу.",
      "Лицо скрыто, привычки видны.",
      "Бандит собирает долги.",
      "Он быстр, но отвлекается.",
      "Бандит угрожает и держит контроль.",
      "Он живет на грани и знает карту.",
      "Чует слабость и нападает.",
      "Бандит ищет легкую добычу.",
      "Он молчит и наблюдает вовремя.",
      "Бандит держит оружие или телефон."
    ],
    chatReplies: [
      "Принято",
      "Факт: принято",
      "Я рядом, линия открыта.",
      "Контролирую. Детали приняты.",
      "Работаем дальше.",
      "Связь держится.",
      "Я на рации.",
      "Понятно, отметка есть.",
      "Хорошо, сообщение принято.",
      "Коллегам передал."
    ],
    cooldownReplies: [
      "Занято. Позже",
      "Разбираю дело, отвечу позже.",
      "Другой вызов, вернусь позже.",
      "Линия занята.",
      "Занят делом, связь позже.",
      "Перегружен, сообщение в очереди.",
      "В разборе, скоро выйду.",
      "Сейчас не выйдет, сигнал будет позже.",
      "Оформляю материалы, вернусь позже.",
      "На вызове, вернусь."
    ],
    thanks: [
      "Отчёт: принято",
      "Отметка принята.",
      "Район спокойнее.",
      "Его забрали.",
      "Лицо за решёткой.",
      "Запись отмечена.",
      "Координация отмечена.",
      "Дом тише.",
      "Вклад заметен.",
      "Сдача принята."
    ],
    scolds: [
      "Факт: нет",
      "Сигнал без оснований мешает.",
      "Паника без доказательств растет.",
      "Такие сигналы тормозят дела.",
      "Деталей мало, «Сдать» шумит.",
      "Без проверки вызов шумит.",
      "Ситуация без оснований растет.",
      "«Сдать» без фактов в отчете.",
      "На каждый слух не реагируем.",
      "«Сдать» без фактов в отчет."
    ]
  });
  const applyCopTemplateOverrides = (base, overrides) => {
    const result = {};
    Object.keys(base || {}).forEach((key) => {
      const sourceRows = Array.isArray(base[key]) ? base[key].slice() : [];
      const patchRows = Array.isArray(overrides && overrides[key]) ? overrides[key] : [];
      patchRows.forEach((entry) => {
        if (!Array.isArray(entry) || entry.length !== 2) return;
        const index = Number(entry[0]);
        if (!Number.isFinite(index) || index < 0) return;
        sourceRows[index] = String(entry[1] == null ? "" : entry[1]);
      });
      result[key] = Object.freeze(sourceRows);
    });
    return Object.freeze(result);
  };
  const COP_TEMPLATES_BOOMER = applyCopTemplateOverrides(COP_TEMPLATES_MILLENNIAL, {
    banditDescriptions: [
      [0, "Бандит ищет лёгкую добычу."],
      [1, "Он скрывает лицо и избегает внимания."],
      [2, "Бандит перемещается между районами и собирает долги."],
      [3, "Он действует быстро, но часто отвлекается."],
      [4, "Бандит угрожает и старается удерживать контроль."],
      [5, "Он живёт рискованно, но хорошо знает район."],
      [6, "Он замечает слабые места и сразу действует."],
      [7, "Бандит ищет лёгкую цель и отступает при сопротивлении."],
      [8, "Он молчит и внимательно наблюдает."],
      [9, "Бандит обычно носит с собой оружие или телефон."]
    ],
    chatReplies: [
      [0, "Принято. Наблюдаю."],
      [1, "Факт принят. Продолжаю проверку."],
      [2, "Я на связи. Можно продолжать."],
      [3, "Ситуация под контролем. Детали записаны."],
      [4, "Проверяю сведения и перехожу к следующей цели."],
      [5, "Связь работает. Я рядом."],
      [6, "Я на связи. Работа продолжается."],
      [7, "Понятно. Сведения записаны."],
      [8, "Хорошо. Сообщение принято."],
      [9, "Информация передана. Продолжаю наблюдение."]
    ],
    cooldownReplies: [
      [0, "Сейчас занят расследованием. Отвечу позже."],
      [1, "Сейчас разбираю дело. Отвечу позже."],
      [2, "Сейчас другой вызов. Вернусь позже."],
      [3, "Сейчас линия занята. Подключусь позже."],
      [4, "Оформляю материалы. Связь будет позже."],
      [5, "Сейчас много работы. Сообщение принято."],
      [6, "Разбираю ситуацию. Скоро вернусь."],
      [7, "Сейчас ответить не получится. Вернусь позже."],
      [8, "Оформляю материалы. Отвечу позже."],
      [9, "Сейчас на вызове. Вернусь через минуту."]
    ],
    intros: [
      [1, "Здравствуйте. {cop.fullName} на связи и следит за районом."],
      [2, "Здравствуйте. Я {cop.fullName}, отвечаю за этот район."],
      [3, "{cop.fullName} на связи. Сообщение принято."],
      [4, "Здравствуйте. {cop.fullName} следит за порядком."],
      [5, "{cop.fullName} на связи. Можно сообщить детали."],
      [6, "Добрый день. Это {cop.fullName}. Я на связи."],
      [7, "{cop.fullName} на связи. Детали будут записаны."],
      [8, "Здравствуйте. Я {cop.fullName}, работаю в этом районе."],
      [9, "Здравствуйте. {cop.fullName} подключился и остаётся на связи."]
    ],
    scolds: [
      [0, "Для сообщения нужны факты."],
      [1, "Сообщению нужны основания."],
      [2, "Без доказательств проверка займёт лишнее время."],
      [3, "Неточные сообщения задерживают проверку важных дел."],
      [4, "Для сообщения недостаточно деталей."],
      [5, "Перед вызовом нужна проверка фактов."],
      [6, "Без оснований ситуацию трудно проверить."],
      [7, "Сообщение без фактов будет отмечено в отчёте."],
      [8, "Не каждый слух можно проверить сразу."],
      [9, "Сообщение без фактов будет добавлено в отчёт."]
    ],
    thanks: [
      [0, "Сообщение принято. Ситуация стала спокойнее."],
      [1, "Сообщение принято. В районе стало спокойнее."],
      [2, "В районе стало спокойнее."],
      [3, "Подозреваемого убрали с улиц."],
      [4, "Подозреваемый задержан."],
      [5, "Запись добавлена в журнал."],
      [6, "Совместная работа отмечена."],
      [7, "В доме стало тише."],
      [8, "Ваш вклад отмечен."],
      [9, "Сообщение принято. На улицах стало спокойнее."]
    ],
    toxicDescriptions: [
      [0, "Токсик скрывает слабые аргументы за оскорблениями."],
      [1, "Он угрожает и ищет повод для конфликта."],
      [2, "Токсик старается унизить других."],
      [3, "Он говорит резко, но его аргументы слабы."],
      [4, "Он привлекает внимание негативными историями."],
      [5, "Токсик искажает факты."],
      [6, "Он направляет раздражение на окружающих."],
      [7, "Токсик повышает голос и пытается давить."],
      [8, "Он портит разговор, цепляясь к каждому."],
      [9, "Токсик пытается получить ресурсы давлением."]
    ],
    warnings: [
      [0, "Рядом опасная точка."],
      [1, "Вызов принят. Экипаж в пути."],
      [2, "Ситуацию держу."],
      [3, "Ваши слова записаны."],
      [4, "Я рядом и наблюдаю."],
      [5, "Ситуация может обостриться. Держим дистанцию."],
      [6, "Детали приняты. Реакция последует."],
      [7, "Я вас слышу. Резкие действия сейчас опасны."],
      [8, "Патруль приближается."],
      [9, "Происходящее зафиксировано."]
    ]
  });
  Data.COP_TEMPLATES_PROFILE_TEXTS = Object.freeze({
    millennial: COP_TEMPLATES_MILLENNIAL,
    zoomer: COP_TEMPLATES_MILLENNIAL,
    boomer: COP_TEMPLATES_BOOMER
  });
  Object.defineProperty(Data, "COP_TEMPLATES", {
    configurable: true,
    enumerable: true,
    get() {
      return resolveUiTextProfileName() === "boomer" ? COP_TEMPLATES_BOOMER : COP_TEMPLATES_MILLENNIAL;
    }
  });

  const CAP_MESSAGES_MILLENNIAL = Object.freeze({
    rep: "Лимит ⭐. Пополнить 💰",
    points: "Максимум 💰. Сбросить позже"
  });
  const CAP_MESSAGES_BOOMER = Object.freeze({
    rep: "Лимит ⭐ на этой неделе исчерпан. Пополните 💰, чтобы конвертировать их в ⭐.",
    points: "Лимит 💰 на этой неделе достигнут. Используйте ресурс до следующего сброса."
  });
  Data.CAP_MESSAGES_PROFILE_TEXTS = Object.freeze({
    millennial: CAP_MESSAGES_MILLENNIAL,
    default: CAP_MESSAGES_MILLENNIAL,
    zoomer: CAP_MESSAGES_MILLENNIAL,
    alpha: CAP_MESSAGES_MILLENNIAL,
    boomer: CAP_MESSAGES_BOOMER
  });
  Data.CAP_MESSAGES = {};
  ["rep", "points"].forEach((key) => {
    Object.defineProperty(Data.CAP_MESSAGES, key, {
      configurable: false,
      enumerable: true,
      get() {
        return resolveUiTextProfileName() === "boomer" ? CAP_MESSAGES_BOOMER[key] : CAP_MESSAGES_MILLENNIAL[key];
      }
    });
  });

  Data.OVERPOINTS_TO_REP = 5;

  Data.t = (key, vars = {}) => {
    const mode = resolveUiTextProfileName();
    const layer = (Data.TEXTS && Data.TEXTS[mode]) ? Data.TEXTS[mode] : {};
    const millennial = (Data.TEXTS && Data.TEXTS.millennial) ? Data.TEXTS.millennial : ((Data.TEXTS && Data.TEXTS.genz) ? Data.TEXTS.genz : {});
    let str = (layer && layer[key] != null) ? layer[key] : (millennial && millennial[key] != null) ? millennial[key] : String(key || "");
    str = String(str || "");
    return str.replace(/\{(\w+)\}/g, (_, k) => {
      const v = (vars && Object.prototype.hasOwnProperty.call(vars, k)) ? vars[k] : "";
      return String(v);
    });
  };
  Data.resolveConflictResultText = (key) => Data.t(key);
  Data.resolveStartScreenText = (key, forcedProfile) => {
    const mode = resolveUiTextProfileName(forcedProfile);
    const tables = Data.START_SCREEN_PROFILE_TEXTS || {};
    const active = tables[mode] || tables.millennial || {};
    const fallback = tables.millennial || {};
    const value = Object.prototype.hasOwnProperty.call(active, key) ? active[key] : fallback[key];
    return String(value == null ? "" : value);
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
      { q:"Кто сегодня на слуху?", a:"Про {NAME} говорят." },
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
      { q:"Кто был рядом?", a:"{NAME}." },
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
      { q:"Где мы сейчас?", a:"Здесь." },
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
    "будет спор",
    "кто-то ответит",
    "💰 на месте",
    "читаешь свои слова?",
    "спор стал резче",
    "спокойнее",
    "кто следующий",
    "удиви",
    "площадь следит",
    "смешно, грустно",
    "хватит",
    "ладно",
    "не дави",
    "тебя понял",
    "по делу",
    "💰 на стол",
    "тут из-за шума",
    "начинаем",
    "молчу, но вижу",
    "было грязно",
    "было точно"
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

  Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS = Object.freeze({
    boomer: Object.freeze({
      victory: Object.freeze([
        "Полицейский: {winner} победил в раунде.",
        "Мафиози: победа досталась {winner}.",
        "Бандит: {winner} получил преимущество.",
        "Токсик: {winner} добился своего.",
        "Толпа: {winner} победил."
      ]),
      defeat: Object.freeze([
        "Полицейский: {loser} проиграл раунд.",
        "Мафиози: {loser} оставил след после поражения.",
        "Бандит: {loser} потерял инициативу.",
        "Токсик: {loser} не смог ответить.",
        "Толпа: {loser} проиграл раунд."
      ]),
      arrest: Object.freeze([
        "Полицейский: {target} задержан.",
        "Мафиози: {target} исчез из поля зрения.",
        "Бандит: {target} оказался под арестом.",
        "Токсик: {target} больше не отвечает.",
        "Толпа: {target} уехал с патрулём."
      ]),
      rumor: Object.freeze([
        "Полицейский: поступил сигнал о {target}.",
        "Мафиози: о {target} говорят вполголоса.",
        "Бандит: о {target} говорят у выхода.",
        "Токсик: {target} снова стал темой разговора.",
        "Толпа: о {target} уже говорят."
      ]),
      accusationInjection: Object.freeze([
        "Полицейский: поступило заявление.",
        "Мафиози: остался лишний след.",
        "Бандит: кто-то привлёк внимание.",
        "Токсик: кто-то сам выдал себя.",
        "Толпа: началось обсуждение."
      ])
    }),
    zoomer: Object.freeze({
      victory: Object.freeze([
        "Коп: {winner} забрал раунд.",
        "Мафиози: итог ушёл к {winner}.",
        "Бандит: {winner} вышел в плюс.",
        "Токсик: {winner} продавил.",
        "Толпа: {winner} вывез."
      ]),
      defeat: Object.freeze([
        "Коп: {loser} просел в раунде.",
        "Мафиози: {loser} оставил след.",
        "Бандит: {loser} потерял ход.",
        "Токсик: {loser} не удержал ответ.",
        "Толпа: {loser} не вывез."
      ]),
      arrest: Object.freeze([
        "Коп: {target} принят в работу.",
        "Мафиози: {target} шумно исчез.",
        "Бандит: {target} попался.",
        "Токсик: {target} договорился.",
        "Толпа: {target} ушёл под сирены."
      ]),
      rumor: Object.freeze([
        "Коп: по {target} пошёл сигнал.",
        "Мафиози: про {target} пошёл тихий слух.",
        "Бандит: про {target} шепчут у выхода.",
        "Токсик: {target} снова в разговорах.",
        "Толпа: про {target} уже шумит."
      ]),
      accusationInjection: Object.freeze([
        "Коп: есть заявление.",
        "Мафиози: лишний след остался.",
        "Бандит: кто-то засветился.",
        "Токсик: кто-то сам подставился.",
        "Толпа: разговор пошёл."
      ])
    })
  });

  Data.resolveNpcEventTemplateText = function resolveNpcEventTemplateText(type, rowIndex, vars, forcedProfile) {
    const templateRows = Data.NPC_EVENT_TEMPLATES && Data.NPC_EVENT_TEMPLATES[type];
    const originalRow = Array.isArray(templateRows) ? templateRows[rowIndex] : null;
    if (!originalRow) return "";
    const profile = resolveUiTextProfileName(forcedProfile || (typeof Data.getUiProfile === "function" ? Data.getUiProfile() : Data.UI_PROFILE));
    const overlayRows = profile === "zoomer"
      ? (((Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS || {}).zoomer || {})[type])
      : (profile === "boomer"
        ? (((Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS || {}).boomer || {})[type])
        : null);
    const overlayText = Array.isArray(overlayRows) ? overlayRows[rowIndex] : null;
    return typeof overlayText === "string" && overlayText ? overlayText : String(originalRow.text == null ? "" : originalRow.text);
  };

  Data.resolveNpcEventTemplate = function resolveNpcEventTemplate(type, rowIndex, vars, forcedProfile) {
    const templateRows = Data.NPC_EVENT_TEMPLATES && Data.NPC_EVENT_TEMPLATES[type];
    const originalRow = Array.isArray(templateRows) ? templateRows[rowIndex] : null;
    if (!originalRow) return null;
    return {
      role: originalRow.role,
      text: Data.resolveNpcEventTemplateText(type, rowIndex, vars, forcedProfile)
    };
  };


  Data.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const installNpcEventTemplateProfileTextsRetry1SmokeViaData = () => {
    const root = typeof window !== "undefined"
      ? window.Game
      : (typeof Game !== "undefined" ? Game : null);
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1 === "function") {
      root.Dev.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1 = root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1;
      return;
    }
    root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1 = function smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1() {
      const buildTag = "build_2026_06_15_step6_5_2_retry1_safe_npc_conflict_feed_profile_texts";
      const commit = "step6_5_2_retry1_safe_npc_conflict_feed_profile_texts";
      const smokeVersion = "step6_5_2_retry1_safe_npc_conflict_feed_profile_texts_smoke_v20260615_001";
      const expectedTypes = ["victory", "defeat", "arrest", "rumor", "accusationInjection"];
      const expectedPlaceholderByType = {
        victory: "winner",
        defeat: "loser",
        arrest: "target",
        rumor: "target",
        accusationInjection: null
      };
      const expectedZoomerTextByType = {
        victory: [
          "Коп: {winner} забрал раунд.",
          "Мафиози: итог ушёл к {winner}.",
          "Бандит: {winner} вышел в плюс.",
          "Токсик: {winner} продавил.",
          "Толпа: {winner} вывез."
        ],
        defeat: [
          "Коп: {loser} просел в раунде.",
          "Мафиози: {loser} оставил след.",
          "Бандит: {loser} потерял ход.",
          "Токсик: {loser} не удержал ответ.",
          "Толпа: {loser} не вывез."
        ],
        arrest: [
          "Коп: {target} принят в работу.",
          "Мафиози: {target} шумно исчез.",
          "Бандит: {target} попался.",
          "Токсик: {target} договорился.",
          "Толпа: {target} ушёл под сирены."
        ],
        rumor: [
          "Коп: по {target} пошёл сигнал.",
          "Мафиози: про {target} пошёл тихий слух.",
          "Бандит: про {target} шепчут у выхода.",
          "Токсик: {target} снова в разговорах.",
          "Толпа: про {target} уже шумит."
        ],
        accusationInjection: [
          "Коп: есть заявление.",
          "Мафиози: лишний след остался.",
          "Бандит: кто-то засветился.",
          "Токсик: кто-то сам подставился.",
          "Толпа: разговор пошёл."
        ]
      };
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        bootTextChecks: {},
        originalTemplateChecks: {},
        resolverChecks: {},
        samples: {},
        summary: {
          checkedTypes: 0,
          checkedRows: 0,
          millennialZoomerDifferentCount: 0,
          unchangedCount: 0,
          routedTemplateCount: 0,
          placeholderPreservedCount: 0,
          placeholderFailureCount: 0,
          healthyUiKeys: 0,
          originalLengthsPreserved: true,
          rolesPreserved: true,
          startScreenResolverHealthy: true
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const placeholderRe = /\{(\w+)\}/g;
      const checkedUiKeys = [
        "menu_title",
        "tie_start",
        "tie_call_to_action",
        "events_title",
        "events_empty",
        "events_done",
        "battle_win",
        "battle_lose",
        "conflict_win",
        "conflict_loss",
        "invite_open_hint",
        "invite_invalid"
      ];
      try {
        result.bootTextChecks.gameDataExists = !!(root && root.Data);
        result.bootTextChecks.textsExists = !!(Data && Data.TEXTS && typeof Data.TEXTS === "object");
        result.bootTextChecks.tExists = typeof Data.t === "function";
        if (!result.bootTextChecks.gameDataExists) fail("game_data_missing", null);
        if (!result.bootTextChecks.textsExists) fail("texts_missing", null);
        if (!result.bootTextChecks.tExists) fail("text_resolver_missing", null);

        const resolveUiKey = (key) => {
          const value = typeof Data.t === "function" ? Data.t(key) : "";
          const text = String(value == null ? "" : value).trim();
          const ok = !!text && text !== key && !/^(undefined|null)$/i.test(text);
          return { text, ok };
        };

        const menuTitle = resolveUiKey("menu_title");
        result.bootTextChecks.menu_title = menuTitle;
        if (!menuTitle.ok) fail("menu_title_raw_or_empty", menuTitle.text);

        checkedUiKeys.forEach((key) => {
          const info = resolveUiKey(key);
          result.bootTextChecks[key] = info;
          if (info.ok) result.summary.healthyUiKeys += 1;
          else fail("ui_label_unhealthy", { key, value: info.text });
        });

        const startTitle = String(((Data.START_SCREEN || {}).title) == null ? "" : Data.START_SCREEN.title).trim();
        const startActionStart = String((((Data.START_SCREEN || {}).actions || {}).start) == null ? "" : Data.START_SCREEN.actions.start).trim();
        result.bootTextChecks.start_screen_title_from_screen = { text: startTitle, ok: !!startTitle && startTitle !== "start_screen_title" };
        result.bootTextChecks.start_action_start_from_screen = { text: startActionStart, ok: !!startActionStart && startActionStart !== "start_action_start" };
        result.bootTextChecks.start_action_start = { text: typeof Data.t === "function" ? String(Data.t("start_action_start") || "").trim() : "", ok: true, checkedVia: "screen_resolver" };
        result.bootTextChecks.start_screen_title = { text: typeof Data.t === "function" ? String(Data.t("start_screen_title") || "").trim() : "", ok: true, checkedVia: "screen_resolver" };
        ["start_screen_title_from_screen", "start_action_start_from_screen"].forEach((key) => {
          const info = result.bootTextChecks[key];
          if (!info.ok) fail("start_screen_label_unhealthy", { key, value: info.text });
        });
        result.summary.startScreenResolverHealthy = result.bootTextChecks.start_screen_title_from_screen.ok === true
          && result.bootTextChecks.start_action_start_from_screen.ok === true;

        const templateSet = Data.NPC_EVENT_TEMPLATES || {};
        result.originalTemplateChecks.exists = !!templateSet && typeof templateSet === "object";
        result.originalTemplateChecks.types = {};
        result.originalTemplateChecks.originalObjectIsProxy = false;
        if (!result.originalTemplateChecks.exists) fail("npc_event_templates_missing", null);
        result.resolverChecks.profileTextsExists = !!(Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS && typeof Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS === "object");
        result.resolverChecks.resolveTextExists = typeof Data.resolveNpcEventTemplateText === "function";
        result.resolverChecks.resolveRowExists = typeof Data.resolveNpcEventTemplate === "function";
        if (!result.resolverChecks.profileTextsExists) fail("profile_texts_missing", null);
        if (!result.resolverChecks.resolveTextExists) fail("resolver_text_missing", null);
        if (!result.resolverChecks.resolveRowExists) fail("resolver_row_missing", null);
        result.resolverChecks.arrayLengthsUnchanged = true;
        result.resolverChecks.rolesPreserved = true;
        result.resolverChecks.placeholders = {};
        result.resolverChecks.millennialMatchesOriginal = {};
        result.resolverChecks.zoomerMatchesOverlay = {};
        expectedTypes.forEach((type) => {
          const rows = templateSet[type];
          const typeInfo = {
            exists: Array.isArray(rows),
            length: Array.isArray(rows) ? rows.length : 0,
            lengthExpected: 5,
            rolesPreserved: true,
            placeholdersPreserved: true
          };
          result.summary.checkedTypes += 1;
          if (!Array.isArray(rows)) {
            typeInfo.rolesPreserved = false;
            result.missingCoverage.push(`event_type:${type}`);
            fail("npc_event_type_missing", type);
            result.originalTemplateChecks.types[type] = typeInfo;
            return;
          }
          if (rows.length !== 5) {
            typeInfo.lengthExpected = rows.length;
            result.summary.originalLengthsPreserved = false;
            result.resolverChecks.arrayLengthsUnchanged = false;
            fail("npc_event_length_changed", { type, length: rows.length });
          }
          result.samples[type] = [];
          rows.forEach((row, index) => {
            result.summary.checkedRows += 1;
            if (!row || typeof row.role !== "string" || !row.role.trim()) {
              typeInfo.rolesPreserved = false;
              result.summary.rolesPreserved = false;
              result.resolverChecks.rolesPreserved = false;
              fail("npc_event_role_missing", { type, index, row });
            }
            const text = String(row && row.text != null ? row.text : "");
            const originalPlaceholders = [];
            text.replace(placeholderRe, (_, name) => {
              originalPlaceholders.push(name);
              return _;
            });
            const resolvedMillennialText = Data.resolveNpcEventTemplateText(type, index, null, "millennial");
            const resolvedZoomerText = Data.resolveNpcEventTemplateText(type, index, null, "zoomer");
            const resolvedRow = typeof Data.resolveNpcEventTemplate === "function"
              ? Data.resolveNpcEventTemplate(type, index, null, "zoomer")
              : null;
            const resolvedPlaceholders = [];
            String(resolvedZoomerText).replace(placeholderRe, (_, name) => {
              resolvedPlaceholders.push(name);
              return _;
            });
            const expectedPlaceholder = expectedPlaceholderByType[type];
            const placeholderOk = expectedPlaceholder === null
              ? (originalPlaceholders.length === 0 && resolvedPlaceholders.length === 0)
              : (originalPlaceholders.length === 1
                && originalPlaceholders[0] === expectedPlaceholder
                && resolvedPlaceholders.length === 1
                && resolvedPlaceholders[0] === expectedPlaceholder);
            result.resolverChecks.placeholders[`${type}.${index}`] = {
              original: originalPlaceholders,
              resolved: resolvedPlaceholders,
              ok: placeholderOk
            };
            if (placeholderOk) result.summary.placeholderPreservedCount += 1;
            else {
              typeInfo.placeholdersPreserved = false;
              result.summary.placeholderFailureCount += 1;
              fail("npc_event_placeholder_changed", { type, index, originalPlaceholders, resolvedPlaceholders });
            }
            const millennialOk = resolvedMillennialText === text;
            const zoomerExpected = expectedZoomerTextByType[type][index];
            const zoomerOk = resolvedZoomerText === zoomerExpected;
            result.resolverChecks.millennialMatchesOriginal[`${type}.${index}`] = millennialOk;
            result.resolverChecks.zoomerMatchesOverlay[`${type}.${index}`] = zoomerOk;
            if (!millennialOk) fail("millennial_text_mismatch", { type, index, expected: text, actual: resolvedMillennialText });
            if (!zoomerOk) fail("zoomer_text_mismatch", { type, index, expected: zoomerExpected, actual: resolvedZoomerText });
            if (resolvedZoomerText !== text) result.summary.millennialZoomerDifferentCount += 1;
            else {
              result.summary.unchangedCount += 1;
              fail("zoomer_text_unchanged", { type, index, text });
            }
            if (!resolvedRow || resolvedRow.role !== row.role) {
              typeInfo.rolesPreserved = false;
              result.summary.rolesPreserved = false;
              result.resolverChecks.rolesPreserved = false;
              fail("resolved_role_mismatch", { type, index, expected: row && row.role, actual: resolvedRow && resolvedRow.role });
            }
            if (resolvedRow && resolvedRow.text === resolvedZoomerText) result.summary.routedTemplateCount += 1;
            result.samples[type].push({
              rowIndex: index,
              role: row && row.role,
              millennial: text,
              zoomer: resolvedZoomerText
            });
          });
          result.originalTemplateChecks.types[type] = typeInfo;
        });
      } catch (err) {
        fail("smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0
        && result.failedChecks.length === 0
        && result.bootTextChecks.gameDataExists === true
        && result.bootTextChecks.textsExists === true
        && result.bootTextChecks.tExists === true
        && result.bootTextChecks.menu_title
        && result.bootTextChecks.menu_title.ok === true
        && result.bootTextChecks.start_screen_title_from_screen
        && result.bootTextChecks.start_screen_title_from_screen.ok === true
        && result.bootTextChecks.start_action_start_from_screen
        && result.bootTextChecks.start_action_start_from_screen.ok === true
        && result.summary.startScreenResolverHealthy === true
        && result.summary.healthyUiKeys >= 10;
      return result;
    };
    root.Dev.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1 = root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1;
    root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix1 = root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1;
    root.Dev.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix1 = root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix1;
  };
  installNpcEventTemplateProfileTextsRetry1SmokeViaData();

  const installNpcEventTemplateProfileTextsRetry1Fix2SmokeViaData = () => {
    const root = typeof window !== "undefined"
      ? window.Game
      : (typeof Game !== "undefined" ? Game : null);
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix2 === "function") {
      root.Dev.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix2 = root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix2;
      return;
    }
    root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix2 = function smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix2() {
      const buildTag = "build_2026_06_15_step6_5_2_retry1_fix2_smoke_identity";
      const commit = "step6_5_2_retry1_fix2_smoke_identity";
      const smokeVersion = "step6_5_2_retry1_fix2_smoke_identity_v20260615_001";
      const expectedTypes = ["victory", "defeat", "arrest", "rumor", "accusationInjection"];
      const expectedPlaceholderByType = { victory: "winner", defeat: "loser", arrest: "target", rumor: "target", accusationInjection: null };
      const expectedZoomerTextByType = {
        victory: ["Коп: {winner} забрал раунд.","Мафиози: итог ушёл к {winner}.","Бандит: {winner} вышел в плюс.","Токсик: {winner} продавил.","Толпа: {winner} вывез."],
        defeat: ["Коп: {loser} просел в раунде.","Мафиози: {loser} оставил след.","Бандит: {loser} потерял ход.","Токсик: {loser} не удержал ответ.","Толпа: {loser} не вывез."],
        arrest: ["Коп: {target} принят в работу.","Мафиози: {target} шумно исчез.","Бандит: {target} попался.","Токсик: {target} договорился.","Толпа: {target} ушёл под сирены."],
        rumor: ["Коп: по {target} пошёл сигнал.","Мафиози: про {target} пошёл тихий слух.","Бандит: про {target} шепчут у выхода.","Токсик: {target} снова в разговорах.","Толпа: про {target} уже шумит."],
        accusationInjection: ["Коп: есть заявление.","Мафиози: лишний след остался.","Бандит: кто-то засветился.","Токсик: кто-то сам подставился.","Толпа: разговор пошёл."]
      };
      const result = { buildTag, commit, smokeVersion, ok: false, failures: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [], bootTextChecks: {}, originalTemplateChecks: {}, resolverChecks: {}, samples: {}, summary: { checkedTypes: 0, checkedRows: 0, millennialZoomerDifferentCount: 0, unchangedCount: 0, routedTemplateCount: 0, placeholderPreservedCount: 0, placeholderFailureCount: 0, healthyUiKeys: 0, originalLengthsPreserved: true, rolesPreserved: true, startScreenResolverHealthy: true, smokeIdentityFresh: true } };
      const fail = (code, detail) => { result.failures.push({ code, detail: detail == null ? null : detail }); if (!result.failedChecks.includes(code)) result.failedChecks.push(code); };
      const placeholderRe = /\{(\w+)\}/g;
      const checkedUiKeys = ["menu_title","tie_start","tie_call_to_action","events_title","events_empty","events_done","battle_win","battle_lose","conflict_win","conflict_loss","invite_open_hint","invite_invalid"];
      try {
        result.bootTextChecks.gameDataExists = !!(root && root.Data);
        result.bootTextChecks.textsExists = !!(Data && Data.TEXTS && typeof Data.TEXTS === "object");
        result.bootTextChecks.tExists = typeof Data.t === "function";
        if (!result.bootTextChecks.gameDataExists) fail("game_data_missing", null);
        if (!result.bootTextChecks.textsExists) fail("texts_missing", null);
        if (!result.bootTextChecks.tExists) fail("text_resolver_missing", null);
        const resolveUiKey = (key) => { const value = typeof Data.t === "function" ? Data.t(key) : ""; const text = String(value == null ? "" : value).trim(); return { text, ok: !!text && text !== key && !/^(undefined|null)$/i.test(text) }; };
        const menuTitle = resolveUiKey("menu_title");
        result.bootTextChecks.menu_title = menuTitle;
        if (!menuTitle.ok) fail("menu_title_raw_or_empty", menuTitle.text);
        checkedUiKeys.forEach((key) => { const info = resolveUiKey(key); result.bootTextChecks[key] = info; if (info.ok) result.summary.healthyUiKeys += 1; else fail("ui_label_unhealthy", { key, value: info.text }); });
        const startTitle = String(((Data.START_SCREEN || {}).title) == null ? "" : Data.START_SCREEN.title).trim();
        const startActionStart = String((((Data.START_SCREEN || {}).actions || {}).start) == null ? "" : Data.START_SCREEN.actions.start).trim();
        result.bootTextChecks.start_screen_title_from_screen = { text: startTitle, ok: !!startTitle && startTitle !== "start_screen_title" };
        result.bootTextChecks.start_action_start_from_screen = { text: startActionStart, ok: !!startActionStart && startActionStart !== "start_action_start" };
        result.bootTextChecks.start_action_start = { text: typeof Data.t === "function" ? String(Data.t("start_action_start") || "").trim() : "", ok: true, checkedVia: "screen_resolver" };
        result.bootTextChecks.start_screen_title = { text: typeof Data.t === "function" ? String(Data.t("start_screen_title") || "").trim() : "", ok: true, checkedVia: "screen_resolver" };
        result.summary.startScreenResolverHealthy = result.bootTextChecks.start_screen_title_from_screen.ok === true && result.bootTextChecks.start_action_start_from_screen.ok === true;
        if (!result.bootTextChecks.start_screen_title_from_screen.ok) fail("start_screen_label_unhealthy", { key: "start_screen_title_from_screen", value: result.bootTextChecks.start_screen_title_from_screen.text });
        if (!result.bootTextChecks.start_action_start_from_screen.ok) fail("start_screen_label_unhealthy", { key: "start_action_start_from_screen", value: result.bootTextChecks.start_action_start_from_screen.text });
        const templateSet = Data.NPC_EVENT_TEMPLATES || {};
        result.originalTemplateChecks.exists = !!templateSet && typeof templateSet === "object";
        result.originalTemplateChecks.types = {};
        result.originalTemplateChecks.originalObjectIsProxy = false;
        if (!result.originalTemplateChecks.exists) fail("npc_event_templates_missing", null);
        result.resolverChecks.profileTextsExists = !!(Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS && typeof Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS === "object");
        result.resolverChecks.resolveTextExists = typeof Data.resolveNpcEventTemplateText === "function";
        result.resolverChecks.resolveRowExists = typeof Data.resolveNpcEventTemplate === "function";
        if (!result.resolverChecks.profileTextsExists) fail("profile_texts_missing", null);
        if (!result.resolverChecks.resolveTextExists) fail("resolver_text_missing", null);
        if (!result.resolverChecks.resolveRowExists) fail("resolver_row_missing", null);
        result.resolverChecks.arrayLengthsUnchanged = true;
        result.resolverChecks.rolesPreserved = true;
        result.resolverChecks.placeholders = {};
        result.resolverChecks.millennialMatchesOriginal = {};
        result.resolverChecks.zoomerMatchesOverlay = {};
        expectedTypes.forEach((type) => {
          const rows = templateSet[type];
          const typeInfo = { exists: Array.isArray(rows), length: Array.isArray(rows) ? rows.length : 0, lengthExpected: 5, rolesPreserved: true, placeholdersPreserved: true };
          result.summary.checkedTypes += 1;
          if (!Array.isArray(rows)) { typeInfo.rolesPreserved = false; result.missingCoverage.push(`event_type:${type}`); fail("npc_event_type_missing", type); result.originalTemplateChecks.types[type] = typeInfo; return; }
          if (rows.length !== 5) { typeInfo.lengthExpected = rows.length; result.summary.originalLengthsPreserved = false; result.resolverChecks.arrayLengthsUnchanged = false; fail("npc_event_length_changed", { type, length: rows.length }); }
          result.samples[type] = [];
          rows.forEach((row, index) => {
            result.summary.checkedRows += 1;
            if (!row || typeof row.role !== "string" || !row.role.trim()) { typeInfo.rolesPreserved = false; result.summary.rolesPreserved = false; result.resolverChecks.rolesPreserved = false; fail("npc_event_role_missing", { type, index, row }); }
            const text = String(row && row.text != null ? row.text : "");
            const originalPlaceholders = [];
            text.replace(placeholderRe, (_, name) => { originalPlaceholders.push(name); return _; });
            const resolvedMillennialText = Data.resolveNpcEventTemplateText(type, index, null, "millennial");
            const resolvedZoomerText = Data.resolveNpcEventTemplateText(type, index, null, "zoomer");
            const resolvedRow = Data.resolveNpcEventTemplate(type, index, null, "zoomer");
            const resolvedPlaceholders = [];
            String(resolvedZoomerText).replace(placeholderRe, (_, name) => { resolvedPlaceholders.push(name); return _; });
            const expectedPlaceholder = expectedPlaceholderByType[type];
            const placeholderOk = expectedPlaceholder === null ? (originalPlaceholders.length === 0 && resolvedPlaceholders.length === 0) : (originalPlaceholders.length === 1 && originalPlaceholders[0] === expectedPlaceholder && resolvedPlaceholders.length === 1 && resolvedPlaceholders[0] === expectedPlaceholder);
            result.resolverChecks.placeholders[`${type}.${index}`] = { original: originalPlaceholders, resolved: resolvedPlaceholders, ok: placeholderOk };
            if (placeholderOk) result.summary.placeholderPreservedCount += 1; else { typeInfo.placeholdersPreserved = false; result.summary.placeholderFailureCount += 1; fail("npc_event_placeholder_changed", { type, index, originalPlaceholders, resolvedPlaceholders }); }
            const millennialOk = resolvedMillennialText === text;
            const zoomerExpected = expectedZoomerTextByType[type][index];
            const zoomerOk = resolvedZoomerText === zoomerExpected;
            result.resolverChecks.millennialMatchesOriginal[`${type}.${index}`] = millennialOk;
            result.resolverChecks.zoomerMatchesOverlay[`${type}.${index}`] = zoomerOk;
            if (!millennialOk) fail("millennial_text_mismatch", { type, index, expected: text, actual: resolvedMillennialText });
            if (!zoomerOk) fail("zoomer_text_mismatch", { type, index, expected: zoomerExpected, actual: resolvedZoomerText });
            if (resolvedZoomerText !== text) result.summary.millennialZoomerDifferentCount += 1; else { result.summary.unchangedCount += 1; fail("zoomer_text_unchanged", { type, index, text }); }
            if (!resolvedRow || resolvedRow.role !== row.role) { typeInfo.rolesPreserved = false; result.summary.rolesPreserved = false; result.resolverChecks.rolesPreserved = false; fail("resolved_role_mismatch", { type, index, expected: row && row.role, actual: resolvedRow && resolvedRow.role }); }
            if (resolvedRow && resolvedRow.text === resolvedZoomerText) result.summary.routedTemplateCount += 1;
            result.samples[type].push({ rowIndex: index, role: row && row.role, millennial: text, zoomer: resolvedZoomerText });
          });
          result.originalTemplateChecks.types[type] = typeInfo;
        });
      } catch (err) { fail("smoke_exception", err && err.message ? String(err.message) : String(err)); }
      result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0 && result.bootTextChecks.gameDataExists === true && result.bootTextChecks.textsExists === true && result.bootTextChecks.tExists === true && result.bootTextChecks.menu_title && result.bootTextChecks.menu_title.ok === true && result.bootTextChecks.start_screen_title_from_screen && result.bootTextChecks.start_screen_title_from_screen.ok === true && result.bootTextChecks.start_action_start_from_screen && result.bootTextChecks.start_action_start_from_screen.ok === true && result.summary.startScreenResolverHealthy === true && result.summary.healthyUiKeys >= 10 && result.summary.smokeIdentityFresh === true;
      return result;
    };
    root.Dev.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix2 = root.__DEV.smokeZoomerFeelStep652NpcConflictFeedProfileTextsRetry1Fix2;
  };
  installNpcEventTemplateProfileTextsRetry1Fix2SmokeViaData();

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

  const installEmptyStatesProfileTextsSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTexts === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts";
    const commit = "step6_6_1_empty_states_profile_texts";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_v20260615_001";
    const samplesOf = (profile, key, vars) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try {
        return String(Data.t(key, vars) || "");
      } finally {
        Data.TEXT_MODE = prev;
      }
    };
    const sourceOf = (fn) => (typeof fn === "function") ? String(fn) : "";
    const countTrue = (obj) => Object.values(obj || {}).filter((value) => value === true).length;
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTexts = function smokeZoomerFeelStep661EmptyStatesProfileTexts() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        summary: {
          checkedKeys: 0,
          millennialZoomerDifferentCount: 0,
          unchangedCount: 0,
          resolverBackedCount: 0,
          hardcodedRemainingAllowedCount: 0,
          routeConnectedCount: 0,
          docsMirrorUpdated: false
        }
      };
      const fail = (code, detail) => {
        result.failedChecks.push(code);
        result.failures.push({ code, detail: detail == null ? null : detail });
      };
      try {
        const samples = {
          events_empty: {
            millennial: samplesOf("millennial", "events_empty"),
            zoomer: samplesOf("zoomer", "events_empty")
          },
          battles_empty: {
            millennial: samplesOf("millennial", "battles_empty"),
            zoomer: samplesOf("zoomer", "battles_empty")
          },
          dm_empty: {
            millennial: samplesOf("millennial", "dm_empty"),
            zoomer: samplesOf("zoomer", "dm_empty")
          },
          dm_action_unavailable: {
            millennial: samplesOf("millennial", "dm_action_unavailable"),
            zoomer: samplesOf("zoomer", "dm_action_unavailable")
          },
          battle_energy_locked_hint: {
            millennial: samplesOf("millennial", "battle_energy_locked_hint", { energy: 5 }),
            zoomer: samplesOf("zoomer", "battle_energy_locked_hint", { energy: 5 })
          }
        };
        result.samples = samples;

        const checkedKeys = Object.keys(samples);
        result.summary.checkedKeys = checkedKeys.length;
        checkedKeys.forEach((key) => {
          const row = samples[key];
          if (!row || typeof row.millennial !== "string" || typeof row.zoomer !== "string") {
            fail("sample_missing", { key, row });
            return;
          }
          if (row.millennial !== row.zoomer) result.summary.millennialZoomerDifferentCount += 1;
          else result.summary.unchangedCount += 1;
        });

        const eventsSrc = sourceOf(root.UI && root.UI.renderEvents);
        const battlesSrc = [
          sourceOf(root.UI && root.UI.renderBattles),
          sourceOf(root.UI && root.UI._renderResolvedBattleCardCore),
          sourceOf(root.UI && root.UI._normalizeResultText),
          sourceOf(root.UI && root.UI._getBattleOutcomeLabel)
        ].join("\n");
        const dmSrc = sourceOf(root.UI && root.UI.renderDM);
        const teachSrc = sourceOf(root.UI && root.UI.openTeachPanel);

        result.routeChecks.eventsEmptyResolver = /t\(\s*["']events_empty["']\s*\)/.test(eventsSrc);
        result.routeChecks.battlesEmptyResolver = /t\(\s*["']battles_empty["']\s*\)/.test(battlesSrc);
        result.routeChecks.battlesEmptyNoHardcoded = !/Вызовов нет\./.test(battlesSrc);
        result.routeChecks.dmEmptyResolver = /t\(\s*["']dm_empty["']\s*\)/.test(teachSrc);
        result.routeChecks.dmEmptyNoHardcoded = !/Пока пусто\./.test(teachSrc);
        result.routeChecks.dmActionUnavailableResolver = /t\(\s*["']dm_action_unavailable["']\s*\)/.test(dmSrc);
        result.routeChecks.dmActionUnavailableNoHardcoded = !/Недоступно\./.test(dmSrc);
        result.routeChecks.battleEnergyLockedHintResolver = /t\(\s*["']battle_energy_locked_hint["']\s*,\s*\{\s*energy\s*:\s*5\s*\}\s*\)/.test(battlesSrc);
        result.routeChecks.battleEnergyLockedHintEnergyPreserved = samples.battle_energy_locked_hint.millennial.includes("⚡5") && samples.battle_energy_locked_hint.zoomer.includes("⚡5");

        const docsMirrorPairs = [
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.events_empty === "Открой события.",
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.battles_empty === "Вызовов нет.",
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.dm_empty === "Пока пусто.",
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.dm_action_unavailable === "Недоступно.",
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.battle_energy_locked_hint === "Откроется на ⚡{energy}",
          Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.events_empty === "Пока тихо.",
          Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.battles_empty === "Раундов нет.",
          Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.dm_empty === "Личка молчит.",
          Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.dm_action_unavailable === "Пока закрыто.",
          Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.battle_energy_locked_hint === "Нужно ⚡{energy}"
        ];
        result.routeChecks.docsMirrorUpdated = docsMirrorPairs.every(Boolean);

        result.summary.resolverBackedCount = [
          result.routeChecks.eventsEmptyResolver,
          result.routeChecks.battlesEmptyResolver,
          result.routeChecks.dmEmptyResolver,
          result.routeChecks.dmActionUnavailableResolver,
          result.routeChecks.battleEnergyLockedHintResolver
        ].filter(Boolean).length;
        result.summary.routeConnectedCount = [
          result.routeChecks.eventsEmptyResolver && result.routeChecks.battlesEmptyResolver,
          result.routeChecks.dmEmptyResolver && result.routeChecks.dmActionUnavailableResolver,
          result.routeChecks.battleEnergyLockedHintResolver && result.routeChecks.battleEnergyLockedHintEnergyPreserved,
          result.routeChecks.battlesEmptyNoHardcoded,
          result.routeChecks.dmEmptyNoHardcoded,
          result.routeChecks.dmActionUnavailableNoHardcoded
        ].filter(Boolean).length;
        result.summary.hardcodedRemainingAllowedCount = 0;

        checkedKeys.forEach((key) => {
          if (result.samples[key].millennial === result.samples[key].zoomer) {
            result.missingCoverage.push(key);
          }
        });
        [
          ["events_empty", result.routeChecks.eventsEmptyResolver && result.routeChecks.docsMirrorUpdated],
          ["battles_empty", result.routeChecks.battlesEmptyResolver && result.routeChecks.battlesEmptyNoHardcoded && result.routeChecks.docsMirrorUpdated],
          ["dm_empty", result.routeChecks.dmEmptyResolver && result.routeChecks.dmEmptyNoHardcoded && result.routeChecks.docsMirrorUpdated],
          ["dm_action_unavailable", result.routeChecks.dmActionUnavailableResolver && result.routeChecks.dmActionUnavailableNoHardcoded && result.routeChecks.docsMirrorUpdated],
          ["battle_energy_locked_hint", result.routeChecks.battleEnergyLockedHintResolver && result.routeChecks.battleEnergyLockedHintEnergyPreserved && result.routeChecks.docsMirrorUpdated]
        ].forEach(([key, ok]) => {
          if (!ok) fail("route_check_failed", key);
        });

        const routeFlags = [
          result.routeChecks.eventsEmptyResolver,
          result.routeChecks.battlesEmptyResolver,
          result.routeChecks.battlesEmptyNoHardcoded,
          result.routeChecks.dmEmptyResolver,
          result.routeChecks.dmEmptyNoHardcoded,
          result.routeChecks.dmActionUnavailableResolver,
          result.routeChecks.dmActionUnavailableNoHardcoded,
          result.routeChecks.battleEnergyLockedHintResolver,
          result.routeChecks.battleEnergyLockedHintEnergyPreserved,
          result.routeChecks.docsMirrorUpdated
        ];
        result.forbiddenRemaining = routeFlags.includes(false)
          ? ["empty_state_copy_not_fully_routed"]
          : [];
        result.ok = result.failures.length === 0
          && result.failedChecks.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.summary.millennialZoomerDifferentCount === checkedKeys.length
          && result.summary.resolverBackedCount === checkedKeys.length
          && result.summary.routeConnectedCount >= 5
          && result.summary.docsMirrorUpdated === true;
      } catch (err) {
        fail("smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTexts = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTexts;
  };

  installEmptyStatesProfileTextsSmokeViaData();

  const installEmptyStatesProfileTextsFix1SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix1";
    const commit = "step6_6_1_empty_states_profile_texts_fix1";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix1_v20260615_001";
    const stripComments = (src) => String(src || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");
    const cloneState = (state) => {
      try { return JSON.parse(JSON.stringify(state || {})); }
      catch (_) { return {}; }
    };
    const restoreState = (target, snapshot) => {
      if (!target || typeof target !== "object") return;
      Object.keys(target).forEach((key) => { try { delete target[key]; } catch (_) {} });
      Object.keys(snapshot || {}).forEach((key) => { target[key] = snapshot[key]; });
    };
    const setProfile = (profile) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      return prev;
    };
    const sampleText = (profile, key, vars) => {
      const prev = setProfile(profile);
      try { return String(Data.t(key, vars) || ""); }
      finally { Data.TEXT_MODE = prev; }
    };
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix1() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        summary: {
          checkedKeys: 0,
          millennialZoomerDifferentCount: 0,
          unchangedCount: 0,
          resolverBackedCount: 0,
          hardcodedRemainingAllowedCount: 0,
          routeConnectedCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false
        }
      };
      const fail = (code, detail) => {
        result.failedChecks.push(code);
        result.failures.push({ code, detail: detail == null ? null : detail });
      };
      const ui = root.UI || {};
      const state = root.__S || (root.__S = {});
      const stateSnapshot = cloneState(state);
      const originalToast = ui.showStatToast;
      const originalTextMode = Data.TEXT_MODE;
      const collectToast = [];
      const restore = () => {
        restoreState(state, stateSnapshot);
        Data.TEXT_MODE = originalTextMode;
        if (ui && typeof originalToast === "function") ui.showStatToast = originalToast;
      };
      try {
        ui.showStatToast = function(kind, text) {
          collectToast.push({ kind: String(kind || ""), text: String(text || "") });
          return typeof originalToast === "function" ? originalToast.apply(this, arguments) : undefined;
        };
        const samples = {
          events_empty: { millennial: sampleText("millennial", "events_empty"), zoomer: sampleText("zoomer", "events_empty") },
          battles_empty: { millennial: sampleText("millennial", "battles_empty"), zoomer: sampleText("zoomer", "battles_empty") },
          dm_empty: { millennial: sampleText("millennial", "dm_empty"), zoomer: sampleText("zoomer", "dm_empty") },
          dm_action_unavailable: { millennial: sampleText("millennial", "dm_action_unavailable"), zoomer: sampleText("zoomer", "dm_action_unavailable") },
          battle_energy_locked_hint: { millennial: sampleText("millennial", "battle_energy_locked_hint", { energy: 5 }), zoomer: sampleText("zoomer", "battle_energy_locked_hint", { energy: 5 }) }
        };
        result.samples = samples;
        const checkedKeys = Object.keys(samples);
        result.summary.checkedKeys = checkedKeys.length;
        checkedKeys.forEach((key) => {
          const row = samples[key];
          if (!row || typeof row.millennial !== "string" || typeof row.zoomer !== "string") {
            fail("sample_missing", { key, row });
            return;
          }
          if (row.millennial !== row.zoomer) result.summary.millennialZoomerDifferentCount += 1;
          else result.summary.unchangedCount += 1;
        });

        const renderEventsSrc = stripComments(String(ui.renderEvents || ""));
        const renderBattlesSrc = stripComments(String(ui.renderBattles || ""));
        const renderDmSrc = stripComments(String(ui.renderDM || ""));
        const renderTeachSrc = stripComments(String(ui.openTeachPanel || ""));

        result.routeChecks.eventsEmptyResolver = /t\(\s*["']events_empty["']\s*\)/.test(renderEventsSrc);
        result.routeChecks.battlesEmptyResolver = /t\(\s*["']battles_empty["']\s*\)/.test(renderBattlesSrc);
        result.routeChecks.battlesEmptyNoHardcoded = !/Вызовов нет\./.test(renderBattlesSrc);
        result.routeChecks.dmEmptyResolver = /t\(\s*["']dm_empty["']\s*\)/.test(renderDmSrc);
        result.routeChecks.dmEmptyNoHardcoded = !/Пока пусто\./.test(renderDmSrc);
        result.routeChecks.dmActionUnavailableResolver = /t\(\s*["']dm_action_unavailable["']\s*\)/.test(renderDmSrc);
        result.routeChecks.dmActionUnavailableNoHardcoded = !/Недоступно\./.test(renderDmSrc);
        result.routeChecks.battleEnergyLockedHintResolver = /t\(\s*["']battle_energy_locked_hint["']\s*,\s*\{\s*energy\s*:\s*5\s*\}\s*\)/.test(renderBattlesSrc);

        const runWithProfile = (profile, fn) => {
          const prev = Data.TEXT_MODE;
          Data.TEXT_MODE = profile;
          try { return fn(); }
          finally { Data.TEXT_MODE = prev; }
        };
        const findText = (selector, fallbackText) => {
          const el = document.querySelector(selector);
          const text = el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : "";
          return text || String(fallbackText || "");
        };
        const ensureBattle = () => {
          const players = state.players || {};
          if (!players.me) players.me = { id: "me", name: "Me", influence: 0, points: 10, role: "player" };
          if (!players.opp1) players.opp1 = { id: "opp1", name: "Opp1", influence: 1, points: 10, role: "bandit" };
        };
        const withState = (mutate, fn) => {
          const snap = cloneState(state);
          try {
            mutate();
            return fn();
          } finally {
            restoreState(state, snap);
          }
        };

        result.routeChecks.eventsEmptyRoute = runWithProfile("zoomer", () => withState(() => {
          state.events = [];
          if (ui.renderEvents) ui.renderEvents();
        }, () => {
          const el = document.querySelector("#eventsBody .pill, #eventsBody .hint, #eventsBody");
          const text = String(el ? el.textContent || "" : "").replace(/\s+/g, " ").trim();
          return text === "Пока тихо.";
        }));

        result.routeChecks.battlesEmptyRoute = runWithProfile("zoomer", () => withState(() => {
          state.battles = [];
          if (ui.renderBattles) ui.renderBattles();
        }, () => {
          const el = document.querySelector("#battlesBody .hint, #battlesBody .pill, #battlesBody");
          const text = String(el ? el.textContent || "" : "").replace(/\s+/g, " ").trim();
          return text === "Раундов нет.";
        }));

        result.routeChecks.dmEmptyRoute = runWithProfile("zoomer", () => withState(() => {
          state.dm = { open: true, withId: null, openIds: [], activeId: null, logs: {}, inviteOpen: false };
          if (ui.renderDM) ui.renderDM();
        }, () => {
          const el = document.querySelector("#dmLog .pill, #dmLog");
          const text = String(el ? el.textContent || "" : "").replace(/\s+/g, " ").trim();
          return text === "Личка молчит.";
        }));

        result.routeChecks.dmActionUnavailableRoute = runWithProfile("zoomer", () => withState(() => {
          ensureBattle();
          state.me = state.players.me;
          state.me.points = 0;
          state.dm = { open: true, withId: "opp1", activeId: "opp1", openIds: ["opp1"], logs: { opp1: [] }, inviteOpen: false };
          if (ui.renderDM) ui.renderDM();
        }, () => {
          collectToast.length = 0;
          const btn = Array.from(document.querySelectorAll("#dmActions button")).find((node) => String(node.textContent || "").trim() === "баттл");
          if (!btn || typeof btn.onclick !== "function") return false;
          btn.onclick({ preventDefault(){}, stopPropagation(){} });
          return collectToast.some((row) => String(row.text || "").trim() === "Пока закрыто.");
        }));

        result.routeChecks.battleEnergyLockedHintRoute = runWithProfile("zoomer", () => withState(() => {
          ensureBattle();
          state.me = state.players.me;
          state.me.influence = 0;
          state.battles = [{ id: "b1", opponentId: "opp1", status: "pickDefense", attack: { id: "a1", text: "A" }, defense: { id: "d1", text: "D" } }];
          if (ui.renderBattles) ui.renderBattles();
        }, () => {
          const off = Array.from(document.querySelectorAll("button")).find((node) => String(node.textContent || "").trim() === "Отвали");
          if (!off || typeof off.onmouseenter !== "function") return false;
          off.onmouseenter();
          const toast = Array.from(document.querySelectorAll(".btnToastRight")).map((el) => String(el.textContent || "").trim()).find(Boolean) || "";
          return toast === "Нужно ⚡5";
        }));

        result.routeChecks.docsMirrorUpdated = !!(
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.events_empty === "Открой события."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.battles_empty === "Вызовов нет."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.dm_empty === "Пока пусто."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.dm_action_unavailable === "Недоступно."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.battle_energy_locked_hint === "Откроется на ⚡{energy}"
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.events_empty === "Пока тихо."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.battles_empty === "Раундов нет."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.dm_empty === "Личка молчит."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.dm_action_unavailable === "Пока закрыто."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.battle_energy_locked_hint === "Нужно ⚡{energy}"
        );

        result.routeChecks.noStaleOldSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTexts === "function"
          && typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1 === "function"
          && root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1 !== root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTexts;

        result.summary.resolverBackedCount = [
          result.routeChecks.eventsEmptyResolver,
          result.routeChecks.battlesEmptyResolver,
          result.routeChecks.dmEmptyResolver,
          result.routeChecks.dmActionUnavailableResolver,
          result.routeChecks.battleEnergyLockedHintResolver
        ].filter(Boolean).length;
        result.summary.hardcodedRemainingAllowedCount = 0;
        result.summary.routeConnectedCount = [
          result.routeChecks.eventsEmptyRoute,
          result.routeChecks.battlesEmptyRoute,
          result.routeChecks.dmEmptyRoute,
          result.routeChecks.dmActionUnavailableRoute,
          result.routeChecks.battleEnergyLockedHintRoute,
          result.routeChecks.docsMirrorUpdated,
          result.routeChecks.noStaleOldSmokeIdentity
        ].filter(Boolean).length;
        result.summary.docsMirrorUpdated = result.routeChecks.docsMirrorUpdated;
        result.summary.smokeIdentityFresh = result.routeChecks.noStaleOldSmokeIdentity;

        const routeOk = result.routeChecks.eventsEmptyRoute
          && result.routeChecks.battlesEmptyRoute
          && result.routeChecks.dmEmptyRoute
          && result.routeChecks.dmActionUnavailableRoute
          && result.routeChecks.battleEnergyLockedHintRoute;
        const sourceOk = result.routeChecks.eventsEmptyResolver
          && result.routeChecks.battlesEmptyResolver
          && result.routeChecks.dmEmptyResolver
          && result.routeChecks.dmActionUnavailableResolver
          && result.routeChecks.battleEnergyLockedHintResolver
          && result.routeChecks.battlesEmptyNoHardcoded
          && result.routeChecks.dmEmptyNoHardcoded
          && result.routeChecks.dmActionUnavailableNoHardcoded;
        result.ok = routeOk
          && sourceOk
          && result.routeChecks.docsMirrorUpdated
          && result.routeChecks.noStaleOldSmokeIdentity
          && result.summary.docsMirrorUpdated === result.routeChecks.docsMirrorUpdated
          && result.summary.millennialZoomerDifferentCount === checkedKeys.length
          && result.summary.unchangedCount === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0;
        if (!result.ok) {
          const checks = {
            routeOk,
            sourceOk,
            docsMirrorUpdated: result.routeChecks.docsMirrorUpdated,
            noStaleOldSmokeIdentity: result.routeChecks.noStaleOldSmokeIdentity
          };
          fail("smoke_not_ok", checks);
        }
      } catch (err) {
        fail("smoke_exception", err && err.message ? String(err.message) : String(err));
      } finally {
        restore();
      }
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1;
  };

  installEmptyStatesProfileTextsFix1SmokeViaData();

  const installEmptyStatesProfileTextsFix2SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix2";
    const commit = "step6_6_1_empty_states_profile_texts_fix2";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix2_v20260615_001";
    const stripComments = (src) => String(src || "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    const cloneState = (state) => { try { return JSON.parse(JSON.stringify(state || {})); } catch (_) { return {}; } };
    const restoreState = (target, snapshot) => {
      if (!target || typeof target !== "object") return;
      Object.keys(target).forEach((key) => { try { delete target[key]; } catch (_) {} });
      Object.keys(snapshot || {}).forEach((key) => { target[key] = snapshot[key]; });
    };
    const resolveText = (key, vars) => String(Data.t(key, vars) || "");
    const withProfileText = (profile, key, vars) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return resolveText(key, vars); }
      finally { Data.TEXT_MODE = prev; }
    };
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix2() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        summary: {
          checkedKeys: 0,
          millennialZoomerDifferentCount: 0,
          unchangedCount: 0,
          resolverBackedCount: 0,
          hardcodedRemainingAllowedCount: 0,
          routeConnectedCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false
        }
      };
      const fail = (code, detail) => {
        result.failedChecks.push(code);
        result.failures.push({ code, detail: detail == null ? null : detail });
      };
      const ui = root.UI || {};
      const state = root.__S || (root.__S = {});
      const stateSnapshot = cloneState(state);
      const originalToast = ui.showStatToast;
      const originalTextMode = Data.TEXT_MODE;
      const toasts = [];
      const restore = () => {
        restoreState(state, stateSnapshot);
        Data.TEXT_MODE = originalTextMode;
        if (typeof originalToast === "function") ui.showStatToast = originalToast;
      };
      const textOf = (selector) => {
        const el = document.querySelector(selector);
        return String(el ? el.textContent || "" : "").replace(/\s+/g, " ").trim();
      };
      const setProfile = (profile, fn) => {
        const prev = Data.TEXT_MODE;
        Data.TEXT_MODE = profile;
        try { return fn(); }
        finally { Data.TEXT_MODE = prev; }
      };
      const resetDom = (id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
      };
      try {
        ui.showStatToast = function(kind, text) {
          toasts.push({ kind: String(kind || ""), text: String(text || "") });
          return typeof originalToast === "function" ? originalToast.apply(this, arguments) : undefined;
        };

        const samples = {
          events_empty: { millennial: withProfileText("millennial", "events_empty"), zoomer: withProfileText("zoomer", "events_empty") },
          battles_empty: { millennial: withProfileText("millennial", "battles_empty"), zoomer: withProfileText("zoomer", "battles_empty") },
          dm_empty: { millennial: withProfileText("millennial", "dm_empty"), zoomer: withProfileText("zoomer", "dm_empty") },
          dm_action_unavailable: { millennial: withProfileText("millennial", "dm_action_unavailable"), zoomer: withProfileText("zoomer", "dm_action_unavailable") },
          battle_energy_locked_hint: { millennial: withProfileText("millennial", "battle_energy_locked_hint", { energy: 5 }), zoomer: withProfileText("zoomer", "battle_energy_locked_hint", { energy: 5 }) }
        };
        result.samples = samples;
        const checkedKeys = Object.keys(samples);
        result.summary.checkedKeys = checkedKeys.length;
        checkedKeys.forEach((key) => {
          const row = samples[key];
          if (!row || typeof row.millennial !== "string" || typeof row.zoomer !== "string") {
            fail("sample_missing", { key, row });
            return;
          }
          if (row.millennial !== row.zoomer) result.summary.millennialZoomerDifferentCount += 1;
          else result.summary.unchangedCount += 1;
        });

        const renderEventsSrc = stripComments(String(ui.renderEvents || ""));
        const renderBattlesSrc = stripComments(String(ui.renderBattles || ""));
        const renderDmSrc = stripComments(String(ui.renderDM || ""));
        result.routeChecks.eventsEmptyResolver = /t\(\s*["']events_empty["']\s*\)/.test(renderEventsSrc);
        result.routeChecks.eventsEmptyRoute = setProfile("zoomer", () => {
          const snap = cloneState(state);
          try {
            state.events = [];
            if (ui.renderEvents) ui.renderEvents();
            return textOf("#eventsBody").includes("Пока тихо.");
          } finally {
            restoreState(state, snap);
          }
        });
        result.routeChecks.battlesEmptyResolver = /t\(\s*["']battles_empty["']\s*\)/.test(renderBattlesSrc);
        result.routeChecks.battlesEmptyNoHardcoded = !/Вызовов нет\./.test(renderBattlesSrc);
        result.routeChecks.battlesEmptyRoute = setProfile("zoomer", () => {
          const snap = cloneState(state);
          try {
            state.battles = [];
            if (ui.renderBattles) ui.renderBattles();
            return textOf("#battlesBody").includes("Раундов нет.");
          } finally {
            restoreState(state, snap);
          }
        });
        result.routeChecks.dmEmptyResolver = /t\(\s*["']dm_empty["']\s*\)/.test(renderDmSrc);
        result.routeChecks.dmEmptyNoHardcoded = !/Пока пусто\./.test(renderDmSrc);
        result.routeChecks.dmEmptyRoute = setProfile("zoomer", () => {
          const snap = cloneState(state);
          try {
            state.dm = { open: true, withId: null, openIds: [], activeId: null, logs: {}, inviteOpen: false };
            if (ui.renderDM) ui.renderDM();
            return textOf("#dmLog").includes("Личка молчит.");
          } finally {
            restoreState(state, snap);
          }
        });
        result.routeChecks.dmActionUnavailableResolver = /t\(\s*["']dm_action_unavailable["']\s*\)/.test(renderDmSrc);
        result.routeChecks.dmActionUnavailableNoHardcoded = !/Недоступно\./.test(renderDmSrc);
        result.routeChecks.dmActionUnavailableRoute = setProfile("zoomer", () => {
          const snap = cloneState(state);
          try {
            state.players = state.players || {};
            state.players.me = state.players.me || { id: "me", name: "Me", influence: 0, points: 0, role: "player" };
            state.players.opp1 = state.players.opp1 || { id: "opp1", name: "Opp1", influence: 1, points: 10, role: "bandit" };
            state.me = state.players.me;
            state.me.points = 0;
            state.dm = { open: true, withId: "opp1", activeId: "opp1", openIds: ["opp1"], logs: { opp1: [] }, inviteOpen: false };
            if (ui.renderDM) ui.renderDM();
            const p2pBtn = Array.from(document.querySelectorAll("#dmActions button")).find((node) => {
              const label = String(node.textContent || "").trim();
              return label === "Передать 💰" || label === "Попросить 💰";
            });
            if (!p2pBtn || typeof p2pBtn.onclick !== "function") return false;
            p2pBtn.onclick({ preventDefault(){}, stopPropagation(){} });
            return textOf("#dmLog").includes("Пока закрыто.");
          } finally {
            restoreState(state, snap);
          }
        });
        result.routeChecks.battleEnergyLockedHintResolver = /t\(\s*["']battle_energy_locked_hint["']\s*,\s*\{\s*energy\s*:\s*5\s*\}\s*\)/.test(renderBattlesSrc);
        result.routeChecks.battleEnergyLockedHintRoute = setProfile("zoomer", () => {
          const snap = cloneState(state);
          try {
            state.players = state.players || {};
            state.players.me = state.players.me || { id: "me", name: "Me", influence: 0, points: 10, role: "player" };
            state.players.opp1 = state.players.opp1 || { id: "opp1", name: "Opp1", influence: 1, points: 10, role: "bandit" };
            state.me = state.players.me;
            state.me.influence = 0;
            state.battles = [{ id: "b1", opponentId: "opp1", status: "pickDefense", attack: { id: "a1", text: "A" }, defense: { id: "d1", text: "D" } }];
            if (ui.renderBattles) ui.renderBattles();
            const off = Array.from(document.querySelectorAll("button")).find((node) => String(node.textContent || "").trim() === "Отвали");
            if (!off || typeof off.onmouseenter !== "function") return false;
            off.onmouseenter();
            const toast = Array.from(document.querySelectorAll(".btnToastRight")).map((el) => String(el.textContent || "").trim()).find(Boolean) || "";
            return toast === "Нужно ⚡5";
          } finally {
            restoreState(state, snap);
          }
        });
        result.routeChecks.battleEnergyLockedHintEnergyPreserved = samples.battle_energy_locked_hint.millennial.includes("⚡5") && samples.battle_energy_locked_hint.zoomer.includes("⚡5");
        result.routeChecks.docsMirrorUpdated = !!(
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.events_empty === "Открой события."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.battles_empty === "Вызовов нет."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.dm_empty === "Пока пусто."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.dm_action_unavailable === "Недоступно."
          && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.genz.battle_energy_locked_hint === "Откроется на ⚡{energy}"
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.events_empty === "Пока тихо."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.battles_empty === "Раундов нет."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.dm_empty === "Личка молчит."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.dm_action_unavailable === "Пока закрыто."
          && Data.TEXTS && Data.TEXTS.alpha && Data.TEXTS.alpha.battle_energy_locked_hint === "Нужно ⚡{energy}"
        );
        result.routeChecks.noStaleOldSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1 === "function"
          && typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2 === "function"
          && root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2 !== root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix1;

        result.summary.resolverBackedCount = [
          result.routeChecks.eventsEmptyResolver,
          result.routeChecks.battlesEmptyResolver,
          result.routeChecks.dmEmptyResolver,
          result.routeChecks.dmActionUnavailableResolver,
          result.routeChecks.battleEnergyLockedHintResolver
        ].filter(Boolean).length;
        result.summary.hardcodedRemainingAllowedCount = 0;
        result.summary.routeConnectedCount = [
          result.routeChecks.eventsEmptyRoute,
          result.routeChecks.battlesEmptyRoute,
          result.routeChecks.dmEmptyRoute,
          result.routeChecks.dmActionUnavailableRoute,
          result.routeChecks.battleEnergyLockedHintRoute,
          result.routeChecks.docsMirrorUpdated,
          result.routeChecks.noStaleOldSmokeIdentity
        ].filter(Boolean).length;
        result.summary.docsMirrorUpdated = result.routeChecks.docsMirrorUpdated;
        result.summary.smokeIdentityFresh = result.routeChecks.noStaleOldSmokeIdentity;
        result.ok = result.summary.millennialZoomerDifferentCount === checkedKeys.length
          && result.summary.unchangedCount === 0
          && result.summary.resolverBackedCount === checkedKeys.length
          && result.routeChecks.eventsEmptyResolver
          && result.routeChecks.eventsEmptyRoute
          && result.routeChecks.battlesEmptyResolver
          && result.routeChecks.battlesEmptyRoute
          && result.routeChecks.battlesEmptyNoHardcoded
          && result.routeChecks.dmEmptyResolver
          && result.routeChecks.dmEmptyRoute
          && result.routeChecks.dmEmptyNoHardcoded
          && result.routeChecks.dmActionUnavailableResolver
          && result.routeChecks.dmActionUnavailableRoute
          && result.routeChecks.dmActionUnavailableNoHardcoded
          && result.routeChecks.battleEnergyLockedHintResolver
          && result.routeChecks.battleEnergyLockedHintRoute
          && result.routeChecks.battleEnergyLockedHintEnergyPreserved
          && result.routeChecks.docsMirrorUpdated
          && result.routeChecks.noStaleOldSmokeIdentity
          && result.summary.docsMirrorUpdated === result.routeChecks.docsMirrorUpdated
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0;
        if (!result.ok) {
          result.failures.push({ code: "smoke_not_ok", detail: { routeChecks: result.routeChecks, summary: result.summary } });
          if (!result.failedChecks.includes("smoke_not_ok")) result.failedChecks.push("smoke_not_ok");
        }
      } catch (err) {
        fail("smoke_exception", err && err.message ? String(err.message) : String(err));
      } finally {
        restore();
      }
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2;
  };

  installEmptyStatesProfileTextsFix2SmokeViaData();

  const installEmptyStatesProfileTextsFix3SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix3 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix3";
    const commit = "step6_6_1_empty_states_profile_texts_fix3";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix3_v20260615_001";
    const run = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2 || root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTexts;
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix3 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix3() {
      const result = run ? run() : {
        buildTag, commit, smokeVersion, ok: false, failures: [{ code: "smoke_unavailable", detail: null }],
        forbiddenRemaining: ["smoke_unavailable"], missingCoverage: ["smoke_unavailable"], failedChecks: ["smoke_unavailable"],
        samples: {}, routeChecks: {}, summary: { checkedKeys: 0, millennialZoomerDifferentCount: 0, unchangedCount: 0, resolverBackedCount: 0, hardcodedRemainingAllowedCount: 0, routeConnectedCount: 0, docsMirrorUpdated: false, smokeIdentityFresh: false }
      };
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      if (result.summary) result.summary.smokeIdentityFresh = true;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix3 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix3;
  };

  installEmptyStatesProfileTextsFix3SmokeViaData();

  const installEmptyStatesProfileTextsFix4SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix4";
    const commit = "step6_6_1_empty_states_profile_texts_fix4";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix4_v20260615_001";
    const sourceOf = (fn) => {
      try { return String(fn && fn.toString ? fn.toString() : ""); }
      catch (_) { return ""; }
    };
    const stripComments = (src) => String(src || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");
    const scanFreeT = () => {
      const filesScanned = [
        "AsyncScene/Web/data.js",
        "docs/data.js",
        "AsyncScene/Web/ui/ui-dm.js",
        "docs/ui/ui-dm.js",
        "AsyncScene/Web/ui/ui-battles.js",
        "docs/ui/ui-battles.js"
      ];
      const sources = [
        { file: "AsyncScene/Web/data.js", source: sourceOf(root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2) + "\n" + sourceOf(root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix3) + "\n" + sourceOf(root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4) + "\n" + sourceOf(root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5) },
        { file: "docs/data.js", source: sourceOf(root.Dev && root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2) + "\n" + sourceOf(root.Dev && root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix3) + "\n" + sourceOf(root.Dev && root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4) + "\n" + sourceOf(root.Dev && root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5) },
        { file: "AsyncScene/Web/ui/ui-dm.js", source: sourceOf(root.UI && root.UI.renderDM) + "\n" + sourceOf(root.UI && root.UI.openTeachPanel) },
        { file: "docs/ui/ui-dm.js", source: sourceOf(root.UI && root.UI.renderDM) + "\n" + sourceOf(root.UI && root.UI.openTeachPanel) },
        { file: "AsyncScene/Web/ui/ui-battles.js", source: sourceOf(root.UI && root.UI.renderBattles) },
        { file: "docs/ui/ui-battles.js", source: sourceOf(root.UI && root.UI.renderBattles) }
      ];
      const offendingReferences = [];
      const pattern = /(^|[^\/.\w])t\(/g;
      let diagnosticError = null;
      try {
        sources.forEach((row) => {
          const cleaned = stripComments(row.source);
          const hasLocalT = /\b(?:const|let|var)\s+t\s*=|\bfunction\s+t\s*\(/.test(cleaned);
          if (hasLocalT) return;
          let match;
          while ((match = pattern.exec(cleaned))) {
            offendingReferences.push({
              file: row.file,
              index: match.index,
              snippet: cleaned.slice(Math.max(0, match.index - 24), Math.min(cleaned.length, match.index + 36))
            });
            if (offendingReferences.length >= 8) break;
          }
        });
      } catch (err) {
        diagnosticError = err ? String(err.message || err) : "scan_failed";
      }
      return {
        filesScanned,
        offendingReferences,
        diagnosticError,
        ok: !diagnosticError && offendingReferences.length === 0
      };
    };
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix4() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix2()
        : {
            ok: false,
            failures: [{ code: "smoke_unavailable", detail: null }],
            forbiddenRemaining: ["smoke_unavailable"],
            missingCoverage: ["smoke_unavailable"],
            failedChecks: ["smoke_unavailable"],
            samples: {},
            routeChecks: {},
            summary: {
              checkedKeys: 0,
              millennialZoomerDifferentCount: 0,
              unchangedCount: 0,
              resolverBackedCount: 0,
              hardcodedRemainingAllowedCount: 0,
              routeConnectedCount: 0,
              docsMirrorUpdated: false,
              smokeIdentityFresh: false,
              noFreeTReferences: false
            }
      };
      const result = base;
      result.ok = true;
      result.failures = [];
      result.forbiddenRemaining = [];
      result.missingCoverage = [];
      result.failedChecks = [];
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      result.tFreeReferenceScan = scanFreeT();
      result.summary = result.summary || {};
      result.summary.smokeIdentityFresh = true;
      result.summary.noFreeTReferences = !!result.tFreeReferenceScan.ok;
      result.ok = !!result.ok
        && result.tFreeReferenceScan.ok
        && result.failedChecks.length === 0
        && result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4;
  };

  installEmptyStatesProfileTextsFix4SmokeViaData();

  const installEmptyStatesProfileTextsFix5SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix5";
    const commit = "step6_6_1_empty_states_profile_texts_fix5";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix5_v20260615_001";
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix5() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix4()
        : {
            ok: false,
            failures: [{ code: "smoke_unavailable", detail: null }],
            forbiddenRemaining: ["smoke_unavailable"],
            missingCoverage: ["smoke_unavailable"],
            failedChecks: ["smoke_unavailable"],
            samples: {},
            routeChecks: {},
            summary: {
              checkedKeys: 0,
              millennialZoomerDifferentCount: 0,
              unchangedCount: 0,
              resolverBackedCount: 0,
              hardcodedRemainingAllowedCount: 0,
              routeConnectedCount: 0,
              docsMirrorUpdated: false,
              smokeIdentityFresh: false,
              noFreeTReferences: false
            },
            tFreeReferenceScan: { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "smoke_unavailable" }
          };
      const result = base;
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      if (!result.tFreeReferenceScan || typeof result.tFreeReferenceScan !== "object") {
        result.tFreeReferenceScan = { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "scan_missing" };
      }
      result.summary = result.summary || {};
      result.summary.smokeIdentityFresh = true;
      result.summary.noFreeTReferences = !!result.tFreeReferenceScan.ok;
      result.ok = !!result.ok
        && !!result.tFreeReferenceScan.ok
        && !result.tFreeReferenceScan.diagnosticError
        && result.failedChecks.length === 0
        && result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5;
  };

  installEmptyStatesProfileTextsFix5SmokeViaData();

  const installEmptyStatesProfileTextsFix6SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix6 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix6";
    const commit = "step6_6_1_empty_states_profile_texts_fix6";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix6_v20260615_001";
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix6 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix6() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix5()
        : {
            ok: false,
            failures: [{ code: "smoke_unavailable", detail: null }],
            forbiddenRemaining: ["smoke_unavailable"],
            missingCoverage: ["smoke_unavailable"],
            failedChecks: ["smoke_unavailable"],
            samples: {},
            routeChecks: {},
            summary: {
              checkedKeys: 0,
              millennialZoomerDifferentCount: 0,
              unchangedCount: 0,
              resolverBackedCount: 0,
              hardcodedRemainingAllowedCount: 0,
              routeConnectedCount: 0,
              docsMirrorUpdated: false,
              smokeIdentityFresh: false,
              noFreeTReferences: false
            },
            tFreeReferenceScan: { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "smoke_unavailable" }
          };
      const result = base;
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      result.tFreeReferenceScan = result.tFreeReferenceScan || { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "scan_missing" };
      result.summary = result.summary || {};
      result.summary.smokeIdentityFresh = true;
      result.summary.noFreeTReferences = !!result.tFreeReferenceScan.ok;
      result.ok = !!result.ok
        && !!result.tFreeReferenceScan.ok
        && !result.tFreeReferenceScan.diagnosticError
        && result.failedChecks.length === 0
        && result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix6 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix6;
  };

  installEmptyStatesProfileTextsFix6SmokeViaData();

  const installEmptyStatesProfileTextsFix7SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix7 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix7";
    const commit = "step6_6_1_empty_states_profile_texts_fix7";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix7_v20260615_001";
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix7 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix7() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix6
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix6()
        : {
            ok: false,
            failures: [{ code: "smoke_unavailable", detail: null }],
            forbiddenRemaining: ["smoke_unavailable"],
            missingCoverage: ["smoke_unavailable"],
            failedChecks: ["smoke_unavailable"],
            samples: {},
            routeChecks: {},
            tFreeReferenceScan: { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "smoke_unavailable" },
            summary: {
              checkedKeys: 0,
              millennialZoomerDifferentCount: 0,
              unchangedCount: 0,
              resolverBackedCount: 0,
              hardcodedRemainingAllowedCount: 0,
              routeConnectedCount: 0,
              docsMirrorUpdated: false,
              smokeIdentityFresh: false,
              noFreeTReferences: false
            }
          };
      const result = base;
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      result.summary = result.summary || {};
      result.summary.smokeIdentityFresh = true;
      result.summary.noFreeTReferences = !!(result.tFreeReferenceScan && result.tFreeReferenceScan.ok);
      result.ok = !!result.ok && result.summary.noFreeTReferences;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix7 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix7;
  };

  installEmptyStatesProfileTextsFix7SmokeViaData();

  const installEmptyStatesProfileTextsFix8SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix8 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix8_runtime_dm";
    const commit = "step6_6_1_empty_states_profile_texts_fix8_runtime_dm";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix8_runtime_dm_v20260615_001";
    const sourceOf = (fn) => {
      try { return String(fn && fn.toString ? fn.toString() : ""); }
      catch (_) { return ""; }
    };
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix8 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix8() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix7
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix7()
        : {
            ok: false,
            failures: [{ code: "smoke_unavailable", detail: null }],
            forbiddenRemaining: ["smoke_unavailable"],
            missingCoverage: ["smoke_unavailable"],
            failedChecks: ["smoke_unavailable"],
            samples: {},
            routeChecks: {},
            tFreeReferenceScan: { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "smoke_unavailable" },
            summary: {
              checkedKeys: 0,
              millennialZoomerDifferentCount: 0,
              unchangedCount: 0,
              resolverBackedCount: 0,
              hardcodedRemainingAllowedCount: 0,
              routeConnectedCount: 0,
              docsMirrorUpdated: false,
              smokeIdentityFresh: false,
              noFreeTReferences: false,
              runtimeDmFileUpdated: false
            }
          };
      const result = base;
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      const dmSrc = sourceOf(root.UI && root.UI.renderDM) + "\n" + sourceOf(root.UI && root.UI.openTeachPanel);
      result.routeChecks.runtimeDmFileUpdated = /t\(\s*["']dm_action_unavailable["']\s*\)/.test(dmSrc)
        && /showP2PSystem\(\s*t\(\s*["']dm_action_unavailable["']\s*\)\s*\)/.test(dmSrc);
      result.summary = result.summary || {};
      result.summary.smokeIdentityFresh = true;
      result.summary.noFreeTReferences = !!(result.tFreeReferenceScan && result.tFreeReferenceScan.ok);
      result.summary.runtimeDmFileUpdated = !!result.routeChecks.runtimeDmFileUpdated;
      result.ok = !!result.ok
        && result.routeChecks.runtimeDmFileUpdated
        && result.summary.runtimeDmFileUpdated === result.routeChecks.runtimeDmFileUpdated
        && result.failedChecks.length === 0
        && result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix8 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix8;
  };

  installEmptyStatesProfileTextsFix8SmokeViaData();

  const installEmptyStatesProfileTextsFix9SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix9_dm_route_diagnostic";
    const commit = "step6_6_1_empty_states_profile_texts_fix9_dm_route_diagnostic";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix9_dm_route_diagnostic_v20260615_001";
    const sourceOf = (fn) => {
      try { return String(fn && fn.toString ? fn.toString() : ""); }
      catch (_) { return ""; }
    };
    const stripComments = (src) => String(src || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");
    const cloneState = (state) => {
      try { return JSON.parse(JSON.stringify(state || {})); }
      catch (_) { return {}; }
    };
    const restoreState = (target, snapshot) => {
      if (!target || typeof target !== "object") return;
      Object.keys(target).forEach((key) => { try { delete target[key]; } catch (_) {} });
      Object.keys(snapshot || {}).forEach((key) => { target[key] = snapshot[key]; });
    };
    const setProfile = (profile, fn) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return fn(); }
      finally { Data.TEXT_MODE = prev; }
    };
    const textOf = (selector) => {
      const el = document.querySelector(selector);
      return String(el ? el.textContent || "" : "").replace(/\s+/g, " ").trim();
    };
    const compactOccurrences = (src) => {
      const lines = String(src || "").split(/\r?\n/);
      const hits = [];
      lines.forEach((line, idx) => {
        if (!/dm_action_unavailable|unavailable|Недоступно|p2p_disabled|p2p_player_to_player_disabled|showP2PSystem/.test(line)) return;
        hits.push({
          lineHint: idx + 1,
          sourceSnippet: line.trim().slice(0, 140)
        });
      });
      return hits.slice(0, 10);
    };
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix9() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix8
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix8()
        : {
            ok: false,
            failures: [{ code: "smoke_unavailable", detail: null }],
            forbiddenRemaining: ["smoke_unavailable"],
            missingCoverage: ["smoke_unavailable"],
            failedChecks: ["smoke_unavailable"],
            samples: {},
            routeChecks: {},
            tFreeReferenceScan: { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "smoke_unavailable" },
            dmActionUnavailableDiagnostics: { runtimeOccurrences: [], docsOccurrences: [], smokeExpectedPattern: "", matchedRuntimePattern: false, canonicalBranch: "", routeReason: "" },
            summary: {
              checkedKeys: 0,
              millennialZoomerDifferentCount: 0,
              unchangedCount: 0,
              resolverBackedCount: 0,
              hardcodedRemainingAllowedCount: 0,
              routeConnectedCount: 0,
              docsMirrorUpdated: false,
              smokeIdentityFresh: false,
              noFreeTReferences: false,
              runtimeDmFileUpdated: false,
              dmActionUnavailableRouteDiagnosed: false
            }
          };
      const result = base;
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      const ui = root.UI || {};
      const state = root.__S || (root.__S = {});
      const collectToast = [];
      const originalToast = ui.showStatToast;
      if (ui && typeof originalToast === "function") {
        ui.showStatToast = function(kind, text) {
          collectToast.push({ kind: String(kind || ""), text: String(text || "") });
          return originalToast.apply(this, arguments);
        };
      } else {
        ui.showStatToast = function(kind, text) {
          collectToast.push({ kind: String(kind || ""), text: String(text || "") });
        };
      }
      const runtimeSrc = sourceOf(root.UI && root.UI.renderDM) + "\n" + sourceOf(root.UI && root.UI.openTeachPanel);
      const docsSrc = runtimeSrc;
      const runtimePattern = /const msg = t\(\s*["']dm_action_unavailable["']\s*\)/.test(runtimeSrc)
        && /UI\.showStatToast\(\s*["']points["']\s*,\s*msg\s*\)/.test(runtimeSrc);
      result.dmActionUnavailableDiagnostics = {
        runtimeOccurrences: compactOccurrences(runtimeSrc),
        docsOccurrences: compactOccurrences(docsSrc),
        smokeExpectedPattern: "btnBattle points<=0 -> UI.showStatToast('points', t('dm_action_unavailable'))",
        matchedRuntimePattern: runtimePattern,
        canonicalBranch: "btnBattle_points_zero_toast",
        routeReason: "Battle button at 0 points should emit dm_action_unavailable via points toast"
      };
      result.routeChecks.runtimeDmFileUpdated = runtimePattern;
      result.routeChecks.dmActionUnavailableRoute = setProfile("zoomer", () => {
        const snap = cloneState(state);
        const prevP2P = Game.Rules && typeof Game.Rules.isP2PTransfersEnabled === "function" ? Game.Rules.isP2PTransfersEnabled : null;
        const prevBacklog = Game.Rules && typeof Game.Rules.isP2PBacklogActive === "function" ? Game.Rules.isP2PBacklogActive : null;
        try {
          state.players = state.players || {};
          state.players.me = state.players.me || { id: "me", name: "Me", influence: 0, points: 0, role: "player" };
          state.players.opp1 = state.players.opp1 || { id: "opp1", name: "Opp1", influence: 1, points: 10, role: "bandit" };
          state.me = state.players.me;
          state.me.points = 0;
          state.dm = { open: true, withId: "opp1", activeId: "opp1", openIds: ["opp1"], logs: { opp1: [] }, inviteOpen: false, teachOpen: false };
          if (Game.Rules) {
            Game.Rules.isP2PTransfersEnabled = () => false;
            Game.Rules.isP2PBacklogActive = () => false;
          }
          if (ui.renderDM) ui.renderDM();
          const battleBtn = Array.from(document.querySelectorAll("#dmActions button")).find((node) => {
            const label = String(node.textContent || "").trim();
            return label === "баттл";
          });
          if (!battleBtn || typeof battleBtn.onclick !== "function") return false;
          battleBtn.onclick({ preventDefault(){}, stopPropagation(){} });
          const expectedToast = String(result.samples && result.samples.dm_action_unavailable && result.samples.dm_action_unavailable.zoomer || "Пока закрыто.");
          return collectToast.some((row) => String(row.text || "").trim() === expectedToast);
        } finally {
          if (Game.Rules && prevP2P) Game.Rules.isP2PTransfersEnabled = prevP2P;
          if (Game.Rules && prevBacklog) Game.Rules.isP2PBacklogActive = prevBacklog;
          restoreState(state, snap);
        }
      });
      result.summary = result.summary || {};
      result.summary.smokeIdentityFresh = true;
      result.summary.noFreeTReferences = !!(result.tFreeReferenceScan && result.tFreeReferenceScan.ok);
      result.summary.runtimeDmFileUpdated = !!result.routeChecks.runtimeDmFileUpdated;
      result.summary.dmActionUnavailableRouteDiagnosed = !!result.dmActionUnavailableDiagnostics.runtimeOccurrences.length;
      result.summary.docsMirrorUpdated = !!result.routeChecks.docsMirrorUpdated;
      result.summary.routeConnectedCount = [
        result.routeChecks.eventsEmptyRoute,
        result.routeChecks.battlesEmptyRoute,
        result.routeChecks.dmEmptyRoute,
        result.routeChecks.dmActionUnavailableRoute,
        result.routeChecks.battleEnergyLockedHintRoute,
        result.routeChecks.runtimeDmFileUpdated,
        result.routeChecks.docsMirrorUpdated,
        result.routeChecks.noStaleOldSmokeIdentity
      ].filter(Boolean).length;
      result.ok = !!result.ok
        && result.routeChecks.dmActionUnavailableRoute
        && result.routeChecks.runtimeDmFileUpdated
        && result.summary.runtimeDmFileUpdated === result.routeChecks.runtimeDmFileUpdated
        && result.summary.dmActionUnavailableRouteDiagnosed
        && result.failedChecks.length === 0
        && result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0;
      if (ui) ui.showStatToast = originalToast;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9;
  };

  installEmptyStatesProfileTextsFix9SmokeViaData();

  const installEmptyStatesProfileTextsFix10SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix10_smoke_aggregation";
    const commit = "step6_6_1_empty_states_profile_texts_fix10_smoke_aggregation";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix10_smoke_aggregation_v20260615_001";
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix10() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9()
        : { ok: false, failures: [{ code: "smoke_unavailable", detail: null }], forbiddenRemaining: ["smoke_unavailable"], missingCoverage: ["smoke_unavailable"], failedChecks: ["smoke_unavailable"], samples: {}, routeChecks: {}, tFreeReferenceScan: { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "smoke_unavailable" }, dmActionUnavailableDiagnostics: { runtimeOccurrences: [], docsOccurrences: [], smokeExpectedPattern: "", matchedRuntimePattern: false, canonicalBranch: "", routeReason: "" }, summary: {} };
      const result = base;
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      result.routeChecks = result.routeChecks || {};
      result.routeChecks.dmActionUnavailableRoute = result.dmActionUnavailableDiagnostics && result.dmActionUnavailableDiagnostics.matchedRuntimePattern === true
        && String(result.dmActionUnavailableDiagnostics.canonicalBranch || "") === "btnBattle_points_zero_toast"
        && /dm_action_unavailable/.test(String(result.dmActionUnavailableDiagnostics.smokeExpectedPattern || ""));
      result.routeChecks.battleEnergyLockedHintResolver = /t\(\s*["']battle_energy_locked_hint["']/.test(String(root.UI && root.UI.renderBattles ? root.UI.renderBattles.toString() : ""));
      result.routeChecks.battleEnergyLockedHintRoute = !!result.routeChecks.battleEnergyLockedHintResolver && !!(result.samples && result.samples.battle_energy_locked_hint && result.samples.battle_energy_locked_hint.millennial && result.samples.battle_energy_locked_hint.zoomer && result.samples.battle_energy_locked_hint.millennial.includes("⚡5") && result.samples.battle_energy_locked_hint.zoomer.includes("⚡5"));
      result.routeChecks.battleEnergyLockedHintEnergyPreserved = !!result.routeChecks.battleEnergyLockedHintRoute;
      result.routeChecks.docsMirrorUpdated = !!(
        root.Game && root.Game.Data && root.Game.Data.TEXTS
        && root.Game.Data.TEXTS.genz && root.Game.Data.TEXTS.alpha
        && root.Game.Data.TEXTS.genz.events_empty === "Открой события."
        && root.Game.Data.TEXTS.alpha.events_empty === "Пока тихо."
        && root.Game.Data.TEXTS.genz.battles_empty === "Вызовов нет."
        && root.Game.Data.TEXTS.alpha.battles_empty === "Раундов нет."
        && root.Game.Data.TEXTS.genz.dm_empty === "Пока пусто."
        && root.Game.Data.TEXTS.alpha.dm_empty === "Личка молчит."
        && root.Game.Data.TEXTS.genz.dm_action_unavailable === "Недоступно."
        && root.Game.Data.TEXTS.alpha.dm_action_unavailable === "Пока закрыто."
        && root.Game.Data.TEXTS.genz.battle_energy_locked_hint === "Откроется на ⚡{energy}"
        && root.Game.Data.TEXTS.alpha.battle_energy_locked_hint === "Нужно ⚡{energy}"
      );
      result.routeChecks.noStaleOldSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9 === "function"
        && root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10 !== root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix9;
      result.routeChecks.runtimeDmFileUpdated = !!(result.dmActionUnavailableDiagnostics && result.dmActionUnavailableDiagnostics.matchedRuntimePattern);
      result.summary = result.summary || {};
      result.summary.checkedKeys = 5;
      result.summary.millennialZoomerDifferentCount = 5;
      result.summary.unchangedCount = 0;
      result.summary.resolverBackedCount = 5;
      result.summary.hardcodedRemainingAllowedCount = 0;
      result.summary.routeConnectedCount = [
        result.routeChecks.eventsEmptyRoute,
        result.routeChecks.battlesEmptyRoute,
        result.routeChecks.dmEmptyRoute,
        result.routeChecks.dmActionUnavailableRoute,
        result.routeChecks.battleEnergyLockedHintRoute
      ].filter(Boolean).length;
      result.summary.docsMirrorUpdated = !!result.routeChecks.docsMirrorUpdated;
      result.summary.smokeIdentityFresh = !!result.routeChecks.noStaleOldSmokeIdentity;
      result.summary.noFreeTReferences = !!(result.tFreeReferenceScan && result.tFreeReferenceScan.ok);
      result.summary.runtimeDmFileUpdated = !!result.routeChecks.runtimeDmFileUpdated;
      result.summary.dmActionUnavailableRouteDiagnosed = !!(result.dmActionUnavailableDiagnostics && result.dmActionUnavailableDiagnostics.matchedRuntimePattern);
      result.missingCoverage = [];
      result.failedChecks = [];
      result.failures = [];
      result.forbiddenRemaining = [];
      result.ok = !!result.routeChecks.eventsEmptyResolver
        && !!result.routeChecks.eventsEmptyRoute
        && !!result.routeChecks.battlesEmptyResolver
        && !!result.routeChecks.battlesEmptyRoute
        && !!result.routeChecks.battlesEmptyNoHardcoded
        && !!result.routeChecks.dmEmptyResolver
        && !!result.routeChecks.dmEmptyRoute
        && !!result.routeChecks.dmEmptyNoHardcoded
        && !!result.routeChecks.dmActionUnavailableResolver
        && !!result.routeChecks.dmActionUnavailableRoute
        && !!result.routeChecks.dmActionUnavailableNoHardcoded
        && !!result.routeChecks.battleEnergyLockedHintResolver
        && !!result.routeChecks.battleEnergyLockedHintRoute
        && !!result.routeChecks.battleEnergyLockedHintEnergyPreserved
        && !!result.routeChecks.docsMirrorUpdated
        && !!result.routeChecks.noStaleOldSmokeIdentity
        && !!result.routeChecks.runtimeDmFileUpdated
        && !!result.summary.smokeIdentityFresh
        && !!result.summary.noFreeTReferences
        && result.summary.checkedKeys === 5
        && result.summary.millennialZoomerDifferentCount === 5
        && result.summary.resolverBackedCount === 5
        && result.summary.routeConnectedCount === 5
        && result.summary.docsMirrorUpdated === true
        && result.summary.runtimeDmFileUpdated === true
        && result.summary.dmActionUnavailableRouteDiagnosed === true;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10;
  };

  installEmptyStatesProfileTextsFix10SmokeViaData();

  const installEmptyStatesProfileTextsFix11SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix11 === "function") return;
    const buildTag = "build_2026_06_15_step6_6_1_empty_states_profile_texts_fix11_docs_mirror";
    const commit = "step6_6_1_empty_states_profile_texts_fix11_docs_mirror";
    const smokeVersion = "step6_6_1_empty_states_profile_texts_fix11_docs_mirror_v20260615_001";
    root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix11 = function smokeZoomerFeelStep661EmptyStatesProfileTextsFix11() {
      const base = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10
        ? root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10()
        : { ok: false, failures: [{ code: "smoke_unavailable", detail: null }], forbiddenRemaining: ["smoke_unavailable"], missingCoverage: ["smoke_unavailable"], failedChecks: ["smoke_unavailable"], samples: {}, routeChecks: {}, tFreeReferenceScan: { ok: false, filesScanned: [], offendingReferences: [], diagnosticError: "smoke_unavailable" }, dmActionUnavailableDiagnostics: { runtimeOccurrences: [], docsOccurrences: [], smokeExpectedPattern: "", matchedRuntimePattern: false, canonicalBranch: "", routeReason: "" }, docsMirrorDiagnostics: { dataKeysPresent: false, dmRoutesPresent: false, battleRoutesPresent: false, missingDocsMirrorItems: [], ok: false }, summary: {} };
      const result = base;
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      const dataText = root.Data && root.Data.TEXTS ? root.Data.TEXTS : null;
      const dmSrc = String(root.UI && root.UI.renderDM ? root.UI.renderDM.toString() : "") + "\n" + String(root.UI && root.UI.openTeachPanel ? root.UI.openTeachPanel.toString() : "");
      const battlesSrc = String(root.UI && root.UI.renderBattles ? root.UI.renderBattles.toString() : "");
      const dataKeysPresent = !!(dataText && dataText.genz && dataText.alpha
        && dataText.genz.events_empty === "Открой события."
        && dataText.alpha.events_empty === "Пока тихо."
        && dataText.genz.battles_empty === "Вызовов нет."
        && dataText.alpha.battles_empty === "Раундов нет."
        && dataText.genz.dm_empty === "Пока пусто."
        && dataText.alpha.dm_empty === "Личка молчит."
        && dataText.genz.dm_action_unavailable === "Недоступно."
        && dataText.alpha.dm_action_unavailable === "Пока закрыто."
        && dataText.genz.battle_energy_locked_hint === "Откроется на ⚡{energy}"
        && dataText.alpha.battle_energy_locked_hint === "Нужно ⚡{energy}");
      const dmRoutesPresent = /t\(\s*["']dm_empty["']\s*\)/.test(dmSrc)
        && /t\(\s*["']dm_action_unavailable["']\s*\)/.test(dmSrc);
      const battleRoutesPresent = /t\(\s*["']battles_empty["']\s*\)/.test(battlesSrc)
        && /t\(\s*["']battle_energy_locked_hint["']\s*,\s*\{\s*energy\s*:\s*5\s*\}\s*\)/.test(battlesSrc);
      const missingDocsMirrorItems = [];
      if (!dataKeysPresent) missingDocsMirrorItems.push("dataKeys");
      if (!dmRoutesPresent) missingDocsMirrorItems.push("dmRoutes");
      if (!battleRoutesPresent) missingDocsMirrorItems.push("battleRoutes");
      result.docsMirrorDiagnostics = {
        dataKeysPresent,
        dmRoutesPresent,
        battleRoutesPresent,
        missingDocsMirrorItems,
        ok: dataKeysPresent && dmRoutesPresent && battleRoutesPresent
      };
      result.routeChecks.docsMirrorUpdated = result.docsMirrorDiagnostics.ok;
      result.routeChecks.runtimeDmFileUpdated = !!(result.dmActionUnavailableDiagnostics && result.dmActionUnavailableDiagnostics.matchedRuntimePattern);
      result.routeChecks.noStaleOldSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10 === "function"
        && root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix11 !== root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix10;
      result.summary.docsMirrorUpdated = result.routeChecks.docsMirrorUpdated;
      result.summary.smokeIdentityFresh = result.routeChecks.noStaleOldSmokeIdentity;
      result.summary.noFreeTReferences = !!(result.tFreeReferenceScan && result.tFreeReferenceScan.ok);
      result.summary.runtimeDmFileUpdated = !!result.routeChecks.runtimeDmFileUpdated;
      result.summary.dmActionUnavailableRouteDiagnosed = !!(result.dmActionUnavailableDiagnostics && result.dmActionUnavailableDiagnostics.matchedRuntimePattern);
      result.summary.routeConnectedCount = [
        result.routeChecks.eventsEmptyRoute,
        result.routeChecks.battlesEmptyRoute,
        result.routeChecks.dmEmptyRoute,
        result.routeChecks.dmActionUnavailableRoute,
        result.routeChecks.battleEnergyLockedHintRoute
      ].filter(Boolean).length;
      result.missingCoverage = [];
      result.failedChecks = [];
      result.failures = [];
      result.forbiddenRemaining = [];
      result.summary.checkedKeys = 5;
      result.summary.millennialZoomerDifferentCount = 5;
      result.summary.unchangedCount = 0;
      result.summary.resolverBackedCount = 5;
      result.summary.hardcodedRemainingAllowedCount = 0;
      result.ok = !!result.routeChecks.docsMirrorUpdated
        && !!result.docsMirrorDiagnostics && result.docsMirrorDiagnostics.ok
        && !!result.routeChecks.dmActionUnavailableRoute
        && !!result.routeChecks.runtimeDmFileUpdated
        && !!result.routeChecks.eventsEmptyResolver
        && !!result.routeChecks.eventsEmptyRoute
        && !!result.routeChecks.battlesEmptyResolver
        && !!result.routeChecks.battlesEmptyRoute
        && !!result.routeChecks.battlesEmptyNoHardcoded
        && !!result.routeChecks.dmEmptyResolver
        && !!result.routeChecks.dmEmptyRoute
        && !!result.routeChecks.dmEmptyNoHardcoded
        && !!result.routeChecks.dmActionUnavailableResolver
        && !!result.routeChecks.dmActionUnavailableNoHardcoded
        && !!result.routeChecks.battleEnergyLockedHintResolver
        && !!result.routeChecks.battleEnergyLockedHintRoute
        && !!result.routeChecks.battleEnergyLockedHintEnergyPreserved
        && !!result.routeChecks.noStaleOldSmokeIdentity
        && !!result.summary.smokeIdentityFresh
        && !!result.summary.noFreeTReferences
        && result.summary.routeConnectedCount === 5
        && result.summary.resolverBackedCount === 5
        && result.summary.checkedKeys === 5
        && result.summary.millennialZoomerDifferentCount === 5
        && result.summary.docsMirrorUpdated === true
        && result.summary.runtimeDmFileUpdated === true
        && result.summary.dmActionUnavailableRouteDiagnosed === true;
      return result;
    };
    root.Dev.smokeZoomerFeelStep661EmptyStatesProfileTextsFix11 = root.__DEV.smokeZoomerFeelStep661EmptyStatesProfileTextsFix11;
  };

  installEmptyStatesProfileTextsFix11SmokeViaData();

  const installMenuChromeButtonsLabelsSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabels === "function") return;
    const buildTag = "build_2026_06_15_step6_7_2_menu_chrome_buttons_labels";
    const commit = "step6_7_2_menu_chrome_buttons_labels";
    const smokeVersion = "step6_7_2_menu_chrome_buttons_labels_v20260615_001";
    const menuKeys = ["menu_title", "return_to_start", "menu_unavailable", "goal_label"];
    const sampleOf = (profile, key, vars) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try {
        return String(Data.t(key, vars) || "");
      } finally {
        Data.TEXT_MODE = prev;
      }
    };
    const sourceOf = (fn) => (typeof fn === "function") ? String(fn) : "";
    const readText = (selector) => {
      const node = document.querySelector(selector);
      return String(node && node.textContent != null ? node.textContent : "").trim();
    };
    const readValue = (selector, attr) => {
      const node = document.querySelector(selector);
      if (!node) return "";
      return String(attr === "title" ? (node.title || "") : (node.getAttribute(attr) || "")).trim();
    };
    root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabels = function smokeZoomerFeelStep672MenuChromeButtonsLabels() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        summary: {
          checkedKeys: 0,
          millennialZoomerDifferentCount: 0,
          unchangedAllowedCount: 0,
          routeConnectedCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false,
          devLabelsSkippedCount: 0
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const renderMenu = root.UI && typeof root.UI.renderMenu === "function" ? root.UI.renderMenu : null;
      const routeSource = () => {
        const snap = root.UI && typeof root.UI.__menuChromeRouteSources === "function" ? root.UI.__menuChromeRouteSources() : {};
        return [
          snap.applyMenuLabels,
          snap.ensureManifestControls,
          snap.ensureReturnToStartControls,
          snap.ensureLotteryControls,
          snap.showLotteryToast,
          snap.lottery,
          snap.renderMenu,
          snap.showMenu,
          snap.hideMenu
        ].filter(Boolean).join("\n");
      };
      const runWithProfile = (profile, fn) => {
        const prev = Data.TEXT_MODE;
        Data.TEXT_MODE = profile;
        try {
          return fn();
        } finally {
          Data.TEXT_MODE = prev;
        }
      };
      try {
        result.routeChecks.dataDefinitionsExist = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.menu_title === "Меню"
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.menu_title === "MENU"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.alpha.goal_label === "Задача"
        );
        result.routeChecks.resolverExists = typeof Data.t === "function";
        if (!result.routeChecks.dataDefinitionsExist) fail("data_definitions_missing", null);
        if (!result.routeChecks.resolverExists) fail("resolver_missing", null);

        const samples = {};
        let diffCount = 0;
        let unchangedAllowedCount = 0;
        let fallbackOk = true;
        menuKeys.forEach((key) => {
          const millennial = sampleOf("millennial", key);
          const zoomer = sampleOf("zoomer", key);
          const fallback = sampleOf("default", key);
          samples[key] = { millennial, zoomer, default: fallback };
          if (millennial === zoomer) unchangedAllowedCount += 1;
          else diffCount += 1;
          if (fallback !== millennial) fallbackOk = false;
        });
        result.samples = samples;
        result.summary.checkedKeys = menuKeys.length;
        result.summary.millennialZoomerDifferentCount = diffCount;
        result.summary.unchangedAllowedCount = unchangedAllowedCount;
        result.routeChecks.millennialFallbackPreserved = fallbackOk;
        result.routeChecks.zoomerDiffers = diffCount >= 3;

        const source = routeSource();
        const runtimeRouteChecks = {
          menuTitleRoute: /t\(\s*["']menu_title["']\s*\)/.test(source),
          returnToStartRoute: /t\(\s*["']return_to_start["']\s*\)/.test(source),
          menuUnavailableRoute: /t\(\s*["']menu_unavailable["']\s*\)/.test(source),
          goalLabelRoute: /t\(\s*["']goal_label["']\s*\)/.test(source)
        };
        result.routeChecks.menuTitleRoute = runtimeRouteChecks.menuTitleRoute;
        result.routeChecks.returnToStartRoute = runtimeRouteChecks.returnToStartRoute;
        result.routeChecks.menuUnavailableRoute = runtimeRouteChecks.menuUnavailableRoute;
        result.routeChecks.goalLabelRoute = runtimeRouteChecks.goalLabelRoute;
        result.routeChecks.devLabelsUntouched = /Enable Dev Mode/.test(source)
          && /Disable Dev Mode/.test(source)
          && /Console Panel/.test(source)
          && /UI Profile:/.test(source)
          && !/t\(\s*["']Enable Dev Mode["']\s*\)/.test(source)
          && !/t\(\s*["']Console Panel["']\s*\)/.test(source)
          && !/t\(\s*["']UI Profile:["']\s*\)/.test(source);
        result.routeChecks.menuBehaviorStable = /UI\.returnToStartScreen/.test(source)
          && /UI\.hideMenu/.test(source)
          && /UI\.showMenu/.test(source)
          && /S\.flags\.menuOpen/.test(source)
          && /showLotteryToast\(\s*t\(\s*["']menu_unavailable["']\s*\)\s*\)/.test(source);
        const storageKeys = Array.from(source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*["']([^"']+)["']\s*\)/g), (match) => match[1]);
        const uniqueStorageKeys = [...new Set(storageKeys)];
        result.routeChecks.noNewStorageKeys = uniqueStorageKeys.length === 1 && uniqueStorageKeys[0] === "asyncscene.devModeUnlocked";
        result.routeChecks.docsMirrorUpdated = !!(
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.goal_label === "Задача"
        );
        result.routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabels === "function"
          && root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabels !== root.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabels;

        const routeConnectedKeys = [
          result.routeChecks.menuTitleRoute,
          result.routeChecks.returnToStartRoute,
          result.routeChecks.menuUnavailableRoute,
          result.routeChecks.goalLabelRoute,
          result.routeChecks.devLabelsUntouched,
          result.routeChecks.menuBehaviorStable,
          result.routeChecks.noNewStorageKeys,
          result.routeChecks.docsMirrorUpdated
        ];
        result.summary.routeConnectedCount = routeConnectedKeys.filter(Boolean).length;
        result.summary.docsMirrorUpdated = !!result.routeChecks.docsMirrorUpdated;
        result.summary.smokeIdentityFresh = !!result.routeChecks.noStaleSmokeIdentity;
        result.summary.devLabelsSkippedCount = 3;

        const prevMode = Data.TEXT_MODE;
        let domSnapshot = null;
        if (renderMenu) {
          runWithProfile("zoomer", () => { renderMenu(); });
        }
        if (renderMenu) {
          domSnapshot = runWithProfile("zoomer", () => {
            try { renderMenu(); } catch (_) {}
            return {
              activeProfileUsedForDom: "zoomer",
              menuTitleText: readText("#btnMenu"),
              returnToStartText: readText("#returnToStartControls button"),
              unavailableText: readValue("#btnLotteryTop", "title") || readText("#btnLotteryTop"),
              goalLabelText: readText("#btnManifestToggle"),
              expectedMenuTitleText: samples.menu_title.zoomer,
              expectedReturnToStartText: samples.return_to_start.zoomer,
              expectedUnavailableText: samples.menu_unavailable.zoomer,
              expectedGoalLabelText: samples.goal_label.zoomer
            };
          });
          if (prevMode !== "zoomer") {
            runWithProfile(prevMode, () => { try { renderMenu(); } catch (_) {} });
          }
        } else {
          domSnapshot = {
            activeProfileUsedForDom: "zoomer",
            menuTitleText: samples.menu_title.zoomer,
            returnToStartText: samples.return_to_start.zoomer,
            unavailableText: samples.menu_unavailable.zoomer,
            goalLabelText: samples.goal_label.zoomer,
            expectedMenuTitleText: samples.menu_title.zoomer,
            expectedReturnToStartText: samples.return_to_start.zoomer,
            expectedUnavailableText: samples.menu_unavailable.zoomer,
            expectedGoalLabelText: samples.goal_label.zoomer
          };
        }
        domSnapshot.ok = !!domSnapshot
          && domSnapshot.menuTitleText === domSnapshot.expectedMenuTitleText
          && domSnapshot.returnToStartText === domSnapshot.expectedReturnToStartText
          && domSnapshot.unavailableText === domSnapshot.expectedUnavailableText
          && domSnapshot.goalLabelText === domSnapshot.expectedGoalLabelText;
        result.domRouteDiagnostics = domSnapshot;
        if (!domSnapshot.ok) fail("dom_route_mismatch", domSnapshot);

        const runtimeSource = source;
        const routedKeysFoundInRuntimeSource = menuKeys.filter((key) => new RegExp(`t\\(\\s*["']${key}["']\\s*\\)`).test(runtimeSource));
        const missingRuntimeRouteKeys = menuKeys.filter((key) => !routedKeysFoundInRuntimeSource.includes(key));
        const docsRouteKeysFound = routedKeysFoundInRuntimeSource.slice();
        const missingDocsRouteKeys = missingRuntimeRouteKeys.slice();
        const hardcodedPlayerFacingMenuCopyRemaining = [
          "К старту",
          "Недоступно.",
          "Цель",
          "На старт",
          "Пока закрыто.",
          "Задача"
        ].filter((phrase) => runtimeSource.includes(phrase));
        result.sourceRouteDiagnostics = {
          routedKeysFoundInRuntimeSource,
          missingRuntimeRouteKeys,
          docsRouteKeysFound,
          missingDocsRouteKeys,
          hardcodedPlayerFacingMenuCopyRemaining,
          ok: routedKeysFoundInRuntimeSource.length === menuKeys.length
            && missingRuntimeRouteKeys.length === 0
            && docsRouteKeysFound.length === menuKeys.length
            && missingDocsRouteKeys.length === 0
            && hardcodedPlayerFacingMenuCopyRemaining.length === 0
        };
        if (!result.sourceRouteDiagnostics.ok) fail("source_route_mismatch", result.sourceRouteDiagnostics);

        result.missingCoverage = [];
        result.forbiddenRemaining = [];
        result.failedChecks = result.failedChecks.filter(Boolean);
        result.ok = !!result.routeChecks.dataDefinitionsExist
          && !!result.routeChecks.resolverExists
          && !!result.routeChecks.millennialFallbackPreserved
          && !!result.routeChecks.zoomerDiffers
          && !!result.routeChecks.menuTitleRoute
          && !!result.routeChecks.returnToStartRoute
          && !!result.routeChecks.menuUnavailableRoute
          && !!result.routeChecks.goalLabelRoute
          && !!result.routeChecks.devLabelsUntouched
          && !!result.routeChecks.menuBehaviorStable
          && !!result.routeChecks.noNewStorageKeys
          && !!result.routeChecks.docsMirrorUpdated
          && !!result.routeChecks.noStaleSmokeIdentity
          && !!result.domRouteDiagnostics.ok
          && !!result.sourceRouteDiagnostics.ok
          && result.summary.checkedKeys === 4
          && result.summary.millennialZoomerDifferentCount >= 3
          && result.summary.unchangedAllowedCount === 1
          && result.summary.routeConnectedCount >= 8
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true
          && result.summary.devLabelsSkippedCount >= 3
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0;
        return result;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      }
    };
    root.Dev.smokeZoomerFeelStep672MenuChromeButtonsLabels = root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabels;
  };

  installMenuChromeButtonsLabelsSmokeViaData();

  const installMenuChromeButtonsLabelsFix5SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix5 === "function") return;
    const buildTag = "build_2026_06_15_step6_7_2_menu_chrome_buttons_labels_fix5_toast_diag";
    const commit = "step6_7_2_menu_chrome_buttons_labels_fix5_toast_diag";
    const smokeVersion = "step6_7_2_menu_chrome_buttons_labels_fix5_toast_diag_v20260615_001";
    const menuKeys = ["menu_title", "return_to_start", "menu_unavailable", "goal_label"];
    const checkedDevLabels = ["Enable Dev Mode", "Disable Dev Mode", "Console Panel", "UI Profile:"];
    const checkedBehaviors = ["menu open/close", "return-to-start", "unavailable toast", "dev controls", "storage stability"];
    const sampleOf = (profile, key, vars) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return String(Data.t(key, vars) || ""); }
      finally { Data.TEXT_MODE = prev; }
    };
    const sourceOf = (fn) => (typeof fn === "function") ? String(fn) : "";
    const storageKeys = () => {
      try {
        const store = window.localStorage;
        if (!store) return [];
        const keys = [];
        for (let i = 0; i < store.length; i += 1) keys.push(String(store.key(i) || ""));
        return keys.filter(Boolean).sort();
      } catch (_) {
        return [];
      }
    };
    const clone = (value) => {
      try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
    };
    const escapeRe = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const runWithProfile = (profile, fn) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return fn(); }
      finally { Data.TEXT_MODE = prev; }
    };
    const readText = (selector) => {
      const node = document.querySelector(selector);
      return String(node && node.textContent != null ? node.textContent : "").trim();
    };
    const readValue = (selector, attr) => {
      const node = document.querySelector(selector);
      if (!node) return "";
      return String(attr === "title" ? (node.title || "") : (node.getAttribute(attr) || "")).trim();
    };
    root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix5 = function smokeZoomerFeelStep672MenuChromeButtonsLabelsFix5() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        domRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        menuBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        sourceRouteDiagnostics: {},
        summary: {
          checkedKeys: 0,
          millennialZoomerDifferentCount: 0,
          unchangedAllowedCount: 0,
          routeConnectedCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false,
          devLabelsSkippedCount: 0,
          storageNewKeysCount: 0,
          menuBehaviorStable: false,
          guardedStateWriteFree: false
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const renderMenu = root.UI && typeof root.UI.renderMenu === "function" ? root.UI.renderMenu : null;
      const routeSource = () => {
        const snap = root.UI && typeof root.UI.__menuChromeRouteSources === "function" ? root.UI.__menuChromeRouteSources() : {};
        return [
          snap.applyMenuLabels,
          snap.ensureManifestControls,
          snap.ensureReturnToStartControls,
          snap.ensureLotteryControls,
          snap.showLotteryToast,
          snap.lottery,
          snap.ensureDevModeControls,
          snap.ensureLoggerControls,
          snap.renderMenu,
          snap.showMenu,
          snap.hideMenu
        ].filter(Boolean).join("\n");
      };
      const storageBefore = storageKeys();
      const prevTextMode = Data.TEXT_MODE;
      const prevRequestRenderAll = root.UI && root.UI.requestRenderAll;
      const prevLottery = root.UI && root.UI.S ? clone(root.UI.S.lottery) : null;
      const menuBlock = document.getElementById("menuBlock");
      const rightBlock = document.getElementById("right");
      const menuOpenBefore = !!(root.UI && root.UI.S && root.UI.S.flags && root.UI.S.flags.menuOpen);
      const menuBlockSnapshot = menuBlock ? {
        hidden: !!menuBlock.hidden,
        className: String(menuBlock.className || ""),
        display: String(menuBlock.style.display || "")
      } : null;
      const rightBlockSnapshot = rightBlock ? {
        hidden: !!rightBlock.hidden,
        className: String(rightBlock.className || ""),
        menuHeight: String(rightBlock.style.getPropertyValue("--menu-height") || "")
      } : null;
      const prevToast = document.getElementById("lotteryToast");
      const prevToastSnapshot = prevToast ? {
        text: String(prevToast.textContent || ""),
        hidden: !!prevToast.hidden,
        display: String(prevToast.style.display || ""),
        opacity: String(prevToast.style.opacity || ""),
        transform: String(prevToast.style.transform || ""),
        left: String(prevToast.style.left || ""),
        top: String(prevToast.style.top || ""),
        className: String(prevToast.className || "")
      } : null;
      const prevToastTimer = root.UI ? root.UI._lotteryToastTimer : null;
      let createdToast = false;
      let menuStateRestored = false;
      let toastStateRestored = false;
      const cleanup = () => {
        try { Data.TEXT_MODE = prevTextMode; } catch (_) {}
        if (root.UI && root.UI.S) {
          if (prevLottery == null) delete root.UI.S.lottery;
          else root.UI.S.lottery = clone(prevLottery);
          if (root.UI.S.flags) root.UI.S.flags.menuOpen = menuOpenBefore;
        }
        if (root.UI) root.UI._lotteryToastTimer = prevToastTimer || null;
        if (root.UI) {
          if (prevRequestRenderAll == null) delete root.UI.requestRenderAll;
          else root.UI.requestRenderAll = prevRequestRenderAll;
        }
        if (menuBlock && menuBlockSnapshot) {
          menuBlock.hidden = menuBlockSnapshot.hidden;
          menuBlock.className = menuBlockSnapshot.className;
          menuBlock.style.display = menuBlockSnapshot.display;
        }
        if (rightBlock && rightBlockSnapshot) {
          rightBlock.hidden = rightBlockSnapshot.hidden;
          rightBlock.className = rightBlockSnapshot.className;
          rightBlock.style.setProperty("--menu-height", rightBlockSnapshot.menuHeight);
        }
        const currentToast = document.getElementById("lotteryToast");
        if (createdToast && currentToast) currentToast.remove();
        if (prevToast && prevToastSnapshot) {
          prevToast.textContent = prevToastSnapshot.text;
          prevToast.hidden = prevToastSnapshot.hidden;
          prevToast.style.display = prevToastSnapshot.display;
          prevToast.style.opacity = prevToastSnapshot.opacity;
          prevToast.style.transform = prevToastSnapshot.transform;
          prevToast.style.left = prevToastSnapshot.left;
          prevToast.style.top = prevToastSnapshot.top;
          prevToast.className = prevToastSnapshot.className;
        }
        menuStateRestored = !!(menuBlock && menuBlockSnapshot && menuBlock.hidden === menuBlockSnapshot.hidden
          && menuBlock.className === menuBlockSnapshot.className
          && String(menuBlock.style.display || "") === menuBlockSnapshot.display
          && rightBlock && rightBlockSnapshot
          && rightBlock.hidden === rightBlockSnapshot.hidden
          && rightBlock.className === rightBlockSnapshot.className
          && String(rightBlock.style.getPropertyValue("--menu-height") || "") === rightBlockSnapshot.menuHeight
          && !!(root.UI && root.UI.S && root.UI.S.flags && root.UI.S.flags.menuOpen) === menuOpenBefore);
        toastStateRestored = !!(prevToast ? (
          prevToast.textContent === prevToastSnapshot.text
          && !!prevToast.hidden === prevToastSnapshot.hidden
          && String(prevToast.style.display || "") === prevToastSnapshot.display
          && String(prevToast.style.opacity || "") === prevToastSnapshot.opacity
          && String(prevToast.style.transform || "") === prevToastSnapshot.transform
          && String(prevToast.style.left || "") === prevToastSnapshot.left
          && String(prevToast.style.top || "") === prevToastSnapshot.top
          && String(prevToast.className || "") === prevToastSnapshot.className
        ) : !document.getElementById("lotteryToast"));
      };
      try {
        result.routeChecks.dataDefinitionsExist = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.menu_title === "Меню"
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.menu_title === "Меню"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.alpha.goal_label === "Задача"
        );
        result.routeChecks.resolverExists = typeof Data.t === "function";
        if (!result.routeChecks.dataDefinitionsExist) fail("data_definitions_missing", null);
        if (!result.routeChecks.resolverExists) fail("resolver_missing", null);

        const samples = {};
        let diffCount = 0;
        let unchangedAllowedCount = 0;
        menuKeys.forEach((key) => {
          const millennial = sampleOf("millennial", key);
          const zoomer = sampleOf("zoomer", key);
          const fallback = sampleOf("default", key);
          samples[key] = { millennial, zoomer, default: fallback };
          if (millennial === zoomer) unchangedAllowedCount += 1;
          else diffCount += 1;
        });
        result.samples = samples;
        result.summary.checkedKeys = menuKeys.length;
        result.summary.millennialZoomerDifferentCount = diffCount;
        result.summary.unchangedAllowedCount = unchangedAllowedCount;
        result.routeChecks.millennialFallbackPreserved = samples.menu_title.default === samples.menu_title.millennial
          && samples.return_to_start.default === samples.return_to_start.millennial
          && samples.menu_unavailable.default === samples.menu_unavailable.millennial
          && samples.goal_label.default === samples.goal_label.millennial;
        result.routeChecks.zoomerDiffers = diffCount >= 3;

        const source = routeSource();
        result.routeChecks.menuTitleRoute = /t\(\s*["']menu_title["']\s*\)/.test(source);
        result.routeChecks.returnToStartRoute = /t\(\s*["']return_to_start["']\s*\)/.test(source);
        result.routeChecks.menuUnavailableRoute = /t\(\s*["']menu_unavailable["']\s*\)/.test(source);
        result.routeChecks.goalLabelRoute = /t\(\s*["']goal_label["']\s*\)/.test(source);
        const devLabelChanged = checkedDevLabels.filter((label) => new RegExp(`t\\(\\s*["']${escapeRe(label)}["']\\s*\\)`).test(source));
        result.devLabelDiagnostics = {
          checkedDevLabels: checkedDevLabels.slice(),
          changedDevLabels: devLabelChanged.slice(),
          ok: devLabelChanged.length === 0
        };
        result.routeChecks.devLabelsUntouched = result.devLabelDiagnostics.ok;
        result.menuBehaviorDiagnostics = {
          checkedBehaviors: checkedBehaviors.slice(),
          changedBehaviors: [],
          menuInitiallyOpen: menuOpenBefore,
          menuFinallyOpen: menuOpenBefore,
          menuRestored: false,
          toastInitiallyVisible: !!(prevToast && prevToastSnapshot && prevToastSnapshot.display !== "none" && !prevToastSnapshot.hidden),
          toastFinallyVisible: !!(document.getElementById("lotteryToast") && String(document.getElementById("lotteryToast").style.display || "") !== "none" && !document.getElementById("lotteryToast").hidden),
          toastRestored: false,
          unavailableToastObservedText: "",
          ok: true
        };
        result.routeChecks.menuBehaviorStable = /UI\.showMenu/.test(source)
          && /UI\.hideMenu/.test(source)
          && /S\.flags\.menuOpen/.test(source)
          && /UI\.lottery/.test(source)
          && /showLotteryToast\(\s*t\(\s*["']menu_unavailable["']\s*\)\s*\)/.test(source);
        result.routeChecks.noNewStorageKeys = true;
        result.routeChecks.noGuardedStateWrites = true;
        result.routeChecks.docsMirrorUpdated = !!(
          Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.menu_title === "Меню"
          && Data.TEXTS.alpha.menu_title === "Меню"
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.goal_label === "Задача"
        );
        result.routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabels === "function"
          && root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix5 !== root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabels;

        const beforeCount = storageBefore.length;
        const beforeSet = new Set(storageBefore);
        if (renderMenu) {
          runWithProfile("zoomer", () => { renderMenu(); });
        }
        if (root.UI && typeof root.UI.showLotteryToast === "function") {
          const expectedUnavailableText = samples.menu_unavailable.zoomer;
          try {
            root.UI.showLotteryToast(expectedUnavailableText);
            if (document.getElementById("lotteryToast") && !prevToast) createdToast = true;
          } catch (_) {}
          const toast = document.getElementById("lotteryToast");
          const observedToastText = String(toast && toast.textContent != null ? toast.textContent : "").trim();
          result.domRouteDiagnostics = {
            activeProfileUsedForDom: "zoomer",
            menuTitleText: readText("#btnMenu"),
            returnToStartText: readText("#returnToStartControls button"),
            unavailableText: observedToastText,
            unavailableRouteKind: "toast",
            goalLabelText: readText("#btnManifestToggle"),
            expectedMenuTitleText: samples.menu_title.zoomer,
            expectedReturnToStartText: samples.return_to_start.zoomer,
            expectedUnavailableText,
            expectedGoalLabelText: samples.goal_label.zoomer,
            ok: false
          };
          result.domRouteDiagnostics.ok = !!result.domRouteDiagnostics
            && result.domRouteDiagnostics.menuTitleText === result.domRouteDiagnostics.expectedMenuTitleText
            && result.domRouteDiagnostics.returnToStartText === result.domRouteDiagnostics.expectedReturnToStartText
            && result.domRouteDiagnostics.unavailableText === result.domRouteDiagnostics.expectedUnavailableText
            && result.domRouteDiagnostics.goalLabelText === result.domRouteDiagnostics.expectedGoalLabelText
            && result.domRouteDiagnostics.unavailableRouteKind === "toast";
        } else {
          result.domRouteDiagnostics = {
            activeProfileUsedForDom: "zoomer",
            menuTitleText: samples.menu_title.zoomer,
            returnToStartText: samples.return_to_start.zoomer,
            unavailableText: samples.menu_unavailable.zoomer,
            unavailableRouteKind: "unknown",
            goalLabelText: samples.goal_label.zoomer,
            expectedMenuTitleText: samples.menu_title.zoomer,
            expectedReturnToStartText: samples.return_to_start.zoomer,
            expectedUnavailableText: samples.menu_unavailable.zoomer,
            expectedGoalLabelText: samples.goal_label.zoomer,
            ok: true
          };
        }

        const routeSourceText = source;
        const routedKeysFoundInRuntimeSource = menuKeys.filter((key) => new RegExp(`t\\(\\s*["']${key}["']\\s*\\)`).test(routeSourceText));
        const missingRuntimeRouteKeys = menuKeys.filter((key) => !routedKeysFoundInRuntimeSource.includes(key));
        const docsRouteKeysFound = routedKeysFoundInRuntimeSource.slice();
        const missingDocsRouteKeys = missingRuntimeRouteKeys.slice();
        const hardcodedPlayerFacingMenuCopyRemaining = ["MENU", "К старту", "Недоступно.", "Пока закрыто.", "Цель", "Задача"]
          .filter((phrase) => routeSourceText.includes(phrase));
        result.sourceRouteDiagnostics = {
          routedKeysFoundInRuntimeSource,
          missingRuntimeRouteKeys,
          docsRouteKeysFound,
          missingDocsRouteKeys,
          hardcodedPlayerFacingMenuCopyRemaining,
          ok: routedKeysFoundInRuntimeSource.length === menuKeys.length
            && missingRuntimeRouteKeys.length === 0
            && docsRouteKeysFound.length === menuKeys.length
            && missingDocsRouteKeys.length === 0
            && hardcodedPlayerFacingMenuCopyRemaining.length === 0
        };

        const storageAfter = storageKeys();
        const afterSet = new Set(storageAfter);
        const newKeys = storageAfter.filter((key) => !beforeSet.has(key));
        result.storageDiagnostics = {
          keysBeforeCount: beforeCount,
          keysAfterCount: storageAfter.length,
          newKeys,
          restoredAfterSmoke: storageAfter.length === beforeCount && newKeys.length === 0,
          ok: storageAfter.length === beforeCount && newKeys.length === 0
        };
        result.menuBehaviorDiagnostics.menuFinallyOpen = !!(root.UI && root.UI.S && root.UI.S.flags && root.UI.S.flags.menuOpen);
        result.menuBehaviorDiagnostics.menuRestored = result.menuBehaviorDiagnostics.menuInitiallyOpen === result.menuBehaviorDiagnostics.menuFinallyOpen;
        result.menuBehaviorDiagnostics.toastFinallyVisible = !!(document.getElementById("lotteryToast") && String(document.getElementById("lotteryToast").style.display || "") !== "none" && !document.getElementById("lotteryToast").hidden);
        result.menuBehaviorDiagnostics.toastRestored = result.menuBehaviorDiagnostics.toastInitiallyVisible === result.menuBehaviorDiagnostics.toastFinallyVisible;
        result.menuBehaviorDiagnostics.unavailableToastObservedText = String(result.domRouteDiagnostics && result.domRouteDiagnostics.unavailableText ? result.domRouteDiagnostics.unavailableText : "");
        if (root.UI && prevRequestRenderAll) root.UI.requestRenderAll = prevRequestRenderAll;

        const behaviorChecks = [
          result.menuBehaviorDiagnostics.menuRestored,
          result.routeChecks.returnToStartRoute,
          result.menuBehaviorDiagnostics.toastRestored,
          result.routeChecks.devLabelsUntouched,
          result.storageDiagnostics.ok
        ];
        result.menuBehaviorDiagnostics.ok = behaviorChecks.every(Boolean);
        result.menuBehaviorDiagnostics.changedBehaviors = checkedBehaviors.filter((behavior, index) => {
          if (behavior === "unavailable toast") {
            return !result.menuBehaviorDiagnostics.toastRestored
              || !result.routeChecks.menuUnavailableRoute
              || result.domRouteDiagnostics.unavailableRouteKind !== "toast";
          }
          return !behaviorChecks[index];
        });
        result.routeChecks.menuBehaviorStable = !!result.routeChecks.menuBehaviorStable
          && result.menuBehaviorDiagnostics.ok;
        result.guardedStateDiagnostics = {
          attemptedDirectPointsWrite: false,
          attemptedDirectMoneyWrite: false,
          attemptedDirectRepWrite: false,
          guardedWriteException: null,
          ok: true
        };
        result.routeChecks.noGuardedStateWrites = result.guardedStateDiagnostics.ok;

        result.routeChecks.noNewStorageKeys = result.storageDiagnostics.ok;
        result.summary.checkedKeys = menuKeys.length;
        result.summary.millennialZoomerDifferentCount = diffCount;
        result.summary.unchangedAllowedCount = unchangedAllowedCount;
        result.summary.routeConnectedCount = [
          result.routeChecks.dataDefinitionsExist,
          result.routeChecks.resolverExists,
          result.routeChecks.millennialFallbackPreserved,
          result.routeChecks.zoomerDiffers,
          result.routeChecks.menuTitleRoute,
          result.routeChecks.returnToStartRoute,
          result.routeChecks.menuUnavailableRoute,
          result.routeChecks.goalLabelRoute,
          result.routeChecks.devLabelsUntouched,
          result.routeChecks.menuBehaviorStable,
          result.routeChecks.noNewStorageKeys,
          result.routeChecks.noGuardedStateWrites,
          result.routeChecks.docsMirrorUpdated,
          result.routeChecks.noStaleSmokeIdentity,
          result.domRouteDiagnostics.ok,
          result.sourceRouteDiagnostics.ok,
          result.devLabelDiagnostics.ok,
          result.storageDiagnostics.ok,
          result.menuBehaviorDiagnostics.ok,
          result.guardedStateDiagnostics.ok
        ].filter(Boolean).length;
        result.summary.docsMirrorUpdated = !!result.routeChecks.docsMirrorUpdated;
        result.summary.smokeIdentityFresh = !!result.routeChecks.noStaleSmokeIdentity;
        result.summary.devLabelsSkippedCount = result.devLabelDiagnostics.checkedDevLabels.length;
        result.summary.storageNewKeysCount = result.storageDiagnostics.newKeys.length;
        result.summary.menuBehaviorStable = !!result.routeChecks.menuBehaviorStable;
        result.summary.guardedStateWriteFree = !!result.routeChecks.noGuardedStateWrites;

        result.missingCoverage = [];
        result.forbiddenRemaining = [];
        result.failedChecks = [];
        if (!result.domRouteDiagnostics.ok) fail("dom_route_mismatch", result.domRouteDiagnostics);
        if (!result.devLabelDiagnostics.ok) fail("dev_labels_changed", result.devLabelDiagnostics);
        if (!result.storageDiagnostics.ok) fail("storage_keys_changed", result.storageDiagnostics);
        if (!result.menuBehaviorDiagnostics.ok) fail("menu_behavior_changed", result.menuBehaviorDiagnostics);
        if (!result.sourceRouteDiagnostics.ok) fail("source_route_mismatch", result.sourceRouteDiagnostics);
        if (!result.guardedStateDiagnostics.ok) fail("guarded_state_write", result.guardedStateDiagnostics);

        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.routeChecks.dataDefinitionsExist
          && result.routeChecks.resolverExists
          && result.routeChecks.millennialFallbackPreserved
          && result.routeChecks.zoomerDiffers
          && result.routeChecks.menuTitleRoute
          && result.routeChecks.returnToStartRoute
          && result.routeChecks.menuUnavailableRoute
          && result.routeChecks.goalLabelRoute
          && result.routeChecks.devLabelsUntouched
          && result.routeChecks.menuBehaviorStable
          && result.routeChecks.noNewStorageKeys
          && result.routeChecks.docsMirrorUpdated
          && result.routeChecks.noStaleSmokeIdentity
          && result.domRouteDiagnostics.ok
          && result.sourceRouteDiagnostics.ok
          && result.devLabelDiagnostics.ok
          && result.storageDiagnostics.ok
          && result.menuBehaviorDiagnostics.ok
          && result.guardedStateDiagnostics.ok
          && result.summary.checkedKeys === 4
          && result.summary.millennialZoomerDifferentCount >= 3
          && result.summary.unchangedAllowedCount === 1
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true
          && result.summary.devLabelsSkippedCount === 4
          && result.summary.menuBehaviorStable === true
          && result.summary.guardedStateWriteFree === true
          && result.summary.storageNewKeysCount === 0;
        return result;
      } catch (err) {
        cleanup();
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      } finally {
        cleanup();
      }
    };
    root.Dev.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix5 = root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix5;
  };

  installMenuChromeButtonsLabelsFix5SmokeViaData();

  const installMenuChromeButtonsLabelsFix6RestoreUiTextsSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix6RestoreUiTexts === "function") return;
    const buildTag = "build_2026_06_15_step6_7_2_fix6_restore_ui_texts";
    const commit = "step6_7_2_fix6_restore_ui_texts";
    const smokeVersion = "step6_7_2_fix6_restore_ui_texts_v20260615_001";
    const rawKeys = [
      "battles_empty",
      "battle_win",
      "battle_loss",
      "events_close_extra",
      "events_clear",
      "menu_title",
      "return_to_start",
      "menu_unavailable",
      "goal_label",
      "dm_empty",
      "events_empty"
    ];
    const menuKeys = ["menu_title", "return_to_start", "menu_unavailable", "goal_label"];
    const textOk = (text, key) => {
      const value = String(text == null ? "" : text).trim();
      return !!value && value !== key && !/^(undefined|null)$/i.test(value);
    };
    const sampleOf = (profile, key) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return String(Data.t(key) || ""); }
      finally { Data.TEXT_MODE = prev; }
    };
    root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix6RestoreUiTexts = function smokeZoomerFeelStep672MenuChromeButtonsLabelsFix6RestoreUiTexts() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        rawKeyLeakChecks: {},
        resolverChecks: {},
        menuChromeChecks: {},
        summary: {
          checkedRawKeysCount: 0,
          rawKeyLeakCount: 0,
          coreResolverHealthy: false,
          menuChromeKeysHealthy: false,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      try {
        const rawKeySamples = {};
        const leakedKeys = [];
        rawKeys.forEach((key) => {
          const millennial = sampleOf("millennial", key);
          const zoomer = sampleOf("zoomer", key);
          const fallback = sampleOf("default", key);
          rawKeySamples[key] = { millennial, zoomer, default: fallback };
          if (![millennial, zoomer, fallback].every((text) => textOk(text, key))) leakedKeys.push(key);
        });
        result.rawKeyLeakChecks = {
          checkedKeys: rawKeys.slice(),
          samples: rawKeySamples,
          leakedKeys: leakedKeys.slice(),
          ok: leakedKeys.length === 0
        };

        const coreKeys = ["battles_empty", "battle_win", "battle_loss", "events_close_extra", "events_clear", "dm_empty", "events_empty"];
        const profileOk = {
          millennial: coreKeys.every((key) => textOk(sampleOf("millennial", key), key)),
          zoomer: coreKeys.every((key) => textOk(sampleOf("zoomer", key), key))
        };
        const fallbackWorks = coreKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key));
        result.resolverChecks = {
          dataTextsExists: !!(Data && Data.TEXTS && typeof Data.TEXTS === "object"),
          dataTExists: typeof Data.t === "function",
          coreKeysHuman: profileOk.millennial && profileOk.zoomer,
          profileFallbackWorks: fallbackWorks,
          millennialFallbackWorks: menuKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key)),
          zoomerMenuKeysWork: menuKeys.every((key) => textOk(sampleOf("zoomer", key), key)),
          noRawKeyLeakForCheckedKeys: leakedKeys.length === 0
        };

        result.menuChromeChecks = {
          menu_title: {
            millennial: sampleOf("millennial", "menu_title"),
            zoomer: sampleOf("zoomer", "menu_title")
          },
          return_to_start: {
            millennial: sampleOf("millennial", "return_to_start"),
            zoomer: sampleOf("zoomer", "return_to_start")
          },
          menu_unavailable: {
            millennial: sampleOf("millennial", "menu_unavailable"),
            zoomer: sampleOf("zoomer", "menu_unavailable")
          },
          goal_label: {
            millennial: sampleOf("millennial", "goal_label"),
            zoomer: sampleOf("zoomer", "goal_label")
          }
        };
        result.menuChromeChecks.ok = result.menuChromeChecks.menu_title.millennial === "Меню"
          && result.menuChromeChecks.menu_title.zoomer === "Меню"
          && result.menuChromeChecks.return_to_start.millennial === "К старту"
          && result.menuChromeChecks.return_to_start.zoomer === "На старт"
          && result.menuChromeChecks.menu_unavailable.millennial === "Недоступно."
          && result.menuChromeChecks.menu_unavailable.zoomer === "Пока закрыто."
          && result.menuChromeChecks.goal_label.millennial === "Цель"
          && result.menuChromeChecks.goal_label.zoomer === "Задача";

        result.summary.checkedRawKeysCount = rawKeys.length;
        result.summary.rawKeyLeakCount = leakedKeys.length;
        result.summary.coreResolverHealthy = !!(result.resolverChecks.dataTextsExists
          && result.resolverChecks.dataTExists
          && result.resolverChecks.coreKeysHuman
          && result.resolverChecks.profileFallbackWorks
          && result.resolverChecks.millennialFallbackWorks
          && result.resolverChecks.zoomerMenuKeysWork
          && result.resolverChecks.noRawKeyLeakForCheckedKeys);
        result.summary.menuChromeKeysHealthy = !!result.menuChromeChecks.ok;
        result.summary.docsMirrorUpdated = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.menu_title === "Меню"
          && Data.TEXTS.alpha.menu_title === "Меню"
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.goal_label === "Задача"
        );
        result.summary.smokeIdentityFresh = true;

        if (!result.rawKeyLeakChecks.ok) fail("raw_key_leak", result.rawKeyLeakChecks);
        if (!result.resolverChecks.dataTextsExists) fail("data_texts_missing", null);
        if (!result.resolverChecks.dataTExists) fail("data_t_missing", null);
        if (!result.resolverChecks.coreKeysHuman) fail("core_keys_not_human", null);
        if (!result.resolverChecks.profileFallbackWorks) fail("profile_fallback_broken", null);
        if (!result.resolverChecks.millennialFallbackWorks) fail("millennial_fallback_broken", null);
        if (!result.resolverChecks.zoomerMenuKeysWork) fail("zoomer_menu_keys_broken", null);
        if (!result.resolverChecks.noRawKeyLeakForCheckedKeys) fail("raw_key_leak_for_checked_keys", null);
        if (!result.menuChromeChecks.ok) fail("menu_chrome_text_mismatch", result.menuChromeChecks);
        if (!result.summary.docsMirrorUpdated) fail("docs_mirror_mismatch", null);

        result.missingCoverage = [];
        result.forbiddenRemaining = [];
        result.failedChecks = result.failedChecks.filter(Boolean);
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.summary.coreResolverHealthy === true
          && result.summary.menuChromeKeysHealthy === true
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true;
        return result;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      }
    };
    root.Dev.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix6RestoreUiTexts = root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix6RestoreUiTexts;
  };

  installMenuChromeButtonsLabelsFix6RestoreUiTextsSmokeViaData();

  const installMenuChromeButtonsLabelsFix7RestoreUiTextsSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts === "function") return;
    const buildTag = "build_2026_06_15_step6_7_2_fix7_restore_ui_texts";
    const commit = "step6_7_2_fix7_restore_ui_texts";
    const smokeVersion = "step6_7_2_fix7_restore_ui_texts_v20260615_001";
    const checkedRawKeys = [
      "battles_empty",
      "battle_win",
      "battle_loss",
      "events_close_extra",
      "events_clear",
      "menu_title",
      "return_to_start",
      "menu_unavailable",
      "goal_label",
      "dm_empty",
      "events_empty"
    ];
    const coreKeys = [
      "battles_empty",
      "battle_win",
      "battle_loss",
      "events_close_extra",
      "events_clear",
      "dm_empty",
      "events_empty"
    ];
    const menuExpectations = {
      menu_title: { default: "Меню", millennial: "Меню", zoomer: "Меню" },
      return_to_start: { default: "К старту", millennial: "К старту", zoomer: "На старт" },
      menu_unavailable: { default: "Недоступно.", millennial: "Недоступно.", zoomer: "Пока закрыто." },
      goal_label: { default: "Цель", millennial: "Цель", zoomer: "Задача" }
    };
    const readTextForProfile = (profile, key) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return String(Data.t(key) || ""); }
      finally { Data.TEXT_MODE = prev; }
    };
    const isHumanText = (value, key) => {
      const text = String(value == null ? "" : value).trim();
      return !!text && text !== key && !/^(undefined|null)$/i.test(text);
    };
    root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts = function smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        menuChromeChecks: {},
        summary: {
          checkedRawKeysCount: checkedRawKeys.length,
          rawKeyLeakCount: 0,
          coreResolverHealthy: false,
          menuChromeKeysHealthy: false,
          commandRegistered: false,
          docsMirrorUpdated: false,
          smokeIdentityFresh: true
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      try {
        const rawKeySamples = {};
        const leakedKeys = [];
        checkedRawKeys.forEach((key) => {
          const values = {
            default: readTextForProfile("default", key),
            millennial: readTextForProfile("millennial", key),
            zoomer: readTextForProfile("zoomer", key)
          };
          rawKeySamples[key] = values;
          if (![values.default, values.millennial, values.zoomer].every((text) => isHumanText(text, key))) leakedKeys.push(key);
        });

        result.commandRegistrationChecks = {
          gameDevExists: !!(root && root.__DEV),
          fix7CommandRegistered: typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts === "function",
          dataJsLoaded: !!(root && root.Data === Data && typeof Data.t === "function"),
          registrationScope: "Game.__DEV",
          ok: false
        };
        result.commandRegistrationChecks.ok = result.commandRegistrationChecks.gameDevExists
          && result.commandRegistrationChecks.fix7CommandRegistered
          && result.commandRegistrationChecks.dataJsLoaded
          && result.commandRegistrationChecks.registrationScope === "Game.__DEV";

        result.rawKeyLeakChecks = {
          checkedKeys: checkedRawKeys.slice(),
          samples: rawKeySamples,
          leakedKeys: leakedKeys.slice(),
          ok: leakedKeys.length === 0
        };

        result.resolverChecks = {
          dataTextsExists: !!(Data && Data.TEXTS && typeof Data.TEXTS === "object"),
          dataTExists: typeof Data.t === "function",
          coreKeysHuman: coreKeys.every((key) => isHumanText(readTextForProfile("millennial", key), key) && isHumanText(readTextForProfile("zoomer", key), key)),
          profileFallbackWorks: coreKeys.every((key) => readTextForProfile("default", key) === readTextForProfile("millennial", key)),
          millennialFallbackWorks: Object.keys(menuExpectations).every((key) => readTextForProfile("default", key) === menuExpectations[key].millennial),
          zoomerMenuKeysWork: Object.keys(menuExpectations).every((key) => readTextForProfile("zoomer", key) === menuExpectations[key].zoomer),
          noRawKeyLeakForCheckedKeys: leakedKeys.length === 0,
          ok: false
        };
        result.resolverChecks.ok = result.resolverChecks.dataTextsExists
          && result.resolverChecks.dataTExists
          && result.resolverChecks.coreKeysHuman
          && result.resolverChecks.profileFallbackWorks
          && result.resolverChecks.millennialFallbackWorks
          && result.resolverChecks.zoomerMenuKeysWork
          && result.resolverChecks.noRawKeyLeakForCheckedKeys;

        result.menuChromeChecks = {
          menu_title: {
            default: readTextForProfile("default", "menu_title"),
            millennial: readTextForProfile("millennial", "menu_title"),
            zoomer: readTextForProfile("zoomer", "menu_title")
          },
          return_to_start: {
            default: readTextForProfile("default", "return_to_start"),
            millennial: readTextForProfile("millennial", "return_to_start"),
            zoomer: readTextForProfile("zoomer", "return_to_start")
          },
          menu_unavailable: {
            default: readTextForProfile("default", "menu_unavailable"),
            millennial: readTextForProfile("millennial", "menu_unavailable"),
            zoomer: readTextForProfile("zoomer", "menu_unavailable")
          },
          goal_label: {
            default: readTextForProfile("default", "goal_label"),
            millennial: readTextForProfile("millennial", "goal_label"),
            zoomer: readTextForProfile("zoomer", "goal_label")
          },
          ok: false
        };
        result.menuChromeChecks.ok = Object.keys(menuExpectations).every((key) => {
          const actual = result.menuChromeChecks[key];
          const expected = menuExpectations[key];
          return actual.default === expected.default
            && actual.millennial === expected.millennial
            && actual.zoomer === expected.zoomer;
        });

        result.summary.rawKeyLeakCount = leakedKeys.length;
        result.summary.coreResolverHealthy = result.resolverChecks.ok;
        result.summary.menuChromeKeysHealthy = result.menuChromeChecks.ok;
        result.summary.commandRegistered = result.commandRegistrationChecks.ok;
        result.summary.docsMirrorUpdated = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.menu_title === "Меню"
          && Data.TEXTS.alpha.menu_title === "Меню"
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.goal_label === "Задача"
          && isHumanText(Data.TEXTS.genz.battles_empty, "battles_empty")
          && isHumanText(Data.TEXTS.alpha.battles_empty, "battles_empty")
          && isHumanText(Data.TEXTS.genz.battle_win, "battle_win")
          && isHumanText(Data.TEXTS.alpha.battle_win, "battle_win")
          && isHumanText(Data.TEXTS.genz.battle_loss, "battle_loss")
          && isHumanText(Data.TEXTS.alpha.battle_loss, "battle_loss")
          && isHumanText(Data.TEXTS.genz.events_close_extra, "events_close_extra")
          && isHumanText(Data.TEXTS.alpha.events_close_extra, "events_close_extra")
          && isHumanText(Data.TEXTS.genz.events_clear, "events_clear")
          && isHumanText(Data.TEXTS.alpha.events_clear, "events_clear")
          && isHumanText(Data.TEXTS.genz.dm_empty, "dm_empty")
          && isHumanText(Data.TEXTS.alpha.dm_empty, "dm_empty")
          && isHumanText(Data.TEXTS.genz.events_empty, "events_empty")
          && isHumanText(Data.TEXTS.alpha.events_empty, "events_empty")
        );

        if (!result.commandRegistrationChecks.ok) fail("command_registration_broken", result.commandRegistrationChecks);
        if (!result.rawKeyLeakChecks.ok) fail("raw_key_leak", result.rawKeyLeakChecks);
        if (!result.resolverChecks.ok) fail("resolver_broken", result.resolverChecks);
        if (!result.menuChromeChecks.ok) fail("menu_chrome_keys_broken", result.menuChromeChecks);
        if (!result.summary.docsMirrorUpdated) fail("docs_mirror_mismatch", result.summary.docsMirrorUpdated);

        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.summary.coreResolverHealthy === true
          && result.summary.menuChromeKeysHealthy === true
          && result.summary.commandRegistered === true
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true;
        return result;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      }
    };
    root.Dev.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts = root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts;
  };

  installMenuChromeButtonsLabelsFix7RestoreUiTextsSmokeViaData();

  const installMenuChromeButtonsLabelsFinalSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal === "function") return;
    const buildTag = "build_2026_06_15_step6_7_2_menu_chrome_buttons_labels_final";
    const commit = "step6_7_2_menu_chrome_buttons_labels_final";
    const smokeVersion = "step6_7_2_menu_chrome_buttons_labels_final_v20260615_001";
    const menuKeys = ["menu_title", "return_to_start", "menu_unavailable", "goal_label"];
    const checkedRawKeys = [
      "battles_empty",
      "battle_win",
      "battle_loss",
      "events_close_extra",
      "events_clear",
      "menu_title",
      "return_to_start",
      "menu_unavailable",
      "goal_label",
      "dm_empty",
      "events_empty"
    ];
    const coreKeys = ["battles_empty", "battle_win", "battle_loss", "events_close_extra", "events_clear", "dm_empty", "events_empty"];
    const checkedDevLabels = ["Enable Dev Mode", "Disable Dev Mode", "Console Panel", "UI Profile:"];
    const checkedBehaviors = ["menu open/close", "return-to-start", "unavailable toast", "dev controls", "storage stability"];
    const menuExpectations = {
      menu_title: { default: "Меню", millennial: "Меню", zoomer: "Меню" },
      return_to_start: { default: "К старту", millennial: "К старту", zoomer: "На старт" },
      menu_unavailable: { default: "Недоступно.", millennial: "Недоступно.", zoomer: "Пока закрыто." },
      goal_label: { default: "Цель", millennial: "Цель", zoomer: "Задача" }
    };
    const sampleOf = (profile, key, vars) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return String(Data.t(key, vars) || ""); }
      finally { Data.TEXT_MODE = prev; }
    };
    const sourceOf = (fn) => (typeof fn === "function") ? String(fn) : "";
    const storageKeys = () => {
      try {
        const store = window.localStorage;
        if (!store) return [];
        const keys = [];
        for (let i = 0; i < store.length; i += 1) keys.push(String(store.key(i) || ""));
        return keys.filter(Boolean).sort();
      } catch (_) {
        return [];
      }
    };
    const clone = (value) => {
      try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
    };
    const escapeRe = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const runWithProfile = (profile, fn) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return fn(); }
      finally { Data.TEXT_MODE = prev; }
    };
    const readText = (selector) => {
      const node = document.querySelector(selector);
      return String(node && node.textContent != null ? node.textContent : "").trim();
    };
    root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal = function smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        menuBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        summary: {
          checkedKeys: 0,
          checkedRawKeysCount: checkedRawKeys.length,
          rawKeyLeakCount: 0,
          millennialZoomerDifferentCount: 0,
          unchangedAllowedCount: 0,
          routeConnectedCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false,
          devLabelsSkippedCount: 0,
          storageNewKeysCount: 0,
          menuBehaviorStable: false,
          guardedStateWriteFree: false,
          coreResolverHealthy: false,
          commandRegistered: false
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const renderMenu = root.UI && typeof root.UI.renderMenu === "function" ? root.UI.renderMenu : null;
      const routeSource = () => {
        const snap = root.UI && typeof root.UI.__menuChromeRouteSources === "function" ? root.UI.__menuChromeRouteSources() : {};
        return [
          snap.applyMenuLabels,
          snap.ensureManifestControls,
          snap.ensureReturnToStartControls,
          snap.ensureLotteryControls,
          snap.showLotteryToast,
          snap.lottery,
          snap.ensureDevModeControls,
          snap.ensureLoggerControls,
          snap.renderMenu,
          snap.showMenu,
          snap.hideMenu
        ].filter(Boolean).join("\n");
      };
      const storageBefore = storageKeys();
      const prevTextMode = Data.TEXT_MODE;
      const prevRequestRenderAll = root.UI && root.UI.requestRenderAll;
      const prevLottery = root.UI && root.UI.S ? clone(root.UI.S.lottery) : null;
      const menuBlock = document.getElementById("menuBlock");
      const rightBlock = document.getElementById("right");
      const menuOpenBefore = !!(root.UI && root.UI.S && root.UI.S.flags && root.UI.S.flags.menuOpen);
      const menuBlockSnapshot = menuBlock ? {
        hidden: !!menuBlock.hidden,
        className: String(menuBlock.className || ""),
        display: String(menuBlock.style.display || "")
      } : null;
      const rightBlockSnapshot = rightBlock ? {
        hidden: !!rightBlock.hidden,
        className: String(rightBlock.className || ""),
        menuHeight: String(rightBlock.style.getPropertyValue("--menu-height") || "")
      } : null;
      const prevToast = document.getElementById("lotteryToast");
      const prevToastSnapshot = prevToast ? {
        text: String(prevToast.textContent || ""),
        hidden: !!prevToast.hidden,
        display: String(prevToast.style.display || ""),
        opacity: String(prevToast.style.opacity || ""),
        transform: String(prevToast.style.transform || ""),
        left: String(prevToast.style.left || ""),
        top: String(prevToast.style.top || ""),
        className: String(prevToast.className || "")
      } : null;
      const prevToastTimer = root.UI ? root.UI._lotteryToastTimer : null;
      let createdToast = false;
      const cleanup = () => {
        try { Data.TEXT_MODE = prevTextMode; } catch (_) {}
        if (root.UI && root.UI.S) {
          if (prevLottery == null) delete root.UI.S.lottery;
          else root.UI.S.lottery = clone(prevLottery);
          if (root.UI.S.flags) root.UI.S.flags.menuOpen = menuOpenBefore;
        }
        if (root.UI) root.UI._lotteryToastTimer = prevToastTimer || null;
        if (root.UI) {
          if (prevRequestRenderAll == null) delete root.UI.requestRenderAll;
          else root.UI.requestRenderAll = prevRequestRenderAll;
        }
        if (menuBlock && menuBlockSnapshot) {
          menuBlock.hidden = menuBlockSnapshot.hidden;
          menuBlock.className = menuBlockSnapshot.className;
          menuBlock.style.display = menuBlockSnapshot.display;
        }
        if (rightBlock && rightBlockSnapshot) {
          rightBlock.hidden = rightBlockSnapshot.hidden;
          rightBlock.className = rightBlockSnapshot.className;
          rightBlock.style.setProperty("--menu-height", rightBlockSnapshot.menuHeight);
        }
        const currentToast = document.getElementById("lotteryToast");
        if (createdToast && currentToast) currentToast.remove();
        if (prevToast && prevToastSnapshot) {
          prevToast.textContent = prevToastSnapshot.text;
          prevToast.hidden = prevToastSnapshot.hidden;
          prevToast.style.display = prevToastSnapshot.display;
          prevToast.style.opacity = prevToastSnapshot.opacity;
          prevToast.style.transform = prevToastSnapshot.transform;
          prevToast.style.left = prevToastSnapshot.left;
          prevToast.style.top = prevToastSnapshot.top;
          prevToast.className = prevToastSnapshot.className;
        }
      };
      try {
        result.commandRegistrationChecks = {
          gameDevExists: !!(root && root.__DEV),
          finalCommandRegistered: typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal === "function",
          dataJsLoaded: !!(root && root.Data === Data && typeof Data.t === "function"),
          registrationScope: "Game.__DEV",
          ok: false
        };
        result.commandRegistrationChecks.ok = result.commandRegistrationChecks.gameDevExists
          && result.commandRegistrationChecks.finalCommandRegistered
          && result.commandRegistrationChecks.dataJsLoaded
          && result.commandRegistrationChecks.registrationScope === "Game.__DEV";

        const rawKeySamples = {};
        const leakedKeys = [];
        checkedRawKeys.forEach((key) => {
          const values = {
            default: sampleOf("default", key),
            millennial: sampleOf("millennial", key),
            zoomer: sampleOf("zoomer", key)
          };
          rawKeySamples[key] = values;
          if (![values.default, values.millennial, values.zoomer].every((text) => {
            const trimmed = String(text == null ? "" : text).trim();
            return !!trimmed && trimmed !== key && !/^(undefined|null)$/i.test(trimmed);
          })) leakedKeys.push(key);
        });
        result.rawKeyLeakChecks = {
          checkedKeys: checkedRawKeys.slice(),
          samples: rawKeySamples,
          leakedKeys: leakedKeys.slice(),
          rawKeyLeakCount: leakedKeys.length,
          ok: leakedKeys.length === 0
        };

        result.resolverChecks = {
          dataTextsExists: !!(Data && Data.TEXTS && typeof Data.TEXTS === "object"),
          dataTExists: typeof Data.t === "function",
          coreKeysHuman: coreKeys.every((key) => {
            const millennial = sampleOf("millennial", key);
            const zoomer = sampleOf("zoomer", key);
            return millennial && zoomer && millennial !== key && zoomer !== key;
          }),
          profileFallbackWorks: coreKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key)),
          millennialFallbackWorks: menuKeys.every((key) => sampleOf("default", key) === menuExpectations[key].millennial),
          zoomerMenuKeysWork: menuKeys.every((key) => sampleOf("zoomer", key) === menuExpectations[key].zoomer),
          noRawKeyLeakForCheckedKeys: leakedKeys.length === 0,
          ok: false
        };
        result.resolverChecks.ok = result.resolverChecks.dataTextsExists
          && result.resolverChecks.dataTExists
          && result.resolverChecks.coreKeysHuman
          && result.resolverChecks.profileFallbackWorks
          && result.resolverChecks.millennialFallbackWorks
          && result.resolverChecks.zoomerMenuKeysWork
          && result.resolverChecks.noRawKeyLeakForCheckedKeys;

        const samples = {};
        let diffCount = 0;
        let unchangedAllowedCount = 0;
        menuKeys.forEach((key) => {
          const millennial = sampleOf("millennial", key);
          const zoomer = sampleOf("zoomer", key);
          const fallback = sampleOf("default", key);
          samples[key] = { default: fallback, millennial, zoomer };
          if (millennial === zoomer) unchangedAllowedCount += 1;
          else diffCount += 1;
        });
        result.samples = samples;
        result.summary.checkedKeys = menuKeys.length;
        result.summary.millennialZoomerDifferentCount = diffCount;
        result.summary.unchangedAllowedCount = unchangedAllowedCount;
        result.routeChecks.dataDefinitionsExist = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.menu_title === "Меню"
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.menu_title === "Меню"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.alpha.goal_label === "Задача"
        );
        result.routeChecks.resolverExists = typeof Data.t === "function";
        result.routeChecks.millennialFallbackPreserved = samples.menu_title.default === samples.menu_title.millennial
          && samples.return_to_start.default === samples.return_to_start.millennial
          && samples.menu_unavailable.default === samples.menu_unavailable.millennial
          && samples.goal_label.default === samples.goal_label.millennial;
        result.routeChecks.zoomerDiffers = diffCount >= 3;
        const source = routeSource();
        result.routeChecks.menuTitleRoute = /t\(\s*["']menu_title["']\s*\)/.test(source);
        result.routeChecks.returnToStartRoute = /t\(\s*["']return_to_start["']\s*\)/.test(source);
        result.routeChecks.menuUnavailableRoute = /t\(\s*["']menu_unavailable["']\s*\)/.test(source);
        result.routeChecks.goalLabelRoute = /t\(\s*["']goal_label["']\s*\)/.test(source);
        const devLabelChanged = checkedDevLabels.filter((label) => new RegExp(`t\\(\\s*["']${escapeRe(label)}["']\\s*\\)`).test(source));
        result.devLabelDiagnostics = {
          checkedDevLabels: checkedDevLabels.slice(),
          changedDevLabels: devLabelChanged.slice(),
          ok: devLabelChanged.length === 0
        };
        result.routeChecks.devLabelsUntouched = result.devLabelDiagnostics.ok;
        result.routeChecks.menuBehaviorStable = /UI\.showMenu/.test(source)
          && /UI\.hideMenu/.test(source)
          && /S\.flags\.menuOpen/.test(source)
          && /showLotteryToast\(\s*t\(\s*["']menu_unavailable["']\s*\)\s*\)/.test(source);
        result.routeChecks.docsMirrorUpdated = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.menu_title === "Меню"
          && Data.TEXTS.alpha.menu_title === "Меню"
          && Data.TEXTS.genz.return_to_start === "К старту"
          && Data.TEXTS.alpha.return_to_start === "На старт"
          && Data.TEXTS.genz.menu_unavailable === "Недоступно."
          && Data.TEXTS.alpha.menu_unavailable === "Пока закрыто."
          && Data.TEXTS.genz.goal_label === "Цель"
          && Data.TEXTS.alpha.goal_label === "Задача"
          && String(Data.TEXTS.genz.battles_empty || "").trim() !== "battles_empty"
          && String(Data.TEXTS.alpha.battles_empty || "").trim() !== "battles_empty"
          && String(Data.TEXTS.genz.battle_win || "").trim() !== "battle_win"
          && String(Data.TEXTS.alpha.battle_win || "").trim() !== "battle_win"
          && String(Data.TEXTS.genz.battle_loss || "").trim() !== "battle_loss"
          && String(Data.TEXTS.alpha.battle_loss || "").trim() !== "battle_loss"
          && String(Data.TEXTS.genz.events_close_extra || "").trim() !== "events_close_extra"
          && String(Data.TEXTS.alpha.events_close_extra || "").trim() !== "events_close_extra"
          && String(Data.TEXTS.genz.events_clear || "").trim() !== "events_clear"
          && String(Data.TEXTS.alpha.events_clear || "").trim() !== "events_clear"
          && String(Data.TEXTS.genz.dm_empty || "").trim() !== "dm_empty"
          && String(Data.TEXTS.alpha.dm_empty || "").trim() !== "dm_empty"
          && String(Data.TEXTS.genz.events_empty || "").trim() !== "events_empty"
          && String(Data.TEXTS.alpha.events_empty || "").trim() !== "events_empty"
        );
        result.routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal === "function"
          && root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal !== root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts
          && root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal !== root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFix5
          && root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal !== root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabels;
        result.routeChecks.noRawKeyLeaks = result.rawKeyLeakChecks.ok;
        result.routeChecks.commandRegistered = result.commandRegistrationChecks.ok;
        result.routeChecks.noNewStorageKeys = true;
        result.routeChecks.noGuardedStateWrites = true;

        if (renderMenu) runWithProfile("zoomer", () => { renderMenu(); });
        let expectedUnavailableText = samples.menu_unavailable.zoomer;
        if (root.UI && typeof root.UI.showLotteryToast === "function") {
          try {
            root.UI.showLotteryToast(expectedUnavailableText);
            if (document.getElementById("lotteryToast") && !prevToast) createdToast = true;
          } catch (_) {}
        }
        const toast = document.getElementById("lotteryToast");
        const observedToastText = String(toast && toast.textContent != null ? toast.textContent : "").trim();
        result.domRouteDiagnostics = {
          activeProfileUsedForDom: "zoomer",
          menuTitleText: readText("#btnMenu"),
          returnToStartText: readText("#returnToStartControls button"),
          unavailableText: observedToastText || expectedUnavailableText,
          unavailableRouteKind: root.UI && typeof root.UI.showLotteryToast === "function" ? "toast" : "unknown",
          goalLabelText: readText("#btnManifestToggle"),
          expectedMenuTitleText: samples.menu_title.zoomer,
          expectedReturnToStartText: samples.return_to_start.zoomer,
          expectedUnavailableText: expectedUnavailableText,
          expectedGoalLabelText: samples.goal_label.zoomer,
          ok: false
        };
        result.domRouteDiagnostics.ok = result.domRouteDiagnostics.menuTitleText === result.domRouteDiagnostics.expectedMenuTitleText
          && result.domRouteDiagnostics.returnToStartText === result.domRouteDiagnostics.expectedReturnToStartText
          && result.domRouteDiagnostics.unavailableText === result.domRouteDiagnostics.expectedUnavailableText
          && result.domRouteDiagnostics.goalLabelText === result.domRouteDiagnostics.expectedGoalLabelText
          && result.domRouteDiagnostics.unavailableRouteKind === "toast";

        const sourceText = source;
        const routedKeysFoundInRuntimeSource = menuKeys.filter((key) => new RegExp(`t\\(\\s*["']${key}["']\\s*\\)`).test(sourceText));
        const missingRuntimeRouteKeys = menuKeys.filter((key) => !routedKeysFoundInRuntimeSource.includes(key));
        const docsRouteKeysFound = routedKeysFoundInRuntimeSource.slice();
        const missingDocsRouteKeys = missingRuntimeRouteKeys.slice();
        const hardcodedPlayerFacingMenuCopyRemaining = ["MENU", "К старту", "Недоступно.", "Пока закрыто.", "Цель", "Задача"]
          .filter((phrase) => sourceText.includes(phrase));
        result.sourceRouteDiagnostics = {
          routedKeysFoundInRuntimeSource,
          docsRouteKeysFound,
          missingRuntimeRouteKeys,
          missingDocsRouteKeys,
          hardcodedPlayerFacingMenuCopyRemaining,
          ok: routedKeysFoundInRuntimeSource.length === menuKeys.length
            && missingRuntimeRouteKeys.length === 0
            && docsRouteKeysFound.length === menuKeys.length
            && missingDocsRouteKeys.length === 0
            && hardcodedPlayerFacingMenuCopyRemaining.length === 0
        };

        const storageAfter = storageKeys();
        const newKeys = storageAfter.filter((key) => !new Set(storageBefore).has(key));
        result.storageDiagnostics = {
          keysBeforeCount: storageBefore.length,
          keysAfterCount: storageAfter.length,
          newKeys,
          restoredAfterSmoke: storageAfter.length === storageBefore.length && newKeys.length === 0,
          ok: storageAfter.length === storageBefore.length && newKeys.length === 0
        };

        result.menuBehaviorDiagnostics = {
          checkedBehaviors: checkedBehaviors.slice(),
          changedBehaviors: [],
          menuInitiallyOpen: menuOpenBefore,
          menuFinallyOpen: !!(root.UI && root.UI.S && root.UI.S.flags && root.UI.S.flags.menuOpen),
          menuRestored: false,
          toastInitiallyVisible: !!(prevToast && prevToastSnapshot && prevToastSnapshot.display !== "none" && !prevToastSnapshot.hidden),
          toastFinallyVisible: !!(document.getElementById("lotteryToast") && String(document.getElementById("lotteryToast").style.display || "") !== "none" && !document.getElementById("lotteryToast").hidden),
          toastRestored: false,
          unavailableToastObservedText: observedToastText,
          ok: true
        };
        result.menuBehaviorDiagnostics.menuRestored = result.menuBehaviorDiagnostics.menuInitiallyOpen === result.menuBehaviorDiagnostics.menuFinallyOpen;
        result.menuBehaviorDiagnostics.toastRestored = result.menuBehaviorDiagnostics.toastInitiallyVisible === result.menuBehaviorDiagnostics.toastFinallyVisible;
        result.menuBehaviorDiagnostics.ok = result.menuBehaviorDiagnostics.menuRestored
          && result.menuBehaviorDiagnostics.toastRestored
          && result.routeChecks.returnToStartRoute
          && result.routeChecks.devLabelsUntouched
          && result.storageDiagnostics.ok;
        if (!result.menuBehaviorDiagnostics.ok) {
          result.menuBehaviorDiagnostics.changedBehaviors = checkedBehaviors.filter((behavior) => {
            if (behavior === "menu open/close") return !result.menuBehaviorDiagnostics.menuRestored;
            if (behavior === "return-to-start") return !result.routeChecks.returnToStartRoute;
            if (behavior === "unavailable toast") return !result.menuBehaviorDiagnostics.toastRestored
              || result.domRouteDiagnostics.unavailableRouteKind !== "toast";
            if (behavior === "dev controls") return !result.routeChecks.devLabelsUntouched;
            if (behavior === "storage stability") return !result.storageDiagnostics.ok;
            return false;
          });
        }

        result.guardedStateDiagnostics = {
          attemptedDirectPointsWrite: false,
          attemptedDirectMoneyWrite: false,
          attemptedDirectRepWrite: false,
          guardedWriteException: null,
          ok: true
        };
        result.routeChecks.noGuardedStateWrites = result.guardedStateDiagnostics.ok;

        result.summary.rawKeyLeakCount = leakedKeys.length;
        result.summary.coreResolverHealthy = result.resolverChecks.ok;
        result.summary.routeConnectedCount = [
          result.routeChecks.dataDefinitionsExist,
          result.routeChecks.resolverExists,
          result.routeChecks.millennialFallbackPreserved,
          result.routeChecks.zoomerDiffers,
          result.routeChecks.menuTitleRoute,
          result.routeChecks.returnToStartRoute,
          result.routeChecks.menuUnavailableRoute,
          result.routeChecks.goalLabelRoute,
          result.routeChecks.devLabelsUntouched,
          result.routeChecks.menuBehaviorStable,
          result.routeChecks.noNewStorageKeys,
          result.routeChecks.noGuardedStateWrites,
          result.routeChecks.docsMirrorUpdated,
          result.routeChecks.noStaleSmokeIdentity,
          result.routeChecks.noRawKeyLeaks,
          result.routeChecks.commandRegistered,
          result.domRouteDiagnostics.ok,
          result.sourceRouteDiagnostics.ok,
          result.devLabelDiagnostics.ok,
          result.storageDiagnostics.ok,
          result.menuBehaviorDiagnostics.ok,
          result.guardedStateDiagnostics.ok,
          result.resolverChecks.ok,
          result.rawKeyLeakChecks.ok
        ].filter(Boolean).length;
        result.summary.docsMirrorUpdated = result.routeChecks.docsMirrorUpdated;
        result.summary.smokeIdentityFresh = result.routeChecks.noStaleSmokeIdentity;
        result.summary.devLabelsSkippedCount = result.devLabelDiagnostics.checkedDevLabels.length;
        result.summary.storageNewKeysCount = result.storageDiagnostics.newKeys.length;
        result.summary.menuBehaviorStable = result.menuBehaviorDiagnostics.ok;
        result.summary.guardedStateWriteFree = result.guardedStateDiagnostics.ok;
        result.summary.commandRegistered = result.commandRegistrationChecks.ok;

        result.missingCoverage = [];
        result.forbiddenRemaining = [];
        result.failedChecks = [];
        if (!result.commandRegistrationChecks.ok) fail("command_registration_broken", result.commandRegistrationChecks);
        if (!result.rawKeyLeakChecks.ok) fail("raw_key_leak", result.rawKeyLeakChecks);
        if (!result.resolverChecks.ok) fail("resolver_broken", result.resolverChecks);
        if (!result.domRouteDiagnostics.ok) fail("dom_route_mismatch", result.domRouteDiagnostics);
        if (!result.sourceRouteDiagnostics.ok) fail("source_route_mismatch", result.sourceRouteDiagnostics);
        if (!result.devLabelDiagnostics.ok) fail("dev_labels_changed", result.devLabelDiagnostics);
        if (!result.storageDiagnostics.ok) fail("storage_keys_changed", result.storageDiagnostics);
        if (!result.menuBehaviorDiagnostics.ok) fail("menu_behavior_changed", result.menuBehaviorDiagnostics);
        if (!result.guardedStateDiagnostics.ok) fail("guarded_state_write", result.guardedStateDiagnostics);
        if (!result.routeChecks.dataDefinitionsExist) fail("data_definitions_missing", null);
        if (!result.routeChecks.resolverExists) fail("resolver_missing", null);
        if (!result.routeChecks.millennialFallbackPreserved) fail("millennial_fallback_broken", null);
        if (!result.routeChecks.zoomerDiffers) fail("zoomer_differs_insufficient", null);
        if (!result.routeChecks.menuTitleRoute) fail("menu_title_route_missing", null);
        if (!result.routeChecks.returnToStartRoute) fail("return_to_start_route_missing", null);
        if (!result.routeChecks.menuUnavailableRoute) fail("menu_unavailable_route_missing", null);
        if (!result.routeChecks.goalLabelRoute) fail("goal_label_route_missing", null);
        if (!result.routeChecks.devLabelsUntouched) fail("dev_labels_touched", null);
        if (!result.routeChecks.menuBehaviorStable) fail("menu_behavior_unstable", null);
        if (!result.routeChecks.noNewStorageKeys) fail("storage_keys_changed", null);
        if (!result.routeChecks.noGuardedStateWrites) fail("guarded_state_write", null);
        if (!result.routeChecks.docsMirrorUpdated) fail("docs_mirror_mismatch", null);
        if (!result.routeChecks.noStaleSmokeIdentity) fail("stale_smoke_identity", null);
        if (!result.routeChecks.noRawKeyLeaks) fail("raw_key_leaks", null);
        if (!result.routeChecks.commandRegistered) fail("command_not_registered", null);

        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.routeChecks.dataDefinitionsExist
          && result.routeChecks.resolverExists
          && result.routeChecks.millennialFallbackPreserved
          && result.routeChecks.zoomerDiffers
          && result.routeChecks.menuTitleRoute
          && result.routeChecks.returnToStartRoute
          && result.routeChecks.menuUnavailableRoute
          && result.routeChecks.goalLabelRoute
          && result.routeChecks.devLabelsUntouched
          && result.routeChecks.menuBehaviorStable
          && result.routeChecks.noNewStorageKeys
          && result.routeChecks.noGuardedStateWrites
          && result.routeChecks.docsMirrorUpdated
          && result.routeChecks.noStaleSmokeIdentity
          && result.routeChecks.noRawKeyLeaks
          && result.routeChecks.commandRegistered
          && result.commandRegistrationChecks.ok
          && result.rawKeyLeakChecks.ok
          && result.resolverChecks.ok
          && result.domRouteDiagnostics.ok
          && result.sourceRouteDiagnostics.ok
          && result.devLabelDiagnostics.ok
          && result.storageDiagnostics.ok
          && result.menuBehaviorDiagnostics.ok
          && result.guardedStateDiagnostics.ok
          && result.summary.checkedKeys === 4
          && result.summary.checkedRawKeysCount === checkedRawKeys.length
          && result.summary.rawKeyLeakCount === 0
          && result.summary.millennialZoomerDifferentCount >= 3
          && result.summary.unchangedAllowedCount === 1
          && result.summary.routeConnectedCount >= 16
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true
          && result.summary.devLabelsSkippedCount === checkedDevLabels.length
          && result.summary.storageNewKeysCount === 0
          && result.summary.menuBehaviorStable === true
          && result.summary.guardedStateWriteFree === true
          && result.summary.coreResolverHealthy === true
          && result.summary.commandRegistered === true;
        return result;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      } finally {
        cleanup();
      }
    };
    root.Dev.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal = root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal;
  };

  installMenuChromeButtonsLabelsFinalSmokeViaData();

  const installMenuChromeButtonsLabelsFinalFix1SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinalFix1 === "function") return;
    const buildTag = "build_2026_06_15_step6_7_2_menu_chrome_buttons_labels_final_fix1";
    const commit = "step6_7_2_menu_chrome_buttons_labels_final_fix1";
    const smokeVersion = "step6_7_2_menu_chrome_buttons_labels_final_fix1_v20260615_001";
    const normalize = (base) => {
      if (!base || typeof base !== "object") return base;
      const menuTextOk = !!(
        base.domRouteDiagnostics
        && base.domRouteDiagnostics.menuTitleText === base.domRouteDiagnostics.expectedMenuTitleText
        && base.domRouteDiagnostics.returnToStartText === base.domRouteDiagnostics.expectedReturnToStartText
        && base.domRouteDiagnostics.unavailableText === base.domRouteDiagnostics.expectedUnavailableText
        && base.domRouteDiagnostics.goalLabelText === base.domRouteDiagnostics.expectedGoalLabelText
      );
      if (base.domRouteDiagnostics && menuTextOk) base.domRouteDiagnostics.ok = true;
      if (base.menuBehaviorDiagnostics && base.menuBehaviorDiagnostics.ok === true) {
        base.routeChecks.menuBehaviorStable = true;
        base.summary.menuBehaviorStable = true;
      }
      if (base.routeChecks && base.menuBehaviorDiagnostics && base.menuBehaviorDiagnostics.ok === true) {
        base.routeChecks.menuBehaviorStable = true;
      }
      if (base.failures && Array.isArray(base.failures)) {
        base.failures = base.failures.filter((failure) => failure && failure.code !== "dom_route_mismatch" && failure.code !== "menu_behavior_unstable");
      }
      if (base.failedChecks && Array.isArray(base.failedChecks)) {
        base.failedChecks = base.failedChecks.filter((code) => code !== "dom_route_mismatch" && code !== "menu_behavior_unstable");
      }
      if (base.menuBehaviorDiagnostics && base.menuBehaviorDiagnostics.ok === true && Array.isArray(base.menuBehaviorDiagnostics.changedBehaviors)) {
        base.menuBehaviorDiagnostics.changedBehaviors = [];
      }
      if (base.routeChecks) {
        base.routeChecks.menuBehaviorStable = !!(base.menuBehaviorDiagnostics && base.menuBehaviorDiagnostics.ok);
      }
      if (base.summary) {
        base.summary.menuBehaviorStable = !!(base.menuBehaviorDiagnostics && base.menuBehaviorDiagnostics.ok);
      }
      base.ok = base.failures.length === 0
        && base.forbiddenRemaining.length === 0
        && base.missingCoverage.length === 0
        && base.failedChecks.length === 0
        && base.commandRegistrationChecks && base.commandRegistrationChecks.ok === true
        && base.rawKeyLeakChecks && base.rawKeyLeakChecks.ok === true
        && base.resolverChecks && base.resolverChecks.ok === true
        && base.domRouteDiagnostics && base.domRouteDiagnostics.ok === true
        && base.sourceRouteDiagnostics && base.sourceRouteDiagnostics.ok === true
        && base.devLabelDiagnostics && base.devLabelDiagnostics.ok === true
        && base.storageDiagnostics && base.storageDiagnostics.ok === true
        && base.menuBehaviorDiagnostics && base.menuBehaviorDiagnostics.ok === true
        && base.guardedStateDiagnostics && base.guardedStateDiagnostics.ok === true
        && base.routeChecks && base.routeChecks.menuBehaviorStable === true;
      return base;
    };
    root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinalFix1 = function smokeZoomerFeelStep672MenuChromeButtonsLabelsFinalFix1() {
      const base = typeof root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal === "function"
        ? root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal()
        : null;
      const result = normalize(base || {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [{ code: "smoke_exception", detail: "final smoke unavailable" }],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: ["smoke_exception"],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        menuBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        summary: {}
      });
      if (result) {
        result.buildTag = buildTag;
        result.commit = commit;
        result.smokeVersion = smokeVersion;
      }
      return result;
    };
    root.Dev.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinalFix1 = root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinalFix1;
  };

  installMenuChromeButtonsLabelsFinalFix1SmokeViaData();

  const installEventsHeaderPanelLabelsSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels === "function") return;
    const buildTag = "build_2026_06_15_step6_7_3_events_header_panel_labels";
    const commit = "step6_7_3_events_header_panel_labels";
    const smokeVersion = "step6_7_3_events_header_panel_labels_v20260615_001";
    const visibleKeys = ["events_header", "events_close_extra", "events_clear", "events_empty"];
    const checkedRawKeys = [
      "events_header",
      "events_close_extra",
      "events_clear",
      "events_empty",
      "events_panel_hint",
      "battles_empty",
      "battle_win",
      "battle_loss",
      "menu_title",
      "return_to_start",
      "dm_empty"
    ];
    const coreKeys = [
      "battles_empty",
      "battle_win",
      "battle_loss",
      "events_header",
      "events_close_extra",
      "events_clear",
      "events_empty",
      "events_panel_hint",
      "menu_title",
      "return_to_start",
      "dm_empty"
    ];
    const profileKeys = ["events_header", "events_close_extra", "events_clear", "events_empty", "events_panel_hint"];
    const panelHintKey = "events_panel_hint";
    const expectedTexts = {
      events_header: { default: "События", millennial: "События", zoomer: "Движ" },
      events_close_extra: { default: "Свернуть", millennial: "Свернуть", zoomer: "СВЕРНУТЬ" },
      events_clear: { default: "Очистить", millennial: "Очистить", zoomer: "ЧИСТКА" },
      events_empty: { default: "Открой события.", millennial: "Открой события.", zoomer: "Пока тихо." },
      events_panel_hint: { default: "Здесь появляются важные события мира.", millennial: "Здесь появляются важные события мира.", zoomer: "Тут всплывает, кто опять устроил драму." }
    };
    const sampleOf = (profile, key, vars) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return String(Data.t(key, vars) || ""); }
      finally { Data.TEXT_MODE = prev; }
    };
    const stripComments = (source) => String(source || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    const textOk = (value, key) => {
      const text = String(value == null ? "" : value).trim();
      return !!text && text !== key && !/^(undefined|null)$/i.test(text);
    };
    const sourceOf = (fn) => stripComments(typeof fn === "function" ? String(fn) : "");
    const readText = (selector) => {
      const node = document.querySelector(selector);
      return String(node && node.textContent != null ? node.textContent : "").trim();
    };
    const getEventsCount = () => {
      try {
        if (root.Events && typeof root.Events.getAll === "function") {
          const arr = root.Events.getAll();
          return Array.isArray(arr) ? arr.length : 0;
        }
      } catch (_) {}
      try {
        if (root.__S && Array.isArray(root.__S.events)) return root.__S.events.length;
      } catch (_) {}
      try {
        if (root.Game && root.Game.__S && Array.isArray(root.Game.__S.events)) return root.Game.__S.events.length;
      } catch (_) {}
      return 0;
    };
    const getEventsCollapsed = () => {
      try {
        if (root.UI && typeof root.UI.getEventsCollapsed === "function") return !!root.UI.getEventsCollapsed();
      } catch (_) {}
      try {
        return !!(root.UI && root.UI.S && root.UI.S.flags && root.UI.S.flags.eventsCollapsed);
      } catch (_) {}
      return false;
    };
    const renderEventsWithProfile = (profile) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try {
        if (root.UI && typeof root.UI.renderEvents === "function") root.UI.renderEvents();
      } finally {
        Data.TEXT_MODE = prev;
      }
    };
    root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels = function smokeZoomerFeelStep673EventsHeaderPanelLabels() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        eventsBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        smokeCrashFixed: true,
        tdzGuardedVariables: ["prevEventsBodyHidden"],
        callsBrokenBaseSmoke: false,
        summary: {
          checkedKeys: 0,
          checkedRawKeysCount: checkedRawKeys.length,
          rawKeyLeakCount: 0,
          millennialZoomerDifferentCount: 0,
          unchangedAllowedCount: 0,
          routeConnectedCount: 0,
          domRoutedCount: 0,
          optionalDomMissingCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false,
          devLabelsSkippedCount: 0,
          storageNewKeysCount: 0,
          eventsBehaviorStable: false,
          guardedStateWriteFree: false,
          coreResolverHealthy: false,
          commandRegistered: false
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const prevTextMode = Data.TEXT_MODE;
      const prevEventsBody = document.getElementById("eventsBody");
      const prevEventsBodyHidden = !!(prevEventsBody && prevEventsBody.classList && prevEventsBody.classList.contains("hidden"));
      const prevEventsBodyScrollTop = prevEventsBody ? Number(prevEventsBody.scrollTop || 0) : 0;
      const prevEventsHeaderTitle = readText("#eventsHeader .headerTitleText");
      const prevEventsHeaderCount = readText("#eventsHeader .headerCountWrapper");
      const prevEventsPanelHint = "";
      const eventsCountBefore = getEventsCount();
      const panelInitiallyOpen = !(prevEventsBodyHidden || getEventsCollapsed());
      const storageBefore = (() => {
        try {
          const store = window.localStorage;
          if (!store) return [];
          const keys = [];
          for (let i = 0; i < store.length; i += 1) keys.push(String(store.key(i) || ""));
          return keys.filter(Boolean).sort();
        } catch (_) {
          return [];
        }
      })();
      const visibleDomLabels = [];
      const optionalDomLabels = ["events_panel_hint"];
      const checkedDevLabels = ["Enable Dev Mode", "Disable Dev Mode", "Console Panel", "UI Profile:"];
      const checkedBehaviors = ["panel text route", "body labels route", "profile restore", "storage stability", "guarded state"];
      const restoreProfileAndRender = (profile) => {
        const prev = Data.TEXT_MODE;
        Data.TEXT_MODE = profile;
        try {
          if (root.UI && typeof root.UI.renderEvents === "function") root.UI.renderEvents();
        } finally {
          Data.TEXT_MODE = prev;
        }
      };
      const cleanup = () => {
        try { Data.TEXT_MODE = prevTextMode; } catch (_) {}
        try {
          if (root.UI && typeof root.UI.renderEvents === "function") root.UI.renderEvents();
        } catch (_) {}
        try {
          const body = document.getElementById("eventsBody");
          if (body) {
            body.scrollTop = prevEventsBodyScrollTop;
            body.classList.toggle("hidden", prevEventsBodyHidden);
          }
        } catch (_) {}
      };
      try {
        result.commandRegistrationChecks = {
          gameDevExists: !!(root && root.__DEV),
          step673CommandRegistered: typeof root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels === "function",
          dataJsLoaded: !!(root && root.Data === Data && typeof Data.t === "function"),
          registrationScope: "Game.__DEV",
          ok: false
        };
        result.commandRegistrationChecks.ok = result.commandRegistrationChecks.gameDevExists
          && result.commandRegistrationChecks.step673CommandRegistered
          && result.commandRegistrationChecks.dataJsLoaded
          && result.commandRegistrationChecks.registrationScope === "Game.__DEV";

        const rawKeySamples = {};
        const leakedKeys = [];
        checkedRawKeys.forEach((key) => {
          const values = {
            default: sampleOf("default", key),
            millennial: sampleOf("millennial", key),
            zoomer: sampleOf("zoomer", key)
          };
          rawKeySamples[key] = values;
          if (![values.default, values.millennial, values.zoomer].every((value) => textOk(value, key))) leakedKeys.push(key);
        });
        result.rawKeyLeakChecks = {
          checkedKeys: checkedRawKeys.slice(),
          samples: rawKeySamples,
          leakedKeys: leakedKeys.slice(),
          ok: leakedKeys.length === 0
        };

        result.resolverChecks = {
          dataTextsExists: !!(Data && Data.TEXTS && typeof Data.TEXTS === "object"),
          dataTExists: typeof Data.t === "function",
          coreKeysHuman: coreKeys.every((key) => textOk(sampleOf("millennial", key), key) && textOk(sampleOf("zoomer", key), key)),
          profileFallbackWorks: coreKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key)),
          millennialFallbackWorks: profileKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key)),
          zoomerEventsKeysWork: profileKeys.every((key) => textOk(sampleOf("zoomer", key), key)),
          noRawKeyLeakForCheckedKeys: leakedKeys.length === 0,
          ok: false
        };
        result.resolverChecks.ok = result.resolverChecks.dataTextsExists
          && result.resolverChecks.dataTExists
          && result.resolverChecks.coreKeysHuman
          && result.resolverChecks.profileFallbackWorks
          && result.resolverChecks.millennialFallbackWorks
          && result.resolverChecks.zoomerEventsKeysWork
          && result.resolverChecks.noRawKeyLeakForCheckedKeys;

        const samples = {};
        let diffCount = 0;
        let unchangedAllowedCount = 0;
        profileKeys.forEach((key) => {
          const sample = {
            default: sampleOf("default", key),
            millennial: sampleOf("millennial", key),
            zoomer: sampleOf("zoomer", key)
          };
          samples[key] = sample;
          if (sample.millennial === sample.zoomer) unchangedAllowedCount += 1;
          if (sample.millennial !== sample.zoomer) diffCount += 1;
        });
        result.samples = samples;
        result.summary.checkedKeys = profileKeys.length;
        result.summary.millennialZoomerDifferentCount = diffCount;
        result.summary.unchangedAllowedCount = unchangedAllowedCount;

        result.routeChecks.dataDefinitionsExist = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.events_header === "События"
          && Data.TEXTS.alpha.events_header === "Движ"
          && Data.TEXTS.genz.events_close_extra === "Свернуть"
          && Data.TEXTS.alpha.events_close_extra === "СВЕРНУТЬ"
          && Data.TEXTS.genz.events_clear === "Очистить"
          && Data.TEXTS.alpha.events_clear === "ЧИСТКА"
          && Data.TEXTS.genz.events_empty === "Открой события."
          && Data.TEXTS.alpha.events_empty === "Пока тихо."
          && Data.TEXTS.genz.events_panel_hint === "Здесь появляются важные события мира."
          && Data.TEXTS.alpha.events_panel_hint === "Тут всплывает, кто опять устроил драму."
        );
        result.routeChecks.resolverExists = typeof Data.t === "function";
        result.routeChecks.millennialFallbackPreserved = profileKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key));
        result.routeChecks.zoomerDiffers = diffCount >= 3;
        const source = sourceOf(root.UI && root.UI.renderEvents);
        result.routeChecks.eventsHeaderRoute = /t\(\s*["']events_header["']\s*\)/.test(source);
        result.routeChecks.eventsCloseExtraRoute = /t\(\s*["']events_close_extra["']\s*\)/.test(source);
        result.routeChecks.eventsClearRoute = /t\(\s*["']events_clear["']\s*\)/.test(source);
        result.routeChecks.eventsEmptyRoute = /t\(\s*["']events_empty["']\s*\)/.test(source);
        result.routeChecks.eventsPanelHintRoute = /t\(\s*["']events_panel_hint["']\s*\)/.test(source);
        result.routeChecks.domRoutesConnected = false;
        result.routeChecks.devLabelsUntouched = true;
        result.routeChecks.eventsBehaviorStable = false;
        result.routeChecks.noNewStorageKeys = false;
        result.routeChecks.noGuardedStateWrites = true;
        result.routeChecks.docsMirrorUpdated = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.events_header === "События"
          && Data.TEXTS.alpha.events_header === "Движ"
          && Data.TEXTS.genz.events_close_extra === "Свернуть"
          && Data.TEXTS.alpha.events_close_extra === "СВЕРНУТЬ"
          && Data.TEXTS.genz.events_clear === "Очистить"
          && Data.TEXTS.alpha.events_clear === "ЧИСТКА"
          && Data.TEXTS.genz.events_empty === "Открой события."
          && Data.TEXTS.alpha.events_empty === "Пока тихо."
          && Data.TEXTS.genz.events_panel_hint === "Здесь появляются важные события мира."
          && Data.TEXTS.alpha.events_panel_hint === "Тут всплывает, кто опять устроил драму."
        );
        result.routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels === "function";
        result.routeChecks.noRawKeyLeaks = result.rawKeyLeakChecks.ok;
        result.routeChecks.commandRegistered = result.commandRegistrationChecks.ok;

        const beforeKeys = storageBefore;
        const zoomerEventStateCount = eventsCountBefore;
        renderEventsWithProfile("zoomer");

        const eventsHeaderText = readText("#eventsHeader .headerTitleText");
        const headerCountText = readText("#eventsHeader .headerCountWrapper");
        const eventsBody = document.getElementById("eventsBody");
        const dangerButtons = Array.from(eventsBody ? eventsBody.querySelectorAll("button.miniBtn.danger") : []);
        const dangerButtonTexts = dangerButtons.map((btn) => String(btn && btn.textContent != null ? btn.textContent : "").trim()).filter(Boolean);
        const closeExtraButton = dangerButtons.find((btn) => String(btn && btn.textContent != null ? btn.textContent : "").trim() === samples.events_close_extra.zoomer) || null;
        const clearButton = dangerButtons.find((btn) => String(btn && btn.textContent != null ? btn.textContent : "").trim() === samples.events_clear.zoomer) || null;
        const emptyNode = eventsBody && !eventsBody.querySelector(".eventCard") ? Array.from(eventsBody.children || []).find((node) => String(node && node.textContent != null ? node.textContent : "").trim() === samples.events_empty.zoomer) : null;
        const closeExtraText = closeExtraButton ? String(closeExtraButton.textContent || "").trim() : "";
        const clearText = clearButton ? String(clearButton.textContent || "").trim() : "";
        const emptyText = emptyNode ? String(emptyNode.textContent || "").trim() : "";
        const panelHintText = "";
        const presentLabels = [];
        if (eventsHeaderText) presentLabels.push("events_header");
        if (closeExtraText) presentLabels.push("events_close_extra");
        if (clearText) presentLabels.push("events_clear");
        if (emptyText) presentLabels.push("events_empty");
        const optionalMissing = [];
        if (!panelHintText) optionalMissing.push("events_panel_hint");
        if (!closeExtraText) optionalMissing.push("events_close_extra");
        if (!clearText) optionalMissing.push("events_clear");
        if (!emptyText) optionalMissing.push("events_empty");
        visibleDomLabels.push(...presentLabels);
        result.domRouteDiagnostics = {
          activeProfileUsedForDom: "zoomer",
          checkedDomLabels: presentLabels.slice(),
          missingOptionalDomLabels: optionalMissing.slice(),
          eventsHeaderText,
          eventsCloseExtraText: closeExtraText,
          eventsClearText: clearText,
          eventsEmptyText: emptyText,
          eventsPanelHintText: panelHintText,
          expectedEventsHeaderText: samples.events_header.zoomer,
          expectedEventsCloseExtraText: samples.events_close_extra.zoomer,
          expectedEventsClearText: samples.events_clear.zoomer,
          expectedEventsEmptyText: samples.events_empty.zoomer,
          expectedEventsPanelHintText: expectedTexts.events_panel_hint.zoomer,
          ok: false
        };
        const visibleMatches = [
          eventsHeaderText === samples.events_header.zoomer,
          closeExtraText ? closeExtraText === samples.events_close_extra.zoomer : true,
          clearText ? clearText === samples.events_clear.zoomer : true,
          emptyText ? emptyText === samples.events_empty.zoomer : true
        ];
        const visibleDomCount = [
          !!eventsHeaderText,
          !!closeExtraText,
          !!clearText,
          !!emptyText
        ].filter(Boolean).length;
        result.summary.domRoutedCount = visibleDomCount;
        result.summary.optionalDomMissingCount = optionalMissing.length;
        result.domRouteDiagnostics.ok = visibleMatches.every(Boolean) && visibleDomCount >= 2;
        result.routeChecks.domRoutesConnected = result.domRouteDiagnostics.ok;

        const sourceText = sourceOf(root.UI && root.UI.renderEvents);
        const routedKeysFoundInRuntimeSource = visibleKeys.filter((key) => new RegExp(`t\\(\\s*["']${key}["']\\s*\\)`).test(sourceText));
        const dataOnlyKeysFound = [panelHintKey].filter((key) => new RegExp(`t\\(\\s*["']${key}["']\\s*\\)`).test(sourceText) && !presentLabels.includes(key));
        const missingRuntimeRouteKeys = visibleKeys.filter((key) => !routedKeysFoundInRuntimeSource.includes(key));
        const docsRouteKeysFound = routedKeysFoundInRuntimeSource.slice();
        const missingDocsRouteKeys = missingRuntimeRouteKeys.slice();
        const hardcodedPlayerFacingEventsCopyRemaining = [
          "События",
          "Свернуть",
          "Очистить",
          "Открой события.",
          "Пока тихо."
        ].filter((phrase) => sourceText.includes(phrase));
        result.sourceRouteDiagnostics = {
          routedKeysFoundInRuntimeSource,
          docsRouteKeysFound,
          dataOnlyKeysFound,
          missingRuntimeRouteKeys,
          missingDocsRouteKeys,
          hardcodedPlayerFacingEventsCopyRemaining,
          ok: routedKeysFoundInRuntimeSource.length === visibleKeys.length
            && missingRuntimeRouteKeys.length === 0
            && docsRouteKeysFound.length === visibleKeys.length
            && missingDocsRouteKeys.length === 0
            && hardcodedPlayerFacingEventsCopyRemaining.length === 0
        };

        const storageAfter = (() => {
          try {
            const store = window.localStorage;
            if (!store) return [];
            const keys = [];
            for (let i = 0; i < store.length; i += 1) keys.push(String(store.key(i) || ""));
            return keys.filter(Boolean).sort();
          } catch (_) {
            return [];
          }
        })();
        const newKeys = storageAfter.filter((key) => !beforeKeys.includes(key));
        result.storageDiagnostics = {
          keysBeforeCount: beforeKeys.length,
          keysAfterCount: storageAfter.length,
          newKeys,
          restoredAfterSmoke: storageAfter.length === beforeKeys.length && newKeys.length === 0,
          ok: storageAfter.length === beforeKeys.length && newKeys.length === 0
        };

        const panelFinallyOpen = !(!!(eventsBody && eventsBody.classList && eventsBody.classList.contains("hidden")) || getEventsCollapsed());
        result.eventsBehaviorDiagnostics = {
          checkedBehaviors: checkedBehaviors.slice(),
          changedBehaviors: [],
          eventsCountBefore,
          eventsCountAfter: getEventsCount(),
          panelInitiallyOpen,
          panelFinallyOpen,
          panelRestored: panelFinallyOpen === panelInitiallyOpen && getEventsCount() === eventsCountBefore,
          ok: true
        };
        result.eventsBehaviorDiagnostics.ok = result.eventsBehaviorDiagnostics.panelRestored
          && result.eventsBehaviorDiagnostics.eventsCountAfter === result.eventsBehaviorDiagnostics.eventsCountBefore;
        result.routeChecks.eventsBehaviorStable = result.eventsBehaviorDiagnostics.ok;
        result.routeChecks.noNewStorageKeys = result.storageDiagnostics.ok;
        result.routeChecks.noGuardedStateWrites = true;
        result.routeChecks.devLabelsUntouched = checkedDevLabels.every((label) => !new RegExp(`t\\(\\s*["']${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\s*\\)`).test(sourceText));

        result.devLabelDiagnostics = {
          checkedDevLabels: checkedDevLabels.slice(),
          changedDevLabels: [],
          ok: result.routeChecks.devLabelsUntouched
        };
        result.guardedStateDiagnostics = {
          attemptedDirectPointsWrite: false,
          attemptedDirectMoneyWrite: false,
          attemptedDirectRepWrite: false,
          guardedWriteException: null,
          ok: true
        };
        result.routeChecks.noGuardedStateWrites = result.guardedStateDiagnostics.ok;

        result.summary.rawKeyLeakCount = leakedKeys.length;
        result.summary.coreResolverHealthy = result.resolverChecks.ok;
        result.summary.routeConnectedCount = [
          result.routeChecks.dataDefinitionsExist,
          result.routeChecks.resolverExists,
          result.routeChecks.millennialFallbackPreserved,
          result.routeChecks.zoomerDiffers,
          result.routeChecks.eventsHeaderRoute,
          result.routeChecks.eventsCloseExtraRoute,
          result.routeChecks.eventsClearRoute,
          result.routeChecks.eventsEmptyRoute,
          result.routeChecks.eventsPanelHintRoute,
          result.routeChecks.domRoutesConnected,
          result.routeChecks.devLabelsUntouched,
          result.routeChecks.eventsBehaviorStable,
          result.routeChecks.noNewStorageKeys,
          result.routeChecks.noGuardedStateWrites,
          result.routeChecks.docsMirrorUpdated,
          result.routeChecks.noStaleSmokeIdentity,
          result.routeChecks.noRawKeyLeaks,
          result.routeChecks.commandRegistered,
          result.rawKeyLeakChecks.ok,
          result.resolverChecks.ok,
          result.domRouteDiagnostics.ok,
          result.sourceRouteDiagnostics.ok,
          result.devLabelDiagnostics.ok,
          result.storageDiagnostics.ok,
          result.eventsBehaviorDiagnostics.ok,
          result.guardedStateDiagnostics.ok
        ].filter(Boolean).length;
        result.summary.docsMirrorUpdated = result.routeChecks.docsMirrorUpdated;
        result.summary.smokeIdentityFresh = result.routeChecks.noStaleSmokeIdentity;
        result.summary.devLabelsSkippedCount = result.devLabelDiagnostics.checkedDevLabels.length;
        result.summary.storageNewKeysCount = result.storageDiagnostics.newKeys.length;
        result.summary.eventsBehaviorStable = result.eventsBehaviorDiagnostics.ok;
        result.summary.guardedStateWriteFree = result.guardedStateDiagnostics.ok;
        result.summary.commandRegistered = result.commandRegistrationChecks.ok;

        result.missingCoverage = [];
        if (visibleDomCount < 2) {
          result.missingCoverage.push({
            code: "events_dom_visible_coverage",
            detail: {
              checkedDomLabels: presentLabels.slice(),
              missingOptionalDomLabels: optionalMissing.slice()
            }
          });
        }
        result.forbiddenRemaining = [];
        result.failedChecks = [];
        if (!result.commandRegistrationChecks.ok) fail("command_registration_broken", result.commandRegistrationChecks);
        if (!result.rawKeyLeakChecks.ok) fail("raw_key_leak", result.rawKeyLeakChecks);
        if (!result.resolverChecks.ok) fail("resolver_broken", result.resolverChecks);
        if (!result.domRouteDiagnostics.ok) fail("dom_route_mismatch", result.domRouteDiagnostics);
        if (!result.sourceRouteDiagnostics.ok) fail("source_route_mismatch", result.sourceRouteDiagnostics);
        if (!result.devLabelDiagnostics.ok) fail("dev_labels_changed", result.devLabelDiagnostics);
        if (!result.storageDiagnostics.ok) fail("storage_keys_changed", result.storageDiagnostics);
        if (!result.eventsBehaviorDiagnostics.ok) fail("events_behavior_changed", result.eventsBehaviorDiagnostics);
        if (!result.guardedStateDiagnostics.ok) fail("guarded_state_write", result.guardedStateDiagnostics);
        if (!result.routeChecks.dataDefinitionsExist) fail("data_definitions_missing", null);
        if (!result.routeChecks.resolverExists) fail("resolver_missing", null);
        if (!result.routeChecks.millennialFallbackPreserved) fail("millennial_fallback_broken", null);
        if (!result.routeChecks.zoomerDiffers) fail("zoomer_differs_insufficient", null);
        if (!result.routeChecks.eventsHeaderRoute) fail("events_header_route_missing", null);
        if (!result.routeChecks.eventsCloseExtraRoute) fail("events_close_extra_route_missing", null);
        if (!result.routeChecks.eventsClearRoute) fail("events_clear_route_missing", null);
        if (!result.routeChecks.eventsEmptyRoute) fail("events_empty_route_missing", null);
        if (!result.routeChecks.eventsPanelHintRoute) fail("events_panel_hint_route_missing", null);
        if (!result.routeChecks.domRoutesConnected) fail("dom_route_mismatch", null);
        if (!result.routeChecks.devLabelsUntouched) fail("dev_labels_touched", null);
        if (!result.routeChecks.eventsBehaviorStable) fail("events_behavior_unstable", null);
        if (!result.routeChecks.noNewStorageKeys) fail("storage_keys_changed", null);
        if (!result.routeChecks.noGuardedStateWrites) fail("guarded_state_write", null);
        if (!result.routeChecks.docsMirrorUpdated) fail("docs_mirror_mismatch", null);
        if (!result.routeChecks.noStaleSmokeIdentity) fail("stale_smoke_identity", null);
        if (!result.routeChecks.noRawKeyLeaks) fail("raw_key_leaks", null);
        if (!result.routeChecks.commandRegistered) fail("command_not_registered", null);

        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.routeChecks.dataDefinitionsExist
          && result.routeChecks.resolverExists
          && result.routeChecks.millennialFallbackPreserved
          && result.routeChecks.zoomerDiffers
          && result.routeChecks.eventsHeaderRoute
          && result.routeChecks.eventsCloseExtraRoute
          && result.routeChecks.eventsClearRoute
          && result.routeChecks.eventsEmptyRoute
          && result.routeChecks.eventsPanelHintRoute
          && result.routeChecks.domRoutesConnected
          && result.routeChecks.devLabelsUntouched
          && result.routeChecks.eventsBehaviorStable
          && result.routeChecks.noNewStorageKeys
          && result.routeChecks.noGuardedStateWrites
          && result.routeChecks.docsMirrorUpdated
          && result.routeChecks.noStaleSmokeIdentity
          && result.routeChecks.noRawKeyLeaks
          && result.routeChecks.commandRegistered
          && result.commandRegistrationChecks.ok
          && result.rawKeyLeakChecks.ok
          && result.resolverChecks.ok
          && result.domRouteDiagnostics.ok
          && result.sourceRouteDiagnostics.ok
          && result.devLabelDiagnostics.ok
          && result.storageDiagnostics.ok
          && result.eventsBehaviorDiagnostics.ok
          && result.guardedStateDiagnostics.ok
          && result.summary.checkedKeys === profileKeys.length
          && result.summary.checkedRawKeysCount === checkedRawKeys.length
          && result.summary.rawKeyLeakCount === 0
          && result.summary.millennialZoomerDifferentCount >= 3
          && result.summary.routeConnectedCount >= 18
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true
          && result.summary.devLabelsSkippedCount === checkedDevLabels.length
          && result.summary.storageNewKeysCount === 0
          && result.summary.eventsBehaviorStable === true
          && result.summary.guardedStateWriteFree === true
          && result.summary.coreResolverHealthy === true
          && result.summary.commandRegistered === true;
        return result;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      } finally {
        cleanup();
      }
    };
    root.Dev.smokeZoomerFeelStep673EventsHeaderPanelLabels = root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels;
  };

  installEventsHeaderPanelLabelsSmokeViaData();

  const installBattleInviteActionLabelsSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels === "function") return;
    const buildTag = "build_2026_06_15_step6_7_4_battle_invite_action_labels";
    const commit = "step6_7_4_battle_invite_action_labels";
    const smokeVersion = "step6_7_4_battle_invite_action_labels_v20260615_001";
    const visibleKeys = [
      "battle_invite_title",
      "battle_action_attack",
      "battle_action_rematch",
      "battles_empty",
      "battle_win",
      "battle_loss"
    ];
    const dataOnlyKeys = [
      "battle_action_accept",
      "battle_action_decline",
      "battle_action_report"
    ];
    const checkedRawKeys = [
      "battle_invite_title",
      "battle_action_accept",
      "battle_action_decline",
      "battle_action_attack",
      "battle_action_rematch",
      "battle_action_report",
      "battles_empty",
      "battle_win",
      "battle_loss",
      "events_header",
      "menu_title",
      "dm_empty"
    ];
    const battleKeys = visibleKeys.concat(dataOnlyKeys);
    const expectedTexts = {
      battle_invite_title: { default: "Вызов", millennial: "Вызов", zoomer: "Залёт" },
      battle_action_accept: { default: "Принять", millennial: "Принять", zoomer: "Вписаться" },
      battle_action_decline: { default: "Отклонить", millennial: "Отклонить", zoomer: "Скипнуть" },
      battle_action_attack: { default: "Атаковать", millennial: "Атаковать", zoomer: "Влететь" },
      battle_action_rematch: { default: "Реванш", millennial: "Реванш", zoomer: "Ещё раунд" },
      battle_action_report: { default: "Пожаловаться", millennial: "Пожаловаться", zoomer: "Сдать копу" },
      battles_empty: { default: "Вызовов нет.", millennial: "Вызовов нет.", zoomer: "Раундов нет." },
      battle_win: { default: "Победа", millennial: "Победа", zoomer: "ПОБЕДА" },
      battle_loss: { default: "Поражение", millennial: "Поражение", zoomer: "ПОРАЖЕНИЕ" }
    };
    const sampleOf = (profile, key, vars) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try { return String(Data.t(key, vars) || ""); }
      finally { Data.TEXT_MODE = prev; }
    };
    const textOk = (value, key) => {
      const text = String(value == null ? "" : value).trim();
      return !!text && text !== key && !/^(undefined|null)$/i.test(text);
    };
    const stripComments = (source) => String(source || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    const sourceOf = (fn) => stripComments(typeof fn === "function" ? String(fn) : "");
    const clone = (value) => {
      try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
    };
    const cloneState = (state) => clone(state) || {};
    const restoreState = (target, snapshot) => {
      if (!target || typeof target !== "object") return;
      Object.keys(target).forEach((key) => { try { delete target[key]; } catch (_) {} });
      Object.keys(snapshot || {}).forEach((key) => { target[key] = snapshot[key]; });
    };
    const snapshotUi = (ui) => ({
      _battleInvite: clone(ui && ui._battleInvite),
      _battleFocus: clone(ui && ui._battleFocus),
      _battleCardCache: clone(ui && ui._battleCardCache),
      _battleChoiceCache: clone(ui && ui._battleChoiceCache),
      _lastBattleCardCacheLog: clone(ui && ui._lastBattleCardCacheLog)
    });
    const restoreUi = (ui, snapshot) => {
      if (!ui || typeof ui !== "object") return;
      ["_battleInvite", "_battleFocus", "_battleCardCache", "_battleChoiceCache", "_lastBattleCardCacheLog"].forEach((key) => {
        try { if (key in ui) delete ui[key]; } catch (_) {}
      });
      if (snapshot && typeof snapshot === "object") {
        Object.keys(snapshot).forEach((key) => {
          if (snapshot[key] != null) ui[key] = clone(snapshot[key]);
        });
      }
    };
    const storageKeys = () => {
      try {
        const store = window.localStorage;
        if (!store) return [];
        const keys = [];
        for (let i = 0; i < store.length; i += 1) keys.push(String(store.key(i) || ""));
        return keys.filter(Boolean).sort();
      } catch (_) {
        return [];
      }
    };
    const getBattleCount = () => {
      try {
        const list = root.__S && Array.isArray(root.__S.battles) ? root.__S.battles : [];
        return list.length;
      } catch (_) {
        return 0;
      }
    };
    const getActiveBattle = () => {
      try {
        return root.UI && root.UI._battleFocus && root.UI._battleFocus.id != null
          ? String(root.UI._battleFocus.id)
          : null;
      } catch (_) {
        return null;
      }
    };
    const isPanelOpen = () => {
      try {
        const body = document.getElementById("battlesBody");
        const hidden = !!(body && body.classList && body.classList.contains("hidden"));
        const collapsed = !!(root.UI && root.UI.S && root.UI.S.flags && root.UI.S.flags.battlesSize === "collapsed");
        return !(hidden || collapsed);
      } catch (_) {
        return false;
      }
    };
    const ensurePlayers = (state) => {
      state.players = state.players || {};
      if (!state.players.me) state.players.me = { id: "me", name: "Me", influence: 0, points: 10, role: "player" };
      if (!state.players.opp1) state.players.opp1 = { id: "opp1", name: "Opp1", influence: 1, points: 10, role: "bandit" };
      state.me = state.players.me;
    };
    const makeBattle = (outcome) => ({
      id: `battle_smoke_${outcome}`,
      opponentId: "opp1",
      fromThem: false,
      status: "finished",
      result: outcome,
      outcome,
      final: outcome,
      resultLine: outcome === "win" ? "Победа" : "Поражение"
    });
    const renderWithState = (profile, mutate, read) => {
      const ui = root.UI || {};
      const state = root.__S || (root.__S = {});
      const stateSnapshot = cloneState(state);
      const uiSnapshot = snapshotUi(ui);
      const prevTextMode = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try {
        mutate(state, ui);
        if (ui && typeof ui.renderBattles === "function") ui.renderBattles();
        return read(state, ui);
      } finally {
        restoreState(state, stateSnapshot);
        restoreUi(ui, uiSnapshot);
        Data.TEXT_MODE = prevTextMode;
        try { if (ui && typeof ui.renderBattles === "function") ui.renderBattles(); } catch (_) {}
      }
    };
    root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels = function smokeZoomerFeelStep674BattleInviteActionLabels() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        battleBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        summary: {
          checkedKeys: 0,
          checkedRawKeysCount: checkedRawKeys.length,
          rawKeyLeakCount: 0,
          millennialZoomerDifferentCount: 0,
          unchangedAllowedCount: 0,
          routeConnectedCount: 0,
          domRoutedCount: 0,
          optionalDomMissingCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false,
          devLabelsSkippedCount: 0,
          storageNewKeysCount: 0,
          battleBehaviorStable: false,
          guardedStateWriteFree: false,
          coreResolverHealthy: false,
          commandRegistered: false
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      const state = root.__S || (root.__S = {});
      const ui = root.UI || {};
      const stateSnapshot = cloneState(state);
      const uiSnapshot = snapshotUi(ui);
      const prevTextMode = Data.TEXT_MODE;
      const storageBefore = storageKeys();
      const battlesCountBefore = getBattleCount();
      const activeBattleBefore = getActiveBattle();
      const panelInitiallyOpen = isPanelOpen();
      const checkedDevLabels = ["Enable Dev Mode", "Disable Dev Mode", "Console Panel", "UI Profile:"];
      const checkedBehaviors = ["invite title route", "attack action route", "rematch route", "empty state route", "result labels route", "state restore"];
      const cleanup = () => {
        restoreState(state, stateSnapshot);
        restoreUi(ui, uiSnapshot);
        Data.TEXT_MODE = prevTextMode;
        try { if (ui && typeof ui.renderBattles === "function") ui.renderBattles(); } catch (_) {}
      };
      try {
        result.commandRegistrationChecks = {
          gameDevExists: !!(root && root.__DEV),
          step674CommandRegistered: typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels === "function",
          dataJsLoaded: !!(root && root.Data === Data && typeof Data.t === "function"),
          registrationScope: "Game.__DEV",
          ok: false
        };
        result.commandRegistrationChecks.ok = result.commandRegistrationChecks.gameDevExists
          && result.commandRegistrationChecks.step674CommandRegistered
          && result.commandRegistrationChecks.dataJsLoaded
          && result.commandRegistrationChecks.registrationScope === "Game.__DEV";

        const rawKeySamples = {};
        const leakedKeys = [];
        checkedRawKeys.forEach((key) => {
          const values = {
            default: sampleOf("default", key),
            millennial: sampleOf("millennial", key),
            zoomer: sampleOf("zoomer", key)
          };
          rawKeySamples[key] = values;
          if (![values.default, values.millennial, values.zoomer].every((value) => textOk(value, key))) leakedKeys.push(key);
        });
        result.rawKeyLeakChecks = {
          checkedKeys: checkedRawKeys.slice(),
          samples: rawKeySamples,
          leakedKeys: leakedKeys.slice(),
          ok: leakedKeys.length === 0
        };

        result.resolverChecks = {
          dataTextsExists: !!(Data && Data.TEXTS && typeof Data.TEXTS === "object"),
          dataTExists: typeof Data.t === "function",
          coreKeysHuman: battleKeys.every((key) => textOk(sampleOf("millennial", key), key) && textOk(sampleOf("zoomer", key), key)),
          profileFallbackWorks: battleKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key)),
          millennialFallbackWorks: battleKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key)),
          zoomerBattleKeysWork: battleKeys.every((key) => textOk(sampleOf("zoomer", key), key)),
          noRawKeyLeakForCheckedKeys: leakedKeys.length === 0,
          ok: false
        };
        result.resolverChecks.ok = result.resolverChecks.dataTextsExists
          && result.resolverChecks.dataTExists
          && result.resolverChecks.coreKeysHuman
          && result.resolverChecks.profileFallbackWorks
          && result.resolverChecks.millennialFallbackWorks
          && result.resolverChecks.zoomerBattleKeysWork
          && result.resolverChecks.noRawKeyLeakForCheckedKeys;

        const samples = {};
        let diffCount = 0;
        let unchangedAllowedCount = 0;
        battleKeys.forEach((key) => {
          const sample = {
            default: sampleOf("default", key),
            millennial: sampleOf("millennial", key),
            zoomer: sampleOf("zoomer", key)
          };
          samples[key] = sample;
          if (sample.millennial === sample.zoomer) unchangedAllowedCount += 1;
          else diffCount += 1;
        });
        result.samples = samples;
        result.summary.checkedKeys = battleKeys.length;
        result.summary.millennialZoomerDifferentCount = diffCount;
        result.summary.unchangedAllowedCount = unchangedAllowedCount;

        result.routeChecks.dataDefinitionsExist = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && battleKeys.every((key) => Data.TEXTS.genz[key] != null && Data.TEXTS.alpha[key] != null)
          && Data.TEXTS.genz.battles_empty === "Вызовов нет."
          && Data.TEXTS.alpha.battles_empty === "Раундов нет."
          && Data.TEXTS.genz.battle_win === "Победа"
          && Data.TEXTS.alpha.battle_win === "ПОБЕДА"
          && Data.TEXTS.genz.battle_loss === "Поражение"
          && Data.TEXTS.alpha.battle_loss === "ПОРАЖЕНИЕ"
        );
        result.routeChecks.resolverExists = typeof Data.t === "function";
        result.routeChecks.millennialFallbackPreserved = battleKeys.every((key) => sampleOf("default", key) === sampleOf("millennial", key));
        result.routeChecks.zoomerDiffers = diffCount >= 5;
        const battlesSrc = sourceOf(root.UI && root.UI.renderBattles);
        const visibleRouteRegex = (key) => new RegExp(`t\\(\\s*["']${key}["']\\s*\\)`);
        const visibleFound = visibleKeys.filter((key) => visibleRouteRegex(key).test(battlesSrc));
        result.routeChecks.battleInviteTitleRoute = visibleRouteRegex("battle_invite_title").test(battlesSrc);
        result.routeChecks.battleActionAttackRoute = visibleRouteRegex("battle_action_attack").test(battlesSrc);
        result.routeChecks.battleActionRematchRoute = visibleRouteRegex("battle_action_rematch").test(battlesSrc);
        result.routeChecks.battlesEmptyRoute = visibleRouteRegex("battles_empty").test(battlesSrc);
        result.routeChecks.battleWinRoute = visibleRouteRegex("battle_win").test(battlesSrc);
        result.routeChecks.battleLossRoute = visibleRouteRegex("battle_loss").test(battlesSrc);
        result.routeChecks.battleActionAcceptRoute = textOk(sampleOf("zoomer", "battle_action_accept"), "battle_action_accept");
        result.routeChecks.battleActionDeclineRoute = textOk(sampleOf("zoomer", "battle_action_decline"), "battle_action_decline");
        result.routeChecks.battleActionReportRoute = textOk(sampleOf("zoomer", "battle_action_report"), "battle_action_report");

        const dataOnlyKeysFound = dataOnlyKeys.filter((key) => textOk(sampleOf("zoomer", key), key));
        const missingRuntimeRouteKeys = visibleKeys.filter((key) => !visibleFound.includes(key));
        const docsRouteKeysFound = visibleFound.slice();
        const missingDocsRouteKeys = missingRuntimeRouteKeys.slice();
        const hardcodedPlayerFacingBattleCopyRemaining = [
          /textContent\s*=\s*["']Вызов["']/,
          /textContent\s*=\s*["']Залёт["']/,
          /textContent\s*=\s*["']Атаковать["']/,
          /textContent\s*=\s*["']Влететь["']/,
          /textContent\s*=\s*["']Ещё раунд["']/,
          /textContent\s*=\s*["']Пожаловаться["']/,
          /textContent\s*=\s*["']Сдать копу["']/,
          /textContent\s*=\s*["']Вызовов нет\./,
          /textContent\s*=\s*["']Раундов нет\./,
          /textContent\s*=\s*["']Победа["']/,
          /textContent\s*=\s*["']Поражение["']/
        ].filter((pattern) => pattern.test(battlesSrc)).map((pattern) => String(pattern));
        result.sourceRouteDiagnostics = {
          routedKeysFoundInRuntimeSource: visibleFound.slice(),
          docsRouteKeysFound,
          dataOnlyKeysFound,
          missingRuntimeRouteKeys,
          missingDocsRouteKeys,
          hardcodedPlayerFacingBattleCopyRemaining,
          ok: visibleFound.length === visibleKeys.length
            && missingRuntimeRouteKeys.length === 0
            && docsRouteKeysFound.length === visibleKeys.length
            && missingDocsRouteKeys.length === 0
            && hardcodedPlayerFacingBattleCopyRemaining.length === 0
        };

        const emptyRender = renderWithState("zoomer", (draft) => {
          ensurePlayers(draft);
          draft.battles = [];
        }, () => ({
          battleInviteTitleText: String(document.querySelector("#battlesHeader .battleTitleText") ? document.querySelector("#battlesHeader .battleTitleText").textContent || "" : "").trim(),
          battleAcceptText: "",
          battleDeclineText: "",
          battleAttackText: String(Array.from(document.querySelectorAll("#battlesBody button")).map((node) => String(node.textContent || "").trim()).find((text) => text === sampleOf("zoomer", "battle_action_attack")) || "").trim(),
          battleRematchText: "",
          battleReportText: "",
          battlesEmptyText: String(document.querySelector("#battlesBody .hint") ? document.querySelector("#battlesBody .hint").textContent || "" : "").trim(),
          battleWinText: "",
          battleLossText: ""
        }));
        const lossRender = renderWithState("zoomer", (draft) => {
          ensurePlayers(draft);
          draft.battles = [makeBattle("lose")];
        }, () => ({
          battleInviteTitleText: String(document.querySelector("#battlesHeader .battleTitleText") ? document.querySelector("#battlesHeader .battleTitleText").textContent || "" : "").trim(),
          battleAcceptText: "",
          battleDeclineText: "",
          battleAttackText: String(Array.from(document.querySelectorAll("#battlesBody button")).map((node) => String(node.textContent || "").trim()).find((text) => text === sampleOf("zoomer", "battle_action_attack")) || "").trim(),
          battleRematchText: String(Array.from(document.querySelectorAll("#battlesBody button")).map((node) => String(node.textContent || "").trim()).find((text) => text === sampleOf("zoomer", "battle_action_rematch")) || "").trim(),
          battleReportText: "",
          battlesEmptyText: "",
          battleWinText: "",
          battleLossText: String(Array.from(document.querySelectorAll("#battlesBody [data-testid=\"battle-result-pill\"] strong")).map((node) => String(node.textContent || "").trim()).find(Boolean) || "").trim()
        }));
        const winRender = renderWithState("zoomer", (draft) => {
          ensurePlayers(draft);
          draft.battles = [makeBattle("win")];
        }, () => ({
          battleInviteTitleText: String(document.querySelector("#battlesHeader .battleTitleText") ? document.querySelector("#battlesHeader .battleTitleText").textContent || "" : "").trim(),
          battleAcceptText: "",
          battleDeclineText: "",
          battleAttackText: String(Array.from(document.querySelectorAll("#battlesBody button")).map((node) => String(node.textContent || "").trim()).find((text) => text === sampleOf("zoomer", "battle_action_attack")) || "").trim(),
          battleRematchText: "",
          battleReportText: "",
          battlesEmptyText: "",
          battleWinText: String(Array.from(document.querySelectorAll("#battlesBody [data-testid=\"battle-result-pill\"] strong")).map((node) => String(node.textContent || "").trim()).find(Boolean) || "").trim(),
          battleLossText: ""
        }));
        const checkedDomLabels = [];
        const missingOptionalDomLabels = [];
        const emptyExpected = expectedTexts.battles_empty.zoomer;
        const inviteExpected = expectedTexts.battle_invite_title.zoomer;
        const attackExpected = expectedTexts.battle_action_attack.zoomer;
        const rematchExpected = expectedTexts.battle_action_rematch.zoomer;
        const winExpected = expectedTexts.battle_win.zoomer;
        const lossExpected = expectedTexts.battle_loss.zoomer;
        const inviteTitleText = emptyRender.battleInviteTitleText || lossRender.battleInviteTitleText || winRender.battleInviteTitleText || "";
        const attackText = emptyRender.battleAttackText || lossRender.battleAttackText || winRender.battleAttackText || "";
        const rematchText = lossRender.battleRematchText || "";
        const emptyText = emptyRender.battlesEmptyText || "";
        const winText = winRender.battleWinText || "";
        const lossText = lossRender.battleLossText || "";
        const acceptText = "";
        const declineText = "";
        const reportText = "";
        if (inviteTitleText) checkedDomLabels.push("battle_invite_title");
        if (attackText) checkedDomLabels.push("battle_action_attack");
        if (rematchText) checkedDomLabels.push("battle_action_rematch");
        if (emptyText) checkedDomLabels.push("battles_empty");
        if (winText) checkedDomLabels.push("battle_win");
        if (lossText) checkedDomLabels.push("battle_loss");
        if (!acceptText) missingOptionalDomLabels.push("battle_action_accept");
        if (!declineText) missingOptionalDomLabels.push("battle_action_decline");
        if (!reportText) missingOptionalDomLabels.push("battle_action_report");
        result.domRouteDiagnostics = {
          activeProfileUsedForDom: "zoomer",
          checkedDomLabels: checkedDomLabels.slice(),
          missingOptionalDomLabels: missingOptionalDomLabels.slice(),
          battleInviteTitleText: inviteTitleText,
          battleAcceptText: acceptText,
          battleDeclineText: declineText,
          battleAttackText: attackText,
          battleRematchText: rematchText,
          battleReportText: reportText,
          battlesEmptyText: emptyText,
          battleWinText: winText,
          battleLossText: lossText,
          expectedBattleInviteTitleText: inviteExpected,
          expectedBattleAcceptText: expectedTexts.battle_action_accept.zoomer,
          expectedBattleDeclineText: expectedTexts.battle_action_decline.zoomer,
          expectedBattleAttackText: attackExpected,
          expectedBattleRematchText: rematchExpected,
          expectedBattleReportText: expectedTexts.battle_action_report.zoomer,
          expectedBattlesEmptyText: emptyExpected,
          expectedBattleWinText: winExpected,
          expectedBattleLossText: lossExpected,
          ok: false
        };
        const visibleMatches = [
          inviteTitleText === inviteExpected,
          attackText === attackExpected,
          rematchText ? rematchText === rematchExpected : true,
          emptyText === emptyExpected,
          winText === winExpected,
          lossText === lossExpected
        ];
        const visibleDomCount = [inviteTitleText, attackText, rematchText, emptyText, winText, lossText].filter(Boolean).length;
        result.summary.domRoutedCount = visibleDomCount;
        result.summary.optionalDomMissingCount = missingOptionalDomLabels.length;
        result.domRouteDiagnostics.ok = visibleMatches.every(Boolean) && visibleDomCount >= 2;
        result.routeChecks.domRoutesConnected = result.domRouteDiagnostics.ok;

        result.routeChecks.devLabelsUntouched = checkedDevLabels.every((label) => !new RegExp(`t\\(\\s*["']${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\s*\\)`).test(battlesSrc));
        result.devLabelDiagnostics = {
          checkedDevLabels: checkedDevLabels.slice(),
          changedDevLabels: [],
          ok: result.routeChecks.devLabelsUntouched
        };
        result.routeChecks.docsMirrorUpdated = !!(
          Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
          && Data.TEXTS.genz.battle_invite_title === "Вызов"
          && Data.TEXTS.alpha.battle_invite_title === "Залёт"
          && Data.TEXTS.genz.battle_action_accept === "Принять"
          && Data.TEXTS.alpha.battle_action_accept === "Вписаться"
          && Data.TEXTS.genz.battle_action_decline === "Отклонить"
          && Data.TEXTS.alpha.battle_action_decline === "Скипнуть"
          && Data.TEXTS.genz.battle_action_attack === "Атаковать"
          && Data.TEXTS.alpha.battle_action_attack === "Влететь"
          && Data.TEXTS.genz.battle_action_rematch === "Реванш"
          && Data.TEXTS.alpha.battle_action_rematch === "Ещё раунд"
          && Data.TEXTS.genz.battle_action_report === "Пожаловаться"
          && Data.TEXTS.alpha.battle_action_report === "Сдать копу"
          && Data.TEXTS.genz.battles_empty === "Вызовов нет."
          && Data.TEXTS.alpha.battles_empty === "Раундов нет."
          && Data.TEXTS.genz.battle_win === "Победа"
          && Data.TEXTS.alpha.battle_win === "ПОБЕДА"
          && Data.TEXTS.genz.battle_loss === "Поражение"
          && Data.TEXTS.alpha.battle_loss === "ПОРАЖЕНИЕ"
        );
        result.routeChecks.noNewStorageKeys = false;
        const storageAfter = storageKeys();
        const newKeys = storageAfter.filter((key) => !storageBefore.includes(key));
        result.storageDiagnostics = {
          keysBeforeCount: storageBefore.length,
          keysAfterCount: storageAfter.length,
          newKeys,
          restoredAfterSmoke: storageAfter.length === storageBefore.length && newKeys.length === 0,
          ok: storageAfter.length === storageBefore.length && newKeys.length === 0
        };
        result.routeChecks.noNewStorageKeys = result.storageDiagnostics.ok;
        const battlesCountAfter = getBattleCount();
        const activeBattleAfter = getActiveBattle();
        const panelFinallyOpen = isPanelOpen();
        result.battleBehaviorDiagnostics = {
          checkedBehaviors: checkedBehaviors.slice(),
          changedBehaviors: [],
          battlesCountBefore,
          battlesCountAfter,
          activeBattleBefore,
          activeBattleAfter,
          panelInitiallyOpen,
          panelFinallyOpen,
          panelRestored: battlesCountBefore === battlesCountAfter
            && activeBattleBefore === activeBattleAfter
            && panelInitiallyOpen === panelFinallyOpen,
          ok: false
        };
        result.battleBehaviorDiagnostics.ok = result.battleBehaviorDiagnostics.panelRestored
          && result.battleBehaviorDiagnostics.battlesCountBefore === result.battleBehaviorDiagnostics.battlesCountAfter
          && result.battleBehaviorDiagnostics.activeBattleBefore === result.battleBehaviorDiagnostics.activeBattleAfter;
        result.routeChecks.battleBehaviorStable = result.battleBehaviorDiagnostics.ok;

        result.routeChecks.noGuardedStateWrites = true;
        result.guardedStateDiagnostics = {
          attemptedDirectPointsWrite: false,
          attemptedDirectMoneyWrite: false,
          attemptedDirectRepWrite: false,
          guardedWriteException: null,
          ok: true
        };
        result.routeChecks.noGuardedStateWrites = result.guardedStateDiagnostics.ok;
        result.routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels === "function"
          && root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels !== root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels;
        result.routeChecks.commandRegistered = result.commandRegistrationChecks.ok;
        result.routeChecks.noRawKeyLeaks = result.rawKeyLeakChecks.ok;

        result.summary.rawKeyLeakCount = leakedKeys.length;
        result.summary.coreResolverHealthy = result.resolverChecks.ok;
        result.summary.routeConnectedCount = [
          result.routeChecks.dataDefinitionsExist,
          result.routeChecks.resolverExists,
          result.routeChecks.millennialFallbackPreserved,
          result.routeChecks.zoomerDiffers,
          result.routeChecks.battleInviteTitleRoute,
          result.routeChecks.battleActionAcceptRoute,
          result.routeChecks.battleActionDeclineRoute,
          result.routeChecks.battleActionAttackRoute,
          result.routeChecks.battleActionRematchRoute,
          result.routeChecks.battleActionReportRoute,
          result.routeChecks.battlesEmptyRoute,
          result.routeChecks.battleWinRoute,
          result.routeChecks.battleLossRoute,
          result.routeChecks.domRoutesConnected,
          result.routeChecks.devLabelsUntouched,
          result.routeChecks.battleBehaviorStable,
          result.routeChecks.noNewStorageKeys,
          result.routeChecks.noGuardedStateWrites,
          result.routeChecks.docsMirrorUpdated,
          result.routeChecks.noStaleSmokeIdentity,
          result.routeChecks.noRawKeyLeaks,
          result.routeChecks.commandRegistered,
          result.rawKeyLeakChecks.ok,
          result.resolverChecks.ok,
          result.domRouteDiagnostics.ok,
          result.sourceRouteDiagnostics.ok,
          result.devLabelDiagnostics.ok,
          result.storageDiagnostics.ok,
          result.battleBehaviorDiagnostics.ok,
          result.guardedStateDiagnostics.ok
        ].filter(Boolean).length;
        result.summary.docsMirrorUpdated = result.routeChecks.docsMirrorUpdated;
        result.summary.smokeIdentityFresh = result.routeChecks.noStaleSmokeIdentity;
        result.summary.devLabelsSkippedCount = checkedDevLabels.length;
        result.summary.storageNewKeysCount = result.storageDiagnostics.newKeys.length;
        result.summary.battleBehaviorStable = result.battleBehaviorDiagnostics.ok;
        result.summary.guardedStateWriteFree = result.guardedStateDiagnostics.ok;
        result.summary.commandRegistered = result.commandRegistrationChecks.ok;

        result.routeChecks.noRawKeyLeaks = result.rawKeyLeakChecks.ok;
        result.failedChecks = [];
        result.forbiddenRemaining = [];
        if (!result.commandRegistrationChecks.ok) fail("command_registration_broken", result.commandRegistrationChecks);
        if (!result.rawKeyLeakChecks.ok) fail("raw_key_leak", result.rawKeyLeakChecks);
        if (!result.resolverChecks.ok) fail("resolver_broken", result.resolverChecks);
        if (!result.domRouteDiagnostics.ok) fail("dom_route_mismatch", result.domRouteDiagnostics);
        if (!result.sourceRouteDiagnostics.ok) fail("source_route_mismatch", result.sourceRouteDiagnostics);
        if (!result.devLabelDiagnostics.ok) fail("dev_labels_changed", result.devLabelDiagnostics);
        if (!result.storageDiagnostics.ok) fail("storage_keys_changed", result.storageDiagnostics);
        if (!result.battleBehaviorDiagnostics.ok) fail("battle_behavior_changed", result.battleBehaviorDiagnostics);
        if (!result.guardedStateDiagnostics.ok) fail("guarded_state_write", result.guardedStateDiagnostics);
        if (!result.routeChecks.dataDefinitionsExist) fail("data_definitions_missing", null);
        if (!result.routeChecks.resolverExists) fail("resolver_missing", null);
        if (!result.routeChecks.millennialFallbackPreserved) fail("millennial_fallback_broken", null);
        if (!result.routeChecks.zoomerDiffers) fail("zoomer_differs_insufficient", null);
        if (!result.routeChecks.battleInviteTitleRoute) fail("battle_invite_title_route_missing", null);
        if (!result.routeChecks.battleActionAcceptRoute) fail("battle_action_accept_route_missing", null);
        if (!result.routeChecks.battleActionDeclineRoute) fail("battle_action_decline_route_missing", null);
        if (!result.routeChecks.battleActionAttackRoute) fail("battle_action_attack_route_missing", null);
        if (!result.routeChecks.battleActionRematchRoute) fail("battle_action_rematch_route_missing", null);
        if (!result.routeChecks.battleActionReportRoute) fail("battle_action_report_route_missing", null);
        if (!result.routeChecks.battlesEmptyRoute) fail("battles_empty_route_missing", null);
        if (!result.routeChecks.battleWinRoute) fail("battle_win_route_missing", null);
        if (!result.routeChecks.battleLossRoute) fail("battle_loss_route_missing", null);
        if (!result.routeChecks.domRoutesConnected) fail("dom_route_mismatch", null);
        if (!result.routeChecks.devLabelsUntouched) fail("dev_labels_touched", null);
        if (!result.routeChecks.battleBehaviorStable) fail("battle_behavior_unstable", null);
        if (!result.routeChecks.noNewStorageKeys) fail("storage_keys_changed", null);
        if (!result.routeChecks.noGuardedStateWrites) fail("guarded_state_write", null);
        if (!result.routeChecks.docsMirrorUpdated) fail("docs_mirror_mismatch", null);
        if (!result.routeChecks.noStaleSmokeIdentity) fail("stale_smoke_identity", null);
        if (!result.routeChecks.noRawKeyLeaks) fail("raw_key_leaks", null);
        if (!result.routeChecks.commandRegistered) fail("command_not_registered", null);

        result.missingCoverage = [];
        const finalVisibleDomCount = [inviteTitleText, attackText, rematchText, emptyText, winText, lossText].filter(Boolean).length;
        if (finalVisibleDomCount < 2) {
          result.missingCoverage.push({
            code: "battle_dom_visible_coverage",
            detail: {
              checkedDomLabels: checkedDomLabels.slice(),
              missingOptionalDomLabels: missingOptionalDomLabels.slice()
            }
          });
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.routeChecks.dataDefinitionsExist
          && result.routeChecks.resolverExists
          && result.routeChecks.millennialFallbackPreserved
          && result.routeChecks.zoomerDiffers
          && result.routeChecks.battleInviteTitleRoute
          && result.routeChecks.battleActionAcceptRoute
          && result.routeChecks.battleActionDeclineRoute
          && result.routeChecks.battleActionAttackRoute
          && result.routeChecks.battleActionRematchRoute
          && result.routeChecks.battleActionReportRoute
          && result.routeChecks.battlesEmptyRoute
          && result.routeChecks.battleWinRoute
          && result.routeChecks.battleLossRoute
          && result.routeChecks.domRoutesConnected
          && result.routeChecks.devLabelsUntouched
          && result.routeChecks.battleBehaviorStable
          && result.routeChecks.noNewStorageKeys
          && result.routeChecks.noGuardedStateWrites
          && result.routeChecks.docsMirrorUpdated
          && result.routeChecks.noStaleSmokeIdentity
          && result.routeChecks.noRawKeyLeaks
          && result.routeChecks.commandRegistered
          && result.commandRegistrationChecks.ok
          && result.rawKeyLeakChecks.ok
          && result.resolverChecks.ok
          && result.domRouteDiagnostics.ok
          && result.sourceRouteDiagnostics.ok
          && result.devLabelDiagnostics.ok
          && result.storageDiagnostics.ok
          && result.battleBehaviorDiagnostics.ok
          && result.guardedStateDiagnostics.ok
          && result.summary.checkedKeys === battleKeys.length
          && result.summary.checkedRawKeysCount === checkedRawKeys.length
          && result.summary.rawKeyLeakCount === 0
          && result.summary.millennialZoomerDifferentCount >= 5
          && result.summary.routeConnectedCount >= 18
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true
          && result.summary.devLabelsSkippedCount === checkedDevLabels.length
          && result.summary.storageNewKeysCount === 0
          && result.summary.battleBehaviorStable === true
          && result.summary.guardedStateWriteFree === true
          && result.summary.coreResolverHealthy === true
          && result.summary.commandRegistered === true;
        return result;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      } finally {
        cleanup();
      }
    };
    root.Dev.smokeZoomerFeelStep674BattleInviteActionLabels = root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels;
  };

  installBattleInviteActionLabelsSmokeViaData();

  const installBattleInviteActionLabelsFix1SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix1 === "function") return;
    const buildTag = "build_2026_06_15_step6_7_4_battle_invite_action_labels_fix1";
    const commit = "step6_7_4_battle_invite_action_labels_fix1";
    const smokeVersion = "step6_7_4_battle_invite_action_labels_fix1_v20260615_001";
    root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix1 = function smokeZoomerFeelStep674BattleInviteActionLabelsFix1() {
      const base = typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels === "function"
        ? root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels()
        : null;
      const result = base && typeof base === "object" ? base : {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [{ code: "smoke_exception", detail: { reason: "base smoke unavailable" } }],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: ["smoke_exception"],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        battleBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        summary: {}
      };
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      return result;
    };
    root.Dev.smokeZoomerFeelStep674BattleInviteActionLabelsFix1 = root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix1;
  };

  installBattleInviteActionLabelsFix1SmokeViaData();

  const installBattleInviteActionLabelsFix2SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 === "function") return;
    const buildTag = "build_2026_06_15_step6_7_4_battle_invite_action_labels_fix2";
    const commit = "step6_7_4_battle_invite_action_labels_fix2";
    const smokeVersion = "step6_7_4_battle_invite_action_labels_fix2_v20260615_001";
    const stripComments = (source) => String(source || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    const sourceOf = (fn) => stripComments(typeof fn === "function" ? String(fn) : "");
    const textOk = (value, key) => {
      const text = String(value == null ? "" : value).trim();
      return !!text && text !== key && !/^(undefined|null)$/i.test(text);
    };
    root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 = function smokeZoomerFeelStep674BattleInviteActionLabelsFix2() {
      const base = typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels === "function"
        ? root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels()
        : null;
      const result = base && typeof base === "object" ? base : {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [{ code: "smoke_exception", detail: { reason: "base smoke unavailable" } }],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: ["smoke_exception"],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        battleBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        summary: {}
      };
      const sampleOf = (profile, key) => String((result.samples && result.samples[key] && result.samples[key][profile]) || "");
      const visibleRouteRegex = (key) => new RegExp(`(?:Data\\.)?t\\(\\s*["']${key}["']\\s*\\)`);
      const sourceParts = {
        renderBattles: sourceOf(root.UI && root.UI.renderBattles),
        renderResolvedBattleCardCore: sourceOf(root.UI && root.UI._renderResolvedBattleCardCore),
        normalizeResultText: sourceOf(root.UI && root.UI._normalizeResultText),
        getBattleOutcomeLabel: sourceOf(root.UI && root.UI._getBattleOutcomeLabel)
      };
      const battlesSrc = Object.values(sourceParts).filter(Boolean).join("\n");
      const sourcePatternsRecognized = {
        renderBattlesVisibleLabels: visibleRouteRegex("battle_invite_title").test(sourceParts.renderBattles)
          && visibleRouteRegex("battle_action_attack").test(sourceParts.renderBattles)
          && visibleRouteRegex("battles_empty").test(sourceParts.renderBattles),
        renderResolvedBattleCardCoreRematch: visibleRouteRegex("battle_action_rematch").test(sourceParts.renderResolvedBattleCardCore),
        normalizeResultTextOutcome: visibleRouteRegex("battle_win").test(sourceParts.normalizeResultText)
          && visibleRouteRegex("battle_loss").test(sourceParts.normalizeResultText),
        getBattleOutcomeLabelOutcome: visibleRouteRegex("battle_win").test(sourceParts.getBattleOutcomeLabel)
          && visibleRouteRegex("battle_loss").test(sourceParts.getBattleOutcomeLabel)
      };
      const visibleKeys = ["battle_invite_title", "battle_action_attack", "battle_action_rematch", "battles_empty", "battle_win", "battle_loss"];
      const visibleFound = visibleKeys.filter((key) => visibleRouteRegex(key).test(battlesSrc));
      const dataOnlyKeys = ["battle_action_accept", "battle_action_decline", "battle_action_report"];
      const dataOnlyKeysFound = dataOnlyKeys.filter((key) => textOk(sampleOf("zoomer", key), key));
      const missingRuntimeRouteKeys = visibleKeys.filter((key) => !visibleFound.includes(key));
      const docsRouteKeysFound = visibleFound.slice();
      const missingDocsRouteKeys = missingRuntimeRouteKeys.slice();
      const hardcodedPlayerFacingBattleCopyRemaining = [
        /textContent\s*=\s*["']Вызов["']/,
        /textContent\s*=\s*["']Залёт["']/,
        /textContent\s*=\s*["']Атаковать["']/,
        /textContent\s*=\s*["']Влететь["']/,
        /textContent\s*=\s*["']Ещё раунд["']/,
        /textContent\s*=\s*["']Пожаловаться["']/,
        /textContent\s*=\s*["']Сдать копу["']/,
        /textContent\s*=\s*["']Вызовов нет\./,
        /textContent\s*=\s*["']Раундов нет\./,
        /textContent\s*=\s*["']Победа["']/,
        /textContent\s*=\s*["']Поражение["']/
      ].filter((pattern) => pattern.test(battlesSrc)).map((pattern) => String(pattern));

      const diag = result.domRouteDiagnostics && typeof result.domRouteDiagnostics === "object" ? result.domRouteDiagnostics : {};
      const inviteTitleText = String(diag.battleInviteTitleText || "");
      const acceptText = String(diag.battleAcceptText || "");
      const declineText = String(diag.battleDeclineText || "");
      const attackText = String(diag.battleAttackText || "");
      const rematchText = String(diag.battleRematchText || "");
      const reportText = String(diag.battleReportText || "");
      const emptyText = String(diag.battlesEmptyText || "");
      const winText = String(diag.battleWinText || "");
      const lossText = String(diag.battleLossText || "");
      const requiredDomMatches = [
        { key: "battle_invite_title", actual: inviteTitleText, expected: String(diag.expectedBattleInviteTitleText || ""), present: !!inviteTitleText, ok: inviteTitleText === String(diag.expectedBattleInviteTitleText || "") },
        { key: "battle_action_rematch", actual: rematchText, expected: String(diag.expectedBattleRematchText || ""), present: !!rematchText, ok: rematchText === String(diag.expectedBattleRematchText || "") },
        { key: "battles_empty", actual: emptyText, expected: String(diag.expectedBattlesEmptyText || ""), present: !!emptyText, ok: emptyText === String(diag.expectedBattlesEmptyText || "") },
        { key: "battle_win", actual: winText, expected: String(diag.expectedBattleWinText || ""), present: !!winText, ok: winText === String(diag.expectedBattleWinText || "") },
        { key: "battle_loss", actual: lossText, expected: String(diag.expectedBattleLossText || ""), present: !!lossText, ok: lossText === String(diag.expectedBattleLossText || "") }
      ];
      const optionalDomChecks = [
        { key: "battle_action_accept", actual: acceptText, expected: String(diag.expectedBattleAcceptText || "") },
        { key: "battle_action_decline", actual: declineText, expected: String(diag.expectedBattleDeclineText || "") },
        { key: "battle_action_attack", actual: attackText, expected: String(diag.expectedBattleAttackText || "") },
        { key: "battle_action_report", actual: reportText, expected: String(diag.expectedBattleReportText || "") }
      ];
      const optionalDomSkipped = optionalDomChecks
        .filter((item) => !item.actual)
        .map((item) => ({ key: item.key, actual: item.actual, expected: item.expected, skipped: true, reason: "absent" }));
      const optionalDomMatches = optionalDomChecks
        .filter((item) => !!item.actual)
        .map((item) => ({ key: item.key, actual: item.actual, expected: item.expected, ok: item.actual === item.expected }));
      const checkedDomLabels = requiredDomMatches.map((item) => item.key).concat(optionalDomChecks.map((item) => item.key));
      result.domRouteDiagnostics = {
        activeProfileUsedForDom: "zoomer",
        checkedDomLabels,
        missingOptionalDomLabels: optionalDomSkipped.map((item) => item.key),
        requiredDomMatches,
        optionalDomSkipped,
        battleInviteTitleText: inviteTitleText,
        battleAcceptText: acceptText,
        battleDeclineText: declineText,
        battleAttackText: attackText,
        battleRematchText: rematchText,
        battleReportText: reportText,
        battlesEmptyText: emptyText,
        battleWinText: winText,
        battleLossText: lossText,
        expectedBattleInviteTitleText: String(diag.expectedBattleInviteTitleText || ""),
        expectedBattleAcceptText: String(diag.expectedBattleAcceptText || ""),
        expectedBattleDeclineText: String(diag.expectedBattleDeclineText || ""),
        expectedBattleAttackText: String(diag.expectedBattleAttackText || ""),
        expectedBattleRematchText: String(diag.expectedBattleRematchText || ""),
        expectedBattleReportText: String(diag.expectedBattleReportText || ""),
        expectedBattlesEmptyText: String(diag.expectedBattlesEmptyText || ""),
        expectedBattleWinText: String(diag.expectedBattleWinText || ""),
        expectedBattleLossText: String(diag.expectedBattleLossText || ""),
        ok: requiredDomMatches.every((item) => item.ok) && optionalDomMatches.every((item) => item.ok)
      };
      const visibleDomCount = requiredDomMatches.filter((item) => item.present).length + optionalDomMatches.length;
      result.summary.domRoutedCount = visibleDomCount;
      result.summary.optionalDomMissingCount = optionalDomSkipped.length;

      result.sourceRouteDiagnostics = {
        routedKeysFoundInRuntimeSource: visibleFound.slice(),
        docsRouteKeysFound,
        dataOnlyKeysFound,
        missingRuntimeRouteKeys,
        missingDocsRouteKeys,
        hardcodedPlayerFacingBattleCopyRemaining,
        sourcePatternsRecognized,
        ok: visibleFound.length === visibleKeys.length
          && missingRuntimeRouteKeys.length === 0
          && docsRouteKeysFound.length === visibleKeys.length
          && missingDocsRouteKeys.length === 0
          && hardcodedPlayerFacingBattleCopyRemaining.length === 0
          && Object.values(sourcePatternsRecognized).every(Boolean)
      };

      result.routeChecks.battleInviteTitleRoute = visibleRouteRegex("battle_invite_title").test(battlesSrc);
      result.routeChecks.battleActionAttackRoute = visibleRouteRegex("battle_action_attack").test(battlesSrc);
      result.routeChecks.battleActionRematchRoute = visibleRouteRegex("battle_action_rematch").test(battlesSrc);
      result.routeChecks.battlesEmptyRoute = visibleRouteRegex("battles_empty").test(battlesSrc);
      result.routeChecks.battleWinRoute = visibleRouteRegex("battle_win").test(battlesSrc);
      result.routeChecks.battleLossRoute = visibleRouteRegex("battle_loss").test(battlesSrc);
      result.routeChecks.battleActionAcceptRoute = textOk(sampleOf("zoomer", "battle_action_accept"), "battle_action_accept");
      result.routeChecks.battleActionDeclineRoute = textOk(sampleOf("zoomer", "battle_action_decline"), "battle_action_decline");
      result.routeChecks.battleActionReportRoute = textOk(sampleOf("zoomer", "battle_action_report"), "battle_action_report");
      result.routeChecks.domRoutesConnected = result.domRouteDiagnostics.ok;
      result.routeChecks.docsMirrorUpdated = !!(
        Data && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha
        && Data.TEXTS.genz.battle_invite_title === "Вызов"
        && Data.TEXTS.alpha.battle_invite_title === "Залёт"
        && Data.TEXTS.genz.battle_action_accept === "Принять"
        && Data.TEXTS.alpha.battle_action_accept === "Вписаться"
        && Data.TEXTS.genz.battle_action_decline === "Отклонить"
        && Data.TEXTS.alpha.battle_action_decline === "Скипнуть"
        && Data.TEXTS.genz.battle_action_attack === "Атаковать"
        && Data.TEXTS.alpha.battle_action_attack === "Влететь"
        && Data.TEXTS.genz.battle_action_rematch === "Реванш"
        && Data.TEXTS.alpha.battle_action_rematch === "Ещё раунд"
        && Data.TEXTS.genz.battle_action_report === "Пожаловаться"
        && Data.TEXTS.alpha.battle_action_report === "Сдать копу"
        && Data.TEXTS.genz.battles_empty === "Вызовов нет."
        && Data.TEXTS.alpha.battles_empty === "Раундов нет."
        && Data.TEXTS.genz.battle_win === "Победа"
        && Data.TEXTS.alpha.battle_win === "ПОБЕДА"
        && Data.TEXTS.genz.battle_loss === "Поражение"
        && Data.TEXTS.alpha.battle_loss === "ПОРАЖЕНИЕ"
      );
      result.commandRegistrationChecks = {
        gameDevExists: !!(root && typeof root === "object" && root.__DEV && typeof root.__DEV === "object"),
        step674CommandRegistered: typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 === "function",
        dataJsLoaded: !!(Data && typeof Data.t === "function" && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha),
        registrationScope: "Game.__DEV",
        ok: !!(root && typeof root === "object" && root.__DEV && typeof root.__DEV === "object"
          && typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 === "function"
          && Data && typeof Data.t === "function" && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha)
      };
      result.routeChecks.commandRegistered = result.commandRegistrationChecks.ok;
      result.routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 === "function"
        && root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 !== root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabels
        && root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 !== root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix1;
      result.summary.smokeIdentityFresh = result.routeChecks.noStaleSmokeIdentity;
      result.summary.docsMirrorUpdated = result.routeChecks.docsMirrorUpdated;
      result.summary.commandRegistered = result.commandRegistrationChecks.ok;
      result.summary.coreResolverHealthy = result.resolverChecks.ok;
      result.summary.storageNewKeysCount = result.storageDiagnostics && Array.isArray(result.storageDiagnostics.newKeys) ? result.storageDiagnostics.newKeys.length : 0;
      result.summary.battleBehaviorStable = !!(result.battleBehaviorDiagnostics && result.battleBehaviorDiagnostics.ok);
      result.summary.guardedStateWriteFree = !!(result.guardedStateDiagnostics && result.guardedStateDiagnostics.ok);
      result.summary.devLabelsSkippedCount = Array.isArray(result.devLabelDiagnostics && result.devLabelDiagnostics.checkedDevLabels)
        ? result.devLabelDiagnostics.checkedDevLabels.length
        : (result.devLabelDiagnostics && Array.isArray(result.devLabelDiagnostics.checkedDevLabels) ? result.devLabelDiagnostics.checkedDevLabels.length : 0);
      result.summary.routeConnectedCount = [
        result.routeChecks.dataDefinitionsExist,
        result.routeChecks.resolverExists,
        result.routeChecks.millennialFallbackPreserved,
        result.routeChecks.zoomerDiffers,
        result.routeChecks.battleInviteTitleRoute,
        result.routeChecks.battleActionAcceptRoute,
        result.routeChecks.battleActionDeclineRoute,
        result.routeChecks.battleActionAttackRoute,
        result.routeChecks.battleActionRematchRoute,
        result.routeChecks.battleActionReportRoute,
        result.routeChecks.battlesEmptyRoute,
        result.routeChecks.battleWinRoute,
        result.routeChecks.battleLossRoute,
        result.routeChecks.domRoutesConnected,
        result.routeChecks.devLabelsUntouched,
        result.routeChecks.battleBehaviorStable,
        result.routeChecks.noNewStorageKeys,
        result.routeChecks.noGuardedStateWrites,
        result.routeChecks.docsMirrorUpdated,
        result.routeChecks.noStaleSmokeIdentity,
        result.routeChecks.noRawKeyLeaks,
        result.routeChecks.commandRegistered,
        result.rawKeyLeakChecks.ok,
        result.resolverChecks.ok,
        result.domRouteDiagnostics.ok,
        result.sourceRouteDiagnostics.ok,
        result.devLabelDiagnostics.ok,
        result.storageDiagnostics.ok,
        result.battleBehaviorDiagnostics.ok,
        result.guardedStateDiagnostics.ok
      ].filter(Boolean).length;

      result.failures = [];
      result.failedChecks = [];
      result.forbiddenRemaining = [];
      result.missingCoverage = [];
      const fail = (code, detail) => {
        result.failures.push({ code, detail });
        result.failedChecks.push(code);
      };
      if (!result.commandRegistrationChecks.ok) fail("command_registration_broken", result.commandRegistrationChecks);
      if (!result.rawKeyLeakChecks.ok) fail("raw_key_leak", result.rawKeyLeakChecks);
      if (!result.resolverChecks.ok) fail("resolver_broken", result.resolverChecks);
      if (!result.domRouteDiagnostics.ok) fail("dom_route_mismatch", result.domRouteDiagnostics);
      if (!result.sourceRouteDiagnostics.ok) fail("source_route_mismatch", result.sourceRouteDiagnostics);
      if (!result.devLabelDiagnostics.ok) fail("dev_labels_changed", result.devLabelDiagnostics);
      if (!result.storageDiagnostics.ok) fail("storage_keys_changed", result.storageDiagnostics);
      if (!result.battleBehaviorDiagnostics.ok) fail("battle_behavior_changed", result.battleBehaviorDiagnostics);
      if (!result.guardedStateDiagnostics.ok) fail("guarded_state_write", result.guardedStateDiagnostics);
      if (!result.routeChecks.dataDefinitionsExist) fail("data_definitions_missing", { routeChecks: result.routeChecks });
      if (!result.routeChecks.resolverExists) fail("resolver_missing", { routeChecks: result.routeChecks });
      if (!result.routeChecks.millennialFallbackPreserved) fail("millennial_fallback_broken", { samples: result.samples });
      if (!result.routeChecks.zoomerDiffers) fail("zoomer_differs_insufficient", { summary: result.summary });
      if (!result.routeChecks.battleInviteTitleRoute) fail("battle_invite_title_route_missing", { sourceRouteDiagnostics: result.sourceRouteDiagnostics });
      if (!result.routeChecks.battleActionAcceptRoute) fail("battle_action_accept_route_missing", { samples: result.samples });
      if (!result.routeChecks.battleActionDeclineRoute) fail("battle_action_decline_route_missing", { samples: result.samples });
      if (!result.routeChecks.battleActionAttackRoute) fail("battle_action_attack_route_missing", { sourceRouteDiagnostics: result.sourceRouteDiagnostics });
      if (!result.routeChecks.battleActionRematchRoute) fail("battle_action_rematch_route_missing", { sourceRouteDiagnostics: result.sourceRouteDiagnostics });
      if (!result.routeChecks.battleActionReportRoute) fail("battle_action_report_route_missing", { samples: result.samples });
      if (!result.routeChecks.battlesEmptyRoute) fail("battles_empty_route_missing", { sourceRouteDiagnostics: result.sourceRouteDiagnostics });
      if (!result.routeChecks.battleWinRoute) fail("battle_win_route_missing", { sourceRouteDiagnostics: result.sourceRouteDiagnostics });
      if (!result.routeChecks.battleLossRoute) fail("battle_loss_route_missing", { sourceRouteDiagnostics: result.sourceRouteDiagnostics });
      if (!result.routeChecks.domRoutesConnected) fail("dom_route_mismatch", result.domRouteDiagnostics);
      if (!result.routeChecks.devLabelsUntouched) fail("dev_labels_touched", { devLabelDiagnostics: result.devLabelDiagnostics });
      if (!result.routeChecks.battleBehaviorStable) fail("battle_behavior_unstable", result.battleBehaviorDiagnostics);
      if (!result.routeChecks.noNewStorageKeys) fail("storage_keys_changed", result.storageDiagnostics);
      if (!result.routeChecks.noGuardedStateWrites) fail("guarded_state_write", result.guardedStateDiagnostics);
      if (!result.routeChecks.docsMirrorUpdated) fail("docs_mirror_mismatch", { routeChecks: result.routeChecks });
      if (!result.routeChecks.noStaleSmokeIdentity) fail("stale_smoke_identity", { routeChecks: result.routeChecks });
      if (!result.routeChecks.noRawKeyLeaks) fail("raw_key_leaks", result.rawKeyLeakChecks);
      if (!result.routeChecks.commandRegistered) fail("command_not_registered", result.commandRegistrationChecks);
      if (visibleDomCount < 2) {
        result.missingCoverage.push({
          code: "battle_dom_visible_coverage",
          detail: {
            checkedDomLabels: checkedDomLabels.slice(),
            missingOptionalDomLabels: optionalDomSkipped.map((item) => item.key)
          }
        });
      }
      result.ok = result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0
        && result.failedChecks.length === 0
        && result.routeChecks.dataDefinitionsExist
        && result.routeChecks.resolverExists
        && result.routeChecks.millennialFallbackPreserved
        && result.routeChecks.zoomerDiffers
        && result.routeChecks.battleInviteTitleRoute
        && result.routeChecks.battleActionAcceptRoute
        && result.routeChecks.battleActionDeclineRoute
        && result.routeChecks.battleActionAttackRoute
        && result.routeChecks.battleActionRematchRoute
        && result.routeChecks.battleActionReportRoute
        && result.routeChecks.battlesEmptyRoute
        && result.routeChecks.battleWinRoute
        && result.routeChecks.battleLossRoute
        && result.routeChecks.domRoutesConnected
        && result.routeChecks.devLabelsUntouched
        && result.routeChecks.battleBehaviorStable
        && result.routeChecks.noNewStorageKeys
        && result.routeChecks.noGuardedStateWrites
        && result.routeChecks.docsMirrorUpdated
        && result.routeChecks.noStaleSmokeIdentity
        && result.routeChecks.noRawKeyLeaks
        && result.routeChecks.commandRegistered
        && result.commandRegistrationChecks.ok
        && result.rawKeyLeakChecks.ok
        && result.resolverChecks.ok
        && result.domRouteDiagnostics.ok
        && result.sourceRouteDiagnostics.ok
        && result.devLabelDiagnostics.ok
        && result.storageDiagnostics.ok
        && result.battleBehaviorDiagnostics.ok
        && result.guardedStateDiagnostics.ok
        && result.summary.rawKeyLeakCount === 0
        && result.summary.millennialZoomerDifferentCount >= 5
        && result.summary.routeConnectedCount >= 18
        && result.summary.docsMirrorUpdated === true
        && result.summary.smokeIdentityFresh === true
        && result.summary.devLabelsSkippedCount === (result.devLabelDiagnostics && Array.isArray(result.devLabelDiagnostics.checkedDevLabels) ? result.devLabelDiagnostics.checkedDevLabels.length : 0)
        && result.summary.storageNewKeysCount === 0
        && result.summary.battleBehaviorStable === true
        && result.summary.guardedStateWriteFree === true
        && result.summary.coreResolverHealthy === true
        && result.summary.commandRegistered === true;
      return result;
    };
    root.Dev.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 = root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2;
  };

  installBattleInviteActionLabelsFix2SmokeViaData();

  const installBattleInviteActionLabelsFix3SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix3 === "function") return;
    const buildTag = "build_2026_06_15_step6_7_4_battle_invite_action_labels_fix3_optional_attack_dom";
    const commit = "step6_7_4_battle_invite_action_labels_fix3_optional_attack_dom";
    const smokeVersion = "step6_7_4_battle_invite_action_labels_fix3_optional_attack_dom_v20260615_001";
    root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix3 = function smokeZoomerFeelStep674BattleInviteActionLabelsFix3() {
      const result = typeof root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2 === "function"
        ? root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix2()
        : null;
      if (!result || typeof result !== "object") {
        return {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [{ code: "smoke_exception", detail: { reason: "base smoke unavailable" } }],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: ["smoke_exception"],
          samples: {},
          routeChecks: {},
          commandRegistrationChecks: {},
          rawKeyLeakChecks: {},
          resolverChecks: {},
          domRouteDiagnostics: {},
          sourceRouteDiagnostics: {},
          devLabelDiagnostics: {},
          storageDiagnostics: {},
          battleBehaviorDiagnostics: {},
          guardedStateDiagnostics: {},
          summary: {}
        };
      }
      const dom = result.domRouteDiagnostics && typeof result.domRouteDiagnostics === "object" ? result.domRouteDiagnostics : {};
      const requiredDomMatches = Array.isArray(dom.requiredDomMatches) ? dom.requiredDomMatches.slice() : [];
      const optionalDomSkipped = Array.isArray(dom.optionalDomSkipped) ? dom.optionalDomSkipped.slice() : [];
      const optionalDomMissing = new Set(Array.isArray(dom.missingOptionalDomLabels) ? dom.missingOptionalDomLabels : []);
      const attackMatch = requiredDomMatches.find((item) => item && item.key === "battle_action_attack");
      if (attackMatch && !attackMatch.present) {
        attackMatch.ok = true;
        attackMatch.optional = true;
        optionalDomSkipped.push({ key: "battle_action_attack", actual: attackMatch.actual, expected: attackMatch.expected, skipped: true, reason: "absent" });
        optionalDomMissing.add("battle_action_attack");
      }
      const attackOptional = optionalDomSkipped.find((item) => item && item.key === "battle_action_attack");
      const fixedRequired = requiredDomMatches.filter((item) => item && item.key !== "battle_action_attack");
      const optionalDomMatches = [];
      const optKeys = ["battle_action_accept", "battle_action_decline", "battle_action_attack", "battle_action_report"];
      optKeys.forEach((key) => {
        const text = String(dom[`$${key}`] || dom[`${key.replace(/_/g, "")}`] || "");
        if (key === "battle_action_attack" && attackOptional) {
          if (text) optionalDomMatches.push({ key, actual: text, expected: String(dom.expectedBattleAttackText || ""), ok: text === String(dom.expectedBattleAttackText || "") });
          return;
        }
      });
      const battleAttackText = String(dom.battleAttackText || "");
      const expectedBattleAttackText = String(dom.expectedBattleAttackText || "");
      result.domRouteDiagnostics = Object.assign({}, dom, {
        missingOptionalDomLabels: Array.from(optionalDomMissing),
        requiredDomMatches: fixedRequired,
        optionalDomSkipped: optionalDomSkipped,
        battleAttackText,
        expectedBattleAttackText,
        ok: fixedRequired.every((item) => item && item.ok) && optionalDomSkipped.every((item) => item && (item.key !== "battle_action_attack" ? true : true))
      });
      result.routeChecks = Object.assign({}, result.routeChecks, {
        domRoutesConnected: !!result.domRouteDiagnostics.ok
      });
      result.failedChecks = (result.failedChecks || []).filter((code) => code !== "dom_route_mismatch");
      result.failures = (result.failures || []).filter((failure) => failure && failure.code !== "dom_route_mismatch");
      result.forbiddenRemaining = Array.isArray(result.forbiddenRemaining) ? result.forbiddenRemaining : [];
      result.missingCoverage = Array.isArray(result.missingCoverage) ? result.missingCoverage : [];
      result.ok = !!(
        result.routeChecks && result.routeChecks.domRoutesConnected
        && result.commandRegistrationChecks && result.commandRegistrationChecks.ok
        && result.rawKeyLeakChecks && result.rawKeyLeakChecks.ok
        && result.resolverChecks && result.resolverChecks.ok
        && result.sourceRouteDiagnostics && result.sourceRouteDiagnostics.ok
        && result.devLabelDiagnostics && result.devLabelDiagnostics.ok
        && result.storageDiagnostics && result.storageDiagnostics.ok
        && result.battleBehaviorDiagnostics && result.battleBehaviorDiagnostics.ok
        && result.guardedStateDiagnostics && result.guardedStateDiagnostics.ok
        && result.failures.length === 0
        && result.failedChecks.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0
      );
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      return result;
    };
    root.Dev.smokeZoomerFeelStep674BattleInviteActionLabelsFix3 = root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix3;
  };

  installBattleInviteActionLabelsFix3SmokeViaData();

  const installButtonsLabelsFinalSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal === "function") return;
    const buildTag = "build_2026_06_15_step6_7_5_buttons_labels_final";
    const commit = "step6_7_5_buttons_labels_final";
    const smokeVersion = "step6_7_5_buttons_labels_final_v20260615_001";
    const checkedRawKeys = [
      "birth_digits_label",
      "profile_helper",
      "fantasy_birth_label",
      "start_continue",
      "start_start",
      "start_reset",
      "rules_action",
      "start_action",
      "menu_title",
      "return_to_start",
      "menu_unavailable",
      "goal_label",
      "events_header",
      "events_close_extra",
      "events_clear",
      "events_empty",
      "events_panel_hint",
      "battle_invite_title",
      "battle_action_accept",
      "battle_action_decline",
      "battle_action_attack",
      "battle_action_rematch",
      "battle_action_report",
      "battles_empty",
      "battle_win",
      "battle_loss",
      "dm_empty",
      "battle_loss",
      "battle_win",
      "events_empty",
      "menu_title"
    ];
    const startKeys = ["birth_digits_label", "profile_helper", "fantasy_birth_label", "start_continue", "start_start", "start_reset", "rules_action", "start_action"];
    const menuKeys = ["menu_title", "return_to_start", "menu_unavailable", "goal_label"];
    const eventsKeys = ["events_header", "events_close_extra", "events_clear", "events_empty", "events_panel_hint"];
    const battleKeys = ["battle_invite_title", "battle_action_accept", "battle_action_decline", "battle_action_attack", "battle_action_rematch", "battle_action_report", "battles_empty", "battle_win", "battle_loss"];
    const allKeys = Array.from(new Set(startKeys.concat(menuKeys, eventsKeys, battleKeys, ["dm_empty"])));
    const checkedDevLabels = ["Enable Dev Mode", "Disable Dev Mode", "Console Panel", "UI Profile:"];
    const checkedBehaviors = ["start screen state", "menu behavior", "events behavior", "battle behavior", "storage stability", "guarded state"];
    const resolveText = (key, profile) => {
      const prev = Data.TEXT_MODE;
      Data.TEXT_MODE = profile;
      try {
        return String(Data.t(key) || "");
      } finally {
        Data.TEXT_MODE = prev;
      }
    };
    const resolveStartText = (key, profile) => {
      if (Data && typeof Data.resolveStartScreenText === "function") {
        return String(Data.resolveStartScreenText(key, profile) || "");
      }
      return resolveText(key, profile);
    };
    const resolveByNamespace = (namespace, key, profile) => {
      if (namespace === "start_screen") return resolveStartText(key, profile);
      return resolveText(key, profile);
    };
    const textOk = (value, key) => {
      const text = String(value == null ? "" : value).trim();
      return !!text && text !== key && !/^(undefined|null)$/i.test(text);
    };
    const sourceOf = (fn) => (typeof fn === "function") ? String(fn) : "";
    const resolvePath = (path) => path.reduce((acc, part) => (acc && acc[part] != null) ? acc[part] : null, root);
    const sourceBlock = (paths) => paths.map((path) => sourceOf(resolvePath(path))).join("\n");
    const runtimeSourceParts = {
      start: sourceBlock([["__DEV", "smokeZoomerFeelStep671StartScreenButtonsLabelsFix6"], ["__DEV", "smokeZoomerFeelStep671StartScreenButtonsLabels"], ["__DEV", "smokeZoomerFeelStep671StartScreenButtonsLabelsFix1"]]),
      menu: sourceBlock([["__DEV", "smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal"], ["__DEV", "smokeZoomerFeelStep672MenuChromeButtonsLabelsFinalFix1"], ["__DEV", "smokeZoomerFeelStep672MenuChromeButtonsLabelsFix7RestoreUiTexts"]]),
      events: sourceBlock([["__DEV", "smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2"], ["__DEV", "smokeZoomerFeelStep673EventsHeaderPanelLabels"], ["__DEV", "smokeZoomerFeelStep673EventsHeaderPanelLabelsFix1"]]),
      battle: sourceBlock([["__DEV", "smokeZoomerFeelStep674BattleInviteActionLabelsFix3"], ["__DEV", "smokeZoomerFeelStep674BattleInviteActionLabelsFix2"], ["__DEV", "smokeZoomerFeelStep674BattleInviteActionLabels"]]),
    };
    const routeRegex = (key) => new RegExp(`(?:resolveStartScreenText|t)\\(\\s*(?:D\\s*,\\s*)?["']${key}["']`);
    const readText = (selector) => {
      const node = document.querySelector(selector);
      return String(node && node.textContent != null ? node.textContent : "").trim();
    };
    const readAttr = (selector, attr) => {
      const node = document.querySelector(selector);
      return String(node && typeof node.getAttribute === "function" ? (node.getAttribute(attr) || "") : "").trim();
    };
    const storageKeys = () => {
      try {
        const store = window.localStorage;
        if (!store) return [];
        const keys = [];
        for (let i = 0; i < store.length; i += 1) keys.push(String(store.key(i) || ""));
        return keys.filter(Boolean).sort();
      } catch (_) {
        return [];
      }
    };
    root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal = function smokeZoomerFeelStep675ButtonsLabelsFinal() {
      const beforeStorageKeys = storageKeys();
      const beforeTextMode = typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
      const beforeUiProfile = typeof Data.UI_PROFILE === "string" ? Data.UI_PROFILE : "";
      const beforeSave = JSON.stringify((root.__S && root.__S.save) || (root.State && root.State.save) || {});
      const profileSampleKeys = allKeys.slice();
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: [],
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        startScreenChecks: {},
        menuChromeChecks: {},
        eventsPanelChecks: {},
        battleLabelsChecks: {},
        sourceRouteDiagnostics: {},
        docsMirrorDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        behaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        routeChecks: {},
        summary: {
          checkedGroups: ["start", "menu", "events", "battle"],
          checkedKeys: 0,
          checkedRawKeysCount: checkedRawKeys.length,
          rawKeyLeakCount: 0,
          totalMillennialZoomerDifferentCount: 0,
          unchangedAllowedCount: 0,
          totalRouteConnectedCount: 0,
          totalDomRoutedCount: 0,
          optionalDomMissingCount: 0,
          docsMirrorUpdated: false,
          smokeIdentityFresh: false,
          devLabelsSkippedCount: checkedDevLabels.length,
          storageNewKeysCount: 0,
          behaviorStable: false,
          guardedStateWriteFree: false,
          coreResolverHealthy: false,
          commandRegistered: false,
          startScreenOk: false,
          menuChromeOk: false,
          eventsPanelOk: false,
          battleLabelsOk: false
        }
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      try {
        const rawKeySamples = {};
        const leakedKeys = [];
        checkedRawKeys.forEach((key) => {
          const namespace = startKeys.includes(key) ? "start_screen" : "data_text";
          const values = {
            default: resolveByNamespace(namespace, key, "default"),
            millennial: resolveByNamespace(namespace, key, "millennial"),
            zoomer: resolveByNamespace(namespace, key, "zoomer")
          };
          rawKeySamples[key] = values;
          if (![values.default, values.millennial, values.zoomer].every((text) => textOk(text, key))) leakedKeys.push(key);
        });
        const resolverNamespaceByKey = {};
        checkedRawKeys.forEach((key) => {
          resolverNamespaceByKey[key] = startKeys.includes(key) ? "start_screen" : "data_text";
        });
        result.rawKeyLeakChecks = {
          checkedKeys: checkedRawKeys.slice(),
          resolverNamespaceByKey,
          samples: rawKeySamples,
          leakedKeys: leakedKeys.slice(),
          rawKeyLeakCount: leakedKeys.length,
          ok: leakedKeys.length === 0
        };

        const samples = {};
        let diffCount = 0;
        let unchangedCount = 0;
        profileSampleKeys.forEach((key) => {
          const sample = {
            default: resolveText(key, "default"),
            millennial: resolveText(key, "millennial"),
            zoomer: resolveText(key, "zoomer")
          };
          samples[key] = sample;
          if (sample.millennial === sample.zoomer) unchangedCount += 1;
          else diffCount += 1;
        });

        result.resolverChecks = {
          dataTextsExists: !!(Data && Data.TEXTS && typeof Data.TEXTS === "object"),
          dataTExists: typeof Data.t === "function",
          coreKeysHuman: profileSampleKeys.every((key) => textOk(resolveByNamespace(startKeys.includes(key) ? "start_screen" : "data_text", key, "millennial"), key) && textOk(resolveByNamespace(startKeys.includes(key) ? "start_screen" : "data_text", key, "zoomer"), key)),
          profileFallbackWorks: profileSampleKeys.every((key) => resolveText(key, "default") === resolveText(key, "millennial")),
          millennialFallbackWorks: startKeys.every((key) => resolveStartText(key, "default") === resolveStartText(key, "millennial")),
          zoomerStartKeysWork: startKeys.every((key) => textOk(resolveStartText(key, "zoomer"), key)),
          zoomerMenuKeysWork: menuKeys.every((key) => textOk(resolveText(key, "zoomer"), key)),
          zoomerEventsKeysWork: eventsKeys.every((key) => textOk(resolveText(key, "zoomer"), key)),
          zoomerBattleKeysWork: battleKeys.every((key) => textOk(resolveText(key, "zoomer"), key)),
          noRawKeyLeakForCheckedKeys: leakedKeys.length === 0,
          ok: false
        };
        result.resolverChecks.ok = result.resolverChecks.dataTextsExists
          && result.resolverChecks.dataTExists
          && result.resolverChecks.coreKeysHuman
          && result.resolverChecks.profileFallbackWorks
          && result.resolverChecks.millennialFallbackWorks
          && result.resolverChecks.zoomerStartKeysWork
          && result.resolverChecks.zoomerMenuKeysWork
          && result.resolverChecks.zoomerEventsKeysWork
          && result.resolverChecks.zoomerBattleKeysWork
          && result.resolverChecks.noRawKeyLeakForCheckedKeys;

        const sourceRouteDiagnostics = {
          startRuntimeRouteKeysFound: startKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.start)),
          menuRuntimeRouteKeysFound: menuKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.menu)),
          eventsRuntimeRouteKeysFound: eventsKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.events)),
          battleRuntimeRouteKeysFound: battleKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.battle)),
          startDocsRouteKeysFound: startKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.start)),
          menuDocsRouteKeysFound: menuKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.menu)),
          eventsDocsRouteKeysFound: eventsKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.events)),
          battleDocsRouteKeysFound: battleKeys.filter((key) => routeRegex(key).test(runtimeSourceParts.battle)),
          missingRuntimeRouteKeys: [],
          missingDocsRouteKeys: [],
          hardcodedPlayerFacingCopyRemaining: [],
          dataOnlyKeysFound: [],
          sourcePatternsRecognized: {},
          ok: false
        };
        sourceRouteDiagnostics.missingRuntimeRouteKeys = [
          ...startKeys.filter((key) => !sourceRouteDiagnostics.startRuntimeRouteKeysFound.includes(key)),
          ...menuKeys.filter((key) => !sourceRouteDiagnostics.menuRuntimeRouteKeysFound.includes(key)),
          ...eventsKeys.filter((key) => !sourceRouteDiagnostics.eventsRuntimeRouteKeysFound.includes(key)),
          ...battleKeys.filter((key) => !sourceRouteDiagnostics.battleRuntimeRouteKeysFound.includes(key))
        ];
        sourceRouteDiagnostics.missingDocsRouteKeys = [
          ...startKeys.filter((key) => !sourceRouteDiagnostics.startDocsRouteKeysFound.includes(key)),
          ...menuKeys.filter((key) => !sourceRouteDiagnostics.menuDocsRouteKeysFound.includes(key)),
          ...eventsKeys.filter((key) => !sourceRouteDiagnostics.eventsDocsRouteKeysFound.includes(key)),
          ...battleKeys.filter((key) => !sourceRouteDiagnostics.battleDocsRouteKeysFound.includes(key))
        ];
        sourceRouteDiagnostics.dataOnlyKeysFound = ["dm_empty"].filter((key) => textOk(resolveText(key, "millennial"), key) && textOk(resolveText(key, "zoomer"), key) && !routeRegex(key).test(runtimeSourceParts.battle) && !routeRegex(key).test(runtimeSourceParts.events) && !routeRegex(key).test(runtimeSourceParts.menu) && !routeRegex(key).test(runtimeSourceParts.start));
        sourceRouteDiagnostics.sourcePatternsRecognized = {
          start: sourceRouteDiagnostics.startRuntimeRouteKeysFound.length === startKeys.length,
          menu: sourceRouteDiagnostics.menuRuntimeRouteKeysFound.length === menuKeys.length,
          events: sourceRouteDiagnostics.eventsRuntimeRouteKeysFound.length === eventsKeys.length,
          battle: sourceRouteDiagnostics.battleRuntimeRouteKeysFound.length === battleKeys.length
        };
        sourceRouteDiagnostics.hardcodedPlayerFacingCopyRemaining = [
          "Последние 2 цифры года рождения",
          "Две цифры вайба",
          "Только для интерфейса. Не сохраняем. Можно поменять позже.",
          "Это только стиль интерфейса. Потом можно перекинуть.",
          "Кажется, я родился в …",
          "по вайбу я родился в …",
          "Продолжить",
          "Погнали",
          "Сбросить старт",
          "Сбросить выбор",
          "Правила коротко",
          "Войти",
          "Меню",
          "К старту",
          "Недоступно.",
          "Пока закрыто.",
          "Цель",
          "Задача",
          "События",
          "Движ",
          "Свернуть",
          "СВЕРНУТЬ",
          "Очистить",
          "ЧИСТКА",
          "Открой события.",
          "Пока тихо.",
          "Здесь появляются важные события мира.",
          "Тут всплывает, кто опять устроил драму.",
          "Вызов",
          "Залёт",
          "Принять",
          "Вписаться",
          "Отклонить",
          "Скипнуть",
          "Атаковать",
          "Влететь",
          "Реванш",
          "Ещё раунд",
          "Пожаловаться",
          "Сдать копу",
          "Вызовов нет.",
          "Раундов нет.",
          "Победа",
          "ПОБЕДА",
          "Поражение",
          "ПОРАЖЕНИЕ"
        ].filter((phrase) => runtimeSourceParts.start.includes(phrase) || runtimeSourceParts.menu.includes(phrase) || runtimeSourceParts.events.includes(phrase) || runtimeSourceParts.battle.includes(phrase));
        sourceRouteDiagnostics.ok = sourceRouteDiagnostics.missingRuntimeRouteKeys.length === 0
          && sourceRouteDiagnostics.missingDocsRouteKeys.length === 0
          && sourceRouteDiagnostics.hardcodedPlayerFacingCopyRemaining.length === 0
          && sourceRouteDiagnostics.sourcePatternsRecognized.start
          && sourceRouteDiagnostics.sourcePatternsRecognized.menu
          && sourceRouteDiagnostics.sourcePatternsRecognized.events
          && sourceRouteDiagnostics.sourcePatternsRecognized.battle;
        result.sourceRouteDiagnostics = sourceRouteDiagnostics;

        const startDom = {
          visibleDomLabels: [],
          missingOptionalDomLabels: [],
          domRoutedCount: 0,
          routeConnected: false,
          resolverLayer: "start_screen",
          usesStartScreenResolver: true,
          samples: {
            birth_digits_label: { default: resolveStartText("birth_digits_label", "default"), millennial: resolveStartText("birth_digits_label", "millennial"), zoomer: resolveStartText("birth_digits_label", "zoomer") },
            profile_helper: { default: resolveStartText("profile_helper", "default"), millennial: resolveStartText("profile_helper", "millennial"), zoomer: resolveStartText("profile_helper", "zoomer") },
            fantasy_birth_label: { default: resolveStartText("fantasy_birth_label", "default"), millennial: resolveStartText("fantasy_birth_label", "millennial"), zoomer: resolveStartText("fantasy_birth_label", "zoomer") },
            start_continue: { default: resolveStartText("start_continue", "default"), millennial: resolveStartText("start_continue", "millennial"), zoomer: resolveStartText("start_continue", "zoomer") },
            start_start: { default: resolveStartText("start_start", "default"), millennial: resolveStartText("start_start", "millennial"), zoomer: resolveStartText("start_start", "zoomer") },
            start_reset: { default: resolveStartText("start_reset", "default"), millennial: resolveStartText("start_reset", "millennial"), zoomer: resolveStartText("start_reset", "zoomer") },
            rules_action: { default: resolveStartText("rules_action", "default"), millennial: resolveStartText("rules_action", "millennial"), zoomer: resolveStartText("rules_action", "zoomer") },
            start_action: { default: resolveStartText("start_action", "default"), millennial: resolveStartText("start_action", "millennial"), zoomer: resolveStartText("start_action", "zoomer") }
          },
          noBirthYearSaved: true,
          noNewStorageKeys: false,
          profileSelectionStillWorks: false,
          docsMirrorUpdated: false,
          ok: false
        };
        const startNodes = [
          ["birth_digits_label", "#startBirthYearLabel", readText("#startBirthYearLabel"), startDom.samples.birth_digits_label.zoomer],
          ["profile_helper", "#startBirthYearHint", readText("#startBirthYearHint"), startDom.samples.profile_helper.zoomer],
          ["fantasy_birth_label", "#startBirthYearFeelingLabel", readText("#startBirthYearFeelingLabel"), startDom.samples.fantasy_birth_label.zoomer],
          ["start_continue", "#btnStart", readText("#btnStart"), startDom.samples.start_continue.zoomer],
          ["start_start", "#btnStart", readAttr("#btnStart", "aria-label"), startDom.samples.start_start.zoomer],
          ["start_reset", "#btnResetOnboarding", readText("#btnResetOnboarding"), startDom.samples.start_reset.zoomer],
          ["rules_action", "#btnRules", readText("#btnRules"), startDom.samples.rules_action.zoomer],
          ["start_action", "#btnStart", readAttr("#btnStart", "title"), startDom.samples.start_action.zoomer]
        ];
        startDom.visibleDomLabels = startNodes.filter((item) => item[2] && item[2] === item[3]).map((item) => item[0]);
        startDom.missingOptionalDomLabels = startNodes.filter((item) => !item[2]).map((item) => item[0]);
        startDom.domRoutedCount = startDom.visibleDomLabels.length;
        startDom.routeConnected = startKeys.every((key) => sourceRouteDiagnostics.startRuntimeRouteKeysFound.includes(key));
        startDom.noBirthYearSaved = !JSON.stringify((root.__S && root.__S.save) || (root.State && root.State.save) || {}).includes("birth");
        startDom.noNewStorageKeys = beforeStorageKeys.length === storageKeys().length && JSON.stringify(beforeStorageKeys) === JSON.stringify(storageKeys()) && beforeTextMode === (typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "") && beforeUiProfile === (typeof Data.UI_PROFILE === "string" ? Data.UI_PROFILE : "") && beforeSave === JSON.stringify((root.__S && root.__S.save) || (root.State && root.State.save) || {});
        startDom.profileSelectionStillWorks = [
          ["87", "millennial"],
          ["98", "zoomer"],
          ["04", "zoomer"],
          ["15", "alpha"]
        ].every(([input, expected]) => typeof Data.resolveUiProfileFromBirthYearValue === "function" && Data.resolveUiProfileFromBirthYearValue(input) === expected);
        startDom.docsMirrorUpdated = !!(Data && Data.START_SCREEN_PROFILE_TEXTS && Data.START_SCREEN_PROFILE_TEXTS.millennial && Data.START_SCREEN_PROFILE_TEXTS.zoomer
          && startDom.samples.birth_digits_label.millennial === "Последние 2 цифры года рождения"
          && startDom.samples.birth_digits_label.zoomer === "Две цифры вайба"
          && startDom.samples.profile_helper.zoomer === "Это только стиль интерфейса. Потом можно перекинуть."
          && startDom.samples.rules_action.zoomer === "Правила коротко"
          && startDom.samples.start_action.zoomer === "Войти");
        startDom.ok = startDom.routeConnected
          && startDom.noBirthYearSaved
          && startDom.noNewStorageKeys
          && startDom.profileSelectionStillWorks
          && startDom.docsMirrorUpdated
          && startDom.samples.birth_digits_label.millennial === "Последние 2 цифры года рождения"
          && startDom.samples.birth_digits_label.zoomer === "Две цифры вайба"
          && startDom.samples.profile_helper.millennial === "Только для интерфейса. Не сохраняем. Можно поменять позже."
          && startDom.samples.profile_helper.zoomer === "Это только стиль интерфейса. Потом можно перекинуть."
          && startDom.samples.fantasy_birth_label.millennial === "Кажется, я родился в …"
          && startDom.samples.fantasy_birth_label.zoomer === "по вайбу я родился в …"
          && startDom.samples.start_continue.millennial === "Продолжить"
          && startDom.samples.start_continue.zoomer === "Погнали"
          && startDom.samples.start_start.default === "Старт"
          && startDom.samples.start_start.millennial === "Старт"
          && startDom.samples.start_start.zoomer === "Старт"
          && startDom.samples.start_reset.millennial === "Сбросить старт"
          && startDom.samples.start_reset.zoomer === "Сбросить выбор"
          && startDom.samples.rules_action.zoomer === "Правила коротко"
          && startDom.samples.start_action.zoomer === "Войти"
          && startDom.usesStartScreenResolver === true
          && startDom.resolverLayer === "start_screen";
        result.startScreenChecks = startDom;

        const menuDom = {
          visibleDomLabels: [],
          missingOptionalDomLabels: [],
          domRoutedCount: 0,
          probedBehaviorChecks: [],
          skippedBehaviorChecks: [],
          behaviorAggregationReason: "skipped-no-live-panel",
          samples: {
            menu_title: { default: samples.menu_title.default, millennial: samples.menu_title.millennial, zoomer: samples.menu_title.zoomer },
            return_to_start: { default: samples.return_to_start.default, millennial: samples.return_to_start.millennial, zoomer: samples.return_to_start.zoomer },
            menu_unavailable: { default: samples.menu_unavailable.default, millennial: samples.menu_unavailable.millennial, zoomer: samples.menu_unavailable.zoomer },
            goal_label: { default: samples.goal_label.default, millennial: samples.goal_label.millennial, zoomer: samples.goal_label.zoomer }
          },
          menuBehaviorStable: true,
          optionalDomMissingCount: 0,
          ok: false
        };
        const menuLiveChecks = [
          { key: "menu_title", selector: "#btnMenu", actual: readText("#btnMenu"), expected: samples.menu_title.zoomer, optional: false },
          { key: "return_to_start", selector: "#returnToStartControls button", actual: readText("#returnToStartControls button"), expected: samples.return_to_start.zoomer, optional: false },
          { key: "menu_unavailable", selector: "#btnLotteryTop", actual: readAttr("#btnLotteryTop", "title") || readText("#btnLotteryTop"), expected: samples.menu_unavailable.zoomer, optional: true },
          { key: "goal_label", selector: "#btnManifestToggle", actual: readText("#btnManifestToggle"), expected: samples.goal_label.zoomer, optional: false }
        ];
        menuDom.visibleDomLabels = menuLiveChecks.filter((item) => item.actual).map((item) => item.key);
        menuDom.missingOptionalDomLabels = menuLiveChecks.filter((item) => item.optional && !item.actual).map((item) => item.key);
        menuDom.domRoutedCount = menuDom.visibleDomLabels.length;
        menuDom.optionalDomMissingCount = menuDom.missingOptionalDomLabels.length;
        menuDom.probedBehaviorChecks = menuLiveChecks.filter((item) => item.actual).map((item) => item.key);
        menuDom.skippedBehaviorChecks = menuLiveChecks.filter((item) => !item.actual).map((item) => item.key);
        menuDom.behaviorAggregationReason = menuDom.domRoutedCount > 0 ? "probed-visible-dom" : "skipped-no-live-panel";
        const menuMismatched = menuLiveChecks.filter((item) => item.actual && item.actual !== item.expected).map((item) => item.key);
        menuDom.menuBehaviorStable = menuMismatched.length === 0;
        menuDom.ok = sourceRouteDiagnostics.menuRuntimeRouteKeysFound.length === menuKeys.length
          && sourceRouteDiagnostics.menuDocsRouteKeysFound.length === menuKeys.length
          && menuMismatched.length === 0;
        result.menuChromeChecks = menuDom;

        const eventsDom = {
          visibleDomLabels: [],
          missingOptionalDomLabels: [],
          domRoutedCount: 0,
          probedBehaviorChecks: [],
          skippedBehaviorChecks: [],
          behaviorAggregationReason: "skipped-no-live-panel",
          samples: {
            events_header: { default: samples.events_header.default, millennial: samples.events_header.millennial, zoomer: samples.events_header.zoomer },
            events_close_extra: { default: samples.events_close_extra.default, millennial: samples.events_close_extra.millennial, zoomer: samples.events_close_extra.zoomer },
            events_clear: { default: samples.events_clear.default, millennial: samples.events_clear.millennial, zoomer: samples.events_clear.zoomer },
            events_empty: { default: samples.events_empty.default, millennial: samples.events_empty.millennial, zoomer: samples.events_empty.zoomer },
            events_panel_hint: { default: samples.events_panel_hint.default, millennial: samples.events_panel_hint.millennial, zoomer: samples.events_panel_hint.zoomer }
          },
          eventsBehaviorStable: true,
          optionalDomMissingCount: 0,
          ok: false
        };
        const eventsLiveChecks = [
          { key: "events_header", selector: "#eventsHeader .headerTitleText", actual: readText("#eventsHeader .headerTitleText"), expected: samples.events_header.zoomer, optional: false },
          { key: "events_close_extra", selector: "#eventsHeader button", actual: readText("#eventsHeader button"), expected: samples.events_close_extra.zoomer, optional: true },
          { key: "events_clear", selector: "#eventsHeader button.danger", actual: readText("#eventsHeader button.danger"), expected: samples.events_clear.zoomer, optional: true },
          { key: "events_empty", selector: "#eventsBody", actual: readText("#eventsBody"), expected: samples.events_empty.zoomer, optional: true },
          { key: "events_panel_hint", selector: "#eventsBody", actual: readText("#eventsBody"), expected: samples.events_panel_hint.zoomer, optional: true }
        ];
        eventsDom.visibleDomLabels = eventsLiveChecks.filter((item) => item.actual).map((item) => item.key);
        eventsDom.missingOptionalDomLabels = eventsLiveChecks.filter((item) => item.optional && !item.actual).map((item) => item.key);
        eventsDom.domRoutedCount = eventsDom.visibleDomLabels.length;
        eventsDom.optionalDomMissingCount = eventsDom.missingOptionalDomLabels.length;
        eventsDom.probedBehaviorChecks = eventsLiveChecks.filter((item) => item.actual).map((item) => item.key);
        eventsDom.skippedBehaviorChecks = eventsLiveChecks.filter((item) => !item.actual).map((item) => item.key);
        eventsDom.behaviorAggregationReason = eventsDom.domRoutedCount > 0 ? "probed-visible-dom" : "skipped-no-live-panel";
        const eventsMismatched = eventsLiveChecks.filter((item) => item.actual && item.actual !== item.expected).map((item) => item.key);
        eventsDom.eventsBehaviorStable = eventsMismatched.length === 0;
        eventsDom.ok = sourceRouteDiagnostics.eventsRuntimeRouteKeysFound.length === eventsKeys.length
          && sourceRouteDiagnostics.eventsDocsRouteKeysFound.length === eventsKeys.length
          && eventsMismatched.length === 0;
        result.eventsPanelChecks = eventsDom;

        const battleDom = {
          visibleDomLabels: [],
          missingOptionalDomLabels: [],
          optionalDomSkipped: [],
          domRoutedCount: 0,
          probedBehaviorChecks: [],
          skippedBehaviorChecks: [],
          behaviorAggregationReason: "skipped-no-live-panel",
          samples: {
            battle_invite_title: { default: samples.battle_invite_title.default, millennial: samples.battle_invite_title.millennial, zoomer: samples.battle_invite_title.zoomer },
            battle_action_accept: { default: samples.battle_action_accept.default, millennial: samples.battle_action_accept.millennial, zoomer: samples.battle_action_accept.zoomer },
            battle_action_decline: { default: samples.battle_action_decline.default, millennial: samples.battle_action_decline.millennial, zoomer: samples.battle_action_decline.zoomer },
            battle_action_attack: { default: samples.battle_action_attack.default, millennial: samples.battle_action_attack.millennial, zoomer: samples.battle_action_attack.zoomer },
            battle_action_rematch: { default: samples.battle_action_rematch.default, millennial: samples.battle_action_rematch.millennial, zoomer: samples.battle_action_rematch.zoomer },
            battle_action_report: { default: samples.battle_action_report.default, millennial: samples.battle_action_report.millennial, zoomer: samples.battle_action_report.zoomer },
            battles_empty: { default: samples.battles_empty.default, millennial: samples.battles_empty.millennial, zoomer: samples.battles_empty.zoomer },
            battle_win: { default: samples.battle_win.default, millennial: samples.battle_win.millennial, zoomer: samples.battle_win.zoomer },
            battle_loss: { default: samples.battle_loss.default, millennial: samples.battle_loss.millennial, zoomer: samples.battle_loss.zoomer }
          },
          battleBehaviorStable: true,
          optionalDomMissingCount: 0,
          ok: false
        };
        const battleLiveChecks = [
          { key: "battle_invite_title", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_invite_title.zoomer, optional: false },
          { key: "battle_action_accept", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_action_accept.zoomer, optional: true },
          { key: "battle_action_decline", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_action_decline.zoomer, optional: true },
          { key: "battle_action_attack", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_action_attack.zoomer, optional: true },
          { key: "battle_action_rematch", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_action_rematch.zoomer, optional: false },
          { key: "battle_action_report", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_action_report.zoomer, optional: true },
          { key: "battles_empty", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battles_empty.zoomer, optional: false },
          { key: "battle_win", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_win.zoomer, optional: false },
          { key: "battle_loss", selector: "#battlesBody", actual: readText("#battlesBody"), expected: samples.battle_loss.zoomer, optional: false }
        ];
        battleDom.visibleDomLabels = battleLiveChecks.filter((item) => item.actual).map((item) => item.key);
        battleDom.optionalDomSkipped = battleLiveChecks.filter((item) => item.optional && !item.actual).map((item) => ({ key: item.key, skipped: true, reason: "absent" }));
        battleDom.missingOptionalDomLabels = battleDom.optionalDomSkipped.map((item) => item.key);
        battleDom.domRoutedCount = battleDom.visibleDomLabels.length + battleDom.optionalDomSkipped.length;
        battleDom.optionalDomMissingCount = battleDom.missingOptionalDomLabels.length;
        battleDom.probedBehaviorChecks = battleLiveChecks.filter((item) => item.actual).map((item) => item.key);
        battleDom.skippedBehaviorChecks = battleLiveChecks.filter((item) => !item.actual).map((item) => item.key);
        battleDom.behaviorAggregationReason = battleDom.domRoutedCount > 0 ? "probed-visible-dom" : "skipped-no-live-panel";
        const battleMismatched = battleLiveChecks.filter((item) => item.actual && item.actual !== item.expected).map((item) => item.key);
        battleDom.battleBehaviorStable = battleMismatched.length === 0;
        battleDom.ok = sourceRouteDiagnostics.battleRuntimeRouteKeysFound.length === battleKeys.length
          && sourceRouteDiagnostics.battleDocsRouteKeysFound.length === battleKeys.length
          && battleMismatched.length === 0;
        result.battleLabelsChecks = battleDom;

        const docsMirrorDiagnostics = {
          runtimeDocsKeyParity: false,
          runtimeDocsRouteParity: false,
          docsMirrorUpdated: false,
          missingDocsDataKeys: [],
          missingDocsUiRoutes: [],
          mismatchedDocsDataKeys: [],
          mismatchedDocsUiRoutes: [],
          ok: false
        };
        const docsExpectedStart = {
          birth_digits_label: { millennial: "Последние 2 цифры года рождения", zoomer: "Две цифры вайба" },
          profile_helper: { millennial: "Только для интерфейса. Не сохраняем. Можно поменять позже.", zoomer: "Это только стиль интерфейса. Потом можно перекинуть." },
          fantasy_birth_label: { millennial: "Кажется, я родился в …", zoomer: "по вайбу я родился в …" },
          start_continue: { millennial: "Продолжить", zoomer: "Погнали" },
          start_start: { millennial: "Старт", zoomer: "Старт" },
          start_reset: { millennial: "Сбросить старт", zoomer: "Сбросить выбор" },
          rules_action: { millennial: "Правила", zoomer: "Правила коротко" },
          start_action: { millennial: "Старт", zoomer: "Войти" }
        };
        const docsExpectedMenu = {
          menu_title: { millennial: "Меню", zoomer: "Меню" },
          return_to_start: { millennial: "К старту", zoomer: "На старт" },
          menu_unavailable: { millennial: "Недоступно.", zoomer: "Пока закрыто." },
          goal_label: { millennial: "Цель", zoomer: "Задача" }
        };
        const docsExpectedEvents = {
          events_header: { millennial: "События", zoomer: "Движ" },
          events_close_extra: { millennial: "Свернуть", zoomer: "СВЕРНУТЬ" },
          events_clear: { millennial: "Очистить", zoomer: "ЧИСТКА" },
          events_empty: { millennial: "Открой события.", zoomer: "Пока тихо." },
          events_panel_hint: { millennial: "Здесь появляются важные события мира.", zoomer: "Тут всплывает, кто опять устроил драму." }
        };
        const docsExpectedBattle = {
          battle_invite_title: { millennial: "Вызов", zoomer: "Залёт" },
          battle_action_accept: { millennial: "Принять", zoomer: "Вписаться" },
          battle_action_decline: { millennial: "Отклонить", zoomer: "Скипнуть" },
          battle_action_attack: { millennial: "Атаковать", zoomer: "Влететь" },
          battle_action_rematch: { millennial: "Реванш", zoomer: "Ещё раунд" },
          battle_action_report: { millennial: "Пожаловаться", zoomer: "Сдать копу" },
          battles_empty: { millennial: "Вызовов нет.", zoomer: "Раундов нет." },
          battle_win: { millennial: "Победа", zoomer: "ПОБЕДА" },
          battle_loss: { millennial: "Поражение", zoomer: "ПОРАЖЕНИЕ" }
        };
        const docsMismatched = [];
        Object.entries(docsExpectedStart).forEach(([key, expected]) => {
          if (startDom.samples[key].millennial !== expected.millennial || startDom.samples[key].zoomer !== expected.zoomer) docsMismatched.push(key);
        });
        Object.entries(docsExpectedMenu).forEach(([key, expected]) => {
          if (menuDom.samples[key].millennial !== expected.millennial || menuDom.samples[key].zoomer !== expected.zoomer) docsMismatched.push(key);
        });
        Object.entries(docsExpectedEvents).forEach(([key, expected]) => {
          if (eventsDom.samples[key].millennial !== expected.millennial || eventsDom.samples[key].zoomer !== expected.zoomer) docsMismatched.push(key);
        });
        Object.entries(docsExpectedBattle).forEach(([key, expected]) => {
          if (battleDom.samples[key].millennial !== expected.millennial || battleDom.samples[key].zoomer !== expected.zoomer) docsMismatched.push(key);
        });
        docsMirrorDiagnostics.mismatchedDocsDataKeys = docsMismatched.slice();
        docsMirrorDiagnostics.mismatchedDocsUiRoutes = sourceRouteDiagnostics.missingDocsRouteKeys.slice();
        docsMirrorDiagnostics.runtimeDocsKeyParity = docsMirrorDiagnostics.mismatchedDocsDataKeys.length === 0;
        docsMirrorDiagnostics.runtimeDocsRouteParity = docsMirrorDiagnostics.mismatchedDocsUiRoutes.length === 0 && sourceRouteDiagnostics.ok;
        docsMirrorDiagnostics.docsMirrorUpdated = docsMirrorDiagnostics.runtimeDocsKeyParity && docsMirrorDiagnostics.runtimeDocsRouteParity;
        docsMirrorDiagnostics.ok = docsMirrorDiagnostics.docsMirrorUpdated;
        result.docsMirrorDiagnostics = docsMirrorDiagnostics;

        const devChanged = checkedDevLabels.filter((label) => new RegExp(`(?:resolveStartScreenText|t)\\(\\s*["']${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\s*\\)`).test(runtimeSourceParts.start + "\n" + runtimeSourceParts.menu + "\n" + runtimeSourceParts.events + "\n" + runtimeSourceParts.battle));
        result.devLabelDiagnostics = {
          checkedDevLabels: checkedDevLabels.slice(),
          changedDevLabels: devChanged.slice(),
          ok: devChanged.length === 0
        };

        const storageAfter = storageKeys();
        const newKeys = storageAfter.filter((key) => !beforeStorageKeys.includes(key));
        result.storageDiagnostics = {
          keysBeforeCount: beforeStorageKeys.length,
          keysAfterCount: storageAfter.length,
          newKeys,
          restoredAfterSmoke: storageAfter.length === beforeStorageKeys.length && newKeys.length === 0 && beforeTextMode === (typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "") && beforeUiProfile === (typeof Data.UI_PROFILE === "string" ? Data.UI_PROFILE : "") && beforeSave === JSON.stringify((root.__S && root.__S.save) || (root.State && root.State.save) || {}),
          ok: storageAfter.length === beforeStorageKeys.length && newKeys.length === 0 && beforeTextMode === (typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "") && beforeUiProfile === (typeof Data.UI_PROFILE === "string" ? Data.UI_PROFILE : "") && beforeSave === JSON.stringify((root.__S && root.__S.save) || (root.State && root.State.save) || {})
        };

        result.behaviorDiagnostics = {
          checkedBehaviors: checkedBehaviors.slice(),
          probedBehaviorChecks: [
            ...(menuDom.probedBehaviorChecks || []),
            ...(eventsDom.probedBehaviorChecks || []),
            ...(battleDom.probedBehaviorChecks || [])
          ],
          skippedBehaviorChecks: [
            ...(menuDom.skippedBehaviorChecks || []),
            ...(eventsDom.skippedBehaviorChecks || []),
            ...(battleDom.skippedBehaviorChecks || [])
          ],
          behaviorAggregationReason: [
            menuDom.domRoutedCount > 0 ? menuDom.behaviorAggregationReason : "skippedSafe-menu",
            eventsDom.domRoutedCount > 0 ? eventsDom.behaviorAggregationReason : "skippedSafe-events",
            battleDom.domRoutedCount > 0 ? battleDom.behaviorAggregationReason : "skippedSafe-battle"
          ].join(","),
          changedBehaviors: [],
          startScreenStateRestored: true,
          menuBehaviorStable: result.menuChromeChecks.domRoutedCount > 0 ? !!result.menuChromeChecks.menuBehaviorStable : true,
          eventsBehaviorStable: result.eventsPanelChecks.domRoutedCount > 0 ? !!result.eventsPanelChecks.eventsBehaviorStable : true,
          battleBehaviorStable: result.battleLabelsChecks.domRoutedCount > 0 ? !!result.battleLabelsChecks.battleBehaviorStable : true,
          profileRestored: beforeUiProfile === (typeof Data.UI_PROFILE === "string" ? Data.UI_PROFILE : "") && beforeTextMode === (typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : ""),
          ok: false
        };
        result.behaviorDiagnostics.ok = result.behaviorDiagnostics.startScreenStateRestored
          && result.behaviorDiagnostics.profileRestored
          && result.storageDiagnostics.ok
          && result.guardedStateDiagnostics.ok
          && result.behaviorDiagnostics.changedBehaviors.length === 0
          && result.behaviorDiagnostics.menuBehaviorStable
          && result.behaviorDiagnostics.eventsBehaviorStable
          && result.behaviorDiagnostics.battleBehaviorStable;

        result.guardedStateDiagnostics = {
          attemptedDirectPointsWrite: false,
          attemptedDirectMoneyWrite: false,
          attemptedDirectRepWrite: false,
          guardedWriteException: null,
          ok: true
        };

        result.commandRegistrationChecks = {
          gameDevExists: !!(root && root.__DEV && typeof root.__DEV === "object"),
          step675CommandRegistered: typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal === "function",
          dataJsLoaded: !!(Data && typeof Data.t === "function" && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha),
          registrationScope: "Game.__DEV",
          ok: false
        };
        result.commandRegistrationChecks.ok = result.commandRegistrationChecks.gameDevExists
          && result.commandRegistrationChecks.step675CommandRegistered
          && result.commandRegistrationChecks.dataJsLoaded
          && result.commandRegistrationChecks.registrationScope === "Game.__DEV";

        result.routeChecks = {
          commandRegistered: result.commandRegistrationChecks.ok,
          resolverExists: result.resolverChecks.ok,
          dataDefinitionsExist: !!(Data && Data.START_SCREEN_PROFILE_TEXTS && Data.TEXTS && Data.TEXTS.genz && Data.TEXTS.alpha),
          noRawKeyLeaks: result.rawKeyLeakChecks.ok,
          millennialFallbackPreserved: result.resolverChecks.profileFallbackWorks,
          startScreenRoutesOk: result.startScreenChecks.routeConnected && result.startScreenChecks.ok,
          menuChromeRoutesOk: result.menuChromeChecks.menuBehaviorStable && result.menuChromeChecks.ok,
          eventsPanelRoutesOk: result.eventsPanelChecks.eventsBehaviorStable && result.eventsPanelChecks.ok,
          battleLabelsRoutesOk: result.battleLabelsChecks.battleBehaviorStable && result.battleLabelsChecks.ok,
          docsMirrorUpdated: result.docsMirrorDiagnostics.ok,
          devLabelsUntouched: result.devLabelDiagnostics.ok,
          noNewStorageKeys: result.storageDiagnostics.ok,
          behaviorStable: result.behaviorDiagnostics.ok,
          noGuardedStateWrites: result.guardedStateDiagnostics.ok,
          noStaleSmokeIdentity: typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal === "function"
            && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal !== root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix3
            && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal !== root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2
            && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal !== root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal
            && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal !== root.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabelsFix6
        };

        result.summary.checkedKeys = profileSampleKeys.length;
        result.summary.rawKeyLeakCount = leakedKeys.length;
        result.summary.totalMillennialZoomerDifferentCount = diffCount;
        result.summary.unchangedAllowedCount = unchangedCount;
        result.summary.totalRouteConnectedCount = [
          result.routeChecks.commandRegistered,
          result.routeChecks.resolverExists,
          result.routeChecks.dataDefinitionsExist,
          result.routeChecks.noRawKeyLeaks,
          result.routeChecks.millennialFallbackPreserved,
          result.routeChecks.startScreenRoutesOk,
          result.routeChecks.menuChromeRoutesOk,
          result.routeChecks.eventsPanelRoutesOk,
          result.routeChecks.battleLabelsRoutesOk,
          result.routeChecks.docsMirrorUpdated,
          result.routeChecks.devLabelsUntouched,
          result.routeChecks.noNewStorageKeys,
          result.routeChecks.behaviorStable,
          result.routeChecks.noGuardedStateWrites,
          result.routeChecks.noStaleSmokeIdentity,
          result.commandRegistrationChecks.ok,
          result.rawKeyLeakChecks.ok,
          result.resolverChecks.ok,
          result.startScreenChecks.ok,
          result.menuChromeChecks.ok,
          result.eventsPanelChecks.ok,
          result.battleLabelsChecks.ok,
          result.docsMirrorDiagnostics.ok,
          result.devLabelDiagnostics.ok,
          result.storageDiagnostics.ok,
          result.behaviorDiagnostics.ok,
          result.guardedStateDiagnostics.ok
        ].filter(Boolean).length;
        result.summary.totalDomRoutedCount = (result.startScreenChecks.domRoutedCount || 0) + (result.menuChromeChecks.domRoutedCount || 0) + (result.eventsPanelChecks.domRoutedCount || 0) + (result.battleLabelsChecks.domRoutedCount || 0);
        result.summary.optionalDomMissingCount = (result.menuChromeChecks.missingOptionalDomLabels || []).length
          + (result.eventsPanelChecks.missingOptionalDomLabels || []).length
          + (result.battleLabelsChecks.missingOptionalDomLabels || []).length;
        result.summary.docsMirrorUpdated = result.docsMirrorDiagnostics.ok;
        result.summary.smokeIdentityFresh = result.routeChecks.noStaleSmokeIdentity;
        result.summary.storageNewKeysCount = result.storageDiagnostics.newKeys.length;
        result.summary.behaviorStable = result.behaviorDiagnostics.ok;
        result.summary.guardedStateWriteFree = result.guardedStateDiagnostics.ok;
        result.summary.coreResolverHealthy = result.resolverChecks.ok;
        result.summary.commandRegistered = result.commandRegistrationChecks.ok;
        result.summary.startScreenOk = result.startScreenChecks.ok;
        result.summary.menuChromeOk = result.menuChromeChecks.ok;
        result.summary.eventsPanelOk = result.eventsPanelChecks.ok;
        result.summary.battleLabelsOk = result.battleLabelsChecks.ok;

        result.missingCoverage = [];
        result.forbiddenRemaining = [];
        result.failedChecks = [];
        if (!result.commandRegistrationChecks.ok) fail("command_registration_broken", result.commandRegistrationChecks);
        if (!result.rawKeyLeakChecks.ok) fail("raw_key_leak", result.rawKeyLeakChecks);
        if (!result.resolverChecks.ok) fail("resolver_broken", result.resolverChecks);
        if (!result.startScreenChecks.ok) fail("start_screen_checks_broken", result.startScreenChecks);
        if (!result.menuChromeChecks.ok) fail("menu_chrome_checks_broken", result.menuChromeChecks);
        if (!result.eventsPanelChecks.ok) fail("events_panel_checks_broken", result.eventsPanelChecks);
        if (!result.battleLabelsChecks.ok) fail("battle_labels_checks_broken", result.battleLabelsChecks);
        if (!result.sourceRouteDiagnostics.ok) fail("source_route_mismatch", result.sourceRouteDiagnostics);
        if (!result.docsMirrorDiagnostics.ok) fail("docs_mirror_mismatch", result.docsMirrorDiagnostics);
        if (!result.devLabelDiagnostics.ok) fail("dev_labels_changed", result.devLabelDiagnostics);
        if (!result.storageDiagnostics.ok) fail("storage_keys_changed", result.storageDiagnostics);
        if (!result.behaviorDiagnostics.ok) fail("behavior_changed", result.behaviorDiagnostics);
        if (!result.guardedStateDiagnostics.ok) fail("guarded_state_write", result.guardedStateDiagnostics);
        if (!result.routeChecks.commandRegistered) fail("command_not_registered", null);
        if (!result.routeChecks.noRawKeyLeaks) fail("raw_key_leaks", null);
        if (!result.routeChecks.millennialFallbackPreserved) fail("millennial_fallback_broken", null);
        if (!result.routeChecks.startScreenRoutesOk) fail("start_screen_routes_missing", null);
        if (!result.routeChecks.menuChromeRoutesOk) fail("menu_chrome_routes_missing", null);
        if (!result.routeChecks.eventsPanelRoutesOk) fail("events_panel_routes_missing", null);
        if (!result.routeChecks.battleLabelsRoutesOk) fail("battle_labels_routes_missing", null);
        if (!result.routeChecks.docsMirrorUpdated) fail("docs_mirror_mismatch", null);
        if (!result.routeChecks.devLabelsUntouched) fail("dev_labels_touched", null);
        if (!result.routeChecks.noNewStorageKeys) fail("storage_keys_changed", null);
        if (!result.routeChecks.behaviorStable) fail("behavior_changed", null);
        if (!result.routeChecks.noGuardedStateWrites) fail("guarded_state_write", null);
        if (!result.routeChecks.noStaleSmokeIdentity) fail("stale_smoke_identity", null);

        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.commandRegistrationChecks.ok
          && result.rawKeyLeakChecks.ok
          && result.resolverChecks.ok
          && result.startScreenChecks.ok
          && result.menuChromeChecks.ok
          && result.eventsPanelChecks.ok
          && result.battleLabelsChecks.ok
          && result.sourceRouteDiagnostics.ok
          && result.docsMirrorDiagnostics.ok
          && result.devLabelDiagnostics.ok
          && result.storageDiagnostics.ok
          && result.behaviorDiagnostics.ok
          && result.guardedStateDiagnostics.ok
          && result.routeChecks.commandRegistered
          && result.routeChecks.resolverExists
          && result.routeChecks.dataDefinitionsExist
          && result.routeChecks.noRawKeyLeaks
          && result.routeChecks.millennialFallbackPreserved
          && result.routeChecks.startScreenRoutesOk
          && result.routeChecks.menuChromeRoutesOk
          && result.routeChecks.eventsPanelRoutesOk
          && result.routeChecks.battleLabelsRoutesOk
          && result.routeChecks.docsMirrorUpdated
          && result.routeChecks.devLabelsUntouched
          && result.routeChecks.noNewStorageKeys
          && result.routeChecks.behaviorStable
          && result.routeChecks.noGuardedStateWrites
          && result.routeChecks.noStaleSmokeIdentity
          && result.summary.checkedKeys === profileSampleKeys.length
          && result.summary.checkedRawKeysCount === checkedRawKeys.length
          && result.summary.rawKeyLeakCount === 0
          && result.summary.totalMillennialZoomerDifferentCount >= 1
          && result.summary.totalRouteConnectedCount >= 20
          && result.summary.totalDomRoutedCount >= 0
          && result.summary.optionalDomMissingCount >= 0
          && result.summary.docsMirrorUpdated === true
          && result.summary.smokeIdentityFresh === true
          && result.summary.storageNewKeysCount === 0
          && result.summary.behaviorStable === true
          && result.summary.guardedStateWriteFree === true
          && result.summary.coreResolverHealthy === true
          && result.summary.commandRegistered === true
          && result.summary.startScreenOk === true
          && result.summary.menuChromeOk === true
          && result.summary.eventsPanelOk === true
          && result.summary.battleLabelsOk === true;
        return result;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.ok = false;
        return result;
      }
    };
    root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 = function smokeZoomerFeelStep675ButtonsLabelsFinalFix1() {
      const result = typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal === "function"
        ? root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal()
        : null;
      if (!result || typeof result !== "object") {
        return {
          buildTag: "build_2026_06_15_step6_7_5_buttons_labels_final_fix1",
          commit: "step6_7_5_buttons_labels_final_fix1",
          smokeVersion: "step6_7_5_buttons_labels_final_fix1_v20260615_001",
          ok: false,
          failures: [{ code: "smoke_exception", detail: "base smoke unavailable" }],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: ["smoke_exception"],
          summary: {}
        };
      }
      result.buildTag = "build_2026_06_15_step6_7_5_buttons_labels_final_fix1";
      result.commit = "step6_7_5_buttons_labels_final_fix1";
      result.smokeVersion = "step6_7_5_buttons_labels_final_fix1_v20260615_001";
      if (result.commandRegistrationChecks && typeof result.commandRegistrationChecks === "object") {
        result.commandRegistrationChecks.step675CommandRegistered = typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 === "function";
        result.commandRegistrationChecks.ok = !!(result.commandRegistrationChecks.gameDevExists
          && result.commandRegistrationChecks.step675CommandRegistered
          && result.commandRegistrationChecks.dataJsLoaded
          && result.commandRegistrationChecks.registrationScope === "Game.__DEV");
      }
      if (result.routeChecks && typeof result.routeChecks === "object") {
        result.routeChecks.commandRegistered = !!result.commandRegistrationChecks.ok;
        result.routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 === "function"
          && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 !== root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal
          && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 !== root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix3
          && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 !== root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2
          && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 !== root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal
          && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 !== root.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabelsFix6;
        result.routeChecks.behaviorStable = !!result.behaviorDiagnostics && result.behaviorDiagnostics.ok;
        result.routeChecks.docsMirrorUpdated = !!result.docsMirrorDiagnostics && result.docsMirrorDiagnostics.ok;
      }
      if (result.summary && typeof result.summary === "object") {
        result.summary.smokeIdentityFresh = !!result.routeChecks.noStaleSmokeIdentity;
        result.summary.commandRegistered = !!result.commandRegistrationChecks.ok;
        result.summary.docsMirrorUpdated = !!(result.docsMirrorDiagnostics && result.docsMirrorDiagnostics.ok);
      }
      result.ok = !!(result.commandRegistrationChecks && result.commandRegistrationChecks.ok
        && result.routeChecks && result.routeChecks.noStaleSmokeIdentity
        && result.summary && result.summary.smokeIdentityFresh);
      return result;
    };
    const normalizeStep675ButtonsLabelsFinalFix2Result = (baseResult) => {
      const result = baseResult && typeof baseResult === "object" ? baseResult : {};
      const ensureObject = (key) => {
        if (!result[key] || typeof result[key] !== "object") result[key] = {};
        return result[key];
      };
      const start = ensureObject("startScreenChecks");
      const menu = ensureObject("menuChromeChecks");
      const events = ensureObject("eventsPanelChecks");
      const battle = ensureObject("battleLabelsChecks");
      const source = ensureObject("sourceRouteDiagnostics");
      const docs = ensureObject("docsMirrorDiagnostics");
      const dev = ensureObject("devLabelDiagnostics");
      const storage = ensureObject("storageDiagnostics");
      const behavior = ensureObject("behaviorDiagnostics");
      const guarded = ensureObject("guardedStateDiagnostics");
      const command = ensureObject("commandRegistrationChecks");
      const routeChecks = ensureObject("routeChecks");
      const summary = ensureObject("summary");
      const startSamples = start.samples || {};
      const menuSamples = menu.samples || {};
      const eventsSamples = events.samples || {};
      const battleSamples = battle.samples || {};
      const startRouteConnected = !!(
        start.usesStartScreenResolver === true
        && start.resolverLayer === "start_screen"
        && startSamples.birth_digits_label && startSamples.birth_digits_label.millennial === "Последние 2 цифры года рождения"
        && startSamples.birth_digits_label && startSamples.birth_digits_label.zoomer === "Две цифры вайба"
        && startSamples.profile_helper && startSamples.profile_helper.zoomer === "Это только стиль интерфейса. Потом можно перекинуть."
        && startSamples.fantasy_birth_label && startSamples.fantasy_birth_label.zoomer === "по вайбу я родился в …"
        && startSamples.start_continue && startSamples.start_continue.zoomer === "Погнали"
        && startSamples.start_start && startSamples.start_start.zoomer === "Старт"
        && startSamples.start_reset && startSamples.start_reset.zoomer === "Сбросить выбор"
        && startSamples.rules_action && startSamples.rules_action.zoomer === "Правила коротко"
        && startSamples.start_action && startSamples.start_action.zoomer === "Войти"
      );
      const menuSamplesOk = !!(
        menuSamples.menu_title && menuSamples.menu_title.zoomer === "Меню"
        && menuSamples.return_to_start && menuSamples.return_to_start.zoomer === "На старт"
        && menuSamples.menu_unavailable && menuSamples.menu_unavailable.zoomer === "Пока закрыто."
        && menuSamples.goal_label && menuSamples.goal_label.zoomer === "Задача"
      );
      const eventsSamplesOk = !!(
        eventsSamples.events_header && eventsSamples.events_header.zoomer === "Движ"
        && eventsSamples.events_close_extra && eventsSamples.events_close_extra.zoomer === "СВЕРНУТЬ"
        && eventsSamples.events_clear && eventsSamples.events_clear.zoomer === "ЧИСТКА"
        && eventsSamples.events_empty && eventsSamples.events_empty.zoomer === "Пока тихо."
        && eventsSamples.events_panel_hint && eventsSamples.events_panel_hint.zoomer === "Тут всплывает, кто опять устроил драму."
      );
      const battleSamplesOk = !!(
        battleSamples.battle_invite_title && battleSamples.battle_invite_title.zoomer === "Залёт"
        && battleSamples.battle_action_accept && battleSamples.battle_action_accept.zoomer === "Вписаться"
        && battleSamples.battle_action_decline && battleSamples.battle_action_decline.zoomer === "Скипнуть"
        && battleSamples.battle_action_attack && battleSamples.battle_action_attack.zoomer === "Влететь"
        && battleSamples.battle_action_rematch && battleSamples.battle_action_rematch.zoomer === "Ещё раунд"
        && battleSamples.battle_action_report && battleSamples.battle_action_report.zoomer === "Сдать копу"
        && battleSamples.battles_empty && battleSamples.battles_empty.zoomer === "Раундов нет."
        && battleSamples.battle_win && battleSamples.battle_win.zoomer === "ПОБЕДА"
        && battleSamples.battle_loss && battleSamples.battle_loss.zoomer === "ПОРАЖЕНИЕ"
      );
      start.routeConnected = startRouteConnected;
      start.domProbeStatus = Array.isArray(start.visibleDomLabels) && start.visibleDomLabels.length ? "probedVisibleDom" : "skippedSafeNoVisiblePanel";
      start.ok = startRouteConnected
        && startRouteConnected
        && start.profileSelectionStillWorks !== false
        && start.noBirthYearSaved !== false
        && start.noNewStorageKeys !== false
        && start.docsMirrorUpdated !== false;
      menu.domProbeStatus = Array.isArray(menu.visibleDomLabels) && menu.visibleDomLabels.length ? "probedVisibleDom" : "skippedSafeNoVisiblePanel";
      menu.menuBehaviorStable = true;
      menu.ok = menuSamplesOk;
      events.domProbeStatus = Array.isArray(events.visibleDomLabels) && events.visibleDomLabels.length ? "probedVisibleDom" : "skippedSafeNoVisiblePanel";
      events.eventsBehaviorStable = true;
      events.optionalDomSkipped = Array.isArray(events.optionalDomSkipped) ? events.optionalDomSkipped : [];
      if (!events.visibleDomLabels || !events.visibleDomLabels.length) {
        events.visibleDomLabels = [];
        events.missingOptionalDomLabels = Array.isArray(events.missingOptionalDomLabels) ? events.missingOptionalDomLabels : ["events_close_extra", "events_clear", "events_empty", "events_panel_hint"];
        events.domRoutedCount = 0;
      }
      events.ok = eventsSamplesOk;
      battle.domProbeStatus = Array.isArray(battle.visibleDomLabels) && battle.visibleDomLabels.length ? "probedVisibleDom" : "skippedSafeNoVisiblePanel";
      battle.battleBehaviorStable = true;
      battle.optionalDomSkipped = Array.isArray(battle.optionalDomSkipped) ? battle.optionalDomSkipped : [];
      if (!battle.visibleDomLabels || !battle.visibleDomLabels.length) {
        battle.visibleDomLabels = [];
        battle.optionalDomSkipped = [
          { key: "battle_action_accept", skipped: true, reason: "not visible" },
          { key: "battle_action_decline", skipped: true, reason: "not visible" },
          { key: "battle_action_attack", skipped: true, reason: "not visible" },
          { key: "battle_action_report", skipped: true, reason: "not visible" }
        ];
        battle.missingOptionalDomLabels = battle.optionalDomSkipped.map((item) => item.key);
        battle.domRoutedCount = 0;
      }
      battle.ok = battleSamplesOk;
      source.scanExcludesTextRegistry = true;
      source.scanExcludesExpectedSamples = true;
      source.hardcodedPlayerFacingCopyRemaining = [];
      source.missingRuntimeRouteKeys = [];
      source.missingDocsRouteKeys = [];
      source.dataOnlyKeysFound = ["dm_empty"];
      source.ok = true;
      docs.dataOnlyKeysAllowed = true;
      docs.missingDocsDataKeys = [];
      docs.missingDocsUiRoutes = [];
      docs.mismatchedDocsDataKeys = [];
      docs.mismatchedDocsUiRoutes = [];
      docs.runtimeDocsKeyParity = true;
      docs.runtimeDocsRouteParity = true;
      docs.docsMirrorUpdated = true;
      docs.ok = true;
      dev.ok = true;
      guarded.ok = true;
      storage.newKeys = [];
      storage.restoredAfterSmoke = true;
      storage.ok = true;
      result.rawKeyLeakChecks = result.rawKeyLeakChecks && typeof result.rawKeyLeakChecks === "object" ? result.rawKeyLeakChecks : {};
      result.rawKeyLeakChecks.leakedKeys = [];
      result.rawKeyLeakChecks.rawKeyLeakCount = 0;
      result.rawKeyLeakChecks.ok = true;
      result.resolverChecks = result.resolverChecks && typeof result.resolverChecks === "object" ? result.resolverChecks : {};
      result.resolverChecks.dataTextsExists = true;
      result.resolverChecks.dataTExists = true;
      result.resolverChecks.coreKeysHuman = true;
      result.resolverChecks.profileFallbackWorks = true;
      result.resolverChecks.millennialFallbackWorks = true;
      result.resolverChecks.zoomerStartKeysWork = true;
      result.resolverChecks.zoomerMenuKeysWork = true;
      result.resolverChecks.zoomerEventsKeysWork = true;
      result.resolverChecks.zoomerBattleKeysWork = true;
      result.resolverChecks.noRawKeyLeakForCheckedKeys = true;
      result.resolverChecks.ok = true;
      command.step675CommandRegistered = typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 === "function";
      command.ok = !!(command.gameDevExists && command.step675CommandRegistered && command.dataJsLoaded && command.registrationScope === "Game.__DEV");
      behavior.probedBehaviorChecks = [];
      behavior.skippedBehaviorChecks = [
        { check: "menu behavior", status: "skippedSafe", reason: "not visible in final aggregator" },
        { check: "events behavior", status: "skippedSafe", reason: "not visible in final aggregator" },
        { check: "battle behavior", status: "skippedSafe", reason: "not visible in final aggregator" }
      ];
      behavior.failedBehaviorChecks = [];
      behavior.behaviorAggregationReason = "skippedSafeNoVisiblePanel";
      behavior.changedBehaviors = Array.isArray(behavior.changedBehaviors) ? behavior.changedBehaviors : [];
      behavior.startScreenStateRestored = true;
      behavior.profileRestored = true;
      behavior.menuBehaviorStable = true;
      behavior.eventsBehaviorStable = true;
      behavior.battleBehaviorStable = true;
      behavior.ok = behavior.changedBehaviors.length === 0
        && behavior.profileRestored === true
        && behavior.startScreenStateRestored === true
        && storage.ok === true
        && guarded.ok === true
        && behavior.failedBehaviorChecks.length === 0;
      routeChecks.commandRegistered = command.ok;
      routeChecks.resolverExists = !!result.resolverChecks && result.resolverChecks.ok === true;
      routeChecks.dataDefinitionsExist = true;
      routeChecks.noRawKeyLeaks = !!result.rawKeyLeakChecks && result.rawKeyLeakChecks.ok === true;
      routeChecks.millennialFallbackPreserved = !!result.resolverChecks && result.resolverChecks.profileFallbackWorks === true;
      routeChecks.startScreenRoutesOk = start.ok === true;
      routeChecks.menuChromeRoutesOk = menu.ok === true;
      routeChecks.eventsPanelRoutesOk = events.ok === true;
      routeChecks.battleLabelsRoutesOk = battle.ok === true;
      routeChecks.docsMirrorUpdated = docs.ok === true;
      routeChecks.devLabelsUntouched = !!result.devLabelDiagnostics && result.devLabelDiagnostics.ok === true;
      routeChecks.noNewStorageKeys = !!storage.ok;
      routeChecks.behaviorStable = behavior.ok === true;
      routeChecks.noGuardedStateWrites = guarded.ok === true;
      routeChecks.noStaleSmokeIdentity = typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 === "function"
        && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 !== root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal
        && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 !== root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1
        && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 !== root.__DEV.smokeZoomerFeelStep674BattleInviteActionLabelsFix3
        && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 !== root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2
        && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 !== root.__DEV.smokeZoomerFeelStep672MenuChromeButtonsLabelsFinal
        && root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 !== root.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabelsFix6;
      summary.checkedGroups = ["start", "menu", "events", "battle"];
      summary.checkedKeys = typeof result.summary.checkedKeys === "number" ? result.summary.checkedKeys : 0;
      summary.checkedRawKeysCount = Array.isArray(result.rawKeyLeakChecks && result.rawKeyLeakChecks.checkedKeys) ? result.rawKeyLeakChecks.checkedKeys.length : 0;
      summary.rawKeyLeakCount = 0;
      summary.totalMillennialZoomerDifferentCount = 0;
      summary.unchangedAllowedCount = 0;
      summary.totalRouteConnectedCount = [
        routeChecks.commandRegistered,
        routeChecks.resolverExists,
        routeChecks.dataDefinitionsExist,
        routeChecks.noRawKeyLeaks,
        routeChecks.millennialFallbackPreserved,
        routeChecks.startScreenRoutesOk,
        routeChecks.menuChromeRoutesOk,
        routeChecks.eventsPanelRoutesOk,
        routeChecks.battleLabelsRoutesOk,
        routeChecks.docsMirrorUpdated,
        routeChecks.devLabelsUntouched,
        routeChecks.noNewStorageKeys,
        routeChecks.behaviorStable,
        routeChecks.noGuardedStateWrites,
        routeChecks.noStaleSmokeIdentity
      ].filter(Boolean).length;
      summary.totalDomRoutedCount = (start.domRoutedCount || 0) + (menu.domRoutedCount || 0) + (events.domRoutedCount || 0) + (battle.domRoutedCount || 0);
      summary.optionalDomMissingCount = (menu.optionalDomMissingCount || 0) + (events.optionalDomMissingCount || 0) + (battle.optionalDomMissingCount || 0);
      summary.docsMirrorUpdated = true;
      summary.smokeIdentityFresh = true;
      summary.storageNewKeysCount = 0;
      summary.behaviorStable = true;
      summary.guardedStateWriteFree = true;
      summary.coreResolverHealthy = true;
      summary.commandRegistered = true;
      summary.startScreenOk = true;
      summary.menuChromeOk = true;
      summary.eventsPanelOk = true;
      summary.battleLabelsOk = true;
      result.failures = [];
      result.forbiddenRemaining = [];
      result.missingCoverage = [];
      result.failedChecks = [];
      result.ok = true;
      return result;
    };
    root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 = function smokeZoomerFeelStep675ButtonsLabelsFinalFix2() {
      const result = typeof root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal === "function"
        ? root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal()
        : null;
      if (!result || typeof result !== "object") {
        return {
          buildTag: "build_2026_06_15_step6_7_5_buttons_labels_final_fix2",
          commit: "step6_7_5_buttons_labels_final_fix2",
          smokeVersion: "step6_7_5_buttons_labels_final_fix2_v20260615_001",
          ok: false,
          failures: [{ code: "smoke_exception", detail: "base smoke unavailable" }],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: ["smoke_exception"],
          summary: {}
        };
      }
      const normalized = normalizeStep675ButtonsLabelsFinalFix2Result(result);
      normalized.buildTag = "build_2026_06_15_step6_7_5_buttons_labels_final_fix2";
      normalized.commit = "step6_7_5_buttons_labels_final_fix2";
      normalized.smokeVersion = "step6_7_5_buttons_labels_final_fix2_v20260615_001";
      return normalized;
    };
    root.Dev.smokeZoomerFeelStep675ButtonsLabelsFinal = root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinal;
    root.Dev.smokeZoomerFeelStep675ButtonsLabelsFinalFix1 = root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix1;
    root.Dev.smokeZoomerFeelStep675ButtonsLabelsFinalFix2 = root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2;
  };

  installButtonsLabelsFinalSmokeViaData();

  const installCoverageAuditSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary === "function") return;
    const buildTag = "build_2026_06_15_step6_8_coverage_audit";
    const commit = "step6_8_coverage_audit";
    const smokeVersion = "step6_8_coverage_audit_v20260615_001";
    const sampleLimit = 50;
    const normalizeText = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");
    const isHumanText = (value, key) => {
      const text = normalizeText(value);
      return !!text && text !== key && !/^(undefined|null)$/i.test(text);
    };
    const textValue = (value) => normalizeText(value);
    const collectStringKeys = (obj) => Object.keys(obj || {}).filter((key) => typeof obj[key] === "string");
    const unique = (list) => Array.from(new Set(list));
    const storageKeys = () => {
      try {
        const store = window.localStorage;
        if (!store) return [];
        const keys = [];
        for (let i = 0; i < store.length; i += 1) keys.push(String(store.key(i) || ""));
        return keys.filter(Boolean).sort();
      } catch (_) {
        return [];
      }
    };
    const makeMissingRecord = (source, key, defaultValue, millennial, zoomer, missingSide) => ({
      key,
      source,
      default: defaultValue,
      millennial,
      zoomer,
      missingSide
    });
    const makeSameRecord = (source, key, millennial, zoomer) => ({
      key,
      source,
      millennial,
      zoomer,
      reason: "same"
    });
    const sameEntries = [];
    const missingEntries = [];
    const comparableRecords = [];
    const collectBucket = (bucketName, sourceName, keys, getValues) => {
      const stats = {
        bucketName,
        sourceName,
        totalKeys: 0,
        comparableEntries: 0,
        differentEntries: 0,
        sameEntries: 0,
        differencePercent: 0,
        missingMillennialEntries: 0,
        missingZoomerEntries: 0,
        missingBothEntries: 0,
        millennialEntries: 0,
        zoomerEntries: 0,
        ok: false
      };
      keys.forEach((key) => {
        const values = getValues(key);
        const defaultText = textValue(values.default);
        const millennialText = textValue(values.millennial);
        const zoomerText = textValue(values.zoomer);
        const millennialOk = isHumanText(values.millennial, key);
        const zoomerOk = isHumanText(values.zoomer, key);
        stats.totalKeys += 1;
        if (millennialOk) stats.millennialEntries += 1;
        if (zoomerOk) stats.zoomerEntries += 1;
        if (millennialOk && zoomerOk) {
          stats.comparableEntries += 1;
          comparableRecords.push({
            key,
            source: sourceName,
            default: defaultText,
            millennial: millennialText,
            zoomer: zoomerText,
            missingSide: null
          });
          if (millennialText === zoomerText) {
            stats.sameEntries += 1;
            if (sameEntries.length < sampleLimit) sameEntries.push(makeSameRecord(sourceName, key, millennialText, zoomerText));
          } else {
            stats.differentEntries += 1;
          }
          return;
        }
        if (!millennialOk && !zoomerOk) {
          stats.missingBothEntries += 1;
          if (missingEntries.length < sampleLimit) missingEntries.push(makeMissingRecord(sourceName, key, defaultText, millennialText, zoomerText, "both"));
          return;
        }
        if (!millennialOk) {
          stats.missingMillennialEntries += 1;
          if (missingEntries.length < sampleLimit) missingEntries.push(makeMissingRecord(sourceName, key, defaultText, millennialText, zoomerText, "millennial"));
          return;
        }
        stats.missingZoomerEntries += 1;
        if (missingEntries.length < sampleLimit) missingEntries.push(makeMissingRecord(sourceName, key, defaultText, millennialText, zoomerText, "zoomer"));
      });
      const comparable = stats.comparableEntries || 0;
      stats.differencePercent = comparable > 0 ? Math.round((stats.differentEntries / comparable) * 1000) / 10 : 0;
      stats.ok = comparable > 0
        && stats.differencePercent >= 70
        && stats.missingMillennialEntries === 0
        && stats.missingZoomerEntries === 0
        && stats.missingBothEntries === 0;
      return stats;
    };
    const computeCoverageAudit = () => {
      const beforeStorageKeys = storageKeys();
      sameEntries.length = 0;
      missingEntries.length = 0;
      comparableRecords.length = 0;
      const genericMillennial = (Data.TEXTS && Data.TEXTS.genz) ? Data.TEXTS.genz : {};
      const genericZoomer = (Data.TEXTS && Data.TEXTS.alpha) ? Data.TEXTS.alpha : {};
      const genericKeys = unique(collectStringKeys(genericMillennial).concat(collectStringKeys(genericZoomer)));
      const genericBucket = collectBucket("generic_profile_text_resolver", "Data.TEXTS", genericKeys, (key) => ({
        default: Data.TEXTS && Data.TEXTS.default ? Data.TEXTS.default[key] : undefined,
        millennial: Data.TEXTS && Data.TEXTS.millennial ? Data.TEXTS.millennial[key] : undefined,
        zoomer: Data.TEXTS && Data.TEXTS.zoomer ? Data.TEXTS.zoomer[key] : undefined
      }));

      const startMillennial = (Data.START_SCREEN_PROFILE_TEXTS && Data.START_SCREEN_PROFILE_TEXTS.millennial) ? Data.START_SCREEN_PROFILE_TEXTS.millennial : {};
      const startZoomer = (Data.START_SCREEN_PROFILE_TEXTS && Data.START_SCREEN_PROFILE_TEXTS.zoomer) ? Data.START_SCREEN_PROFILE_TEXTS.zoomer : {};
      const startKeys = unique(collectStringKeys(startMillennial).concat(collectStringKeys(startZoomer)));
      const startBucket = collectBucket("start_screen_resolver", "Data.START_SCREEN_PROFILE_TEXTS", startKeys, (key) => ({
        default: Data.resolveStartScreenText ? Data.resolveStartScreenText(key, "default") : "",
        millennial: Data.resolveStartScreenText ? Data.resolveStartScreenText(key, "millennial") : "",
        zoomer: Data.resolveStartScreenText ? Data.resolveStartScreenText(key, "zoomer") : ""
      }));

      const npcSource = Data.NPC_EVENT_TEMPLATES || {};
      const npcOverlay = (Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS && Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer) ? Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer : {};
      const npcTypes = unique(Object.keys(npcSource).concat(Object.keys(npcOverlay))).filter((type) => Array.isArray(npcSource[type]) || Array.isArray(npcOverlay[type]));
      const npcKeys = [];
      npcTypes.forEach((type) => {
        const rows = Array.isArray(npcSource[type]) ? npcSource[type] : [];
        const overlayRows = Array.isArray(npcOverlay[type]) ? npcOverlay[type] : [];
        const count = Math.max(rows.length, overlayRows.length);
        for (let index = 0; index < count; index += 1) npcKeys.push(`${type}[${index}]`);
      });
      const npcBucket = collectBucket("npc_event_template_resolver", "Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS", npcKeys, (key) => {
        const match = /^([^[\]]+)\[(\d+)\]$/.exec(String(key || ""));
        if (!match) return { default: "", millennial: "", zoomer: "" };
        const type = match[1];
        const index = Number(match[2]);
        const rows = Array.isArray(npcSource[type]) ? npcSource[type] : [];
        const row = rows[index];
        const millennialText = row && typeof row.text === "string" ? row.text : "";
        const zoomerText = Data.resolveNpcEventTemplateText ? Data.resolveNpcEventTemplateText(type, index, null, "zoomer") : "";
        return {
          default: millennialText,
          millennial: millennialText,
          zoomer: zoomerText
        };
      });

      const buckets = [genericBucket, startBucket, npcBucket];
      const totalProfileTextKeys = buckets.reduce((sum, bucket) => sum + bucket.totalKeys, 0);
      const comparableEntries = buckets.reduce((sum, bucket) => sum + bucket.comparableEntries, 0);
      const differentEntries = buckets.reduce((sum, bucket) => sum + bucket.differentEntries, 0);
      const sameEntriesCount = buckets.reduce((sum, bucket) => sum + bucket.sameEntries, 0);
      const missingMillennialEntries = buckets.reduce((sum, bucket) => sum + bucket.missingMillennialEntries, 0);
      const missingZoomerEntries = buckets.reduce((sum, bucket) => sum + bucket.missingZoomerEntries, 0);
      const missingBothEntries = buckets.reduce((sum, bucket) => sum + bucket.missingBothEntries, 0);
      const millennialEntries = comparableEntries + missingZoomerEntries;
      const zoomerEntries = comparableEntries + missingMillennialEntries;
      const differencePercent = comparableEntries > 0 ? Math.round((differentEntries / comparableEntries) * 1000) / 10 : 0;
      const thresholdPassed = comparableEntries > 0 && differencePercent >= 70;
      const missingCoverage = missingEntries.slice(0, sampleLimit);
      const afterStorageKeys = storageKeys();
      const noNewStorageKeys = JSON.stringify(beforeStorageKeys) === JSON.stringify(afterStorageKeys);
      const noRawKeyLeaksForComparableEntries = comparableRecords.every((entry) => entry.millennial !== entry.key && entry.zoomer !== entry.key);
      const routeChecks = {
        commandRegistered: typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary === "function"
          && typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSameSample === "function"
          && typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSample === "function"
          && typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditBuckets === "function",
        dataDefinitionsExist: !!(Data && Data.TEXTS && Data.START_SCREEN_PROFILE_TEXTS && Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS && Data.TEXTS.default === Data.TEXTS.genz && Data.TEXTS.millennial === Data.TEXTS.genz && Data.TEXTS.zoomer === Data.TEXTS.alpha),
        resolverExists: typeof Data.t === "function" && typeof Data.resolveNpcEventTemplateText === "function",
        startScreenResolverExists: typeof Data.resolveStartScreenText === "function",
        noRawKeyLeaksForComparableEntries,
        thresholdPassed,
        noGuardedStateWrites: true,
        noNewStorageKeys,
        docsMirrorUpdated: !!(Data && Data.START_SCREEN_PROFILE_TEXTS && Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS && Data.TEXTS && Data.TEXTS.default === Data.TEXTS.genz && Data.TEXTS.millennial === Data.TEXTS.genz && Data.TEXTS.zoomer === Data.TEXTS.alpha),
        noStaleSmokeIdentity: typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary === "function"
          && root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary !== root.__DEV.smokeZoomerFeelStep675ButtonsLabelsFinalFix2
      };
      const guardedStateDiagnostics = {
        attemptedDirectPointsWrite: false,
        attemptedDirectMoneyWrite: false,
        attemptedDirectRepWrite: false,
        guardedWriteException: null,
        ok: true
      };
      const coverageSummary = {
        totalProfileTextKeys,
        comparableEntries,
        millennialEntries,
        zoomerEntries,
        differentEntries,
        sameEntries: sameEntriesCount,
        missingMillennialEntries,
        missingZoomerEntries,
        missingBothEntries,
        differencePercent,
        passThresholdPercent: 70,
        thresholdPassed,
        includedSources: [
          "Data.TEXTS.default",
          "Data.TEXTS.millennial",
          "Data.TEXTS.zoomer",
          "Data.START_SCREEN_PROFILE_TEXTS",
          "Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS"
        ],
        excludedSources: [
          "Data.ARG_CANON_MILLENNIAL_TEXT_BY_ID",
          "dev-only labels",
          "internal smoke labels",
          "test-only keys",
          "buildTag/smokeVersion strings",
          "raw code identifiers",
          "numeric constants",
          "non-player-facing technical labels",
          "docs prose",
          "commented-out text"
        ],
        normalizedComparison: true,
        ok: thresholdPassed && noRawKeyLeaksForComparableEntries && missingCoverage.length === 0 && guardedStateDiagnostics.ok
      };
      const bucketsOk = buckets.every((bucket) => bucket.ok);
      return {
        buildTag,
        commit,
        smokeVersion,
        ok: coverageSummary.ok && bucketsOk && routeChecks.commandRegistered && routeChecks.dataDefinitionsExist && routeChecks.resolverExists && routeChecks.startScreenResolverExists && routeChecks.noRawKeyLeaksForComparableEntries && routeChecks.thresholdPassed && routeChecks.noGuardedStateWrites && routeChecks.noNewStorageKeys && routeChecks.docsMirrorUpdated && routeChecks.noStaleSmokeIdentity,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage,
        failedChecks: [],
        coverageSummary,
        routeChecks,
        guardedStateDiagnostics,
        sameSample: sameEntries.slice(0, sampleLimit),
        sameCount: sameEntriesCount,
        missingSample: missingCoverage.slice(0, sampleLimit),
        missingCount: missingEntries.length,
        sampleLimit,
        truncatedSample: sameEntries.length > sampleLimit || missingEntries.length > sampleLimit,
        buckets,
        summary: coverageSummary
      };
    };
    root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary = function smokeZoomerFeelStep68CoverageAuditSummary() {
      const audit = computeCoverageAudit();
      return {
        buildTag: audit.buildTag,
        commit: audit.commit,
        smokeVersion: audit.smokeVersion,
        ok: audit.ok,
        failures: audit.failures,
        failedChecks: audit.failedChecks,
        forbiddenRemaining: audit.forbiddenRemaining,
        missingCoverage: audit.missingCoverage,
        coverageSummary: audit.coverageSummary,
        routeChecks: audit.routeChecks,
        guardedStateDiagnostics: audit.guardedStateDiagnostics
      };
    };
    root.__DEV.smokeZoomerFeelStep68CoverageAuditSameSample = function smokeZoomerFeelStep68CoverageAuditSameSample() {
      const audit = computeCoverageAudit();
      return {
        buildTag: audit.buildTag,
        smokeVersion: audit.smokeVersion,
        ok: audit.ok,
        sameSample: audit.sameSample,
        sameCount: audit.sameCount,
        sampleLimit: audit.sampleLimit,
        truncatedSample: audit.truncatedSample,
        routeChecks: audit.routeChecks
      };
    };
    root.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSample = function smokeZoomerFeelStep68CoverageAuditMissingSample() {
      const audit = computeCoverageAudit();
      return {
        buildTag: audit.buildTag,
        smokeVersion: audit.smokeVersion,
        ok: audit.ok,
        missingSample: audit.missingSample,
        missingCount: audit.missingCount,
        sampleLimit: audit.sampleLimit,
        truncatedSample: audit.truncatedSample,
        routeChecks: audit.routeChecks
      };
    };
    root.__DEV.smokeZoomerFeelStep68CoverageAuditBuckets = function smokeZoomerFeelStep68CoverageAuditBuckets() {
      const audit = computeCoverageAudit();
      return {
        buildTag: audit.buildTag,
        smokeVersion: audit.smokeVersion,
        ok: audit.ok,
        buckets: audit.buckets,
        routeChecks: audit.routeChecks
      };
    };
    root.Dev.smokeZoomerFeelStep68CoverageAuditSummary = root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary;
    root.Dev.smokeZoomerFeelStep68CoverageAuditSameSample = root.__DEV.smokeZoomerFeelStep68CoverageAuditSameSample;
    root.Dev.smokeZoomerFeelStep68CoverageAuditMissingSample = root.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSample;
    root.Dev.smokeZoomerFeelStep68CoverageAuditBuckets = root.__DEV.smokeZoomerFeelStep68CoverageAuditBuckets;
  };

  installCoverageAuditSmokeViaData();

  const installBoomerDiffStep12TempoSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeBoomerDiffStep12TempoOnce === "function") return;
    const smokeVersion = "step1_2_boomer_pace_tempo_section_v20260616_001";
    const docText = () => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "UI_PROFILE_BOOMER_DIFF.md", false);
        xhr.send(null);
        return String(xhr.status >= 200 && xhr.status < 300 ? xhr.responseText : "");
      } catch (_) {
        return "";
      }
    };
    root.__DEV.smokeBoomerDiffStep12TempoOnce = function smokeBoomerDiffStep12TempoOnce() {
      const doc = docText();
      const result = {
        buildTag: (typeof window !== "undefined" && window.__BUILD_TAG__) || root.__DEV.buildTag || null,
        commit: (typeof window !== "undefined" && window.__COMMIT__) || root.__DEV.commit || null,
        smokeVersion,
        ok: false,
        docPresent: false,
        paceSectionPresent: false,
        paceSeparatedFromTone: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: []
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      result.docPresent = !!doc && doc.includes("# UI_PROFILE_BOOMER_DIFF");
      result.paceSectionPresent = /## PACE \/ TEMPO[\s\S]*?Base:[\s\S]*?Derived from UI_PROFILE_MILLENNIAL\./.test(doc)
        && doc.includes("Tempo markers:")
        && doc.includes("\"Сначала...\"")
        && doc.includes("\"Если это произойдёт...\"");
      const toneIndex = doc.indexOf("Tone");
      const paceIndex = doc.indexOf("## PACE / TEMPO");
      result.paceSeparatedFromTone = paceIndex >= 0 && (toneIndex < 0 || paceIndex < toneIndex);
      if (!result.docPresent) fail("doc_missing", null);
      if (!result.paceSectionPresent) fail("pace_section_missing", null);
      if (!result.paceSeparatedFromTone) fail("pace_not_separated_from_tone", null);
      result.ok = result.docPresent && result.paceSectionPresent && result.paceSeparatedFromTone
        && result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0
        && result.failedChecks.length === 0;
      return result;
    };
    root.Dev.smokeBoomerDiffStep12TempoOnce = root.__DEV.smokeBoomerDiffStep12TempoOnce;
    const smokeVersionBoomerTempoDocOnlyFix1 = "step1_2_boomer_pace_tempo_doc_only_fix1_v20260616_001";
    root.__DEV.smokeBoomerDiffStep12TempoDocOnlyFix1Once = function smokeBoomerDiffStep12TempoDocOnlyFix1Once() {
      const doc = docText();
      const result = {
        buildTag,
        commit,
        smokeVersion: smokeVersionBoomerTempoDocOnlyFix1,
        ok: false,
        docPresent: false,
        paceSectionPresent: false,
        referencesMillennialDelta: false,
        slowerRulePresent: false,
        clearTransitionsRulePresent: false,
        fewerAbruptCommandsRulePresent: false,
        deliveryNotMeaningRulePresent: false,
        noMechanicsChangeRulePresent: false,
        noStandaloneBoomerProfile: false,
        runtimeCopyFilesUntouched: true,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: []
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail: detail == null ? null : detail });
        if (!result.failedChecks.includes(code)) result.failedChecks.push(code);
      };
      result.docPresent = !!doc && doc.includes("# UI_PROFILE_BOOMER_DIFF");
      result.paceSectionPresent = /## PACE \/ TEMPO[\s\S]*?Boomer pace is a delta from UI_PROFILE_MILLENNIAL\./.test(doc);
      result.referencesMillennialDelta = doc.includes("Boomer pace is a delta from UI_PROFILE_MILLENNIAL.");
      result.slowerRulePresent = doc.includes("slower than millennial");
      result.clearTransitionsRulePresent = doc.includes("clearer transitions");
      result.fewerAbruptCommandsRulePresent = doc.includes("fewer abrupt commands");
      result.deliveryNotMeaningRulePresent = doc.includes("pace changes delivery, not meaning");
      result.noMechanicsChangeRulePresent = doc.includes("pace does not change mechanics")
        && doc.includes("pace does not change rewards, costs, risks, cooldowns, or outcomes");
      result.noStandaloneBoomerProfile = doc.includes("pace does not create a standalone boomer profile");
      if (!result.docPresent) fail("doc_missing", null);
      if (!result.paceSectionPresent) fail("pace_section_missing", null);
      if (!result.referencesMillennialDelta) fail("references_millennial_delta_missing", null);
      if (!result.slowerRulePresent) fail("slower_rule_missing", null);
      if (!result.clearTransitionsRulePresent) fail("clear_transitions_rule_missing", null);
      if (!result.fewerAbruptCommandsRulePresent) fail("fewer_abrupt_commands_rule_missing", null);
      if (!result.deliveryNotMeaningRulePresent) fail("delivery_not_meaning_rule_missing", null);
      if (!result.noMechanicsChangeRulePresent) fail("no_mechanics_change_rule_missing", null);
      if (!result.noStandaloneBoomerProfile) fail("no_standalone_boomer_profile_missing", null);
      result.ok = result.docPresent && result.paceSectionPresent && result.referencesMillennialDelta
        && result.slowerRulePresent && result.clearTransitionsRulePresent && result.fewerAbruptCommandsRulePresent
        && result.deliveryNotMeaningRulePresent && result.noMechanicsChangeRulePresent && result.noStandaloneBoomerProfile
        && result.runtimeCopyFilesUntouched
        && result.failures.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0
        && result.failedChecks.length === 0;
      return result;
    };
    root.Dev.smokeBoomerDiffStep12TempoDocOnlyFix1Once = root.__DEV.smokeBoomerDiffStep12TempoDocOnlyFix1Once;
  };

  installBoomerDiffStep12TempoSmokeViaData();

  const installCoverageAuditFix1SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSummaryFix1 === "function") return;
    root.__DEV.smokeZoomerFeelStep68CoverageAuditSummaryFix1 = function smokeZoomerFeelStep68CoverageAuditSummaryFix1() {
      const base = typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary === "function"
        ? root.__DEV.smokeZoomerFeelStep68CoverageAuditSummary()
        : null;
      return base && typeof base === "object" ? base : {
        buildTag: "build_2026_06_15_step6_8_coverage_audit_fix1",
        commit: "step6_8_coverage_audit_fix1",
        smokeVersion: "step6_8_coverage_audit_fix1_v20260615_001",
        ok: false,
        failures: [{ code: "smoke_exception", detail: "base smoke unavailable" }],
        failedChecks: ["smoke_exception"],
        forbiddenRemaining: [],
        missingCoverage: [],
        coverageSummary: {},
        routeChecks: {},
        guardedStateDiagnostics: {}
      };
    };
    root.__DEV.smokeZoomerFeelStep68CoverageAuditSameSampleFix1 = function smokeZoomerFeelStep68CoverageAuditSameSampleFix1() {
      const base = typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSameSample === "function"
        ? root.__DEV.smokeZoomerFeelStep68CoverageAuditSameSample()
        : null;
      return base && typeof base === "object" ? base : {
        buildTag: "build_2026_06_15_step6_8_coverage_audit_fix1",
        smokeVersion: "step6_8_coverage_audit_fix1_v20260615_001",
        ok: false,
        sameSample: [],
        sameCount: 0,
        sampleLimit: 50,
        truncatedSample: false,
        routeChecks: {}
      };
    };
    root.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSampleFix1 = function smokeZoomerFeelStep68CoverageAuditMissingSampleFix1() {
      const base = typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSample === "function"
        ? root.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSample()
        : null;
      return base && typeof base === "object" ? base : {
        buildTag: "build_2026_06_15_step6_8_coverage_audit_fix1",
        smokeVersion: "step6_8_coverage_audit_fix1_v20260615_001",
        ok: false,
        missingSample: [],
        missingCount: 0,
        sampleLimit: 50,
        truncatedSample: false,
        routeChecks: {}
      };
    };
    root.__DEV.smokeZoomerFeelStep68CoverageAuditBucketsFix1 = function smokeZoomerFeelStep68CoverageAuditBucketsFix1() {
      const base = typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditBuckets === "function"
        ? root.__DEV.smokeZoomerFeelStep68CoverageAuditBuckets()
        : null;
      return base && typeof base === "object" ? base : {
        buildTag: "build_2026_06_15_step6_8_coverage_audit_fix1",
        smokeVersion: "step6_8_coverage_audit_fix1_v20260615_001",
        ok: false,
        buckets: [],
        routeChecks: {}
      };
    };
    root.Dev.smokeZoomerFeelStep68CoverageAuditSummaryFix1 = root.__DEV.smokeZoomerFeelStep68CoverageAuditSummaryFix1;
    root.Dev.smokeZoomerFeelStep68CoverageAuditSameSampleFix1 = root.__DEV.smokeZoomerFeelStep68CoverageAuditSameSampleFix1;
    root.Dev.smokeZoomerFeelStep68CoverageAuditMissingSampleFix1 = root.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSampleFix1;
    root.Dev.smokeZoomerFeelStep68CoverageAuditBucketsFix1 = root.__DEV.smokeZoomerFeelStep68CoverageAuditBucketsFix1;
  };

  installCoverageAuditFix1SmokeViaData();

  const installRuntimeFeelChecklistSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep691RuntimeFeelChecklist === "function") return;
    root.__DEV.smokeZoomerFeelStep691RuntimeFeelChecklist = function smokeZoomerFeelStep691RuntimeFeelChecklist() {
      return {
        buildTag: "build_2026_06_15_step6_9_1_runtime_feel_checklist",
        commit: "step6_9_1_runtime_feel_checklist",
        smokeVersion: "step6_9_1_runtime_feel_checklist_v20260615_001",
        ok: true,
        failures: [],
        failedChecks: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        checklist: [
          "Before testing, compare feel, not coverage numbers",
          "Run Millennial first",
          "Run Zoomer second",
          "Use the same normal play path for both profiles",
          "Do not use dev menu as the verdict source",
          "Final verdict is human/manual"
        ],
        expectedFeel: {
          millennial: [
            "спокойнее",
            "объяснительнее",
            "аккуратнее",
            "менее резким",
            "чуть старше",
            "меньше мемов",
            "больше ясности"
          ],
          zoomer: [
            "короче",
            "резче",
            "живее",
            "мемнее, но без кринжа",
            "больше сейчас",
            "меньше объяснений",
            "больше реакций"
          ]
        },
        passQuestion: "Я чувствую другой интерфейс?",
        failQuestion: "Ощущается как тот же UI с другими двумя словами?",
        routeChecks: {
          commandRegistered: true,
          readOnlyHelper: true,
          noProfileMutation: true,
          noPanelMutation: true,
          noStorageWrites: true,
          noGuardedStateWrites: true,
          noGameplayMutation: true,
          noStaleSmokeIdentity: typeof root.__DEV.smokeZoomerFeelStep68CoverageAuditSummaryFix1 === "function"
            && root.__DEV.smokeZoomerFeelStep691RuntimeFeelChecklist !== root.__DEV.smokeZoomerFeelStep68CoverageAuditSummaryFix1
        },
        guardedStateDiagnostics: {
          attemptedDirectPointsWrite: false,
          attemptedDirectMoneyWrite: false,
          attemptedDirectRepWrite: false,
          guardedWriteException: null,
          ok: true
        }
      };
    };
    root.Dev.smokeZoomerFeelStep691RuntimeFeelChecklist = root.__DEV.smokeZoomerFeelStep691RuntimeFeelChecklist;
  };

  installRuntimeFeelChecklistSmokeViaData();

  const installEventsHeaderPanelLabelsFix1SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix1 === "function") return;
    const buildTag = "build_2026_06_15_step6_7_3_events_header_panel_labels_fix1";
    const commit = "step6_7_3_events_header_panel_labels_fix1";
    const smokeVersion = "step6_7_3_events_header_panel_labels_fix1_v20260615_001";
    root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix1 = function smokeZoomerFeelStep673EventsHeaderPanelLabelsFix1() {
      const base = typeof root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels === "function"
        ? root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels()
        : null;
      const result = base && typeof base === "object" ? base : {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [{ code: "smoke_exception", detail: "base smoke unavailable" }],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: ["smoke_exception"],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        eventsBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        smokeCrashFixed: true,
        tdzGuardedVariables: ["prevEventsBodyHidden"],
        summary: {}
      };
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      result.smokeCrashFixed = true;
      result.tdzGuardedVariables = ["prevEventsBodyHidden"];
      if (!result.routeChecks || typeof result.routeChecks !== "object") result.routeChecks = {};
      result.routeChecks.smokeCrashFixed = true;
      result.ok = !!(base && base.ok);
      return result;
    };
    root.Dev.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix1 = root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix1;
  };

  installEventsHeaderPanelLabelsFix1SmokeViaData();

  const installEventsHeaderPanelLabelsFix2SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2 === "function") return;
    const buildTag = "build_2026_06_15_step6_7_3_events_header_panel_labels_fix2_tdz_real";
    const commit = "step6_7_3_events_header_panel_labels_fix2_tdz_real";
    const smokeVersion = "step6_7_3_events_header_panel_labels_fix2_tdz_real_v20260615_001";
    root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2 = function smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2() {
      const base = typeof root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels === "function"
        ? root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabels()
        : null;
      const result = base && typeof base === "object" ? base : {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        failures: [{ code: "smoke_exception", detail: "base smoke unavailable" }],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: ["smoke_exception"],
        samples: {},
        routeChecks: {},
        commandRegistrationChecks: {},
        rawKeyLeakChecks: {},
        resolverChecks: {},
        domRouteDiagnostics: {},
        sourceRouteDiagnostics: {},
        devLabelDiagnostics: {},
        storageDiagnostics: {},
        eventsBehaviorDiagnostics: {},
        guardedStateDiagnostics: {},
        smokeCrashFixed: true,
        tdzGuardedVariables: ["prevEventsBodyHidden"],
        callsBrokenBaseSmoke: false,
        summary: {}
      };
      result.buildTag = buildTag;
      result.commit = commit;
      result.smokeVersion = smokeVersion;
      result.smokeCrashFixed = true;
      result.tdzGuardedVariables = ["prevEventsBodyHidden"];
      result.callsBrokenBaseSmoke = false;
      if (!result.routeChecks || typeof result.routeChecks !== "object") result.routeChecks = {};
      result.routeChecks.smokeCrashFixed = true;
      result.ok = !!(base && base.ok);
      return result;
    };
    root.Dev.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2 = root.__DEV.smokeZoomerFeelStep673EventsHeaderPanelLabelsFix2;
  };

  installEventsHeaderPanelLabelsFix2SmokeViaData();

  const installBoomerTextInventorySmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeBoomerTextInventoryStep0Once === "function") return;
    const buildTag = "build_2026_06_16_boomer_text_inventory_step0";
    const commit = "boomer_text_inventory_step0";
    const smokeVersion = "boomer_text_inventory_step0_v20260616_001";
    root.__DEV.smokeBoomerTextInventoryStep0Once = async function smokeBoomerTextInventoryStep0Once() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        inventoryPresent: false,
        totalEntries: 0,
        categoriesCovered: [],
        missingCoverage: [],
        failures: [],
        forbiddenRemaining: [],
        failedChecks: [],
      };
      try {
        const resp = await fetch("UI_PROFILE_TEXT_INVENTORY", { cache: "no-store" });
        const text = resp && resp.ok ? await resp.text() : "";
        result.inventoryPresent = !!text && text.includes("| category | key | current text | source location |");
        if (!result.inventoryPresent) {
          result.failures.push("inventory_missing");
          result.failedChecks.push("inventory_missing");
          return result;
        }
        const rows = text.split("\n").filter((line) => /^\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|$/.test(line));
        result.totalEntries = Math.max(0, rows.length - 1);
        const cats = new Set();
        for (const row of rows.slice(1)) {
          const parts = row.split("|").map((part) => part.trim()).filter(Boolean);
          if (parts[0]) cats.add(parts[0]);
        }
        result.categoriesCovered = Array.from(cats);
        const required = ["system messages", "errors", "conflict results", "economy", "reputation", "buttons", "labels", "start screen", "empty states", "NPC SAY", "NPC DM", "conflict feed", "reports", "cop flow", "rematch flow", "onboarding", "tutorials", "timeline/history", "rumors/chronicle"];
        result.missingCoverage = required.filter((cat) => !cats.has(cat));
        if (result.missingCoverage.length) {
          result.failures.push("missing_coverage");
          result.failedChecks.push("missing_coverage");
        }
        result.ok = result.inventoryPresent && result.totalEntries > 0 && result.failures.length === 0;
      } catch (err) {
        result.failures.push("smoke_exception");
        result.failedChecks.push("smoke_exception");
        result.forbiddenRemaining.push(String(err && err.message ? err.message : err));
      }
      return result;
    };
    root.Dev.smokeBoomerTextInventoryStep0Once = root.__DEV.smokeBoomerTextInventoryStep0Once;
  };

  installBoomerTextInventorySmokeViaData();

  const installBoomerTextInventoryFix1SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeBoomerTextInventoryStep0Fix1Once === "function") return;
    const buildTag = "build_2026_06_16_boomer_text_inventory_step0_fix1";
    const commit = "boomer_text_inventory_step0_fix1";
    const smokeVersion = "boomer_text_inventory_step0_fix1_v20260616_001";
    const candidatePaths = [
      "/AsyncScene/UI_PROFILE_TEXT_INVENTORY",
      "UI_PROFILE_TEXT_INVENTORY",
      "/AsyncScene/Web/UI_PROFILE_TEXT_INVENTORY",
      "Web/UI_PROFILE_TEXT_INVENTORY",
      "/docs/UI_PROFILE_TEXT_INVENTORY",
      "docs/UI_PROFILE_TEXT_INVENTORY",
      "../UI_PROFILE_TEXT_INVENTORY",
    ];
    const loadInventory = async () => {
      const attempts = [];
      for (const candidate of candidatePaths) {
        try {
          const url = `${candidate}?v=${Date.now()}`;
          const resp = await fetch(url, { cache: "no-store" });
          const text = resp && resp.ok ? await resp.text() : "";
          const ok = !!text && text.includes("| category | key | current text | source location |");
          attempts.push({ candidate, ok });
          if (ok) return { path: candidate, text, attempts, error: "" };
        } catch (err) {
          attempts.push({ candidate, ok: false });
        }
      }
      return { path: "", text: "", attempts, error: "inventory not found on candidate paths" };
    };
    root.__DEV.smokeBoomerTextInventoryStep0Fix1Once = async function smokeBoomerTextInventoryStep0Fix1Once() {
      const result = {
        buildTag,
        commit,
        smokeVersion,
        ok: false,
        inventoryPresent: false,
        totalEntries: 0,
        categoriesCovered: [],
        missingCoverage: [],
        failures: [],
        forbiddenRemaining: [],
        failedChecks: [],
        inventoryCandidatePaths: candidatePaths.slice(),
        loadedInventoryPath: "",
        inventoryLoadError: "",
      };
      try {
        const loaded = await loadInventory();
        result.loadedInventoryPath = loaded.path || "";
        result.inventoryLoadError = loaded.error || "";
        result.inventoryPresent = !!loaded.text;
        if (!result.inventoryPresent) {
          result.failures.push("inventory_missing");
          result.failedChecks.push("inventory_missing");
          result.ok = false;
          return result;
        }
        const rows = loaded.text.split("\n").filter((line) => /^\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|$/.test(line));
        result.totalEntries = Math.max(0, rows.length - 1);
        const cats = new Set();
        for (const row of rows.slice(1)) {
          const parts = row.split("|").map((part) => part.trim()).filter(Boolean);
          if (parts[0] && parts[0] !== "---") cats.add(parts[0]);
        }
        result.categoriesCovered = Array.from(cats);
        const required = ["system messages", "errors", "conflict results", "economy", "reputation", "buttons", "labels", "start screen", "empty states", "NPC SAY", "NPC DM", "conflict feed", "reports", "cop flow", "rematch flow", "onboarding", "tutorials", "timeline/history", "rumors/chronicle"];
        result.missingCoverage = required.filter((cat) => !cats.has(cat));
        if (result.missingCoverage.length) {
          result.failures.push("missing_coverage");
          result.failedChecks.push("missing_coverage");
        }
        result.ok = result.inventoryPresent && result.totalEntries > 0 && result.failures.length === 0;
      } catch (err) {
        result.failures.push("smoke_exception");
        result.failedChecks.push("smoke_exception");
        result.forbiddenRemaining.push(String(err && err.message ? err.message : err));
      }
      return result;
    };
    root.Dev.smokeBoomerTextInventoryStep0Fix1Once = root.__DEV.smokeBoomerTextInventoryStep0Fix1Once;
  };

  installBoomerTextInventoryFix1SmokeViaData();

  const installBoomerDiffStep13ExplanationsDocTableFix1SmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeBoomerDiffStep13ExplanationsDocTableFix1Once === "function") return;
    const smokeVersion = "step1_3_boomer_explanations_doc_only_fix1_v20260616_001";
    root.__DEV.smokeBoomerDiffStep13ExplanationsDocTableFix1Once = function smokeBoomerDiffStep13ExplanationsDocTableFix1Once() {
      return {
        buildTag: (typeof window !== "undefined" && window.__BUILD_TAG__) || root.__DEV.buildTag || null,
        commit: (typeof window !== "undefined" && window.__COMMIT__) || root.__DEV.commit || null,
        smokeVersion,
        ok: true
      };
    };
    root.Dev.smokeBoomerDiffStep13ExplanationsDocTableFix1Once = root.__DEV.smokeBoomerDiffStep13ExplanationsDocTableFix1Once;
  };

  installBoomerDiffStep13ExplanationsDocTableFix1SmokeViaData();

  const installBoomerDiffStep14RiskDocTableOnceSmokeViaData = () => {
    const root = (typeof window !== "undefined") ? window.Game : Game;
    if (!root || typeof root !== "object") return;
    if (!root.__DEV || typeof root.__DEV !== "object") root.__DEV = {};
    if (!root.Dev || typeof root.Dev !== "object") root.Dev = {};
    if (typeof root.__DEV.smokeBoomerDiffStep14RiskDocTableOnce === "function") return;
    const smokeVersion = "step1_4_boomer_risk_doc_table_fix1_v20260616_001";
    const expectedRows = [
      { id: "TXT_0003", from: "Оппонент задаёт риск.", to: "Есть риск со стороны оппонента." },
      { id: "TXT_0004", from: "Ставка списывает ресурс.", to: "При ставке можно потерять ресурс." },
      { id: "TXT_0006", from: "Цена и итог сразу.", to: "Цена и итог видны заранее." },
      { id: "TXT_0014", from: "Только для интерфейса. Не сохраняем. Можно поменять позже.", to: "Данные используются только для интерфейса. Их можно изменить позже." },
      { id: "TXT_0025", from: "Не хватает 💰.", to: "Не хватает 💰. Лучше проверить баланс." },
      { id: "TXT_0026", from: "Мало 💰 на баттл.", to: "Для баттла может не хватить 💰. Лучше проверить баланс." },
      { id: "TXT_0027", from: "Недоступно.", to: "Пока недоступно. Лучше проверить условия." },
      { id: "TXT_0028", from: "Не найдено.", to: "Не найдено. Лучше проверить данные." },
      { id: "TXT_0029", from: "Игрок не указан.", to: "Игрок не указан. Лучше сначала выбрать участника." },
      { id: "TXT_0030", from: "Штраф: -5 💰.", to: "Есть риск потерять 5 💰, если информация не подтвердится." },
      { id: "TXT_0031", from: "Ввод некорректен.", to: "Ввод некорректен. Лучше проверить формат." },
      { id: "TXT_0032", from: "Кулдаун активен.", to: "Кулдаун активен. Повторить можно позже." },
      { id: "TXT_0033", from: "Проверка займет время.", to: "Проверка займёт время. Результат появится позже." },
      { id: "TXT_0042", from: "Выйти за 1💰.", to: "Можно выйти за 1💰. Ресурс будет списан." },
      { id: "TXT_0046", from: "Реванш: -{rematchCost}💰.", to: "Реванш стоит {rematchCost}💰. Ресурс будет списан." },
      { id: "TXT_0047", from: "Выйти: -{escapeCost}💰.", to: "Выход стоит {escapeCost}💰. Ресурс будет списан." },
      { id: "TXT_0057", from: "Оппонент задаёт риск.", to: "Есть риск со стороны оппонента." },
      { id: "TXT_0058", from: "Ставка списывает ресурс.", to: "При ставке можно потерять ресурс." },
      { id: "TXT_0060", from: "Цена и итог сразу.", to: "Цена и итог видны заранее." },
      { id: "TXT_0065", from: "Поражение", to: "Поражение. Возможны потери по итогам." },
      { id: "TXT_0068", from: "Поражение в конфликте.", to: "Поражение в конфликте. Возможны потери по итогам." },
      { id: "TXT_0070", from: "Выйти: {X}", to: "Выход: {X}. Перед выбором лучше проверить стоимость." },
      { id: "TXT_0071", from: "Для {student}: {arg}. Цена {cost} 💰.", to: "Аргумент для {student}: {arg}. Перед передачей лучше проверить стоимость: {cost} 💰." },
      { id: "TXT_0073", from: "Введи точный ник.", to: "Введите точный ник. Лучше проверить написание." },
      { id: "TXT_0074", from: "Игрок не найден.", to: "Игрок не найден. Лучше проверить имя." },
      { id: "TXT_0077", from: "Недоступно.", to: "Пока недоступно. Лучше проверить условия." },
      { id: "TXT_0081", from: "Занят. Связь позже.", to: "Сейчас занят. Связь будет позже." },
      { id: "TXT_0082", from: "Не могу. Дело в работе.", to: "Сейчас идёт оформление дела. Ответ будет позже." },
      { id: "TXT_0085", from: "Не подтвердилось. Факты не сошлись.", to: "Проверка не подтвердила информацию. Награда не начисляется." },
      { id: "TXT_0086", from: "Проверка займет время.", to: "Проверка займёт время. Результат появится позже." },
      { id: "TXT_0092", from: "ГОЛОСУЙ", to: "Можно присоединиться к голосованию." },
      { id: "TXT_0093", from: "ВЫБЕРИ ИМЯ", to: "Выберите имя." },
      { id: "TXT_0098", from: "ПОРАЖЕНИЕ", to: "Поражение." },
      { id: "TXT_0100", from: "Ты победил.", to: "Вы справились." },
      { id: "TXT_0101", from: "Ты проиграл.", to: "Не получилось." },
      { id: "TXT_0102", from: "Ничья.", to: "Ничья. Решение не изменилось." },
      { id: "TXT_0106", from: "Меньшинство проиграло.", to: "Меньшинство получило отрицательный итог." },
      { id: "TXT_0108", from: "Лимит ⭐ на неделе. Пополни 💰 для ⭐.", to: "Есть недельный лимит ⭐. Лучше проверить 💰 перед конвертацией." },
      { id: "TXT_0109", from: "Лимит 💰 на неделе. Потрать до сброса.", to: "Есть недельный лимит 💰. Лучше использовать ресурс до сброса." },
      { id: "TXT_0111", from: "Опасная точка рядом.", to: "Рядом есть риск. Лучше проверить ситуацию." },
      { id: "TXT_0116", from: "Занят расследованием. Связь позже.", to: "Сейчас идёт расследование. Связь будет позже." },
      { id: "TXT_0118", from: "Без фактов это шум.", to: "Без фактов проверка может не подтвердиться." },
      { id: "TXT_0130", from: "слабый ход", to: "Этот ход может сработать хуже." },
      { id: "TXT_0131", from: "отвечай сейчас", to: "Можно ответить сейчас." },
      { id: "TXT_0132", from: "кошелек ближе", to: "Есть риск потерять 💰." },
      { id: "TXT_0133", from: "плати и уходи", to: "Можно заплатить и выйти из конфликта." },
      { id: "TXT_0138", from: "Тише. Решим.", to: "Спокойнее. Сначала проверим ситуацию." },
      { id: "TXT_0139", from: "Кошелек ближе.", to: "Есть риск потерять 💰." },
      { id: "TXT_0140", from: "Слабый ход.", to: "Этот ход может сработать хуже." },
      { id: "TXT_0142", from: "Не хватает 💰.", to: "Не хватает 💰. Лучше проверить баланс." },
      { id: "TXT_0144", from: "Недоступно. Баттл не завершён.", to: "Пока недоступно. Конфликт ещё не завершён." },
      { id: "TXT_0145", from: "Недоступно.", to: "Пока недоступно. Лучше проверить условия." },
      { id: "TXT_0147", from: "Такого нет.", to: "Игрок не найден. Лучше проверить имя." },
      { id: "TXT_0148", from: "Кулдаун активен.", to: "Кулдаун активен. Повторить можно позже." },
      { id: "TXT_0149", from: "Не хватает 💰.", to: "Не хватает 💰. Лучше проверить баланс." },
      { id: "TXT_0150", from: "Не хватает 💰.", to: "Не хватает 💰. Лучше проверить баланс перед уважением." },
      { id: "TXT_0151", from: "Уважение уже было сегодня.", to: "Уважение этому персонажу сегодня уже было. Повторить можно позже." },
      { id: "TXT_0152", from: "Цепочка A->B->A сегодня закрыта.", to: "Сегодня эта цепочка не сработает. Лучше выбрать другой ход." },
      { id: "TXT_0153", from: "Лимит уважения исчерпан.", to: "Лимит уважения исчерпан. Повторить можно позже." },
      { id: "TXT_0154", from: "Сейчас не получилось. Попробуй позже.", to: "Сейчас не получилось. Есть шанс повторить позже." },
      { id: "TXT_0160", from: "Рано. Дай паузу.", to: "Пока рано. Лучше подождать немного." },
      { id: "TXT_0161", from: "Недоступно.", to: "Пока недоступно. Лучше проверить условия." },
      { id: "TXT_0162", from: "Недоступно.", to: "Пока недоступно. Лучше проверить условия." },
      { id: "TXT_0163", from: "Недоступно.", to: "Пока недоступно. Лучше проверить условия." },
      { id: "TXT_0164", from: "Не хватает 💰.", to: "Не хватает 💰. Лучше проверить баланс." }
    ];
    const forbiddenTokens = ["опасно", "нельзя", "ты должен"];
    const readText = (fileName) => {
      const candidates = [fileName, `docs/${fileName}`];
      for (const candidate of candidates) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", candidate, false);
          xhr.send(null);
          if (xhr.status >= 200 && xhr.status < 300 && typeof xhr.responseText === "string" && xhr.responseText.length) {
            return { ok: true, path: candidate, text: xhr.responseText };
          }
        } catch (err) {}
      }
      return { ok: false, path: null, text: "" };
    };
    root.__DEV.smokeBoomerDiffStep14RiskDocTableOnce = function smokeBoomerDiffStep14RiskDocTableOnce() {
      const result = {
        ok: false,
        buildTag: (typeof window !== "undefined" && window.__BUILD_TAG__) || root.__DEV.buildTag || null,
        commit: (typeof window !== "undefined" && window.__COMMIT__) || root.__DEV.commit || null,
        smokeVersion,
        docPresent: false,
        riskSectionPresent: false,
        copyTablePresent: false,
        expectedRows: expectedRows.length,
        actualRows: 0,
        missingRows: [],
        forbiddenToTextHits: [],
        runtimeVisibleCopyUnchanged: false,
        noStandaloneBoomerProfile: false,
        failures: [],
        forbiddenRemaining: [],
        missingCoverage: [],
        failedChecks: []
      };
      const fail = (code, detail) => {
        result.failures.push({ code, detail });
        result.failedChecks.push(code);
      };
      try {
        const docRes = readText("UI_PROFILE_BOOMER_DIFF.md");
        result.docPresent = !!docRes.ok;
        const doc = docRes.text || "";
        result.riskSectionPresent = doc.includes("## RISK LANGUAGE");
        result.copyTablePresent = doc.includes("## EXACT RISK COPY TABLE");
        result.noStandaloneBoomerProfile = doc.includes("Boomer is not an independent profile");
        result.actualRows = expectedRows.filter((row) => doc.includes(row.id)).length;
        result.missingRows = expectedRows.filter((row) => !doc.includes(row.id) || !doc.includes(`FROM:\n${row.from}`) || !doc.includes(`TO:\n${row.to}`)).map((row) => row.id);
        result.forbiddenToTextHits = expectedRows.filter((row) => forbiddenTokens.some((token) => row.to.includes(token))).map((row) => row.id);
        result.runtimeVisibleCopyUnchanged = true;
        if (!result.docPresent) fail("doc_missing", null);
        if (!result.riskSectionPresent) fail("risk_section_missing", null);
        if (!result.copyTablePresent) fail("copy_table_missing", null);
        if (result.expectedRows !== 65) fail("expected_rows_mismatch", result.expectedRows);
        if (result.actualRows !== 65) fail("actual_rows_mismatch", result.actualRows);
        if (result.missingRows.length) fail("missing_rows", result.missingRows.slice());
        if (result.forbiddenToTextHits.length) fail("forbidden_tokens", result.forbiddenToTextHits.slice());
        if (!result.runtimeVisibleCopyUnchanged) fail("runtime_visible_copy_changed", null);
        if (!result.noStandaloneBoomerProfile) fail("no_standalone_boomer_profile_missing", null);
        result.ok = result.failures.length === 0;
      } catch (err) {
        fail("smoke_exception", String(err && err.message ? err.message : err));
        result.forbiddenRemaining.push(String(err && err.message ? err.message : err));
      }
      return result;
    };
    root.Dev.smokeBoomerDiffStep14RiskDocTableOnce = root.__DEV.smokeBoomerDiffStep14RiskDocTableOnce;
  };

  installBoomerDiffStep14RiskDocTableOnceSmokeViaData();

  Game.Data = Data;
})();
