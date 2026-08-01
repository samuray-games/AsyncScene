TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801
PIPELINE_VERSION: 1.0.16
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-08-01T14:31:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260801@3e9602903ab124658319abd584c480682002feb4

### Repository evidence inspected

- Exact clean canonical checkout, required baseline, origin/main, branch occupancy, repository authority, selector source, parser, manifest, snapshot, focused tests, validators, and the full previous maintenance directory.

### Current implementation state

- The active authority points to revision `20260722.1`, with five models and 23 pairs.
- The parser already derives canonical identifiers from ordered Markdown bullet lines.
- The maintenance requires a narrow source artifact, metadata, generated snapshot, and test update.

### Conflict check

- The task-local selector source, authority, snapshot, and focused tests form one isolated infrastructure scope.
- Runtime, security, bridge, mailbox, memory, deployment, plugin cache, and historical maintenance paths are protected from writes.

### Dependency map

1. Create the task-local inventory and package artifacts.
2. Bind the authority manifest to the new artifact and actual blob SHA.
3. Generate and validate the canonical snapshot with repository code.
4. Update direct tests for counts, identifiers, order, duplicate rejection, and routing.
5. Run static tests, exact-scope validation, and the isolated generic CLI proof.
6. Commit, push, refetch, and open a draft PR targeting `main`.

### Atomic task decomposition

1. Preserve seven raw rows and 34 raw row-effort entries.
2. Emit six canonical model lines and 29 unique pairs.
3. Bind, generate, validate, publish.

### Read scope

- Authority, process, memory, selector, parser, snapshot, focused tests, validators, and prior maintenance artifacts named by the user.

### Write scope

- The five files under `.ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801/`.
- `plugins/asynchronia/model-selector-authority.json`, `plugins/asynchronia/model_selector.py`, `plugins/asynchronia/snapshots/confirmed-model-effort-snapshot.json`, `tools/test_model_selector_snapshot.py`, and `tools/test_model_selector_runtime.py`.

### Risk controls

- Preserve raw duplicate Luna evidence but never emit duplicate canonical identifiers or pairs.
- Generate the canonical hash through repository code.
- Stop on any file outside the exact write scope.
- Keep plugin version and authorization semantics unchanged.

### Validation plan

- Run the complete required unittest, selector validator, orchestration validator, AI-work pipeline validator, and `git diff --check` commands.
- Run one fresh generic executable `start` after implementation as non-authorizing acceptance evidence only.

### Codex prompt strategy

Use @asynchronia plugin context for task routing and scope isolation. Normal executable selector preflight is explicitly not mutation authorization for this maintenance task.

### Blockers

- None at plan time.
