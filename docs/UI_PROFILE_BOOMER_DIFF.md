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
