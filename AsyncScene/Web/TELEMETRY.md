# Game.Telemetry v1

`Game.Telemetry` records privacy-safe behavioral events from real player sessions. It is production runtime code, separate from the Stage 7 test/evidence harness and from parser hardening.

## Privacy boundary

The runtime records random pseudonymous identifiers, event ordering, stable screen/modal/action/state/question/choice IDs, timestamps, and foreground dwell durations. The anonymous ID persists locally until rotation; the session ID lasts for the browser tab and survives reloads; every document load receives a separate page-view ID. It does not record free-form player-authored text, input values, DOM snapshots, real names, birth-year/profile inputs, email/phone data, secrets, URL paths, query strings, or hashes.

The sole text exception is a voluntary gameplay nickname: the short name already shown on the visible start screen. `ui-boot.js` passes the accepted game name to `Game.Telemetry.setGameplayNickname()`; telemetry never reads a DOM field. The client validates it as 1–24 letters/numbers/spaces/`.`/`_`/`-`, stores it once as session metadata, and never places it in an event payload. Email-like strings and arbitrary free-form text are rejected.

The anonymous identity can be rotated with `Game.Telemetry.rotateIdentity()`. `Game.Telemetry.clear({ includeIdentity: true })` removes events and rotates identity. The local event queue is capped at 1000 events and pruned after 30 days.

## Stable schema

Every event contains:

- `schemaVersion`, fixed at `1`;
- unique `eventId` and monotonic per-page `sequence`;
- `type`, `occurredAt`, and page-relative `monotonicMs`;
- random `anonymousId`, `sessionId`, and `pageViewId`;
- stable-ID-only `context` and `payload` objects.

Supported event types are `session_start`, `session_end`, `screen_enter`, `screen_exit`, `modal_open`, `modal_close`, `button_click`, `action`, `choice_selected`, `state_changed`, `question_shown`, `question_answered`, `visibility_hidden`, `visibility_visible`, `abandon`, `return`, `cycle_started`, and `cycle_completed`.

Foreground dwell pauses while `document.hidden` is true. Screen, modal, question, cycle, and session durations therefore represent actual foreground observation time rather than wall-clock absence.

Every event context carries the active screen plus active modal, question, and cycle IDs when present. A clean page exit ends the session with that terminal context. If a prior page view disappeared without a clean end, the next visit emits `abandon` and `return` with the prior screen/question/cycle IDs, allowing analysis to locate unfinished flows without recording their content.

## Persistence, transport, batching, and retry

Events are persisted locally under `AsyncScene_behavioral_telemetry_v1`. Network transmission is disabled by default. The published GitHub Pages runtime therefore does not transmit telemetry anywhere.

The private-friends alpha uses a separate, immutable `telemetry-config.js` loaded before `telemetry.js`. It contains no secret and remains disabled until the reviewed receiver has a verified production HTTPS endpoint:

```js
window.__ASYNCHRONIA_TELEMETRY_TRANSPORT__ = Object.freeze({
  enabled: false,
  mode: "private_friends_alpha",
  cohortId: "private_friends_alpha_2026_08",
  endpoint: "",
  endpointOrigin: ""
});
```

Activation sets `enabled`, `endpoint`, and the exact matching `endpointOrigin` after deployment verification. The endpoint must be HTTPS (localhost is allowed for development), use the exact `/v1/events` path, and contain no credentials, query, or hash. Requests omit credentials and cookies and send at most 50 events. Offline events remain in local persistence. Each pending batch keeps one stable batch ID across retries; failed requests retry with bounded exponential delays up to six attempts, and later events or an `online` event can resume flushing. A successful event receives local `transmittedAt` metadata and remains available until ordinary retention pruning, so export/readback is auditable.

The receiver contract is version 1. It accepts only the private-alpha mode/cohort and an exact allowlist of event, context, payload, and optional session-metadata fields. It enforces an exact browser Origin allowlist, 64 KiB request and 50-event batch limits, pseudonymous-ID rate limiting, D1 uniqueness for batch/event idempotency, and 30-day deletion. For each received session it may store the validated voluntary gameplay nickname once and the approximate `request.cf.city` supplied by Cloudflare once. City is receiver-derived only: there is no browser geolocation prompt, GPS, precise coordinate, country/region collection, or client-supplied city. It stores no IP address, user agent, referrer, URL, cookie, device fingerprint, hidden account identifier, profile field, free-form player-authored text, or secret.

Owner-only readback is available at `GET /v1/admin/summary`, `GET /v1/admin/sessions`, and `GET /v1/admin/export`. All require `Authorization: Bearer <OWNER_TOKEN>`; that secret exists only as a Worker secret and is never shipped in the game. Summary paths and session list/detail show the session’s nickname and Cloudflare-derived city when available. Export returns bounded NDJSON with one `session_metadata` record per exported session and separate `event` records, so metadata is not duplicated into every event.

Receiver source, migration, deployment template, and operational instructions live in `telemetry-receiver/`. Transport activation is a separate exact-endpoint change after receiver health, CORS, ingest, deduplication, summary, and export are verified in production.

## Export and analysis

- `Game.Telemetry.export()` returns a JSON-safe evidence bundle.
- `Game.Telemetry.getEvents()` returns a cloned event list.
- `Game.Telemetry.summary()` returns counts plus accumulated foreground dwell by screen and question.
- `Game.Telemetry.inspect()` returns current session/runtime status without event payloads.
- `Game.Telemetry.flush()` requests an immediate configured batch transmission.

Shared clicks are collected centrally only when a stable action identity exists (`data-telemetry-action`, `data-stage7-action`, `data-action`, `data-testid`, or element `id`). Game decisions, state transitions, questions, and cycle boundaries are emitted explicitly by their owning runtime controllers.
