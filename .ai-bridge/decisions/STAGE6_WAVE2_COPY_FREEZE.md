# Stage 6 Wave 2 Copy Freeze

FREEZE_ID: S6-W2-COPY-FREEZE-20260708-01
STATUS: USER_ACCEPTED_RECOMMENDED_SET
ACCEPTANCE_TRIGGER: user replied `продолжаем` immediately after the coordinator presented the six recommended decisions
POLICY_HEAD: 873e67387e7c4db88c1b07772ef928ee17187210
PRODUCT_EVIDENCE_BASELINE: a8a7e3acacbe2ba7fe6a387cb647d09d7d701a4d
BOOMER_DECISION_OUTBOX: .ai-bridge/outbox/BRIDGE-20260707-031-02-codex.md
BOOMER_DECISION_COMMIT: d439fb8cd5f42f3a5abed3155703cc48bbb5d9d1
ALPHA_DECISION_OUTBOX: .ai-bridge/outbox/BRIDGE-20260707-032-02-codex.md
ALPHA_DECISION_COMMIT: 41f6a7bfa075ef05766bd6548961baefbdc4e6e4
COLLISION_PACKAGE: .ai-bridge/outbox/BRIDGE-20260707-030-02-codex.md
COLLISION_COMMIT: 7c126060bbbd96be07f12c1e876f72cd01b5265f

## Frozen Boomer decisions

- PD-01: `Игрок отсутствует.`
- PD-02: `Конфликт`
- PD-03: `Баланс`
- All 29 rows marked `PREPARED_PENDING_USER_APPROVAL` in the accepted Boomer decision package are approved exactly as written.
- Placeholders, protected tokens, numbers, emoji, handlers, economy, battle, report, NPC, state and routing semantics remain unchanged.

## Frozen Alpha decisions

- `dm.teach.toggle`: `Передать аргумент`
- `dm.invite`: `Указать имя`
- hardcoded Like CTA: `Поддержать ❤️`
- Escape canonical action: `Уйти`
- Exact Teach templates and Social-action rows in the accepted Alpha package are approved exactly as written.
- Vote and Report remain runtime-required contracts, not accepted runtime implementation.
- Undecided system-event copy explicitly marked KEEP in the Alpha package remains unchanged.

## Collision freeze

Product implementation is serialized in this order:

1. Wave I: `AsyncScene/Web/system.js` + `docs/system.js`
2. Wave II: `AsyncScene/Web/ui/ui-dm.js` + `docs/ui/ui-dm.js`
3. Wave III: `AsyncScene/Web/events.js` + `docs/events.js` + `AsyncScene/Web/ui/ui-events.js` + `docs/ui/ui-events.js`
4. Wave IV: `AsyncScene/Web/data.js` + `docs/data.js` + `AsyncScene/Web/ui/ui-battles.js` + `docs/ui/ui-battles.js` + `AsyncScene/Web/conflict/conflict-core.js` + `docs/conflict/conflict-core.js`
5. Wave V: `AsyncScene/Web/index.html` + `docs/index.html`, then dev-checks/boot singleton work
6. Wave VI: shared `TASKS.md` + `PROJECT_MEMORY.md` reconciliation by the serialized docs owner

Only one product-writing implementation wave may be active at a time. No later wave may begin before the preceding wave is independently verified and accepted.
