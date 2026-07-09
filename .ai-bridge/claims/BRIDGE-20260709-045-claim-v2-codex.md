# Slot 2 Claim v2 - mandatory plugin/runtime-gate correction

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-045
LANE_ID: PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
TASK_ID: TASK-PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
EXECUTION_EPOCH: PLUGIN-E2-20260709-1740JST
SLOT: 2
CLAIM_OWNER: CODEX_SLOT_2
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: d651cc76957c7ac734e48ae6a7eb7625f0a07c49
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-045-03-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-045-04-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_EXECUTION_EPOCH: PLUGIN-E1-20260709-1735JST
REJECTED_PRIMARY_COMMIT: d651cc76957c7ac734e48ae6a7eb7625f0a07c49
REJECTION_VERDICT: REJECTED_INCOMPLETE_PLUGIN_FIRST_AND_FALSE_VALIDATION_EVIDENCE

Slot 2 remains the sole owner of this serialized process/plugin correction. Slots 1 and 3 remain closed.

The E2 task must preserve valid E1 model-selection edits while completing every omitted plugin-first, runtime-gate removal, installed-package, validator, bootstrap, recovery, three-slot, outbox, retry, and evidence requirement named by the current correction inbox.

`parallel-scope-planner` is mandatory in E2 because the task explicitly governs three bridge slots, shared process files, installed-package surfaces, and concurrent-lane policy.

No success or ChatGPT handoff is allowed until `.ai-bridge/outbox/BRIDGE-20260709-045-04-codex.md` exists remotely, is non-empty, passes the complete report schema, and exactly matches the final user-visible response.
