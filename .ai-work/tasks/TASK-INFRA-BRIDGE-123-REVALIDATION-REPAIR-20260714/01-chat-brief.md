TASK_ID: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714
PIPELINE_VERSION: 1.0.3
PHASE: CHAT_BRIEF
STATUS: READY_FOR_WORK
CREATED_AT: 2026-07-14T02:31:06+09:00
AUTHOR_ROLE: CHAT
SOURCE_REVISION: MEMORY_REV 2026-07-14-1257-JST / origin-main c8e6b0668f39bbc49055bf3638ac2236c5fd4e15

### Goal

Freshly revalidate and repair the existing Bridge Protocol 4.0 control plane for Slots 1, 2 and 3 from current `origin/main`.

The repair must make root authority, executable validators, slot-local publication policy, numbered mailbox STATE and repository bridge snapshots agree. It must preserve historical bridge evidence and prepare three isolated canary lanes before any Stage 6 work can resume.

### Non-goals

- Do not run or modify AI Forensics.
- Do not continue Stage 6.
- Do not modify game runtime, UI runtime, economy, persistence, battle, NPC or deployed mirror files.
- Do not reuse the previous bridge reset acceptance or its stale baselines.
- Do not revive the rejected Slot 2 implementation branch as current work.
- Do not write directly to `main`.
- Do not publish or mutate numbered mailbox refs during the Work preparation phase.

### Accepted decisions

- Current repository baseline is `c8e6b0668f39bbc49055bf3638ac2236c5fd4e15`.
- Installed Asynchronia 1.0.9 parity was user-confirmed after Codex restart.
- Current numbered mailbox heads are:
  - Slot 1: `6727450e193053c8da8162f427404b1473f85d70`
  - Slot 2: `7421761f12126e88047fb2e6cd1c89490129a9c9`
  - Slot 3: `f9ebb33c7319b498307669c0d240f9eb05db8494`
- Slot 1 contains a stale Stage 6 read-only claim.
- Slot 2 contains a rejected Stage 6 correction claim and a task branch 117 commits behind current main with collisions on all four authorized runtime files.
- Slot 3 mailbox STATE is available, but its repository snapshot still says migration pending and unknown.
- `.ai-bridge/PUBLICATION_POLICY.md` is required by current authority but is absent from current main and the inspected numbered mailbox ref.
- Repair must preserve cross-slot immutability and serialize every mailbox write.
- Three fresh read-only canary lanes are required before the slots are declared healthy and reusable.

### Constraints

- Root authority is current `AGENTS.override.md`, then `AGENTS.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md` and `BRIDGE.md`.
- The active task must use current Asynchronia automatic routing and mandatory model preflight.
- No mutation is allowed before `WAITING_FOR_MODEL_SELECTION` and exact same-thread `CONTINUE`.
- The removed directive `Use @asynchronia runtime-safety-gate.` is forbidden in the active Codex task.
- The repository implementation task may prepare canonical policy, validators, tests and a repair manifest, but it may not mutate `.ai-bridge/**` or any mailbox ref.
- After independent review, ChatGPT performs slot-local mailbox publication and verifies other refs did not move.
- Stage 6 remains paused throughout this task.
- Safari status is `N/A` because no runtime files may change.

### Acceptance criteria

- A canonical publication policy exists in repository authority and exact slot-local policy parity is testable.
- Root authority no longer requires a file that has no canonical source or validation path.
- Validators fail closed on missing policy, wrong slot policy, STATE-policy mismatch, wrong mailbox ref, cross-slot references and stale snapshot parity.
- A deterministic repair manifest names exact target identities for Slots 1, 2 and 3.
- Slot 1 and Slot 2 historical inboxes, claims, outboxes and receipts remain immutable evidence.
- The rejected Slot 2 task branch is never executed or integrated.
- Repository snapshots and live mailbox STATE can be synchronized without changing runtime files.
- Three fresh isolated canary lanes are prepared from current main with current plugin preflight rules.
- No numbered mailbox ref or `main` is mutated by the Work preparation branch.

### Open questions

- Exact final `AVAILABLE` generation values are finalized only after the three canary lanes complete and are independently reviewed.
- The legacy shared mailbox ref remains read-only unless fresh evidence proves a separate deletion task is required.

### Output required from Work

- A complete repository evidence table.
- A conflict and dependency map.
- A current-schema Codex implementation task for repository-side control-plane hardening only.
- Exact three-slot canary identities and a post-review mailbox publication sequence.
- Required validators and stop conditions.
- A `STATE.md` pointing to the active Codex task.
