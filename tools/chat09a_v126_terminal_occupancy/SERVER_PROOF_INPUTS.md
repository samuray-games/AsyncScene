# Exact external proof inputs missing from this synthetic V126 oracle

No values below are asserted as existing or production-ready. A boolean `trusted=True` or a JavaScript object is not proof of any of these.

## 04.0 (identity / admission / source of truth)

1. Immutable stable `personId`, server-resolved `actorId` and role (NPC / human), and the authoritative mapping from authenticated session to person at effective commit time. Required evidence: authority name, signed/transaction-bound session reference, `sessionEpoch`, `bindingEpoch` / revocation sequence, auth service scope and exact source field semantics; permanent ID must not be displayName, device ID or temporary battle bearer.
2. Current server-owned territory, rank, verified mafia role and both consents (including weaker person's explicit cross-rank acceptance). Required: issuer, version, battle proposal/consent identity, revocation/expiry semantics and a serializable read fence at admission. One device or NPC ID must not create a new `personId` for an occupied person.
3. Approved one-physical-serialization boundary for admission, session/binding/revoke and both global ACTIVE reservations, named D1/database handle, SQL/schema surface, writer ownership, two-worker consistency, actual CREATE/rollback path and no separate stale positive AUTH_DB allow. Current R270 Design B is direction, not implementation.
4. Server-generated `battleId`, immutable participant pair and per-person nonreused generation, signed or SQL-bound `admissionId` / `operationId`, exact fingerprint, monotonic causal sequence, proof of unique active across *all* human/NPC and E1/E2 producers. A fresh admission must be executed after release with fresh facts, not cached from the old duel.

## 05C (the one trusted finalizer)

1. Canonical `battle.finalized` issuer/service identity and unique `(sourceSystem, canonicalEventId, battleId)`; origin proof from accepted source transition, expected battle lifecycle/phase/version, immutable authoritative outcome evidence, exact receipt payload/digest and source authorization/revoke fencing.
2. Separate `TERMINAL_CANCELLED` issuer/authorization policy with unique terminal ID, trigger/reason/evidence pointer and eligibility for ACTIVE **not previously FINAL or settled**; no UI/vote/deadline/logout/lost ACK is sufficient. Must be approved independently of FINAL; cancellation means `NO_COMBAT_RESULT/NO_REWARD`.
3. One terminal-by-`battleId` uniqueness/CAS, frozen original `(personIdA,genA;personIdB,genB)`, exact two ACTIVE generation row comparisons, one result/receipt/outbox commit and both releases or all abort. Show actual tested D1 SQL / trigger or proven equivalent transaction, affected row counts and durable replay after Worker crash.
4. Original settlement/economy contract for FINAL only: source result uniqueness, idempotent immutable ledger effect and outbox lineage, no double reward; NO actual ledger simulation in V126. If ledger is outside the commit authority, provide verifiable bridge/outbox and reconciliation proof, otherwise STOP.

## 09Б (cancellation, anti-farm, cooldown, newcomers)

1. Owner-approved final cancellation effects with exact `NO_COMBAT_RESULT/NO_REWARD` and zero new REP/points/money; trusted issuer and evidence of abandoned/unresolvable ACTIVE state, protected appeal/request-review trigger and explicit safety gates. No invented cancellation deadline, penalty, reward or numeric cooldown duration.
2. Immutable durable pair-attempt / anti-farm, newcomer and cooldown source IDs/epochs, pair identity across devices and NPC aliases, history retention/rollback semantics, cross-battle retry eligibility and current server admission reevaluation. Cancellation or zone/logout must never delete or reset prior history.
3. Witness readback for same-pair new E2 attempts and genuine new duel admission after FINAL/CANCEL. Old receipt replay, retry or stale rollback must not re-arm reward eligibility or erase cooldown.

## Chat03 / platform persistence and operations

1. Durably independent, authenticated nonrollback high-water witness **outside** a joint gameplay/auth restore; exact writer, monotonic sequence, append-only log or other attestation, readable by admission and finalization before allowing mutation.
2. Two-way reconciliation of DB terminal/occupancy/receipts/ledger and the external witness after DB restore, fence of old Workers, quarantine on mismatch or unknown witness, policy for crash after commit but before external witness update, no synthetic "success" from matching copied snapshots.
3. Real native D1 or supported transaction API proving 2-person admission and terminal CAS + receipt/outbox generation semantics under concurrent Workers/requests, distinct devices, E1/E2, auth revoke race, crash/retry; CI and local workerd evidence, and separate hosted permission. No claims about production, migrations or Safari without distinct signoff.

**STOP** until issuer, binding, proof, real cross-worker transaction and external rollback witness are independently demonstrated. This cutset's `44/44` is LOCAL_SQLITE_MODEL_ONLY.
