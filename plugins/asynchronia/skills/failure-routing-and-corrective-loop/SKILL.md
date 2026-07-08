---
name: failure-routing-and-corrective-loop
description: Define deterministic failure classification, next-action routing, bounded corrective-loop limits, and fail-closed escalation rules for Asynchronia acceptance workflows without implementing orchestration or persistence.
---

# Failure Routing and Corrective Loop

Use this skill to define the contract for deterministic failure routing and bounded corrective loops for one exact Asynchronia acceptance workflow.

This skill is a contract definition only.

It does not:

- implement orchestration
- implement persistence
- collect evidence
- create or update locks
- approve runtime work
- select a model
- execute smokes
- manufacture acceptance
- replace the acceptance-pipeline-controller
- replace the pipeline-state-and-resume contract
- replace the evidence-bundle and artifact-identity contract
- replace the acceptance-evidence-gate

## 1. Core objective

Define one finite failure-routing contract that:

- classifies failures into a bounded taxonomy
- maps each failure class to one deterministic next action
- distinguishes retry, correction, scope revalidation, resume, restart, block, cancel, and terminal stop
- preserves identity for the pipeline run, roadmap step, failed attempt, failure reason, corrective action, evidence, artifact, and decision
- limits corrective loops with explicit no-progress, repetition, and oscillation controls
- fails closed when the failure state is unknown, malformed, contradictory, stale, or ambiguous
- keeps routing idempotent for the same input state
- explains why the chosen next action is retry, correct, revalidate, resume, restart, block, or terminate

## 2. Boundary rules

This contract is subordinate to the acceptance controller and must not replace its orchestration role.

### 5.1 Acceptance Pipeline Controller

- `5.1` owns orchestration, stage composition, and top-level workflow sequencing.
- `5.1` consumes this contract to determine the next action after a failure.
- `5.1` must remain the authoritative controller for workflow progression.

### 5.2 Pipeline State and Resume Contract

- `5.2` owns serialized pipeline state, checkpoint semantics, and deterministic resume behavior.
- `5.4` decides which state transition is required after failure.
- `5.4` must not redefine checkpoint storage, checkpoint shape, or resume validity.

### 5.3 Evidence Bundle and Artifact Identity

- `5.3` owns evidence-bundle structure, artifact identity, truth levels, lineage, provenance, freshness, completeness, and mismatch semantics.
- `5.4` consumes evidence mismatch, stale evidence, incomplete evidence, and verifier failure reasons.
- `5.4` must not redefine evidence schema or artifact identity schema.

### Acceptance evidence gate

- `acceptance-evidence-gate` owns acceptance-promotion and rejection decisions.
- `5.4` consumes its deterministic failure reasons.
- `5.4` must not override acceptance decisions or invent acceptance evidence.

### Runtime safety gate

- `scope-isolation-check` owns scope isolation requirements.
- `5.4` may route to approval-required or approval-invalidated states.
- `5.4` must not bypass or redefine scope isolation.

### Parallel scope planner

- `parallel-scope-planner` owns overlap and serialization analysis.
- `5.4` may route to waiting-on-lock, lock-conflict, or scope-revalidation outcomes.
- `5.4` must not replace ownership analysis or lock policy.

## 3. Failure taxonomy

The contract uses a finite failure taxonomy.

Each failure must be classified into exactly one primary class:

- `retryable_failure`
- `corrective_action_required`
- `scope_revalidation_required`
- `lock_missing`
- `lock_expired`
- `lock_revalidation_required`
- `active_lock_conflict`
- `runtime_approval_required`
- `user_action_required`
- `external_dependency_block`
- `terminal_failure`
- `cancellation`
- `superseded_attempt`

### Primary class meanings

- `retryable_failure`: the same exact action may be tried again without changing scope or artifact identity.
- `corrective_action_required`: the failure requires an explicit content, evidence, wiring, or configuration correction before the same stage can continue.
- `scope_revalidation_required`: the authorized scope, artifact identity, or ownership boundary changed and must be revalidated before further progress.
- `lock_missing`: no valid active workspace lock exists for the exact write scope, and no conflicting owner is necessarily present.
- `lock_expired`: a previously valid lock exists, but its expiry time has passed.
- `lock_revalidation_required`: lock identity, owner, scope, revision, or status is stale, ambiguous, malformed, or mismatched.
- `active_lock_conflict`: another current ACTIVE lock overlaps the intended write scope or serialized ownership group.
- `runtime_approval_required`: the failure cannot proceed until scope isolation exists for the exact sensitive scope.
- `user_action_required`: the next action depends on user-owned evidence, user acceptance, or another user-only step.
- `external_dependency_block`: the workflow is blocked by an unavailable external dependency, service, or environment prerequisite.
- `terminal_failure`: the condition is authoritative, non-recoverable for the current attempt, and must stop.
- `cancellation`: the attempt was intentionally stopped by an authorized actor or superseded by a deliberate cancel.
- `superseded_attempt`: a later attempt, state, artifact, or route has replaced the current attempt.

## 4. Deterministic routing

For any valid failure state, the same input must produce the same next action.

The next action must be one of:

- `retry`
- `retry_with_correction`
- `ACQUIRE_LOCK_REQUIRED`
- `REACQUIRE_LOCK_REQUIRED`
- `LOCK_REVALIDATION_REQUIRED`
- `WAITING_ON_LOCK`
- `SCOPE_REVALIDATION_REQUIRED`
- `wait_for_runtime_approval`
- `wait_for_user`
- `wait_for_dependency`
- `resume`
- `restart`
- `block`
- `cancel`
- `terminate`

### Routing rules

- `retryable_failure` -> `retry`
- `corrective_action_required` -> `retry_with_correction`
- `scope_revalidation_required` -> `SCOPE_REVALIDATION_REQUIRED`
- `lock_missing` -> `ACQUIRE_LOCK_REQUIRED`
- `lock_expired` -> `REACQUIRE_LOCK_REQUIRED`
- `lock_revalidation_required` -> `LOCK_REVALIDATION_REQUIRED`
- `active_lock_conflict` -> `WAITING_ON_LOCK`
- `runtime_approval_required` -> `wait_for_runtime_approval`
- `user_action_required` -> `wait_for_user`
- `external_dependency_block` -> `wait_for_dependency`
- `terminal_failure` -> `terminate`
- `cancellation` -> `cancel`
- `superseded_attempt` -> `restart`

### Lock routing rules

- `scope_revalidation_required` -> `SCOPE_REVALIDATION_REQUIRED` when the lock question is caused by a changed or unresolved scope rather than a lock-state defect.
- A valid exact-scope ACTIVE lock with no overlap is not a failure and must continue without corrective lock routing.
- The four lock conditions must remain mutually distinguishable:
  - no lock exists -> `lock_missing`
  - a prior lock expired -> `lock_expired`
  - lock evidence is stale or unverifiable -> `lock_revalidation_required`
  - another ACTIVE lock conflicts -> `active_lock_conflict`

### Determinism rules

- A failure reason must not map to more than one next action within the same contract version.
- A next action must not depend on hidden state that is not recorded in the failure record or routing state.
- Replaying the same failure state must produce the same route unless a newer authoritative state invalidates the original attempt.
- An identical failure after correction may route differently only when the corrected artifact identity, scope, or evidence identity has changed in a recorded way.

## 5. Corrective-loop identity

Each corrective loop must preserve a bounded identity record containing at minimum:

- `pipelineRunId`
- `roadmapStepId`
- `failedAttemptId`
- `failureCode`
- `failureReason`
- `correctiveActionId`
- `correctiveActionSummary`
- `correctedArtifactIdentity`
- `evidenceIdentity`
- `loopCount`
- `detectedAt`
- `routedAt`
- `decisionActor`
- `decisionSource`

### Identity rules

- `pipelineRunId` identifies the top-level attempt.
- `roadmapStepId` identifies the exact step or checkpoint that failed.
- `failedAttemptId` identifies the concrete attempt that failed.
- `failureCode` identifies the deterministic failure classification.
- `failureReason` is the human-readable explanation of the failure.
- `correctiveActionId` identifies the chosen correction or revalidation action.
- `correctedArtifactIdentity` identifies the artifact identity after correction, if any.
- `evidenceIdentity` identifies the evidence bundle or evidence reference affected by the failure.
- `loopCount` counts how many corrective loops have been entered for the same logical failure family.
- `decisionActor` identifies Codex, the user, or another authorized controller role that made the routing decision.
- `decisionSource` records whether the route came from an audit result, smoke result, verifier result, approval result, or state transition.

## 6. Bounded-loop rules

The contract must prevent infinite retry and unbounded correction.

### Loop controls

- Every routable failure must have a maximum loop count.
- The maximum loop count must be recorded in the failure-routing state.
- Repeated identical failures must increment the loop count.
- A no-progress loop must be detected when the same failure recurs without a meaningful change in artifact identity, evidence identity, scope, or external dependency state.
- An oscillation must be detected when two or more failure states alternate without advancing toward a terminal resolution.
- A correction that fails to change the underlying cause counts as no progress.
- Exceeding the loop limit must route to `terminate` or `block`, not another retry.

### Loop limit rules

- The maximum loop count must be finite.
- The contract must define the stop condition for a repeated identical failure.
- The contract must define the stop condition for a no-progress sequence.
- The contract must define the stop condition for an oscillating sequence.
- The contract must define when escalation to a terminal failure is mandatory.

## 7. Retry versus correction

Retry and correction are distinct.

### Retry

- Retry re-executes the same action without changing the artifact identity, scope, or evidence contract.
- Retry is appropriate only when the failure is transient and the prior attempt remains valid.
- Retry must not silently mutate the route into a correction.

### Retry with correction

- Retry with correction requires an explicit change to content, evidence, wiring, configuration, or another accepted corrective target.
- Retry with correction must record the corrective action and the corrected artifact identity.
- Retry with correction must revalidate the changed artifact or evidence before the next stage proceeds.

### Correction rules

- If the correction changes artifact identity, downstream evidence tied to the old identity becomes stale until revalidated.
- If the correction changes runtime-sensitive scope, scope isolation must be revalidated.
- If the correction changes ownership or scope boundaries, scope revalidation is required before further progress.

## 8. Restart versus resume

The routing boundary between restart and resume is explicit.

- `resume` is used when the existing pipeline run identity remains valid and the stored state can continue from a valid checkpoint.
- `restart` is used when the attempt identity, artifact identity, or route state is no longer valid for continued progression.
- `superseded_attempt` always routes to `restart`.
- `scope_revalidation_required` may route to `restart` when the corrected scope cannot safely continue from the previous checkpoint.
- A state that is resumed must remain on the same pipeline run identity.
- A state that is restarted must create or reference a new attempt identity under the accepted higher-level workflow.

## 9. Preservation and invalidation

### Evidence

- Evidence must be preserved when the failure can be resolved without changing the underlying evidence identity.
- Evidence becomes invalid when the corrected artifact identity, scope, environment, or acceptance attempt no longer matches the original evidence.
- Stale or mismatched evidence must not be reused as current evidence.

### Artifact identity

- Artifact identity must be preserved when the correction does not alter the artifact.
- Artifact identity becomes invalid when a correction changes the artifact, package, deployment, or runtime surface.
- Downstream evidence tied to the prior artifact identity becomes stale until revalidated.

### Runtime approval

- Runtime approval must be preserved when the corrected scope remains the same runtime-sensitive scope.
- Runtime approval becomes invalid when the correction changes the runtime-sensitive scope, runtime entrypoint, or runtime ownership.

### Workspace lock

- A valid lock must be preserved only while the owned scope remains unchanged and the lock remains current.
- A lock must be revalidated when ownership, scope, or timing changes.
- An expired or conflicting lock must not be collapsed into a generic catch-all.
- A valid exact-scope ACTIVE lock with no overlap is not a failure and must not trigger corrective routing.

### Model selection

- Model selection must be preserved across routing decisions for the same unchanged scope.
- A scope change, restart, or contract expansion requires a fresh model-selection boundary if the higher-level workflow requires it.

### User acceptance

- User acceptance is invalidated when the corrected artifact identity changes or when the attempt is no longer the exact current attempt.
- A user acceptance result for one artifact or attempt must not be reused for another.

### Checkpoint state

- Checkpoint state remains authoritative only when the failure can be resolved within the same valid pipeline run identity.
- A restart invalidates the previous checkpoint as a continuation point.

## 10. Ownership and completion

### Corrective-action ownership

- Each corrective action must have a clear owner.
- The owner must be one of: controller, Codex, user, external dependency, or approval gate.
- The contract must identify what completion evidence is required for the corrective action to be considered complete.

### Completion criteria

- A corrective action is complete only when the routed condition has been resolved or revalidated.
- A corrective action is not complete merely because it was attempted.
- A correction that did not change the failure cause is incomplete for loop-control purposes.

## 11. Auditability

The contract must explain all routing decisions.

For each failure, the routing record must be able to answer:

- what failed
- why it failed
- who or what detected it
- which artifact or evidence was affected
- which corrective action was selected
- why retry, retry with correction, revalidate, resume, restart, block, cancel, or terminate was chosen
- how many loop iterations occurred

Auditability requires the record to preserve:

- failure code
- failure reason
- detection source
- decision actor
- decision timestamp
- route outcome
- loop count
- affected identities

For every lock-related failure, the record must also preserve:

- relevant lock ID, when one exists
- lock owner, when known
- requested scope
- conflicting or mismatched scope
- observed status
- observed expiry
- detector identity
- detection timestamp
- selected route
- reason the other lock routes were not selected

## 12. Fail-closed behavior

Unknown, malformed, contradictory, stale, or ambiguous failure states must fail closed.

### Fail-closed rules

- If the failure code is unknown, route to `block`.
- If the failure reason is contradictory, route to `block`.
- If the artifact identity is unresolved, route to `scope_revalidation_required` or `block` depending on whether identity can be recovered safely.
- If evidence ownership is unclear, route to `block`.
- If the lock state cannot be trusted, route to `LOCK_REVALIDATION_REQUIRED` or `block`.
- If scope isolation is required but absent, route to `wait_for_runtime_approval`.
- If the state is superseded, route to `restart`.
- If the failure state is terminal, do not retry.

## 13. Supported failure cases

This contract must route at least the following cases:

- static validation failure -> `corrective_action_required`
- contract smoke failure -> `corrective_action_required`
- runtime smoke failure -> `corrective_action_required`
- Safari user smoke failure -> `user_action_required`
- canon conflict -> `terminal_failure`
- mirror mismatch -> `scope_revalidation_required`
- source/package/install parity failure -> `corrective_action_required`
- missing evidence -> `user_action_required`
- stale evidence -> `scope_revalidation_required`
- artifact identity mismatch -> `scope_revalidation_required`
- verifier identity failure -> `terminal_failure`
- no lock exists -> `lock_missing`
- prior lock expired -> `lock_expired`
- lock evidence is stale, unverifiable, or mismatched -> `lock_revalidation_required`
- another ACTIVE lock overlaps the scope -> `active_lock_conflict`
- scope isolation missing or invalidated -> `runtime_approval_required`
- scope expansion -> `scope_revalidation_required`
- dependency unavailable -> `external_dependency_block`
- user acceptance missing -> `user_action_required`
- repeated identical failure -> `terminal_failure` or `block` after the loop limit is exceeded
- correction that changes artifact identity -> `scope_revalidation_required`
- correction that changes runtime-sensitive scope -> `runtime_approval_required` if approval is missing, otherwise `scope_revalidation_required`
- no-progress corrective loop -> `terminal_failure`
- oscillating failure sequence -> `terminal_failure`
- terminal unsupported condition -> `terminal_failure`

## 14. Output contract

Return all of these fields:

- `status: FAILURE_ROUTING_AND_CORRECTIVE_LOOP`
- task objective
- authorized scope
- failure taxonomy
- routing decision responsibility
- corrective-loop responsibility
- maximum-loop and no-progress responsibility
- repeated-failure detection
- oscillation detection
- retry versus correction semantics
- restart versus resume routing boundary
- evidence preservation and invalidation
- artifact-identity preservation and invalidation
- runtime-approval preservation and invalidation
- workspace-lock preservation and revalidation
- model-selection preservation
- user-acceptance invalidation
- checkpoint-state relationship
- idempotency
- auditability
- fail-closed behavior
- `[5.1]` boundary
- `[5.2]` boundary
- `[5.3]` boundary
- `acceptance-evidence-gate` relationship
- `scope-isolation-check` relationship
- `parallel-scope-planner` relationship
- supported failure cases
- deterministic next-action mapping
- bounded-loop rules
- preservation rules
- invalidation rules
- lock-related audit fields
- assumptions
- confidence
- exact next user action

## 15. Field guidance

- `status` must be `FAILURE_ROUTING_AND_CORRECTIVE_LOOP`.
- The contract must remain finite and deterministic.
- The contract must not define orchestration, persistence, evidence schema, or acceptance promotion.
- The contract must keep routing decisions idempotent for unchanged inputs.
- The contract must fail closed for unknown or ambiguous failure states.
- The exact next user action must be the next actionable step in the workflow, not an implementation fix.
