# Asynchronia Root Process Synchronization

PROCESS_ROOT_SYNC_VERSION: 1
ROOT_CAUSE_SYNC: REQUIRED
STATUS: ACTIVE

## Purpose

A reusable process defect must be fixed at its source, not only patched inside one task inbox.

This policy applies to orchestration, bridge commands, baseline handling, publication evidence, acceptance, validators, mailbox policy, STATE and live Google Drive project memory.

## Trigger

Root-cause synchronization is mandatory when ChatGPT or Codex discovers a reusable defect in any of these areas:

- process authority or precedence;
- numbered bridge behavior;
- main or mailbox baseline handling;
- primary or outbox publication evidence;
- SHA, parent, ancestry or changed-path reporting;
- validator drift or missing fail-closed checks;
- STATE, inbox, claim or memory synchronization;
- acceptance-tier handling;
- repeated failure that the current process should have prevented.

A product-only or code-only defect does not require unrelated process edits.

## Required propagation

Before giving the user the next project action, ChatGPT must:

1. classify the defect as task-specific or systemic;
2. publish the exact task correction when needed;
3. update every affected root process authority;
4. update the process validator so the same drift fails closed;
5. update mailbox publication policy when publication behavior is affected;
6. update STATE and the current inbox;
7. create a replacement immutable claim when the authoritative main baseline changes;
8. update Google Drive project memory and report the new MEMORY_REV;
9. verify remote refs and cross-file consistency.

The affected root set is:

- `AGENTS.override.md`;
- `PROCESS_ROOT_SYNC.md`;
- `ORCHESTRATION.md`;
- `BRIDGE.md`;
- `GIT_PULL.md`;
- `GIT_PUSH.md`;
- `tools/validate-orchestration-policy.py`;
- `.ai-bridge/PUBLICATION_POLICY.md` on the mailbox branch;
- `.ai-bridge/STATE.md`;
- the current inbox and claim;
- `ASYNCHRONIA - PROJECT MEMORY`.

Only files affected by the discovered rule need textual changes, but all listed surfaces must be checked for conflict.

## Active-lane baseline safety

If root-process hardening moves `main` while a lane is open:

1. finish the root-process publication first;
2. create a new current inbox and replacement immutable claim;
3. set both to the new exact `origin/main` SHA;
4. update STATE to name them;
5. preserve the same logical thread, lane, task and product scope;
6. do not require an extra user command beyond the next matching numbered bridge command.

The old inbox, claim and outbox remain immutable history.

## Publication evidence

Every reported commit SHA and parent must be machine-derived from freshly fetched remote refs.

For a successful primary publication:

- the reported primary SHA must equal freshly fetched `origin/main`;
- the reported parent must equal the commit's actual first parent;
- the commit must have the authorized ancestry;
- the exact changed paths must match the frozen scope.

For a successful outbox publication:

- the outbox must contain the exact verified primary SHA;
- the mailbox commit must change only the expected outbox path;
- manual SHA transcription is forbidden;
- a mismatch is automatic rejection even when the implementation diff is otherwise correct.

## Validators

Process validators must:

- validate the current protocol version, not a historical version;
- validate the current canonical phase list;
- require `ROOT_CAUSE_SYNC: REQUIRED` in all root process authorities;
- fail on conflicting blocker names or moved-baseline behavior;
- fail on missing exact remote SHA equality requirements;
- report checked files and failures deterministically.

## Completion condition

Root-cause synchronization is complete only when:

- root authority is internally consistent;
- validator passes;
- mailbox policy and STATE agree with main;
- the active lane baseline is re-frozen when needed;
- Google Drive memory is updated;
- remote refs are independently verified.

Until then, the result remains `PROCESS_ROOT_SYNC_INCOMPLETE`.
