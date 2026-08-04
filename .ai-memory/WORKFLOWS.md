# Workflows

This file defines the minimum repository-first memory and execution workflows.

MEMORY_REVISION: 2026-08-04-1642-JST
EXPECTED_REVISION: 2026-08-04-1642-JST
NOTION_MEMORY_REVISION: 2026-08-04-1642-JST

## Authority order

1. Latest explicit user instruction.
2. Current project instructions.
3. `AGENTS.override.md`, `AGENTS.md`, and applicable policy files.
4. Current repository execution sources, task state, tests, and relevant code.
5. `PROJECT_MEMORY.md` and `.ai-memory/CURRENT.md`.
6. `.ai-memory/DECISIONS.md`, `.ai-memory/CANON.md`, and this file.
7. `TASKS.md`.
8. Live canonical Notion project memory.
9. Historical archives and backups.

When Notion conflicts with newer primary repository evidence, report the conflict and use repository evidence for current implementation state.

## Current handoff

- Stage 6 is complete and accepted.
- Accepted runtime implementation head: `f8fe6555462e072f416ff5d64df8947def74a76e`.
- No Stage 6 acceptance blocker remains.
- Stage 7 is historical and inactive.
- NEXT_ACTION: `STOP_STAGE6_AND_WAIT_FOR_EXPLICIT_USER_INSTRUCTION_BEFORE_ANY_STAGE7_WORK`.

## Bootstrap workflow

1. Fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY` during the current response.
2. Report its exact top-level `MEMORY_REV`.
3. Fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF` immediately afterward.
4. Verify current repository primary evidence before relying on compact memory summaries.
5. Never use the deprecated Google Drive migration stub as a substitute for live Notion.

Canonical Notion page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`.
Active handoff page ID: `3b1815ae-752f-811a-8b90-f6c43d13611c`.

## Same-execution update workflow

After every accepted remote state change:

1. Update task-local state when one exists.
2. Update the live canonical Notion memory and existing active handoff when authorized.
3. Update `.ai-memory/CURRENT.md` and `PROJECT_MEMORY.md` with compact current state.
4. Update `CANON.md` only when accepted product or process canon changes.
5. Update `WORKFLOWS.md` only when an operating workflow or exact handoff changes.
6. Update `TASKS.md` when task status changes.
7. Preserve historical detail in Git history or `.ai-memory/archive/` rather than bloating current snapshots.
8. Re-read written targets and verify revision, SHAs, status, and exact next action.

## Protected-scope workflow

1. Never widen an implementation task merely to update shared memory.
2. Never write directly to `main` when repository policy forbids it.
3. Use a dedicated docs-only memory-sync branch when accepted implementation state and tracked memory diverge.
4. Do not claim repository memory synchronized until that branch is reviewed, merged, and re-read from `main`.
5. Memory-only work does not require runtime or gameplay smoke.

## Stage transition workflow

1. Closing an accepted stage does not authorize the next stage.
2. Historical drafts are not active tasks.
3. Stage 7 may begin only after a new explicit user instruction naming or clearly authorizing Stage 7 work.
4. Until then, do not create Stage 7 plans, prompts, branches, implementation, publication, or acceptance work.

## Reporting workflow

Every active project status must provide one exact `NEXT_ACTION` that names the actor, target, prerequisite, and stop condition. Do not offer a menu when one authoritative next step exists.

## Validation workflow

- For memory-only changes, verify exact file scope, revision consistency, links, and branch diff.
- Do not run runtime smoke for memory-only changes.
- Verify current remote branch heads after writes.
- Treat unresolved revision mismatch as fail-closed.
- Verify live Notion after each meaningful accepted transition.

## Work and Codex routing

- Documentation-only maintenance should be completed directly when safe and available.
- Do not invoke Work or Codex merely to perform mechanical memory synchronization.
- Respect explicit user quota constraints.
- Codex model selection applies only to an actual authorized Codex implementation lane.
- Work and Codex are separate execution roles; their continuation gates are not inherited automatically.

## `лог` review workflow

When the user writes exactly `лог`:

1. Fetch live canonical Notion and report exact `MEMORY_REV`.
2. Fetch current repository primary evidence.
3. Read Issue #224 and the newest valid forensic analysis cursor.
4. Enumerate later valid forensic run records.
5. Fetch and verify each immutable package and correlate it with independent GitHub evidence.
6. Report the earliest evidence-backed divergence, effects, missing coverage, ambiguity, and correction.
7. Add a new analysis cursor only after the review completes.
8. If no new valid records exist, report that exactly and do not invent an incident.
