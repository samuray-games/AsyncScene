# STAGE 6 STEP 9 - SOURCE DECISIONS RESOLVED

STATUS: `SOURCE_DECISIONS_RESOLVED / DRAFT_FOUNDATION / NOT_FROZEN`

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

## 1. Purpose

Resolve the two blocked rows that were intentionally held out of creative rewriting:

- `npcArrestCop`
- `npcArrestMafia`
- `npcArrestBandit`
- `npcArrestToxic`
- `npcArrestCrowd`
- `p2pBacklogReason`

These are source/product classification decisions, not five-profile creative copy.

## 2. npcArrest* decision

Current main still contains five legacy `systemEvents` copy keys:

- `npcArrestCop`
- `npcArrestMafia`
- `npcArrestBandit`
- `npcArrestToxic`
- `npcArrestCrowd`

Fresh repository inspection does not show an active routed runtime callsite for this family. The current system-event taxonomy/inventory does not include an arrest family as an active player-facing event family, and the current NPC event path is handled by the active battle/event outcome routes rather than these keys.

Historical full-text inventory already classified the surrounding victory/defeat/arrest block as a canonical production gap / runtime-blocked legacy area.

Final classification:

`LEGACY_ORPHAN_COPY`

`LEGACY_SUPERSEDED_CANDIDATE`

Creative consequence:

- remove all `npcArrest*` rows from the Step 9 five-profile rewrite queue;
- do not invent Boomer / Gen X / Millennial / Zoomer / Alpha wording for a mechanic that is not currently routed;
- classify them as `LEGACY_SUPERSEDED` during fresh inventory/gap closure unless a hidden active callsite is discovered;
- delete the dead keys only after Step 3 fresh-current-main inventory and Step 4 gap closure prove there is no hidden dependency.

No runtime deletion is authorized by this foundation artifact itself.

## 3. P2P backlog decision

`p2pBacklogReason = "P2P: анти-абуз."` is real player-facing technical debt, not generational flavour copy.

Current behavior when either P2P feature flag is disabled:

1. the UI treats the P2P backlog as active;
2. it renders a disabled block;
3. title resolves to `Недоступно.`;
4. reason resolves to `P2P: анти-абуз.`;
5. `Почему?` resolves again to `Недоступно.`.

This is not useful product communication and must not be multiplied into five generational variants.

Final product decision:

`HIDE_DISABLED_P2P_BLOCK_UNTIL_FEATURE_ENABLED`

Required implementation behavior:

- when P2P transfer capability is not fully enabled, do not render the unfinished P2P transfer block at all;
- do not show `P2P: анти-абуз.`;
- do not show a dead `Почему?` explanation affordance;
- do not create Boomer / Gen X / Millennial / Zoomer / Alpha variants of the backlog reason;
- when P2P is actually enabled, normal transfer surfaces become eligible for five-profile copy review: recipient, amount, validation, insufficient funds, self-transfer prevention, success/failure, sent/received notifications.

If product direction later intentionally changes to teasing a future P2P feature, that requires a separate explicit product decision and human-facing copy such as `Передача денег между игроками пока недоступна.`. That is not the current decision.

## 4. Step 9 scope consequences

`npcArrest*`

-> leave creative queue

-> enter `LEGACY_SUPERSEDED` verification queue

`p2pBacklogReason`

-> leave generational creative queue

-> enter implementation requirement: hide disabled P2P block while capability is off

Neither item blocks the Russian cultural authenticity pass anymore.

## 5. Authority relationship

This artifact supersedes the unresolved status notes for these exact items in:

- `STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH3_SYSTEM_EVENTS_DRAFT.md`
- `STAGE6_STEP9_CREATIVE_REVIEW_INDEX.md`
- `STAGE6_STEP9_ALPHA_RUSSIAN_FIRST_REWRITE_V1.md`

Only for the classification of `npcArrest*` and `p2pBacklogReason`.

It does not freeze runtime implementation copy and does not authorize unrelated cleanup.

NEXT_ACTION: `RU_CULTURAL_AUTHENTICITY_PASS_ALL_FIVE_COLUMNS`.
