# UI_PROFILE_ZOOMER_FINAL

Final z-profile package. This package is text-only, derived from `UI_PROFILE_MILLENNIAL`, and defines no runtime logic.

## Final z-profile rules

- Keep the millennial meaning, then apply the zoomer delta: faster read, shorter phrasing, less explanation, more direct wording.
- Keep wording text-only: this package defines wording rules and reference examples only.
- Use short, direct, one-pass phrasing.
- Prefer concrete verbs over abstract framing.
- Keep tone calm, current, and non-performative.
- Keep placeholders, counts, costs, outcomes, and factual meaning unchanged.

## Forbidden list

- No memes.
- No fake youth slang.
- No irony for style.
- No forced coolness.
- No lecturing tone.
- No corporate filler.
- No added meaning.
- No removed meaning.
- No runtime logic content.

## Examples

| millennial | zoomer final |
| --- | --- |
| Возможно, лучше проверить цену перед действием. | Проверь цену перед ходом. |
| Рекомендуется дождаться ответа собеседника. | Жди ответа. |
| Недостаточно репутации для заявки. | Не хватает репутации. |
| Данное действие сейчас недоступно. | Сейчас недоступно. |
| Следует подтвердить выбор перед продолжением. | Подтверди выбор. |

## Millennial -> zoomer mapping reference

Reference source: `UI_PROFILE_ZOOMER_DIFF.md`, section `UI_PROFILE_ZOOMER_CANONICAL_MAPPING_TABLE`.

- Base/source: `UI_PROFILE_MILLENNIAL.md`.
- Derived package: `UI_PROFILE_ZOOMER_DIFF.md`.
- Final package: this document packages the final z-profile contract without changing runtime text by itself.

## Smoke commands

- `Game.__DEV.smokeZProfileFinalPackageOnce()`
- `Game.__DEV.smokeZProfileDerivationMappingOnce()`
- `Game.__DEV.smokeZProfileSpeedAuditOnce()`
- `Game.__DEV.smokeZProfileSimplicityAuditOnce()`
- `Game.__DEV.smokeZProfileAuthenticityAuditOnce()`
- `Game.__DEV.smokeZProfileNewFeaturesAuditOnce()`

## PASS status references for steps 1-6

- Step 1 PASS reference: terminology/profile base PASS is recorded in the prior step package chain and remains the upstream base for this final package.
- Step 2 PASS reference: UI shortening PASS is recorded by the Step 2 package chain and remains part of the final z-profile package baseline.
- Step 3 PASS reference: allowed lexicon and stop-word PASS references remain part of the z-profile baseline.
- Step 4 PASS reference: terminology and mapping PASS references remain part of the z-profile baseline.
- Step 5 PASS reference: authenticity PASS reference remains part of the z-profile baseline.
- Step 6 PASS reference: new-features compatibility PASS reference remains part of the z-profile baseline.

## Text-only derivation rule

This z-profile package is text-only and derived from `UI_PROFILE_MILLENNIAL`.

It does not add runtime behavior. It packages wording rules, references, and smoke instructions only.

## No-new-runtime rule

No new logic, entities, conditions, economy rules, battle rules, handlers, or state mutations are allowed.

No new logic keys are allowed.

No new runtime branches or hidden rule changes are allowed.
