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

The dedicated `chat03b1-gameplay-cas.yml` workflow runs these tests for PRs.
Coverage includes an actual SQLite-file two-connection concurrency race, stale
CAS, rollback on event conflict, immutable snapshot guards, and receipt uniqueness.

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
