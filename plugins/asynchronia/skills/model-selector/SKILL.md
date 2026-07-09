---
name: model-selector
description: Recommend the cheapest reliable Codex model and reasoning level for the exact Asynchronia task scope without claiming control or verification of the active UI-selected model.
---

# Model Selector

Use this skill for Asynchronia tasks that need a model recommendation before implementation, review, or validation work.

The skill recommends a model and reasoning level only. It cannot inspect, verify, or change the actual model selected in the Codex interface.
It is informational only and must never create a pause, stop, continuation token, or execution prerequisite.

## 1. Allowed model set

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

## 2. Default objective

Optimize for `MINIMIZE_EXPECTED_USER_TOKEN_COST`.

Choose the cheapest candidate expected to complete the exact task correctly without a likely retry.

Reliability remains a hard constraint, but extra capability or extra reasoning must never be selected merely for comfort, caution, prestige, or an unspecified safety margin.

Treat cost as qualitative expected total cost:

`expected total cost = initial attempt cost + retry probability × retry cost + likely escalation cost`

Do not automatically choose the strongest model.

Promote to a stronger candidate only when task analysis justifies it through a concrete failure mode in the next cheaper plausible candidate.

## 3. Required task analysis

Before recommending a model, evaluate:

- task type
- exact authorized file scope
- runtime sensitivity
- number of systems involved
- novelty
- ambiguity
- architectural impact
- economic impact
- security impact
- concurrency risk
- mirror synchronization
- validation complexity
- expected cost of failure or retry
- existence of similar completed work
- whether the task is deterministic or exploratory
- whether retry fallout would be cheap or expensive

Return `status: BLOCKED` when:

- task scope is missing
- task combines unrelated work
- required systems cannot be identified
- model choice depends on unresolved runtime scope
- the requested model does not exist
- the task requires information not available in the repository or prompt
- `CONTINUE` was supplied before a valid recommendation exists for the exact current scope

## 4. Model guidance

### `GPT-5.4-Mini`

Use for:

- mechanical documentation updates
- exact text insertion
- narrow JSON or manifest edits
- simple static checks
- small isolated UI copy changes
- deterministic repetitive work

### `GPT-5.4`

Use for:

- ordinary implementation work
- several related files
- policy or plugin skill design
- moderate repository analysis
- scoped UI implementation
- non-trivial tests
- moderate concurrency handling

### `GPT-5.5`

Use for:

- high-risk runtime work
- economy invariants
- battle or NPC architecture
- persistence or migration
- security-sensitive systems
- broad architectural decisions
- complex debugging
- release readiness
- multiple tightly coupled systems

## 5. Reasoning guidance

### `Light`

Use for:

- fully mechanical work
- tiny scope
- exact instructions
- trivial validation

### `Medium`

Use for:

- limited reasoning
- known patterns
- moderate validation
- few files

### `High`

Use for:

- non-trivial dependencies
- important invariants
- concurrency or mirror analysis
- significant validation

### `Extra High`

Use for:

- architecture-critical work
- security-critical work
- economy-critical work
- difficult runtime diagnosis
- broad release acceptance
- substantial ambiguity with high failure cost

Reasoning escalation is independent from model-family escalation. Do not raise both automatically.

For bounded, deterministic, single-file contract or documentation work, `High` is presumed overprovisioned unless a concrete `Medium`-level failure mode is demonstrated.

## 6. Truthfulness rules

- Never claim that Codex is currently running the recommended model.
- The Codex interface is the source of truth for the actual active model.
- If the active model cannot be externally verified, report `actual active model: USER_SELECTED_UNVERIFIED`.
- If Codex mentions its own model name without external verification, label it `SELF_REPORTED_UNVERIFIED`.
- Never silently claim or change the active model.
- If the task scope changes after a recommendation, require a fresh recommendation before implementation resumes.

## 7. Required output

Return all of the following:

- `status: MODEL_RECOMMENDATION`
- optimization objective: `MINIMIZE_EXPECTED_USER_TOKEN_COST`
- evaluated pair count: `12/12`
- recommended model
- recommended reasoning level
- task classification
- risk level: `low`, `medium`, `high`, or `critical`
- analyzed factors
- pair evaluation matrix
- sufficient pairs
- rejected pairs
- non-dominated frontier
- cheapest plausible candidate
- cheapest rejected candidate
- concrete rejection failure mode
- recommended candidate
- next more expensive plausible candidate
- why stronger is unnecessary
- estimated retry risk
- relevant cost frontier
- capability bottleneck
- reasoning bottleneck
- retry-cost assessment
- overprovisioning check
- why weaker options are insufficient
- why stronger options are unnecessary or unavailable
- same-model lower-reasoning comparison
- same-model higher-reasoning comparison
- weaker-model same-reasoning comparison
- stronger-model same-reasoning comparison
- weaker-model higher-reasoning comparison
- stronger-model lower-reasoning comparison
- final recommendation
- confidence: `low`, `medium`, or `high`
- actual active model: `USER_SELECTED_UNVERIFIED`
- exact next user action

The recommendation must stay within the allowed model names and allowed reasoning levels exactly.

## 8. Output discipline

The report must explicitly compare the relevant frontier of adjacent plausible candidates and stop at the first candidate that meets the reliability threshold.

It must name:

- the cheapest plausible candidate
- the cheapest rejected candidate
- the concrete likely failure mode for the rejected candidate
- the recommended candidate
- the next more expensive plausible candidate
- why the stronger candidate is unnecessary

It must also separate:

- model-family escalation from reasoning escalation
- capability bottleneck from reasoning bottleneck
- first-attempt cost from expected retry cost

When the selected pair sits at the weakest available model-family boundary, the weaker-model same-reasoning comparison and weaker-model higher-reasoning comparison fields must be `UNAVAILABLE`; do not substitute a same-family neighbor into either field.

The report must return `OVERPROVISIONED_RECOMMENDATION` if the proposed model or reasoning level lacks a concrete justification against the next cheaper plausible candidate.

### Cost frontier rules

Start from the cheapest plausible candidate.

Move upward only when the cheaper candidate has a concrete, task-specific failure mode.

Compare adjacent plausible candidates rather than jumping directly from `GPT-5.4-Mini` to `GPT-5.4 / High` or `GPT-5.5`.

Never use file count alone as a sufficient reason for escalation.

For each task, assess the relevant frontier among combinations such as:

- `GPT-5.4-Mini / Light`
- `GPT-5.4-Mini / Medium`
- `GPT-5.4-Mini / High`
- `GPT-5.4 / Light`
- `GPT-5.4 / Medium`
- `GPT-5.4 / High`
- `GPT-5.4 / Extra High`
- `GPT-5.5 / Light`
- `GPT-5.5 / Medium`
- `GPT-5.5 / High`
- `GPT-5.5 / Extra High`

The selector does not need to print every irrelevant combination, but it must not omit a cheaper plausible alternative that could perform the task reliably.

Any `first-pass cost` values in the pair evaluation matrix must use only `low`, `medium`, `high`, or `highest`.

### Escalation criteria

`High` or `Extra High` may be recommended only when the report names a specific reasoning failure expected at the next lower level, such as:

- several interacting invariants that require sustained reconciliation
- ambiguous failure evidence requiring multi-hypothesis debugging
- complex state or causal reasoning
- broad cross-file dependency analysis where shallow reasoning is likely to miss a material interaction

Statements such as these are insufficient:

- “the task is important”
- “extra care is useful”
- “the policy is complex”
- “High is safer”
- “there are several files”
- “to reduce risk”

For bounded, deterministic, single-file contract or documentation work, `High` is presumed overprovisioned unless a concrete `Medium`-level failure mode is demonstrated.

`Extra High` requires a concrete failure mode that remains material even at `High`.

### Model-family escalation

`GPT-5.4` may replace `GPT-5.4-Mini` only when the selector identifies a concrete Mini capability limitation, not merely a desire for greater confidence.

`GPT-5.5` may be recommended only when the selector identifies a concrete capability gap in `GPT-5.4`, such as:

- genuinely broad architecture synthesis across multiple systems
- severe ambiguity requiring stronger global reasoning
- novel multi-domain design with many unresolved constraints
- a demonstrated repeated failure of the cheaper suitable tier under unchanged scope

“Strongest model” or “lowest theoretical risk” is never sufficient.

### Model versus reasoning

The selector must separately determine whether the bottleneck is:

- comprehension or model capability
- depth of deliberation
- context breadth
- tool orchestration
- debugging ambiguity
- deterministic execution volume

Do not raise both model family and reasoning automatically.

Prefer the cheaper expected-cost combination after considering retry risk.
