# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 2.2

This is the stable entry point for the ChatGPT-Codex mailbox bridge.

## User commands

The only normal bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

The number is a fixed bridge slot. Never substitute another slot. Bare `мост` is inactive. The older phrase is accepted only as a one-time recovery trigger defined by `CODEX_BRIDGE_RECOVERY.md`.

## Stale-alias recovery

A numbered command remains valid when user-level instructions or local repository files are stale.

Before interpreting the command:

1. verify the repository origin belongs to `samuray-games/AsyncScene`;
2. fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
3. read current policy with:

```bash
git show origin/main:AGENTS.override.md
git show origin/main:AGENTS.md
git show origin/main:BRIDGE.md
```

4. if the active user-level managed bridge block is older than current `CODEX_BRIDGE_BOOTSTRAP.md`, repair only that managed block;
5. preserve dirty local repository files exactly as found;
6. never ask what `мост 1`, `мост 2`, or `мост 3` means.

Dirty local `AGENTS.md` or `BRIDGE.md` files do not block recovery. Do not stash, reset, clean, overwrite, commit or push them. Continue the current thread from fetched remote Protocol 2.2 after recovery.

## Discovery

1. Parse slot `1`, `2`, or `3` from the exact command.
2. Read authoritative mailbox state:

```bash
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

3. Locate only `Bridge Slot N`.
4. Ignore historical files and every other slot.
5. Read the slot inbox, current baseline update, claim path, expected outbox and authorized primary baseline.

## Plugin proof before claim

A new thread must prove the Asynchronia plugin before writing a claim.

Accepted proof modes:

### Native resolver proof

Use `NATIVE_RESOLVER_PROOF` when the current Codex resolver or UI exposes the active Asynchronia package and invoked skills.

### Functional invocation proof

Use `FUNCTIONAL_INVOCATION_PROOF` when native telemetry is unavailable but the current thread successfully invokes required Asynchronia skills and returns their complete contracts.

For bridge preflight, functional proof requires:

- `plugin package: asynchronia`;
- manifest version from `plugins/asynchronia/.codex-plugin/plugin.json`;
- exact invoked skill names;
- complete `task-router` output contract;
- `runtime-safety-gate` verdict;
- complete `parallel-scope-planner` contract because three slots exist;
- complete `model-selector` output including `evaluated pair count: 12/12`;
- `NATIVE_TELEMETRY_UNAVAILABLE` when native telemetry is absent.

Reading skill files or naming skills without returning their contracts is not proof. Missing native telemetry alone is not a blocker.

If neither proof succeeds, return `BLOCKED_PLUGIN_NOT_LOADED`. Do not create a claim, do not include `CONTINUE`, and do not modify primary files.

## Existing claim in the same Codex thread

When the current thread already owns a valid claim token:

1. verify it belongs to the requested slot;
2. read the immutable claim and current inbox;
3. verify slot, thread id, token, baseline, task, phase and scope remain unchanged;
4. continue only that lane;
5. return `BLOCKED_CLAIM_STALE` if it changed.

## New thread claim

After plugin proof succeeds:

1. verify the requested slot is open and unclaimed;
2. return `BRIDGE_SLOT_UNAVAILABLE` when it has no active lane;
3. return `BRIDGE_SLOT_ALREADY_CLAIMED` when its claim path already exists;
4. generate a high-entropy `CLAIM_TOKEN`;
5. create exactly the predetermined immutable claim file containing:
   - bridge slot;
   - thread id;
   - task id;
   - lane id;
   - actual claim token;
   - mailbox parent SHA known before commit;
   - authorized primary baseline;
   - exact inbox path;
   - statement that the claim authorizes no primary write;
6. commit and push only that claim path with the mailbox branch guard;
7. refetch and verify the remote claim;
8. return the claim token and claim path as separate fields.

If the mailbox head moves, refetch and retry the same slot only.

## Model preflight

When the slot phase is `MODEL_PREFLIGHT_ONLY`, return:

- plugin proof mode and evidence;
- actual bridge slot, lane id, claim token and claim path;
- complete task-router contract;
- runtime-safety-gate verdict;
- complete parallel-scope-planner contract;
- complete model-selector contract, including the 12/12 pair matrix;
- exact read scope, write scope, dependencies, collisions and blockers;
- actual active model as `USER_SELECTED_UNVERIFIED` unless externally proven.

A valid response ends with exactly one standalone fenced block and nothing after it:

```text
CONTINUE
```

A blocked response must never include that block.

After same-thread `CONTINUE`:

1. refetch main and mailbox;
2. re-read STATE, claim and the same slot inbox;
3. verify token, baseline, task, scope, dependencies and phase;
4. execute only the authorized lane;
5. publish only the expected immutable outbox;
6. tell the user to return to ChatGPT and write the same numbered command.

Do not ask the user to paste the report.

## ChatGPT verification contract

When ChatGPT receives `мост N`, it verifies only Slot N:

1. reload live project memory;
2. read mailbox STATE;
3. resolve the slot claim, inbox and outbox;
4. independently verify repository and mailbox facts;
5. write an immutable closure or corrective turn;
6. update slot state, project memory and board;
7. enqueue the next compatible task or mark the slot idle.

## Runtime and parallel boundaries

- Read-only lanes do not request `APPROVE`.
- Runtime-sensitive writes require frozen scope and same-thread `APPROVE`.
- Source and deployed mirrors are one lane.
- Shared resolvers, `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized.
- Undeclared overlap returns `BLOCKED_PARALLEL_SCOPE_COLLISION`.
- Never merge, rebase or absorb another lane without an integration task.

## Mailbox branch guard

Every claim and outbox write must:

1. fetch the mailbox branch immediately before writing;
2. record `MAILBOX_PARENT_COMMIT`;
3. use an isolated checkout on exactly `coordination/chatgpt-codex-bridge`;
4. prove branch identity and `HEAD == MAILBOX_PARENT_COMMIT`;
5. prove the diff contains one authorized claim or outbox path;
6. create a direct-child commit;
7. push explicitly to the mailbox branch;
8. refetch and prove the remote head equals the new commit.

Never write mailbox files to main, overwrite immutable files or force-push. When primary scope is `NONE`, also prove `origin/main` equals the slot baseline. Mismatch returns `BLOCKED_MAILBOX_BRANCH_GUARD`.

## Failure behavior

When a required source cannot be read, return `BLOCKED` with the exact missing source. Do not substitute another slot, modify primary files or claim replacement work.
