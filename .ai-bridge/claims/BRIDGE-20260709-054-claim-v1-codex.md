# Slot 3 Claim v1 - strict source and publication correction

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 9
THREAD_ID: BRIDGE-20260709-054
LANE_ID: PROCESS-CLOSED-LOOP-STRICT-SOURCE-AND-PUBLICATION-CORRECTION
TASK_ID: TASK-PROCESS-CLOSED-LOOP-STRICT-SOURCE-AND-PUBLICATION-CORRECTION
EXECUTION_EPOCH: CLOSED-LOOP-SOURCE-R3-20260709-2213JST
TASK_NONCE: CLV1-054-SOURCE-708B-2213
SLOT: 3
CLAIM_OWNER: CODEX_SLOT_3_FRESH_THREAD
CLAIM_STATUS: RESERVED_CORRECTION
PHASE: CORRECTION_REQUIRED
BASELINE: 708bc8f1380f2fb4ba687ecfa2706494b3c969d9
COORDINATOR_MEMORY_REV: 2026-07-09-2213-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-054-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-054-02-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
BRANCH_SEPARATION_POLICY: .ai-bridge/PRIMARY_MAILBOX_SEPARATION_POLICY_V1.md
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-053

Slot 3 exclusively owns the strict source-contract correction and primary/mailbox cleanup.

The primary commit must delete leaked outbox 052, complete the meaningful controls, exhaustive tests, strict terminal schema, validator and routing contract, and add no mailbox artifacts. The terminal report must be published only to the coordination branch with actual remote identities and `byteEquality: MATCH`.

Thread 053, generic numbered controls, stale 052 fixtures, placeholder terminal fields, incomplete publication evidence and mailbox files on main are forbidden.
