# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 2.1

This is the stable entry point for the ChatGPT-Codex mailbox bridge.

## User commands

The only active bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

The former bare `мост` command and older phrase are superseded.

The number is a fixed bridge slot selected by the user. Never substitute another slot.

## Discovery

1. Read root `AGENTS.md`.
2. Parse the exact slot number `1`, `2`, or `3` from the trimmed command.
3. Fetch current remote refs without switching or rewriting the primary worktree:

```bash
git fetch origin main coordination/chatgpt-codex-bridge
```

4. Read the authoritative bridge state:

```bash
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

5. Locate only `Bridge Slot N`, where N is the requested command number.
6. Ignore all historical mailbox files and every lane assigned to another slot.

## Existing claim in the same Codex thread

If this Codex thread already created a valid claim and retained its `CLAIM_TOKEN`:

1. verify the claim belongs to the requested bridge slot;
2. read the immutable claim file and current lane inbox;
3. verify slot, thread id, claim token, primary baseline, task id, phase and scope remain unchanged;
4. continue only that lane;
5. if the lane was closed, superseded, reassigned or changed, return `BLOCKED_CLAIM_STALE` and do not select a replacement lane.

## New Codex thread: fixed-slot claim

A new Codex thread claims only the lane assigned to the requested slot in `STATE.md`.

1. Read the slot's thread id, inbox path, predetermined claim path, expected outbox and authorized primary baseline.
2. If the slot has no open lane, return `BRIDGE_SLOT_UNAVAILABLE` with the slot number.
3. If the claim path already exists, return `BRIDGE_SLOT_ALREADY_CLAIMED` and do not inspect or claim another slot.
4. Generate a high-entropy `CLAIM_TOKEN` and retain it in the current Codex thread.
5. Create exactly the predetermined immutable claim file containing:
   - bridge slot number;
   - thread id;
   - task id;
   - lane id;
   - claim token;
   - mailbox parent SHA known before commit;
   - authorized primary baseline;
   - exact inbox path;
   - statement that this claim authorizes no primary write.
6. Commit and push that single claim path using the mailbox branch guard below.
7. Refetch and verify the remote claim file equals the created claim.
8. Read the slot inbox and perform only its current phase.

If the mailbox remote head moves before push, refetch and retry the same slot only. Never fall through to another slot. A claim is not model approval, runtime approval, task PASS or coordinator acceptance.

## Model preflight

When the slot inbox requires `MODEL_PREFLIGHT_ONLY`:

1. invoke the required Asynchronia plugin workflow and provide current-thread plugin-load evidence;
2. perform only preflight, not the audit or implementation;
3. recommend the cheapest reliable available model and reasoning level;
4. state exact read scope, expected write scope, dependencies, runtime classification, permissions and blockers;
5. include bridge slot, lane id and retained claim token;
6. end with exactly one standalone fenced text code block containing only `CONTINUE`, with no text after it.

```text
CONTINUE
```

After the user selects the model and sends `CONTINUE` in the same Codex thread:

1. refetch `main` and the mailbox branch;
2. re-read current `STATE.md`, the immutable claim and the same slot inbox;
3. verify slot, claim token, task, baseline, scope, dependencies and phase remain unchanged;
4. execute only the authorized lane;
5. publish only the immutable outbox path authorized by that lane;
6. set exact next user action to: return to ChatGPT and write the same command, `мост 1`, `мост 2`, or `мост 3`.

Do not ask the user to paste the report. ChatGPT reads and verifies the expected outbox directly when the user writes that numbered command.

## ChatGPT verification contract

When ChatGPT receives `мост N`, it verifies only Bridge Slot N:

1. reload live project memory;
2. read current mailbox `STATE.md`;
3. resolve the exact slot, claim, inbox and expected outbox;
4. independently verify repository and mailbox facts;
5. write an immutable closure or corrective turn;
6. update the slot state, project memory and operational board;
7. either enqueue the next compatible task into the same slot or mark it idle.

Results from other slots are not implicitly accepted.

## Runtime safety and parallel boundaries

- Follow `AGENTS.md` and `runtime-safety-gate` exactly.
- Read-only lanes do not request `APPROVE`.
- Runtime-sensitive writes require frozen exact scope and same-thread `APPROVE`.
- Source and deployed mirrors are one ownership lane.
- Overlapping writes, stable-read dependencies, shared resolver paths, `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized.
- A lane stops with `BLOCKED_PARALLEL_SCOPE_COLLISION` when current evidence creates an undeclared overlap.
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

Never create a mailbox commit from `main`, a detached primary commit, an authorized primary baseline or any non-mailbox branch. Never overwrite an inbox, claim or outbox. Never modify another slot. Never force-push.

When primary write scope is `NONE`, also prove `origin/main` still equals the slot's authorized baseline. Any mismatch returns `BLOCKED_MAILBOX_BRANCH_GUARD`, with no mailbox commit, fallback or guessed repair. If any mailbox file reaches `main`, return `FAIL_MAILBOX_WRITTEN_TO_MAIN`.

The immutable claim or outbox records only facts known before its own commit plus mandatory post-push verification statements. ChatGPT independently resolves final mailbox commit/head, ancestry, exact paths and post-publication main, then records them in the immutable closure.

## Failure behavior

If `STATE.md`, the requested slot, lane inbox, claim, branch or required source cannot be read:

- return `BLOCKED` with the exact missing source;
- do not substitute another slot or nearby task;
- do not modify primary files;
- do not claim a replacement lane after an existing same-thread claim becomes stale.
