Use @asynchronia plugin.

TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801
PIPELINE_VERSION: 1.0.16
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-08-01T14:31:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260801@3e9602903ab124658319abd584c480682002feb4

### Atomic goal

Replace stale selector snapshot revision `20260722.1` with a new user-confirmed Codex Desktop picker snapshot revision `20260801.1`, producing six unique models and 29 unique model-effort pairs, then publish a draft PR from `infra/model-snapshot-maintenance-20260801`.

### Exact baseline

- Repository: `samuray-games/AsyncScene` at `/Users/User/Documents/created apps/AsyncScene`.
- Branch: `infra/model-snapshot-maintenance-20260801`.
- Baseline SHA: `3e9602903ab124658319abd584c480682002feb4`.

### Allowed reads

- The authority, process, memory, selector, parser, snapshot, focused tests, validators, and prior maintenance directory named by the user.

### Allowed writes

- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801/01-chat-brief.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801/STATE.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801/UI-VISIBLE-MODEL-INVENTORY.md`
- `plugins/asynchronia/model-selector-authority.json`
- `plugins/asynchronia/model_selector.py`
- `plugins/asynchronia/snapshots/confirmed-model-effort-snapshot.json`
- `tools/test_model_selector_snapshot.py`
- `tools/test_model_selector_runtime.py`

### Forbidden changes

Do not continue the blocked security branch; do not modify `main`, bridge or mailbox refs, runtime/gameplay, economy/persistence, deployment mirrors, memory files, installed plugin caches, historical maintenance directories, plugin version surfaces, pricing, or ranking policy. Do not invoke normal executable selector authorization for mutation.

### Dependencies

The user-confirmed picker evidence is timestamped `2026-08-01T05:31:00Z` and contains visible rows `5.6 Sol`, `5.6 Terra`, `5.6 Luna`, `5.6 Luna`, `5.5`, `5.4`, `5.4 Mini`. The exact visible row-effort count is 34. The canonical ordered inventory is:

- `5.4 Mini` / `gpt-5.4-mini` / Light, Medium, High, Extra High
- `5.4` / `gpt-5.4` / Light, Medium, High, Extra High
- `5.5` / `gpt-5.5` / Light, Medium, High, Extra High
- `5.6 Luna` / `gpt-5.6-luna` / Light, Medium, High, Extra High, Max
- `5.6 Terra` / `gpt-5.6-terra` / Light, Medium, High, Extra High, Max, Ultra
- `5.6 Sol` / `gpt-5.6-sol` / Light, Medium, High, Extra High, Max, Ultra

### Implementation requirements

1. Preserve the seven raw visible rows, including the duplicate Luna observation, in Markdown evidence.
2. Emit exactly six canonical model lines and 29 canonical pairs with the identifiers listed above.
3. Set revision `20260801.1`, timestamp `2026-08-01T05:31:00Z`, source `USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY`, surface `CODEX_DESKTOP_APP`, status `PENDING_CONFIRMATION`, and supersedes `20260722.1`.
4. Bind the actual Git blob SHA in the authority manifest and generate the snapshot through repository code.
5. Update focused tests for counts, order, identifiers, duplicate rejection, separate Terra/Sol, complete relay, and new `INVENTORY_CHANGED` routing.

### Validation commands

```bash
python3 -m unittest tools.test_model_selector_snapshot tools.test_model_selector_runtime tools.test_model_selector_full_regression tools.test_model_selector_response_contract tools.test_bridge_model_preflight
python3 tools/validate-asynchronia-auto-model-preflight.py
python3 tools/validate-orchestration-policy.py
python3 tools/validate_ai_work_pipeline.py
git diff --check
```

After implementation, run one fresh generic executable selector `start` only as non-authorizing acceptance evidence. It must stop at `WAITING_FOR_INVENTORY_CONFIRMATION`; do not send `INVENTORY_OK`, `INVENTORY_CHANGED`, or `CONTINUE`.

### Required final report

Return branch, worktree, baseline/final SHAs, exact changed paths, raw and canonical counts, labels and identifiers, artifact blob SHA, manifest binding, old/new revisions and hashes, all validation exit codes, complete raw selector stdout, unique-pair proof, no-runtime/security proof, main immobility, push evidence, draft PR URL, and exact next action for independent review and integration planning.

### Stop conditions

- Stop with `BLOCKED_SCOPE_COLLISION` if any additional file is required.
- Stop if the required baseline, branch, clean tree, or authority binding changes unexpectedly.
- Never merge the draft PR or continue the blocked security task.
