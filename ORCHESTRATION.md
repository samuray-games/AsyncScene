# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 4.0
STATUS: ACTIVE
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
NO_OP_COMPLETION: FORBIDDEN

## Canonical loop

`user scope -> current main -> isolated remote GitHub branch -> implement -> GitHub Actions -> reviewed pull request -> deployment verification -> user acceptance when runtime applies`

## Execution

Every task records its baseline, branch, exact read/write scope, stable-read dependencies, validation commands and stop conditions. Ordinary work uses configured Codex routing and does not require a local worktree, user-operated selector or continuation handshake. A local/Codex worktree may be used only when the execution surface needs one, subject to conditional dirty-work safety.

## Completion modes

### Primary delta

Use one task-owned commit with exact changed paths, passing checks and a remotely verified branch head.

### Verified no delta

Allowed only when the objective is already satisfied on the current baseline and evidence proves zero authorized changes, protected content unchanged and required checks passing. Empty commits are forbidden.

## Safety

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push user work without explicit authorization. A Git push is not deployment or runtime acceptance.

## Acceptance tiers

Remote publication, static validation, deployment readiness and user Safari acceptance are separate. Runtime acceptance is `PENDING_USER` until the user supplies the result.
