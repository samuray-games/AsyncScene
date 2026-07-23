# STAGE 6 STEP 9 - GAP CLOSURE V1

STATUS: `COMPLETE_AS_FOUNDATION_DECISIONS / PENDING_USER_COPY_APPROVAL / NOT_FROZEN`

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

INPUT INVENTORY:

- `STAGE6_STEP9_FRESH_CURRENT_MAIN_INVENTORY_V1.md`
- `stage6_step9_fresh_current_main_inventory_v1.json`

## 1. Closure rule

A Step 4 gap is closed when it has one explicit disposition:

- exact implementation requirement;
- explicit intentional sharing;
- mechanic-canon lock;
- non-player-facing exclusion;
- legacy/superseded exclusion;
- product decision;
- or exact user-review dependency.

Gap closure does not mean runtime implementation has already happened.

No current-main ambiguity is allowed to silently become inherited copy.

## 2. G1 - Gen X is not first-class

### Fresh evidence

Current source contains:

- birth-year band `1965-1980 -> genX`;
- canonical normalization `genx -> genX`.

But current runtime/presentation does not expose Gen X as first-class:

- `UI_PROFILE_REGISTRY.supported` omits Gen X;
- `resolveUiTextMode()` has no Gen X return path;
- final Stage 6 presentation authority has profile keys only `millennial / zoomer / alpha / boomer`;
- start/profile dictionaries have no complete Gen X table;
- system/profile copy and several derived families have no complete Gen X path.

### Disposition

`CLOSED_TO_EXACT_IMPLEMENTATION_REQUIREMENT`

Implementation must add `genX` as a first-class text/presentation profile without changing mechanics.

Required surfaces:

1. supported profile registry / normalization path;
2. text-mode resolver;
3. start/onboarding profile table;
4. `Data.TEXTS` explicit Gen X table;
5. system profile text routes/copy;
6. final presentation `PROFILE_KEYS` and all relevant control/text/system/toast maps;
7. NPC speech/DM profile routing and pools where current architecture supports profiling;
8. profile preview/smoke/hidden-label matrices;
9. source/docs mirrors for every touched runtime file.

No fallback to Boomer or Millennial is accepted as final Gen X implementation.

## 3. G2 - Alpha still partially derives from Zoomer

### Fresh evidence

Current `data.js` constructs Zoomer from an earlier Alpha baseline and then reconstructs Alpha by spreading that baseline plus selected overrides. The late presentation layer adds more Alpha overrides but does not erase all underlying inheritance architecture.

### Disposition

`CLOSED_TO_EXPLICIT_FIVE_PROFILE_MAPPING`

Frozen implementation rows must be explicit per profile.

Identical wording is allowed only when marked `SHARED_INTENTIONALLY`; equality caused only by fallback/spread inheritance is not accepted as creative completion.

Implementation may preserve reusable code structure, but resolved copy identity must come from the frozen five-profile mapping, not accidental profile fallback.

## 4. G3 - final presentation authority is four-profile

Current late presentation authority declares only:

`millennial / zoomer / alpha / boomer`

### Disposition

`CLOSED_TO_FIVE_PROFILE_PRESENTATION_AUTHORITY`

The final presentation layer must become the single five-profile application layer for:

- persistent controls;
- relevant `Data.TEXTS` overrides;
- start overrides;
- system/profile text routing;
- unified stat-toast formatting;
- any late repair currently overriding earlier dictionaries.

Do not add a second competing late patch layer.

## 5. G4 - start/onboarding coverage

Current start text is split between:

- base system copy;
- `START_SCREEN_PROFILE_TEXTS`;
- hardcoded HTML fallbacks;
- `ui-boot` wiring;
- late Alpha start overrides.

### Disposition

`CLOSED_TO_SINGLE_FROZEN_START_MATRIX`

After user approval, one exact five-profile start matrix becomes authority.

Rules:

- mechanics/privacy meaning unchanged;
- birth-year data is style selection only and is not stored as birth year;
- accessibility digit-stepper labels remain clear shared Russian unless user explicitly changes them;
- hardcoded HTML fallback copy must not contradict the selected profile after boot;
- Gen X receives explicit copy;
- Alpha remains Russian-first.

## 6. G5 - COP/CAP/shared Millennial fallback families

Fresh source shows profile families where Zoomer/Alpha/default reuse Millennial pools and Gen X has no explicit profile path.

### Disposition

`CLOSED_TO_ROW_LEVEL_EXPLICITNESS`

For every player-visible row in these families:

- either include exact five-profile copy in frozen mapping;
- or mark the row `SHARED_INTENTIONALLY` with an explicit profile set.

No implicit Millennial fallback may satisfy Step 9.

Mechanic values, report truth/false outcomes, cooldown rules and economy deltas remain source-driven.

## 7. G6 - NPC speech/profile coverage

NPC copy is player-facing I3 flavour, but role semantics and mechanics are invariant.

### Disposition

`CLOSED_TO_EXPLICIT_ROLE_X_PROFILE_POOLS`

Required profile lanes:

- RU_BOOMER
- RU_GEN_X
- RU_MILLENNIAL
- RU_ZOOMER
- RU_ALPHA

Required role preservation:

- bandit remains robbery/coercion;
- toxic remains provocation/belittling;
- cop remains verification/control;
- crowd remains ambient social reaction;
- mafia remains controlled menace/discretion;
- other current role families retain current semantic role.

Do not make every NPC in a generation identical. Profile is one dimension; role/personality variation remains.

## 8. G7 - source/docs mirror drift

Fresh current-main blob audit found drift in at least:

- `npcs.js`
- `ui/ui-menu.js`
- `ui/ui-boot.js`
- `conflict/conflict-api.js`
- `state.js`
- `ui/ui-loops.js`

### Disposition

`CLOSED_TO_SERIALIZED_MIRROR_AUDIT_AND_TARGETED_SYNC`

Rules for implementation:

1. source repository implementation remains primary authority;
2. `docs/` is the deployed mirror path and must be treated as the same ownership lane;
3. do not blindly overwrite whole drifted files;
4. before each touched pair, compare exact source/docs diff;
5. apply Step 9-owned copy/profile changes to both sides;
6. preserve unrelated deployed-only or source-only changes until separately reconciled;
7. final acceptance requires exact expected mirror parity for every Step 9-touched pair, or a documented deterministic transformation.

Mirror drift outside Step 9-owned hunks is not silently absorbed into this creative task.

## 9. G8 - disabled P2P backlog UX

Current disabled UI exposes unfinished technical product copy.

### Product disposition

`HIDE_DISABLED_P2P_BLOCK_UNTIL_FEATURE_ENABLED`

Implementation requirement:

- when either required P2P capability flag is false, do not render the unfinished P2P transfer block;
- do not expose `P2P: анти-абуз.`;
- remove/avoid the dead `Почему?` affordance whose answer is only another unavailable message;
- do not generationally rewrite disabled technical debt.

When P2P is enabled in a future implementation, real transfer surfaces then require five-profile copy.

## 10. G9 - `npcArrest*`

The current dictionary still contains five `npcArrest*` strings, but no active current event taxonomy/callsite has been confirmed for them and they are absent from the routed creative inventory.

### Disposition

`LEGACY_SUPERSEDED_CANDIDATE / REMOVE_FROM_CREATIVE_SCOPE`

Implementation precheck:

- run exact repository/callsite search immediately before mutation;
- if zero active callsites remain, delete the orphan dictionary keys in source and mirror;
- if a real callsite is found, stop and reclassify the mechanic before copy implementation.

No generational copy is authored for these rows now.

## 11. G10 - accessibility labels

Digit-stepper ARIA labels and equivalent critical accessibility copy do not need performative generation cosplay.

### Disposition

`SHARED_INTENTIONALLY / ACCESSIBILITY_CANON`

Keep clear Russian labels shared where shortening would reduce screen-reader meaning.

## 12. G11 - mechanic data mixed with copy

Argument canon, economy values, cooldown rules, REP/points outcomes, unlock thresholds, vote math and transfer accounting are not creative-copy variables.

### Disposition

`MECHANIC_CANON_LOCKED`

Generation work may change presentation only.

Placeholder/value invariants must be source-confirmed at implementation time.

## 13. G12 - unified stat toasts

PR #258/current final presentation coalesces stat changes into one unified toast pipeline.

### Disposition

`ARCHITECTURE_LOCKED / COPY_PROFILED`

Preserve:

- coalescing behavior;
- authoritative delta preference;
- target-vs-self REP distinction;
- economy traceability;
- one-card grouping.

Only frozen rendering text/profile presentation changes.

## 14. G13 - composed system wrappers

Templates containing `{what}`, `{hint}`, costs, names, vote counts or nested text can create duplicate punctuation/slang when naively rewritten.

### Disposition

`EXPLICIT_WRAPPER_IMPLEMENTATION_TEST_REQUIRED`

Frozen wrapper copy must:

- preserve placeholders exactly;
- preserve semantic role;
- render representative nested values for all five profiles;
- reject duplicate punctuation, repeated slang and missing hints;
- keep mechanic errors understandable at I0/I1.

## 15. G14 - hardcoded HTML/UI fallbacks

Current HTML still contains fallback strings such as chat/DM labels and placeholders before runtime presentation applies.

### Disposition

`FALLBACK_COPY_MUST_NOT_CONTRADICT_FINAL_PROFILE`

Implementation may leave neutral fallback text where boot immediately replaces it, but:

- it must not leak the wrong generation during normal usable state;
- accessibility fallbacks remain clear;
- any persistent/unreplaced fallback must be routed into the five-profile system or explicitly shared.

## 16. G15 - user approval boundary

All currently authored five-profile copy remains draft.

### Disposition

`STEP5_USER_REVIEW_REQUIRED`

This is not an unresolved source/mechanic gap. It is the intentional approval gate.

No exact frozen JSON or SHA-256 may be claimed until the user approves the consolidated review package.

## 17. Gap closure result

All fresh-current-main source/product/structure ambiguities now have explicit dispositions.

There are no remaining rows whose status is simply "unknown, guess later".

Remaining work is workflow-gated rather than ambiguous:

1. consolidate exact current five-profile candidate copy for user review;
2. receive user corrections/approval;
3. generate frozen Markdown + JSON + SHA-256;
4. create exact Codex implementation scope from that frozen hash;
5. run implementation/static validation/mirror checks;
6. user Safari runtime acceptance.

RESULT: `STEP9_GAP_CLOSURE = COMPLETE_AS_FOUNDATION_DECISIONS`

NEXT_ACTION: `BUILD_CONSOLIDATED_STEP9_USER_REVIEW_PACKAGE`.
