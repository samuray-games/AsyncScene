# K1 — Social battle API v1

STATUS: CONTRACT_DRAFT_FOR_REVIEW. Not a runtime, security or acceptance claim.
SCOPE: first game goal — two invited players fight one `tactical_v1` battle inside the Asynchronia UI.
BASELINE: `main@d4dc39f55c6dd771b470bff08fd2c0c00a95b913`, MEMORY_REV `2026-11-28-K1-C1-REVIEW-C2-RECOVERY-R314`.
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
  - Each request carries headers `Session-Id`, `Signature-Nonce`, `Signature-Timestamp` and `Signature`.
    Signature scheme `K1-SIG-V1`: ECDSA P-256 / SHA-256, raw `r||s` in base64url, over the UTF-8 string
    `["K1-SIG-V1", method, path, hex(sha256(body)), nonce, timestamp, sessionId].join("\n")`.
    `path` includes the query string; an empty body hashes as the empty string.
  - The nonce is client-generated (16 random bytes, base64url, 16–64 chars `[A-Za-z0-9_-]`);
    `timestamp` is client epoch ms as decimal digits. No server-issued nonce round-trip.

### 1.2 Signature acceptance, nonce consumption and retry (normative)

- Timestamp acceptance: the request is accepted only if `|serverNow − timestamp| ≤ SKEW`.
  SKEW is a server constant (mock: 120 s; production value fixed with X1a). Otherwise `401 UNAUTHORIZED`.
- Nonce retention: an accepted nonce is stored per session until `timestamp + SKEW` has passed, i.e. for the
  whole window in which that signature could still be accepted. After that the same request fails the
  timestamp rule, so pruning cannot reopen a replay.
- Atomic consumption: the nonce is consumed by `INSERT … (sessionId, nonce, expiresAt)` under
  `UNIQUE(sessionId, nonce)` in the authoritative D1, inside the same transaction/batch as the request's
  security re-check (§0) and its effect. A concurrent duplicate fails the UNIQUE constraint and gets
  `401 UNAUTHORIZED` with no effect. A request whose effect is rolled back also rolls back its nonce.
- Order: parse → timestamp rule → verify signature against the session's device key and epochs →
  one transaction {consume nonce, re-check revoke/epochs, apply effect or idempotent replay}.
  A bad signature consumes nothing.
- Retry: every HTTP attempt is signed again with a new nonce and timestamp. Idempotency comes only from
  `clientOperationId` / `commandId` (§4.2), never from reusing a nonce or signature.
- Evidence boundary: the test mock implements these rules in memory and its tests show the rule set,
  not native D1 atomicity. Native D1 concurrency evidence is a separate server deliverable (X1a/X1b).

### 1.3 Client drafts

- Unsent drafts live only in `sessionStorage` of one tab and are scoped to
  `(apiOrigin, actorId, selfSide, battleId)`. Drafts of any other scope are deleted as soon as the current
  actor is known, and every session change or logout in the tab deletes all drafts.
- Any change to a draft discards its pending `commandId`; a `commandId` is retried only with the exact
  payload it was first sent with.
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

All routes require a signed session (§1). A foreign or unknown battle returns the same 404 as a missing one.

**Wire schema.** `contracts/social-battle-api-v1.schema.json` is the single normative definition of every
request and response body below (camelCase field names; database column names never appear on the wire;
unknown fields are rejected). Client, mock and gameplay-server validate against it. If this text and the
schema disagree, that is a contract bug to fix in both.

| Route | Request → response |
|---|---|
| `GET /v1/me` | → actorId, displayName, progress {rep, points, wins}, `allowedColors`, role |
| `GET /v1/players?scope=challengeable` | → `{players:[{actorId, displayName}]}`: invited players the caller may challenge (never self, never revoked) |
| `POST /v1/battles` | `{opponentActorId, clientOperationId}` → `{battleId, replayed}`; reserves both persons (§4.3); idempotent (§4.2) |
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
- Commit is irreversible and idempotent (§4.2). Response `{code, replayed, view}`.
- `role` is redundant with the server identity and will be derived server-side; a mismatch is rejected.

### 4.1 Ready text offers

`readyTextOffers.offers[]` = `{channel, offerId, text, tacticType}`, own side only,
`tacticType ∈ {N,P,T}` for attack and `{S,C,G}` for defense (Tactical V1 §17 V8: type selector and ↻).
Required server change (X1b): add `tacticType`, and map the current raw row output
(`offer_id`, `phrase_text`) to these camelCase names, matching `committedTexts` (`offerId`, `text`).

### 4.2 Idempotency

- Scope: `(actorId, clientOperationId)` for create; `(battleId, side, commandId)` for commit.
- Fingerprint: SHA-256 of canonical JSON (sorted keys, no whitespace) of the whole effect-relevant body —
  create: `{opponentActorId}`; commit: `{selection, textIntent}` (every field, including `finalText`).
- Same scope + same fingerprint → the original receipt, `replayed: true`, no new effect.
- Same scope + different fingerprint → `409 IDEMPOTENCY_CONFLICT`, no effect.
- A new `commandId` after an accepted commit → `409 COMMIT_IMMUTABLE`.
- The receipt and fingerprint are written in the same transaction as the effect (§1.2).

### 4.3 Person-wide ACTIVE reservation

- A person has at most one ACTIVE battle: phases `created`, `waiting`, `committed`, `revealed`.
  The reservation is released only at a terminal phase (`final`, `expired`), Chat09A rule.
- Create checks and reserves both persons in the same transaction as the battle insert.
  If either is ACTIVE → `409 RESERVATION_CONFLICT`; the code does not say which person.
- A revealed battle waiting for the crowd stays ACTIVE until 05B closes the vote or the battle ends.
  Until 05B exists, both persons cannot start another battle after a crowd-triggering reveal until the
  battle ends: known limitation of the first goal, needs the 05B close or an owner decision.

### 4.4 Errors

Body `{error}` with one of: `UNAUTHORIZED` (401), `INVALID_JSON`, `INVALID_INPUT` (400), `NOT_FOUND` (404),
`METHOD_NOT_ALLOWED` (405), `COLOR_NOT_ALLOWED`, `ROLE_MISMATCH`, `UNKNOWN_TEXT_OFFER`, `INVALID_TEXT_INTENT`,
`IDEMPOTENCY_CONFLICT`, `RESERVATION_CONFLICT`, `COMMIT_IMMUTABLE`, `BATTLE_EXPIRED`, `COMMIT_REJECTED` (409/400).
No error reveals another person's battle, reservation side or existence.

## 5. Participant projection

Extends the existing lifecycle `getPublicView` + `participantView` output:

```text
schemaVersion, battleId, version, rulesVersion, phase, deadlineAt,
participants {self, opponent}            // actorIds
participantNames {self, opponent}        // current display names, added by the server
selfSide                                 // "A" or "B", so the client can read selections/committedTexts
selfCommitted, opponentCommitted, revealed,
readyTextOffers {catalogVersion, normalizationVersion, offers[]}   // before reveal, own side only (§4.1)
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
Schema checks (`tools/test_social_contract.mjs`, in PR C1) validate the client's own request bodies against the
schema independently of the mock; mock results are evidence of the rule set only, not of native D1 behaviour.
