# Slot 1 Claim v1 - three-slot and full-outbox process correction

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-044
LANE_ID: PROCESS-BRIDGE-OUTBOX-AND-PARALLEL-CONTRACT
TASK_ID: TASK-PROCESS-THREE-SLOT-FULL-OUTBOX-HARDENING
EXECUTION_EPOCH: OBX-E1-20260709-1720JST
SLOT: 1
CLAIM_OWNER: CODEX_SLOT_1
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: 5505f19b379cdf9a4559c1e6d5dd8292160e599b
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-044-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-044-02-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-043
SUPERSEDES_EPOCH: MSF-E1-20260709-1627JST

This serialized process lane owns only the nineteen primary process/plugin paths named by the current inbox. It combines the unresolved non-blocking model-selection correction with the authoritative three-slot bridge contract, mandatory Asynchronia plugin routing, complete final-response outbox identity, publish-before-reply verification and automatic retry of recoverable mailbox publication failures.

Slots 2 and 3 remain closed because this task owns shared root process, validator, workflow and plugin-contract files. They may reopen only after this lane is independently accepted and `parallel-scope-planner` proves later task scopes collision-free.

Codex must not return a success or tell the user to send `мост 1` to ChatGPT until `.ai-bridge/outbox/BRIDGE-20260709-044-02-codex.md` exists remotely, is non-empty, passes the complete-report schema and exactly matches the final response shown to the user.
