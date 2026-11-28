# K1 — Social battle API v1

STATUS: CONTRACT_DRAFT_FOR_REVIEW. Not a runtime, security or acceptance claim.
SCOPE: first game goal — two invited players fight one `tactical_v1` battle inside the Asynchronia UI.
BASELINE: `main@d4dc39f55c6dd771b470bff08fd2c0c00a95b913`, MEMORY_REV `2026-11-28-OWNER-CLAUDE-CODEX-TRANSITION-R311`.
CANON SOURCES: Chat01 SPEC `2026-10-16-SOCIAL-COMBAT-CHAT01-CONTRACT-V1`; Tactical V1 design §15–§19 (V5–V11);
Chat04.0 PASS_DESIGN V1 and its 31.10 addendum; Design B (R270); R292–R298; R302; R56.

Server owner: Codex (gameplay-server, single writer, R292). Client owner: Claude Code (`AsyncScene/Web` + `docs` mirror).
Changes to this contract need review by the other implementer; security-relevant changes need critical review.

## 0. Authority model (Design B)

- One physically authoritative, serializable SQL boundary — the gameplay D1 — owns actor, session,
  device binding, consent, security epochs, revoke, person-wide ACTIVE battle reservations,
  battle admission, commits, receipts/outbox and the ledger.
- Every protected operation re-checks actor/session epochs and revoke state inside the same
  transaction as its effect. A revoke committed earlier makes the operation fail.
- AUTH_DB (the PR #463 local model) only stores passkey credentials and verifies WebAuthn assertions.
  It is never a positive allow authority. Its only output is a single-use, short-lived login proof
  that the authoritative boundary consumes once to create a session.
- A `verifySession` call over a Service Binding is not authorization for a game operation.
- PR #463 is an existing local model, not runtime authorization. D1 + AUTH_DB topology,
  real-browser passkeys and the external anti-rollback witness remain OPEN.

## 1. Identity and session

- `actorId`: permanent, server-created, opaque. `displayName` is changeable and never an auth key.
- Registration: owner-issued invite → WebAuthn passkey registration → `actorId`.
- Session: device-bound proof of possession. No bearer token is stored at rest.
  - The client creates an ECDSA P-256 key pair with `extractable: false` and keeps the private
    `CryptoKey` in IndexedDB.
  - The device public key hash is part of the WebAuthn challenge, binding the passkey assertion to it.
  - Each request carries `Session-Id` and a signature over
    `method | path | sha256(body) | serverNonce | timestamp`. The server rejects replay, skew and wrong keys.
- Limits: a non-extractable key stops key theft, NOT XSS. Script running in the page can still ask
  the browser to sign requests while the page is open. XSS prevention is therefore mandatory:
  strict CSP (`script-src` self + hashes, no third-party scripts, `connect-src` limited to API origins),
  player text rendered only as text (`textContent`), no `innerHTML` with player or server text.
- High-risk actions (add device, recovery, revoke-all) require a fresh passkey assertion.
- Revoke: bump the session epoch (one device) or actor epoch (all devices) in the authoritative D1.
- Recovery: a second passkey, or an owner-issued audited recovery invite that bumps the actor epoch.
  No email OTP (not approved).
- OPEN owner decisions: TTLs for invites, sessions and recovery.
- Test-only auth stubs exist only under test directories. The Worker refuses to start when a stub
  flag or binding is present outside a test environment.

## 2. Entities

| Entity | Key fields | Authority |
|---|---|---|
| Player | actorId, displayName, profileVersion | gameplay D1 (Design B boundary) |
| PlayerProgress | actorId, rep, points, wins, influence, role | gameplay D1; one per player, no second balance |
| Battle | battleId, rulesVersion=`tactical_v1`, version, phase | gameplay D1 (Chat03 lifecycle) |
| Vote | voteId, battleId, voteVersion, phase | gameplay D1 (Chat05) |
| LedgerEntry | entryId, source, receiver, amount, reason, related event | gameplay D1 |

UI projection key: `(kind, entityId)` + `projectionVersion` (Chat04.0). battleId and voteId are never messageId aliases.

## 3. Colors (server-validated, canon only)

- Scale and roles (Chat01 §2): `y=2` rank 0, `o=3` rank 1, `r=4` rank 2. `k` is allowed only for a
  confirmed `role=mafia`; `k` for anyone else → `INVALID_INPUT`, no fallback.
- Each participant chooses independent `attackColor` and `defenseColor` within `allowedColors`.
- `allowedColors` is computed by the server from authoritative progress: `y` always; `o` from the
  existing `strong` influence threshold; `r` from the existing `power` threshold (current
  `getProgression()` values, unchanged); `k` only by mafia role. The legacy influence-based black
  unlock does not apply to `tactical_v1`.
- Opponent colors, types and texts stay hidden (grey) until both commits.

## 4. Routes

All routes require a signed session (§1). Errors are typed. A foreign or unknown battle returns
the same 404 as a missing one.

| Route | Request → response |
|---|---|
| `GET /v1/me` | → actorId, displayName, progress {rep, points, wins}, `allowedColors`, role |
| `POST /v1/battles` | `{opponentActorId, clientOperationId}` → `{battleId}`; atomically reserves both persons; same operation replays the same receipt |
| `GET /v1/battles?scope=mine&cursor=` | → own battle summaries + `awaitingMyAction` count («Ваш ход: N») |
| `GET /v1/battles/{battleId}` | → participant projection (§5); spectator projection comes later (Chat04.4/03) |
| `POST /v1/battles/{battleId}/commit` | existing body (below) → receipt |

Commit body keeps the existing gameplay-server shape:

```json
{
  "commandId": "<uuid>",
  "selection": { "attackColor": "y", "defenseColor": "y", "attackType": "N", "defenseType": "S", "role": "<server-known role>" },
  "textIntent": {
    "attack":  { "offerId": "<id>", "finalText": "<optional edited text>" },
    "defense": { "offerId": "<id>" }
  }
}
```

- `attackType ∈ {N,P,T}`, `defenseType ∈ {S,C,G}`; colors ∈ `allowedColors`.
- `finalText` omitted = ready phrase as is. Editing never changes type, color or numbers.
- `wordsEdited` is computed by the server (existing canonical word signature).
- Commit is irreversible. Same `commandId` + same body replays the receipt; a different body → conflict.
- `role` is redundant with the server identity and will be derived server-side; a mismatch is rejected.

Required additive server change: ready offers need a tactic type so the UI type selector and ↻
can swap phrases of the chosen type (Tactical V1 §17 V8). Offer shape becomes
`{side, channel, offerId, text, tacticType}` with `tacticType ∈ {N,P,T}` for attack and `{S,C,G}` for defense.

## 5. Participant projection

Extends the existing lifecycle `getPublicView` + `participantView` output:

```text
schemaVersion, battleId, version, rulesVersion, phase, deadlineAt,
participants {self, opponent}            // actorIds; display names added by the server
selfCommitted, opponentCommitted, revealed,
readyTextOffers {catalogVersion, normalizationVersion, offers[]}   // before reveal, own side only
// after reveal only:
selections {A, B}, committedTexts {A, B},
mechanicalOutcome, resolution, socialOutcome, recognizedOutcome, socialVoteTrigger
```

The client never receives opponent selections or texts before `revealed`.

## 6. Reveal and outcomes (one step, V11)

After both commits a single projection shows the four replies in chess order (my attack left-top,
opponent defense right, opponent attack right, my defense left-bottom), real colors,
`mechanicalOutcome`, a human explanation and the social stage, on one screen.

- `mechanicalOutcome ∈ {A_WIN, B_WIN, DRAW}` — immutable, never overwritten by voting.
- `socialOutcome ∈ {A_SUPPORT, B_SUPPORT, PENDING, NONE}`.
- `recognizedOutcome ∈ {A_WIN, B_WIN, DRAW, PENDING}`; without a vote it equals the mechanical outcome.
- Vote trigger (Chat01 §4): DRAW, or a real manual word change. One vote at most.
- Close/lead gate (Chat01 §5) decides whether the crowd can change `recognizedOutcome`.
- The first goal shows the social stage as `PENDING`/`NONE`; quorum, timeout and NPC judges
  (05B/05C/06) are the next milestone.

## 7. Economy

- Chat01 §6: mechanical victory, crowd support and recognized winner do NOT automatically apply
  legacy REP, money, wins or points transfers to `tactical_v1`.
- Which settlements `tactical_v1` uses is an OPEN owner decision required before X1c.
  Until then no tactical battle writes economy effects.
- When decided: one authoritative balance per player in the gameplay D1; every entry records
  source, receiver, amount, reason and related event; exactly once per battle/vote.
- Legacy localStorage progress is never a source of server credits. Migration rules: separate decision.

## 8. Privacy

- Before reveal the opponent's colors, types and texts never leave the server.
- The participant projection is served only to the two bound actors.
- No foreign battle existence leaks through errors, counts or cursors.
- R294 governs any later public projection.

## 9. Migrations

- 0011 is used by PR #461 (05B); 0012 is the existing 05B candidate.
- New K1 server migrations start at 0013 or later. Numbers are fixed by the single server writer
  at merge time, in this order: #461 (0011/0012) → identity/session/progress → ledger.

## 10. Client development before the server

Until the server routes exist, the client is developed and tested against
`tools/mock_social_battle_server.mjs`, a synthetic test-only implementation of this contract.
It runs only in local tests and is never deployed or referenced by the game.
