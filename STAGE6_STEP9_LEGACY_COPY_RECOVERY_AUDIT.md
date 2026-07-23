# STAGE 6 STEP 9 - LEGACY COPY RECOVERY AUDIT

STATUS: FOUNDATION_EVIDENCE / NOT_IMPLEMENTATION_AUTHORITY

BASELINE_MAIN_FOR_CURRENT_WORK: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

SEED_INVENTORY_SNAPSHOT: `e94e4bcb888f4a1e54b2879e3a810118e53a62d9` (2026-07-03)

> This audit uses the uploaded full-text inventory as historical/seed evidence only. The seed is older than current main and must not be mistaken for current runtime authority. Its purpose is to explain structural tone failure patterns and identify reusable/rejectable copy before a fresh current-main inventory rebuild.

## 1. Why this audit exists

Stage 6 Step 9 was introduced because an earlier cautious profile adaptation produced profiles that were technically different but not culturally unmistakable.

The user requirement is stronger:

- Boomer must feel unmistakably Boomer.
- Gen X must feel unmistakably Gen X.
- Millennial must feel unmistakably Millennial.
- Zoomer must feel unmistakably Zoomer.
- Alpha must feel unmistakably Alpha.

A hidden-label reader should identify the generation from ordinary gameplay copy alone.

This audit asks a simple question:

> Did the older text architecture actually create separate generation voices, or did it mostly create inherited pairs?

## 2. Seed inventory facts

Uploaded seed package summary:

- active records: `1930`
- authoritative/resolved current-main-at-snapshot records: `1731`
- tracked-baseline fallback records: `199`
- unique active rendered/source texts: `853`
- dynamic template rows: `306`

Profile rows:

- alpha: `340`
- boomer: `346`
- default: `67`
- genz: `104`
- millennial: `278`
- shared: `518`
- zoomer: `277`
- Gen X: `0` first-class profile rows

Inheritance in the seed:

- direct/non-inherited: `1214`
- inherited from millennial: `280`
- inherited from genz: `130`
- inherited from zoomer: `127`
- inherited from alpha: `114`
- inherited from genz + boomer overrides: `65`

Inheritance is not automatically wrong. It becomes a Step 9 failure when inheritance substitutes for a deliberate generation-specific creative decision on a player-facing surface.

## 3. Core four-profile collision result

The seed contains `57` resolved core `Data.TEXTS` semantic keys with values present for all four historical player profiles: Boomer, Millennial, Zoomer, Alpha.

Distinct-text count across those 57 keys:

- 4 distinct generations: `0`
- 3 distinct values: `37`
- 2 distinct values: `18`
- 1 shared value: `2`

Most important pair collision:

- `Zoomer == Alpha`: **57 / 57 keys**
- `Boomer == Millennial`: **19 / 57 keys**

This is direct evidence that the older core profile layer did not contain four independently authored voices. Alpha was effectively a full textual alias of Zoomer across this core resolved key set.

That exactly matches the user's later visual diagnosis that Zoomer and Alpha did not feel meaningfully different.

## 4. Representative collapsed rows

Examples from the seed where the old four-profile system collapsed into only two voice lanes:

| semantic key | Boomer | Millennial | Zoomer | Alpha |
|---|---|---|---|---|
| `battle_action_accept` | Принять | Принять | Вписаться | Вписаться |
| `battle_action_attack` | Атаковать | Атаковать | Влететь | Влететь |
| `battle_action_rematch` | Реванш | Реванш | Ещё раунд | Ещё раунд |
| `battle_invite_title` | Вызов | Вызов | Залёт | Залёт |
| `events_header` | События | События | Движ | Движ |
| `goal_label` | Цель | Цель | Задача | Задача |
| `vote_ok` | Голос учтён. | Голос учтён. | ✓ ОК | ✓ ОК |
| `conflict_finished` | Конфликт завершён. | Конфликт завершён. | Конфликт закрыт. | Конфликт закрыт. |

This is not enough for Step 9 even when every individual phrase is understandable.

## 5. Useful legacy material worth recovering

The older corpus contains strong generation-flavoured fragments that should be reviewed rather than automatically erased.

Potentially useful Zoomer/younger-lane material, context-dependent:

- `Кошелёк в нуле 💀`
- `Лут прилетел.`
- `Репа просела.`
- `Скипнуть`
- `Вписаться`
- `Залёт`
- `Движ`
- `Влететь`

These are not automatically approved. They should be tested for:

1. semantic correctness in context;
2. actual Russian usage by the intended generation;
3. freshness;
4. repetition density;
5. hidden-label distinctiveness;
6. whether the same marker belongs to Zoomer, Alpha, Gen X, or none.

The correct Step 9 rule is not to delete slang. It is to reject false, misused, stale, or randomly scattered slang.

## 6. Legacy material that demonstrates the old failure mode

### 6.1 Alpha as Zoomer alias

Seed examples:

- Zoomer `Вписаться` / Alpha `Вписаться`
- Zoomer `Влететь` / Alpha `Влететь`
- Zoomer `Скипнуть` / Alpha `Скипнуть`
- Zoomer `Движ` / Alpha `Движ`
- Zoomer `НЕТ ТАКОГО` / Alpha `НЕТ ТАКОГО`
- Zoomer `ТОЛПА` / Alpha `ТОЛПА`
- Zoomer `✓ ОК` / Alpha `✓ ОК`

Step 9 correction:

Alpha must be authored as its own semantic compression and culture lane, not produced by inheriting Zoomer and uppercasing/shortening it.

### 6.2 Millennial as neutral/default

Many seed Millennial rows are plain product-copy defaults:

- `Принять`
- `Атаковать`
- `Реванш`
- `События`
- `Пока пусто.`
- `Недоступно.`
- `Победа`
- `Поражение`

These may remain valid for I0 critical controls where clarity dominates, but Step 9 requires ordinary gameplay around them to carry unmistakable Millennial voice. Millennial cannot be the silent baseline against which only younger/older profiles are stylised.

### 6.3 Boomer as slightly longer Millennial

Several Boomer rows differ only by politeness or verbosity:

- `Ответьте: кто?` vs Millennial `Ответь: кто?`
- `Введите точное имя игрока.` vs `Введи точный ник.`
- `Действие недоступно.` vs `Недоступно.`

Clarity is useful, but this alone does not create a recognisable Boomer world. Step 9 needs stronger cultural rhythm, vocabulary, system reactions and NPC voice while avoiding bureaucratic parody.

### 6.4 Missing Gen X lane

The seed has no first-class Gen X profile corpus.

Current runtime does contain partial generation plumbing (`1965-1980 -> genX`, canonical normalisation), but support falls through before full text routing.

Step 9 must create Gen X as a real voice, not insert it later as a fallback alias.

## 7. Recovery classifications

Every legacy phrase considered for Step 9 should receive one of these statuses:

- `RECOVER_AS_IS_CANDIDATE` - already strong, authentic and semantically correct; still needs user approval.
- `RECOVER_REWRITE_CANDIDATE` - useful idea/voice marker but wording needs revision.
- `REASSIGN_GENERATION_CANDIDATE` - phrase may be authentic but belongs to another generation lane.
- `REJECT_FAKE_OR_MISUSED` - forced, semantically wrong, stale, or marketer-slang.
- `REJECT_TOO_NEUTRAL_FOR_INTENSITY` - valid meaning but fails Step 9 distinctiveness on I2/I3 surfaces.
- `KEEP_SHARED_INTENTIONALLY` - identical copy is correct because the surface is I0 and differentiation would hurt comprehension.
- `MECHANIC_CANON_LOCKED` - wording or tokens cannot drift because they encode canonical mechanics/placeholders.

## 8. Priority collision hotspots for the new five-profile matrix

Highest priority because they are persistent or frequently seen:

1. start-screen labels and helper copy;
2. chat placeholder/send;
3. DM header/placeholder/send/actions;
4. events/battles/menu headers;
5. conflict labels and action buttons;
6. vote/tie UI;
7. economy/REP/influence toasts;
8. empty states;
9. report/cop flow;
10. conflict result language;
11. NPC reaction families;
12. argument presentation and teaching flow.

If these surfaces remain neutral, no amount of rare flavour text can pass the hidden-label test.

## 9. Quantitative acceptance target for copy freeze

Before Codex implementation is authorized:

- exactly 5 first-class player profiles must exist in the approval package;
- every player-facing semantic row must have an explicit five-profile decision or an explicit `KEEP_SHARED_INTENTIONALLY` decision;
- no row may rely on accidental fallback to satisfy a missing generation decision;
- every I2/I3 row should be reviewed for strong hidden-label distinctiveness;
- Alpha and Zoomer must not be identical across an entire semantic family;
- Boomer and Millennial must not collapse into a simple `вы/ты` or long/short transformation;
- Gen X must pass independent separation from both adjacent older and younger profiles.

## 10. Current conclusion

The older corpus is useful raw material but not final authority.

The important forensic conclusion is structural:

> The old profile system largely encoded inheritance pairs rather than five independently authored generation voices.

Step 9 therefore requires semantic re-authoring, not another global search-and-replace pass.

NEXT_ACTION: expand the Russian semantic matrix from high-frequency rows toward complete current-main inventory coverage, then run user + ChatGPT creative review before any Codex runtime implementation.