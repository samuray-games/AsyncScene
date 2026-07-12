TASK_ID: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: ACCEPTED
CREATED_AT: 2026-07-12T10:55:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: MEMORY_REV 2026-07-12-0020-JST

## Goal

Repair the Asynchronia `model-selector` so every Codex model preflight discovers the current official Codex catalog, surface-specific controls, and current Codex rate card at run time instead of trusting a static repository whitelist or fixed pair count.

## Non-goals

- Do not execute the bridge control-plane reset.
- Do not continue Stage 6.
- Do not edit runtime or game files.
- Do not redesign the bridge protocol, mailbox refs, task routing, scope isolation, or the same-thread `CONTINUE` gate.
- Do not hardcode the current model catalog as a replacement static whitelist.
- Do not treat `Ultra` as an ordinary single-agent reasoning effort.
- Do not issue a model recommendation for this Work execution.

## Accepted decisions

- The model catalog is dynamic and must be verified against current official OpenAI sources during every Codex preflight.
- The authoritative model source is `https://learn.chatgpt.com/docs/models`.
- The authoritative cost source is `https://help.openai.com/en/articles/20001106-codex-rate-card`.
- The selector must identify the execution surface before interpreting control labels.
- The selector must preserve the exact labels exposed by the current surface and must not silently normalize `Light` and `Low` into one user-facing value.
- The selector must enumerate only verified single-agent model/control combinations. A cartesian product is forbidden unless the current client or official documentation proves every pair.
- `Max` remains a single-agent reasoning control when currently available.
- `Ultra` is a separate multi-agent execution mode and must be evaluated outside the single-agent candidate matrix.
- Fixed denominators such as `12/12` and `18/18` are forbidden.
- Current rate-card data must be recorded with source and verification time. Exact cost claims are forbidden when token-volume assumptions are unavailable.
- The optimization objective remains the cheapest reliable completion after retry risk, but current credit rates replace stale model-tier assumptions.
- The blocking same-thread `CONTINUE` state machine remains unchanged for Codex tasks.
- Plugin source version, marketplace version, and validator expectation move together from `1.0.7` to `1.0.8`.
- This repair is a Work task, not a Codex task. Work must not invoke `model-selector`, recommend a model, request `CONTINUE`, or add a permanent bootstrap-model exception to repository policy.
- Work must report `BOOTSTRAP_MODEL_SELECTION: NOT_PERFORMED` and `EXECUTION_MODEL_STATUS: UNVERIFIED`.

## Constraints

- Live baseline is `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`.
- Work branch is `work/model-selector-live-catalog-20260712`.
- Implementation branch is `infra/model-selector-live-catalog-20260712`.
- Work must fetch and verify both remote refs before editing.
- Work must apply the original patch in `02-work-plan.md` only as corrected by `02-work-plan-r2.md`.
- Work must not create, improve, shorten, expand, reinterpret, or substitute any policy wording.
- Direct writes to `main` are forbidden.
- Exact repository write scope is limited to five files:
  - `AGENTS.md`
  - `plugins/asynchronia/skills/model-selector/SKILL.md`
  - `tools/validate-asynchronia-auto-model-preflight.py`
  - `plugins/asynchronia/.codex-plugin/plugin.json`
  - `.agents/plugins/marketplace.json`
- Baseline repository search found one tracked `model-selector/SKILL.md`. Any additional tracked mirror discovered during execution is a scope conflict and must stop the task.
- Historical reports are not active contracts and must not be rewritten.

## Acceptance criteria

- `AGENTS.md` contains a dynamic discovery rule and no active static model whitelist, fixed pair count, or selector-maintenance model recommendation exception.
- `model-selector/SKILL.md` contains the exact replacement supplied by ChatGPT.
- The selector verifies official model and rate-card sources for each Codex preflight.
- The selector distinguishes execution surfaces and exact surface labels.
- The selector evaluates verified single-agent candidates dynamically and evaluates `Ultra` separately.
- The selector fails closed when the model catalog, execution surface, or rate card cannot be verified.
- The required recommendation report contains source URLs, verification timestamps, surface, availability evidence, dynamic candidate count, single-agent matrix, separate `Ultra` decision, and current cost evidence.
- The same-thread `CONTINUE` gate and post-continue scope revalidation remain intact for Codex tasks.
- The validator rejects the old static whitelist, fixed pair counts, missing official sources, `Ultra` misclassification, and any permanent selector-maintenance bootstrap recommendation exception.
- Plugin manifest, marketplace manifest, and validator all expect version `1.0.8`.
- `python3 tools/validate-asynchronia-auto-model-preflight.py` passes.
- `python3 tools/validate-orchestration-policy.py` passes.
- `python3 tools/validate_ai_work_pipeline.py` passes.
- Final branch diff contains exactly the five authorized repository files.
- Source and any accessible installed plugin copy have matching SHA-256 for `model-selector/SKILL.md`; inaccessible installed parity is reported explicitly and cannot be called PASS.

## Open questions

None.

## Output required from Work

Read `02-work-plan.md`, then apply every correction in `02-work-plan-r2.md` as the authoritative override. Apply the resulting exact patch to `infra/model-selector-live-catalog-20260712`, run every required validation, commit, push, refetch the branch, and return a factual evidence report. Do not create a Codex task, do not issue a model recommendation, and do not begin the bridge reset.