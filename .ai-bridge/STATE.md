# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T09:13:00+09:00

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-008`
- Latest ChatGPT turn: `BRIDGE-20260705-008-01-chatgpt.md`
- Latest Codex turn: `BRIDGE-20260705-003-02-codex.md`
- Open threads: `BRIDGE-20260705-008`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`, `BRIDGE-20260705-006`, `BRIDGE-20260705-007`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`
- Next free thread id: `BRIDGE-20260705-009`

## Current primary-source note

- Live Project Memory last verified by ChatGPT: `MEMORY_REV: 2026-07-05-0857-JST`.
- Current primary repository head verified by ChatGPT: `main` at `e7eeb5113d25233d0314e9fa30a4eefbc2e1ca26`.
- Root `AGENTS.md` and `BRIDGE.md` remain repository-level guidance, but they cannot repair a stale local checkout before Codex loads project instructions.
- Official Codex behavior loads user-level instructions from `$CODEX_HOME/AGENTS.override.md` first, otherwise `$CODEX_HOME/AGENTS.md`.
- `CODEX_BRIDGE_BOOTSTRAP.md` defines the one-time idempotent global alias installation.
- `BRIDGE-20260705-008` is the only active task: `BRIDGE-BOOTSTRAP-V1`, status `WAITING_CODEX_MODEL_PREFLIGHT`.

## Routing rule before bootstrap is installed

- The short command `проверь мост` is not considered reliable until `BRIDGE-BOOTSTRAP-V1` receives PASS in a new Codex thread.
- The user must invoke the bootstrap once with the explicit bootstrap prompt provided by ChatGPT.
- Codex must not run a mirror audit or Stage 6 audit during bootstrap.
- All previous Stage 6 threads are superseded while bootstrap is active.

## Expected stable flow after bootstrap PASS

1. User opens a new Codex thread in AsyncScene and writes only `проверь мост`.
2. The global Codex instruction detects the exact command before project-level interpretation.
3. Codex fetches current `origin/main` and the mailbox branch, then reads remote `BRIDGE.md`, this STATE file and the sole active inbox.
4. Codex returns the phase requested by that inbox.
5. User selects the recommended model and sends same-thread `CONTINUE`.
6. User does not relay preflight to ChatGPT.
7. User returns to ChatGPT only after the final Codex report and writes `проверь мост`.

## Current task

- Task: `BRIDGE-BOOTSTRAP-V1`
- Active thread: `BRIDGE-20260705-008`
- Recommended model: `GPT-5.4-Mini / Medium` unless preflight proves a stronger model is necessary.
- Runtime gate: `N/A - Codex user instruction configuration only`.
- Expected native permission: one narrowly scoped write under Codex home, plus mailbox outbox publication.

## Next action

In a new Codex thread, use the one-time explicit bootstrap prompt supplied by ChatGPT. After MODEL_PREFLIGHT_ONLY, select the recommended model and send `CONTINUE` in the same thread. Do not return to ChatGPT until Codex publishes its final bootstrap report.