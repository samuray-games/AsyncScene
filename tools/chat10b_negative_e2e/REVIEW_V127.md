# V127 source-provenance security audit

ATOM: `CHAT10B-V127-SOURCE-PROVENANCE-REVIEW-AND-09B-IMPORT-GATE`

**Formal independent critical_review: NOT_EXECUTED / STOP_ROLE_NOT_AVAILABLE.**
The only reviewer here is the same assistant that assembled the test package. This report is an **author technical audit**, **not** an independent `critical_reviewer` signature, approval, or external PASS. No PR, branch, deployed runtime, source-owner files, or D1 were modified.

## Exact V125 source under review

- Original owner-private V125 ZIP from Google Drive: `e0fa09d468d04e7c82d59760457e375643a59c7167dd85eb19437f073a4794f0`, `45338` bytes, 22 ZIP entries, CRC clean.
- Its 21-file original byte manifest has been compared to the unchanged V125 source files. The manifest itself is pinned separately in `run-v127.mjs`, not trusted to validate itself.
- The V125 test `projectTrustedJudgeFacts()` is a real original Chat06 offline export, but every `authority`/issuer/grant and 05C canonical event in the tests is a **synthetic injected map**. Neither `approvedIssuerFor()` nor `terminalCount:1` verifies real signatures, DB uniqueness or a live grant. This is explicitly documented by the actual source and must remain offline evidence.
- V125 runner verifies 9 V123 files and the 3 Chat06 originals, but its test target/counts and its own script are not validated by its internal preflight. Verification of the original **ZIP SHA** and V127 verification of the exact prior manifest narrow this risk. No future GitHub/remote source integration may rely solely on the V125 local counts.

## Three original V125 SKIP causes and dispositions

1. **V125 original Chat06 judge evaluator smoke (1):** The V123 V2 archive had no adjacent `judge.mjs`, so test was correctly SKIP. Fixed for V127 OFFLINE only by adding the byte-exact original `judge.mjs` from Chat06's **owner-private V125 checkpoint**. Git blob SHA-1 including header: `12ece4f21b9a57004a8c52f67c14c9f4481f7aac`, matching GitHub PR452. The unchanged Chat06 original test now gives **30 PASS / 0 SKIP**. Not a runtime/owner-source write.
2. **V125 S06-11 lost real HTTP ACK:** remains **SKIP**. There is no authenticated HTTP transport, durable 07B readback, real command idempotency or ordered server ACK to examine. A stub ACK must not turn this into PASS.
3. **V125 S06-12 FINAL versus CANCEL atomic CAS:** remains **SKIP**. Chat06 is a pure consumer, not a genuine same-transaction 05C/09A terminal decision and two-person reservation-release authority. Chat09B's sequential in-memory `step()` is NOT the missing SQL CAS or cross-worker proof.

## Chat09B V123 original verified and imported

- Newly found private Cloud ZIP `chat09b-v123-cancel-antifarm-fixtures.zip` ID `<owner-private-drive-id>`, byte-size `5098`, expected and observed SHA256 `faf25936b205d5ad30033f22653842afb2fc90cf7198a1b123a33f58e14a5ece`.
- Original source `product-model.mjs` exact SHA256 `7a08fd014508c50beb49dd6d9338fc26aff755afaf92b9ab6cb5bef13ce1d46c`, `2987` bytes. The original 4 payloads and original manifest match exactly, ZIP CRC clean. Original Chat09B 14/14 PASS regression now executed from **original export**.
- Original source says: `Isolated synthetic product oracle. NOT an issuer, ledger, reservation service or runtime implementation.` The `trustedFinalReceipt` and `trustedTerminalReceipt` arguments are assumed inputs, not independently authenticated. Importing it does not supply an authority or security gate.

## New negative results and critical findings

**New direct-source V127: 13 tests, 10 PASS, 3 FAIL.** Original old regressions: 67 tests (65 PASS / 2 SKIP). Combined: **80 tests / 75 PASS / 3 FAIL / 2 SKIP**. Full JSON and failing assertions bundled under `evidence/`.

- **FAIL V127-09B-10 (HIGH, source oracle contract):** `step(state, {type:'FINAL', battleId:'B2', ...})` applied to the ACTIVE `B1` model returns `TERMINAL_FINAL_NO_SETTLEMENT_SIMULATED`, changes `B1.status` to `FINAL`, and removes both `B1` occupations rather than rejecting the **wrong command battleId**. `CANCEL` has a command battleId check; `FINAL` does not. This is a verified isolated-module behavior, NOT a claim about a running server.
- **FAIL V127-09B-11 (HIGH, source oracle contract):** a `FINAL` command for B1 with injected `trustedFinalReceipt.battleId:'B2'` returns a successful terminal transition instead of a receipt-binding conflict. No comparison to the original B1 binding.
- **FAIL V127-09B-12 (HIGH, source oracle contract):** a `CANCEL` command for B1 with injected `trustedTerminalReceipt.battleId:'B2'` returns `TERMINAL_CANCELLED`, releases both reservations and preserves mismatched receipt instead of rejecting. Even though the source explicitly assumes trusted receipts, a future integration must validate the receipt-to-command/battle binding in the authoritative source; this current isolated module does not.
- **PASS Chat06 wrong recipient (V127-C06-01):** real byte-exact `projectTrustedJudgeFacts()` throws `FOREIGN_RECIPIENT` before calling provider methods. V125 original negative tests still cover forged 05C issuer, revoked/regranted grants, altered receipt, false winner, repeated finals, cancellation-not-final, and non-scoring PUBLIC_SUPPORT with injected synthetic authorities.
- **PASS Chat09B own invariants:** original 14 tests plus 9 new source-directed cases show retention, no implied rewards or result from cancellation, same receipt reuse, generation guard and sequential final/cancel exclusion **under synthetic assumptions**.

**Author audit verdict: FAIL_NEGATIVE_SOURCE_CONTRACT_CHAT09B_RECEIPT_BINDING**. Do not modify Chat09B-owned vendor source here; route these three failures and exact reproduction to Chat09B owner for a separate narrow fix after owner GO/critical review. **Formal independent verdict: NOT_AVAILABLE, NOT PASS**.

## To establish true cross-worker E2E (not attempted)

Requires an actual released combined HEAD and real authoritative server modules: canonical 04.0 security-effective session/binding/consent revoke and SEND checks; 05B vote-close and singular 05C battle.finalized/issuer; 07A source readback and 07B live recipient grant/revoke; 08A verified outcome effects and 08B durable R268 source cap; 09A global active reservations and one SQL FINAL xor CANCEL decision with exact generation matching; 09B authorized cancellation receipt; external nonrestorable high-water witness.

Then under a distinct OWNER TEST GO with verified owner/locks, disposable native D1, two real Worker instances, real persisted receipts/outbox, concurrent final/cancel, lost ACK injection and authoritative readback, rollback/restart/revoke/regrant tests, negative privacy checks, exact source SHA and genuinely independent `critical_reviewer`. Without those, all **REAL_RUNTIME** and production claims remain false.
