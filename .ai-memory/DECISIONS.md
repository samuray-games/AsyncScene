# Decisions

This file holds durable process decisions that should rarely change.

MEMORY_REVISION: 2026-07-20-0011-JST
EXPECTED_REVISION: 2026-07-20-0011-JST
NOTION_MEMORY_REVISION: 2026-07-19-2356-JST

## Source of truth

- Repository files are authoritative for current implementation state.
- GitHub is the accessibility fallback so memory can be read away from the local machine.
- The live cross-chat bootstrap is the Notion page `ASYNCHRONIA - PROJECT MEMORY`, page ID `3a0815ae-752f-8139-945e-e38dfefbb111`, and must be fetched directly in every project response when bootstrap context is needed.
- When Notion conflicts with newer repository primary evidence, use the repository fact, report the conflict, and update Notion in the same execution when authorized.
- A local branch or local remote-tracking ref is not proof of current remote state. Work must fresh-fetch and verify the actual remote ref before reporting its head or absence.
- Repository memory revisions and Notion `MEMORY_REV` are separate revision domains.

## Memory layout

- `PROJECT_MEMORY.md` is the compact entrypoint and index.
- `.ai-memory/CURRENT.md` stores the live state summary.
- `.ai-memory/DECISIONS.md` stores stable process and architecture decisions.
- `.ai-memory/CANON.md` stores product canon and acceptance rules.
- `.ai-memory/WORKFLOWS.md` stores validation and update procedures.
- `.ai-memory/archive/` stores immutable historical cycles.
- Task-local `STATE.md` records the exact current phase, heads, evidence, blocker, and next action for active work.

## Revision rules

- `CURRENT.md` must not embed full legacy history.
- Archive entries are append-only.
- Historical bridge artifacts 062/063 remain immutable and must not be rewritten.
- If bootstrap text, remote memory, and repo memory disagree, the current repository primary evidence wins and the mismatch must be called out explicitly.
- `PROJECT_MEMORY.md` must stay compact, carry the current revision fields, and fail closed on revision mismatches.
- After every accepted remote state change, synchronize task STATE, canonical Notion project memory, and the authorized repository memory snapshot in the same execution when authorized.
- When frozen scope or direct-main protection prevents repository-memory publication, create or update a dedicated memory-sync branch, record the deferral explicitly, and assign integration as the next action.

## Work and Codex role boundary

- Codex model preflight and same-thread `CONTINUE` apply only to a Codex implementation lane or numbered bridge command whose current authority explicitly requires them.
- ChatGPT Work maintenance, review, branch preparation, and serialized integration tasks do not run Codex model preflight unless the task package explicitly says otherwise.
- Work must not request, accept, or wait for `CONTINUE` during a task whose active STATE sets `CODEX_MODEL_PREFLIGHT: NOT_APPLICABLE`.
- Work must not reinterpret a Work maintenance or integration task as a Codex implementation lane merely because the repository contains a model-selector contract.
- Local plugin installation belongs to the executor that can access the authenticated user's writable local Codex home. When ChatGPT Work exposes only read-only `/root/.codex` paths, Codex desktop on the user's machine is the correct local installer and parity verifier.
- A Codex desktop local-install phase is maintenance, not a repository implementation lane. Unless the active STATE says otherwise, it uses no model preflight, no model switching, no `CONTINUE`, and no repository writes.
- After local installed-package parity passes, ChatGPT Work remains the serialized integration owner for merging accepted branches into current `main`, pushing, refetching, and synchronizing memory.
- When Work encounters conflicting generic repository wording, the task-local STATE and explicit ChatGPT-authored task instruction control the current Work phase.

## Reporting contract

- Every project status report must end with an exact actionable `NEXT_ACTION`.
- A report that only lists facts, checks, or blockers without telling the user what to do next is incomplete.
- The next action must name the target branch, task, command, or decision required and must state any prerequisite that still blocks execution.

## Ownership

- `CURRENT.md`: active state owner.
- `DECISIONS.md`: process owner.
- `CANON.md`: canon owner.
- `WORKFLOWS.md`: workflow owner.
- `archive/`: historical record owner.
- ChatGPT authors and approves project content and exact task instructions.
- Work and Codex execute technical operations and must not invent missing project content.
