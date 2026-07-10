# Workflows

This file documents the minimum workflows for the repo-first memory system.

MEMORY_REVISION: 2026-07-10-2315-JST
EXPECTED_REVISION: 2026-07-10-2315-JST

Authoritative order for memory and workflow facts:

1. `AGENTS.override.md`
2. `AGENTS.md`
3. `PROJECT_MEMORY.md`
4. `.ai-memory/CURRENT.md`
5. `.ai-memory/DECISIONS.md`
6. `.ai-memory/CANON.md`
7. `.ai-memory/WORKFLOWS.md`
8. `.ai-memory/archive/`

## Bootstrap workflow

1. Read `AGENTS.override.md` if present.
2. Read `AGENTS.md`.
3. Read `PROJECT_MEMORY.md`.
4. Read `TASKS.md`.
5. Read `.ai-memory/CURRENT.md`.
6. Read the more specific memory files only if the task needs them.

## Update workflow

1. Record the new state in `CURRENT.md`.
2. Update `TASKS.md` if the active work state changed.
3. Update `PROJECT_MEMORY.md` only as the index and pointer file.
4. Append completed cycle history to `.ai-memory/archive/`.
5. Keep archived entries immutable after publication.

## Conflict workflow

1. If repo memory conflicts with a bootstrap document, treat the repo as authoritative.
2. Log the mismatch in the next memory update.
3. Do not overwrite accepted bridge history or runtime facts.

## Validation workflow

- Run documentation-only checks for link integrity and file presence.
- Do not use runtime or gameplay smoke for memory-only changes.
- Keep the evidence surface limited to the files actually changed.
- Include revision consistency, legacy archive byte proof, and `git diff --check` in the migration validation set.
- Treat any revision mismatch as fail-closed until the root index is updated.
