# Universal safe pull protocol

COMMAND_ALIAS: `пул`
LEGACY_ALIASES: `запуль` - INACTIVE

## Purpose

Safely refresh remote refs and, when it is unambiguous and safe, fast-forward the currently authorized local branch. The command is universal across normal task branches, `main`, numbered bridge threads, mailbox worktrees and detached evidence worktrees.

`пул` never invents a target, never merges, rebases, stashes, resets, cleans, commits, pushes or discards work.

## Trigger

When the user's trimmed message is exactly `пул`, follow this file before any generic interpretation.

The former command `запуль` is inactive and must not be offered as an alias.

## Target resolution

Resolve the repository and synchronization context in this order:

1. A current numbered bridge lane or mailbox task named by remote mailbox `STATE.md`.
2. The current branch and its configured upstream.
3. A direct user instruction in the current thread naming an exact branch or ref.
4. Detached HEAD or a branch without upstream - fetch-only unless an exact target was already authorized.

Never guess a branch from a directory name, stale local bridge file or historical task.

## Required procedure

1. Resolve the repository root with `git rev-parse --show-toplevel` and operate from that root.
2. Verify the `origin` remote belongs to `samuray-games/AsyncScene`. Otherwise return `BLOCKED_WRONG_REPOSITORY`.
3. Read current `origin/main:AGENTS.override.md`, root `AGENTS.md`, and this file when available.
4. Inspect:
   - `git status --short --branch`;
   - `git branch --show-current`;
   - `git rev-parse HEAD`;
   - configured upstream, if any;
   - `git worktree list --porcelain`.
5. Run `git fetch origin` even when the worktree is dirty. Fetching refs is allowed because it does not modify tracked worktree files.
6. In a bridge context, also fetch `coordination/chatgpt-codex-bridge` without switching to it.
7. Determine whether a local fast-forward is authorized:
   - current branch has an exact upstream or exact user-authorized target;
   - the worktree is clean;
   - the branch is not owned by another worktree;
   - the update is fast-forward only.
8. When all conditions pass, run `git pull --ff-only` for that exact branch/upstream.
9. When the worktree is dirty, HEAD is detached, no upstream exists, another worktree owns the target branch, or only bridge ref refresh is needed, perform fetch-only and preserve the checkout unchanged.
10. Verify fetched refs and report whether the local branch was fast-forwarded or intentionally left unchanged.

## Universal bridge behavior

For a numbered bridge lane:

- refresh `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
- never switch the primary worktree to the mailbox branch;
- detached mailbox or evidence worktrees remain detached;
- do not recreate, reset, clean or delete any worktree;
- fetch-only is a valid successful result when changing the checkout is unnecessary or unsafe.

## Forbidden actions

- no `git stash`;
- no `git reset`;
- no `git clean`;
- no merge commit;
- no rebase;
- no force update;
- no automatic conflict resolution;
- no commit;
- no push;
- no product, runtime, documentation, lock or mailbox edits.

## Result statuses

- Branch fast-forwarded: `PASS_PULL_SYNCED`.
- Refs fetched, checkout intentionally unchanged: `PASS_FETCHED`.
- Dirty worktree with successful fetch: `PASS_FETCHED_PULL_SKIPPED_DIRTY`.
- Detached HEAD with successful fetch: `PASS_FETCHED_DETACHED`.
- Fast-forward impossible: `BLOCKED_NON_FAST_FORWARD_PULL`.
- Wrong repository: `BLOCKED_WRONG_REPOSITORY`.
- Remote unavailable: `BLOCKED_REMOTE_SOURCE_UNAVAILABLE`.

## Final report

Return only:

1. status;
2. repository root;
3. resolved synchronization context;
4. previous branch and HEAD;
5. final branch and HEAD;
6. fetched remote refs and SHAs;
7. worktree cleanliness;
8. local fast-forward result or exact reason for fetch-only;
9. changed files: `None`;
10. runtime gate: `N/A - Git synchronization only`;
11. Safari status: `N/A - Git synchronization only`;
12. exact next action.
