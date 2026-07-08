# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 3.0
ORCHESTRATION: `ORCHESTRATION.md`

## 1. Commands

The only numbered bridge commands are:

- `мост 1`
- `мост 2`
- `мост 3`

Each command selects one fixed slot. Never substitute another slot. Bare `мост` is inactive.

Git transport commands inside Codex are:

- `пул`
- `пуш`

The former commands `запуль` and `запушь` are inactive.

## 2. Remote-first bootstrap

For every numbered bridge command:

1. verify `origin` belongs to `samuray-games/AsyncScene`;
2. fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`;
3. read current remote authority:

```bash
git show origin/main:AGENTS.override.md
git show origin/main:ORCHESTRATION.md
git show origin/main:AGENTS.md
git show origin/main:BRIDGE.md
git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md
```

4. parse only the requested slot;
5. read that slot's current baseline inbox, claim and expected outbox;
6. execute only the current phase;
7. ignore local bridge files, other slots and historical superseded tasks.

A dirty worktree, stale local policy or missing local mailbox file does not block remote discovery.

## 3. Metadata precedence

Use the precedence defined in `ORCHESTRATION.md` and `AGENTS.override.md`.

For mutable slot fields, current `STATE.md` and its named current baseline inbox supersede older inboxes. The original task inbox remains authoritative only for the unchanged atomic objective and evidence requirements not replaced by the current baseline inbox.

## 4. Claims

### Existing claim

When a valid immutable claim exists for the same slot and logical thread:

- read and adopt it;
- verify slot, thread, lane, task, baseline, scope and expected outbox;
- do not create a second claim;
- continue only that lane.

### New claim

When no claim exists:

1. verify the slot is open and unclaimed;
2. verify current main equals the authorized baseline;
3. create exactly the predetermined claim path;
4. include slot, thread, lane, task, claim token, mailbox parent, main baseline, inbox paths, expected outbox and no-primary-write statement;
5. publish through the resilient mailbox guard;
6. refetch and verify the remote claim.

ChatGPT may create a coordinator recovery claim for the already identified logical thread.

## 5. Canonical phases

Use only the phases defined in `ORCHESTRATION.md`:

- `CLOSED`
- `SCOPE_FREEZE`
- `MODEL_PREFLIGHT_ONLY`
- `AWAITING_USER_CONTINUE`
- `EXECUTE_NOW`
- `MAIN_PUBLISHED_AWAITING_OUTBOX`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT`
- `CORRECTION_REQUIRED`
- `READY_FOR_SAFARI`
- `AWAITING_SAFARI`
- `PASS_ACCEPTED`
- `BLOCKED_EXTERNAL`

Do not invent phase names in new tasks.

## 6. Model preflight and runtime confirmation

In `MODEL_PREFLIGHT_ONLY`, return the compact 12-of-12 preflight required by `ORCHESTRATION.md`.

End with exactly:

```text
CONTINUE
```

After the user selects the model and sends `CONTINUE` in the same Codex thread, that token confirms both model selection and runtime safety for the exact frozen numbered bridge task. No additional `APPROVE` is required.

Refetch all authority and execute only if the task, claim, baseline and scope remain unchanged.

If `CONTINUE` was already sent, never repeat preflight. Execute the lane.

## 7. Resilient mailbox guard

Before every claim or outbox write:

1. fetch the mailbox branch;
2. record its head as `MAILBOX_PARENT_COMMIT`;
3. prove the authorized path does not already exist;
4. use a clean checkout at that head or a fresh detached temporary worktree;
5. write exactly one authorized mailbox path;
6. commit as a direct child of the recorded parent;
7. prove the diff contains only that path;
8. push fast-forward without force;
9. refetch and prove the remote head equals the new commit.

After a race, rebuild the same payload as a new direct child of the latest head. Retry up to three times. Never amend, rebase, cherry-pick or force-push a stale mailbox commit.

## 8. Execution and publication

After `CONTINUE`:

1. verify current main baseline and mailbox contract;
2. edit only authorized files;
3. preserve unrelated work;
4. run all required checks;
5. publish the exact primary commit when authorized;
6. publish the exact immutable outbox;
7. return one next action: go to ChatGPT and write the same numbered bridge command.

If main publishes but the outbox does not, report `MAIN_PUBLISHED_AWAITING_OUTBOX`. Do not reimplement the task.

## 9. Authentication fallback

If Git credentials are unavailable, return `BLOCKED_PUSH_AUTH` and the complete recovery bundle from `ORCHESTRATION.md`.

For mailbox publication, the complete immutable outbox payload is mandatory even when a local commit SHA exists.

For primary publication, include full content for every changed text file or base64 for every binary file, plus parent SHA, destination ref, commit message and validation evidence.

ChatGPT may verify and fast-forward a remotely readable direct-child commit or reconstruct the commit from the recovery bundle.

A local-only commit is not publication.

## 10. Correction behavior

A same-scope correction remains in the same logical thread and does not require a new preflight or `CONTINUE` unless ChatGPT changes the task objective or write scope.

The correction inbox must name exact defects and exact required changes. Codex must not broaden the correction.

## 11. ChatGPT verification

When ChatGPT receives `мост N`, it:

1. reloads live project memory and reports exact `MEMORY_REV`;
2. reads current main policy and mailbox STATE;
3. resolves only Slot N;
4. verifies claim, inbox, outbox, ancestry, paths, mirrors, behavior matrix and checks independently;
5. publishes recovery material when safe;
6. closes, corrects or advances only that slot;
7. automatically opens the next safe serialized task when no user decision or Safari smoke is pending.

Codex prose alone is never acceptance evidence.
