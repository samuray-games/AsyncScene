# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 3.1
ORCHESTRATION: `ORCHESTRATION.md`

## 1. Commands

The only numbered bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

Each command selects one fixed slot and runs that slot's complete current cycle.

Bare `мост`, `запуль` and `запушь` are inactive.

Separate `пул`, `пуш`, `CONTINUE` and `APPROVE` are not required for numbered bridge lanes.

## 2. One-command behavior

For every numbered bridge command, Codex automatically:

1. verifies `origin` belongs to `samuray-games/AsyncScene`;
2. fetches `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
3. reads current remote authority, STATE, current inbox and claim;
4. resolves only the requested slot;
5. ignores stale local bridge files and historical superseded tasks;
6. prepares clean task-owned worktrees from the exact remote refs;
7. executes the current phase;
8. runs all required checks;
9. commits and pushes the exact authorized primary result when needed;
10. commits and pushes the immutable outbox;
11. refetches and verifies both remote destinations;
12. tells the user to return to ChatGPT and write the same numbered command.

## 3. Clean worktree rule

Codex must not execute from or repair a dirty, ahead, behind or diverged primary checkout.

Use:

- one clean temporary worktree at the exact authorized `origin/main` baseline for implementation;
- one separate clean temporary worktree at the latest mailbox head for claim/outbox publication.

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push the user's primary checkout.

## 4. Metadata precedence

Use the precedence defined in `AGENTS.override.md` and `ORCHESTRATION.md`.

For mutable fields, current remote `STATE.md` and its named current baseline inbox supersede older inboxes. The original task inbox remains authoritative only for the unchanged objective and evidence requirements not replaced later.

## 5. Claims

When a valid claim exists for the same slot and logical thread:

- adopt it;
- verify slot, thread, lane, task, baseline, scope and expected outbox;
- do not create a second claim.

When no claim exists and STATE authorizes creation:

1. fetch the latest mailbox head;
2. prepare a clean mailbox worktree;
3. create exactly the predetermined claim path;
4. commit it as a direct child of the fetched head;
5. push fast-forward;
6. refetch and verify.

## 6. Phases

Use Protocol 3.1 phases from `ORCHESTRATION.md`:

- `CLOSED`
- `SCOPE_FREEZE`
- `READY_FOR_CODEX`
- `EXECUTE_AND_PUBLISH`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT`
- `CORRECTION_REQUIRED`
- `READY_FOR_SAFARI`
- `AWAITING_SAFARI`
- `PASS_ACCEPTED`
- `BLOCKED_EXTERNAL`

Historical Protocol 3.0 phase names remain readable but must not be created in new tasks.

## 7. Authorization

The matching numbered command itself authorizes execution and publication for the exact frozen current slot contract.

It does not authorize scope expansion. A changed objective or expanded path set requires a new inbox from ChatGPT.

Codex uses the active client model and reports `USER_SELECTED_UNVERIFIED` when external verification is unavailable. Model preflight does not interrupt the loop.

## 8. Primary publication

After validation:

- stage only authorized paths;
- create one direct-child commit from the exact main baseline;
- prove the diff contains only authorized paths;
- push fast-forward without force;
- refetch and prove `origin/main` equals the commit.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED` without merging or rebasing.

## 9. Outbox publication

After primary publication or for read-only tasks:

1. fetch the latest mailbox head;
2. prepare a clean mailbox worktree;
3. create exactly the expected immutable outbox path;
4. commit it as a direct child of the mailbox head;
5. prove the diff contains only the outbox path;
6. push fast-forward;
7. refetch and verify the remote mailbox head.

Retry a mailbox race up to three times by rebuilding the exact payload from the latest head.

## 10. Authentication failure

Codex may attempt the repository's configured non-interactive authentication repair once.

If remote write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle required by `ORCHESTRATION.md`. Never ask the user to reveal credentials.

## 11. Correction loop

A same-scope correction remains in the same logical thread. The next matching numbered command automatically fetches, applies the correction, validates, pushes and publishes the new outbox.

No repeated model preflight or confirmation.

## 12. ChatGPT verification

When ChatGPT receives `мост N`, it:

1. reloads live memory and reports exact `MEMORY_REV`;
2. reads current main and mailbox STATE;
3. verifies only Slot N;
4. independently checks ancestry, paths, mirrors, behavior and tests;
5. accepts or writes one exact correction inbox;
6. automatically opens the next safe task.

Codex prose alone is never acceptance evidence.
