# Asynchronia Protocol 3.0 Override

OVERRIDE_VERSION: ORCHESTRATION_3_0
BRIDGE_PROTOCOL: 3.0

Read root `AGENTS.md` fully. Every rule remains binding except the process clauses explicitly replaced below.

## 1. Canonical process source

For task orchestration, bridge phases, confirmation, publication recovery, acceptance tiers and automatic progression, read and follow `origin/main:ORCHESTRATION.md`.

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

Protocol 2.4 artifacts remain valid historical evidence. New tasks use Protocol 3.0.

## 2. Commands

The active repository commands are:

- `мост 1`
- `мост 2`
- `мост 3`
- `пул`
- `пуш`
- `CONTINUE` in a numbered Codex bridge thread after model selection

Bare `мост`, `запуль` and `запушь` are inactive and must not be offered or interpreted as aliases.

For every numbered bridge command, fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge` before trusting local files.

## 3. Numbered bridge confirmation

For a numbered bridge task, the valid same-thread `CONTINUE` after the compact 12-of-12 model preflight is both:

- model-selection confirmation; and
- explicit runtime-safety approval for the exact frozen task and file scope.

No additional `APPROVE` round is required for that numbered bridge task.

This replaces `AGENTS.md` Section 5.1 only for numbered bridge lanes. Non-bridge runtime-sensitive work still uses the separate `APPROVE` protocol.

A scope or objective change invalidates the prior confirmation and requires a new task.

## 4. Automatic progression

The user is not required to send a generic continuation command between completed serialized waves.

After independent acceptance, ChatGPT automatically closes the current claim, updates STATE and memory, freezes the next safe task and publishes its inbox and claim.

Progress pauses only for a genuine user decision, external blocker, unresolved collision, missing primary evidence or required Safari smoke.

## 5. Authoritative slot metadata

Mailbox `STATE.md` names the current phase and current baseline inbox for each slot.

The current baseline inbox supersedes stale mutable fields in older inboxes, including baseline, phase, protocol version, scope details, publication method and plugin proof requirements.

An immutable claim authorizes only the exact logical thread, lane, task, baseline and scope recorded in current metadata. A matching thread adopts an existing valid claim and never creates a second one.

## 6. Compact model preflight

A valid bridge preflight contains the fields defined in `ORCHESTRATION.md`, reports `evaluated pair count: 12/12`, and ends with exactly one standalone fenced block containing `CONTINUE`, with nothing after it.

The user selects the active model. If it cannot be externally verified, report `USER_SELECTED_UNVERIFIED`. This is not a blocker.

A repeated preflight after `CONTINUE` is invalid. The lane is `EXECUTE_NOW` and must execute without another preflight or confirmation.

## 7. Runtime and parallel boundaries

- Source and deployed mirrors are one ownership group.
- Runtime JavaScript, UI runtime JavaScript, economy, battle, NPC, state, persistence, routing and shared smoke wiring remain runtime-sensitive.
- `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized singleton ownership groups.
- Read-only work may run in parallel only when there is no stable-read dependency on a mutable lane.
- Undeclared overlap returns `BLOCKED_PARALLEL_SCOPE_COLLISION`.
- No task may merge, rebase or absorb another lane without an explicit integration task.

## 8. Git transport

For `пул`, follow current `origin/main:GIT_PULL.md`.

For `пуш`, follow current `origin/main:GIT_PUSH.md`.

Never force-push, amend, rebase, reset, stash, clean, broadly stage, silently resolve conflicts or absorb unrelated work.

A successful Git push proves publication only. It does not prove deployment, runtime behavior or Safari acceptance.

## 9. Authentication recovery

The universal credentials-failure status is `BLOCKED_PUSH_AUTH`.

On that status, Codex must return the complete recovery bundle defined in `ORCHESTRATION.md`, including full file payloads and the complete mailbox payload when applicable. A SHA-only report is insufficient.

ChatGPT may:

1. verify and fast-forward a remotely readable direct-child commit object; or
2. reconstruct the exact commit from the recovery bundle through GitHub connector APIs.

A local-only commit is never accepted as publication.

If the bundle is incomplete, the same Codex thread returns only the missing payload. It does not rerun preflight, implementation or tests.

## 10. Acceptance

Use the four acceptance tiers from `ORCHESTRATION.md`:

- publication verification;
- static implementation acceptance;
- deployment readiness;
- user-owned Safari runtime acceptance.

Codex cannot claim user acceptance. ChatGPT cannot promote a lower tier into a higher tier without evidence.

## 11. Real blockers

Valid blockers include:

- wrong repository;
- unreadable current remote policy, STATE or baseline inbox;
- closed or unavailable slot;
- claim owned by another logical thread;
- current main baseline moved;
- native permission refusal;
- repeated mailbox race after three rebuild attempts;
- actual scope collision;
- unresolved user decision;
- missing required primary evidence.

The following are not blockers when remote sources remain readable:

- stale local policy files;
- missing local mailbox files;
- stale existing mailbox worktrees;
- unrelated dirty files;
- unavailable hidden plugin telemetry;
- inability to verify the user-selected model externally.

## 12. Final next action

Every task, preflight, execution report, recovery report and coordinator verification must provide exactly one next user action.

Do not offer competing paths. Do not ask the user to repeat information already available in memory, STATE, inbox, claim, outbox or repository evidence.
