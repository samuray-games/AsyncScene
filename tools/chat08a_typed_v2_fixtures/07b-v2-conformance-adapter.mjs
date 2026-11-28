// Offline candidate adapter for the proposed 07B V2 key wire.
// It is intentionally separate from V123 and does not migrate or rewrite V123 data.
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { types as utilTypes } from 'node:util';
import { copyJsonData, fixtureId, isRecord, stableJson } from './keys.mjs';

export const PROPOSED_07B_V2_KINDS = Object.freeze([
  'VERIFIED_FACT',
  'HEARD_CLAIM',
  'VERIFIED_UTTERANCE',
]);

const RESULT = Object.freeze({
  NEW: 'NEW_KNOWLEDGE',
  REPLAY: 'IDEMPOTENT_REPLAY',
  DENIED: 'DENIED',
  CONFLICT: 'CONFLICT_QUARANTINE',
});

const validId = (value) => fixtureId(value);
const signature = (value) => stableJson(value);
const digest = (value) => createHash('sha256').update(signature(value)).digest('hex');
const copy = (value) => copyJsonData(value);
const byKey = (items, key, value) => items.find((item) => item[key] === value);
const result = (status, reason, state) => ({ status, reason, state });
const snapshotAuthorities = new WeakMap();

function sourceRefValid(ref) {
  return isRecord(ref)
    && Object.keys(ref).sort().join(',') === 'canonicalSourceEventId,sourceEventVersion,sourceSystem'
    && validId(ref.sourceSystem)
    && validId(ref.canonicalSourceEventId)
    && validId(ref.sourceEventVersion);
}

function expectedReceiptFields(receipt) {
  return isRecord(receipt)
    && Object.keys(receipt).sort().join(',') === 'claimDigest,deliveredAt,eventId,receiptId,recipientId,sourceEventVersion,sourceSystem,speakerId'
    && validId(receipt.receiptId)
    && validId(receipt.sourceSystem)
    && validId(receipt.eventId)
    && validId(receipt.sourceEventVersion)
    && validId(receipt.recipientId)
    && validId(receipt.speakerId)
    && validId(receipt.deliveredAt)
    && typeof receipt.claimDigest === 'string'
    && /^[a-f0-9]{64}$/.test(receipt.claimDigest);
}

/** Exact proposed JSON-array formats from Chat07B Key Reconciliation V2. */
export function buildProposed07bV2Keys(input) {
  if (!isRecord(input) || !validId(input.npcId) || !validId(input.recipientId)
    || !sourceRefValid(input.sourceRef) || !PROPOSED_07B_V2_KINDS.includes(input.knowledgeKind)) {
    throw new TypeError('INVALID_07B_V2_KEY_INPUT');
  }
  if (input.recipientId !== input.npcId) throw new TypeError('RECIPIENT_NPC_BINDING_MISMATCH');

  const { sourceSystem, canonicalSourceEventId } = input.sourceRef;
  const relayKey = input.knowledgeKind === 'HEARD_CLAIM'
    ? input.relayReceiptId
    : null;
  if (input.knowledgeKind === 'HEARD_CLAIM' && !validId(relayKey)) {
    throw new TypeError('TRUSTED_RELAY_RECEIPT_REQUIRED');
  }
  if (input.knowledgeKind !== 'HEARD_CLAIM' && input.relayReceiptId != null) {
    throw new TypeError('RELAY_RECEIPT_FOR_NON_CLAIM');
  }

  return Object.freeze({
    sourceOriginKey: JSON.stringify(['event-origin/v1', sourceSystem, canonicalSourceEventId]),
    knowledgeKey: JSON.stringify([
      'npc-knowledge/v2', input.npcId, input.recipientId, sourceSystem,
      canonicalSourceEventId, input.knowledgeKind, relayKey,
    ]),
    effectKey: JSON.stringify([
      'npc-relationship-effect/v1', input.npcId, sourceSystem,
      canonicalSourceEventId, 'verified_outcome',
    ]),
  });
}

export function mockDeliveryIntentBindingForTest(intent) {
  return {
    npcId: intent.npcId,
    recipientId: intent.recipientId,
    sourceRef: intent.sourceRef,
    knowledgeKind: intent.knowledgeKind,
    source: intent.source ?? null,
    sourceReceiptId: intent.sourceReceiptId ?? null,
    utterance: intent.utterance ?? null,
    claim: intent.claim ?? null,
    relayReceipt: intent.relayReceipt ?? null,
    relayReceiptId: intent.relayReceiptId ?? null,
    grantBinding: intent.mockGrantBinding,
  };
}

/**
 * Synthetic test-only policy issuer. Opaque ticket identity prevents a string alias
 * from authorizing a final. These tickets and mock grants are not 05C/07B authority.
 * The per-run snapshot MAC detects test snapshot edits but is neither persisted nor
 * a production anti-rollback, grant, or source-proof mechanism.
 */
export function createSynthetic07bTestPolicies() {
  const finalTickets = new WeakMap();
  const utteranceTickets = new WeakMap();
  const effectTickets = new WeakMap();
  const mockGrantTickets = new WeakMap();
  const deliveryIntentTickets = new WeakMap();
  const relayReceipts = new Map();
  const currentMockGrants = new Map();
  const snapshotMacKey = randomBytes(32);
  const ticket = () => Object.freeze(Object.create(null));
  const snapshotMac = (body) => createHmac('sha256', snapshotMacKey).update(signature(body)).digest('hex');

  const policies = {
    issueTrustedFinalTestTicket(sourceRef, source, sourceReceiptId) {
      if (!sourceRefValid(sourceRef) || !isRecord(source)
        || Object.keys(source).sort().join(',') !== 'finality,outcomeCode,proofDigest'
        || source.finality !== 'FINAL' || !validId(source.outcomeCode)
        || typeof source.proofDigest !== 'string'
        || !/^[a-f0-9]{64}$/.test(source.proofDigest) || !validId(sourceReceiptId)) {
        throw new TypeError('TEST_POLICY_REJECTED_UNVERIFIED_FINAL');
      }
      const value = ticket();
      finalTickets.set(value, signature({ sourceRef, source, sourceReceiptId }));
      return value;
    },
    authorizeVerifiedFactTestTicket(value, sourceRef, source, sourceReceiptId) {
      return isRecord(source) && finalTickets.get(value) === signature({ sourceRef, source, sourceReceiptId });
    },
    issueTrustedUtteranceTestTicket(sourceRef, utterance) {
      if (!sourceRefValid(sourceRef) || !isRecord(utterance)
        || Object.keys(utterance).sort().join(',') !== 'authorId,channel,utteranceCode'
        || utterance.channel !== 'PUBLIC' || !validId(utterance.authorId)
        || !validId(utterance.utteranceCode)) {
        throw new TypeError('TEST_POLICY_REJECTED_UNVERIFIED_UTTERANCE');
      }
      const value = ticket();
      utteranceTickets.set(value, signature({ sourceRef, utterance }));
      return value;
    },
    authorizeUtteranceTestTicket(value, sourceRef, utterance) {
      return isRecord(utterance) && utteranceTickets.get(value) === signature({ sourceRef, utterance });
    },
    issueRelationshipEffectTestTicket(npcId, sourceRef, source, effect) {
      const value = ticket();
      effectTickets.set(value, signature({ npcId, sourceRef, resultDigest: digest({ sourceRef, source }), effect }));
      return value;
    },
    authorizeRelationshipEffectTestTicket(value, npcId, sourceRef, source, effect) {
      return isRecord(effect) && effectTickets.get(value)
        === signature({ npcId, sourceRef, resultDigest: digest({ sourceRef, source }), effect });
    },
    issueMockGrantTestToken(grant) {
      const value = ticket();
      mockGrantTickets.set(value, signature(grant));
      return value;
    },
    authorizeMockGrantTestToken(value, grant) {
      if (!isRecord(grant)) return false;
      const { grantKey: _key, ...binding } = grant;
      return binding.active === true
        && mockGrantTickets.get(value) === signature(binding)
        && currentMockGrants.get(grantKey(binding.npcId, binding.recipientId))?.signature === signature(binding);
    },
    recordCurrentMockGrantForTest(grant) {
      if (!isRecord(grant)) throw new TypeError('INVALID_MOCK_GRANT_FOR_TEST');
      const { grantKey: _key, ...binding } = grant;
      const key = grantKey(binding.npcId, binding.recipientId);
      const prior = currentMockGrants.get(key)?.binding;
      const validInitial = !prior && binding.active === true
        && binding.generation === 1 && binding.accessEpoch === 1;
      const validRevoke = prior?.active === true && binding.active === false
        && binding.grantId === prior.grantId
        && binding.generation === prior.generation
        && binding.accessEpoch === prior.accessEpoch + 1;
      const validRegrant = prior?.active === false && binding.active === true
        && binding.generation === prior.generation + 1
        && binding.accessEpoch > prior.accessEpoch;
      if (!validInitial && !validRevoke && !validRegrant) {
        throw new TypeError('MOCK_GRANT_EXTERNAL_FENCE_REJECTED');
      }
      currentMockGrants.set(key, { binding: copy(binding), signature: signature(binding) });
    },
    issueMockDeliveryIntentTestTicket(binding) {
      const value = ticket();
      deliveryIntentTickets.set(value, signature(binding));
      return value;
    },
    authorizeMockDeliveryIntentTestTicket(value, binding) {
      return deliveryIntentTickets.get(value) === signature(binding);
    },
    registerTrustedRelayReceiptForTest(receipt) {
      const safe = copy(receipt);
      if (!expectedReceiptFields(safe)) throw new TypeError('INVALID_TEST_RELAY_RECEIPT');
      const prior = relayReceipts.get(safe.receiptId);
      const value = signature(safe);
      if (prior && prior !== value) throw new TypeError('TEST_RELAY_RECEIPT_ID_REUSE');
      relayReceipts.set(safe.receiptId, value);
      return safe;
    },
    hasTrustedRelayReceiptIdForTest(receiptId) {
      return relayReceipts.has(receiptId);
    },
    expectedRelayReceiptSignatureForTest(receiptId) {
      return relayReceipts.get(receiptId) ?? null;
    },
  };
  snapshotAuthorities.set(policies, {
    seal: snapshotMac,
    verify(body, mac) { return typeof mac === 'string' && snapshotMac(body) === mac; },
  });
  return Object.freeze(policies);
}

export function emptyProposed07bV2State(testPolicies) {
  if (!isRecord(testPolicies) || !snapshotAuthorities.has(testPolicies)) {
    throw new TypeError('SYNTHETIC_TEST_POLICY_REQUIRED_FOR_SNAPSHOT');
  }
  return sealState({
    format: 'chat08a-07b-v2-candidate-fixture',
    currentGrants: [],
    sourceSignatures: [],
    verifiedFinalSignatures: [],
    knowledge: [],
    receiptIndex: [],
    effects: [],
    relationships: [],
    quarantines: [],
  }, testPolicies);
}

function safeState(state, testPolicies) {
  const safe = copy(state);
  if (!isRecord(safe) || Object.keys(safe).sort().join(',')
    !== 'currentGrants,effects,format,knowledge,quarantines,receiptIndex,relationships,snapshotMac,sourceSignatures,verifiedFinalSignatures'
    || safe.format !== 'chat08a-07b-v2-candidate-fixture') throw new TypeError('INVALID_CANDIDATE_STATE');
  const { snapshotMac: mac, ...body } = safe;
  const authority = snapshotAuthorities.get(testPolicies);
  if (!authority?.verify(body, mac)) throw new TypeError('INVALID_CANDIDATE_STATE');
  for (const key of ['currentGrants', 'sourceSignatures', 'verifiedFinalSignatures', 'knowledge', 'receiptIndex', 'effects', 'relationships', 'quarantines']) {
    if (!Array.isArray(safe[key])) throw new TypeError('INVALID_CANDIDATE_STATE');
  }
  return safe;
}

function sealState(state, testPolicies) {
  const { snapshotMac: _prior, ...body } = state;
  const authority = snapshotAuthorities.get(testPolicies);
  if (!authority) throw new TypeError('SYNTHETIC_SNAPSHOT_AUTHORITY_REQUIRED');
  return { ...body, snapshotMac: authority.seal(body) };
}

function grantKey(npcId, recipientId) {
  return JSON.stringify(['npc-recipient-grant/v1', npcId, recipientId]);
}

function quarantine(inputState, reason, testPolicies, keys = null) {
  const state = safeState(inputState, testPolicies);
  state.quarantines.push({
    reason,
    sourceOriginKey: keys?.sourceOriginKey ?? null,
    knowledgeKey: keys?.knowledgeKey ?? null,
  });
  return result(RESULT.CONFLICT, reason, sealState(state, testPolicies));
}

export function createProposed07bV2CandidateAdapter(testPolicies) {
  if (!isRecord(testPolicies)
    || typeof testPolicies.authorizeVerifiedFactTestTicket !== 'function'
    || typeof testPolicies.authorizeUtteranceTestTicket !== 'function'
    || typeof testPolicies.authorizeRelationshipEffectTestTicket !== 'function'
    || typeof testPolicies.authorizeMockGrantTestToken !== 'function'
    || typeof testPolicies.authorizeMockDeliveryIntentTestTicket !== 'function'
    || typeof testPolicies.recordCurrentMockGrantForTest !== 'function'
    || typeof testPolicies.hasTrustedRelayReceiptIdForTest !== 'function'
    || typeof testPolicies.expectedRelayReceiptSignatureForTest !== 'function') {
    throw new TypeError('EXPLICIT_SYNTHETIC_TEST_POLICIES_REQUIRED');
  }

  function installMockGrantForTest(inputState, grant) {
    const state = safeState(inputState, testPolicies);
    const safe = copy(grant);
    if (!isRecord(safe) || !validId(safe.npcId) || !validId(safe.recipientId)
      || safe.npcId !== safe.recipientId || !validId(safe.grantId)
      || !Number.isSafeInteger(safe.generation) || safe.generation < 1
      || !Number.isSafeInteger(safe.accessEpoch) || safe.accessEpoch < 1
      || safe.active !== true) throw new TypeError('INVALID_MOCK_GRANT_FOR_TEST');
    const key = grantKey(safe.npcId, safe.recipientId);
    const existing = byKey(state.currentGrants, 'grantKey', key);
    if (existing?.active) throw new TypeError('MOCK_GRANT_ALREADY_ACTIVE');
    if (existing && (safe.generation !== existing.generation + 1 || safe.accessEpoch <= existing.accessEpoch)) {
      throw new TypeError('MOCK_GRANT_EPOCH_NOT_ADVANCED');
    }
    const current = { ...safe, grantKey: key };
    if (existing) state.currentGrants[state.currentGrants.indexOf(existing)] = current;
    else state.currentGrants.push(current);
    testPolicies.recordCurrentMockGrantForTest(current);
    return sealState(state, testPolicies);
  }

  function revokeMockGrantForTest(inputState, npcId, recipientId) {
    const state = safeState(inputState, testPolicies);
    const current = byKey(state.currentGrants, 'grantKey', grantKey(npcId, recipientId));
    if (!current?.active) return state;
    current.active = false;
    current.accessEpoch += 1;
    testPolicies.recordCurrentMockGrantForTest(current);
    return sealState(state, testPolicies);
  }

  function commit(inputState, rawIntent) {
    const original = rawIntent;
    let trustedSourceTestTicket, trustedUtteranceTestTicket;
    let relationshipEffectTestTicket, mockGrantTestToken, mockDeliveryIntentTestTicket;
    let jsonIntent;
    let state, intent;
    try {
      if (utilTypes.isProxy(original)) throw new TypeError('INVALID_INTENT_PROXY');
      if (!isRecord(original)) throw new TypeError('INVALID_INTENT');
      const descriptors = Object.getOwnPropertyDescriptors(original);
      const ticketFields = new Set([
        'trustedSourceTestTicket', 'trustedUtteranceTestTicket',
        'relationshipEffectTestTicket', 'mockGrantTestToken', 'mockDeliveryIntentTestTicket',
      ]);
      jsonIntent = {};
      for (const key of Reflect.ownKeys(descriptors)) {
        if (typeof key !== 'string') throw new TypeError('INVALID_INTENT_KEY');
        const descriptor = descriptors[key];
        if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
          throw new TypeError('INVALID_INTENT_DESCRIPTOR');
        }
        if (ticketFields.has(key)) {
          if (key === 'trustedSourceTestTicket') trustedSourceTestTicket = descriptor.value;
          else if (key === 'trustedUtteranceTestTicket') trustedUtteranceTestTicket = descriptor.value;
          else if (key === 'relationshipEffectTestTicket') relationshipEffectTestTicket = descriptor.value;
          else if (key === 'mockGrantTestToken') mockGrantTestToken = descriptor.value;
          else mockDeliveryIntentTestTicket = descriptor.value;
        } else {
          jsonIntent[key] = descriptor.value;
        }
      }
      state = safeState(inputState, testPolicies);
      intent = copy(jsonIntent);
    } catch {
      return result(RESULT.DENIED, 'INVALID_JSON_DATA', inputState);
    }

    if (!isRecord(intent) || !validId(intent.npcId) || !validId(intent.recipientId)
      || intent.npcId !== intent.recipientId) {
      return result(RESULT.DENIED, 'RECIPIENT_NPC_BINDING_MISMATCH', inputState);
    }
    if (!sourceRefValid(intent.sourceRef) || !PROPOSED_07B_V2_KINDS.includes(intent.knowledgeKind)) {
      return result(RESULT.DENIED, 'INVALID_SOURCE_OR_KNOWLEDGE_KIND', inputState);
    }

    let keys;
    try {
      keys = buildProposed07bV2Keys({
        npcId: intent.npcId,
        recipientId: intent.recipientId,
        sourceRef: intent.sourceRef,
        knowledgeKind: intent.knowledgeKind,
        relayReceiptId: intent.relayReceiptId,
      });
    } catch (error) {
      return result(RESULT.DENIED, error.message, inputState);
    }

    const currentGrant = byKey(state.currentGrants, 'grantKey', grantKey(intent.npcId, intent.recipientId));
    const capturedGrant = intent.mockGrantBinding;
    if (!isRecord(capturedGrant)
      || Object.keys(capturedGrant).sort().join(',') !== 'accessEpoch,generation,grantId'
      || !validId(capturedGrant.grantId)
      || !Number.isSafeInteger(capturedGrant.generation)
      || !Number.isSafeInteger(capturedGrant.accessEpoch)
      || !testPolicies.authorizeMockDeliveryIntentTestTicket(mockDeliveryIntentTestTicket,
        mockDeliveryIntentBindingForTest(intent))) {
      return result(RESULT.DENIED, 'INVALID_OR_STALE_CAPTURED_INTENT', inputState);
    }
    if (!currentGrant?.active || currentGrant.accessEpoch < 1
      || capturedGrant.grantId !== currentGrant.grantId
      || capturedGrant.generation !== currentGrant.generation
      || capturedGrant.accessEpoch !== currentGrant.accessEpoch
      || !testPolicies.authorizeMockGrantTestToken(mockGrantTestToken, currentGrant)) {
      return result(RESULT.DENIED, 'MOCK_GRANT_INACTIVE_OR_STALE', inputState);
    }

    let factKind;
    if (intent.knowledgeKind === 'VERIFIED_FACT') {
      if (!isRecord(intent.source) || !validId(intent.sourceReceiptId)
        || !testPolicies.authorizeVerifiedFactTestTicket(trustedSourceTestTicket, intent.sourceRef,
          intent.source, intent.sourceReceiptId)) {
        return result(RESULT.DENIED, 'VERIFIED_FACT_REQUIRES_EXPLICIT_TRUSTED_TEST_POLICY', inputState);
      }
      factKind = 'verified_outcome';
    } else if (intent.knowledgeKind === 'VERIFIED_UTTERANCE') {
      if (!isRecord(intent.utterance)
        || !testPolicies.authorizeUtteranceTestTicket(trustedUtteranceTestTicket, intent.sourceRef, intent.utterance)) {
        return result(RESULT.DENIED, 'VERIFIED_UTTERANCE_TEST_PROOF_REQUIRED', inputState);
      }
      factKind = 'verified_utterance';
    } else {
      if (Object.hasOwn(intent, 'source') || !isRecord(intent.claim)
        || !validId(intent.claim.claimCode) || !expectedReceiptFields(intent.relayReceipt)) {
        return result(RESULT.DENIED, 'INVALID_HEARD_CLAIM_OR_RELAY_RECEIPT', inputState);
      }
      if (intent.relayReceipt.receiptId !== intent.relayReceiptId
        || !testPolicies.hasTrustedRelayReceiptIdForTest(intent.relayReceipt.receiptId)) {
        return result(RESULT.DENIED, 'UNTRUSTED_RELAY_RECEIPT_ID', inputState);
      }
      const expectedReceiptSignature = testPolicies.expectedRelayReceiptSignatureForTest(intent.relayReceipt.receiptId);
      if (expectedReceiptSignature !== signature(intent.relayReceipt)) {
        return quarantine(inputState, 'IMMUTABLE_RELAY_RECEIPT_CONFLICT', testPolicies, keys);
      }
      if (intent.relayReceipt.sourceSystem !== intent.sourceRef.sourceSystem
        || intent.relayReceipt.eventId !== intent.sourceRef.canonicalSourceEventId
        || intent.relayReceipt.sourceEventVersion !== intent.sourceRef.sourceEventVersion
        || intent.relayReceipt.recipientId !== intent.recipientId) {
        return result(RESULT.DENIED, 'RELAY_RECEIPT_BINDING_MISMATCH', inputState);
      }
      if (intent.relayReceipt.speakerId !== intent.claim.speakerId
        || intent.relayReceipt.claimDigest !== digest(intent.claim)) {
        return quarantine(inputState, 'IMMUTABLE_RELAY_CLAIM_CONFLICT', testPolicies, keys);
      }
      factKind = 'unverified_relay';
    }

    const sourceSignature = signature(intent.sourceRef);
    const knownSource = byKey(state.sourceSignatures, 'sourceOriginKey', keys.sourceOriginKey);
    if (knownSource && knownSource.signature !== sourceSignature) {
      return quarantine(inputState, 'IMMUTABLE_SOURCE_VERSION_CONFLICT', testPolicies, keys);
    }

    const incomingFinalSignature = factKind === 'verified_outcome'
      ? signature({ sourceRef: intent.sourceRef, source: intent.source, sourceReceiptId: intent.sourceReceiptId })
      : null;
    const knownFinal = byKey(state.verifiedFinalSignatures, 'sourceOriginKey', keys.sourceOriginKey);
    if (incomingFinalSignature !== null && knownFinal && knownFinal.signature !== incomingFinalSignature) {
      return quarantine(inputState, 'IMMUTABLE_VERIFIED_FINAL_CONFLICT', testPolicies, keys);
    }

    const relayReceiptSignature = intent.knowledgeKind === 'HEARD_CLAIM'
      ? signature(intent.relayReceipt)
      : null;
    if (relayReceiptSignature !== null
      && testPolicies.expectedRelayReceiptSignatureForTest(intent.relayReceipt.receiptId) !== relayReceiptSignature) {
      return quarantine(inputState, 'IMMUTABLE_RELAY_RECEIPT_CONFLICT', testPolicies, keys);
    }

    const payload = intent.knowledgeKind === 'HEARD_CLAIM'
      ? { claim: intent.claim }
      : intent.knowledgeKind === 'VERIFIED_UTTERANCE'
        ? { utterance: intent.utterance }
        : { source: intent.source };
    const knowledgeSignature = signature({
      sourceRef: intent.sourceRef,
      recipientId: intent.recipientId,
      knowledgeKind: intent.knowledgeKind,
      factKind,
      payload,
      sourceReceiptId: intent.sourceReceiptId ?? null,
      relayReceiptSignature,
      relationshipEffectSignature: intent.relationshipEffect == null
        ? null
        : signature(intent.relationshipEffect),
    });

    const reusedReceipt = relayReceiptSignature !== null
      ? byKey(state.receiptIndex, 'receiptId', intent.relayReceipt.receiptId)
      : null;
    if (reusedReceipt && (reusedReceipt.knowledgeKey !== keys.knowledgeKey
      || reusedReceipt.signature !== relayReceiptSignature)) {
      return quarantine(inputState, 'RELAY_RECEIPT_ID_REUSE', testPolicies, keys);
    }

    const existing = byKey(state.knowledge, 'knowledgeKey', keys.knowledgeKey);
    if (existing) {
      if (existing.signature !== knowledgeSignature) {
        return quarantine(inputState, 'IMMUTABLE_KNOWLEDGE_SIGNATURE_CONFLICT', testPolicies, keys);
      }
      const effectProblem = checkOrApplyEffect(state, intent, keys, factKind,
        relationshipEffectTestTicket, testPolicies, false);
      if (effectProblem) return quarantine(inputState, effectProblem, testPolicies, keys);
      return result(RESULT.REPLAY, 'EXACT_KNOWLEDGE_ALREADY_COMMITTED', inputState);
    }

    if (relayReceiptSignature !== null && reusedReceipt) {
      return quarantine(inputState, 'RELAY_RECEIPT_ALREADY_BOUND', testPolicies, keys);
    }

    const next = copy(state);
    if (!byKey(next.sourceSignatures, 'sourceOriginKey', keys.sourceOriginKey)) {
      next.sourceSignatures.push({ sourceOriginKey: keys.sourceOriginKey, signature: sourceSignature });
    }
    if (incomingFinalSignature !== null
      && !next.verifiedFinalSignatures.some((s) => s.sourceOriginKey === keys.sourceOriginKey)) {
      next.verifiedFinalSignatures.push({ sourceOriginKey: keys.sourceOriginKey, signature: incomingFinalSignature });
    }
    next.knowledge.push({
      sourceOriginKey: keys.sourceOriginKey,
      knowledgeKey: keys.knowledgeKey,
      effectKey: factKind === 'verified_outcome' ? keys.effectKey : null,
      npcId: intent.npcId,
      recipientId: intent.recipientId,
      knowledgeKind: intent.knowledgeKind,
      factKind,
      sourceRef: copy(intent.sourceRef),
      signature: knowledgeSignature,
      relationshipEffectSignature: intent.relationshipEffect == null
        ? null
        : signature(intent.relationshipEffect),
      relayReceiptId: intent.knowledgeKind === 'HEARD_CLAIM' ? intent.relayReceipt.receiptId : null,
      firstLearnedAt: intent.learnedAtServer ?? null,
      provenance: intent.knowledgeKind === 'HEARD_CLAIM'
        ? [{ relayReceiptId: intent.relayReceipt.receiptId, signature: relayReceiptSignature }]
        : [{ sourceReceiptId: intent.sourceReceiptId ?? null }],
    });
    if (relayReceiptSignature !== null) {
      next.receiptIndex.push({ receiptId: intent.relayReceipt.receiptId,
        knowledgeKey: keys.knowledgeKey, signature: relayReceiptSignature });
    }
    const effectProblem = checkOrApplyEffect(next, intent, keys, factKind,
      relationshipEffectTestTicket, testPolicies, true);
    if (effectProblem) return quarantine(inputState, effectProblem, testPolicies, keys);
    return result(RESULT.NEW, 'NEW_TYPED_KNOWLEDGE', sealState(next, testPolicies));
  }

  return Object.freeze({
    installMockGrantForTest,
    revokeMockGrantForTest,
    commit,
    reload(state) { return safeState(state, testPolicies); },
  });
}

function checkOrApplyEffect(state, intent, keys, factKind, effectTicket, policies, apply) {
  if (factKind !== 'verified_outcome' || intent.knowledgeKind !== 'VERIFIED_FACT') {
    return intent.relationshipEffect == null ? null : 'EFFECT_FOR_NON_OUTCOME_KNOWLEDGE';
  }
  if (intent.relationshipEffect == null) return null;
  const effect = intent.relationshipEffect;
  if (!isRecord(effect) || !validId(effect.actorId)
    || Object.keys(effect).sort().join(',') !== 'actorId,axis,delta,policyVersion,reasonCode,resultDigest'
    || !['respect', 'sympathy', 'resentment', 'fear'].includes(effect.axis)
    || !Number.isSafeInteger(effect.delta) || Math.abs(effect.delta) !== 1
    || !validId(effect.reasonCode) || !validId(effect.policyVersion)
    || effect.resultDigest !== digest({ sourceRef: intent.sourceRef, source: intent.source })
    || !policies.authorizeRelationshipEffectTestTicket(effectTicket, intent.npcId,
      intent.sourceRef, intent.source, effect)) {
    return 'OUTCOME_EFFECT_REQUIRES_EXPLICIT_TEST_POLICY';
  }
  const effectSignature = signature({
    npcId: intent.npcId, sourceOriginKey: keys.sourceOriginKey,
    effectKey: keys.effectKey, actorId: effect.actorId, axis: effect.axis,
    delta: effect.delta, reasonCode: effect.reasonCode, policyVersion: effect.policyVersion,
    resultDigest: effect.resultDigest,
  });
  const prior = byKey(state.effects, 'effectKey', keys.effectKey);
  if (prior) return prior.signature === effectSignature ? null : 'IMMUTABLE_EFFECT_SIGNATURE_CONFLICT';
  if (!apply) return null;
  state.effects.push({ ...copy(effect), effectKey: keys.effectKey, signature: effectSignature });
  const relationKey = JSON.stringify(['relationship/v1', intent.npcId, effect.actorId, effect.axis]);
  let relation = byKey(state.relationships, 'relationshipKey', relationKey);
  if (!relation) {
    relation = { relationshipKey: relationKey, npcId: intent.npcId,
      actorId: effect.actorId, axis: effect.axis, value: 0 };
    state.relationships.push(relation);
  }
  relation.value += effect.delta;
  return null;
}
