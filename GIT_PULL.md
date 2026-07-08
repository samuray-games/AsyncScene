# Automatic Remote-First Bridge Sync Protocol

PROTOCOL_VERSION: GIT_PULL_3_1
ORCHESTRATION: `ORCHESTRATION.md`

## Numbered bridge lanes

For `мост 1`, `мост 2` or `мост 3`, synchronization is automatic. The user does not send a separate `пул`.

Codex must fetch remote main and the mailbox branch, record both remote SHAs, read current policy and STATE from remote refs, resolve only the requested slot, and prepare clean task-owned worktrees from the exact authorized refs.

## Primary checkout

The user's local `main` is never a prerequisite for bridge execution.

If it is dirty, ahead, behind, detached or diverged, preserve it byte-for-byte. Do not merge, rebase, reset, stash, clean, amend or switch it. Execute from a fresh temporary worktree created from the exact authorized remote baseline.

Local divergence is not a blocker.

## Worktree split

Use two separate task-owned worktrees:

- implementation worktree from the exact authorized remote main baseline;
- mailbox worktree from the freshly fetched mailbox head.

Remove only task-owned temporary worktrees after remote verification when safe.

## Standalone `пул`

The explicit `пул` command remains available only for standalone non-bridge Git maintenance.

It fetches first, fast-forwards only a clean exact-upstream branch, otherwise completes as fetch-only, and never merges or rebases.

## Reporting

Automatic synchronization is included in the final numbered bridge report together with execution and publication evidence. It is not a separate user step.
