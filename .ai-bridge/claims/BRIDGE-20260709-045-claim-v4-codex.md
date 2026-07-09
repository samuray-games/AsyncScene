# Slot 2 Claim v4 - objective-gap and validator correction

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-045
LANE_ID: PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
TASK_ID: TASK-PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
EXECUTION_EPOCH: PLUGIN-E4-20260709-1908JST
SLOT: 2
CLAIM_OWNER: CODEX_SLOT_2
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: 83ff4668bd2a7401a933794668c16b7ea62c08e2
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-045-07-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-045-08-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
OBJECTIVE_GAP_PROOF: REQUIRED
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_EXECUTION_EPOCH: PLUGIN-E3-20260709-1804JST
REJECTED_TERMINAL_STATUS: BLOCKED_NO_SOURCE_DELTA
REJECTION_VERDICT: REJECTED_FAIL_NO_EXECUTION_EVIDENCE_AND_FALSE_NO_DELTA_INFERENCE

Slot 2 remains the sole owner of the serialized process/plugin correction. Slots 1 and 3 remain closed.

The current validator blob `0145f14e622f6bc74a22ac3816357de706f326ef` is an explicit mandatory source target. Its own PASS is not proof that no source delta exists.

E4 must modify `tools/validate-orchestration-policy.py`, complete the fourteen-row objective-gap matrix, run the required negative controls, verify the actual installed plugin and managed user-level surfaces, and publish the complete byte-identical final response outbox.

`BLOCKED_NO_SOURCE_DELTA` is not a valid terminal status for this claim. A genuine contradiction must use a complete published `BLOCKED_CONTRACT_CONTRADICTION` report with exact source-backed proof.

No success, blocker handoff, or return to ChatGPT is valid until `.ai-bridge/outbox/BRIDGE-20260709-045-08-codex.md` exists remotely, passes the complete report schema, and matches the user-visible final response byte-for-byte.
