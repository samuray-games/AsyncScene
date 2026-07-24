# STAGE 6 STEP 9 - RU SEMANTIC MATRIX BATCH 3 / SYSTEM EVENTS

STATUS: DRAFT_FOR_USER_APPROVAL

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

> This batch targets shared system/event feed copy that currently weakens hidden-label separation. Placeholders and mechanic facts are invariant. Candidate wording is not implementation authority until frozen.

## Invariant rule

Do not change:

- `{name}`;
- `{target}`;
- `{guest}`;
- `{location}`;
- `{attackerName}`;
- `{attackerInf}`;
- `{a}` / `{b}`;
- `{winner}` / `{loser}`;
- `{oppName}` / `{text}`;
- `{meName}`;
- `{cost}`;
- `{aVotes}` / `{bVotes}`;
- outcome meaning;
- economy meaning;
- unlock thresholds.

Only presentation may change.

## A. Presence, movement and DM events

| TEXT_ID | INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| event.ready | Generic ready/completed event | I1_GUIDANCE | Готово. | Есть. | Готово. | Готово ✓ | done ✓ |
| event.joined | `{name}` arrived on the square | I2_EXPRESSIVE | {name} появился на площади. | {name} пришёл на площадь. | {name} появился на площади. Новый участник треда. | {name} залетел на площадь. | {name} joined. |
| event.moved | Player moved to `{location}` | I2_EXPRESSIVE | Вы перешли в локацию: {location}. | Перешёл: {location}. | Переход: {location}. Новая вкладка мира открыта. | Мув → {location}. | move > {location} |
| event.dm_reaction | DM reaction between `{name}` and `{target}` | I2_EXPRESSIVE | {name} отреагировал на сообщение {target}. | {name} ↔ {target}: реакция. | {name} отреагировал на {target} в личке. Социальная жизнь существует. | {name} ↔ {target}: реакция. | {name} > {target} react |
| event.dm_invite | `{name}` added `{guest}` to interaction with `{target}` | I2_EXPRESSIVE | {name} пригласил {guest} к разговору с {target}. | {name} подтянул {guest} к {target}. | {name} добавил {guest} к {target}. Групповой чат расширяется сам. | {name} + {guest} → {target}. | {name} +{guest} > {target} |

## B. Battle challenge and lifecycle

| TEXT_ID | INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| event.battle_challenge | `{attackerName}` with influence `{attackerInf}` challenged someone | I2_EXPRESSIVE | {attackerName} [⚡{attackerInf}] бросил вызов. | {attackerName} [⚡{attackerInf}] полез в разборку. | {attackerName} [⚡{attackerInf}] бросил вызов. Ну всё, начался тред. | {attackerName} [⚡{attackerInf}] залетел в баттл. | {attackerName} ⚡{attackerInf} > 1v1 |
| event.npc_battle_start | NPC `{a}` challenged NPC `{b}` | I2_EXPRESSIVE | {a} бросил вызов {b}. | {a} наехал на {b}. | {a} вызывает {b}. NPC тоже решили выяснить отношения. | {a} vs {b}. го. | {a} > {b} 1v1 |
| event.battle_win | `{winner}` won and `{loser}` lost | I2_EXPRESSIVE | {winner} победил. {loser} проиграл. | {winner} забрал раунд. {loser} - в минусе. | {winner} победил. {loser} проиграл. Скриншот результата мысленно сохранён. | {winner} W · {loser} L. | W {winner} / L {loser} |
| event.battle_draw | `{a}` and `{b}` drew | I2_EXPRESSIVE | {a} и {b}: ничья. | {a} и {b} разошлись по нулям. | {a} и {b}: ничья. Все устали одинаково. | {a} = {b}. gg. | {a} = {b} |
| event.battle_result | Opponent `{oppName}` result text `{text}` | I1_GUIDANCE | {oppName}: {text} | {oppName}: {text} | {oppName}: {text} | {oppName} → {text} | {oppName} > {text} |

## C. Robbery, shame and penalties

| TEXT_ID | INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| event.toxic_steal_line | Toxic NPC took `{cost}` money | I2_EXPRESSIVE | Токсик забрал {cost} 💰. | Токсик снял {cost} 💰. Облом. | Токсик забрал {cost} 💰. Деньги тоже решили выйти из чата. | Токсик унёс {cost} 💰 💀 | toxic −{cost}💰 |
| event.toxic_robbed | Toxic NPC robbed player | I2_EXPRESSIVE | Токсик забрал ваши 💰. | Токсик обчистил карман. | Токсик забрал 💰. Отличный сервис, пять звёзд не поставим. | Токсик залутал твои 💰 💀 | toxic stole 💰 L |
| event.bandit_robbed | Bandit robbed player | I2_EXPRESSIVE | Бандит забрал ваши 💰. | Бандит обчистил. | Бандит забрал 💰. Финансовый план скорректирован насильно. | Бандит вынес банк 💀 | bandit took 💰 |
| event.mafia_shame | `{meName}` challenged mafia and influence reset | I2_EXPRESSIVE | {meName} бросил вызов мафиози. Влияние ⚡ обнулено. | {meName} полез на мафию. ⚡ теперь ноль. | {meName} вызвал мафиози. ⚡ обнулено. Решение было смелым, последствия тоже. | {meName} полез на мафию. ⚡ = 0 💀 | {meName} vs mafia / ⚡0 L |

## D. Crowd/vote feed

| TEXT_ID | INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| event.crowd_start | Crowd vote started | I2_EXPRESSIVE | Началось голосование толпы. | Народ решает. | Толпа решает. Демократия вошла в чат. | Чат решает. Голосуем. | chat vote |
| event.crowd_resolved | Crowd resolved vote for `{name}` with `{aVotes}:{bVotes}` | I2_EXPRESSIVE | Толпа выбрала {name}: {aVotes}:{bVotes}. | Народ решил: {name}, {aVotes}:{bVotes}. | Толпа выбрала {name} - {aVotes}:{bVotes}. Коллективный разум вынес вердикт. | Чат выбрал {name} · {aVotes}:{bVotes}. | W {name} {aVotes}:{bVotes} |

## E. Argument-tier unlocks

These are important progression notices. Exact colour/tier semantics must remain canonical.

| TEXT_ID | INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| unlock.orange | Orange arguments unlocked | I2_EXPRESSIVE | Открыты оранжевые аргументы. | Оранжевый уровень открыт. | Оранжевые аргументы открыты. Новый уровень дискуссии разблокирован. | 🟠 аргументы unlocked. | 🟠 unlocked |
| unlock.red | Red arguments unlocked | I2_EXPRESSIVE | Открыты красные аргументы. | Красный уровень открыт. | Красные аргументы открыты. Эскалация официально одобрена интерфейсом. | 🔴 аргументы unlocked. | 🔴 unlocked |
| unlock.black | Black/absolute arguments unlocked | I2_EXPRESSIVE | Открыты чёрные аргументы. | Чёрный уровень открыт. | Чёрные аргументы открыты. Финальный босс риторики найден. | ⚫ аргументы unlocked. имба. | ⚫ max unlocked |
| unlock.orange_other | `{name}` now has strong/orange arguments | I2_EXPRESSIVE | Аргументы {name} стали сильнее. | {name} открыл оранжевый уровень. | У {name} теперь сильные аргументы. Пошла прокачка. | {name}: 🟠 ап. | {name} 🟠 up |
| unlock.red_other | `{name}` now has powerful/red arguments | I2_EXPRESSIVE | Аргументы {name} стали мощнее. | {name} открыл красный уровень. | У {name} теперь мощные аргументы. Ставки растут. | {name}: 🔴 ап. | {name} 🔴 up |
| unlock.black_other | `{name}` now has absolute/black arguments | I2_EXPRESSIVE | Аргументы {name} достигли высшего уровня. | {name} открыл чёрный уровень. | У {name} теперь абсолютные аргументы. Ну всё, приехали. | {name}: ⚫ max. cooked? | {name} ⚫ MAX |

Review note: `cooked?` in Zoomer `unlock.black_other` may imply doom rather than strength and therefore remains a likely rewrite candidate under slang semantic validation.

## F. Role-specific NPC outcome announcements

The role label should influence flavour without changing outcome.

### Victory announcements

| TEXT_ID | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|
| npc.victory.cop | Коп: победил {winner}. | Коп подвёл итог: {winner} взял верх. | Коп зафиксировал победу {winner}. Протокол доволен. | Коп: {winner} W. | cop: W {winner} |
| npc.victory.mafia | Мафиози: победа за {winner}. | Мафиози решил: {winner} сверху. | Мафиози подвёл итог: {winner} победил. Без лишних свидетелей. | Мафия: {winner} забрал. | mafia: W {winner} |
| npc.victory.bandit | Бандит: {winner} забрал раунд. | Бандит: {winner} урвал раунд. | Бандит: {winner} забрал раунд. Всё по тарифу. | Бандит: {winner} залутал W. | bandit: {winner} W |
| npc.victory.toxic | Токсик: {winner} победил. | Токсик: {winner} продавил. | Токсик: {winner} победил. Комментарии уже пишутся. | Токсик: {winner} разнёс. | toxic: W {winner} |
| npc.victory.crowd | Толпа: победил {winner}. | Народ за {winner}. | Толпа: {winner} победил. Коллективный разум высказался. | Чат: {winner} W. | chat: W {winner} |

### Defeat announcements

| TEXT_ID | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|
| npc.defeat.cop | Коп: {loser} проиграл. | Коп: {loser} не вывез. | Коп зафиксировал поражение {loser}. Протокол беспощаден. | Коп: {loser} L. | cop: L {loser} |
| npc.defeat.mafia | Мафиози: {loser} проиграл. | Мафиози: {loser} не вытянул. | Мафиози: {loser} проиграл. Вопрос закрыт. | Мафия: {loser} cooked. | mafia: L {loser} |
| npc.defeat.bandit | Бандит: {loser} проиграл. | Бандит: {loser} остался ни с чем. | Бандит: {loser} проиграл. День явно не задался. | Бандит: {loser} L 💀 | bandit: L {loser} |
| npc.defeat.toxic | Токсик: {loser} проиграл. | Токсик: {loser} слил. | Токсик: {loser} проиграл. Сейчас ещё напомнят об этом десять раз. | Токсик: {loser} cooked 💀 | toxic: L {loser} |
| npc.defeat.crowd | Толпа: {loser} проиграл. | Народ: {loser} в минусе. | Толпа: {loser} проиграл. Общественное мнение вынесло приговор. | Чат: {loser} L. | chat: L {loser} |

### Arrest/closure announcements

`закрыт` is semantically ambiguous without exact mechanic context. Before freeze, fresh inventory/code inspection must determine whether this means arrested, removed, locked, defeated, or otherwise unavailable.

Do not creatively rewrite until mechanic meaning is verified.

Current status for all `npcArrest*` rows:

`MECHANIC_SEMANTICS_REQUIRES_FRESH_SOURCE_CONFIRMATION`

This is an intentional stop rather than guessing.

## G. P2P backlog reason

Current seed: `P2P: анти-абуз.`

This may be dev/technical or player-facing depending current runtime.

Status:

`SURFACE_CLASSIFICATION_REQUIRES_FRESH_CURRENT_MAIN_CHECK`

Do not generationally rewrite until visibility is proven.

## H. System template wrappers

Templates such as:

- `Не получилось: {what}. {hint}`
- `Недоступно: {what}. {hint}`
- `{what}: нет значения. {hint}`
- `{what}. Пауза активна.`

must not be blindly generationally rewritten as plain static strings because they compose other copy.

Required implementation approach after freeze:

1. classify wrapper semantic role;
2. preserve placeholders exactly;
3. ensure composed output does not duplicate slang/punctuation;
4. test each profile with representative nested values;
5. keep mechanic error meaning intact.

Potential direction only:

| wrapper intent | Boomer | Gen X | Millennial | Zoomer | Alpha |
|---|---|---|---|---|---|
| blocked_with_hint | Не получилось: {what}. {hint} | Не вышло: {what}. {hint} | Не получилось: {what}. {hint} | Не вышло: {what}. {hint} | nope: {what}. {hint} |
| unavailable_with_hint | Недоступно: {what}. {hint} | Пока нельзя: {what}. {hint} | Сейчас недоступно: {what}. {hint} | Пока лок: {what}. {hint} | locked: {what}. {hint} |
| wait_option | {what}. Нужно подождать. | {what}. Погоди. | {what}. Нужно немного подождать. | {what}. КД. | {what}. cd. |

All remain draft.

## Batch 3 acceptance notes

This batch intentionally identifies rows that should **not** be rewritten until current mechanic meaning is verified. Bold generation work does not authorize semantic guessing.

Before freeze:

- confirm all placeholders from fresh current main;
- verify visibility and mechanic meaning;
- validate slang through `STAGE6_STEP9_SLANG_SEMANTIC_VALIDATION.md`;
- mark intentional shared wrappers;
- test composed outputs, not only template fragments.

NEXT_ACTION: expand remaining conflict/economy/NPC DM families and build a consolidated review index across Batch 1-3 plus NPC/start packs.