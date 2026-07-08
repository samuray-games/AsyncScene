# Universal Safe Push Protocol

PROTOCOL_VERSION: GIT_PUSH_3_0
COMMAND_ALIAS: `пуш`
LEGACY_ALIASES: `запушь` - INACTIVE
ORCHESTRATION: `ORCHESTRATION.md`

## 1. Purpose

Publish only the exact authorized task result or immutable mailbox payload.

`пуш` never invents scope, absorbs unrelated work, rewrites history, bypasses confirmation or claims deployment, runtime PASS or Safari acceptance.

## 2. Trigger

When the user's trimmed message is exactly `пуш`, follow this file before generic interpretation.

## 3. Required authority

Resolve one exact publication authority:

1. the current Codex thread's unchanged authorized task after required `CONTINUE`;
2. the exact active bridge lane, claim and expected outbox named by remote mailbox STATE;
3. a direct user instruction naming exact paths, commit and destination ref.

The authority must identify:

- source baseline and commit or full payload;
- exact changed paths;
- destination ref;
- required checks;
- runtime confirmation status.

If any field is ambiguous, return `BLOCKED_NO_AUTHORIZED_PUSH_SCOPE`.

## 4. Remote-first bootstrap

1. Verify repository root and `origin` identity.
2. Fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`.
3. Read:

```bash
git show origin/main:AGENTS.override.md
git show origin/main:ORCHESTRATION.md
git show origin/main:AGENTS.md
git show origin/main:GIT_PUSH.md
```

In bridge context also read:

```bash
git show origin/main:BRIDGE.md
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

4. Inspect branch, HEAD, upstream, worktrees, exact task diff and unrelated changes.
5. Preserve unrelated work byte-for-byte.

## 5. Target resolution

Resolve target in this order:

1. exact mailbox ref from the active bridge lane;
2. exact ref named by the task or user;
3. authorized current branch upstream;
4. direct `main` only when explicitly authorized.

Never infer a target from directory, current branch name or stale local files.

## 6. Normal branch mode

Use only when HEAD is on the exact authorized branch.

1. Stage only exact authorized paths.
2. Inspect cached name-status and full cached diff.
3. Run `git diff --cached --check` and required task checks.
4. Create one task-specific commit when needed.
5. Prove no unrelated outgoing commit exists.
6. Push without force.
7. Refetch and prove the destination remote SHA equals the published commit.

## 7. Detached target mode

Detached HEAD is allowed when the exact destination ref is authorized.

Prove:

- the commit is task-owned;
- its first parent equals the freshly fetched destination head;
- exactly authorized paths changed;
- required checks passed;
- push is fast-forward.

Then push without force:

```bash
git push origin HEAD:refs/heads/<authorized-target-branch>
```

For mailbox publication, the usual destination is:

```bash
refs/heads/coordination/chatgpt-codex-bridge
```

## 8. Mailbox race

If the mailbox remote advanced:

- do not force-push;
- do not amend, rebase, cherry-pick or reuse the stale commit;
- rebuild the exact payload as a new direct child of the latest mailbox head;
- retry up to three times;
- preserve stale audit evidence unless the task authorizes removing only a newly created temporary worktree.

After three failed races, return `BLOCKED_MAILBOX_RACE` with the complete recovery bundle.

## 9. Main baseline movement

If `origin/main` no longer equals the authorized baseline before implementation publication, return `BLOCKED_MAIN_BASELINE_MOVED`.

Do not rebase, merge or force-push. ChatGPT must review the new main delta and publish a new baseline contract or cancel the stale task.

## 10. Authentication fallback

If publication fails solely because Git credentials are unavailable, return `BLOCKED_PUSH_AUTH`.

Never ask the user to reveal credentials.

Return a complete `RECOVERY_BUNDLE` containing:

- repository;
- destination ref;
- pre-push remote SHA;
- local commit SHA and first parent, if present;
- exact changed paths;
- intended commit message;
- full validation results;
- runtime and Safari status;
- full UTF-8 content and blob SHA for every changed text file;
- base64 payload and blob SHA for every changed binary file;
- for mailbox work, exact mailbox path and complete immutable payload;
- exact next action: return to ChatGPT with the matching numbered bridge command.

A SHA-only report is invalid. A local-only commit is never publication.

ChatGPT recovery order is:

1. fetch the reported commit object;
2. verify direct-child ancestry and exact diff;
3. fast-forward the exact ref when safe;
4. otherwise reconstruct the exact commit from the full recovery bundle;
5. refetch and independently verify.

If the bundle is incomplete, Codex later returns only the missing payload. It must not rerun preflight, implementation or tests.

## 11. Main published but mailbox failed

When primary publication succeeds and only mailbox publication fails:

- preserve main unchanged;
- report `MAIN_PUBLISHED_AWAITING_OUTBOX` plus `BLOCKED_PUSH_AUTH` recovery details;
- include the complete immutable outbox payload;
- do not rebuild or republish the implementation;
- do not request another preflight or `CONTINUE`.

## 12. Forbidden actions

- no force or force-with-lease;
- no amend;
- no rebase;
- no reset;
- no stash;
- no clean;
- no broad staging;
- no automatic conflict resolution;
- no unrelated merge;
- no pushing closed or superseded mailbox work;
- no scope expansion to make publication succeed;
- no treating a local-only commit as remote publication.

## 13. Runtime-sensitive work

`пуш` grants no approval by itself.

For numbered bridge tasks, same-thread `CONTINUE` must already authorize the exact frozen runtime scope under `ORCHESTRATION.md`.

For non-bridge runtime-sensitive work, the separate `APPROVE` rule must already be satisfied.

Git publication never equals runtime or Safari acceptance.

## 14. Result statuses

- `PASS_PUSHED`
- `BLOCKED_NO_AUTHORIZED_PUSH_SCOPE`
- `BLOCKED_PUSH_AUTH`
- `BLOCKED_NON_FAST_FORWARD_PUSH`
- `BLOCKED_MAIN_PUSH_NOT_AUTHORIZED`
- `BLOCKED_MAIN_BASELINE_MOVED`
- `BLOCKED_MAILBOX_RACE`
- `BLOCKED_RUNTIME_APPROVAL_MISSING`
- `BLOCKED_FORBIDDEN_PUSH_CONTENT`

## 15. Final report

Return only:

1. status;
2. repository root;
3. resolved authority;
4. source branch/worktree and HEAD;
5. destination ref and pre-push remote SHA;
6. authorized changed paths;
7. unrelated changes preserved;
8. checks and results;
9. commit created or reused;
10. push result and verified remote SHA;
11. CI or Pages status, or `UNKNOWN_NOT_CHECKED`;
12. runtime gate status;
13. Safari status;
14. complete recovery bundle when required;
15. one exact next action.

`PASS_PUSHED` means Git publication only.
