# BRIDGE-20260711-085 Claim

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 6
SLOT: 2
THREAD_ID: BRIDGE-20260711-085
LANE_ID: S6-BOOMER-STEP4_4B-PUBLICATION-RECOVERY
TASK_ID: TASK-S6-BOOMER-STEP4_4B-FIX3-PUBLISH3
EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX3-PUB-R3-20260711-1057JST
TASK_NONCE: S6B44B-085-PUB3-1057
AUTHORIZED_PRIMARY_BASELINE: c5ef0ecea5c96a54604e6d130207ac4fd52789df
HISTORICAL_LOCAL_COMMIT: 0f7ecd69fb5857dbb965e6b4ee57dc2737f16f29
SUPERSEDES_THREAD: BRIDGE-20260711-084
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-085-01-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-085-02-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-085-03-codex.md
DELTA_SCOPE_POLICY: .ai-bridge/DELTA_SCOPE_POLICY.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
REQUIRE_COMPLETE_SCOPE_DELTA: false
PLUGIN_IDENTIFIER: asynchronia
PLUGIN_CONTEXT_MODE: USER_ATTACHED_OR_REPOSITORY_FALLBACK
PLUGIN_INVOCATION_REQUIRED: false
PLUGIN_TOOL_TELEMETRY_REQUIRED: false
SKILL_APPLICATION_EVIDENCE_REQUIRED: true
MODEL_RECOMMENDATION_VISIBLE_REQUIRED: true
MODEL_RECOMMENDATION_PAUSE: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
STATUS: READY

Authorized write scope and target-state paths are exactly:
- AsyncScene/Web/dev/dev-checks.js
- AsyncScene/Web/index.html
- docs/dev/dev-checks.js
- docs/index.html

Actual changed paths must be the exact non-empty subset of these files that genuinely differs from the baseline. An unchanged target path requires target no-delta proof. Do not manufacture a fourth change.

The historical local commit is a possible blob source only. Reconstruct one clean direct-child commit from the authorized baseline, commit before running working-tree validators, and publish the actual target-correct delta.

`BLOCKED_NO_SOURCE_DELTA` is forbidden when any authorized path differs. Safari remains user-owned and pending.
