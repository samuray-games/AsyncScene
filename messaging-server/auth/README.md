# Chat04.1Б local account and session module

This is a local-only authentication module for the future public messaging API. It does not store or deliver messages. It does not read gameplay D1, telemetry IDs, gameplay `personId`, or battle capabilities. The module does not implement an email or password login.

## Local execution

Requirements: Node.js 22 or later. Install the pinned dependencies and run tests:

```sh
npm ci
npm test
```

For a local HTTP harness, generate process-only operator and rate-limit keys and start the Node adapter:

```sh
export AUTH_OPERATOR_SECRET="$(openssl rand -hex 32)"
export AUTH_RATE_LIMIT_KEY="$(openssl rand -hex 32)"
export AUTH_DB_GENERATION="1"
npm run dev
```

The dev runner binds only to `127.0.0.1`, opens a local SQLite database under `messaging-server/auth/.local`, and never enables a remote binding. Values are passed to the process and are not written or printed. The local origin is `http://localhost:8787`, with RP ID `localhost`; browser WebAuthn acceptance and Cloudflare Worker/D1 compatibility remain separate gates.

The operator issues one-time invitations with `POST /v1/auth/invitations` and an `Authorization: Bearer` operator credential. The returned invitation token is shown once; only its SHA-256 digest is stored. There is no public invitation-creation route.

## Endpoints in this isolated module

- `POST /v1/auth/invitations` and `POST /v1/auth/invitations/{id}/revoke`: operator-only invite issue/revoke.
- `POST /v1/auth/register/options` and `/verify`: invite registration, discoverable resident passkey, required user verification.
- `POST /v1/auth/login/options` and `/verify`: discoverable passkey sign-in.
- `GET /v1/auth/session`, `POST /v1/auth/logout`, `/sessions/revoke-all`.
- `POST /v1/auth/passkeys/add/options` and `/verify`: add a backup passkey from a current session with CSRF and user verification.
- `POST /v1/auth/recovery/begin`, `/options`, `/verify`: reserve a one-time code in a short-lived pre-auth context, enroll a new passkey, then rotate sessions, credentials, and codes atomically.
- `POST /v1/auth/recovery/codes/rotate`: replace recovery codes from an authenticated session.

The session bearer is a random opaque value sent only as `__Host-asynchat; Secure; HttpOnly; SameSite=Strict; Path=/`. The database stores its digest. A separate readable CSRF cookie is required alongside the `X-CSRF-Token` header. Writes require an exact configured Origin and same-origin Fetch Metadata. Auth errors use bounded codes and never reflect request data or SQL exception text.

## Atomicity and future message adapter

All account-changing operations insert one unique `auth_operation_commits` row. A `BEFORE INSERT` trigger verifies the exact invite, challenge, pre-auth context, credential counter, session and auth epoch; failure calls `RAISE(ABORT)`. An `AFTER INSERT` trigger applies all related changes inside the same SQLite statement. The effects are not a sequence of unchecked conditional updates. D1 batch is used for paired pre-auth/challenge creation.

A future message write must verify the live session, account status and `auth_epoch` at the message insert's own SQL boundary. `createSessionFenceStatement()` provides a transaction fence for D1 batches, but the message table must also have an insert trigger that checks the fence is unused and the session/epoch remains active, then consumes the fence in that same batch. A fence created earlier is never sufficient on its own. This module includes a test-only effect table/trigger in the test suite; it does not create a message table or API.

## Local recommended values and owner decisions

These values only make local tests repeatable. They are configurable through `AUTH_*` bindings; none is production policy:

- idle session 30 days; absolute session lifetime 90 days;
- retain expired/revoked session rows for 90 days, then allow explicit pruning;
- invitation 7 days; challenge 5 minutes; pre-auth 10 minutes;
- 10 recovery codes of 160 random bits each;
- 10 writes per IP/path per 60-second window.

The owner still needs to decide production idle/absolute lifetimes and record retention, invitation delivery and operator verification/credential custody, rate thresholds and audit retention, origin/RP ID and domain, backup-passkey expectations, recovery-code handling and owner-assisted recovery, secret custody/rotation, backup/restore authority, and future production D1/Worker topology. The dev runner requires an externally managed `AUTH_DB_GENERATION` value and has no default. A restored older copy fails closed only when that independent value has been advanced past the generation stored in the database. The database cannot detect restoration of an older copy by itself; choosing and operating a monotonic checkpoint outside all database backups remains a blocking production decision.

`pruneTerminalSessions()` is an explicit utility; there is no timer or automatic deletion. No cloud resource, remote database, production migration, secret, or custom domain is created by this module.

## Evidence boundary

`npm test` exercises the real SimpleWebAuthn verifier with test-only signed WebAuthn fixtures and Node's built-in SQLite engine through a small D1-shaped adapter. This proves local SQLite behavior, not Cloudflare D1/workerd behavior. It is not a real browser, physical authenticator, hosted Worker, remote D1, two-device, production restore, or deployment acceptance. Do not claim `SERVER_RUNTIME_PASS` until the future message API provides real persistence/delivery and a real two-player runtime check.
