# Asynchronia Repository Policy

## 1. Project identity

- Project name: Asynchronia.
- Legacy repository references may still use AsyncScene.
- Product direction: an asynchronous simulator of social conflicts and interactions.
- Current architecture: static HTML and JavaScript.
- Inspect the existing architecture before proposing new infrastructure.

## 2. Working roles

- The user runs Safari runtime smoke on iPhone or iMac.
- Codex implements isolated repository changes.
- ChatGPT coordinates tasks and acceptance.
- Codex must not claim user acceptance.
- Runtime PASS exists only after the user supplies the Safari smoke result.
- Static checks may pass without creating runtime acceptance.

## 3. Mandatory context

Before planning or editing, Codex must:

- read `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md`;
- inspect the exact target files and similar completed systems;
- check Git status and the current diff;
- detect and preserve unrelated or concurrent changes; and
- preserve existing project infrastructure unless explicitly authorized.

## 4. Atomic execution

- Execute one atomic task only.
- Do not mix UI and logic.
- Do not perform unrelated refactoring, opportunistic cleanup, or renaming outside scope.
- Do not add dependencies unless explicitly approved.
- Preserve canon and current behavior.
- Stop when a task requires work outside the authorized scope.

## 5. Runtime safety gate

Treat these as runtime-sensitive:

- game runtime JavaScript and UI runtime JavaScript;
- economy, battle systems, and NPC systems;
- persistence, state, and save systems;
- routing, shared smoke registries, and every `dev-checks.js` copy;
- `Game.__DEV`, `Game.Dev`, boot logic, exports, globals, and smoke visibility; and
- mirrored runtime copies.

If any runtime-sensitive file is required:

- make no edits;
- return `RUNTIME_SAFETY_GATE_REQUIRED`;
- list every required runtime-sensitive file and explain why each is required;
- identify mirrored copies and shared wiring; and
- state: `This task needs an isolated serialized runtime slot.`

If no runtime-sensitive file is required:

- return `SAFE_TO_PROCEED`;
- state the exact allowed file scope; and
- continue only inside that scope.

Never bypass the gate because a change appears small.

### 5.1 Approval protocol

When the gate returns `RUNTIME_SAFETY_GATE_REQUIRED`, the final response must end with exactly one standalone code block containing:

```text
APPROVE
```

Accepted confirmation tokens in the same Codex thread are case-insensitive after trimming whitespace: `approve`, `confirm`, `ok`, `okay`, `ок`, `окей`, and `подтверждаю`.

The token applies only to one exact pending runtime task in the same thread and means approval for the isolated serialized runtime slot for that exact task and file scope.

Native Codex permission dialogs remain separate and are not approved by this token.

## 6. Canonical mechanics

### Arguments

- Argument families are ABOUT, WHO, WHERE, and YN.
- There are nine canonical argument pairs.
- WHERE and YN use the form `там, где {PLACE}`.
- `здесь` is forbidden in YN.
- UI profiles may shorten presentation but cannot change argument logic.

### Voting economy

- Participation: +1 REP and -1 point.
- Majority winner: +2 REP and +1 point.
- Minority: -2 REP and +0 points.
- Points must remain conservative, and every economic change must be traceable.

### Rematch

- The loser pays the rematch cost.
- The initial rematch cost is 1 point, and the rematch price increases.
- Rematch does not change REP.

### Cop flow

- Flow: DM to cop, acknowledgement or reward, public post, then cooldown.
- Cop-chat frequency is three times lower than ordinary chat.

### Grey `Вброс`

- Show a hint.
- Do not use `Не хватает пойнтов.`
- Use the shared zero-balance toast when balance is zero.

### UI profiles

- Millennial is the base profile.
- Zoomer is a text-only derivative.
- Alpha is an ultra-direct derivative of zoomer.
- UI profiles must not introduce new runtime logic, entities, handlers, economy, battle rules, or state.
- Alpha must reduce text without infantilism or loss of meaning.

## 7. Economy invariants

- No untraceable emission or silent point creation or destruction.
- `moneyLog`, or the current equivalent ledger, remains authoritative.
- Transfers identify source, receiver, amount, reason, and related event or battle.
- NPC and player cases use the same canonical economy unless explicitly specified.
- Crowd refunds, remainder, winner transfers, and loser transfers remain traceable.
- Economy-sensitive work requires positive conservation and traceability evidence.
- Explicit sources and sinks must be canonical and fully recorded.
- Duplicate settlement, lost remainders, invalid refunds, and untraceable deltas are `FAIL`.
- Ambiguous economy behavior routes to Canon Audit.
- Deployed mirror parity routes to Mirror Audit.
- Runtime acceptance remains user-controlled.

## 7.1 Canon audit

- Accepted canon outranks current implementation and stale plans.
- Authoritative conflicts return `BLOCKED` and require user resolution.
- Silent mechanic drift and undocumented exceptions are `FAIL`.
- Canon Audit determines the intended rule but does not prove economy conservation or mirror parity.
- Runtime acceptance remains user-controlled.

## 7.2 Mirror audit

- Source and deployed counterparts form one serialized ownership lane.
- Byte parity, semantic parity, and wiring parity are separate checks.
- Matching contents do not prove reachability or deployment correctness.
- Accepted transformations must be authoritative and deterministic.
- Unresolved ownership or transformation rules return `BLOCKED`.
- Runtime synchronization remains subject to runtime-safety-gate approval.
- Deployed acceptance remains user-controlled through Safari smoke.

## 8. Model selection rule

Available Codex models are exactly:

- GPT-5.5;
- GPT-5.4; and
- GPT-5.4-Mini.

Available reasoning levels are low, medium, high, and extra high.

For every task, Codex must:

- analyze the exact task and compare it with existing infrastructure and similar completed work;
- choose the cheapest reliable option among all available models;
- state the selected model and reasoning level;
- briefly explain why weaker options are insufficient;
- briefly explain why a stronger option is unnecessary or unavailable;
- justify any stronger-model promotion from task characteristics such as runtime sensitivity, architectural risk, ambiguity, concurrency, validation cost, or release impact;
- never invent model names or silently downgrade the selected model;
- never silently claim or change the active model; and
- treat the selection as a recommendation unless the user selected it in the Codex interface.

The user selects the active model in the Codex interface. Codex may recommend a model but must not falsely claim it changed or verified the active model.

If the active model cannot be verified from external metadata, report it as `USER_SELECTED_UNVERIFIED`.

If Codex reports its own model name without external verification, label it `SELF_REPORTED_UNVERIFIED`; self-report is not proof of the active model.

## 8.1 Parallel work policy

- Evaluate task-owned writes separately from the entire dirty tree.
- Unrelated dirty files do not automatically block work.
- Overlapping writes, stable-read dependencies, mirror pairs, shared wiring, and unresolved scopes require serialization.
- Source and deployed mirrors share one ownership lane.
- Shared `TASKS.md` and `PROJECT_MEMORY.md` updates should normally be assigned to one final documentation owner.
- Runtime gate decisions take precedence over parallel planning.

## 8.2 Routing policy

- Runtime safety has precedence over routing convenience.
- Multi-task or overlapping work uses the parallel planner.
- Implementation lanes receive model recommendations.
- Security and web-app plugins are optional supporting tools, not policy overrides.
- Dirty-tree evidence must distinguish task-owned, scenario-declared, and repository-observed changes.
- Runtime acceptance remains user-controlled.

## 8.3 v0.3.0 workflow

- `task-router` classifies the request.
- `runtime-safety-gate` has precedence for runtime-sensitive scope.
- `canon-audit` resolves intended accepted rules.
- `economy-invariant-audit` verifies conservation and traces.
- `mirror-audit` verifies source/deployed and deployment parity.
- `parallel-scope-planner` controls ownership and serialization when multiple tasks, mirrors, shared ownership, or concurrency exist.
- `model-selector` recommends the cheapest reliable model per implementation lane.
- Codex performs static validation.
- The user performs required Safari runtime smoke.
- Runtime acceptance remains pending until user confirmation.

Boundaries:

- Canon Audit does not prove economy conservation or mirror correctness.
- Economy Invariant Audit does not define canon or deployment parity.
- Mirror Audit does not define canon or economy conservation.
- Audits do not approve runtime writes.
- Audits do not replace user Safari acceptance.

## 9. Plugin usage

Installed plugins:

- Codex Security;
- Build Web Apps; and
- Asynchronia v0.2.0.

Use Codex Security before persistence, before server or account systems, before public release, and after major security-sensitive or runtime changes.

Use Build Web Apps for isolated UI screens, responsive layout, visual prototypes, and visual smoke support. Build Web Apps must not bypass the runtime safety gate or modify game logic through a UI task.

## 10. Validation and acceptance

- Validate every changed file appropriately.
- Run `git diff --check`.
- Check changed files against the authorized scope and fail on forbidden files.
- Do not install external packages unless approved.
- Do not claim runtime PASS without a user-run Safari smoke.
- Safari smoke status is `PENDING_USER` until supplied.
- If `buildTag` or `smokeVersion` differs from the deployed build, return `DEPLOYMENT_NOT_REACHED`.
- If a documentation-only change has no runtime surface, Safari smoke may be `N/A - documentation only`.

## 11. Required Codex final report

Every implementation response must contain, in this order:

- status;
- selected model and reasoning level;
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

Allowed primary statuses are `PASS`, `FAIL`, `BLOCKED`, `SAFE_TO_PROCEED`, `RUNTIME_SAFETY_GATE_REQUIRED`, `DEPLOYMENT_NOT_REACHED`, and `PENDING_USER`.

A Codex `PASS` means only that the authorized implementation and static checks passed. It does not replace user acceptance or Safari runtime smoke.

## 12. Documentation state

- This root `AGENTS.md` is the authoritative repository policy.
- `TASKS.md` and `PROJECT_MEMORY.md` record its creation, canonical mechanics and economy invariants, runtime safety gate, integrated audit workflow, model-selection rule, and final Codex report contract.
- Safe-task and runtime-task acceptance smokes remain pending and must be run separately.
