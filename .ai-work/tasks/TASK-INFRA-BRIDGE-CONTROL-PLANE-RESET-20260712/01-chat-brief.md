TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: READY_FOR_WORK
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: CHAT
SOURCE_REVISION: MEMORY_REV 2026-07-12-0011-JST

### Goal

Prepare a reset-only task package for the bridge control plane so the future Codex implementation can repair routing without resuming Stage 6 work.

### Non-goals

- Do not implement the repair in this Work package.
- Do not continue or validate any prior Stage 6 task.
- Do not edit `.ai-bridge/**`.
- Do not change `main`.

### Accepted decisions

1. The active memory revision is `2026-07-12-0011-JST`.
2. The live repository baseline is `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`.
3. The work branch is `work/bridge-control-plane-reset-20260712`.
4. The future implementation branch is `infra/bridge-control-plane-reset-20260712`.
5. Previous Stage 6 work remains suspended history only.
6. The shared legacy ref must be removed after a retirement record is captured.
7. The final state must prove exact numbered routing for `мост 1`, `мост 2`, and `мост 3`.

### Constraints

- Keep the task package limited to the three required files.
- Keep the task self-contained and ready for downstream Codex execution.
- Keep the future implementation branch explicit and separate from the work branch.
- Treat the prior Stage 6 task as paused routing evidence only if needed to explain the defect.
- Do not edit `.ai-bridge/**`, Stage 6 runtime/game files, or `main`.
- Use repository evidence plus plugin/installed-surface evidence to explain why the shared legacy ref is unsafe.

### Acceptance criteria

- `02-work-plan.md` exists and captures the complete routing/control-plane repair plan.
- `03-codex-task.md` exists, names the exact implementation branch, and is executable without this chat.
- `03-codex-task.md` requires real repair of routing, legacy fallback removal, Stage 6 pointer suspension, retirement record, remote deletion, and three independent canary flows.
- `STATE.md` is promoted to `READY_FOR_CODEX`.
- `python3 tools/validate_ai_work_pipeline.py` passes.

### Open questions

- None.

### Output required from Work

- The completed task package files.
- The updated `STATE.md`.
- A final classification of `READY_FOR_CODEX_BRIDGE_CONTROL_PLANE_RESET` or `BLOCKED_BRIDGE_CONTROL_PLANE_RESET`.
