# R268 exact acceptance matrix versus this standalone SQLite fixture

Legend: **MODEL PASS** = the listed author-run test returned PASS against this isolated Python SQLite model only; qualifiers are material and do not imply original full acceptance. The original 22-case requirements remain **RUNTIME UNVERIFIED** throughout. **PARTIAL** means a narrower synthetic assertion, not original end-to-end evidence.

| ID | Required R268 invariant | Executed evidence | Verdict |
| --- | --- | --- | --- |
| R268-01 | E1: one verified final, one challenge, outer+inner+outbox | 1 cap / 1 R01 / 1 outbox, keys and IDs read back | MODEL PASS |
| R268-02 | Real independent E2 does not false-dedupe | Two injected different battle finals => 2/2/2 | MODEL PASS, final issuer synthetic |
| R268-03 | Same battle alias final quarantined | Synthetic final registry UNIQUE(system,battleId) blocks alias | MODEL PASS, no real 05C issuer |
| R268-04 | Direct fact + two lawful relays, at most one action | Three synthetic knowledge rows, unchanged 1/1/1 | MODEL PASS, recipient trust synthetic |
| R268-05 | Claims alone produce zero action | Two recorded synthetic HEARD_CLAIM => 0/0/0 | MODEL PASS |
| R268-06 | Utterance only non-trigger; altered same receipt conflict | Synthetic knowledge registry rejects changed digest; 0 actions | MODEL PASS, no real signed 08Б utterance |
| R268-07 | Different target does not rearm cap | Frozen decision rejects mutation; replay same action | MODEL PASS |
| R268-08 | Two tied action kinds -> NO_ACTION | Durable NO_ACTION cap and zero inner/outbox | MODEL PASS; retention not owner-approved |
| R268-09 | RulesVersion v1->v2 does not rearm | Frozen decision rejects mutation; replay same action | MODEL PASS |
| R268-10 | Different NPC same final not false-deduped | Two distinct NPC keys => 2/2/2 | MODEL PASS |
| R268-11 | Revoke before commit => zero outbox | Synthetic grant revoked before BEGIN IMMEDIATE, 0/0/0 | MODEL PASS, same-file authority only |
| R268-12 | Revoked epoch 7 stale after epoch 9 regrant | Stale proof denied, 0/0/0 | MODEL PASS; new fresh intent unmodeled |
| R268-13 | Exact replay immutable, original receipt | 3 retries, exact stable snapshot and receipt | MODEL PASS |
| R268-14 | Crash in RESERVED/token-loss without orphan | Injected abort rolls back 0/0/0; no separate RESERVED state | PARTIAL, single-transaction architecture |
| R268-15 | Lost ACK and retry same committed record | First response discarded, second same receipt 1/1/1 | MODEL PASS, not network egress |
| R268-16 | Two workers same selected action, one outbox | Two **OS processes** against one physical SQLite file | MODEL PASS, not native D1 workers |
| R268-17 | Concurrent target/kind conflict, no lottery | Two concurrent connections on frozen ambiguous NO_ACTION | PARTIAL, no real competing HTTP requests |
| R268-18 | Fake issuer/ACL/witness/proof fail closed | Wrong issuer, recipient, battle, epoch, event, kind all deny | PARTIAL, privacy HTTP/non-oracle not modeled |
| R268-19 | Opt out, block, newcomer protection, consent gates | Generic synthetic target-allowed=false -> no outbox | PARTIAL, real policies absent |
| R268-20 | Cooldown/rate/harassment and NPC recursion deny | Generic grant can_proact=false plus derived utterance deny | PARTIAL, real rate budgets absent |
| R268-21 | SQL failure after cap/inner fully rolls back | Injected abort before outbox, reread 0/0/0, reopened retry 1/1/1 | MODEL PASS |
| R268-22 | Restore old database after downstream delivered must quarantine | Injected external witness detects missing cap; refuse writes | PARTIAL, no actual independent witness service |

**Summary:** 22/22 named unit tests executed successfully, 24/24 including two supplemental tests; **6 scenarios PARTIAL** for actual R268 acceptance (14,17,18,19,20,22 and the real-issuer aspect of the whole suite). No real source/authority/native D1/critical reviewer verification. This matrix reports model test success separately from original full acceptance status.
