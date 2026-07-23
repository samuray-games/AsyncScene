# STAGE 6 STEP 9 - USER REVIEW PACKAGE V1

STATUS: `READY_FOR_USER_REVIEW / NOT_APPROVED / NOT_FROZEN`

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

## 0. Human-facing entrypoint

For actual user review, open only:

`STAGE6_STEP9_USER_REVIEW_HUMAN_V1.md`

That file is the intentionally simplified review surface. It presents resolved candidates after applying the precedence below and gives short review IDs such as `A4`, `B7`, `D-BANDIT`.

The user does **not** need to inspect Batch 1-4, overlays, inventories or source maps.

If the user approves a profile/family without exceptions, that is approval of the **voice direction for the underlying family**. Before freeze, ChatGPT must propagate any corrections through the complete exact row set, run consistency checks, then emit the exact frozen Markdown/JSON/hash.

## 1. Purpose

This is the single review gateway before freeze.

The user should not need to infer which of many historical drafts wins when files disagree.

No Codex implementation is authorized by this package.

## 2. Exact candidate authority order

Resolve candidate copy in this order, highest first:

1. **Direct current user decisions and source/product decisions**
   - `STAGE6_STEP9_SOURCE_DECISIONS_RESOLVED.md`
   - `npcArrest*` excluded as legacy/orphan candidate
   - disabled P2P block hidden until feature enabled

2. **Russian cultural authenticity exact corrections**
   - `STAGE6_STEP9_RU_CULTURAL_AUTHENTICITY_PASS_V1.md`
   - every row explicitly listed there overrides older wording for that exact profile + text id / NPC line

3. **Alpha Russian-first exact overlay**
   - `STAGE6_STEP9_ALPHA_RUSSIAN_FIRST_REWRITE_V1.md`
   - `stage6_step9_alpha_ru_rewrite_v1.json`
   - applies to Alpha wherever not superseded by a later exact cultural-pass correction

4. **Base five-profile candidate matrices**
   - `STAGE6_STEP9_RU_SEMANTIC_MATRIX_DRAFT.md`
   - `STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH2_DRAFT.md`
   - `STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH3_SYSTEM_EVENTS_DRAFT.md`
   - `STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH4_CONFLICT_ECONOMY_DRAFT.md`

5. **Dedicated family packs**
   - `STAGE6_STEP9_START_ONBOARDING_FIVE_PROFILE_DRAFT.md`
   - `STAGE6_STEP9_NPC_FIVE_PROFILE_VOICE_PACK_DRAFT.md`

6. **Voice bibles / rules**
   - `STAGE6_STEP9_FIVE_PROFILE_RU_VOICE_BIBLES_DRAFT.md`
   - `STAGE6_STEP9_GENX_PROFILE_DRAFT.md`
   - `STAGE6_STEP9_RU_CULTURAL_LOCALIZATION_RULES.md`
   - `STAGE6_STEP9_SLANG_SEMANTIC_VALIDATION.md`

Voice bibles constrain wording but do not override an exact higher-priority row unless they expose a semantic violation that must be corrected before approval.

## 3. Source inventory and gap decisions that constrain review

The review must use:

- `STAGE6_STEP9_FRESH_CURRENT_MAIN_INVENTORY_V1.md`
- `stage6_step9_fresh_current_main_inventory_v1.json`
- `STAGE6_STEP9_GAP_CLOSURE_V1.md`

Therefore:

- Gen X must be reviewed as a real fifth profile, not a fallback;
- accidental Alpha <- Zoomer inheritance is not approval;
- accessibility rows may remain intentionally shared;
- mechanic-canon rows are not creative rewrite targets;
- orphan/dev/legacy rows are not review noise;
- mirror drift is implementation scope, not a reason to duplicate copy decisions.

## 4. Review batches

Review order is fixed to reduce cognitive load and catch signature failure early.

### Batch A - first impression / high frequency

Review exact final-resolved candidates for:

- start/onboarding;
- chat/DM persistent controls;
- panel/menu headers;
- battle action labels;
- vote actions;
- economy blockers;
- unified stat-toast wording;
- win/loss/draw;
- cooldowns/empty states.

Acceptance question:

> With profile names hidden, do all five feel like distinct Russian-speaking generations while remaining immediately understandable?

### Batch B - system/feed/progression

Review:

- join/move/DM feed;
- challenge/battle feed;
- crowd vote feed;
- robbery/shame/report outcomes;
- argument-tier unlocks;
- system wrappers.

Acceptance question:

> Does generation flavour remain strong without changing event facts, placeholders or progression meaning?

### Batch C - conflict/economy long tail

Review:

- rematch;
- paid tactical actions;
- reroll/hints;
- extra vote / shield;
- intervention / forced NPC event;
- dismiss/respect;
- truthful/false report;
- voting economy;
- crowd support REP.

Acceptance question:

> Are costs, payer/receiver identity, REP/points effects and failure meanings identical across all five profiles?

### Batch D - NPC full flavour

Review role pools for:

- bandit;
- toxic;
- cop;
- crowd;
- mafia;
- any remaining current role/DM families found by implementation mapping.

Acceptance question:

> Can the generation be recognised without destroying the NPC role, and can the NPC role be recognised without seeing the label?

### Batch E - intentional sharing / exclusions

Confirm:

- accessibility labels shared intentionally;
- mechanic-canon strings/values locked;
- dev/debug excluded;
- `npcArrest*` excluded pending final zero-callsite precheck;
- disabled P2P block hidden, not generationally rewritten;
- any other exact shared rows are explicitly marked rather than silently inherited.

## 5. Mandatory hidden-label test

Before approval/freeze, use representative samples from each high-frequency family with generation names removed.

PASS requires:

- Boomer distinguishable from Gen X;
- Gen X distinguishable from Millennial;
- Millennial distinguishable from Zoomer;
- Zoomer distinguishable from Alpha;
- every lane sounds Russian-speaking rather than translated foreign generational culture;
- I0/I1 remain understandable without slang knowledge;
- Alpha is Russian-first, not English-first;
- no generation is a caricature assembled from one repeated token.

## 6. Approval states

Every reviewed row/family may end only as:

- `APPROVED`
- `EDIT_REQUIRED`
- `SHARED_INTENTIONALLY`
- `MECHANIC_CANON_LOCKED`
- `NON_PLAYER_FACING`
- `LEGACY_SUPERSEDED`

`BLOCKED_MECHANIC_CONFIRMATION` is no longer expected for the previously investigated `npcArrest*`/P2P cases because Step 4 gave them explicit dispositions.

## 7. Freeze boundary

After user approval/corrections:

1. resolve all overlays into one exact row mapping;
2. generate `STAGE6_STEP9_FIVE_PROFILE_COPY_FROZEN.md`;
3. generate `stage6_step9_five_profile_copy_frozen.json`;
4. compute SHA-256 over the exact frozen JSON bytes;
5. record current-main baseline and all implementation target files;
6. create exact Codex task with no copy invention permission.

Until the user approves the exact candidate package:

`STEP5_USER_REVIEW = WAITING_USER`

`STEP6_FREEZE = BLOCKED_BY_USER_APPROVAL`

`STEP7_CODEX_IMPLEMENTATION = BLOCKED_BY_FROZEN_HASH`

## 8. Current checklist

- [x] 1. `FULL_ALPHA_RUSSIAN_FIRST_REWRITE`
- [x] 2. `RU_CULTURAL_AUTHENTICITY_PASS B/X/M/Z/A`
- [x] 3. `FRESH_CURRENT_MAIN_INVENTORY`
- [x] 4. `GAP_CLOSURE`
- [ ] 5. `USER_REVIEW` - human sheet ready, explicit approval/corrections required
- [ ] 6. `FREEZE + SHA256`
- [ ] 7. `CODEX_IMPLEMENTATION`

NEXT_ACTION: `USER_REVIEWS_STAGE6_STEP9_USER_REVIEW_HUMAN_V1`.