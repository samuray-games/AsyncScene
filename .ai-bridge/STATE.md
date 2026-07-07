# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-07T13:35:00+09:00
USER_COMMAND_ALIAS: мост
OLD_USER_COMMAND_ALIAS: проверь мост - SUPERSEDED

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-025`
- Latest ChatGPT turn: `BRIDGE-20260705-025-01-chatgpt.md`
- Latest Codex turn: `NONE_ACCEPTED_FOR_THREAD_025`
- Open threads: `BRIDGE-20260705-025`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`, `BRIDGE-20260705-006`, `BRIDGE-20260705-007`, `BRIDGE-20260705-008`, `BRIDGE-20260705-009`, `BRIDGE-20260705-011`, `BRIDGE-20260705-013`, `BRIDGE-20260705-014`, `BRIDGE-20260705-015`, `BRIDGE-20260705-017`, `BRIDGE-20260705-023`, `BRIDGE-20260705-024`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`, `BRIDGE-20260705-010`, `BRIDGE-20260705-012`, `BRIDGE-20260705-016`, `BRIDGE-20260705-018`, `BRIDGE-20260705-019`, `BRIDGE-20260705-020`, `BRIDGE-20260705-021`, `BRIDGE-20260705-022`
- Next free thread id: `BRIDGE-20260705-026`

## Alias migration

- Exact command for ChatGPT and Codex: `мост`.
- Former command `проверь мост` is superseded and must not be presented as active.
- Repository `BRIDGE.md` was updated on main by merged PR #188.
- Alias publication commit: `1f4e8cf26bea8ca7494ea727fcca317b5c7f8f27`.
- Root `AGENTS.md` still contains the former wording and must be corrected by the active policy task because direct coordinator replacement was not completed.
- User-level Codex alias lives on the user's Mac and requires one migration run before a new Codex thread can reliably recognize `мост` globally.

## Corrected last closed task

- Task: `MAILBOX-BRANCH-GUARD-V1-FIX2`
- Corrected status: `FAIL_INCOMPLETE_FIX_NO_OUTBOX_AFTER_USER_PUBLICATION`
- Valid Codex preflight and same-thread `CONTINUE` occurred.
- Codex completed edits with `commit: N/A`; the user published them afterward as `c3e2bcccf982934c46d1ac12a3250576ad89e647`.
- Remaining failure: incomplete outbox evidence contract and absent thread 022 outbox.

## Current task

- Task: `MAILBOX-BRANCH-GUARD-V1-FIX3-PUBLICATION-SYNC`
- Primary main: `1f4e8cf26bea8ca7494ea727fcca317b5c7f8f27`
- Scope: complete the outbox evidence contract, synchronize edit/publication reporting, and fold exact alias `мост` into `AGENTS.md`
- Primary write scope after valid preflight and CONTINUE: `AGENTS.md`, `BRIDGE.md`
- Eventual mailbox write: `.ai-bridge/outbox/BRIDGE-20260705-025-02-codex.md`
- Model and reasoning: `UNSET - model-selector owns the independent 12/12 decision`
- Runtime gate: `N/A - documentation/policy only`
- Safari smoke: `N/A - documentation/policy only`
- Deployment: `N/A - no served runtime artifact change`

## Publication synchronization rule

A Codex final response and later user publication are separate lifecycle moments. `commit: N/A` is valid before user publication. After publication ChatGPT resolves the user-published commit and verifies exact paths and ancestry.

## Product-state note

The accepted S6-010A1-A4 block remains unchanged on product commit `15a4d952cc0a38c5260f3bf75eb040a0c72fba69`. PR #187 remains open and unmerged.

## Next action

For ChatGPT, use only `мост` immediately. For Codex global recognition, perform the one-time alias migration in the current Codex context, then open a new Codex thread and use only `мост`. The active bridge task is thread `BRIDGE-20260705-025`.
