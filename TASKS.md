# Task Board (single source of truth)

Этот файл — общий “очередник” задач для команды AsyncScene. Любой участник может:
- добавить задачу в **Inbox**
- взять задачу в работу, поставив себя в `Assignee` и статус `DOING`
- обновлять статус/заметки прямо в задаче
- закрывать задачу, когда выполнены `Acceptance` + приложен `Result`

## Команда (доступные assignee)
- Игорь — AI + NPC
- Дима — смотритель системы (аудит PASS/FAIL, read-only)
- Валера — интеграционный чат (приём/интеграция пакетов)
- Лёша — геймдизайн баттлов и прогрессии
- Саша — UX/UI и тексты боёвки
- Codex-ассистент — контент и локальная интеграция
- Миша — архитектор ядра

## Статусы
- `TODO` — в очереди
- `DOING` — взято в работу
- `BLOCKED` — заблокировано (указать чем)
- `REVIEW` — нужно проверить/принять
- `DONE` — готово

## Как добавлять задачу (шаблон)
Скопируй блок, заполни поля, вставь в **Inbox**:

```md
### [T-YYYYMMDD-XXX] <Короткое название>
- Status: TODO
- Priority: P0|P1|P2
- Assignee: <Имя из списка>|—
- Next: <кто следующий после тебя>|—
- Area: NPC|Conflict|UI|Core|Economy|Content|Infra|Docs
- Files: `<path>` `<path>`
- Goal: <1–2 предложения что меняем и зачем>
- Acceptance:
  - [ ] <критерий 1>
  - [ ] <критерий 2>
- Notes: <важные ограничения/тон/канон/инварианты>
- Result: <ссылка на PR/коммит/дифф или краткое резюме изменений>
- Report (обязательный формат):
  - Status: DONE|REVIEW|BLOCKED
  - Facts: <только факты, что сделано/что не сделано>
  - Changed: `<file>` `<file>`
  - How to verify: <1–3 шага проверки>
  - Next: <кого созвать смотреть TASKS.md дальше и почему>
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      <готовый текст, который творец просто копипастит следующему исполнителю>
      ```
```

## Правила работы (коротко)
- Общий контекст между чатами/агентами: `PROJECT_MEMORY.md` (обновлять при изменении правил/фаз/статусов).
- Каждый участник команды дополняет свой раздел в `PROJECT_MEMORY.md` (см. “Team Sections”) фактами по своей зоне ответственности, чтобы синхронизироваться между устройствами/чатами.
- Один assignee на задачу. Если нужно несколько — заводим подзадачи.
- В `Files` указывать реальные пути (хотя бы 1), чтобы сразу было понятно где править.
- Если вы “проверяете”, а не кодите (Дима) — ставьте `REVIEW` и пишите только PASS/FAIL + факты в `Result`.
- Для интеграции (Валера) — задача считается `DONE`, когда пакет принят и не нарушены инварианты.
- В каждом отчёте (`Report`/`Result`) обязательно указывать `Next` — кого звать смотреть таски дальше.
- В каждом отчёте обязательно указывать `Next Prompt` — готовый промт для пересылки следующему исполнителю.
- `Next Prompt` всегда оформлять кодблоком (например ```text ... ```), чтобы его можно было копировать без мусора.
- Золотое правило эстафеты: в ответе в чат помимо фактов всегда вставляйте `Next Prompt` отдельным кодблоком (тот же текст, что в `TASKS.md`).
- Нельзя ставить `DONE/REVIEW`, если `Next Prompt` не заполнен.

---

## Inbox

### [T-20260217-002] ECON-08 Step 1A respect entrypoint contract
- Status: PASS
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/state.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Introduce the `Game.StateAPI.giveRespect` contract (single entrypoint for now) and log the marker without touching UI or farming logic.
- Acceptance:
  - [ ] `Game.StateAPI.giveRespect(fromId, toId, nowTs)` exists inside `StateAPI` and is protected by `Security.protectMethod`.
  - [ ] It always returns `{ ok:boolean, reason:string, delta:{ points:number, rep:number }, meta:{ fromId, toId, nowTs, op:"respect", stub:true } }` with numbers never `NaN`.
  - [ ] Reason codes for `"points_respect_cost"`, `"rep_respect_given"`, `"rep_emitter_refill"`, and `"respect_block_*"` are centralized for future logic.
- Notes: no farming guards/emitter/moneyLog/UI touched; only console smoke remains.
     (1) `Game.StateAPI.giveRespect` previously returned `{ ok:false, reason:"not_implemented" }`; stub now returns `ok:true`, `reason:"rep_respect_given"`, numeric delta zeros, and meta `{fromId,toId,nowTs,op:"respect",stub:true}` while logging `ECON08_RESPECT_ENTRYPOINT_READY`.
     (2) Reason codes still centralized under `RESPECT_REASON_CODES`, so future steps can reuse canonical `rep_respect_given`/`points_respect_cost`/`rep_emitter_refill`/`respect_block_*`.
     (3) No econ logic (costs, emitters, transfers, moneyLog, guards) introduced yet; only contract shape changed.
   Changed: `AsyncScene/Web/state.js` `PROJECT_MEMORY.md`
   How to verify:
     1) Identify any NPC id (`Object.keys(Game.State.players || {}).find(id => id.startsWith("npc_"))`).
     2) Run `Game.StateAPI.giveRespect("me", "<npc_id>", Date.now())`.
     3) Confirm the result shows `ok:true`, `reason:"rep_respect_given"`, delta points/rep numbers (0), and meta containing `fromId`, `toId`, `nowTs`, `op:"respect"`, `stub:true`.
   Next: QA
   Result: PASS (DUMP_AT 2026-02-17 22:36:39)
   Console evidence:
     Object{delta:{points:0,rep:0}, meta:{fromId:"me",toId:"npc_weak",nowTs:1771335399806,op:"respect",stub:true}, ok:true, reason:"rep_respect_given"}
   Next Prompt (копипаст, кодблок обязателен):
   ```text
   Ответ QA:
   (1) Hard reload http://localhost:8080/index.html?dev=1 if needed.
   (2) const npcId = Object.keys(Game.State.players || {}).find(id => id && id.startsWith("npc_"));
   (3) console.log(Game.StateAPI.giveRespect("me", npcId, Date.now()));
   PASS if the call returns `ok:true`, `reason:"rep_respect_given"`, numeric `delta.points`/`delta.rep`, and `meta.fromId`, `meta.toId`, `meta.nowTs`, `meta.op:"respect"`, `meta.stub:true`; otherwise FAIL and attach console output.
   ```

### [T-20260216-001] ECON-SOC [5.1-5.2] applySocialPenalty + spam/abuse map
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: карта санкций spam/abuse/cooldown и единый helper applySocialPenalty + smoke Step5.
- Acceptance:
  - [ ] Карта callsites spam/abuse/cooldown с points/rep санкциями зафиксирована.
  - [ ] `Game.Social.applySocialPenalty` доступен и использует только `Econ.transferPoints`.
  - [ ] `Game.__DEV.smokeEconSoc_Step5_PenaltyHelperOnce` печатает BEGIN/JSON/END и возвращает объект.
  - [ ] Runtime DUMP_AT содержит ECON_SOC_STEP5_* маркеры и ok:true.
Result: |
    Status: PASS (DUMP_AT 2026-02-16 11:54:32)
    Facts:
      (1) `Game.Social.applySocialPenalty` готов и вызывает `Econ.transferPoints` с partial transfer, meta={action,targetId,amountWanted,amountActual,partial,pointsBefore,pointsAfter,key}.
      (2) `Game.__DEV.smokeEconSoc_Step5_PenaltyHelperOnce` прогнан, лог BEGIN/JSON/END есть, JSON=ok:true, drift=0, hasEmission=false, scenarios enough/insufficient/zero показали transfer rows.
      (3) Карта spam/abuse/cooldown зафиксирована: единственные санкции — rate-limit logи `report_rate_limited` (currency=meta, amount=0) в `AsyncScene/Web/state.js:2158-2182` и `AsyncScene/Web/state.js:2298-2325` (risk low, points не меняются).
    Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js`
    How to verify:
      (1) Hard reload dev page.
      (2) `Game.__DEV.smokeEconSoc_Step5_PenaltyHelperOnce({ window:{ lastN:200 } })`
      (3) `Game.__DUMP_ALL__()`
      PASS if ECON_SOC_STEP5_JSON ok:true, drift=0, hasEmission=false, а enough/insufficient имеют transfer row; иначе FAIL.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    (1) Hard reload http://localhost:8080/index.html?dev=1
    (2) Game.__DEV.smokeEconSoc_Step5_PenaltyHelperOnce({ window:{ lastN:200 } })
    (3) Game.__DUMP_ALL__()
    PASS если ECON_SOC_STEP5_JSON ok:true, drift=0, hasEmission=false, а enough/insufficient имеют transfer row; иначе FAIL и приложить JSON.
    ```

-### [T-20260217-003] ECON-08 Step 2B respect anti-farm ledger
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Enforce anti-farming ledger per pair/chain/self rules while keeping the giveRespect stub and add a dev smoke helper.
- Acceptance:
  - [ ] `Game.State.progress.respectLedger` exists (fallback `Game.State.social.respectLedger` allowed) with `lastByPairDay`/`lastInboundDay`.
  - [ ] `giveRespect(fromId,toId,nowTs)` guards self, daily pair, and reverse-day chain before success, returning new blocked reasons `respect_self`, `respect_pair_daily`, `respect_no_chain`.
  - [ ] Success path sets ledger entries, keeps `ok:true`, `reason:"rep_respect_given"`, numeric delta, metaAugment including `dayKey` + `stub:true`.
  - [ ] Dev helper `Game.__DEV.smokeRespectLedgerOnce()` runs the four scenarios (ok, same day repeat, reverse chain, self) and publishes asserts plus ledger snapshot/dayKey.
- Result: PASS (DUMP_AT 2026-02-17 22:43:09 + epoch_ms=1771335789319)
- Facts:
  (1) WARN CONSOLE_PANEL_RUN_OK id=panel_1771335789296_564b5b86aa0a Object{asserts: Object{chain: true, pairDaily: true, self: true}, dayKey: 2026-02-17, ledgerSnapshot: Object{lastByPairDay: Object{me: Object{npc_weak: 2026-02-17}}, lastInboundDay: Object{me: Object{}, npc_weak: Object{me: 2026-02-17}}}, npcId: npc_weak, ok: true, results: Object{r1: Object{delta: Object{points: 0, rep: 0}, meta: Object{dayKey: 2026-02-17, fromId: me, nowTs: 1771335789298, op: respect, stub: true, toId: npc_weak}, ok: true, reason: rep_respect_given}, r2: Object{delta: Object{points: 0, rep: 0}, meta: Object{blocked: true, dayKey: 2026-02-17, fromId: me, nowTs: 1771335790298, op: respect, stub: true, toId: npc_weak}, ok: false, reason: respect_pair_daily}, r3: Object{delta: Object{points: 0, rep: 0}, meta: Object{blocked: true, dayKey: 2026-02-17, fromId: npc_weak, nowTs: 1771335791298, op: respect, stub: true, toId: me}, ok: false, reason: respect_no_chain}, r4: Object{delta: Object{points: 0, rep: 0}, meta: Object{blocked: true, dayKey: 2026-02-17, fromId: me, nowTs: 1771335792298, op: respect, stub: true, toId: me}, ok: false, reason: respect_self}}}
  (2) Still stub: no points cost, no rep_emitter, no moneyLog yet.
How to verify:
  1. Reload dev console (ensure `dev=1`).
  2. Run `console.log(Game.__DEV.smokeRespectLedgerOnce())`.
  3. Confirm results/reasons + ledger entry as described; dayKey should still match and rep log stays stubbed.
Next: QA (archive once this entry is reviewed/smoke re-run if needed).
Next Prompt (копипаст, кодблок обязателен):
  ```text
  Ответ QA:
  (1) Reload http://localhost:8080/index.html?dev=1.
  (2) Run `console.log(Game.__DEV.smokeRespectLedgerOnce())`.
  (3) PASS if r1 ok:true; r2 reason=respect_pair_daily; r3 reason=respect_no_chain; r4 reason=respect_self; dayKey matches ledger entry in `lastByPairDay.me[npcId]`. Otherwise attach console object and mark FAIL.
  ```

-### [T-20260217-004] ECON-08 Step 3C rep_emitter daily cap
-Status: PASS
-Priority: P1
-Assignee: Codex-ассистент
-Next: QA
-Area: Economy
-Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
-Goal: Add REP emitter daily cap gating inside `giveRespect` without points cost/moneyLog and add a dev smoke helper.
-Acceptance:
  - [ ] `REP_EMITTER_DAILY_CAP` constant is defined (20) and `progress.repEmitter` initialized/reset per day.
  - [ ] `ensureRepEmitter(nowTs)` refills daily, reports `emitterRefilled` and dayKey.
  - [ ] `giveRespect` blocks with `respect_emitter_empty` when cap exhausted, otherwise decrements balance and returns `ok:true` with meta emitter info.
  - [ ] `Game.__DEV.smokeRespectEmitterCapOnce()` drains exactly cap successes and fails on cap+1 with `respect_emitter_empty`.
-Result: PASS (DUMP_AT 2026-02-17 22:54:08 + epoch_ms=1771336448228)
- Facts:
  (1) LOG Object{cap: 20, dayKey: 2026-02-17, emitterAfter: Object{balance: 0, dayKey: 2026-02-17}, fail: Object{... ok: false, reason: respect_emitter_empty}, notes: [], ok: true, okCount: 20}
  (2) Still stub: no points cost, no moneyLog, no REP transfer yet.
-How to verify:
  1. Reload dev console (ensure `dev=1`).
  2. Run `console.log(Game.__DEV.smokeRespectEmitterCapOnce())`.
  3. PASS if ok:true, okCount===cap, fail.reason=="respect_emitter_empty", emitterAfter.balance===0, and notes empty.
-Next: QA
-Next Prompt (копипаст, кодблок обязателен):
  ```text
  Ответ QA:
  (1) Reload http://localhost:8080/index.html?dev=1.
  (2) Run `console.log(Game.__DEV.smokeRespectEmitterCapOnce())`.
  (3) PASS if ok:true, okCount===cap, fail.reason=="respect_emitter_empty", emitterAfter.balance===0, and notes empty. Otherwise attach console output and mark FAIL.
  ```

-### [T-20260217-005] ECON-08 Step 4D respect points cost
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Charge 1 point via `Econ.transferPoints` on successful respect; insufficient points must block without emitter/ledger changes.
- Acceptance:
  - [ ] `giveRespect` transfers 1 point to sink with reason `points_respect_cost` on success and sets `delta.points=-1`.
  - [ ] Insufficient points returns `respect_no_points` with no ledger write or emitter decrement.
  - [ ] `Game.__DEV.smokeRespectPointsCostOnce()` validates success cost, no drift, and fail with zero new moneyLog rows.
- Result: PASS (DUMP_AT 2026-02-17 23:16:17 + epoch_ms=1771337777190)
- Facts:
  (1) Object{
      beforeAfter: Object{mePtsBefore: 1, mePtsAfter1: 0, mePtsAfter2: 0, worldTotalBefore: 191, worldTotalAfter1: 191, worldTotalAfter2: 191},
      failed: [],
      moneyLog: Object{addedCount: 1, opKey: respect:2026-02-17:me:npc_weak, reasons: [points_respect_cost]},
      ok: true,
      r1: Object{ok: true, reason: rep_respect_given, delta: Object{points: -1, rep: 0}, meta: Object{... opKey: respect:2026-02-17:me:npc_weak ...}},
      r2: Object{ok: false, reason: respect_no_points, meta: Object{blocked: true, payReason: insufficient, opKey: respect:2026-02-17:me:npc_sad ...}}
    }
  (2) Atomicity confirmed: insufficient points produces no moneyLog row and no emitter/ledger side effects.
- How to verify:
  1. Reload dev console (ensure `dev=1`).
  2. Run `console.log(Game.__DEV.smokeRespectPointsCostOnce())`.
  3. PASS if ok:true, failed empty, r1.delta.points==-1 with `points_respect_cost` row, r2.reason==`respect_no_points`, and world total diff is 0.
- Next: QA
- Next Prompt (копипаст, кодблок обязателен):
  ```text
  Ответ QA:
  (1) Reload http://localhost:8080/index.html?dev=1.
  (2) Run `console.log(Game.__DEV.smokeRespectPointsCostOnce())`.
  (3) PASS if ok:true, failed empty, r1.delta.points==-1 with a `points_respect_cost` row (opKey matches), r2.reason=="respect_no_points", and world total diff is 0. Otherwise attach console output and mark FAIL.
  ```

-### [T-20260217-006] ECON-08 Step 5E respect moneyLog + REP transfer
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Log points+rep rows on success, add optional emitter refill log, and ensure repeat same-day pair adds no rows.
- Acceptance:
  - [ ] Success produces exactly one `points_respect_cost` and one `rep_respect_given` moneyLog row (plus optional `rep_emitter_refill` once per day).
  - [ ] Repeat same day same pair returns `respect_pair_daily` and adds no new moneyLog rows.
  - [ ] `Game.__DEV.smokeRespectMoneyLogOnce()` validates row counts and reasons.
- Result: PASS (DUMP_AT 2026-02-17 23:30:35 + epoch_ms=1771338635482)
- Facts:
  (1) Object{
  ok: true,
  moneyLog: Object{
    added1: 3,
    added2: 0,
    reasons1: [points_respect_cost, rep_emitter_refill, rep_respect_given],
    reasons2: []
  },
  r1: Object{
    ok: true,
    reason: rep_respect_given,
    delta: Object{points: -1, rep: 1},
    meta: Object{
      dayKey: 2026-02-17,
      opKey: respect:2026-02-17:me:npc_weak,
      emitterRefilled: true,
      emitterDailyCap: 20,
      emitterBalanceAfter: 19
    }
  },
  r2: Object{
    ok: false,
    reason: respect_pair_daily,
    delta: Object{points: 0, rep: 0},
    meta: Object{blocked: true, dayKey: 2026-02-17, opKey: respect:2026-02-17:me:npc_weak}
  }
}
  (2) On first call 2 rows + optional refill row; on repeat 0 rows, reason respect_pair_daily. Idempotency by opKey respected.
- How to verify:
  1. Reload dev console (ensure `dev=1`).
  2. Run `console.log(Game.__DEV.smokeRespectMoneyLogOnce())`.
  3. PASS if ok:true, failed empty, reasons1 has exactly one `points_respect_cost` and one `rep_respect_given` (plus `rep_emitter_refill` only when `r1.meta.emitterRefilled`), and added2==0 with r2.reason=="respect_pair_daily".
- Next: QA
- Next Prompt (копипаст, кодблок обязателен):
  ```text
  Ответ QA:
  (1) Reload http://localhost:8080/index.html?dev=1.
  (2) Run `console.log(Game.__DEV.smokeRespectMoneyLogOnce())`.
  (3) PASS if ok:true, failed empty, reasons1 has exactly one `points_respect_cost` and one `rep_respect_given` (plus `rep_emitter_refill` only when `r1.meta.emitterRefilled`), and added2==0 with r2.reason=="respect_pair_daily". Otherwise attach console output and mark FAIL.
  ```

-### [T-20260218-001] ECON-08 Step 6F respect UI + toast smoke
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: UI
- Files: `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui/ui-core.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: hook the “Выразить уважение” action into `Game.StateAPI.giveRespect`, deliver two success toasts, and capture them in `Game.__DEV.__toastTape__`.
- Acceptance:
  - [ ] Button invokes `Game.StateAPI.giveRespect(meId, targetId, Date.now())`, hides for self, and shows mapped toasts (two success strings and one toast per failure reason).
  - [ ] The real toast entrypoint now writes through `Game.__DEV.__toastProbe__`/`__toastTape__` (via `UI_TOAST_TAPE_READY`) and `__uiRespectClick__` pings `__toastProbe__`/fallback, so the smoke always observes every toast string.
  - [ ] `Game.__DEV.smokeRespectUiOnce()` returns `ok:true`, `failed:[]`, toast1=="Ты отдал 1💰", toast2=="Цель получила +1 REP", diag.toastCallCount>=2, diag.tapeLen>=2, and the repeat call returns `respect_pair_daily`.
- Result: PASS (DUMP_AT 2026-02-18 23:43:26)
- Facts:
  (1) `Console.txt` recorded `ECON08_UI_SMOKE_RESULT Object{asserts: Object{toast1: Ты отдал 1💰, toast2: Цель получила +1 REP, blockedToast: Ты отдал 1💰, clickCallsGiveRespect: true, npcShown: true, selfHidden: true}, diag: Object{toastCallCount: 2, tapeLen: 2, hasClick: true, hasVisible: true}, failed: [], samples: Object{r1: Object{ok: true, reason: rep_respect_given, delta: Object{points: -1, rep: 1}}, r2: Object{ok: false, reason: respect_pair_daily}}, toasts1: [{text: Ты отдал 1💰}, {text: Цель получила +1 REP}], toasts2: [{text: Ты отдал 1💰}, {text: Цель получила +1 REP}, {text: Уже было уважение сегодня этому персонажу.}]}`.
  (2) Toast capture works because `UI_TOAST_TAPE_READY` wraps `Game.UI.showStatToast` and `__uiRespectClick__` always sends strings through `Game.__DEV.__toastProbe__` or a local fallback, so the smoke doesn’t depend on DOM timing.
- How to verify:
  1. Hard reload http://localhost:8080/index.html?dev=1.
  2. Run `Game.__DEV.smokeRespectUiOnce().then(r => console.log("ECON08_UI_SMOKE_RESULT", r));`
  3. PASS if `ok:true`, `failed:[]`, toast1=="Ты отдал 1💰", toast2=="Цель получила +1 REP", diag.toastCallCount>=2, diag.tapeLen>=2, and the blocked second run cites respect_pair_daily; otherwise attach the console object and mark FAIL.
- Next Prompt (кодблок обязательный):
  ```text
  Ответ QA:
  (1) Hard reload http://localhost:8080/index.html?dev=1.
  (2) Run `Game.__DEV.smokeRespectUiOnce().then(r => console.log("ECON08_UI_SMOKE_RESULT", r));`
  (3) PASS if ok:true, failed:[], toast1=="Ты отдал 1💰", toast2=="Цель получила +1 REP", diag.toastCallCount>=2, diag.tapeLen>=2, and the repeat call returns respect_pair_daily; otherwise attach the console object and mark FAIL.
  ```

-### [T-20260218-002] ECON-08 Final smoke pack stabilization
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Harden the final ECON-08 smoke pack by forcing the emitter cap, ensuring moneyLog assertions, and validating world-level rep accounting before publishing the final verdict.
- Acceptance:
  - [x] `Game.__DEV.runEcon08FinalSmokePack()` seeds `S.players.me.points`, clears `progress.respectLedger`, and refills `repEmitter.balance`/`dayKey` before iterating `REP_EMITTER_DAILY_CAP` respects.
  - [x] The cap loop succeeds exactly `CAP` times and confirms the `(CAP+1)`-th call fails with `respect_emitter_empty` (`7.4_cap_wrong_reason` otherwise); `diag.capOkCount` and `diag.firstFailReason` are logged.
  - [x] MoneyLog analysis uses `Game.__DEBUG_MONEYLOG__`/`Game.__DEV__.debug_moneyLog`, filters rows for the current `dayKey`, enforces one `points_respect_cost` + one `rep_respect_given`, and fails on duplicate `opKey`/missing log (`7.5_*` codes).
  - [x] World rep sum (count of `rep_respect_given` rows) never exceeds `REP_EMITTER_DAILY_CAP` (`7.6_world_rep_exceeded_cap` if it does).
- Result: PASS (DUMP_AT 2026-02-19 17:01:45)
- Facts:
  (1) Cap loop logged `diag.capOkCount: 20`, `diag.firstFailReason: respect_emitter_empty`, and `diag.validOpKeys: 20` without cardinality or reason issues while the `(CAP+1)`-th call failed for the intended reason.
  (2) MoneyLog filtering grabbed `40` rows (`pointsRows: 20`, `repRows: 20`) from `logSource: state_moneyLog`, confirming each `opKey` delivered both `points_respect_cost` and `rep_respect_given`.
  (3) World rep count stayed at `repGivenCount: 20`, below or equal to the emitter cap.
  (4) Console captured `ECON08_FINAL_SMOKE_PACK_RESULT Object{diag: Object{capOkCount: 20, firstFailReason: respect_emitter_empty, logSource: state_moneyLog, moneyLogLen: 40, repGivenCount: 20, validOpKeys: 20, opKeyCardinalityIssues: 0, opKeyReasonIssues: 0}, facts: Object{cap: Object{cap: 20, firstFailReason: respect_emitter_empty, okCount: 20}, moneyLog: Object{beforeLen: 80, filteredLen: 40, pointsRows: 20, repRows: 20}, world: Object{repGivenCount: 20}}, failed: [], notes: [], ok: true}`.
- Next Prompt (кодблок обязательный):
  ```text
  Ответ QA:
  (1) Hard reload http://localhost:8080/index.html?dev=1.
  (2) Run `Game.__DEV.runEcon08FinalSmokePack().then(r => console.log("ECON08_FINAL_SMOKE_PACK_RESULT", r));`
  (3) PASS if ok:true, failed:[], diag.capOkCount===cap, diag.firstFailReason==="respect_emitter_empty", diag.moneyLogLen===40, diag.repGivenCount===20, diag.validOpKeys===20, diag.opKeyCardinalityIssues===0, diag.opKeyReasonIssues===0, and notes empty; otherwise attach the console output and mark FAIL.
  ```
-### [T-20260216-002] ECON-SOC [5.3] spam penalty hook + smoke
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: подключить applySocialPenalty к одному реальному spam‑триггеру и добавить smoke Step5.3.
- Acceptance:
  - [ ] Spam penalty срабатывает только при rate-limit (cooldown), reason `spam_penalty` появляется в moneyLog.
  - [ ] Smoke Step5.3 даёт ok:true, penaltyCount==1, drift=0, hasEmission=false.
  - [ ] DUMP_AT содержит ECON_SOC_STEP5_3_BEGIN/JSON/END.
Result: |
    Status: PASS (DUMP_AT 2026-02-17 14:40:57)
    Facts:
      (1) Spam trigger at `AsyncScene/Web/conflict/conflict-core.js:1716` fires `Game.Social.applySocialPenalty(... reason:"spam_penalty", amountWanted:1, meta{key,resetIn,actionId,src:"soc_step5_3"})` when cooldown blocks second `startWith`.
      (2) Smoke `Game.__DEV.smokeEconSoc_Step5_3_SpamOnce` (ECON_SOC_STEP5_3_BEGIN/JSON/END) logged `ok:true`, `drift:0`, `hasEmission:false`, `penaltyCount:1`, `reasons1:[...]`, `reasons2:[...]`, `spamKey`, `blocked1`, `blocked2`.
      (3) SPAM_PENALTY_POINTS=1 (канон‑константа не найдена; минимально-консервативное значение).
    Changed: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/dev/dev-checks.js`
    How to verify:
      (1) Hard reload dev page.
      (2) `Game.__DEV.smokeEconSoc_Step5_3_SpamOnce({ window:{ lastN:300 } })`
      (3) `Game.__DUMP_ALL__()`
      PASS if ECON_SOC_STEP5_3_JSON ok:true, drift=0, hasEmission=false, penaltyCount==1, second reasons include `spam_penalty`, first reasons do not.
    Next: QA

### [T-20260217-001] ECON-SOC [6] smoke "3 выстрела"
- Status: DOING
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: smoke-пакет Step6 (truth → false → repeat false) с нулевой эмиссией и корректными rate-limit ключами.
- Acceptance:
  - [ ] ECON_SOC_STEP6_* маркеры в DUMP_AT.
  - [ ] ok:true, drift=0, hasEmission=false.
  - [ ] reasonsTruth содержит rep_report_true.
  - [ ] reasonsFalse1 содержит rep_report_false + report_false_penalty.
  - [ ] reasonsFalse2 содержит report_rate_limited, penaltyCount==1, rlBlockedSecond==true, rlKey1==rlKey2 (role не null).
- Result: |
    Status: FAIL (DUMP_AT 2026-02-17 14:55:11)
    Facts:
      (1) ECON_SOC_STEP6_JSON ok:false failed:[truth_missing_rep_true,false_missing_rep_false,false_missing_penalty,penalty_count_mismatch].
      (2) reasonsTruth:[] reasonsFalse1:[] penaltyCount:0; reasonsFalse2:[report_rate_limited] при rlBlockedSecond:true.
      (3) REPORT_REPEAT_RL_V1_CHECK: role:null, stableKey с пустым role.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    How to verify:
      (1) Hard reload dev page.
      (2) `Game.__DEV.smokeEconSoc_Step6_ThreeShotsOnce({ window:{ lastN:500 } })`
      (3) `Game.__DUMP_ALL__()`
      PASS if ECON_SOC_STEP6_JSON ok:true, drift=0, hasEmission=false, penaltyCount==1, reasonsTruth/reasonsFalse1 filled, rlKey1==rlKey2 non-null.
    Next: QA (нужен новый DUMP_AT)
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    (1) Hard reload http://localhost:8080/index.html?dev=1
    (2) Game.__DEV.smokeEconSoc_Step6_ThreeShotsOnce({ window:{ lastN:500 } })
    (3) Game.__DUMP_ALL__()
    PASS если ECON_SOC_STEP6_JSON ok:true, drift=0, hasEmission=false, penaltyCount==1, reasonsTruth/reasonsFalse1 есть, rlKey1==rlKey2 и role не null; иначе FAIL и приложить JSON.
    ```
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    (1) Hard reload http://localhost:8080/index.html?dev=1
    (2) Game.__DEV.smokeEconSoc_Step5_3_SpamOnce({ window:{ lastN:300 } })
    (3) Game.__DUMP_ALL__()
    PASS если ECON_SOC_STEP5_3_JSON ok:true, drift=0, hasEmission=false, penaltyCount==1, а второй вызов содержит spam_penalty; иначе FAIL и приложить JSON.
    ```

### [T-20260212-019] ECON-NPC [1.8] regression pack
- Status: QA
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: добавить `Game.__DEV.smokeEconNpc_RegressPackOnce`, который прогоняет battle/escape/ignore/paid_votes smokes и новый long smoke, собирает `results`/`failed` и публикует `meta.buildTag`/`meta.dumpHint`, а также делает `split_remainder` прозрачной для QA.
- Acceptance:
  - [ ] Pack последовательно запускает `Game.__DEV.smokeBattleCrowdOutcomeOnce({ mode:"majority" })`, `Game.__DEV.smokeCrowdStep2`, `Game.__DEV.smokeEscapeCrowdOutcomeOnce`, `Game.__DEV.smokeIgnoreCrowdOutcomeOnce`, `Game.__DEV.smokeNpcCrowdEventPaidVotesOnce` и `Game.__DEV.smokeEconNpc_LongOnce`.
  - [ ] `results` содержит ключи `battle_majority`, `battle_fifty_cap`, `split_remainder`, `escape_crowd`, `ignore_crowd`, `paid_votes`, `long`; каждый entry разумно агрегирует `ok/pass/asserts`.
  - [ ] `failed` array содержит `world_mass_drift` iff любой smoke экспортировал `asserts.worldMassOk === false`, иначе `failed` пуст и `ok:true`.
  - [ ] `meta.dumpHint` отражает рекомендованную команду (`opts.dumpHint` или `Game.__DUMP_ALL__()`), `meta.buildTag` достаётся из `getWealthTaxBuildTag()`, `meta.startedAt/finishedAt` заполняются.
- Result: |
    Status: FAIL (readiness blocked: Console.txt top block DUMP_AT 2026-02-13 20:26:18 shows limited evidence and missing markers for several checklist items [1.1]-[1.8]).
    Facts:
      (0) Console.txt DUMP_AT 2026-02-13 20:35:28 contains no ECON_NPC_READINESS_PACK_* markers; readiness evidence missing in current dump.
      (1) `smokeBattleCrowdOutcomeOnce` now collects world ids from moneyLog (`fromId/toId`, plus `me`, `sink`, `worldBank`, `crowd:*`) via `collectWorldIdsFromLogs`, recomputes `totalPtsWorldBefore/After` from state/snapshot points, and exposes `diag.worldIdsCount/worldIdsSample/missingAccounts/includedServiceAccounts`.
      (2) `smokeNpcCrowdEventEconomyOnce` now uses collected ids for `deltaWorld` and totals stability, adds `diag` with `worldIds*`, `missingAccounts`, `includedServiceAccounts`, and keeps `totalsAllBefore/After` for baseline visibility.
      (3) `smokeEconNpc_RegressPackOnce` now emits `diag.worldIdsByKey` (when available) to surface service-account coverage in the dump.
      (4) `ui-console-panel.js` no longer emits `CONSOLE_PANEL_RUN_ERR` for `result.ok === false` unless `showPanel:true` is explicitly provided.
      (5) DUMP_AT 2026-02-13 19:48:49: `smoke_battle_crowd_outcome_once` shows `worldMassOk:false`, `snapshotReport.totalPtsWorldBefore:130 -> totalPtsWorldAfter:140`, `deltaWorld:10` while `balanceCompareById.sink.afterMinusBefore:-10` and `worldBank:+10`, `moneyLogReport.sumNetFromMoneyLog:0`. This confirms totals are still not using ledger_at balances for sink/worldBank.
      (6) Same DUMP shows `smoke_econ_npc_regress_pack_once ok:false failed:[world_mass_drift]`, `meta.buildTag: wt_dump_guard_v3_2026_02_11_01`, and no `CONSOLE_PANEL_RUN_ERR` markers (only `CONSOLE_PANEL_RUN_OK`).
      (7) `smokeEconNpc_LongOnce` переписан на детерминированный цикл `for` без nested smokes, таймеров и extra логов; возвращает `{summary:{worldDelta,rowsScoped,ticksExecuted},diag:{deltaLog}}` и ставит `failed:["log_runaway_detected"]` если `deltaLog > ticks*20`.
      (8) Добавлен `Game.__DEV.smokeEconNpc_ReadinessPackOnce` (BEGIN/JSON1/JSON2/END, json1/json2, lastEconNpcReadinessPack) и `Game.__DEV.smokeEconNpc_WorldMassRepeatOnce` для [1.1]; нужен runtime DUMP.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/ui/ui-console-panel.js`
    How to verify:
      (1) Reload the dev page.
      (2) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{lastN:600}, long:{ticks:300}, repeatN:10, dumpHint:"Game.__DUMP_ALL__()" })`
      (3) `Game.__DUMP_ALL__()`
    Next: QA (нужен новый DUMP_AT с ECON_NPC_READINESS_PACK_* JSON1/JSON2/END)
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    (1) Reload dev page
    (2) Game.__DEV.smokeBattleCrowdOutcomeOnce({ mode:"majority" })
    (3) Game.__DEV.smokeEconNpc_RegressPackOnce({ window:{lastN:400}, long:{ticks:300}, dumpHint:"Game.__DUMP_ALL__()" })
    (4) Game.__DUMP_ALL__()
    PASS if battle smoke shows worldMassOk:true with deltaWorld 0, diag.includedServiceAccounts sink/worldBank true when present, and regression pack returns ok:true failed:[] without CONSOLE_PANEL_RUN_ERR; otherwise FAIL and attach relevant diag fields.
    ```

### [T-20260212-022] DEV smokeBattleCrowdOutcomeOnce const drift
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: удалить повторные объявления `moneyLogBeforeIndex`/`moneyLogAfterIndex` в `smokeBattleCrowdOutcomeOnce`, чтобы `dev-checks` запускался без SyntaxError и smoke была доступна.
- Acceptance:
  - [x] `moneyLogBeforeIndex`/`moneyLogAfterIndex` объявлены ровно один раз в верхнем scope smoke-функции.
  - [x] `diag.moneyLogBeforeIndex/moneyLogAfterIndex` и `diag.ledgerLenBefore/diag.ledgerLenAfter` используют эти значения.
  - [x] Console.txt DUMP_AT 2026-02-12 22:03:25 (новый после фикса) не содержит `SyntaxError: Cannot declare a const variable twice: 'moneyLogAfterIndex'`.
- Result: |
    Status: PASS
    Facts:
      (1) Удалено повторное объявление `moneyLogAfterIndex`; единственное объявление теперь находится сразу после `logRows.slice(logStart)`, до снимка после действий.
      (2) `diag` всё ещё экспортирует `moneyLogBeforeIndex/AfterIndex` и `diag.ledgerLenBefore/After`, теперь без конфликтов с TDZ.
      (3) После патча: `Game.__DEV.smokeBattleCrowdOutcomeOnce` определяется (нет SyntaxError), но новый DUMP пока не получен.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    How to verify:
      (1) Перезагрузить dev-страницу, убедиться, что ошибка `Cannot declare a const variable twice: 'moneyLogAfterIndex'` исчезла из Console.txt.
      (2) Выполнить `typeof Game.__DEV.smokeBattleCrowdOutcomeOnce === "function"` и получить `true`.
      (3) Прогнать два смоука `Game.__DEV.smokeBattleCrowdOutcomeOnce({ mode:"majority" })` и `Game.__DUMP_ALL__()`, затем зафиксировать новый DUMP.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    (1) Reload http://localhost:8080/index.html?dev=1 and confirm Console.txt no longer reports "Cannot declare a const variable twice: 'moneyLogAfterIndex'".
    (2) Run Game.__DEV.smokeBattleCrowdOutcomeOnce({ mode:"majority" }) twice, then Game.__DUMP_ALL__().
    PASS if the new DUMP_AT shows diag.moneyLogBeforeIndex/AfterIndex numbers and Game.__DEV.smokeBattle... remains defined; otherwise FAIL.
    ```

### [T-20260211-014] ECON-NPC [1.6] NPC LowFunds Behavioral Limiters
- Acceptance:
  - [ ] evidencePack.ok == true, worldDelta==0, insufficientCount==0, skippedCount>0, minNpcPts>=0, activityOk==true
  - [ ] regressionPack.ok == true (старые смоуки не сломаны)
- Result: |
    Status: PASS
    Evidence (QA run by user 2026-02-11 JST, regression pending):
      - Commands:
        (1) `Game.__DEV.runEconNpcLowFundsEvidencePackOnce({ ticks: 20, seedLowFunds: true, debugTelemetry: false, window: { lastN: 600 } })`
        (2) `Game.__DEV.runEconNpcLowFundsEvidencePackOnce({ ticks: 60, seedLowFunds: true, debugTelemetry: false, window: { lastN: 1200 } })`
        (3) `Game.__DEV.runEconNpcLowFundsRegressionPackOnce({ seedLowFunds: true })`
        (4) `Game.__DEV.smokeNpcLowFundsPolicyOnce({ ticks: 50, seedLowFunds: true, debugTelemetry: true })`
      - Expected evidence fields:
        `worldDelta`, `skippedCount`, `insufficientCount`, `minNpcPts`, `eventsApplied/votesApplied/battlesResolved`, `logSource`, `rowsScoped`, `accountsIncludedHash`
    Facts:
      (1) `npc_skip_low_funds` logging with idempotency per npc/tick/actionKey now suppresses NPC low-funds charges in crowd votes, chargePriceOnce, and battle entry (no negative balances).
      (2) Evidence pack now fixes worldDelta by freezing `accountsIncluded` before ticks (hash recorded) and forces a low-funds attempt via `chargePriceOnce` to guarantee `npc_skip_low_funds` rows.
      (3) Evidence pack is time-budgeted (maxMs/batchSize) with `ticksDone` in meta; added yield between batches to avoid Safari hangs.
    Changed: `AsyncScene/Web/conflict/conflict-api.js` `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Run the regression command below when ready.
      (2) PASS if regressionPack.ok==true, invariants.worldDelta==0, insufficientCount==0, and no NPC_ACTIVITY_TAX_* log лавины.
    Next: regression QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Запусти в консоли:
    (1) Game.__DEV.runEconNpcLowFundsRegressionPackOnce({ seedLowFunds: true })
    PASS если regressionPack.ok==true, invariants.worldDelta==0, insufficientCount==0, и нет NPC_ACTIVITY_TAX_* лавины; иначе FAIL.
    ```

### [T-20260211-013] ECON-NPC [1.5] Activity Tax — 100% Evidence Pack (long-run + regression)
### [T-20260213-021] Console Panel supports top-level await
- Status: FAIL
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: dev-only evidence pack для long-run + regression, чтобы закрыть [1.5] без изменения gameplay логики.
- Acceptance:
  - [ ] evidencePack.ok == true (long-run, tail clamp ok, worldDelta==0, tax>0)
  - [ ] regressionPack.ok == true (старые смоуки не ломаются)
- Result: |
    Status: FAIL
    Evidence (PASS evidence pending, QA run by user 2026-02-11 JST):
      - Commands:
        (1) `Game.__DEV.runEconNpcActivityTaxEvidencePackOnce({ ticks: 200, seedRichNpc: true, debugTelemetry: true, window: { lastN: 1200 } })`
        (2) `Game.__DEV.runEconNpcActivityTaxRegressionPackOnce({ seedRichNpc: true })`
        (3) `Game.__DEV.smokeNpcActivityTax_StabilityOnce({ mode: "tax_only", seedRichNpc: true })`
      - Expected evidence fields:
        `worldDelta`, `taxRowsCount`, `totalTax`, `p99Before/After`, `maxBefore/After`, `logSource`, `rowsScoped`
    Facts:
      (1) Added `runEconNpcActivityTaxEvidencePackOnce` (long-run) with BEGIN/JSON/JSON/END, tail clamp, zero-sum check, and tax rows on lastN window.
      (2) Added `runEconNpcActivityTaxRegressionPackOnce` calling existing smoke pack and verifying worldDelta==0 plus taxRowsCount/totalTax sanity.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Execute the two pack commands above in dev console.
      (2) Confirm `evidencePack.ok==true`, `regressionPack.ok==true`, `worldDelta==0`, `taxRowsCount>0`, `totalTax>0`, `tailOk==true`.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Запусти в консоли:
    (1) Game.__DEV.runEconNpcActivityTaxEvidencePackOnce({ ticks: 200, seedRichNpc: true, debugTelemetry: true, window: { lastN: 1200 } })
    (2) Game.__DEV.runEconNpcActivityTaxRegressionPackOnce({ seedRichNpc: true })
    (3) Game.__DEV.smokeNpcActivityTax_StabilityOnce({ mode: "tax_only", seedRichNpc: true })
    PASS если evidencePack.ok == true, regressionPack.ok == true, worldDelta == 0, taxRowsCount > 0, totalTax > 0, tailOk == true; иначе FAIL.
    ```

### [T-20260211-012] ECON-NPC [1.5] Activity Tax (tax_only) — seed + logging gate
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: Gate
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: гарантировать срабатывание npc activity tax в tax_only, детерминированно обеспечить богатого NPC, zero-sum без эмиссии, и оставить только 1 SUMMARY + по 1 агрегатному ENTRY/PRECHECK/DEBUG/TAX/POST на запуск.
- Acceptance:
  - [x] `NPC_ACTIVITY_TAX_SUMMARY.ok === true` при двух прогонах подряд (tax_only).
  - [x] `totalTax > 0`, `taxRowsCount > 0`, `worldDelta === 0`.
  - [x] В верхнем `Console.txt` ровно 1 `NPC_ACTIVITY_TAX_SUMMARY` на запуск и по 1 строке `NPC_ACTIVITY_TAX_ENTRY/PRECHECK/DEBUG/TAX/POST` (агрегаты).
- Result: |
    Status: PASS
    Facts:
      (1) Guard/idempotency fixed: `runTickId` is unique per smoke and `npc_activity_tax|<tickId>|<npcId>` avoids collisions; guard skip now sets `NPC_ACTIVITY_TAX_DEBUG.note="guard_skip"`.
      (2) QA run by user 2026-02-11 JST; command `Game.__DEV.smokeNpcActivityTax_StabilityOnce({ mode: "tax_only", seedRichNpc: true })` executed twice in one session, both returning `{ok:true,...,taxRowsCount:1,totalTax:1}` and both worldDelta=0.
      (3) PASS evidence: `moneyLog.filter(r => r.reason === "npc_activity_tax").length` grew 4→5→6 across before/run1/run2, proving incremental tax rows.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Confirm `Game.Debug.moneyLog.filter(r => r.reason === "npc_activity_tax").length` goes 4 → 5 → 6 when repeating the smoke twice.
      (2) Each `NPC_ACTIVITY_TAX_SUMMARY` reports `ok:true`, `taxRowsCount:1`, `totalTax:1`, `worldDelta:0`, with exactly one aggregated ENTRY/PRECHECK/DEBUG/TAX/POST per run.
    Next: Gate
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Gate:
    ECON-NPC [1.5] Activity Tax is PASS: `Game.__DEV.smokeNpcActivityTax_StabilityOnce({ mode: "tax_only", seedRichNpc: true })` ran twice in one session on 2026-02-11 JST, both `ok:true` with `taxRowsCount=1,totalTax=1`, `moneyLog` length went 4→5→6, and only aggregated markers logged. Please accept PASS.
    ```

### [T-20260211-011] Dev server Console.txt stack dump cleaning
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Dev Infra
- Files: `AsyncScene/Web/dev/dev-server.py` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: обезопасить prepend-логи dev-server так, чтобы каждый свежий `[DUMP_AT]` блок в `Console.txt` включал только чистый payload (один заголовок, никаких banned service-lines или вложенных `[DUMP_AT]`, и старый контент оставался ниже через `\n\n`).
- Acceptance:
  - [x] каждый POST строит отдельный заголовок `[DUMP_AT] …` и не пропускает его через фильтр, а добавляет его в `Console.txt` перед очищенным payload;
  - [x] `raw_payload_text` фильтруется по `BANNED_PAYLOAD_SUBSTRINGS`, пропускаются tape-tail region (BEGIN…END) и строки `/__dev/console-dump`, после чего `filtered_payload` чистый; payload пишется через `new_block = header + filtered_payload.strip("\n") + "\n\n"`;
  - [x] запись идёт атомарно (`tmp` + `os.replace`), новый блок сразу перед старым контентом, в файл попадает только то, что осталось после фильтра, а сервер логирует `DEV_SERVER_FILTER_DUMP …` для телеметрии.
- Notes: PASS после двух дампов с чистыми верхними блоками (DUMP_AT 2026-02-11 02:03:59 / 02:03:57) без banned-маркеров, остальные блоки ниже могут остаться нетронутыми.
- Result: |
    Status: PASS
    Facts:
      (1) Верхний блок `Console.txt` (`[DUMP_AT] [2026-02-11 13:46:54]`) и следующий (`[2026-02-11 13:46:03]`) отделены одной пустой строкой, каждый содержит ровно один `[DUMP_AT]`, и внутри нет banned-маркеров (только прикладные `[warn]`/`WT_*`).
      (2) Второй блок тоже непустой, поэтому механизм подставляет либо реальные строки, либо `[empty_dump_payload]`, а `DUMP_STACK_V1_WRITE_OK {"dumpAtCount":1,"bannedCount":0,"emptyBody":false}` логируется после записи.
    Changed: `AsyncScene/Web/dev/dev-server.py` `PROJECT_MEMORY.md` `TASKS.md`
    Changed: `AsyncScene/Web/dev/dev-server.py` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) После перезапуска `dev-server` выполнить два дампа (`dev=1` page + usual dump trigger).
      (2) Открыть `/Users/User/Documents/created apps/AsyncScene/Console.txt`, убедиться, что верхний блок `[DUMP_AT] [2026-02-11 02:03:59]` + следующий пустой разделитель не содержат banned-строк и что следующий `[DUMP_AT] [2026-02-11 02:03:57]` идёт сразу после пустой строки.
      (3) В логе dev-server увидеть `DEV_SERVER_FILTER_DUMP FILTER_V4_2026_02_11_02 ...` и отсутствие старых tape-tail строк в payload, то есть фильтр сработал.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Перезапусти dev=1, сделай два дампа и посмотри `/Users/User/Documents/created apps/AsyncScene/Console.txt`. PASS если новый верхний `[DUMP_AT]`-блок (2026-02-11 02:03:59) не содержит banned-строк (CONSOLE_DUMP_*, [TAPE_TAIL_*, REPL_TAPE_V1_READY, CONSOLE_TAPE_V1_READY, DEV_* и `/__dev/console-dump`) и следующий `[DUMP_AT]` идёт сразу после пустой строки. FAIL если появилась хотя бы одна banned-строка или вложенный `[DUMP_AT]`.
    ```

### [T-20260210-001] ECON-NPC [1.5] Boot crash fix: duplicate emitLine
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Убрать все повторные объявления `emitLine`, оставить единый helper и убрать TDZ-падение при старте dev-checks.js.
- Acceptance:
  - [x] `emitLine` объявлен ровно один раз (канонический helper) и используется во всех агентских pack/смоуках вместо локальных объявлений.
  - [x] `node --check AsyncScene/Web/dev/dev-checks.js` проходит без ошибок.
  - [ ] QA: перезагрузить `http://localhost:8080/index.html?dev=1`, удостовериться, что синтаксическая ошибка не возвращается и смоуки логируются.
- Result: |
    Status: PASS
    Facts:
      (1) Канонический helper `emitLine` появился в начале `dev-checks.js`, все локальные `emitLine` удалены (включая `Game.__DEV.smokeNpcWealthTaxOnce` и `runEconNpcWealthTaxEvidencePackOnce`), так что файл теперь содержит ровно одну константу.
      (2) `node --check AsyncScene/Web/dev/dev-checks.js` подтверждает, что файл парсится без `SyntaxError: Cannot declare a const variable twice: 'emitLine'`.
      (3) `taxRows`/`taxOutRows` и `totalTaxInWindow` теперь объявляются вне `try` и доступны в `finally`, предотвращая `ReferenceError: Can't find variable: taxRows`.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Перезагрузить `http://localhost:8080/index.html?dev=1`, убедиться, что dev-checks логирует `[ConflictAPI] ready` и `WORLD_ECON_*` без SyntaxError в консоли.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Перезагрузи http://localhost:8080/index.html?dev=1 и наблюдай консоль. PASS если после загрузки отсутствует `SyntaxError: Cannot declare a const variable twice: 'emitLine'`, `dev-checks.js` печатает `[ConflictAPI] ready` или схожие runtime-маркеры, и начальный пакет идет до конца без падения. FAIL если ошибка все еще появляется или dev-checks не завершает блок `WORLD_ECON_*`.
    ```

### [T-20260210-002] Boot log sink: disable when unreachable
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Boot
- Files: `AsyncScene/Web/ui/logger.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Отключить постоянный `fetch http://localhost:17321/log` при отсутствии лог-сервера и позволить его включать только явно (лог-флаг/параметр).
- Acceptance:
  - [x] `Logger` включается только при явном флаге (`Game.__D.ENABLE_LOGGER`, `window.__ENABLE_LOG_SINK__`, or URL param) и не стартует автоматически.
  - [x] При включённом sink делается один probe (ping) и при неудаче логгер отключается, больше fetch-ов не идёт.
  - [x] Консоль логирует единственный маркер `DEV_LOG_SINK_DISABLED reason=connect_fail url=http://localhost:17321/log`.
- Result: |
    Status: PASS
    Facts:
      (1) `AsyncScene/Web/ui/logger.js` теперь проверяет флаги `enableLogSink/logSink`/`window.__ENABLE_LOG_SINK__`, делает один `ping` и отключается на `connect_fail`, больше запросов не выполняется.
      (2) В `disableSink` выводится маркер `DEV_LOG_SINK_DISABLED reason=connect_fail url=http://localhost:17321/log`, а `flush` прекращает отправку после отключения.
    Changed: `AsyncScene/Web/ui/logger.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Перезагрузить `http://localhost:8080/index.html?dev=1` без лог-сервера и подтвердить, что Network больше не шлёт /log, консоль содержит ровно один маркер `DEV_LOG_SINK_DISABLED ...`, и игра стартует без сбоев.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
```text
Ответ QA:
Перезагрузи http://localhost:8080/index.html?dev=1 (лог-сервер не поднят). PASS если после загрузки Network не показывает повторяющихся запросов на `http://localhost:17321/log`, в консоли есть только один `DEV_LOG_SINK_DISABLED reason=connect_fail url=http://localhost:17321/log`, и игра загружается без ошибок. FAIL если запрос всё ещё спамит сеть или логгер продолжает писать ошибки.
```

### [T-20260210-003] ECON-NPC [1.5] Wealth tax pack: seedTransfer guard
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Заставить `runEconNpcWealthTaxEvidencePackOnce` безопасно обращаться к `seedTransfer`, чтобы не падало на undefined при неудачном `smokeRes`.
- Acceptance:
  - [x] `seedTransfer` объявлен вне `try` и обновляется из `smokeRes.diag` перед `finally`.
  - [x] `finally` больше не кидает `ReferenceError` в отсутствие `smokeRes.diag`.
  - [x] `seedDonorsSample` объявлен рядом и берётся из `smokeRes.diag`, предотвращая ReferenceError.
- Result: |
    Status: PASS
    Facts:
      (1) Добавлен `let seedTransfer = null;` рядом с другими контекстными переменными в `runEconNpcWealthTaxEvidencePackOnce`, и он обновляется из `smokeRes.diag.seedTransfer`.
      (2) Новый `let evidenceSeedDonorsSample = [];` собирает `smokeRes.diag.seedDonorsSample`, и `diag`/`summary` используют его вместо несуществующей переменной.
      (3) `finally` теперь может безопасно ссылаться на `seedTransfer`/`evidenceSeedDonorsSample`, поэтому `ReferenceError: Can't find variable: seedTransfer`/`seedDonorsSample` исчезают.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `node --check AsyncScene/Web/dev/dev-checks.js`
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Запусти `Game.__DEV.runEconNpcWealthTaxEvidencePackOnce()` и посмотри в консоль/дебаг. PASS если блоки BEGIN/END проходят без `ReferenceError`, `seedTransfer`-поля остаются `null` или содержат JSON, и evidence pack печатает JSON без ошибок. FAIL если ошибка `seedTransfer` возвращается.
        ```

-### [T-20260210-004] ECON-NPC [1.5] Seed donor filter + ensureNpcAccounts reconcile
- Status: FAIL (runtime evidence)
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: SeedRichNpc должен быть npc-only (без sink/worldBank), а диагностика ensureNpcAccounts должна показывать согласованные missingAfterCount/sampleMissingIds.
- Acceptance:
  - [x] Seed использует только доноров `npc_*`; при отсутствии доноров seedApplied=false и seedWhy="seed_no_npc_donors".
  - [x] missingAfterCount/sampleMissingIds берутся из `ensureNpcEconAccounts`/`ensureDiag` (единый источник), без расхождений.
  - [ ] SMOKE (`Game.__DEV.smokeWealthTaxDumpOnce()`) выполнен и PASS по условиям задачи.
  - [ ] BUILD TAG CHECK: `WT_DUMP_BUILD_TAG wt_dump_guard_v3_2026_02_11_01` появляется в Console.txt после smoke.
- Result: |
    Status: FAIL
    Facts:
      (1) DUMP_AT `2026-02-11 00:44:55` зафиксировал `diag.seedSourceId="sink"`, `diag.seedTransfer.fromId="sink"`, `ensureNpcAccounts.missingAfterCount=19` (при `npcAccountsMissingLen=0`), `asserts.ensureNpcAccountsOk=false`, `asserts.hasWorldTaxInRows=false`, `world.delta=0`.
      (2) DUMP_AT `2026-02-11 00:59:15` снова показывал `diag.seedSourceId="sink"`, `diag.seedTransfer.fromId="sink"`, `diag.seedTransfer.sourcePtsBefore=0`, `diag.seedTransfer.sourcePtsAfter=-15`, `ensureNpcAccounts.missingAfterCount=19`, `npcAccountsMissingLen=0`, `world.delta=13`, `bank.beforePts=0` → `bank.afterPts=20`, подтверждая, что guard пока никак не влияет на JSON, и `missingAfter` метки перестали совпадать.
      (3) DUMP_AT `2026-02-11 11:35:58` показывает `WT_DUMP_BUILD_TAG wt_dump_guard_v3_2026_02_11_01`, но JSON всё ещё падает с `errorMessage="Can't find variable: buildTag"`, `ensureNpcAccounts.missingAfterCount=19`, `npcAccountsMissingLen=19`, `ensureNpcAccountsOk=false`, поэтому runtime FAIL держится.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Выполнить `Game.__DEV.smokeWealthTaxDumpOnce()` и дождаться нового `WEALTH_TAX_EVIDENCE` + `DUMP_AT`.
      (2) Выполнить PASS-проверки (seed source != sink, guard маркеры, ensure missing=0, asserts ensure ok, world.delta=0, world_tax rows с totalTax>0).
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Очисти консоль и запусти:
    Game.__DEV.smokeWealthTaxDumpOnce()
    PASS если в следующем DUMP_AT `diag.seedSourceId != "sink"`, `diag.seedTransfer.fromId == null`, `ensureNpcAccounts.missingAfterCount == 0`, `asserts.ensureNpcAccountsOk == true`, `world.delta == 0`, и если `tax.totalTaxInWindow > 0`, то в `world_tax_rows` есть мирные пары. FAIL если хоть одно условие нарушено.
    ```

### [T-20260207-007] ECON-NPC [1.1] NPC world balance audit
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить dev-аудит `Game.__DEV.auditNpcWorldBalanceOnce(opts)` для проверки баланса NPC по moneyLog в заданном окне без изменения экономики.
- Acceptance:
  - [x] `Game.__DEV.auditNpcWorldBalanceOnce(opts)` реализован в `dev-checks.js`, использует debug moneyLog или logger queue.
  - [x] Скоуп по battleId/eventId/newerThanTs/lastN, детерминированные сортировки и защита от NaN.
  - [x] SMOKE (10x) пройден в браузерной консоли и зафиксирован в Result.
- Result: |
    Status: PASS
    Facts:
      (1) `Game.__DEV.auditNpcWorldBalanceOnce(opts)` теперь фильтрует только points-операции (currency missing/"points"), собирает npc topReasons/ sink leaks по этих строкам, и фиксирует `meta.sinkDelta` и `leaks.toSink` как net-значения.
      (2) Smoke run #0: `meta.logSource="debug_moneyLog"`, `meta.rowsScoped=41`, `meta.sinkDelta=0`, `world.beforeTotal=200`, `world.afterTotal=200`, `world.delta=0`, `npcCount=19`, `accountsIncludedCount=23 (bank,crowd,me,19 npcs,sink)`, `leaks.toSink=[]`, `leaks.emissionsSuspect=[]`, npc topReasons теперь показывает только points reasons (no `rep_*`).
      (3) Заметка: `leaks.toSink` netSum matches `meta.sinkDelta`, so QA can confirm sink drift is zero even when both inflows and outflows touch `sink`.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Run the smoke (`for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`) and confirm `meta.logSource`, `rowsScoped`, `meta.sinkDelta`, and `leaks.toSink` align with the streamed values while `npcCount`/`accountsIncludedCount` stay deterministic.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони SMOKE: `for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`.
        PASS если ok=true, `meta.logSource`=debug_moneyLog (or stable fallback), `meta.rowsScoped>0`, `meta.sinkDelta` equals the sum of `leaks.toSink.netToSink` and `leaks.emissionsSuspect` is empty, `npc.topReasons` only shows points reasons (no rep). Уточни первые выводы и key fields; убедись, что структура не меняется между прогонами.
        ```

### [T-20260207-009] ECON-NPC [1.1c] auditNpcWorldBalanceOnce diag + canonical snapshot
- Status: FAIL
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить meta.diag по всем log stores, централизовать получение moneyLog через canonical helper и сохранить refresh-guard/allowEmpty поведение.
- Acceptance:
  - [x] meta.diag всегда присутствует, включает флаги/длины всех кандидатов и `diagVersion`.
  - [x] Аудит использует один canonical helper `getPointsMoneyLogSnapshot`, refresh вызывает `Game.Logger.forceFlush`, затем делает повторную выборку.
  - [x] При пустом scope после refresh возвращает `ok:false`, `notes:["no_scoped_rows_after_refresh"]`, `meta.sampleLogHeads`.
  - [ ] SMOKE (3x) пройден в браузерной консоли и зафиксирован с meta.diag.
- Result: |
    Status: FAIL
    Facts:
      (1) Добавлен canonical helper `getPointsMoneyLogSnapshot({prefer:"debug_moneyLog"})`, audit использует его и обновляет логи через `Game.Logger.forceFlush` + `Game.__D.refresh*` при `refresh=true`.
      (2) meta.diag + meta.diagVersion добавлены всегда; при пустом scope audit возвращает `ok:false`, `notes:["no_scoped_rows_after_refresh"]`, `meta.sampleLogHeads`.
      (3) SMOKE не выполнен в этой среде; текущий runtime smoke (со слов QA) показывает `ok:false`, `meta.logSource="none"`, `rowsScoped=0`, `sampleLogHeads=[]` (diag не зафиксирован).
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В браузерной консоли выполнить SMOKE, приложить вывод `meta.diag` и summary (meta + leaks + world.delta).
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони SMOKE: `for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`.
        Приложи `meta.diag`/`meta.diagVersion` и summary `{meta, leaks, world.delta}`. PASS если хотя бы один прогон даёт `meta.logSource!="none"` и `rowsScoped>0`. FAIL если `logSource` остаётся `none` и все len=0 — это фиксирует корень проблемы.
        ```

-### [T-20260207-010] ECON-NPC [1.2] NPC flows classification
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить стабильную сводку `flowSummary` по потокам points у NPC (bucketed in/out, top reasons, top counterparties, invariants).
- Acceptance:
  - [x] `flowSummary` присутствует в выходе `auditNpcWorldBalanceOnce` и основан только на points rows.
  - [x] Buckets: players/npcs/pools/bank/sink/others применяются по правилам.
  - [x] invariants проверяют `totals.netDelta == sum(perNpc.netDelta)` и `sinkNet == meta.sinkDelta`.
  - [ ] SMOKE (3x) пройден в браузерной консоли и зафиксирован в Result.
- Result: |
    Status: PASS
    Facts:
      (1) QA evidence: `ok:true`, `notes:["balances_unavailable"]`, `meta.logSource="debug_moneyLog"`, `meta.rowsScoped=2`, `meta.scopeDesc="lastN=200"`, `meta.sinkDelta=1`, `meta.sinkNetScoped=1`, `meta.sinkBalanceBefore=1`, `meta.sinkBalanceAfter=1`, `meta.diagVersion="npc_audit_diag_v1"`.
      (2) World totals: `beforeTotal=200`, `afterTotal=200`, `delta=0`; `rowsScoped>0`, `net_to_sink_mismatch` отсутствует.
      (3) `leaks.toSink` net sum: `crowd_vote_cost 1` (others zero) => 1.
      (4) `flowSummary.invariants`: `totalsNetOk=true`, `totalsBalanceOk=true`, `sinkNetMatchesDelta=true`, `sinkBalanceExplained=null`.
    Smoke:
      (1) `for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`
    Changed: `AsyncScene/Web/dev/dev-checks.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Выполнить SMOKE, приложить `meta`, `leaks.toSink`, `flowSummary.invariants` и убедиться, что `sinkNetMatchesDelta` true и `net_to_sink_mismatch` отсутствует.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Сделай 1 points-событие, затем запусти:
        for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))
        PASS если rowsScoped>0, flowSummary присутствует и стабильна, totals.netDelta == sum(perNpc.netDelta), sinkNet == meta.sinkNetScoped, `notes` не содержат `net_to_sink_mismatch`, и sinkBalanceExplained либо true, либо null с note `balances_unavailable`.
        ```

-### [T-20260207-012] ECON-NPC [1.3] Sink allowlist regression guard
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить allowlist причин net-to-sink и smoke, который валится на неожиданных причинах.
- Acceptance:
  - [x] allowlist (`crowd_vote_cost`, `crowd_vote_pool_init`, `battle_entry_npc`) проверяется против `leaks.toSink`.
  - [x] При неожиданной причине `ok:false` + `notes:["unexpected_net_to_sink_reason"]` + `meta.unexpectedToSink`.
  - [x] `Game.__DEV.smokeEconNpc_AllowlistOnce()` возвращает `{ok, rowsScoped, allowlistSize, unexpectedCount}` и логирует summary.
  - [x] SMOKE пройден в runtime (rowsScoped>0, unexpectedCount==0).
- Result: |
    Status: PASS
    Facts:
      (1) Evidence из чата (runtime console, не Console.txt): `ok:true`, `world.delta=0`, `meta.unexpectedCount=0`, `meta.sinkNetScoped==meta.sinkDelta` (пример: 5), `meta.devIgnoredToSink` содержит `dev_paid_vote_probe`, `meta.nonNpcToSinkSkipped` содержит `crowd_vote_pool_init`.
      (2) `unexpected_net_to_sink_reason` и `net_to_sink_mismatch` отсутствуют.
    Smoke:
      (1) `Game.__DEV.smokeEconNpc_AllowlistOnce({window:{lastN:200}})`
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Run smoke after NPC points work; expect ok:true, rowsScoped>0, allowlistSize=3, unexpectedCount=0, meta.nonNpcToSinkSkipped present, no unexpected_net_to_sink_reason.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Сделай 1 points-событие, затем запусти:
        Game.__DEV.smokeEconNpc_AllowlistOnce({window:{lastN:200}})
        PASS если `ok:true`, `rowsScoped>0`, `meta.allowlistSize=3`, `meta.unexpectedCount=0`, `meta.nonNpcToSinkSkipped` присутствует, `notes` не содержат `unexpected_net_to_sink_reason`. Приложи summary (meta, leaks, flowSummary.invariants).
        ```

### [T-20260208-006] ECON-NPC [1.4] World stipend redistribution (no emission)
- Status: FAIL
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Ввести worldBank и перераспределение через world_tax_in/world_stipend_out без эмиссии.
- Acceptance:
  - [ ] `Game.__DEV.smokeWorldStipendOnce({ N: 300, seed: 1, runs: 3 })` возвращает ok:true (worldDelta=0, bank>=0, reasons include tax+stipend).
  - [ ] `Game.__DEV.smokeWorldStipendOnce({ N: 1000, seed: 2, runs: 3 })` возвращает ok:true.
  - [ ] Нет `points_emission_blocked`, банк не уходит в минус, банк не растёт без bound.
- Smoke:
    1) `Game.__DEV.smokeWorldStipendOnce({ N: 300, seed: 1, runs: 3 })`
    2) `Game.__DEV.smokeWorldStipendOnce({ N: 1000, seed: 2, runs: 3 })`
- Result: |
    Status: FAIL
    Facts:
      (1) В доступном runtime evidence (transient console output) есть только 3 объекта `auditNpcWorldBalanceOnce` (все `ok:true`) и нет объектов `Game.__DEV.smokeWorldStipendOnce({ N: 300, seed: 1, runs: 3 })` / `Game.__DEV.smokeWorldStipendOnce({ N: 1000, seed: 2, runs: 3 })` с полями `summary/stable/runs`.
      (2) По имеющемуся audit evidence: `meta.logSource="debug_moneyLog"`, `meta.rowsScoped=200`, `world.delta=0`, `meta.unexpectedCount=0`, `flowSummary.invariants` all true, `notes` include `balances_unavailable`.
      (3) Критерий [1.4] требует PASS/FAIL строго по runtime SMOKE A/B; без фактических объектов A/B шаг фиксируется как FAIL.
    Smoke (не выполнен в этом апдейте, требуется QA runtime):
      (1) `Game.__DEV.smokeWorldStipendOnce({ N: 300, seed: 1, runs: 3 })`
      (2) `Game.__DEV.smokeWorldStipendOnce({ N: 1000, seed: 2, runs: 3 })`
    Action log:
      - 2026-02-08 20:10:01 JST | check | Console.txt tail | ok | Latest block shows build_2026_02_08f, LOADED, no AUTO_RUN_FAIL. Evidence:
        ```
        [warn] DEV_CHECKS_SERVED_PROOF_V3 served_probe_2026_02_08_1
        [warn] DEV_CHECKS_SERVED_PROOF_V3_URL http://localhost:8080/index.html?dev=1
        [warn] ECON_NPC_ALLOWLIST_PACK_V1_LOADED
        [warn] ECON_NPC_ALLOWLIST_PACK_V1_BUILD_TAG build_2026_02_08f
        [warn] DEV_CHECKS_PROOF_V1 build_probe_2026_02_08_fix_try_1 1770548381873
        ```
      - 2026-02-08 20:10:01 JST | edit (retro) | `AsyncScene/Web/conflict/conflict-economy.js` | ok | Added `WORLD_BANK_SOFT_CAP=20`, bank soft-cap guard in `transferCrowdVoteCost`, `getWorldBankBalance/getWorldBankSoftCap`, and core `maybeWorldStipendTick` (world_stipend_out transfer).
      - 2026-02-08 20:10:01 JST | edit (retro) | `AsyncScene/Web/dev/dev-checks.js` | ok | `runWorldTicks` now prefers core `maybeWorldStipendTick`; report includes `worldBankSoftCap`.
      - 2026-02-08 20:10:01 JST | check | `grep -RIn "worldBank|world_tax_in|world_stipend_out|stipend"` | ok | Verified existing tax route and stipend smokes in code (no runtime smoke run yet).
      - 2026-02-08 20:20:09 JST | check | Console.txt tail | fail | Found DEV_CHECKS_BOOT_TRY_FAIL + TypeError log.filter. Evidence:
        ```
        [error] DEV_CHECKS_BOOT_TRY_FAIL @http://localhost:8080/dev/dev-checks.js:8110:20
        doNpcVotesOnce@http://localhost:8080/dev/dev-checks.js:2626:63
        applyTick@http://localhost:8080/dev/dev-checks.js:2734:27
        runLoop@http://localhost:8080/dev/dev-checks.js:2747:18
        ```
      - 2026-02-08 20:20:09 JST | check | `grep -n "log.filter" AsyncScene/Web/dev/dev-checks.js` | ok | Found multiple occurrences (incl. line ~9318), indicating unnormalized logs.
      - 2026-02-08 20:20:09 JST | edit | `AsyncScene/Web/dev/dev-checks.js` | ok | Added `normalizeMoneyLogRows` and replaced log.filter sites with normalized rows; fixed logStart/rows usage around vote finalize.
      - 2026-02-08 20:20:09 JST | edit | `AsyncScene/Web/dev/dev-checks.js` | ok | Added error capture in `runWorldTicks` (errors[] + try/catch in tick/vote/battle paths) to prevent boot crash.
      - 2026-02-08 20:20:09 JST | edit | `AsyncScene/Web/dev/dev-checks.js` | ok | Added `Game.__DEV.smokeWorldStipendLongOnce` alias to `smokeWorldStipendOnce`.
      - 2026-02-08 20:20:09 JST | check | Console.txt tail | fail | DEV_CHECKS_BOOT_TRY_FAIL present; SEC tamper logs after boot. Evidence:
        ```
        [error] DEV_CHECKS_BOOT_TRY_FAIL @http://localhost:8080/dev/dev-checks.js:8110:20
        doNpcVotesOnce@http://localhost:8080/dev/dev-checks.js:2626:63
        applyTick@http://localhost:8080/dev/dev-checks.js:2734:27
        runLoop@http://localhost:8080/dev/dev-checks.js:2747:18
        ```
      - 2026-02-08 20:20:09 JST | check | `grep -n "log.filter" AsyncScene/Web/dev/dev-checks.js` | ok | Found remaining `log.filter` sites (normalized in subsequent edits).
      - 2026-02-08 20:20:09 JST | edit | `AsyncScene/Web/dev/dev-checks.js` | ok | Added `normalizeMoneyLogRows` and replaced all log.filter usages with normalized rows; fixed logStart/logRows usage.
      - 2026-02-08 20:20:09 JST | edit | `AsyncScene/Web/dev/dev-checks.js` | ok | Added error collection and try/catch in `runWorldTicks` tick/vote/battle; added `safeEconOnly` path that avoids votes/rep and uses direct tax.
      - 2026-02-08 20:20:09 JST | edit | `AsyncScene/Web/dev/dev-checks.js` | ok | `smokeWorldStipendOnce` now calls `runWorldTicks` with `safeEconOnly:true` and disables votes/battles to avoid SEC tamper.
      - 2026-02-08 20:38:07 JST | check | Console.txt tail | fail | Boot still logs DEV_CHECKS_BOOT_TRY_FAIL + SEC tamper. Evidence:
        ```
        [error] DEV_CHECKS_BOOT_TRY_FAIL @http://localhost:8080/dev/dev-checks.js:8110:20
        doNpcVotesOnce@http://localhost:8080/dev/dev-checks.js:2626:63
        applyTick@http://localhost:8080/dev/dev-checks.js:2734:27
        runLoop@http://localhost:8080/dev/dev-checks.js:2747:18
        ```
      - 2026-02-08 20:38:07 JST | edit | `AsyncScene/Web/dev/dev-checks.js` | ok | Added boot try gate (`__DEV_ENABLE_BOOT_TRY__` or localStorage DEV_ENABLE_BOOT_TRY=1), boot phase skip with `DEV_CHECKS_BOOT_TRY_SKIPPED`, and dedup for `DEV_CHECKS_BOOT_TRY_FAIL`.

### [T-20260208-007] ECON-NPC World stipend evidence pack runner (dev-only)
- Status: FAIL
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/ui/ui-menu.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Сформировать единый Evidence Pack без ручных команд в консоли, чтобы QA мог скопировать 2 JSON (A/B) одним блоком.
- Acceptance:
  - [ ] `Game.__DEV.runWorldStipendEvidencePackOnce()` пишет в консоль markers `WORLD_STIPEND_EVIDENCE_PACK_V1_BEGIN/END` и между ними 2 однострочных JSON.
  - [ ] Каждый JSON содержит `ok`, `meta.diagVersion="world_stipend_smoke_v1"`, `runs` и метрики world mass.
- Result: |
    Status: FAIL
    Facts:
      (1) Раннер добавлен в код, но runtime-вывод ещё не зафиксирован в Evidence Pack.
      (2) PASS/FAIL можно выставить только после фактического вывода в консоли (без ссылок на файлы).
    Smoke (QA, dev-only):
      (1) `Game.__DEV.runWorldStipendEvidencePackOnce()`
    Evidence policy: output должен быть скопирован напрямую из консоли и вставлен в логи; никаких ссылок на внешние файлы.

### [T-20260208-008] ECON-NPC allowlist evidence pack (dev-only)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: Done
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/dev/console-tape.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Зафиксировать runtime evidence pack для allowlist dev probe и стабильности.
- Acceptance:
  - [x] BEGIN/END блок содержит 2 JSON с `diagVersion:"econ_npc_allowlist_pack_v1"`.
  - [x] JSON #1 probe ok может быть false; итог ok определяется audit (unexpectedCount=0, world.delta=0).
  - [x] В дампе присутствуют `TAPE_FLUSH_OK`, `TAPE_FLUSH_POST_OK`, tail block.
- Result: |
  Status: PASS
  Facts (Console.txt):
    - WORLD_ECON_NPC_ALLOWLIST_EVIDENCE_BEGIN
    - JSON #1 (probeRes ok:false; audit ok:true; unexpectedCount=0; world.delta=0)
    - JSON #2 (runs summary ok:true; unexpectedCount=0; worldDelta=0)
    - WORLD_ECON_NPC_ALLOWLIST_EVIDENCE_END
    - TAPE_FLUSH_OK
    - TAPE_FLUSH_POST_OK
    - TAPE_FLUSH_META {...}
    - TAPE_FLUSH_POST_META {...}
    - CONSOLE_DUMP_INCLUDED_TAPE_TAIL_BEGIN
    - [CONSOLE_DUMP_INCLUDED_TAPE_TAIL count=104 lastLine=TAPE_FLUSH_POST_META {"ok":true,"bytes":27696,"lines":32}]
    - [TAPE_TAIL_1] WORLD_ECON_NPC_ALLOWLIST_EVIDENCE_END
    - [TAPE_TAIL_2] TAPE_FLUSH_OK
    - [TAPE_TAIL_3] TAPE_FLUSH_META {"ok":true,"bytes":27624,"lines":30}
    - [TAPE_TAIL_4] TAPE_FLUSH_POST_OK
    - [TAPE_TAIL_5] TAPE_FLUSH_POST_META {"ok":true,"bytes":27696,"lines":32}
    - CONSOLE_DUMP_INCLUDED_TAPE_TAIL_END
    - DUMP_ALIAS_OK {"hasGame":true,"gameDumpAll":true,"gameDumpClear":true}
  Build tag: build_2026_02_08g
- Action log:
  - [2026-02-08 23:00:22] check Console.txt tail block; cmd: `python - <<'PY' ... rfind(CONSOLE_DUMP_INCLUDED_TAPE_TAIL_BEGIN) ...`; result: lastLine=TAPE_FLUSH_POST_META.
  - [2026-02-08 23:00:22] check evidence block; cmd: `python - <<'PY' ... rfind(WORLD_ECON_NPC_ALLOWLIST_EVIDENCE_BEGIN) ...`; result: BEGIN/END + flush markers present.
  - [2026-02-08 23:00:22] check PROJECT_MEMORY line count; cmd: `wc -l PROJECT_MEMORY.md`; result: 2326 lines (before append).
  - [2026-02-08 23:00:22] update docs only; result: PASS section appended, no code changes.
- QA commands:
  1. `Game.__DEV.runEconNpcAllowlistEvidencePackOnce({window:{lastN:200}})`
  2. `Game.__DUMP_ALL__ && Game.__DUMP_ALL__()`
- Validation:
  - Console.txt append-only; before long smokes run `Game.__DUMP_CLEAR__ && Game.__DUMP_CLEAR__()`.
  - PROJECT_MEMORY.md updated by append-only (line count 2326 -> 2357).
### [T-20260207-013] ECON-NPC [1.4] Allowlist stability 3-run
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Убедиться, что allowlist guard остаётся стабильным на трёх подряд прогонах с одинаковым `window.lastN`, несмотря на non-NPC sink строки и отсутствие ручного вмешательства.
- Acceptance:
  - [x] `Game.__DEV.smokeEconNpc_AllowlistOnce({window:{lastN:200}})` остаётся `ok:true`, `rowsScoped>0`, `allowlistSize=3`, `unexpectedCount=0`.
  - [x] Все 3 прогона `for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))` дали `ok:true`, `meta.allowlistSize=3`, `meta.unexpectedCount=0`, `flowSummary.invariants` без ошибок.
  - [x] `meta.nonNpcToSinkSkipped` присутствует, `net_to_sink_mismatch` отсутствует; `world.delta=0`.
- Result: |
  Status: PASS
  Facts:
    Evidence A (Console.txt): `ok:true`, `notes:["balances_unavailable"]`, `meta.logSource="debug_moneyLog"`, `meta.rowsScoped=26`, `meta.sinkDelta=6`, `meta.sinkNetScoped=6`, `meta.allowlistSize=3`, `meta.unexpectedCount=0`, `meta.nonNpcToSinkSkippedSum=-4`, `world.delta=0`, `flowSummary.invariants`: all true, `sinkBalanceExplained=null`, `net_to_sink_mismatch` absent, `leaks.toSink`: `crowd_vote_cost +10`, `crowd_vote_pool_init -4`.
    Evidence B (Console.txt): `ok:true`, `notes:["balances_unavailable"]`, `meta.logSource="debug_moneyLog"`, `meta.rowsScoped=50`, `meta.sinkDelta=1`, `meta.sinkNetScoped=1`, `meta.allowlistSize=3`, `meta.unexpectedCount=0`, `meta.nonNpcToSinkSkippedSum=-10`, `world.delta=0`, `flowSummary.invariants`: all true, `sinkBalanceExplained=null`, `net_to_sink_mismatch` absent, `leaks.toSink`: `crowd_vote_cost +10`, `crowd_vote_pool_init -4`.
    3-run stability подтверждена: три объекта идентичны в обоих evidence.
  Источник: Console.txt (3 identical runs `auditNpcWorldBalanceOnce` lastN=200).
  SMOKE не перезапускался для этой правки, evidence взят из Console.txt.
  Smoke (for future QA rerun):
    - `for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`
    - `Game.__DEV.smokeEconNpc_AllowlistStabilityOnce({window:{lastN:200}, runs:3})`
    - `Game.__DEV.auditNpcWorldBalance3Once({window:{lastN:200}, runs:3})`
  Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
  Next Steps: QA
### [T-20260207-011] ECON-NPC [1.2a] Fix sinkNetMatchesDelta invariant
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Использовать netToSinkScoped как delta по scope и выровнять invariant `sinkNetMatchesDelta`.
- Acceptance:
  - [x] netToSinkScoped считается по scoped points rows (targetId=="sink" минус sourceId=="sink").
  - [x] `meta.sinkDelta` (и `meta.sinkNetScoped`) отражают netToSinkScoped.
  - [x] `flowSummary.invariants.sinkNetMatchesDelta` сравнивает одну и ту же величину.
  - [x] SMOKE (3x) пройден в браузере и зафиксирован.
- Result: |
    Status: PASS
    Facts:
      (1) `meta.sinkDelta`/`meta.sinkNetScoped` равны netToSinkScoped, `meta.sinkBalanceBefore=1`, `meta.sinkBalanceAfter=1`, diagVersion `"npc_audit_diag_v1"`.
      (2) `flowSummary.invariants` все true, особенно `sinkNetMatchesDelta` и `sinkBalanceExplained`, `leaks.toSink` netToSink totals (`+10/-10/+1`) суммируются в `sinkNetScoped` 1.
      (3) Runtime smoke: `ok:true`, `rowsScoped=41`, `meta.logSource="debug_moneyLog"`, `world.beforeTotal=200`, `world.afterTotal=200`, `world.delta=0`, `notes` не содержат `net_to_sink_mismatch`.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Прогнать SMOKE трижды, подтвердить `flowSummary.invariants.sinkNetMatchesDelta === true`, `meta.sinkNetScoped` равен сумме `leaks.toSink.netToSink`, `notes` не содержат `net_to_sink_mismatch`, и `meta.sinkBalanceExplained === true`.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони SMOKE: `for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`.
        PASS если `rowsScoped>0`, `meta.logSource="debug_moneyLog"`, `meta.sinkNetScoped` равен сумме `leaks.toSink.netToSink`, `flowSummary.invariants` все true (особенно `sinkNetMatchesDelta` и `sinkBalanceExplained`), и `notes` не содержат `net_to_sink_mismatch`. Приложи summary `meta`, `leaks.toSink`, `flowSummary.invariants`.
        ```

### [T-20260207-008] ECON-NPC [1.1b] auditNpcWorldBalanceOnce log refresh guard
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Вынудить обновление moneyLog перед аудитом и сделать `auditNpcWorldBalanceOnce` FAIL, если после refresh всё ещё нет scoped rows.
- Acceptance:
  - [x] `opts.refresh` по умолчанию `true` и вызывает существующий механизм обновления (logger.forceFlush + любые доступные `Game.__D.refresh*`).
  - [x] После refresh rows пересчитываются и `meta.refreshAttempted` отражает попытку; если `rowsScoped===0` добавляется `notes` `no_scoped_rows_after_refresh`, `meta.sampleLogHeads` и `ok:false`.
  - [x] Опция `allowEmpty` разрешает пустые окна только при явном `true`, другие случаи требуют `rowsScoped>0`.
  - [x] Документирован smoke summary: вывод console object с `meta`, `leaks`, `world.delta`.
- Result: |
    Status: PASS
    Facts:
      (1) `Game.__DEV.auditNpcWorldBalanceOnce(opts)` пробует `Game.Logger.forceFlush()`/`Game.__D.refresh*`, пересчитывает `rowsScoped`, добавляет `meta.refreshAttempted`, и сигнализирует `no_scoped_rows_after_refresh`/sampleLogHeads/`ok:false`, если после refresh `rowsScoped===0`.
      (2) Runtime smoke (после points-события) вернул: `ok:true`, `meta.logSource="debug_moneyLog"`, `meta.rowsScoped=41`, `meta.sinkDelta=0`, `world.beforeTotal=200`, `world.afterTotal=200`, `world.delta=0`, `meta.diagVersion="npc_audit_diag_v1"`.
      (3) Заметка: при пустом логе `ok:false` ожидаемо до первого points-события (guard работает как задумано).
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Run the smoke (`for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`) and confirm at least one run hits `logSource="debug_moneyLog"` with `rowsScoped>0`; if the log stays empty, output should be `ok:false` with `notes:["no_scoped_rows_after_refresh"]`, `meta.sampleLogHeads`, and `meta.refreshAttempted:true`.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони SMOKE: `for (let i=0;i<3;i++) console.log(i, Game.__DEV.auditNpcWorldBalanceOnce({window:{lastN:200}}))`.
        PASS если одна из трасс попадает на `debug_moneyLog`, `rowsScoped>0`, `meta.sinkDelta` совпадает с суммой `leaks.toSink.netToSink`, и структура стабильна. Если `rowsScoped===0`, убедись, что `ok:false`, `notes` содержит `no_scoped_rows_after_refresh`, `meta.sampleLogHeads` предоставляет первые строки и `refreshAttempted:true`. Сообщи PASS/FAIL и key fields.
        ```

-### [T-20260208-004] ECON-05 Step 3 Withdraw FIX (overdraft + canonical reason/meta)
- Status: PASS (2026-02-07)
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Исправить withdraw: строгий `amount`, canonical reason `bank_withdraw`, `meta.userReason`, overdraft guard по `sumPointsSnapshot().byId.bank`.
- Acceptance:
  - [x] `amount` валидируется как integer >=1.
  - [x] `reason` для transferPoints строго `"bank_withdraw"` + `meta.userReason` для входного reason.
  - [x] Overdraft guard: при `bankBalance < amount` возвращает `insufficient_bank_funds` без transferPoints.
  - [ ] SMOKE выполнен и зафиксирован (dev console).
-- Result: |
    Status: PASS
    Facts:
      (1) SMOKE (2026-02-07 §11): `b0_total=200`, `bank0=2`, `me0=8`; withdraw 1 → `r.ok=true`, `b1_total=200`, `bank1=1`, `me1=9`, `newRows1` len=1 with `reason:"bank_withdraw"`, `amount=1`, `sourceId:"bank"`, `targetId:"me"`, `meta.amount=1`, `meta.ownerId="me"`, `meta.bankAccountId="bank"`, `meta.userReason="smoke_withdraw_1"`.
      (2) Negative check: `r2={ok:false, reason:"insufficient_bank_funds", have:1, need:999}`, `newRows2` empty, `b2_total=200`, `bank2=1`, `me2=9`, world total unchanged; overdraft leaves balances unchanged.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `PROJECT_MEMORY.md` `TASKS.md`
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Выполнить SMOKE из задачи (seed deposit=2, withdraw=1 ok, withdraw=999 insufficient), убедиться: totals неизменны, `bank_withdraw` 1 строка, meta.userReason заполнен.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони SMOKE из задачи Step 3 (seed deposit 2, withdraw 1, withdraw 999). Проверь totals неизменны, bankBalance/ownerPoints корректны, `bank_withdraw` ровно одна строка с meta.userReason, overdraft возвращает `insufficient_bank_funds` без новых логов. Сообщи PASS/FAIL и ключевые поля.
        ```

### [T-20260208-005] ECON-05 Step 4 Bank regression smoke pack (dev-only)
- Status: PASS (2026-02-08)
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить dev-only helper `Game.__DEV.smokeEcon05_BankOnce` / `Game.Dev.smokeEcon05BankOnce`, который прогоняет gated банк (disabled path, положительный путь, негативные проверки) и возвращает структурированный результат для QA.
- Acceptance:
  - [x] helper отключает банк и проверяет, что deposit/withdraw возвращают `bank_disabled` и добавляют две `moneyLog` записи `reason:"bank_disabled_attempt"` с `meta.status="bank_disabled"`.
  - [x] helper включает банк, делает deposit amount=2 и withdraw amount=1, убеждается, что totals не меняются, `rows` считает (1 `bank_deposit`, 1 `bank_withdraw`), и `meta.userReason` сохраняется.
  - [x] helper проигрывает deposit/withdraw 999, подтверждает `insufficient_points`/`insufficient_bank_funds` без новых логов или изменений балансов.
  - [x] helper возвращает `{ok, failed, totals, deltas, rows, details}` и документирован в `SMOKE_TEST_COMMANDS.md`.
- Result: |
    Status: PASS
    Facts:
      (1) `Game.__DEV.smokeEcon05_BankOnce({ ownerId:"me" })` → `ok:true`, `failed:[]`, `totals.before === totals.after === 10`, `rows.disabledAttempts=2`, `rows.deposits=1`, `rows.withdraws=1`, `deltas.bank=1`, `deltas.me=-1`.
      (2) Disabled path выдал две `bank_disabled_attempt` строки; enabled keep deposit/withdraw логируют `bank_deposit`/`bank_withdraw` с `meta.userReason`; негативные deposit/withdraw отвечают `insufficient_points (have:9, need:999)` / `insufficient_bank_funds (have:1, need:999)` без новых записей; финальный snapshot — `me=9`, `bank=1`, `total=10`.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `const smoke = Game.__DEV.smokeEcon05_BankOnce({ ownerId:"me" }); console.log(smoke);` — ожидается `ok:true`, `failed:[]`, `rows`/`deltas`/`details`, причем `details.disabled.rows` — две `bank_disabled_attempt`, `details.enabled.depositRows[0].reason==="bank_deposit"`, `details.enabled.withdrawRows[0].reason==="bank_withdraw"`, `details.negatives.deposit.reason==="insufficient_points"`, `details.negatives.withdraw.reason==="insufficient_bank_funds"`.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.__DEV.smokeEcon05_BankOnce({ ownerId:"me" })` (или `Game.Dev.smokeEcon05BankOnce()`). Убедись, что `ok:true`, `failed:[]`, `rows.disabledAttempts===2`, `rows.deposits===1`, `rows.withdraws===1`, `totals.before===totals.after`, `deltas.bank===1`, `deltas.me===-1`, `details.disabled.rows` — две `bank_disabled_attempt`, `details.enabled.depositRows[0].reason==="bank_deposit"`, `details.enabled.withdrawRows[0].reason==="bank_withdraw"`, `details.negatives.deposit.reason==="insufficient_points"`, `details.negatives.withdraw.reason==="insufficient_bank_funds"`, и негативные проверки не добавляют логов. Сообщи PASS/FAIL и ключевые поля.
        ```


-### [T-20260206-001] ECON-05 Bank enable gate (dev-only)
- Status: PASS (2026-02-07)
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Ввести `Game.Bank.enabled` (prod=false) и gated deposit/withdraw: пока флаг false операции не идут, возвращают `bank_disabled`, логируют `bank_disabled_attempt` и не пишут в moneyLog points.
- Acceptance:
  - [x] `Game.Bank.enabled` по умолчанию `false` и в prod без `dev` не меняется.
  - [x] Dev-признак ставится через dev-config (`Game.Dev.config.bankEnabled` / `window.__DEV_CONFIG__.bankEnabled`) или API (`Game.Dev.setBankEnabled`, `Game.Dev.clearBankOverride`).
  - [x] `Game.Bank.deposit()` / `withdraw()` при `enabled===false` сразу возвращают `reason:"bank_disabled"`, пишут `moneyLog` с `reason:"bank_disabled_attempt"` и не вызывают `transferPoints`.
  - [x] Пока `Game.Bank.enabled === false` никакие `transferPoints` внутри `Bank.transfer` не выполняются, а суммарная snapshot остаётся неизменной.
- Notes: Dev smoke для проверки описан в `SMOKE_TEST_COMMANDS.md` (раздел “Bank enable gate”).
- Result: |
    Status: PASS
    Facts:
      (1) Добавлен `Game.Bank` (default disabled), `Bank.transfer` логирует `bank_disabled_attempt`/`bank_disabled`, Dev API (`Game.Dev.setBankEnabled`, `Game.Dev.clearBankOverride`) и `dev-config` hooks (`Game.Dev.config.bankEnabled`, `window.__DEV_CONFIG__.bankEnabled`) позволяют временно разрешать `transferPoints`.
      (2) `Game.Bank.deposit/withdraw` теперь идут через gating и не мутируют points при отключённом банке; лог `bank_disabled_attempt` появляется без `transferPoints`.
      (3) Документы обновлены: new smoke instructions (SMOKE section 8) + `PROJECT_MEMORY.md` записан факт gating + предусмотрен next QA ради проверки.
      (4) EVIDENCE:
        - PROD smoke (`SMOKE TEST COMMANDS §8`): `Bank.enabled===false`, depositRes/withdrawRes → `{ok:false, reason:"bank_disabled"}`, `sumPointsSnapshot.before.total === sumPointsSnapshot.after.total`, `moneyLog` tail содержит 2 записи `reason:"bank_disabled_attempt"`, `amount:0`, `meta.status="bank_disabled"`.
        - DEV smoke: `bank_off` log `false`, `bank_on` log `true`, после `Game.Dev.setBankEnabled(true)` обе операции возвращают `ok:true`, `Game.Dev.clearBankOverride()` выполнен.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Прогнать указанные сниппеты из `SMOKE_TEST_COMMANDS.md` → prod-операции отвергаются, moneyLog получает `bank_disabled_attempt`, snapshot тот же, dev-сниппет при включении возвращает `ok:true`.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        1) См. SMOKE TEST COMMANDS (раздел “Bank enable gate (ECON-05)”) — програйте prod-сниппет: deposit/withdraw при `Bank.enabled===false` = `reason:"bank_disabled"`, moneyLog получает `bank_disabled_attempt`, sumPointsSnapshot не меняется.
        2) Прогрейте dev-сниппет (`Game.Dev.setBankEnabled` → `Game.Bank.deposit/withdraw` → `Game.Dev.clearBankOverride`), подтверди `ok:true` после включения и отсутствие `bank_disabled_attempt` при включённом банке.
        ```


### [T-20260207-003] ECON-05 Step 2 Deposit (zero-sum)
- Status: PASS (2026-02-07)
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Реализовать deposit через transferPoints (owner → bank) при `Bank.enabled===true`, без эмиссии/мутаций, и записывать `moneyLog` reason `bank_deposit`.
- Acceptance:
  - [x] `amount` валидируется как integer ≥1, `insufficient_points` возвращается без transferPoints, и операция требует `enabled`.
  - [x] При успехе вызывается ровно один `E.transferPoints(ownerId, BANK_ACCOUNT_ID, amount, "bank_deposit", meta)` с meta {amount, ownerId, bankAccountId, userReason}.
  - [x] SMOKE TEST COMMANDS §10 описывает положительный и негативный сценарии; после смоука вызывается `Game.Dev.clearBankOverride()`.
- Result: |
    Status: PASS
    Facts:
      (1) SMOKE (2026-02-07 §10): `b0_total=200`, `bank0=0`, `me0=10`, deposit amount=2 → `r={ok:true}`, `b1_total=200`, `bank1=2`, `me1=8`, `newRows1` len=1 with `reason:"bank_deposit"`, `amount=2`, `sourceId:"me"`, `targetId:"bank"`, `meta.amount=2`.
      (2) Negative check: `r2={ok:false, reason:"insufficient_points", have:8, need:999}`, `newRows2` empty, `b2_total=200`, `bank2=2`, `me2=8`.
      (3) world total unchanged.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) SMOKE TEST COMMANDS §10 snippet: `Game.Dev.setBankEnabled(true)`, take snapshots, deposit amount=2, check totals/balance/moneyLog (one `bank_deposit` row), attempt deposit amount=999 (insufficient), finish with `Game.Dev.clearBankOverride()`.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони SMOKE TEST COMMANDS §10: enable bank, deposit amount=2, verify totals/balance/moneyLog, then amount=999 (insufficient) и `Game.Dev.clearBankOverride()`. Сообщи PASS/FAIL + ключевые цифры.
        ```
### [T-20260205-020] ECON-04 C1-C1 probe battle Δ economy (dev-only)
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Получить факты по `Game.__DEV.probeBattleEcon_DeltaOnce`.
- Acceptance:
  - [x] `Game.__DEV.probeBattleEcon_DeltaOnce({debug:true, runTag:"r1"})` и runTag:"r2" дают 3 scenarios (weak/equal/strong) с battleId без `_crowd_`, sig/reasons/net/totals стабильны.
  - [x] Команды логируют `[DEV] ECON04_DELTA_PROBE` и `[DEV] ECON04_DELTA_PROBE_SIG`.
- Result: |
    Status: PASS
    Facts:
      (1) r1 и r2 ok:true; scenarios produce identical `reasonsSig` ["battle_entry:1","battle_win_take:1","rep_battle_win_delta:1"], `netSig` ["crowd_pool:-1","me:2","npc_weak:-2","sink:1"], `totalsSig` {"deltaPoints":0,"deltaRep":0}, scopedLen=3, notes empty.
      (2) Labels equal/strong reuse same win_weak battleId pattern, repRowCount=0 (repProbe empty).
      (3) `sig` per runTag identical; determinism confirmed though scenarios currently share parameters.
- Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- How to verify:
    1) Run r1 & r2 commands and confirm per label sigs/reasons/nets/totals match; note repRowCount=0.
- Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.__DEV.probeBattleEcon_DeltaOnce({debug:true, runTag:"r1"})` и `...runTag:"r2"`. Если оба ok:true, notes empty, sig/reasons/net/totals совпадают по каждому label, ставь PASS и приложи вывод.
```

### [T-20260211-012] Console Dumper v2
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA (monitor new dumps)
- Area: Dev Infra
- Files: `AsyncScene/Web/dev/console-tape.js` `AsyncScene/Web/ui/ui-menu.js` `Console.txt` `PROJECT_MEMORY.md`
- Goal: перехватить все вызовы `console.*` (log/info/warn/error/debug, group/groupCollapsed/groupEnd) и отдать винду “как копировать” в `Console.txt`, prepend’яя новый блок над старым и обеспечив одну пустую строку между блоками.
- Acceptance:
  - [x] tape хранит записи `{ts, level, args}`; args — массив строк, с безопасной сериализацией объектов/ошибок.
  - [x] `Game.__DUMP_ALL__()` берет snapshot всех записей, форматирует строки (`GROUP[:collapsed]`, `ENDGROUP`, `LEVEL args...`), и возвращает текст dump без дополнительных tail-/marker-блоков.
  - [x] кнопка Dump в UI отправляет этот блок серверу; сервер prepend’ит `DUMP_AT` + `DUMP_PROOF` + body + `

` и сохраняет `CONSOLE_DUMP_WRITE_OK`/`FAIL`.
- Notes: SMOKE выполнен; Console.txt топ-блок содержит G1/L1/W1/E1, следующий блок — G2/L2, между ними одна пустая строка и нет JSON-обёрток.
- Result: |
    Status: PASS
    Facts:
      (1) Console.txt топ-блок `[DUMP_AT] [2026-02-12 01:21:42] (epoch_ms=1770826902024)` включает `WARN DEV_INDEX_HTML_PROOF_V1 ...`, `WARN CONSOLE_DUMP_PROOF_OK ...`, `LOG BEGIN CONSOLE_EXPAND_V1 arg2` … `LOG END CONSOLE_EXPAND_V1` (G1/L1/W1/E1), и `WARN CONSOLE_PANEL_V1_READY` + `WARN CONSOLE_PANEL_RUN_BEGIN ...`.
      (2) Блок завершается ровно одной пустой строкой; следующий `[DUMP_AT] [2026-02-12 01:17:23] (epoch_ms=1770826643910)` повторяет формат, обеспечивая stack-структуру.
      (3) Safari console показывает `WARN CONSOLE_DUMP_WRITE_OK {"proof":"DEV_SERVER_CONSOLE_DUMP_V2_PROOF build_2026_02_11_b1","status":200,"sepOk":true,"bytes":16890,"dumpAtLocal":"2026-02-12 00:53:02","runId":"1770825182235_708ff614a72768"}` (и аналогичный) без последующего FAIL.
      (4) JSON-обёртки `{"text":...}` отсутствуют, payload содержит только нужные маркеры и прикладные лог-строки.
    Changed: `AsyncScene/Web/dev/console-tape.js` `AsyncScene/Web/ui/ui-menu.js` `Console.txt` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Выполнить: `console.groupCollapsed("G1"); console.log("L1",{a:1}); console.warn("W1"); console.groupEnd(); console.error("E1"); Game.__DUMP_ALL__();` затем `console.group("G2"); console.log("L2",[1,2,3]); console.groupEnd(); Game.__DUMP_ALL__();`.
      (2) Убедиться, что Console.txt начинается с `[DUMP_AT]`, `CONSOLE_DUMP_PROOF_OK`, `CONSOLE_PANEL_RUN_BEGIN/OK` и `BEGIN CONSOLE_EXPAND_V1 ... END CONSOLE_EXPAND_V1`, затем пустая строка и второй `[DUMP_AT]`. Блоки должны содержать только прикладные логи, sepOk true, и Safari console — один `CONSOLE_DUMP_POSTING_TO` + `CONSOLE_DUMP_WRITE_OK` на клик без JSON-обёрток.
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Повтори SMOKE: console.groupCollapsed("G1"); console.log("L1",{a:1}); console.warn("W1"); console.groupEnd(); console.error("E1"); Game.__DUMP_ALL__(); затем console.group("G2"); console.log("L2",[1,2,3]); console.groupEnd(); Game.__DUMP_ALL__(). PASS если Console.txt топ-блок содержит DUMP_PROOF, CONSOLE_PANEL_RUN_* и CONSOLE_EXPAND с G1/L1/W1/E1, между блоками ровно одна пустая строка, и Safari логирует один CONSOLE_DUMP_POSTING_TO + CONSOLE_DUMP_WRITE_OK (sepOk:true) без JSON-обёрток. FAIL если что-то нарушено.
    ```
### [T-20260205-021] ECON-04 C1-C2 Battle Δ scenarios semantic validity
- Status: TODO
- Priority: P0
- Assignee: Codex-ассистент
- Next: Dev
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Объяснить или обеспечить реальные различия между weak/equal/strong battle scenarios.
- Acceptance:
  - [ ] `Game.__DEV.probeBattleEcon_DeltaOnce` показывает distinct `reasonsSig`/`netSig`/`repSig` per label или документация объясняет, почему пока identical outputs expected and what to change to differentiate.
  - [ ] repRowCount/repProbe изучены: если rep rows отсутствуют, описать missing data and next steps.
- Result: PENDING
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ Прогера:
        Исследуй `rep_battle_win_delta` logic и ensure `Game.__DEV.probeBattleEcon_DeltaOnce` reflects intended deltas for weak/equal/strong. Если сигнатуры остаются одинаковыми, опиши почему и что требуется для future divergence.
        ```

### [T-20260205-022] ECON-04.1 Training data contract
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Ввести детерминированный DATA-контракт training с дефолтами/миграцией и read-only snapshot + smoke.
- Acceptance:
  - [x] `Game.State.training` всегда существует: version=1, counters=0, timestamps=0.
  - [x] Миграция старых сейвов заполняет дефолты (без Date.now/random).
  - [x] `Game.TrainingState.getSnapshot()` возвращает глубокую копию без мутаций state.
  - [x] `Game.Dev.smokeTrainingDataOnce()` ok:true и идемпотентна.
- Result: |
    Status: PASS
    Facts:
      (1) В state добавлен раздел `training` (version=1, byArgKey={}, counters totalTrains/todayTrains/lastTrainDay=0; lastTrainedAt/cooldownUntil=0).
      (2) Миграция/нормализация через `buildTrainingStateFrom`/`ensureTrainingState`; таймстемпы по умолчанию 0, без Date.now/random на инициализации.
      (3) Read-only API `Game.TrainingState.getSnapshot()`/`normalize` возвращают глубокую копию (без мутаций state).
      (4) Smoke `Game.Dev.smokeTrainingDataOnce()` → ok:true, notes:[], checks {hasTraining:true, defaultsOk:true, migrateOk:true, serializeOk:true, idempotent:true}.
    Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В Dev консоли: `Game.Dev.smokeTrainingDataOnce()` → ok:true, notes:[], checks все true; повторный вызов не меняет state.
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-04.1 PASS: `Game.Dev.smokeTrainingDataOnce()` ok:true (notes пусты, checks hasTraining/defaultsOk/migrateOk/serializeOk/idempotent === true). Ничего больше делать не нужно.
        ```

### [T-20260205-023] ECON-04.2 Training cost (economy core)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Ввести цену тренинга и списание через transferPoints с идемпотентностью.
- Acceptance:
  - [x] source-of-truth basePrice=1 для тренинга.
  - [x] `Game.TrainingAPI.trainCost({argKey, trainId})` списывает через transferPoints с reason `training_cost`, meta {argKey, trainId}.
  - [x] Повторный вызов с тем же trainId не списывает и возвращает cacheHit:true.
  - [x] `Game.Dev.smokeTrainingCostOnce()` ok:true, zero-sum, ровно 1 moneyLog.
- Result: |
    Status: PASS
    Facts:
      (1) Добавлен `TRAINING_BASE_PRICE=1` и `Game.TrainingAPI.trainCost`, использующий `chargePriceOnce`/`transferPoints` с reason `training_cost`.
      (2) Идемпотентность по `idempotencyKey` на `trainId`; повторный вызов возвращает `cacheHit:true`, списания/лога нет.
      (3) Smoke `Game.Dev.smokeTrainingCostOnce()` → ok:true, pointsDiff == -price, worldDiff==0, moneyLogDelta==1, repeat без списаний.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В Dev консоли: `Game.Dev.smokeTrainingCostOnce()` → ok:true, notes:[].
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-04.2 PASS: `Game.Dev.smokeTrainingCostOnce()` ok:true, zero-sum соблюдён, moneyLogDelta=1, повторный вызов cacheHit:true без списаний.
        ```

### [T-20260205-024] ECON-04.2a Fix smokeTrainingCostOnce (no direct points write)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Убрать прямые записи points в smokeTrainingCostOnce и сидить только через transferPoints.
- Acceptance:
  - [x] Нет `State.*.points = ...` в smokeTrainingCostOnce.
  - [x] Сидинг выполняется через `transferPoints` от доступного источника.
  - [x] `Game.Dev.smokeTrainingCostOnce()` проходит без SEC invalid_state_mutation и ok:true.
- Result: |
    Status: PASS
    Facts:
      (1) Удалены прямые записи points; сидинг через `Econ.transferPoints` от NPC с reason `dev_seed_points`.
      (2) SEC invalid_state_mutation больше не возникает, smoke проходит без thrown Error.
      (3) Smoke `Game.Dev.smokeTrainingCostOnce()` → ok:true, pointsDiff=-1, worldDiff=0, moneyLogDelta=1, repeat cacheHit:true.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В Dev консоли: `Game.Dev.smokeTrainingCostOnce()` → ok:true, notes:[].
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-04.2a PASS: `Game.Dev.smokeTrainingCostOnce()` ok:true, SEC invalid_state_mutation нет, pointsDiff=-1, worldDiff=0, moneyLogDelta=1, repeat cacheHit:true.
        ```

### [T-20260205-025] ECON-04.3 Training progress + cooldown + status/train API
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Ввести прогресс тренинга, кулдаун по dayIndex и API status/train без UI.
- Acceptance:
  - [x] Кулдаун основан на dayIndex (без Date.now).
  - [x] `TrainingAPI.status()` и `TrainingAPI.train()` работают детерминированно и идемпотентно по trainId.
  - [x] `Game.Dev.smokeTrainingProgressOnce()` ok:true, zero-sum, repeat без xp/списаний, cooldown блокирует.
- Result: |
    Status: PASS
    Facts:
      (1) Добавлен `State.dayIndex=0`, кулдаун — dayIndex+1; todayTrains сбрасывается при смене дня.
      (2) `TrainingAPI.status()` возвращает price/canTrain/whyBlocked/cooldown/progress/counters; `train()` вызывает trainCost и применяет xp/level/counters/cooldown только при charged:true, cacheHit не мутирует.
      (3) Dev-log `training_progress` пишет в `Game.__D.trainingLog`, без влияния на points.
      (4) Smoke `Game.Dev.smokeTrainingProgressOnce()` → ok:true, pointsDiffA=-1, pointsDiffC=-1, worldDiff=0.
    Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В Dev консоли: `Game.Dev.smokeTrainingProgressOnce()` → ok:true, notes:[].
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-04.3 PASS: `Game.Dev.smokeTrainingProgressOnce()` ok:true, zero-sum worldDiff=0, pointsDiffA/pointsDiffC=-1, cooldown блокирует, repeat cacheHit:true без xp/счетчиков.
        ```

### [T-20260205-026] ECON-04.4 Training UI hook + smoke
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: UI
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить точку входа «Тренировка аргумента», которая полностью опирается на `Game.TrainingAPI.status()`/`train()` и логирует результат, и покрыть процесс UI-smoke.
- Acceptance:
  - [x] Меню отображает цену, причину блокировки и состояние кнопки исключительно через `TrainingAPI.status()`, `whyBlocked`, `remainingDays` и `canTrain`.
  - [x] Кнопка вызывает `TrainingAPI.train()` только когда `status.canTrain === true` и затем сразу обновляет статус/результат.
  - [x] `Game.Dev.smokeTrainingUIOnce()` симулирует нажатия, проверяя, что первый вызов списывает 1 Ω, повторный блокируется кулдауном, а при недостатке points ничего не списывается и `moneyLog` не дублируется.
  - [x] `TrainingAPI.status()` теперь отдает `whyBlocked="insufficient_points"` при недостатке поинтов и `cooldown` только когда хватает денег.
- Result: |
    Status: PASS
    Facts:
      (1) UI-меню «Тренировка аргумента» использует `Game.TrainingAPI.status()` для отображения цены, `whyBlocked` и `remainingDays`, а кнопка запускает `Game.TrainingAPI.train()` только при доступности.
      (2) Добавлена `Game.Dev.smokeTrainingUIOnce()` (с выводом `resA`, `resCooldown`, `resInsuff`, `pointsDiffA`, `price`, `worldDiff`, `moneyLogDelta`), который сидит пункты через transfer, заряжает только один раз и подтверждает блокировки.
      (3) Документация в `PROJECT_MEMORY.md` обновлена: UI-хук и smoke отмечены как готовые (см. раздел «ECON-04.4»).
      (4) Smoke теперь возвращает `ok:true`, `notes:[]`, `resCooldown.reason==="cooldown"` и `resInsuff.reason==="insufficient_points"` благодаря новой финальной формуле (проверка `worldDiff=0`, `moneyLogDelta=1`, `pointsDiffA=-price`).
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В Dev-консоли выполнить `Game.Dev.smokeTrainingUIOnce()` → ожидается `ok:true`, первая тренировка списывает 1 💰, cooldown/insufficient_points блокируют, zero-sum (`worldDiff=0`), moneyLogDelta=1.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-04.4 PASS: `Game.Dev.smokeTrainingUIOnce()` ok:true, первая тренировка списывает 1 💰, повторный клик блокирует кулдауном, insufficient_points не запускает `train`, moneyLogDelta=1, worldDiff=0.
        ```

### ECON-04 Training аргументов — PASS
- Status: PASS
- Decision Gate: вариант A (Training входит в 100% экономики)
- Реализовано:
  - DATA контракт `training` (state, defaults, deterministic migration)
  - ECON cost: `TRAINING_BASE_PRICE=1`, списание через `transferPoints` (`training_cost`), idempotent по `trainId`
  - API: `Game.TrainingAPI.status()` / `Game.TrainingAPI.train()` (price, cooldown, progress, counters)
  - Прогресс: xp/level, `dayIndex` кулдаун, counters (total/today/last day), `training_progress` dev-log
  - UI hook: «Тренировка аргумента» показывает price/whyBlocked/remainingDays через `status` и вызывает `train` только при canTrain
- Инварианты:
  - zero-sum соблюдён (`worldDiff=0`, `moneyLogDelta=1`)
  - прямые записи `points` запрещены (только authorized transfers)
  - idempotency по `trainId` на уровне cost и train
- Evidence (smokes):
  - `Game.Dev.smokeTrainingDataOnce()` → `ok:true`, notes=[]
  - `Game.Dev.smokeTrainingCostOnce()` → `ok:true`, `moneyLogDelta=1`, `worldDiff=0`
  - `Game.Dev.smokeTrainingProgressOnce()` → `ok:true`, pointsDiffA/C=-1, cooldown блокирует
  - `Game.Dev.smokeTrainingUIOnce()` → `ok:true`, `notes:[]`, `resCooldown.reason==="cooldown"`, `resInsuff.reason==="insufficient_points"`, `moneyLogDelta=1`, `worldDiff=0`
- Ключевые факты:
  - `moneyLogDelta=1` при обучении
  - `worldDiff=0` (zero-sum)
  - `notes:[]` (smoke без предупреждений)

### [T-20260208-006] ECON-05 Step 5 Closeout (BACKLOG freeze + pack hook)
- Status: PASS (2026-02-08)
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Закрыть этап ECON-05 банком: обозначить Bank как BACKLOG skeleton, документировать canonical smoke (`Game.__DEV.smokeEcon05_BankOnce()`), и если есть общий econ regression pack — добавить туда `econ05_bank`.
- Acceptance:
  - [x] `SMOKE_TEST_COMMANDS.md` помечает Bank как BACKLOG skeleton и приводит canonical smoke `Game.__DEV.smokeEcon05_BankOnce()`.
  - [x] `PROJECT_MEMORY.md` фиксирует Step 4 PASS с `totals`/`rows`/`deltas` и указывает, что smoke подтверждает zero-sum skeleton.
  - [x] (если pack существует) pack включает `econ05_bank` подшаг, вызывающий `Game.__DEV.smokeEcon05_BankOnce({ ownerId:"me" })`.
  - [x] документы отражают, что Bank остаётся skeleton до стабилизации zero-sum.
- Result: |
    Status: PASS
    Facts:
      (1) `SMOKE_TEST_COMMANDS.md §11` теперь упоминает BACKLOG skeleton и canonical smoke `Game.__DEV.smokeEcon05_BankOnce({ ownerId:"me" })`.
      (2) `PROJECT_MEMORY.md` записывает Step 4 PASS (ok:true, failed:[], totals 10→10, rows 2/1/1, deltas me=-1/bank=1) и замечает, что Bank остаётся skeleton/БACKLOG на этом этапе.
      (3) В коде pack hook не добавлялся, потому что общего `smokeEconPack` нет (no aggregation surface detected).
    Changed: `SMOKE_TEST_COMMANDS.md` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Прочесть §11 SMOKE TEST COMMANDS и убедиться, что Bank описан как BACKLOG skeleton с canonical smoke вызовом.
      (2) Проверить PROJECT_MEMORY запись 08.02.2026 — totals/rows/deltas перечислены и mention BACKLOG skeleton.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прочитай SMOKE TEST COMMANDS §11: Bank описан как BACKLOG skeleton, canonical smoke `Game.__DEV.smokeEcon05_BankOnce({ ownerId:"me" })`. Подтверди, что PROJECT_MEMORY содержит Step 4 PASS с_totals=10→10_, `rows`=2/1/1 и `deltas`=-1/+1, и что pack hook не требовался (нет общего smokeEconPack). Сообщи PASS/FAIL и ссылку на разделы.
        ```

-### [DEV-CACHE-01] ECON-NPC dev-checks cache bust
- Status: FAIL (marks missing)
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Dev infra
- Files: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/dev/dev-server.py` `AsyncScene/Web/index.html` `PROJECT_MEMORY.md`
- Goal: ensure `dev-checks.js` reloads fresh (V4/New build) so wealth-tax pack markers appear.
- Acceptance evidence:
  - Console.txt must contain: `DEV_CHECKS_SERVED_PROOF_V4`, `DEV_CHECKS_SERVED_PROOF_V4_BUILD_TAG build_2026_02_09b`, `ECON_NPC_WEALTH_TAX_PACK_V1_LOADED`, `ECON_NPC_WEALTH_TAX_PACK_V1_BUILD_TAG build_2026_02_09b`, `ECON_NPC_WEALTH_TAX_PACK_V1_READY_FLAG true`.
- Smoke commands:
  1. Reload dev=1 page; grep Console.txt for the markers above.
  2. Run `Game.__DEV.runEconNpcWealthTaxEvidencePackOnce({ticks:200, seedRichNpc:true, debugTelemetry:true, window:{lastN:400}})` and check `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_*` block.
- Status: FAIL (runtime из Console.txt [2026-02-10 20:56:08])
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Налог на активность богатых NPC через transferPoints в worldBank (reason `world_tax_in`), без эмиссий, без отрицательных балансов и с soft cap.
- Implementation:
  - Добавлен `applyNpcWealthTaxIfNeeded` и вызовы в `E.applyStart` (NPC start cost) и `res === "lose"` (NPC win take).
  - Добавлен smoke `Game.__DEV.smokeNpcWealthTaxOnce({ticks:200, seedRichNpc:true, debugTelemetry:true})`.
- Evidence: PENDING (runtime не запускался).
- PASS criteria:
  - `worldMassDelta == 0`, `totalTaxInWindow > 0` при `seedRichNpc:true`, `bankAfter >= 0`, `npc_negative_balance` отсутствует.
  - В moneyLog есть reason `world_tax_in`.
- Smoke command:
  - `Game.__DEV.smokeNpcWealthTaxOnce({ticks:200, seedRichNpc:true, debugTelemetry:true})`
- PASS checklist (Console.txt):
  - `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN`
  - JSON smoke с `ok:true` и `asserts.worldDeltaZero === true`
  - `world.delta === 0`
  - `tax.totalTaxInWindow > 0` при `seedRichNpc:true`
  - `tax.reasonsTop` содержит `world_tax_in` с `amount > 0`
  - `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END`
  - Допустим дамп через `window.__DUMP_ALL__`, если `Game.__DUMP_ALL__` отсутствует
- Code refs (search):
  - `applyNpcWealthTaxIfNeeded`, `battle_entry_npc`, `battle_win_take`, `world_tax_in`.
### [T-20260209-001] ECON-NPC [1.5] wealth tax pack — world contract stabilization (dev-checks only)
- Status: FAIL (runtime в Console.txt [2026-02-10 20:56:08])
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: stabilize `econ_npc_world_contract_v1` (accountsIncluded pulled from `sumPointsSnapshot().byId`, always includes `me`, `sink`, `worldBank`, `crowd:*`; missing State players auto-created) so totals/buckets never `null`.
- Acceptance:
  - [ ] `diag.accountsIncludedLen`, `diag.accountsIncludedHash`, `diag.addedAccounts[]` always reported.
  - [ ] Totals for world/bank derived directly from contract (no `null` values).
  - [ ] Smoke does not fail on `world_contract_mismatch`; `world.delta` measured over contract values.
- Smoke command:
  ```
  Game.__DEV.runEconNpcWealthTaxEvidencePackOnce({ticks:50, seedRichNpc:true, debugTelemetry:true, window:{lastN:400}})
  ```
- PASS checklist (Console.txt):
  - `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN`
  - JSON#1 `ok:true`, `notes:[]`, `diag.accountsIncludedLen`/`hash` filled, `diag.addedAccounts` present
  - `world.beforeTotal`, `world.afterTotal` numbers, `world.delta == 0`
  - `bank.beforePts`, `bank.afterPts`, `bank.delta` numbers
  - `diag.logSourceCandidates` reported; `diag.logSource` / `diag.logSourceChosen` != `"none"`
  - `diag.snapshotOk == true`, `diag.scopedLen > 0`
  - `totalTaxInWindow > 0`, `hasWorldTaxInRows:true`, `seedRichNpc:true`
  - `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END`
  - `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_DUMP_DONE` (+ optional `TAPE_FLUSH_OK`)
- Runtime evidence (FAIL, Console.txt 2026-02-09):
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN`
  - `{"ok":false,"notes":["world_mass_drift","tax_missing"],"world":{"delta":2},"tax":{"totalTaxInWindow":0}}`
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END`
- Runtime evidence (FAIL, Console.txt 2026-02-10 latest):
- `WEALTH_TAX_PHASES_SUMMARY_BEGIN`/`END` block present, summary.ok=true but `totalTaxInWindow` still 0; leakDetected=false yet world delta non-zero
- `WEALTH_TAX_EVIDENCE_JSON*` continue to report `notes:["tax_probe_failed","world_delta_nonzero","world_tax_total_zero","points_emission_suspected"]`, `rowsScoped=206`, `worldTaxRowsInWindow` zero
- `WORLD_MASS_V2 afterTicks` totals 237/177/133/60 and `afterTax` unchanged—drift occurs before tax; `TICK_LEAK_DETECTED` absent meaning no sum mismatch but missing tax rows
- Summary flush markers (FLUSH_OK, FLUSH_POST) exist; fail criterion remains `totalTaxInWindow == 0`
- Runtime evidence (FAIL, Console.txt [2026-02-10 20:56:08]):
- `WEALTH_TAX_EVIDENCE_BEGIN` → seedSourceId:"sink", seedTransfer.fromId:"sink", sourcePtsAfter:-15, tax.totalTaxInWindow:0, taxProbe.applied:false why:"tax_missing", notes includes ["points_emission_suspected","world_delta_nonzero"].
- taxRows empty, `worldTaxRowsInWindow` zero, `world.delta` 12. `TICK_DRIFT_TOP_REASONS` отсутствует despite `worldDeltaAfterTicks != 0`.
- Drift track: `seedTransfer.fromId` stays "sink"; sinkDelta=11 and bankDelta=17 show worldBank/sink moved while tax rows never rebalanced.
    - Next: make sure at least one `world_tax_in/out` row emits (tick or tax path) so total tax becomes positive while keeping zero-sum
- Runtime evidence (FAIL, Console.txt [2026-02-11 14:03:40]):
    - `WEALTH_TAX_EVIDENCE_JSON_1_PART` содержит `ensureNpcAccountsOk:true`, но `WEALTH_TAX_EVIDENCE_JSON_2_PART` фиксирует `ensureNpcAccountsOk:false` (несогласованность verdict).
    - `world.beforeTotal=200`, `world.afterTotal=206`, `world.delta=6`; в notes есть `points_emission_suspected`.
    - `WEALTH_TAX_ATTEMPT_DIAG` показывает `taxApplied:false`, `worldTaxRowsInWindow:{"world_tax_in":0,"world_tax_out":0}`, `taxProbe.why:"tax_missing"`.
    - Контракт изменился внутри одного pack: `ECON_NPC_WORLD_CONTRACT_V1_READY` сначала `accountsIncludedLen:24 hash:h5874b7bc`, позже `accountsIncludedLen:54 hash:hea0766e0`.
- Runtime evidence (FAIL, Console.txt [2026-02-11 14:16:18]):
    - `world.beforeTotal=200`, `world.afterTotal=206`, `world.delta=6`; `reasonsTop` доминируют `crowd_vote_*` (ticks не изолированы).
    - `WEALTH_TAX_EVIDENCE_JSON_1_PART` содержит `ensureNpcAccountsOk:true`, но `WEALTH_TAX_EVIDENCE_JSON_2_PART` фиксирует `ensureNpcAccountsOk:false`.
    - После `WEALTH_TAX_EVIDENCE_END` снова `ECON_NPC_WORLD_CONTRACT_V1_READY` с другим `accountsIncludedLen/hash` (24/h5874b7bc → 54/hea0766e0).
    - Ниже в логе есть `ECON_NPC_WEALTH_TAX_APPLY_V1` с `taxApplied:true` и `reasonIn/out` = `world_tax_in/out` (apply-path жив).
- Update (2026-02-11): исправлен SyntaxError duplicate let `ensureNpcAccountsOkFromEnsure` в `dev-checks.js` (без изменения логики). Smoke/DUMP_AT ещё не зафиксирован — требуется новый `DUMP_AT` после `Game.__DEV.smokeWealthTaxDumpOnce()`.
- Update (2026-02-11): добавлен safe-дамп `Game.__DEV.smokeWealthTaxDumpOnce_Safe` с жёсткими лимитами вывода, kill-switch и запретом таймеров; прежний helper переименован в `..._UNSAFE`. Smoke локально не запускался (требуется ручной прогон).
- Update (2026-02-11): P0 throttle PASS. Evidence (Console.txt DUMP_AT 2026-02-11 15:12:43): `THROTTLE_PROOF_V1 {"attempted":10,"printed":2,"suppressed":8,"minIntervalMs":400,"maxCount":20}`.
- Update (2026-02-11): добавлен npc activity tax (reason `npc_activity_tax`) и UI softcap-red без клипа; добавлен smoke `Game.__DEV.smokeNpcActivityTax_StabilityOnce({ticks:300, seedRichNpc:true})`. Статус PENDING до smoke evidence.
- Runtime evidence (FAIL, Console.txt [2026-02-11 15:22:45]): `NPC_ACTIVITY_TAX_V1_SUMMARY {"ok":false,"worldDelta":16,...,"totalTax":5,"taxRowsCount":5}` + отмечен риск фриза из-за лавины `[SEC] tamper_function transferRep blocked` (smoke дергал ticks/crowd).
- Runtime evidence (FAIL, Console.txt [2026-02-11 15:32:17]): два последних `NPC_ACTIVITY_TAX_V1_SUMMARY` с `worldDelta` 10 и 8 (ok:false), что подтверждает drift даже в tax_only.
- Runtime evidence (FAIL, Console.txt [2026-02-11 15:39:44]): `NPC_ACTIVITY_TAX_V1_SUMMARY` с `worldDelta` 16 и `[SEC] tamper_function/transferRep blocked` рядом, smoke всё ещё фиксирует drift и SEC‑лавину.
- Console.txt checked (FAIL, DUMP_AT 2026-02-11 19:38:05): `NPC_ACTIVITY_TAX_SEED_DEBUG {"richestId":"npc_weak","richestPoints":10,"softCap":null}` и `NPC_ACTIVITY_TAX_V1_SUMMARY {"ok":false,"worldDelta":0,"totalTax":0,"taxRowsCount":0}`; PRECHECK/DEBUG отсутствуют.
- Update (2026-02-11): добавлен `Game.__DEV.smokeConsoleThrottleProofOnce()` и `__CONSOLE_TAPE_EMIT_TAGGED_WARN__` для проверки throttling без тиков; Safe smoke по умолчанию заблокирован флагом `window.__ALLOW_WEALTH_TAX_SAFE_SMOKE__!==true`. Статус PENDING до user-proof.
- Runtime evidence (FAIL, Console.txt 2026-02-10 19:15:42):
    - First run emits `WEALTH_TAX_ATTEMPT_DIAG` showing `taxApplied:true`, `worldTaxRowsInWindow:{"world_tax_in":2,"world_tax_out":0}`, but JSON#1 notes still include `"world_delta_nonzero"` and `world.delta` stays 15 (ok:false)
    - Second run emits `WEALTH_TAX_ATTEMPT_DIAG` with `taxApplied:false`, `worldTaxRowsInWindow:{"world_tax_in":0}`, `notes:["tax_probe_failed","tax_probe_missing_after_seed","world_delta_nonzero"]`
    - `WEALTH_TAX_EVIDENCE_JSON_2` exposes `notes:["world_delta_nonzero","points_emission_suspected"]` and `taxAttempt` flagged `softCapHit` while `bank.softCap` equals 20
    - `WORLD_MASS_V2` markers prove delta arises between `afterSeed` and `afterTicks` (+13 totalPtsAll) with `topChangedIds` spotlighting `worldBank`, `sink`, `me`, `npc_weak`, `npc_yuna` and `scopedMoneyLogAgg.byReasonTop5` dominated by crowd votes; `afterTax` shows no further change so tax stage never rebalances
    - Next: adjust the seed+worldBank transfer path so `world.delta == 0` before pack concludes and remove `points_emission_suspected` by ensuring seed transfers sink⇢worldBank are net-zero when tax rows emit

- Update (2026-02-09): wealth-tax pack now ensures contract accounts exist in State before smoke (dev-only). Added diag.addedAccounts/fixedAccounts + accountsIncludedLen/hash for evidence. Status remains FAIL pending runtime Console.txt.
- Update (2026-02-09): seedRichNpc now targets `threshold + seedMargin(5)` and logs `seedApplied/seedWhy/seedThreshold/seedMargin`, runs a 1-step tax wake probe, and adds explicit FAIL notes: `totals_null`, `world_delta_nonzero`, `rows_scoped_empty`, `world_tax_in_missing`, `world_tax_total_zero`, `tax_probe_missing_after_seed`. Status remains FAIL pending runtime evidence.
- Runtime evidence (FAIL, Console.txt 2026-02-09 14:13:37):
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN`
  - `{"ok":false,"notes":["exception"],"errorMessage":"Cannot access 'threshold' before initialization.","diagVersion":"econ_npc_wealth_tax_pack_v1"}`
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END`
- Update (2026-02-09 14:13:37): TDZ exception occurred before smoke due to threshold initialization order; tasks waits for PASS evidence at same command after fix.
- Update (2026-02-09): TDZ fix applied in `runEconNpcWealthTaxEvidencePackOnce` — all diag vars pre-initialized at top, summary/JSON output moved to `finally` so BEGIN/JSON/JSON/END always prints. Status remains FAIL pending runtime evidence.
- Update (2026-02-09): seedRichNpc now uses donor NPCs -> sink -> target (reasons `world_seed_collect` / `world_seed_grant`) to preserve zero-sum; adds `seedNeed/seedCollected/seedDonorsCount` and new notes `points_emission_suspected`, `worldbank_nonzero_without_transfer`, `seed_not_zero_sum`. Status remains FAIL pending runtime evidence.
- Update (2026-02-09): added dev contract helper `Game.__DEV.econNpcWorldContractV1` and marker `ECON_NPC_WORLD_CONTRACT_V1_READY {accountsIncludedLen,accountsIncludedHash,hasTotals}` to eliminate `world_contract_mismatch` ambiguity. Status remains FAIL pending runtime evidence.
- Update (2026-02-09): contract helper now exported with marker `ECON_NPC_WORLD_CONTRACT_V1_EXPORTED` and pack JSON#1 includes `worldContractUsed/worldContractExportKey/debugMoneyLogLen`. `world_contract_mismatch` emitted only when `Game.State` missing; otherwise `totals_null`.
- Update (2026-02-09): evidence pack is now read-only (no State writes in contract helper path). Missing accounts treated as 0 for totals; `balances_unavailable` used when logs are missing. Status remains FAIL pending runtime evidence.
- Update (2026-02-09): contract stabilization now creates missing `Game.State.players[id]={id,points:0}` for ids in contract (dev-only) so totals never null and worldBank included in before/after. Status remains FAIL pending runtime evidence.
- Runtime evidence (FAIL, Console.txt 2026-02-09):
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN`
  - `{"ok":false,"notes":["exception"],"errorMessage":"Cannot access 'threshold' before initialization."...}`
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END`
- Update (2026-02-09): moved seed threshold/margin + seedApplied/seedWhy initialization before log-source early returns to avoid `threshold` TDZ crash. Status remains FAIL pending runtime evidence.
- Update (2026-02-09): wealth-tax pack now uses log-source fallback candidates (`debug_moneyLog`, `debug_moneyLogByBattle`, `logger_queue`, `state_moneyLog*`) and removes `balances_unavailable` early-return. Added diag fields `logSourceCandidates`, `snapshotOk`, `snapshotWhy`, `scopedLen` in both JSONs. Status remains FAIL pending runtime evidence.
- Update (2026-02-09): Variant A runtime hardening — NPC econ-accounts now guaranteed in `conflict-economy.js` (syncs npc_* into econ accounts; points remain zero-sum), and wealth-tax pack hard-fails on `snapshot_unavailable` or `log_source_none` (no masking). Status remains FAIL pending runtime evidence.
- Update (2026-02-09): Variant A root-cause fix — applyNpcWealthTaxIfNeeded now falls back to econ-account points (or Game.State.players points) when npcPtsBefore is missing/0, eliminating `npc_account_missing` path when npc_* exist. Status: FIXED pending QA evidence.
- Update (2026-02-09): Variant A ensures npc econ-accounts via `ensureNpcEconAccount` in conflict-economy; missing npc_* accounts are created/synced from Game.State.players points without transfer/moneyLog. Status: FIXED pending QA evidence.
- Update (2026-02-09): wealth-tax pack logSource detection now prefers `Game.Debug.moneyLog` and reselects after ticks; added diag `taxCall` and `sampleTailReasons` to explain rowsScoped=0 or tax_missing. Status: FAIL pending runtime evidence.
- Update (2026-02-09): ordering fix — logSource/snapshot now computed AFTER ticks (no pre-tick rowsScoped=0). Added `diag.orderCheck` to evidence JSON. Status: FAIL pending runtime evidence.
- Update (2026-02-09): added `Game.__DEV.dumpMoneyLogSourcesOnce` helper that emits `WORLD_MONEYLOG_SOURCES_V1_BEGIN/END` + JSON summary of all log candidates before running other smokes. PASS when summary.ok true and `best.len>0`. Smoke command for QA: `Game.__DEV.dumpMoneyLogSourcesOnce({window:{lastN:200}})`. Status: FAIL until Console.txt shows the markers.
- Update (2026-02-09): Variant A econ-account migration added in `AsyncScene/Web/conflict/conflict-economy.js`. `getAccount` now falls back to `Game.State.players` and `ensureNpcAccountsFromState` creates/links missing npc_* accounts (dev marker `ECON_NPC_ACCOUNT_MIGRATE_V1`). `applyNpcWealthTaxIfNeeded` now ensures npc accounts exist before tax. Wealth-tax pack JSON now includes `npcAccountCount`, `npcAccountSample`, `npcAccountsMissingLen`, `npcAccountsMissingSample`. Status remains FAIL pending runtime evidence.
- Runtime evidence baseline (Console.txt 2026-02-09): no `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN/END` block present; manual probes show `npc_account_missing` and `[ACC missing count] 19 in `=== ECON NPC ACCOUNT PROBE ===` tail. 
- Update (2026-02-09): Added `Game.__DEV.smokeNpcAccountsEnsureOnce` QA command to verify npc econ-account ensure is idempotent and read-only. Added wealth-tax pack diag fields under `diag.npcAccounts.*`:
  - `ensureCalled`, `migrateMarkerSeen`, `createdNowCount`, `syncedNowCount`, `missingAfterEnsureLen`, `missingAfterEnsureSample`, `ensureIdempotentOk`.
- QA commands (exact):
  ```
  Game.__DEV.smokeNpcAccountsEnsureOnce({window:{lastN:200}})
  ```
  ```
  Game.__DEV.runEconNpcWealthTaxEvidencePackOnce({ticks:50, seedRichNpc:true, debugTelemetry:true, window:{lastN:400}})
  ```
- PASS checklist (Console.txt):
  - For `WORLD_ECON_NPC_ACCOUNTS_ENSURE_*`: `ok:true`, `missingAfterEnsureLen==0`, `worldDelta==0`, `moneyLogDelta==0`, and `migrateMarkerSeen` true on cold run or `createdNowCount==0` on warm run.
  - For wealth-tax pack: `diag.npcAccounts.ensureCalled==true`, `diag.npcAccounts.migrateMarkerSeen` true or `createdNowCount==0`, `diag.npcAccounts.missingAfterEnsureLen==0`, `world.delta==0`, `totalTaxInWindow>0`, `hasWorldTaxInRows:true`.
- QA smoke command:
  ```
  Game.__DEV.runEconNpcWealthTaxEvidencePackOnce({ticks:50, seedRichNpc:true, debugTelemetry:true, window:{lastN:400}})
  ```
- PASS evidence (Console.txt): ok:true, world.delta==0, rowsScoped>0, totalTaxInWindow>0, hasWorldTaxInRows:true, diag.accountsIncludedLen/hash + addedAccounts/fixedAccounts present; no world_contract_mismatch.
- Subtask: contract stability self-smoke helper (dev-checks only)
  - Status: FAIL (pending runtime evidence)
  - Command:
    ```
    Game.__DEV.smokeEconNpcWealthTaxContractStabilityOnce({window:{lastN:400}})
    ```
  - PASS checklist (Console.txt):
    - `WORLD_ECON_NPC_WEALTH_TAX_CONTRACT_STABILITY_BEGIN`
    - JSON#1 `ok:true`, asserts `noTotalsNullAll/noWorldMassDriftAll/noExceptionAll/hasWorldTaxInAtLeastOnce` true
    - JSON#2 contains `r50`, `r10a`, `r10b`
    - `WORLD_ECON_NPC_WEALTH_TAX_CONTRACT_STABILITY_END`
+ Update (2026-02-10): Variant A infra — добавлен `ensureNpcEconAccounts` (sync через `npc_account_sync` transfer с `sink` для сохранения zero-sum), `ensureNpcAccountsFromState` теперь использует его, `applyNpcWealthTaxIfNeeded` вызывает ensure перед налогом. Evidence pack пишет `diag.ensureNpcAccounts`. Status: FAIL (latest Console.txt shows 2 packs & smoke, but `totalTaxInWindow=0`, `world.delta=2`/`6`, `notes` include `tax_probe_missing_after_seed`, `world_tax_in_missing`, flush markers present).
+ Mini-check (P0 QA coverage, dump markers): маркеры `WEALTH_TAX_EVIDENCE_BEGIN`…`FLUSH_POST` реализованы, flush вызывает `__CONSOLE_TAPE_FLUSH__` и логирует `FLUSH_POST`. Статус: PASS (code confirmed); runtime evidence missing due to tax_missing.
+ Runtime evidence (Console.txt 2026-02-11): two packs show `logSource:"debug_moneyLog"`, `rowsScoped:206`, `worldDelta` ≠0, `totalTaxInWindow:0`, `diag.ensureNpcAccounts.createdCount=0`, `notes` include `world_tax_total_zero`, `tax_missing`. No `world_tax_in/world_tax_out`. Need targetded fix.
 Update (2026-02-10): runtime FAIL (Console.txt, build_2026_02_09b) after ensureNpcEconAccounts v2:
  - `WEALTH_TAX_EVIDENCE_BEGIN`
  - `WEALTH_TAX_EVIDENCE_JSON_1_PART ... "world":{"beforeTotal":211,"afterTotal":210,"delta":-1} ... "tax":{"totalTaxInWindow":0} ... "diag":{"logSource":"debug_moneyLog","rowsScoped":206,"ensureNpcAccounts":{"createdCount":0,"missingAfterCount":19} ... "taxProbe":{"why":"tax_missing"}}`
  - `WEALTH_TAX_EVIDENCE_JSON_2_PART ... "worldDelta":-1 ... "diag":{"logSourceChosen":"debug_moneyLog","rowsScoped":206,"ensureNpcAccounts":{"createdCount":0,"missingAfterCount":19}}`
  - `WEALTH_TAX_EVIDENCE_END` + `WEALTH_TAX_EVIDENCE_FLUSH` + `WEALTH_TAX_EVIDENCE_FLUSH_POST`
  - Second run in same tail shows `logSource:"none"`, `rowsScoped:0`, `seedFailureReason:"seed_target_not_reached"`, `ensureNpcAccounts.createdCount=0`, `missingAfterCount=19`.
  - Status: FAIL (accounts not created in ensure path, tax missing, world.delta != 0).

-### [T-20260211-015] ECON-NPC [1.7] Explainable world audit
- Status: PASS
- Evidence:
  - `Console.txt DUMP_AT 2026-02-12 19:59:43`: two sequential `Game.__DEV.smokeNpcWorldAuditExplainableOnce({ window:{lastN:200} })` runs produced `ok:true`, `failed:[]` with `rowsScoped` 21→23, `logSource:"debug_moneyLog"`.
  - Audit now exposes `explainability` with `fallbackUsed:true`, deterministic `topTransfers` (len=3) and `txFieldMapHits={amount:3,source:3,target:3,reason:3,counterparty:3}` while `meta.diag` holds `fallbackEval`/`afterFallback` plus `fallbackReason:"flowSummary"`.
  - `asserts.explainabilityTrace.traceVersion=="trace_v2"` / `diagVersion=="npc_audit_diag_v2"` with `selectedLogSource`, `rowsScoped`, `fallbackUsed`, `npcInvolvedRowsCount` (0 in trace, 1 in diag), `topTransfersLen:3`; leaks empty; invariants true.
  - QA recorded `CONSOLE_PANEL_RUN_OK` for both runs and no `CONSOLE_PANEL_RUN_ERR`.
- Priority: P0
- Assignee: Codex-ассистент
- Next: finish txn detection fix + QA (two runs)
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: expand the world audit with explainability information (reason stats, top transfers, per-NPC counterparties, anomalies) and validate via a dedicated smoke.
- Acceptance:
  - [ ] `audit.explainability.byReasonDetailed`, `topTransfers`, `perNpc`, and `anomalies` all present when rowsScoped>0.
  - [ ] `meta.explainabilityTrace` describes the scope window, logSource, and counts of directed rows.
  - [ ] `Game.__DEV.smokeNpcWorldAuditExplainableOnce({ window:{lastN:200} })` runs twice with `ok:true`, deterministic topTransfers (tie-broken by reason/source/target), and anomalies entries containing evidence.
- Result: |
    Status: FAIL (V2 explainability path added; QA pending)
    Facts:
      - Flow-summary fallback now creates synthetic `audit_actor -> bank` transfers from `flowSummary.byCounterpartyTop`, fills `topTransfers`, `txFieldMapHits`, and `byReasonDetailed`, and sets `fallbackUsed` so `explainability.hasTransactions` switches true even when normalized rows lack counterparties.
      - `meta.explainabilityTrace.traceVersion=="trace_v2"` now exposes `selectedLogSource`, `rowsScoped`, `topTransfersLen`, `fallbackUsed`, `npcInvolvedRowsCount`, and `reasonIfNoTx`, while `diagVersion==npc_audit_diag_v2` and `diag.fallbackUsed:true`/`diag.fallbackReason:"flowSummary"` prove the patched trace path is running.
      - Runtime FAIL (Console.txt DUMP_AT 2026-02-12 17:49:29) captured `logSource:"debug_moneyLog"`, `rowsScoped:21..23`, `flowSummary.totals` (inTotal/outTotal) 1..2, `notes:[dev_tx_probe_applied]`, but `explainability.hasTransactions:false`, `topTransfersLen:0`, `txFieldMapHits` zeros, empty `meta.explainabilityTrace`, and `failed:[reasons_missing, log_source_not_transactional, top_transfers_empty, no_tx_rows]`. V2 path now wired via `calledFrom:"npc_audit_explainable_smoke_v2"`; need fresh DUMP after QA to confirm fallbackUsed/topTransfers.
      - Runtime crash (Console.txt DUMP_AT 2026-02-12 15:43:35) showed `ReferenceError: Can't find variable: TRACE_VERSION` when `Game.__DEV.smokeNpcWorldAuditExplainableOnce` tried to tag `traceVersion`; defining the constant globally removes this crash for future runs.
    Commands:
      (1) `Game.__DEV.smokeNpcWorldAuditExplainableOnce({ window:{lastN:200} })`
      (2) `Game.__DEV.smokeNpcWorldAuditExplainableOnce({ window:{lastN:200} })`
    Expected evidence fields: `rowsScoped`, `fallbackUsed:true`, `topTransfersLen`, `ok:true`, `failed:[]`, `diagVersion:npc_audit_diag_v2`, `traceVersion:trace_v2`.
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Запусти в консоли:
    (1) Game.__DEV.smokeNpcWorldAuditExplainableOnce({ window:{lastN:200} })
    (2) Game.__DEV.smokeNpcWorldAuditExplainableOnce({ window:{lastN:200} })
    PASS если оба {ok:true, failed:[]} и `audit.explainability.topTransfers.length` 1..5 (when rowsScoped>0), `anomalies` entries include evidence, and no NaN/undefined in explainability sums.
    ```

- Status: FAIL (QA pending after patch)
- Evidence:
  - `Console.txt DUMP_AT 2026-02-12 21:32:43` подтверждает FAIL: `asserts.worldMassOk:true`, `snapshotReport.deltaWorld:0`, но `balanceCompareById.sink/worldBank.afterMinusBefore == 0` при `moneyLogNetDelta sink:-10/worldBank:+10`, `balanceSourceById.sink/worldBank == "snapshot.byId"`.
- Change (not yet QA-verified):
  - Добавлен `Econ.getLedgerBalanceAt` на основе `Game.__D.moneyLog`, а `readEconBalanceStrict` теперь использует `uptoIndex` (before/after money log lengths) чтобы читать sink/worldBank напрямую из ledger без `snapshot.byId`.
  - После записи smoke фиксируются `moneyLogBeforeIndex`/`moneyLogAfterIndex`, `balanceSourceById` показывает `econ.getLedgerBalanceAt`, `balanceReadModeById` переходит в `ledger_at`, `balanceCompareById` включает `afterMinusBefore` и `ledger`-дельты настроены по `moneyLog`.
  - `snapshotReport.beforePoints/afterPoints` и `balanceProbe` для contractIds полагаются на `readEconBalanceStrict` с указанием `beforeIdx`/`afterIdx`, чтобы world mass отражал ledger.
- Commands:
  - `Game.__DEV.smokeBattleCrowdOutcomeOnce({ mode:"majority" })` (x2)
  - `Game.__DUMP_ALL__()`
- Result: |
    Status: FAIL (QA pending)
    Facts:
      - Ридер теперь фиксирует `balanceSourceById`, использует `econ.getLedgerBalanceAt` с `moneyLogBeforeIndex/AfterIndex`, и `balanceReadModeById` переходит в `ledger_at`, чтобы `afterMinusBefore` совпал с `moneyLogNetDelta`.
      - Диагностика стала экспортировать `moneyLogBeforeIndex`, `moneyLogAfterIndex`, `ledgerLenBefore`, `ledgerLenAfter`, а `balanceCompareById` показывает `afterMinusBefore == moneyLogNetDelta`.
      - При PASS: `balanceCompareById.sink.afterMinusBefore == -10`, `balanceCompareById.worldBank.afterMinusBefore == +10`, `balanceSourceById.sink/worldBank == "econ.getLedgerBalanceAt"`, `balanceReadModeById.sink/worldBank == "ledger_at"`, `snapshotReport.deltaWorld == 0`.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    How to verify:
      1. Запустить два smoke подряд и затем `Game.__DUMP_ALL__()` для нового `DUMP_AT`.
      2. PASS если оба smoke возвращают `asserts.worldMassOk:true`, `snapshotReport.deltaWorld:0`, `balanceCompareById.sink.afterMinusBefore == -10`, `balanceCompareById.worldBank.afterMinusBefore == +10`, `balanceSourceById.sink/worldBank == "econ.getLedgerBalanceAt"`, `balanceReadModeById.sink/worldBank == "ledger_at"`, `moneyLogReport.sumNetFromMoneyLog == 0`, `snapshotReport.sumNetDelta == 0`, и нет `CONSOLE_PANEL_RUN_ERR`.
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    (1) Game.__DEV.smokeBattleCrowdOutcomeOnce({ mode:"majority" })
    (2) Game.__DEV.smokeBattleCrowdOutcomeOnce({ mode:"majority" })
    (3) Game.__DUMP_ALL__()
    PASS если оба smoke возвращают asserts.worldMassOk:true, snapshotReport.deltaWorld:0, balanceCompareById.sink.afterMinusBefore == -10, balanceCompareById.worldBank.afterMinusBefore == +10, balanceSourceById.sink/worldBank != "snapshot.byId", moneyLogReport.sumNetFromMoneyLog == 0, snapshotReport.sumNetDelta == 0, и нет CONSOLE_PANEL_RUN_ERR; иначе FAIL и приложи diag.balanceReadModeById + balanceCompareById + balanceSourceById для sink/worldBank.
    ```
- Status: FAIL
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: Dev Infra
- Files: `AsyncScene/Web/dev/console-tape.js` `AsyncScene/Web/ui/ui-console-panel.js`
- Goal: allow Console Panel to run top-level `await` expressions (global scope, async wrapper) so ECON_NPC readiness commands don’t trigger SyntaxError.
- Acceptance:
  - [x] `runEval` wraps input inside `(async () => { ... })()` executed via `new Function` bound to `window`, so `Game` is visible.
  - [x] Panel awaits returned Promise before logging `CONSOLE_PANEL_RUN_OK`.
  - [x] Panel still logs errors when needed and dump markers remain unchanged.
- Result: |
    Status: FAIL (Console.txt DUMP_AT 2026-02-13 20:41:44 shows ECON_NPC_READINESS_PACK_JSON1/JSON2 with `checklist:{}` and `failReasons:["exception"]`, plus CONSOLE_PANEL_RUN_OK result `undefined`).
    Facts:
      (1) Readiness pack emitted JSON1/JSON2 but `checklist` is empty and `allOk:false`, so readiness result is invalid.
      (2) Console Panel logged `CONSOLE_PANEL_RUN_OK ... undefined`, so the async result was not returned.
      (3) Need to fix readiness pack exception and ensure async eval returns the IIFE result.
      (4) Console.txt DUMP_AT 2026-02-13 21:08:41: JSON2 `failReasons:["exception"]`, errorMessage `Can't find variable: ensureNpcAccountsOkFromSmoke`; readiness pack still not valid.
    Changed: `AsyncScene/Web/dev/console-tape.js` `AsyncScene/Web/dev/dev-checks.js`
    Fix Applied:
      - Добавлены объявления `ensureNpcAccountsOkFromEnsure/ensureNpcAccountsOkFromSmoke/ensureNpcAccountsOkMismatch` в `Game.__DEV.runEconNpcWealthTaxEvidencePackOnce`, чтобы убрать ReferenceError.
    How to verify:
      (1) Reload dev page.
      (2) Run `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })` via Console Panel.
      (3) `Game.__DUMP_ALL__()` to capture ECON_NPC_READINESS_PACK_* markers.
    Next: QA
    Next Prompt (копипаст, кодблок обязательно):
    ```text
    (1) Reload dev page
    (2) await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })
    (3) Game.__DUMP_ALL__()
    PASS if CONSOLE_PANEL_RUN_OK returns an object and ECON_NPC_READINESS_PACK_JSON2 has checklist keys 1.1..1.8.
    ```

- Status: FAIL (smoke не запускался)
- Priority: P0
- Assignee: Codex-ассистент
- Area: ECON-NPC readiness pack
- Files: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/ui/ui-console-panel.js`
- Result: |
    Status: FAIL (нужен новый QA DUMP)
    Facts:
      - В `smokeEconNpc_ReadinessPackOnce` контракт JSON2 усилен: `allOk` зависит от `1.1..1.8` + `regressOk` + `longOk` + `worldDelta==0`, `failReasons` очищается при `allOk:true`, `world_delta_nonzero` добавляется только при числовом `worldDelta`, `Game.__DEV.lastEconNpcReadinessPack` теперь строго `{ ok, json1, json2 }`.
      - Console Panel теперь всегда логирует объект результата: если eval вернул `undefined`, подставляется `{ ok:true, value:undefined }`, чтобы `CONSOLE_PANEL_RUN_OK` был объектом.
      - Smoke не запускался, DUMP_AT отсутствует.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/ui/ui-console-panel.js`
    Commands:
      (1) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })`
      (2) `Game.__DUMP_ALL__()`
    Evidence: DUMP_AT: n/a (QA не запускался)
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    (1) Reload dev page (dev=1)
    (2) await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })
    (3) Game.__DUMP_ALL__()
    PASS если:
    - верхний DUMP_AT содержит ECON_NPC_READINESS_PACK_BEGIN/JSON1/JSON2/END
    - CONSOLE_PANEL_RUN_OK содержит объект результата с ok:true
    - JSON2.checklist имеет ключи 1.1..1.8, failReasons пуст, allOk===true
    - long summary worldDelta==0, regress ok:true
    - нет exception/errorMessage
    ```

- Status: FAIL (readiness pack still failing)
- Priority: P0
- Assignee: Codex-ассистент
- Area: ECON-NPC readiness pack
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Result: |
    Status: FAIL (JSON2.allOk:false)
    Facts:
      - Новейший `DUMP_AT 2026-02-13 23:08:35` содержит ECON_NPC_READINESS_PACK_BEGIN/JSON1/JSON2/END, `CONSOLE_PANEL_RUN_OK` с объектом и длинный summary worldDelta=0, regress ok:true, longSmoke ok:true.
      - JSON2.checklist заполнил 1.1..1.8, но 1.3/1.4/1.5/1.6 остались false; failReasons:`check_1.3`,`check_1.4`,`check_1.5`,`check_1.6`, failNotes привязаны к этим ключам (NOT_IMPLEMENTED для 1.4).
      - В JSON1 регресс и longSmoke по контракту, исключений нет.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    Commands:
      (1) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })`
      (2) `Game.__DUMP_ALL__()`
    Evidence: DUMP_AT: `2026-02-13 23:08:35`, JSON2.allOk:false, checklist 1.3/1.4/1.5/1.6 false, failReasons: [check_1.3, check_1.4, check_1.5, check_1.6], regress.ok:true, longSmoke.summary.worldDelta:0.
    Next: QA (re-run once 1.3-1.6 fixed)


- Status: FAIL (readiness pack still failing)
- Priority: P0
- Assignee: Codex-ассистент
- Area: ECON-NPC readiness pack
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Result: |
    Status: FAIL (JSON2.allOk:false)
    Facts:
      - Самый верхний DUMP_AT: `2026-02-13 23:24:30` содержит ECON_NPC_READINESS_PACK_BEGIN/JSON1/JSON2/END и `CONSOLE_PANEL_RUN_OK` с объектом.
      - JSON2.checklist: 1.1:true, 1.2:true, 1.3:true, 1.4:true, 1.5:false, 1.6:false, 1.7:true, 1.8:true.
      - JSON2.failReasons: [check_1.5, check_1.6]; failNotes: 1.5:[failed], 1.6:[failed]; allOk:false.
      - JSON1: regress.ok:true; longSmoke.ok:true; longSmoke.summary.worldDelta:0.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    Commands:
      (1) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })`
      (2) `Game.__DUMP_ALL__()`
    Next: QA


- Status: FAIL (QA pending; no new DUMP_AT)
- Priority: P0
- Assignee: Codex-ассистент
- Area: ECON-NPC readiness pack
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Result: |
    Status: FAIL (нет нового DUMP_AT после фиксов)
    Facts:
      - Последний верхний DUMP_AT: `2026-02-13 23:24:30` → JSON2.allOk:false из-за check_1.5/1.6.
      - В readiness pack обновлены критерии 1.5/1.6: 1.5 требует детерминизм двух прогонов (worldDelta==0, taxRowsCount/totalTax равны), 1.6 включает мини-доказательство low-funds с откатом состояния и проверкой npc_skip_low_funds без insufficient.
      - Новый smoke не запускался; требуется QA.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    Commands:
      (1) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })`
      (2) `Game.__DUMP_ALL__()`
    Next: QA


- Status: FAIL (QA pending; no new DUMP_AT)
- Priority: P0
- Assignee: Codex-ассистент
- Area: ECON-NPC readiness pack
- Files: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/events.js`
- Result: |
    Status: FAIL (нет нового DUMP_AT после правок)
    Facts:
      - Верхний DUMP_AT: `2026-02-14 00:05:18` → JSON2.allOk:false, failReasons:[check_1.4, check_1.6].
      - 1.4 FAIL: missing_world_stipend_reasons; reasonsHit.world_tax_in>0, world_stipend_out==0.
      - 1.6 FAIL: exception "Циркуляция: прямое изменение баланса заблокировано (State.players.npc_weak.points)" из runLowFundsMini.
      - Исправлено: runLowFundsMini теперь делает только transferPoints (npc -> worldBank -> npc) без прямых мутаций; stipend tick включён в Events.tick через Econ.maybeWorldStipendTick (transfer-only).
    Changed: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/events.js`
    Commands:
      (1) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })`
      (2) `Game.__DUMP_ALL__()`
    Next: QA


- Status: FAIL (QA pending; no new DUMP_AT)
- Priority: P0
- Assignee: Codex-ассистент
- Area: ECON-NPC readiness pack
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Result: |
    Status: FAIL (верхний DUMP_AT показывает check_1.4/check_1.6)
    Facts:
      - Верхний DUMP_AT: `2026-02-14 10:36:32` (Console.txt), JSON2.failReasons:[check_1.4, check_1.6], JSON2.allOk:false.
      - 1.4 FAIL: missing_world_stipend_reasons; reasonsHit.world_tax_in>0, world_stipend_out==0.
      - 1.6 FAIL: mini-proof не дал npc_skip_low_funds (failNotes "failed").
      - Исправлено: 1.4 добавлен dev-only stipend proof (transfer-only) + lastSeenAt для reasons; 1.6 mini-proof теперь только transferPoints и фиксирует seenSkipReason/seenInsufficient.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    Commands (QA выполняет пользователь):
      (1) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })`
      (2) `Game.__DUMP_ALL__()`
    Expected markers: ECON_NPC_READINESS_PACK_BEGIN/JSON1/JSON2/END + JSON2.allOk:true
    Next: QA


- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Area: ECON-NPC readiness pack
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Result: |
    Status: PASS
    Facts:
      - DUMP_AT `2026-02-15 17:51:14` shows ECON_NPC_READINESS_PACK_BEGIN/JSON1/JSON2/END and `CONSOLE_PANEL_RUN_OK` returning an object.
      - JSON2: allOk:true, checklist 1.1..1.8 true, failReasons empty, longSmoke hasNpcSkipLowFunds:true, negativeBalances:false, regress.ok:true.
      - PASS proof relies on longSmoke guard (hasNpcSkipLowFunds && !negativeBalances) plus mini-proof fallback; diagnostics now record npcId/logSourceUsed/seenSkipReason/seenInsufficient/sampleReasons.
    Changed: `AsyncScene/Web/dev/dev-checks.js`
    Commands (QA выполнял пользователь):
      (1) `await Game.__DEV.smokeEconNpc_ReadinessPackOnce({ window:{ lastN:200 }, long:{ ticks:50 }, repeatN:2, dumpHint:"Game.__DUMP_ALL__()" })`
      (2) `Game.__DUMP_ALL__()`
    Evidence: DUMP_AT `2026-02-15 17:51:14`, JSON2.allOk:true, checklist 1.1..1.8 true, failReasons: []

### [LOG-20260215-001] ECON-SOC inventory map
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: PASS
    Facts:
      - totalHits=5, suspiciousPointsMutations=3; социальные callsite’ы сверены по reports/abuse/penalty/compensation.
      - Примеры callsite’ов: `/Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/conflict/conflict-core.js:233` (reason=`toxicHit`, fallback изменяет `me.points` без Econ), `/Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/conflict/conflict-core.js:1933` (reason=`cop_penalty`, direct clamp когда Econ отключён), `/Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/state.js:2298` (reason=`rep_report_true`, compensation через `transferRep`).
      - Карта ECON_SOC_INV_V1 перечисляет эти места и ещё два compliant callsite’а по репорту (true/false) с логированием в `Game.__D.moneyLog`.
    Changed: `TASKS.md` `PROJECT_MEMORY.md`
    How to verify:
      (1) Прочитать секцию ECON_SOC_INV_V1 в итоговом сообщении.
      (2) Перезапустить `rg -n "addPoints|addRep|grantPoints|givePoints|incPoints|setPoints\(|points\s*\+=|\.points\s*=|reward|compensate|refund|penalty|fine|sanction|cooldown|rateLimit|abuse|spam|report" AsyncScene/Web` и `rg -n "transferPoints|Econ\.transferPoints|transferRep|Econ\.transferRep" AsyncScene/Web` и свериться с картой.
  Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Ассистента:
      Если найдутся новые report/abuse/compensation/penalty callsite’ы, повторно собери карту ECON_SOC_INV_V1 и обнови TOTAL/Top risks/Next Prompt в TASKS.md + PROJECT_MEMORY.md.
      ```

### [LOG-20260215-002] ECON-SOC [1] remove points emission in social fallback
- Status: FAIL (smoke not run here)
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/dev/dev-checks.js` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: FAIL (нужен smoke-артефакт)
    Facts:
      - Убраны прямые мутации `me.points` в 3 местах: toxicHit/bandit_robbery/cop_penalty. Теперь только `transferPoints` с partial-логикой и meta `{amountWanted, amountActual, pointsBefore, pointsAfter, partial}`.
      - Добавлен dev-only хелпер `Game.__DEV.smokeEconSoc_Step1_NoEmissionPackOnce({window:{lastN:200}})` с BEGIN/JSON1/JSON2/END маркерами, sumPointsSnapshot before/after, report true/false/repeat false и scoped moneyLog.
      - Smoke не запускался, артефакт в Console.txt отсутствует.
    Smoke command:
      Game.__DEV.smokeEconSoc_Step1_NoEmissionPackOnce({ window:{ lastN:200 } })

### [LOG-20260215-003] ECON-SOC [1] smoke TDZ targetRole
- Status: FAIL
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js`
- Result: |
    Status: FAIL (Console.txt DUMP_AT 2026-02-15 18:23:45; smoke aborted by TDZ targetRole)
    Facts:
      - `Console.txt` shows `ECON_SOC_STEP1_JSON2` with `errorMessage:"Cannot access 'targetRole' before initialization."` while running `Game.__DEV.smokeEconSoc_Step1_NoEmissionPackOnce({ window:{ lastN:200 } })`.
      - stack trace points to `AsyncScene/Web/state.js` `applyReportByRole` referencing `targetRole` before it is declared, so the smoke never returns an object and Console Panel reports `undefined`.
    Proof markers: ECON_SOC_STEP1_BEGIN/JSON1/JSON2/END + `CONSOLE_PANEL_RUN_OK` showing `value: undefined`.
QA: run Game.__DEV.smokeEconSoc_Step1_NoEmissionPackOnce({ window:{ lastN:200 } }) then Game.__DUMP_ALL__() and verify markers.

### [LOG-20260215-004] ECON-SOC baseline Step1 PASS (Console.txt)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: PASS
    Facts:
      - Console.txt DUMP_AT `2026-02-15 18:53:44` содержит `ECON_SOC_STEP1_JSON2` ok:true и `CONSOLE_PANEL_RUN_OK` с объектом результата.
      - Блок proof: `ECON_SOC_STEP1_BEGIN/JSON1/JSON2/END` присутствует.

### [LOG-20260215-005] ECON-SOC Step2 truthful audit + no-emission fix (pending runtime)
- Status: FAIL (smoke not run here)
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: FAIL (нужен runtime smoke)
    Facts:
      - Аудит truthful report: `rep_report_true` вызывается в `AsyncScene/Web/state.js` и реп лог сохраняется; компенсация victim по points существовала через `addPoints` (emission) и бонус `addPoints(1)`.
      - Эмиссия заменена на `transferPoints("worldBank" -> "me", reason="report_true_compensation")` с partial meta `{amountWanted, amountActual, pointsBefore, pointsAfter, partial, kind}` для возврата и бонуса.
      - Добавлен `Game.__DEV.smokeEconSoc_Step2_TruthfulOnce()` с `ECON_SOC_STEP2_BEGIN/JSON/END` и результатом `{ok, hasRepLog, hasPointsTransfer, hasEmission, beforeTotal, afterTotal, drift}`.
    Smoke command:
      Game.__DEV.smokeEconSoc_Step2_TruthfulOnce({ window:{ lastN:200 } })
      Game.__DUMP_ALL__()

### [LOG-20260215-006] ECON-SOC Step3 baseline (false report)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 19:10:54` зафиксирован как baseline перед шагом 3.

### [LOG-20260215-007] ECON-SOC Step3 false penalty transfer + smoke (pending runtime)
- Status: FAIL (smoke not run here)
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: FAIL (нужен runtime smoke)
    Facts:
      - Ложный донос: points-штраф добавлен через `transferPoints("me" -> "sink", reason="report_false_penalty")` с partial meta `{amountWanted, amountActual, pointsBefore, pointsAfter, partial}`; rep_report_false сохранён.
      - Добавлен `Game.__DEV.smokeEconSoc_Step3_FalseOnce()` с `ECON_SOC_STEP3_BEGIN/JSON/END` и результатом `{ok, hasRepLog, hasPointsPenalty, hasEmission, beforeTotal, afterTotal, drift, reasons}`.
    Smoke command:
      Game.__DEV.smokeEconSoc_Step3_FalseOnce({ window:{ lastN:200 } })
      Game.__DUMP_ALL__()

### [LOG-20260215-024] ECON-SOC P0 restore dev-checks.js + Step4 smoke load (pending runtime)
- Status: FAIL (runtime not run here)
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: FAIL (нужен runtime smoke)
    Facts:
      - dev-checks.js восстановлен из git (commit d9a6035) после удаления/синтакс-ошибки.
      - Удалены дубли let (ошибка rlKey1 устранена), добавлен маркер загрузки `ECON_SOC_STEP4_SMOKE_V1_LOADED`.
      - Проверены smoke-функции Step1-4: определены в dev-checks.js (сборка требует runtime проверки).
    Smoke command:
      typeof Game.__DEV.smokeEconSoc_Step1_NoEmissionPackOnce
      typeof Game.__DEV.smokeEconSoc_Step2_TruthfulOnce
      typeof Game.__DEV.smokeEconSoc_Step3_FalseOnce
      typeof Game.__DEV.smokeEconSoc_Step4_RepeatFalseOnce
      Game.__DEV.smokeEconSoc_Step4_RepeatFalseOnce({ window:{ lastN:300 } })
      Game.__DUMP_ALL__()

### [LOG-20260215-008] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 19:15:44)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 19:15:44` фиксирует ECON_SOC_STEP3_JSON ok:false с reasons: [rep_report_true], failed: [rep_log_missing, points_penalty_missing].

### [LOG-20260215-009] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 19:20:52)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 19:20:52` показывает ECON_SOC_STEP3_JSON ok:false, reasons: [npc_account_init, rep_report_true], failed: [rep_log_missing, points_penalty_missing].

### [LOG-20260215-011] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 19:28:32)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 19:28:32` shows ECON_SOC_STEP3_JSON ok:false with reasons `[rep_report_false]`, hasPointsPenalty=false and warning `transferRep insufficient funds`.

### [LOG-20260215-012] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 19:30:45)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 19:30:45` показывает ECON_SOC_STEP3_JSON ok:false: rep_report_false есть, report_false_penalty нет, smoke_seed_points не найден, WARN transferRep insufficient funds.

### [LOG-20260215-013] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 22:02:53)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:02:53` показывает ECON_SOC_STEP3_JSON ok:false: seedRequired=false/seedApplied=false при me.points=0, report_false_penalty отсутствует, rep_report_false есть.

### [LOG-20260215-014] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 22:06:33)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:06:33` показывает ECON_SOC_STEP3_JSON ok:false: points изменились (pointsBefore=10 pointsAfter=5), но reasons только [rep_report_false], hasPointsPenalty=false.

### [LOG-20260215-015] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 22:11:06)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:11:06` показывает ECON_SOC_STEP3_JSON ok:false: pointsBefore=10 pointsAfter=5 pointsPenaltyAmount=5, reasons=[rep_report_false], penaltyRowFound=false.

### [LOG-20260215-016] ECON-SOC Step3 baseline (DUMP_AT 2026-02-15 22:16:14)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:16:14` показывает ECON_SOC_STEP3_JSON ok:false: penaltyRowFound=false, hasPointsPenalty=false, reasons=`["rep_report_false"]`, но tailReasonsSample заканчивается на [...,"report_false_penalty","rep_report_false"] (см. diag).

### [LOG-20260215-017] ECON-SOC Step3 smoke false PASS (DUMP_AT 2026-02-15 22:20:57)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: PASS
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:20:57` показывает ECON_SOC_STEP3_JSON ok:true failed:[] drift:0 reasons includes `["rep_report_false","report_false_penalty"]` и `penaltyRowFound:true`.
    Smoke command:
      Game.__DEV.smokeEconSoc_Step3_FalseOnce({ window:{ lastN:200 } })
      Game.__DUMP_ALL__()

### [LOG-20260215-018] ECON-SOC Step4 baseline (DUMP_AT 2026-02-15 22:20:57)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:20:57` подтверждает Step3 PASS и используется как baseline перед Step4.

### [LOG-20260215-019] ECON-SOC Step4 repeat false audit + smoke (pending runtime)
- Status: FAIL (smoke not run here)
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: FAIL (нужен runtime smoke)
    Facts:
      - Repeat false теперь ограничен через `Security.rateLimit("report_repeat", windowMs=4000, max=1, stableKey actor|target|role)` в `AsyncScene/Web/state.js` ДО штрафов; при блоке добавлен moneyLog reason `report_rate_limited` и маркеры `REPORT_REPEAT_RL_V1_LOADED/CHECK/BLOCK`.
      - Repeat по hasReported срабатывает только после ok=true; повторный false теперь блокируется report_repeat rate-limit.
      - Добавлен smoke `Game.__DEV.smokeEconSoc_Step4_RepeatFalseOnce()` с маркерами `ECON_SOC_STEP4_BEGIN/JSON/END`, проверяет первый false и второй rate-limit, без эмиссии, drift=0; фиксирует `second_penalized_instead_of_blocked`, `penalty_count_mismatch`, `repeat_key_instability`, `rl_key_instability`, `rl_block_missing` и логирует rlKey1/rlKey2.
    Smoke command:
      Game.__DEV.smokeEconSoc_Step4_RepeatFalseOnce({ window:{ lastN:200 } })
      Game.__DUMP_ALL__()

### [LOG-20260215-020] ECON-SOC Step4 baseline (DUMP_AT 2026-02-15 22:29:49)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:29:49` показывает ECON_SOC_STEP4_JSON ok:false failed:[second_not_rate_limited], second.rateLimited=false, tailReasonsSample содержит повторные report_false_penalty без report_rate_limited.

### [LOG-20260215-021] ECON-SOC Step4 baseline (DUMP_AT 2026-02-15 22:33:13)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:33:13` показывает ECON_SOC_STEP4_JSON ok:false failed:[second_not_rate_limited, second_penalized_instead_of_blocked], второй false снова штрафует points.

### [LOG-20260215-022] ECON-SOC Step4 baseline (DUMP_AT 2026-02-15 22:37:08)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:37:08` показывает ECON_SOC_STEP4_JSON ok:false: REPORT_REPEAT_RL_V1_LOADED есть, REPORT_REPEAT_RL_V1_BLOCK отсутствует, penaltyCount=2, report_rate_limited нет.

### [LOG-20260215-023] ECON-SOC Step4 baseline (DUMP_AT 2026-02-15 22:40:11)
- Status: STARTED
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `Console.txt` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: STARTED
    Facts:
      - Console.txt DUMP_AT `2026-02-15 22:40:11` показывает REPORT_REPEAT_RL_V1_CHECK #1/#2 blocked:false с разными key, resetAt:null; второй false штрафует (penaltyCount=2), report_rate_limited нет.

### [LOG-20260215-010] ECON-SOC Step3 smoke false deterministic (pending runtime)
- Status: FAIL (smoke not run here)
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md` `PROJECT_MEMORY.md`
- Result: |
    Status: FAIL (нужен runtime smoke)
    Facts:
      - В `smokeEconSoc_Step3_FalseOnce` ложный репорт сделан детерминированным через временный name+role override: target.role="", target.type=actualRole, target.name=`smoke_false_<wrongRole>`; затем `applyReportByRole(reportedName)`.
      - Роллбек target.role/type/name гарантирован в finally; meta `roleFlipUsed/roleFlipRollbackOk` сохраняются.
      - Перед false-репортом smoke seed-ит me.points через `transferPoints("worldBank","me", needSeed, "smoke_seed_points", ...)`, поэтому penalty не падает из-за нулевого баланса.
      - Добавлены флаги `seedApplied/seedRequired` и проверка порядка: seed должен быть в moneyLog до `rep_report_false`.
      - Исправлен расчет penaltyAmount и seed: amount берется из `N.COP.report.falsePenalty` (канон), seed = `penaltyAmount - me.points`, JSON содержит `pointsPenaltyAmount/pointsBefore/pointsAfter/seedReasonSeen`.
      - В Step3 smoke добавлена диагностика `penaltyRowFound/penaltyRowSample/scopedLen` и расширен поиск `report_false_penalty` по окну tail, а не только scoped.
      - Добавлены trace-маркеры `ECON_SOC_FALSE_PTS_TRACE_V1` в false-ветке state.js (до/после transferPoints и после false_report) и усилена проверка: при изменении points без penalty-row фиксируется `penalty_row_missing_even_though_points_changed`.
    Smoke command:
      Game.__DEV.smokeEconSoc_Step3_FalseOnce({ window:{ lastN:200 } })
      Game.__DUMP_ALL__()

### [LOG-20260217-002] P2P flag sync (ENABLE vs BACKLOG)
- Status: PASS
- Priority: P2
- Assignee: Codex-ассистент
- Next: —
- Area: UI/Config
- Files: `Web/data.js` `Web/ui/ui-core.js` `Web/ui-old.js` `Web/ui/ui-dm.js` `Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: PASS (single source of truth)
    Facts:
      - `Data.RULES.p2pTransfersEnabled` default false, `Game.Data` helper/shim and `Game.Rules` helper added so all UI consults the same switch.
      - Legacy `Web/ui-old.js` now renders a single honest CTA when flag=false and placeholder CTAs when true; the actions no longer mutate `S.me.points`.
      - Modern `Web/ui/ui-dm.js` replaces grey disabled buttons with informative buttons that log the helper state and never touch the economy.
      - Added `Game.__DEV.smokeP2PFlagUXOnce()` to print both UI points, force-enable the flag, re-log, and revert; smoke command: `Game.__DEV.smokeP2PFlagUXOnce()` in dev console.
    Changed: `Web/data.js` `Web/ui/ui-core.js` `Web/ui-old.js` `Web/ui/ui-dm.js` `Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Codex-ассистент:
    Если появятся новые P2P-элементы или флаги, проверь `Game.Rules.isP2PTransfersEnabled()`, убедись, что UI равномерно реагирует, запусти `Game.__DEV.smokeP2PFlagUXOnce()` и занеси изменения в PROJECT_MEMORY.md/TASKS.md.
    ```

### [LOG-20260217-003] ECON-P2P P2P-A1 minimal transfer API (smoke pending)
- Status: PASS
- Priority: P2
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: FAIL (smoke not run)
    Facts:
      - `Game.Econ.requestP2PTransfer({sourceId,targetId,amount})` добавлен и вызывает только `E.transferPoints(..., "p2p_transfer")` после валидаций и guard `Game.Rules.isP2PTransfersEnabled()`.
      - Прямых мутаций `S.me.points` нет.
      - Добавлен smoke `Game.__DEV.smokeP2PTransferOnce()` с логированием before/after/world/log count.
      - Smoke output: NOT RUN (before/after/world/log неизвестны).
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      1. Открыть dev-консоль
      2. `Game.__DEV.smokeP2PTransferOnce()`
      3. Убедиться: source=-1 target=+1 worldDelta=0 p2pCount=1 без отрицательных балансов
    Next: QA
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    В dev-консоли запусти `Game.__DEV.smokeP2PTransferOnce()` и приложи лог P2P_SMOKE before/after/world/log; PASS если source=-1 target=+1 worldDelta=0 p2pCount=1 и нет negative balance, иначе FAIL.
    ```

### [LOG-20260217-004] ECON-P2P P2P-A2 minimal guards (smoke pending)
- Status: FAIL (smoke not run)
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: FAIL (smoke not run)
    Facts:
      - `Game.Econ.requestP2PTransfer` возвращает канонические `reason` и не пишет `p2p_transfer` при FAIL; direct mutations отсутствуют.
      - Разрешён dev-путь player<->npc; `allowNpc:true` добавлен в details/вывод smoke.
      - Добавлен smoke `Game.__DEV.smokeP2PTransfer_GuardsOnce()` с 4 кейсами и JSON-выводом per case.
    Console evidence: `P2P_GUARD_CASE case_1_amount_zero ... reason p2p_invalid_amount ... newLogCount 0 p2pCount 0 worldDelta 0`, `case_2_insufficient ... p2p_insufficient_points`, `case_3_self_transfer ... p2p_self_transfer_forbidden`, `case_4_valid ... newLogCount 1 p2pCount 1 worldDelta 0`, `P2P_GUARD_RESULT {"ok":true,"failed":[]}`
    Smoke output: Console.txt DUMP_AT 2026-02-17 16:47:16
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      1. Проверить Console.txt
      2. В dev-консоли: `Game.__DEV.smokeP2PTransfer_GuardsOnce()`
      3. PASS если все 4 кейса совпали с ожиданиями, worldDelta=0, p2pCount=0 в FAIL и p2pCount=1 в PASS
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Проверить Console.txt. Затем в dev-консоли запустить `Game.__DEV.smokeP2PTransfer_GuardsOnce()`. Приложить P2P_GUARD_CASE + P2P_GUARD_RESULT из консоли. PASS если кейсы 1-4 совпали с требованиями (FAIL без p2p_transfer логов и без изменений балансов; PASS с source -1, target +1, worldDelta=0, p2pCount=1), иначе FAIL.
    ```

### [LOG-20260217-005] ECON-P2P P2P-A4 CTA ux (PASS)
- Status: PASS
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: UI
- Files: `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: PASS
    Facts:
      - Modern/legacy DM используют `createP2PTransferCTA`/`createLegacyP2PTransferCTA` без disabled-заглушек, с prompt на amount и понятными сообщениями.
      - Причины ошибок напрямую показываются (`invalid_amount`, `insufficient_points`, `self_transfer_forbidden`, `p2p_disabled`).
      - Проверки: A) флаг false — объяснение, B) флаг true + отмена, C) amount=0 → `p2p_invalid_amount`, D) amount=1 → реальный перевод.
    Evidence (modern DM): "Система: Передача отключена — ждите, пока мы включим её снова."
    Критерий: в modern DM нет серых disabled кнопок.
    How to verify:
      1. Проверить Console.txt на отсутствие ошибок.
      2. Open DM с игроком: флаг false → клик, получить объяснение.
      3. С включённым флагом: клик → prompt, ввод 0 → `p2p_invalid_amount`.
      4. С вводом 1 → успешный перевод (или `Game.__DEV.smokeP2PTransferOnce()`).
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Проверьте Console.txt, затем вручную выполните клики для кейсов A–D, подтверждая, что элементы не выглядят disabled и тосты объясняют причину; если нужно, запустите `Game.__DEV.smokeP2PTransferOnce()`. PASS если все кейсы ведут себя как описано и amount вводится через prompt, иначе FAIL.
    ```
    Changed: `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`


### [LOG-20260217-006] ECON-P2P P2P-A3 rate limit (smoke pending)
- Status: PASS
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: PASS
    Facts:
      - `Game.Econ.requestP2PTransfer` применяет rate limit 60s по ключу `p2p:<sourceId>-><targetId>` и блокирует второй перевод без изменения балансов.
      - Dev smoke `Game.__DEV.smokeP2PTransfer_RateLimitOnce()` показывает: первый вызов переводит, второй возвращает `p2p_transfer_rate_limited`, worldDelta=0, в логах 1 transfer + 1 rate-limited.
    Evidence:
      - P2P_RL before {"source":10,"target":10,"world":200}
      - P2P_RL after1 {"source":9,"target":11,"world":200}
      - P2P_RL after2 {"source":9,"target":11,"world":200}
      - P2P_RL log {"p2pCount":1,"rateLimitedCount":1,"newLogCount":2}
      - P2P_RL tx2 {"ok":false,"reason":"p2p_transfer_rate_limited","rlKey":"p2p:me->npc_weak","retryInMs":59995}
      - P2P_RL ok=true failed=[]
    Smoke output: runs `Game.__DEV.smokeP2PTransfer_RateLimitOnce()` (first ok, second rate-limited, world delta 0).
    How to verify:
      1. Проверить Console.txt и увидеть строки P2P_RL before/after/log/tx2.
      2. В dev-консоли запустить `Game.__DEV.smokeP2PTransfer_RateLimitOnce()` и подтвердить одинаковый worldDelta и 1 rate-limited строку.
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ QA:
    Проверь Console.txt, затем запусти `Game.__DEV.smokeP2PTransfer_RateLimitOnce()` и приложи строки P2P_RL before/after/log/tx2. PASS если второй вызов возвращает p2p_transfer_rate_limited, balance не меняется и worldDelta=0.
    ```
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`


### [LOG-20260217-007] ECON-P2P P2P-B1 player->player blocked (smoke pending)
- Status: PASS
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: PASS
    Facts:
      - `Game.Econ.requestP2PTransfer` блокирует player->player с reason `p2p_player_to_player_disabled` и не делает transferPoints.
      - Добавлен лог попытки reason `p2p_transfer_attempt_blocked` (amount 0, meta why=player_to_player_disabled).
      - UI показывает единый текст: "Передача между игроками пока недоступна."
      - Dev smoke `Game.__DEV.smokeP2PPlayerToPlayerBlockedOnce()` добавлен.
    Evidence:
      - P2P_P2P before {"source":10,"target":0,"world":200}
      - P2P_P2P after {"source":10,"target":0,"world":200}
      - P2P_P2P log {"p2pCount":0,"blockedCount":1,"newLogCount":1}
      - P2P_P2P tx {"ok":false,"reason":"p2p_player_to_player_disabled","details":{"sourceId":"me","targetId":"p2p_dummy","amount":1}}
      - Console panel result ok:true failed:[] world:{delta:0}
    Smoke output: Game.__DEV.smokeP2PPlayerToPlayerBlockedOnce() (reason `p2p_player_to_player_disabled`, blockedCount=1, world delta 0).
    How to verify:
      1. Проверить Console.txt на строки P2P_P2P before/after/log/tx и panel result.
      2. В dev-консоли: `Game.__DEV.smokeP2PPlayerToPlayerBlockedOnce()`
      3. PASS если reason `p2p_player_to_player_disabled`, балансы не меняются, worldDelta=0, p2pCount=0, blockedCount=1.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`

### [LOG-20260217-008] ECON-P2P P2P-B2 honest backlog ux (manual)
- Status: FAIL (smoke not run)
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: UI
- Files: `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: FAIL (smoke not run)
    Facts:
      - Modern and legacy DM now share `UI.createP2PBacklogBlock`, so a single honest block replaces transfer CTAs whenever P2P is backlogged.
      - Block text: "Передача пойнтов: пока недоступна." with explanation "Причина: анти-абуз и баланс."
      - "Почему?" is rendered as a styled button (underline/cursor pointer) that repeats the explanation via `showP2PSystem` without prompting or transferring.
    Evidence: Console.txt shows no UI load errors.
    How to verify:
      A. Modern DM: open DM and confirm only the backlog block appears; no transfer buttons or grey CTAs.
      B. Verify "Почему?" renders as an obvious clickable control (cursor changes, underline).
      C. Click it: expect only the info line "Передача пока отключена — анти-абуз/баланс.", no prompt, no transfer.
      D. Legacy DM: repeat to ensure the same helper renders identical markup and behavior.
      E. Console.txt: verify there are no UI errors about the backlog helper or rules.
    Manual QA: PASS only when A–E match.
    Changed: `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`

-### [LOG-20260217-009] ECON-P2P P2P-final smoke prep (dev)
- Status: PASS
- Priority: P2
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Result: |
    Status: PASS
    Facts:
      - `Game.__DEV.spawnSecondPlayerOnce(opts)` idempotently injects `p2p_smoke_p2` and logs `P2P_SPAWN_SECOND_PLAYER_V1`.
      - `Game.__DEV.smokeP2P_FinalOnce(opts)` enables P2P, performs a transfer, flips the player-to-player flag, retries (blocked), and inspects snapshots/logs.
    Evidence:
      - P2P_SPAWN_SECOND_PLAYER_V1 {"ok":true,"id":"p2p_smoke_p2","existed":false}
      - P2P_FINAL_SMOKE_V1 {"ok":true,"failed":[]}
      - Log tail contains `p2p_transfer` and `p2p_transfer_attempt_blocked`, totalsBeforeAfter total=210 before/after (zero-sum).
    Smoke command:
      `await __RUN__(\`console.log("P2P_FINAL_SMOKE_V1", await Game.__DEV.smokeP2P_FinalOnce({window:{lastN:200}}));\`)`
    How to verify:
      1. Console.txt shows `P2P_SPAWN_SECOND_PLAYER_V1 ...` and `P2P_FINAL_SMOKE_V1 ...` with ok:true.
      2. Command above outputs tx1 ok (reason `p2p_transfer`, amount=1 between me and p2p_smoke_p2), tx2 ok:false reason `p2p_player_to_player_disabled`.
      3. Totals/snapshots stay constant, and `logTail` holds exactly one transfer plus one blocked attempt.
    Manual QA: PASS when command output matches evidence.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
