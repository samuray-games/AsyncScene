# Closed-Loop Bridge Publication Policy v1.2

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_10_CLOSED_LOOP_V1_2
STATUS: ACTIVE_WHEN_REFERENCED_BY_STATE
PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL_V1_2.md
CLOSED_LOOP_STATUS: IMPLEMENTATION_REQUIRED

## Authority and lifecycle

- STATE is the only activation pointer.
- One execution epoch uses one fresh Codex conversation.
- One independent verification uses one fresh ChatGPT conversation.
- Every rejected or incomplete epoch rotates to a fresh thread, epoch, nonce, inbox, claim, outbox, and receipt.
- Codex never edits STATE.
- Product work stays blocked until implementation, installed-package verification, and canary are independently accepted.

## Plugin-first routing

- Repository text cannot activate a plugin.
- The user must actually invoke or select `@asynchronia` in the Codex composer before the numbered bridge command.
- Ordinary work requires installed-plugin invocation evidence.
- Source fallback is forbidden unless the current claim explicitly authorizes a plugin-repair bootstrap.
- Model recommendation originates only from `model-selector` and never becomes a pause or approval token.

## Startup

Codex freshly fetches main and mailbox, reads current authority, STATE, inbox, and claim, and verifies exact cycle, generation, slot, thread, lane, task, epoch, nonce, memory revision, baseline, inbox, claim, expected outbox, expected receipt, scope, and write mode.

Reserved outbox and receipt paths may be absent at startup. Historical artifacts never satisfy a fresh epoch.

## Primary publication

`PASS_PUSHED` requires one direct-child exact-scope primary commit from the authorized baseline, a fast-forward push, fresh remote refetch, exact changed paths, protected-path proof, and validations run from the exact committed tree.

`BLOCKED_NO_SOURCE_DELTA` and empty commits are forbidden when primary write is required and no-delta is not authorized.

## Outbox transaction

1. Fetch the latest mailbox head and actual STATE blob SHA.
2. Build one immutable outbox containing exact active identity, primary evidence, validations, control evidence, plugin evidence, mailbox parent commit, STATE blob SHA, expected outbox, expected receipt, and an exact next-action code.
3. Validate the exact outbox schema.
4. Publish only the expected outbox path from a clean mailbox worktree.
5. Push fast-forward and refetch the remote outbox commit and blob.

The outbox must not claim the SHA of the commit that contains itself.

## Receipt transaction

1. Build a separate receipt after refetching the published outbox.
2. The receipt must contain exact active identity, mailbox parent commit, actual outbox publication commit, actual outbox blob SHA, actual STATE blob SHA, exact outbox path, exact receipt path, remote main commit, primary parent, exact changed paths, validation summary, plugin invocation evidence, and byte-equality result.
3. Validate the exact receipt schema.
4. Publish only the expected receipt path as a fast-forward child of the outbox publication commit.
5. Refetch the receipt and mailbox head.
6. Return user-visible bytes identical to the remote receipt.

The receipt does not contain its own publication commit SHA. The verifier proves receipt publication from remote branch ancestry and path evidence.

## Exact field semantics

- `stateBlobSha`: blob SHA of `.ai-bridge/STATE.md` read for the active epoch.
- `mailboxParentCommit`: mailbox commit fetched immediately before outbox publication.
- `outboxPublicationCommit`: commit that adds the immutable outbox.
- `outboxBlobSha`: blob SHA of the immutable outbox.
- `primaryCommitSha`: remote main commit produced by the task.
- `primaryParent`: actual first parent of the primary commit.

These fields are not interchangeable. Every SHA must match lowercase `[0-9a-f]{40}` exactly and reject known synthetic repeated placeholders.

## Report schemas

- Outbox and receipt have separate exact status-specific schemas.
- Extra keys, missing keys, wrong types, empty values, placeholders, identity mismatches, path mismatches, SHA-kind confusion, status/completion/recovery inconsistency, and arbitrary next-action prose fail closed.
- Legal success action code: `OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND`.
- Human next-action text must explicitly say that ChatGPT must independently verify the remote outbox and receipt.

## Verification and recovery

A fresh ChatGPT verifier independently checks current memory, main, mailbox, STATE, active task package, ancestry, paths, source behavior, test strength, plugin invocation, outbox, receipt, and byte equality.

It never accepts Codex prose alone. It classifies ACCEPTED, CORRECTION_REQUIRED, RECOVERY_REQUIRED, or BLOCKED_EXTERNAL, then publishes closure or a fresh task package and updates STATE last.

A false STATE blob SHA, ambiguous commit field, missing receipt, missing plugin evidence, permissive control, stale fixture, unproven mutation claim, or inconsistent release gate is RECOVERY_REQUIRED.