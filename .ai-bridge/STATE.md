# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T04:11:00+09:00

## Current status

- Bridge status: `AUTOMATION_V1_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-004`
- Latest ChatGPT turn: `BRIDGE-20260705-004-01-chatgpt.md`
- Latest Codex turn: `BRIDGE-20260705-003-02-codex.md`
- Open threads: `BRIDGE-20260705-004`
- Superseded threads: `BRIDGE-20260705-002`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`

## Current primary-source note

- Live project memory observed by ChatGPT: `MEMORY_REV: 2026-07-05-0406-JST`.
- Current primary repository head verified by ChatGPT: `main` at `4071cdc3e0483c8d8d6dd4183f820d2d866ca19f`.
- `BRIDGE-20260705-004` is a bridge-maintenance thread for `AUTOMATION_V1` only.
- Its sole goal is to minimize manual relaying of Codex permission requests through safe Auto-review, narrow command rules, a fail-closed mailbox publish wrapper, an AUTO_SAFE lane, and a recurring Codex-side mailbox check where supported.
- It is unrelated to Alpha, Boomer, Stage 7, or product implementation/audit work.
- Inbox Turn 01 was published as commit `caf76d3ecbfecc7c87d13c6d39b5b88f6ea53bad`.
- The mailbox branch remains isolated from implementation and may change only `.ai-bridge/**` except for explicitly user-approved narrow Codex local configuration/rules performed by Codex after same-thread preflight continuation.

## Next action

In an existing or new Codex UI thread, tell Codex to check bridge thread `BRIDGE-20260705-004`. Codex must run `MODEL_PREFLIGHT_ONLY`, report the exact supported local approval/Auto-review/rules capabilities and anticipated permission prompts, then wait for valid same-thread `CONTINUE` before applying AUTOMATION_V1.
