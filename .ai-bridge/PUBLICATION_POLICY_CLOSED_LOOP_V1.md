# Closed-Loop Bridge Publication Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_CLOSED_LOOP_V1_1
STATUS: ACTIVE_WHEN_REFERENCED_BY_STATE
PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL.md
CLOSED_LOOP_STATUS: IMPLEMENTATION_REQUIRED

## Non-negotiable lifecycle

- One atomic execution epoch equals one fresh Codex conversation.
- One independent outbox verification equals one fresh ChatGPT conversation.
- Every correction or recovery gets a new thread, epoch, nonce, inbox, claim and outbox.
- Conversation history is never authoritative.
- STATE is the only activation pointer. Unreferenced task artifacts are inert.
- Product work stays suspended until implementation and a separate canary are accepted.

## Coordinator publication order

A fresh ChatGPT coordinator loads live MEMORY_REV, fetches main and mailbox, reconciles primary sources, prepares unique task identities, publishes inbox and claim, remotely verifies them, updates STATE last, refetches STATE, updates live memory, refetches memory, and only then hands off bridge commands.

If memory sync fails, no Codex handoff is allowed. STATE must remain or become `MEMORY_SYNC_PENDING` until a fresh ChatGPT chat repairs memory.

## Codex startup

For `мост 1`, `мост 2` or `мост 3`, Codex freshly fetches main and mailbox, reads remote STATE and only its named inbox and claim, verifies cycle, generation, thread, task, epoch, nonce, slot, baseline and expected outbox path, and discards stale local or conversational identity.

The expected outbox path is a reserved destination, not a required startup artifact. For a fresh active epoch in `READY_FOR_CODEX`, absence of the expected outbox is normal and must not block execution. `BLOCKED_NO_REMOTE_OUTBOX` is invalid at startup.

If the expected outbox already exists before execution, Codex must treat it as a possible stale, duplicate or foreign artifact and verify identity. It must never reuse historical bytes as the current result.

Every task begins with `Use @asynchronia.`. Required route is `task-router` first, then `scope-isolation-check`, `model-selector`, conditional `parallel-scope-planner`, `closed-loop-controller`, `failure-routing-and-corrective-loop`, and every routed skill.

Ordinary tasks require the validated installed plugin. An explicitly authorized plugin-repair task may use pinned source-plugin bootstrap. Ungoverned generic fallback and `runtime-safety-gate` are forbidden.

## In-place recovery

Codex repairs recoverable failures before terminal output:

- stale refs or non-fast-forward: refetch and recreate clean worktrees;
- moved main: automatically reapply only when writes and stable reads are disjoint, then rerun all checks;
- dirty worktree: use a fresh task-owned worktree and preserve unrelated files;
- plugin repair: validate pinned source, install via temporary sibling and atomic rename when supported, preserve older versions and user files;
- validation failure inside scope: diagnose, repair and rerun, up to three distinct passes per root cause;
- transient fetch, push or connector failure: up to three retries with remote identity revalidation;
- outbox publication absence or byte mismatch after the immutable terminal report has been assembled: preserve response bytes, refetch latest mailbox and retry up to three clean attempts.

Outside-scope, collision, permission, contract or external failures publish complete blocker evidence whenever mailbox publication works.

## Primary publication

`PASS_PUSHED` requires one direct-child exact-scope commit validated from the exact committed tree.

When main moved, Codex may rebuild on the new head only after proving no write overlap and no mutable stable-read dependency. Otherwise it publishes a complete moved-baseline blocker.

`PASS_VERIFIED_NO_DELTA` is allowed only when the current task explicitly enables it and complete deterministic proof exists. A passing old validator never proves that a requested validator expansion is unnecessary.

## Outbox transaction

Outbox existence becomes mandatory only after execution reaches terminal publication. Codex prepares one immutable complete final response, validates its schema, publishes those exact bytes to the expected outbox, pushes fast-forward, refetches remote mailbox and outbox, and proves byte equality before showing the same bytes to the user.

Empty, partial, summary-only, pointer-only, placeholder-only and handoff-only outboxes are forbidden. No success or blocker handoff is allowed before remote verification.

`BLOCKED_NO_REMOTE_OUTBOX` is not a legal terminal class. If mailbox publication remains impossible after bounded publication attempts, Codex returns `BLOCKED_OUTBOX_PUBLICATION`, preserves the complete report locally and does not instruct a ChatGPT handoff.

## Required report identity

Every outbox includes cycle id, generation, slot, thread, lane, task, epoch, nonce, coordinator MEMORY_REV, fetched mailbox commit, STATE blob SHA, baseline, primary commit and actual parent, exact paths, plugin source/version and ordered skill results, tests, validators, negative controls, failures, repairs, retry counts, missing coverage, Safari status, expected outbox, remote outbox identity, byte equality and exact instruction to open a fresh ChatGPT chat with the same bridge command.

## Fresh ChatGPT verification

A fresh verifier reloads memory and remote sources, fetches the exact current task package and outbox, and independently checks identity, nonce, ancestry, parent, changed paths, protected paths, reproducible tests, plugin evidence and report schema.

It classifies ACCEPTED, CORRECTION_REQUIRED, RECOVERY_REQUIRED or BLOCKED_EXTERNAL. It never returns to the old Codex chat. It publishes closure or a new task package, updates STATE last, updates and refetches memory, then prepares the next work.

Missing outbox after a Codex final response creates a new correction, report-recovery or publication-recovery task after remote primary inspection. A duplicate bridge command for a closed epoch never re-executes history.

## Completion gate

The cycle becomes COMPLETE only after:

1. CLOSED_LOOP_IMPLEMENTATION runs in one fresh Codex chat and is accepted in one fresh ChatGPT chat.
2. CLOSED_LOOP_CANARY is automatically created, runs in another fresh Codex chat and is accepted in another fresh ChatGPT chat.

The canary proves fresh remote resolution, plugin routing, schema validation, outbox publication, remote refetch and byte equality. Only then may suspended product work resume.
