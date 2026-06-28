# UI_PROFILE_ZOOMER_STEP_4_1_TERMS_INVENTORY

## Scope
- source inventory only, no replacements

## Coverage Summary
- entryCount: 223
- uniqueTextCount: 191
- scannedFileCount: 9
- requiredCategoriesMissing: []
- toastEntryCount: 24
- duplicateTextDifferentSourcesCount: 15

## Categories Covered
- start_screen
- button
- label
- tooltip
- notification
- error
- warning
- cop_flow
- battle
- conflict_feed
- event
- report
- economy
- respect
- p2p
- training
- menu
- placeholder
- npc_say
- npc_dm
- toast
- system_message

## Profiles Covered
- alpha
- genz
- millennial
- shared
- zoomer

## Full Entry Table
```text
TXT_0001 | start_screen | start_screen_title | start_title | AsyncScene | AsyncScene/Web/system.js:115 | data_map | shared | dynamic:no | vars: | notes:
TXT_0002 | start_screen | start_screen_title | start_title | AsyncScene | AsyncScene/Web/data.js:343 | data_map | shared | dynamic:no | vars: | notes:duplicate runtime source
TXT_0003 | start_screen | start_screen_intro | startIntroPick | Оппонент задаёт риск. | AsyncScene/Web/system.js:116 | data_map | shared | dynamic:no | vars: | notes:
TXT_0004 | start_screen | start_screen_intro | startIntroStake | Ставка списывает ресурс. | AsyncScene/Web/system.js:117 | data_map | shared | dynamic:no | vars: | notes:
TXT_0005 | start_screen | start_screen_intro | startIntroResult | Итог виден сразу. | AsyncScene/Web/system.js:118 | data_map | shared | dynamic:no | vars: | notes:
TXT_0006 | start_screen | start_screen_intro | startEconomyHonesty | Цена и итог сразу. | AsyncScene/Web/system.js:119 | data_map | shared | dynamic:no | vars: | notes:
TXT_0007 | button | start_screen_action | startActionStart | Старт | AsyncScene/Web/system.js:120 | data_map | shared | dynamic:no | vars: | notes:
TXT_0008 | button | start_screen_action | startActionRules | Суть | AsyncScene/Web/system.js:121 | data_map | shared | dynamic:no | vars: | notes:
TXT_0009 | label | start_profile_millennial | birth_digits_label | Последние 2 цифры года рождения | AsyncScene/Web/data.js:30 | dom | millennial | dynamic:no | vars: | notes:
TXT_0010 | button | start_profile_millennial | digit_up_first | Увеличить первую цифру | AsyncScene/Web/data.js:31 | dom | millennial | dynamic:no | vars: | notes:
TXT_0011 | button | start_profile_millennial | digit_down_first | Уменьшить первую цифру | AsyncScene/Web/data.js:32 | dom | millennial | dynamic:no | vars: | notes:
TXT_0012 | button | start_profile_millennial | digit_up_second | Увеличить вторую цифру | AsyncScene/Web/data.js:33 | dom | millennial | dynamic:no | vars: | notes:
TXT_0013 | button | start_profile_millennial | digit_down_second | Уменьшить вторую цифру | AsyncScene/Web/data.js:34 | dom | millennial | dynamic:no | vars: | notes:
TXT_0014 | tooltip | start_profile_millennial | profile_helper | Только для интерфейса. Не сохраняем. Можно поменять позже. | AsyncScene/Web/data.js:35 | dom | millennial | dynamic:no | vars: | notes:
TXT_0015 | label | start_profile_millennial | fantasy_birth_label | я на самом деле чувствую будто я родился в … | AsyncScene/Web/data.js:36 | dom | millennial | dynamic:no | vars: | notes:
TXT_0016 | button | start_profile_millennial | start_continue | Продолжить | AsyncScene/Web/data.js:37 | button | millennial | dynamic:no | vars: | notes:
TXT_0017 | button | start_profile_millennial | start_start | Старт | AsyncScene/Web/data.js:38 | button | millennial | dynamic:no | vars: | notes:
TXT_0018 | button | start_profile_millennial | start_reset | Сбросить старт | AsyncScene/Web/data.js:39 | button | millennial | dynamic:no | vars: | notes:
TXT_0019 | button | start_profile_zoomer | start_continue | Погнали | AsyncScene/Web/data.js:52 | button | zoomer | dynamic:no | vars: | notes:
TXT_0020 | button | start_profile_zoomer | start_reset | Снести выбор | AsyncScene/Web/data.js:54 | button | zoomer | dynamic:no | vars: | notes:
TXT_0021 | button | start_profile_zoomer | rules_action | Правила без душноты | AsyncScene/Web/data.js:55 | button | zoomer | dynamic:no | vars: | notes:
TXT_0022 | button | start_profile_zoomer | start_action | Войти | AsyncScene/Web/data.js:56 | button | zoomer | dynamic:no | vars: | notes:
TXT_0023 | notification | system_copy | saved | Готово. | AsyncScene/Web/system.js:53 | data_map | shared | dynamic:no | vars: | notes:
TXT_0024 | error | system_copy | missingMessage | Сообщение недоступно. | AsyncScene/Web/system.js:30 | data_map | shared | dynamic:no | vars: | notes:
TXT_0025 | error | system_copy | insufficientPoints | Не хватает 💰. | AsyncScene/Web/system.js:31 | data_map | shared | dynamic:no | vars: | notes:
TXT_0026 | error | system_copy | pointsLowBattle | Мало 💰 на баттл. | AsyncScene/Web/system.js:32 | data_map | shared | dynamic:no | vars: | notes:
TXT_0027 | error | system_copy | unavailable | Недоступно. | AsyncScene/Web/system.js:33 | data_map | shared | dynamic:no | vars: | notes:
TXT_0028 | error | system_copy | notFound | Не найдено. | AsyncScene/Web/system.js:34 | data_map | shared | dynamic:no | vars: | notes:
TXT_0029 | error | system_copy | choosePlayer | Игрок не указан. | AsyncScene/Web/system.js:35 | data_map | shared | dynamic:no | vars: | notes:
TXT_0030 | error | system_copy | reportFalsePenalty | Штраф: -5 💰. | AsyncScene/Web/system.js:36 | data_map | shared | dynamic:no | vars: | notes:
TXT_0031 | warning | system_copy | checkInput | Ввод некорректен. | AsyncScene/Web/system.js:43 | data_map | shared | dynamic:no | vars: | notes:
TXT_0032 | warning | system_copy | cooldownShort | Кулдаун активен. | AsyncScene/Web/system.js:44 | data_map | shared | dynamic:no | vars: | notes:
TXT_0033 | cop_flow | system_copy | copCooldown | Проверка займет время. | AsyncScene/Web/system.js:45 | data_map | shared | dynamic:no | vars: | notes:
TXT_0034 | notification | system_copy | pointsDeltaPlusOne | +1💰 | AsyncScene/Web/system.js:54 | data_map | shared | dynamic:no | vars: | notes:
TXT_0035 | respect | system_copy | repDeltaPlusOne | +1⭐ | AsyncScene/Web/system.js:55 | data_map | shared | dynamic:no | vars: | notes:
TXT_0036 | notification | system_copy | voteAccepted | Голос учтён. | AsyncScene/Web/system.js:59 | data_map | shared | dynamic:no | vars: | notes:
TXT_0037 | report | system_copy | reportPending | Проверяю. | AsyncScene/Web/system.js:60 | data_map | shared | dynamic:no | vars: | notes:
TXT_0038 | report | system_copy | reportTrueReward | Сдать {name}: +2💰. | AsyncScene/Web/system.js:61 | template | shared | dynamic:yes | vars:name | notes:
TXT_0039 | report | system_copy | reportOk | Коп: {name} сдан, +2💰. | AsyncScene/Web/system.js:62 | template | shared | dynamic:yes | vars:name | notes:
TXT_0040 | training | system_copy | trainingSent | Аргумент: {teacher} → {student}. | AsyncScene/Web/system.js:65 | template | shared | dynamic:yes | vars:teacher,student | notes:
TXT_0041 | battle | system_copy | rematchRequested | {name} зовёт на реванш. | AsyncScene/Web/system.js:66 | template | shared | dynamic:yes | vars:name | notes:
TXT_0042 | button | system_copy | escapePaid | Свалить за 1💰. | AsyncScene/Web/system.js:67 | data_map | shared | dynamic:no | vars: | notes:
TXT_0043 | notification | system_copy | pointsDeltaRefund | +1💰 возврат. | AsyncScene/Web/system.js:68 | data_map | shared | dynamic:no | vars: | notes:
TXT_0044 | notification | system_copy | pointsDeltaRefundMajority | +1💰 возврат большинству. | AsyncScene/Web/system.js:69 | data_map | shared | dynamic:no | vars: | notes:
TXT_0045 | notification | system_copy | pointsDeltaRemainderWin | +1💰 остаток победителю. | AsyncScene/Web/system.js:70 | data_map | shared | dynamic:no | vars: | notes:
TXT_0046 | battle | system_copy | rematchCost | Реванш: -{rematchCost}💰. | AsyncScene/Web/system.js:71 | template | shared | dynamic:yes | vars:rematchCost | notes:
TXT_0047 | button | system_copy | escapeVoteCost | Свалить: -{escapeCost}💰. | AsyncScene/Web/system.js:72 | template | shared | dynamic:yes | vars:escapeCost | notes:
TXT_0048 | p2p | system_copy | p2pTransferSent | {target}: +{amount}💰. | AsyncScene/Web/system.js:73 | template | shared | dynamic:yes | vars:target,amount | notes:
TXT_0049 | p2p | system_copy | p2pTransferReceived | {target}: +{amount}💰 тебе. | AsyncScene/Web/system.js:74 | template | shared | dynamic:yes | vars:target,amount | notes:
TXT_0050 | system_message | system_events | battleChallenge | {attackerName} [{attackerInf}] бросил вызов. | AsyncScene/Web/system.js:82 | template | shared | dynamic:yes | vars:attackerName,attackerInf | notes:
TXT_0051 | battle | system_events | battleResult | Баттл с {oppName}: {text}. | AsyncScene/Web/system.js:85 | template | shared | dynamic:yes | vars:oppName,text | notes:
TXT_0052 | battle | system_events | battleDraw | {a} и {b}: ничья. | AsyncScene/Web/system.js:90 | template | shared | dynamic:yes | vars:a,b | notes:
TXT_0053 | event | system_events | crowdResolved | Толпа: {name} {aVotes}:{bVotes}. | AsyncScene/Web/system.js:92 | template | shared | dynamic:yes | vars:name,aVotes,bVotes | notes:
TXT_0054 | event | system_events | unlockOrange | Оранжевые аргументы открыты. | AsyncScene/Web/system.js:93 | data_map | shared | dynamic:no | vars: | notes:
TXT_0055 | event | system_events | unlockRed | Красные аргументы открыты. | AsyncScene/Web/system.js:94 | data_map | shared | dynamic:no | vars: | notes:
TXT_0056 | event | system_events | unlockBlack | Чёрные аргументы открыты. | AsyncScene/Web/system.js:95 | data_map | shared | dynamic:no | vars: | notes:
TXT_0057 | system_message | system_events | startIntroPick | Оппонент задаёт риск. | AsyncScene/Web/system.js:116 | data_map | shared | dynamic:no | vars: | notes:
TXT_0058 | system_message | system_events | startIntroStake | Ставка списывает ресурс. | AsyncScene/Web/system.js:117 | data_map | shared | dynamic:no | vars: | notes:
TXT_0059 | system_message | system_events | startIntroResult | Итог виден сразу. | AsyncScene/Web/system.js:118 | data_map | shared | dynamic:no | vars: | notes:
TXT_0060 | system_message | system_events | startEconomyHonesty | Цена и итог сразу. | AsyncScene/Web/system.js:119 | data_map | shared | dynamic:no | vars: | notes:
TXT_0061 | button | menu | menu_title | Меню | AsyncScene/Web/system.js:120 | data_map | shared | dynamic:no | vars: | notes:
TXT_0062 | button | menu | return_to_start | К старту | AsyncScene/Web/system.js:121 | data_map | shared | dynamic:no | vars: | notes:
TXT_0063 | label | menu | goal_label | Цель | AsyncScene/Web/system.js:122 | data_map | shared | dynamic:no | vars: | notes:
TXT_0064 | battle | battle_results | battle_win | Победа | AsyncScene/Web/data.js:375 | data_map | genz | dynamic:no | vars: | notes:
TXT_0065 | battle | battle_results | battle_loss | Поражение | AsyncScene/Web/data.js:376 | data_map | genz | dynamic:no | vars: | notes:
TXT_0066 | battle | battle_results | battle_draw | Толпа решает | AsyncScene/Web/data.js:378 | data_map | genz | dynamic:no | vars: | notes:
TXT_0067 | battle | conflict_results | conflict_win | Вы победили в конфликте. | AsyncScene/Web/data.js:379 | data_map | genz | dynamic:no | vars: | notes:
TXT_0068 | battle | conflict_results | conflict_loss | Вы проиграли конфликт. | AsyncScene/Web/data.js:380 | data_map | genz | dynamic:no | vars: | notes:
TXT_0069 | battle | conflict_results | conflict_draw | Конфликт завершился ничьей. | AsyncScene/Web/data.js:381 | data_map | genz | dynamic:no | vars: | notes:
TXT_0070 | button | battle | escape_button_label | Свалить: {X} | AsyncScene/Web/data.js:389 | template | genz | dynamic:yes | vars:X | notes:
TXT_0071 | training | battle | teach_sent_dm | Для {student}: {arg}. Цена {cost} 💰. | AsyncScene/Web/data.js:390 | template | genz | dynamic:yes | vars:student,arg,cost | notes:
TXT_0072 | training | battle | teach_sent_chat | Аргумент: {teacher} → {student}. | AsyncScene/Web/data.js:391 | template | genz | dynamic:yes | vars:teacher,student | notes:
TXT_0073 | placeholder | battle | invite_open_hint | Введи точный ник. | AsyncScene/Web/data.js:392 | dom | genz | dynamic:no | vars: | notes:
TXT_0074 | error | battle | invite_invalid | Игрок не найден. | AsyncScene/Web/data.js:393 | dom | genz | dynamic:no | vars: | notes:
TXT_0075 | button | battle | menu_title | Меню | AsyncScene/Web/data.js:394 | dom | genz | dynamic:no | vars: | notes:duplicate runtime source
TXT_0076 | button | battle | return_to_start | К старту | AsyncScene/Web/data.js:395 | dom | genz | dynamic:no | vars: | notes:duplicate runtime source
TXT_0077 | error | battle | menu_unavailable | Недоступно. | AsyncScene/Web/data.js:396 | dom | genz | dynamic:no | vars: | notes:duplicate runtime source
TXT_0078 | label | battle | goal_label | Цель | AsyncScene/Web/data.js:397 | dom | genz | dynamic:no | vars: | notes:duplicate runtime source
TXT_0079 | cop_flow | cop_templates | cop_report_accept[0] | Понял. Проверяю. | AsyncScene/Web/data.js:400 | data_map | shared | dynamic:no | vars: | notes:
TXT_0080 | cop_flow | cop_templates | cop_report_accept[1] | Принял. Разберусь. | AsyncScene/Web/data.js:400 | data_map | shared | dynamic:no | vars: | notes:
TXT_0081 | cop_flow | cop_templates | cop_busy[0] | Занят, связь позже. | AsyncScene/Web/data.js:401 | data_map | shared | dynamic:no | vars: | notes:
TXT_0082 | cop_flow | cop_templates | cop_busy[1] | Не могу, оформляю дело. | AsyncScene/Web/data.js:401 | data_map | shared | dynamic:no | vars: | notes:
TXT_0083 | cop_flow | cop_templates | cop_report_ok[0] | Проверка сошлась. Вмешался. | AsyncScene/Web/data.js:402 | data_map | shared | dynamic:no | vars: | notes:
TXT_0084 | cop_flow | cop_templates | cop_report_ok[1] | Проверка сошлась. Занялся. | AsyncScene/Web/data.js:402 | data_map | shared | dynamic:no | vars: | notes:
TXT_0085 | cop_flow | cop_templates | cop_report_fail[0] | Не подтвердилось. Факты не сошлись. | AsyncScene/Web/data.js:403 | data_map | shared | dynamic:no | vars: | notes:
TXT_0086 | cop_flow | cop_templates | cop_cooldown[0] | Проверка займет время. | AsyncScene/Web/data.js:404 | resolver | shared | dynamic:no | vars: | notes:resolved via system warnings copy
TXT_0087 | tooltip | type_hint | hint_type_who | Ответь: кто? | AsyncScene/Web/data.js:407 | dom | genz | dynamic:no | vars: | notes:
TXT_0088 | tooltip | type_hint | hint_type_where | Ответь: где? | AsyncScene/Web/data.js:408 | dom | genz | dynamic:no | vars: | notes:
TXT_0089 | tooltip | type_hint | hint_type_about | Ответь: о ком? | AsyncScene/Web/data.js:409 | dom | genz | dynamic:no | vars: | notes:
TXT_0090 | tooltip | type_hint | hint_type_yn | Ответь: да или нет? | AsyncScene/Web/data.js:410 | dom | genz | dynamic:no | vars: | notes:
TXT_0091 | menu | alpha_tie | tie_start | ТОЛПА | AsyncScene/Web/data.js:413 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0092 | menu | alpha_tie | tie_call_to_action | ВПИСЫВАЙСЯ | AsyncScene/Web/data.js:414 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0093 | menu | alpha_tie | tie_click_name_hint | ТЫКНИ ИМЯ | AsyncScene/Web/data.js:415 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0094 | button | alpha_tie | vote_ok | ✓ ОК | AsyncScene/Web/data.js:416 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0095 | button | alpha_tie | vote_already | ✓ УЖЕ | AsyncScene/Web/data.js:417 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0096 | button | alpha_tie | vote_fail | ✕ НЕ | AsyncScene/Web/data.js:418 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0097 | battle | alpha_battle | battle_win | WIN | AsyncScene/Web/data.js:446 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0098 | battle | alpha_battle | battle_loss | RIP | AsyncScene/Web/data.js:447 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0099 | battle | alpha_battle | battle_draw | DRAW | AsyncScene/Web/data.js:449 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0100 | battle | alpha_battle | conflict_win | Ты вывез. | AsyncScene/Web/data.js:450 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0101 | battle | alpha_battle | conflict_loss | Не вывез. | AsyncScene/Web/data.js:451 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0102 | battle | alpha_battle | conflict_draw | Ничья. Все шумели зря. | AsyncScene/Web/data.js:452 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0103 | battle | alpha_battle | supported_majority | Ты в мейне. | AsyncScene/Web/data.js:453 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0104 | battle | alpha_battle | supported_minority | Ты в андере. | AsyncScene/Web/data.js:454 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0105 | battle | alpha_battle | majority_won | Мейн забрал. | AsyncScene/Web/data.js:455 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0106 | battle | alpha_battle | minority_lost | Андер просел. | AsyncScene/Web/data.js:456 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0107 | battle | alpha_battle | conflict_finished | Драма закрыта. | AsyncScene/Web/data.js:457 | data_map | alpha | dynamic:no | vars: | notes:
TXT_0108 | economy | cap_messages | rep | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | AsyncScene/Web/data.js:591 | data_map | shared | dynamic:no | vars: | notes:
TXT_0109 | economy | cap_messages | points | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | AsyncScene/Web/data.js:592 | data_map | shared | dynamic:no | vars: | notes:
TXT_0110 | conflict_feed | cop_templates | intros[0] | {cop.fullName} на связи. | AsyncScene/Web/data.js:493 | template | shared | dynamic:yes | vars:cop.fullName | notes:
TXT_0111 | conflict_feed | cop_templates | warnings[0] | Опасная точка рядом. | AsyncScene/Web/data.js:505 | data_map | shared | dynamic:no | vars: | notes:
TXT_0112 | warning | cop_templates | warnings[1] | Вызов принят, экипаж в пути. | AsyncScene/Web/data.js:506 | data_map | shared | dynamic:no | vars: | notes:
TXT_0113 | warning | cop_templates | warnings[2] | Ситуация под контролем. | AsyncScene/Web/data.js:507 | data_map | shared | dynamic:no | vars: | notes:
TXT_0114 | notification | cop_templates | chatReplies[0] | Принято, наблюдаю. | AsyncScene/Web/data.js:541 | data_map | shared | dynamic:no | vars: | notes:
TXT_0115 | notification | cop_templates | chatReplies[1] | Факт принят, идем дальше. | AsyncScene/Web/data.js:542 | data_map | shared | dynamic:no | vars: | notes:
TXT_0116 | notification | cop_templates | cooldownReplies[0] | Занят расследованием, связь позже. | AsyncScene/Web/data.js:553 | data_map | shared | dynamic:no | vars: | notes:
TXT_0117 | notification | cop_templates | thanks[0] | Сдача принята - спокойнее. | AsyncScene/Web/data.js:565 | data_map | shared | dynamic:no | vars: | notes:
TXT_0118 | warning | cop_templates | scolds[0] | «Сдать» без фактов - шум. | AsyncScene/Web/data.js:577 | data_map | shared | dynamic:no | vars: | notes:
TXT_0119 | battle | arg_base_y_about | q0 | Кто сегодня на слуху, если не ошибаюсь? | AsyncScene/Web/data.js:791 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0120 | battle | arg_base_y_about | a0 | Кажется, про {NAME} говорят. | AsyncScene/Web/data.js:791 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0121 | battle | arg_base_y_who | q0 | Кто, как вам кажется, был рядом? | AsyncScene/Web/data.js:802 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0122 | battle | arg_base_y_who | a0 | {NAME}. | AsyncScene/Web/data.js:802 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0123 | battle | arg_base_y_where | q0 | Где мы сейчас, как вам кажется? | AsyncScene/Web/data.js:813 | template | shared | dynamic:yes | vars:PLACE | notes:
TXT_0124 | battle | arg_base_y_where | a0 | Здесь. | AsyncScene/Web/data.js:813 | template | shared | dynamic:no | vars: | notes:
TXT_0125 | battle | arg_base_y_yn | q0 | Вы уверены? | AsyncScene/Web/data.js:824 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0126 | battle | arg_base_y_yn | a0 | Да. | AsyncScene/Web/data.js:824 | template | shared | dynamic:no | vars: | notes:
TXT_0127 | battle | arg_base_o_about | q0 | Кто сегодня на слуху? | AsyncScene/Web/data.js:838 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0128 | battle | arg_base_o_about | a0 | Про {NAME} говорят. | AsyncScene/Web/data.js:838 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0129 | battle | arg_base_o_yn | q0 | Вы уверены? | AsyncScene/Web/data.js:878 | template | shared | dynamic:yes | vars:NAME | notes:
TXT_0130 | npc_say | npc_say_toxic_m | 0 | слабый ход | AsyncScene/Web/npcs.js:147 | data_map | shared | dynamic:no | vars: | notes:
TXT_0131 | npc_say | npc_say_toxic_m | 1 | отвечай сейчас | AsyncScene/Web/npcs.js:148 | data_map | shared | dynamic:no | vars: | notes:
TXT_0132 | npc_say | npc_say_bandit_m | 0 | кошелек ближе | AsyncScene/Web/npcs.js:168 | data_map | shared | dynamic:no | vars: | notes:
TXT_0133 | npc_say | npc_say_bandit_m | 1 | плати и уходи | AsyncScene/Web/npcs.js:169 | data_map | shared | dynamic:no | vars: | notes:
TXT_0134 | npc_say | npc_say_cop_m | 0 | Принято. Дистанция | AsyncScene/Web/npcs.js:196 | data_map | shared | dynamic:no | vars: | notes:
TXT_0135 | npc_say | npc_say_mafia_m | 0 | Тише | AsyncScene/Web/npcs.js:212 | data_map | shared | dynamic:no | vars: | notes:
TXT_0136 | npc_say | npc_say_crowd_m | 0 | ого | AsyncScene/Web/npcs.js:232 | data_map | shared | dynamic:no | vars: | notes:
TXT_0137 | npc_dm | npc_dm_profile_cop | 0 | Принято. Я рядом. | AsyncScene/Web/npcs.js:250 | data_map | shared | dynamic:no | vars: | notes:
TXT_0138 | npc_dm | npc_dm_profile_mafia | 0 | Тише. Решим. | AsyncScene/Web/npcs.js:257 | data_map | shared | dynamic:no | vars: | notes:
TXT_0139 | npc_dm | npc_dm_profile_bandit | 0 | Кошелек ближе. | AsyncScene/Web/npcs.js:264 | data_map | shared | dynamic:no | vars: | notes:
TXT_0140 | npc_dm | npc_dm_profile_toxic | 0 | Слабый ход. | AsyncScene/Web/npcs.js:271 | data_map | shared | dynamic:no | vars: | notes:
TXT_0141 | toast | events_vote_toast | showVoteBtnToast | Ты уже проголосовал. | AsyncScene/Web/ui/ui-events.js:856 | literal | shared | dynamic:no | vars: | notes:vote/crowd toast
TXT_0142 | toast | events_vote_toast | insufficient_points_vote | Не хватает 💰. | AsyncScene/Web/ui/ui-events.js:898 | literal | shared | dynamic:no | vars: | notes:vote/crowd toast
TXT_0143 | toast | battle_rematch | rematch_already_requested | Реванш уже запрошен. | AsyncScene/Web/ui/ui-battles.js:1089 | literal | shared | dynamic:no | vars: | notes:battle toast
TXT_0144 | toast | battle_rematch | rematch_not_eligible | Недоступно. Баттл не завершён. | AsyncScene/Web/ui/ui-battles.js:1093 | literal | shared | dynamic:no | vars: | notes:battle toast
TXT_0145 | toast | battle_rematch | rematch_not_found | Недоступно. | AsyncScene/Web/ui/ui-battles.js:1097 | literal | shared | dynamic:no | vars: | notes:battle toast
TXT_0146 | toast | battle_invite | choose_player | Выбери игрока. | AsyncScene/Web/ui/ui-battles.js:1646 | literal | shared | dynamic:no | vars: | notes:battle toast
TXT_0147 | toast | battle_invite | target_missing | Такого нет. | AsyncScene/Web/ui/ui-battles.js:1663 | literal | shared | dynamic:no | vars: | notes:battle toast
TXT_0148 | toast | battle_invite | cooldown_short | Кулдаун активен. | AsyncScene/Web/ui/ui-battles.js:1672 | resolver | shared | dynamic:no | vars: | notes:resolved via system warnings copy
TXT_0149 | toast | battle_invite | insufficient_points | Не хватает 💰. | AsyncScene/Web/ui/ui-battles.js:1691 | resolver | shared | dynamic:no | vars: | notes:resolved via system errors copy
TXT_0150 | toast | respect_flow | respect_no_points | Не хватает 💰. | AsyncScene/Web/ui/ui-dm.js:13 | resolver | shared | dynamic:no | vars: | notes:resolved via system errors copy
TXT_0151 | toast | respect_flow | respect_pair_daily | Уже было уважение сегодня этому персонажу. | AsyncScene/Web/ui/ui-dm.js:14 | resolver | shared | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0152 | toast | respect_flow | respect_no_chain | Цепочка A->B->A сегодня не работает. | AsyncScene/Web/ui/ui-dm.js:15 | resolver | shared | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0153 | toast | respect_flow | respect_emitter_empty | Лимит уважения на сегодня исчерпан. | AsyncScene/Web/ui/ui-dm.js:16 | resolver | shared | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0154 | toast | respect_flow | respect_fallback | Сейчас не получилось. Попробуй позже. | AsyncScene/Web/ui/ui-dm.js:81 | literal | shared | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0155 | toast | respect_flow | respect_paid | Ты отдал 1💰 | AsyncScene/Web/state.js:0 | resolver | shared | dynamic:no | vars: | notes:extracted from runtime toast diagnostics; source line not directly visible in the scanned excerpt
TXT_0156 | toast | respect_flow | respect_target_rep | Цель получила +1 ⭐ | AsyncScene/Web/state.js:0 | resolver | shared | dynamic:no | vars: | notes:extracted from runtime toast diagnostics; source line not directly visible in the scanned excerpt
TXT_0157 | toast | menu_dev_mode | dev_mode_disabled | Dev Mode disabled. | AsyncScene/Web/ui/ui-menu.js:214 | literal | shared | dynamic:no | vars: | notes:dev_visible
TXT_0158 | toast | menu_dev_mode | dev_mode_unlocked | Dev Mode unlocked on this device. | AsyncScene/Web/ui/ui-menu.js:228 | literal | shared | dynamic:no | vars: | notes:dev_visible
TXT_0159 | toast | menu_dev_mode | dev_mode_pin_incorrect | Incorrect Dev Mode PIN. | AsyncScene/Web/ui/ui-menu.js:230 | literal | shared | dynamic:no | vars: | notes:dev_visible
TXT_0160 | toast | menu_lottery | menu_lottery_rano | Рано. Дай паузу. | AsyncScene/Web/ui/ui-menu.js:590 | literal | shared | dynamic:no | vars: | notes:menu lottery/dev toast
TXT_0161 | toast | menu_unavailable | menu_unavailable | Недоступно. | AsyncScene/Web/ui/ui-menu.js:326 | resolver | shared | dynamic:no | vars: | notes:menu lottery toast
TXT_0162 | toast | menu_unavailable | menu_unavailable_again | Недоступно. | AsyncScene/Web/ui/ui-menu.js:568 | resolver | shared | dynamic:no | vars: | notes:menu lottery toast
TXT_0163 | toast | menu_unavailable | menu_unavailable_notify | Недоступно. | AsyncScene/Web/ui/ui-menu.js:581 | resolver | shared | dynamic:no | vars: | notes:menu lottery toast
TXT_0164 | toast | events_vote | vote_not_enough_points | Не хватает 💰. | AsyncScene/Web/ui/ui-events.js:897 | literal | shared | dynamic:no | vars: | notes:duplicate runtime source
TXT_0165 | label | start_profile_zoomer | birth_digits_label | Две цифры вайба | AsyncScene/Web/data.js:66 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0166 | button | start_profile_zoomer | digit_up_first | Первая цифра выше | AsyncScene/Web/data.js:67 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0167 | button | start_profile_zoomer | digit_down_first | Первая цифра ниже | AsyncScene/Web/data.js:68 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0168 | button | start_profile_zoomer | digit_up_second | Вторая цифра выше | AsyncScene/Web/data.js:69 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0169 | button | start_profile_zoomer | digit_down_second | Вторая цифра ниже | AsyncScene/Web/data.js:70 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0170 | tooltip | start_profile_zoomer | profile_helper | Это только стиль интерфейса. Потом можно перекинуть. | AsyncScene/Web/data.js:71 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0171 | label | start_profile_zoomer | fantasy_birth_label | по вайбу я родился в … | AsyncScene/Web/data.js:72 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0172 | button | start_profile_zoomer | start_continue | Погнали | AsyncScene/Web/data.js:73 | button | zoomer | dynamic:no | vars: | notes:
TXT_0173 | button | start_profile_zoomer | start_action | Войти | AsyncScene/Web/data.js:77 | button | zoomer | dynamic:no | vars: | notes:
TXT_0174 | button | start_screen | start_title | AsyncScene | AsyncScene/Web/data.js:65 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0175 | button | start_profile_zoomer | start_reset | Сбросить выбор | AsyncScene/Web/data.js:75 | button | zoomer | dynamic:no | vars: | notes:
TXT_0176 | button | start_profile_zoomer | rules_action | Правила коротко | AsyncScene/Web/data.js:76 | button | zoomer | dynamic:no | vars: | notes:
TXT_0177 | status | topbar | meBar | Площадь | AsyncScene/Web/index.html:74 | dom | shared | dynamic:no | vars: | notes:
TXT_0178 | status | topbar | locPill | Локация: Площадь | AsyncScene/Web/index.html:75 | dom | shared | dynamic:no | vars: | notes:
TXT_0179 | hint | chat_input | chatInput.placeholder | Пиши по теме. | AsyncScene/Web/index.html:81 | dom | shared | dynamic:no | vars: | notes:
TXT_0180 | button | chat_input | btnSend | Заслать | AsyncScene/Web/index.html:82 | dom | shared | dynamic:no | vars: | notes:
TXT_0181 | hint | chat_input | chatResizeHandle.aria-label | Изменить высоту чата | AsyncScene/Web/index.html:85 | dom | shared | dynamic:no | vars: | notes:
TXT_0182 | status | profile_stat | balance.aria-label | Профиль | AsyncScene/Web/index.html:90 | dom | shared | dynamic:no | vars: | notes:
TXT_0183 | status | profile_stat | statIcon.title | Влияние | AsyncScene/Web/index.html:91 | dom | shared | dynamic:no | vars: | notes:
TXT_0184 | status | profile_stat | statIcon.title | ⭐ | AsyncScene/Web/index.html:92 | dom | shared | dynamic:no | vars: | notes:
TXT_0185 | status | profile_stat | statIcon.title | 💰 | AsyncScene/Web/index.html:93 | dom | shared | dynamic:no | vars: | notes:
TXT_0186 | status | profile_stat | statIcon.title | Победы | AsyncScene/Web/index.html:94 | dom | shared | dynamic:no | vars: | notes:
TXT_0187 | button | topbar | btnMenu | Меню | AsyncScene/Web/index.html:97 | dom | shared | dynamic:no | vars: | notes:
TXT_0188 | button | menu | menu_title | Меню | AsyncScene/Web/ui/ui-menu.js:50 | literal | shared | dynamic:no | vars: | notes:
TXT_0189 | error | menu | menu_unavailable | Недоступно. | AsyncScene/Web/ui/ui-menu.js:48 | resolver | shared | dynamic:no | vars: | notes:
TXT_0190 | label | menu | goal_label | Задача | AsyncScene/Web/ui/ui-menu.js:91 | literal | shared | dynamic:no | vars: | notes:
TXT_0191 | button | menu | return_to_start | На старт | AsyncScene/Web/ui/ui-menu.js:163 | literal | shared | dynamic:no | vars: | notes:
TXT_0192 | button | menu | close_x | × | AsyncScene/Web/ui/ui-menu.js:105 | literal | shared | dynamic:no | vars: | notes:
TXT_0193 | button | menu_dev_mode | dev_mode_disabled | Disable Dev Mode | AsyncScene/Web/ui/ui-menu.js:207 | literal | shared | dynamic:no | vars: | notes:
TXT_0194 | tooltip | menu_dev_mode | dev_mode_help | Local convenience gate for device-only dev tools | AsyncScene/Web/ui/ui-menu.js:208 | literal | shared | dynamic:no | vars: | notes:
TXT_0195 | button | menu_logger | logger_controls | Console Panel | AsyncScene/Web/ui/ui-menu.js:258 | literal | shared | dynamic:no | vars: | notes:
TXT_0196 | tooltip | menu_logger | logger_help | Open expanded console panel | AsyncScene/Web/ui/ui-menu.js:259 | literal | shared | dynamic:no | vars: | notes:
TXT_0197 | status | training | trainingStatusText | Аргумент грузится. | AsyncScene/Web/ui/ui-menu.js:380 | literal | shared | dynamic:no | vars: | notes:
TXT_0198 | button | training | trainingActionBtn | Передать | AsyncScene/Web/ui/ui-menu.js:386 | literal | shared | dynamic:no | vars: | notes:
TXT_0199 | status | training | trainingResultText | xp: 0, уровень: 0 | AsyncScene/Web/ui/ui-menu.js:391 | literal | shared | dynamic:no | vars: | notes:
TXT_0200 | status | training | trainingStatusDisabled | Передача недоступна | AsyncScene/Web/ui/ui-menu.js:427 | literal | shared | dynamic:no | vars: | notes:
TXT_0201 | status | training | trainingStatusUnavailable | Статус передачи недоступен | AsyncScene/Web/ui/ui-menu.js:435 | literal | shared | dynamic:no | vars: | notes:
TXT_0202 | status | training | trainingStatusReady | Можно передать | AsyncScene/Web/ui/ui-menu.js:443 | literal | shared | dynamic:no | vars: | notes:
TXT_0203 | status | lottery | btnLotteryTop.title | Недоступно. | AsyncScene/Web/ui/ui-menu.js:53 | resolver | shared | dynamic:no | vars: | notes:
TXT_0204 | status | lottery | lotteryControls.textContent | Недоступно. | AsyncScene/Web/ui/ui-menu.js:326 | resolver | shared | dynamic:no | vars: | notes:
TXT_0205 | hint | dm | dmTitle | Личка | AsyncScene/Web/index.html:113 | dom | shared | dynamic:no | vars: | notes:
TXT_0206 | hint | dm | dmInput.placeholder | Пиши в личку. | AsyncScene/Web/index.html:130 | dom | shared | dynamic:no | vars: | notes:
TXT_0207 | button | dm | dmSend | Заслать | AsyncScene/Web/index.html:131 | dom | shared | dynamic:no | vars: | notes:
TXT_0208 | hint | report | reportInput.placeholder | Ник бандита или токсика. | AsyncScene/Web/index.html:135 | dom | shared | dynamic:no | vars: | notes:
TXT_0209 | button | report | reportBtn | Сдать | AsyncScene/Web/index.html:136 | dom | shared | dynamic:no | vars: | notes:
TXT_0210 | hint | report | reportHint | Сдай токсика, бандита или мафиози. | AsyncScene/Web/index.html:137 | dom | shared | dynamic:no | vars: | notes:
TXT_0211 | status | battles | battleTitleText | баттл | AsyncScene/Web/index.html:146 | dom | shared | dynamic:no | vars: | notes:
TXT_0212 | status | events | headerTitleText | События | AsyncScene/Web/index.html:157 | dom | shared | dynamic:no | vars: | notes:
TXT_0213 | button | events | events_close_extra | СВЕРНУТЬ | AsyncScene/Web/data.js:480 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0214 | button | events | events_clear_all | ЧИСТКА | AsyncScene/Web/data.js:481 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0215 | button | events | events_clear | ЧИСТКА | AsyncScene/Web/data.js:482 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0216 | status | events | events_done | OK | AsyncScene/Web/data.js:483 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0217 | status | events | events_left | ⏳{sec} | AsyncScene/Web/data.js:484 | template | zoomer | dynamic:yes | vars:sec | notes:
TXT_0218 | status | battles | battles_empty | Раундов нет. | AsyncScene/Web/data.js:470 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0219 | button | battles | battle_invite_title | Залёт | AsyncScene/Web/data.js:471 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0220 | button | battles | battle_action_accept | Вписаться | AsyncScene/Web/data.js:472 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0221 | button | battles | battle_action_decline | Скипнуть | AsyncScene/Web/data.js:473 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0222 | button | battles | battle_action_attack | Влететь | AsyncScene/Web/data.js:474 | data_map | zoomer | dynamic:no | vars: | notes:
TXT_0223 | button | battles | battle_action_rematch | Ещё раунд | AsyncScene/Web/data.js:475 | data_map | zoomer | dynamic:no | vars: | notes:
```

## Zoomer UI Term Extraction
- Mechanical extraction basis: unique tokens from `currentText` only.
- Template variables preserved as variables, not words.
- Emoji/resource tokens preserved as tokens.

### Russian Words
активен, Андер, андере, Аргумент, аргументы, баттл, Баттл, без, ближе, большинству, бросил, будто, был, было, в, вам, Введи, Ввод, виден, Вмешался, возврат, Войти, ВПИСЫВАЙСЯ, время, Все, вторую, Вы, Выбери, выбор, вывез, вызов, Вызов, где, Где, говорят, года, Голос, Готово, да, Да, Дай, дальше, деле, дело, Дистанция, для, Для, Драма, душноты, если, за, забрал, завершён, завершился, задаёт, займет, закрыта, Занялся, Занят, запрошен, Здесь, зовёт, зря, и, Игрок, игрока, идем, или, ИМЯ, интерфейса, Используйте, исчерпан, итог, Итог, К, кажется, Кажется, как, ком, конвертировать, контролем, конфликт, Конфликт, конфликте, Коп, кошелек, Кошелек, Красные, кто, Кто, Кулдаун, лимит, Лимит, Мало, Мейн, мейне, Меню, могу, Можно, мы, на, наблюдаю, найден, найдено, не, Не, НЕ, неделе, недоступно, Недоступно, некорректен, нет, ник, ничьей, ничья, Ничья, о, ого, ОК, Опасная, Оппонент, Оранжевые, остаток, Ответь, отвечай, отдал, открыты, оформляю, ошибаюсь, паузу, первую, персонажу, плати, Победа, победили, победителю, Погнали, под, подтвердилось, позже, пока, получила, получилось, поменять, Понял, Пополните, Попробуй, Поражение, Последние, Правила, Принял, принят, принята, Принято, про, Про, Проверка, Проверяю, проголосовал, Продолжить, проиграли, просел, пути, работает, Разберусь, Рано, расследованием, реванш, Реванш, ресурс, решает, Решим, риск, родился, рождения, рядом, с, самом, сбросили, Сбросить, Свалить, связи, связь, сдан, Сдать, Сдача, сегодня, сейчас, Сейчас, Ситуация, слабый, Слабый, слуху, Снести, Сообщение, сохраняем, сошлась, сошлись, списывает, спокойнее, сразу, Ставка, старт, Старт, старту, Суть, Такого, тебе, Тише, Толпа, ТОЛПА, Только, точка, точный, Ты, ТЫКНИ, уважение, уважения, Увеличить, уверены, уже, Уже, УЖЕ, указан, Уменьшить, уходи, учтён, Факт, фактов, Факты, хватает, ход, Цель, Цена, Цепочка, цифру, цифры, Чёрные, чтобы, чувствую, Штраф, шум, шумели, экипаж, этой, этому, я, Я

### English Words
A, AsyncScene, B, Cap, DRAW, Dev, Incorrect, Mode, PIN, Points, RIP, WIN, cap, device, disabled, max, on, this, unlocked

### Emoji Resource Tokens
…, ✓, ✕, ⭐, 💰

### Template Variables
{NAME}, {X}, {aVotes}, {amount}, {arg}, {attackerInf}, {attackerName}, {a}, {bVotes}, {b}, {cop.fullName}, {cost}, {escapeCost}, {name}, {oppName}, {rematchCost}, {student}, {target}, {teacher}, {text}

## Taboo Candidates
- Listed only from words already present in the inventory.
- No replacements decided here.

Андер, андере, баттл, Баттл, ВПИСЫВАЙСЯ, вывез, Драма, душноты, забрал, кошелек, Кошелек, Кулдаун, лимит, Лимит, Мейн, не, Не, НЕ, ого, Погнали, просел, реванш, Реванш, Свалить, Снести, старт, Старт, Толпа, ТОЛПА, ТЫКНИ, шумели, cap, Cap, Dev, disabled, DRAW, Incorrect, Mode, PIN, RIP, unlocked, WIN

## New Feature Coverage
- cop_flow covered
- battle/rematch covered
- crowd/vote covered
- economy/caps covered
- NPC speech covered
- NPC DM covered
- toast/system messages covered

## Verification
- ok:true
- failures:[]
- forbiddenRemaining:[]
- missingCoverage:[]
- failedChecks:[]
- entryCount === 223
- uniqueTextCount === 191
- every TXT_0001 through TXT_0223 present exactly once
- every entry has currentText, sourceFile, sourceLine, category, surface, key, profile
- all categories covered
- no replacement text added
