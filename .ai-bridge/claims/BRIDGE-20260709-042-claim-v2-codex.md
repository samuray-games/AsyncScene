# Slot 1 Claim v2 - Runtime gate removal correction

BRIDGE_PROTOCOL: 3.1
THREAD_ID: BRIDGE-20260709-042
LANE_ID: PROCESS-RUNTIME-GATE-REMOVAL
TASK_ID: TASK-PROCESS-RUNTIME-GATE-REMOVAL
EXECUTION_EPOCH: PRGR-E2-20260709-0346JST
SLOT: 1
CLAIM_OWNER: CODEX_SLOT_1
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: c0e2f891076f3e8e280941edbe0e241d9931dd0f
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-042-04-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-042-05-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_CLAIM: .ai-bridge/claims/BRIDGE-20260709-042-02-codex.md

The prior local commit and worktree are invalid publication ancestry. Execute the full unchanged task from a new clean worktree at the exact remote baseline, push one direct-child commit, publish the current outbox and refetch both refs in the same cycle.