TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PHASE: VALIDATION_CONTRACT_CORRECTION
STATUS: READY_FOR_CODEX_CONTINUATION
CREATED_AT: 2026-07-13T16:20:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: 1cb68f5fdd0a388c1081de9be4e62620404d05ab

## Proven contract error

The first Codex bootstrap implementation completed the authorized source changes but correctly stopped before commit because two required commands exited non-zero.

Those commands were incorrectly classified as universal blocking validators:

1. `tools/validate-orchestration-policy.py` is a frozen Bridge 062 closed-loop validator. It requires the current branch diff to equal `tools/closed_loop_contract.py::AUTHORIZED_PATHS` and therefore is structurally inapplicable to this selector repair branch.
2. `tools/validate_ai_work_pipeline.py` validates a legacy fixed task-package schema and still carries an obsolete safety-directive line. That requirement conflicts with current project policy, which forbids the obsolete gate. Its existing diagnostics are repository baseline debt outside this task write scope.

The selector implementation is not authorized to modify either validator.

## Corrected blocking validation contract

The following checks are blocking and must pass on the candidate worktree:

- `Use @asynchronia plugin.` appears as the exact first line of the active executable prompt;
- `Use @asynchronia task-router.` remains accepted as a supported skill reference where skill references are allowed;
- unknown skill references are rejected;
- historical non-active artifacts are not revalidated as active prompts;
- `python3 tools/validate-asynchronia-auto-model-preflight.py`
- `python3 -m py_compile tools/validate-asynchronia-auto-model-preflight.py`
- `git diff --check`
- changed paths equal the exact authorized write scope
- plugin manifest, marketplace entry, skill, root policy, and selector validator agree on version `1.0.9` and the same UI-authority rules
- no static model inventory or fixed pair denominator appears in active policy
- no permanent bootstrap exception appears in active policy, skill, manifests, or validator

## Non-blocking evidence commands

Run both commands and record their complete output and exit code, but do not classify their non-zero exit as a selector regression:

- `python3 tools/validate-orchestration-policy.py`
- `python3 tools/validate_ai_work_pipeline.py`

For `validate_ai_work_pipeline.py`, also run the command on a clean worktree at exact baseline `1cb68f5fdd0a388c1081de9be4e62620404d05ab`. Normalize diagnostics to repository-relative path plus message. The candidate may proceed only if its diagnostic set is identical to or a strict subset of the baseline set. Any new or changed diagnostic touching an authorized selector path is blocking.

`validate-orchestration-policy.py` requires no differential comparison because its source explicitly binds validation to frozen Bridge 062 scope. Record it as `NOT_APPLICABLE_FROZEN_BRIDGE_062_SCOPE`.

## Continuation rule

Preserve the existing uncommitted implementation in the isolated worktree. Do not redo model selection, preflight, or source implementation.

Because this correction advances the remote branch, Codex must:

1. export a patch for the five implementation files, excluding the locally edited task `STATE.md`;
2. fetch and prove the new exact remote head supplied by ChatGPT;
3. reset the task worktree to that head;
4. apply the preserved implementation patch;
5. regenerate `STATE.md` from the corrected contract;
6. run the corrected blocking and evidence checks;
7. commit and push only to `infra/model-selector-ui-authority-20260713`;
8. return `READY_FOR_REVIEW` only when all blocking checks pass and no new pipeline diagnostic exists.

## Final state evidence

`STATE.md` must record raw exit codes honestly. Non-zero evidence commands must not be described as passing. Use:

- `SELECTOR_VALIDATOR: PASS`
- `PY_COMPILE: PASS`
- `DIFF_CHECK: PASS`
- `ORCHESTRATION_VALIDATOR: NOT_APPLICABLE_FROZEN_BRIDGE_062_SCOPE_EXIT_1`
- `AI_WORK_PIPELINE_VALIDATOR: BASELINE_DEBT_NO_NEW_DIAGNOSTICS_EXIT_1`
- `VALIDATION_DISPOSITION: PASS_CORRECTED_TASK_SCOPED_CONTRACT`

No write to main, bridges, AI Forensics implementation, hooks, Stage 6, runtime, economy, persistence, deployment, or mirrors is authorized.
