// ISOLATED OFFLINE public projection oracle V127. No HTTP, D1, Worker or external side effects.
// All claims, issuer classes, receipts and grants are verified against fixture authority, not client DTO labels.
import {createHmac,randomBytes} from 'node:crypto';
import {SOURCE,kindOf} from './fixture-authority.mjs';

export const PROJECTION_VERSION='chat07a-projection-oracle/v127';
const INVISIBLE=Object.freeze({status:'NOT_VISIBLE',cacheControl:'no-store'});
const SRC={VERIFIED_OUTCOME:SOURCE.FINAL,PUBLIC_SUPPORT:SOURCE.ACTION,CHALLENGE_PROPOSAL:SOURCE.ACTION};
const FIELDS=Object.freeze({VERIFIED_OUTCOME:['finality','mechanicalOutcome','recognizedOutcome','socialOutcome','mechanicalWinnerDisplay','allowedSummaryKey'],PUBLIC_SUPPORT:['approvedPublishedText','speakerDisplay'],CHALLENGE_PROPOSAL:['proposalText','proposerDisplay','proposalState']});
const prepared=new WeakMap();
const secret=randomBytes(32); // only opaque fixture IDs, not a production durable key or persisted secret.
const safeCopy=v=>structuredClone(v);
const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
const isStr=x=>typeof x==='string'&&x.length>0&&x.length<=256;
const scopedRef=(viewerId,row)=>createHmac('sha256',secret).update(JSON.stringify([viewerId,row.sourceSystem,row.id])).digest('hex').slice(0,32);
const fail=()=>({ ...INVISIBLE });
function admissible(source){
  if(!source||source.conflict)return false;
  const x=source.row,k=kindOf(x);if(!k || !x.committed || !x.receipt || !Number.isSafeInteger(x.eventVersion) || x.eventVersion<1)return false;
  if(k==='VERIFIED_OUTCOME' && (x.phase!=='final'||x.terminalKind!=='FINAL'||x.publicData?.finality!=='finalized'||!['A_WIN','B_WIN','DRAW'].includes(x.publicData?.mechanicalOutcome)||!['A_WIN','B_WIN','DRAW'].includes(x.publicData?.recognizedOutcome)||!['NONE','A_SUPPORT','B_SUPPORT'].includes(x.publicData?.socialOutcome)))return false;
  if(k==='PUBLIC_SUPPORT' && (x.route!=='AUTHORIZED_PUBLIC'||!isStr(x.publicData?.approvedPublishedText)))return false;
  if(k==='CHALLENGE_PROPOSAL' && (x.route!=='PRIVATE_RECIPIENT'||x.publicData?.proposalState!=='PROPOSED'||!isStr(x.intendedRecipientId)))return false;
  return true;
}
function gate(authority,viewerId,locator){
  if(!authority||!isStr(viewerId)||!locator||!isStr(locator.sourceSystem)||!isStr(locator.canonicalEventId))return null;
  const source=authority.readSource(locator.sourceSystem,locator.canonicalEventId);if(!admissible(source))return null;
  const kind=kindOf(source.row);
  if(SRC[kind]!==locator.sourceSystem)return null;
  const grant=authority.viewerGate(viewerId,source);
  if(!grant||!grant.fields.some(f=>FIELDS[kind].includes(f)))return null;
  const mandatory={VERIFIED_OUTCOME:'finality',PUBLIC_SUPPORT:'approvedPublishedText',CHALLENGE_PROPOSAL:'proposalText'}[kind];
  if(!grant.fields.includes(mandatory))return null;
  return {source,kind,grant};
}
export function prepareProjection(authority,{viewerId,locator,clientKind=null}={}){
  // clientKind deliberately never authorizes or changes classification.
  const allowed=gate(authority,viewerId,locator);
  if(!allowed)return fail();
  const token=Object.freeze({});
  prepared.set(token,{authority,viewerId,locator:safeCopy(locator),fingerprint:allowed.source.fingerprint,kind:allowed.kind,sourceVersion:allowed.source.row.sourceVersion,grant:safeCopy(allowed.grant)});
  return {status:'PREPARED',token};
}
export function emitProjection(authority,token){
  // A second source/ACL/recipient read is mandatory. The snapshot prepared earlier cannot authorize a later response.
  const pre=prepared.get(token);if(!pre||pre.authority!==authority)return fail();
  const current=gate(authority,pre.viewerId,pre.locator);if(!current)return fail();
  if(current.kind!==pre.kind||current.source.fingerprint!==pre.fingerprint||current.source.row.sourceVersion!==pre.sourceVersion||!same(current.grant,pre.grant))return fail();
  const {row}=current.source; const allowed=FIELDS[current.kind].filter(f=>pre.grant.fields.includes(f));const selected={};
  for(const name of allowed){if(Object.hasOwn(row.publicData,name))selected[name]=safeCopy(row.publicData[name]);}
  if(current.kind==='VERIFIED_OUTCOME'&&row.publicData.mechanicalOutcome==='DRAW')delete selected.mechanicalWinnerDisplay;
  const surface=current.kind==='CHALLENGE_PROPOSAL'?'PRIVATE_RECIPIENT':'AUTHORIZED_PUBLIC';
  return {status:'VISIBLE',kind:current.kind,surface,projectionVersion:PROJECTION_VERSION,visibilityRevision:pre.grant.aclRevision,publicItemRef:scopedRef(pre.viewerId,row),cacheControl:'no-store',fields:selected};
}
export function project(authority,request){const p=prepareProjection(authority,request);return p.status==='PREPARED'?emitProjection(authority,p.token):fail();}
export function projectedHistoryKey(authority,{viewerId,locator}={}){const value=project(authority,{viewerId,locator});return value.status==='VISIBLE'?value.publicItemRef:null;}
