# Asynchronia ChatGPT-Codex Closed Loop

PROTOCOL_ID: ASYNCHRONIA_CLOSED_LOOP_V1_1
STATUS: ACTIVE_MAILBOX_AUTHORITY
PRIMARY_GOAL: COMPLETED_RESUMABLE_CYCLE

## Core invariants

- One atomic execution epoch equals one fresh Codex conversation.
- One independent outbox verification equals one fresh ChatGPT conversation.
- A rejected, blocked, stale or incomplete epoch is never resumed in its old conversation.
- Every correction or recovery gets a new thread, epoch, nonce, inbox, claim and outbox.
- Conversation history is never authoritative state.
- State crosses chats only through live Google Drive memory, current repository sources, mailbox STATE, inbox, claim, outbox, commits, diffs and validation evidence.
- Repository sources override stale memory for implementation state, but memory must be repaired before the next handoff.
- A task is complete only after fresh ChatGPT verification.
- Product work remains suspended until implementation and a separate canary cycle are both accepted.

## Immutable task identity

Every task instance has: CYCLE_ID, generation, THREAD_ID, TASK_ID, LANE_ID, EXECUTION_EPOCH, TASK_NONCE, slot, baseline, inbox, claim, expected outbox path, write/no-delta mode, exact scope, coordinator MEMORY_REV, plugin route and validation contract.

The expected outbox path is identity metadata and a reserved future publication address. It is not a required input artifact at task startup.

Codex must echo the full identity in the terminal outbox. Any mismatch is stale or foreign evidence.

## Coordinator transaction

A fresh ChatGPT coordinator must:

1. load and report live MEMORY_REV;
2. fetch current main and mailbox;
3. reconcile memory, primary sources and STATE;
4. split work into atomic collision-safe tasks;
5. assign one fresh thread and nonce per task;
6. publish inbox and claim while they are still inert;
7. remotely refetch and verify them;
8. update STATE last so it activates only verified artifacts;
9. refetch STATE and all referenced startup artifacts;
10. update and refetch live memory;
11. only then hand off to fresh Codex chats.

Inbox or claim files not referenced by STATE are inert orphans. STATE referencing missing inbox or claim is RECOVERY_REQUIRED. The expected outbox is intentionally allowed to be absent before execution. If memory synchronization fails, set MEMORY_SYNC_PENDING and do not authorize Codex.

## Codex transaction

A fresh Codex chat receives only мост 1, мост 2 or мост 3 and must:

1. freshly fetch main and mailbox;
2. read remote STATE and only its named inbox and claim;
3. verify full identity, nonce and expected outbox path;
4. confirm that absent expected outbox is normal for a fresh `READY_FOR_CODEX` epoch;
5. if an outbox already exists, treat it as possible stale, duplicate or foreign evidence and never reuse it without identity proof;
6. discard local, conversational and historical identity;
7. activate @asynchronia and invoke task-router first;
8. invoke scope-isolation-check, model-selector, conditional parallel-scope-planner, closed-loop-controller, failure-routing-and-corrective-loop and routed skills;
9. execute one frozen task in a clean worktree;
10. repair recoverable failures before terminal output;
11. validate the exact final committed tree;
12. publish primary changes;
13. assemble one immutable complete response;
14. publish those exact bytes to the expected outbox;
15. refetch and prove remote schema and byte equality;
16. only then tell the user to open a fresh ChatGPT chat with the same bridge command.

`BLOCKED_NO_REMOTE_OUTBOX` is invalid before terminal publication and is not a supported terminal class. The Codex chat expires after its final response. CONTINUE, corrections and another task in that chat are forbidden.

## Fresh ChatGPT verification

A fresh verifier must load memory, fetch main and mailbox, fetch the exact current task package and outbox, and independently verify identity, nonce, ancestry, parent, paths, scope, protected files, tests, validators, plugin evidence and report schema.

It classifies the epoch as ACCEPTED, CORRECTION_REQUIRED, RECOVERY_REQUIRED or BLOCKED_EXTERNAL. It then publishes closure or a new task package, updates STATE last, updates memory and only then prepares the next work.

A rejected task always creates a new task instance and fresh Codex conversation.

## Automatic recovery

Recoverable failures are repaired before terminal output:

- stale refs or non-fast-forward: refetch, recreate clean worktree and retry;
- moved main: automatically reapply and revalidate only when writes and stable reads are disjoint, otherwise publish a complete blocker;
- dirty worktree: use a fresh task-owned worktree and preserve unrelated changes;
- stale plugin during plugin repair: use the explicitly authorized pinned source-plugin bootstrap, validate it, install through temporary sibling and atomic rename, preserve old versions;
- validation failure inside scope: diagnose, repair and rerun, up to three distinct repair passes per root cause;
- outbox push absence or byte mismatch after terminal report assembly: preserve immutable response bytes, recreate from latest mailbox and retry up to three clean attempts;
- transient fetch, push or connector error: retry up to three times with remote identity revalidation.

Never use an ungoverned generic plugin fallback.

## Terminal but resumable failures

When mailbox publication works, every blocker must still publish a complete outbox. Supported classes include scope collision, moved baseline, remote-state inconsistency, invalid source plugin, plugin-install permission, plugin unavailable, push authorization, outside-scope tests, contract contradiction and external service failure.

If outbox publication itself remains impossible after bounded terminal publication attempts, Codex returns BLOCKED_OUTBOX_PUBLICATION, preserves the complete response locally and gives no ChatGPT handoff.

A fresh ChatGPT chat seeing a missing outbox after a Codex final response creates a new correction, report-recovery or publication-recovery task after inspecting remote primary evidence. Every recovery is a new thread and epoch.

## Verifier failure coverage

The verifier and validator must handle missing, empty, partial, historical, wrong-slot, wrong-thread, wrong-task, wrong-epoch and wrong-nonce terminal outboxes; missing or foreign commits; wrong parent; main advancement; lost ancestry; scope overflow; protected-path changes; non-reproducible tests; missing negative controls; plugin identity mismatch; false no-delta; memory/STATE conflict; duplicate or wrong bridge commands; missing Safari evidence; and product work attempted before the cycle gate is complete.

Startup absence of the reserved expected outbox is a positive fresh-epoch condition, not a failure case.

## Memory rule

ChatGPT loads live memory on every project response. No handoff is allowed while MEMORY_SYNC_PENDING. Every activation, acceptance, rejection, correction, recovery, slot change and canary result updates and refetches memory.

## Completion gate

CLOSED_LOOP_STATUS becomes COMPLETE only after:

1. CLOSED_LOOP_IMPLEMENTATION is executed in one fresh Codex chat and accepted in one fresh ChatGPT chat.
2. A separate CLOSED_LOOP_CANARY is automatically prepared, executed in another fresh Codex chat and accepted in another fresh ChatGPT chat.

The canary proves freshness, plugin routing, report schema, outbox publication, remote refetch and byte equality. Only then may suspended product work resume.
