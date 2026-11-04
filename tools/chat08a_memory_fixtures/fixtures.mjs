// Synthetic fixtures only. These receipts are NOT real Chat07B or gameplay evidence.
export const ACTORS = Object.freeze({
  winner: 'fixture-08a:actor:vera',
  loser: 'fixture-08a:actor:gosha',
});

export const NPCS = Object.freeze({
  compassion: 'fixture-08a:npc:compassion',
  pragmatic: 'fixture-08a:npc:pragmatic',
  cautious: 'fixture-08a:npc:cautious',
  absent: 'fixture-08a:npc:absent',
  listener: 'fixture-08a:npc:listener',
  direct: 'fixture-08a:npc:direct',
  relay: 'fixture-08a:npc:relay',
});

export const FINAL_REF = Object.freeze({
  sourceSystem: 'fixture-08a:gameplay',
  eventId: 'fixture-08a:final-1',
  sourceEventVersion: 'fixture-08a:version:final-1',
});
export const CLAIM_REF = Object.freeze({
  sourceSystem: 'fixture-08a:public-message',
  eventId: 'fixture-08a:claim-1',
  sourceEventVersion: 'fixture-08a:version:claim-1',
});
export const FINAL_FACTS = Object.freeze({
  finality: 'finalized',
  mechanicalWinnerId: ACTORS.winner,
  mechanicalLoserId: ACTORS.loser,
  allowedSummaryKey: 'fixture-08a:summary:mechanical-outcome',
});
export const CLAIM_FACTS = Object.freeze({
  allowedSummaryKey: 'fixture-08a:summary:public-claim',
  claimCode: 'fixture-08a:claim:gosha-says-won',
});

// Static expectations are independent of the memory-model implementation.
export const EXPECTED_REACTIONS = Object.freeze({
  compassion: Object.freeze({ actorId: ACTORS.loser, axis: 'sympathy', direction: 'UP' }),
  pragmatic: Object.freeze({ actorId: ACTORS.winner, axis: 'respect', direction: 'UP' }),
  cautious: Object.freeze({ actorId: ACTORS.winner, axis: 'fear', direction: 'UP' }),
});

const reasons = Object.freeze({
  compassion: 'fixture-08a:reason:compassion-for-loser',
  pragmatic: 'fixture-08a:reason:respect-for-winner',
  cautious: 'fixture-08a:reason:caution-around-winner',
});

export function profile(role, npcId = NPCS[role]) {
  if (!Object.hasOwn(EXPECTED_REACTIONS, role) || !npcId) throw new Error('unknown fixture role');
  const expected = EXPECTED_REACTIONS[role];
  return Object.freeze({
    npcId,
    reaction: Object.freeze({
      targetActorId: expected.actorId,
      axis: expected.axis,
      direction: expected.direction,
      reasonCode: reasons[role],
    }),
  });
}

export function finalGrant(npcId, receiptId = 'fixture-08a:receipt:direct-1', overrides = {}) {
  return {
    fixtureOnly: true,
    knowledgeStatus: 'AUTHORIZED',
    npcId,
    stableActorId: ACTORS.winner,
    sourceRef: { ...FINAL_REF },
    factKind: 'verified_outcome',
    sourceKind: 'direct',
    sourceReceiptId: receiptId,
    learnedAtServer: '2026-11-01T06:00:00.000Z',
    visibilityPolicyVersion: 'fixture-08a:visibility:v1',
    authorizedFields: { ...FINAL_FACTS },
    ...overrides,
  };
}

export function rumorGrant(npcId, receiptId = 'fixture-08a:receipt:relay-1', overrides = {}) {
  return {
    fixtureOnly: true,
    knowledgeStatus: 'AUTHORIZED',
    npcId,
    stableActorId: ACTORS.loser,
    sourceRef: { ...CLAIM_REF },
    factKind: 'unverified_relay',
    sourceKind: 'permitted_public_relay',
    sourceReceiptId: receiptId,
    learnedAtServer: '2026-11-01T06:01:00.000Z',
    visibilityPolicyVersion: 'fixture-08a:visibility:v1',
    authorizedFields: { ...CLAIM_FACTS },
    ...overrides,
  };
}
