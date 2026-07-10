# Decisions

This file holds durable process decisions that should rarely change.

## Source of truth

- Repository files are authoritative for current implementation state.
- GitHub is the accessibility fallback so memory can be read away from the local machine.
- Google Drive should become a short bootstrap pointer only.

## Memory layout

- `PROJECT_MEMORY.md` is the compact entrypoint and index.
- `.ai-memory/CURRENT.md` stores the live state summary.
- `.ai-memory/DECISIONS.md` stores stable process and architecture decisions.
- `.ai-memory/CANON.md` stores product canon and acceptance rules.
- `.ai-memory/WORKFLOWS.md` stores validation and update procedures.
- `.ai-memory/archive/` stores immutable historical cycles.

## Revision rules

- `CURRENT.md` must not embed full legacy history.
- Archive entries are append-only.
- Historical bridge artifacts 062/063 remain immutable and must not be rewritten.
- If bootstrap text, remote memory, and repo memory disagree, the repo wins and the mismatch must be called out explicitly.
- `PROJECT_MEMORY.md` must stay compact, carry the current revision fields, and fail closed on revision mismatches.

## Ownership

- `CURRENT.md`: active state owner.
- `DECISIONS.md`: process owner.
- `CANON.md`: canon owner.
- `WORKFLOWS.md`: workflow owner.
- `archive/`: historical record owner.
