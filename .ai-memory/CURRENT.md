# Current Memory

MEMORY_REV: 2026-07-12-0026-JST
EXPECTED_REV: 2026-07-12-0026-JST
FAIL_CLOSED_STATUS: REVISION_MISMATCH_BLOCKS_PROMOTION
CURRENT_MAIN_BASELINE: 9f58b473160e45c645d0baf23dc44240941db17a
ACTIVE_TASK: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
WORK_BRANCH: work/model-selector-live-catalog-20260712
WORK_HEAD: 8d9ea63c64887bd3c38089dd5d5847f10b60b1f6
IMPLEMENTATION_BRANCH: infra/model-selector-live-catalog-20260712
IMPLEMENTATION_BASE: be3330b1a90527f4ab1a98275949ec3cbaeeb3f6
IMPLEMENTATION_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0025-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_IN_PROGRESS
IMPLEMENTATION_STATUS: SOURCE_ACCEPTED_LOCAL_PLUGIN_PARITY_PENDING
NEXT_ROLE: CODEX_DESKTOP
CODEX_EXECUTION_CLASS: LOCAL_PLUGIN_INSTALL_AND_PARITY_ONLY
CODEX_MODEL_PREFLIGHT: NOT_APPLICABLE
SAME_THREAD_CONTINUE: NOT_REQUIRED_AND_MUST_NOT_BE_REQUESTED
SOURCE_MODEL_SELECTOR_SHA256: 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722
INSTALLED_PLUGIN_PARITY: PENDING_CODEX_DESKTOP_LOCAL_INSTALL
LAST_WORK_BLOCKER: WORK_ENVIRONMENT_PLUGIN_INSTALL_TARGET_READ_ONLY
BLOCKER_CLASSIFICATION: WORK_CANNOT_WRITE_USER_LOCAL_CODEX_PLUGIN_HOME
MAIN_INTEGRATION_OWNER_AFTER_PARITY: CHATGPT_WORK
REMOTE_MEMORY_BRANCH_STATUS: VERIFIED_PRESENT
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_PLUGIN_PARITY_AND_MAIN_INTEGRATION_PASS
CYCLE_COMPLETE: false
NEXT_ACTION: In Codex desktop on the user's Mac, execute the exact local plugin installation and parity prompt. Install or refresh Asynchronia 1.0.8 from `infra/model-selector-live-catalog-20260712@0024f9315ba83583b6e89e1b007c97645af30da2` without repository writes, prove the installed `skills/model-selector/SKILL.md` SHA-256 equals `696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722`, and return evidence. After PASS, hand back to ChatGPT Work for serialized integration and memory synchronization.

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
- Current `main` is `9f58b473160e45c645d0baf23dc44240941db17a`, so later integration must use fresh remote evidence and account for main movement.
- ChatGPT Work proved it cannot access the user's writable local Codex plugin target from its read-only `/root/.codex` environment.
- Codex desktop is now the correct executor for local plugin installation and hash parity.
- This Codex phase is local maintenance only. It does not use model-selector, model switching, preflight, or `CONTINUE`, and it must not write repository files.
- After parity PASS, ChatGPT Work performs serialized integration into `main`.

Current constraints:

- Do not begin bridge reset before installed plugin parity and main integration pass.
- Do not continue Stage 6.
- Do not claim installed plugin parity until the installed source is located and hashed.
- Do not let Codex perform repository integration during the local parity phase.
- Do not mark the cycle complete until implementation and memory changes are integrated into current main.
