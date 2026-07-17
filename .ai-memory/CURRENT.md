# Current Memory

MEMORY_REV: 2026-07-17-0123-JST
EXPECTED_REV: 2026-07-17-0123-JST
FAIL_CLOSED_STATUS: REPAIR_INTEGRATED_INSTALLATION_PENDING
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_RULE: resolve dynamically at read time
ACTIVE_TASK: TASK-INFRA-MODEL-PREFLIGHT-E2E-REPAIR-20260717
WORK_BRANCH: work/project-memory-sync-20260717-0123
IMPLEMENTATION_BRANCH: main
ACCEPTED_IMPLEMENTATION_HEAD: 47ed2df0908d82da91b14b9cb85ff01f0bf1f12c
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260717-0123
ACCEPTED_MAIN_PENDING: false
DRIVE_MEMORY_REV: 2026-07-17-0123-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_COMPLETE
CURRENT_STATUS: REPAIR_INTEGRATED_INSTALLATION_PENDING
MAIN_INTEGRATION_STATUS: COMPLETE
CYCLE_COMPLETE: false
CODEX_MODEL_PREFLIGHT: REQUIRED_FOR_LOCAL_INSTALLATION_AND_LIVE_CANARY
SAME_THREAD_CONTINUE: REQUIRED_ON_MUTATION_PATH
REPOSITORY_PLUGIN_VERSION: 1.0.14
INSTALLED_PLUGIN_VERSION: 1.0.13
INSTALLED_PLUGIN_STATUS: UPDATE_REQUIRED
INSTALLED_PLUGIN_MANIFEST_PARITY: PENDING_1_0_14_INSTALLATION
MUTATION_E2E_REPAIR_PR: 228
MUTATION_E2E_REPAIR_STATUS: INTEGRATED
MUTATION_E2E_LIVE_CANARY_STATUS: PENDING_INSTALLATION_AND_USER_MODEL_SELECTION
AUTOMATIC_MODEL_PREFLIGHT_CI: PASS_RUN_32
ORCHESTRATION_POLICY_CI: PASS_RUN_117
AI_FORENSICS_EVIDENCE_CI: PASS_RUN_136
SAFARI_SMOKE_STATUS: N/A_INFRASTRUCTURE_ONLY_NO_RUNTIME_OR_GAME_FILE_CHANGE
PROJECT_ACTIVITY_STATUS: PAUSED_BY_USER_FOR_CANON_REPAIR
STAGE_6_STATUS: PAUSED_BY_USER
NEXT_ACTION: Install Asynchronia 1.0.14 locally, verify filesystem manifest parity, then run a fresh Slot 1 mutation E2E from exact command мост 1.

Repo identity:
- Repository: `samuray-games/AsyncScene`
- Source of truth for implementation state: current repository and remote branch evidence
- Cross-chat context source: live Google Drive document `ASYNCHRONIA - PROJECT MEMORY`
- Private local paths and installed-manifest digests remain in live Google Drive memory.

Active state:
- Root-cause repair PR #228 was squash-merged into `main` at `47ed2df0908d82da91b14b9cb85ff01f0bf1f12c`.
- Repository plugin version is `1.0.14`; local installed version is still `1.0.13` until independently replaced and read back.
- Exact bridge commands use the bridge authority adapter and cannot supply hand-authored risk classifications.
- Durable state is Git-private and sandbox-writable.
- Exact mutation flow requires executable `bridge-start`, exact `INVENTORY_OK`, user model selection, exact same-thread `CONTINUE` and identity revalidation.
- Canonical selector regression remains intact and passes against 1.0.14 with the new bridge E2E suite.
- No live mutation canary has yet been accepted on the locally installed 1.0.14 package.

Current constraints:
- Do not claim installation, manifest parity or live bridge acceptance before filesystem and remote readback evidence.
- Do not reuse any 1.0.13 selector state or Codex thread.
- Do not continue Stage 6.
- Do not resume general development while the user pause remains active.
- Run Slots 2 and 3 only after sequential independent acceptance of the preceding slot.
- Asynchronia12 remains a separate future task.
