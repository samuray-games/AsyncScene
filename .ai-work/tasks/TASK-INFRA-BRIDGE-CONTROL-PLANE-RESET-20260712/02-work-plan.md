TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: 0fa99d6532b955bd0c4e4b2b87610626c851e1ae

### Repository evidence inspected

- `ASYNCHRONIA - PROJECT MEMORY`
- `MEMORY_REV: 2026-07-12-0010-JST`
- `AGENTS.md`
- `.ai-work/README.md`
- `.ai-work/SCHEMA.md`
- `.ai-work/templates/TASK_PACKAGE.md`
- Existing task package `TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712`
- Remote branch `origin/work/bridge-control-plane-reset-20260712`

### Current implementation state

- The reset package already has a chat brief and a placeholder state file.
- The package must be promoted to a Codex-ready task without implementing the bridge repair.
- The selected work branch is `work/bridge-control-plane-reset-20260712`.
- The future implementation branch is `infra/bridge-control-plane-reset-20260712`.
- Previous Stage 6 work remains paused and is not resumed here.

### Conflict check

- No `.ai-bridge/**` files are to be edited.
- No `main` changes are required.
- No Stage 6 runtime files are part of this package.
- No legacy shared-ref repair is performed in Work.
- The only allowed task-package writes are the three files in this task directory.

### Dependency map

- Project memory provides the current routing decision and the exact memory revision.
- The durable work pipeline provides the package shape and promotion rules.
- The future Codex task must stay isolated from Stage 6 implementation work.
- The implementation branch name is fixed now so downstream work can be unambiguous.

### Atomic task decomposition

1. Freeze the reset routing decision in the task package.
2. Record the exact work branch and separate implementation branch.
3. Capture the no-implementation constraint for the Work pass.
4. Publish a Codex task that is self-contained and ready for downstream execution.
5. Promote `STATE.md` to `READY_FOR_CODEX`.

### Read scope

- `ASYNCHRONIA - PROJECT MEMORY`
- `AGENTS.md`
- `.ai-work/README.md`
- `.ai-work/SCHEMA.md`
- `.ai-work/templates/TASK_PACKAGE.md`
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

### Validation plan

- Run `python3 tools/validate_ai_work_pipeline.py`
- Confirm the task package is internally consistent.
- Confirm `STATE.md` points to `03-codex-task.md`.

### Codex prompt strategy

- Make the future Codex task self-contained.
- Include the exact implementation branch.
- Include the no-Stage-6-continuation rule.
- Keep the prompt about reset preparation only, not repair execution.

### Blockers

- None after the package structure is written and validated.
