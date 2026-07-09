# Slot 3 Claim v1 - startup deadlock recovery

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 6
THREAD_ID: BRIDGE-20260709-051
LANE_ID: PROCESS-CLOSED-LOOP-STARTUP-DEADLOCK-RECOVERY
TASK_ID: TASK-PROCESS-CLOSED-LOOP-STARTUP-DEADLOCK-RECOVERY
EXECUTION_EPOCH: CLOSED-LOOP-STARTUP-R1-20260709-2125JST
TASK_NONCE: CLV1-051-STARTUP-9B17-2125
SLOT: 3
CLAIM_OWNER: CODEX_SLOT_3_FRESH_THREAD
CLAIM_STATUS: RESERVED_RECOVERY
PHASE: RECOVERY_REQUIRED
BASELINE: 9b170097e1ff0889ae0cb1e127516c51440c4c3d
COORDINATOR_MEMORY_REV: 2026-07-09-2125-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-051-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-051-02-codex.md
EXPECTED_OUTBOX_INITIAL_STATE: ABSENT_ALLOWED_AND_EXPECTED
OUTBOX_REQUIRED_PHASE: OUTBOX_PUBLISHING_OR_LATER
BLOCKED_NO_REMOTE_OUTBOX: FORBIDDEN
PUBLICATION_POLICY: .ai-bridge/PUBLICATION_POLICY_CLOSED_LOOP_V1.md
PUBLICATION_POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_CLOSED_LOOP_V1_1
CLOSED_LOOP_PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL.md
CLOSED_LOOP_PROTOCOL_ID: ASYNCHRONIA_CLOSED_LOOP_V1_1
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_BOOTSTRAP_FALLBACK: AUTHORIZED
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-050

Slot 3 exclusively owns this recovery. Thread 050 expired after an illegal startup verdict and must not continue.

The expected outbox is a reserved final publication address. Its absence before execution is a passing fresh-epoch condition and must not block routing or implementation. Outbox existence, schema and byte equality become mandatory only during terminal publication.

Task 051 must complete every unfinished requirement from thread 050, publish one exact-scope primary commit, then publish and remotely verify one complete outbox. Any later correction or recovery requires a new thread, epoch, nonce, claim and outbox.
