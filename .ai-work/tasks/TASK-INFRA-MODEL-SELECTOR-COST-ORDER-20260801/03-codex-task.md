Use @asynchronia plugin.

TASK_ID: TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801
PIPELINE_VERSION: 1.0.17
PHASE: CODEX_TASK
STATUS: READY_FOR_REVIEW
CREATED_AT: 2026-08-01T07:34:14Z
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-selector-cost-order-20260801@7d886cbc597937dc570a3502b0cd579373647957

# Codex task descriptor

```json
{
  "taskId": "TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801",
  "taskType": "PLUGIN_POLICY",
  "objective": "Implement official Codex-credit cost authority and cheapest-sufficient selector ordering without changing capability semantics or inventory authority.",
  "readScope": ["plugins/asynchronia", "tools", ".ai-work/tasks/TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801"],
  "writeScope": ["plugins/asynchronia", "tools", ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-COST-ORDER-20260801"],
  "affectedSystems": ["selector", "plugin-package", "tests", "task-evidence"],
  "runtimeSensitivity": "high",
  "architectureImpact": "high",
  "securityImpact": "high",
  "economyImpact": "high",
  "releaseImpact": "high",
  "validationComplexity": "high",
  "expectedImplementationSize": "large",
  "ambiguityNovelty": "medium",
  "concurrencyBranchRisk": "high"
}
```

Normal executable selector authorization is excluded by the explicit selector self-repair exception.

### Atomic goal

Replace ordinal pseudo-cost selection with verified official Codex-credit cost ordering and deterministic cheapest-sufficient recommendation while preserving capability and authorization semantics.

### Exact baseline

Repository `/Users/User/Documents/created apps/AsyncScene`, branch `infra/model-selector-cost-order-20260801`, baseline `7d886cbc597937dc570a3502b0cd579373647957`.

### Allowed reads

All files named in the implementation prompt, current inventory authority and snapshot, prior maintenance task directory, selector sources, focused tests, and validators.

### Allowed writes

Exactly the paths listed in the implementation prompt: five task artifacts, cost authority/module, selector/runtime/version surfaces, and the listed focused tests.

### Forbidden changes

Inventory authority or snapshot, capability math, runtime/gameplay, UI/deployment, economy/persistence, security task, bridge/mailbox refs, repository memory, main, installed plugin cache, and normal selector state.

### Dependencies

Live official rate-card verification passed at `2026-08-01T07:34:14Z`; current inventory remains revision `20260801.1` with 6 models and 29 pairs.

### Implementation requirements

Use exact Decimal credit vectors, component-wise dominance, five `TIER_N` classes, cost-aware recommendation/cheapestRejected/nextMoreCapable, cost identity binding, complete visible credits, unchanged capability math, and plugin version 1.0.17.

### Validation commands

Run the required unittest suite, `validate-asynchronia-auto-model-preflight.py`, `validate-orchestration-policy.py`, `validate_ai_work_pipeline.py`, `git diff --check`, exhaustive requirements 10-39, and one non-authorizing generic selector `start` for security requirement 24.

### Required final report

Return status, repository/branch/baseline/final SHA, exact paths, version, authority revision/hash/source blob, six vectors, five tiers, algorithm, unchanged capability proof, all recommendations, unreachable models, retirement notice, validations, raw acceptance stdout, scope/AI-work/main/push/PR evidence, worktree diagnostics, and exact next action.

### Stop conditions

Stop on rate-card drift, scope collision, baseline/branch movement, inventory change, selector-state creation, any new pipeline failure, or publication failure. Never merge or restart security.
