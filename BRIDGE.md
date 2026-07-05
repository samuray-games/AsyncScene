# Asynchronia Codex Bridge Entry Point

This file is the stable entry point for the ChatGPT-Codex mailbox bridge.

## User command

When the user says:

`Открой BRIDGE.md и выполни текущую задачу.`

follow this procedure exactly.

## Bridge discovery

1. Read the root `AGENTS.md` first.
2. Do not guess what the word "мост" means and do not run a generic mirror audit.
3. Fetch the mailbox branch without switching the primary worktree:

```bash
git fetch origin coordination/chatgpt-codex-bridge
```

4. Read the current mailbox state from the fetched remote branch:

```bash
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

5. Identify the sole thread listed under `Open threads`.
6. Read the `Latest ChatGPT turn` named in `STATE.md` from the same remote branch:

```bash
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/inbox/<LATEST_CHATGPT_TURN>
```

7. Execute only the current phase requested by that inbox turn.
8. Ignore every thread listed as `Closed` or `Superseded`.
9. Historical mailbox files are audit records, not queued work.

## Model preflight flow

When the active inbox requires `MODEL_PREFLIGHT_ONLY`:

1. Perform only the preflight described by the active inbox.
2. Do not run the requested audit or implementation yet.
3. Recommend the cheapest reliable available model and reasoning level.
4. State the planned read scope, expected write scope, gates, permissions and blockers.
5. End with exactly one standalone fenced text code block containing only `CONTINUE`, with no text after it. Do not render `CONTINUE` as inline code, prose, a bullet, a heading, a quote, or an unfenced line.

```text
CONTINUE
```

After the user selects the recommended model and sends `CONTINUE` in the same Codex thread:

1. Re-read the current mailbox `STATE.md` and the same active inbox.
2. Verify that the active thread, task, baseline and scope have not been superseded.
3. Execute only that authorized task.
4. Publish the required immutable outbox turn on `coordination/chatgpt-codex-bridge` if the inbox requires one.
5. Do not ask the user to relay the preflight or final report to ChatGPT. ChatGPT reads the mailbox directly when the user later says `проверь мост` there.

## Runtime safety

- Follow `AGENTS.md` runtime-safety-gate exactly.
- For a read-only task, do not request `APPROVE`.
- For a proven runtime-sensitive write, stop with `RUNTIME_SAFETY_GATE_REQUIRED` and request same-thread `APPROVE` for the exact frozen file scope. End that response with exactly one standalone fenced text code block containing only `APPROVE`, with no text after it. Do not render `APPROVE` as inline code, prose, a bullet, a heading, a quote, or an unfenced line.
- Never reinterpret a small runtime change as documentation merely to avoid the gate.

## Mailbox write rules

- Never edit primary product files while operating only the mailbox.
- Never overwrite an existing inbox or outbox turn.
- Never modify another thread.
- Never force-push.
- Before a mailbox write, fetch the mailbox branch again and fail closed if the remote head moved unexpectedly.
- The only allowed mailbox changes are the exact outbox path required by the active inbox and any state update explicitly owned by ChatGPT, not Codex.

## Failure behavior

If `STATE.md`, the active inbox turn, the branch, or the required primary sources cannot be read:

- return `BLOCKED`;
- name the exact missing source;
- do not substitute a mirror audit, nearby task or guessed scope;
- do not modify files.
