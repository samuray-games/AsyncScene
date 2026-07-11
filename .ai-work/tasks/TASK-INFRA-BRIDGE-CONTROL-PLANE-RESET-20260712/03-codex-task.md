TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: MEMORY_REV 2026-07-12-0011-JST

Use @asynchronia runtime-safety-gate.

### Atomic goal

Repair the bridge control plane so exact numbered commands route through isolated numbered mailbox refs, the shared legacy ref is retired and deleted, and Stage 6 remains suspended until three independent canary flows pass.

### Exact baseline

- Memory baseline: `MEMORY_REV: 2026-07-12-0011-JST`
- Live repo baseline: `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`
- Work branch: `work/bridge-control-plane-reset-20260712`
- Future implementation branch: `infra/bridge-control-plane-reset-20260712`
- Remote work head rejected: `bf2bd48764bd86dfe354062b0fa6eb29d4245417`

### Allowed reads

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

### Allowed writes

- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/STATE.md`

### Forbidden changes

- No `.ai-bridge/**` edits.
- No `main` edits.
- No runtime/game Stage 6 feature changes.
- No silent fallback to the shared legacy ref.
- No repair that leaves old Stage 6 pointers active.
- No repair that deletes the legacy ref before its retirement record is committed.

### Dependencies

- Project memory supplies the current routing and branch split.
- The Work package must remain self-contained and isolated from previous Stage 6 work.
- The future Codex task is the first place where repair implementation may be described.
- The implementation must include remote deletion of the shared legacy ref after all active dependencies are removed.
- The implementation must include three independent canary flows, one per numbered slot.

### Implementation requirements

- Keep the reset task separated from earlier Stage 6 history.
- State the exact implementation branch.
- Make the task package ready for downstream Codex execution.
- Do not use this Work pass to repair the control plane.
- Repair executable routing, fail-closed validation, and slot-local publication so they never rely on shared legacy fallback.
- Suspend active Stage 6 pointers, preserve them as non-executable history, and prove they are not part of the active startup path.
- Create a compact retirement record for the shared legacy ref with final SHA, reason, and deletion readiness before deletion.
- Require the Codex implementation to touch only the exact routing/control-plane files needed for the repair and no Stage 6 runtime/game files.
- Require source, generated copies, and installed-plugin surfaces to be reconciled explicitly.

### Validation commands

- `python3 tools/validate_ai_work_pipeline.py`
- `python3 tools/bridge_v4_contract.py validate-command --slot 1 --mailbox-ref coordination/chatgpt-codex-bridge-1 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 tools/bridge_v4_contract.py validate-command --slot 2 --mailbox-ref coordination/chatgpt-codex-bridge-2 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 tools/bridge_v4_contract.py validate-command --slot 3 --mailbox-ref coordination/chatgpt-codex-bridge-3 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 -m unittest tools.test_bridge_v4_contract`

### Required final report

- `MEMORY_REV: 2026-07-12-0011-JST`
- Live repo baseline: `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`
- Work branch: `work/bridge-control-plane-reset-20260712`
- Implementation branch: `infra/bridge-control-plane-reset-20260712`
- Validation result
- Final classification
- Remote work head SHA and refetch proof
- Reviewed routing surfaces and implementation scope
- Retirement-record and canary-flow requirements
- Whether the package is READY_FOR_CODEX or blocked by missing authority

### Stop conditions

- Stop if the task would require editing `.ai-bridge/**`.
- Stop if the task would continue Stage 6 implementation.
- Stop if the task would change the future implementation branch name.
- Stop if the repair would need to preserve the shared legacy ref as executable fallback.
- Stop if repository evidence cannot support the retirement/delete sequence safely.
