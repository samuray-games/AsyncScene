# Chat08A: isolated synthetic memory fixtures

**Scope:** `tools/chat08a_memory_fixtures/**` only. Seven files. Test-only reference behavior, not a social NPC persistence implementation. The six tests M01-M06 extend existing Notion design cases P01-P08 / N01-N16; they do not reimplement 07B witness/visibility authorization.

## Boundary

- Input is a **fixture-only, already authorized, normalized 07B-style knowledge grant**, not a real receipt and not proof an NPC observed a live event. `sourceReceiptId`, `sourceRef`, visibility policy and actor IDs use the `fixture-08a:` namespace. The synthetic event and its winner/loser are only test facts.
- Positive cases simulate a trusted finalized outcome with an explicit `AUTHORIZED` test grant. Real Chat06 E1 has **UNKNOWN** source/witness/finality: do not equate it to these simulated receipts.
- A message or relay represents a claim. It can be remembered with provenance, but cannot acquire a `verified_outcome` merely by repetition. Reactions are only allowed on the test's directly authorized finalized outcome. The latter is a conservative fixture boundary, not an approved 07B runtime policy.
- Relationship axes are `respect`, `sympathy`, `resentment`, `fear`. The reference stores only symbolic `UP` or `UNCHANGED` directions; **no numeric deltas, growth caps, cooldowns, forgetting intervals, economy, REP, voting or 08B actions**.
- One allowed fact may have several distinct source receipts. Memory entries retain each source kind, receipt ID, time learned and visibility version. The effect ledger has a separate stable identity that survives JSON serialize/rehydrate and is not cleared when short memories would later be bounded.
- `memory-model.mjs` is a deliberately small pure reference transition. `snapshot-store.mjs` is an in-memory JSON harness, not durable storage. A Node PASS does not verify concurrent transactions, crash safety or actual D1 persistence.

## Proposed API (fixture-only)

`applyAuthorizedKnowledge(snapshot, syntheticGrant, syntheticProfile)` returns `{ state, outcome, reason?, decision? }`. Permitted outcomes include `APPLIED`, `ALREADY_APPLIED`, `REMEMBERED_WITHOUT_EFFECT`, `ALREADY_REMEMBERED`, `DENIED`, `REJECT_CONFLICT`.

No import from `gameplay-server`, `AsyncScene/Web`, `docs`, Chat07B in-progress files or Stage7 `npcMemory`. No filesystem writes, database access, network calls or environment credentials at runtime. Synthetic inputs never leave the harness.

## Tests

From the repository root, once this new file scope is separately authorized:

```sh
node --test tools/chat08a_memory_fixtures/test/*.test.mjs
```

- `M01` three different NPC reactions to the same fixture-finalized source and permitted facts.
- `M02` absent NPC and forged client-side presence cause no memory/relationship effect.
- `M03` relay claim stays a claim, even with multiple receipts.
- `M04` replay, second receipt, JSON reload and modeled delivery orderings do not double count.
- `M05` direct source and relay provenance stay distinct.
- `M06` pending/missing/conflicting finalization is rejected, then a separate valid final can be applied once.

**Excluded from PASS:** real 07B ACL, 05C/07A finalization, D1 atomicity, time decay/cooldowns, long-term ledger retention, independent critical review, runtime/Safari/hosted acceptance.
