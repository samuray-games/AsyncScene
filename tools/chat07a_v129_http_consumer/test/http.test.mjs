// V129 author-owned real loopback HTTP behavior tests. Synthetic server-only registry, NOT deployed backend.
import test from 'node:test';
import assert from 'node:assert/strict';
import {TestAuthority,textDigest} from '../authority.mjs';
import {makeCandidateServer} from '../http-candidate.mjs';
function finalSource(extra={}){return {
 tenantId:'tenant-A',sourceId:'final-1',sourceSystem:'gameplay',namespace:'gameplay.battle.finalized/v1',
 issuerClass:'BATTLE_TERMINAL_FINAL',canonicalEventId:'battle-1:final',sourceVersion:1,
 kind:'VERIFIED_OUTCOME',terminalKind:'FINAL',phase:'final',battleId:'battle-1',receiptId:'receipt-1',
 mechanicalOutcome:'DRAW',recognizedOutcome:'A_WIN',winnerId:'SECRET_WINNER',voteId:'SECRET_VOTE',
 grantRequired:false,clientKind:'PUBLIC_SUPPORT',...extra
};}
function supportSource(extra={}){const text='NPC сказал: я поддерживаю сторону A';return {
 tenantId:'tenant-A',sourceId:'support-1',sourceSystem:'npc-action',namespace:'npc.action/v1',
 issuerClass:'NPC_ACTION_DERIVATIVE',canonicalEventId:'action-1',sourceVersion:1,
 kind:'PUBLIC_SUPPORT',actionKind:'PUBLIC_SUPPORT',route:'AUTHORIZED_PUBLIC',actionId:'action-1',receiptId:'action-receipt-1',
 approvedText:text,approvedTextDigest:textDigest(text),speakerDisplay:'NPC Пик',
 internalDM:'SECRET_DM_DO_NOT_PUBLISH',...extra
};}
function proposalSource(extra={}){return {
 tenantId:'tenant-A',sourceId:'proposal-1',sourceSystem:'npc-action',namespace:'npc.action/v1',
 issuerClass:'NPC_ACTION_DERIVATIVE',canonicalEventId:'action-proposal-1',sourceVersion:1,
 kind:'CHALLENGE_PROPOSAL',actionKind:'CHALLENGE_PROPOSAL',route:'PRIVATE_RECIPIENT',actionId:'action-proposal-1',
 receiptId:'action-receipt-2',recipientId:'viewer-A',recipientGeneration:1,recipientAccessEpoch:1,
 proposalText:'Предлагаю поединок',proposerDisplay:'NPC Сова',...extra
};}
function setup({withSupport=true,withProposal=true,approved=true}={}){
 const a=new TestAuthority();
 assert.equal(a.seedSource(finalSource()),'COMMITTED_FIXTURE');
 a.setAudience({tenantId:'tenant-A',sourceId:'final-1',fields:['finality','mechanicalOutcome']});
 a.setViewerGrant({tenantId:'tenant-A',viewerId:'viewer-A',kind:'VERIFIED_OUTCOME',fields:['VIEW_OUTCOME_EXISTENCE','finality','mechanicalOutcome']});
 a.setViewerGrant({tenantId:'tenant-A',viewerId:'viewer-B',kind:'VERIFIED_OUTCOME',fields:['VIEW_OUTCOME_EXISTENCE','finality']});
 if(withSupport){const sup=supportSource();a.seedSource(sup);if(approved)a.approveText({tenantId:'tenant-A',sourceId:'support-1',text:sup.approvedText});a.setAudience({tenantId:'tenant-A',sourceId:'support-1',fields:['approvedPublishedText','speakerDisplay']});for(const v of ['viewer-A','viewer-B'])a.setViewerGrant({tenantId:'tenant-A',viewerId:v,kind:'PUBLIC_SUPPORT',fields:['VIEW_PUBLIC_UTTERANCE','approvedPublishedText','speakerDisplay']});}
 if(withProposal){a.seedSource(proposalSource());a.setAudience({tenantId:'tenant-A',sourceId:'proposal-1',fields:['proposalText','proposerDisplay']});a.setViewerGrant({tenantId:'tenant-A',viewerId:'viewer-A',kind:'CHALLENGE_PROPOSAL',fields:['VIEW_PRIVATE_PROPOSAL','proposalText','proposerDisplay']});a.setRecipientGrant({tenantId:'tenant-A',sourceId:'proposal-1',recipientId:'viewer-A',fields:['proposalText','proposerDisplay']});}
 const A=a.createSession({tenantId:'tenant-A',viewerId:'viewer-A'});
 const B=a.createSession({tenantId:'tenant-A',viewerId:'viewer-B'});
 const cross=a.createSession({tenantId:'tenant-B',viewerId:'viewer-A'});
 const refs={A:a.referenceFor({tenantId:'tenant-A',viewerId:'viewer-A',sourceId:'final-1'}),B:a.referenceFor({tenantId:'tenant-A',viewerId:'viewer-B',sourceId:'final-1'}),support:a.referenceFor({tenantId:'tenant-A',viewerId:'viewer-A',sourceId:'support-1'}),proposal:a.referenceFor({tenantId:'tenant-A',viewerId:'viewer-A',sourceId:'proposal-1'})};
 return {a,A,B,cross,refs};
}
async function withServer(registry,callback,{beforeEmit}={}){
 const server=makeCandidateServer({authority:registry,beforeEmit});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const base=`http://127.0.0.1:${server.address().port}`;
 async function request(path,token,{headers={},method='GET'}={}){
  const rs=await fetch(base+path,{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...headers}});
  const body=await rs.text();let data=null;try{data=JSON.parse(body)}catch{}
  return {status:rs.status,headers:rs.headers,body,data};
 }
 try{await callback(request)}finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
}
function noCache(rs){assert.equal(rs.headers.get('cache-control'),'private, no-store, max-age=0');assert.equal(rs.headers.get('surrogate-control'),'no-store');assert.equal(rs.headers.get('referrer-policy'),'no-referrer');assert.equal(rs.headers.get('etag'),null);assert.equal(rs.headers.get('last-modified'),null);}
function noPrivate(rs){for(const x of ['SECRET_WINNER','SECRET_VOTE','SECRET_DM','recipientGrant','receipt-1','battle-1:final','issuerClass','accessEpoch','recognizedOutcome','winnerId','voteId','grantRequired'])assert.equal(rs.body.includes(x),false,`Unexpected leak: ${x}`)}

// These cases exercise network response behavior with an actual loopback HTTP server.
test('H01 verified final GET returns only separately granted fields and no-store',async()=>{
 const f=setup();await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.A}`,f.A);assert.equal(r.status,200);assert.equal(r.data.kind,'VERIFIED_OUTCOME');assert.deepEqual(r.data.fields,{finality:'finalized',mechanicalOutcome:'DRAW'});noCache(r);noPrivate(r)})
});
test('H02 second viewer gets less scope, independent ref',async()=>{
 const f=setup();assert.notEqual(f.refs.A,f.refs.B);await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.B}`,f.B);assert.equal(r.status,200);assert.deepEqual(r.data.fields,{finality:'finalized'});noCache(r)})
});
test('H03 cross-viewer opaque ref access denied',async()=>{const f=setup();await withServer(f.a,async q=>{assert.equal((await q(`/v1/history/item/${f.refs.A}`,f.B)).status,404)})});
test('H04 cross-tenant source ref denied identically to nonexistent',async()=>{
 const f=setup();await withServer(f.a,async q=>{const cross=await q(`/v1/history/item/${f.refs.A}`,f.cross);const absent=await q('/v1/history/item/no-such-reference',f.cross);assert.equal(cross.status,404);assert.equal(cross.body,absent.body);noCache(cross)})
});
test('H05 no authentication is 401 independent of existence',async()=>{
 const f=setup();await withServer(f.a,async q=>{const p=await q(`/v1/history/item/${f.refs.A}`,null),e=await q('/v1/history/item/unknown',null);assert.equal(p.status,401);assert.equal(p.body,e.body);noCache(p)})
});
test('H06 GET never returns 304 even with ETag or Last-Modified conditions',async()=>{
 const f=setup();await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.A}`,f.A,{headers:{'If-None-Match':'"stale"','If-Modified-Since':'Mon, 01 Jan 2024 01:01:01 GMT'}});assert.equal(r.status,200);noCache(r)})
});
test('H07 source kind is issuer-owned, client declaration cannot change support to result',async()=>{
 const f=setup();await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.support}?clientKind=VERIFIED_OUTCOME`,f.A,{headers:{'X-Client-Kind':'VERIFIED_OUTCOME'}});assert.equal(r.status,200);assert.equal(r.data.kind,'PUBLIC_SUPPORT');assert.equal(r.data.fields.truthStatus,'not_established_by_utterance');assert.equal(r.data.fields.finality,undefined);noPrivate(r)})
});
test('H08 publication requires separate matching text approval',async()=>{
 const f=setup({approved:false});await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.support}`,f.A);assert.equal(r.status,404);noPrivate(r)})
});
test('H09 approved support is speech, not truth or outcome',async()=>{
 const f=setup();await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.support}`,f.A);assert.equal(r.status,200);assert.equal(r.data.kind,'PUBLIC_SUPPORT');assert.equal(r.data.fields.speechStatus,'uttered');assert.equal(r.data.fields.truthStatus,'not_established_by_utterance');assert.equal('mechanicalOutcome' in r.data.fields,false);noPrivate(r)})
});
test('H10 proposal never appears on public item route',async()=>{const f=setup();await withServer(f.a,async q=>{assert.equal((await q(`/v1/history/item/${f.refs.proposal}`,f.A)).status,404)})});
test('H11 recipient can read proposal ONLY via private route',async()=>{
 const f=setup();await withServer(f.a,async q=>{const r=await q(`/v1/private/item/${f.refs.proposal}`,f.A);assert.equal(r.status,200);assert.equal(r.data.surface,'PRIVATE_RECIPIENT');assert.equal(r.data.fields.proposalState,'PROPOSED');noCache(r);assert.equal((await q(`/v1/private/item/${f.refs.proposal}`,f.B)).status,404)})
});
test('H12 relay receipts never create public history entry',async()=>{
 const f=setup();const before=f.a.sourceCount;assert.equal(f.a.deliverRelay({tenantId:'tenant-A',relayReceiptId:'relay-1',claimDigest:'claim-x'}),'DELIVERED_FIXTURE_ONLY');assert.equal(f.a.sourceCount,before);await withServer(f.a,async q=>{const r=await q('/v1/history',f.A);assert.equal(r.status,200);assert.equal(r.data.items.length,2);assert.equal(r.body.includes('HEARD_CLAIM'),false)})
});
test('H13 same relay receipt is idempotent, mutated receipt quarantines',()=>{
 const f=setup();assert.equal(f.a.deliverRelay({tenantId:'tenant-A',relayReceiptId:'receipt-x',claimDigest:'a'}),'DELIVERED_FIXTURE_ONLY');assert.equal(f.a.deliverRelay({tenantId:'tenant-A',relayReceiptId:'receipt-x',claimDigest:'a'}),'REPLAY');assert.equal(f.a.deliverRelay({tenantId:'tenant-A',relayReceiptId:'receipt-x',claimDigest:'b'}),'CONFLICT_QUARANTINE');assert.equal(f.a.sourceCount,3)
});
test('H14 original final same-source replay is idempotent',()=>{const f=setup();const before=f.a.sourceCount;assert.equal(f.a.seedSource(finalSource()),'REPLAY');assert.equal(f.a.sourceCount,before)});
test('H15 altered same-source final quarantines existing published ref',async()=>{
 const f=setup();f.a.seedSource(finalSource({mechanicalOutcome:'B_WIN'}));await withServer(f.a,async q=>{assert.equal((await q(`/v1/history/item/${f.refs.A}`,f.A)).status,404)})
});
test('H16 alternate FINAL event for same battle quarantines original',async()=>{
 const f=setup();f.a.seedSource(finalSource({sourceId:'final-second',canonicalEventId:'battle-1:other-final',receiptId:'receipt-other'}));await withServer(f.a,async q=>{assert.equal((await q(`/v1/history/item/${f.refs.A}`,f.A)).status,404)})
});
test('H17 invalid issuer/source namespace cannot be registered',()=>{
 const f=setup();assert.throws(()=>f.a.seedSource(finalSource({sourceSystem:'npc-action'})),/unknown issuer/);assert.throws(()=>f.a.seedSource(supportSource({issuerClass:'BATTLE_TERMINAL_FINAL'})),/unknown issuer/)
});
test('H18 recipient revoked between prepare and emit means generic 404',async()=>{
 const f=setup();let fired=false;await withServer(f.a,async q=>{const r=await q(`/v1/private/item/${f.refs.proposal}`,f.A);assert.equal(r.status,404);noCache(r)}, {beforeEmit:async({kind})=>{if(kind==='ITEM'&&!fired){fired=true;f.a.setRecipientGrant({tenantId:'tenant-A',sourceId:'proposal-1',recipientId:'viewer-A',fields:['proposalText'],active:false})}}})
});
test('H19 recipient revoke and regrant newer epoch cannot restore source stale epoch',async()=>{
 const f=setup();f.a.setRecipientGrant({tenantId:'tenant-A',sourceId:'proposal-1',recipientId:'viewer-A',fields:['proposalText'],active:false,generation:1,accessEpoch:1});f.a.setRecipientGrant({tenantId:'tenant-A',sourceId:'proposal-1',recipientId:'viewer-A',fields:['proposalText'],active:true,generation:2,accessEpoch:2});await withServer(f.a,async q=>{assert.equal((await q(`/v1/private/item/${f.refs.proposal}`,f.A)).status,404)})
});
test('H20 viewer grant narrowed after prepare does not serve previous broader fields',async()=>{
 const f=setup();let fired=false;await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.A}`,f.A);assert.equal(r.status,404)}, {beforeEmit:async({kind})=>{if(kind==='ITEM'&&!fired){fired=true;f.a.setViewerGrant({tenantId:'tenant-A',viewerId:'viewer-A',kind:'VERIFIED_OUTCOME',fields:['VIEW_OUTCOME_EXISTENCE','finality']})}}});
 await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.A}`,f.A);assert.equal(r.status,200);assert.deepEqual(r.data.fields,{finality:'finalized'})})
});
test('H21 viewer grant revoked on conditional request cannot return 304',async()=>{
 const f=setup();f.a.setViewerGrant({tenantId:'tenant-A',viewerId:'viewer-A',kind:'VERIFIED_OUTCOME',fields:['VIEW_OUTCOME_EXISTENCE','finality'],active:false});await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.A}`,f.A,{headers:{'If-None-Match':'"old"'}});assert.equal(r.status,404);noCache(r)})
});
test('H22 audience ACL mutation between prepare and emit fail closed',async()=>{
 const f=setup();let fired=false;await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.A}`,f.A);assert.equal(r.status,404)}, {beforeEmit:async({kind})=>{if(kind==='ITEM'&&!fired){fired=true;f.a.setAudience({tenantId:'tenant-A',sourceId:'final-1',fields:[],active:false})}}})
});
test('H23 session revocation between prepare and emit fail closed',async()=>{
 const f=setup();let fired=false;await withServer(f.a,async q=>{assert.equal((await q(`/v1/history/item/${f.refs.A}`,f.A)).status,404)}, {beforeEmit:async()=>{if(!fired){fired=true;f.a.revokeSession(f.A)}}})
});
test('H24 cursor pages only visible items, no counts/hidden source refs',async()=>{
 const f=setup();await withServer(f.a,async q=>{const first=await q('/v1/history?pageSize=1',f.A);assert.equal(first.status,200);assert.equal(first.data.items.length,1);assert.ok(first.data.nextCursor);const second=await q(`/v1/history?pageSize=1&cursor=${encodeURIComponent(first.data.nextCursor)}`,f.A);assert.equal(second.status,200);assert.equal(second.data.items.length,1);assert.equal(second.data.nextCursor,undefined);assert.notEqual(first.data.items[0].publicItemRef,second.data.items[0].publicItemRef);noPrivate(first);noPrivate(second)})
});
test('H25 cursor cannot be shared with another viewer',async()=>{
 const f=setup();await withServer(f.a,async q=>{const first=await q('/v1/history?pageSize=1',f.A);assert.ok(first.data.nextCursor);const wrong=await q(`/v1/history?pageSize=1&cursor=${first.data.nextCursor}`,f.B);assert.equal(wrong.status,404);noCache(wrong)})
});
test('H26 cursor tampering gives indistinguishable 404',async()=>{
 const f=setup();await withServer(f.a,async q=>{const first=await q('/v1/history?pageSize=1',f.A);const x=await q(`/v1/history?pageSize=1&cursor=${first.data.nextCursor}X`,f.A);const absent=await q('/v1/history?pageSize=1&cursor=no-such',f.A);assert.equal(x.status,404);assert.equal(x.body,absent.body)})
});
test('H27 stale cursor after ACL revoke is rejected',async()=>{
 const f=setup();await withServer(f.a,async q=>{const first=await q('/v1/history?pageSize=1',f.A);f.a.setViewerGrant({tenantId:'tenant-A',viewerId:'viewer-A',kind:'VERIFIED_OUTCOME',fields:['VIEW_OUTCOME_EXISTENCE','finality'],active:false});const second=await q(`/v1/history?pageSize=1&cursor=${first.data.nextCursor}`,f.A);assert.equal(second.status,404);noCache(second)})
});
test('H28 same cursor replays safely if authorization unchanged',async()=>{
 const f=setup();await withServer(f.a,async q=>{const first=await q('/v1/history?pageSize=1',f.A);const path=`/v1/history?pageSize=1&cursor=${first.data.nextCursor}`;const a=await q(path,f.A),b=await q(path,f.A);assert.equal(a.status,200);assert.equal(b.status,200);assert.deepEqual(a.data.items,b.data.items)})
});
test('H29 SSR uses only authorized projection; raw private fields absent',async()=>{
 const f=setup();await withServer(f.a,async q=>{const r=await q('/v1/history/ssr',f.A);assert.equal(r.status,200);assert.match(r.body,/finalized/);assert.match(r.body,/поддерживаю/);noPrivate(r);noCache(r);assert.doesNotMatch(r.body,/PRIVATE_RECIPIENT|CHALLENGE_PROPOSAL|HEARD_CLAIM/)})
});
test('H30 SSR HTML escapes separately released public text',async()=>{
 const f=setup({withSupport:false});const text='<script>alert(1)</script>';f.a.seedSource(supportSource({approvedText:text,approvedTextDigest:textDigest(text)}));f.a.setAudience({tenantId:'tenant-A',sourceId:'support-1',fields:['approvedPublishedText']});f.a.setViewerGrant({tenantId:'tenant-A',viewerId:'viewer-A',kind:'PUBLIC_SUPPORT',fields:['VIEW_PUBLIC_UTTERANCE','approvedPublishedText']});f.a.approveText({tenantId:'tenant-A',sourceId:'support-1',text});await withServer(f.a,async q=>{const r=await q('/v1/history/ssr',f.A);assert.equal(r.status,200);assert.doesNotMatch(r.body,/<script>/);assert.match(r.body,/&lt;script&gt;/)})
});
test('H31 SSR revoke between prepare and emit prevents stale markup',async()=>{
 const f=setup();let fired=false;await withServer(f.a,async q=>{const r=await q('/v1/history/ssr',f.A);assert.equal(r.status,404);assert.doesNotMatch(r.body,/finalized/)},{beforeEmit:async()=>{if(!fired){fired=true;f.a.setAudience({tenantId:'tenant-A',sourceId:'final-1',fields:[],active:false})}}})
});
test('H32 bad cursor query and pagination fail closed',async()=>{
 const f=setup();await withServer(f.a,async q=>{for(const path of ['/v1/history?pageSize=0','/v1/history?pageSize=999','/v1/history?sourceEventId=x','/v1/history?pageSize=1&cursor=bad']){assert.equal((await q(path,f.A)).status,404)}})
});
test('H33 unsafe mutation methods are not enabled',async()=>{
 const f=setup();await withServer(f.a,async q=>{const r=await q(`/v1/history/item/${f.refs.A}`,f.A,{method:'POST'});assert.equal(r.status,405);noCache(r)})
});
test('H34 invalid action issuer cannot masquerade as FINAL',()=>{
 const f=setup();assert.throws(()=>f.a.seedSource(finalSource({kind:'PUBLIC_SUPPORT'})),/unknown issuer/);assert.throws(()=>f.a.seedSource(proposalSource({route:'AUTHORIZED_PUBLIC'})),/invalid proposal/)
});
test('H35 source public RELEASE must match exact approved bytes',async()=>{
 const f=setup({approved:false});f.a.approveText({tenantId:'tenant-A',sourceId:'support-1',text:'different approved bytes'});await withServer(f.a,async q=>{assert.equal((await q(`/v1/history/item/${f.refs.support}`,f.A)).status,404)})
});
test('H36 no guessable source ID address, 404 exact same body for hidden and nonexistent',async()=>{
 const f=setup();await withServer(f.a,async q=>{const a=await q('/v1/history/item/battle-1:final',f.A),b=await q('/v1/history/item/NO_SUCH_REF',f.A),c=await q(`/v1/history/item/${f.refs.proposal}`,f.A);assert.equal(a.status,404);assert.equal(a.body,b.body);assert.equal(c.body,b.body);noCache(a);noCache(c)})
});

test('H37 SSR rejects cursor or pagination query rather than silently ignoring it',async()=>{
 const f=setup();await withServer(f.a,async q=>{for(const path of ['/v1/history/ssr?cursor=anything','/v1/history/ssr?pageSize=1']){const r=await q(path,f.A);assert.equal(r.status,404);noCache(r)}})
});
