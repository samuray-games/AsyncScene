# STAGE 6 STEP 9 - SLANG SEMANTIC VALIDATION GATE

STATUS: FOUNDATION_RULE / COPY_REVIEW_GATE

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

## 1. Purpose

Step 9 explicitly allows strong slang, memes, borrowed English, emoji/code language and generational references.

The quality rule is:

> `NO FALSE OR MISUSED SLANG`, not `NO SLANG`.

A phrase can be highly generational and still FAIL if the slang is used with the wrong meaning.

This document is a semantic gate for creative review before copy freeze.

External language references used for validation include current 2025-2026 descriptions from Russian language/education sources and contemporary English dictionary coverage of Gen Alpha/brainrot terms. External references inform semantic meaning only; user + ChatGPT remain the creative authority for Asynchronia copy.

## 2. Alpha / brainrot semantic guardrails

### `W` / `L`

Meaning:

- `W` = win/success/good outcome.
- `L` = loss/failure/bad outcome.

Good contexts:

- battle win/loss;
- successful/failed action reactions;
- NPC praise/mockery;
- social outcome shorthand.

Bad contexts:

- unclear critical controls where W/L does not explain the action.

Verdict: `STRONG_APPROVED_SEMANTIC_LANE`.

### `cooked`

Meaning:

- doomed;
- in trouble;
- badly defeated/exhausted/finished depending context.

Good contexts:

- defeat;
- severe failure;
- being outplayed;
- low-money disaster metaphor when clearly expressive rather than mechanical label.

Bad contexts:

- generic success;
- neutral completion;
- direct synonym for `bought`, `sent`, `accepted`.

Examples:

- good: `меня cooked 💀` after losing.
- good: `кошелёк cooked 💀` as expressive bankruptcy reaction.
- bad: `cooked` meaning `готово`.

Verdict: `APPROVE_CONTEXTUALLY`.

### `let him cook` / `cooked here`

Meaning:

- let someone continue doing something because they may produce a good result;
- someone performed/created something effectively.

Do not confuse with `is cooked`.

Verdict: `DISTINCT_FROM_DOOMED_COOKED`.

### `aura` / `aura points`

Meaning:

- perceived coolness;
- social presence/status/swagger;
- often framed as gaining/losing imaginary points.

Good contexts:

- expressive reputation/status reactions;
- embarrassment/success social reactions;
- Alpha NPC commentary.

Bad contexts:

- literal replacement for every REP mechanic label without context;
- influence/power when the semantic meaning is not social status.

Examples:

- good: `aura −1000` after embarrassing failure.
- candidate: REP gain/loss flavour toast, only if mechanic value remains clear.
- bad: rename canonical `Репутация` stat itself to `Aura` without explicit product decision.

Verdict: `STRONG_ALPHA_MARKER / DO_NOT_OVERGENERALIZE`.

### `rizz`

Meaning:

- romantic/social charm, especially ability to attract/flirt.

Good contexts:

- only if a future/current semantic surface actually concerns charm/flirting/social attraction.

Bad contexts:

- generic reputation;
- influence;
- argument strength;
- money;
- success.

Verdict: `DO_NOT_USE_AS_GENERIC_CHARISMA_OR_REP`.

### `skibidi`

Meaning:

- strongly meme-coded, often intentionally nonsensical/absurd;
- can signal weird/chaotic rather than one stable positive/negative definition.

Good contexts:

- rare Alpha absurd reaction/flavour line;
- intentionally nonsensical decorative NPC reaction.

Bad contexts:

- stable mechanical labels;
- generic synonym for `плохо`;
- critical actions.

Verdict: `RARE_FLAVOUR_ONLY`.

### `sigma`

Meaning:

- internet-coded idea of a self-reliant/high-status/cool lone figure;
- often used ironically/brainrot-style.

Good contexts:

- rare Alpha praise/character reaction;
- absurd I3 flavour.

Bad contexts:

- generic `start` button;
- generic `success`;
- every strong action.

Current draft review:

- `sigma mode` as generic `Начинаем` is likely too vague/forced and should not freeze without explicit approval.

Verdict: `USE_SPARINGLY / NOT_GENERIC_START_COPY`.

### `NPC`

Meaning:

- a person behaving generic, scripted, unoriginal, passive, or game-character-like.

Good contexts:

- toxic insult such as `NPC take`;
- reaction to bizarre scripted-looking behaviour;
- Alpha ambient commentary.

Bad contexts:

- arbitrary synonym for person/player;
- labels for actual game NPCs when the joke destroys immersion unintentionally.

Verdict: `APPROVE_FOR_META_REACTION_OR_INSULT`.

### `mid`

Meaning:

- mediocre;
- unimpressive;
- average in a dismissive way.

Good contexts:

- toxic evaluation;
- weak argument reaction;
- disappointing result.

Bad contexts:

- catastrophic failure (`mid` is too weak);
- neutral action labels.

Verdict: `APPROVE_FOR_MEDIOCRITY`.

### `yapping`

Meaning:

- talking excessively/too much, often without enough substance.

Good contexts:

- toxic response to overly long/empty speech;
- NPC reaction to rambling.

Bad contexts:

- any disagreement regardless of verbosity;
- generic synonym for chat/message.

Verdict: `APPROVE_FOR_EXCESSIVE_TALK_CONTEXT`.

### `fanum tax`

Meaning:

- meme term originating from taking/stealing someone else's food.

Current draft correction:

- `fanum tax 💰` as a generic bandit demand for money is semantically wrong.
- It is explicitly `REJECT_MISUSED_SLANG` for current robbery-money semantics.

Potential valid context:

- only a food/snack-stealing joke or a deliberately food-related interaction.

Verdict: `REJECT_FOR_GENERIC_MONEY_ROBBERY`.

### `mog` / `mogging`

Meaning:

- outclass/outperform someone, originally strongly appearance/status coded and later broadened.

Good contexts:

- rare Alpha/Zoomer gloat about clearly outclassing someone.

Bad contexts:

- every victory;
- generic attack label.

Verdict: `OPTIONAL_RARE_GLOAT`.

### `brainrot`

Meaning:

- mindless/hyper-online digital content and the fixation/language around it.

Good contexts:

- meta commentary on absurd online behaviour/content.

Bad contexts:

- generic synonym for stupid;
- generic negative result.

Verdict: `META_CONTEXT_ONLY`.

## 3. Zoomer Russian semantic guardrails

### `кринж`

Meaning:

- embarrassment/second-hand embarrassment/awkwardly bad behaviour.

Good:

- embarrassing action;
- socially awkward fail;
- awkward NPC reaction.

Bad:

- every negative event;
- insufficient money;
- neutral error.

Verdict: `EMBARRASSMENT_NOT_GENERIC_BAD`.

### `база`

Meaning:

- agreement/approval that a statement is fundamentally right/solid.

Good:

- agreement reaction;
- support of a take/argument.

Bad:

- generic success;
- item reward;
- money gain.

Verdict: `AGREEMENT_CONTEXT`.

### `жиза`

Meaning:

- relatable/recognisably true from lived experience.

Good:

- relatable reaction;
- empathy/recognition.

Bad:

- generic agreement without relatability.

Verdict: `RELATABILITY_CONTEXT`.

### `скип`

Meaning:

- skip/decline/pass over.

Good:

- decline button where meaning remains obvious;
- refusal reaction;
- intentionally passing an option.

Bad:

- generic failure;
- close/exit when skipping is not the action.

Verdict: `STRONG_DECLINE_LANE`.

### `вайб`

Meaning:

- atmosphere/feel/mood/impression.

Good:

- ambience;
- tone;
- social reaction.

Bad:

- generic mechanic noun;
- money/status/action replacement.

Verdict: `ATMOSPHERE_CONTEXT`.

### `имба`

Meaning:

- overpowered/extremely strong, from gaming `imbalanced`.

Good:

- unusually strong advantage;
- powerful result/build/argument where strength is relevant.

Bad:

- generic `хорошо`;
- neutral success.

Verdict: `POWER/STRENGTH_CONTEXT`.

### `рофл`

Meaning:

- joke/laugh/absurd humorous situation.

Good:

- `что за рофл?` for absurd/comical situation.

Bad:

- serious unexplained danger;
- generic confusion without humorous/absurd framing.

Verdict: `JOKE/ABSURD_CONTEXT`.

### `репа`

Meaning:

- colloquial shortening of reputation.

Good:

- expressive Zoomer/older-gaming-internet flavour where unambiguous.

Risk:

- not uniquely Zoomer; can also read as older gamer/internet slang.
- therefore it should not be treated as a strong hidden-label marker by itself.

Verdict: `ALLOWED_BUT_NOT_GENERATION_SIGNATURE`.

### `лут`

Meaning:

- game loot/reward/items gained.

Good:

- actual reward/loot-like gain.

Bad:

- every arbitrary success;
- money movement with no reward framing.

Verdict: `REWARD/GAME_GAIN_CONTEXT`.

### `skill issue`

Meaning:

- mocking claim that a failure is due to lack of skill/competence.

Good:

- toxic/mockery line after a competence-related fail.

Bad:

- bandit demand (`Не делай skill issue`) where no skill failure exists.

Current draft correction:

- Zoomer bandit line `Не делай skill issue.` is `REJECT_MISUSED_CONTEXT`.

Verdict: `TOXIC_COMPETENCE_INSULT_ONLY`.

## 4. Cross-generation ambiguity guard

Some slang terms span multiple generations and therefore cannot serve as a generation signature by themselves.

Examples:

- `репа` can read gamer/internet rather than uniquely Zoomer;
- `лол` spans Millennial into later generations;
- `чувак` spans Gen X and later colloquial speech;
- `жесть` spans Millennial and broader modern Russian;
- `кринж` is strongly younger but now also understood/used outside strict Gen Z.

Therefore hidden-label identity must come from the **whole pattern**:

- sentence rhythm;
- reference density;
- emoji/code usage;
- vocabulary combinations;
- humour mode;
- level of compression;
- cultural assumptions.

Do not pass Step 9 by inserting one signature token into otherwise neutral copy.

## 5. Draft corrections already identified

The following current foundation candidates must NOT freeze as written:

1. Alpha bandit `fanum tax 💰` -> reject for wrong semantic meaning.
2. Zoomer bandit `Не делай skill issue.` -> reject because robbery compliance is not a skill failure.
3. Alpha generic start reaction `sigma mode` -> likely too vague/forced for a generic start intent; requires replacement or rare-flavour reassignment.
4. Any use of `rizz` as generic REP/influence -> forbidden unless actual charm/flirt semantics exist.
5. Any use of `skibidi` as a stable synonym for `плохо` -> forbidden; reserve for rare absurd/nonsense flavour.

## 6. Candidate replacement direction

For the rejected bandit lines:

Alpha money-demand candidates:

- `pay up 💀`
- `💰 now.`
- `bank. now.`
- `💰 or L.`

Zoomer robbery-pressure candidates:

- `Не дёргайся.`
- `Без мувов.`
- `Скидывай 💰.`
- `Решай быстрее.`

These still require user approval, but their semantics match the actual role better.

## 7. Freeze checklist for every slang token

Before approving a slang-bearing row, answer:

1. What does this term actually mean now?
2. Does that meaning match the exact game event?
3. Is it natural in Russian-speaking usage, or are we importing English mechanically?
4. Which generation lane does it actually help identify?
5. Is the term current enough for the target profile?
6. Are we repeating it so often that every NPC becomes the same person?
7. Would a player understand the underlying action/outcome without needing a glossary?
8. Is the line I0/I1, where clarity should override meme density?

Any uncertain answer keeps the row `DRAFT`, never `FROZEN`.

NEXT_ACTION: apply this semantic gate during review of Batch 1, Batch 2 and NPC voice pools; mark rejected/misused candidates before five-profile copy freeze.