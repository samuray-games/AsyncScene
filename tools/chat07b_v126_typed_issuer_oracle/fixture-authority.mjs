// Deliberately synthetic, authoritative registries. No production 05C/08B credentials.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { canonical, digest, snapshot, sourceRefValid, validId } from './wire.mjs';

const keyFor = ref => JSON.stringify([ref.sourceSystem, ref.canonicalSourceEventId]);
const grantKey = recipient => recipient;
const identity = ref => sourceRefValid(ref) && keyFor(ref);
function identical(a, b) { return canonical(a) === canonical(b); }
function requireFields(body, fields) {
  if (!body || typeof body !== 'object' || Object.keys(body).sort().join(',') !== [...fields].sort().join(',')) throw Error('INVALID_RECORD_FIELDS');
}
function asProofId(prefix, number) { return `fixture-v2:${prefix}-${number}`; }

export function createFixtureAuthority() {
  const internal = {
    finals: new Map(), actions: new Map(), relays: new Map(), observations: new Map(),
    grants: new Map(), visibility: new Map(), battleFinals: new Map(),
  };
  const secret = randomBytes(32);
  let counter = 0;
  const seal = state => createHmac('sha256', secret).update(canonical(state)).digest('hex');
  function verifySeal(state, mac) {
    if (typeof mac !== 'string' || !/^[0-9a-f]{64}$/.test(mac)) return false;
    const expected = Buffer.from(seal(state), 'hex'), received = Buffer.from(mac, 'hex');
    return timingSafeEqual(expected, received);
  }
  const getGrant = id => internal.grants.get(grantKey(id));
  const lookup = (map, ref) => map.get(keyFor(ref));
  const nextProof = label => asProofId(label, ++counter);
  function visible(ref) { return internal.visibility.get(keyFor(ref)); }
  function validateGrantFor(recipientId, fieldScope, bound) {
    const current = getGrant(recipientId);
    return !!current && current.active === true && Array.isArray(current.fieldScope)
      && current.fieldScope.includes(fieldScope) && !!bound
      && current.grantId === bound.grantId
      && current.generation === bound.grantGeneration
      && current.accessEpoch === bound.accessEpoch;
  }
  const issuer = Object.freeze({
    grant(recipientId, fieldScope = ['public_outcome', 'public_utterance', 'public_claim']) {
      if (!validId(recipientId) || !Array.isArray(fieldScope) || !fieldScope.length ||
        fieldScope.some(x => !['public_outcome','public_utterance','public_claim'].includes(x)) || getGrant(recipientId)) throw Error('BAD_FIRST_GRANT');
      const g = { recipientId, grantId: nextProof('grant'), generation: 1, accessEpoch: 1,
        fieldScope: [...new Set(fieldScope)], active: true };
      internal.grants.set(grantKey(recipientId), g); return snapshot(g);
    },
    revoke(recipientId) {
      const g = getGrant(recipientId); if (!g?.active) throw Error('NOT_ACTIVE');
      internal.grants.set(grantKey(recipientId), { ...g, active:false, accessEpoch:g.accessEpoch+1 });
      return snapshot(getGrant(recipientId));
    },
    regrant(recipientId, fieldScope = ['public_outcome','public_utterance','public_claim']) {
      const g = getGrant(recipientId);if (!g || g.active) throw Error('NOT_REVOKED');
      const next = { ...g, grantId:nextProof('grant'),generation:g.generation+1,accessEpoch:g.accessEpoch+1,
        fieldScope:[...new Set(fieldScope)], active:true };
      internal.grants.set(grantKey(recipientId),next);return snapshot(next);
    },
    finalize({ sourceRef, battleId, outcomeCode, proofDigest }) {
      if (!identity(sourceRef) || sourceRef.sourceSystem !== 'fixture-v2:05c-final' || !validId(battleId)
        || !validId(outcomeCode) || !/^[0-9a-f]{64}$/.test(proofDigest)) throw Error('BAD_05C_FINAL');
      const receipt = { sourceRef: snapshot(sourceRef), issuerClass:'BATTLE_TERMINAL_FINAL',
        finality:'FINAL', battleId, outcomeCode, proofDigest,
        sourceReceiptId:nextProof('05c-final-receipt') };
      if (internal.battleFinals.has(battleId) || internal.finals.has(keyFor(sourceRef))) throw Error('DUPLICATE_05C_FINAL');
      internal.finals.set(keyFor(sourceRef),receipt);internal.battleFinals.set(battleId,keyFor(sourceRef));
      internal.visibility.set(keyFor(sourceRef),{allowed:true,revision:1});return snapshot(receipt);
    },
    publicAction({ sourceRef, actionId, speakerId, utteranceCode, textDigest, causalRootRef }) {
      if (!identity(sourceRef) || sourceRef.sourceSystem !== 'fixture-v2:08b-action'
        || sourceRef.canonicalSourceEventId !== actionId || !validId(actionId)
        || !validId(speakerId) || !validId(utteranceCode) || !/^[a-f0-9]{64}$/.test(textDigest)
        || !identity(causalRootRef) || !lookup(internal.finals,causalRootRef)) throw Error('BAD_08B_ACTION');
      if (internal.actions.has(keyFor(sourceRef))) throw Error('DUPLICATE_08B_ACTION');
      const row = { sourceRef:snapshot(sourceRef),actionId,speakerId,utteranceCode,
        textDigest,issuerClass:'NPC_ACTION_DERIVATIVE',eventKind:'PUBLIC_SUPPORT',
        routeClass:'AUTHORIZED_PUBLIC',causalRootRef:snapshot(causalRootRef),
        committedActionReceiptId:nextProof('08b-action-receipt') };
      internal.actions.set(keyFor(sourceRef),row);internal.visibility.set(keyFor(sourceRef),{allowed:true,revision:1});return snapshot(row);
    },
    setVisibility(sourceRef, allowed) {
      if (!identity(sourceRef) || !internal.visibility.has(keyFor(sourceRef))) throw Error('UNKNOWN_VISIBILITY');
      const prior=visible(sourceRef);internal.visibility.set(keyFor(sourceRef),{allowed:allowed===true,revision:prior.revision+1});
      return snapshot(visible(sourceRef));
    },
    observe({sourceRef, recipientId, fieldScope}) {
      const row=lookup(internal.finals,sourceRef)??lookup(internal.actions,sourceRef);
      if (!row || !visible(sourceRef)?.allowed ||
        !validateGrantFor(recipientId,fieldScope, currentBinding(recipientId))) throw Error('NOT_AUTHORIZED_TO_OBSERVE');
      if (fieldScope !== (row.issuerClass==='BATTLE_TERMINAL_FINAL'?'public_outcome':'public_utterance')) throw Error('WRONG_OBSERVATION_SCOPE');
      const grant=getGrant(recipientId);
      const proof={proofId:nextProof('observation'), recipientId,sourceRef:snapshot(sourceRef),
        fieldScope,sourceDigest:digest(row),visibilityRevision:visible(sourceRef).revision,
        grantGeneration:grant.generation,accessEpoch:grant.accessEpoch};
      internal.observations.set(proof.proofId,proof);return snapshot(proof);
    },
    relay({sourceRef, receiptId,recipientId,speakerId,claimCode,claimDigest}) {
      if (!identity(sourceRef) || !validId(receiptId) || !validId(recipientId) ||
        !validId(speakerId) || !validId(claimCode) || !/^[0-9a-f]{64}$/.test(claimDigest)) throw Error('BAD_RELAY');
      const g=getGrant(recipientId);
      const currentVisibility=visible(sourceRef);
      if (!g?.active || !g.fieldScope.includes('public_claim') || currentVisibility?.allowed===false) throw Error('UNAUTHORIZED_RELAY');
      const row={receiptId,sourceRef:snapshot(sourceRef),recipientId,speakerId,claimCode,
        claimDigest,issuerClass:'SERVER_RELAY_RECEIPT',grantGeneration:g.generation,accessEpoch:g.accessEpoch};
      const old=internal.relays.get(receiptId);
      if(old) {if(!identical(old,row)) throw Error('IMMUTABLE_RELAY_CONFLICT');return snapshot(old)}
      internal.relays.set(receiptId,row);return snapshot(row);
    },
  });
  function currentBinding(id) {const g=getGrant(id);return g?{grantId:g.grantId,grantGeneration:g.generation,accessEpoch:g.accessEpoch}:null}
  const verifier=Object.freeze({
    grant(recipientId){const g=getGrant(recipientId);return g?snapshot(g):null},
    currentBinding,
    authorized(recipientId,scope,binding){return validateGrantFor(recipientId,scope,binding)},
    source(ref,kind){ const map=kind==='VERIFIED_OUTCOME'?internal.finals:internal.actions;
      const row=sourceRefValid(ref)?lookup(map,ref):null;return row?snapshot(row):null; },
    relay(id){ const row=internal.relays.get(id);return row?snapshot(row):null; },
    observation(id){const row=internal.observations.get(id);return row?snapshot(row):null},
    visibility(ref){const row=sourceRefValid(ref)?visible(ref):null;return row?snapshot(row):null},
    sealState(state){return seal(state)},verifyState(state,mac){return verifySeal(state,mac)},
  });
  return Object.freeze({ issuer, verifier });
}
