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
<!-- Добавляйте новые задачи сюда -->
- Next Prompt (копипаст, кодблок обязателен):
    ```text
    Ответ Ассистента:
    Валера, открой `TASKS.md` и возьми задачу `T-20260111-051` (Gate: Economy wave 5 scope — battle_end REP by strength delta). Вход: `ECONOMY_WAVE5_SCOPE.md`. Нужен итог PASS/FAIL/BACKLOG + факты; при PASS — подтвердить, что параметры фиксированные (tierDiff, таблица REP win/lose/draw, reasons, клип) и что UI/Points/Influence запрещены. В ответе в чат обязательно приложи Next Prompt кодблоком.
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
