# Slot 3 Claim v1 - source and publication correction

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 8
THREAD_ID: BRIDGE-20260709-053
LANE_ID: PROCESS-CLOSED-LOOP-SOURCE-AND-PUBLICATION-CORRECTION
TASK_ID: TASK-PROCESS-CLOSED-LOOP-SOURCE-AND-PUBLICATION-CORRECTION
EXECUTION_EPOCH: CLOSED-LOOP-SOURCE-R2-20260709-2154JST
TASK_NONCE: CLV1-053-SOURCE-8134-2154
SLOT: 3
CLAIM_OWNER: CODEX_SLOT_3_FRESH_THREAD
CLAIM_STATUS: RESERVED_CORRECTION
PHASE: CORRECTION_REQUIRED
BASELINE: 8134d3660eccf999a12e594d8642d90215a75a76
COORDINATOR_MEMORY_REV: 2026-07-09-2154-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-053-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-053-02-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
NO_SOURCE_DELTA_POLICY: .ai-bridge/NO_SOURCE_DELTA_POLICY_V1.md
BRANCH_SEPARATION_POLICY: .ai-bridge/PRIMARY_MAILBOX_SEPARATION_POLICY_V1.md
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-052

Slot 3 exclusively owns correction of the source contract and primary/mailbox branch separation.

The primary commit must delete leaked outbox 052 from `main`, correct only the frozen source paths, and add no mailbox artifacts. The terminal outbox must be committed only to the coordination branch with actual remote identities and `byteEquality: MATCH`.

Generic numbered controls, placeholder terminal fields, pending publication evidence, no-source outcomes and reuse of thread 052 are forbidden.
