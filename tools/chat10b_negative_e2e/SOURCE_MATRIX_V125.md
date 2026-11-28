# Chat10Б V125 - exact source/stub matrix

| Unit | Provenance | Actual entrypoint | Observed | Security limit |
| --- | --- | --- | --- | --- |
| NEG01-NEG10 plus PROVENANCE | `STUB_ONLY` | `test/negative.test.mjs` importing original V123 `stub-authority.mjs` through `adapter.mjs` | 11 PASS, 0 SKIP | Synchronous fake authority; no real concurrent Worker/D1 |
| Chat06 V123 vendor original tests | `REAL_SOURCE_OFFLINE` | Original byte-identical `source_vendor/chat06/trusted-knowledge-adapter.test.mjs` importing original byte-identical `trusted-knowledge-adapter.mjs` | 29 PASS, 1 SKIP | Fake injected provider; exact PR452 judge module not mounted for evaluator smoke |
| S06-01 | `REAL_SOURCE_OFFLINE` | Actual exported `projectTrustedJudgeFacts()` | PASS | Positive historic final is a synthetic source registry entry, not real 05C |
| S06-02 | `REAL_SOURCE_OFFLINE` | Actual export / issuer mismatch | PASS | Issuer approval registry is injected fixture, not live pinned registry |
| S06-03 | `REAL_SOURCE_OFFLINE` | Actual export / revoked grant | PASS | No 07Б durable grant store |
| S06-04 | `REAL_SOURCE_OFFLINE` | Actual export / stale generation | PASS | Does not solve cross-store revoke order |
| S06-05 | `REAL_SOURCE_OFFLINE` | Actual export / repeated knowledge receipt | PASS | Read-only consumer dedupe, not network idempotency |
| S06-06 | `REAL_SOURCE_OFFLINE` | Actual export / altered source digest | PASS | Registry fake, not cryptographic proof verifier |
| S06-07 | `REAL_SOURCE_OFFLINE` | Actual export / false winner assertion | PASS | Requires independently approved assertion rules in runtime |
| S06-08 | `REAL_SOURCE_OFFLINE` | Actual export / two final source count | PASS | Count injected, not queried from 05C D1 |
| S06-09 | `REAL_SOURCE_OFFLINE` | Actual export / cancelled source mistaken for final | PASS | Consumer rejection, NOT final/cancel transaction exclusivity |
| S06-10 | `REAL_SOURCE_OFFLINE` | Actual export / PUBLIC_SUPPORT non-scoring | PASS | Does not validate original action issuer in production |
| S06-11 | `UNAVAILABLE`, not PASS | HTTP ACK/drop and durable replay | SKIP | No real network/07Б store |
| S06-12 | `UNAVAILABLE`, not PASS | FINAL xor CANCEL transactional CAS | SKIP | No 05C/09A authoritative terminal source |
| Chat09Б V123 | `BLOCKED`, not executed | Unavailable original `product-model.mjs` | 0 new PASS | 14 old PASS cited from V123 report, private cloud ZIP absent/unverified |
| Any server E2E | `REAL_RUNTIME` | None | 0 PASS | No Worker/D1/hosted/runtime |

**Single next source adapter gate:** obtain Chat09Б V125 owner-private original ZIP and independently compare exact SHA256 against V123 manifest, then directly import its real exports in this Chat10Б-owned harness. Any later server E2E still requires separate real authoritative 04.0/05C/07Б/09А source GO and independent critical review.
