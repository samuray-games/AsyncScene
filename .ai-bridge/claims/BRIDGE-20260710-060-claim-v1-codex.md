# Slot 3 Claim v1 - exact semantic closed-loop correction

BRIDGE_PROTOCOL: 3.3
CYCLE_ID: CYCLE-20260709-001
CYCLE_GENERATION: 15
THREAD_ID: BRIDGE-20260710-060
LANE_ID: PROCESS-CLOSED-LOOP-EXACT-SEMANTIC-CORRECTION
TASK_ID: TASK-PROCESS-CLOSED-LOOP-CORE-COMPLETION
EXECUTION_EPOCH: CLOSED-LOOP-SEMANTIC-R1-20260710-1322JST
TASK_NONCE: CLV1-060-SEMANTIC-3251-1322
SLOT: 3
CLAIM_OWNER: CODEX_SLOT_3_FRESH_THREAD
CLAIM_STATUS: RESERVED_CORRECTION
PHASE: CORRECTION_REQUIRED
BASELINE: 32513f02daf5943c41f24328e1ae251d6bc85ccc
COORDINATOR_MEMORY_REV: 2026-07-10-1322-JST
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260710-060-01-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260710-060-02-codex.md
EXPECTED_RECEIPT: .ai-bridge/receipts/BRIDGE-20260710-060-03-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
PLUGIN_DELIVERY_LANE: SEPARATE_EXTERNAL_NON_GATING
PLUGIN_INVOCATION_REQUIRED: false
PLUGIN_SOURCE_CHANGES_AUTHORIZED: false
MODEL_RECOMMENDATION_REQUIRED: false
FRESH_CODEX_CONVERSATION_REQUIRED: true
THREAD_ROTATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_THREAD: BRIDGE-20260710-059

Slot 3 exclusively owns the exact semantic correction defined in `.ai-bridge/inbox/BRIDGE-20260710-060-01-chatgpt.md`.

Thread 059 remote publication shape is accepted as transport progress, but its source implementation and success receipt semantics are rejected. Thread 059 must not continue.

Codex must implement real exact identity, separate executable outbox and receipt schemas, exact terminal tuples, independent canonical transition validation, strict lowercase non-synthetic SHA validation, exact path and ancestry proof, real mutation tests, and independent implementation-plus-canary completion gating.

All plugin installation, activation, package, manifest, marketplace, cache, loader, and plugin-source paths remain protected and non-gating. Safari is not involved.

Publish exactly one direct-child primary correction commit from baseline `32513f02daf5943c41f24328e1ae251d6bc85ccc`, then immutable outbox 060, then separate receipt 060. Final user-visible bytes must equal the remote receipt exactly.
