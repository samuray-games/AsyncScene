TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: 0fa99d6532b955bd0c4e4b2b87610626c851e1ae

Use @asynchronia runtime-safety-gate.

### Atomic goal

Prepare a Codex-ready reset task that hands off the bridge control-plane repair without implementing the repair in Work.

### Exact baseline

- Memory baseline: `MEMORY_REV: 2026-07-12-0010-JST`
- Work branch: `work/bridge-control-plane-reset-20260712`
- Future implementation branch: `infra/bridge-control-plane-reset-20260712`

### Allowed reads

- `ASYNCHRONIA - PROJECT MEMORY`
- `AGENTS.md`
- `.ai-work/README.md`
- `.ai-work/SCHEMA.md`
- `.ai-work/templates/TASK_PACKAGE.md`
- Existing task package files for this task

### Allowed writes

- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/STATE.md`

### Forbidden changes

- No implementation of the bridge repair.
- No continuation of any prior Stage 6 task.
- No `.ai-bridge/**` edits.
- No `main` edits.
- No runtime, smoke, mirror, or deployment edits.

### Dependencies

- Project memory supplies the current routing and branch split.
- The Work package must remain self-contained and isolated from previous Stage 6 work.
- The future Codex task is the first place where repair implementation may be described.

### Implementation requirements

- Keep the reset task separated from earlier Stage 6 history.
- State the exact implementation branch.
- Make the task package ready for downstream Codex execution.
- Do not use this Work pass to repair the control plane.

### Validation commands

- `python3 tools/validate_ai_work_pipeline.py`

### Required final report

- `MEMORY_REV: 2026-07-12-0010-JST`
- Work branch: `work/bridge-control-plane-reset-20260712`
- Implementation branch: `infra/bridge-control-plane-reset-20260712`
- Validation result
- Final classification

### Stop conditions

- Stop if the task would require editing `.ai-bridge/**`.
- Stop if the task would continue Stage 6 implementation.
- Stop if the task would change the future implementation branch name.
