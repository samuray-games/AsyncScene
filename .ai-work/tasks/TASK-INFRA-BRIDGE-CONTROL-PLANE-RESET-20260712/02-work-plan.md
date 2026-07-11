TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: MEMORY_REV 2026-07-12-0015-JST

### Repository evidence inspected

- `ASYNCHRONIA - PROJECT MEMORY` at `MEMORY_REV: 2026-07-12-0015-JST`
- `origin/main` at `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`
- `origin/work/bridge-control-plane-reset-20260712` at `7b6b8b9c449bab98f5fd19a15c8ac5306010c1c0`
- `origin/coordination/chatgpt-codex-bridge-1` at `6727450e193053c8da8162f427404b1473f85d70`
- `origin/coordination/chatgpt-codex-bridge-2` at `7421761f12126e88047fb2e6cd1c89490129a9c9`
- `origin/coordination/chatgpt-codex-bridge-3` at `f9ebb33c7319b498307669c0d240f9eb05db8494`
- `origin/coordination/chatgpt-codex-bridge` at `68075febce27979b3ceba55e019c4895c091ecfb`
- `AGENTS.md`
- `AGENTS.override.md`
- `PROCESS_ROOT_SYNC.md`
- `ORCHESTRATION.md`
- `BRIDGE.md`
- `.ai-work/README.md`
- `.ai-work/SCHEMA.md`
- `.ai-work/templates/TASK_PACKAGE.md`
- `tools/validate_ai_work_pipeline.py`
- `tools/validate-orchestration-policy.py`
- `tools/bridge_v4_authority_check.py`
- `tools/bridge_v4_contract.py`
- `tools/test_bridge_v4_authority_check.py`
- `tools/test_bridge_v4_contract.py`
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
- `.ai-bridge/STATE.md` and slot-local inbox/claim/outbox/receipt paths on refs 1, 2, 3, and the legacy ref
- repository searches for `coordination/chatgpt-codex-bridge`, `PRIMARY_ACTIVE_SLOT`, `OPEN_SLOT_COUNT`, `мост 1`, `мост 2`, `мост 3`, `fallback`, and `alias`
- exact blob evidence for `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/01-chat-brief.md`

### Current implementation state

- The reset package exists on the work branch and must be repaired in the worktree, not on `main`.
- `01-chat-brief.md` uses the original blob as its complete substantive base and contains only add-only schema-compliance sections required by pipeline version 1.0.0.
- The implementation branch is `infra/bridge-control-plane-reset-20260712`.
- The package must be executable from a fresh Codex chat without this Work context.
- Previous Stage 6 work remains paused and is not resumed here.
- The live repo baseline for the package is `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`.
- The legacy shared ref still exists and is executable unless the implementation task removes that dependency and deletes the ref after retirement recording.

### Conflict check

- No Stage 6 runtime files are part of this Work package.
- No legacy shared-ref repair is performed in Work.
- The only allowed task-package writes are the three files in this task directory.
- The implementation task must not depend on the old shared legacy ref as executable authority.
- The repair scope must stay split between the Work package and the implementation branch.

### Dependency map

- Project memory provides the current routing decision and the exact memory revision.
- The durable Work pipeline provides the package shape and promotion rules.
- The implementation task must stay isolated from Stage 6 implementation work.
- The implementation branch name is fixed now so downstream work can be unambiguous.
- Repository search must cover active authority, generated copies, installed-plugin copies, validator surfaces, and legacy ref fallback logic.
- The bridge reset depends on proving that three numbered refs replace the shared legacy ref entirely for executable routing.
- Slot 1, 2, and 3 canary flows are independent and must prove no cross-slot reads or writes.

### Atomic task decomposition

1. Restore the original chat brief exactly.
2. Capture the real routing and mailbox evidence from `origin/main` and the four relevant remote refs.
3. Document exact authority, policy, validator, plugin, and mailbox paths with their current heads.
4. Define a real control-plane repair task for `infra/bridge-control-plane-reset-20260712`.
5. Specify the exact repository and remote ref changes the implementation task may make.
6. Require suspension of current Stage 6 pointers and retirement of the shared legacy ref.
7. Require three independent canary flows for slots 1, 2, and 3.
8. Promote `STATE.md` only after semantic validation passes.

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
- exact blob evidence for `01-chat-brief.md`

### Write scope

- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/02-work-plan.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/03-codex-task.md`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/STATE.md`

### Risk controls

- Do not continue or repair Stage 6 work.
- Do not edit bridge mailbox artifacts.
- Do not broaden the package into runtime changes.
- Keep the branch split explicit so the implementation task cannot be confused with the preparation branch.
- Fail closed if repository evidence does not support deleting the shared legacy ref safely after retirement recording.
- Treat generated copies and installed-plugin surfaces as potentially authoritative and require explicit parity checks.
- Keep the repository change set limited to exact evidence-backed control-plane paths.

### Validation plan

- Run `python3 tools/validate_ai_work_pipeline.py`.
- Confirm the task package is internally consistent.
- Confirm `STATE.md` points to `03-codex-task.md`.
- Confirm the work plan contains a real repair scope, not a placeholder.
- Confirm the Codex task names the exact implementation branch and canary flow requirements.
- Confirm that the original brief blob is the substantive base and that the diff contains additions only, with no original substantive line removed.
- Confirm the semantic checks for exact whitelist, exact `.ai-bridge/**` write paths, legacy deletion requirement, Stage 6 suspension, and three canary branches.

### Codex prompt strategy

- Make the task self-contained.
- Include the exact implementation branch.
- Include the no-Stage-6-continuation rule.
- Make the prompt describe actual repair execution, validation, remote deletion, and canaries.
- Keep the task executable without this Work chat and without relying on bridge legacy fallback.
- Use exact file paths, exact remote refs, and exact branch names only.

### Blockers

- None after the package structure is written and validated.
