# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 3.0
BRIDGE_PROTOCOL: 3.0
STATUS: ACTIVE

## 1. Purpose

This file is the canonical operating process for ChatGPT coordination, Codex execution, Git publication, mailbox recovery, independent verification, correction loops and Safari acceptance.

It exists to remove duplicated process rules, prevent repeated preflights, eliminate ambiguous next actions and make every task recoverable without force-push, destructive Git operations or user credential exposure.

## 2. Authority and precedence

For process mechanics, use this precedence:

1. current `origin/main:AGENTS.override.md`;
2. current `origin/main:ORCHESTRATION.md`;
3. current `origin/main:BRIDGE.md`;
4. current `origin/main:GIT_PULL.md` and `origin/main:GIT_PUSH.md`;
5. current mailbox `.ai-bridge/STATE.md`;
6. current baseline inbox named by STATE;
7. immutable claim;
8. original task inbox for unchanged atomic objective and evidence requirements;
9. historical inboxes and reports for audit only;
10. root `AGENTS.md` for all rules not explicitly replaced above.

Primary repository files remain authoritative for implementation state. The Google Drive project memory is authoritative for cross-chat context, but it never overrides newer repository facts.

Protocol 2.4 artifacts remain valid historical evidence. Every newly opened task uses Protocol 3.0.

## 3. Roles

- User: selects the Codex model, sends the confirmation token, runs Safari smoke and makes real product decisions.
- ChatGPT: loads live project memory, freezes scope, writes task contracts, controls mailbox STATE, verifies results independently, publishes recovery commits when needed and advances the serialized plan.
- Codex: reads remote authority, performs model preflight, executes one exact task, validates it, publishes the primary commit and immutable outbox.
- Safari: final authority for runtime acceptance on the deployed build.

Codex never claims user acceptance. ChatGPT never treats Git publication as runtime PASS.

## 4. User commands and where they belong

### ChatGPT

- `мост 1`, `мост 2`, `мост 3`: verify or advance only that slot.
- No extra `продолжаем` command is required for mechanical progression. After a successful closure, ChatGPT automatically freezes and opens the next safe task when no product decision is pending.
- When a real user decision is required, ChatGPT asks exactly one concrete decision question.

### Codex

- `мост 1`, `мост 2`, `мост 3`: enter or continue the exact assigned slot.
- `CONTINUE`: after model selection, authorize execution of the exact frozen bridge task in the same Codex thread.
- `пул`: remote-first fetch and safe fast-forward behavior from `GIT_PULL.md`.
- `пуш`: exact authorized publication behavior from `GIT_PUSH.md`.

Bare `мост`, `запуль` and `запушь` are inactive.

## 5. Confirmation rule

For numbered bridge tasks, the same-thread `CONTINUE` after the valid 12-of-12 model preflight is both:

- confirmation of the selected model for that thread; and
- explicit runtime-safety approval for the exact frozen file scope and task contract.

No second `APPROVE` round is required for a numbered bridge task.

For non-bridge runtime-sensitive work, the separate `APPROVE` protocol in `AGENTS.md` remains active.

A confirmation token is task-specific, thread-specific and scope-specific. Any scope expansion invalidates it and requires a new task.

## 6. Canonical slot state machine

Every slot is in exactly one phase:

1. `CLOSED`
2. `SCOPE_FREEZE`
3. `MODEL_PREFLIGHT_ONLY`
4. `AWAITING_USER_CONTINUE`
5. `EXECUTE_NOW`
6. `MAIN_PUBLISHED_AWAITING_OUTBOX`
7. `OUTBOX_PUBLISHED_AWAITING_CHATGPT`
8. `CORRECTION_REQUIRED`
9. `READY_FOR_SAFARI`
10. `AWAITING_SAFARI`
11. `PASS_ACCEPTED`
12. `BLOCKED_EXTERNAL`

### Allowed transitions

- `CLOSED -> SCOPE_FREEZE`
- `SCOPE_FREEZE -> MODEL_PREFLIGHT_ONLY`
- `MODEL_PREFLIGHT_ONLY -> AWAITING_USER_CONTINUE`
- `AWAITING_USER_CONTINUE -> EXECUTE_NOW`
- `EXECUTE_NOW -> MAIN_PUBLISHED_AWAITING_OUTBOX`
- `EXECUTE_NOW -> OUTBOX_PUBLISHED_AWAITING_CHATGPT` when main and outbox both publish successfully
- `MAIN_PUBLISHED_AWAITING_OUTBOX -> OUTBOX_PUBLISHED_AWAITING_CHATGPT`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT -> PASS_ACCEPTED`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT -> CORRECTION_REQUIRED`
- `CORRECTION_REQUIRED -> EXECUTE_NOW` for a same-scope correction
- `PASS_ACCEPTED -> READY_FOR_SAFARI` when the deployment wave is complete
- `READY_FOR_SAFARI -> AWAITING_SAFARI`
- `AWAITING_SAFARI -> PASS_ACCEPTED` on user runtime PASS
- `AWAITING_SAFARI -> CORRECTION_REQUIRED` on user runtime FAIL
- any active state -> `BLOCKED_EXTERNAL` only for a real external blocker
- completed work -> `CLOSED`

Any other transition is invalid and must be corrected by ChatGPT before execution continues.

## 7. Slot invariants

Every open slot has exactly:

- one slot number;
- one logical thread id;
- one lane id;
- one task id;
- one current main baseline;
- one current baseline inbox;
- one immutable claim;
- one exact read scope;
- one exact write scope;
- one dependency set;
- one expected outbox path;
- one current phase;
- one exact next user action.

No slot may silently inherit mutable fields from an older inbox. STATE and the current baseline inbox must agree.

## 8. Scope-freeze algorithm

Before opening a task, ChatGPT must:

1. load the current Google Drive project memory and record `MEMORY_REV`;
2. read current `AGENTS.override.md`, `ORCHESTRATION.md`, `AGENTS.md`, `TASKS.md`, `PROJECT_MEMORY.md` and exact target files;
3. inspect similar accepted systems;
4. identify every source and deployed mirror;
5. classify runtime sensitivity;
6. identify singleton ownership such as dev-checks, boot, exports, globals and aggregate smoke;
7. separate presentation changes from mechanics, economy, state and handlers;
8. identify dependencies and stable-read requirements;
9. choose serialization or safe read-only parallelism;
10. freeze exact allowed paths and exact forbidden areas;
11. define static checks, runtime checks and acceptance tier;
12. publish the task inbox, claim and STATE before asking the user to enter Codex.

If the next task is mechanically determined and safe, ChatGPT opens it automatically after the previous task closes. The user is not asked for a generic continuation command.

## 9. Model preflight

Codex evaluates all 12 available model/reasoning pairs:

- GPT-5.4-Mini: Light, Medium, High, Extra High
- GPT-5.4: Light, Medium, High, Extra High
- GPT-5.5: Light, Medium, High, Extra High

The response is compact and contains:

- task identity;
- claim identity;
- skill source;
- task and runtime classification;
- parallel collision verdict;
- `evaluated pair count: 12/12`;
- recommended pair;
- why the next cheaper pair is insufficient;
- why the next stronger pair is unnecessary;
- exact scopes, dependencies and blockers;
- active model as `USER_SELECTED_UNVERIFIED` unless externally proven.

It ends with exactly one fenced `CONTINUE` block and no text after it.

A repeated preflight after the user already sent `CONTINUE` is invalid. ChatGPT moves the slot to `EXECUTE_NOW`; Codex must execute without another preflight or confirmation.

## 10. Execution invariants

After `CONTINUE`, Codex must refetch main and mailbox and re-read the current contract.

Codex then:

1. verifies main baseline, mailbox head, claim, phase, scope and dependencies;
2. edits only authorized files;
3. preserves unrelated work;
4. keeps source and deployed mirrors in one commit and byte-identical when required;
5. changes no handler, state, economy or mechanic unless explicitly authorized;
6. runs every required syntax, static, semantic and mirror check;
7. publishes one direct-child primary commit when the task writes main;
8. publishes one immutable outbox on the mailbox branch;
9. reports only one exact next action: return to ChatGPT and write the same numbered bridge command.

## 11. Publication and ancestry rules

### Primary repository

- The implementation commit must be based on the exact authorized main baseline.
- The diff must contain only authorized paths.
- Direct-main delivery must be explicit in the task.
- No force-push, amend, rebase, reset, stash, clean or unrelated merge.
- After push, refetch and prove `origin/main` equals the implementation commit.

### Mailbox

- The claim or outbox commit must be a direct child of the freshly fetched mailbox head.
- It changes exactly one authorized mailbox path.
- It is pushed fast-forward to `coordination/chatgpt-codex-bridge`.
- After push, refetch and prove the remote mailbox head equals the new commit.
- A local-only mailbox commit is evidence, not publication.

## 12. Mandatory recovery bundle

When any Git publication fails because credentials are unavailable, Codex returns `BLOCKED_PUSH_AUTH` and a complete recovery bundle.

The bundle must contain:

- repository and destination ref;
- pre-push remote SHA;
- local commit SHA and first parent, when a commit exists;
- exact changed paths;
- intended commit message;
- complete validation results;
- runtime and Safari status;
- for every text file: exact full UTF-8 content and blob SHA;
- for every binary file: base64 payload and blob SHA;
- for a mailbox write: exact mailbox path and complete immutable payload;
- expected post-publication SHA when known;
- exact next action: return to ChatGPT with the matching numbered bridge command.

A SHA-only report is insufficient. A local-only commit is never treated as remote publication.

## 13. ChatGPT publication recovery algorithm

On `BLOCKED_PUSH_AUTH`, ChatGPT performs these steps in order:

1. reload live memory and current repository authority;
2. fetch the reported commit SHA;
3. if the commit object is remotely readable, verify parent, exact diff, checks and destination;
4. if it is a valid direct child of the current destination head, fast-forward the exact ref to that commit;
5. otherwise reconstruct the exact commit from the recovery bundle using Git blobs, tree, commit and ref update APIs;
6. refetch and verify the destination ref;
7. independently validate the published files;
8. publish or verify the outbox;
9. close, correct or advance the slot.

If the recovery bundle is incomplete, ChatGPT publishes one recovery-only inbox. Codex must return only the missing payload. It must not rerun preflight, implementation or tests.

## 14. Race recovery

### Mailbox advanced

Codex retries up to three times by rebuilding the exact immutable payload as a new direct child of the latest mailbox head. It never amends, rebases, cherry-picks or force-pushes the stale commit.

### Main advanced before implementation push

The task stops with `BLOCKED_MAIN_BASELINE_MOVED`. ChatGPT reviews the new main diff and either:

- proves it is unrelated and republishes a new baseline inbox; or
- serializes the conflicting work; or
- cancels the stale task.

The old implementation commit is never force-pushed or silently rebased.

### Main advanced after implementation but before ChatGPT verification

ChatGPT verifies whether the implementation commit is an ancestor of current main and whether later commits touch the task ownership group. If later commits are unrelated, static acceptance may continue. If they overlap, the slot moves to `CORRECTION_REQUIRED` or `BLOCKED_EXTERNAL`.

## 15. Verification tiers

### Tier A: publication verification

Proves remote commit, ancestry, paths and destination ref.

### Tier B: static implementation acceptance

Proves exact scope, syntax, semantic contract, mirror parity, unchanged protected behavior and empty failure arrays.

### Tier C: deployment readiness

Proves served wiring, cache-bust, boot reachability and smoke visibility when required.

### Tier D: Safari runtime acceptance

Exists only after the user runs the exact smoke on the deployed build and supplies the result.

No lower tier may claim a higher tier.

## 16. Correction protocol

A correction stays in the same logical thread when:

- task objective is unchanged;
- write scope does not expand;
- baseline is the immediately preceding unaccepted implementation;
- no new product decision is needed.

No new model preflight or `CONTINUE` is required for a same-scope correction unless ChatGPT explicitly changes scope or task objective.

A correction inbox must list exact defects, exact required changes, forbidden changes, new baseline and expected correction outbox.

## 17. Failure and recovery matrix

| Condition | Required result | Recovery |
|---|---|---|
| Wrong repository | `BLOCKED_WRONG_REPOSITORY` | Stop. No writes. |
| Remote policy or STATE unreadable | `BLOCKED_REMOTE_SOURCE_UNAVAILABLE` | Stop. Retry only after access returns. |
| Slot closed or unavailable | `BRIDGE_SLOT_UNAVAILABLE` | Do not select another slot. |
| Claim owned by another logical thread | `BRIDGE_SLOT_ALREADY_CLAIMED` | Return to owning thread. |
| Main baseline moved | `BLOCKED_MAIN_BASELINE_MOVED` | ChatGPT reviews and republishes baseline or cancels. |
| Mailbox race | retry up to 3 | Rebuild direct-child commit each time. |
| Git credentials unavailable | `BLOCKED_PUSH_AUTH` | Return complete recovery bundle. |
| Native permission denied | `BLOCKED_NATIVE_PERMISSION` | User handles the permission dialog. |
| Scope collision | `BLOCKED_PARALLEL_SCOPE_COLLISION` | Serialize ownership groups. |
| Unauthorized path changed | `FAIL_FORBIDDEN_PATH` | Correction required. |
| Mirror mismatch | `FAIL_MIRROR_PARITY` | Correction required before acceptance. |
| Syntax or static check fails | `FAIL_STATIC_VALIDATION` | Correction required. |
| Mechanics or economy drift | `FAIL_CANON_DRIFT` | Correction required or user decision. |
| Outbox missing after main publish | `MAIN_PUBLISHED_AWAITING_OUTBOX` | Publish outbox only. No reimplementation. |
| Repeated preflight after CONTINUE | `EXECUTE_NOW` | Execute without another preflight. |
| Missing recovery payload | `RECOVERY_PAYLOAD_ONLY` | Return only missing payload. |
| Safari smoke fails | `CORRECTION_REQUIRED` | Preserve evidence and open exact runtime correction. |
| Safari not run | `AWAITING_SAFARI` | Do not claim runtime PASS. |
| User decision required | `BLOCKED_USER_DECISION` | Ask one concrete decision question. |
| Chat context overloaded | `CHAT_HANDOFF_REQUIRED` | Update live memory and provide exact new-chat handoff. |

## 18. Independent ChatGPT verification checklist

For every returned slot, ChatGPT checks:

1. live `MEMORY_REV`;
2. current main and mailbox heads;
3. STATE, current baseline inbox, claim and outbox;
4. implementation ancestry;
5. exact changed paths;
6. source/mirror blobs;
7. required copy or behavior matrix;
8. protected behavior and forbidden changes;
9. commands and test results;
10. empty failure arrays;
11. mailbox ancestry and one-path diff;
12. acceptance tier;
13. exact next task or exact correction.

ChatGPT never accepts solely from Codex's prose report.

## 19. Automatic progression

After `PASS_ACCEPTED`, ChatGPT automatically:

1. closes the claim;
2. updates STATE;
3. records the closure;
4. updates live project memory;
5. inspects the next serialized block;
6. freezes and opens the next task when safe;
7. tells the user the single next Codex command.

ChatGPT pauses only for:

- a genuine product decision;
- unresolved scope collision;
- missing primary evidence;
- external access or permission failure;
- required Safari smoke.

## 20. User-facing response discipline

Every coordinator response contains:

- exact `MEMORY_REV`;
- current verdict;
- what was independently verified;
- one exact next action;
- accepted progress and working readiness;
- active block;
- Safari status when relevant.

Do not offer multiple competing next actions. Do not ask the user to paste a report when the remote outbox is available. Do not ask the user to repeat information already present in STATE, memory or repository evidence.

## 21. Progress accounting

- Serialized subunits do not automatically change the fixed plan score.
- Progress changes only at milestones defined by the accepted stage plan.
- Working readiness may change independently from accepted progress.
- Every score change must name the accepted evidence that caused it.

## 22. Process self-check before every new task

ChatGPT must answer all of these internally before publishing an inbox:

- Is the live memory loaded?
- Is the current main baseline verified?
- Is the mailbox head verified?
- Is the slot open and unclaimed?
- Is the task atomic?
- Are mirrors and singleton files included in one ownership group?
- Is runtime sensitivity classified?
- Are dependencies settled?
- Is the model preflight required?
- Is the confirmation rule unambiguous?
- Is the auth fallback complete?
- Is the exact next user action singular?

If any answer is no, the task remains in `SCOPE_FREEZE` and no Codex execution is opened.
