# Bridge State

BRIDGE_PROTOCOL: 2.1
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-07T14:45:00+09:00
USER_COMMAND_SLOT_1: мост 1
USER_COMMAND_SLOT_2: мост 2
USER_COMMAND_SLOT_3: мост 3
BARE_MOST_ALIAS: SUPERSEDED
OLDER_BRIDGE_PHRASE: SUPERSEDED
MAX_CONCURRENT_CODEX_LANES: 3
AUTHORIZED_PRIMARY_BASELINE: 1968d4bf2e26c2dd6cc5315378722171bdf6f034
PARALLEL_PLAN: STAGE6_PARALLEL_EXECUTION_PLAN.md
PARALLEL_PLAN_VERSION: S6-PARALLEL-2026-07-07-02-NUMBERED

## Current status

- Bridge status: `NUMBERED_PARALLEL_SLOTS_OPEN`
- Open slots: `1`, `2`, `3`
- Slot selection: exact user command only; no first-free fallback
- Active claims: `NONE`
- Completed slots in current wave: `NONE`
- Next free thread id: `BRIDGE-20260705-030`
- Latest ChatGPT turn: `.ai-bridge/inbox/BRIDGE-20260705-029-04-chatgpt.md`
- Latest accepted Codex turn: `NONE_AFTER_PROTOCOL_2_1_ACTIVATION`

## Bridge Slot 1

- User command: `мост 1`
- Thread: `BRIDGE-20260705-027`
- Lane: `S6-T1-TRACEABILITY`
- Task: `TASK-S6-PAR-T1`
- Phase: `MODEL_PREFLIGHT_ONLY`
- Task inbox: `.ai-bridge/inbox/BRIDGE-20260705-027-01-chatgpt.md`
- Current baseline inbox: `.ai-bridge/inbox/BRIDGE-20260705-027-04-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-20260705-027-claim-codex.md`
- Outbox: `.ai-bridge/outbox/BRIDGE-20260705-027-02-codex.md`
- Primary baseline: `1968d4bf2e26c2dd6cc5315378722171bdf6f034`
- Primary write scope: `NONE`
- Runtime: `READ_ONLY`
- Claim status: `UNCLAIMED`
- Parallel compatibility: slots 2 and 3

## Bridge Slot 2

- User command: `мост 2`
- Thread: `BRIDGE-20260705-028`
- Lane: `S6-B1-BOOMER-EVIDENCE`
- Task: `TASK-S6-PAR-B1`
- Phase: `MODEL_PREFLIGHT_ONLY`
- Task inbox: `.ai-bridge/inbox/BRIDGE-20260705-028-01-chatgpt.md`
- Current baseline inbox: `.ai-bridge/inbox/BRIDGE-20260705-028-04-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-20260705-028-claim-codex.md`
- Outbox: `.ai-bridge/outbox/BRIDGE-20260705-028-02-codex.md`
- Primary baseline: `1968d4bf2e26c2dd6cc5315378722171bdf6f034`
- Primary write scope: `NONE`
- Runtime: `READ_ONLY`
- Claim status: `UNCLAIMED`
- Parallel compatibility: slots 1 and 3

## Bridge Slot 3

- User command: `мост 3`
- Thread: `BRIDGE-20260705-029`
- Lane: `S6-A1-ALPHA-EVIDENCE`
- Task: `TASK-S6-PAR-A1`
- Phase: `MODEL_PREFLIGHT_ONLY`
- Task inbox: `.ai-bridge/inbox/BRIDGE-20260705-029-01-chatgpt.md`
- Current baseline inbox: `.ai-bridge/inbox/BRIDGE-20260705-029-04-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-20260705-029-claim-codex.md`
- Outbox: `.ai-bridge/outbox/BRIDGE-20260705-029-02-codex.md`
- Primary baseline: `1968d4bf2e26c2dd6cc5315378722171bdf6f034`
- Primary write scope: `NONE`
- Runtime: `READ_ONLY`
- Claim status: `UNCLAIMED`
- Parallel compatibility: slots 1 and 2

## Fixed-slot claim rules

- `мост 1` claims or continues only Bridge Slot 1.
- `мост 2` claims or continues only Bridge Slot 2.
- `мост 3` claims or continues only Bridge Slot 3.
- A new Codex thread may claim only its requested slot's predetermined claim path.
- No command may fall through to another slot.
- If the slot is already claimed, return `BRIDGE_SLOT_ALREADY_CLAIMED`.
- If the slot has no active lane, return `BRIDGE_SLOT_UNAVAILABLE`.
- Claim commits and outbox commits are serialized direct children on the mailbox branch.
- A claim authorizes no primary or runtime write.
- Existing Codex threads continue only their own immutable claim token.
- ChatGPT independently verifies each slot when the user writes that same numbered command.
- After final Codex output, exact next user action must be to return to ChatGPT and write the same numbered command.

## Parallel ownership

- These three initial lanes are read-only and may execute concurrently.
- No primary product file is owned by any initial lane.
- Any discovered required write stops that lane and returns scope for a later task.
- Source/deployed mirrors, shared resolvers, dev-checks, registries, exports, globals, boot and aggregate smoke remain serialized.
- Shared `TASKS.md` and `PROJECT_MEMORY.md` updates belong to one final documentation owner per wave.

## Alias migration state

- Root `AGENTS.md`, `BRIDGE.md`, `CODEX_BRIDGE_BOOTSTRAP.md`, `GIT_PULL.md`, and `STAGE6_PARALLEL_EXECUTION_PLAN.md` are current on main commit `1968d4bf2e26c2dd6cc5315378722171bdf6f034`.
- The active local user-level Codex instruction on the user's Mac still requires migration to the V2.1 numbered managed block.
- A clean local checkout that pulls main can route numbered commands through root `AGENTS.md` immediately.
- Do not publish the stale local thread 024 diff.

## Historical status

- Thread 024 remains `CODEX_LOCAL_PASS_UNPUBLISHED_NOT_ACCEPTED`.
- Threads 025 and 026 remain superseded/deferred records.
- Accepted S6-010A1-A4 remains unchanged on product commit `15a4d952cc0a38c5260f3bf75eb040a0c72fba69`.
- PR #187 remains an existing status PR and must not be reopened without new defect evidence.

## Next user action

1. Sync the local checkout with current main and migrate the local user-level Codex managed block to V2.1 if a new thread does not recognize numbered commands.
2. Create three new Codex threads in the AsyncScene project.
3. In thread 1 write only `мост 1`.
4. In thread 2 write only `мост 2`.
5. In thread 3 write only `мост 3`.
6. Choose each thread's recommended model/reasoning and send `CONTINUE` in that same thread.
7. When a thread finishes, return to ChatGPT and write the matching numbered command for independent verification.
