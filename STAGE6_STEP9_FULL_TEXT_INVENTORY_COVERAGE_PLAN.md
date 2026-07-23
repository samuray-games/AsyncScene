# STAGE6 STEP 9 - FULL TEXT INVENTORY COVERAGE PLAN

STATUS: FOUNDATION / REFRESH_REQUIRED_BEFORE_FREEZE
FOUNDATION_BASELINE_MAIN: 7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e
SEED_PACKAGE: FULL_TEXT_INVENTORY_CURRENT_MAIN_PACKAGE.zip
SEED_SNAPSHOT_COMMIT: e94e4bcb888f4a1e54b2879e3a810118e53a62d9
SEED_SNAPSHOT_DATE: 2026-07-03
IMPORTANT: The seed package is older than current main and is not current implementation authority.

## 1. Why this exists

Step 9 requires a complete text audit, not a hand-picked list of visible examples.

The provided deterministic inventory seed contains:
- 1930 active records;
- 1731 current-main authoritative/resolved rows for its snapshot;
- 199 tracked-baseline fallback rows;
- 853 unique active rendered/source texts;
- 306 dynamic template rows;
- 0 placeholder mismatches in the seed snapshot.

Profiles represented in the seed:
- alpha: 340
- boomer: 346
- default: 67
- genz: 104
- millennial: 278
- shared: 518
- zoomer: 277

There is no first-class Gen X inventory package in the seed.

## 2. Seed source coverage

Seed source files:
- `AsyncScene/Web/data.js`
- `AsyncScene/Web/index.html`
- `AsyncScene/Web/npcs.js`
- `AsyncScene/Web/state.js`
- `AsyncScene/Web/system.js`
- `AsyncScene/Web/ui/ui-battles.js`
- `AsyncScene/Web/ui/ui-boot.js`
- `AsyncScene/Web/ui/ui-core.js`
- `AsyncScene/Web/ui/ui-dm.js`
- `AsyncScene/Web/ui/ui-events.js`
- `AsyncScene/Web/ui/ui-menu.js`

This is a useful starting map, not the final Step 9 freeze input.

## 3. Mandatory current-main refresh

Before any semantic matrix is frozen for Codex:

1. Rebuild the full text inventory from the exact then-current `main`.
2. Preserve deterministic source identity:
   - source file;
   - source line when available;
   - semantic path/key;
   - profile;
   - runtime/resolved text;
   - placeholders/variables;
   - inheritance;
   - mirror path;
   - ownership class.
3. Include the current late presentation layer:
   - `ui/ui-profile-visual-tone-repair.js`;
   - any current post-PR258 profile routing;
   - current stat-toast formatter strings.
4. Add Gen X as an explicit target column even before runtime implementation:
   - existing rows get `GEN_X_STATUS=MISSING_NEEDS_AUTHORING` where no approved copy exists.
5. Deduplicate source aliases without losing runtime-resolved distinctions.
6. Keep legacy rows for audit only; do not treat stale superseded copy as implementation authority.

## 4. Coverage states per semantic intent

Every current-main text row must end in exactly one state:

- `APPROVED_FIVE_PROFILE`
  - one semantic intent;
  - exact approved Boomer/Gen X/Millennial/Zoomer/Alpha copy;
  - placeholders validated.

- `SHARED_INTENTIONALLY`
  - same wording is intentionally approved for two or more profiles because clarity requires it;
  - shared wording must be an explicit creative decision, not inheritance accident.

- `MISSING_CREATIVE_DECISION`
  - semantic intent known;
  - one or more generation renderings still need User + ChatGPT copy.

- `NON_PLAYER_FACING`
  - dev-only/internal/technical text;
  - excluded from Step 9 visual tone adaptation with evidence.

- `MECHANIC_CANON_LOCKED`
  - a literal mechanic token/value must remain unchanged;
  - surrounding presentation may still be profiled.

- `LEGACY_SUPERSEDED`
  - historical text retained for audit but not current runtime authority.

No row may silently remain `INHERITED_FROM_OTHER_PROFILE` as a substitute for creative approval.

## 5. Required semantic grouping

The refreshed inventory must be grouped into semantic intents before copy authoring.

Minimum groups:
1. start/onboarding;
2. persistent chrome;
3. chat;
4. DM;
5. conflict/battle actions;
6. argument labels/hints;
7. vote/crowd;
8. report/cop flow;
9. economy blockers;
10. stat toasts;
11. win/loss/draw outcomes;
12. cooldowns;
13. empty states;
14. system errors/success;
15. NPC speech by role/character;
16. NPC reactions;
17. ambient/decorative copy;
18. accessibility/ARIA visible-equivalent copy where relevant.

## 6. Intensity assignment

Every semantic intent gets one intensity before authoring:
- `I0_CRITICAL`
- `I1_GUIDANCE`
- `I2_EXPRESSIVE`
- `I3_FULL_FREEDOM`

Do not assign intensity separately by generation for the same semantic intent unless there is an explicit reason. The mechanic importance is shared; the language expression differs.

## 7. High-frequency priority

The 48-row draft matrix is Wave 0, covering high-frequency/common surfaces first.

Before full freeze, expand from 48 rows to full current-main coverage in this order:
1. persistent UI + start;
2. common conflict/vote/report actions;
3. common toasts/outcomes/errors;
4. empty states/cooldowns;
5. NPC/common reactions;
6. long-tail templates and rare branches.

This allows early hidden-label review without pretending the long tail is complete.

## 8. Gen X inventory rule

For every semantic intent:
- Gen X receives its own authored copy;
- no automatic copy from Boomer;
- no automatic copy from Millennial;
- no fallback accepted as final;
- missing Gen X copy blocks five-profile freeze for that row.

## 9. Hidden inheritance audit

The refresh must explicitly detect:
- Gen X resolving to Millennial because unsupported;
- Alpha inheriting Zoomer without an intentional approved delta;
- Zoomer inheriting Millennial where Step 9 requires stronger identity;
- Boomer falling back to default/shared;
- shared hardcoded HTML/UI strings bypassing profile dictionaries.

Each accidental inheritance is a Step 9 coverage gap.

## 10. Freeze condition

The semantic package can be marked `FROZEN_FOR_CODEX` only when:
- current-main inventory refresh is complete;
- every player-facing row has a coverage state;
- every `MISSING_CREATIVE_DECISION` is resolved or explicitly deferred out of Stage 6;
- five-profile copy is approved for implementation rows;
- placeholders match;
- hidden-label review passes on representative high-frequency samples before implementation.

Codex then receives the frozen mapping and implements exactly it.
