# ALPHA_LEXICON

```text
documentId: ALPHA_LEXICON
stage: 4
step: 4.3.7
status: READY_FOR_RUNTIME_SMOKE
version: step4_3_7_alpha_lexicon_docs_memory_v20260622_001
buildTag: build_2026_06_22_step4_3_7_alpha_lexicon_docs_memory_v1
commit: step4_3_7_alpha_lexicon_docs_memory
sourceRuntimeSmoke: smokeAlphaLexiconDocsOnce
runtimePassClaimed: false
publishRoot: docs
```

## Purpose and scope

- This is the canonical compiled alpha lexicon document for Step 4.3.7.
- Alpha is derived from Zoomer and remains a text/profile layer only.
- This document reconciles the accepted Step 4.3.1 through Step 4.3.6 alpha artifacts.
- source inventory: 164 entries, 122 unique texts
- allowed lexicon: 187 entries, 8 categories
- taboo list: 60 entries, 4 categories
- Zoomer/Gen Z source mappings: 23
- mapping coverage: 100%
- changed mappings: 16
- identity mappings: 7
- canonical convergences: 3
- new feature groups: 7
- new feature mappings: 73
- new feature coverage: 100%
- changed new-feature mappings: 66
- identity new-feature mappings: 7
- target taboo hits: 0

## Alpha lexicon rules

- Alpha is ultra-direct and compact without changing meaning.
- Alpha is derived from Zoomer.
- Alpha keeps intent, mechanics, variables, and protected tokens intact.
- Alpha replacements are explicit mappings, not free rewriting.
- No replacement text may bypass the allowed lexicon or taboo checks.
- WHERE and YN argument logic remains canonical.
- future feature text must be added to the alpha coverage registry

## Allowed lexicon

- Canonical list: `docs/UI_PROFILE_ALPHA_ALLOWED_LEXICON.md`
- Runtime mirror: `AsyncScene/Web/UI_PROFILE_ALPHA_ALLOWED_LEXICON.md`
- allowed lexicon: 187 entries, 8 categories
- Categories:
  - `core_ui_nouns`
  - `gameplay_nouns`
  - `action_verbs`
  - `status_terms`
  - `risk_constraint_terms`
  - `neutral_service_words`
  - `short_forms`
  - `protected_tokens`
- The full canonical list stays in the dedicated allowed-lexicon artifact to avoid duplicating the dataset here.

## Taboo list

- Canonical list: `docs/UI_PROFILE_ALPHA_TABOO_LIST.md`
- Runtime mirror: `AsyncScene/Web/UI_PROFILE_ALPHA_TABOO_LIST.md`
- taboo list: 60 entries, 4 categories
- Categories:
  - `slang_markers`
  - `diminutives`
  - `complex_links`
  - `artificial_youth`
- target taboo hits: 0
- The full canonical list stays in the dedicated taboo artifact to avoid duplicating the dataset here.

## Zoomer to Alpha mapping

- Canonical list: `docs/UI_PROFILE_ALPHA_Z_TO_ALPHA_MAPPING.md`
- Runtime mirror: `AsyncScene/Web/UI_PROFILE_ALPHA_Z_TO_ALPHA_MAPPING.md`
- Zoomer/Gen Z source mappings: 23
- mapping coverage: 100%
- changed mappings: 16
- identity mappings: 7
- canonical convergences: 3
- Canonical convergences:
  - `Победа` <- `TXT_0064`, `TXT_0067`
  - `Поражение` <- `TXT_0065`, `TXT_0068`
  - `Ничья` <- `TXT_0066`, `TXT_0069`
- Runtime mappings are explicit.
- Variables and protected tokens remain intact.

## New feature coverage

- Canonical list: `docs/UI_PROFILE_ALPHA_NEW_FEATURES.md`
- Runtime mirror: `AsyncScene/Web/UI_PROFILE_ALPHA_NEW_FEATURES.md`
- new feature groups: 7
- new feature mappings: 73
- new feature coverage: 100%
- changed new-feature mappings: 66
- identity new-feature mappings: 7
- Covered groups:
  - `cop`
  - `mafia`
  - `crowd`
  - `rematch`
  - `npc_vs_npc`
  - `timers`
  - `economy_ui`

## Runtime acceptance

- Accepted smoke references:
  - `Game.__DEV.smokeAlphaLexiconInventoryFix5()`
  - `Game.__DEV.smokeAlphaAllowedLexiconFix1()`
  - `Game.__DEV.smokeAlphaTabooListOnce()`
  - `Game.__DEV.smokeAlphaZToAlphaMappingOnce()`
  - `Game.__DEV.smokeAlphaNewFeaturesFix1()`
  - `Game.__DEV.smokeAlphaLexiconFix1()`
- Accepted aggregate reference:
  - commit: `step4_3_6_alpha_lexicon_runtime_smoke_fix1`
  - smokeVersion: `step4_3_6_alpha_lexicon_runtime_smoke_fix1_v20260621_001`
  - buildTag: `build_2026_06_22_step4_3_6_alpha_lexicon_runtime_smoke_fix1_v1`
- Accepted Step 4.3.6 PASS evidence:
  - `ok:true`
  - `inventoryEntryCount:164`
  - `inventoryUniqueTextCount:122`
  - `allowedLexiconEntryCount:187`
  - `tabooEntryCount:60`
  - `zMappingCount:23`
  - `zMappingCoveragePercent:100`
  - `newFeatureCount:7`
  - `newFeatureMappedEntryCount:73`
  - `newFeatureCoveragePercent:100`
  - `targetTabooHitCount:0`
  - `childSmokeCount:5`
  - `passedChildSmokeCount:5`
  - `failures:[]`
  - `forbiddenRemaining:[]`
  - `missingCoverage:[]`
  - `failedChecks:[]`
  - `runtimeCopyChanged:true`
  - `mappingApplied:true`
  - `docsMirrorMatches:true`
  - `productionGatePlacementOk:true`
  - `registrationPrecedesThrowingInstallers:true`
- Step 4.3.7 documentation acceptance smoke: `Game.__DEV.smokeAlphaLexiconDocsOnce()`
- Step 4.3.7 Safari PASS is pending and must not be claimed here.

## Invariants

- Alpha is derived from Zoomer
- text/profile layer only
- no gameplay logic changes
- no economy logic changes
- no battle logic changes
- no NPC logic changes
- no state logic changes
- variables and protected tokens remain intact
- runtime mappings are explicit
- no replacement text may bypass the allowed lexicon or taboo checks
- future feature text must be added to the alpha coverage registry

## Source references

- `docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md`
- `AsyncScene/Web/UI_PROFILE_ALPHA_WORD_INVENTORY.md`
- `docs/UI_PROFILE_ALPHA_ALLOWED_LEXICON.md`
- `AsyncScene/Web/UI_PROFILE_ALPHA_ALLOWED_LEXICON.md`
- `docs/UI_PROFILE_ALPHA_TABOO_LIST.md`
- `AsyncScene/Web/UI_PROFILE_ALPHA_TABOO_LIST.md`
- `docs/UI_PROFILE_ALPHA_Z_TO_ALPHA_MAPPING.md`
- `AsyncScene/Web/UI_PROFILE_ALPHA_Z_TO_ALPHA_MAPPING.md`
- `docs/UI_PROFILE_ALPHA_NEW_FEATURES.md`
- `AsyncScene/Web/UI_PROFILE_ALPHA_NEW_FEATURES.md`
- `TASKS.md`
- `PROJECT_MEMORY.md`
