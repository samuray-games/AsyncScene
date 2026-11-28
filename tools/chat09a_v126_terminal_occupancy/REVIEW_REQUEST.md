# High-risk independent critical_reviewer request - NOT EXECUTED

Required role: the project's independent `critical_reviewer` (security, authorization, persistence/ledger). No separate reviewer-role tool is available in this session. Do NOT treat author self-check as reviewer PASS.

Review exact source bytes and manifest hashes before signing. Re-run `python3 -m unittest -v test_oracle.py` from a clean ZIP extraction. Adversarial targets:
- Can two concurrent admissions create 3+ ACTIVE reservations or advance only one person's generation?
- Are FINAL and CANCEL really one terminal CAS with immutable receipt/outbox and exactly two original generation releases? Re-run outbox conflict and injected first-release abort; inspect what remains after reopening DB.
- Can E2 or second device bypass per-person partial unique constraint? Can an old cancel unlock a subsequent generation?
- Check replay of admission request ID/terminal fingerprint, malicious untrusted receipt replay, inconsistent/missing seat, forged issuer, proof ID, and current session / NPC alias.
- Verify NO cancellation reward/REP/results, no reset of pair/cooldown/newbie history. Confirm tests do not silently replace 05C settlement.
- Evaluate the intentionally untrusted `synthetic_trust` and in-memory highwater witness. Fail any report claiming source issuer, production authentication, native D1, antirollback durability or cross-worker linearizability.
- Confirm no source checkout/PR455/shared Worker/migrations/real game data inside archive, no secrets/PII, reproducible independent extraction and SHA-256.

Expected reviewer verdict: independently validated MODEL_PASS with explicit open risks, or FAIL with exact counterexample. A critical review cannot bless absent real issuer/binding/witness or hosted D1.
