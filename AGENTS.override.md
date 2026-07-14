# Asynchronia Bridge v4 Hard-Isolation Override

OVERRIDE_VERSION: BRIDGE_V4_HARD_ISOLATION_WORKTREE_2
BRIDGE_PROTOCOL: 4.0
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
PLUGIN_AUTO_ROUTING: REQUIRED
MODEL_PREFLIGHT_PAUSE: REQUIRED
CROSS_SLOT_BLINDNESS: REQUIRED
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
WORKTREE_LIFECYCLE: REQUIRED
WORKTREE_DISCLOSURE: IMMEDIATE_AND_CLIENT_INDEPENDENT
MOBILE_BRANCH_RECOVERY: REQUIRED

Read root `AGENTS.md` fully. Every rule remains binding except the bridge, publication, state, branch and memory clauses explicitly replaced below.

## 1. Authority order

1. explicit current user instruction;
2. `AGENTS.override.md`;
3. `AGENTS.md` non-replaced repository policy;
4. `PROCESS_ROOT_SYNC.md`;
5. `ORCHESTRATION.md`;
6. `BRIDGE.md`;
7. slot-local mailbox `.ai-bridge/PUBLICATION_POLICY.md`;
8. slot-local mailbox `.ai-bridge/STATE.md`;
9. current slot-local inbox and claim;
10. historical artifacts for audit only.

Repository files are authoritative for implementation state. Google Drive memory is authoritative for cross-chat context but never overrides newer repository facts.

## 2. Fixed command routing

The exact trimmed commands map one-to-one:

- `мост 1` -> `origin/coordination/chatgpt-codex-bridge-1`
- `мост 2` -> `origin/coordination/chatgpt-codex-bridge-2`
- `мост 3` -> `origin/coordination/chatgpt-codex-bridge-3`

For `мост N`, Codex fetches `origin/main` and only mailbox ref N. Normal execution must not fetch, inspect, adopt, close, rotate or rewrite either other numbered mailbox ref.

A cross-slot audit is legal only when an explicit integration or audit task names every inspected slot. Such an audit is read-only unless separate mutation authority is provided.

## 3. Per-slot state contract

Each numbered mailbox branch owns one `.ai-bridge/STATE.md` containing data for that slot only.

Forbidden shared fields include:

- `OPEN_SLOT_COUNT`;
- `PRIMARY_ACTIVE_SLOT`;
- any current thread, generation, claim, task, epoch, nonce, inbox, outbox, receipt or next action for another slot.

State N may name only Slot N identity, task branch, current task metadata, slot-local artifacts, preflight state, continuation state, acceptance state and next action.

Updating Slot N must preserve byte-identical files and refs owned by Slot M.

## 4. Task branches

Every active lane uses a dedicated implementation branch:

`bridge/<slot>/<thread-id>`

Codex publishes task implementation only to that branch. Direct task-lane pushes to `main` are forbidden.

Movement of `main` does not invalidate an executing task branch or its mailbox evidence. It may require a later integration replay after exact conflict and dependency checks.

## 5. Slot-local publication

Inbox, claim, outbox and receipt publication for Slot N occurs only on mailbox ref N.

Every publication must:

1. freshly fetch mailbox ref N;
2. use its fetched head as parent;
3. change only the exact authorized slot-local artifact path;
4. push fast-forward without force;
5. refetch mailbox ref N and prove the remote head;
6. prove mailbox refs M were not moved by the operation.

A Slot N artifact published on mailbox ref M is `FAIL_CROSS_SLOT_PUBLICATION`.

## 6. Execution and integration

Collision-free task branches may execute concurrently.

Integration into `main` is a separate serialized phase. The integration owner must:

- fetch current `main`;
- verify the accepted task branch and slot-local evidence;
- compare exact changed paths and stable-read dependencies;
- reject true overlap or stale semantic dependencies;
- merge or replay one accepted lane at a time;
- update shared `TASKS.md` and `PROJECT_MEMORY.md` through one designated owner.

Main movement can block integration, but cannot reset, rotate or corrupt another bridge.

## 7. Independent repository memory

Current bridge snapshots live in:

- `.ai-memory/bridges/1.md`
- `.ai-memory/bridges/2.md`
- `.ai-memory/bridges/3.md`

A global memory index may link to them but must not replace one slot snapshot when another slot changes.

Updating Slot N memory must preserve byte-identical Slot M memory files.

## 8. Fresh execution and preflight

Every exact `мост N` is a fresh attempt for the slot-local execution epoch currently named by mailbox ref N.

Before implementation Codex must:

1. read root authority;
2. fetch `origin/main` and only mailbox ref N;
3. read slot-local STATE, inbox and claim;
4. invoke the Asynchronia plugin `task-router`, `scope-isolation-check` and `model-selector`;
5. perform no mutation during preflight;
6. pause with `WAITING_FOR_MODEL_SELECTION` and one standalone fenced `CONTINUE` block;
7. after exact same-thread `CONTINUE`, revalidate slot identity, mailbox head, task branch and scope.

Another slot moving must not invalidate this continuation authorization.

## 9. Completion modes

### Task-branch delta

When authorized files change, Codex commits and pushes to the exact task branch, publishes the slot-local outbox, and returns `PASS_TASK_BRANCH_PUSHED` with fetched SHAs, exact paths and validations.

### Verified no delta

Allowed only when current slot authority says `ALLOW_VERIFIED_NO_DELTA: true`. Empty commits are forbidden. The slot-local outbox must prove unchanged authorized scope and all required checks, then Codex returns `PASS_VERIFIED_NO_DELTA`.

A historical outbox cannot satisfy a new slot-local execution epoch.

## 10. Migration and legacy branch

The old `coordination/chatgpt-codex-bridge` ref is legacy read-only after all three numbered refs pass readback verification.

Migration must not activate work by rewriting the old shared STATE. Existing active evidence is copied to the appropriate numbered ref and verified before cutover.

## 11. Mandatory validator

Before accepting any bridge publication, run:

`python3 tools/bridge_v4_contract.py validate-command --slot N --mailbox-ref coordination/chatgpt-codex-bridge-N --task-branch bridge/N/<thread-id>`

Before accepting the protocol migration, run:

`python3 -m unittest tools.test_bridge_v4_contract`

Any cross-slot read, shared activation pointer, wrong mailbox ref, wrong task-branch prefix or direct task publication to main fails closed.

## 12. Runtime and acceptance

Bridge infrastructure changes do not require Safari smoke. Safari status is `N/A` unless game/runtime code changes.

Codex prose alone is never acceptance evidence.

## 13. Temporary worktree lifecycle and universal branch-path disclosure

This section is mandatory for every Codex-created or Codex-discovered Git worktree, including task, cleanup, mailbox, integration, audit and recovery worktrees. It applies regardless of whether the user is currently using Mac, iPhone, web, CLI or any other client. Codex must never assume it knows which client the user is using.

### 13.1 Creation restraint and immediate disclosure

- Do not create a temporary worktree when the task can be completed safely in the canonical checkout without violating isolation or publication rules.
- When isolation requires a worktree, create it only for one exact branch and one exact task.
- Immediately after creating a worktree, before continuing substantive task execution, send the user a visible progress message containing the exact branch name and exact absolute worktree path.
- The immediate disclosure must use these exact fields: `worktree branch:` and `worktree path:`.
- Do not postpone this disclosure until the terminal report.
- Do not condition this disclosure on knowing or guessing the user's current device or client.
- If a pre-existing worktree is discovered during branch occupancy checks, immediately send the user the same exact branch and path fields before attempting recovery.
- Paths under `/private/tmp`, `/tmp` or another disposable directory are temporary infrastructure. They must still be disclosed immediately, even when automatic cleanup is expected.

Failure to disclose a created or discovered worktree immediately is `FAIL_WORKTREE_DISCLOSURE_DELAYED`.

### 13.2 Mandatory branch occupancy preflight

Before every branch switch, checkout, branch reuse or worktree creation, Codex must run or obtain equivalent evidence from:

`git -C "/Users/User/Documents/created apps/AsyncScene" worktree list --porcelain`

If the requested branch is already attached to another worktree, Codex must not return a generic switch failure. It must immediately disclose `worktree branch:` and `worktree path:`, then identify and report all of the following in the same response:

- `BLOCKED_BRANCH_ALREADY_CHECKED_OUT`;
- exact branch name;
- exact absolute occupying worktree path;
- whether that worktree is temporary or canonical;
- whether it is clean, dirty, missing or locked;
- the exact automatic recovery action attempted or the exact reason recovery was unsafe.

### 13.3 Automatic cleanup

At successful completion, cancellation, supersession or safe abandonment of a temporary worktree, Codex must:

1. inspect its status and branch identity;
2. preserve or publish every authorized task-owned commit;
3. refuse destructive cleanup when uncommitted or untracked task-owned data would be lost;
4. remove the temporary worktree when clean and no longer required;
5. run `git -C "/Users/User/Documents/created apps/AsyncScene" worktree prune`;
6. verify that the removed path and branch occupancy no longer appear in `git worktree list --porcelain`.

A task is not complete while its disposable worktree remains attached without an explicit active owner and reason. Silent orphaned temporary worktrees are `FAIL_ORPHANED_WORKTREE`.

### 13.4 Automatic recovery before asking the user

When a branch switch is blocked by a temporary worktree, Codex must first inspect that worktree automatically.

- If it is clean, unlocked and no active task still owns it, remove it, prune worktrees, verify release, and retry the requested switch in the canonical checkout.
- If its branch is fully published and only disposable files remain, remove it only when the files are proven non-task-owned.
- If it is dirty, locked, missing, actively owned or contains unpublished commits, do not force-remove it. Return the full diagnostic contract from section 13.2.
- Never require the user to navigate to a `/private/tmp/...` worktree merely to continue ordinary work.
- Never use `git worktree remove --force`, `git clean`, `git reset --hard` or deletion of the directory unless an explicit current user instruction authorizes that exact destructive action after the dirty state is shown.

### 13.5 Restricted-client recovery

The canonical checkout is:

`/Users/User/Documents/created apps/AsyncScene`

Codex must not rely on device detection. It must treat every workflow as potentially continuing from a client that cannot select an arbitrary local folder.

Before reporting success, Codex must leave the requested branch available from the canonical checkout whenever that can be done safely.

If that cannot be done safely, success is forbidden. The response must return `BLOCKED_CANONICAL_BRANCH_UNAVAILABLE` together with the exact branch, exact occupying path and exact unresolved state.

A temporary worktree path is always required diagnostic information, but it must not be the only possible continuation path.

### 13.6 Mandatory terminal report

Every Codex response that creates, uses, finds, removes or is blocked by a worktree must include:

- `worktree branch`;
- `worktree path`;
- `worktree state`;
- `cleanup result`;
- `canonical checkout branch availability`;
- `exact next user action`.

Use `N/A` only with a concrete reason. Omitting a known temporary path or branch is `FAIL_WORKTREE_DIAGNOSTIC_OMITTED`.