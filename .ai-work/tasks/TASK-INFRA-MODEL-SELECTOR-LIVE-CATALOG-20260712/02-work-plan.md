TASK_ID: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_WORK
CREATED_AT: 2026-07-12T10:10:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: MEMORY_REV 2026-07-12-0019-JST

## Repository evidence inspected

- Live `origin/main` is `50d77eb5b5273fffc491a9f111ecdc5d526c7cea`.
- `AGENTS.md` currently hardcodes exactly three models and four reasoning levels.
- `plugins/asynchronia/skills/model-selector/SKILL.md` currently hardcodes the same catalog and requires `evaluated pair count: 12/12`.
- `tools/validate-asynchronia-auto-model-preflight.py` currently expects plugin version `1.0.7` and does not reject stale static catalog behavior.
- `plugins/asynchronia/.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json` both report version `1.0.7`.
- Repository code search found exactly one tracked `plugins/asynchronia/skills/model-selector/SKILL.md`.
- Official current sources are `https://learn.chatgpt.com/docs/models` and `https://help.openai.com/en/articles/20001106-codex-rate-card`.

## Current implementation state

The blocking preflight state machine is valid, but its catalog and cost assumptions are stale. The repair must preserve the state machine and replace only catalog discovery, candidate construction, cost evidence, report fields, and validator expectations.

## Conflict check

- Stage 6 remains paused and is outside scope.
- The bridge control-plane reset remains blocked and is outside scope.
- Handoff V2 remains parked and is outside scope.
- The five authorized files do not overlap runtime or game files.
- If any active branch changes one of the five authorized files after baseline verification, stop with `BLOCKED_SCOPE_COLLISION`.

## Dependency map

- `AGENTS.md` defines repository policy.
- `model-selector/SKILL.md` implements the preflight contract.
- `validate-asynchronia-auto-model-preflight.py` enforces policy and plugin metadata.
- `plugin.json` and `marketplace.json` must publish one identical plugin version.
- Installed plugin parity depends on the committed source skill and must be verified after the source commit.

## Atomic task decomposition

### 1. Replace `plugins/asynchronia/skills/model-selector/SKILL.md` completely

Replace the entire file with this exact content:

```markdown
---
name: model-selector
description: Run the mandatory blocking model preflight for every Asynchronia task, discover the current official Codex catalog and rate card for the active execution surface, recommend the cheapest reliable verified option, and wait for same-thread CONTINUE before implementation.
---

# Model Selector

Use this skill automatically for every Asynchronia task before implementation, validation, publication, or any other state-changing work.

This skill cannot inspect, verify, or change the model selected by the user in the Codex interface. The user selects the active model. This skill controls the required recommendation, evidence, pause, and resume contract.

## 1. Mandatory preflight state machine

The legal states are:

1. `PREFLIGHT_REQUIRED`
2. `MODEL_CATALOG_DISCOVERY`
3. `MODEL_RECOMMENDATION_READY`
4. `WAITING_FOR_MODEL_SELECTION`
5. `CONTINUE_RECEIVED`
6. `SCOPE_REVALIDATED`
7. `IMPLEMENTATION_ALLOWED`

Before `IMPLEMENTATION_ALLOWED`, Codex must not:

- edit files;
- create or modify workspace locks;
- run state-changing commands;
- implement code or documentation changes;
- commit, push, publish, merge, rebase, reset, stash, clean, amend, or cherry-pick;
- claim implementation or validation completion.

A valid preflight response must end with exactly one standalone fenced code block whose only content is `CONTINUE`. No text may follow that block.

Only exact trimmed `CONTINUE` from the user in the same Codex conversation advances the state to `CONTINUE_RECEIVED`.

After `CONTINUE`, Codex must revalidate task identity, branch authority, exact scope, mirrors, shared wiring, dependencies, official catalog freshness, and required systems. If anything material changed, return to `PREFLIGHT_REQUIRED` and issue a fresh recommendation.

`CONTINUE` from another conversation, a previous task, a previous scope, or before a valid recommendation is invalid.

## 2. Automatic invocation contract

The Asynchronia plugin must be resolved automatically for every Asynchronia task.

Use the active installed package when available. If loader attachment or telemetry is unavailable, use the repository source at `plugins/asynchronia/skills/model-selector/SKILL.md` as the mandatory fallback.

Manual UI attachment is optional context only. Missing manual attachment is not a valid reason to skip this skill or block the task.

The required ordered preflight route is:

1. `task-router`
2. `scope-isolation-check`
3. `model-selector`
4. `parallel-scope-planner` when multiple lanes, mirrors, shared ownership, or dependencies exist
5. specialized skills required by routing
6. pause for same-thread `CONTINUE`

## 3. Live official catalog discovery

A static repository model whitelist is forbidden. A fixed model/control pair count is forbidden.

Every preflight must perform `MODEL_CATALOG_DISCOVERY` during the current task and must use both current official sources:

- Codex Models: `https://learn.chatgpt.com/docs/models`
- Codex rate card: `https://help.openai.com/en/articles/20001106-codex-rate-card`

Record:

- `catalog_checked_at_utc`;
- `rate_card_checked_at_utc`;
- exact source URLs;
- execution surface;
- availability evidence;
- current surface-specific control labels;
- any plan, workspace, preview, or settings condition affecting availability.

Classify the execution surface as exactly one of:

- `CHATGPT_DESKTOP_APP`
- `CHATGPT_WORK_WEB`
- `CODEX_IDE_EXTENSION`
- `CODEX_CLI_INTERACTIVE`
- `CODEX_CLI_NON_INTERACTIVE`
- `CODEX_CLOUD`
- `UNKNOWN`

Preserve the exact current control labels used by the verified surface. Do not silently rewrite one surface label into another surface label.

If the execution surface cannot be identified, return `BLOCKED_MODEL_SURFACE_UNVERIFIED`.

If the official Codex Models source cannot be read or does not provide enough current evidence to construct candidates, return `BLOCKED_MODEL_CATALOG_UNVERIFIED`.

If the current rate card cannot be read, return `BLOCKED_RATE_CARD_UNVERIFIED`.

Do not use repository memory, previous chat output, a previous preflight, or model self-report as current catalog authority.

## 4. Availability and candidate construction

Build the candidate inventory dynamically from current official evidence and current client or user-visible availability evidence.

Use these availability statuses:

- `VERIFIED_VISIBLE`
- `OFFICIAL_SURFACE_AVAILABLE`
- `USER_VISIBLE_OPTIONS_UNVERIFIED`
- `CONDITIONAL_AVAILABILITY_UNVERIFIED`
- `NOT_AVAILABLE`

A model with `NOT_AVAILABLE` is not a candidate.

A model with `CONDITIONAL_AVAILABILITY_UNVERIFIED` may not be recommended until the condition is verified.

`USER_VISIBLE_OPTIONS_UNVERIFIED` is allowed only when official surface availability is current and the final report instructs the user to select the recommended option in the current interface. The selected active model remains `USER_SELECTED_UNVERIFIED` unless externally proven.

Construct only combinations supported by current evidence. Do not assume every current model supports every current control. Do not create a cartesian product unless current official or client evidence proves every combination.

Report `evaluated single-agent candidate count: N`, where `N` is calculated from the verified inventory for the current preflight. Do not report a fixed denominator.

Each single-agent candidate record must contain:

- model label;
- model identifier when published;
- execution surface;
- control label;
- availability status and evidence;
- current input, cached-input, and output credit rates when published;
- task-fit evidence;
- concrete failure mode if rejected;
- retry-risk estimate;
- relative expected total cost assessment.

## 5. Separate multi-agent decision

`Ultra` is evaluated separately from the single-agent candidate matrix.

Do not count `Ultra` as a single-agent reasoning effort.

Recommend `Ultra` only when all of these are true:

- the current surface exposes it;
- the task can be split into meaningful independent subproblems;
- parallel subagents do not violate serialized branch, ref, mirror, lock, shared-wiring, or stable-read constraints;
- the expected retry reduction justifies the added execution cost and coordination risk.

Reject `Ultra` for a mutation sequence that requires one serialized authority chain, one ordered ref update, one shared file owner, or one atomic proof boundary.

`Max` remains a single-agent control when the current surface exposes it. Recommend it only for the hardest tasks when additional single-agent depth is required and cheaper verified controls have a concrete material failure mode.

## 6. Selection objective

Optimize for `MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK`.

Choose the cheapest verified candidate expected to complete the exact task correctly without a likely retry.

Use this qualitative model:

`expected total cost = initial token credits + retry probability x retry token credits + likely escalation credits`

Do not invent exact token volume, task credits, or monetary cost. If token-volume assumptions are unavailable, compare current rate-card dimensions and retry risk qualitatively.

Promote only when the next cheaper plausible candidate has a concrete task-specific failure mode.

## 7. Required task analysis

Evaluate:

- task type and exact objective;
- exact authorized read and write scope;
- runtime sensitivity;
- systems involved;
- novelty and ambiguity;
- architectural, economic, security, and release impact;
- concurrency, mirror, stable-read, and shared-wiring risk;
- validation complexity;
- expected retry cost;
- similar completed work;
- deterministic versus exploratory work;
- tool orchestration burden;
- whether the task is safely decomposable for multi-agent execution.

Return `status: BLOCKED` when scope or task identity is missing, mixed, ambiguous, conflicting, or dependent on unavailable authority.

## 8. Selection guidance

Prefer current officially recommended models when they satisfy the reliability threshold, but do not exclude a current officially supported lower-cost model merely because it is listed outside the recommended group.

Use the lowest verified control that meets the task reliability threshold.

Model escalation and control escalation are independent. Do not raise both automatically.

Do not select additional capability for comfort, prestige, unspecified safety margin, or file count.

The candidate frontier must be based on current evidence, not inherited assumptions about model generations.

## 9. Required recommendation report

Return all of the following before the pause:

- `status: WAITING_FOR_MODEL_SELECTION`
- optimization objective: `MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK`
- `catalog_checked_at_utc`
- `rate_card_checked_at_utc`
- exact official source URLs
- execution surface
- surface verification evidence
- current model inventory with availability statuses
- current surface-specific control labels
- evaluated single-agent candidate count
- task identity and classification
- exact analyzed scope
- plugin source used
- ordered skills invoked so far
- risk level
- analyzed factors
- single-agent candidate evaluation matrix
- separate `Ultra` evaluation
- sufficient candidates
- rejected candidates
- non-dominated frontier
- cheapest plausible candidate
- cheapest rejected candidate
- concrete rejection failure mode
- recommended model
- recommended control label
- next more expensive plausible candidate
- why weaker options are insufficient
- why stronger options are unnecessary
- capability bottleneck
- reasoning bottleneck
- retry-cost assessment
- estimated retry risk
- overprovisioning check
- confidence
- actual active model: `USER_SELECTED_UNVERIFIED`
- exact next user action: switch the current interface to the recommended option, then send exact `CONTINUE` in this same conversation

The report must compare adjacent plausible candidates and stop at the first verified option meeting the reliability threshold.

If a recommendation lacks concrete justification against the next cheaper plausible candidate, return `OVERPROVISIONED_RECOMMENDATION` and do not allow implementation.

## 10. Terminal response contract

The preflight response must end exactly as follows, with no text after it:

```text
CONTINUE
```

Failure statuses:

- `BLOCKED_MODEL_SURFACE_UNVERIFIED`
- `BLOCKED_MODEL_CATALOG_UNVERIFIED`
- `BLOCKED_RATE_CARD_UNVERIFIED`
- `BLOCKED_MODEL_AVAILABILITY_UNVERIFIED`
- `FAIL_STATIC_MODEL_CATALOG`
- `FAIL_FIXED_PAIR_COUNT`
- `FAIL_ULTRA_MISCLASSIFIED`
- `FAIL_MODEL_PREFLIGHT_NOT_PAUSED`
- `FAIL_CONTINUE_BLOCK_MISSING`
- `FAIL_IMPLEMENTED_BEFORE_CONTINUE`
- `FAIL_CONTINUE_WRONG_THREAD`
- `FAIL_SCOPE_CHANGED_AFTER_RECOMMENDATION`
- `FAIL_PLUGIN_ROUTING_SKIPPED`

Blocked responses must not include the terminal `CONTINUE` block.

## 11. Post-CONTINUE evidence

Before implementation begins, record:

- recommendation identity;
- official source verification timestamps;
- execution surface;
- same-thread continuation evidence;
- unchanged task identity;
- unchanged or freshly recomputed scope;
- selected model status as `USER_SELECTED_UNVERIFIED` unless externally proven;
- `scope-isolation-check` result;
- required specialized skills;
- implementation authorization status: `IMPLEMENTATION_ALLOWED`.

The final task report must include the preflight recommendation, source verification evidence, continuation evidence, and proof that implementation started only after `IMPLEMENTATION_ALLOWED`.
```

### 2. Replace section 8 in `AGENTS.md`

Replace everything from `## 8. Model selection rule` up to but not including `## 8.1 Parallel work policy` with this exact text:

```markdown
## 8. Model selection rule

The Codex model catalog, surface controls, availability conditions, and credit rates are dynamic. Static repository model whitelists and fixed model/control pair counts are forbidden.

For every task, the Asynchronia `model-selector` must, during the current preflight:

- identify the execution surface;
- read the current official OpenAI Codex Models documentation at `https://learn.chatgpt.com/docs/models`;
- read the current official Codex rate card at `https://help.openai.com/en/articles/20001106-codex-rate-card`;
- preserve exact surface-specific control labels rather than silently normalizing them;
- enumerate only model/control combinations supported by current official or client evidence;
- calculate the evaluated single-agent candidate count dynamically without a fixed denominator;
- evaluate `Ultra` separately as a multi-agent execution mode;
- record source URLs, verification timestamps, availability evidence, current rate-card evidence, rejected candidates, and the non-dominated frontier;
- recommend the cheapest reliable verified option after retry risk; and
- fail closed when the surface, catalog, availability condition, or rate card cannot be verified.

Only the Asynchronia plugin `model-selector` may originate, rank, or name a normal task recommendation. The user selects the active model. If the active selection cannot be externally verified, report `USER_SELECTED_UNVERIFIED`. Model self-report is `SELF_REPORTED_UNVERIFIED` and is not proof.

The repository preflight contract is a blocking pre-implementation gate. Codex must stop with `WAITING_FOR_MODEL_SELECTION`, emit exactly one standalone fenced `CONTINUE` block, and perform no implementation or mutable command before exact same-thread `CONTINUE`.

A one-time selector-maintenance task may use an exact ChatGPT-authored bootstrap selection only when the live project memory explicitly records that the current selector is stale and the maintenance task changes no unrelated project scope.

```

### 3. Update `tools/validate-asynchronia-auto-model-preflight.py`

Apply these exact edits and no unrelated refactor.

1. Replace:

```python
EXPECTED_PLUGIN_VERSION = "1.0.7"
```

with:

```python
EXPECTED_PLUGIN_VERSION = "1.0.8"
OFFICIAL_MODELS_URL = "https://learn.chatgpt.com/docs/models"
OFFICIAL_RATE_CARD_URL = "https://help.openai.com/en/articles/20001106-codex-rate-card"
```

2. Add this exact function immediately before `validate_texts`:

```python
def validate_dynamic_model_catalog_contract(failures: list[str]) -> None:
    selector_path = "plugins/asynchronia/skills/model-selector/SKILL.md"
    selector = read(selector_path)
    agents = read("AGENTS.md")

    for needle in (
        OFFICIAL_MODELS_URL,
        OFFICIAL_RATE_CARD_URL,
        "MODEL_CATALOG_DISCOVERY",
        "evaluated single-agent candidate count",
        "`Ultra` is evaluated separately",
        "BLOCKED_MODEL_SURFACE_UNVERIFIED",
        "BLOCKED_MODEL_CATALOG_UNVERIFIED",
        "BLOCKED_RATE_CARD_UNVERIFIED",
        "FAIL_FIXED_PAIR_COUNT",
        "FAIL_ULTRA_MISCLASSIFIED",
    ):
        assert_true(needle in selector, f"missing dynamic selector contract: {needle}", failures)

    for needle in (
        OFFICIAL_MODELS_URL,
        OFFICIAL_RATE_CARD_URL,
        "Static repository model whitelists and fixed model/control pair counts are forbidden.",
        "evaluate `Ultra` separately as a multi-agent execution mode",
        "A one-time selector-maintenance task may use an exact ChatGPT-authored bootstrap selection",
    ):
        assert_true(needle in agents, f"missing AGENTS dynamic catalog rule: {needle}", failures)

    forbidden_active_contracts = (
        "Available Codex models are exactly:",
        "Available reasoning levels are exactly Light, Medium, High and Extra High.",
        "Only these model names are valid:",
        "Only these reasoning levels are valid:",
        "evaluated pair count: `12/12`",
        "evaluated pair count: `18/18`",
    )
    for needle in forbidden_active_contracts:
        assert_true(needle not in selector, f"stale selector contract remains: {needle}", failures)
        assert_true(needle not in agents, f"stale AGENTS contract remains: {needle}", failures)

    assert_true(
        "Do not count `Ultra` as a single-agent reasoning effort." in selector,
        "Ultra must be excluded from the single-agent matrix",
        failures,
    )
    assert_true(
        "Do not create a cartesian product unless current official or client evidence proves every combination." in selector,
        "candidate construction must reject an unverified cartesian product",
        failures,
    )
```

3. In the `TextContract` for `plugins/asynchronia/skills/model-selector/SKILL.md`, replace its `required` tuple with:

```python
required=(
    "Use this skill automatically for every Asynchronia task",
    "`MODEL_CATALOG_DISCOVERY`",
    "`WAITING_FOR_MODEL_SELECTION`",
    "`CONTINUE_RECEIVED`",
    "`IMPLEMENTATION_ALLOWED`",
    OFFICIAL_MODELS_URL,
    OFFICIAL_RATE_CARD_URL,
    "evaluated single-agent candidate count",
    "`Ultra` is evaluated separately",
    "actual active model: `USER_SELECTED_UNVERIFIED`",
),
```

and replace its `forbidden` tuple with:

```python
forbidden=(
    "must never create a pause, stop, continuation token, or execution prerequisite",
    "Only these model names are valid:",
    "Only these reasoning levels are valid:",
    "evaluated pair count: `12/12`",
    "evaluated pair count: `18/18`",
),
```

4. In the `TextContract` for `AGENTS.md`, replace its `required` tuple with:

```python
required=(
    "blocking pre-implementation gate",
    "`WAITING_FOR_MODEL_SELECTION`",
    "exact same-thread `CONTINUE`",
    OFFICIAL_MODELS_URL,
    OFFICIAL_RATE_CARD_URL,
    "Static repository model whitelists and fixed model/control pair counts are forbidden.",
    "evaluate `Ultra` separately as a multi-agent execution mode",
),
```

and replace its `forbidden` tuple with:

```python
forbidden=(
    "informational and non-blocking, and it must not become an execution prerequisite, pause, or resume token",
    "Available Codex models are exactly:",
    "Available reasoning levels are exactly Light, Medium, High and Extra High.",
),
```

5. In `main()`, add this exact call immediately after `validate_texts(failures)`:

```python
    validate_dynamic_model_catalog_contract(failures)
```

6. In the successful JSON output, add this exact key at the same level as `terminalContinueFence`:

```python
                "dynamicModelCatalog": "PASS",
```

Preserve every existing transition, adversarial, and terminal-fence test.

### 4. Update `plugins/asynchronia/.codex-plugin/plugin.json`

Apply only these exact value replacements:

- Replace version `1.0.7` with `1.0.8`.
- Replace `interface.longDescription` with:

```text
Provides mandatory automatic task routing, live official Codex catalog and rate-card discovery, blocking model selection with same-thread CONTINUE, repository scope isolation, smoke orchestration, deployment verification, acceptance gating, and validation rules for Asynchronia changes.
```

- Replace `interface.defaultPrompt` with this exact array:

```json
[
  "Automatically route this Asynchronia task and run the mandatory model preflight before any edits.",
  "Discover the current official Codex models, surface-specific controls, availability conditions, and rate card before recommending an option.",
  "Evaluate verified single-agent candidates dynamically, evaluate Ultra separately as multi-agent execution, pause, and wait for same-thread CONTINUE.",
  "Run task-router, scope-isolation-check, and model-selector before implementation.",
  "Validate that no implementation starts before the mandatory CONTINUE resume token."
]
```

Do not change any other manifest key.

### 5. Update `.agents/plugins/marketplace.json`

Replace the Asynchronia plugin version `1.0.7` with `1.0.8`. Do not change any other key or value.

## Read scope

- `AGENTS.md`
- `AGENTS.override.md`
- `ORCHESTRATION.md`
- `BRIDGE.md`
- `TASKS.md`
- `PROJECT_MEMORY.md`
- `.ai-work/SCHEMA.md`
- the four task package files for this task
- the five authorized write files
- repository search results for active model-selector references
- accessible installed Asynchronia plugin files needed only for parity proof

## Write scope

Repository writes are exactly:

- `AGENTS.md`
- `plugins/asynchronia/skills/model-selector/SKILL.md`
- `tools/validate-asynchronia-auto-model-preflight.py`
- `plugins/asynchronia/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

Work may update only `02-work-plan.md` and `STATE.md` on the work branch to record execution evidence. Work must not rewrite `01-chat-brief.md`.

## Risk controls

- Verify `origin/main` is still `50d77eb5b5273fffc491a9f111ecdc5d526c7cea` before the first edit. If it moved, inspect the delta and stop on overlap.
- Verify the implementation branch starts exactly at live `origin/main`.
- Use a clean dedicated worktree for the implementation branch.
- Do not invoke the stale selector for this bootstrap repair. Use the exact ChatGPT-authored bootstrap selection `GPT-5.6 Sol` with `High` reasoning.
- Do not modify bridge refs, Stage 6 files, runtime files, or task-routing behavior.
- Do not update historical reports containing old model names.
- Stop if an additional tracked `model-selector/SKILL.md` mirror is discovered.
- Never claim installed plugin parity without hashing the installed file.

## Validation plan

Run all of these commands:

```bash
python3 -m json.tool plugins/asynchronia/.codex-plugin/plugin.json >/dev/null
python3 -m json.tool .agents/plugins/marketplace.json >/dev/null
python3 tools/validate-asynchronia-auto-model-preflight.py
python3 tools/validate-orchestration-policy.py
python3 tools/validate_ai_work_pipeline.py
```

Run these active-contract searches and require no matches:

```bash
rg -n 'Available Codex models are exactly|Available reasoning levels are exactly Light, Medium, High and Extra High|Only these model names are valid|Only these reasoning levels are valid|evaluated pair count: `12/12`|evaluated pair count: `18/18`' AGENTS.md plugins/asynchronia/skills/model-selector/SKILL.md
```

Require these positive searches:

```bash
rg -n 'learn.chatgpt.com/docs/models|20001106-codex-rate-card|MODEL_CATALOG_DISCOVERY|evaluated single-agent candidate count|Ultra.*separat' AGENTS.md plugins/asynchronia/skills/model-selector/SKILL.md tools/validate-asynchronia-auto-model-preflight.py
```

Require exact changed paths:

```bash
git diff --name-only origin/main...HEAD
```

The output must be exactly the five authorized repository files.

Compute and report:

```bash
sha256sum plugins/asynchronia/skills/model-selector/SKILL.md
```

If an installed Asynchronia `model-selector/SKILL.md` exists, compute its SHA-256 and require equality. If no installed file is accessible, report `INSTALLED_PLUGIN_PARITY: UNVERIFIED` and do not classify parity as PASS.

## Codex prompt strategy

No Codex task is created. This is a bootstrap maintenance operation applied by Work from exact ChatGPT-authored content because the selector cannot safely select a model for its own repair.

## Blockers

- `BLOCKED_BASELINE_MOVED`
- `BLOCKED_SCOPE_COLLISION`
- `BLOCKED_UNDECLARED_MIRROR`
- `BLOCKED_PATCH_MISMATCH`
- `BLOCKED_VALIDATION_FAILURE`
- `BLOCKED_INSTALLED_PLUGIN_PARITY`

On success, commit and push the implementation branch, refetch it, and update `STATE.md` to `READY_FOR_REVIEW` with the exact remote head.