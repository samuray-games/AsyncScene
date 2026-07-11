# Task package template

Copy this directory structure to `.ai-work/tasks/<TASK_ID>/` and split each section into its named file when the phase is promoted.

## 01-chat-brief.md

TASK_ID: <ID>
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: READY_FOR_WORK
CREATED_AT: <ISO-8601>
AUTHOR_ROLE: CHAT
SOURCE_REVISION: <MEMORY_REV or repo SHA>

### Goal

### Non-goals

### Accepted decisions

### Constraints

### Acceptance criteria

### Open questions

### Output required from Work

## 02-work-plan.md

TASK_ID: <ID>
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: <ISO-8601>
AUTHOR_ROLE: WORK
SOURCE_REVISION: <repo SHA>

### Repository evidence inspected

### Current implementation state

### Conflict check

### Dependency map

### Atomic task decomposition

### Read scope

### Write scope

### Risk controls

### Validation plan

### Codex prompt strategy

### Blockers

## 03-codex-task.md

TASK_ID: <ID>
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: <ISO-8601>
AUTHOR_ROLE: WORK
SOURCE_REVISION: <repo SHA>

Use @asynchronia runtime-safety-gate.

### Atomic goal

### Exact baseline

### Allowed reads

### Allowed writes

### Forbidden changes

### Dependencies

### Implementation requirements

### Validation commands

### Required final report

### Stop conditions

## 04-review-report.md

TASK_ID: <ID>
PIPELINE_VERSION: 1.0.0
PHASE: REVIEW
STATUS: <ACCEPTED|CORRECTION_REQUIRED|BLOCKED>
CREATED_AT: <ISO-8601>
AUTHOR_ROLE: <CHAT|WORK>
SOURCE_REVISION: <reviewed SHA>

### Evidence inspected

### Scope verification

### Acceptance criteria results

### Test results

### Runtime status

### Findings

### Verdict

### Exact next action

## STATE.md

TASK_ID: <ID>
PIPELINE_VERSION: 1.0.0
CURRENT_STATUS: <STATUS>
CURRENT_PHASE: <PHASE>
CURRENT_ARTIFACT: <PATH>
NEXT_ROLE: <CHAT|WORK|CODEX|USER|NONE>
NEXT_ACTION: <ONE ACTION>
UPDATED_AT: <ISO-8601>
