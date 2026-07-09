# Slot 1 Claim v5

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-042
LANE_ID: PROCESS-RUNTIME-GATE-REMOVAL
TASK_ID: TASK-PROCESS-RUNTIME-GATE-REMOVAL
EXECUTION_EPOCH: PRGR-E5-20260709-1151JST
SLOT: 1
CLAIM_OWNER: CODEX_SLOT_1
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: 4944e7e32a58ff71656730ed61374bb10f11a500
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-042-10-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-042-11-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_CLAIM: .ai-bridge/claims/BRIDGE-20260709-042-claim-v4-codex.md

E4 is rejected because active process/plugin files preserve runtime approval, runtime gate and sensitivity-only runtime-slot semantics, while the validator omits `STAGE6_PARALLEL_EXECUTION_PLAN.md` and misses semantic variants. Execute E5 from a clean worktree at the exact baseline, change only the frozen process/plugin scope, publish one direct-child primary commit and the exact E5 outbox, and refetch both refs.
