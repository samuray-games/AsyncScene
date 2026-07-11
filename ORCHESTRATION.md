# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 3.3
BRIDGE_PROTOCOL: 3.2
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
STATUS: ACTIVE

## Authority

Use current remote `AGENTS.override.md`, `AGENTS.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md`, `BRIDGE.md`, Git policies, mailbox publication policy, STATE, current inbox and current claim. Historical artifacts are audit-only.

Exact scope ownership and collision checks are handled by `scope-isolation-check`.

Scope collisions return `BLOCKED_SCOPE_COLLISION`.

## Canonical loop

`ChatGPT contract -> мост N in Codex -> fresh fetch -> execute -> validate -> [primary commit or verified no delta] -> outbox -> мост N in ChatGPT -> verify/root-sync`

Previous conversational completion never satisfies a new numbered command.

## Execution epoch

Every open slot has one current `EXECUTION_EPOCH` recorded identically in STATE, inbox and claim.

A numbered command executes only that epoch. Old claims, inboxes and outboxes cannot satisfy it.

## Thread rotation

When STATE says `THREAD_ROTATION_REQUIRED: true`:

- the prior Codex conversation is superseded;
- a fresh Codex conversation adopts the replacement claim named by STATE;
- logical bridge thread id remains unchanged for audit history;
- execution starts on the first matching numbered command with read-only discovery and mandatory automatic model preflight;
- implementation begins only after exact same-thread `CONTINUE` when current authority requires the preflight pause.

## Codex execution

On `мост N`, Codex must before any terminal response:

1. fetch main and mailbox;
2. read current remote authority, STATE, inbox and claim;
3. verify epoch, slot, task, phase, baseline, scope and expected outbox;
4. run the ordered read-only preflight `task-router -> scope-isolation-check -> model-selector`;
5. when current authority requires model preflight, return `WAITING_FOR_MODEL_SELECTION` and end with exactly one standalone fenced `CONTINUE` block;
6. after exact same-thread `CONTINUE`, refetch authority and verify unchanged thread, task, claim, baseline and scope before any mutation;
7. use clean implementation and mailbox worktrees;
8. execute and validate;
9. choose one legal completion mode;
10. refetch main and machine-derive evidence;
11. publish the exact current outbox;
12. refetch mailbox;
13. return `PASS_PUSHED` or `PASS_VERIFIED_NO_DELTA` with evidence and one next action.

## Completion modes

### Primary delta

When authorized paths change, publish one direct-child primary commit, exact-scope fast-forward push and the exact current outbox.

### Verified no delta

`VERIFIED_NO_DELTA` requires `ALLOW_VERIFIED_NO_DELTA: true` in the current inbox or claim.

Codex must prove the current baseline already satisfies the frozen objective, required checks pass, deterministic generation produces zero diff, exact changed paths are empty and protected blobs are unchanged.

The outbox must contain `completionMode: VERIFIED_NO_DELTA`, `primaryChanged:false`, the fetched baseline SHA, `primaryParent:N/A`, `changedPaths:[]`, exact scope blob SHAs and all validations.

Empty primary commits are forbidden.

ChatGPT may independently accept and record a pre-policy `BLOCKED_NO_SOURCE_DELTA` result when it verifies the same evidence on the same baseline.

## No-op guard

A bare return without the exact current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`.

A historical outbox cannot satisfy a current epoch.

## Phases

- `CLOSED`
- `SCOPE_FREEZE`
- `READY_FOR_CODEX`
- `EXECUTE_AND_PUBLISH`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT`
- `VERIFIED_NO_DELTA_AWAITING_CHATGPT`
- `CORRECTION_REQUIRED`
- `READY_FOR_SAFARI`
- `AWAITING_SAFARI`
- `PASS_ACCEPTED`
- `BLOCKED_EXTERNAL`

`CORRECTION_REQUIRED` executes on the next matching numbered command unless ChatGPT independently closes a verified pre-policy no-delta result.

## Publication

Primary delta publication is direct-child, exact-scope, fast-forward and remotely verified. If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`.

Verified no delta never creates a primary commit. It publishes only the exact current evidence outbox.

Mailbox publication uses the exact expected outbox path, latest mailbox parent, fast-forward push and fresh verification. Manual SHA transcription is forbidden.

## Safety

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push user work. Local divergence is not a blocker.

After one non-interactive auth repair, failure returns `BLOCKED_PUSH_AUTH` with complete evidence. Never request credentials.

## Root synchronization

A reusable process defect must be fixed in every affected authority, validator, mailbox policy, STATE, current contract and live memory before the next action.

## Acceptance

Remote publication, verified-no-delta evidence, static acceptance, deployment readiness and user Safari acceptance are separate tiers. Git publication is not Safari PASS.

## Bridge 062 plugin-independent closed-loop correction

BRIDGE-20260710-062 uses execution epoch CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST and baseline 32513f02daf5943c41f24328e1ae251d6bc85ccc.
The terminal success action code is exactly OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND.
This lane uses plugin-independent bridge transport: source implementation acceptance and separate canary acceptance are required before closed-loop completion; plugin installation and plugin package acceptance are outside this gate.
Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main; ChatGPT publishes mailbox artifacts after independent PR verification and merge.
