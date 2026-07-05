# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T08:06:00+09:00

## Current status

- Bridge status: `MULTI_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-006`
- Latest ChatGPT turn: `BRIDGE-20260705-006-01-chatgpt.md`
- Latest Codex turn: `BRIDGE-20260705-003-02-codex.md`
- Open threads: `BRIDGE-20260705-004`, `BRIDGE-20260705-006`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`
- Next free thread id: `BRIDGE-20260705-007`

## Current primary-source note

- Live Project Memory verified by ChatGPT: `MEMORY_REV: 2026-07-05-0752-JST`.
- Current primary repository head verified by ChatGPT: `main` at `4071cdc3e0483c8d6dd4183f820d2d866ca19f`.
- `BRIDGE-20260705-004` remains an independent `AUTOMATION_V1` maintenance thread with status `WAITING_CODEX`.
- `BRIDGE-20260705-005` is superseded because the Codex UI response did not publish an outbox and performed an incomplete two-file mirror audit instead of MODEL_PREFLIGHT_ONLY for the full Stage 6 reconciliation scope.
- `BRIDGE-20260705-006` is the canonical Stage 6 correction task `TASK-S6-001-R1`, status `WAITING_CODEX_MODEL_PREFLIGHT`.
- Stage 6 is `Интерактивный язык / Tone Profiles`; caps and Living World work are outside this thread.
- The mailbox branch remains isolated from implementation and may change only `.ai-bridge/**`.

## Stage 6 low-touch mode

- Low-touch mode: `ACTIVE`.
- User command alias: `проверь мост`.
- On that command, Codex must read this STATE file, identify the current open Stage 6 thread and execute only its current required phase.
- Codex must not ask the user to paste thread IDs, inbox bodies, file lists, locks, commits, build tags or smoke versions when those are available in the mailbox or primary repository.
- Normal user actions: choose the recommended model in the Codex UI, send same-thread `CONTINUE`, run the exact Safari smoke command, and report the result to ChatGPT.
- Exceptional user action: same-thread `APPROVE` only when AGENTS.md requires it for an exact frozen runtime-sensitive scope.
- Read-only, canon, copy-decision, static-audit, documentation and mailbox tasks must not trigger a runtime gate.
- Compatible runtime presentation edits should be consolidated only when atomicity, mirror ownership, UI/logic separation and a single serialized slot are proven. Safety rules must not be weakened merely to reduce approvals.

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

The user writes only `проверь мост` in the Codex UI. Codex must discover `BRIDGE-20260705-006` through this STATE file and return MODEL_PREFLIGHT_ONLY only. Do not run the audit before same-thread CONTINUE. Do not request APPROVE for this read-only task. Thread `BRIDGE-20260705-004` may continue independently in its own Codex UI thread.