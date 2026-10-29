# Chat 03B2: private gameplay Worker prototype

**Status:** STACKED DRAFT, **NOT DEPLOYED**. Depends on [PR #440](https://github.com/samuray-games/AsyncScene/pull/440) for atomic genesis / CAS / outbox. [PR #441](https://github.com/samuray-games/AsyncScene/pull/441) is an independent write scope stacked on that draft branch, not a production game service.

## Trusted boundary

- Worker loads the merged `TacticalCombatLifecycleV1` and `TacticalCombatV1` server-side. No attacker-controlled state, actorId, roles, version or server clock are accepted at participant routes.
- One admin capability (`ADMIN_CONTROL_TOKEN`, **not** the telemetry owner token) controls private battle creation. The bootstrap response contains one distinct 256-bit random bearer token per player, which the admin must distribute privately.
- Only SHA-256 digests of participant tokens are stored in `gameplay_battle_capabilities`. Each token grants access solely to a single battle/side, and can be carried to another device for reconnection.
- `createdAt`, confirmation deadline, generated battle ID and system actor are Worker-authoritative. `COMMIT_WINDOW_MS` is **required** and bounded at startup. That bound is a technical safety range, not an approved game-design timeout.
- Initial state + origin event + both capability records + create-idempotency record commit in one D1 `batch()` transaction. `POST /v1/admin/battles` requires a client-persisted high-entropy `Idempotency-Key`; the database stores only its SHA-256 digest and a participant-payload fingerprint. Matching retries return the original battle/deadline/capabilities; a changed payload using that key returns `409`.
- The original create result (deadline, participant IDs and capability tokens) is encrypted with AES-256-GCM before persistence. Each encryption uses a random 96-bit nonce; authenticated additional data binds the ciphertext to the purpose, idempotency-key digest, request fingerprint, battle ID, deadline and key version. D1 stores the nonce and ciphertext, never plaintext capability tokens. Participant authorization continues to use only SHA-256 token digests.
- Subsequent lifecycle commands use versioned atomic `gameplay_apply_transition`; same-command replay consults the durable receipt and rejects conflicting payloads. A fresh command ID after that side has committed returns `409 ALREADY_COMMITTED` for an identical normalized selection or `409 COMMIT_IMMUTABLE` for a different valid selection, without creating a receipt or transition.
- Participant reads use the lifecycle's `getPublicView()` exclusively. Automatic reveal happens only after both sides commit. Scheduled handler selects committed or expired-due battles before processing them. A local integration test verifies 101 waiting battles cannot delay a committed reveal. No vote, economy, social event, territory, hidden Web UI or `finalize` route is provided.

## Private API

| Route | Credential | Response / purpose |
|---|---|---|
| `POST /v1/admin/battles` | admin token + `Idempotency-Key` | Create or recover one battle and its two participant capabilities for the same vetted pair |
| `GET /v1/battles/{battleId}` | participant token | Strict role-specific public view only |
| `POST /v1/battles/{battleId}/commit` | participant token | Body `{commandId, selection}`; no actor/role/time accepted outside selection's validated role |

**Env contract:** `DB` binding to a dedicated gameplay D1, `ADMIN_CONTROL_TOKEN` (at least 32 base64url-safe characters, secret), optional `OPERATOR_READ_TOKEN` (a separate unpredictable secret of at least 32 characters, stored server-side and distinct from `ADMIN_CONTROL_TOKEN`), `CREATE_RECOVERY_KEYS` (version-to-32-byte-base64url keyring stored as a Cloudflare secret), `CREATE_RECOVERY_KEY_CURRENT` (current key version), `COMMIT_WINDOW_MS` (explicit operator choice; no default), and `ALLOWED_ORIGIN` (strict exact CORS origin for browser clients). If `OPERATOR_READ_TOKEN` is unset, capability status readback fails closed. If it equals `ADMIN_CONTROL_TOKEN`, readback authorization fails and the existing API configuration check blocks the other API routes. The key authorizes only `GET /v1/admin/battles/{battleId}/capabilities/{side}/status`, which returns that side's `generation` and `status` without changing state. Never put `OPERATOR_READ_TOKEN` in browser code or storage, the repository, logs, or screenshots. Do not put recovery key material in checked-in vars or logs. No private D1 IDs, admin credentials, operator-read or recovery keys, or participant tokens are committed.

Administrative battle creation is a trusted server-side operation. Keep
`ADMIN_CONTROL_TOKEN` on a trusted server and never put it in browser code,
browser storage, or client configuration. The current CORS response allows
`Authorization, Content-Type` but does not allow `Idempotency-Key`; a browser
preflight for `POST /v1/admin/battles` therefore fails. Treat this admin route
as server-to-server only until CORS policy and the privileged bootstrap flow
receive a separate security review. Do not widen the allowlist as part of the
hosted SQL preflight.

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

## Hosted D1 staging preflight and separate Worker-auth gate

`test/hosted_chat03b2_d1_preflight.mjs` is an offline-by-default tool for
applying migrations 0001, 0002 and 0003 to a uniquely named
`asynchronia-chat03b2-scratch-*` D1 and probing SQL/API constraints. It requires
`CHAT03B2_HOSTED_D1_APPROVED=YES`, `CLOUDFLARE_ACCOUNT_ID` and a narrowly scoped
`CLOUDFLARE_API_TOKEN`. Before sending CREATE, the script atomically writes a
mode-0600 intent record containing the exact random scratch name and account
ID. A lost CREATE response leaves an ambiguous marker and blocks ordinary
reruns before any API request. It uses the returned UUID for SQL and, before
every DELETE, GETs that UUID and requires both UUID and full scratch name to
match the durable record. CREATE-name mismatch, pre-delete mismatch and
uncertain cleanup retain the record for investigation and never send DELETE.
Confirmed cleanup includes a post-delete GET showing absence. A normal rerun
is blocked while any marker exists; explicit cleanup retry is allowed only for
a validated returned UUID and repeats the same GET identity check. The final
SQL API PASS is printed only after SQL probes pass and cleanup is confirmed.
A process kill can leave an invocation lock; it is never removed automatically.
Confirm its PID is no longer running before manually removing that exact lock.
No Worker is created or deployed, and the telemetry D1 is not read or accepted
as a target.

For an ambiguous CREATE, manually inspect the Cloudflare dashboard in the
recorded account for the exact full scratch name in the local marker. Never
guess a UUID or delete by name. If the exact resource exists, verify its account
and full name, obtain its UUID from that dashboard entry, delete it manually,
then refresh and confirm absence. For a CREATE-response mismatch, also inspect
the recorded returned UUID and `createResponseName`; do not delete a resource
whose full name differs from the generated scratch name. Leave unrelated
resources untouched. If the expected scratch resource does not exist, confirm
the account and exact-name search. Only after these checks, clear the marker with
`CHAT03B2_HOSTED_D1_RESOLVE_AMBIGUOUS=YES`, the exact recorded account/name,
and disposition `VERIFIED_DELETED` or `VERIFIED_ABSENT`. This local-only
acknowledgement makes no Cloudflare request and never performs deletion. Any
mismatch leaves the marker in place.

Set `CHAT03B2_HOSTED_D1_RESOLUTION_ACCOUNT_ID` and
`CHAT03B2_HOSTED_D1_RESOLUTION_NAME` to the exact values from the marker, and
`CHAT03B2_HOSTED_D1_RESOLUTION` to the verified disposition before invoking the
script. This resolution mode does not require an API token.

The preflight's final success label is
`HOSTED_D1_SQL_API_PASS (NOT WORKER_AUTH_PASS)`; it appears only after SQL
checks pass and deletion is confirmed by GET.
It checks hosted migration execution, atomic D1 batch creation of one battle,
the genesis event, two capability digests and a ciphertext-shaped recovery /
idempotency fixture, plus rollback on invalid constraints. Fixture digests and
ciphertext bytes are synthetic; this SQL check does not test AES-GCM encryption
or recovery. It also does not verify the HTTP Worker, admin/player
authentication, CORS, secrets bindings, authorization, or deployed Worker
concurrency.

A future Worker-auth pass is a separate operation requiring its own explicit
authorization: provision a dedicated non-production Worker and scratch gameplay
D1, apply approved migrations, install synthetic admin/recovery secrets only
through secret bindings, invoke admin creation server-to-server (never from a
browser), and exercise unauthorized admin/player requests, capability
isolation, idempotent retries, CORS preflight behavior, two-party commits,
reveal, timeout, restart recovery and cleanup. Record it as
`REMOTE_WORKER_AUTH_PASS` only after those deployed authenticated Worker checks
actually complete. The hosted SQL API preflight deliberately does not create a
Worker or claim that level of acceptance.

**Not run by offline CI:** the hosted preflight is not invoked from the test
suite; only its safety/unit tests run automatically. A real hosted run requires
a separate explicit user authorization.

## Explicit release blockers

1. Parent #440 must pass current-head independent review and integrate without modifying `main` directly; this stacked PR must be reviewed separately.
2. The proposed private-alpha bearer capability scheme is **not** permanent verified account identity; the final identity provider, token rotation/revocation, second-device ownership policy and privileged bootstrap distribution require explicit acceptance.
3. Decide gameplay retention, including encrypted create-recovery row expiry/deletion, backup/keyring restore, player-data erasure, legal/privacy handling, audit policy, abuse limits and secret rotation. Do not silently reuse telemetry's 30-day retention or its owner token.
4. Review/deploy only to a **dedicated** gameplay Worker and D1 after authenticated Cloudflare staging tests. The existing test probe Worker with `/inspect` must **never** be deployed.
5. Configure and test actual scheduled/timeout behavior, reconnect with real browser clients, crash/error monitoring, D1 remote concurrency and Safari runtime acceptance.
6. DRAW and hand-edited non-DRAW recognition/finalization remain gated by Chat 05. No secure public PvP or full Chat 03 PASS claim is made.

**Overall:** `CHAT03B2_PRIVATE_API_LOCAL_PASS / PRODUCTION_BLOCKED / CHAT03_IN_PROGRESS`.
