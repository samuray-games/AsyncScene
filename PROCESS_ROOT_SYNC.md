# Asynchronia Root Process Synchronization

PROCESS_ROOT_SYNC_VERSION: 2
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
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
- false requirements for a source delta when the authorized baseline already satisfies the task;
- repeated failures the process should prevent.

## Required propagation

Before the next project action ChatGPT must:

1. classify the defect as task-specific or systemic;
2. publish the exact task correction;
3. update every affected root authority;
4. update the validator so recurrence fails closed;
5. update mailbox publication policy;
6. update STATE and the current contract;
7. update Google Drive memory;
8. verify all remote refs.

A new execution epoch and fresh Codex conversation are required only when more Codex execution is actually needed. They are not required to close a lane that ChatGPT independently verifies as already satisfied on the current baseline.

Affected surfaces include:

- `AGENTS.md` or the higher-precedence `AGENTS.override.md`;
- `PROCESS_ROOT_SYNC.md`;
- `ORCHESTRATION.md`;
- `BRIDGE.md`;
- Git publication policy;
- `tools/validate-orchestration-policy.py`;
- mailbox publication policy;
- STATE and current contract;
- live Google Drive memory.

## Invalid no-op recovery

A Codex response that only sends the user back to ChatGPT without a current evidence outbox is a systemic failure.

When further execution is required, recovery uses a replacement claim, inbox, execution epoch and expected outbox.

## Verified no-delta recovery

`VERIFIED_NO_DELTA` is a valid completion state, not a no-op, when:

- the baseline is still current;
- the frozen objective is already satisfied;
- required generation and validation pass;
- deterministic regeneration yields zero diff;
- exact changed paths are empty;
- protected blobs remain unchanged;
- a current evidence outbox is published, unless ChatGPT independently reconstructs and records closure after a pre-policy `BLOCKED_NO_SOURCE_DELTA` report.

Empty primary commits are forbidden.

ChatGPT may close a pre-policy blocked lane without reissuing Codex when it independently verifies the same baseline evidence and records the closure in mailbox STATE and live memory.

## Completion evidence

Root synchronization is complete only when:

- affected authority files agree;
- validator checks both invalid no-op and verified-no-delta rules;
- mailbox policy agrees;
- STATE and current contract reflect the actual completion mode;
- live memory is updated;
- remote refs are independently verified.

Until then the status is `PROCESS_ROOT_SYNC_INCOMPLETE`.
