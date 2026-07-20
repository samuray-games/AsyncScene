# Canon

This file captures stable product canon relevant to memory handling.

MEMORY_REVISION: 2026-07-20-1649-JST
EXPECTED_REVISION: 2026-07-20-1649-JST
NOTION_MEMORY_REVISION: 2026-07-20-1649-JST

## Canon principles

- Git-tracked repo content is authoritative for implementation state.
- Memory documents should be easy to read from GitHub without local file access.
- The live memory index must stay compact enough for new chats to load quickly.
- Historical detail belongs in the archive, not the current memory snapshot.
- The canonical live cross-chat bootstrap is the Notion page `ASYNCHRONIA - PROJECT MEMORY`, which must remain synchronized with accepted remote state when authorized.
- Every current-state summary must include the exact next action required to advance the project.

## Protected facts

- Bridge artifacts 062/063 are immutable history.
- Memory migration must not touch runtime/game code.
- Accepted behavior, UI canon, and process contracts should be recorded once here rather than repeated in the live index.
- The legacy pre-split root memory must be preserved as an archive artifact with exact bytes, not reauthored from summary text.
- A pending implementation branch is evidence of current work, not an accepted main state.
- Direct task writes to `main` remain forbidden unless explicit current authority grants them.
- Work and Codex are separate execution roles. Codex continuation gates are not automatically inherited by Work maintenance or integration tasks.
- A cloud Work container's read-only `/root/.codex` is not the user's local Codex installation. Local plugin installation and parity must run in an executor that can access the authenticated user's writable Codex home.
- Codex desktop may perform an explicitly authorized local plugin installation and parity phase without becoming the repository integration owner.
- Serialized integration into `main` remains a separate phase after installed-package parity passes.
- Accepted implementation head remains PR #240 merge `d9a7e1b954e5f122a1621785e2176d93b697873f`; PR #241 repository-memory closure is memory/task bookkeeping only, with reviewed head `e43fcdb67cd24d46ac9358bbe79d8f2aba0b034a` and merge commit `92db49b0249e9b87e04bb87ea8123cda5833dd95`; PR #240 Bridge v4 backend/control-plane repair is integrated and `BRIDGE_TASK_PROFILE_2` is current; Stage 6 product implementation has not started and runtime remains stopped.
- The retired short bridge interface remains permanently retired and is not current workflow authority. Future Codex work uses full self-contained prompt sheets/tasks. The user has explicitly directed Stage 6 continuation; the next action is the serialized Stage 6 shared dev-check/index conflict-marker repair task, not another memory-closure cycle.

## Reading priority

- Use current repository primary evidence first.
- Use active task or bridge STATE for exact in-flight phase and next action.
- Use `CURRENT.md` for the compact live summary.
- Use this file for stable canon.
- Fetch the canonical Notion page in the current response and report its exact top-level `MEMORY_REV`.
- The former Google Drive document is a deprecated migration stub only.
- Use the archive only when the current state needs historical context.
