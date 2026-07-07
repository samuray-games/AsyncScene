# Asynchronia Repository Policy

## 0. Bridge command alias

The exact trimmed user command `мост` is reserved for the ChatGPT-Codex mailbox bridge and must be processed before any generic interpretation.

When the user writes `мост`, Codex must:

1. read root `BRIDGE.md` and follow it exactly;
2. if local `BRIDGE.md` may be stale, fetch `origin/main` and read `git show origin/main:BRIDGE.md`;
3. fetch `origin/coordination/chatgpt-codex-bridge` without switching or rewriting the primary worktree;
4. read `.ai-bridge/STATE.md` from that remote branch;
5. discover or retain exactly one lane according to the Bridge Protocol defined in `BRIDGE.md`;
6. execute only the current phase of the claimed lane;
7. ignore closed, superseded, blocked and claimed-by-other-thread lanes; and
8. never reinterpret `мост` as a generic source/deployed mirror audit or ask which bridge the user means.

The former command phrase is superseded and must not be offered or treated as an active alias.

### 0.0.1 Parallel bridge lane claims

Bridge Protocol 2.0 may expose multiple open lanes. Bare `мост` still requires no lane name from the user.

- An existing Codex thread that already owns a valid claim continues only that claimed lane.
- A new Codex thread atomically claims the first eligible unclaimed lane in the order listed by mailbox `STATE.md`.
- The claim path is predetermined by that lane and must be written on `coordination/chatgpt-codex-bridge` before task preflight.
- A claim file is immutable, contains a generated claim token, and authorizes only that lane in the same Codex thread.
- If the mailbox remote head moves or the claim path already exists, refetch, re-read state, and select the next eligible unclaimed lane. Never overwrite a claim.
- A maximum of three claim retries is allowed. If no eligible lane remains, return `BRIDGE_NO_UNCLAIMED_LANES` and do not modify files.
- Claiming a lane does not authorize primary repository writes, does not bypass model preflight, and does not count as task PASS.

For `MODEL_PREFLIGHT_ONLY`, return only the requested preflight and end with exactly one standalone fenced text code block containing only `CONTINUE`, with no text after it. After the user selects the recommended model and sends `CONTINUE` in the same Codex thread, re-read the bridge state, claim and inbox, verify that they remain active and unchanged, then execute only that lane. Do not ask the user to relay reports to ChatGPT.

### 0.0.2 Mailbox branch guard

Every Codex mailbox write, including a lane claim or task outbox, must use the fail-closed mailbox branch guard.

Immediately before the write:

- fetch `origin/coordination/chatgpt-codex-bridge`;
- record the fetched remote head as `MAILBOX_PARENT_COMMIT`;
- use a dedicated mailbox worktree or equivalent isolated checkout whose checked-out branch is exactly `coordination/chatgpt-codex-bridge`;
- prove current branch identity and prove `HEAD` equals `MAILBOX_PARENT_COMMIT`;
- prove the commit diff contains only the exact claim or outbox path authorized by the selected lane.

The mailbox commit must be a direct child of the recorded mailbox parent. Push explicitly to `refs/heads/coordination/chatgpt-codex-bridge`, refetch, and prove the remote mailbox head equals the new mailbox commit. Never create a mailbox commit from `main`, a detached primary commit, the authorized primary baseline, or any non-mailbox branch.

When primary write scope is `NONE`, also prove `origin/main` still equals the lane's authorized primary baseline. Any mismatch returns exactly `BLOCKED_MAILBOX_BRANCH_GUARD`; no fallback, guessed repair, overwrite, force-push or mailbox write to `main` is allowed. If a mailbox file is accidentally written to `main`, return exactly `FAIL_MAILBOX_WRITTEN_TO_MAIN`.

A mailbox claim or outbox is not accepted until ChatGPT independently verifies remote head, ancestry, exact changed paths and current main, then records the exact final mailbox commit/head in an immutable closure decision.

This alias does not bypass runtime safety, native permission dialogs, exact task scope, model selection, dependency gates or user-owned Safari acceptance.

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
- Multi-task or overlapping work uses the parallel planner.
- Implementation lanes receive independent model recommendations.
- Security and web-app plugins are supporting tools, not policy overrides.
- Runtime acceptance remains user-controlled.

## 8.3 v1.0.0 workflow

- `task-router` classifies the request.
- `runtime-safety-gate` has precedence for runtime-sensitive scope.
- `model-selector` runs `MODEL_PREFLIGHT_ONLY`, then post-`CONTINUE` execution only for unchanged scope.
- `canon-audit` resolves intended accepted rules.
- `economy-invariant-audit` verifies conservation and traces.
- `mirror-audit` verifies source/deployed and deployment parity.
- `parallel-scope-planner` controls ownership and serialization.
- `smoke-orchestrator` plans the smallest sufficient smoke workflow.
- `deployment-verifier` verifies lineage, entrypoint freshness and served artifact identity.
- `acceptance-evidence-gate` decides whether evidence authorizes status promotion.
- Codex performs static validation; the user performs required Safari smoke.
- Current-thread plugin resolver/load availability must be verified independently for every task.
- Repeating skill names, paraphrasing the inbox or reading skill files is not proof of plugin load.
- Missing resolver/load evidence returns `BLOCKED_PLUGIN_NOT_LOADED` and no `CONTINUE` block.

Boundaries:

- Canon Audit does not prove economy conservation, mirror correctness, deployment freshness or acceptance authorization.
- Economy Invariant Audit does not define canon or deployment parity.
- Mirror Audit does not define canon, deployment freshness or acceptance authorization.
- Smoke Orchestrator does not replace deployment verification or acceptance gating.
- Deployment Verifier does not claim runtime behavior or user acceptance.
- Acceptance Evidence Gate does not manufacture evidence or bypass audits, deployment verification or Safari acceptance.
- Audits and acceptance skills do not approve runtime writes.

## 9. Plugin usage

Repository-tracked plugins:

- Codex Security;
- Build Web Apps; and
- Asynchronia source package v1.0.0.

Repository source manifest and marketplace metadata are `v1.0.0`. Pragmatic installed-content acceptance is recorded, but current-thread resolver/load availability must still be independently verified.

Use Codex Security before persistence, server/account systems and public release, and after major security-sensitive or runtime changes.

Use Build Web Apps for isolated UI screens, responsive layout, visual prototypes and visual smoke support. It must not bypass runtime safety or modify game logic through a UI task.

Use the Asynchronia source package workflow for safety, routing, model preflight, parallel planning, smoke orchestration, deployment verification and acceptance gating.

## 10. Validation and acceptance

- Validate every changed file appropriately.
- Run `git diff --check`.
- Check changed files against authorized scope and fail on forbidden files.
- Do not install external packages unless approved.
- Do not claim runtime PASS without user-run Safari smoke.
- Safari smoke status is `PENDING_USER` until supplied.
- If buildTag or smokeVersion differs from deployed build, return `DEPLOYMENT_NOT_REACHED`.
- Documentation-only changes may use `N/A - documentation only`.

## 11. Required Codex final report

Every implementation response must contain, in this order:

- status;
- selected or recommended model and reasoning level;
- inspected files;
- changed files;
- tests run;
- failures;
- missing coverage;
- buildTag;
- commit;
- smokeVersion;
- Safari smoke status; and
- exact next user action.

Use `N/A` with a reason when a field does not apply.

Allowed primary statuses are `PASS`, `FAIL`, `BLOCKED`, `SAFE_TO_PROCEED`, `RUNTIME_SAFETY_GATE_REQUIRED`, `DEPLOYMENT_NOT_REACHED` and `PENDING_USER`.

A Codex `PASS` means only that authorized implementation and static checks passed. It does not replace coordinator verification, user acceptance or Safari runtime smoke.

## 12. Documentation state

- Root `AGENTS.md` is the authoritative repository policy.
- `STAGE6_PARALLEL_EXECUTION_PLAN.md` is the repository-tracked operational plan for parallel Stage 6 lanes.
- Mailbox `STATE.md` is the authoritative current bridge queue and claim state.
