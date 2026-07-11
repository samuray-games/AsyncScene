# BRIDGE-20260711-090 Claim

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 11
SLOT: 2
THREAD_ID: BRIDGE-20260711-090
LANE_ID: S6-BOOMER-STEP4_4B-RUNTIME-RESTORATION
TASK_ID: TASK-S6-BOOMER-STEP4_4B-FIX4
EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX4-R1-20260711-1335JST
TASK_NONCE: S6B44B-090-FIX4-1335
AUTHORIZED_PRIMARY_BASELINE: c12e0dacf92ae629215dbcc520b62a10f1d89846
SUPERSEDES_THREAD: BRIDGE-20260711-089
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-090-01-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-090-02-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-090-03-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
REQUIRE_COMPLETE_SCOPE_DELTA: true
MODEL_RECOMMENDATION_PAUSE_REQUIRED: true
SAME_THREAD_CONTINUE_REQUIRED: true
SAFARI_STATUS: PENDING_USER
STATUS: READY_FOR_MODEL_PREFLIGHT

Frozen primary scope is exactly:
- AsyncScene/Web/dev/dev-checks.js
- docs/dev/dev-checks.js
- AsyncScene/Web/index.html
- docs/index.html

The first fresh `мост 2` is read-only model preflight and must stop with a standalone fenced `CONTINUE` block. No mutation is authorized before exact same-thread `CONTINUE`.

After resume, implement Fix4 side-effect-free restoration for profile/text mode, economy, battle state, moneyLog, persistence, and relevant localStorage. Require canonical before/after proof, isolated adversarial fixtures, source/docs semantic mirror, matching Fix4 cache-busts, exact four-path direct-child publication, and no Safari claim.
