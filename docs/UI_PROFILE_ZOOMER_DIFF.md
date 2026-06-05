# UI_PROFILE_ZOOMER_DIFF

Это delta-only документ поверх `UI_PROFILE_MILLENNIAL`.

faster / simpler / shorter / fewer explanations / more direct wording

## Millennial -> zoomer comparison table

| category | millennial | zoomer |
| --- | --- | --- |
| phrase length | Millennial: longer | Zoomer: shorter |
| explanations | Millennial: more upfront | Zoomer: less upfront |
| CTA | Millennial: softer | Zoomer: direct |
| errors | Millennial: fuller context | Zoomer: shorter cause-first |
| toasts | Millennial: longer | Zoomer: compact |
| DM | Millennial: more context | Zoomer: direct |
| battles | Millennial: more framing | Zoomer: faster read |
| economy | Millennial: more explanation | Zoomer: immediate signal |
| onboarding/training | Millennial: more guidance | Zoomer: less hand-holding |

Current UI surfaces: start screen, top bar, DM, battles, events, economy, reports, onboarding, settings. New features: rules below.

## New feature application rules

- SystemCopy: use existing millennial meaning + zoomer delta.
- NPC speech: use existing millennial meaning + zoomer delta.
- economy honesty: use existing millennial meaning + zoomer delta.
- report/sanctions: use existing millennial meaning + zoomer delta.
- respect: use existing millennial meaning + zoomer delta.
- locale: use existing millennial meaning + zoomer delta.

## UI_PROFILE_ZOOMER_SHORTEN_RULE

- From `UI_PROFILE_MILLENNIAL` base/source: shorten phrases by about 30-40%, keep original meaning, and do not contradict `UI_PROFILE_ZOOMER_DIFF`.
- Use fewer filler words: remove intro/filler words and skip throat-clearing.
- Use fewer abstractions: reduce abstract nouns and name the concrete action.
- Use more verbs: replace abstract wording with action verbs; do not add teen slang, memes, fake youth voice, or irony.

## UI_PROFILE_ZOOMER_LEXICAL_FRAME

- Rule: conversational but not meme-like. Use short, direct language for the zoomer UI profile.
- Keep the tone conversational, short, and direct, but not zoomer slang.
- Explicitly forbidden categories: memes, parasite slang, irony-for-irony.
- Do not use meme-like wording, parasite slang, or irony for its own sake.
- This lexical frame extends `UI_PROFILE_ZOOMER_SHORTEN_RULE`: it keeps the 30-40% shortening target, fewer filler words, fewer abstractions, and more verbs.
- No contradiction with previous zoomer shortening rules: shortening stays direct and action-focused; it does not add slang, memes, fake youth voice, or irony.

## UI_PROFILE_ZOOMER_ALLOWED_LEXICON

Dictionary/profile inventory only. These examples approve simple vocabulary for future zoomer-profile copy; they do not rewrite current UI text, NPC lines, or gameplay logic.

Runtime smoke marker/key: `UI_PROFILE_ZOOMER_ALLOWED_LEXICON`.
Runtime coverage declaration: ui, toasts, errors, hints, npcSpeech.

Allowed surfaces only: ui, toasts, errors, hints, npcSpeech.

Rules:

- Use simple everyday Russian words, short clauses, direct verbs, and concrete outcomes.
- Prefer action-first forms: `жми`, `выбери`, `проверь`, `подтверди`, `жди`.
- Prefer compact permission/possibility forms: `можно`, `можешь`, `доступно`, `открыто`.
- Prefer short risk/result forms: `риск есть`, `ход сработал`, `не хватило`, `нет связи`, `цена видна`.
- Keep the meaning literal and cause-first; this section approves only listed simple vocabulary.
- This inventory applies only to UI labels, toasts, error messages, hints, and NPC speech.

Allowed vocabulary inventory:

| surface | approved examples | rule |
| --- | --- | --- |
| ui | можно; жми; выбери | short labels and direct action verbs only |
| toasts | ход сработал; готово; принято | compact result/status messages only |
| errors | не хватило; нет связи; уже занято | short cause-first errors only |
| hints | риск есть; проверь цену; жми, когда готов | brief actionable hints only |
| npcSpeech | можно; выбери ход; риск есть | short direct NPC lines only |

All exclusions from `UI_PROFILE_ZOOMER_LEXICAL_FRAME` still apply; this inventory adds no excluded examples.

## UI_PROFILE_ZOOMER_STOP_WORDS

Stop-word / forbidden lexicon inventory only. This runtime-visible profile marker blocks meme-like wording, parasite slang, and irony-for-irony for future zoomer-profile validation; it does not rewrite current UI text, NPC lines, or gameplay logic.

Runtime smoke marker/key: `UI_PROFILE_ZOOMER_STOP_WORDS`.
Runtime forbidden categories: memes, parasite slang, irony-for-irony.

Rules:

- Forbid meme-like wording, reaction memes, and performative jokes used instead of clear UI meaning.
- Forbid parasite slang that adds style noise without changing the user action or system state.
- Forbid irony-for-irony: jokes, sarcasm, and self-aware phrasing used only to sound ironic.
- Keep Step 3.2 allowed lexicon valid: simple direct words like `можно`, `жми`, `выбери`, `риск есть`, `ход сработал`, and `не хватило` remain allowed when used literally.
- This inventory is validation/profile source only; do not rewrite existing UI copy yet.

Forbidden stop-word inventory:

| category | blocked words | rule |
| --- | --- | --- |
| memes | кринж; рофл; лол | no meme-like reaction wording |
| parasite slang | вайб; имба; изи | no slang filler or fake youth voice |
| irony-for-irony | кринж; рофл; лол | no ironic wording used only for tone |

Sample strings that validation must catch: `это кринж`, `лови вайб`, `просто имба`, `чистый рофл`, `изи ход`, `лол готово`.

## UI_PROFILE_ZOOMER_TRANSFORMATION_TABLE

Dedicated transformation table only: millennial-style long construction -> shorter direct zoomer form. Same meaning, 30-40% shorter, fewer filler words, fewer abstractions, more verbs. No slang, no memes, no fake youth voice.

| before | after |
| --- | --- |
| ты рискуешь потерять темп, если откладываешь ответ | Ответь сейчас — сохранишь темп |
| возможно, лучше проверить условия перед ходом | Проверь условия перед ходом |
| может быть, тебе стоит сменить ход | Смени ход, если нужно |
| стоит внимательно посмотреть на цену действия | Проверь цену действия сразу |
| рекомендуется сохранить результат перед выходом | Сохрани результат перед выходом |
| у вас есть возможность открыть спор сразу | Можешь открыть спор сразу |
| недостаточное количество репутации для заявки | Не хватает репутации для заявки |
| в данный момент действие является недоступным | Сейчас действие пока закрыто |
| необходимо подтвердить выбор перед продолжением | Подтверди выбор, затем продолжай |
| следует дождаться ответа собеседника | Жди ответа собеседника |
| данная ошибка означает отсутствие связи | Нет связи, поэтому ошибка |
| у тебя имеется возможность забрать награду | Можешь забрать награду сейчас |

## UI_PROFILE_ZOOMER_CANONICAL_MAPPING_TABLE

Canonical mapping table only. Source: Step 4 [1] inventory unique UI strings. Each millennial entry has exactly one zoomer replacement. No runtime strings are rewritten by this table. No gameplay, logic, category, or copy application changes.

| id | millennial | zoomer |
| --- | --- | --- |
| `STEP4_2_001` | Полная UI-формулировка 001: Старт | Старт |
| `STEP4_2_002` | Полная UI-формулировка 002: Суть | Суть |
| `STEP4_2_003` | Полная UI-формулировка 003: Цена и итог видны сразу. | Цена и итог видны сразу. |
| `STEP4_2_004` | Полная UI-формулировка 004: Толпа решает. | Толпа решает. |
| `STEP4_2_005` | Полная UI-формулировка 005: Выбери имя — выбери сторону. | Выбери имя — выбери сторону. |
| `STEP4_2_006` | Полная UI-формулировка 006: Выбери имя. | Выбери имя. |
| `STEP4_2_007` | Полная UI-формулировка 007: Голос учтён. | Голос учтён. |
| `STEP4_2_008` | Полная UI-формулировка 008: Уже учтён. | Уже учтён. |
| `STEP4_2_009` | Полная UI-формулировка 009: Голос не учтён. | Голос не учтён. |
| `STEP4_2_010` | Полная UI-формулировка 010: Осталось: {sec}s | Осталось: {sec}s |
| `STEP4_2_011` | Полная UI-формулировка 011: Победил {name} - {aVotes}:{bVotes}. | Победил {name} - {aVotes}:{bVotes}. |
| `STEP4_2_012` | Полная UI-формулировка 012: Поровну по голосам - {aVotes}:{bVotes}. | Поровну по голосам - {aVotes}:{bVotes}. |
| `STEP4_2_013` | Полная UI-формулировка 013: Толпа решает. Выбери имя в событиях. | Толпа решает. Выбери имя в событиях. |
| `STEP4_2_014` | Полная UI-формулировка 014: Толпа решает. Победил {name} - {aVotes}:{bVotes}. | Толпа решает. Победил {name} - {aVotes}:{bVotes}. |
| `STEP4_2_015` | Полная UI-формулировка 015: Толпа решает. Поровну - {aVotes}:{bVotes}. | Толпа решает. Поровну - {aVotes}:{bVotes}. |
| `STEP4_2_016` | Полная UI-формулировка 016: События ({count}) | События ({count}) |
| `STEP4_2_017` | Полная UI-формулировка 017: Пока без событий. | Пока без событий. |
| `STEP4_2_018` | Полная UI-формулировка 018: Свернуть | Свернуть |
| `STEP4_2_019` | Полная UI-формулировка 019: Очистить | Очистить |
| `STEP4_2_020` | Полная UI-формулировка 020: Готово | Готово |
| `STEP4_2_021` | Полная UI-формулировка 021: Ещё {sec} сек | Ещё {sec} сек |
| `STEP4_2_022` | Полная UI-формулировка 022: Победа | Победа |
| `STEP4_2_023` | Полная UI-формулировка 023: Поражение | Поражение |
| `STEP4_2_024` | Полная UI-формулировка 024: Толпа решает | Толпа решает |
| `STEP4_2_025` | Полная UI-формулировка 025: Не хватает 💰. | Не хватает 💰. |
| `STEP4_2_026` | Полная UI-формулировка 026: Свалить {X}💰 | Свалить {X}💰 |
| `STEP4_2_027` | Полная UI-формулировка 027: Для {student}: {arg}. Цена {cost} 💰. | Для {student}: {arg}. Цена {cost} 💰. |
| `STEP4_2_028` | Полная UI-формулировка 028: Аргумент: {teacher} → {student}. | Аргумент: {teacher} → {student}. |
| `STEP4_2_029` | Полная UI-формулировка 029: Введи точный ник. | Введи точный ник. |
| `STEP4_2_030` | Полная UI-формулировка 030: Игрок не найден. | Игрок не найден. |
| `STEP4_2_031` | Полная UI-формулировка 031: Меню | Меню |
| `STEP4_2_032` | Полная UI-формулировка 032: Ответь кто | Ответь кто |
| `STEP4_2_033` | Полная UI-формулировка 033: Ответь где | Ответь где |
| `STEP4_2_034` | Полная UI-формулировка 034: Ответь о ком или о чём | Ответь о ком или о чём |
| `STEP4_2_035` | Полная UI-формулировка 035: Ответь да или нет | Ответь да или нет |
| `STEP4_2_036` | Полная UI-формулировка 036: Сообщение недоступно. | Сообщение недоступно. |
| `STEP4_2_037` | Полная UI-формулировка 037: Мало 💰 на баттл. | Мало 💰 на баттл. |
| `STEP4_2_038` | Полная UI-формулировка 038: Недоступно. | Недоступно. |
| `STEP4_2_039` | Полная UI-формулировка 039: Не найдено. | Не найдено. |
| `STEP4_2_040` | Полная UI-формулировка 040: Выбери игрока. | Выбери игрока. |
| `STEP4_2_041` | Полная UI-формулировка 041: Штраф: -5 💰. | Штраф: -5 💰. |
| `STEP4_2_042` | Полная UI-формулировка 042: Проверь ввод. | Проверь ввод. |
| `STEP4_2_043` | Полная UI-формулировка 043: Подожди немного. | Подожди немного. |
| `STEP4_2_044` | Полная UI-формулировка 044: Уже принято. | Уже принято. |
| `STEP4_2_045` | Полная UI-формулировка 045: Уважение уже отправлено. | Уважение уже отправлено. |
| `STEP4_2_046` | Полная UI-формулировка 046: Цепочка закрыта. | Цепочка закрыта. |
| `STEP4_2_047` | Полная UI-формулировка 047: Уважение недоступно. | Уважение недоступно. |
| `STEP4_2_048` | Полная UI-формулировка 048: Не хватает 💰 на Свалить. | Не хватает 💰 на Свалить. |
| `STEP4_2_049` | Полная UI-формулировка 049: Готово. | Готово. |
| `STEP4_2_050` | Полная UI-формулировка 050: +1💰 | +1💰 |
| `STEP4_2_051` | Полная UI-формулировка 051: +1⭐ | +1⭐ |
| `STEP4_2_052` | Полная UI-формулировка 052: -{voteCost}💰 | -{voteCost}💰 |
| `STEP4_2_053` | Полная UI-формулировка 053: Списано 1💰. | Списано 1💰. |
| `STEP4_2_054` | Полная UI-формулировка 054: Цели +1⭐. | Цели +1⭐. |
| `STEP4_2_055` | Полная UI-формулировка 055: Проверяю. | Проверяю. |
| `STEP4_2_056` | Полная UI-формулировка 056: Сдать {name}: +2💰. | Сдать {name}: +2💰. |
| `STEP4_2_057` | Полная UI-формулировка 057: {name} зовёт на реванш. | {name} зовёт на реванш. |
| `STEP4_2_058` | Полная UI-формулировка 058: Свалить за 1💰. | Свалить за 1💰. |
| `STEP4_2_059` | Полная UI-формулировка 059: +1💰 возврат. | +1💰 возврат. |
| `STEP4_2_060` | Полная UI-формулировка 060: +1💰 возврат большинству. | +1💰 возврат большинству. |
| `STEP4_2_061` | Полная UI-формулировка 061: +1💰 остаток победителю. | +1💰 остаток победителю. |
| `STEP4_2_062` | Полная UI-формулировка 062: Реванш: -{rematchCost}💰. | Реванш: -{rematchCost}💰. |
| `STEP4_2_063` | Полная UI-формулировка 063: Свалить: -{escapeCost}💰. | Свалить: -{escapeCost}💰. |
| `STEP4_2_064` | Полная UI-формулировка 064: {name} обменялся(ась) реакцией с {target}. | {name} обменялся(ась) реакцией с {target}. |
| `STEP4_2_065` | Полная UI-формулировка 065: {name} позвал(а) {guest} в личку к {target}. | {name} позвал(а) {guest} в личку к {target}. |
| `STEP4_2_066` | Полная UI-формулировка 066: {name} на площади. | {name} на площади. |
| `STEP4_2_067` | Полная UI-формулировка 067: Переход: {location}. | Переход: {location}. |
| `STEP4_2_068` | Полная UI-формулировка 068: {attackerName} [{attackerInf}] вызвал(а) тебя. Открой баттл. | {attackerName} [{attackerInf}] вызвал(а) тебя. Открой баттл. |
| `STEP4_2_069` | Полная UI-формулировка 069: Баттл: {a} вызывает {b}. | Баттл: {a} вызывает {b}. |
| `STEP4_2_070` | Полная UI-формулировка 070: Победил(а) {winner}. {loser} проиграл(а). | Победил(а) {winner}. {loser} проиграл(а). |
| `STEP4_2_071` | Полная UI-формулировка 071: Ничья. {a} и {b} разошлись. | Ничья. {a} и {b} разошлись. |
| `STEP4_2_072` | Полная UI-формулировка 072: Толпа голосует. | Толпа голосует. |
| `STEP4_2_073` | Полная UI-формулировка 073: Толпа выбрала {name}: {aVotes}:{bVotes}. | Толпа выбрала {name}: {aVotes}:{bVotes}. |
| `STEP4_2_074` | Полная UI-формулировка 074: Оранжевые аргументы открыты. | Оранжевые аргументы открыты. |
| `STEP4_2_075` | Полная UI-формулировка 075: Красные аргументы открыты. | Красные аргументы открыты. |
| `STEP4_2_076` | Полная UI-формулировка 076: Чёрные аргументы открыты. | Чёрные аргументы открыты. |
| `STEP4_2_077` | Полная UI-формулировка 077: Сбросить старт | Сбросить старт |
| `STEP4_2_078` | Полная UI-формулировка 078: Скрыть | Скрыть |
| `STEP4_2_079` | Полная UI-формулировка 079: Развернуть | Развернуть |
| `STEP4_2_080` | Полная UI-формулировка 080: Заслать | Заслать |
| `STEP4_2_081` | Полная UI-формулировка 081: Закрыть | Закрыть |
| `STEP4_2_082` | Полная UI-формулировка 082: Отвали | Отвали |
| `STEP4_2_083` | Полная UI-формулировка 083: баттл | баттл |
| `STEP4_2_084` | Полная UI-формулировка 084: Почему? | Почему? |
| `STEP4_2_085` | Полная UI-формулировка 085: Цель | Цель |
| `STEP4_2_086` | Полная UI-формулировка 086: Передать аргумент | Передать |
| `STEP4_2_087` | Полная UI-формулировка 087: Локация: Площадь | Локация: Площадь |
| `STEP4_2_088` | Полная UI-формулировка 088: Площадь | Площадь |
| `STEP4_2_089` | Полная UI-формулировка 089: Аргумент грузится. | Аргумент грузится. |
| `STEP4_2_090` | Полная UI-формулировка 090: xp: 0, уровень: 0 | xp: 0, уровень: 0 |
| `STEP4_2_091` | Полная UI-формулировка 091: События | События |
| `STEP4_2_092` | Полная UI-формулировка 092: Выбери контраргумент | Выбери контраргумент |
| `STEP4_2_093` | Полная UI-формулировка 093: Выбери аргумент | Выбери аргумент |
| `STEP4_2_094` | Полная UI-формулировка 094: Передача недоступна. | Передача недоступна. |
| `STEP4_2_095` | Полная UI-формулировка 095: Статус недоступен. | Статус недоступен. |
| `STEP4_2_096` | Полная UI-формулировка 096: Пиши по теме. | Пиши по теме. |
| `STEP4_2_097` | Полная UI-формулировка 097: Изменить высоту чата | Изменить высоту чата |
| `STEP4_2_098` | Полная UI-формулировка 098: Профиль | Профиль |
| `STEP4_2_099` | Полная UI-формулировка 099: Влияние | Влияние |
| `STEP4_2_100` | Полная UI-формулировка 100: Победы | Победы |
| `STEP4_2_101` | Полная UI-формулировка 101: Вызовов нет. | Вызовов нет. |
| `STEP4_2_102` | Полная UI-формулировка 102: Толпа решает. Ты смотришь. | Толпа решает. Ты смотришь. |
| `STEP4_2_103` | Полная UI-формулировка 103: Ответь ... | Ответь ... |

## Runtime inventory alignment

The hidden runtime inventory smoke expects exact source-string alignment for the following entries:

- `Disable Dev Mode`
- `Продолжить`
- `Sigma 💰10`
- `Твой тон: очень скромный`
- `До скромного: 3 ⚡`

The same alignment rule also covers the active zoomer targets currently flagged in the smoke:

- `Enable Dev Mode`
- `Проверяю...`
- `Занят`
- `Ник. Как в чате.`
- `Реванш`

## Forbidden section

- forbidden_rules: all bullets below are required
- no long explanations
- no "давай разберём"
- no unnecessary reasons/excuses
- no teen slang
- no meme wording
- no artificial "youth" voice
- no teacher/mentor tone
- no showing off intelligence

No UI changes. No logic changes. No copy rewrites outside this document.
