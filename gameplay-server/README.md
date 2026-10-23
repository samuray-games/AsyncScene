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

**Evidence boundary:** the previous remote Cloudflare SQL API probe verified
transition CAS/rollback on an earlier migration. It did not cover the newer
genesis+origin view. The current migration has SQLite + Wrangler local D1
verification, **NOT an updated hosted D1 acceptance run**. The test-only
Worker has unauthenticated inspection and MUST NOT be deployed.

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
restore or create another hosted runner here. The PR #441 implementation is
not yet integrated or authorized for real Cloudflare execution.

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
