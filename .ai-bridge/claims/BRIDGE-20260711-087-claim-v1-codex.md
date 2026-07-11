# BRIDGE-20260711-087 Claim

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 8
SLOT: 2
THREAD_ID: BRIDGE-20260711-087
LANE_ID: ASYNCHRONIA-PREFLIGHT-RESIDUAL-ROOT-SYNC
TASK_ID: TASK-ASYNCHRONIA-PREFLIGHT-RESIDUAL-SYNC
EXECUTION_EPOCH: ASYNCHRONIA-PREFLIGHT-R2-20260711-1135JST
TASK_NONCE: ASPF-087-1135
AUTHORIZED_PRIMARY_BASELINE: 26493abe8b66dfe29b0dd799129c1f11acb77238
PARTIAL_PREDECESSOR_PR: 217
PARTIAL_PREDECESSOR_COMMIT: 26493abe8b66dfe29b0dd799129c1f11acb77238
SUPERSEDES_THREAD: BRIDGE-20260711-086
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-087-01-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-087-02-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-087-03-codex.md
MODEL_PREFLIGHT_POLICY: .ai-bridge/MODEL_PREFLIGHT_POLICY.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_IDENTIFIER: asynchronia
PLUGIN_AUTO_START_REQUIRED: true
ACTIVE_INSTALLED_PLUGIN_SYNC_REQUIRED: true
PLUGIN_TARGET_VERSION: 1.0.7
MODEL_RECOMMENDATION_REQUIRED: true
MODEL_RECOMMENDATION_PAUSE_REQUIRED: true
SAME_THREAD_CONTINUE_REQUIRED: true
CONTINUE_TOKEN: CONTINUE
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
STATUS: READY_FOR_MODEL_PREFLIGHT

The Bridge 086 blocker is accepted. PR 217 already moved main and partially implemented automatic preflight, so Bridge 086 must not be replayed.

Bridge 087 owns only the residual inconsistencies named by its inbox: conflicting lower authority and plugin-skill clauses, manifest/marketplace mismatch, weak non-transition validator, active installed package or fallback verification, and managed user-level bridge-block synchronization.

The first `мост 2` response is read-only preflight only. It must show the model recommendation, pause with `WAITING_FOR_MODEL_SELECTION`, and end with a standalone fenced `CONTINUE` block. No mutation is authorized before exact same-thread `CONTINUE`.

After valid resume, implementation is limited to the exact frozen primary scope in the inbox. Runtime game files remain forbidden. Runtime smoke correction remains a later separate lane.
