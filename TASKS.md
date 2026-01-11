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

## Doing
<!-- Переносите сюда взятые задачи -->

## Review
<!-- Всё, что ждёт проверки/приёмки -->

## Done
<!-- Закрытые задачи (оставляйте краткий Result) -->

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
