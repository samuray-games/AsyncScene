TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: MEMORY_REV 2026-07-12-0011-JST

### Repository evidence inspected

- `ASYNCHRONIA - PROJECT MEMORY`
- `MEMORY_REV: 2026-07-12-0011-JST`
- `origin/main` at `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`
- `origin/work/bridge-control-plane-reset-20260712` at `bf2bd48764bd86dfe354062b0fa6eb29d4245417`
- `AGENTS.md`
- `.ai-work/README.md`
- `.ai-work/SCHEMA.md`
- `.ai-work/templates/TASK_PACKAGE.md`
- `tools/validate_ai_work_pipeline.py`
- bridge-policy and bridge-validator files surfaced from repository search
- Existing task package `TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712`
- Remote branch `origin/work/bridge-control-plane-reset-20260712`

### Current implementation state

- The reset package already has a complete chat brief, a work plan, a Codex task, and a state file.
- The remote work branch points at a semantically incomplete package head and must be repaired in the worktree, not on `main`.
- The selected work branch is `work/bridge-control-plane-reset-20260712`.
- The future implementation branch is `infra/bridge-control-plane-reset-20260712`.
- Previous Stage 6 work remains paused and is not resumed here.
- The live repo baseline must remain `50d77eb5b5273fffc491a9f111ecdc5d526c7cea` for this task package.

### Conflict check

- No `.ai-bridge/**` files are to be edited.
- No `main` changes are required.
- No Stage 6 runtime files are part of this package.
- No legacy shared-ref repair is performed in Work.
- The only allowed task-package writes are the three files in this task directory.
- The Codex task must not depend on the old shared legacy ref as executable authority.

### Dependency map

- Project memory provides the current routing decision and the exact memory revision.
- The durable work pipeline provides the package shape and promotion rules.
- The future Codex task must stay isolated from Stage 6 implementation work.
- The implementation branch name is fixed now so downstream work can be unambiguous.
- Repository search must cover active authority, generated copies, installed-plugin copies, validator surfaces, and legacy ref fallback logic.
- The bridge reset depends on proving that three numbered refs replace the shared legacy ref entirely for executable routing.

### Atomic task decomposition

1. Freeze the reset routing decision in the task package.
2. Record the exact work branch and separate implementation branch.
3. Capture the no-implementation constraint for the Work pass.
4. Document the root cause across routing, policies, validators, generated copies, installed-plugin surfaces, and legacy fallback behavior.
5. Define the control-plane repair scope as a real Codex implementation task, not a documentation-only change.
6. Require suspension of current Stage 6 pointers and retirement of the shared legacy ref.
7. Require three independent canary flows for slots 1, 2, and 3.
8. Promote `STATE.md` to `READY_FOR_CODEX`.

### Read scope

- `ASYNCHRONIA - PROJECT MEMORY`
- `AGENTS.md`
- `AGENTS.override.md`
- `PROCESS_ROOT_SYNC.md`
- `ORCHESTRATION.md`
- `BRIDGE.md`
- `.ai-work/README.md`
- `.ai-work/SCHEMA.md`
- `.ai-work/templates/TASK_PACKAGE.md`
- active bridge policy and state files
- bridge authority, routing, orchestration, closed-loop, scope, and model-preflight validators and tests
- Asynchronia plugin manifest, marketplace metadata, task-router, closed-loop-controller, model-selector, runtime-safety-gate, and installed/generated copies
- remote ref existence and current heads for the shared legacy ref and all numbered refs
- repository searches for the legacy ref, `PRIMARY_ACTIVE_SLOT`, `OPEN_SLOT_COUNT`, bare `мост`, and fallback logic
- Existing task package files for this task

### Write scope

- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/STATE.md`

### Risk controls

- Do not continue or repair Stage 6 work.
- Do not edit bridge mailbox artifacts.
- Do not broaden the package into runtime changes.
- Keep the branch split explicit so the future Codex task cannot be confused with the preparation branch.
- Fail closed if repository evidence does not support deleting the shared legacy ref safely after retirement recording.
- Treat generated copies and installed-plugin surfaces as potentially authoritative and require explicit parity checks.

### Validation plan

- Run `python3 tools/validate_ai_work_pipeline.py`.
- Confirm the task package is internally consistent.
- Confirm `STATE.md` points to `03-codex-task.md`.
- Confirm the work plan contains a real repair scope, not a placeholder.
- Confirm the Codex task names the exact implementation branch and canary flow requirements.

### Codex prompt strategy

- Make the future Codex task self-contained.
- Include the exact implementation branch.
- Include the no-Stage-6-continuation rule.
- Make the prompt describe actual repair execution, validation, remote deletion, and canaries.
- Keep the task executable without this Work chat and without relying on bridge legacy fallback.

### Blockers

- None after the package structure is written and validated.
