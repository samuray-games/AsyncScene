# Slot 2 Claim v1 - completed ChatGPT-Codex closed loop

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 1
THREAD_ID: BRIDGE-20260709-046
LANE_ID: PROCESS-CLOSED-LOOP-ORCHESTRATION
TASK_ID: TASK-PROCESS-CLOSED-LOOP-IMPLEMENTATION
EXECUTION_EPOCH: CLOSED-LOOP-E1-20260709-1930JST
TASK_NONCE: CLV1-046-E1-83FF-7C9A
SLOT: 2
CLAIM_OWNER: CODEX_SLOT_2_FRESH_THREAD
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: IMPLEMENTATION_REQUIRED
BASELINE: 83ff4668bd2a7401a933794668c16b7ea62c08e2
COORDINATOR_MEMORY_REV: 2026-07-09-1918-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-046-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-046-02-codex.md
PUBLICATION_POLICY: .ai-bridge/PUBLICATION_POLICY_CLOSED_LOOP_V1.md
CLOSED_LOOP_PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_BOOTSTRAP_FALLBACK: AUTHORIZED
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-045
SUPERSEDES_EPOCH: PLUGIN-E5-20260709-1918JST

Slot 2 is the sole owner of the serialized closed-loop implementation. Slots 1 and 3 remain closed because this task owns shared root process, plugin, validator, workflow, installation, documentation, evidence and recovery contracts.

This task must implement one atomic epoch per fresh Codex conversation, one verification per fresh ChatGPT conversation, immutable task identity and nonce, STATE-last activation, memory synchronization before handoff, complete remote-verified outbox publication, fresh-thread corrections and recoveries, and a separately verified canary gate.

The task also absorbs every unfinished requirement from thread 045, including plugin-first routing, source bootstrap for plugin repair, installed plugin validation, runtime-gate removal, deterministic negative controls and full outbox identity.

No success or ChatGPT handoff is allowed until `.ai-bridge/outbox/BRIDGE-20260709-046-02-codex.md` exists remotely, passes the full report schema and exactly matches the final response shown to the user.

This claim expires with the final response of the fresh Codex conversation. Any correction or recovery requires a new claim, thread, epoch, nonce and outbox.
