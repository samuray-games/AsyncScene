# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_OBJECTIVE_GAP_NO_DELTA_GUARD
STATUS: ACTIVE
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
EMPTY_OUTBOX: FORBIDDEN
FINAL_RESPONSE_OUTBOX_IDENTITY: REQUIRED
MANDATORY_PLUGIN_FIRST: REQUIRED
RUNTIME_SAFETY_GATE: RETIRED_AND_REMOVE
OBJECTIVE_GAP_PROOF: REQUIRED
DEFAULT_PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH
MODEL_PREFLIGHT_GATE: RETIRED

## Fresh execution

Every numbered command freshly fetches main and mailbox and reads current STATE, inbox, claim and execution epoch. Old artifacts are historical only.

## Numbered slots and parallel execution

The bridge exposes exactly three fixed execution slots:

- `мост 1` addresses only Slot 1;
- `мост 2` addresses only Slot 2;
- `мост 3` addresses only Slot 3.

Every open slot has its own thread, lane, task, execution epoch, inbox, claim, baseline, exact write scope, worktree and expected outbox.

Whenever two or more tasks or slots are proposed or open, Codex must invoke the Asynchronia `parallel-scope-planner`. Slots may remain open concurrently only when write ownership, stable-read dependencies, mirror ownership, shared wiring, registries, generated outputs and shared documentation ownership are proven disjoint. Shared process files, shared documentation, mirror pairs, aggregate smoke, registries, exports, globals, boot wiring and dependent lanes are serialized.

A closed slot is intentional when fewer collision-free lanes exist. It is not an omitted bridge command.

## Mandatory Asynchronia plugin-first routing

Every Asynchronia Codex task, whether bridge-based or directly supplied, must start with the exact first line:

`Use @asynchronia.`

The plugin route is mandatory before implementation:

1. invoke `task-router` first for every task;
2. invoke `scope-isolation-check` for every implementation or repository-write lane;
3. invoke `model-selector` for every implementation or repository-write lane;
4. invoke `parallel-scope-planner` whenever multiple tasks, lanes, slots, concurrent writers, shared dependencies, mirrors, registries, generated outputs or documentation owners exist;
5. invoke every additional specialized Asynchronia skill required by the routed task.

If the plugin cannot be resolved, loaded or invoked, Codex must stop before implementation with `BLOCKED_PLUGIN_UNAVAILABLE` and exact diagnostics. Silent generic fallback is forbidden.

The final report and outbox must list:

- active plugin version and source;
- exact skills invoked in order;
- material result from each skill;
- proof that `task-router` selected the final route;
- proof that no required skill was skipped.

A generic claim that the plugin was used is insufficient.

## Runtime gate removal

The obsolete `runtime-safety-gate` name, skill, alias and route are not part of the active architecture and must be removed from source and active installed package behavior.

The old prompt `Use @asynchronia runtime-safety-gate.` is forbidden in active process surfaces.

Runtime and mechanically sensitive work is governed by `scope-isolation-check`, exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership and serialization of real collisions.

Runtime approval, runtime authorization, approval-only stops and equivalent hidden gates are forbidden. User-owned Safari acceptance remains separate and does not become a pre-implementation approval gate.

The active installed Asynchronia package must be verified to contain no `runtime-safety-gate` skill, alias, generated index entry or callable route.

## Model recommendation boundary

Only the Asynchronia plugin `model-selector` may originate, rank or name a model and reasoning recommendation. The user alone selects the actual active model in the Codex interface, and unverified selection remains `USER_SELECTED_UNVERIFIED`.

A selector recommendation is informational evidence. It must not pause, block, authorize or resume a numbered lane. No `MODEL_PREFLIGHT_ONLY`, `WAITING_FOR_MODEL_SELECTION`, mandatory `CONTINUE` or equivalent model-selection round trip is part of the active bridge workflow. When exact scope changes materially, recompute the recommendation in the same execution response when applicable and continue if all real scope, ownership, dependency, lock and validation gates pass.

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

## Objective-gap proof and no-source-delta guard

A passing current validator proves only the checks that validator currently implements. It does not prove that a correction objective requiring validator expansion, new negative controls, new report validation, installed-package evidence, or additional policy coverage is already satisfied.

When the current inbox identifies concrete baseline omissions, Codex must build an objective-gap matrix before deciding whether source work exists. For every required invariant, the matrix must provide one of:

- exact current path, line or function and behavior proving the invariant is already enforced; or
- exact target path and implementation delta required to enforce it.

The objective-gap matrix must be based on current source inspection, not on the current validator exit code.

If `PRIMARY_WRITE_REQUIRED: true` and `ALLOW_VERIFIED_NO_DELTA: false`:

- `BLOCKED_NO_SOURCE_DELTA` is not a valid terminal status;
- an empty primary commit remains forbidden;
- Codex must implement every concrete missing invariant named by the current inbox within the frozen scope;
- if Codex believes the contract is contradictory, it must publish a complete outbox with `BLOCKED_CONTRACT_CONTRADICTION`, the full objective-gap matrix, exact source citations, and the contradiction;
- a direct conversational blocker without the expected outbox is `FAIL_NO_EXECUTION_EVIDENCE`.

A correction inbox that names an exact current blob and exact missing checks is authoritative evidence that source inspection is required. Codex may disprove a named gap only with exact source-backed evidence. It may not substitute `validator PASS`, clean Git status, or unchanged HEAD for that proof.

## Full final response outbox contract

For every success, verified-no-delta, correction, rejection or blocked completion that can reach the mailbox branch, the expected outbox must contain the complete final response that Codex will show to the user.

The outbox content and the user-visible final response body must be byte-for-byte identical. A summary, receipt, pointer, placeholder, empty file, whitespace-only file or one-line handoff is forbidden.

Before publication, the response must contain all applicable fields:

- status and completion mode;
- bridge slot, thread, lane, task and execution epoch;
- active plugin version and source;
- invoked Asynchronia skills and their material results;
- selector-originated model recommendation and actual model status;
- objective-gap matrix;
- inspected files and exact changed paths;
- tests and validators run with results;
- failures and attempted recovery;
- missing coverage;
- baseline, primary commit and primary parent, or explicit N/A reasons;
- buildTag, commit label and smokeVersion, or explicit N/A reasons;
- Safari smoke status;
- expected outbox path;
- exact next user action.

The report validator must fail closed when the trimmed outbox is empty, when required sections are missing, when placeholders remain, when plugin evidence is absent, when the objective-gap matrix is absent for a correction lane, or when the response merely tells the user to return to ChatGPT.

## Publish-before-reply transaction

Codex must perform publication as one ordered transaction:

1. assemble the complete final response in a local task-owned file or immutable buffer;
2. validate the response against the current report schema;
3. fetch the latest mailbox head;
4. publish the exact response bytes to the exact expected outbox path from a clean mailbox worktree;
5. push fast-forward without force;
6. refetch the remote mailbox branch and exact outbox;
7. compare the refetched remote bytes with the prepared final response bytes;
8. only after exact equality is proven, send those same bytes as the user-visible final response.

Codex must not tell the user to return to ChatGPT or send `мост N` until the exact remote outbox exists, is non-empty, passes the report schema and matches the final response byte-for-byte.

## Outbox publication retry rule

Every recoverable outbox publication failure must be retried automatically without asking the user to repeat the task. Recovery includes refetching the mailbox branch, discarding only the failed task-owned mailbox worktree, creating a fresh clean mailbox worktree, reapplying the exact prepared response, pushing fast-forward and refetching for byte comparison.

There is no successful terminal state before verified outbox publication. A failed first push, stale mailbox parent, stale worktree, non-fast-forward mailbox update or remote verification mismatch must not produce a handoff response.

If publication remains impossible because of a non-recoverable external authentication, permission or service outage after the allowed non-interactive repair, Codex must return `BLOCKED_OUTBOX_PUBLICATION` in the Codex conversation, preserve the complete prepared response locally, and must not instruct the user to send `мост N` to ChatGPT.

## Root policy CI gate

Root process changes must pass `tools/validate-orchestration-policy.py`. Historical failed runs are audit evidence only and do not override a newer valid current state.

The root validator must enforce the three-slot contract, exact `Use @asynchronia.` first line, mandatory plugin routing, runtime-gate absence, active installed-package evidence contract, non-blocking model recommendation semantics, objective-gap proof, complete final-response outbox schema, empty-outbox prohibition, publish-before-reply ordering, retry behavior and workflow coverage of every plugin skill.

The validator's own PASS cannot be used as evidence that no validator delta is required when the current correction explicitly identifies checks absent from the validator source.

## Publication

Primary and mailbox commits are fast-forward, exact-scope and remotely refetched. Manual SHA transcription is forbidden.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. If primary write access fails after one repair, return `BLOCKED_PUSH_AUTH` with complete evidence. Mailbox publication failures follow the stricter outbox retry rule above.

Codex never edits STATE.
