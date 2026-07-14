---
name: model-selector
description: Run the mandatory blocking Codex model preflight, reconcile local Codex app-server catalog evidence with active desktop UI picker selectability, evaluate every authority-confirmed model-effort pair for the exact task, and recommend the lowest expected total-cost reliable option before same-thread CONTINUE.
---

# Model Selector

## Selector 1.0.10 confirmed-snapshot production path

For routine Asynchronia Codex tasks, automatically load and validate the canonical
Asynchronia-owned snapshot at
`plugins/asynchronia/snapshots/confirmed-model-effort-snapshot.json` before task
mutation. The snapshot is versioned, `USER_CONFIRMED`, hash-validated, ordered,
and complete. Print its revision, confirmation timestamp, source, calculated
model count, calculated model-effort pair count, and every candidate in the
matrix. Evaluate every pair and recommend the lowest reliable pair.

This production path does not attempt ChatGPT Desktop private socket access,
renderer injection, AppleScript JavaScript execution, Accessibility scraping,
OCR, or live app-server inventory. The snapshot is not live Desktop extraction.
It must never update itself from a cache, historical evidence, inferred data, or
live host data.

Ask the normal user only to verify whether the printed inventory still matches
the active Codex picker. Accept exactly `INVENTORY_OK` or `INVENTORY_CHANGED`.
`INVENTORY_OK` records confirmation for the same thread and moves to
`WAITING_FOR_MODEL_SELECTION`; exact same-thread `CONTINUE` is still required
before mutation. `INVENTORY_CHANGED` returns
`BLOCKED_MODEL_INVENTORY_CHANGED`, provides
`TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260714`, and stops. Never ask the
normal user to count models or pairs, reproduce efforts, rewrite the matrix, or
provide screenshots during routine preflight.

Snapshot replacement is a separate controlled workflow using
`tools/maintain-asynchronia-model-snapshot.py`. It accepts a structured file,
validates identifiers and duplicate/order rules, calculates counts and the
canonical hash, prints an old-versus-new diff, and requires explicit
confirmation. Git history preserves the replaced snapshot. Fallback or inferred
data is never labeled live UI authority.

Use this skill automatically for every Asynchronia Codex task before implementation, validation, publication, or any other state-changing work.

The user selects the active model. This skill does not claim to inspect or change the model selected in the interface. It collects app-server catalog evidence, reconciles it with active execution-surface picker evidence, evaluates the authority-confirmed inventory, recommends one model-effort pair, pauses, and waits for exact same-thread `CONTINUE`.

## 1. Mandatory preflight state machine

The legal states are:

1. `PREFLIGHT_REQUIRED`
2. `MODEL_INVENTORY_DISCOVERY`
3. `APP_SERVER_CATALOG_EVIDENCE_RECORDED`
4. `MODEL_INVENTORY_RECONCILIATION_REQUIRED`
5. `USER_UI_INVENTORY_REQUIRED`
6. `USER_UI_INVENTORY_RECEIVED`
7. `MODEL_INVENTORY_VERIFIED`
8. `TASK_ANALYSIS_COMPLETE`
9. `MODEL_RECOMMENDATION_READY`
10. `WAITING_FOR_MODEL_SELECTION`
11. `CONTINUE_RECEIVED`
12. `SCOPE_REVALIDATED`
13. `IMPLEMENTATION_ALLOWED`

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

## 3. Catalog evidence and UI authority

Static model whitelists, static effort whitelists, and fixed model-effort pair counts are forbidden.

For every preflight, collect current Codex catalog evidence from the local Codex installation by starting `codex app-server` over stdio and calling the stable JSON-RPC method `model/list` after the required `initialize` and `initialized` handshake.

Use:

```json
{"method":"initialize","id":0,"params":{"clientInfo":{"name":"asynchronia_model_selector","title":"Asynchronia Model Selector","version":"1.0.9"}}}
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

The preflight must record app-server catalog evidence:

- `inventory_checked_at_utc`;
- the exact command used to start app-server;
- app-server initialization success;
- every page cursor requested;
- the complete app-server model response;
- each model `id`, `model`, `displayName`, `hidden`, `isDefault`, `defaultReasoningEffort`, `supportedReasoningEfforts`, `inputModalities`, and optional `upgrade` metadata;
- the Codex CLI version when available;
- the active repository path and execution surface.

Use only entries returned with `hidden: false` or omitted `hidden` when `includeHidden: false` was used as app-server catalog evidence. Do not recommend hidden entries.

Do not use repository memory, previous chats, old reports, static plugin text, model self-report, or remembered product knowledge as inventory authority.

Do not add, remove, rename, normalize, translate, or infer a model or effort label. Preserve returned identifiers exactly.

For Codex Desktop, active desktop UI picker evidence controls actual selectability. App-server `model/list` remains supporting catalog evidence and is not automatically picker authority.

If app-server catalog evidence and active UI picker evidence match exactly, use the matched inventory as the candidate matrix.

If app-server catalog evidence differs from the active UI picker, omits UI-selectable models or efforts, includes app-server-only models or efforts, has a schema/cache error, or returns labels that do not match active UI labels, enter `MODEL_INVENTORY_RECONCILIATION_REQUIRED`.

If exact current same-thread UI inventory is unavailable during reconciliation, return `BLOCKED_MODEL_INVENTORY_MISMATCH`, report the exact app-server evidence and missing UI evidence, request a current screenshot or exact text inventory, and do not emit `CONTINUE`.

If the user supplies exact current same-thread UI inventory for the active Codex Desktop picker, enter `USER_UI_INVENTORY_RECEIVED`, use only that UI inventory for the candidate matrix, and record app-server data as supporting evidence. Never merge app-server-only models or efforts into a UI-authoritative matrix.

User-confirmed UI inventory must be explicit, complete, current, same-thread, surface-specific, and tied to the active Codex Desktop picker. It is per-run evidence only and must not be stored as repository memory, reused cross-thread, reused for another task, or converted into a durable fallback catalog.

Preserve exact UI model names and effort labels. Do not normalize `Light` to `low`, `Extra High` to `xhigh`, or any other UI label to an app-server/internal identifier.

If `codex` is unavailable, app-server fails, initialization fails, `model/list` fails, pagination is incomplete, the response is malformed, or the visible inventory is empty, record that failure as app-server catalog evidence. For Codex Desktop, continue to UI reconciliation when exact current UI picker evidence is available; otherwise return `BLOCKED_MODEL_INVENTORY_UNAVAILABLE` and do not emit `CONTINUE`.

If any visible model has no non-empty `supportedReasoningEfforts`, return `BLOCKED_MODEL_EFFORT_INVENTORY_INCOMPLETE` and do not silently substitute its default effort.

## 4. Candidate construction

Construct the complete candidate matrix from the exact verified authority inventory:

- one candidate for every authority-confirmed model;
- crossed only with that model's own returned or user-confirmed supported reasoning efforts;
- no global cartesian product;
- no assumed support inherited from another model;
- no fixed denominator.

Report:

`evaluated model-effort pair count: N/N`

where both values are calculated from the discovered complete matrix.

For each model, preserve the effort order returned by `supportedReasoningEfforts` or supplied in the exact current UI inventory. That order defines adjacent efforts for comparison. Do not invent an effort ordering from names.

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
- `BLOCKED_MODEL_INVENTORY_MISMATCH`
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
