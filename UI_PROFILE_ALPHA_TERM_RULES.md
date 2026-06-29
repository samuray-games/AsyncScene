# UI_PROFILE_ALPHA_TERM_RULES

- Contract scope: UI-layer Alpha term rules only.
- Alpha inherits from Zoomer.
- This step is spec-only and does not activate runtime Alpha copy.
- Codex must not invent Alpha phrases.

## Term definition

- A term is a stable action, state, resource, entity, or navigation label.
- Terms exclude explanatory sentences, dynamic templates, proper names, technical diagnostics, and accessibility-only descriptions.
- Word count uses lexical Cyrillic or Latin words.
- Emoji, numbers, punctuation, operators, and placeholders do not add lexical words.

ALPHA_TERM_RULES_JSON_START
```json
{
  "id": "alpha_term_rules_v1",
  "profile": "alpha",
  "inherits": "zoomer",
  "scope": "stable_action_state_entity_terms",
  "runtimeActivation": false,
  "maxWordsPerTerm": 2,
  "oneMeaningOneTerm": true,
  "synonymPolicy": "forbidden",
  "visualSupportRule": {
    "visualMayReplaceRepeatedText": true,
    "supportedVisuals": ["icon", "color", "chip"],
    "accessibilityFallbackRequired": true,
    "colorAloneForbidden": true
  }
}
```
ALPHA_TERM_RULES_JSON_END

## Rules

1. One or two words

- Every Alpha term contains one or two lexical words.
- Three or more lexical words are invalid.

2. One meaning, one term

- The same semantic action or state must use the same canonical term on every surface.
- Different words for the same meaning are invalid.
- Surface-specific synonyms are forbidden.

3. Visual support

- An established icon, color, or chip may replace repeated contextual text.
- Visual support must not change mechanics or meaning.
- Critical meaning must remain available through accessible text or labels.
- Color alone cannot communicate a critical state.

4. Boundaries

- This rule does not require every Alpha sentence or template to contain only two words.
- This rule does not authorize rewriting existing Alpha copy.
- This rule does not introduce UI, logic, state, handlers, or mechanics.

## Static smoke fixtures

- Positive term fixtures:
  - `Старт`
  - `Точный ник`
  - `Мало 💰`
- Negative length fixture:
  - `Начать игру сейчас`
- Synonym-collision fixture:
  - semantic meaning: `start_action`
  - conflicting terms: `Старт`, `Погнали`
  - expected result: rejected

## Static smoke PASS requirements

- both rule files exist
- mirrors are byte-identical
- JSON parses
- `maxWordsPerTerm <= 2`
- `oneMeaningOneTerm === true`
- `synonymPolicy === "forbidden"`
- `synonymGroups` is absent
- `visualSupportRule` exists
- all required visual-support fields pass
- positive term fixtures pass
- negative length fixture fails
- synonym-collision fixture fails
