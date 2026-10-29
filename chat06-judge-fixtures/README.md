# CHAT06-JUDGE-V1 isolated evaluator and fixtures

This directory contains a standalone deterministic NPC judge evaluator. It has no imports from the game, Chat05, server, NPC runtime, UI, economy, or battle lifecycle, and nothing in the repository wires it into gameplay.

## Run

```sh
node --test chat06-judge-fixtures/judge.test.mjs
```

Only Node.js built-ins are used.

## Contract notes

- Four revealed lines are scored from their frozen integer style features.
- Positive facts/emotions style is capped by confirmed support units whose claim provenance and availability are present in the judge's frozen knowledge snapshot. Unknown/refuted claims contribute zero and incur no separate penalty. Mixed claims contribute only their explicit confirmed-part support.
- Frozen relationships are applied once per participant after line scoring.
- Ties use SHA-256 over the exact domain prefix and JCS canonical tie object.
- `evaluateJudge` accepts only plain JSON-style input objects with the declared fields at every schema level. Unknown fields, symbols, accessors, and inherited object properties are rejected before scoring. The canonical `fullInputHash` therefore covers the complete accepted input and snapshot schema, with no accepted-but-unhashed object fields.
- `evaluateJudge` returns a frozen internal closure record with the canonical full-input hash and a SHA-256 integrity digest over the closed record. Restore verifies the exact schema and digest, and public projection accepts only the defined public reason-code allowlist. The unkeyed digest detects accidental or incomplete edits; it is not an authentication signature for untrusted storage. `toPublicResult` omits scores, relationships, known facts, internal reason codes, tie digest, and full input hash.
- `evaluateRoster` skips invalid snapshots without fabricating a vote and fails diagnostically when fewer than the requested minimum valid judges remain.
- Human votes are not accepted as input and there is no vote storage or mutation API.

The three fixtures and tie vector are synthetic test data, not server payloads or production NPC configuration. Chat05A/05B quorum, human-vote boundaries, timeout, concurrency, and NPC fill-in integration are outside this module's acceptance.

## Input shape

`evaluateJudge(input, snapshot)` consumes:

- `input`: `voteId`, `battleId`, two distinct `participantIds` in A/B order, `featureVersion`, `algorithmVersion`, and exactly four ordered `lines` (`A1`, `B1`, `A2`, `B2`). Each line has its `speakerId`, `aggression`, `factsEmotions`, `humor` integer features in -2..+2, and a `claims` array. Claim records include unique `claimId`, `status` (`confirmed`, `unknown`, `refuted`, `mixed`), `provenance`, `availableAt`, and integer `supportUnits`. Unknown/refuted records must carry zero support; mixed records carry only the confirmed-part support.
- `snapshot`: `judgeId`, a `profile` and matching `profileVersion`, stable `seed`, `snapshotAt`, per-side relationships keyed A/B and bound to participant IDs, and `knownFacts` records containing claim ID, provenance, and availability time. The profile fields are `judgeId`, positive `profileVersion`, the three -2..+2 preferences, and `fearResponse`.

All input object levels use a strict schema. Add a field only with an explicit contract update and matching hash/test update; unknown properties fail with `JudgeInputError.code = UNEXPECTED_FIELD`.

The three profiles, two supported A claims, line snapshots, and expected totals are in `fixtures.mjs`. Every golden judge snapshot knows both claims before `snapshotAt`. Input validation fails closed with `JudgeInputError.code` diagnostics.

## Output boundary

The frozen internal record retains per-line and per-side scores, frozen relationship contributions, tie application/digest, internal and public reason codes, all version identifiers, and `fullInputHash`. The public allowlist retains only vote/battle/judge/winner IDs, algorithm/explanation versions, generic public reason codes, and a short explanation. Its wording does not expose private relationship/knowledge state or claim provenance. The full input hash and tie digest remain internal.
