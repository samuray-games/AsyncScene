# V129 invariant regression matrix, file-backed SQLite only

Use `python -W error::ResourceWarning -m unittest discover -s test -p 'test_*.py' -v` from package root.
All tests use exact immutable 0001-0011 original migrations, separate 0012 Chat05Б candidate and V128 additive candidate, then V129 `seam.sql` inside disposable SQLite.

| Source gap and PXX | V129 tests | What actually passed |
| --- | --- | --- |
| EX03: original 0001 accepts FINAL with 0011 sidecar OPEN | 08, 09, 07, 27 | FINAL requires actual CLOSED sidecar, independently tested fixture proof, authoritative SQL tally and matching recognized A_WIN/B_WIN. `DRAW` cannot be reported as recognized A_WIN; only mechanical DRAW mapped. |
| EX08: original 0001 accepts second FINAL with different eventId; double settlement | 01, 03, 11, 12, 13, 14, 23, 24, 25, 25-midway | One terminal row and immutable receipt/event across FINAL/CANCEL, same identity replay, no second intent, BEGIN IMMEDIATE race and late abort atomic rollback. |
| EX09: original repeated final changes `mechanicalOutcome` | 06, 07, 27, 32 | Exact DRAW mechanical frozen by V128. Reject signed bad recognized DRAW/B_WIN on A majority and false rewarded CANCEL. |
| EX10: original 0011 NPC ballot replace with recursive_triggers OFF | all fixtures, 01, 07, 08 | Original unmodified Chat05Б 0012 is applied; prior exact source original gap was reproduced by V128. Not independently approved native D1. |
| RECEIPT_MUTATION: original receipt.code directly editable | 01, 03, 05, 12, 13, 16, 17, 28, 31 | immutable exact V129 receipt SHA, original gameplay receipt and outbox, sourceSystem/eventId/commit identity bound, mismatched battleId and replay rejected. |
| Unverified issuer, forged cross-source proof | 04, 05, 09, 10, 21, 22, 28, 29 | Test-only synthetic HMAC validation fails closed before any write; no default issuer installed. This is **not** real server issuer proof. |
| 09A exact occupancy generation release, only after terminal | 01, 02, 14, 24, 26 | Two fixture ACTIVE generations released within same SQLite terminal write and other person's unrelated reservation untouched. Real 09A not attached. |
| Cancellation without payout, anti-farm | 02, 23, 30, 32 | CANCEL has immutable receipt + event, no settlement-intent row, direct attempt to award cancel rejected. No actual moneyLog, REP or anti-farm adapter. |
| Rollback/fork, witness outage | 18, 19, 20 | Separate test SQLite witness detects same-battle restore and enforces no success before ACK. Real independent monotonic witness absent, multi-battle rewind unproven. |
| Exact fault injection / partial commit | 14, 25-midway | Collision after terminal effects or injected receipt abort unwinds CAS, receipt, event, settlement and occupancy changes. |

**Interpretation:** PASS means tests of the isolated proposal behaved as expected. It does not certify `gameplay-server`, hosted D1/Worker, production issuer, cryptographic key custody, true person occupancy, or independently reviewed economy. If original SQL is durably applied, do not edit 0011. Candidate 0012 belongs only to Chat05Б.
