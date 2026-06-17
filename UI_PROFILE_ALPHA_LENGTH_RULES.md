# UI_PROFILE_ALPHA_LENGTH_RULES

- Contract scope: UI-layer Alpha length rules only.
- Smoke command: `Game.__DEV.smokeAlphaStep13LengthRulesOnce()`
- buildTag: `build_2026_06_17_step4_alpha_profile_step1_3_length_rules_v1`
- commit: `step4_alpha_profile_step1_3_length_rules_v1`
- smokeVersion: `alpha_step_1_3_length_rules_v20260617_001`
- Required fields: `id`, `oldText`, `alphaText`, `sourceFile`, `sourceLine`, `key`, `category`, `profile`, `measurementClass`.
- Fixed metadata: `sourceFile=UI_PROFILE_ALPHA_LENGTH_RULES.md`, `key=id`, `category=alpha_length_rules`, `profile=alpha`.
- This is a measurable rule, not a visual guess.
- This step does not activate runtime Alpha copy.
- Codex is not allowed to invent Alpha phrasing.
- Measurable compression probe IDs for this step: `TXT_0003`, `TXT_0004`, `TXT_0006`, `TXT_0019`, `TXT_0024`, `TXT_0029`, `TXT_0042`, `TXT_0044`, `TXT_0045`, `TXT_0057`, `TXT_0058`, `TXT_0060`, `TXT_0074`, `TXT_0081`, `TXT_0083`, `TXT_0100`, `TXT_0103`, `TXT_0104`, `TXT_0141`, `TXT_0143`, `TXT_0160`.

## Measurement Rules

- `compressible`: normalized `alphaText` length must be 20-35 percent shorter than normalized `oldText` length for the measurable compression probe IDs listed above. Other `compressible` rows in this step are still exact Alpha replacements, but they are not the numeric probe set for this length-rule smoke because they rely on symbol compression, single-token swaps, or ultra-short UI copy.
- `atomic`: no reduction is required because the phrase is a title, icon, number delta, one-word button, fixed dev text, or already minimal.
- `template`: all variables from `oldText` must be preserved exactly in `alphaText`.
- `fixed`: `alphaText` may equal `oldText` because the value is a title, stable token, or fixed UI label.

| id | oldText | alphaText | sourceFile | sourceLine | key | category | profile | measurementClass |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TXT_0001 | AsyncScene | AsyncScene | UI_PROFILE_ALPHA_LENGTH_RULES.md | 24 | TXT_0001 | alpha_length_rules | alpha | fixed |
| TXT_0002 | AsyncScene | AsyncScene | UI_PROFILE_ALPHA_LENGTH_RULES.md | 25 | TXT_0002 | alpha_length_rules | alpha | fixed |
| TXT_0003 | Оппонент задаёт риск. | Оппонент: риск. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 26 | TXT_0003 | alpha_length_rules | alpha | compressible |
| TXT_0004 | Ставка списывает ресурс. | Ставка списывает. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 27 | TXT_0004 | alpha_length_rules | alpha | compressible |
| TXT_0005 | Итог виден сразу. | Итог сразу. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 28 | TXT_0005 | alpha_length_rules | alpha | compressible |
| TXT_0006 | Цена и итог сразу. | Цена + итог. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 29 | TXT_0006 | alpha_length_rules | alpha | compressible |
| TXT_0007 | Старт | Старт | UI_PROFILE_ALPHA_LENGTH_RULES.md | 30 | TXT_0007 | alpha_length_rules | alpha | atomic |
| TXT_0008 | Суть | Суть | UI_PROFILE_ALPHA_LENGTH_RULES.md | 31 | TXT_0008 | alpha_length_rules | alpha | atomic |
| TXT_0009 | Последние 2 цифры года рождения | 2 цифры года | UI_PROFILE_ALPHA_LENGTH_RULES.md | 32 | TXT_0009 | alpha_length_rules | alpha | compressible |
| TXT_0010 | Увеличить первую цифру | + первая | UI_PROFILE_ALPHA_LENGTH_RULES.md | 33 | TXT_0010 | alpha_length_rules | alpha | compressible |
| TXT_0011 | Уменьшить первую цифру | - первая | UI_PROFILE_ALPHA_LENGTH_RULES.md | 34 | TXT_0011 | alpha_length_rules | alpha | compressible |
| TXT_0012 | Увеличить вторую цифру | + вторая | UI_PROFILE_ALPHA_LENGTH_RULES.md | 35 | TXT_0012 | alpha_length_rules | alpha | compressible |
| TXT_0013 | Уменьшить вторую цифру | - вторая | UI_PROFILE_ALPHA_LENGTH_RULES.md | 36 | TXT_0013 | alpha_length_rules | alpha | compressible |
| TXT_0014 | Только для интерфейса. Не сохраняем. Можно поменять позже. | Только UI. Не сохраняем. Смена позже. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 37 | TXT_0014 | alpha_length_rules | alpha | compressible |
| TXT_0015 | я на самом деле чувствую будто я родился в … | чувствую год: … | UI_PROFILE_ALPHA_LENGTH_RULES.md | 38 | TXT_0015 | alpha_length_rules | alpha | compressible |
| TXT_0016 | Продолжить | Далее | UI_PROFILE_ALPHA_LENGTH_RULES.md | 39 | TXT_0016 | alpha_length_rules | alpha | compressible |
| TXT_0017 | Старт | Старт | UI_PROFILE_ALPHA_LENGTH_RULES.md | 40 | TXT_0017 | alpha_length_rules | alpha | atomic |
| TXT_0018 | Сбросить старт | Сброс | UI_PROFILE_ALPHA_LENGTH_RULES.md | 41 | TXT_0018 | alpha_length_rules | alpha | compressible |
| TXT_0019 | Погнали | Старт | UI_PROFILE_ALPHA_LENGTH_RULES.md | 42 | TXT_0019 | alpha_length_rules | alpha | compressible |
| TXT_0020 | Снести выбор | Сброс | UI_PROFILE_ALPHA_LENGTH_RULES.md | 43 | TXT_0020 | alpha_length_rules | alpha | compressible |
| TXT_0021 | Правила без душноты | Правила | UI_PROFILE_ALPHA_LENGTH_RULES.md | 44 | TXT_0021 | alpha_length_rules | alpha | compressible |
| TXT_0022 | Войти | Вход | UI_PROFILE_ALPHA_LENGTH_RULES.md | 45 | TXT_0022 | alpha_length_rules | alpha | atomic |
| TXT_0023 | Готово. | Готово. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 46 | TXT_0023 | alpha_length_rules | alpha | atomic |
| TXT_0024 | Сообщение недоступно. | Нет сообщения. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 47 | TXT_0024 | alpha_length_rules | alpha | compressible |
| TXT_0025 | Не хватает 💰. | Мало 💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 48 | TXT_0025 | alpha_length_rules | alpha | compressible |
| TXT_0026 | Мало 💰 на баттл. | Мало 💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 49 | TXT_0026 | alpha_length_rules | alpha | compressible |
| TXT_0027 | Недоступно. | Нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 50 | TXT_0027 | alpha_length_rules | alpha | compressible |
| TXT_0028 | Не найдено. | Нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 51 | TXT_0028 | alpha_length_rules | alpha | compressible |
| TXT_0029 | Игрок не указан. | Нужен игрок. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 52 | TXT_0029 | alpha_length_rules | alpha | compressible |
| TXT_0030 | Штраф: -5 💰. | -5💰 штраф. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 53 | TXT_0030 | alpha_length_rules | alpha | compressible |
| TXT_0031 | Ввод некорректен. | Ввод неверный. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 54 | TXT_0031 | alpha_length_rules | alpha | compressible |
| TXT_0032 | Кулдаун активен. | Кулдаун. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 55 | TXT_0032 | alpha_length_rules | alpha | compressible |
| TXT_0033 | Проверка займет время. | Проверка ждёт. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 56 | TXT_0033 | alpha_length_rules | alpha | compressible |
| TXT_0034 | +1💰 | +1💰 | UI_PROFILE_ALPHA_LENGTH_RULES.md | 57 | TXT_0034 | alpha_length_rules | alpha | atomic |
| TXT_0035 | +1⭐ | +1⭐ | UI_PROFILE_ALPHA_LENGTH_RULES.md | 58 | TXT_0035 | alpha_length_rules | alpha | atomic |
| TXT_0036 | Голос учтён. | Голос есть. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 59 | TXT_0036 | alpha_length_rules | alpha | compressible |
| TXT_0037 | Проверяю. | Проверка. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 60 | TXT_0037 | alpha_length_rules | alpha | atomic |
| TXT_0038 | Сдать {name}: +2💰. | {name}: +2💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 61 | TXT_0038 | alpha_length_rules | alpha | template |
| TXT_0039 | Коп: {name} сдан, +2💰. | {name} сдан: +2💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 62 | TXT_0039 | alpha_length_rules | alpha | template |
| TXT_0040 | Аргумент: {teacher} → {student}. | {teacher} → {student}: аргумент. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 63 | TXT_0040 | alpha_length_rules | alpha | template |
| TXT_0041 | {name} зовёт на реванш. | {name}: реванш. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 64 | TXT_0041 | alpha_length_rules | alpha | template |
| TXT_0042 | Свалить за 1💰. | Выход: 1💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 65 | TXT_0042 | alpha_length_rules | alpha | compressible |
| TXT_0043 | +1💰 возврат. | +1💰 назад. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 66 | TXT_0043 | alpha_length_rules | alpha | compressible |
| TXT_0044 | +1💰 возврат большинству. | +1💰 большинству. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 67 | TXT_0044 | alpha_length_rules | alpha | compressible |
| TXT_0045 | +1💰 остаток победителю. | +1💰 победителю. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 68 | TXT_0045 | alpha_length_rules | alpha | compressible |
| TXT_0046 | Реванш: -{rematchCost}💰. | Реванш -{rematchCost}💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 69 | TXT_0046 | alpha_length_rules | alpha | template |
| TXT_0047 | Свалить: -{escapeCost}💰. | Выход -{escapeCost}💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 70 | TXT_0047 | alpha_length_rules | alpha | template |
| TXT_0048 | {target}: +{amount}💰. | {target}: +{amount}💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 71 | TXT_0048 | alpha_length_rules | alpha | template |
| TXT_0049 | {target}: +{amount}💰 тебе. | От {target}: +{amount}💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 72 | TXT_0049 | alpha_length_rules | alpha | template |
| TXT_0050 | {attackerName} [{attackerInf}] бросил вызов. | {attackerName} [{attackerInf}]: вызов. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 73 | TXT_0050 | alpha_length_rules | alpha | template |
| TXT_0051 | Баттл с {oppName}: {text}. | {oppName}: {text}. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 74 | TXT_0051 | alpha_length_rules | alpha | template |
| TXT_0052 | {a} и {b}: ничья. | {a}/{b}: ничья. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 75 | TXT_0052 | alpha_length_rules | alpha | template |
| TXT_0053 | Толпа: {name} {aVotes}:{bVotes}. | {name}: {aVotes}:{bVotes}. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 76 | TXT_0053 | alpha_length_rules | alpha | template |
| TXT_0054 | Оранжевые аргументы открыты. | Оранжевые открыты. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 77 | TXT_0054 | alpha_length_rules | alpha | compressible |
| TXT_0055 | Красные аргументы открыты. | Красные открыты. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 78 | TXT_0055 | alpha_length_rules | alpha | compressible |
| TXT_0056 | Чёрные аргументы открыты. | Чёрные открыты. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 79 | TXT_0056 | alpha_length_rules | alpha | compressible |
| TXT_0057 | Оппонент задаёт риск. | Оппонент: риск. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 80 | TXT_0057 | alpha_length_rules | alpha | compressible |
| TXT_0058 | Ставка списывает ресурс. | Ставка списывает. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 81 | TXT_0058 | alpha_length_rules | alpha | compressible |
| TXT_0059 | Итог виден сразу. | Итог сразу. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 82 | TXT_0059 | alpha_length_rules | alpha | compressible |
| TXT_0060 | Цена и итог сразу. | Цена + итог. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 83 | TXT_0060 | alpha_length_rules | alpha | compressible |
| TXT_0061 | Меню | Меню | UI_PROFILE_ALPHA_LENGTH_RULES.md | 84 | TXT_0061 | alpha_length_rules | alpha | atomic |
| TXT_0062 | К старту | Старт | UI_PROFILE_ALPHA_LENGTH_RULES.md | 85 | TXT_0062 | alpha_length_rules | alpha | compressible |
| TXT_0063 | Цель | Цель | UI_PROFILE_ALPHA_LENGTH_RULES.md | 86 | TXT_0063 | alpha_length_rules | alpha | atomic |
| TXT_0064 | Победа | WIN | UI_PROFILE_ALPHA_LENGTH_RULES.md | 87 | TXT_0064 | alpha_length_rules | alpha | compressible |
| TXT_0065 | Поражение | RIP | UI_PROFILE_ALPHA_LENGTH_RULES.md | 88 | TXT_0065 | alpha_length_rules | alpha | compressible |
| TXT_0066 | Толпа решает | Толпа. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 89 | TXT_0066 | alpha_length_rules | alpha | compressible |
| TXT_0067 | Вы победили в конфликте. | Победа. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 90 | TXT_0067 | alpha_length_rules | alpha | compressible |
| TXT_0068 | Вы проиграли конфликт. | Поражение. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 91 | TXT_0068 | alpha_length_rules | alpha | compressible |
| TXT_0069 | Конфликт завершился ничьей. | Ничья. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 92 | TXT_0069 | alpha_length_rules | alpha | compressible |
| TXT_0070 | Свалить: {X} | Выход: {X} | UI_PROFILE_ALPHA_LENGTH_RULES.md | 93 | TXT_0070 | alpha_length_rules | alpha | template |
| TXT_0071 | Для {student}: {arg}. Цена {cost} 💰. | {student}: {arg}. -{cost}💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 94 | TXT_0071 | alpha_length_rules | alpha | template |
| TXT_0072 | Аргумент: {teacher} → {student}. | {teacher} → {student}: аргумент. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 95 | TXT_0072 | alpha_length_rules | alpha | template |
| TXT_0073 | Введи точный ник. | Точный ник. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 96 | TXT_0073 | alpha_length_rules | alpha | compressible |
| TXT_0074 | Игрок не найден. | Игрока нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 97 | TXT_0074 | alpha_length_rules | alpha | compressible |
| TXT_0075 | Меню | Меню | UI_PROFILE_ALPHA_LENGTH_RULES.md | 98 | TXT_0075 | alpha_length_rules | alpha | atomic |
| TXT_0076 | К старту | Старт | UI_PROFILE_ALPHA_LENGTH_RULES.md | 99 | TXT_0076 | alpha_length_rules | alpha | compressible |
| TXT_0077 | Недоступно. | Нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 100 | TXT_0077 | alpha_length_rules | alpha | compressible |
| TXT_0078 | Цель | Цель | UI_PROFILE_ALPHA_LENGTH_RULES.md | 101 | TXT_0078 | alpha_length_rules | alpha | atomic |
| TXT_0079 | Понял. Проверяю. | Принял. Проверка. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 102 | TXT_0079 | alpha_length_rules | alpha | compressible |
| TXT_0080 | Принял. Разберусь. | Принял. Разбор. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 103 | TXT_0080 | alpha_length_rules | alpha | compressible |
| TXT_0081 | Занят, связь позже. | Занят. Позже. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 104 | TXT_0081 | alpha_length_rules | alpha | compressible |
| TXT_0082 | Не могу, оформляю дело. | Занят делом. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 105 | TXT_0082 | alpha_length_rules | alpha | compressible |
| TXT_0083 | Проверка сошлась. Вмешался. | Сошлось. Вмешался. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 106 | TXT_0083 | alpha_length_rules | alpha | compressible |
| TXT_0084 | Проверка сошлась. Занялся. | Сошлось. В деле. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 107 | TXT_0084 | alpha_length_rules | alpha | compressible |
| TXT_0085 | Не подтвердилось. Факты не сошлись. | Не сошлось. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 108 | TXT_0085 | alpha_length_rules | alpha | compressible |
| TXT_0086 | Проверка займет время. | Проверка ждёт. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 109 | TXT_0086 | alpha_length_rules | alpha | compressible |
| TXT_0087 | Ответь: кто? | Кто? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 110 | TXT_0087 | alpha_length_rules | alpha | compressible |
| TXT_0088 | Ответь: где? | Где? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 111 | TXT_0088 | alpha_length_rules | alpha | compressible |
| TXT_0089 | Ответь: о ком? | О ком? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 112 | TXT_0089 | alpha_length_rules | alpha | compressible |
| TXT_0090 | Ответь: да или нет? | Да/нет? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 113 | TXT_0090 | alpha_length_rules | alpha | compressible |
| TXT_0091 | ТОЛПА | ТОЛПА | UI_PROFILE_ALPHA_LENGTH_RULES.md | 114 | TXT_0091 | alpha_length_rules | alpha | atomic |
| TXT_0092 | ВПИСЫВАЙСЯ | ВХОД | UI_PROFILE_ALPHA_LENGTH_RULES.md | 115 | TXT_0092 | alpha_length_rules | alpha | compressible |
| TXT_0093 | ТЫКНИ ИМЯ | ИМЯ | UI_PROFILE_ALPHA_LENGTH_RULES.md | 116 | TXT_0093 | alpha_length_rules | alpha | compressible |
| TXT_0094 | ✓ ОК | ✓ ОК | UI_PROFILE_ALPHA_LENGTH_RULES.md | 117 | TXT_0094 | alpha_length_rules | alpha | atomic |
| TXT_0095 | ✓ УЖЕ | ✓ УЖЕ | UI_PROFILE_ALPHA_LENGTH_RULES.md | 118 | TXT_0095 | alpha_length_rules | alpha | atomic |
| TXT_0096 | ✕ НЕ | ✕ НЕ | UI_PROFILE_ALPHA_LENGTH_RULES.md | 119 | TXT_0096 | alpha_length_rules | alpha | atomic |
| TXT_0097 | WIN | WIN | UI_PROFILE_ALPHA_LENGTH_RULES.md | 120 | TXT_0097 | alpha_length_rules | alpha | atomic |
| TXT_0098 | RIP | RIP | UI_PROFILE_ALPHA_LENGTH_RULES.md | 121 | TXT_0098 | alpha_length_rules | alpha | atomic |
| TXT_0099 | DRAW | DRAW | UI_PROFILE_ALPHA_LENGTH_RULES.md | 122 | TXT_0099 | alpha_length_rules | alpha | atomic |
| TXT_0100 | Ты вывез. | Вывез. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 123 | TXT_0100 | alpha_length_rules | alpha | compressible |
| TXT_0101 | Не вывез. | Мимо. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 124 | TXT_0101 | alpha_length_rules | alpha | compressible |
| TXT_0102 | Ничья. Все шумели зря. | Ничья. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 125 | TXT_0102 | alpha_length_rules | alpha | compressible |
| TXT_0103 | Ты в мейне. | В мейне. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 126 | TXT_0103 | alpha_length_rules | alpha | compressible |
| TXT_0104 | Ты в андере. | В андере. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 127 | TXT_0104 | alpha_length_rules | alpha | compressible |
| TXT_0105 | Мейн забрал. | Мейн. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 128 | TXT_0105 | alpha_length_rules | alpha | compressible |
| TXT_0106 | Андер просел. | Андер. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 129 | TXT_0106 | alpha_length_rules | alpha | compressible |
| TXT_0107 | Драма закрыта. | Закрыто. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 130 | TXT_0107 | alpha_length_rules | alpha | compressible |
| TXT_0108 | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | Лимит ⭐. Пополни 💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 131 | TXT_0108 | alpha_length_rules | alpha | compressible |
| TXT_0109 | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | Cap Points. Используй. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 132 | TXT_0109 | alpha_length_rules | alpha | compressible |
| TXT_0110 | {cop.fullName} на связи. | {cop.fullName}: связь. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 133 | TXT_0110 | alpha_length_rules | alpha | template |
| TXT_0111 | Опасная точка рядом. | Риск рядом. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 134 | TXT_0111 | alpha_length_rules | alpha | compressible |
| TXT_0112 | Вызов принят, экипаж в пути. | Вызов принят. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 135 | TXT_0112 | alpha_length_rules | alpha | compressible |
| TXT_0113 | Ситуация под контролем. | Контроль. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 136 | TXT_0113 | alpha_length_rules | alpha | compressible |
| TXT_0114 | Принято, наблюдаю. | Принято. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 137 | TXT_0114 | alpha_length_rules | alpha | compressible |
| TXT_0115 | Факт принят, идем дальше. | Факт принят. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 138 | TXT_0115 | alpha_length_rules | alpha | compressible |
| TXT_0116 | Занят расследованием, связь позже. | Занят. Позже. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 139 | TXT_0116 | alpha_length_rules | alpha | compressible |
| TXT_0117 | Сдача принята \u2014 спокойнее. | Сдача принята. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 140 | TXT_0117 | alpha_length_rules | alpha | compressible |
| TXT_0118 | «Сдать» без фактов \u2014 шум. | «Сдать» без фактов. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 141 | TXT_0118 | alpha_length_rules | alpha | compressible |
| TXT_0119 | Кто сегодня на слуху, если не ошибаюсь? | Кто на слуху? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 142 | TXT_0119 | alpha_length_rules | alpha | compressible |
| TXT_0120 | Кажется, про {NAME} говорят. | Про {NAME}. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 143 | TXT_0120 | alpha_length_rules | alpha | template |
| TXT_0121 | Кто, как вам кажется, был рядом? | Кто был рядом? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 144 | TXT_0121 | alpha_length_rules | alpha | compressible |
| TXT_0122 | {NAME}. | {NAME}. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 145 | TXT_0122 | alpha_length_rules | alpha | template |
| TXT_0123 | Где мы сейчас, как вам кажется? | Где сейчас? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 146 | TXT_0123 | alpha_length_rules | alpha | compressible |
| TXT_0124 | Здесь. | Здесь. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 147 | TXT_0124 | alpha_length_rules | alpha | atomic |
| TXT_0125 | Вы уверены? | Уверен? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 148 | TXT_0125 | alpha_length_rules | alpha | compressible |
| TXT_0126 | Да. | Да. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 149 | TXT_0126 | alpha_length_rules | alpha | atomic |
| TXT_0127 | Кто сегодня на слуху? | Кто на слуху? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 150 | TXT_0127 | alpha_length_rules | alpha | compressible |
| TXT_0128 | Про {NAME} говорят. | Про {NAME}. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 151 | TXT_0128 | alpha_length_rules | alpha | template |
| TXT_0129 | Вы уверены? | Уверен? | UI_PROFILE_ALPHA_LENGTH_RULES.md | 152 | TXT_0129 | alpha_length_rules | alpha | compressible |
| TXT_0130 | слабый ход | слабо | UI_PROFILE_ALPHA_LENGTH_RULES.md | 153 | TXT_0130 | alpha_length_rules | alpha | compressible |
| TXT_0131 | отвечай сейчас | отвечай | UI_PROFILE_ALPHA_LENGTH_RULES.md | 154 | TXT_0131 | alpha_length_rules | alpha | compressible |
| TXT_0132 | кошелек ближе | кошелек | UI_PROFILE_ALPHA_LENGTH_RULES.md | 155 | TXT_0132 | alpha_length_rules | alpha | compressible |
| TXT_0133 | плати и уходи | плати. уходи | UI_PROFILE_ALPHA_LENGTH_RULES.md | 156 | TXT_0133 | alpha_length_rules | alpha | compressible |
| TXT_0134 | Принято. Дистанция | Принято. Дистанция | UI_PROFILE_ALPHA_LENGTH_RULES.md | 157 | TXT_0134 | alpha_length_rules | alpha | atomic |
| TXT_0135 | Тише | Тише | UI_PROFILE_ALPHA_LENGTH_RULES.md | 158 | TXT_0135 | alpha_length_rules | alpha | atomic |
| TXT_0136 | ого | ого | UI_PROFILE_ALPHA_LENGTH_RULES.md | 159 | TXT_0136 | alpha_length_rules | alpha | atomic |
| TXT_0137 | Принято. Я рядом. | Принято. Рядом. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 160 | TXT_0137 | alpha_length_rules | alpha | compressible |
| TXT_0138 | Тише. Решим. | Тише. Решим. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 161 | TXT_0138 | alpha_length_rules | alpha | atomic |
| TXT_0139 | Кошелек ближе. | Кошелек. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 162 | TXT_0139 | alpha_length_rules | alpha | compressible |
| TXT_0140 | Слабый ход. | Слабый ход. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 163 | TXT_0140 | alpha_length_rules | alpha | atomic |
| TXT_0141 | Ты уже проголосовал. | Голос уже есть. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 164 | TXT_0141 | alpha_length_rules | alpha | compressible |
| TXT_0142 | Не хватает 💰. | Мало 💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 165 | TXT_0142 | alpha_length_rules | alpha | compressible |
| TXT_0143 | Реванш уже запрошен. | Реванш уже есть. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 166 | TXT_0143 | alpha_length_rules | alpha | compressible |
| TXT_0144 | Недоступно. Баттл не завершён. | Баттл не закрыт. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 167 | TXT_0144 | alpha_length_rules | alpha | compressible |
| TXT_0145 | Недоступно. | Нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 168 | TXT_0145 | alpha_length_rules | alpha | compressible |
| TXT_0146 | Выбери игрока. | Выбери игрока. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 169 | TXT_0146 | alpha_length_rules | alpha | atomic |
| TXT_0147 | Такого нет. | Нет такого. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 170 | TXT_0147 | alpha_length_rules | alpha | atomic |
| TXT_0148 | Кулдаун активен. | Кулдаун. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 171 | TXT_0148 | alpha_length_rules | alpha | compressible |
| TXT_0149 | Не хватает 💰. | Мало 💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 172 | TXT_0149 | alpha_length_rules | alpha | compressible |
| TXT_0150 | Не хватает 💰. | Мало 💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 173 | TXT_0150 | alpha_length_rules | alpha | compressible |
| TXT_0151 | Уже было уважение сегодня этому персонажу. | Уважение уже было. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 174 | TXT_0151 | alpha_length_rules | alpha | compressible |
| TXT_0152 | Цепочка A->B->A сегодня не работает. | A->B->A закрыто. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 175 | TXT_0152 | alpha_length_rules | alpha | compressible |
| TXT_0153 | Лимит уважения на сегодня исчерпан. | Лимит уважения. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 176 | TXT_0153 | alpha_length_rules | alpha | compressible |
| TXT_0154 | Сейчас не получилось. Попробуй позже. | Не вышло. Позже. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 177 | TXT_0154 | alpha_length_rules | alpha | compressible |
| TXT_0155 | Ты отдал 1💰 | -1💰 от тебя. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 178 | TXT_0155 | alpha_length_rules | alpha | compressible |
| TXT_0156 | Цель получила +1 ⭐ | Цель: +1⭐. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 179 | TXT_0156 | alpha_length_rules | alpha | compressible |
| TXT_0157 | Dev Mode disabled. | Dev off. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 180 | TXT_0157 | alpha_length_rules | alpha | compressible |
| TXT_0158 | Dev Mode unlocked on this device. | Dev unlocked. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 181 | TXT_0158 | alpha_length_rules | alpha | compressible |
| TXT_0159 | Incorrect Dev Mode PIN. | Wrong PIN. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 182 | TXT_0159 | alpha_length_rules | alpha | compressible |
| TXT_0160 | Рано. Дай паузу. | Рано. Пауза. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 183 | TXT_0160 | alpha_length_rules | alpha | compressible |
| TXT_0161 | Недоступно. | Нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 184 | TXT_0161 | alpha_length_rules | alpha | compressible |
| TXT_0162 | Недоступно. | Нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 185 | TXT_0162 | alpha_length_rules | alpha | compressible |
| TXT_0163 | Недоступно. | Нет. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 186 | TXT_0163 | alpha_length_rules | alpha | compressible |
| TXT_0164 | Не хватает 💰. | Мало 💰. | UI_PROFILE_ALPHA_LENGTH_RULES.md | 187 | TXT_0164 | alpha_length_rules | alpha | compressible |
