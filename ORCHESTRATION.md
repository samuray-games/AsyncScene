# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 3.1
BRIDGE_PROTOCOL: 3.1
ROOT_CAUSE_SYNC: REQUIRED
STATUS: ACTIVE

## 1. Purpose

This file defines the canonical loop for ChatGPT coordination, Codex execution, Git publication, independent verification, correction cycles, root-cause synchronization and Safari acceptance.

Canonical cycle:

`ChatGPT inbox -> user мост N to Codex -> Codex fetch/execute/push/outbox -> user мост N to ChatGPT -> ChatGPT verify/root-sync -> next inbox`

## 2. Authority and precedence

Use this precedence:

1. current `origin/main:AGENTS.override.md`;
2. current `origin/main:PROCESS_ROOT_SYNC.md`;
3. current `origin/main:ORCHESTRATION.md`;
4. current `origin/main:BRIDGE.md`;
5. current `origin/main:GIT_PULL.md` and `origin/main:GIT_PUSH.md`;
6. current mailbox `.ai-bridge/PUBLICATION_POLICY.md`;
7. current mailbox `.ai-bridge/STATE.md`;
8. current baseline inbox named by STATE;
9. current immutable claim;
10. original task inbox for unchanged objective and evidence requirements;
11. historical artifacts for audit only;
12. root `AGENTS.md` for rules not replaced above.

Repository primary files are authoritative for implementation state. Google Drive project memory is authoritative for cross-chat context but never overrides newer repository facts.

## 3. Roles

- User sends the matching numbered bridge command, makes product decisions and runs Safari smoke.
- ChatGPT loads live memory, freezes scope, writes inboxes and claims, owns STATE, independently verifies remote results, writes corrections, performs root-cause synchronization and advances the plan.
- Codex performs the full numbered-lane cycle from remote synchronization through primary and outbox publication.
- Safari is final authority for deployed runtime acceptance.

Codex never claims user acceptance. ChatGPT never treats Git publication as runtime PASS.

## 4. Exact numbered bridge loop

### ChatGPT side

1. Load live memory and report exact `MEMORY_REV`.
2. Read current process authority and repository state.
3. Freeze one exact task with baseline, read scope, write scope, checks, expected outbox and next action.
4. Publish inbox, claim and STATE.
5. Tell the user to send the matching `мост N`.

### Codex side

On one numbered command Codex automatically:

1. fetches remote main and mailbox;
2. reads current policy, STATE, inbox and claim;
3. resolves only the requested slot;
4. prepares clean task-owned worktrees;
5. executes the exact current phase;
6. validates every required check;
7. creates and pushes the authorized primary commit when needed;
8. refetches and verifies remote main;
9. derives exact SHA and parent from the fetched remote commit;
10. creates and pushes the immutable outbox;
11. refetches and verifies remote mailbox;
12. tells the user to return to ChatGPT with the same numbered command.

### ChatGPT verification side

On the same numbered command ChatGPT:

1. reloads live memory and reports exact `MEMORY_REV`;
2. reads current main, mailbox policy and STATE;
3. verifies only the requested slot;
4. verifies ancestry, exact paths, mirrors, behavior, tests and remote evidence independently;
5. rejects any outbox whose reported primary SHA differs from fetched `origin/main`;
6. accepts the result or writes one exact correction inbox;
7. classifies every discovered defect as task-specific or systemic;
8. for a systemic defect, performs `PROCESS_ROOT_SYNC.md` before returning the next action;
9. automatically opens the next safe serialized task when no decision or Safari smoke is pending.

## 5. Commands

Active commands:

- `мост 1`
- `мост 2`
- `мост 3`

A numbered command is synchronization, model-use acknowledgement, runtime-scope approval, execution and publication for the exact frozen contract.

Separate `пул`, `пуш`, `CONTINUE`, `APPROVE` and generic continuation commands are not part of the numbered loop.

Standalone `пул` and `пуш` remain only for explicit non-bridge maintenance.

Bare `мост`, `запуль` and `запушь` are inactive.

## 6. Slot state machine

Canonical phases:

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
- `READY_FOR_CODEX -> EXECUTE_AND_PUBLISH`
- `EXECUTE_AND_PUBLISH -> OUTBOX_PUBLISHED_AWAITING_CHATGPT`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT -> PASS_ACCEPTED`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT -> CORRECTION_REQUIRED`
- `CORRECTION_REQUIRED -> EXECUTE_AND_PUBLISH`
- `PASS_ACCEPTED -> READY_FOR_SAFARI`
- `READY_FOR_SAFARI -> AWAITING_SAFARI`
- `AWAITING_SAFARI -> PASS_ACCEPTED`
- `AWAITING_SAFARI -> CORRECTION_REQUIRED`
- any active state -> `BLOCKED_EXTERNAL` only for a real external blocker
- completed work -> `CLOSED`

## 7. Slot invariants

Every open slot has exactly one:

- slot number;
- logical thread id;
- lane id;
- task id;
- main baseline;
- current baseline inbox;
- immutable claim;
- exact read scope;
- exact write scope;
- dependency set;
- expected outbox path;
- current phase;
- exact next user action.

STATE, current inbox and current claim must agree.

## 8. Scope-freeze algorithm

Before opening a task ChatGPT must:

1. load current Google Drive project memory;
2. read current process authority, `AGENTS.md`, `TASKS.md`, `PROJECT_MEMORY.md` and exact target files;
3. inspect similar accepted systems;
4. identify mirrors;
5. classify runtime sensitivity and singleton ownership;
6. separate presentation from mechanics, economy, state and handlers;
7. choose serialization or safe read-only parallelism;
8. freeze exact allowed and forbidden paths;
9. define static, runtime and acceptance evidence;
10. publish inbox, claim and STATE.

If the next task is mechanically determined and safe, ChatGPT opens it automatically.

## 9. Model handling

Model choice never adds an extra interaction.

- ChatGPT may record a recommended cheapest reliable model.
- Codex uses the active client model.
- Unverifiable telemetry is reported as `USER_SELECTED_UNVERIFIED`.
- Codex does not stop for preflight.
- Model mismatch is not a blocker unless the task requires unavailable capability.

## 10. Clean remote-first execution

Codex must:

1. verify repository identity;
2. fetch main and mailbox;
3. read authority from remote refs;
4. record exact main and mailbox SHAs;
5. ignore stale local files;
6. use a clean task-owned worktree from the exact authorized main baseline;
7. use a separate clean mailbox worktree;
8. preserve unrelated local work;
9. never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push.

Local main divergence is not a blocker.

## 11. Execution invariants

Codex must:

1. verify baseline, claim, phase, scope and dependencies;
2. edit only authorized files;
3. keep required mirrors byte-identical;
4. avoid mechanics, handler, state or economy changes unless authorized;
5. run every required syntax, static, semantic, negative-control and mirror check;
6. stage only exact paths;
7. create one task-specific primary commit when needed;
8. publish one immutable outbox;
9. report exactly one next action.

## 12. Primary publication

When primary writes are authorized:

- the commit must be a direct child of the exact authorized baseline;
- the diff must contain only authorized paths;
- push must be fast-forward and non-force;
- Codex must refetch and prove `origin/main` equals the commit;
- reported SHA and parent must be machine-derived from the fetched remote commit.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. Do not rebuild, merge or rebase under the old contract.

## 13. Mailbox publication

For every claim or outbox:

1. fetch mailbox head;
2. use a clean mailbox worktree;
3. write exactly one authorized mailbox path unless ChatGPT publishes one atomic synchronization set;
4. commit as a direct child of the recorded head;
5. prove the diff contains only authorized mailbox paths;
6. push fast-forward;
7. refetch and verify remote mailbox.

The outbox must contain the exact fetched primary SHA and actual parent. Manual SHA transcription is forbidden.

After a mailbox race, rebuild the exact payload from the latest head and retry up to three times.

## 14. Authentication failure

Codex may run one configured non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with a complete recovery bundle containing:

- repository and destination ref;
- pre-push remote SHA;
- local commit SHA and actual first parent;
- exact paths and commit message;
- validation results;
- runtime and Safari status;
- full file bodies or binary data;
- exact immutable mailbox payload;
- one next action.

A SHA-only report is invalid. Never ask the user for credentials.

## 15. Correction loop

When ChatGPT rejects a result:

- write one exact correction inbox;
- keep unchanged product scope in the same logical thread;
- use the next matching `мост N`;
- do not repeat model preflight or already accepted implementation;
- classify the defect as task-specific or systemic;
- if systemic, update all affected root authorities and validators before the next user action;
- if root hardening moves main, publish a new current inbox, replacement immutable claim and STATE with the new exact baseline.

## 16. Root-cause synchronization

`PROCESS_ROOT_SYNC.md` is mandatory for reusable process defects.

Task correction alone is insufficient when the defect could recur in another lane.

Root synchronization must finish before project execution resumes.

## 17. Acceptance tiers

Keep four independent tiers:

1. remote publication verification;
2. static implementation acceptance;
3. deployment readiness;
4. user-owned Safari runtime acceptance.

Git publication never equals Safari PASS.

## 18. Real blockers

Valid blockers:

- wrong repository;
- unreadable remote policy, STATE or inbox;
- closed slot;
- claim owned by another thread;
- main baseline moved;
- native permission refusal;
- repeated mailbox race;
- actual scope collision;
- unresolved product decision;
- missing primary evidence;
- unavailable write credentials after one repair attempt.

Not blockers:

- stale local files;
- dirty or diverged local main;
- unrelated local work;
- unavailable hidden model telemetry.

## 19. Final next action

Every Codex result and ChatGPT verification provides exactly one next user action.

Do not offer competing paths or ask the user to repeat information already present in repository authority.
