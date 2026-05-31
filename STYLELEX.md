# StyleLex — Step 2 [0] scope and artifacts

## Purpose

StyleLex is the single future style contract for all player-facing text in AsyncScene.
It will become the shared source of truth for how the game speaks to the player across product UI, character text, system messages, support hints, and error states.

StyleLex exists to keep text consistent before separate surfaces grow their own local tone rules.
The system speaks to the player as a partner, not as a teacher.
The default addressing is `ты`.
Default text must be short, calm, direct, not official, not meme-like, and not teen slang.

## Covered surfaces

StyleLex covers every player-facing text surface listed below:

- UI: buttons, labels, menus, panels, empty states, confirmations, status text.
- NPC: public chat, direct messages, battle lines, event reactions, refusal/acceptance text.
- Dev-card: player-visible developer cards, debug-facing cards that can be shown to testers, diagnostic copy intended to be read by humans.
- Toasts: temporary success, warning, info, and blocking messages.
- Hints: onboarding hints, contextual hints, next-step prompts, soft explanations.
- Errors: validation errors, unavailable actions, failed operations, connection/state/security messages.

If a string can be read by a player or tester as game/product copy, it is in StyleLex scope.

## Required future artifacts

Step 2 must produce these future StyleLex artifacts before StyleLex can be used as an implementation gate:

1. Allowed dictionary: approved words, short phrases, action verbs, and surface-specific wording patterns.
2. Forbidden/taboo list: banned words, tone patterns, slang, officialese, memes, sarcasm, patronizing phrases, and any wording that blames or lectures the player.
3. Tone rules: concise rules for partner-like communication, calm directness, emotional restraint, and surface-specific tone exceptions.
4. Phrase length rules: maximum preferred phrase lengths for UI, toasts, hints, NPC lines, dev-card text, and errors.
5. Addressing rules: when and how to use `ты`, how to avoid mixed addressing, and how NPC voice may differ without breaking player-facing consistency.

These artifacts are required future documentation artifacts only; they are not runtime APIs in Step 2 [0].

## Explicit non-goal for Step 2 [0]

Step 2 [0] does not implement runtime logic.
It does not add validators, linters, dictionaries in code, text replacement, UI wiring, NPC generation changes, or automated enforcement.
It only defines the StyleLex scope and the documentation artifacts that later steps must create.

## PASS/FAIL criteria for Step 2 [0]

PASS if all of the following are true:

- Documentation clearly defines StyleLex as the single future style contract for all player-facing text.
- Documentation lists all covered surfaces: UI, NPC, dev-card, toasts, hints, errors.
- Documentation lists all required future artifacts: allowed dictionary, forbidden/taboo list, tone rules, phrase length rules, addressing rules.
- Documentation explicitly states that Step 2 [0] has no runtime implementation.
- `TASKS.md` and `PROJECT_MEMORY.md` log the Step 2 [0] result regardless of PASS/FAIL.

FAIL if any of the following are true:

- Documentation describes style only vaguely and does not define a shared contract.
- Any required covered surface is missing: UI, NPC, dev-card, toasts, hints, or errors.
- Any required future artifact is missing: allowed dictionary, forbidden/taboo list, tone rules, phrase length rules, or addressing rules.
- Documentation implies runtime implementation, validators, automation, or text-system logic was completed in Step 2 [0].
- `TASKS.md` or `PROJECT_MEMORY.md` is not updated with the Step 2 [0] log.
