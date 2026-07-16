---
name: model-selector
description: Run Asynchronia 1.0.14 model preflight using authoritative bridge-derived task descriptions, sandbox-safe durable state, exact INVENTORY_OK, and exact same-thread CONTINUE.
---

# Model Selector 1.0.14

Use this skill automatically before every Asynchronia implementation, validation that mutates state, publication, ref update, lock, cache change, project-memory write, or external-state write.

## Non-negotiable execution rule

Run `tools/run-asynchronia-model-preflight.py`. Do not simulate the selector in prose. Codex prose is not selector evidence.

## Authorization paths

- `READ_ONLY_ALLOWED` applies only when write scope is empty or exactly `NONE_READ_ONLY`. It performs no matrix evaluation, emits no recommendation, writes no state, and requests neither `INVENTORY_OK` nor `CONTINUE`.
- `MUTATION_PREFLIGHT_REQUIRED` applies to every mutation-capable task.

The mutation state machine is exactly:

1. `WAITING_FOR_INVENTORY_CONFIRMATION`
2. exact same-thread `INVENTORY_OK` or `INVENTORY_CHANGED`
3. `WAITING_FOR_MODEL_SELECTION`
4. user selects the printed model and effort in the Codex UI
5. exact same-thread `CONTINUE`
6. `SCOPE_REVALIDATED`
7. `IMPLEMENTATION_ALLOWED`

No mutation is allowed before `IMPLEMENTATION_ALLOWED`.

## Authoritative bridge task adapter

For exact `мост N` commands, never search historical task folders and never hand-author JSON risk fields. Use:

- `bridge-start`
- `bridge-inventory-ok`
- `bridge-continue`

The adapter reads the current selected mailbox ref and derives one hash-bound structured task from:

- mailbox head;
- slot-local `.ai-bridge/STATE.md`;
- the exact inbox and claim named by STATE;
- selected task branch and authorized baseline;
- the versioned deterministic bridge profile in `plugins/asynchronia/bridge_task_descriptor.py`.

It validates task, slot, thread, generation, branch, epoch, nonce, baseline, mailbox ownership, frozen output paths, Stage 6 pause, no-main-write rule, continuation requirement, runtime scope, and claim profile. Unknown claim types fail closed. Generic `start` rejects reserved bridge task types so a model or assistant cannot smuggle fabricated bridge classifications through a handwritten JSON file.

### Current registered profile

`BRIDGE_TASK_PROFILE_1` supports only `NO_MAIN_DELTA_TRANSPORT_CANARY` with `NO_MAIN_DELTA_TRANSPORT` scope. Its classifications and reasons are code-owned, deterministic, versioned, printed in the preflight evidence, and included in the task hash. They are not inferred conversationally.

## Durable state

The default selector state directory is resolved with:

`git rev-parse --git-path asynchronia/model-selector-state`

This keeps state in Git-private, sandbox-writable storage shared by linked worktrees. The default must never use the legacy user-home directory and must never write under `.ai-bridge/**`. `ASYNCHRONIA_SELECTOR_STATE_DIR` is accepted only as an explicit absolute override.

State is per-thread and binds task ID, task hash, thread, branch, baseline, snapshot revision/hash, complete matrix hash, recommendation, timestamps, state history, and expiry. Any mismatch or stale state fails closed.

## Inventory and recommendation

The only inventory authority is `plugins/asynchronia/model-selector-authority.json` and its bound snapshot. The selector verifies the source artifact blob, schema, order, counts, and canonical hash, then evaluates every model-effort pair exactly once.

Mutation output prints:

- task identity, descriptor hash, exact read/write scopes;
- snapshot revision/hash and complete inventory;
- evaluated `N/N` matrix;
- required capability score;
- rejected frontier and reason;
- recommended pair;
- next more capable suitable pair;
- exact next response.

The user chooses the actual model in the Codex interface. Codex self-report about its model is not proof.

## CLI

Generic non-bridge task commands:

- `start --task-file ... --thread-id ... --baseline ...`
- `inventory-ok --task-file ... --thread-id ... --baseline ...`
- `continue --task-file ... --thread-id ... --baseline ... --token CONTINUE`

Bridge commands:

- `bridge-start --slot N --thread-id ... --baseline ... --branch ...`
- `bridge-inventory-ok --slot N --thread-id ... --baseline ... --branch ...`
- `bridge-continue --slot N --thread-id ... --baseline ... --branch ... --token CONTINUE`

Shared commands:

- `inventory-changed --thread-id ...`
- `inspect --thread-id ...`
- `invalidate --thread-id ...`

Every bridge command re-derives the task from current authority. Mailbox movement, branch movement, scope change, profile change, or identity drift invalidates continuation.
