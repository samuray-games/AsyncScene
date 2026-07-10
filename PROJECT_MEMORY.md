# Current Memory Index

REPO_MEMORY_REV: 2026-07-10-2109-JST
ROOT_CHILD_REV: 2026-07-10-2109-JST
ARCHIVE_CHILD_REV: 2026-07-10-2109-JST

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

Source precedence and conflict behavior:

- Repository files are authoritative for current state.
- GitHub is the fallback for reading memory away from the local workspace.
- If repo memory and a remote bootstrap disagree, the repo wins and the mismatch must be logged in the next update.
- If any compact-index child revision disagrees with `REPO_MEMORY_REV`, treat the index as stale and reject the claim.
- Bridge artifacts 062/063 remain immutable history and are not rewritten.

Memory ownership:

- `CURRENT.md`: live project state, active risks, current baselines, and next actions.
- `DECISIONS.md`: stable process and architecture decisions.
- `CANON.md`: product canon, UI rules, and accepted behavior boundaries.
- `WORKFLOWS.md`: step-by-step workflows, validation recipes, and bootstrap procedures.
- `archive/`: completed cycles and legacy history, append-only.

Current migration status:

- Repo-first memory split implemented.
- The root index points to the owned repository memory files.
- No runtime or game code was changed.
- The legacy root timeline is preserved in `.ai-memory/archive/PROJECT_MEMORY_LEGACY_PRE_SPLIT.md`.

Validation expectations:

- Root and child revision checks must be consistent.
- Relative links to owned memory files must resolve.
- Legacy archive bytes must match the pre-split root payload.
- `git diff --check` must pass before handoff.
