# Chat04.4 - isolated battle card fixtures

STATUS: SYNTHETIC PROTOTYPE, NOT INTEGRATED OR LIVE.

Open `chat04_4_battle_cards_preview.html` in an HTTP static server, e.g. `python3 -m http.server 8000` from the repository root, then visit `/tools/chat04_4_battle_cards_preview.html`. All sample people, texts, results and roles are fictitious. Run `node --test tools/test_chat04_4_battle_cards.mjs` for deterministic pure-logic checks.

The optional browser regression covers the first-click outside-editor bug: `python3 tools/test_chat04_4_battle_cards_browser.py` (requires Python `playwright` plus installed system Chromium). It checks desktop 1440x900, touch emulation at 393x852 and 320x568, single-tap navigation, committing edited text, switching directly between editors, Escape cancellation, role-select changes and horizontal overflow. This is automated Chromium, **not physical iPhone Safari**.

This is *not* a participant authentication system, combat calculator, Chat05 vote service, valid spectator API, server commit or safe storage for real user data. The synthetic in-page source holds both sides' fixture data; real secrecy requires a server-authorized redacted projection before delivery. `projectBattle` demonstrates the expected payload filtering and unit tests assert it, but client-controlled role selection and `sessionStorage` provide no security. `sessionStorage` retains test-only edits/expanded card/view across reload; never use this design to persist actual confidential battle tactics.

The visible `mechanicalOutcome` and explanation are fixed scenario outputs, never recalculated from editable test tactics. A single confirmed mock commit reveals all four lines only after both sides are confirmed. No vote triggering, recognition, rewards or NPC judgements exist here. The viewer-switching test control simulates alternative server-authorized viewpoints only.

### Explicit scope and next gate

Own only these new `tools/chat04_4_*` files. Read-only dependencies: canonical Notion plan Chat04.4, Chat01 tactical V1, Chat04.0 projection/identity contract and Chat03 local lifecycle. Do not touch `AsyncScene/Web/**`, `docs/**`, `gameplay-server/**`, shared UI, CSS, boot/registry, Chart04.1 PR #453 or mobile PR #431. Real participant/spectator projection, battle authorization, cross-view server delivery, cursor/sync and gameplay authoritative results must come from approved server contracts. After Chat04.1 readiness and Chat03 projection, separately authorize serial UI/source+deployed mirror integration and independent E2E Safari/desktop tests. Chat05 genuine runtime is additionally required for Chat04.5 vote/narrative results.

Fixture validation is not iPhone Safari acceptance, actual runtime privacy, multi-device reload, or integrated PASS. No Cloudflare/D1/Pages deployment, merge or main write is authorized by this isolated prototype.
