---
name: parallel-scope-planner
description: Analyze one or more proposed Asynchronia tasks and return a safe concurrent or serialized execution plan without editing files, approving runtime work, or taking ownership of pre-existing changes.
---

# Parallel Scope Planner

Use this skill to plan safe execution waves for one or more proposed Asynchronia tasks.

The skill plans scopes only. It does not edit files, create branches, stash changes, approve runtime work, or execute the proposed tasks.

## 1. Core objective

Maximize safe parallel work while preventing:

- overlapping writes
- lost updates
- mirror divergence
- dependency-order violations
- runtime collisions
- mixed atomic tasks
- accidental ownership of pre-existing changes

## 2. Input requirements

Each proposed task should provide:

- task name
- objective
- expected write files or systems
- expected read-only files when known
- dependencies when known
- whether runtime work is expected

If exact files are unknown:

- inspect the repository read-only
- identify the narrowest probable file set
- mark unresolved files explicitly
- do not invent certainty

Return `BLOCKED` when safe ownership cannot be determined.

## 3. Required task analysis

For every task identify:

- atomic objective
- exact task-owned write scope
- read-only inspection scope
- runtime-sensitive scope
- mirrored files
- shared registries or shared wiring
- generated or deployed copies
- prerequisites
- downstream dependents
- validation surfaces
- documentation updates
- current concurrent changes touching related files
- unresolved scope

Task-owned writes are evaluated separately from the entire dirty tree.

Unrelated dirty files do not automatically block work.

## 4. Conflict rules

Two tasks cannot run in parallel when any of these are true:

- they write the same file
- one writes a file the other must read in a stable state
- they modify the same logical subsystem through different files
- they touch source and deployed mirror copies of the same runtime surface
- they modify shared boot, export, global, routing, registry, or smoke wiring
- one task changes a contract consumed by the other
- one task depends on the output of the other
- either task has unresolved write scope
- runtime serialization is required
- their combined execution would mix UI and logic in one atomic task

A dirty working tree alone is not a conflict.

Pre-existing concurrent changes become a conflict only when they overlap with:

- required write files
- required stable read files
- mirrored copies
- shared wiring
- generated outputs
- the same logical subsystem

Do not classify untouched unrelated dirty files as task-owned changes.

## 5. Mirror rules

Treat source and deployed mirrors as one serialized ownership group.

Examples include:

- `AsyncScene/Web/**`
- corresponding `docs/**` deployed copies

If one task changes a source file and another changes its deployed mirror:

- they conflict
- they must be merged into one serialized lane or one atomic mirror-sync task

Do not allow separate tasks to own opposite sides of one mirror pair.

## 6. Runtime precedence

The Parallel Scope Planner cannot approve runtime work.

If any planned task requires runtime-sensitive files:

- mark that task `RUNTIME_GATE_REQUIRED`
- require the scope-isolation-check decision
- require an isolated serialized runtime slot before implementation
- keep all dependent tasks behind that runtime task

A valid `APPROVE` token applies only through the scope-isolation-check protocol in the same thread.

## 7. Planning modes

For each task assign exactly one:

- `PARALLEL_SAFE`
- `SERIAL_REQUIRED`
- `RUNTIME_GATE_REQUIRED`
- `BLOCKED`

## 8. Execution waves

Produce the smallest safe sequence of waves.

Recommended structure:

- Wave 0: read-only inspection or prerequisite confirmation
- Wave 1+: independent implementation tasks with disjoint ownership
- Integration wave: shared wiring, mirrors, registries, or dependent work
- Final documentation wave: `TASKS.md` and `PROJECT_MEMORY.md` when multiple tasks would otherwise collide there
- User acceptance wave: Safari smoke or other user-only checks

Do not place two tasks in the same wave if either has a dependency on the other.

## 9. Documentation collision rule

When several tasks require `TASKS.md` or `PROJECT_MEMORY.md`:

- do not let every task write them concurrently
- assign documentation ownership to one final documentation or integration task
- earlier tasks report documentation deltas without writing shared docs unless explicitly assigned ownership

## 10. Output contract

Return:

- `status: PARALLEL_PLAN`
- analyzed tasks
- execution mode for each task
- task-owned write scope
- read-only inspection scope
- mirrored ownership groups
- dependencies
- conflicts
- preserved pre-existing changes
- execution waves
- merge or integration order
- runtime gate requirements
- shared documentation owner
- unresolved scope
- assumptions
- confidence: `low`, `medium`, or `high`
- exact next user action

If planning cannot safely continue, return:

- `status: BLOCKED`
- precise missing scope or conflict
- exact information required

## 11. Safety rules

Never:

- edit proposed task files
- create branches
- run `git reset`
- run `git checkout` on user work
- stash user changes
- stage or commit files
- reassign pre-existing changes to the current task
- claim a runtime slot is approved
- combine unrelated objectives merely to avoid a conflict
