# UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING

## Scope

- Source rows come from the accepted Step 4.2 exact inventory bundle.
- Canonical identity uses NFC text, trimmed text, collapsed whitespace, casefolded comparison form, and the exact placeholder set.
- Repeated source occurrences are aggregated into one canonical millennial term row.
- The four Intro4 terms use the current task-authoritative Boomer override instead of stale pre-Step-4.2 Boomer wording.
- Runtime copy replacement is not part of this step.

## Contract

- smokeVersion: BOOMER-STEP4_3-TERMINOLOGY-MAPPING-STATIC-v2
- buildMarker: UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING
- rawInventoryRowCount: 164
- canonicalMillennialTermCount: 142
- aggregatedDuplicateOccurrenceCount: 22
- mappingRowCount: 142
- coveredSourceIdCount: 164
- legacyStoredNormalizedUniqueSourceTexts: 122
- legacyMetricAlgorithmDocumented: false
- legacyMetricReproducible: false
- legacyMetricUsedForAcceptance: false

## Required category coverage

- buttons: 23
- statuses: 18
- errors: 29
- hints: 5
- economy: 5
- battles: 42
- DM: 24

## Intro4 authoritative overrides

| millennialTerm | boomerTerm | authority |
| --- | --- | --- |
| Оппонент задаёт риск. | Соперник определяет уровень риска. | task_intro4_override_2026_07_03 |
| Ставка списывает ресурс. | Выбранная ставка списывается из запаса монет 💰. | task_intro4_override_2026_07_03 |
| Итог виден сразу. | Результат показывается сразу. | task_intro4_override_2026_07_03 |
| Цена и итог сразу. | Стоимость действия и его результат показываются сразу. | task_intro4_override_2026_07_03 |

## Legacy reconciliation summary

- legacyRowsTotal: 93
- legacyRowsReconciled: 93
- REUSED: 82
- SUPERSEDED_BY_STEP_4_2: 0
- COLLAPSED_DUPLICATE: 8
- REJECTED_STALE: 3
- REJECTED_INCORRECT_SOURCE: 0
- REJECTED_CANON_CONFLICT: 0

## Legacy reconciliation table

| legacyMappingId | millennialTerm | legacyBoomerTerm | reconciliation | canonicalMappingId |
| --- | --- | --- | --- | --- |
| MAP_0001 | Оппонент задаёт риск. | Оппонент задаёт риск действия. | REJECTED_STALE | MAP_0002 |
| MAP_0002 | Итог виден сразу. | Итог виден сразу после действия. | REJECTED_STALE | MAP_0004 |
| MAP_0003 | Цена и итог сразу. | Цена и итог показаны заранее. | REJECTED_STALE | MAP_0005 |
| MAP_0004 | Старт | Начать | REUSED | MAP_0006 |
| MAP_0005 | Сдать {name}: +2💰. | Сообщить о {name}: +2 💰. | REUSED | MAP_0036 |
| MAP_0006 | Только для интерфейса. Не сохраняем. Можно поменять позже. | Это влияет только на интерфейс. Выбор можно изменить позже. | REUSED | MAP_0013 |
| MAP_0007 | я на самом деле чувствую будто я родился в … | Я скорее ощущаю свой год рождения как … | REUSED | MAP_0014 |
| MAP_0008 | Погнали | Продолжить | REUSED | MAP_0017 |
| MAP_0009 | Снести выбор | Сбросить выбор | REUSED | MAP_0018 |
| MAP_0010 | Правила без душноты | Краткие правила | REUSED | MAP_0019 |
| MAP_0011 | Не хватает 💰. | Недостаточно 💰. | REUSED | MAP_0023 |
| MAP_0012 | Мало 💰 на баттл. | Недостаточно 💰 для баттла. | REUSED | MAP_0024 |
| MAP_0013 | Недоступно. | Действие недоступно. | REUSED | MAP_0025 |
| MAP_0014 | Недоступно. | Действие недоступно. | COLLAPSED_DUPLICATE | MAP_0025 |
| MAP_0015 | Выбери игрока. | Выберите игрока. | REUSED | MAP_0131 |
| MAP_0016 | Кулдаун активен. | Нужно подождать перед повторным действием. | REUSED | MAP_0030 |
| MAP_0017 | Проверка займет время. | Проверка займёт некоторое время. | REUSED | MAP_0031 |
| MAP_0018 | +1💰 | +1 💰 | REUSED | MAP_0032 |
| MAP_0019 | +1⭐ | +1 ⭐ | REUSED | MAP_0033 |
| MAP_0020 | Проверяю. | Проверка началась. | REUSED | MAP_0035 |
| MAP_0021 | Сдать {name}: +2💰. | Сообщить о {name}: +2 💰. | COLLAPSED_DUPLICATE | MAP_0036 |
| MAP_0022 | Коп: {name} сдан, +2💰. | Коп принял сообщение о {name}: +2 💰. | REUSED | MAP_0037 |
| MAP_0023 | Аргумент: {teacher} → {student}. | Аргумент передан: {teacher} → {student}. | REUSED | MAP_0038 |
| MAP_0024 | {name} зовёт на реванш. | {name} предлагает реванш. | REUSED | MAP_0039 |
| MAP_0025 | Свалить за 1💰. | Выйти за 1 💰. | REUSED | MAP_0040 |
| MAP_0026 | +1💰 возврат. | Возврат: +1 💰. | REUSED | MAP_0041 |
| MAP_0027 | +1💰 возврат большинству. | Возврат большинству: +1 💰. | REUSED | MAP_0042 |
| MAP_0028 | +1💰 остаток победителю. | Остаток победителю: +1 💰. | REUSED | MAP_0043 |
| MAP_0029 | Реванш: -{rematchCost}💰. | Реванш: -{rematchCost} 💰. | REUSED | MAP_0044 |
| MAP_0030 | Свалить: -{escapeCost}💰. | Выйти: -{escapeCost} 💰. | REUSED | MAP_0045 |
| MAP_0031 | {target}: +{amount}💰. | {target}: +{amount} 💰. | REUSED | MAP_0046 |
| MAP_0032 | {target}: +{amount}💰 тебе. | Вы получили от {target}: +{amount} 💰. | REUSED | MAP_0047 |
| MAP_0033 | {attackerName} [{attackerInf}] бросил вызов. | {attackerName} [{attackerInf}] начал конфликт. | REUSED | MAP_0048 |
| MAP_0034 | Толпа: {name} {aVotes}:{bVotes}. | Голосование толпы: {name} {aVotes}:{bVotes}. | REUSED | MAP_0051 |
| MAP_0035 | К старту | К стартовому экрану | REUSED | MAP_0056 |
| MAP_0036 | Толпа решает | Решает голосование | REUSED | MAP_0060 |
| MAP_0037 | Свалить: {X} | Выйти: {X} | REUSED | MAP_0064 |
| MAP_0038 | Для {student}: {arg}. Цена {cost} 💰. | Для {student}: {arg}. Цена: {cost} 💰. | REUSED | MAP_0065 |
| MAP_0039 | Введи точный ник. | Введите точное имя игрока. | REUSED | MAP_0066 |
| MAP_0040 | Понял. Проверяю. | Принято. Проверяю. | REUSED | MAP_0068 |
| MAP_0041 | Принял. Разберусь. | Принято. Разберусь. | REUSED | MAP_0069 |
| MAP_0042 | Занят, связь позже. | Сейчас занят. Связь будет позже. | REUSED | MAP_0070 |
| MAP_0043 | Занят, связь позже. | Сейчас занят. Связь будет позже. | COLLAPSED_DUPLICATE | MAP_0070 |
| MAP_0044 | Проверка сошлась. Вмешался. | Проверка подтвердилась. Я вмешался. | REUSED | MAP_0072 |
| MAP_0045 | Проверка сошлась. Занялся. | Проверка подтвердилась. Я занялся. | REUSED | MAP_0073 |
| MAP_0046 | Сдача принята — спокойнее. | Сообщение принято. Ситуация спокойнее. | REUSED | MAP_0105 |
| MAP_0047 | Ответь: кто? | Ответьте: кто? | REUSED | MAP_0075 |
| MAP_0048 | Ответь: где? | Ответьте: где? | REUSED | MAP_0076 |
| MAP_0049 | Ответь: о ком? | Ответьте: о ком? | REUSED | MAP_0077 |
| MAP_0050 | Ответь: да или нет? | Ответьте: да или нет? | REUSED | MAP_0078 |
| MAP_0051 | ТОЛПА | ГОЛОСОВАНИЕ | REUSED | MAP_0079 |
| MAP_0052 | ВПИСЫВАЙСЯ | ПРИСОЕДИНИТЬСЯ | REUSED | MAP_0080 |
| MAP_0053 | ТЫКНИ ИМЯ | ВЫБЕРИТЕ ИМЯ | REUSED | MAP_0081 |
| MAP_0054 | ✓ ОК | ✓ ПРИНЯТО | REUSED | MAP_0082 |
| MAP_0055 | ✓ ОК | ✓ ПРИНЯТО | COLLAPSED_DUPLICATE | MAP_0082 |
| MAP_0056 | ✕ НЕ | ✕ НЕДОСТУПНО | REUSED | MAP_0084 |
| MAP_0057 | WIN | ПОБЕДА | REUSED | MAP_0085 |
| MAP_0058 | RIP | ПОРАЖЕНИЕ | REUSED | MAP_0086 |
| MAP_0059 | DRAW | НИЧЬЯ | REUSED | MAP_0087 |
| MAP_0060 | Ты вывез. | Вы справились. | REUSED | MAP_0088 |
| MAP_0061 | Ты вывез. | Вы справились. | COLLAPSED_DUPLICATE | MAP_0088 |
| MAP_0062 | Конфликт завершился ничьей. | Конфликт завершился ничьей. | REUSED | MAP_0063 |
| MAP_0063 | Ты в мейне. | Вы поддержали большинство. | REUSED | MAP_0091 |
| MAP_0064 | Ты в андере. | Вы поддержали меньшинство. | REUSED | MAP_0092 |
| MAP_0065 | Мейн забрал. | Большинство победило. | REUSED | MAP_0093 |
| MAP_0066 | Андер просел. | Меньшинство проиграло. | REUSED | MAP_0094 |
| MAP_0067 | Драма закрыта. | Конфликт завершён. | REUSED | MAP_0095 |
| MAP_0068 | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | Лимит ⭐ на этой неделе исчерпан. Пополните 💰, чтобы конвертировать их в ⭐. | REUSED | MAP_0096 |
| MAP_0069 | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | Лимит 💰 на этой неделе достигнут. Используйте ресурс до следующего сброса. | REUSED | MAP_0097 |
| MAP_0070 | Вызов принят, экипаж в пути. | Вызов принят. Экипаж в пути. | REUSED | MAP_0100 |
| MAP_0071 | Факт принят, идем дальше. | Факт принят. Идём дальше. | REUSED | MAP_0103 |
| MAP_0072 | Занят расследованием, связь позже. | Занят расследованием. Связь будет позже. | REUSED | MAP_0104 |
| MAP_0073 | Сдача принята — спокойнее. | Сообщение принято. Ситуация спокойнее. | COLLAPSED_DUPLICATE | MAP_0105 |
| MAP_0074 | Занят расследованием, связь позже. | Занят расследованием. Связь будет позже. | COLLAPSED_DUPLICATE | MAP_0104 |
| MAP_0075 | Кажется, про {NAME} говорят. | Кажется, говорят про {NAME}. | REUSED | MAP_0108 |
| MAP_0076 | Про {NAME} говорят. | Говорят про {NAME}. | REUSED | MAP_0116 |
| MAP_0077 | отвечай сейчас | ответ нужен сейчас | REUSED | MAP_0118 |
| MAP_0078 | кошелек ближе | кошелёк важнее | REUSED | MAP_0119 |
| MAP_0079 | плати и уходи | заплати и уходи | REUSED | MAP_0120 |
| MAP_0080 | Принято. Дистанция | Принято. Держим дистанцию. | REUSED | MAP_0121 |
| MAP_0081 | Тише | Тише. | REUSED | MAP_0122 |
| MAP_0082 | ого | Понятно. | REUSED | MAP_0123 |
| MAP_0083 | Тише. Решим. | Тише. Решим спокойно. | REUSED | MAP_0125 |
| MAP_0084 | Суть | Правила | REUSED | MAP_0007 |
| MAP_0085 | Сбросить старт | Сбросить выбор | REUSED | MAP_0016 |
| MAP_0086 | Опасная точка рядом. | Рядом опасная точка. | REUSED | MAP_0099 |
| MAP_0087 | Принято, наблюдаю. | Принято. Наблюдаю. | REUSED | MAP_0102 |
| MAP_0088 | Кошелек ближе. | Кошелёк важнее. | REUSED | MAP_0126 |
| MAP_0089 | Выбери игрока. | Выберите игрока. | COLLAPSED_DUPLICATE | MAP_0131 |
| MAP_0090 | Цель получила +1 ⭐ | Цель получила +1 ⭐. | REUSED | MAP_0138 |
| MAP_0091 | Цепочка A->B->A сегодня не работает. | Цепочка A → B → A сегодня недоступна. | REUSED | MAP_0134 |
| MAP_0092 | Ты отдал 1💰 | Вы потратили 1 💰. | REUSED | MAP_0137 |
| MAP_0093 | Рано. Дай паузу. | Слишком рано. Подождите немного. | REUSED | MAP_0142 |

## Exact canonical mapping table

| id | semanticKey | millennialTerm | boomerTerm | operation | meaning | categories | variables | sourceIds | sourceSurfaces | sourceOccurrenceCount | boomerAuthority | mechanicsInvariant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAP_0001 | SEM_ef1aa753ccba | AsyncScene | AsyncScene | NO_OP | Canonical aggregation of 2 repeated source occurrences across 1 surfaces. | statuses |  | TXT_0001, TXT_0002 | start_screen_title:start_title | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0002 | SEM_a34f6a5036a3 | Оппонент задаёт риск. | Соперник определяет уровень риска. | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | battles, statuses |  | TXT_0003, TXT_0057 | start_screen_intro:startIntroPick; system_events:startIntroPick | 2 | task_intro4_override_2026_07_03 | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0003 | SEM_79b9ce883417 | Ставка списывает ресурс. | Выбранная ставка списывается из запаса монет 💰. | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | battles, statuses |  | TXT_0004, TXT_0058 | start_screen_intro:startIntroStake; system_events:startIntroStake | 2 | task_intro4_override_2026_07_03 | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0004 | SEM_a95db281551d | Итог виден сразу. | Результат показывается сразу. | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | battles, statuses |  | TXT_0005, TXT_0059 | start_screen_intro:startIntroResult; system_events:startIntroResult | 2 | task_intro4_override_2026_07_03 | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0005 | SEM_ce112790e2b0 | Цена и итог сразу. | Стоимость действия и его результат показываются сразу. | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | battles, statuses |  | TXT_0006, TXT_0060 | start_screen_intro:startEconomyHonesty; system_events:startEconomyHonesty | 2 | task_intro4_override_2026_07_03 | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0006 | SEM_254721b2592a | Старт | Начать | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | buttons |  | TXT_0007, TXT_0017 | start_profile_millennial:start_start; start_screen_action:startActionStart | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0007 | SEM_358af1af4628 | Суть | Правила | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0008 | start_screen_action:startActionRules | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0008 | SEM_2f2c8a82383b | Последние 2 цифры года рождения | Последние две цифры года рождения | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0009 | start_profile_millennial:birth_digits_label | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0009 | SEM_a0ebcfd7b7ba | Увеличить первую цифру | Увеличить первую цифру | NO_OP | Single canonical millennial term occurrence. | buttons |  | TXT_0010 | start_profile_millennial:digit_up_first | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0010 | SEM_f5206361f49c | Уменьшить первую цифру | Уменьшить первую цифру | NO_OP | Single canonical millennial term occurrence. | buttons |  | TXT_0011 | start_profile_millennial:digit_down_first | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0011 | SEM_3eedca96eabe | Увеличить вторую цифру | Увеличить вторую цифру | NO_OP | Single canonical millennial term occurrence. | buttons |  | TXT_0012 | start_profile_millennial:digit_up_second | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0012 | SEM_84c692adbfec | Уменьшить вторую цифру | Уменьшить вторую цифру | NO_OP | Single canonical millennial term occurrence. | buttons |  | TXT_0013 | start_profile_millennial:digit_down_second | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0013 | SEM_2d04ae073713 | Только для интерфейса. Не сохраняем. Можно поменять позже. | Это влияет только на интерфейс. Выбор можно изменить позже. | REPLACE | Single canonical millennial term occurrence. | hints |  | TXT_0014 | start_profile_millennial:profile_helper | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0014 | SEM_0b5dcdeb04a6 | я на самом деле чувствую будто я родился в … | Я скорее ощущаю свой год рождения как … | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0015 | start_profile_millennial:fantasy_birth_label | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0015 | SEM_b2420abbe9ec | Продолжить | Продолжить | NO_OP | Single canonical millennial term occurrence. | buttons |  | TXT_0016 | start_profile_millennial:start_continue | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0016 | SEM_789a39a1af82 | Сбросить старт | Сбросить выбор | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0018 | start_profile_millennial:start_reset | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0017 | SEM_0dd07df5583b | Погнали | Продолжить | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0019 | start_profile_zoomer:start_continue | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0018 | SEM_1695f870fe30 | Снести выбор | Сбросить выбор | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0020 | start_profile_zoomer:start_reset | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0019 | SEM_5e73068d3bc3 | Правила без душноты | Краткие правила | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0021 | start_profile_zoomer:rules_action | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0020 | SEM_b919fb98f737 | Войти | Войти | NO_OP | Single canonical millennial term occurrence. | buttons |  | TXT_0022 | start_profile_zoomer:start_action | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0021 | SEM_cf1f813a2292 | Готово. | Готово. | NO_OP | Single canonical millennial term occurrence. | statuses |  | TXT_0023 | system_copy:saved | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0022 | SEM_33c7989136e9 | Сообщение недоступно. | Сообщение недоступно. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0024 | system_copy:missingMessage | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0023 | SEM_2ecbc20d2a77 | Не хватает 💰. | Недостаточно 💰. | REPLACE | Canonical aggregation of 5 repeated source occurrences across 5 surfaces. | errors |  | TXT_0025, TXT_0142, TXT_0149, TXT_0150, TXT_0164 | battle_invite:insufficient_points; events_vote:vote_not_enough_points; events_vote_toast:insufficient_points_vote; respect_flow:respect_no_points; system_copy:insufficientPoints | 5 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0024 | SEM_b243c2a9da1e | Мало 💰 на баттл. | Недостаточно 💰 для баттла. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0026 | system_copy:pointsLowBattle | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0025 | SEM_5d08d30c17a0 | Недоступно. | Действие недоступно. | REPLACE | Canonical aggregation of 6 repeated source occurrences across 6 surfaces. | errors |  | TXT_0027, TXT_0077, TXT_0145, TXT_0161, TXT_0162, TXT_0163 | battle:menu_unavailable; battle_rematch:rematch_not_found; menu_unavailable:menu_unavailable; menu_unavailable:menu_unavailable_again; menu_unavailable:menu_unavailable_notify; system_copy:unavailable | 6 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0026 | SEM_eceee4822f1a | Не найдено. | Ничего не найдено. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0028 | system_copy:notFound | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0027 | SEM_91756abbdd8f | Игрок не указан. | Игрок не выбран. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0029 | system_copy:choosePlayer | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0028 | SEM_af3271ec09d6 | Штраф: -5 💰. | Штраф: -5 💰. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0030 | system_copy:reportFalsePenalty | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0029 | SEM_a77896285262 | Ввод некорректен. | Ввод некорректен. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0031 | system_copy:checkInput | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0030 | SEM_713468cd2d00 | Кулдаун активен. | Нужно подождать перед повторным действием. | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | errors |  | TXT_0032, TXT_0148 | battle_invite:cooldown_short; system_copy:cooldownShort | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0031 | SEM_538368f32bd6 | Проверка займет время. | Проверка займёт некоторое время. | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | DM |  | TXT_0033, TXT_0086 | cop_templates:cop_cooldown[0]; system_copy:copCooldown | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0032 | SEM_dcb653bf124c | +1💰 | +1 💰 | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0034 | system_copy:pointsDeltaPlusOne | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0033 | SEM_635815b5b936 | +1⭐ | +1 ⭐ | REPLACE | Single canonical millennial term occurrence. | economy |  | TXT_0035 | system_copy:repDeltaPlusOne | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0034 | SEM_bac8fdbf1efb | Голос учтён. | Голос учтён. | NO_OP | Single canonical millennial term occurrence. | statuses |  | TXT_0036 | system_copy:voteAccepted | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0035 | SEM_9c7b21f68359 | Проверяю. | Проверка началась. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0037 | system_copy:reportPending | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0036 | SEM_a6207e8cd19d | Сдать {name}: +2💰. | Сообщить о {name}: +2 💰. | REPLACE | Single canonical millennial term occurrence. | DM | name | TXT_0038 | system_copy:reportTrueReward | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0037 | SEM_66aefce29999 | Коп: {name} сдан, +2💰. | Коп принял сообщение о {name}: +2 💰. | REPLACE | Single canonical millennial term occurrence. | DM | name | TXT_0039 | system_copy:reportOk | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0038 | SEM_3a9cd882a390 | Аргумент: {teacher} → {student}. | Аргумент передан: {teacher} → {student}. | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | battles | student, teacher | TXT_0040, TXT_0072 | battle:teach_sent_chat; system_copy:trainingSent | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0039 | SEM_d44745d7fba7 | {name} зовёт на реванш. | {name} предлагает реванш. | REPLACE | Single canonical millennial term occurrence. | battles | name | TXT_0041 | system_copy:rematchRequested | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0040 | SEM_d9212e556fe8 | Свалить за 1💰. | Выйти за 1 💰. | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0042 | system_copy:escapePaid | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0041 | SEM_49235314a204 | +1💰 возврат. | Возврат: +1 💰. | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0043 | system_copy:pointsDeltaRefund | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0042 | SEM_da3f8ec276f3 | +1💰 возврат большинству. | Возврат большинству: +1 💰. | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0044 | system_copy:pointsDeltaRefundMajority | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0043 | SEM_c94d6a033d5a | +1💰 остаток победителю. | Остаток победителю: +1 💰. | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0045 | system_copy:pointsDeltaRemainderWin | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0044 | SEM_c329a868034b | Реванш: -{rematchCost}💰. | Реванш: -{rematchCost} 💰. | REPLACE | Single canonical millennial term occurrence. | battles | rematchCost | TXT_0046 | system_copy:rematchCost | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0045 | SEM_74103858c50b | Свалить: -{escapeCost}💰. | Выйти: -{escapeCost} 💰. | REPLACE | Single canonical millennial term occurrence. | buttons | escapeCost | TXT_0047 | system_copy:escapeVoteCost | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0046 | SEM_6766609a4c47 | {target}: +{amount}💰. | {target}: +{amount} 💰. | REPLACE | Single canonical millennial term occurrence. | economy | amount, target | TXT_0048 | system_copy:p2pTransferSent | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0047 | SEM_0e1da6b8e78d | {target}: +{amount}💰 тебе. | Вы получили от {target}: +{amount} 💰. | REPLACE | Single canonical millennial term occurrence. | economy | amount, target | TXT_0049 | system_copy:p2pTransferReceived | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0048 | SEM_9304c584cde3 | {attackerName} [{attackerInf}] бросил вызов. | {attackerName} [{attackerInf}] начал конфликт. | REPLACE | Single canonical millennial term occurrence. | battles | attackerInf, attackerName | TXT_0050 | system_events:battleChallenge | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0049 | SEM_996d104b72a8 | Баттл с {oppName}: {text}. | Баттл с {oppName}: {text}. | NO_OP | Single canonical millennial term occurrence. | battles | oppName, text | TXT_0051 | system_events:battleResult | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0050 | SEM_3ddaafc6a509 | {a} и {b}: ничья. | {a} и {b}: ничья. | NO_OP | Single canonical millennial term occurrence. | battles | a, b | TXT_0052 | system_events:battleDraw | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0051 | SEM_72a0123a6908 | Толпа: {name} {aVotes}:{bVotes}. | Голосование толпы: {name} {aVotes}:{bVotes}. | REPLACE | Single canonical millennial term occurrence. | battles | aVotes, bVotes, name | TXT_0053 | system_events:crowdResolved | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0052 | SEM_f2cccdbf8673 | Оранжевые аргументы открыты. | Оранжевые аргументы открыты. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0054 | system_events:unlockOrange | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0053 | SEM_34da009038a2 | Красные аргументы открыты. | Красные аргументы открыты. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0055 | system_events:unlockRed | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0054 | SEM_3ed917fad010 | Чёрные аргументы открыты. | Чёрные аргументы открыты. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0056 | system_events:unlockBlack | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0055 | SEM_795f68330cc9 | Меню | Меню | NO_OP | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | buttons |  | TXT_0061, TXT_0075 | battle:menu_title; menu:menu_title | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0056 | SEM_aa43568ac006 | К старту | К стартовому экрану | REPLACE | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | buttons |  | TXT_0062, TXT_0076 | battle:return_to_start; menu:return_to_start | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0057 | SEM_d88e490c162a | Цель | Цель | NO_OP | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | statuses |  | TXT_0063, TXT_0078 | battle:goal_label; menu:goal_label | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0058 | SEM_d04af9fa3a85 | Победа | Победа | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0064 | battle_results:battle_win | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0059 | SEM_c4b9a60790ab | Поражение | Поражение | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0065 | battle_results:battle_loss | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0060 | SEM_94da4d88d246 | Толпа решает | Решает голосование | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0066 | battle_results:battle_draw | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0061 | SEM_2c38b8358c92 | Вы победили в конфликте. | Вы победили в конфликте. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0067 | conflict_results:conflict_win | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0062 | SEM_45a26b50159a | Вы проиграли конфликт. | Вы проиграли конфликт. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0068 | conflict_results:conflict_loss | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0063 | SEM_347f3013b894 | Конфликт завершился ничьей. | Конфликт завершился ничьей. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0069 | conflict_results:conflict_draw | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0064 | SEM_387b075259cc | Свалить: {X} | Выйти: {X} | REPLACE | Single canonical millennial term occurrence. | buttons | X | TXT_0070 | battle:escape_button_label | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0065 | SEM_7a4e03a0faa3 | Для {student}: {arg}. Цена {cost} 💰. | Для {student}: {arg}. Цена: {cost} 💰. | REPLACE | Single canonical millennial term occurrence. | battles | arg, cost, student | TXT_0071 | battle:teach_sent_dm | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0066 | SEM_936c4d3d3617 | Введи точный ник. | Введите точное имя игрока. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0073 | battle:invite_open_hint | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0067 | SEM_c6cdca5a49bf | Игрок не найден. | Игрок не найден. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0074 | battle:invite_invalid | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0068 | SEM_93cc1f7e8515 | Понял. Проверяю. | Принято. Проверяю. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0079 | cop_templates:cop_report_accept[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0069 | SEM_2113efb0ba18 | Принял. Разберусь. | Принято. Разберусь. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0080 | cop_templates:cop_report_accept[1] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0070 | SEM_ba2693f4b0e6 | Занят, связь позже. | Сейчас занят. Связь будет позже. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0081 | cop_templates:cop_busy[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0071 | SEM_24b059ea562e | Не могу, оформляю дело. | Сейчас не могу ответить. Оформляю дело. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0082 | cop_templates:cop_busy[1] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0072 | SEM_0edb441ce016 | Проверка сошлась. Вмешался. | Проверка подтвердилась. Я вмешался. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0083 | cop_templates:cop_report_ok[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0073 | SEM_4edae162bb5b | Проверка сошлась. Занялся. | Проверка подтвердилась. Я занялся. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0084 | cop_templates:cop_report_ok[1] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0074 | SEM_1b4af020d0a7 | Не подтвердилось. Факты не сошлись. | Не подтвердилось. Факты не совпали. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0085 | cop_templates:cop_report_fail[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0075 | SEM_a219e7b5fd61 | Ответь: кто? | Ответьте: кто? | REPLACE | Single canonical millennial term occurrence. | hints |  | TXT_0087 | type_hint:hint_type_who | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0076 | SEM_087daae31a08 | Ответь: где? | Ответьте: где? | REPLACE | Single canonical millennial term occurrence. | hints |  | TXT_0088 | type_hint:hint_type_where | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0077 | SEM_eda0aefba0e4 | Ответь: о ком? | Ответьте: о ком? | REPLACE | Single canonical millennial term occurrence. | hints |  | TXT_0089 | type_hint:hint_type_about | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0078 | SEM_cc9540cefc50 | Ответь: да или нет? | Ответьте: да или нет? | REPLACE | Single canonical millennial term occurrence. | hints |  | TXT_0090 | type_hint:hint_type_yn | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0079 | SEM_f119b9de3835 | ТОЛПА | ГОЛОСОВАНИЕ | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0091 | alpha_tie:tie_start | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0080 | SEM_1bb480986f61 | ВПИСЫВАЙСЯ | ПРИСОЕДИНИТЬСЯ | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0092 | alpha_tie:tie_call_to_action | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0081 | SEM_7779ce2ccf6b | ТЫКНИ ИМЯ | ВЫБЕРИТЕ ИМЯ | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0093 | alpha_tie:tie_click_name_hint | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0082 | SEM_8e2d832c072a | ✓ ОК | ✓ ПРИНЯТО | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0094 | alpha_tie:vote_ok | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0083 | SEM_790d8504297e | ✓ УЖЕ | ✓ УЖЕ УЧТЕНО | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0095 | alpha_tie:vote_already | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0084 | SEM_023241db9ed0 | ✕ НЕ | ✕ НЕДОСТУПНО | REPLACE | Single canonical millennial term occurrence. | buttons |  | TXT_0096 | alpha_tie:vote_fail | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0085 | SEM_c0b91db6dcfb | WIN | ПОБЕДА | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0097 | alpha_battle:battle_win | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0086 | SEM_5c9808bf08c9 | RIP | ПОРАЖЕНИЕ | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0098 | alpha_battle:battle_loss | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0087 | SEM_f77659035d1f | DRAW | НИЧЬЯ | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0099 | alpha_battle:battle_draw | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0088 | SEM_ebe9e11f37fb | Ты вывез. | Вы справились. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0100 | alpha_battle:conflict_win | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0089 | SEM_4573501e7304 | Не вывез. | Вы не справились. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0101 | alpha_battle:conflict_loss | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0090 | SEM_b4396e3dc304 | Ничья. Все шумели зря. | Ничья. Конфликт не дал результата. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0102 | alpha_battle:conflict_draw | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0091 | SEM_360d12257bee | Ты в мейне. | Вы поддержали большинство. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0103 | alpha_battle:supported_majority | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0092 | SEM_6c5ef89f1cbe | Ты в андере. | Вы поддержали меньшинство. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0104 | alpha_battle:supported_minority | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0093 | SEM_69ad231fa0c8 | Мейн забрал. | Большинство победило. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0105 | alpha_battle:majority_won | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0094 | SEM_e63d148f1c14 | Андер просел. | Меньшинство проиграло. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0106 | alpha_battle:minority_lost | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0095 | SEM_21de7b462308 | Драма закрыта. | Конфликт завершён. | REPLACE | Single canonical millennial term occurrence. | battles |  | TXT_0107 | alpha_battle:conflict_finished | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0096 | SEM_b9f57b08a459 | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | Лимит ⭐ на этой неделе исчерпан. Пополните 💰, чтобы конвертировать их в ⭐. | REPLACE | Single canonical millennial term occurrence. | economy |  | TXT_0108 | cap_messages:rep | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0097 | SEM_69ca83974d15 | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | Лимит 💰 на этой неделе достигнут. Используйте ресурс до следующего сброса. | REPLACE | Single canonical millennial term occurrence. | economy |  | TXT_0109 | cap_messages:points | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0098 | SEM_a5c4e1f95c1c | {cop.fullName} на связи. | {cop.fullName} на связи. | NO_OP | Single canonical millennial term occurrence. | DM | cop.fullName | TXT_0110 | cop_templates:intros[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0099 | SEM_b45b91326a8e | Опасная точка рядом. | Рядом опасная точка. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0111 | cop_templates:warnings[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0100 | SEM_e65d8f90eec2 | Вызов принят, экипаж в пути. | Вызов принят. Экипаж в пути. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0112 | cop_templates:warnings[1] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0101 | SEM_06c2421103e3 | Ситуация под контролем. | Ситуация под контролем. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0113 | cop_templates:warnings[2] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0102 | SEM_786dc05b62a1 | Принято, наблюдаю. | Принято. Наблюдаю. | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0114 | cop_templates:chatReplies[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0103 | SEM_941484402339 | Факт принят, идем дальше. | Факт принят. Идём дальше. | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0115 | cop_templates:chatReplies[1] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0104 | SEM_3e0ec4f8a3d9 | Занят расследованием, связь позже. | Занят расследованием. Связь будет позже. | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0116 | cop_templates:cooldownReplies[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0105 | SEM_a4f20d203c1e | Сдача принята — спокойнее. | Сообщение принято. Ситуация спокойнее. | REPLACE | Single canonical millennial term occurrence. | statuses |  | TXT_0117 | cop_templates:thanks[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0106 | SEM_73a4c2e5ac01 | «Сдать» без фактов — шум. | Сообщение без фактов создаёт лишний шум. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0118 | cop_templates:scolds[0] | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0107 | SEM_228c63b5a4cd | Кто сегодня на слуху, если не ошибаюсь? | Кто сегодня на слуху, если не ошибаюсь? | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0119 | arg_base_y_about:q0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0108 | SEM_fcfa6706ccc6 | Кажется, про {NAME} говорят. | Кажется, говорят про {NAME}. | REPLACE | Single canonical millennial term occurrence. | battles | NAME | TXT_0120 | arg_base_y_about:a0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0109 | SEM_2162b8ca43b0 | Кто, как вам кажется, был рядом? | Кто, как вам кажется, был рядом? | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0121 | arg_base_y_who:q0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0110 | SEM_28f743d910d8 | {NAME}. | {NAME}. | NO_OP | Single canonical millennial term occurrence. | battles | NAME | TXT_0122 | arg_base_y_who:a0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0111 | SEM_041d926b0827 | Где мы сейчас, как вам кажется? | Где мы сейчас, как вам кажется? | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0123 | arg_base_y_where:q0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0112 | SEM_21789ccb4149 | Здесь. | Здесь. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0124 | arg_base_y_where:a0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0113 | SEM_25ebdeece9e6 | Вы уверены? | Вы уверены? | NO_OP | Canonical aggregation of 2 repeated source occurrences across 2 surfaces. | battles |  | TXT_0125, TXT_0129 | arg_base_o_yn:q0; arg_base_y_yn:q0 | 2 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0114 | SEM_49eba84bc78a | Да. | Да. | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0126 | arg_base_y_yn:a0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0115 | SEM_db1747404ab0 | Кто сегодня на слуху? | Кто сегодня на слуху? | NO_OP | Single canonical millennial term occurrence. | battles |  | TXT_0127 | arg_base_o_about:q0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0116 | SEM_b5d96d936de2 | Про {NAME} говорят. | Говорят про {NAME}. | REPLACE | Single canonical millennial term occurrence. | battles | NAME | TXT_0128 | arg_base_o_about:a0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0117 | SEM_a9c4b7a9295c | слабый ход | слабый ход | NO_OP | Single canonical millennial term occurrence. | DM |  | TXT_0130 | npc_say_toxic_m:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0118 | SEM_8dd30d2ab8c6 | отвечай сейчас | ответ нужен сейчас | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0131 | npc_say_toxic_m:1 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0119 | SEM_284efa0a719f | кошелек ближе | кошелёк важнее | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0132 | npc_say_bandit_m:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0120 | SEM_27d59ac8e6c4 | плати и уходи | заплати и уходи | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0133 | npc_say_bandit_m:1 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0121 | SEM_f05db43bf0df | Принято. Дистанция | Принято. Держим дистанцию. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0134 | npc_say_cop_m:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0122 | SEM_34aae99a379a | Тише | Тише. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0135 | npc_say_mafia_m:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0123 | SEM_70a77e2047fb | ого | Понятно. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0136 | npc_say_crowd_m:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0124 | SEM_aac45a7d380a | Принято. Я рядом. | Принято. Я рядом. | NO_OP | Single canonical millennial term occurrence. | DM |  | TXT_0137 | npc_dm_profile_cop:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0125 | SEM_5e9c82e02ea3 | Тише. Решим. | Тише. Решим спокойно. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0138 | npc_dm_profile_mafia:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0126 | SEM_708defa49ccc | Кошелек ближе. | Кошелёк важнее. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0139 | npc_dm_profile_bandit:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0127 | SEM_825fa63862ca | Слабый ход. | Аргумент слабый. | REPLACE | Single canonical millennial term occurrence. | DM |  | TXT_0140 | npc_dm_profile_toxic:0 | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0128 | SEM_73b53c2d2997 | Ты уже проголосовал. | Вы уже проголосовали. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0141 | events_vote_toast:showVoteBtnToast | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0129 | SEM_f888fb73f475 | Реванш уже запрошен. | Реванш уже запрошен. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0143 | battle_rematch:rematch_already_requested | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0130 | SEM_ee847f143268 | Недоступно. Баттл не завершён. | Недоступно. Баттл ещё не завершён. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0144 | battle_rematch:rematch_not_eligible | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0131 | SEM_8c2fdedc0002 | Выбери игрока. | Выберите игрока. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0146 | battle_invite:choose_player | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0132 | SEM_ac3c876bd00a | Такого нет. | Такой игрок не найден. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0147 | battle_invite:target_missing | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0133 | SEM_f0e1c3c3fb23 | Уже было уважение сегодня этому персонажу. | Сегодня этому персонажу уже было отправлено уважение. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0151 | respect_flow:respect_pair_daily | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0134 | SEM_beafa24f1dfb | Цепочка A->B->A сегодня не работает. | Цепочка A → B → A сегодня недоступна. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0152 | respect_flow:respect_no_chain | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0135 | SEM_ca69bc27e493 | Лимит уважения на сегодня исчерпан. | Лимит уважения на сегодня исчерпан. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0153 | respect_flow:respect_emitter_empty | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0136 | SEM_d373f5776176 | Сейчас не получилось. Попробуй позже. | Сейчас не получилось. Попробуйте позже. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0154 | respect_flow:respect_fallback | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0137 | SEM_cd4fb653348d | Ты отдал 1💰 | Вы потратили 1 💰. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0155 | respect_flow:respect_paid | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0138 | SEM_770c5cb3c343 | Цель получила +1 ⭐ | Цель получила +1 ⭐. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0156 | respect_flow:respect_target_rep | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0139 | SEM_746250777567 | Dev Mode disabled. | Dev Mode disabled. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0157 | menu_dev_mode:dev_mode_disabled | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0140 | SEM_6921815de4c0 | Dev Mode unlocked on this device. | Dev Mode unlocked on this device. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0158 | menu_dev_mode:dev_mode_unlocked | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0141 | SEM_d8dbaf0ba14c | Incorrect Dev Mode PIN. | Incorrect Dev Mode PIN. | NO_OP | Single canonical millennial term occurrence. | errors |  | TXT_0159 | menu_dev_mode:dev_mode_pin_incorrect | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |
| MAP_0142 | SEM_8fc359be44fb | Рано. Дай паузу. | Слишком рано. Подождите немного. | REPLACE | Single canonical millennial term occurrence. | errors |  | TXT_0160 | menu_lottery:menu_lottery_rano | 1 | docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md | No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes. |

## Deferred work

- Runtime replacement is deferred.
- Runtime validation is not part of this step.
- Gameplay, state, persistence, economy, handlers, routing, resolvers, and NPC behavior are unchanged.
