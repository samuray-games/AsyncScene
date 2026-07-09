# Slot 3 Claim v1 - closed-loop completeness correction

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 5
THREAD_ID: BRIDGE-20260709-050
LANE_ID: PROCESS-CLOSED-LOOP-COMPLETENESS-CORRECTION
TASK_ID: TASK-PROCESS-CLOSED-LOOP-COMPLETENESS-CORRECTION
EXECUTION_EPOCH: CLOSED-LOOP-COMPLETE-R1-20260709-2118JST
TASK_NONCE: CLV1-050-COMPLETE-9B17-2118
SLOT: 3
CLAIM_OWNER: CODEX_SLOT_3_FRESH_THREAD
CLAIM_STATUS: RESERVED_CORRECTION
PHASE: CORRECTION_REQUIRED
BASELINE: 9b170097e1ff0889ae0cb1e127516c51440c4c3d
COORDINATOR_MEMORY_REV: 2026-07-09-2118-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-050-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-050-02-codex.md
PUBLICATION_POLICY: .ai-bridge/PUBLICATION_POLICY_CLOSED_LOOP_V1.md
CLOSED_LOOP_PROTOCOL: .ai-bridge/CLOSED_LOOP_PROTOCOL.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_BOOTSTRAP_FALLBACK: AUTHORIZED
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-049
ACCEPTED_PARTIAL_PRIMARY: 9b170097e1ff0889ae0cb1e127516c51440c4c3d

Slot 3 exclusively owns completion of the closed-loop contract, deterministic state machine, routing, validator, workflow, installed plugin and evidence schema.

Thread 049 is rejected as incomplete but its primary commit remains the immutable partial-progress baseline. The old conversation must not continue. Any later correction or recovery receives a new identity.

This task must replace the current marker-level contract with the complete legal transition table, full identity and report schema, deterministic positive and negative controls, mandatory task-router bridge route, installed Asynchronia 1.0.5 proof and complete byte-verified outbox.

No acceptance or canary handoff is allowed until `.ai-bridge/outbox/BRIDGE-20260709-050-02-codex.md` exists remotely, satisfies the complete policy schema, matches the final response bytes and is independently verified in a fresh ChatGPT conversation.
