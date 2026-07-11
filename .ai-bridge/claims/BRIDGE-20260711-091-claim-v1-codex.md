# BRIDGE-20260711-091 Claim

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 12
SLOT: 2
THREAD_ID: BRIDGE-20260711-091
LANE_ID: S6-BOOMER-STEP4_4B-FIX4-VALIDATION-CORRECTION
TASK_ID: TASK-S6-BOOMER-STEP4_4B-FIX4-ADVERSARIAL
EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX4-R2-20260711-1415JST
TASK_NONCE: S6B44B-091-ADV-1415
AUTHORIZED_PRIMARY_BASELINE: 42c56c023e3b60f3b9e534dbb720057e78ef0c77
BRIDGE_PROTOCOL: 4.0
BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-2
BRANCH_TASK: bridge/2/BRIDGE-20260711-091
SUPERSEDES_THREAD: BRIDGE-20260711-090
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-091-01-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-091-02-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-091-03-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
REQUIRE_COMPLETE_SCOPE_DELTA: true
MODEL_RECOMMENDATION_PAUSE_REQUIRED: true
SAME_THREAD_CONTINUE_REQUIRED: true
SAFARI_STATUS: PENDING_USER
STATUS: READY_FOR_MODEL_PREFLIGHT

This claim belongs only to bridge 2. Normal execution may read `main` and `coordination/chatgpt-codex-bridge-2`; bridge 1 and bridge 3 are out of scope and invisible.

Implementation belongs only on `bridge/2/BRIDGE-20260711-091`. Direct task writes to main are forbidden.

After exact same-thread `CONTINUE`, exactly the four runtime mirror paths may change. Replace inequality-only fixtures with actual production-comparator rejection fixtures, preserve Fix4 restoration behavior, bump to Fix5 identity/cache-bust, verify installed Asynchronia 1.0.7, and publish complete bridge-2 outbox/receipt evidence. Safari remains pending.
