# K2 — Social battle spectator and crowd-vote API v1

STATUS: CONTRACT_DRAFT_FOR_REVIEW. Design only. No runtime, UI or server change is made or authorized by this file.
EXTENDS: K1 `contracts/social-battle-api-v1.md` (PR #472; not merged at time of writing). K2 must be re-checked after K1 merges.
BASELINE: `main@d4dc39f55c6dd771b470bff08fd2c0c00a95b913`, MEMORY_REV `2026-11-28-K1-C1-FIXES-MODEL-ROUTING-R315`.
CANON SOURCES: R294 (public battle outcomes), R293, Chat04.0 PASS_DESIGN §2–§3, Chat01 §4–§5,
Tactical V1 design §17 (V6) and §19 (V11), Chat05A as merged in #460, Chat05B draft #461.

Server owner: Codex (gameplay-server, single writer, R292). Client owner: Claude Code.
Privacy and voting are high-risk: this contract needs independent critical review before any runtime work.

## 0. What exists today (merged code, checked 2026-11-28)

- `POST /v1/battles/{id}/votes` with body exactly `{"choice":"A"|"B"}` → `{voteId, choice, replayed}`.
  Auth is a per-battle spectator capability token issued by an admin route. Same choice replays;
  a different choice → `409 BALLOT_IMMUTABLE`. Participants cannot receive a capability or vote.
- One vote per battle (`voteId = "sv1_" + sha256(...battleId)`), opened at reveal only when the trigger is
  `DRAW`, `AUTHORED_TEXT` or `BOTH`. No closing, no deadline and no tally are implemented in `main`;
  deadlines, odd quorum and NPC fill are in the unmerged 05B draft #461.
- No spectator read route and no vote-state read route exist. The only battle read is participant-only.

## 1. Who is a spectator

- Any actor with a valid K1 signed session who is **not** a participant of the battle.
- K2 replaces the admin-issued capability as the client-facing credential: the server derives the voter
  from the K1 session (Design B boundary), maps `actorId → personId` internally and keeps the existing
  one-ballot-per-person rules. Capabilities may stay as an internal mechanism; the client never sees them.
- A participant reading a battle always gets the K1 participant projection; a spectator always gets the
  spectator projection (§3). The server decides by session, never by a client flag.

## 2. Which battles a spectator can see

- Only **public** battles (R294). A non-public battle is visible only to its authorized recipients and,
  to anyone else, is indistinguishable from a missing battle (same `404 NOT_FOUND`, no counts, no cursor gaps).
- OPEN-1 (owner): is every battle between invited players public by default in the first goal, or does
  the challenger choose? Until decided, the server treats battles as non-public and K2 routes return nothing.

## 3. Spectator projection (R294)

Shown only fields the server has confirmed and allows. Never: actorIds, personIds, voteId, capability data,
individual ballots (including counts per side), hidden tactics, private messages, internal evidence,
raw tallies or scores (see OPEN-2), resolution numbers.

```text
schemaVersion, battleId (opaque public entity id), projectionVersion, rulesVersion, phase,
participantNames {A, B}            // confirmed current game names
// before reveal: nothing about choices, texts, colors, types or per-side commit state
// after reveal:
dialogue {A:{attack, defense}, B:{attack, defense}}   // texts only, see OPEN-3 for colors
mechanicalOutcome  A_WIN | B_WIN | DRAW               // a draw has no winner
vote { status: none | open | closed, deadlineAt?, myBallot?: A | B }
// after the vote closes (05B):
socialOutcome      A_SUPPORT | B_SUPPORT
recognizedOutcome  A_WIN | B_WIN | DRAW
narrative?         // safe editorial text from 04.5 (R296), when available
```

- `mechanicalOutcome`, `socialOutcome` and `recognizedOutcome` are separate fields and are never derived
  from one another in the client (R294, Chat01 §5).
- `myBallot` is returned only to the voter who cast it. Nobody else learns how anyone voted.
- `phase` before reveal is coarse (`waiting` / `revealed` / `final` / `expired`); whether one side has
  already committed is not shown to spectators.

## 4. Routes (proposed; all require a K1 signed session)

| Route | Request → response |
|---|---|
| `GET /v1/battles?scope=public&cursor=` | → `{battles:[{battleId, phase, participantNames, voteStatus}], nextCursor?}`; public battles the caller is not a participant of, newest first |
| `GET /v1/battles/{battleId}` | participant → K1 projection; spectator of a public battle → §3 projection; else `404` |
| `POST /v1/battles/{battleId}/votes` | existing body `{"choice":"A"|"B"}` → `{choice, replayed}` (voteId is not returned to the client) |

Vote rules (existing 05A rules, unchanged):
- One immutable ballot per person per vote. Same choice again → original receipt, `replayed: true`.
  Different choice → `409 BALLOT_IMMUTABLE`. Every HTTP attempt is freshly signed (K1 §1.2).
- Participants → `409 PARTICIPANT_CANNOT_VOTE`. No open vote → `409 VOTE_NOT_OPEN`. Closed → `409 VOTE_CLOSED`.
- The ballot insert, nonce consumption and session/revoke re-check happen in one D1 transaction (K1 §0, §1.2).
- `A`/`B` are battle sides; the UI labels them with participant names only.

New error codes for the K1 error list: `BALLOT_IMMUTABLE`, `PARTICIPANT_CANNOT_VOTE`, `VOTE_NOT_OPEN`, `VOTE_CLOSED`.

## 5. Client UX (first version, inside the temporary «Споры» panel; unified feed later)

- A second list «Бои в городе» under «Бои с людьми»: opponent names and a short status
  («Идёт бой», «Толпа решает», «Итог признан», «Время вышло»).
- An expanded spectator card keeps the V5 chess order of the four replies after reveal, plates neutral
  (OPEN-3), names and «Атака»/«Защита» labels. Before reveal: «Бой идёт. Реплики откроются после ходов обоих».
- Under the dialogue: mechanical line («Механически: победа Ани» / «Механически: ничья»), then, when the
  vote is open, two buttons «Поддержать Аню» / «Поддержать Борю». After voting: «Твой голос учтён: за Аню»,
  buttons gone; the choice is never shown to anyone else.
- After closing: «Толпа поддержала Аню» and «Признанный итог: …» as separate lines (no score, OPEN-2).
- Participants see the same crowd status in their own card but no vote buttons.
- All text through `textContent`; the projection is rendered as given, no client-side outcome logic.

## 6. Open owner decisions

- OPEN-1: default visibility of player battles (public / challenger chooses / private).
- OPEN-2: Tactical V1 §17 (V6) shows the final score (e.g. «4:3 из 7», humans vs NPC); R294 forbids
  unapproved raw tallies/scores. Until the owner explicitly allows a score field, K2 shows only the outcome.
- OPEN-3: after reveal, do spectators see the reply colors? R294 forbids hidden tactics; colors were hidden
  choices. K2 default: texts only, neutral plates, no tactic types or numbers.
- OPEN-4: vote eligibility beyond "invited, not a participant" (anti-farm, newcomer limits) — Chat09B.

## 7. Server work required (Codex, after K1 and in R292 order)

1. Session-based voter identity (K1 session → person), replacing client-held spectator capabilities.
2. Battle visibility flag per OPEN-1 and the `scope=public` list with opaque cursors.
3. Spectator projection with field-level allowlist (§3); participant projection unchanged.
4. Vote state read (`status`, `deadlineAt`, `myBallot`) and, after 05B closes a vote, the public outcomes.
5. New error codes in the K1 schema; K2 schema definitions added to `contracts/social-battle-api-v1.schema.json`
   after K1 merges (kept out of this draft to avoid two diverging schema copies).

## 8. Required negative tests (before any runtime claim)

- Spectator payloads (network, not DOM) never contain actorIds, personIds, voteId, ballots of others,
  counts, tactic types, resolution numbers, or anything before reveal.
- A non-public battle and a missing battle give identical responses to a non-recipient.
- A participant cannot vote; a second different ballot conflicts; a replayed ballot does not double count;
  concurrent duplicate ballots produce one row.
- A revoked session cannot vote even if the ballot request was signed before revoke.
- Reload/second device shows the same `myBallot`; another viewer never sees it.

## 9. Client development before the server

The client is built against the test-only mock (`tools/mock_social_battle_server.mjs`, PR C1) extended with
these routes, behind the same default-off flag. Mock results are rule evidence only, not D1 evidence.
Runtime client changes start only after K1/C1 pass re-review and this contract passes critical review.
