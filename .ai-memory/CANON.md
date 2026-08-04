# Canon

This file records stable product and memory canon.

MEMORY_REVISION: 2026-08-04-1642-JST
EXPECTED_REVISION: 2026-08-04-1642-JST
NOTION_MEMORY_REVISION: 2026-08-04-1642-JST

## Canon principles

- Current repository policy, source, tests, and execution evidence are authoritative for implementation state.
- The canonical cross-chat bootstrap is the live Notion page `ASYNCHRONIA - PROJECT MEMORY`.
- Current summaries stay compact; historical detail remains in Git history and `.ai-memory/archive/`.
- Direct writes to `main` are forbidden unless current repository authority explicitly permits them.
- A pending branch is evidence of work, not accepted main state.
- Every active status must name one exact next action.

## Accepted Stage 6 product contract

- Stage 6 is complete and accepted.
- Accepted runtime implementation head: `f8fe6555462e072f416ff5d64df8947def74a76e`.
- Boomer-facing runtime copy consistently uses formal Russian `Вы/Ваш` forms across accepted surfaces.
- Voting prompts are profile-specific for Boomer, Gen X, Millennial, Zoomer, and Alpha; shared cross-profile fallback leakage is forbidden.
- A fresh first launch keeps the fresh-start label. After the player has entered a game, returning to the start screen shows exactly `Продолжить игру`.
- Every production toast remains visible until that exact toast is clicked. Timer, TTL, and animation-based automatic dismissal are forbidden.
- Toasts dismiss independently; clicking one toast must not clear unrelated visible toasts.
- Lottery feedback must exist and remain click-only whether or not `#btnLotteryTop` exists. When the anchor is absent, deterministic safe viewport placement is required.
- Disabled lottery behavior and gameplay/economy mechanics remain unchanged by the toast presentation repair.

## Acceptance evidence

- PR #272 merged the full Stage 6 runtime repair batch.
- PR #273 merged the final anchor-optional lottery-toast repair.
- Corrected full Safari acceptance passed Boomer formality, five canonical vote prompts, fresh/returning start behavior, first-entry state, and delta-toast aggregation, persistence, and independent click dismissal.
- Final Safari acceptance verified live `docs/ui/ui-menu.js` Git blob SHA-1 `73cd833d3950b5356300bc3d09c1c8c5c8ef5e87`, then passed anchor-present and anchor-absent lottery-toast existence, visibility, deterministic placement, persistence beyond six seconds, and click dismissal.

## Protected facts

- Stage 7 is a historical non-active draft. It must not be inferred, revived, planned, implemented, or published without a new explicit user instruction.
- Bridge artifacts 062/063 remain immutable history.
- The retired short bridge interface remains retired. Conversational `мост 1`, `мост 2`, and `мост 3` mean Slot 1, Slot 2, and Slot 3 unless the user explicitly invokes another contract.
- The former Google Drive project-memory document is a deprecated migration stub and never substitutes for the live Notion bootstrap.
- Current model inventory revision `20260801.1` contains 6 models and 29 model-effort pairs. `Low` is not a recorded effort label.

## Reading priority

1. Latest explicit user instruction.
2. Current project instructions.
3. `AGENTS.override.md`, `AGENTS.md`, and applicable policy files.
4. Current repository execution sources and relevant code.
5. Live canonical Notion memory.
6. Historical archives and backups.
