# Closed Loop Protocol

CLOSED LOOP

BRIDGE_PROTOCOL: 3.3
CONTRACT_VERSION: 1.0.0
POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_CLOSED_LOOP_V1
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
- baseline sha
- expected outbox
- remote state sha
- completion mode
- result status
- next action

## Validation

- fresh remote state is required before publication
- the outbox path must end in `-02-codex.md`
- the controller must fail closed on stale or contradictory state
- success requires exact outbox identity and byte equality
