# Current Memory Index

REPO_MEMORY_REV: 2026-07-10-2315-JST
ROOT_CHILD_REV: 2026-07-10-2315-JST
ARCHIVE_CHILD_REV: 2026-07-10-2315-JST
CURRENT_CHILD_EXPECTED_REV: 2026-07-10-2315-JST
DECISIONS_CHILD_EXPECTED_REV: 2026-07-10-2315-JST
CANON_CHILD_EXPECTED_REV: 2026-07-10-2315-JST
WORKFLOWS_CHILD_EXPECTED_REV: 2026-07-10-2315-JST
ROOT_STATUS: FAIL_CLOSED_ON_REVISION_MISMATCH
ACTIVE_CYCLE: CYCLE-20260710-002
ACTIVE_THREAD: BRIDGE-20260710-068
ACTIVE_TASK: TASK-REPO-FIRST-MEMORY-MIGRATION-CONTENT-CORRECTION
CURRENT_MAIN_BASELINE: d8b4508b97374fcdfe62fad9137b64b7295a792f
ACCEPTED_MAIN_PENDING: true
DRIVE_SYNC_STATUS: PENDING_CHATGPT_VERIFICATION
NEXT_ACTION: Select branch `bridge/repo-memory-064` in the Codex branch selector, verify the repaired PR head, and publish the current mailbox evidence.

This file is the compact entrypoint for project memory.

Authoritative order for memory and process facts:

1. `AGENTS.override.md`
2. `AGENTS.md`
3. `PROJECT_MEMORY.md`
4. `TASKS.md`
5. `.ai-memory/CURRENT.md`
6. `.ai-memory/DECISIONS.md`
7. `.ai-memory/CANON.md`
8. `.ai-memory/WORKFLOWS.md`
9. `.ai-memory/archive/`

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
- The root file is intentionally compact and fails closed when the revision fields diverge.

Validation expectations:

- Root and child revision checks must be consistent.
- Relative links to owned memory files must resolve.
- Legacy archive bytes must match the pre-split root payload.
- `git diff --check` must pass before handoff.
