# Closed-Loop Bridge Publication Policy v1.3

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_10_CLOSED_LOOP_V1_3
STATUS: ACTIVE_WHEN_REFERENCED_BY_STATE
PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL_V1_3.md
CLOSED_LOOP_STATUS: IMPLEMENTATION_REQUIRED
PLUGIN_DELIVERY_LANE: SEPARATE_EXTERNAL_NON_GATING
PLUGIN_INVOCATION_REQUIRED: false
SAFARI_STATUS: N/A_PROCESS_ONLY

## Authority and lifecycle

- STATE is the only activation pointer.
- One execution epoch uses one fresh Codex conversation.
- One independent verification uses one fresh ChatGPT conversation.
- Every rejected or incomplete epoch rotates to a fresh thread, epoch, nonce, inbox, claim, outbox, and receipt.
- Codex never edits STATE.
- Plugin installation, activation, package, cache, loader, marketplace, and source work are separate and protected.
- Plugin availability is not bridge transport and cannot block this loop-only lane.
- Closed-loop completion requires implementation acceptance and a separate canary acceptance.

## Startup

Codex freshly fetches main and mailbox, reads current root authority, generic publication policy, STATE, this policy, inbox, and claim, then verifies exact cycle, generation, slot, thread, lane, task, epoch, nonce, coordinator memory revision, baseline, inbox, claim, expected outbox, expected receipt, scope, write mode, and plugin-separation flags.

Reserved outbox and receipt paths may be absent at startup. Historical artifacts never satisfy a fresh epoch.

`BLOCKED_PLUGIN_UNAVAILABLE` is illegal. No plugin activation claim or plugin invocation evidence is required. No model recommendation is required when no model-selector tool is available.

## Primary publication

`PASS_PUSHED` requires one direct-child exact-scope primary commit from the authorized baseline, a fast-forward push, fresh remote refetch, actual first-parent proof, exact changed paths, protected-path proof, and validations run from the exact committed tree.

`BLOCKED_NO_SOURCE_DELTA`, `BLOCKED_NO_REMOTE_OUTBOX`, and empty commits are forbidden when primary write is required and no-delta is not authorized.

## Outbox transaction

1. Fetch the latest mailbox head and actual STATE blob SHA.
2. Build one immutable outbox containing exact active identity, primary evidence, validations, control evidence, mailbox parent commit, STATE blob SHA, expected outbox, expected receipt, and exact next-action code.
3. Include only evidence knowable before outbox publication.
4. Validate the exact status-specific outbox schema.
5. Publish only the expected outbox path from a clean mailbox worktree.
6. Push fast-forward and refetch the remote outbox commit and blob.

The outbox must not claim the commit SHA or blob SHA created by publishing itself.

## Receipt transaction

1. Build a separate receipt after refetching the published outbox.
2. The receipt contains exact active identity, `stateBlobSha`, `mailboxParentCommit`, `outboxPublicationCommit`, `outboxBlobSha`, `primaryCommitSha`, `primaryParent`, exact outbox and receipt paths, exact changed paths, validation summary, next-action code, and byte-equality result.
3. Validate the exact receipt schema.
4. Publish only the expected receipt path as a fast-forward child of the outbox publication commit.
5. Refetch the receipt and mailbox head.
6. Return user-visible bytes identical to the remote receipt.

The receipt does not contain its own publication commit SHA. The verifier proves receipt publication from remote ancestry and exact path evidence.

## Exact field semantics

- `stateBlobSha` is the blob SHA of `.ai-bridge/STATE.md` read for the active epoch.
- `mailboxParentCommit` is the mailbox commit fetched immediately before outbox publication.
- `outboxPublicationCommit` is the commit that adds the immutable outbox.
- `outboxBlobSha` is the blob SHA of the immutable outbox.
- `primaryCommitSha` is the remote main commit produced by the task.
- `primaryParent` is the actual first parent of that primary commit.

These fields are not interchangeable. Every SHA must match lowercase `[0-9a-f]{40}` exactly. Uppercase and known repeated synthetic placeholders are rejected.

## Executable controls

- Outbox and receipt have separate exact status-specific schemas.
- Every terminal artifact matches the exact active identity from STATE, inbox, and claim.
- Every declared control calls real validator behavior with valid and adversarial fixtures.
- Unknown or unmapped controls fail closed.
- No route, identity, schema, path, publication, or acceptance control may return unconditional success.
- The canonical state set and transition table are independent from the implementation under test.
- Every legal pair and every illegal pair are tested.
- Mutation tests prove that bypassing each evaluator family causes validation failure.
- Exact primary changed paths equal actual commit evidence and remain inside frozen scope.
- Plugin paths and all other protected paths remain unchanged.
- Active STATE, inbox, claim, outbox, and receipt are absent from main.
- Outbox and receipt each change only their exact mailbox path and preserve fast-forward ancestry.

## Terminal consistency

Status, completion mode, phase, verifier classification, and next action use exact allowed combinations.

A successful receipt uses action code `OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND` and explicitly instructs the user to open a fresh ChatGPT verifier that independently checks the remote outbox and receipt.

## Completion gate

The closed-loop cycle becomes COMPLETE only after source implementation acceptance and a separate closed-loop canary acceptance are both independently recorded in STATE and live memory.

Plugin installation and installed-package acceptance belong to a separate lane and are not part of this loop completion gate.
