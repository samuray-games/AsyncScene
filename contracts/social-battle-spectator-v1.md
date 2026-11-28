# K2 — Social battle spectator and crowd-vote API v1

STATUS: CONTRACT_DRAFT_FOR_REVIEW. Design only. No runtime, UI or server change is made or authorized by this file.
EXTENDS: K1 `contracts/social-battle-api-v1.md` (PR #472; not merged at time of writing). K2 must be re-checked after K1 merges.
BASELINE: `main@d4dc39f55c6dd771b470bff08fd2c0c00a95b913`, MEMORY_REV `2026-11-28-OWNER-PUBLIC-BATTLE-DISPLAY-K2-R316`.
CANON SOURCES: R316 (public battle display), R294, R293, R295/R296, Chat04.0 PASS_DESIGN §2–§3,
Chat01 §4–§5, Tactical V1 design §16–§19 (V5–V11), Chat05A as merged in #460, Chat05B draft #461
(`gameplay-server/CHAT05B_CONTRACT.md`), Chat09B V123–V129 offline models (#478).

Server owner: Codex (gameplay-server, single writer, R292). Client owner: Claude Code.
Privacy and voting are high-risk: this contract needs independent critical review before any runtime work.

## 0. What exists today (checked 2026-11-28)

- `main` (05A, #460): `POST /v1/battles/{id}/votes` with body exactly `{"choice":"A"|"B"}` → `{voteId, choice, replayed}`.
  Auth is a per-battle spectator capability issued by an admin route. Same choice replays; a different choice →
  `409 BALLOT_IMMUTABLE`. Participants cannot receive a capability or vote. One vote per battle, opened at reveal
  only for trigger `DRAW`, `AUTHORED_TEXT` or `BOTH`. No closing, deadline, tally or read route.
- #461 (05B, draft): sidecar `gameplay_social_vote_deadlines` is the single lifecycle authority; `closed` plus the
  persisted counts and `final_choice` is terminal and immutable; NPC ballots fill only at/after the deadline and
  only while a quorum place remains. 05C must treat `closed` as the only proof of a final vote.
- 05C: final social outcome, receipt and outbox exist only as offline models (#474); no authoritative runtime yet.
- No spectator projection exists anywhere.

## 1. One feed, three outcomes

- A battle is one projection item `(kind: "battle", entityId: battleId)` with a `projectionVersion` (Chat04.0 §2).
  The unified feed and the «Споры» tab are two views of the same item; neither creates its own entity or copy.
  The crowd vote is part of that battle item, not a separate item and not a message.
- Three results stay separate fields and are never derived from one another, in server or client:
  `mechanicalOutcome` (resolver, immutable), `socialOutcome` (crowd support), `recognizedOutcome` (accepted result).
- Final `socialOutcome`, `recognizedOutcome` and the final score come only from the authoritative 05C final record,
  which consumes a vote closed by 05B. Until that record exists the item shows the vote as pending.

## 2. Who sees which battle (R316 §1)

- Player battles are **public by default**. Any actor with a valid K1 session may read the spectator projection
  of a public battle.
- A non-public battle is visible only to its authorized recipients; to anyone else it is indistinguishable from a
  missing battle (same `404 NOT_FOUND`, no counts, no cursor gaps). K2 defines no way to make a battle non-public
  or to turn a non-public conflict public; that UX and its consent rules are not approved.
- A participant always gets the K1 participant projection; anyone else gets the spectator projection.
  The server decides by session, never by a client flag.

## 3. Spectator projection (R294 + R316)

Only server-confirmed, allowed fields. Never: actorIds, personIds, voteId, capability data, individual ballots,
intermediate counts, human/NPC breakdown, tactic types, resolution numbers or coefficients, private messages,
evidence, unconfirmed data.

```text
schemaVersion, battleId (opaque public entity id), projectionVersion, rulesVersion, phase,
participantNames {A, B}                          // confirmed current game names
// before reveal: nothing about choices, texts, colors, types or per-side commit state
// after reveal (R316 §3):
dialogue {A:{attack:{text, color}, defense:{text, color}}, B:{…}}
mechanicalOutcome  A_WIN | B_WIN | DRAW          // a draw has no winner
vote { status: none | open | closed, deadlineAt?, eligible: boolean, myBallot?: A | B }
// only after the 05C final record exists (R316 §2):
socialOutcome      A_SUPPORT | B_SUPPORT
recognizedOutcome  A_WIN | B_WIN | DRAW
finalScore {A, B, total}                         // confirmed aggregate of the closed vote, e.g. 4:3 of 7
narrative?                                       // safe editorial text from 04.5 (R296), when available
```

- `phase` for spectators is coarse: `waiting` / `revealed` / `final` / `expired`. Whether one side has committed is not shown.
- `vote.status` mirrors the 05B sidecar; `closed` is set only by the 05B close transition.
- `finalScore` is present only together with the 05C final record. No score or partial count is ever sent while
  the vote is open. The quorum size is a server setting (the 7 in the example is not a canon value).
- `myBallot` is returned only to the voter who cast it.
- The participant projection (K1 §5) gains the same post-reveal `vote.status`, `socialOutcome`,
  `recognizedOutcome` and `finalScore` fields under the same 05C rule; participants have `eligible: false`.

## 4. Voting eligibility (R316 §4)

The server decides eligibility per vote and re-checks it inside the ballot transaction. The client only shows
buttons when `vote.eligible` is true; it never assumes that an invited player may vote.

A human ballot is accepted only when all of these hold (05A + 05B rules as they exist today):
1. Valid K1 session and server-side voter authorization for this battle (today: 05A spectator authorization;
   K2 proposes deriving it from the session, §6).
2. The voter is not a participant of the battle.
3. The voter has no ballot in this vote (one person, one ballot; immutable).
4. The 05B sidecar is open, the trusted timestamp is before `deadlineAt`, and human + NPC ballots are below quorum.

Chat09B: the existing offline models (V123–V129) cover battle cancellation, anti-farm on cancel, occupancy and
terminal receipts. They define **no** voter-eligibility rule. Additional limits (newcomers, alternate accounts,
farming through votes) stay OPEN-4 and are not invented here. Until they exist, which persons the server marks
eligible is an operator/owner decision, not "every invited player".

## 5. Routes (proposed; all require a K1 signed session)

| Route | Request → response |
|---|---|
| `GET /v1/battles?scope=public&cursor=` | → `{battles:[{battleId, phase, participantNames, voteStatus}], nextCursor?}`: public battles the caller is not a participant of, newest first |
| `GET /v1/battles/{battleId}` | participant → K1 projection; anyone else, public battle → §3 projection; else `404` |
| `POST /v1/battles/{battleId}/votes` | existing body `{"choice":"A"|"B"}` → `{choice, replayed}` (voteId is not returned to clients) |

- Same choice again → original receipt, `replayed: true`, no second ballot. Different choice → `409 BALLOT_IMMUTABLE`.
  Every HTTP attempt is freshly signed (K1 §1.2).
- Errors: `409 PARTICIPANT_CANNOT_VOTE`, `409 NOT_ELIGIBLE`, `409 VOTE_NOT_OPEN`, `409 VOTE_CLOSED`, `409 BALLOT_IMMUTABLE`.
- Ballot insert, nonce consumption and session/revoke re-check happen in one D1 transaction (K1 §0, §1.2).
- `A`/`B` are battle sides; the UI labels them with participant names only.

## 6. Server work required (Codex, after K1 and in R292 order)

1. Session-based voter identity (K1 session → person) in place of client-held spectator capabilities.
2. Visibility (public by default) and the `scope=public` list with opaque cursors.
3. Spectator projection with a field-level allowlist (§3); colors only after reveal.
4. Vote state from the 05B sidecar (`status`, `deadlineAt`, `eligible`, `myBallot`).
5. Final outcomes and `finalScore` only from the 05C final record (after 05B closes); never from the open vote.
6. K2 definitions in `contracts/social-battle-api-v1.schema.json` after K1 merges (one schema file, no copy).

## 7. Client UX (first version)

- In the «Споры» view: a list «Бои в городе» under «Бои с людьми» with names and a short status
  («Идёт бой», «Толпа решает», «Итог признан», «Время вышло»). The same battle item renders in the unified feed later.
- Spectator card keeps the V5 chess order of the four replies. Before reveal: grey plates and
  «Бой идёт. Реплики откроются после ходов обоих». After reveal: real colors and texts, names, «Атака»/«Защита».
- Under the dialogue, as separate lines: «Механически: победа Ани» / «Механически: ничья»; then the vote:
  - open and `eligible`: «Поддержать Аню» / «Поддержать Борю»; after voting «Твой голос учтён: за Аню»;
  - open, not eligible: «Толпа решает» without buttons;
  - closed, 05C final present: «Толпа поддержала Аню · 4:3» and «Признанный итог: победа Ани».
- Participants see the same crowd lines in their card, never vote buttons.
- All text via `textContent`; the client renders the projection as given and computes no outcome.

## 8. Open owner decisions

- OPEN-4: additional voter limits (newcomers, alternate accounts, vote farming) — Chat09B; not defined in current artifacts.
- OPEN-5: UX for choosing a non-public battle and its consent (R316 §1 leaves it unapproved).

Closed by R316: battle visibility (public by default), final score display (confirmed aggregate after close only),
colors for spectators (after reveal only).

## 9. Required negative tests (before any runtime claim)

- Spectator payloads (network, not DOM) never contain actorIds, personIds, voteId, other ballots, intermediate
  counts, human/NPC split, tactic types, resolution numbers, or anything about choices before reveal.
- No `finalScore`, `socialOutcome` or `recognizedOutcome` while the vote is open or before the 05C final record.
- A non-public battle and a missing battle give identical responses to a non-recipient.
- A participant and a non-eligible person cannot vote; a second different ballot conflicts; a replayed ballot does not
  double count; concurrent duplicate ballots produce one row; a ballot after close is rejected.
- A revoked session cannot vote even if the ballot request was signed before revoke.
- Reload or a second device shows the same `myBallot`; no other viewer sees it.

## 10. Client development before the server

The client is built against the test-only mock (`tools/mock_social_battle_server.mjs`, PR C1), extended with these
routes and a simulated 05B close plus 05C final record, behind the same default-off flag. Mock results are rule
evidence only, not D1 or 05B/05C evidence. Runtime client work starts only after K1/C1/K2 pass exact-HEAD review.
