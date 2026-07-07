# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-07T12:47:00+09:00

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-022`
- Latest ChatGPT turn: `BRIDGE-20260705-022-01-chatgpt.md`
- Latest Codex turn: `NONE_ACCEPTED_FOR_THREAD_021`
- Open threads: `BRIDGE-20260705-022`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`, `BRIDGE-20260705-006`, `BRIDGE-20260705-007`, `BRIDGE-20260705-008`, `BRIDGE-20260705-009`, `BRIDGE-20260705-011`, `BRIDGE-20260705-013`, `BRIDGE-20260705-014`, `BRIDGE-20260705-015`, `BRIDGE-20260705-017`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`, `BRIDGE-20260705-010`, `BRIDGE-20260705-012`, `BRIDGE-20260705-016`, `BRIDGE-20260705-018`, `BRIDGE-20260705-019`, `BRIDGE-20260705-020`, `BRIDGE-20260705-021`
- Next free thread id: `BRIDGE-20260705-023`

## Last closed task

- Task: `MAILBOX-BRANCH-GUARD-V1-FIX1`
- Status: `FAIL_INCOMPLETE_SELF_HASH_FIX_NO_OUTBOX`
- Codex supplied report: claimed `PASS`, model `GPT-5.4-Mini / Light`, changed `AGENTS.md` and `BRIDGE.md`, but reported `commit: N/A`.
- Model status: `USER_SELECTED_UNVERIFIED`; Codex self-report is not active-model proof.
- Remote main nevertheless advanced to `4f26c72f9d1c49784a10b635007cc4c8f18767c6`.
- Primary parent: `f0d2825dfc403ec40c8b93381d6858862a6ae1bd`.
- Primary changed paths: exactly `AGENTS.md`, `BRIDGE.md`.
- Semantic failure: current policy still requires the immutable outbox to include its own mailbox commit SHA if created and verified remote mailbox head SHA after push.
- Mailbox failure: `.ai-bridge/outbox/BRIDGE-20260705-021-02-codex.md` does not exist.
- Closure decision: `BRIDGE-20260705-021-03-chatgpt.md`.
- Closure decision commit: `4ef79befc2d96df7a9ee0f1e1d8c11778ad2329d`.
- PR #187: open, unmerged, changes only `TASKS.md` and `PROJECT_MEMORY.md`; no overlap with the policy files.

## Current task

- Task: `MAILBOX-BRANCH-GUARD-V1-FIX2`
- Primary main: `4f26c72f9d1c49784a10b635007cc4c8f18767c6`
- Scope: documentation/policy-only removal of all requirements for an immutable outbox to contain its own final commit/head or post-publication main SHA
- Primary write scope after valid preflight and CONTINUE: `AGENTS.md`, `BRIDGE.md`
- Eventual mailbox write: `.ai-bridge/outbox/BRIDGE-20260705-022-02-codex.md`
- Model and reasoning: `UNSET - model-selector owns the independent 12/12 decision`
- Coordinator model preference: `NONE`
- Mandatory preflight: complete task-router and model-selector contracts plus exact current-thread plugin resolver/load evidence
- Runtime gate: `N/A - documentation/policy only`
- Safari smoke: `N/A - documentation/policy only`
- Deployment: `N/A - no served runtime artifact change`

## Fix2 acceptance rule

The guard must preserve mailbox branch identity, fetched-parent equality, direct-child ancestry, exact outbox path, explicit push, refetch, fail-closed behavior and main-state verification. The immutable outbox may contain only pre-commit evidence. ChatGPT independently resolves and records the final mailbox commit/head and post-publication main SHA in the closure decision. No thread closes PASS before that verification.

## Product-state note

The independently completed S6-010A1-A4 profile-persistence block remains accepted on exact product commit `15a4d952cc0a38c5260f3bf75eb040a0c72fba69`. PR #187 records that acceptance and remains open and unmerged. The bridge maintenance task must not touch or reinterpret those product changes.

## Next action

Open a new Codex thread and write `проверь мост`. Accept only a valid `MODEL_PREFLIGHT_ONLY` response for `BRIDGE-20260705-022` with independent `12/12` model selection and current-thread plugin resolver/load evidence. Send `CONTINUE` in that same Codex thread only if the preflight is valid and ends with the exact fenced token.
