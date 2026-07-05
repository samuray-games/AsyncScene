# Safe task push protocol

COMMAND_ALIAS: `запушь`

## Purpose

Safely publish only the current task's already authorized changes or commits. This command never invents scope, never absorbs unrelated work, never rewrites history, and never claims deployment or Safari acceptance.

## Trigger

When the user's trimmed message is exactly `запушь`, follow this file before any other interpretation.

## Required authority

Before staging, committing, or pushing, Codex must identify an exact authorized scope from one of these sources:

1. the current Codex thread's unchanged authorized task after any required `CONTINUE` and `APPROVE`;
2. the sole active bridge inbox task; or
3. a direct user instruction in the current thread that names the exact files or exact already-created commits to publish.

If no exact authorized scope exists, stop with `BLOCKED_NO_AUTHORIZED_PUSH_SCOPE`.

## Required procedure

1. Resolve the repository root with `git rev-parse --show-toplevel` and verify the `origin` remote belongs to `samuray-games/AsyncScene`.
2. Read root `AGENTS.md`, this file, and the current task authority.
3. Inspect:
   - `git status --short --branch`;
   - `git branch --show-current`;
   - `git rev-parse HEAD`;
   - current upstream, if any;
   - `git worktree list --porcelain`;
   - the task-owned diff and unrelated concurrent changes separately.
4. Refuse detached HEAD with `BLOCKED_DETACHED_HEAD`.
5. Run `git fetch origin` before deciding whether a push is safe.
6. Preserve every unrelated change. Never stage it, commit it, revert it, stash it, clean it, or include it in the task-owned commit.
7. If the worktree is dirty:
   - confirm every intended changed path is inside the exact authorized task scope;
   - confirm required static checks for the task have passed;
   - stage only the explicit task-owned paths with `git add -- <exact paths>`;
   - inspect `git diff --cached --name-status` and `git diff --cached`;
   - run `git diff --cached --check`;
   - if any staged path is outside scope, unstage only that path and stop with `BLOCKED_FORBIDDEN_STAGED_PATH`;
   - create one task-specific commit with the task ID or exact purpose in the message.
8. If the worktree is clean, do not create an empty commit. Determine whether local HEAD already contains task-owned commits not present on the remote branch.
9. Determine the current branch name and remote branch state.
10. Never push if the remote branch contains commits not in local HEAD. Stop with `BLOCKED_NON_FAST_FORWARD_PUSH` and report both SHAs.
11. Pushing `main` is allowed only when the current authorized task explicitly uses direct-main delivery and all outgoing commits are task-owned. Otherwise stop with `BLOCKED_MAIN_PUSH_NOT_AUTHORIZED`.
12. Push without force:
   - existing upstream: `git push`;
   - no upstream and authorized branch: `git push -u origin HEAD:<current-branch>`.
13. Re-fetch the pushed branch and verify its remote SHA equals local HEAD.
14. Report CI or GitHub Pages status separately when visible. A successful Git push does not equal deployment, runtime PASS, or Safari acceptance.

## Forbidden actions

- no `--force` or `--force-with-lease`;
- no amend;
- no rebase;
- no reset;
- no stash;
- no clean;
- no merge of unrelated work;
- no automatic conflict resolution;
- no staging with broad patterns such as `git add .` or `git add -A`;
- no pushing closed or superseded mailbox work;
- no changing task scope merely to make the push succeed.

## Runtime-sensitive work

`запушь` does not grant runtime approval. Runtime-sensitive files may be committed and pushed only if the exact task already received the required same-thread `APPROVE` for that frozen scope. Otherwise stop with `BLOCKED_RUNTIME_APPROVAL_MISSING`.

## Failure behavior

- No exact authority: `BLOCKED_NO_AUTHORIZED_PUSH_SCOPE`.
- Dirty unrelated changes that cannot be cleanly separated: `BLOCKED_UNRELATED_CHANGES_OVERLAP`.
- Missing required checks: `BLOCKED_VALIDATION_INCOMPLETE`.
- Remote advanced or diverged: `BLOCKED_NON_FAST_FORWARD_PUSH`.
- Main push not authorized: `BLOCKED_MAIN_PUSH_NOT_AUTHORIZED`.
- Runtime approval absent: `BLOCKED_RUNTIME_APPROVAL_MISSING`.

Never repair these states by rewriting history or absorbing unrelated changes.

## Final report

Return only:

1. status;
2. repository root;
3. authorized task and file scope;
4. branch and upstream;
5. task-owned changed files;
6. unrelated changes preserved;
7. checks run and results;
8. commit created or reused;
9. local HEAD;
10. remote branch and verified remote SHA;
11. push result;
12. CI/Pages status, or `UNKNOWN_NOT_CHECKED`;
13. runtime gate status;
14. Safari status;
15. exact next action.

A successful result is `PASS_PUSHED`. This means Git publication only. It does not imply deployment or runtime acceptance.
