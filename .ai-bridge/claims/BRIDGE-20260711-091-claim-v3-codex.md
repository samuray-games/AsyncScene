# BRIDGE-20260711-091 Claim v3

ISSUE: 216
CYCLE: CYCLE-20260711-003
GENERATION: 14
SLOT: 2
THREAD_ID: BRIDGE-20260711-091
LANE_ID: S6-BOOMER-STEP4_4B-FIX4-VALIDATION-CORRECTION
TASK_ID: TASK-S6-BOOMER-STEP4_4B-FIX4-ADVERSARIAL
EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX4-R4-20260711-2322JST
TASK_NONCE: S6B44B-091-ADV-2322
AUTHORIZED_PRIMARY_BASELINE: 25bee74c99fa19ae5914e1739e2ff6a46eb8aeec
REJECTED_TASK_HEAD: baf51aeb1407a3b288d7afd0d07966e1a323bc8a
BRIDGE_PROTOCOL: 4.0
BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-2
BRANCH_TASK: bridge/2/BRIDGE-20260711-091
SUPERSEDES_EXECUTION_EPOCH: S6-BOOMER-4_4B-FIX4-R3-20260711-1730JST
INBOX_PATH: .ai-bridge/inbox/BRIDGE-20260711-091-07-chatgpt.md
EXPECTED_OUTBOX_PATH: .ai-bridge/outbox/BRIDGE-20260711-091-08-codex.md
EXPECTED_RECEIPT_PATH: .ai-bridge/receipts/BRIDGE-20260711-091-09-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
REQUIRE_COMPLETE_SCOPE_DELTA: true
MODEL_RECOMMENDATION_PAUSE_REQUIRED: true
SAME_THREAD_CONTINUE_REQUIRED: true
THREAD_ROTATION_REQUIRED: true
PLUGIN_REQUIRED_VERSION: 1.0.7
PLUGIN_RECONCILIATION_REQUIRED: true
SAFARI_STATUS: PENDING_USER
STATUS: CORRECTION_REQUIRED

This claim belongs only to bridge 2. Normal execution may read current main and `coordination/chatgpt-codex-bridge-2`. Bridge 1 and bridge 3 remain out of scope and invisible.

Generation 13 is rejected by independent ChatGPT verification. Its PASS outbox and receipt are historical evidence only and cannot authorize integration or Safari smoke. The rejection reasons are mandatory validator failure and replacement of accepted Fix4 state tracking/restoration/comparator logic instead of the required minimal adversarial-fixture correction.

Begin in a fresh Codex conversation with branch `bridge/2/BRIDGE-20260711-091` selected. Reconcile active installed Asynchronia 1.0.7, perform the fresh read-only model preflight, and stop at `WAITING_FOR_MODEL_SELECTION`. No mutation before exact same-thread `CONTINUE`.

After `CONTINUE`, create one corrective child commit of `baf51aeb1407a3b288d7afd0d07966e1a323bc8a`. Restore accepted Fix4 snapshot, state tracker, finally restoration, before/after digest and production `stateTracker.compare` path from baseline `25bee74c99fa19ae5914e1739e2ff6a46eb8aeec`. Replace only the adversarial fixture logic so cloned category-local mutations are rejected through the accepted production comparator and untouched controls are accepted.

Exactly these four paths may differ from main:

- `AsyncScene/Web/dev/dev-checks.js`
- `docs/dev/dev-checks.js`
- `AsyncScene/Web/index.html`
- `docs/index.html`

All required validators must return PASS from a clean committed worktree. In particular, `python3 tools/validate-boomer-step4-4-economy-conflict-audit.py .` must exit zero. A failed required validation blocks PASS publication. Bump to a new Fix6 identity and matching cache-bust, keep both mirror pairs byte-identical, publish complete final-refetch evidence, and keep Safari pending.