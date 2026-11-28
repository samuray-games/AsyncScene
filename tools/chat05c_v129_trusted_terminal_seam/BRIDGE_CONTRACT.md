# Seam contract, not runtime authorization

Trust requirements: one verified server-only issuer signing the exact battleId, commandId, fingerprint, generation, eventId, sourceSystem, commitIdentity, outcome, person binding epochs, voteId and cancellation authority; separate verified Chat05Б closed sidecar for FINAL with immutable tally and quorum; one authoritative same-DB 04.0/09A epoch and two ACTIVE occupancy generations. Verification MUST occur inside one serializable write boundary or be rechecked against authoritative same-commit source. No default issuer, no public SQL access.

Terminal receipt identity is SHA256 over canonical JSON containing sourceSystem,battleId,commandId,fingerprint,canonicalEventId,kind,mechanicalOutcome,recognizedOutcome,voteId,issuerProofDigest,sidecarDigest,bindingDigest,commitIdentity,expectedVersion and the exactly bound person IDs/epochs/generations. Collision-free idempotency also requires server authenticated replay authorization, not yet implemented.

No economic reward on verified CANCEL. FINAL creates one settlement INTENT only, not actual REP/moneyLog transfer. Origin attestation and commit_identity value alone do not prove durability; before effect delivery an independent durable monotonic witness must observe, ACK, and verify the exact committed receipt hash. In absence or mismatch STOP.

The old 0011 may be durably applied UNKNOWN. Never rewrite it. 0012 is Chat05Б scope. Effective no-result CANCEL is model-only because 0011 cannot physically close an open vote early without a quorum/winner.
