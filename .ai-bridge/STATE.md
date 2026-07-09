# Bridge State

BRIDGE_PROTOCOL: 3.2
ORCHESTRATION_VERSION: 3.2
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
EMPTY_OUTBOX: FORBIDDEN
FINAL_RESPONSE_OUTBOX_IDENTITY: REQUIRED
MANDATORY_PLUGIN_FIRST: REQUIRED
RUNTIME_SAFETY_GATE: RETIRED_AND_REMOVE
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
CURRENT_MAIN_BASELINE: 5505f19b379cdf9a4559c1e6d5dd8292160e599b
PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH
PUBLICATION_POLICY: .ai-bridge/PUBLICATION_POLICY.md
PUBLICATION_POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_PLUGIN_FIRST_FULL_OUTBOX
ROOT_PROCESS_SYNC_STATUS: SLOT2_MANDATORY_PLUGIN_RUNTIME_GATE_REMOVAL_OPEN

## Current status

- Bridge status: `CORRECTION_REQUIRED`
- Slot 1: `CLOSED_SUPERSEDED_BY_SLOT_2`
- Slot 2: `OPEN_RESERVED_EXECUTION`
- Slot 3: `CLOSED_SERIALIZED_PROCESS_SCOPE`
- Accepted progress: `77/100`
- Working readiness: `77/100`
- Safari: `N/A_PROCESS_ONLY`

## Active Slot 2

- Thread: `BRIDGE-20260709-045`
- Lane: `PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE`
- Task: `TASK-PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE`
- Execution epoch: `PLUGIN-E1-20260709-1735JST`
- Phase: `CORRECTION_REQUIRED`
- Current inbox: `.ai-bridge/inbox/BRIDGE-20260709-045-01-chatgpt.md`
- Current claim: `.ai-bridge/claims/BRIDGE-20260709-045-claim-v1-codex.md`
- Expected outbox: `.ai-bridge/outbox/BRIDGE-20260709-045-02-codex.md`
- Baseline: `5505f19b379cdf9a4559c1e6d5dd8292160e599b`
- Primary write required: `true`
- Allow verified no delta: `false`
- Thread rotation required: `true`
- Fresh Codex conversation required: `true`
- Safari status: `N/A_PROCESS_ONLY`

## Mandatory plugin-first contract

Every Asynchronia Codex task, bridge-based or direct, must start with the exact first line `Use @asynchronia.`.

The Asynchronia plugin route is mandatory:

- `task-router` first for every task;
- `scope-isolation-check` for every implementation or repository-write lane;
- `model-selector` for every implementation or repository-write lane;
- `parallel-scope-planner` whenever multiple tasks, lanes, slots, concurrent writers, mirrors, shared dependencies, registries, generated outputs, or documentation owners exist;
- every specialized skill required by the route.

If the plugin cannot be resolved, loaded, or invoked, implementation must not start. Codex returns `BLOCKED_PLUGIN_UNAVAILABLE` with exact diagnostics.

The final response and outbox must report the active plugin version and source, skills invoked in order, material result from each skill, and proof that required routing was not skipped.

## Runtime gate removal

`runtime-safety-gate` is obsolete and must be removed from source and active installed package behavior.

The active replacement is `scope-isolation-check`, exact write ownership, mirror ownership, stable-read dependency analysis, shared wiring ownership, and serialization of real collisions.

The old prompt `Use @asynchronia runtime-safety-gate.` is forbidden in active process surfaces. Runtime approval, runtime authorization, approval-only stops, and equivalent hidden gates are forbidden. User-owned Safari acceptance remains separate and does not block implementation preflight.

Repository source cleanup is insufficient. Active installed Asynchronia plugin version `1.0.4` must be installed and verified to contain no runtime-safety-gate skill, alias, index entry, or callable route.

## Three-slot contract

The bridge permanently exposes `мост 1`, `мост 2`, and `мост 3`. Each command addresses only its matching slot.

Slot 2 is currently the sole active owner. Slot 1 was intentionally superseded at the user's direction. Slot 3 is closed because the current task owns shared process, workflow, validator, plugin, bootstrap, installation, evidence, and outbox contracts.

Future collision-free tasks may reopen Slots 1 and 3 after this serialized correction is accepted.

## Full outbox contract

The expected outbox must contain the complete final response Codex shows to the user. The outbox and visible response must be byte-for-byte identical.

Empty, whitespace-only, partial, summary-only, pointer-only, placeholder, receipt-only, and one-line handoff outboxes are forbidden.

Codex must assemble and validate the complete response, publish it from a clean latest mailbox worktree, push fast-forward, refetch the remote outbox, prove exact byte equality, and only then show the same response to the user.

Every recoverable mailbox publication failure must retry automatically. No success and no ChatGPT handoff is allowed before verified publication. A non-recoverable external authentication, permission, or service outage returns `BLOCKED_OUTBOX_PUBLICATION` and forbids a ChatGPT handoff.

## Model recommendation contract

Only the Asynchronia `model-selector` may originate, rank, or name a recommendation. The user alone selects the active interface model. Actual model status remains `USER_SELECTED_UNVERIFIED` unless externally verified.

Recommendation is informational and cannot pause, block, authorize, or resume execution. `MODEL_PREFLIGHT_ONLY`, `WAITING_FOR_MODEL_SELECTION`, mandatory `CONTINUE`, valid-preflight resume dependencies, and synonymous hidden stops must be removed.

## Superseded Slot 1 task

- Thread: `BRIDGE-20260709-044`
- Lane: `PROCESS-BRIDGE-OUTBOX-AND-PARALLEL-CONTRACT`
- Task: `TASK-PROCESS-THREE-SLOT-FULL-OUTBOX-HARDENING`
- Epoch: `OBX-E1-20260709-1720JST`
- Slot: `1`
- Status: `SUPERSEDED_BY_SLOT_2_THREAD_045`
- Reason: user directed this shared process/plugin task to Slot 2 and expanded it to full runtime-gate removal plus mandatory installed-plugin activation.

Thread 044 must not execute. Its objective is incorporated into thread 045.

## Rejected Step 4.4B attempt

- Thread: `BRIDGE-20260709-041`
- Task: `TASK-S6-PAR-V5B`
- Primary commit: `5505f19b379cdf9a4559c1e6d5dd8292160e599b`
- Actual parent: `cf2558d782d614d97bc66deec3a69017f5085d73`
- Rejected outbox: `.ai-bridge/outbox/BRIDGE-20260709-041-09-codex.md`
- ChatGPT rejection closure: `.ai-bridge/inbox/BRIDGE-20260709-041-10-chatgpt.md`
- Verdict: `REJECTED_INCOMPLETE_AGGREGATE_AND_PROCESS_CONFLICT`
- Safari: `NOT_AUTHORIZED`

## Suspended product task

- Thread: `BRIDGE-20260709-041`
- Lane: `S6-V5B-BOOMER-RUNTIME-AGGREGATE`
- Reason: `SUSPENDED_FOR_SYSTEMIC_PROCESS_CORRECTION`
- Resume rule: issue a replacement Step 4.4B epoch only after thread 045 is independently accepted and live memory is synchronized.

## Next action

Open a fresh Codex conversation and send exactly `мост 2`.

Codex must execute `.ai-bridge/inbox/BRIDGE-20260709-045-01-chatgpt.md`, activate the Asynchronia plugin, remove runtime-safety-gate from source and active installed behavior, enforce plugin-first routing for every task, complete the shared process correction, publish the complete final response to `.ai-bridge/outbox/BRIDGE-20260709-045-02-codex.md`, refetch it, prove byte-for-byte identity, and only then tell the user to return to ChatGPT and send `мост 2`.

Do not run `мост 1`, `мост 3`, or Safari for this serialized correction.
