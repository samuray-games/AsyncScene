# AI Work Artifact Schema

SCHEMA_VERSION: 1.0.2

## Common header

Every phase artifact must begin with these exact keys:

- `TASK_ID`
- `PIPELINE_VERSION`
- `PHASE`
- `STATUS`
- `CREATED_AT`
- `AUTHOR_ROLE`
- `SOURCE_REVISION`

Optional execution keys become required only after bridge allocation:

- `BRIDGE_SLOT`
- `EXECUTION_THREAD`
- `IMPLEMENTATION_BRANCH`
- `BASELINE_SHA`

## 01 Chat brief

Required sections:

- Goal
- Non-goals
- Accepted decisions
- Constraints
- Acceptance criteria
- Open questions
- Output required from Work

Maximum guidance: 1,200 words unless exact source evidence requires more.

## 02 Work plan

Required sections:

- Repository evidence inspected
- Current implementation state
- Conflict check
- Dependency map
- Atomic task decomposition
- Read scope
- Write scope
- Risk controls
- Validation plan
- Codex prompt strategy
- Blockers

Work must not claim implementation or user acceptance.

## 03 Codex task

The first line after metadata must state the task-specific safety and routing authority required by current repository policy.

The removed directive `Use @asynchronia runtime-safety-gate.` is forbidden in every active Codex task. Superseded historical artifacts may retain it only as immutable evidence when the active corrected artifact is named by `STATE.md`.

Required sections:

- Atomic goal
- Exact baseline
- Allowed reads
- Allowed writes
- Forbidden changes
- Dependencies
- Implementation requirements
- Validation commands
- Required final report
- Stop conditions

The task must be executable without access to prior Chat or Work transcripts.

## 04 Review report

Required sections:

- Evidence inspected
- Scope verification
- Acceptance criteria results
- Test results
- Runtime status
- Findings
- Verdict
- Exact next action

Allowed verdicts:

- `ACCEPTED`
- `CORRECTION_REQUIRED`
- `BLOCKED`

Codex self-report alone is never sufficient evidence.

## STATE.md

Required keys:

- `TASK_ID`
- `PIPELINE_VERSION`
- `CURRENT_STATUS`
- `CURRENT_PHASE`
- `CURRENT_ARTIFACT`
- `NEXT_ROLE`
- `NEXT_ACTION`
- `UPDATED_AT`

Allowed active statuses:

- `DRAFT_CHAT`
- `READY_FOR_WORK`
- `READY_FOR_CODEX`
- `IMPLEMENTING`
- `READY_FOR_REVIEW`
- `CORRECTION_REQUIRED`
- `BLOCKED`
- `ACCEPTED`
- `CANCELLED`

Explicit immutable terminal statuses from an earlier schema epoch may remain valid when the validator lists them as historical terminal statuses and their `STATE.md` has `NEXT_ROLE: NONE_FOR_THIS_TASK`. Their phase artifacts and external immutable commit identities must not be rewritten or reinterpreted under a newer active-task schema.

## Promotion rules

- A phase may be promoted only when all required fields are present.
- The next role must re-read current repository authority before acting.
- Accepted phase artifacts are immutable.
- Corrections use suffixes such as `03-codex-task-r2.md` and update `STATE.md`.
- No artifact may redefine or modify bridge protocol, bridge state, or mailbox ownership.
