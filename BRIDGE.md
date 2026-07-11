# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 4.0
CROSS_SLOT_BLINDNESS: REQUIRED
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
VALIDATOR: `tools/bridge_v4_contract.py`

## 1. Fixed commands and refs

- `мост 1` -> `origin/coordination/chatgpt-codex-bridge-1`
- `мост 2` -> `origin/coordination/chatgpt-codex-bridge-2`
- `мост 3` -> `origin/coordination/chatgpt-codex-bridge-3`

Each command selects exactly one control plane. Previous conversation state and other numbered mailbox refs are never authority.

## 2. Mandatory first actions

For `мост N`, before any terminal response Codex must:

1. read current root authority;
2. fetch `origin/main` and only `origin/coordination/chatgpt-codex-bridge-N`;
3. read that ref's `.ai-bridge/PUBLICATION_POLICY.md` and `.ai-bridge/STATE.md`;
4. read only the current Slot N inbox and claim named by that STATE;
5. validate the route and task branch with `tools/bridge_v4_contract.py`;
6. perform mandatory plugin preflight and pause for same-thread `CONTINUE`;
7. execute from a clean worktree on `bridge/N/<thread-id>`;
8. validate and publish only to the task branch and mailbox ref N;
9. refetch and prove both destinations;
10. prove mailbox refs for the other two slots did not move.

Normal execution must not fetch or inspect another numbered mailbox ref.

## 3. Slot-local STATE

Each numbered mailbox ref owns its own `.ai-bridge/STATE.md`.

STATE must contain only its own slot identity and may not contain shared activation pointers such as `OPEN_SLOT_COUNT` or `PRIMARY_ACTIVE_SLOT`.

STATE N names only Slot N thread, generation, task, epoch, nonce, task branch, inbox, claim, expected outbox, expected receipt, preflight state, continuation state, acceptance state and next action.

## 4. Task publication

Task implementation is committed and pushed only to `bridge/N/<thread-id>`.

A task lane must never push directly to `main`. Successful implementation returns `PASS_TASK_BRANCH_PUSHED` with fetched task-branch SHA, actual parent, exact changed paths, checks and slot-local outbox evidence.

`VERIFIED_NO_DELTA` remains legal only when explicitly authorized and fully evidenced. Empty commits are forbidden.

## 5. Mailbox publication

Inbox, claim, outbox and receipt for Slot N are published only on mailbox ref N.

Every mailbox write uses the latest fetched ref N head, changes only the authorized `.ai-bridge/` path, pushes fast-forward without force, and is refetched. Publishing Slot N data on ref M fails closed.

## 6. Integration

Independent task branches may execute concurrently when scope isolation passes.

Integration into `main` is separate and serialized. The integration owner refetches current `main`, verifies accepted slot-local evidence, checks exact paths and stable-read dependencies, then merges or replays one lane at a time.

Movement of `main` can require integration replay but does not invalidate another lane's STATE, preflight, continuation or evidence.

## 7. Independent memory

Current snapshots are separate:

- `.ai-memory/bridges/1.md`
- `.ai-memory/bridges/2.md`
- `.ai-memory/bridges/3.md`

Changing one snapshot must preserve byte-identical contents of the other two.

## 8. Validation

Valid route example:

```sh
python3 tools/bridge_v4_contract.py validate-command \
  --slot 2 \
  --mailbox-ref coordination/chatgpt-codex-bridge-2 \
  --task-branch bridge/2/BRIDGE-20260711-091
```

Protocol tests:

```sh
python3 -m unittest tools.test_bridge_v4_contract
```

Cross-slot reads, wrong refs, shared activation pointers, wrong branch prefixes and direct publication to main fail closed.

## 9. Legacy shared ref

`coordination/chatgpt-codex-bridge` is legacy read-only after all three numbered refs pass migration readback. It must not be used to activate new work.

## 10. Runtime status

Bridge infrastructure changes have `SAFARI_STATUS: N/A` unless game/runtime files change.
