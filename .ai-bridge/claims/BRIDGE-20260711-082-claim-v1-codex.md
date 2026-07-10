# BRIDGE-20260711-082 Claim

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 3
SLOT: 2
THREAD_ID: BRIDGE-20260711-082
LANE_ID: S6-BOOMER-STEP4_4B-CORRECTION
TASK_ID: TASK-S6-BOOMER-STEP4_4B-FIX3
EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX3-R1-20260711-0615JST
TASK_NONCE: S6B44B-082-FIX3-0615
AUTHORIZED_PRIMARY_BASELINE: c5ef0ecea5c96a54604e6d130207ac4fd52789df
SUPERSEDES_THREAD: BRIDGE-20260711-081
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-082-01-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-082-02-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-082-03-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_INVOCATION_REQUIRED: true
PLUGIN_IDENTIFIER: asynchronia
VALIDATOR_APPLICABILITY_GATE: REQUIRED
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
STATUS: READY

Frozen write ownership requires exactly all four paths:
- AsyncScene/Web/dev/dev-checks.js
- docs/dev/dev-checks.js
- AsyncScene/Web/index.html
- docs/index.html

This claim authorizes only the atomic Fix3 correction defined by the current inbox. Codex must start with `Use @asynchronia.`, invoke the exact ten-skill route, preserve complete plugin and validation evidence, and execute on the first matching `мост 2`.

The historical Bridge 062 validator `tools/validate-orchestration-policy.py` is explicitly not task-applicable. It must be preserved read-only, reported through the exact `excludedValidationEvidence` contract, and replaced by the task-applicable controls named by the inbox. It must not be represented as passing evidence.

Codex may recover the prior uncommitted four-file Fix2 diff only after proving the exact worktree provenance and scope required by the inbox. Otherwise it must reimplement from the baseline.

`PASS_PUSHED` is forbidden if any mandatory skill evidence is absent or non-passing, any required task-applicable validation is non-passing, the receipt omits or rewrites evidence, or the primary changed paths differ from the exact four-path frozen scope.
