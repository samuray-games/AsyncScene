# Chat -> Work -> Codex -> Review Pipeline

PIPELINE_VERSION: 1.0.0
STATUS: IMPLEMENTED_FOR_REVIEW
BRIDGE_SCOPE: UNCHANGED

This directory defines the durable task handoff layer for Asynchronia. It is separate from `.ai-bridge/**` and does not own bridge routing, slot state, claims, inboxes, outboxes, receipts, mailbox refs, or task-lane publication.

## Roles

- Chat decides product intent, architecture, constraints, and acceptance criteria.
- Work performs repository research, dependency analysis, risk analysis, task decomposition, and Codex prompt preparation.
- Codex implements one approved atomic task using the existing repository and bridge safety rules.
- Review independently verifies implementation evidence and records ACCEPTED, CORRECTION_REQUIRED, or BLOCKED.

## Durable unit

Every task is stored in `.ai-work/tasks/<TASK_ID>/`.

Required files by phase:

1. `01-chat-brief.md`
2. `02-work-plan.md`
3. `03-codex-task.md`
4. `04-review-report.md`
5. `STATE.md`

The active task state is the only mutable task-level pointer. Phase artifacts are immutable after promotion to the next phase. Corrections create a new numbered artifact rather than rewriting accepted evidence.

## State machine

`DRAFT_CHAT`
-> `READY_FOR_WORK`
-> `READY_FOR_CODEX`
-> `IMPLEMENTING`
-> `READY_FOR_REVIEW`
-> `ACCEPTED`

Failure and recovery states:

- `CORRECTION_REQUIRED`
- `BLOCKED`
- `CANCELLED`

Only Chat may promote to `READY_FOR_WORK`.
Only Work may promote to `READY_FOR_CODEX`.
Codex may promote only to `READY_FOR_REVIEW`, never to `ACCEPTED`.
Only an independent review may set `ACCEPTED`.

## Token economy

The pipeline stores decisions, not conversation transcripts.

Each artifact must contain only:

- task identity;
- goal;
- non-goals;
- accepted decisions;
- exact repository evidence;
- constraints;
- allowed read and write scope;
- dependencies;
- acceptance criteria;
- required tests;
- unresolved blockers;
- next action.

Do not copy brainstorming, discarded options, repeated history, or narrative summaries unless needed to explain a current decision.

## Bridge separation

This pipeline may reference a bridge slot only after a task reaches `READY_FOR_CODEX`.

It must not:

- edit `.ai-bridge/**`;
- select or rotate a numbered bridge;
- overwrite a bridge state;
- publish bridge artifacts;
- merge implementation directly to `main`;
- bypass runtime safety, model preflight, scope isolation, mirror ownership, or Safari acceptance.

Bridge allocation remains an execution concern governed by the current repository bridge authority. A task record stores only the assigned execution identity after allocation.

## Review split

Use Work review for exhaustive repository and evidence checks.
Use Chat review for product intent, UX, canon, and final acceptance decisions.
A runtime task remains `PENDING_USER` until the user supplies the required Safari result.

## Validation

Run:

`python3 tools/validate_ai_work_pipeline.py`

The validator checks structure, state transitions, required fields, immutable phase order, and bridge separation.