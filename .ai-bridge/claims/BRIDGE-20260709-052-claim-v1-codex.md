# Slot 3 Claim v1 - atomic source contract correction

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 7
THREAD_ID: BRIDGE-20260709-052
LANE_ID: PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION
TASK_ID: TASK-PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION
EXECUTION_EPOCH: CLOSED-LOOP-SOURCE-R1-20260709-2138JST
TASK_NONCE: CLV1-052-SOURCE-9B17-2138
SLOT: 3
CLAIM_OWNER: CODEX_SLOT_3_FRESH_THREAD
CLAIM_STATUS: RESERVED_CORRECTION
PHASE: CORRECTION_REQUIRED
BASELINE: 9b170097e1ff0889ae0cb1e127516c51440c4c3d
COORDINATOR_MEMORY_REV: 2026-07-09-2138-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-052-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
NO_SOURCE_DELTA_POLICY: .ai-bridge/NO_SOURCE_DELTA_POLICY_V1.md
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-051

Slot 3 exclusively owns the repository source-contract correction.

A source delta is mandatory. Existing validator success cannot satisfy the task. `BLOCKED_NO_SOURCE_DELTA`, `PASS_VERIFIED_NO_DELTA`, and equivalent outcomes are forbidden.

This epoch is limited to the exact frozen paths in inbox 052. It must implement, test, commit and publish the source state machine and complete outbox. Installed-package proof is intentionally deferred to a later fresh task after independent acceptance.
