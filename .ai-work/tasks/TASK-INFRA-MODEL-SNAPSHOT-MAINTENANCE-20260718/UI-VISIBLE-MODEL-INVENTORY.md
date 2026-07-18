TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718
PIPELINE_VERSION: 1.0.11
PHASE: UI_VISIBLE_MODEL_INVENTORY
STATUS: PENDING_CONFIRMATION
CREATED_AT: 2026-07-18T15:29:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260718@2f418a95e771a8d2a2f7231f27df3940b412b94e

### User-confirmed active Codex UI picker

The user directly inspected the active Codex Desktop picker on 2026-07-18 and confirmed this complete inventory. This private UI inventory is the source for this maintenance snapshot; this artifact does not claim that official OpenAI documentation independently confirms the private picker contents.

- 5.5: Light, Medium, High, Extra High
- 5.6 Luna: Light, Medium, High, Extra High, Max
- 5.6 Terra/Sol: Light, Medium, High, Extra High, Max, Ultra

Complete model count: 3.
Complete model-effort pair count: 15.

Pairs, in exact picker order:

1) 5.5 / Light
2) 5.5 / Medium
3) 5.5 / High
4) 5.5 / Extra High
5) 5.6 Luna / Light
6) 5.6 Luna / Medium
7) 5.6 Luna / High
8) 5.6 Luna / Extra High
9) 5.6 Luna / Max
10) 5.6 Terra/Sol / Light
11) 5.6 Terra/Sol / Medium
12) 5.6 Terra/Sol / High
13) 5.6 Terra/Sol / Extra High
14) 5.6 Terra/Sol / Max
15) 5.6 Terra/Sol / Ultra

### Inventory change record

The previously visible models `5.4 Mini` and `5.4` disappeared from the active picker and are intentionally absent. `5.6 Terra/Sol` is one combined model label and must not be split into Terra and Sol.

This artifact supersedes snapshot revision `20260715.1` and establishes snapshot revision `20260718.1`. Do not add models or efforts that were not observed in the confirmed picker inventory, including values from historical files, caches, APIs, documentation, assumptions, or previous snapshots.

### Authority

Confirmation source: `USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY`.
Application surface: `CODEX_DESKTOP_APP`.
Confirmed timestamp: `2026-07-18T06:29:00Z`.
