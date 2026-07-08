# Automatic Remote-First Bridge Sync Protocol

PROTOCOL_VERSION: GIT_PULL_3_1
ROOT_CAUSE_SYNC: REQUIRED
ORCHESTRATION: `ORCHESTRATION.md`
ROOT_SYNC: `PROCESS_ROOT_SYNC.md`

## Numbered bridge lanes

For `мост 1`, `мост 2` or `мост 3`, synchronization is automatic. The user does not send a separate `пул`.

Codex fetches remote main and mailbox, records both SHAs, reads current authority and STATE, resolves only the requested slot, and prepares clean task-owned worktrees.

## Primary checkout

The user's local `main` is never a prerequisite.

If it is dirty, ahead, behind, detached or diverged, preserve it byte-for-byte. Do not merge, rebase, reset, stash, clean, amend or switch it.

Local divergence is not a blocker.

## Worktree split

Use:

- an implementation worktree from the exact authorized remote main baseline;
- a mailbox worktree from the freshly fetched mailbox head.

## Process baseline refreeze

When ChatGPT publishes root-process hardening while a lane is open, it must immediately publish a new current inbox, replacement immutable claim and STATE using the new exact main SHA.

Codex must use the new pair named by STATE and must not continue from the superseded baseline.

This refreeze adds no extra user command.

## Standalone `пул`

Standalone `пул` remains only for explicit non-bridge maintenance.

It fetches first, fast-forwards only a clean exact-upstream branch, otherwise completes as fetch-only, and never merges or rebases.

## Reporting

Automatic synchronization is part of the final numbered bridge report.
