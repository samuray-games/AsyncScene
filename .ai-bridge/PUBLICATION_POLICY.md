# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_10_LOOP_ONLY_EXCEPTION_AND_RECEIPT
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

## 3. Plugin boundary

### 3.1 Default ordinary task route

For an ordinary plugin-assisted Asynchronia implementation lane, plugin routing may be required by the active task and current repository authority.

Repository text never proves plugin activation. A task that explicitly requires actual plugin invocation may return an exact plugin blocker only when that requirement is part of the current non-superseded task identity.

### 3.2 Explicit loop-only exception

The plugin-first requirement does not apply when current STATE, inbox, and claim all identify a process-only closed-loop or bridge-controller lane with these exact semantics:

- `PLUGIN_DELIVERY_LANE: SEPARATE_EXTERNAL_NON_GATING`;
- `PLUGIN_INVOCATION_REQUIRED: false`;
- plugin source, manifest, marketplace, installation, cache, loader, and package paths are protected;
- Safari is `N/A_PROCESS_ONLY`.

For such a lane:

- plugin availability is not bridge transport and cannot block execution;
- `BLOCKED_PLUGIN_UNAVAILABLE` is illegal;
- no plugin activation claim may be made;
- no plugin tool invocation evidence is required;
- no model recommendation is required when no model-selector tool is available;
- model selection is never an execution gate;
- the STATE-selected closed-loop protocol and publication policy govern the transaction;
- Codex reads repository authority directly and executes the frozen loop-only task.

This exception is narrow. It does not authorize product, runtime, plugin-source, plugin-installation, marketplace, manifest, cache, or loader work.

### 3.3 Plugin repair bootstrap

A source-plugin bootstrap is allowed only when the current active task explicitly repairs or installs the plugin and explicitly authorizes that bootstrap. It is not available to a loop-only bridge lane.

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
- Exact primary changed paths equal actual commit evidence and remain inside frozen scope.
- Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main.

## 8. Terminal consistency and handoff

For a primary-required loop-only task, `BLOCKED_NO_REMOTE_OUTBOX`, `BLOCKED_NO_SOURCE_DELTA`, and `BLOCKED_PLUGIN_UNAVAILABLE` are illegal.

Status, completion mode, phase, verifier classification, and next action must use exact allowed combinations.

A successful receipt uses action code `OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND` and explicitly requests independent verification of the remote outbox and receipt.

A bare conversational return without the exact current publication evidence is `FAIL_NO_EXECUTION_EVIDENCE`.

## 9. Closed-loop completion

The closed-loop cycle becomes COMPLETE only after:

- source implementation is independently accepted;
- a separate closed-loop canary is independently accepted;
- exact accepted state is recorded in STATE and synchronized live memory.

Plugin installation and installed-package acceptance belong to a separate lane and do not gate this loop-only cycle.

## 10. Ownership

Codex never edits `.ai-bridge/STATE.md`.

ChatGPT activates a task by publishing inbox and claim first, updating STATE last, synchronizing live memory, and then issuing one exact numbered bridge command.
