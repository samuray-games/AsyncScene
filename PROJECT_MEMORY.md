# Current Memory Index

REPO_MEMORY_REV: 2026-07-12-0022-JST
ROOT_CHILD_REV: 2026-07-12-0022-JST
ARCHIVE_CHILD_REV: 2026-07-10-2315-JST
CURRENT_CHILD_EXPECTED_REV: 2026-07-12-0022-JST
DECISIONS_CHILD_EXPECTED_REV: 2026-07-12-0022-JST
CANON_CHILD_EXPECTED_REV: 2026-07-12-0022-JST
WORKFLOWS_CHILD_EXPECTED_REV: 2026-07-12-0022-JST
ROOT_STATUS: FAIL_CLOSED_ON_REVISION_MISMATCH
ACTIVE_CYCLE: MODEL-SELECTOR-LIVE-INVENTORY-20260712
ACTIVE_THREAD: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
CURRENT_MAIN_BASELINE: 50d77eb5b5273fffc491a9f111ecdc5d526c7cea
SOURCE_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
WORK_STATE_HEAD: cc0a6a2edbd63d0d873e25ecf0b0843b94d222e9
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_COMMIT: 50d77eb5b5273fffc491a9f111ecdc5d526c7cea
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0022-JST
DRIVE_SYNC_STATUS: SYNCHRONIZED
IMPLEMENTATION_STATUS: READY_FOR_REVIEW
INSTALLED_PLUGIN_PARITY: UNVERIFIED_NOT_ACCESSIBLE
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_IMPLEMENTATION_ACCEPTED_AND_INSTALLED_PARITY_VERIFIED
CYCLE_COMPLETE: false
NEXT_ACTION: Review the remote implementation range be3330b1a90527f4ab1a98275949ec3cbaeeb3f6..0024f9315ba83583b6e89e1b007c97645af30da2. If accepted, refresh or install Asynchronia plugin 1.0.8, hash the installed model-selector source and prove parity, integrate this memory-sync branch with the accepted implementation, and then rerun the bridge-reset model preflight in a fresh Codex thread.

Authority order:
1. Explicit user instruction
2. Current repository primary evidence
3. Active task or bridge STATE
4. Repository memory index and children
5. Live Google Drive project memory
6. Immutable archive

Owned memory:
- `.ai-memory/CURRENT.md`
- `.ai-memory/DECISIONS.md`
- `.ai-memory/CANON.md`
- `.ai-memory/WORKFLOWS.md`
- `.ai-memory/archive/`

Status:
- Model-selector source version 1.0.8 is remotely published on the implementation branch.
- Preflight now discovers picker-visible models and per-model efforts from `codex app-server` `model/list`.
- Every returned model-effort pair is evaluated, including adjacent-effort comparisons and retry-adjusted cost ranking.
- Google Drive and task STATE are synchronized at memory revision 2026-07-12-0022-JST.
- Shared memory integration into `main` remains pending because direct task writes to `main` are forbidden.
- Every status report must end with an exact actionable `NEXT_ACTION`.
