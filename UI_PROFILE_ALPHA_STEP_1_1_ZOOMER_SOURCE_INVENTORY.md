# UI_PROFILE_ALPHA_STEP_1_1_ZOOMER_SOURCE_INVENTORY

Step 1.1 inventory only. This note records where the existing Zoomer profile is defined and which dev smokes already cover it. It does not change runtime UI behavior.

## Exact Zoomer profile sources/docs found

- `UI_PROFILE_ZOOMER_DIFF.md`
- `docs/UI_PROFILE_ZOOMER_DIFF.md`
- `UI_PROFILE_ZOOMER_FINAL.md`
- `docs/UI_PROFILE_ZOOMER_FINAL.md`
- `AsyncScene/Web/dev/dev-checks.js`
- `docs/dev/dev-checks.js`
- `AsyncScene/Web/data.js`
- `docs/data.js`
- `AsyncScene/Web/state.js`
- `docs/state.js`

## Exact Zoomer smoke functions found

- `Game.__DEV.smokeZoomerForbiddenRulesOnce()`
- `Game.__DEV.smokeZoomerTermsInventoryOnce()`
- `Game.__DEV.smokeZoomerNewFeaturesTermsOnce()`
- `Game.__DEV.smokeZoomerFeelStep63EconomyFlavor()`
- `Game.__DEV.smokeZoomerFeelStep63EconomyFlavorFix1()`
- `Game.__DEV.smokeZoomerFeelStep63EconomyFlavorFix2()`
- `Game.__DEV.smokeZoomerFeelStep63EconomyFlavorFix3()`
- `Game.__DEV.smokeZoomerFeelStep67*` family in the served dev-check bundles for start/menu/events/battle coverage
- `Game.__DEV.smokeZoomerFeelStep68CoverageAuditSummary()`
- `Game.__DEV.smokeZoomerFeelStep68CoverageAuditSameSample()`
- `Game.__DEV.smokeZoomerFeelStep68CoverageAuditMissingSample()`
- `Game.__DEV.smokeZoomerFeelStep68CoverageAuditBuckets()`
- `Game.__DEV.smokeZoomerFeelStep691RuntimeFeelChecklist()`
- `Game.__DEV.smokeZoomerNpcSpeechInventoryOnce()`

## Exact text/profile registries touched by Zoomer

- `Data.START_SCREEN_PROFILE_TEXTS`
- `Data.TEXTS.genz`
- `Data.TEXTS.millennial`
- `Data.TEXTS.default`
- `Data.TEXTS.zoomer`
- `Data.TEXTS.alpha`
- `UI_PROFILE_RESERVED_FUTURE_ID_SET`
- `Data.UI_PROFILE`
- `Data.PROFILE_TEXTS`

## UI_PROFILE_ZOOMER_DIFF status

- `UI_PROFILE_ZOOMER_DIFF` exists.
- Closest existing source: `UI_PROFILE_ZOOMER_DIFF.md` and `docs/UI_PROFILE_ZOOMER_DIFF.md`.
- `UI_PROFILE_ZOOMER_FINAL.md` is the derived final package, not the source diff.
