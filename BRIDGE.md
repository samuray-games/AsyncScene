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
- Before a mailbox write, fetch `origin/coordination/chatgpt-codex-bridge` again, record that fetched remote head as the exact `MAILBOX_PARENT_COMMIT`, and fail closed if the remote head moved unexpectedly.
- Use a dedicated mailbox worktree or equivalently isolated checkout whose checked-out branch is exactly `coordination/chatgpt-codex-bridge`.
- Before editing, prove both that the current branch is exactly `coordination/chatgpt-codex-bridge` and that current `HEAD` equals the recorded `MAILBOX_PARENT_COMMIT`.
- Never create a mailbox commit while `HEAD`, the checked-out branch, or the commit parent belongs to `main`, the authorized primary baseline, a detached primary commit, or any non-mailbox branch.
- The mailbox commit must be a direct descendant of the recorded `MAILBOX_PARENT_COMMIT`.
- Before push, prove the commit diff contains only the exact mailbox path authorized by the active inbox.
- Push explicitly to `refs/heads/coordination/chatgpt-codex-bridge`, never to the current implicit upstream.
- Refetch after push and prove the remote mailbox head equals the new mailbox commit.
- When primary write scope is `NONE`, also prove `origin/main` still equals the authorized primary baseline.
- Any mismatch returns exactly `BLOCKED_MAILBOX_BRANCH_GUARD`; no mailbox commit, no push, no fallback to `main`, and no guessed repair.
- A claimed `mailbox outbox only` result is invalid unless the final report includes the mailbox parent SHA, the mailbox commit SHA if one was created, the verified remote mailbox head SHA after push, current `main` SHA before and after, the exact changed-path list, and an explicit statement that the mailbox commit is not based on `main`.
- A claimed mailbox outbox is only complete after the coordinator independently re-resolves the remote mailbox branch head post-push, verifies ancestry and exact-path scope, and records the exact mailbox commit/head SHA in the immutable closure decision.
- If a mailbox file is accidentally written to `main`, stop and report exactly `FAIL_MAILBOX_WRITTEN_TO_MAIN`.
- The only allowed mailbox changes are the exact outbox path required by the active inbox and any state update explicitly owned by ChatGPT, not Codex.

## Failure behavior

If `STATE.md`, the active inbox turn, the branch, or the required primary sources cannot be read:

- return `BLOCKED`;
- name the exact missing source;
- do not substitute a mirror audit, nearby task or guessed scope;
- do not modify files.
