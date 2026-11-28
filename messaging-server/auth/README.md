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
# Only for a first local run with a completely empty auth DB and no authority file:
export AUTH_CHECKPOINT_BOOTSTRAP="1"
npm run dev
```

The dev runner binds only to `127.0.0.1`, opens the auth SQLite database and a physically separate checkpoint-authority SQLite database under `messaging-server/auth/.local`, and never enables a remote binding. Values are passed to the process and are not written or printed. The local origin is `http://localhost:8787`, with RP ID `localhost`; browser WebAuthn acceptance and Cloudflare Worker/D1/Durable Object compatibility remain separate gates.

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

## Local rollback checkpoint model

`LocalCheckpointAuthority` stores a monotonic sequence, hash chain, committed journal and at most one prepared event in a different SQLite file from the auth DB. A rejected operation is removed only after the auth transaction's invariant trigger proves that the batch rolled back and the prior checkpoint still matches. The dev runner refuses to create a missing authority unless `AUTH_CHECKPOINT_BOOTSTRAP=1` is explicitly set and the auth database has no accounts, credentials, invitations, pre-auth contexts, challenges, recovery codes, sessions or operation commits. Existing populated legacy databases cannot be silently adopted. Both files must have different paths. Every Worker request, including session reads, runs under the authority's local serial queue and compares the auth DB checkpoint with the authority head. The request body is fully bounded and buffered before it enters that queue. Missing or unavailable authority, a missing checkpoint, or any finalized head mismatch returns a fixed 503. The old `AUTH_DB_GENERATION` remains a secondary startup check; it is not the rollback defense.

An auth operation uses this order: persist a prepared authority event, apply the auth mutation and advance its checkpoint in one auth SQLite batch, then finalize the authority event. If a process stops after prepare, the next request retries that exact event only when the auth DB is still at its exact prior sequence. If the database already contains the event, the authority finalizes it. A mismatch after finalized history fails closed; it is never silently reconciled from a stale snapshot. Replaying an invite-revoke uses the same journal. The journal stores only data already present in auth operation rows, including token/code hashes rather than raw secrets.

This is a local model, not a deployed Durable Object. It does not prove Cloudflare transaction, concurrency, storage durability, or restore behavior. A copy of the auth DB from before any finalized operation is denied even when its generation variable is unchanged. Restoring both SQLite files from the same old point restores their matching head and can restore access; detecting that requires a third independent trust source, such as an externally protected monotonic checkpoint. Never claim protection against simultaneous rollback of both stores.

All account-changing operations insert one unique `auth_operation_commits` row. A `BEFORE INSERT` trigger verifies the exact invite, challenge, pre-auth context, credential counter, session and auth epoch; failure calls `RAISE(ABORT)`. An `AFTER INSERT` trigger applies all related changes inside the same SQLite statement. The auth operation and checkpoint advance are in one atomic batch. D1 batch is used for paired pre-auth/challenge creation.

A future message write still needs a separate reviewed adapter. It must verify the live session, account status and `auth_epoch` at the message insert's own SQL boundary, under authority serialization, and atomically consume a one-use fence in the same auth/message transaction. This module exposes no session-fence statement helper and does not create a message table or API. Its tests use a private raw SQL fixture only to exercise the existing fence trigger; that fixture is not a supported application API.

## Local recommended values and owner decisions

These values only make local tests repeatable. They are configurable through `AUTH_*` bindings; none is production policy:

- idle session 30 days; absolute session lifetime 90 days;
- retain expired/revoked session rows for 90 days, then allow explicit pruning;
- invitation 7 days; challenge 5 minutes; pre-auth 10 minutes;
- 10 recovery codes of 160 random bits each;
- 10 writes per IP/path per 60-second window.

The owner still needs to decide production idle/absolute lifetimes and record retention, invitation delivery and operator verification/credential custody, rate thresholds and audit retention, origin/RP ID and domain, backup-passkey expectations, recovery-code handling and owner-assisted recovery, secret custody/rotation, authority backup/restore policy, and future D1/Worker/Durable Object topology. The local authority deliberately remains unavailable if restored behind finalized auth state. Safe service restoration then requires an owner-operated recovery procedure using a known-good auth snapshot. A monotonic checkpoint outside all jointly restored stores remains necessary to detect rollback of both stores.

`pruneTerminalSessions()` is an explicit utility; there is no timer or automatic deletion. No cloud resource, remote database, production migration, secret, or custom domain is created by this module.

## Evidence boundary

`npm test` exercises the real SimpleWebAuthn verifier with test-only signed WebAuthn fixtures and Node's built-in SQLite engine through a small D1-shaped adapter. This proves local SQLite behavior, not Cloudflare D1/workerd behavior. It is not a real browser, physical authenticator, hosted Worker, remote D1, two-device, production restore, or deployment acceptance. Do not claim `SERVER_RUNTIME_PASS` until the future message API provides real persistence/delivery and a real two-player runtime check.
