# CHAT07A-V129 HTTP per-viewer authorization candidate

**ISOLATED / TEST REGISTRY ONLY**. This is a real Node `http` loopback candidate exercised with HTTP requests, but it uses a separate in-memory synthetic server-owned test registry. It does **not** call any real 05C finalizer, 07Б knowledge grant/issuer, D1, Cloudflare Worker or UI. An HTTP response 200 here is **not a live backend pass**.

Only source files under `tools/chat07a_v129_http_consumer/**`. There is no repo checkout, no shared source change, no origin proof implementation, no signed source, no production session store, no durable token key custody and no deploy.

Proposed V128 wire: `07a-http-consumer/v1`. Server-owned tenant/viewer identity, per-viewer ref, role, session generation and epoch, source publisher registry, audience ACL, viewer field grant, optional recipient current generation/epoch gate. Only `finality`, optionally `mechanicalOutcome` are allowed for `VERIFIED_OUTCOME`; winner/recognized/votes/tally never appear. `PUBLIC_SUPPORT` requires separately approved exact published text bytes/digest, and is speech, not truth. `CHALLENGE_PROPOSAL` only `/v1/private/item/:ref` for the named recipient. `HEARD_CLAIM` receipts never become history/outcome.

Network behavior: protected GET returns 200/401/generic 404 with real `Cache-Control: private, no-store, max-age=0` and `Surrogate-Control: no-store`; no 304 even for conditional GET. SSR HTML escapes content. Opaque cursor binds session and authorization revision, revalidated each request. The server rechecks after `beforeEmit` test seam, and has **no await** between final recheck and `res.end`. This is only single-process ordering, not proof of cross-service atomicity, external cache control or stable physical rights after an HTTP response.

Security gate: HIGH, independent `critical_reviewer` REQUIRED and NOT assumed available. Owner semantics for winner/recognized/socialOutcome/votes unresolved. Current 05C EX03/08/09 and 07Б issuer/recipient physical authority block integration. No PR/merge/Worker/D1/runtime/production claims.

## Actual isolated HTTP routes and checks

- `GET /v1/history/item/:opaqueRef` - authenticated per-viewer `VERIFIED_OUTCOME` or `PUBLIC_SUPPORT`; `CHALLENGE_PROPOSAL` always 404 on public path.
- `GET /v1/private/item/:opaqueRef` - only the exact addressed private proposal recipient with live field grant.
- `GET /v1/history?pageSize=1..10&cursor=<opaque>` - only currently visible cards, no global count, cursor bound to session/revision/role/tenant/viewer; cross-viewer/revoked/tampered cursor -> generic 404.
- `GET /v1/history/ssr` - server-generated escaped authorized HTML, no pre-render; SSR `cursor`/`pageSize` query is rejected.
- `If-None-Match` / `If-Modified-Since` never cause 304. All responses set actual `Cache-Control: private, no-store, max-age=0`, `Surrogate-Control: no-store`, `Referrer-Policy: no-referrer`. No ETag/Last-Modified or public cache.
- Authentication 401 is independent of reference existence. Invalid/missing/cross-tenant/revoked/private source on public path all give identical generic 404 bodies.
- Route policy and issuer classification come from in-memory *server-owned test registry*, not query/clientKind. `recipientGrantRequired` is derived from server-sealed recipient binding; client-supplied `grantRequired` ignored. Two-phase prepare/emit uses a test seam, checks a monotonic revision again, then writes response synchronously.
- `recognizedOutcome`, `socialOutcome`, `winnerId`, `voteId`, tally, private speaker/recipient paths, proofs, ledger fields are **not** emitted even when the fixture source contains them.

The in-process revision is **not** independently durable, cannot prove anti-rollback, cannot serialize a real 05C/07Б cross-store commit and does not prove the actual client/SSR/CDN/Safari path. Tenant/issuer policy, grant storage, published-text review, real event proofs and owner field semantics are live integration prerequisites.

Run `node --check authority.mjs`, `node --check http-candidate.mjs`, `node --check test/http.test.mjs`, then `node --test test/http.test.mjs` from this folder. The suite uses actual ephemeral localhost port, `127.0.0.1`, with no remote network calls.
