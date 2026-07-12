# Workflows

This file documents the minimum workflows for the repo-first memory system.

MEMORY_REVISION: 2026-07-12-0022-JST
EXPECTED_REVISION: 2026-07-12-0022-JST

Authoritative order for memory and workflow facts:

1. Explicit user instruction
2. Current repository primary evidence
3. Active task or bridge `STATE.md`
4. `PROJECT_MEMORY.md`
5. `.ai-memory/CURRENT.md`
6. `.ai-memory/DECISIONS.md`
7. `.ai-memory/CANON.md`
8. `.ai-memory/WORKFLOWS.md`
9. `TASKS.md`
10. Live Google Drive document `ASYNCHRONIA - PROJECT MEMORY`
11. `.ai-memory/archive/`

## Bootstrap workflow

1. Fetch the live Google Drive project memory in the current response.
2. Report its exact `MEMORY_REV`.
3. Read the active task or bridge `STATE.md`.
4. Verify current repository primary sources, exact remote branches, SHAs, code, and runtime evidence.
5. Read `PROJECT_MEMORY.md` and `.ai-memory/CURRENT.md`.
6. Read `.ai-memory/DECISIONS.md`, `.ai-memory/CANON.md`, `.ai-memory/WORKFLOWS.md`, and `TASKS.md` as relevant.
7. Use archive history last.
8. Fail closed on missing mandatory Google Drive memory or unresolved revision conflict.

## Same-execution update workflow

After every accepted remote state change:

1. Update the task-local `STATE.md` with exact branches, SHAs, validations, blocker, phase, and `NEXT_ACTION`.
2. Update the live Google Drive project memory to the same memory revision.
3. Update `CURRENT.md` with the compact live state.
4. Update `PROJECT_MEMORY.md` as the compact index and pointer file.
5. Update `DECISIONS.md`, `CANON.md`, or `WORKFLOWS.md` only when a durable rule changed.
6. Update `TASKS.md` when the active work state changes and the exact task scope permits it.
7. Append completed cycle history to `.ai-memory/archive/` only after acceptance and integration.
8. Re-read every written target and verify revision, branches, SHAs, status, and next action.

## Protected-scope workflow

1. Never widen an active implementation scope merely to update shared memory.
2. Never write directly to `main` when repository policy forbids it.
3. When current task scope prevents a shared-memory write, create or update a dedicated memory-sync branch from current `main`.
4. Record `MAIN_SHARED_MEMORY_DEFERRED_UNTIL_IMPLEMENTATION_ACCEPTANCE_AND_INTEGRATION` in active state and Google Drive.
5. Name integration of the memory-sync branch in the exact `NEXT_ACTION`.
6. Do not claim all repository memory is synchronized on `main` until the memory-sync branch is integrated and re-read.

## Conflict workflow

1. If repository primary evidence conflicts with Google Drive, use the repository fact.
2. Report the exact conflict with paths, branches, and SHAs.
3. Update Google Drive in the same execution when authorized.
4. If repository-memory integration is blocked by scope or branch policy, publish a dedicated memory-sync branch and record the deferral.
5. Do not overwrite accepted bridge history or runtime facts.

## Reporting workflow

Every project status report must end with an exact `NEXT_ACTION` that:

- names what the user or next executor must do;
- identifies the exact branch, task, command, review, or decision target;
- states prerequisites and blockers;
- does not offer a menu when one authoritative next step exists.

A report without a concrete `NEXT_ACTION` is incomplete, regardless of how many checks and hashes it contains. Apparently computers also need to be told that information without direction is just decorative paperwork.

## Validation workflow

- Run documentation-only checks for link integrity and file presence for memory-only changes.
- Do not use runtime or gameplay smoke for memory-only changes.
- Keep evidence limited to files actually changed.
- Verify revision consistency across the root index and current child files.
- Verify exact Google Drive `MEMORY_REV` and current remote branch heads after writes.
- Run `git diff --check` or equivalent repository formatting validation before integration.
- Treat any unresolved revision mismatch as fail-closed until the root index is updated.
