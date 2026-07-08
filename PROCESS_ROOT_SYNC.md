# Asynchronia Root Process Synchronization

PROCESS_ROOT_SYNC_VERSION: 2
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
STATUS: ACTIVE

## Trigger

Root synchronization is mandatory for reusable defects in:

- process authority or precedence;
- bridge command routing;
- stale conversation or claim ownership;
- execution epochs;
- main or mailbox baseline handling;
- SHA, parent, ancestry or changed-path evidence;
- validator drift;
- STATE, inbox, claim or memory synchronization;
- acceptance tiers;
- repeated failures the process should prevent.

## Required propagation

Before the next project action ChatGPT must:

1. classify the defect as task-specific or systemic;
2. publish the exact task correction;
3. update every affected root authority;
4. update the validator so recurrence fails closed;
5. update mailbox publication policy;
6. update STATE, current inbox and current claim;
7. create a new execution epoch;
8. require a fresh Codex conversation when the old one returned no execution evidence;
9. update Google Drive memory;
10. verify all remote refs.

Affected surfaces include:

- `AGENTS.md`;
- `AGENTS.override.md`;
- `PROCESS_ROOT_SYNC.md`;
- `ORCHESTRATION.md`;
- `BRIDGE.md`;
- `GIT_PULL.md`;
- `GIT_PUSH.md`;
- `tools/validate-orchestration-policy.py`;
- mailbox publication policy;
- STATE;
- current inbox and claim;
- live Google Drive memory.

## No-op recovery

A Codex response that only sends the user back to ChatGPT without a current remote outbox is a systemic failure.

Recovery requires:

- mark the old Codex conversation superseded;
- set `THREAD_ROTATION_REQUIRED: true`;
- issue a replacement claim;
- issue a new inbox;
- assign a new `EXECUTION_EPOCH`;
- use a new expected outbox path;
- re-freeze the current main baseline;
- forbid reuse of the old thread and old outbox.

## Completion evidence

Root synchronization is complete only when:

- all authority files agree;
- validator checks the current protocol and no-op guard;
- mailbox policy agrees;
- STATE, inbox and claim share one baseline and epoch;
- live memory is updated;
- remote refs are independently verified.

Until then the status is `PROCESS_ROOT_SYNC_INCOMPLETE`.
