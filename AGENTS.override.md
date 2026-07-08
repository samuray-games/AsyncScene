# Asynchronia Protocol 3.1 Override

OVERRIDE_VERSION: ORCHESTRATION_3_1_FRESH_EXECUTION
BRIDGE_PROTOCOL: 3.1
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

Read root `AGENTS.md` fully. Every rule remains binding except the process clauses explicitly replaced below.

## 1. Process authority

Use this precedence:

1. `AGENTS.override.md`;
2. `AGENTS.md` bridge section;
3. `PROCESS_ROOT_SYNC.md`;
4. `ORCHESTRATION.md`;
5. `BRIDGE.md`;
6. `GIT_PULL.md` and `GIT_PUSH.md`;
7. mailbox `.ai-bridge/PUBLICATION_POLICY.md`;
8. mailbox `.ai-bridge/STATE.md`;
9. current inbox named by STATE;
10. current claim named by STATE;
11. original task inbox for unchanged objective and evidence;
12. historical artifacts for audit only.

Repository files are authoritative for implementation state. Google Drive memory is authoritative for cross-chat context but never overrides newer repository facts.

## 2. Fresh execution rule

Every exact `мост N` is a new execution attempt for the execution epoch currently named by STATE.

Before any final response Codex must freshly fetch main and mailbox, read current authority, STATE, inbox and claim, then execute the current phase.

A previous conversational completion, previous outbox or old claim cannot satisfy a new execution epoch.

## 3. Thread rotation

When STATE says `THREAD_ROTATION_REQUIRED: true`:

- the previous Codex conversation is superseded;
- a fresh Codex conversation may adopt the replacement claim named by STATE;
- old thread ownership is void;
- execution starts immediately on the matching numbered command;
- no preflight, `CONTINUE`, `APPROVE`, `пул` or `пуш` is required.

The logical bridge thread id remains unchanged for audit history even when the Codex conversation rotates.

## 4. No-op guard

Codex may tell the user to return to ChatGPT only after freshly proving:

- the exact current expected outbox exists remotely;
- mailbox head contains it;
- remote main advanced from baseline for a primary-write task;
- remote main equals the reported primary SHA;
- parent and exact paths are verified;
- required checks passed;
- outbox contains the machine-derived fetched SHA and parent.

Without this evidence, the only valid outcomes are real execution or one explicit blocker.

A one-line `Return to ChatGPT and send мост N` without evidence is `FAIL_NO_EXECUTION_EVIDENCE`.

## 5. Remote-first execution

Codex must:

1. verify repository identity;
2. fetch main and mailbox;
3. read remote authority;
4. resolve only the requested slot and current epoch;
5. use clean task-owned worktrees;
6. preserve unrelated work;
7. never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push.

Local divergence is not a blocker.

## 6. Publication

After validation Codex must:

1. create one direct-child primary commit when authorized;
2. stage only authorized paths;
3. push fast-forward;
4. refetch and prove remote main equals the commit;
5. machine-derive SHA and parent from the fetched commit;
6. create the exact current immutable outbox;
7. push it fast-forward;
8. refetch and prove remote mailbox equals the outbox commit;
9. return exactly one next action.

Manual SHA transcription is forbidden.

## 7. Authentication

Codex may run one configured non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle. Never request credentials.

## 8. Root synchronization

Every reusable process defect triggers `PROCESS_ROOT_SYNC.md`.

If root hardening moves main while a lane is open, ChatGPT must publish a new inbox, replacement claim, new execution epoch and STATE using the new exact baseline.

## 9. Runtime and acceptance

- Runtime-sensitive files remain serialized and require exact scope authorization.
- Source and deployed mirrors are one ownership group.
- Git publication is not Safari PASS.
- Codex cannot claim user acceptance.

## 10. Final action

Every successful Codex result includes `PASS_PUSHED`, fetched remote SHAs, actual parent, exact paths, checks and one next action.

Do not offer competing paths or repeat information already present in current remote authority.
