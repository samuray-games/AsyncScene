# UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING

## Scope

- Source rows come from the accepted Step 4.2 exact inventory bundle.
- Boomer targets come from the current accepted boomer allowed lexicon.
- Historical boomer mapping rows are reconciliation inputs only; they do not override the accepted boomer target.
- Every authoritative source row has exactly one resolved boomer equivalent.
- Runtime copy replacement is not part of this step.

## Contract

- buildMarker: UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING
- sourceInventoryEntryCount: 164
- sourceUniqueTextCount: 142
- mappingCount: 164
- changedMappingCount: 116
- identityMappingCount: 48
- coveragePercent: 100
- duplicateMappingsCount: 0
- semanticAmbiguityCount: 0
- conflictingBoomerTargetCount: 0
- placeholderMismatchCount: 0
- lexicalMappingAlignmentCount: 102
- historicalMappingCoverageCount: 85
- runtimeCopyChanged: false
- mappingApplied: false

## Source profile counts

- alpha: 17
- genz: 19
- millennial: 10
- shared: 114
- zoomer: 4

## Exact mapping table

| mappingId | sourceInventoryId | sourceProfile | category | surface | key | sourceText | boomerText | mappingMode | variables |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAP_0001 | TXT_0001 | shared | start_screen | start_screen_title | start_title | AsyncScene | AsyncScene | identity | [] |
| MAP_0002 | TXT_0002 | shared | start_screen | start_screen_title | start_title | AsyncScene | AsyncScene | identity | [] |
| MAP_0003 | TXT_0003 | shared | start_screen | start_screen_intro | startIntroPick | Оппонент задаёт риск. | Оппонент задаёт риск действия. | changed | [] |
| MAP_0004 | TXT_0004 | shared | start_screen | start_screen_intro | startIntroStake | Ставка списывает ресурс. | Ставка списывает ресурс. | identity | [] |
| MAP_0005 | TXT_0005 | shared | start_screen | start_screen_intro | startIntroResult | Итог виден сразу. | Итог виден сразу после действия. | changed | [] |
| MAP_0006 | TXT_0006 | shared | start_screen | start_screen_intro | startEconomyHonesty | Цена и итог сразу. | Цена и итог показаны заранее. | changed | [] |
| MAP_0007 | TXT_0007 | shared | button | start_screen_action | startActionStart | Старт | Начать | changed | [] |
| MAP_0008 | TXT_0008 | shared | button | start_screen_action | startActionRules | Суть | Правила | changed | [] |
| MAP_0009 | TXT_0009 | millennial | label | start_profile_millennial | birth_digits_label | Последние 2 цифры года рождения | Последние две цифры года рождения | changed | [] |
| MAP_0010 | TXT_0010 | millennial | button | start_profile_millennial | digit_up_first | Увеличить первую цифру | Увеличить первую цифру | identity | [] |
| MAP_0011 | TXT_0011 | millennial | button | start_profile_millennial | digit_down_first | Уменьшить первую цифру | Уменьшить первую цифру | identity | [] |
| MAP_0012 | TXT_0012 | millennial | button | start_profile_millennial | digit_up_second | Увеличить вторую цифру | Увеличить вторую цифру | identity | [] |
| MAP_0013 | TXT_0013 | millennial | button | start_profile_millennial | digit_down_second | Уменьшить вторую цифру | Уменьшить вторую цифру | identity | [] |
| MAP_0014 | TXT_0014 | millennial | tooltip | start_profile_millennial | profile_helper | Только для интерфейса. Не сохраняем. Можно поменять позже. | Это влияет только на интерфейс. Выбор можно изменить позже. | changed | [] |
| MAP_0015 | TXT_0015 | millennial | label | start_profile_millennial | fantasy_birth_label | я на самом деле чувствую будто я родился в … | Я скорее ощущаю свой год рождения как … | changed | [] |
| MAP_0016 | TXT_0016 | millennial | button | start_profile_millennial | start_continue | Продолжить | Продолжить | identity | [] |
| MAP_0017 | TXT_0017 | millennial | button | start_profile_millennial | start_start | Старт | Начать | changed | [] |
| MAP_0018 | TXT_0018 | millennial | button | start_profile_millennial | start_reset | Сбросить старт | Сбросить выбор | changed | [] |
| MAP_0019 | TXT_0019 | zoomer | button | start_profile_zoomer | start_continue | Погнали | Продолжить | changed | [] |
| MAP_0020 | TXT_0020 | zoomer | button | start_profile_zoomer | start_reset | Снести выбор | Сбросить выбор | changed | [] |
| MAP_0021 | TXT_0021 | zoomer | button | start_profile_zoomer | rules_action | Правила без душноты | Краткие правила | changed | [] |
| MAP_0022 | TXT_0022 | zoomer | button | start_profile_zoomer | start_action | Войти | Войти | identity | [] |
| MAP_0023 | TXT_0023 | shared | notification | system_copy | saved | Готово. | Готово. | identity | [] |
| MAP_0024 | TXT_0024 | shared | error | system_copy | missingMessage | Сообщение недоступно. | Сообщение недоступно. | identity | [] |
| MAP_0025 | TXT_0025 | shared | error | system_copy | insufficientPoints | Не хватает 💰. | Недостаточно 💰. | changed | [] |
| MAP_0026 | TXT_0026 | shared | error | system_copy | pointsLowBattle | Мало 💰 на баттл. | Недостаточно 💰 для баттла. | changed | [] |
| MAP_0027 | TXT_0027 | shared | error | system_copy | unavailable | Недоступно. | Действие недоступно. | changed | [] |
| MAP_0028 | TXT_0028 | shared | error | system_copy | notFound | Не найдено. | Ничего не найдено. | changed | [] |
| MAP_0029 | TXT_0029 | shared | error | system_copy | choosePlayer | Игрок не указан. | Игрок не выбран. | changed | [] |
| MAP_0030 | TXT_0030 | shared | error | system_copy | reportFalsePenalty | Штраф: -5 💰. | Штраф: -5 💰. | identity | [] |
| MAP_0031 | TXT_0031 | shared | warning | system_copy | checkInput | Ввод некорректен. | Ввод некорректен. | identity | [] |
| MAP_0032 | TXT_0032 | shared | warning | system_copy | cooldownShort | Кулдаун активен. | Нужно подождать перед повторным действием. | changed | [] |
| MAP_0033 | TXT_0033 | shared | cop_flow | system_copy | copCooldown | Проверка займет время. | Проверка займёт некоторое время. | changed | [] |
| MAP_0034 | TXT_0034 | shared | notification | system_copy | pointsDeltaPlusOne | +1💰 | +1 💰 | changed | [] |
| MAP_0035 | TXT_0035 | shared | respect | system_copy | repDeltaPlusOne | +1⭐ | +1 ⭐ | changed | [] |
| MAP_0036 | TXT_0036 | shared | notification | system_copy | voteAccepted | Голос учтён. | Голос учтён. | identity | [] |
| MAP_0037 | TXT_0037 | shared | report | system_copy | reportPending | Проверяю. | Проверка началась. | changed | [] |
| MAP_0038 | TXT_0038 | shared | report | system_copy | reportTrueReward | Сдать {name}: +2💰. | Сообщить о {name}: +2 💰. | changed | [name] |
| MAP_0039 | TXT_0039 | shared | report | system_copy | reportOk | Коп: {name} сдан, +2💰. | Коп принял сообщение о {name}: +2 💰. | changed | [name] |
| MAP_0040 | TXT_0040 | shared | training | system_copy | trainingSent | Аргумент: {teacher} → {student}. | Аргумент передан: {teacher} → {student}. | changed | [student,teacher] |
| MAP_0041 | TXT_0041 | shared | battle | system_copy | rematchRequested | {name} зовёт на реванш. | {name} предлагает реванш. | changed | [name] |
| MAP_0042 | TXT_0042 | shared | button | system_copy | escapePaid | Свалить за 1💰. | Выйти за 1 💰. | changed | [] |
| MAP_0043 | TXT_0043 | shared | notification | system_copy | pointsDeltaRefund | +1💰 возврат. | Возврат: +1 💰. | changed | [] |
| MAP_0044 | TXT_0044 | shared | notification | system_copy | pointsDeltaRefundMajority | +1💰 возврат большинству. | Возврат большинству: +1 💰. | changed | [] |
| MAP_0045 | TXT_0045 | shared | notification | system_copy | pointsDeltaRemainderWin | +1💰 остаток победителю. | Остаток победителю: +1 💰. | changed | [] |
| MAP_0046 | TXT_0046 | shared | battle | system_copy | rematchCost | Реванш: -{rematchCost}💰. | Реванш: -{rematchCost} 💰. | changed | [rematchCost] |
| MAP_0047 | TXT_0047 | shared | button | system_copy | escapeVoteCost | Свалить: -{escapeCost}💰. | Выйти: -{escapeCost} 💰. | changed | [escapeCost] |
| MAP_0048 | TXT_0048 | shared | p2p | system_copy | p2pTransferSent | {target}: +{amount}💰. | {target}: +{amount} 💰. | changed | [amount,target] |
| MAP_0049 | TXT_0049 | shared | p2p | system_copy | p2pTransferReceived | {target}: +{amount}💰 тебе. | Вы получили от {target}: +{amount} 💰. | changed | [amount,target] |
| MAP_0050 | TXT_0050 | shared | system_message | system_events | battleChallenge | {attackerName} [{attackerInf}] бросил вызов. | {attackerName} [{attackerInf}] начал конфликт. | changed | [attackerInf,attackerName] |
| MAP_0051 | TXT_0051 | shared | battle | system_events | battleResult | Баттл с {oppName}: {text}. | Баттл с {oppName}: {text}. | identity | [oppName,text] |
| MAP_0052 | TXT_0052 | shared | battle | system_events | battleDraw | {a} и {b}: ничья. | {a} и {b}: ничья. | identity | [a,b] |
| MAP_0053 | TXT_0053 | shared | event | system_events | crowdResolved | Толпа: {name} {aVotes}:{bVotes}. | Голосование толпы: {name} {aVotes}:{bVotes}. | changed | [aVotes,bVotes,name] |
| MAP_0054 | TXT_0054 | shared | event | system_events | unlockOrange | Оранжевые аргументы открыты. | Оранжевые аргументы открыты. | identity | [] |
| MAP_0055 | TXT_0055 | shared | event | system_events | unlockRed | Красные аргументы открыты. | Красные аргументы открыты. | identity | [] |
| MAP_0056 | TXT_0056 | shared | event | system_events | unlockBlack | Чёрные аргументы открыты. | Чёрные аргументы открыты. | identity | [] |
| MAP_0057 | TXT_0057 | shared | system_message | system_events | startIntroPick | Оппонент задаёт риск. | Оппонент задаёт риск действия. | changed | [] |
| MAP_0058 | TXT_0058 | shared | system_message | system_events | startIntroStake | Ставка списывает ресурс. | Ставка списывает ресурс. | identity | [] |
| MAP_0059 | TXT_0059 | shared | system_message | system_events | startIntroResult | Итог виден сразу. | Итог виден сразу после действия. | changed | [] |
| MAP_0060 | TXT_0060 | shared | system_message | system_events | startEconomyHonesty | Цена и итог сразу. | Цена и итог показаны заранее. | changed | [] |
| MAP_0061 | TXT_0061 | shared | button | menu | menu_title | Меню | Меню | identity | [] |
| MAP_0062 | TXT_0062 | shared | button | menu | return_to_start | К старту | К стартовому экрану | changed | [] |
| MAP_0063 | TXT_0063 | shared | label | menu | goal_label | Цель | Цель | identity | [] |
| MAP_0064 | TXT_0064 | genz | battle | battle_results | battle_win | Победа | Победа | identity | [] |
| MAP_0065 | TXT_0065 | genz | battle | battle_results | battle_loss | Поражение | Поражение | identity | [] |
| MAP_0066 | TXT_0066 | genz | battle | battle_results | battle_draw | Толпа решает | Решает голосование | changed | [] |
| MAP_0067 | TXT_0067 | genz | battle | conflict_results | conflict_win | Вы победили в конфликте. | Вы победили в конфликте. | identity | [] |
| MAP_0068 | TXT_0068 | genz | battle | conflict_results | conflict_loss | Вы проиграли конфликт. | Вы проиграли конфликт. | identity | [] |
| MAP_0069 | TXT_0069 | genz | battle | conflict_results | conflict_draw | Конфликт завершился ничьей. | Конфликт завершился ничьей. | identity | [] |
| MAP_0070 | TXT_0070 | genz | button | battle | escape_button_label | Свалить: {X} | Выйти: {X} | changed | [X] |
| MAP_0071 | TXT_0071 | genz | training | battle | teach_sent_dm | Для {student}: {arg}. Цена {cost} 💰. | Для {student}: {arg}. Цена: {cost} 💰. | changed | [arg,cost,student] |
| MAP_0072 | TXT_0072 | genz | training | battle | teach_sent_chat | Аргумент: {teacher} → {student}. | Аргумент передан: {teacher} → {student}. | changed | [student,teacher] |
| MAP_0073 | TXT_0073 | genz | placeholder | battle | invite_open_hint | Введи точный ник. | Введите точное имя игрока. | changed | [] |
| MAP_0074 | TXT_0074 | genz | error | battle | invite_invalid | Игрок не найден. | Игрок не найден. | identity | [] |
| MAP_0075 | TXT_0075 | genz | button | battle | menu_title | Меню | Меню | identity | [] |
| MAP_0076 | TXT_0076 | genz | button | battle | return_to_start | К старту | К стартовому экрану | changed | [] |
| MAP_0077 | TXT_0077 | genz | error | battle | menu_unavailable | Недоступно. | Действие недоступно. | changed | [] |
| MAP_0078 | TXT_0078 | genz | label | battle | goal_label | Цель | Цель | identity | [] |
| MAP_0079 | TXT_0079 | shared | cop_flow | cop_templates | cop_report_accept[0] | Понял. Проверяю. | Принято. Проверяю. | changed | [] |
| MAP_0080 | TXT_0080 | shared | cop_flow | cop_templates | cop_report_accept[1] | Принял. Разберусь. | Принято. Разберусь. | changed | [] |
| MAP_0081 | TXT_0081 | shared | cop_flow | cop_templates | cop_busy[0] | Занят, связь позже. | Сейчас занят. Связь будет позже. | changed | [] |
| MAP_0082 | TXT_0082 | shared | cop_flow | cop_templates | cop_busy[1] | Не могу, оформляю дело. | Сейчас не могу ответить. Оформляю дело. | changed | [] |
| MAP_0083 | TXT_0083 | shared | cop_flow | cop_templates | cop_report_ok[0] | Проверка сошлась. Вмешался. | Проверка подтвердилась. Я вмешался. | changed | [] |
| MAP_0084 | TXT_0084 | shared | cop_flow | cop_templates | cop_report_ok[1] | Проверка сошлась. Занялся. | Проверка подтвердилась. Я занялся. | changed | [] |
| MAP_0085 | TXT_0085 | shared | cop_flow | cop_templates | cop_report_fail[0] | Не подтвердилось. Факты не сошлись. | Не подтвердилось. Факты не совпали. | changed | [] |
| MAP_0086 | TXT_0086 | shared | cop_flow | cop_templates | cop_cooldown[0] | Проверка займет время. | Проверка займёт некоторое время. | changed | [] |
| MAP_0087 | TXT_0087 | genz | tooltip | type_hint | hint_type_who | Ответь: кто? | Ответьте: кто? | changed | [] |
| MAP_0088 | TXT_0088 | genz | tooltip | type_hint | hint_type_where | Ответь: где? | Ответьте: где? | changed | [] |
| MAP_0089 | TXT_0089 | genz | tooltip | type_hint | hint_type_about | Ответь: о ком? | Ответьте: о ком? | changed | [] |
| MAP_0090 | TXT_0090 | genz | tooltip | type_hint | hint_type_yn | Ответь: да или нет? | Ответьте: да или нет? | changed | [] |
| MAP_0091 | TXT_0091 | alpha | menu | alpha_tie | tie_start | ТОЛПА | ГОЛОСОВАНИЕ | changed | [] |
| MAP_0092 | TXT_0092 | alpha | menu | alpha_tie | tie_call_to_action | ВПИСЫВАЙСЯ | ПРИСОЕДИНИТЬСЯ | changed | [] |
| MAP_0093 | TXT_0093 | alpha | menu | alpha_tie | tie_click_name_hint | ТЫКНИ ИМЯ | ВЫБЕРИТЕ ИМЯ | changed | [] |
| MAP_0094 | TXT_0094 | alpha | button | alpha_tie | vote_ok | ✓ ОК | ✓ ПРИНЯТО | changed | [] |
| MAP_0095 | TXT_0095 | alpha | button | alpha_tie | vote_already | ✓ УЖЕ | ✓ УЖЕ УЧТЕНО | changed | [] |
| MAP_0096 | TXT_0096 | alpha | button | alpha_tie | vote_fail | ✕ НЕ | ✕ НЕДОСТУПНО | changed | [] |
| MAP_0097 | TXT_0097 | alpha | battle | alpha_battle | battle_win | WIN | ПОБЕДА | changed | [] |
| MAP_0098 | TXT_0098 | alpha | battle | alpha_battle | battle_loss | RIP | ПОРАЖЕНИЕ | changed | [] |
| MAP_0099 | TXT_0099 | alpha | battle | alpha_battle | battle_draw | DRAW | НИЧЬЯ | changed | [] |
| MAP_0100 | TXT_0100 | alpha | battle | alpha_battle | conflict_win | Ты вывез. | Вы справились. | changed | [] |
| MAP_0101 | TXT_0101 | alpha | battle | alpha_battle | conflict_loss | Не вывез. | Вы не справились. | changed | [] |
| MAP_0102 | TXT_0102 | alpha | battle | alpha_battle | conflict_draw | Ничья. Все шумели зря. | Ничья. Конфликт не дал результата. | changed | [] |
| MAP_0103 | TXT_0103 | alpha | battle | alpha_battle | supported_majority | Ты в мейне. | Вы поддержали большинство. | changed | [] |
| MAP_0104 | TXT_0104 | alpha | battle | alpha_battle | supported_minority | Ты в андере. | Вы поддержали меньшинство. | changed | [] |
| MAP_0105 | TXT_0105 | alpha | battle | alpha_battle | majority_won | Мейн забрал. | Большинство победило. | changed | [] |
| MAP_0106 | TXT_0106 | alpha | battle | alpha_battle | minority_lost | Андер просел. | Меньшинство проиграло. | changed | [] |
| MAP_0107 | TXT_0107 | alpha | battle | alpha_battle | conflict_finished | Драма закрыта. | Конфликт завершён. | changed | [] |
| MAP_0108 | TXT_0108 | shared | economy | cap_messages | rep | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | Лимит ⭐ на этой неделе исчерпан. Пополните 💰, чтобы конвертировать их в ⭐. | changed | [] |
| MAP_0109 | TXT_0109 | shared | economy | cap_messages | points | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | Лимит 💰 на этой неделе достигнут. Используйте ресурс до следующего сброса. | changed | [] |
| MAP_0110 | TXT_0110 | shared | conflict_feed | cop_templates | intros[0] | {cop.fullName} на связи. | {cop.fullName} на связи. | identity | [cop.fullName] |
| MAP_0111 | TXT_0111 | shared | conflict_feed | cop_templates | warnings[0] | Опасная точка рядом. | Рядом опасная точка. | changed | [] |
| MAP_0112 | TXT_0112 | shared | warning | cop_templates | warnings[1] | Вызов принят, экипаж в пути. | Вызов принят. Экипаж в пути. | changed | [] |
| MAP_0113 | TXT_0113 | shared | warning | cop_templates | warnings[2] | Ситуация под контролем. | Ситуация под контролем. | identity | [] |
| MAP_0114 | TXT_0114 | shared | notification | cop_templates | chatReplies[0] | Принято, наблюдаю. | Принято. Наблюдаю. | changed | [] |
| MAP_0115 | TXT_0115 | shared | notification | cop_templates | chatReplies[1] | Факт принят, идем дальше. | Факт принят. Идём дальше. | changed | [] |
| MAP_0116 | TXT_0116 | shared | notification | cop_templates | cooldownReplies[0] | Занят расследованием, связь позже. | Занят расследованием. Связь будет позже. | changed | [] |
| MAP_0117 | TXT_0117 | shared | notification | cop_templates | thanks[0] | Сдача принята — спокойнее. | Сообщение принято. Ситуация спокойнее. | changed | [] |
| MAP_0118 | TXT_0118 | shared | warning | cop_templates | scolds[0] | «Сдать» без фактов — шум. | Сообщение без фактов создаёт лишний шум. | changed | [] |
| MAP_0119 | TXT_0119 | shared | battle | arg_base_y_about | q0 | Кто сегодня на слуху, если не ошибаюсь? | Кто сегодня на слуху, если не ошибаюсь? | identity | [] |
| MAP_0120 | TXT_0120 | shared | battle | arg_base_y_about | a0 | Кажется, про {NAME} говорят. | Кажется, говорят про {NAME}. | changed | [NAME] |
| MAP_0121 | TXT_0121 | shared | battle | arg_base_y_who | q0 | Кто, как вам кажется, был рядом? | Кто, как вам кажется, был рядом? | identity | [] |
| MAP_0122 | TXT_0122 | shared | battle | arg_base_y_who | a0 | {NAME}. | {NAME}. | identity | [NAME] |
| MAP_0123 | TXT_0123 | shared | battle | arg_base_y_where | q0 | Где мы сейчас, как вам кажется? | Где мы сейчас, как вам кажется? | identity | [] |
| MAP_0124 | TXT_0124 | shared | battle | arg_base_y_where | a0 | Здесь. | Здесь. | identity | [] |
| MAP_0125 | TXT_0125 | shared | battle | arg_base_y_yn | q0 | Вы уверены? | Вы уверены? | identity | [] |
| MAP_0126 | TXT_0126 | shared | battle | arg_base_y_yn | a0 | Да. | Да. | identity | [] |
| MAP_0127 | TXT_0127 | shared | battle | arg_base_o_about | q0 | Кто сегодня на слуху? | Кто сегодня на слуху? | identity | [] |
| MAP_0128 | TXT_0128 | shared | battle | arg_base_o_about | a0 | Про {NAME} говорят. | Говорят про {NAME}. | changed | [NAME] |
| MAP_0129 | TXT_0129 | shared | battle | arg_base_o_yn | q0 | Вы уверены? | Вы уверены? | identity | [] |
| MAP_0130 | TXT_0130 | shared | npc_say | npc_say_toxic_m | 0 | слабый ход | слабый ход | identity | [] |
| MAP_0131 | TXT_0131 | shared | npc_say | npc_say_toxic_m | 1 | отвечай сейчас | ответ нужен сейчас | changed | [] |
| MAP_0132 | TXT_0132 | shared | npc_say | npc_say_bandit_m | 0 | кошелек ближе | кошелёк важнее | changed | [] |
| MAP_0133 | TXT_0133 | shared | npc_say | npc_say_bandit_m | 1 | плати и уходи | заплати и уходи | changed | [] |
| MAP_0134 | TXT_0134 | shared | npc_say | npc_say_cop_m | 0 | Принято. Дистанция | Принято. Держим дистанцию. | changed | [] |
| MAP_0135 | TXT_0135 | shared | npc_say | npc_say_mafia_m | 0 | Тише | Тише. | changed | [] |
| MAP_0136 | TXT_0136 | shared | npc_say | npc_say_crowd_m | 0 | ого | Понятно. | changed | [] |
| MAP_0137 | TXT_0137 | shared | npc_dm | npc_dm_profile_cop | 0 | Принято. Я рядом. | Принято. Я рядом. | identity | [] |
| MAP_0138 | TXT_0138 | shared | npc_dm | npc_dm_profile_mafia | 0 | Тише. Решим. | Тише. Решим спокойно. | changed | [] |
| MAP_0139 | TXT_0139 | shared | npc_dm | npc_dm_profile_bandit | 0 | Кошелек ближе. | Кошелёк важнее. | changed | [] |
| MAP_0140 | TXT_0140 | shared | npc_dm | npc_dm_profile_toxic | 0 | Слабый ход. | Аргумент слабый. | changed | [] |
| MAP_0141 | TXT_0141 | shared | toast | events_vote_toast | showVoteBtnToast | Ты уже проголосовал. | Вы уже проголосовали. | changed | [] |
| MAP_0142 | TXT_0142 | shared | toast | events_vote_toast | insufficient_points_vote | Не хватает 💰. | Недостаточно 💰. | changed | [] |
| MAP_0143 | TXT_0143 | shared | toast | battle_rematch | rematch_already_requested | Реванш уже запрошен. | Реванш уже запрошен. | identity | [] |
| MAP_0144 | TXT_0144 | shared | toast | battle_rematch | rematch_not_eligible | Недоступно. Баттл не завершён. | Недоступно. Баттл ещё не завершён. | changed | [] |
| MAP_0145 | TXT_0145 | shared | toast | battle_rematch | rematch_not_found | Недоступно. | Действие недоступно. | changed | [] |
| MAP_0146 | TXT_0146 | shared | toast | battle_invite | choose_player | Выбери игрока. | Выберите игрока. | changed | [] |
| MAP_0147 | TXT_0147 | shared | toast | battle_invite | target_missing | Такого нет. | Такой игрок не найден. | changed | [] |
| MAP_0148 | TXT_0148 | shared | toast | battle_invite | cooldown_short | Кулдаун активен. | Нужно подождать перед повторным действием. | changed | [] |
| MAP_0149 | TXT_0149 | shared | toast | battle_invite | insufficient_points | Не хватает 💰. | Недостаточно 💰. | changed | [] |
| MAP_0150 | TXT_0150 | shared | toast | respect_flow | respect_no_points | Не хватает 💰. | Недостаточно 💰. | changed | [] |
| MAP_0151 | TXT_0151 | shared | toast | respect_flow | respect_pair_daily | Уже было уважение сегодня этому персонажу. | Сегодня этому персонажу уже было отправлено уважение. | changed | [] |
| MAP_0152 | TXT_0152 | shared | toast | respect_flow | respect_no_chain | Цепочка A->B->A сегодня не работает. | Цепочка A → B → A сегодня недоступна. | changed | [] |
| MAP_0153 | TXT_0153 | shared | toast | respect_flow | respect_emitter_empty | Лимит уважения на сегодня исчерпан. | Лимит уважения на сегодня исчерпан. | identity | [] |
| MAP_0154 | TXT_0154 | shared | toast | respect_flow | respect_fallback | Сейчас не получилось. Попробуй позже. | Сейчас не получилось. Попробуйте позже. | changed | [] |
| MAP_0155 | TXT_0155 | shared | toast | respect_flow | respect_paid | Ты отдал 1💰 | Вы потратили 1 💰. | changed | [] |
| MAP_0156 | TXT_0156 | shared | toast | respect_flow | respect_target_rep | Цель получила +1 ⭐ | Цель получила +1 ⭐. | changed | [] |
| MAP_0157 | TXT_0157 | shared | toast | menu_dev_mode | dev_mode_disabled | Dev Mode disabled. | Dev Mode disabled. | identity | [] |
| MAP_0158 | TXT_0158 | shared | toast | menu_dev_mode | dev_mode_unlocked | Dev Mode unlocked on this device. | Dev Mode unlocked on this device. | identity | [] |
| MAP_0159 | TXT_0159 | shared | toast | menu_dev_mode | dev_mode_pin_incorrect | Incorrect Dev Mode PIN. | Incorrect Dev Mode PIN. | identity | [] |
| MAP_0160 | TXT_0160 | shared | toast | menu_lottery | menu_lottery_rano | Рано. Дай паузу. | Слишком рано. Подождите немного. | changed | [] |
| MAP_0161 | TXT_0161 | shared | toast | menu_unavailable | menu_unavailable | Недоступно. | Действие недоступно. | changed | [] |
| MAP_0162 | TXT_0162 | shared | toast | menu_unavailable | menu_unavailable_again | Недоступно. | Действие недоступно. | changed | [] |
| MAP_0163 | TXT_0163 | shared | toast | menu_unavailable | menu_unavailable_notify | Недоступно. | Действие недоступно. | changed | [] |
| MAP_0164 | TXT_0164 | shared | toast | events_vote | vote_not_enough_points | Не хватает 💰. | Недостаточно 💰. | changed | [] |

## Validation contract

Static validation must fail on:

- missing mappings
- duplicate mapping ids
- duplicate source inventory ids
- placeholder mismatch
- semantic ambiguity for the same normalized source text
- conflicting boomer targets for the same normalized source text
- root/docs mirror mismatch
- drift from the accepted boomer allowed lexicon

## Deferred work

- Runtime replacement is deferred.
- Runtime validation is not part of this step.
- Gameplay, state, persistence, economy, handlers, routing, resolvers, and NPC behavior are unchanged.
