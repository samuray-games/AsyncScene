# Chat06 V123 - offline trusted-knowledge adapter candidate

ATOM: `CHAT06-V123-JUDGE-PROOF-ADAPTER`

Status: `ISOLATED_EXECUTABLE_CANDIDATE`, **NOT** approved 07B V2, **NOT** authenticated runtime, **NOT** integrated Chat05B, **NOT** a source GO to change PR #452.

## Exact source baseline

- `samuray-games/AsyncScene` main: `f256228a2a57e5b8144a42a72a240a7455a76417` at preflight.
- Existing Draft PR #452 head: `f9a255692e95a8ecb6c9811eab0ce540acf4f149`.
- Existing `chat06-judge-fixtures/judge.mjs` blob: `12ece4f21b9a57004a8c52f67c14c9f4481f7aac`.
- The four original PR #452 files and all existing golden outputs are **untouched**.
- `07B V118` and the three proposed issuer/relay namespaces are **design only**, with no owner-approved production API.

## How to run

```sh
node --check chat06-judge-fixtures/trusted-knowledge-adapter.mjs
node --check chat06-judge-fixtures/trusted-knowledge-adapter.test.mjs
node --test chat06-judge-fixtures/trusted-knowledge-adapter.test.mjs
```

When both candidate files are placed beside the existing PR452 `judge.mjs`, an additional exact-evaluator smoke test runs. In an isolated scratch folder without `judge.mjs` that smoke test is explicitly **SKIPPED**; do not call the resulting count an integration pass.

This candidate uses Node built-ins only, does not send network requests or write to a database, and has no runtime or economy API.

## Trusted-provider boundary

`projectTrustedJudgeFacts({ input, snapshot, evidenceRefs }, authority)` is a synchronous PURE projection.

The privileged internal `authority` object must implement:

- `getSource(sourceNamespace, sourceId)` - **already verified**, coherent authoritative 05C final or committed 08B public action with immutable issuer/proof metadata.
- `getKnowledge(knowledgeKey)` - **already committed** per-judge 07B typed knowledge receipt with source binding and first legal acceptance time.
- `getGrant(grantId)` - current canonical grant, recipient, generation, epoch, field scope, revoke and validity state.
- `getAssertion(assertionId)` - separately **approved** exact canonical assertion mapping to `{claimId, provenance, status, supportUnits}`. A fixture registry's `approved=true` is only synthetic test input, not the owner's production permission.
- `approvedIssuerFor(sourceNamespace)` - approved issuer service identity looked up independently from claimed source data.

These lookup methods are **required privileged services**. The candidate does NOT verify Ed25519/JCS, 05C terminal cardinality from real D1, 07A public projection/redaction, durable 07B delivery or cross-store atomic grants. Those verifications must be completed **before** injecting records. NEVER expose an API where a client supplies the `authority` parameter or claims its own `verified=true` flag.

Candidate source namespaces `gameplay.battle.finalized/v1` and `npc.action/v1` are only inherited from unapproved 07B V118 design. Source IDs are compared together with their namespaces; an identical text ID in different namespaces does not grant authority.

## Output contract

A successful projection returns:

```js
{
  input, // original PR452 input fields, with claims sanitized
  snapshot, // original PR452 snapshot fields, including STRICT knownFacts triplets
  privateEvidenceManifest, // offline audit refs, NEVER public
}
```

- All pre-existing positive claims and prefilled `knownFacts` are initially demoted/cleared. This prevents accidental trust in synthetic or caller data.
- Only `VERIFIED_OUTCOME` from a different already-finalized 05C battle can become a positive known fact, after a matching independently approved canonical assertion mapping, live recipient/grant/epoch/snapshot check and verified source lookup.
- Positive `input.lines[].claims[].availableAt` and matching `snapshot.knownFacts[].availableAt` both become the trusted durable `firstLearnedAtServer` value. That time must be no later than frozen `snapshotAt`.
- `VERIFIED_UTTERANCE` is proof of a public expression only, **not** truth of its content. `HEARD_CLAIM` is unconfirmed relay. Both are deliberately NON-SCORING; they cannot produce `knownFacts` or positive `supportUnits`.
- Multiple relays / receipt retries cannot inflate support. Semantic assertion keys, not the number of witnesses, control deduplication.
- A `DRAW` never has an inferred winner or loser. A separately approved `DRAW` assertion may be represented, but it is not a victory claim.
- Private proposed `CHALLENGE_PROPOSAL` is never accepted as authorized public support.
- All outputs are deeply frozen, and no other `judge.mjs` input fields are added. The private manifest MUST NOT be passed to `toPublicResult` or public/log DTOs.

## Required STOP before real integration

1. 05B+05C real terminal/source proofs; 05C EX03/EX08/EX09 and 05B EX10 source gates remain upstream.
2. 07A authenticated issuer lookup and permitted public projection; 07B V2 owner approval, recipient observation/relay grants and durable atomic knowledge receipt; 08A memory semantics and grant-revoke boundaries.
3. Production-safe approved assertion/claim mapping and support-unit policy, identity namespaces, time/visibility/revocation semantics. The fixture's approved assertion is NOT evidence of owner GO.
4. Separate close-time revoke fence: a frozen snapshot verified at vote opening must be rejected at NPC ballot commit if a relevant right was revoked before close under the future owner policy. This candidate does NOT commit ballots.
5. Independent high-risk `critical_reviewer`, exact ownership and locks, safe hooks, private raw-byte cloud checkpoint with independent readback, separate explicit source/PR/push GO.

## Truth level

The test suite verifies only synthetically provided trusted registry outputs and strict projection behavior. It does not prove that any real registry or provider exists, nor that a signed claim is authentic, nor that an NPC cast a vote. No integration with worker.js, migration, real D1, Cloudflare, gameplay memory, economy or PR452 has been performed.
