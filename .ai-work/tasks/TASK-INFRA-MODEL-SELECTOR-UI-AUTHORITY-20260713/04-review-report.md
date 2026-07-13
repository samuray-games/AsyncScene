TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PIPELINE_VERSION: 1.0.5
PHASE: REVIEW
STATUS: CORRECTION_REQUIRED
CREATED_AT: 2026-07-13T16:40:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: 480b6765ec5e0daa3438f43a349537cc63addeaa

### Evidence inspected

- Exact remote branch head and compare from `af177cd00c404f86f674ee576e85ef7ffe0b2aad`.
- All six changed paths at implementation commit `480b6765ec5e0daa3438f43a349537cc63addeaa`.
- `AGENTS.md`, plugin manifest, marketplace entry, model-selector skill, selector validator, and task STATE.
- Reported blocking and baseline-differential validation evidence.

### Scope verification

PASS. The implementation commit changes exactly the authorized six paths. `main` remains at `d449d00200e8b40f6448b49892e954b9f4f00f14`. No bridge, AI Forensics implementation, hooks, Stage 6, runtime, economy, persistence, deployment, or mirror path changed.

### Acceptance criteria results

- Desktop UI picker authority policy: PASS.
- App-server-only candidate exclusion policy: PASS.
- Exact UI label preservation policy: PASS.
- Version parity at 1.0.9: PASS.
- Executable validator proves mandatory reconciliation path: FAIL.
- Per-run UI inventory binding in executable fixtures: FAIL.
- Final task evidence state: FAIL.

### Test results

Codex reported the selector validator, py_compile, and diff check as passing. Independent source review found that the validator can pass while bypassing mandatory catalog-evidence and UI-reconciliation states. Therefore the green validator result is insufficient for acceptance.

### Runtime status

N/A. This is repository policy and validator work. The locally installed plugin has not been refreshed and must not be treated as updated.

### Findings

1. HIGH - `PreflightContract` still implements the old transition `MODEL_INVENTORY_DISCOVERY -> MODEL_INVENTORY_VERIFIED`. Its state-machine fixture calls `discover(); verify_inventory(); analyze(); pause()` and never traverses `APP_SERVER_CATALOG_EVIDENCE_RECORDED`, `MODEL_INVENTORY_RECONCILIATION_REQUIRED`, `USER_UI_INVENTORY_REQUIRED`, or `USER_UI_INVENTORY_RECEIVED`. The validator therefore approves a path forbidden by the new skill.

2. HIGH - `reconcile_inventory()` accepts exact UI inventory when both `app_server_inventory` and `app_server_error` are absent. It treats the missing catalog evidence as an empty signature and returns `MODEL_INVENTORY_VERIFIED`. The policy requires app-server discovery or a recorded app-server failure for every preflight.

3. MEDIUM - executable UI freshness binding checks thread, surface, and boolean flags only. It does not bind the UI evidence to the task and launch/baseline even though the skill forbids reuse for another task or later launch.

4. LOW - committed task STATE still says `BOOTSTRAP_MODEL_STATUS: USER_SELECTED_AND_IMPLEMENTATION_COMPLETED_UNCOMMITTED` and `FINAL_IMPLEMENTATION_HEAD: PENDING_COMMIT_AND_PUSH` after the implementation was committed and pushed.

### Verdict

CORRECTION_REQUIRED. Do not integrate 1.0.9 to main and do not refresh the installed plugin yet.

### Exact next action

Execute `05-codex-correction-task.md` on the same implementation branch. Correct only the selector validator and task STATE, rerun task-scoped validation, use a separate final state commit to record the known implementation commit, and return `READY_FOR_REVIEW`.