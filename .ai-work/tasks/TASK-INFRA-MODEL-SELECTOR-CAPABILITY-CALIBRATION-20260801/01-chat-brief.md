TASK_ID: TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801
PIPELINE_VERSION: 1.0.18
PHASE: CHAT_BRIEF
STATUS: READY_FOR_REVIEW
CREATED_AT: 2026-08-01T14:51:31Z
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-selector-capability-calibration-20260801@d4527217e3ec4b5cbe2978bef1974fc8a300058a

# Chat brief

- Task: `TASK-INFRA-MODEL-SELECTOR-CAPABILITY-CALIBRATION-20260801`
- Branch: `infra/model-selector-capability-calibration-20260801`
- Baseline: `d4527217e3ec4b5cbe2978bef1974fc8a300058a`
- Objective: add scope-aware capability calibration policy gates while preserving inventory authority, cost authority, read-only short-circuiting, and selector state semantics.
- Self-repair exception: normal executable model preflight is intentionally not used; no durable selector state, no INVENTORY_OK, no INVENTORY_CHANGED, and no CONTINUE.
- Bootstrap model: `5.6 Luna / Medium / Standard`
- Scope: selector core, visible contract tests, optional preflight-visible contract adjustments, task-local spec/state files, and plugin version surfaces.

### Goal

Replace scalar-only recommendation behavior with a calibrated policy that joins required-score bands with explicit runtime, architecture, security, economy, ambiguity/concurrency, and broad cross-cutting gates.

### Non-goals

- Do not modify cost authority, inventory authority, runtime/game code, security implementation, bridge/mailbox refs, shared memory, or `main`.
- Do not install or refresh the local plugin.

### Accepted decisions

- Read-only tasks short-circuit with no recommendation.
- Documentation-only mutation routes to `5.6 Luna / Light`.
- `Mini`, `5.4`, and `5.5` do not need forced reachability.
- Broad cross-cutting tasks may escalate to `5.6 Sol / Light` when the explicit predicate is satisfied.

### Constraints

- Exact baseline is `d4527217e3ec4b5cbe2978bef1974fc8a300058a`.
- Exact branch is `infra/model-selector-capability-calibration-20260801`.
- Writes are restricted to the user-authorized paths.

### Acceptance criteria

- Read-only tasks return `READ_ONLY_ALLOWED` with no recommendation.
- Docs-only mutation returns `5.6 Luna / Light`.
- Required-score bands and explicit floors produce the calibrated matrix.
- Sol is reachable only via the exact broad cross-cutting predicate.
- Preconditions fail closed on malformed schema, identity mismatch, impossible floors, or ambiguous policy.
- Plugin version surfaces are synchronized to `1.0.18`.

### Output required from Work

Return exact branch, commit, changed paths, policy predicates, gate precedence, version evidence, regression matrix, validation outputs, push evidence, draft PR URL, and the next action: independent PR review.

### Open questions

- None.
