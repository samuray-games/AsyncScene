# Asynchronia Repository Policy

BRIDGE_PROTOCOL: 3.1
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

## 0. Bridge command aliases

The exact trimmed user commands `мост 1`, `мост 2`, and `мост 3` are reserved for the ChatGPT-Codex mailbox bridge and must be processed before any generic interpretation.

A previous conversational conclusion, previous final response, local mailbox copy, old claim, old inbox or historical outbox is never authority for a new numbered command.

When the user writes one of these commands, Codex must, before any terminal response:

1. parse the bridge slot number as exactly `1`, `2`, or `3`;
2. fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
3. read current remote `AGENTS.override.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md`, `BRIDGE.md`, mailbox `.ai-bridge/PUBLICATION_POLICY.md` and `.ai-bridge/STATE.md`;
4. read the exact current inbox and current claim named by STATE;
5. verify slot, thread id, lane id, task id, execution epoch, phase, baseline, write scope and expected outbox;
6. execute the current phase from a clean task-owned worktree;
7. validate and publish exactly as authorized;
8. refetch both remote refs and prove the result.

Codex must not reuse a prior `completed` conversational state to skip these steps.

The former bare command `мост` and the older command phrase are inactive.

### 0.0.1 Current claim and thread rotation

Protocol 3.1 exposes three fixed slots.

- `мост 1` may execute only Slot 1.
- `мост 2` may execute only Slot 2.
- `мост 3` may execute only Slot 3.
- STATE names the only current inbox and only current claim for each open slot.
- Superseded claims and inboxes are historical only.
- A replacement claim created by ChatGPT after baseline movement or no-op recovery may be adopted by a fresh Codex thread when STATE says `THREAD_ROTATION_REQUIRED: true`.
- When thread rotation is required, the previous Codex thread is explicitly superseded and must not be treated as claim owner.
- The fresh thread adopts only the current replacement claim named by STATE.
- No extra model preflight, `CONTINUE`, `APPROVE`, `пул` or `пуш` is required for a numbered lane unless the current inbox explicitly defines a genuine external blocker.
- `CORRECTION_REQUIRED` must execute on the next matching numbered command.
- If the slot is closed or unavailable, return `BRIDGE_SLOT_UNAVAILABLE`.
- If a non-superseded current claim is genuinely owned by another active thread, return `BRIDGE_SLOT_ALREADY_CLAIMED`.

### 0.0.2 No-op completion guard

The response `Return to ChatGPT and send мост N`, or any equivalent, is forbidden unless all current remote evidence exists for the exact current execution epoch.

Before returning success Codex must prove:

- it freshly fetched both remote refs during this command;
- the expected current outbox path named by STATE exists remotely;
- the mailbox head contains that outbox as the current publication;
- for a primary-write task, `origin/main` differs from the authorized baseline and equals the reported primary SHA;
- the reported primary parent is the actual first parent;
- exact changed paths equal the frozen scope;
- required validations passed;
- the outbox contains the exact fetched SHA and parent.

A historical outbox cannot satisfy a new execution epoch.

If these conditions are absent, Codex must not send the user back to ChatGPT. It must either execute the task or return one explicit blocker. A one-line return without evidence is exactly `FAIL_NO_EXECUTION_EVIDENCE`.

### 0.0.3 Mailbox branch guard

Every Codex mailbox write must:

- fetch the mailbox branch immediately before writing;
- record the fetched head as parent;
- use a dedicated clean mailbox worktree;
- commit only the exact authorized receipt or outbox path;
- push fast-forward without force;
- refetch and prove the remote mailbox head equals the new commit.

Never create mailbox commits from `main` or from a detached primary commit.

A mailbox claim or outbox is not accepted until ChatGPT independently verifies remote head, ancestry, paths and current main.

These aliases do not bypass runtime safety, exact task scope, dependency gates or user-owned Safari acceptance.

## 0.1 Git command aliases

The exact trimmed user commands `запуль` and `запушь` are reserved repository commands and must be processed before generic interpretation.

### `запуль`

When the user writes exactly `запуль`, Codex must read root `GIT_PULL.md` and follow it exactly. It must not reinterpret the command as merge, rebase, stash, reset, clean, commit, push or dirty-worktree repair.

### `запушь`

When the user writes exactly `запушь`, Codex must read root `GIT_PUSH.md` and follow it exactly. It may publish only the current task's already authorized changes or commits and must never force-push, rewrite history, absorb unrelated changes, bypass runtime approval or claim deployment/runtime acceptance from a Git push.

These aliases do not bypass native permission prompts, runtime-safety-gate, exact task scope, Git safety checks or user-owned Safari acceptance.

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

## 5. Runtime safety gate

Treat these as runtime-sensitive:

- game runtime JavaScript and UI runtime JavaScript;
- economy, battle systems and NPC systems;
- persistence, state and save systems;
- routing, shared smoke registries and every `dev-checks.js` copy;
- `Game.__DEV`, `Game.Dev`, boot logic, exports, globals and smoke visibility; and
- mirrored runtime copies.

If any runtime-sensitive file is required:

- make no edits;
- return `RUNTIME_SAFETY_GATE_REQUIRED`;
- list every required runtime-sensitive file and why it is required;
- identify mirrors and shared wiring; and
- state: `This task needs an isolated serialized runtime slot.`

If no runtime-sensitive file is required:

- return `SAFE_TO_PROCEED`;
- state the exact allowed file scope; and
- continue only inside that scope.

Never bypass the gate because a change appears small.

### 5.1 Approval protocol

When the gate returns `RUNTIME_SAFETY_GATE_REQUIRED`, the response must end with exactly one standalone fenced text code block containing only `APPROVE`, with no text after it.

```text
APPROVE
```

Accepted confirmation tokens in the same Codex thread are case-insensitive after trimming whitespace: `approve`, `confirm`, `ok`, `okay`, `ок`, `окей` and `подтверждаю`.

The token applies only to one exact pending runtime task in the same thread and exact frozen file scope. Native Codex permission dialogs remain separate.

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
- Runtime synchronization remains subject to runtime approval.
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

## 8.1 Parallel work policy

- Use `parallel-scope-planner` whenever multiple tasks or bridge lanes exist.
- Every lane has one atomic goal, one claim, one baseline, one branch/worktree, one allowed read set, one allowed write set, one dependency set and one outbox.
- Evaluate task-owned writes separately from the entire dirty tree.
- Unrelated dirty files do not automatically block work.
- Read-only lanes may run concurrently when they have no stable-read dependency on mutable outputs from another lane.
- Overlapping writes, stable-read dependencies, mirror pairs, shared wiring, runtime slots, registries and unresolved scope require serialization.
- Source and deployed mirrors share one ownership lane.
- `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized singleton lanes.
- One final documentation owner updates shared `TASKS.md` and `PROJECT_MEMORY.md` per wave.
- Runtime gate decisions take precedence over parallel planning.
- A lane may not merge, rebase or absorb another lane's work unless a dedicated integration task authorizes it.

## 8.2 Routing policy

- Runtime safety has precedence over routing convenience.