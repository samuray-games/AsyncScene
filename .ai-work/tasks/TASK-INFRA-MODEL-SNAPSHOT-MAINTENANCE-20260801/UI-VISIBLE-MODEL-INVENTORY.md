TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801
PIPELINE_VERSION: 1.0.16
PHASE: UI_VISIBLE_MODEL_INVENTORY
STATUS: PENDING_CONFIRMATION
CONFIRMED_AT: 2026-08-01T14:31:00+09:00
CONFIRMED_AT_UTC: 2026-08-01T05:31:00Z
CONFIRMATION_SOURCE: USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY
APPLICATION_SURFACE: CODEX_DESKTOP_APP

### Raw visible picker evidence

The user directly confirmed these seven visible picker rows, in the observed order:

1. `5.6 Sol`
2. `5.6 Terra`
3. `5.6 Luna`
4. `5.6 Luna`
5. `5.5`
6. `5.4`
7. `5.4 Mini`

The two `5.6 Luna` rows were visually identical and exposed the same effort set. No distinct identifier or behavioral distinction was visible. The raw picker therefore contains 7 visible model rows and 34 visible row-effort entries.

Raw effort sets:

1. `5.4 Mini`: Light, Medium, High, Extra High
2. `5.4`: Light, Medium, High, Extra High
3. `5.5`: Light, Medium, High, Extra High
4. `5.6 Luna` row 1: Light, Medium, High, Extra High, Max
5. `5.6 Luna` row 2: Light, Medium, High, Extra High, Max
6. `5.6 Terra`: Light, Medium, High, Extra High, Max, Ultra
7. `5.6 Sol`: Light, Medium, High, Extra High, Max, Ultra

### Canonical selector inventory

The executable selector requires unique model identifiers and every model-effort pair exactly once. The duplicate Luna observation is deduplicated only because both rows have the same visible label and effort set and the selector schema forbids duplicate identifiers.

- 5.4 Mini: Light, Medium, High, Extra High
- 5.4: Light, Medium, High, Extra High
- 5.5: Light, Medium, High, Extra High
- 5.6 Luna: Light, Medium, High, Extra High, Max
- 5.6 Terra: Light, Medium, High, Extra High, Max, Ultra
- 5.6 Sol: Light, Medium, High, Extra High, Max, Ultra

Complete unique model count: 6.
Complete unique model-effort pair count: 29.

Canonical identifiers, in the exact ordered inventory above:

1. `5.4 Mini` -> `gpt-5.4-mini`
2. `5.4` -> `gpt-5.4`
3. `5.5` -> `gpt-5.5`
4. `5.6 Luna` -> `gpt-5.6-luna`
5. `5.6 Terra` -> `gpt-5.6-terra`
6. `5.6 Sol` -> `gpt-5.6-sol`

This artifact supersedes snapshot revision `20260722.1` and establishes `20260801.1`. It contains no invented Luna identifier, no combined `5.6 Terra/Sol` model, and no unseen effort.
