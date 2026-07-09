CLOSED LOOP

BRIDGE_PROTOCOL: 3.3
CONTRACT_VERSION: 1.0.1
POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_CLOSED_LOOP_V1_1
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
