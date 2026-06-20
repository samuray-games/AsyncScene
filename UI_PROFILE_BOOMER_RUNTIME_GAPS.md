# UI_PROFILE_BOOMER_RUNTIME_GAPS

## Metadata

- step: 3.5
- sourceSmoke: smokeBoomerRuntimeLexicalLinterStep35Fix4Once
- sourceBuildTag: build_2026_06_19_step3_5_boomer_runtime_lexical_linter_fix4_v1
- sourceCommit: step3_5_boomer_runtime_lexical_linter_fix4
- sourceSmokeVersion: step3_5_boomer_runtime_lexical_linter_fix4_v20260619_001
- checkedTextCount: 184
- checkedSurfaceCount: 13
- status: COPY_DECISIONS_REQUIRED
- runtimePassClaimed: false

## Summary

- gapOccurrenceCount: 132
- semanticGroupCount: 20
- exactExistingTargetCount: 0
- newBoomerTargetRequiredCount: 130
- duplicateRuntimeAliasCount: 2
- unresolvedSourceIdentityCount: 0

### Counts by source

| source | count |
| --- | ---: |
| Data.COP_TEMPLATES | 76 |
| Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | 25 |
| Data.START_SCREEN_PROFILE_TEXTS.zoomer | 1 |
| Data.TEXTS.zoomer | 30 |

### Counts by checked surface

| checkedSurface | count |
| --- | ---: |
| DM | 20 |
| NPC speech | 101 |
| NPC vs NPC | 35 |
| UI labels | 14 |
| crowd | 8 |
| economy | 1 |
| errors | 18 |
| hints | 2 |
| learning | 0 |
| rematch | 1 |
| reports | 28 |
| respect | 0 |
| system messages | 31 |

### Counts by resolutionClass

| resolutionClass | count |
| --- | ---: |
| duplicate_runtime_alias | 2 |
| exact_existing_target | 0 |
| new_boomer_target_required | 130 |
| unresolved_source_identity | 0 |

## Gap Inventory

| gapId | source | surface | key | rawText | variables | reason | semanticGroup | exactExistingBoomerTargetId | exactExistingBoomerTargetText | resolutionClass | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GAP_0001 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[0] | banditDescriptions[0] | Бандит ищет наживу. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0002 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[1] | banditDescriptions[1] | Он скрывает лицо, но видно — человек с криминальными привычками. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0003 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[2] | banditDescriptions[2] | Бандит кочует между районами и собирает долги. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0004 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[3] | banditDescriptions[3] | Он действует быстро, но отвлекается на пустяки. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0005 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[4] | banditDescriptions[4] | Бандит угрожает и держит контроль. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0006 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[5] | banditDescriptions[5] | Такие типы живут на грани, но хорошо знают карту. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0007 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[6] | banditDescriptions[6] | Он чувствует слабость и сразу нападает. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0008 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[7] | banditDescriptions[7] | Бандит ищет легкую добычу и уходит при сопротивлении. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0009 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[8] | banditDescriptions[8] | Он молчит и наблюдает вовремя. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0010 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.banditDescriptions[9] | banditDescriptions[9] | Бандит всегда держит с собой оружие или телефон. | — | missing_boomer_mapping | cop_banditDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0011 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[1] | chatReplies[1] | Фиксирую факт, ведём дальше. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0012 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[2] | chatReplies[2] | Я рядом, линия открыта. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0013 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[3] | chatReplies[3] | Контролирую. Детали в журнале. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0014 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[4] | chatReplies[4] | Работаем по цепочке, перехожу к следующей цели. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0015 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[5] | chatReplies[5] | Связь держится, ты не один. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0016 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[6] | chatReplies[6] | Я на рации, движок работает. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0017 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[7] | chatReplies[7] | Понятно, держу отметку в журнале. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0018 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[8] | chatReplies[8] | Хорошо, фиксирую сообщение. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0019 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.chatReplies[9] | chatReplies[9] | Передал коллегам, продолжаю наблюдение. | — | missing_boomer_mapping | cop_chatReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0020 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[0] | cooldownReplies[0] | Я занят расследованием, связь через пару минут. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0021 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[1] | cooldownReplies[1] | Сейчас разгребаю дело, не могу отвечать. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0022 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[2] | cooldownReplies[2] | На линии другой вызов, вернусь позже. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0023 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[3] | cooldownReplies[3] | Пока не могу подключиться, линия занята. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0024 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[4] | cooldownReplies[4] | Занят оформлением протокола, связь позже. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0025 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[5] | cooldownReplies[5] | Сейчас перегружен, сообщение в очереди. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0026 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[6] | cooldownReplies[6] | Я в разборе ситуации, скоро выйду. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0027 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[7] | cooldownReplies[7] | Сейчас не выйдет, сигнал будет позже. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0028 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[8] | cooldownReplies[8] | Прямо сейчас оформляю материалы, вернусь позже. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0029 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.cooldownReplies[9] | cooldownReplies[9] | Я на случке, вернусь через минуту. | — | missing_boomer_mapping | cop_cooldownReplies | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0030 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[1] | intros[1] | Здравствуйте, на связи {cop.fullName}, держу район. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0031 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[2] | intros[2] | Привет, я {cop.fullName}, майор в округе. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0032 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[3] | intros[3] | {cop.fullName} на связи. Фиксирую. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0033 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[4] | intros[4] | Здравствуйте, {cop.fullName} тут, следим за порядком. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0034 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[5] | intros[5] | {cop.fullName} рядом, линия открыта. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0035 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[6] | intros[6] | Добрый день, это {cop.fullName}, держу связь. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0036 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[7] | intros[7] | {cop.fullName} в эфире, детали в журнале. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0037 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[8] | intros[8] | Здравствуйте, я {cop.fullName}, рядом по району. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0038 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.intros[9] | intros[9] | Привет, {cop.fullName} подключился, держим связь. | {cop.fullName} | missing_boomer_mapping | cop_intros | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0039 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[0] | scolds[0] | «Сдать» без фактов — лишняя бумага. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0040 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[1] | scolds[1] | Сигнал без оснований грузит систему. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0041 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[2] | scolds[2] | Паника без доказательств растет быстро. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0042 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[3] | scolds[3] | Такие сигналы тормозят реальные дела. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0043 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[4] | scolds[4] | Деталей мало, «Сдать» шумит. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0044 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[5] | scolds[5] | Без проверки вызов копов шумит. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0045 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[6] | scolds[6] | Ситуация без оснований раздувается. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0046 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[7] | scolds[7] | «Сдать» без фактов попадает в отчет. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0047 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[8] | scolds[8] | Мы не можем реагировать на каждый слух. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0048 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.scolds[9] | scolds[9] | «Сдать» без фактов идет в отчет. | — | missing_boomer_mapping | cop_scolds | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0049 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[0] | thanks[0] | Сдача принята — стало спокойнее. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0050 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[1] | thanks[1] | Отметка принята, район спокойнее. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0051 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[2] | thanks[2] | Район спокойнее. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0052 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[3] | thanks[3] | Его забрали с улиц. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0053 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[4] | thanks[4] | Лицо за решёткой. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0054 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[5] | thanks[5] | Запись отмечена в журнале. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0055 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[6] | thanks[6] | Координация зафиксирована, победа отмечена. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0056 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[7] | thanks[7] | Дом тише. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0057 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[8] | thanks[8] | Вклад заметен. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0058 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.thanks[9] | thanks[9] | Сдача принята — улицы спокойнее. | — | missing_boomer_mapping | cop_thanks | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0059 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[0] | toxicDescriptions[0] | Токсик прячется за оскорблениями. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0060 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[1] | toxicDescriptions[1] | Он пахнет угрозами и ищет повод поссориться. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0061 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[2] | toxicDescriptions[2] | Токсик постоянно ищет способ унизить других. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0062 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[3] | toxicDescriptions[3] | Его слова как удары, но слаба логика. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0063 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[4] | toxicDescriptions[4] | Он живёт за счёт негативных историй и треш-стримов. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0064 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[5] | toxicDescriptions[5] | Токсик искажает правду. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0065 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[6] | toxicDescriptions[6] | Он ходит, обрушивая на всех поток желчи. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0066 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[7] | toxicDescriptions[7] | Токсик громко кричит и ищет власть. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0067 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[8] | toxicDescriptions[8] | Он портит атмосферу, цепляясь за каждого. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0068 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.toxicDescriptions[9] | toxicDescriptions[9] | Токсик отнимает ресурсы силой слова. | — | missing_boomer_mapping | cop_toxicDescriptions | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0069 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[3] | warnings[3] | Твои слова в журнале. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0070 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[4] | warnings[4] | Я рядом и наблюдаю. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0071 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[5] | warnings[5] | Обстановка может сорваться. Дистанция держится. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0072 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[6] | warnings[6] | Детали приняты, реакция будет. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0073 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[7] | warnings[7] | Я тебя слышу, без резких движений. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0074 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[8] | warnings[8] | Патруль уже приближается. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0075 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[9] | warnings[9] | Шум зафиксирован, я фиксирую происходящее. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0076 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.accusationInjection[0] | accusationInjection[0] | Коп: есть заявление. | — | missing_boomer_mapping | npc_event_accusationInjection | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0077 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.accusationInjection[1] | accusationInjection[1] | Мафиози: лишний след остался. | — | missing_boomer_mapping | npc_event_accusationInjection | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0078 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.accusationInjection[2] | accusationInjection[2] | Бандит: кто-то засветился. | — | missing_boomer_mapping | npc_event_accusationInjection | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0079 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.accusationInjection[3] | accusationInjection[3] | Токсик: кто-то сам подставился. | — | missing_boomer_mapping | npc_event_accusationInjection | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0080 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.accusationInjection[4] | accusationInjection[4] | Толпа: разговор пошёл. | — | missing_boomer_mapping | npc_event_accusationInjection | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0081 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.arrest[0] | arrest[0] | Коп: {target} принят в работу. | {target} | missing_boomer_mapping | npc_event_arrest | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0082 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.arrest[1] | arrest[1] | Мафиози: {target} шумно исчез. | {target} | missing_boomer_mapping | npc_event_arrest | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0083 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.arrest[2] | arrest[2] | Бандит: {target} попался. | {target} | missing_boomer_mapping | npc_event_arrest | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0084 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.arrest[3] | arrest[3] | Токсик: {target} договорился. | {target} | missing_boomer_mapping | npc_event_arrest | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0085 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.arrest[4] | arrest[4] | Толпа: {target} ушёл под сирены. | {target} | missing_boomer_mapping | npc_event_arrest | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0086 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.defeat[0] | defeat[0] | Коп: {loser} просел в раунде. | {loser} | missing_boomer_mapping | npc_event_defeat | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0087 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.defeat[1] | defeat[1] | Мафиози: {loser} оставил след. | {loser} | missing_boomer_mapping | npc_event_defeat | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0088 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.defeat[2] | defeat[2] | Бандит: {loser} потерял ход. | {loser} | missing_boomer_mapping | npc_event_defeat | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0089 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.defeat[3] | defeat[3] | Токсик: {loser} не удержал ответ. | {loser} | missing_boomer_mapping | npc_event_defeat | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0090 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.defeat[4] | defeat[4] | Толпа: {loser} не вывез. | {loser} | missing_boomer_mapping | npc_event_defeat | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0091 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.rumor[0] | rumor[0] | Коп: по {target} пошёл сигнал. | {target} | missing_boomer_mapping | npc_event_rumor | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0092 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.rumor[1] | rumor[1] | Мафиози: про {target} пошёл тихий слух. | {target} | missing_boomer_mapping | npc_event_rumor | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0093 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.rumor[2] | rumor[2] | Бандит: про {target} шепчут у выхода. | {target} | missing_boomer_mapping | npc_event_rumor | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0094 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.rumor[3] | rumor[3] | Токсик: {target} снова в разговорах. | {target} | missing_boomer_mapping | npc_event_rumor | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0095 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.rumor[4] | rumor[4] | Толпа: про {target} уже шумит. | {target} | missing_boomer_mapping | npc_event_rumor | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0096 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.victory[0] | victory[0] | Коп: {winner} забрал раунд. | {winner} | missing_boomer_mapping | npc_event_victory | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0097 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.victory[1] | victory[1] | Мафиози: итог ушёл к {winner}. | {winner} | missing_boomer_mapping | npc_event_victory | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0098 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.victory[2] | victory[2] | Бандит: {winner} вышел в плюс. | {winner} | missing_boomer_mapping | npc_event_victory | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0099 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.victory[3] | victory[3] | Токсик: {winner} продавил. | {winner} | missing_boomer_mapping | npc_event_victory | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0100 | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer | Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.zoomer.victory[4] | victory[4] | Толпа: {winner} вывез. | {winner} | missing_boomer_mapping | npc_event_victory | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0101 | Data.START_SCREEN_PROFILE_TEXTS.zoomer | Data.START_SCREEN_PROFILE_TEXTS.zoomer.fantasy_birth_label | fantasy_birth_label | по вайбу я родился в … | — | missing_boomer_mapping | start_screen | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0102 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battle_action_accept | battle_action_accept | Вписаться | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0103 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battle_action_attack | battle_action_attack | Влететь | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0104 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battle_action_decline | battle_action_decline | Скипнуть | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0105 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battle_action_rematch | battle_action_rematch | Ещё раунд | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0106 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battle_action_report | battle_action_report | Сдать копу | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0107 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battle_energy_locked_hint | battle_energy_locked_hint | Нужно ⚡{energy} | {energy} | missing_boomer_mapping | battle_hints | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0108 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battle_invite_title | battle_invite_title | Залёт | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0109 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.battles_empty | battles_empty | Раундов нет. | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0110 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.dm_empty | dm_empty | Личка молчит. | — | missing_boomer_mapping | dm_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0111 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.escape_button_label | escape_button_label | Свалить -{X} 💰 | {X} | missing_boomer_mapping | system_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0112 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_clear | events_clear | ЧИСТКА | — | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0113 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_clear_all | events_clear_all | ЧИСТКА | — | missing_boomer_mapping | events_ui | — | — | duplicate_runtime_alias | Exact runtime alias of GAP_0112. |
| GAP_0114 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_close_extra | events_close_extra | СВЕРНУТЬ | — | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0115 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_done | events_done | OK | — | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0116 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_empty | events_empty | Пока тихо. | — | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0117 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_header | events_header | Движ | — | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0118 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_left | events_left | ⏳{sec} | {sec} | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0119 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_panel_hint | events_panel_hint | Тут всплывает, кто опять устроил драму. | — | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0120 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.events_title | events_title | EVENTS {count} | {count} | missing_boomer_mapping | events_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0121 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.tie_chat_end_draw | tie_chat_end_draw | ТОЛПА: DRAW {aVotes}:{bVotes} | {aVotes}, {bVotes} | missing_boomer_mapping | crowd_controls | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0122 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.tie_chat_end_winner | tie_chat_end_winner | ТОЛПА: 🏆 {name} {aVotes}:{bVotes} | {name}, {aVotes}, {bVotes} | missing_boomer_mapping | crowd_controls | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0123 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.tie_chat_start | tie_chat_start | ТОЛПА - ВПИСЫВАЙСЯ | — | missing_boomer_mapping | crowd_controls | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0124 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.tie_end_draw | tie_end_draw | DRAW {aVotes}:{bVotes} | {aVotes}, {bVotes} | missing_boomer_mapping | crowd_controls | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0125 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.tie_end_winner | tie_end_winner | 🏆 {name} {aVotes}:{bVotes} | {name}, {aVotes}, {bVotes} | missing_boomer_mapping | crowd_controls | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0126 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.tie_timer | tie_timer | ⏳{sec} | {sec} | missing_boomer_mapping | crowd_controls | — | — | duplicate_runtime_alias | Exact runtime alias of GAP_0118. |
| GAP_0127 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.vote_already | vote_already | ✓ УЖЕ | — | missing_boomer_mapping | crowd_controls | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0128 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.vote_fail | vote_fail | ✕ НЕТ | — | missing_boomer_mapping | crowd_controls | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0129 | Data.COP_TEMPLATES | Data.COP_TEMPLATES.warnings[2] | warnings[2] | Ситуацию держу. | — | missing_boomer_mapping | cop_warnings | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0130 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.conflict_win | conflict_win | Победа в конфликте. | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0131 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.conflict_loss | conflict_loss | Поражение в конфликте. | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |
| GAP_0132 | Data.TEXTS.zoomer | Data.TEXTS.zoomer.conflict_draw | conflict_draw | Ничья в конфликте. | — | missing_boomer_mapping | battle_ui | — | — | new_boomer_target_required | Copy decision required. |

## Integrity

- no invented target copy: true
- no runtime copy changes: true
- no allowed lexicon changes: true
- no taboo list changes: true
- no lexical mapping changes: true
- no Step 3.4 coverage changes: true
