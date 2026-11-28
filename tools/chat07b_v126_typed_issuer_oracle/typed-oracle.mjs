// Synthetic per-NPC recipient-proof adapter. NOT a production authorization adapter.
import { buildKeys, canonical, digest, FIELDS, snapshot, sourceRefValid, TYPES, validId } from './wire.mjs';

const DENY='DENIED', CONFLICT='CONFLICT_QUARANTINE';
const entryId = key => key;
const grantBinding = g => ({ grantId:g.grantId,grantGeneration:g.generation,accessEpoch:g.accessEpoch });
const pack = (status,reason,receipt=null) => ({status,reason,receipt});
const same = (a,b) => canonical(a)===canonical(b);
const safe = value => {try{return snapshot(value)}catch{return null}};

function validateState(state) {
  if(!state || state.format!=='chat07b-v126-oracle/v1'
    || !Number.isSafeInteger(state.clock)||state.clock<0||!Array.isArray(state.knowledge)
    || !Array.isArray(state.receipts))throw Error('INVALID_RESTORED_STATE');
  if(new Set(state.knowledge.map(x=>x.knowledgeKey)).size!==state.knowledge.length)throw Error('DUPLICATE_KNOWLEDGE_IN_SNAPSHOT');
  if(new Set(state.receipts.map(x=>x.receiptId)).size!==state.receipts.length)throw Error('DUPLICATE_RECEIPT_IN_SNAPSHOT');
  for(const k of state.knowledge) {
    if(typeof k.knowledgeKey!=='string'||!Number.isSafeInteger(k.createdClock)
      ||k.createdClock>state.clock||typeof k.firstLearnedAtServer!=='string'
      ||k.receipt?.knowledgeKey!==k.knowledgeKey)throw Error('BAD_SNAPSHOT_KNOWLEDGE');
  }
  return state;
}

export function createOracle(verifier, restored=null) {
  if(!verifier || typeof verifier.authorized!=='function'||typeof verifier.source!=='function'||
    typeof verifier.verifyState!=='function')throw Error('TRUSTED_FIXTURE_VERIFIER_REQUIRED');
  let state;
  if(restored===null)state={format:'chat07b-v126-oracle/v1',clock:0,knowledge:[],receipts:[]};
  else {
    const body=safe(restored.body);
    if(!body||!verifier.verifyState(body,restored.mac))throw Error('UNTRUSTED_SNAPSHOT');
    state=validateState(body);
  }
  function failClosed(reason){return pack(DENY,reason)}
  function conflict(reason){return pack(CONFLICT,reason)}
  function commit(raw) {
    const input=safe(raw);
    if(!input || !TYPES.includes(input.knowledgeKind) || !validId(input.recipientId)||
      input.npcId!==input.recipientId||!sourceRefValid(input.sourceRef)||!input.binding)
      return failClosed('INVALID_TYPED_INTENT');
    const {knowledgeKind:kind, recipientId, sourceRef, binding}=input;
    const scope=FIELDS[kind];
    // Compare against the *current* authoritative grant at the knowledge commit point.
    if(!verifier.authorized(recipientId,scope,binding))return failClosed('STALE_GRANT_OR_SCOPE');
    const keys=(()=>{try{return buildKeys({npcId:input.npcId,recipientId,sourceRef,kind,relayReceiptId:input.relayReceiptId??null})}catch{return null}})();
    if(!keys)return failClosed('INVALID_WIRE_KEYS');
    let origin=null, proof=null, recordBody=null;
    if(kind==='HEARD_CLAIM') {
      const r=verifier.relay(input.relayReceiptId);
      if(!r)return failClosed('UNTRUSTED_RELAY_RECEIPT');
      if(verifier.visibility(sourceRef)?.allowed===false)return failClosed('SOURCE_VISIBILITY_REVOKED');
      if(!same(r.sourceRef,sourceRef)||r.recipientId!==recipientId||
        r.grantGeneration!==binding.grantGeneration||r.accessEpoch!==binding.accessEpoch)
        return failClosed('STALE_RELAY_OR_WRONG_RECIPIENT');
      if(!validId(input.speakerId)||!validId(input.claimCode)||typeof input.claimDigest!=='string'
        || !/^[0-9a-f]{64}$/.test(input.claimDigest))return failClosed('INVALID_CLAIM');
      if(r.speakerId!==input.speakerId||r.claimCode!==input.claimCode||r.claimDigest!==input.claimDigest)
        return conflict('IMMUTABLE_RELAY_DIGEST_CONFLICT');
      origin={issuerClass:'SERVER_RELAY_RECEIPT',receiptId:r.receiptId};
      proof={relayReceiptId:r.receiptId,relayDigest:digest(r)};
      recordBody={claimCode:input.claimCode,claimDigest:input.claimDigest,speakerId:input.speakerId};
    } else {
      const s=verifier.source(sourceRef,kind);
      if(!s)return failClosed(kind==='VERIFIED_OUTCOME'?'NO_05C_TRUSTED_FINAL':'NO_08B_COMMITTED_ACTION');
      if(kind==='VERIFIED_OUTCOME') {
        if(s.issuerClass!=='BATTLE_TERMINAL_FINAL'||s.finality!=='FINAL'
          ||s.sourceRef.sourceSystem!=='fixture-v2:05c-final'||s.sourceReceiptId!==input.sourceReceiptId
          ||s.proofDigest!==input.proofDigest||!validId(s.battleId))return conflict('FINAL_PROOF_MISMATCH');
        recordBody={outcomeCode:s.outcomeCode,proofDigest:s.proofDigest,battleId:s.battleId};
      } else {
        if(s.issuerClass!=='NPC_ACTION_DERIVATIVE'||s.eventKind!=='PUBLIC_SUPPORT'
          ||s.routeClass!=='AUTHORIZED_PUBLIC'||s.sourceRef.sourceSystem!=='fixture-v2:08b-action'
          ||s.actionId!==sourceRef.canonicalSourceEventId
          ||s.committedActionReceiptId!==input.sourceReceiptId||s.textDigest!==input.proofDigest)
          return conflict('ACTION_PROOF_MISMATCH');
        recordBody={speakerId:s.speakerId,utteranceCode:s.utteranceCode,textDigest:s.textDigest,actionId:s.actionId};
      }
      const o=verifier.observation(input.observationProofId);
      const vis=verifier.visibility(sourceRef);
      if(!o||!vis?.allowed||o.recipientId!==recipientId||o.fieldScope!==scope
        ||!same(o.sourceRef,sourceRef)||o.sourceDigest!==digest(s)
        ||o.grantGeneration!==binding.grantGeneration||o.accessEpoch!==binding.accessEpoch
        ||o.visibilityRevision!==vis.revision)return failClosed('NO_CURRENT_AUTHORIZED_OBSERVATION');
      origin={issuerClass:s.issuerClass,sourceReceiptId:input.sourceReceiptId};
      proof={observationProofId:o.proofId,observationDigest:digest(o)};
    }
    // Observation/ACK receipt identities do not change the underlying event's knowledge identity.
    // HEARD_CLAIM's relay receipt is a separate immutable knowledge identity by design.
    const frozen={sourceRef,recipientId,kind,wireKind:keys.wireKind,body:recordBody,
      origin,proof:kind==='HEARD_CLAIM'?proof:null,sourceOriginKey:keys.sourceOriginKey};
    const contentDigest=digest(frozen);
    const existing=state.knowledge.find(x=>entryId(x.knowledgeKey)===entryId(keys.knowledgeKey));
    const used=kind==='HEARD_CLAIM'?state.receipts.find(x=>x.receiptId===input.relayReceiptId):null;
    if(used && (used.knowledgeKey!==keys.knowledgeKey||used.contentDigest!==contentDigest))return conflict('RELAY_RECEIPT_REBOUND');
    if(existing){
      if(existing.contentDigest!==contentDigest)return conflict('IMMUTABLE_KNOWLEDGE_CONFLICT');
      return pack('IDEMPOTENT_REPLAY','SAME_COMMITTED_KNOWLEDGE',snapshot(existing.receipt));
    }
    // One synchronous offline linearization. Real cross-store CAS/revoke is not proven.
    if(!verifier.authorized(recipientId,scope,binding))return failClosed('REVOKED_BEFORE_COMMIT');
    const clock=state.clock+1;
    const firstLearnedAtServer=new Date(Date.parse('2026-11-11T00:00:00.000Z')+clock*1000).toISOString();
    const receipt={knowledgeKey:keys.knowledgeKey,firstLearnedAtServer,sourceOriginKey:keys.sourceOriginKey,
      kind,wireKind:keys.wireKind,effectKey:keys.effectKey,contentDigest};
    const next={knowledgeKey:keys.knowledgeKey,createdClock:clock,recipientId,fieldScope:scope,
      sourceRef,kind,contentDigest,firstLearnedAtServer,receipt,recordBody,
      binding:grantBinding(verifier.grant(recipientId))};
    state.knowledge.push(next);
    if(kind==='HEARD_CLAIM')state.receipts.push({receiptId:input.relayReceiptId,knowledgeKey:keys.knowledgeKey,contentDigest});
    state.clock=clock;
    return pack('NEW_KNOWLEDGE','COMMITTED',snapshot(receipt));
  }
  function readForRecipient({recipientId,knowledgeKey,binding}) {
    if(!validId(recipientId)||typeof knowledgeKey!=='string')return failClosed('INVALID_READ');
    const item=state.knowledge.find(x=>x.knowledgeKey===knowledgeKey);
    if(!item||item.recipientId!==recipientId)return failClosed('NOT_AUTHORIZED');
    if(!verifier.authorized(recipientId,item.fieldScope,binding))return failClosed('STALE_GRANT_OR_SCOPE');
    // A revoked public projection cannot be delivered again from cached 07B memory.
    if((item.kind!=='HEARD_CLAIM' && !verifier.visibility(item.sourceRef)?.allowed)
      || (item.kind==='HEARD_CLAIM' && verifier.visibility(item.sourceRef)?.allowed===false))
      return failClosed('SOURCE_VISIBILITY_REVOKED');
    const fields=item.kind==='VERIFIED_OUTCOME'?{outcomeCode:item.recordBody.outcomeCode}:
      item.kind==='VERIFIED_UTTERANCE'?{utteranceCode:item.recordBody.utteranceCode,speakerId:item.recordBody.speakerId}:
        {claimCode:item.recordBody.claimCode,speakerId:item.recordBody.speakerId};
    return pack('AUTHORIZED_READ','CURRENT_GRANT',snapshot({kind:item.kind,sourceOriginKey:item.receipt.sourceOriginKey,
      knowledgeKey:item.knowledgeKey,firstLearnedAtServer:item.firstLearnedAtServer,
      effectEligible:item.kind==='VERIFIED_OUTCOME',proactiveEligible:false,authorizedFields:fields}));
  }
  function exportCheckpoint(){const body=snapshot(state);return {body,mac:verifier.sealState(body)}}
  function stats(){return {knowledgeCount:state.knowledge.length,receiptCount:state.receipts.length,clock:state.clock}}
  return Object.freeze({commit,readForRecipient,exportCheckpoint,stats});
}
