# Current Memory

MEMORY_REV: 2026-07-12-0022-JST
EXPECTED_REV: 2026-07-12-0022-JST
FAIL_CLOSED_STATUS: REVISION_MISMATCH_BLOCKS_PROMOTION
CURRENT_MAIN_BASELINE: 50d77eb5b5273fffc491a9f111ecdc5d526c7cea
ACTIVE_TASK: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
WORK_BRANCH: work/model-selector-live-catalog-20260712
WORK_HEAD: cc0a6a2edbd63d0d873e25ecf0b0843b94d222e9
IMPLEMENTATION_BRANCH: infra/model-selector-live-catalog-20260712
IMPLEMENTATION_BASE: be3330b1a90527f4ab1a98275949ec3cbaeeb3f6
IMPLEMENTATION_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0022-JST
DRIVE_SYNC_STATUS: SYNCHRONIZED
IMPLEMENTATION_STATUS: READY_FOR_REVIEW
INSTALLED_PLUGIN_PARITY: UNVERIFIED_NOT_ACCESSIBLE
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_IMPLEMENTATION_ACCEPTED_AND_INSTALLED_PARITY_VERIFIED
CYCLE_COMPLETE: false
NEXT_ACTION: Review the implementation range be3330b1a90527f4ab1a98275949ec3cbaeeb3f6..0024f9315ba83583b6e89e1b007c97645af30da2. If accepted, refresh or install Asynchronia plugin 1.0.8, verify the installed model-selector hash, integrate the accepted implementation and memory-sync branch, and then rerun the bridge-reset model preflight in a fresh Codex thread.

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

- Model-selector source version 1.0.8 is remotely published and ready for ChatGPT review.
- Preflight inventory comes from local `codex app-server` `model/list` with hidden models excluded and complete cursor pagination.
- Candidate construction uses every picker-visible model with only its own returned `supportedReasoningEfforts`.
- Selection compares every pair, adjacent efforts for each model, retry risk, escalation risk, and the nearest cheaper and more expensive plausible options.
- Task STATE and Google Drive are synchronized at revision 2026-07-12-0022-JST.
- Repository memory is prepared on a dedicated branch because direct writes to `main` are forbidden.

Current constraints:

- Do not begin bridge reset before source acceptance and installed plugin parity verification.
- Do not continue Stage 6.
- Do not claim installed plugin parity until the installed source is located and hashed.
- Do not mark the cycle complete until implementation and memory changes are integrated into current main.
