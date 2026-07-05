# Bridge State

BRIDGE_PROTOCOL: 1.0
MAILBOX_BRANCH: coordination/chatgpt-codex-bridge
STATE_OWNER: CHATGPT
STATE_UPDATED_AT: 2026-07-05T10:37:00+09:00

## Current status

- Bridge status: `SINGLE_THREAD_WAITING_CODEX`
- Latest ChatGPT thread: `BRIDGE-20260705-009`
- Latest ChatGPT turn: `BRIDGE-20260705-009-01-chatgpt.md`
- Latest Codex turn: `BRIDGE-20260705-003-02-codex.md`
- Open threads: `BRIDGE-20260705-009`
- Superseded threads: `BRIDGE-20260705-002`, `BRIDGE-20260705-005`, `BRIDGE-20260705-006`, `BRIDGE-20260705-007`, `BRIDGE-20260705-008`
- Closed threads: `BRIDGE-20260705-001`, `BRIDGE-20260705-003`, `BRIDGE-20260705-004`
- Next free thread id: `BRIDGE-20260705-010`

## Current primary-source note

- Live Project Memory last verified by ChatGPT: `MEMORY_REV: 2026-07-05-0915-JST`.
- Current primary repository head verified by ChatGPT: `main` at `e7eeb5113d25233d0314e9fa30a4eefbc2e1ca26`.
- Root `AGENTS.md` contains the exact `проверь мост` alias and root `BRIDGE.md` defines mailbox discovery.
- The user's repeated failures were consistent with a stale local checkout that had not pulled the new root instructions.
- Temporary global bootstrap thread `BRIDGE-20260705-008` is superseded and must not run.
- `BRIDGE-20260705-009` is the only active task: `TASK-S6-001-R3`, status `WAITING_CODEX_MODEL_PREFLIGHT`.

## Required local synchronization before using the alias

On the Mac that contains `/Users/User/Documents/created apps/AsyncScene`, update the local checkout safely:

```bash
cd "/Users/User/Documents/created apps/AsyncScene"
if [ -n "$(git status --porcelain)" ]; then
  echo "STOP_DIRTY_WORKTREE"
  git status --short --branch
  exit 1
fi
git fetch origin
git switch main
git pull --ff-only origin main
git fetch origin coordination/chatgpt-codex-bridge
git rev-parse HEAD
```

Expected current main after a successful pull: `e7eeb5113d25233d0314e9fa30a4eefbc2e1ca26` or a newer verified main commit.

## Stable zero-relay flow after local pull

1. Open a new Codex thread in the AsyncScene project.
2. Write only `проверь мост`.
3. Codex reads the newly pulled local `AGENTS.md`, then remote `BRIDGE.md`, this STATE file and the sole active inbox.
4. Codex returns `MODEL_PREFLIGHT_ONLY`.
5. User selects the recommended model and sends same-thread `CONTINUE`.
6. User does not relay the preflight to ChatGPT.
7. Codex completes the task and publishes the required outbox.
8. User returns to ChatGPT only after the final Codex report and writes `проверь мост`.

## Current task

- Task: `TASK-S6-001-R3`
- Active thread: `BRIDGE-20260705-009`
- Recommended model: `GPT-5.4 / High`
- Runtime gate: `N/A - read-only audit`

## Next action

Pull the local Mac checkout using the safe commands above. Then open a new Codex thread and write only `проверь мост`. After `MODEL_PREFLIGHT_ONLY`, select the recommended model and immediately send `CONTINUE`.