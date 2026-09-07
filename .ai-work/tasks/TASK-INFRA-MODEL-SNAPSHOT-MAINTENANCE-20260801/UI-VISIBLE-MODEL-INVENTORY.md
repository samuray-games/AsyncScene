TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801
PIPELINE_VERSION: 1.0.16
PHASE: UI_VISIBLE_MODEL_INVENTORY
STATUS: PENDING_CONFIRMATION
CONFIRMED_AT: 2026-08-01T14:31:00+09:00
CONFIRMED_AT_UTC: 2026-08-01T05:31:00Z
CONFIRMATION_SOURCE: USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY
APPLICATION_SURFACE: CODEX_DESKTOP_APP

### Raw visible picker evidence

The user directly confirmed these five visible picker rows, in the observed order:

1. `5.5`
2. `5.6 Luna`
3. `5.6 Terra`
4. `5.6 Sol`
5. `6 Astra`

The picker contains 5 visible model rows and 27 visible row-effort entries.

Raw effort sets:

1. `5.5`: Light, Medium, High, Extra High
2. `5.6 Luna`: Light, Medium, High, Extra High, Max
3. `5.6 Terra`: Light, Medium, High, Extra High, Max, Ultra
4. `5.6 Sol`: Light, Medium, High, Extra High, Max, Ultra
5. `6 Astra`: Light, Medium, High, Extra High, Max, Ultra

### Canonical selector inventory

The executable selector requires unique model identifiers and every model-effort pair exactly once. The duplicate Luna observation is deduplicated only because both rows have the same visible label and effort set and the selector schema forbids duplicate identifiers.

- 5.5: Light, Medium, High, Extra High
- 5.6 Luna: Light, Medium, High, Extra High, Max
- 5.6 Terra: Light, Medium, High, Extra High, Max, Ultra
- 5.6 Sol: Light, Medium, High, Extra High, Max, Ultra
- 6 Astra: Light, Medium, High, Extra High, Max, Ultra

Complete unique model count: 5.
Complete unique model-effort pair count: 27.

Canonical identifiers, in the exact ordered inventory above:

1. `5.5` -> `gpt-5.5`
2. `5.6 Luna` -> `gpt-5.6-luna`
3. `5.6 Terra` -> `gpt-5.6-terra`
4. `5.6 Sol` -> `gpt-5.6-sol`
5. `6 Astra` -> `gpt-6-astra`

This artifact supersedes the stale 6-model/29-pair authority and establishes the current 5-model/27-pair inventory. It contains `6 Astra` and no `5.4 Mini`, `5.4`, or `5.6 Astra` entry.
