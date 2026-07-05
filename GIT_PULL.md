# Safe local pull protocol

COMMAND_ALIAS: `запуль`

## Purpose

Safely synchronize the local AsyncScene checkout with current `origin/main` and refresh the mailbox remote ref. This command does not edit product files, create commits, push, stash, reset, rebase, merge, or delete anything.

## Trigger

When the user's trimmed message is exactly `запуль`, follow this file before any other interpretation.

## Required procedure

1. Resolve the repository root with `git rev-parse --show-toplevel` and operate from that root.
2. Verify the `origin` remote belongs to `samuray-games/AsyncScene`. If not, stop with `BLOCKED_WRONG_REPOSITORY`.
3. Read the current root `AGENTS.md` and this file.
4. Inspect:
   - `git status --short --branch`;
   - `git branch --show-current`;
   - `git worktree list --porcelain`.
5. If the current worktree has tracked or untracked changes, stop with `BLOCKED_DIRTY_WORKTREE`. Show the exact changed paths. Do not stash, reset, clean, commit, discard, or move them.
6. Run `git fetch origin`.
7. Verify `origin/main` exists.
8. If `main` is checked out in another worktree, stop with `BLOCKED_MAIN_OWNED_BY_OTHER_WORKTREE` and report that path. Do not edit the other worktree.
9. Switch the current clean worktree to `main` with `git switch main`.
10. Run `git pull --ff-only origin main`.
11. Fetch the mailbox ref without switching to it:

```bash
git fetch origin coordination/chatgpt-codex-bridge
```

12. Verify:
   - `git rev-parse HEAD` equals `git rev-parse origin/main`;
   - `git status --short --branch` is clean;
   - root `AGENTS.md` contains aliases for `проверь мост`, `запуль`, and `запушь`;
   - root `BRIDGE.md`, `GIT_PULL.md`, and `GIT_PUSH.md` exist.

## Forbidden actions

- no `git stash`;
- no `git reset`;
- no `git clean`;
- no merge commit;
- no rebase;
- no checkout or switch to the mailbox branch;
- no commit;
- no push;
- no product, runtime, documentation, lock, or mailbox edits.

## Failure behavior

- Dirty worktree: `BLOCKED_DIRTY_WORKTREE`.
- Main owned by another worktree: `BLOCKED_MAIN_OWNED_BY_OTHER_WORKTREE`.
- Fast-forward impossible: `BLOCKED_NON_FAST_FORWARD_PULL`.
- Missing origin or refs: `BLOCKED_REMOTE_SOURCE_UNAVAILABLE`.
- Alias files missing after pull: `FAIL_PULL_INCOMPLETE`.

Never repair these states automatically. Report the exact command that failed and the minimum evidence needed for the coordinator.

## Final report

Return only:

1. status;
2. repository root;
3. previous branch and previous HEAD;
4. final branch and final HEAD;
5. `origin/main` HEAD;
6. worktree cleanliness;
7. mailbox ref fetch result;
8. alias-file verification;
9. changed files: `None`;
10. exact next action.

A successful result is `PASS_PULL_SYNCED`. Runtime gate and Safari smoke are `N/A - Git synchronization only`.
