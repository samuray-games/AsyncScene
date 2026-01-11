# Economy wave 2 — Scope package (for Valera gate)

Цель: зафиксировать **минимальный** и проверяемый scope для Economy wave 2 на основе `AsyncScene/Web/economy update.txt`.

## 1) Что берём из `AsyncScene/Web/economy update.txt`
Берём только пункт **7.3 escape** (выйти из конфликта через escape):
- “REP -”
- “Influence -”
- “никаких Points”
- “Escape и dismiss — разные социальные сигналы”

Источник: `AsyncScene/Web/economy update.txt` (примерно строки 7940–7951).

## 2) Что НЕ берём в wave 2 (явно out-of-scope)
- “тон как давление” (battle_end, влияние/реп-эффекты) — отдельный gate и отдельная волна
- 7.4 revenge_request — отдельный gate и отдельная волна (требует новых состояний/циклов)
- NPC правила “непобедимы для обычного игрока” — отдельный gate и отдельная волна
- Любые UI изменения (`AsyncScene/Web/ui/**`) — отдельный UI gate пакет, если понадобится

## 3) Какие файлы/модули трогаем (ограничение)
Разрешённый минимум для реализации:
- `AsyncScene/Web/conflict/conflict-core.js` — экономические эффекты при исходе escape (включая ветку успешного escape и отказанного escape)
- (опционально) `AsyncScene/Web/data.js` — хранение чисел штрафов как параметров данных

Запрещено в wave 2:
- Любые UI файлы (`AsyncScene/Web/ui/**`)
- Любые массовые рефакторы/cleanup
- Любые изменения правил аргументов/победы/поражения, кроме экономических последствий escape

## 4) Инварианты wave 2
- REP v1.0 инварианты сохраняются:
  - REP меняется через `transferRep`
  - `addRep` не используется в prod-логике (dev-only допускается существующим guard)
  - каждая операция имеет `reason` и `battleId/eventId`
  - операции логируются в `moneyLog`/`moneyLogByBattle`
- В wave 2 **не меняем**:
  - Points (никаких списаний/начислений/трансферов) на исходах escape
  - механику аргументов/правила победы/поражения
- В wave 2 **меняем только**:
  - REP (штраф) и Influence (штраф) на исходах escape

## 5) Открытые параметры (должны быть решены gate-ом Валеры)
Чтобы не “додумывать механику” от имени ассистента, значения фиксирует Valera:
- `REP_ESCAPE_PENALTY_OK` (целое число, штраф при успешном escape)
- `REP_ESCAPE_PENALTY_STAY` (целое число, штраф при отказе/неудаче escape)
- `INF_ESCAPE_PENALTY_OK` (целое число, штраф influence при успешном escape)
- `INF_ESCAPE_PENALTY_STAY` (целое число, штраф influence при отказе/неудаче escape)
- `rep reasons` (строки, например `rep_escape_ok_penalty` / `rep_escape_stay_penalty`), чтобы аудитить `rg`
- политика клипа: что делать, если influence < штрафа (клип до 0 или допускаем отрицательное)

## 6) Критерии PASS/FAIL для wave 2 (gate + аудит)
### PASS (по фактам)
- В `AsyncScene/Web/conflict/conflict-core.js` на исходах escape:
  - нет изменения Points
  - REP штраф применяется через `Game.StateAPI.transferRep(...)` с заполненными `reason` и `battleId`
  - Influence штраф применяется (без UI) и не уводит в неконсистентное состояние (политика клипа соответствует gate)
- В ветках escape **не используется** старый “положительный” reason, если он противоречит wave 2 (например `rep_escape_ok` как награда) — либо он удалён, либо переопределён gate-ом как “неиспользуемый” в wave 2
- `rg -n "rep_escape_ok\\b|rep_escape_stay\\b" AsyncScene/Web/conflict/conflict-core.js` не показывает “награду” REP за escape (если это противоречит штрафам wave 2)

### FAIL
- Любые изменения UI файлов
- Любые изменения Points на исходах escape
- Использование `addRep` в прод-контурах
- Нет `reason`/`battleId` у REP операции escape

## 7) Роли и порядок (эстафета)
1) Valera — gate PASS/FAIL/BACKLOG по этому документу
2) Misha — реализация строго по PASS условиям
3) Dima — read-only аудит фактов (PASS/FAIL/INFO)

