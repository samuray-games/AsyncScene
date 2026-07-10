CLOSED LOOP

BRIDGE_PROTOCOL: 3.3
CONTRACT_VERSION: 1.0.2
POLICY_VERSION: CODEX_AUTOPILOT_2026_07_10_CLOSED_LOOP_V1_2
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
EMPTY_OUTBOX: FORBIDDEN
FINAL_RESPONSE_OUTBOX_IDENTITY: REQUIRED

## Purpose

This protocol defines the deterministic closed-loop bridge controller surface used by the Slot 3 correction task.

## Required identity

The current bridge state must preserve:

- bridge slot
- thread id
- lane id
- task id
- execution epoch
- task nonce
- coordinator memory revision
- baseline sha
- inbox path
- claim path
- expected outbox path
- remote state sha
- completion mode
- result status
- next action
- current state

## Legal machine

The legal states are:

- CLOSED
- PREPARING
- READY_FOR_CODEX
- EXECUTING
- PRIMARY_PUBLISHED
- OUTBOX_PUBLISHING
- AWAITING_CHATGPT_VERIFICATION
- ACCEPTED
- CORRECTION_REQUIRED
- RECOVERY_REQUIRED
- BLOCKED_EXTERNAL
- SUPERSEDED

The controller must enforce the exact transition table encoded in `tools/closed_loop_contract.py`.

## Validation

- fresh remote state is required before publication
- the outbox path must end in `-02-codex.md`
- the controller must fail closed on stale or contradictory state
- the report schema must reject missing keys, extra keys, wrong types, empty values, and placeholder values
- success requires exact outbox identity and byte equality
- the canary gate is separate from product acceptance
- all legal transitions and all illegal transition pairs must be exercised by validation
- unknown control names must fail closed
- terminal publication proof uses an immutable outbox plus separate receipt, not a self-referential commit field

## Bridge 062 plugin-independent closed-loop correction

BRIDGE-20260710-062 uses execution epoch CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST and baseline 32513f02daf5943c41f24328e1ae251d6bc85ccc.
The terminal success action code is exactly OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND.
This lane uses plugin-independent bridge transport: source implementation acceptance and separate canary acceptance are required before closed-loop completion; plugin installation and plugin package acceptance are outside this gate.
Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main; ChatGPT publishes mailbox artifacts after independent PR verification and merge.
