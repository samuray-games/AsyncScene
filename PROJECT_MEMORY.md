# Current Memory Index

REPO_MEMORY_REV: 2026-07-16-2202-JST
ROOT_CHILD_REV: 2026-07-16-2202-JST
ARCHIVE_CHILD_REV: 2026-07-10-2315-JST
CURRENT_CHILD_EXPECTED_REV: 2026-07-16-2202-JST
DECISIONS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
CANON_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
WORKFLOWS_CHILD_EXPECTED_REV: 2026-07-12-0026-JST
ROOT_STATUS: SELECTOR_1_0_13_READ_ONLY_CANARY_ACCEPTED_MEMORY_SYNC_COMPLETE
ACTIVE_CYCLE: MODEL-SELECTOR-READONLY-CANARY-20260716
ACTIVE_THREAD: CANARY-READONLY-001
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_RULE: resolve dynamically at read time
ACCEPTED_IMPLEMENTATION_HEAD: 4580c02f7591047089f4ab25862c14cccab998e4
MEMORY_SYNC_BRANCH: work/project-memory-sync-20260716-2202
ACCEPTED_MAIN_PENDING: false
DRIVE_MEMORY_REV: 2026-07-16-2202-JST
DRIVE_SYNC_STATUS: SYNCHRONIZATION_COMPLETE
CURRENT_STATUS: MEMORY_SYNC_COMPLETE
MAIN_INTEGRATION_STATUS: COMPLETE
INSTALLED_PLUGIN_VERSION: 1.0.13
INSTALLED_PLUGIN_MANIFEST_PARITY: PASS
READ_ONLY_CANARY_STATUS: PASS
READ_ONLY_CANARY_EXIT_STATUS: 0
READ_ONLY_CANARY_STDERR: EMPTY
READ_ONLY_CANARY_BASELINE: 4580c02f7591047089f4ab25862c14cccab998e4
READ_ONLY_CANARY_BRANCH: main
READ_ONLY_CANARY_SCOPE: plugins/asynchronia
SAFARI_SMOKE_STATUS: N/A_READ_ONLY_TOOLING_CANARY_NO_RUNTIME_SURFACE
PROJECT_ACTIVITY_STATUS: PAUSED_BY_USER_FOR_CANON_REPAIR
STAGE_6_STATUS: PAUSED_BY_USER
NEXT_ACTION: Wait for the user's next explicit Asynchronia instruction.

Authority order:
1. Explicit user instruction
2. Current repository primary evidence
3. Active task or bridge state
4. Repository memory index and children
5. Live Google Drive project memory
6. Immutable archive

Status:
- Current accepted implementation baseline is `4580c02f7591047089f4ab25862c14cccab998e4` on `main`.
- Repository and installed plugin manifests both identify Asynchronia `1.0.13`.
- Exact manifest parity passed. The private installation path and full digest remain in live Google Drive memory rather than this public repository index.
- Read-only canary `CANARY-READONLY-001` returned `READ_ONLY_ALLOWED`, exit status `0`, empty stderr, branch `main`, and scope `plugins/asynchronia`.
- No mutation authorization, model recommendation, inventory confirmation, continuation token, or Safari runtime acceptance is required for this read-only canary.
- Accepted selector inventory remains 6 models and 29 model-effort pairs.
- This synchronization changes memory documentation only.
