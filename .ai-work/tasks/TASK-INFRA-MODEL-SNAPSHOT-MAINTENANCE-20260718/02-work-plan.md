TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-18T15:29:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260718@2f418a95e771a8d2a2f7231f27df3940b412b94e

### Repository evidence inspected

- Exact branch, baseline, clean tree, target remote branch, origin/main, repository origin, and worktree occupancy.
- Root Asynchronia authority, process, orchestration, memory, AI-work schema, selector source, inventory parser, authority manifest, snapshot, tests, validators, and immutable historical inventory.
- Baseline validator results, including the pre-existing missing `STATE.md` diagnostic in `TASK-INFRA-MODEL-PREFLIGHT-E2E-REPAIR-20260717`.

### Current implementation state

- The authority manifest points to the historical 6-model, 29-pair inventory at revision `20260715.1`.
- The parser replaces spaces only, so `5.6 Terra/Sol` is not safely normalized.
- Active package surfaces bind version `1.0.15`; the selector core still exposes an older `1.0.13` constant.
- `INVENTORY_CHANGED` still reports the obsolete maintenance task ID ending in `20260714`.

### Conflict check

- The task-local selector source, snapshot authority, package version surfaces, direct selector tests, and new AI-work package form one serialized non-runtime scope.
- The historical inventory artifact, bridge branches, mailbox refs, G3 repair state, runtime files, and Stage 6 are protected reads or forbidden changes.
- No unexpected active direct assertion outside the authorized scope requires expansion.

### Dependency map

1. Create the task-local inventory and package artifacts.
2. Bind the authority manifest to the new artifact and actual blob SHA.
3. Correct parser normalization and snapshot metadata generation.
4. Generate and validate the canonical snapshot with repository code.
5. Update direct tests, validators, and active package version surfaces.
6. Run static tests, exact-scope validation, and the isolated generic CLI proof.
7. Commit, push fast-forward, refetch, and open a draft PR targeting `main`.

### Atomic task decomposition

- Inventory and task-package creation.
- Selector parser and snapshot-generation correction.
- Authority and snapshot regeneration.
- Maintenance routing and version-surface alignment.
- Focused regression coverage for exact inventory, Terra/Sol normalization, blob binding, hash, routing, and package version.
- Independent validation and publication evidence.

### Read scope

- Repository authority and process files named by the user.
- Selector source, runtime facade, inventory parser, manifest, snapshot, skills, tests, validators, package templates, and immutable historical inventory.
- Exact baseline and remote ref evidence.

### Write scope

- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718/01-chat-brief.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718/STATE.md`
- `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718/UI-VISIBLE-MODEL-INVENTORY.md`
- `plugins/asynchronia/model-selector-authority.json`
- `plugins/asynchronia/snapshots/confirmed-model-effort-snapshot.json`
- `plugins/asynchronia/model_selector.py`
- `plugins/asynchronia/model_selector_inventory.py`
- `plugins/asynchronia/model_selector_runtime.py`
- `plugins/asynchronia/skills/model-selector/SKILL.md`
- `plugins/asynchronia/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`
- `tools/validate-asynchronia-auto-model-preflight.py`
- `tools/test_model_selector_snapshot.py`
- `tools/test_model_selector_runtime.py`
- `tools/test_model_selector_full_regression.py`

### Risk controls

- Treat the user-confirmed picker inventory as complete and do not infer additional models or efforts.
- Preserve the combined Terra/Sol label and order exactly.
- Use repository canonical generation for the snapshot hash; never hand-author the hash.
- Keep the recovery bootstrap status `USER_SELECTED_UNVERIFIED` and do not add a permanent policy exception.
- Do not invoke bridge or selector continuation commands to authorize this maintenance task.
- Stop on any unexpected active direct assertion, scope expansion, baseline movement, version mismatch, historical mutation, or bridge/runtime touch.

### Validation plan

- Focused selector snapshot, runtime, full-regression, response-contract, and bridge preflight unit tests.
- `tools/validate-asynchronia-auto-model-preflight.py`.
- `tools/validate-orchestration-policy.py`.
- `tools/validate_ai_work_pipeline.py`, with exact baseline comparison for the pre-existing missing `STATE.md` diagnostic.
- `git diff --check` and exact authorized-path comparison.
- Fresh generic CLI `start` using temporary task and selector-state paths only after the source patch is complete; do not send a response or use it as authorization.

### Codex prompt strategy

Use the active Asynchronia task-router and scope-isolation-check context. Apply the explicit recovery authorization: `BOOTSTRAP_MODEL_SELECTION: USER_SELECTED_UNVERIFIED`; do not invoke executable model-selector authorization commands or create a normal continuation state. After implementation, run only the separately required temporary generic CLI proof.

### Blockers

- The baseline AI-work validator failure for missing `TASK-INFRA-MODEL-PREFLIGHT-E2E-REPAIR-20260717/STATE.md` is pre-existing and must remain unchanged.
- Any new validator diagnostic, unexpected direct assertion, or contradictory inventory blocks completion.
