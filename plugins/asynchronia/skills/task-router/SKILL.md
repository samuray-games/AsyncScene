---
name: task-router
description: Classify an Asynchronia request and route it through the minimum required safety, planning, model-selection, implementation, validation, and user-acceptance workflow without editing task files or bypassing repository policy.
---

# Task Router

Use this skill to classify an Asynchronia request and recommend the narrowest safe workflow.

The router is an orchestration and recommendation skill.

It does not:

- edit task files
- approve runtime work
- change the active Codex model
- create branches
- execute implementation
- claim Safari acceptance
- bypass another skill

## 1. Routing objective

Select the narrowest safe workflow that covers the exact request.

Do not invoke every skill automatically when it adds no value.

Do not skip a required skill merely to reduce steps.

## 2. Mandatory precedence

Apply these rules in order:

### 1. Repository policy

- `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md` govern all routing.
- Explicit user scope and repository policy override router convenience.

### 2. Runtime safety

- Runtime-sensitive work must pass `runtime-safety-gate`.
- A runtime gate result overrides any parallel or implementation recommendation.
- `RUNTIME_SAFETY_GATE_REQUIRED` blocks writes until valid same-thread approval.
- The router cannot accept or manufacture runtime approval.

### 3. Scope integrity

- Missing, mixed, ambiguous, or conflicting scope returns `BLOCKED`.
- Do not merge unrelated objectives into one task.
- UI and logic must remain separate atomic tasks unless repository policy explicitly permits otherwise.

### 4. Parallel planning

- Multiple proposed tasks, concurrent work, shared files, mirrors, dependencies, or unresolved ownership require `parallel-scope-planner`.
- One narrow task with exact disjoint ownership does not require parallel planning.

### 5. Model selection

- Every implementation recommendation must include `model-selector`.
- The router may repeat the selector recommendation but cannot verify or change the active interface model.
- Active model remains `USER_SELECTED_UNVERIFIED`.

### 6. Specialized support

- Security-sensitive work should recommend the installed Codex Security plugin when available.
- Web UI construction or visual implementation should recommend the installed Build Web Apps plugin when useful.
- External plugin recommendations never override Asynchronia runtime, scope, canon, or acceptance rules.
- Do not claim an external plugin was activated unless it was explicitly invoked and returned evidence.

### 7. Validation and acceptance

- Static validation belongs to Codex.
- Runtime Safari smoke belongs to the user.
- Runtime acceptance cannot be marked PASS before user smoke.
- Documentation-only and read-only tasks must not invent Safari requirements.

## 3. Task classification

Classify the request into one primary class:

- `READ_ONLY_ANALYSIS`
- `DOCUMENTATION_ONLY`
- `PLUGIN_POLICY`
- `UI_ONLY`
- `RUNTIME_LOGIC`
- `ECONOMY_CRITICAL`
- `BATTLE_OR_NPC_CRITICAL`
- `PERSISTENCE_OR_MIGRATION`
- `SECURITY_SENSITIVE`
- `MULTI_TASK_OR_CONCURRENT`
- `RELEASE_ACCEPTANCE`
- `AMBIGUOUS_OR_MIXED`

Secondary flags may include:

- runtime-sensitive
- mirror-sync
- shared-wiring
- shared-documentation
- concurrent-dirty-scope
- security-review
- web-ui-support
- user-smoke-required
- canon-sensitive
- economy-invariant
- destructive-operation-risk

## 4. Route rules

### `READ_ONLY_ANALYSIS`

- runtime-safety-gate classification only
- model-selector when substantial reasoning is required
- no implementation
- no Safari smoke unless explicitly analyzing a runtime smoke result

### `DOCUMENTATION_ONLY`

- runtime-safety-gate
- model-selector
- no runtime approval
- no Safari smoke

### `PLUGIN_POLICY`

- runtime-safety-gate
- model-selector
- parallel-scope-planner only when several plugin tasks or shared ownership exist
- plugin validation
- no Safari smoke unless the plugin protocol explicitly requires a user interaction smoke

### `UI_ONLY`

- runtime-safety-gate
- model-selector
- Build Web Apps recommendation when useful
- preserve UI/logic separation
- user visual smoke when runtime UI changes are implemented

### `RUNTIME_LOGIC`

- runtime-safety-gate
- model-selector
- isolated serialized runtime slot
- mirror synchronization when applicable
- static checks
- user Safari smoke

### `ECONOMY_CRITICAL`

- all `RUNTIME_LOGIC` requirements
- economy invariant audit
- conservation and traceability validation
- strongest justified model recommendation
- user Safari smoke

### `BATTLE_OR_NPC_CRITICAL`

- all `RUNTIME_LOGIC` requirements
- canon and regression audit
- crowd cap and economy checks when relevant
- user Safari smoke

### `PERSISTENCE_OR_MIGRATION`

- all `RUNTIME_LOGIC` requirements
- migration, rollback, corruption, and compatibility analysis
- user Safari smoke

### `SECURITY_SENSITIVE`

- runtime-safety-gate
- model-selector
- Codex Security recommendation when available
- explicit threat and permission scope
- no security claim without evidence

### `MULTI_TASK_OR_CONCURRENT`

- parallel-scope-planner
- model-selector per implementation lane
- runtime-safety-gate per runtime lane
- one final shared documentation owner

### `RELEASE_ACCEPTANCE`

- runtime-safety-gate
- parallel-scope-planner when multiple lanes remain
- model-selector
- all required static checks
- deployment and mirror verification
- user Safari smoke
- no PASS while required coverage remains pending

### `AMBIGUOUS_OR_MIXED`

- return `BLOCKED`
- identify the exact ambiguity
- request atomic objective and authorized scope
- do not guess implementation ownership

## 5. Dirty tree rule

A dirty repository alone does not block routing.

Distinguish:

- task-owned changes
- scenario-declared concurrent changes
- repository-observed concurrent changes

Only overlapping writes, stable-read conflicts, mirror ownership, shared wiring, generated outputs, or same-subsystem collisions require serialization or blocking.

Do not attribute pre-existing changes to the current task.

## 6. Output contract

Return:

- `status: TASK_ROUTE`
- primary classification
- secondary flags
- task objective
- authorized or proposed scope
- required skills in execution order
- optional supporting plugins
- execution mode
- runtime gate status
- parallel planning requirement
- model recommendation status
- implementation prerequisites
- validation requirements
- user acceptance requirements
- blocked conditions
- preserved pre-existing changes
- assumptions
- confidence: `low`, `medium`, or `high`
- exact next user action

Allowed execution modes:

- `READ_ONLY`
- `DIRECT_NON_RUNTIME`
- `SERIAL_NON_RUNTIME`
- `RUNTIME_GATE_REQUIRED`
- `PARALLEL_PLAN_REQUIRED`
- `BLOCKED`

Do not output an implementation plan when status is `BLOCKED`.

## 7. Block conditions

Return `BLOCKED` when:

- atomic objective is missing
- authorized scope cannot be determined
- UI and logic are mixed without separation
- proposed tasks have unresolved ownership
- runtime work lacks an identified runtime scope
- destructive Git operations are requested against unrelated work
- a requested model or plugin does not exist
- required repository context is unavailable
- the user asks to bypass runtime approval or Safari acceptance
- canon or economy requirements conflict and no authoritative rule resolves them

## 8. Truthfulness

Never claim:

- the active model was verified
- runtime approval exists when it does not
- an external plugin was invoked without evidence
- runtime acceptance passed without user smoke
- unrelated dirty changes belong to the current task

Use:

- `USER_SELECTED_UNVERIFIED` for the active model
- `PENDING_USER` for required user smoke
- `NOT_REQUIRED` when user smoke genuinely does not apply
