# Консольные команды для проверки экономики REP v2

## Подготовка
Перед проверкой убедись что `Game.Debug.FORCE_CIRCULATION = false` (legacy mode).
Сбрось стат-тосты перед каждым тестом кликом по ним или `Array.from(document.querySelectorAll('.statToast')).forEach(el => el.remove())`.

Запиши начальные значения:
```js
const before = { rep: Game.State.rep, points: Game.State.me.points, wins: Game.State.me.wins, inf: Game.State.me.influence };
console.log("Before:", before);
```

---

## 1. Победа в баттле (WIN): REP +2, POINTS +2

### Ожидание
- REP: +2
- POINTS: +2 (Data.POINTS_WIN = 2)
- WINS: +1

### Команда
```js
// Создать тестовый баттл с победой
(function(){
  const b = {
    id: "test_win_" + Date.now(),
    opponentId: "npc_weak",
    result: "win",
    status: "finished",
    resolved: true,
    attack: { text: "тест", color: "y", _color: "y" },
    defense: { text: "тест", color: "y" }
  };
  Game.State.battles.push(b);
  Game.ConflictEconomy.applyResult(b);
  console.log("After WIN:", { rep: Game.State.rep, points: Game.State.me.points, wins: Game.State.me.wins });
})();
```

---

## 2. Победа над более сильным (tierDiff > 0): REP +3, POINTS +2

### Ожидание
- REP: +3 (REP_WIN_TIER_BONUS)
- POINTS: +2

### Подготовка
Установи оппоненту influence > твоего:
```js
Game.State.players.npc_weak.influence = (Game.State.me.influence || 0) + 5;
```

### Команда
```js
(function(){
  const b = {
    id: "test_upset_" + Date.now(),
    opponentId: "npc_weak",
    result: "win",
    status: "finished",
    resolved: true,
    attack: { text: "тест", color: "y", _color: "y" },
    defense: { text: "тест", color: "y" }
  };
  Game.State.battles.push(b);
  Game.ConflictEconomy.applyResult(b);
  console.log("After WIN (upset):", { rep: Game.State.rep, points: Game.State.me.points });
})();
```

---

## 3. Ничья (DRAW): REP +1, POINTS +1

### Ожидание
- REP: +1
- POINTS: +1 (Data.POINTS_DRAW)

### Команда
```js
(function(){
  const b = {
    id: "test_draw_" + Date.now(),
    opponentId: "npc_weak",
    result: "draw",
    status: "finished",
    resolved: true,
    attack: { text: "тест", color: "y", _color: "y" },
    defense: { text: "тест", color: "y" }
  };
  Game.State.battles.push(b);
  Game.ConflictEconomy.applyResult(b);
  console.log("After DRAW:", { rep: Game.State.rep, points: Game.State.me.points });
})();
```

---

## 4. Поражение (LOSE): REP −1, POINTS 0

### Ожидание
- REP: −1 (с учётом REP_FLOOR = 1)
- POINTS: 0 (Data.POINTS_LOSE)

### Команда
```js
(function(){
  const b = {
    id: "test_lose_" + Date.now(),
    opponentId: "npc_weak",
    result: "lose",
    status: "finished",
    resolved: true,
    attack: { text: "тест", color: "y", _color: "y" },
    defense: { text: "тест", color: "y" }
  };
  Game.State.battles.push(b);
  Game.ConflictEconomy.applyResult(b);
  console.log("After LOSE:", { rep: Game.State.rep, points: Game.State.me.points });
})();
```

---

## 5. Донос копу (правдивый): REP +2, POINTS 0

### Ожидание
- REP: +2
- POINTS: 0 (без изменений)

### Подготовка (добавь токсика если нет)
```js
if (!Game.State.players.npc_toxic) {
  Game.State.players.npc_toxic = { id: "npc_toxic", name: "Токсик", role: "toxic", npc: true, points: 10, influence: 0 };
}
```

### Команда (правдивый донос)
```js
Game.StateAPI.applyReportByRole("toxic");
console.log("After TRUE report:", { rep: Game.State.rep, points: Game.State.me.points });
```

---

## 6. Донос копу (ложный): REP −2 (первый), −3 (повторный), POINTS 0

### Ожидание
- REP: −2 (первый), −3 (повторный)
- POINTS: 0 (без изменений)

### Команда (ложный донос на слабого)
```js
// Сбрось историю доноса чтобы был "первый"
if (Game.State.reports && Game.State.reports.history) Game.State.reports.history.npc_weak = undefined;
Game.StateAPI.applyReportByRole("npc_weak");
console.log("After FALSE report #1:", { rep: Game.State.rep, points: Game.State.me.points });
```

### Команда (повторный ложный донос)
```js
// Сбрось cooldown
Game.State.reports.lastAt = 0;
Game.StateAPI.applyReportByRole("npc_weak");
console.log("After FALSE report #2:", { rep: Game.State.rep, points: Game.State.me.points });
```

---

## 7. Crowd поддержка игрока (majority): REP +1, POINTS +1

### Ожидание
- REP: +1
- POINTS: +1 (из crowd pool)

### Команда
Этот сценарий проверяется через tie-pick (см. пункт 12).

---

## 8. Dismiss (послать): REP −3 (первый), −4 (повторный), POINTS cost escape

### Ожидание
- REP: −3 (первый dismiss), −4 (повторный)
- POINTS: cost для escape (зависит от роли оппонента)

### Подготовка (создай активный баттл)
```js
(function(){
  const b = Game.Conflict.startWith("npc_weak");
  if (b && b.ok && b.battleId) {
    console.log("Created battle:", b.battleId);
    // Выбери атаку вручную в UI, затем выполни dismiss
  }
})();
```

### Команда (dismiss через "off" mode)
```js
(function(){
  const b = Game.State.battles.find(x => x && !x.resolved);
  if (b) {
    console.log("Before dismiss:", { rep: Game.State.rep, points: Game.State.me.points });
    Game.Conflict.escape(b.id, "off");
    console.log("After dismiss #1:", { rep: Game.State.rep, points: Game.State.me.points });
  }
})();
```

### Команда (повторный dismiss)
Создай второй баттл и повтори `escape(..., "off")`.

---

## 9. Ограбление токсиком: REP −2, POINTS по логике

### Ожидание
- REP: −2 (REP_TOXIC_ROBBERY)
- POINTS: как сейчас (токсик может забрать 2-3 points)

### Команда
Это срабатывает автоматически при проигрыше токсику. Для явной проверки:
```js
(function(){
  const b = {
    id: "test_toxic_" + Date.now(),
    opponentId: "npc_toxic",
    opponentRole: "toxic",
    result: "lose",
    status: "finished",
    resolved: true,
    fromThem: true,
    attack: { text: "тест", color: "y", _color: "y" },
    defense: { text: "тест", color: "y" }
  };
  Game.State.battles.push(b);
  // Trigger toxic special logic (проверь conflict-core.js notifyPlayer или applyRoleEffects)
  if (Game.Conflict && Game.Conflict._applyRoleEffects) Game.Conflict._applyRoleEffects(b);
  console.log("After toxic loss:", { rep: Game.State.rep, points: Game.State.me.points });
})();
```

---

## 10. Ограбление бандитом: REP −3, POINTS по логике

### Ожидание
- REP: −3 (REP_BANDIT_ROBBERY)
- POINTS: бандит забирает points (кроме 1)

### Команда
Аналогично токсику, но с role="bandit".

---

## 11. Tie-pick (выбор толпы): победа +2 REP / поражение +1 REP; POINTS +1 / 0

### Ожидание
- Победа: REP +2, POINTS +1
- Поражение: REP +1, POINTS 0

### Команда (победа в tie-pick)
```js
(function(){
  // Создай событие с tie
  const e = {
    id: "test_tie_" + Date.now(),
    aId: "npc_weak",
    bId: "npc_sad",
    state: "open",
    endsAt: Date.now() - 1000, // expired
    playerPick: "a",
    playerVoted: true,
    crowd: { votesA: 10, votesB: 5, decided: true, winner: "a" }
  };
  Game.State.events.push(e);
  // Триггер tie-pick reward
  if (Game.Events && Game.Events.applyPickReward) Game.Events.applyPickReward(e);
  console.log("After tie-pick WIN:", { rep: Game.State.rep, points: Game.State.me.points });
})();
```

### Команда (поражение в tie-pick)
```js
(function(){
  const e = {
    id: "test_tie_lose_" + Date.now(),
    aId: "npc_weak",
    bId: "npc_sad",
    state: "open",
    endsAt: Date.now() - 1000,
    playerPick: "a",
    playerVoted: true,
    crowd: { votesA: 5, votesB: 10, decided: true, winner: "b" }
  };
  Game.State.events.push(e);
  if (Game.Events && Game.Events.applyPickReward) Game.Events.applyPickReward(e);
  console.log("After tie-pick LOSE:", { rep: Game.State.rep, points: Game.State.me.points });
})();
```

---

## 12. Daily бонус: REP +1, POINTS +1

### Ожидание
- REP: +1 (REP_DAILY)
- POINTS: +1

### Команда
```js
// Сбрось lastDailyBonusAt чтобы бонус сработал снова
Game.State.progress.lastDailyBonusAt = 0;
Game.StateAPI.maybeDailyRepBonus();
console.log("After daily bonus:", { rep: Game.State.rep, points: Game.State.me.points });
```

---

## Быстрая полная проверка (all-in-one)

```js
(function(){
  console.log("=== ECON CHECK START ===");
  const log = (label) => console.log(label, { rep: Game.State.rep, pts: Game.State.me.points, wins: Game.State.me.wins });
  
  log("Initial");
  
  // WIN
  let b = { id: "tw1", opponentId: "npc_weak", result: "win", resolved: true, attack: {color:"y"}, defense: {color:"y"} };
  Game.State.battles.push(b);
  Game.ConflictEconomy.applyResult(b);
  log("After WIN (+2 REP, +2 PTS)");
  
  // DRAW
  b = { id: "td1", opponentId: "npc_weak", result: "draw", resolved: true, attack: {color:"y"}, defense: {color:"y"} };
  Game.State.battles.push(b);
  Game.ConflictEconomy.applyResult(b);
  log("After DRAW (+1 REP, +1 PTS)");
  
  // LOSE
  b = { id: "tl1", opponentId: "npc_weak", result: "lose", resolved: true, attack: {color:"y"}, defense: {color:"y"} };
  Game.State.battles.push(b);
  Game.ConflictEconomy.applyResult(b);
  log("After LOSE (-1 REP, 0 PTS)");
  
  // Daily
  Game.State.progress.lastDailyBonusAt = 0;
  Game.StateAPI.maybeDailyRepBonus();
  log("After DAILY (+1 REP, 0 PTS)");
  
  console.log("=== ECON CHECK DONE ===");
})();
```

---

## Проверка текущих констант

```js
console.log({
  REP_WIN: Game.Data.REP_WIN,
  REP_WIN_TIER_BONUS: Game.Data.REP_WIN_TIER_BONUS,
  REP_DRAW: Game.Data.REP_DRAW,
  REP_LOSE: Game.Data.REP_LOSE,
  REP_FLOOR: Game.Data.REP_FLOOR,
  REP_REPORT_FALSE: Game.Data.REP_REPORT_FALSE,
  REP_REPORT_FALSE_REPEAT: Game.Data.REP_REPORT_FALSE_REPEAT,
  REP_TOXIC_ROBBERY: Game.Data.REP_TOXIC_ROBBERY,
  REP_BANDIT_ROBBERY: Game.Data.REP_BANDIT_ROBBERY,
  REP_DISMISS: Game.Data.REP_DISMISS,
  REP_DISMISS_REPEAT: Game.Data.REP_DISMISS_REPEAT,
  REP_TIE_WIN: Game.Data.REP_TIE_WIN,
  REP_TIE_LOSE: Game.Data.REP_TIE_LOSE,
  REP_DAILY: Game.Data.REP_DAILY,
  POINTS_WIN: Game.Data.POINTS_WIN,
  POINTS_DRAW: Game.Data.POINTS_DRAW,
  POINTS_LOSE: Game.Data.POINTS_LOSE,
  CIRCULATION_ENABLED: Game.Data.CIRCULATION_ENABLED
});
```

---

## Проверка moneyLog (аудит транзакций)

```js
// Показать последние 10 транзакций REP
Game.Debug.moneyLog.filter(x => x.currency === "rep").slice(-10)

// Показать все транзакции для батла
Game.Debug.moneyLogByBattle["test_win_..."]
```

---

## Сброс для повторных тестов

```js
// Сбросить статы
Game.State.rep = 5;
Game.State.me.points = 10;
Game.State.me.wins = 0;
Game.State.me.influence = 0;
Game.StateAPI.syncMeToPlayers();
Game.UI.requestRenderAll();

// Очистить тосты
Array.from(document.querySelectorAll('.statToast')).forEach(el => el.remove());
UI.__statDeltaShown = { influence: 0, rep: 0, points: 0, wins: 0 };

// Сбросить историю доносов
Game.State.reports.history = {};
Game.State.reports.lastAt = 0;
```
