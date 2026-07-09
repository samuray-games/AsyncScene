# Codex Bridge Bootstrap

BOOTSTRAP_ID: ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V3_3
BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
PURPOSE: Permanently route `мост 1`, `мост 2`, and `мост 3` through current remote machine state.

## Installation

Use `tools/install-codex-bridge-alias.py`. It preserves unrelated user-level instructions, writes one timestamped backup, replaces one older managed block, and fails on malformed or duplicate markers.

The installer targets `${CODEX_HOME:-$HOME/.codex}/AGENTS.override.md` when present, otherwise `AGENTS.md`.

## Required managed behavior

The installed block must:

- recognize only the three numbered commands;
- ignore prior conversation completion and local mailbox copies;
- use exact destination refspec fetches;
- run the current remote `tools/bridge-slot-envelope.py`;
- require `BRIDGE_CONTRACT_RESOLVED` before execution;
- preserve `contractDigest` and authority blob SHAs;
- re-resolve immediately before publication;
- stop on digest or generation movement;
- publish one exact outbox path;
- require `OUTBOX_VERIFIED` before success;
- prohibit historical outbox reuse, manual SHA transcription, model-selection stops and continuation tokens.

## Migration

Any V2.x or V3.0-V3.2 managed block is stale because it lacks the Protocol 3.3 machine-state and remote-ref proof. Run the installer once, then open a fresh Codex conversation.

Successful status: `PASS_BRIDGE_ALIAS_V3_3_INSTALLED`.
