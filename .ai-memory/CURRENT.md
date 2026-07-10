# Current Memory

MEMORY_REV: 2026-07-10-2109-JST

Repo identity:

- Repository: `samuray-games/AsyncScene`
- Source of truth for implementation state: git-tracked repository files
- Remote accessibility target: GitHub

Current memory contract:

- Keep live state here, not in the historical archive.
- Do not duplicate full legacy timelines.
- Prefer short factual entries with explicit dates and SHAs.

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
