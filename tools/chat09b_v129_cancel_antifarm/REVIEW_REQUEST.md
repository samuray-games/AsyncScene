# V129 mandatory independent critical review request

ATOM: CHAT09B-V129-CANCEL-ANTIFARM-TERMINAL-COMPAT

Risk: security authorization / person and participant reservation binding, persistent cancellation and simulated economy protection. No reviewer was run by this chat. Self-tests are NOT an independent review.

Review exact root `product-model.mjs`, `terminal-bridge.mjs`, `terminal-bridge.test.mjs`, vendored byte-exact V128 model and historic tests; verify manifest and original V123/V128 SHA.

Priority attack questions:

1. Can an untrusted client FINAL/CANCEL (including arbitrary `trusted*`, `verified:true`) reach `syntheticV128Step` without an independently authenticated 05C lookup? Does root `product-model.mjs` fail closed? Is the vendored fixture import prohibited for any runtime consumer?
2. Does actual server-owned resolver guarantee unique 05C FINAL XOR CANCEL, atomic two-person reservation release, bound tenant/battle, receipt ID+canonical source event/commitFence, issuer check and pair attempt? This isolated code cannot establish real issuer authority.
3. Can foreign B2, participant alias, person switch, stale generation, stale attempt, replay with different fence, third occupant or inconsistent CANCEL economy affect B1, rewards, history, newcomer, anti-farm or cooldown?
4. Does replay always re-read authority and ensure immutable results? Are two independent B1/B2 fixture states incorrectly claimed to prove global person-wide CAS?
5. Does adapter claim secure outcome when authority callback is attacker-controlled? The callback MUST be server-owned. Require actual 05C and 09A source proof before integration, plus native D1, two-Worker concurrency, rollback high-water witness and independent critical reviewer PASS.

Current author-test evidence: Node v22.16.0 72/72 PASS on isolated sandbox, no skip. Independent `critical_reviewer` unavailable/not executed; `INTEGRATION_PASS=false`, `REAL_RUNTIME_PASS=false`. Do not substitute a routine reviewer or self-review. No GitHub, Worker, SQL, PR, 09A, 05C, ledger, staging or production writes authorized.
