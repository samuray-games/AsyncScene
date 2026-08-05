# Canon

This file captures stable product canon relevant to memory handling.

MEMORY_REVISION: 2026-08-05-1817-JST
EXPECTED_REVISION: 2026-08-05-1817-JST
NOTION_MEMORY_REVISION: 2026-08-05-1817-JST

## Canon principles

- Git-tracked repo content is authoritative for implementation state.
- Memory documents should be easy to read from GitHub without local file access.
- The live memory index must stay compact enough for new chats to load quickly.
- Historical detail belongs in the archive, not the current memory snapshot.
- The canonical live cross-chat bootstrap is the Notion page `ASYNCHRONIA - PROJECT MEMORY`, which must remain synchronized with accepted remote state when authorized.
- Every current-state summary must include the exact next action required to advance the project.
- The assistant uses masculine grammatical self-reference in Asynchronia project communication.

## Accepted Stage 7.5 product slice

- PR #287 is merged at `7a75edea6619d9a55bf2eff8a6d1838cb3edc82f`.
- The existing Stage 7 branch and worldAdvanceId remain authoritative.
- A single branch-derived follow-up choice is persisted in NPC memory before normal-world release.
- GitHub Pages build `30994053777` served the merged entrypoint; Safari acceptance remains pending.

## Accepted Stage 6 product contract

- Stage 6 is complete and accepted.
- Accepted Stage 6 runtime implementation head is `f8fe6555462e072f416ff5d64df8947def74a76e` from merged PR #273.
- Boomer-facing runtime copy consistently uses formal Russian `Вы/Ваш` forms across accepted surfaces.
- Voting prompts are profile-specific for Boomer, Gen X, Millennial, Zoomer, and Alpha. Shared cross-profile fallback leakage is forbidden.
- A fresh first launch keeps the fresh-start label. After the player has entered a game, returning to the start screen shows exactly `Продолжить игру`.
- Every production toast remains visible until that exact toast is clicked. Timer, TTL, and animation-based automatic dismissal are forbidden.
- Toasts dismiss independently. Clicking one toast must not clear unrelated visible toasts.
- Lottery feedback must exist and remain click-only whether or not `#btnLotteryTop` exists. When the anchor is absent, deterministic safe viewport placement is required.
- Disabled lottery behavior and gameplay/economy mechanics remain unchanged by the toast presentation repair.
- Corrected full Safari acceptance passed Boomer formality, five canonical vote prompts, fresh/returning start state, first-entry state, and delta-toast behavior.
- Final hash-gated Safari acceptance verified live `docs/ui/ui-menu.js` Git blob SHA-1 `73cd833d3950b5356300bc3d09c1c8c5c8ef5e87`, then passed anchor-present and anchor-absent lottery-toast existence, visibility, deterministic placement, persistence beyond six seconds, and exact-toast click dismissal.

## Accepted Stage 7 product contract

- Stage 7 was explicitly started by the user and is active.
- Stage 7 is defined as `CORE EXPERIENCE RECONSTRUCTION`, not presentation expansion or cleanup.
- The assistant owns reversible day-to-day sequencing and atomic product/technical decisions. The user retains final ownership, veto, user-visible runtime acceptance, and approval of destructive, irreversible, security-sensitive, externally costly, genre-changing, or business-model-changing decisions.
- Stage 7.0 is complete and accepted. PR #277 merged the five-profile essence modal as `bf54de857e20ea7ac838f6c14e17bfa5cd7b69a3`. PR #278 merged the pre-start stacking repair as `e54390fe6164f601caeaf2819e2ea56ed25c8eb0`.
- Current accepted runtime implementation head is `f00317a022486566293b870f0540db5cbf1ef08c`.
- Product freeze: no new theme, profile, currency, NPC category, location, cosmetic subsystem, or broad secondary-system expansion until observed evidence proves the causal core loop.
- The core loop is `change -> cause -> decision -> action -> consequence -> world advance`.
- Stage 7.1 is complete and user-accepted. It delivers one isolated personal conflict with first meaningful action within 30 seconds, exactly three responses, no pre-action tutorial, and only Money and Reputation visible before normal-world release.
- The first conflict begins with `Кен обвиняет тебя в краже. Все это видят.` The first verb is `Ответить`. One click reveals exactly `Отрицать`, `Обвинить Кена`, and `Заплатить`.
- The three branches must be genuinely different and none objectively correct. Each must create a distinguishable consequence and continuation hook.
- Every meaningful outcome must persist actor, action, target, motive, evidence, prior state, changed state, immediate consequence, relationship change, world change, witness, and future hook as applicable.
- The first central NPC set is Ken, Mika, and Oleg. Their behavior must derive from explicit goals, fears, relationships, memory, debts/promises, current threats, and current plans rather than ambient timer noise.
- Stage 7.5 is `FIRST REAL ASYNCHRONOUS WORLD ADVANCE`. Closing the app is optional.
- After the first conflict, exactly one branch-derived `awaiting_world_advance` continuation is persisted. Foreground and background paths use the same causal source, world mutation, and exactly-once settlement.
- If the player stays, `main_unlocked` opens the available main world and the due continuation later appears live. Repeated clicks cannot force or duplicate it.
- If the player leaves or backgrounds the app, the same due continuation appears on return as `Пока тебя не было...`.
- The first unlocked main-world overlay is `post_conflict_freedom_card`, not a ninth frozen state.
- Accepted freedom-card copy: title `Мир живёт дальше`; body `Первый конфликт завершён. Можешь продолжить исследовать игру или заняться своими делами. Мир будет жить дальше и меняться из-за твоего выбора, даже когда тебя нет в игре. Когда вернёшься, увидишь, к чему всё привело.`; primary CTA `Продолжить исследовать`; support line `Можно закрыть игру в любой момент. Всё сохранено.`
- The freedom card grants permission to leave but never forces exit, opens an external service, fakes closing the app, changes settlement timing, or implies that the player is irrelevant.
- User testing must happen before world expansion. Hard criteria include first action and cycle-time targets, causal comprehension, three distinguishable continuations, visible reflection of the earlier choice, and no meaningful event without an explainable cause.
- Stage 7.1 user acceptance passed in iPhone Safari after PR #282 merge `1333ddda7aceacf0f10cd6b2b3f9baa30fe0a9db` and Pages build `1132995890`; the private-tab retest confirmed the legacy-save migration and repaired cache delivery.
- Stage 7.2 is the observed core-loop evidence harness. It is enabled only by explicit test mode and must not alter normal-player behavior. It measures first-action time, complete-cycle time, branch choice, foreground/return path, and exactly-once continuation settlement, then records compact causal-comprehension and continuation-interest answers.
- Stage 7.2 user-observed evidence is accepted for one foreground sample: first action 22238 ms, complete cycle 64778 ms, comprehension 5/5, exactly-once counts 1/1/1, continuation interest `Да`. This does not establish population percentages or return-path coverage.
- Stage 7.3 adds explicit-test-mode evidence that the selected branch and world-advance identity remain causally stable through continuation presentation.

## Protected facts

- Bridge artifacts 062/063 are immutable history.
- Memory migration must not touch runtime/game code.
- Accepted behavior, UI canon, and process contracts should be recorded once here rather than repeated in the live index.
- The legacy pre-split root memory must be preserved as an archive artifact with exact bytes, not reauthored from summary text.
- A pending implementation branch is evidence of current work, not an accepted main state.
- Direct task writes to `main` remain forbidden unless explicit current authority grants them.
- Work and Codex are separate execution roles. Codex continuation gates are not automatically inherited by Work documentation maintenance or integration tasks.
- Documentation-only maintenance does not invoke model-selector or request same-thread `CONTINUE` when direct safe tools are available.
- A cloud Work container's read-only `/root/.codex` is not the user's local Codex installation. Local plugin installation and parity must run in an executor that can access the authenticated user's writable Codex home.
- Codex desktop may perform an explicitly authorized local plugin installation and parity phase without becoming the repository integration owner.
- Serialized integration into `main` remains a separate phase after installed-package parity passes.
- PR #263 merge `6a82086174546fa24b10a22109f6a9a6e307c24e` remains accepted history for capability-calibration policy gates, with reviewed head `4da08911b057f42463ded1870a5a52b2906bef1e` and merge parents `d4527217e3ec4b5cbe1974fc8a300058a` and `4da08911b057f42463ded1870a5a52b2906bef1e`.
- PR #249 remains accepted history for Stage 6 Alpha legacy smoke contract realignment with reviewed head `0928e367de57a6769d99e2206c6f86b7072302ff`.
- PR #248 remains accepted history for model-selector inventory maintenance with reviewed head `f13a0cbdf293dc8d82bb91c21e5879cfa2712d5b` and merge commit `88b5cf6dbe4d4db76187aca3b6baaa3e2a4d6108`.
- PR #243 remains accepted history for the prerequisite shared dev-check/index conflict-marker repair with reviewed head `4673302113c22606d86c06d778d73641e03f2735`, original locally validated content-equivalent commit `5a3fac9e51b19b8273b03db9558a5fa900aefac2`, and merge commit `bb1b383f88bce5e22bed116fd195edb6a0a6c58b`.
- PR #246 is bookkeeping closure history, with reviewed head `be4f8fdb5f84a1a4f07fac270a87cf811be71b18` and merge commit `2e360a6137f8b15e28c004a66afc7ed320ce7024`; it does not replace the accepted runtime implementation head.
- Legacy Alpha Step 4.3.x smoke failures are `LEGACY_ALPHA_SMOKE_CONTRACT_DRIFT: REPAIRED / INTEGRATED`, not a Stage 6 frozen-copy product regression. Current canonical counts are 174 / 152 / 206 versus historical Step 4.3.6 counts 164 / 122 / 187.
- PR #263 capability calibration is complete and integrated. Durable selector calibration facts remain unchanged from revision `20260801.1`.
- Current model inventory revision `20260801.1` contains 6 models and 29 model-effort pairs. `Low` is not a recorded effort label.
- Conversational `мост 1`, `мост 2`, and `мост 3` mean Slot 1, Slot 2, and Slot 3 respectively. They are conversational slot references and do not invoke the retired literal short bridge command interface unless the user explicitly says they are issuing such a command.
- The retired short bridge interface remains permanently retired and is not current workflow authority. Future Codex work uses full self-contained prompt sheets/tasks.
- PR #263 capability calibration, PR #265 security repair, and PR #266 canon reconciliation are complete and integrated history.
- PR #272 merged the complete four-group Stage 6 runtime repair as `2b5fbe4f4a250dfc50af732490a672b0c33a9cb6`.
- PR #273 merged the final anchor-optional lottery-toast repair as `f8fe6555462e072f416ff5d64df8947def74a76e`.
- The former Google Drive project-memory document is a deprecated migration stub and never substitutes for the live Notion bootstrap.

## Reading priority

- Use current repository primary evidence first for implementation state.
- Use active task or bridge STATE for exact in-flight phase and next action.
- Use `CURRENT.md` for the compact live summary.
- Use this file for stable canon.
- Fetch the canonical Notion page in the current response and report its exact top-level `MEMORY_REV`.
- Fetch the existing active handoff immediately afterward.
- The former Google Drive document is a deprecated migration stub only.
- Use the archive only when the current state needs historical context.
- NEXT_ACTION: `IMPLEMENT_STAGE7_3_RETURN_CONTINUITY_EVIDENCE_IN_EXPLICIT_TEST_MODE_ONLY`.