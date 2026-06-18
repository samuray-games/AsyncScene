window.Game = window.Game || {};
(function () {
  const parseRows = (text) => String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^TXT_(\d{4}) \| (.*?) \| (.*?) \| (true|false) \| (true|false) \| (.*)$/);
      if (!match) return null;
      return Object.freeze({
        id: `TXT_${match[1]}`,
        alphaText: match[2],
        meaningType: match[3],
        instantMeaningOk: match[4] === "true",
        rereadRisk: match[5] === "true",
        note: match[6]
      });
    })
    .filter(Boolean);

  const RAW_ROWS = String.raw`TXT_0001 | AsyncScene | token | true | false | brand token
TXT_0002 | AsyncScene | token | true | false | brand token
TXT_0003 | Риск задан | status | true | false | risk status
TXT_0004 | Ресурс списан | status | true | false | resource result
TXT_0005 | Итог виден | status | true | false | result visibility
TXT_0006 | Цена и итог | label | true | false | economy label
TXT_0007 | Старт | command | true | false | start action
TXT_0008 | Суть | label | true | false | rules label
TXT_0009 | Цифры года | label | true | false | year digits label
TXT_0010 | Цифру выше | command | true | false | increment action
TXT_0011 | Цифру ниже | command | true | false | decrement action
TXT_0012 | Цифру выше | command | true | false | increment action
TXT_0013 | Цифру ниже | command | true | false | decrement action
TXT_0014 | Интерфейс без сохранения | status | true | false | persistence fact
TXT_0015 | Год по ощущению | label | true | false | fantasy year label
TXT_0016 | Продолжить | command | true | false | continue action
TXT_0017 | Старт | command | true | false | start action
TXT_0018 | Сбросить старт | command | true | false | reset action
TXT_0019 | Погнали | command | true | false | enter action
TXT_0020 | Снести выбор | command | true | false | reset choice action
TXT_0021 | Правила кратко | label | true | false | rules label
TXT_0022 | Войти | command | true | false | enter action
TXT_0023 | Готово. | status | true | false | done status
TXT_0024 | Сообщение недоступно. | status | true | false | unavailable message
TXT_0025 | Не хватает 💰. | status | true | false | resource shortage
TXT_0026 | Мало 💰 | status | true | false | resource shortage
TXT_0027 | Недоступно. | status | true | false | unavailable status
TXT_0028 | Не найдено. | status | true | false | not found status
TXT_0029 | Нет игрока | status | true | false | missing player
TXT_0030 | Штраф: -5 💰. | status | true | false | penalty status
TXT_0031 | Ввод некорректен. | status | true | false | invalid input
TXT_0032 | Кулдаун активен. | status | true | false | cooldown status
TXT_0033 | Проверка ждёт | status | true | false | check pending
TXT_0034 | +1💰 | token | true | false | money delta
TXT_0035 | +1⭐ | token | true | false | rep delta
TXT_0036 | Голос учтён. | status | true | false | vote accepted
TXT_0037 | Проверяю. | status | true | false | check in progress
TXT_0038 | Сдать {name}: +2💰. | command | true | false | report reward action
TXT_0039 | {name} сдан | status | true | false | report result
TXT_0040 | Аргумент: {teacher} → {student}. | token | true | false | argument transfer
TXT_0041 | Реванш от {name} | status | true | false | rematch request
TXT_0042 | Выход: 1💰 | command | true | false | paid exit
TXT_0043 | +1💰 возврат. | status | true | false | refund result
TXT_0044 | +1💰 большинству | result | true | false | majority reward
TXT_0045 | +1💰 победителю | result | true | false | winner reward
TXT_0046 | Реванш: -{rematchCost}💰. | command | true | false | rematch cost
TXT_0047 | Свалить: -{escapeCost}💰. | command | true | false | escape cost
TXT_0048 | {target}: +{amount}💰. | result | true | false | transfer result
TXT_0049 | +{amount}💰 тебе | result | true | false | received transfer
TXT_0050 | Вызов: {attackerName} | status | true | false | battle challenge
TXT_0051 | Баттл: {text} | result | true | false | battle result
TXT_0052 | Ничья: {a}/{b} | result | true | false | draw result
TXT_0053 | Толпа: {name} {aVotes}:{bVotes}. | result | true | false | crowd vote score
TXT_0054 | Оранжевые открыты | status | true | false | unlock result
TXT_0055 | Красные открыты | status | true | false | unlock result
TXT_0056 | Чёрные открыты | status | true | false | unlock result
TXT_0057 | Риск задан | status | true | false | risk status
TXT_0058 | Ресурс списан | status | true | false | resource result
TXT_0059 | Итог виден | status | true | false | result visibility
TXT_0060 | Цена и итог | label | true | false | economy label
TXT_0061 | Меню | label | true | false | menu label
TXT_0062 | К старту | navigation | true | false | back navigation
TXT_0063 | Цель | label | true | false | goal label
TXT_0064 | Победа | result | true | false | win result
TXT_0065 | Поражение | result | true | false | loss result
TXT_0066 | Толпа решает | status | true | false | crowd pending result
TXT_0067 | Конфликт выигран | result | true | false | conflict win
TXT_0068 | Конфликт проигран | result | true | false | conflict loss
TXT_0069 | Конфликт: ничья | result | true | false | conflict draw
TXT_0070 | Свалить: {X} | command | true | false | escape action
TXT_0071 | {student}: {arg}, {cost}💰 | token | true | false | teaching target cost
TXT_0072 | Аргумент {teacher}->{student} | token | true | false | argument transfer
TXT_0073 | Точный ник | label | true | false | invite input label
TXT_0074 | Игрока нет | status | true | false | player missing
TXT_0075 | Меню | label | true | false | menu label
TXT_0076 | К старту | navigation | true | false | back navigation
TXT_0077 | Недоступно. | status | true | false | unavailable status
TXT_0078 | Цель | label | true | false | goal label
TXT_0079 | Понял. Проверяю. | status | true | false | cop check status
TXT_0080 | Принял. Разберусь. | status | true | false | cop accepted status
TXT_0081 | Связь позже | status | true | false | delayed contact
TXT_0082 | Оформляю дело | status | true | false | cop busy status
TXT_0083 | Проверка сошлась | status | true | false | check result
TXT_0084 | Проверка сошлась | status | true | false | check result
TXT_0085 | Факты не сошлись | status | true | false | failed fact check
TXT_0086 | Проверка ждёт | status | true | false | check pending
TXT_0087 | Ответь: кто? | question | true | false | answer type hint
TXT_0088 | Ответь: где? | question | true | false | answer type hint
TXT_0089 | О ком? | question | true | false | answer type hint
TXT_0090 | Да или нет? | question | true | false | answer type hint
TXT_0091 | ТОЛПА | label | true | false | crowd label
TXT_0092 | ВПИСЫВАЙСЯ | command | true | false | join action
TXT_0093 | ТЫКНИ ИМЯ | command | true | false | name click action
TXT_0094 | ✓ ОК | token | true | false | yes vote token
TXT_0095 | ✓ УЖЕ | token | true | false | already voted token
TXT_0096 | ✕ НЕ | token | true | false | no vote token
TXT_0097 | WIN | result | true | false | win token
TXT_0098 | RIP | result | true | false | loss token
TXT_0099 | DRAW | result | true | false | draw token
TXT_0100 | Ты вывез. | result | true | false | win result
TXT_0101 | Не вывез. | result | true | false | loss result
TXT_0102 | Ничья. Шум зря | result | true | false | draw result
TXT_0103 | Мейн твой | result | true | false | majority side result
TXT_0104 | Андер твой | result | true | false | minority side result
TXT_0105 | Мейн забрал. | result | true | false | majority won result
TXT_0106 | Андер просел. | result | true | false | minority lost result
TXT_0107 | Драма закрыта. | status | true | false | conflict closed
TXT_0108 | Лимит ⭐ недели | status | true | false | weekly rep cap
TXT_0109 | Лимит Points недели | status | true | false | weekly points cap
TXT_0110 | {cop.fullName} здесь | status | true | false | cop online status
TXT_0111 | Опасность рядом | status | true | false | danger status
TXT_0112 | Экипаж в пути | status | true | false | unit on the way
TXT_0113 | Контроль есть | status | true | false | controlled status
TXT_0114 | Принято, наблюдаю. | status | true | false | accepted monitoring
TXT_0115 | Факт принят | status | true | false | fact accepted
TXT_0116 | Связь позже | status | true | false | delayed contact
TXT_0117 | Сдача принята | status | true | false | report accepted
TXT_0118 | Нет фактов | status | true | false | no facts status
TXT_0119 | Кто на слуху? | question | true | false | about question
TXT_0120 | Про {NAME} говорят | answer | true | false | about answer
TXT_0121 | Кто был рядом? | question | true | false | who question
TXT_0122 | {NAME}. | answer | true | false | name answer
TXT_0123 | Где мы? | question | true | false | where question
TXT_0124 | Здесь. | answer | true | false | place answer
TXT_0125 | Вы уверены? | question | true | false | confirmation question
TXT_0126 | Да. | answer | true | false | yes answer
TXT_0127 | Кто на слуху? | question | true | false | about question
TXT_0128 | Про {NAME} | answer | true | false | about answer
TXT_0129 | Вы уверены? | question | true | false | confirmation question
TXT_0130 | слабый ход | status | true | false | NPC pressure line
TXT_0131 | отвечай сейчас | command | true | false | NPC pressure command
TXT_0132 | кошелек ближе | status | true | false | bandit pressure line
TXT_0133 | Плати. Уходи | command | true | false | bandit command
TXT_0134 | Принято. Дистанция | status | true | false | cop boundary line
TXT_0135 | Тише | command | true | false | mafia command
TXT_0136 | ого | status | true | false | crowd reaction
TXT_0137 | Я рядом | status | true | false | cop DM status
TXT_0138 | Тише. Решим. | command | true | false | mafia DM command
TXT_0139 | Кошелек ближе. | status | true | false | bandit DM pressure
TXT_0140 | Слабый ход. | status | true | false | toxic DM pressure
TXT_0141 | Голос был | status | true | false | already voted
TXT_0142 | Мало 💰 | status | true | false | resource shortage
TXT_0143 | Реванш был | status | true | false | rematch already requested
TXT_0144 | Баттл не завершён | status | true | false | battle not finished
TXT_0145 | Недоступно. | status | true | false | unavailable status
TXT_0146 | Выбери игрока. | command | true | false | choose player
TXT_0147 | Такого нет. | status | true | false | missing target
TXT_0148 | Кулдаун активен. | status | true | false | cooldown status
TXT_0149 | Мало 💰 | status | true | false | resource shortage
TXT_0150 | Мало 💰 | status | true | false | resource shortage
TXT_0151 | Уважение уже было | status | true | false | respect already used
TXT_0152 | Цепочка закрыта | status | true | false | chain blocked
TXT_0153 | Лимит уважения | status | true | false | respect limit
TXT_0154 | Не получилось | status | true | false | failed action
TXT_0155 | Отдал 1💰 | result | true | false | payment result
TXT_0156 | Цель +1⭐ | result | true | false | target rep gain
TXT_0157 | Dev off | status | true | false | dev disabled
TXT_0158 | Dev Mode unlocked | status | true | false | dev unlocked
TXT_0159 | Wrong Dev PIN | status | true | false | wrong dev pin
TXT_0160 | Рано. Пауза | status | true | false | wait status
TXT_0161 | Недоступно. | status | true | false | unavailable status
TXT_0162 | Недоступно. | status | true | false | unavailable status
TXT_0163 | Недоступно. | status | true | false | unavailable status
TXT_0164 | Мало 💰 | status | true | false | resource shortage`;

  const rows = Object.freeze(parseRows(RAW_ROWS));
  const metadata = Object.freeze({
    auditId: "UI_PROFILE_ALPHA_INSTANT_MEANING_AUDIT",
    stage: "4-alpha",
    step: "2.5",
    mode: "alpha_instant_meaning_audit_only",
    sourceMapId: "UI_PROFILE_ALPHA_MECHANICAL_COMPRESSION_MAP",
    totalRows: 164,
    smokeVersion: "alpha_step_2_5_instant_meaning_v20260618_001"
  });

  const manifest = Object.freeze({
    metadata,
    rows
  });

  window.UI_PROFILE_ALPHA_INSTANT_MEANING_AUDIT = manifest;
  window.Game.UI_PROFILE_ALPHA_INSTANT_MEANING_AUDIT = manifest;
  if (typeof module !== "undefined" && module.exports) module.exports = manifest;
})();
