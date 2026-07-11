TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: READY_FOR_WORK
CREATED_AT: 2026-07-12T00:10:00+09:00
AUTHOR_ROLE: CHAT
SOURCE_REVISION: MEMORY_REV 2026-07-12-0010-JST; origin/main 25bee74c99fa19ae5914e1739e2ff6a46eb8aeec
PRIORITY: P0_BLOCKING_ALL_STAGE_6_WORK
WORK_BRANCH: work/bridge-control-plane-reset-20260712
EXPECTED_IMPLEMENTATION_BRANCH: infra/bridge-control-plane-reset-20260712

### User decision

The user paused all Stage 6 implementation until the bridge control plane is repaired and independently proven. This task has absolute priority over every Stage 6 feature, audit, Boomer, traceability, runtime, copy, smoke, or review task.

### Immediate isolation rule

Work must treat every earlier Stage 6 task as suspended historical context, not as active work.

Work must not continue, refine, validate, resume, merge, repair, or prepare Codex prompts for:

- `TASK-S6-TRACEABILITY-READONLY-AUDIT-20260711-B1`;
- `TASK-S6-BOOMER-STEP4_4B-FIX4-ADVERSARIAL`;
- any other Stage 6 task, bridge inbox, claim, outbox, receipt, task branch, Work brief, or prior model-preflight thread.

Work may inspect only the minimum identity and routing fields from those artifacts when they provide evidence about the bridge defect. Work must not inspect Stage 6 runtime or gameplay implementation files for this task.

Any earlier `READY_FOR_WORK`, `READY_FOR_CODEX`, `READY_FOR_MODEL_PREFLIGHT`, `CORRECTION_REQUIRED`, or `NEXT_ACTION` related to Stage 6 is superseded by this brief until the user explicitly resumes Stage 6 after bridge acceptance.

### Current primary evidence

Work must freshly verify all facts. The following observations explain the task but do not replace repository inspection:

- `origin/main` currently maps exact commands `мост 1`, `мост 2`, and `мост 3` to the three numbered mailbox refs.
- `origin/main` labels `coordination/chatgpt-codex-bridge` as legacy read-only.
- The remote legacy ref still exists and contains an active Bridge 3.4 state with shared fields such as `OPEN_SLOT_COUNT`, `PRIMARY_ACTIVE_SLOT`, `SLOT_1_STATUS: CLOSED`, and legacy `мост N` actions.
- Numbered mailbox refs contain separate Bridge 4.0 states, but current slots still carry Stage 6 work: Slot 1 is `READY_FOR_MODEL_PREFLIGHT`, Slot 2 is `CORRECTION_REQUIRED`, and Slot 3 is `AVAILABLE`.
- A user command was routed through legacy state and returned `BRIDGE_SLOT_UNAVAILABLE` for Slot 1 despite the numbered Slot 1 state being open.
- The durable Work pipeline is separate from `.ai-bridge/**` and Work does not own bridge mutation.

### Goal

Research the complete bridge routing and control-plane implementation, then prepare one standalone, atomic Codex task that repairs the bridge system before any Stage 6 work resumes.

The resulting system must make `мост 1`, `мост 2`, and `мост 3` reliable, isolated, testable, and impossible to route through the shared legacy ref.

### Accepted decisions

1. Stage 6 remains paused until all three numbered bridges pass end-to-end canaries.
2. The repair task executes through a dedicated maintenance branch, not through a numbered bridge command. A broken bridge must not be the transport used to repair itself.
3. Work uses `work/bridge-control-plane-reset-20260712` only for the durable Work package.
4. Work must name `infra/bridge-control-plane-reset-20260712` as the implementation branch unless current repository evidence proves a different collision-free name is required.
5. The only active mailbox authorities after repair are:
   - `coordination/chatgpt-codex-bridge-1`;
   - `coordination/chatgpt-codex-bridge-2`;
   - `coordination/chatgpt-codex-bridge-3`.
6. The shared ref `coordination/chatgpt-codex-bridge` must be retired completely and deleted from the remote after its final head SHA and a compact retirement record are captured in an immutable repository record.
7. Active routing code, plugin skills, root policies, validators, tests, generated files, installed-plugin contract, and operator instructions must contain no fallback that reads or writes the shared legacy ref.
8. Historical evidence may remain only in a clearly non-executable archive. Startup, routing, preflight, state selection, task selection, and continuation logic must never scan that archive.
9. Old Stage 6 bridge work must be preserved without remaining active. The implementation plan must define a deterministic suspension or archive transition for current Slot 1 and Slot 2 work, remove their pointers from active startup state, and prevent accidental auto-resume.
10. The final operational state after repair must present all three slots as clean and available for new allocation, or as explicit canary-ready states if the canary protocol requires that intermediate phase. No active state may point to Stage 6.
11. Every future bridge assignment must state both the mailbox ref and the exact task branch the user selects in Codex.
12. No direct runtime, gameplay, economy, persistence, UI copy, or Stage 6 feature change belongs in this repair.

### Constraints

- All rules under `Immediate isolation rule`, `Research scope for Work`, `Non-goals`, and `Work write scope` are binding constraints.
- Work may prepare only the durable task package and must not implement the bridge repair.
- Stage 6 remains suspended until the complete three-slot acceptance gate passes.

### Research scope for Work

Work must inspect current versions from `origin/main`, all three numbered mailbox refs, and the legacy shared ref. Inspect the smallest sufficient set of files, including at least:

- `AGENTS.md`;
- `AGENTS.override.md`;
- `PROCESS_ROOT_SYNC.md`;
- `ORCHESTRATION.md`;
- `BRIDGE.md`;
- `.ai-work/README.md`;
- `.ai-work/templates/TASK_PACKAGE.md`;
- active bridge policy and state files;
- bridge authority, routing, orchestration, closed-loop, scope, and model-preflight validators and tests;
- Asynchronia plugin manifest, marketplace metadata, task-router, closed-loop-controller, model-selector, runtime-safety-gate, and any generated or installed copies that can override repository behavior;
- remote ref existence and current heads for the shared legacy ref and all numbered refs;
- repository searches for the exact legacy ref name, `PRIMARY_ACTIVE_SLOT`, `OPEN_SLOT_COUNT`, bare `мост`, and any fallback or alias logic.

Work must separate:

- active executable authority;
- generated mirrors;
- installed-plugin copies;
- historical documents;
- remote branch state;
- user-owned live canary steps.

### Required architecture result

Work must prepare a Codex task that produces all of the following:

1. One deterministic parser for exact trimmed commands `мост 1`, `мост 2`, and `мост 3`.
2. One-to-one mapping from slot N to `coordination/chatgpt-codex-bridge-N`, with no shared-ref fallback and no inference from stale chat context.
3. Fail-closed behavior for malformed commands, missing numbered refs, invalid slot-local state, cross-slot identity, stale generations, stale claims, and wrong task branches.
4. Slot-local startup that fetches and reads only `origin/main` plus the selected numbered mailbox ref before model preflight.
5. Explicit proof that the other two mailbox refs were not read for normal execution and did not move during publication.
6. A maintenance-safe suspension transition for the existing Slot 1 and Slot 2 Stage 6 work, preserving recovery facts while removing every active pointer.
7. A compact immutable retirement record for the legacy ref containing at minimum its final remote head SHA, retirement date, reason, and statement that no active code may use it.
8. Remote deletion of `coordination/chatgpt-codex-bridge` after all active dependencies are removed and the retirement record is committed.
9. Validators and tests that fail when:
   - the shared legacy ref exists after the deletion gate;
   - active files reference the shared ref as an executable authority;
   - any numbered command resolves to the wrong mailbox;
   - shared fields such as `PRIMARY_ACTIVE_SLOT` or `OPEN_SLOT_COUNT` reappear in active state;
   - one slot reads, writes, rotates, or invalidates another slot;
   - a previous Stage 6 task remains active during bridge maintenance;
   - branch-selection instructions omit the exact task branch.
10. Repository and active installed-plugin parity, with explicit version and content-hash evidence for every invoked skill.
11. A rollback procedure that restores the numbered control plane without recreating or reactivating the shared legacy ref.

### End-to-end acceptance

Static validation alone does not complete this task.

The Codex task must define a three-slot canary wave after the repair is merged or otherwise installed into the active environment:

- one isolated canary task and exact task branch for Slot 1;
- one isolated canary task and exact task branch for Slot 2;
- one isolated canary task and exact task branch for Slot 3.

For each slot, a fresh Codex conversation must:

1. start with the exact task branch selected;
2. receive exactly `мост N`;
3. fetch the correct numbered mailbox and reject the shared ref;
4. perform the mandatory Asynchronia model preflight;
5. stop at `WAITING_FOR_MODEL_SELECTION` without implementation;
6. resume only after exact same-thread `CONTINUE`;
7. complete the canary on its task branch;
8. publish outbox and receipt only to mailbox N;
9. refetch both destinations;
10. prove the other two numbered mailbox refs did not move.

Full bridge acceptance exists only when Slots 1, 2, and 3 each report independent PASS. A partial pass leaves Stage 6 paused.

### Non-goals

- Do not implement or review Stage 6.
- Do not repair the Boomer task.
- Do not perform Safari gameplay smoke.
- Do not redesign product mechanics.
- Do not preserve the shared legacy branch as a read-only fallback.
- Do not hide the defect behind documentation wording while the remote ref or executable fallback remains.
- Do not delete historical evidence before capturing the minimal retirement record and exact SHA.

### Work write scope

Work may write only inside:

- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/02-work-plan.md`;
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/03-codex-task.md`;
- `.ai-work/tasks/TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260712/STATE.md`.

Work must not edit `.ai-bridge/**`, root policies, plugin files, validators, remote refs, task branches, Stage 6 files, or `main`.

### Acceptance criteria

- Work produces the complete repository evidence, root-cause map, dependency graph, legacy-ref retirement sequence, Stage 6 pointer suspension strategy, exact implementation scope, validation matrix, rollback, and standalone Codex task required by `Required architecture result`, `End-to-end acceptance`, and `Output required from Work`.
- The resulting Codex task is executable without this chat and requires independent PASS for Slots 1, 2, and 3 before Stage 6 resumes.
- `02-work-plan.md` exists and captures the complete routing/control-plane repair plan.
- `03-codex-task.md` exists, names the exact implementation branch, and is executable without this chat.
- `03-codex-task.md` requires real repair of routing, legacy fallback removal, Stage 6 pointer suspension, retirement record, remote deletion, and three independent canary flows.
- `STATE.md` is promoted to `READY_FOR_CODEX`.
- `python3 tools/validate_ai_work_pipeline.py` passes.

### Open questions

- None.

### Output required from Work

Work must produce:

1. `02-work-plan.md` with current repository evidence, root-cause map, all active and generated routing surfaces, exact dependency graph, exact legacy deletion sequence, suspension strategy for prior Stage 6 lanes, test matrix, rollback, and one atomic implementation scope.
2. `03-codex-task.md` that a fresh Codex conversation can execute without reading this chat, without using `мост N`, and without touching Stage 6 implementation.
3. `STATE.md` promoted to `READY_FOR_CODEX` only after the task package passes `python3 tools/validate_ai_work_pipeline.py`.
4. An exact implementation branch selection line.
5. An exact list of files and remote refs Codex may modify or delete.
6. Exact validation commands and expected success markers.
7. One final classification:
   - `READY_FOR_CODEX_BRIDGE_CONTROL_PLANE_RESET`, or
   - `BLOCKED_BRIDGE_CONTROL_PLANE_RESET` with the specific missing authority or unsafe dependency.

Work must not return a general discussion. It must return the durable package paths, branch choice, classification, and the exact next action for Codex.
