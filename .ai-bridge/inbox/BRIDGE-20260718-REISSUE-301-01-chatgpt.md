TASK_ID: TASK-INFRA-BRIDGE-SLOT3-G3-REISSUE-20260718
SLOT: 3
THREAD: BRIDGE-20260718-REISSUE-301
GENERATION: 3
BRANCH_TASK: bridge/3/BRIDGE-20260718-REISSUE-301
EXECUTION_EPOCH: BRIDGE-REISSUE-S3-CANARY-G3-20260718
NONCE: REISSUE-S3-G3-20260718-1458-JST
AUTHORIZED_BASELINE: a89d13c59163cba8bdf5b5f83ddceb7107339882
STATUS: READY_FOR_MODEL_PREFLIGHT
CONTINUATION_STATUS: SAME_THREAD_CONTINUE_REQUIRED
ALLOW_VERIFIED_NO_DELTA: true
NO_MAIN_WRITE: true
MAILBOX_OWNERSHIP: coordination/chatgpt-codex-bridge-3
SAFARI_STATUS: N/A_INFRASTRUCTURE_ONLY_NO_RUNTIME_OR_GAME_FILE_CHANGE
STAGE_6_STATUS: PAUSED_BY_USER

This slot-local inbox authorizes one fresh no-main-delta transport canary for Slot 3.

Before execution:
- run the mandatory Asynchronia task-router, scope-isolation-check, and executable model-selector preflight;
- stop at WAITING_FOR_INVENTORY_CONFIRMATION and continue only after exact same-thread INVENTORY_OK;
- after the user selects the recommended model and effort in the Codex UI, continue only after exact same-thread CONTINUE;
- keep the selected task branch at bridge/3/BRIDGE-20260718-REISSUE-301.

The canary may verify current origin/main, Slot 3 authority, policy, STATE, inbox, claim, task branch, and baseline.
It may not perform runtime or Stage 6 work, update issues, memory, or snapshots, or write Slot 1 or Slot 2 mailbox content.

After successful no-main-delta verification, execution may create and publish exactly:
- .ai-bridge/outbox/BRIDGE-20260718-REISSUE-301-01-codex.md
- .ai-bridge/receipts/BRIDGE-20260718-REISSUE-301-01-receipt.md

No other repository write is authorized.
