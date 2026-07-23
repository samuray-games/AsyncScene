# STAGE 6 STEP 9 - FIVE PROFILE RU VOICE BIBLES DRAFT

STATUS: DRAFT_FOR_USER_APPROVAL

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

## 1. Purpose

This document defines generation-level creative constraints for the Russian-first Step 9 pass.

It does not contain mechanics.

It exists so that hundreds of later semantic rows do not degrade into:

- one neutral base plus random slang tokens;
- Boomer = longer sentences;
- Gen X = `чувак` everywhere;
- Millennial = neutral/default;
- Zoomer = `бро/кринж` everywhere;
- Alpha = English abbreviations everywhere.

Each profile must have a coherent voice system.

## 2. Universal rules

### Same game

All five profiles preserve:

- mechanics;
- costs;
- REP/influence meaning;
- battle outcomes;
- NPC behavior;
- state/persistence;
- placeholders;
- factual content.

### Different cultural rendering

May differ:

- vocabulary;
- syntax;
- sentence length;
- slang;
- meme/reference density;
- emoji density;
- humour model;
- profanity intensity;
- punctuation/case;
- borrowed English;
- degree of explicit explanation.

### Intensity ladder

- `I0_CRITICAL`: obvious action first.
- `I1_GUIDANCE`: generation visible, meaning unambiguous.
- `I2_EXPRESSIVE`: strong generation identity.
- `I3_FULL_FREEDOM`: maximum flavour while preserving semantic intent.

### No token cosplay

A generation is not defined by one keyword.

FAIL examples:

- adding `бро` to every Zoomer line;
- adding `aura` to every Alpha line;
- adding `чувак` to every Gen X line;
- adding `молодой человек` to every Boomer line;
- adding `лол` to every Millennial line.

Identity comes from the full pattern.

---

# BOOMER

## Core feel

`ПИЗДЕЦ БУМЕР`, but not bureaucrat, not helpless grandparent, not parody.

The interface should feel authored for a person whose baseline communication culture formed before the modern social-web era.

## Rhythm

- complete sentences;
- explicit subject/action/result;
- fewer abrupt fragments;
- one useful consequence when needed;
- punctuation mostly conventional;
- less lowercase-as-style;
- exclamation used for actual emotion, not decoration.

## Vocabulary lane

Prefer:

- clear Russian verbs;
- `сообщить`, `проверить`, `принять`, `отказаться`, `выбрать`, `повторить`;
- idiomatic older-neutral phrases: `ну и дела`, `вот это номер`, `дело сделано`, `вот ведь неприятность`, `что ж`, `пожалуй`;
- context-rich nouns rather than unexplained abbreviations.

Avoid overusing:

- corporate `осуществить`, `произвести операцию`, `пользователь`;
- moralising `следует`, `вы должны` unless literal rule;
- fake Soviet caricature on every line;
- youth anglicisms for ordinary concepts.

## Humour model

- observational;
- dry old-fashioned understatement;
- recognisable idioms;
- occasional cultural echo without quoting protected text.

Good flavour direction:

- `Вот это номер.`
- `Ну и дела.`
- `Деньги закончились. Бывает и такое.`

Bad:

- every line pretending to be a Soviet newspaper;
- `уважаемый пользователь`;
- forced nostalgia unrelated to the event.

## Emoji

- low density;
- stat icons may remain because they are game symbols;
- expressive emoji rare.

Target density:

- I0: near zero beyond mechanic icons;
- I2/I3: 0-1 when genuinely useful.

## Profanity

- rare;
- role-dependent NPCs may use ordinary profanity if character/canon allows;
- system UI should not become vulgar just to signal age.

## Cultural marker palette

Use sparingly:

- older idioms;
- pre-social-web conversational rhythm;
- telephone/newspaper/TV-era metaphors where context fits;
- analog-life assumptions without turning every line into nostalgia.

## Hidden-label signature

A hidden reader should notice:

- completeness;
- explicitness;
- idiomatic older Russian;
- restrained technology slang;
- explanatory confidence without corporate tone.

---

# GEN X

## Core feel

`ПИЗДЕЦ GEN X`.

Dry, street-smart, culturally shaped by late Soviet childhood/adolescence, 90s rupture, early digital adoption and pre-social-network adulthood.

Not Boomer-lite. Not Millennial-minus-memes.

## Rhythm

- short;
- clipped but understandable;
- dry punchline after fact;
- often one sentence;
- less emotional exposition than Millennial;
- less explanatory scaffolding than Boomer.

## Vocabulary lane

Candidate authentic lane when context fits:

- `облом`;
- `отстой`;
- `прикол`;
- `тема`;
- `клёво`;
- `ни фига`;
- `разборка`;
- `наезд`;
- `ответка`;
- `вписаться`;
- `пас`;
- `не нарывайся`;
- `без базара` for specific street/crime role only;
- `не кипишуй` for specific informal/role contexts only.

Do not make these universal UI replacements.

## Humour model

- dry sarcasm;
- understatement;
- gallows humour;
- practical `ну бывает` energy;
- punchline without explaining the joke.

Good:

- `Касса похудела.`
- `Вот это облом.`
- `Ну всё, приехали.`
- `Не прошло.`

Bad:

- endless retro props;
- forced cassette/VHS/pager references in unrelated events;
- every line using 90s criminal slang.

## Emoji

- very low density;
- mostly mechanic icons;
- expressive emoji exceptional.

## Profanity

- more natural than Boomer system voice in character speech;
- dry ordinary Russian swearing may fit NPC/dialogue I3;
- avoid turning Gen X into a criminal caricature.

## Cultural marker palette

Use when context fits:

- 80s/90s colloquial rhythm;
- early market/transition-era phrases;
- analog-to-digital bridge metaphors;
- dry pre-social-media sarcasm.

## Hidden-label signature

A hidden reader should notice:

- terse confidence;
- old-school colloquial words;
- dry sarcasm;
- low emoji/meme density;
- no need to narrate emotions.

---

# MILLENNIAL

## Core feel

`ПИЗДЕЦ МИЛЛЕНИАЛ`.

Digitally fluent adult shaped by forums, ICQ, LiveJournal, early social networks, blogs, online games, torrents, desktop internet and the transition from optimism to chronic self-irony.

Must not remain neutral/default.

## Rhythm

- medium length;
- often fact + ironic afterthought;
- parenthetical/meta-comment energy;
- complete sentences but less formal than Boomer;
- can build a tiny narrative in one/two sentences.

## Vocabulary lane

Potential markers when natural:

- `жесть`;
- `мда`;
- `ну такое`;
- `лол` sparingly;
- `печалька` only deliberately retro/self-aware;
- `рукалицо` only deliberately retro/self-aware;
- `оффтоп`;
- `тред`;
- `вкладка`;
- `статус «печатает...»`;
- `скриншот`;
- `лог`;
- `бан`;
- `форум`/`чат`/`личка` where natural.

Do not resurrect every 2007 meme as if it were current everyday speech.

## Historical internet layer

Russian internet culture of the 2000s included deliberately distorted orthography and fixed meme formulas often grouped under `олбанский`/`язык падонков`.

Use this as cultural memory, not as the whole Millennial voice.

Rules:

- rare deliberate references can strongly signal generation;
- do not write the whole UI in distorted spelling;
- dead memes should be used self-consciously or not at all;
- `превед`, `аффтар`, `жжош`, etc. are flavour references, not default vocabulary.

## Humour model

- self-irony;
- digital-life metaphors;
- bureaucracy/work/deadline fatigue;
- internet-history awareness;
- `we know this is ridiculous` tone.

Good direction:

- `Ну всё, приехали.`
- `Бюджет снова проходит сюжетную арку.`
- `Голос уже учтён. Второй бюллетень не завезли.`
- `Позиция сейчас сама себя удалила.`

Risk:

Do not make every line about:

- Excel;
- ипотеку;
- дедлайны;
- ICQ;
- терапию;
- кофе.

Those become marketer stereotypes if repeated.

## Emoji

- moderate but restrained;
- emoticons/text reactions can appear as deliberate retro flavour;
- modern emoji not forbidden, just less syntax-critical than Zoomer/Alpha.

## Profanity

- natural conversational profanity may fit I2/I3;
- often used self-ironically rather than as constant aggression.

## Cultural marker palette

- forums;
- ICQ;
- ЖЖ;
- ранний VK;
- torrents;
- browser tabs;
- online games;
- desktop messenger language;
- old meme/self-irony references.

## Hidden-label signature

A hidden reader should notice:

- internet-era self-awareness;
- dry meta-humour;
- slightly longer reaction phrasing;
- adult digital metaphors;
- nostalgia used as seasoning, not costume.

---

# ZOOMER

## Core feel

`ПИЗДЕЦ ЗУМЕР`.

Network-native, fast, meme-literate, direct, socially reactive, but not a random bag of slang.

The voice should feel naturally online, not like a brand manager copied a TikTok glossary.

## Rhythm

- short;
- fast;
- lowercase allowed;
- fragments allowed;
- emoji can carry tone;
- one strong slang marker is often enough;
- less explanation than Millennial.

## Vocabulary lane

Context-valid candidates:

- `кринж` - embarrassment/awkwardness;
- `база` - agreement/solid take;
- `жиза` - relatable;
- `скип` - decline/skip;
- `вайб` - atmosphere/feel;
- `имба` - overpowered/very strong;
- `рофл` - joke/absurdity;
- `репорт` - report;
- `КД` - cooldown where gamer context is clear;
- `тейк` - expressed opinion/position;
- `чекнуть` - check;
- `залетел` - entered/was accepted contextually;
- `бро` - address, not punctuation.

Cross-generation caution:

- `репа`, `лол`, `чувак`, `жесть` are not uniquely Zoomer markers.

## Semantic correctness rules

- `кринж` is not generic bad;
- `база` is not generic success;
- `вайб` is not generic noun replacement;
- `имба` implies strength/overpowered quality;
- `skill issue` is competence mockery;
- `cooked` means doomed/in trouble/defeated, not `готово`.

## Humour model

- compressed reaction;
- meme-aware;
- irony through juxtaposition;
- emoji as punchline;
- less explanatory setup.

Good:

- `Кошелёк пуст 💀`
- `Репорт мимо 💀`
- `L тейк.`
- `что за рофл?`
- `ты сам себя cooked.`

Bad:

- `кринж база вайб бро` in one line;
- slang in every I0 button;
- mistranslated English meme phrases.

## Emoji

- medium/high in I2/I3;
- can be syntactic punctuation;
- should not repeat permanent stat icons unnecessarily in unified toasts.

Common expressive set candidate:

- `💀` embarrassment/fail/absurdity;
- `😭` emotional exaggeration where culturally natural;
- `🔥` strong/good;
- `📈` rise;
- `🫠` awkward/error.

Do not force one emoji into every line.

## Profanity

- casual profanity can be natural in NPC/player-like I3 voice;
- system copy can stay lighter while still unmistakably Zoomer;
- do not use profanity as a substitute for generational specificity.

## Cultural marker palette

- short-form/social media language;
- gaming vocabulary;
- meme reaction grammar;
- current internet borrowings;
- community/chat framing.

## Hidden-label signature

A hidden reader should notice:

- speed;
- internet-native compression;
- context-correct slang;
- emoji grammar;
- current reaction vocabulary.

---

# ALPHA

## Core feel

`ПИЗДЕЦ АЛЬФА`.

Born into fully algorithmic short-form/video/game culture. More compressed and more code-like than Zoomer. Brainrot/meta-language may be used strongly in I3, but semantic precision is mandatory.

Alpha is not `Zoomer.uppercase()` and not `Zoomer minus words`.

## Rhythm

- ultra-short;
- code fragments;
- English borrowings mixed into Russian where natural;
- symbols/emoji may replace connective text;
- reaction language can be one/two tokens;
- I0 critical actions still understandable.

## Vocabulary lane

Semantically validated candidate families:

- `W` / `L` - win/loss;
- `aura` / aura points - social coolness/status;
- `NPC` - scripted/unoriginal person/behavior;
- `mid` - mediocre;
- `yapping` - excessive talking;
- `cooked` - doomed/defeated/in trouble;
- `sigma` - cool/lone/high-status, often ironic;
- `rizz` - romantic charm only;
- `skibidi` - absurd/nonsense meme marker, not fixed generic adjective;
- `mog` - outclass/outperform, especially status/appearance origins;
- `brainrot` - hyper-online mindless content/style;
- `bro` - address;
- `nah` - refusal/rejection;
- `real` - strong relatability/agreement;
- `W take` / `L take` - positive/negative evaluation of a take.

## Explicit forbidden misuse

- `fanum tax` for generic money robbery - wrong semantics; reject unless food-stealing context.
- `rizz` for generic REP/influence - wrong unless charm/flirt meaning exists.
- `skibidi` as generic `плохо` - too semantically unstable/nonsensical.
- `sigma mode` as generic start button - too vague for I0 and likely forced.
- `aura` as literal replacement for canonical REP stat without separate approved decision.

## Humour model

- absurd compression;
- visual reaction;
- meta-game codes;
- brainrot references used as deliberate flavour;
- `the reaction is the sentence`.

Good I3 direction:

- `L 💀`
- `aura −1000`
- `NPC take.`
- `bro yapping.`
- `W.`
- `cooked.`

Bad:

- strings of unrelated brainrot keywords;
- forcing `skibidi sigma rizz` into mechanics;
- English-only critical UI that Russian players cannot parse.

## Emoji/symbol density

- high in I2/I3;
- symbols can replace words when obvious;
- `+`, `−`, `/`, `>`, `=`, `W/L` can carry structure.

But:

- do not reduce critical semantic clarity;
- do not duplicate permanent stat icons inside unified stat toasts without reason.

## Profanity

- meme-coded profanity/abbreviation can appear in character/flavour lines when appropriate;
- not necessary for every Alpha line;
- absurdity and code language are stronger identity markers than raw swearing alone.

## Cultural marker palette

- short-form video;
- gaming/streamer language;
- reaction memes;
- brainrot vocabulary;
- aura/W/L status framing;
- meta-commentary on NPC/scripted behavior.

## Hidden-label signature

A hidden reader should notice:

- extreme compression;
- code-like grammar;
- W/L/aura/NPC-style semantic systems;
- higher emoji/symbol role;
- distinct from Zoomer's more normal conversational Russian.

---

# 3. Cross-profile contrast matrix

| Dimension | Boomer | Gen X | Millennial | Zoomer | Alpha |
|---|---|---|---|---|---|
| sentence length | medium/full | short | medium | short | ultra-short |
| explanation | high when useful | low | medium | low | minimal |
| humour | idiom/understatement | dry sarcasm | self/meta irony | meme reaction | code/brainrot absurdity |
| emoji | low | very low | low-medium | medium-high | high |
| English borrowings | low | low | medium | high | very high/selective |
| retro internet | low | pre-web/early digital | high | low | none except ironic ancient-web reference |
| slang density | low/moderate role-based | moderate | moderate | high but contextual | high/coded but contextual |
| profanity | low/system | natural role-based | conversational | casual/meme | meme/code/character-based |
| default casing | conventional | conventional | conventional | lower-case common | flexible/code-like |
| strongest identity surface | explanation/idiom | dry reaction | meta-humour | slang/emoji reaction | code/visual reaction |

# 4. Shared-copy rule

It is acceptable for an I0 control to share exact copy across profiles when differentiation would harm clarity.

Example candidate:

`Меню` may remain `Меню` for all profiles.

But shared copy must be explicit:

`KEEP_SHARED_INTENTIONALLY`

Never accidental fallback.

# 5. Distribution rule

Each profile should have a balanced marker distribution.

No single marker should dominate enough to become parody.

Before freeze, count repeated signature tokens per profile and flag overuse.

Suggested review checks:

- `бро` frequency;
- `💀` frequency;
- `aura` frequency;
- `W/L` frequency;
- `чувак` frequency;
- `облом` frequency;
- `жесть` frequency;
- explicit retro references (ICQ/ЖЖ/VHS/etc.);
- `молодой человек` frequency;
- bureaucratic vocabulary.

# 6. Hidden-label acceptance

Test with at least:

- 10 persistent/common UI rows;
- 10 system/toast/result rows;
- 10 NPC/reaction rows;

per generation.

Remove generation labels and shuffle rows.

PASS target:

- generation is usually recognisable from pattern alone;
- no profile depends on one giveaway keyword;
- semantic intent remains understandable;
- adjacent generations are separable;
- users do not need a glossary for I0/I1.

# 7. Freeze status

All content in this bible is `DRAFT_FOR_USER_APPROVAL` until the user + ChatGPT freeze a revision/hash.

Codex may use the frozen bible as a validator/constraint source, but may not invent new copy from it when an exact mapping is absent.

NEXT_ACTION: use these bibles to review Batch 1, Batch 2 and NPC pools; then expand remaining inventory families and freeze exact copy.