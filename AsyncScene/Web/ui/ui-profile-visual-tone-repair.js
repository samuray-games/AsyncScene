// Stage 6 final presentation authority v4.
// Presentation-only: one canonical profile layer and one unified stat-toast pipeline.
// Gameplay, economy, battle rules, NPC behavior, state, persistence and outcomes are untouched.
window.Game = window.Game || {};

(function installStage6FinalPresentationV4() {
  const Game = window.Game;
  const Data = Game.Data;
  const UI = Game.UI;
  const OriginalSystem = Game.System;

  if (!Data || !UI || !OriginalSystem) {
    console.error("STAGE6_FINAL_PRESENTATION_V4_INSTALL_FAILED", {
      hasData: !!Data,
      hasUI: !!UI,
      hasSystem: !!OriginalSystem
    });
    return;
  }

  Game.__DEV = Game.__DEV || {};
  if (Game.__DEV.__stage6FinalPresentationV4Installed) return;

  const BUILD_TAG = "build_2026_07_23_stage6_final_presentation_v4";
  const SMOKE_VERSION = "stage6_final_presentation_v20260723_004";
  const PROFILE_KEYS = Object.freeze(["boomer", "genX", "millennial", "zoomer", "alpha"]);
  const STAT_KINDS = Object.freeze(["points", "rep", "influence", "wins"]);
  const STAT_ICONS = Object.freeze({ points: "💰", rep: "⭐", influence: "⚡", wins: "🏆" });
  const COALESCE_MS = 90;
  const ACTIVE_MERGE_MS = 350;
  const VISIBLE_MS = 1700;

  const CONTROL_COPY = Object.freeze({
    millennial: Object.freeze({
      chatPlaceholder: "Напиши сообщение.",
      chatSend: "Отправить",
      dmPlaceholder: "Напиши лично.",
      dmSend: "Отправить",
      dmHeader: "Личка",
      battlesHeader: "Споры",
      eventsHeader: "События",
      menu: "Меню",
      attackBadge: "Аргумент",
      defenseBadge: "Контраргумент",
      opponentArgLabel: "Аргумент соперника",
      ownDefenseLabel: "Твой контраргумент",
      dismiss: "Отойти",
      escape: "Уйти"
    }),
    zoomer: Object.freeze({
      chatPlaceholder: "Сообщение",
      chatSend: "Отправить",
      dmPlaceholder: "Личное сообщение",
      dmSend: "Отправить",
      dmHeader: "ЛС",
      battlesHeader: "Баттлы",
      eventsHeader: "Движ",
      menu: "Меню",
      attackBadge: "Вброс",
      defenseBadge: "Контра",
      opponentArgLabel: "Что тебе вкинули",
      ownDefenseLabel: "Твоя контра",
      dismiss: "Отойти",
      escape: "Уйти"
    }),
    alpha: Object.freeze({
      chatPlaceholder: "Напиши.",
      chatSend: "Отправить",
      dmPlaceholder: "Напиши.",
      dmSend: "Отправить",
      dmHeader: "Личное",
      battlesHeader: "Бои",
      eventsHeader: "Ивенты",
      menu: "Меню",
      attackBadge: "Ход",
      defenseBadge: "Ответ",
      opponentArgLabel: "Ход",
      ownDefenseLabel: "Ответ",
      dismiss: "Стоп",
      escape: "Уйти"
    }),
    boomer: Object.freeze({
      chatPlaceholder: "Введите сообщение.",
      chatSend: "Отправить",
      dmPlaceholder: "Введите личное сообщение.",
      dmSend: "Отправить",
      dmHeader: "Сообщения",
      battlesHeader: "Конфликты",
      eventsHeader: "События",
      menu: "Меню",
      attackBadge: "Аргумент",
      defenseBadge: "Ответ",
      opponentArgLabel: "Аргумент оппонента",
      ownDefenseLabel: "Ваш ответ",
      dismiss: "Отказаться",
      escape: "Выйти"
    }),
    genX: Object.freeze({
      chatPlaceholder: "Пиши сюда",
      chatSend: "Отправить",
      dmPlaceholder: "Пиши лично",
      dmSend: "Отправить",
      dmHeader: "Личка",
      battlesHeader: "Стычки",
      eventsHeader: "Что происходит",
      menu: "Меню",
      attackBadge: "Ход",
      defenseBadge: "Ответ",
      opponentArgLabel: "Что сказал соперник",
      ownDefenseLabel: "Твой ответ",
      dismiss: "Отказаться",
      escape: "Уйти"
    })
  });

  const NPC_VISIBLE_ROLE_LABELS = Object.freeze({
    BANDIT: Object.freeze({ boomer: "Грабитель", genX: "Бандит", millennial: "Гопник", zoomer: "Бандит", alpha: "Грабитель" }),
    TOXIC: Object.freeze({ boomer: "Скандалист", genX: "Провокатор", millennial: "Тролль", zoomer: "Токсик", alpha: "Токсик" }),
    COP: Object.freeze({ boomer: "Полицейский", genX: "Мент", millennial: "Коп", zoomer: "Коп", alpha: "Коп" }),
    CROWD: Object.freeze({ boomer: "Зеваки", genX: "Народ", millennial: "Толпа", zoomer: "Чат", alpha: "Чат" }),
    MAFIA: Object.freeze({ boomer: "Мафиози", genX: "Братва", millennial: "Мафия", zoomer: "Мафия", alpha: "Мафия" })
  });

  const COMBINED_RESPECT_COPY = Object.freeze({
    boomer: "Списана 1 монета. Репутация цели выросла на 1.",
    genX: "−1 из кармана. Цели +1 к репутации.",
    millennial: "Баланс −1. Цели +1 к репутации. Карма, но с бухгалтерией.",
    zoomer: "−1💰 тебе · +1⭐ цели. Баланс вселенной восстановлен.",
    alpha: "−1💰 / цели +1⭐"
  });

  const TEXT_OVERRIDES = Object.freeze({
    boomer: Object.freeze({
      escape_button_label: "Выйти −{X} 💰",
      events_header: "События",
      events_title: "События: {count}",
      battle_invite_title: "Конфликты",
      battle_action_accept: "Принять вызов",
      battle_action_decline: "Отказаться",
      battle_action_attack: "Атаковать",
      battle_action_rematch: "Предложить реванш",
      battle_action_report: "Сообщить",
      dm_empty: "Личных сообщений пока нет.",
      dm_action_unavailable: "Действие недоступно.",
      events_empty: "Новых событий нет.",
      battles_empty: "Активных конфликтов нет.",
      cost_confirm_generic: "Потратить {cost} 💰?",
      battle_boost_action: "Усилить - {cost} 💰",
      argument_reroll_action: "Обновить аргументы - {cost} 💰",
      hint_weakness_action: "Подсказка - {cost} 💰",
      conflict_intervene_action: "Вмешаться - {cost} 💰",
      npc_force_event_action: "Запустить событие - {cost} 💰",
      dismiss_action: "Отказаться",
      report_false_repeat: "Повторное ложное сообщение. Репутация снижена на {rep}."
    }),
    genX: Object.freeze({
      escape_button_label: "Уйти −{X} 💰",
      events_header: "Что происходит",
      events_title: "Что происходит: {count}",
      battle_invite_title: "Стычки",
      battle_action_accept: "Вписаться",
      battle_action_decline: "Пас",
      battle_action_attack: "Атаковать",
      battle_action_rematch: "Ещё разок",
      battle_action_report: "Пожаловаться",
      dm_empty: "Пусто. Никто не пишет.",
      dm_action_unavailable: "Недоступно.",
      events_empty: "Тишина. Ничего не происходит.",
      battles_empty: "Разборок нет.",
      cost_confirm_generic: "Потратить {cost} 💰?",
      battle_boost_action: "Усилить - {cost} 💰",
      argument_reroll_action: "Другие аргументы - {cost} 💰",
      hint_weakness_action: "Подсказка - {cost} 💰",
      conflict_intervene_action: "Влезть - {cost} 💰",
      npc_force_event_action: "Подкинуть событие - {cost} 💰",
      dismiss_action: "Отказаться",
      report_false_repeat: "Опять мимо. Репутация −{rep}."
    }),
    millennial: Object.freeze({
      escape_button_label: "Уйти −{X} 💰",
      events_header: "События",
      events_title: "События ({count})",
      battle_invite_title: "Споры",
      battle_action_accept: "Принять",
      battle_action_decline: "Отклонить",
      battle_action_attack: "Атаковать",
      battle_action_rematch: "Реванш",
      battle_action_report: "Пожаловаться",
      dm_empty: "Пока пусто. Даже спама нет.",
      dm_action_unavailable: "Недоступно.",
      events_empty: "Событий нет. Подозрительно спокойно.",
      battles_empty: "Никто не зовёт спорить. Наслаждайся моментом.",
      cost_confirm_generic: "Потратить {cost} 💰?",
      battle_boost_action: "Усилить · {cost} 💰",
      argument_reroll_action: "Перебрать аргументы · {cost} 💰",
      hint_weakness_action: "Подсказка · {cost} 💰",
      conflict_intervene_action: "Вмешаться · {cost} 💰",
      npc_force_event_action: "Запустить событие · {cost} 💰",
      dismiss_action: "Отказаться",
      report_false_repeat: "Репутация −{rep}. Повторный ложный репорт остался в истории."
    }),
    zoomer: Object.freeze({
      escape_button_label: "Уйти −{X} 💰",
      events_header: "Движ",
      events_title: "Движ {count}",
      battle_invite_title: "Баттлы",
      battle_action_accept: "Залететь",
      battle_action_decline: "Скип",
      battle_action_attack: "Влететь",
      battle_action_rematch: "Рематч",
      battle_action_report: "Репорт",
      dm_empty: "В личке тишина.",
      dm_action_unavailable: "Недоступно.",
      events_empty: "Движ пока спит.",
      battles_empty: "Баттлов нет.",
      cost_confirm_generic: "−{cost} 💰?",
      battle_boost_action: "Буст −{cost} 💰",
      argument_reroll_action: "Реролл −{cost} 💰",
      hint_weakness_action: "Хинт −{cost} 💰",
      conflict_intervene_action: "Вмешаться −{cost} 💰",
      npc_force_event_action: "Форснуть ивент −{cost} 💰",
      dismiss_action: "Отказаться",
      report_false_repeat: "опять репорт мимо 💀 · −{rep} репы"
    }),
    alpha: Object.freeze({
      tie_start: "Голос",
      tie_call_to_action: "Выбрать",
      tie_click_name_hint: "Имя",
      vote_ok: "Учтено",
      vote_already: "Уже",
      vote_fail: "Нет",
      events_header: "Ивенты",
      events_title: "Ивенты {count}",
      events_empty: "ивентов 0",
      events_panel_hint: "События.",
      battles_empty: "боёв 0",
      battle_invite_title: "Бои",
      battle_action_accept: "В бой",
      battle_action_decline: "Нет",
      battle_action_attack: "Ход",
      battle_action_rematch: "Ещё",
      battle_action_report: "Репорт",
      dm_empty: "личка 0",
      dm_action_unavailable: "Нет.",
      battle_energy_locked_hint: "Нужно ⚡{energy}",
      cost_confirm_generic: "−{cost}💰?",
      events_close_extra: "Свернуть",
      events_clear_all: "Очистить",
      events_clear: "Очистить",
      events_done: "Готово",
      events_left: "{sec} сек",
      menu_title: "Меню",
      return_to_start: "На старт",
      menu_unavailable: "Нет.",
      goal_label: "Цель",
      battle_boost_action: "Буст −{cost}💰",
      argument_reroll_action: "Реролл −{cost}💰",
      hint_weakness_action: "Хинт −{cost}💰",
      conflict_intervene_action: "Вмешаться −{cost}💰",
      npc_force_event_action: "Форснуть ивент −{cost}💰",
      dismiss_action: "Нет",
      report_false_repeat: "опять мимо 💀 −{rep}⭐"
    })
  });

  const START_PROFILE_OVERRIDES = Object.freeze({
    boomer: Object.freeze({
      title: "Asynchronia",
      birth_digits_label: "Последние две цифры года рождения",
      profile_helper: "Год нужен только для настройки интерфейса. Он не сохраняется, и выбор можно изменить позже.",
      async_value: "Асинхронная онлайн-игра: играйте тогда, когда вам удобно.",
      no_simultaneous_required: "Не нужно собираться одновременно - каждый заходит в игру в своё время.",
      start_continue: "Начать игру",
      start_start: "Начать игру",
      rules_action: "Правила игры",
      start_action: "Начать игру"
    }),
    genX: Object.freeze({
      title: "Asynchronia",
      birth_digits_label: "Две последние цифры года рождения",
      profile_helper: "Это только настройка интерфейса. Год не сохраняем, потом можно поменять.",
      async_value: "Асинхронная онлайн-игра. Заходи когда удобно.",
      no_simultaneous_required: "Не надо ждать остальных онлайн - каждый играет в своё время.",
      start_continue: "Поехали",
      start_start: "Поехали",
      rules_action: "Как тут всё устроено",
      start_action: "Поехали"
    }),
    millennial: Object.freeze({
      title: "Asynchronia",
      birth_digits_label: "Последние 2 цифры года рождения",
      profile_helper: "Только для интерфейса. Год не сохраняем. Профиль потом можно поменять.",
      async_value: "Асинхронная онлайн-игра: заходи когда удобно.",
      no_simultaneous_required: "Не нужно совпадать по расписанию - каждый играет в своё время.",
      start_continue: "Старт",
      start_start: "Старт",
      rules_action: "Правила",
      start_action: "Старт"
    }),
    zoomer: Object.freeze({
      title: "Asynchronia",
      birth_digits_label: "Последние 2 цифры года рождения",
      profile_helper: "Только стиль UI. Год не сохраняем, потом сменишь.",
      async_value: "Асинхронная онлайн-игра. Играй когда удобно.",
      no_simultaneous_required: "Не надо ждать всех онлайн - каждый заходит когда хочет.",
      start_continue: "В игру",
      start_start: "В игру",
      rules_action: "Как играть",
      start_action: "В игру"
    }),
    alpha: Object.freeze({
      title: "Asynchronia",
      birth_digits_label: "2 цифры года рождения",
      profile_helper: "только стиль. год не сохраняем. сменить можно.",
      async_value: "асинхронная игра · играй когда хочешь",
      no_simultaneous_required: "все онлайн сразу не нужны",
      fantasy_birth_label: "Год по ощущению",
      start_continue: "В игру",
      start_start: "В игру",
      start_reset: "Сброс",
      rules_action: "Правила",
      start_action: "В игру"
    })
  });

  const ALPHA_FROZEN_EXPECTED = Object.freeze({
    escape_button_label: "Уйти: −{X}💰",
    teach_sent_dm: "{student}: {arg}. -{cost}💰.",
    teach_sent_chat: "{teacher} → {student}: аргумент.",
    invite_open_hint: "Указать имя",
    invite_invalid: "Игрок: нет"
  });

  const PROFILE_TEXT_OVERRIDES = Object.freeze({
    boomer: Object.freeze({
      not_enough_money: "Недостаточно монет.",
      not_enough_stars: "Недостаточно репутации.",
      purchase_success: "Куплено.",
      sale_success: "Продажа готова.",
      reward_received: "Награда получена.",
      penalty_received: "Штраф применён.",
      generic_error: "Ошибка.",
      generic_success: "Готово.",
      money_received: "Деньги получены.",
      money_spent: "Деньги списаны.",
      money_changed_positive: "Баланс пополнен.",
      money_changed_negative: "Списано.",
      poverty_state: "Денег мало.",
      rich_state: "Денег достаточно.",
      bankrupt_state: "Денег нет.",
      income_event: "Доход получен.",
      expense_event: "Расход учтён.",
      economy_neutral: "Баланс без изменений.",
      reputation_increased: "Репутация выросла.",
      reputation_decreased: "Репутация снизилась.",
      reputation_unchanged: "Репутация без изменений.",
      respect_gained: "Уважение к вам выросло.",
      respect_lost: "Уважение снизилось.",
      disrespect_event: "Отношение ухудшилось.",
      reputation_high: "Репутация высокая.",
      reputation_low: "Репутация низкая.",
      reputation_recovered: "Репутация восстановлена.",
      reputation_damaged: "Репутация снижена."
    }),
    genX: Object.freeze({
      not_enough_money: "Денег не хватает.",
      not_enough_stars: "Репутации не хватает.",
      purchase_success: "Куплено. Деньги ушли.",
      sale_success: "Продажа готова.",
      reward_received: "Награда получена.",
      penalty_received: "Штраф применён.",
      generic_error: "Ошибка.",
      generic_success: "Готово.",
      money_received: "Деньги получены.",
      money_spent: "Деньги списаны.",
      money_changed_positive: "+{X} в карман.",
      money_changed_negative: "−{X}. Ну бывает.",
      poverty_state: "Денег мало.",
      rich_state: "Денег достаточно.",
      bankrupt_state: "Денег нет.",
      income_event: "Доход получен.",
      expense_event: "Расход учтён.",
      economy_neutral: "Баланс без изменений.",
      reputation_increased: "Репутация +{X}. Нормально.",
      reputation_decreased: "Репутация −{X}. Облом.",
      reputation_unchanged: "Репутация без изменений.",
      respect_gained: "Тебя зауважали.",
      respect_lost: "Уважение снизилось.",
      disrespect_event: "Отношение ухудшилось.",
      reputation_high: "Репутация высокая.",
      reputation_low: "Репутация низкая.",
      reputation_recovered: "Репутацию выправили.",
      reputation_damaged: "Репутация снижена."
    }),
    millennial: Object.freeze({
      not_enough_money: "Не хватает денег.",
      not_enough_stars: "Не хватает репутации.",
      purchase_success: "Куплено. Финансовая ответственность снова отложена.",
      sale_success: "Продажа готова.",
      reward_received: "Награда получена.",
      penalty_received: "Штраф применён.",
      generic_error: "Ошибка.",
      generic_success: "Готово.",
      money_received: "Деньги получены.",
      money_spent: "Деньги списаны.",
      money_changed_positive: "Баланс: +{X}. Наконец-то.",
      money_changed_negative: "Баланс: −{X}. Бюджет снова страдает.",
      poverty_state: "Денег мало.",
      rich_state: "Денег достаточно.",
      bankrupt_state: "Денег нет.",
      income_event: "Доход получен.",
      expense_event: "Расход учтён.",
      economy_neutral: "Баланс без изменений.",
      reputation_increased: "Репутация +{X}. Карма пошла вверх.",
      reputation_decreased: "Репутация −{X}. Интернет помнит всё.",
      reputation_unchanged: "Репутация без изменений.",
      respect_gained: "Уважение выросло. Карма плюс.",
      respect_lost: "Уважение снизилось.",
      disrespect_event: "Отношение ухудшилось.",
      reputation_high: "Репутация высокая.",
      reputation_low: "Репутация низкая.",
      reputation_recovered: "Репутация восстановилась. Цифровой след немного простил.",
      reputation_damaged: "Репутация снижена."
    }),
    zoomer: Object.freeze({
      not_enough_money: "Кошелёк пуст 💀",
      not_enough_stars: "Репы не хватает.",
      purchase_success: "Забрали. −💰.",
      sale_success: "Продажа готова.",
      reward_received: "Награда получена.",
      penalty_received: "Штраф применён.",
      generic_error: "Ошибка.",
      generic_success: "Готово.",
      money_received: "Деньги получены.",
      money_spent: "Деньги списаны.",
      money_changed_positive: "+{X} к банку 💸",
      money_changed_negative: "−{X} 💀",
      poverty_state: "Денег мало.",
      rich_state: "Денег достаточно.",
      bankrupt_state: "Денег нет.",
      income_event: "Доход получен.",
      expense_event: "Расход учтён.",
      economy_neutral: "Баланс без изменений.",
      reputation_increased: "Репа +{X} 📈",
      reputation_decreased: "Репа −{X} 💀",
      reputation_unchanged: "Репутация без изменений.",
      respect_gained: "Респект +.",
      respect_lost: "Уважение снизилось.",
      disrespect_event: "Отношение ухудшилось.",
      reputation_high: "Репутация высокая.",
      reputation_low: "Репутация низкая.",
      reputation_recovered: "Репа отхилилась.",
      reputation_damaged: "Репутация снизилась."
    }),
    alpha: Object.freeze({
      not_enough_money: "0 денег 💀",
      not_enough_stars: "⭐ мало",
      purchase_success: "куплено / −💰",
      sale_success: "Продано.",
      reward_received: "Награда.",
      penalty_received: "Штраф.",
      generic_error: "Ошибка.",
      generic_success: "Готово.",
      money_received: "Деньги получены.",
      money_spent: "Деньги списаны.",
      money_changed_positive: "+{X}💰 W",
      money_changed_negative: "−{X}💰 L",
      poverty_state: "Мало денег.",
      rich_state: "Денег хватает.",
      bankrupt_state: "Нет денег.",
      income_event: "Доход.",
      expense_event: "Расход.",
      economy_neutral: "Без изменений.",
      reputation_increased: "+{X}⭐ · аура ↑",
      reputation_decreased: "−{X}⭐ aura−",
      reputation_unchanged: "Без изменений.",
      respect_gained: "респект ↑",
      respect_lost: "Уважение снизилось.",
      disrespect_event: "Отношение хуже.",
      reputation_high: "Репутация высокая.",
      reputation_low: "Репутация низкая.",
      reputation_recovered: "репутация вернулась",
      reputation_damaged: "Репутация снижена."
    })
  });

  const LEGACY_SYSTEM_PHRASE_OVERRIDES = Object.freeze({
    zoomer: Object.freeze({
      "Кошелёк в нуле 💀": "Не хватает денег.",
      "Звёзд не завезли ⭐": "Не хватает репутации.",
      "Забрал. Минус монеты.": "Покупка готова.",
      "Слил в плюс.": "Продажа готова.",
      "Лут прилетел.": "Награда получена.",
      "Минуснули.": "Штраф применён.",
      "Что-то сломалось 🫠": "Ошибка.",
      "Есть.": "Готово.",
      "Монеты зашли.": "Деньги получены.",
      "Монеты ушли.": "Деньги списаны.",
      "Баланс подрос.": "Баланс вырос.",
      "Баланс просел.": "Баланс снизился.",
      "Кошелёк дышит на мемах.": "Денег мало.",
      "Кошелёк жирный.": "Денег достаточно.",
      "Финансовый ноль 💀": "Денег нет.",
      "Плюс к кассе.": "Доход получен.",
      "Кассу подрезало.": "Расход учтён.",
      "По монетам без движухи.": "Баланс без изменений.",
      "Репа подросла.": "Репутация выросла.",
      "Репа просела.": "Репутация снизилась.",
      "По репе без движухи.": "Репутация без изменений.",
      "Тебя начали респектить.": "Уважение выросло.",
      "Респект просел.": "Уважение снизилось.",
      "На тебя косо смотрят.": "Отношение ухудшилось.",
      "Репа на весу.": "Репутация высокая.",
      "Репа тонкая.": "Репутация низкая.",
      "Репа отлипла.": "Репутация восстановилась.",
      "Репу помяло.": "Репутация снизилась."
    }),
    alpha: Object.freeze({
      "Кошелёк в нуле 💀": "Нет денег.",
      "Есть.": "Готово."
    })
  });

  const SYSTEM_ROUTE_OVERRIDES = Object.freeze({
    boomer: Object.freeze({
      "errors.insufficientPoints": "Недостаточно монет.",
      "errors.pointsLowBattle": "Недостаточно монет.",
      "warnings.escapeNeedsPoints": "Недостаточно монет.",
      "notifications.escapePaid": "Списана 1 монета.",
      "notifications.escapeVoteCost": "Списано {escapeCost}.",
      "notifications.trainingSent": "Аргумент передан: {teacher} → {student}.",
      "systemEvents.joined": "{name} появился на площади.",
      "systemEvents.moved": "Вы перешли в локацию: {location}.",
      "systemEvents.battleChallenge": "{attackerName} [⚡{attackerInf}] бросил вызов.",
      "systemEvents.npcBattleStart": "{a} бросил вызов {b}.",
      "systemEvents.unlockBlack": "Открыты чёрные аргументы."
    }),
    genX: Object.freeze({
      "errors.insufficientPoints": "Денег не хватает.",
      "errors.pointsLowBattle": "Денег не хватает.",
      "warnings.escapeNeedsPoints": "Денег не хватает.",
      "notifications.escapePaid": "−1 из кармана.",
      "notifications.escapeVoteCost": "−{escapeCost} из кармана.",
      "notifications.trainingSent": "Аргумент: {teacher} → {student}.",
      "systemEvents.joined": "{name} пришёл на площадь.",
      "systemEvents.moved": "Перешёл: {location}.",
      "systemEvents.battleChallenge": "{attackerName} [⚡{attackerInf}] полез в спор.",
      "systemEvents.npcBattleStart": "{a} вызвал {b}.",
      "systemEvents.unlockBlack": "Чёрный уровень открыт."
    }),
    millennial: Object.freeze({
      "errors.insufficientPoints": "Недостаточно денег.",
      "errors.pointsLowBattle": "Недостаточно денег для конфликта.",
      "warnings.escapeNeedsPoints": "Не хватает денег, чтобы уйти.",
      "notifications.escapePaid": "Уход: −1.",
      "notifications.escapeVoteCost": "Уход: −{escapeCost}.",
      "notifications.trainingSent": "Аргумент передан: {teacher} → {student}.",
      "systemEvents.joined": "{name} появился на площади. Новый участник треда.",
      "systemEvents.moved": "Переход: {location}. Новая вкладка мира открыта.",
      "systemEvents.battleChallenge": "{attackerName} [⚡{attackerInf}] бросил вызов. Ну всё, начался тред.",
      "systemEvents.npcBattleStart": "{a} вызывает {b}. NPC тоже решили выяснить отношения.",
      "systemEvents.unlockBlack": "Чёрные аргументы открыты. Финальный босс риторики найден."
    }),
    zoomer: Object.freeze({
      "errors.insufficientPoints": "Не хватает денег.",
      "errors.pointsLowBattle": "Не хватает денег.",
      "warnings.escapeNeedsPoints": "Не хватает денег.",
      "notifications.escapePaid": "Уход: −1.",
      "notifications.escapeVoteCost": "Уход: −{escapeCost}.",
      "notifications.trainingSent": "Аргумент: {teacher} → {student}.",
      "systemEvents.joined": "{name} залетел на площадь.",
      "systemEvents.moved": "Мув → {location}.",
      "systemEvents.battleChallenge": "{attackerName} [⚡{attackerInf}] залетел в баттл.",
      "systemEvents.npcBattleStart": "{a} vs {b}. го.",
      "systemEvents.unlockBlack": "⚫ аргументы открыты. имба."
    }),
    alpha: Object.freeze({
      "errors.insufficientPoints": "Нет денег.",
      "errors.pointsLowBattle": "Нет денег.",
      "warnings.escapeNeedsPoints": "Нет денег.",
      "notifications.escapePaid": "Уход −1.",
      "notifications.escapeVoteCost": "Уход −{escapeCost}.",
      "notifications.trainingSent": "{teacher} → {student}: аргумент.",
      "systemEvents.joined": "{name} в игре.",
      "systemEvents.moved": "→ {location}",
      "systemEvents.battleChallenge": "{attackerName} ⚡{attackerInf}: 1v1",
      "systemEvents.npcBattleStart": "{a} vs {b} · го",
      "systemEvents.unlockBlack": "⚫ макс ✓"
    })
  });

  function activeProfile() {
    const raw = typeof Data.getUiProfile === "function" ? Data.getUiProfile() : Data.UI_PROFILE;
    const normalized = typeof Data.normalizeUiProfile === "function"
      ? Data.normalizeUiProfile(raw)
      : String(raw || "").trim();
    if (normalized === "genX") return normalized;
    const key = String(normalized || "").trim().toLowerCase();
    if (key === "genx") return "genX";
    return PROFILE_KEYS.includes(key) ? key : "millennial";
  }

  function normalizeProfileKey(profile) {
    const raw = String(profile || "").trim();
    if (raw === "genX" || raw.toLowerCase() === "genx") return "genX";
    const key = raw.toLowerCase();
    return PROFILE_KEYS.includes(key) ? key : "millennial";
  }

  function renderSimpleTemplate(template, ctx) {
    const vars = ctx && typeof ctx === "object" ? ctx : {};
    return String(template || "").replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => (
      Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : ""
    )).replace(/\s+([.,!?;:])/g, "$1").trim();
  }

  function patchProfileDictionaries() {
    const texts = Data.TEXTS || (Data.TEXTS = {});
    const millennialBase = texts.millennial || texts.genz || {};
    const boomerBase = texts.boomer || millennialBase;
    const genXBase = texts.genX || texts.genx || millennialBase;
    const zoomerBase = texts.zoomer || millennialBase;
    const alphaBase = texts.alpha || millennialBase;

    texts.boomer = Object.freeze({ ...boomerBase, ...TEXT_OVERRIDES.boomer });
    texts.genX = Object.freeze({ ...genXBase, ...TEXT_OVERRIDES.genX });
    texts.millennial = Object.freeze({ ...millennialBase, ...TEXT_OVERRIDES.millennial });
    texts.default = texts.millennial;
    texts.zoomer = Object.freeze({ ...zoomerBase, ...TEXT_OVERRIDES.zoomer });
    texts.alpha = Object.freeze({ ...alphaBase, ...TEXT_OVERRIDES.alpha });

    const starts = Data.START_SCREEN_PROFILE_TEXTS || {};
    const startBase = starts.millennial || {};
    const startFor = (profile) => Object.freeze({
      ...startBase,
      ...(starts[profile] || {}),
      ...START_PROFILE_OVERRIDES[profile]
    });
    Data.START_SCREEN_PROFILE_TEXTS = Object.freeze({
      ...starts,
      boomer: startFor("boomer"),
      genX: Object.freeze({
        ...startBase,
        ...(starts.genX || starts.genx || {}),
        ...START_PROFILE_OVERRIDES.genX
      }),
      millennial: startFor("millennial"),
      zoomer: startFor("zoomer"),
      alpha: startFor("alpha")
    });
  }

  function canonicalizeLegacySystemPhrase(profile, text) {
    const source = String(text == null ? "" : text);
    const bucket = LEGACY_SYSTEM_PHRASE_OVERRIDES[profile];
    return bucket && Object.prototype.hasOwnProperty.call(bucket, source) ? bucket[source] : source;
  }

  function canonicalSystemText(profile, kind, code, ctx) {
    const groupAliases = {
      error: "errors", errors: "errors", warning: "warnings", warnings: "warnings",
      notification: "notifications", notifications: "notifications",
      event: "systemEvents", events: "systemEvents", systemEvent: "systemEvents", systemEvents: "systemEvents"
    };
    const group = groupAliases[String(kind || "").trim()] || String(kind || "").trim();
    const routeKey = `${group}.${String(code || "").trim()}`;
    const bucket = SYSTEM_ROUTE_OVERRIDES[profile] || SYSTEM_ROUTE_OVERRIDES.millennial;
    if (Object.prototype.hasOwnProperty.call(bucket, routeKey)) return renderSimpleTemplate(bucket[routeKey], ctx);
    return canonicalizeLegacySystemPhrase(profile, OriginalSystem.say(kind, code, ctx));
  }

  function installSystemPresentationRouting() {
    const old = Game.System;
    if (!old || old.__stage6FinalPresentationV4Wrapped) return;

    const wrappedProfileText = function stage6ProfileTextV4(key, ctx) {
      const profile = activeProfile();
      const bucket = PROFILE_TEXT_OVERRIDES[profile];
      if (bucket && Object.prototype.hasOwnProperty.call(bucket, String(key || ""))) {
        return renderSimpleTemplate(bucket[String(key || "")], ctx);
      }
      return canonicalizeLegacySystemPhrase(profile, old.profileText(key, ctx));
    };

    const wrappedSay = function stage6SystemSayV4(kind, code, ctx) {
      return canonicalSystemText(activeProfile(), kind, code, ctx);
    };

    const wrappedPolicy = function stage6DeliveryPolicyV4(kind, code, ctx) {
      const base = old.deliveryPolicy(kind, code, ctx);
      return { ...base, text: wrappedSay(kind, code, ctx) };
    };

    const wrappedDeliver = function stage6DeliverV4(kind, code, ctx, opts) {
      const policy = wrappedPolicy(kind, code, ctx);
      const options = opts && typeof opts === "object" ? opts : {};
      const currentUI = Game.UI;
      if (policy.devLog && Game.__DEV && Array.isArray(Game.__DEV.systemLog)) {
        try { Game.__DEV.systemLog.push({ kind: policy.kind, code: policy.code, text: policy.text, ts: Date.now() }); } catch (_) {}
      }
      if (options.silentIncoming && policy.panel && currentUI && typeof currentUI.pushIncomingSystem === "function") {
        currentUI.pushIncomingSystem(policy.panel, policy.kind, policy.code, ctx, { ...options, text: policy.text, policy });
        return policy;
      }
      if (policy.toast && currentUI && typeof currentUI.showStatToast === "function") {
        currentUI.showStatToast(policy.statKind, policy.text);
        return policy;
      }
      if (policy.chat && currentUI && typeof currentUI.pushSystem === "function") {
        currentUI.pushSystem(policy.text, { ...options, routed: true, policy });
        return policy;
      }
      return policy;
    };

    Game.System = Object.freeze({
      ...old,
      say: wrappedSay,
      profileText: wrappedProfileText,
      deliveryPolicy: wrappedPolicy,
      route: wrappedPolicy,
      deliver: wrappedDeliver,
      __stage6FinalPresentationV4Wrapped: true,
      __stage6FinalPresentationOriginal: old
    });
  }

  function cleanOwnIcon(kind, text) {
    const icon = STAT_ICONS[String(kind || "").trim()];
    let value = String(text == null ? "" : text);
    if (icon) value = value.split(icon).join("");
    return value.replace(/\s{2,}/g, " ").replace(/\s+([.,!?;:])/g, "$1").trim();
  }

  function parseDeltaCandidate(kind, text) {
    if (!STAT_KINDS.includes(String(kind || ""))) return null;
    const cleaned = cleanOwnIcon(kind, text).replace(/−/g, "-");
    if (/\bцель\b/i.test(cleaned)) return null;
    const signed = cleaned.match(/([+-])\s*(\d+)/);
    if (signed) {
      const n = parseInt(signed[2], 10);
      if (Number.isFinite(n) && n > 0) return signed[1] === "-" ? -n : n;
    }
    const unsigned = cleaned.match(/\b(\d+)\b/);
    if (!unsigned) return null;
    const n = parseInt(unsigned[1], 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (/(потрат|списан|уменьш|сниз|расход|штраф|оплат|стоим|минус|ушл)/i.test(cleaned)) return -n;
    if (/(получ|увелич|вырос|рост|доход|возврат|награ|плюс|пришл)/i.test(cleaned)) return n;
    return null;
  }

  function emptyBurst() {
    return { authoritative: Object.create(null), candidates: Object.create(null), messages: [] };
  }

  const toastState = {
    pending: emptyBurst(),
    visible: { deltas: Object.create(null), messages: [], lastUpdateAt: 0 },
    flushTimer: null,
    hideTimer: null
  };

  function addUniqueMessage(list, text) {
    const value = String(text || "").trim();
    if (value && !list.includes(value)) list.push(value);
  }

  function addCandidate(kind, delta, text) {
    const key = String(kind || "");
    if (!STAT_KINDS.includes(key) || !Number.isFinite(delta) || !delta) return;
    const list = toastState.pending.candidates[key] || (toastState.pending.candidates[key] = []);
    const signature = `${delta}|${String(text || "").trim()}`;
    if (!list.some((entry) => entry.signature === signature)) list.push({ delta: delta | 0, signature });
  }

  function addAuthoritativeDelta(kind, delta) {
    const key = String(kind || "");
    const value = Number(delta || 0) | 0;
    if (!STAT_KINDS.includes(key) || !value) return;
    toastState.pending.authoritative[key] = (toastState.pending.authoritative[key] || 0) + value;
  }

  function neutralizeLegacyStatToasts() {
    try {
      document.querySelectorAll('.statToast--delta, [id^="statToast_"]').forEach((el) => {
        if (el && el.id === "stage6UnifiedStatToast") return;
        try { el.remove(); } catch (_) { try { el.style.display = "none"; } catch (_) {} }
      });
    } catch (_) {}
  }

  function formatDelta(profile, kind, delta) {
    const value = Number(delta || 0) | 0;
    if (!value) return "";
    const abs = Math.abs(value);
    const templates = Object.freeze({
      boomer: Object.freeze({
        points: value > 0 ? "Баланс пополнен на {X}." : "Списано {X}.",
        rep: value > 0 ? "Репутация выросла на {X}." : "Репутация снизилась на {X}.",
        influence: value > 0 ? "Влияние увеличилось на {X}." : "Влияние снизилось на {X}.",
        wins: value > 0 ? "Победа." : "Поражение."
      }),
      genX: Object.freeze({
        points: value > 0 ? "+{X} в карман." : "−{X}. Ну бывает.",
        rep: value > 0 ? "Репутация +{X}. Нормально." : "Репутация −{X}. Облом.",
        influence: value > 0 ? "Влияние +{X}. Вес появился." : "Влияние −{X}.",
        wins: value > 0 ? "Нормально разобрались." : "Вот это облом."
      }),
      millennial: Object.freeze({
        points: value > 0 ? "Баланс: +{X}. Наконец-то." : "Баланс: −{X}. Бюджет снова страдает.",
        rep: value > 0 ? "Репутация +{X}. Карма пошла вверх." : "Репутация −{X}. Интернет помнит всё.",
        influence: value > 0 ? "Влияние +{X}. Кажется, нас услышали." : "Влияние −{X}.",
        wins: value > 0 ? "Победа. Можно выдохнуть." : "Ну всё, приехали."
      }),
      zoomer: Object.freeze({
        points: value > 0 ? "+{X} к банку 💸" : "−{X} 💀",
        rep: value > 0 ? "Репа +{X} 📈" : "Репа −{X} 💀",
        influence: value > 0 ? "Влияние +{X}. Имба." : "Влияние −{X}.",
        wins: value > 0 ? "W. Разнесли." : "Нас вынесли 💀"
      }),
      alpha: Object.freeze({
        points: value > 0 ? "+{X}💰 W" : "−{X}💰 L",
        rep: value > 0 ? "+{X}⭐ · аура ↑" : "−{X}⭐ aura−",
        influence: value > 0 ? "+{X}⚡ W" : "−{X}⚡ L",
        wins: value > 0 ? "W" : "L 💀"
      })
    });
    const bucket = templates[profile] || templates.millennial;
    return renderSimpleTemplate(bucket[kind] || "", { X: abs });
  }

  function targetRepMessage(profile, amount) {
    const n = Math.abs(Number(amount || 1) | 0) || 1;
    if (n === 1 && COMBINED_RESPECT_COPY[profile]) {
      return COMBINED_RESPECT_COPY[profile].replace(/^(Списана 1 монета\.|−1 из кармана\.|Баланс −1\.|−1💰 тебе ·|−1💰 \/)\s*/, "").trim();
    }
    if (profile === "boomer") return `Репутация цели выросла на ${n}.`;
    if (profile === "genX") return `Цели +${n} к репутации.`;
    if (profile === "zoomer") return `+${n}⭐ цели.`;
    if (profile === "alpha") return `цели +${n}⭐`;
    return `Цели +${n} к репутации.`;
  }

  function renderBurstText(profile, burst) {
    const parts = [];
    STAT_KINDS.forEach((kind) => {
      const value = burst.deltas[kind] || 0;
      const line = formatDelta(profile, kind, value);
      if (line) parts.push(line);
    });
    burst.messages.forEach((message) => addUniqueMessage(parts, message));
    if (profile === "boomer") return parts.join(" ");
    if (profile === "alpha") return parts.join(" / ");
    return parts.join(" · ");
  }

  function positionUnifiedToast(el) {
    if (!el || typeof document === "undefined") return;
    const anchor = document.getElementById("balance") || document.getElementById("topBar");
    if (!anchor || !anchor.getBoundingClientRect) return;
    const r = anchor.getBoundingClientRect();
    el.style.left = `${Math.round(r.left + (r.width / 2))}px`;
    el.style.top = `${Math.round(r.bottom + 8)}px`;
    el.style.transform = "translateX(-50%)";
  }

  function ensureUnifiedToast() {
    let el = document.getElementById("stage6UnifiedStatToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "stage6UnifiedStatToast";
      el.className = "statToast statToast--stage6-unified";
      el.dataset.stage6Unified = "1";
      el.onclick = () => {
        el.style.display = "none";
        toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };
      };
      document.body.appendChild(el);
    }
    return el;
  }

  function resolvePendingBurst() {
    const burst = { deltas: Object.create(null), messages: [] };
    STAT_KINDS.forEach((kind) => {
      const authoritative = toastState.pending.authoritative[kind] || 0;
      if (authoritative) {
        burst.deltas[kind] = authoritative;
        return;
      }
      const candidates = toastState.pending.candidates[kind] || [];
      if (candidates.length) burst.deltas[kind] = candidates.reduce((sum, entry) => sum + (entry.delta | 0), 0);
    });
    toastState.pending.messages.forEach((message) => addUniqueMessage(burst.messages, message));
    toastState.pending = emptyBurst();
    return burst;
  }

  function flushUnifiedToast() {
    toastState.flushTimer = null;
    const burst = resolvePendingBurst();
    const hasDelta = STAT_KINDS.some((kind) => !!burst.deltas[kind]);
    if (!hasDelta && !burst.messages.length) return;

    const now = Date.now();
    const canMerge = toastState.visible.lastUpdateAt > 0 && (now - toastState.visible.lastUpdateAt) <= ACTIVE_MERGE_MS;
    if (!canMerge) toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };

    STAT_KINDS.forEach((kind) => {
      const value = burst.deltas[kind] || 0;
      if (value) toastState.visible.deltas[kind] = (toastState.visible.deltas[kind] || 0) + value;
    });
    burst.messages.forEach((message) => addUniqueMessage(toastState.visible.messages, message));
    toastState.visible.lastUpdateAt = now;

    neutralizeLegacyStatToasts();
    const el = ensureUnifiedToast();
    const text = renderBurstText(activeProfile(), toastState.visible);
    if (!text) return;
    el.textContent = text;
    positionUnifiedToast(el);
    el.style.display = "block";
    el.style.opacity = "1";

    try { clearTimeout(toastState.hideTimer); } catch (_) {}
    toastState.hideTimer = setTimeout(() => {
      try { el.style.display = "none"; } catch (_) {}
      toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };
    }, VISIBLE_MS);
  }

  function scheduleToastFlush() {
    if (toastState.flushTimer) return;
    toastState.flushTimer = setTimeout(flushUnifiedToast, COALESCE_MS);
  }

  function canonicalNonDeltaToast(kind, text) {
    const profile = activeProfile();
    let value = cleanOwnIcon(kind, text);
    if (!value) return "";

    if (kind === "rep" && /\bцель\b/i.test(value)) {
      const amountMatch = value.replace(/−/g, "-").match(/\+\s*(\d+)/);
      if (amountMatch) return targetRepMessage(profile, parseInt(amountMatch[1], 10));
    }

    value = canonicalizeLegacySystemPhrase(profile, value);
    if (profile !== "zoomer" && profile !== "alpha") return value;
    const replacements = [
      [/кошел[её]к в нуле/ig, "Нет денег"],
      [/зв[её]зд не завезли/ig, "Нет репутации"],
      [/лут прилетел/ig, profile === "alpha" ? "Награда" : "Награда получена"],
      [/минуснули/ig, "Штраф"],
      [/репа/ig, "репутация"],
      [/без движухи/ig, "без изменений"],
      [/залетел/ig, "отправлен"],
      [/зашли/ig, "получены"],
      [/ушли/ig, "списаны"]
    ];
    replacements.forEach(([pattern, replacement]) => { value = value.replace(pattern, replacement); });
    return value.replace(/\s{2,}/g, " ").trim();
  }

  function installUnifiedToastOwner() {
    neutralizeLegacyStatToasts();

    const show = function stage6UnifiedShowStatToastV4(kind, text) {
      const key = STAT_KINDS.includes(String(kind || "")) ? String(kind) : "points";
      const candidate = parseDeltaCandidate(key, text);
      if (candidate) addCandidate(key, candidate, text);
      else addUniqueMessage(toastState.pending.messages, canonicalNonDeltaToast(key, text));
      scheduleToastFlush();
      return null;
    };
    show.__stage6UnifiedToastV4 = true;

    const emit = function stage6UnifiedEmitStatDeltaV4(kind, delta) {
      addAuthoritativeDelta(kind, delta);
      scheduleToastFlush();
      return null;
    };
    emit.__stage6UnifiedToastV4 = true;

    UI.showStatToast = show;
    UI.emitStatDelta = emit;
    UI.showInfluenceToast = (text) => UI.showStatToast("influence", text);

    window.addEventListener("resize", () => {
      const el = document.getElementById("stage6UnifiedStatToast");
      if (el && el.style.display !== "none") positionUnifiedToast(el);
    });
  }

  const LABEL_VARIANTS = Object.freeze({
    attack: new Set(["Вброс", "Аргумент", "Атака", "Атк", "Ход"]),
    defense: new Set(["Ответка", "Ответ", "Контраргумент"]),
    dismiss: new Set(["Отвали", "Отойти", "Отказаться", "Стоп"]),
    escape: new Set(["Свалить", "Уйти", "Выйти"])
  });

  function replaceSemanticExactText(el, variants, target) {
    if (!el || !target) return;
    const current = String(el.textContent || "").trim();
    if (variants.has(current) && current !== target) el.textContent = target;
  }

  function routeScopedNodeText(root, copy) {
    if (!root || typeof NodeFilter === "undefined") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && !parent.closest("#chatLog") && !parent.closest("#dmLog")) {
        const before = String(node.nodeValue || "");
        const trimmed = before.trim();
        let after = before;
        if (/^Вброс:\s*/i.test(trimmed)) after = before.replace(/Вброс:\s*/i, `${copy.attackBadge}: `);
        else if (trimmed === "Вброс" || trimmed === "Атк") after = before.replace(trimmed, copy.attackBadge);
        else if (trimmed === "Ответка" || trimmed === "Контраргумент") after = before.replace(trimmed, copy.defenseBadge);
        else if (trimmed === "Мой контраргумент") after = before.replace(trimmed, copy.ownDefenseLabel);
        else if (trimmed === "Аргумент оппонента") after = before.replace(trimmed, copy.opponentArgLabel);
        else if (trimmed === "Отвали" || trimmed === "Свалить") {
          const target = trimmed === "Отвали" ? copy.dismiss : copy.escape;
          after = before.replace(trimmed, target);
        }
        if (after !== before) node.nodeValue = after;
      }
      node = walker.nextNode();
    }
  }

  function syncHardcodedControls() {
    if (typeof document === "undefined") return;
    const profile = activeProfile();
    const copy = CONTROL_COPY[profile] || CONTROL_COPY.millennial;
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el && String(el.textContent || "") !== value) el.textContent = value;
    };
    const setPlaceholder = (id, value) => {
      const el = document.getElementById(id);
      if (el && el.placeholder !== value) el.placeholder = value;
    };

    setPlaceholder("chatInput", copy.chatPlaceholder);
    setText("btnSend", copy.chatSend);
    setPlaceholder("dmInput", copy.dmPlaceholder);
    setText("dmSend", copy.dmSend);
    setText("btnMenu", copy.menu);

    const dmHeader = document.querySelector("#dmBlock .headerTitleText");
    if (dmHeader && dmHeader.textContent !== copy.dmHeader) dmHeader.textContent = copy.dmHeader;
    const dmTitle = document.getElementById("dmTitle");
    if (dmTitle) {
      const firstText = Array.from(dmTitle.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (firstText) {
        const raw = String(firstText.nodeValue || "");
        firstText.nodeValue = raw.includes(":") ? raw.replace(/^[^:]+:/, `${copy.dmHeader}:`) : copy.dmHeader;
      }
    }
    const battlesHeader = document.querySelector("#battlesBlock .battleTitleText");
    if (battlesHeader && battlesHeader.textContent !== copy.battlesHeader) battlesHeader.textContent = copy.battlesHeader;
    const eventsHeader = document.querySelector("#eventsBlock .headerTitleText");
    const eventsText = copy.eventsHeader || (typeof Data.t === "function" ? Data.t("events_header") : "События");
    if (eventsHeader && eventsHeader.textContent !== eventsText) eventsHeader.textContent = eventsText;

    document.querySelectorAll("#teachPanel .badge").forEach((el) => {
      replaceSemanticExactText(el, LABEL_VARIANTS.attack, copy.attackBadge);
      replaceSemanticExactText(el, LABEL_VARIANTS.defense, copy.defenseBadge);
    });

    const app = document.getElementById("app");
    if (app) {
      app.querySelectorAll("button, .miniBtn").forEach((el) => {
        replaceSemanticExactText(el, LABEL_VARIANTS.dismiss, copy.dismiss);
        replaceSemanticExactText(el, LABEL_VARIANTS.escape, copy.escape);
      });
    }

    routeScopedNodeText(document.getElementById("battlesBlock"), copy);
    routeScopedNodeText(document.getElementById("teachPanel"), copy);
    routeScopedNodeText(document.getElementById("dmActions"), copy);
  }

  function eventTextForProfile(text, profile) {
    const copy = CONTROL_COPY[profile] || CONTROL_COPY.millennial;
    return String(text || "")
      .replace(/\bОтвали\b/g, copy.dismiss)
      .replace(/\bСвалить\b/g, copy.escape)
      .replace(/\bВброс\b/g, copy.attackBadge)
      .replace(/\bОтветка\b/g, copy.defenseBadge)
      .replace(/\bконтраргумент\b/gi, copy.defenseBadge.toLowerCase());
  }

  function syncEventCopy() {
    if (typeof document === "undefined" || typeof NodeFilter === "undefined") return;
    const root = document.getElementById("eventsBody");
    if (!root) return;
    const profile = activeProfile();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const before = String(node.nodeValue || "");
      const after = eventTextForProfile(before, profile);
      if (after !== before) node.nodeValue = after;
      node = walker.nextNode();
    }
  }

  let syncing = false;
  function syncVisibleProfileCopy() {
    if (syncing) return;
    syncing = true;
    try {
      if (document.body) document.body.dataset.uiProfile = activeProfile();
      syncHardcodedControls();
      syncEventCopy();
    } finally {
      syncing = false;
    }
  }

  let syncQueued = false;
  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    const run = () => { syncQueued = false; syncVisibleProfileCopy(); };
    if (typeof queueMicrotask === "function") queueMicrotask(run);
    else setTimeout(run, 0);
  }

  function installProfileChangeHook() {
    if (typeof Data.setUiProfile !== "function" || Data.setUiProfile.__stage6FinalPresentationV4Wrapped) return;
    const original = Data.setUiProfile;
    const wrapped = function stage6ProfileSetV4(profile) {
      const result = original.call(this, profile);
      queueSync();
      return result;
    };
    wrapped.__stage6FinalPresentationV4Wrapped = true;
    wrapped.__stage6FinalPresentationOriginal = original;
    Data.setUiProfile = wrapped;
  }

  function installScopedObserver() {
    if (typeof MutationObserver !== "function" || typeof document === "undefined") return null;
    const root = document.getElementById("app");
    if (!root) return null;
    const observer = new MutationObserver(() => queueSync());
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return observer;
  }

  function installProfileWatcher() {
    let last = activeProfile();
    return setInterval(() => {
      const current = activeProfile();
      if (current === last) return;
      last = current;
      toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };
      const toast = document.getElementById("stage6UnifiedStatToast");
      if (toast) toast.style.display = "none";
      queueSync();
    }, 250);
  }

  function visibleRoleLabel(role, profile) {
    const row = NPC_VISIBLE_ROLE_LABELS[String(role || "").trim().toUpperCase()];
    if (!row) return String(role || "");
    const key = normalizeProfileKey(profile || activeProfile());
    return row[key] || row.millennial || String(role || "");
  }

  patchProfileDictionaries();
  installSystemPresentationRouting();
  installUnifiedToastOwner();
  installProfileChangeHook();
  const observer = installScopedObserver();
  const profileWatcher = installProfileWatcher();
  syncVisibleProfileCopy();

  Game.__DEV.__stage6FinalPresentationV4Installed = true;
  Game.__DEV.__stage6FinalPresentationV4Observer = observer;
  Game.__DEV.__stage6FinalPresentationV4ProfileWatcher = profileWatcher;
  Game.__DEV.__stage6Step9NpcVisibleRoleLabels = NPC_VISIBLE_ROLE_LABELS;
  Game.__DEV.stage6Step9VisibleRoleLabel = visibleRoleLabel;

  Game.__DEV.previewStage6FinalProfileV4 = function previewStage6FinalProfileV4(profile) {
    const key = normalizeProfileKey(profile);
    const layer = Data.TEXTS && Data.TEXTS[key] ? Data.TEXTS[key] : {};
    return {
      profile: key,
      controls: CONTROL_COPY[key],
      text: {
        events_header: layer.events_header,
        battle_action_accept: layer.battle_action_accept,
        battle_action_decline: layer.battle_action_decline,
        battle_action_attack: layer.battle_action_attack,
        escape_button_label: layer.escape_button_label,
        dm_empty: layer.dm_empty,
        teach_sent_dm: layer.teach_sent_dm,
        teach_sent_chat: layer.teach_sent_chat,
        invite_open_hint: layer.invite_open_hint,
        invite_invalid: layer.invite_invalid
      },
      npcRoleLabels: Object.fromEntries(Object.keys(NPC_VISIBLE_ROLE_LABELS).map((role) => [role, visibleRoleLabel(role, key)]))
    };
  };

  Game.__DEV.previewStage6UnifiedToastV4 = function previewStage6UnifiedToastV4(profile, deltas, messages) {
    const key = normalizeProfileKey(profile);
    return renderBurstText(key, {
      deltas: { ...(deltas || {}) },
      messages: Array.isArray(messages) ? messages.slice() : []
    });
  };

  Game.__DEV.smokeStage6FinalVisualToneRepairOnce = function smokeStage6FinalVisualToneRepairOnce() {
    const previews = Object.fromEntries(PROFILE_KEYS.map((profile) => [profile, Game.__DEV.previewStage6FinalProfileV4(profile)]));
    const startProfiles = Data.START_SCREEN_PROFILE_TEXTS || {};
    const roleProfilesComplete = Object.keys(NPC_VISIBLE_ROLE_LABELS).every((role) => (
      PROFILE_KEYS.every((profile) => !!visibleRoleLabel(role, profile))
    ));
    const checks = {
      installed: Game.__DEV.__stage6FinalPresentationV4Installed === true,
      fiveDistinctProfiles: new Set(PROFILE_KEYS.map((profile) => JSON.stringify(previews[profile]))).size === 5,
      genXFirstClass: !!(Data.TEXTS && Data.TEXTS.genX) && normalizeProfileKey("genx") === "genX",
      genXDmHeaderFrozen: previews.genX && previews.genX.controls.dmHeader === "Личка",
      genXBattlesFrozen: previews.genX && previews.genX.controls.battlesHeader === "Стычки",
      alphaExplicitAttackAction: previews.alpha && previews.alpha.text.battle_action_attack === "Ход",
      alphaNoZoomerEventsHeader: previews.alpha && previews.alpha.text.events_header === "Ивенты",
      startGenXExplicit: startProfiles.genX && startProfiles.genX.birth_digits_label === "Две последние цифры года рождения",
      startAlphaExplicit: startProfiles.alpha && startProfiles.alpha.async_value === "асинхронная игра · играй когда хочешь",
      frozenCostPlaceholdersPreserved: Data.TEXTS.genX && Data.TEXTS.genX.argument_reroll_action === "Другие аргументы - {cost} 💰",
      frozenRepPlaceholderPreserved: Data.TEXTS.alpha && Data.TEXTS.alpha.report_false_repeat === "опять мимо 💀 −{rep}⭐",
      roleProfilesComplete,
      npcGenXRoleLabels: visibleRoleLabel("COP", "genX") === "Мент" && visibleRoleLabel("MAFIA", "genX") === "Братва",
      unifiedToastShowOwned: !!(UI.showStatToast && UI.showStatToast.__stage6UnifiedToastV4),
      unifiedToastDeltaOwned: !!(UI.emitStatDelta && UI.emitStatDelta.__stage6UnifiedToastV4),
      noLegacyDeltaNodesAtInstall: !document.querySelector('.statToast--delta'),
      combinedMillennialPreview: Game.__DEV.previewStage6UnifiedToastV4("millennial", { points: -1, rep: 1 }, ["Цели +1 к репутации."]) === "Баланс: −1. Бюджет снова страдает. · Репутация +1. Карма пошла вверх. · Цели +1 к репутации.",
      combinedGenXPreview: Game.__DEV.previewStage6UnifiedToastV4("genX", { points: -1, rep: 1 }, []) === "−1. Ну бывает. · Репутация +1. Нормально.",
      combinedZoomerPreview: Game.__DEV.previewStage6UnifiedToastV4("zoomer", { points: -1, rep: 1 }, []) === "−1 💀 · Репа +1 📈",
      combinedAlphaPreview: Game.__DEV.previewStage6UnifiedToastV4("alpha", { points: -1, rep: 1 }, []) === "−1💰 L / +1⭐ · аура ↑",
      combinedBoomerPreview: Game.__DEV.previewStage6UnifiedToastV4("boomer", { points: -1, rep: 1 }, []) === "Списано 1. Репутация выросла на 1.",
      targetRepNotParsedAsPlayerDelta: parseDeltaCandidate("rep", "Цель получила +1 ⭐.") === null,
      profileChangeWrapped: !!(Data.setUiProfile && Data.setUiProfile.__stage6FinalPresentationV4Wrapped),
      systemPresentationWrapped: !!(Game.System && Game.System.__stage6FinalPresentationV4Wrapped),
      observerInstalled: !!observer,
      profileWatcherInstalled: !!profileWatcher
    };
    const failures = Object.keys(checks).filter((key) => checks[key] !== true);
    return {
      ok: failures.length === 0,
      buildTag: BUILD_TAG,
      smokeVersion: SMOKE_VERSION,
      activeProfile: activeProfile(),
      checks,
      failures,
      previews,
      toastPreviews: {
        boomer: Game.__DEV.previewStage6UnifiedToastV4("boomer", { points: -1, rep: 1 }, []),
        genX: Game.__DEV.previewStage6UnifiedToastV4("genX", { points: -1, rep: 1 }, []),
        millennial: Game.__DEV.previewStage6UnifiedToastV4("millennial", { points: -1, rep: 1 }, []),
        zoomer: Game.__DEV.previewStage6UnifiedToastV4("zoomer", { points: -1, rep: 1 }, []),
        alpha: Game.__DEV.previewStage6UnifiedToastV4("alpha", { points: -1, rep: 1 }, [])
      },
      targetRepPreviews: {
        boomer: targetRepMessage("boomer", 1),
        genX: targetRepMessage("genX", 1),
        millennial: targetRepMessage("millennial", 1),
        zoomer: targetRepMessage("zoomer", 1),
        alpha: targetRepMessage("alpha", 1)
      }
    };
  };

  Game.__DEV.smokeStage6Step9FiveProfileRuntimeOnce = Game.__DEV.smokeStage6FinalVisualToneRepairOnce;

  console.warn("STAGE6_FINAL_PRESENTATION_V4_READY", {
    buildTag: BUILD_TAG,
    smokeVersion: SMOKE_VERSION,
    profile: activeProfile(),
    unifiedToast: true
  });
})();
