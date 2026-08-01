TASK_ID: TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801
PIPELINE_VERSION: 1.0.18
PHASE: WORK_PLAN
STATUS: READY_FOR_REVIEW
CREATED_AT: 2026-08-01T00:00:00Z
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-selector-capability-calibration-20260801@d4527217e3ec4b5cbe2978bef1974fc8a300058a

# Work plan

1. Verify exact baseline and clean canonical checkout.
2. Add scope-aware capability calibration policy in selector core without touching inventory or cost authority.
3. Update visible contract tests and version assertions to `1.0.18`.
4. Add regression coverage for read-only, docs-only, scalar bands, explicit floors, and broad cross-cutting gates.
5. Validate repository state, commit, push only the task branch, and open a draft PR.

### Current implementation state

- The selector still uses the 1.0.17-era scalar baseline until the calibration policy is integrated.
- Inventory and cost authority remain fixed and must not change.

### Conflict check

- The task is isolated from runtime/game, security implementation, bridge/mailbox refs, shared memory, and direct main writes.

### Validation plan

- `python3 -m unittest tools.test_model_selector_snapshot tools.test_bridge_model_preflight`
- `python3 -m unittest tools.test_model_selector_runtime tools.test_model_selector_response_contract`
- `python3 tools/validate-asynchronia-auto-model-preflight.py`
- `python3 tools/validate_ai_work_pipeline.py`
- `git diff --check`

### Stop conditions

- Stop on inventory drift, cost authority drift, baseline/branch movement, version mismatch, scope collision, or validation failure.

### Repository evidence inspected

- Root authority, current selector core, runtime facade, plugin package, marketplace entry, targeted tests, and task-local package files.

### Dependency map

1. Selector core policy logic.
2. Version surfaces and visible contract tests.
3. Task-local evidence files.

### Atomic task decomposition

1. Add calibrated policy gates.
2. Update versioned surfaces and tests.
3. Run validation.
4. Commit and publish the task branch.

### Read scope

- `plugins/asynchronia`
- `tools`
- `.ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801`

### Write scope

- selector core and runtime surfaces
- focused tests
- task-local package files

### Risk controls

- Preserve inventory and cost authority bytes.
- Fail closed on ambiguous policy.
- Keep broad cross-cutting escalation explicit.

### Codex prompt strategy

- Use the selector self-repair exception only for this task.

### Blockers

- None after baseline and branch verification.
