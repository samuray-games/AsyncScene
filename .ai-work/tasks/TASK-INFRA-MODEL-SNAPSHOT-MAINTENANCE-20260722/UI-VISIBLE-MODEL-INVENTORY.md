TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722
PIPELINE_VERSION: 1.0.11
PHASE: UI_VISIBLE_MODEL_INVENTORY
STATUS: PENDING_CONFIRMATION
CREATED_AT: 2026-07-22T02:36:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260722@fb93ef9c5f8eda44fea87ae7cb8eb4ab5b490348

### User-confirmed active Codex UI picker

The user directly inspected the active Codex Desktop picker on 2026-07-22 02:36:00+09:00 and confirmed this complete inventory. This private UI inventory is the source for this maintenance snapshot; this artifact does not claim that official OpenAI documentation independently confirms the private picker contents.

- 5.4 Mini: Light, Medium, High, Extra High
- 5.4: Light, Medium, High, Extra High
- 5.5: Light, Medium, High, Extra High
- 5.6 Luna: Light, Medium, High, Extra High, Max
- 5.6 Terra/Sol: Light, Medium, High, Extra High, Max, Ultra

Complete model count: 5.
Complete model-effort pair count: 23.

Pairs, in exact picker order:

1) 5.4 Mini / Light
2) 5.4 Mini / Medium
3) 5.4 Mini / High
4) 5.4 Mini / Extra High
5) 5.4 / Light
6) 5.4 / Medium
7) 5.4 / High
8) 5.4 / Extra High
9) 5.5 / Light
10) 5.5 / Medium
11) 5.5 / High
12) 5.5 / Extra High
13) 5.6 Luna / Light
14) 5.6 Luna / Medium
15) 5.6 Luna / High
16) 5.6 Luna / Extra High
17) 5.6 Luna / Max
18) 5.6 Terra/Sol / Light
19) 5.6 Terra/Sol / Medium
20) 5.6 Terra/Sol / High
21) 5.6 Terra/Sol / Extra High
22) 5.6 Terra/Sol / Max
23) 5.6 Terra/Sol / Ultra

### Inventory change record

The previously absent models `5.4 Mini` and `5.4` have returned to the active picker. `5.6 Terra/Sol` remains one combined model label and must not be split into Terra and Sol.

This artifact supersedes snapshot revision `20260718.1` and establishes snapshot revision `20260722.1`. Do not add models or efforts that were not observed in the confirmed picker inventory, including values from historical files, caches, APIs, documentation, assumptions, or previous snapshots.

### Authority

Confirmation source: `USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY`.
Application surface: `CODEX_DESKTOP_APP`.
Confirmed timestamp: `2026-07-22T02:36:00+09:00`.
