---
name: model-selector
description: Run the blocking Asynchronia 1.0.10 confirmed-snapshot preflight, perform deterministic task-specific model-effort analysis, and authorize implementation only after exact same-thread INVENTORY_OK and CONTINUE.
---

# Model Selector 1.0.10

Use this skill automatically for every Asynchronia Codex task before implementation,
validation, publication, or any other repository mutation.

## One inventory authority

The routine inventory authority is exactly:

`plugins/asynchronia/snapshots/confirmed-model-effort-snapshot.json`

The selector loads, schema-validates, hash-validates, and freshness-validates this
`USER_CONFIRMED` snapshot. It preserves model and effort order, calculates the
complete model and pair counts from the inventory, and constructs the complete candidate matrix.
It never updates the snapshot automatically.

The normal production path does not require or attempt `codex app-server`,
`model/list`, current UI text inventory, screenshots, Accessibility, OCR, private
Desktop transport, renderer injection, or AppleScript JavaScript execution. The
snapshot is not live Desktop extraction. Historical, fallback, inferred, cached,
or app-server data is never labeled live UI authority.

## State machine

The legal production states are:

1. `PREFLIGHT_REQUIRED`
2. `WAITING_FOR_INVENTORY_CONFIRMATION`
3. `INVENTORY_CONFIRMED`
4. `WAITING_FOR_MODEL_SELECTION`
5. `CONTINUE_RECEIVED`
6. `SCOPE_REVALIDATED`
7. `IMPLEMENTATION_ALLOWED`

The durable state artifact is per-thread, stored outside Git under the local
Asynchronia selector state directory, and never under `.ai-bridge/**`. It binds
task ID, thread ID, branch, baseline SHA, snapshot revision and hash,
`taskDescriptionHash`, complete matrix hash, recommendation identity, confirmation
timestamp, state, and expiry.

Before `IMPLEMENTATION_ALLOWED`, do not edit files, create locks, commit, push,
publish, merge, rebase, reset, stash, clean, amend, or cherry-pick.

## Structured task analysis

Every production preflight receives a complete structured task description with:

- task ID, task type, and objective;
- read scope, write scope, and affected systems;
- runtime sensitivity;
- architecture, security, economy, and release impact;
- validation complexity;
- expected implementation size;
- ambiguity and novelty;
- concurrency and branch risk.

Missing or malformed task information is fail-closed. The selector evaluates every snapshot model-effort pair exactly once.
Each evaluation records reliability
verdict, rejection reason when unreliable, retry risk, escalation risk, and
relative cost class. The deterministic analyzer selects the lowest-cost pair that
meets the reliability constraint, reports the evaluated `N/N` count, cheapest
rejected pair and reason, recommendation, and next more capable plausible pair.
It must never use an unconditional `RELIABLE` fallback.

The optimization objective is:

`MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK`

## User confirmation and authorization

Routine output automatically prints snapshot revision and hash, the complete
inventory, calculated model count, calculated pair count, every pair evaluation,
the recommendation, and the exact next response.

Ask the normal user only to verify whether the printed inventory matches the
active picker. Accept exactly one same-thread response:

- `INVENTORY_OK`: persist confirmation and enter `WAITING_FOR_MODEL_SELECTION`.
- `INVENTORY_CHANGED`: enter `BLOCKED_MODEL_INVENTORY_CHANGED`, provide
  `TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260714`, and stop. Never ask the user
  to count models, reproduce efforts, rewrite the matrix, or provide screenshots.

`INVENTORY_OK` is rejected when task ID, thread ID, branch, baseline, snapshot,
task hash, matrix hash, or recommendation identity differs. Exact same-thread `CONTINUE` is required before mutation.
`CONTINUE` is rejected when state is
absent, stale, unconfirmed, cross-thread, or any bound identity has changed.
After valid `CONTINUE`, revalidate task, scope, branch, baseline, snapshot, and
recommendation before entering `IMPLEMENTATION_ALLOWED`.

## CLI contract

Use `tools/run-asynchronia-model-preflight.py` with explicit commands:

- `start --task-file ... --thread-id ... --baseline ...`
- `inventory-ok --task-file ... --thread-id ... --baseline ...`
- `inventory-changed --thread-id ...`
- `continue --task-file ... --thread-id ... --baseline ... --token CONTINUE`
- `inspect --thread-id ...`
- `invalidate --thread-id ...`

The state persists across separate CLI processes. `inspect` is read-only. State
invalidation is explicit and prevents continuation until a fresh preflight.

## Snapshot maintenance

Snapshot replacement is separate from production selection and uses
`tools/maintain-asynchronia-model-snapshot.py`. It validates identifiers, duplicate
models, duplicate efforts, empty effort lists, order, counts, canonical hash, and
status; prints an old-versus-new diff; and requires explicit user confirmation.
Git history preserves the previous snapshot. The production selector never
updates its own snapshot.

## Required report and terminal gate

The preflight report includes status, task identity, exact scope, ordered skill
route, snapshot metadata, complete matrix, every pair evaluation, recommendation,
rejection rationale, state identity, and exact next action.

A waiting report ends with exactly one standalone fenced block containing only
`CONTINUE`. No text follows it. Blocked or failed reports contain no `CONTINUE`.

Only exact trimmed `CONTINUE` from the same thread advances authorization.
