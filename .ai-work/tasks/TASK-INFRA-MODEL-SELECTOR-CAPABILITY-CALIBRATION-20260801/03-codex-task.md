Use @asynchronia plugin.

TASK_ID: TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801
PIPELINE_VERSION: 1.0.18
PHASE: CODEX_TASK
STATUS: READY_FOR_REVIEW
CREATED_AT: 2026-08-01T14:51:31Z
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-selector-capability-calibration-20260801@d4527217e3ec4b5cbe2978bef1974fc8a300058a

# Codex task descriptor

```json
{
  "taskId": "TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801",
  "taskType": "PLUGIN_POLICY",
  "objective": "Implement scope-aware capability calibration policy gates while preserving inventory authority, cost authority, and selector state semantics.",
  "readScope": ["plugins/asynchronia", "tools", ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801"],
  "writeScope": [".agents/plugins/marketplace.json", ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801/01-chat-brief.md", ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801/02-work-plan.md", ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801/03-codex-task.md", ".ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801/STATE.md", "plugins/asynchronia/.codex-plugin/plugin.json", "plugins/asynchronia/model_selector.py", "plugins/asynchronia/model_selector_runtime.py", "plugins/asynchronia/skills/model-selector/SKILL.md", "tools/test_model_selector_cost_authority.py", "tools/test_model_selector_runtime.py", "tools/test_model_selector_snapshot.py", "tools/validate-asynchronia-auto-model-preflight.py"],
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

### Atomic goal

Add calibrated policy floors and gates so read-only tasks short-circuit, docs-only tasks route to Luna / Light, ordinary score bands remain stable, and explicit runtime/security/economy/broad-cross-cutting classes can raise the recommendation.

### Exact baseline

Repository `/Users/User/Documents/created apps/AsyncScene`, branch `infra/model-selector-capability-calibration-20260801`, baseline `d4527217e3ec4b5cbe2978bef1974fc8a300058a`.

### Allowed writes

Only the task-local package files and the user-authorized selector/test/version surfaces.

### Forbidden changes

Inventory authority, cost authority, runtime/game code, security implementation, bridge/mailbox refs, shared repository memory, `TASKS.md`, and direct writes to `main`.

### Deterministic policy summary

- Read-only: exact `writeScope == []`, result `READ_ONLY_ALLOWED`, no recommendation.
- Docs-only: all write paths `.md` or `.txt`, `expectedImplementationSize == small`, all risk/impact fields low, result floor `Luna / Light`.
- Scalar bands: 10-19 `Luna / Light`, 20-29 `Luna / Medium`, 30-37 `Luna / High`, 38-39 `Luna / Max`.
- Explicit floors: runtime/architecture high -> `Luna / High`; security/economy high -> `Terra / Light`; ambiguity+concurrency high -> `Terra / Medium`.
- Broad cross-cutting: exact predicate escalates to `Sol / Light`; explicit floors join with it, so broad + runtime high becomes `Sol / High`.
- Join rule: apply the strongest model and effort floor independently; then pick the cheapest candidate that satisfies both.

### Validation and stop conditions

Run the required unittests and validators, prove inventory and cost authority unchanged, commit the task branch, push only that branch, and open a draft PR without merging. Stop if any authority drift, invalid floor, or branch/baseline mismatch appears.

### Allowed reads

- Selector core, runtime facade, plugin package, marketplace entry, relevant tests, and task-local package files.

### Dependencies

- Current baseline commit
- existing inventory authority
- existing cost authority

### Implementation requirements

- Preserve read-only short-circuit semantics.
- Implement explicit policy floors and gates.
- Keep capability math unchanged.
- Keep cost authority and inventory authority unchanged.

### Validation commands

- `python3 -m unittest tools.test_model_selector_snapshot tools.test_bridge_model_preflight`
- `python3 -m unittest tools.test_model_selector_runtime tools.test_model_selector_response_contract`
- `python3 -m unittest tools.test_model_selector_cost_authority`
- `python3 -m unittest tools.test_model_selector_full_regression`
- `python3 tools/validate-asynchronia-auto-model-preflight.py`
- `python3 tools/validate_ai_work_pipeline.py`
- `git diff --check`

### Required final report

- branch, baseline, final SHA, changed paths, predicates, gate precedence, version evidence, regression matrix, command outputs, push evidence, draft PR URL, and next action

### Stop conditions

- inventory drift, cost authority drift, version mismatch, validation failure, or scope collision
