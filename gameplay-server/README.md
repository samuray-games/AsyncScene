# Social Combat Chat 03B1 - atomic gameplay storage foundation

**Status:** isolated experimental database foundation. NOT a deployed gameplay backend,
not integrated with the browser game and NOT a secure multiplayer API.
[Implementation issue #439](https://github.com/samuray-games/AsyncScene/issues/439).

## Motivation

The repository's `telemetry-receiver` is a privacy-restricted 30-day analytics
receiver. Its anonymous event IDs are NOT player authentication; its tables and
retention must NOT be used for combat choices, authored text, or player state.

The proposed provider for future gameplay persistence is Cloudflare Workers +
a **separate, explicitly approved and provisioned gameplay D1 database**.
This migration exists only in `gameplay-server/migrations`, **not** in
`telemetry-receiver/migrations`. Do not run it against the telemetry D1 binding.

## Atomic battle creation and origin event

The trusted lifecycle `createBattle` returns a version-0 snapshot containing
one `battle.created` event. A separate direct table INSERT could lose this
event on a crash; the `gameplay_create_battle` write-only view instead accepts
`(battle_id, initial_state_json, creation_event_json, trusted_now_ms)`.
Its trigger checks genesis and the event identity/type/version, then inserts
`gameplay_battles` and `gameplay_event_outbox` atomically.

This is a **storage fence, not caller authentication or full gameplay state
validation**. Only a trusted Worker running the actual lifecycle module may
supply the snapshot. Creation capabilities / player identity are not part of
this foundation.

## Atomic transition protocol (draft)

The single SQL statement is an `INSERT` into write-only view
`gameplay_apply_transition` with nine bound values, in column order:

1. `battle_id`: trusted persistent battle ID;
2. `expected_version`: state version that the caller loaded;
3. `command_id`: stable idempotency key from the command body;
4. `fingerprint`: canonical command-body fingerprint excluding server time;
5. `receipt_code`: lifecycle response code;
6. `receipt_event_ids_json`: JSON array of new event IDs;
7. `next_state_json`: internal state returned by the trusted lifecycle module;
8. `events_json`: JSON array of **newly emitted** events (not full history);
9. `trusted_now_ms`: server-authoritative integer timestamp.

SQLite's `INSTEAD OF INSERT` trigger checks the current version and basic
immutable snapshot fields, then writes the new state, command receipt and
event outbox in **one SQL statement**. A stale version or duplicate outbox
event aborts the complete statement, not just the offending row.

The caller must only construct commands after authentication and must load
the private snapshot server-side. The schema does not authenticate clients,
calculate battle results, prove immutable source provenance, or return public
views. This is NOT a replacement for `Game.TacticalCombatLifecycleV1`.

On a CAS conflict, the future adapter must reload battle state and check
`gameplay_command_receipts(battle_id, command_id)`. Matching fingerprints
return original receipt; different fingerprints are rejected. It must never
retry the same state transition against a changed version without re-evaluation.

A **single authoritative D1 transaction** is the scope of this atom.
The future worker must test D1's actual trigger support and concurrency:
passing local SQLite does NOT establish deployed D1 behavior.

## Tests

Run with standard Python and SQLite, with no third-party dependencies:

```bash
python -m unittest discover -s gameplay-server/test -p 'test_*.py' -v
```

The dedicated `chat03b1-gameplay-cas.yml` workflow runs two independent
jobs: 22 native SQLite/Python test methods and an additional *Wrangler local D1*
integration run through the real local `workerd` Worker binding. The latter
uses `wrangler.local-test.jsonc` and the test-only Worker in `test/`,
applies the committed SQL migration in a disposable isolated local D1,
then checks CAS, atomic genesis/origin event, exact receipt/outbox bijection, event versions, rollback
and simultaneous same-version requests. It does not require Cloudflare tokens,
provision any remote database, or access the existing telemetry D1.

Wrangler's Worker D1 binding exposes JavaScript integral `Number` arguments
as SQL `REAL` rather than `INTEGER`. The migration deliberately accepts
both SQL numeric storage types ONLY for mathematically integral, nonnegative
and JavaScript-safe version/timestamp values. Native SQLite Python tests
also cover this D1-compatible behavior and fractional-clock rejection.
The first Wrangler integration run exposed this previously missed mismatch.

**Evidence boundary:** on 2026-10-22, the user reported a hosted Cloudflare
D1 SQL API test of migration `0001_tactical_state.sql` on PR #440 HEAD
`ed6c01d50b49a5afa02437dac096c2f9e0551836`, with result
`HOSTED_D1_SQL_CAS_PASS` ([issue #439 evidence](https://github.com/samuray-games/AsyncScene/issues/439#issuecomment-6332989583)).
That test covered transition CAS/rollback, but did not exercise the newer
genesis+origin view. It is separate from GitHub CI, which runs offline SQLite
and Wrangler local D1 checks; neither is an updated hosted acceptance run for
the genesis view. Migrations 0002/0003 and the authenticated remote Worker
remain unverified. The test-only Worker has unauthenticated inspection and
MUST NOT be deployed.

## Hosted preflight status

The old Chat03B1 hosted runner,
`test/remote_d1_ephemeral.mjs`, is **RETIRED**. Its remote execution and
cleanup code has been removed. The file retains only pure SQL fixture exports
for offline tests; invoking it as a CLI exits with
`LEGACY_HOSTED_RUNNER_DISABLED` without network access, regardless of
Cloudflare environment variables.

The maintained safety-hardened hosted D1 preflight is in stacked Draft
[PR #441](https://github.com/samuray-games/AsyncScene/pull/441). It is the
single supported hosted-preflight path. Its real hosted execution requires
PR #441's integration to be complete and separate explicit authorization;
neither this retirement nor local/CI checks authorize a hosted run. Do not
restore or create another hosted runner here. Do not deploy to production or
start a hosted Worker without separate explicit authorization. The PR #441
implementation is not yet integrated or authorized for real Cloudflare
execution.

## Required follow-up gates

- Approve game authority, provider and its own D1 database, retention, backup
  and privacy handling (the migration is not deployed or provisioned).
- Implement secure player identity, second-device session/reconnection,
  trusted system actor and server time. Never use telemetry anonymous IDs or
  ship owner/system keys to the browser.
- Validate `tactical_v1` rules, immutable role provenance, seed and snapshot
  origin server-side. The current lifecycle core does not yet store a seed.
- Implement an isolated Worker and adapter using prepared bindings, transaction
  receipt replay, strict public views and real-D1 integration/concurrency tests.
- Gate DRAW and hand-edited non-DRAW finalization on Chat 05 recognition rules.
  No UI, voting, economy, NPC, legacy battle or Stage 7.15 runtime changes here.

**Acceptance level:** SQL schema + SQLite unit/integration tests only, pending
independent review. No runtime/Safari/PvP security claim.

## Chat 03B2 private API overlay

The current stacked PR adds an isolated private Worker API in
[`CHAT03B2.md`](CHAT03B2.md), backed by the same dedicated gameplay D1 schema.
It requires a client-persisted `Idempotency-Key` for administrative creation
and stores the capability recovery payload only as AES-256-GCM ciphertext.
Migration `0003_idempotent_battle_creation.sql` stores the key and request
fingerprints, battle/deadline identity, key version, nonce and ciphertext;
participant authorization remains SHA-256-digest-only.

The keyring must be provisioned as Worker secrets and rotated by retaining old
decrypt-only versions while matching rows exist. Creation rows currently have
no expiry because retention has not been approved. Identity, revocation,
retention/deletion, backup/key restore and secret-rotation ownership remain
explicit pre-deployment gates. The local test key is synthetic and the
test-only inspection Worker must never be deployed.

### Hosted D1 migration preflight

`test/hosted_chat03b2_d1_preflight.mjs` applies migrations 0001, 0002 and 0003
to a random `asynchronia-chat03b2-scratch-*` Cloudflare D1 through the D1 SQL
API. It has a hard opt-in (`CHAT03B2_HOSTED_D1_APPROVED=YES`), accepts no target
database name or UUID from the caller, and only addresses the UUID returned by
its own create request. Before CREATE, it writes a mode-0600 intent record with
the exact random name and account ID. A lost response therefore leaves a
durable ambiguous-create record and blocks ordinary reruns before any API call.
It checks atomic creation of the battle, origin event,
both capability digest rows and a ciphertext-shaped idempotency/recovery row,
plus rollback for bad genesis, capability, idempotency and recovery constraints.
Fixture digests/ciphertext are synthetic and do not validate AES-GCM. Before
every DELETE, normal cleanup and retry both GET the UUID and require an exact
UUID plus full scratch-name match. CREATE response-name mismatch, pre-delete
identity mismatch, and uncertain cleanup retain the mode-0600 record for manual
investigation and never issue DELETE. Confirmed cleanup requires a post-delete
GET showing absence. The final `HOSTED_D1_SQL_API_PASS` is emitted only after
all SQL probes pass and cleanup is confirmed. A process-kill may leave a stale
invocation lock; the tool refuses to remove it automatically. Confirm its PID
is no longer running before manually removing that exact lock.

**Resolving an ambiguous CREATE:** inspect the Cloudflare dashboard in the
recorded account ID and search for the exact full random database name in the
mode-0600 pending record. Never infer or guess a UUID. If the database exists,
record its UUID from that exact-name dashboard entry, verify account and full
name, delete that exact resource manually in the dashboard, then refresh and
confirm it is absent. For a CREATE-response mismatch, also investigate the
returned UUID and `createResponseName` stored in the marker; do not delete that
resource if its full name differs from the generated scratch name. If no
matching scratch database exists, confirm the account and exact-name search
completed and leave any unrelated resource untouched. Only then clear the local marker with the explicit
`CHAT03B2_HOSTED_D1_RESOLVE_AMBIGUOUS=YES` mode, supplying the exact recorded
account and name plus `CHAT03B2_HOSTED_D1_RESOLUTION=VERIFIED_DELETED` or
`VERIFIED_ABSENT`. This local-only acknowledgement makes no Cloudflare request;
it does not delete a remote resource. A mismatch or missing confirmation keeps
the marker and continues blocking normal runs.

After completing that dashboard check, use this local-only acknowledgement:

```bash
CHAT03B2_HOSTED_D1_RESOLVE_AMBIGUOUS=YES \
CHAT03B2_HOSTED_D1_RESOLUTION_ACCOUNT_ID='<exact account ID from marker>' \
CHAT03B2_HOSTED_D1_RESOLUTION_NAME='<exact full scratch name from marker>' \
CHAT03B2_HOSTED_D1_RESOLUTION=VERIFIED_ABSENT \
node gameplay-server/test/hosted_chat03b2_d1_preflight.mjs
```

Use `VERIFIED_DELETED` only after manually deleting the exact resource and
confirming absence. This mode needs no API token and makes zero network calls.

Migration SQL uses Cloudflare's [D1 raw query API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/raw/); the create/rollback probe uses its batch request form and the documented [D1 transactional batch behavior](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch).

Offline safety tests run with:

```bash
node --test gameplay-server/test/hosted_chat03b2_d1_preflight.test.mjs
```

An actual hosted run requires separate user authorization and a narrowly
scoped `CLOUDFLARE_API_TOKEN` with D1 database create, query, read and delete
permissions. The normal command is:

```bash
CHAT03B2_HOSTED_D1_APPROVED=YES node gameplay-server/test/hosted_chat03b2_d1_preflight.mjs
```

If cleanup fails after a validated CREATE response, do not start another
database test. The retry mode performs a GET identity check before DELETE and
again verifies absence afterward:

```bash
CHAT03B2_HOSTED_D1_APPROVED=YES CHAT03B2_HOSTED_D1_RETRY_CLEANUP=YES node gameplay-server/test/hosted_chat03b2_d1_preflight.mjs
```

The command above is documentation only; this change's tests do not contact
Cloudflare. Success is `HOSTED_D1_SQL_API_PASS (NOT WORKER_AUTH_PASS)` and
means SQL checks passed plus scratch deletion was confirmed. No
Worker is created or deployed. Actual authenticated Worker validation is a
separate gate requiring separate approval. `ADMIN_CONTROL_TOKEN` is for trusted
server-side creation and must never be placed in browser code. Current CORS
does not allow `Idempotency-Key`, so browser preflight for the admin endpoint
fails; see [`CHAT03B2.md`](CHAT03B2.md).
