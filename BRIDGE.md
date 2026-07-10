# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
ORCHESTRATION: `ORCHESTRATION.md`
ROOT_SYNC: `PROCESS_ROOT_SYNC.md`

## 1. Commands

The only numbered bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

Each command selects one fixed slot and runs the complete current remote cycle.

Previous conversation state is never authority for a new command.

Bare `мост`, `запуль` and `запушь` are inactive.

Separate bridge tokens are not required.

## 2. Mandatory first actions

Before any terminal response Codex must:

1. fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
2. read current remote root authority and mailbox publication policy;
3. read current STATE;
4. read the exact current inbox and claim named by STATE;
5. verify slot, thread, lane, task, execution epoch, phase, baseline, write scope and expected outbox;
6. execute the current phase from clean worktrees;
7. validate, publish and refetch both destinations.

Codex must ignore any prior conversational statement that the lane is completed.

Scope overlap decisions belong to `scope-isolation-check`.

Scope collisions return `BLOCKED_SCOPE_COLLISION`.

## 3. Thread rotation

When STATE says `THREAD_ROTATION_REQUIRED: true`:

- the previous Codex thread is superseded;
- a fresh Codex thread may adopt the replacement claim named by STATE;
- the old thread and earlier claims are historical only;
- execution begins on the first matching numbered command;
- no preflight or continuation token is allowed.

## 4. Completion modes

### 4.1 Primary delta

When authorized files change:

- create one direct-child commit;
- prove exact paths;
- push fast-forward;
- refetch main;
- publish the exact current outbox;
- return `PASS_PUSHED`.

### 4.2 Verified no delta

This mode is legal only when the current inbox or claim contains `ALLOW_VERIFIED_NO_DELTA: true`.

Codex must prove:

- current remote main equals the authorized baseline;
- required generation and validation pass;
- deterministic regeneration produces zero diff;
- exact changed paths are empty;
- protected blobs are unchanged;
- the baseline already satisfies the frozen objective.

Empty primary commits are forbidden.

The current outbox must contain:

- `completionMode: VERIFIED_NO_DELTA`;
- `primaryChanged:false`;
- verified baseline SHA;
- `primaryParent:N/A`;
- `changedPaths:[]`;
- exact scope blob SHAs;
- validation and negative-control evidence;
- the no-delta reason.

After refetching mailbox, return `PASS_VERIFIED_NO_DELTA`.

### 4.3 Invalid no-op

A bare return-to-ChatGPT line without the current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`.

Historical outboxes do not satisfy a new execution epoch.

## 5. Clean worktrees

Use one clean task-owned worktree at the authorized baseline and one separate mailbox worktree at the latest mailbox head.

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push the user's primary checkout.

Local divergence is not a blocker.

## 6. Current metadata

Current remote STATE and its named inbox and claim supersede all older metadata.

The original task inbox remains authority only for unchanged objective and evidence not replaced later.

## 7. Primary publication

Primary publication is conditional on an actual authorized delta.

If there is no authorized delta, use verified-no-delta mode when allowed. Never manufacture an empty commit.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`.

## 8. Outbox publication

Every successful mode requires the exact current outbox, unless ChatGPT is independently closing a pre-policy `BLOCKED_NO_SOURCE_DELTA` result.

The outbox must:

- use the exact current expected path;
- be a direct child of the fetched mailbox head;
- change only that path;
- contain machine-derived fetched evidence;
- contain exact paths and validations;
- be refetched and verified remotely.

Manual SHA transcription is forbidden.

## 9. Authentication

Codex may run one non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with complete evidence. Never ask for credentials.

## 10. Correction and root synchronization

A reusable process defect triggers `PROCESS_ROOT_SYNC.md`.

ChatGPT synchronizes affected authority, validator, mailbox policy, STATE, current contract and live memory before the next action.

## 11. ChatGPT verification

When ChatGPT receives `мост N`, it:

1. reloads live memory and reports exact `MEMORY_REV`;
2. reads current main, mailbox policy and STATE;
3. verifies only Slot N;
4. checks the applicable completion mode;
5. for primary delta, checks ancestry, exact paths, tests and outbox;
6. for verified no delta, checks unchanged baseline, empty scope diff, artifact result, mirror parity, validation evidence and outbox;
7. may reconstruct and record closure for a pre-policy `BLOCKED_NO_SOURCE_DELTA` report after independent verification;
8. rejects unsupported prose;
9. accepts, corrects or closes the lane;
10. performs root synchronization for systemic defects.

Codex prose alone is never acceptance evidence.

## Bridge 062 plugin-independent closed-loop correction

BRIDGE-20260710-062 uses execution epoch CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST and baseline 32513f02daf5943c41f24328e1ae251d6bc85ccc.
The terminal success action code is exactly OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND.
This lane uses plugin-independent bridge transport: source implementation acceptance and separate canary acceptance are required before closed-loop completion; plugin installation and plugin package acceptance are outside this gate.
Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main; ChatGPT publishes mailbox artifacts after independent PR verification and merge.
