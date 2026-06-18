window.Game = window.Game || {};
(function () {
  const parseRows = (text) => String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^TXT_(\d{4}) \| (.*?) \| (.*?) \| (.*?) \| (.*)$/);
      if (!match) return null;
      return Object.freeze({
        id: `TXT_${match[1]}`,
        sourceText: match[2],
        alphaText: match[3],
        status: match[4],
        reason: match[5]
      });
    })
    .filter(Boolean);

  const RAW_ROWS = String.raw`TXT_0001 | AsyncScene | AsyncScene | SKIP_BRAND_OR_TOKEN | brand token
TXT_0002 | AsyncScene | AsyncScene | SKIP_BRAND_OR_TOKEN | brand token
TXT_0003 | Оппонент задаёт риск. | Риск задан | COMPRESS | risk first
TXT_0004 | Ставка списывает ресурс. | Ресурс списан | COMPRESS | result first
TXT_0005 | Итог виден сразу. | Итог виден | COMPRESS | result first
TXT_0006 | Цена и итог сразу. | Цена и итог | COMPRESS | result first
TXT_0007 | Старт | Старт | SKIP_ALREADY_ATOMIC | one word action
TXT_0008 | Суть | Суть | SKIP_ALREADY_ATOMIC | one word label
TXT_0009 | Последние 2 цифры года рождения | Цифры года | COMPRESS | label shortened
TXT_0010 | Увеличить первую цифру | Цифру выше | COMPRESS | action first
TXT_0011 | Уменьшить первую цифру | Цифру ниже | COMPRESS | action first
TXT_0012 | Увеличить вторую цифру | Цифру выше | COMPRESS | action first
TXT_0013 | Уменьшить вторую цифру | Цифру ниже | COMPRESS | action first
TXT_0014 | Только для интерфейса. Не сохраняем. Можно поменять позже. | Интерфейс без сохранения | COMPRESS | intro removed
TXT_0015 | я на самом деле чувствую будто я родился в … | Год по ощущению | COMPRESS | intro removed
TXT_0016 | Продолжить | Продолжить | SKIP_ALREADY_ATOMIC | one word action
TXT_0017 | Старт | Старт | SKIP_ALREADY_ATOMIC | one word action
TXT_0018 | Сбросить старт | Сбросить старт | SKIP_ALREADY_ATOMIC | two word action
TXT_0019 | Погнали | Погнали | SKIP_ALREADY_ATOMIC | one word source token
TXT_0020 | Снести выбор | Снести выбор | SKIP_ALREADY_ATOMIC | two word action
TXT_0021 | Правила без душноты | Правила кратко | COMPRESS | slang removed
TXT_0022 | Войти | Войти | SKIP_ALREADY_ATOMIC | one word action
TXT_0023 | Готово. | Готово. | SKIP_ALREADY_ATOMIC | one word status
TXT_0024 | Сообщение недоступно. | Сообщение недоступно. | SKIP_ALREADY_ATOMIC | two word status
TXT_0025 | Не хватает 💰. | Не хватает 💰. | SKIP_ALREADY_ATOMIC | short resource status
TXT_0026 | Мало 💰 на баттл. | Мало 💰 | COMPRESS | resource first
TXT_0027 | Недоступно. | Недоступно. | SKIP_ALREADY_ATOMIC | one word status
TXT_0028 | Не найдено. | Не найдено. | SKIP_ALREADY_ATOMIC | two word status
TXT_0029 | Игрок не указан. | Нет игрока | COMPRESS | fact first
TXT_0030 | Штраф: -5 💰. | Штраф: -5 💰. | SKIP_BRAND_OR_TOKEN | numeric penalty token
TXT_0031 | Ввод некорректен. | Ввод некорректен. | SKIP_ALREADY_ATOMIC | two word status
TXT_0032 | Кулдаун активен. | Кулдаун активен. | SKIP_ALREADY_ATOMIC | two word status
TXT_0033 | Проверка займет время. | Проверка ждёт | COMPRESS | action shortened
TXT_0034 | +1💰 | +1💰 | SKIP_BRAND_OR_TOKEN | numeric delta token
TXT_0035 | +1⭐ | +1⭐ | SKIP_BRAND_OR_TOKEN | numeric delta token
TXT_0036 | Голос учтён. | Голос учтён. | SKIP_ALREADY_ATOMIC | two word status
TXT_0037 | Проверяю. | Проверяю. | SKIP_ALREADY_ATOMIC | one word action
TXT_0038 | Сдать {name}: +2💰. | Сдать {name}: +2💰. | SKIP_BRAND_OR_TOKEN | action reward token
TXT_0039 | Коп: {name} сдан, +2💰. | {name} сдан | COMPRESS | result first
TXT_0040 | Аргумент: {teacher} → {student}. | Аргумент: {teacher} → {student}. | SKIP_BRAND_OR_TOKEN | relation token
TXT_0041 | {name} зовёт на реванш. | Реванш от {name} | COMPRESS | action first
TXT_0042 | Свалить за 1💰. | Выход: 1💰 | COMPRESS | action first
TXT_0043 | +1💰 возврат. | +1💰 возврат. | SKIP_BRAND_OR_TOKEN | numeric delta token
TXT_0044 | +1💰 возврат большинству. | +1💰 большинству | COMPRESS | result first
TXT_0045 | +1💰 остаток победителю. | +1💰 победителю | COMPRESS | result first
TXT_0046 | Реванш: -{rematchCost}💰. | Реванш: -{rematchCost}💰. | SKIP_BRAND_OR_TOKEN | cost token
TXT_0047 | Свалить: -{escapeCost}💰. | Свалить: -{escapeCost}💰. | SKIP_BRAND_OR_TOKEN | cost token
TXT_0048 | {target}: +{amount}💰. | {target}: +{amount}💰. | SKIP_BRAND_OR_TOKEN | transfer token
TXT_0049 | {target}: +{amount}💰 тебе. | +{amount}💰 тебе | COMPRESS | result first
TXT_0050 | {attackerName} [{attackerInf}] бросил вызов. | Вызов: {attackerName} | COMPRESS | action first
TXT_0051 | Баттл с {oppName}: {text}. | Баттл: {text} | COMPRESS | result first
TXT_0052 | {a} и {b}: ничья. | Ничья: {a}/{b} | COMPRESS | result first
TXT_0053 | Толпа: {name} {aVotes}:{bVotes}. | Толпа: {name} {aVotes}:{bVotes}. | SKIP_BRAND_OR_TOKEN | vote score token
TXT_0054 | Оранжевые аргументы открыты. | Оранжевые открыты | COMPRESS | result first
TXT_0055 | Красные аргументы открыты. | Красные открыты | COMPRESS | result first
TXT_0056 | Чёрные аргументы открыты. | Чёрные открыты | COMPRESS | result first
TXT_0057 | Оппонент задаёт риск. | Риск задан | COMPRESS | risk first
TXT_0058 | Ставка списывает ресурс. | Ресурс списан | COMPRESS | result first
TXT_0059 | Итог виден сразу. | Итог виден | COMPRESS | result first
TXT_0060 | Цена и итог сразу. | Цена и итог | COMPRESS | result first
TXT_0061 | Меню | Меню | SKIP_ALREADY_ATOMIC | one word label
TXT_0062 | К старту | К старту | SKIP_ALREADY_ATOMIC | two word navigation
TXT_0063 | Цель | Цель | SKIP_ALREADY_ATOMIC | one word label
TXT_0064 | Победа | Победа | SKIP_ALREADY_ATOMIC | one word result
TXT_0065 | Поражение | Поражение | SKIP_ALREADY_ATOMIC | one word result
TXT_0066 | Толпа решает | Толпа решает | SKIP_ALREADY_ATOMIC | two word result
TXT_0067 | Вы победили в конфликте. | Конфликт выигран | COMPRESS | result first
TXT_0068 | Вы проиграли конфликт. | Конфликт проигран | COMPRESS | result first
TXT_0069 | Конфликт завершился ничьей. | Конфликт: ничья | COMPRESS | result first
TXT_0070 | Свалить: {X} | Свалить: {X} | SKIP_BRAND_OR_TOKEN | cost token
TXT_0071 | Для {student}: {arg}. Цена {cost} 💰. | {student}: {arg}, {cost}💰 | COMPRESS | target and cost kept
TXT_0072 | Аргумент: {teacher} → {student}. | Аргумент {teacher}->{student} | COMPRESS | relation kept
TXT_0073 | Введи точный ник. | Точный ник | COMPRESS | input target first
TXT_0074 | Игрок не найден. | Игрока нет | COMPRESS | fact first
TXT_0075 | Меню | Меню | SKIP_ALREADY_ATOMIC | one word label
TXT_0076 | К старту | К старту | SKIP_ALREADY_ATOMIC | two word navigation
TXT_0077 | Недоступно. | Недоступно. | SKIP_ALREADY_ATOMIC | one word status
TXT_0078 | Цель | Цель | SKIP_ALREADY_ATOMIC | one word label
TXT_0079 | Понял. Проверяю. | Понял. Проверяю. | SKIP_ALREADY_ATOMIC | two word NPC status
TXT_0080 | Принял. Разберусь. | Принял. Разберусь. | SKIP_ALREADY_ATOMIC | two word NPC status
TXT_0081 | Занят, связь позже. | Связь позже | COMPRESS | status first
TXT_0082 | Не могу, оформляю дело. | Оформляю дело | COMPRESS | action first
TXT_0083 | Проверка сошлась. Вмешался. | Проверка сошлась | COMPRESS | result first
TXT_0084 | Проверка сошлась. Занялся. | Проверка сошлась | COMPRESS | result first
TXT_0085 | Не подтвердилось. Факты не сошлись. | Факты не сошлись | COMPRESS | fact first
TXT_0086 | Проверка займет время. | Проверка ждёт | COMPRESS | action shortened
TXT_0087 | Ответь: кто? | Ответь: кто? | SKIP_ALREADY_ATOMIC | two word hint
TXT_0088 | Ответь: где? | Ответь: где? | SKIP_ALREADY_ATOMIC | two word hint
TXT_0089 | Ответь: о ком? | О ком? | COMPRESS | target first
TXT_0090 | Ответь: да или нет? | Да или нет? | COMPRESS | answer shape first
TXT_0091 | ТОЛПА | ТОЛПА | SKIP_ALREADY_ATOMIC | one word alpha token
TXT_0092 | ВПИСЫВАЙСЯ | ВПИСЫВАЙСЯ | SKIP_ALREADY_ATOMIC | one word alpha token
TXT_0093 | ТЫКНИ ИМЯ | ТЫКНИ ИМЯ | SKIP_ALREADY_ATOMIC | two word alpha action
TXT_0094 | ✓ ОК | ✓ ОК | SKIP_BRAND_OR_TOKEN | icon button token
TXT_0095 | ✓ УЖЕ | ✓ УЖЕ | SKIP_BRAND_OR_TOKEN | icon button token
TXT_0096 | ✕ НЕ | ✕ НЕ | SKIP_BRAND_OR_TOKEN | icon button token
TXT_0097 | WIN | WIN | SKIP_BRAND_OR_TOKEN | result token
TXT_0098 | RIP | RIP | SKIP_BRAND_OR_TOKEN | result token
TXT_0099 | DRAW | DRAW | SKIP_BRAND_OR_TOKEN | result token
TXT_0100 | Ты вывез. | Ты вывез. | SKIP_ALREADY_ATOMIC | two word result
TXT_0101 | Не вывез. | Не вывез. | SKIP_ALREADY_ATOMIC | two word result
TXT_0102 | Ничья. Все шумели зря. | Ничья. Шум зря | COMPRESS | result first
TXT_0103 | Ты в мейне. | Мейн твой | COMPRESS | result first
TXT_0104 | Ты в андере. | Андер твой | COMPRESS | result first
TXT_0105 | Мейн забрал. | Мейн забрал. | SKIP_ALREADY_ATOMIC | two word result
TXT_0106 | Андер просел. | Андер просел. | SKIP_ALREADY_ATOMIC | two word result
TXT_0107 | Драма закрыта. | Драма закрыта. | SKIP_ALREADY_ATOMIC | two word result
TXT_0108 | лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐. | Лимит ⭐ недели | COMPRESS | limit first
TXT_0109 | Cap: max Points на этой неделе. Используйте, пока не сбросили cap. | Лимит Points недели | COMPRESS | limit first
TXT_0110 | {cop.fullName} на связи. | {cop.fullName} здесь | COMPRESS | speaker first
TXT_0111 | Опасная точка рядом. | Опасность рядом | COMPRESS | risk first
TXT_0112 | Вызов принят, экипаж в пути. | Экипаж в пути | COMPRESS | result first
TXT_0113 | Ситуация под контролем. | Контроль есть | COMPRESS | result first
TXT_0114 | Принято, наблюдаю. | Принято, наблюдаю. | SKIP_ALREADY_ATOMIC | two word NPC status
TXT_0115 | Факт принят, идем дальше. | Факт принят | COMPRESS | fact first
TXT_0116 | Занят расследованием, связь позже. | Связь позже | COMPRESS | status first
TXT_0117 | Сдача принята - спокойнее. | Сдача принята | COMPRESS | result first
TXT_0118 | «Сдать» без фактов - шум. | Нет фактов | COMPRESS | fact first
TXT_0119 | Кто сегодня на слуху, если не ошибаюсь? | Кто на слуху? | COMPRESS | intro removed
TXT_0120 | Кажется, про {NAME} говорят. | Про {NAME} говорят | COMPRESS | intro removed
TXT_0121 | Кто, как вам кажется, был рядом? | Кто был рядом? | COMPRESS | intro removed
TXT_0122 | {NAME}. | {NAME}. | SKIP_BRAND_OR_TOKEN | placeholder token
TXT_0123 | Где мы сейчас, как вам кажется? | Где мы? | COMPRESS | intro removed
TXT_0124 | Здесь. | Здесь. | SKIP_ALREADY_ATOMIC | one word answer
TXT_0125 | Вы уверены? | Вы уверены? | SKIP_ALREADY_ATOMIC | two word question
TXT_0126 | Да. | Да. | SKIP_ALREADY_ATOMIC | one word answer
TXT_0127 | Кто сегодня на слуху? | Кто на слуху? | COMPRESS | question shortened
TXT_0128 | Про {NAME} говорят. | Про {NAME} | COMPRESS | target first
TXT_0129 | Вы уверены? | Вы уверены? | SKIP_ALREADY_ATOMIC | two word question
TXT_0130 | слабый ход | слабый ход | SKIP_ALREADY_ATOMIC | two word NPC phrase
TXT_0131 | отвечай сейчас | отвечай сейчас | SKIP_ALREADY_ATOMIC | two word NPC phrase
TXT_0132 | кошелек ближе | кошелек ближе | SKIP_ALREADY_ATOMIC | two word NPC phrase
TXT_0133 | плати и уходи | Плати. Уходи | COMPRESS | action first
TXT_0134 | Принято. Дистанция | Принято. Дистанция | SKIP_ALREADY_ATOMIC | two word NPC phrase
TXT_0135 | Тише | Тише | SKIP_ALREADY_ATOMIC | one word NPC phrase
TXT_0136 | ого | ого | SKIP_ALREADY_ATOMIC | one word NPC phrase
TXT_0137 | Принято. Я рядом. | Я рядом | COMPRESS | status first
TXT_0138 | Тише. Решим. | Тише. Решим. | SKIP_ALREADY_ATOMIC | two word NPC phrase
TXT_0139 | Кошелек ближе. | Кошелек ближе. | SKIP_ALREADY_ATOMIC | two word NPC phrase
TXT_0140 | Слабый ход. | Слабый ход. | SKIP_ALREADY_ATOMIC | two word NPC phrase
TXT_0141 | Ты уже проголосовал. | Голос был | COMPRESS | result first
TXT_0142 | Не хватает 💰. | Мало 💰 | COMPRESS | resource first
TXT_0143 | Реванш уже запрошен. | Реванш был | COMPRESS | result first
TXT_0144 | Недоступно. Баттл не завершён. | Баттл не завершён | COMPRESS | reason first
TXT_0145 | Недоступно. | Недоступно. | SKIP_ALREADY_ATOMIC | one word status
TXT_0146 | Выбери игрока. | Выбери игрока. | SKIP_ALREADY_ATOMIC | two word action
TXT_0147 | Такого нет. | Такого нет. | SKIP_ALREADY_ATOMIC | two word status
TXT_0148 | Кулдаун активен. | Кулдаун активен. | SKIP_ALREADY_ATOMIC | two word status
TXT_0149 | Не хватает 💰. | Мало 💰 | COMPRESS | resource first
TXT_0150 | Не хватает 💰. | Мало 💰 | COMPRESS | resource first
TXT_0151 | Уже было уважение сегодня этому персонажу. | Уважение уже было | COMPRESS | result first
TXT_0152 | Цепочка A->B->A сегодня не работает. | Цепочка закрыта | COMPRESS | result first
TXT_0153 | Лимит уважения на сегодня исчерпан. | Лимит уважения | COMPRESS | limit first
TXT_0154 | Сейчас не получилось. Попробуй позже. | Не получилось | COMPRESS | intro removed
TXT_0155 | Ты отдал 1💰 | Отдал 1💰 | COMPRESS | result first
TXT_0156 | Цель получила +1 ⭐ | Цель +1⭐ | COMPRESS | result first
TXT_0157 | Dev Mode disabled. | Dev off | COMPRESS | result first
TXT_0158 | Dev Mode unlocked on this device. | Dev Mode unlocked | COMPRESS | result first
TXT_0159 | Incorrect Dev Mode PIN. | Wrong Dev PIN | COMPRESS | result first
TXT_0160 | Рано. Дай паузу. | Рано. Пауза | COMPRESS | status first
TXT_0161 | Недоступно. | Недоступно. | SKIP_ALREADY_ATOMIC | one word status
TXT_0162 | Недоступно. | Недоступно. | SKIP_ALREADY_ATOMIC | one word status
TXT_0163 | Недоступно. | Недоступно. | SKIP_ALREADY_ATOMIC | one word status
TXT_0164 | Не хватает 💰. | Мало 💰 | COMPRESS | resource first`;

  const rows = Object.freeze(parseRows(RAW_ROWS));
  const metadata = Object.freeze({
    mapId: "UI_PROFILE_ALPHA_MECHANICAL_COMPRESSION_MAP",
    stage: "4-alpha",
    step: "2.3",
    mode: "mechanical_compressor_map_only",
    sourceInventoryId: "UI_PROFILE_ALPHA_SOURCE_PHRASE_INVENTORY",
    totalRows: 164,
    smokeVersion: "alpha_step_2_3_mechanical_compressor_v20260618_001"
  });

  const manifest = Object.freeze({
    metadata,
    rows
  });

  window.UI_PROFILE_ALPHA_MECHANICAL_COMPRESSION_MAP = manifest;
  window.Game.UI_PROFILE_ALPHA_MECHANICAL_COMPRESSION_MAP = manifest;
  if (typeof module !== "undefined" && module.exports) module.exports = manifest;
})();
