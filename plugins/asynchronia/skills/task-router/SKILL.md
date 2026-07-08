---
name: task-router
description: Classify an Asynchronia request and route it through the minimum required safety, planning, model-selection, implementation, validation, and user-acceptance workflow without editing task files or bypassing repository policy.
---

# Task Router

Use this skill to classify an Asynchronia request and recommend the narrowest safe workflow.

The router is an orchestration and recommendation skill.

It does not:

- edit task files
- pass an audit on behalf of another skill
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

- Runtime-sensitive work must pass `scope-isolation-check`.
- A scope collision result overrides any parallel or implementation recommendation.
- `BLOCKED_SCOPE_COLLISION` blocks writes until overlapping scope.
- The router cannot accept or manufacture scope isolation.

### 3. Scope integrity

- Missing, mixed, ambiguous, or conflicting scope returns `BLOCKED`.
- Do not merge unrelated objectives into one task.
- UI and logic must remain separate atomic tasks unless repository policy explicitly permits otherwise.

### 4. Parallel planning

- Multiple proposed tasks, concurrent work, shared files, mirrors, dependencies, or unresolved ownership require `parallel-scope-planner`.
- Source and deployed counterparts in one mirror group remain one serialized ownership lane.
- One narrow task with exact disjoint ownership does not require parallel planning.

### 5. Model selection

- Every implementation recommendation must include `model-selector`.
- Before any implementation, routing must enter `MODEL_PREFLIGHT_ONLY`.
- `MODEL_PREFLIGHT_ONLY` is read-only, creates no repository or workspace lock, and ends with `WAITING_FOR_MODEL_SELECTION`.
- The router must not begin implementation in the same response as the preflight recommendation.
- A valid `MODEL_PREFLIGHT_ONLY` response must end the entire response with exactly one standalone fenced code block containing only `CONTINUE`.
- No content may appear after that fenced `CONTINUE` block.
- The fenced `CONTINUE` block is an output-format requirement only and does not authorize implementation automatically.
- Implementation may begin only after the user replies `CONTINUE` in the same thread after a valid recommendation exists.
- If task scope changes after the recommendation, the router must require a fresh `MODEL_PREFLIGHT_ONLY` pass before implementation.
- After `CONTINUE`, re-read workspace locks before creating any implementation lock or beginning edits.
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
- Routing a task to an audit does not mean that audit passed.

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
- canon-audit-required
- mirror-audit-required
- destructive-operation-risk

## 4. Route rules

### `READ_ONLY_ANALYSIS`

- scope-isolation-check classification only
- model-selector when substantial reasoning is required
- no implementation
- no Safari smoke unless explicitly analyzing a runtime smoke result

### `DOCUMENTATION_ONLY`

- scope-isolation-check
- model-selector
- no scope isolation
- no Safari smoke

### `PLUGIN_POLICY`

- scope-isolation-check
- model-selector
- mandatory `MODEL_PREFLIGHT_ONLY` before implementation
- parallel-scope-planner only when several plugin tasks or shared ownership exist
- `smoke-orchestrator` when the plugin task changes smoke workflow, enclosing smoke verdict rules, or contract-smoke requirements
- `deployment-verifier` when the plugin task changes deployment identity, cache-bust, entrypoint freshness, or release-lineage verification rules
- `acceptance-evidence-gate` when the plugin task changes status-promotion, acceptance, evidence-ownership, or package-acceptance rules
- `canon-audit`, `economy-invariant-audit`, or `mirror-audit` when the plugin task changes routing policy for accepted canon, economy invariants, or deployed/source parity workflows
- plugin validation
- no Safari smoke unless the plugin protocol explicitly requires a user interaction smoke

### `UI_ONLY`

- scope-isolation-check
- model-selector
- Build Web Apps recommendation when useful
- preserve UI/logic separation
- user visual smoke when runtime UI changes are implemented

### `RUNTIME_LOGIC`

- scope-isolation-check
- model-selector
- isolated serialized runtime slot
- mirror synchronization when applicable
- static checks
- user Safari smoke

### `ECONOMY_CRITICAL`

- all `RUNTIME_LOGIC` requirements
- `economy-invariant-audit`
- conservation and traceability validation
- `canon-audit` first when the intended economy rule is unclear
- `mirror-audit` when the economy behavior touches mirrored source or deployed runtime files
- strongest justified model recommendation
- user Safari smoke

### `BATTLE_OR_NPC_CRITICAL`

- all `RUNTIME_LOGIC` requirements
- `canon-audit`
- `economy-invariant-audit` when balances, transfers, settlements, refunds, remainders, rollback accounting, or player/NPC economy parity are involved
- `mirror-audit` when mirrored source or deployed runtime files are involved
- crowd cap and economy checks when relevant
- user Safari smoke

### `PERSISTENCE_OR_MIGRATION`

- all `RUNTIME_LOGIC` requirements
- migration, rollback, corruption, and compatibility analysis
- user Safari smoke

### `SECURITY_SENSITIVE`

- scope-isolation-check
- model-selector
- Codex Security recommendation when available
- explicit threat and permission scope
- no security claim without evidence

### `MULTI_TASK_OR_CONCURRENT`

- parallel-scope-planner
- model-selector per implementation lane
- scope-isolation-check per runtime lane
- one final shared documentation owner

### `RELEASE_ACCEPTANCE`

- scope-isolation-check
- parallel-scope-planner when multiple lanes remain
- model-selector
- `canon-audit` when the intended accepted behavior is part of the release evidence
- `economy-invariant-audit` when release scope includes economy-sensitive behavior
- `mirror-audit` for deployed/source parity, wiring, reachability, or release metadata
- `deployment-verifier` for deployed entrypoint, asset freshness, release lineage, cache-bust, or runtime-marker linkage
- `smoke-orchestrator` for the enclosing release smoke workflow and nested component verdict handling
- `acceptance-evidence-gate` for the final release or milestone status-promotion decision
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

## 6. Audit routing rules

Route to `economy-invariant-audit` for:

- points or resource conservation
- source and sink accounting
- balances
- transfers
- settlements
- ledger or `moneyLog` traces
- unexplained emission or destruction
- refunds
- remainders
- duplicate settlement
- rollback accounting
- player or NPC economy parity
- long-run economy stability

Route to `canon-audit` for:

- accepted versus proposed rules
- authoritative source conflicts
- terminology drift
- mechanic drift
- player or NPC behavioral parity
- prerequisites and eligibility
- outcomes and consequences
- caps and boundaries
- battle lifecycle
- undocumented exceptions
- unclear intended behavior
- smoke evidence that may contradict accepted rules

Route to `mirror-audit` for:

- `AsyncScene/Web/**` and corresponding `docs/**`
- source and deployed counterparts
- missing or stale mirrors
- byte parity
- semantic parity
- wiring parity
- deployment freshness
- `buildTag` or `smokeVersion` parity
- entrypoints
- routes
- script inclusion
- imports or exports
- boot registration
- runtime reachability
- installed or deployed surface verification

Canon Audit determines intended behavior but does not prove economy conservation or mirror parity.

Economy Invariant Audit verifies conservation and traces but does not define canon or deployment parity.

Mirror Audit verifies source or deployed parity but does not define canon or economy conservation.

## 7. Smoke and acceptance routing rules

Route to `smoke-orchestrator` for:

- contract or schema smoke planning
- static smoke planning
- integration smoke planning
- local runtime smoke planning
- deployed runtime smoke planning
- user acceptance smoke planning
- release acceptance smoke planning
- evidence ownership and pass-condition definition
- expected nested component failure handling
- enclosing smoke verdict calculation

Route to `deployment-verifier` for:

- source-to-artifact verification
- artifact-to-deployment verification
- deployed entrypoint verification
- deployed asset verification
- release-lineage verification
- cache-bust verification
- rollout-state verification
- runtime-marker linkage verification
- deployment freshness or mixed-revision questions

Route to `acceptance-evidence-gate` for:

- any request to mark a task, smoke, package, milestone, or release as accepted, complete, or PASS from supplied evidence
- package-acceptance or installed-package-acceptance decisions
- final milestone or release-acceptance decisions
- stale, mismatched, incomplete, or contradictory evidence resolution
- evidence-ownership enforcement
- status-promotion gating after audits, deployment checks, or smoke evaluation

Smoke Orchestrator defines the enclosing smoke workflow and verdict but does not replace deployment verification or acceptance gating.

Deployment Verifier determines deployment identity, freshness, and entrypoint truth but does not claim runtime behavior or user acceptance.

Acceptance Evidence Gate decides whether supplied evidence authorizes status promotion but does not manufacture evidence or bypass required audits, deployment checks, or user Safari smoke.

## 8. Multi-skill order

When multiple audits or acceptance skills apply, use this dependency order:

1. `scope-isolation-check`
2. `canon-audit`
3. `economy-invariant-audit`
4. `mirror-audit`
5. `deployment-verifier` when deployed identity or freshness matters
6. `smoke-orchestrator` when an enclosing smoke workflow or verdict is required
7. `acceptance-evidence-gate` when status promotion is requested
8. user Safari smoke for runtime or user acceptance when the contract still requires user-owned evidence

Rules:

- Canon Audit precedes Economy Invariant Audit when the intended economy rule is unclear.
- Canon Audit precedes Mirror Audit when semantic differences exist and intended behavior is unclear.
- Economy Invariant Audit and Mirror Audit may both be required after economy behavior changes in mirrored runtime files.
- Deployment Verifier may provide a component verdict consumed by Smoke Orchestrator.
- Acceptance Evidence Gate consumes audit, deployment, smoke, and user evidence; it does not replace them.
- Source and deployed counterparts form one serialized ownership lane.
- Stable-read dependencies must not run concurrently with their writers.
- Shared documentation has one final owner.
- Dirty tree evidence alone is not a blocker.

## 9. Output contract

Return:

- `status: TASK_ROUTE`
- task classification
- secondary flags
- task objective
- authorized or proposed scope
- applicable audits
- audit order
- required skills in execution order
- optional supporting plugins
- execution mode
- runtime gate requirement
- serialization requirement
- parallel planning requirement
- model recommendation status
- user Safari status
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
- `MODEL_PREFLIGHT_ONLY`
- `DIRECT_NON_RUNTIME`
- `SERIAL_NON_RUNTIME`
- `RUNTIME_GATE_REQUIRED`
- `PARALLEL_PLAN_REQUIRED`
- `BLOCKED`

Do not output an implementation plan when status is `BLOCKED`.

## 10. Block conditions

Return `BLOCKED` when:

- atomic objective is missing
- authorized scope cannot be determined
- UI and logic are mixed without separation
- proposed tasks have unresolved ownership
- runtime work lacks an identified runtime scope
- destructive Git operations are requested against unrelated work
- a requested model or plugin does not exist
- required repository context is unavailable
- the user replies `CONTINUE` before a valid model preflight recommendation exists
- the user asks to bypass scope isolation or Safari acceptance
- canon or economy requirements conflict and no authoritative rule resolves them

## 11. Truthfulness

Never claim:

- the active model was verified
- scope isolation exists when it does not
- routing to `canon-audit`, `economy-invariant-audit`, or `mirror-audit` means that audit passed
- an external plugin was invoked without evidence
- runtime acceptance passed without user smoke
- an installed plugin version was verified before installed-package verification exists
- unrelated dirty changes belong to the current task

Use:

- `USER_SELECTED_UNVERIFIED` for the active model
- `SELF_REPORTED_UNVERIFIED` for any unverified Codex self-report
- `PENDING_USER` for required user smoke
- `NOT_REQUIRED` when user smoke genuinely does not apply
