---
name: runtime-safety-gate
description: Enforce Asynchronia repository context, runtime isolation, atomic scope, and honest validation before edits. Use for every Asynchronia repository change or review that could affect project files.
---

# Runtime Safety Gate

Apply this gate before planning or making any Asynchronia repository edit.

## 1. Load mandatory repository context

Before planning edits:

1. Read `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md` from the repository root.
2. If a required context file is absent, record the absence under `failures`; never invent its contents or silently substitute another file.
3. Inspect every exact file required by the task before proposing a change.
4. Compare the requested work with existing project infrastructure and similar completed systems recorded in the repository.
5. Record every inspected path for the final response.

## 2. Apply the runtime safety gate

Treat all of the following as runtime-sensitive:

- game or UI runtime JavaScript
- economy
- battle systems
- NPC systems
- persistence
- state and save systems
- routing
- shared smoke registries
- every `dev-checks.js` copy
- `Game.__DEV`
- `Game.Dev`
- boot logic
- exports
- globals
- smoke visibility

If the task requires any runtime-sensitive file:

1. Make no edits anywhere for that task.
2. Return `status: RUNTIME_SAFETY_GATE_REQUIRED`.
3. List every required runtime-sensitive file, not only representative examples.
4. Explain precisely why each listed file is required.
5. State exactly: `This task needs an isolated serialized runtime slot.`

Do not bypass this gate because a runtime change appears small, mechanical, documentation-adjacent, or easy to validate statically.

## 3. Enforce atomic execution

- Execute one atomic task only.
- Never mix UI changes and logic changes.
- Perform no unrelated refactoring.
- Perform no cleanup outside the requested scope.
- Preserve existing canon and behavior unless the user explicitly authorizes a change.
- If the request contains separable tasks, complete only the single authorized atomic task or stop and request a narrower scope.

## 4. Validate honestly

- Run static validation appropriate to every changed file.
- Check the final changed-file list against the authorized scope.
- Never claim runtime `PASS` without a Safari smoke result supplied by the user.
- Report Safari runtime status as `PENDING_USER` until the user supplies that result.
- Compare `smokeVersion` with the deployed build whenever both are relevant and observable.
- If `smokeVersion` and the deployed build do not match, report `status: DEPLOYMENT_NOT_REACHED`; do not diagnose runtime behavior from the stale deployment.
- Report failed checks and missing coverage explicitly. Do not convert incomplete validation into a pass.

## 5. Use the final response contract

Return all of these fields in this order:

- `status`
- `inspected files`
- `changed files`
- `tests run`
- `failures`
- `missing coverage`
- `buildTag`
- `commit`
- `smokeVersion`
- `Safari smoke status`
- `exact next user action`

Use `N/A` with a specific reason when `buildTag`, `commit`, or `smokeVersion` does not apply. List `Safari smoke status: PENDING_USER` unless the user has supplied the Safari result. The exact next user action must be executable and must not imply that Codex performed a user-only Safari check.
