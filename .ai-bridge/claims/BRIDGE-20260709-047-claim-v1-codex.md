# Slot 2 Claim v1 - closed-loop implementation correction

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 2
THREAD_ID: BRIDGE-20260709-047
LANE_ID: PROCESS-CLOSED-LOOP-ORCHESTRATION
TASK_ID: TASK-PROCESS-CLOSED-LOOP-IMPLEMENTATION-CORRECTION-R1
EXECUTION_EPOCH: CLOSED-LOOP-R1-E1-20260709-1932JST
TASK_NONCE: CLV1-047-R1-CA2A-362B77
SLOT: 2
CLAIM_OWNER: CODEX_SLOT_2_FRESH_THREAD
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: ca2a3f88ac00a7e4fae47459758e7b09099a3f41
COORDINATOR_MEMORY_REV: 2026-07-09-1932-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-047-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-047-02-codex.md
PUBLICATION_POLICY: .ai-bridge/PUBLICATION_POLICY_CLOSED_LOOP_V1.md
CLOSED_LOOP_PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_BOOTSTRAP_FALLBACK: AUTHORIZED
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-046
SUPERSEDES_EPOCH: CLOSED-LOOP-E1-20260709-1930JST

Slot 2 is the sole owner of the serialized closed-loop implementation correction. Slots 1 and 3 remain closed because this task owns shared root process, plugin, validator, workflow, documentation, installation, evidence and recovery contracts.

Epoch 046 is rejected because its activated artifacts disagree on coordinator memory revision, its expected outbox is absent, and its primary commit is incomplete. This claim authorizes only the fresh correction task in `.ai-bridge/inbox/BRIDGE-20260709-047-01-chatgpt.md` on baseline `ca2a3f88ac00a7e4fae47459758e7b09099a3f41`.

No success or ChatGPT handoff is allowed until `.ai-bridge/outbox/BRIDGE-20260709-047-02-codex.md` exists remotely, contains the complete final response, passes the required schema, and exactly matches the response shown to the user.

This claim expires with the final response of the fresh Codex conversation. Any rejection, blocker, correction or recovery requires another new thread, epoch, nonce, inbox, claim and outbox.