// In-memory, JSON-only test harness. No filesystem, browser state, D1 or Worker.
export function emptySnapshot() {
  return { memories: {}, relationships: {}, appliedEffects: {}, originSignatures: {} };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

export function rehydrateSnapshot(json) {
  const value = typeof json === 'string' ? JSON.parse(json) : JSON.parse(JSON.stringify(json));
  const fail = () => { throw new TypeError('invalid synthetic snapshot'); };
  const isString = (v) => typeof v === 'string' && v.length > 0;
  const exactKeys = (obj, keys) => isRecord(obj) && Object.keys(obj).length === keys.length && keys.every((k) => Object.hasOwn(obj, k));
  if (!exactKeys(value, ['memories', 'relationships', 'appliedEffects', 'originSignatures'])) fail();
  for (const container of ['memories', 'relationships', 'appliedEffects', 'originSignatures']) {
    if (!isRecord(value[container])) fail();
  }
  const memoryByIdentity = new Map();
  for (const [npcId, memories] of Object.entries(value.memories)) {
    if (!isString(npcId) || !Array.isArray(memories)) fail();
    for (const memory of memories) {
      if (!exactKeys(memory, ['originKey', 'sourceRef', 'factKind', 'stableActorId', 'authorizedFields', 'sources'])
        || !isString(memory.originKey) || !isRecord(memory.sourceRef)
        || !exactKeys(memory.sourceRef, ['sourceSystem', 'eventId', 'sourceEventVersion'])
        || !['sourceSystem', 'eventId', 'sourceEventVersion'].every((k) => isString(memory.sourceRef[k]))
        || !['verified_outcome', 'verified_utterance', 'unverified_relay'].includes(memory.factKind)
        || !isString(memory.stableActorId) || !isRecord(memory.authorizedFields)
        || !Array.isArray(memory.sources) || memory.sources.length === 0) fail();
      const allowedFields = memory.factKind === 'verified_outcome'
        ? ['finality', 'mechanicalWinnerId', 'mechanicalLoserId', 'allowedSummaryKey']
        : ['allowedSummaryKey', 'claimCode'];
      if (Object.keys(memory.authorizedFields).some((key) => !allowedFields.includes(key))
        || !isString(memory.authorizedFields.allowedSummaryKey)) fail();
      if (memory.factKind === 'verified_outcome') {
        const facts = memory.authorizedFields;
        if (facts.finality !== 'finalized' || !isString(facts.mechanicalWinnerId)
          || !isString(facts.mechanicalLoserId) || facts.mechanicalWinnerId === facts.mechanicalLoserId
          || ![facts.mechanicalWinnerId, facts.mechanicalLoserId].includes(memory.stableActorId)) fail();
      } else if (!isString(memory.authorizedFields.claimCode)) fail();
      let parsedOrigin;
      try { parsedOrigin = JSON.parse(memory.originKey); } catch { fail(); }
      if (!Array.isArray(parsedOrigin) || parsedOrigin.length !== 2
        || parsedOrigin[0] !== memory.sourceRef.sourceSystem || parsedOrigin[1] !== memory.sourceRef.eventId
        || memory.originKey !== JSON.stringify([memory.sourceRef.sourceSystem, memory.sourceRef.eventId])) fail();
      const identity = JSON.stringify([npcId, memory.originKey]);
      if (memoryByIdentity.has(identity)) fail();
      const signature = value.originSignatures[identity];
      let signatureParts;
      try { signatureParts = JSON.parse(signature); } catch { fail(); }
      if (!Array.isArray(signatureParts) || signatureParts.length !== 4
        || signatureParts[0] !== memory.sourceRef.sourceEventVersion
        || signatureParts[1] !== memory.stableActorId || signatureParts[2] !== memory.factKind
        || signatureParts[3] !== canonicalJson(memory.authorizedFields)) fail();
      value.originSignatures[identity] = JSON.stringify(signatureParts);
      memoryByIdentity.set(identity, memory);
      const seenReceiptIds = new Set();
      for (const receipt of memory.sources) {
        if (!exactKeys(receipt, ['sourceKind', 'sourceReceiptId', 'learnedAtServer', 'visibilityPolicyVersion'])
          || !['direct', 'permitted_public_relay'].includes(receipt.sourceKind)
          || !isString(receipt.sourceReceiptId) || !isString(receipt.learnedAtServer)
          || Number.isNaN(Date.parse(receipt.learnedAtServer)) || !isString(receipt.visibilityPolicyVersion)
          || (memory.factKind === 'verified_outcome' && receipt.sourceKind !== 'direct')
          || (memory.factKind === 'unverified_relay' && receipt.sourceKind !== 'permitted_public_relay')) fail();
        if (seenReceiptIds.has(receipt.sourceReceiptId)) fail();
        seenReceiptIds.add(receipt.sourceReceiptId);
      }
    }
  }
  for (const [npcId, actors] of Object.entries(value.relationships)) {
    if (!isString(npcId) || !isRecord(actors)) fail();
    for (const [actorId, axes] of Object.entries(actors)) {
      if (!isString(actorId) || !exactKeys(axes, ['respect', 'sympathy', 'resentment', 'fear'])
        || Object.values(axes).some((v) => !['UP', 'UNCHANGED'].includes(v))) fail();
    }
  }
  for (const [key, effect] of Object.entries(value.appliedEffects)) {
    if (!isString(key) || !exactKeys(effect, ['npcId', 'originKey', 'targetActorId', 'effectKind', 'reasonCode'])
      || !['npcId', 'originKey', 'targetActorId', 'effectKind', 'reasonCode'].every((k) => isString(effect[k]))
      || !['respect', 'sympathy', 'resentment', 'fear'].includes(effect.effectKind)) fail();
    const origin = JSON.stringify([effect.npcId, effect.originKey]);
    if (key !== origin) fail();
    const memory = memoryByIdentity.get(origin);
    if (!memory || memory.factKind !== 'verified_outcome'
      || ![memory.authorizedFields.mechanicalWinnerId, memory.authorizedFields.mechanicalLoserId].includes(effect.targetActorId)
      || !isString(memory.authorizedFields.mechanicalWinnerId) || !isString(memory.authorizedFields.mechanicalLoserId)
      || !isString(effect.reasonCode)) fail();
    const signatureKey = JSON.stringify([effect.npcId, effect.originKey]);
    const signature = value.originSignatures[signatureKey];
    let signatureParts;
    try { signatureParts = JSON.parse(signature); } catch { fail(); }
    if (!Array.isArray(signatureParts) || signatureParts.length !== 4
      || signatureParts[0] !== memory.sourceRef.sourceEventVersion
      || signatureParts[1] !== memory.stableActorId || signatureParts[2] !== memory.factKind) fail();
    const axes = value.relationships[effect.npcId]?.[effect.targetActorId];
    if (!axes || axes[effect.effectKind] !== 'UP') fail();
  }
  for (const [npcId, actors] of Object.entries(value.relationships)) {
    for (const [actorId, axes] of Object.entries(actors)) {
      for (const [axis, direction] of Object.entries(axes)) {
        if (direction === 'UP' && !Object.values(value.appliedEffects).some((effect) =>
          effect.npcId === npcId && effect.targetActorId === actorId && effect.effectKind === axis)) fail();
      }
    }
  }
  for (const [key, signature] of Object.entries(value.originSignatures)) {
    if (!isString(key) || !isString(signature)) fail();
    let parts;
    try { parts = JSON.parse(key); } catch { fail(); }
    if (!Array.isArray(parts) || parts.length !== 2 || !memoryByIdentity.has(key)) fail();
    let signatureParts;
    try { signatureParts = JSON.parse(signature); } catch { fail(); }
    const memory = memoryByIdentity.get(key);
    if (!Array.isArray(signatureParts) || signatureParts.length !== 4
      || signatureParts[0] !== memory.sourceRef.sourceEventVersion
      || signatureParts[1] !== memory.stableActorId || signatureParts[2] !== memory.factKind) fail();
  }
  for (const identity of memoryByIdentity.keys()) if (!Object.hasOwn(value.originSignatures, identity)) fail();
  return value;
}

export function serializeSnapshot(snapshot) {
  return JSON.stringify(rehydrateSnapshot(snapshot));
}
