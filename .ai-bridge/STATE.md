# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T08:31:00+09:00

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

- Live Project Memory verified by ChatGPT: `MEMORY_REV: 2026-07-05-0821-JST`.
- Current primary repository head verified by ChatGPT: `main` at `4071cdc3e0483c8d8d6dd4183f820d2d866ca19f`.
- `BRIDGE-20260705-004 / AUTOMATION_V1` was cancelled and closed. It must not be executed or answered.
- `BRIDGE-20260705-005` is superseded and inactive.
- `BRIDGE-20260705-006` is the only active task: `TASK-S6-001-R1`, status `WAITING_CODEX_MODEL_PREFLIGHT`.
- Stage 6 is `Интерактивный язык / Tone Profiles`.

## Single-task routing rule

- The phrase `проверь мост` always resolves to the sole open thread in this STATE file.
- Codex must ignore every closed or superseded thread.
- Historical inbox/outbox files are immutable audit records, not queued work.

## Zero-relay user flow

1. The user opens Codex and writes only `проверь мост`.
2. Codex reads STATE.md, finds `BRIDGE-20260705-006`, and returns MODEL_PREFLIGHT_ONLY.
3. The user selects the model recommended by Codex in the UI.
4. The user immediately sends `CONTINUE` in the same Codex thread.
5. The user does not copy or relay the preflight to ChatGPT.
6. Codex performs the task, publishes the required outbox, and gives its final report.
7. Only after the final report does the user return to ChatGPT and write `проверь мост`.
8. ChatGPT then reads the outbox and primary sources, accepts/rejects the result, updates coordination state, and publishes the next task.
9. `APPROVE` is requested only if AGENTS.md requires it for an exact frozen runtime-sensitive scope.
10. Safari smoke is run only when ChatGPT supplies the exact command after verifying implementation.

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

Open a new Codex UI thread and write only `проверь мост`. After MODEL_PREFLIGHT_ONLY, select the recommended model and immediately send `CONTINUE` in the same thread. Do not relay the preflight to ChatGPT. Return to ChatGPT only after Codex finishes the task and publishes its final report.