# Asynchronia Protocol 3.2 Override

OVERRIDE_VERSION: ORCHESTRATION_3_3
BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE

Read root `AGENTS.md` fully. Every rule remains binding except the process clauses explicitly replaced below.

## 1. Process authority

Use this precedence:

1. `AGENTS.override.md`;
2. `AGENTS.md` bridge section;
3. `PROCESS_ROOT_SYNC.md`;
4. `ORCHESTRATION.md`;
5. `BRIDGE.md`;
6. `GIT_PULL.md` and `GIT_PUSH.md`;
7. mailbox `.ai-bridge/PUBLICATION_POLICY.md`;
8. mailbox `.ai-bridge/STATE.md`;
9. current inbox named by STATE;
10. current claim named by STATE;
11. original task inbox for unchanged objective and evidence;
12. historical artifacts for audit only.

Repository files are authoritative for implementation state. Google Drive memory is authoritative for cross-chat context but never overrides newer repository facts.

## 2. Fresh execution rule

Every exact `мост N` is a new execution attempt for the execution epoch currently named by STATE.

Before any final response Codex must freshly fetch main and mailbox, read current authority, STATE, inbox and claim, then execute the current phase.

A previous conversational completion, previous outbox or old claim cannot satisfy a new execution epoch.

## 3. Thread rotation

When STATE says `THREAD_ROTATION_REQUIRED: true`:

- the previous Codex conversation is superseded;
- a fresh Codex conversation may adopt the replacement claim named by STATE;
- old thread ownership is void;
- execution starts immediately on the matching numbered command;
- no preflight or separate bridge token is required.

The logical bridge thread id remains unchanged for audit history even when the Codex conversation rotates.

## 4. Completion modes

This section replaces the unconditional primary-advance requirement in lower-precedence no-op clauses.

### 4.1 Primary delta

When authorized files change, Codex must create one direct-child primary commit, push it fast-forward, refetch main, publish the exact current outbox and return `PASS_PUSHED`.

### 4.2 Verified no delta

`VERIFIED_NO_DELTA` is not a no-op. Empty primary commits are forbidden.

It is allowed only when the current inbox or claim explicitly contains `ALLOW_VERIFIED_NO_DELTA: true` and a fresh execution proves all of the following:

- the authorized baseline is still current remote main;
- the required generator and validators pass on that baseline;
- deterministic regeneration produces zero diff in the exact authorized scope;
- exact changed paths are empty;
- protected file blobs remain unchanged;
- the result already satisfies the frozen objective;
- the exact current outbox is published and refetched.

The outbox must contain:

- `completionMode: VERIFIED_NO_DELTA`;
- `primaryChanged:false`;
- the fetched baseline SHA as the verified primary SHA;
- `primaryParent:N/A`;
- `changedPaths:[]`;
- exact authorized paths and their fetched blob SHAs;
- every required validation result;
- the reason no source delta exists.

After remote mailbox verification Codex returns `PASS_VERIFIED_NO_DELTA` and one next action.

ChatGPT must independently verify the baseline, artifact state, mirror parity, validation evidence and current outbox before acceptance.

If verified-no-delta is not explicitly authorized, Codex returns `BLOCKED_NO_SOURCE_DELTA` without creating an empty commit.

### 4.3 Invalid completion

A one-line `Return to ChatGPT and send мост N` without the current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`.

Historical outboxes cannot satisfy a new execution epoch.

## 5. Remote-first execution

Codex must:

1. verify repository identity;
2. fetch main and mailbox;
3. read remote authority;
4. resolve only the requested slot and current epoch;
5. use clean task-owned worktrees;
6. preserve unrelated work;
7. never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push.

Local divergence is not a blocker.

## 6. Publication

After validation Codex must choose exactly one legal completion mode:

- primary delta: publish one direct-child primary commit and the exact outbox;
- verified no delta: publish only the exact evidence outbox, never an empty primary commit.

Every mailbox publication must use the latest fetched mailbox parent, change only the authorized outbox path, push fast-forward and be refetched.

Manual SHA transcription is forbidden.

## 7. Authentication

Codex may run one configured non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle. Never request credentials.

## 8. Root synchronization

Every reusable process defect triggers `PROCESS_ROOT_SYNC.md`.

If root hardening moves main while a lane is open, ChatGPT must synchronize STATE and the current contract to the new exact baseline.

## 9. Runtime and acceptance

- Exact scope ownership is enforced through `scope-isolation-check`.
- Source and deployed mirrors are one ownership group.
- Git publication is not Safari PASS.
- Codex cannot claim user acceptance.

## 10. Final action

A successful Codex result is exactly one of:

- `PASS_PUSHED` with fetched remote SHAs, actual parent, exact changed paths, checks and one next action;
- `PASS_VERIFIED_NO_DELTA` with the current evidence outbox, unchanged baseline SHA, empty changed paths, checks and one next action.

Do not offer competing paths or repeat information already present in current remote authority.

## Bridge 062 plugin-independent closed-loop correction

BRIDGE-20260710-062 uses execution epoch CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST and baseline 32513f02daf5943c41f24328e1ae251d6bc85ccc.
The terminal success action code is exactly OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND.
This lane uses plugin-independent bridge transport: source implementation acceptance and separate canary acceptance are required before closed-loop completion; plugin installation and plugin package acceptance are outside this gate.
Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main; ChatGPT publishes mailbox artifacts after independent PR verification and merge.
