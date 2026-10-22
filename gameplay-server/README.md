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

**Evidence boundary:** on 2026-10-22, the user verified migration
`0001_tactical_state.sql` against a separate hosted Cloudflare D1 database on
PR #440 HEAD `ed6c01d50b49a5afa02437dac096c2f9e0551836`; the reported result was
`HOSTED_D1_SQL_CAS_PASS` ([issue #439 evidence](https://github.com/samuray-games/AsyncScene/issues/439#issuecomment-6332989583)).
Migrations 0002/0003 and the remote authenticated Worker remain unverified.
The test-only Worker has unauthenticated inspection and MUST NOT be deployed.

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
its own create request. It checks atomic creation of the battle, origin event,
both capability digest rows and a ciphertext-shaped idempotency/recovery row,
plus rollback for bad genesis, capability, idempotency and recovery constraints.
Fixture digests/ciphertext are synthetic and do not validate AES-GCM. It attempts
deletion in `finally`, confirms absence with a separate GET, and writes a
0600 pending-cleanup record if the result is uncertain. A later normal run is
blocked until cleanup is verified; explicit cleanup retry mode rechecks the
stored ID/name pair and never creates a database. A process-kill may leave a
stale invocation lock; the tool will refuse to delete it automatically. Confirm
the recorded PID is no longer running before manually removing that exact lock,
then use the pending-cleanup retry mode if the database marker exists.

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

If deletion fails, do not start another database test. After inspecting the
pending cleanup record and confirming the intended account, retry only the
recorded UUID with:

```bash
CHAT03B2_HOSTED_D1_APPROVED=YES CHAT03B2_HOSTED_D1_RETRY_CLEANUP=YES node gameplay-server/test/hosted_chat03b2_d1_preflight.mjs
```

The command above is documentation only; this change's tests do not contact
Cloudflare. Success is `HOSTED_D1_SQL_API_PASS (NOT WORKER_AUTH_PASS)`. No
Worker is created or deployed. Actual authenticated Worker validation is a
separate gate requiring separate approval. `ADMIN_CONTROL_TOKEN` is for trusted
server-side creation and must never be placed in browser code. Current CORS
does not allow `Idempotency-Key`, so browser preflight for the admin endpoint
fails; see [`CHAT03B2.md`](CHAT03B2.md).
