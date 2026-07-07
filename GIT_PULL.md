# Universal remote-first safe pull protocol

PROTOCOL_VERSION: GIT_PULL_2_6_REMOTE_FIRST_BOOTSTRAP
COMMAND_ALIAS: `пул`
LEGACY_ALIASES: `запуль` - INACTIVE

## Non-negotiable bootstrap invariant

The first repository mutation attempted by `пул` is always a remote fetch. Local `AGENTS.md`, `AGENTS.override.md`, `BRIDGE.md`, `GIT_PULL.md`, Git status, dirty files, detached HEAD, branch ownership and stale local instructions must never be evaluated as blockers before that fetch.

A dirty worktree cannot block `git fetch` because fetch updates remote refs only and does not modify tracked worktree files.

`BLOCKED_DIRTY_WORKTREE` is not a valid result for `пул`.

## Purpose

Safely refresh authoritative remote refs and, only when unambiguous and safe, fast-forward the currently authorized local branch. The command works on normal task branches, `main`, numbered bridge threads, mailbox worktrees and detached evidence worktrees.

`пул` never invents a target and never merges, rebases, stashes, resets, cleans, commits, pushes, switches branches or discards local work.

## Trigger

When the user's trimmed message is exactly `пул`, execute this protocol before generic interpretation.

The former command `запуль` is inactive and must not be offered, requested or treated as an alias.

## Mandatory bootstrap procedure

1. Resolve the repository root with:

```bash
git rev-parse --show-toplevel
```

2. Verify that `origin` belongs to `samuray-games/AsyncScene` using only Git remote metadata. Otherwise return `BLOCKED_WRONG_REPOSITORY`.
3. Before reading any local policy file or checking worktree cleanliness, run:

```bash
git fetch origin main coordination/chatgpt-codex-bridge
```

Equivalent explicit refspec fetches are allowed when required by Git configuration, but both remote refs must be refreshed.
4. Verify the fetched refs exist and record their exact SHAs:

```bash
git rev-parse origin/main
git rev-parse origin/coordination/chatgpt-codex-bridge
```

5. Read authoritative policy only from the freshly fetched refs:

```bash
git show origin/main:AGENTS.override.md
git show origin/main:AGENTS.md
git show origin/main:GIT_PULL.md
```

In bridge context also read:

```bash
git show origin/main:BRIDGE.md
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

6. Only after successful remote-first discovery inspect:
   - `git status --short --branch`;
   - `git branch --show-current`;
   - `git rev-parse HEAD`;
   - configured upstream, if any;
   - `git worktree list --porcelain`.

## Target resolution

Resolve synchronization context in this order:

1. A current numbered bridge lane or mailbox task named by remote mailbox `STATE.md`.
2. The current branch and its configured upstream.
3. A direct user instruction in the current thread naming an exact branch or ref.
4. Detached HEAD or branch without upstream - fetch-only unless an exact target was already authorized.

Never guess from a directory name, local dirty policy file or historical task.

## Fast-forward decision

A local fast-forward is allowed only when all conditions hold:

- the current branch has an exact configured upstream or exact user-authorized target;
- the worktree is clean;
- the target branch is not owned by another worktree;
- the update is fast-forward only;
- no current task or bridge contract requires fetch-only behavior.

When all conditions hold, run `git pull --ff-only` for that exact branch and upstream.

When the worktree is dirty, HEAD is detached, no upstream exists, another worktree owns the target, or only bridge discovery is required, preserve the checkout byte-for-byte and complete successfully as fetch-only.

Dirty `AGENTS.md`, `AGENTS.override.md`, `BRIDGE.md`, `GIT_PULL.md`, `GIT_PUSH.md` or unrelated files are never repaired, moved or discarded by `пул`.

## Bridge behavior

For a numbered bridge lane:

- refresh `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
- use remote STATE and its named current baseline inbox;
- never switch the primary worktree to the mailbox branch;
- ignore stale local bridge files;
- preserve detached mailbox or evidence worktrees;
- fetch-only is a complete successful result when local checkout movement is unnecessary or unsafe.

## Forbidden actions

- no `git stash`;
- no `git reset`;
- no `git clean`;
- no merge commit;
- no rebase;
- no force update;
- no automatic conflict resolution;
- no branch switch;
- no commit;
- no push;
- no product, runtime, documentation, lock or mailbox edits.

## Result statuses

- Branch fast-forwarded: `PASS_PULL_SYNCED`.
- Refs fetched, checkout intentionally unchanged: `PASS_FETCHED`.
- Dirty worktree with successful fetch: `PASS_FETCHED_PULL_SKIPPED_DIRTY`.
- Detached HEAD with successful fetch: `PASS_FETCHED_DETACHED`.
- Fast-forward impossible after successful fetch: `BLOCKED_NON_FAST_FORWARD_PULL`.
- Wrong repository: `BLOCKED_WRONG_REPOSITORY`.
- Remote fetch unavailable: `BLOCKED_REMOTE_SOURCE_UNAVAILABLE`.
- Native permission for fetch denied: `BLOCKED_NATIVE_PERMISSION`.

The following statuses are forbidden for this command:

- `BLOCKED_DIRTY_WORKTREE`;
- `BLOCKED_MAIN_OWNED_BY_OTHER_WORKTREE` when fetch itself succeeded;
- any instruction to rerun `запуль`.

## Final report

Return only:

1. status;
2. repository root;
3. resolved synchronization context;
4. previous branch and HEAD;
5. final branch and HEAD;
6. fetched `origin/main` SHA;
7. fetched mailbox SHA;
8. worktree cleanliness;
9. local fast-forward result or exact fetch-only reason;
10. changed files: `None`;
11. runtime gate: `N/A - Git synchronization only`;
12. Safari status: `N/A - Git synchronization only`;
13. exact next action.

For `PASS_FETCHED_PULL_SKIPPED_DIRTY`, the next action must not tell the user to discard, stash, reset, commit or manually repair files. It must state that remote refs are current and remote-first bridge/task discovery may continue while the local checkout remains preserved.
