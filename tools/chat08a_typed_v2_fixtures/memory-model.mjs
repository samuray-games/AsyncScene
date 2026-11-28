import {
  copyJsonData, effectKey, fixtureId, fixtureSeal, isRecord, knowledgeKey, SOURCE_ISSUERS,
  sourceOriginKey, stableJson,
} from './keys.mjs';
import { emptyState, sealState, validateState } from './snapshot-store.mjs';

const grantKeyFor = (npcId, origin) => JSON.stringify(['npc-grant/v2', npcId, origin]);
const result = (status, reason, state) => ({ status, reason, state });

function sourcePayload(intent) {
  if (intent.kind === 'VERIFIED_OUTCOME') {
    return { sourceRef: intent.sourceRef, finality: intent.source?.finality,
      winnerId: intent.source?.winnerId, loserId: intent.source?.loserId, summaryCode: intent.source?.summaryCode };
  }
  if (intent.kind === 'VERIFIED_UTTERANCE') {
    return { sourceRef: intent.sourceRef, authorId: intent.source?.authorId,
      utteranceCode: intent.source?.utteranceCode, channel: intent.source?.channel };
  }
  return { sourceRef: intent.sourceRef, claimCode: intent.claim?.claimCode, relayReceiptId: intent.receipt?.receiptId };
}

function signableSource(intent) {
  if (intent.kind === 'VERIFIED_OUTCOME') return {
    sourceRef: intent.sourceRef, finality: intent.source?.finality, winnerId: intent.source?.winnerId,
    loserId: intent.source?.loserId, summaryCode: intent.source?.summaryCode,
  };
  if (intent.kind === 'VERIFIED_UTTERANCE') return {
    sourceRef: intent.sourceRef, authorId: intent.source?.authorId,
    utteranceCode: intent.source?.utteranceCode, channel: intent.source?.channel,
  };
  return {};
}

function signableGrant(grant) {
  const { proof: _proof, ...snapshot } = grant;
  return snapshot;
}

function validateSource(intent, origin) {
  if (!isRecord(intent.sourceRef) || !fixtureId(intent.sourceRef.sourceSystem)
    || !fixtureId(intent.sourceRef.eventId) || !fixtureId(intent.sourceRef.sourceEventVersion)) return 'INVALID_SOURCE_REF';
  if (sourceOriginKey(intent.sourceRef) !== origin) return 'SOURCE_ORIGIN_MISMATCH';
  if (intent.kind === 'VERIFIED_OUTCOME') {
    const s = intent.source;
    if (!isRecord(s) || s.issuerId !== SOURCE_ISSUERS.final || s.finality !== 'FINAL'
      || !fixtureId(s.winnerId) || !fixtureId(s.loserId) || s.winnerId === s.loserId
      || !fixtureId(s.summaryCode)
      || Object.keys(s).sort().join(',') !== 'finality,issuerId,loserId,proof,summaryCode,winnerId') return 'UNTRUSTED_FINAL_SOURCE';
    const payload = signableSource(intent);
    if (s.proof !== fixtureSeal('05c-final/v2', SOURCE_ISSUERS.final, payload)) return 'INVALID_FINAL_PROOF';
    return null;
  }
  if (intent.kind === 'VERIFIED_UTTERANCE') {
    const s = intent.source;
    if (!isRecord(s) || s.issuerId !== SOURCE_ISSUERS.utterance || s.channel !== 'PUBLIC'
      || !fixtureId(s.authorId) || !fixtureId(s.utteranceCode)
      || Object.keys(s).sort().join(',') !== 'authorId,channel,issuerId,proof,utteranceCode') return 'UNTRUSTED_UTTERANCE_SOURCE';
    if (s.proof !== fixtureSeal('public-utterance/v2', SOURCE_ISSUERS.utterance, signableSource(intent))) return 'INVALID_UTTERANCE_PROOF';
    return null;
  }
  if (intent.kind === 'HEARD_CLAIM') {
    if (Object.hasOwn(intent, 'source')) return 'UNEXPECTED_SOURCE_FOR_CLAIM';
    if (!isRecord(intent.claim) || !fixtureId(intent.claim.claimCode)) return 'INVALID_CLAIM';
    return null;
  }
  return 'UNKNOWN_KNOWLEDGE_KIND';
}

function validateGrantToken(state, intent, origin) {
  const token = intent.grantToken;
  if (!isRecord(token) || token.issuerId !== SOURCE_ISSUERS.grant || token.npcId !== intent.npcId
    || token.sourceOrigin !== origin || token.active !== true || !fixtureId(token.grantId)
    || token.proof !== fixtureSeal('07b-grant/v2', SOURCE_ISSUERS.grant, signableGrant(token))) return 'INVALID_GRANT_TOKEN';
  const current = state.grants.find((g) => g.grantKey === grantKeyFor(intent.npcId, origin));
  if (!current || !current.active) return 'GRANT_REVOKED_OR_MISSING';
  if (current.grantId !== token.grantId || current.generation !== token.generation || current.epoch !== token.epoch
    || current.proof !== token.proof) return 'STALE_GRANT_EPOCH';
  return null;
}

function validateReceipt(intent, origin, key) {
  const r = intent.receipt;
  if (!isRecord(r) || r.issuerId !== SOURCE_ISSUERS.relay || !fixtureId(r.receiptId)
    || r.npcId !== intent.npcId || r.sourceOrigin !== origin || r.kind !== intent.kind || r.knowledgeKey !== key) {
    return 'INVALID_TRANSPORT_RECEIPT_BINDING';
  }
  if (!isRecord(intent.grantToken) || r.grantId !== intent.grantToken.grantId
    || r.generation !== intent.grantToken.generation || r.epoch !== intent.grantToken.epoch
    || Object.keys(r).sort().join(',') !== 'epoch,generation,grantId,issuerId,kind,knowledgeKey,npcId,payloadSignature,proof,receiptId,sourceOrigin') {
    return 'INVALID_TRANSPORT_RECEIPT_GRANT_BINDING';
  }
  const payload = { receiptId: r.receiptId, npcId: r.npcId, sourceOrigin: r.sourceOrigin,
    kind: r.kind, knowledgeKey: r.knowledgeKey, payloadSignature: r.payloadSignature, issuerId: r.issuerId,
    grantId: r.grantId, generation: r.generation, epoch: r.epoch };
  if (r.proof !== fixtureSeal('07b-relay-receipt/v2', SOURCE_ISSUERS.relay, payload)) return 'INVALID_TRANSPORT_RECEIPT_PROOF';
  if (r.payloadSignature !== fixtureSeal('knowledge-payload/v2', SOURCE_ISSUERS.relay, sourcePayload(intent))) return 'RECEIPT_PAYLOAD_MISMATCH';
  return null;
}

function validateEffect(intent, origin) {
  if (intent.kind !== 'VERIFIED_OUTCOME') return null;
  const p = intent.effectAuthorization;
  if (!isRecord(p) || p.issuerId !== SOURCE_ISSUERS.effect || p.npcId !== intent.npcId || p.sourceOrigin !== origin
    || ![intent.source.winnerId, intent.source.loserId].includes(p.actorId)
    || !['respect', 'sympathy', 'resentment', 'fear'].includes(p.axis)
    || !Number.isSafeInteger(p.delta) || Math.abs(p.delta) !== 1 || !fixtureId(p.policyVersion)
    || Object.keys(p).sort().join(',') !== 'actorId,axis,delta,issuerId,npcId,policyVersion,proof,sourceOrigin') return 'INVALID_EFFECT_POLICY';
  const { proof, ...body } = p;
  return proof === fixtureSeal('08a-effect-policy/v2', SOURCE_ISSUERS.effect, body) ? null : 'INVALID_EFFECT_POLICY_PROOF';
}

function sourceSignature(intent) {
  if (intent.kind === 'VERIFIED_OUTCOME') return fixtureSeal('immutable-final-signature/v2', SOURCE_ISSUERS.final, {
    sourceRef: intent.sourceRef, finality: intent.source.finality, winnerId: intent.source.winnerId,
    loserId: intent.source.loserId, summaryCode: intent.source.summaryCode,
  });
  if (intent.kind === 'VERIFIED_UTTERANCE') return fixtureSeal('immutable-utterance-signature/v2', SOURCE_ISSUERS.utterance, {
    sourceRef: intent.sourceRef, authorId: intent.source.authorId,
    utteranceCode: intent.source.utteranceCode, channel: intent.source.channel,
  });
  return null;
}

function knowledgeSignature(intent) {
  return fixtureSeal('immutable-knowledge-signature/v2', intent.kind, {
    sourceRef: intent.sourceRef,
    kind: intent.kind,
    payload: sourcePayload(intent),
    sourceProof: intent.kind === 'HEARD_CLAIM' ? null : intent.source?.proof ?? null,
  });
}

function effectSignature(p) {
  const { proof: _proof, ...body } = p;
  return fixtureSeal('immutable-effect-signature/v2', SOURCE_ISSUERS.effect, body);
}

function effectConflict(state, intent, origin) {
  if (intent.kind !== 'VERIFIED_OUTCOME') return null;
  const existing = state.effects.find((e) => e.effectKey === effectKey({ npcId: intent.npcId, sourceOrigin: origin, kind: intent.kind }));
  if (!existing) return null;
  if (validateEffect(intent, origin) || effectSignature(intent.effectAuthorization) !== existing.signature) {
    return 'IMMUTABLE_EFFECT_SIGNATURE_MISMATCH';
  }
  return null;
}

function relValue(state, npcId, actorId, axis) {
  return state.relationships.find((r) => r.npcId === npcId && r.actorId === actorId && r.axis === axis)?.value ?? 0;
}

export function createMemoryState() {
  return emptyState();
}

export function issueRecipientGrant(inputState, grantRequest) {
  inputState = validateState(inputState);
  let request;
  try { request = copyJsonData(grantRequest); } catch { throw new TypeError('INVALID_GRANT_REQUEST_DATA'); }
  const { npcId, sourceRef, grantId, issuerId = SOURCE_ISSUERS.grant } = request;
  if (!fixtureId(npcId) || !fixtureId(grantId) || issuerId !== SOURCE_ISSUERS.grant) throw new TypeError('INVALID_GRANT_ISSUER_OR_ID');
  const origin = sourceOriginKey(sourceRef), next = structuredClone(inputState), grantKey = grantKeyFor(npcId, origin);
  if (next.issuedGrantIds.includes(grantId)) throw new TypeError('DUPLICATE_GRANT_ID');
  const previous = next.grants.find((g) => g.grantKey === grantKey);
  if (previous?.active) throw new TypeError('ACTIVE_GRANT_ALREADY_EXISTS');
  const generation = previous ? previous.generation + 1 : 1;
  const epoch = previous ? previous.epoch + 1 : 1;
  const body = { grantKey, grantId, npcId, sourceOrigin: origin, issuerId, generation, epoch, active: true };
  const grant = { ...body, proof: fixtureSeal('07b-grant/v2', issuerId, body) };
  if (previous) next.grants[next.grants.indexOf(previous)] = grant;
  else next.grants.push(grant);
  next.issuedGrantIds.push(grantId);
  return { state: sealState(next), grantToken: structuredClone(grant) };
}

export function revokeRecipientGrant(inputState, grantId) {
  inputState = validateState(inputState);
  const next = structuredClone(inputState), grant = next.grants.find((g) => g.grantId === grantId);
  if (!grant || !grant.active) return { state: inputState, revoked: false };
  grant.active = false;
  grant.epoch += 1;
  const body = signableGrant(grant);
  grant.proof = fixtureSeal('07b-grant/v2', SOURCE_ISSUERS.grant, body);
  return { state: sealState(next), revoked: true };
}

export function commitKnowledge(inputState, intent) {
  inputState = validateState(inputState);
  try { intent = copyJsonData(intent); } catch {
    return result('DENIED', 'INVALID_INTENT_DATA', inputState);
  }
  if (!isRecord(intent) || !fixtureId(intent.npcId) || !['VERIFIED_OUTCOME','VERIFIED_UTTERANCE','HEARD_CLAIM'].includes(intent.kind)) {
    return result('DENIED', 'INVALID_INTENT', inputState);
  }
  let origin;
  try { origin = sourceOriginKey(intent.sourceRef); } catch { return result('DENIED', 'INVALID_SOURCE_ORIGIN', inputState); }
  const sourceProblem = validateSource(intent, origin);
  if (sourceProblem) return result('DENIED', sourceProblem, inputState);
  const grantProblem = validateGrantToken(inputState, intent, origin);
  if (grantProblem) return result('DENIED', grantProblem, inputState);
  let key;
  try {
    key = knowledgeKey({ npcId: intent.npcId, sourceOrigin: origin, kind: intent.kind,
      relayReceiptId: intent.kind === 'HEARD_CLAIM' ? intent.receipt?.receiptId : undefined });
  } catch (error) {
    return result('DENIED', error instanceof Error ? error.message : 'INVALID_KNOWLEDGE_KEY', inputState);
  }
  const receiptProblem = validateReceipt(intent, origin, key);
  if (receiptProblem) return result('DENIED', receiptProblem, inputState);

  const existingReceipt = inputState.receiptIndex.find((r) => r.receiptId === intent.receipt.receiptId);
  const receiptSig = intent.receipt.proof;
  const incomingKnowledgeSig = knowledgeSignature(intent);
  if (existingReceipt) {
    if (existingReceipt.signature !== receiptSig || existingReceipt.knowledgeKey !== key
      || existingReceipt.knowledgeSignature !== incomingKnowledgeSig) return result('CONFLICT_QUARANTINE', 'RECEIPT_ID_REUSE', inputState);
    const policyConflict = effectConflict(inputState, intent, origin);
    if (policyConflict) return result('CONFLICT_QUARANTINE', policyConflict, inputState);
    return result('IDEMPOTENT_REPLAY', 'EXACT_RECEIPT_ALREADY_COMMITTED', inputState);
  }

  const incomingSourceSig = sourceSignature(intent);
  const knownSource = incomingSourceSig && inputState.sourceSignatures.find((s) => s.sourceOrigin === origin);
  if (knownSource && knownSource.signature !== incomingSourceSig) return result('CONFLICT_QUARANTINE', 'IMMUTABLE_SOURCE_SIGNATURE_MISMATCH', inputState);

  const existing = inputState.knowledge.find((k) => k.knowledgeKey === key);
  if (existing && existing.signature !== incomingKnowledgeSig) return result('CONFLICT_QUARANTINE', 'IMMUTABLE_KNOWLEDGE_SIGNATURE_MISMATCH', inputState);
  const policyConflict = effectConflict(inputState, intent, origin);
  if (policyConflict) return result('CONFLICT_QUARANTINE', policyConflict, inputState);

  const next = structuredClone(inputState);
  if (incomingSourceSig && !next.sourceSignatures.some((s) => s.sourceOrigin === origin)) {
    next.sourceSignatures.push({ sourceOrigin: origin, signature: incomingSourceSig });
  }
  const target = next.knowledge.find((k) => k.knowledgeKey === key);
  if (!target) {
    next.knowledge.push({ knowledgeKey: key, sourceOrigin: origin, npcId: intent.npcId, kind: intent.kind,
      relayReceiptId: intent.kind === 'HEARD_CLAIM' ? intent.receipt.receiptId : null,
      sourceRef: structuredClone(intent.sourceRef), sourceSignature: incomingSourceSig,
      signature: incomingKnowledgeSig, receipts: [] });
  }
  const entry = next.knowledge.find((k) => k.knowledgeKey === key);
  const savedReceipt = { receiptId: intent.receipt.receiptId, signature: receiptSig, knowledgeKey: key,
    sourceOrigin: origin, npcId: intent.npcId, kind: intent.kind };
  entry.receipts.push(savedReceipt);
  next.receiptIndex.push({ ...savedReceipt, knowledgeSignature: incomingKnowledgeSig });

  if (intent.kind !== 'VERIFIED_OUTCOME') {
    return result('RECORDED_NO_EFFECT', intent.kind === 'HEARD_CLAIM' ? 'CLAIM_IS_NOT_VERIFIED_OUTCOME' : 'UTTERANCE_HAS_NO_EFFECT', sealState(next));
  }
  const effectProblem = validateEffect(intent, origin);
  if (effectProblem) return result('RECORDED_NO_EFFECT', effectProblem, sealState(next));

  const policy = intent.effectAuthorization, eKey = effectKey({ npcId: intent.npcId, sourceOrigin: origin, kind: intent.kind });
  const eSignature = effectSignature(policy);
  const oldEffect = next.effects.find((e) => e.effectKey === eKey);
  if (oldEffect) {
    if (oldEffect.signature !== eSignature) return result('CONFLICT_QUARANTINE', 'IMMUTABLE_EFFECT_SIGNATURE_MISMATCH', inputState);
    return result('RECORDED_NO_EFFECT', 'OUTCOME_EFFECT_ALREADY_APPLIED', sealState(next));
  }
  next.effects.push({ effectKey: eKey, sourceOrigin: origin, npcId: intent.npcId, kind: intent.kind,
    issuerId: policy.issuerId, actorId: policy.actorId, axis: policy.axis, delta: policy.delta,
    policyVersion: policy.policyVersion, signature: eSignature });
  const relation = next.relationships.find((r) => r.npcId === intent.npcId && r.actorId === policy.actorId && r.axis === policy.axis);
  if (relation) relation.value += policy.delta;
  else next.relationships.push({ npcId: intent.npcId, actorId: policy.actorId, axis: policy.axis, value: policy.delta });
  return result('APPLIED', 'ONE_POLICY_AUTHORIZED_OUTCOME_EFFECT', sealState(next));
}

export function relationshipValue(state, npcId, actorId, axis) {
  state = validateState(state);
  return relValue(state, npcId, actorId, axis);
}

export function inspectMemory(state, npcId, origin) {
  state = validateState(state);
  return state.knowledge.filter((entry) => entry.npcId === npcId && entry.sourceOrigin === origin).map((x) => structuredClone(x));
}

export function inspectEffect(state, npcId, origin) {
  state = validateState(state);
  return structuredClone(state.effects.find((e) => e.npcId === npcId && e.sourceOrigin === origin) ?? null);
}

