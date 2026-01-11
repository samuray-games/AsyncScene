# Economy wave 1 — Scope package (for Valera gate)

Цель: зафиксировать **минимальный** и проверяемый scope для Economy wave 1 на основе `AsyncScene/Web/economy update.txt`.

## 1) Что берём из `AsyncScene/Web/economy update.txt`
Берём только пункт **7.2 dismiss_click (кнопка «послать», VL5)**:
- “баттл немедленно закрывается”
- “REP -”
- “Influence не меняется”
- “Points не меняяются”
- “логируется как репутационный фейл, не как побег”

Источник: `AsyncScene/Web/economy update.txt` (примерно строки 7923–7937).

## 2) Что НЕ берём в wave 1 (явно out-of-scope)
- 7.3 escape (REP-/Influence-/без Points) — требует отдельного решения и потенциально UI/баланс-эффектов
- 7.4 revenge_request — новый цикл/интерфейсы/состояния
- “тон как давление” — влияет на outcome/balance/реп-конверсию
- NPC правила “непобедимы для обычного игрока” — меняет бой/баланс
- Любые UI изменения (wave 1 — core/economy only)

## 3) Какие файлы/модули трогаем (ограничение)
Разрешённый минимум для реализации:
- `AsyncScene/Web/conflict/conflict-core.js` — корректировка экономического эффекта для режима `off` (“послать”/dismiss) при успешном завершении
- (опционально, если нужно для констант) `AsyncScene/Web/data.js` — хранение числового значения штрафа как параметра данных

Запрещено в wave 1:
- Любые файлы UI (`AsyncScene/Web/ui/**`)
- Любые массовые рефакторы/cleanup

## 4) Инварианты wave 1
- REP v1.0 инварианты сохраняются:
  - REP меняется через `transferRep`
  - `addRep` не используется в prod-логике (dev-only допускается существующим guard)
  - каждая операция имеет `reason` и `battleId/eventId`
  - операции логируются в `moneyLog`/`moneyLogByBattle`
- В wave 1 **не меняем**:
  - Points (никаких списаний/начислений/трансферов)
  - Influence
  - механику аргументов/правила победы/поражения

## 5) Открытые параметры (должны быть решены gate-ом Валеры)
Чтобы не “додумывать механику” от имени ассистента, значения фиксирует Valera:
- `REP_DISMISS_PENALTY` (целое число; знак “минус” означает штраф)
- `rep reason` строка (например `rep_dismiss`), чтобы её можно было аудитить `rg`
- Политика при недостатке REP у игрока: допускаем уход в отрицательные или клип до 0 (сейчас `transferRep` допускает отрицательные значения)

## 6) Критерии PASS/FAIL для wave 1 (gate + аудит)
### PASS (по фактам)
- В `AsyncScene/Web/conflict/conflict-core.js` режим `off` (“послать”) при успешном завершении:
  - не выдаёт “побеговую” награду REP (например `rep_escape_ok`)
  - применяет штраф REP через `Game.StateAPI.transferRep(...)` с заполненными `reason` и `battleId`
  - не трогает Points/Influence
- `rg -n "rep_escape_ok" AsyncScene/Web/conflict/conflict-core.js` не находит применение этого reason в ветке `mode === "off"`
- `rg -n "rep_dismiss|dismiss" AsyncScene/Web/conflict/conflict-core.js` находит новую ветку/причину (auditability)

### FAIL
- Любые изменения UI файлов
- Любые изменения Points/Influence в рамках dismiss
- Использование `addRep` в прод-контурах
- Нет `reason`/`battleId` у REP операции dismiss

## 7) Роли и порядок (эстафета)
1) Valera — gate PASS/FAIL/BACKLOG по этому документу
2) Misha — реализация строго по PASS условиям
3) Dima — read-only аудит фактов (PASS/FAIL/INFO)

