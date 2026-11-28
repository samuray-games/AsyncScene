# Chat08Б V126: R268 semantic source cap / SQLite transaction oracle

**ATOM:** `CHAT08B-V126-SEMANTIC-SOURCE-CAP-ATOMICITY`
**Scope:** `tools/chat08b_v126_source_cap/**` only.
**Baseline inspected:** GitHub `samuray-games/AsyncScene main@f256228a2a57e5b8144a42a72a240a7455a76417`.
**Canonical memory:** `2026-11-10-OWNER-LAUNCH-SAFE-PARALLEL-SCOPED-GO-R270`; **PLAN:** `2026-11-02-OWNER-NO-WORK-NO-AUTO-HANDOFF-V26`.

## Run

From this directory, Python 3.13 or newer (standard library only):

```bash
PYTHONWARNINGS='error::ResourceWarning' python -m unittest -v test_oracle.py
python -m py_compile oracle.py test_oracle.py
```

`python -m unittest` uses disposable separate file-backed SQLite databases. Tests R268-16 use **two OS processes** with independent SQLite connections; R268-17 uses two concurrent threads/physical connections. No network is contacted, no app Worker/D1 touched.

## Keys and data invariants

Outer:

```js
JSON.stringify(["npc-proactive-source-cap/v1", npcId, sourceSystem, canonicalEventId])
```

Inner R01 six-field tuple, in this exact order:

```js
JSON.stringify([npcId,targetActorId,sourceSystem,canonicalEventId,actionKind,rulesVersion])
```

The `source_caps` table has `PRIMARY KEY(cap_key)` and `UNIQUE(npc_id,source_system,canonical_event_id)`. `r01_reservations` holds the frozen six-field inner identity and `UNIQUE(cap_key)`. `action_outbox` is `UNIQUE(cap_key)` and `UNIQUE(inner_key)`; `action_id` is a synthetic opaque ID. A single `BEGIN IMMEDIATE` checks synthetic authority and writes source cap + R01 + immutable receipt + outbox, then `COMMIT`. An injected error causes complete rollback. Immutable triggers prevent mutating confirmed rows. `NO_ACTION` is modeled as a retained cap without inner/outbox; **this retention is a test-only proposed policy, not an owner-approved production design**.

A synthetic decision table freezes one allowed action option per NPC/source. Two equally eligible options without an approved deterministic tie-break return `NO_ACTION` before creating any outbox; competing request arrival order is not used as a tie-break. Grant checks happen after `BEGIN IMMEDIATE` against the **same test SQLite file**. Unknown/revoked grants, stale epochs, missing verified effect, wrong recipient/issuer/class, rumor/utterance deny. Extra permitted 07B relay receipts may create different synthetic knowledge records but never an extra cap. A confirmed cap cannot rearm across target, action kind, rules version, knowledge relay, issuer key rotation, or grant epoch.

## Strict scope / proof caveats

1. `VERIFIED_OUTCOME` is **synthetic injected proof** registered through `SyntheticAuthority.register_final()`, **not a real 05C server claim**, signature, 07A coherence proof or approved source issuer. `synthetic_grants`, `synthetic_effects`, and `synthetic_knowledge` are **fake 07B/08A test fixtures**, not real connected grants/effects. No request is sent to 05C/07Б/08A. No migration, shared Worker, production or PR was changed.
2. Python `sqlite3` file-level `BEGIN IMMEDIATE` is **not Cloudflare D1 native transaction evidence**. No actual two-Worker D1/local workerd, shared cross-store revoke, high-water restore service, network delivery/recipient ACL, authenticated HTTP, outbox consumer, signed origin, or outage recovery is exercised. R268-22 passes only when an **externally injected witness set** exists; automatic detection without that witness is NOT supported.
3. Model has no two-phase `RESERVED` rows: cap/R01/outbox commit together or all roll back. R268-14 exercises the absence of orphan reservation on simulated crash, not genuine lost ownership of a separately durable RESERVED state.
4. Candidate target/rules/payload and selected action are stored in a synthetic frozen decision table. The real selector, chosen route, real actor-person/consent/territory/anti-harassment, grant lock and storage authority are unapproved/unwired; the generic policy boolean cannot prove real protections.
5. No independent configured `critical_reviewer` was invoked or available in this response. These are author-run tests only, **not** `PASS_CRITICAL_REVIEW` and not security acceptance. No public GitHub branch, remote commit, PR, main or production deployment. A locally generated Git commit (if supplied) is only a detached scratch artifact and **does not descend from repository main**.
6. Original V123 R268 implementation/verified SHA/commit was not found in current Notion Inbox or GitHub main/branches. The historical R01 25/25 tests cover *inner-only* SQLite and were **not rerun**. A historical Library file was accessible as indexed text only; original raw materialization failed, so no claim of independent original-byte R01 readback is made.

## Future **minimal** atomic storage contract, pending exact owner approval

Trusted 05C final identity+issuer and 07A final readback, current 07Б `recipientId=npcId` recipient proof/grant-generation/epoch, 08A outcome effect, NPC service principal and current target rights/consent/cooldown MUST share a demonstrated single serializable revoke/effect/action commit barrier or an independently proven equivalent fence. Under this barrier: (1) read trusted immutable source and current policy; (2) choose the single owner-approved deterministic action or NO_ACTION; (3) insert UNIQUE outer cap, frozen inner R01 + immutable actionId/receipt and one outbox in one commit; (4) on duplicate return only the previously authorized receipt and never append an action; (5) on revoke-before-commit abort action/outbox; (6) retain tombstone/cap across rules/epoch/restart; (7) outbox consumer must revalidate recipient visibility and idempotently fence physical delivery; (8) external durable rollback high-water/quarantine must block restored old databases. Any second D1 or independent source of positive allow without cross-store linearization is STOP.

Approval needed on persistence of NO_ACTION/revoked claims, deterministic tie-break, real trusted issuer, storage topology/rollback witness, local native D1 compatibility, and only then exact scoped integration with independent critical review.
