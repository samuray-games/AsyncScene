---
name: pipeline-state-and-resume-contract
description: Define the serialized pipeline state model, checkpoint semantics, and deterministic resume rules for Asynchronia acceptance workflows without implementing orchestration or evidence collection.
---

# Pipeline State and Resume Contract

Use this skill to define the contract for serialized pipeline state and deterministic resume behavior for one exact Asynchronia acceptance pipeline.

This skill is a contract definition only.

It does not:

- implement orchestration
- collect evidence
- create or update locks
- approve runtime work
- select a model
- execute smokes
- route failures
- manufacture acceptance
- replace the acceptance-pipeline-controller

## 1. Core objective

Define one resumable pipeline contract that:

- assigns a stable pipeline run identity
- records a schema version for the serialized state
- tracks an ordered stage list and the current checkpoint
- preserves stage and pipeline status transitions deterministically
- resumes idempotently after interruption or a new Codex session
- rejects stale, foreign, incompatible, ambiguous, or corrupted state
- prevents skipped stages and duplicate side effects
- preserves runtime approval, model-selection, lock, Safari smoke, and user-acceptance gates
- emits a bounded final state report suitable for downstream evidence collection

## 2. Boundary rules

This contract is subordinate to the acceptance controller and must not replace its orchestration role.

### 5.1 Acceptance Pipeline Controller

- `5.1` owns orchestration, stage composition, and top-level workflow sequencing.
- `5.1` may call into this contract to interpret and advance serialized state.
- `5.1` must remain the authoritative controller for workflow progression.

### 5.2 This contract

- `5.2` owns pipeline state shape, checkpoint semantics, transition rules, and resume behavior.
- `5.2` owns the meaning of stage status values and pipeline status values.
- `5.2` owns restart-versus-resume rules.

### 5.3 Evidence bundle and artifact identity

- `5.3` owns the full evidence bundle, artifact-identity contract, and evidence completeness rules.
- this contract may reference artifact identity fields but does not define the full evidence bundle.

### 5.4 Failure routing and corrective loops

- `5.4` owns detailed failure routing, corrective-loop policy, and remediation branching.
- this contract only defines when a state is resumable, blocked, or must restart.

## 3. Required serialized state

Any serialized pipeline state must include at minimum:

- `pipelineRunId`
- `pipelineContractId`
- `stateSchemaVersion`
- `contractStepId`
- `sourceRevision`
- `artifactIdentityRef`
- `authorizedScope`
- `orderedStages`
- `currentCheckpoint`
- `pipelineStatus`
- `stageStates`
- `gateStates`
- `transitionHistory`
- `lastSuccessfulStage`
- `lastTransitionAt`
- `resumeAttemptId`
- `resumePolicy`
- `restartReason`
- `finalStateReport`

### Required identity fields

- `pipelineRunId` must uniquely identify one attempt of one pipeline subject.
- `stateSchemaVersion` must identify the serialized state format.
- `contractStepId` must identify this exact `[5.2]` contract.
- `sourceRevision` must identify the source snapshot or accepted artifact revision the state belongs to.
- `artifactIdentityRef` must reference the artifact identity used by downstream evidence, but it is not the full evidence bundle.
- `authorizedScope` must record the exact bounded scope that the state was created for.

## 4. Stage model

The pipeline state must preserve an ordered list of stages.

Each stage must have:

- a stable stage id
- a stage name
- a sequence position
- a stage status
- a checkpoint boundary
- a side-effect flag
- a resumable flag
- an evidence reference set

### Ordered stages

The exact stage order is defined by the controller contract, but this state contract must preserve the order as data rather than infer it.

The current checkpoint must point to exactly one of:

- the next stage to run
- the last completed stage
- a waiting gate
- a blocked stage
- a terminal completion point

## 5. Status vocabulary

The contract uses these status values:

- `not_started`
- `running`
- `blocked`
- `waiting_for_user`
- `failed`
- `passed`
- `complete`

### Status meaning

- `not_started`: the stage has not begun execution.
- `running`: the stage is active and may still change state.
- `blocked`: the stage cannot proceed because a required dependency, gate, or prerequisite state is missing or invalid.
- `waiting_for_user`: the stage requires a user-owned action or user-owned evidence before it can continue.
- `failed`: the stage has reached a negative terminal result for the current run attempt.
- `passed`: the stage has satisfied its contract conditions for the current run attempt.
- `complete`: the stage has been fully incorporated into the pipeline's current run state and no further action remains for that stage in the current attempt.

## 6. Permitted transitions

The contract must reject any transition not listed here.

### Stage transitions

- `not_started` -> `running`
- `not_started` -> `blocked`
- `not_started` -> `waiting_for_user`
- `not_started` -> `failed`
- `running` -> `passed`
- `running` -> `blocked`
- `running` -> `waiting_for_user`
- `running` -> `failed`
- `passed` -> `complete`
- `blocked` -> `running` when the blocking condition is explicitly cleared
- `blocked` -> `failed` when the blocking condition is authoritative and terminal for the current attempt
- `waiting_for_user` -> `running` when the required user action or evidence is supplied
- `waiting_for_user` -> `failed` when the user requirement expires or is replaced by an authoritative negative condition
- `failed` -> `not_started` only under a new pipeline run identity after a restart
- `complete` -> no transition

### Pipeline transitions

- `not_started` -> `running`
- `running` -> `blocked`
- `running` -> `waiting_for_user`
- `running` -> `failed`
- `running` -> `passed`
- `passed` -> `complete`
- `blocked` -> `running` when the blocking condition is cleared
- `waiting_for_user` -> `running` when the user dependency is satisfied
- `failed` -> `not_started` only after a new pipeline run is created
- `complete` -> no transition

### Transition rules

- A stage may not jump over an earlier stage.
- A stage may not become `passed` before its prerequisites are satisfied.
- A stage may not become `complete` unless the checkpoint has advanced past it.
- A terminal `failed` state must never be silently rewritten as `passed`.
- A terminal `complete` state must never be reopened within the same run identity.

## 7. Resume contract

A resume operation must be deterministic and idempotent.

### Resume requirements

- the supplied resume target must match the stored `pipelineRunId`
- the supplied resume target must match the stored `contractStepId`
- the supplied scope must match the stored `authorizedScope`
- the supplied artifact identity must match the stored `artifactIdentityRef`
- the supplied `stateSchemaVersion` must be supported
- the supplied ordered stage list must match the stored ordered stage list
- the current checkpoint must identify a valid resume boundary
- every stage before the checkpoint must be `passed` or `complete`
- every gate that was previously required must still be present in the serialized state
- the resume action must not repeat a completed side effect

### Idempotency rules

- Replaying the same resume request against the same unchanged state must produce the same next checkpoint and the same next action.
- A completed stage must remain completed when resumed.
- A side effect guarded by a checkpoint must execute at most once per pipeline run identity.
- A resume operation may advance the checkpoint, but it may not retroactively rewrite earlier stage history except to record the new transition.

## 8. Validation rules

Before resuming, the state must be validated against the stored contract data.

### Resume target validation

- reject `foreign` state when `pipelineRunId` does not match
- reject `stale` state when the source revision, artifact identity, or checkpoint is older than the requested contract subject
- reject `incompatible` state when the schema version or ordered stage list differs
- reject `ambiguous` state when more than one checkpoint could plausibly be resumed
- reject `corrupted` state when required fields are missing, self-contradictory, or impossible

### Prerequisite validation

- reject resume when an earlier stage is still `not_started`, `running`, `blocked`, or `waiting_for_user`
- reject resume when a prerequisite gate is missing or unresolved
- reject resume when the checkpoint would skip a stage
- reject resume when the next stage would duplicate a prior side effect

### Artifact and scope validation

- reject resume when the artifact identity does not match the stored subject
- reject resume when the scope has expanded or contracted relative to the stored authorized scope
- reject resume when the resume target points at a different artifact family or different pipeline subject

## 9. Gate preservation

This contract must preserve the state of the following gates as first-class serialized data:

- runtime approval
- model selection
- workspace lock
- Safari smoke
- user acceptance

### Gate rules

- a preserved gate may remain unresolved, but it must not disappear from the resumed state
- a resolved gate must not be downgraded to unresolved without a new pipeline run identity
- a resume operation must not bypass a gate that was required before interruption
- a resume operation must not convert user-owned evidence into Codex-owned evidence
- a resume operation must not convert pending user evidence into acceptance

### Runtime approval preservation

- if runtime approval was required, the resumed state must still record whether approval exists for the exact scope
- if runtime approval is absent, the resumed state must remain blocked rather than silently continuing

### Model selection preservation

- if model selection was required for the exact scope, the resumed state must still reference the valid preflight selection
- if the selection is stale or scope-expanded, the resumed state must require a fresh preflight rather than proceed

### Lock preservation

- if the scoped lock was required, the resumed state must record whether the lock is current and owned by the same lane
- if the lock is missing, stale, or overlapped, the resumed state must block rather than synthesize ownership

### Safari smoke preservation

- if user Safari smoke is required, the resumed state must preserve that it remains user-owned
- if the smoke result is pending, the resumed state must stay pending until the user supplies the matching result

### User acceptance preservation

- if user acceptance is required, the resumed state must preserve that it cannot be self-authored
- if user acceptance is absent, the resumed state must not promote the pipeline to complete

## 10. Restart rules

The pipeline must restart rather than resume when any of the following are true:

- `stateSchemaVersion` is unsupported
- the ordered stage list has changed
- the source revision or artifact identity has changed
- the authorized scope has changed
- the checkpoint is missing, invalid, or past the end of the stage list
- the checkpoint would skip a stage or repeat a side effect
- the prior run ended in a terminal failure that cannot be resumed safely
- the preserved gate state is incompatible with the current subject
- the state is foreign, ambiguous, or corrupted

### Restart behavior

- restart creates a new `pipelineRunId`
- restart clears the prior checkpoint history for the new run identity
- restart may reuse immutable contract metadata, but not mutable run state
- restart must not masquerade as resume

## 11. Final state report

The contract must produce a bounded final state report that downstream steps can consume.

### Required report fields

- `pipelineRunId`
- `contractStepId`
- `stateSchemaVersion`
- `sourceRevision`
- `artifactIdentityRef`
- `authorizedScope`
- `finalPipelineStatus`
- `currentCheckpoint`
- `completedStages`
- `blockedStages`
- `waitingForUserStages`
- `failedStages`
- `preservedGateSummary`
- `resumeDecision`
- `restartDecision`
- `nextAction`

### Report rules

- the report must be finite and bounded
- the report must not expand into the full evidence bundle
- the report must not collapse separate gate states into one undifferentiated result
- the report must make restart versus resume explicit
- the report must preserve the exact final checkpoint
- the report must identify whether the next action belongs to Codex, the user, or a later acceptance step

## 12. Allowed rejection outcomes

When this contract is used to evaluate serialized state, an invalid resume request may be classified as:

- `BLOCKED`
- `RESTART_REQUIRED`
- `WAITING_FOR_USER`
- `STALE_STATE`

### Rejection guidance

- use `BLOCKED` when the state cannot be safely interpreted
- use `RESTART_REQUIRED` when the state must be rebuilt under a new run identity
- use `WAITING_FOR_USER` when a user-owned action or user-owned result is the only missing input
- use `STALE_STATE` when the state belongs to the wrong subject, artifact, or revision

## 13. Contract summary

This skill defines:

- what pipeline state must contain
- how stage and pipeline statuses may change
- how checkpointed resume works
- when resume is allowed
- when restart is required
- how gates are preserved
- how final bounded reports are produced

It does not define:

- orchestration sequencing
- evidence bundle shape
- failure routing details
- corrective-loop policy
- deployment handling
- runtime execution

