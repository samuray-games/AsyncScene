# Current Memory Index

REPO_MEMORY_REV: 2026-07-12-0027-JST
ROOT_CHILD_REV: 2026-07-12-0027-JST
ARCHIVE_CHILD_REV: 2026-07-10-2315-JST
CURRENT_CHILD_EXPECTED_REV: 2026-07-12-0027-JST
DECISIONS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
CANON_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
WORKFLOWS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
ROOT_STATUS: FAIL_CLOSED_ON_REVISION_MISMATCH
ACTIVE_CYCLE: MODEL-SELECTOR-LIVE-INVENTORY-20260712
ACTIVE_THREAD: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
CURRENT_MAIN_BASELINE: 9f58b473160e45c645d0baf23dc44240941db17a
SOURCE_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
WORK_STATE_BRANCH: work/model-selector-live-catalog-20260712
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0027-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_IN_PROGRESS
IMPLEMENTATION_STATUS: SOURCE_ACCEPTED_LOCAL_PLUGIN_PARITY_PASS_READY_FOR_FINAL_MAIN_INTEGRATION
NEXT_ROLE: CHATGPT_WORK
WORK_EXECUTION_CLASS: FINAL_SERIALIZED_INTEGRATION_ONLY
CODEX_MODEL_PREFLIGHT: NOT_APPLICABLE
SAME_THREAD_CONTINUE: NOT_REQUIRED_AND_MUST_NOT_BE_REQUESTED
SOURCE_MODEL_SELECTOR_SHA256: 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722
INSTALLED_PLUGIN_PATH: /Users/User/.codex/plugins/cache/asynchronia-local/asynchronia/1.0.8
INSTALLED_PLUGIN_VERSION: 1.0.8
INSTALLED_MODEL_SELECTOR_SHA256: 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722
INSTALLED_PLUGIN_PARITY: PASS_EXACT_VERSION_AND_SHA256_MATCH
MAIN_INTEGRATION_OWNER: CHATGPT_WORK
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_MAIN_INTEGRATION_AND_REMOTE_READBACK_PASS
CYCLE_COMPLETE: false
NEXT_ACTION: Start a fresh ChatGPT Work session with GitHub remote access. Accept the recorded Codex desktop local plugin parity PASS without attempting local installation. Fresh-fetch current main and the implementation, memory-sync, and task-state branches; safely integrate infra/model-selector-live-catalog-20260712 and work/project-memory-sync-20260712-0022 onto current main; run validators; push and refetch main; prove all implementation and repository-memory files are present; then update task STATE and Google Drive memory to final integrated status. Do not begin bridge reset or continue Stage 6 in this task.

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
- Codex desktop installed the local package at `/Users/User/.codex/plugins/cache/asynchronia-local/asynchronia/1.0.8`.
- Installed plugin version is 1.0.8 and installed `model-selector/SKILL.md` SHA-256 exactly matches the accepted source hash.
- Local plugin parity is complete. Work must not repeat installation or require access to the user's Mac.
- ChatGPT Work is now the sole owner of final serialized integration into current `main` and final memory synchronization.
- Every status report must end with an exact actionable `NEXT_ACTION`.