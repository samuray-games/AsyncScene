# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 2.4

## Commands

The only normal bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

Each number selects one fixed slot. Never substitute another slot. Bare `мост` is inactive.

## Universal Git transport commands

Inside any bridge thread, the exact trimmed commands are:

- `пул` - read current `origin/main:GIT_PULL.md` and safely refresh refs or fast-forward only the exact authorized branch;
- `пуш` - read current `origin/main:GIT_PUSH.md` and publish only the exact authorized target.

The former commands `запуль` and `запушь` are inactive.

`пуш` supports both a normal authorized branch and a detached mailbox commit when the destination ref is exact, the commit is a direct child of the freshly fetched remote head, only the authorized mailbox path changed, and the push is fast-forward without force. Detached HEAD alone is not a blocker.

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
5. read the slot's original task inbox, `Current baseline inbox`, claim path, expected outbox, and authorized primary baseline;
6. ignore local bridge files and every other slot.

A missing local `.ai-bridge/STATE.md`, dirty local policy files, or unrelated dirty files are not blockers when remote sources are readable.

## Slot metadata precedence

Mutable slot metadata is resolved in this order:

1. current `origin/main` policy;
2. mailbox `STATE.md`;
3. the exact `Current baseline inbox` named by STATE;
4. immutable claim, when present;
5. original task inbox only for the atomic objective and evidence requirements not replaced by the current baseline inbox;
6. older inbox turns for audit history only.

When the original task inbox contains an older baseline, protocol version, plugin proof rule, phase, or publication method, the current baseline inbox supersedes it. Historical disagreement must be listed as drift, but it must not block the slot.

## Asynchronia skill contracts

Do not require plugin-loader telemetry.

Resolve skill contracts from:

1. installed package cache when manifest package `asynchronia` version `1.0.0` and required skills are readable; or
2. `origin/main:plugins/asynchronia/...` as automatic fallback.

Required bridge skills are `task-router`, `runtime-safety-gate`, `parallel-scope-planner`, and `model-selector`.

Report `INSTALLED_PACKAGE` or `REPOSITORY_FALLBACK`, manifest version, and exact paths. `BLOCKED_PLUGIN_NOT_LOADED` is not valid for numbered bridge work.

## Existing claim

When a valid immutable claim exists for the requested logical thread:

1. read the claim and its token from the remote mailbox branch;
2. verify slot, logical thread id, task, lane, current baseline, scope, and expected outbox;
3. adopt the token when the claim issuer is `CODEX` or `CHATGPT_COORDINATOR_RECOVERY`;
4. do not create a second claim;
5. continue only that lane;
6. return `BLOCKED_CLAIM_STALE` only when current metadata or ownership truly changed.

## New claim

When no claim exists:

1. verify the slot is open and unclaimed;
2. verify `origin/main` equals the slot's current authorized baseline;
3. generate a high-entropy claim token;
4. create exactly the predetermined claim path;
5. include slot, logical thread id, task, lane, token, mailbox parent, baseline, original task inbox, current baseline inbox, expected outbox, issuer, and no-primary-write statement;
6. publish through the resilient mailbox guard;
7. refetch and verify the remote claim;
8. return claim token and claim path separately.

ChatGPT may publish a `COORDINATOR_RECOVERY_CLAIM` for the already identified logical thread when Codex was blocked only by stale historical metadata or missing Git authentication.

## Resilient mailbox guard

Immediately before every claim or outbox write:

1. fetch the mailbox branch;
2. record its remote head as `MAILBOX_PARENT_COMMIT`;
3. prove the authorized path does not already exist;
4. use either a clean checkout already at that parent or a fresh temporary detached worktree at that exact parent.

Detached mode:

```bash
git worktree add --detach <temporary-path> "$MAILBOX_PARENT_COMMIT"
```

Then:

1. write only the authorized path;
2. commit in detached HEAD;
3. prove the parent equals `MAILBOX_PARENT_COMMIT`;
4. prove exactly one authorized path changed;
5. push without force:

```bash
git push origin HEAD:refs/heads/coordination/chatgpt-codex-bridge
```

6. refetch and prove remote head equals the new commit;
7. remove only the temporary worktree.

Never reset, clean, update, delete, or reuse a stale existing mailbox worktree. Retry the same slot up to three times after races. Never force-push or write mailbox files to `main`.

## Compact model preflight

When the slot phase is `MODEL_PREFLIGHT_ONLY`, return:

- slot, logical thread id, lane, task;
- actual claim token and claim path;
- Asynchronia skill source and version;
- task classification;
- runtime-safety verdict;
- parallel collision verdict;
- `evaluated pair count: 12/12`;
- recommended model and reasoning;
- why the next cheaper pair is insufficient;
- why the next stronger pair is unnecessary;
- exact read scope, write scope, dependencies, and blockers;
- actual active model as `USER_SELECTED_UNVERIFIED` unless externally proven.

Do not print the full 12-row matrix. A valid response ends with exactly one standalone fenced block and nothing after it:

```text
CONTINUE
```

A blocked response contains no `CONTINUE`.

## After CONTINUE

After the user selects the model and sends `CONTINUE` in the same thread:

1. refetch main and mailbox;
2. re-read STATE, current baseline inbox, claim, and original task objective;
3. verify token, baseline, task, phase, scope, and dependencies;
4. execute only the authorized lane;
5. publish only the expected immutable outbox;
6. tell the user to return to ChatGPT and write the same numbered command.

## Publication-auth fallback

If execution succeeds but publication fails solely because authentication is unavailable:

1. preserve the primary repository unchanged;
2. report `BLOCKED_MAILBOX_AUTH`;
3. include the complete intended mailbox payload and exact authorized path;
4. mark any local commit as diagnostic only;
5. tell the user to return to ChatGPT with the matching numbered command and report.

ChatGPT may independently validate and publish the exact payload through its connector. Local-only mailbox commits are never accepted.

## Parallel and runtime boundaries

- Read-only lanes do not request `APPROVE`.
- Runtime-sensitive writes require frozen scope and same-thread `APPROVE`.
- Source and deployed mirrors are one ownership lane.
- Shared resolvers, `dev-checks.js`, smoke registries, exports, globals, boot wiring, and aggregate smoke are serialized.
- Undeclared overlap returns `BLOCKED_PARALLEL_SCOPE_COLLISION`.
- Never merge, rebase, or absorb another lane without an integration task.

## ChatGPT verification

When ChatGPT receives `мост N`, it verifies only Slot N by reloading live memory, reading current STATE, resolving that slot's current baseline, claim, inbox, and outbox, independently checking repository and mailbox facts, and then closing, correcting, or advancing only that slot.
