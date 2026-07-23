# STAGE 6 STEP 9 - RU SEMANTIC MATRIX BATCH 4 / CONFLICT ECONOMY

STATUS: DRAFT_FOR_USER_APPROVAL

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

## 1. Safety rule

This batch separates immutable mechanic facts from generation-specific presentation.

The following are `MECHANIC_CANON_LOCKED`:

- actual cost values;
- who pays;
- who receives money/REP;
- whether REP changes;
- cooldown behavior;
- eligibility conditions;
- outcome calculation;
- argument logic;
- vote counting;
- money-log accounting.

Generation copy may describe the same event differently but may not imply a different effect.

Where cost/value is dynamic, use placeholders such as `{cost}`, `{rep}`, `{points}`, `{target}`, `{name}` and preserve them exactly after source confirmation.

## 2. Rematch

Canonical invariant from repository policy:

- loser pays rematch cost;
- initial cost is 1 point and increases;
- rematch does not change REP by itself.

### Action/button

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| rematch.action | I0_CRITICAL | Предложить реванш | Ещё разок | Реванш | Рематч | rematch |
| rematch.action_with_cost | I0_CRITICAL | Реванш - {cost} 💰 | Ещё раз - {cost} 💰 | Реванш · {cost} 💰 | Рематч −{cost} 💰 | rematch −{cost}💰 |

### Offer/result feedback

| TEXT_ID | SEMANTIC_INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| rematch.offered | Rematch was offered | I2_EXPRESSIVE | Предложен реванш. | Ещё раунд? | Реванш предложен. Потому что одного раза было недостаточно. | рематч? го. | run it back? |
| rematch.accepted | Rematch accepted | I2_EXPRESSIVE | Реванш принят. | Поехали ещё раз. | Реванш принят. Открываем второй сезон. | рематч принят 🔥 | round 2 W |
| rematch.declined | Rematch declined | I2_EXPRESSIVE | Реванш отклонён. | Не, хватит. | Реванш отклонён. Продолжения не будет. | рематч скип. | rematch nah |
| rematch.not_enough_money | Loser cannot afford rematch | I1_GUIDANCE | Для реванша недостаточно денег. | На второй раунд денег нет. | На реванш не хватает денег. Продолжение отменено бюджетом. | на рематч не хватает 💰 💀 | rematch broke 💀 |
| rematch.cost_paid | Rematch cost was charged | I2_EXPRESSIVE | За реванш списано {cost} 💰. | Второй раунд: −{cost} 💰. | Реванш: −{cost} 💰. Цена второго шанса. | рематч −{cost} 💰. | round2 −{cost}💰 |

Semantic warning:

- Do not imply REP gain/loss in rematch copy unless a separate actual battle outcome later changes REP through normal rules.

## 3. Battle entry / boost / tactical costs

Exact current constants exist in runtime and must be read fresh before freeze/implementation.

Known current categories include:

- battle entry;
- battle boost;
- reroll arguments;
- hint weakness;
- crowd extra vote;
- vote shield;
- force NPC event;
- intervene conflict.

### Generic cost language

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| cost.confirm_generic | I0_CRITICAL | Потратить {cost} 💰? | Потратить {cost} 💰? | Потратить {cost} 💰? | −{cost} 💰? | pay {cost}💰? |
| cost.not_enough_generic | I1_GUIDANCE | Недостаточно денег. Нужно {cost} 💰. | Не хватает. Нужно {cost} 💰. | Не хватает денег. Нужно {cost} 💰. | нужно {cost} 💰, не хватает. | need {cost}💰 |
| cost.charged_generic | I2_EXPRESSIVE | Списано {cost} 💰. | −{cost} из кармана. | Баланс −{cost} 💰. Бюджет сделал глубокий вдох. | −{cost} 💰. | −{cost}💰 |

I0 note:

The cost itself must remain visually explicit. Do not replace `{cost} 💰` with opaque slang.

## 4. Battle boost

Semantic intent: pay the canonical boost cost to strengthen the permitted battle action/effect exactly as current mechanics define it.

Until fresh source mapping identifies exact effect wording, keep the action noun conservative.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| battle.boost_action | I0_CRITICAL | Усилить - {cost} 💰 | Усилить - {cost} 💰 | Усилить · {cost} 💰 | Буст −{cost} 💰 | boost −{cost}💰 |
| battle.boost_success | I2_EXPRESSIVE | Усиление применено. | Усилили. | Усиление применено. Посмотрим, окупится ли инвестиция. | буст активен 🔥 | boost on |
| battle.boost_blocked | I1_GUIDANCE | Усиление сейчас недоступно. | Сейчас не усилить. | Усиление сейчас недоступно. | буст пока лок. | boost locked |

## 5. Reroll arguments

Semantic intent: spend canonical cost to redraw/reroll available argument options. No implication that the new options are guaranteed stronger.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| argument.reroll_action | I0_CRITICAL | Обновить аргументы - {cost} 💰 | Другие аргументы - {cost} 💰 | Перебрать аргументы · {cost} 💰 | Реролл −{cost} 💰 | reroll −{cost}💰 |
| argument.reroll_success | I2_EXPRESSIVE | Доступны новые аргументы. | Другой набор. | Аргументы обновлены. Может, теперь повезёт с формулировками. | новый ролл 🎲 | new roll |
| argument.reroll_not_enough | I1_GUIDANCE | Недостаточно денег для обновления аргументов. | На другой набор денег нет. | На реролл аргументов не хватает денег. | на реролл не хватает 💰. | reroll broke |

Forbidden implication:

- `сильнее` unless actual mechanic guarantees strength increase.

## 6. Hint weakness

Semantic intent: pay canonical cost to obtain the existing weakness/hint information. Do not invent new strategic information.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| hint.weakness_action | I0_CRITICAL | Подсказка - {cost} 💰 | Подсказка - {cost} 💰 | Подсказка · {cost} 💰 | Хинт −{cost} 💰 | hint −{cost}💰 |
| hint.weakness_received | I2_EXPRESSIVE | Подсказка получена. | Вот зацепка. | Подсказка получена. Теперь хотя бы есть за что зацепиться. | хинт залетел 👀 | hint unlocked |
| hint.weakness_not_enough | I1_GUIDANCE | Недостаточно денег для подсказки. | На подсказку денег нет. | На подсказку не хватает денег. Знание снова платное. | на хинт не хватает 💰. | hint broke |

## 7. Extra crowd vote

Semantic intent: pay canonical cost for the exact existing extra-vote mechanic. Do not imply vote outcome is guaranteed.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| crowd.extra_vote_action | I0_CRITICAL | Дополнительный голос - {cost} 💰 | Ещё голос - {cost} 💰 | Дополнительный голос · {cost} 💰 | +1 голос −{cost} 💰 | +1 vote −{cost}💰 |
| crowd.extra_vote_success | I2_EXPRESSIVE | Дополнительный голос добавлен. | Ещё один голос в деле. | Дополнительный голос добавлен. Демократия получила DLC. | +1 голос залетел. | +1 vote ✓ |
| crowd.extra_vote_blocked | I1_GUIDANCE | Дополнительный голос сейчас недоступен. | Ещё голос сейчас нельзя. | Дополнительный голос сейчас недоступен. | +1 голос пока лок. | vote+ locked |

## 8. Vote shield

Semantic intent: pay canonical cost for the current vote-shield protection. Exact protected effect/duration must be read fresh from current source before freeze.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| vote.shield_action | I0_CRITICAL | Защитить голос - {cost} 💰 | Защита голоса - {cost} 💰 | Защита голоса · {cost} 💰 | Щит голоса −{cost} 💰 | vote shield −{cost}💰 |
| vote.shield_success | I2_EXPRESSIVE | Защита голоса включена. | Голос прикрыт. | Защита голоса включена. Теперь бюллетень с бронёй. | голос под щитом 🛡️ | vote shield ON |
| vote.shield_blocked | I1_GUIDANCE | Защита голоса сейчас недоступна. | Сейчас не прикрыть. | Защита голоса сейчас недоступна. | щит пока лок. | shield locked |

## 9. Intervene in conflict

Semantic intent: pay canonical cost to perform the existing intervention mechanic. Exact effect must be mapped from fresh current source.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| conflict.intervene_action | I0_CRITICAL | Вмешаться - {cost} 💰 | Влезть - {cost} 💰 | Вмешаться · {cost} 💰 | Влететь −{cost} 💰 | jump in −{cost}💰 |
| conflict.intervene_success | I2_EXPRESSIVE | Вы вмешались в конфликт. | Влез в разборку. | Ты вмешался в конфликт. Теперь это и твоя проблема. | ты влетел в конфликт. | joined chaos |
| conflict.intervene_blocked | I1_GUIDANCE | Сейчас вмешаться нельзя. | Сейчас не влезть. | Сейчас вмешаться нельзя. | влететь пока нельзя. | join locked |

Review note:

- Zoomer `Влететь` may collide with attack wording. Final exact copy should distinguish intervention from attack if both appear together.

## 10. Force NPC event

Semantic intent: spend canonical cost to trigger/force the existing NPC event mechanic. Exact event guarantees must not be overstated.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| npc.force_event_action | I0_CRITICAL | Запустить событие - {cost} 💰 | Подкинуть событие - {cost} 💰 | Запустить событие · {cost} 💰 | Форснуть ивент −{cost} 💰 | force event −{cost}💰 |
| npc.force_event_success | I2_EXPRESSIVE | Событие запущено. | Событие пошло. | Событие запущено. Сюжет получил небольшой толчок. | ивент форснут 👀 | event forced |
| npc.force_event_blocked | I1_GUIDANCE | Сейчас запустить событие нельзя. | Сейчас не запустить. | Сейчас событие не запустить. | ивент пока лок. | event locked |

## 11. Dismiss / reject unwanted interaction

Current canon has reputation penalties for dismiss and repeated dismiss. Exact current trigger/context must be verified before freeze.

Presentation must not hide consequence if the UI currently exposes it.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| dismiss.action | I0_CRITICAL | Отказаться | Отвали | Отойти | Отшить | nope |
| dismiss.action_with_rep_cost | I0_CRITICAL | Отказаться -{rep} ⭐ | Отвали −{rep} ⭐ | Отойти · −{rep} ⭐ | Отшить −{rep} ⭐ | nope −{rep}⭐ |
| dismiss.result | I2_EXPRESSIVE | Вы отказались от взаимодействия. | Отшил. | Ты отказался. Социальные последствия приложены. | скипнул контакт. | contact skipped |
| dismiss.rep_loss | I2_EXPRESSIVE | Репутация снизилась на {rep}. | Репутация −{rep}. Вот и последствия. | Репутация −{rep}. Социальный налог за выход. | репа −{rep} 💀 | aura/REP −{rep} |

Important:

- `Отвали` may be excellent Gen X/NPC-flavour copy but potentially too aggressive for a generic player I0 action depending context. Keep draft until exact surface/context is reviewed.
- Alpha `aura/REP` is intentionally NOT final. Canonical REP must remain understandable; decide one explicit rendering at freeze.

## 12. Respect / target reputation action

Known visual/runtime acceptance context from prior Stage 6 work:

- player pays money;
- target receives REP;
- target REP must never be parsed/displayed as player's own REP delta;
- unified toast must remain one coalesced card.

Exact canonical values/current action name must be verified fresh before freeze.

### Action

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| respect.action | I0_CRITICAL | Поддержать - {cost} 💰 | Поддержать - {cost} 💰 | Поддержать · {cost} 💰 | Респект −{cost} 💰 | respect −{cost}💰 |

### Combined result toast

| TEXT_ID | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|
| respect.combined_toast | Списано {cost} 💰. Репутация {target} выросла на {rep}. | −{cost} 💰. {target}: репутация +{rep}. | Баланс −{cost}. Репутация {target} +{rep}. Социальный капитал перераспределён. | −{cost} 💰 тебе · {target} +{rep} репы. | −{cost}💰 / {target} +{rep}⭐ |

Invariant:

Do not render target REP as player REP.

## 13. Truthful / false report outcomes

Current repository canon:

- truthful report has a REP reward;
- false report has a REP penalty;
- repeated false report has a stronger penalty.

Exact current values are mechanic constants and must remain source-driven.

| TEXT_ID | SEMANTIC_INTENT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|
| report.true_result | Report verified true | I2_EXPRESSIVE | Проверка подтвердила сообщение. Репутация +{rep}. | Подтвердилось. +{rep} к репутации. | Жалоба подтвердилась. Репутация +{rep}. На этот раз интернет-суд сработал. | репорт валид ✓ · репа +{rep} | report W +{rep}⭐ |
| report.false_result | Report verified false | I2_EXPRESSIVE | Сообщение не подтвердилось. Репутация −{rep}. | Мимо. Репутация −{rep}. | Жалоба не подтвердилась. Репутация −{rep}. Неловко вышло. | репорт мимо 💀 · репа −{rep} | false L −{rep}⭐ |
| report.false_repeat | Repeated false report penalty | I2_EXPRESSIVE | Повторное ложное сообщение. Репутация −{rep}. | Опять мимо. Репутация −{rep}. | Снова ложная жалоба. Репутация −{rep}. Система уже запомнила этот сюжет. | опять false report 💀 · −{rep} репы | false x2 · −{rep}⭐ |

Do not hardcode `{rep}` in frozen copy if the runtime value remains configurable.

## 14. Voting participation economy

Repository canon currently states:

- participation: +1 REP and −1 point;
- majority winner: +2 REP and +1 point;
- minority: −2 REP and +0 points.

Before implementation, use live constants/source as final mechanic authority.

### Participation combined toast

| TEXT_ID | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|
| vote.participation_toast | Участие: −{points} 💰, репутация +{rep}. | Голос учтён: −{points} 💰, репутация +{rep}. | Участие: −{points} 💰 · репутация +{rep}. Демократия не бесплатна. | голос: −{points} 💰 · репа +{rep}. | vote −{points}💰 +{rep}⭐ |

### Majority outcome

| TEXT_ID | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|
| vote.majority_econ | Большинство победило: +{points} 💰, репутация +{rep}. | Был с большинством: +{points} 💰, репутация +{rep}. | Ты с большинством: +{points} 💰 · репутация +{rep}. Сегодня коллективный разум окупился. | majority W · +{points} 💰 +{rep} репы. | majority W +{points}💰 +{rep}⭐ |

### Minority outcome

| TEXT_ID | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|
| vote.minority_econ | Вы оказались в меньшинстве: репутация −{rep}. | Остался в меньшинстве: репутация −{rep}. | Ты в меньшинстве: репутация −{rep}. Быть независимым снова оказалось социально дорого. | minority L · репа −{rep}. | minority L −{rep}⭐ |

No copy may imply a money loss/gain different from the actual current canon.

## 15. Crowd support REP

Current runtime has a crowd-support REP concept. Exact triggering event must be source-confirmed before freeze.

| TEXT_ID | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|
| crowd.support_rep | I2_EXPRESSIVE | Толпа поддержала вас. Репутация +{rep}. | Народ за тебя. Репутация +{rep}. | Толпа поддержала тебя. Репутация +{rep}. Общественное мнение сегодня благосклонно. | чат за тебя · репа +{rep}. | chat W +{rep}⭐ |

## 16. Template discipline

Every economy/conflict string in this batch requires one of these implementation states:

- `SOURCE_CONFIRMED_EXACT_PLACEHOLDERS`
- `SOURCE_CONFIRMED_STATIC_VALUE`
- `BLOCKED_NEEDS_SOURCE_MAPPING`

Before freeze:

1. map each semantic ID to exact current emitter/key;
2. preserve all placeholders;
3. verify value origin (constant/config/dynamic);
4. verify whose stat changes;
5. verify unified-toast grouping;
6. test one scripted mechanic scenario across all five profiles and prove identical state/moneyLog outcomes.

## 17. Current review hotspots

Likely edits before freeze:

- `dismiss.action`: decide whether Gen X `Отвали` is acceptable for exact player-facing context;
- Alpha REP rendering: avoid conflating canonical REP with `aura` where mechanic clarity matters;
- Zoomer `репа` is allowed but not a unique generation marker;
- intervention `Влететь` may collide with attack action;
- battle boost semantics must be mapped exactly before expressive text claims anything about strength;
- force-NPC-event wording must not promise a specific event/result.

NEXT_ACTION: source-map these semantic intents against fresh current-main emitters during inventory refresh, then review exact five-profile candidates before freeze.