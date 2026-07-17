TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PHASE: WORK_PLAN
STATUS: READY_FOR_WORK
AUTHOR_ROLE: CHATGPT
SOURCE_BRANCH: work/model-selector-ui-authority-20260713
TARGET_BRANCH: infra/model-selector-ui-authority-20260713

## Atomic implementation

1. Update `AGENTS.md` model-selection policy.
   - Keep app-server discovery mandatory as supporting evidence.
   - Add explicit execution-surface reconciliation.
   - For the Codex desktop surface, active UI picker evidence controls actual selectability.
   - If app-server and UI differ, enter `MODEL_INVENTORY_RECONCILIATION_REQUIRED`.
   - If exact current UI inventory is unavailable, stop with `BLOCKED_MODEL_INVENTORY_MISMATCH` and request screenshot or text inventory.
   - If exact current UI inventory is supplied by the user in the same thread, use only that UI inventory for the candidate matrix.
   - Never merge extra app-server-only models into a UI matrix.

2. Update `plugins/asynchronia/skills/model-selector/SKILL.md`.
   - Add legal states for reconciliation and user UI inventory receipt.
   - Separate catalog evidence from picker evidence.
   - Record app-server errors and returned inventory without treating them as selectable when mismatch exists.
   - Define freshness requirements for user-confirmed UI inventory.
   - Preserve exact UI model names and effort labels.
   - Allow recommendation only after complete UI-reconciled inventory exists.
   - Keep same-thread CONTINUE and post-CONTINUE scope revalidation unchanged.

3. Update manifests to version 1.0.9.
   - `plugins/asynchronia/.codex-plugin/plugin.json`
   - `.agents/plugins/marketplace.json`
   - Adjust prompt text so it says app-server discovery plus active-surface reconciliation, not model/list equals picker visibility.

4. Update `tools/validate-asynchronia-auto-model-preflight.py`.
   - Expect version 1.0.9.
   - Require the new reconciliation policy and states.
   - Reject text claiming app-server output alone is authoritative picker evidence.
   - Add fixtures for:
     - matching app-server and UI inventory;
     - app-server subset of UI inventory;
     - app-server superset containing unavailable models;
     - schema/cache failure with valid user-confirmed UI inventory;
     - mismatch with no UI inventory, which must block;
     - exact label preservation;
     - rejection of stale cross-thread UI inventory;
     - no static fallback list and no fixed denominator.

5. Update task `STATE.md` with exact validation results and final implementation head.

## Required validation

- `python3 tools/validate-asynchronia-auto-model-preflight.py`
- `python3 tools/validate-orchestration-policy.py`
- `python3 tools/validate_ai_work_pipeline.py`
- `git diff --check`
- Verify changed paths equal the exact write scope.
- Verify no static model inventory or fixed pair denominator was added.
- Verify root policy, plugin skill, manifest, marketplace entry, and validator all agree on version 1.0.9 and the same authority rules.

## Review evidence

Return:

- baseline and final remote head;
- exact changed paths;
- exact validator outputs and exit codes;
- old-policy rejection fixture result;
- UI mismatch reconciliation fixture results;
- plugin version parity across source and marketplace;
- statement that no runtime, bridge, AI Forensics implementation, or main path changed;
- status `READY_FOR_REVIEW` only.

## Integration rule

Do not integrate to main in this task. Independent review and a later serialized integration step are required. The installed local plugin must not be called refreshed until post-integration parity is actually checked.
