# Bridge State

BRIDGE_PROTOCOL: 2.2
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-07T15:20:00+09:00
USER_COMMAND_SLOT_1: мост 1
USER_COMMAND_SLOT_2: мост 2
USER_COMMAND_SLOT_3: мост 3
BARE_MOST_ALIAS: INACTIVE
OLDER_BRIDGE_PHRASE: RECOVERY_ONLY
MAX_CONCURRENT_CODEX_LANES: 3
AUTHORIZED_PRIMARY_BASELINE: a4f1fb0d2438ba72aeeaa83dbcfb0a27dea2b2ff
PARALLEL_PLAN: STAGE6_PARALLEL_EXECUTION_PLAN.md
PARALLEL_PLAN_VERSION: S6-PARALLEL-2026-07-07-02-NUMBERED
RECOVERY_CONTRACT: CODEX_BRIDGE_RECOVERY.md
RECOVERY_STATUS: REQUIRED_ONCE_BEFORE_FRESH_THREADS

## Current status

- Bridge status: `PROTOCOL_2_2_RECOVERY_READY`
- Open slots: `1`, `2`, `3`
- Slot selection: exact numbered command only; no fallback
- Active claims: `NONE`
- Completed slots in current wave: `NONE`
- Invalidated local responses:
  - Slot 1 response with `BLOCKED_PLUGIN_NOT_LOADED` plus `CONTINUE`
  - Slot 2 clarification that recognized only the older alias
- Next free thread id: `BRIDGE-20260705-030`
- Latest ChatGPT turn: `.ai-bridge/inbox/BRIDGE-20260705-029-05-chatgpt.md`
- Latest accepted Codex turn: `NONE_AFTER_PROTOCOL_2_2_ACTIVATION`

## One-time recovery

Before opening fresh numbered bridge threads, execute current `origin/main:CODEX_BRIDGE_RECOVERY.md` once in any Codex thread.

Recovery:

- changes only the active user-level Codex instruction managed block;
- preserves all dirty repository files;
- creates no claim or outbox;
- installs bootstrap id `ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V2_2`;
- enables remote-first routing and functional plugin proof.

After recovery, old bridge threads must be closed and replaced by fresh threads.

## Bridge Slot 1

- User command: `мост 1`
- Thread: `BRIDGE-20260705-027`
- Lane: `S6-T1-TRACEABILITY`
- Task: `TASK-S6-PAR-T1`
- Phase: `MODEL_PREFLIGHT_ONLY`
- Task inbox: `.ai-bridge/inbox/BRIDGE-20260705-027-01-chatgpt.md`
- Current baseline inbox: `.ai-bridge/inbox/BRIDGE-20260705-027-05-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-20260705-027-claim-codex.md`
- Outbox: `.ai-bridge/outbox/BRIDGE-20260705-027-02-codex.md`
- Primary baseline: `a4f1fb0d2438ba72aeeaa83dbcfb0a27dea2b2ff`
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
- Current baseline inbox: `.ai-bridge/inbox/BRIDGE-20260705-028-05-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-20260705-028-claim-codex.md`
- Outbox: `.ai-bridge/outbox/BRIDGE-20260705-028-02-codex.md`
- Primary baseline: `a4f1fb0d2438ba72aeeaa83dbcfb0a27dea2b2ff`
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
- Current baseline inbox: `.ai-bridge/inbox/BRIDGE-20260705-029-05-chatgpt.md`
- Claim: `.ai-bridge/claims/BRIDGE-20260705-029-claim-codex.md`
- Outbox: `.ai-bridge/outbox/BRIDGE-20260705-029-02-codex.md`
- Primary baseline: `a4f1fb0d2438ba72aeeaa83dbcfb0a27dea2b2ff`
- Primary write scope: `NONE`
- Runtime: `READ_ONLY`
- Claim status: `UNCLAIMED`
- Parallel compatibility: slots 1 and 2

## Protocol 2.2 rules

- Numbered commands are always unambiguous.
- Remote `origin/main` policy outranks stale local bridge files.
- Dirty local AGENTS or BRIDGE files do not block user-level recovery.
- Plugin proof may be native resolver proof or complete functional invocation proof.
- Missing native telemetry alone is not a blocker.
- Plugin proof occurs before a new claim.
- A claim path is never a claim token.
- A blocked response never contains `CONTINUE`.
- Claims and outboxes remain serialized direct-child mailbox commits.
- ChatGPT independently verifies each slot from its numbered command.

## Parallel ownership

- The three initial tasks are read-only and may execute concurrently.
- No initial slot owns a primary product file.
- Required writes stop the lane and return scope for a later task.
- Source/deployed mirrors, shared resolvers, dev-checks, registries, exports, globals, boot and aggregate smoke remain serialized.
- Shared `TASKS.md` and `PROJECT_MEMORY.md` updates have one documentation owner per wave.

## Next user action

1. In one Codex thread, execute current `origin/main:CODEX_BRIDGE_RECOVERY.md` exactly.
2. Require `PASS_BRIDGE_RECOVERY_INSTALLED`.
3. Close the three old bridge chats.
4. Open three fresh Codex chats.
5. Send `мост 1`, `мост 2`, and `мост 3` respectively.
6. Select each recommended model/reasoning and send `CONTINUE` only after a valid non-blocked preflight.
7. When a lane finishes, return to ChatGPT with the matching numbered command.
