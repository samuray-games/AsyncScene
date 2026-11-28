// Offline V2 key contract. This module does not authorize runtime writes.
export const KNOWLEDGE_KINDS = Object.freeze([
  'VERIFIED_OUTCOME',
  'VERIFIED_UTTERANCE',
  'HEARD_CLAIM',
]);

export const SOURCE_ISSUERS = Object.freeze({
  final: 'fixture-issuer:05c-final',
  utterance: 'fixture-issuer:public-utterance',
  grant: 'fixture-issuer:07b-grant',
  relay: 'fixture-issuer:07b-relay',
  effect: 'fixture-issuer:08a-policy',
});

export function fixtureId(value) {
  return typeof value === 'string' && /^fixture-v2:[a-z0-9][a-z0-9:._-]{0,127}$/i.test(value);
}

export function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

export function copyJsonData(value, active = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw new TypeError('NON_CANONICAL_NUMBER');
    return value;
  }
  if (typeof value !== 'object' || value === null) throw new TypeError('NON_JSON_DATA');
  if (nodeTypes.isProxy(value)) throw new TypeError('PROXY_JSON_DATA');
  if (active.has(value)) throw new TypeError('CYCLIC_JSON_DATA');
  active.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) throw new TypeError('NON_PLAIN_ARRAY');
      const ownKeys = Reflect.ownKeys(value).filter((key) => key !== 'length');
      if (ownKeys.length !== value.length || ownKeys.some((key, index) => key !== String(index))) throw new TypeError('NON_DENSE_ARRAY');
      const descriptors = Object.getOwnPropertyDescriptors(value), copy = [];
      for (let i = 0; i < value.length; i += 1) {
        const descriptor = descriptors[String(i)];
        if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new TypeError('ACCESSOR_OR_HIDDEN_ARRAY_ITEM');
        copy.push(copyJsonData(descriptor.value, active));
      }
      return copy;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new TypeError('NON_PLAIN_OBJECT');
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== 'string')) throw new TypeError('SYMBOL_KEY_NOT_JSON');
    const descriptors = Object.getOwnPropertyDescriptors(value), copy = {};
    for (const key of ownKeys) {
      const descriptor = descriptors[key];
      if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new TypeError('ACCESSOR_OR_HIDDEN_OBJECT_FIELD');
      Object.defineProperty(copy, key, { value: copyJsonData(descriptor.value, active), enumerable: true, writable: true, configurable: true });
    }
    return copy;
  } finally {
    active.delete(value);
  }
}

export function stableJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw new TypeError('NON_CANONICAL_NUMBER');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length !== value.length || keys.some((key, i) => key !== String(i))) throw new TypeError('NON_DENSE_ARRAY');
    const items = [];
    for (let i = 0; i < value.length; i += 1) {
      if (!Object.hasOwn(value, i)) throw new TypeError('NON_DENSE_ARRAY');
      items.push(stableJson(value[i]));
    }
    return `[${items.join(',')}]`;
  }
  if (!isRecord(value)) throw new TypeError('NON_JSON_RECORD');
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

export function sourceOriginKey(sourceRef) {
  if (!isRecord(sourceRef) || Object.keys(sourceRef).sort().join(',') !== 'eventId,sourceEventVersion,sourceSystem'
    || !fixtureId(sourceRef.sourceSystem) || !fixtureId(sourceRef.eventId) || !fixtureId(sourceRef.sourceEventVersion)) {
    throw new TypeError('INVALID_SOURCE_ORIGIN');
  }
  return JSON.stringify(['source-origin/v2', sourceRef.sourceSystem, sourceRef.eventId]);
}

export function isSourceOriginKey(value) {
  if (typeof value !== 'string') return false;
  try {
    const tuple = JSON.parse(value);
    return Array.isArray(tuple) && tuple.length === 3 && tuple[0] === 'source-origin/v2'
      && fixtureId(tuple[1]) && fixtureId(tuple[2]) && JSON.stringify(tuple) === value;
  } catch { return false; }
}

export function knowledgeKey({ npcId, sourceOrigin, kind, relayReceiptId }) {
  if (!fixtureId(npcId) || !isSourceOriginKey(sourceOrigin) || !KNOWLEDGE_KINDS.includes(kind)) {
    throw new TypeError('INVALID_KNOWLEDGE_KEY_INPUT');
  }
  if (kind === 'HEARD_CLAIM') {
    if (!fixtureId(relayReceiptId)) throw new TypeError('RELAY_RECEIPT_REQUIRED');
    return JSON.stringify(['npc-knowledge/v2', npcId, sourceOrigin, kind, relayReceiptId]);
  }
  return JSON.stringify(['npc-knowledge/v2', npcId, sourceOrigin, kind]);
}

export function effectKey({ npcId, sourceOrigin, kind }) {
  if (kind !== 'VERIFIED_OUTCOME' || !fixtureId(npcId) || !isSourceOriginKey(sourceOrigin)) return null;
  return JSON.stringify(['npc-effect/v2', npcId, sourceOrigin]);
}

export function fixtureSeal(domain, issuerId, value) {
  if (typeof domain !== 'string' || typeof issuerId !== 'string') throw new TypeError('INVALID_FIXTURE_SEAL');
  return `fixture-only:${domain}:${issuerId}:${stableJson(value)}`;
}

export function parseFixtureSeal(signature, domain, issuerId) {
  if (typeof signature !== 'string') return null;
  const prefix = `fixture-only:${domain}:${issuerId}:`;
  if (!signature.startsWith(prefix)) return null;
  const encoded = signature.slice(prefix.length);
  try {
    const value = JSON.parse(encoded);
    return stableJson(value) === encoded ? value : null;
  } catch { return null; }
}
import { types as nodeTypes } from 'node:util';

