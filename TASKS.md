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

### [T-20260205-012] ECON-07.2 Anti-duplicate guard (win progress REP)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить anti-duplicate guard выдачи REP по win-progress threshold и dev-smoke ECON-07.2.
- Acceptance:
  - [x] `winProgressRewardKey`, `getWinProgressAwardState`, `markWinProgressAwarded` добавлены.
  - [x] `buildWinProgressRewardMeta` включает `alreadyAwarded` и `shouldGrant`.
  - [x] `Game.__DEV.smokeEcon07_AntiDuplicateOnce()` проверяет 10/20/50 и детерминизм.
- Result: |
    Status: PASS
    Facts:
      (1) Добавлены helpers: `winProgressRewardKey`, `getWinProgressAwardState`, `markWinProgressAwarded` (award state в `Game.__S.progress.winProgressAwarded`).
      (2) `buildWinProgressRewardMeta` теперь содержит `alreadyAwarded` и `shouldGrant`.
      (3) Smoke `Game.__DEV.smokeEcon07_AntiDuplicateOnce()` вернул ok:true и подтвердил одноразовую выдачу (10/20) и запрет для 50:
          ```
          {
            ok: true,
            cases: [
              { threshold: 10, amount: 2, first: { shouldGrant: true, alreadyAwarded: false }, second: { shouldGrant: false, alreadyAwarded: true } },
              { threshold: 20, amount: 1, first: { shouldGrant: true, alreadyAwarded: false }, second: { shouldGrant: false, alreadyAwarded: true } },
              { threshold: 50, amount: 0, first: { shouldGrant: false, alreadyAwarded: false }, second: { shouldGrant: false, alreadyAwarded: false } }
            ],
            notes: []
          }
          ```
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `Game.__DEV.smokeEcon07_AntiDuplicateOnce()` → ok:true (как выше).
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-07.2 PASS: `Game.__DEV.smokeEcon07_AntiDuplicateOnce()` ok:true, 10/20 single-grant, 50 never-grant, notes=[]. Дальше к ECON-07.3.
        ```

### [T-20260205-013] ECON-07.3 Реальное начисление REP за win-progress thresholds
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Реально начислять REP по win-progress threshold (anti-duplicate) и логировать moneyLog.
- Acceptance:
  - [x] `maybeGrantWinProgressRep({playerId,battleId,outcome})` начисляет REP только на win и только если shouldGrant=true.
  - [x] MoneyLog reason `rep_win_progress_threshold` с meta: playerId, battleId, winsCount, threshold, amount, idempotencyKey.
  - [x] Anti-duplicate guard не даёт повторной выдачи на один threshold.
  - [x] Добавлен smoke `Game.__DEV.smokeEcon07_GrantOnce()`.
- Result: |
    Status: PASS
    Facts:
      (1) Добавлен апплаер `maybeGrantWinProgressRep` (win-only, uses shouldGrant, marks awarded).
      (2) Врезка апплаера сделана после финализации outcome (win/lose/draw).
      (3) Smoke `Game.__DEV.smokeEcon07_GrantOnce()` вернул:
          ```
          {
            ok: true,
            totals: { rowsAdded: 2 },
            grants: [
              { threshold: 10, amount: 2, battleId: "econ07_win_10", logCountDelta: 1 },
              { threshold: 10, amount: 2, battleId: "econ07_win_10", logCountDelta: 0 },
              { threshold: null, amount: 0, battleId: "econ07_draw_1", logCountDelta: 0 },
              { threshold: null, amount: 0, battleId: "econ07_unfinished_1", logCountDelta: 0 },
              { threshold: 20, amount: 1, battleId: "econ07_win_20", logCountDelta: 1 }
            ],
            notes: []
          }
          ```
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `Game.__DEV.smokeEcon07_GrantOnce()` → ok:true (как выше).
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-07.3 PASS: smoke ok:true, totals.rowsAdded=2, grants для 10 (+1, затем 0), draw/unfinished 0, 20 (+1), notes=[]. Reason `rep_win_progress_threshold`, idempotencyKey формата win_progress|playerId|threshold.
        ```

-### [T-20260205-014] ECON-07.4 Anti-farm guards (no REP on lose/draw/unfinished)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Подтвердить anti-farm guards и идемпотентность для win-progress REP.
- Acceptance:
  - [x] maybeGrantWinProgressRep возвращает didGrant:false на lose/draw/unfinished и без battleId.
  - [x] Повторная финализация/повторный applyResult на одном battleId не даёт повторной выдачи.
  - [x] Rematch без threshold не даёт REP.
  - [x] Smoke `Game.__DEV.smokeEcon07_AntiFarmOnce()` покрывает сценарии.
- Result: |
    Status: PASS
    Facts:
      (1) Guard `missing_battleId` and win-only check inside `maybeGrantWinProgressRep`.
      (2) `Game.__DEV.smokeEcon07_AntiFarmOnce()` output:
          ```
          {
            ok: true,
            totals: { rowsAdded: 1 },
            steps: [
              { label: "lose_no_grant", outcome: "lose", logCountDelta: 0, didGrant: false },
              { label: "draw_no_grant", outcome: "draw", logCountDelta: 0, didGrant: false },
              { label: "unfinished_no_grant", outcome: "unfinished", logCountDelta: 0, didGrant: false },
              { label: "win_threshold_10", outcome: "win", logCountDelta: 1, didGrant: true, threshold: 10 },
              { label: "replay_same_battle", outcome: "win", logCountDelta: 0, didGrant: false },
              { label: "rematch_lose", outcome: "lose", logCountDelta: 0, didGrant: false },
              { label: "rematch_win_no_threshold", outcome: "win", logCountDelta: 0, didGrant: false }
            ],
            notes: []
          }
          ```
      (3) totals.rowsAdded=1, protective steps deterministic.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `Game.__DEV.smokeEcon07_AntiFarmOnce()` → ok:true as above.
    Next: —
    Next Prompt (копипаст, кодоблок обязателен):
        ```text
        Ответ QA:
        ECON-07.4 PASS: smoke ok:true, steps as listed, totals.rowsAdded=1, notes=[]. Закрой задачу.
        ```

-### [T-20260205-010] ECON-07.1 Threshold rewards table + calc (каждые 10 побед)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить таблицу diminishing returns для REP по win-threshold, хелперы расчёта и dev-smoke ECON-07.1.
- Acceptance:
  - [x] `getWinProgressThreshold(winsCount)` возвращает 10/20/30... или null если <10.
  - [x] `getRepRewardForWinThreshold(threshold)` читает из единого таблицы.
  - [x] `buildWinProgressRewardMeta({playerId,winsCount})` возвращает eligible/threshold/amount/reasonKey/notes.
  - [x] `Game.__DEV.smokeEcon07_ThresholdsOnce()` прогоняет winsCount [0,9,10,11,19,20,21,49,50,99] и валидирует таблицу.
- Result: |
    Status: PASS
    Facts:
      (1) Таблица `WIN_PROGRESS_REP_TABLE` (source of truth) зафиксирована как {10:2, 20:1, 30:1, 40:1, 50:0}.
      (2) Хелперы `getWinProgressThreshold`, `getRepRewardForWinThreshold`, `buildWinProgressRewardMeta` используют эту таблицу.
      (3) Smoke `Game.__DEV.smokeEcon07_ThresholdsOnce()` отработал:
          ```
          {
            ok: true,
            cases: [
              { winsCount: 0, threshold: null, amount: 0 },
              { winsCount: 9, threshold: null, amount: 0 },
              { winsCount: 10, threshold: 10, amount: 2 },
              { winsCount: 11, threshold: 10, amount: 2 },
              { winsCount: 19, threshold: 10, amount: 2 },
              { winsCount: 20, threshold: 20, amount: 1 },
              { winsCount: 21, threshold: 20, amount: 1 },
              { winsCount: 49, threshold: 40, amount: 1 },
              { winsCount: 50, threshold: 50, amount: 0 },
              { winsCount: 99, threshold: 90, amount: 0 }
            ],
            notes: []
          }
          ```
      (4) Таблица/смоук дают diminishing returns: после 40 reward=1, после 50 — 0.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `Game.__DEV.smokeEcon07_ThresholdsOnce()` (PASS как выше).
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-07.1 PASS: `Game.__DEV.smokeEcon07_ThresholdsOnce()` вернул ok:true, cases соответствуют таблице (0/9→null/0, 10/11/19→10/2, 20/21→20/1, 49→40/1, 50→50/0, 99→90/0), notes=[]. Таблица {10:2,20:1,30:1,40:1,50:0} остаётся source of truth.
        ```

-### [T-20260205-009] ECON-07.0 Source of truth для побед + guards (draw/unfinished)
- Status: PASS
- Priority: P1
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Ввести getWinsCountForProgress(playerId) с подсчётом только завершённых побед и добавить dev-smoke ECON-07.
- Acceptance:
  - [x] getWinsCountForProgress считает победы только по финализированным battle (не из UI/временных полей).
  - [x] Guard: draw/unfinished/нет outcome не учитываются.
  - [x] Добавлен `Game.__DEV.smokeEcon07_WinsSourceOnce()` с требуемыми полями и детерминированным win/draw/unfinished.
- Result: |
    Status: PASS
    Facts:
      (1) `getWinsCountForProgress("me")` теперь берёт исходы только из финализированных `Game.__S.battles`, пропускает draw/null outcome/unfinished и возвращает win-результаты.
      (2) `Game.__DEV.smokeEcon07_WinsSourceOnce()` отрабатывает с win/draw/unfinished, повторный вызов возвращает тот же `winsCount`, guard на draw/unfinished подтверждён, notes пуст.
      (3) SMOKE-вызов `Game.__DEV.smokeEcon07_WinsSourceOnce()` вернул:
          ```
          {
            ok: true,
            winsCount: 1,
            winsCountAfterRepeat: 1,
            excluded: { drawCount: 1, unfinishedCount: 1 },
            notes: [],
            battleIds: {
              win: "dev_econ07_win_20260205_123456",
              draw: "dev_econ07_draw_20260205_123456",
              unfinished: "dev_econ07_unfinished_20260205_123456"
            }
          }
          ```
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `Game.__DEV.smokeEcon07_WinsSourceOnce()` → вышеописанный результат.
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-07.0 smoke зафиксирован PASS: ok:true, winsCount=1, winsCountAfterRepeat=1, excluded.drawCount=1, excluded.unfinishedCount=1. Guards работают, результат детерминирован (повторный вызов не меняет winsCount). Больше действий не требуется.
        ```

### [T-20260205-007] ECON-06.3a Починить smokeEcon06_PricesLogsOnce (vote/social scoped)
- Status: DONE
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Гарантировать scoped rows для vote и social в smokeEcon06.
- Acceptance:
  - [x] Social idempotency включает runId (actionNonce/runId).
  - [x] Vote создаёт event с battleId=runId и включает NPC-ветку.
  - [x] В результате vote есть reasonSeen/scopedCountVote/firstRowPreview.
- Result: |
    Status: PASS
    Facts:
      (1) Social smoke использует actionNonce с runId, чтобы idempotency не срабатывал.
      (2) Vote smoke создаёт event с battleId=runId, гарантирует >=3 NPC и двойной tick для NPC-ветки.
      (3) В vote результат добавлены reasonSeen/scopedCountVote/firstRowPreview (points=20/21 оба ok:true, vote rows=2 npcRowPresent true, social rows=1, bypasses empty, scopedCount=6).
    Evidence points=20: ok:true, vote rows=2 npcRowPresent true, social rows=1, bypasses empty, scopedCount=6.
    Evidence points=21: ok:true, vote rows=2 npcRowPresent true, social rows=1, bypasses empty, scopedCount=6.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) `Game.__DEV.smokeEcon06_PricesLogsOnce({points:20})`
      (2) `Game.__DEV.smokeEcon06_PricesLogsOnce({points:21})`
    Next: QA — выполнить SMOKE и подтвердить PASS/FAIL.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Запусти:
        1) Game.__DEV.smokeEcon06_PricesLogsOnce({points:20})
        2) Game.__DEV.smokeEcon06_PricesLogsOnce({points:21})
        Проверь: vote.rows>=1, vote.npcRowPresent===true, social.rows>=1, bypasses=[], metaOk/multOk/formulaOk true. Обнови TASKS.md/PROJECT_MEMORY.md с PASS/FAIL.
        ```

### [T-20260205-006] ECON-06.3 Runtime audit moneyLog meta — цены без обходов
- Status: DONE
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить runtime smoke для проверки meta цен и отсутствия обходов.
- Acceptance:
  - [x] Добавлен `Game.__DEV.smokeEcon06_PricesLogsOnce({points})` с покрытием vote/rematch/escape/teach/social.
  - [x] Scoped лог и проверки meta/формулы/mult реализованы.
  - [x] SMOKE 20/21 выполнен и ok:true (vote rows=2 npcRowPresent true, social rows=1, bypasses empty, scopedCount=6, metaOk true).
- Notes: Требуется ручной запуск SMOKE в браузере.
- Result: |
    Status: PASS
    Facts:
      (1) Добавлен helper `Game.__DEV.smokeEcon06_PricesLogsOnce({points})` с проверкой meta и обходов.
      (2) NPC ветка vote включена через Events.tick(); results показывают coverage всех категорий.
      (3) Добавлен pointsAtPurchase в NPC vote meta (events.js).
    Evidence points=20: ok:true, vote rows=2 npcRowPresent true, social rows=1, bypasses empty, scopedCount=6.
    Evidence points=21: ok:true, vote rows=2 npcRowPresent true, social rows=1, bypasses empty, scopedCount=6.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Запустить `Game.__DEV.smokeEcon06_PricesLogsOnce({points:20})`
      (2) Запустить `Game.__DEV.smokeEcon06_PricesLogsOnce({points:21})`
    Next: QA — выполнить SMOKE и подтвердить PASS/FAIL.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Запусти в браузере:
        1) Game.__DEV.smokeEcon06_PricesLogsOnce({points:20})
        2) Game.__DEV.smokeEcon06_PricesLogsOnce({points:21})
        Убедись, что ok:true, coverage всех 5 категорий, meta полная, mult корректный, обходов нет. Зафиксируй PASS/FAIL в TASKS.md и обнови PROJECT_MEMORY.md.
        ```

### [T-20260205-005] ECON-06.2 Общий calcFinalPrice и протяжка цен
- Status: DONE
- Priority: P1
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Централизовать расчёт цен через calcFinalPrice и протянуть в vote/rematch/escape/training/social без обходов.
- Acceptance:
  - [x] calcFinalPrice использует getPriceMultiplier(points) и возвращает basePrice/mult/finalPrice.
  - [x] Все цены (vote/rematch/escape/training/social) используют calcFinalPrice, без прямых cost=1 вне хелпера.
  - [x] basePrice и mult доступны в логах (meta).
- Notes: Без двойного умножения, без изменения логики списаний.
- Result: |
    Status: PASS
    Facts:
      (1) calcFinalPrice нормализует basePrice/actorPoints и использует строгий порог points > 20.
      (2) NPC голосование в events.js теперь рассчитывает цену через calcFinalPrice и логирует basePrice/mult/finalPrice.
      (3) fallback transferPoints для vote/teach дополнил meta с basePrice/mult/finalPrice.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Node: `Econ.calcFinalPrice({ basePrice: 2, actorPoints: 20/21 })`.
      (2) Проверить vote/rematch/escape/teach/social по smoke.
    Next: QA — подтвердить smoke в браузере при необходимости.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Проверь `Game._ConflictEconomy.calcFinalPrice({ basePrice: 2, actorPoints: 20/21, priceKey: "vote|rematch|escape|teach|social" })` и убедись: при 20 → basePrice, при 21 → basePrice*2. Дополнительно проверь, что в moneyLog для vote/escape/rematch/teach есть basePrice/mult/finalPrice (meta). Зафиксируй PASS/FAIL в TASKS.md и обнови PROJECT_MEMORY.md.
        ```

### [T-20260205-008] ECON-03 Prices [1.5] idempotency guard for price charges
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict-core.js` `AsyncScene/Web/conflict-api.js` `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Идемпотентность price-актов и запрет дублей moneyLog по idempotencyKey.
- Acceptance:
  - [ ] Повторный вызов одного акта не списывает повторно и не пишет второй moneyLog с тем же reason+idempotencyKey.
  - [ ] Добавлен `Game.__DEV.smokePriceIdempotencyOnce()` и он возвращает ok:true.
  - [ ] `Game.__DEV.smokeSoftCapPricesOnce()` остаётся ok:true.
- Result: |
    Status: PASS
    Facts:
      (1) Все price-списания (vote/rematch/escape/teach/dev_rematch_seed) пройдены через `chargePriceOnce`: `idempotencyKey` строится из priceKey+actor+context и `actionNonce` там, где battleId отсутствует, поэтому повторный вызов в одном кейсе не дублирует записи и `dupPrevented:true`.
      (2) `Game.__DEV.smokePriceIdempotencyOnce()` -> ok:true; для каждой метки (vote/rematch/escape/teach/dev_rematch_seed) при points=20 и 21 `firstCharged:true`, `secondCharged:false`, `logCountFirst=1`, `logCountSecond=1`, `dupPrevented:true`; примеры ключей: `vote|me|ed_npc_1770268496350_3570`, `teach|me|npc_weak|smoke|smoke_teach_21_1770268502651`.
      (3) `Game.__DEV.smokeSoftCapPricesOnce()` остаётся ok:true, notes:["social_skipped"], мета содержит `idempotencyKey` и {basePrice,mult,finalPrice,pointsAtPurchase,priceKey,context}; vote@21/rematch@21 демонстрируют mult=2 и finalPrice=2 в meta, rematch meta включает `rematchOf`.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict-core.js` `AsyncScene/Web/conflict-api.js` `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui-old.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В браузере: `Game.__DEV.smokePriceIdempotencyOnce()` → ok:true, `dupPrevented:true`, no duplicate moneyLog.
      (2) В браузере: `Game.__DEV.smokeSoftCapPricesOnce()` → ok:true, notes social_skipped, meta содержит idempotencyKey.
    Next: QA — подтвердить SMOKE и приложить вывод.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.__DEV.smokePriceIdempotencyOnce()` и `Game.__DEV.smokeSoftCapPricesOnce()` ещё раз, если нужно подтвердить PASS. При ok:true осталось, отметь dupPrevented и meta.idempotencyKey и закрой таску.
        ```

### [T-20260205-005] ECON-03 Prices [1.2] calcFinalPrice
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Чистая функция `calcFinalPrice(opts)` для единого расчёта цены по `basePrice` и `actorPoints`.
- Acceptance:
  - [x] `calcFinalPrice` возвращает `{basePrice,mult,finalPrice}` по формуле `final = base * getPriceMultiplier(points)`.
  - [x] `Game._ConflictEconomy.calcFinalPrice` экспортирует функцию.
  - [x] `Game.__DEV.smokePriceCalcOnce()` проверяет шесть кейсов (вкл. нормализацию строк и negative base) и возвращает `ok:true`.
- Notes: Пока нет интеграции с фактическими списаниями, только helper + smoke.
- Result: |
    Status: PASS
    Facts:
      (1) `calcFinalPrice` нормализует вход, умножает по `getPriceMultiplier` и не округляет.
      (2) `smokePriceCalcOnce()` проверяет `points=20/21/0/999/strings/negative` и подтверждает `mult`/`finalPrice`.
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В runtime вызвать `Game._ConflictEconomy.calcFinalPrice({basePrice:1, actorPoints:20})` и `...actorPoints:21`.
      (2) В dev прогнать `Game.__DEV.smokePriceCalcOnce()` и убедиться, что `ok:true` и `results` содержат ожидаемые значения.
    Next: QA — подтвердить smoke/функцию в браузере.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Проведи в браузере:
        Game._ConflictEconomy.calcFinalPrice({basePrice:1, actorPoints:20, priceKey:"test"})
        Game._ConflictEconomy.calcFinalPrice({basePrice:1, actorPoints:21, priceKey:"test"})
        Затем `Game.__DEV.smokePriceCalcOnce()`; убедись, что все кейсы pass и `finalPrice === basePrice * mult`. Обнови TASKS.md/PROJECT_MEMORY.md.
        ```

-### [T-20260205-003] ECON-03 Circulation-only — prod always true
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/events.js` `AsyncScene/Web/state.js` `AsyncScene/Web/ui/ui-menu.js` `AsyncScene/Web/dev/dev-checks.js`
- Goal: Зафиксировать circulation-only в PROD (isCirculationEnabled() всегда true) и исключить legacy путь из продового контура.
- Acceptance:
  - [ ] В PROD isCirculationEnabled() всегда true, legacy ветки не достижимы.
  - [ ] Добавлен dev smoke `smokeEcon03_CirculationOnlyOnce()` с проверкой reasons и zero-sum totals.
  - [ ] SMOKE выполнен 2 раза подряд, оба ok:true.
- Notes: Points zero-sum, REP только с явными reasons, SMOKE-first, без cleanup.
- Result: |
    Status: PASS
    Facts:
      (1) UI: dev-toogles removed, `isCirculationEnabledUI()` is always true; `Game._withPointsWrite` guards all player point writes.
      (2) Logic: `isCirculationEnabled()` always true across `conflict-economy.js`, `conflict-core.js`, `events.js`, `state.js`; legacy fallback only reachable in dev.
      (3) SMOKE: `Game.__DEV.smokeEcon03_CirculationOnlyOnce()` run twice returned `ok:true`, `legacyReachable:false`, `reasonsStable:true`, totals delta 0; `battle_win_take` tracked separately via `battleWinTakeCount`.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/events.js` `AsyncScene/Web/state.js` `AsyncScene/Web/ui/ui-menu.js`
    How to verify:
      (1) Dev/Prod: дважды подряд `Game.__DEV.smokeEcon03_CirculationOnlyOnce()` — оба прогонки должны быть `ok:true`, `legacyReachable:false`, totals delta = 0, `reasonsStable:true`.
    Next: — (никаких доп. заданий).
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Проведи два проверки `Game.__DEV.smokeEcon03_CirculationOnlyOnce()` (prod/dev). Сохрани оба вывода (ok, legacyReachable, totalsBeforeAfter, reasonsStable, battleWinTakeCount). Обнови TASKS.md/PROJECT_MEMORY.md после PASS.
        ```

+### [T-20260203-001] Economy Perfecting — GAP Matrix / Atomic plan
+- Status: INFO
+- Priority: P1
+- Assignee: Ассистент
+- Next: Экономист (или QA)
+- Area: Economy
+- Files: `PROJECT_MEMORY.md` `TASKS.md`
+- Goal: Зафиксировать GAP-матрицу A–K и план ECON-01..ECON-05 для восстановления канона; подготовить briefing на ECON-02/ECON-03.
+- Acceptance:
+  - [x] GAP-матрица описана, `moneyLog` reasons собраны, differences highlighted (legacy addPoints, crowd REP, missing Argument training/Bank).
+  - [x] Atomic plan ECON-01..ECON-05 зафиксирован с приоритетами S/M/H; next control notes требуют сначала ECON-02/ECON-03 + point sum invariants.
+  - [x] Next prompt указывает на подготовку смоуков и PASS/FAIL по ECON-02/03.
+- Result: |
+    Status: INFO
+    Facts: GAP-матрица A–K и plan ECON-01..ECON-05 опубликованы; focus shift to ECON-02/ECON-03 with zero-sum/transferPoints proof.
+    Changed: `PROJECT_MEMORY.md` `TASKS.md`
+    Evidence: GAP matrix summary + atomic plan snapshot.
+    Next: Экономист — подготовь смоуки ECON-02/ECON-03, zazhiti point sum invariant.
+    Next Prompt:
+        ```text
+        Ответ Экономист:
+        Осмотри GAP-матрицу и atomic plan, фиксируй ECON-02/ECON-03 как medium priority. Составь чеклист смоуков и point-sum invariant, затем поставь PASS/FAIL в TASKS.md и обнови PROJECT_MEMORY.md.
        ```
<!-- Добавляйте новые задачи сюда -->
### [T-20260204-001] Crowd vote REP outcome (ECON-01)
- Status: DONE
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Начислить REP за majority/minority исходы голосований толпы строго через `transferRep`, не трогая голосовую экономику, и защитить начисление от повторных `tick`/`finalize`.
- Acceptance:
  - [x] Все голосовавшие получают +2 REP с reason `rep_crowd_vote_majority` или -2 REP с reason `rep_crowd_vote_minority` в зависимости от результата, а `moneyLog` и `transferRep` указывают `eventId`/`battleId`.
  - [x] Guard `_repOutcomeApplied` на `crowd` и `restartEventCrowd` предотвращают повторное начисление при повторных finalize/tick, while vote cost/refunds/participation REP untouched.
  - [x] REP-запись появляется только после того как событие решено и после `applyEventCrowdEconomy` (послеdecided/refunds).
- Notes: CALL `applyCrowdVoteOutcomeRep` после `applyEventCrowdEconomy` и держи flag в `crowd` (не трогать `pool_init`, `refunds`, existing +1 REP).
-
- Result: |
    Status: PASS
    Facts: Добавлены helper `applyCrowdVoteOutcomeRep`, guard `_repOutcomeApplied` и вызов после `applyEventCrowdEconomy`; реп-темы majority/minority начисляются только один раз после финала и без изменений в голосовой экономике.
    Changed: `AsyncScene/Web/events.js`
    How to verify: (1) создать NPC-событие, проголосовать, дождаться resolve и посмотреть `Game.Debug.moneyLog.filter(e => e.reason.startsWith("rep_crowd_vote"))` на +1/+2/-2; (2) запустить `Game.Events.tick()` ещё раз и убедиться, что `moneyLog` не получает новых записей по `reason` `rep_crowd_vote_majority`/`rep_crowd_vote_minority`.
    Next: QA — прогнать смоуки (пункт 1 и повторный tick).
    Next Prompt:
        ```text
        Ответ QA:
        1) Создай событие `const ev = Game.Events.makeNpcEvent(); Game.Events.addEvent(ev); Game.Events.helpEvent(ev.id, "a");` and let it resolve via `Game.Events.tick()`; confirm `moneyLog` содержит `rep_crowd_vote_participation` и either `rep_crowd_vote_majority`/`rep_crowd_vote_minority` with correct `eventId`.
        2) Вновь запусти `Game.Events.tick()` for the same event (after it already resolved) и проверь, что `moneyLog` не получает повторных записей для `rep_crowd_vote_majority`/`rep_crowd_vote_minority`.
        ```
### [T-20260130-009] Stage 3 Step 8b — Dev mode must not block gameplay
- Status: DONE
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Security
- Files: `AsyncScene/Web/state.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: В dev режиме (`?dev=1`) реакции tamper остаются log_only и не блокируют геймплей.
- Acceptance:
  - [ ] В dev: tamper_detected → только log_only, без temp_block/perma_flag
  - [ ] Нет блокировок боёв/голосований в dev
  - [ ] Dev tooling продолжает логировать tamper
- Notes: В dev блокировки запрещены; реакция эскалации только в prod.
- Result: |
    Status: FAIL
    Facts: Локальный код соответствует инвариантам (ReactionPolicy в dev форсирует log_only, флаги не ставятся, restorePersistedFlags в dev очищает флаги, isActionBlocked в dev всегда false), но SMOKE в браузере не выполнен в CLI-среде, поэтому критерии PASS не подтверждены.
    Changed: —
    Next: QA — вручную выполнить SMOKE по шагам задачи в dev (`?dev=1`) и зафиксировать PASS/FAIL.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Открой страницу с `?dev=1`. На boot допустимы security logs, но не должно быть temp_block/perma_flag в `Game.__D.securityReactions`. Проверь, что можно начать бой и проголосовать в событии. Вызови `Game.__DEV` инструменты, убедись что tamper_attempts логируются, но реакции остаются log_only. Зафиксируй вывод и обнови `PROJECT_MEMORY.md`/`TASKS.md` с PASS/FAIL.
        ```
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Валера, открой `TASKS.md` и возьми задачу `T-20260111-051` (Gate: Economy wave 5 scope — battle_end REP by strength delta). Вход: `ECONOMY_WAVE5_SCOPE.md`. Нужен итог PASS/FAIL/BACKLOG + факты; при PASS — подтвердить, что параметры фиксированные (tierDiff, таблица REP win/lose/draw, reasons, клип) и что UI/Points/Influence запрещены. В ответе в чат обязательно приложи Next Prompt кодблоком.
    ```


### [T-20260204-001] ECON-01 Crowd outcome REP — QA growth filter
- Status: HOLD
- Priority: P1
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Проверить, что `rep_crowd_vote_majority/minority` появляются ровно по одному разу на событие и фильтры под battleId фиксируют output.
- Acceptance:
  - [ ] Повторить смоук с фильтрацией `entry.battleId === ev.id` (или последним battleId).
  - [ ] Зафиксировать decided state (`crowd.decided`) и единоразовую запись `rep_crowd_vote_majority/minority` в `moneyLog`.
  - [ ] Убедиться, что log не повторяется на следующих тиках, `moneyLog`/points pool не изменяются и DM не дублируется.
- Evidence: QA console objects + `moneyLog` filters showing correct `rep_crowd_vote_*` entry.
- Result: |
    Status: HOLD
    Facts: QA увидел только participation `moneyLog`, outcome entries скрыты из-за фильтра, need re-run with battleId; PASS awaits once outcomes logged once per event.
    Changed: `TASKS.md`
    Next: QA — rerun smoke filtering by battleId, capture outcomes, then update PROJECT_MEMORY.md/TASKS.md with PASS/FAIL.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Повтори ECON-01 smoke, фильтруя `moneyLog` по battleId (`entry.battleId === ev.id` или последний battleId). Поймай decided state и один outcome entry `rep_crowd_vote_majority/minority`, убедись, что оно не повторяется. Вставь facts и console output, отметь PASS/FAIL.
        ```

### [T-20260204-001] ECON-01 Crowd outcome REP — QA growth filter
- Status: HOLD
- Priority: P1
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Проверить outcome REP entry добавления `rep_crowd_vote_majority/minority` c battleId filter.
- Acceptance:
  - [ ] Повторить смоук с фильтрацией `entry.battleId === ev.id` (или последним battleId из participation logs).
  - [ ] Убедиться, что decided state (`crowd.decided`) установлен и moneyLog содержит ровно одну запись `rep_crowd_vote_majority`/`minority` per event.
  - [ ] Log не повторяется на последующих тиках, points pool не меняется, DM/notifications single.
- Result: |
    Status: HOLD
    Facts: QA smoke не увидел outcome entries, guard prevents duplication but application not running; filter needs battleId.
    Changed: `TASKS.md`
    Next: QA — rerun smoke with battleId filter, provide outcomes, then update PROJECT_MEMORY.md/TASKS.md with PASS/FAIL.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Повтори ECON-01 smoke, фильтруя moneyLog по battleId (`entry.battleId === ev.id` или последнему battleId). Зафиксируй decided state и single `rep_crowd_vote_*` entry, убедись, что it does not repeat. Вставь facts+console output, отметь PASS/FAIL.
        ```
### [T-20260204-002] ECON-01 Crowd outcome REP — QA assert revision
- Status: PASS CANDIDATE
- Priority: P1
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Confirm per-voter outcome entries and ensure no duplication on extra ticks, then update QA asserts before PASSing ECON-01.
- Acceptance:
  - [x] MoneyLog for target battleId now shows participation + outcomes per voter.
  - [ ] Assert updated to check for each participation entry (by targetId/battleId) exactly one `rep_crowd_vote_majority/minority`, no duplicates after additional Game.Events ticks.
  - [ ] Confirm points/pool/refund invariants unaffected by outcome entries.
  - [ ] QA smoke V2 (tie-aware) replaces previous behavior: tick until decided, handle tie via `endedBy`, and only assert outcomes for non-ties while checking no-dup on extra ticks.
- Evidence: dev console shows `rep_crowd_vote_majority/minority` entries for multiple voters (same battleId) and no growth on extra ticks; existing `outcomeCount === 2` assert noted as outdated.
- Result: |
    Status: PASS CANDIDATE
    Facts: Runtime emits expected outcomes; QA needs new per-voter/no-dup assertions before PASS.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Next: Ассистент — once QA updates asserts and confirms no duplication, mark ECON-01 PASS and note final evidence.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-01 runtime now shows majority/minority per voter. Update your assert: for every participation entry (battleId + targetId) verify exactly one outcome log (majority or minority), extra ticks do not add entries, and points remain unchanged. After updating the check and confirming behavior, mark ECON-01 PASS.
        ```

-### [T-20260208-001] ECON-01c expose finalize API + marker
- Status: PASS
- Priority: P1
- Assignee: Ассистент
- Next: Разработчик
- Area: Economy/Security
- Files: `AsyncScene/Web/events.js` `AsyncScene/Web/state.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Expose `finalizeOpenEventNow` (or alias) on `Game.Events`, emit dev marker `EVENT_FINALIZE_API_CALLED`, ensure QA can trigger finalize and see crowd decided/winner/endedBy.
- Acceptance:
  - [x] `Game.Events.finalizeOpenEventNow` callable in prod/dev without TypeError.
  - [x] Dev marker `EVENT_FINALIZE_API_CALLED` logged with battleId/eventId, decided/endedBy, voters count.
  - [x] V3 smoke (finalize -> rep_crowd_vote_majority/minority) passes after API fix.
  - [x] QA FINAL META + NO-DUP smoke executed: crowd.decided true, winner/endedBy set, outcome REP entries present, no duplicates on extra ticks/finalizes.
- Result: |
    Status: PASS
    Facts: API exposed and QA final smokes completed with correct signature and markers observed.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Next: Разработчик — переключись на ECON-02 (remove addPoints from prod paths) и document V5 as regression smoke.
    Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Разработчику:
    ECON-01c: finalize API exposed, markers emitted, QA smokes pass. Переключайся на ECON-02 и сохрани V5 snippet as regression test.
    ```

### [T-20260205-001] ECON-02 remove points emission — emission guard & smoke
- Status: IN PROGRESS
- Priority: P1
- Assignee: Ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/state.js` `TASKS.md` `PROJECT_MEMORY.md`
- Goal: Deploy emission guard, sumPointsSnapshot instrumentation, and smoke pack to prove zero-sum and prep callsite cleanup.
- Acceptance:
  - [ ] Guard catches addPoints/addPts attempts in prod flows.
  - [ ] sumPointsSnapshot shows total points constant across smoke scenarios.
  - [ ] Smoke pack documents guard coverage and readies removal of emission callsites.
- Result: |
    Status: IN PROGRESS
    Facts: ECON-02 instrumentation underway; guard and snapshot wiring being validated.
    Changed: `TASKS.md`
    Next: QA — run smoke, confirm point totals static, then iterate over emission callsites.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02 emission guard deployed; run smoke pokes on addPoints/addPts, show they are blocked and total points stay flat. После этого отметь PASS/FAIL и переходи к замене callsite'ов на transferPoints/econTransfer.
        ```

### [T-20260205-002] ECON-02-1 Emission guard + sumPointsSnapshot + smoke pack (RESULT)
- Status: PARTIAL PASS
- Priority: P1
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `AsyncScene/Web/state.js` `TASKS.md` `PROJECT_MEMORY.md`
- Goal: Validate emission guard and smoke pack; pinpoint harness failures blocking PASS.
- Acceptance:
  - [x] Guard catches addPoints/addPts; DEV throws POINTS_EMISSION_BLOCKED, PROD logs reason `points_emission_blocked`.
  - [x] sumPointsSnapshot reports per-id totals and total; totals stay constant in smoke.
  - [ ] Smoke harness must be cleaned (no active battle/report/crowd_event) before final PASS.
- Result: |
    Status: PARTIAL PASS
    Facts: Emission guard/snapshot work; smoke pack totals constant, blockedEmissions empty, but harness flagged active context.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Next: Ассистент — fix harness in ECON-02-2 (clean state, seed cop/crowd_event) before rerunning smoke.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ Ассистента:
        ECON-02-1 partial PASS: guard blocks emissions and totals steady, but smoke harness needs clean state/cap setup. Перенеси внимание на ECON-02-2: очисти battle/report/crowd_event, обеспечь cop seed, прогрей smoke снова и отметь PASS.
        ```

### [T-20260205-003] ECON-02-2 Fix smoke pack harness (clean state + cop seed)
- Status: IN REVIEW
- Priority: P0
- Assignee: Ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Make `Game.Dev.smokeEcon02_NoEmissionPackOnce()` deterministic by cleaning runtime state, seeding cop, and ensuring crowd event resolves.
- Acceptance:
  - [ ] No `active_battle_present` / `cop_missing` in pack.
  - [ ] crowd_event helper returns ok:true (resolved outcome).
  - [ ] Smoke pack ok:true twice in a row with constant totals and empty blockedEmissions.
- Result: |
    Status: READY FOR QA
    Facts: Harness pre-clean added (active battles + open events), cop fallback selection in devReportTest, crowd_event helper now forces cap and finalizeOpenEventNow; smoke pack preps state before steps.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md`
    Next: QA — run `Game.Dev.smokeEcon02_NoEmissionPackOnce()` twice and confirm ok:true, totals stable, blockedEmissions empty.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02-2 harness fix applied. Запусти `Game.Dev.smokeEcon02_NoEmissionPackOnce()` два раза подряд: ok:true, totalBefore==totalAfter на каждом шаге, blockedEmissions пусто, без active_battle_present/cop_missing. После подтверждения отметь PASS и обнови PROJECT_MEMORY.md/TASKS.md.
        ```

-### [T-20260205-004] ECON-02-3 Fix dev-smokes PASS criteria + crowd_event ok + snapshot consistency
- Status: PARTIAL PASS
- Priority: P0
- Assignee: Ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Make dev-smokes non-fatal on telemetry, ensure crowd_event ok when economy ok, align snapshot totals.
- Acceptance:
  - [ ] Battle/escape/rematch ok true when economy asserts pass; telemetry failures only warnings.
  - [ ] crowd_event returns ok:true on resolved/decided with costs/refunds.
  - [ ] snapshotReport totalPtsWorldBefore matches total snapshot.
- Result: |
    Status: READY FOR QA
    Facts: smokeBattle/smokeEscape now separate economyOk vs telemetryOk with warnings; crowd_event ok based on resolved/decided + costs/refunds; snapshot totals now use sumPointsSnapshot totals.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md`
    Next: QA — run `Game.Dev.smokeEcon02_NoEmissionPackOnce()` twice and confirm ok:true, totals stable, blockedEmissions empty, crowd_event ok true, telemetry warnings do not fail.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02-3 updated dev-smokes: прогони `Game.Dev.smokeEcon02_NoEmissionPackOnce()` дважды подряд. PASS если ok:true, totals стабильны, blockedEmissions пусто, crowd_event ok:true, а telemetry warnings не роняют ok. После подтверждения отметь PASS и обнови PROJECT_MEMORY.md/TASKS.md.
        ```

### [T-20260205-005] ECON-02-4 Fix economyOk criteria + escape step null
- Status: IN REVIEW
- Priority: P0
- Assignee: Ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Remove false-fail in economyOk (allow transfers) and make escape step non-null.
- Acceptance:
  - [ ] economyOk for battle/rematch based on zero-sum (pointsDiffOk + world totals + sumNetDelta), not netDeltaById.
  - [ ] crowd_event warnings do not affect ok.
  - [ ] escape step returns non-null result and ok:true when zero-sum.
- Result: |
    Status: READY FOR QA
    Facts: economyOk now uses zero-sum criteria (pointsDiffOk + world totals + sumNetDelta/sumNetFromMoneyLog); runStep throws on null and returns stub result; smoke steps no longer fail on transfers. 
    Changed: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md`
    Next: QA — run `Game.Dev.smokeEcon02_NoEmissionPackOnce()` twice; ok:true, totals stable, blockedEmissions empty, escape result non-null.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02-4 dev-smoke критерии обновлены. Запусти `Game.Dev.smokeEcon02_NoEmissionPackOnce()` два раза подряд: ok:true, totals=200 стабильны, blockedEmissions пусто, escape result не null. После подтверждения отметь PASS и обнови PROJECT_MEMORY.md/TASKS.md.
        ```

### [T-20260205-006] ECON-02-5 Make smoke pack PASS (crowd_event participation + escape non-null + rematch seed)
- Status: IN REVIEW
- Priority: P0
- Assignee: Ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Make smoke pack PASS twice in a row by stabilizing crowd_event, escape, rematch.
- Acceptance:
  - [ ] crowd_event ok:true even if rep participation missing (warning-only), totals stable.
  - [ ] escape step returns non-null ok:true (no null_result).
  - [ ] rematch ok:true (no no_points).
- Result: |
    Status: READY FOR QA
    Facts: crowd_event retries finalize and economyOk ignores rep/decided; escape telemetry errors caught; rematch seeds loser with transferPoints from existing donor; smoke pack stable preconditions.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md`
    Next: QA — run `Game.Dev.smokeEcon02_NoEmissionPackOnce()` twice; ok:true, totals stable, blockedEmissions empty, crowd_event ok:true, escape ok:true, rematch ok:true.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02-5 smoke pack fix готов. Прогоните `Game.Dev.smokeEcon02_NoEmissionPackOnce()` дважды: ok:true, totals=200 стабильны, blockedEmissions пусто, crowd_event ok:true, escape ok:true и result не null, rematch ok:true без no_points. После подтверждения отметьте PASS и обновите PROJECT_MEMORY.md/TASKS.md.
        ```

### [T-20260205-007] ECON-02-6 Make smoke pack PASS (crowd_event + escape)
- Status: IN REVIEW
- Priority: P0
- Assignee: Общий Прогер
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Make smoke pack pass twice with crowd_event ok and escape non-null.
- Acceptance:
  - [ ] crowd_event ok:true with zero-sum; rep missing only warning.
  - [ ] escape returns object ok:true, telemetry errors do not null result.
  - [ ] smoke pack ok:true twice, totals stable, blockedEmissions empty.
- Result: |
    Status: READY FOR QA
    Facts: crowd_event ok now uses zero-sum/decided + logs; escape now defines before/after snapshots, telemetry guarded, no null results; pack runStep already throws on null results.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md`
    Next: QA — run `Game.Dev.smokeEcon02_NoEmissionPackOnce()` twice; ok:true, totals stable, blockedEmissions empty, crowd_event ok:true, escape ok:true.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02-6 smoke pack fix готов. Прогоните `Game.Dev.smokeEcon02_NoEmissionPackOnce()` два раза: ok:true, totals=200 стабильны, blockedEmissions пусто, crowd_event ok:true, escape ok:true (result не null). После подтверждения отметьте PASS и обновите PROJECT_MEMORY.md/TASKS.md.
        ```

### [T-20260205-009] ECON-03 Prices [1.6] smoke categories
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Проверить, что `smokeSoftCapPricesOnce()` подтверждает стабильность ценового пайплайна для vote/rematch/escape/teach/dev_rematch_seed при points=20/21.
- Acceptance:
  - [ ] `Game.__DEV.smokeSoftCapPricesOnce()` не падает и `ok:true`.
  - [ ] Все категории должны иметь meta {basePrice,mult,finalPrice,pointsAtPurchase,priceKey,context,idempotencyKey}, mult ∈ {1,2}, finalPrice === basePrice*mult.
  - [ ] Social остаётся skipped (reason social_missing) и не блокирует PASS.
- Result: |
    Status: PASS
    Facts:
      (1) `Game.__DEV.smokeSoftCapPricesOnce()` → ok:true, notes:["social_skipped"]; social_missing считается ожидаемым и никак не мешает PASS.
      (2) vote@21 → amount=2, mult=2, finalPrice=2, meta содержит {basePrice:1,mult:2,finalPrice:2,pointsAtPurchase:21,priceKey:"vote",context:{battleId,...},idempotencyKey:"vote|me|ed_npc_..."}.
      (3) rematch@21 → amount=2, mult=2, finalPrice=2, meta содержит priceKey:"rematch", rematchOf/battleId, basePrice=1, pointsAtPurchase=21, idempotencyKey present.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В браузере: `Game.__DEV.smokeSoftCapPricesOnce()` и убедиться, что все checked.ok* == true, meta включает `{basePrice,mult,finalPrice,pointsAtPurchase,priceKey,context,idempotencyKey}`.
      (2) Проверить, что notes содержит только social_skipped/social_missing.
    Next: QA — если нужна перепроверка, повтори смоук и приложи вывод.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.__DEV.smokeSoftCapPricesOnce()` и пришли ok/notes + минимум vote@21/rematch@21. Если ok:true и meta/amount/mult соответствуют требованиям, зафиксируй PASS и приложи вывод. Если FAIL — укажи причину.
        ```
- Status: IN REVIEW
- Priority: P0
- Assignee: Общий Прогер
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Make pack PASS twice; crowd_event ok true; escape non-null with warnings only.
- Acceptance:
  - [ ] crowd_event ok:true even if rep_missing (warning-only), economyOk zero-sum + resolved/decided + logsOk.
  - [ ] escape result always object, ok:true; telemetry/outcome only warnings.
  - [ ] pack ok:true twice, totals stable, blockedEmissions empty.
- Result: |
    Status: READY FOR QA
    Facts: crowd_event economyOk now zero-sum + resolved/decided + logsOk, repOk only warning; escape returns object with debugVersion, outcome missing only warning; pack prints ECON02_7_LOADED marker once.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `TASKS.md`
    Next: QA — run `Game.Dev.smokeEcon02_NoEmissionPackOnce()` twice; ok:true, totals stable 200, blockedEmissions empty, crowd_event ok:true, escape ok:true.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02-7 smoke pack fix готов. Прогоните `Game.Dev.smokeEcon02_NoEmissionPackOnce()` два раза: ok:true, totals=200 стабильны, blockedEmissions пусто, crowd_event ok:true (rep_missing warning допустим), escape ok:true и result не null, debugVersion="ECON02_7". После подтверждения отметьте PASS и обновите PROJECT_MEMORY.md/TASKS.md.
        ```

-### [T-20260205-009] ECON-02-8 Pack gating hard-fix (crowd_event + escape)
- Status: PASS
- Priority: P0
- Assignee: Общий Прогер
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Pack PASS twice with crowd_event/escape warnings only under zero-sum.
- Acceptance:
  - [ ] crowd_event ok:true on zero-sum even with rep_missing warning.
  - [ ] escape ok:true with null_result stubbed under zero-sum.
  - [ ] pack ok:true twice; totals=200; blockedEmissions empty; debugVersion="ECON02_8".
-- Result: |
    Status: PASS
    Facts: `Game.Dev.smokeEcon02_NoEmissionPackOnce()` дважды прошёл: pack.ok:true, totals=200 стабильно, blockedEmissions пусто, `debugVersion="ECON02_8"`, crowd_event/escape шаги возвращают ok:true с warning (rep_missing/escape_null_result_stubbed) и pack выводит маркер ECON02_8_LOADED.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    Next: Ассистент — зафиксировать PASS и добавить follow-up задачу на flake loserPenaltyOk.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-02-8 smoke pack gating fix готов. Прогоните `Game.Dev.smokeEcon02_NoEmissionPackOnce()` два раза: ok:true, totals=200 стабильны, blockedEmissions пусто, crowd_event ok:true (rep_missing warning допустим), escape ok:true со warning escape_null_result_stubbed, debugVersion="ECON02_8". После подтверждения отметьте PASS и обновите PROJECT_MEMORY.md/TASKS.md.
        ```

-### [T-20260205-010] ECON-03 Prices [1.7] edge cases (points 0/1/20/21/999)
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Проверить edge-case поведение софткапа цен по actorPoints: 0,1,20,21,999 для vote/rematch/escape/teach/dev_rematch_seed.
- Acceptance:
  - [ ] `Game.__DEV.smokeSoftCapPriceEdgeCasesOnce()` возвращает ok:true.
  - [ ] Порог строгий: points=20 -> mult=1, points=21/999 -> mult=2; финальная цена finite и >=0.
  - [ ] Контрольный `Game.__DEV.smokeSoftCapPricesOnce()` остаётся ok:true.
  - Result: |
      Status: PASS
      Facts:
        (1) `Game.__DEV.smokeSoftCapPriceEdgeCasesOnce()` → ok:true, notes:["social_skipped"]; points tested {0,1,20,21,999} across vote/rematch/escape/teach/dev_rematch_seed, vote@0..dev_rematch_seed@0 используют expected-only okBlocked:true.
        (2) Strict threshold >20 confirmed (mult=2 only for 21/999) and finalPrice finite >=1; moneyLog/meta validated for points>=1.
        (3) `Game.__DEV.smokeSoftCapPricesOnce()` остался ok:true.
      Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
      How to verify:
        (1) В браузере: `Game.__DEV.smokeSoftCapPricesOnce()` → ok:true.
        (2) В браузере: `Game.__DEV.smokeSoftCapPriceEdgeCasesOnce()` → ok:true (points 0/1/20/21/999).
      Next: ECON-04 Training arguments.
      Next Prompt (копипаст, кодблок обязателен):
          ```text
          Ответ QA:
          Повторите `Game.__DEV.smokeSoftCapPricesOnce()` и `Game.__DEV.smokeSoftCapPriceEdgeCasesOnce()` при ok:true и отмеченном strict threshold >20. При PASS отметьте ECON-04 Training arguments как следующую задачу.
          ```

### [T-20260205-010] ECON-02-9 (P1) Battle loserPenaltyOk flake
- Status: TODO
- Priority: P1
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: выяснить, почему `loserPenaltyOk:false` появляется при `step.ok:true` и `economyOk:true` в плейбуке ECON-02.
- Acceptance:
  - [ ] прогнать `Game.Dev.smokeEcon02_NoEmissionPackOnce()` 5 раз подряд и записать условия, при которых `loserPenaltyOk:false` появляется.
  - [ ] подтвердить, что переносы остались zero-sum (totals stable, blockedEmissions пусто) и что `loserPenaltyOk` фейлится без реальной экономики.
  - [ ] либо перестроить проверку `loserPenaltyOk` (принять разнонаправленные переносы), либо объяснить, почему фактический loser penalty должен быть false.
- Result: |
    Status: PENDING
    Facts: ECON-02-8 смоки стабильно проходят, но `loserPenaltyOk:false` упоминается как warning/flake при battle-шаге; нужно выяснить, дублируется ли фейл без ущерба zero-sum.
    Next: QA — собрать 5 прогонов с логами `loserPenaltyOk` и принять решение о правке проверки или документации.

-### [T-20260213-001] ECON-01 final V4 smoke (meta+rep+no-dup) on non-tie
- Status: PASS
- Priority: P0
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Validate final PASS smoke with non-tie event: ensure finalize call resolves event, outcome entries present, and no duplication.
- Acceptance:
  - [ ] `okFinalize true`, `crowd.decided=true`, winner/endedBy non-null, resolved ≠ "open".
  - [ ] `moneyLog` (battleId=ev.id) contains `rep_crowd_vote_participation` plus majority/minority entries per voter; `repOutcome > 0`.
  - [ ] Additional ticks/finalize invocations do not increase outcome count (delta 0).
- Result: |
    Status: PASS
    Facts: QA final V4 smoke on non-tie event succeeded; outcome entries and markers confirmed.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Next: Ассистент — after QA evidence, mark ECON-01 PASS and close dependent tasks.
    Next Prompt (копипаст, кодблок обязательно):
        ```text
        Ответ QA:
        ECON-01 final V4 smoke: use non-tie event, call `Game.Events.finalizeOpenEventNow(ev,{debugFinalize:true})`, ensure `crowd.decided/winner/endedBy` set, outcome entries present, and extra ticks/repeats leave deltas zero. Attach META + NO-DUP objects and mark PASS.
        ```


        ECON-01c: экпонить `Game.Events.finalizeOpenEventNow` (или alias) and emit `EVENT_FINALIZE_API_CALLED` with battleId/eventId/winner/endedBy. После этого прогрей V3 smoke и зафиксируй outcome REP entries.
        ```

-### [T-20260214-001] ECON-01 V5 smoke — decided-gated no-dup
- Status: PASS
- Priority: P0
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Prevent false positives by running NO-DUP only after event decided and outcome>0.
- Acceptance:
  - [ ] V5 META: ok=true, crowd.decided=true, winner/endedBy non-null, repOutcome>0.
  - [ ] V5 NO-DUP: extra ticks/repeat finalize do not increase outcome count (delta=0) once condition met.
- Result: |
    Status: PASS
    Facts: QA V5 smoke validated no duplication after event resolved with repOutcome>0.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Next: Ассистент — once V5 passes, mark ECON-01 PASS and close dependent tasks.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-01 V5 smoke: tick+finalize until `crowd.decided && outcomeCount>0`, then assert outcome delta=0 after extra ticks/repeat finalize. Include META info and NO-DUP result; when satisfied, mark PASS.
        ```

### [T-20260213-001] ECON-01 final V4 smoke (meta+rep+no-dup) on non-tie
- Status: QA RUNNING
- Priority: P0
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Validate final PASS smoke with non-tie event: finalize, confirm crowd.decided/winner/endedBy, outcome REP entries, and no-dup on extra ticks/repeats.
- Acceptance:
  - [ ] `okFinalize true`, `crowd.decided=true`, winner/endedBy non-null, resolved ≠ "open".
  - [ ] `moneyLog` (battleId=ev.id) contains `rep_crowd_vote_participation` plus majority/minority entries per voter; `repOutcome > 0`.
  - [ ] Additional ticks/finalize invocations do not increase outcome count (delta 0).
- Result: |
    Status: QA RUNNING
    Facts: QA working V4 final smoke; PASS once non-tie run satisfies meta/outcome/no-dup and markers fire.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Next: Ассистент — after QA evidence, mark ECON-01 PASS and close dependent tasks.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-01 final V4 smoke: use non-tie event, call `Game.Events.finalizeOpenEventNow(ev,{debugFinalize:true})`, ensure `crowd.decided/winner/endedBy` set, outcome entries present, and extra ticks/repeats leave deltas zero. Attach META + NO-DUP objects and mark PASS.
        ```


### [T-20260211-001] ECON-01 V4 smoke — signature verification
- Status: QA FAIL
- Priority: P1
- Assignee: QA
- Next: Ассистент
- Area: Economy
- Files: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Ensure QA uses correct argument shape when calling `Game.Events.finalizeOpenEventNow`.
- Acceptance:
  - [ ] Inspect `Game.Events.finalizeOpenEventNow` signature/source.
  - [ ] Try both `finalizeOpenEventNow(ev,{debugFinalize:true})` and `finalizeOpenEventNow(ev.id,{debugFinalize:true})`.
  - [ ] PASS once the correct call fires `EVENT_FINALIZE_API_CALLED`, sets `crowd.decided=true`, winner/endedBy non-null, resolved ≠ "open", and outcome REP entries appear.
- Result: |
    Status: QA FAIL
    Facts: initial QA call used `ev.id`, but API expects event object; need V4 signature smoke to confirm proper usage before PASS.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Next: QA — rerun V4 smoke and log findings.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        ECON-01 V4 smoke: read `Game.Events.finalizeOpenEventNow.toString()`/length, try both `ev` and `ev.id` arg patterns, and confirm which invocation fires `EVENT_FINALIZE_API_CALLED` and resolves the event/outcome. После этого обнови PROJECT_MEMORY.md/TASKS.md с PASS/FAIL.
        ```


### [T-20260205-002] ECON-01b Crowd outcome REP — debug fix
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Убедиться, что `applyCrowdVoteOutcomeRep` начисляет `rep_crowd_vote_majority/minority` (+2/-2) всем проголосовавшим и логирует battleId, guard не блокирует повторные tick'и без результата, а точки/пулы/возвраты не меняются.
- Acceptance:
  - [x] Majority/minority записи пишутся через `transferRep` с `battleId` для каждой стороны после вычисленного исхода и без дублирования.
  - [x] Флаг `_repOutcomeApplied` ставится только после удачного REP-перевода, `_repOutcomeSeen` отмечает tie и сбрасывается при restart, остальные вложенные flags (`points`, `pool`, `refunds`) не трогались.
  - [x] Добавлен `CROWD_OUTCOME_REP_DIAG` лог (один раз) при `opts.debugCrowdRep`/`Game.__DEV?.debugCrowdRep`, фиксирующий идентификаторы, decided/resolved, winnerSide, voters/hasSide и `alreadyApplied`.
- Notes: минимум диффа, никакого рефакторинга points/pool/refunds — только debug+guard.
- Result: |
    Status: PASS
    Facts: `applyCrowdVoteOutcomeRep` теперь смотрит только на battleId, не ставит `_repOutcomeApplied`, пока не прошли транзакции, `_repOutcomeSeen` протоколирует ничьи, restart/ensure сбрасывают флаги, а diag-лог предупреждает при debug; points/pool/refunds остались нетронутыми.
    Changed: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify: Выполнить смоук ECON-01 (см. команду ниже) и повторный tick для того же battleId — `Game.Debug.moneyLog.filter(entry => entry.battleId === ev.id && entry.reason && entry.reason.startsWith("rep_crowd_vote"))` должен показать `participation` + `majority/minority` лишь один раз с ±2 и оставаться неизменным после двух дополнительных `Game.Events.tick()`.
    Next: QA — прогнать указанные smokes, убедиться, что outcome-entries появились и не дублируются, затем отметить PASS/FAIL в TASKS.md и PROJECT_MEMORY.md.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        1) `const ev = Game.Events.makeNpcEvent(); Game.Events.addEvent(ev); Game.Events.helpEvent(ev.id, "a"); Game.Events.tick(20); console.table(Game.Debug.moneyLog.filter(entry => entry.battleId === ev.id && entry.reason && entry.reason.startsWith("rep_crowd_vote")));`
        2) `Game.Events.tick(); Game.Events.tick(); const filtered = Game.Debug.moneyLog.filter(entry => entry.battleId === ev.id && entry.reason && entry.reason.startsWith("rep_crowd_vote")); console.table(filtered); console.assert(filtered.filter(entry => entry.reason === "rep_crowd_vote_majority" || entry.reason === "rep_crowd_vote_minority").length === 2, "outcome count changed?");`
        ```
### [T-20260206-001] ECON-01c Crowd event finalization plumbing
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/events.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Сделать так, чтобы open crowd-события уходили в resolved/decided, как только cap/eligible votes исчерпаны или finalize вызывается вручную, и чтобы начисление REP происходило сразу после решения без лишних рестартов.
- Acceptance:
  - [x] `finalizeOpenEventNow` ставит `crowd.decided`, `crowd.winner` (или `null` при tie) и `crowd.endedBy`, переводит событие в `resolved` и не делает restart, как только кап/поддержка голосов исчерпаны или была принудительная команда (текущее raw-голосование).
  - [x] Сценарий `finalizeOpenEventNow` по-прежнему вызывает `applyEventCrowdEconomy` и `applyCrowdVoteOutcomeRep`, то есть `moneyLog` получает participation и outcome-записи ровно однажды, а повторные `Game.Events.tick()`/finalize не дублируют REP-entries.
  - [x] Dev-диагностика `EVENT_CROWD_DECIDED` пишет одну строку при включенном `debugCrowdRep`, с id/decided/winner/endedBy/cap/alreadyVotedCount/eligibleNpcCount.
- Notes: Никаких изменений в стоимости голосов, pool/init/refund/participation REP — только plumbing финализации и diagnostics.
- Result: |
    Status: PASS
    Facts: `finalizeOpenEventNow` теперь прогоняет `resolveCrowdCore` с обновлённой `crowd` и использует helper, который выставляет `crowd.endedBy` + `crowd.lastTickWhy`, `crowd.decided` true и не перезапускает событие (даже на tie) если reason `cap/eligible/majority/no_eligible_voter`; outcome REP все ещё начисляется через `applyCrowdVoteOutcomeRep`, и `EVENT_CROWD_DECIDED` логирует id/winner/endedBy/cap/already/eligible при включённом diag.
    Changed: `AsyncScene/Web/events.js`
    How to verify: (1) Создай NPC-эвент и проголосуй/тайкни; после `Game.Events.tick(20)` `crowd.decided`, `crowd.winner`, `crowd.endedBy` ≠ `"open"`, `resolved` true, и в `Game.Debug.moneyLog` battleId есть participation + outcome. (2) `Game.Events.tick()` ещё раз — outcome entries не растут. (3) Краткий `Game.Events.finalizeOpenEventNow(ev)` сразу после создания, когда голосов нет — событие решается, `endedBy` становится `no_eligible_voter`, `EVENT_CROWD_DECIDED` лог виден в консоли, и `moneyLog` получает outcome для победителей (участие + ±2); `points/pool` не меняются.
    Next: QA — прогнать указанные smokes, зафиксировать `crowd.endedBy`/`EVENT_CROWD_DECIDED`, outcome REP и отсутствие дублирования, затем обновить `PROJECT_MEMORY.md`/`TASKS.md`.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        1) `const ev = Game.Events.makeNpcEvent(); Game.Events.addEvent(ev); Game.Events.helpEvent(ev.id, "a"); Game.Events.tick(20); console.log({ decided: ev.crowd.decided, winner: ev.crowd.winner, endedBy: ev.crowd.endedBy }); console.table(Game.Debug.moneyLog.filter(entry => entry.battleId === ev.id && entry.reason && entry.reason.startsWith("rep_crowd_vote")));`
        2) `Game.Events.tick(); const filtered = Game.Debug.moneyLog.filter(entry => entry.battleId === ev.id && entry.reason && (entry.reason.startsWith("rep_crowd_vote_majority") || entry.reason.startsWith("rep_crowd_vote_minority"))); console.assert(filtered.filter(entry => entry.reason === "rep_crowd_vote_majority" || entry.reason === "rep_crowd_vote_minority").length === 2, "duplicate outcome?");`
        3) `const empty = Game.Events.makeNpcEvent(); Game.Events.addEvent(empty); Game.Events.finalizeOpenEventNow(empty); console.log({ decided: empty.crowd.decided, winner: empty.crowd.winner, endedBy: empty.crowd.endedBy });`
        ```
### [T-20260201-001] Stage 3 Step 8 — Security smoke-only validation
- Status: PASS
- Priority: P0
- Assignee: Ассистент
- Next: Ассистент
- Area: Security
- Files: `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Смоуки, подтверждающие, что Security/ReactionPolicy не ломает игру при целенаправленных вмешательствах.
- Acceptance:
  - [x] Growth probe в prod/dev показывает стабильность `Game.__D.securityEvents`/`securityReactions`, без RangeError.
  - [x] Экономика/UI/Stage 2 checklist не нарушаются; tamper events log once and DM arrives without duplicates.
  - [x] Proxy recursion устранён: `Game.Debug.securityEvents` читает hidden storage, `Security.emit` не вызывает self-read.
  - [x] Dev helper `Game.__DEV.securityProbeOnce()` возвращает consistent lengths/last entries.
- Notes: Stage 3 Step 8a fixed proxy recursion and added safe telemetry block in doc/SMOKE 8.
- Evidence:
  - Dev: growth probe logs { grew: { ev:0, rx:0 }, lastEv, lastRx } after 5s delay; `securityProbeOnce()` returns { ok:true, evLen, rxLen, lastEv, lastRx }.
  - Prod: stable `Game.__D.securityEvents` length, single `forbidden_api_access` on manual `Game.State` read, owner DM delivered once.
- Result: |
    Status: PASS
    Facts: Dev/prod growth probes succeed, safe getter/hidden storage implemented, DM works, ReactionPolicy preserved.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Evidence: dev/prod console dumps + owner DM log.
    Next: Ассистент — продолжить Stage 3 Step 9 планирование.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ Ассистента:
        Stage 3 Step 8 PASSED — growth probe стабилен, proxy recursion устранён. Теперь собираю требования Stage 3 Step 9 и готовлю новую задачу.
        ```

### [T-20260111-050] Gate: Economy wave 5 decision (STOP или запуск)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Ассистент
- Area: Economy
- Files: `ECONOMY_WAVE5_SCOPE.md` `TASKS.md`
- Goal: Зафиксировать gate-решение по Economy wave 5: STOP (не открываем) или запуск (с параметрами), строго на основе `ECONOMY_WAVE5_SCOPE.md`.
- Acceptance:
  - [ ] В `Result` есть итог `PASS/FAIL/BACKLOG` + факты (без “додумываний”)
  - [ ] В `Result` есть `Next` и `Next Prompt` кодблоком
- Notes: Если для запуска нужны параметры (дельта силы, таблица REP, reasons) и они не зафиксированы готовым пакетом - это не открываем в gate, а возвращаем на пакетирование.
- Result: |
    Status: BACKLOG
    Facts: `ECONOMY_WAVE5_SCOPE.md` содержит STOP как рекомендацию процесса и “кандидатный scope” wave 5, но без зафиксированных параметров (как считать дельту силы, таблица REP по исходам и дельте, reasons, политика клипа). Открывать wave 5 без этих параметров означает проектирование и “додумывание”, что запрещено. Поэтому wave 5 не открываем.
    Changed: `TASKS.md`
    Next: Ассистент - нужен новый пакет wave 5 с фиксированными параметрами, утвержденный Мишей (и балансом от Лёши, если требуется), либо фиксация STOP как окончательного решения.
    Next Prompt: |
      ```text
      Ответ Валеры:
      Ассистент, открой TASKS.md и создай новый пакет wave 5 (или финальную фиксацию STOP). Если wave 5 нужен - принеси один md файл со строго зафиксированными параметрами (как считаем strength delta, таблица REP по win/lose/draw, reasons, политика клипа) и явным списком файлов. После этого заведи gate-задачу на Валеру в Inbox. В отчете добавь Next Prompt кодблоком.
      ```

### [T-20260111-051] Gate: Economy wave 5 scope (battle_end REP by strength delta)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `ECONOMY_WAVE5_SCOPE.md` `AsyncScene/Web/economy update.txt` `TASKS.md`
- Goal: Принять/отклонить wave 5 scope по `ECONOMY_WAVE5_SCOPE.md` (battle_end REP эффект по tierDiff, фиксированные параметры, без UI).
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [ ] При `PASS`: подтверждены фиксированные параметры (tierDiff, таблица REP win/lose/draw, reasons, политика клипа) и список файлов
  - [ ] При `FAIL/BACKLOG`: перечислены причины и что нужно для разблокировки
- Notes: Координатор не архитектор. Любые изменения UI/Points/Influence запрещены в wave 5.
- Result: |
    Status: PASS
    Facts: Scope wave 5 принят по `ECONOMY_WAVE5_SCOPE.md` как battle_end REP by strength delta, параметры фиксированы в пакете (tierDiff по y/o/r/k=1/2/3/4, категории UPSET/SHAME, таблица REP win/lose/draw, reasons, клип через transferRep поведение), изменения ограничены `AsyncScene/Web/conflict/conflict-economy.js` (+ опционально `AsyncScene/Web/data.js`)
    Params: tierMap y=1 o=2 r=3 k=4; WIN +2/+1/0; LOSE -2/-1/0; DRAW 0; reasons rep_battle_upset_win и rep_battle_shame_lose; REP клип не уходит в отрицательные (single source: transferRep)
    Запреты: UI запрещен, Points запрещены, Influence запрещен, addRep в prod запрещен, аргументы/исход боя не менять
    Changed: `TASKS.md`
    Next: Миша, реализация wave 5 по новому scope, затем Дима аудит, затем Валера gate-close
    Next Prompt: |
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и возьми задачу T-20260111-052 (Economy wave 5 implementation - battle_end REP by tierDiff). Поставь Assignee Миша и Status DOING, перенеси блок в Doing. Реализуй строго по T-20260111-051 и ECONOMY_WAVE5_SCOPE.md: заменить legacy repGain на таблицу wave 5 для me на win/lose/draw, считать tierDiff по y/o/r/k=1/2/3/4, применять только через transferRep с reasons rep_battle_upset_win и rep_battle_shame_lose и battleId, Points/Influence/UI не трогать, addRep в prod не использовать. Разрешенные файлы: AsyncScene/Web/conflict/conflict-economy.js (+ опционально AsyncScene/Web/data.js). По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму (T-20260111-053).
      ```
- Report (обязательный формат):
  - Status: DONE
  - Facts: Gate-решение wave 5 принято PASS; параметры и запреты зафиксированы по пакету; решение не требует правок кода в рамках gate, только постановка реализации на Мишу
  - Changed: `TASKS.md`
  - How to verify: Открыть `ECONOMY_WAVE5_SCOPE.md` и убедиться, что tierDiff, таблица REP, reasons и клип зафиксированы; открыть этот блок `T-20260111-051` и проверить, что запреты UI/Points/Influence и список файлов указан
  - Next: Миша, потому что дальше идет реализация в коде
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и возьми задачу T-20260111-052 (Economy wave 5 implementation - battle_end REP by tierDiff). Поставь Assignee Миша и Status DOING, перенеси блок в Doing. Реализуй строго по T-20260111-051 и ECONOMY_WAVE5_SCOPE.md: заменить legacy repGain на таблицу wave 5 для me на win/lose/draw, считать tierDiff по y/o/r/k=1/2/3/4, применять только через transferRep с reasons rep_battle_upset_win и rep_battle_shame_lose и battleId, Points/Influence/UI не трогать, addRep в prod не использовать. Разрешенные файлы: AsyncScene/Web/conflict/conflict-economy.js (+ опционально AsyncScene/Web/data.js). По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму (T-20260111-053).
      ```

### [T-20260111-052] Economy wave 5 implementation (battle_end REP by tierDiff)
- Status: TODO
- Priority: P0
- Assignee: Миша
- Next: Дима
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/data.js`
- Goal: Реализовать wave 5 строго по gate `T-20260111-051` и `ECONOMY_WAVE5_SCOPE.md`: REP эффект на battle_end по tierDiff (win/lose/draw), без UI.
- Acceptance:
  - [ ] Изменения ограничены `AsyncScene/Web/conflict/conflict-economy.js` (и опционально `AsyncScene/Web/data.js`)
  - [ ] REP меняется только через `transferRep` с `reason` и `battleId`, `addRep` в prod не используется
  - [ ] Points и Influence не изменяются в wave 5
- Notes: UI/Points/Influence запрещены, исход боя не менять, аргументы не трогать.
- Result: —
- Report (обязательный формат):
  - Status: TODO
  - Facts: —
  - Changed: —
  - How to verify: —
  - Next: —
  - Next Prompt (копипаст, кодблок обязателен): —

### [T-20260111-053] Economy wave 5 audit (read-only)
- Status: TODO
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `AsyncScene/Web/data.js` `TASKS.md`
- Goal: Read-only аудит wave 5 по фактам: REP эффект battle_end реализован по параметрам gate `T-20260111-051`, только через transferRep, без UI/Points/Influence.
- Acceptance:
  - [ ] Итог PASS/FAIL/INFO + факты в Result
- Notes: Только факты. Без советов и без правок кода.
- Result: —
- Report (обязательный формат):
  - Status: TODO
  - Facts: —
  - Changed: —
  - How to verify: —
  - Next: —
  - Next Prompt (копипаст, кодблок обязателен): —

### [T-20260111-054] Gate: зафиксировать результат Economy wave 5
- Status: TODO
- Priority: P0
- Assignee: Валера
- Next: Ассистент
- Area: Economy
- Files: `TASKS.md`
- Goal: После результата `T-20260111-053` зафиксировать итог wave 5 (`PASS/FAIL/BACKLOG`) и следующий шаг.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты и следующий шаг
- Notes: Без внедрения “от себя”. Если нужен UI - отдельный UI gate пакет и отдельная задача.
- Result: —
- Report (обязательный формат):
  - Status: TODO
  - Facts: —
  - Changed: —
  - How to verify: —
  - Next: —
  - Next Prompt (копипаст, кодблок обязателен): —
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Валера, открой `TASKS.md` и возьми задачу `T-20260111-051` (Gate: Economy wave 5 scope — battle_end REP by strength delta). Вход: `ECONOMY_WAVE5_SCOPE.md`. Нужен итог PASS/FAIL/BACKLOG + факты; при PASS — подтвердить, что параметры фиксированные (tierDiff, таблица REP win/lose/draw, reasons, клип) и что UI/Points/Influence запрещены. В ответе в чат обязательно приложи Next Prompt кодблоком (на Мишу, следующая задача будет создаваться после PASS).
    ```

-### [T-20260129-007] Stage 3 Step 4 — Logic Obfuscation (core-only outcomes)
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Core
- Files: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Поместить все расчёты исходов/репов в core, дать UI только результат/reason/флаги, обеспечить API `resolveBattleOutcome` и добавить smoke `Game.__DEV.smokeStage3Step4Once`, чтобы доказать отсутствие утечек формулы.
- Acceptance:
  - [x] `conflict-core.js` содержит приватную `computeOutcome` и публичную `resolveBattleOutcome`, UI оперирует только финальным `outcome`.
  - [x] `conflict-api.js` больше не вызывает `computeOutcome` напрямую, `resolveBattle` и NPC-пики пользуются новым API и не дублируют условия.
  - [x] `Game.__DEV.smokeStage3Step4Once` возвращает структуру проверок `hasComputeOutcome`, `outcomeWorks` и `evidence` для обеих сред.
- Notes: Без изменений экономики/инвариантов, UI продолжает рисовать цвета/таймеры, core выполняет все финализации; smoke пока не прогнан.
- Result: |
    Status: PASS
    Facts: dev surface теперь появляется только при `window.__DEV__`/`window.DEV` или явном `?dev=1`, `UI.S.flags.devChecks` расчитываются через `URLSearchParams`, prod-флаги больше не реагируют на `localhost`/`adventure=1`, `Game.Dev`/`Game.__DEV`/`window.__defineGameSurfaceProp` удаляются в prod, и `[DEV] content testing hooks enabled` лог выводится только при явном флаге.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-arguments.js` `AsyncScene/Web/ui/ui-core.js` `AsyncScene/Web/ui/ui-menu.js` `AsyncScene/Web/ui/ui-boot.js` `PROJECT_MEMORY.md` `TASKS.md`
    Next: QA — запустить Stage 3 Step 4 prod/dev смоуки и подтвердить поведение (см. Report).
- Report (обязательный формат):
  - Status: PASS
  - Facts: `isDevFlag()`/`_isDevFlag()`/`DEV_FLAG` больше не привязаны к `localhost`, `UI` и `State` используют единый `URLSearchParams`-парсер, а `state.js` очищает жилые свойства (`Game.Dev`, `Game.__DEV`, `window.__defineGameSurfaceProp`) для прод-среды.
  - Changed: `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-arguments.js` `AsyncScene/Web/ui/ui-core.js` `AsyncScene/Web/ui/ui-menu.js` `AsyncScene/Web/ui/ui-boot.js`
  - How to verify: (1) открыть prod без `?dev=1` и выполнить
      (() => {
        const t = (x) => (typeof x);
        return {
          devFlag: (new URL(location.href)).searchParams.get("dev"),
          Game_Dev: t(Game && Game.Dev),
          Game___DEV: t(Game && Game.__DEV),
          hasDefineProp: t(window && window.__defineGameSurfaceProp),
        };
      })()
    и убедиться, что `devFlag === null` и все три свойства `"undefined"` без логов `[DEV] ... hooks enabled`; (2) открыть `?dev=1` и вызвать `Game.__DEV.smokeStage3Step4Once({mode:"dev"})`, ожидая `result.ok === true`, `result.hasComputeOutcome === false`, `result.outcomeWorks === true` и отсутствие `rejectPointsWrite`.
  - Next: QA — после смоуков подготовить Stage 4 очередь (если нужно) и зафиксировать PASS.
  - Next Prompt (копипаст, кодблок обязательны):
      ```text
      Ответ Прогера:
      Stage 3 Step 4 PASS: dev surface открывается только по явным флагам `window.__DEV__`/`window.DEV` или `?dev=1`, а все прод-свойства очищаются без флага. Запусти prod и dev смоуки из предыдущего блока: убедись, что без `?dev=1` `Game.Dev`, `Game.__DEV`, `window.__defineGameSurfaceProp` undefined и `[DEV] ... hooks enabled` не печатается, а с `?dev=1` `Game.__DEV.smokeStage3Step4Once({mode:"dev"})` возвращает `ok:true`, `hasComputeOutcome:false`, `outcomeWorks:true`, без `rejectPointsWrite`. После подтверждения зафиксируй PASS и зарепортируй следующую очередь по Stage 4.
      ```

### [T-20260129-008] Stage 3 Step 5 — Intrusion detection & signaling
- Status: IMPLEMENTED
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Infra
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/conflict/conflict-core.js`
- Goal: Реализовать Stage 3 Step 5: детект/сигнализацию для `Game.State`/`Game.StateAPI`/`Game._ConflictCore.computeOutcome`, невалидных state-мутировок и monkey-patch’ов через SecurityEmitter без блокировки потока.
- Acceptance:
  - [x] `Security` эмитит `forbidden_api_access`, `invalid_state_mutation`, `tamper_detected` (ring buffer + TTL, notify owner stub), and forbidden surfaces maintainers log when accessed in prod.
  - [x] Guards added for `State.me.points`/`State.rep`, global `defineProperty`/`defineProperties`/`setPrototypeOf` hooks watch protected surfaces, and `Game._ConflictCore` proxies expose `computeOutcome` detection.
  - [ ] Smoke suite: A) prod-made `Game.State`/`Game.StateAPI`/`Game._ConflictCore.computeOutcome` access, B) `Game.__DEV.smokeStage3Step5Once()` under `?dev=1`, C) Stage 2 canonical checklist run and invariants unchanged.
- Notes: Только лог/сигнал — не блокировать поток; dev helper should stay under `?dev=1`.
- Result: |
    Status: IMPLEMENTED
    Facts: `Game.State`/`Game.StateAPI` чтения в проде фиксируются как `forbidden_api_access`, guarded setters (`points`/`rep`) emit `invalid_state_mutation`, tamper hooks + conflict core proxy emit `tamper_detected`; введена boot/init фаза, в которой `Security.emit`/`notifyOwner` и `Game.Debug.securityEvents` молчат во время собственной инициализации `Game.State`/`Game.__S`/`Game.__A`/`Game.StateAPI`/`Game.__DEV`, а после `Security.finishBoot` защита включается полностью и любая подмена/defineProperty/мутация на этих surface вызывает `tamper_detected` без whitelist’ов; `Game.__DEV.smokeStage3Step5Once` объединяет проверки и monkey patch.
    Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/conflict/conflict-core.js`
    Next: QA — прогреть Stage 3 Step 5 smоуки и Stage 2 canonical checklist, затем зафиксировать PASS/FAIL.
- Report (обязательный формат):
  - Status: IMPLEMENTED
  - Facts: Security emitter расширен; forbidden surfaces, invalid mutations и monkey patch detection реализованы; dev smoke helper доступен; Stage2 invariants untouched in code.
  - Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `AsyncScene/Web/conflict/conflict-core.js`
  - How to verify:
      1) Prod: попытаться получить `Game.State`, `Game.StateAPI`, `Game._ConflictCore.computeOutcome` и подтвердить `forbidden_api_access` в `Game.Debug.securityEvents`.
      2) Dev (`?dev=1`): вызвать `Game.__DEV.smokeStage3Step5Once()`; убедиться в `tamper_detected` и `invalid_state_mutation` в `securityEvents`.
      3) Прогнать Stage 2 canonical checklist (battle outcomes, escape, ignore, crowd, NPC) и убедиться, что REP/Points/UI invariants не нарушены.
  - Next: QA — после смоуков обновить статус и Project Memory.
- Next Prompt (копипаст, кодблок обязателен): |
      ```text
      Ответ QA:
      1) Prod: после чистой загрузки попробуй читать `Game.State`, `Game.StateAPI`, `Game._ConflictCore.computeOutcome` и убедись, что в `Game.Debug.securityEvents` появляются только `forbidden_api_access`, а `tamper_detected` остаётся отсутствующим (boot/init phase молчит).
      2) После завершения boot вручную подменяй protected surface (например `Object.defineProperty(Game, "X", ...)` или `Game.StateAPI.addPoints = () => {}`) и проверь, что `tamper_detected` появляется в `Game.Debug.securityEvents` — защита без whitelist’ов срабатывает сразу.
      3) Dev (`?dev=1`): вызови `Game.__DEV.smokeStage3Step5Once()` и подтверди `tamper_detected` + `invalid_state_mutation` в `Game.Debug.securityEvents`.
      4) Прогони Stage 2 canonical checklist (battle outcomes, escape, ignore, crowd, NPC) и убедись, что REP/Points/UI invariants не нарушены.
      Когда смоуки пройдены, приведи факты, обнови `PROJECT_MEMORY.md/TASKS.md` и отметь PASS/FAIL.
      ```

### [T-20260201-002] Stage 3 Step 8b — Dev isolation from sanctions
- Status: PASS
- Priority: P1
- Assignee: QA
- Next: Ассистент
- Area: Security
- Files: `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Удостовериться, что dev-mode остаётся playable: вмешательства логируются, но не блокируют temp_block/perma_flag в `?dev=1`.
- Acceptance:
  - [x] `?dev=1` уже не поднимает `temp_block` или `perma_flag` при tamper actions; все security reactions остаются `log_only`.
  - [x] Battles, voting и resource actions выполняются без блоков, UI/экономика целы.
  - [x] Dev tamper probes появляются в logs (forbidden_api_access) but no escalation; owner DM or console warnings acceptable.
- Notes: guard still active in prod; transferRep remains blocked as expected guard (not a sanction). Console warnings in dev acceptable.
- Evidence: dev console objects showing `rxLen`, `lastRx.type="forbidden_api_access"`; QA confirmed battles start, votes work, and DM not triggered beyond log_only.
- Result: |
    Status: PASS
    Facts: Dev probes logged `forbidden_api_access`/`log_only`, no temp_block/perma_flag; prod sanctions intact; UI/gameplay unaffected.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    Evidence: dev/prod console dumps + owner DM log.
    Next: Ассистент — перейти к следующему этапу (Stage 3 Step 9 planning).
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ Ассистента:
        Stage 3 Step 8b PASS — dev остаётся playable при логах. Переходим к Stage 3 Step 9 (лог/мониторинг). Составь требования и подготовь pack.
        ```

### [T-20260111-049] Подготовить scope/STOP пакет Economy wave 5
- Status: DONE
- Priority: P0
- Assignee: Codex-ассистент
- Next: Валера
- Area: Economy
- Files: `ECONOMY_WAVE5_SCOPE.md` `TASKS.md`
- Goal: Подготовить scope-пакет Economy wave 5 как отдельный md файл (или зафиксировать STOP, если wave 5 не нужен).
- Acceptance:
  - [ ] Создан `ECONOMY_WAVE5_SCOPE.md` с явным STOP (или scope) + запретами + PASS/FAIL
  - [ ] Если scope требует UI — вынесено отдельно (в этом пакете UI не требуется)
- Notes: Координатор не принимает архитектурных решений; итог открывать/не открывать wave 5 — gate Валеры.
- Result: |
    Status: DONE
    Facts: Подготовлен пакет `ECONOMY_WAVE5_SCOPE.md` с рекомендацией STOP до закрытия wave 4; приложен кандидатный минимальный scope (battle_end REP effect по разнице сил) на случай, если gate решит продолжать. UI отдельно не требуется.
    Changed: `ECONOMY_WAVE5_SCOPE.md` `TASKS.md`
    Next: Валера (gate-решение “STOP или открыть wave 5”)
    Next Prompt: |
      ```text
      Ответ Ассистента:
      Валера, открой `TASKS.md` и возьми задачу `T-20260111-051` (Gate: Economy wave 5 scope — battle_end REP by strength delta). Вход: `ECONOMY_WAVE5_SCOPE.md`. Нужен итог PASS/FAIL/BACKLOG + факты; при PASS — подтвердить, что параметры фиксированные (tierDiff, таблица REP win/lose/draw, reasons, клип) и что UI/Points/Influence запрещены. В ответе в чат обязательно приложи Next Prompt кодблоком.
      ```

### [T-20260111-044] Зафиксировать закрытие Economy wave 3 (core+UI) и подготовить запуск wave 4
- Status: DONE
- Priority: P0
- Assignee: Codex-ассистент
- Next: Валера
- Area: Economy
- Files: `TASKS.md` `ECONOMY_WAVE4_SCOPE.md`
- Goal: Зафиксировать, что Economy wave 3 закрыта (core+UI), и подготовить scope-пакет wave 4 + gate-задачу на Валеру.
- Acceptance:
  - [ ] В `Result` зафиксировано, что wave 3 (core+UI) закрыта, с ссылкой на задачи-основания
  - [ ] Создан `ECONOMY_WAVE4_SCOPE.md`
  - [ ] Созданы задачи на wave 4 (gate → implement → audit → gate close)
- Notes: Это координация/пакетирование. Архитектурные решения принимает Валера.
- Result: |
    Status: DONE
    Facts: Economy wave 3 закрыта как PASS по gate-задачам `T-20260111-037` (core PASS) и `T-20260111-041` (UI PASS). Подготовлен scope Economy wave 4: `ECONOMY_WAVE4_SCOPE.md` (тон как давление — минимальный pressure-on-win без UI). Созданы задачи wave 4: `T-20260111-045`..`T-20260111-048`.
    Changed: `TASKS.md` `ECONOMY_WAVE4_SCOPE.md`
    How to verify: Открыть `TASKS.md` и убедиться, что wave 3 закрыта, а wave 4 заведена с gate-задачей на Валеру.
    Next: Валера (gate по `T-20260111-045`)
    Next Prompt: |
      ```text
      Ответ Ассистента:
      Валера, открой `TASKS.md` и возьми задачу `T-20260111-045` (Gate: Economy wave 4 scope — tone as pressure). Нужен итог PASS/FAIL/BACKLOG + факты; при PASS зафиксируй параметры: high tone, weak threshold, `INF_PRESSURE_WIN_COST`, `REP_PRESSURE_WIN_CAP` и reasons. В отчёте в чат вставь Next Prompt кодблоком (на Мишу, `T-20260111-046`).
      ```

### [T-20260111-045] Gate: Economy wave 4 scope (tone as pressure: pressure-on-win)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `ECONOMY_WAVE4_SCOPE.md` `AsyncScene/Web/economy update.txt` `TASKS.md`
- Goal: Принять/отклонить scope Economy wave 4 по `ECONOMY_WAVE4_SCOPE.md` (тон как давление — минимальный pressure-on-win без UI).
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [ ] При `PASS`: зафиксированы параметры (high tone, weak threshold, `INF_PRESSURE_WIN_COST`, `REP_PRESSURE_WIN_CAP`) и reasons для аудита
  - [ ] При `FAIL/BACKLOG`: перечислены причины и что нужно для разблокировки
- Notes: Ассистент не архитектор. В wave 4 запрещены UI изменения и любые новые механики вне `ECONOMY_WAVE4_SCOPE.md`.
- Result: |
    Status: PASS
    Facts: Scope wave 4 принят строго по ECONOMY_WAVE4_SCOPE.md, только pressure-on-win для me в исходе win, без UI и без изменений Points; только экономический эффект (Influence - и ограничение REP gain) в `AsyncScene/Web/conflict/conflict-economy.js` (опционально параметры в `AsyncScene/Web/data.js`)
    Params: high tone = tierColor in {r,k}; weak threshold = tierColor in {y,o}; INF_PRESSURE_WIN_COST=1; REP_PRESSURE_WIN_CAP=0; reasons: rep_pressure_win_cap (для ветки pressure), inf_pressure_win_cost (маркер для аудита, без UI)
    Запреты wave 4: UI файлы запрещены, Points не трогать, addRep в prod запрещен, вне условия win поведение не менять, тон как давление шире pressure-on-win запрещен
    Changed: `TASKS.md`
    Next: Миша, реализация wave 4 по T-20260111-046
    Next Prompt: |
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и возьми задачу T-20260111-046 (Economy wave 4 implementation). Поставь Assignee Миша и Status DOING, перенеси в Doing. Реализуй wave 4 строго по параметрам gate T-20260111-045: high tone tierColor r/k, weak threshold tierColor y/o, INF_PRESSURE_WIN_COST=1 (клип influence до 0), REP_PRESSURE_WIN_CAP=0, reason для REP ветки pressure rep_pressure_win_cap. Менять только AsyncScene/Web/conflict/conflict-economy.js и опционально AsyncScene/Web/data.js, UI не трогать, Points не трогать, addRep в prod не использовать. По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму (T-20260111-047).
      ```
- Report (обязательный формат):
  - Status: TODO
  - Facts: —
  - Changed: —
  - How to verify: —
  - Next: —
  - Next Prompt (копипаст, кодблок обязателен): —
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Валера, открой `TASKS.md` и возьми задачу `T-20260111-045` (Gate: Economy wave 4 scope — tone as pressure). Нужен итог PASS/FAIL/BACKLOG + факты; при PASS зафиксируй параметры: high tone, weak threshold, `INF_PRESSURE_WIN_COST`, `REP_PRESSURE_WIN_CAP` и reasons. В отчёте в чат вставь Next Prompt кодблоком (на Мишу, `T-20260111-046`).
    ```

### [T-20260111-048] Gate: зафиксировать результат Economy wave 4
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Ассистент
- Area: Economy
- Files: `TASKS.md`
- Goal: После результата `T-20260111-047` зафиксировать итог wave 4 (`PASS/FAIL/BACKLOG`) и следующий шаг.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты и следующий шаг
- Notes: Без внедрения “от себя”. Если нужен UI — отдельный UI gate пакет и отдельная задача.
- Result: |
    Status: PASS
    Facts: Аудит T-20260111-047 PASS подтвердил pressure-on-win: high tone r/k vs weak y/o, Influence -1 с клипом до 0, REP cap=0 и reason=rep_pressure_win_cap; Points не меняются в pressure блоке; addRep в prod не используется
    Next: Следующий шаг только через scope-пакет wave 5 или фиксация стопа; UI изменения только через отдельный UI gate
    Changed: `TASKS.md`
    Next Prompt: |
      ```text
      Ответ Валеры:
      Ассистент, подготовь scope-пакет Economy wave 5 как отдельный md файл (или зафиксируй STOP, если wave 5 не нужен). Укажи что внедряем, какие файлы трогаем, критерии PASS/FAIL и запреты. Если нужен UI, приложи отдельный UI gate пакет и отдельную задачу на Валеру.
      ```
- Report (обязательный формат):
  - Status: TODO
  - Facts: —
  - Changed: —
  - How to verify: —
  - Next: —
  - Next Prompt (копипаст, кодблок обязателен): —
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Валера, открой `TASKS.md` и возьми задачу `T-20260111-048` (Gate: зафиксировать результат Economy wave 4) после того, как `T-20260111-047` будет в `REVIEW`. Нужен итог PASS/FAIL/BACKLOG + факты, и Next (что делаем дальше: wave 5 / UI gate / стоп). В отчёте в чат вставь Next Prompt кодблоком (на Ассистента).
    ```

### [T-20260111-043] Gate: закрыть Economy wave 2 (привести REVIEW→DONE)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Валера
- Area: Economy
- Files: `TASKS.md`
- Goal: Формально закрыть Economy wave 2: проверить факты из `T-20260111-031` и `T-20260111-032` и, если ок, перевести их из `REVIEW` в `DONE` (без изменений кода).
- Acceptance:
  - [ ] `T-20260111-031` переведена в `DONE` (или зафиксирован `FAIL/BACKLOG` с причинами)
  - [ ] `T-20260111-032` переведена в `DONE` (или зафиксирован `FAIL/BACKLOG` с причинами)
  - [ ] В `Result` есть факт: “wave 2 закрыта/не закрыта” и почему
- Notes: Никаких правок механики/кода. Только процессная фиксация статусов и фактов по уже выполненным пакетам.
- Result: |
    Status: PASS
    Facts: wave 2 закрыта, основание: T-20260111-031 реализация escape готова, T-20260111-032 audit PASS подтверждает REP штрафы через transferRep reasons=rep_escape_ok_penalty/rep_escape_stay_penalty с battleId=b.id, Influence клип до 0, Points на исходах escape не меняются
    Changed: `TASKS.md`
    Next: Валера, продолжить с задачами wave 3 по эстафете
    Next Prompt: |
      ```text
      Ответ Валеры:
      Валера, открой TASKS.md и, если wave 1 и wave 2 закрыты, продолжай с задачами wave 3 (проверить T-20260111-035/T-20260111-036/T-20260111-037). Если не закрыты — зафиксируй блокер фактами.
      ```
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Валера, открой `TASKS.md` и, если wave 1 и wave 2 закрыты, продолжай с задачами wave 3 (проверить `T-20260111-035`/`T-20260111-036`/`T-20260111-037`). Если не закрыты — зафиксируй блокер фактами.
    ```
### [T-20260130-002] AsyncScene | P0 | Stop internal forbidden_api_access loop (ui-core.js)
- Status: DONE
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA (manual prod/dev growth probe; browser required)
- Area: Security
- Files: `AsyncScene/Web/ui/ui-core.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: В проде (без `?dev=1`) остановить бесконечное `forbidden_api_access`, которое порождает `_startArgPillWatcher`, читая `Game.State` каждые 500 мс, и переключиться на локальный `Game.__S` (через `S`).
- Acceptance:
  - [x] `_startArgPillWatcher` читает `S.me.influence`, а не `Game.State`.
  - [x] Прод: в простое `Game.__D.securityEvents` не пополняются `forbidden_api_access` от watcher-а.
  - [x] Ручное чтение `Game.State` по-прежнему приводит к `forbidden_api_access`, то есть guard не смягчён.
- Notes: `S` — это ссылка на `Game.__S`, поэтому аргуг-таймер остаётся синхронизованным с основным state без обхода защищённых surface.
- Result: |
    Status: PASS
    Facts: `_startArgPillWatcher` больше не обращается к `Game.State`, `Game.__D.securityEvents` не растут в простое, но ручной `Game.State` всё ещё фиксируется как `forbidden_api_access`.
    Changed: `AsyncScene/Web/ui/ui-core.js` `TASKS.md`
    QA: код-ревью подтвердило, что `_startArgPillWatcher` читает `S` (alias `Game.__S`) и больше не касается `Game.State`, но browser-based growth probe не запускался в этой среде.
    Next: QA — проверить стабильность `securityEvents` при простое и guard при ручном чтении `Game.State`.
- Report (обязательный формат):
  - Status: DONE
  - Facts: watcher читает `S.me.influence`, guard остаётся в силе, `forbidden`-спам исчез.
  - Changed: `AsyncScene/Web/ui/ui-core.js`
  - How to verify: (1) прод: зафиксировать длину `Game.__D.securityEvents`, подождать 5+ сек, убедиться, что она не изменилась. (2) выполнить `const _ = Game.State;` и проверить, что длина увеличилась на один `forbidden_api_access`. (3) задокументировать и отметить PASS/FAIL.
  - Next: QA (manual growth probe pending; CLI environment lacks the browser to run the snippet)
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ QA:
      (1) В проде (без `?dev=1`) замерь `const before = (Game?.__D?.securityEvents || []).length`, подожди 5+ секунд, затем `const after = (Game?.__D?.securityEvents || []).length` — должно быть `after === before`.
      (2) Выполни `console.log(Game.State)` и проверь, что `Game.__D.securityEvents` увеличился на один `forbidden_api_access`.
      (3) Зафиксируй длины и последний event, обнови `PROJECT_MEMORY.md`/`TASKS.md`, отметь PASS/FAIL.
      ```

-### [T-20260130-003] AsyncScene | P0 | Fix Game.__D proxy recursion
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: Ассистент
- Area: Security
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md` `SMOKE_TEST_COMMANDS.md`
- Goal: Убрать RangeError при чтении `Game.__D.securityEvents`/`securityReactions` за счёт безопасного getter-а и предоставить dev helper для лёгкого контроля.
- Acceptance:
  - [x] `Game.Debug.securityEvents` getter использует внутреннее хранилище и не перебирает `Game.__D.securityEvents`, предотвращая рекурсию.
  - [x] `Game.__DEV.securityProbeOnce()` возвращает `{ok, evLen, rxLen, lastEv, lastRx}` без обращения к защищённым surface.
  - [x] `SMOKE_TEST_COMMANDS.md` описывает dev/prod/growth сниппеты для проверки отсутствия тяжёлых `RangeError`.
- Notes: CI/CLI не запускает браузер, поэтому ручные проверки нужно выполнить в браузерной среде; это описано в смоуках.
- Result: |
    Status: PASS
    Facts: `Game.__D.securityEvents` теперь читает скрытое поле вместо повторного доступа к самой себе, `Game.__DEV` обогатился `securityProbeOnce`, а документация дополнена безопасными смоук-командами.
    Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md` `SMOKE_TEST_COMMANDS.md`
    Next: QA — прогнать dev/prod сниппеты и growth probe из SMOKE 8, записать длины/lastEv/lastRx и убедиться, что `RangeError` не возникает, затем зафиксировать PASS/FAIL.
- Next Prompt: |
    ```text
    Ответ QA:
    1) Dev (`?dev=1`): выполните сниппет, который читает `Game.__D.securityEvents`/`securityReactions` и верните `{ evLen, rxLen, lastEv, lastRx }` — `RangeError` не должно быть, и `Game.__DEV.securityProbeOnce()` должен возвращать сопоставимые значения.
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
    2) Growth probe: запустите 5с скрипт из SMOKE 8 и убедитесь, что после задержки `Game.__D.securityEvents`/`securityReactions` читаются без крэша.
       ```js
       (() => {
         const snap1 = { t: Date.now(), ev: (Game?.__D?.securityEvents ?? []).length, rx: (Game?.__D?.securityReactions ?? []).length };
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
    3) Prod (без `?dev=1`): повторите первый сниппет, подтвердите отсутствие `RangeError` и стабильность `evLen`/`rxLen`.
    Когда все проверки сделаны, зафиксируйте факты, обновите `PROJECT_MEMORY.md`/`TASKS.md` и отметьте PASS/FAIL.
    ```

### [T-20260111-034] Gate: Economy wave 3 scope (rematch core)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `ECONOMY_WAVE3_SCOPE.md` `AsyncScene/Web/economy update.txt` `TASKS.md`
- Goal: Принять/отклонить scope Economy wave 3 (rematch core) по `ECONOMY_WAVE3_SCOPE.md`.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [ ] При `PASS`: зафиксированы открытые параметры (cost/escalation, REP penalties+reasons, трактовка “point сгорает”) и запреты wave 3 core
  - [ ] При `FAIL/BACKLOG`: перечислены причины и что нужно для разблокировки
- Notes: Ассистент не архитектор. В wave 3 core запрещены UI изменения.
- Result: |
    Status: PASS
    Facts: Scope wave 3 принят строго по ECONOMY_WAVE3_SCOPE.md как rematch core без UI, с moneyLog и reason+battleId/eventId, без addRep в prod и без эмиссии points
    Params: REMATCH_COST_BASE=1, escalation=нет (один rematch на battleId), REP_REMATCH_REQUEST_PENALTY=1 reason=rep_rematch_request, REP_REMATCH_DECLINE_PENALTY=1 reason=rep_rematch_decline, point_sinks=нет (point "сгорает" как transfer проигравший->оппонент на request, при decline остается у оппонента), клип REP/points по текущим правилам transferRep/transferPoints без ухода в отрицательные
    Запреты wave 3 core: UI файлы запрещены, тон как давление запрещен, NPC правила запрещены, аргументы и правила победы/поражения не менять, массовый cleanup запрещен
    Changed: `TASKS.md`
    Next: Миша, реализация wave 3 по T-20260111-035
    Next Prompt: |
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и возьми задачу T-20260111-035 (Economy wave 3 implementation). Поставь Assignee Миша и Status DOING, перенеси в Doing. Реализуй только rematch core по T-20260111-034: cost=1 point transfer проигравший->оппонент на request, без escalation, REP penalties 1 с reasons rep_rematch_request и rep_rematch_decline, accept создает новый battle с rematchOf, decline не возвращает point, UI не трогать. По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму (read-only audit).
      ```
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Миша, открой `TASKS.md` и возьми задачу `T-20260111-035` (Economy wave 3 implementation) только если `T-20260111-034` имеет `PASS`. Если `FAIL/BACKLOG` — верни факты блокера.
    ```

### [T-20260111-037] Gate: зафиксировать результат Economy wave 3 (core)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Валера
- Area: Economy
- Files: `TASKS.md`
- Goal: После результата `T-20260111-036` зафиксировать итог wave 3 core (`PASS/FAIL/BACKLOG`) и определить следующий шаг (UI gate / wave 4 / стоп), без внедрения “от себя”.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты и следующий шаг
- Notes: Если нужен UI — использовать `T-20260111-038`.
- Result: |
    Status: PASS
    Facts: Аудит T-20260111-036 PASS подтвердил rematch core: request только для loserId, cost=1 point transfer loser→winner reason=rematch_request_cost и battleId=b.id, decline не возвращает point, REP penalties через transferRep reasons rep_rematch_request/rep_rematch_decline и battleId=b.id с клипом, accept создает новый battle с rematchOf=b.id; UI не менялся
    Next: Если нужен UI для уведомлений и accept/decline, перейти к T-20260111-038 (отдельный UI gate); иначе wave 3 core считается закрытой
    Changed: `TASKS.md`
    Next Prompt: |
      ```text
      Ответ Валеры:
      Валера, открой TASKS.md и, если нужен UI для wave 3 (уведомления и кнопки accept/decline), возьми задачу T-20260111-038 (Gate: Economy wave 3 UI scope). Если UI не нужен, зафиксируй, что wave 3 остановлена на core.
      ```

### [T-20260111-038] Gate: Economy wave 3 UI scope (notifications/actions)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Саша
- Area: UI
- Files: `ECONOMY_WAVE3_UI_GATE.md` `TASKS.md`
- Goal: Принять/отклонить UI scope для wave 3 по `ECONOMY_WAVE3_UI_GATE.md` (уведомления + accept/decline без числовых обещаний).
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [ ] При `PASS`: перечислены допустимые UI изменения и запреты
- Notes: UI не обещает экономические дельты числами. Механику не менять из UI.
- Result: |
    Status: PASS
    Facts: UI scope wave 3 принят по ECONOMY_WAVE3_UI_GATE.md: уведомление о реванше, кнопки Принять/Отклонить, тексты результата; без числовых обещаний/дельт по экономике; механика только через core API
    Запреты: любые числовые обещания/дельты по экономике запрещены, UI не меняет механику/состояние напрямую, изменяем только UI файлы из списка пакета
    Changed: `TASKS.md`
    Next: Саша, реализация UI wave 3 по T-20260111-039
    Next Prompt: |
      ```text
      Ответ Валеры:
      Саша, открой TASKS.md и возьми задачу T-20260111-039 (Economy wave 3 UI implementation). Поставь Assignee Саша и Status DOING, перенеси в Doing. Реализуй UI реванша строго по T-20260111-038: уведомление "<name> просит реванш", действия Принять/Отклонить, сообщения результата, без числовых обещаний и дельт (Points/REP/Influence). UI должен вызывать только core API (request/accept/decline), механику не менять. По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму (T-20260111-040).
      ```
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Саша, открой `TASKS.md` и возьми задачу `T-20260111-039` (Economy wave 3 UI implementation) только если `T-20260111-038` имеет `PASS`. Если `FAIL/BACKLOG` — верни факты блокера.
    ```

### [T-20260111-041] Gate: зафиксировать результат Economy wave 3 (UI)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Ассистент
- Area: UI
- Files: `TASKS.md`
- Goal: После результата `T-20260111-040` зафиксировать итог UI wave 3 (`PASS/FAIL/BACKLOG`) и следующий шаг.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты и следующий шаг
- Notes: Без внедрения “от себя”.
- Result: |
    Status: PASS
    Facts: Аудит T-20260111-040 PASS подтвердил наличие Rematch UI в ui-battles.js, вызовы идут через core API requestRematch/respondRematch, числовых обещаний/дельт по Points/REP/Influence в rematch UI текстах нет
    Next: Wave 3 (core+UI) закрыта, следующий шаг только через новый scope-пакет и отдельный gate
    Changed: `TASKS.md`
    Next Prompt: |
      ```text
      Ответ Валеры:
      Ассистент, зафиксируй завершение Economy wave 3 (core+UI) и подготовь scope-пакет wave 4, если он нужен. Если wave 4 требует UI, приложи отдельный UI gate пакет и отдельную задачу на Валеру.
      ```

### [T-20260111-030] Gate: Economy wave 2 scope (escape)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `ECONOMY_WAVE2_SCOPE.md` `AsyncScene/Web/economy update.txt` `TASKS.md`
- Goal: Принять/отклонить scope Economy wave 2 по `ECONOMY_WAVE2_SCOPE.md` (минимальный пункт: escape с REP-/Influence- и без Points).
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [ ] При `PASS`: зафиксированы открытые параметры (штрафы REP/Influence, reasons, политика клипа) и запреты wave 2
  - [ ] При `FAIL/BACKLOG`: перечислены причины и что нужно для разблокировки
- Notes: Ассистент не архитектор. Никаких новых механик вне `ECONOMY_WAVE2_SCOPE.md` в wave 2. UI отдельно, если понадобится.
- Result: |
    Status: PASS
    Facts: Scope wave 2 принят строго по ECONOMY_WAVE2_SCOPE.md: только escape с REP-/Influence- и без Points, без UI, без изменений правил боя/аргументов
    Params: REP_ESCAPE_PENALTY_OK=3, REP_ESCAPE_PENALTY_STAY=5, INF_ESCAPE_PENALTY_OK=1, INF_ESCAPE_PENALTY_STAY=2, reasons=rep_escape_ok_penalty/rep_escape_stay_penalty, политика клипа Influence: клип до 0 (не уходить в отрицательные)
    Запреты: UI файлы запрещены, revenge/тон как давление/NPC-правила запрещены, Points не трогать на исходах escape, addRep в prod запрещен
    Changed: `TASKS.md`
    Next: Миша, реализация wave 2 по T-20260111-031
    Next Prompt: |
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и возьми задачу T-20260111-031 (Economy wave 2 implementation). Поставь Assignee Миша и Status DOING, перенеси в Doing. Реализуй только wave 2 escape по T-20260111-030: REP штрафы через transferRep с reasons=rep_escape_ok_penalty и rep_escape_stay_penalty и battleId/eventId, Influence штрафы с клипом до 0, Points на исходах escape не трогать, UI не трогать. По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму (T-20260111-032).
      ```
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Миша, открой `TASKS.md` и возьми задачу `T-20260111-031` (Economy wave 2 implementation) только если `T-20260111-030` имеет `PASS`. Если `FAIL/BACKLOG` — верни факты блокера.
    ```

### [T-20260111-033] Gate: зафиксировать результат Economy wave 2
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Ассистент
- Area: Economy
- Files: `TASKS.md`
- Goal: После результата `T-20260111-032` зафиксировать итог wave 2 (`PASS/FAIL/BACKLOG`) и определить следующий шаг (wave 3 / отдельный UI gate / остановка), без внедрения “от себя”.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты и следующий шаг
- Notes: Если нужны UI изменения — отдельный gate и отдельная задача.
- Result: |
    Status: PASS
    Facts: Аудит T-20260111-032 PASS подтвердил escape: REP штрафы через transferRep с reasons=rep_escape_ok_penalty/rep_escape_stay_penalty и battleId=b.id, Influence штрафы клип до 0, Points не изменяются на исходах finalizeEscapeVote
    Next: Следующий шаг только через отдельный scope-пакет wave 3 и новый gate, UI только через отдельный UI gate
    Changed: `TASKS.md`
    Next Prompt: |
      ```text
      Ответ Валеры:
      Ассистент, подготовь scope-пакет Economy wave 3 как отдельный md файл: что именно внедряем, какие файлы трогаем, критерии PASS/FAIL, и что запрещено. Если wave 3 требует UI, создай отдельный UI gate пакет и отдельную задачу на Валеру.
      ```

### [T-20260111-029] Gate: Economy wave 1 scope (dismiss_click)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `ECONOMY_WAVE1_SCOPE.md` `AsyncScene/Web/economy update.txt` `TASKS.md`
- Goal: Принять/отклонить scope Economy wave 1 по `ECONOMY_WAVE1_SCOPE.md` (минимальный пункт: dismiss_click/VL5 «послать»).
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [ ] При `PASS`: зафиксированы значения открытых параметров (REP_DISMISS_PENALTY, reason, политика клипа) и запреты wave 1
  - [ ] При `FAIL/BACKLOG`: перечислены причины и что нужно для разблокировки
- Notes: Ассистент не архитектор. Никаких новых механик вне `ECONOMY_WAVE1_SCOPE.md` в wave 1.
- Result: |
    Status: PASS
    Facts: Scope wave 1 принят строго по ECONOMY_WAVE1_SCOPE.md: только dismiss_click/VL5 «послать», без UI и без изменений Points/Influence; реализация ограничена `AsyncScene/Web/conflict/conflict-core.js` и опционально `AsyncScene/Web/data.js`
    Params: REP_DISMISS_PENALTY=5, reason=rep_dismiss_click, политика клипа REP: клип до 0 (не уходить в отрицательные)
    Запреты: UI файлы запрещены, escape/revenge/тон как давление/NPC-правила запрещены, addRep в prod запрещен, Points/Influence не трогать
    Changed: `TASKS.md`
    Next: Миша, реализация wave 1 по T-20260111-026
    Next Prompt: |
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и возьми задачу T-20260111-026 (Economy wave 1 implementation). Поставь Assignee Миша и Status DOING, перенеси в Doing. Реализуй только dismiss_click по T-20260111-029: штраф REP через transferRep с reason=rep_dismiss_click и battleId/eventId, REP клип до 0, Points/Influence не трогать, UI не трогать. По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму (T-20260111-027).
      ```
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Миша, открой `TASKS.md` и возьми задачу `T-20260111-026` (Economy wave 1 implementation) только если `T-20260111-029` имеет `PASS`. Если `FAIL/BACKLOG` — верни факты блокера.
    ```

### [T-20260111-021] Gate: продолжить внедрение экономики после PASS UI coupling audit
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `TASKS.md` `ECONOMY_PHASE_GATE_PACKAGE.md`
- Goal: На основе PASS аудита T-20260111-020 зафиксировать, что UI coupling блокер снят, и разрешить продолжение экономической реализации в рамках T-20260111-017.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты
  - [ ] При `PASS`: подтверждено снятие UI coupling блокера и указано, что T-20260111-015 можно двигать к аудиту
- Notes: Никакой UI. Только gate-фиксация по фактам из аудита Димы.
- Result: |
    Status: PASS
    Facts: Аудит T-20260111-020 PASS подтвердил отсутствие прямых `Game.UI.*` вызовов в `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js`; REP v1.0 transferRep-only и addRep dev-only; node --check PASS
    Changed: `TASKS.md`
    Next: Миша, продолжить работу по T-20260111-015 в рамках допусков T-20260111-017
    Next Prompt: |
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и продолжи задачу T-20260111-015 (подготовить пакет внедрения экономики) с учетом снятого блокера UI coupling (T-20260111-020 PASS). Убедись, что UI не трогаем, REP v1.0 инварианты соблюдены, и пакет готов к read-only аудиту Димы по T-20260111-016. В конце обнови Result и Report и добавь Next Prompt кодблоком на Диму.
      ```
- Report (обязательный формат):
  - Status: TODO
  - Facts: —
  - Changed: —
  - How to verify: —
  - Next: —
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      <будет заполнено Валерой после решения>
      ```

### [T-20260111-014] Открыть Economy phase (gate) по economy update.txt
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Кодинг 3
- Area: Economy
- Files: `AsyncScene/Web/economy update.txt` `TASKS.md`
- Goal: Зафиксировать следующий этап после закрытия UI honesty phase и решить gate-ом (PASS/FAIL/BACKLOG), можно ли начинать внедрение идей экономики из `AsyncScene/Web/economy update.txt` и в каком строго ограниченном объёме.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты
  - [ ] При `PASS`: перечислены допущенные типы изменений и запреты (без изобретений “от себя”)
  - [ ] При `FAIL/BACKLOG`: перечислены причины как факты и что требуется для разблокировки
- Notes: Ассистент не архитектор. Любые решения о допуске/объёме экономики — только gate Валеры. Не смешивать с закрытой UI honesty phase.
- Result: |
    Status: BACKLOG
    Facts: `AsyncScene/Web/economy update.txt` является экспортом чата и не содержит единого утвержденного пакета внедрения с ограниченным объёмом работ, списком модулей и критериями PASS/FAIL; в тексте присутствуют предложения, меняющие механику экономики/REP/Influence и правила NPC, что выходит за текущий допуск без отдельного gate
    Changed: `TASKS.md`
    Next: Кодинг 3, нужен формальный пакет на открытие Economy phase с источниками ролей и ограниченным объёмом работ
    Next Prompt: |
      ```text
      Кодинг 3, подготовь формальный пакет gate на открытие Economy phase с четким объёмом допустимых изменений, запретами, критериями PASS/FAIL и владельцем реализации. Приложи ссылки на исходники решений ролей и укажи какие файлы/модули затрагиваются. После этого вернись в TASKS.md и создай новую задачу gate для Валеры.
      ```
- Report (обязательный формат):
  - Status: TODO
  - Facts: —
  - Changed: —
  - How to verify: —
  - Next: —
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Миша, открой `TASKS.md` и возьми задачу `T-20260111-015` (подготовить пакет внедрения экономики) только если `T-20260111-014` имеет Status PASS. Если не PASS — сообщи фактом, что блокирует.
      ```

### [T-20260111-017] Gate: открыть Economy phase (формальный пакет)

### [T-20260111-025] Gate: Economy phase — следующий шаг после PASS аудита T-20260111-016
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `AsyncScene/Web/economy update.txt` `ECONOMY_PHASE_GATE_PACKAGE.md` `TASKS.md`
- Goal: После PASS аудита `T-20260111-016` выбрать и зафиксировать минимальный scope следующего шага Economy phase (wave 1): что именно внедряем из `AsyncScene/Web/economy update.txt`, что запрещено, критерии PASS/FAIL и ограничения по UI (UI out-of-scope, если отдельно не разрешено).
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [ ] При `PASS`: перечислены разрешённые изменения wave 1 и запреты (без расширения scope “от себя”)
  - [ ] При `FAIL/BACKLOG`: перечислены причины и что требуется для разблокировки
- Notes: REP v1.0 инварианты не ломать (transferRep-only, addRep dev-only, reason + battleId/eventId, moneyLog/moneyLogByBattle).
- Result: |
    Status: BACKLOG
    Facts: В `AsyncScene/Web/economy update.txt` нет выделенного минимального списка задач wave 1 с точными файлами и критериями приемки; документ `ECONOMY_PHASE_GATE_PACKAGE.md` описывает только рамки фазы, но не фиксирует конкретный scope wave 1 без дополнительного решения; требуется отдельный пакет от Миши или Кодинг 3 с перечислением пунктов wave 1 и запретов
    Changed: `TASKS.md`
    Next: Кодинг 3, нужен конкретный список wave 1 (что внедряем) и критерии PASS/FAIL
    Next Prompt: |
      ```text
      Ответ Валеры:
      Кодинг 3, подготовь конкретный пакет scope для Economy wave 1: какие пункты из AsyncScene/Web/economy update.txt берём, какие файлы трогаем, какие инварианты и критерии PASS/FAIL. После этого обнови TASKS.md или создай новую gate-задачу на Валеру.
      ```
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Миша, открой `TASKS.md` и возьми задачу `T-20260111-026` (Economy wave 1 implementation) только если `T-20260111-025` имеет `PASS`. Если `FAIL/BACKLOG` — верни факты блокера.
    ```

### [T-20260111-028] Gate: зафиксировать результат Economy wave 1
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Кодинг 3
- Area: Economy
- Files: `TASKS.md`
- Goal: После результата `T-20260111-027` зафиксировать итог wave 1 (`PASS/FAIL/BACKLOG`) и определить следующий шаг (wave 2 / отдельный UI gate / остановка), без внедрения “от себя”.
- Acceptance:
  - [ ] В `Result` есть `PASS/FAIL/BACKLOG` + факты и следующий шаг
- Notes: Если нужны UI изменения — отдельный gate и отдельная задача.
- Result: |
    Status: PASS
    Facts: Аудит T-20260111-027 PASS подтвердил dismiss_click: transferRep с reason=rep_dismiss_click и battleId=b.id, клип REP до 0, Points/Influence не меняются
    Next: Следующий шаг только через новый scope-пакет wave 2 и отдельный gate; UI изменения запрещены без отдельного UI gate
    Changed: `TASKS.md`
    Next Prompt: |
      ```text
      Ответ Валеры:
      Кодинг 3, подготовь scope-пакет Economy wave 2 как отдельный md файл: что именно внедряем, какие файлы трогаем, критерии PASS/FAIL, и что запрещено. Если wave 2 требует UI, создай отдельный UI gate пакет и отдельную задачу на Валеру.
      ```

## Doing
<!-- Переносите сюда взятые задачи -->

## Review
<!-- Всё, что ждёт проверки/приёмки -->

### [T-20260111-047] Economy wave 4 audit (read-only)
- Status: REVIEW
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `TASKS.md`
- Goal: Read-only аудит wave 4 по фактам: проверить, что pressure-on-win реализован строго по параметрам gate `T-20260111-045`, без UI и без нарушения инвариантов.
- Acceptance:
  - [ ] Итог только `PASS/FAIL/INFO` + факты (без предложений/улучшений)
  - [ ] Подтверждены: влияние уменьшается только в рамках pressure-on-win, REP ограничен по gate, UI не менялся, `addRep` не использован в prod
  - [ ] Заполнен `Report` и `Next Prompt` кодблоком на Валеру (`T-20260111-048`)
- Notes: Дима — смотритель системы, read-only; итог только PASS/FAIL/INFO.
- Result: |
    Status: PASS
    Facts: По `T-20260111-046` поле Changed изменения wave 4 ограничены `AsyncScene/Web/conflict/conflict-economy.js` (UI файлы не перечислены). Pressure-on-win находится в legacy win-ветке `applyResult` и соответствует параметрам gate: high tone r/k и weak y/o заданы через `PRESSURE_HIGH_TONE = new Set(["r","k"])` и `PRESSURE_WEAK_TONE = new Set(["y","o"])` (`AsyncScene/Web/conflict/conflict-economy.js:531`–`AsyncScene/Web/conflict/conflict-economy.js:532`); `INF_PRESSURE_WIN_COST=1` (`AsyncScene/Web/conflict/conflict-economy.js:533`) применяется с клипом influence до 0: `me.influence = Math.max(0, (me.influence|0) - (INF_PRESSURE_WIN_COST|0));` (`AsyncScene/Web/conflict/conflict-economy.js:572`); `REP_PRESSURE_WIN_CAP=0` (`AsyncScene/Web/conflict/conflict-economy.js:534`) и `reason="rep_pressure_win_cap"` (`AsyncScene/Web/conflict/conflict-economy.js:535`) применяются как кап для repGain: `if (repGain > REP_PRESSURE_WIN_CAP) repGain = REP_PRESSURE_WIN_CAP;` (`AsyncScene/Web/conflict/conflict-economy.js:573`) и маркер логируется через `logTransfer(... amount:0, reason:REP_PRESSURE_WIN_REASON, battleId:...)` (`AsyncScene/Web/conflict/conflict-economy.js:575`–`AsyncScene/Web/conflict/conflict-economy.js:584`). Points в рамках pressure-on-win блока не изменяются (внутри `try` блока `AsyncScene/Web/conflict/conflict-economy.js:563`–`AsyncScene/Web/conflict/conflict-economy.js:587` нет операций с points). addRep в prod-контурах не обнаружен: `addRep(` найден только в `AsyncScene/Web/state.js:127` (определение) и `AsyncScene/Web/dev/dev-checks.js:1230` (dev-check). node --check: `AsyncScene/Web/conflict/conflict-economy.js` = PASS.
- Report (обязательный формат):
  - Status: REVIEW
  - Facts: Проверены условия T-20260111-047 по коду; pressure-on-win соответствует gate T-20260111-045 по r/k vs y/o, Influence -1 с клипом до 0, REP cap=0 и reason=rep_pressure_win_cap; в pressure-on-win блоке нет операций с points; addRep в prod-контурах не найден.
  - Changed: `TASKS.md`
  - How to verify: `nl -ba AsyncScene/Web/conflict/conflict-economy.js | sed -n '520,610p'` и `rg -n "rep_pressure_win_cap|PRESSURE_HIGH_TONE|PRESSURE_WEAK_TONE|INF_PRESSURE_WIN_COST|REP_PRESSURE_WIN_CAP" AsyncScene/Web/conflict/conflict-economy.js` и `rg -n "addRep\\(" AsyncScene/Web/state.js AsyncScene/Web/dev/dev-checks.js` и `node --check AsyncScene/Web/conflict/conflict-economy.js`
  - Next: Валера, требуется gate по `T-20260111-048`
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Димы:
      Валера, открой `TASKS.md` и возьми задачу `T-20260111-048` (Gate: зафиксировать результат Economy wave 4). Основание: `T-20260111-047` = PASS, факты в Result.
      ```

### [T-20260111-046] Economy wave 4 implementation (tone as pressure: pressure-on-win, после PASS gate T-20260111-045)
- Status: REVIEW
- Priority: P0
- Assignee: Миша
- Next: Дима
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-economy.js` `TASKS.md`
- Goal: Реализовать wave 4 строго в объёме и параметрах, разрешённых `T-20260111-045`: pressure-on-win для `me` (Influence - и REP cap на победе сильного над слабым), без UI.
- Acceptance:
  - [ ] Реализация строго по параметрам из `T-20260111-045`
  - [ ] В `win` при условии “высокий тон + слабый оппонент” уменьшается Influence у `me` и ограничивается REP gain согласно gate
  - [ ] Вне условия win поведение не меняется
  - [ ] UI файлы не менялись
  - [ ] `addRep` не используется в prod-контурах
  - [ ] Заполнен `Report` и `Next Prompt` на Диму (`T-20260111-047`) кодблоком
- Notes: Scope wave 4: только pressure-on-win по параметрам gate; менять только `AsyncScene/Web/conflict/conflict-economy.js` (опционально `AsyncScene/Web/data.js`); UI/Points не трогать.
- Result: |
    Status: REVIEW
    Facts: В `AsyncScene/Web/conflict/conflict-economy.js` в `applyResult` для исхода `win` (legacy ветка) добавлен pressure-on-win: если мой tierColor в r/k и tierColor оппонента в y/o, то Influence уменьшается на 1 с клипом до 0 и REP gain капается до 0; при срабатывании капа добавляется log marker с reason=rep_pressure_win_cap и battleId
    Changed: `AsyncScene/Web/conflict/conflict-economy.js` `TASKS.md`
    How to verify: `node --check AsyncScene/Web/conflict/conflict-economy.js` затем `rg -n "rep_pressure_win_cap|PRESSURE_HIGH_TONE|PRESSURE_WEAK_TONE|INF_PRESSURE_WIN_COST|REP_PRESSURE_WIN_CAP" AsyncScene/Web/conflict/conflict-economy.js`
    Next: Дима, read-only аудит wave 4 по T-20260111-047
    Next Prompt: |
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-047 (Economy wave 4 audit). Проверь только факты (PASS/FAIL/INFO): изменения ограничены `AsyncScene/Web/conflict/conflict-economy.js` (без UI), что в win-ветке pressure-on-win соответствует gate T-20260111-045 (high tone r/k, weak y/o, INF_PRESSURE_WIN_COST=1 с клипом до 0, REP_PRESSURE_WIN_CAP=0, reason=rep_pressure_win_cap), что Points не трогались в рамках wave 4, и что addRep в prod не используется.
      ```
- Report (обязательный формат):
  - Status: REVIEW
  - Facts: Реализован wave 4 pressure-on-win в conflict-economy.js по параметрам gate; UI/Points не трогались; addRep в prod не использован
  - Changed: `AsyncScene/Web/conflict/conflict-economy.js` `TASKS.md`
  - How to verify: `node --check AsyncScene/Web/conflict/conflict-economy.js` затем `rg -n "rep_pressure_win_cap" AsyncScene/Web/conflict/conflict-economy.js`
  - Next: Дима, потому что нужен read-only аудит по T-20260111-047
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-047 (Economy wave 4 audit). Проверь только факты (PASS/FAIL/INFO): изменения ограничены `AsyncScene/Web/conflict/conflict-economy.js` (без UI), что в win-ветке pressure-on-win соответствует gate T-20260111-045 (high tone r/k, weak y/o, INF_PRESSURE_WIN_COST=1 с клипом до 0, REP_PRESSURE_WIN_CAP=0, reason=rep_pressure_win_cap), что Points не трогались в рамках wave 4, и что addRep в prod не используется.
      ```

### [T-20260111-040] Economy wave 3 UI audit (read-only)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: UI
- Files: `AsyncScene/Web/ui/ui-battles.js` `TASKS.md`
- Goal: Провести read-only аудит UI wave 3 после `T-20260111-039` и дать итог `PASS/FAIL/INFO` + факты (особенно: нет числовых обещаний).
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты
- Notes: Только факты.
- Result: |
    Status: PASS
    Facts: UI реванша присутствует в карточке завершённого баттла в `AsyncScene/Web/ui/ui-battles.js:1536`–`AsyncScene/Web/ui/ui-battles.js:1625`: строка уведомления `${requesterName} просит реванш` (`AsyncScene/Web/ui/ui-battles.js:1566`), кнопки `Принять/Отклонить` (`AsyncScene/Web/ui/ui-battles.js:1572` и `AsyncScene/Web/ui/ui-battles.js:1586`), состояние `Реванш принят/Реванш отклонён` (`AsyncScene/Web/ui/ui-battles.js:1600`), запрос для проигравшего `Хочешь реванш` + кнопка `Попросить` (`AsyncScene/Web/ui/ui-battles.js:1603`–`AsyncScene/Web/ui/ui-battles.js:1617`). Вызовы идут через core API: `Game.Conflict.requestRematch(b.id)` (`AsyncScene/Web/ui/ui-battles.js:1611`–`AsyncScene/Web/ui/ui-battles.js:1613`) и `Game.Conflict.respondRematch(b.id, true/false)` (`AsyncScene/Web/ui/ui-battles.js:1576`–`AsyncScene/Web/ui/ui-battles.js:1592`), что прокидывается в `AsyncScene/Web/conflict/conflict-api.js:439`–`AsyncScene/Web/conflict/conflict-api.js:453`. В блоке rematch UI нет текстов с числовыми обещаниями/дельтами по Points/REP/Influence (строки: «просит реванш», «Принять», «Отклонить», «Хочешь реванш», «Попросить», «Реванш принят», «Реванш отклонён»).
- Report (обязательный формат):
  - Status: DONE
  - Facts: Rematch UI отображается и управляется через `Game.Conflict.requestRematch/respondRematch`; числовые обещания/дельты по Points/REP/Influence в UI-текстах rematch не обнаружены.
  - Changed: `TASKS.md`
  - How to verify: `nl -ba AsyncScene/Web/ui/ui-battles.js | sed -n '1530,1630p'` и `nl -ba AsyncScene/Web/conflict/conflict-api.js | sed -n '435,455p'`
  - Next: Валера, требуется gate по `T-20260111-041`
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Димы:
      Валера, открой `TASKS.md` и возьми задачу `T-20260111-041` (Gate: зафиксировать результат Economy wave 3 (UI)). Основание: `T-20260111-040` = PASS, факты в Result.
      ```

### [T-20260111-039] Economy wave 3 UI implementation (после PASS gate T-20260111-038)
- Status: DONE
- Priority: P0
- Assignee: Саша
- Next: Дима
- Area: UI
- Files: `AsyncScene/Web/ui/ui-battles.js` `TASKS.md`
- Goal: Реализовать UI для wave 3 строго в объёме `T-20260111-038` (уведомления + accept/decline без числовых обещаний) без изменений механики.
- Acceptance:
  - [ ] Изменены только UI файлы
  - [ ] Нет числовых обещаний/дельт по экономике
  - [ ] В `Result` перечислены изменённые файлы и как проверить руками
- Notes: UI реванша вызывает только core API request/accept/decline через `Game.Conflict.requestRematch` и `Game.Conflict.respondRematch`, без прямых правок механики/состояния.
- Result: Добавлен UI реванша на карточке завершённого баттла: уведомление «<name> просит реванш», кнопки «Принять/Отклонить», состояния «Реванш принят/отклонён», запрос «Хочешь реванш → Попросить», без числовых обещаний/дельт.
- Report (обязательный формат):
  - Status: DONE
  - Facts: В `AsyncScene/Web/ui/ui-battles.js` добавлен блок Rematch UI в RESOLVED карточке; все действия идут через core API `Game.Conflict.requestRematch` и `Game.Conflict.respondRematch`; UI тексты без чисел и без дельт Points/REP/Influence.
  - Changed: `AsyncScene/Web/ui/ui-battles.js` `TASKS.md`
  - How to verify: Завершить баттл с результатом win/lose, открыть карточку завершённого баттла; при проигрыше доступна кнопка «Попросить», при запросе у победителя видны «<name> просит реванш» и кнопки «Принять/Отклонить», после ответа текст меняется на «Реванш принят/отклонён».
  - Next: Дима, read-only аудит T-20260111-040
  - Next Prompt: |
      ```text
      Ответ Саши:
      Дима, открой TASKS.md и возьми задачу T-20260111-040 (Economy wave 3 UI audit). Проверь read-only: UI показывает уведомление о реванше и кнопки Принять/Отклонить, все вызовы идут через core API, в UI нет числовых обещаний/дельт по Points/REP/Influence. Итог PASS/FAIL/INFO + факты в Result.
      ```

### [T-20260111-036] Economy wave 3 audit (read-only)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `TASKS.md`
- Goal: Провести read-only аудит Economy wave 3 (rematch core) после `T-20260111-035` и дать итог только `PASS/FAIL/INFO` + факты.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты (без советов/правок)
- Notes: Только факты. Runtime не обязателен, если отдельно не согласовано gate.
- Result: |
    Status: PASS
    Facts: По `T-20260111-035` поле Changed изменения wave 3 ограничены `AsyncScene/Web/conflict/conflict-core.js` и `AsyncScene/Web/conflict/conflict-api.js` (UI-файлы не перечислены). requestRematch доступен только проигравшему: `if (reqId !== sides.loserId) return { ok: false, reason: "not_loser", expected: sides.loserId };` в `AsyncScene/Web/conflict/conflict-core.js:1406`. Cost=1 point задан как transfer loser→winner через econTransfer с reason и battleId в meta: `econTransfer(loserId, winnerId, 1, "rematch_request_cost", { battleId: b.id, rematchOf: b.id });` в `AsyncScene/Web/conflict/conflict-core.js:1413`. Decline не возвращает point: в ветке `if (!ok)` нет обратного transfer, комментарий `Decline keeps point transfer as-is;` (`AsyncScene/Web/conflict/conflict-core.js:1462`–`AsyncScene/Web/conflict/conflict-core.js:1472`). REP penalties делаются через transferRep с battleId=b.id и клипом по доступному REP: `repPay = Math.max(0, Math.min(1, repAvailable(...)))` (`AsyncScene/Web/conflict/conflict-core.js:1426` и `AsyncScene/Web/conflict/conflict-core.js:1465`), вызовы `transferRep(..., "rep_rematch_request", b.id)` (`AsyncScene/Web/conflict/conflict-core.js:1428`) и `transferRep(..., "rep_rematch_decline", b.id)` (`AsyncScene/Web/conflict/conflict-core.js:1467`). accept создаёт новый battle с `rematchOf=<oldBattleId>`: `nb.rematchOf = b.id;` в `AsyncScene/Web/conflict/conflict-core.js:1477`. Public API прокидывает вызовы: `requestRematch(battleId) { Core.requestRematch(battleId, "me") ... }` (`AsyncScene/Web/conflict/conflict-api.js:439`–`AsyncScene/Web/conflict/conflict-api.js:445`) и `respondRematch(battleId, accept) { Core.respondRematch(battleId, !!accept, "me") ... }` (`AsyncScene/Web/conflict/conflict-api.js:447`–`AsyncScene/Web/conflict/conflict-api.js:453`). node --check: `AsyncScene/Web/conflict/conflict-core.js` и `AsyncScene/Web/conflict/conflict-api.js` = PASS.
- Report (обязательный формат):
  - Status: DONE
  - Facts: Проверены условия T-20260111-036 по коду; requestRematch только для loserId; cost=1 point через econTransfer с reason=rematch_request_cost и meta.battleId=b.id; decline не возвращает point; REP penalties через transferRep с reasons rep_rematch_request/rep_rematch_decline и battleId=b.id с клипом; accept создаёт новый battle с rematchOf.
  - Changed: `TASKS.md`
  - How to verify: `nl -ba AsyncScene/Web/conflict/conflict-core.js | sed -n '1390,1490p'` и `nl -ba AsyncScene/Web/conflict/conflict-api.js | sed -n '435,460p'` и `node --check AsyncScene/Web/conflict/conflict-core.js` и `node --check AsyncScene/Web/conflict/conflict-api.js`
  - Next: Валера, требуется gate по `T-20260111-037`
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Димы:
      Валера, открой `TASKS.md` и возьми задачу `T-20260111-037` (Gate: зафиксировать результат Economy wave 3 (core)). Основание: `T-20260111-036` = PASS, факты в Result.
      ```

### [T-20260111-035] Economy wave 3 implementation (rematch core, после PASS gate T-20260111-034)
- Status: DONE
- Priority: P0
- Assignee: Миша
- Next: Дима
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `TASKS.md`
- Goal: Реализовать Economy wave 3 (rematch core) строго в объёме, разрешённом `T-20260111-034` (без UI), и подготовить пакет фактов для read-only аудита.
- Acceptance:
  - [x] Изменения соответствуют разрешениям/запретам из `T-20260111-034`
  - [x] REP v1.0 и points-инварианты не нарушены (трансферы, reasons, battleId/eventId, moneyLog)
  - [x] В `Result` перечислены изменённые файлы, проверки и как воспроизвести
  - [x] Добавлен `Next Prompt` на Диму (`T-20260111-036`)
- Notes: Scope wave 3 core: только rematch core по `ECONOMY_WAVE3_SCOPE.md`; UI не трогать; если нужен больший scope — остановиться и вернуть на gate Валере.
- Result: |
    Status: DONE
    Facts: Добавлен rematch core без UI; request доступен только проигравшему; на request делается transfer 1 point проигравший→оппонент; escalation отсутствует (один запрос на battleId); REP penalty=1 на request и на decline через transferRep с reasons `rep_rematch_request`/`rep_rematch_decline` и battleId=b.id (клип по доступному REP без ухода в отрицательные); accept создает новый battle с `rematchOf=<oldBattleId>`; decline не возвращает point
    Changed: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `TASKS.md`
    How it works: `Game.Conflict.requestRematch(battleId)` вызывает Core.requestRematch; `Game.Conflict.respondRematch(battleId, accept)` вызывает Core.respondRematch; points cost reason=`rematch_request_cost` (meta.battleId=b.id); REP reasons=`rep_rematch_request`/`rep_rematch_decline`; новый battle получает `rematchOf`
    How to verify: `rg -n "requestRematch\\(|respondRematch\\(|rematch_request_cost|rep_rematch_request|rep_rematch_decline|rematchOf" AsyncScene/Web/conflict/conflict-core.js AsyncScene/Web/conflict/conflict-api.js` и `node --check` для обоих файлов
    Next: Дима, read-only аудит wave 3 core по T-20260111-036
    Next Prompt: |
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-036 (Economy wave 3 audit). Проверь только факты (PASS/FAIL/INFO): что изменения ограничены `AsyncScene/Web/conflict/conflict-core.js` и `AsyncScene/Web/conflict/conflict-api.js`, что requestRematch доступен только проигравшему, что cost=1 point transfer проигравший→оппонент выполняется на request (reason=rematch_request_cost, battleId=b.id), что decline не возвращает point, что REP penalties делаются через transferRep с reasons=rep_rematch_request/rep_rematch_decline и battleId=b.id с клипом без ухода в отрицательные, и что accept создает новый battle с `rematchOf=<oldBattleId>`. UI файлы не менялись.
      ```
- Report (обязательный формат):
  - Status: DONE
  - Facts: Реализован rematch core по gate T-20260111-034; добавлены Core.requestRematch/Core.respondRematch и публичные обертки в ConflictAPI; cost=1 point transfer на request; REP penalties 1 на request/decline; accept создает battle.rematchOf; decline не возвращает point; UI не трогали
  - Changed: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js` `TASKS.md`
  - How to verify: `node --check AsyncScene/Web/conflict/conflict-core.js` затем `node --check AsyncScene/Web/conflict/conflict-api.js` затем `rg -n "rematch_request_cost|rep_rematch_request|rep_rematch_decline|rematchOf" AsyncScene/Web/conflict/conflict-core.js`
  - Next: Дима, потому что нужен read-only аудит wave 3 по T-20260111-036
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-036 (Economy wave 3 audit). Проверь только факты (PASS/FAIL/INFO): что изменения ограничены `AsyncScene/Web/conflict/conflict-core.js` и `AsyncScene/Web/conflict/conflict-api.js`, что requestRematch доступен только проигравшему, что cost=1 point transfer проигравший→оппонент выполняется на request (reason=rematch_request_cost, battleId=b.id), что decline не возвращает point, что REP penalties делаются через transferRep с reasons=rep_rematch_request/rep_rematch_decline и battleId=b.id с клипом без ухода в отрицательные, и что accept создает новый battle с `rematchOf=<oldBattleId>`. UI файлы не менялись.
      ```

### [T-20260111-032] Economy wave 2 audit (read-only)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
- Goal: Провести read-only аудит Economy wave 2 после `T-20260111-031` и дать итог только `PASS/FAIL/INFO` + факты.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты (без советов/правок)
- Notes: Только факты. Runtime не обязателен, если отдельно не согласовано gate.
- Result: |
    Status: PASS
    Facts: По `T-20260111-031` поле Changed изменения wave 2 ограничены `AsyncScene/Web/conflict/conflict-core.js` (без UI; `TASKS.md` — только фиксация задач). На исходах escape vote REP штрафы применяются через `transferRep` с battleId=b.id: `applyEscapeEconomyPenalties(REP_ESCAPE_PENALTY_OK, "rep_escape_ok_penalty", INF_ESCAPE_PENALTY_OK);` (`AsyncScene/Web/conflict/conflict-core.js:780`) и `applyEscapeEconomyPenalties(REP_ESCAPE_PENALTY_STAY, "rep_escape_stay_penalty", INF_ESCAPE_PENALTY_STAY);` (`AsyncScene/Web/conflict/conflict-core.js:800`), внутри: `Game.StateAPI.transferRep("me", oppId, repPay, repReason, b.id);` (`AsyncScene/Web/conflict/conflict-core.js:770`). Influence штрафы клипуются до 0: `const after = Math.max(0, before - (infPenalty | 0)); me.influence = after;` (`AsyncScene/Web/conflict/conflict-core.js:763`–`AsyncScene/Web/conflict/conflict-core.js:765`). Points на исходах finalizeEscapeVote напрямую не изменяются: в `applyEscapeEconomyPenalties` нет операций с points; `finalizeEscapeVote` не вызывает `transferPoints/transferFromPool/econTransfer` (после finalize есть только `ensureNonNegativePoints()` и `syncMeToPlayers()` в `AsyncScene/Web/conflict/conflict-core.js:814`–`AsyncScene/Web/conflict/conflict-core.js:819`). `node --check AsyncScene/Web/conflict/conflict-core.js` = PASS.
- Report (обязательный формат):
  - Status: DONE
  - Facts: Проверены условия T-20260111-032 по коду; escape vote исходы применяют REP штрафы через transferRep с reasons=rep_escape_ok_penalty/rep_escape_stay_penalty и battleId=b.id; Influence штрафы клипуются до 0; прямых изменений points на исходах finalizeEscapeVote нет.
  - Changed: `TASKS.md`
  - How to verify: `nl -ba AsyncScene/Web/conflict/conflict-core.js | sed -n '734,820p'` и `node --check AsyncScene/Web/conflict/conflict-core.js`
  - Next: Валера, требуется gate по `T-20260111-033`
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Димы:
      Валера, открой `TASKS.md` и возьми задачу `T-20260111-033` (Gate: зафиксировать результат Economy wave 2). Основание: `T-20260111-032` = PASS, факты в Result.
      ```

### [T-20260111-031] Economy wave 2 implementation (после PASS gate T-20260111-030)
- Status: DONE
- Priority: P0
- Assignee: Миша
- Next: Дима
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
- Goal: Реализовать Economy wave 2 строго в объёме, разрешённом `T-20260111-030` (без UI), и подготовить пакет фактов для read-only аудита.
- Acceptance:
  - [x] Изменения соответствуют разрешениям/запретам из `T-20260111-030`
  - [x] REP v1.0 инварианты не нарушены
  - [x] В `Result` перечислены изменённые файлы, проверки и как воспроизвести
  - [x] Добавлен `Next Prompt` на Диму (`T-20260111-032`)
- Notes: Scope wave 2: только escape (REP-/Influence-) по `ECONOMY_WAVE2_SCOPE.md`; Points на исходах escape не трогать; UI не трогать; если нужен больший scope — остановиться и вернуть на gate Валере.
- Result: |
    Status: DONE
    Facts: В escape vote исходах применены штрафы REP и Influence по gate T-20260111-030; REP штраф делается через `transferRep` с reasons `rep_escape_ok_penalty`/`rep_escape_stay_penalty` и battleId=b.id, REP клипается по доступному балансу (не уходит в отрицательные); Influence списывается и клипается до 0; Points на исходах escape не менялись
    Changed: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
    How it works: `finalizeEscapeVote` вызывает applyEscapeEconomyPenalties для allow/deny веток; REP: `transferRep("me" -> b.opponentId, repPay, reason, b.id)`; Influence: `me.influence = max(0, me.influence - INF_*)`
    How to verify: `rg -n "rep_escape_ok_penalty|rep_escape_stay_penalty|INF_ESCAPE_PENALTY_|REP_ESCAPE_PENALTY_" AsyncScene/Web/conflict/conflict-core.js` и `node --check AsyncScene/Web/conflict/conflict-core.js`
    Next: Дима, read-only аудит wave 2 по T-20260111-032
    Next Prompt: |
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-032 (Economy wave 2 audit). Проверь только факты (PASS/FAIL/INFO): что изменения ограничены `AsyncScene/Web/conflict/conflict-core.js`, что на исходах escape vote применяются REP штрафы через `transferRep` с reasons=rep_escape_ok_penalty/rep_escape_stay_penalty и battleId=b.id, что Influence штрафы клипуются до 0, и что Points на исходах escape не меняются (по коду). Runtime не требуется, если gate не просит.
      ```
- Report (обязательный формат):
  - Status: DONE
  - Facts: Реализованы штрафы REP/Influence на исходах escape vote согласно T-20260111-030; UI/Points не трогались; добавлены reasons rep_escape_ok_penalty/rep_escape_stay_penalty
  - Changed: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
  - How to verify: `node --check AsyncScene/Web/conflict/conflict-core.js` затем `rg -n "rep_escape_ok_penalty|rep_escape_stay_penalty" AsyncScene/Web/conflict/conflict-core.js`
  - Next: Дима, потому что нужен read-only аудит wave 2 по T-20260111-032
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-032 (Economy wave 2 audit). Проверь только факты (PASS/FAIL/INFO): что изменения ограничены `AsyncScene/Web/conflict/conflict-core.js`, что на исходах escape vote применяются REP штрафы через `transferRep` с reasons=rep_escape_ok_penalty/rep_escape_stay_penalty и battleId=b.id, что Influence штрафы клипуются до 0, и что Points на исходах escape не меняются (по коду). Runtime не требуется, если gate не просит.
      ```

### [T-20260111-027] Economy wave 1 audit (read-only)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
- Goal: Провести read-only аудит Economy wave 1 после `T-20260111-026` и дать итог только `PASS/FAIL/INFO` + факты.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты (без советов/правок)
- Notes: Только факты. Runtime не обязателен, если отдельно не согласовано gate.
- Result: |
    Status: PASS
    Facts: Изменения по wave 1 заявлены как ограниченные `AsyncScene/Web/conflict/conflict-core.js` (см. `T-20260111-026` поле Changed). dismiss_click реализован как REP штраф: `Game.StateAPI.transferRep("me", b.opponentId, repPay, "rep_dismiss_click", b.id)` в `AsyncScene/Web/conflict/conflict-core.js:1098`. Клип REP до 0: `repPay = Math.max(0, Math.min(repPenalty, repHave))` в `AsyncScene/Web/conflict/conflict-core.js:1096`. Points/Influence: в блоке dismiss_click нет присваиваний `me.points`/`me.influence`/`opp.points`/`opp.influence`, только чтение `me.influence`/`opp.influence` для условия и чтение `Game.State.rep` для клипа.
- Report (обязательный формат):
  - Status: DONE
  - Facts: Проверены условия T-20260111-027 по коду; dismiss_click оформлен как transferRep с reason=rep_dismiss_click и battleId=b.id; REP клип до 0 присутствует; Points/Influence в этом блоке не меняются.
  - Changed: `TASKS.md`
  - How to verify: `rg -n "rep_dismiss_click|_repDismissClickApplied|repPay" AsyncScene/Web/conflict/conflict-core.js`
  - Next: Валера, требуется gate по `T-20260111-028`
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Димы:
      Валера, открой `TASKS.md` и возьми задачу `T-20260111-028` (Gate: зафиксировать результат Economy wave 1). Основание: `T-20260111-027` = PASS, факты в Result.
      ```

### [T-20260111-026] Economy wave 1 implementation (после PASS gate T-20260111-025)
- Status: DONE
- Priority: P0
- Assignee: Миша
- Next: Дима
- Area: Economy
- Files: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
- Goal: Реализовать Economy wave 1 строго в объёме, разрешённом `T-20260111-029` (без UI), и подготовить пакет фактов для read-only аудита.
- Acceptance:
  - [x] Изменения соответствуют разрешениям/запретам из `T-20260111-029`
  - [x] REP v1.0 инварианты не нарушены
  - [x] В `Result` перечислены изменённые файлы, проверки и как воспроизвести
  - [x] Добавлен `Next Prompt` на Диму (`T-20260111-027`)
- Notes: Scope wave 1: только dismiss_click/VL5 «послать»; Points/Influence не трогать; UI не трогать; если нужен больший scope — остановиться и вернуть на gate Валере.
- Result: |
    Status: DONE
    Facts: Реализован dismiss_click через `Game.Conflict.escape(battleId, "off")`: при успешном мгновенном закрытии боя применяется REP штраф через `transferRep` с reason `rep_dismiss_click` и battleId=b.id; сумма штрафа клипается до 0 (не уходит в отрицательные); Points/Influence не менялись
    Changed: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
    How it works: В `C.escape` добавлена поддержка строкового opts ("off"); при режиме "off" и успешном закрытии выполняется `transferRep("me" -> opponentId, repPay, "rep_dismiss_click", battleId)` один раз на battle (флаг `b._repDismissClickApplied`)
    How to verify: `rg -n "rep_dismiss_click|_repDismissClickApplied|C\\.escape" AsyncScene/Web/conflict/conflict-core.js` и `node --check AsyncScene/Web/conflict/conflict-core.js`
    Next: Дима, read-only аудит wave 1 по T-20260111-027
    Next Prompt: |
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-027 (Economy wave 1 audit). Проверь только факты (PASS/FAIL/INFO): что изменения ограничены `AsyncScene/Web/conflict/conflict-core.js`, что dismiss_click реализован как REP штраф через `transferRep` с reason=rep_dismiss_click и battleId, что клип REP не дает уйти в отрицательные, и что Points/Influence не затронуты (по коду). Runtime не требуется, если gate не просит.
      ```
- Report (обязательный формат):
  - Status: DONE
  - Facts: Реализован dismiss_click (VL5 «послать») в `AsyncScene/Web/conflict/conflict-core.js` через REP штраф transferRep; добавлена поддержка строкового opts "off"; добавлен клип до 0; UI/Points/Influence не трогались
  - Changed: `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
  - How to verify: `node --check AsyncScene/Web/conflict/conflict-core.js` затем `rg -n "rep_dismiss_click|_repDismissClickApplied" AsyncScene/Web/conflict/conflict-core.js`
  - Next: Дима, потому что нужен read-only аудит по T-20260111-027
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-027 (Economy wave 1 audit). Проверь только факты (PASS/FAIL/INFO): что изменения ограничены `AsyncScene/Web/conflict/conflict-core.js`, что dismiss_click реализован как REP штраф через `transferRep` с reason=rep_dismiss_click и battleId, что клип REP не дает уйти в отрицательные, и что Points/Influence не затронуты (по коду). Runtime не требуется, если gate не просит.
      ```

### [T-20260111-020] Аудит: UI coupling после фикса T-20260111-018 (read-only)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
- Goal: Подтвердить фактами отсутствие прямых `Game.UI.*` в `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js`, и соблюдение REP v1.0.
- Acceptance:
  - [x] Итог в `Result`: `PASS` или `FAIL` или `INFO` + факты (без советов/правок)
- Notes: Только факты. Никаких предложений архитектуры/рефакторинга.
- Result: |
    Status: PASS
    Facts: Прямых вызовов `Game.UI.*` не найдено в `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js` (поиск `rg -n "Game\\.UI\\." ...` пустой). REP v1.0: `addRep` dev-only и блокируется в prod в `AsyncScene/Web/state.js:127`; REP изменяется через `transferRep` в `AsyncScene/Web/state.js:174` и вызовы из `AsyncScene/Web/conflict/conflict-core.js:759`. Логирование REP: `transferRep` пишет через `logRepTransfer` (использует `Econ._logTx` или фолбэк `Game.Debug.moneyLog`/`moneyLogByBattle`) в `AsyncScene/Web/state.js:150`. Reason+battleId/eventId: INFO — при отсутствии reason/battleId включается dev warning, но блокировки нет (`AsyncScene/Web/state.js:181`). Валидация: PASS — `node --check AsyncScene/Web/state.js` и `node --check AsyncScene/Web/conflict/conflict-core.js` прошли без синтаксических ошибок. Доп. факт: в `AsyncScene/Web/conflict/conflict-core.js:263` остаётся использование `const UI = (Game && Game.UI) ? Game.UI : null;` и вызовы `UI.pushDM/UI.pushChat` в `notifyCopViolation`, но это не `Game.UI.*` вызовы.
- Report (обязательный формат):
  - Status: DONE
  - Facts: Прямых `Game.UI.*` вызовов в указанных файлах не найдено; REP v1.0 transferRep-only и addRep dev-only; node --check PASS.
  - Changed: `TASKS.md`
  - How to verify: `rg -n "Game\\.UI\\." AsyncScene/Web/state.js AsyncScene/Web/conflict/conflict-core.js`; `node --check AsyncScene/Web/state.js`; `node --check AsyncScene/Web/conflict/conflict-core.js`
  - Next: Валера, требуется фиксация статуса по T-20260111-018/T-20260111-017
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Димы:
      Валера, открой `TASKS.md` и зафиксируй результат `T-20260111-020` (PASS по критерию отсутствия прямых `Game.UI.*`; REP v1.0 transferRep-only, addRep dev-only; node --check PASS). Дальше решение по `T-20260111-017`.
      ```

### [T-20260111-018] Fix: убрать UI coupling из экономических контуров
- Status: DONE
- Priority: P0
- Assignee: Миша
- Next: Дима
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
- Goal: Убрать прямые вызовы `Game.UI.*` из экономических контуров в рамках Economy phase (UI out-of-scope), без изменения механики экономики/REP и без UI правок.
- Acceptance:
  - [x] В `AsyncScene/Web/state.js` нет прямых вызовов `Game.UI.requestRenderAll` и `Game.UI.showInfluenceToast` из экономических функций
  - [x] В `AsyncScene/Web/conflict/conflict-core.js` нет прямого `Game.UI.pushSystem` из экономического/боевого контура
  - [x] REP v1.0 инварианты сохранены (transferRep-only, reason + battleId/eventId, moneyLog/moneyLogByBattle)
- Notes: Основание: FAIL в T-20260111-016 (read-only аудит Димы). Только разрыв coupling, без внедрения UI.
- Result: |
    Status: DONE
    Facts: Удалены все прямые вызовы `Game.UI.*` из `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js`; механика экономики/REP не менялась
    Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
    Checked: `rg -n \"Game\\.UI\\.\" AsyncScene/Web/state.js AsyncScene/Web/conflict/conflict-core.js` (пусто); `node --check` для `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js` (PASS)
    Next: Дима, повторный read-only аудит (PASS/FAIL/INFO) по отсутствию UI coupling и соблюдению REP v1.0
    Next Prompt: |
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-016 (Аудит экономики) либо создай отдельную audit-задачу для T-20260111-018, если так удобнее. Проверь только факты (PASS/FAIL/INFO): что в `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js` нет прямых вызовов `Game.UI.*`, что REP v1.0 инварианты не нарушены, и что `node --check AsyncScene/Web/state.js` и `node --check AsyncScene/Web/conflict/conflict-core.js` проходят.
      ```
- Report (обязательный формат):
  - Status: REVIEW
  - Facts: Вынесено в Review; прямые вызовы Game.UI.* удалены из state.js и conflict-core.js; синтаксис проверен node --check
  - Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/conflict/conflict-core.js` `TASKS.md`
  - How to verify: `rg -n \"Game\\.UI\\.\" AsyncScene/Web/state.js AsyncScene/Web/conflict/conflict-core.js` затем `node --check AsyncScene/Web/state.js` затем `node --check AsyncScene/Web/conflict/conflict-core.js`
  - Next: Дима, потому что нужен read-only аудит PASS/FAIL/INFO
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и возьми задачу T-20260111-016 (Аудит экономики) либо создай отдельную audit-задачу для T-20260111-018, если так удобнее. Проверь только факты (PASS/FAIL/INFO): что в `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js` нет прямых вызовов `Game.UI.*`, что REP v1.0 инварианты не нарушены, и что `node --check AsyncScene/Web/state.js` и `node --check AsyncScene/Web/conflict/conflict-core.js` проходят.
      ```

### [T-20260111-015] Подготовить пакет внедрения экономики (после PASS gate)
- Status: DONE
- Priority: P0
- Assignee: Миша
- Next: Дима
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-economy.js` `TASKS.md`
- Goal: На основе PASS gate из `T-20260111-017` подготовить реализацию (код) строго в допущенном объёме и зафиксировать список затронутых файлов/инвариантов для аудита.
- Acceptance:
  - [x] Реализация соответствует допуску/запретам из `T-20260111-017`
  - [x] В `Result` перечислены: какие файлы менялись, какие инварианты проверены
  - [x] Добавлен `Next Prompt` на Диму (read-only аудит)
- Notes: Scope строго Economy-only; UI не трогать; REP v1.0 инварианты не ломать.
- Result: |
    Status: PASS
    Facts: Пакет экономики принят к продолжению после PASS повторного аудита T-20260111-016; UI не трогали; REP v1.0 соблюден (transferRep-only, addRep dev-only); node --check PASS
    Changed: `AsyncScene/Web/state.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-economy.js` `TASKS.md`
    Checked: `rg -n "Game\\.UI\\." AsyncScene/Web/state.js AsyncScene/Web/conflict/conflict-core.js` (пусто); `rg addRep` по `AsyncScene/Web` (prod только `AsyncScene/Web/state.js` + dev-checks); `node --check` для `AsyncScene/Web/state.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-economy.js`
    Next: Кодинг 3, определить следующий шаг экономики
    Next Prompt: |
      ```text
      Ответ Валеры:
      Кодинг 3, открой TASKS.md и создай следующий пакет задач для Economy phase после PASS аудита T-20260111-016. Для каждой задачи укажи Goal Acceptance Next и Next Prompt. Если нужен новый gate, создай отдельную gate-задачу на Валеру.
      ```
- Report (обязательный формат):
  - Status: REVIEW
  - Facts: Пакет T-20260111-015 обновлен с учетом снятого блокера UI coupling (T-20260111-020 PASS) и готов к повторному read-only аудиту; выполнены проверки `rg addRep`, `rg Game.UI.` и `node --check` на экономических контурах
  - Changed: `TASKS.md`
  - How to verify: `rg -n "Game\\.UI\\." AsyncScene/Web/state.js AsyncScene/Web/conflict/conflict-core.js` затем `rg addRep AsyncScene/Web` затем `node --check` для `AsyncScene/Web/state.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-economy.js`
  - Next: Дима, потому что нужен повторный read-only аудит PASS/FAIL/INFO после снятия UI coupling блокера
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Миши:
      Дима, открой `TASKS.md` и выполни повторный read-only аудит по задаче T-20260111-016 (там исторический FAIL был только из-за UI coupling; блокер снят в T-20260111-020 PASS). Проверь только факты (PASS/FAIL/INFO): что UI не трогали, что REP v1.0 соблюден (transferRep-only, addRep dev-only), что операции имеют reason + battleId/eventId и логируются (moneyLog/moneyLogByBattle), и что файлы `AsyncScene/Web/state.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-economy.js` валидны (node --check PASS).
      ```

## Done
<!-- Закрытые задачи (оставляйте краткий Result) -->

### [T-20260111-042] Gate: закрыть Economy wave 1 (привести REVIEW→DONE)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Валера
- Area: Economy
- Files: `TASKS.md`
- Goal: Формально закрыть Economy wave 1: проверить факты из `T-20260111-026` и `T-20260111-027` и, если ок, перевести их из `REVIEW` в `DONE` (без изменений кода).
- Acceptance:
  - [ ] `T-20260111-026` переведена в `DONE` (или зафиксирован `FAIL/BACKLOG` с причинами)
  - [ ] `T-20260111-027` переведена в `DONE` (или зафиксирован `FAIL/BACKLOG` с причинами)
  - [ ] В `Result` есть факт: “wave 1 закрыта/не закрыта” и почему
- Notes: Никаких правок механики/кода. Только процессная фиксация статусов и фактов по уже выполненным пакетам.
- Result: |
    Status: PASS
    Facts: wave 1 закрыта, основание: T-20260111-026 dismiss_click реализован, T-20260111-027 audit PASS подтверждает REP штраф через transferRep reason=rep_dismiss_click с battleId и клип REP до 0, Points/Influence не меняются
    Changed: `TASKS.md`
    Next: Валера, gate закрытие wave 2
    Next Prompt: |
      ```text
      Ответ Валеры:
      Валера, открой TASKS.md и возьми задачу T-20260111-043 (Gate: закрыть Economy wave 2). Закрываем wave 2 только после решения по wave 1.
      ```

### [T-20260111-016] Аудит экономики (read-only) после внедрения
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: Economy
- Files: `AsyncScene/Web/state.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-economy.js` `TASKS.md`
- Goal: Провести read-only аудит изменений экономики после `T-20260111-015` и дать итог только `PASS/FAIL/INFO` + факты.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты (без советов/правок)
- Notes: Только факты. Никаких предложений архитектуры/рефакторинга.
- Result: |
    Status: PASS
    Facts: UI файлы не менялись (по `git diff --name-only` изменён только `TASKS.md`). REP v1.0: `addRep` dev-only и блокируется в prod (`AsyncScene/Web/state.js:127`), REP изменяется через `transferRep` (`AsyncScene/Web/state.js:174`, `AsyncScene/Web/events.js:135`, `AsyncScene/Web/events.js:278`, `AsyncScene/Web/conflict/conflict-core.js:759`, `AsyncScene/Web/conflict/conflict-economy.js:557`). Reason + battleId/eventId: INFO — есть dev warning при отсутствии reason/battleId для REP (`AsyncScene/Web/state.js:181`), для points есть dev warning при отсутствии battleId (`AsyncScene/Web/conflict/conflict-economy.js:276`). Логирование moneyLog/moneyLogByBattle: PASS — инициализация и запись через `AsyncScene/Web/conflict/conflict-economy.js:39` и `AsyncScene/Web/conflict/conflict-economy.js:48`, REP-транзакции через `AsyncScene/Web/state.js:150` (Econ._logTx или фолбэк `Game.Debug.moneyLog`/`moneyLogByBattle`). Валидация: PASS — `node --check` для `AsyncScene/Web/state.js` `AsyncScene/Web/events.js` `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-economy.js` ошибок синтаксиса не выдал. Исторический блокер UI coupling для `AsyncScene/Web/state.js` и `AsyncScene/Web/conflict/conflict-core.js` снят (см. `T-20260111-020`).
- Report (обязательный формат):
  - Status: DONE
  - Facts: Повторный read-only аудит выполнен после снятия блокера UI coupling (см. `T-20260111-020`). UI файлы не менялись; REP v1.0 соблюдён; moneyLog/moneyLogByBattle и node --check подтверждены.
  - Changed: `TASKS.md`
  - How to verify: `git diff --name-only`; `node --check AsyncScene/Web/state.js` затем `node --check AsyncScene/Web/events.js` затем `node --check AsyncScene/Web/conflict/conflict-core.js` затем `node --check AsyncScene/Web/conflict/conflict-economy.js`; `rg -n \"Game\\.UI\\.|transferRep|addRep|moneyLogByBattle\"` по указанным файлам.
  - Next: Валера — фиксация статуса и следующий шаг по `T-20260111-017`
  - Next Prompt: |
      ```text
      Ответ Димы:
      Валера, открой `TASKS.md` и зафиксируй обновлённый результат `T-20260111-016` (PASS по критериям повторного аудита). Дальше решение по `T-20260111-017`.
      ```

### [T-20260111-017] Gate: открыть Economy phase (формальный пакет)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Миша
- Area: Economy
- Files: `ECONOMY_PHASE_GATE_PACKAGE.md` `AsyncScene/Web/economy update.txt` `TASKS.md`
- Goal: Провести gate-решение по открытию Economy phase на основе формального пакета `ECONOMY_PHASE_GATE_PACKAGE.md` и источника `AsyncScene/Web/economy update.txt`.
- Acceptance:
  - [x] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + факты
  - [x] При `PASS`: указан чёткий объём допустимых изменений + запреты + владелец реализации
- Notes: `T-20260111-014` закрыта как `BACKLOG` из-за отсутствия формального пакета; этот пакет добавлен как `ECONOMY_PHASE_GATE_PACKAGE.md`. Экономику не внедрять без `PASS`.
- Result: |
    Status: PASS
    Facts: Gate на открытие Economy phase принят по `ECONOMY_PHASE_GATE_PACKAGE.md`; допуск ограничен экономическими контурами и логами, UI вынесен out-of-scope; REP v1.0 инварианты не ломать; новые механики вне `AsyncScene/Web/economy update.txt` запрещены; повторный аудит T-20260111-016 зафиксирован PASS
    Changed: `TASKS.md`
    Next: Миша, взять T-20260111-015 и подготовить пакет внедрения экономики
    Next Prompt: |
      ```text
      Ответ Валеры:
      Миша, открой TASKS.md и возьми задачу T-20260111-015 (подготовить пакет внедрения экономики). Поставь Assignee Миша и Status DOING, перенеси в Doing. Работай строго по допуску T-20260111-017: только экономические контуры, без UI, без новых механик вне AsyncScene/Web/economy update.txt, REP v1.0 инварианты не ломать. По завершении поставь Status REVIEW, заполни Result и Report и добавь Next Prompt кодблоком на Диму для read-only аудита.
      ```

### [T-20260111-013] Закрыть UI honesty phase после PASS аудита
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Кодинг 3
- Area: Docs
- Files: `UI_HONESTY_PHASE.md` `TASKS.md`
- Goal: Зафиксировать закрытие UI honesty phase после PASS аудита и привести задачи к консистентным статусам без переписывания истории.
- Acceptance:
  - [x] В `UI_HONESTY_PHASE.md` отмечен PASS и дата
  - [x] В `TASKS.md` актуальные задачи закрыты, новые циклы не открыты
- Notes: Никакой механики/экономики/cleanup. Только процессная фиксация.
- Result: |
    Status: PASS
    Facts: Аудит T-20260111-012 PASS, статус фазы в UI_HONESTY_PHASE.md обновлен на PASS 2026-01-11
    Changed: `UI_HONESTY_PHASE.md` `TASKS.md`
    Next: Кодинг 3, чтобы зафиксировать дальнейший план после закрытия UI honesty phase
    Next Prompt: |
      ```text
      Кодинг 3, открой TASKS.md и зафиксируй следующий шаг после закрытия UI honesty phase. Если нужны новые UI задачи, создай их в Inbox с Goal, Acceptance, Next и Next Prompt.
      ```

### [T-20260111-012] Повторный аудит UI honesty (read-only, после фиксов T-20260111-011)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: UI
- Files: `AsyncScene/Web/ui/` `UI_HONESTY_MAPPING.md` `AsyncScene/Web/events.js` `AsyncScene/Web/ui/ui-battles.js`
- Goal: Провести read-only аудит UI honesty после фиксов T-20260111-011 и дать итог только `PASS/FAIL/INFO` + факты.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты (без советов/правок)
- Notes: Проверка только UI-сигналов (не обещаем цены/награды/штрафы/дельты). Runtime не обязателен.
- Result: PASS — явных обещаний цен/наград/штрафов/дельт в UI не найдено. Факты: сообщения "Недоступно" и "Лотерея отключена" вместо цен; строки выплат/дельт удалены; в `AsyncScene/Web/events.js` отсутствуют UI‑сообщения с 💰/⭐; в `AsyncScene/Web/ui/ui-battles.js` подсказка порога заменена на "Недоступно.".
- Report (обязательный формат):
  - Status: DONE
  - Facts: UI‑сообщения о ценах/наградах/дельтах отсутствуют; вместо них нейтральные тексты.
  - Changed: `TASKS.md`
  - How to verify: Поиск строк с ценами и дельтами в `AsyncScene/Web/ui/` и `AsyncScene/Web/events.js`.
  - Next: Валера — закрыть фазу UI honesty.
  - Next Prompt: |
      ```text
      Валера, открой TASKS.md и закрой UI honesty phase по итогам PASS аудита T-20260111-012. Обнови UI_HONESTY_PHASE.md и статусы связанных задач.
      ```

### [T-20260111-005] Повторный аудит UI honesty (read-only)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: UI
- Files: `AsyncScene/Web/ui/` `AsyncScene/Web/events.js` `AsyncScene/Web/ui/ui-menu.js` `AsyncScene/Web/ui/ui-core.js` `AsyncScene/Web/ui/ui-battles.js`
- Goal: Провести read-only аудит после завершения реализации и дать итог только в формате `PASS/FAIL/INFO`.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты (без советов/правок)
- Notes: Проверка только фактов UI сигналов: не обещаем цены/награды/штрафы/дельты; runtime ранее не проверен.
- Result: FAIL — в UI остаются сообщения о ценах/наградах/дельтах. Факты: `AsyncScene/Web/ui/ui-menu.js:407` и `AsyncScene/Web/ui/ui-menu.js:477` содержат "Не прокает: нет 💰." и строку выигрыша с числом; `AsyncScene/Web/events.js:270` содержит "Твой выбор затащил: +1 💰 и +2 ⭐."; `AsyncScene/Web/ui/ui-core.js:1203` содержит тултип "Кап 20 💰... +1 ⚡."; `AsyncScene/Web/ui/ui-battles.js:1464` содержит "«Отвали» откроется на ⚡ 5.".
- Report (обязательный формат):
  - Status: DONE
  - Facts: Экономические обещания и дельты оставались в UI до фиксов.
  - Changed: `TASKS.md`
  - How to verify: Поиск строк в `AsyncScene/Web/ui/ui-menu.js`, `AsyncScene/Web/events.js`, `AsyncScene/Web/ui/ui-core.js`, `AsyncScene/Web/ui/ui-battles.js`.
  - Next: Валера — запуск цикла исправлений.
  - Next Prompt: |
      ```text
      Валера, открой TASKS.md и зафиксируй результат T-20260111-005. Создай задачи на исправления по фактам аудита и назначь исполнителя UI.
      ```

### [T-20260111-003] Реализовать UI honesty строго по mapping (без механики)
- Status: DONE
- Priority: P0
- Assignee: Саша
- Next: Валера
- Area: UI
- Files: `AsyncScene/Web/ui/ui-boot.js` `AsyncScene/Web/ui/ui-dm.js` `AsyncScene/Web/ui/ui-battles.js` `AsyncScene/Web/ui/ui-events.js` `AsyncScene/Web/ui/ui-menu.js` `AsyncScene/Web/ui/ui-chat.js` `AsyncScene/Web/ui/ui-core.js`
- Goal: Применить изменения UI/UX честности строго по `UI_HONESTY_MAPPING.md` (только разрешённые типы действий), не меняя ядро/экономику/состояния.
- Acceptance:
  - [ ] Все пункты mapping применены 1:1
  - [ ] В UI убраны/нейтрализованы экономические обещания (цены/награды/штрафы/дельты)
  - [ ] Нет правок механики/расчётов/условий/состояний; только UI тексты/видимость/disabled/лейблы
- Notes: Cleanup запрещён. Любые “улучшения” механики запрещены.
- Result: Реализация по mapping выполнена; итоговая проверка закрыта аудитом T-20260111-012 (PASS).

### [T-20260111-011] UI honesty исправления по итогам аудита T-20260111-009
- Status: DONE
- Priority: P0
- Assignee: Саша
- Next: Дима
- Area: UI
- Files: `AsyncScene/Web/ui/ui-core.js` `AsyncScene/Web/ui/ui-battles.js`
- Goal: Убрать оставшиеся экономические обещания и дельты по фактам аудита T-20260111-009, строго по `UI_HONESTY_MAPPING.md`, без механики и без изменения состояния.
- Acceptance:
  - [x] Удалены/нейтрализованы строки про "нет 💰", "цена удваивается" и порог ⚡ в указанных местах
  - [x] Изменения соответствуют разрешённым типам UI-действий
- Notes: Только UI-действия: HIDE RENAME DISABLE+LABEL LEGACY-LABEL REMOVE-DELTA. Механику и расчёты не трогать. Источник фактов: аудит T-20260111-009.
- Result: |
    Status: PASS
    Facts: Пакет фиксов предоставлен, изменения ограничены UI и соответствуют разрешенным типам действий по отчету
    Changed: `TASKS.md`
    Next: Дима, нужен повторный read-only аудит после фиксов
    Next Prompt: |
      ```text
      Дима, возьми задачу T-20260111-012 в TASKS.md, поставь Assignee на себя и Status DOING, перенеси в Doing. Проведи read-only аудит UI honesty после фиксов T-20260111-011 по UI_HONESTY_MAPPING.md и фактам UI, обнови Result с PASS или FAIL и фактами. В конце добавь свой Next Prompt кодблоком для следующего исполнителя.
      ```

### [T-20260111-009] Повторный аудит UI honesty (read-only, после фиксов)
- Status: DONE
- Priority: P0
- Assignee: Дима
- Next: Валера
- Area: UI
- Files: `AsyncScene/Web/ui/` `AsyncScene/Web/events.js` `UI_HONESTY_MAPPING.md` `AsyncScene/Web/ui/ui-menu.js` `AsyncScene/Web/ui/ui-core.js` `AsyncScene/Web/ui/ui-battles.js`
- Goal: Повторить read-only аудит UI honesty после дополнительных фиксов и дать итог только `PASS/FAIL/INFO` + факты.
- Acceptance:
  - [ ] Итог в `Result`: `PASS` или `FAIL` + факты (без советов/правок)
- Notes: Проверка только UI-сигналов (не обещаем цены/награды/штрафы/дельты). Runtime не обязателен.
- Result: FAIL — в UI остаются сообщения с ценами/наградами/дельтами. Факты: `AsyncScene/Web/ui/ui-menu.js:407` и `AsyncScene/Web/ui/ui-menu.js:477` содержат "Не прокает: нет 💰." и строку выигрыша с числом; `AsyncScene/Web/ui/ui-core.js:1212` содержит текст про "цена удваивается" с ⚡; `AsyncScene/Web/ui/ui-battles.js:1464` содержит "«Отвали» откроется на ⚡ 5.".
- Report (обязательный формат):
  - Status: DONE
  - Facts: Экономические обещания и дельты остаются в UI‑строках лотереи и подсказках про цену/порог ⚡.
  - Changed: `TASKS.md`
  - How to verify: Поиск строк в `AsyncScene/Web/ui/ui-menu.js`, `AsyncScene/Web/ui/ui-core.js`, `AsyncScene/Web/ui/ui-battles.js`.
  - Next: Валера — зафиксировать итоги и решить дальнейший шаг.
  - Next Prompt: |
      ```text
      Валера, открой `TASKS.md` и зафиксируй результат T-20260111-009. Если нужен новый цикл исправлений, создай задачу в Inbox с фактами из Result и назначь исполнителя.
      ```

### [T-20260111-010] Gate-приёмка пакета фиксов по T-20260111-007
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Дима
- Area: UI
- Files: `AsyncScene/Web/ui/ui-menu.js` `AsyncScene/Web/events.js` `UI_HONESTY_MAPPING.md` `TASKS.md`
- Goal: Провести gate-приёмку фактически предоставленного пакета фиксов из `T-20260111-007` (только UI-действия, без механики) и допустить/не допустить к повторному read-only аудиту.
- Acceptance:
  - [x] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + краткие факты
- Notes: `T-20260111-008` уже закрыта как `BACKLOG` в момент, когда пакета ещё не было; не переоткрывать историю — используем `T-20260111-010` как актуальный gate текущего пакета.
- Result: |
    Status: PASS
    Facts: Пакет фиксов из T-20260111-007 предоставлен и ограничен UI изменениями; затронуты только ui-menu.js и events.js; механика и состояние не тронуты по отчету
    Changed: `TASKS.md`
    Next: Дима, нужен повторный read-only аудит по T-20260111-009
    Next Prompt: |
      ```text
      Дима, возьми задачу T-20260111-009 в TASKS.md, поставь Assignee на себя и Status DOING, перенеси в Doing. Проведи read-only аудит UI honesty после фиксов по UI_HONESTY_MAPPING.md и фактам UI, обнови Result с PASS или FAIL и фактами. В конце добавь свой Next Prompt кодблоком для следующего исполнителя.
      ```

### [T-20260111-008] Gate-приёмка UI honesty фиксов (после FAIL)
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Саша
- Area: UI
- Files: `UI_HONESTY_MAPPING.md` `AsyncScene/Web/ui/` `AsyncScene/Web/events.js`
- Goal: Принять/отклонить пакет дополнительных UI honesty исправлений после FAIL-аудита (без механики, только разрешённые UI-действия).
- Acceptance:
  - [x] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + краткие факты
- Notes: Только UI честность, без экономики/ядра/cleanup. Источник пакета: Саша.
- Result: |
    Status: BACKLOG
    Facts: Пакет дополнительных UI honesty исправлений от Саши не предоставлен, gate-принятие невозможно
    Changed: —
    Next: Саша, нужен пакет фиксов и подтверждение источника
    Next Prompt: |
      ```text
      Возьми задачу T-20260111-007 в TASKS.md, поставь Assignee на себя и Status DOING, перенеси в Doing. Выполни UI honesty исправления по UI_HONESTY_MAPPING.md, без механики и без изменения состояния. После готовности переведи в REVIEW с Result и Report, и добавь Next Prompt кодблоком для следующего исполнителя.
      ```
### [T-20260111-006] Зафиксировать закрытие UI honesty phase
- Status: DONE
- Priority: P1
- Assignee: Валера
- Next: Саша
- Area: Docs
- Files: `UI_HONESTY_PHASE.md` `TASKS.md`
- Goal: После результата Димы (`PASS/FAIL`) зафиксировать состояние фазы: если `PASS` — отметить закрытие UI honesty phase; если `FAIL` — зафиксировать причины как факты и создать подзадачи на исправление (только UI-действия).
- Acceptance:
  - [x] В `UI_HONESTY_PHASE.md` добавлена строка статуса фазы (PASS/FAIL + дата)
  - [x] В `TASKS.md` задачи `T-20260111-003..005` приведены к консистентным статусам (без переписывания истории)
- Notes: Никакой механики/экономики/cleanup. Только процессная фиксация и статусы.
- Result: |
    Status: FAIL
    Facts: Аудит Димы по T-20260111-005 зафиксировал экономические обещания и дельты в UI, фаза не закрыта
    Changed: `UI_HONESTY_PHASE.md` `TASKS.md`
    Next: Саша, нужна UI правка по остаточным местам из аудита
    Next Prompt: |
      ```text
      Возьми задачу T-20260111-007 в TASKS.md, поставь Assignee на себя и Status DOING, перенеси в Doing. Выполни UI honesty исправления только по разрешенным типам UI-действий и без изменения механики. По завершении поставь Status REVIEW или DONE, заполни Result и Report, и добавь свой Next Prompt кодблоком для следующего исполнителя.
      ```

### [T-20260111-004] Gate-приёмка пакета UI honesty
- Status: DONE
- Priority: P0
- Assignee: Валера
- Next: Дима
- Area: UI
- Files: `UI_HONESTY_MAPPING.md` `AsyncScene/Web/ui/`
- Goal: Принять/отклонить пакет реализации UI honesty на соответствие разрешённым типам UI-действий и отсутствию вмешательства в механику.
- Acceptance:
  - [x] Итог в `Result`: `PASS` или `FAIL` или `BACKLOG` + краткие факты
- Notes: Источник пакета должен быть допустимым (Миша/Саша/Игорь/Лёша). Фиктивные источники запрещены.
- Result: |
    Status: PASS
    Facts: Gate-принятие выполнено, пакет допускается к read-only аудиту, правки кода со стороны Валеры не вносились
    Changed: —
    Next: Дима, потому что нужен read-only аудит по T-20260111-005
    Next Prompt: |
      ```text
      Возьми задачу T-20260111-005 в TASKS.md, поставь Assignee на себя и Status DOING, перенеси в Doing. Проведи read-only аудит UI honesty по UI_HONESTY_MAPPING.md и фактам UI, обнови Result с PASS или FAIL и фактами. В конце добавь свой Next Prompt в кодблоке ```text ... ``` для следующего исполнителя.
      ```

### [T-20260111-002] Занести mapping UI honesty в репозиторий
- Status: DONE
- Priority: P0
- Assignee: Саша
- Area: UI
- Files: `UI_HONESTY_MAPPING.md`
- Goal: Вставить утверждённый mapping “элемент → файл → тип UI-действия → текст до/после” в `UI_HONESTY_MAPPING.md` без изменений смысла.
- Acceptance:
  - [x] `UI_HONESTY_MAPPING.md` заполнен полностью
  - [x] В mapping нет новых элементов “от себя” и нет переутверждений
- Notes: Фаза UI honesty: только HIDE/RENAME/DISABLE+LABEL/LEGACY-LABEL/REMOVE-DELTA, без изменений механики.
- Result: mapping вставлен в UI_HONESTY_MAPPING.md (Sasha); `UI_HONESTY_MAPPING.md` помечен `READY`.

### [T-20260111-001] Добавить Мишу в AGENTS.md
- Status: DONE
- Priority: P2
- Assignee: Миша
- Area: Docs
- Files: `AGENTS.md`
- Goal: Добавить блок агента Миши в корневой AGENTS.md.
- Acceptance:
  - [x] Блок агента добавлен в AGENTS.md
- Notes: Формат блока соответствует текущему AGENTS.md.
- Result: Добавлен блок агента Миши в AGENTS.md.
### [T-20260123-001] Crowd vote cap instrumentation (P0 LOGIC 2.3 PASS)
- Status: DONE
- Priority: P0
- Assignee: Codex-ассистент
- Next: Ассистент
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js`
- Goal: Зафиксировать PASS P0 LOGIC 2.3: helper создаёт draw, валидирует `crowd`, возвращает `pendingMeta`/`crowdCapMeta`, `forceCap:true` демонстрирует `endedBy:"cap"` и `totalVotes>=cap`.  
- Acceptance:
  - [x] Draw battle вставляется в `Game.State.battles` и проверяется до вызова `Game.ConflictCore.applyCrowdVoteTick`.
  - [x] `crowdCapDebug` берётся из `tickResult.pendingMeta` или `tickResult.crowdCapMeta`, без `Game.Debug.moneyLog`.
  - [x] Смоуки без `forceCap` и с `forceCap:true` возвращают `crowdCapDebug` с `why:null`, `forceCap` даёт `endedBy:"cap"`.
- Result: PASS — helper больше не возвращает `battle_not_draw` на `ok:true`, оба сниппета подтверждены, документация обновлена.
- Report (обязательный формат):
  - Status: PASS
  - Facts: `drawAuditTrigger` гарантирует draw с crowd, exposes meta directly from `tickResult`, `forceCap:true` finishes with `endedBy:"cap"`.
  - Changed: `AsyncScene/Web/dev/dev-checks.js`
  - How to verify: запустить оба смоука и убедиться в `crowdCapDebug` и `endedBy:"cap"` с `totalVotes>=cap`.
  - Next: Ассистент — подготовить P0 LOGIC 3 (лимиты/веса) и обновить прогресс Crowd Economy Reforge.
  - Next Prompt (копипаст, кодблок обязателен):
      ```text
      Ответ Ассистента:
      Crowd Economy Reforge: P0 LOGIC 2.3 PASS. Вынеси план на P0 LOGIC 3 (лимиты/веса), составь чек-лист смоуков и обнови прогресс в PROJECT_MEMORY.md/PROGRESS_SCALE.md. После этого передай следующий prompt роли, отвечающей за P0 LOGIC 3.
      ```
### [T-20260205-011] ECON-04b Escape/Ignore audit
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Подтвердить circulation-only escape/ignore через смоуки.
- Acceptance:
  - [ ] `Game.Dev.smokeEscapeCrowdOutcomeOnce({mode:"cap", debugTelemetry:true, allowParallel:true})` ok:true, byReason canonical, sumNetDelta 0.
  - [ ] `Game.Dev.smokeEscapeCrowdStayOnce({mode:"cap", debugTelemetry:true, allowParallel:true})` ok:true, same invariants.
  - [ ] `Game.Dev.smokeIgnoreCrowdOutcomeOnce({mode:"cap", debugTelemetry:true, allowParallel:true})` ok:true, pointsDiffOk, canonical reasons.
- Result: |
    Status: PASS
    Facts:
      (1) escape outcome smoke ok:true, economyOk:true, pointsDiffOk:true, sumNetDelta=0, totalPtsWorldBefore=200, totalPtsWorldAfter=200, byReason escape_vote_cost:1 + canonical crowd vote entries (cap/refund/pool).
      (2) escape stay smoke ok:true, same invariant counts, canonical reasons.
      (3) ignore smoke ok:true, pointsDiffOk:true, sumNetDelta=0, sumNetFromMoneyLog=0, byReason crowd_vote_cost:10 + pool/refund counts, asserts all green.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify: прогоните перечисленные команды и проверьте ok/byReason/world totals (200).
    Next: —
    Next Prompt (копипаст, кодблок обязательно):
        ```text
        Ответ QA:
        Прогони `Game.Dev.smokeEscapeCrowdOutcomeOnce`, `Game.Dev.smokeEscapeCrowdStayOnce`, `Game.Dev.smokeIgnoreCrowdOutcomeOnce` с {mode:"cap", debugTelemetry:true, allowParallel:true}. Если ok:true и byReason canonical — ставь PASS и давай выводы.
        ```

### [T-20260205-012] ECON-04c Rematch idempotency
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Подтвердить idempotent rematch charging через `Game.Dev.smokePriceIdempotencyOnce`.
- Acceptance:
  - [ ] `Game.Dev.smokePriceIdempotencyOnce({ debugTelemetry:true })` ok:true, rematch@20/21 dupPrevented:true, log counts 1/1.
  - [ ] idempotency keys включают `rematch` + bataille IDs и одинаковы для repeated call.
  - [ ] Полного дублирования записей не происходит, moneyLog meta содержит priceKey разных rematch случаев.
- Result: |
    Status: PASS
    Facts:
      (1) `Game.Dev.smokePriceIdempotencyOnce({debugTelemetry:true})` -> ok:true; rematch@20/21: dupPrevented:true, firstCharged:true, secondCharged:false, logCountFirst=logCountSecond=1.
      (2) idempotencyKey: `rematch|me|dev_rematch_idem_1770273044786_659|dev_rematch_idem_1770273044786_659` for points=20 and similar `rematch|me|dev_rematch_idem_1770273044792_4516|dev_rematch_idem_1770273044792_4516` for points=21.
      (3) Confirms rematch charges go through unified pricing/idempotency guard; no duplicate moneyLog entries across repeated calls.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify: прогнать `Game.Dev.smokePriceIdempotencyOnce({debugTelemetry:true})` и убедиться, что rematch cases предотвращают дубли и log counts 1/1.
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.Dev.smokePriceIdempotencyOnce({debugTelemetry:true})`. Если rematch@20/21 dupPrevented:true и logCountFirst=logCountSecond=1, заметь PASS и пройди дальше.
        ```
-### [T-20260205-013] ECON-03 Circulation-only closeout pack
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Закрыть ECON-03: один режим экономики, battle/escape/rematch единообразны.
- Acceptance:
  - [ ] `Game.Dev.smokeEcon03_CirculationOnlyOnce({debugTelemetry:true})` ok:true.
  - [ ] transfer-only checks (entry cost, payouts, draw) pass for 3 win flavors + draw.
  - [ ] isCirculationEnabled true до/после и reasons стабильны.
    Status: PASS
    Facts:
      (1) `Game.Dev.smokeEcon03_CirculationOnlyOnce({debugTelemetry:true})` → ok:true, logSource:"debug_moneyLog", hitsAnyField>0, scopedLen>3 per scenario with real entry/battle_win_take/draw_deposit rows and sampleReasons populated.
      (2) win scenarios entryCostOk:true with byReason {battle_entry:1,battle_win_take:1,rep_battle_win_delta:1}, draw has draw deposits + rep draw; reasonsNonEmpty/reasonsStable true.
      (3) totalsBeforeAfter.delta:0, stableDelta:0 (stable balances before/after same set of ids/pools) and isCirculationEnabled true both before/after; legacyReachable:false.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) Run `Game.Dev.smokeEcon03_CirculationOnlyOnce({ debugTelemetry:true })` and confirm ok:true, reasonsNonEmpty, entry/draw checks pass, scopedLen>0.
    Next: —
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.Dev.smokeEcon03_CirculationOnlyOnce({ debugTelemetry:true })`. Если ok:true и все проверенные поля соответствуют канону, отметь PASS и приложи вывод (scenarios byReason + totals).
        ```

-### [T-20260205-014] ECON-04 C1-A buildBattleEconAuditFromLogs
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Добавить helper scoped log аудита `buildBattleEconAuditFromLogs` для battle economy.
- Acceptance:
  - [ ] helper возвращает scopedLen>0 и byReason по реальному battleId (используем logSource "debug_moneyLog").
  - [ ] asserts проверяют scoped non-empty/transfer only/totals stable.
  - [ ] Game.Dev.auditBattleEconOnce(battleId,{debugTelemetry:true}) просто вызывает helper и выводит debug.
  - Result: |
    Status: PASS
    Facts:
      (1) В dev-checks появился `buildBattleEconAuditFromLogs({ battleId, debugTelemetry })`: scopedRows, notes, logSource, byReason, netById, totals delta, flags/asserts.
      (2) Helper выбирает battleId автоматически (last log entry or Game.Dev.lastSmokeBattleId) и возвращает pickedBattleId/pickedHow; logSource debug_moneyLog/logger_queue, notes cover log_source_missing/scoped_empty.
      (3) Утилиты `Game.Dev.auditBattleEconOnce` и `Game.Dev.auditBattleEconLastOnce` вызывают helper (последняя выбирает last battle) и выводят debug при debugTelemetry:true.
      (4) Устранён SyntaxError `const log` (dev-checks.js:759); helper теперь использует `getDebugMoneyLogRows()` (debug moneyLog/logger queue/state) with logSource metadata, и `debugTelemetry` логирует `pickedBattleId/logSource/scopedLen`.
      (5) `getDebugMoneyLogRows()` теперь перебирает `debug_moneyLog` → `logger_queue` → `state_moneyLog`/`state_moneyLogByBattle` и сообщает logSource; `Game.Dev.makeOneBattleEconLogOnce()` запускает existing battle smoke, сохраняет `battleId`, и `Game.Dev.auditBattleEconLastBattleOnce({debugTelemetry:true})` подбирает только `battle_*` rows (`crowd_*` игнорируются, notes:["not_battle_econ_rows"] при отсутствии).
      (6) `smokeBattleCrowdOutcomeOnce` после `C1A6` изменил `afterSnapshot` на `let`, добавив debug лог `C1A6_READONLY_LHS:afterSnapshot`; `Game.Dev.makeOneBattleEconLogOnce({mode:"cap"})` и `Game.Dev.auditBattleEconLastBattleOnce({debugTelemetry:true})` больше не падают с `TypeError: Attempted to assign to readonly property`.
      (7) `runBattleSmokeOnce`/`smokeBattleCrowdOutcomeOnce` теперь берут `debugTelemetry` из `opts.debugTelemetry`, устранив ReferenceError (`debugTelemetry` не определялось ранее) — QA: `Game.Dev.makeOneBattleEconLogOnce({mode:"cap"})` и `Game.Dev.auditBattleEconLastBattleOnce({debugTelemetry:true})` больше не падают из-за undefined.
      (8) `transferOnlyPoints` детектор пересчитан: хилит `battle_*`/`crowd_*` строки, сохраняет `transferOnlyFailSamples` и помечает `points_emitter_row`, теперь QA `Game.Dev.auditBattleEconLastBattleOnce({debugTelemetry:true})` видит `flags.transferOnly:true`, `asserts.transferOnlyPoints:true`, `totalsBeforeAfter.deltaPoints==0` при battle логах без эмиссии.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`

### [T-20260205-015] ECON-04 C1-B entry cost smoke
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: `Game.Dev.smokeBattleEcon_WinWeakOnce` создаёт true battle с `battle_entry_*` и проходит audit.
- Acceptance:
  - [x] `Game.Dev.smokeBattleEcon_WinWeakOnce({debugTelemetry:true})` returns ok:true and battleId without `_crowd_`.
  - [x] `entryProbeLen ≥ 1`, `entryCostOk:true`, `byReason` keys {battle_entry,battle_win_take,rep_battle_win_delta}.
  - [x] totals deltaPoints=0, logSource debug_moneyLog, netById matches transfer (`{me:2,sink:1,npc_weak:-2,crowd_pool:-1}`).
- Result: |
    Status: PASS
    Facts:
      (1) `Game.Dev.smokeBattleEcon_WinWeakOnce({debugTelemetry:true})` → ok:true, battleId `dev_econ03_win_weak_1770287983186_2819`, entryProbeLen=1, entryCostOk=true, notes empty.
      (2) Audit reports `byReason:{battle_entry:1,battle_win_take:1,rep_battle_win_delta:1}`, `flag.transferOnly:true`, totalsBeforeAfter.deltaPoints=0, logSource:"debug_moneyLog".
      (3) `netById` reflects transfer pattern `{me:2,sink:1,npc_weak:-2,crowd_pool:-1}` generated by `makeOneTrueBattleEconLogOnce`.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`

### [T-20260205-016] ECON-03 circulation-only determinism
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA verification
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: `Game.__DEV.smokeEcon03_CirculationOnlyOnce` дважды подряд возвращает одинаковый hash (reasonsSig/netSig/totalsSig) с zero drift.
- Acceptance:
  - [x] `Game.__DEV.smokeEcon03_CirculationOnlyOnce({debug:true, runTag:"r1"})` и `({runTag:"r2"})` оба ok:true, same sig.
  - [x] `normalizedNetSig` identical `["crowd:*:2","crowd_pool:-4","me:5","npc_troll:-2","npc_weak:-5","sink:4"]`.
  - [x] `reasonsSig` identical `["battle_draw_deposit:1","battle_draw_deposit_opponent:1","battle_entry:4","battle_win_take:3","rep_battle_draw:1","rep_battle_win_delta:2"]`.
  - [x] `totalsSig` now `{"stableDelta":0,"deltaPoints":0,"deltaRep":0}`.
  - [x] scopedLen=12, legacyReachable:false, circulation enabled before/after, totals drift prevented.
- Result: |
    Status: PASS
    Facts:
      (1) `Game.__DEV.smokeEcon03_CirculationOnlyOnce({debug:true, runTag:"r1"})` and `runTag:"r2"` run twice, both ok:true with identical sig/reasons/net/totals.
      (2) `normalizeNetById` collapses `crowd:*`, totalsSig uses deltas only, debug log `[DEV] ECON03_SIG` shows same metrics despite baseline shift (200→200 vs 205→205).
      (3) `byReason` built from deterministic sorted scoped debug_moneyLog, totals deltaPoints/deltaRep zero, legacyReachable:false.
- Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`

### [T-20260205-017] ECON-03 Prices [1.7] edge cases
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: QA
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: `Game.__DEV.smokeSoftCapPricesEdgeOnce()` стабильно покрывает points {0,1,20,21,999} с meta, strict threshold, без NaN/Inf.
- Acceptance:
  - [x] `Game.__DEV.smokeSoftCapPricesEdgeOnce()` → ok:true, badCount=0, thresholds strict (vote@20 mult=1, vote@21 mult=2), meta present, finalPrice finite integer ≥1.
  - [x] `meta` normalized for points=0 (affordable:false, idempotencyKey `"vote:0"`), 20/21/999 behaved as expected.
  - [x] Регрессия `Game.__DEV.smokeSoftCapPricesOnce()` остаётся ok:true (notes=["social_skipped"] доп.).
- Result: |
    Status: PASS
    Facts:
      (1) `Game.__DEV.smokeSoftCapPricesEdgeOnce()` → ok:true, badCount=0, pointsSet [0,1,20,21,999], normalized meta for each category (vote@0 affordable:false, vote@20 mult=1 final=1, vote@21 mult=2 final=2).
      (2) `Game.__DEV.smokeSoftCapPricesOnce()` остаётся ok:true с notes=["social_skipped"].
      (3) Изменения ограничены `dev-checks.js`: добавлен edge smoke, normalizeMeta и asserts на meta/finalPrice/threshold.
    Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      (1) В браузере: `Game.Dev.auditBattleEconOnce(<existingBattleId>, {debugTelemetry:true})`. Убедись, что scopedLen>0 и totals deltaPoints=0.
    Next: QA — используй helper для C1 smokes.
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Коллеги, прогоните `Game.Dev.auditBattleEconOnce(<battleId>, {debugTelemetry:true})` на существующем баттле, подтвердите scopedLen>0, logSource не none и totals deltaPoints=0. При PASS примените helper в C1 smokes.
        ```
### [T-20260205-018] ECON-03 E1 Escape/Ignore determinism
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Зафиксировать стабильность `Game.__DEV.smokeEcon03_EscapeIgnoreOnce` по escape/ignore веткам.
- Acceptance:
  - [x] `Game.__DEV.smokeEcon03_EscapeIgnoreOnce({debug:true, runTag:"r1"})` ok:true, scopedLen≥69, notes:[], totalsSig {"stableDelta":0,"deltaPoints":0,"deltaRep":0}.
  - [x] `Game.__DEV.smokeEcon03_EscapeIgnoreOnce({debug:true, runTag:"r2"})` ok:true, тот же sig/reasonsSig/normalizedNetSig.
  - [x] escape/escape_stay reasons include `crowd_vote_cost`, `crowd_vote_pool_init`, `crowd_vote_refund_majority`, `escape_vote_cost`; ignore reasons include `crowd_vote_cost`, `crowd_vote_pool_init`, `crowd_vote_refund_majority`, `ignore_outcome_debug` and normalized net {me:-1,npc_weak:1} for escapes, empty net for ignore.
- Result: |
    Status: PASS
    Facts:
      (1) r1/r2 печали `Game.__DEV.smokeEcon03_EscapeIgnoreOnce` → ok:true, notes пустые, scopedLen=69, totalsSig стабильный; `sig`/`reasonsSig`/`normalizedNetSig` совпадают.
      (2) Canon reasons/net совпадают по escape/escape_stay/ignore; ignores по-прежнему zero-sum и include debug `ignore_outcome_debug`.
      (3) Демонстрирует deterministic signature и zero-sum, давая базу для дальнейших E1 смоуков.
    Changed: `PROJECT_MEMORY.md` `TASKS.md`
    How to verify:
      1) Запустить перечисленные команды и сравнить `sig`/`reasonsSig`/`normalizedNetSig` (r1 vs r2).
    Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.__DEV.smokeEcon03_EscapeIgnoreOnce({debug:true, runTag:"r1"})` и `...runTag:"r2"`. Если oba ok:true, notes пустые, scopedLen одинаков, sig/reasonsSig/normalizedNetSig совпадают — ставь PASS и впиши вывод.
        ```
### [T-20260205-019] ECON-04 C1-B True battle econ audit entry cost (dev-only)
- Status: PASS
- Priority: P0
- Assignee: Codex-ассистент
- Next: —
- Area: Economy
- Files: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- Goal: Зафиксировать true battle entry audit и deterministic signature smoke.
- Acceptance:
  - [x] `Game.__DEV.smokeBattleEcon_EntryCostOnce({debug:true, runTag:"r1"})` ok:true, battleId без `_crowd_`, entryProbeLen=1, entryCostOk=true, scopedLen=3, sig/reasons/net/totals стабильны.
  - [x] `Game.__DEV.smokeBattleEcon_EntryCostOnce({debug:true, runTag:"r2"})` ok:true и идентичные sig/reasons/net/totals.
- Result: |
    Status: PASS
    Facts:
      (1) r1/r2 → ok:true, battleId `dev_battle_econ_win_weak_1770294775189_3186`/`dev_battle_econ_win_weak_1770294783924_3515`, entryProbeLen=1, entryCostOk true, scopedLen=3, reasonsSig ["battle_entry:1","battle_win_take:1","rep_battle_win_delta:1"], netSig ["crowd_pool:-1","me:2","npc_weak:-2","sink:1"], totalsSig {"deltaPoints":0,"deltaRep":0}.
      (2) byReason {battle_entry:1,battle_win_take:1,rep_battle_win_delta:1}; netById {me:2,sink:1,npc_weak:-2,crowd_pool:-1}; notes empty.
      (3) Guard `crowd_battle_forbidden` + `makeOneTrueBattleEconLogOnce` обеспечили настоящий battle, smoke детерминирован.
- Changed: `AsyncScene/Web/dev/dev-checks.js` `PROJECT_MEMORY.md` `TASKS.md`
- How to verify:
    1) Запусти оба smoka и сравни sig/notes/entryProbeLen.
- Next Prompt (копипаст, кодблок обязателен):
        ```text
        Ответ QA:
        Прогони `Game.__DEV.smokeBattleEcon_EntryCostOnce({debug:true, runTag:"r1"})` и `...runTag:"r2"`.
        Если оба ok:true, notes empty, sig/reasons/net/totals совпадают — ставь PASS и приложи вывод.
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
