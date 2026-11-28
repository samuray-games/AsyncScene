import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTORS, FINAL_REF, NPCS, UTTERANCE_REF, claimIntent, finalIntent, issueFixtureGrant, sourceOrigin, utteranceIntent } from '../fixtures.mjs';
import { commitKnowledge, createMemoryState, inspectEffect, relationshipValue, revokeRecipientGrant } from '../memory-model.mjs';
import { effectKey, sourceOriginKey } from '../keys.mjs';
import { rehydrateState, sealState, serializeState } from '../snapshot-store.mjs';
import { fixtureSeal, knowledgeKey, parseFixtureSeal, SOURCE_ISSUERS } from '../keys.mjs';

test('exact outcome retry after snapshot reload is idempotent and preserves the first effect', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.pragmatic); state = issued.state;
  const intent = finalIntent(NPCS.pragmatic, issued.grantToken);
  state = commitKnowledge(state, intent).state;
  const before = relationshipValue(state, NPCS.pragmatic, ACTORS.winner, 'respect');
  const reloaded = rehydrateState(serializeState(state));
  const replay = commitKnowledge(reloaded, intent);
  assert.equal(replay.status, 'IDEMPOTENT_REPLAY');
  assert.equal(relationshipValue(replay.state, NPCS.pragmatic, ACTORS.winner, 'respect'), before);
  assert.equal(replay.state.effects.length, 1);
});

test('a second transport receipt for an outcome records provenance without a second effect', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.pragmatic); state = issued.state;
  state = commitKnowledge(state, finalIntent(NPCS.pragmatic, issued.grantToken, { receiptId: 'fixture-v2:receipt:first' })).state;
  const second = commitKnowledge(state, finalIntent(NPCS.pragmatic, issued.grantToken, { receiptId: 'fixture-v2:receipt:second' }));
  assert.equal(second.status, 'RECORDED_NO_EFFECT');
  assert.equal(second.state.knowledge.length, 1);
  assert.equal(second.state.knowledge[0].receipts.length, 2);
  assert.equal(second.state.effects.length, 1);
  assert.equal(relationshipValue(second.state, NPCS.pragmatic, ACTORS.winner, 'respect'), 1);
});

test('revoke before commit denies the queued intent with no knowledge or effect', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.listener); state = issued.state;
  const intent = finalIntent(NPCS.listener, issued.grantToken);
  const revoked = revokeRecipientGrant(state, issued.grantToken.grantId);
  state = revoked.state;
  const denied = commitKnowledge(state, intent);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.reason, 'GRANT_REVOKED_OR_MISSING');
  assert.equal(denied.state.knowledge.length, 0);
  assert.equal(denied.state.effects.length, 0);
});

test('revoke then regrant does not revive an old captured intent', () => {
  let state = createMemoryState();
  const first = issueFixtureGrant(state, NPCS.listener); state = first.state;
  const oldIntent = finalIntent(NPCS.listener, first.grantToken);
  state = revokeRecipientGrant(state, first.grantToken.grantId).state;
  const second = issueFixtureGrant(state, NPCS.listener, FINAL_REF, { grantId: 'fixture-v2:grant:listener:2' });
  state = second.state;
  const stale = commitKnowledge(state, oldIntent);
  assert.equal(stale.status, 'DENIED');
  assert.equal(stale.reason, 'STALE_GRANT_EPOCH');
  assert.equal(stale.state.knowledge.length, 0);
  const fresh = commitKnowledge(state, finalIntent(NPCS.listener, second.grantToken));
  assert.equal(fresh.status, 'APPLIED');
  assert.equal(fresh.state.effects.length, 1);
});

test('replacing only the grant token cannot rebind an old transport receipt after regrant', () => {
  let state = createMemoryState();
  const first = issueFixtureGrant(state, NPCS.listener); state = first.state;
  const queuedOld = finalIntent(NPCS.listener, first.grantToken);
  state = revokeRecipientGrant(state, first.grantToken.grantId).state;
  const second = issueFixtureGrant(state, NPCS.listener, FINAL_REF, { grantId: 'fixture-v2:grant:listener:2' });
  state = second.state;
  const rebound = finalIntent(NPCS.listener, second.grantToken, { receiptId: 'fixture-v2:receipt:replacement' });
  rebound.receipt = queuedOld.receipt;
  const denied = commitKnowledge(state, rebound);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.reason, 'INVALID_TRANSPORT_RECEIPT_GRANT_BINDING');
  assert.equal(denied.state.knowledge.length, 0);
  assert.equal(denied.state.effects.length, 0);
});

test('revoke and regrant after a committed outcome cannot reapply the relationship effect', () => {
  let state = createMemoryState();
  const first = issueFixtureGrant(state, NPCS.pragmatic); state = first.state;
  const intent = finalIntent(NPCS.pragmatic, first.grantToken);
  state = commitKnowledge(state, intent).state;
  state = revokeRecipientGrant(state, first.grantToken.grantId).state;
  const second = issueFixtureGrant(state, NPCS.pragmatic, FINAL_REF, { grantId: 'fixture-v2:grant:pragmatic:2' });
  state = second.state;
  const replay = commitKnowledge(state, finalIntent(NPCS.pragmatic, second.grantToken, { receiptId: 'fixture-v2:receipt:after-regrant' }));
  assert.equal(replay.status, 'RECORDED_NO_EFFECT');
  assert.equal(replay.state.effects.length, 1);
  assert.equal(relationshipValue(replay.state, NPCS.pragmatic, ACTORS.winner, 'respect'), 1);
});

test('revoked grant IDs remain reserved across regrant and snapshot reload', () => {
  let state = createMemoryState();
  const first = issueFixtureGrant(state, NPCS.listener, FINAL_REF, { grantId: 'fixture-v2:grant:historical-a' });
  state = revokeRecipientGrant(first.state, first.grantToken.grantId).state;
  const second = issueFixtureGrant(state, NPCS.listener, FINAL_REF, { grantId: 'fixture-v2:grant:historical-b' });
  state = rehydrateState(serializeState(second.state));
  assert.throws(() => issueFixtureGrant(state, NPCS.pragmatic, FINAL_REF, { grantId: 'fixture-v2:grant:historical-a' }), /DUPLICATE_GRANT_ID/);
  const unchanged = revokeRecipientGrant(state, 'fixture-v2:grant:historical-a');
  assert.equal(unchanged.revoked, false);
  assert.equal(unchanged.state.grants.find((g) => g.grantId === second.grantToken.grantId).active, true);
});

test('snapshot rehydration cannot reactivate a revoked grant without a new signed grant', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.listener); state = issued.state;
  const revoked = revokeRecipientGrant(state, issued.grantToken.grantId).state;
  const corrupted = structuredClone(revoked);
  corrupted.grants[0].active = true;
  const resealed = sealState(corrupted);
  assert.throws(() => rehydrateState(JSON.stringify(resealed)), /INVALID_SNAPSHOT_GRANT|INVALID_SNAPSHOT_GRANT_PROOF/);
});

test('snapshot serialization retains typed keys, relay provenance, and outcome-only effect identity', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.listener); state = issued.state;
  state = commitKnowledge(state, claimIntent(NPCS.listener, issued.grantToken, { receiptId: 'fixture-v2:receipt:relay-x' })).state;
  const serialized = serializeState(state);
  const loaded = rehydrateState(serialized);
  assert.equal(loaded.schemaVersion, 2);
  assert.equal(loaded.knowledge[0].kind, 'HEARD_CLAIM');
  assert.equal(loaded.effects.length, 0);
  assert.equal(effectKey({ npcId: NPCS.listener, sourceOrigin: sourceOrigin(), kind: 'HEARD_CLAIM' }), null);
});

test('corrupted snapshot bytes fail closed rather than rehydrate a modified effect', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.pragmatic); state = issued.state;
  state = commitKnowledge(state, finalIntent(NPCS.pragmatic, issued.grantToken)).state;
  const altered = serializeState(state).replace('"delta":1', '"delta":2');
  assert.notEqual(altered, serializeState(state));
  assert.throws(() => rehydrateState(altered), /SNAPSHOT_INTEGRITY_MISMATCH|RELATIONSHIP_LEDGER_MISMATCH|INVALID_SNAPSHOT_EFFECT/);
});

test('V1 or unknown snapshots are rejected without automatic migration', () => {
  assert.throws(() => rehydrateState(JSON.stringify({ schemaVersion: 1, memories: {}, appliedEffects: {} })), /INVALID_V2_SNAPSHOT_SHAPE/);
  assert.throws(() => rehydrateState(JSON.stringify({ schemaVersion: 3 })), /INVALID_V2_SNAPSHOT_SHAPE/);
});

test('snapshot rehydration rejects a checksum-valid HEARD_CLAIM relabeled as VERIFIED_OUTCOME', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.listener); state = issued.state;
  state = commitKnowledge(state, claimIntent(NPCS.listener, issued.grantToken)).state;
  const corrupted = structuredClone(state), entry = corrupted.knowledge[0];
  const wrongKey = knowledgeKey({ npcId: entry.npcId, sourceOrigin: entry.sourceOrigin, kind: 'VERIFIED_OUTCOME' });
  const relaySignature = entry.receipts[0].signature;
  entry.kind = 'VERIFIED_OUTCOME';
  entry.knowledgeKey = wrongKey;
  entry.relayReceiptId = null;
  entry.sourceSignature = relaySignature;
  for (const receipt of entry.receipts) { receipt.kind = 'VERIFIED_OUTCOME'; receipt.knowledgeKey = wrongKey; }
  for (const receipt of corrupted.receiptIndex) { receipt.kind = 'VERIFIED_OUTCOME'; receipt.knowledgeKey = wrongKey; }
  corrupted.sourceSignatures.push({ sourceOrigin: entry.sourceOrigin, signature: relaySignature });
  const resealed = sealState(corrupted);
  assert.throws(() => rehydrateState(JSON.stringify(resealed)), /KNOWLEDGE_SIGNATURE_KIND_MISMATCH|INVALID_SOURCE_SIGNATURE_DOMAIN/);
});

test('snapshot rehydration rejects two conflicting recipient payloads for one utterance origin', () => {
  function acceptedUtterance(npcId, authorId, grantId, receiptId) {
    const issued = issueFixtureGrant(createMemoryState(), npcId, UTTERANCE_REF, { grantId });
    const intent = utteranceIntent(npcId, issued.grantToken, { authorId, receiptId });
    return commitKnowledge(issued.state, intent).state;
  }
  const first = acceptedUtterance(NPCS.listener, ACTORS.loser, 'fixture-v2:grant:utterance-a', 'fixture-v2:receipt:utterance-a');
  const second = acceptedUtterance(NPCS.pragmatic, ACTORS.winner, 'fixture-v2:grant:utterance-b', 'fixture-v2:receipt:utterance-b');
  const merged = createMemoryState();
  merged.grants = [...first.grants, ...second.grants];
  merged.issuedGrantIds = [...first.issuedGrantIds, ...second.issuedGrantIds];
  merged.knowledge = [structuredClone(first.knowledge[0]), structuredClone(second.knowledge[0])];
  merged.receiptIndex = [...structuredClone(first.receiptIndex), ...structuredClone(second.receiptIndex)];
  merged.sourceSignatures = structuredClone(first.sourceSignatures);
  merged.knowledge[1].sourceSignature = first.sourceSignatures[0].signature;
  const resealed = sealState(merged);
  assert.throws(() => rehydrateState(JSON.stringify(resealed)), /INVALID_SNAPSHOT_UTTERANCE_PROOF_BINDING/);
});

test('snapshot rehydration rejects a relationship effect targeting a non-participant', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.pragmatic); state = issued.state;
  state = commitKnowledge(state, finalIntent(NPCS.pragmatic, issued.grantToken)).state;
  const corrupted = structuredClone(state), effect = corrupted.effects[0];
  effect.actorId = 'fixture-v2:actor:outsider';
  effect.signature = fixtureSeal('immutable-effect-signature/v2', SOURCE_ISSUERS.effect, {
    issuerId: effect.issuerId, npcId: effect.npcId, sourceOrigin: effect.sourceOrigin,
    actorId: effect.actorId, axis: effect.axis, delta: effect.delta, policyVersion: effect.policyVersion,
  });
  corrupted.relationships[0].actorId = effect.actorId;
  const resealed = sealState(corrupted);
  assert.throws(() => rehydrateState(JSON.stringify(resealed)), /INVALID_SNAPSHOT_EFFECT/);
});

test('snapshot rehydration rejects knowledge without any transport provenance', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.listener); state = issued.state;
  state = commitKnowledge(state, claimIntent(NPCS.listener, issued.grantToken)).state;
  const corrupted = structuredClone(state);
  corrupted.knowledge[0].receipts = [];
  corrupted.receiptIndex = [];
  const resealed = sealState(corrupted);
  assert.throws(() => rehydrateState(JSON.stringify(resealed)), /INVALID_SNAPSHOT_KNOWLEDGE/);
});

test('snapshot rehydration rejects a re-labeled sourceEventVersion without matching payload proof', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.pragmatic); state = issued.state;
  state = commitKnowledge(state, finalIntent(NPCS.pragmatic, issued.grantToken)).state;
  const corrupted = structuredClone(state), entry = corrupted.knowledge[0];
  const nextVersion = 'fixture-v2:version:substituted';
  entry.sourceRef.sourceEventVersion = nextVersion;
  const envelope = parseFixtureSeal(entry.signature, 'immutable-knowledge-signature/v2', entry.kind);
  envelope.sourceRef.sourceEventVersion = nextVersion;
  entry.signature = fixtureSeal('immutable-knowledge-signature/v2', entry.kind, envelope);
  assert.throws(() => rehydrateState(JSON.stringify(sealState(corrupted))), /KNOWLEDGE_PAYLOAD_SOURCE_REF_MISMATCH/);
});

test('snapshot rehydration rejects a receipt bound to an unissued grant ID', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.listener); state = issued.state;
  state = commitKnowledge(state, claimIntent(NPCS.listener, issued.grantToken)).state;
  const corrupted = structuredClone(state), receipt = corrupted.knowledge[0].receipts[0];
  const signed = parseFixtureSeal(receipt.signature, '07b-relay-receipt/v2', SOURCE_ISSUERS.relay);
  signed.grantId = 'fixture-v2:grant:never-issued';
  receipt.signature = fixtureSeal('07b-relay-receipt/v2', SOURCE_ISSUERS.relay, signed);
  corrupted.receiptIndex[0].signature = receipt.signature;
  assert.throws(() => rehydrateState(JSON.stringify(sealState(corrupted))), /INVALID_SNAPSHOT_RECEIPT_SIGNATURE_BINDING/);
});

test('snapshot rehydration rejects a transport receipt ID outside the fixture namespace', () => {
  let state = createMemoryState();
  const issued = issueFixtureGrant(state, NPCS.listener); state = issued.state;
  state = commitKnowledge(state, claimIntent(NPCS.listener, issued.grantToken)).state;
  const corrupted = structuredClone(state), receipt = corrupted.knowledge[0].receipts[0];
  const signed = parseFixtureSeal(receipt.signature, '07b-relay-receipt/v2', SOURCE_ISSUERS.relay);
  signed.receiptId = 'bad-receipt-id';
  receipt.receiptId = signed.receiptId;
  receipt.signature = fixtureSeal('07b-relay-receipt/v2', SOURCE_ISSUERS.relay, signed);
  corrupted.receiptIndex[0].receiptId = signed.receiptId;
  corrupted.receiptIndex[0].signature = receipt.signature;
  assert.throws(() => rehydrateState(JSON.stringify(sealState(corrupted))), /INVALID_SNAPSHOT_RECEIPT_SIGNATURE_BINDING/);
});

test('effect key remains identical across retries and grant generations', () => {
  const origin = sourceOriginKey(FINAL_REF);
  assert.equal(effectKey({ npcId: NPCS.pragmatic, sourceOrigin: origin, kind: 'VERIFIED_OUTCOME' }),
    JSON.stringify(['npc-effect/v2', NPCS.pragmatic, origin]));
  assert.equal(effectKey({ npcId: NPCS.pragmatic, sourceOrigin: origin, kind: 'VERIFIED_UTTERANCE' }), null);
  assert.equal(inspectEffect(createMemoryState(), NPCS.pragmatic, origin), null);
});
