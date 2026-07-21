TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-22T15:29:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260722@fb93ef9c5f8eda44fea87ae7cb8eb4ab5b490348

### Repository evidence inspected

- Exact branch, baseline, clean tree, target remote branch, origin/main, repository origin, and worktree occupancy.
- Root Asynchronia authority, process, orchestration, memory, AI-work schema, selector source, inventory parser, authority manifest, snapshot, tests, validators, and immutable historical inventory.

### Current implementation state

- The authority manifest currently points to the historical 3-model, 15-pair inventory at revision `20260718.1`.
- The parser already supports slash-containing model labels such as `5.6 Terra/Sol`.
- The task is a bootstrap maintenance refresh of authoritative inventory data and direct expectations.

### Conflict check

- The task-local selector source, snapshot authority, package-version surfaces, direct selector tests, and new AI-work package form one serialized non-runtime scope.
- The historical inventory artifact, bridge branches, mailbox refs, runtime files, and Stage 6 are protected reads or forbidden changes.
- No unexpected active direct assertion outside the authorized scope requires expansion.

### Dependency map

1. Create the task-local inventory and package artifacts.
2. Bind the authority manifest to the new artifact and actual blob SHA.
3. Generate and validate the canonical snapshot with repository code.
4. Update direct tests for the restored inventory, counts, identifiers, and provenance.
5. Run static tests, exact-scope validation, and the isolated generic CLI proof.
6. Commit, push fast-forward, refetch, and open a draft PR targeting `main`.

### Read scope

- Repository authority and process files named by the user.
- Selector source, runtime facade, inventory parser, manifest, snapshot, tests, validators, and immutable historical inventory.
- Exact baseline and remote ref evidence.

### Write scope

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

### Risk controls

- Treat the user-confirmed picker inventory as complete and do not infer additional models or efforts.
- Preserve the combined Terra/Sol label and order exactly.
- Use repository canonical generation for the snapshot hash; never hand-author the hash.
- Keep the recovery bootstrap status `USER_SELECTED_UNVERIFIED`.
- Do not invoke bridge or selector continuation commands to authorize this maintenance task.

### Validation plan

- Focused selector snapshot, runtime, and full-regression tests.
- `tools/validate-asynchronia-auto-model-preflight.py`.
- `tools/validate-orchestration-policy.py`.
- `tools/validate_ai_work_pipeline.py`.
- `git diff --check`.
- Fresh generic CLI `start` using temporary task and selector-state paths only after the source patch is complete; do not send a response or use it as authorization.

### Codex prompt strategy

Use the active Asynchronia task-router and scope-isolation-check context. Apply the explicit recovery authorization: `BOOTSTRAP_MODEL_SELECTION: USER_SELECTED_UNVERIFIED`; do not invoke executable model-selector authorization commands or create a normal continuation state. After implementation, run only the separately required temporary generic CLI proof.
