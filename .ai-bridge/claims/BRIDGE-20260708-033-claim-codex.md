# Coordinator Recovery Claim

CLAIM_ISSUER: CHATGPT_COORDINATOR_RECOVERY
CLAIM_HANDLE: bridge-slot-one-wave-one
BRIDGE_PROTOCOL: 2.4
BRIDGE_SLOT: 1
THREAD_ID: BRIDGE-20260708-033
LANE_ID: S6-I1-SYSTEM-RESOLVER
TASK_ID: TASK-S6-PAR-I1
MAILBOX_PARENT_COMMIT: 279480feb9a9cebe5a32242f59adf1dbb1618e62
AUTHORIZED_PRIMARY_BASELINE: 873e67387e7c4db88c1b07772ef928ee17187210
DECISION_FREEZE: .ai-bridge/decisions/STAGE6_WAVE2_COPY_FREEZE.md
ORIGINAL_TASK_INBOX: .ai-bridge/inbox/BRIDGE-20260708-033-01-chatgpt.md
CURRENT_BASELINE_INBOX: .ai-bridge/inbox/BRIDGE-20260708-033-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260708-033-02-codex.md
PRIMARY_WRITE_SCOPE: AsyncScene/Web/system.js and docs/system.js only
RUNTIME_CLASSIFICATION: RUNTIME_SENSITIVE
RUNTIME_SAFETY_CONFIRMATION_REQUIRED: SAME_THREAD_CONTINUE_AFTER_12_OF_12_PREFLIGHT
CLAIM_STATUS: ACTIVE

This claim authorizes only the exact serialized Wave I system resolver/copy task after the user selects the model and sends same-thread CONTINUE. It authorizes no other product file, no dev-checks, no boot/cache-bust, no shared docs and no mailbox STATE write. Slots 2 and 3 remain closed.
