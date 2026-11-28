# Chat07A V127 - source-boundary per-viewer executable oracle

**ONLY isolated synthetic reference code**, not working public projection, API, deployed ACL, D1/Worker integration or production test. Source allowlist: `tools/chat07a_v127_public_projection/**`. R270 permits isolated fixtures, not shared runtime changes. No modifications to 07Б, 04.4, 05C, shared Worker, source/docs, SQL or migrations.

## Entry points

- `FixtureAuthority` is a synthetic stand-in for three **separate** server-owned authorities: immutable original issuer, actual recipient-grant and viewer/audience authorization. It intentionally does not represent a trusted shared physical transaction.
- `prepareProjection(authority,{viewerId,locator})`: source and ACL snapshot, opaque in-process capability. Untrusted `clientKind` cannot override issuer class, namespace or action kind.
- `emitProjection(authority,token)`: checks source, immutable signature, role/recipient, viewer grant + generation/accessEpoch, audience ACL, allowed fields and visibility revision again. Revoke/ACL mutation between phases fails closed. An ordinary response carries `cacheControl:'no-store'`; no 304, cross-viewer or CDN cached DTO exists in this oracle.
- `project(...)`: synchronous prepare+emit shortcut. Response `NOT_VISIBLE` gives no reason/source IDs. It does not prove constant-time network behavior, storage linearization, real-world remote cache purge or inability to see a previously obtained copy.
- The canonical source identity is `(sourceSystem,canonicalEventId)`, never `clientKind`, transport `deliveryId`, `relayReceiptId`, projection version, relationship effect or `actionId` attached to a different issuer domain.

## Exactly three distinct public/private presentation kinds

| Original issuer | Representation | Viewer and field gates | Crucial negative |
| --- | --- | --- | --- |
| 05C `BATTLE_TERMINAL_FINAL` with single committed `battle.finalized` | `VERIFIED_OUTCOME` authorized public subset | viewer source ACL + `finality` + optional field intersections, current NPC recipient proof when source is recipient-bound | Vote closure, hearsay, judge output, proposal and 08B support are not 05C final |
| Committed 08B action `PUBLIC_SUPPORT`, `AUTHORIZED_PUBLIC` | `PUBLIC_SUPPORT` public speech/action | viewer audience and published-text scope, live source proof / recipient anchor | Never turn speech text, a supporting NPC or `causalRootSource` into an outcome |
| Committed 08B action `CHALLENGE_PROPOSAL`, `PRIVATE_RECIPIENT` | `CHALLENGE_PROPOSAL` recipient-only private, state `PROPOSED` | target viewer identity + active private audience ACL + proposal text scope | Never render in public feed or transform into accepted battle/result |

`HEARD_CLAIM` is deliberately **not** one of these three presentations and has no public renderer here. Trusted delivery can be recorded in a synthetic relay registry for replay/conflict testing. It never increments verified origin/history or makes an outcome true. V121 earlier considered VERIFIED_UTTERANCE as a category; V127 owner direction explicitly distinguishes the *action types* PUBLIC_SUPPORT and CHALLENGE_PROPOSAL, with HEARD_CLAIM separate. The meanings are not automatically substitutable. V121 historically listed `VERIFIED_OUTCOME`, `VERIFIED_UTTERANCE` and `HEARD_CLAIM`; the latest V127 owner instruction supersedes the presentation taxonomy for this isolated oracle only, not the 07Б knowledge classification.

The opaque `publicItemRef` is stable per viewer/source **only within this running fixture process** (random in-process HMAC key). It is neither a production durable ID nor a cache authorization. Any future durable identity, key custody, rotation and replay semantics require a separate approved design.

## Exact external boundary required from 07Б issuer (future, not available)

`07Б -> 07A` trusted server-only input **must** supply (a) immutable origin tuple `sourceSystem,canonicalEventId,eventVersion,issuerClass,sourceNamespace,rootReceiptIdentity,sourcePayloadDigest`, (b) for `VERIFIED_OUTCOME` distinct finalizer `battleId,terminalKind=FINAL,phase=final,unique battle-level terminal receipt,final version,real 05C result,closed-vote or no-vote semantic proof`, (c) for derivative action `08B actionId,actionKind,actionVersion,committedActionReceipt,routeClass,approvedPublishedTextDigest`, (d) recipient-specific witness/observation, `recipientNpcId,grantId,grantGeneration,accessEpoch,fieldScope,visibilityRevision`, and (e) a *current trusted* source and recipient read fence. Source identity and issuer class must come from authenticated registry/readback, NOT untrusted client DTO, `event_type` string alone, a mere signature hash, or synthetic V126 fixture. `07Б V2` keys and namespace spellings remain proposed; V118 `VERIFIED_OUTCOME` and V2 `VERIFIED_FACT` require explicit approved mapping. No raw origin proof, signing keys, receipts, private grant or NPC memory/effect goes into public DTO.

`05C V126` shows real EX03/EX08/EX09/EX10 and command-receipt-mutation invariant gaps. Its synthetic final-XOR-cancel oracle is **not** a live issuer; until a real source/terminal uniqueness proof is implemented, every live `VERIFIED_OUTCOME` integration is STOP. Any `FINAL`/`CANCEL` conflict is not a vote outcome. No D1 transaction or crossing-store atomicity is claimed.

## Exact outgoing boundary required by 04.4 cards (future, no writes to 04.4)

`07A -> 04.4` can expose a *new* separately versioned **per-viewer** projection, with `kind`, `surface`, opaque scoped `publicItemRef`, `projectionVersion`, `visibilityRevision`, and **only** the intersection of issuer publication policy, audience ACL, current viewer/recipient field scopes and kind allowlist. `VERIFIED_OUTCOME` may expose finality/outcome fields separately, never raw tally/votes unless independently approved. `PUBLIC_SUPPORT` may expose only approved public text and permitted speaker display, never `winner`. `CHALLENGE_PROPOSAL` is recipient-only private and MUST NOT be passed to 04.4 public-card list. `HEARD_CLAIM` not routed as a verified public card. Each read/refresh/304-equivalent/cursor/page requires current ACL fence; no shared SSR/CDN cache, no id-based existence leak. Consumer must not infer `verified outcome` from utterance, client label, actionId, history count, receiptId or public feed presence. 04.4 V126's 42/42 is an isolated synthetic fixture, not production wiring.

## Safety and missing acceptance

A) Present offline oracle tests are synthetic. A fixture registry's Boolean `committed` or `receipt` is NOT a real issuer proof. B) The fixture's in-process sequential grant check cannot attest native D1/Worker cross-store revocation linearizability or recover from rollback. C) `no-store` is a model output, not proof of HTTP/SSR/CDN compliance; already delivered content cannot be erased. D) No `critical_reviewer` role has been invoked or passed; high-risk security review is a hard gate. E) No secret, user data, actual relay/real message, SQL, source files, PR, runtime or production has been written.

Run isolated offline checks: `node --check` on each JS file, then `node --test tools/chat07a_v127_public_projection/test/oracle.test.mjs` from the archive root. A result here can only be `AUTHOR_OFFLINE_TESTS_PASS`, never source, D1, Worker, live ACL, Safari or production PASS. Integration requires independent critical review of exact SHA and separate owner GO/locks/host safety.
