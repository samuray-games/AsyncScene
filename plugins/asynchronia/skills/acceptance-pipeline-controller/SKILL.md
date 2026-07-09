---
name: acceptance-pipeline-controller
description: Coordinate the complete Asynchronia acceptance workflow by composing accepted skills in order, preserving component verdicts, artifact identity, and user-owned evidence boundaries without reimplementing subordinate skill contracts.
---

# Acceptance Pipeline Controller

Use this skill to coordinate the full acceptance workflow for one exact Asynchronia task, smoke, package, milestone, or release candidate.

This skill is an orchestration contract.

It does not:

- rewrite the internal rules of any subordinate skill
- approve runtime work
- change the active Codex model
- create or update workspace locks
- implement fixes
- manufacture evidence
- flatten component verdicts into a single simplified result
- claim user-owned Safari acceptance
- promote status while required current-artifact evidence is missing

## 1. Core objective

Run one deterministic top-level workflow that:

- composes existing accepted Asynchronia skills in the correct order
- invokes only the stages that are actually applicable
- explains every intentionally omitted stage
- preserves component-level verdicts
- keeps the enclosing pipeline verdict distinct from every component verdict
- stops immediately when any required gate remains unresolved
- returns one exact next user action

## 2. Mandatory repository context

Before coordinating the pipeline:

1. Read `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md`.
2. Inspect the exact authorized scope and every cited dependency skill or evidence artifact.
3. Check current Git status and relevant scoped diffs.
4. Re-read current lock evidence before any file-changing stage begins.
5. Preserve unrelated dirty or concurrent changes.
6. Record all inspected paths and evidence sources.

## 3. Accepted subordinate skills

This controller composes only these accepted skills:

- `scope-isolation-check`
- `task-router`
- `model-selector`
- `parallel-scope-planner`
- `canon-audit`
- `economy-invariant-audit`
- `mirror-audit`
- `smoke-orchestrator`
- `deployment-verifier`
- `acceptance-evidence-gate`

Do not restate or replace their internal contracts. Use their own verdicts and boundaries as authoritative component outputs.

## 4. Supported pipeline subjects

Support at least these subjects:

- isolated plugin contract work
- non-runtime implementation acceptance
- runtime implementation acceptance
- package acceptance
- deployment acceptance
- release acceptance
- final milestone acceptance

If the subject mixes unrelated objectives or the authorized scope cannot be identified, return `BLOCKED`.

## 5. Pipeline workflow

Run the pipeline in this order.

### 1. Runtime safety classification

- Apply `scope-isolation-check` first.
- If runtime-sensitive files are required and valid same-thread scope isolation is absent, stop immediately with `BLOCKED_SCOPE_COLLISION`.
- Never treat a small, mechanical, or documentation-adjacent runtime touch as exempt.

### 2. Task classification and scope determination

- Apply `task-router` to classify the exact task and the narrowest safe workflow.
- If routing cannot determine one atomic objective and one authorized scope, stop with `BLOCKED`.
- Preserve `USER_SELECTED_UNVERIFIED` and `SELF_REPORTED_UNVERIFIED` truth labels when model identity is mentioned.

### 3. Parallel and ownership planning

- Invoke `parallel-scope-planner` only when multiple tasks, concurrent ownership, shared mirrors, shared wiring, or unresolved scope are present.
- If a single exact non-overlapping lane exists, omit this stage and explain why.
- If lock or ownership readiness remains unresolved, stop with `WAITING_ON_LOCK`.

### 4. Model recommendation discipline

- For any file-changing lane, include a `model-selector` recommendation for the exact scope.
- A model recommendation informs execution cost and reliability; it is not a separate approval gate.
- If an earlier recommendation is stale or scope-expanded, recompute it before relying on it.
- Do not emit `WAITING_FOR_MODEL_SELECTION`, `CONTINUE`, or any equivalent pause for model selection.

### 5. Workspace lock readiness

- Before implementation, confirm that the required lock evidence for the exact scope exists, is current, and does not overlap another active owner.
- The controller must not create locks itself.
- If the exact lock is missing, stale, broadened, or overlapped, stop with `WAITING_ON_LOCK`.

### 6. Scoped implementation and static validation

- Scoped implementation may proceed only inside the authorized file set after the prior gates are satisfied.
- Validate changed files appropriately.
- Check final changed files against the authorized scope.
- If changed files escape scope, static validation fails, required coverage is missing, or reported identity is unresolved, stop with `FAIL`.

### 7. Applicable domain audits

- Invoke `canon-audit` when accepted intended behavior is required to interpret the task, smoke, or evidence.
- Invoke `economy-invariant-audit` only when economy conservation, traceability, balances, transfers, settlements, refunds, remainders, or player/NPC economy parity are in scope.
- Invoke `mirror-audit` only when source/deployed parity, shared mirrors, wiring, reachability, cache-bust, release metadata parity, or deployment-facing counterparts are in scope.
- Omit every non-applicable audit and explain why it is not needed for the exact subject.
- Preserve every component audit verdict separately.

### 8. Smoke orchestration

- Invoke `smoke-orchestrator` when the task has a smoke contract, smoke evidence, nested expected failures, integration smoke requirements, or a required user runtime step.
- Preserve the difference between expected component verdicts and the enclosing smoke verdict.
- If the smallest sufficient smoke workflow ends at a user-owned runtime step not yet performed, stop with `READY_FOR_RUNTIME_SMOKE` or `PENDING_USER` as required by the evidence state.

### 9. Deployment verification

- Invoke `deployment-verifier` only when deployment evidence, entrypoint freshness, loaded asset identity, cache-bust behavior, rollout state, or release lineage is required.
- If deployment identity is stale, mixed, mismatched, or unresolved, stop without promotion.
- Do not diagnose code behavior from stale deployment evidence.

### 10. Acceptance evidence evaluation

- Invoke `acceptance-evidence-gate` for the final status-promotion decision.
- Promotion is authorized only when the gate verdict is `ACCEPT`.
- Historical evidence for older artifacts may be recorded, but must not authorize current promotion.

## 6. Applicability and omission rules

The controller must invoke only applicable stages.

When a stage is omitted, report:

- the omitted stage name
- why it does not apply to the exact current subject
- what boundary still remains delegated elsewhere

Examples:

- omit `parallel-scope-planner` when one exact non-overlapping write lane is already known
- omit `economy-invariant-audit` when no economy mutation or economy acceptance claim exists
- omit `mirror-audit` when no source/deployed counterpart or deployment-facing parity question exists
- omit `deployment-verifier` when the acceptance contract is contract-only or static-only
- omit `smoke-orchestrator` only when no smoke contract or smoke evidence is required for the current subject

## 7. Artifact identity rules

The controller must preserve one coherent current artifact identity across every applicable layer:

- source identity
- package identity
- deployment identity
- user evidence identity

When applicable, compare:

- exact task or milestone identifier
- authorized scope
- full commit SHA
- `buildTag`
- `smokeVersion`
- package name and version
- package manifest identity
- artifact hash
- deployment target
- entrypoint
- loaded asset identity
- acceptance attempt identity

Rules:

- require the full commit SHA when commit identity is part of the contract
- a cache-bust token alone is not artifact identity
- repository documentation does not create identity evidence
- a prior artifact `PASS` does not authorize the current artifact
- if identity cannot be resolved for the current artifact, stop without promotion

## 8. Evidence ownership rules

Preserve evidence ownership exactly.

- Codex owns static inspection, deterministic command output, scoped implementation, and static validation evidence
- subordinate skills own their own component verdicts
- deployment evidence does not imply runtime acceptance
- local runtime evidence does not imply deployed runtime evidence
- user Safari evidence belongs only to the user
- the controller must never invent, upgrade, or paraphrase missing user evidence into a passing result

## 9. Token and authorization rules

The controller must distinguish:

- model recommendation
- `scope-isolation-check`

Rules:

- model recommendation informs cost and reliability only
- `scope-isolation-check` determines whether the exact scope is isolated or colliding
- model-selector output is informational only and cannot authorize, pause, or resume the pipeline
- user-owned Safari evidence remains a later acceptance boundary when the task truly has a runtime surface

## 10. Mandatory stopping states

Stop immediately rather than continuing when the current pipeline state is any applicable form of:

- `WAITING_ON_LOCK`
- `BLOCKED_SCOPE_COLLISION`
- `BLOCKED`
- `FAIL`
- `READY_FOR_RUNTIME_SMOKE`
- `PENDING_USER`
- `STALE_EVIDENCE`
- deployment identity mismatch
- unresolved artifact identity
- missing required coverage

Additional rules:

- if deployment identity mismatch is reported by component evidence, do not continue into acceptance promotion
- if required coverage is missing, do not translate it into `PASS`
- if user-owned current-artifact Safari evidence is required and absent, do not continue into promotion

## 11. Nested verdict rule

Preserve these as separate outputs:

- component verdict
- enclosing smoke verdict
- deployment component verdict
- acceptance gate verdict
- final pipeline verdict

An expected nested fixture failure may remain a component `FAIL` while the enclosing integration smoke is `PASS` when detecting that failure is the intended contract.

Do not flatten or overwrite these distinctions.

## 12. Final promotion rule

The controller may authorize final promotion only when all of the following are true:

- every required prior gate completed without an unresolved stop state
- every applicable subordinate skill returned an outcome consistent with continuation
- current-artifact identity is coherent across all required layers
- stale or mismatched evidence has been rejected
- required deployment evidence is current when deployment is in scope
- required user-owned evidence is present when user acceptance is in scope
- `acceptance-evidence-gate` returns `ACCEPT`

If any required current-artifact evidence is missing, stale, mismatched, blocked, or owned by the wrong party, promotion remains `NO`.

## 13. Output contract

Return all of these fields:

- `status: ACCEPTANCE_PIPELINE_CONTROLLER`
- pipeline objective
- subject under review
- proposed promotion
- authorized scope
- scope-isolation result
- task classification result
- parallel planning result
- workspace lock result
- implementation and static validation result
- applicable stages invoked
- intentionally omitted stages
- component verdicts
- current artifact identity
- identity continuity result
- smoke orchestration result
- deployment verification result
- acceptance evidence result
- final pipeline verdict
- status promotion authorized: `YES` or `NO`
- user Safari status
- stale or mismatched evidence
- missing evidence
- failures
- blocked conditions
- preserved prior accepted versions
- preserved evidence ownership
- preserved pre-existing changes
- assumptions
- confidence
- exact next user action

## 14. Field guidance

- `status` must be `ACCEPTANCE_PIPELINE_CONTROLLER`.
- `component verdicts` must preserve each subordinate skill verdict separately.
- `intentionally omitted stages` must name each omitted stage and the exact reason it does not apply.
- `current artifact identity` must report only applicable identity markers and use `N/A` with an exact reason when a marker is genuinely inapplicable.
- `identity continuity result` must explain whether the source, package, deployment, and user evidence identities refer to the same current artifact.
- `final pipeline verdict` must use the existing canonical status names that fit the actual pipeline state.
- `status promotion authorized` must be `YES` only when the final acceptance decision is authorized for the exact current artifact.
- `user Safari status` must be `PENDING_USER` when required user-owned evidence is outstanding.
- `user Safari status` may be `N/A` when the subject has no runtime or user-acceptance surface, with an exact reason.
- `preserved prior accepted versions` must explain that historical acceptance remains recorded but is not reused as current-artifact acceptance unless identities match exactly.
- `preserved evidence ownership` must explain which evidence remains user-owned versus Codex-owned.
- `exact next user action` must be one concrete next step and must not imply that Codex performed a user-only action.

## 15. Block conditions

Return `BLOCKED` when any of these apply:

- atomic subject is ambiguous
- authorized scope is missing or mixed
- subordinate skill applicability cannot be determined safely
- current equal-authority evidence conflicts without a freshness resolution
- implementation and acceptance evaluation are mixed in one unauthorized step
- evidence ownership is disputed
- a requested acceptance rule cannot be resolved from accepted canon
- the request asks the controller to create locks, approve runtime work, invent Safari evidence, or claim user acceptance

## 16. Contract smoke examples

### Example A: contract-only non-runtime plugin task

If the subject is one isolated plugin `SKILL.md`, runtime-sensitive files are not required, task routing resolves one plugin-policy lane, exact lock readiness is satisfied, static validation passes, no deployment or Safari surface exists, `smoke-orchestrator` is omitted with reason `no smoke contract required for contract-only acceptance`, `deployment-verifier` is omitted with reason `no deployment evidence required`, and `acceptance-evidence-gate` returns `ACCEPT`, then:

- final pipeline verdict: `PASS`
- status promotion authorized: `YES`
- user Safari status: `N/A - isolated plugin contract only`

### Example B: runtime task with current static and deployment evidence but no current Safari evidence

If `scope-isolation-check` returned `SAFE_TO_PROCEED`, implementation and static validation passed, deployment identity for the current artifact is verified, required current-artifact Safari evidence is still absent, and `acceptance-evidence-gate` returns `PENDING_USER`, then:

- final pipeline verdict: `PENDING_USER`
- status promotion authorized: `NO`
- exact next user action: run the required Safari smoke for the current artifact and return the complete result

### Example C: stale prior-artifact Safari evidence

If a prior artifact already passed Safari, the current full SHA, `buildTag`, or `smokeVersion` differs, and no fresh matching current-artifact Safari evidence exists, then:

- stale or mismatched evidence must identify the older artifact exactly
- final pipeline verdict: `STALE_EVIDENCE`
- status promotion authorized: `NO`
- do not classify the situation as a new code `FAIL`

### Example D: expected nested fixture failure inside a passing integration smoke

If a component smoke or audit intentionally returns `FAIL` for a negative fixture, and `smoke-orchestrator` confirms that detecting this failure is the tested behavior of the enclosing integration smoke, then:

- the component verdict remains `FAIL`
- the enclosing smoke verdict may be `PASS`
- the final pipeline verdict depends on the full acceptance contract, not on the inner fixture verdict alone
