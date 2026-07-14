TASK_ID: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714
PIPELINE_VERSION: 1.0.3
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-14T02:42:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: MEMORY_REV 2026-07-14-1257-JST / origin-main c8e6b0668f39bbc49055bf3638ac2236c5fd4e15

### Repository evidence inspected

- Current main: `c8e6b0668f39bbc49055bf3638ac2236c5fd4e15`.
- Slot heads: `6727450e193053c8da8162f427404b1473f85d70`, `7421761f12126e88047fb2e6cd1c89490129a9c9`, `f9ebb33c7319b498307669c0d240f9eb05db8494`.
- Current root bridge authority, validators, pipeline schema and bridge snapshots.
- Current Slot 1 and Slot 2 task-branch compare evidence.
- Live project memory at `MEMORY_REV: 2026-07-14-1257-JST`.
- Local clone validation was unavailable because the execution container could not resolve GitHub. No local validator PASS is claimed.

### Current implementation state

- Bridge Protocol 4.0 routes exact numbered commands to isolated numbered refs.
- Root authority requires `.ai-bridge/PUBLICATION_POLICY.md`, but the file is absent from current main and the inspected mailbox ref.
- Slot 1 has a stale paused Stage 6 claim and its task branch is 117 commits behind main.
- Slot 2 has a rejected paused Stage 6 claim. Its task branch is one rejected commit ahead and 117 commits behind main.
- Slot 3 is available in mailbox STATE.
- All three repository snapshots disagree with current mailbox STATE.

### Conflict check

- Slot 2 collides with current main on both `dev-checks.js` mirrors and both HTML entrypoints.
- The rejected Slot 2 commit must remain historical and must not be replayed.
- Root authority, validators, canonical policy and mailbox policy form one serialized repair scope.
- Mailbox refs must be updated one at a time with cross-slot immutability proof.

### Dependency map

- Repository hardening and independent review precede mailbox publication.
- Mailbox publication precedes three read-only canary executions.
- Verified canaries precede final `AVAILABLE` states and repository snapshot synchronization.
- Stage 6 remains paused throughout.

### Atomic task decomposition

1. Codex hardens repository bridge authority, canonical publication policy, validators, tests and the three-slot repair manifest on `infra/bridge-123-revalidation-repair-20260714-r2`.
2. ChatGPT independently reviews the exact remote diff and validation evidence.
3. After acceptance, ChatGPT serially publishes slot-local policy and canary artifacts to Slots 1, 2 and 3.
4. The user runs each read-only canary in a fresh Codex thread with current preflight and same-thread continuation.
5. ChatGPT reviews each canary, closes each slot to `AVAILABLE`, and synchronizes bridge snapshots and live memory through one final owner.

### Read scope

- Current bridge authority, validators and tests.
- Current numbered mailbox STATE and the exact inbox and claim named by each STATE.
- Current task branches, repository snapshots and memory files.
- Historical reset artifacts as non-authoritative evidence only.

### Write scope

Work branch:

- the four files in `.ai-work/tasks/TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714/`.

Implementation branch:

- only the exact repository control-plane files named in `03-codex-task-r2.md`.
- no mailbox refs and no `.ai-bridge/**` files.

### Risk controls

- No direct main writes.
- No runtime or Stage 6 changes.
- No execution of stale claims.
- No old reset acceptance or old model selection reuse.
- Fail closed on remote-head drift, policy ambiguity, validator failure or unexpected changed paths.
- Safari status remains `N/A`.

### Validation plan

- `python3 tools/bridge_v4_authority_check.py`
- `python3 -m unittest tools.test_bridge_v4_authority_check`
- `python3 -m unittest tools.test_bridge_v4_contract`
- `python3 tools/validate_ai_work_pipeline.py`
- `python3 tools/validate-orchestration-policy.py`
- task-introduced deterministic policy and snapshot checks
- `git diff --check`

### Codex prompt strategy

- Use current plugin auto-routing and mandatory model preflight.
- Stop at `WAITING_FOR_MODEL_SELECTION` before mutation.
- Continue only after exact same-thread `CONTINUE`.
- Implement repository-side hardening only.
- Defer mailbox publication to independent ChatGPT review.

### Blockers

- Installed Asynchronia 1.0.9 was confirmed after Codex restart.
- Implementation is blocked until fresh model preflight and exact same-thread continuation.
- Mailbox publication is blocked until independent review accepts the repository implementation.
