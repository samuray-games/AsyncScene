# Chat09A V126 - person-wide terminal CAS negative cutset

ATOM `CHAT09A-V126-PERSON-WIDE-TERMINAL-CAS-CUTSET`

This is an **isolated negative oracle**, not gameplay production code and not an implementation of D1 transactions or a trusted server issuer. Everything is under `tools/chat09a_v126_terminal_occupancy/**`. No original occupancy fixture is changed or copied. PR455, Worker, migrations, real battle data, and other owners' branches are untouched.

## Evidence and scope

- Direct canonical Notion top `MEMORY_REV=2026-11-10-OWNER-LAUNCH-SAFE-PARALLEL-SCOPED-GO-R270`; plan V26; main at `f256228a2a57e5b8144a42a72a240a7455a76417`; Draft PR455 `c954283cc3512e13685793318c4ff4ef36587ed6` (read-only).
- Based on Chat09A V121 final/cancel release matrix, Chat09B V123 14-case synthetic cancellation history, Chat05C V115 terminal finalization compatibility. No Chat09A V123 original source was available from the current Notion Inbox, current conversation attachments or owner-private Drive title search; this code intentionally tests **a different cutset**, not a reimplementation of V123 occupancy.
- File-backed CPython `sqlite3` model with triggers `admit_pair` and `terminal_cas`. Each trigger is a **single SQL statement**. `BEGIN IMMEDIATE` serializes SQLite fixture connections. Two independent OS-process races exercise local SQLite contention; this is **not a cross-worker/workerd/D1 transaction**.

## Run

From this directory, Python 3.10+ with standard library:

```sh
python3 -m py_compile oracle.py test_oracle.py
python3 -m unittest -v test_oracle.py
```

Test-only tables: global unique ACTIVE `(person_id)`, monotonic per-person generation counter, immutable original battle sides, immutable admission receipt, pair-attempt / cooldown / newbie history, terminal receipt keyed by battle, terminal event outbox, `final_result_marker` (a **marker**, not actual economic settlement). NO payout is modeled. `CANCELLED` does not create a final result marker.

### Core invariant

For each admitted E1 or E2, the single `v_admit` trigger atomically validates two distinct people, checks nobody has another ACTIVE reservation, increments their per-person generations, creates battle, inserts exactly two ACTIVE reservations, records an admission receipt, outbox item and pair-attempt history. If any substep fails, the entire statement aborts.

For a terminal event, **one** `v_terminal` trigger validates active version and exact original `(personId, battleId, generation)` for both people, requires exactly two matching ACTIVE rows, moves BOTH to RELEASED (two rowcount checks), transitions the battle to `FINAL` xor `CANCELLED`, records one immutable receipt and one outbox item. A failure at any point, including after the first release, ABORTS the entire statement. The terminal never creates a new reservation; re-admission requires a fresh, separately presented synthetic server preflight. Old receipt replay cannot release later generations.

### Trust and proof limits (STOP)

`trusted=True`, `synthetic_trust=1`, `proof_id`, person mappings and synthetic `SimulatedExternalWitness.highwater` are **injected oracle assumptions**. Test 44 demonstrates a caller can present an arbitrary nonempty `proof_id` with `trusted=True`; neither is a signature or issuer authority. The model provides no real session/actor binding, epoch/revocation fence, territory/rank/consent verification, immutable 05C source event, external ledger settlement, native D1 SQL interface, Worker integration, or hosted proof. SQL-only process race helpers bypass the simulated witness on purpose and are never authorized server ingress.

The high-water witness is a mutable in-memory stand-in. Quarantine on a mismatched restored snapshot is only simulated; witness absence causes fail closed in the high-level adapter. Committing SQL and then publishing the witness is **not atomic**. Crash between those steps, compromised witness, copied witness+DB rollback, old Worker or future post-recovery reconciliation are **not solved**. This fixture never establishes a real durable independent anti-rollback fence.

`final_result_marker` proves only local cardinality and mutual exclusion. No actual winner, account balance, REP, award, payout, anti-farm policy, or accepted cancellation reason is computed.

Risk status: `SELF_REVIEW_ONLY`; `INDEPENDENT_CRITICAL_REVIEW_PENDING`; `NO_REAL_ISSUER_PASS`; `NO_CROSS_WORKER_PASS`; `NO_NATIVE_D1_PASS`; `NO_RUNTIME_PASS`; `NO_PRODUCTION_GO`.

## Exact proof inputs required before integration

See `SERVER_PROOF_INPUTS.md`. All must be authoritative, server-origin, immutable/auditable as appropriate and joined or fenced inside a **proven single serialization authority**. A D1 `batch()` of pre-reads across DBs is not evidence.
