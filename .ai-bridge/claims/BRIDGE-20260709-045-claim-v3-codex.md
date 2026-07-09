# Slot 2 Claim v3 - mandatory plugin/runtime-gate correction

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-045
LANE_ID: PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
TASK_ID: TASK-PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
EXECUTION_EPOCH: PLUGIN-E3-20260709-1804JST
SLOT: 2
CLAIM_OWNER: CODEX_SLOT_2
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: 83ff4668bd2a7401a933794668c16b7ea62c08e2
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-045-05-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-045-06-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_EXECUTION_EPOCH: PLUGIN-E2-20260709-1740JST
REJECTED_PRIMARY_COMMIT: 83ff4668bd2a7401a933794668c16b7ea62c08e2
REJECTION_VERDICT: REJECTED_INCOMPLETE_VALIDATOR_INSTALLED_PACKAGE_AND_OUTBOX_EVIDENCE

Slot 2 remains the sole owner of this serialized process/plugin correction. Slots 1 and 3 remain closed.

E3 preserves valid E1/E2 source deltas but must complete the still-open validator, plugin-first, installed-package, managed user-level instruction, runtime-gate removal, negative-control, complete-outbox, remote-refetch, retry, and byte-equality requirements in the current correction inbox.

`parallel-scope-planner` is mandatory because this task governs three bridge slots, shared process files, workflow and validator coverage, plugin source and installed package behavior, managed user-level instructions, and mailbox publication contracts.

No success or ChatGPT handoff is allowed until `.ai-bridge/outbox/BRIDGE-20260709-045-06-codex.md` exists remotely, is non-empty, passes the complete report schema, and exactly matches the final user-visible response.
