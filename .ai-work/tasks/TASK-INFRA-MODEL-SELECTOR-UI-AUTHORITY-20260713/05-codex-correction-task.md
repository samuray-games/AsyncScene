TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PIPELINE_VERSION: 1.0.5
PHASE: CODEX_CORRECTION
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-13T16:42:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: 480b6765ec5e0daa3438f43a349537cc63addeaa

### Atomic goal

Make the executable selector validator enforce the already accepted 1.0.9 policy. Do not change plugin semantics beyond closing the validator bypasses found in independent review.

### Exact baseline

Use the exact remote implementation head supplied in the launch prompt. Stop on ref drift.

### Allowed reads

- `AGENTS.override.md`
- `AGENTS.md`
- `TASKS.md`
- `PROJECT_MEMORY.md`
- all files in this task package
- `plugins/asynchronia/skills/model-selector/SKILL.md`
- `plugins/asynchronia/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`
- `tools/validate-asynchronia-auto-model-preflight.py`
- the two unrelated evidence validators, read-only

### Allowed writes

- `tools/validate-asynchronia-auto-model-preflight.py`
- `.ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713/STATE.md`

### Forbidden changes

No write to main, plugin policy text, manifests, marketplace, bridges, AI Forensics implementation, hooks, Stage 6, runtime, economy, persistence, deployment, or mirrors. Keep plugin version 1.0.9.

### Dependencies

The policy and skill at implementation commit `480b6765ec5e0daa3438f43a349537cc63addeaa` are the semantic authority. The validator must model them, not weaken them.

### Implementation requirements

1. Replace the old `PreflightContract` transition path with an explicit path that records app-server catalog evidence and performs UI reconciliation before `MODEL_INVENTORY_VERIFIED`.
2. A direct transition from discovery to verified must raise or return a blocked result and be covered by a negative test.
3. `reconcile_inventory()` must not verify inventory when both app-server inventory and app-server error evidence are absent. Return a blocking inventory-unavailable state.
4. A recorded app-server error plus exact current UI evidence may still verify through the documented reconciliation path.
5. Bind `UiInventory` evidence to at least thread, surface, task, and launch/baseline or equivalent per-run snapshot identity. Reject cross-thread, cross-task, wrong-launch, incomplete, and stale evidence.
6. Preserve exact UI labels and app-server-only exclusion.
7. Add fixtures proving the full legal reconciliation path and every new rejection case.
8. Keep all existing continuation, pair enumeration, adjacency, cost-objective, and terminal-fence tests passing.
9. Do not add a static inventory, fixed pair denominator, or permanent bootstrap exception.
10. Use two commits:
   - commit A contains only the validator correction;
   - commit B contains only task STATE finalization and records commit A as `FINAL_IMPLEMENTATION_COMMIT`.
   Do not attempt to store commit B's own SHA inside itself.

### Validation commands

Blocking:

- `python3 tools/validate-asynchronia-auto-model-preflight.py`
- `python3 -m py_compile tools/validate-asynchronia-auto-model-preflight.py`
- `git diff --check`
- exact changed-path check

Evidence, non-blocking under the existing corrected contract:

- `python3 tools/validate-orchestration-policy.py`
- baseline/candidate differential for `python3 tools/validate_ai_work_pipeline.py`

The candidate must introduce zero new normalized AI Work diagnostics.

### Required final report

Return:

- exact launch head;
- commit A SHA;
- final remote state head commit B SHA;
- exact changed paths per commit;
- all blocking outputs and exit codes;
- explicit proof that discovery cannot transition directly to verified;
- explicit proof that missing app-server evidence blocks;
- explicit proof that cross-task and wrong-launch UI inventory block;
- evidence validator dispositions;
- `READY_FOR_REVIEW` only.

### Stop conditions

Stop on ref drift, out-of-scope changes, any blocking validation failure, any new normalized pipeline diagnostic, or any attempt to modify policy/manifests/main/bridges/runtime.