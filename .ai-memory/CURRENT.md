# Current Memory

MEMORY_REV: 2026-07-12-0023-JST
EXPECTED_REV: 2026-07-12-0023-JST
FAIL_CLOSED_STATUS: REVISION_MISMATCH_BLOCKS_PROMOTION
CURRENT_MAIN_BASELINE: 50d77eb5b5273fffc491a9f111ecdc5d526c7cea
ACTIVE_TASK: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
WORK_BRANCH: work/model-selector-live-catalog-20260712
WORK_HEAD: 01827ce8cf2ff2793d79472e935164ec43cad7a4
IMPLEMENTATION_BRANCH: infra/model-selector-live-catalog-20260712
IMPLEMENTATION_BASE: be3330b1a90527f4ab1a98275949ec3cbaeeb3f6
IMPLEMENTATION_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0023-JST
DRIVE_SYNC_STATUS: SYNCHRONIZED
IMPLEMENTATION_STATUS: SOURCE_ACCEPTED_READY_FOR_INSTALL_AND_INTEGRATION
INSTALLED_PLUGIN_PARITY: UNVERIFIED_NOT_ACCESSIBLE
LAST_WORK_BLOCKER: WORK_SESSION_REMOTE_ACCESS_UNAVAILABLE
REMOTE_MEMORY_BRANCH_STATUS: VERIFIED_PRESENT
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_PLUGIN_PARITY_AND_MAIN_INTEGRATION_PASS
CYCLE_COMPLETE: false
NEXT_ACTION: In a fresh ChatGPT Work session with working remote access, fetch the accepted implementation branch, the memory-sync branch, and the work-state branch; verify their recorded heads; refresh or install Asynchronia plugin 1.0.8; prove installed model-selector SHA-256 parity; integrate the implementation and memory-sync branches into main; push and refetch main; then update task STATE and Google Drive memory. Do not repeat source review.

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
- Preflight inventory comes from local `codex app-server` `model/list` with hidden models excluded and complete cursor pagination.
- Candidate construction uses every picker-visible model with only its own returned `supportedReasoningEfforts`.
- Selection compares every pair, adjacent efforts for each model, retry risk, escalation risk, and the nearest cheaper and more expensive plausible options.
- The remote memory-sync branch exists; the previous Work blocker was only unavailable remote access in that session.
- Task STATE, Google Drive, and this repository-memory branch are synchronized at revision 2026-07-12-0023-JST.

Current constraints:

- Do not begin bridge reset before installed plugin parity and main integration pass.
- Do not continue Stage 6.
- Do not claim installed plugin parity until the installed source is located and hashed.
- Do not mark the cycle complete until implementation and memory changes are integrated into current main.