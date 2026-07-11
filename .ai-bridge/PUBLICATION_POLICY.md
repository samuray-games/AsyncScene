# Bridge Publication Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_11_MODEL_PREFLIGHT_V2
STATUS: ACTIVE
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
EMPTY_OUTBOX: FORBIDDEN
FINAL_RESPONSE_RECEIPT_IDENTITY: REQUIRED
REMOTE_STATE_FRESHNESS: REQUIRED
DEFAULT_PUBLICATION_MODE: CODEX_OUTBOX_PLUS_RECEIPT
MODEL_PREFLIGHT_GATE: REQUIRED
MODEL_PREFLIGHT_POLICY: .ai-bridge/MODEL_PREFLIGHT_POLICY.md
PLUGIN_TOOL_TELEMETRY_REQUIRED: false
VALIDATOR_APPLICABILITY_GATE: REQUIRED

## 1. Fresh authority

Every numbered command freshly fetches `origin/main` and `origin/coordination/chatgpt-codex-bridge`, then reads current root authority, this policy, `.ai-bridge/MODEL_PREFLIGHT_POLICY.md`, `.ai-bridge/STATE.md`, and the exact inbox and claim named by STATE.

Previous conversation state, local mailbox copies, historical claims, historical outboxes, and historical receipts are never current authority.

Before any terminal result Codex resolves the exact remote mailbox head, STATE blob SHA, execution epoch, slot, task, inbox, claim, expected outbox, expected receipt, baseline, phase, and authorized scope.

## 2. Mandatory automatic Asynchronia preflight

For every active Asynchronia Codex task, the Asynchronia skill route starts automatically. Manual plugin attachment is optional context, not a prerequisite.

The first execution phase is read-only model preflight:

1. apply `task-router`;
2. apply `scope-isolation-check` as applicable;
3. apply `model-selector` for the exact scope;
4. print the complete visible recommendation;
5. perform no file mutation, installation mutation, worktree creation, commit, push, or mailbox publication;
6. stop with status `WAITING_FOR_MODEL_SELECTION`;
7. end with one standalone fenced code block containing exactly `CONTINUE`.

Implementation resumes only after exact trimmed `CONTINUE` in the same Codex conversation. On resume Codex freshly refetches both remotes and verifies unchanged thread, claim, task, baseline, and scope. Any identity or scope change makes the recommendation stale and requires a new preflight pause.

A blocked response contains no `CONTINUE`.

Absence of a callable Asynchronia tool is not a blocker. Resolve skills from the active installed plugin or repository fallback under `plugins/asynchronia/skills/**`. Plugin-loader telemetry is never required.

## 3. Numbered slots

- `мост 1` addresses only Slot 1.
- `мост 2` addresses only Slot 2.
- `мост 3` addresses only Slot 3.
- STATE is the only activation pointer.
- Superseded task packages are historical only.
- Thread rotation invalidates prior conversation ownership and prior `CONTINUE` authorization.

## 4. Skill application evidence

A successful outbox and receipt include `skillApplicationEvidence` with:

- `pluginIdentifier`;
- `resolutionMode`;
- plugin manifest path and version;
- actual model status;
- ordered required skills exactly once;
- for each skill, source path, `status: APPLIED`, a non-empty material result, and concrete evidence references.

This proves material skill application, not nonexistent tool-call telemetry.

When model preflight applies, outbox and receipt also preserve:

- exact recommendation or deterministic hash;
- recommended model and reasoning;
- same-thread run identity;
- exact `CONTINUE` evidence;
- proof no mutation occurred before resume;
- fresh post-resume authority verification.

## 5. Scope and Git safety

Safety is enforced through exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership, and serialization of actual collisions.

Codex must never merge, rebase, reset, stash, clean, amend, cherry-pick, force-push, rewrite history, or absorb unrelated work.

A frozen collision-free lane proceeds after valid preflight and resume. Unresolved overlap returns `BLOCKED_SCOPE_COLLISION` with exact paths, owners, and dependencies.

Authorized write scope is the maximum permitted set unless the inbox explicitly requires complete-scope delta. Actual changed paths must be machine-derived and satisfy the current delta-scope contract.

## 6. Validator applicability

A validator is a required PASS gate only when it is task-applicable.

A validator is task-applicable when it is task-agnostic for the current committed tree or its embedded identity, baseline, scope, and ownership model match the active task.

Historical validators pinned to another bridge identity or historical base are `NOT_APPLICABLE`, never fake PASS. Every exclusion must identify the mismatch and list replacement controls, and every replacement control must appear as an explicit PASS in `validationResults`.

This rule cannot hide failure from an applicable validator or weaken a task-specific invariant.

## 7. Primary publication

A primary delta requires:

- one direct-child commit from the authorized baseline;
- actual changed paths inside authorized scope;
- clean committed-tree validation;
- fast-forward non-force publication by explicit SHA refspec;
- remote refetch proving head, parent, paths, and protected files.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED` with the fresh head. Do not mutate files after detecting the movement.

Verified-no-delta is legal only when explicitly authorized by the current inbox or claim. Empty commits are forbidden.

## 8. Outbox and receipt

Every successful active task uses two immutable mailbox artifacts.

The outbox contains only evidence knowable before its publication, including active identity, STATE blob, mailbox parent, primary identity, exact paths, validations, exclusions, skill evidence, model preflight evidence, and exact next action.

Publish the exact expected outbox as one fast-forward mailbox commit, refetch it, then publish the exact expected receipt as a separate fast-forward child and refetch again.

The receipt preserves outbox `validationResults`, `excludedValidationEvidence`, `skillApplicationEvidence`, model preflight evidence, and target no-delta evidence exactly. Receipt-only checks belong in `publicationValidationResults`.

Commit SHAs, blob SHAs, STATE blob identity, mailbox parent, outbox publication commit, and outbox blob are distinct fields.

## 9. Status integrity

`PASS_PUSHED` is forbidden when any required result is FAIL, BLOCKED, ERROR, SKIPPED, NOT_RUN, unsupported prose, or contradicted by repository evidence.

Successful evidence must prove current remote main, actual parent, exact paths, applicable checks, plugin/package identity when in scope, installed-plugin identity when required, and current mailbox publication.

`BLOCKED_NO_SOURCE_DELTA`, `BLOCKED_PLUGIN_UNAVAILABLE`, and similar statuses are illegal when contradicted by readable evidence.

A bare conversational return without the current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`.

## 10. Acceptance boundary

Git publication, repository validation, installed-plugin synchronization, deployment readiness, runtime smoke, and user acceptance are separate tiers.

Codex never claims Safari PASS. User-owned Safari evidence remains user-owned.

The closed loop becomes complete only after independent ChatGPT verification and every required later acceptance tier.

## 11. Ownership

Codex never edits `.ai-bridge/STATE.md`.

ChatGPT activates tasks by publishing inbox and claim first, updating STATE last, synchronizing live memory, and issuing the numbered command.
