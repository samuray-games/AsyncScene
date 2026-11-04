import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCEPTANCE_BOUNDARY, ACTORS, FIXTURE_IDS, REQUIRED_GROUPS, SCENARIOS } from '../scenarios.mjs';

const expectedIds = Array.from({ length: 24 }, (_, index) => `DM-${String(index + 1).padStart(2, '0')}`);

test('catalog contains exactly the 24 approved DM scenarios in stable order', () => {
  assert.deepEqual(SCENARIOS.map(({ id }) => id), expectedIds);
  assert.equal(new Set(SCENARIOS.map(({ id }) => id)).size, 24);
});

test('actors and fixture identifiers are synthetic and stable', () => {
  assert.deepEqual(Object.keys(ACTORS).sort(), ['A', 'B', 'C']);
  assert.deepEqual(Object.values(ACTORS).map(({ actorId }) => actorId), ['actor_A', 'actor_B', 'actor_C']);
  assert.deepEqual(Object.values(ACTORS).map(({ sessionId }) => sessionId), ['session_A', 'session_B', 'session_C']);
  assert.equal(FIXTURE_IDS.conversationAB, 'conv_AB');
  assert.equal(FIXTURE_IDS.privateMessageAB, 'msg_AB_01');
  assert.match(FIXTURE_IDS.privateSentinel, /^PRIVATE_AB_SENTINEL_/);
  assert.match(FIXTURE_IDS.publicMessageA, /^msg_PUBLIC_/);
});

test('every scenario is an executable specification with an explicit blocked server gate', () => {
  for (const scenario of SCENARIOS) {
    assert.ok(scenario.action.length > 0, `${scenario.id} action`);
    assert.ok(scenario.expectedAssertions.length > 0, `${scenario.id} expectations`);
    assert.ok(scenario.failWhen.length > 0, `${scenario.id} failure conditions`);
    assert.ok(scenario.actors.every((actor) => Object.hasOwn(ACTORS, actor)), `${scenario.id} actors`);
    assert.equal(scenario.executionStatus, 'BLOCKED_NOT_EXECUTABLE', `${scenario.id} must not imply runtime execution`);
  }
});

test('scenario catalog covers the required privacy and delivery categories', () => {
  const groups = new Set(SCENARIOS.map(({ group }) => group));
  for (const group of REQUIRED_GROUPS) assert.ok(groups.has(group), `missing group ${group}`);
});

test('catalog boundary explicitly disclaims adapter, runtime, and end-to-end acceptance', () => {
  assert.equal(ACCEPTANCE_BOUNDARY.adapterPresent, false);
  assert.equal(ACCEPTANCE_BOUNDARY.serverExecutable, false);
  assert.equal(ACCEPTANCE_BOUNDARY.runtimePassClaimed, false);
  assert.equal(ACCEPTANCE_BOUNDARY.missingAdapterStatus, 'BLOCKED_NOT_EXECUTABLE');
  assert.match(ACCEPTANCE_BOUNDARY.isolatedFixturePassMeans, /nothing about a real server/);
});

test('DM-23 preserves the approved visual distinction and channel boundary', () => {
  const scenario = SCENARIOS.find(({ id }) => id === 'DM-23');
  assert.ok(scenario.expectedAssertions.some((value) => /blue frame and envelope icon/.test(value)));
  assert.ok(scenario.failWhen.some((value) => /missing blue frame/.test(value)));
  assert.ok(scenario.failWhen.some((value) => /missing envelope icon/.test(value)));
});
