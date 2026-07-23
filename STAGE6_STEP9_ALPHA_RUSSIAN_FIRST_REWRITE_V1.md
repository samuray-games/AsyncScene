# STAGE 6 STEP 9 - ALPHA RUSSIAN-FIRST REWRITE V1

STATUS: `STEP1_REWRITE_PASS_COMPLETE / DRAFT_FOR_USER_REVIEW / NOT_FROZEN`

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

SUPERSEDES_FOR_ALPHA_COPY:

- `STAGE6_STEP9_RU_SEMANTIC_MATRIX_DRAFT.md`
- `STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH2_DRAFT.md`
- `STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH3_SYSTEM_EVENTS_DRAFT.md`
- `STAGE6_STEP9_RU_SEMANTIC_MATRIX_BATCH4_CONFLICT_ECONOMY_DRAFT.md`
- `STAGE6_STEP9_START_ONBOARDING_FIVE_PROFILE_DRAFT.md`
- Alpha pools in `STAGE6_STEP9_NPC_FIVE_PROFILE_VOICE_PACK_DRAFT.md`
- conflicting English-first examples in `STAGE6_STEP9_FIVE_PROFILE_RU_VOICE_BIBLES_DRAFT.md`

This file is the current Alpha-column rewrite overlay for Step 9 creative review. It does not authorize Codex implementation and is not frozen copy.

## 1. Rewrite rule

`RU_ALPHA` is Russian-first.

The profile must feel like a very young Russian-speaking, hyper-networked, brainrot-native interface.

It may use:

- `W / L`;
- `NPC`;
- `аура`;
- `cooked`;
- `mid`;
- `skill issue` only in competence/mockery contexts;
- Russianized gamer/internet borrowings such as `репорт`, `ивент`, `реролл`, `буст`, `КД`, `ап`, `скип` where natural;
- symbols, emoji, compressed grammar and code-like layout.

It must not become an English localization.

### Density target

- `I0_CRITICAL`: Russian and immediately understandable.
- `I1_GUIDANCE`: Russian syntax, compressed.
- `I2_EXPRESSIVE`: Russian base plus selective borrowed/code markers.
- `I3_FULL_FREEDOM`: heavier meme/code language allowed, but Russian-speaking cultural logic remains dominant.

## 2. Batch 1 - corrected Alpha column

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| start.continue | `Го` |
| start.rules | `Правила` |
| chat.placeholder | `чат...` |
| chat.send | `Отправить` |
| dm.header | `Личка` |
| dm.placeholder | `в личку...` |
| dm.send | `Отправить` |
| panel.battles | `Бои` |
| panel.events | `Ивенты` |
| battle.attack_badge | `Ход` |
| battle.defense_badge | `Ответ` |
| battle.opponent_argument | `Ход соперника` |
| battle.my_answer | `Мой ответ` |
| battle.accept | `В бой` |
| battle.decline | `Нет` |
| battle.attack_action | `Ход` |
| battle.rematch | `Ещё` |
| battle.report | `Репорт` |
| economy.not_enough_money | `0 денег 💀` |
| economy.not_enough_rep | `⭐ мало` |
| toast.money_gain | `+{X}💰 W` |
| toast.money_loss | `−{X}💰 L` |
| toast.rep_gain | `+{X}⭐ · аура ↑` |
| toast.rep_loss | `−{X}⭐ · аура ↓` |
| toast.influence_gain | `+{X}⚡ W` |
| toast.combined_respect | `−1💰 / цели +1⭐` |
| result.win | `W` |
| result.loss | `L 💀` |
| result.draw | `ничья =` |
| vote.majority | `большинство W` |
| vote.minority | `в меньшинстве 💀` |
| conflict.finished | `всё, gg` |
| reaction.bad | `💀` |
| reaction.surprised | `бро чё 💀` |
| reaction.agree | `W` |
| reaction.disagree | `L тейк` |
| reaction.relatable | `real` |
| reaction.wait | `стоп` |
| reaction.start | `го` |
| reaction.weird | `NPC момент` |
| reaction.disaster | `аура −1000` |
| empty.dm | `личка 0` |
| empty.events | `ивентов 0` |
| empty.battles | `боёв 0` |
| cop.accept | `репорт ✓ · чекаю` |
| cop.false_report | `репорт мимо L` |
| cooldown.wait | `КД` |
| onboarding.profile_helper | `только стиль. год не сохраняем.` |

### Notes

- `real` remains a deliberate imported reaction token at I3, not a general English fallback.
- `аура` is expressive framing only; canonical REP remains represented by `⭐` and must not be mechanically renamed.
- `gg` is allowed as a familiar gaming marker in an expressive result line, not as a critical action.

## 3. Batch 2 - corrected Alpha column

### Persistent/events

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| menu.return_start | `на старт` |
| menu.unavailable | `пока нельзя` |
| events.close_extra | `свернуть` |
| events.clear | `очистить` |
| events.clear_all | `очистить всё` |
| events.done | `готово` |
| events.left | `⏳{sec}` |
| events.title_count | `ивенты {count}` |
| events.panel_hint | `тут важное` |
| goal.label | `цель` |

### Invite/guidance/training

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| invite.open_hint | `точный ник` |
| invite.invalid | `ник мимо` |
| hint.type_who | `кто` |
| hint.type_where | `где` |
| hint.type_about | `про кого` |
| hint.type_yn | `да/нет` |
| training.sent_chat | `{teacher} → {student}: +аргумент` |
| training.sent_dm | `{arg} / −{cost}💰` |

### Conflict access/result

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| battle.energy_locked | `нужно ⚡{energy}` |
| battle.not_enough_points | `нет 💰` |
| conflict.win | `W` |
| conflict.loss | `L 💀` |
| conflict.draw | `ничья gg` |

### Vote

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| vote.tie_start | `чат голосует` |
| vote.call_to_action | `голосуй` |
| vote.click_name_hint | `тапни имя` |
| vote.timer | `⏳{sec}` |
| vote.ok | `✓` |
| vote.already | `уже ✓` |
| vote.fail | `не прошло ✕` |
| vote.end_winner | `W {name} · {aVotes}:{bVotes}` |
| vote.end_draw | `ничья · {aVotes}:{bVotes}` |
| vote.chat_start | `чат, голосуем` |
| vote.chat_end_winner | `чат выбрал {name} W` |
| vote.chat_end_draw | `чат: ничья` |

### Economy/system state

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| economy.purchase_success | `куплено / −💰` |
| economy.sale_success | `продано W` |
| economy.reward_received | `награда W` |
| economy.penalty_received | `штраф L` |
| economy.generic_error | `баг 💀` |
| economy.generic_success | `готово ✓` |
| economy.money_received | `+💰 W` |
| economy.money_spent | `−💰` |
| economy.balance_up | `баланс ↑` |
| economy.balance_down | `баланс ↓` |
| economy.poverty | `денег почти 0 💀` |
| economy.rich | `денег норм W` |
| economy.bankrupt | `денег 0 💀` |
| economy.income_event | `+деньги W` |
| economy.expense_event | `−деньги` |
| economy.neutral | `деньги =` |

### Reputation/social

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| rep.high | `репутация ↑` |
| rep.low | `репутация ↓` |
| rep.recovered | `репутация вернулась` |
| rep.damaged | `репутация −` |
| respect.gained | `респект ↑` |
| respect.lost | `респект ↓` |

Canonical stat naming stays Russian/visible. `аура` remains optional expressive reaction vocabulary, not the literal stat label.

### Cop/report

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| cop.busy | `коп занят · КД` |
| cop.cooldown | `проверка на КД` |
| cop.report_ok | `репорт W` |
| cop.report_fail | `репорт мимо L` |
| report.cooldown_hint | `репорт КД` |
| report.target_missing | `ник мимо` |

### I3 reactions

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| reaction.good | `W` |
| reaction.embarrassed | `аура −100` |
| reaction.confused | `бро чё` |
| reaction.refuse | `не` |
| reaction.support | `W тейк` |
| reaction.warning | `бро не надо 💀` |
| reaction.challenge | `го 1v1` |
| reaction.victory_gloat | `изи W` |
| reaction.loss_accept | `ок, меня cooked` |
| reaction.bored | `zzz` |

## 4. Batch 3 - corrected Alpha system/feed column

### Presence/movement/DM

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| event.ready | `готово ✓` |
| event.joined | `{name} в игре.` |
| event.moved | `→ {location}` |
| event.dm_reaction | `{name} → {target}: реакция` |
| event.dm_invite | `{name} + {guest} → {target}` |

### Battle lifecycle

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| event.battle_challenge | `{attackerName} ⚡{attackerInf}: 1v1` |
| event.npc_battle_start | `{a} vs {b} · го` |
| event.battle_win | `W {winner} / L {loser}` |
| event.battle_draw | `{a} = {b} · ничья` |
| event.battle_result | `{oppName} → {text}` |

`vs`, `W/L` are compact gaming markers inside a Russian-first event grammar, not an English UI fallback.

### Robbery/shame

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| event.toxic_steal_line | `токсик −{cost}💰` |
| event.toxic_robbed | `токсик забрал 💰 L` |
| event.bandit_robbed | `бандит забрал 💰` |
| event.mafia_shame | `{meName} vs мафия / ⚡0 L` |

### Crowd/vote feed

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| event.crowd_start | `чат голосует` |
| event.crowd_resolved | `W {name} · {aVotes}:{bVotes}` |

### Unlocks

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| unlock.orange | `🟠 открыто` |
| unlock.red | `🔴 открыто` |
| unlock.black | `⚫ макс открыт` |
| unlock.orange_other | `{name}: 🟠 ап` |
| unlock.red_other | `{name}: 🔴 ап` |
| unlock.black_other | `{name}: ⚫ макс` |

### Role-labelled outcomes

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| npc.victory.cop | `коп: W {winner}` |
| npc.victory.mafia | `мафия: W {winner}` |
| npc.victory.bandit | `бандит: W {winner}` |
| npc.victory.toxic | `токсик: W {winner}` |
| npc.victory.crowd | `чат: W {winner}` |
| npc.defeat.cop | `коп: L {loser}` |
| npc.defeat.mafia | `мафия: L {loser}` |
| npc.defeat.bandit | `бандит: L {loser}` |
| npc.defeat.toxic | `токсик: L {loser}` |
| npc.defeat.crowd | `чат: L {loser}` |

### System wrappers

| wrapper intent | NEW RU_ALPHA |
|---|---|
| blocked_with_hint | `не вышло: {what}. {hint}` |
| unavailable_with_hint | `пока нельзя: {what}. {hint}` |
| wait_option | `{what}. КД.` |

`npcArrest*` and `P2P: анти-абуз.` remain blocked for source/visibility confirmation and therefore are intentionally not creatively rewritten in this pass.

## 5. Batch 4 - corrected Alpha conflict/economy column

### Rematch

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| rematch.action | `Ещё` |
| rematch.action_with_cost | `Ещё −{cost}💰` |
| rematch.offered | `ещё?` |
| rematch.accepted | `ещё раунд W` |
| rematch.declined | `не, скип` |
| rematch.not_enough_money | `на ещё нет 💰` |
| rematch.cost_paid | `ещё раунд −{cost}💰` |

### Generic/tactical costs

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| cost.confirm_generic | `−{cost}💰?` |
| cost.not_enough_generic | `нужно {cost}💰` |
| cost.charged_generic | `−{cost}💰` |
| battle.boost_action | `Буст −{cost}💰` |
| battle.boost_success | `буст ✓` |
| battle.boost_blocked | `буст пока нельзя` |
| argument.reroll_action | `Реролл −{cost}💰` |
| argument.reroll_success | `новый ролл 🎲` |
| argument.reroll_not_enough | `на реролл нет 💰` |
| hint.weakness_action | `Хинт −{cost}💰` |
| hint.weakness_received | `хинт ✓` |
| hint.weakness_not_enough | `на хинт нет 💰` |

### Vote/crowd tactical actions

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| crowd.extra_vote_action | `+1 голос −{cost}💰` |
| crowd.extra_vote_success | `+1 голос ✓` |
| crowd.extra_vote_blocked | `+1 голос пока нельзя` |
| vote.shield_action | `Щит голоса −{cost}💰` |
| vote.shield_success | `щит ✓` |
| vote.shield_blocked | `щит пока нельзя` |

### Conflict intervention / forced event

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| conflict.intervene_action | `Вмешаться −{cost}💰` |
| conflict.intervene_success | `влез в конфликт` |
| conflict.intervene_blocked | `сейчас нельзя` |
| npc.force_event_action | `Форснуть ивент −{cost}💰` |
| npc.force_event_success | `ивент форснут` |
| npc.force_event_blocked | `ивент пока нельзя` |

### Dismiss/respect

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| dismiss.action | `Нет` |
| dismiss.action_with_rep_cost | `Нет −{rep}⭐` |
| dismiss.result | `контакт скип` |
| dismiss.rep_loss | `−{rep}⭐` |
| respect.action | `Респект −{cost}💰` |
| respect.combined_toast | `−{cost}💰 / {target} +{rep}⭐` |

### Reports/voting economy

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| report.true_result | `репорт W +{rep}⭐` |
| report.false_result | `репорт мимо L −{rep}⭐` |
| report.false_repeat | `опять мимо 💀 −{rep}⭐` |
| vote.participation_toast | `голос −{points}💰 +{rep}⭐` |
| vote.majority_econ | `большинство W +{points}💰 +{rep}⭐` |
| vote.minority_econ | `меньшинство L −{rep}⭐` |
| crowd.support_rep | `чат за тебя W +{rep}⭐` |

## 6. Start/onboarding - corrected Alpha

| TEXT_ID | NEW RU_ALPHA |
|---|---|
| start.title | `AsyncScene` |
| start.birth_digits_label | `2 цифры года` |
| start.profile_helper | `только стиль. год не сохраняем. сменить можно.` |
| start.fantasy_birth_label | `по вайбу я из...` |
| start.continue | `Го` |
| start.start | `В игру` |
| start.reset | `Сброс` |
| start.rules | `Правила` |
| start.intro_risk | `соперник = риск` |
| start.intro_stake | `ставка = −💰` |
| start.intro_result | `итог сразу` |
| start.economy_honesty | `цена + итог сразу` |
| digit_up_first | `Первая цифра +` |
| digit_down_first | `Первая цифра −` |
| digit_up_second | `Вторая цифра +` |
| digit_down_second | `Вторая цифра −` |

### Start signature after rewrite

- `Го`
- `В игру`
- `Правила`
- `соперник = риск`
- `ставка = −💰`
- `итог сразу`

This is compressed/code-like without becoming English-first.

## 7. NPC Alpha pools - rewritten Russian-first

These pools supersede the English-heavy Alpha candidate pools in `STAGE6_STEP9_NPC_FIVE_PROFILE_VOICE_PACK_DRAFT.md`.

### Bandit

1. `гони 💰.`
2. `кошелёк сюда 💀`
3. `без мувов.`
4. `плати.`
5. `банк сюда.`
6. `скип слова. гони 💰.`
7. `не тяни.`
8. `💰 или L.`
9. `бро, плати.`
10. `⏳ гони 💰.`

Rejected and removed:

- `fanum tax 💰` - wrong semantics for generic money robbery;
- `aura tax` - fake/misused generic robbery slang;
- broad English `pay up / bank now / no moves` pattern.

### Toxic

1. `L тейк.`
2. `NPC тейк 💀`
3. `аура −1000.`
4. `бро, ты слил.`
5. `0 аргументов.`
6. `cooked.`
7. `skill issue 💀`
8. `mid.`
9. `бро, yapping.`
10. `L, дальше.`

Notes:

- `skill issue` is valid here because the role is explicitly mocking competence/performance.
- `ratio` removed: not needed as a foreign-platform culture marker for the Russian-first target.

### Cop

1. `репорт ✓`
2. `конфликт вижу.`
3. `держи дистанцию.`
4. `не разгоняй.`
5. `чекаю.`
6. `принято ✓`
7. `жди итог.`
8. `навожу порядок.`
9. `сам не лезь.`
10. `чекаю логи.`

### Crowd

1. `💀💀💀`
2. `БРО ЧЁ`
3. `чат проснулся.`
4. `лор дроп.`
5. `аура ивент.`
6. `НЕЕЕ 💀`
7. `NPC момент.`
8. `ивент W.`
9. `это кино.`
10. `пик 💀`

I3 allows strong code/meme density, but the phrases remain situated inside Russian-speaking chat culture rather than copied English caption syntax.

### Mafia

1. `тише.`
2. `без шума.`
3. `0 следов.`
4. `в личку.`
5. `без свидетелей.`
6. `следи за словами.`
7. `долг сохранён.`
8. `подумай.`
9. `не в чат.`
10. `договор ✓`

## 8. Global replacements/removals from the old Alpha drafts

The following broad English-first patterns are no longer valid Alpha defaults:

| OLD PATTERN | REWRITE RULE |
|---|---|
| `start` | `В игру` / `Го` by exact intent |
| `rules` | `Правила` |
| `checking` | `чекаю` |
| `joined` | `в игре` |
| `move >` | `→` |
| `report` | `репорт` |
| `event forced` | `ивент форснут` |
| `vote shield ON` | `щит ✓` |
| `boost on` | `буст ✓` |
| `hint unlocked` | `хинт ✓` |
| `join locked` | `сейчас нельзя` |
| `no target` | `ник мимо` |
| `cop busy` | `коп занят · КД` |
| `check cd` | `проверка на КД` |
| `money W/L` | Russian noun/symbol form such as `баланс ↑/↓` |
| `aura low/restored` as literal REP status | Russian canonical `репутация ...`; `аура` only expressive layer |
| `pay up / no moves / bank now` | Russian-first bandit lines |
| `quiet / no noise / no witnesses` | Russian-first mafia lines |

## 9. Russian cultural authenticity gate for Alpha

Every Alpha line must now pass both:

1. `ALPHA_RUSSIAN_FIRST`
2. `RU_CULTURAL_AUTHENTICITY`

PASS questions:

- Would this sound natural in a Russian-speaking young online/gaming/chat environment?
- Is the Russian grammar/rhythm primary unless a specific marker is intentionally imported?
- Is the imported marker actually used naturally in Russian-speaking culture?
- Does the line avoid reading like a translated American TikTok caption?
- Is the semantic meaning still obvious at I0/I1?
- Is the slang used with its real meaning?

Failure classes:

- `OVER_ENGLISH`
- `CULTURE_MIXING`
- `MISUSED_SLANG`
- `OPAQUE_CRITICAL_ACTION`
- `ZOOMER_ALIAS`

## 10. Step 1 completion definition

`FULL_ALPHA_RUSSIAN_FIRST_REWRITE` is considered creatively executed when:

- all currently drafted Alpha semantic batches have an explicit Russian-first replacement overlay;
- onboarding has Russian-first Alpha copy;
- NPC Alpha pools are rewritten;
- known over-English patterns are explicitly superseded;
- known slang misuse is removed;
- canonical REP/economy/mechanic meaning is not replaced by meme vocabulary;
- remaining unresolved rows are unresolved because mechanic/source meaning is blocked, not because Alpha copy was forgotten.

This V1 satisfies that creative rewrite condition for the current foundation corpus.

It is still `DRAFT_FOR_USER_REVIEW`, not `FROZEN`, and does not authorize Codex implementation.

NEXT_ACTION_AFTER_STEP1: `RU_CULTURAL_AUTHENTICITY_PASS_ALL_FIVE_COLUMNS`.