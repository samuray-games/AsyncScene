# Current Memory Index

REPO_MEMORY_REV: 2026-07-12-0026-JST
ROOT_CHILD_REV: 2026-07-12-0026-JST
ARCHIVE_CHILD_REV: 2026-07-10-2315-JST
CURRENT_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
DECISIONS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
CANON_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
WORKFLOWS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
ROOT_STATUS: FAIL_CLOSED_ON_REVISION_MISMATCH
ACTIVE_CYCLE: MODEL-SELECTOR-LIVE-INVENTORY-20260712
ACTIVE_THREAD: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
CURRENT_MAIN_BASELINE: 9f58b473160e45c645d0baf23dc44240941db17a
SOURCE_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
WORK_STATE_HEAD: 570978a1acd247b4e96e2deae7ab480e159bb4a8
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260712-0022
ACCEPTED_MAIN_PENDING: true
DRIVE_MEMORY_REV: 2026-07-12-0026-JST
DRIVE_SYNC_STATUS: SYNCHRONIZED
IMPLEMENTATION_STATUS: SOURCE_ACCEPTED_LOCAL_PLUGIN_PARITY_PENDING
NEXT_ROLE: CODEX_DESKTOP
CODEX_EXECUTION_CLASS: LOCAL_PLUGIN_INSTALL_AND_PARITY_ONLY
CODEX_MODEL_PREFLIGHT: NOT_APPLICABLE
SAME_THREAD_CONTINUE: NOT_REQUIRED_AND_MUST_NOT_BE_REQUESTED
SOURCE_MODEL_SELECTOR_SHA256: 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722
INSTALLED_PLUGIN_PARITY: PENDING_CODEX_DESKTOP_LOCAL_INSTALL
MAIN_INTEGRATION_OWNER_AFTER_PARITY: CHATGPT_WORK
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_PLUGIN_PARITY_AND_MAIN_INTEGRATION_PASS
CYCLE_COMPLETE: false
NEXT_ACTION: Open Codex desktop on the user's Mac and run the exact ChatGPT-authored local plugin installation and parity task. Codex must install or refresh Asynchronia 1.0.8 from the accepted repository package without repository writes, prove the installed model-selector SHA-256 equals the source hash, and return evidence. After PASS, ChatGPT Work performs serialized integration into current main and synchronizes task STATE, repository memory, and Google Drive.

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
- ChatGPT Work cannot install the user's local plugin because its `/root/.codex` targets are read-only and unrelated to the user's Mac installation.
- Codex desktop is the correct executor for local plugin installation and parity because it can access the authenticated user's writable local Codex home.
- Codex local parity is maintenance, not an implementation lane. It uses no model preflight, no model switching, and no `CONTINUE`.
- After local parity PASS, ChatGPT Work remains the serialized integration owner for `main`.
- Every status report must end with an exact actionable `NEXT_ACTION`.
