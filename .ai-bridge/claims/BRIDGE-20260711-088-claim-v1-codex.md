# BRIDGE-20260711-088 Claim

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 9
SLOT: 2
THREAD_ID: BRIDGE-20260711-088
LANE_ID: ASYNCHRONIA-PREFLIGHT-VALIDATOR-CORRECTION
TASK_ID: TASK-ASYNCHRONIA-PREFLIGHT-CHANGED-TASK-FIXTURE
EXECUTION_EPOCH: ASYNCHRONIA-PREFLIGHT-VALIDATOR-R1-20260711-1224JST
TASK_NONCE: ASPFV-088-1224
AUTHORIZED_PRIMARY_BASELINE: 2007440347e48277c07572ff96fc2545efdefe19
SUPERSEDES_THREAD: BRIDGE-20260711-087
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-088-01-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-088-02-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-088-03-codex.md
MODEL_PREFLIGHT_POLICY: .ai-bridge/MODEL_PREFLIGHT_POLICY.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_IDENTIFIER: asynchronia
PLUGIN_AUTO_START_REQUIRED: true
ACTIVE_INSTALLED_PLUGIN_WRITE_REQUIRED: false
ACTIVE_INSTALLED_PLUGIN_READBACK_REQUIRED: true
PLUGIN_VERSION: 1.0.7
MODEL_RECOMMENDATION_REQUIRED: true
MODEL_RECOMMENDATION_PAUSE_REQUIRED: true
SAME_THREAD_CONTINUE_REQUIRED: true
CONTINUE_TOKEN: CONTINUE
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
STATUS: READY_FOR_MODEL_PREFLIGHT

Bridge 087 source, package parity, policy synchronization, publication chain, and installed-package evidence are preserved as accepted predecessor evidence.

Bridge 088 owns one exact source defect only: the validator has task-mismatch logic but no executed `changed_task` adversarial fixture, and it does not assert `repeated_preflight == true` for all stale identity fixtures.

The first `мост 2` response is read-only preflight only. It must recommend the cheapest reliable pair, stop with `WAITING_FOR_MODEL_SELECTION`, and end with one standalone fenced `CONTINUE` block. No mutation is authorized before exact same-thread `CONTINUE`.

After valid resume, exactly `tools/validate-asynchronia-auto-model-preflight.py` may change. Plugin package and local installation remain version `1.0.7` and are readback-only in this lane.
