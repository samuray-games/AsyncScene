# Step 3 terminology canon report

Build marker: `STEP3_TERMINOLOGY_CANON_V1`

Source of truth inventory: `STEP3_TERMINOLOGY_INVENTORY.csv` (3513 rows). This report is terminology governance only: no gameplay changes, no UI string rewrites, and no mass replacements.

## Duplicate groups found

| conceptId | category | canonicalTerm | forbidden variants | source terms | screens |
|---|---|---|---|---:|---|
| `CONCEPT_POINTS_CURRENCY` | ResourceName | `💰` | пойнты|пойнтов|Points|P|сверхпойнты | 209 | battle_ui|chat_ui|cooldowns|disabled_states|dm_ui|economy_toasts|escape|events_voting_crowd|general_interface|p2p|pending_states|price_caps|reports_cop_flow|respect_econ08|result_cards|success_fail_states|training_econ04 |
| `CONCEPT_REPUTATION` | ResourceName | `⭐` | REP|Репутация|репутация | 48 | battle_ui|dm_ui|economy_toasts|events_voting_crowd|general_interface|price_caps|respect_econ08 |
| `CONCEPT_INSUFFICIENT_FUNDS` | Error | `Не хватает 💰.` | Не хватает пойнтов.|Пойнтов не хватает.|У вас недостаточно пойнтов.|Не прокает: нет P.|Не прокает: мало 💰 на баттл.|Нужно 1💰, сейчас не хватает.|не хватает | 49 | battle_ui|disabled_states|dm_ui|economy_toasts|events_voting_crowd|p2p|pending_states|respect_econ08 |
| `CONCEPT_CROWD_DECISION` | Status | `Толпа решает` | Решает толпа|Голосование идёт|голосование|голоса|толпа решила | 108 | battle_ui|chat_ui|escape|events_voting_crowd|ignore|price_caps|reports_cop_flow|result_cards |
| `CONCEPT_ESCAPE_ACTION` | Button | `Свалить` | Уйти|смыться|смыться от|свалить от|СВАЛИТЬ | 51 | battle_ui|chat_ui|disabled_states|dm_ui|economy_toasts|escape|events_voting_crowd|general_interface|price_caps|reports_cop_flow |
| `CONCEPT_IGNORE_ACTION` | Button | `Отвали` | Отвалить|отвали|отвалил|Отвалил | 35 | battle_ui|events_voting_crowd|general_interface|ignore |
| `CONCEPT_REPORT_ACTION` | Button | `Сдать` | донос|репорт|сообщите|отмечен(а)|заявка | 37 | dm_ui|economy_toasts|general_interface|pending_states|reports_cop_flow|respect_econ08|success_fail_states|training_econ04 |
| `CONCEPT_ARGUMENT_TRAINING` | Button | `Обучить аргументу` | Тренировка аргумента|Тренировка аргумента (${price} 💰)|обучил(а)|Цена: {cost} 💰 | 10 | chat_ui|dm_ui|economy_toasts|price_caps|training_econ04 |
| `CONCEPT_COOLDOWN` | Cooldown | `кулдаун` | Кулдаун|cooldown|ещё ${status.remainingDays || 0} дн.|кулдаун до дня | 6 | cooldowns|economy_toasts|price_caps|training_econ04 |
| `CONCEPT_PRICE_CAP` | EconomyReason | `лимит` | Cap|Кап|max Points|max REP|Лимит | 8 | economy_toasts|events_voting_crowd|price_caps|respect_econ08 |
| `CONCEPT_BATTLE_ACTION` | Button | `баттл` | конфликт|забатлить|баттлить | 57 | battle_ui|chat_ui|cooldowns|disabled_states|dm_ui|economy_toasts|events_voting_crowd|general_interface|reports_cop_flow|result_cards |
| `CONCEPT_UNAVAILABLE_STATE` | Status | `Недоступно.` | пока недоступна|отключена|закрыто|неактивно | 39 | battle_ui|disabled_states|dm_ui|economy_toasts|events_voting_crowd|general_interface|p2p|pending_states |

## Governance decisions

- `CONCEPT_POINTS_CURRENCY` resolves to canonical `💰`. Forbidden variants: пойнты|пойнтов|Points|P|сверхпойнты. Notes: Player spendable currency appears as emoji, Russian word, English Points and P shorthand. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_REPUTATION` resolves to canonical `⭐`. Forbidden variants: REP|Репутация|репутация. Notes: Reputation resource appears as star, REP abbreviation and Russian word. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_INSUFFICIENT_FUNDS` resolves to canonical `Не хватает 💰.`. Forbidden variants: Не хватает пойнтов.|Пойнтов не хватает.|У вас недостаточно пойнтов.|Не прокает: нет P.|Не прокает: мало 💰 на баттл.|Нужно 1💰, сейчас не хватает.|не хватает. Notes: Insufficient-funds errors use one canonical wording; all point/P variants are forbidden. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_CROWD_DECISION` resolves to canonical `Толпа решает`. Forbidden variants: Решает толпа|Голосование идёт|голосование|голоса|толпа решила. Notes: Crowd voting/decision copy mixes crowd-decision and voting wording. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_ESCAPE_ACTION` resolves to canonical `Свалить`. Forbidden variants: Уйти|смыться|смыться от|свалить от|СВАЛИТЬ. Notes: Escape action/result vocabulary should standardize on the player-facing verb. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_IGNORE_ACTION` resolves to canonical `Отвали`. Forbidden variants: Отвалить|отвали|отвалил|Отвалил. Notes: Ignore/brush-off action mixes imperative and infinitive/result forms. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_REPORT_ACTION` resolves to canonical `Сдать`. Forbidden variants: донос|репорт|сообщите|отмечен(а)|заявка. Notes: Cop report flow mixes сдача, донос, репорт and report-message vocabulary. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_ARGUMENT_TRAINING` resolves to canonical `Обучить аргументу`. Forbidden variants: Тренировка аргумента|Тренировка аргумента (${price} 💰)|обучил(а)|Цена: {cost} 💰. Notes: Argument upgrade action appears as training and teaching. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_COOLDOWN` resolves to canonical `кулдаун`. Forbidden variants: Кулдаун|cooldown|ещё ${status.remainingDays || 0} дн.|кулдаун до дня. Notes: Cooldown copy should use one term and reserve limit/cap for price caps. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_PRICE_CAP` resolves to canonical `лимит`. Forbidden variants: Cap|Кап|max Points|max REP|Лимит. Notes: Price/currency caps mix English Cap, Russian cap and limit wording. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_BATTLE_ACTION` resolves to canonical `баттл`. Forbidden variants: конфликт|забатлить|баттлить. Notes: Conflict action copy mixes battl slang and conflict wording. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1
- `CONCEPT_UNAVAILABLE_STATE` resolves to canonical `Недоступно.`. Forbidden variants: пока недоступна|отключена|закрыто|неактивно. Notes: Unavailable/disabled state uses several equivalent labels. Duplicate group resolves to exactly one canonical term. STEP3_TERMINOLOGY_CANON_V1

## Validation

- Static canon validation command: `tools/validate-step3-terminology-canon.py docs/terminology/STEP3_TERMINOLOGY_INVENTORY.csv docs/terminology/STEP3_TERMINOLOGY_CANON.csv`.
- Runtime helper command for Safari: `Game.__DEV.smokeStep3TerminologyCanonOnce()` (READY_FOR_RUNTIME_SMOKE until executed on iPhone Safari).
