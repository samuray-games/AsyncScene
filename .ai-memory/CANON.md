# Canon

This file captures stable product canon relevant to memory handling.

MEMORY_REVISION: 2026-07-20-0157-JST
EXPECTED_REVISION: 2026-07-20-0157-JST
NOTION_MEMORY_REVISION: 2026-07-20-0158-JST

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
- Accepted main is `c99d8cebdcf9c36ecf09c05be9eb746b6bb7b699`; R2 history remediation, post-R2 canonical realignment, post-R2 repository-memory closure, and transport resilience integration through PR #238 are PASS; Stage 6 and runtime remain stopped.

## Reading priority

- Use current repository primary evidence first.
- Use active task or bridge STATE for exact in-flight phase and next action.
- Use `CURRENT.md` for the compact live summary.
- Use this file for stable canon.
- Fetch the canonical Notion page in the current response and report its exact top-level `MEMORY_REV`.
- The former Google Drive document is a deprecated migration stub only.
- Use the archive only when the current state needs historical context.
