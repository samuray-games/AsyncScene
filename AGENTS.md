# Asynchronia Repository Policy

BRIDGE_PROTOCOL: 4.0
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
CROSS_SLOT_BLINDNESS: REQUIRED
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
BRIDGE_AUTHORITY_CHECK: `python3 tools/bridge_v4_authority_check.py`

## 0. Bridge command aliases

The exact trimmed user commands `мост 1`, `мост 2`, and `мост 3` are reserved for the ChatGPT-Codex mailbox bridge and must be processed before any generic interpretation.

The commands map one-to-one:

- `мост 1` -> `origin/coordination/chatgpt-codex-bridge-1`
- `мост 2` -> `origin/coordination/chatgpt-codex-bridge-2`
- `мост 3` -> `origin/coordination/chatgpt-codex-bridge-3`

A previous conversational conclusion, previous final response, local mailbox copy, old claim, old inbox or historical outbox is never authority for a new numbered command.

For `мост N`, Codex must, before any terminal response:

1. parse the slot number as exactly `1`, `2`, or `3`;
2. fetch `origin/main` and only `origin/coordination/chatgpt-codex-bridge-N`;
3. read current remote `AGENTS.override.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md`, `BRIDGE.md`, the selected mailbox `.ai-bridge/PUBLICATION_POLICY.md` and its `.ai-bridge/STATE.md`;
4. read only the current Slot N inbox and claim named by that STATE;
5. validate slot, mailbox ref, task branch, thread id, task id, execution epoch, phase and write scope;
6. perform mandatory model preflight and pause for same-thread `CONTINUE`;
7. execute from a clean task-owned worktree on `bridge/N/<thread-id>`;
8. validate and publish implementation only to that task branch and bridge artifacts only to mailbox ref N;
9. refetch and prove both destinations;
10. prove the other two numbered mailbox refs did not move.

Normal execution must not fetch, inspect, adopt, close, rotate or rewrite another numbered mailbox ref. Cross-slot inspection is allowed only for an explicit integration or audit task that names every inspected slot.

The former bare command `мост` and older command phrases are inactive.

### 0.0.1 Slot-local state and thread rotation

- Each numbered mailbox ref owns exactly one slot-local `.ai-bridge/STATE.md`.
- Shared activation pointers such as `OPEN_SLOT_COUNT` and `PRIMARY_ACTIVE_SLOT` are forbidden.
- STATE N may name only Slot N identity, task branch, thread, generation, task, epoch, inbox, claim, expected outbox, expected receipt, preflight state, continuation state, acceptance state and next action.
- Superseded Slot N claims and inboxes are historical only for Slot N.
- Rotating Slot N must preserve byte-identical state and memory snapshots for Slots M.
- Another slot moving must not invalidate Slot N model preflight or same-thread `CONTINUE` authorization.
- If the selected slot is closed or unavailable, return `BRIDGE_SLOT_UNAVAILABLE`.
- If a non-superseded current claim is genuinely owned by another active thread in the same slot, return `BRIDGE_SLOT_ALREADY_CLAIMED`.

### 0.0.2 Task publication and no-op guard

Task implementation is committed and pushed only to `bridge/N/<thread-id>`. Direct task-lane publication to `main` is forbidden.

Before returning task success Codex must prove:

- it freshly fetched `main` and the selected numbered mailbox ref during this command;
- the expected current outbox exists remotely on that numbered mailbox ref;
- the reported task-branch SHA and actual parent are fetched facts;
- exact changed paths equal the frozen scope;
- required validations passed;
- the outbox contains the exact fetched evidence;
- the other numbered mailbox refs did not move.

A historical outbox cannot satisfy a new execution epoch. A one-line return without current evidence is exactly `FAIL_NO_EXECUTION_EVIDENCE`.

`VERIFIED_NO_DELTA` is allowed only when current slot authority explicitly permits it and complete evidence proves an empty authorized diff. Empty commits are forbidden.

### 0.0.3 Mailbox branch guard

Every mailbox write must:

- target only `coordination/chatgpt-codex-bridge-N` for Slot N;
- fetch that ref immediately before writing;
- record the fetched head as parent;
- use a dedicated clean mailbox worktree;
- commit only the exact authorized Slot N receipt or outbox path;
- push fast-forward without force;
- refetch and prove the remote mailbox head equals the new commit;
- prove refs for the other two slots did not move.

Publishing Slot N artifacts on mailbox ref M is `FAIL_CROSS_SLOT_PUBLICATION`.

### 0.0.4 Serialized integration

Collision-free task branches may execute concurrently. Integration into `main` is a separate serialized phase.

The integration owner must refetch current `main`, verify accepted slot-local evidence, compare exact changed paths and stable-read dependencies, reject true overlap or stale semantic dependencies, and merge or replay one accepted lane at a time.

Movement of `main` may require integration replay but must not reset, rotate or corrupt another bridge lane.

### 0.0.5 Independent memory

Current bridge snapshots are stored separately:

- `.ai-memory/bridges/1.md`
- `.ai-memory/bridges/2.md`
- `.ai-memory/bridges/3.md`

Changing one snapshot must preserve byte-identical contents of the other two.

### 0.0.6 Legacy shared ref

`coordination/chatgpt-codex-bridge` is legacy read-only. It must not activate, rotate, publish or continue new work.

## 0.1 Git command aliases

The exact trimmed user commands `запуль` and `запушь` are reserved repository commands and must be processed before generic interpretation.

### `запуль`

When the user writes exactly `запуль`, Codex must read root `GIT_PULL.md` and follow it exactly. It must not reinterpret the command as merge, rebase, stash, reset, clean, commit, push or dirty-worktree repair.

### `запушь`

When the user writes exactly `запушь`, Codex must read root `GIT_PUSH.md` and follow it exactly. It may publish only the current task's already authorized changes or commits and must never force-push, rewrite history, absorb unrelated changes, bypass scope isolation or claim deployment/runtime acceptance from a Git push.

These aliases do not bypass native permission prompts, scope-isolation-check, exact task scope, Git safety checks or user-owned Safari acceptance.

## 1. Project identity

- Project name: Asynchronia.
- Legacy repository references may still use AsyncScene.
- Product direction: an asynchronous simulator of social conflicts and interactions.
- Current architecture: static HTML and JavaScript.
- Inspect the existing architecture before proposing new infrastructure.

## 2. Working roles

- The user runs Safari runtime smoke on iPhone or iMac.
- Codex implements isolated repository changes and static validation.
- ChatGPT coordinates tasks, bridge lanes and acceptance.
- Codex must not claim user acceptance.
- Runtime PASS exists only after the user supplies the Safari smoke result.
- Static checks may pass without creating runtime acceptance.

## 3. Mandatory context

Before planning or editing, Codex must:

- read `AGENTS.md`, `TASKS.md` and `PROJECT_MEMORY.md`;
- inspect exact target files and similar completed systems;
- check Git status and the current diff;
- distinguish task-owned, declared-concurrent and repository-observed changes;
- preserve unrelated or concurrent changes; and
- preserve project infrastructure unless explicitly authorized.

## 4. Atomic execution

- Execute one atomic task per claimed bridge lane.
- Do not mix UI and logic.
- Do not perform unrelated refactoring, opportunistic cleanup or renaming outside scope.
- Do not add dependencies unless explicitly approved.
- Preserve canon and current behavior.
- Stop when the task requires work outside the authorized scope.

## 5. Scope isolation check

Treat exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership and collision-free parallel lanes as the active safety mechanism.

Sensitive ownership groups include:

- game runtime JavaScript and UI runtime JavaScript;
- economy, battle systems and NPC systems;
- persistence, state and save systems;
- routing, shared smoke registries and every `dev-checks.js` copy;
- `Game.__DEV`, `Game.Dev`, boot logic, exports, globals and smoke visibility; and
- mirrored runtime copies.

If a task requires overlapping or dependent scope:

- return `BLOCKED_SCOPE_COLLISION`;
- list every colliding file with exact paths, owners and dependencies;
- identify mirrors and shared wiring; and
- state the exact overlap that prevents execution.

If the lane is exact and isolated:

- return `SAFE_TO_PROCEED`;
- state the exact allowed file scope; and
- continue only inside that scope.

Never classify a collision-free lane as blocked merely because a file is mechanically sensitive.

## 6. Canonical mechanics

### Arguments

- Argument families are ABOUT, WHO, WHERE and YN.
- There are nine canonical argument pairs.
- WHERE and YN use `там, где {PLACE}`.
- `здесь` is forbidden in YN.
- UI profiles may shorten presentation but cannot change argument logic.

### Voting economy

- Participation: +1 REP and -1 point.
- Majority winner: +2 REP and +1 point.
- Minority: -2 REP and +0 points.
- Points must remain conservative and every economic change traceable.

### Rematch

- The loser pays the rematch cost.
- Initial cost is 1 point and increases.
- Rematch does not change REP.

### Cop flow

- DM to cop, acknowledgement or reward, public post, then cooldown.
- Cop-chat frequency is three times lower than ordinary chat.

### Grey `Вброс`

- Show a hint.
- Do not use `Не хватает пойнтов.`
- Use the shared zero-balance toast when balance is zero.

### UI profiles

- Millennial is the base profile.
- Zoomer is a text-only derivative.
- Alpha is an ultra-direct derivative of Zoomer.
- Profiles must not introduce runtime logic, entities, handlers, economy, battle rules or state.
- Alpha reduces text without infantilism or loss of meaning.

## 7. Economy invariants

- No untraceable emission or silent point creation or destruction.
- `moneyLog`, or the current equivalent ledger, remains authoritative.
- Transfers identify source, receiver, amount, reason and related event or battle.
- NPC and player cases use the same canonical economy unless explicitly specified.
- Crowd refunds, remainder and winner/loser transfers remain traceable.
- Economy-sensitive work requires positive conservation and traceability evidence.
- Explicit sources and sinks must be canonical and fully recorded.
- Duplicate settlement, lost remainders, invalid refunds and untraceable deltas are `FAIL`.
- Ambiguous economy behavior routes to Canon Audit.
- Deployed mirror parity routes to Mirror Audit.
- Runtime acceptance remains user-controlled.

## 7.1 Canon audit

- Accepted canon outranks current implementation and stale plans.
- Authoritative conflicts return `BLOCKED` and require user resolution.
- Silent mechanic drift and undocumented exceptions are `FAIL`.
- Canon Audit determines intended rules but does not prove economy conservation or mirror parity.

## 7.2 Mirror audit

- Source and deployed counterparts form one serialized ownership lane.
- Byte parity, semantic parity and wiring parity are separate checks.
- Matching contents do not prove reachability or deployment correctness.
- Accepted transformations must be authoritative and deterministic.
- Unresolved ownership or transformation rules return `BLOCKED`.
- Runtime synchronization remains subject to scope isolation, mirror ownership and user-owned Safari acceptance when runtime evidence is required.
- Deployed acceptance remains user-controlled through Safari smoke.

## 8. Model selection rule

Available Codex models are exactly:

- GPT-5.5;
- GPT-5.4; and
- GPT-5.4-Mini.

Available reasoning levels are exactly Light, Medium, High and Extra High.

For every task, Codex must:

- compare the exact task with existing infrastructure and similar completed work;
- recommend the cheapest reliable option among all available model/reasoning pairs;
- state the recommended model and reasoning level;
- explain why weaker options are insufficient and stronger options unnecessary;
- justify promotion from runtime sensitivity, architectural risk, ambiguity, concurrency, validation cost or release impact;
- never invent model names or silently downgrade; and
- treat selection as a recommendation unless the user selected it in the Codex interface.

The user selects the active model. If it cannot be externally verified, report `USER_SELECTED_UNVERIFIED`. Codex self-report is `SELF_REPORTED_UNVERIFIED` and is not proof.

Only the Asynchronia plugin `model-selector` may originate, rank or name a model recommendation. The current repository preflight contract makes that recommendation a blocking pre-implementation gate. Codex must stop with `WAITING_FOR_MODEL_SELECTION`, emit exactly one standalone fenced `CONTINUE` block, and perform no implementation or mutable command before exact same-thread `CONTINUE`.

## 8.1 Parallel work policy

- Use `parallel-scope-planner` whenever multiple tasks or bridge lanes exist.
- Every lane has one atomic goal, one claim, one baseline, one branch/worktree, one allowed read set, one allowed write set, one dependency set and one outbox.
- Evaluate task-owned writes separately from the entire dirty tree.
- Unrelated dirty files do not automatically block work.
- Read-only lanes may run concurrently when they have no stable-read dependency on mutable outputs from another lane.
- Overlapping writes, stable-read dependencies, mirror pairs, shared wiring, registries and unresolved scope require serialization.
- Source and deployed mirrors share one ownership lane.
- `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized singleton lanes.
- One final documentation owner updates shared `TASKS.md` and `PROJECT_MEMORY.md` per wave.
- Scope-isolation and collision decisions take precedence over parallel planning.
- A lane may not merge, rebase or absorb another lane's work unless a dedicated integration task authorizes it.

## 8.2 Routing policy

- Runtime safety has precedence over routing convenience.

## Bridge 062 plugin-independent closed-loop correction

BRIDGE-20260710-062 uses execution epoch CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST and baseline 32513f02daf5943c41f24328e1ae251d6bc85ccc.
The terminal success action code is exactly OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND.
This lane uses plugin-independent bridge transport: source implementation acceptance and separate canary acceptance are required before closed-loop completion; plugin installation and plugin package acceptance are outside this gate.
Active STATE, inbox, claim, outbox and receipt artifacts remain absent from main; ChatGPT publishes mailbox artifacts after independent PR verification and merge.
