import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateJudge, evaluateRoster, toPublicResult, serializeClosedResult, restoreClosedResult,
  canonicalJson, tieBreakForTest, JudgeInputError,
} from './judge.mjs';
import { FIXTURE_INPUT, GOLDEN_JUDGES, TIE_VECTOR_INPUT, makeTieJudge, withA1ClaimStatus } from './fixtures.mjs';
import * as JudgeModule from './judge.mjs';

const expected = [
  { judgeId: 'judge_01', a: 17, b: -16, winner: 'participant_A' },
  { judgeId: 'judge_02', a: -16, b: 17, winner: 'participant_B' },
  { judgeId: 'judge_03', a: 3, b: 0, winner: 'participant_A' },
];
const goldenResults = () => GOLDEN_JUDGES.map(snapshot => evaluateJudge(FIXTURE_INPUT, snapshot));

test('three golden judges produce exact score totals and winners', () => {
  assert.equal(Object.isFrozen(FIXTURE_INPUT.lines[0].claims[0]), true);
  assert.equal(Object.isFrozen(GOLDEN_JUDGES[0].relationships.A), true);
  assert.deepEqual(goldenResults().map(result => ({ judgeId: result.judgeId, a: result.scores.participant_A, b: result.scores.participant_B, winner: result.winnerId })), expected);
});

test('100 repeated evaluations preserve votes, scores, explanations, and hashes', () => {
  const first = goldenResults();
  const firstPublic = first.map(toPublicResult);
  for (let i = 0; i < 100; i += 1) {
    assert.deepEqual(goldenResults(), first);
    assert.deepEqual(goldenResults().map(toPublicResult), firstPublic);
  }
});

test('serialization and restoration preserve the closed result', () => {
  for (const result of goldenResults()) {
    const restored = restoreClosedResult(serializeClosedResult(result));
    assert.deepEqual(restored, result);
    assert.deepEqual(toPublicResult(restored), toPublicResult(result));
    assert.equal(Object.isFrozen(restored), true);
  }
});

test('tampered serialized closures and non-public reason codes are rejected', () => {
  const result = goldenResults()[0];
  const tampered = JSON.parse(serializeClosedResult(result));
  tampered.winnerId = 'participant_B';
  assert.throws(() => restoreClosedResult(JSON.stringify(tampered)), error => error.code === 'INVALID_SERIALIZED_RESULT');
  const leakedReason = structuredClone(result);
  leakedReason.publicReasonCodes = ['FROZEN_RELATIONSHIP_DECISIVE'];
  assert.throws(() => toPublicResult(leakedReason), error => error.code === 'INVALID_PUBLIC_REASON');
});

test('judge permutation does not change any judge vote', () => {
  const normal = new Map(goldenResults().map(result => [result.judgeId, result.winnerId]));
  const reversed = [...GOLDEN_JUDGES].reverse().map(snapshot => evaluateJudge(FIXTURE_INPUT, snapshot));
  assert.deepEqual(new Map(reversed.map(result => [result.judgeId, result.winnerId])), normal);
});

test('roster rejects invalid NPC without a vote and reports insufficient valid roster', () => {
  const invalid = structuredClone(GOLDEN_JUDGES[0]);
  invalid.profile.aggressionCalm = 9;
  const roster = evaluateRoster(FIXTURE_INPUT, [invalid, GOLDEN_JUDGES[1], GOLDEN_JUDGES[2]], { minimum: 2 });
  assert.equal(roster.votes.length, 2);
  assert.equal(roster.rejected[0].code, 'INVALID_INTEGER');
  assert.ok(!roster.votes.some(vote => vote.judgeId === 'judge_01'));
  assert.throws(() => evaluateRoster(FIXTURE_INPUT, [invalid], { minimum: 1 }), error => error instanceof JudgeInputError && error.code === 'INSUFFICIENT_JUDGE_ROSTER');
});

test('tie SHA-256 vector and input-order invariance match the contract', () => {
  const snapshot = makeTieJudge();
  const result = evaluateJudge(TIE_VECTOR_INPUT, snapshot);
  assert.equal(result.tieBreak.digest, '72b3afbcfaaed5e39ad70ab4f436d586d18e4b82a682b477c68161fea919f5af');
  assert.equal(result.winnerId, 'participant_A');
  const reordered = { ...TIE_VECTOR_INPUT, participantIds: [...TIE_VECTOR_INPUT.participantIds].reverse() };
  reordered.lines = TIE_VECTOR_INPUT.lines.map(line => ({ ...line, speakerId: line.speakerId === 'participant_A' ? 'participant_B' : 'participant_A' }));
  const remappedSnapshot = { ...snapshot, relationships: { A: { ...snapshot.relationships.A, participantId: 'participant_B' }, B: { ...snapshot.relationships.B, participantId: 'participant_A' } } };
  const remapped = evaluateJudge(reordered, remappedSnapshot);
  assert.equal(remapped.tieBreak.digest, result.tieBreak.digest);
  assert.equal(remapped.winnerId, 'participant_A');
  assert.equal(canonicalJson({ b: 2, a: 1 }), canonicalJson({ a: 1, b: 2 }));
});

test('confirmed known facts permit positive contribution', () => {
  const result = evaluateJudge(FIXTURE_INPUT, GOLDEN_JUDGES[0]);
  assert.equal(result.lineScores[0].factualStylePoints, 4);
});

test('unknown claim yields zero positive support without applying a falsehood penalty', () => {
  const input = withA1ClaimStatus('unknown');
  const result = evaluateJudge(input, GOLDEN_JUDGES[0]);
  assert.equal(result.lineScores[0].factualStylePoints, 0);
  assert.equal(result.scores.participant_A, 13);
});

test('refuted claim yields zero positive support and no extra penalty', () => {
  const input = withA1ClaimStatus('refuted');
  const result = evaluateJudge(input, GOLDEN_JUDGES[0]);
  assert.equal(result.lineScores[0].factualStylePoints, 0);
  assert.equal(result.scores.participant_A, 13);
});

test('mixed claim counts only its confirmed portion', () => {
  const input = withA1ClaimStatus('mixed', 1);
  const result = evaluateJudge(input, GOLDEN_JUDGES[0]);
  assert.equal(result.lineScores[0].factualStylePoints, 2);
  assert.equal(result.scores.participant_A, 15);
});

test('judge knowledge must be available by snapshot time', () => {
  const snapshot = structuredClone(GOLDEN_JUDGES[0]);
  snapshot.knownFacts[0].availableAt = '2026-01-03T00:00:00.000Z';
  assert.throws(() => evaluateJudge(FIXTURE_INPUT, snapshot), error => error.code === 'FUTURE_KNOWLEDGE');
});

test('hidden relationship can change winner without leaking relationship or knowledge publicly', () => {
  const neutralSnapshot = makeTieJudge();
  const baseline = evaluateJudge(TIE_VECTOR_INPUT, neutralSnapshot);
  const snapshot = structuredClone(neutralSnapshot);
  snapshot.relationships.B.sympathy = 2;
  const result = evaluateJudge(TIE_VECTOR_INPUT, snapshot);
  assert.equal(baseline.winnerId, 'participant_A');
  assert.equal(result.winnerId, 'participant_B');
  const publicResult = toPublicResult(result);
  const serialized = JSON.stringify(publicResult);
  for (const forbidden of ['resentment', 'sympathy', 'fear', 'knownFacts', 'claim_A1', 'synthetic_fixture', 'fullInputHash', 'relationshipScores', 'FROZEN_RELATIONSHIP']) assert.equal(serialized.includes(forbidden), false, forbidden);
  assert.equal(publicResult.explanation, 'Судья поддержал участника participant_B.');
  assert.deepEqual(publicResult.reasonCodes, ['JUDGE_SUPPORTED_PARTICIPANT']);
});

test('profile changes after closure do not recalculate the prior result', () => {
  const before = evaluateJudge(FIXTURE_INPUT, GOLDEN_JUDGES[2]);
  const changed = structuredClone(GOLDEN_JUDGES[2]);
  changed.profile.aggressionCalm = -2;
  changed.profileVersion = 2;
  changed.profile.profileVersion = 2;
  assert.notDeepEqual(evaluateJudge(FIXTURE_INPUT, changed), before);
  assert.deepEqual(restoreClosedResult(serializeClosedResult(before)), before);
});

test('missing, malformed, and unsupported inputs fail closed without a vote', () => {
  const missing = structuredClone(FIXTURE_INPUT);
  delete missing.voteId;
  assert.throws(() => evaluateJudge(missing, GOLDEN_JUDGES[0]), error => error.code === 'MISSING_FIELD');
  const unsupported = { ...FIXTURE_INPUT, algorithmVersion: 'other' };
  assert.throws(() => evaluateJudge(unsupported, GOLDEN_JUDGES[0]), error => error.code === 'UNSUPPORTED_ALGORITHM');
  const malformed = structuredClone(FIXTURE_INPUT);
  malformed.lines.pop();
  assert.throws(() => evaluateJudge(malformed, GOLDEN_JUDGES[0]), error => error.code === 'INVALID_LINES');
  const malformedUnicode = { ...FIXTURE_INPUT, voteId: '\ud800' };
  assert.throws(() => evaluateJudge(malformedUnicode, GOLDEN_JUDGES[0]), error => error.code === 'INVALID_STRING');
  const malformedParticipant = structuredClone(TIE_VECTOR_INPUT);
  malformedParticipant.participantIds[0] = '\ud800';
  assert.throws(() => evaluateJudge(malformedParticipant, makeTieJudge()), error => error.code === 'INVALID_STRING');
});

test('unknown fields are rejected across every object included in fullInputHash', () => {
  const cases = [
    ['input', (input) => { input.unrecognized = true; }],
    ['snapshot', (_input, snapshot) => { snapshot.unrecognized = true; }],
    ['profile', (_input, snapshot) => { snapshot.profile.unrecognized = true; }],
    ['relationships', (_input, snapshot) => { snapshot.relationships.unrecognized = true; }],
    ['relationship', (_input, snapshot) => { snapshot.relationships.A.unrecognized = true; }],
    ['line', (input) => { input.lines[0].unrecognized = true; }],
    ['claim', (input) => { input.lines[0].claims[0].unrecognized = true; }],
    ['known fact', (_input, snapshot) => { snapshot.knownFacts[0].unrecognized = true; }],
  ];
  for (const [path, addUnknownField] of cases) {
    const input = structuredClone(FIXTURE_INPUT);
    const snapshot = structuredClone(GOLDEN_JUDGES[0]);
    addUnknownField(input, snapshot);
    assert.throws(
      () => evaluateJudge(input, snapshot),
      error => error instanceof JudgeInputError && error.code === 'UNEXPECTED_FIELD',
      `expected unknown field in ${path} to be rejected`,
    );
  }
});

test('fullInputHash schema rejects hidden, symbol, accessor, and inherited properties', () => {
  const hiddenField = structuredClone(FIXTURE_INPUT);
  Object.defineProperty(hiddenField, 'unrecognized', { value: true });
  assert.throws(() => evaluateJudge(hiddenField, GOLDEN_JUDGES[0]), error => error.code === 'UNEXPECTED_FIELD');

  const symbolField = structuredClone(FIXTURE_INPUT);
  symbolField[Symbol('unrecognized')] = true;
  assert.throws(() => evaluateJudge(symbolField, GOLDEN_JUDGES[0]), error => error.code === 'UNEXPECTED_FIELD');

  const hiddenContractField = structuredClone(FIXTURE_INPUT);
  Object.defineProperty(hiddenContractField, 'voteId', { value: FIXTURE_INPUT.voteId, enumerable: false });
  assert.throws(() => evaluateJudge(hiddenContractField, GOLDEN_JUDGES[0]), error => error.code === 'INVALID_FIELD_DESCRIPTOR');

  const accessorField = structuredClone(FIXTURE_INPUT);
  Object.defineProperty(accessorField, 'voteId', { get: () => FIXTURE_INPUT.voteId, enumerable: true });
  assert.throws(() => evaluateJudge(accessorField, GOLDEN_JUDGES[0]), error => error.code === 'INVALID_FIELD_DESCRIPTOR');

  const inheritedField = Object.assign(Object.create({ unrecognized: true }), structuredClone(FIXTURE_INPUT));
  assert.throws(() => evaluateJudge(inheritedField, GOLDEN_JUDGES[0]), error => error.code === 'INVALID_OBJECT');
});

test('public projection excludes internal scores, private hashes, and internal reason codes', () => {
  const publicResult = toPublicResult(goldenResults()[0]);
  for (const field of ['scores', 'lineScores', 'relationshipScores', 'internalReasonCodes', 'fullInputHash', 'digest']) assert.equal(Object.hasOwn(publicResult, field), false);
  assert.equal(Object.hasOwn(publicResult, 'publicReasonCodes'), false);
});

test('module has no API that can mutate or replace human votes', () => {
  const exports = Object.keys(JudgeModule);
  assert.deepEqual(exports.sort(), ['ALGORITHM_VERSION', 'JudgeInputError', 'canonicalJson', 'evaluateJudge', 'evaluateRoster', 'restoreClosedResult', 'serializeClosedResult', 'tieBreakForTest', 'toPublicResult'].sort());
  assert.equal(exports.some(name => /human|persist|replace|override/i.test(name)), false);
});

test('positive factsEmotions is capped by trusted support and negative style remains negative', () => {
  const input = structuredClone(FIXTURE_INPUT);
  input.lines[0].factsEmotions = 1;
  const result = evaluateJudge(input, GOLDEN_JUDGES[0]);
  assert.equal(result.lineScores[0].factualStylePoints, 2);
  assert.equal(result.lineScores[1].factualStylePoints, -2);
});
