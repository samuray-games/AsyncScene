# Canon

This file captures stable product canon relevant to memory handling.

MEMORY_REVISION: 2026-07-21-0215-JST
EXPECTED_REVISION: 2026-07-21-0215-JST
NOTION_MEMORY_REVISION: 2026-07-21-0215-JST

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
- Accepted implementation head is PR #245 merge `5e82e587241a180f44814cdfe7445da015c136dc`; PR #245 integrated the Stage 6 Alpha frozen copy with reviewed head `547ed5d5c8d3e7395b7d8a2cd8c60cfbe3608694`. PR #243 remains accepted history for the prerequisite shared dev-check/index conflict-marker repair with reviewed head `4673302113c22606d86c06d778d73641e03f2735`, original locally validated content-equivalent commit `5a3fac9e51b19b8273b03db9558a5fa900aefac2`, and merge commit `bb1b383f88bce5e22bed116fd195edb6a0a6c58b`.
- PR #246 is bookkeeping closure history, with reviewed head `be4f8fdb5f84a1a4f07fac270a87cf811be71b18` and merge commit `2e360a6137f8b15e28c004a66afc7ed320ce7024`; it does not replace the accepted implementation head.
- Stage 6 product implementation has started and Alpha frozen-copy implementation is complete/integrated. The user-executed Safari Stage 6 Alpha frozen-copy matrix passed with active profile `alpha`, `ok:true`, and `failures:[]`; Stage 6 overall is not complete.
- Legacy Alpha Step 4.3.x smoke failures are `LEGACY_ALPHA_SMOKE_CONTRACT_DRIFT: OPEN`, not a Stage 6 frozen-copy product regression. Current canonical counts are 174 / 152 / 206 versus historical Step 4.3.6 counts 164 / 122 / 187.
- Conversational `мост 1`, `мост 2`, and `мост 3` mean Slot 1, Slot 2, and Slot 3 respectively. They are conversational slot references and do not invoke the retired literal short bridge command interface unless the user explicitly says they are issuing such a command.
- The retired short bridge interface remains permanently retired and is not current workflow authority. Future Codex work uses full self-contained prompt sheets/tasks. The post-Alpha-Safari-pass repository-memory closure is complete/closed, and the durable handoff is `TASK-STAGE6-ALPHA-LEGACY-SMOKE-CONTRACT-REALIGNMENT-20260721`.

## Reading priority

- Use current repository primary evidence first.
- Use active task or bridge STATE for exact in-flight phase and next action.
- Use `CURRENT.md` for the compact live summary.
- Use this file for stable canon.
- Fetch the canonical Notion page in the current response and report its exact top-level `MEMORY_REV`.
- The former Google Drive document is a deprecated migration stub only.
- Use the archive only when the current state needs historical context.
