import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTORS, NPCS, FINAL_FACTS, EXPECTED_REACTIONS, finalGrant, profile } from '../fixtures.mjs';
import { emptySnapshot } from '../snapshot-store.mjs';
import { applyAuthorizedKnowledge } from '../memory-model.mjs';

test('M01: three profiles give different symbolic reactions to identical authorized facts', () => {
  let state = emptySnapshot();
  const roles = ['compassion', 'pragmatic', 'cautious'];
  const decisions = [];
  for (const role of roles) {
    const npcId = NPCS[role];
    const grant = finalGrant(npcId, `fixture-08a:receipt:${role}`);
    const result = applyAuthorizedKnowledge(state, grant, profile(role));
    assert.equal(result.outcome, 'APPLIED');
    assert.deepEqual(result.decision && {
      actorId: result.decision.actorId, axis: result.decision.axis, direction: result.decision.direction,
    }, EXPECTED_REACTIONS[role]);
    state = result.state;
    decisions.push(result.decision);
    assert.deepEqual(state.memories[npcId][0].authorizedFields, FINAL_FACTS);
    assert.equal(state.memories[npcId][0].sources.length, 1);
    assert.deepEqual(Object.keys(state.relationships[npcId]), [EXPECTED_REACTIONS[role].actorId]);
    const axes = state.relationships[npcId][EXPECTED_REACTIONS[role].actorId];
    assert.deepEqual(axes, {
      respect: role === 'pragmatic' ? 'UP' : 'UNCHANGED',
      sympathy: role === 'compassion' ? 'UP' : 'UNCHANGED',
      resentment: 'UNCHANGED',
      fear: role === 'cautious' ? 'UP' : 'UNCHANGED',
    });
  }
  assert.equal(new Set(decisions.map(({ axis, actorId }) => `${axis}:${actorId}`)).size, roles.length);
  assert.equal(Object.keys(state.appliedEffects).length, roles.length);
  assert.equal(Object.keys(state.memories).length, roles.length);
  assert.equal(ACTORS.winner, FINAL_FACTS.mechanicalWinnerId);
  assert.equal(ACTORS.loser, FINAL_FACTS.mechanicalLoserId);
  assert.equal('REP' in state, false);
  assert.equal('moneyLog' in state, false);
});
