// Offline proposed 07B wire compatibility. This is NOT a production schema.
import { createHash } from 'node:crypto';
import { types } from 'node:util';

export const TYPES = Object.freeze(['VERIFIED_OUTCOME', 'VERIFIED_UTTERANCE', 'HEARD_CLAIM']);
export const WIRE_KINDS = Object.freeze({
  VERIFIED_OUTCOME: 'VERIFIED_FACT',
  VERIFIED_UTTERANCE: 'VERIFIED_UTTERANCE',
  HEARD_CLAIM: 'HEARD_CLAIM',
});
export const FIELDS = Object.freeze({
  VERIFIED_OUTCOME: 'public_outcome',
  VERIFIED_UTTERANCE: 'public_utterance',
  HEARD_CLAIM: 'public_claim',
});
export const validId = s => typeof s === 'string' && /^fixture-v2:[a-z0-9][a-z0-9:._-]{0,127}$/i.test(s);

export function snapshot(value, visiting = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw Error('NON_CANONICAL_NUMBER');
    return value;
  }
  if (typeof value !== 'object' || types.isProxy(value) || visiting.has(value)) throw Error('UNSAFE_DATA');
  const plain = Array.isArray(value) ? Array.prototype : Object.prototype;
  if (Object.getPrototypeOf(value) !== plain && Object.getPrototypeOf(value) !== null) throw Error('UNSAFE_PROTOTYPE');
  visiting.add(value);
  try {
    if (Array.isArray(value)) {
      const fields = Reflect.ownKeys(value).filter(k => k !== 'length');
      if (fields.length !== value.length || fields.some((k, i) => k !== String(i))) throw Error('SPARSE_ARRAY');
      return fields.map(k => {
        const d = Object.getOwnPropertyDescriptor(value, k);
        if (!d || !d.enumerable || !Object.hasOwn(d, 'value')) throw Error('UNSAFE_DESCRIPTOR');
        return snapshot(d.value, visiting);
      });
    }
    const output = Object.create(null);
    for (const k of Reflect.ownKeys(value)) {
      if (typeof k !== 'string' || k === '__proto__' || k === 'constructor') throw Error('UNSAFE_KEY');
      const d = Object.getOwnPropertyDescriptor(value, k);
      if (!d || !d.enumerable || !Object.hasOwn(d, 'value')) throw Error('UNSAFE_DESCRIPTOR');
      output[k] = snapshot(d.value, visiting);
    }
    return output;
  } finally { visiting.delete(value); }
}

export function canonical(value) {
  const v = snapshot(value);
  function encode(x) {
    if (x === null || typeof x !== 'object') return JSON.stringify(x);
    if (Array.isArray(x)) return `[${x.map(encode).join(',')}]`;
    return `{${Object.keys(x).sort().map(k => `${JSON.stringify(k)}:${encode(x[k])}`).join(',')}}`;
  }
  return encode(v);
}
export const digest = value => createHash('sha256').update(canonical(value)).digest('hex');
export const sourceRefValid = ref => !!ref && typeof ref === 'object'
  && Object.keys(ref).sort().join(',') === 'canonicalSourceEventId,sourceEventVersion,sourceSystem'
  && validId(ref.sourceSystem) && validId(ref.canonicalSourceEventId) && validId(ref.sourceEventVersion);

// Exact 08A V125 proposed wire literals: event-origin/v1; npc-knowledge/v2;
// npc-relationship-effect/v1. VERIFIED_FACT is 07B's name for 08A VERIFIED_OUTCOME.
export function buildKeys({ npcId, recipientId, sourceRef, kind, relayReceiptId = null }) {
  if (!validId(npcId) || npcId !== recipientId || !sourceRefValid(sourceRef) || !TYPES.includes(kind)) throw Error('BAD_KEY_INPUT');
  if ((kind === 'HEARD_CLAIM') !== (relayReceiptId !== null) || (relayReceiptId !== null && !validId(relayReceiptId))) throw Error('BAD_RELAY_KEY');
  const { sourceSystem, canonicalSourceEventId: eventId } = sourceRef;
  const sourceOriginKey = JSON.stringify(['event-origin/v1', sourceSystem, eventId]);
  const wireKind = WIRE_KINDS[kind];
  const knowledgeKey = JSON.stringify(['npc-knowledge/v2', npcId, recipientId, sourceSystem, eventId, wireKind, relayReceiptId]);
  const v125CandidateEffectKey = JSON.stringify(['npc-relationship-effect/v1', npcId, sourceSystem, eventId, 'verified_outcome']);
  return Object.freeze({ sourceOriginKey, knowledgeKey, wireKind,
    effectKey: kind === 'VERIFIED_OUTCOME' ? v125CandidateEffectKey : null,
    v125CandidateEffectKey });
}
