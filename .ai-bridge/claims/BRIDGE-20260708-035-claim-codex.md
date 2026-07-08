# Coordinator Recovery Claim

CLAIM_ISSUER: CHATGPT_COORDINATOR_RECOVERY
CLAIM_TOKEN: ObEzc9L2bcznAj97Q7wEuHhZW7b0B5VI
BRIDGE_PROTOCOL: 3.0
ORCHESTRATION_VERSION: 3.0
BRIDGE_SLOT: 1
THREAD_ID: BRIDGE-20260708-035
LANE_ID: S6-I3-EVENT-VOTE-PRESENTATION
TASK_ID: TASK-S6-PAR-I3
MAILBOX_PARENT_COMMIT: 2d22f06784c6969ad25cbb018ccbcd94d9cf36ae
AUTHORIZED_PRIMARY_BASELINE: 23fd4ab42d62c999d426ea07c79c84837a71a48b
DECISION_FREEZE: .ai-bridge/decisions/STAGE6_WAVE2_COPY_FREEZE.md
ORIGINAL_TASK_INBOX: .ai-bridge/inbox/BRIDGE-20260708-035-01-chatgpt.md
CURRENT_BASELINE_INBOX: .ai-bridge/inbox/BRIDGE-20260708-035-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260708-035-02-codex.md
PRIMARY_WRITE_SCOPE:
- AsyncScene/Web/events.js
- docs/events.js
- AsyncScene/Web/ui/ui-events.js
- docs/ui/ui-events.js
RUNTIME_CLASSIFICATION: RUNTIME_SENSITIVE
CONFIRMATION_REQUIRED: SAME_THREAD_CONTINUE_AFTER_MODEL_SELECTION
CLAIM_STATUS: ACTIVE

This immutable claim authorizes only the identified logical thread and lane. The claim itself authorizes no primary write before the user selects the recommended model and sends same-thread `CONTINUE`. Under Protocol 3.0, that token confirms both model selection and the exact frozen runtime scope. No second claim or second approval round is permitted.
