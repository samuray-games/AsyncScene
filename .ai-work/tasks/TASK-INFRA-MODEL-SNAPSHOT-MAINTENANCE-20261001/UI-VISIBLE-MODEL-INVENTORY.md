TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20261001
SNAPSHOT_REVISION: 20261001.1
CONFIRMED_TIMESTAMP: 2026-10-01T09:51:07Z
CONFIRMATION_SOURCE: USER_CONFIRMED_CURRENT_CODEX_MODEL_INVENTORY
APPLICATION_SURFACE: CODEX_DESKTOP_APP
STATUS: PENDING_CONFIRMATION
SUPERSEDES: 20260801.1

### User-confirmed model inventory

The eight picker models are recorded in the exact user-confirmed order:

1. `6.1 Sol` -> `gpt-6.1-sol`
2. `6 Astra` -> `gpt-6-astra`
3. `6 Sol` -> `gpt-6-sol`
4. `6 Luna` -> `gpt-6-luna`
5. `5.6 Sol` -> `gpt-5.6-sol`
6. `5.6 Terra` -> `gpt-5.6-terra`
7. `5.6 Luna` -> `gpt-5.6-luna`
8. `5.5` -> `gpt-5.5`

Effort names and order follow the current selector authority: Light, Medium, High, Extra High, Max, Ultra. The confirmed model-specific effort sets are:

- 6.1 Sol: Light, Medium, High, Extra High, Max, Ultra
- 6 Astra: Light, Medium, High, Extra High, Max, Ultra
- 6 Sol: Light, Medium, High, Extra High, Max, Ultra
- 6 Luna: Light, Medium, High, Extra High, Max
- 5.6 Sol: Light, Medium, High, Extra High, Max, Ultra
- 5.6 Terra: Light, Medium, High, Extra High, Max, Ultra
- 5.6 Luna: Light, Medium, High, Extra High, Max
- 5.5: Light, Medium, High, Extra High

The resulting canonical inventory contains 8 models and 44 model-effort pairs.

### Stable model-floor rank extension

The selector compares a candidate's stable model-floor rank with the required floor using `>=`; larger ranks satisfy stronger minimum-model floors. Equal ranks are supported by the established policy. The accepted GPT-5.6 ranks remain Luna 0, Terra 1, Sol 2. The historical selector-inventory candidate assigned GPT-6 Astra rank 3; that value is retained. Unranked models are placed by the confirmed inventory order: a new leading run receives increasing ranks above its next existing anchor; an unranked run between anchors inherits the preceding, stronger anchor rank so it remains ordered without changing accepted ranks; a trailing run receives decreasing ranks below its preceding anchor. This uses no price data.

For this inventory, the resolved ranks in model order are 4, 3, 3, 3, 2, 1, 0, -1. Duplicate ranks form one floor equivalence class; unique ranks remain contiguous from -1 through 4. Removed 5.4 and 5.4 Mini models are not accepted by the active rank map.
