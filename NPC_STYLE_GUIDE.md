# NPC Style Guide

Dev-only validation rules for NPC speech strings. This guide defines checks used by `Game.__DEV.smokeNpcSpeechStyleRulesOnce()` and does not rewrite gameplay, UI, or text content.

## Scope

Validate NPC-facing speech inventory categories only:

- `dm`
- `battle`
- `events`
- `reportReactions`

If a category cannot be proven by the inventory smoke, the linter must report it in `missingCoverage`.

## Rules

1. **Phrase length limits**
   - Default NPC phrase: up to 18 words.
   - Cop / report reaction phrase: up to 24 words.
   - Event/system NPC phrase: up to 22 words.
2. **Direct “you” tone where applicable**
   - Lines aimed at the player must use direct second-person tone (`ты`, `тебя`, `тебе`, `твой`, `вы`, `вас`, `вам`, `ваш`) when the source is marked as directly addressed.
3. **No teen slang**
   - Reject obvious youth-slang tokens such as `вайб`, `кринж`, `хайп`, `тикток`, `лулз`, `рофл`, `имба`, `краш`, `чилл`.
4. **No memes**
   - Reject meme-coded tokens such as `скибиди`, `мем`, `лол`, `кек`, `жиза`, `ой все`, `зашел в чат`.
5. **No officialese**
   - Reject bureaucratic wording outside cop/report sources.
6. **No teacher tone**
   - Reject lecture/scolding phrasing like `включите мозг`, `будь внимателен`, `запомни`, `урок`, `объясняю`.
7. **No NPC self-talk in third person**
   - Reject lines where an NPC talks about itself as `он`, `она`, or by explicit NPC name in first-person contexts.
8. **No extra names except cops**
   - Non-cop NPC speech must not include hard-coded NPC display names. Cop/report sources may include cop names through `{cop.fullName}`.
9. **No broken placeholders**
   - Reject unmatched braces, empty placeholders, `${...}` remnants, or placeholders outside the allowed placeholder set for the source.
10. **No empty strings**
   - Empty or whitespace-only entries are invalid.
11. **No unclear source/category**
   - Every checked string must have a known source and one of the required categories.

## Result shape

The smoke returns:

```js
{
  ok,
  failures,
  forbiddenRemaining,
  missingCoverage,
  failedChecks,
  categories,
  violations
}
```

`ok` is `true` only when `failures`, `forbiddenRemaining`, `missingCoverage`, and `failedChecks` are all empty. `violations` are grouped by category and rule.
