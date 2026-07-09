# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_PLUGIN_BOOTSTRAP_FALLBACK
STATUS: ACTIVE
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
EMPTY_OUTBOX: FORBIDDEN
FINAL_RESPONSE_OUTBOX_IDENTITY: REQUIRED
MANDATORY_PLUGIN_FIRST: REQUIRED
RUNTIME_SAFETY_GATE: RETIRED_AND_REMOVE
OBJECTIVE_GAP_PROOF: REQUIRED
PLUGIN_BOOTSTRAP_FALLBACK: ALLOWED_FOR_PLUGIN_REPAIR_ONLY
REMOTE_STATE_FRESHNESS: REQUIRED
DEFAULT_PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH
MODEL_PREFLIGHT_GATE: RETIRED

## Fresh execution and remote-state freshness

Every numbered command must freshly fetch both `origin/main` and `origin/coordination/chatgpt-codex-bridge`, then read `STATE.md`, the inbox, and the claim directly from the fetched remote refs.

A local file, previous conversation, previous fetch result, old claim, old inbox, or historical outbox is never authority.

Before any routing or blocker decision, Codex must report the exact remote mailbox commit, STATE blob SHA, execution epoch, inbox path, claim path, expected outbox, and baseline it just read.

If the reported epoch differs from the current remote STATE epoch, Codex must discard the stale read, refetch once, and restart resolution from the remote STATE. A response based on a superseded epoch is `FAIL_STALE_REMOTE_STATE`.

If two fresh refetches genuinely return incompatible remote STATE identities, Codex must publish a complete `BLOCKED_REMOTE_STATE_INCONSISTENT` report to the expected outbox named by the newest fetched STATE. It must not continue using the older epoch.

## Numbered slots and parallel execution

The bridge exposes exactly three fixed execution slots:

- `мост 1` addresses only Slot 1;
- `мост 2` addresses only Slot 2;
- `мост 3` addresses only Slot 3.

Every open slot has its own thread, lane, task, execution epoch, inbox, claim, baseline, exact write scope, worktree and expected outbox.

Whenever two or more tasks or slots are proposed or open, Codex must invoke the Asynchronia `parallel-scope-planner`. Slots may remain open concurrently only when write ownership, stable-read dependencies, mirror ownership, shared wiring, registries, generated outputs and shared documentation ownership are proven disjoint. Shared process files, shared documentation, mirror pairs, aggregate smoke, registries, exports, globals, boot wiring and dependent lanes are serialized.

A closed slot is intentional when fewer collision-free lanes exist. It is not an omitted bridge command.

## Mandatory Asynchronia plugin-first routing

Every ordinary Asynchronia Codex task must start with the exact first line:

`Use @asynchronia.`

The normal route is mandatory before implementation:

1. invoke `task-router` first;
2. invoke `scope-isolation-check` for every implementation or repository-write lane;
3. invoke `model-selector` for every implementation or repository-write lane;
4. invoke `parallel-scope-planner` whenever multiple tasks, lanes, slots, concurrent writers, shared dependencies, mirrors, registries, generated outputs or documentation owners exist;
5. invoke every additional specialized Asynchronia skill required by routing.

If a correct current plugin is available, generic fallback is forbidden.

## Narrow plugin-bootstrap fallback

The plugin-first requirement must not make repair or installation of the plugin logically impossible.

The fallback in this section is allowed only when all of the following are true:

- the current inbox explicitly repairs, installs, upgrades, or verifies the Asynchronia plugin itself;
- the currently installed package is absent, stale, malformed, unloadable, or older than the source version required by the current claim;
- current `origin/main` contains a source Asynchronia package at `plugins/asynchronia` with the exact required manifest version;
- the current claim explicitly authorizes `PLUGIN_BOOTSTRAP_FALLBACK`.

When those conditions hold, Codex must not return `BLOCKED_PLUGIN_UNAVAILABLE` merely because the installed package is stale or hidden plugin-loader telemetry is unavailable.

Instead Codex must execute this bounded bootstrap before repository implementation:

1. verify the exact remote baseline and source plugin manifest from `origin/main`;
2. read the required source skills directly from `origin/main:plugins/asynchronia/skills/**/SKILL.md`;
3. label the route `SOURCE_PLUGIN_FALLBACK_BOOTSTRAP`, never generic fallback;
4. invoke `task-router`, `scope-isolation-check`, `model-selector`, `parallel-scope-planner`, and routed specialized skills from that exact source package;
5. discover Codex home as `${CODEX_HOME:-$HOME/.codex}`;
6. if an older package such as `personal/asynchronia/1.0.1` is present, use its parent directory as the discovered versioned package root;
7. install the required version as a sibling version directory, for example `personal/asynchronia/1.0.4`, by copying only the validated source package from a clean worktree;
8. never overwrite or delete the older version, unrelated cache entries, user files, or repository files during installation;
9. use a temporary sibling directory and atomic rename when supported;
10. verify installed manifest version, complete file inventory, source-to-installed checksums, exact skill inventory, and absence of `runtime-safety-gate` skill, alias, index entry, or callable route;
11. run source-backed and installed-package positive smokes plus the plugin-unavailable negative smoke;
12. continue the repository task in the same command using the exact source-routed results.

Hidden UI plugin-loader telemetry is not required. Repository `CODEX_BRIDGE_BOOTSTRAP.md` and `CODEX_BRIDGE_RECOVERY.md` already define repository fallback and explicitly state that hidden loader machinery is not a bridge gate. Installed-path, manifest, inventory, checksum, and smoke evidence are the required proof.

If user-level writes are genuinely denied after one non-interactive permission-preserving attempt, Codex must still publish a complete `BLOCKED_PLUGIN_INSTALL_PERMISSION` outbox with the source route evidence, discovered paths, attempted operation, exact OS error, and preserved-state proof. A direct conversational blocker is forbidden.

## Runtime gate removal

The obsolete `runtime-safety-gate` name, skill, alias and route are not part of the active architecture and must be removed from source and installed package behavior.

The old prompt `Use @asynchronia runtime-safety-gate.` is forbidden in active process surfaces.

Runtime and mechanically sensitive work is governed by `scope-isolation-check`, exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership and serialization of real collisions.

Runtime approval, runtime authorization, approval-only stops and equivalent hidden gates are forbidden. User-owned Safari acceptance remains separate and does not become a pre-implementation approval gate.

## Model recommendation boundary

Only `model-selector` may originate, rank or name a model and reasoning recommendation. The user alone selects the actual active interface model, and unverified selection remains `USER_SELECTED_UNVERIFIED`.

A recommendation is informational evidence. It must not pause, block, authorize or resume execution.

## Scope safety

Safety is enforced through exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership and serialization of actual overlaps.

A frozen collision-free lane executes immediately. Unresolved overlap returns `BLOCKED_SCOPE_COLLISION` with exact paths, owners and dependencies.

## Completion modes

### Primary delta

When authorized source changes exist, Codex publishes one direct-child exact-scope primary commit and the exact current outbox, then returns `PASS_PUSHED`.

### Verified no delta

When the current inbox or claim contains `ALLOW_VERIFIED_NO_DELTA: true`, Codex may return `PASS_VERIFIED_NO_DELTA` only after proving that the current baseline already satisfies the complete frozen objective.

Required evidence includes unchanged baseline, deterministic zero diff, protected blobs unchanged, complete validation, the current outbox published and refetched, and explicit no-delta identity fields.

Empty primary commits are forbidden.

A bare return without the current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`.

## Objective-gap proof and no-source-delta guard

A passing current validator proves only the checks that validator currently implements. It does not prove that a correction objective requiring validator expansion, new negative controls, report validation, installed-package evidence, bootstrap repair or additional policy coverage is already satisfied.

When the current inbox identifies concrete baseline omissions, Codex must build an objective-gap matrix before deciding whether source work exists. Each invariant must provide exact current source proof or an exact implementation delta.

If `PRIMARY_WRITE_REQUIRED: true` and `ALLOW_VERIFIED_NO_DELTA: false`:

- `BLOCKED_NO_SOURCE_DELTA` is not a valid terminal status;
- an empty primary commit remains forbidden;
- Codex must implement every concrete missing invariant inside the frozen scope;
- a genuine contradiction must be published as complete `BLOCKED_CONTRACT_CONTRADICTION` evidence;
- a direct conversational blocker without the expected outbox is `FAIL_NO_EXECUTION_EVIDENCE`.

## Full final-response outbox contract

Every success, verified-no-delta, correction, rejection or blocked completion that can reach the mailbox branch must publish the complete final response to the exact expected outbox.

The outbox bytes and user-visible response bytes must be identical. Empty, summary-only, pointer-only, placeholder-only and handoff-only outboxes are forbidden.

The report must contain all applicable fields:

- status and completion mode;
- bridge slot, thread, lane, task and execution epoch;
- fetched remote mailbox commit and STATE blob SHA;
- active plugin source or `SOURCE_PLUGIN_FALLBACK_BOOTSTRAP` source identity;
- invoked skills and material results;
- model recommendation and actual model status;
- objective-gap matrix;
- inspected files and exact changed paths;
- installed-package path, manifest, inventory, checksum and smoke evidence when applicable;
- tests and validators with results;
- failures and recovery attempts;
- missing coverage;
- baseline, primary commit and parent or explicit N/A reasons;
- buildTag, commit label and smokeVersion or explicit N/A reasons;
- Safari status;
- expected outbox path;
- remote outbox refetch identity;
- byte-equality result;
- exact next user action.

## Publish-before-reply transaction

Codex must:

1. assemble the complete response;
2. validate its schema;
3. fetch the latest mailbox head;
4. publish the exact bytes from a clean mailbox worktree;
5. push fast-forward without force;
6. refetch the remote mailbox and outbox;
7. compare remote bytes with prepared bytes;
8. only then show those same bytes to the user.

Every recoverable publication failure must be retried automatically. A non-recoverable mailbox failure returns `BLOCKED_OUTBOX_PUBLICATION` without a ChatGPT handoff.

## Root policy CI gate

Root process changes must pass `tools/validate-orchestration-policy.py`.

The final validator must enforce the three-slot contract, remote-state freshness, exact plugin-first routing, the narrow bootstrap fallback, runtime-gate absence, objective-gap proof, complete report schema, empty-outbox prohibition, publish-before-reply ordering, retry behavior, installed-package evidence contract and dynamic workflow coverage.

The validator's own PASS cannot prove that no validator delta is required when the validator is itself the correction target.

## Publication

Primary and mailbox commits are fast-forward, exact-scope and remotely refetched. Manual SHA transcription is forbidden.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. If primary write access fails after one repair, return `BLOCKED_PUSH_AUTH` with complete evidence.

Codex never edits STATE.