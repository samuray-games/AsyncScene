# Slot 2 Claim v5 - plugin bootstrap and stale-state correction

BRIDGE_PROTOCOL: 3.2
THREAD_ID: BRIDGE-20260709-045
LANE_ID: PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
TASK_ID: TASK-PROCESS-MANDATORY-PLUGIN-NO-RUNTIME-GATE
EXECUTION_EPOCH: PLUGIN-E5-20260709-1918JST
SLOT: 2
CLAIM_OWNER: CODEX_SLOT_2
CLAIM_STATUS: RESERVED_EXECUTION
PHASE: CORRECTION_REQUIRED
BASELINE: 83ff4668bd2a7401a933794668c16b7ea62c08e2
CURRENT_INBOX: .ai-bridge/inbox/BRIDGE-20260709-045-09-chatgpt.md
EXPECTED_OUTBOX: .ai-bridge/outbox/BRIDGE-20260709-045-10-codex.md
PRIMARY_WRITE_REQUIRED: true
ALLOW_VERIFIED_NO_DELTA: false
OBJECTIVE_GAP_PROOF: REQUIRED
PLUGIN_BOOTSTRAP_FALLBACK: AUTHORIZED
REMOTE_STATE_FRESHNESS: REQUIRED
THREAD_ROTATION_REQUIRED: true
FRESH_CODEX_CONVERSATION_REQUIRED: true
SAFARI_STATUS: N/A_PROCESS_ONLY
SUPERSEDES_EXECUTION_EPOCH: PLUGIN-E4-20260709-1908JST
REJECTED_TERMINAL_STATUS: BLOCKED_PLUGIN_UNAVAILABLE
REJECTION_VERDICT: REJECTED_STALE_REMOTE_STATE_AND_PLUGIN_BOOTSTRAP_DEADLOCK

Slot 2 remains the sole owner of this serialized process/plugin correction. Slots 1 and 3 remain closed.

The current command must read E5 directly from the freshly fetched remote mailbox ref. Any E3 or E4 identity is stale and must be discarded.

Because this task repairs the Asynchronia plugin itself, `SOURCE_PLUGIN_FALLBACK_BOOTSTRAP` is authorized from the exact source package on the pinned baseline when the installed package is stale, absent, malformed, or unloadable.

The source fallback must invoke the mandatory Asynchronia skills from source, then install version `1.0.4` beside the discovered older version without deleting or overwriting unrelated content.

Hidden plugin-loader telemetry is not required. The proof contract is exact remote source identity, source skill routing, installed path, manifest, inventory, checksums, runtime-gate absence, and positive/negative smokes.

`BLOCKED_PLUGIN_UNAVAILABLE` is not valid merely because installed `1.0.1` is stale. Genuine filesystem denial must use a complete published `BLOCKED_PLUGIN_INSTALL_PERMISSION` outbox.

`tools/validate-orchestration-policy.py` remains a mandatory source delta from blob `0145f14e622f6bc74a22ac3816357de706f326ef`.

No success or blocker handoff is valid until `.ai-bridge/outbox/BRIDGE-20260709-045-10-codex.md` exists remotely, passes the complete report schema, and matches the final user-visible response byte-for-byte.