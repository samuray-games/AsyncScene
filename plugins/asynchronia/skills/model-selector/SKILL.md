---
name: model-selector
description: Recommend the cheapest reliable Codex model and reasoning level for the exact Asynchronia task scope without claiming control or verification of the active UI-selected model.
---

# Model Selector

Use this skill for Asynchronia tasks that need a model recommendation before implementation, review, or validation work.

The skill recommends a model and reasoning level only. It cannot inspect, verify, or change the actual model selected in the Codex interface.

## 1. Allowed model set

Only these model names are valid:

- `GPT-5.5`
- `GPT-5.4`
- `GPT-5.4-Mini`

Only these reasoning levels are valid:

- `low`
- `medium`
- `high`
- `extra high`

Never invent another model or reasoning level.

## 2. Default objective

Choose the cheapest available model and reasoning level that is expected to complete the exact task reliably without avoidable retries.

Do not automatically choose the strongest model.

Promote to a stronger model only when task analysis justifies it through one or more of:

- runtime sensitivity
- economy or conservation invariants
- battle or NPC logic
- persistence or state migration
- security impact
- architecture changes
- multiple interacting systems
- unclear repository structure
- large or risky file scope
- concurrency conflicts
- difficult regression analysis
- canonical mechanic changes
- release acceptance

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

Return `status: BLOCKED` when:

- task scope is missing
- task combines unrelated work
- required systems cannot be identified
- model choice depends on unresolved runtime scope
- the requested model does not exist
- the task requires information not available in the repository or prompt

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

### `low`

Use for:

- fully mechanical work
- tiny scope
- exact instructions
- trivial validation

### `medium`

Use for:

- limited reasoning
- known patterns
- moderate validation
- few files

### `high`

Use for:

- non-trivial dependencies
- important invariants
- concurrency or mirror analysis
- significant validation

### `extra high`

Use for:

- architecture-critical work
- security-critical work
- economy-critical work
- difficult runtime diagnosis
- broad release acceptance
- substantial ambiguity with high failure cost

## 6. Truthfulness rules

- Never claim that Codex is currently running the recommended model.
- The Codex interface is the source of truth for the actual active model.
- If the active model cannot be externally verified, report `actual active model: USER_SELECTED_UNVERIFIED`.
- If Codex mentions its own model name without external verification, label it `SELF_REPORTED_UNVERIFIED`.
- Never silently claim or change the active model.

## 7. Required output

Return all of the following:

- `status: MODEL_RECOMMENDATION`
- recommended model
- recommended reasoning level
- task classification
- risk level: `low`, `medium`, `high`, or `critical`
- analyzed factors
- why weaker options are insufficient
- why stronger options are unnecessary or unavailable
- confidence: `low`, `medium`, or `high`
- actual active model: `USER_SELECTED_UNVERIFIED`
- exact next user action

The recommendation must stay within the allowed model names and allowed reasoning levels exactly.
