# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 3.1
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
ORCHESTRATION: `ORCHESTRATION.md`
ROOT_SYNC: `PROCESS_ROOT_SYNC.md`

## 1. Commands

The only numbered bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

Each command selects one fixed slot and runs the complete current remote cycle.

Previous conversation state is never authority for a new command.

Bare `мост`, `запуль` and `запушь` are inactive.

Separate `пул`, `пуш`, `CONTINUE` and `APPROVE` are not required.

## 2. Mandatory first actions

Before any terminal response Codex must:

1. fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
2. read current remote `AGENTS.md`, `AGENTS.override.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md`, this file and mailbox publication policy;
3. read current STATE;
4. read the exact current inbox and claim named by STATE;
5. verify slot, thread, lane, task, execution epoch, phase, baseline, write scope and expected outbox;
6. execute the current phase from clean worktrees;
7. validate, publish and refetch both destinations.

Codex must ignore any prior conversational statement that the lane is completed.

## 3. Thread rotation

When STATE says `THREAD_ROTATION_REQUIRED: true`:

- the previous Codex thread is superseded;
- a fresh Codex thread may adopt the replacement claim named by STATE;
- the old thread and all earlier claims are historical only;
- the fresh thread executes the current phase on the first matching numbered command;
- no preflight or continuation token is allowed.

## 4. No-op completion guard

Codex must not return `Return to ChatGPT and send мост N`, or equivalent, unless all of the following are freshly proven for the current execution epoch:

- expected current outbox exists remotely;
- mailbox head contains that outbox publication;
- for primary-write work, remote main advanced from the authorized baseline;
- remote main equals the reported primary SHA;
- reported parent is the actual first parent;
- exact changed paths equal the frozen scope;
- required validations passed;
- outbox contains the exact fetched SHA and parent.

Historical outboxes do not satisfy a new execution epoch.

If these conditions are absent, Codex must execute or return one explicit blocker. A bare return-to-ChatGPT line is `FAIL_NO_EXECUTION_EVIDENCE`.

## 5. Clean worktrees

Use:

- one clean task-owned worktree at the exact authorized main baseline;
- one separate clean mailbox worktree at the latest mailbox head.

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push the user's primary checkout.

Local divergence is not a blocker.

## 6. Current metadata

Current remote STATE and its named inbox and claim supersede all older metadata.

The original task inbox remains authority only for unchanged objective and evidence not replaced later.

## 7. Primary publication

After validation:

- stage only authorized paths;
- create one direct-child commit;
- prove exact paths;
- push fast-forward;
- refetch and prove `origin/main` equals the commit;
- derive SHA and parent from the fetched remote commit.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`.

## 8. Outbox publication

The outbox must:

- use the exact current expected path;
- be a direct child of the fetched mailbox head;
- change only that path;
- contain the machine-derived fetched primary SHA and actual parent;
- contain exact paths and validations;
- be refetched and verified remotely.

Manual SHA transcription is forbidden.

A primary SHA mismatch is not `PASS_PUSHED`.

## 9. Authentication

Codex may run one non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle from `ORCHESTRATION.md`.

Never ask for credentials.

## 10. Correction and root synchronization

A same-scope correction remains in the same logical thread id but may require a fresh Codex conversation thread.

A reusable process defect triggers `PROCESS_ROOT_SYNC.md`.

ChatGPT must synchronize root authority, validator, mailbox policy, STATE, inbox, claim and live memory before the next action.

## 11. ChatGPT verification

When ChatGPT receives `мост N`, it:

1. reloads live memory and reports exact `MEMORY_REV`;
2. reads current main, mailbox policy and STATE;
3. verifies only Slot N;
4. checks ancestry, paths, mirrors, behavior, tests and remote evidence;
5. rejects any SHA mismatch or missing current outbox;
6. accepts or writes one exact correction;
7. performs root synchronization for systemic defects;
8. opens the next safe task.

Codex prose alone is never acceptance evidence.
