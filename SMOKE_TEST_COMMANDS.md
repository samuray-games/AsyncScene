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

## 3.1. Проверка UI карточки исходящего баттла (новый SMOKE)

```js
Game.__DEV.smokeOutgoingBattleCardOnce();
```

- **PASS**: в консоли появляется `SMOKE_OUTGOING_BATTLE_CARD` с `status: "PASS"` и флагами `hasOppArg`, `hasMyCounter`, `hasResult`, `hasRematchBtn` равными `true`.
- **FAIL**: `status: "FAIL"` и одно/несколько свойств — `false`; следите за полем `details`, чтобы понять, чего не хватает, затем поправьте UI и запустите smoke снова.

## 3.2. Проверка incoming resolved args (новый SMOKE)

```text
Game.__DEV.smokeIncomingBattleCard_NoDuplicateArgsOnce();
```

- **PASS**: в консоли появляются `DUMP_AT [...]`, `SMOKE_INCOMING_BATTLE_CARD_NO_DUP_ARGS_BEGIN`, `SMOKE_INCOMING_BATTLE_CARD_NO_DUP_ARGS_JSON {... status:"PASS", reason:null, diag: { dupPayload } }` и лог `UI_BATTLE_RESOLVED_ARGS_DUP_V1` (счётчики равны 1, `dupFlags` на обоих аргументах false).
- **FAIL**: `status:"FAIL"` и `diag.dupPayload` содержит `oppArgPillsCount>1` или `myCounterPillsCount>1`; smoke возвращает `ok:false` с `reason:"arg_count_mismatch"`/`"card_missing"`, а UI ещё показывает дубли.

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

## 8. Проверка cop quota в public chat (Задача C[1])

Включи dev=1 и запусти smoke, чтобы убедиться, что копы в публичном чате не появляются чаще одной реплики на 11 NPC-сообщений.

```js
Game.__DEV.smokePublicChatCopQuotaOnce({ n: 100, seed: 123 });
```

Ожидается:

- В консоли есть `PUBLIC_CHAT_COP_QUOTA_BEGIN`, затем `PUBLIC_CHAT_COP_QUOTA_JSON {...}`, затем `PUBLIC_CHAT_COP_QUOTA_END`.
- `copCount` в коридоре 3..15, `ratio` в диапазоне 0.05–0.15 (ориентир около 0.09).
- JSON содержит `diag`: `candidatesRoleCounts`, `selectedRoleCounts`, `budget` (start/end/min/max), `usedAuthorSelector:"Web/npcs.js · NPC.randomForChat"` и `note`/`fallback` (флаг `copCandidates==0`/`cop_fallback_only_cops`).
- `notes` пуст или содержит `cop_fallback_only_cops` только при реальном fallback, `sampleAuthors` показывает несколько id/role.

PASS если все критерии соблюдены; иначе приложи JSON и пометь FAIL.

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

## 8. Проверка безопасности чтения `Game.__D` (Stage 3 Step 8 follow-up)

### Dev (`?dev=1`)

Безопасное чтение `Game.__D.securityEvents`/`securityReactions` без `RangeError` и без повторной эмиссии событий; `Game.__DEV.securityProbeOnce()` возвращает `evLen`/`rxLen`, совпадающие с результатами сниппета.

```js
(() => {
  const ev = Game?.__D?.securityEvents ?? [];
  const rx = Game?.__D?.securityReactions ?? [];
  return {
    evLen: ev.length,
    rxLen: rx.length,
    lastEv: ev.slice(-1)[0] ?? null,
    lastRx: rx.slice(-1)[0] ?? null,
  };
})();
```

### Growth probe (5 с)

```js
(() => {
  const snap1 = {
    t: Date.now(),
    ev: (Game?.__D?.securityEvents ?? []).length,
    rx: (Game?.__D?.securityReactions ?? []).length,
  };
  setTimeout(() => {
    const ev = Game?.__D?.securityEvents ?? [];
    const rx = Game?.__D?.securityReactions ?? [];
    console.log({
      snap1,
      snap2: { t: Date.now(), ev: ev.length, rx: rx.length },
      grew: { ev: ev.length - snap1.ev, rx: rx.length - snap1.rx },
      lastEv: ev.slice(-1)[0] ?? null,
      lastRx: rx.slice(-1)[0] ?? null,
    });
  }, 5000);
})();
```

### Prod (без `?dev=1`)

Выполните первый сниппет из Dev без `?dev=1`, следите за консолью (`RangeError` не должно быть) и убедитесь, что `Game.__D.securityEvents`/`securityReactions` читаются без проблем.

## 8. Bank enable gate (ECON-05)

### PROD: банк всегда отключён
```js
const before = Game.ConflictEconomy.sumPointsSnapshot();
const depositRes = Game.Bank.deposit({ amount: 1, reason: "smoke_bank_prod" });
const withdrawRes = Game.Bank.withdraw({ amount: 1, reason: "smoke_bank_prod" });
const after = Game.ConflictEconomy.sumPointsSnapshot();
const logTail = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.slice(-4) : [];
console.log({ bankEnabled: Game.Bank.enabled, depositRes, withdrawRes, before, after, logTail });
```

- Ожидается: `Game.Bank.enabled === false`, обе операции `ok:false` с `reason === "bank_disabled"`, `moneyLog` содержит `reason:"bank_disabled_attempt"`, `sumPointsSnapshot` одинаковы, points не меняются.

### DEV: включение через Dev API / dev-config
```js
Game.Dev.setBankEnabled(false);
console.log("bank_off", Game.Bank.enabled);
const failDeposit = Game.Bank.deposit({ amount: 1, reason: "smoke_bank_dev" });
const failWithdraw = Game.Bank.withdraw({ amount: 1, reason: "smoke_bank_dev" });
Game.Dev.setBankEnabled(true);
console.log("bank_on", Game.Bank.enabled);
const okDeposit = Game.Bank.deposit({ amount: 1, reason: "smoke_bank_dev" });
const okWithdraw = Game.Bank.withdraw({ amount: 1, reason: "smoke_bank_dev" });
Game.Dev.clearBankOverride();
```

- До включения на логах и `sumPointsSnapshot` виден `bank_disabled_attempt` (status `bank_disabled`), после `Game.Bank.enabled === true` оба вызова возвращают `ok:true` (points переводятся через `transferPoints`) и `moneyLog` больше не пишет `bank_disabled_attempt`.

---

## 9. Bank snapshot gate (ECON-05 Step 1)

```js
const before = Game.ConflictEconomy.sumPointsSnapshot();
const s1 = Game.Bank.snapshot({ ownerId: "me" });
const mid = Game.ConflictEconomy.sumPointsSnapshot();
console.log({
  s1,
  beforeTotal: before.total,
  midTotal: mid.total,
  bankBefore: before.byId.bank,
  bankMid: mid.byId.bank,
  moneyLogTail: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.slice(-4) : []
});
```

- PASS: `s1.ok === true`, `before.total === mid.total`, `before.byId.bank === mid.byId.bank`, `moneyLogTail` contains no entries reason starting with `"bank_"` after snapshot (snapshot read-only).
- FAIL: любой delta в totals/bank или появление новых `moneyLog` записей с `reason.startsWith("bank_")`.

---

## 10. Bank deposit gate (ECON-05 Step 2)

```js
Game.Dev.setBankEnabled(true);
const b0 = Game.ConflictEconomy.sumPointsSnapshot();
const s0 = Game.Bank.snapshot({ ownerId: "me" });
const tail0 = Game.__D && Array.isArray(Game.__D.moneyLog) ? Game.__D.moneyLog.length : 0;
const r = Game.Bank.deposit({ ownerId: "me", amount: 2, reason: "smoke_deposit_2" });
const s1 = Game.Bank.snapshot({ ownerId: "me" });
const b1 = Game.ConflictEconomy.sumPointsSnapshot();
const newRows = (Game.__D && Array.isArray(Game.__D.moneyLog))
  ? Game.__D.moneyLog.slice(tail0)
  : [];
console.log({ r, s0, s1, b0_total: b0.total, b1_total: b1.total, newRows });
const r2 = Game.Bank.deposit({ ownerId: "me", amount: 999, reason: "smoke_deposit_big" });
const newRows2 = (Game.__D && Array.isArray(Game.__D.moneyLog))
  ? Game.__D.moneyLog.slice(tail0 + newRows.length)
  : [];
console.log({ r2, newRows2 });
Game.Dev.clearBankOverride();
```

- PASS: `r.ok === true`, `b0.total === b1.total`, `s1.bankBalance === s0.bankBalance + 2`, `s1.ownerPoints === s0.ownerPoints - 2`, `newRows` содержит одну запись `reason:"bank_deposit"`, `amount:2`, `sourceId:"me"`, `targetId:"bank"`, `newRows2` пуст.
- FAIL: любой `r.ok !== true` при enabled/points, `b0.total !== b1.total`, `bankBalance`/`ownerPoints` не обновляются на ±2, или в `newRows` нет точно одного `bank_deposit`.

---

## 11. Bank regression smoke pack (ECON-05 Step 4)

> **BACKLOG skeleton:** the Bank system remains a gated skeleton while zero-sum settles; the canonical smoke to re-run is `Game.__DEV.smokeEcon05_BankOnce({ ownerId: "me" })`, and it doubles as the regression hook for ECON-05.

```js
const smoke = Game.__DEV.smokeEcon05_BankOnce({ ownerId: "me" });
console.log(smoke);
```

- PASS: `smoke.ok === true`, `smoke.failed.length === 0`, `smoke.rows.disabledAttempts === 2`, `smoke.rows.deposits === 1`, `smoke.rows.withdraws === 1`, `smoke.totals.before === smoke.totals.after === 200`, `smoke.deltas.bank === 1`, `smoke.deltas.me === -1`, `smoke.details.disabled.deposit.reason === "bank_disabled"`, `smoke.details.disabled.withdraw.reason === "bank_disabled"`, `smoke.details.disabled.rows.every(r => r.reason === "bank_disabled_attempt")`, `smoke.details.enabled.depositRows[0].reason === "bank_deposit"`, `smoke.details.enabled.withdrawRows[0].reason === "bank_withdraw"`, `smoke.details.negatives.deposit.reason === "insufficient_points"`, `smoke.details.negatives.withdraw.reason === "insufficient_bank_funds"`, и негативные проверки не добавляют новых `moneyLog` записей.
- FAIL: любой `smoke.ok !== true`, `smoke.failed` содержит `totals_drift`/`disabled_should_block`/`withdraw_overdraft_allowed`, `smoke.rows` считает неправильно, `smoke.details.enabled` не содержит правильных `bank_deposit`/`bank_withdraw` строки, или негативные проверки мутируют балансы/логи.

> `Game.Dev.smokeEcon05BankOnce()` вызывает тот же набор проверок и сам очищает override.

---

## 12. ECON-NPC flows (ECON-NPC [1.2])

1) Сгенерировать одно points-событие (например, crowd vote или battle entry).
2) Запустить:
```js
for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))
```

- PASS: `rowsScoped > 0`, `flowSummary` присутствует и стабильна, `meta.sinkDelta == 0`, `world.delta == 0`, `flowSummary.invariants` все `true`.
- FAIL: `rowsScoped == 0` после refresh, `flowSummary` отсутствует/нестабильна, или `flowSummary.invariants` содержит `false`.
## 9. Проверка автоответа NPC (Задача C[2])

```js
Game.__DEV.smokePublicChatAutoReplyOnce({ seed: 123 })
```

- PASS: mention-сообщение возвращает NPC с `replyAuthorId` согласно упоминанию, `repliesCount <= 1`, и 100 random-сообщений показывают, что villains (toxic/bandit/mafia) чаще crowd, ни одна роль не >70%, JSON содержит `diag` с `mentionDetected`, `chosenRole`, `roleCounts`, `randomReplies`, `randomDuplicates`, `totalRoleSamples`, `villainCount`, `crowdCount`.
- FAIL: `repliesCount > 1`, mention-ответ отсутствует/идентичен неупомянутому NPC, `randomReplies < 100`, или распределение ролей нарушает долю >70% / villains <= crowd.

## 13. Контраргумент: категории
### SmokeCounterArgCategories
```js
(() => {
  const args = Game._ConflictArguments || Game.ConflictArguments;
  if (!args || typeof args.myDefenseOptions !== "function") {
    console.error("SmokeCounterArgCategories: Conflict arguments API missing");
    return;
  }
  const runs = [];
  for (let i = 0; i < 10; i++) {
    const opts = args.myDefenseOptions({ attack: { type: "where" } }) || [];
    const groups = opts
      .map(opt => opt && (opt.group || opt.type || opt.qtype || opt.kind || "").toString().toLowerCase())
      .filter(Boolean);
    const unique = Array.from(new Set(groups));
    const correctCount = groups.filter(g => g === "where").length;
    const hasPad = opts.some(opt => opt && opt._pad);
    runs.push({
      run: i + 1,
      count: opts.length,
      uniqueGroups: unique.length,
      groups,
      correctCount,
      hasPad,
    });
  }
  console.table(runs);
  const pass = runs.every(r => r.count === 3 && r.uniqueGroups === 3 && r.correctCount === 1 && !r.hasPad);
  console.log("SmokeCounterArgCategories PASS?", pass);
})();
```

- PASS: 10 прогонов дают ровно 3 кнопки, каждая имеет уникальную категорию (`group`), ровно одна повторяет входной `correctType`, и никаких `_pad` fillers.
- FAIL: любой прогон нарушает 3 разных категорий, содержит дублирующийся `group`, более одного правильного или добавляет `_pad`-вариант; логировать вывод `SmokeCounterArgCategories` в `Console.txt`.
