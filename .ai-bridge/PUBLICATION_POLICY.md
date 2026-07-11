# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_11_SKILL_APPLICATION_NO_PLUGIN_TELEMETRY
STATUS: ACTIVE
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
EMPTY_OUTBOX: FORBIDDEN
FINAL_RESPONSE_RECEIPT_IDENTITY: REQUIRED
RUNTIME_SAFETY_GATE: RETIRED_AND_REMOVE
OBJECTIVE_GAP_PROOF: REQUIRED
REMOTE_STATE_FRESHNESS: REQUIRED
DEFAULT_PUBLICATION_MODE: CODEX_OUTBOX_PLUS_RECEIPT
MODEL_PREFLIGHT_GATE: RETIRED
VALIDATOR_APPLICABILITY_GATE: REQUIRED
PLUGIN_TOOL_TELEMETRY_REQUIRED: false

## 1. Fresh execution and remote-state freshness

Every numbered command must freshly fetch both `origin/main` and `origin/coordination/chatgpt-codex-bridge`, then read current root authority, this policy, `.ai-bridge/STATE.md`, and the exact inbox and claim named by STATE.

A local file, previous conversation, previous fetch result, old claim, old inbox, historical outbox, or historical receipt is never authority.

Before any routing or blocker decision, Codex must resolve the exact remote mailbox head, STATE blob SHA, execution epoch, inbox, claim, expected outbox, expected receipt, baseline, write mode, and frozen scope.

If two fresh refetches genuinely return incompatible current identities, Codex must fail closed using the exact current task schema. It must not continue using an older epoch.

## 2. Numbered slots

The bridge exposes exactly three fixed execution slots:

- `мост 1` addresses only Slot 1.
- `мост 2` addresses only Slot 2.
- `мост 3` addresses only Slot 3.
- STATE is the only activation pointer.
- Superseded and inert task packages are historical only.

## 3. Plugin and skill boundary

### 3.1 Skills-only plugin model

The Asynchronia package is a Codex skills plugin. Its manifest exposes a `skills` directory and does not declare callable tools or a tool server.

For numbered bridge work, Codex resolves the required skill instructions from either:

- the Asynchronia plugin attached by the user in the Codex interface; or
- the repository fallback under `plugins/asynchronia/skills/**`.

This matches root `CODEX_BRIDGE_BOOTSTRAP.md`, which says installed-cache or repository fallback is valid and plugin-loader telemetry is never required.

The absence of a separately callable `asynchronia` tool is not a plugin failure and must never produce `BLOCKED_PLUGIN_UNAVAILABLE` while the repository skill fallback is readable.

### 3.2 No invocation-telemetry gate

Codex must not claim that a plugin tool was invoked when no such tool surface exists.

The following are never required acceptance evidence:

- plugin-loader telemetry;
- a callable plugin tool entry;
- an invocation event ID;
- a tool-call transcript;
- a claim that the plugin was externally activated.

`BLOCKED_PLUGIN_UNAVAILABLE` is illegal when the required skill files can be resolved from the attached plugin context or repository fallback.

A genuine skill-source blocker is permitted only when both the attached context and repository fallback are unavailable or unreadable. The blocker must identify every missing skill path and the exact read failure.

### 3.3 Skill application evidence

When the active task requires Asynchronia skills, a successful outbox and receipt must include a top-level `skillApplicationEvidence` object, not `pluginInvocationEvidence`.

That object must contain:

- `pluginIdentifier`;
- `resolutionMode`, one of `USER_ATTACHED_PLUGIN`, `REPOSITORY_FALLBACK`, or `ATTACHED_PLUS_FALLBACK`;
- `pluginManifestPath`;
- `pluginManifestVersion`;
- `actualModelStatus`;
- `skillResults`, containing every skill required by the active inbox exactly once and in the declared dependency order.

Each `skillResults` entry must contain:

- `skill`;
- `sourcePath`;
- `status: APPLIED`;
- a non-empty `materialResult` describing the decision or constraint actually used;
- non-empty `evidenceRefs` pointing to concrete repository, command, validation, diff, or publication evidence.

Skill application evidence proves that the instructions materially shaped execution. It does not claim tool invocation telemetry.

A successful status is forbidden when a required skill is absent, duplicated, reordered, unreadable, marked non-applied, or has empty material results or evidence references.

### 3.4 Plugin package maintenance is separate

Plugin manifest, marketplace, installation, cache, authentication, loader, and package-version repair belong to a separate plugin-maintenance lane unless the active inbox explicitly authorizes those files.

A version mismatch may be recorded as a non-gating maintenance finding. It must not block an unrelated source-publication lane when required skill sources are readable.

## 4. Scope safety

Safety is enforced through exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership, and serialization of real collisions.

A frozen collision-free lane executes immediately. Unresolved overlap returns `BLOCKED_SCOPE_COLLISION` with exact paths, owners, and dependencies.

Codex must never merge, rebase, reset, stash, clean, amend, cherry-pick, force-push, rewrite history, or absorb unrelated work.

## 5. Objective-gap and primary publication

A passing current validator proves only the checks it currently implements. It does not prove that a correction objective requiring validator expansion, adversarial fixtures, mutation tests, exact schemas, or stronger path and identity checks is already satisfied.

When `PRIMARY_WRITE_REQUIRED: true` and `ALLOW_VERIFIED_NO_DELTA: false`:

- `BLOCKED_NO_SOURCE_DELTA` is illegal;
- empty primary commits are forbidden;
- Codex must implement the concrete missing invariants inside frozen scope;
- a genuine contradiction must use the exact active blocked schema and publication transaction.

A primary delta requires exactly one direct-child exact-scope commit from the active baseline, a fast-forward push, a remote refetch, exact first-parent proof, exact changed paths, protected-path proof, and validations from the committed tree.

### 5.1 Validator applicability gate

A validator may be a required success gate only when it is task-applicable.

A validator is task-applicable when one of the following is true:

- it is explicitly task-agnostic and evaluates only the current working tree or the paths supplied by the active command; or
- its embedded thread, execution epoch, baseline, frozen scope, and ownership model match the current active task exactly.

A validator is not task-applicable when it is pinned to a different historical bridge identity, baseline, frozen scope, lane, or publication model, or when it computes repository-wide changed paths from an unrelated historical base.

An inapplicable validator must not be treated as a required PASS gate and must not be represented as passing evidence. The active inbox must explicitly declare the exclusion and its replacement controls.

A successful outbox for a task with an excluded validator must contain `excludedValidationEvidence`, with one entry per exclusion containing:

- `validator`;
- `status: NOT_APPLICABLE`;
- `pinnedIdentity`;
- `activeIdentityMismatch`;
- `reason`;
- `replacementControls`.

Every replacement control must itself appear as a required explicit PASS in `validationResults`.

This rule cannot be used to hide a failure from an applicable validator, weaken a task-specific invariant, or omit a validator whose identity matches the current task.

## 6. Outbox and receipt transaction

Every active closed-loop task uses two immutable mailbox artifacts.

### 6.1 Outbox

The outbox contains only evidence knowable before its own publication, including:

- exact active identity;
- STATE blob SHA;
- mailbox parent commit fetched immediately before outbox publication;
- primary commit and primary parent;
- exact changed and authorized paths;
- protected-path evidence;
- validation and executable-control evidence;
- exact expected outbox and receipt paths;
- exact status-specific schema fields;
- exact next-action code.

The outbox must not claim the commit SHA or blob SHA created by publishing itself.

Codex publishes only the exact expected outbox path as a fast-forward child of the fetched mailbox parent, then refetches the remote outbox commit and blob.

### 6.2 Receipt

After refetching the published outbox, Codex builds a separate receipt containing:

- exact active identity;
- `stateBlobSha`;
- `mailboxParentCommit`;
- `outboxPublicationCommit`;
- `outboxBlobSha`;
- `primaryCommitSha`;
- `primaryParent`;
- exact outbox and receipt paths;
- exact changed paths and validation summary;
- byte equality between prepared and remote receipt content.

The receipt does not require its own publication commit SHA.

Codex publishes only the exact expected receipt path as a fast-forward child of the outbox publication commit, refetches the receipt and mailbox head, and returns user-visible bytes identical to the remote receipt.

Commit SHAs, blob SHAs, STATE blob identity, mailbox parent, outbox publication commit, and outbox blob are distinct fields and must never be overloaded.

### 6.3 Validation and evidence preservation

The receipt must preserve the outbox `validationResults` array exactly, in the same order and with no omissions or rewrites. Receipt-only publication checks belong in a separate `publicationValidationResults` array.

When present, the receipt must also preserve `excludedValidationEvidence` and `skillApplicationEvidence` exactly, without omissions or rewrites.

`PASS_PUSHED` is forbidden when any required validation result contains `FAIL`, `BLOCKED`, `ERROR`, `SKIPPED`, `NOT_RUN`, or an equivalent non-pass state.

A successful status requires every required validation entry to end in explicit PASS, exact changed paths to equal the frozen write scope, every excluded validator to satisfy the applicability schema with passing replacement controls, and every required skill application entry to be complete.

No receipt may convert, omit, summarize away, or hide a source validation failure.

## 7. Exact schemas and controls

- Outbox and receipt use separate exact status-specific schemas.
- Extra keys, missing keys, wrong types, empty values, placeholders, identity mismatches, path mismatches, SHA-kind confusion, status inconsistency, and arbitrary next-action prose fail closed.
- Every SHA matches exact lowercase `[0-9a-f]{40}`.
- Uppercase and known repeated synthetic placeholders are rejected.
- Every declared control calls real validation behavior with valid and adversarial fixtures.
- Unknown or unmapped controls fail closed.
- No route, identity, schema, path, publication, or acceptance control may return unconditional success.
- The canonical state set and transition table are independent from the implementation table.
- Mutation tests must prove that bypassing each evaluator family causes validation failure.
- Exact primary changed paths equal actual commit evidence and equal the complete frozen scope when the active inbox requires exact-scope publication.
- Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main.

## 8. Terminal consistency and handoff

For a primary-required task, `BLOCKED_NO_REMOTE_OUTBOX`, `BLOCKED_NO_SOURCE_DELTA`, and `BLOCKED_PLUGIN_UNAVAILABLE` are illegal when their stated condition is contradicted by readable current evidence.

Status, completion mode, phase, verifier classification, and next action must use exact allowed combinations.

A successful receipt uses action code `OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND` and explicitly requests independent verification of the remote outbox and receipt.

A bare conversational return without the exact current publication evidence is `FAIL_NO_EXECUTION_EVIDENCE`.

## 9. Closed-loop completion

The closed-loop cycle becomes COMPLETE only after:

- source implementation is independently accepted;
- a separate closed-loop canary is independently accepted when required by the active cycle;
- exact accepted state is recorded in STATE and synchronized live memory.

Plugin package installation and package acceptance belong to a separate lane unless explicitly included in the active task.

## 10. Ownership

Codex never edits `.ai-bridge/STATE.md`.

ChatGPT activates a task by publishing inbox and claim first, updating STATE last, synchronizing live memory, and then issuing one exact numbered bridge command.
