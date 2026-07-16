# Current Memory Index

REPO_MEMORY_REV: 2026-07-17-0123-JST
ROOT_CHILD_REV: 2026-07-17-0123-JST
ARCHIVE_CHILD_REV: 2026-07-10-2315-JST
CURRENT_CHILD_EXPECTED_REV: 2026-07-17-0123-JST
DECISIONS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
CANON_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
WORKFLOWS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
ROOT_STATUS: SELECTOR_1_0_14_MUTATION_E2E_REPAIR_INTEGRATED_INSTALLATION_AND_LIVE_CANARY_PENDING
ACTIVE_CYCLE: MODEL-PREFLIGHT-E2E-REPAIR-20260717
ACTIVE_THREAD: TASK-INFRA-MODEL-PREFLIGHT-E2E-REPAIR-20260717
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_RULE: resolve dynamically at read time
ACCEPTED_IMPLEMENTATION_HEAD: 47ed2df0908d82da91b14b9cb85ff01f0bf1f12c
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260717-0123
ACCEPTED_MAIN_PENDING: false
DRIVE_MEMORY_REV: 2026-07-17-0123-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_COMPLETE
CURRENT_STATUS: REPAIR_INTEGRATED_INSTALLATION_PENDING
MAIN_INTEGRATION_STATUS: COMPLETE
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

Authority order:
1. Explicit user instruction
2. Current repository primary evidence
3. Active task or bridge state
4. Repository memory index and children
5. Live Google Drive project memory
6. Immutable archive

Status:
- Root-cause repair PR #228 was squash-merged into `main` at `47ed2df0908d82da91b14b9cb85ff01f0bf1f12c`.
- Repository manifests identify Asynchronia `1.0.14`; the last independently verified local installation remains `1.0.13` and is stale.
- The plugin now derives numbered bridge tasks from current slot-local STATE, inbox, claim, mailbox head, task branch, baseline and a versioned code-owned profile.
- Generic task-file commands reject reserved bridge task types; unknown claim profiles fail closed.
- Durable selector state uses Git-private storage resolved by `git rev-parse --git-path asynchronia/model-selector-state`, not the user-home directory.
- Mutation flow is `WAITING_FOR_INVENTORY_CONFIRMATION` -> exact `INVENTORY_OK` -> `WAITING_FOR_MODEL_SELECTION` -> user model selection -> exact same-thread `CONTINUE` -> `IMPLEMENTATION_ALLOWED`.
- The canonical 586-line selector test remains byte-identical. Its full 27-test battery passes against 1.0.14, alongside the new runtime and synthetic Git bridge E2E suite.
- Final repair-head GitHub workflows passed: automatic model preflight run 32, orchestration-policy run 117 and ai-forensics-evidence run 136.
- Live numbered bridge mutation acceptance remains pending until 1.0.14 is installed and Slot 1 is run from a fresh thread.
- No runtime, gameplay, UI, economy, persistence, Stage 6, deployment mirror or numbered mailbox files changed.
