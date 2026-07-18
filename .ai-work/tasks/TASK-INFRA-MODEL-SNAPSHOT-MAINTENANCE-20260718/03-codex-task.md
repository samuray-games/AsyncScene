Use @asynchronia plugin.

TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-18T15:29:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260718@2f418a95e771a8d2a2f7231f27df3940b412b94e

BOOTSTRAP_MODEL_SELECTION: USER_SELECTED_UNVERIFIED
RECOVERY_AUTHORIZATION: EXACT_SAME_THREAD_INVENTORY_CHANGED

### Atomic goal

Repair the stale selector snapshot from the exact user-confirmed Codex Desktop picker inventory, correct slash-containing model normalization, repair maintenance routing, bump active Asynchronia package surfaces to `1.0.16`, add focused regression coverage, and publish a draft PR from `infra/model-snapshot-maintenance-20260718`.

### Exact baseline

- Repository: `samuray-games/AsyncScene` at `/Users/User/Documents/created apps/AsyncScene`.
- Target branch: `infra/model-snapshot-maintenance-20260718`.
- Baseline SHA: `2f418a95e771a8d2a2f7231f27df3940b412b94e`.
- Expected clean baseline tree: `e367cab5647c2411f2282a152110f1d6012b92d3`.
- Expected `origin/main` and target remote branch: the exact baseline SHA.

### Allowed reads

- `AGENTS.override.md`, `AGENTS.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md`, `TASKS.md`, `PROJECT_MEMORY.md`.
- `.ai-memory/CURRENT.md`, `.ai-memory/CANON.md`, `.ai-memory/WORKFLOWS.md`, `.ai-work/SCHEMA.md`.
- `plugins/asynchronia/skills/task-router/SKILL.md`, `plugins/asynchronia/skills/scope-isolation-check/SKILL.md`, `plugins/asynchronia/skills/model-selector/SKILL.md`.
- `plugins/asynchronia/model_selector.py`, `plugins/asynchronia/model_selector_runtime.py`, `plugins/asynchronia/model_selector_inventory.py`, authority manifest, snapshot, package manifest, marketplace manifest, and affected selector tests and validators.
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/UI-VISIBLE-MODEL-INVENTORY.md` as immutable historical evidence.
- Exact remote refs and worktree evidence.

### Allowed writes

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

### Forbidden changes

- Do not invoke executable model-selector authorization or run `start`, `inventory-ok`, `continue`, `bridge-start`, `bridge-inventory-ok`, or `bridge-continue` before implementation.
- Do not create a normal selector continuation state, modify the blocked G3 selector state, or resume the G3 authority reissue.
- Do not modify `main`, the blocked repair branch, any `bridge/*` branch, any mailbox ref, `.ai-bridge/**`, runtime/gameplay, economy/persistence, Stage 6, deployment mirrors, installed plugin caches, or historical task/inventory artifacts.
- Do not add any model or effort not present in the user-confirmed inventory.
- Do not split `5.6 Terra/Sol`.
- Do not hand-author or guess the canonical snapshot hash.
- Do not expand the authorized write scope.

### Dependencies

- Recovery authorization is exact same-thread `INVENTORY_CHANGED` from `TASK-INFRA-BRIDGE-SLOT3-G3-REISSUE-20260718`, whose selector state is `BLOCKED_MODEL_INVENTORY_CHANGED`.
- User-confirmed inventory is exactly `5.5`, `5.6 Luna`, and `5.6 Terra/Sol`, with 15 pairs.
- The historical inventory revision is `20260715.1`; the new snapshot supersedes it with revision `20260718.1`.
- The baseline AI-work validator missing `STATE.md` diagnostic is pre-existing at the exact baseline and is not task-introduced.

### Implementation requirements

1. Create the five exact AI-work files in this task directory. The inventory must identify the user-confirmed Codex Desktop picker, list exactly three model lines and 15 pairs, record disappearance of `5.4 Mini` and `5.4`, supersede `20260715.1`, forbid unobserved additions, and avoid claiming independent official documentation confirmation.
2. Point the authority manifest to the new inventory artifact and bind its actual Git blob SHA. Set revision `20260718.1`.
3. Generate the snapshot through repository code with timestamp `2026-07-18T06:29:00Z`, source `USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY`, surface `CODEX_DESKTOP_APP`, status `PENDING_CONFIRMATION`, counts `3` and `15`, and supersedes `20260715.1`.
4. Normalize `5.6 Terra/Sol` to `gpt-5.6-terra-sol` by lowercasing, converting unsupported separators to hyphens, collapsing repeated hyphens, and trimming hyphens without changing effort normalization semantics.
5. Replace the obsolete maintenance task identifier with `TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718` in active selector routing and direct tests.
6. Align active package/version surfaces and direct assertions to `1.0.16` without rewriting historical reports.
7. Add focused tests for exact inventory, counts, missing old models, combined Terra/Sol, normalization, revision, supersedes, blob binding, canonical hash, maintenance routing, and version agreement.
8. After implementation only, run the separately required fresh generic CLI `start` with temporary task and state paths as non-authorizing acceptance evidence; do not send `INVENTORY_OK` or `INVENTORY_CHANGED`.

### Validation commands

```bash
python3 -m unittest tools.test_model_selector_snapshot tools.test_model_selector_runtime tools.test_model_selector_full_regression tools.test_model_selector_response_contract tools.test_bridge_model_preflight
python3 tools/validate-asynchronia-auto-model-preflight.py
python3 tools/validate-orchestration-policy.py
python3 tools/validate_ai_work_pipeline.py
git diff --check
```

Also prove exact changed paths, source/blob/revision/schema/order/count/hash/supersedes agreement, old inventory immutability, remote main/branch baseline, bridge/G3 ref immutability, and the temporary generic CLI proof.

### Required final report

Return `PASS_MODEL_SNAPSHOT_MAINTENANCE_PR_OPENED` with `BOOTSTRAP_MODEL_SELECTION: USER_SELECTED_UNVERIFIED`, exact branch and worktree evidence, baseline/tree/final SHAs, cleanliness, changed paths and package paths, old/new revisions, counts, labels/identifiers, inventory blob SHA and manifest binding, canonical snapshot hash, old/new maintenance IDs, old/new versions, each validation exit code, pre-existing validator failure comparison, CLI proof output, commit/pushed SHAs, draft PR number/URL, proof that main, bridge branches, mailbox refs, runtime, and Stage 6 were untouched, and the exact next action to return to ChatGPT for independent PR review and integration planning.

### Stop conditions

Stop fail-closed on branch, baseline, tree, origin, inventory, parser, hash, blob, version, scope, historical, bridge, runtime, Stage 6, validator, force-push, or PR-target drift. Return the exact requested blocker and do not commit or push.
