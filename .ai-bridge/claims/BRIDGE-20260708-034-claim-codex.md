# Coordinator Recovery Claim

CLAIM_ISSUER: CHATGPT_COORDINATOR_RECOVERY
CLAIM_HANDLE: bridge-slot-one-wave-two
BRIDGE_PROTOCOL: 2.4
BRIDGE_SLOT: 1
THREAD_ID: BRIDGE-20260708-034
LANE_ID: S6-I2-DM-ACTIONS
TASK_ID: TASK-S6-PAR-I2
MAILBOX_PARENT_COMMIT: 8861b85151404de7ba2eeda8fbd6a347e285f683
AUTHORIZED_PRIMARY_BASELINE: 0775b8d10ad8f2311ac9d3aa953706d73174bc15
DECISION_FREEZE: .ai-bridge/decisions/STAGE6_WAVE2_COPY_FREEZE.md
ORIGINAL_TASK_INBOX: .ai-bridge/inbox/BRIDGE-20260708-034-01-chatgpt.md
CURRENT_BASELINE_INBOX: .ai-bridge/inbox/BRIDGE-20260708-034-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260708-034-02-codex.md
PRIMARY_WRITE_SCOPE: AsyncScene/Web/ui/ui-dm.js and docs/ui/ui-dm.js only
RUNTIME_CLASSIFICATION: RUNTIME_SENSITIVE
RUNTIME_SAFETY_CONFIRMATION_REQUIRED: SAME_THREAD_CONTINUE_AFTER_12_OF_12_PREFLIGHT
CLAIM_STATUS: ACTIVE

This claim authorizes only the exact serialized Wave II DM action-registry task after the user selects the model and sends same-thread CONTINUE. It authorizes no other product file, no system/data/events/battle/conflict/index file, no dev-checks, no boot/cache-bust, no shared docs and no mailbox STATE write. Slots 2 and 3 remain closed.
