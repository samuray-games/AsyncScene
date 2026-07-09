# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_SCOPE_ISOLATION_MODEL_INFO
STATUS: ACTIVE
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
DEFAULT_PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH
RUNTIME_GATE: RETIRED
MODEL_PREFLIGHT_GATE: RETIRED

## Fresh execution

Every numbered command freshly fetches main and mailbox and reads current STATE, inbox, claim and execution epoch. Old artifacts are historical only.

## Model recommendation boundary

Only the Asynchronia plugin `model-selector` may originate, rank, or name a model and reasoning recommendation. The user alone selects the actual active model in the Codex interface, and unverified selection remains `USER_SELECTED_UNVERIFIED`.

A selector recommendation is informational evidence. It must not pause, block, authorize, or resume a numbered lane. No `MODEL_PREFLIGHT_ONLY`, `WAITING_FOR_MODEL_SELECTION`, mandatory `CONTINUE`, or equivalent model-selection round trip is part of the active bridge workflow. When the exact scope changes materially, recompute the recommendation in the same execution response when applicable and continue if all real scope, ownership, dependency, lock, and validation gates pass.

## Scope safety

Safety is enforced through exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership and serialization of actual overlaps.

A frozen collision-free lane executes immediately. No runtime approval token or approval-only stop is part of the active workflow.

Unresolved overlap returns `BLOCKED_SCOPE_COLLISION` with exact paths, owners and dependencies.

## Completion modes

### Primary delta

When authorized source changes exist, Codex publishes one direct-child exact-scope primary commit and the exact current outbox, then returns `PASS_PUSHED`.

### Verified no delta

When the current inbox or claim contains `ALLOW_VERIFIED_NO_DELTA: true`, Codex may return `PASS_VERIFIED_NO_DELTA` after proving that the current baseline already satisfies the frozen objective.

Required evidence:

- baseline remains current remote main;
- required generator and validators pass;
- deterministic regeneration produces zero diff;
- exact changed paths are empty;
- protected blobs are unchanged;
- the current outbox is published and refetched;
- outbox contains `completionMode: VERIFIED_NO_DELTA`, `primaryChanged:false`, `primaryParent:N/A`, `changedPaths:[]`, scope blob SHAs and validation results.

Empty primary commits are forbidden.

A bare return without the current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`.

## Root policy CI gate

Root process changes must pass `tools/validate-orchestration-policy.py`. Historical failed runs are audit evidence only and do not override a newer valid current state.

## Publication

Primary and mailbox commits are fast-forward, exact-scope and remotely refetched. Manual SHA transcription is forbidden.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. If write access still fails after one repair, return `BLOCKED_PUSH_AUTH` with complete evidence.

Codex never edits STATE.
