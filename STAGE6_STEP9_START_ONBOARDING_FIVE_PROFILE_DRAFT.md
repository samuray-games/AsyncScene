# STAGE 6 STEP 9 - START / ONBOARDING FIVE-PROFILE DRAFT

STATUS: DRAFT_FOR_USER_APPROVAL

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

## 1. Goal

The first screen must already reveal the generation profile.

Historical failure:

- Alpha inherited Zoomer start copy;
- Zoomer and Alpha both used `Две цифры вайба`, `Погнали`, `по вайбу я родился в …`;
- Gen X had no first-class start copy;
- Millennial was mostly neutral/default;
- Boomer was mainly a longer explanatory version.

Step 9 target:

> Hide the profile label and the start screen should already feel culturally different across all five profiles while conveying identical setup rules.

## 2. Canonical semantic facts that must not drift

The copy may change, but these meanings are invariant:

1. user enters the last two digits of birth year;
2. the value is used only to select/configure UI style;
3. it is not stored as the birth year itself;
4. profile can be changed later;
5. optional feeling-year/fantasy-year field represents self-perceived age/year identity;
6. opponent determines risk;
7. selected stake spends the game currency/resource;
8. result is shown immediately;
9. user may open rules or start/continue.

## 3. Five-profile matrix

| TEXT_ID | SEMANTIC_INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| start.title | Game title | I0_CRITICAL | AsyncScene | AsyncScene | AsyncScene | AsyncScene | AsyncScene |
| start.birth_digits_label | Enter last 2 birth-year digits | I0_CRITICAL | Последние две цифры года рождения | Две последние цифры года | Последние 2 цифры года рождения | Последние 2 цифры года | 2 цифры года |
| start.profile_helper | Year only configures UI style, is not stored, can change later | I1_GUIDANCE | Год нужен только для настройки интерфейса. Сам год не сохраняется, а стиль можно изменить позже. | Это только настройка интерфейса. Год не сохраняем, потом можно сменить. | Только для интерфейса. Год не сохраняем. Профиль потом можно поменять, без драмы. | Это чисто стиль UI. Год не сохраняем, потом сменишь. | style only. year not saved. сменить можно. |
| start.fantasy_birth_label | Optional year user feels like | I1_GUIDANCE | А по ощущениям вы родились в… | А по ощущениям - какой год? | А по ощущениям я вообще из… | а по вайбу я из… | vibe year |
| start.continue | Continue setup | I0_CRITICAL | Продолжить | Дальше | Поехали дальше | Погнали | go |
| start.start | Enter/start game | I0_CRITICAL | Начать игру | Поехали | Старт | Влететь | start |
| start.reset | Reset selected start/profile setup | I0_CRITICAL | Сбросить выбор | Сбросить | Сбросить выбор | Сброс | reset |
| start.rules | Open rules | I0_CRITICAL | Правила игры | Как тут всё устроено | Правила | Как играть | rules |
| start.intro_risk | Opponent determines risk level | I1_GUIDANCE | Уровень риска зависит от соперника. | Соперник задаёт риск. | Соперник задаёт риск. То есть да, чужие решения снова влияют на твою жизнь. | Опп задаёт риск. | opp = risk |
| start.intro_stake | Stake spends money/resource | I1_GUIDANCE | Выбранная ставка списывается из вашего запаса 💰. | Ставка уйдёт из твоих 💰. | Ставка списывает 💰. Бюджет осведомлён и недоволен. | Ставка = −💰. | bet -> −💰 |
| start.intro_result | Result appears immediately | I1_GUIDANCE | Результат показывается сразу. | Итог увидишь сразу. | Итог виден сразу. Никаких «ответим в течение 30 дней». | Итог сразу. | result now |
| start.economy_honesty | Price and result are shown transparently/immediately | I1_GUIDANCE | Стоимость действия и результат всегда показываются сразу. | Цена и итог сразу. Без сюрпризов. | Цена и итог сразу. Мелкий шрифт сегодня отдыхает. | Цена + итог сразу. без скрытых приколов. | cost + result = shown |

## 4. Arrow/accessibility labels

These are accessibility/functional I0 labels and should favour clarity over generation cosplay.

Recommended shared or near-shared copy:

| TEXT_ID | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|
| digit_up_first | Увеличить первую цифру | Первая цифра вверх | Увеличить первую цифру | Первая цифра + | digit 1 + |
| digit_down_first | Уменьшить первую цифру | Первая цифра вниз | Уменьшить первую цифру | Первая цифра − | digit 1 − |
| digit_up_second | Увеличить вторую цифру | Вторая цифра вверх | Увеличить вторую цифру | Вторая цифра + | digit 2 + |
| digit_down_second | Уменьшить вторую цифру | Вторая цифра вниз | Уменьшить вторую цифру | Вторая цифра − | digit 2 − |

Review requirement:

- these labels may be ARIA/accessibility surfaces;
- final implementation must preserve screen-reader clarity;
- if abbreviated Alpha/Zoomer labels reduce accessibility, keep clearer shared labels intentionally.

## 5. Profile-by-profile first-impression target

### Boomer

Should feel:

- trustworthy;
- explicit;
- no hidden catches;
- normal complete Russian;
- slightly older conversational rhythm.

Should not feel:

- government portal;
- legal terms page;
- patronising senior mode.

### Gen X

Should feel:

- quick;
- practical;
- dry;
- no bullshit;
- slightly old-school colloquial.

Signature start rhythm:

- `Дальше`
- `Поехали`
- `Как тут всё устроено`
- `Цена и итог сразу. Без сюрпризов.`

### Millennial

Should feel:

- familiar digital product;
- self-aware;
- lightly ironic;
- first-person internet-era humour.

Signature start rhythm:

- neutral functional buttons;
- expressive helper/intro lines carry personality;
- humour about bureaucracy, budgets, digital life without repeating one gimmick.

### Zoomer

Should feel:

- fast;
- current;
- chat-native;
- no lecture;
- slang only where semantically natural.

Candidate signature:

- `Погнали`
- `Влететь`
- `Опп задаёт риск.`
- `Ставка = −💰.`

Review note:

`опп` is a plausible opponent shorthand but must be tested for Russian audience comprehension before freeze. I1 can be strong, but not opaque.

### Alpha

Should feel:

- visually compressed;
- code-like;
- faster than Zoomer;
- no duplicated Zoomer phrases.

Candidate signature:

- `go`
- `start`
- `opp = risk`
- `bet -> −💰`
- `result now`

Review note:

Russian-first does not require every token to be Cyrillic, but the final hidden-label test must verify that intended Russian-speaking Alpha users understand the core setup without a glossary.

## 6. Why `Две цифры вайба` should not survive automatically

The old Zoomer/Alpha shared label `Две цифры вайба` is catchy but semantically imprecise for an I0 field that actually asks for the last two digits of birth year.

Step 9 does not mean sacrificing meaning for flavour.

Recommended direction:

- keep the field label mechanically clear;
- put stronger generational flavour into the helper and optional feeling-year label.

This is the intensity ladder in practice.

## 7. Hidden-label start test

Prepare five screenshots/text dumps of the start screen without profile names.

PASS if:

- all five communicate the same setup facts;
- users can identify generation lanes from the overall language pattern;
- Gen X is not confused with Millennial/Boomer;
- Alpha is not just Zoomer shortened;
- no I0 field/button becomes ambiguous;
- year privacy/non-storage meaning remains exact.

## 8. Freeze gate

Before Codex implementation:

- verify exact source keys and placeholders from fresh current-main inventory;
- approve every row;
- decide which accessibility strings are intentionally shared;
- freeze exact strings and hash;
- Codex implements exact approved mapping only.

NEXT_ACTION: review this start/onboarding pack together with the global semantic matrix, then include approved strings in the five-profile frozen package.