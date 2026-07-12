---
name: model-selector
description: Run the mandatory blocking Codex model preflight, discover the picker-visible model inventory and supported reasoning efforts from the local Codex app-server, evaluate every available model-effort pair for the exact task, and recommend the lowest expected total-cost reliable option before same-thread CONTINUE.
---

# Model Selector

Use this skill automatically for every Asynchronia Codex task before implementation, validation, publication, or any other state-changing work.

The user selects the active model. This skill does not claim to inspect or change the model selected in the interface. It discovers the available picker-visible inventory, evaluates it, recommends one model-effort pair, pauses, and waits for exact same-thread `CONTINUE`.

## 1. Mandatory preflight state machine

The legal states are:

1. `PREFLIGHT_REQUIRED`
2. `MODEL_INVENTORY_DISCOVERY`
3. `MODEL_INVENTORY_VERIFIED`
4. `TASK_ANALYSIS_COMPLETE`
5. `MODEL_RECOMMENDATION_READY`
6. `WAITING_FOR_MODEL_SELECTION`
7. `CONTINUE_RECEIVED`
8. `SCOPE_REVALIDATED`
9. `IMPLEMENTATION_ALLOWED`

Before `IMPLEMENTATION_ALLOWED`, Codex must not:

- edit files;
- create or modify workspace locks;
- run state-changing commands;
- implement code or documentation changes;
- commit, push, publish, merge, rebase, reset, stash, clean, amend, or cherry-pick;
- claim implementation or validation completion.

Read-only inventory discovery through `codex app-server` is allowed during preflight.

A valid preflight response must end with exactly one standalone fenced code block whose only content is `CONTINUE`. No text may follow that block.

Only exact trimmed `CONTINUE` from the user in the same thread advances the state to `CONTINUE_RECEIVED`.

After `CONTINUE`, Codex must revalidate task identity, branch authority, exact scope, mirrors, shared wiring, dependencies, inventory freshness, and required systems. If anything material changed, return to `PREFLIGHT_REQUIRED` and issue a fresh recommendation.

`CONTINUE` from another thread, task, scope, inventory snapshot, or recommendation is invalid.

## 2. Automatic invocation contract

The Asynchronia plugin must be resolved automatically for every Asynchronia task.

Use the active installed package when available. If loader attachment or telemetry is unavailable, use the repository skill source under `plugins/asynchronia/skills/` as the mandatory fallback.

The ordered preflight route is:

1. `task-router`
2. `scope-isolation-check`
3. `model-selector`
4. `parallel-scope-planner` when multiple lanes, mirrors, shared ownership, or dependencies exist
5. specialized skills required by routing
6. pause for same-thread `CONTINUE`

## 3. Authoritative live inventory discovery

Static model whitelists, static effort whitelists, and fixed model-effort pair counts are forbidden.

For every preflight, discover the current picker-visible model inventory from the local Codex installation by starting `codex app-server` over stdio and calling the stable JSON-RPC method `model/list` after the required `initialize` and `initialized` handshake.

Use:

```json
{"method":"initialize","id":0,"params":{"clientInfo":{"name":"asynchronia_model_selector","title":"Asynchronia Model Selector","version":"1.0.8"}}}
```

Then:

```json
{"method":"initialized","params":{}}
```

Then request every page:

```json
{"method":"model/list","id":1,"params":{"limit":100,"includeHidden":false}}
```

If `nextCursor` is non-null, request subsequent pages with the returned cursor until `nextCursor` is null.

The preflight must record:

- `inventory_checked_at_utc`;
- the exact command used to start app-server;
- app-server initialization success;
- every page cursor requested;
- the complete picker-visible model response;
- each model `id`, `model`, `displayName`, `hidden`, `isDefault`, `defaultReasoningEffort`, `supportedReasoningEfforts`, `inputModalities`, and optional `upgrade` metadata;
- the Codex CLI version when available;
- the active repository path and execution surface.

Use only entries returned with `hidden: false` or omitted `hidden` when `includeHidden: false` was used. Do not recommend hidden entries.

Do not use repository memory, previous chats, old reports, static plugin text, model self-report, or remembered product knowledge as inventory authority.

Do not add, remove, rename, normalize, translate, or infer a model or effort label. Preserve returned identifiers exactly.

If `codex` is unavailable, app-server fails, initialization fails, `model/list` fails, pagination is incomplete, the response is malformed, or the visible inventory is empty, return `BLOCKED_MODEL_INVENTORY_UNAVAILABLE` and do not emit `CONTINUE`.

If any visible model has no non-empty `supportedReasoningEfforts`, return `BLOCKED_MODEL_EFFORT_INVENTORY_INCOMPLETE` and do not silently substitute its default effort.

## 4. Candidate construction

Construct the complete candidate matrix from the exact live response:

- one candidate for every picker-visible model;
- crossed only with that model's own returned `supportedReasoningEfforts`;
- no global cartesian product;
- no assumed support inherited from another model;
- no fixed denominator.

Report:

`evaluated model-effort pair count: N/N`

where both values are calculated from the discovered complete matrix.

For each model, preserve the effort order returned by `supportedReasoningEfforts`. That order defines adjacent efforts for comparison. Do not invent an effort ordering from names.

If duplicate model-effort identifiers appear, deduplicate only byte-identical duplicates and report them. Conflicting duplicates are `BLOCKED_MODEL_INVENTORY_CONFLICT`.

## 5. Required task analysis

Analyze the exact task against every candidate pair. Evaluate:

- task type and objective;
- exact read and write scope;
- deterministic versus exploratory work;
- runtime sensitivity;
- systems and tools involved;
- novelty and ambiguity;
- architectural, economic, security, and release impact;
- concurrency, mirror, stable-read, lock, branch, and shared-wiring risk;
- validation complexity;
- context size and retrieval burden;
- expected implementation length;
- expected retry probability;
- expected escalation probability;
- likely failure mode at insufficient capability or effort;
- whether the task is safely decomposable;
- similar accepted work when available.

Return `status: BLOCKED` when task identity or scope is missing, mixed, ambiguous, conflicting, or dependent on unavailable authority.

## 6. Cost and reliability objective

Optimize for:

`MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK`

Reliability is a hard constraint. Among candidates expected to complete the exact task correctly, choose the lowest expected total-cost option.

Use:

`expected total cost = initial model cost + expected reasoning-token cost + retry probability x retry cost + escalation probability x escalation cost`

Use current official rate-card evidence when available. Record the rate-card URL and check timestamp. Do not invent exact token counts, credit multipliers, prices, or effort multipliers that are not published or measured.

When exact cost inputs are unavailable, use an explicit ordinal comparison based on:

- published relative model cost;
- lower versus higher returned effort for the same model;
- expected output and reasoning volume;
- task-specific retry risk;
- likely escalation path.

Mark every unsupported numeric assumption as unavailable rather than fabricating precision.

## 7. Exhaustive pair evaluation

For every model-effort pair, report:

- model id and display name;
- effort identifier and description;
- inventory evidence;
- task-fit classification: `INSUFFICIENT`, `SUFFICIENT`, or `OVERPROVISIONED`;
- task-specific capability bottleneck;
- task-specific effort bottleneck;
- concrete likely failure mode;
- retry-risk estimate: `LOW`, `MEDIUM`, or `HIGH` with justification;
- expected total-cost tier relative to the other discovered pairs;
- whether the pair is dominated by another pair;
- final disposition.

Do not omit a pair because it appears obviously weak, expensive, redundant, old, new, default, or unfamiliar.

## 8. Mandatory adjacent-effort comparison

For every model, compare each effort with the immediately lower and immediately higher effort in that model's returned order when those neighbors exist.

For each adjacent comparison, state:

- what additional task-relevant reliability the higher effort buys;
- what additional cost or latency it is expected to introduce;
- whether the lower effort has a concrete material failure mode;
- whether the higher effort reduces retry risk enough to justify promotion;
- the lowest effort for that model that meets the reliability threshold.

A promotion to a higher effort is valid only when the immediately lower effort has a concrete task-specific material failure mode or materially higher expected total cost after retry risk.

If the recommendation does not include explicit comparison with both available adjacent efforts, return `FAIL_ADJACENT_EFFORT_COMPARISON_MISSING`.

## 9. Cross-model comparison

After finding the lowest reliable effort for each model:

1. compare those per-model winners across all visible models;
2. construct the non-dominated frontier for reliability and expected total cost;
3. identify the cheapest plausible pair;
4. identify the cheapest rejected pair and its concrete failure mode;
5. identify the next cheaper plausible pair below the recommendation;
6. identify the next more expensive plausible pair above the recommendation;
7. choose the first pair on the cost-ordered frontier that meets the reliability threshold.

Model escalation and effort escalation are independent. Do not raise both automatically.

Do not prefer a model because it is newer, default, famous, or described as recommended. Do not prefer a lower-cost model when its expected retry-adjusted total cost is higher.

## 10. Required recommendation report

Return all of the following before the pause:

- `status: WAITING_FOR_MODEL_SELECTION`;
- optimization objective: `MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK`;
- `inventory_checked_at_utc`;
- inventory source: `codex app-server model/list`;
- execution surface and repository path;
- complete picker-visible model inventory;
- complete effort inventory per model;
- `evaluated model-effort pair count: N/N`;
- task identity and classification;
- exact analyzed scope;
- plugin source used;
- ordered skills invoked;
- risk level;
- analyzed factors;
- exhaustive model-effort evaluation matrix;
- adjacent-effort comparisons for every model;
- lowest reliable effort per model;
- non-dominated frontier;
- cheapest plausible pair;
- cheapest rejected pair and concrete rejection failure mode;
- recommended model id and display name;
- recommended effort identifier;
- next cheaper plausible pair and why it is insufficient;
- next more expensive plausible pair and why it is unnecessary;
- capability bottleneck;
- effort bottleneck;
- retry-cost assessment;
- estimated retry risk;
- overprovisioning check;
- confidence;
- actual active model: `USER_SELECTED_UNVERIFIED`;
- exact next user action: select the recommended model and effort in the current Codex interface, then send exact `CONTINUE` in this same thread.

If the recommendation lacks a complete matrix, adjacent-effort analysis, or concrete comparison against neighboring plausible options, return `OVERPROVISIONED_RECOMMENDATION` or the applicable failure status and do not allow implementation.

## 11. Terminal response contract

The successful preflight response must end exactly as follows, with no text after it:

```text
CONTINUE
```

Blocked and failed responses must not include the terminal `CONTINUE` block.

Failure statuses include:

- `BLOCKED_MODEL_INVENTORY_UNAVAILABLE`
- `BLOCKED_MODEL_EFFORT_INVENTORY_INCOMPLETE`
- `BLOCKED_MODEL_INVENTORY_CONFLICT`
- `FAIL_STATIC_MODEL_CATALOG`
- `FAIL_FIXED_PAIR_COUNT`
- `FAIL_INCOMPLETE_PAIR_MATRIX`
- `FAIL_ADJACENT_EFFORT_COMPARISON_MISSING`
- `FAIL_MODEL_PREFLIGHT_NOT_PAUSED`
- `FAIL_CONTINUE_BLOCK_MISSING`
- `FAIL_IMPLEMENTED_BEFORE_CONTINUE`
- `FAIL_CONTINUE_WRONG_THREAD`
- `FAIL_SCOPE_CHANGED_AFTER_RECOMMENDATION`
- `FAIL_PLUGIN_ROUTING_SKIPPED`

## 12. Post-CONTINUE evidence

Before implementation begins, record:

- recommendation identity;
- inventory snapshot hash or canonical JSON hash;
- inventory verification timestamp;
- same-thread continuation evidence;
- unchanged task identity;
- unchanged or freshly recomputed scope;
- selected model status as `USER_SELECTED_UNVERIFIED` unless externally proven;
- `scope-isolation-check` result;
- required specialized skills;
- implementation authorization status: `IMPLEMENTATION_ALLOWED`.

The final task report must include the preflight recommendation, inventory evidence, continuation evidence, and proof that implementation started only after `IMPLEMENTATION_ALLOWED`.
