---
name: model-selector
description: Run the blocking Asynchronia 1.0.13 authorization split, short-circuit read-only canaries without matrix evaluation, and authorize mutation only after exact same-thread INVENTORY_OK and CONTINUE.
---

# Model Selector 1.0.13

Use this skill automatically for every Asynchronia Codex task before implementation,
validation, publication, or any other repository mutation.

## Two-path authorization

The selector now has two distinct authorization paths:

- `READ_ONLY_ALLOWED` for tasks whose write scope is explicitly empty or `NONE_READ_ONLY`;
- `MUTATION_PREFLIGHT_REQUIRED` for every task that can mutate repository files, refs, locks, cache, project memory, publication state, or other external state.

Read-only tasks must not evaluate the complete candidate matrix, must not emit a recommendation, and must not request `INVENTORY_OK` or `CONTINUE`.
Read-only tasks therefore have `no matrix evaluation` and `no recommendation`.
Mutation tasks retain the full executable CLI preflight, complete matrix evaluation, `INVENTORY_OK`, `WAITING_FOR_MODEL_SELECTION`, and exact same-thread `CONTINUE` contract.
Mutation-capable workflows must use a durable same-thread `IMPLEMENTATION_ALLOWED` guard before changing files, refs, locks, cache, publication state, or project memory.

## One inventory authority

The routine inventory authority is exactly:

`plugins/asynchronia/model-selector-authority.json`

The authority manifest points to the Markdown source of truth:

`../.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/UI-VISIBLE-MODEL-INVENTORY.md`

The manifest uses `repository-markdown` provenance.

Mutation path only: the selector loads the authority manifest, parses the Markdown inventory, generates
the canonical snapshot, schema-validates it, hash-validates it, and verifies
that the authoritative blob SHA matches the manifest.
It preserves model and effort order, calculates the complete model and pair counts
from the inventory, and constructs the complete candidate matrix.
It never updates the snapshot automatically.

The normal mutation path does not require or attempt `codex app-server`,
`model/list`, current UI text inventory, screenshots, Accessibility, OCR, private
Desktop transport, renderer injection, or AppleScript JavaScript execution. The
snapshot is not live Desktop extraction. Historical, fallback, inferred, cached,
or app-server data is never labeled live UI authority.

## State machine

The legal production states are:

1. `PREFLIGHT_REQUIRED`
2. `READ_ONLY_ALLOWED`
3. `MUTATION_PREFLIGHT_REQUIRED`
4. `WAITING_FOR_INVENTORY_CONFIRMATION`
5. `INVENTORY_CONFIRMED`
6. `WAITING_FOR_MODEL_SELECTION`
7. `CONTINUE_RECEIVED`
8. `SCOPE_REVALIDATED`
9. `IMPLEMENTATION_ALLOWED`

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

Missing or malformed task information is fail-closed. The mutation path evaluates every snapshot model-effort pair exactly once.
Each evaluation records suitability verdict, rejection reason when unsuitable,
retry risk, escalation risk, and relative cost class. The deterministic analyzer
selects the lowest-cost pair that meets the suitability constraint, reports the
evaluated `N/N` count, cheapest rejected pair and reason, recommendation, and
next more capable plausible pair. It must never use an unconditional fallback.

The optimization objective is:

`MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK`

## User confirmation and authorization

Mutation-path output automatically prints snapshot revision and hash, the complete
inventory, calculated model count, calculated pair count, every pair evaluation,
the recommendation, and the exact next response.

Read-only output prints the runtime path/version evidence, branch, worktree path,
baseline SHA, authority validation result, and exact read-only scope, and it never
prints a recommendation, `INVENTORY_OK`, or `CONTINUE`.
The runtime evidence is the resolved plugin root, manifest path, manifest version,
and manifest sha256 read from disk.
Read-only canary execution must require an explicit absolute `--plugin-root`
argument and fail closed when it is absent, relative, malformed, or points at
the wrong package.
Repository identity is resolved independently through Git and is never inferred
from the installed plugin cache.

Ask the normal user only to verify whether the printed inventory matches the
active picker on the mutation path. Accept exactly one same-thread response:

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
The mutation guard rejects absent state, read-only tasks, every pre-authorization
state, invalidated state, stale state, cross-thread identity, and any changed
task, branch, baseline, snapshot, matrix, or recommendation identity.

## CLI contract

Use `tools/run-asynchronia-model-preflight.py` with explicit commands on the mutation path:

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
models, duplicate efforts, empty effort lists, order, counts, canonical hash,
provenance, and status; prints an old-versus-new diff; and requires explicit user
confirmation. Git history preserves the previous snapshot. The production selector
never updates its own snapshot.

## Required report and terminal gate

The preflight report includes status, task identity, exact scope, ordered skill
route, snapshot metadata, complete matrix, every pair evaluation, recommendation,
rejection rationale, state identity, and exact next action.

A waiting report ends with exactly one standalone fenced block containing only
`CONTINUE`. No text follows it. Blocked or failed reports contain no `CONTINUE`.

Only exact trimmed `CONTINUE` from the same thread advances authorization.
