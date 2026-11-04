import { ALGORITHM_VERSION } from './judge.mjs';

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export const FIXTURE_INPUT = deepFreeze({
  voteId: 'vote_judge_fixture_001',
  battleId: 'battle_judge_fixture_001',
  participantIds: ['participant_A', 'participant_B'],
  featureVersion: 1,
  algorithmVersion: ALGORITHM_VERSION,
  lines: [
    { lineId: 'A1', speakerId: 'participant_A', aggression: 2, factsEmotions: 2, humor: -1, claims: [{ claimId: 'claim_A1_fact_01', status: 'confirmed', provenance: 'synthetic_fixture_source_A1', availableAt: '2026-01-01T00:00:00.000Z', supportUnits: 2 }] },
    { lineId: 'B1', speakerId: 'participant_B', aggression: -2, factsEmotions: -1, humor: 2, claims: [] },
    { lineId: 'A2', speakerId: 'participant_A', aggression: 1, factsEmotions: 2, humor: -2, claims: [{ claimId: 'claim_A2_fact_01', status: 'confirmed', provenance: 'synthetic_fixture_source_A2', availableAt: '2026-01-01T00:00:00.000Z', supportUnits: 2 }] },
    { lineId: 'B2', speakerId: 'participant_B', aggression: -1, factsEmotions: -2, humor: 2, claims: [] },
  ],
});

const profile = (judgeId, aggressionCalm, factsEmotions, humorSeriousness) => ({ judgeId, profileVersion: 1, aggressionCalm, factsEmotions, humorSeriousness, fearResponse: 'neutral' });
const neutral = { sympathy: 0, resentment: 0, fear: 0 };
const factKnowledge = [
  { claimId: 'claim_A1_fact_01', provenance: 'synthetic_fixture_source_A1', availableAt: '2026-01-01T00:00:00.000Z' },
  { claimId: 'claim_A2_fact_01', provenance: 'synthetic_fixture_source_A2', availableAt: '2026-01-01T00:00:00.000Z' },
];

export const GOLDEN_JUDGES = deepFreeze([
  { judgeId: 'judge_01', profile: profile('judge_01', 2, 2, -1), profileVersion: 1, seed: 'seed_judge_01', snapshotAt: '2026-01-02T00:00:00.000Z', relationships: { A: { participantId: 'participant_A', ...neutral }, B: { participantId: 'participant_B', ...neutral } }, knownFacts: factKnowledge },
  { judgeId: 'judge_02', profile: profile('judge_02', -2, -1, 2), profileVersion: 1, seed: 'seed_judge_02', snapshotAt: '2026-01-02T00:00:00.000Z', relationships: { A: { participantId: 'participant_A', ...neutral }, B: { participantId: 'participant_B', ...neutral } }, knownFacts: factKnowledge },
  { judgeId: 'judge_03', profile: profile('judge_03', 1, -1, 0), profileVersion: 1, seed: 'seed_judge_03', snapshotAt: '2026-01-02T00:00:00.000Z', relationships: { A: { participantId: 'participant_A', sympathy: 2, resentment: 0, fear: 0 }, B: { participantId: 'participant_B', ...neutral } }, knownFacts: factKnowledge },
]);

export const TIE_VECTOR_INPUT = deepFreeze({
  voteId: 'vote_tie_001',
  battleId: 'battle_tie_001',
  participantIds: ['participant_A', 'participant_B'],
  featureVersion: 1,
  algorithmVersion: ALGORITHM_VERSION,
  lines: [
    { lineId: 'A1', speakerId: 'participant_A', aggression: 0, factsEmotions: 0, humor: 0, claims: [] },
    { lineId: 'B1', speakerId: 'participant_B', aggression: 0, factsEmotions: 0, humor: 0, claims: [] },
    { lineId: 'A2', speakerId: 'participant_A', aggression: 0, factsEmotions: 0, humor: 0, claims: [] },
    { lineId: 'B2', speakerId: 'participant_B', aggression: 0, factsEmotions: 0, humor: 0, claims: [] },
  ],
});

export function makeTieJudge() {
  return { judgeId: 'judge_01', profile: profile('judge_01', 0, 0, 0), profileVersion: 1, seed: 'seed_001', snapshotAt: '2026-01-02T00:00:00.000Z', relationships: { A: { participantId: 'participant_A', ...neutral }, B: { participantId: 'participant_B', ...neutral } }, knownFacts: [] };
}

export function withA1ClaimStatus(status, supportUnits = 0) {
  const input = structuredClone(FIXTURE_INPUT);
  input.lines[0].claims[0].status = status;
  input.lines[0].claims[0].supportUnits = supportUnits;
  return input;
}
