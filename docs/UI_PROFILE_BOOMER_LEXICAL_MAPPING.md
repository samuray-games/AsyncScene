# UI_PROFILE_BOOMER_LEXICAL_MAPPING

- UI/profile/copy artifact only.
- Additive to `UI_PROFILE_BOOMER_ALLOWED_LEXICON.md` and `UI_PROFILE_BOOMER_TABOO_LIST.md`; it does not replace or rewrite either artifact.
- Machine-readable by dev smoke.
- Entry count: 93.
- Table columns: `id`, `from`, `to`, `type`, `semanticInvariant`, `mechanicsInvariant`.

| id | from | to | type | semanticInvariant | mechanicsInvariant |
| --- | --- | --- | --- | --- | --- |
| MAP_0001 | Оппонент задаёт риск. | Оппонент задаёт риск действия. | clarify_context | opponent defines risk; only action context is clarified | no mechanic, cost, state, target, or outcome changes |
| MAP_0002 | Итог виден сразу. | Итог виден сразу после действия. | clarify_timing | result remains immediately visible; timing is clarified | no mechanic, cost, state, target, or outcome changes |
| MAP_0003 | Цена и итог сразу. | Цена и итог показаны заранее. | neutralize_compression | price and outcome remain visible before action | no mechanic, cost, state, target, or outcome changes |
| MAP_0004 | Старт | Начать | neutral_ui_label | start action remains start action | no mechanic, cost, state, target, or outcome changes |
| MAP_0005 | Последние 2 цифры года рождения | Последние две цифры года рождения | remove_abbreviation | same two birth-year digits | no mechanic, cost, state, target, or outcome changes |
| MAP_0006 | Только для интерфейса. Не сохраняем. Можно поменять позже. | Это влияет только на интерфейс. Выбор можно изменить позже. | calm_explanation | selection affects interface only and can be changed later | no save, profile, persistence, or resolver behavior changes |
| MAP_0007 | я на самом деле чувствую будто я родился в … | Я скорее ощущаю свой год рождения как … | neutralize_colloquial | fantasy self-perceived birth year meaning is preserved | no birth-year resolver or profile logic changes |
| MAP_0008 | Погнали | Продолжить | remove_slang | continue action remains continue action | no mechanic, cost, state, target, or outcome changes |
| MAP_0009 | Снести выбор | Сбросить выбор | remove_sharp_colloquial | reset selection remains reset selection | no mechanic, cost, state, target, or outcome changes |
| MAP_0010 | Правила без душноты | Краткие правила | remove_slang | rules section remains rules section | no mechanic, cost, state, target, or outcome changes |
| MAP_0011 | Не хватает 💰. | Недостаточно 💰. | neutralize_short_error | insufficient money meaning is preserved | no money amount, cost, or economy rule changes |
| MAP_0012 | Мало 💰 на баттл. | Недостаточно 💰 для баттла. | neutralize_short_error | insufficient money for battle meaning is preserved | no battle cost or economy rule changes |
| MAP_0013 | Недоступно. | Действие недоступно. | clarify_error | unavailable action meaning is preserved | no availability rule changes |
| MAP_0014 | Не найдено. | Ничего не найдено. | neutralize_error | not found meaning is preserved | no search or lookup behavior changes |
| MAP_0015 | Игрок не указан. | Игрок не выбран. | clarify_error | missing player target meaning is preserved | no target selection rule changes |
| MAP_0016 | Кулдаун активен. | Нужно подождать перед повторным действием. | remove_jargon | cooldown active meaning is preserved | no cooldown duration or rule changes |
| MAP_0017 | Проверка займет время. | Проверка займёт некоторое время. | calm_explanation | check takes time meaning is preserved | no timing, async, or verification rule changes |
| MAP_0018 | +1💰 | +1 💰 | format_readability | same money delta | no economy amount changes |
| MAP_0019 | +1⭐ | +1 ⭐ | format_readability | same reputation delta | no reputation amount changes |
| MAP_0020 | Проверяю. | Проверка началась. | calm_system_status | check started meaning is preserved | no verification rule changes |
| MAP_0021 | Сдать {name}: +2💰. | Сообщить о {name}: +2 💰. | neutralize_colloquial | reporting {name} gives +2 money | same variable {name}; same reward +2 💰 |
| MAP_0022 | Коп: {name} сдан, +2💰. | Коп принял сообщение о {name}: +2 💰. | neutralize_colloquial | cop accepted report about {name}; reward remains +2 money | same variable {name}; same reward +2 💰 |
| MAP_0023 | Аргумент: {teacher} → {student}. | Аргумент передан: {teacher} → {student}. | clarify_action | argument transfer from {teacher} to {student} is preserved | same variables {teacher} and {student}; no argument rule changes |
| MAP_0024 | {name} зовёт на реванш. | {name} предлагает реванш. | neutralize_colloquial | {name} initiates rematch offer | same variable {name}; no rematch rule changes |
| MAP_0025 | Свалить за 1💰. | Выйти за 1 💰. | remove_slang | leave action costs 1 money | same cost 1 💰; no escape rule changes |
| MAP_0026 | +1💰 возврат. | Возврат: +1 💰. | format_readability | refund remains +1 money | same amount +1 💰 |
| MAP_0027 | +1💰 возврат большинству. | Возврат большинству: +1 💰. | format_readability | majority refund remains +1 money | same amount +1 💰; no majority rule changes |
| MAP_0028 | +1💰 остаток победителю. | Остаток победителю: +1 💰. | format_readability | winner remainder remains +1 money | same amount +1 💰; no winner payout rule changes |
| MAP_0029 | Реванш: -{rematchCost}💰. | Реванш: -{rematchCost} 💰. | format_readability | rematch cost remains negative {rematchCost} money | same variable {rematchCost}; no cost rule changes |
| MAP_0030 | Свалить: -{escapeCost}💰. | Выйти: -{escapeCost} 💰. | remove_slang | leave cost remains negative {escapeCost} money | same variable {escapeCost}; no escape rule changes |
| MAP_0031 | {target}: +{amount}💰. | {target}: +{amount} 💰. | format_readability | {target} receives +{amount} money | same variables {target}, {amount}; no economy rule changes |
| MAP_0032 | {target}: +{amount}💰 тебе. | Вы получили от {target}: +{amount} 💰. | neutralize_direct_address | player receives +{amount} money from {target} | same variables {target}, {amount}; no economy rule changes |
| MAP_0033 | {attackerName} [{attackerInf}] бросил вызов. | {attackerName} [{attackerInf}] начал конфликт. | neutralize_colloquial | {attackerName} starts conflict | same variables {attackerName}, {attackerInf}; no conflict rule changes |
| MAP_0034 | Толпа: {name} {aVotes}:{bVotes}. | Голосование толпы: {name} {aVotes}:{bVotes}. | clarify_context | crowd vote count for {name} is preserved | same variables {name}, {aVotes}, {bVotes}; no voting rule changes |
| MAP_0035 | К старту | К стартовому экрану | clarify_ui_label | return to start screen action is preserved | no navigation rule changes |
| MAP_0036 | Толпа решает | Решает голосование | neutralize_colloquial | vote decides outcome | no voting or outcome rule changes |
| MAP_0037 | Свалить: {X} | Выйти: {X} | remove_slang | leave action with value {X} is preserved | same variable {X}; no escape rule changes |
| MAP_0038 | Для {student}: {arg}. Цена {cost} 💰. | Для {student}: {arg}. Цена: {cost} 💰. | format_readability | argument price for {student} is preserved | same variables {student}, {arg}, {cost}; no argument price changes |
| MAP_0039 | Введи точный ник. | Введите точное имя игрока. | remove_slang_and_formality_adjust | exact player name is required | no player lookup rule changes |
| MAP_0040 | Понял. Проверяю. | Принято. Проверяю. | neutralize_npc_reply | acknowledgement and check are preserved | no cop or verification rule changes |
| MAP_0041 | Принял. Разберусь. | Принято. Разберусь. | neutralize_npc_reply | acknowledgement and follow-up are preserved | no cop or report rule changes |
| MAP_0042 | Занят, связь позже. | Сейчас занят. Связь будет позже. | calm_explanation | temporary unavailability is preserved | no NPC timing or DM rule changes |
| MAP_0043 | Не могу, оформляю дело. | Сейчас не могу ответить. Оформляю дело. | calm_explanation | NPC cannot answer because case is being filed | no NPC timing or DM rule changes |
| MAP_0044 | Проверка сошлась. Вмешался. | Проверка подтвердилась. Я вмешался. | clarify_npc_status | check confirmed and NPC intervened | no verification or intervention rule changes |
| MAP_0045 | Проверка сошлась. Занялся. | Проверка подтвердилась. Я занялся. | clarify_npc_status | check confirmed and NPC acted | no verification or intervention rule changes |
| MAP_0046 | Не подтвердилось. Факты не сошлись. | Не подтвердилось. Факты не совпали. | neutralize_phrase | report did not confirm because facts did not match | no verification rule changes |
| MAP_0047 | Ответь: кто? | Ответьте: кто? | formality_adjust | question type who is preserved | no argument or answer rule changes |
| MAP_0048 | Ответь: где? | Ответьте: где? | formality_adjust | question type where is preserved | no argument or answer rule changes |
| MAP_0049 | Ответь: о ком? | Ответьте: о ком? | formality_adjust | question type about whom is preserved | no argument or answer rule changes |
| MAP_0050 | Ответь: да или нет? | Ответьте: да или нет? | formality_adjust | yes/no answer prompt is preserved | no argument or answer rule changes |
| MAP_0051 | ТОЛПА | ГОЛОСОВАНИЕ | clarify_ui_label | crowd voting area remains voting area | no voting rule changes |
| MAP_0052 | ВПИСЫВАЙСЯ | ПРИСОЕДИНИТЬСЯ | remove_slang | join action is preserved | no participation rule changes |
| MAP_0053 | ТЫКНИ ИМЯ | ВЫБЕРИТЕ ИМЯ | remove_slang | select name action is preserved | no selection rule changes |
| MAP_0054 | ✓ ОК | ✓ ПРИНЯТО | remove_abbreviation | accepted status is preserved | no state rule changes |
| MAP_0055 | ✓ УЖЕ | ✓ УЖЕ УЧТЕНО | clarify_status | already counted status is preserved | no state rule changes |
| MAP_0056 | ✕ НЕ | ✕ НЕДОСТУПНО | clarify_status | unavailable status is preserved | no state rule changes |
| MAP_0057 | WIN | ПОБЕДА | remove_meme_english | win result is preserved | no outcome rule changes |
| MAP_0058 | RIP | ПОРАЖЕНИЕ | remove_meme_language | loss result is preserved | no outcome rule changes |
| MAP_0059 | DRAW | НИЧЬЯ | remove_meme_english | draw result is preserved | no outcome rule changes |
| MAP_0060 | Ты вывез. | Вы справились. | remove_slang | successful result is preserved | no outcome rule changes |
| MAP_0061 | Не вывез. | Вы не справились. | remove_slang | failed result is preserved | no outcome rule changes |
| MAP_0062 | Ничья. Все шумели зря. | Ничья. Конфликт не дал результата. | neutralize_sharp_colloquial | draw with no decisive result is preserved | no outcome rule changes |
| MAP_0063 | Ты в мейне. | Вы поддержали большинство. | remove_slang | player supported majority | no voting or reward rule changes |
| MAP_0064 | Ты в андере. | Вы поддержали меньшинство. | remove_slang | player supported minority | no voting or penalty rule changes |
| MAP_0065 | Мейн забрал. | Большинство победило. | remove_slang | majority won | no voting or outcome rule changes |
| MAP_0066 | Андер просел. | Меньшинство проиграло. | remove_slang | minority lost | no voting or outcome rule changes |
| MAP_0067 | Драма закрыта. | Конфликт завершён. | remove_meme_language | conflict ended | no conflict state changes |
| MAP_0068 | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | Лимит ⭐ на этой неделе исчерпан. Пополните 💰, чтобы конвертировать их в ⭐. | clarify_economy_limit | weekly star limit is exhausted and money can convert to stars | no limit, conversion, or economy rule changes |
| MAP_0069 | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | Лимит 💰 на этой неделе достигнут. Используйте ресурс до следующего сброса. | remove_abbreviation_and_jargon | weekly money/points cap reached and resource can be used before reset | no cap, reset, or economy rule changes |
| MAP_0070 | Вызов принят, экипаж в пути. | Вызов принят. Экипаж в пути. | punctuation_clarity | call accepted and crew is on the way | no cop or event rule changes |
| MAP_0071 | Факт принят, идем дальше. | Факт принят. Идём дальше. | punctuation_and_spelling | fact accepted and flow continues | no flow or state rule changes |
| MAP_0072 | Занят расследованием, связь позже. | Занят расследованием. Связь будет позже. | calm_explanation | NPC is busy with investigation and will respond later | no NPC timing or DM rule changes |
| MAP_0073 | Сдача принята — спокойнее. | Сообщение принято. Ситуация спокойнее. | neutralize_colloquial | report accepted and situation is calmer | no report, reward, or state rule changes |
| MAP_0074 | «Сдать» без фактов — шум. | Сообщение без фактов создаёт лишний шум. | neutralize_colloquial | report without facts creates noise | no report validation rule changes |
| MAP_0075 | Кажется, про {NAME} говорят. | Кажется, говорят про {NAME}. | neutral_word_order | rumor about {NAME} is preserved | same variable {NAME}; no rumor rule changes |
| MAP_0076 | Про {NAME} говорят. | Говорят про {NAME}. | neutral_word_order | rumor about {NAME} is preserved | same variable {NAME}; no rumor rule changes |
| MAP_0077 | отвечай сейчас | ответ нужен сейчас | neutralize_command | answer is needed now | no timing or answer rule changes |
| MAP_0078 | кошелек ближе | кошелёк важнее | neutralize_colloquial | wallet/resource priority meaning is preserved | no economy rule changes |
| MAP_0079 | плати и уходи | заплати и уходи | neutralize_command | pay and leave meaning is preserved | no payment or leave rule changes |
| MAP_0080 | Принято. Дистанция | Принято. Держим дистанцию. | clarify_npc_reply | distance is maintained | no NPC behavior rule changes |
| MAP_0081 | Тише | Тише. | punctuation_clarity | quiet request is preserved | no mechanic changes |
| MAP_0082 | ого | Понятно. | remove_slang | acknowledgement meaning is preserved | no mechanic changes |
| MAP_0083 | Тише. Решим. | Тише. Решим спокойно. | calm_explanation | quiet resolution intent is preserved | no mechanic changes |
| MAP_0084 | Суть | Правила | clarify_ui_label | core label remains rules label | no mechanic, cost, state, target, or outcome changes |
| MAP_0085 | Сбросить старт | Сбросить выбор | clarify_ui_label | reset action remains reset action | no mechanic, cost, state, target, or outcome changes |
| MAP_0086 | Опасная точка рядом. | Рядом опасная точка. | clarify_context | nearby danger remains nearby danger | no mechanic, cost, state, target, or outcome changes |
| MAP_0087 | Принято, наблюдаю. | Принято. Наблюдаю. | punctuation_clarity | acceptance and observation remain preserved | no mechanic, cost, state, target, or outcome changes |
| MAP_0088 | Кошелек ближе. | Кошелёк важнее. | neutralize_colloquial | wallet/resource priority meaning is preserved | no mechanic, cost, state, target, or outcome changes |
| MAP_0089 | Выбери игрока. | Выберите игрока. | formality_adjust | player selection remains player selection | no mechanic, cost, state, target, or outcome changes |
| MAP_0090 | Цель получила +1 ⭐ | Цель получила +1 ⭐. | format_readability | target reputation gain remains unchanged | no reputation amount changes |
| MAP_0091 | Цепочка A->B->A сегодня не работает. | Цепочка A → B → A сегодня недоступна. | clarify_context | chain restriction meaning is preserved | no mechanic, cost, state, target, or outcome changes |
| MAP_0092 | Ты отдал 1💰 | Вы потратили 1 💰. | neutralize_colloquial | spent 1 money meaning is preserved | same money delta 1 💰; no economy rule changes |
| MAP_0093 | Рано. Дай паузу. | Слишком рано. Подождите немного. | calm_explanation | early timing remains early timing | no mechanic, cost, state, target, or outcome changes |
