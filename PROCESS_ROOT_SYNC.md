# Asynchronia Root Process Synchronization

PROCESS_ROOT_SYNC_VERSION: 3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
REMOTE_REF_FRESHNESS: FAIL_CLOSED
STATUS: ACTIVE

## Trigger

Root synchronization is mandatory for reusable defects in command routing, stale remote refs, stale conversations, thread or epoch ownership, baseline handling, STATE/inbox/claim identity, mailbox publication, outbox delivery, SHA or parent evidence, validator coverage, model-selection semantics, acceptance tiers, or any repeated failure the process should have prevented.

## Required propagation

Before the next product action ChatGPT must:

1. classify the defect as systemic;
2. preserve forensic evidence;
3. update the highest-precedence authority;
4. update bridge and orchestration contracts;
5. update or add deterministic tooling so the defect fails closed;
6. update CI validation;
7. update mailbox publication policy;
8. update canonical STATE.json and its human mirror;
9. rotate the active thread, claim, epoch and expected outbox when execution remains necessary;
10. update live Google Drive memory;
11. independently verify main and mailbox refs.

## Remote-ref defect rule

Any case where a reported main or mailbox head differs from current `ls-remote` is `SYSTEMIC_STALE_REMOTE_REF`.

The correction must use explicit destination refspecs, compare local remote-tracking refs with `ls-remote`, and reject `FETCH_HEAD` or conversation-derived identities as authority.

## Machine-state rule

`.ai-bridge/STATE.json` is canonical. STATE.md is explanatory only. Every open contract carries a mailbox generation, state revision, execution epoch, exact paths and a deterministic digest derived from current blobs.

## Publication rule

Outbox delivery is complete only when:

- the exact current expected path exists at the remote mailbox head;
- its commit parent equals the freshly resolved mailbox head from publication preflight;
- it is the only changed mailbox path;
- its digest and authority blob SHAs match the current contract;
- resolver mode `verify-outbox` passes.

## Model rule

Only plugin `model-selector` originates model recommendations. Recommendation evidence is informational and non-blocking. Retired preflight, waiting and continuation semantics are removed from all active contracts and validator coverage is dynamic across every installed skill.

## Completion

Root synchronization is complete only when authority files agree, deterministic tooling and self-tests pass, CI watches all relevant paths, mailbox policy and STATE.json agree, the active contract uses the new baseline, live memory is updated, and both remote refs are independently verified.

Until then the status is `PROCESS_ROOT_SYNC_INCOMPLETE`.
