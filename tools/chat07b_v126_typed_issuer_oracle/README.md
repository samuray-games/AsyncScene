# Chat07B V126 - restored-original typed issuer oracle

**Status:** Offline independent fixture only. No production issuer, D1, 05C, 08A, 08B, Worker, public proposal route or deployed ACL is implemented. The original four Chat07B K01-K06 source files were read and verified from the owner-private 2026-11-04 ZIP. They are NOT copied, edited or regenerated in this directory.

## Wire compatibility

The Chat08A V125 archive (75/75 reported PASS, not rerun here) uses proposed 07B V2 keys with exact literals:

- `sourceOriginKey = JSON.stringify(['event-origin/v1', sourceSystem, canonicalSourceEventId])`
- `knowledgeKey = JSON.stringify(['npc-knowledge/v2',npcId,recipientId,sourceSystem,canonicalSourceEventId,knowledgeKind,relayReceiptIdOrNull])`
- `effectKey candidate = JSON.stringify(['npc-relationship-effect/v1',npcId,sourceSystem,canonicalSourceEventId,'verified_outcome'])`

08A's `VERIFIED_OUTCOME` is represented by **`VERIFIED_FACT`** in that proposed 07B key wire. `VERIFIED_UTTERANCE` and `HEARD_CLAIM` retain their spellings. The 08A V125 helper creates a *candidate* effect key even for derivative types, but this oracle only makes an `effectKey` available on `VERIFIED_OUTCOME`. No effect or action is ever applied here. The production 07B V2 schema has NOT been approved.

## Threat and trust boundary

`fixture-authority.mjs` is a synthetic privileged issuer simulation with separate registries for 05C finals, 08B committed PUBLIC_SUPPORT actions, authorized recipient observation, grants, and delivered relay receipts. Only the verifier interface is supplied to `typed-oracle.mjs`; caller-provided `issuerClass`, `sourceReceiptId`, `actionId`, source namespace, digest, grant, or observation references cannot self-authorize. The issuer methods themselves are test-only and MUST NEVER be exported to untrusted production callers. `sourceRef` IDs carry the `fixture-v2:` prefix.

For a VERIFIED_OUTCOME, a unique registered 05C terminal final receipt and current witness observation are required. For VERIFIED_UTTERANCE, a registered immutable 08B PUBLIC_SUPPORT + recipient-specific authorized observation and exact content digest are required. HEARD_CLAIM requires a recorded recipient-bound delivered relay; it never becomes a final. `recipientId = npcId`, current `grantId`, `grantGeneration`, `accessEpoch`, `fieldScope`, and visibility revision are rechecked before knowledge commit. Stale relay, changed receipt digest, source kind alias, absent proof, and revoked access fail closed. Derived facts do not create 08A effects, 08B proactive actions or gameplay votes.

`firstLearnedAtServer` is assigned when knowledge is first committed, not on outbox creation or client delivery. Replay returns the same receipt. Exported synthetic snapshots are MAC protected with a process-local test secret and may be reopened in this same authority instance. **This is not anti-rollback protection** against independent store restore, a proof of atomicity across databases, or a real cross-process MAC key rotation strategy. `readForRecipient` applies fresh grant and visibility checks before output, but cannot recall an already delivered copy. `critical_reviewer` and hosted native runtime acceptance are separate gates.

## Isolated test command

`node --test tools/chat07b_v126_typed_issuer_oracle/test/*.test.mjs`

Run from the isolated scratch root. This directory has no git hooks, no external dependency and no network code. Do not run Codex in the user's dirty Mac worktree.

## Verified reference ZIPs

Original 07B archive: Drive file `<owner-private-drive-id>`, SHA-256 `e79b1aab042537184207b283e0c5381e478c9ad36ca3cc73d5f0330b733927ed`. V125 conformance ZIP: Drive file `<owner-private-drive-id>`, SHA-256 `6f80cc910d6c82b66e762566ac4bdb1c13825f23e8df3f0772e9b02da9c7af25`. Both consumed read-only. Original four source SHA-256 and manifest are recorded in the private checkpoint. No byte migration or replacement happened.
