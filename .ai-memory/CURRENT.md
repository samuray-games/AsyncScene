# Current Memory

MEMORY_REV: 2026-07-10-2352-JST
EXPECTED_REV: 2026-07-10-2352-JST
FAIL_CLOSED_STATUS: ALIGNMENT_RESTORED
ACTIVE_CYCLE: CYCLE-20260710-002
ACTIVE_THREAD: BRIDGE-20260710-071
ACTIVE_TASK: TASK-REPO-FIRST-MEMORY-MIGRATION-FINAL-TWO-FILE-CORRECTION
CURRENT_MAIN_BASELINE: d8b4508b97374fcdfe62fad9137b64b7295a792f
ACCEPTED_MAIN_PENDING: false
DRIVE_SYNC_STATUS: PUBLISHED_AWAITING_CHATGPT_VERIFICATION
NEXT_ACTION: ChatGPT verifies the final two-file correction in PR 199, then records the synchronized repository memory and updated migration report.

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
- The corrected bridge cycle now points at the final two-file correction for the live memory index and migration report.

Current constraints:

- Do not modify runtime/game code for the memory migration.
- Preserve immutable bridge artifacts 062/063.
- Keep future updates append-only in the archive and compact in this file.
- Keep root and child revision fields aligned with `REPO_MEMORY_REV`.
- The active lane is slot 3 on branch `bridge/repo-memory-064`.

Next action:

- Keep the external bootstrap text in the migration report synchronized with the repository index and archive.
