# Current Memory

MEMORY_REV: 2026-07-10-2315-JST
EXPECTED_REV: 2026-07-10-2315-JST
FAIL_CLOSED_STATUS: REVISION_MISMATCH_BLOCKS_PROMOTION
ACTIVE_CYCLE: CYCLE-20260710-002
ACTIVE_THREAD: BRIDGE-20260710-070
ACTIVE_TASK: TASK-REPO-FIRST-MEMORY-MIGRATION-FINAL-INCONSISTENCY-CORRECTION
CURRENT_MAIN_BASELINE: d8b4508b97374fcdfe62fad9137b64b7295a792f
ACCEPTED_MAIN_PENDING: true
DRIVE_SYNC_STATUS: PENDING_CHATGPT_VERIFICATION
NEXT_ACTION: ChatGPT verifies PR 199, then after acceptance marks it ready, merges it, publishes the source outbox and receipt, synchronizes repository memory and Google Drive bootstrap, and prepares the separate canary.

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
- The corrected bridge cycle expects the compact root to stay in review until ChatGPT verifies the repaired PR head.

Current constraints:

- Do not modify runtime/game code for the memory migration.
- Preserve immutable bridge artifacts 062/063.
- Keep future updates append-only in the archive and compact in this file.
- Keep root and child revision fields aligned with `REPO_MEMORY_REV`.

Next action:

- Keep the external bootstrap text in the migration report synchronized with the repository index and archive.
