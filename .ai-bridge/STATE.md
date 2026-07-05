# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T08:19:00+09:00

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-006`
- Latest ChatGPT turn: `BRIDGE-20260705-006-01-chatgpt.md`
- Latest Codex turn: `BRIDGE-20260705-003-02-codex.md`
- Open threads: `BRIDGE-20260705-006`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`
- Next free thread id: `BRIDGE-20260705-007`

## Current primary-source note

- Live Project Memory last verified by ChatGPT: `MEMORY_REV: 2026-07-05-0809-JST`; re-read it before project actions.
- Current primary repository head verified by ChatGPT: `main` at `4071cdc3e0483c8d8d6dd4183f820d2d866ca19f`.
- `BRIDGE-20260705-004 / AUTOMATION_V1` was cancelled by the user and closed by `BRIDGE-20260705-004-03-chatgpt.md`. It must not be executed or answered.
- `BRIDGE-20260705-005` remains superseded and inactive.
- `BRIDGE-20260705-006` is the only active task: `TASK-S6-001-R1`, status `WAITING_CODEX_MODEL_PREFLIGHT`.
- Stage 6 is `Интерактивный язык / Tone Profiles`; caps and Living World work are outside this thread.
- The mailbox branch remains isolated from implementation and may change only `.ai-bridge/**`.

## Single-task routing rule

- The phrase `проверь мост` always resolves to the sole open thread listed in this STATE file.
- Codex must ignore every closed or superseded thread, even if an older Codex UI thread still contains its text.
- Codex must not propose, resume, implement or reply to any thread other than `BRIDGE-20260705-006`.
- Historical inbox/outbox files are immutable audit records, not queued work.

## Stage 6 low-touch mode

- Low-touch mode: `ACTIVE`.
- User command alias: `проверь мост`.
- Normal user actions: choose the recommended model in the Codex UI, send same-thread `CONTINUE`, run the exact Safari smoke command, and report the result to ChatGPT.
- Exceptional user action: same-thread `APPROVE` only when AGENTS.md requires it for an exact frozen runtime-sensitive scope.
- Read-only, canon, copy-decision, static-audit, documentation and mailbox tasks must not trigger a runtime gate.

## Stage 6 coordination

- Execution Plan: `https://docs.google.com/document/d/17YDaMlYRlJIRwOekm6gt1prDCDNCQvrXF5A2T7PbeUM/edit`
- Plan version: `S6-PLAN-2026-07-05-02`
- Control Board: `https://docs.google.com/document/d/1ywPtHLwi8yhXoQILcrElsKqv03y4S64N1alzlYdBRC0/edit`
- Control version: `S6-CONTROL-2026-07-05-02`
- Active wave: `WAVE-S6-0 BASELINE_AND_READ_ONLY_AUDIT`
- Active task: `TASK-S6-001-R1`
- Recommended Codex model: `GPT-5.4 / High`
- Runtime gate: `N/A - read-only audit`

## Next action

Open a new Codex UI thread and write only `проверь мост`. Codex must discover `BRIDGE-20260705-006` and return MODEL_PREFLIGHT_ONLY only. Do not run the audit before same-thread CONTINUE. Do not request APPROVE for this read-only task.