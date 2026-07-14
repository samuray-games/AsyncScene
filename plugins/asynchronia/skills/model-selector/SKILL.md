---
name: model-selector
description: Run the mandatory blocking model preflight using the current ChatGPT Desktop live host inventory, evaluate every returned model-effort pair, and wait for same-thread CONTINUE before mutation.
---

# Model Selector 1.0.10

Use this skill automatically for every Asynchronia task before implementation, validation, publication, or another state-changing action. The user selects the active model; discovery is read-only and must never change it.

## 1. Mandatory state machine

`PREFLIGHT_REQUIRED` -> `MODEL_INVENTORY_DISCOVERY` -> `LIVE_HOST_INVENTORY_RECORDED` -> `MODEL_INVENTORY_VERIFIED` -> `TASK_ANALYSIS_COMPLETE` -> `MODEL_RECOMMENDATION_READY` -> `WAITING_FOR_MODEL_SELECTION` -> `CONTINUE_RECEIVED` -> `SCOPE_REVALIDATED` -> `IMPLEMENTATION_ALLOWED`.

Before `IMPLEMENTATION_ALLOWED`, do not edit, branch, create a worktree, commit, push, publish, merge, rebase, reset, stash, clean, amend, cherry-pick, or claim implementation completion. A successful preflight response ends with exactly one standalone fenced block containing only `CONTINUE`. Only exact trimmed same-thread `CONTINUE` advances the state. Revalidate task identity, branch authority, scope, dependencies, and inventory freshness after it; return to `PREFLIGHT_REQUIRED` if any material fact changed.

## 2. Live host authority

Static model or effort catalogs, fixed model counts, effort counts, pair counts, and permanent renderer asset filenames are forbidden.

For ChatGPT Desktop, dynamically inspect `/Applications/ChatGPT.app/Contents/Resources/app.asar`. Parse its ASAR index and locate the current JavaScript renderer asset by the `list-models-for-host` mechanism and inventory-setting markers, not by a remembered chunk hash or filename. Record the ChatGPT Desktop version, bundle path, located renderer asset, discovery timestamp, and source mechanism.

Invoke the live host query `list-models-for-host` with `hostId`, `includeHidden: true`, `cursor`, and `limit`. Follow every returned cursor until exhausted. Preserve response order and the exact returned values of `model`, `hidden`, `isDefault`, `defaultReasoningEffort`, and `supportedReasoningEfforts`; do not add, remove, normalize, translate, or infer identifiers.

Use the non-mutating extractor at `tools/extract-chatgpt-live-host-inventory.py`. Its live-host adapter receives `{"query":"list-models-for-host","arguments":{...}}` on standard input and returns one raw JSON response on standard output; it must execute the same Desktop internal query and must not set the selected model. Captured response pages are accepted only as evidence from that adapter.

Use current host settings `available_models`, `use_hidden_models`, and `default_model` as settings evidence. Hidden entries remain in the complete discovered inventory but enter the user-selectable matrix only when `use_hidden_models` is explicitly true. The selected model remains unchanged throughout discovery.

Print the complete discovered inventory before any recommendation. Compute from the live returned data: visible model count, supported model-effort pair count, and one matrix row for every returned model paired only with that model's own supported efforts. Preserve each returned effort order for adjacent-effort comparisons. Report `evaluated model-effort pair count: N/N` from that matrix.

Record a canonical raw inventory hash over the paginated responses and a filtered inventory hash over the selectable ordered inventory. Do not report a fallback source as live UI authority.

## 3. Fallback and failure

Use a fallback only after the live host query cannot be accessed, in this order: a previously user-confirmed snapshot, app-server evidence, then historical cache hints. Label the result `MODEL_INVENTORY_FALLBACK` and identify its source. A fallback is supporting evidence, never live UI authority. If neither the live query nor a confirmed fallback is available, return `BLOCKED_MODEL_INVENTORY_UNAVAILABLE` and do not emit `CONTINUE`.

Return `BLOCKED_MODEL_EFFORT_INVENTORY_INCOMPLETE` for a selectable model without non-empty `supportedReasoningEfforts`, and `BLOCKED_MODEL_INVENTORY_CONFLICT` for conflicting duplicate model-effort entries.

## 4. Evaluation and recommendation

Optimize for `MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK`. Evaluate every live authority-confirmed model-effort pair, compare each effort with adjacent efforts for the same model, find the lowest reliable effort per model, build the cross-model non-dominated frontier, and explain the cheapest rejected and next more expensive plausible candidates. Do not invent cost inputs; mark unavailable values as unavailable.

The report before the pause includes the complete inventory, provenance, raw and filtered hashes, visible count, pair count, full matrix, fallback label when applicable, `USER_SELECTED_UNVERIFIED`, and the exact next user action to select the recommendation then send `CONTINUE` in this thread.

## 5. Post-CONTINUE evidence

Before implementation, record the recommendation identity, inventory hashes and timestamp, same-thread continuation, unchanged task and scope, `scope-isolation-check` result, selected-model status, and `IMPLEMENTATION_ALLOWED`. The final task report includes that evidence and proves implementation began only after the continuation.
