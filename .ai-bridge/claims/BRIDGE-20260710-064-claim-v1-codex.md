# Codex claim - BRIDGE-20260710-064

BRIDGE_PROTOCOL: 3.3
CLOSED_LOOP_PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL_V1_3.md
CYCLE_ID: CYCLE-20260710-002
CYCLE_GENERATION: 19
THREAD_ID: BRIDGE-20260710-064
LANE_ID: PROCESS-REPO-MEMORY-MIGRATION-PR
TASK_ID: TASK-REPO-FIRST-MEMORY-MIGRATION
EXECUTION_EPOCH: REPO-MEMORY-MIGRATION-R1-20260710-2055JST
TASK_NONCE: MEM-064-PR-D8B4-2055
BRIDGE_SLOT: 3
BASELINE: d8b4508b97374fcdfe62fad9137b64b7295a792f
COORDINATOR_MEMORY_REV: 2026-07-10-2055-JST
GITHUB_ISSUE: 198
GITHUB_ISSUE_URL: https://github.com/samuray-games/AsyncScene/issues/198
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
SOURCE_BRANCH_HINT: bridge/repo-memory-064
TARGET_BRANCH: main
PUBLICATION_MODE: CODEX_PULL_REQUEST_THEN_CHATGPT_VERIFIED_MERGE
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260710-064-02-chatgpt.md
EXPECTED_RECEIPT: .ai-bridge/receipts/BRIDGE-20260710-064-03-chatgpt.md
PLUGIN_INVOCATION_REQUIRED: false
SAFARI_STATUS: N/A_DOCUMENTATION_ONLY
CLAIM_STATUS: READY_FOR_FRESH_CODEX_PR_EXECUTION
TRIGGER_COMMAND: мост 3

Codex owns only the implementation, validation, task-branch publication and pull-request creation described by issue 198. The exact primary write scope is frozen in issue 198. Codex must use a clean worktree from the exact baseline, must not absorb unrelated local changes, must not merge the PR, must not modify `.ai-bridge/**`, and must not update Google Drive. ChatGPT owns independent PR verification, merge, source outbox/receipt publication, later canary if required, final STATE transition and live-memory synchronization.