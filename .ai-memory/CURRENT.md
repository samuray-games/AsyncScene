# Current Memory

MEMORY_REV: 2026-07-10-2315-JST
EXPECTED_REV: 2026-07-10-2315-JST
FAIL_CLOSED_STATUS: REVISION_MISMATCH_BLOCKS_PROMOTION
CURRENT_MAIN_BASELINE: 7700be547972181f6a4a47379fcf4494f0c4aca3
ACCEPTED_MAIN_PENDING: false
DRIVE_SYNC_STATUS: SYNCHRONIZED
CANARY_STATUS: ACCEPTED
CYCLE_COMPLETE: true
NEXT_ACTION: Resume normal project work.

Repo identity:

- Repository: `samuray-games/AsyncScene`
- Source of truth for implementation state: git-tracked repository files
- Remote accessibility target: GitHub

Current memory contract:

- Keep live state here, not in the historical archive.
- Do not duplicate full legacy timelines.
- Prefer short factual entries with explicit dates and SHAs.

Authoritative order for memory and process facts:

1. Explicit user instruction
2. Current repository primary evidence
3. Active `.ai-bridge/STATE.md`
4. `PROJECT_MEMORY.md`
5. `.ai-memory/CURRENT.md`
6. `.ai-memory/DECISIONS.md`
7. `.ai-memory/CANON.md`
8. `.ai-memory/WORKFLOWS.md`
9. `TASKS.md`
10. Google Drive bootstrap
11. `.ai-memory/archive/`

Active state:

- Memory split introduced to replace the monolithic Google Drive-style project memory.
- Root `PROJECT_MEMORY.md` is now the index and pointer file.
- `.ai-memory/DECISIONS.md`, `.ai-memory/CANON.md`, and `.ai-memory/WORKFLOWS.md` hold the stable details.
- `.ai-memory/archive/` holds immutable cycle history.
- The corrected bridge cycle and separate canary are accepted and complete.

Current constraints:

- Do not modify runtime/game code for the memory migration.
- Preserve immutable bridge artifacts 062/063.
- Keep future updates append-only in the archive and compact in this file.
- Keep root and child revision fields aligned with `REPO_MEMORY_REV`.
