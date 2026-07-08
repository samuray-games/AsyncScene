# Universal Remote-First Safe Pull Protocol

PROTOCOL_VERSION: GIT_PULL_3_0
COMMAND_ALIAS: `пул`
LEGACY_ALIASES: `запуль` - INACTIVE
ORCHESTRATION: `ORCHESTRATION.md`

## 1. Purpose

Refresh authoritative remote refs and fast-forward only an exact authorized clean branch when safe.

`пул` never merges, rebases, stashes, resets, cleans, commits, pushes, switches branches, discards work or invents a target.

## 2. Trigger

When the user's trimmed message is exactly `пул`, follow this file before generic interpretation.

## 3. Remote-first invariant

The first repository mutation is always a fetch. Dirty files, detached HEAD, stale local policy and stale worktrees cannot block remote fetch.

1. Resolve repository root.
2. Verify `origin` belongs to `samuray-games/AsyncScene`.
3. Fetch:

```bash
git fetch origin main coordination/chatgpt-codex-bridge
```

4. Record exact SHAs for `origin/main` and `origin/coordination/chatgpt-codex-bridge`.
5. Read current remote policy:

```bash
git show origin/main:AGENTS.override.md
git show origin/main:ORCHESTRATION.md
git show origin/main:AGENTS.md
git show origin/main:GIT_PULL.md
```

In bridge context also read:

```bash
git show origin/main:BRIDGE.md
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

6. Only then inspect branch, HEAD, upstream, worktrees and worktree cleanliness.

## 4. Target resolution

Resolve synchronization context in this order:

1. current numbered bridge lane or mailbox task from remote STATE;
2. current branch and exact configured upstream;
3. direct user instruction naming an exact branch or ref;
4. detached HEAD or branch without upstream: fetch-only.

Never guess from directory name, stale local files or historical task context.

## 5. Fast-forward decision

A local fast-forward is allowed only when:

- current branch has an exact authorized upstream;
- worktree is clean;
- target branch is not owned by another worktree;
- update is fast-forward only;
- current task does not require fetch-only behavior.

When all conditions hold, use `git pull --ff-only` for that exact branch.

Otherwise preserve the checkout byte-for-byte and complete successfully as fetch-only.

A dirty worktree is not a fetch failure and must return `PASS_FETCHED_PULL_SKIPPED_DIRTY`.

## 6. Bridge behavior

For a numbered bridge lane:

- refresh main and mailbox refs;
- use remote STATE and current baseline inbox;
- never switch the primary worktree to the mailbox branch;
- ignore stale local bridge files;
- preserve unrelated dirty files and detached evidence worktrees;
- treat fetch-only as complete success when checkout movement is unnecessary or unsafe.

## 7. Forbidden actions

- no stash;
- no reset;
- no clean;
- no merge;
- no rebase;
- no force update;
- no automatic conflict resolution;
- no branch switch;
- no commit;
- no push;
- no product, documentation, lock or mailbox edit.

## 8. Result statuses

- `PASS_PULL_SYNCED`
- `PASS_FETCHED`
- `PASS_FETCHED_PULL_SKIPPED_DIRTY`
- `PASS_FETCHED_DETACHED`
- `BLOCKED_NON_FAST_FORWARD_PULL`
- `BLOCKED_WRONG_REPOSITORY`
- `BLOCKED_REMOTE_SOURCE_UNAVAILABLE`
- `BLOCKED_NATIVE_PERMISSION`

`BLOCKED_DIRTY_WORKTREE` is not valid for `пул` when fetch succeeded.

## 9. Final report

Return only:

1. status;
2. repository root;
3. synchronization context;
4. previous branch and HEAD;
5. final branch and HEAD;
6. fetched main SHA;
7. fetched mailbox SHA;
8. worktree cleanliness;
9. fast-forward result or exact fetch-only reason;
10. changed files: `None`;
11. runtime gate: `N/A - Git synchronization only`;
12. Safari status: `N/A - Git synchronization only`;
13. one exact next action.

For dirty-worktree fetch-only success, do not tell the user to stash, reset, discard or repair files. State that remote refs are current and remote-first task discovery may continue while the checkout remains preserved.
