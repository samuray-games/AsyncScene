# Alpha New Feature Copy - Step 4.3.5

## Scope

- Seven new feature groups are covered.
- Seventy-three registered runtime copy entries are covered.
- Sixty-six entries change.
- Seven entries remain exact identity mappings.
- Copy changes only.
- Gameplay and economy rules are unchanged.
- Runtime keys and variables are unchanged.

## Contract

- featureCount: 7
- mappedEntryCount: 73
- changedEntryCount: 66
- identityEntryCount: 7
- coveragePercent: 100
- runtimeCopyChanged: true
- mappingApplied: true
- gameplayLogicChanged: false
- economyLogicChanged: false
- battleLogicChanged: false
- npcLogicChanged: false
- stateLogicChanged: false

## Exact feature counts

- cop: 23
- mafia: 2
- crowd: 9
- rematch: 5
- npc_vs_npc: 10
- timers: 9
- economy_ui: 30

## Exact mapping table

| mappingId | sourceInventoryId | featureTags | sourceFile | surface | key | oldText | alphaText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFS_0001 | TXT_0006 | economy_ui | AsyncScene/Web/system.js | start_screen_intro | startEconomyHonesty | Цена и итог сразу. | Цена и итог сразу. |
| NFS_0002 | TXT_0025 | economy_ui | AsyncScene/Web/system.js | system_copy | insufficientPoints | Не хватает 💰. | Мало 💰 |
| NFS_0003 | TXT_0026 | economy_ui | AsyncScene/Web/system.js | system_copy | pointsLowBattle | Мало 💰 на баттл. | Мало 💰 |
| NFS_0004 | TXT_0030 | economy_ui | AsyncScene/Web/system.js | system_copy | reportFalsePenalty | Штраф: -5 💰. | Штраф: -5💰 |
| NFS_0005 | TXT_0032 | timers | AsyncScene/Web/system.js | system_copy | cooldownShort | Кулдаун активен. | Пауза: активно |
| NFS_0006 | TXT_0033 | cop,timers | AsyncScene/Web/system.js | system_copy | copCooldown | Проверка займет время. | Проверка: ожидание |
| NFS_0007 | TXT_0034 | economy_ui | AsyncScene/Web/system.js | system_copy | pointsDeltaPlusOne | +1💰 | +1💰 |
| NFS_0008 | TXT_0035 | economy_ui | AsyncScene/Web/system.js | system_copy | repDeltaPlusOne | +1⭐ | +1⭐ |
| NFS_0009 | TXT_0036 | crowd | AsyncScene/Web/system.js | system_copy | voteAccepted | Голос учтён. | Голос: принято |
| NFS_0010 | TXT_0037 | cop | AsyncScene/Web/system.js | system_copy | reportPending | Проверяю. | Проверка |
| NFS_0011 | TXT_0038 | cop,economy_ui | AsyncScene/Web/system.js | system_copy | reportTrueReward | Сдать {name}: +2💰. | Сдать {name}: +2💰 |
| NFS_0012 | TXT_0039 | cop,economy_ui | AsyncScene/Web/system.js | system_copy | reportOk | Коп: {name} сдан, +2💰. | Отчёт: {name}. +2💰 |
| NFS_0013 | TXT_0041 | rematch | AsyncScene/Web/system.js | system_copy | rematchRequested | {name} зовёт на реванш. | {name}: реванш |
| NFS_0014 | TXT_0042 | economy_ui | AsyncScene/Web/system.js | system_copy | escapePaid | Свалить за 1💰. | Уйти: 1💰 |
| NFS_0015 | TXT_0043 | economy_ui | AsyncScene/Web/system.js | system_copy | pointsDeltaRefund | +1💰 возврат. | Возврат: +1💰 |
| NFS_0016 | TXT_0044 | crowd,economy_ui | AsyncScene/Web/system.js | system_copy | pointsDeltaRefundMajority | +1💰 возврат большинству. | Большинство: +1💰 |
| NFS_0017 | TXT_0045 | crowd,economy_ui | AsyncScene/Web/system.js | system_copy | pointsDeltaRemainderWin | +1💰 остаток победителю. | Остаток: +1💰 |
| NFS_0018 | TXT_0046 | rematch,economy_ui | AsyncScene/Web/system.js | system_copy | rematchCost | Реванш: -{rematchCost}💰. | Реванш: -{rematchCost}💰 |
| NFS_0019 | TXT_0047 | economy_ui | AsyncScene/Web/system.js | system_copy | escapeVoteCost | Свалить: -{escapeCost}💰. | Уйти: -{escapeCost}💰 |
| NFS_0020 | TXT_0048 | economy_ui | AsyncScene/Web/system.js | system_copy | p2pTransferSent | {target}: +{amount}💰. | {target}: +{amount}💰 |
| NFS_0021 | TXT_0049 | economy_ui | AsyncScene/Web/system.js | system_copy | p2pTransferReceived | {target}: +{amount}💰 тебе. | {target}: +{amount}💰 |
| NFS_0022 | TXT_0050 | npc_vs_npc | AsyncScene/Web/system.js | system_events | battleChallenge | {attackerName} [{attackerInf}] бросил вызов. | {attackerName} [{attackerInf}]: вызов |
| NFS_0023 | TXT_0051 | npc_vs_npc | AsyncScene/Web/system.js | system_events | battleResult | Баттл с {oppName}: {text}. | {oppName}: {text} |
| NFS_0024 | TXT_0052 | npc_vs_npc | AsyncScene/Web/system.js | system_events | battleDraw | {a} и {b}: ничья. | {a} и {b}: ничья |
| NFS_0025 | TXT_0053 | crowd,npc_vs_npc | AsyncScene/Web/system.js | system_events | crowdResolved | Толпа: {name} {aVotes}:{bVotes}. | Толпа: {name} {aVotes}:{bVotes} |
| NFS_0026 | TXT_0060 | economy_ui | AsyncScene/Web/system.js | system_events | startEconomyHonesty | Цена и итог сразу. | Цена и итог сразу. |
| NFS_0027 | TXT_0064 | npc_vs_npc | AsyncScene/Web/data.js | battle_results | battle_win | Победа | Победа |
| NFS_0028 | TXT_0065 | npc_vs_npc | AsyncScene/Web/data.js | battle_results | battle_loss | Поражение | Поражение |
| NFS_0029 | TXT_0066 | crowd,npc_vs_npc | AsyncScene/Web/data.js | battle_results | battle_draw | Толпа решает | Ничья |
| NFS_0030 | TXT_0067 | npc_vs_npc | AsyncScene/Web/data.js | conflict_results | conflict_win | Вы победили в конфликте. | Победа |
| NFS_0031 | TXT_0068 | npc_vs_npc | AsyncScene/Web/data.js | conflict_results | conflict_loss | Вы проиграли конфликт. | Поражение |
| NFS_0032 | TXT_0069 | npc_vs_npc | AsyncScene/Web/data.js | conflict_results | conflict_draw | Конфликт завершился ничьей. | Ничья |
| NFS_0033 | TXT_0070 | economy_ui | AsyncScene/Web/data.js | battle | escape_button_label | Свалить: {X} | Уйти: {X} |
| NFS_0034 | TXT_0079 | cop | AsyncScene/Web/data.js | cop_templates | cop_report_accept[0] | Понял. Проверяю. | Принято. Проверка |
| NFS_0035 | TXT_0080 | cop | AsyncScene/Web/data.js | cop_templates | cop_report_accept[1] | Принял. Разберусь. | Принято. Проверка |
| NFS_0036 | TXT_0081 | cop,timers | AsyncScene/Web/data.js | cop_templates | cop_busy[0] | Занят, связь позже. | Занято. Позже |
| NFS_0037 | TXT_0082 | cop,timers | AsyncScene/Web/data.js | cop_templates | cop_busy[1] | Не могу, оформляю дело. | Недоступно. Проверка |
| NFS_0038 | TXT_0083 | cop | AsyncScene/Web/data.js | cop_templates | cop_report_ok[0] | Проверка сошлась. Вмешался. | Проверка: верно |
| NFS_0039 | TXT_0084 | cop | AsyncScene/Web/data.js | cop_templates | cop_report_ok[1] | Проверка сошлась. Занялся. | Проверка: верно |
| NFS_0040 | TXT_0085 | cop | AsyncScene/Web/data.js | cop_templates | cop_report_fail[0] | Не подтвердилось. Факты не сошлись. | Проверка: неверно |
| NFS_0041 | TXT_0086 | cop,timers | AsyncScene/Web/data.js | cop_templates | cop_cooldown[0] | Проверка займет время. | Проверка: ожидание |
| NFS_0042 | TXT_0108 | economy_ui | AsyncScene/Web/data.js | cap_messages | rep | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | Лимит ⭐. Пополнить 💰 |
| NFS_0043 | TXT_0109 | economy_ui | AsyncScene/Web/data.js | cap_messages | points | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | Максимум 💰. Сбросить позже |
| NFS_0044 | TXT_0110 | cop | AsyncScene/Web/data.js | cop_templates | intros[0] | {cop.fullName} на связи. | {cop.fullName}: доступно |
| NFS_0045 | TXT_0111 | cop | AsyncScene/Web/data.js | cop_templates | warnings[0] | Опасная точка рядом. | Риск рядом |
| NFS_0046 | TXT_0112 | cop | AsyncScene/Web/data.js | cop_templates | warnings[1] | Вызов принят, экипаж в пути. | Вызов: принято |
| NFS_0047 | TXT_0113 | cop | AsyncScene/Web/data.js | cop_templates | warnings[2] | Ситуация под контролем. | Статус: готово |
| NFS_0048 | TXT_0114 | cop | AsyncScene/Web/data.js | cop_templates | chatReplies[0] | Принято, наблюдаю. | Принято |
| NFS_0049 | TXT_0115 | cop | AsyncScene/Web/data.js | cop_templates | chatReplies[1] | Факт принят, идем дальше. | Факт: принято |
| NFS_0050 | TXT_0116 | cop,timers | AsyncScene/Web/data.js | cop_templates | cooldownReplies[0] | Занят расследованием, связь позже. | Занято. Позже |
| NFS_0051 | TXT_0117 | cop | AsyncScene/Web/data.js | cop_templates | thanks[0] | Сдача принята \u2014 спокойнее. | Отчёт: принято |
| NFS_0052 | TXT_0118 | cop | AsyncScene/Web/data.js | cop_templates | scolds[0] | «Сдать» без фактов \u2014 шум. | Факт: нет |
| NFS_0053 | TXT_0134 | cop | AsyncScene/Web/npcs.js | npc_say_cop_m | 0 | Принято. Дистанция | Принято |
| NFS_0054 | TXT_0135 | mafia | AsyncScene/Web/npcs.js | npc_say_mafia_m | 0 | Тише | Пауза |
| NFS_0055 | TXT_0136 | crowd | AsyncScene/Web/npcs.js | npc_say_crowd_m | 0 | ого | Голос |
| NFS_0056 | TXT_0137 | cop | AsyncScene/Web/npcs.js | npc_dm_profile_cop | 0 | Принято. Я рядом. | Принято. Рядом |
| NFS_0057 | TXT_0138 | mafia | AsyncScene/Web/npcs.js | npc_dm_profile_mafia | 0 | Тише. Решим. | Пауза |
| NFS_0058 | TXT_0141 | crowd | AsyncScene/Web/ui/ui-events.js | events_vote_toast | showVoteBtnToast | Ты уже проголосовал. | Голос: уже принято |
| NFS_0059 | TXT_0142 | crowd,economy_ui | AsyncScene/Web/ui/ui-events.js | events_vote_toast | insufficient_points_vote | Не хватает 💰. | Мало 💰 |
| NFS_0060 | TXT_0143 | rematch,timers | AsyncScene/Web/ui/ui-battles.js | battle_rematch | rematch_already_requested | Реванш уже запрошен. | Реванш: ожидание |
| NFS_0061 | TXT_0144 | rematch | AsyncScene/Web/ui/ui-battles.js | battle_rematch | rematch_not_eligible | Недоступно. Баттл не завершён. | Недоступно. Конфликт: активно |
| NFS_0062 | TXT_0145 | rematch | AsyncScene/Web/ui/ui-battles.js | battle_rematch | rematch_not_found | Недоступно. | Недоступно. |
| NFS_0063 | TXT_0148 | timers | AsyncScene/Web/ui/ui-battles.js | battle_invite | cooldown_short | Кулдаун активен. | Пауза: активно |
| NFS_0064 | TXT_0149 | economy_ui | AsyncScene/Web/ui/ui-battles.js | battle_invite | insufficient_points | Не хватает 💰. | Мало 💰 |
| NFS_0065 | TXT_0150 | economy_ui | AsyncScene/Web/ui/ui-dm.js | respect_flow | respect_no_points | Не хватает 💰. | Мало 💰 |
| NFS_0066 | TXT_0151 | economy_ui | AsyncScene/Web/ui/ui-dm.js | respect_flow | respect_pair_daily | Уже было уважение сегодня этому персонажу. | Уважение уже выбрано |
| NFS_0067 | TXT_0152 | economy_ui | AsyncScene/Web/ui/ui-dm.js | respect_flow | respect_no_chain | Цепочка A->B->A сегодня не работает. | Действие недоступно |
| NFS_0068 | TXT_0153 | economy_ui | AsyncScene/Web/ui/ui-dm.js | respect_flow | respect_emitter_empty | Лимит уважения на сегодня исчерпан. | Лимит уважения |
| NFS_0069 | TXT_0154 | economy_ui | AsyncScene/Web/ui/ui-dm.js | respect_flow | respect_fallback | Сейчас не получилось. Попробуй позже. | Ошибка. Повторить позже |
| NFS_0070 | TXT_0155 | economy_ui | AsyncScene/Web/state.js | respect_flow | respect_paid | Ты отдал 1💰 | Расход: 1💰 |
| NFS_0071 | TXT_0156 | economy_ui | AsyncScene/Web/state.js | respect_flow | respect_target_rep | Цель получила +1 ⭐ | Цель: +1⭐ |
| NFS_0072 | TXT_0160 | timers | AsyncScene/Web/ui/ui-menu.js | menu_lottery | menu_lottery_rano | Рано. Дай паузу. | Пауза |
| NFS_0073 | TXT_0164 | crowd,economy_ui | AsyncScene/Web/ui/ui-events.js | events_vote | vote_not_enough_points | Не хватает 💰. | Мало 💰 |
| NFS_0074 | TXT_0165 | respect | docs/system.js | system_profile_text | reputation_increased | Репа подросла. | Репа подросла. |
| NFS_0075 | TXT_0166 | respect | docs/system.js | system_profile_text | reputation_decreased | Репа просела. | Репа просела. |
| NFS_0076 | TXT_0167 | respect | docs/system.js | system_profile_text | reputation_unchanged | По репе без движухи. | По репе без движухи. |
| NFS_0077 | TXT_0168 | respect | docs/system.js | system_profile_text | respect_gained | Тебя начали респектить. | Тебя начали респектить. |
| NFS_0078 | TXT_0169 | respect | docs/system.js | system_profile_text | respect_lost | Респект просел. | Респект просел. |
| NFS_0079 | TXT_0170 | respect | docs/system.js | system_profile_text | disrespect_event | На тебя косо смотрят. | На тебя косо смотрят. |
| NFS_0080 | TXT_0171 | respect | docs/system.js | system_profile_text | reputation_high | Репа на весу. | Репа на весу. |
| NFS_0081 | TXT_0172 | respect | docs/system.js | system_profile_text | reputation_low | Репа тонкая. | Репа тонкая. |
| NFS_0082 | TXT_0173 | respect | docs/system.js | system_profile_text | reputation_recovered | Репа отлипла. | Репа отлипла. |
| NFS_0083 | TXT_0174 | respect | docs/system.js | system_profile_text | reputation_damaged | Репу помяло. | Репу помяло. |
