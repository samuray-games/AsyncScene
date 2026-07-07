# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-07T13:44:00+09:00
USER_COMMAND_ALIAS: мост
OLD_USER_COMMAND_ALIAS: SUPERSEDED

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-026`
- Latest ChatGPT turn: `BRIDGE-20260705-026-01-chatgpt.md`
- Latest Codex turn: `NONE_ACCEPTED_FOR_THREAD_026`
- Open threads: `BRIDGE-20260705-026`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`, `BRIDGE-20260705-006`, `BRIDGE-20260705-007`, `BRIDGE-20260705-008`, `BRIDGE-20260705-009`, `BRIDGE-20260705-011`, `BRIDGE-20260705-013`, `BRIDGE-20260705-014`, `BRIDGE-20260705-015`, `BRIDGE-20260705-017`, `BRIDGE-20260705-023`, `BRIDGE-20260705-024`, `BRIDGE-20260705-025`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`, `BRIDGE-20260705-010`, `BRIDGE-20260705-012`, `BRIDGE-20260705-016`, `BRIDGE-20260705-018`, `BRIDGE-20260705-019`, `BRIDGE-20260705-020`, `BRIDGE-20260705-021`, `BRIDGE-20260705-022`
- Next free thread id: `BRIDGE-20260705-027`

## Alias migration state

- Exact command for ChatGPT and Codex: `мост`.
- The former command is superseded and must not be presented as active.
- ChatGPT project memory and Control Board already use `мост`.
- Main `BRIDGE.md` uses `мост` on commit `1f4e8cf26bea8ca7494ea727fcca317b5c7f8f27`.
- Root `AGENTS.md`, `CODEX_BRIDGE_BOOTSTRAP.md`, and the active local user-level Codex instruction file still require migration.
- Thread 025 was superseded because it mixed alias migration with the broader Fix3 policy task and did not authorize the local Codex instruction file.

## Current task

- Task: `BRIDGE-ALIAS-V2-MIGRATION`
- Primary main: `1f4e8cf26bea8ca7494ea727fcca317b5c7f8f27`
- Primary repository write scope after valid preflight and CONTINUE: `AGENTS.md`, `CODEX_BRIDGE_BOOTSTRAP.md`
- Local configuration scope: selected active instruction file under `${CODEX_HOME:-$HOME/.codex}` and one timestamped backup when applicable
- Eventual mailbox write: `.ai-bridge/outbox/BRIDGE-20260705-026-02-codex.md`
- Inbox creation commit: `1f6e28a70ad5be5ec2695bbea19ff10793a4f40d`
- Model and reasoning: `UNSET - model-selector owns the independent 12/12 decision`
- Runtime gate: `N/A - policy and local configuration only`
- Safari smoke: `N/A - no runtime surface`
- Deployment: `N/A - no served runtime artifact change`

## Deferred task

After alias migration acceptance, resume `MAILBOX-BRANCH-GUARD-V1-FIX3-PUBLICATION-SYNC` without reopening accepted S6-010A4.

## Product-state note

The accepted S6-010A1-A4 block remains unchanged on product commit `15a4d952cc0a38c5260f3bf75eb040a0c72fba69`. PR #187 remains open and unmerged.

## Next action

Because the local global alias has not yet been migrated, invoke the current Codex task once with the explicit instruction `Открой BRIDGE.md и выполни текущую задачу.` Accept only the MODEL_PREFLIGHT_ONLY response for thread `BRIDGE-20260705-026`. After migration PASS, all new Codex and ChatGPT threads use only `мост`.
