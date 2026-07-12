# Decisions

This file holds durable process decisions that should rarely change.

MEMORY_REVISION: 2026-07-12-0023-JST
EXPECTED_REVISION: 2026-07-12-0023-JST

## Source of truth

- Repository files are authoritative for current implementation state.
- GitHub is the accessibility fallback so memory can be read away from the local machine.
- The live Google Drive document `ASYNCHRONIA - PROJECT MEMORY` is the mandatory cross-chat bootstrap and must be read directly in every project response.
- When Google Drive conflicts with newer repository primary evidence, use the repository fact, report the conflict, and update Google Drive in the same execution when authorized.

## Memory layout

- `PROJECT_MEMORY.md` is the compact entrypoint and index.
- `.ai-memory/CURRENT.md` stores the live state summary.
- `.ai-memory/DECISIONS.md` stores stable process and architecture decisions.
- `.ai-memory/CANON.md` stores product canon and acceptance rules.
- `.ai-memory/WORKFLOWS.md` stores validation and update procedures.
- `.ai-memory/archive/` stores immutable historical cycles.
- Task-local `STATE.md` records the exact current phase, heads, evidence, blocker, and next action for active work.

## Revision rules

- `CURRENT.md` must not embed full legacy history.
- Archive entries are append-only.
- Historical bridge artifacts 062/063 remain immutable and must not be rewritten.
- If bootstrap text, remote memory, and repo memory disagree, the current repository primary evidence wins and the mismatch must be called out explicitly.
- `PROJECT_MEMORY.md` must stay compact, carry the current revision fields, and fail closed on revision mismatches.
- After every accepted remote state change, synchronize task STATE, Google Drive project memory, and the authorized repository memory snapshot in the same execution.
- When frozen scope or direct-main protection prevents repository-memory publication, create or update a dedicated memory-sync branch, record the deferral explicitly, and assign integration as the next action.

## Reporting contract

- Every project status report must end with an exact actionable `NEXT_ACTION`.
- A report that only lists facts, checks, or blockers without telling the user what to do next is incomplete.
- The next action must name the target branch, task, command, or decision required and must state any prerequisite that still blocks execution.

## Ownership

- `CURRENT.md`: active state owner.
- `DECISIONS.md`: process owner.
- `CANON.md`: canon owner.
- `WORKFLOWS.md`: workflow owner.
- `archive/`: historical record owner.
- ChatGPT authors and approves project content and exact task instructions.
- Work and Codex execute technical operations and must not invent missing project content.