# CHAT09B-V123-CANCEL-ANTIFARM-IMPLEMENT

Standalone executable synthetic product fixtures for «Асинхрония». Node 22, no external packages.

Run: `node --test acceptance.test.mjs`

Scope: no repository, no Worker, no D1, no ledger settlement, no actual server issuer, no actual terminal receipt verification. `trustedTerminalReceipt` is a **test oracle injection**, not an implementation of authorization. The fixture only tests downstream product consequences *assuming* a valid canonical terminal receipt. A real system must independently prove issuer, trigger, battle/participant identity, global uniqueness, rollback continuity, atomic CAS and exact release of both original reservations.

Outcomes are synthetic labels, not real HTTP statuses. No new cooldown duration, penalty, REP, points, reward, money, rematch or rank policy. Post-release invitation returns RECHECK_ADMISSION_REQUIRED, never auto-ALLOW. Final branch does not simulate real ledger settlement.

Inputs grounded in Notion: R270 cancellation target; Inbox Chat09B V118, Chat09A V121, Chat05C V115, Chat10B V117 AO08. Repository main f256228a2a57e5b8144a42a72a240a7455a76417, PR455 Draft c954283cc3512e13685793318c4ff4ef36587ed6. This artifact does not claim real server implementation or production acceptance.
