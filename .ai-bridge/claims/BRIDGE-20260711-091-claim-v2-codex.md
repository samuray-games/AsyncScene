# BRIDGE-20260711-091 Claim v2

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 13
SLOT: 2
THREAD_ID: BRIDGE-20260711-091
LANE_ID: S6-BOOMER-STEP4_4B-FIX4-VALIDATION-CORRECTION
TASK_ID: TASK-S6-BOOMER-STEP4_4B-FIX4-ADVERSARIAL
EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX4-R3-20260711-1730JST
TASK_NONCE: S6B44B-091-ADV-1730
AUTHORIZED_PRIMARY_BASELINE: 25bee74c99fa19ae5914e1739e2ff6a46eb8aeec
PREVIOUS_AUTHORIZED_BASELINE: 42c56c023e3b60f3b9e534dbb720057e78ef0c77
BRIDGE_PROTOCOL: 4.0
BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-2
BRANCH_TASK: bridge/2/BRIDGE-20260711-091
SUPERSEDES_EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX4-R2-20260711-1415JST
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-091-04-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-091-05-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-091-06-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
REQUIRE_COMPLETE_SCOPE_DELTA: true
MODEL_RECOMMENDATION_PAUSE_REQUIRED: true
SAME_THREAD_CONTINUE_REQUIRED: true
THREAD_ROTATION_REQUIRED: true
PLUGIN_REQUIRED_VERSION: 1.0.7
PLUGIN_RECONCILIATION_REQUIRED: true
SAFARI_STATUS: PENDING_USER
STATUS: READY_FOR_MODEL_PREFLIGHT

This claim belongs only to bridge 2. Normal execution may read current main and coordination/chatgpt-codex-bridge-2. Bridge 1 and bridge 3 are out of scope and invisible.

The dedicated task branch was safely fast-forwarded without force to 25bee74c99fa19ae5914e1739e2ff6a46eb8aeec before this claim was issued. It contained no task-owned commit. Do not replay or reconstruct the superseded baseline.

The previous execution epoch is superseded. Its model recommendation and CONTINUE token are stale. Begin in a fresh Codex conversation with a fresh read-only model preflight.

Before any task mutation, reconcile active installed Asynchronia against repository version 1.0.7. The previous attempt found only installed cache version 1.0.5. Refresh or install the repository-local personal/asynchronia 1.0.7 package without repository or mailbox mutation. If activation requires a user reload or native UI action, return BLOCKED_ACTIVE_PLUGIN_RELOAD_REQUIRED with one exact user action and stop before task mutation. Continue only after active installed 1.0.7 readback and required skill hashes are recorded.

After exact same-thread CONTINUE, exactly these four runtime mirror paths may change:

- AsyncScene/Web/dev/dev-checks.js
- docs/dev/dev-checks.js
- AsyncScene/Web/index.html
- docs/index.html

Preserve accepted Fix4 restoration behavior. Replace inequality-only fixtures with actual production-comparator rejection fixtures for profile, economy, battleState, moneyLog, persistence, and localStorage. Require untouched controls to compare true, expose all seven comparator fields, bump to Fix5 identity and one matching cache-bust, keep mirrors exact, and publish complete task-branch, outbox, receipt, plugin, harness, parent, exact-path, final-refetch, and byte-equality evidence. Safari remains pending.
