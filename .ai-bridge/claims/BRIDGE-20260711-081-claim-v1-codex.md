# BRIDGE-20260711-081 Claim

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 2
SLOT: 2
THREAD_ID: BRIDGE-20260711-081
LANE_ID: S6-BOOMER-STEP4_4B-CORRECTION
TASK_ID: TASK-S6-BOOMER-STEP4_4B-FIX2
EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX2-R1-20260711-0500JST
TASK_NONCE: S6B44B-081-FIX2-0500
AUTHORIZED_PRIMARY_BASELINE: c5ef0ecea5c96a54604e6d130207ac4fd52789df
SUPERSEDES_THREAD: BRIDGE-20260711-080
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-081-01-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-081-02-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-081-03-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_INVOCATION_REQUIRED: true
PLUGIN_IDENTIFIER: asynchronia
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
STATUS: READY

Frozen write ownership requires exactly all four paths:
- AsyncScene/Web/dev/dev-checks.js
- docs/dev/dev-checks.js
- AsyncScene/Web/index.html
- docs/index.html

This claim authorizes only the atomic Fix2 correction defined by the current inbox. Codex must start with `Use @asynchronia.`, invoke the exact ten-skill route, preserve complete plugin and validation evidence, execute on the first matching `мост 2`, publish one direct-child exact-four-path primary commit plus the exact outbox and receipt, and leave Safari acceptance to the user.

`PASS_PUSHED` is forbidden if any mandatory skill evidence is absent or non-passing, any required validation is non-passing, the receipt omits or rewrites outbox validation evidence, or the primary changed paths differ from the exact four-path frozen scope.
