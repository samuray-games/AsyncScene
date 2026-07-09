# Slot 2 Claim v1 - mandatory Asynchronia plugin and runtime gate removal

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-045
LANE_ID: PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
TASK_ID: TASK-PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
EXECUTION_EPOCH: PLUGIN-E1-20260709-1735JST
SLOT: 2
CLAIM_OWNER: CODEX_SLOT_2
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: 5505f19b379cdf9a4559c1e6d5dd8292160e599b
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-045-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-045-02-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-044
SUPERSEDES_SLOT: 1

Slot 2 is the sole active owner of the shared process/plugin correction. Slot 1 is superseded and closed. Slot 3 remains closed because the authorized scope contains shared root policy, workflow, validator, plugin routing, bootstrap, installation, evidence, and outbox contracts.

The task must fully remove `runtime-safety-gate` from source and active installed package behavior, require exact first-line `Use @asynchronia.` for every Asynchronia Codex task, require `task-router` first and all routed skills, preserve non-blocking model recommendation semantics, and enforce complete byte-identical final-response outbox publication before any ChatGPT handoff.

Codex must not return success or instruct the user to send `мост 2` to ChatGPT until `.ai-bridge/outbox/BRIDGE-20260709-045-02-codex.md` exists remotely, is non-empty, passes the full report schema, and exactly matches the final response shown to the user.
