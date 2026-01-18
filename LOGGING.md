# AsyncScene Autologging

## Overview
When you run AsyncScene on `localhost`, the client now batches log entries (chat, DM, stat changes) and streams them in JSON batches to a local logger service. The dev menu exposes the logger status and controls.

## Browser behavior
- Logs are only emitted when the game is served from `localhost`, `127.0.0.1`, or when `Game.Debug.ENABLE_LOGGER` is `true`.
- The logger batches up to 50 entries or sends every ~2 seconds. If the logger endpoint (`http://localhost:17321/log`) is unreachable, the batcher keeps retrying with exponential backoff and updates the menu’s indicator to `disconnected`.
- Use the dev menu buttons under `Logger:` to `Ping logger` (tests connectivity) and `Force flush` (send pending entries immediately). The indicator pill mirrors the current status (`connected`, `disconnected`, or `unknown`).

## Running the local logger
1. Start the logger server in the repo root:
   ```bash
   node tools/logger.js
   ```
   It listens on `http://localhost:17321`.
2. The server creates `AsyncSceneLogs/` next to the repo root. Each POST batch appends JSON lines to a timestamped file (`asyncscene-YYYY-MM-DD_HH-mm-ss.jsonl`) and rotates `last.jsonl` to keep the newest ~5 000 lines (ring buffer).
3. `last.jsonl` always reflects the most recent logs and can be opened live (e.g., `tail -f`) while the game is running.
4. The server also responds to `GET /ping`, which the dev menu uses for the `Ping logger` button.

## Verifying
1. Start `node tools/logger.js`.
2. Launch AsyncScene via `Run AsyncScene.command` (so the client runs on `localhost`).
3. Open the dev menu and confirm that `Logger: connected` appears shortly after the client sends its first batch.
4. Interact with the UI (battle, DM, stat change) and check that `AsyncSceneLogs/last.jsonl` updates immediately with new JSON entries.
5. Stop the logger server: the dev menu should flip to `Logger: disconnected` and the client continues running without throwing errors; entries just stay queued until the server is back.

## Notes
- The logger is intentionally dev-only: it does not ship to production builds.
- If you want to review the batched queue manually, `Game.Logger` exposes `log`, `forceFlush`, and `ping` on the browser console.
