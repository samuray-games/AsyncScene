# P0 Diagnostic Commands - AsyncScene

## P0-1: YN ответы с {PLACE} - Runtime Assert

### Включить диагностику
```js
Game.Debug.WARN_YN_PLACE = true;
```

### Проверить отсутствие YN с {PLACE} в данных
```js
// Проверить базовые YN-ответы
const ynAnswers = [
  ...Game.Data.ARG_BASE_Y.yn,
  ...Game.Data.ARG_BASE_O.yn, 
  ...Game.Data.ARG_BASE_R.yn,
  ...Game.Data.ARG_BASE_K.yn
].map(x => x.a);

const ynWithPlace = ynAnswers.filter(a => a.includes("{PLACE}"));
console.log("YN answers with PLACE:", ynWithPlace.length, "expected: 0");

// Проверить CANON YN-ответы
const canonYN = [];
["Y1","Y2","O1","O2","O3","R1","R2","R3","R4","K"].forEach(sub => {
  const list = Game.Data.getArgCanonGroup(sub, "YN") || [];
  list.forEach(item => canonYN.push(item.a || item.text));
});
const canonYNWithPlace = canonYN.filter(a => a && a.includes("{PLACE}"));
console.log("CANON YN with PLACE:", canonYNWithPlace.length, "expected: 0");
```

---

## P0-2: Коп DM и компенсация

### Тест 1: Успешный репорт без виктимизации
```js
console.log("=== BEFORE REPORT ===");
console.log("REP:", Game.State.rep);
console.log("Points:", Game.State.me?.points);
console.log("MoneyLog count:", Game.Debug.moneyLog?.length || 0);

// Сдать NPC без предварительного ущерба
Game.StateAPI.applyReportByRole("toxic");

console.log("=== AFTER REPORT ===");
console.log("REP:", Game.State.rep);
console.log("Points:", Game.State.me?.points);
console.log("Last 3 moneyLog:");
console.table((Game.Debug.moneyLog || []).slice(-3));
```

### Тест 2: Успешный репорт с компенсацией
```js
// Симулировать robbery (добавить запись в moneyLog)
Game.Debug.moneyLog = Game.Debug.moneyLog || [];
Game.Debug.moneyLog.push({
  time: Date.now(),
  sourceId: "me",
  targetId: "npc_toxic_1", // ID токсика
  amount: 5,
  reason: "toxic_robbery",
  currency: "points"
});

console.log("=== BEFORE COMPENSATION REPORT ===");
console.log("Points:", Game.State.me?.points);

// Сдать токсика после robbery
Game.StateAPI.applyReportByRole("токсик");

console.log("=== AFTER COMPENSATION REPORT ===");
console.log("Points:", Game.State.me?.points);
console.log("Last 5 moneyLog:");
console.table((Game.Debug.moneyLog || []).slice(-5));
```

### Проверка DM
```js
// Проверить последние DM от копа
const recentDMs = (Game.State.dms || []).filter(dm => 
  dm && dm.from && dm.from.includes("коп") || dm.from.includes("Коп")
).slice(-3);
console.log("Recent cop DMs:");
recentDMs.forEach(dm => console.log(`${dm.from}: ${dm.text}`));
```

---

## P0-3: Мгновенные тосты при голосовании

### Тест клика голосования
```js
// Создать событие для голосования
const event = Game.Events.makeNpcEvent();
Game.Events.addEvent(event);

console.log("=== BEFORE VOTE CLICK ===");
console.log("REP:", Game.State.rep);
console.log("Points:", Game.State.me?.points);
console.log("MoneyLog count:", Game.Debug.moneyLog?.length || 0);

// Кликнуть голосование (замените event.id на реальный)
Game.Events.helpEvent(event.id, "a");

console.log("=== AFTER VOTE CLICK (should be instant) ===");
console.log("REP:", Game.State.rep);
console.log("Points:", Game.State.me?.points);
console.log("Last 3 moneyLog:");
console.table((Game.Debug.moneyLog || []).slice(-3));
```

### Тест завершения голосования
```js
// Принудительно завершить событие
Game.Events.tick(); // или подождать таймер

console.log("=== AFTER VOTE COMPLETION ===");
console.log("REP:", Game.State.rep);
console.log("Points:", Game.State.me?.points);
console.log("Last 5 moneyLog:");
console.table((Game.Debug.moneyLog || []).slice(-5));
```

---

## Общая диагностика moneyLog

### Последние транзакции по типам
```js
const recent = (Game.Debug.moneyLog || []).slice(-20);

console.log("=== REP TRANSACTIONS ===");
console.table(recent.filter(l => l.currency === "rep"));

console.log("=== POINTS TRANSACTIONS ===");
console.table(recent.filter(l => !l.currency || l.currency === "points"));

console.log("=== COP RELATED ===");
console.table(recent.filter(l => l.reason && l.reason.includes("cop")));
```

### Проверка порядка тостов
```js
// Включить лог тостов (если есть)
if (Game.UI && Game.UI.pushSystem) {
  const originalPush = Game.UI.pushSystem;
  Game.UI.pushSystem = function(text) {
    console.log(`[TOAST] ${new Date().toLocaleTimeString()}: ${text}`);
    return originalPush.call(this, text);
  };
}
```

---

## Чеклист PASS/FAIL

### P0-1: YN с {PLACE}
- [ ] PASS: Нет YN-ответов с {PLACE} в базовых данных
- [ ] PASS: Нет YN-ответов с {PLACE} в CANON
- [ ] PASS: Runtime assert не срабатывает при генерации YN

### P0-2: Коп DM и компенсация
- [ ] PASS: Коп присылает DM при успешном репорте
- [ ] PASS: При виктимизации коп присылает дополнительный DM
- [ ] PASS: Компенсация пойнтов применяется и логируется в moneyLog
- [ ] PASS: Активные баттлы с арестованным NPC снимаются

### P0-3: Мгновенные тосты
- [ ] PASS: При клике голосования сразу показывается тост "-1 💰" и "+1 REP"
- [ ] PASS: REP и Points обновляются в UI мгновенно после клика
- [ ] PASS: При завершении голосования отдельно показывается тост итога
- [ ] PASS: Тосты не дублируются (участие отдельно от итога)

### Общие проверки
- [ ] PASS: moneyLog содержит все транзакции с правильными reason
- [ ] PASS: Нет дублирующих "Победа!" тостов
- [ ] PASS: UI обновляется мгновенно после каждой транзакции