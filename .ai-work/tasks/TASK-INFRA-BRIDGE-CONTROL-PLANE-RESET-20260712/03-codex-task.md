TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: MEMORY_REV 2026-07-12-0012-JST

Use @asynchronia runtime-safety-gate.

### Atomic goal

Repair the bridge control plane so exact numbered commands route through isolated numbered mailbox refs, the shared legacy ref is retired and deleted, and Stage 6 remains suspended until three independent canary flows pass.

### Exact baseline

- Memory baseline: `MEMORY_REV: 2026-07-12-0012-JST`
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
- Asynchronia plugin source files under `plugins/asynchronia/skills/**`
- `.agents/plugins/marketplace.json`
- any generated or installed plugin copies that mirror the same skill set
- remote ref existence and current heads for `coordination/chatgpt-codex-bridge`, `coordination/chatgpt-codex-bridge-1`, `coordination/chatgpt-codex-bridge-2`, and `coordination/chatgpt-codex-bridge-3`
- repository searches for `coordination/chatgpt-codex-bridge`, `PRIMARY_ACTIVE_SLOT`, `OPEN_SLOT_COUNT`, `мост 1`, `мост 2`, `мост 3`, `fallback`, and `alias`
- Existing task package files for this task
- exact blob evidence for `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/01-chat-brief.md`

### Allowed writes

- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/STATE.md`
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

### Forbidden changes

This task may not change any file outside the explicit control-plane whitelist.

### Required `.ai-bridge/**` ref-local changes

- On `coordination/chatgpt-codex-bridge-1`, update only `.ai-bridge/STATE.md` and the current slot 1 inbox, claim, outbox, and receipt paths named by that STATE.
- On `coordination/chatgpt-codex-bridge-2`, update only `.ai-bridge/STATE.md` and the current slot 2 inbox, claim, outbox, and receipt paths named by that STATE.
- On `coordination/chatgpt-codex-bridge-3`, update only `.ai-bridge/STATE.md` and the current slot 3 inbox, claim, outbox, and receipt paths named by that STATE.
- On `coordination/chatgpt-codex-bridge`, commit only the immutable retirement record and only after the deletion gate is satisfied.


### Forbidden changes

- No `.ai-bridge/**` edits.
- No `main` edits.
- No runtime/game Stage 6 feature changes.
- No silent fallback to the shared legacy ref.
- No repair that leaves old Stage 6 pointers active.
- No repair that deletes the legacy ref before its retirement record is committed.
- No edits to unrelated repository files outside the exact control-plane whitelist above.

### Dependencies

- Project memory supplies the current routing and branch split.
- The Work package must remain self-contained and isolated from previous Stage 6 work.
- The downstream Codex task is the first place where repair implementation may be described.
- The implementation must include remote deletion of the shared legacy ref after all active dependencies are removed.
- The implementation must include three independent canary flows, one per numbered slot.
- The implementation must include explicit source/generated/installed plugin parity checks for every invoked skill.

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
- Require the downstream task to state exact canary task branches for Slots 1, 2, and 3.
- Require the downstream task to fail closed on wrong branch selection, stale state, cross-slot reads, missing numbered refs, and missing legacy retirement record.

### Validation commands

- `python3 tools/validate_ai_work_pipeline.py`
- `python3 tools/bridge_v4_contract.py validate-command --slot 1 --mailbox-ref coordination/chatgpt-codex-bridge-1 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 tools/bridge_v4_contract.py validate-command --slot 2 --mailbox-ref coordination/chatgpt-codex-bridge-2 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 tools/bridge_v4_contract.py validate-command --slot 3 --mailbox-ref coordination/chatgpt-codex-bridge-3 --task-branch infra/bridge-control-plane-reset-20260712`
- `python3 -m unittest tools.test_bridge_v4_contract`
- `python3 -m unittest tools.test_bridge_v4_authority_check`
- `python3 tools/validate-orchestration-policy.py`

### Required final report

- `MEMORY_REV: 2026-07-12-0012-JST`
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

- Stop if the task would require editing `.ai-bridge/**`.
- Stop if the task would continue Stage 6 implementation.
- Stop if the task would change the future implementation branch name.
- Stop if the repair would need to preserve the shared legacy ref as executable fallback.
- Stop if repository evidence cannot support the retirement/delete sequence safely.
- Stop if the exact scope cannot be enumerated as concrete paths and refs.
