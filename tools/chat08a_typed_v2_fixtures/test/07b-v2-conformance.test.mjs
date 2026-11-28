import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  createSynthetic07bTestPolicies,
  createProposed07bV2CandidateAdapter,
  buildProposed07bV2Keys,
  emptyProposed07bV2State,
  mockDeliveryIntentBindingForTest,
} from '../07b-v2-conformance-adapter.mjs';
import { createMemoryState as createV123State } from '../memory-model.mjs';
import {
  effectKey as v123EffectKey,
  isSourceOriginKey as isV123SourceOriginKey,
  knowledgeKey as v123KnowledgeKey,
  sourceOriginKey as v123SourceOriginKey,
  stableJson,
} from '../keys.mjs';

const id = (value) => `fixture-v2:${value}`;
const sourceRef = (event = 'fight-17', version = 'schema-3') => ({
  sourceSystem: id('05c-final'),
  canonicalSourceEventId: id(event),
  sourceEventVersion: id(version),
});
const source = () => ({
  finality: 'FINAL',
  outcomeCode: id('winner-a'),
  proofDigest: 'd'.repeat(64),
});
const resultDigest = (ref, finalSource) => createHash('sha256')
  .update(stableJson({ sourceRef: ref, source: finalSource })).digest('hex');
const effect = (ref = sourceRef(), finalSource = source()) => ({
  actorId: id('actor-a'),
  axis: 'respect',
  delta: 1,
  reasonCode: id('won-final'),
  policyVersion: id('relationship-v1'),
  resultDigest: resultDigest(ref, finalSource),
});
const grantBinding = (grant) => ({ grantId: grant.grantId, generation: grant.generation, accessEpoch: grant.accessEpoch });

function addTestIntentTicket(ctx, intent) {
  intent.mockDeliveryIntentTestTicket = ctx.policies.issueMockDeliveryIntentTestTicket(
    mockDeliveryIntentBindingForTest(intent));
  return intent;
}

function context() {
  const policies = createSynthetic07bTestPolicies();
  const adapter = createProposed07bV2CandidateAdapter(policies);
  const grant = {
    npcId: id('npc-a'), recipientId: id('npc-a'), grantId: id('grant-1'),
    generation: 1, accessEpoch: 1, active: true,
  };
  const state = adapter.installMockGrantForTest(emptyProposed07bV2State(policies), grant);
  const mockGrantTestToken = policies.issueMockGrantTestToken(grant);
  return { adapter, policies, grant, mockGrantTestToken, state };
}

function finalIntent(ctx, overrides = {}) {
  const ref = overrides.sourceRef ?? sourceRef();
  const finalSource = overrides.source ?? source();
  const receiptId = overrides.sourceReceiptId ?? id('05c-receipt-1');
  return addTestIntentTicket(ctx, {
    npcId: id('npc-a'),
    recipientId: id('npc-a'),
    sourceRef: ref,
    knowledgeKind: 'VERIFIED_FACT',
    source: finalSource,
    sourceReceiptId: receiptId,
    learnedAtServer: id('time-first'),
    mockGrantBinding: overrides.mockGrantBinding ?? grantBinding(ctx.grant),
    trustedSourceTestTicket: ctx.policies.issueTrustedFinalTestTicket(ref, finalSource, receiptId),
    mockGrantTestToken: overrides.mockGrantTestToken ?? ctx.mockGrantTestToken,
    ...overrides,
  });
}

function claimIntent(ctx, { receiptId = 'relay-1', ref = sourceRef(), claim = {
  claimCode: id('heard-win'), speakerId: id('speaker-a'),
} } = {}) {
  const receipt = ctx.policies.registerTrustedRelayReceiptForTest({
    receiptId: id(receiptId),
    sourceSystem: ref.sourceSystem,
    eventId: ref.canonicalSourceEventId,
    sourceEventVersion: ref.sourceEventVersion,
    recipientId: id('npc-a'),
    speakerId: claim.speakerId,
    claimDigest: createHash('sha256').update(stableJson(claim)).digest('hex'),
    deliveredAt: id(`delivered-${receiptId}`),
  });
  return addTestIntentTicket(ctx, {
    npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref,
    knowledgeKind: 'HEARD_CLAIM', relayReceiptId: receipt.receiptId,
    claim, relayReceipt: receipt, mockGrantBinding: grantBinding(ctx.grant),
    mockGrantTestToken: ctx.mockGrantTestToken,
  });
}

test('proposed 07B V2 keys match the exact canonical JSON tuple formats', () => {
  const ref = sourceRef();
  const keys = buildProposed07bV2Keys({
    npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref,
    knowledgeKind: 'VERIFIED_FACT',
  });
  assert.equal(keys.sourceOriginKey, JSON.stringify(['event-origin/v1', ref.sourceSystem, ref.canonicalSourceEventId]));
  assert.equal(keys.knowledgeKey, JSON.stringify([
    'npc-knowledge/v2', id('npc-a'), id('npc-a'), ref.sourceSystem,
    ref.canonicalSourceEventId, 'VERIFIED_FACT', null,
  ]));
  assert.equal(keys.effectKey, JSON.stringify([
    'npc-relationship-effect/v1', id('npc-a'), ref.sourceSystem,
    ref.canonicalSourceEventId, 'verified_outcome',
  ]));
});

test('verified knowledge uses relayKey=null and requires explicit recipient binding', () => {
  const ref = sourceRef();
  for (const knowledgeKind of ['VERIFIED_FACT', 'VERIFIED_UTTERANCE']) {
    const keys = buildProposed07bV2Keys({ npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref, knowledgeKind });
    assert.equal(JSON.parse(keys.knowledgeKey).at(-1), null);
  }
  assert.throws(() => buildProposed07bV2Keys({
    npcId: id('npc-a'), recipientId: id('npc-b'), sourceRef: ref, knowledgeKind: 'VERIFIED_FACT',
  }), /RECIPIENT_NPC_BINDING_MISMATCH/);
});

test('the same event keeps independent source, kind-specific knowledge, and outcome effect identities', () => {
  const ref = sourceRef();
  const fact = buildProposed07bV2Keys({ npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref, knowledgeKind: 'VERIFIED_FACT' });
  const utterance = buildProposed07bV2Keys({ npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref, knowledgeKind: 'VERIFIED_UTTERANCE' });
  const claim = buildProposed07bV2Keys({ npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref,
    knowledgeKind: 'HEARD_CLAIM', relayReceiptId: id('relay-1') });
  assert.equal(fact.sourceOriginKey, utterance.sourceOriginKey);
  assert.equal(fact.sourceOriginKey, claim.sourceOriginKey);
  assert.notEqual(fact.knowledgeKey, utterance.knowledgeKey);
  assert.notEqual(fact.knowledgeKey, claim.knowledgeKey);
  assert.notEqual(claim.knowledgeKey, buildProposed07bV2Keys({
    npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref,
    knowledgeKind: 'HEARD_CLAIM', relayReceiptId: id('relay-2'),
  }).knowledgeKey);
  assert.equal(fact.effectKey, utterance.effectKey);
  assert.equal(fact.effectKey, claim.effectKey);
});

test('VERIFIED_FACT does not become verified_outcome through a string issuer alias', () => {
  const ctx = context();
  const intent = finalIntent(ctx);
  intent.trustedSourceTestTicket = undefined;
  intent.source.issuerId = 'trusted-05c';
  intent.source.sourceKind = 'VERIFIED_FACT';
  addTestIntentTicket(ctx, intent);
  const result = ctx.adapter.commit(ctx.state, intent);
  assert.equal(result.status, 'DENIED');
  assert.equal(result.reason, 'VERIFIED_FACT_REQUIRES_EXPLICIT_TRUSTED_TEST_POLICY');
  assert.equal(result.state.knowledge.length, 0);
  assert.equal(result.state.effects.length, 0);
});

test('only an explicit trusted-source test ticket maps VERIFIED_FACT to verified_outcome', () => {
  const ctx = context();
  const intent = finalIntent(ctx);
  const result = ctx.adapter.commit(ctx.state, intent);
  assert.equal(result.status, 'NEW_KNOWLEDGE');
  assert.equal(result.state.knowledge[0].knowledgeKind, 'VERIFIED_FACT');
  assert.equal(result.state.knowledge[0].factKind, 'verified_outcome');
  assert.equal(result.state.knowledge[0].relayReceiptId, null);
});

test('a forged or altered final test ticket is denied without memory or effect', () => {
  const ctx = context();
  const forged = finalIntent(ctx);
  forged.source.finality = 'UNFINALIZED';
  addTestIntentTicket(ctx, forged);
  const result = ctx.adapter.commit(ctx.state, forged);
  assert.equal(result.status, 'DENIED');
  assert.equal(result.state.knowledge.length, 0);
  assert.equal(result.state.effects.length, 0);
});

test('wrong recipient binding is denied before state changes', () => {
  const ctx = context();
  const result = ctx.adapter.commit(ctx.state, finalIntent(ctx, { recipientId: id('npc-other') }));
  assert.equal(result.status, 'DENIED');
  assert.equal(result.reason, 'RECIPIENT_NPC_BINDING_MISMATCH');
  assert.equal(result.state.knowledge.length, 0);
});

test('two relay receipts for one claim create separate provenance rows and no effects', () => {
  const ctx = context();
  const first = claimIntent(ctx, { receiptId: 'relay-a' });
  const second = claimIntent(ctx, { receiptId: 'relay-b' });
  let result = ctx.adapter.commit(ctx.state, first);
  assert.equal(result.status, 'NEW_KNOWLEDGE');
  result = ctx.adapter.commit(result.state, second);
  assert.equal(result.status, 'NEW_KNOWLEDGE');
  assert.equal(result.state.knowledge.length, 2);
  assert.notEqual(result.state.knowledge[0].knowledgeKey, result.state.knowledge[1].knowledgeKey);
  assert.equal(result.state.knowledge[0].factKind, 'unverified_relay');
  assert.equal(result.state.knowledge[1].factKind, 'unverified_relay');
  assert.equal(result.state.effects.length, 0);
  assert.equal(result.state.relationships.length, 0);
});

test('unknown relay receipt IDs are rejected', () => {
  const ctx = context();
  const intent = claimIntent(ctx, { receiptId: 'relay-known' });
  ctx.policies.issueMockGrantTestToken(ctx.grant);
  const untrusted = { ...intent, relayReceipt: { ...intent.relayReceipt, receiptId: id('relay-forged') },
    relayReceiptId: id('relay-forged') };
  addTestIntentTicket(ctx, untrusted);
  const result = ctx.adapter.commit(ctx.state, untrusted);
  assert.equal(result.status, 'DENIED');
  assert.equal(result.reason, 'UNTRUSTED_RELAY_RECEIPT_ID');
  assert.equal(result.state.knowledge.length, 0);
});

test('changed immutable receipt under the same relay ID is quarantined', () => {
  const ctx = context();
  const original = claimIntent(ctx, { receiptId: 'relay-fixed' });
  const first = ctx.adapter.commit(ctx.state, original);
  assert.equal(first.status, 'NEW_KNOWLEDGE');
  const changed = { ...original, relayReceipt: { ...original.relayReceipt, deliveredAt: id('changed-time') } };
  addTestIntentTicket(ctx, changed);
  const second = ctx.adapter.commit(first.state, changed);
  assert.equal(second.status, 'CONFLICT_QUARANTINE');
  assert.equal(second.reason, 'IMMUTABLE_RELAY_RECEIPT_CONFLICT');
  assert.equal(second.state.knowledge.length, 1);
  assert.equal(second.state.effects.length, 0);
  assert.equal(second.state.quarantines.length, 1);
});

test('changed claim payload under a known relay receipt is quarantined, not denied or replaced', () => {
  const ctx = context();
  const original = claimIntent(ctx, { receiptId: 'relay-claim-immutable' });
  const first = ctx.adapter.commit(ctx.state, original);
  const changed = { ...original, claim: { ...original.claim, claimCode: id('different-claim') } };
  addTestIntentTicket(ctx, changed);
  const second = ctx.adapter.commit(first.state, changed);
  assert.equal(first.status, 'NEW_KNOWLEDGE');
  assert.equal(second.status, 'CONFLICT_QUARANTINE');
  assert.equal(second.state.knowledge.length, 1);
  assert.equal(second.state.quarantines.length, 1);
});

test('changed speaker under a known relay receipt is quarantined', () => {
  const ctx = context();
  const original = claimIntent(ctx, { receiptId: 'relay-speaker-immutable' });
  const first = ctx.adapter.commit(ctx.state, original);
  const changed = { ...original, claim: { ...original.claim, speakerId: id('speaker-forged') } };
  addTestIntentTicket(ctx, changed);
  const second = ctx.adapter.commit(first.state, changed);
  assert.equal(first.status, 'NEW_KNOWLEDGE');
  assert.equal(second.status, 'CONFLICT_QUARANTINE');
  assert.equal(second.reason, 'IMMUTABLE_RELAY_CLAIM_CONFLICT');
  assert.equal(second.state.knowledge.length, 1);
  assert.equal(second.state.quarantines.length, 1);
});

test('exact replay after snapshot reload is idempotent and preserves one relationship effect', () => {
  const ctx = context();
  const ref = sourceRef();
  const finalSource = source();
  const relEffect = effect();
  const intent = finalIntent(ctx, {
    sourceRef: ref,
    source: finalSource,
    relationshipEffect: relEffect,
    relationshipEffectTestTicket: ctx.policies.issueRelationshipEffectTestTicket(id('npc-a'), ref, finalSource, relEffect),
  });
  const first = ctx.adapter.commit(ctx.state, intent);
  assert.equal(first.status, 'NEW_KNOWLEDGE');
  assert.equal(first.state.effects.length, 1);
  assert.equal(first.state.relationships[0].value, 1);

  const reloaded = ctx.adapter.reload(JSON.parse(JSON.stringify(first.state)));
  const replay = ctx.adapter.commit(reloaded, intent);
  assert.equal(replay.status, 'IDEMPOTENT_REPLAY');
  assert.equal(replay.state.effects.length, 1);
  assert.equal(replay.state.relationships[0].value, 1);
});

test('replay cannot change or add an outcome relationship effect policy', () => {
  const ctx = context();
  const ref = sourceRef();
  const initialEffect = effect();
  const initialIntent = finalIntent(ctx, {
    relationshipEffect: initialEffect,
    relationshipEffectTestTicket: ctx.policies.issueRelationshipEffectTestTicket(id('npc-a'), ref, source(), initialEffect),
  });
  const first = ctx.adapter.commit(ctx.state, initialIntent);
  const changedEffect = { ...initialEffect, axis: 'fear', delta: -1 };
  const changedIntent = finalIntent(ctx, {
    relationshipEffect: changedEffect,
    relationshipEffectTestTicket: ctx.policies.issueRelationshipEffectTestTicket(id('npc-a'), ref, source(), changedEffect),
  });
  const conflict = ctx.adapter.commit(first.state, changedIntent);
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.state.effects.length, 1);
  assert.equal(conflict.state.relationships.length, 1);
  assert.equal(conflict.state.quarantines.length, 1);
});

test('a replay cannot newly attach a relationship effect to committed knowledge', () => {
  const ctx = context();
  const first = ctx.adapter.commit(ctx.state, finalIntent(ctx));
  const ref = sourceRef();
  const relEffect = effect();
  const replayIntent = finalIntent(ctx, {
    relationshipEffect: relEffect,
    relationshipEffectTestTicket: ctx.policies.issueRelationshipEffectTestTicket(id('npc-a'), ref, source(), relEffect),
  });
  const conflict = ctx.adapter.commit(first.state, replayIntent);
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.state.effects.length, 0);
  assert.equal(conflict.state.relationships.length, 0);
  assert.equal(conflict.state.quarantines.length, 1);
});

test('revoke rejects an old intent; regrant permits replay without reapplying effect', () => {
  const ctx = context();
  const ref = sourceRef();
  const finalSource = source();
  const relEffect = effect();
  const intent = finalIntent(ctx, {
    relationshipEffect: relEffect,
    relationshipEffectTestTicket: ctx.policies.issueRelationshipEffectTestTicket(id('npc-a'), ref, source(), relEffect),
  });
  const first = ctx.adapter.commit(ctx.state, intent);
  const revoked = ctx.adapter.revokeMockGrantForTest(first.state, id('npc-a'), id('npc-a'));
  const denied = ctx.adapter.commit(revoked, intent);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.reason, 'MOCK_GRANT_INACTIVE_OR_STALE');

  const nextGrant = { ...ctx.grant, grantId: id('grant-2'), generation: 2, accessEpoch: 3, active: true };
  const regranted = ctx.adapter.installMockGrantForTest(revoked, nextGrant);
  const nextToken = ctx.policies.issueMockGrantTestToken(nextGrant);
  const freshIntent = addTestIntentTicket(ctx, { ...intent,
    mockGrantBinding: grantBinding(nextGrant), mockGrantTestToken: nextToken });
  const replay = ctx.adapter.commit(regranted, freshIntent);
  assert.equal(replay.status, 'IDEMPOTENT_REPLAY');
  assert.equal(replay.state.effects.length, 1);
  assert.equal(replay.state.relationships[0].value, 1);
});

test('replacing only the mock grant token cannot revive a queued pre-revoke intent', () => {
  const ctx = context();
  const intent = finalIntent(ctx);
  const revoked = ctx.adapter.revokeMockGrantForTest(ctx.state, id('npc-a'), id('npc-a'));
  const nextGrant = { ...ctx.grant, grantId: id('grant-2'), generation: 2, accessEpoch: 3, active: true };
  const regranted = ctx.adapter.installMockGrantForTest(revoked, nextGrant);
  const newToken = ctx.policies.issueMockGrantTestToken(nextGrant);
  const attemptedResurrection = ctx.adapter.commit(regranted, { ...intent, mockGrantTestToken: newToken });
  assert.equal(attemptedResurrection.status, 'DENIED');
  assert.equal(attemptedResurrection.state.knowledge.length, 0);
});

test('source version is excluded from identity but immutable signature mismatch quarantines', () => {
  const ctx = context();
  const firstIntent = finalIntent(ctx);
  const first = ctx.adapter.commit(ctx.state, firstIntent);
  assert.equal(first.status, 'NEW_KNOWLEDGE');
  const changedRef = sourceRef('fight-17', 'schema-4');
  const changedSource = source();
  const changed = finalIntent(ctx, { sourceRef: changedRef, source: changedSource });
  const changedKeys = buildProposed07bV2Keys({
    npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: changedRef, knowledgeKind: 'VERIFIED_FACT',
  });
  assert.equal(JSON.parse(first.state.knowledge[0].knowledgeKey)[5], 'VERIFIED_FACT');
  assert.equal(changedKeys.sourceOriginKey, first.state.knowledge[0].sourceOriginKey);
  assert.equal(changedKeys.knowledgeKey, first.state.knowledge[0].knowledgeKey);
  assert.equal(changedKeys.effectKey, first.state.knowledge[0].effectKey);
  const result = ctx.adapter.commit(first.state, changed);
  assert.equal(result.status, 'CONFLICT_QUARANTINE');
  assert.equal(result.reason, 'IMMUTABLE_SOURCE_VERSION_CONFLICT');
  assert.equal(result.state.knowledge.length, 1);
  assert.equal(result.state.effects.length, 0);
  assert.equal(result.state.quarantines.length, 1);
});

test('sourceReceiptId is immutable provenance, not a key field or a replay alias', () => {
  const ctx = context();
  const firstIntent = finalIntent(ctx);
  const first = ctx.adapter.commit(ctx.state, firstIntent);
  const changed = finalIntent(ctx, { sourceReceiptId: id('05c-receipt-changed') });
  const second = ctx.adapter.commit(first.state, changed);
  assert.equal(first.status, 'NEW_KNOWLEDGE');
  assert.equal(second.status, 'CONFLICT_QUARANTINE');
  assert.equal(second.state.knowledge.length, 1);
  assert.equal(second.state.quarantines.length, 1);
});

test('verified final requires a nonempty immutable sourceReceiptId', () => {
  const ctx = context();
  const missing = finalIntent(ctx);
  missing.sourceReceiptId = null;
  addTestIntentTicket(ctx, missing);
  const result = ctx.adapter.commit(ctx.state, missing);
  assert.equal(result.status, 'DENIED');
  assert.equal(result.state.knowledge.length, 0);
});

test('contradictory trusted finals for one source origin quarantine across NPC recipients', () => {
  const ctx = context();
  const npcB = id('npc-b');
  const grantB = { npcId: npcB, recipientId: npcB, grantId: id('grant-b'), generation: 1, accessEpoch: 1, active: true };
  const stateWithB = ctx.adapter.installMockGrantForTest(ctx.state, grantB);
  const tokenB = ctx.policies.issueMockGrantTestToken(grantB);
  const first = ctx.adapter.commit(stateWithB, finalIntent(ctx));
  const contradictory = finalIntent(ctx, {
    npcId: npcB,
    recipientId: npcB,
    mockGrantBinding: grantBinding(grantB),
    mockGrantTestToken: tokenB,
    source: { ...source(), outcomeCode: id('different-winner') },
  });
  const second = ctx.adapter.commit(first.state, contradictory);
  assert.equal(first.status, 'NEW_KNOWLEDGE');
  assert.equal(second.status, 'CONFLICT_QUARANTINE');
  assert.equal(second.state.knowledge.length, 1);
  assert.equal(second.state.quarantines.length, 1);
});

test('extra fields cannot overwrite computed effect key or signature', () => {
  const ctx = context();
  const ref = sourceRef();
  const malicious = { ...effect(), effectKey: 'overwritten', signature: 'overwritten' };
  const intent = finalIntent(ctx, {
    relationshipEffect: malicious,
    relationshipEffectTestTicket: ctx.policies.issueRelationshipEffectTestTicket(id('npc-a'), ref, source(), malicious),
  });
  const result = ctx.adapter.commit(ctx.state, intent);
  assert.equal(result.status, 'CONFLICT_QUARANTINE');
  assert.equal(result.state.knowledge.length, 0);
  assert.equal(result.state.effects.length, 0);
  assert.equal(result.state.quarantines.length, 1);
});

test('relationship effect test ticket is bound to the exact accepted result digest', () => {
  const ctx = context();
  const ref = sourceRef();
  const firstSource = source();
  const firstEffect = effect(ref, firstSource);
  const effectTicket = ctx.policies.issueRelationshipEffectTestTicket(
    id('npc-a'), ref, firstSource, firstEffect);
  const secondSource = { ...source(), outcomeCode: id('different-winner') };
  const forgedIntent = finalIntent(ctx, {
    sourceRef: ref,
    source: secondSource,
    relationshipEffect: firstEffect,
    relationshipEffectTestTicket: effectTicket,
  });
  const result = ctx.adapter.commit(ctx.state, forgedIntent);
  assert.equal(result.status, 'CONFLICT_QUARANTINE');
  assert.equal(result.reason, 'OUTCOME_EFFECT_REQUIRES_EXPLICIT_TEST_POLICY');
  assert.equal(result.state.knowledge.length, 0);
  assert.equal(result.state.effects.length, 0);
});

test('rehydration rejects a reactivated grant even with a recomputed public checksum', () => {
  const ctx = context();
  const revoked = ctx.adapter.revokeMockGrantForTest(ctx.state, id('npc-a'), id('npc-a'));
  const tampered = JSON.parse(JSON.stringify(revoked));
  tampered.currentGrants[0].active = true;
  tampered.currentGrants[0].accessEpoch = 1;
  delete tampered.snapshotMac;
  tampered.snapshotMac = createHash('sha256').update(stableJson(tampered)).digest('hex');
  assert.throws(() => ctx.adapter.reload(tampered), /INVALID_CANDIDATE_STATE/);
});

test('a valid older T1 snapshot cannot restore rights after external mock T2 regrant', () => {
  const ctx = context();
  const oldSnapshot = JSON.parse(JSON.stringify(ctx.state));
  const oldIntent = finalIntent(ctx);
  const revoked = ctx.adapter.revokeMockGrantForTest(ctx.state, id('npc-a'), id('npc-a'));
  const nextGrant = { ...ctx.grant, grantId: id('grant-2'), generation: 2, accessEpoch: 3, active: true };
  ctx.adapter.installMockGrantForTest(revoked, nextGrant);

  const restored = ctx.adapter.reload(oldSnapshot);
  const result = ctx.adapter.commit(restored, oldIntent);
  assert.equal(result.status, 'DENIED');
  assert.equal(result.reason, 'MOCK_GRANT_INACTIVE_OR_STALE');
  assert.equal(result.state.knowledge.length, 0);
});

test('a stale empty snapshot cannot reinstall a revoked identical T1 grant', () => {
  const ctx = context();
  const staleEmpty = emptyProposed07bV2State(ctx.policies);
  const intent = finalIntent(ctx);
  const revoked = ctx.adapter.revokeMockGrantForTest(ctx.state, id('npc-a'), id('npc-a'));

  assert.throws(
    () => ctx.adapter.installMockGrantForTest(ctx.adapter.reload(staleEmpty), ctx.grant),
    /MOCK_GRANT_EXTERNAL_FENCE_REJECTED/,
  );
  const denied = ctx.adapter.commit(revoked, intent);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.reason, 'MOCK_GRANT_INACTIVE_OR_STALE');
  assert.equal(denied.state.knowledge.length, 0);
});

test('trusted final test policy rejects coercible non-string proof digests', () => {
  const ctx = context();
  const ref = sourceRef();
  assert.throws(() => ctx.policies.issueTrustedFinalTestTicket(
    ref, { ...source(), proofDigest: ['a'.repeat(64)] }, id('05c-receipt-1'),
  ), /TEST_POLICY_REJECTED_UNVERIFIED_FINAL/);
});

test('relay receipt policy rejects coercible non-string claim digests', () => {
  const ctx = context();
  assert.throws(() => ctx.policies.registerTrustedRelayReceiptForTest({
    receiptId: id('relay-bad-digest'), sourceSystem: id('05c-final'), eventId: id('fight-17'),
    sourceEventVersion: id('schema-3'), recipientId: id('npc-a'), speakerId: id('npc-a'),
    claimDigest: ['a'.repeat(64)], deliveredAt: id('time-relay'),
  }), /INVALID_TEST_RELAY_RECEIPT/);
});

test('top-level accessor properties are rejected without executing getters', () => {
  const ctx = context();
  let getterCalled = false;
  const intent = finalIntent(ctx);
  Object.defineProperty(intent, 'source', {
    enumerable: true,
    get() { getterCalled = true; throw new Error('ACCESSOR_EXECUTED'); },
  });
  const result = ctx.adapter.commit(ctx.state, intent);
  assert.equal(result.status, 'DENIED');
  assert.equal(result.reason, 'INVALID_JSON_DATA');
  assert.equal(getterCalled, false);
});

test('top-level Proxy intents are rejected before any proxy trap runs', () => {
  const ctx = context();
  let trapCalls = 0;
  const intent = new Proxy(finalIntent(ctx), {
    ownKeys(target) {
      trapCalls += 1;
      return Reflect.ownKeys(target);
    },
  });
  const result = ctx.adapter.commit(ctx.state, intent);
  assert.equal(result.status, 'DENIED');
  assert.equal(result.reason, 'INVALID_JSON_DATA');
  assert.equal(trapCalls, 0);
});

test('VERIFIED_UTTERANCE is a separate trusted utterance and creates no outcome effect', () => {
  const ctx = context();
  const ref = sourceRef();
  const utterance = { channel: 'PUBLIC', authorId: id('npc-a'), utteranceCode: id('said-win') };
  const intent = {
    npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref,
    knowledgeKind: 'VERIFIED_UTTERANCE', utterance,
    trustedUtteranceTestTicket: ctx.policies.issueTrustedUtteranceTestTicket(ref, utterance),
    mockGrantBinding: grantBinding(ctx.grant),
    mockGrantTestToken: ctx.mockGrantTestToken,
  };
  addTestIntentTicket(ctx, intent);
  const result = ctx.adapter.commit(ctx.state, intent);
  assert.equal(result.status, 'NEW_KNOWLEDGE');
  assert.equal(result.state.knowledge[0].factKind, 'verified_utterance');
  assert.equal(result.state.knowledge[0].effectKey, null);
  assert.equal(result.state.effects.length, 0);
  assert.equal(result.state.relationships.length, 0);
});

test('V123 and proposed 07B V2 key tuples are not byte-interchangeable', () => {
  const ref = sourceRef();
  const v123Ref = {
    sourceSystem: ref.sourceSystem,
    eventId: ref.canonicalSourceEventId,
    sourceEventVersion: ref.sourceEventVersion,
  };
  const oldOrigin = v123SourceOriginKey(v123Ref);
  const proposed = buildProposed07bV2Keys({
    npcId: id('npc-a'), recipientId: id('npc-a'), sourceRef: ref, knowledgeKind: 'VERIFIED_FACT',
  });
  const oldKnowledge = v123KnowledgeKey({ npcId: id('npc-a'), sourceOrigin: oldOrigin, kind: 'VERIFIED_OUTCOME' });
  const oldEffect = v123EffectKey({ npcId: id('npc-a'), sourceOrigin: oldOrigin, kind: 'VERIFIED_OUTCOME' });
  assert.notEqual(oldOrigin, proposed.sourceOriginKey);
  assert.notEqual(oldKnowledge, proposed.knowledgeKey);
  assert.notEqual(oldEffect, proposed.effectKey);
  assert.equal(isV123SourceOriginKey(proposed.sourceOriginKey), false);
  assert.notEqual(stableJson(JSON.parse(oldKnowledge)), stableJson(JSON.parse(proposed.knowledgeKey)));
  const ctx = context();
  assert.throws(() => ctx.adapter.reload(createV123State()), /INVALID_CANDIDATE_STATE/);
});
