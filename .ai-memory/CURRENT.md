# Current Memory

MEMORY_REV: 2026-07-12-0024-JST
EXPECTED_REV: 2026-07-12-0024-JST
FAIL_CLOSED_STATUS: REVISION_MISMATCH_BLOCKS_PROMOTION
CURRENT_MAIN_BASELINE: 9f58b473160e45c645d0baf23dc44240941db17a
ACTIVE_TASK: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
WORK_BRANCH: work/model-selector-live-catalog-20260712
WORK_HEAD: 72d77ba1feb8e2a58593cf4cbf8e3168bc208bb7
IMPLEMENTATION_BRANCH: infra/model-selector-live-catalog-20260712
IMPLEMENTATION_BASE: be3330b1a90527f4ab1a98275949ec3cbaeeb3f6
IMPLEMENTATION_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0024-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_IN_PROGRESS
IMPLEMENTATION_STATUS: SOURCE_ACCEPTED_READY_FOR_WORK_INSTALL_AND_SERIALIZED_INTEGRATION
WORK_EXECUTION_CLASS: MAINTENANCE_AND_SERIALIZED_INTEGRATION
CODEX_MODEL_PREFLIGHT_FOR_WORK: NOT_APPLICABLE
SAME_THREAD_CONTINUE_FOR_WORK: NOT_REQUIRED_AND_MUST_NOT_BE_REQUESTED
INSTALLED_PLUGIN_PARITY: UNVERIFIED_NOT_ACCESSIBLE
LAST_WORK_BLOCKER: WORK_MISROUTED_AS_CODEX_PREFLIGHT_AND_USED_STALE_LOCAL_REMOTE_TRACKING_REF
REMOTE_MEMORY_BRANCH_STATUS: VERIFIED_PRESENT
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_PLUGIN_PARITY_AND_MAIN_INTEGRATION_PASS
CYCLE_COMPLETE: false
NEXT_ACTION: In a fresh ChatGPT Work session with working GitHub remote access, execute plugin installation and serialized integration as Work, not Codex. Do not invoke model-selector and do not request or accept CONTINUE. Fresh-fetch origin/main, origin/infra/model-selector-live-catalog-20260712, origin/work/project-memory-sync-20260712-0022, and origin/work/model-selector-live-catalog-20260712; verify remote heads; refresh or install Asynchronia plugin 1.0.8; prove installed model-selector SHA-256 parity; safely integrate onto current main; push and refetch main; then update task STATE and Google Drive memory.

Repo identity:

- Repository: `samuray-games/AsyncScene`
- Source of truth for implementation state: current git-tracked repository and remote branch evidence
- Cross-chat context source: live Google Drive document `ASYNCHRONIA - PROJECT MEMORY`

Current memory contract:

- Keep live state here, not in the historical archive.
- Keep this file compact and factual with exact dates, branches, SHAs, blockers, and next action.
- After every accepted remote state change, synchronize task STATE, Google Drive project memory, and the authorized repository memory snapshot in the same execution.
- When frozen scope or direct-main protection prevents a memory write, record the deferred sync explicitly and assign it to the integration owner.
- Every status report must end with an exact actionable `NEXT_ACTION`; an actionless report is incomplete.

Authoritative order for memory and process facts:

1. Explicit user instruction
2. Current repository primary evidence
3. Active task or bridge STATE
4. `PROJECT_MEMORY.md`
5. `.ai-memory/CURRENT.md`
6. `.ai-memory/DECISIONS.md`
7. `.ai-memory/CANON.md`
8. `.ai-memory/WORKFLOWS.md`
9. `TASKS.md`
10. Live Google Drive project memory
11. `.ai-memory/archive/`

Active state:

- Model-selector source version 1.0.8 is accepted after source validation and direct remote review.
- The remote implementation branch equals `0024f9315ba83583b6e89e1b007c97645af30da2`.
- Current `main` is `9f58b473160e45c645d0baf23dc44240941db17a`, so integration must use fresh remote evidence and account for main movement.
- The last Work run incorrectly applied the Codex same-thread `CONTINUE` gate and reported an obsolete local branch pointer as if it were the remote head.
- Work maintenance and serialized integration do not use Codex model preflight or `CONTINUE`.
- Preflight inventory for later Codex execution comes from local `codex app-server` `model/list`, but that contract is irrelevant to this Work integration phase.

Current constraints:

- Do not begin bridge reset before installed plugin parity and main integration pass.
- Do not continue Stage 6.
- Do not claim installed plugin parity until the installed source is located and hashed.
- Do not mark the cycle complete until implementation and memory changes are integrated into current main.
