# Asynchronia private-alpha telemetry receiver

This Cloudflare Worker is the central receiver for the invited private-friends alpha. It is deliberately not a third-party analytics SDK. The game sends the existing minimized `Game.Telemetry` schema directly to this Worker; the Worker validates and stores accepted events in D1.

## Fixed production contract

- Worker name: `asynchronia-telemetry-private-alpha`
- D1 database name: `asynchronia-telemetry-private-alpha`
- D1 binding: `DB`
- rate-limit binding: `INGEST_RATE_LIMITER`, namespace `61001`, 30 requests per minute per `anonymousId` per Cloudflare location, plus 5000 accepted events per anonymous ID per hour
- allowed browser origin: `https://samuray-games.github.io`
- cohort: `private_friends_alpha_2026_08`
- ingest: `POST /v1/events`, contract version 1, event schema version 1
- health: `GET /v1/health`
- owner summary: `GET /v1/admin/summary?days=30`
- owner session list: `GET /v1/admin/sessions?days=30&limit=100`
- owner session detail: `GET /v1/admin/sessions?days=30&sessionId=<session-id>`
- owner export: `GET /v1/admin/export?days=30&limit=10000`
- retention: 30 days, deleted daily by cron

The receiver stores only the event's random anonymous/session/page-view identifiers, stable runtime IDs, event ordering/timing, allowlisted context/payload JSON, receiver timestamps, and session metadata. Session metadata is restricted to the voluntary gameplay nickname from the visible game UI and approximate city from Cloudflare runtime metadata (`request.cf.city`); the browser cannot submit city. It does not persist request IPs, country/region, user agent, referrer, cookies, URLs, profile fields, free-form player-authored text, precise coordinates, device fingerprints, hidden account identifiers, or secrets. Missing Cloudflare city is stored as `null`, never guessed. Worker observability is disabled so application request logs are not retained by this deployment configuration. CORS is a browser boundary rather than sender authentication; payload validation, size limits, anonymous-ID rate limiting, hourly event limits, and idempotency remain mandatory even when the `Origin` header is forged by a non-browser client.

## Provisioning boundary

The repository intentionally contains `wrangler.template.jsonc`, not a fabricated deployable database ID. Provisioning requires a Cloudflare account with Workers and D1 enabled.

Create the database exactly once:

```sh
npx wrangler@4.122.0 d1 create asynchronia-telemetry-private-alpha
```

Record the returned UUID as the GitHub repository variable `CLOUDFLARE_D1_DATABASE_ID`. Configure these GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`: a token restricted to the selected account with `Account / Workers Scripts / Edit` and `Account / D1 / Edit` permissions;
- `CLOUDFLARE_ACCOUNT_ID`: the target Cloudflare account ID;
- `TELEMETRY_OWNER_TOKEN`: a newly generated high-entropy owner-only bearer token.

Generate the owner token locally with `openssl rand -base64 48`; store only the resulting value in the GitHub secret and the owner's password manager.

The owner token must never be committed, added to Pages, pasted into `telemetry-config.js`, or shared with testers. The manual `telemetry-receiver-deploy` workflow renders the real Wrangler file from the D1 UUID, applies the migration, uploads `OWNER_TOKEN` as a Worker secret, and deploys the Worker.

## Verification and activation

After deployment, preserve the exact HTTPS URL printed by Wrangler. Verify:

```sh
curl -fsS "https://WORKER_HOST/v1/health"
curl -fsS -H "Authorization: Bearer $TELEMETRY_OWNER_TOKEN" "https://WORKER_HOST/v1/admin/summary?days=30"
curl -fsS -H "Authorization: Bearer $TELEMETRY_OWNER_TOKEN" "https://WORKER_HOST/v1/admin/sessions?days=30&limit=100"
curl -fsS -H "Authorization: Bearer $TELEMETRY_OWNER_TOKEN" "https://WORKER_HOST/v1/admin/export?days=30&limit=10000" -o asynchronia-telemetry.ndjson
```

`WORKER_HOST` here means the exact host returned by the deployment, not a guessed account subdomain. Session list/detail and summary paths include `nickname` and `city` when available. Export is NDJSON with one `session_metadata` record per session followed by `event` records, avoiding repeated metadata in every event.

Only after production health, rejected-origin, accepted-ingest, duplicate-ingest, summary, and export checks pass should the mirrored `telemetry-config.js` files change to:

- `enabled: true`;
- `endpoint: "https://<exact-deployed-host>/v1/events"`;
- `endpointOrigin: "https://<exact-deployed-host>"`.

That activation contains no secret and adds no consent, opt-out, cookie banner, or refusal UI. GitHub Pages remains failure-safe: if the receiver is offline or rejects a request, the game continues and the bounded local queue retries later.

## Local validation

```sh
node --check src/worker.js
node --test test/worker.test.mjs
```
