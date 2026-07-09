---
name: closed-loop-controller
description: Coordinate the closed-loop bridge controller contract for Asynchronia without editing runtime files or replacing subordinate acceptance, state, evidence, or failure contracts.
---

# Closed Loop Controller

Use this skill to define or validate the closed-loop bridge controller contract.

It does not:

- implement orchestration
- collect evidence
- create locks
- approve runtime work
- select a model
- execute smokes
- replace the acceptance controller
- replace the pipeline-state contract
- replace the evidence-bundle contract
- replace the failure-routing contract

## Core objective

Define a deterministic controller contract that:

- preserves one immutable run identity
- records the current bridge slot, thread, lane, task, epoch, baseline, and outbox
- validates fresh remote state before any publication
- fails closed on stale, malformed, or contradictory state
- preserves exact response bytes across publication and reply
- routes correction, recovery, and acceptance as distinct states

## Required contract surface

The controller contract must expose:

- the exact 12 legal states
- the explicit legal transition table
- the required bridgeSlot, threadId, laneId, taskId, executionEpoch, baselineSha, and expectedOutbox fields
- the required outbox report fields
- the phase-aware outbox rules
- the forbidden outcomes `BLOCKED_NO_REMOTE_OUTBOX` and `BLOCKED_NO_SOURCE_DELTA`
- recovery classification for correction, report recovery, publication recovery, and blocked external
- a separate canary gate for product acceptance
- a deterministic self-check callable by the policy validator

## Validation rules

- remote state must be freshly fetched
- the expected outbox must match the active state
- the controller must not claim success without the exact outbox
- the controller must not claim product acceptance before the canary gate passes
- a publication mismatch is terminal for the current attempt
