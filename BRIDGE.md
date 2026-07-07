# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 2.0

This is the stable entry point for the ChatGPT-Codex mailbox bridge.

## User command

When the user's trimmed message is exactly:

`мост`

follow this procedure before any other interpretation.

## Discovery

1. Read root `AGENTS.md`.
2. Fetch current remote refs without switching or rewriting the primary worktree:

```bash
git fetch origin main coordination/chatgpt-codex-bridge
```

3. Read the authoritative bridge state:

```bash
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

4. Ignore every lane listed as closed, superseded, blocked or completed.
5. Historical mailbox files are immutable audit records, not queued work.

## Existing claim in the same Codex thread

If this Codex thread already created a valid claim and retained its `CLAIM_TOKEN`:

1. locate the claimed lane in current `STATE.md`;
2. read the immutable claim file and lane inbox from the mailbox branch;
3. verify thread id, claim token, primary baseline, task id, phase and scope remain unchanged;
4. continue only that lane;
5. if the lane was closed, superseded or changed, return `BLOCKED_CLAIM_STALE` and do not select a replacement lane in the same Codex thread.

## New Codex thread: atomic lane claim

A new Codex thread does not ask the user to choose a lane. It atomically claims the first eligible unclaimed lane in the exact priority order listed under `Open lanes` in `STATE.md`.

For each candidate lane:

1. read its inbox path, predetermined claim path and authorized primary baseline from `STATE.md`;
2. check that the claim path does not exist on the fetched mailbox head;
3. generate a high-entropy `CLAIM_TOKEN` and retain it in the current Codex thread;
4. create exactly the predetermined immutable claim file containing:
   - thread id;
   - task id;
   - lane id;
   - claim token;
   - mailbox parent SHA known before commit;
   - authorized primary baseline;
   - exact inbox path;
   - statement that this claim authorizes no primary write;
5. commit and push that single claim path using the mailbox branch guard below;
6. refetch and verify the remote claim file equals the created claim;
7. read the lane inbox and perform only its current phase.

If the claim path appears or the mailbox remote head moves before push, do not overwrite or force-push. Refetch the mailbox branch, re-read `STATE.md`, and try the next eligible unclaimed lane. Maximum three claim attempts. If no eligible lane remains, return exactly `BRIDGE_NO_UNCLAIMED_LANES` and make no further changes.

A claim reserves only one lane for one Codex thread. It is not task execution, model approval, runtime approval, PASS or coordinator acceptance.

## Model preflight

When the lane inbox requires `MODEL_PREFLIGHT_ONLY`:

1. invoke the required Asynchronia plugin workflow and provide current-thread plugin-load evidence;
2. perform only preflight, not the audit or implementation;
3. recommend the cheapest reliable available model and reasoning level;
4. state exact read scope, expected write scope, dependencies, runtime classification, permissions and blockers;
5. include lane id and retained claim token;
6. end with exactly one standalone fenced text code block containing only `CONTINUE`, with no text after it.

```text
CONTINUE
```

After the user selects the model and sends `CONTINUE` in the same Codex thread:

1. refetch `main` and the mailbox branch;
2. re-read current `STATE.md`, the immutable claim and the same lane inbox;
3. verify claim token, task, baseline, scope, dependencies and phase remain unchanged;
4. execute only the authorized lane;
5. publish only the immutable outbox path authorized by that lane;
6. do not ask the user to relay reports to ChatGPT. ChatGPT independently reads and verifies all lanes when the user writes `мост` there.

## Runtime safety and parallel boundaries

- Follow `AGENTS.md` and `runtime-safety-gate` exactly.
- Read-only lanes do not request `APPROVE`.
- Runtime-sensitive writes require a frozen exact scope and same-thread `APPROVE`.
- Source and deployed mirrors are one ownership lane.
- Overlapping writes, stable-read dependencies, shared resolver paths, `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized.
- A lane must stop with `BLOCKED_PARALLEL_SCOPE_COLLISION` if current repository evidence creates an overlap not declared in its inbox.
- Never merge, rebase or absorb another lane unless a dedicated integration lane authorizes it.

## Mailbox branch guard

Every Codex mailbox write, including claims and outboxes, must:

1. fetch `origin/coordination/chatgpt-codex-bridge` immediately before writing;
2. record the fetched head as `MAILBOX_PARENT_COMMIT`;
3. use a dedicated mailbox worktree or equivalent isolated checkout on exactly `coordination/chatgpt-codex-bridge`;
4. prove current branch is exactly that mailbox branch and `HEAD` equals `MAILBOX_PARENT_COMMIT`;
5. prove the diff contains exactly one authorized claim or outbox path;
6. create a direct-child commit of the recorded parent;
7. push explicitly to `refs/heads/coordination/chatgpt-codex-bridge`;
8. refetch and prove remote mailbox head equals the new commit.

Never create a mailbox commit from `main`, a detached primary commit, an authorized primary baseline or any non-mailbox branch. Never overwrite an inbox, claim or outbox. Never modify another lane. Never force-push.

When the lane has primary write scope `NONE`, also prove `origin/main` still equals its authorized baseline. Any mismatch returns exactly `BLOCKED_MAILBOX_BRANCH_GUARD`, with no mailbox commit, no fallback and no guessed repair. If any mailbox file reaches `main`, return exactly `FAIL_MAILBOX_WRITTEN_TO_MAIN`.

The immutable claim/outbox may record only facts known before its own commit plus mandatory post-push verification statements. ChatGPT independently resolves final mailbox commit/head, ancestry, exact paths and post-publication main, then records those facts in immutable closure decisions.

## Failure behavior

If `STATE.md`, a lane inbox, claim, branch or required primary source cannot be read:

- return `BLOCKED` with the exact missing source;
- do not substitute a nearby task or guessed scope;
- do not modify primary files;
- do not claim or execute a different lane after an existing same-thread claim becomes stale.
