// TEST-ONLY reference model: not an NPC runtime engine or 07B authorization system.
import { rehydrateSnapshot } from './snapshot-store.mjs';

const AXES = Object.freeze(['respect', 'sympathy', 'resentment', 'fear']);
const FACT_KINDS = Object.freeze(['verified_outcome', 'verified_utterance', 'unverified_relay']);
const SOURCE_KINDS = Object.freeze(['direct', 'permitted_public_relay']);
const OWN = (obj, key) => Object.hasOwn(obj, key);
const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const fixtureId = (v) => typeof v === 'string' && v.startsWith('fixture-08a:') && v.length > 'fixture-08a:'.length;
const validIsoDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const encoded = (...items) => JSON.stringify(items);
const canonicalJson = (value) => Array.isArray(value)
  ? `[${value.map(canonicalJson).join(',')}]`
  : record(value)
    ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
    : JSON.stringify(value);
const sameJson = (a, b) => canonicalJson(a) === canonicalJson(b);

function deny(state, reason) {
  return { state, outcome: 'DENIED', reason, decision: null };
}

function validate(grant, npcProfile) {
  if (!record(grant) || grant.fixtureOnly !== true || grant.knowledgeStatus !== 'AUTHORIZED') return 'NO_AUTHORIZED_KNOWLEDGE';
  if (!fixtureId(grant.npcId) || !fixtureId(grant.stableActorId) || !fixtureId(grant.sourceReceiptId)
    || !fixtureId(grant.visibilityPolicyVersion) || !validIsoDate(grant.learnedAtServer)) return 'MISSING_PROVENANCE';
  if (!record(grant.sourceRef) || Object.keys(grant.sourceRef).length !== 3
    || !['sourceSystem', 'eventId', 'sourceEventVersion'].every((field) => fixtureId(grant.sourceRef[field]))) return 'MISSING_EVENT_IDENTITY';
  if (!FACT_KINDS.includes(grant.factKind) || !SOURCE_KINDS.includes(grant.sourceKind)
    || !record(grant.authorizedFields)) return 'INVALID_KNOWLEDGE_KIND';
  if (!fixtureId(grant.authorizedFields.allowedSummaryKey)) return 'MISSING_ALLOWED_SUMMARY';
  const publicOutcomeKeys = ['finality', 'mechanicalWinnerId', 'mechanicalLoserId', 'allowedSummaryKey'];
  const publicClaimKeys = ['allowedSummaryKey', 'claimCode'];
  const allowlist = grant.factKind === 'verified_outcome' ? publicOutcomeKeys : publicClaimKeys;
  if (Object.keys(grant.authorizedFields).some((key) => !allowlist.includes(key))) return 'UNEXPECTED_FACT_FIELD';
  if (grant.factKind !== 'verified_outcome' && !fixtureId(grant.authorizedFields.claimCode)) return 'INVALID_CLAIM';
  if (grant.factKind === 'verified_outcome') {
    const facts = grant.authorizedFields;
    if (grant.sourceKind !== 'direct' || facts.finality !== 'finalized'
      || !fixtureId(facts.mechanicalWinnerId) || !fixtureId(facts.mechanicalLoserId)
      || facts.mechanicalWinnerId === facts.mechanicalLoserId
      || ![facts.mechanicalWinnerId, facts.mechanicalLoserId].includes(grant.stableActorId)) {
      return 'NO_VERIFIED_OUTCOME';
    }
  }
  if (grant.factKind === 'unverified_relay' && grant.sourceKind !== 'permitted_public_relay') return 'INVALID_RELAY';
  if (!record(npcProfile) || npcProfile.npcId !== grant.npcId) return 'NPC_PROFILE_MISMATCH';
  return null;
}

function verifiedDecision(grant, npcProfile) {
  if (grant.factKind !== 'verified_outcome') return null;
  const rx = npcProfile.reaction;
  if (!record(rx) || !AXES.includes(rx.axis) || rx.direction !== 'UP'
    || !fixtureId(rx.targetActorId) || !fixtureId(rx.reasonCode)) return null;
  if (![grant.authorizedFields.mechanicalWinnerId, grant.authorizedFields.mechanicalLoserId].includes(rx.targetActorId)) return null;
  return {
    actorId: rx.targetActorId,
    axis: rx.axis,
    direction: 'UP',
    reasonCode: rx.reasonCode,
  };
}

function receiptFrom(grant) {
  return {
    sourceKind: grant.sourceKind,
    sourceReceiptId: grant.sourceReceiptId,
    learnedAtServer: grant.learnedAtServer,
    visibilityPolicyVersion: grant.visibilityPolicyVersion,
  };
}

// A reference atomic state transition; no IO and no production claims.
export function applyAuthorizedKnowledge(state, grant, npcProfile) {
  const problem = validate(grant, npcProfile);
  if (problem) return deny(state, problem);

  const origin = encoded(grant.sourceRef.sourceSystem, grant.sourceRef.eventId);
  const signature = encoded(grant.sourceRef.sourceEventVersion, grant.stableActorId, grant.factKind, canonicalJson(grant.authorizedFields));
  const signatureKey = encoded(grant.npcId, origin);
  if (OWN(state.originSignatures, signatureKey) && state.originSignatures[signatureKey] !== signature) {
    return { state, outcome: 'REJECT_CONFLICT', reason: 'SOURCE_VERSION_OR_PAYLOAD_CONFLICT', decision: null };
  }

  const next = rehydrateSnapshot(state);
  const receipt = receiptFrom(grant);
  const npcMemories = next.memories[grant.npcId] ?? [];
  let memory = npcMemories.find((item) => item.originKey === origin);
  let addedProvenance = false;
  if (!memory) {
    memory = {
      originKey: origin,
      sourceRef: { ...grant.sourceRef },
      factKind: grant.factKind,
      stableActorId: grant.stableActorId,
      authorizedFields: { ...grant.authorizedFields },
      sources: [receipt],
    };
    npcMemories.push(memory);
    next.memories[grant.npcId] = npcMemories;
    addedProvenance = true;
  } else if (!memory.sources.some((item) => item.sourceReceiptId === grant.sourceReceiptId)) {
    memory.sources.push(receipt);
    addedProvenance = true;
  } else if (!memory.sources.some((item) => item.sourceReceiptId === receipt.sourceReceiptId && sameJson(item, receipt))) {
    return { state, outcome: 'REJECT_CONFLICT', reason: 'RECEIPT_CONFLICT', decision: null };
  }

  next.originSignatures[signatureKey] = signature;
  const decision = verifiedDecision(grant, npcProfile);
  if (!decision) {
    // A claim may be remembered as an utterance/relay, never as a proven result.
    return { state: next, outcome: addedProvenance ? 'REMEMBERED_WITHOUT_EFFECT' : 'ALREADY_REMEMBERED', decision: null };
  }

  const effectKey = encoded(grant.npcId, origin);
  if (OWN(next.appliedEffects, effectKey)) {
    return { state: next, outcome: 'ALREADY_APPLIED', decision: null };
  }
  next.appliedEffects[effectKey] = {
    npcId: grant.npcId,
    originKey: origin,
    targetActorId: decision.actorId,
    effectKind: decision.axis,
    reasonCode: decision.reasonCode,
  };
  next.relationships[grant.npcId] ??= {};
  next.relationships[grant.npcId][decision.actorId] ??= {
    respect: 'UNCHANGED', sympathy: 'UNCHANGED', resentment: 'UNCHANGED', fear: 'UNCHANGED',
  };
  next.relationships[grant.npcId][decision.actorId][decision.axis] = decision.direction;
  return { state: next, outcome: 'APPLIED', decision };
}
