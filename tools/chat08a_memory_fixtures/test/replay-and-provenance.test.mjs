import test from 'node:test';
import assert from 'node:assert/strict';
import { NPCS, FINAL_REF, finalGrant, rumorGrant, profile } from '../fixtures.mjs';
import { emptySnapshot, serializeSnapshot, rehydrateSnapshot } from '../snapshot-store.mjs';
import { applyAuthorizedKnowledge } from '../memory-model.mjs';

test('snapshot validation rejects malformed nested memory and preserves valid restoration', () => {
  const valid = applyAuthorizedKnowledge(emptySnapshot(), finalGrant(NPCS.pragmatic), profile('pragmatic')).state;
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(valid)), valid);
  const invalidSnapshots = [
    { ...emptySnapshot(), memories: { [NPCS.pragmatic]: {} } },
    { ...emptySnapshot(), memories: { [NPCS.pragmatic]: [{ originKey: 'fixture-08a:origin' }] } },
    { ...emptySnapshot(), memories: { [NPCS.pragmatic]: [{
      originKey: 'fixture-08a:origin', sourceRef: { sourceSystem: 'fixture-08a:sys', eventId: 'fixture-08a:event', sourceEventVersion: 'fixture-08a:v' },
      factKind: 'verified_outcome', stableActorId: 'fixture-08a:actor', authorizedFields: { finality: 'finalized' },
      sources: [{ sourceKind: 'direct', sourceReceiptId: 'fixture-08a:r', learnedAtServer: 'bad-date', visibilityPolicyVersion: 'fixture-08a:policy' }],
    }] } },
    { ...emptySnapshot(), relationships: { [NPCS.pragmatic]: { 'fixture-08a:actor': { respect: 'UP' } } } },
    { ...emptySnapshot(), appliedEffects: { 'fixture-08a:key': { npcId: NPCS.pragmatic } } },
    { ...emptySnapshot(), originSignatures: { 'fixture-08a:key': 42 } },
    { ...emptySnapshot(), relationships: undefined },
  ];
  for (const malformed of invalidSnapshots) assert.throws(() => rehydrateSnapshot(malformed), { name: 'TypeError', message: 'invalid synthetic snapshot' });
});

test('snapshot rejects array containers, duplicate origins and inconsistent effect ledgers atomically', () => {
  const applied = applyAuthorizedKnowledge(emptySnapshot(), finalGrant(NPCS.pragmatic), profile('pragmatic'));
  assert.equal(applied.outcome, 'APPLIED');
  const valid = applied.state;
  for (const name of ['memories', 'relationships', 'appliedEffects', 'originSignatures']) {
    const malformed = structuredClone(valid);
    malformed[name] = [];
    assert.throws(() => rehydrateSnapshot(malformed), { message: 'invalid synthetic snapshot' });
    assert.deepEqual(valid, applied.state);
  }
  const duplicate = structuredClone(valid);
  duplicate.memories[NPCS.pragmatic].push(structuredClone(duplicate.memories[NPCS.pragmatic][0]));
  assert.throws(() => rehydrateSnapshot(duplicate), { message: 'invalid synthetic snapshot' });
  const substituted = structuredClone(valid);
  const effect = Object.values(substituted.appliedEffects)[0];
  effect.targetActorId = 'fixture-08a:actor:gosha';
  assert.throws(() => rehydrateSnapshot(substituted), { message: 'invalid synthetic snapshot' });
  const fabricatedRelationship = emptySnapshot();
  fabricatedRelationship.relationships[NPCS.pragmatic] = {
    'fixture-08a:actor:vera': { respect: 'UP', sympathy: 'UNCHANGED', resentment: 'UNCHANGED', fear: 'UNCHANGED' },
  };
  assert.throws(() => rehydrateSnapshot(fabricatedRelationship), { message: 'invalid synthetic snapshot' });
  const restored = rehydrateSnapshot(serializeSnapshot(valid));
  assert.equal(applyAuthorizedKnowledge(restored, finalGrant(NPCS.pragmatic), profile('pragmatic')).outcome, 'ALREADY_APPLIED');
});

test('unknown sourceRef fields are denied and never enter memory or serialized snapshots', () => {
  const grant = finalGrant(NPCS.pragmatic);
  grant.sourceRef.privateInternal = 'secret fixture data';
  const initial = emptySnapshot();
  const denied = applyAuthorizedKnowledge(initial, grant, profile('pragmatic'));
  assert.equal(denied.outcome, 'DENIED');
  assert.deepEqual(denied.state, initial);
  assert.equal(JSON.stringify(serializeSnapshot(initial)).includes('privateInternal'), false);
  delete grant.sourceRef.privateInternal;
  grant.sourceRef.unknown = 'extra';
  assert.equal(applyAuthorizedKnowledge(initial, grant, profile('pragmatic')).outcome, 'DENIED');
});

test('snapshot rejects unknown authorizedFields and tampering for memories without effects', () => {
  const remembered = applyAuthorizedKnowledge(emptySnapshot(), rumorGrant(NPCS.listener), profile('compassion', NPCS.listener));
  assert.equal(remembered.outcome, 'REMEMBERED_WITHOUT_EFFECT');
  const tampered = structuredClone(remembered.state);
  tampered.memories[NPCS.listener][0].authorizedFields.privateInternal = 'secret';
  assert.throws(() => rehydrateSnapshot(tampered), { message: 'invalid synthetic snapshot' });
  const changed = structuredClone(remembered.state);
  changed.memories[NPCS.listener][0].authorizedFields.claimCode = 'fixture-08a:claim:changed';
  assert.throws(() => rehydrateSnapshot(changed), { message: 'invalid synthetic snapshot' });
  assert.equal(serializeSnapshot(remembered.state).includes('privateInternal'), false);
});

test('M04: duplicates and JSON reload preserve exactly one effect', () => {
  const p = profile('pragmatic');
  const firstGrant = finalGrant(NPCS.pragmatic);
  const first = applyAuthorizedKnowledge(emptySnapshot(), firstGrant, p);
  assert.equal(first.outcome, 'APPLIED');
  const replay = applyAuthorizedKnowledge(first.state, firstGrant, p);
  assert.equal(replay.outcome, 'ALREADY_APPLIED');
  assert.deepEqual(replay.state, first.state);
  const extraReceipt = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:direct-2');
  const extra = applyAuthorizedKnowledge(replay.state, extraReceipt, p);
  assert.equal(extra.outcome, 'ALREADY_APPLIED');
  assert.equal(extra.state.memories[NPCS.pragmatic].length, 1);
  assert.equal(extra.state.memories[NPCS.pragmatic][0].sources.length, 2);
  const restored = rehydrateSnapshot(serializeSnapshot(extra.state));
  const afterReload = applyAuthorizedKnowledge(restored, firstGrant, p);
  assert.equal(afterReload.outcome, 'ALREADY_APPLIED');
  assert.deepEqual(afterReload.state, restored);
  assert.equal(Object.keys(afterReload.state.appliedEffects).length, 1);
  assert.equal(afterReload.state.relationships[NPCS.pragmatic]['fixture-08a:actor:vera'].respect, 'UP');
});

test('replaying one event after profile change never applies another effect, including after reload', () => {
  const id = NPCS.compassion;
  const grant = finalGrant(id);
  const original = applyAuthorizedKnowledge(emptySnapshot(), grant, profile('compassion'));
  assert.equal(original.outcome, 'APPLIED');
  const changedProfile = profile('pragmatic', id);
  const replay = applyAuthorizedKnowledge(original.state, grant, changedProfile);
  assert.equal(replay.outcome, 'ALREADY_APPLIED');
  assert.deepEqual(replay.state, original.state);
  const restored = rehydrateSnapshot(serializeSnapshot(original.state));
  const restoredReplay = applyAuthorizedKnowledge(restored, grant, changedProfile);
  assert.equal(restoredReplay.outcome, 'ALREADY_APPLIED');
  assert.deepEqual(restoredReplay.state, restored);
  const independent = finalGrant(id, 'fixture-08a:receipt:independent', {
    sourceRef: { ...FINAL_REF, eventId: 'fixture-08a:final-independent', sourceEventVersion: 'fixture-08a:version:independent' },
  });
  assert.equal(applyAuthorizedKnowledge(restored, independent, changedProfile).outcome, 'APPLIED');
  assert.equal(Object.keys(restored.appliedEffects).length, 1);
});

test('equivalent authorizedFields key order is accepted while actual provenance conflicts remain rejected', () => {
  const p = profile('pragmatic');
  const firstGrant = finalGrant(NPCS.pragmatic);
  const first = applyAuthorizedKnowledge(emptySnapshot(), firstGrant, p);
  const reordered = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:reordered');
  reordered.authorizedFields = Object.fromEntries(Object.entries(reordered.authorizedFields).reverse());
  assert.equal(applyAuthorizedKnowledge(first.state, reordered, p).outcome, 'ALREADY_APPLIED');
  for (const overrides of [
    { authorizedFields: { ...firstGrant.authorizedFields, allowedSummaryKey: 'fixture-08a:summary:other' } },
    { stableActorId: 'fixture-08a:actor:gosha' },
    { sourceRef: { ...FINAL_REF, sourceEventVersion: 'fixture-08a:version:other' } },
  ]) {
    const conflict = applyAuthorizedKnowledge(first.state, finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:conflict', overrides), p);
    assert.equal(conflict.outcome, 'REJECT_CONFLICT');
    assert.deepEqual(conflict.state, first.state);
  }
});

test('M04: both model delivery orderings converge (not a D1 race test)', () => {
  const p = profile('pragmatic');
  const a = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:direct-a', { learnedAtServer: '2026-11-01T06:00:00.000Z' });
  const b = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:direct-b', { learnedAtServer: '2026-11-01T06:00:00.000Z' });
  function applyOrder(grants) {
    let state = emptySnapshot();
    for (const grant of grants) state = applyAuthorizedKnowledge(state, grant, p).state;
    return state;
  }
  const ab = applyOrder([a, b]);
  const ba = applyOrder([b, a]);
  assert.deepEqual(ab.appliedEffects, ba.appliedEffects);
  assert.deepEqual(ab.relationships, ba.relationships);
  assert.deepEqual(ab.memories[NPCS.pragmatic][0].sources.map((s) => s.sourceReceiptId).sort(),
    ba.memories[NPCS.pragmatic][0].sources.map((s) => s.sourceReceiptId).sort());
  assert.equal(Object.keys(ab.appliedEffects).length, 1);
});

test('M05: direct verified sources and relay claim sources never become interchangeable', () => {
  const directProfile = profile('pragmatic', NPCS.direct);
  const relayProfile = profile('compassion', NPCS.relay);
  const first = applyAuthorizedKnowledge(emptySnapshot(), finalGrant(NPCS.direct, 'fixture-08a:receipt:eyewitness'), directProfile);
  assert.equal(first.outcome, 'APPLIED');
  const heard = applyAuthorizedKnowledge(first.state, rumorGrant(NPCS.relay, 'fixture-08a:receipt:public-relay'), relayProfile);
  assert.equal(heard.outcome, 'REMEMBERED_WITHOUT_EFFECT');
  const extraDirect = applyAuthorizedKnowledge(heard.state, finalGrant(NPCS.direct, 'fixture-08a:receipt:second-direct'), directProfile);
  assert.equal(extraDirect.outcome, 'ALREADY_APPLIED');
  const memories = extraDirect.state.memories;
  assert.equal(memories[NPCS.direct][0].sourceRef.eventId, FINAL_REF.eventId);
  assert.equal(memories[NPCS.direct][0].factKind, 'verified_outcome');
  assert.deepEqual(memories[NPCS.direct][0].sources.map((s) => s.sourceKind), ['direct', 'direct']);
  assert.equal(memories[NPCS.relay][0].factKind, 'unverified_relay');
  assert.deepEqual(memories[NPCS.relay][0].sources.map((s) => s.sourceKind), ['permitted_public_relay']);
  assert.notEqual(memories[NPCS.direct][0].sourceRef.eventId, memories[NPCS.relay][0].sourceRef.eventId);
  assert.deepEqual(extraDirect.state.relationships[NPCS.relay] ?? {}, {});
  assert.equal(Object.keys(extraDirect.state.appliedEffects).length, 1);
  assert.equal(extraDirect.state.memories[NPCS.direct][0].sources.length, 2);
});


test('M04: conflicting stableActorId for the same event is rejected before and after reload', () => {
  const p = profile('pragmatic');
  const originalGrant = finalGrant(NPCS.pragmatic);
  const applied = applyAuthorizedKnowledge(emptySnapshot(), originalGrant, p);
  assert.equal(applied.outcome, 'APPLIED');

  // Both IDs are valid event participants. Only the identity provenance differs.
  const conflictingGrant = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:different-actor', {
    stableActorId: 'fixture-08a:actor:gosha',
  });
  const conflict = applyAuthorizedKnowledge(applied.state, conflictingGrant, p);
  assert.equal(conflict.outcome, 'REJECT_CONFLICT');
  assert.equal(conflict.reason, 'SOURCE_VERSION_OR_PAYLOAD_CONFLICT');
  assert.deepEqual(conflict.state, applied.state);

  const restored = rehydrateSnapshot(serializeSnapshot(applied.state));
  const afterReload = applyAuthorizedKnowledge(restored, conflictingGrant, p);
  assert.equal(afterReload.outcome, 'REJECT_CONFLICT');
  assert.deepEqual(afterReload.state, restored);

  const unchangedReplay = applyAuthorizedKnowledge(restored, originalGrant, p);
  assert.equal(unchangedReplay.outcome, 'ALREADY_APPLIED');
  assert.deepEqual(unchangedReplay.state, restored);
});


test('rehydrate rejects forged receipt kind for verified outcome without mutating the source snapshot', () => {
  const grant = finalGrant(NPCS.pragmatic);
  const original = applyAuthorizedKnowledge(emptySnapshot(), grant, profile('pragmatic')).state;
  const forged = structuredClone(original);
  forged.memories[NPCS.pragmatic][0].sources[0].sourceKind = 'permitted_public_relay';
  const before = structuredClone(forged);
  assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.throws(() => serializeSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.deepEqual(forged, before);
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(original)), original);
  assert.equal(applyAuthorizedKnowledge(original, grant, profile('pragmatic')).outcome, 'ALREADY_APPLIED');
});

test('rehydrate rejects forged direct receipt for an unverified relay', () => {
  const grant = rumorGrant(NPCS.listener);
  const original = applyAuthorizedKnowledge(emptySnapshot(), grant, profile('compassion', NPCS.listener)).state;
  const forged = structuredClone(original);
  forged.memories[NPCS.listener][0].sources[0].sourceKind = 'direct';
  const before = structuredClone(forged);
  assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.throws(() => serializeSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.deepEqual(forged, before);
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(original)), original);
  assert.equal(applyAuthorizedKnowledge(original, grant, profile('compassion', NPCS.listener)).outcome, 'ALREADY_REMEMBERED');
});

test('rehydrate checks source-kind compatibility on every receipt, including the second receipt', () => {
  const p = profile('pragmatic');
  const first = applyAuthorizedKnowledge(emptySnapshot(), finalGrant(NPCS.pragmatic), p);
  const second = applyAuthorizedKnowledge(first.state, finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:second-direct'), p);
  assert.equal(second.outcome, 'ALREADY_APPLIED');
  assert.equal(second.state.memories[NPCS.pragmatic][0].sources.length, 2);
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(second.state)), second.state);
  const forged = structuredClone(second.state);
  forged.memories[NPCS.pragmatic][0].sources[1].sourceKind = 'permitted_public_relay';
  assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(second.state)), second.state);
});

test('valid verified utterances retain both permitted direct and public-relay provenance', () => {
  for (const sourceKind of ['direct', 'permitted_public_relay']) {
    const p = profile('compassion', NPCS.listener);
    const grant = rumorGrant(NPCS.listener, 'fixture-08a:receipt:utterance', { factKind: 'verified_utterance', sourceKind });
    const applied = applyAuthorizedKnowledge(emptySnapshot(), grant, p);
    assert.equal(applied.outcome, 'REMEMBERED_WITHOUT_EFFECT');
    const restored = rehydrateSnapshot(serializeSnapshot(applied.state));
    assert.deepEqual(restored, applied.state);
    assert.equal(restored.memories[NPCS.listener][0].sources[0].sourceKind, sourceKind);
    assert.equal(applyAuthorizedKnowledge(restored, grant, p).outcome, 'ALREADY_REMEMBERED');
  }
});


test('rehydrate rejects two receipts sharing an ID but disagreeing on learnedAtServer', () => {
  const grant = finalGrant(NPCS.pragmatic);
  const valid = applyAuthorizedKnowledge(emptySnapshot(), grant, profile('pragmatic')).state;
  const forged = structuredClone(valid);
  const first = forged.memories[NPCS.pragmatic][0].sources[0];
  forged.memories[NPCS.pragmatic][0].sources.push({
    ...first, learnedAtServer: '2026-11-02T06:00:00.000Z',
  });
  const before = structuredClone(forged);
  assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.throws(() => serializeSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.deepEqual(forged, before);
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(valid)), valid);
  const conflictingGrant = finalGrant(NPCS.pragmatic, grant.sourceReceiptId, {
    learnedAtServer: '2026-11-02T06:00:00.000Z',
  });
  const conflict = applyAuthorizedKnowledge(valid, conflictingGrant, profile('pragmatic'));
  assert.equal(conflict.outcome, 'REJECT_CONFLICT');
  assert.equal(conflict.reason, 'RECEIPT_CONFLICT');
  assert.deepEqual(conflict.state, valid);
});

test('rehydrate rejects duplicate receipt ID with conflicting visibility policy', () => {
  const grant = rumorGrant(NPCS.listener);
  const valid = applyAuthorizedKnowledge(emptySnapshot(), grant, profile('compassion', NPCS.listener)).state;
  const forged = structuredClone(valid);
  const first = forged.memories[NPCS.listener][0].sources[0];
  forged.memories[NPCS.listener][0].sources.push({
    ...first, visibilityPolicyVersion: 'fixture-08a:visibility:v2',
  });
  const before = structuredClone(forged);
  assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.throws(() => serializeSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.deepEqual(forged, before);
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(valid)), valid);
});

test('rehydrate rejects exact duplicate receipt IDs even when all fields agree', () => {
  const valid = applyAuthorizedKnowledge(emptySnapshot(), finalGrant(NPCS.pragmatic), profile('pragmatic')).state;
  const forged = structuredClone(valid);
  const sources = forged.memories[NPCS.pragmatic][0].sources;
  sources.push(structuredClone(sources[0]));
  const before = structuredClone(forged);
  assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.throws(() => serializeSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.deepEqual(forged, before);
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(valid)), valid);
});

test('two distinct valid receipt IDs preserve provenance and a single effect through JSON reload and replay', () => {
  const p = profile('pragmatic');
  const firstGrant = finalGrant(NPCS.pragmatic);
  const secondGrant = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:distinct-secondary');
  const first = applyAuthorizedKnowledge(emptySnapshot(), firstGrant, p);
  const second = applyAuthorizedKnowledge(first.state, secondGrant, p);
  assert.equal(first.outcome, 'APPLIED');
  assert.equal(second.outcome, 'ALREADY_APPLIED');
  const saved = serializeSnapshot(second.state);
  const restored = rehydrateSnapshot(saved);
  assert.deepEqual(restored, second.state);
  const receipts = restored.memories[NPCS.pragmatic][0].sources;
  assert.deepEqual(receipts.map((receipt) => receipt.sourceReceiptId), [firstGrant.sourceReceiptId, secondGrant.sourceReceiptId]);
  assert.equal(Object.keys(restored.appliedEffects).length, 1);
  for (const grant of [firstGrant, secondGrant]) {
    const replay = applyAuthorizedKnowledge(restored, grant, p);
    assert.equal(replay.outcome, 'ALREADY_APPLIED');
    assert.deepEqual(replay.state, restored);
  }
});


test('rehydrate rejects equivalent but noncanonical originKey spelling before replay can duplicate an effect', () => {
  const grant = finalGrant(NPCS.pragmatic);
  const p = profile('pragmatic');
  const valid = applyAuthorizedKnowledge(emptySnapshot(), grant, p).state;
  const canonicalOrigin = valid.memories[NPCS.pragmatic][0].originKey;
  const alternatives = [
    ` ${canonicalOrigin}`,
    canonicalOrigin.replace('[', '[ '),
    canonicalOrigin.replace('f', '\\u0066'),
  ];
  // Replicate an attacker shifting every key consistently; not just an invalid dangling ledger.
  for (const alternative of alternatives) {
    const forged = structuredClone(valid);
    const memory = forged.memories[NPCS.pragmatic][0];
    memory.originKey = alternative;
    const oldKey = JSON.stringify([NPCS.pragmatic, canonicalOrigin]);
    const alteredKey = JSON.stringify([NPCS.pragmatic, alternative]);
    forged.originSignatures[alteredKey] = forged.originSignatures[oldKey];
    delete forged.originSignatures[oldKey];
    forged.appliedEffects[alteredKey] = forged.appliedEffects[oldKey];
    forged.appliedEffects[alteredKey].originKey = alternative;
    delete forged.appliedEffects[oldKey];
    const before = structuredClone(forged);
    assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
    assert.throws(() => serializeSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
    assert.deepEqual(forged, before);
    assert.deepEqual(rehydrateSnapshot(serializeSnapshot(valid)), valid);
    assert.equal(applyAuthorizedKnowledge(valid, grant, p).outcome, 'ALREADY_APPLIED');
  }
});

test('rehydrate rejects a noncanonical originKey for memory without an effect', () => {
  const grant = rumorGrant(NPCS.listener);
  const p = profile('compassion', NPCS.listener);
  const valid = applyAuthorizedKnowledge(emptySnapshot(), grant, p).state;
  const forged = structuredClone(valid);
  const memory = forged.memories[NPCS.listener][0];
  const oldKey = JSON.stringify([NPCS.listener, memory.originKey]);
  memory.originKey = `\n${memory.originKey}`;
  const newKey = JSON.stringify([NPCS.listener, memory.originKey]);
  forged.originSignatures[newKey] = forged.originSignatures[oldKey];
  delete forged.originSignatures[oldKey];
  const before = structuredClone(forged);
  assert.throws(() => rehydrateSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.throws(() => serializeSnapshot(forged), { name: 'TypeError', message: 'invalid synthetic snapshot' });
  assert.deepEqual(forged, before);
  assert.deepEqual(rehydrateSnapshot(serializeSnapshot(valid)), valid);
  assert.equal(applyAuthorizedKnowledge(valid, grant, p).outcome, 'ALREADY_REMEMBERED');
});

test('JSON-equivalent origin signatures remain idempotent after snapshot restore', () => {
  const grant = finalGrant(NPCS.pragmatic);
  const p = profile('pragmatic');
  const applied = applyAuthorizedKnowledge(emptySnapshot(), grant, p);
  const identity = JSON.stringify([NPCS.pragmatic, applied.state.memories[NPCS.pragmatic][0].originKey]);
  const reformatted = structuredClone(applied.state);
  reformatted.originSignatures[identity] = JSON.stringify(JSON.parse(reformatted.originSignatures[identity]), null, 2);

  const restored = rehydrateSnapshot(serializeSnapshot(reformatted));
  const replay = applyAuthorizedKnowledge(restored, grant, p);
  assert.equal(replay.outcome, 'ALREADY_APPLIED');
  assert.deepEqual(restored, applied.state);
  assert.deepEqual(replay.state, restored);
  assert.equal(Object.keys(replay.state.appliedEffects).length, 1);
});

test('receipt property order does not create a conflict after snapshot restore', () => {
  const grant = finalGrant(NPCS.pragmatic);
  const p = profile('pragmatic');
  const applied = applyAuthorizedKnowledge(emptySnapshot(), grant, p);
  const reordered = structuredClone(applied.state);
  const receipt = reordered.memories[NPCS.pragmatic][0].sources[0];
  reordered.memories[NPCS.pragmatic][0].sources[0] = {
    visibilityPolicyVersion: receipt.visibilityPolicyVersion,
    learnedAtServer: receipt.learnedAtServer,
    sourceReceiptId: receipt.sourceReceiptId,
    sourceKind: receipt.sourceKind,
  };

  const restored = rehydrateSnapshot(serializeSnapshot(reordered));
  const replay = applyAuthorizedKnowledge(restored, grant, p);
  assert.equal(replay.outcome, 'ALREADY_APPLIED');
  assert.deepEqual(replay.state, restored);
  assert.equal(Object.keys(replay.state.appliedEffects).length, 1);
});
