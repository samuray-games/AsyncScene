import test from 'node:test';
import assert from 'node:assert/strict';
import { NPCS, FINAL_REF, finalGrant, rumorGrant, profile } from '../fixtures.mjs';
import { emptySnapshot } from '../snapshot-store.mjs';
import { applyAuthorizedKnowledge } from '../memory-model.mjs';

test('M02: absent NPC never learns from public feed or client claimed presence', () => {
  const before = emptySnapshot();
  const mockPublicFeed = { eventId: FINAL_REF.eventId, wasThere: true };
  const absentResult = applyAuthorizedKnowledge(before, null, profile('compassion', NPCS.absent));
  assert.equal(absentResult.outcome, 'DENIED');
  assert.equal(absentResult.reason, 'NO_AUTHORIZED_KNOWLEDGE');
  assert.deepEqual(absentResult.state, before);
  assert.deepEqual(absentResult.state.memories, {});
  assert.deepEqual(absentResult.state.relationships, {});
  assert.deepEqual(absentResult.state.appliedEffects, {});
  assert.ok(mockPublicFeed.wasThere); // not a valid 07B grant, must stay irrelevant
  const forged = finalGrant(NPCS.absent, 'fixture-08a:receipt:forged', { knowledgeStatus: 'UNKNOWN' });
  assert.equal(applyAuthorizedKnowledge(before, forged, profile('compassion', NPCS.absent)).outcome, 'DENIED');
});

test('M03: relayed rumor stays an unverified claim even after repetition', () => {
  const targetProfile = profile('compassion', NPCS.listener);
  const first = applyAuthorizedKnowledge(emptySnapshot(), rumorGrant(NPCS.listener), targetProfile);
  assert.equal(first.outcome, 'REMEMBERED_WITHOUT_EFFECT');
  assert.equal(first.state.memories[NPCS.listener][0].factKind, 'unverified_relay');
  assert.equal(first.state.memories[NPCS.listener][0].sources[0].sourceKind, 'permitted_public_relay');
  const second = applyAuthorizedKnowledge(first.state, rumorGrant(NPCS.listener, 'fixture-08a:receipt:relay-2'), targetProfile);
  assert.equal(second.outcome, 'REMEMBERED_WITHOUT_EFFECT');
  assert.equal(second.state.memories[NPCS.listener].length, 1);
  assert.equal(second.state.memories[NPCS.listener][0].sources.length, 2);
  assert.equal(second.state.memories[NPCS.listener][0].factKind, 'unverified_relay');
  assert.deepEqual(second.state.relationships, {});
  assert.deepEqual(second.state.appliedEffects, {});
});

test('M02: unapproved fields cannot be persisted by the fixture model', () => {
  const before = emptySnapshot();
  const contaminated = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:contaminated', {
    authorizedFields: {
      finality: 'finalized',
      mechanicalWinnerId: 'fixture-08a:actor:vera',
      mechanicalLoserId: 'fixture-08a:actor:gosha',
      allowedSummaryKey: 'fixture-08a:summary:mechanical-outcome',
      hiddenTactic: 'not-allowed',
    },
  });
  const result = applyAuthorizedKnowledge(before, contaminated, profile('pragmatic'));
  assert.equal(result.outcome, 'DENIED');
  assert.equal(result.reason, 'UNEXPECTED_FACT_FIELD');
  assert.deepEqual(result.state, before);
});

test('M06: pending, missing finality and conflicting terminal versions never reward a supposed result', () => {
  const p = profile('pragmatic');
  const pending = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:pending', {
    sourceRef: { sourceSystem: 'fixture-08a:gameplay', eventId: 'fixture-08a:pending-1', sourceEventVersion: 'fixture-08a:version:pending' },
    authorizedFields: { finality: 'PENDING', mechanicalWinnerId: 'fixture-08a:actor:vera', mechanicalLoserId: 'fixture-08a:actor:gosha', allowedSummaryKey: 'fixture-08a:summary:pending' },
  });
  const before = emptySnapshot();
  const invalid = applyAuthorizedKnowledge(before, pending, p);
  assert.equal(invalid.outcome, 'DENIED');
  assert.equal(invalid.reason, 'NO_VERIFIED_OUTCOME');
  assert.deepEqual(invalid.state, before);
  const missingId = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:missing', { stableActorId: null });
  assert.equal(applyAuthorizedKnowledge(before, missingId, p).outcome, 'DENIED');
  const valid = applyAuthorizedKnowledge(before, finalGrant(NPCS.pragmatic), p);
  assert.equal(valid.outcome, 'APPLIED');
  const conflictingVersion = finalGrant(NPCS.pragmatic, 'fixture-08a:receipt:conflict', {
    sourceRef: { ...FINAL_REF, sourceEventVersion: 'fixture-08a:version:conflict' },
  });
  const rejected = applyAuthorizedKnowledge(valid.state, conflictingVersion, p);
  assert.equal(rejected.outcome, 'REJECT_CONFLICT');
  assert.deepEqual(rejected.state, valid.state);
});
