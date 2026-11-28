import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTORS, FINAL_REF, NPCS, UTTERANCE_REF, claimIntent, effectPolicy, finalIntent,
  issueFixtureGrant, sourceOrigin, utteranceIntent,
} from '../fixtures.mjs';
import { commitKnowledge, createMemoryState, inspectEffect, inspectMemory, relationshipValue } from '../memory-model.mjs';
import { effectKey, fixtureSeal, knowledgeKey, SOURCE_ISSUERS, sourceOriginKey, stableJson } from '../keys.mjs';

function grant(state, npcId, ref = FINAL_REF, options) {
  return issueFixtureGrant(state, npcId, ref, options);
}

test('source, knowledge, effect, and transport receipt identities are disjoint', () => {
  const origin = sourceOriginKey(FINAL_REF);
  const fact = knowledgeKey({ npcId: NPCS.listener, sourceOrigin: origin, kind: 'VERIFIED_OUTCOME' });
  const rumorA = knowledgeKey({ npcId: NPCS.listener, sourceOrigin: origin, kind: 'HEARD_CLAIM', relayReceiptId: 'fixture-v2:receipt:a' });
  const rumorB = knowledgeKey({ npcId: NPCS.listener, sourceOrigin: origin, kind: 'HEARD_CLAIM', relayReceiptId: 'fixture-v2:receipt:b' });
  assert.notEqual(fact, rumorA);
  assert.notEqual(rumorA, rumorB);
  assert.equal(effectKey({ npcId: NPCS.listener, sourceOrigin: origin, kind: 'VERIFIED_UTTERANCE' }), null);
  assert.notEqual(effectKey({ npcId: NPCS.listener, sourceOrigin: origin, kind: 'VERIFIED_OUTCOME' }), fact);
});

test('one confirmed final can produce three distinct policy reactions for three NPCs', () => {
  let state = createMemoryState();
  const cases = [
    [NPCS.compassionate, ACTORS.loser, 'sympathy'],
    [NPCS.pragmatic, ACTORS.winner, 'respect'],
    [NPCS.cautious, ACTORS.winner, 'fear'],
  ];
  for (const [npcId, actorId, axis] of cases) {
    const issued = grant(state, npcId); state = issued.state;
    const applied = commitKnowledge(state, finalIntent(npcId, issued.grantToken));
    assert.equal(applied.status, 'APPLIED');
    state = applied.state;
    assert.equal(relationshipValue(state, npcId, actorId, axis), 1);
    assert.equal(state.effects.filter((e) => e.npcId === npcId && e.sourceOrigin === sourceOrigin()).length, 1);
  }
});

test('an NPC without a recipient grant does not learn the event', () => {
  const issued = grant(createMemoryState(), NPCS.listener);
  const state = issued.state;
  const forgedIntent = finalIntent(NPCS.listener, issued.grantToken);
  forgedIntent.npcId = NPCS.absent;
  const denied = commitKnowledge(state, forgedIntent);
  assert.equal(denied.status, 'DENIED');
  assert.deepEqual(denied.state.knowledge, []);
  assert.deepEqual(denied.state.effects, []);
});

test('a verified outcome and a heard claim about the same event occupy separate entries', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const claim = commitKnowledge(state, claimIntent(NPCS.listener, issued.grantToken));
  assert.equal(claim.status, 'RECORDED_NO_EFFECT');
  state = claim.state;
  const outcome = commitKnowledge(state, finalIntent(NPCS.listener, issued.grantToken));
  assert.equal(outcome.status, 'APPLIED');
  state = outcome.state;
  const entries = inspectMemory(state, NPCS.listener, sourceOrigin());
  assert.deepEqual(entries.map((e) => e.kind).sort(), ['HEARD_CLAIM', 'VERIFIED_OUTCOME']);
  assert.equal(state.effects.length, 1);
  assert.equal(entries.find((e) => e.kind === 'HEARD_CLAIM').signature.includes('VERIFIED_OUTCOME'), false);
});

test('two valid relay receipts remain separate provenance and create no relationship effect', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  for (const receiptId of ['fixture-v2:receipt:relay-a', 'fixture-v2:receipt:relay-b']) {
    const heard = commitKnowledge(state, claimIntent(NPCS.listener, issued.grantToken, { receiptId }));
    assert.equal(heard.status, 'RECORDED_NO_EFFECT');
    state = heard.state;
  }
  const entries = inspectMemory(state, NPCS.listener, sourceOrigin());
  assert.equal(entries.length, 2);
  assert.equal(new Set(entries.map((e) => e.relayReceiptId)).size, 2);
  assert.equal(state.effects.length, 0);
  assert.equal(state.relationships.length, 0);
});

test('a rumor cannot be promoted by changing its kind while retaining the claim receipt', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const rumor = claimIntent(NPCS.listener, issued.grantToken);
  const committed = commitKnowledge(state, rumor); state = committed.state;
  const promoted = { ...rumor, kind: 'VERIFIED_OUTCOME' };
  const denied = commitKnowledge(state, promoted);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.state.effects.length, 0);
  assert.equal(inspectMemory(denied.state, NPCS.listener, sourceOrigin()).filter((e) => e.kind === 'VERIFIED_OUTCOME').length, 0);
});

test('a verified public utterance is remembered but cannot change relationships', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener, UTTERANCE_REF); state = issued.state;
  const heard = commitKnowledge(state, utteranceIntent(NPCS.listener, issued.grantToken));
  assert.equal(heard.status, 'RECORDED_NO_EFFECT');
  assert.equal(heard.state.knowledge[0].kind, 'VERIFIED_UTTERANCE');
  assert.equal(heard.state.effects.length, 0);
  assert.equal(heard.state.relationships.length, 0);
});

test('the same utterance source origin cannot acquire conflicting authors across NPCs or reload', () => {
  let state = createMemoryState();
  const firstGrant = grant(state, NPCS.listener, UTTERANCE_REF); state = firstGrant.state;
  const first = utteranceIntent(NPCS.listener, firstGrant.grantToken, { authorId: ACTORS.loser });
  const accepted = commitKnowledge(state, first);
  assert.equal(accepted.status, 'RECORDED_NO_EFFECT');
  state = accepted.state;
  const secondGrant = grant(state, NPCS.pragmatic, UTTERANCE_REF, { grantId: 'fixture-v2:grant:pragmatic:utterance' });
  state = secondGrant.state;
  const conflict = commitKnowledge(state, utteranceIntent(NPCS.pragmatic, secondGrant.grantToken, { authorId: ACTORS.winner,
    receiptId: 'fixture-v2:receipt:utterance:other' }));
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.reason, 'IMMUTABLE_SOURCE_SIGNATURE_MISMATCH');
  assert.equal(conflict.state.knowledge.length, 1);
  assert.equal(conflict.state.effects.length, 0);
});

test('a forged source issuer or altered final proof is denied without writes', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const forgedIssuer = finalIntent(NPCS.listener, issued.grantToken, { sourceIssuerId: 'fixture-v2:attacker:fake' });
  const forged = commitKnowledge(state, forgedIssuer);
  assert.equal(forged.status, 'DENIED');
  assert.equal(forged.state.knowledge.length, 0);
  const alteredProof = finalIntent(NPCS.listener, issued.grantToken, { sourceProof: 'fixture-only:forged' });
  assert.equal(commitKnowledge(state, alteredProof).status, 'DENIED');
});

test('a forged grant issuer is denied even when the grant ID looks valid', () => {
  const state = createMemoryState();
  assert.throws(() => grant(state, NPCS.listener, FINAL_REF, { issuerId: 'fixture-v2:attacker:grant' }), /INVALID_GRANT_ISSUER_OR_ID/);
});

test('a forged, misbound, or altered relay receipt is denied', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const wrongIssuer = claimIntent(NPCS.listener, issued.grantToken, { receiptOverrides: { issuerId: 'fixture-v2:attacker:relay' } });
  assert.equal(commitKnowledge(state, wrongIssuer).status, 'DENIED');
  const wrongBinding = claimIntent(NPCS.listener, issued.grantToken, { receiptOverrides: { npcId: NPCS.absent } });
  assert.equal(commitKnowledge(state, wrongBinding).status, 'DENIED');
  const badProof = claimIntent(NPCS.listener, issued.grantToken, { receiptOverrides: { proof: 'fixture-only:bad-receipt-proof' } });
  assert.equal(commitKnowledge(state, badProof).status, 'DENIED');
});

test('a nested sourceRef cannot reuse one final proof for another source origin', () => {
  const refB = { ...FINAL_REF, eventId: 'fixture-v2:event:final-2' };
  let state = createMemoryState();
  const grantA = grant(state, NPCS.listener, FINAL_REF); state = grantA.state;
  const grantB = grant(state, NPCS.listener, refB, { grantId: 'fixture-v2:grant:listener:other-event' }); state = grantB.state;
  const intentA = finalIntent(NPCS.listener, grantA.grantToken);
  state = commitKnowledge(state, intentA).state;
  const intentB = finalIntent(NPCS.listener, grantB.grantToken, { sourceRef: refB, receiptId: 'fixture-v2:receipt:final-b' });
  intentB.source = { ...intentA.source, sourceRef: FINAL_REF };
  const attack = commitKnowledge(state, intentB);
  assert.equal(attack.status, 'DENIED');
  assert.equal(attack.state.effects.length, 1);
  assert.equal(relationshipValue(attack.state, NPCS.listener, ACTORS.winner, 'sympathy'), 1);
});

test('getter-backed sourceRef is rejected before its values can change between validation steps', () => {
  const refB = { ...FINAL_REF, eventId: 'fixture-v2:event:final-getter' };
  let state = createMemoryState();
  const grantA = grant(state, NPCS.listener, FINAL_REF); state = grantA.state;
  const grantB = grant(state, NPCS.listener, refB, { grantId: 'fixture-v2:grant:listener:getter' }); state = grantB.state;
  state = commitKnowledge(state, finalIntent(NPCS.listener, grantA.grantToken)).state;
  const intentB = finalIntent(NPCS.listener, grantB.grantToken, { sourceRef: refB, receiptId: 'fixture-v2:receipt:getter' });
  let reads = 0;
  Object.defineProperty(intentB, 'sourceRef', { enumerable: true, configurable: true,
    get() { reads += 1; return reads === 7 ? FINAL_REF : refB; } });
  const denied = commitKnowledge(state, intentB);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.reason, 'INVALID_INTENT_DATA');
  assert.equal(reads, 0);
  assert.equal(denied.state.effects.length, 1);
  assert.equal(relationshipValue(denied.state, NPCS.listener, ACTORS.winner, 'sympathy'), 1);
});

test('grant IDs cannot be reused across NPCs or source events', () => {
  const state = createMemoryState();
  const first = grant(state, NPCS.listener, FINAL_REF, { grantId: 'fixture-v2:grant:shared-id' });
  assert.throws(() => grant(first.state, NPCS.pragmatic, FINAL_REF, { grantId: 'fixture-v2:grant:shared-id' }), /DUPLICATE_GRANT_ID/);
});

test('a policy with extra unrecognized fields cannot apply an unrestorable effect', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.pragmatic); state = issued.state;
  const intent = finalIntent(NPCS.pragmatic, issued.grantToken);
  const body = { ...intent.effectAuthorization, extra: 'fixture-v2:unexpected' };
  delete body.proof;
  intent.effectAuthorization = { ...body, proof: fixtureSeal('08a-effect-policy/v2', SOURCE_ISSUERS.effect, body) };
  const attempted = commitKnowledge(state, intent);
  assert.equal(attempted.status, 'RECORDED_NO_EFFECT');
  assert.equal(attempted.state.effects.length, 0);
  assert.equal(attempted.state.relationships.length, 0);
});

test('a HEARD_CLAIM missing its receipt returns DENIED instead of throwing', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const intent = claimIntent(NPCS.listener, issued.grantToken);
  intent.receipt = null;
  const denied = commitKnowledge(state, intent);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.state.knowledge.length, 0);
});

test('a claim cannot carry an unbound source proof that changes its replay signature', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const intent = claimIntent(NPCS.listener, issued.grantToken);
  intent.source = { proof: 'unbound-content' };
  const denied = commitKnowledge(state, intent);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.reason, 'UNEXPECTED_SOURCE_FOR_CLAIM');
  assert.equal(denied.state.knowledge.length, 0);
});

test('source references reject extra fields and sparse arrays fail canonicalization', () => {
  const sparse = new Array(1);
  assert.throws(() => stableJson(sparse), /NON_DENSE_ARRAY/);
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const malformed = finalIntent(NPCS.listener, issued.grantToken);
  malformed.sourceRef.extensions = new Array(1);
  const denied = commitKnowledge(state, malformed);
  assert.equal(denied.status, 'DENIED');
  assert.equal(denied.state.knowledge.length, 0);
});

test('same receipt ID with changed immutable claim payload is quarantined, not overwritten', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const first = claimIntent(NPCS.listener, issued.grantToken, { receiptId: 'fixture-v2:receipt:reused' });
  state = commitKnowledge(state, first).state;
  const changed = claimIntent(NPCS.listener, issued.grantToken, {
    receiptId: 'fixture-v2:receipt:reused', claimCode: 'fixture-v2:claim:changed',
  });
  const conflict = commitKnowledge(state, changed);
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.reason, 'RECEIPT_ID_REUSE');
  assert.equal(conflict.state.knowledge.length, 1);
  assert.equal(conflict.state.knowledge[0].signature, state.knowledge[0].signature);
});

test('a changed final payload for the same source origin is quarantined', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.listener); state = issued.state;
  const first = finalIntent(NPCS.listener, issued.grantToken, { receiptId: 'fixture-v2:receipt:final-a' });
  state = commitKnowledge(state, first).state;
  const altered = finalIntent(NPCS.listener, issued.grantToken, {
    receiptId: 'fixture-v2:receipt:final-b', loserId: 'fixture-v2:actor:other-loser',
  });
  const conflict = commitKnowledge(state, altered);
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.reason, 'IMMUTABLE_SOURCE_SIGNATURE_MISMATCH');
  assert.equal(conflict.state.effects.length, 1);
  assert.equal(relationshipValue(conflict.state, NPCS.listener, ACTORS.winner, 'sympathy'), 1);
});

test('effect policy for an applied source is immutable', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.pragmatic); state = issued.state;
  state = commitKnowledge(state, finalIntent(NPCS.pragmatic, issued.grantToken)).state;
  const sourceOrigin = sourceOriginKey(FINAL_REF);
  const alteredPolicy = effectPolicy({ npcId: NPCS.pragmatic, sourceOrigin, actorId: ACTORS.winner, axis: 'fear', delta: 1 });
  const changed = finalIntent(NPCS.pragmatic, issued.grantToken, {
    receiptId: 'fixture-v2:receipt:alternate',
    effect: { actorId: ACTORS.winner, axis: 'fear', delta: 1 },
    effectOverrides: { proof: alteredPolicy.proof },
  });
  const conflict = commitKnowledge(state, changed);
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.reason, 'IMMUTABLE_EFFECT_SIGNATURE_MISMATCH');
  assert.equal(conflict.state.effects.length, 1);
  assert.equal(relationshipValue(conflict.state, NPCS.pragmatic, ACTORS.winner, 'respect'), 1);
  assert.equal(relationshipValue(conflict.state, NPCS.pragmatic, ACTORS.winner, 'fear'), 0);
});

test('an exact receipt replay cannot conceal a changed effect policy', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.pragmatic); state = issued.state;
  const first = finalIntent(NPCS.pragmatic, issued.grantToken, { receiptId: 'fixture-v2:receipt:policy-replay' });
  state = commitKnowledge(state, first).state;
  const changedPolicy = finalIntent(NPCS.pragmatic, issued.grantToken, {
    receiptId: 'fixture-v2:receipt:policy-replay',
    effect: { actorId: ACTORS.winner, axis: 'fear', delta: 1 },
  });
  const conflict = commitKnowledge(state, changedPolicy);
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.reason, 'IMMUTABLE_EFFECT_SIGNATURE_MISMATCH');
  assert.equal(conflict.state.effects.length, 1);
  assert.equal(relationshipValue(conflict.state, NPCS.pragmatic, ACTORS.winner, 'respect'), 1);
  assert.equal(relationshipValue(conflict.state, NPCS.pragmatic, ACTORS.winner, 'fear'), 0);
});

test('an exact receipt replay rejects a corrupted effect proof', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.pragmatic); state = issued.state;
  const intent = finalIntent(NPCS.pragmatic, issued.grantToken, { receiptId: 'fixture-v2:receipt:bad-policy-proof' });
  state = commitKnowledge(state, intent).state;
  const corrupted = structuredClone(intent);
  corrupted.effectAuthorization.proof = 'fixture-only:wrong-proof';
  const replay = commitKnowledge(state, corrupted);
  assert.equal(replay.status, 'CONFLICT_QUARANTINE');
  assert.equal(replay.reason, 'IMMUTABLE_EFFECT_SIGNATURE_MISMATCH');
  assert.equal(replay.state.effects.length, 1);
});

test('a new receipt cannot append provenance while carrying a conflicting effect proof', () => {
  let state = createMemoryState();
  const issued = grant(state, NPCS.pragmatic); state = issued.state;
  const first = finalIntent(NPCS.pragmatic, issued.grantToken, { receiptId: 'fixture-v2:receipt:policy-proof-first' });
  state = commitKnowledge(state, first).state;
  const changed = finalIntent(NPCS.pragmatic, issued.grantToken, { receiptId: 'fixture-v2:receipt:policy-proof-new' });
  changed.effectAuthorization.proof = 'fixture-only:wrong-proof';
  const conflict = commitKnowledge(state, changed);
  assert.equal(conflict.status, 'CONFLICT_QUARANTINE');
  assert.equal(conflict.reason, 'IMMUTABLE_EFFECT_SIGNATURE_MISMATCH');
  assert.equal(conflict.state.knowledge[0].receipts.length, 1);
  assert.equal(conflict.state.effects.length, 1);
});
