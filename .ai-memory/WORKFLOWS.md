# Workflows

This file documents the minimum workflows for the repo-first memory system.

MEMORY_REVISION: 2026-07-21-0215-JST
EXPECTED_REVISION: 2026-07-21-0215-JST
NOTION_MEMORY_REVISION: 2026-07-21-0215-JST

Authoritative order for memory and workflow facts:

1. Explicit user instruction
2. Current repository primary evidence
3. Active task or bridge `STATE.md`
4. `PROJECT_MEMORY.md`
5. `.ai-memory/CURRENT.md`
6. `.ai-memory/DECISIONS.md`
7. `.ai-memory/CANON.md`
8. `.ai-memory/WORKFLOWS.md`
9. `TASKS.md`
10. Canonical Notion page `ASYNCHRONIA - PROJECT MEMORY`
11. `.ai-memory/archive/`

Current execution handoff: the user-executed Safari Stage 6 Alpha frozen-copy matrix passed with active profile `alpha`, `ok:true`, and `failures:[]`; the post-Alpha-Safari-pass repository-memory closure is complete/closed. Legacy Alpha Step 4.3.x smoke failures are classified as `LEGACY_ALPHA_SMOKE_CONTRACT_DRIFT: OPEN`, not as Stage 6 frozen-copy product regression. The retired short bridge interface is not current workflow authority. Future Codex work uses full self-contained prompt sheets/tasks. Stage 6 overall is not complete; the next action is `TASK-STAGE6-ALPHA-LEGACY-SMOKE-CONTRACT-REALIGNMENT-20260721`.

Conversational slot shorthand: interpret `мост 1`, `мост 2`, and `мост 3` as Slot 1, Slot 2, and Slot 3 references. Do not route them as the retired literal short command interface unless the user explicitly says they are issuing a command.

## Bootstrap workflow

1. Fetch the canonical Notion page `ASYNCHRONIA - PROJECT MEMORY` in the current response.
2. Report its exact top-level `MEMORY_REV`.
3. Read the active task or bridge `STATE.md`.
4. Verify current repository primary sources, exact remote branches, SHAs, code, and runtime evidence.
5. Read `PROJECT_MEMORY.md` and `.ai-memory/CURRENT.md`.
6. Read `.ai-memory/DECISIONS.md`, `.ai-memory/CANON.md`, `.ai-memory/WORKFLOWS.md`, and `TASKS.md` as relevant.
7. Use Notion as compact cross-chat bootstrap context and archives/backups as historical evidence only.
8. Follow defined Notion recovery paths and fail closed if the canonical page cannot be loaded or a revision conflict remains unresolved.

Canonical Notion page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`.
Canonical URL: https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111.
The former Google Drive document is a deprecated migration stub only.

## Same-execution update workflow

After every accepted remote state change:

1. Update the task-local `STATE.md` with exact branches, SHAs, validations, blocker, phase, and `NEXT_ACTION`.
2. Update the canonical Notion project memory when authorized.
3. Update `CURRENT.md` with the compact live state.
4. Update `PROJECT_MEMORY.md` as the compact index and pointer file.
5. Update `DECISIONS.md`, `CANON.md`, or `WORKFLOWS.md` only when a durable rule changed.
6. Update `TASKS.md` when the active work state changes and the exact task scope permits it.
7. Append completed cycle history to `.ai-memory/archive/` only after acceptance and integration.
8. Re-read every written target and verify revision, branches, SHAs, status, and next action.

## Work versus Codex routing workflow

1. Read the active task-local `STATE.md` before invoking any plugin skill.
2. If the active phase is ChatGPT Work maintenance or serialized integration and `CODEX_MODEL_PREFLIGHT: NOT_APPLICABLE`, do not invoke model-selector, do not pause for model selection, and do not request or accept same-thread `CONTINUE`.
3. Apply Codex model preflight only to an actual Codex implementation lane or numbered bridge command whose current authority explicitly requires it.
4. Generic Codex rules found in `AGENTS.md` do not override a more specific task-local Work phase.
5. If Work reports a remote branch head or absence, it must first fresh-fetch the remote. A stale local branch or stale remote-tracking ref is not evidence.
6. A Work response that asks the user for `CONTINUE` during a no-preflight Work phase is `WORK_ROLE_CONFUSION` and must be rejected without sending `CONTINUE`.

## Local plugin installation and parity workflow

1. Determine which executor can access the authenticated user's writable local Codex plugin home.
2. Do not treat ChatGPT Work's `/root/.codex` as the user's local installation.
3. If Work plugin targets are read-only or unrelated to the user's machine, route only the local installation and parity phase to Codex desktop.
4. The ChatGPT-authored Codex task must name the exact accepted repository branch, commit, plugin source directory, expected version, expected source hash, allowed local write surface, and forbidden repository actions.
5. This Codex phase is local maintenance only. Unless the active STATE explicitly says otherwise, do not invoke model-selector, do not switch models, do not request `CONTINUE`, and do not modify repository files.
6. Codex must inspect the existing local plugin installation mechanism and active Asynchronia path from actual configuration or filesystem evidence. It must not guess based on Work's `/root` paths.
7. Install or refresh the exact accepted repository package as the required version.
8. Report the exact installed package path, plugin version, source and installed model-selector SHA-256 values, equality result, commands, exit codes, and any installer or registry evidence used.
9. If parity fails or the active install mechanism cannot be proven, stop without repository writes and return the exact blocker.
10. After parity PASS, hand the task back to ChatGPT Work for serialized integration into current `main`, remote readback, and memory synchronization.

## Protected-scope workflow

1. Never widen an active implementation scope merely to update shared memory.
2. Never write directly to `main` when repository policy forbids it.
3. When current task scope prevents a shared-memory write, create or update a dedicated memory-sync branch from current `main`.
4. Record `MAIN_SHARED_MEMORY_DEFERRED_UNTIL_IMPLEMENTATION_ACCEPTANCE_AND_INTEGRATION` in active state and canonical Notion memory.
5. Name integration of the memory-sync branch in the exact `NEXT_ACTION`.
6. Do not claim all repository memory is synchronized on `main` until the memory-sync branch is integrated and re-read.

## Conflict workflow

1. If repository primary evidence conflicts with Notion, use the repository fact.
2. Report the exact conflict with paths, branches, and SHAs.
3. Update canonical Notion in the same execution when authorized; otherwise state synchronization deferred.
4. If repository-memory integration is blocked by scope or branch policy, publish a dedicated memory-sync branch and record the deferral.
5. Do not overwrite accepted bridge history or runtime facts.

## Reporting workflow

Every project status report must end with an exact `NEXT_ACTION` that:

- names what the user or next executor must do;
- identifies the exact branch, task, command, review, or decision target;
- states prerequisites and blockers;
- does not offer a menu when one authoritative next step exists.

A report without a concrete `NEXT_ACTION` is incomplete, regardless of how many checks and hashes it contains. Apparently computers also need to be told that information without direction is just decorative paperwork.

## Validation workflow

- Run documentation-only checks for link integrity and file presence for memory-only changes.
- Do not use runtime or gameplay smoke for memory-only changes.
- Keep evidence limited to files actually changed.
- Verify revision consistency across the root index and current child files.
- Verify exact Notion `MEMORY_REV` and current remote branch heads after writes.
- Run `git diff --check` or equivalent repository formatting validation before integration.
- Treat any unresolved revision mismatch as fail-closed until the root index is updated.

## Work journaling workflow

Every Asynchronia ChatGPT Work execution, including read-only analysis, must publish one immutable `WORK` forensic package.

Required sequence:

1. Allocate a unique `WORK` run id at execution start.
2. Record the live memory revision, repository, input task, inspected refs and files, observed SHAs, connector actions, returned commits or URLs, validations, failures, final status, and exact `NEXT_ACTION`.
3. Sanitize and validate the record before any remote publication.
4. Publish exactly one immutable package to `forensics/ai-runs`.
5. Verify remote readback of the published package.
6. Add exactly one Issue `#224` index comment beginning with `<!-- AI_FORENSICS_RUN_V1 -->` only after remote verification succeeds.
7. Report journal failure explicitly. Never claim upload success without remote proof.

This workflow is protocol-enforced. It is not a hidden machine-local Work lifecycle hook.

## `лог` review workflow

The exact trimmed command alias is:

`лог`

When the user writes exactly `лог`, ChatGPT must:

1. Fetch the canonical Notion project memory in the current response and report exact `MEMORY_REV`.
2. Fetch current repository primary evidence.
3. Read Issue `#224` and find the newest valid `<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->` comment.
4. Enumerate all later valid `<!-- AI_FORENSICS_RUN_V1 -->` comments for `CODEX`, `WORK`, and `GITHUB`.
5. Fetch every referenced immutable package from `forensics/ai-runs`.
6. Verify package hashes, schema, markers, actor, run id, task id, branch, commit, time ordering, and remote existence.
7. Correlate declared agent actions with independent GitHub evidence.
8. Identify the earliest evidence-backed divergence, downstream effects, missing coverage, unresolved ambiguity, and required correction.
9. Report findings in Russian with exact evidence citations and without inventing unavailable reasoning.
10. Only after analysis completes, add one new `<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->` comment containing analyzed-through Issue comment id or time, package commits, verdict, and analysis timestamp.

If there are no new valid forensic records after the latest cursor, report exactly that and do not fabricate an incident.
