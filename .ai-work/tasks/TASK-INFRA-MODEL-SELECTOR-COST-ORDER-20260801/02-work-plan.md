TASK_ID: TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801
PIPELINE_VERSION: 1.0.17
PHASE: WORK_PLAN
STATUS: READY_FOR_REVIEW
CREATED_AT: 2026-08-01T07:34:14Z
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-selector-cost-order-20260801@7d886cbc597937dc570a3502b0cd579373647957

# Work plan

1. Verify the live official Standard-speed Codex rate card and record provenance.
2. Add the versioned decimal-safe cost authority and provenance/hash validation.
3. Replace ordinal cost selection with component-wise dominance tiers and deterministic cost-aware ordering.
4. Bind cost authority identity into selector state and matrix evidence without changing state tokens.
5. Add focused authority, ordering, recommendation, relay, and version tests.
6. Run the required suites, validators, acceptance selector, and baseline-versus-branch scope proof.
7. Commit, push only the dedicated task branch, and open a draft PR without merging.

### Repository evidence inspected

- Root authority, process and memory files; confirmed six-model/29-pair snapshot; selector core/runtime/inventory; plugin manifest and marketplace; focused tests and validators; prior maintenance task directory; live official rate card.

### Current implementation state

- Selector used ordinal pseudo-cost classes and inventory-order recommendation.
- Active inventory is revision `20260801.1` and must remain unchanged.
- Live official rate card now verifies corrected Luna/Terra vectors.

### Conflict check

- Cost authority and selector implementation are isolated from inventory, capability, runtime, security, bridge, mailbox, memory, deployment, and installed cache paths.

### Dependency map

1. Official rate-card artifact and cost authority.
2. Decimal-safe cost module and selector integration.
3. Tests, plugin version surfaces, and validators.
4. Non-authorizing acceptance evidence and publication.

### Atomic task decomposition

1. Bind rate evidence and five tiers.
2. Preserve matrix and capability semantics while changing selection keys.
3. Bind cost identity and visible credits.
4. Validate, publish, and stop before security restart.

### Read scope

- All files named in the user prompt, current inventory authority, current selector, focused tests, validators, and the prior maintenance task directory.

### Write scope

- Exactly the user-authorized task artifacts, cost authority/module, selector/runtime/version surfaces, and listed focused tests.

### Risk controls

- Use Decimal strings only; reject malformed, negative, missing, extra, duplicate, stale, or incomparable authority data.
- Keep matrix traversal, required-score calculation, capability formula, state tokens, and inventory unchanged.
- Never invoke normal selector authorization or create durable selector state.

### Validation plan

- Run focused and full selector/bridge tests, all three repository validators, diff check, exhaustive requirement proofs, and fresh generic mutation `start` stopping at inventory confirmation.

### Codex prompt strategy

Use @asynchronia plugin context; this is an explicit selector self-repair exception and does not use executable selector authorization.

### Blockers

- None after live rate-card verification.
