# SMOKE TEST COMMANDS - AsyncScene

## 1. Проверка REP за исход по разнице сил Δ (Задача A)

### Подготовка
```js
// Включить dev-лог типов (опционально)
Game.Debug.LOG_TYPE_CHECK = true;

// Вывести текущие статы
console.log("BEFORE", {rep: Game.State.rep, inf: Game.State.me?.influence, wins: Game.State.me?.wins});
```

### Тест 1: Победа над равным (Δ=0, ожидаем +1 REP)
```js
// Найти NPC с равным тоном
const opp = Object.values(Game.State.players).find(p => p && p.id !== "me" && !p.role?.includes("cop"));
if (opp) {
  Game.Conflict.challenge(opp.id);
  // Выберите аргументы того же тона, что и оппонент
  // После победы проверьте:
  const repLog = Game.Debug.moneyLog.filter(l => l.currency === "rep" && l.reason === "rep_battle_win_delta").slice(-1)[0];
  console.log("REP_WIN_DELTA", repLog);
}
```

### Тест 2: Победа над более сильным (Δ=-2, ожидаем +2 REP)
```js
// Победа Y против R/K
// После победы:
const repLog = Game.Debug.moneyLog.filter(l => l.currency === "rep" && l.reason === "rep_battle_win_delta").slice(-1)[0];
console.log("WIN_VS_STRONG", {amount: repLog?.amount, expected: 2});
```

### Тест 3: Поражение от равного (Δ=0, ожидаем -1 REP)
```js
// После поражения:
const repLog = Game.Debug.moneyLog.filter(l => l.currency === "rep" && l.reason === "rep_battle_lose_delta").slice(-1)[0];
console.log("LOSE_VS_EQUAL", {amount: repLog?.amount, direction: repLog?.sourceId === "me" ? "minus" : "plus"});
```

### Проверка всех REP-транзакций баттлов
```js
console.table(
  Game.Debug.moneyLog
    .filter(l => l.currency === "rep" && l.battleId && (l.reason.includes("battle") || l.reason.includes("delta")))
    .slice(-10)
);
```

---

## 2. Проверка голосования crowd (Задача B)

### Тест 1: Клик на голосование
```js
// Создать событие
const ev = Game.Events.makeNpcEvent();
Game.Events.addEvent(ev);

// BEFORE клика
console.log("BEFORE_VOTE", {points: Game.State.me?.points, rep: Game.State.rep});

// Кликнуть на кнопку в UI (или через консоль)
Game.Events.helpEvent(ev.id, "a");

// AFTER клика (должно быть -1p, +1 REP сразу)
console.log("AFTER_VOTE", {points: Game.State.me?.points, rep: Game.State.rep});

// Проверить тосты: должны быть "-1 💰 (голосование)" и "+1 REP (участие)"
```

### Тест 2: Завершение голосования - большинство
```js
// Дождаться завершения таймера или принудительно:
Game.Events.tick();

// Проверить тосты: должны быть "+2 REP (большинство)" и "+1 💰 (возврат)"
// Проверить moneyLog:
const eventLogs = Game.Debug.moneyLog.filter(l => 
  l.battleId === ev.id && 
  (l.reason.includes("crowd_vote") || l.reason.includes("participation") || l.reason.includes("majority"))
);
console.table(eventLogs);
```

### Тест 3: Завершение голосования - меньшинство
```js
// Проголосовать за проигрышную сторону
// После завершения проверить тосты: должен быть "-2 REP (меньшинство)"
// Возврата пойнта НЕ должно быть
```

---

## 3. Проверка реванша (Задача C)

```js
// До реванша
const repBefore = Game.State.rep;

// Запросить реванш (или принять входящий)
// Game.Conflict.requestRematch(battleId, "me");

// После реванша
const repAfter = Game.State.rep;
console.log("REMATCH_REP", {before: repBefore, after: repAfter, changed: repBefore !== repAfter});
// Ожидается: changed = false

// Проверить что в moneyLog НЕТ записей с reason "rep_rematch"
const rematchRep = Game.Debug.moneyLog.filter(l => l.currency === "rep" && l.reason && l.reason.includes("rematch"));
console.log("REMATCH_REP_LOGS", rematchRep.length, "expected: 0");
```

---

## 4. Проверка совместимости по типу (Задача D)

```js
// Включить dev-лог
Game.Debug.LOG_TYPE_CHECK = true;

// Запустить баттл с WHERE вопросом
// Ответить WHERE-ответом ЛЮБОГО тона
// В консоли должен появиться:
// [TYPE_CHECK] attack=where defense=where correct=true reason=type_match

// Ответить НЕ-WHERE ответом
// В консоли должен появиться:
// [TYPE_CHECK] attack=where defense=who correct=false reason=type_mismatch
```

---

## 5. Проверка YN-ответов с {PLACE} (Задача E)

```js
// Проверить что YN-ответы не содержат {PLACE}
const ynAnswers = [
  ...Game.Data.ARG_BASE_Y.yn,
  ...Game.Data.ARG_BASE_O.yn,
  ...Game.Data.ARG_BASE_R.yn,
  ...Game.Data.ARG_BASE_K.yn
].map(x => x.a);

const ynWithPlace = ynAnswers.filter(a => a.includes("{PLACE}"));
console.log("YN_WITH_PLACE", ynWithPlace.length, "expected: 0");

// Проверить WHERE-ответы: все должны использовать "там где {PLACE}" или не иметь {PLACE}
const whereAnswers = [
  ...Game.Data.ARG_BASE_Y.where,
  ...Game.Data.ARG_BASE_O.where,
  ...Game.Data.ARG_BASE_R.where,
  ...Game.Data.ARG_BASE_K.where
].map(x => x.a);

const whereOldFormat = whereAnswers.filter(a => a.match(/\b(в|на|у)\s*\{PLACE\}/i));
console.log("WHERE_OLD_FORMAT", whereOldFormat.length, "expected: 0");
console.log("WHERE_OLD_FORMAT_EXAMPLES", whereOldFormat.slice(0, 3));
```

---

## 6. Проверка тостов (Задача F)

```js
// Запустить баттл и победить
// НЕ должно быть тоста "Победа!"
// Должны быть только тосты дельт: "+2 💰", "+1 REP" и т.д.

// Проверить через code search:
// Найти "Победа!" в conflict-economy.js - должно быть закомментировано
```

---

## 7. Проверка Коп DM (Задача G)

### Тест 1: Донос без виктимизации
```js
// Просто сдать NPC, с которым не было взаимодействий
Game.StateAPI.applyReportByRole("toxic");
// Ожидается: стандартный DM без дополнительного сообщения
```

### Тест 2: Донос после robbery
```js
// 1. Получить robbery от токсика/бандита
// 2. Сдать его копу
Game.StateAPI.applyReportByRole("токсик");
// Ожидается: два DM - стандартный + "Я понимаю, что вас это задело. Меры приняты."
```

### Тест 3: Донос после проигранного баттла
```js
// 1. Проиграть баттл NPC
// 2. Сдать его копу
// Ожидается: дополнительный DM о том что коп понимает что игрок пострадал
```

---

## Общая проверка moneyLog

```js
// Все REP-транзакции за последнюю минуту
console.table(
  Game.Debug.moneyLog
    .filter(l => l.currency === "rep" && l.time > Date.now() - 60000)
    .map(l => ({
      reason: l.reason,
      amount: l.amount,
      from: l.sourceId,
      to: l.targetId,
      battleId: l.battleId
    }))
);

// Все points-транзакции за последнюю минуту
console.table(
  Game.Debug.moneyLog
    .filter(l => (!l.currency || l.currency === "points") && l.time > Date.now() - 60000)
    .map(l => ({
      reason: l.reason,
      amount: l.amount,
      from: l.sourceId,
      to: l.targetId
    }))
);
```
