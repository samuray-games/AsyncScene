TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: READY_FOR_WORK
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: CHAT
SOURCE_REVISION: MEMORY_REV 2026-07-12-0010-JST

### Goal

Prepare a reset-only task package for the bridge control plane so the future Codex implementation can repair routing without resuming Stage 6 work.

### Non-goals

- Do not implement the repair in this Work package.
- Do not continue or validate any prior Stage 6 task.
- Do not edit `.ai-bridge/**`.
- Do not change `main`.

### Accepted decisions

1. The active memory revision is `2026-07-12-0010-JST`.
2. The work branch is `work/bridge-control-plane-reset-20260712`.
3. The future implementation branch is `infra/bridge-control-plane-reset-20260712`.
4. Previous Stage 6 work remains suspended history only.

### Constraints

- Keep the task package limited to the three required files.
- Keep the task self-contained and ready for downstream Codex execution.
- Keep the future implementation branch explicit and separate from the work branch.
- Treat the prior Stage 6 task as paused routing evidence only if needed to explain the defect.

### Acceptance criteria

- `02-work-plan.md` exists and is internally consistent.
- `03-codex-task.md` exists and names the exact implementation branch.
- `STATE.md` is promoted to `READY_FOR_CODEX`.
- `python3 tools/validate_ai_work_pipeline.py` passes.

### Open questions

- None.

### Output required from Work

- The completed task package files.
- The updated `STATE.md`.
- A final classification of `READY_FOR_CODEX_BRIDGE_CONTROL_PLANE_RESET` or `BLOCKED_BRIDGE_CONTROL_PLANE_RESET`.
