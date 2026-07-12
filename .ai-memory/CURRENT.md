# Current Memory

MEMORY_REV: 2026-07-12-0027-JST
EXPECTED_REV: 2026-07-12-0027-JST
FAIL_CLOSED_STATUS: INTEGRATION_COMPLETE
CURRENT_MAIN_BASELINE: 51f056650005e6bcc98e469b4d85f325af2b6512
ACTIVE_TASK: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
WORK_BRANCH: work/model-selector-live-catalog-20260712
IMPLEMENTATION_BRANCH: infra/model-selector-live-catalog-20260712
IMPLEMENTATION_BASE: be3330b1a90527f4ab1a98275949ec3cbaeeb3f6
IMPLEMENTATION_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: false
DRIVE_MEMORY_REV: 2026-07-12-0027-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_COMPLETE
IMPLEMENTATION_STATUS: SOURCE_ACCEPTED_LOCAL_PLUGIN_PARITY_PASS_MAIN_INTEGRATION_AND_MEMORY_SYNC_COMPLETE
NEXT_ROLE: CHATGPT_WORK
WORK_EXECUTION_CLASS: FINAL_SERIALIZED_INTEGRATION_ONLY
CODEX_MODEL_PREFLIGHT: NOT_APPLICABLE
SAME_THREAD_CONTINUE: NOT_REQUIRED_AND_MUST_NOT_BE_REQUESTED
SOURCE_MODEL_SELECTOR_SHA256: 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722
INSTALLED_PLUGIN_PATH: /Users/User/.codex/plugins/cache/asynchronia-local/asynchronia/1.0.8
INSTALLED_PLUGIN_VERSION: 1.0.8
INSTALLED_MODEL_SELECTOR_SHA256: 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722
INSTALLED_PLUGIN_PARITY: PASS_EXACT_VERSION_AND_SHA256_MATCH
PARITY_EVIDENCE_SOURCE: CODEX_DESKTOP_LOCAL_REPORT_ACCEPTED_BY_CHATGPT
MAIN_INTEGRATION_OWNER: CHATGPT_WORK
REMOTE_MEMORY_BRANCH_STATUS: VERIFIED_PRESENT
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_MAIN_INTEGRATION_AND_REMOTE_READBACK_PASS
CYCLE_COMPLETE: true
NEXT_ACTION: No further action required for this task. Final integration, validator runs, remote main readback, task STATE update, and live Google Drive memory sync are complete. Do not begin bridge reset or continue Stage 6 in this task.

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
10. Live Google Drive document `ASYNCHRONIA - PROJECT MEMORY`
11. `.ai-memory/archive/`

Active state:

- Model-selector source version 1.0.8 is accepted after source validation and direct remote review.
- The remote implementation branch equals `0024f9315ba83583b6e89e1b007c97645af30da2`.
- Current `main` was verified at `9f58b473160e45c645d0baf23dc44240941db17a`; final Work integration must fresh-fetch because main may move again.
- Codex desktop installed Asynchronia 1.0.8 at the recorded local cache path and proved exact SHA-256 parity for `skills/model-selector/SKILL.md`.
- The local parity gate is complete. Work must not retry local installation or require access to the user's Mac.
- ChatGPT Work completed final serialized integration into `main` and final memory synchronization.

Current constraints:

- Do not begin bridge reset before main integration and remote readback pass.
- Do not continue Stage 6.
- Do not let Work invoke model-selector or request `CONTINUE` during final integration.
- Do not let Work re-open the already completed local plugin parity gate.
- Do not mark the cycle complete until implementation and memory changes are integrated into current main and re-read from remote.
