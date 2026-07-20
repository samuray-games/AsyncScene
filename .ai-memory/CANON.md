# Canon

This file captures stable product canon relevant to memory handling.

MEMORY_REVISION: 2026-07-20-1957-JST
EXPECTED_REVISION: 2026-07-20-1957-JST
NOTION_MEMORY_REVISION: 2026-07-20-1957-JST

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
- Accepted implementation head is PR #243 merge `bb1b383f88bce5e22bed116fd195edb6a0a6c58b`; PR #243 completed the prerequisite shared dev-check/index conflict-marker repair with reviewed head `4673302113c22606d86c06d778d73641e03f2735` and original locally validated content-equivalent commit `5a3fac9e51b19b8273b03db9558a5fa900aefac2`.
- Stage 6 product implementation and Alpha implementation have not started; Safari runtime smoke remains `PENDING_USER`.
- The retired short bridge interface remains permanently retired and is not current workflow authority. Future Codex work uses full self-contained prompt sheets/tasks. The post-PR243 repository-memory closure is complete/closed, and the durable handoff is `TASK-STAGE6-ALPHA-FROZEN-COPY-IMPLEMENTATION`.

## Reading priority

- Use current repository primary evidence first.
- Use active task or bridge STATE for exact in-flight phase and next action.
- Use `CURRENT.md` for the compact live summary.
- Use this file for stable canon.
- Fetch the canonical Notion page in the current response and report its exact top-level `MEMORY_REV`.
- The former Google Drive document is a deprecated migration stub only.
- Use the archive only when the current state needs historical context.
