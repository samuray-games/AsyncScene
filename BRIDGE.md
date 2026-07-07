# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 2.3

## Commands

The only normal bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

Each number selects one fixed slot. Never substitute another slot. Bare `мост` is inactive.

## Remote-first discovery

For every numbered command:

1. verify `origin` belongs to `samuray-games/AsyncScene`;
2. fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
3. read current policy with:

```bash
git show origin/main:AGENTS.override.md
git show origin/main:AGENTS.md
git show origin/main:BRIDGE.md
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

4. parse slot `1`, `2`, or `3`;
5. read only that slot's task inbox, current baseline inbox, claim path, expected outbox, and authorized primary baseline;
6. ignore local bridge files, historical mailbox turns, and every other slot.

A missing local `.ai-bridge/STATE.md`, dirty local policy files, or unrelated dirty files are not blockers when the remote sources are readable.

## Asynchronia skill contracts

Do not require plugin-loader telemetry.

Resolve skill contracts from:

1. installed package cache, when manifest package `asynchronia` version `1.0.0` and required skills are readable; or
2. `origin/main:plugins/asynchronia/...` as the automatic repository fallback.

Required bridge skills:

- `task-router`;
- `runtime-safety-gate`;
- `parallel-scope-planner` when several slots exist;
- `model-selector`.

Report the selected source as `INSTALLED_PACKAGE` or `REPOSITORY_FALLBACK`, manifest version, and exact paths. Do not return `BLOCKED_PLUGIN_NOT_LOADED` for bridge work.

## Existing claim

When the current Codex thread already owns a valid claim token:

1. verify the claim belongs to the requested slot;
2. read the immutable claim and current inbox;
3. verify slot, token, baseline, task, phase, scope, and dependencies remain unchanged;
4. continue only that lane;
5. return `BLOCKED_CLAIM_STALE` when they changed.

## New claim

For a new thread:

1. verify the requested slot is open and unclaimed;
2. return `BRIDGE_SLOT_UNAVAILABLE` when it has no active lane;
3. return `BRIDGE_SLOT_ALREADY_CLAIMED` when its claim exists;
4. verify `origin/main` equals the slot's authorized primary baseline;
5. generate a high-entropy `CLAIM_TOKEN`;
6. create exactly the predetermined immutable claim file containing:
   - bridge slot;
   - thread id;
   - task id;
   - lane id;
   - actual claim token;
   - mailbox parent SHA;
   - authorized primary baseline;
   - exact task and baseline inbox paths;
   - statement that the claim authorizes no primary write;
7. publish the claim with the resilient mailbox guard;
8. refetch and verify the remote claim;
9. return claim token and claim path as separate fields.

## Resilient mailbox guard

Immediately before each claim or outbox write:

1. fetch `origin/coordination/chatgpt-codex-bridge`;
2. record the remote head as `MAILBOX_PARENT_COMMIT`;
3. prove the authorized path does not already exist;
4. use either a clean existing checkout already at the parent, or a fresh temporary detached worktree at the parent.

Fresh detached mode:

```bash
git worktree add --detach <temporary-path> "$MAILBOX_PARENT_COMMIT"
```

Inside that temporary worktree:

1. write only the authorized claim or outbox path;
2. commit in detached HEAD;
3. prove the commit parent equals `MAILBOX_PARENT_COMMIT`;
4. prove the commit changes exactly one authorized path;
5. push without force:

```bash
git push origin HEAD:refs/heads/coordination/chatgpt-codex-bridge
```

6. refetch and prove remote mailbox head equals the new commit;
7. remove the temporary worktree.

A stale pre-existing mailbox worktree must be ignored and preserved. Never reset, clean, update, delete, or reuse it. If the push loses a race, remove only the temporary worktree, refetch, and retry the same slot up to three times. After three races return `BLOCKED_MAILBOX_RACE_RETRY_LIMIT`.

Never force-push, overwrite immutable paths, or write mailbox files to `main`.

## Compact model preflight

When the slot phase is `MODEL_PREFLIGHT_ONLY`, return:

- bridge slot, thread id, lane id, task id;
- actual claim token and claim path;
- Asynchronia skill source and version;
- task classification;
- runtime-safety verdict;
- parallel collision verdict;
- `evaluated pair count: 12/12`;
- recommended model and reasoning;
- why the next cheaper pair is insufficient;
- why the next stronger pair is unnecessary;
- exact read scope, write scope, dependencies, blockers;
- actual active model: `USER_SELECTED_UNVERIFIED` unless externally proven.

Do not print the full 12-row matrix. The relevant cost frontier is sufficient.

A valid response ends with exactly one standalone fenced block and nothing after it:

```text
CONTINUE
```

A blocked response contains no `CONTINUE`.

## After CONTINUE

After the user selects the recommended model and sends `CONTINUE` in the same thread:

1. refetch main and mailbox;
2. re-read STATE, claim, task inbox, and baseline inbox;
3. verify token, baseline, task, phase, scope, and dependencies;
4. execute only the authorized lane;
5. publish only the expected immutable outbox with the resilient mailbox guard;
6. tell the user to return to ChatGPT and write the same numbered command.

Do not ask the user to paste the report.

## Parallel and runtime boundaries

- Read-only lanes do not request `APPROVE`.
- Runtime-sensitive writes require frozen scope and same-thread `APPROVE`.
- Source and deployed mirrors are one ownership lane.
- Shared resolvers, `dev-checks.js`, smoke registries, exports, globals, boot wiring, and aggregate smoke are serialized.
- Undeclared overlap returns `BLOCKED_PARALLEL_SCOPE_COLLISION`.
- Never merge, rebase, or absorb another lane without an integration task.

## ChatGPT verification

When ChatGPT receives `мост N`, it verifies only Slot N by reloading live memory, reading current STATE, resolving that slot's claim/inbox/outbox, independently checking repository and mailbox facts, and then closing, correcting, or advancing only that slot.
