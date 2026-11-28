# 44 executed unit tests and intended negatives

1-10: Two-person admission, dual-device person collision, E2 overlap, NPC alias overlap, exact retry and fingerprint conflict, invalid pair, untrusted admission, 8 independent SQLite processes contending on one person, denial atomicity.
11: Nine nonterminal signals retained (logout, UI timeout, lost connection, vote close, proposal expiry, battle timeout, request review, zone change, delivery ACK).
12-16: FINAL/CANCEL releases 2 original generations; cancel creates zero final result markers; one final marker, exact FINAL or CANCEL replay.
17-19: FINAL before CANCEL, CANCEL before FINAL, conflicting final proof all reject.
20-26: Untrusted source, stale version, wrong generation, missing seat, post-first-release abort, duplicate outbox event: full rollback without half-release.
27-29: Stale cancellation leaves E2 active on new generation; wrong stale receipt conflict; no automatic readmission without new synthetic server preflight.
30-35: Pair-attempt history, newcomer and cooldown preservation, rollback, lost ACK and restart replay, sequential new attempt history.
36-39: Fail closed on missing synthetic witness, stale database restore and mismatched highwater. This does NOT prove an external independent witness.
40-41: Actual separate-process SQLite terminal FINAL/CANCEL race, duplicate FINAL race, exactly one terminal winner.
42-43: Untrusted exact replay cannot disclose an existing admission or terminal receipt.
44: Deliberate counterexample proving arbitrary assumed proof ID is accepted when synthetic trust is injected. **Live issuer proof remains absent**.

Test evidence: `test_output.txt` from Python stdlib unittest. This is not CI, real D1 or a server-authorized test.
