# Asynchronia ChatGPT-Codex Closed Loop v1.2

PROTOCOL_ID: ASYNCHRONIA_CLOSED_LOOP_V1_2
STATUS: ACTIVE_WHEN_REFERENCED_BY_STATE
PRIMARY_GOAL: COMPLETED_RESUMABLE_CYCLE

## Core invariants

- One execution epoch equals one fresh Codex conversation.
- One independent verification equals one fresh ChatGPT conversation.
- Rejected or incomplete work always rotates to a new thread, epoch, nonce, inbox, claim, outbox, and receipt.
- STATE is the only activation pointer.
- Repository sources are authoritative for implementation state; live Google Drive memory is authoritative for cross-chat context and must be synchronized before handoff.
- Product work remains blocked until implementation, installed-package verification, and a separate canary are independently accepted.

## Actual plugin invocation

- Text such as `Use @asynchronia.` inside an inbox or repository file is inert text and does not activate a plugin.
- The user must actually invoke or select `@asynchronia` in the Codex composer before sending the numbered bridge command.
- Ordinary tasks require installed-plugin evidence. Source fallback is legal only for an explicitly authorized plugin-repair task.
- A missing installed plugin produces a complete mailbox blocker, never an invented activation claim.

## Immutable identity

Every active task carries exact values for cycle, generation, slot, thread, lane, task, epoch, nonce, coordinator MEMORY_REV, baseline, inbox, claim, expected outbox, expected receipt, write mode, scope, plugin route, and validation contract.

The verifier rejects syntax-only or partial identity. Every terminal artifact must match the exact active identity from STATE, inbox, and claim.

## Codex transaction

1. Freshly fetch main and mailbox.
2. Read current authority, STATE, inbox, and claim.
3. Verify exact identity and reserved outbox/receipt paths.
4. Prove actual plugin invocation and route through task-router, scope-isolation-check, model-selector, conditional parallel-scope-planner, closed-loop-controller, failure-routing-and-corrective-loop, then routed skills.
5. Execute one frozen task in clean worktrees.
6. Validate the exact committed tree.
7. Publish one direct-child exact-scope primary commit when required.
8. Build an immutable outbox containing only pre-publication evidence, exact identity, mailbox parent commit, and actual STATE blob SHA.
9. Publish and refetch the outbox.
10. Build a separate receipt containing the outbox publication commit, outbox blob SHA, mailbox parent commit, STATE blob SHA, exact identity, exact outbox and receipt paths, remote main commit, and byte equality.
11. Publish and refetch the receipt.
12. Return response bytes identical to the remote receipt.

## SHA and path semantics

- Commit and blob SHAs are distinct fields and must match lowercase `[0-9a-f]{40}` exactly.
- Uppercase values and known synthetic repeated patterns are forbidden.
- `stateBlobSha`, `mailboxParentCommit`, `outboxPublicationCommit`, `outboxBlobSha`, `primaryCommitSha`, and `primaryParent` have separate meanings and may not be overloaded.
- Changed paths must equal actual commit evidence and remain inside frozen scope.
- Active inbox, claim, STATE, outbox, and receipt artifacts must be absent from main.

## Schemas and controls

- Outbox and receipt use separate exact status-specific schemas.
- Forbidden terminal statuses include `BLOCKED_NO_REMOTE_OUTBOX` and `BLOCKED_NO_SOURCE_DELTA`.
- Status, completion mode, current phase, recovery class, and acceptance fields must be mutually consistent.
- Every declared control must execute real validation logic with valid and adversarial fixtures.
- Unknown, missing, or unmapped controls fail closed.
- An immutable canonical state set and transition table must be tested independently of the implementation table.
- Real mutation tests must prove that bypassing identity, SHA, path, route, publication, receipt, or release-gate checks makes validation fail.

## Three-stage release gate

Product work requires all of:
- `implementationAccepted: true`;
- `installedPackageAccepted: true`;
- `canaryAccepted: true`;
- exact accepted state.

No earlier stage may be inferred from another.

## ChatGPT verification

A fresh verifier reloads live memory, fetches current main and mailbox, reads the active task package, outbox, and receipt, and independently verifies identity, ancestry, parent, exact paths, protected paths, source behavior, tests, validator strength, plugin evidence, publication evidence, and byte equality.

It classifies ACCEPTED, CORRECTION_REQUIRED, RECOVERY_REQUIRED, or BLOCKED_EXTERNAL, then publishes closure or a fresh task package, updates STATE last, updates and refetches live memory, and prepares the next action.

## Exact next action

A successful receipt must contain a machine-readable action code and precise human text instructing the user to open a fresh ChatGPT verifier and send the same numbered bridge command. Non-empty arbitrary prose is not sufficient.