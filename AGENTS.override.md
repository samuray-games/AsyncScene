# Asynchronia Protocol 3.1 Override

OVERRIDE_VERSION: ORCHESTRATION_3_1_ONE_COMMAND_LOOP
BRIDGE_PROTOCOL: 3.1

Read root `AGENTS.md` fully. Every rule remains binding except the process clauses explicitly replaced below.

## 1. Canonical process source

For task orchestration, bridge phases, confirmation, Git transport, publication recovery, acceptance tiers and automatic progression, read and follow current `origin/main:ORCHESTRATION.md`.

Process precedence is:

1. `AGENTS.override.md`;
2. `ORCHESTRATION.md`;
3. `BRIDGE.md`;
4. `GIT_PULL.md` and `GIT_PUSH.md`;
5. mailbox `STATE.md`;
6. current baseline inbox named by STATE;
7. immutable claim;
8. original task inbox for unchanged objective and evidence requirements;
9. historical bridge artifacts for audit only;
10. `AGENTS.md` for all rules not replaced here.

## 2. Exact user loop

The numbered bridge workflow is exactly:

1. ChatGPT writes the task inbox, claim and STATE.
2. The user sends `мост 1`, `мост 2` or `мост 3` to the matching Codex thread.
3. Codex automatically fetches remote main and mailbox, reads the current slot contract, prepares clean task worktrees, executes the task, validates it, pushes the primary commit when authorized, writes and pushes the immutable outbox, then tells the user to return to ChatGPT with the same numbered command.
4. The user sends the same `мост N` to ChatGPT.
5. ChatGPT independently verifies the remote commits, accepts or writes a correction inbox, and opens the next safe task.
6. Repeat.

No separate `пул`, `пуш`, `CONTINUE`, `APPROVE` or generic continuation command is required for a numbered bridge lane.

Bare `мост`, `запуль` and `запушь` remain inactive.

## 3. Numbered bridge authorization

A numbered `мост N` sent in the matching Codex thread is all of the following for the exact current frozen slot contract:

- remote synchronization instruction;
- task-entry instruction;
- model-use acknowledgement;
- runtime-safety approval for the exact frozen write scope;
- execution instruction;
- publication instruction for the authorized primary commit and immutable outbox.

The command never authorizes scope expansion. A changed objective or expanded write scope requires a new inbox from ChatGPT.

Codex must not stop for model preflight. It uses the current active model and reports it as `USER_SELECTED_UNVERIFIED` when external verification is unavailable. The inbox may include a recommended model, but model reporting never blocks execution.

## 4. Remote-first clean-worktree execution

For every numbered bridge command, Codex must:

1. verify `origin` is `samuray-games/AsyncScene`;
2. run `git fetch origin main coordination/chatgpt-codex-bridge`;
3. read current policy from `origin/main` and current STATE from the mailbox branch;
4. resolve only the requested slot;
5. ignore stale local mailbox files and historical tasks;
6. never execute or publish from a dirty, ahead, behind or diverged primary checkout;
7. create or reuse a task-owned clean temporary worktree from the exact authorized `origin/main` baseline;
8. create a separate clean mailbox worktree from the freshly fetched mailbox head;
9. execute, validate, commit and push only from those task-owned clean worktrees;
10. remove only task-owned temporary worktrees after remote verification when safe.

Local `main` divergence is irrelevant. Codex must not merge, rebase, reset, stash, clean, amend, cherry-pick or force-push it.

## 5. Automatic publication

After successful validation Codex automatically:

1. creates one direct-child primary commit from the authorized main baseline when primary writes are authorized;
2. pushes it fast-forward to the exact authorized primary ref;
3. refetches and proves the remote primary ref equals the published commit;
4. creates one immutable outbox as a direct child of the latest mailbox head;
5. pushes it fast-forward to `coordination/chatgpt-codex-bridge`;
6. refetches and proves the remote mailbox head equals the outbox commit;
7. returns exactly one next action: go to ChatGPT and write the same `мост N`.

The user must never be asked to send a separate `пуш` or `пул` for a numbered bridge task.

## 6. Authentication

Codex GitHub credentials are an environment prerequisite for the exact automatic loop.

Codex must never ask the user to reveal a token. If credentials are invalid, it may perform the repository's non-interactive configured authentication repair once. If remote write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle defined in `ORCHESTRATION.md`.

Authentication failure is an external environment blocker, not a reason to merge, rebase, rewrite history or alter task scope.

## 7. Automatic progression

After independent acceptance, ChatGPT automatically closes the current claim, updates STATE and live memory, freezes the next safe task and publishes its inbox and claim.

Progress pauses only for a genuine product decision, external blocker, unresolved collision, missing primary evidence or required Safari smoke.

## 8. Runtime and parallel boundaries

- Source and deployed mirrors are one ownership group.
- Runtime JavaScript, UI runtime JavaScript, economy, battle, NPC, state, persistence, routing and shared smoke wiring remain runtime-sensitive.
- `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized singleton ownership groups.
- Read-only work may run in parallel only when there is no stable-read dependency on a mutable lane.
- Undeclared overlap returns `BLOCKED_PARALLEL_SCOPE_COLLISION`.
- No task may absorb another lane.

## 9. Acceptance

Use four separate tiers:

- remote publication verification;
- static implementation acceptance;
- deployment readiness;
- user-owned Safari runtime acceptance.

Codex cannot claim user acceptance. ChatGPT cannot promote a lower tier without evidence.

## 10. Final next action

Every Codex bridge result and ChatGPT verification provides exactly one next user action.

Do not offer competing paths. Do not ask the user to repeat information already present in memory, STATE, inbox, claim, outbox or repository evidence.
