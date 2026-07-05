# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T08:53:00+09:00

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-007`
- Latest ChatGPT turn: `BRIDGE-20260705-007-01-chatgpt.md`
- Latest Codex turn: `BRIDGE-20260705-003-02-codex.md`
- Open threads: `BRIDGE-20260705-007`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`, `BRIDGE-20260705-006`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`
- Next free thread id: `BRIDGE-20260705-008`

## Current primary-source note

- Live Project Memory last verified by ChatGPT: `MEMORY_REV: 2026-07-05-0845-JST`.
- Current primary repository head verified by ChatGPT: `main` at `d54879675e4c6bccbb257cdf131a6d0c0759ddc5`.
- Root `AGENTS.md` reserves the exact command `проверь мост` and routes it to root `BRIDGE.md`.
- Root `BRIDGE.md` defines mailbox discovery, model preflight and zero-relay execution.
- `BRIDGE-20260705-007` is the only active task: `TASK-S6-001-R2`, status `WAITING_CODEX_MODEL_PREFLIGHT`.

## Routing rule

- In Codex, the user may write only `проверь мост`.
- AGENTS.md requires Codex to open BRIDGE.md before any other interpretation.
- Codex must not interpret this phrase as a generic mirror audit.
- Codex must ignore all closed and superseded threads.
- Historical mailbox files are immutable audit records, not queued work.

## Zero-relay flow

1. User writes `проверь мост` in a new Codex thread.
2. Codex reads AGENTS.md, BRIDGE.md, this STATE file and the sole active inbox.
3. Codex returns MODEL_PREFLIGHT_ONLY.
4. User selects the recommended model and sends `CONTINUE` in the same thread.
5. User does not relay the preflight to ChatGPT.
6. Codex completes the task and publishes the required outbox.
7. User returns to ChatGPT after the final Codex report and writes `проверь мост`.
8. APPROVE is used only for a proven runtime-sensitive task. The current task is read-only and requires no APPROVE.

## Stage 6 coordination

- Active wave: `WAVE-S6-0 BASELINE_AND_READ_ONLY_AUDIT`
- Active task: `TASK-S6-001-R2`
- Recommended Codex model: `GPT-5.4 / High`
- Runtime gate: `N/A - read-only audit`

## Next action

Open a new Codex thread and write only `проверь мост`. After MODEL_PREFLIGHT_ONLY, select the recommended model and immediately send `CONTINUE` in the same thread. Return to ChatGPT only after Codex finishes the task.