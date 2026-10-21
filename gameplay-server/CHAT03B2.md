# Chat 03B2: private gameplay Worker prototype

**Status:** STACKED DRAFT, **NOT DEPLOYED**. Depends on [PR #440](https://github.com/samuray-games/AsyncScene/pull/440) for atomic genesis / CAS / outbox. [PR #441](https://github.com/samuray-games/AsyncScene/pull/441) is an independent write scope stacked on that draft branch, not a production game service.

## Trusted boundary

- Worker loads the merged `TacticalCombatLifecycleV1` and `TacticalCombatV1` server-side. No attacker-controlled state, actorId, roles, version or server clock are accepted at participant routes.
- One admin capability (`ADMIN_CONTROL_TOKEN`, **not** the telemetry owner token) controls private battle creation. The bootstrap response contains one distinct 256-bit random bearer token per player, which the admin must distribute privately.
- Only SHA-256 digests of participant tokens are stored in `gameplay_battle_capabilities`. Each token grants access solely to a single battle/side, and can be carried to another device for reconnection.
- `createdAt`, confirmation deadline, generated battle ID and system actor are Worker-authoritative. `COMMIT_WINDOW_MS` is **required** and bounded at startup. That bound is a technical safety range, not an approved game-design timeout.
- Initial state + origin event + both capability records commit in one D1 `batch()` transaction. Subsequent lifecycle commands use versioned atomic `gameplay_apply_transition`; same-command replay consults the durable receipt and rejects conflicting payloads.
- Participant reads use the lifecycle's `getPublicView()` exclusively. Automatic reveal happens only after both sides commit. Scheduled handler can reveal committed states or expire uncommitted past-deadline battles. No vote, economy, social event, territory, hidden Web UI or `finalize` route is provided.

## Private API

| Route | Credential | Response / purpose |
|---|---|---|
| `POST /v1/admin/battles` | admin token | Mint two participant capabilities for an admin-supplied, vetted pair |
| `GET /v1/battles/{battleId}` | participant token | Strict role-specific public view only |
| `POST /v1/battles/{battleId}/commit` | participant token | Body `{commandId, selection}`; no actor/role/time accepted outside selection's validated role |

**Env contract:** `DB` binding to a dedicated gameplay D1, `ADMIN_CONTROL_TOKEN` (at least 32 base64url-safe characters, secret), `COMMIT_WINDOW_MS` (explicit operator choice; no default), `ALLOWED_ORIGIN` (strict exact CORS origin for browser clients). No private D1 IDs, admin credentials or participant tokens are committed.

Local `wrangler.api-local-test.jsonc` is **test-only**, and deliberately contains no production D1 ID, account, admin token, deployment target or public Worker route.

## Executable evidence

Dedicated [Chat 03B2 GitHub Actions](https://github.com/samuray-games/AsyncScene/actions/workflows/chat03b2-private-api.yml) run:

```sh
node --check gameplay-server/src/worker.js
node gameplay-server/test/private_api_local_test.mjs
```

The integration harness installs both migrations in a disposable local Wrangler/workerd D1, runs a synthetic admin + two participants, asserts unauthorized/forged actor requests are rejected, verifies secrets remain hidden before both commits, tests command replay and changed-input rejection, executes simultaneous participant commits, and restarts the Worker to confirm durable views and receipts. It does not use actual Cloudflare credentials or touch telemetry.

## Explicit release blockers

1. Parent #440 must pass current-head independent review and integrate without modifying `main` directly; this stacked PR must be reviewed separately.
2. The proposed private-alpha bearer capability scheme is **not** permanent verified account identity; the final identity provider, token rotation/revocation, second-device ownership policy and privileged bootstrap distribution require explicit acceptance.
3. Decide gameplay retention, backup, player-data erasure, legal/privacy handling, audit policy, abuse limits and secret rotation. Do not silently reuse telemetry's 30-day retention or its owner token.
4. Review/deploy only to a **dedicated** gameplay Worker and D1 after authenticated Cloudflare staging tests. The existing test probe Worker with `/inspect` must **never** be deployed.
5. Configure and test actual scheduled/timeout behavior, reconnect with real browser clients, crash/error monitoring, D1 remote concurrency and Safari runtime acceptance.
6. DRAW and hand-edited non-DRAW recognition/finalization remain gated by Chat 05. No secure public PvP or full Chat 03 PASS claim is made.

**Overall:** `CHAT03B2_PRIVATE_API_LOCAL_PASS / PRODUCTION_BLOCKED / CHAT03_IN_PROGRESS`.
