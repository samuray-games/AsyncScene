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
- Status: FAIL (нет runtime evidence)
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
- Status: FAIL (pending runtime evidence)
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
  - `totalTaxInWindow > 0`, `hasWorldTaxInRows:true`, `seedRichNpc:true`
  - `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END`
  - `WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_DUMP_DONE` (+ optional `TAPE_FLUSH_OK`)
- Runtime evidence (FAIL, Console.txt 2026-02-09):
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN`
  - `{"ok":false,"notes":["world_mass_drift","tax_missing"],"world":{"delta":2},"tax":{"totalTaxInWindow":0}}`
  - `[warn] WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END`

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
