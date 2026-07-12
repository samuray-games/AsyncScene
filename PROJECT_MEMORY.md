# Current Memory Index

REPO_MEMORY_REV: 2026-07-12-0024-JST
ROOT_CHILD_REV: 2026-07-12-0024-JST
ARCHIVE_CHILD_REV: 2026-07-10-2315-JST
CURRENT_CHILD_EXPECTED_REV: 2026-07-12-0024-JST
DECISIONS_CHILD_EXPECTED_REV: 2026-07-12-0024-JST
CANON_CHILD_EXPECTED_REV: 2026-07-12-0024-JST
WORKFLOWS_CHILD_EXPECTED_REV: 2026-07-12-0024-JST
ROOT_STATUS: FAIL_CLOSED_ON_REVISION_MISMATCH
ACTIVE_CYCLE: MODEL-SELECTOR-LIVE-INVENTORY-20260712
ACTIVE_THREAD: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
CURRENT_MAIN_BASELINE: 9f58b473160e45c645d0baf23dc44240941db17a
SOURCE_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
WORK_STATE_HEAD: 72d77ba1feb8e2a58593cf4cbf8e3168bc208bb7
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0024-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_IN_PROGRESS
IMPLEMENTATION_STATUS: SOURCE_ACCEPTED_READY_FOR_WORK_INSTALL_AND_SERIALIZED_INTEGRATION
WORK_EXECUTION_CLASS: MAINTENANCE_AND_SERIALIZED_INTEGRATION
CODEX_MODEL_PREFLIGHT_FOR_WORK: NOT_APPLICABLE
SAME_THREAD_CONTINUE_FOR_WORK: NOT_REQUIRED_AND_MUST_NOT_BE_REQUESTED
INSTALLED_PLUGIN_PARITY: UNVERIFIED_NOT_ACCESSIBLE
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_PLUGIN_PARITY_AND_MAIN_INTEGRATION_PASS
CYCLE_COMPLETE: false
NEXT_ACTION: Start a fresh ChatGPT Work session with working GitHub access and execute installation plus serialized integration as Work, not Codex. Do not invoke model-selector or request CONTINUE. Fresh-fetch current main and the three recorded task branches, verify remote heads, install Asynchronia plugin 1.0.8, prove installed selector parity, safely integrate onto current main, push and refetch, then synchronize task STATE and Google Drive memory.

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
- Model-selector source version 1.0.8 is accepted on `infra/model-selector-live-catalog-20260712` at `0024f9315ba83583b6e89e1b007c97645af30da2`.
- Current `main` is `9f58b473160e45c645d0baf23dc44240941db17a`; integration must account for that newer main commit.
- The last Work run incorrectly applied the Codex same-thread `CONTINUE` gate and relied on a stale local remote-tracking ref.
- Work maintenance and serialized integration do not use Codex model preflight or `CONTINUE`.
- Every status report must end with an exact actionable `NEXT_ACTION`.
