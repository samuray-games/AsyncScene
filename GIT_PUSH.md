# Universal safe push protocol

COMMAND_ALIAS: `пуш`
LEGACY_ALIASES: `запушь` - INACTIVE

## Purpose

Safely publish only the current task's already authorized changes, commits or mailbox payload. The command is universal across normal branches, `main`, numbered bridge lanes, dedicated mailbox worktrees and detached direct-child commits.

`пуш` never invents scope, absorbs unrelated work, rewrites history, bypasses runtime approval or claims deployment, runtime PASS or Safari acceptance.

## Trigger

When the user's trimmed message is exactly `пуш`, follow this file before any generic interpretation.

The former command `запушь` is inactive and must not be offered as an alias.

## Required authority

Before staging, committing or pushing, resolve one exact publication authority:

1. the current Codex thread's unchanged authorized task after required `CONTINUE` and `APPROVE`;
2. the exact active bridge lane, claim and expected outbox named by remote mailbox `STATE.md`;
3. a direct user instruction in the current thread naming exact files, an exact commit or an exact target ref.

The authority must identify:

- authorized changed paths or immutable payload;
- source commit or worktree;
- destination ref;
- required validation;
- whether runtime approval applies.

If any field is ambiguous, return `BLOCKED_NO_AUTHORIZED_PUSH_SCOPE`.

## Target resolution

Resolve the publication target in this order:

1. Bridge mailbox target from the active slot contract.
2. Exact target ref named by the task or user.
3. Current branch's upstream when the task authorizes that branch.
4. Direct-main delivery only when explicitly authorized.

Never infer a target merely from the current directory, current branch name or a stale local file.

## Required procedure

1. Resolve the repository root and verify `origin` belongs to `samuray-games/AsyncScene`.
2. Read current `origin/main:AGENTS.override.md`, root `AGENTS.md`, this file and the exact task authority.
3. Inspect all relevant contexts separately:
   - `git status --short --branch`;
   - `git branch --show-current`;
   - `git rev-parse HEAD`;
   - current upstream, if any;
   - `git worktree list --porcelain`;
   - task-owned diff;
   - unrelated concurrent changes.
4. Run `git fetch origin` before publication.
5. Preserve every unrelated change. Never stage, commit, revert, stash, clean or include it.
6. Validate the exact authorized paths and required checks.
7. Select either normal-branch mode or detached-target mode below.
8. Push without force.
9. Re-fetch the destination ref and prove its remote SHA equals the published commit.
10. Report Git publication separately from CI, deployment, runtime and Safari status.

## Normal branch mode

Use when HEAD is on the exact authorized branch.

1. If task-owned files are uncommitted, stage only explicit authorized paths with `git add -- <exact paths>`.
2. Inspect `git diff --cached --name-status`, `git diff --cached`, and run `git diff --cached --check`.
3. Create one task-specific commit only when needed.
4. Prove the destination remote ref is an ancestor of local HEAD and no unrelated outgoing commit exists.
5. Push with `git push` for an existing authorized upstream, or `git push -u origin HEAD:<authorized-branch>` when the exact branch is authorized.
6. Pushing `main` requires explicit direct-main authority.

## Detached target mode

Detached HEAD is allowed when the authority names an exact destination ref. It is not a blocker by itself.

Before pushing, prove all of the following:

- the detached commit is the exact task-owned commit;
- its first parent equals the freshly fetched destination remote head;
- its diff contains only the authorized paths;
- required checks passed;
- the destination ref is exact;
- the push is a fast-forward.

Then push without force:

```bash
git push origin HEAD:refs/heads/<authorized-target-branch>
```

For bridge mailbox publication, the authorized target is normally:

```bash
refs/heads/coordination/chatgpt-codex-bridge
```

A detached mailbox commit must be a direct child of the freshly fetched mailbox head and change only the expected claim or outbox path.

## Stale detached mailbox commit

If the mailbox remote advanced after the detached commit was created:

- do not force-push;
- do not reuse, amend, rebase or cherry-pick the stale local commit;
- rebuild the exact authorized payload as a new direct child of the current mailbox head in a fresh isolated worktree;
- preserve the stale worktree for audit unless the task explicitly authorizes removing only a newly created temporary worktree.

## Authentication fallback

If publication fails only because Git credentials are unavailable:

- preserve primary files unchanged;
- return `BLOCKED_PUSH_AUTH`;
- do not ask the user to expose or paste credentials;
- for a mailbox file, include the complete publication-ready UTF-8 payload and exact authorized path;
- for an existing commit, include its SHA, parent, exact changed paths and destination ref;
- instruct the user to return to ChatGPT with `пуш`, where connector publication may be performed independently.

A local-only commit is never remote publication.

## Forbidden actions

- no `--force` or `--force-with-lease`;
- no amend;
- no rebase;
- no reset;
- no stash;
- no clean;
- no broad staging such as `git add .` or `git add -A`;
- no automatic conflict resolution;
- no unrelated merge;
- no pushing closed or superseded mailbox work;
- no scope expansion merely to make publication succeed.

## Runtime-sensitive work

`пуш` grants no runtime approval. Runtime-sensitive files may be published only when the exact frozen task already received required same-thread `APPROVE`. Git publication never equals deployment or runtime acceptance.

## Result statuses

- Successful publication: `PASS_PUSHED`.
- No exact authority: `BLOCKED_NO_AUTHORIZED_PUSH_SCOPE`.
- Credentials unavailable: `BLOCKED_PUSH_AUTH`.
- Remote advanced or diverged: `BLOCKED_NON_FAST_FORWARD_PUSH`.
- Unauthorized main target: `BLOCKED_MAIN_PUSH_NOT_AUTHORIZED`.
- Runtime approval absent: `BLOCKED_RUNTIME_APPROVAL_MISSING`.
- Forbidden path or outgoing commit: `BLOCKED_FORBIDDEN_PUSH_CONTENT`.

## Final report

Return only:

1. status;
2. repository root;
3. resolved publication authority;
4. source branch/worktree and HEAD;
5. destination ref and pre-push remote SHA;
6. authorized changed paths;
7. unrelated changes preserved;
8. checks run and results;
9. commit created or reused;
10. push result and verified remote SHA;
11. CI/Pages status, or `UNKNOWN_NOT_CHECKED`;
12. runtime gate status;
13. Safari status;
14. exact next action.

`PASS_PUSHED` means Git publication only.
