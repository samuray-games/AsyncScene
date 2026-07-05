# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T15:26:00+09:00

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-020`
- Latest ChatGPT turn: `BRIDGE-20260705-020-01-chatgpt.md`
- Latest Codex turn: `BRIDGE-20260705-019-02-codex.md`
- Open threads: `BRIDGE-20260705-020`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`, `BRIDGE-20260705-006`, `BRIDGE-20260705-007`, `BRIDGE-20260705-008`, `BRIDGE-20260705-009`, `BRIDGE-20260705-011`, `BRIDGE-20260705-013`, `BRIDGE-20260705-014`, `BRIDGE-20260705-015`, `BRIDGE-20260705-017`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`, `BRIDGE-20260705-010`, `BRIDGE-20260705-012`, `BRIDGE-20260705-016`, `BRIDGE-20260705-018`, `BRIDGE-20260705-019`
- Next free thread id: `BRIDGE-20260705-021`

## Last closed task

- Task: `TASK-S6-001-R10`
- Status: `FAIL_WRONG_BRANCH_AND_WRONG_SMOKE_IDENTITY`
- Codex report commit on main: `4ca8d83bef052d87c0f69b3644ed787a7b40bce7`
- Preserved mailbox report commit: `4c117c55d03a91f94c11f4ad45f71e93ee9cb5de`
- Main recovery commit: `4d7111685a35b9cb13a88642f453a96633457bc8`
- Closure decision: `BRIDGE-20260705-019-03-chatgpt.md`
- Closure decision commit: `49a052d2c4a5269fffe40ae968de4409f08c4f21`
- Failure reason 1: Codex wrote the outbox to `main` despite primary write scope `NONE` and claimed it was mailbox-only.
- Failure reason 2: Codex incorrectly mapped historical z-profile Step 8 final acceptance to the later Step 6.5 aggregate. Current `docs/system.js` proves dedicated Step 8.12 runtime acceptance and Step 8.13 final acceptance smokes.
- Zoomer final-package documentation correction: `NOT AUTHORIZED`.

## Current task

- Task: `MAILBOX-BRANCH-GUARD-V1`
- Primary main: `4d7111685a35b9cb13a88642f453a96633457bc8`
- Scope: documentation/policy-only fail-closed guard preventing mailbox commits from main or any non-mailbox lineage
- Primary write scope after valid preflight and CONTINUE: `AGENTS.md`, `BRIDGE.md`
- Eventual mailbox write: `.ai-bridge/outbox/BRIDGE-20260705-020-02-codex.md`
- Model and reasoning: `UNSET - model-selector owns the independent 12/12 decision`
- Coordinator model preference: `NONE`
- Mandatory preflight: complete task-router and model-selector contracts plus exact current-thread plugin resolver/load evidence
- Runtime gate: `N/A - documentation/policy only`
- Safari smoke: `N/A`

## Incident guard requirement

Before any further Stage 6 task, the bridge must fail closed unless a mailbox outbox commit is proven to descend directly from the fetched remote mailbox head, change only the exact authorized mailbox path, push explicitly to `refs/heads/coordination/chatgpt-codex-bridge`, leave `origin/main` unchanged when primary write scope is `NONE`, and verify the remote mailbox head after push.

## Next action

Open a new Codex thread and write `проверь мост`. Accept only a valid `MODEL_PREFLIGHT_ONLY` response for `BRIDGE-20260705-020` with independent `12/12` model selection and current-thread plugin resolver/load evidence. Send `CONTINUE` in that same Codex thread only if the preflight is valid and ends with the exact fenced token.
