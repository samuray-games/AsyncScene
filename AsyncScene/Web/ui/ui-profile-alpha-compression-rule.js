window.Game = window.Game || {};
(function () {
  const toLines = (text) => String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const LOCKED_INVENTORY_SOURCE = String.raw`
TXT_0001 | shared | start_screen | start_screen_title | start_title | AsyncScene
TXT_0002 | shared | start_screen | start_screen_title | start_title | AsyncScene
TXT_0003 | shared | start_screen | start_screen_intro | startIntroPick | Оппонент задаёт риск.
TXT_0004 | shared | start_screen | start_screen_intro | startIntroStake | Ставка списывает ресурс.
TXT_0005 | shared | start_screen | start_screen_intro | startIntroResult | Итог виден сразу.
TXT_0006 | shared | start_screen | start_screen_intro | startEconomyHonesty | Цена и итог сразу.
TXT_0007 | shared | button | start_screen_action | startActionStart | Старт
TXT_0008 | shared | button | start_screen_action | startActionRules | Суть
TXT_0009 | millennial | label | start_profile_millennial | birth_digits_label | Последние 2 цифры года рождения
TXT_0010 | millennial | button | start_profile_millennial | digit_up_first | Увеличить первую цифру
TXT_0011 | millennial | button | start_profile_millennial | digit_down_first | Уменьшить первую цифру
TXT_0012 | millennial | button | start_profile_millennial | digit_up_second | Увеличить вторую цифру
TXT_0013 | millennial | button | start_profile_millennial | digit_down_second | Уменьшить вторую цифру
TXT_0014 | millennial | tooltip | start_profile_millennial | profile_helper | Только для интерфейса. Не сохраняем. Можно поменять позже.
TXT_0015 | millennial | label | start_profile_millennial | fantasy_birth_label | я на самом деле чувствую будто я родился в …
TXT_0016 | millennial | button | start_profile_millennial | start_continue | Продолжить
TXT_0017 | millennial | button | start_profile_millennial | start_start | Старт
TXT_0018 | millennial | button | start_profile_millennial | start_reset | Сбросить старт
TXT_0019 | zoomer | button | start_profile_zoomer | start_continue | Погнали
TXT_0020 | zoomer | button | start_profile_zoomer | start_reset | Снести выбор
TXT_0021 | zoomer | button | start_profile_zoomer | rules_action | Правила без душноты
TXT_0022 | zoomer | button | start_profile_zoomer | start_action | Войти
TXT_0023 | shared | notification | system_copy | saved | Готово.
TXT_0024 | shared | error | system_copy | missingMessage | Сообщение недоступно.
TXT_0025 | shared | error | system_copy | insufficientPoints | Не хватает 💰.
TXT_0026 | shared | error | system_copy | pointsLowBattle | Мало 💰 на баттл.
TXT_0027 | shared | error | system_copy | unavailable | Недоступно.
TXT_0028 | shared | error | system_copy | notFound | Не найдено.
TXT_0029 | shared | error | system_copy | choosePlayer | Игрок не указан.
TXT_0030 | shared | error | system_copy | reportFalsePenalty | Штраф: -5 💰.
TXT_0031 | shared | warning | system_copy | checkInput | Ввод некорректен.
TXT_0032 | shared | warning | system_copy | cooldownShort | Кулдаун активен.
TXT_0033 | shared | cop_flow | system_copy | copCooldown | Проверка займет время.
TXT_0034 | shared | notification | system_copy | pointsDeltaPlusOne | +1💰
TXT_0035 | shared | respect | system_copy | repDeltaPlusOne | +1⭐
TXT_0036 | shared | notification | system_copy | voteAccepted | Голос учтён.
TXT_0037 | shared | report | system_copy | reportPending | Проверяю.
TXT_0038 | shared | report | system_copy | reportTrueReward | Сдать {name}: +2💰.
TXT_0039 | shared | report | system_copy | reportOk | Коп: {name} сдан, +2💰.
TXT_0040 | shared | training | system_copy | trainingSent | Аргумент: {teacher} → {student}.
TXT_0041 | shared | battle | system_copy | rematchRequested | {name} зовёт на реванш.
TXT_0042 | shared | button | system_copy | escapePaid | Свалить за 1💰.
TXT_0043 | shared | notification | system_copy | pointsDeltaRefund | +1💰 возврат.
TXT_0044 | shared | notification | system_copy | pointsDeltaRefundMajority | +1💰 возврат большинству.
TXT_0045 | shared | notification | system_copy | pointsDeltaRemainderWin | +1💰 остаток победителю.
TXT_0046 | shared | battle | system_copy | rematchCost | Реванш: -{rematchCost}💰.
TXT_0047 | shared | button | system_copy | escapeVoteCost | Свалить: -{escapeCost}💰.
TXT_0048 | shared | p2p | system_copy | p2pTransferSent | {target}: +{amount}💰.
TXT_0049 | shared | p2p | system_copy | p2pTransferReceived | {target}: +{amount}💰 тебе.
TXT_0050 | shared | system_message | system_events | battleChallenge | {attackerName} [{attackerInf}] бросил вызов.
TXT_0051 | shared | battle | system_events | battleResult | Баттл с {oppName}: {text}.
TXT_0052 | shared | battle | system_events | battleDraw | {a} и {b}: ничья.
TXT_0053 | shared | event | system_events | crowdResolved | Толпа: {name} {aVotes}:{bVotes}.
TXT_0054 | shared | event | system_events | unlockOrange | Оранжевые аргументы открыты.
TXT_0055 | shared | event | system_events | unlockRed | Красные аргументы открыты.
TXT_0056 | shared | event | system_events | unlockBlack | Чёрные аргументы открыты.
TXT_0057 | shared | system_message | system_events | startIntroPick | Оппонент задаёт риск.
TXT_0058 | shared | system_message | system_events | startIntroStake | Ставка списывает ресурс.
TXT_0059 | shared | system_message | system_events | startIntroResult | Итог виден сразу.
TXT_0060 | shared | system_message | system_events | startEconomyHonesty | Цена и итог сразу.
TXT_0061 | shared | button | menu | menu_title | Меню
TXT_0062 | shared | button | menu | return_to_start | К старту
TXT_0063 | shared | label | menu | goal_label | Цель
TXT_0064 | genz | battle | battle_results | battle_win | WIN
TXT_0065 | genz | battle | battle_results | battle_loss | RIP
TXT_0066 | genz | battle | battle_results | battle_draw | DRAW
TXT_0067 | genz | battle | conflict_results | conflict_win | Вы победили в конфликте.
TXT_0068 | genz | battle | conflict_results | conflict_loss | Вы проиграли конфликт.
TXT_0069 | genz | battle | conflict_results | conflict_draw | Конфликт завершился ничьей.
TXT_0070 | genz | button | battle | escape_button_label | Свалить: {X}
TXT_0071 | genz | training | battle | teach_sent_dm | Для {student}: {arg}. Цена {cost} 💰.
TXT_0072 | genz | training | battle | teach_sent_chat | Аргумент: {teacher} → {student}.
TXT_0073 | genz | placeholder | battle | invite_open_hint | Введи точный ник.
TXT_0074 | genz | error | battle | invite_invalid | Игрок не найден.
TXT_0075 | genz | button | battle | menu_title | Меню
TXT_0076 | genz | button | battle | return_to_start | К старту
TXT_0077 | genz | error | battle | menu_unavailable | Недоступно.
TXT_0078 | genz | label | battle | goal_label | Цель
TXT_0079 | shared | cop_flow | cop_templates | cop_report_accept[0] | Понял. Проверяю.
TXT_0080 | shared | cop_flow | cop_templates | cop_report_accept[1] | Принял. Разберусь.
TXT_0081 | shared | cop_flow | cop_templates | cop_busy[0] | Занят, связь позже.
TXT_0082 | shared | cop_flow | cop_templates | cop_busy[1] | Не могу, оформляю дело.
TXT_0083 | shared | cop_flow | cop_templates | cop_report_ok[0] | Проверка сошлась. Вмешался.
TXT_0084 | shared | cop_flow | cop_templates | cop_report_ok[1] | Проверка сошлась. Занялся.
TXT_0085 | shared | cop_flow | cop_templates | cop_report_fail[0] | Не подтвердилось. Факты не сошлись.
TXT_0086 | shared | cop_flow | cop_templates | cop_cooldown[0] | Проверка займет время.
TXT_0087 | genz | tooltip | type_hint | hint_type_who | Ответь: кто?
TXT_0088 | genz | tooltip | type_hint | hint_type_where | Ответь: где?
TXT_0089 | genz | tooltip | type_hint | hint_type_about | Ответь: о ком?
TXT_0090 | genz | tooltip | type_hint | hint_type_yn | Ответь: да или нет?
TXT_0091 | alpha | menu | alpha_tie | tie_start | ТОЛПА
TXT_0092 | alpha | menu | alpha_tie | tie_call_to_action | ВПИСЫВАЙСЯ
TXT_0093 | alpha | menu | alpha_tie | tie_click_name_hint | ТЫКНИ ИМЯ
TXT_0094 | alpha | button | alpha_tie | vote_ok | ✓ ОК
TXT_0095 | alpha | button | alpha_tie | vote_already | ✓ УЖЕ
TXT_0096 | alpha | button | alpha_tie | vote_fail | ✕ НЕ
TXT_0097 | alpha | battle | alpha_battle | battle_win | WIN
TXT_0098 | alpha | battle | alpha_battle | battle_loss | RIP
TXT_0099 | alpha | battle | alpha_battle | battle_draw | DRAW
TXT_0100 | alpha | battle | alpha_battle | conflict_win | Ты вывез.
TXT_0101 | alpha | battle | alpha_battle | conflict_loss | Не вывез.
TXT_0102 | alpha | battle | alpha_battle | conflict_draw | Ничья. Все шумели зря.
TXT_0103 | alpha | battle | alpha_battle | supported_majority | Ты в мейне.
TXT_0104 | alpha | battle | alpha_battle | supported_minority | Ты в андере.
TXT_0105 | alpha | battle | alpha_battle | majority_won | Мейн забрал.
TXT_0106 | alpha | battle | alpha_battle | minority_lost | Андер просел.
TXT_0107 | alpha | battle | alpha_battle | conflict_finished | Драма закрыта.
TXT_0108 | shared | economy | cap_messages | rep | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐.
TXT_0109 | shared | economy | cap_messages | points | Cap: max Points на этой неделе. Используйте, пока не сбросили cap.
TXT_0110 | shared | conflict_feed | cop_templates | intros[0] | {cop.fullName} на связи.
TXT_0111 | shared | conflict_feed | cop_templates | warnings[0] | Опасная точка рядом.
TXT_0112 | shared | warning | cop_templates | warnings[1] | Вызов принят, экипаж в пути.
TXT_0113 | shared | warning | cop_templates | warnings[2] | Ситуация под контролем.
TXT_0114 | shared | notification | cop_templates | chatReplies[0] | Принято, наблюдаю.
TXT_0115 | shared | notification | cop_templates | chatReplies[1] | Факт принят, идем дальше.
TXT_0116 | shared | notification | cop_templates | cooldownReplies[0] | Занят расследованием, связь позже.
TXT_0117 | shared | notification | cop_templates | thanks[0] | Сдача принята - спокойнее.
TXT_0118 | shared | warning | cop_templates | scolds[0] | «Сдать» без фактов - шум.
TXT_0119 | shared | battle | arg_base_y_about | q0 | Кто сегодня на слуху, если не ошибаюсь?
TXT_0120 | shared | battle | arg_base_y_about | a0 | Кажется, про {NAME} говорят.
TXT_0121 | shared | battle | arg_base_y_who | q0 | Кто, как вам кажется, был рядом?
TXT_0122 | shared | battle | arg_base_y_who | a0 | {NAME}.
TXT_0123 | shared | battle | arg_base_y_where | q0 | Где мы сейчас, как вам кажется?
TXT_0124 | shared | battle | arg_base_y_where | a0 | Здесь.
TXT_0125 | shared | battle | arg_base_y_yn | q0 | Вы уверены?
TXT_0126 | shared | battle | arg_base_y_yn | a0 | Да.
TXT_0127 | shared | battle | arg_base_o_about | q0 | Кто сегодня на слуху?
TXT_0128 | shared | battle | arg_base_o_about | a0 | Про {NAME} говорят.
TXT_0129 | shared | battle | arg_base_o_yn | q0 | Вы уверены?
TXT_0130 | shared | npc_say | npc_say_toxic_m | 0 | слабый ход
TXT_0131 | shared | npc_say | npc_say_toxic_m | 1 | отвечай сейчас
TXT_0132 | shared | npc_say | npc_say_bandit_m | 0 | кошелек ближе
TXT_0133 | shared | npc_say | npc_say_bandit_m | 1 | плати и уходи
TXT_0134 | shared | npc_say | npc_say_cop_m | 0 | Принято. Дистанция
TXT_0135 | shared | npc_say | npc_say_mafia_m | 0 | Тише
TXT_0136 | shared | npc_say | npc_say_crowd_m | 0 | ого
TXT_0137 | shared | npc_dm | npc_dm_profile_cop | 0 | Принято. Я рядом.
TXT_0138 | shared | npc_dm | npc_dm_profile_mafia | 0 | Тише. Решим.
TXT_0139 | shared | npc_dm | npc_dm_profile_bandit | 0 | Кошелек ближе.
TXT_0140 | shared | npc_dm | npc_dm_profile_toxic | 0 | Слабый ход.
TXT_0141 | shared | toast | events_vote_toast | showVoteBtnToast | Ты уже проголосовал.
TXT_0142 | shared | toast | events_vote_toast | insufficient_points_vote | Не хватает 💰.
TXT_0143 | shared | toast | battle_rematch | rematch_already_requested | Реванш уже запрошен.
TXT_0144 | shared | toast | battle_rematch | rematch_not_eligible | Недоступно. Баттл не завершён.
TXT_0145 | shared | toast | battle_rematch | rematch_not_found | Недоступно.
TXT_0146 | shared | toast | battle_invite | choose_player | Выбери игрока.
TXT_0147 | shared | toast | battle_invite | target_missing | Такого нет.
TXT_0148 | shared | toast | battle_invite | cooldown_short | Кулдаун активен.
TXT_0149 | shared | toast | battle_invite | insufficient_points | Не хватает 💰.
TXT_0150 | shared | toast | respect_flow | respect_no_points | Не хватает 💰.
TXT_0151 | shared | toast | respect_flow | respect_pair_daily | Уже было уважение сегодня этому персонажу.
TXT_0152 | shared | toast | respect_flow | respect_no_chain | Цепочка A->B->A сегодня не работает.
TXT_0153 | shared | toast | respect_flow | respect_emitter_empty | Лимит уважения на сегодня исчерпан.
TXT_0154 | shared | toast | respect_flow | respect_fallback | Сейчас не получилось. Попробуй позже.
TXT_0155 | shared | toast | respect_flow | respect_paid | Ты отдал 1💰
TXT_0156 | shared | toast | respect_flow | respect_target_rep | Цель получила +1 ⭐
TXT_0157 | shared | toast | menu_dev_mode | dev_mode_disabled | Dev Mode disabled.
TXT_0158 | shared | toast | menu_dev_mode | dev_mode_unlocked | Dev Mode unlocked on this device.
TXT_0159 | shared | toast | menu_dev_mode | dev_mode_pin_incorrect | Incorrect Dev Mode PIN.
TXT_0160 | shared | toast | menu_lottery | menu_lottery_rano | Рано. Дай паузу.
TXT_0161 | shared | toast | menu_unavailable | menu_unavailable | Недоступно.
TXT_0162 | shared | toast | menu_unavailable | menu_unavailable_again | Недоступно.
TXT_0163 | shared | toast | menu_unavailable | menu_unavailable_notify | Недоступно.
TXT_0164 | shared | toast | events_vote | vote_not_enough_points | Не хватает 💰.
`;

  const manifest = Object.freeze({
    id: "UI_PROFILE_ALPHA_COMPRESSION_RULE",
    stage: "4-alpha",
    step: "2.1",
    name: "Alpha phrase compression rule",
    mode: "mechanical",
    russianRuleLines: Object.freeze(toLines(String.raw`
Фраза: 2-5 слов.
Вводные запрещены.
Условия запрещены.
Действие первым.
Риск первым.
Итог первым.
Смысл сразу.
Без объяснений.
Без инфантилизма.
Текст короче z.
Канон не менять.
Codex не пишет текст.
`)),
    minWords: 2,
    maxWords: 5,
    forbiddenIntroPhrases: Object.freeze([
      "можно",
      "похоже",
      "кажется",
      "если не ошибаюсь",
      "как вам кажется",
      "на самом деле",
      "в этом случае",
      "для этого",
      "попробуй позже",
      "сейчас не получилось"
    ]),
    forbiddenConditionPhrases: Object.freeze([
      "если",
      "когда",
      "при условии",
      "в случае",
      "иначе",
      "чтобы",
      "нужно",
      "требуется"
    ]),
    forbiddenFillerPhrases: Object.freeze([
      "спокойно",
      "немного",
      "просто",
      "давай",
      "попробуй",
      "вероятно",
      "возможно",
      "видимо"
    ]),
    compressionFixtures: Object.freeze([
      Object.freeze({ source: "Можно потерять очки", alpha: "Риск потери очков" }),
      Object.freeze({ source: "Если не хватает денег, действие недоступно", alpha: "Действие недоступно" }),
      Object.freeze({ source: "Проверка займет время", alpha: "Проверка ждёт" }),
      Object.freeze({ source: "Оранжевые аргументы открыты", alpha: "Оранжевые открыты" }),
      Object.freeze({ source: "Сейчас не получилось. Попробуй позже.", alpha: "Не получилось" }),
      Object.freeze({ source: "Недоступно. Баттл не завершён.", alpha: "Баттл не завершён" }),
      Object.freeze({ source: "Уже было уважение сегодня этому персонажу.", alpha: "Уважение уже было" }),
      Object.freeze({ source: "Цепочка A->B->A сегодня не работает.", alpha: "Цепочка закрыта" }),
      Object.freeze({ source: "Лимит уважения на сегодня исчерпан.", alpha: "Лимит уважения" }),
      Object.freeze({ source: "Не подтвердилось. Факты не сошлись.", alpha: "Факты не сошлись" })
    ]),
    lockedInventory: Object.freeze(toLines(LOCKED_INVENTORY_SOURCE))
  });

  window.UI_PROFILE_ALPHA_COMPRESSION_RULE = manifest;
  window.Game.UI_PROFILE_ALPHA_COMPRESSION_RULE = manifest;
  if (!window.Game.__DEV) window.Game.__DEV = {};
  window.Game.__DEV.alphaCompressionRuleManifest = manifest;
  if (typeof module !== "undefined" && module.exports) module.exports = manifest;
})();
