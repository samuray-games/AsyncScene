# Asynchronia Protocol 3.1 Override

OVERRIDE_VERSION: ORCHESTRATION_3_1_ONE_COMMAND_LOOP_ROOT_SYNC
BRIDGE_PROTOCOL: 3.1
ROOT_CAUSE_SYNC: REQUIRED

Read root `AGENTS.md` fully. Every rule remains binding except the process clauses explicitly replaced below.

## 1. Canonical process source

For task orchestration, bridge phases, confirmation, Git transport, publication recovery, acceptance tiers, automatic progression and systemic process correction, read and follow:

1. `AGENTS.override.md`;
2. `PROCESS_ROOT_SYNC.md`;
3. `ORCHESTRATION.md`;
4. `BRIDGE.md`;
5. `GIT_PULL.md` and `GIT_PUSH.md`;
6. mailbox `.ai-bridge/PUBLICATION_POLICY.md`;
7. mailbox `.ai-bridge/STATE.md`;
8. the current baseline inbox named by STATE;
9. the current immutable claim;
10. the original task inbox for unchanged objective and evidence requirements;
11. historical bridge artifacts for audit only;
12. root `AGENTS.md` for rules not replaced above.

Primary repository files remain authoritative for current implementation state. Google Drive project memory is authoritative for cross-chat context but never overrides newer repository facts.

## 2. Exact user loop

The numbered bridge workflow is exactly:

1. ChatGPT writes the task inbox, claim and STATE.
2. The user sends `мост 1`, `мост 2` or `мост 3` to the matching Codex thread.
3. Codex fetches remote refs, reads current authority, uses clean task-owned worktrees, executes, validates, pushes the authorized primary commit, writes and pushes the immutable outbox, and verifies both remote refs.
4. The user sends the same numbered bridge command to ChatGPT.
5. ChatGPT independently verifies remote publication, behavior and evidence.
6. ChatGPT accepts, or publishes one exact correction and performs mandatory root-cause synchronization for every systemic defect.
7. ChatGPT opens the next safe task.
8. Repeat.

No separate `пул`, `пуш`, `CONTINUE`, `APPROVE` or generic continuation command is required for a numbered bridge lane.

Bare `мост`, `запуль` and `запушь` are inactive.

## 3. Numbered bridge authorization

A numbered `мост N` in the matching Codex thread authorizes, for the exact frozen current contract:

- remote synchronization;
- task entry;
- use of the active client model;
- runtime-safety approval for the exact frozen scope;
- execution and validation;
- authorized primary publication;
- immutable outbox publication.

It never authorizes scope expansion.

Codex does not stop for model preflight. When model telemetry is unavailable it reports `USER_SELECTED_UNVERIFIED` and continues.

## 4. Remote-first execution

Codex must:

1. verify `origin` is `samuray-games/AsyncScene`;
2. fetch `main` and `coordination/chatgpt-codex-bridge`;
3. read current process authority from remote refs;
4. resolve only the requested slot;
5. ignore stale local bridge files;
6. use a clean task-owned worktree from the exact authorized main baseline;
7. use a separate clean mailbox worktree from the latest mailbox head;
8. preserve unrelated local work byte-for-byte;
9. never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push.

A dirty, ahead, behind or diverged local `main` is not a blocker.

## 5. Automatic publication

After validation Codex must:

1. create one direct-child primary commit when primary writes are authorized;
2. stage only authorized paths;
3. push fast-forward without force;
4. refetch and prove `origin/main` equals the commit;
5. derive the exact SHA and parent from the fetched remote commit;
6. create one immutable outbox as a direct child of the latest mailbox head;
7. write the machine-derived primary SHA and parent into the outbox;
8. push the outbox fast-forward;
9. refetch and prove the remote mailbox head equals the outbox commit;
10. return exactly one next action.

Manual SHA transcription is forbidden. A reported primary SHA that differs from fetched `origin/main` is automatic rejection.

## 6. Authentication

Codex may run the repository's configured non-interactive authentication repair once.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle defined by `ORCHESTRATION.md`. Never ask the user to reveal credentials.

## 7. Root-cause synchronization

When verification discovers a reusable process defect, ChatGPT must execute `PROCESS_ROOT_SYNC.md` before giving the next project action.

A task correction alone is insufficient for a systemic defect.

If process hardening moves `main` while a lane is open, ChatGPT must immediately publish a new current inbox, replacement claim and STATE using the new exact baseline. The logical thread, lane, task and product scope remain unchanged.

## 8. Automatic progression

After independent acceptance, ChatGPT closes the current claim, updates STATE and live memory, freezes the next safe task and publishes its inbox and claim.

Progress pauses only for a genuine product decision, external blocker, unresolved collision, missing primary evidence or required Safari smoke.

## 9. Runtime and parallel boundaries

- Source and deployed mirrors are one ownership group.
- Runtime JavaScript, UI runtime JavaScript, economy, battle, NPC, state, persistence, routing and shared smoke wiring are runtime-sensitive.
- `dev-checks.js`, smoke registries, exports, globals, boot wiring and aggregate smoke are serialized singleton ownership groups.
- Read-only work may run in parallel only without a stable-read dependency on a mutable lane.
- Undeclared overlap returns `BLOCKED_PARALLEL_SCOPE_COLLISION`.
- No task may absorb another lane.

## 10. Acceptance

Keep four independent tiers:

1. remote publication verification;
2. static implementation acceptance;
3. deployment readiness;
4. user-owned Safari runtime acceptance.

Codex cannot claim user acceptance. Git publication is not Safari PASS.

## 11. Final next action

Every Codex result and ChatGPT verification provides exactly one next user action.

Do not offer competing paths or ask the user to repeat information already present in memory, STATE, inbox, claim, outbox or repository evidence.
