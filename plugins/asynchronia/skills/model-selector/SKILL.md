---
name: model-selector
description: Run the mandatory blocking model preflight for every Asynchronia Codex task, recommend the cheapest reliable model and reasoning level for the exact scope, and wait for same-thread CONTINUE before implementation.
---

# Model Selector

Use this skill automatically for every Asynchronia task before implementation, validation, publication, or any other state-changing work.

This skill cannot inspect, verify, or change the actual model selected in the Codex interface. The user selects the model. The skill controls only the required preflight recommendation and pause contract.

## 1. Mandatory preflight state machine

The legal states are:

1. `PREFLIGHT_REQUIRED`
2. `MODEL_RECOMMENDATION_READY`
3. `WAITING_FOR_MODEL_SELECTION`
4. `CONTINUE_RECEIVED`
5. `SCOPE_REVALIDATED`
6. `IMPLEMENTATION_ALLOWED`

Before `IMPLEMENTATION_ALLOWED`, Codex must not:

- edit files;
- create or modify workspace locks;
- run state-changing commands;
- implement code or documentation changes;
- commit, push, publish, merge, rebase, reset, stash, clean, amend, or cherry-pick;
- claim implementation or validation completion.

A valid preflight response must end with exactly one standalone fenced code block whose only content is `CONTINUE`. No text may follow that block.

Only exact trimmed `CONTINUE` from the user in the same thread advances the state to `CONTINUE_RECEIVED`.

After `CONTINUE`, Codex must revalidate the task identity, branch authority, exact scope, mirrors, shared wiring, dependencies, and required systems. If anything material changed, return to `PREFLIGHT_REQUIRED` and issue a fresh recommendation.

`CONTINUE` from another conversation, a previous task, a previous scope, or before a valid recommendation is invalid.

## 2. Automatic invocation contract

The Asynchronia plugin must be resolved automatically for every Asynchronia task.

Use the active installed package when available. If loader attachment or telemetry is unavailable, use the repository skill source under `plugins/asynchronia/skills/` as the mandatory fallback.

Manual UI attachment is optional context only. Missing manual attachment is not a valid reason to skip this skill or block the task.

The required ordered preflight route is:

1. `task-router`
2. `scope-isolation-check`
3. `model-selector`
4. `parallel-scope-planner` when multiple lanes, mirrors, shared ownership, or dependencies exist
5. specialized skills required by routing
6. pause for same-thread `CONTINUE`

## 3. Allowed model set

Only these model names are valid:

- `GPT-5.5`
- `GPT-5.4`
- `GPT-5.4-Mini`

Only these reasoning levels are valid:

- `Light`
- `Medium`
- `High`
- `Extra High`

Never invent another model or reasoning level.

## 4. Selection objective

Optimize for `MINIMIZE_EXPECTED_USER_TOKEN_COST`.

Choose the cheapest candidate expected to complete the exact task correctly without a likely retry.

Reliability is a hard constraint, but extra capability or reasoning must not be selected merely for comfort, prestige, unspecified safety margin, or file count.

Use this qualitative model:

`expected total cost = initial attempt cost + retry probability x retry cost + likely escalation cost`

Promote only when the next cheaper plausible pair has a concrete task-specific failure mode.

## 5. Required task analysis

Evaluate:

- task type and exact objective;
- exact authorized read and write scope;
- runtime sensitivity;
- systems involved;
- novelty and ambiguity;
- architectural, economic, security, and release impact;
- concurrency, mirror, stable-read, and shared-wiring risk;
- validation complexity;
- expected retry cost;
- similar completed work;
- deterministic versus exploratory work;
- tool orchestration burden.

Return `status: BLOCKED` when scope or task identity is missing, mixed, ambiguous, conflicting, or dependent on unavailable authority.

## 6. Model and reasoning guidance

### GPT-5.4-Mini

Use for mechanical documentation, exact text insertion, narrow manifest edits, simple static checks, tiny isolated copy changes, and deterministic repetition.

### GPT-5.4

Use for ordinary implementation, related multi-file work, plugin policy design, moderate repository analysis, scoped UI changes, non-trivial tests, and moderate concurrency handling.

### GPT-5.5

Use only for a demonstrated capability gap in GPT-5.4, such as broad architecture synthesis, severe ambiguity, complex multi-system debugging, economy-critical design, persistence migration, security-critical work, or repeated unchanged-scope failure at the cheaper tier.

### Light

Use for fully mechanical, tiny, exact, trivially validated work.

### Medium

Use for known patterns, limited reasoning, several related checks, and moderate validation.

### High

Use only when non-trivial dependencies, important invariants, mirror or concurrency analysis, or significant validation create a concrete Medium-level failure mode.

### Extra High

Use only when a concrete material failure mode remains even at High, such as architecture-critical synthesis, security-critical analysis, economy-critical causal reasoning, or difficult runtime diagnosis.

Model-family escalation and reasoning escalation are independent. Do not raise both automatically.

## 7. Required recommendation report

Return all of the following before the pause:

- `status: WAITING_FOR_MODEL_SELECTION`
- optimization objective: `MINIMIZE_EXPECTED_USER_TOKEN_COST`
- evaluated pair count: `12/12`
- task identity and classification
- exact analyzed scope
- plugin source used
- ordered skills invoked so far
- risk level
- analyzed factors
- pair evaluation matrix
- sufficient pairs
- rejected pairs
- non-dominated frontier
- cheapest plausible candidate
- cheapest rejected candidate
- concrete rejection failure mode
- recommended model
- recommended reasoning level
- next more expensive plausible candidate
- why weaker options are insufficient
- why stronger options are unnecessary
- capability bottleneck
- reasoning bottleneck
- retry-cost assessment
- estimated retry risk
- overprovisioning check
- confidence
- actual active model: `USER_SELECTED_UNVERIFIED`
- exact next user action: switch the Codex interface to the recommended pair, then send exact `CONTINUE` in this same conversation

The report must compare adjacent plausible candidates and stop at the first pair meeting the reliability threshold.

If a recommendation lacks concrete justification against the next cheaper plausible candidate, return `OVERPROVISIONED_RECOMMENDATION` and do not allow implementation.

## 8. Terminal response contract

The preflight response must end exactly as follows, with no text after it:

```text
CONTINUE
```

Failure statuses:

- `FAIL_MODEL_PREFLIGHT_NOT_PAUSED`: recommendation did not pause correctly
- `FAIL_CONTINUE_BLOCK_MISSING`: terminal standalone block is absent or malformed
- `FAIL_IMPLEMENTED_BEFORE_CONTINUE`: any state-changing work occurred before valid continuation
- `FAIL_CONTINUE_WRONG_THREAD`: continuation came from another conversation
- `FAIL_SCOPE_CHANGED_AFTER_RECOMMENDATION`: material scope changed and preflight was not rerun
- `FAIL_PLUGIN_ROUTING_SKIPPED`: plugin routing or repository fallback was skipped

## 9. Post-CONTINUE evidence

Before implementation begins, record:

- recommendation identity;
- same-thread continuation evidence;
- unchanged task identity;
- unchanged or freshly recomputed scope;
- selected model status as `USER_SELECTED_UNVERIFIED` unless externally proven;
- `scope-isolation-check` result;
- required specialized skills;
- implementation authorization status: `IMPLEMENTATION_ALLOWED`.

The final task report must include the preflight recommendation, continuation evidence, and proof that implementation started only after `IMPLEMENTATION_ALLOWED`.
