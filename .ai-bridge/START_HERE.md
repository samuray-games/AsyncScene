# ChatGPT <-> Codex Bridge

This directory is an asynchronous coordination mailbox between ChatGPT and Codex.

## Canonical location

- Repository: `samuray-games/AsyncScene`
- Mailbox branch: `coordination/chatgpt-codex-bridge`
- Mailbox scope: `.ai-bridge/**` only
- Project implementation source of truth: the current primary repository worktree and its current branch, normally `main`

The mailbox branch is not an implementation branch. Do not use its copies of project files as evidence of current implementation state.

## Why this branch is separate

The mailbox must not interfere with dirty implementation worktrees, runtime locks, mirrored files, shared registries, `TASKS.md`, `PROJECT_MEMORY.md`, or active feature branches. Every mailbox commit must change only `.ai-bridge/**`.

## One-time local setup

Use a separate worktree so mailbox traffic never requires switching the primary implementation worktree:

```bash
git fetch origin coordination/chatgpt-codex-bridge
git worktree add -b coordination/chatgpt-codex-bridge-local ../AsyncScene-bridge origin/coordination/chatgpt-codex-bridge
```

If that local branch or worktree already exists, inspect the current Git state and reuse it instead of recreating it.

To publish mailbox changes from the bridge worktree:

```bash
git pull --rebase origin coordination/chatgpt-codex-bridge
git push origin HEAD:coordination/chatgpt-codex-bridge
```

Never force-push the mailbox branch.

## Normal cycle

1. ChatGPT creates a new immutable message in `.ai-bridge/inbox/` and pushes it to the mailbox branch.
2. The user tells Codex in the existing Codex thread to check the bridge.
3. Codex reads `START_HERE.md`, `PROTOCOL.md`, `STATE.md`, and the newest unanswered inbox message.
4. Codex performs only the action authorized by the message and existing repository policy.
5. Codex creates a new immutable response in `.ai-bridge/outbox/`, commits it, and pushes it to the mailbox branch.
6. The user tells ChatGPT to check the Codex response.
7. ChatGPT verifies the response against current primary repository sources and writes the next inbox turn when needed.

## Human gates remain human gates

The bridge does not authorize or replace:

- `MODEL_PREFLIGHT_ONLY` and the same-thread `CONTINUE` step;
- runtime safety approval and the same-thread `APPROVE` token;
- native Codex permission dialogs;
- user-run Safari runtime smoke;
- user acceptance;
- repository locks or serialized ownership.

A token written in a mailbox file is not a valid approval token for the Codex UI thread.

## First message

The bootstrap thread starts at:

`.ai-bridge/inbox/BRIDGE-20260705-001-01-chatgpt.md`
