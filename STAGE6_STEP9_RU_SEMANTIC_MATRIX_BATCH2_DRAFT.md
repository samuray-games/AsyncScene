# STAGE 6 STEP 9 - RU SEMANTIC MATRIX BATCH 2 DRAFT

STATUS: DRAFT_FOR_USER_APPROVAL

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

> Batch 2 extends the first 48-row draft. It is creative review material only. Nothing in this file is Codex implementation authority until an explicit frozen revision/hash is approved.

## Intensity legend

- `I0_CRITICAL` - action must be instantly understood; personality is secondary.
- `I1_GUIDANCE` - clear first, recognisably generational second.
- `I2_EXPRESSIVE` - strong generation voice expected.
- `I3_FULL_FREEDOM` - reactions/flavour/NPC language may go hard as long as semantic intent remains correct.

## A. Persistent controls, events and navigation

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| menu.return_start | Вернуться на стартовый экран | menu | I0_CRITICAL | Вернуться к началу | На старт | К старту | Назад на старт | рестарт |
| menu.unavailable | Действие сейчас недоступно | menu | I1_GUIDANCE | Сейчас это действие недоступно. | Пока не работает. | Сейчас недоступно. | Пока лок. | locked |
| events.close_extra | Свернуть раскрытую часть событий | events | I0_CRITICAL | Свернуть | Свернуть | Свернуть | Скрыть | свернуть |
| events.clear | Убрать одно/текущие просмотренные события | events | I0_CRITICAL | Очистить | Убрать | Очистить | Почистить | clear |
| events.clear_all | Очистить весь список событий | events | I0_CRITICAL | Очистить всё | Убрать всё | Очистить всё | Снести всё | clear all |
| events.done | Завершить работу с событием/подтвердить | events | I0_CRITICAL | Готово | Всё | Готово | Готово | done |
| events.left | Осталось N секунд | events | I1_GUIDANCE | Осталось {sec} сек. | Ещё {sec} сек. | Осталось {sec} сек. | ⏳ {sec} | ⏳{sec} |
| events.title_count | Заголовок событий с количеством | events | I1_GUIDANCE | События: {count} | События · {count} | События ({count}) | Движ · {count} | ивенты {count} |
| events.panel_hint | Здесь появляются важные события | events | I2_EXPRESSIVE | Здесь отображаются важные события. | Тут всё, что случилось. | Здесь собирается всё важное. Удобно, пока жизнь не решила иначе. | Тут весь движ. | lore feed |
| goal.label | Метка текущей цели | persistent_ui | I1_GUIDANCE | Цель | Цель | Цель | Квест | цель |

## B. Invite, search and argument guidance

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| invite.open_hint | Нужно ввести точный ник игрока | invite | I1_GUIDANCE | Введите точный ник игрока. | Нужен точный ник. | Введи точный ник. | Ник 1 в 1. | exact ник |
| invite.invalid | Игрок с таким ником не найден | invite | I1_GUIDANCE | Такой игрок не найден. | Нет такого. | Игрок не найден. | Ник мимо. | no player |
| hint.type_who | Аргумент должен отвечать на «кто?» | argument_hint | I1_GUIDANCE | Ответьте на вопрос: кто? | Кто именно? | Ответь: кто? | Кто? | кто |
| hint.type_where | Аргумент должен отвечать на «где?» | argument_hint | I1_GUIDANCE | Ответьте на вопрос: где? | Где именно? | Ответь: где? | Где? | где |
| hint.type_about | Аргумент должен отвечать на «о ком?» | argument_hint | I1_GUIDANCE | Ответьте на вопрос: о ком? | Про кого речь? | Ответь: о ком? | О ком? | про кого |
| hint.type_yn | Нужен ответ «да» или «нет» | argument_hint | I1_GUIDANCE | Ответьте: да или нет. | Да или нет? | Ответь: да или нет. | Да / нет? | y/n |
| training.sent_chat | Публично сообщить, что аргумент передан от учителя ученику | training | I2_EXPRESSIVE | {teacher} передал аргумент игроку {student}. | {teacher} подкинул аргумент {student}. | {teacher} → {student}: аргумент передан. Старый добрый обмен знаниями. | {teacher} закинул аргумент → {student}. | {teacher} > {student} +arg |
| training.sent_dm | Лично сообщить ученику аргумент и стоимость | training_dm | I1_GUIDANCE | Для {student}: {arg}. Стоимость: {cost} 💰. | {student}, держи: {arg}. Цена {cost} 💰. | {student}: {arg}. Минус {cost} 💰 за образовательные услуги. | {student}, лови: {arg}. −{cost} 💰. | {arg} / −{cost}💰 |

## C. Battle/conflict access and locked states

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| battle.energy_locked | Для действия нужен уровень влияния/энергии {energy} | battle | I1_GUIDANCE | Требуется ⚡{energy}. | Нужен уровень ⚡{energy}. | Откроется на ⚡{energy}. | Нужно ⚡{energy}. | ⚡{energy} req |
| battle.not_enough_points | На бой не хватает денег | battle | I1_GUIDANCE | Для этого конфликта недостаточно денег. | На разборку денег не хватает. | На конфликт денег не хватает. Бюджет сказал «нет». | На баттл не хватает 💰. | broke 💀 |
| conflict.win | Игрок победил именно в конфликте | conflict_result | I2_EXPRESSIVE | Вы победили в конфликте. | Разобрался. Твой верх. | Конфликт выигран. Можно мысленно закрыть вкладку. | Разнёс. W. | W |
| conflict.loss | Игрок проиграл именно конфликт | conflict_result | I2_EXPRESSIVE | Вы проиграли конфликт. | Тебя переиграли. Облом. | Конфликт проигран. Неприятно, но вкладка уже закрывается. | Тебя cooked 💀 | L 💀 |
| conflict.draw | Конфликт закончился ничьёй | conflict_result | I2_EXPRESSIVE | Конфликт завершился ничьёй. | Разошлись по нулям. | Ничья. Все поспорили, никто не победил. Классика. | 50/50. gg. | tie gg |

## D. Vote/tie flow

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| vote.tie_start | Началось голосование толпы | vote | I2_EXPRESSIVE | Началось голосование. | Народ решает. | Толпа решает. Демократия вошла в чат. | Чат решает. | chat vote |
| vote.call_to_action | Призыв выбрать сторону | vote | I0_CRITICAL | Выберите сторону | Выбирай сторону | Выбери сторону | Голосуй | vote |
| vote.click_name_hint | Имя игрока в списке выбирает его сторону | vote | I1_GUIDANCE | Нажмите имя, чтобы выбрать сторону. | Жми на имя своей стороны. | Имя = сторона. Нажми нужное. | Тапни имя = твой сайд. | tap name |
| vote.timer | До конца голосования N секунд | vote | I1_GUIDANCE | До конца голосования: {sec} сек. | Ещё {sec} сек. | Осталось {sec} сек. | ⏳ {sec} | ⏳{sec} |
| vote.ok | Голос принят | vote | I1_GUIDANCE | Ваш голос учтён. | Голос принят. | Голос учтён. | Голос залетел ✓ | ✓ |
| vote.already | Игрок уже голосовал | vote | I1_GUIDANCE | Ваш голос уже учтён. | Ты уже голосовал. | Уже проголосовано. Второй бюллетень не завезли. | Уже голоснул. | already ✓ |
| vote.fail | Голос не принят/недоступен | vote | I1_GUIDANCE | Голос не принят. | Не прошло. | Голос не учтён. | Не залетело. | nope ✕ |
| vote.end_winner | Голосование закончено, победил {name} | vote_result | I2_EXPRESSIVE | Победил {name}: {aVotes}:{bVotes}. | {name} забрал голосование - {aVotes}:{bVotes}. | {name} победил - {aVotes}:{bVotes}. Коллективное решение принято. | 🏆 {name} · {aVotes}:{bVotes} | W {name} {aVotes}:{bVotes} |
| vote.end_draw | Голосование закончено ничьёй | vote_result | I2_EXPRESSIVE | Голоса разделились поровну: {aVotes}:{bVotes}. | По нулям: {aVotes}:{bVotes}. | Поровну - {aVotes}:{bVotes}. Даже толпа не определилась. | tie · {aVotes}:{bVotes} | tie {aVotes}:{bVotes} |
| vote.chat_start | Публичное сообщение о старте голосования | chat_system | I2_EXPRESSIVE | Началось голосование. Выберите сторону. | Народ решает. Выбирай. | Толпа решает. Пора определяться. | Чат, голосуем. | chat vote now |
| vote.chat_end_winner | Публичное сообщение о победителе голосования | chat_system | I2_EXPRESSIVE | Голосование завершено. Победил {name}: {aVotes}:{bVotes}. | Всё, народ решил: {name}, {aVotes}:{bVotes}. | Толпа решила: {name} - {aVotes}:{bVotes}. | Чат выбрал {name} 🏆 {aVotes}:{bVotes} | chat W {name} |
| vote.chat_end_draw | Публичное сообщение о ничьей голосования | chat_system | I2_EXPRESSIVE | Голосование завершилось ничьёй: {aVotes}:{bVotes}. | Народ не решил: {aVotes}:{bVotes}. | Толпа зависла на ничьей - {aVotes}:{bVotes}. | Чат: tie 💀 {aVotes}:{bVotes} | chat tie |

## E. Economy/system-state language

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| economy.purchase_success | Покупка успешно совершена | economy_toast | I2_EXPRESSIVE | Покупка выполнена. | Куплено. Деньги ушли. | Куплено. Финансовая ответственность снова отложена. | Забрали. −💰. | bought / −💰 |
| economy.sale_success | Продажа успешно завершена | economy_toast | I2_EXPRESSIVE | Продажа завершена. | Продано. Нормально. | Продано. Капитализм опять сработал. | Продали. +банк. | sold W |
| economy.reward_received | Получена награда | reward_toast | I2_EXPRESSIVE | Награда получена. | Награда пришла. | Награда получена. Дофамин тоже. | Лут залетел ✨ | loot W |
| economy.penalty_received | Применён штраф | penalty_toast | I2_EXPRESSIVE | Назначен штраф. | Штраф прилетел. | Штраф получен. Прекрасно, просто прекрасно. | Минуснули 💀 | penalty L |
| economy.generic_error | Произошла неизвестная ошибка | error | I2_EXPRESSIVE | Произошла ошибка. Попробуйте ещё раз. | Что-то сломалось. Бывает. | Что-то пошло не так. Как неожиданно. | Что-то отъехало 🫠 | bug 💀 |
| economy.generic_success | Действие успешно выполнено | success | I1_GUIDANCE | Готово. | Есть. | Готово. | Готово ✓ | done ✓ |
| economy.money_received | Игрок получил деньги | economy_toast | I2_EXPRESSIVE | Деньги поступили на баланс. | Деньги пришли. | Деньги пришли. Сегодня мы финансово грамотные. | 💰 залетели. | +💰 W |
| economy.money_spent | Игрок потратил деньги | economy_toast | I2_EXPRESSIVE | Деньги списаны с баланса. | Деньги ушли. | Деньги списаны. Бюджет держится на честном слове. | 💰 ушли. | −💰 |
| economy.balance_up | Баланс увеличился | economy_toast | I2_EXPRESSIVE | Баланс увеличился. | Касса подросла. | Баланс вырос. Небольшая победа взрослой жизни. | Банк апнулся 📈 | money W |
| economy.balance_down | Баланс уменьшился | economy_toast | I2_EXPRESSIVE | Баланс уменьшился. | Касса похудела. | Баланс снизился. Таблица расходов довольно кивает. | Банк просел 💀 | money L |
| economy.poverty | Денег почти не осталось | economy_state | I2_EXPRESSIVE | Денег почти не осталось. | В кармане ветер. | Денег почти нет. Финансовая подушка оказалась салфеткой. | Кошелёк на лоу хп. | broke soon 💀 |
| economy.rich | Денег много/хороший запас | economy_state | I2_EXPRESSIVE | У вас хороший запас денег. | Касса в порядке. | Денег хватает. Редкий момент финансового спокойствия. | Банк жирный. | rich W |
| economy.bankrupt | Денег не осталось | economy_state | I2_EXPRESSIVE | Деньги закончились. | Всё, касса пустая. | Всё. Денег нет. Финансовый сезон закрыт. | Кошелёк cooked 💀 | broke 💀 |
| economy.income_event | Произошёл доход | economy_event | I2_EXPRESSIVE | Получен доход. | Плюс в кассу. | Доход получен. Где-то заплакала одна таблица Excel от счастья. | Плюс к банку 💸 | +money W |
| economy.expense_event | Произошёл расход | economy_event | I2_EXPRESSIVE | Учтён расход. | Минус из кассы. | Расход учтён. Бюджет снова проходит сюжетную арку. | Минус банк. | −money |
| economy.neutral | Баланс не изменился | economy_event | I2_EXPRESSIVE | Баланс не изменился. | По деньгам без изменений. | Баланс тот же. Хоть где-то стабильность. | По банку без мувов. | money = |

## F. Reputation and social-state reactions

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| rep.high | Репутация высокая | social_state | I2_EXPRESSIVE | У вас высокая репутация. | Имя на весу. | Репутация высокая. Интернет сегодня на нашей стороне. | Репа хай. | aura ↑ |
| rep.low | Репутация низкая | social_state | I2_EXPRESSIVE | Репутация низкая. | Репутация так себе. | Репутация просела. Старые посты догнали. | Репа на дне 💀 | aura low |
| rep.recovered | Репутация восстановилась | social_state | I2_EXPRESSIVE | Репутация восстановлена. | Имя отмыли. | Репутация восстановилась. Цифровой след немного простил. | Репа отхилилась. | aura restored |
| rep.damaged | Репутация пострадала | social_state | I2_EXPRESSIVE | Репутация снизилась. | Имя подмочили. | Репутация пострадала. Интернет сделал скриншот. | Репу уронили 💀 | aura − |
| respect.gained | К игроку стали относиться лучше | social_state | I2_EXPRESSIVE | Уважение к вам выросло. | Тебя зауважали. | Уважение выросло. Социальный капитал начислен. | Респект +. | respect W |
| respect.lost | К игроку стали относиться хуже | social_state | I2_EXPRESSIVE | Уважение к вам снизилось. | Респект просел. | Уважение снизилось. Неловкость осталась. | Респект − 💀 | respect L |

## G. Cop/report flow

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| cop.busy | Полицейский сейчас занят проверкой | cop_dm | I2_EXPRESSIVE | Сейчас идёт другая проверка. Обратитесь немного позже. | Занято. Подожди. | Сейчас занято другой проверкой. Очередь, она и здесь очередь. | Коп занят. КД. | cop busy |
| cop.cooldown | Нужно дождаться следующей проверки | cop_dm | I1_GUIDANCE | Следующая проверка будет доступна позже. | Проверка на паузе. Погоди. | Нужно подождать до следующей проверки. | КД на проверку. | check cd |
| cop.report_ok | Жалоба подтвердилась | cop_dm | I2_EXPRESSIVE | Проверка подтвердила сообщение. | Подтвердилось. Ты был прав. | Жалоба подтвердилась. На этот раз интернет-суд не ошибся. | Репорт валид ✓ | report W |
| cop.report_fail | Жалоба не подтвердилась | cop_dm | I2_EXPRESSIVE | Проверка не подтвердила сообщение. | Не подтвердилось. Мимо. | Жалоба не подтвердилась. Неловко получилось. | Репорт мимо 💀 | false L |
| report.cooldown_hint | Повторный репорт временно недоступен | report | I1_GUIDANCE | Повторное сообщение можно отправить позже. | Ещё раз позже. | Повторный репорт пока недоступен. | Репорт на КД. | report cd |
| report.target_missing | Указанная цель репорта не найдена | report | I1_GUIDANCE | Указанный игрок не найден. | Нет такого игрока. | Игрок не найден. Проверь ник. | Ник мимо. | no target |

## H. Strong reaction archetypes for later NPC family expansion

These are semantic archetypes, not a complete NPC corpus. Later expansion should create multiple variants per archetype and per NPC role/temperament.

| TEXT_ID | SEMANTIC_INTENT | CONTEXT | INTENSITY | BOOMER | GEN_X | MILLENNIAL | ZOOMER | ALPHA |
|---|---|---|---|---|---|---|---|---|
| reaction.good | Что-то получилось хорошо | npc_reaction | I3_FULL_FREEDOM | Вот это хорошо получилось! | Нормально сделали. | Ну вот, можем же, когда захотим. | Имба. | W |
| reaction.embarrassed | Неловкость/стыд | npc_reaction | I3_FULL_FREEDOM | Неловко получилось. | Вот это косяк. | Господи, удалите это из истории браузера. | Кринж 💀 | aura −100 |
| reaction.confused | Не понимает происходящее | npc_reaction | I3_FULL_FREEDOM | Что-то я не совсем понимаю. | Чего? Я не въехал. | Я потерял нить примерно три сообщения назад. | я не выкупаю 💀 | bro what |
| reaction.refuse | Категорический отказ | npc_reaction | I3_FULL_FREEDOM | Нет, я на это не согласен. | Не, без меня. | Нет, спасибо, я уже мысленно вышел из этого чата. | жёсткий скип. | nah |
| reaction.support | Активно поддерживает другого | npc_reaction | I3_FULL_FREEDOM | Полностью поддерживаю. | Я за. | Подписываюсь под каждым словом, цифровой подписью и кровью дедлайна. | база. +1. | W take |
| reaction.warning | Предупреждает, что идея плохая | npc_reaction | I3_FULL_FREEDOM | Я бы не советовал так поступать. | Я бы туда не лез. | Это выглядит как решение, о котором мы потом напишем длинный пост. | бро не надо 💀 | aura trap |
| reaction.challenge | Провоцирует на спор/бой | npc_reaction | I3_FULL_FREEDOM | Ну что, готовы ответить за свои слова? | Ну давай, проверим. | Хорошо, давай выясним, чей аргумент переживёт этот тред. | го 1v1 аргументами. | 1v1? |
| reaction.victory_gloat | Радуется победе над соперником | npc_reaction | I3_FULL_FREEDOM | Что ж, результат говорит сам за себя. | Ну вот и всё. | Ну что сказать. Скриншот результата уже мысленно сохранён. | ez 💀 | W ez |
| reaction.loss_accept | Принимает поражение | npc_reaction | I3_FULL_FREEDOM | Признаю, сегодня вы оказались сильнее. | Ладно, твоя взяла. | Ладно, этот раунд не мой. Сохраняю достоинство в черновики. | ок, меня cooked. | L accepted |
| reaction.bored | Скучно/ничего не происходит | npc_reaction | I3_FULL_FREEDOM | Что-то сегодня совсем тихо. | Скукота. | Так тихо, что я уже начал разбирать папку «Разное». | вайб умер. | zzz |

## Batch 2 review notes

### Deliberately strong but not frozen

These candidates intentionally push harder than the previous cautious profiles. They still require human review for authenticity and semantic precision.

Potential review hotspots:

- Millennial humour must not become one repetitive `Excel/deadline/browser-history` gimmick.
- Zoomer must use current Russian internet language naturally, not stack slang in every sentence.
- Alpha English/code markers must remain readable to the intended Russian-speaking audience and should not replace understandable I0 actions.
- Gen X should not become an endless 90s caricature or a list of retro props.
- Boomer should be culturally recognisable without turning into bureaucratic `уважаемый пользователь` parody.

### Intentional shared-copy allowance

Some I0 controls may remain identical across two or more generations when changing them would reduce clarity. Shared copy is allowed only by explicit approval, never accidental inheritance.

### Next expansion target

Batch 3 should focus on:

1. NPC role families: ordinary / toxic / bandit / cop;
2. argument-family presentation and feedback;
3. robbery, crowd, intervention and rematch economy;
4. start/onboarding full persona pass;
5. menu/profile-change flows;
6. chat system messages and conflict feed;
7. dynamic template placeholder preservation.

NEXT_ACTION: review/adjust Batch 1 + Batch 2, then expand Batch 3 and map fresh current-main inventory rows to semantic intents before freeze.