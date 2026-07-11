TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: MEMORY_REV 2026-07-12-0015-JST

Use @asynchronia runtime-safety-gate.

This file is the executable Codex implementation task. Codex must perform the control-plane reset described here on `infra/bridge-control-plane-reset-20260712`.

### Atomic goal

Repair the bridge control plane so exact numbered commands route through isolated numbered mailbox refs, the shared legacy ref is retired and deleted, and Stage 6 remains suspended until three independent canary flows pass.

### Exact baseline

- Memory baseline: `MEMORY_REV: 2026-07-12-0015-JST`
- Live repo baseline: `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`
- Work branch: `work/bridge-control-plane-reset-20260712`
- Implementation branch: `infra/bridge-control-plane-reset-20260712`
- Remote work head rejected: `7b6b8b9c449bab98f5fd19a15c8ac5306010c1c0`

### Exact canary identities

Slot 1:
- Task branch: `canary/bridge-control-plane-reset-slot-1-20260712`
- Thread: `BRIDGE-CONTROL-PLANE-CANARY-1-20260712`
- Task: `TASK-INFRA-BRIDGE-CONTROL-PLANE-CANARY-SLOT-1-20260712`
- Execution epoch: `BRIDGE-CONTROL-PLANE-CANARY-SLOT-1-20260712-R1`
- Generation: `2`
- Inbox: `.ai-bridge/inbox/BRIDGE-CONTROL-PLANE-CANARY-1-20260712-01-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-CONTROL-PLANE-CANARY-1-20260712-claim-v1-codex.md`
- Expected outbox: `.ai-bridge/outbox/BRIDGE-CONTROL-PLANE-CANARY-1-20260712-02-codex.md`
- Expected receipt: `.ai-bridge/receipts/BRIDGE-CONTROL-PLANE-CANARY-1-20260712-03-receipt.md`

Slot 2:
- Task branch: `canary/bridge-control-plane-reset-slot-2-20260712`
- Thread: `BRIDGE-CONTROL-PLANE-CANARY-2-20260712`
- Task: `TASK-INFRA-BRIDGE-CONTROL-PLANE-CANARY-SLOT-2-20260712`
- Execution epoch: `BRIDGE-CONTROL-PLANE-CANARY-SLOT-2-20260712-R1`
- Generation: `15`
- Inbox: `.ai-bridge/inbox/BRIDGE-CONTROL-PLANE-CANARY-2-20260712-01-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-CONTROL-PLANE-CANARY-2-20260712-claim-v1-codex.md`
- Expected outbox: `.ai-bridge/outbox/BRIDGE-CONTROL-PLANE-CANARY-2-20260712-02-codex.md`
- Expected receipt: `.ai-bridge/receipts/BRIDGE-CONTROL-PLANE-CANARY-2-20260712-03-receipt.md`

Slot 3:
- Task branch: `canary/bridge-control-plane-reset-slot-3-20260712`
- Thread: `BRIDGE-CONTROL-PLANE-CANARY-3-20260712`
- Task: `TASK-INFRA-BRIDGE-CONTROL-PLANE-CANARY-SLOT-3-20260712`
- Execution epoch: `BRIDGE-CONTROL-PLANE-CANARY-SLOT-3-20260712-R1`
- Generation: `1`
- Inbox: `.ai-bridge/inbox/BRIDGE-CONTROL-PLANE-CANARY-3-20260712-01-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-CONTROL-PLANE-CANARY-3-20260712-claim-v1-codex.md`
- Expected outbox: `.ai-bridge/outbox/BRIDGE-CONTROL-PLANE-CANARY-3-20260712-02-codex.md`
- Expected receipt: `.ai-bridge/receipts/BRIDGE-CONTROL-PLANE-CANARY-3-20260712-03-receipt.md`

For every slot:
- `STATUS: READY_FOR_MODEL_PREFLIGHT`
- `MODEL_PREFLIGHT_STATUS: REQUIRED`
- `CONTINUATION_STATUS: SAME_THREAD_CONTINUE_REQUIRED`

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
- Asynchronia plugin source files under `plugins/asynchronia/skills/**`
- `.agents/plugins/marketplace.json`
- any generated or installed plugin copies that mirror the same skill set
- remote ref existence and current heads for `coordination/chatgpt-codex-bridge`, `coordination/chatgpt-codex-bridge-1`, `coordination/chatgpt-codex-bridge-2`, and `coordination/chatgpt-codex-bridge-3`
- repository searches for `coordination/chatgpt-codex-bridge`, `PRIMARY_ACTIVE_SLOT`, `OPEN_SLOT_COUNT`, `мост 1`, `мост 2`, `мост 3`, `fallback`, and `alias`
- Existing task package files for this task
- exact blob evidence for `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/01-chat-brief.md`

### Allowed writes

- `AGENTS.md`
- `AGENTS.override.md`
- `PROCESS_ROOT_SYNC.md`
- `ORCHESTRATION.md`
- `BRIDGE.md`
- `tools/bridge_v4_authority_check.py`
- `tools/bridge_v4_contract.py`
- `tools/test_bridge_v4_authority_check.py`
- `tools/test_bridge_v4_contract.py`
- `tools/validate-orchestration-policy.py`
- `tools/validate-asynchronia-auto-model-preflight.py`
- `plugins/asynchronia/skills/task-router/SKILL.md`
- `plugins/asynchronia/skills/scope-isolation-check/SKILL.md`
- `plugins/asynchronia/skills/model-selector/SKILL.md`
- `plugins/asynchronia/skills/closed-loop-controller/SKILL.md`
- `plugins/asynchronia/skills/failure-routing-and-corrective-loop/SKILL.md`
- `plugins/asynchronia/skills/pipeline-state-and-resume-contract/SKILL.md`
- `plugins/asynchronia/skills/acceptance-evidence-gate/SKILL.md`
- `plugins/asynchronia/skills/acceptance-pipeline-controller/SKILL.md`
- `plugins/asynchronia/skills/smoke-orchestrator/SKILL.md`
- `plugins/asynchronia/skills/deployment-verifier/SKILL.md`
- `plugins/asynchronia/skills/mirror-audit/SKILL.md`
- `plugins/asynchronia/skills/canon-audit/SKILL.md`
- `plugins/asynchronia/skills/economy-invariant-audit/SKILL.md`
- `plugins/asynchronia/skills/evidence-bundle-and-artifact-identity/SKILL.md`
- `plugins/asynchronia/skills/parallel-scope-planner/SKILL.md`
- `.agents/plugins/marketplace.json`
- `.ai-memory/archive/BRIDGE-CONTROL-PLANE-RESET-20260712-RETIREMENT.md`
- remote refs `coordination/chatgpt-codex-bridge`, `coordination/chatgpt-codex-bridge-1`, `coordination/chatgpt-codex-bridge-2`, `coordination/chatgpt-codex-bridge-3`

### Allowed task-package writes

- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/STATE.md`

### Forbidden changes

- No `main` edits.
- No runtime/game Stage 6 feature changes.
- No silent fallback to the shared legacy ref.
- No repair that leaves old Stage 6 pointers active.
- No repair that deletes the legacy ref before its retirement record is committed.
- No edits to unrelated repository files outside the exact control-plane whitelist above.

### Required `.ai-bridge/**` ref-local changes

On `coordination/chatgpt-codex-bridge-1`:
- Update `.ai-bridge/STATE.md`.
- Create only the four exact Slot 1 canary paths defined under `Exact canary identities`.
- Preserve these Stage 6 artifacts unchanged as suspended history:
  - `.ai-bridge/inbox/BRIDGE-20260711-101-01-chatgpt.md`
  - `.ai-bridge/claims/BRIDGE-20260711-101-claim-v1-codex.md`
  - `.ai-bridge/outbox/BRIDGE-20260711-101-01-codex.md`
  - `.ai-bridge/receipts/BRIDGE-20260711-101-01-receipt.md`

On `coordination/chatgpt-codex-bridge-2`:
- Update `.ai-bridge/STATE.md`.
- Create only the four exact Slot 2 canary paths defined under `Exact canary identities`.
- Preserve these Stage 6 artifacts unchanged as suspended history:
  - `.ai-bridge/inbox/BRIDGE-20260711-091-07-chatgpt.md`
  - `.ai-bridge/claims/BRIDGE-20260711-091-claim-v3-codex.md`
  - `.ai-bridge/outbox/BRIDGE-20260711-091-08-codex.md`
  - `.ai-bridge/receipts/BRIDGE-20260711-091-09-codex.md`
  - `.ai-bridge/outbox/BRIDGE-20260711-091-05-codex.md`
  - `.ai-bridge/receipts/BRIDGE-20260711-091-06-codex.md`

On `coordination/chatgpt-codex-bridge-3`:
- Update `.ai-bridge/STATE.md`.
- Create only the four exact Slot 3 canary paths defined under `Exact canary identities`.
- No previous inbox, claim, outbox, or receipt exists for Slot 3.

On the implementation branch:
- Create `.ai-memory/archive/BRIDGE-CONTROL-PLANE-RESET-20260712-RETIREMENT.md`.
- Record the final SHA of `coordination/chatgpt-codex-bridge`, currently observed as `68075febce27979b3ceba55e019c4895c091ecfb`, and refetch it immediately before deletion.
- Do not commit anything new to the legacy ref.
- Delete remote ref `coordination/chatgpt-codex-bridge` only after the retirement record is pushed and every executable dependency search passes.

This file is the executable Codex implementation task. Codex must perform the control-plane reset described here on `infra/bridge-control-plane-reset-20260712`.

### Dependencies

- Project memory supplies the current routing and branch split.
- The task package must remain self-contained and isolated from previous Stage 6 work.
- This file is the executable Codex implementation task. Codex must perform the control-plane reset described here on `infra/bridge-control-plane-reset-20260712`.
- The implementation must include remote deletion of the shared legacy ref after all active dependencies are removed.
- The implementation must include three independent canary flows, one per numbered slot.
- The implementation must include explicit source/generated/installed plugin parity checks for every invoked skill.

### Implementation requirements

- Keep the reset task separated from earlier Stage 6 history.
- State the exact implementation branch.
- Repair executable routing, fail-closed validation, and slot-local publication so they never rely on shared legacy fallback.
- Suspend active Stage 6 pointers, preserve them as non-executable history, and prove they are not part of the active startup path.
- Create a compact retirement record for the shared legacy ref with final SHA, reason, and deletion readiness before deletion.
- Require the implementation to touch only the exact routing/control-plane files needed for the repair and no Stage 6 runtime/game files.
- Require source, generated copies, and installed-plugin surfaces to be reconciled explicitly.
- Require the task to state exact canary task branches for Slots 1, 2, and 3.
- Require the task to fail closed on wrong branch selection, stale state, cross-slot reads, missing numbered refs, and missing legacy retirement record.

### Validation commands

- `python3 tools/validate_ai_work_pipeline.py`
- `python3 tools/bridge_v4_contract.py validate-command --slot 1 --mailbox-ref coordination/chatgpt-codex-bridge-1 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 tools/bridge_v4_contract.py validate-command --slot 2 --mailbox-ref coordination/chatgpt-codex-bridge-2 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 tools/bridge_v4_contract.py validate-command --slot 3 --mailbox-ref coordination/chatgpt-codex-bridge-3 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 -m unittest tools.test_bridge_v4_contract`
- `python3 -m unittest tools.test_bridge_v4_authority_check`
- `python3 tools/validate-orchestration-policy.py`

### Required final report

- `MEMORY_REV: 2026-07-12-0015-JST`
- Live repo baseline: `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`
- Work branch: `work/bridge-control-plane-reset-20260712`
- Implementation branch: `infra/bridge-control-plane-reset-20260712`
- Validation result
- Final classification
- Remote work head SHA and refetch proof
- Reviewed routing surfaces and implementation scope
- Retirement-record and canary-flow requirements
- Whether the package is READY_FOR_CODEX or blocked by missing authority
- Exact canary branch names for Slots 1, 2, and 3
- Exact remote ref operations, including deletion of the legacy ref after retirement record publication

### Stop conditions

- Stop if the task would continue Stage 6 implementation.
- Stop if the task would change the implementation branch name.
- Stop if the repair would need to preserve the shared legacy ref as executable fallback.
- Stop if repository evidence cannot support the retirement/delete sequence safely.
- Stop if the exact scope cannot be enumerated as concrete paths and refs.
