# UI_PROFILE_ALPHA_NEW_FEATURES

- Alpha inherits from Zoomer.
- Alpha covers current and planned feature surfaces.
- Alpha is not limited to start screen or old UI.
- Alpha covers battle, crowd, report, rematch, escape, training, bank, P2P, NPC vs NPC, and system toasts.
- Alpha keeps feature copy short, direct, and visual.
- Alpha keeps command or state first.
- Alpha removes explanation when action is clear.
- Alpha preserves template variables exactly.
- Alpha does not become dry instruction text.
- Alpha does not use baby talk, fake hype, over-memeing, or tutorial voice.
- This step is spec-only and does not activate runtime Alpha copy.
- Codex must not invent Alpha phrases.
- Required feature coverage:
  - battle
  - crowd
  - report
  - rematch
  - escape
  - training
  - bank
  - P2P
  - NPC vs NPC
  - system toasts
- Anchor pairs:
```text
feature: battle
z: "Баттл с {oppName}: {text}."
alpha: "{oppName}: {text}."
feature: crowd
z: "Толпа: {name} {aVotes}:{bVotes}."
alpha: "{name}: {aVotes}:{bVotes}."
feature: report
z: "Сдать {name}: +2💰."
alpha: "{name}: +2💰."
feature: rematch
z: "{name} зовёт на реванш."
alpha: "{name}: реванш."
feature: escape
z: "Свалить за 1💰."
alpha: "Выход: 1💰."
feature: training
z: "Аргумент: {teacher} → {student}."
alpha: "{teacher} → {student}: аргумент."
feature: bank
z: "лимит ⭐ на этой неделе. Пополните 💰, чтобы конвертировать в ⭐."
alpha: "Лимит ⭐. Пополни 💰."
feature: P2P
z: "{target}: +{amount}💰 тебе."
alpha: "От {target}: +{amount}💰."
feature: NPC vs NPC
z: "{attackerName} [{attackerInf}] бросил вызов."
alpha: "{attackerName} [{attackerInf}]: вызов."
feature: system toasts
z: "Не хватает 💰."
alpha: "Мало 💰."
```
