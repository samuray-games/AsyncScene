# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 3.1
ROOT_CAUSE_SYNC: REQUIRED
ORCHESTRATION: `ORCHESTRATION.md`
ROOT_SYNC: `PROCESS_ROOT_SYNC.md`

## 1. Commands

The only numbered bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

Each command selects one fixed slot and runs the complete current cycle.

Bare `мост`, `запуль` and `запушь` are inactive.

Separate `пул`, `пуш`, `CONTINUE` and `APPROVE` are not required.

## 2. One-command behavior

For every numbered command Codex automatically:

1. verifies `origin` is `samuray-games/AsyncScene`;
2. fetches main and mailbox;
3. reads current remote authority, policy, STATE, inbox and claim;
4. resolves only the requested slot;
5. ignores stale local files;
6. prepares clean task-owned worktrees;
7. executes the current phase;
8. runs all checks;
9. commits and pushes the authorized primary result when needed;
10. refetches and verifies remote main;
11. derives exact SHA and parent from the fetched remote commit;
12. commits and pushes the immutable outbox;
13. refetches and verifies remote mailbox;
14. tells the user to return to ChatGPT with the same command.

## 3. Clean worktrees

Use:

- one clean worktree at the exact authorized main baseline;
- one separate clean worktree at the latest mailbox head.

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push the user's primary checkout.

Local divergence is not a blocker.

## 4. Metadata precedence

Use `AGENTS.override.md`, `PROCESS_ROOT_SYNC.md` and `ORCHESTRATION.md`.

Current remote STATE and its named inbox and claim supersede older mutable metadata.

Historical artifacts remain immutable audit evidence.

## 5. Claims

When a valid current claim exists:

- adopt it;
- verify slot, thread, lane, task, baseline, scope and expected outbox;
- do not create a second claim.

When root-process hardening moves main during an open lane, ChatGPT creates a replacement immutable claim and a new current inbox. Codex uses only the pair named by STATE.

## 6. Phases

Canonical Protocol 3.1 phases:

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

## 7. Authorization

The matching numbered command authorizes execution and publication for the exact frozen contract.

It never authorizes scope expansion.

Codex uses the active client model and reports `USER_SELECTED_UNVERIFIED` when needed.

## 8. Primary publication

After validation:

- stage only authorized paths;
- create one direct-child commit;
- prove exact paths;
- push fast-forward;
- refetch and prove `origin/main` equals the commit;
- derive SHA and parent from the fetched remote commit.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`.

## 9. Outbox publication

The outbox must:

- use the expected immutable path;
- be a direct child of the fetched mailbox head;
- change only the authorized outbox path;
- contain the machine-derived fetched primary SHA and actual parent;
- contain exact paths and validation evidence;
- be remotely refetched and verified.

Manual SHA transcription is forbidden.

A reported primary SHA that differs from fetched `origin/main` is not `PASS_PUSHED`.

## 10. Authentication

Codex may run one non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle from `ORCHESTRATION.md`.

Never ask for credentials.

## 11. Correction and root synchronization

A same-scope task correction remains in the same logical thread.

A reusable process defect also triggers `PROCESS_ROOT_SYNC.md`.

ChatGPT must update every affected root authority, validator, mailbox policy, STATE and live memory before the next project action.

If root hardening moves main, ChatGPT re-freezes the active lane to the new exact baseline with a new inbox and replacement claim. No extra user command is added.

## 12. ChatGPT verification

When ChatGPT receives `мост N`, it:

1. reloads live memory and reports exact `MEMORY_REV`;
2. reads current main, mailbox policy and STATE;
3. verifies only Slot N;
4. independently checks ancestry, paths, mirrors, behavior, tests and remote evidence;
5. rejects any SHA mismatch;
6. accepts or writes one exact correction;
7. performs mandatory root synchronization for systemic defects;
8. automatically opens the next safe task.

Codex prose alone is never acceptance evidence.
