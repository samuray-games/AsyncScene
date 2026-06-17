window.Game = window.Game || {};
(function () {
  const parseRowValue = (value) => {
    try {
      return JSON.parse(`"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
    } catch (_) {
      return String(value);
    }
  };

  const parseRows = (text) => String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^TXT_(\d{4}) \| oldText:"((?:\\.|[^"])*)" \| alphaText:"((?:\\.|[^"])*)" \| explanationPolicy:"([a-z_]+)"$/);
      if (!match) return null;
      return Object.freeze({
        id: `TXT_${match[1]}`,
        oldText: parseRowValue(match[2]),
        alphaText: parseRowValue(match[3]),
        explanationPolicy: match[4]
      });
    })
    .filter(Boolean);

  const RAW_ROWS = String.raw`TXT_0001 | oldText:"AsyncScene" | alphaText:"AsyncScene" | explanationPolicy:"fixed"
TXT_0002 | oldText:"AsyncScene" | alphaText:"AsyncScene" | explanationPolicy:"fixed"
TXT_0003 | oldText:"Оппонент задаёт риск." | alphaText:"Оппонент: риск." | explanationPolicy:"action_first"
TXT_0004 | oldText:"Ставка списывает ресурс." | alphaText:"Ставка списывает." | explanationPolicy:"drop_extra_context"
TXT_0005 | oldText:"Итог виден сразу." | alphaText:"Итог сразу." | explanationPolicy:"drop_extra_context"
TXT_0006 | oldText:"Цена и итог сразу." | alphaText:"Цена + итог." | explanationPolicy:"action_first"
TXT_0007 | oldText:"Старт" | alphaText:"Старт" | explanationPolicy:"atomic"
TXT_0008 | oldText:"Суть" | alphaText:"Суть" | explanationPolicy:"atomic"
TXT_0009 | oldText:"Последние 2 цифры года рождения" | alphaText:"2 цифры года" | explanationPolicy:"drop_extra_context"
TXT_0010 | oldText:"Увеличить первую цифру" | alphaText:"+ первая" | explanationPolicy:"action_first"
TXT_0011 | oldText:"Уменьшить первую цифру" | alphaText:"- первая" | explanationPolicy:"action_first"
TXT_0012 | oldText:"Увеличить вторую цифру" | alphaText:"+ вторая" | explanationPolicy:"action_first"
TXT_0013 | oldText:"Уменьшить вторую цифру" | alphaText:"- вторая" | explanationPolicy:"action_first"
TXT_0014 | oldText:"Только для интерфейса. Не сохраняем. Можно поменять позже." | alphaText:"Только UI. Не сохраняем. Смена позже." | explanationPolicy:"drop_extra_context"
TXT_0015 | oldText:"я на самом деле чувствую будто я родился в …" | alphaText:"чувствую год: …" | explanationPolicy:"drop_extra_context"
TXT_0016 | oldText:"Продолжить" | alphaText:"Далее" | explanationPolicy:"action_first"
TXT_0017 | oldText:"Старт" | alphaText:"Старт" | explanationPolicy:"atomic"
TXT_0018 | oldText:"Сбросить старт" | alphaText:"Сброс" | explanationPolicy:"action_first"
TXT_0019 | oldText:"Погнали" | alphaText:"Старт" | explanationPolicy:"action_first"
TXT_0020 | oldText:"Снести выбор" | alphaText:"Сброс" | explanationPolicy:"action_first"
TXT_0021 | oldText:"Правила без душноты" | alphaText:"Правила" | explanationPolicy:"drop_extra_context"
TXT_0022 | oldText:"Войти" | alphaText:"Вход" | explanationPolicy:"atomic"
TXT_0023 | oldText:"Готово." | alphaText:"Готово." | explanationPolicy:"atomic"
TXT_0024 | oldText:"Сообщение недоступно." | alphaText:"Нет сообщения." | explanationPolicy:"drop_reason"
TXT_0025 | oldText:"Не хватает 💰." | alphaText:"Мало 💰." | explanationPolicy:"drop_reason"
TXT_0026 | oldText:"Мало 💰 на баттл." | alphaText:"Мало 💰." | explanationPolicy:"drop_extra_context"
TXT_0027 | oldText:"Недоступно." | alphaText:"Нет." | explanationPolicy:"drop_reason"
TXT_0028 | oldText:"Не найдено." | alphaText:"Нет." | explanationPolicy:"drop_reason"
TXT_0029 | oldText:"Игрок не указан." | alphaText:"Нужен игрок." | explanationPolicy:"action_first"
TXT_0030 | oldText:"Штраф: -5 💰." | alphaText:"-5💰 штраф." | explanationPolicy:"action_first"
TXT_0031 | oldText:"Ввод некорректен." | alphaText:"Ввод неверный." | explanationPolicy:"drop_reason"
TXT_0032 | oldText:"Кулдаун активен." | alphaText:"Кулдаун." | explanationPolicy:"drop_extra_context"
TXT_0033 | oldText:"Проверка займет время." | alphaText:"Проверка ждёт." | explanationPolicy:"drop_reason"
TXT_0034 | oldText:"+1💰" | alphaText:"+1💰" | explanationPolicy:"atomic"
TXT_0035 | oldText:"+1⭐" | alphaText:"+1⭐" | explanationPolicy:"atomic"
TXT_0036 | oldText:"Голос учтён." | alphaText:"Голос есть." | explanationPolicy:"drop_extra_context"
TXT_0037 | oldText:"Проверяю." | alphaText:"Проверка." | explanationPolicy:"atomic"
TXT_0038 | oldText:"Сдать {name}: +2💰." | alphaText:"{name}: +2💰." | explanationPolicy:"template_preserve"
TXT_0039 | oldText:"Коп: {name} сдан, +2💰." | alphaText:"{name} сдан: +2💰." | explanationPolicy:"template_preserve"
TXT_0040 | oldText:"Аргумент: {teacher} → {student}." | alphaText:"{teacher} → {student}: аргумент." | explanationPolicy:"template_preserve"
TXT_0041 | oldText:"{name} зовёт на реванш." | alphaText:"{name}: реванш." | explanationPolicy:"template_preserve"
TXT_0042 | oldText:"Свалить за 1💰." | alphaText:"Выход: 1💰." | explanationPolicy:"action_first"
TXT_0043 | oldText:"+1💰 возврат." | alphaText:"+1💰 назад." | explanationPolicy:"drop_extra_context"
TXT_0044 | oldText:"+1💰 возврат большинству." | alphaText:"+1💰 большинству." | explanationPolicy:"drop_extra_context"
TXT_0045 | oldText:"+1💰 остаток победителю." | alphaText:"+1💰 победителю." | explanationPolicy:"drop_extra_context"
TXT_0046 | oldText:"Реванш: -{rematchCost}💰." | alphaText:"Реванш -{rematchCost}💰." | explanationPolicy:"template_preserve"
TXT_0047 | oldText:"Свалить: -{escapeCost}💰." | alphaText:"Выход -{escapeCost}💰." | explanationPolicy:"template_preserve"
TXT_0048 | oldText:"{target}: +{amount}💰." | alphaText:"{target}: +{amount}💰." | explanationPolicy:"template_preserve"
TXT_0049 | oldText:"{target}: +{amount}💰 тебе." | alphaText:"От {target}: +{amount}💰." | explanationPolicy:"template_preserve"
TXT_0050 | oldText:"{attackerName} [{attackerInf}] бросил вызов." | alphaText:"{attackerName} [{attackerInf}]: вызов." | explanationPolicy:"template_preserve"
TXT_0051 | oldText:"Баттл с {oppName}: {text}." | alphaText:"{oppName}: {text}." | explanationPolicy:"template_preserve"
TXT_0052 | oldText:"{a} и {b}: ничья." | alphaText:"{a}/{b}: ничья." | explanationPolicy:"template_preserve"
TXT_0053 | oldText:"Толпа: {name} {aVotes}:{bVotes}." | alphaText:"{name}: {aVotes}:{bVotes}." | explanationPolicy:"template_preserve"
TXT_0054 | oldText:"Оранжевые аргументы открыты." | alphaText:"Оранжевые открыты." | explanationPolicy:"drop_extra_context"
TXT_0055 | oldText:"Красные аргументы открыты." | alphaText:"Красные открыты." | explanationPolicy:"drop_extra_context"
TXT_0056 | oldText:"Чёрные аргументы открыты." | alphaText:"Чёрные открыты." | explanationPolicy:"drop_extra_context"
TXT_0057 | oldText:"Оппонент задаёт риск." | alphaText:"Оппонент: риск." | explanationPolicy:"action_first"
TXT_0058 | oldText:"Ставка списывает ресурс." | alphaText:"Ставка списывает." | explanationPolicy:"drop_extra_context"
TXT_0059 | oldText:"Итог виден сразу." | alphaText:"Итог сразу." | explanationPolicy:"drop_extra_context"
TXT_0060 | oldText:"Цена и итог сразу." | alphaText:"Цена + итог." | explanationPolicy:"action_first"
TXT_0061 | oldText:"Меню" | alphaText:"Меню" | explanationPolicy:"atomic"
TXT_0062 | oldText:"К старту" | alphaText:"Старт" | explanationPolicy:"action_first"
TXT_0063 | oldText:"Цель" | alphaText:"Цель" | explanationPolicy:"atomic"
TXT_0064 | oldText:"Победа" | alphaText:"WIN" | explanationPolicy:"action_first"
TXT_0065 | oldText:"Поражение" | alphaText:"RIP" | explanationPolicy:"action_first"
TXT_0066 | oldText:"Толпа решает" | alphaText:"Толпа." | explanationPolicy:"drop_extra_context"
TXT_0067 | oldText:"Вы победили в конфликте." | alphaText:"Победа." | explanationPolicy:"drop_extra_context"
TXT_0068 | oldText:"Вы проиграли конфликт." | alphaText:"Поражение." | explanationPolicy:"drop_extra_context"
TXT_0069 | oldText:"Конфликт завершился ничьей." | alphaText:"Ничья." | explanationPolicy:"drop_extra_context"
TXT_0070 | oldText:"Свалить: {X}" | alphaText:"Выход: {X}" | explanationPolicy:"template_preserve"
TXT_0071 | oldText:"Для {student}: {arg}. Цена {cost} 💰." | alphaText:"{student}: {arg}. -{cost}💰." | explanationPolicy:"template_preserve"
TXT_0072 | oldText:"Аргумент: {teacher} → {student}." | alphaText:"{teacher} → {student}: аргумент." | explanationPolicy:"template_preserve"
TXT_0073 | oldText:"Введи точный ник." | alphaText:"Точный ник." | explanationPolicy:"drop_extra_context"
TXT_0074 | oldText:"Игрок не найден." | alphaText:"Игрока нет." | explanationPolicy:"drop_reason"
TXT_0075 | oldText:"Меню" | alphaText:"Меню" | explanationPolicy:"atomic"
TXT_0076 | oldText:"К старту" | alphaText:"Старт" | explanationPolicy:"action_first"
TXT_0077 | oldText:"Недоступно." | alphaText:"Нет." | explanationPolicy:"drop_reason"
TXT_0078 | oldText:"Цель" | alphaText:"Цель" | explanationPolicy:"atomic"
TXT_0079 | oldText:"Понял. Проверяю." | alphaText:"Принял. Проверка." | explanationPolicy:"action_first"
TXT_0080 | oldText:"Принял. Разберусь." | alphaText:"Принял. Разбор." | explanationPolicy:"action_first"
TXT_0081 | oldText:"Занят, связь позже." | alphaText:"Занят. Позже." | explanationPolicy:"drop_extra_context"
TXT_0082 | oldText:"Не могу, оформляю дело." | alphaText:"Занят делом." | explanationPolicy:"drop_reason"
TXT_0083 | oldText:"Проверка сошлась. Вмешался." | alphaText:"Сошлось. Вмешался." | explanationPolicy:"drop_extra_context"
TXT_0084 | oldText:"Проверка сошлась. Занялся." | alphaText:"Сошлось. В деле." | explanationPolicy:"drop_extra_context"
TXT_0085 | oldText:"Не подтвердилось. Факты не сошлись." | alphaText:"Не сошлось." | explanationPolicy:"drop_reason"
TXT_0086 | oldText:"Проверка займет время." | alphaText:"Проверка ждёт." | explanationPolicy:"drop_reason"
TXT_0087 | oldText:"Ответь: кто?" | alphaText:"Кто?" | explanationPolicy:"drop_extra_context"
TXT_0088 | oldText:"Ответь: где?" | alphaText:"Где?" | explanationPolicy:"drop_extra_context"
TXT_0089 | oldText:"Ответь: о ком?" | alphaText:"О ком?" | explanationPolicy:"drop_extra_context"
TXT_0090 | oldText:"Ответь: да или нет?" | alphaText:"Да/нет?" | explanationPolicy:"drop_extra_context"
TXT_0091 | oldText:"ТОЛПА" | alphaText:"ТОЛПА" | explanationPolicy:"atomic"
TXT_0092 | oldText:"ВПИСЫВАЙСЯ" | alphaText:"ВХОД" | explanationPolicy:"action_first"
TXT_0093 | oldText:"ТЫКНИ ИМЯ" | alphaText:"ИМЯ" | explanationPolicy:"action_first"
TXT_0094 | oldText:"✓ ОК" | alphaText:"✓ ОК" | explanationPolicy:"atomic"
TXT_0095 | oldText:"✓ УЖЕ" | alphaText:"✓ УЖЕ" | explanationPolicy:"atomic"
TXT_0096 | oldText:"✕ НЕ" | alphaText:"✕ НЕ" | explanationPolicy:"atomic"
TXT_0097 | oldText:"WIN" | alphaText:"WIN" | explanationPolicy:"atomic"
TXT_0098 | oldText:"RIP" | alphaText:"RIP" | explanationPolicy:"atomic"
TXT_0099 | oldText:"DRAW" | alphaText:"DRAW" | explanationPolicy:"atomic"
TXT_0100 | oldText:"Ты вывез." | alphaText:"Вывез." | explanationPolicy:"drop_extra_context"
TXT_0101 | oldText:"Не вывез." | alphaText:"Мимо." | explanationPolicy:"action_first"
TXT_0102 | oldText:"Ничья. Все шумели зря." | alphaText:"Ничья." | explanationPolicy:"drop_reason"
TXT_0103 | oldText:"Ты в мейне." | alphaText:"В мейне." | explanationPolicy:"drop_extra_context"
TXT_0104 | oldText:"Ты в андере." | alphaText:"В андере." | explanationPolicy:"drop_extra_context"
TXT_0105 | oldText:"Мейн забрал." | alphaText:"Мейн." | explanationPolicy:"drop_extra_context"
TXT_0106 | oldText:"Андер просел." | alphaText:"Андер." | explanationPolicy:"drop_extra_context"
TXT_0107 | oldText:"Драма закрыта." | alphaText:"Закрыто." | explanationPolicy:"drop_extra_context"
TXT_0108 | oldText:"лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐." | alphaText:"Лимит ⭐. Пополни 💰." | explanationPolicy:"drop_reason"
TXT_0109 | oldText:"Cap: max Points на этой неделе. Используйте, пока не сбросили cap." | alphaText:"Cap Points. Используй." | explanationPolicy:"drop_reason"
TXT_0110 | oldText:"{cop.fullName} на связи." | alphaText:"{cop.fullName}: связь." | explanationPolicy:"template_preserve"
TXT_0111 | oldText:"Опасная точка рядом." | alphaText:"Риск рядом." | explanationPolicy:"drop_extra_context"
TXT_0112 | oldText:"Вызов принят, экипаж в пути." | alphaText:"Вызов принят." | explanationPolicy:"drop_extra_context"
TXT_0113 | oldText:"Ситуация под контролем." | alphaText:"Контроль." | explanationPolicy:"drop_extra_context"
TXT_0114 | oldText:"Принято, наблюдаю." | alphaText:"Принято." | explanationPolicy:"drop_extra_context"
TXT_0115 | oldText:"Факт принят, идем дальше." | alphaText:"Факт принят." | explanationPolicy:"drop_extra_context"
TXT_0116 | oldText:"Занят расследованием, связь позже." | alphaText:"Занят. Позже." | explanationPolicy:"drop_reason"
TXT_0117 | oldText:"Сдача принята \u2014 спокойнее." | alphaText:"Сдача принята." | explanationPolicy:"drop_reason"
TXT_0118 | oldText:"«Сдать» без фактов \u2014 шум." | alphaText:"«Сдать» без фактов." | explanationPolicy:"drop_reason"
TXT_0119 | oldText:"Кто сегодня на слуху, если не ошибаюсь?" | alphaText:"Кто на слуху?" | explanationPolicy:"drop_extra_context"
TXT_0120 | oldText:"Кажется, про {NAME} говорят." | alphaText:"Про {NAME}." | explanationPolicy:"template_preserve"
TXT_0121 | oldText:"Кто, как вам кажется, был рядом?" | alphaText:"Кто был рядом?" | explanationPolicy:"drop_extra_context"
TXT_0122 | oldText:"{NAME}." | alphaText:"{NAME}." | explanationPolicy:"template_preserve"
TXT_0123 | oldText:"Где мы сейчас, как вам кажется?" | alphaText:"Где сейчас?" | explanationPolicy:"drop_extra_context"
TXT_0124 | oldText:"Здесь." | alphaText:"Здесь." | explanationPolicy:"atomic"
TXT_0125 | oldText:"Вы уверены?" | alphaText:"Уверен?" | explanationPolicy:"drop_extra_context"
TXT_0126 | oldText:"Да." | alphaText:"Да." | explanationPolicy:"atomic"
TXT_0127 | oldText:"Кто сегодня на слуху?" | alphaText:"Кто на слуху?" | explanationPolicy:"drop_extra_context"
TXT_0128 | oldText:"Про {NAME} говорят." | alphaText:"Про {NAME}." | explanationPolicy:"template_preserve"
TXT_0129 | oldText:"Вы уверены?" | alphaText:"Уверен?" | explanationPolicy:"drop_extra_context"
TXT_0130 | oldText:"слабый ход" | alphaText:"слабо" | explanationPolicy:"action_first"
TXT_0131 | oldText:"отвечай сейчас" | alphaText:"отвечай" | explanationPolicy:"drop_extra_context"
TXT_0132 | oldText:"кошелек ближе" | alphaText:"кошелек" | explanationPolicy:"drop_extra_context"
TXT_0133 | oldText:"плати и уходи" | alphaText:"плати. уходи" | explanationPolicy:"action_first"
TXT_0134 | oldText:"Принято. Дистанция" | alphaText:"Принято. Дистанция" | explanationPolicy:"atomic"
TXT_0135 | oldText:"Тише" | alphaText:"Тише" | explanationPolicy:"atomic"
TXT_0136 | oldText:"ого" | alphaText:"ого" | explanationPolicy:"atomic"
TXT_0137 | oldText:"Принято. Я рядом." | alphaText:"Принято. Рядом." | explanationPolicy:"drop_extra_context"
TXT_0138 | oldText:"Тише. Решим." | alphaText:"Тише. Решим." | explanationPolicy:"atomic"
TXT_0139 | oldText:"Кошелек ближе." | alphaText:"Кошелек." | explanationPolicy:"drop_extra_context"
TXT_0140 | oldText:"Слабый ход." | alphaText:"Слабый ход." | explanationPolicy:"atomic"
TXT_0141 | oldText:"Ты уже проголосовал." | alphaText:"Голос уже есть." | explanationPolicy:"action_first"
TXT_0142 | oldText:"Не хватает 💰." | alphaText:"Мало 💰." | explanationPolicy:"drop_reason"
TXT_0143 | oldText:"Реванш уже запрошен." | alphaText:"Реванш уже есть." | explanationPolicy:"action_first"
TXT_0144 | oldText:"Недоступно. Баттл не завершён." | alphaText:"Баттл не закрыт." | explanationPolicy:"drop_reason"
TXT_0145 | oldText:"Недоступно." | alphaText:"Нет." | explanationPolicy:"drop_reason"
TXT_0146 | oldText:"Выбери игрока." | alphaText:"Выбери игрока." | explanationPolicy:"atomic"
TXT_0147 | oldText:"Такого нет." | alphaText:"Нет такого." | explanationPolicy:"atomic"
TXT_0148 | oldText:"Кулдаун активен." | alphaText:"Кулдаун." | explanationPolicy:"drop_extra_context"
TXT_0149 | oldText:"Не хватает 💰." | alphaText:"Мало 💰." | explanationPolicy:"drop_reason"
TXT_0150 | oldText:"Не хватает 💰." | alphaText:"Мало 💰." | explanationPolicy:"drop_reason"
TXT_0151 | oldText:"Уже было уважение сегодня этому персонажу." | alphaText:"Уважение уже было." | explanationPolicy:"drop_reason"
TXT_0152 | oldText:"Цепочка A->B->A сегодня не работает." | alphaText:"A->B->A закрыто." | explanationPolicy:"drop_reason"
TXT_0153 | oldText:"Лимит уважения на сегодня исчерпан." | alphaText:"Лимит уважения." | explanationPolicy:"drop_extra_context"
TXT_0154 | oldText:"Сейчас не получилось. Попробуй позже." | alphaText:"Не вышло. Позже." | explanationPolicy:"drop_reason"
TXT_0155 | oldText:"Ты отдал 1💰" | alphaText:"-1💰 от тебя." | explanationPolicy:"action_first"
TXT_0156 | oldText:"Цель получила +1 ⭐" | alphaText:"Цель: +1⭐." | explanationPolicy:"action_first"
TXT_0157 | oldText:"Dev Mode disabled." | alphaText:"Dev off." | explanationPolicy:"action_first"
TXT_0158 | oldText:"Dev Mode unlocked on this device." | alphaText:"Dev unlocked." | explanationPolicy:"drop_extra_context"
TXT_0159 | oldText:"Incorrect Dev Mode PIN." | alphaText:"Wrong PIN." | explanationPolicy:"drop_extra_context"
TXT_0160 | oldText:"Рано. Дай паузу." | alphaText:"Рано. Пауза." | explanationPolicy:"action_first"
TXT_0161 | oldText:"Недоступно." | alphaText:"Нет." | explanationPolicy:"drop_reason"
TXT_0162 | oldText:"Недоступно." | alphaText:"Нет." | explanationPolicy:"drop_reason"
TXT_0163 | oldText:"Недоступно." | alphaText:"Нет." | explanationPolicy:"drop_reason"
TXT_0164 | oldText:"Не хватает 💰." | alphaText:"Мало 💰." | explanationPolicy:"drop_reason"`;

  const table = Object.freeze(parseRows(RAW_ROWS));
  const manifest = Object.freeze({
    buildTag: "build_2026_06_17_step4_alpha_profile_step1_4_explanation_rules_v1",
    commit: "step4_alpha_profile_step1_4_explanation_rules_v1",
    smokeVersion: "alpha_step_1_4_explanation_rules_v20260617_001",
    expectedEntryCount: 164,
    table
  });

  window.Game.__ALPHA_EXPLANATION_RULES__ = manifest;
  if (!window.Game.__DEV) window.Game.__DEV = {};
  window.Game.__DEV.alphaExplanationRulesManifest = manifest;
  if (typeof module !== "undefined" && module.exports) module.exports = manifest;
})();
