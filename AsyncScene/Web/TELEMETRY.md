# Game.Telemetry v1

`Game.Telemetry` records privacy-safe behavioral events from real player sessions. It is production runtime code, separate from the Stage 7 test/evidence harness and from parser hardening.

## Privacy boundary

The runtime records random pseudonymous identifiers, event ordering, stable screen/modal/action/state/question/choice IDs, timestamps, and foreground dwell durations. The anonymous ID persists locally until rotation; the session ID lasts for the browser tab and survives reloads; every document load receives a separate page-view ID. It does not record player-authored text, input values, DOM snapshots, names, birth-year/profile inputs, email/phone data, secrets, URL paths, query strings, or hashes.

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

An operator may enable transmission only by supplying an explicit runtime configuration before `telemetry.js` runs:

```js
window.__ASYNCHRONIA_TELEMETRY_TRANSPORT__ = {
  enabled: true,
  consent: true,
  consentVersion: "privacy-v1",
  endpoint: "/telemetry/v1/events"
};
```

The endpoint must be same-origin HTTPS (localhost is allowed for development). Requests omit credentials and send at most 50 events. Offline events remain in local persistence. Failed requests retry with bounded exponential delays up to six attempts; later events or an `online` event can resume flushing. A successful event receives local `transmittedAt` metadata and remains available until ordinary retention pruning, so export/readback is auditable.

Remote retention and access policy belong to the configured receiver and must be approved before transport is enabled. This repository does not configure a receiver in v1.

## Export and analysis

- `Game.Telemetry.export()` returns a JSON-safe evidence bundle.
- `Game.Telemetry.getEvents()` returns a cloned event list.
- `Game.Telemetry.summary()` returns counts plus accumulated foreground dwell by screen and question.
- `Game.Telemetry.inspect()` returns current session/runtime status without event payloads.
- `Game.Telemetry.flush()` requests an immediate configured batch transmission.

Shared clicks are collected centrally only when a stable action identity exists (`data-telemetry-action`, `data-stage7-action`, `data-action`, `data-testid`, or element `id`). Game decisions, state transitions, questions, and cycle boundaries are emitted explicitly by their owning runtime controllers.
