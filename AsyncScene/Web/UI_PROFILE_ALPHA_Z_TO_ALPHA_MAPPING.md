# Alpha z -> alpha Mapping - Step 4.3.4

## Scope

- Source rows are Step 4.3.1 entries with profile zoomer or genz.
- Every source row has exactly one alpha mapping.
- Mapping validation is active in Safari smoke.
- Runtime copy replacement is not part of this step.
- Applying the mapping is deferred.

## Contract

- sourceZEntryCount: 23
- sourceZUniqueTextCount: 23
- mappingCount: 23
- changedMappingCount: 16
- identityMappingCount: 7
- canonicalConvergenceCount: 3
- coveragePercent: 100
- duplicateMappingsCount: 0
- emptyReplacementsCount: 0
- variablePreservationFailureCount: 0
- targetTabooHitCount: 0
- runtimeCopyChanged: false
- mappingApplied: false

## Source profile counts

- zoomer: 4
- genz: 19

## Exact mapping table

| mappingId | sourceInventoryId | sourceProfile | category | surface | key | zText | alphaText | mappingMode | variables |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAP_0001 | TXT_0019 | zoomer | button | start_profile_zoomer | start_continue | Погнали | Начать | changed | [] |
| MAP_0002 | TXT_0020 | zoomer | button | start_profile_zoomer | start_reset | Снести выбор | Сбросить | changed | [] |
| MAP_0003 | TXT_0021 | zoomer | button | start_profile_zoomer | rules_action | Правила без душноты | Правило | changed | [] |
| MAP_0004 | TXT_0022 | zoomer | button | start_profile_zoomer | start_action | Войти | Войти | identity | [] |
| MAP_0005 | TXT_0064 | genz | battle | battle_results | battle_win | Победа | Победа | identity | [] |
| MAP_0006 | TXT_0065 | genz | battle | battle_results | battle_loss | Поражение | Поражение | identity | [] |
| MAP_0007 | TXT_0066 | genz | battle | battle_results | battle_draw | Толпа решает | Ничья | changed | [] |
| MAP_0008 | TXT_0067 | genz | battle | conflict_results | conflict_win | Вы победили в конфликте. | Победа | changed | [] |
| MAP_0009 | TXT_0068 | genz | battle | conflict_results | conflict_loss | Вы проиграли конфликт. | Поражение | changed | [] |
| MAP_0010 | TXT_0069 | genz | battle | conflict_results | conflict_draw | Конфликт завершился ничьей. | Ничья | changed | [] |
| MAP_0011 | TXT_0070 | genz | button | battle | escape_button_label | Свалить: {X} | Уйти: {X} | changed | [X] |
| MAP_0012 | TXT_0071 | genz | training | battle | teach_sent_dm | Для {student}: {arg}. Цена {cost} 💰. | {student}: {arg}. Цена {cost} 💰. | changed | [student,arg,cost] |
| MAP_0013 | TXT_0072 | genz | training | battle | teach_sent_chat | Аргумент: {teacher} → {student}. | Аргумент: {teacher} → {student}. | identity | [teacher,student] |
| MAP_0014 | TXT_0073 | genz | placeholder | battle | invite_open_hint | Введи точный ник. | Указать имя | changed | [] |
| MAP_0015 | TXT_0074 | genz | error | battle | invite_invalid | Игрок не найден. | Игрок: нет | changed | [] |
| MAP_0016 | TXT_0075 | genz | button | battle | menu_title | Меню | Меню | identity | [] |
| MAP_0017 | TXT_0076 | genz | button | battle | return_to_start | К старту | Старт | changed | [] |
| MAP_0018 | TXT_0077 | genz | error | battle | menu_unavailable | Недоступно. | Недоступно. | identity | [] |
| MAP_0019 | TXT_0078 | genz | label | battle | goal_label | Цель | Цель | identity | [] |
| MAP_0020 | TXT_0087 | genz | tooltip | type_hint | hint_type_who | Ответь: кто? | Кто? | changed | [] |
| MAP_0021 | TXT_0088 | genz | tooltip | type_hint | hint_type_where | Ответь: где? | Где? | changed | [] |
| MAP_0022 | TXT_0089 | genz | tooltip | type_hint | hint_type_about | Ответь: о ком? | О ком? | changed | [] |
| MAP_0023 | TXT_0090 | genz | tooltip | type_hint | hint_type_yn | Ответь: да или нет? | Да или нет? | changed | [] |

## Canonical convergences

Repeated alpha targets are allowed only for these exact semantic convergences:

- Победа <- TXT_0064, TXT_0067
- Поражение <- TXT_0065, TXT_0068
- Ничья <- TXT_0066, TXT_0069

These are not duplicate mappings.

Define duplicateMappings only as:

- duplicate mappingId
- duplicate sourceInventoryId
- duplicate mapping rows for the same source
- more than one target assigned to the same source

Do not treat canonical target convergence as duplicateMappings.

## Variable contract

Required exact preservation:

- TXT_0070 source [X] -> target [X]
- TXT_0071 source [student,arg,cost] -> target [student,arg,cost]
- TXT_0072 source [teacher,student] -> target [teacher,student]

All other rows must have no variables.

Variable comparison is:

- case-sensitive
- name-sensitive
- count-sensitive
- order-insensitive

## Allowed lexicon relation

Validate alpha targets against Step 4.3.2.

Rules:

- matching is case-insensitive
- punctuation is ignored
- protected tokens are excluded from word checks
- the arrow symbol is excluded from word checks
- the exact grammatical form `ком` is the only permitted inflection exception
- `ком` is derived from the allowed lemma `кто`
- this exception exists only to preserve the ABOUT argument type
- no other unknown target word is allowed

Expected:

- unknownTargetWords: []
- allowedInflectionExceptions: ["ком"]

## Taboo relation

Run every alpha target through the active Step 4.3.3 matcher.

Expected:

- targetTabooHitCount: 0
- targetTabooHits: []

Do not scan or modify runtime copy.

## Deferred work

- Runtime replacement is deferred.
- Source keys are unchanged.
- Gameplay semantics are unchanged.
- Applying this mapping is outside Step 4.3.4.
- New feature coverage is handled in Step 4.3.5.
