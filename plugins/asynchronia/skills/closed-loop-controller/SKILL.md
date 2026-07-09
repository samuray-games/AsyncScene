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

## Boundaries

This skill is subordinate to:

- `acceptance-pipeline-controller`
- `pipeline-state-and-resume-contract`
- `evidence-bundle-and-artifact-identity`
- `failure-routing-and-corrective-loop`

It must not redefine their schemas or verdicts.

## Required fields

Any closed-loop controller report must preserve:

- `bridgeSlot`
- `threadId`
- `laneId`
- `taskId`
- `executionEpoch`
- `baselineSha`
- `expectedOutbox`
- `remoteStateSha`
- `policyVersion`
- `completionMode`
- `resultStatus`
- `nextAction`

## Validation rules

- remote state must be freshly fetched
- the expected outbox must match the active state
- the controller must not claim success without the exact outbox
- a publication mismatch is terminal for the current attempt

