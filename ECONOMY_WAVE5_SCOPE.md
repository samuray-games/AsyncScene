# Economy wave 5 — Scope package (or STOP) (for Valera gate)

## STOP (рекомендация координатора)
На текущий момент wave 5 **не запускаем** до закрытия wave 4 по эстафете (`T-20260111-045`..`T-20260111-048`) и ручной проверки игры творцом.

Причины STOP (факты/риски процесса):
- Wave 4 ещё не прошла gate/реализацию/аудит, а wave 5 по источнику затрагивает более “опасные” места (outcome/balance/NPC).
- Без подтверждения стабильности wave 4 невозможно корректно зафиксировать инварианты и чек-лист аудита для wave 5.

Если Valera хочет всё же открыть wave 5 — ниже **фиксированный параметрами** кандидатный scope (как “пакет на gate”: PASS/FAIL/BACKLOG).

---

## Wave 5 (фиксированный пакет, если gate решит НЕ STOP)
Цель: внедрить **минимальный** и проверяемый `battle_end` REP-эффект по “разнице сил”, без UI.

### 1) Что берём из `AsyncScene/Web/economy update.txt`
Берём только часть **7.1 battle_end**: “эффект REP по исходу баттла” в минимальной форме:
- В `battle_end` применяется REP-эффект по результату и “разнице сил”
- В тексте источника это обозначено как: апсет / позор / ноль (равные)

Источник: `AsyncScene/Web/economy update.txt`, раздел “7.1 battle_end”.

### 2) Что НЕ берём в wave 5 (явно out-of-scope)
- “Несоответствие тона (желтый против красного = автопоражение)” — отдельная волна.
- NPC правила “непобедимы для обычного игрока” — отдельная волна.
- Любые UI изменения (`AsyncScene/Web/ui/**`) — отдельный UI gate пакет, если понадобится.
- Любые изменения Points — запрещены.
- Массовый cleanup/рефактор — запрещён.

### 3) Минимальная механика (in-scope)
**W5.1 rep-by-strength-delta (только для локального игрока `me`):**
- На исходе `win/lose/draw` для `me`:
  - вычислить “дельту сил” по заранее зафиксированному правилу (см. п. 6)
  - применить REP изменение через `transferRep` (инварианты REP v1.0), amount определяется таблицей (см. п. 6)
  - operations имеют `reason` и `battleId`

Примечание: текущая экономика в `AsyncScene/Web/conflict/conflict-economy.js` уже содержит “difficulty-based repGain” в ветке legacy (не circulation). Wave 5 либо:
- заменяет это правило на gate-утверждённое (минимально), либо
- выключает/клипует существующее правило и вводит новое с отдельным reason.
В этом фиксированном пакете: **заменяем repGain в legacy win/lose/draw** на таблицу wave 5 (см. п. 6). UI не трогаем.

### 4) Какие файлы/модули трогаем (ограничение)
Разрешённый минимум:
- `AsyncScene/Web/conflict/conflict-economy.js` — единая точка применения REP на исходах (win/lose/draw)
- (опционально) `AsyncScene/Web/data.js` — хранение порогов/таблиц и reasons

Запрещено:
- Любые UI файлы (`AsyncScene/Web/ui/**`)
- `AsyncScene/Web/conflict/conflict-arguments.js` (аргументы)
- Любая правка исходов боя/победы/поражения (только экономический “эффект после”)

### 5) Инварианты wave 5
- REP v1.0:
  - REP меняется только через `transferRep`
  - `addRep` в prod не используется
  - у операций есть `reason` и `battleId/eventId`
  - операции логируются (moneyLog/moneyLogByBattle)
- Points/Influence: wave 5 **не меняет**

### 6) Параметры (зафиксированы в этом пакете)
#### 6.1 Как считаем “strength delta”
Используем tiers, совместимые с уже существующей моделью “тон = tier по influence” (см. `tierByInfluence` в `AsyncScene/Web/conflict/conflict-core.js`):
- `y` → 1
- `o` → 2
- `r` → 3
- `k` → 4

`tierDiff = myTier - oppTier`

Категории:
- `UPSET_BIG`: `tierDiff <= -2` (я заметно слабее, но победил)
- `UPSET_SMALL`: `tierDiff == -1`
- `EQUAL_OR_STRONGER`: `tierDiff >= 0`

Симметрично для поражения (позор):
- `SHAME_BIG`: `tierDiff >= 2` (я заметно сильнее, но проиграл)
- `SHAME_SMALL`: `tierDiff == 1`
- `EQUAL_OR_WEAKER`: `tierDiff <= 0`

#### 6.2 Таблица REP по исходу
Значения — целые числа (микро-эффекты), без UI:

**WIN (я победил):**
- `UPSET_BIG` → `+2`
- `UPSET_SMALL` → `+1`
- `EQUAL_OR_STRONGER` → `0`

**LOSE (я проиграл):**
- `SHAME_BIG` → `-2`
- `SHAME_SMALL` → `-1`
- `EQUAL_OR_WEAKER` → `0`

**DRAW:**
- всегда `0`

#### 6.3 reasons (строки для аудита)
- `rep_battle_upset_win` (WIN +, категория upset)
- `rep_battle_shame_lose` (LOSE -, категория shame)

#### 6.4 Политика клипа
- REP: клип по доступному REP (как уже принято в wave 3/wave 4), т.е. при “минус REP” не уходим в отрицательные.
- Если `transferRep` уже клипует — используем его поведение как single source of truth; иначе добавляем клип в этом контуре (в рамках wave 5).

### 7) Критерии PASS/FAIL для wave 5 (gate + аудит)
PASS:
- Реализация ограничена `conflict-economy.js` (+ опционально `data.js`)
- REP эффект после `battle_end` применён только через `transferRep` с `reason` и `battleId`
- UI/Points/Influence не менялись

FAIL:
- Любые изменения UI
- Любые изменения Points/Influence
- Использование `addRep` в prod
- Нет явной фиксации параметров в gate-Result
