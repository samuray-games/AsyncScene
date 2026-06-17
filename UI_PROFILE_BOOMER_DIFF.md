# UI_PROFILE_BOOMER_DIFF

Это delta-only документ поверх `UI_PROFILE_MILLENNIAL`.

Base profile = `UI_PROFILE_MILLENNIAL`.
Boomer is delta-only.
Boomer is not an independent profile.

## PACE / TEMPO

Boomer pace is a delta from UI_PROFILE_MILLENNIAL.

Rule:
- slower than millennial
- less sharp
- more pauses
- clearer transitions
- fewer abrupt commands
- fewer one-word reactions
- one thought per short message
- context before action when space allows

Meaning:
- pace changes delivery, not meaning
- pace does not change mechanics
- pace does not change rewards, costs, risks, cooldowns, or outcomes
- pace does not create a standalone boomer profile

Preferred transformations:
- command -> neutral instruction
- abrupt result -> result with transition
- isolated status -> status with short context
- sharp warning -> calm status
- short punchline -> complete sentence

Forbidden for this step:
- editing runtime strings
- editing default/millennial/zoomer/genz/alpha copy
- replacing Data.TEXTS values
- replacing SystemCopy values
- replacing NPC lines
- changing battle/report/economy behavior

## RISK LANGUAGE

Boomer risk language is a delta from UI_PROFILE_MILLENNIAL.

Rule:
- risk is calm
- risk is factual
- risk uses soft probability
- risk explains possible loss without pressure
- risk gives a check hint when useful
- risk does not scare the player
- risk does not judge the player
- risk does not command the player
- risk does not add moral pressure
- risk does not change mechanics

Meaning:
- risk wording changes only delivery
- risk wording does not change rewards
- risk wording does not change costs
- risk wording does not change cooldowns
- risk wording does not change outcomes
- risk wording does not change available actions
- risk wording does not create a standalone boomer profile

Preferred risk patterns:
- "Можно потерять..."
- "Есть шанс..."
- "Есть риск..."
- "Лучше проверить..."
- "Стоит проверить..."
- "Можно повторить позже."
- "Перед выбором лучше проверить..."

Limit:
- one risk idea per message
- one check hint per message
- no fear language
- no pressure language
- no moral judgment

## EXACT RISK COPY TABLE

TXT_0003
FROM:
Оппонент задаёт риск.
TO:
Есть риск со стороны оппонента.

TXT_0004
FROM:
Ставка списывает ресурс.
TO:
При ставке можно потерять ресурс.

TXT_0006
FROM:
Цена и итог сразу.
TO:
Цена и итог видны заранее.

TXT_0014
FROM:
Только для интерфейса. Не сохраняем. Можно поменять позже.
TO:
Данные используются только для интерфейса. Их можно изменить позже.

TXT_0025
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Лучше проверить баланс.

TXT_0026
FROM:
Мало 💰 на баттл.
TO:
Для баттла может не хватить 💰. Лучше проверить баланс.

TXT_0027
FROM:
Недоступно.
TO:
Пока недоступно. Лучше проверить условия.

TXT_0028
FROM:
Не найдено.
TO:
Не найдено. Лучше проверить данные.

TXT_0029
FROM:
Игрок не указан.
TO:
Игрок не указан. Лучше сначала выбрать участника.

TXT_0030
FROM:
Штраф: -5 💰.
TO:
Есть риск потерять 5 💰, если информация не подтвердится.

TXT_0031
FROM:
Ввод некорректен.
TO:
Ввод некорректен. Лучше проверить формат.

TXT_0032
FROM:
Кулдаун активен.
TO:
Кулдаун активен. Повторить можно позже.

TXT_0033
FROM:
Проверка займет время.
TO:
Проверка займёт время. Результат появится позже.

TXT_0042
FROM:
Свалить за 1💰.
TO:
Можно выйти за 1💰. Ресурс будет списан.

TXT_0046
FROM:
Реванш: -{rematchCost}💰.
TO:
Реванш стоит {rematchCost}💰. Ресурс будет списан.

TXT_0047
FROM:
Свалить: -{escapeCost}💰.
TO:
Выход стоит {escapeCost}💰. Ресурс будет списан.

TXT_0057
FROM:
Оппонент задаёт риск.
TO:
Есть риск со стороны оппонента.

TXT_0058
FROM:
Ставка списывает ресурс.
TO:
При ставке можно потерять ресурс.

TXT_0060
FROM:
Цена и итог сразу.
TO:
Цена и итог видны заранее.

TXT_0065
FROM:
Поражение
TO:
Поражение. Возможны потери по итогам.

TXT_0068
FROM:
Вы проиграли конфликт.
TO:
Вы проиграли конфликт. Возможны потери по итогам.

TXT_0070
FROM:
Свалить: {X}
TO:
Выход: {X}. Перед выбором лучше проверить стоимость.

TXT_0118
FROM:
«Сдать» без фактов — шум.
TO:
Сообщение без фактов не подтверждается. Проверка не даст результата.

TXT_0124
FROM:
Здесь.
TO:
Здесь. Место уже указано.

TXT_0126
FROM:
Да.
TO:
Да. Ответ принят.

TXT_0131
FROM:
отвечай сейчас
TO:
Ответь сейчас. Так конфликт продолжится.

TXT_0133
FROM:
плати и уходи
TO:
Заплати и уходи. После оплаты конфликт закончится.

TXT_0137
FROM:
Принято. Я рядом.
TO:
Принято. Я рядом, если понадобится помощь.

TXT_0138
FROM:
Тише. Решим.
TO:
Тише. Сначала разберёмся в ситуации.

TXT_0141
FROM:
Ты уже проголосовал.
TO:
Голос уже учтён. Повторно голосовать нельзя.

TXT_0142
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Для голосования нужен ресурс.

TXT_0143
FROM:
Реванш уже запрошен.
TO:
Реванш уже запрошен. Дождитесь ответа.

TXT_0144
FROM:
Недоступно. Баттл не завершён.
TO:
Действие недоступно. Конфликт ещё не завершён.

TXT_0145
FROM:
Недоступно.
TO:
Действие недоступно. Сейчас не выполнены условия.

TXT_0146
FROM:
Выбери игрока.
TO:
Сначала выберите игрока. После этого действие станет доступно.

TXT_0147
FROM:
Такого нет.
TO:
Такой игрок не найден. Проверьте имя.

TXT_0148
FROM:
Кулдаун активен.
TO:
Кулдаун активен. Повторить действие можно позже.

TXT_0149
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Для этого действия нужен ресурс.

TXT_0150
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Для уважения нужен ресурс.

TXT_0151
FROM:
Уже было уважение сегодня этому персонажу.
TO:
Уважение этому персонажу сегодня уже было. Повторить можно позже.

TXT_0152
FROM:
Цепочка A->B->A сегодня не работает.
TO:
Цепочка A->B->A сегодня не работает. Это ограничение дня.

TXT_0153
FROM:
Лимит уважения на сегодня исчерпан.
TO:
Лимит уважения на сегодня исчерпан. Новое действие будет доступно позже.

TXT_0154
FROM:
Сейчас не получилось. Попробуй позже.
TO:
Сейчас выполнить действие не получилось. Попробуйте позже.

TXT_0155
FROM:
Ты отдал 1💰
TO:
Вы отдали 1💰. Ресурс списан.

TXT_0156
FROM:
Цель получила +1 ⭐
TO:
Цель получила +1 ⭐. Уважение применено.

TXT_0160
FROM:
Рано. Дай паузу.
TO:
Пока рано. Подождите немного.

TXT_0161
FROM:
Недоступно.
TO:
Действие недоступно. Сейчас не выполнены условия.

TXT_0162
FROM:
Недоступно.
TO:
Действие недоступно. Сейчас не выполнены условия.

TXT_0163
FROM:
Недоступно.
TO:
Действие недоступно. Сейчас не выполнены условия.

TXT_0164
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Для голосования нужен ресурс.

## Source delta only

- Base profile = `UI_PROFILE_MILLENNIAL`.
- Boomer is delta-only.
- Boomer is not an independent profile.
- No runtime UI logic is defined here.
- This document exists only to describe the boomer delta derived from `UI_PROFILE_MILLENNIAL`.

## EXPLANATIONS

Boomer explanations are a delta from UI_PROFILE_MILLENNIAL.

Rule:
- explain why an action is needed
- explain why an error happened
- explain why a risk exists
- explain what result was applied
- explain what happens next when it is not obvious
- keep each explanation short
- keep one reason per message
- keep one next-step note per message
- do not add lectures
- do not add moral judgment
- do not add background theory
- do not explain obvious actions

Meaning:
- explanations improve clarity only
- explanations do not change mechanics
- explanations do not change rewards
- explanations do not change costs
- explanations do not change risks
- explanations do not change cooldowns
- explanations do not change outcomes
- explanations do not create a standalone boomer profile

## EXACT EXPLANATION COPY TABLE

TXT_0024
FROM:
Сообщение недоступно.
TO:
Сообщение недоступно. Его сейчас нельзя открыть.

TXT_0025
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Для этого действия нужен ресурс.

## SOFT VERBS

Boomer verb language is a delta from UI_PROFILE_MILLENNIAL.

Rule:
- sharp verbs become calm verbs
- slang commands become neutral actions
- direct pressure becomes optional action language
- player-facing imperatives become polite forms
- conflict verbs stay clear but less aggressive
- mechanic meaning does not change
- cost meaning does not change
- result meaning does not change
- no standalone boomer profile is created

Preferred replacements:
- "свалить" -> "уйти"
- "снести" -> "сбросить"
- "тыкни" -> "выберите"
- "вписывайся" -> "участвовать"
- "плати" -> "можно заплатить"
- "отвечай" -> "можно ответить"
- "бросил вызов" -> "начал конфликт"
- "разберусь" -> "проверю"
- "вмешался" -> "меры приняты"
- "зовёт" -> "предлагает"

Limit:
- do not soften mechanic names if they are labels only
- do not remove cost values
- do not remove variables
- do not add moral tone
- do not add pressure
- do not add fear language
- do not change mechanics

## EXACT SOFT VERB COPY TABLE

TXT_0019
FROM:
Погнали
TO:
Начать

TXT_0020
FROM:
Снести выбор
TO:
Сбросить выбор

TXT_0038
FROM:
Сдать {name}: +2💰.
TO:
Сообщить о {name}: +2💰.

TXT_0039
FROM:
Коп: {name} сдан, +2💰.
TO:
Коп: информация по {name} принята, +2💰.

TXT_0041
FROM:
{name} зовёт на реванш.
TO:
{name} предлагает реванш.

TXT_0042
FROM:
Свалить за 1💰.
TO:
Уйти за 1💰.

TXT_0047
FROM:
Свалить: -{escapeCost}💰.
TO:
Уйти: -{escapeCost}💰.

TXT_0050
FROM:
{attackerName} [{attackerInf}] бросил вызов.
TO:
{attackerName} [{attackerInf}] начал конфликт.

TXT_0070
FROM:
Свалить: {X}
TO:
Уйти: {X}

TXT_0073
FROM:
Введи точный ник.
TO:
Введите точный ник.

TXT_0079
FROM:
Понял. Проверяю.
TO:
Принято. Проверяю.

TXT_0080
FROM:
Принял. Разберусь.
TO:
Принято. Проверю.

TXT_0083
FROM:
Проверка сошлась. Вмешался.
TO:
Проверка подтвердилась. Меры приняты.

TXT_0084
FROM:
Проверка сошлась. Занялся.
TO:
Проверка подтвердилась. Работа начата.

TXT_0087
FROM:
Ответь: кто?
TO:
Ответьте: кто?

TXT_0088
FROM:
Ответь: где?
TO:
Ответьте: где?

TXT_0089
FROM:
Ответь: о ком?
TO:
Ответьте: о ком?

TXT_0090
FROM:
Ответь: да или нет?
TO:
Ответьте: да или нет?

TXT_0092
FROM:
ВПИСЫВАЙСЯ
TO:
Участвовать

TXT_0093
FROM:
ТЫКНИ ИМЯ
TO:
Выберите имя

TXT_0100
FROM:
Ты вывез.
TO:
Вы справились.

TXT_0101
FROM:
Не вывез.
TO:
Не получилось.

TXT_0102
FROM:
Ничья. Все шумели зря.
TO:
Ничья. Решение не изменилось.

TXT_0105
FROM:
Мейн забрал.
TO:
Большинство победило.

TXT_0106
FROM:
Андер просел.
TO:
Меньшинство проиграло.

TXT_0107
FROM:
Драма закрыта.
TO:
Конфликт завершён.

TXT_0108
FROM:
лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐.
TO:
Лимит ⭐ на этой неделе. Можно пополнить 💰 для конвертации в ⭐.

TXT_0109
FROM:
Cap: max Points на этой неделе. Используйте, пока не сбросили cap.
TO:
Лимит 💰 на этой неделе. Можно использовать ресурс до сброса.

TXT_0115
FROM:
Факт принят, идем дальше.
TO:
Факт принят, продолжаем.

TXT_0117
FROM:
Сдача принята — спокойнее.
TO:
Информация принята. Спокойнее.

TXT_0118
FROM:
«Сдать» без фактов — шум.
TO:
Сообщение без фактов не подтверждается.

TXT_0131
FROM:
отвечай сейчас
TO:
можно ответить сейчас

TXT_0133
FROM:
плати и уходи
TO:
можно заплатить и уйти

TXT_0135
FROM:
Тише
TO:
Спокойнее

TXT_0138
FROM:
Тише. Решим.
TO:
Спокойнее. Разберёмся.

TXT_0146
FROM:
Выбери игрока.
TO:
Выберите игрока.

TXT_0154
FROM:
Сейчас не получилось. Попробуй позже.
TO:
Сейчас не получилось. Попробуйте позже.

TXT_0155
FROM:
Ты отдал 1💰
TO:
Вы отдали 1💰

TXT_0160
FROM:
Рано. Дай паузу.
TO:
Рано. Подождите немного.

## NEW FEATURE SURFACES

Boomer new-feature coverage is a delta from UI_PROFILE_MILLENNIAL.

Rule:
- every new surface must be listed explicitly
- every listed surface uses the same boomer rules from steps [1.1]-[1.5]
- wording is calmer than zoomer
- wording is clearer than zoomer
- wording does not become official
- wording does not become moralizing
- wording does not create pressure
- wording does not create fear
- wording does not change mechanics
- wording does not change costs
- wording does not change rewards
- wording does not change cooldowns
- wording does not change outcomes
- no standalone boomer profile is created

Required surfaces:
- battle
- DM
- respect
- teach
- report
- rematch
- crowd
- timer
- NPC events

Surface rules:
- battle: explain action, cost, result, and next step calmly
- DM: use direct but polite wording
- respect: explain cost, limit, and result without pressure
- teach: keep teacher, student, argument, and cost clear
- report: explain check, reward, penalty, and cooldown calmly
- rematch: explain repeat conflict and cost
- crowd: explain vote, majority, minority, and result
- timer: explain waiting and cooldown without urgency
- NPC events: explain what happened without drama inflation

## EXACT NEW FEATURE COVERAGE TABLE

TXT_0021
SURFACE:
timer
FROM:
Ещё {sec} сек
TO:
Осталось {sec} сек.

TXT_0022
SURFACE:
battle
FROM:
Победа
TO:
Победа.

TXT_0023
SURFACE:
battle
FROM:
Поражение
TO:
Поражение.

TXT_0024
SURFACE:
crowd
FROM:
Толпа решает
TO:
Голосование идёт.

TXT_0025
SURFACE:
battle
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Проверьте баланс.

TXT_0026
SURFACE:
battle
FROM:
Свалить {X}💰
TO:
Уйти за {X}💰

TXT_0027
SURFACE:
teach
FROM:
Для {student}: {arg}. Цена {cost} 💰.
TO:
Аргумент для {student}: {arg}. Стоимость: {cost} 💰.

TXT_0028
SURFACE:
teach
FROM:
Аргумент: {teacher} → {student}.
TO:
Аргумент передан: {teacher} → {student}.

TXT_0029
SURFACE:
DM
FROM:
Введи точный ник.
TO:
Введите точный ник.

TXT_0030
SURFACE:
DM
FROM:
Игрок не найден.
TO:
Игрок не найден. Проверьте имя.

TXT_0038
SURFACE:
report
FROM:
Сдать {name}: +2💰.
TO:
Сообщить о {name}: +2💰.

TXT_0039
SURFACE:
report
FROM:
Коп: {name} сдан, +2💰.
TO:
Коп: информация по {name} принята, +2💰.

TXT_0040
SURFACE:
teach
FROM:
Аргумент: {teacher} → {student}.
TO:
Аргумент передан: {teacher} → {student}.

TXT_0041
SURFACE:
rematch
FROM:
{name} зовёт на реванш.
TO:
{name} предлагает реванш.

TXT_0042
SURFACE:
battle
FROM:
Свалить за 1💰.
TO:
Уйти за 1💰.

TXT_0043
SURFACE:
battle
FROM:
+1💰 возврат.
TO:
Возврат: +1💰.

TXT_0044
SURFACE:
crowd
FROM:
+1💰 возврат большинству.
TO:
Большинство получает возврат: +1💰.

TXT_0045
SURFACE:
battle
FROM:
+1💰 остаток победителю.
TO:
Победитель получает остаток: +1💰.

TXT_0046
SURFACE:
rematch
FROM:
Реванш: -{rematchCost}💰.
TO:
Реванш стоит {rematchCost}💰.

TXT_0047
SURFACE:
battle
FROM:
Свалить: -{escapeCost}💰.
TO:
Уйти: -{escapeCost}💰.

TXT_0048
SURFACE:
DM
FROM:
{target}: +{amount}💰.
TO:
{target} получает +{amount}💰.

TXT_0049
SURFACE:
DM
FROM:
{target}: +{amount}💰 тебе.
TO:
Вы получили +{amount}💰 от {target}.

TXT_0050
SURFACE:
battle
FROM:
{attackerName} [{attackerInf}] бросил вызов.
TO:
{attackerName} [{attackerInf}] начал конфликт.

TXT_0051
SURFACE:
battle
FROM:
Баттл с {oppName}: {text}.
TO:
Конфликт с {oppName}: {text}.

TXT_0052
SURFACE:
battle
FROM:
{a} и {b}: ничья.
TO:
Между {a} и {b} ничья.

TXT_0053
SURFACE:
crowd
FROM:
Толпа: {name} {aVotes}:{bVotes}.
TO:
Голосование: {name} {aVotes}:{bVotes}.

TXT_0064
SURFACE:
battle
FROM:
Победа
TO:
Победа.

TXT_0065
SURFACE:
battle
FROM:
Поражение
TO:
Поражение.

TXT_0066
SURFACE:
battle
FROM:
Ничья
TO:
Ничья.

TXT_0067
SURFACE:
battle
FROM:
Вы победили в конфликте.
TO:
Вы победили в конфликте. Результат применён.

TXT_0068
SURFACE:
battle
FROM:
Вы проиграли конфликт.
TO:
Вы проиграли конфликт. Результат применён.

TXT_0069
SURFACE:
battle
FROM:
Конфликт завершился ничьей.
TO:
Конфликт завершился ничьей. Результат применён.

TXT_0070
SURFACE:
battle
FROM:
Свалить: {X}
TO:
Уйти: {X}

TXT_0071
SURFACE:
teach
FROM:
Для {student}: {arg}. Цена {cost} 💰.
TO:
Аргумент для {student}: {arg}. Стоимость: {cost} 💰.

TXT_0073
SURFACE:
DM
FROM:
Введи точный ник.
TO:
Введите точный ник.

TXT_0074
SURFACE:
DM
FROM:
Игрок не найден.
TO:
Игрок не найден. Проверьте имя.

TXT_0075
SURFACE:
report
FROM:
Сдать
TO:
Сообщить

TXT_0076
SURFACE:
DM
FROM:
DM
TO:
Личные сообщения

TXT_0077
SURFACE:
DM
FROM:
Недоступно.
TO:
Пока недоступно.

TXT_0078
SURFACE:
report
FROM:
Ник бандита или токсика.
TO:
Имя бандита или токсика.

TXT_0079
SURFACE:
report
FROM:
Понял. Проверяю.
TO:
Принято. Проверяю.

TXT_0080
SURFACE:
report
FROM:
Принял. Разберусь.
TO:
Принято. Проверю.

TXT_0081
SURFACE:
report
FROM:
Занят, связь позже.
TO:
Сейчас занят. Связь будет позже.

TXT_0082
SURFACE:
report
FROM:
Не могу, оформляю дело.
TO:
Сейчас идёт оформление дела.

TXT_0083
SURFACE:
report
FROM:
Проверка сошлась. Вмешался.
TO:
Проверка подтвердилась. Меры приняты.

TXT_0084
SURFACE:
report
FROM:
Проверка сошлась. Занялся.
TO:
Проверка подтвердилась. Работа начата.

TXT_0085
SURFACE:
report
FROM:
Не подтвердилось. Факты не сошлись.
TO:
Проверка не подтвердила информацию.

TXT_0086
SURFACE:
timer
FROM:
Проверка займет время.
TO:
Проверка займёт время.

TXT_0087
SURFACE:
DM
FROM:
Ответь: кто?
TO:
Ответьте: кто?

TXT_0088
SURFACE:
DM
FROM:
Ответь: где?
TO:
Ответьте: где?

TXT_0089
SURFACE:
DM
FROM:
Ответь: о ком?
TO:
Ответьте: о ком?

TXT_0090
SURFACE:
DM
FROM:
Ответь: да или нет?
TO:
Ответьте: да или нет?

TXT_0092
SURFACE:
crowd
FROM:
ВПИСЫВАЙСЯ
TO:
Участвовать

TXT_0093
SURFACE:
DM
FROM:
ТЫКНИ ИМЯ
TO:
Выберите имя

TXT_0096
SURFACE:
battle
FROM:
Баттл
TO:
Конфликт

TXT_0097
SURFACE:
timer
FROM:
Таймер
TO:
Таймер

TXT_0098
SURFACE:
battle
FROM:
RIP
TO:
Поражение.

TXT_0099
SURFACE:
battle
FROM:
GG
TO:
Готово.

TXT_0100
SURFACE:
battle
FROM:
Ты вывез.
TO:
Вы справились.

TXT_0101
SURFACE:
battle
FROM:
Не вывез.
TO:
Не получилось.

TXT_0102
SURFACE:
crowd
FROM:
Ничья. Все шумели зря.
TO:
Ничья. Решение не изменилось.

TXT_0103
SURFACE:
crowd
FROM:
Голос учтён.
TO:
Голос учтён.

TXT_0104
SURFACE:
crowd
FROM:
Ты в мейне.
TO:
Вы в большинстве.

TXT_0105
SURFACE:
crowd
FROM:
Мейн забрал.
TO:
Большинство победило.

TXT_0106
SURFACE:
crowd
FROM:
Андер просел.
TO:
Меньшинство проиграло.

TXT_0107
SURFACE:
battle
FROM:
Драма закрыта.
TO:
Конфликт завершён.

TXT_0108
SURFACE:
timer
FROM:
лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐.
TO:
Лимит ⭐ на этой неделе. Можно пополнить 💰 для конвертации в ⭐.

TXT_0109
SURFACE:
timer
FROM:
Cap: max Points на этой неделе. Используйте, пока не сбросили cap.
TO:
Лимит 💰 на этой неделе. Можно использовать ресурс до сброса.

TXT_0111
SURFACE:
NPC events
FROM:
Опасная точка рядом.
TO:
Рядом есть риск. Лучше проверить ситуацию.

TXT_0112
SURFACE:
NPC events
FROM:
Вызов принят, экипаж в пути.
TO:
Вызов принят. Экипаж в пути.

TXT_0113
SURFACE:
NPC events
FROM:
Ситуация под контролем.
TO:
Ситуация под контролем.

TXT_0114
SURFACE:
NPC events
FROM:
Принято, наблюдаю.
TO:
Информация принята. Наблюдаю.

TXT_0115
SURFACE:
NPC events
FROM:
Факт принят, идем дальше.
TO:
Факт принят, продолжаем.

TXT_0116
SURFACE:
timer
FROM:
Занят расследованием, связь позже.
TO:
Сейчас идёт расследование. Связь будет позже.

TXT_0117
SURFACE:
report
FROM:
Сдача принята - спокойнее.
TO:
Информация принята. Спокойнее.

TXT_0118
SURFACE:
report
FROM:
«Сдать» без фактов - шум.
TO:
Сообщение без фактов не подтверждается.

TXT_0130
SURFACE:
battle
FROM:
слабый ход
TO:
Этот ход может сработать хуже.

TXT_0131
SURFACE:
DM
FROM:
отвечай сейчас
TO:
можно ответить сейчас

TXT_0132
SURFACE:
battle
FROM:
кошелек ближе
TO:
Есть риск потерять 💰.

TXT_0133
SURFACE:
battle
FROM:
плати и уходи
TO:
можно заплатить и уйти

TXT_0135
SURFACE:
NPC events
FROM:
Тише
TO:
Спокойнее

TXT_0138
SURFACE:
NPC events
FROM:
Тише. Решим.
TO:
Спокойнее. Разберёмся.

TXT_0139
SURFACE:
battle
FROM:
Кошелек ближе.
TO:
Есть риск потерять 💰.

TXT_0140
SURFACE:
battle
FROM:
Слабый ход.
TO:
Этот ход может сработать хуже.

TXT_0141
SURFACE:
crowd
FROM:
Ты уже проголосовал.
TO:
Голос уже учтён.

TXT_0142
SURFACE:
crowd
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Проверьте баланс.

TXT_0144
SURFACE:
battle
FROM:
Недоступно. Баттл не завершён.
TO:
Пока недоступно. Конфликт ещё не завершён.

TXT_0145
SURFACE:
battle
FROM:
Недоступно.
TO:
Пока недоступно.

TXT_0146
SURFACE:
report
FROM:
Выбери игрока.
TO:
Выберите игрока.

TXT_0147
SURFACE:
report
FROM:
Такого нет.
TO:
Игрок не найден.

TXT_0148
SURFACE:
timer
FROM:
Кулдаун активен.
TO:
Кулдаун активен. Повторить можно позже.

TXT_0149
SURFACE:
battle
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Проверьте баланс.

TXT_0150
SURFACE:
respect
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Проверьте баланс.

TXT_0151
SURFACE:
respect
FROM:
Уже было уважение сегодня этому персонажу.
TO:
Уважение этому персонажу сегодня уже было.

TXT_0152
SURFACE:
respect
FROM:
Цепочка A->B->A сегодня не работает.
TO:
Сегодня эта цепочка не сработает.

TXT_0153
SURFACE:
respect
FROM:
Лимит уважения на сегодня исчерпан.
TO:
Лимит уважения на сегодня исчерпан.

TXT_0154
SURFACE:
respect
FROM:
Сейчас не получилось. Попробуй позже.
TO:
Сейчас не получилось. Попробуйте позже.

TXT_0155
SURFACE:
respect
FROM:
Ты отдал 1💰
TO:
Вы отдали 1💰

TXT_0160
SURFACE:
timer
FROM:
Рано. Дай паузу.
TO:
Пока рано. Подождите немного.

TXT_0161
SURFACE:
battle
FROM:
Недоступно.
TO:
Пока недоступно.

TXT_0162
SURFACE:
DM
FROM:
Недоступно.
TO:
Пока недоступно.

TXT_0163
SURFACE:
report
FROM:
Недоступно.
TO:
Пока недоступно.

TXT_0164
SURFACE:
crowd
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Проверьте баланс.

## NEW FEATURE SURFACES CHECKS

## NEXT SECTION

TXT_0026
FROM:
Мало 💰 на баттл.
TO:
Мало 💰 на баттл. Для начала конфликта нужен ресурс.

TXT_0027
FROM:
Недоступно.
TO:
Действие недоступно. Сейчас не выполнены условия.

TXT_0028
FROM:
Не найдено.
TO:
Не найдено. Проверьте данные и попробуйте ещё раз.

TXT_0029
FROM:
Игрок не указан.
TO:
Игрок не указан. Сначала выберите участника.

TXT_0030
FROM:
Штраф: -5 💰.
TO:
Штраф: -5 💰. Информация не подтвердилась.

TXT_0031
FROM:
Ввод некорректен.
TO:
Ввод некорректен. Проверьте формат.

TXT_0032
FROM:
Кулдаун активен.
TO:
Кулдаун активен. Повторить действие можно позже.

TXT_0033
FROM:
Проверка займет время.
TO:
Проверка займёт время. Результат появится после завершения.

TXT_0036
FROM:
Голос учтён.
TO:
Голос учтён. Итог обновится после завершения голосования.

TXT_0037
FROM:
Проверяю.
TO:
Проверяю. После проверки появится результат.

TXT_0038
FROM:
Сдать {name}: +2💰.
TO:
Информация по {name} подтверждена. Награда: +2💰.

TXT_0039
FROM:
Коп: {name} сдан, +2💰.
TO:
Проверка по {name} завершена. Награда: +2💰.

TXT_0040
FROM:
Аргумент: {teacher} → {student}.
TO:
Аргумент передан от {teacher} к {student}. Теперь его можно использовать дальше.

TXT_0041
FROM:
{name} зовёт на реванш.
TO:
{name} предлагает реванш. Можно принять повторный конфликт.

TXT_0042
FROM:
Свалить за 1💰.
TO:
Можно покинуть конфликт за 1💰. Ресурс будет списан сразу.

TXT_0043
FROM:
+1💰 возврат.
TO:
Возврат: +1💰. Ресурс возвращён.

TXT_0044
FROM:
+1💰 возврат большинству.
TO:
Большинство получает возврат: +1💰. Итог уже применён.

TXT_0045
FROM:
+1💰 остаток победителю.
TO:
Победитель получает остаток: +1💰. Итог уже применён.

TXT_0046
FROM:
Реванш: -{rematchCost}💰.
TO:
Реванш стоит {rematchCost}💰. Ресурс будет списан при запуске.

TXT_0047
FROM:
Свалить: -{escapeCost}💰.
TO:
Выход стоит {escapeCost}💰. Ресурс будет списан при выборе.

TXT_0048
FROM:
{target}: +{amount}💰.
TO:
{target} получает +{amount}💰. Передача завершена.

TXT_0049
FROM:
{target}: +{amount}💰 тебе.
TO:
Вы получили +{amount}💰 от {target}. Баланс обновлён.

TXT_0050
FROM:
{attackerName} [{attackerInf}] бросил вызов.
TO:
{attackerName} [{attackerInf}] начал конфликт. Можно выбрать ответ.

TXT_0051
FROM:
Баттл с {oppName}: {text}.
TO:
Конфликт с {oppName} завершён: {text}. Результат уже применён.

TXT_0052
FROM:
{a} и {b}: ничья.
TO:
Между {a} и {b} ничья. Дальше применяется правило ничьей.

TXT_0053
FROM:
Толпа: {name} {aVotes}:{bVotes}.
TO:
Голосование завершено. {name}, счёт {aVotes}:{bVotes}.

TXT_0054
FROM:
Оранжевые аргументы открыты.
TO:
Оранжевые аргументы открыты. Теперь их можно использовать.

TXT_0055
FROM:
Красные аргументы открыты.
TO:
Красные аргументы открыты. Теперь их можно использовать.

TXT_0056
FROM:
Чёрные аргументы открыты.
TO:
Чёрные аргументы открыты. Теперь их можно использовать.

TXT_0067
FROM:
Вы победили в конфликте.
TO:
Вы победили в конфликте. Результат уже применён.

TXT_0068
FROM:
Вы проиграли конфликт.
TO:
Вы проиграли конфликт. Последствия уже учтены.

TXT_0069
FROM:
Конфликт завершился ничьей.
TO:
Конфликт завершился ничьей. Дальше применяется правило ничьей.

TXT_0070
FROM:
Свалить: {X}
TO:
Покинуть конфликт: {X}. Стоимость будет списана при выборе.

TXT_0071
FROM:
Для {student}: {arg}. Цена {cost} 💰.
TO:
Аргумент для {student}: {arg}. Стоимость передачи: {cost} 💰.

TXT_0073
FROM:
Введи точный ник.
TO:
Введите точный ник. Так система сможет найти игрока.

TXT_0074
FROM:
Игрок не найден.
TO:
Игрок не найден. Проверьте точное имя.

TXT_0077
FROM:
Недоступно.
TO:
Действие недоступно. Сейчас не выполнены условия.

TXT_0079
FROM:
Понял. Проверяю.
TO:
Сообщение получено. Начинаю проверку.

TXT_0080
FROM:
Принял. Разберусь.
TO:
Сообщение принято. Проверю ситуацию.

TXT_0081
FROM:
Занят, связь позже.
TO:
Сейчас занят. Вернусь к этому позже.

TXT_0082
FROM:
Не могу, оформляю дело.
TO:
Сейчас не могу ответить. Идёт оформление дела.

TXT_0083
FROM:
Проверка сошлась. Вмешался.
TO:
Проверка подтвердила информацию. Вмешательство выполнено.

TXT_0084
FROM:
Проверка сошлась. Занялся.
TO:
Проверка подтвердила информацию. Ситуацией занимаются.

TXT_0085
FROM:
Не подтвердилось. Факты не сошлись.
TO:
Проверка не подтвердила информацию. Награда не начисляется.

TXT_0086
FROM:
Проверка займет время.
TO:
Проверка займёт время. Результат появится после завершения.

TXT_0087
FROM:
Ответь: кто?
TO:
Нужно назвать человека. Это уточнит аргумент.

TXT_0088
FROM:
Ответь: где?
TO:
Нужно указать место. Это уточнит аргумент.

TXT_0089
FROM:
Ответь: о ком?
TO:
Нужно назвать персонажа. Это уточнит аргумент.

TXT_0090
FROM:
Ответь: да или нет?
TO:
Нужно ответить «да» или «нет». Это завершит уточнение.

TXT_0108
FROM:
лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐.
TO:
Лимит ⭐ на этой неделе достигнут. Пополните 💰, чтобы конвертировать их в ⭐.

TXT_0109
FROM:
Cap: max Points на этой неделе. Используйте, пока не сбросили cap.
TO:
Лимит 💰 на этой неделе достигнут. Используйте ресурс до сброса лимита.

TXT_0111
FROM:
Опасная точка рядом.
TO:
Поблизости отмечена опасная зона. Лучше действовать осторожно.

TXT_0112
FROM:
Вызов принят, экипаж в пути.
TO:
Вызов принят. Экипаж уже направляется.

TXT_0113
FROM:
Ситуация под контролем.
TO:
Ситуация под контролем. Дополнительных действий сейчас не требуется.

TXT_0114
FROM:
Принято, наблюдаю.
TO:
Информация принята. Продолжаю наблюдение.

TXT_0115
FROM:
Факт принят, идем дальше.
TO:
Информация принята. Продолжаем работу.

TXT_0116
FROM:
Занят расследованием, связь позже.
TO:
Сейчас занят расследованием. Связь будет позже.

TXT_0117
FROM:
Сдача принята — спокойнее.
TO:
Информация принята. Ситуация стала спокойнее.

TXT_0071
FROM:
Для {student}: {arg}. Цена {cost} 💰.
TO:
Аргумент для {student}: {arg}. Перед передачей лучше проверить стоимость: {cost} 💰.

TXT_0073
FROM:
Введи точный ник.
TO:
Введите точный ник. Лучше проверить написание.

TXT_0074
FROM:
Игрок не найден.
TO:
Игрок не найден. Лучше проверить имя.

TXT_0077
FROM:
Недоступно.
TO:
Пока недоступно. Лучше проверить условия.

TXT_0081
FROM:
Занят, связь позже.
TO:
Сейчас занят. Связь будет позже.

TXT_0082
FROM:
Не могу, оформляю дело.
TO:
Сейчас идёт оформление дела. Ответ будет позже.

TXT_0085
FROM:
Не подтвердилось. Факты не сошлись.
TO:
Проверка не подтвердила информацию. Награда не начисляется.

TXT_0086
FROM:
Проверка займет время.
TO:
Проверка займёт время. Результат появится позже.

TXT_0092
FROM:
ВПИСЫВАЙСЯ
TO:
Можно присоединиться к голосованию.

TXT_0093
FROM:
ТЫКНИ ИМЯ
TO:
Выберите имя.

TXT_0098
FROM:
RIP
TO:
Поражение.

TXT_0100
FROM:
Ты вывез.
TO:
Вы справились.

TXT_0101
FROM:
Не вывез.
TO:
Не получилось.

TXT_0102
FROM:
Ничья. Все шумели зря.
TO:
Ничья. Решение не изменилось.

TXT_0106
FROM:
Андер просел.
TO:
Меньшинство получило отрицательный итог.

TXT_0108
FROM:
лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐.
TO:
Есть недельный лимит ⭐. Лучше проверить 💰 перед конвертацией.

TXT_0109
FROM:
Cap: max Points на этой неделе. Используйте, пока не сбросили cap.
TO:
Есть недельный лимит 💰. Лучше использовать ресурс до сброса.

TXT_0111
FROM:
Опасная точка рядом.
TO:
Рядом есть риск. Лучше проверить ситуацию.

TXT_0116
FROM:
Занят расследованием, связь позже.
TO:
Сейчас идёт расследование. Связь будет позже.

TXT_0118
FROM:
«Сдать» без фактов — шум.
TO:
Без фактов проверка может не подтвердиться.

TXT_0130
FROM:
слабый ход
TO:
Этот ход может сработать хуже.

TXT_0131
FROM:
отвечай сейчас
TO:
Можно ответить сейчас.

TXT_0132
FROM:
кошелек ближе
TO:
Есть риск потерять 💰.

TXT_0133
FROM:
плати и уходи
TO:
Можно заплатить и выйти из конфликта.

TXT_0138
FROM:
Тише. Решим.
TO:
Спокойнее. Сначала проверим ситуацию.

TXT_0139
FROM:
Кошелек ближе.
TO:
Есть риск потерять 💰.

TXT_0140
FROM:
Слабый ход.
TO:
Этот ход может сработать хуже.

TXT_0142
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Лучше проверить баланс.

TXT_0144
FROM:
Недоступно. Баттл не завершён.
TO:
Пока недоступно. Конфликт ещё не завершён.

TXT_0145
FROM:
Недоступно.
TO:
Пока недоступно. Лучше проверить условия.

TXT_0147
FROM:
Такого нет.
TO:
Игрок не найден. Лучше проверить имя.

TXT_0148
FROM:
Кулдаун активен.
TO:
Кулдаун активен. Повторить можно позже.

TXT_0149
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Лучше проверить баланс.

TXT_0150
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Лучше проверить баланс перед уважением.

TXT_0151
FROM:
Уже было уважение сегодня этому персонажу.
TO:
Уважение этому персонажу сегодня уже было. Повторить можно позже.

TXT_0152
FROM:
Цепочка A->B->A сегодня не работает.
TO:
Сегодня эта цепочка не сработает. Лучше выбрать другой ход.

TXT_0153
FROM:
Лимит уважения на сегодня исчерпан.
TO:
Лимит уважения на сегодня исчерпан. Повторить можно позже.

TXT_0154
FROM:
Сейчас не получилось. Попробуй позже.
TO:
Сейчас не получилось. Есть шанс повторить позже.

TXT_0160
FROM:
Рано. Дай паузу.
TO:
Пока рано. Лучше подождать немного.

TXT_0161
FROM:
Недоступно.
TO:
Пока недоступно. Лучше проверить условия.

TXT_0162
FROM:
Недоступно.
TO:
Пока недоступно. Лучше проверить условия.

TXT_0163
FROM:
Недоступно.
TO:
Пока недоступно. Лучше проверить условия.

TXT_0164
FROM:
Не хватает 💰.
TO:
Не хватает 💰. Лучше проверить баланс.
