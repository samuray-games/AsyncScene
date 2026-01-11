# Economy wave 3 — Scope package (for Valera gate)

Цель: зафиксировать **минимальный** и проверяемый scope для Economy wave 3 на основе `AsyncScene/Web/economy update.txt`.

## 1) Что берём из `AsyncScene/Web/economy update.txt`
Берём только “механику реванша” (revenge/rematch):
- Запрос реванша доступен только проигравшему
- Стоимость запроса: 1 Point (с возможной эскалацией 1→2→3…)
- При запросе: микро-минус REP (“навязчивость”)
- При ответе:
  - accept → стартует новый баттл (помечен как revenge/rematch)
  - decline → запрошенный Point “сгорает” (см. ниже про трактовку), отклонивший получает микро-минус REP (“избежал проверки”)
- Ограничения: либо кулдаун/лимит/рост цены; минимум: один реванш на оппонента без эскалации

Источник: `AsyncScene/Web/economy update.txt` (примерно строки 7098–7137 и 7271–7309).

## 2) Важно: UI-часть отделена
В исходнике есть “уведомление «X просит реванш»” и кнопки accept/decline по смыслу.
Это **UI/UX**, поэтому для wave 3:
- **core/economy** (механика, состояние, логи) — в этом документе
- **UI** — отдельный gate пакет (`ECONOMY_WAVE3_UI_GATE.md`) и отдельная gate-задача

## 3) Какие файлы/модули трогаем (ограничение)
Разрешённый минимум для реализации core:
- `AsyncScene/Web/conflict/conflict-core.js` — создание “следующего” баттла при accept, привязка к исходному battleId (rematchOf)
- `AsyncScene/Web/conflict/conflict-api.js` — публичные функции/эндпоинты для request/accept/decline (без UI)
- `AsyncScene/Web/conflict/conflict-economy.js` — points transfer (проигравший→оппонент) и логирование транзакций (если это не покрывается существующим Econ.transferPoints)
- `AsyncScene/Web/state.js` — хранение минимального состояния “pending rematch” (ВАЖНО: не использовать существующее `State.revengeUntil`, это другой смысл)

Запрещено в wave 3 core:
- Любые изменения UI файлов (`AsyncScene/Web/ui/**`)
- Любые массовые рефакторы/cleanup

## 4) Инварианты wave 3
- Points:
  - Только трансферы между участниками (проигравший → оппонент), без эмиссии
  - Любой трансфер логируется (moneyLog/moneyLogByBattle) и имеет reason + battleId/eventId
- REP v1.0 инварианты сохраняются:
  - REP меняется через `transferRep`
  - `addRep` не используется в prod-логике (dev-only допускается существующим guard)
  - каждая операция имеет `reason` и `battleId/eventId`
  - операции логируются в `moneyLog`/`moneyLogByBattle`
- В wave 3 **не меняем**:
  - базовую механику аргументов/правила победы/поражения
  - “тон как давление”, NPC-правила (это отдельные волны)

## 5) Открытые параметры (должны быть решены gate-ом Валеры)
Чтобы не “додумывать механику” от имени ассистента, значения фиксирует Valera:
- `REMATCH_COST_BASE` (обычно 1 Point)
- Правило эскалации стоимости: `1→2→3…` / “один реванш без эскалации” / лимит попыток / кулдаун
- `REP_REMATCH_REQUEST_PENALTY` (микро-минус) и `reason` (например `rep_rematch_request`)
- `REP_REMATCH_DECLINE_PENALTY` (микро-минус) и `reason` (например `rep_rematch_decline`)
- Трактовка “point сгорает”:
  - либо трансферится оппоненту сразу при request (и тогда при decline он просто остаётся у оппонента)
  - либо уходит в `sink` при decline (если нужен “сгорающий” смысл)
  - (важно: выбрать одну трактовку и reason'ы, чтобы аудитить)
- Ограничение “только проигравший” — как определяется (по battle.result или другой метке)

## 6) Критерии PASS/FAIL для wave 3 (gate + аудит)
### PASS (по фактам)
- Есть механизм request/accept/decline в core (`conflict-api.js`/`conflict-core.js`) без UI
- При request:
  - списывается/трансферится Points по выбранной трактовке (без эмиссии) + reason + battleId/eventId + moneyLog
  - применяется микро-минус REP с reason + battleId/eventId
- При decline:
  - применяется микро-минус REP у отклонившего с reason + battleId/eventId
  - Points обработаны строго по выбранной трактовке (“сгорает”/“уже у оппонента”)
- При accept:
  - создаётся новый баттл, связанный с исходным (например `rematchOf=<oldBattleId>`) и помеченный как rematch/revenge
- Нет изменений UI файлов

### FAIL
- Любые изменения UI файлов
- Любая эмиссия Points (addPoints без разрешения) или прямые `points +=` вне разрешённых трансферов
- Использование `addRep` в прод-контурах
- Нет `reason`/`battleId` у REP/Points операций

## 7) Роли и порядок (эстафета)
1) Valera — gate PASS/FAIL/BACKLOG по этому документу
2) Misha — реализация строго по PASS условиям
3) Dima — read-only аудит фактов (PASS/FAIL/INFO)

