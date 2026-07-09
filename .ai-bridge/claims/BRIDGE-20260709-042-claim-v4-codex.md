# Slot 1 Claim v4

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-042
LANE_ID: PROCESS-RUNTIME-GATE-REMOVAL
TASK_ID: TASK-PROCESS-RUNTIME-GATE-REMOVAL
EXECUTION_EPOCH: PRGR-E4-20260709-1120JST
SLOT: 1
CLAIM_OWNER: CODEX_SLOT_1
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: c3c1b1c79d8be18d1f3f5f034745ce47bb33bcf4
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-042-08-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-042-09-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_CLAIM: .ai-bridge/claims/BRIDGE-20260709-042-claim-v3-codex.md

The previous Codex conversation replayed superseded E2 identities and is invalid. Use a fresh conversation, pass the exact five-field identity gate, execute the inherited E3 correction from a clean worktree, push one direct-child commit, publish the E4 outbox, and refetch both refs.