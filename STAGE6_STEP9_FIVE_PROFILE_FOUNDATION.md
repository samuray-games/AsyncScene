# STAGE6 STEP 9 - FIVE PROFILE TONE FOUNDATION

STATUS: DRAFT_FOR_USER_APPROVAL
BASELINE_MAIN: 7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e
SOURCE_OF_PRODUCT_DIRECTION: current user instruction + live Notion MEMORY_REV 2026-07-23-1119-JST + Stage 6 Step 9 source contract
IMPLEMENTATION_OWNER_AFTER_APPROVAL: Codex
COPY_OWNER: User + ChatGPT
LANGUAGE_PHASE: Russian-first
MECHANICS_POLICY: PRESENTATION_ONLY

## 1. Purpose

Stage 6 Step 9 is not a mild tone-polish pass. It is the bold generational retro-audit.

The goal is to make one unchanged game feel unmistakably native to five generations through wording alone:

1. Boomer
2. Gen X
3. Millennial
4. Zoomer
5. Alpha

The generation should be recognisable without displaying its label.

This foundation supersedes cautious earlier tone guidance wherever that guidance would force the UI into a neutral or sterile voice. It does not supersede mechanic invariants, persistence rules, economy rules, battle rules, placeholder preservation, text-only profile isolation, or user-owned visual acceptance.

The governing rule is:

`NO FALSE OR MISUSED SLANG`, not `NO SLANG`.

Authentic slang, memes, profanity, emojis, cultural markers, borrowed vocabulary and generation-specific shorthand are allowed and desired when they are:
- semantically correct;
- context-appropriate;
- natural in Russian-speaking usage of that generation;
- not repeated mechanically everywhere;
- not blocking comprehension of the mechanic.

## 2. Non-negotiable mechanic invariants

Tone profiles are presentation skins over one canonical game.

Profiles MUST NOT change:
- economy values or prices;
- REP / points / influence mechanics;
- battle outcomes;
- argument logic;
- handlers or event ordering;
- NPC decision logic;
- state shape;
- persistence semantics;
- moneyLog / ledger semantics;
- cooldown rules;
- report truth evaluation;
- save behavior except the already-canonical uiProfile value.

Codex must treat any required logic change as out-of-scope unless a separate mechanic task explicitly authorizes it.

## 3. Five first-class profiles

### 3.1 Birth-year bands

Use the already-present generation bands:
- 1946-1964 -> boomer
- 1965-1980 -> genX
- 1981-1996 -> millennial
- 1997-2012 -> zoomer
- 2013-current year -> alpha

The repository already contains `genX` in `yearBands` and in the canonical profile map, but current runtime support is incomplete.

### 3.2 Current Gen X implementation gap

Current source already has:
- `yearBands` mapping 1965-1980 -> `genX`;
- canonical normalization `genx -> genX`.

Current source is missing/incomplete at least:
- `UI_PROFILE_REGISTRY.supported` does not include `genX`;
- text-mode resolver has no `genX` branch and falls through to millennial;
- start-screen profile dictionary has no `genX` package;
- current Stage 6 final presentation v4 `PROFILE_KEYS` omits `genX`;
- current presentation dictionaries omit `genX`;
- smoke/preview matrices assume four profiles;
- hidden-label acceptance does not include Gen X.

Gen X is therefore not a new generation-band invention. It is an unfinished first-class runtime profile.

## 4. Semantic-equivalence model

Every visible string must be authored from semantic intent first, not from another profile's wording.

Canonical workflow per row:

1. Define `TEXT_ID`.
2. Define invariant `SEMANTIC_INTENT`.
3. Define exact `CONTEXT`.
4. Assign `INTENSITY`.
5. Author five parallel Russian renderings:
   - BOOMER
   - GEN_X
   - MILLENNIAL
   - ZOOMER
   - ALPHA
6. Validate placeholders and factual meaning.
7. Validate generation authenticity.
8. User approves exact wording.
9. Only then Codex implements exact strings.

Codex must never infer a missing generation string from a neighboring profile.

## 5. Intensity ladder

### I0_CRITICAL
Use for:
- destructive / costly actions;
- accept / decline;
- attack / answer;
- report;
- rematch;
- insufficient-resource blockers;
- critical rules.

Rule:
- mechanic meaning must be instantly obvious;
- generational flavor is allowed but cannot obscure the action.

### I1_GUIDANCE
Use for:
- labels;
- headers;
- hints;
- placeholders;
- argument guidance;
- cooldown explanations;
- onboarding instructions.

Rule:
- strongly generational;
- still semantically unambiguous.

### I2_EXPRESSIVE
Use for:
- stat toasts;
- success/failure notifications;
- battle/vote outcomes;
- empty states;
- report results;
- warnings after a completed action.

Rule:
- maximum recognisable generational voice is encouraged;
- semantic facts and numbers remain exact.

### I3_FULL_FREEDOM
Use for:
- NPC reactions;
- ambient reactions;
- decorative copy;
- non-critical social flavor;
- emotional commentary.

Rule:
- full profile freedom;
- slang, memes, profanity, emoji grammar and cultural markers allowed when authentic;
- preserve NPC character so every NPC does not become the same meme account.

## 6. Profile character bibles

### BOOMER - "ПИЗДЕЦ БУМЕР"
Target:
- full, explicit, self-contained phrasing;
- recognisable older idioms and cultural formulas;
- pre-digital / early-digital mental model;
- literal labels;
- low dependence on anglicisms;
- restrained but recognisable humor;
- user should never need to decode a critical action.

Allowed directions:
- "Вот ведь неприятность"
- "Вот это номер"
- "Ну что ж, приступим"
- "Позвольте не согласиться"
- fuller consequence explanations where useful.

Avoid:
- corporate/legalese tone;
- cartoon-grandpa parody;
- moralizing;
- random Soviet nostalgia where irrelevant;
- fake archaic speech.

### GEN X - "ПИЗДЕЦ GEN X"
Target:
- dry sarcasm;
- concise reactions;
- late-Soviet / 90s / early-2000s colloquial rhythm;
- less explanation than Boomer;
- less internet self-reference than Millennial;
- low emoji dependence;
- independent voice, never a Boomer fallback or Millennial alias.

Allowed directions when semantically appropriate:
- "чувак"
- "облом"
- "отстой"
- "прикол"
- "ни фига"
- "разборка"
- "ответка"
- "погнали"
- "приват"

Avoid:
- forcing every line into 90s slang;
- teenager vocabulary from later eras;
- bureaucratic Boomer phrasing;
- Millennial meta-irony everywhere.

### MILLENNIAL - "ПИЗДЕЦ МИЛЛЕНИАЛ"
Target:
- irony and self-irony;
- early/mid-RuNet cultural memory;
- forums / ICQ / LiveJournal / early VK / gaming-era rhythm;
- adult digital fluency;
- longer reaction phrases than Zoomer;
- emotional meta-commentary without becoming verbose.

Allowed directions when natural:
- "жесть"
- "мда"
- "ну такое"
- "лол"
- "жиза"
- "печалька"
- "рукалицо"
- self-ironic explanatory punchlines.

Avoid:
- neutral default-service tone;
- pretending Millennial means "generic adult";
- excessive 2020s Zoomer slang;
- office/corporate product copy.

### ZOOMER - "ПИЗДЕЦ ЗУМЕР"
Target:
- fast, network-native, social-feed rhythm;
- slang/memes/emojis may function as syntax;
- direct emotional coding;
- shorter than Millennial;
- current borrowed vocabulary is allowed when semantically exact.

Allowed directions when natural:
- "кринж"
- "база"
- "жиза"
- "скип"
- "вайб"
- "имба"
- "рофл"
- "репа"
- "рематч"
- "cooked" forms only with correct meaning and grammar.

Critical rule:
Do not ban slang because it is slang. Ban only fake, stale, misused, random, or incomprehensible slang.

Avoid:
- marketing-department youth imitation;
- repeating one meme formula everywhere;
- using "cooked" with the wrong subject/meaning;
- translating every noun into English for style.

### ALPHA - "ПИЗДЕЦ АЛЬФА"
Target:
- even more compressed and visual than Zoomer;
- reaction-code language;
- brainrot-native references may be used where natural;
- stronger use of symbols, emoji, W/L, aura, NPC, sigma, rizz/skibidi-derived vocabulary;
- critical controls stay immediately understandable.

Allowed directions when natural:
- `W` / `L`
- `aura+` / `aura-`
- `NPC`
- `sigma`
- `rizz`
- `skibidi` derivatives
- visual shorthand.

Avoid:
- cryptic abbreviations that hide the mechanic;
- using brainrot references as random confetti;
- turning every NPC into the same Alpha persona;
- making Alpha merely "Zoomer but shorter".

## 7. Persistent UI requirement

Step 9 cannot hide differentiation only in rare messages.

A player should notice profile identity in ordinary persistent/common surfaces:
- start screen;
- chat placeholder and send action;
- DM header/input;
- battle/conflict panel title;
- event panel title;
- action labels;
- empty states;
- common stat toasts;
- common success/failure messages.

Critical controls may converge when clarity requires it, but the surrounding persistent chrome must still make the profile obvious.

## 8. Toast architecture

Preserve the useful architecture introduced by PR #258:
- one coalescing stat-toast owner;
- simultaneous/nearby stat changes merge into one toast;
- no stacked duplicate toast cards;
- no duplicate permanent top-bar stat icons inside the toast;
- target REP remains semantically distinct from player REP.

Step 9 changes only the wording rendered by that pipeline.

The same semantic stat change must receive five generation-specific renderings.

## 9. Initial semantic matrix

The machine-readable candidate matrix lives in:
`stage6_step9_ru_semantic_matrix_draft.json`

Status of all rows in that file:
`DRAFT_FOR_USER_APPROVAL`

They are not implementation authority yet.

The first matrix intentionally covers high-frequency surfaces first:
- persistent chrome;
- critical conflict actions;
- argument labels;
- money/REP/influence toasts;
- battle outcomes;
- vote outcomes;
- empty states;
- report/cop results;
- cooldowns;
- onboarding;
- generic reaction archetypes for NPC/flavor expansion.

## 10. Diversity rule

Do not map one generation to one catchphrase.

Required:
- vary calm / bright / maximum-intensity phrasing;
- preserve NPC character;
- preserve context polarity;
- avoid repeating one meme/slang word more than the context naturally supports;
- distinguish "this is bad", "I disagree", "I am surprised", "I understand", "we lost", "you made a mistake", and "the mechanic is unavailable".

A profile fails if it feels like search-and-replace slang.

## 11. Slang semantic validation

Every slang or borrowed expression must be checked for:
- exact meaning;
- positive/negative polarity;
- grammar;
- currentness;
- naturalness in Russian-speaking use;
- subject/object relation.

Example principle from Step 9:
- "bro cooked" = bro performed strongly;
- "bro is cooked" = bro is finished/doomed;
- "bro got cooked" = bro was destroyed/defeated.

No literal token substitution is allowed.

## 12. Hidden-label acceptance

Final acceptance test:

1. Hide generation labels.
2. Play/read common UI for several minutes.
3. The reviewer identifies each profile from wording alone.

FAIL if:
- Boomer can be confused with Millennial;
- Gen X can be confused with Boomer or Millennial;
- Millennial feels like neutral default UI;
- Zoomer feels like generic modern UI;
- Alpha feels like merely abbreviated Zoomer;
- generation language blocks understanding of the mechanic.

Automated smoke can support this, but cannot replace user visual acceptance.

## 13. Codex implementation boundary

Codex implementation starts only after rows are explicitly approved/frozen.

Codex MUST:
- replace strings exactly as approved;
- preserve placeholders exactly;
- preserve semantic intent exactly;
- add Gen X as a first-class profile in all required routing layers;
- update mirrors deterministically;
- add deterministic tests/smokes for five-profile coverage;
- preserve the unified toast architecture.

Codex MUST NOT:
- invent missing copy;
- soften or sanitize approved slang/profanity;
- "improve" grammar stylistically beyond exact approved copy;
- translate;
- shorten;
- substitute synonyms;
- change mechanics or state;
- silently fall back Gen X to another profile.

If a mapping is missing, Codex leaves current text unchanged and reports the gap.

## 14. Implementation gap checklist for Gen X

Minimum technical surfaces to inspect/fix later:
- `UI_PROFILE_REGISTRY.supported`
- `UI_PROFILE_RULES.yearBands` verification only; band already exists
- `UI_PROFILE_CANONICAL_MAP`
- `setUiProfile` / `getUiProfile`
- `resolveUiTextMode`
- `resolveUiTextProfileName`
- `START_SCREEN_PROFILE_TEXTS`
- `Data.TEXTS`
- system profile dictionaries/resolvers
- current Stage 6 presentation `PROFILE_KEYS`
- control copy dictionaries
- toast formatting dictionaries
- UI preview/smoke matrices
- profile-selection tests
- persistence/reload regression
- docs mirrors.

## 15. Foundation completion criteria

This foundation task is complete when:
- five-profile authority is documented;
- Gen X gap is documented;
- machine-readable draft matrix exists;
- Codex implementation contract exists;
- no runtime/game code is changed;
- user can review and edit copy before freeze.

Stage 6 itself remains NOT COMPLETE.
