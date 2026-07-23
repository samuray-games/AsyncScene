# STAGE 6 STEP 9 - CREATIVE REVIEW INDEX

STATUS: FOUNDATION_IN_PROGRESS / NOT_FROZEN

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

BRANCH: `chatgpt/stage6-step9-five-profile-foundation-20260723`

## 1. Purpose

This is the single navigation/decision index for the Step 9 creative foundation.

Codex implementation remains forbidden until an exact frozen package revision/hash is approved.

## 2. Foundation artifacts

### Core contract

`STAGE6_STEP9_FIVE_PROFILE_FOUNDATION.md`

Defines:

- five first-class profiles;
- semantic-equivalence model;
- intensity ladder;
- hidden-label acceptance;
- mechanics invariant;
- Gen X first-class requirement;
- unified-toast preservation;
- creative ownership boundary.

### Detailed voice bibles

`STAGE6_STEP9_FIVE_PROFILE_RU_VOICE_BIBLES_DRAFT.md`

Defines:

- Boomer rhythm/lexicon/humour/emoji/profanity/cultural palette;
- Gen X independent voice;
- Millennial early/mid-RuNet and self-irony lane;
- Zoomer current network-native lane;
- Alpha code/brainrot-native lane;
- cross-profile contrast matrix;
- marker-distribution checks.

### Gen X deep dive

`STAGE6_STEP9_GENX_PROFILE_DRAFT.md`

Defines a dedicated Russian Gen X profile rather than a fallback alias.

### Semantic matrix Batch 1

`STAGE6_STEP9_RU_SEMANTIC_MATRIX_DRAFT.md`

First 48 high-frequency intents:

- start;
- chat/DM;
- persistent panels;
- conflict actions;
- economy blockers;
- toasts;
- results;
- vote outcomes;
- empty states;
- cop/cooldown;
- reaction archetypes.

### Semantic matrix Batch 2

`STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH2_DRAFT.md`

Adds:

- events/menu controls;
- invite/search;
- argument hints;
- teaching flow;
- battle locks;
- full vote/tie flow;
- economy states;
- reputation/social states;
- cop/report flow;
- stronger NPC reaction archetypes.

### Semantic matrix Batch 3

`STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH3_SYSTEM_EVENTS_DRAFT.md`

Adds:

- joined/moved/DM feed;
- battle lifecycle feed;
- robbery/shame feed;
- crowd feed;
- argument-tier unlocks;
- role-specific NPC outcome announcements;
- composed system wrapper rules;
- explicit semantic blockers for ambiguous `npcArrest*` rows.

### Start/onboarding pack

`STAGE6_STEP9_START_ONBOARDING_FIVE_PROFILE_DRAFT.md`

Complete first-impression pass for:

- birth-year field;
- privacy/non-storage helper;
- feeling-year field;
- continue/start/reset/rules;
- risk/stake/result honesty lines;
- accessibility labels.

### NPC voice pack

`STAGE6_STEP9_NPC_FIVE_PROFILE_VOICE_PACK_DRAFT.md`

Five-profile candidate pools for:

- bandit;
- toxic;
- cop;
- crowd;
- mafia.

### Slang semantic validation

`STAGE6_STEP9_SLANG_SEMANTIC_VALIDATION.md`

Meaning gate for:

- W/L;
- cooked;
- aura;
- rizz;
- skibidi;
- sigma;
- NPC;
- mid;
- yapping;
- fanum tax;
- mog;
- brainrot;
- кринж;
- база;
- жиза;
- скип;
- вайб;
- имба;
- рофл;
- репа;
- лут;
- skill issue.

### Legacy recovery audit

`STAGE6_STEP9_LEGACY_COPY_RECOVERY_AUDIT.md`

Quantifies older architecture failure:

- 57 core resolved four-profile keys;
- Zoomer == Alpha on all 57/57 in seed;
- Boomer == Millennial on 19/57;
- Gen X absent first-class;
- old corpus useful as raw material, not final authority.

### Inventory coverage plan

`STAGE6_STEP9_FULL_TEXT_INVENTORY_COVERAGE_PLAN.md`

Seed package:

- 1930 active records;
- 853 unique active texts;
- 306 dynamic templates;
- snapshot commit is older than current main.

Requires fresh current-main rebuild before freeze.

### Codex contract

`STAGE6_STEP9_CODEX_IMPLEMENTATION_CONTRACT.md`

Codex may implement only exact frozen copy.

No independent:

- invention;
- sanitisation;
- shortening;
- synonym substitution;
- slang rewriting;
- mechanics change.

### Machine-readable draft

`stage6_step9_ru_semantic_matrix_draft.json`

Early machine-readable companion. Must be regenerated/expanded after creative review; current file is not complete enough for implementation.

## 3. Already proven structural findings

### Finding A - Gen X is partially plumbed but not first-class

Current runtime has:

- birth-year band `1965-1980 -> genX`;
- canonical `genx -> genX` normalization.

Missing first-class path includes:

- supported registry;
- text mode;
- dictionaries;
- start copy;
- presentation profile keys;
- smokes/preview matrices;
- complete player-facing surfaces.

### Finding B - old Alpha/Zoomer separation was structurally fake

Seed core resolved texts:

`Zoomer == Alpha: 57 / 57`

This explains the user's visual failure report.

### Finding C - Millennial was too often neutral/default

Step 9 requires a real Millennial culture lane, not simply the fallback copy.

### Finding D - unified toast architecture should survive

PR #258's coalescing toast pipeline is independent of copy tone and should remain.

## 4. Known draft candidates already REJECTED before user freeze

These must not be implemented as written:

1. `fanum tax 💰` as generic bandit money robbery - wrong semantic meaning.
2. `Не делай skill issue.` as bandit compliance threat - wrong context.
3. generic `sigma mode` for `Начинаем` - too vague/forced for generic action.
4. `rizz` as generic REP/influence - wrong semantics unless actual charm/flirt context exists.
5. `skibidi` as a stable synonym for `плохо` - semantically unstable/nonsense-coded.
6. any literal replacement of canonical REP stat with `aura` without a separate explicit mechanic/presentation decision.

Status: `REJECT_MISUSED_SLANG` or `REQUIRES_REASSIGNMENT`.

## 5. Known rows requiring fresh mechanic/source confirmation

Do not creatively freeze until current source meaning/visibility is verified:

- `npcArrestCop`
- `npcArrestMafia`
- `npcArrestBandit`
- `npcArrestToxic`
- `npcArrestCrowd`
- `P2P: анти-абуз.` visibility/classification
- any system wrapper where nested composed text could double punctuation/slang
- any stale seed row whose current main source changed after 2026-07-03.

Status: `MECHANIC_SEMANTICS_REQUIRES_FRESH_SOURCE_CONFIRMATION`.

## 6. Creative review order

Review should not be random.

### Pass 1 - signature/persistent UI

Goal: generation recognisable before rare events.

Review:

1. start/onboarding;
2. chat/DM controls;
3. events/battles/menu headers;
4. conflict action labels;
5. vote actions.

### Pass 2 - high-frequency feedback

Review:

1. stat toasts;
2. economy/REP states;
3. errors/success;
4. result language;
5. empty states;
6. cooldowns.

### Pass 3 - system/feed

Review:

1. movement/join;
2. battle feed;
3. crowd vote feed;
4. robbery/report;
5. unlock/progression messages.

### Pass 4 - NPC full flavour

Review:

1. bandit;
2. toxic;
3. cop;
4. crowd;
5. mafia;
6. later remaining role/DM families.

### Pass 5 - full inventory closure

Fresh current-main inventory rebuild and row-by-row state:

- `APPROVED_FIVE_PROFILE`
- `KEEP_SHARED_INTENTIONALLY`
- `MECHANIC_CANON_LOCKED`
- `NON_PLAYER_FACING`
- `MISSING_CREATIVE_DECISION`
- `LEGACY_SUPERSEDED`

No silent fallback allowed.

## 7. User approval format

For efficient review, present batches rather than 853 texts at once.

Each approval batch should show:

`TEXT_ID | semantic intent | intensity | B | X | M | Z | A | review note`

User corrections override all prior drafts immediately.

Approval state per row:

- `APPROVED`
- `EDIT_REQUIRED`
- `REJECTED`
- `SHARED_INTENTIONALLY`
- `BLOCKED_MECHANIC_CONFIRMATION`

## 8. Frozen package requirements

Before Codex implementation, create:

1. `STAGE6_STEP9_FIVE_PROFILE_COPY_FROZEN.md`
2. `stage6_step9_five_profile_copy_frozen.json`
3. exact SHA-256 of machine-readable frozen mapping;
4. fresh current-main full inventory coverage report;
5. zero unresolved `MISSING_CREATIVE_DECISION` on player-facing rows in selected implementation wave;
6. exact Codex implementation scope/waves;
7. placeholder invariant checks;
8. profile separation tests;
9. slang semantic validation result.

## 9. Codex handoff rule

Codex begins implementation only after:

- user explicitly approves/freeze package;
- frozen hash exists;
- exact baseline current main is re-read;
- model preflight requirements are satisfied for actual Codex implementation task;
- scope is isolated;
- current inventory is refreshed.

Codex must not use DRAFT files as permission to choose wording.

## 10. Stage 6 completion rule

Even after implementation and automated PASS:

`Stage 6 != COMPLETE`

until the user visually sees the deployed five-profile result and explicitly confirms PASS.

NEXT_ACTION: continue creative expansion/review until the five-profile matrix is ready for user freeze, then prepare exact Codex implementation task from the frozen hash.