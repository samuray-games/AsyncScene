# STAGE 6 STEP 9 - RU CULTURAL AUTHENTICITY PASS V1

STATUS: `STEP2_CULTURAL_PASS_COMPLETE_AS_DRAFT / NOT_FROZEN`

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

## 1. Scope

This pass reviews the current Step 9 foundation as five Russian-speaking cultural lanes:

- `RU_BOOMER`
- `RU_GEN_X`
- `RU_MILLENNIAL`
- `RU_ZOOMER`
- `RU_ALPHA`

Reviewed surfaces:

- semantic matrix Batch 1;
- semantic matrix Batch 2;
- semantic matrix Batch 3 system/feed;
- semantic matrix Batch 4 conflict/economy;
- start/onboarding;
- current NPC voice pools;
- the Russian-first Alpha rewrite overlay.

The Alpha overlay remains the current authority for Alpha copy where it supersedes earlier English-heavy drafts.

This pass is cultural/editorial review only. It does not freeze copy, does not authorize Codex implementation, and does not change mechanics.

## 2. Cultural authenticity failure classes

The following failure classes are now explicit review failures:

- `CULTURE_MIXING` - foreign generational culture translated or transplanted into Russian copy;
- `BOOMER_BUREAUCRATIC_CARICATURE` - older Russian voice replaced by officialese or patronising senior-mode language;
- `GEN_X_GANGSTER_COSPLAY_GENERIC_UI` - generic UI made criminal/90s merely to signal Gen X;
- `MILLENNIAL_CORPORATE_CALQUE` - abstract marketing/product language used instead of recognisable Russian RuNet-era voice;
- `ZOOMER_TRANSLATED_IMPORT` - literal English platform/gaming phrasing that is not natural Russian-speaking usage;
- `ALPHA_OVER_ENGLISH` - English-first copy instead of Russian-speaking compressed/brainrot-native copy;
- `ALPHA_CALQUE` - English meme syntax translated mechanically into awkward Russian;
- `ACCESSIBILITY_PERSONA_OVERREACH` - tone variation harms screen-reader or critical-control clarity;
- `MISUSED_SLANG` - slang token is used with the wrong semantic meaning;
- `GENERATION_ALIAS` - one generation is merely another generation shortened or lengthened.

## 3. Global cultural rules confirmed

### Boomer

Use normal complete Russian, familiar idiom and clear explanations. Do not simulate a government portal, legal notice or comedy-grandfather persona.

### Gen X

Generic UI is dry, practical and terse. 80s/90s street vocabulary may appear where the actual role/context supports it, especially bandit or mafia NPCs, but generic battle/menu/report controls must not become criminal cosplay.

### Millennial

Use Russian early/mid-RuNet memory, forums, ICQ, ЖЖ, early VK, torrents, desktop life, self-irony and familiar online bureaucracy jokes selectively. Avoid repetitive corporate abstractions such as `социальный капитал` as a generic personality marker.

### Zoomer

Use current Russian-speaking chat/game/video-platform language. Borrowings are allowed when naturalised, but translated English framing such as unnecessary `tie`, `side`, `underdog` or awkward hybrid syntax is rejected.

### Alpha

Remain Russian-speaking and Russian-first. Strong compression, symbols, W/L, NPC, cooked, mid, aura framing and code-like structure are allowed where semantically correct. English is a marker, not the base language.

## 4. Batch 1 corrections

Only rows listed below are changed by this overlay. Unlisted rows remain draft candidates and continue to the next review/source-mapping stages.

| TEXT_ID | PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|---|
| reaction.disagree | Boomer | `Позвольте не согласиться.` | `Не соглашусь.` |
| reaction.disaster | Boomer | `Положение крайне неприятное.` | `Дела плохи.` |
| dm.header | Gen X | `Приват` | `Личка` |
| panel.battles | Gen X | `Разборки` | `Стычки` |
| battle.attack_badge | Gen X | `Наезд` | `Ход` |
| battle.defense_badge | Gen X | `Ответка` | `Ответ` |
| battle.opponent_argument | Gen X | `Что тебе предъявили` | `Что сказал соперник` |
| battle.my_answer | Gen X | `Твоя ответка` | `Твой ответ` |
| battle.attack_action | Gen X | `Врубиться` | `Атаковать` |
| battle.report | Gen X | `Сдать` | `Пожаловаться` |
| toast.rep_gain | Millennial | `Репутация +{X}. Социальный капитал работает.` | `Репутация +{X}. Карма пошла вверх.` |
| toast.combined_respect | Millennial | `Баланс −1. Репутация цели +1. Социальный капитал перераспределён.` | `Баланс −1. Цели +1 к репутации. Карма, но с бухгалтерией.` |
| vote.majority | Zoomer | `Ты в мейнстриме.` | `Ты с большинством. W.` |
| vote.minority | Zoomer | `Ты в андердоге.` | `Ты против толпы 💀` |
| reaction.wait | Zoomer | `Холдап.` | `сек` |
| reaction.relatable | Alpha | `real` | `рил` |

Rationale:

- Gen X generic UI loses the fake criminal-register dependency while crime-role NPCs may still use authentic role-specific street language.
- Millennial replaces abstract marketing vocabulary with recognisable Russian internet-era humour.
- Zoomer removes translated/imported framing that sounds like localisation rather than native Russian chat.
- Alpha `рил` is more naturally Russian-chat embedded than raw `real` for this exact reaction.

## 5. Batch 2 corrections

| TEXT_ID | PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|---|
| goal.label | Zoomer | `Квест` | `Цель` |
| battle.not_enough_points | Gen X | `На разборку денег не хватает.` | `На спор денег не хватает.` |
| vote.click_name_hint | Zoomer | `Тапни имя = твой сайд.` | `Тапни имя своей стороны.` |
| vote.already | Millennial | `Уже проголосовано. Второй бюллетень не завезли.` | `Уже проголосовано. Второй голос не завезли.` |
| vote.end_draw | Zoomer | `tie · {aVotes}:{bVotes}` | `ничья · {aVotes}:{bVotes}` |
| vote.chat_end_draw | Zoomer | `Чат: tie 💀 {aVotes}:{bVotes}` | `чат: ничья 💀 {aVotes}:{bVotes}` |
| economy.purchase_success | Boomer | `Покупка выполнена.` | `Куплено.` |
| rep.recovered | Gen X | `Имя отмыли.` | `Репутацию выправили.` |
| rep.damaged | Gen X | `Имя подмочили.` | `Репутация просела.` |
| respect.gained | Millennial | `Уважение выросло. Социальный капитал начислен.` | `Уважение выросло. Карма плюс.` |
| respect.lost | Millennial | `Уважение снизилось. Неловкость осталась.` | `Уважение просело. Карма минус.` |
| reaction.loss_accept | Zoomer | `ок, меня cooked.` | `ок, я cooked.` |

Notes:

- `goal.label` is a mechanic label, not a place to rename a goal into a quest unless the mechanic itself is a quest.
- `не завезли` remains a natural Russian internet marker; the bureaucratic `бюллетень` prop is unnecessary.
- `cooked` remains valid in Zoomer expressive language when embedded into natural Russian syntax.

## 6. Batch 3 corrections

| TEXT_ID | PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|---|
| event.battle_challenge | Gen X | `{attackerName} [⚡{attackerInf}] полез в разборку.` | `{attackerName} [⚡{attackerInf}] полез в спор.` |
| event.npc_battle_start | Gen X | `{a} наехал на {b}.` | `{a} вызвал {b}.` |
| unlock.orange | Zoomer | `🟠 аргументы unlocked.` | `🟠 аргументы открыты.` |
| unlock.red | Zoomer | `🔴 аргументы unlocked.` | `🔴 аргументы открыты.` |
| unlock.black | Zoomer | `⚫ аргументы unlocked. имба.` | `⚫ аргументы открыты. имба.` |
| unlock.orange_other | Zoomer | `{name}: 🟠 ап.` | `{name}: 🟠 ап.` |
| unlock.red_other | Zoomer | `{name}: 🔴 ап.` | `{name}: 🔴 ап.` |
| unlock.black_other | Zoomer | `{name}: ⚫ max. cooked?` | `{name}: ⚫ макс.` |
| npc.victory.mafia | Gen X | `Мафиози решил: {winner} сверху.` | `Мафиози решил: {winner} взял верх.` |
| npc.victory.cop | Millennial | `Коп зафиксировал победу {winner}. Протокол доволен.` | `Коп зафиксировал победу {winner}. Лог закрыт.` |
| npc.defeat.cop | Millennial | `Коп зафиксировал поражение {loser}. Протокол беспощаден.` | `Коп зафиксировал поражение {loser}. Запись осталась в логах.` |
| unlock.black | Alpha | `⚫ макс открыт` | `⚫ макс ✓` |

Additional decisions:

- `npcArrest*` is removed from the creative queue as `LEGACY_ORPHAN_COPY / LEGACY_SUPERSEDED_CANDIDATE` under `STAGE6_STEP9_SOURCE_DECISIONS_RESOLVED.md`.
- `p2pBacklogReason` is removed from generational copy. Disabled P2P UI should be hidden until the transfer capability is fully enabled.

## 7. Batch 4 corrections

| TEXT_ID | PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|---|
| dismiss.action | Gen X | `Отвали` | `Отказаться` |
| dismiss.action | Millennial | `Отойти` | `Отказаться` |
| dismiss.action | Zoomer | `Отшить` | `Отказаться` |
| dismiss.rep_loss | Millennial | `Репутация −{rep}. Социальный налог за выход.` | `Репутация −{rep}. Вышел из диалога, след остался.` |
| respect.combined_toast | Millennial | `Баланс −{cost}. Репутация {target} +{rep}. Социальный капитал перераспределён.` | `−{cost} 💰. {target}: репутация +{rep}. Карма, но с бухгалтерией.` |
| conflict.intervene_action | Zoomer | `Влететь −{cost} 💰` | `Вмешаться −{cost} 💰` |
| conflict.intervene_success | Zoomer | `ты влетел в конфликт.` | `ты влез в конфликт.` |
| report.false_repeat | Zoomer | `опять false report 💀 · −{rep} репы` | `опять репорт мимо 💀 · −{rep} репы` |

I0 rule confirmed:

A critical player action does not need slang merely to prove the generation exists. The personality can sit in surrounding explanation, result and flavour surfaces.

## 8. Start/onboarding corrections

| TEXT_ID | PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|---|
| start.profile_helper | Millennial | `Только для интерфейса. Год не сохраняем. Профиль потом можно поменять, без драмы.` | `Только для интерфейса. Год не сохраняем. Профиль потом можно поменять.` |
| start.start | Zoomer | `Влететь` | `В игру` |
| start.intro_risk | Zoomer | `Опп задаёт риск.` | `Риск задаёт соперник.` |

### Accessibility decision

The four digit-stepper accessibility labels are intentionally shared across all five profiles:

- `Увеличить первую цифру`
- `Уменьшить первую цифру`
- `Увеличить вторую цифру`
- `Уменьшить вторую цифру`

Classification:

`KEEP_SHARED_INTENTIONALLY / ACCESSIBILITY_CANON`

Generation signalling must not make screen-reader labels less clear.

## 9. NPC cultural corrections

Role-specific exception:

Gen X bandit/mafia may legitimately use 90s street/crime register because those NPC roles are actually criminal. The same register remains forbidden as a generic Gen X UI shortcut.

### Bandit

| PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|
| Boomer | `Без фокусов, молодой человек.` | `Без фокусов.` |
| Millennial | `Переводи и разойдёмся.` | `Скидывай деньги - и разойдёмся.` |
| Zoomer | `Не усложняй вайб.` | `Не усложняй.` |
| Zoomer | `Не делай skill issue.` | `Не тупи. Гони 💰.` |
| Alpha | `без мувов.` | `не двигайся.` |
| Alpha | `банк сюда.` | `кошелёк сюда.` |
| Alpha | `скип слова. гони 💰.` | `без слов. гони 💰.` |

### Toxic

| PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|
| Zoomer | `ты сам себя cooked.` | `ты сам cooked.` |

`skill issue` remains valid in toxic competence-mockery contexts. It remains invalid as generic robbery/compliance language.

### Crowd

| PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|
| Zoomer | `вот это вайб.` | `что за вайб 💀` |
| Alpha | `аура ивент.` | `что за ивент 💀` |

### Mafia

| PROFILE | OLD | CULTURAL PASS V1 |
|---|---|---|
| Zoomer | `Следи за тейком.` | `следи, что пишешь.` |

## 10. What passed without mandatory rewrite

The pass does not require every generation to contain a unique slang token in every row.

Strong patterns that remain valid in the current draft direction include:

- Boomer clear complete Russian and familiar idiom without officialese;
- Gen X terse dry rhythm and role-specific 90s criminal vocabulary only inside actual criminal NPC roles;
- Millennial RuNet/forum/ICQ/browser/tab/download/self-irony references when not repeated mechanically;
- Zoomer natural `кринж`, `база`, `жиза`, `скип`, `вайб`, `имба`, `репорт`, `КД`, gaming shorthand where the exact meaning fits;
- Alpha Russian-first compressed grammar with selective `W/L`, `NPC`, `cooked`, `mid`, `skill issue`, symbols and emoji.

## 11. Cultural pass result

`RU_CULTURAL_AUTHENTICITY_PASS_ALL_FIVE_COLUMNS = COMPLETE_AS_DRAFT_REVIEW_PASS`

This means:

- all five current draft lanes were reviewed under Russian-speaking cultural rules;
- known foreign-culture leakage and generic caricature patterns found in the current foundation were corrected by this overlay;
- the two blocked source/product rows were separately resolved;
- accessibility surfaces that should remain shared were explicitly classified;
- no copy is frozen yet;
- fresh current-main inventory remains mandatory before gap closure and user freeze.

Checklist after this pass:

- [x] 1. `FULL_ALPHA_RUSSIAN_FIRST_REWRITE`
- [x] 2. `RU_CULTURAL_AUTHENTICITY_PASS B/X/M/Z/A`
- [ ] 3. `FRESH_CURRENT_MAIN_INVENTORY`
- [ ] 4. `GAP_CLOSURE`
- [ ] 5. `USER_REVIEW`
- [ ] 6. `FREEZE + SHA256`
- [ ] 7. `CODEX_IMPLEMENTATION`

NEXT_ACTION: `FRESH_CURRENT_MAIN_INVENTORY`.
