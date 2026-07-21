Use @asynchronia plugin.

TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-22T15:29:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260722@fb93ef9c5f8eda44fea87ae7cb8eb4ab5b490348

BOOTSTRAP_MODEL_SELECTION: USER_SELECTED_UNVERIFIED

### Atomic goal

Repair the stale selector snapshot from the exact user-confirmed Codex Desktop picker inventory, restore `5.4 Mini` and `5.4`, preserve `5.5`, preserve `5.6 Luna`, preserve `5.6 Terra/Sol`, and publish a draft PR from `infra/model-snapshot-maintenance-20260722`.

### Exact baseline

- Repository: `samuray-games/AsyncScene` at `/Users/User/Documents/created apps/AsyncScene`.
- Target branch: `infra/model-snapshot-maintenance-20260722`.
- Baseline SHA: `fb93ef9c5f8eda44fea87ae7cb8eb4ab5b490348`.
- Expected clean baseline tree: the checked-out `origin/main` baseline.

### Allowed writes

- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722/01-chat-brief.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722/STATE.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722/UI-VISIBLE-MODEL-INVENTORY.md`
- `plugins/asynchronia/model-selector-authority.json`
- `plugins/asynchronia/snapshots/confirmed-model-effort-snapshot.json`
- `tools/test_model_selector_snapshot.py`
- `tools/test_model_selector_runtime.py`
- `tools/test_model_selector_full_regression.py`

### Forbidden changes

- Do not invoke executable model-selector authorization or run `start`, `inventory-ok`, or `continue` as part of normal authorization.
- Do not modify `main`, any bridge branch, any mailbox ref, `.ai-bridge/**`, runtime/gameplay, economy/persistence, Stage 6, deployment mirrors, installed plugin caches, or historical inventory artifacts.
- Do not add any model or effort not present in the user-confirmed inventory.
- Do not split `5.6 Terra/Sol`.
- Do not hand-author or guess the canonical snapshot hash.

### Dependencies

- The user-confirmed inventory is exactly `5.4 Mini`, `5.4`, `5.5`, `5.6 Luna`, and `5.6 Terra/Sol`, with 23 pairs.
- The historical inventory revision is `20260718.1`; the new snapshot supersedes it with revision `20260722.1`.

### Implementation requirements

1. Create the five exact AI-work files in this task directory. The inventory must identify the user-confirmed Codex Desktop picker, list exactly five model lines and 23 pairs, record the return of `5.4 Mini` and `5.4`, supersede `20260718.1`, and avoid claiming independent official documentation confirmation.
2. Point the authority manifest to the new inventory artifact and bind its actual Git blob SHA. Set revision `20260722.1`.
3. Generate the snapshot through repository code with timestamp `2026-07-22T06:29:00Z`, source `USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY`, surface `CODEX_DESKTOP_APP`, status `PENDING_CONFIRMATION`, counts `5` and `23`, and supersedes `20260718.1`.
4. Normalize `5.6 Terra/Sol` to `gpt-5.6-terra-sol` by lowercasing, converting unsupported separators to hyphens, collapsing repeated hyphens, and trimming hyphens without changing effort normalization semantics.
5. Update direct tests to the new inventory, counts, identifiers, and provenance.
6. After implementation only, run the separately required fresh generic CLI `start` with temporary task and state paths as non-authorizing acceptance evidence; do not send `INVENTORY_OK` or `INVENTORY_CHANGED`.

### Validation commands

```bash
python3 -m unittest tools.test_model_selector_snapshot tools.test_model_selector_runtime tools.test_model_selector_full_regression tools.test_model_selector_response_contract tools.test_bridge_model_preflight
python3 tools/validate-asynchronia-auto-model-preflight.py
python3 tools/validate-orchestration-policy.py
python3 tools/validate_ai_work_pipeline.py
git diff --check
```

### Required final report

Return the exact branch, worktree evidence, baseline/final SHAs, inventory blob SHA and manifest binding, canonical snapshot hash, old/new revisions, old/new counts, labels, identifiers, validation results, commit/push evidence, draft PR URL, and the exact next action to return for independent PR review and integration planning.

