TASK_ID: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_WORK
CREATED_AT: 2026-07-12T10:56:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: MEMORY_REV 2026-07-12-0020-JST

## Repository evidence inspected

- Original plan: `.ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712/02-work-plan.md`.
- Corrected brief: `.ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712/01-chat-brief-r2.md`.
- The original plan incorrectly introduced a ChatGPT-authored bootstrap model recommendation for a task executed by Work.
- `model-selector` is a Codex preflight mechanism. Work execution does not require or authorize a Codex model recommendation.

## Current implementation state

The original five-file repository patch remains authoritative except for the exact corrections below. The repair must not create any permanent selector-maintenance model recommendation exception.

## Conflict check

- Stage 6 remains paused.
- Bridge reset remains blocked until this repair passes.
- No bridge refs or runtime files are in scope.
- Work must not invoke `model-selector`, emit `WAITING_FOR_MODEL_SELECTION`, request `CONTINUE`, or name a recommended model/control for this maintenance execution.

## Dependency map

- `02-work-plan.md` supplies the full five-file patch.
- This file supplies authoritative corrections that override only bootstrap-model wording.
- `01-chat-brief-r2.md` supersedes the bootstrap-selection decision in `01-chat-brief.md`.
- `STATE.md` must point to this corrected plan.

## Atomic task decomposition

Read the original `02-work-plan.md` and apply it with these exact corrections:

### Correction 1: `AGENTS.md` replacement text

In the proposed replacement for `## 8. Model selection rule`, delete this entire paragraph:

```text
A one-time selector-maintenance task may use an exact ChatGPT-authored bootstrap selection only when the live project memory explicitly records that the current selector is stale and the maintenance task changes no unrelated project scope.
```

Do not replace it with another model recommendation or bootstrap exception.

### Correction 2: validator dynamic contract

In `validate_dynamic_model_catalog_contract`, remove this required AGENTS needle:

```python
"A one-time selector-maintenance task may use an exact ChatGPT-authored bootstrap selection",
```

Add this exact forbidden active-contract string to `forbidden_active_contracts`:

```python
"A one-time selector-maintenance task may use an exact ChatGPT-authored bootstrap selection",
```

This makes any permanent bootstrap recommendation exception a validation failure.

### Correction 3: risk control

Replace the original risk-control bullet:

```text
- Do not invoke the stale selector for this bootstrap repair. Use the exact ChatGPT-authored bootstrap selection `GPT-5.6 Sol` with `High` reasoning.
```

with:

```text
- This maintenance operation is executed by Work, not Codex. Do not invoke `model-selector`, do not issue a model recommendation, do not request `CONTINUE`, and report `BOOTSTRAP_MODEL_SELECTION: NOT_PERFORMED` plus `EXECUTION_MODEL_STATUS: UNVERIFIED`.
```

### Correction 4: Codex prompt strategy

Replace:

```text
No Codex task is created. This is a bootstrap maintenance operation applied by Work from exact ChatGPT-authored content because the selector cannot safely select a model for its own repair.
```

with:

```text
No Codex task is created. Work applies the exact ChatGPT-authored maintenance patch directly. Because this is not a Codex execution, no model recommendation, model preflight, or CONTINUE gate is performed for the repair itself.
```

### Correction 5: final report

The Work report must contain these exact fields:

```text
BOOTSTRAP_MODEL_SELECTION: NOT_PERFORMED
EXECUTION_MODEL_STATUS: UNVERIFIED
```

The report must not contain a recommended model or recommended reasoning/control for this repair.

## Read scope

Read the original task package, the corrected `01-chat-brief-r2.md`, this corrected plan, and the same repository evidence listed in the original plan.

## Write scope

Repository write scope remains exactly the same five files:

- `AGENTS.md`
- `plugins/asynchronia/skills/model-selector/SKILL.md`
- `tools/validate-asynchronia-auto-model-preflight.py`
- `plugins/asynchronia/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

Work-branch evidence writes are limited to `STATE.md` and factual execution evidence. Do not rewrite the original accepted artifacts.

## Risk controls

- Treat this file as the authoritative override for every bootstrap-model statement in the original plan.
- Do not substitute another model or control label.
- Do not create a general maintenance bypass for Codex tasks.
- Preserve the normal automatic `model-selector` and same-thread `CONTINUE` contract for all future Codex tasks after this repair.

## Validation plan

Run every validation and search from the original plan, plus these negative searches:

```bash
rg -n 'GPT-5\.6 Sol.*High|bootstrap selection|selector-maintenance task may use' AGENTS.md plugins/asynchronia/skills/model-selector/SKILL.md tools/validate-asynchronia-auto-model-preflight.py
```

The command must return no matches in the five repository output files.

Verify the validator contains the permanent bootstrap-exception phrase only as a forbidden test fixture.

## Codex prompt strategy

No Codex task is created. Work performs the technical maintenance patch directly, without a model recommendation or continuation token.

## Blockers

Use the blockers from the original plan. Also return `BLOCKED_BOOTSTRAP_RECOMMENDATION_REMAINS` if any active repository contract still authorizes or names a bootstrap model recommendation for selector maintenance.