# High-risk critical review status and real blockers

**VERDICT:** AUTHOR_SQLITE_REGRESSIONS_PASS / INDEPENDENT_CRITICAL_REVIEW_NOT_PERFORMED / PRODUCTION_NO_GO.

This is high-risk auth, integrity, economy and persistence scope. `AGENTS.md` requires the separately configured `critical_reviewer`. Github `.codex/agents/critical_reviewer.toml` exists, but no executable role delegation/reviewer tool is available in this ChatGPT environment. Do not substitute this same-session source review, routine reviewer or an invented PASS.

## Tight source-facing seam delivered

- `bridge.py`: a single API doing `BEGIN IMMEDIATE`, requiring issuer/sidecar/binding/witness/clock injection, verifying exact signed test issuer claim + original 0011 sidecar tally inside the transaction, comparing source battleId/generation/epoch/outcome, constructing SHA256 receipt over immutable canonical fields, and admitting exactly one V129 statement.
- `seam.sql`: one sealed command row -> one V128 terminal CAS -> exact legacy receipt/event/outbox + FINAL-only economic intent + 2 exact synthetic occupancy releases -> exact V129 receipt. Failing any step fails the whole SQLite statement/transaction. Direct V128 terminal INSERT is blocked unless the matching V129 in-flight command exists. SQL payload immutability guards resist UPDATE, DELETE and OR REPLACE under recursive_triggers OFF.
- Restart, same-command lost ACK, competing FINAL/CANCEL, late abort and withheld witness ACK covered in tests.

## Critical findings and explicit STOP (not fixed by tests)

1. **Trusted issuer source still external.** The positive verifier in `test/test_seam.py` uses a hardcoded, labeled TEST-ONLY HMAC secret. `bridge.py` calls provider `.verify` and checks returned fields, but Python itself does not own a production trust anchor or validate a real 05C signing key. A compromised/injectable verifier or privileged SQL writer can still forge authority. No production issuer authentication claim.
2. **Sidecar proof has no approved issuer.** 0011 is immutably closed at SQL level (when original triggers apply), but neither Chat05Б native D1 0012 acceptance nor a real signed/versioned closed-sidecar receipt is demonstrated. Our test signs snapshots in its own fixture only. Non-DRAW recognized outcome mapping remains owner-dependent.
3. **04.0/09A are not integrated.** v128 binding and occupancy are explicitly named `_fixture` tables; no real person-wide global occupancy generation/epoch, revoke/admission and host-safety attestation. Releasing two fixture rows proves no actual real-person release.
4. **External rollback witness is synthetic.** Test witness is a *second SQLite file*, not an independent security principal or anti-fork service. It only checks touched battleId. Restoring both databases or an older image for an unrelated battle can evade it. No global monotonically anchored head or independently durable issuer commit proof. No production ledger/outbox delivery may proceed from this proof.
5. **Post-commit witness gap.** V129 writes DB before witness.seal() ACK. A different publisher reading raw gameplay_event_outbox without a witness gate could dispatch prematurely. The integration owner must gate *all* event/settlement consumers behind authoritative witnessed receipt. Same-DB SQL cannot guarantee atomic external witness and DB commit.
6. **Privileged SQL write surface.** SHA256 is computed by `bridge.py`; SQLite has no cryptographic verification function here. Direct privileged insertion into v129 command is not cryptographically secured by SQL. Enforce a single trusted server writer, exclusive bindings, grants and D1 invocation, or do not integrate.
7. **Effective CANCEL vs physical closed.** Old 0011 cannot close early without deadline/quorum/winner; model only marks effective cancellation and rejects new ballots, leaving 0011 `status=open`. Owner must accept this semantics or approve a new append-only schema, not rewrite applied 0011.
8. **No reviewed native runtime.** No native D1/Worker, multi-process/multi-region tests, real networking, deployed migrations, restart under real D1, macOS host locks, GitHub PR, shared Worker or production writes. No claimed P05-FINAL acceptance.

## Single next owner action

Only after true upstream evidence and owner GO, designate **one** authorized integration writer (no overlapping 04.0, 05Б, 09A, shared Worker/migration writes), run a genuine read-only critical_reviewer on exact package bytes, approve one append-only future 05C migration number after checking current registry, translate this Python standalone proof boundary to the server's JS/Worker adapter and one D1 serialized write. Re-run original SQL and all new regressions in native D1 with faults, source/receipt proofs, true occupancy, checkpoint witness and 10Б negative E2E. Final acceptance belongs to owner-controlled Safari/runtime, not this package.
