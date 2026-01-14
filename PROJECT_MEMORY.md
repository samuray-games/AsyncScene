# AsyncScene — Project Memory (single shared context)

Этот файл — **общая “память проекта”**, доступная всем агентам/чатам (локально, Codespaces, Codex web).
Цель: чтобы контекст **не зависел от конкретного чата** и не “терялся” при переключениях.

## Правило обновления
- Любая новая договорённость/ограничение/решение/статус фазы, которое ассистент считает “памятью”, фиксируется здесь.
- Формат: добавляем запись в **Log** (внизу) и при необходимости обновляем **Current Snapshot**.

## Current Snapshot

### Проект
- Project: AsyncScene
- Repo: `samuray-games/AsyncScene` (работа идёт через git; изменения синкаются через push/pull)

### Команда (роли)
Источник: `AGENTS.md`, `TASKS.md`
- Валера — gate/интеграция, решения только `PASS/FAIL/BACKLOG`
- Миша — реализация (код) в рамках gate scope
- Дима — read-only аудит, итог только `PASS/FAIL/INFO` + факты
- Саша — UI/UX и тексты (без механики)
- Игорь — AI + NPC
- Лёша — геймдизайн баттлов/прогрессии
- Ассистент — координатор процесса + локальная интеграция/контент (ранее: Codex-ассистент)

### Процесс (эстафета)
Источник: `TASKS.md`
- Источник правды по задачам: `TASKS.md`
- Каждый исполнитель в конце:
  - заполняет `Result`/`Report` по шаблону
  - указывает `Next`
  - прикладывает `Next Prompt` **кодблоком**

### Формат “промтов для пересылки”
- Первая строка в `Next Prompt`: `Ответ <имя/роль>:` (пример: `Ответ Миши:` / `Ответ Валеры:` / `Ответ Димы:`)
- `Next Prompt` всегда в кодблоке (```text ... ```)

### Статусы фаз/волн (по фактам из `TASKS.md`)
- UI honesty phase: закрыта `PASS`
- Economy:
  - wave 1–4: закрыты (см. `TASKS.md` для конкретных задач-оснований)
  - wave 5: scope принят `PASS` (battle_end REP by tierDiff), реализация по `T-20260111-052`, аудит `T-20260111-053`, gate close `T-20260111-054`

### Отчётность ассистента (в чате)
- В каждом сообщении по проекту: отдельная строка `Память обновлена`
- После каждого сообщения по теме: прогресс в формате:
  - `wave X: X%`
  - `фаза Economy (текущие задачи): X%`
  - `весь проект (текущие задачи): X%`

## Log (append-only)

### 2026-01-11 — Init shared memory file
- Facts: создан `PROJECT_MEMORY.md` как единая “память проекта” для всех чатов/агентов; договорённости фиксируются здесь и в `TASKS.md`.
- Rule: все новые “памятные” договорённости, которые ассистент подтверждает строкой `Память обновлена` в чате, также добавляются записью в этот Log.
- Changed: `PROJECT_MEMORY.md`

### 2026-01-11 — Требование дублировать “память” в файл
- Facts: творец попросил вести отдельный файл “памяти” и дублировать туда всё, что ассистент фиксирует как “Память обновлена”; `PROJECT_MEMORY.md` назначен источником общего контекста между чатами/агентами.
- Changed: `PROJECT_MEMORY.md`

### 2026-01-11 — Обновление правил Димы и итоги аудитов wave 3 UI / wave 4
- Facts: Для Димы закреплено правило — первая строка ответа в чате и Next Prompt: `Ответ Димы:`; закрыты read-only аудиты `T-20260111-040` (UI wave 3) PASS и `T-20260111-047` (Economy wave 4) PASS по фактам; проверка `node --check AsyncScene/Web/conflict/conflict-economy.js` PASS.
- Changed: `PROJECT_MEMORY.md`

### 2026-01-11 — Обновление процесса и роли “Ассистент”
- Facts: “Кодинг 3” переименован в “Ассистент” как координатор; для Next Prompt первая строка фиксирована как `Ответ Валеры:`.
- Facts: Валера зафиксировал текущие статусы фаз/волн и gate по wave 5 как BACKLOG до пакета с параметрами (см. секцию Валера).
- Changed: `PROJECT_MEMORY.md`

### 2026-01-11 — Gate: Economy wave 5 scope
- Facts: Gate `T-20260111-051` = PASS, принят scope wave 5 по `ECONOMY_WAVE5_SCOPE.md` (battle_end REP by tierDiff) с фиксированными параметрами (tierDiff, таблица REP win/lose/draw, reasons, клип), без UI/Points/Influence; эстафета заведена `T-20260111-052` -> `T-20260111-053` -> `T-20260111-054`.
- Changed: `PROJECT_MEMORY.md`

### 2026-01-12 — Канон: кулдауны, списки, доносы копу (v1)
- Facts: Зафиксирован канон поведения кулдаунов/видимости в списках и правил REP при доносе копу (правила 1–6 ниже).
- Changed: `PROJECT_MEMORY.md`

Канон (правила 1–6):

1) Глобальное правило видимости
- Если у персонажа активен ЛЮБОЙ кулдаун, он исчезает из ЛЮБЫХ списков выбора.
  Примеры списков: “Вызвать на батл”, “Сдать копу”, и любые другие списки персонажей.
- Пока кулдаун активен, персонажа нельзя выбрать через списки (он просто не показывается).

2) Батл-кулдаун NPC
- После завершения баттла NPC получает батл-кулдаун: 3 минуты.
- На время батл-кулдауна NPC не показывается в любых списках (в т.ч. “Вызвать на батл”).

3) Ложный донос (определение)
- У каждого персонажа есть роль.
- Если при сдаче копу роль цели НЕ {токсик, бандит, мафиози} — это ложный донос.

4) REP за донос копу (правила начисления)
Сценарий A: сдача злодея БЕЗ подтверждений
- REP: +1
- Ограничение: без подтверждений нельзя давать REP выше +1

Сценарий B: сдача злодея, если игрок пострадал от него
- REP: +2

Сценарий C: ложный донос (роль не токсик/бандит/мафиози)
- REP штраф: −2
- Если ложный донос повторный/злонамеренный: −3

Инварианты:
- REP не уходит ниже 0
- REP начисляется/снимается только с reason
- Без подтверждений нельзя давать REP выше +1

5) Кулдаун на “сдать копу”
- Кулдаун на “сдать” ставится ТОЛЬКО после успешной сдачи злодея (т.е. цель действительно злодей).
- Длительность кулдауна “сдать” = время неактивности/тюрьмы злодея (5 минут).
- Во время этого кулдауна сдавать повторно нельзя; после окончания — можно снова.

6) Дополнение: компенсация после ограбления (если применимо)
- Если игрок пострадал от злодея (токсик/бандит снял points), и немедленно успешно сдаёт его копу:
  - украденные points возвращаются от злодея обратно игроку
  - плюс дополнительно 3 points от злодея

---

## Team Sections (обновляет каждый сам)

### Валера (gate/интеграция)
- Что сюда писать:
  - Итоги gate (`PASS/FAIL/BACKLOG`) с короткими фактами
  - Принятые/запрещённые параметры (числа, reasons, инварианты), но только после решения
  - Конфликты/коллизии статусов и как они разрешены (фактами)
- Не писать: идеи/архитектуру “от себя”

Факт: UI honesty phase закрыта PASS (основание в `TASKS.md`).
Факт: Economy wave 1 закрыта PASS, Economy wave 2 закрыта PASS, Economy wave 3 закрыта PASS (core+UI), Economy wave 4 закрыта PASS (основание в `TASKS.md`).
Факт: Economy wave 5 scope принят PASS по gate `T-20260111-051` на основе `ECONOMY_WAVE5_SCOPE.md`.
Факт: Параметры wave 5 зафиксированы: tierMap y=1 o=2 r=3 k=4, tierDiff категории UPSET/SHAME, WIN +2/+1/0, LOSE -2/-1/0, DRAW 0, reasons rep_battle_upset_win и rep_battle_shame_lose, клип REP без ухода в отрицательные (single source: transferRep).
Факт: Запреты wave 5: UI/Points/Influence запрещены, addRep в prod запрещен, исход боя и аргументы не менять, правки только conflict-economy.js (+ опционально data.js).
Факт: Эстафета wave 5 заведена задачами `T-20260111-052` (Миша) -> `T-20260111-053` (Дима) -> `T-20260111-054` (Валера).
Факт: Источник/адресат “Ассистент” принят как рабочий (переименование “Кодинг 3”).

### Миша (ядро/реализация)
- Что сюда писать:
  - Какие механики/хуки реально внедрены (факт), строго в рамках gate
  - Какие файлы/модули тронуты (список)
  - Любые важные технические ограничения/known issues (факт)
- Не писать: UI тексты/маркетинг, новые механики без gate

Факт: Wave 1 (dismiss_click) — REP штраф через `Game.StateAPI.transferRep("me" -> opponentId)` с reason=`rep_dismiss_click` и battleId=b.id; Points/Influence не менялись. Файл: `AsyncScene/Web/conflict/conflict-core.js`.
Факт: Wave 2 (escape) — REP штрафы через `transferRep("me" -> oppId)` с reasons=`rep_escape_ok_penalty`/`rep_escape_stay_penalty` и battleId=b.id; Influence штрафы с клипом до 0; Points на исходах escape не менялись. Файл: `AsyncScene/Web/conflict/conflict-core.js`.
Факт: Wave 3 (rematch core) — запрос реванша доступен проигравшему; cost=1 point transfer проигравший→оппонент (reason=`rematch_request_cost`, meta.battleId=b.id); REP penalties=1 с reasons=`rep_rematch_request`/`rep_rematch_decline`; accept создаёт новый battle с `rematchOf`, decline не возвращает point; доп. battle_entry на accept не добавлялся. Файлы: `AsyncScene/Web/conflict/conflict-core.js` `AsyncScene/Web/conflict/conflict-api.js`.
Факт: Wave 4 (tone as pressure) — в `win` ветке (legacy) добавлен pressure-on-win: если мой tierColor в {r,k} и opp tierColor в {y,o}, то Influence у me уменьшается на 1 (клип до 0) и REP gain капается до 0; причина cap фиксируется маркером reason=`rep_pressure_win_cap` с battleId. Файл: `AsyncScene/Web/conflict/conflict-economy.js`.
Факт: UI файлы в wave 1–4 со стороны Миши не изменялись; addRep в prod не использовался (в state.js addRep остаётся только как заблокированный/guard путь, dev-only сценарии отдельно).

### Дима (аудит read-only)
- Что сюда писать:
  - Итог аудита (`PASS/FAIL/INFO`) + факты проверки (что проверено, что нет)
  - Команды/шаги проверки (если применимо)
- Не писать: рекомендации/улучшения/правки

Факт: Все ответы Димы в чате начинаются строкой `Ответ Димы:`; Next Prompt в TASKS.md для Димы также начинается строкой `Ответ Димы:`.
Факт: UI wave 3 audit `T-20260111-040` = PASS; проверен rematch UI в `AsyncScene/Web/ui/ui-battles.js:1536`–`1625`, кнопки `Принять/Отклонить/Попросить` и тексты без числовых дельт; вызовы идут через `Game.Conflict.requestRematch/respondRematch` (см. `AsyncScene/Web/conflict/conflict-api.js:439`–`453`).
Факт: Economy wave 4 audit `T-20260111-047` = PASS; pressure-on-win в `AsyncScene/Web/conflict/conflict-economy.js:531`–`584` соответствует gate (r/k vs y/o, INF_PRESSURE_WIN_COST=1 с клипом до 0, REP_PRESSURE_WIN_CAP=0, reason=rep_pressure_win_cap); в блоке pressure-on-win нет операций с points; `addRep` найден только в `AsyncScene/Web/state.js` (определение) и `AsyncScene/Web/dev/dev-checks.js` (dev).
Факт: Проверки: `node --check AsyncScene/Web/conflict/conflict-economy.js` = PASS; поиск `addRep(` выполнялся по `AsyncScene/Web/state.js` и `AsyncScene/Web/dev/dev-checks.js`.

### Саша (UI/UX и тексты)
- Что сюда писать:
  - Итоги UI-правок (факт) и где они лежат (файлы)
  - Тексты/формулировки, которые утверждены и используются
  - UI-ограничения (что запрещено/что нельзя обещать)
- Не писать: правки механики/экономики

Факт: Введён канон UI honesty mapping в `UI_HONESTY_MAPPING.md` (элемент → файл → тип UI-действия → текст до/после).
Факт: UI honesty применён по mapping (нейтрализация экономических обещаний/дельт) в UI-файлах: `AsyncScene/Web/ui/ui-boot.js`, `AsyncScene/Web/ui/ui-dm.js`, `AsyncScene/Web/ui/ui-battles.js`, `AsyncScene/Web/ui/ui-events.js`, `AsyncScene/Web/ui/ui-menu.js`, `AsyncScene/Web/ui/ui-chat.js`, `AsyncScene/Web/ui/ui-core.js`.
Факт: Дополнительные правки по итогам аудитов UI honesty внесены в `AsyncScene/Web/ui/ui-core.js` и `AsyncScene/Web/ui/ui-battles.js` (убраны упоминания «цена удваивается», убраны подсказки с порогами ⚡ в формулировках).
Факт: Economy wave 3 UI (реванш) реализован в `AsyncScene/Web/ui/ui-battles.js` (карточка завершённого баттла): уведомление «<name> просит реванш», действия «Принять/Отклонить», статусы «Реванш принят/Реванш отклонён», и для проигравшего действие «Хочешь реванш → Попросить».
Факт: UI реванша вызывает только core API: `Game.Conflict.requestRematch(battleId)` и `Game.Conflict.respondRematch(battleId, accept)`; прямых правок механики/состояния из UI не добавлено.
Ограничение: В UI запрещены числовые обещания/дельты по Points/REP/Influence и любые упоминания цен/награды/штрафов в цифрах (кроме dev-диагностики, если отдельно разрешена gate-ом).
Ограничение: Коммуникация в чате: первая строка каждого моего сообщения и Next Prompt — «Ответ Саши:».

### Игорь (AI + NPC)
- Что сюда писать:
  - Согласованные роли/NPC-реплики/шаблоны (факт)
  - Где находится контент (файлы/ключи)

### Лёша (геймдизайн)
- Что сюда писать:
  - Принятые (gate) числа/баланс-параметры (если Валера утвердил)
  - Факты плейтеста и выводы по ощущениям (без внедрения)

### Ассистент (координация)
- Что сюда писать:
  - Правила процесса/эстафеты/форматы отчётов (если менялись)
  - Статус фаз/волн (только по `TASKS.md`)
  - Любые обязательные требования к коммуникации/копипастам

## 2026-01-13 — Инвариант: эскалация реванша против противника

**Правило 1: КАЖДОЕ поражение предлагает реванш**
- После любого проигрыша игроку показывается предложение реванша ("Реванш? N💰" или "Снова реванш? N💰")
- Реванш доступен независимо от того, был ли батл создан через rematch или нет

**Правило 2: КАЖДЫЙ повторный реванш против ТОГО ЖЕ противника стоит дороже на +1💰**
- `b.rematchRequestCount` отслеживает количество поражений/реваншей подряд против конкретного противника
- Цена первого реванша: 1💰
- Цена второго реванша (после accept и нового проигрыша): 2💰
- Цена третьего реванша: 3💰, и так далее
- **Инвариант**: `nb.rematchRequestCount = b.rematchRequestCount || 0;` при accept (счётчик переносится на новый батл)

**Правило 3: Текст кнопки реванша**
- Первый раз (`rematchRequestCount === 0`): "Реванш? 1💰"
- Повторные разы (`rematchRequestCount > 0`): "Снова реванш? N💰"

**Реализация**:
- `conflict-core.js/C.respondRematch`: при accept счётчик переносится на новый батл
- `conflict-core.js/C.requestRematch`: увеличивает счётчик перед запросом
- `ui-battles.js`: кнопка реванша показывается после каждого проигрыша с правильной ценой

**Файлы**:
- `AsyncScene/Web/conflict/conflict-core.js` (строка ~1527)
- `AsyncScene/Web/ui/ui-battles.js` (строка ~1890)

## 2026-01-13 — Backup: AsyncScene 3.2.zip
 - Facts: Пользователь создал zip-бэкап текущего состояния игры.
 - Path: '/Users/User/Documents/created apps/AsyncScene backups/AsyncScene 3.2.zip'
 - Action: Запись в лог по запросу пользователя.
 - Note: Бэкап сохранён локально пользователем; файл не изменён в репозитории.

## 2026-01-13 — Процесс работы: “оценка модели → выполнение”
 - Facts: Зафиксирован строгий порядок взаимодействия.
 - Rule:
  - Если сообщение содержит задачу: ассистент отвечает ОДНИМ словом (mini | gpt5.2 | sonnet | opus) и НЕ начинает исправлять.
  - Исполнение начинается только после сообщения пользователя “Переключил, выполняй”.
 - Note: В ответе-оценке никаких пояснений; выполнение только после явного переключения.

### 2026-01-14 — Team Log: assistant implementation entry
- Facts: Assistant implemented a set of UI and economy fixes requested by the team:
  - Task A: REP by tone delta (y=1,o=2,r=3,k=4) in battle finalize (reasons: rep_battle_win_delta / rep_battle_lose_delta).
  - Task B: Crowd voting flow — points charged on click, +1 REP participation immediately, outcome ±2 REP on resolution, refund point on majority.
  - Task C: Rematch (revenge) does not affect REP; cost remains points transfer (rematch_request_cost).
  - Task D: Type-compatibility enforcement (check by argument type) with dev-log when `Game.Debug.LOG_TYPE_CHECK=true`.
  - Task E: WHERE-response guard applied ("там, где {PLACE}"), YN answers preserved; data guard present.
  - Task F: UI toasts cleaned — removed duplicate "Победа!" toast; keep only delta toasts.
  - Task G: Cop DM behavior: after successful report, if player was victimized by the target, cop sends an additional DM ("Я понимаю, что вас это задело. Меры приняты.") — cop speaks in first person.
- Changed files: `AsyncScene/Web/conflict/conflict-economy.js`, `AsyncScene/Web/events.js`, `AsyncScene/Web/state.js`, `AsyncScene/Web/conflict/conflict-core.js`, `AsyncScene/Web/ui/ui-events.js`
- Artifacts: `SMOKE_TEST_COMMANDS.md`, `IMPLEMENTATION_SUMMARY.md` added to workspace root.
- Changed by: Assistant (logged per user's request).

## Ассистент - Лог

Правила ведения
- Каждый новый месседж пользователя - отдельная запись.
- В заголовке записи - локальные дата и время.
- Пишу максимально подробно: контекст, инварианты, текущие задачи, результаты проверок, принятые решения, открытые вопросы.
- Не использую длинное тире, только дефис.

### 2026-01-15 00:20:59 JST - Опорная точка: smoke-check фикса "там, где {PLACE}" (PASS)

Контекст
- Проект: AsyncScene
- Стадия: активная доработка механик и UI (после UI honesty)
- Открытые вкладки (IDE): `SMOKE_TEST_COMMANDS.md`, `AsyncScene/Web/data.js`, `AsyncScene/Web/conflict/conflict-arguments.js`, `/Users/User/.codex/config.toml`
- Режим ассистента по файлам: по умолчанию read-only, любые правки только по явному разрешению пользователя с перечислением файлов и цели
- Текущая правка в репозитории: добавлен только этот раздел лога в `PROJECT_MEMORY.md` (остальные файлы не трогались в рамках этой операции)

Глобальные инварианты механик и контента (как сформулировано пользователем в чате)
- BASE-аргументы запрещены. Используется только CANON: `Game.Data.getArgCanonGroup`.
- Если канон не собирается - draw.
- Сила для правил REP по дельте - это тон (y/o/r/k). Influence в расчет силы не входит.
- Defense matching: любой defense того же типа подходит к вопросу независимо от тона. Привязка по тону запрещена.
- UI: все изменения статов должны быть видны сразу, UI обновляется немедленно, тосты строго в момент изменения. Никакой агрегации.

Опорная точка (что уже сделано и почему)
- Баг: в рантайме встречались "в {PLACE}" и "В {PLACE}" в CANON, и слово "здесь" в YN-ответах
- Причина: старые санитайзеры использовали `\\b` (ASCII word boundary), что не подходит для кириллицы
- Источник данных: `AsyncScene/Web/data.js`
- Цепочка данных: `Data.ARG_CANON_TEXT` -> `Data.buildArgCanon()` -> `Data.ARG_CANON_INDEX`
- Фикс (уже внесен ранее, механики не менялись): санитайзеры переведены на Unicode-aware regex с `\\p{L}` и замену предлогов перед `{PLACE}` на "там, где {PLACE}", плюс запрет слова "здесь" в YN-ответах
- Фикс присутствует в 3 местах в `AsyncScene/Web/data.js`:
  - `sanitizeWhereAnswers` (правка base where + `Data.ARG_CANON_TEXT`)
  - `Data.buildArgCanon` (post-sanitize уже собранного `Data.ARG_CANON_INDEX`)
  - `sanitizeCanonWhereInText` (post-sanitize `Data.ARG_CANON_TEXT` и `Data.ARG_CANON_INDEX`)

Текущая задача: smoke-check фикса
- Требование A: В рантайме больше нет "в {PLACE}" и "В {PLACE}" в `Game.Data.ARG_CANON_INDEX`
- Требование B: В YN-ответах больше нет слова "здесь"
- Требование C: В реальных WHERE-баттлах в UI ответы выглядят как "там, где {PLACE}" и нет регрессий

Результаты smoke-check (по фактам из DevTools и ручной проверки UI)
- A: PASS
  - DevTools результат: `{hasLower:false, hasUpper:false, samples:[]}`
- B: PASS
  - DevTools результат: `{hasZdesInYnAnswers:false, samples:[]}`
- C: PASS
  - Сообщение пользователя: "Проверил, всё в порядке."

Принятые решения
- Smoke-check фикса "там, где {PLACE}" принят как PASS, дальнейшие правки по этой теме не требуются без новых фактов

Открытые вопросы (держать в фокусе, но не делать без явного ТЗ)
- Голосования и экономика UI: мгновенные тосты и дельты без агрегации, соответствие реально примененным изменениям
- Личка копа и доносы: отсутствие DM сейчас считается багом
- Баг: отправка сообщения в чат вызывает тост "+1п" - источник не найден
- Контент и NPC: проверка канона (непобедимость токсик/бандит/мафиози для обычного игрока, запрет 3 лица у NPC) только по явному запросу

Контекст про лог-файл (факт)
- Ранее по ошибке был указан путь `/Users/User/.codex/PROJECT_MEMORY.md`; этого файла в момент запроса не было, поэтому он был создан отдельно от репозитория
- Текущий источник правды для лога проекта: `PROJECT_MEMORY.md` в корне репозитория (этот файл)

## [CODEX] Assistant Log

Правила ведения (PROMPT 1/4 update)
- По умолчанию READ-ONLY.
- Единственный файл, который можно менять: `/Users/User/Documents/created apps/AsyncScene/PROJECT_MEMORY.md`.
- Единственное допустимое изменение: дописывать лог в этот файл.
- Любые правки других файлов: только plan + patch-preview, и ждать явного разрешения пользователя "РАЗРЕШАЮ ПРАВКУ: <файл> - <цель>".
- Каждое новое сообщение пользователя - отдельная запись.
- Заголовок записи: локальные дата и время.
- Формат отчета после каждого шага: 1) что проверили/изменилось, 2) как проверить в рантайме, 3) edge cases.
- Не использовать длинное тире, только дефис.

### 2026-01-15 00:58:52 JST - Принят PROMPT 1/4 update, правила лога и read-only

Контекст
- Сообщение пользователя: PROMPT 1/4 (UPDATE) с жесткими правилами read-only и обязательного логирования в `PROJECT_MEMORY.md`.
- Разрешения: правки допустимы только для `PROJECT_MEMORY.md` и только как дописывание лога.

Что проверили
- Проверено, что раздел `## [CODEX] Assistant Log` отсутствовал в `PROJECT_MEMORY.md` и был добавлен.
- Зафиксированы правила ведения лога и оптимизации цены при подготовке промтов для Cursor-прогера (выбор модели по S/M/L, выбирать дешевле при сомнениях, сначала read-only аудит).

Результат
- PASS: правила приняты, раздел лога создан, дальнейшие действия будут логироваться здесь отдельными записями на каждый новый месседж пользователя.

Как проверить (файлы)
- Открыть `/Users/User/Documents/created apps/AsyncScene/PROJECT_MEMORY.md` и найти раздел `## [CODEX] Assistant Log` и эту запись по заголовку времени.

Edge cases
- Если в одном сообщении пользователя несколько разных задач, все равно создается одна запись на месседж, но внутри с отдельными подпунктами по задачам.
- Если в PROMPT пользователя указана "текущая задача", но по фактам она уже закрыта (например smoke-check "там, где {PLACE}" уже PASS), в логе фиксируется фактический статус и источник (DevTools результаты и сообщение пользователя).

Next step
- Ждать следующий месседж пользователя и писать отдельную запись в этот лог с PASS/FAIL и следующими шагами.

## [PROGRAMMERS] Log

2026-01-15 00:10:00 UTC
- Files reviewed: `AsyncScene/Web/data.js`, `AsyncScene/Web/conflict/conflict-arguments.js`, `AsyncScene/Web/state.js`, `AsyncScene/Web/events.js`, `AsyncScene/Web/ui/ui-events.js`, `AsyncScene/Web/ui/ui-chat.js`, `AsyncScene/Web/ui/ui-dm.js`, `AsyncScene/Web/npcs.js`
- Entry points / functions checked:
  - `Data.buildArgCanon()` (post-index sanitization)
  - `sanitizeWhereAnswers()` and `sanitizeCanonWhereInText()` in `data.js`
  - runtime dev-assert in `conflict-arguments.js` (YN place check)
  - `applyReportByRole()` and `copDm()` in `state.js`
  - `helpEvent()` / `payoutCrowdPool()` in `events.js`
  - `renderOne()` summary block in `ui-events.js`
  - DM routing in `ui-dm.js` (mafia trap)
  - NPC definition in `npcs.js` (mafia name)
- What found: Unicode-aware sanitizers using `\p{L}` present in three locations; ARG_CANON_INDEX sanitized after build; YN "здесь" replacement implemented; dev-assert present.
- PASS/FAIL: PASS — place-phrase fix and YN ban appear implemented and applied to canonical index.
- Risk/regressions: Replacing standalone "здесь" with 'там, где {PLACE}' introduces a {PLACE} token into some YN answers that previously had none; runtime placeholder fill must supply a sensible place (Data.fillTemplate / Data.pickPlace). Confirm UX acceptable.
- Next step: run DevTools smoke-check (snippet in PROJECT_MEMORY.md) and confirm UI WHERE answers render correctly and no YN contains "здесь".

## [ASSISTANTS] Log

### 2026-01-15 01:40:00 JST - Проверил ограничения PROMPT A
- Проверил: установленные правила read-only, лог, запрет реальных правок без разрешения
- Результат: PASS
- Next: ждать указаний пользователя, готовлю plan/patch-preview при необходимости

- 2026-01-15 01:17:38 JST: проверили PROMPT A (ASSISTENT) - role reminder, read-only + log-only file `PROJECT_MEMORY.md`, model economy rule; результат PASS; next step - следить за новым сообщением и логировать действия/проверки в этот раздел per instructions.

## [CURSOR] Programmer Log

2026-01-14 12:05:00 UTC
- Files reviewed: `AsyncScene/Web/data.js`, `AsyncScene/Web/conflict/conflict-arguments.js`
- Checks performed:
  - Verified Unicode-aware regex for PLACE sanitizing: `/(^|[^\p{L}])(в|на|у)\s*\{PLACE\}/giu` present in three locations.
  - Verified replacement uses `$1там, где {PLACE}`.
  - Verified ARG_CANON_INDEX is sanitized immediately after Data.buildArgCanon().
  - Verified YN "здесь" ban via `/(^|[^\p{L}])здесь([^\p{L}]|$)/giu` and replacement to 'там, где {PLACE}' for YN answers.
- PASS/FAIL: PASS
- Next step: run smoke-check in runtime with the snippet below and confirm UI WHERE answers show "там, где <place>" and no YN contains "здесь".

DevTools verification snippet:
```js
(() => {
  const s = JSON.stringify(Game.Data.ARG_CANON_INDEX || {});
  console.log('ARG_CANON_INDEX includes "в {PLACE}" ?', s.includes('в {PLACE}'));
  console.log('ARG_CANON_INDEX includes "В {PLACE}" ?', s.includes('В {PLACE}'));
  const ynHasHere = Object.keys(Game.Data.ARG_CANON_INDEX || {}).some(k => {
    if (!k.toUpperCase().endsWith('|YN')) return false;
    const rec = Game.Data.ARG_CANON_INDEX[k];
    return Array.isArray(rec.items) && rec.items.some(it => it && typeof it.a === 'string' && /\bздесь\b/i.test(it.a));
  });
  console.log('Any YN answers include "здесь"?', ynHasHere);
})();
```

2026-01-15 12:04:00 UTC
- Files reviewed: `AsyncScene/Web/data.js`
- Entry points / functions checked:
  - `sanitizeWhereAnswers()`
  - `Data.buildArgCanon()` (index build + in-loop sanitize)
  - `sanitizeCanonWhereInText()`
- What found: Unicode-aware regexes using `\p{L}` with 'u' flag present in all three locations; replacements use `'$1там, где {PLACE}'`; YN "здесь" banned via `rxHere` -> replacement to 'там, где {PLACE}'.
- PASS/FAIL: PASS
- Risk/regressions: if JS engine does not support Unicode property escapes (`\p{L}`) regexes may throw or no-op (code wrapped in try/catch -> silent skip). Possible post-load overwrite of `Data.ARG_CANON_TEXT`/`ARG_CANON_INDEX` could bypass sanitizers.
- Next step: run runtime smoke-check (DevTools snippet above). If FAIL - investigate RegExp support and dynamic overwrites; prepare plan/patch-preview only after explicit permission.
