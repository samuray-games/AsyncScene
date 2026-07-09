# Slot 1 Claim v1 - model-selection semantics correction

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-043
LANE_ID: PROCESS-MODEL-SELECTION-SEMANTICS-FIX
TASK_ID: TASK-PROCESS-MODEL-SELECTION-SEMANTICS-FIX
EXECUTION_EPOCH: MSF-E1-20260709-1627JST
SLOT: 1
CLAIM_OWNER: CODEX_SLOT_1
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: 5505f19b379cdf9a4559c1e6d5dd8292160e599b
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-043-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-043-02-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260709-041

The lane owns only the eight primary process/plugin paths named by the current inbox. It resolves the contradictory model-preflight semantics and expands validation to every plugin skill. The selector may originate an informational recommendation, but execution must not stop for model selection, `CONTINUE`, runtime approval, `APPROVE`, or Safari. Step 4.4B product/runtime repair is outside this lane.
