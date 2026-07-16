TASK_ID: TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-20260716
SLOT: 1
THREAD: BRIDGE-20260716-RESET-101
GENERATION: 3
BRANCH_TASK: bridge/1/BRIDGE-20260716-RESET-101
EXECUTION_EPOCH: BRIDGE-RESET-S1-CANARY-G3-20260716
NONCE: RESET-S1-G3-20260716-2202-JST
AUTHORIZED_BASELINE: 72081f921906dbf7bb5a3a8f0ab227254be8cc20
STATUS: READY_FOR_MODEL_PREFLIGHT
CONTINUATION_STATUS: SAME_THREAD_CONTINUE_REQUIRED
ALLOW_VERIFIED_NO_DELTA: true
NO_MAIN_WRITE: true
MAILBOX_OWNERSHIP: coordination/chatgpt-codex-bridge-1
SAFARI_STATUS: N/A_INFRASTRUCTURE_ONLY_NO_RUNTIME_OR_GAME_FILE_CHANGE
STAGE_6_STATUS: PAUSED_BY_USER

This slot-local inbox authorizes one fresh no-main-delta transport canary for Slot 1.

Before execution:
- run the mandatory Asynchronia task-router, scope-isolation-check, and model-selector preflight;
- continue only after exact same-thread CONTINUE when required by current authority;
- keep the selected task branch at bridge/1/BRIDGE-20260716-RESET-101.

The canary may verify:
- current origin/main and Slot 1 remote authority;
- policy, STATE, inbox, and claim identity agreement;
- the selected task branch and authorized baseline;
- that no runtime or Stage 6 work occurs;
- that no issue, memory, or snapshot changes occur;
- that Slot 2 and Slot 3 mailbox refs remain immutable.

After successful no-main-delta verification, execution may create and publish exactly:
- .ai-bridge/outbox/BRIDGE-20260716-RESET-101-01-codex.md
- .ai-bridge/receipts/BRIDGE-20260716-RESET-101-01-receipt.md

No other repository write is authorized.
