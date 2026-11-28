import { fixtureSeal, knowledgeKey, SOURCE_ISSUERS, sourceOriginKey } from './keys.mjs';
import { issueRecipientGrant } from './memory-model.mjs';

export const NPCS = Object.freeze({
  compassionate: 'fixture-v2:npc:compassionate',
  pragmatic: 'fixture-v2:npc:pragmatic',
  cautious: 'fixture-v2:npc:cautious',
  absent: 'fixture-v2:npc:absent',
  listener: 'fixture-v2:npc:listener',
});
export const ACTORS = Object.freeze({ winner: 'fixture-v2:actor:winner', loser: 'fixture-v2:actor:loser' });
export const FINAL_REF = Object.freeze({
  sourceSystem: 'fixture-v2:05c', eventId: 'fixture-v2:event:final-1', sourceEventVersion: 'fixture-v2:version:1',
});
export const UTTERANCE_REF = Object.freeze({
  sourceSystem: 'fixture-v2:public-chat', eventId: 'fixture-v2:event:utterance-1', sourceEventVersion: 'fixture-v2:version:1',
});

export function sourceOrigin(ref = FINAL_REF) { return sourceOriginKey(ref); }

export function issueFixtureGrant(state, npcId, ref = FINAL_REF, overrides = {}) {
  const grantId = overrides.grantId ?? `fixture-v2:grant:${npcId.split(':').at(-1)}:${overrides.generation ?? 1}`;
  return issueRecipientGrant(state, { npcId, sourceRef: ref, grantId, issuerId: overrides.issuerId ?? SOURCE_ISSUERS.grant });
}

export function finalIntent(npcId, grantToken, options = {}) {
  const sourceRef = structuredClone(options.sourceRef ?? FINAL_REF);
  const sourceOrigin = sourceOriginKey(sourceRef);
  const source = {
    finality: options.finality ?? 'FINAL',
    winnerId: options.winnerId ?? ACTORS.winner,
    loserId: options.loserId ?? ACTORS.loser,
    summaryCode: options.summaryCode ?? 'fixture-v2:summary:final',
    issuerId: options.sourceIssuerId ?? SOURCE_ISSUERS.final,
  };
  source.proof = options.sourceProof ?? fixtureSeal('05c-final/v2', source.issuerId, {
    sourceRef, finality: source.finality, winnerId: source.winnerId,
    loserId: source.loserId, summaryCode: source.summaryCode,
  });
  const kind = 'VERIFIED_OUTCOME';
  const key = knowledgeKey({ npcId, sourceOrigin, kind });
  const receiptId = options.receiptId ?? `fixture-v2:receipt:outcome:${npcId.split(':').at(-1)}:${options.receiptSuffix ?? '1'}`;
  const payloadSignature = fixtureSeal('knowledge-payload/v2', SOURCE_ISSUERS.relay, {
    sourceRef, finality: source.finality, winnerId: source.winnerId, loserId: source.loserId, summaryCode: source.summaryCode,
  });
  const receipt = receiptFor({ receiptId, npcId, sourceOrigin, kind, key, payloadSignature, grantToken,
    overrides: options.receiptOverrides });
  const policy = options.effect ?? defaultReaction(npcId);
  const effectAuthorization = policy ? effectPolicy({ npcId, sourceOrigin, ...policy, overrides: options.effectOverrides }) : null;
  return { npcId, kind, sourceRef, source, grantToken: structuredClone(grantToken), receipt, effectAuthorization };
}

export function claimIntent(npcId, grantToken, options = {}) {
  const sourceRef = structuredClone(options.sourceRef ?? FINAL_REF);
  const sourceOrigin = sourceOriginKey(sourceRef), kind = 'HEARD_CLAIM';
  const claim = { claimCode: options.claimCode ?? 'fixture-v2:claim:loser-says-won' };
  const receiptId = options.receiptId ?? 'fixture-v2:receipt:relay:1';
  const key = knowledgeKey({ npcId, sourceOrigin, kind, relayReceiptId: receiptId });
  const payloadSignature = fixtureSeal('knowledge-payload/v2', SOURCE_ISSUERS.relay,
    { sourceRef, claimCode: claim.claimCode, relayReceiptId: receiptId });
  const receipt = receiptFor({ receiptId, npcId, sourceOrigin, kind, key, payloadSignature, grantToken,
    overrides: options.receiptOverrides });
  return { npcId, kind, sourceRef, claim, grantToken: structuredClone(grantToken), receipt };
}

export function utteranceIntent(npcId, grantToken, options = {}) {
  const sourceRef = structuredClone(options.sourceRef ?? UTTERANCE_REF);
  const sourceOrigin = sourceOriginKey(sourceRef), kind = 'VERIFIED_UTTERANCE';
  const source = {
    authorId: options.authorId ?? ACTORS.loser,
    utteranceCode: options.utteranceCode ?? 'fixture-v2:utterance:i-won',
    channel: options.channel ?? 'PUBLIC', issuerId: options.sourceIssuerId ?? SOURCE_ISSUERS.utterance,
  };
  source.proof = options.sourceProof ?? fixtureSeal('public-utterance/v2', source.issuerId, {
    sourceRef, authorId: source.authorId, utteranceCode: source.utteranceCode, channel: source.channel,
  });
  const key = knowledgeKey({ npcId, sourceOrigin, kind });
  const receiptId = options.receiptId ?? 'fixture-v2:receipt:utterance:1';
  const payloadSignature = fixtureSeal('knowledge-payload/v2', SOURCE_ISSUERS.relay,
    { sourceRef, authorId: source.authorId, utteranceCode: source.utteranceCode, channel: source.channel });
  const receipt = receiptFor({ receiptId, npcId, sourceOrigin, kind, key, payloadSignature, grantToken,
    overrides: options.receiptOverrides });
  return { npcId, kind, sourceRef, source, grantToken: structuredClone(grantToken), receipt };
}

function receiptFor({ receiptId, npcId, sourceOrigin, kind, key, payloadSignature, grantToken, overrides = {} }) {
  const receipt = { receiptId, issuerId: overrides?.issuerId ?? SOURCE_ISSUERS.relay,
    npcId: overrides?.npcId ?? npcId, sourceOrigin: overrides?.sourceOrigin ?? sourceOrigin,
    kind: overrides?.kind ?? kind, knowledgeKey: overrides?.knowledgeKey ?? key, payloadSignature,
    grantId: overrides?.grantId ?? grantToken?.grantId,
    generation: overrides?.generation ?? grantToken?.generation,
    epoch: overrides?.epoch ?? grantToken?.epoch };
  receipt.proof = overrides?.proof ?? fixtureSeal('07b-relay-receipt/v2', receipt.issuerId, receipt);
  return receipt;
}

export function effectPolicy({ npcId, sourceOrigin, actorId, axis, delta = 1, policyVersion = 'fixture-v2:policy:1', overrides = {} }) {
  const body = { issuerId: overrides?.issuerId ?? SOURCE_ISSUERS.effect,
    npcId: overrides?.npcId ?? npcId, sourceOrigin: overrides?.sourceOrigin ?? sourceOrigin,
    actorId: overrides?.actorId ?? actorId, axis: overrides?.axis ?? axis,
    delta: overrides?.delta ?? delta, policyVersion: overrides?.policyVersion ?? policyVersion };
  return { ...body, proof: overrides?.proof ?? fixtureSeal('08a-effect-policy/v2', body.issuerId, body) };
}

export function defaultReaction(npcId) {
  if (npcId === NPCS.compassionate) return { actorId: ACTORS.loser, axis: 'sympathy', delta: 1 };
  if (npcId === NPCS.pragmatic) return { actorId: ACTORS.winner, axis: 'respect', delta: 1 };
  if (npcId === NPCS.cautious) return { actorId: ACTORS.winner, axis: 'fear', delta: 1 };
  if (npcId === NPCS.listener) return { actorId: ACTORS.winner, axis: 'sympathy', delta: 1 };
  return null;
}
