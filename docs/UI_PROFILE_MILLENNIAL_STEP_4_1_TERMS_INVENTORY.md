# UI_PROFILE_MILLENNIAL_STEP_4_1_TERMS_INVENTORY

## Scope
- source inventory only
- no replacements
- no runtime copy changes

## Coverage Summary
- entryCount: 124
- primaryCategoryCounts:
  - buttons: 13
  - statuses: 10
  - errors: 29
  - hints: 23
  - economy: 13
  - battles: 8
  - dm: 28
- duplicateSourceNoteCount: 2
- nonEmptySourceNoteCount: 26

## Primary Categories Covered
- buttons
- statuses
- errors
- hints
- economy
- battles
- dm

## Profiles Covered
- millennial
- shared

## Full Entry Table
```text
TXT_0001 | statuses | start_screen_title | start_title | AsyncScene | AsyncScene/Web/system.js:115 | dynamic:no | vars: | notes:
TXT_0002 | statuses | start_screen_title | start_title | AsyncScene | AsyncScene/Web/data.js:343 | dynamic:no | vars: | notes:duplicate runtime source
TXT_0003 | hints | start_screen_intro | startIntroPick | Оппонент задаёт риск. | AsyncScene/Web/system.js:116 | dynamic:no | vars: | notes:
TXT_0004 | hints | start_screen_intro | startIntroStake | Ставка списывает ресурс. | AsyncScene/Web/system.js:117 | dynamic:no | vars: | notes:
TXT_0005 | hints | start_screen_intro | startIntroResult | Итог виден сразу. | AsyncScene/Web/system.js:118 | dynamic:no | vars: | notes:
TXT_0006 | hints | start_screen_intro | startEconomyHonesty | Цена и итог сразу. | AsyncScene/Web/system.js:119 | dynamic:no | vars: | notes:
TXT_0007 | buttons | start_screen_action | startActionStart | Старт | AsyncScene/Web/system.js:120 | dynamic:no | vars: | notes:
TXT_0008 | buttons | start_screen_action | startActionRules | Суть | AsyncScene/Web/system.js:121 | dynamic:no | vars: | notes:
TXT_0009 | statuses | start_profile_millennial | birth_digits_label | Последние 2 цифры года рождения | AsyncScene/Web/data.js:30 | dynamic:no | vars: | notes:
TXT_0010 | buttons | start_profile_millennial | digit_up_first | Увеличить первую цифру | AsyncScene/Web/data.js:31 | dynamic:no | vars: | notes:
TXT_0011 | buttons | start_profile_millennial | digit_down_first | Уменьшить первую цифру | AsyncScene/Web/data.js:32 | dynamic:no | vars: | notes:
TXT_0012 | buttons | start_profile_millennial | digit_up_second | Увеличить вторую цифру | AsyncScene/Web/data.js:33 | dynamic:no | vars: | notes:
TXT_0013 | buttons | start_profile_millennial | digit_down_second | Уменьшить вторую цифру | AsyncScene/Web/data.js:34 | dynamic:no | vars: | notes:
TXT_0014 | hints | start_profile_millennial | profile_helper | Только для интерфейса. Не сохраняем. Можно поменять позже. | AsyncScene/Web/data.js:35 | dynamic:no | vars: | notes:
TXT_0015 | statuses | start_profile_millennial | fantasy_birth_label | я на самом деле чувствую будто я родился в … | AsyncScene/Web/data.js:36 | dynamic:no | vars: | notes:
TXT_0016 | buttons | start_profile_millennial | start_continue | Продолжить | AsyncScene/Web/data.js:37 | dynamic:no | vars: | notes:
TXT_0017 | buttons | start_profile_millennial | start_start | Старт | AsyncScene/Web/data.js:38 | dynamic:no | vars: | notes:
TXT_0018 | buttons | start_profile_millennial | start_reset | Сбросить старт | AsyncScene/Web/data.js:39 | dynamic:no | vars: | notes:
TXT_0023 | statuses | system_copy | saved | Готово. | AsyncScene/Web/system.js:53 | dynamic:no | vars: | notes:
TXT_0024 | errors | system_copy | missingMessage | Сообщение недоступно. | AsyncScene/Web/system.js:30 | dynamic:no | vars: | notes:
TXT_0025 | errors | system_copy | insufficientPoints | Не хватает 💰. | AsyncScene/Web/system.js:31 | dynamic:no | vars: | notes:
TXT_0026 | errors | system_copy | pointsLowBattle | Мало 💰 на баттл. | AsyncScene/Web/system.js:32 | dynamic:no | vars: | notes:
TXT_0027 | errors | system_copy | unavailable | Недоступно. | AsyncScene/Web/system.js:33 | dynamic:no | vars: | notes:
TXT_0028 | errors | system_copy | notFound | Не найдено. | AsyncScene/Web/system.js:34 | dynamic:no | vars: | notes:
TXT_0029 | errors | system_copy | choosePlayer | Игрок не указан. | AsyncScene/Web/system.js:35 | dynamic:no | vars: | notes:
TXT_0030 | errors | system_copy | reportFalsePenalty | Штраф: -5 💰. | AsyncScene/Web/system.js:36 | dynamic:no | vars: | notes:
TXT_0031 | errors | system_copy | checkInput | Ввод некорректен. | AsyncScene/Web/system.js:43 | dynamic:no | vars: | notes:
TXT_0032 | errors | system_copy | cooldownShort | Кулдаун активен. | AsyncScene/Web/system.js:44 | dynamic:no | vars: | notes:
TXT_0033 | hints | system_copy | copCooldown | Проверка займет время. | AsyncScene/Web/system.js:45 | dynamic:no | vars: | notes:
TXT_0034 | economy | system_copy | pointsDeltaPlusOne | +1💰 | AsyncScene/Web/system.js:54 | dynamic:no | vars: | notes:
TXT_0035 | economy | system_copy | repDeltaPlusOne | +1⭐ | AsyncScene/Web/system.js:55 | dynamic:no | vars: | notes:
TXT_0036 | statuses | system_copy | voteAccepted | Голос учтён. | AsyncScene/Web/system.js:59 | dynamic:no | vars: | notes:
TXT_0037 | dm | system_copy | reportPending | Проверяю. | AsyncScene/Web/system.js:60 | dynamic:no | vars: | notes:
TXT_0038 | economy | system_copy | reportTrueReward | Сдать {name}: +2💰. | AsyncScene/Web/system.js:61 | dynamic:yes | vars:name | notes:
TXT_0039 | dm | system_copy | reportOk | Коп: {name} сдан, +2💰. | AsyncScene/Web/system.js:62 | dynamic:yes | vars:name | notes:
TXT_0040 | dm | system_copy | trainingSent | Аргумент: {teacher} → {student}. | AsyncScene/Web/system.js:65 | dynamic:yes | vars:teacher,student | notes:
TXT_0041 | battles | system_copy | rematchRequested | {name} зовёт на реванш. | AsyncScene/Web/system.js:66 | dynamic:yes | vars:name | notes:
TXT_0042 | buttons | system_copy | escapePaid | Свалить за 1💰. | AsyncScene/Web/system.js:67 | dynamic:no | vars: | notes:
TXT_0043 | economy | system_copy | pointsDeltaRefund | +1💰 возврат. | AsyncScene/Web/system.js:68 | dynamic:no | vars: | notes:
TXT_0044 | economy | system_copy | pointsDeltaRefundMajority | +1💰 возврат большинству. | AsyncScene/Web/system.js:69 | dynamic:no | vars: | notes:
TXT_0045 | economy | system_copy | pointsDeltaRemainderWin | +1💰 остаток победителю. | AsyncScene/Web/system.js:70 | dynamic:no | vars: | notes:
TXT_0046 | economy | system_copy | rematchCost | Реванш: -{rematchCost}💰. | AsyncScene/Web/system.js:71 | dynamic:yes | vars:rematchCost | notes:
TXT_0047 | buttons | system_copy | escapeVoteCost | Свалить: -{escapeCost}💰. | AsyncScene/Web/system.js:72 | dynamic:yes | vars:escapeCost | notes:
TXT_0048 | economy | system_copy | p2pTransferSent | {target}: +{amount}💰. | AsyncScene/Web/system.js:73 | dynamic:yes | vars:target,amount | notes:
TXT_0049 | economy | system_copy | p2pTransferReceived | {target}: +{amount}💰 тебе. | AsyncScene/Web/system.js:74 | dynamic:yes | vars:target,amount | notes:
TXT_0050 | battles | system_events | battleChallenge | {attackerName} [{attackerInf}] бросил вызов. | AsyncScene/Web/system.js:82 | dynamic:yes | vars:attackerName,attackerInf | notes:
TXT_0051 | battles | system_events | battleResult | Баттл с {oppName}: {text}. | AsyncScene/Web/system.js:85 | dynamic:yes | vars:oppName,text | notes:
TXT_0052 | battles | system_events | battleDraw | {a} и {b}: ничья. | AsyncScene/Web/system.js:90 | dynamic:yes | vars:a,b | notes:
TXT_0053 | battles | system_events | crowdResolved | Толпа: {name} {aVotes}:{bVotes}. | AsyncScene/Web/system.js:92 | dynamic:yes | vars:name,aVotes,bVotes | notes:
TXT_0054 | battles | system_events | unlockOrange | Оранжевые аргументы открыты. | AsyncScene/Web/system.js:93 | dynamic:no | vars: | notes:
TXT_0055 | battles | system_events | unlockRed | Красные аргументы открыты. | AsyncScene/Web/system.js:94 | dynamic:no | vars: | notes:
TXT_0056 | battles | system_events | unlockBlack | Чёрные аргументы открыты. | AsyncScene/Web/system.js:95 | dynamic:no | vars: | notes:
TXT_0057 | hints | system_events | startIntroPick | Оппонент задаёт риск. | AsyncScene/Web/system.js:116 | dynamic:no | vars: | notes:
TXT_0058 | hints | system_events | startIntroStake | Ставка списывает ресурс. | AsyncScene/Web/system.js:117 | dynamic:no | vars: | notes:
TXT_0059 | hints | system_events | startIntroResult | Итог виден сразу. | AsyncScene/Web/system.js:118 | dynamic:no | vars: | notes:
TXT_0060 | hints | system_events | startEconomyHonesty | Цена и итог сразу. | AsyncScene/Web/system.js:119 | dynamic:no | vars: | notes:
TXT_0061 | buttons | menu | menu_title | Меню | AsyncScene/Web/system.js:120 | dynamic:no | vars: | notes:
TXT_0062 | buttons | menu | return_to_start | К старту | AsyncScene/Web/system.js:121 | dynamic:no | vars: | notes:
TXT_0063 | statuses | menu | goal_label | Цель | AsyncScene/Web/system.js:122 | dynamic:no | vars: | notes:
TXT_0079 | dm | cop_templates | cop_report_accept[0] | Понял. Проверяю. | AsyncScene/Web/data.js:400 | dynamic:no | vars: | notes:
TXT_0080 | dm | cop_templates | cop_report_accept[1] | Принял. Разберусь. | AsyncScene/Web/data.js:400 | dynamic:no | vars: | notes:
TXT_0081 | dm | cop_templates | cop_busy[0] | Занят, связь позже. | AsyncScene/Web/data.js:401 | dynamic:no | vars: | notes:
TXT_0082 | dm | cop_templates | cop_busy[1] | Не могу, оформляю дело. | AsyncScene/Web/data.js:401 | dynamic:no | vars: | notes:
TXT_0083 | dm | cop_templates | cop_report_ok[0] | Проверка сошлась. Вмешался. | AsyncScene/Web/data.js:402 | dynamic:no | vars: | notes:
TXT_0084 | dm | cop_templates | cop_report_ok[1] | Проверка сошлась. Занялся. | AsyncScene/Web/data.js:402 | dynamic:no | vars: | notes:
TXT_0085 | dm | cop_templates | cop_report_fail[0] | Не подтвердилось. Факты не сошлись. | AsyncScene/Web/data.js:403 | dynamic:no | vars: | notes:
TXT_0086 | dm | cop_templates | cop_cooldown[0] | Проверка займет время. | AsyncScene/Web/data.js:404 | dynamic:no | vars: | notes:resolved via system warnings copy
TXT_0108 | economy | cap_messages | rep | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | AsyncScene/Web/data.js:591 | dynamic:no | vars: | notes:
TXT_0109 | economy | cap_messages | points | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | AsyncScene/Web/data.js:592 | dynamic:no | vars: | notes:
TXT_0110 | dm | cop_templates | intros[0] | {cop.fullName} на связи. | AsyncScene/Web/data.js:493 | dynamic:yes | vars:cop.fullName | notes:
TXT_0111 | dm | cop_templates | warnings[0] | Опасная точка рядом. | AsyncScene/Web/data.js:505 | dynamic:no | vars: | notes:
TXT_0112 | errors | cop_templates | warnings[1] | Вызов принят, экипаж в пути. | AsyncScene/Web/data.js:506 | dynamic:no | vars: | notes:
TXT_0113 | errors | cop_templates | warnings[2] | Ситуация под контролем. | AsyncScene/Web/data.js:507 | dynamic:no | vars: | notes:
TXT_0114 | dm | cop_templates | chatReplies[0] | Принято, наблюдаю. | AsyncScene/Web/data.js:541 | dynamic:no | vars: | notes:
TXT_0115 | dm | cop_templates | chatReplies[1] | Факт принят, идем дальше. | AsyncScene/Web/data.js:542 | dynamic:no | vars: | notes:
TXT_0116 | dm | cop_templates | cooldownReplies[0] | Занят расследованием, связь позже. | AsyncScene/Web/data.js:553 | dynamic:no | vars: | notes:
TXT_0117 | dm | cop_templates | thanks[0] | Сдача принята - спокойнее. | AsyncScene/Web/data.js:565 | dynamic:no | vars: | notes:
TXT_0118 | errors | cop_templates | scolds[0] | «Сдать» без фактов - шум. | AsyncScene/Web/data.js:577 | dynamic:no | vars: | notes:
TXT_0119 | hints | arg_base_y_about | q0 | Кто сегодня на слуху, если не ошибаюсь? | AsyncScene/Web/data.js:791 | dynamic:yes | vars:NAME | notes:
TXT_0120 | hints | arg_base_y_about | a0 | Кажется, про {NAME} говорят. | AsyncScene/Web/data.js:791 | dynamic:yes | vars:NAME | notes:
TXT_0121 | hints | arg_base_y_who | q0 | Кто, как вам кажется, был рядом? | AsyncScene/Web/data.js:802 | dynamic:yes | vars:NAME | notes:
TXT_0122 | hints | arg_base_y_who | a0 | {NAME}. | AsyncScene/Web/data.js:802 | dynamic:yes | vars:NAME | notes:
TXT_0123 | hints | arg_base_y_where | q0 | Где мы сейчас, как вам кажется? | AsyncScene/Web/data.js:813 | dynamic:yes | vars:PLACE | notes:
TXT_0124 | hints | arg_base_y_where | a0 | Здесь. | AsyncScene/Web/data.js:813 | dynamic:no | vars: | notes:
TXT_0125 | hints | arg_base_y_yn | q0 | Вы уверены? | AsyncScene/Web/data.js:824 | dynamic:yes | vars:NAME | notes:
TXT_0126 | hints | arg_base_y_yn | a0 | Да. | AsyncScene/Web/data.js:824 | dynamic:no | vars: | notes:
TXT_0127 | hints | arg_base_o_about | q0 | Кто сегодня на слуху? | AsyncScene/Web/data.js:838 | dynamic:yes | vars:NAME | notes:
TXT_0128 | hints | arg_base_o_about | a0 | Про {NAME} говорят. | AsyncScene/Web/data.js:838 | dynamic:yes | vars:NAME | notes:
TXT_0129 | hints | arg_base_o_yn | q0 | Вы уверены? | AsyncScene/Web/data.js:878 | dynamic:yes | vars:NAME | notes:
TXT_0130 | dm | npc_say_toxic_m | 0 | слабый ход | AsyncScene/Web/npcs.js:147 | dynamic:no | vars: | notes:
TXT_0131 | dm | npc_say_toxic_m | 1 | отвечай сейчас | AsyncScene/Web/npcs.js:148 | dynamic:no | vars: | notes:
TXT_0132 | dm | npc_say_bandit_m | 0 | кошелек ближе | AsyncScene/Web/npcs.js:168 | dynamic:no | vars: | notes:
TXT_0133 | dm | npc_say_bandit_m | 1 | плати и уходи | AsyncScene/Web/npcs.js:169 | dynamic:no | vars: | notes:
TXT_0134 | dm | npc_say_cop_m | 0 | Принято. Дистанция | AsyncScene/Web/npcs.js:196 | dynamic:no | vars: | notes:
TXT_0135 | dm | npc_say_mafia_m | 0 | Тише | AsyncScene/Web/npcs.js:212 | dynamic:no | vars: | notes:
TXT_0136 | dm | npc_say_crowd_m | 0 | ого | AsyncScene/Web/npcs.js:232 | dynamic:no | vars: | notes:
TXT_0137 | dm | npc_dm_profile_cop | 0 | Принято. Я рядом. | AsyncScene/Web/npcs.js:250 | dynamic:no | vars: | notes:
TXT_0138 | dm | npc_dm_profile_mafia | 0 | Тише. Решим. | AsyncScene/Web/npcs.js:257 | dynamic:no | vars: | notes:
TXT_0139 | dm | npc_dm_profile_bandit | 0 | Кошелек ближе. | AsyncScene/Web/npcs.js:264 | dynamic:no | vars: | notes:
TXT_0140 | dm | npc_dm_profile_toxic | 0 | Слабый ход. | AsyncScene/Web/npcs.js:271 | dynamic:no | vars: | notes:
TXT_0141 | statuses | events_vote_toast | showVoteBtnToast | Ты уже проголосовал. | AsyncScene/Web/ui/ui-events.js:856 | dynamic:no | vars: | notes:vote/crowd toast
TXT_0142 | errors | events_vote_toast | insufficient_points_vote | Не хватает 💰. | AsyncScene/Web/ui/ui-events.js:898 | dynamic:no | vars: | notes:vote/crowd toast
TXT_0143 | errors | battle_rematch | rematch_already_requested | Реванш уже запрошен. | AsyncScene/Web/ui/ui-battles.js:1089 | dynamic:no | vars: | notes:battle toast
TXT_0144 | errors | battle_rematch | rematch_not_eligible | Недоступно. Баттл не завершён. | AsyncScene/Web/ui/ui-battles.js:1093 | dynamic:no | vars: | notes:battle toast
TXT_0145 | errors | battle_rematch | rematch_not_found | Недоступно. | AsyncScene/Web/ui/ui-battles.js:1097 | dynamic:no | vars: | notes:battle toast
TXT_0146 | hints | battle_invite | choose_player | Выбери игрока. | AsyncScene/Web/ui/ui-battles.js:1646 | dynamic:no | vars: | notes:battle toast
TXT_0147 | errors | battle_invite | target_missing | Такого нет. | AsyncScene/Web/ui/ui-battles.js:1663 | dynamic:no | vars: | notes:battle toast
TXT_0148 | errors | battle_invite | cooldown_short | Кулдаун активен. | AsyncScene/Web/ui/ui-battles.js:1672 | dynamic:no | vars: | notes:resolved via system warnings copy
TXT_0149 | errors | battle_invite | insufficient_points | Не хватает 💰. | AsyncScene/Web/ui/ui-battles.js:1691 | dynamic:no | vars: | notes:resolved via system errors copy
TXT_0150 | errors | respect_flow | respect_no_points | Не хватает 💰. | AsyncScene/Web/ui/ui-dm.js:13 | dynamic:no | vars: | notes:resolved via system errors copy
TXT_0151 | errors | respect_flow | respect_pair_daily | Уже было уважение сегодня этому персонажу. | AsyncScene/Web/ui/ui-dm.js:14 | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0152 | errors | respect_flow | respect_no_chain | Цепочка A->B->A сегодня не работает. | AsyncScene/Web/ui/ui-dm.js:15 | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0153 | errors | respect_flow | respect_emitter_empty | Лимит уважения на сегодня исчерпан. | AsyncScene/Web/ui/ui-dm.js:16 | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0154 | errors | respect_flow | respect_fallback | Сейчас не получилось. Попробуй позже. | AsyncScene/Web/ui/ui-dm.js:81 | dynamic:no | vars: | notes:required toast string from current runtime diagnostics
TXT_0155 | economy | respect_flow | respect_paid | Ты отдал 1💰 | AsyncScene/Web/state.js:0 | dynamic:no | vars: | notes:extracted from runtime toast diagnostics; source line not directly visible in the scanned excerpt
TXT_0156 | economy | respect_flow | respect_target_rep | Цель получила +1 ⭐ | AsyncScene/Web/state.js:0 | dynamic:no | vars: | notes:extracted from runtime toast diagnostics; source line not directly visible in the scanned excerpt
TXT_0157 | statuses | menu_dev_mode | dev_mode_disabled | Dev Mode disabled. | AsyncScene/Web/ui/ui-menu.js:214 | dynamic:no | vars: | notes:dev_visible
TXT_0158 | statuses | menu_dev_mode | dev_mode_unlocked | Dev Mode unlocked on this device. | AsyncScene/Web/ui/ui-menu.js:228 | dynamic:no | vars: | notes:dev_visible
TXT_0159 | errors | menu_dev_mode | dev_mode_pin_incorrect | Incorrect Dev Mode PIN. | AsyncScene/Web/ui/ui-menu.js:230 | dynamic:no | vars: | notes:dev_visible
TXT_0160 | hints | menu_lottery | menu_lottery_rano | Рано. Дай паузу. | AsyncScene/Web/ui/ui-menu.js:590 | dynamic:no | vars: | notes:menu lottery/dev toast
TXT_0161 | errors | menu_unavailable | menu_unavailable | Недоступно. | AsyncScene/Web/ui/ui-menu.js:326 | dynamic:no | vars: | notes:menu lottery toast
TXT_0162 | errors | menu_unavailable | menu_unavailable_again | Недоступно. | AsyncScene/Web/ui/ui-menu.js:568 | dynamic:no | vars: | notes:menu lottery toast
TXT_0163 | errors | menu_unavailable | menu_unavailable_notify | Недоступно. | AsyncScene/Web/ui/ui-menu.js:581 | dynamic:no | vars: | notes:menu lottery toast
TXT_0164 | errors | events_vote | vote_not_enough_points | Не хватает 💰. | AsyncScene/Web/ui/ui-events.js:897 | dynamic:no | vars: | notes:duplicate runtime source
```

## Integrity
- source rows preserved exactly: true
- no invented entries: true
- duplicate-source notes preserved: true
- runtime pass claimed: false
