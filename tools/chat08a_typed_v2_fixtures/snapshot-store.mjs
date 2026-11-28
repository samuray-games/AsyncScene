import { copyJsonData, effectKey, fixtureId, fixtureSeal, isRecord, isSourceOriginKey, knowledgeKey,
  parseFixtureSeal, SOURCE_ISSUERS, sourceOriginKey, stableJson } from './keys.mjs';

const SNAPSHOT_DOMAIN = 'snapshot/v2';

export function emptyState() {
  return sealState({
    schemaVersion: 2,
    grants: [],
    issuedGrantIds: [],
    knowledge: [],
    receiptIndex: [],
    sourceSignatures: [],
    effects: [],
    relationships: [],
  });
}

function unsignedState(state) {
  const { integritySeal: _ignored, ...rest } = state;
  return rest;
}

export function sealState(state) {
  const next = copyJsonData(state);
  next.integritySeal = fixtureSeal(SNAPSHOT_DOMAIN, 'fixture-checksum', unsignedState(next));
  return next;
}

function assertUnique(rows, keyFn, label) {
  const seen = new Set();
  for (const row of rows) {
    const key = keyFn(row);
    if (seen.has(key)) throw new TypeError(`DUPLICATE_${label}`);
    seen.add(key);
  }
}

export function validateState(state) {
  state = copyJsonData(state);
  if (!isRecord(state) || state.schemaVersion !== 2 || !Array.isArray(state.grants)
    || !Array.isArray(state.issuedGrantIds)
    || !Array.isArray(state.knowledge) || !Array.isArray(state.receiptIndex)
    || !Array.isArray(state.sourceSignatures) || !Array.isArray(state.effects)
    || !Array.isArray(state.relationships)) throw new TypeError('INVALID_V2_SNAPSHOT_SHAPE');

  assertUnique(state.grants, (g) => g.grantKey, 'GRANT_KEY');
  assertUnique(state.grants, (g) => g.grantId, 'CURRENT_GRANT_ID');
  assertUnique(state.issuedGrantIds, (id) => id, 'ISSUED_GRANT_ID');
  if (state.issuedGrantIds.some((id) => !fixtureId(id))) throw new TypeError('INVALID_ISSUED_GRANT_ID_HISTORY');
  assertUnique(state.knowledge, (k) => k.knowledgeKey, 'KNOWLEDGE_KEY');
  assertUnique(state.receiptIndex, (r) => r.receiptId, 'RECEIPT_ID');
  assertUnique(state.sourceSignatures, (s) => s.sourceOrigin, 'SOURCE_ORIGIN');
  assertUnique(state.effects, (e) => e.effectKey, 'EFFECT_KEY');
  assertUnique(state.relationships, (r) => JSON.stringify([r.npcId, r.actorId, r.axis]), 'RELATIONSHIP');

  for (const grant of state.grants) {
    if (!isRecord(grant) || grant.grantKey !== JSON.stringify(['npc-grant/v2', grant.npcId, grant.sourceOrigin])
      || !fixtureId(grant.npcId) || !fixtureId(grant.grantId) || typeof grant.active !== 'boolean'
      || grant.issuerId !== SOURCE_ISSUERS.grant || !Number.isSafeInteger(grant.generation) || grant.generation < 1
      || !Number.isSafeInteger(grant.epoch) || grant.epoch < 1
      || !Number.isSafeInteger(2 * grant.generation)
      || grant.epoch !== (grant.active ? 2 * grant.generation - 1 : 2 * grant.generation)) {
      throw new TypeError('INVALID_SNAPSHOT_GRANT');
    }
    const { proof, ...grantBody } = grant;
    if (proof !== fixtureSeal('07b-grant/v2', SOURCE_ISSUERS.grant, grantBody)) throw new TypeError('INVALID_SNAPSHOT_GRANT_PROOF');
    if (!state.issuedGrantIds.includes(grant.grantId)) throw new TypeError('GRANT_ID_HISTORY_MISMATCH');
  }
  const receiptIdsInKnowledge = new Set();
  for (const entry of state.knowledge) {
    if (!isRecord(entry) || !Array.isArray(entry.receipts) || entry.receipts.length === 0
      || !fixtureId(entry.npcId) || !['VERIFIED_OUTCOME','VERIFIED_UTTERANCE','HEARD_CLAIM'].includes(entry.kind)
      || sourceOriginKey(entry.sourceRef) !== entry.sourceOrigin || typeof entry.signature !== 'string'
      || entry.knowledgeKey !== knowledgeKey({ npcId: entry.npcId, sourceOrigin: entry.sourceOrigin, kind: entry.kind,
        relayReceiptId: entry.kind === 'HEARD_CLAIM' ? entry.relayReceiptId : undefined })) {
      throw new TypeError('INVALID_SNAPSHOT_KNOWLEDGE');
    }
    const sourceRecord = state.sourceSignatures.find((s) => s.sourceOrigin === entry.sourceOrigin);
    if (['VERIFIED_OUTCOME','VERIFIED_UTTERANCE'].includes(entry.kind)) {
      if (!sourceRecord || entry.sourceSignature !== sourceRecord.signature) throw new TypeError('SOURCE_SIGNATURE_LEDGER_MISMATCH');
    } else if (entry.sourceSignature !== null) throw new TypeError('CLAIM_HAS_SOURCE_SIGNATURE');
    const envelope = parseFixtureSeal(entry.signature, 'immutable-knowledge-signature/v2', entry.kind);
    if (!envelope || envelope.kind !== entry.kind || stableJson(envelope.sourceRef) !== stableJson(entry.sourceRef)) {
      throw new TypeError('KNOWLEDGE_SIGNATURE_KIND_MISMATCH');
    }
    if (stableJson(envelope.payload?.sourceRef) !== stableJson(entry.sourceRef)) {
      throw new TypeError('KNOWLEDGE_PAYLOAD_SOURCE_REF_MISMATCH');
    }
    if (entry.kind === 'VERIFIED_OUTCOME') {
      const proof = parseFixtureSeal(envelope.sourceProof, '05c-final/v2', SOURCE_ISSUERS.final);
      const sourceSignature = parseFixtureSeal(entry.sourceSignature, 'immutable-final-signature/v2', SOURCE_ISSUERS.final);
      if (!proof || stableJson(proof) !== stableJson(envelope.payload) || proof.sourceRef?.eventId !== entry.sourceRef.eventId
        || proof.sourceRef?.sourceSystem !== entry.sourceRef.sourceSystem || proof.finality !== 'FINAL'
        || !fixtureId(proof.winnerId) || !fixtureId(proof.loserId) || proof.winnerId === proof.loserId
        || !fixtureId(proof.summaryCode) || !sourceSignature
        || stableJson(sourceSignature) !== stableJson(envelope.payload)) throw new TypeError('INVALID_SNAPSHOT_FINAL_PROOF_BINDING');
    } else if (entry.kind === 'VERIFIED_UTTERANCE') {
      const proof = parseFixtureSeal(envelope.sourceProof, 'public-utterance/v2', SOURCE_ISSUERS.utterance);
      const sourceSignature = parseFixtureSeal(entry.sourceSignature, 'immutable-utterance-signature/v2', SOURCE_ISSUERS.utterance);
      if (!proof || stableJson(proof) !== stableJson(envelope.payload) || proof.sourceRef?.eventId !== entry.sourceRef.eventId
        || proof.sourceRef?.sourceSystem !== entry.sourceRef.sourceSystem || proof.channel !== 'PUBLIC'
        || !fixtureId(proof.authorId) || !fixtureId(proof.utteranceCode) || !sourceSignature
        || stableJson(sourceSignature) !== stableJson(envelope.payload)) throw new TypeError('INVALID_SNAPSHOT_UTTERANCE_PROOF_BINDING');
    } else if (envelope.sourceProof !== null || envelope.payload?.sourceRef?.eventId !== entry.sourceRef.eventId
      || envelope.payload?.sourceRef?.sourceSystem !== entry.sourceRef.sourceSystem
      || envelope.payload?.relayReceiptId !== entry.relayReceiptId || !fixtureId(envelope.payload?.claimCode)) {
      throw new TypeError('INVALID_SNAPSHOT_CLAIM_SIGNATURE_BINDING');
    }
    for (const receipt of entry.receipts) {
      if (!isRecord(receipt) || receipt.knowledgeKey !== entry.knowledgeKey || receipt.sourceOrigin !== entry.sourceOrigin
        || receipt.npcId !== entry.npcId || receipt.kind !== entry.kind || receiptIdsInKnowledge.has(receipt.receiptId)) {
        throw new TypeError('INVALID_SNAPSHOT_RECEIPT_BINDING');
      }
      const signed = parseFixtureSeal(receipt.signature, '07b-relay-receipt/v2', SOURCE_ISSUERS.relay);
      const payload = signed && parseFixtureSeal(signed.payloadSignature, 'knowledge-payload/v2', SOURCE_ISSUERS.relay);
      if (!signed || !payload || signed.receiptId !== receipt.receiptId || signed.npcId !== entry.npcId
        || signed.sourceOrigin !== entry.sourceOrigin || signed.kind !== entry.kind || signed.knowledgeKey !== entry.knowledgeKey
        || !fixtureId(receipt.receiptId) || signed.issuerId !== SOURCE_ISSUERS.relay || !fixtureId(signed.grantId)
        || !state.issuedGrantIds.includes(signed.grantId)
        || !Number.isSafeInteger(signed.generation) || signed.generation < 1
        || !Number.isSafeInteger(signed.epoch) || signed.epoch < 1 || stableJson(payload) !== stableJson(envelope.payload)) {
        throw new TypeError('INVALID_SNAPSHOT_RECEIPT_SIGNATURE_BINDING');
      }
      if (entry.kind === 'HEARD_CLAIM' && (entry.receipts.length !== 1 || receipt.receiptId !== entry.relayReceiptId)) {
        throw new TypeError('CLAIM_RELAY_RECEIPT_KEY_MISMATCH');
      }
      receiptIdsInKnowledge.add(receipt.receiptId);
    }
  }
  if (receiptIdsInKnowledge.size !== state.receiptIndex.length
    || state.receiptIndex.some((r) => !receiptIdsInKnowledge.has(r.receiptId))) throw new TypeError('RECEIPT_INDEX_MISMATCH');
  const receiptIndex = new Map(state.receiptIndex.map((r) => [r.receiptId, r]));
  for (const entry of state.knowledge) for (const receipt of entry.receipts) {
    const indexed = receiptIndex.get(receipt.receiptId);
    if (!indexed || indexed.signature !== receipt.signature || indexed.knowledgeKey !== entry.knowledgeKey
      || indexed.knowledgeSignature !== entry.signature || indexed.sourceOrigin !== entry.sourceOrigin
      || indexed.npcId !== entry.npcId || indexed.kind !== entry.kind) throw new TypeError('RECEIPT_INDEX_BINDING_MISMATCH');
  }

  for (const source of state.sourceSignatures) {
    if (!isRecord(source) || typeof source.signature !== 'string') throw new TypeError('INVALID_SOURCE_SIGNATURE_RECORD');
    let tuple;
    try { tuple = JSON.parse(source.sourceOrigin); } catch { throw new TypeError('INVALID_SOURCE_ORIGIN_SIGNATURE'); }
    if (!Array.isArray(tuple) || tuple.length !== 3 || tuple[0] !== 'source-origin/v2'
      || !isSourceOriginKey(source.sourceOrigin)
      || !state.knowledge.some((entry) => entry.sourceOrigin === source.sourceOrigin
        && ['VERIFIED_OUTCOME','VERIFIED_UTTERANCE'].includes(entry.kind)
        && entry.sourceSignature === source.signature)) {
      throw new TypeError('INVALID_SOURCE_ORIGIN_SIGNATURE');
    }
    const entry = state.knowledge.find((item) => item.sourceOrigin === source.sourceOrigin && item.sourceSignature === source.signature);
    const envelope = parseFixtureSeal(entry.signature, 'immutable-knowledge-signature/v2', entry.kind);
    const domain = entry.kind === 'VERIFIED_OUTCOME' ? 'immutable-final-signature/v2' : 'immutable-utterance-signature/v2';
    const issuer = entry.kind === 'VERIFIED_OUTCOME' ? SOURCE_ISSUERS.final : SOURCE_ISSUERS.utterance;
    const signedSource = parseFixtureSeal(source.signature, domain, issuer);
    if (!signedSource || stableJson(signedSource) !== stableJson(envelope.payload)) throw new TypeError('INVALID_SOURCE_SIGNATURE_DOMAIN');
  }

  const totals = new Map();
  for (const effect of state.effects) {
    const outcomeEntry = state.knowledge.find((k) => k.npcId === effect?.npcId
      && k.sourceOrigin === effect?.sourceOrigin && k.kind === 'VERIFIED_OUTCOME');
    const outcomeEnvelope = outcomeEntry && parseFixtureSeal(outcomeEntry.signature,
      'immutable-knowledge-signature/v2', 'VERIFIED_OUTCOME');
    if (!isRecord(effect) || effect.kind !== 'VERIFIED_OUTCOME'
      || effect.effectKey !== effectKey({ npcId: effect.npcId, sourceOrigin: effect.sourceOrigin, kind: effect.kind })
      || !fixtureId(effect.npcId) || !fixtureId(effect.actorId)
      || !['respect','sympathy','resentment','fear'].includes(effect.axis)
      || !Number.isSafeInteger(effect.delta) || Math.abs(effect.delta) !== 1
      || effect.issuerId !== SOURCE_ISSUERS.effect || !fixtureId(effect.policyVersion)
      || !outcomeEntry || !outcomeEnvelope
      || ![outcomeEnvelope.payload?.winnerId, outcomeEnvelope.payload?.loserId].includes(effect.actorId)) {
      throw new TypeError('INVALID_SNAPSHOT_EFFECT');
    }
    const expectedEffectSignature = fixtureSeal('immutable-effect-signature/v2', SOURCE_ISSUERS.effect, {
      issuerId: effect.issuerId, npcId: effect.npcId, sourceOrigin: effect.sourceOrigin,
      actorId: effect.actorId, axis: effect.axis, delta: effect.delta, policyVersion: effect.policyVersion,
    });
    if (effect.signature !== expectedEffectSignature) throw new TypeError('INVALID_SNAPSHOT_EFFECT_SIGNATURE');
    const k = JSON.stringify([effect.npcId, effect.actorId, effect.axis]);
    totals.set(k, (totals.get(k) ?? 0) + effect.delta);
  }
  const expected = [...totals].filter(([, value]) => value !== 0).sort(([a], [b]) => a.localeCompare(b));
  const actual = state.relationships.map((r) => [JSON.stringify([r.npcId, r.actorId, r.axis]), r.value])
    .filter(([, value]) => value !== 0).sort(([a], [b]) => a.localeCompare(b));
  if (stableJson(expected) !== stableJson(actual)) throw new TypeError('RELATIONSHIP_LEDGER_MISMATCH');

  const expectedSeal = fixtureSeal(SNAPSHOT_DOMAIN, 'fixture-checksum', unsignedState(state));
  if (state.integritySeal !== expectedSeal) throw new TypeError('SNAPSHOT_INTEGRITY_MISMATCH');
  return state;
}

export function serializeState(state) {
  return JSON.stringify(validateState(state));
}

export function rehydrateState(serialized) {
  if (typeof serialized !== 'string') throw new TypeError('INVALID_SNAPSHOT_BYTES');
  let parsed;
  try { parsed = JSON.parse(serialized); } catch { throw new TypeError('INVALID_SNAPSHOT_JSON'); }
  return validateState(parsed);
}
