TASK_ID: TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712
PIPELINE_VERSION: 1.0.0
SOURCE_MEMORY_REV: 2026-07-12-0026-JST
CURRENT_STATUS: READY_FOR_CODEX_LOCAL_PLUGIN_INSTALL_AND_PARITY
CURRENT_PHASE: LOCAL_PLUGIN_INSTALL_AND_PARITY
CURRENT_ARTIFACT: infra/model-selector-live-catalog-20260712@0024f9315ba83583b6e89e1b007c97645af30da2
NEXT_ROLE: CODEX_DESKTOP
CODEX_EXECUTION_CLASS: LOCAL_PLUGIN_INSTALL_AND_PARITY_ONLY
CODEX_MODEL_PREFLIGHT: NOT_APPLICABLE
SAME_THREAD_CONTINUE: NOT_REQUIRED_AND_MUST_NOT_BE_REQUESTED
CODEX_RULE: This is local maintenance, not an implementation lane. Do not invoke model-selector, recommend or switch models, request CONTINUE, edit repository files, publish commits, integrate branches, begin bridge reset, or continue Stage 6.
REPOSITORY_WRITES: FORBIDDEN_DURING_LOCAL_PARITY_PHASE
MAIN_INTEGRATION_OWNER_AFTER_PARITY: CHATGPT_WORK
IMPLEMENTATION_BASE: be3330b1a90527f4ab1a98275949ec3cbaeeb3f6
IMPLEMENTATION_HEAD: 0024f9315ba83583b6e89e1b007c97645af30da2
REMOTE_IMPLEMENTATION_STATUS: VERIFIED_AT_0024f9315ba83583b6e89e1b007c97645af30da2
CURRENT_MAIN_HEAD: 9f58b473160e45c645d0baf23dc44240941db17a
MAIN_MOVEMENT_STATUS: MAIN_ADVANCED_AFTER_IMPLEMENTATION_BASE; INTEGRATION_DEFERRED_UNTIL_LOCAL_PLUGIN_PARITY_PASS
PLUGIN_SOURCE_PATH: plugins/asynchronia/
PLUGIN_SOURCE_VERSION: 1.0.8
SOURCE_MODEL_SELECTOR_PATH: plugins/asynchronia/skills/model-selector/SKILL.md
SOURCE_MODEL_SELECTOR_SHA256: 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722
LOCAL_INSTALL_TARGET_RULE: Codex desktop must inspect the authenticated user's active local Codex plugin installation and existing Asynchronia layout under the user's writable home directory. It must not use /root paths from ChatGPT Work and must not guess an installation path without evidence.
INSTALLED_PLUGIN_PARITY: PENDING_CODEX_DESKTOP_LOCAL_INSTALL
REQUIRED_PARITY_EVIDENCE: exact installed package path; installed plugin version 1.0.8; source and installed model-selector SHA-256 values; equality result; commands and exit codes; any installer or registry evidence used to determine the active installed package.
LAST_WORK_BLOCKER: WORK_ENVIRONMENT_PLUGIN_INSTALL_TARGET_READ_ONLY
BLOCKER_CLASSIFICATION: WORK_ENVIRONMENT_CANNOT_WRITE_USER_LOCAL_CODEX_PLUGIN_PATH
REMOTE_MEMORY_BRANCH: work/project-memory-sync-20260712-0022
REMOTE_MEMORY_BRANCH_STATUS: VERIFIED_PRESENT
GOOGLE_DRIVE_MEMORY_REV: 2026-07-12-0025-JST
MEMORY_SYNC_STATUS: ROLE_CORRECTION_TO_CODEX_LOCAL_INSTALL_IN_PROGRESS
STAGE_6_STATUS: PAUSED_BY_USER
BRIDGE_RESET_STATUS: BLOCKED_UNTIL_PLUGIN_PARITY_AND_MAIN_INTEGRATION_PASS
REPORTING_RULE: Every status report must end with an exact NEXT_ACTION. A report without an actionable next step is incomplete.
NEXT_ACTION: In Codex desktop on the user's Mac, fresh-fetch infra/model-selector-live-catalog-20260712 at 0024f9315ba83583b6e89e1b007c97645af30da2, inspect the actual active local Asynchronia installation mechanism and path, install or refresh the exact repository package as version 1.0.8 without modifying repository files, compute the installed skills/model-selector/SKILL.md SHA-256, and prove it equals 696b4af88e7cc98d98339d7efed37361e1a8c04c33215fe77cd88f1eaac62722. Then return the evidence to ChatGPT. After PASS, ChatGPT Work performs serialized main integration and memory synchronization.
UPDATED_AT: 2026-07-12T19:20:00+09:00
