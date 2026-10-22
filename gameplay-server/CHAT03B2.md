# Chat 03B2: private gameplay Worker prototype

**Status:** STACKED DRAFT, **NOT DEPLOYED**. Depends on [PR #440](https://github.com/samuray-games/AsyncScene/pull/440) for atomic genesis / CAS / outbox. [PR #441](https://github.com/samuray-games/AsyncScene/pull/441) is an independent write scope stacked on that draft branch, not a production game service.

## Trusted boundary

- Worker loads the merged `TacticalCombatLifecycleV1` and `TacticalCombatV1` server-side. No attacker-controlled state, actorId, roles, version or server clock are accepted at participant routes.
- One admin capability (`ADMIN_CONTROL_TOKEN`, **not** the telemetry owner token) controls private battle creation. The bootstrap response contains one distinct 256-bit random bearer token per player, which the admin must distribute privately.
- Only SHA-256 digests of participant tokens are stored in `gameplay_battle_capabilities`. Each token grants access solely to a single battle/side, and can be carried to another device for reconnection.
- `createdAt`, confirmation deadline, generated battle ID and system actor are Worker-authoritative. `COMMIT_WINDOW_MS` is **required** and bounded at startup. That bound is a technical safety range, not an approved game-design timeout.
- Initial state + origin event + both capability records + create-idempotency record commit in one D1 `batch()` transaction. `POST /v1/admin/battles` requires a client-persisted high-entropy `Idempotency-Key`; the database stores only its SHA-256 digest and a participant-payload fingerprint. Matching retries return the original battle/deadline/capabilities; a changed payload using that key returns `409`.
- The original create result (deadline, participant IDs and capability tokens) is encrypted with AES-256-GCM before persistence. Each encryption uses a random 96-bit nonce; authenticated additional data binds the ciphertext to the purpose, idempotency-key digest, request fingerprint, battle ID, deadline and key version. D1 stores the nonce and ciphertext, never plaintext capability tokens. Participant authorization continues to use only SHA-256 token digests.
- Subsequent lifecycle commands use versioned atomic `gameplay_apply_transition`; same-command replay consults the durable receipt and rejects conflicting payloads. A fresh command ID after that side has committed returns `409 ALREADY_COMMITTED` without creating a receipt or transition.
- Participant reads use the lifecycle's `getPublicView()` exclusively. Automatic reveal happens only after both sides commit. Scheduled handler selects committed or expired-due battles before processing them. A local integration test verifies 101 waiting battles cannot delay a committed reveal. No vote, economy, social event, territory, hidden Web UI or `finalize` route is provided.

## Private API

| Route | Credential | Response / purpose |
|---|---|---|
| `POST /v1/admin/battles` | admin token + `Idempotency-Key` | Create or recover one battle and its two participant capabilities for the same vetted pair |
| `GET /v1/battles/{battleId}` | participant token | Strict role-specific public view only |
| `POST /v1/battles/{battleId}/commit` | participant token | Body `{commandId, selection}`; no actor/role/time accepted outside selection's validated role |

**Env contract:** `DB` binding to a dedicated gameplay D1, `ADMIN_CONTROL_TOKEN` (at least 32 base64url-safe characters, secret), `CREATE_RECOVERY_KEYS` (version-to-32-byte-base64url keyring stored as a Cloudflare secret), `CREATE_RECOVERY_KEY_CURRENT` (current key version), `COMMIT_WINDOW_MS` (explicit operator choice; no default), and `ALLOWED_ORIGIN` (strict exact CORS origin for browser clients). Do not put recovery key material in checked-in vars or logs. No private D1 IDs, admin credentials, recovery keys or participant tokens are committed.

### Create recovery security assumptions and rotation

- This private alpha currently has one administrative principal: every holder of `ADMIN_CONTROL_TOKEN` is the same principal, and authorization is checked before any idempotency lookup. Do not add multiple admin principals without scoping the durable key to a stable admin subject and reviewing cross-principal collision behavior.
- The administrator generates and persists an unpredictable key of at least 128 bits per logical create request and reuses it after timeouts. Same key + same canonical participants recovers the same IDs and capabilities; same key + changed participants fails closed. A new key means an intentional new battle.
- The 256-bit AES key is held outside D1 in the Worker secret store. Recovery uses AES-GCM authenticity as well as confidentiality; missing, wrong or removed keys cause recovery to fail closed and never mint replacement tokens. AAD prevents moving ciphertext between battles, request keys, deadlines or key versions. Rotate well before `2^32` encryptions per key; keep old versions decrypt-only until all matching ciphertext has been deleted under an approved retention policy.
- Rotation sets a new current key version for new rows and retains prior versions as decrypt-only while any corresponding ciphertext remains. With this prototype's current unbounded row retention, old keys cannot safely be removed yet. The keyring must be backed up under separate access controls from D1; the backup/restore and revocation policy is still a release gate.
- Creation rows have no automatic expiry until retention is approved. This intentionally leaves storage growth and long-term encrypted-secret retention unresolved rather than silently choosing a privacy period. A retention/deletion policy must define when ciphertext and idempotency rows are erased and when old key versions can be destroyed.
- Deployment is blocked on approval of identity/retention/revocation/backup policy and operational rotation ownership. The local tests use synthetic test-only key material and are not production security acceptance.

Local `wrangler.api-local-test.jsonc` is **test-only**, and deliberately contains no production D1 ID, account, admin token, deployment target or public Worker route.

## Executable evidence

Dedicated [Chat 03B2 GitHub Actions](https://github.com/samuray-games/AsyncScene/actions/workflows/chat03b2-private-api.yml) run:

```sh
node --check gameplay-server/src/worker.js
node gameplay-server/test/private_api_local_test.mjs
```

The integration harness installs all three migrations in a disposable local Wrangler/workerd D1, runs a synthetic admin + two participants, asserts unauthorized/forged actor requests are rejected, verifies secrets remain hidden before both commits, exercises 100 fresh command IDs and concurrent duplicates without state growth, tests idempotent create replay and changed-input rejection, races concurrent create/commit requests, and restarts the Worker while rotating the recovery key to confirm durable create recovery. It does not use actual Cloudflare credentials or touch telemetry.

## Explicit release blockers

1. Parent #440 must pass current-head independent review and integrate without modifying `main` directly; this stacked PR must be reviewed separately.
2. The proposed private-alpha bearer capability scheme is **not** permanent verified account identity; the final identity provider, token rotation/revocation, second-device ownership policy and privileged bootstrap distribution require explicit acceptance.
3. Decide gameplay retention, including encrypted create-recovery row expiry/deletion, backup/keyring restore, player-data erasure, legal/privacy handling, audit policy, abuse limits and secret rotation. Do not silently reuse telemetry's 30-day retention or its owner token.
4. Review/deploy only to a **dedicated** gameplay Worker and D1 after authenticated Cloudflare staging tests. The existing test probe Worker with `/inspect` must **never** be deployed.
5. Configure and test actual scheduled/timeout behavior, reconnect with real browser clients, crash/error monitoring, D1 remote concurrency and Safari runtime acceptance.
6. DRAW and hand-edited non-DRAW recognition/finalization remain gated by Chat 05. No secure public PvP or full Chat 03 PASS claim is made.

**Overall:** `CHAT03B2_PRIVATE_API_LOCAL_PASS / PRODUCTION_BLOCKED / CHAT03_IN_PROGRESS`.
