# Codex Remote-First Bootstrap

BOOTSTRAP_VERSION: 2026-07-07-01

## Purpose

Break the stale-local-policy loop when a checkout is behind `origin/main` and local policy files are dirty.

This bootstrap preserves every local byte. It does not stash, reset, clean, commit, merge, rebase, switch branches, discard changes or push.

## Exact procedure

Run from the current repository without trusting local `AGENTS.md`, `BRIDGE.md`, `GIT_PULL.md` or `GIT_PUSH.md`:

```bash
ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$ROOT" || exit 1
git remote get-url origin
git fetch origin main coordination/chatgpt-codex-bridge
git rev-parse origin/main
git rev-parse origin/coordination/chatgpt-codex-bridge
git show origin/main:AGENTS.override.md
git show origin/main:GIT_PULL.md
git show origin/main:BRIDGE.md
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
git status --short --branch
```

## Required result

- Fetch runs before dirty-worktree evaluation.
- Dirty local files remain untouched.
- The local branch and HEAD remain unchanged.
- Fresh remote policy and mailbox STATE become readable.
- Result status is `PASS_REMOTE_FIRST_BOOTSTRAPPED`.

## Invalid results

- `BLOCKED_DIRTY_WORKTREE`;
- instruction to rerun `запуль`;
- stash, reset, clean, commit, branch switch, merge or rebase;
- any modification of local files.

## After bootstrap

Use only current commands from freshly fetched policy:

- `пул`
- `пуш`
- `мост 1`
- `мост 2`
- `мост 3`

Legacy `запуль` and `запушь` are inactive.
