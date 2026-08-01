TASK_ID: TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801
PIPELINE_VERSION: 1.0.17
PHASE: CHAT_BRIEF
STATUS: READY_FOR_REVIEW
CREATED_AT: 2026-08-01T07:34:14Z
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-selector-cost-order-20260801@7d886cbc597937dc570a3502b0cd579373647957

# Chat brief

- Task: `TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801`
- Branch: `infra/model-selector-cost-order-20260801`
- Baseline: `7d886cbc597937dc570a3502b0cd579373647957`
- Objective: replace ordinal pseudo-cost recommendation with verified official Codex-credit cost ordering while preserving inventory, capability math, matrix traversal, and authorization semantics.
- Self-repair exception: normal selector authorization is intentionally not used; no selector durable state, INVENTORY_OK, INVENTORY_CHANGED, or CONTINUE.
- User-selected bootstrap: 5.6 Luna / Medium / Standard.
- Scope: selector cost authority, selector implementation, focused tests, task evidence, and repository plugin 1.0.17 version surfaces only.

### Goal

Implement official Standard-speed Codex-credit cost authority and deterministic cheapest-sufficient selector ordering.

### Non-goals

- Do not modify inventory, capability formulas, runtime/gameplay, security, bridge, mailbox, memory, deployment, or installed plugin caches.
- Do not continue the blocked security task.

### Accepted decisions

- The live official vectors are the corrected six vectors recorded in `OFFICIAL-CODEX-RATE-CARD.md`.
- Component-wise dominance derives five neutral cost tiers; no effort multiplier is invented.
- The normal executable selector authorization is suppressed for this selector self-repair.

### Constraints

- Exact baseline is `7d886cbc597937dc570a3502b0cd579373647957`.
- Exact branch is `infra/model-selector-cost-order-20260801`.
- Writes are restricted to the user-authorized paths.

### Acceptance criteria

- Authority provenance, source blob, canonical hash, six-model set, exact vectors, and five tiers validate.
- All 29 pairs remain evaluated exactly once and every valid requirement 10 through 39 selects Luna / Light.
- Required validators and non-authorizing acceptance selector pass.

### Open questions

- None after live rate-card drift resolution.

### Output required from Work

Return exact branch, commit, changed paths, authority evidence, validation outputs, raw acceptance stdout, push evidence, draft PR URL, and the capability-calibration next action.
