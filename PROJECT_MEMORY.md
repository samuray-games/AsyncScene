# Current Memory Index

This file is the compact entrypoint for project memory.

Authoritative order for memory and process facts:

1. `AGENTS.override.md`
2. `AGENTS.md`
3. `CLOSED_LOOP_PROTOCOL.md` for bridge and process contracts
4. `TASKS.md` for active work state
5. `.ai-memory/CURRENT.md` for live repo memory
6. `.ai-memory/DECISIONS.md` for stable decisions
7. `.ai-memory/CANON.md` for product canon
8. `.ai-memory/WORKFLOWS.md` for runbooks and validation flows
9. `.ai-memory/archive/` for immutable historical cycles

Repository files are authoritative for current state. GitHub is the fallback for reading memory away from the local workspace.

Memory ownership:

- `CURRENT.md`: live project state, active risks, current baselines, and next actions.
- `DECISIONS.md`: stable process and architecture decisions.
- `CANON.md`: product canon, UI rules, and accepted behavior boundaries.
- `WORKFLOWS.md`: step-by-step workflows, validation recipes, and bootstrap procedures.
- `archive/`: completed cycles and legacy history, append-only.

Revision rules:

- `CURRENT.md` stays compact and never copies the full legacy timeline.
- Git history is the archive of record; `CURRENT.md` only points to the latest accepted state.
- If repo memory and a remote bootstrap disagree, the repo wins and the mismatch must be logged.
- Bridge artifacts 062/063 remain immutable history and are not rewritten.

Current migration status:

- Repo-first memory split implemented.
- Google Drive bootstrap now points at this repo index and the `.ai-memory/` structure.
- No runtime or game code was changed.
- The legacy root timeline is archived under `.ai-memory/archive/`.
