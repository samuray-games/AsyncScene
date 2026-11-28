// V129 isolated in-memory TEST REGISTRY, not 05C/07B trust or production auth.
import {randomBytes,createHash} from 'node:crypto';
const rnd=()=>randomBytes(24).toString('base64url');
const hash=(s)=>createHash('sha256').update(s).digest('hex');
const j=(...a)=>JSON.stringify(a);
const FIELDS=Object.freeze({VERIFIED_OUTCOME:['finality','mechanicalOutcome'],PUBLIC_SUPPORT:['speechStatus','truthStatus','approvedPublishedText','speakerDisplay'],CHALLENGE_PROPOSAL:['proposalState','proposalText','proposerDisplay']});
const PERMISSIONS=Object.freeze({VERIFIED_OUTCOME:'VIEW_OUTCOME_EXISTENCE',PUBLIC_SUPPORT:'VIEW_PUBLIC_UTTERANCE',CHALLENGE_PROPOSAL:'VIEW_PRIVATE_PROPOSAL'});
const REQUIREMENTS=Object.freeze({VERIFIED_OUTCOME:['gameplay','gameplay.battle.finalized/v1','BATTLE_TERMINAL_FINAL'],PUBLIC_SUPPORT:['npc-action','npc.action/v1','NPC_ACTION_DERIVATIVE'],CHALLENGE_PROPOSAL:['npc-action','npc.action/v1','NPC_ACTION_DERIVATIVE']});
const clone=v=>structuredClone(v);
function containsAllowed(a,field){return Array.isArray(a)&&a.includes(field);}
export class TestAuthority {
  #sources=new Map(); #audiences=new Map(); #viewers=new Map(); #recipientGrants=new Map(); #sessions=new Map();
  #refs=new Map(); #refLookup=new Map(); #cursors=new Map(); #textApprovals=new Map();
  #finals=new Map(); #conflicts=new Set(); #relays=new Map(); #revision=0; #sequence=0;
  get revision(){return this.#revision;}
  #bump(){this.#revision++;}
  #key(tenant,sourceId){return j(tenant,sourceId);}
  #viewerKey(tenant,viewer,kind){return j(tenant,viewer,kind);}
  seedSource(input){
    const x=clone(input),expect=REQUIREMENTS[x.kind];
    if(!expect||!x.tenantId||!x.sourceId||!x.canonicalEventId||!x.sourceVersion)throw Error('invalid isolated source');
    if(x.sourceSystem!==expect[0]||x.namespace!==expect[1]||x.issuerClass!==expect[2])throw Error('unknown issuer class');
    if(x.kind==='VERIFIED_OUTCOME'&&(x.terminalKind!=='FINAL'||x.phase!=='final'||!['DRAW','A_WIN','B_WIN'].includes(x.mechanicalOutcome)||!x.battleId||!x.receiptId))throw Error('invalid final');
    if(x.kind==='PUBLIC_SUPPORT'&&(x.actionKind!=='PUBLIC_SUPPORT'||x.route!=='AUTHORIZED_PUBLIC'||!x.actionId||!x.receiptId))throw Error('invalid support');
    if(x.kind==='CHALLENGE_PROPOSAL'&&(x.actionKind!=='CHALLENGE_PROPOSAL'||x.route!=='PRIVATE_RECIPIENT'||!x.recipientId||!x.receiptId))throw Error('invalid proposal');
    const k=this.#key(x.tenantId,x.sourceId),fingerprint=hash(JSON.stringify(x)),old=this.#sources.get(k);
    if(old){if(old.fingerprint===fingerprint)return 'REPLAY';old.conflict=true;this.#bump();return 'CONFLICT';}
    if(x.kind==='VERIFIED_OUTCOME'){
      const battleKey=j(x.tenantId,x.battleId),first=this.#finals.get(battleKey);
      if(first&&first!==k){this.#conflicts.add(battleKey);this.#bump();}
      else this.#finals.set(battleKey,k);
    }
    const sealed=Object.freeze({...x,seq:++this.#sequence,fingerprint});
    this.#sources.set(k,{row:sealed,fingerprint,conflict:false});this.#bump();return 'COMMITTED_FIXTURE';
  }
  approveText({tenantId,sourceId,text}){
    // A SEPARATE simulated publisher authority; source's text label is never trusted by itself.
    this.#textApprovals.set(this.#key(tenantId,sourceId),{text,digest:hash(text)});this.#bump();
  }
  setAudience({tenantId,sourceId,fields,active=true}){
    this.#audiences.set(this.#key(tenantId,sourceId),{active,fields:[...fields]});this.#bump();
  }
  setViewerGrant({tenantId,viewerId,kind,fields,active=true,generation=1,accessEpoch=1}){
    this.#viewers.set(this.#viewerKey(tenantId,viewerId,kind),{active,fields:[...fields],generation,accessEpoch});this.#bump();
  }
  setRecipientGrant({tenantId,sourceId,recipientId,fields,active=true,generation=1,accessEpoch=1}){
    this.#recipientGrants.set(this.#key(tenantId,sourceId),{recipientId,fields:[...fields],active,generation,accessEpoch});this.#bump();
  }
  createSession({tenantId,viewerId,role='spectator',generation=1,accessEpoch=1}){
    const token=rnd();this.#sessions.set(token,{tenantId,viewerId,role,generation,accessEpoch,active:true});this.#bump();return token;
  }
  revokeSession(token){const s=this.#sessions.get(token);if(s){s.active=false;this.#bump();}}
  session(token){const s=this.#sessions.get(token);return s?.active?{...s}:null;}
  referenceFor({tenantId,viewerId,sourceId}){
    const k=j(tenantId,viewerId,sourceId);if(this.#refs.has(k))return this.#refs.get(k);
    const ref=rnd();this.#refs.set(k,ref);this.#refLookup.set(ref,{tenantId,viewerId,sourceId});return ref;
  }
  #allowed(s,source,surface){
    if(!s?.active||!source)return null;
    const x=source.row;
    if(x.tenantId!==s.tenantId||source.conflict||x.trustRevoked)return null;
    if(x.kind==='VERIFIED_OUTCOME'&&(this.#conflicts.has(j(x.tenantId,x.battleId))||x.terminalKind!=='FINAL'||x.phase!=='final'))return null;
    if(x.kind==='PUBLIC_SUPPORT'&&(x.route!=='AUTHORIZED_PUBLIC'||surface!=='PUBLIC_HISTORY'))return null;
    if(x.kind==='CHALLENGE_PROPOSAL'&&(surface!=='PRIVATE_RECIPIENT'||x.recipientId!==s.viewerId))return null;
    if(x.kind==='VERIFIED_OUTCOME'&&surface!=='PUBLIC_HISTORY')return null;
    const audience=this.#audiences.get(this.#key(x.tenantId,x.sourceId));
    const viewer=this.#viewers.get(this.#viewerKey(s.tenantId,s.viewerId,x.kind));
    if(!audience?.active||!viewer?.active||!viewer.fields.includes(PERMISSIONS[x.kind]))return null;
    if(viewer.generation!==s.generation||viewer.accessEpoch!==s.accessEpoch)return null;
    const requiresRecipient=(x.recipientId!=null); // server-sealed origin binding, not browser requiresRecipientGrant
    const recipient=requiresRecipient?this.#recipientGrants.get(this.#key(x.tenantId,x.sourceId)):null;
    if(requiresRecipient&&(!recipient?.active||recipient.recipientId!==x.recipientId||!Number.isInteger(recipient.generation)||!Number.isInteger(recipient.accessEpoch)||recipient.generation!==x.recipientGeneration||recipient.accessEpoch!==x.recipientAccessEpoch))return null;
    const rawFields=FIELDS[x.kind].filter(f=>containsAllowed(audience.fields,f)&&containsAllowed(viewer.fields,f)&&(!recipient||containsAllowed(recipient.fields,f)));
    if(x.kind==='VERIFIED_OUTCOME'){
      if(!rawFields.includes('finality'))return null;
      const fields={finality:'finalized'};
      if(rawFields.includes('mechanicalOutcome'))fields.mechanicalOutcome=x.mechanicalOutcome;
      return fields;
    }
    if(x.kind==='PUBLIC_SUPPORT'){
      const pub=this.#textApprovals.get(this.#key(x.tenantId,x.sourceId));
      // Separate published text bytes and digest must match sealed source.
      if(!rawFields.includes('approvedPublishedText')||!pub||pub.digest!==x.approvedTextDigest||pub.text!==x.approvedText)return null;
      const fields={speechStatus:'uttered',truthStatus:'not_established_by_utterance',approvedPublishedText:pub.text};
      if(rawFields.includes('speakerDisplay')&&x.speakerDisplay)fields.speakerDisplay=x.speakerDisplay;
      return fields;
    }
    if(x.kind==='CHALLENGE_PROPOSAL'){
      if(!rawFields.includes('proposalText')||!x.proposalText)return null;
      const fields={proposalState:'PROPOSED',proposalText:x.proposalText};
      if(rawFields.includes('proposerDisplay')&&x.proposerDisplay)fields.proposerDisplay=x.proposerDisplay;
      return fields;
    }
    return null;
  }
  view(s,ref,surface){
    if(!s?.active||typeof ref!=='string')return null;
    const binding=this.#refLookup.get(ref);if(!binding||binding.tenantId!==s.tenantId||binding.viewerId!==s.viewerId)return null;
    const src=this.#sources.get(this.#key(binding.tenantId,binding.sourceId));const fields=this.#allowed(s,src,surface);
    if(!fields)return null;
    return {kind:src.row.kind,surface,publicItemRef:ref,projectionVersion:'07a-http-consumer/v1',visibilityRevision:`v${this.#revision}`,cacheControl:'no-store',fields};
  }
  history(s){
    if(!s?.active)return [];
    const result=[];
    for(const source of [...this.#sources.values()].sort((a,b)=>a.row.seq-b.row.seq)){
      const x=source.row;if(x.tenantId!==s.tenantId||x.kind==='CHALLENGE_PROPOSAL')continue;
      const fields=this.#allowed(s,source,'PUBLIC_HISTORY');if(!fields)continue;
      const ref=this.referenceFor({tenantId:s.tenantId,viewerId:s.viewerId,sourceId:x.sourceId});
      result.push({kind:x.kind,surface:'PUBLIC_HISTORY',publicItemRef:ref,projectionVersion:'07a-http-consumer/v1',visibilityRevision:`v${this.#revision}`,cacheControl:'no-store',fields});
    }
    return result;
  }
  issueCursor(s,offset,pageSize){
    const ref=rnd();this.#cursors.set(ref,{tenantId:s.tenantId,viewerId:s.viewerId,generation:s.generation,accessEpoch:s.accessEpoch,role:s.role,revision:this.#revision,offset,pageSize,expiresAt:Date.now()+90000});return ref;
  }
  consumeCursor(s,cursor,pageSize){
    const x=this.#cursors.get(cursor);
    return x&&x.expiresAt>Date.now()&&x.tenantId===s.tenantId&&x.viewerId===s.viewerId&&x.generation===s.generation&&x.accessEpoch===s.accessEpoch&&x.role===s.role&&x.revision===this.#revision&&x.pageSize===pageSize?x.offset:null;
  }
  deliverRelay({tenantId,relayReceiptId,claimDigest}){
    const k=j(tenantId,relayReceiptId),prev=this.#relays.get(k);
    if(prev)return prev===claimDigest?'REPLAY':'CONFLICT_QUARANTINE';
    this.#relays.set(k,claimDigest);return 'DELIVERED_FIXTURE_ONLY';
  }
  get sourceCount(){return this.#sources.size;}
}
export function textDigest(text){return hash(text);}
