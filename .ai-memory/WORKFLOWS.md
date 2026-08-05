# Workflows

This file documents the minimum workflows for the repo-first memory system.

MEMORY_REVISION: 2026-08-05-1817-JST
EXPECTED_REVISION: 2026-08-05-1817-JST
NOTION_MEMORY_REVISION: 2026-08-05-1817-JST

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

Current execution handoff: Stage 6 is complete and accepted. Stage 7.0 and Stage 7.4 are complete and user-accepted. Stage 7.5 is merged at `7a75edea6619d9a55bf2eff8a6d1838cb3edc82f`; Pages build `30994053777` is built and served. The exact next product action is `USER_RUN_STAGE7_5_BRANCH_DERIVED_FOLLOW_UP_IN_IPHONE_SAFARI_PRIVATE_TAB_AND_RETURN_EXACT_RESULT`.

Conversational slot shorthand: interpret `мост 1`, `мост 2`, and `мост 3` as Slot 1, Slot 2, and Slot 3 references. Do not route them as the retired literal short command interface unless the user explicitly says they are issuing a command.

## Bootstrap workflow

1. Fetch the canonical Notion page `ASYNCHRONIA - PROJECT MEMORY` during the current response.
2. Report its exact top-level `MEMORY_REV`.
3. Fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF` immediately afterward when project execution state is needed.
4. Verify current repository primary sources, exact remote branches, SHAs, and the active memory surfaces.
5. Read `AGENTS.override.md`, `AGENTS.md`, `TASKS.md`, `PROJECT_MEMORY.md`, `.ai-memory/CURRENT.md`, `.ai-memory/CANON.md`, and `.ai-memory/WORKFLOWS.md` as required by the task.
6. Confirm current accepted runtime implementation head and current repository policy before acting.
7. Preserve closed historical security, calibration, and Stage 6 task chains unless a new explicit user instruction reopens them.
8. Do not infer stage activation from a historical draft. For Stage 7, the required explicit user authorization has been received and is recorded in live Notion and repository memory.

Canonical Notion page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`.
Active handoff page ID: `3b1815ae-752f-811a-8b90-f6c43d13611c`.
Canonical URL: https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111.
The former Google Drive document is a deprecated migration stub only.

## Same-execution update workflow

After every accepted remote state change:

1. Update the task-local `STATE.md` with exact branches, SHAs, validations, blocker, phase, and `NEXT_ACTION` when one exists.
2. Update the canonical Notion project memory when authorized.
3. Update the existing active handoff; do not create a replacement page.
4. Update `CURRENT.md` with the compact live state.
5. Update `PROJECT_MEMORY.md` as the compact index and pointer file.
6. Update `DECISIONS.md`, `CANON.md`, or `WORKFLOWS.md` only when a durable rule changed.
7. Update `TASKS.md` when the active work state changes and the exact task scope and editing surface permit it.
8. Append completed cycle history to `.ai-memory/archive/` only after acceptance and integration.
9. Re-read every written target and verify revision, branches, SHAs, status, and next action.

## Work versus Codex routing workflow

1. Read the active task-local `STATE.md` before invoking any plugin skill when one exists.
2. If the active phase is documentation-only maintenance, do not invoke model-selector, do not pause for model selection, and do not request or accept same-thread `CONTINUE`.
3. Apply Codex model preflight only to an actual Codex implementation lane or numbered bridge command whose current authority explicitly requires it.
4. Generic Codex rules found in `AGENTS.md` do not override a more specific task-local Work phase.
5. If the repository reports a remote branch head or absence, fresh-fetch the remote before treating it as evidence.
6. A documentation-only response that asks the user for `CONTINUE` is `WORK_ROLE_CONFUSION` and must be rejected without sending `CONTINUE`.
7. Respect explicit user quota constraints. Do not invoke Work or Codex for mechanical documentation synchronization when direct safe tools are available.

## Stage 7 execution workflow

1. Enforce the product freeze until observed user evidence proves the causal core loop.
2. Stage 7.1 is complete and user-accepted through `main@1333ddda7aceacf0f10cd6b2b3f9baa30fe0a9db`; do not reopen it without a concrete regression.
3. Stage 7.2 observed-evidence harness is merged and one foreground Safari sample is user-accepted; do not claim population coverage or return-path acceptance.
4. Implement one atomic Stage 7.3 continuation-integrity evidence slice behind explicit test mode only.
5. Normal-player behavior must remain byte-for-byte or semantically unchanged outside explicit test mode.
6. Measure first meaningful action time, complete-cycle time, selected branch, foreground/return continuation path, and exactly-once settlement.
7. Collect compact causal-comprehension answers covering accusation, chosen action, reaction, resource consequence, and later world change.
8. Collect one continuation-interest answer without forcing a positive response or changing settlement.
9. Produce one deterministic developer report with thresholds, raw answers, pass/fail fields, and no network transmission.
10. Source and deployed mirrors, persistence, settlement traceability, and Safari acceptance remain mandatory.
11. World expansion remains frozen until the evidence harness can produce observed results.

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
4. Record `MAIN_SHARED_MEMORY_DEFERRED_UNTIL_MEMORY_SYNC_INTEGRATION` in active state and canonical Notion memory.
5. Name integration of the memory-sync branch in the exact `NEXT_ACTION` when integration is still pending.
6. Do not claim all repository memory is synchronized on `main` until the memory-sync branch is integrated and re-read.

## Conflict workflow

1. If repository primary implementation evidence conflicts with Notion, use the repository fact.
2. If tracked repository memory conflicts with newer accepted implementation evidence and live Notion, report the exact stale paths and repair them on a dedicated memory-sync branch.
3. Report the exact conflict with paths, branches, and SHAs.
4. Update canonical Notion in the same execution when authorized; otherwise state synchronization deferred.
5. If repository-memory integration is blocked by scope or branch policy, publish a dedicated memory-sync branch and record the deferral.
6. Do not overwrite accepted bridge history or runtime facts.

## Stage transition workflow

1. Closing an accepted stage does not authorize the next stage.
2. Historical drafts are not active tasks.
3. A new stage may begin only after a new explicit user instruction naming or clearly authorizing that work.
4. Stage 7 satisfied this gate through explicit user authorization and is now active. Do not revert it to historical or inactive status from older snapshots.
5. Future stage transitions still require their own explicit authorization.

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
- Run `git diff --check` or equivalent repository formatting validation before integration when a local checkout is available.
- Through connector-only maintenance, use branch readback, exact file comparison, and PR changed-path verification as the equivalent evidence surface.
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

NEXT_ACTION: IMPLEMENT_STAGE7_2_OBSERVED_CORE_LOOP_EVIDENCE_HARNESS_IN_EXPLICIT_TEST_MODE_ONLY