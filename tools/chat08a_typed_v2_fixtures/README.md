# Chat08A typed V2 memory fixtures

This is a standalone, offline reference model for the Chat08A typed V2 key and replay contract. It is intentionally separate from `tools/chat08a_memory_fixtures/**`, PR #465, Chat07B schema, Worker, D1, Web, and runtime code.

The model keeps four identities separate:

- `sourceOriginKey`: stable identity of the canonical source event, derived only from `sourceSystem` and `eventId`.
- `knowledgeKey`: per-NPC memory identity. It includes the knowledge kind. For `HEARD_CLAIM`, it also includes the trusted relay receipt ID, so two permitted relays remain separate provenance entries.
- `effectKey`: one key per NPC and source origin, available only for `VERIFIED_OUTCOME`. Receipt retries, relays, reloads, and grant generations do not change it.
- transport receipt IDs: immutable delivery provenance. A receipt cannot be reused with changed content, recipient, kind, or source binding.

`VERIFIED_OUTCOME` requires a fixture-only final-source proof and an independently signed fixture policy before it can change a relationship counter. `VERIFIED_UTTERANCE` and `HEARD_CLAIM` can add memory/provenance but never create relationship effects. A claim is never rewritten or upgraded into a fact. Revoked or stale grant snapshots fail at commit, including after regrant.

All `fixtureSeal` values are deterministic checksums used to exercise model branches. They are not cryptographic signatures, authorization, live 05C evidence, live 07B grants, production storage, or proof that a runtime transaction is atomic. `fixtureOnly` records represent test data and must never be treated as authority. The snapshot seal detects accidental/corrupt fixture bytes only; it is not anti-rollback protection.

Run from the repository root:

```sh
node --test tools/chat08a_typed_v2_fixtures/test/*.test.mjs
```

No runtime, browser, Worker, D1, Cloudflare, or Chat08B path is imported or exercised.
