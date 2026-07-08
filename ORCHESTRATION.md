# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 3.1
BRIDGE_PROTOCOL: 3.1
STATUS: ACTIVE

## 1. Purpose

This file defines the canonical operating loop for ChatGPT coordination, Codex execution, Git publication, independent verification, correction cycles and Safari acceptance.

The default numbered bridge cycle is deliberately simple:

`ChatGPT inbox -> user мост N to Codex -> Codex fetch/execute/push/outbox -> user мост N to ChatGPT -> ChatGPT verify -> next inbox`

## 2. Authority and precedence

For process mechanics, use this precedence:

1. current `origin/main:AGENTS.override.md`;
2. current `origin/main:ORCHESTRATION.md`;
3. current `origin/main:BRIDGE.md`;
4. current `origin/main:GIT_PULL.md` and `origin/main:GIT_PUSH.md`;
5. current mailbox `.ai-bridge/STATE.md`;
6. current baseline inbox named by STATE;
7. immutable claim;
8. original task inbox for unchanged objective and evidence requirements;
9. historical bridge artifacts for audit only;
10. root `AGENTS.md` for all rules not explicitly replaced above.

Primary repository files remain authoritative for implementation state. Google Drive project memory is authoritative for cross-chat context but never overrides newer repository facts.

## 3. Roles

- User: sends the matching numbered bridge command, makes real product decisions and runs Safari smoke.
- ChatGPT: loads live memory, freezes scope, writes inboxes and claims, controls STATE, independently verifies remote results, writes corrections and advances the plan.
- Codex: performs the complete automatic numbered-lane cycle from remote synchronization through primary and outbox publication.
- Safari: final authority for deployed runtime acceptance.

Codex never claims user acceptance. ChatGPT never treats Git publication as runtime PASS.

## 4. Exact numbered bridge loop

### ChatGPT side

1. Load live memory and current repository authority.
2. Freeze one exact task with exact baseline, read scope, write scope, checks, expected outbox and next action.
3. Publish inbox, claim and STATE.
4. Tell the user to send `мост 1`, `мост 2` or `мост 3` to the matching Codex thread.

### Codex side

On one numbered command, Codex automatically:

1. fetches remote main and mailbox;
2. reads current policy, STATE, inbox and claim;
3. resolves only the requested slot;
4. prepares clean task-owned worktrees from remote refs;
5. executes the exact current phase;
6. validates all required checks;
7. creates and pushes the authorized primary commit when needed;
8. creates and pushes the immutable outbox;
9. refetches both destinations and proves publication;
10. tells the user to return to ChatGPT with the same numbered command.

### ChatGPT verification side

On the same numbered command, ChatGPT:

1. reloads live memory and reports exact `MEMORY_REV`;
2. reads current main and mailbox STATE;
3. verifies only the requested slot;
4. verifies commit ancestry, exact paths, mirrors, behavior and checks independently;
5. accepts the result or writes one exact correction inbox;
6. automatically opens the next safe serialized task when no decision or Safari smoke is pending.

## 5. Commands

Active user commands:

- `мост 1`
- `мост 2`
- `мост 3`

For numbered bridge lanes, one `мост N` is the synchronization, execution, runtime-scope approval and publication command for the exact frozen current contract.

Separate `пул`, `пуш`, `CONTINUE`, `APPROVE` and generic continuation commands are not required in numbered bridge lanes.

`пул` and `пуш` remain available only for explicit non-bridge Git maintenance under `GIT_PULL.md` and `GIT_PUSH.md`.

Bare `мост`, `запуль` and `запушь` are inactive.

## 6. Slot state machine

Every slot is in exactly one phase:

1. `CLOSED`
2. `SCOPE_FREEZE`
3. `READY_FOR_CODEX`
4. `EXECUTE_AND_PUBLISH`
5. `OUTBOX_PUBLISHED_AWAITING_CHATGPT`
6. `CORRECTION_REQUIRED`
7. `READY_FOR_SAFARI`
8. `AWAITING_SAFARI`
9. `PASS_ACCEPTED`
10. `BLOCKED_EXTERNAL`

Allowed transitions:

- `CLOSED -> SCOPE_FREEZE`
- `SCOPE_FREEZE -> READY_FOR_CODEX`
- `READY_FOR_CODEX -> EXECUTE_AND_PUBLISH` on the matching numbered Codex command
- `EXECUTE_AND_PUBLISH -> OUTBOX_PUBLISHED_AWAITING_CHATGPT` after verified primary/outbox publication
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT -> PASS_ACCEPTED`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT -> CORRECTION_REQUIRED`
- `CORRECTION_REQUIRED -> EXECUTE_AND_PUBLISH` on the next matching numbered Codex command
- `PASS_ACCEPTED -> READY_FOR_SAFARI` when the wave is complete
- `READY_FOR_SAFARI -> AWAITING_SAFARI`
- `AWAITING_SAFARI -> PASS_ACCEPTED` on user runtime PASS
- `AWAITING_SAFARI -> CORRECTION_REQUIRED` on user runtime FAIL
- any active state -> `BLOCKED_EXTERNAL` only for a real external blocker
- completed work -> `CLOSED`

Historical Protocol 3.0 phase names remain valid in old artifacts. New and updated tasks use Protocol 3.1 phases.

## 7. Slot invariants

Every open slot has exactly:

- one slot number;
- one logical thread id;
- one lane id;
- one task id;
- one main baseline;
- one current baseline inbox;
- one immutable claim;
- one exact read scope;
- one exact write scope;
- one dependency set;
- one expected outbox path;
- one current phase;
- one exact next user action.

STATE and the current baseline inbox must agree.

## 8. Scope-freeze algorithm

Before opening a task, ChatGPT must:

1. load current Google Drive project memory and record `MEMORY_REV`;
2. read current process authority, `AGENTS.md`, `TASKS.md`, `PROJECT_MEMORY.md` and exact target files;
3. inspect similar accepted systems;
4. identify source/deployed mirrors;
5. classify runtime sensitivity and singleton ownership;
6. separate presentation from mechanics, economy, state and handlers;
7. choose serialization or safe read-only parallelism;
8. freeze exact allowed and forbidden paths;
9. define static, runtime and acceptance evidence;
10. publish inbox, claim and STATE.

If the next task is mechanically determined and safe, ChatGPT opens it automatically.

## 9. Model handling

Model choice must never add an extra interaction to the numbered bridge loop.

- ChatGPT may record a recommended cheapest reliable model in the inbox.
- Codex uses the active model selected in the client.
- If the active model cannot be externally verified, Codex reports `USER_SELECTED_UNVERIFIED` and continues.
- Codex does not stop for a 12-of-12 preflight.
- Model mismatch is reported but is not a blocker unless the inbox explicitly defines a real capability requirement that the active model cannot satisfy.

## 10. Clean remote-first execution

For every numbered Codex command:

1. verify repository identity;
2. run `git fetch origin main coordination/chatgpt-codex-bridge`;
3. read authority directly from remote refs;
4. record exact main and mailbox SHAs;
5. ignore stale local bridge files;
6. never execute from a dirty, ahead, behind or diverged primary checkout;
7. create a clean task-owned worktree from the exact authorized main baseline;
8. create a separate clean mailbox worktree from the latest mailbox head;
9. preserve unrelated local work byte-for-byte;
10. never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push.

A diverged local `main` is not a blocker and must not be repaired for task execution.

## 11. Execution invariants

Codex must:

1. verify baseline, claim, phase, scope and dependencies;
2. edit only authorized files;
3. keep source/deployed mirrors byte-identical when required;
4. change no mechanics, handler, state or economy unless explicitly authorized;
5. run every required syntax, static, semantic and mirror check;
6. stage only exact authorized paths;
7. create one task-specific primary commit when needed;
8. publish one immutable outbox;
9. report exactly one next action.

## 12. Automatic primary publication

When primary writes are authorized:

- the implementation commit must be a direct child of the exact authorized remote main baseline;
- the diff must contain only authorized paths;
- push must be fast-forward and non-force;
- after push, Codex refetches and proves `origin/main` equals the implementation commit.

If remote main moved before publication, return `BLOCKED_MAIN_BASELINE_MOVED`. Do not merge or rebase.

## 13. Automatic mailbox publication

For every claim or outbox:

1. fetch mailbox head;
2. prepare a clean task-owned mailbox worktree at that head;
3. write exactly one authorized mailbox path;
4. commit as a direct child of the recorded head;
5. prove the diff contains only that path;
6. push fast-forward without force;
7. refetch and prove the remote mailbox head equals the commit.

After a mailbox race, rebuild the exact payload as a new direct child of the latest head and retry up to three times.

## 14. Authentication failure

The exact automatic loop requires valid non-interactive GitHub write credentials in the Codex environment.

If publication fails solely because credentials are unavailable:

1. Codex may run the repository's configured non-interactive authentication repair once;
2. Codex must not ask the user to reveal a token;
3. if write access still fails, return `BLOCKED_PUSH_AUTH` with a complete recovery bundle.

The recovery bundle contains:

- repository and destination ref;
- pre-push remote SHA;
- local commit SHA and first parent when available;
- exact changed paths and commit message;
- complete validation results;
- runtime and Safari status;
- full UTF-8 content plus blob SHA for every changed text file;
- base64 plus blob SHA for every binary file;
- exact immutable mailbox payload;
- one next action: return to ChatGPT with the matching numbered command.

A SHA-only report is invalid. A local-only commit is not publication.

## 15. Correction loop

When ChatGPT rejects a result:

- it writes one exact correction inbox;
- unchanged scope remains in the same logical thread;
- the next matching `мост N` automatically fetches, applies the correction, validates, pushes primary if needed, pushes outbox and returns to ChatGPT;
- no repeated model preflight, confirmation or implementation of already accepted parts.

## 16. Acceptance tiers

Keep four independent tiers:

1. remote publication verification;
2. static implementation acceptance;
3. deployment readiness;
4. user-owned Safari runtime acceptance.

Git publication never equals Safari PASS.

## 17. Real blockers

Valid blockers include:

- wrong repository;
- unreadable remote policy, STATE or inbox;
- closed or unavailable slot;
- claim owned by another logical thread;
- main baseline moved;
- native permission refusal;
- repeated mailbox race;
- actual scope collision;
- unresolved product decision;
- missing required primary evidence;
- unavailable GitHub write credentials after one non-interactive repair attempt.

Not blockers:

- stale local policy or mailbox files;
- dirty or diverged primary checkout;
- unrelated local work;
- unavailable hidden model telemetry;
- inability to externally verify the active model.

## 18. Final next action

Every Codex result and ChatGPT verification provides exactly one next user action.

Do not offer competing paths or ask the user to repeat information already present in repository authority.
