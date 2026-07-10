# Asynchronia ChatGPT-Codex Closed Loop v1.3

PROTOCOL_ID: ASYNCHRONIA_CLOSED_LOOP_V1_3
STATUS: ACTIVE_WHEN_REFERENCED_BY_STATE
PRIMARY_GOAL: COMPLETED_RESUMABLE_CYCLE

## Core invariants

- One execution epoch equals one fresh Codex conversation.
- One independent verification equals one fresh ChatGPT conversation.
- STATE is the only activation pointer.
- Rejected or incomplete work rotates to a fresh thread, epoch, nonce, inbox, claim, outbox, and receipt.
- Repository sources are authoritative for implementation state; live Google Drive memory is authoritative for cross-chat context and must be synchronized before handoff.
- The bridge transport and closed-loop controller must work independently of optional plugin delivery.

## Plugin separation

- Plugin installation, activation, loader telemetry, package verification, and marketplace state are separate lanes.
- Plugin availability is not bridge transport and cannot block a loop-only task.
- Text inside repository files does not prove plugin activation, but a loop-only lane does not require plugin activation evidence.
- A loop-only lane must not claim plugin activation and must not return `BLOCKED_PLUGIN_UNAVAILABLE`.
- Plugin paths are protected whenever another lane owns plugin work.
- Model recommendation is omitted when no model-selector tool is available; it is never a bridge gate.

## Immutable task identity

Every active task carries exact values for cycle, generation, slot, thread, lane, task, epoch, nonce, coordinator MEMORY_REV, baseline, inbox, claim, expected outbox, expected receipt, write mode, scope, and validation contract.

Every terminal artifact must match the exact active identity from STATE, inbox, and claim. Syntax-only identity checks are insufficient.

## Closed-loop transaction

1. ChatGPT prepares and remotely verifies inbox and claim.
2. ChatGPT updates STATE last and synchronizes live memory.
3. A fresh Codex chat receives the numbered bridge command.
4. Codex freshly fetches main and mailbox and reads current authority, STATE, inbox, and claim.
5. Codex executes one frozen task in clean worktrees.
6. Codex validates the exact committed tree.
7. Codex publishes one direct-child exact-scope primary commit when required.
8. Codex assembles an immutable outbox containing only pre-publication evidence.
9. Codex publishes and refetches the outbox.
10. Codex assembles a separate receipt containing actual outbox publication evidence.
11. Codex publishes and refetches the receipt.
12. Codex returns response bytes identical to the remote receipt.
13. A fresh ChatGPT verifier independently checks main, mailbox, outbox, receipt, and source behavior.
14. ChatGPT accepts, blocks, or creates a fresh correction, then updates STATE and memory.
15. After implementation acceptance, a separate closed-loop canary proves the full transport path.
16. The closed-loop cycle becomes COMPLETE after implementation and canary acceptance.

## Outbox and receipt

- Outbox and receipt use separate exact status-specific schemas.
- Outbox contains only values knowable before its own publication.
- Receipt contains `stateBlobSha`, `mailboxParentCommit`, `outboxPublicationCommit`, `outboxBlobSha`, `primaryCommitSha`, `primaryParent`, exact identity, exact paths, validation summary, and byte equality.
- Receipt does not require its own publication commit SHA.
- Commit and blob identities are distinct and never overloaded.
- Final Codex response is byte-identical to the remote receipt.

## Executable controls

- Every declared control calls real validation behavior with valid and adversarial fixtures.
- Unknown or unmapped controls fail closed.
- No route, identity, schema, path, publication, or acceptance control may return unconditional success.
- The canonical state set and transition table are independent from the implementation under test.
- Every legal pair and every illegal pair are tested.
- Mutation tests prove that bypassing each evaluator family causes validation failure.

## SHA and path proof

- SHA values match exact lowercase `[0-9a-f]{40}`.
- Uppercase and known repeated synthetic placeholders are rejected.
- Primary changed paths equal actual commit evidence and remain inside frozen scope.
- Protected paths remain unchanged.
- Active inbox, claim, STATE, outbox, and receipt are absent from main.
- Outbox and receipt each change only their exact mailbox path and preserve fast-forward ancestry.

## Terminal consistency

- `BLOCKED_NO_REMOTE_OUTBOX`, `BLOCKED_NO_SOURCE_DELTA`, and `BLOCKED_PLUGIN_UNAVAILABLE` are illegal for a primary-required loop-only task.
- Status, completion mode, phase, verifier classification, and next action use exact allowed combinations.
- Successful receipts use action code `OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND` and explicitly request independent verification of remote outbox and receipt.

## Completion gate

Closed-loop completion requires:
- source implementation accepted;
- separate closed-loop canary accepted;
- exact accepted state.

Plugin installation and installed-package acceptance belong to a separate lane and are not part of this loop completion gate. Product or plugin release policy may track that lane separately without preventing this cycle from reaching COMPLETE.