import test from 'node:test';
import assert from 'node:assert/strict';
import {FixtureAuthority,SOURCE} from '../fixture-authority.mjs';
import {PROJECTION_VERSION,prepareProjection,emitProjection,project,projectedHistoryKey} from '../oracle.mjs';

const F=SOURCE.FINAL,A=SOURCE.ACTION,R=SOURCE.RELAY;
const outcomeFields=['finality','mechanicalOutcome','recognizedOutcome','socialOutcome','mechanicalWinnerDisplay','allowedSummaryKey'];
const supportFields=['approvedPublishedText','speakerDisplay'];
const proposalFields=['proposalText','proposerDisplay','proposalState'];
const loc=(sourceSystem,canonicalEventId)=>({sourceSystem,canonicalEventId});
function base(){const a=new FixtureAuthority();a.setRecipient('npc-1',{generation:1,accessEpoch:1});return a;}
function viewer(a,system,id,v='viewer-a',fields=outcomeFields,{audience=true,generation=1,accessEpoch=1,revision=1,visibilityRevision=1}={}){
 a.setAudience(system,id,{active:audience,viewerIds:[v],fields,revision:visibilityRevision});
 a.grantViewer(v,system,id,{active:true,generation,accessEpoch,fieldScope:fields,revision});
}
function finalSetup(options={}){const a=base(),id=options.id??'battle-01:final';a.registerFinal({eventId:id,battleId:'battle-01',...options});viewer(a,F,id,'viewer-a',outcomeFields);return {a,id};}
function actionSetup(actionKind='PUBLIC_SUPPORT',options={}){const a=base(),id=options.id??'action-1';a.registerAction({actionId:id,actionKind,...options});viewer(a,A,id,'viewer-a',actionKind==='PUBLIC_SUPPORT'?supportFields:proposalFields);return {a,id};}
function read(a,system,id,viewerId='viewer-a',clientKind){return project(a,{viewerId,locator:loc(system,id),clientKind});}
function notVisible(x){assert.equal(x.status,'NOT_VISIBLE');assert.equal(x.cacheControl,'no-store');assert.deepEqual(Object.keys(x).sort(),['cacheControl','status']);}

// Each title is a deterministic offline contract assertion. No external source ever runs.
test('01 real synthetic final allowed with source-owned identity',()=>{const {a,id}=finalSetup();const v=read(a,F,id);assert.equal(v.kind,'VERIFIED_OUTCOME');assert.equal(v.fields.finality,'finalized');assert.equal(v.projectionVersion,PROJECTION_VERSION);});
test('02 outcome not granted to unknown viewer',()=>{const {a,id}=finalSetup();notVisible(read(a,F,id,'outsider'));});
test('03 issuer not clientKind: final with claim label remains final',()=>{const {a,id}=finalSetup();assert.equal(read(a,F,id,'viewer-a','HEARD_CLAIM').kind,'VERIFIED_OUTCOME');});
test('04 issuer not clientKind: action with final label remains support',()=>{const {a,id}=actionSetup();assert.equal(read(a,A,id,'viewer-a','VERIFIED_OUTCOME').kind,'PUBLIC_SUPPORT');});
test('05 public support text never becomes winner',()=>{const {a,id}=actionSetup('PUBLIC_SUPPORT',{approvedPublishedText:'A won',privateData:{winnerId:'A'}});const v=read(a,A,id);assert.equal(v.fields.approvedPublishedText,'A won');assert.ok(!('mechanicalWinnerDisplay'in v.fields));});
test('06 support event has distinct source lineage',()=>{const {a,id}=actionSetup();notVisible(read(a,F,id));assert.equal(read(a,A,id).kind,'PUBLIC_SUPPORT');});
test('07 private proposal visible only on private surface to target',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL');const v=read(a,A,id);assert.equal(v.kind,'CHALLENGE_PROPOSAL');assert.equal(v.surface,'PRIVATE_RECIPIENT');assert.equal(v.fields.proposalState,'PROPOSED');});
test('08 private proposal not visible to bystander even if audience accidentally includes them',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL');viewer(a,A,id,'viewer-b',proposalFields);notVisible(read(a,A,id,'viewer-b'));});
test('09 public support is not proposal',()=>{const {a,id}=actionSetup();assert.equal(read(a,A,id).kind,'PUBLIC_SUPPORT');assert.ok(!('proposalText'in read(a,A,id).fields));});
test('10 private proposal is not accepted final',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL');assert.ok(!('finality'in read(a,A,id).fields));assert.ok(!('winnerId'in read(a,A,id).fields));});
test('11 no source ID unknown',()=>{const a=base();notVisible(read(a,F,'unknown'));});
test('12 no audience ACL',()=>{const a=base();a.registerFinal({eventId:'e',battleId:'b'});notVisible(read(a,F,'e'));});
test('13 no viewer grant',()=>{const a=base();a.registerFinal({eventId:'e',battleId:'b'});a.setAudience(F,'e',{viewerIds:['viewer-a'],fields:outcomeFields});notVisible(read(a,F,'e'));});
test('14 inactive audience',()=>{const {a,id}=finalSetup();a.setAudience(F,id,{active:false,viewerIds:['viewer-a'],fields:outcomeFields});notVisible(read(a,F,id));});
test('15 no mandatory finality scope',()=>{const {a,id}=finalSetup();viewer(a,F,id,'viewer-a',['mechanicalOutcome']);notVisible(read(a,F,id));});
test('16 no mandatory public text scope',()=>{const {a,id}=actionSetup();viewer(a,A,id,'viewer-a',['speakerDisplay']);notVisible(read(a,A,id));});
test('17 no mandatory proposal text scope',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL');viewer(a,A,id,'viewer-a',['proposalState']);notVisible(read(a,A,id));});
test('18 viewer fieldScope restricts final fields',()=>{const {a,id}=finalSetup();viewer(a,F,id,'viewer-a',['finality']);assert.deepEqual(read(a,F,id).fields,{finality:'finalized'});});
test('19 audience restricts fields independently from viewer',()=>{const {a,id}=finalSetup();a.setAudience(F,id,{viewerIds:['viewer-a'],fields:['finality']});assert.deepEqual(read(a,F,id).fields,{finality:'finalized'});});
test('20 two viewers different scopes not sharing cache or IDs',()=>{const {a,id}=finalSetup();a.setAudience(F,id,{viewerIds:['viewer-a','viewer-b'],fields:outcomeFields});a.grantViewer('viewer-a',F,id,{fieldScope:outcomeFields,generation:1,accessEpoch:1});a.grantViewer('viewer-b',F,id,{fieldScope:['finality'],generation:2,accessEpoch:2});const x=read(a,F,id),y=read(a,F,id,'viewer-b');assert.deepEqual(Object.keys(y.fields),['finality']);assert.notEqual(x.publicItemRef,y.publicItemRef);assert.equal(x.cacheControl,'no-store');assert.equal(y.cacheControl,'no-store');});
test('21 repeat same view has stable viewer-scoped history identity',()=>{const {a,id}=finalSetup();assert.equal(read(a,F,id).publicItemRef,read(a,F,id).publicItemRef);});
test('22 same original event sourceVersion does not follow projection version',()=>{const {a,id}=finalSetup();const v=read(a,F,id);assert.equal(v.projectionVersion,PROJECTION_VERSION);assert.equal(v.fields.finality,'finalized');assert.ok(!('eventVersion' in v));});
test('23 never raw source/receipt/digest/private state in visible response',()=>{const {a,id}=finalSetup({privateData:{bearer:'secret',state_json:'secret',issuerSignature:'secret',judgeInternal:9,dm:'private'}});const text=JSON.stringify(read(a,F,id));for(const k of ['bearer','state_json','issuerSignature','judgeInternal','private','battle-01:final','npc-1'])assert.ok(!text.includes(k),`leak: ${k}`);});
test('24 no relay public event projection',()=>{const a=base();a.recordRelay({receiptId:'r1',sourceSystem:F,canonicalEventId:'b:final',speakerId:'s',recipientId:'npc-1',claimText:'A won'});notVisible(read(a,R,'r1'));});
test('25 relay cannot give outcome even if describes true final',()=>{const {a,id}=finalSetup();a.recordRelay({receiptId:'r1',sourceSystem:F,canonicalEventId:id,speakerId:'s',recipientId:'npc-1',claimText:'A won'});notVisible(read(a,R,'r1'));assert.equal(a.sourceCount,1);});
test('26 same relay receipt idempotent',()=>{const a=base();const r={receiptId:'r1',sourceSystem:F,canonicalEventId:'e',speakerId:'s',recipientId:'npc-1',claimText:'x'};assert.equal(a.recordRelay(r),'RECORDED_DELIVERY_ONLY');assert.equal(a.recordRelay(r),'IDEMPOTENT_REPLAY');assert.equal(a.deliveryCount,1);});
test('27 changed same receipt quarantine',()=>{const a=base();const r={receiptId:'r1',sourceSystem:F,canonicalEventId:'e',speakerId:'s',recipientId:'npc-1',claimText:'x'};a.recordRelay(r);assert.equal(a.recordRelay({...r,claimText:'not x'}),'CONFLICT_QUARANTINE');assert.equal(a.isRelayConflicted('r1'),true);assert.equal(a.deliveryCount,1);});
test('28 different relay receipts same claim no new source',()=>{const {a,id}=finalSetup();const r={sourceSystem:F,canonicalEventId:id,speakerId:'s',recipientId:'npc-1',claimText:'A won'};a.recordRelay({...r,receiptId:'r1'});a.recordRelay({...r,receiptId:'r2'});assert.equal(a.deliveryCount,2);assert.equal(a.sourceCount,1);assert.equal(read(a,F,id).kind,'VERIFIED_OUTCOME');});
test('29 identical final retry is idempotent',()=>{const {a,id}=finalSetup();const s=a.sourceCount;assert.equal(a.registerFinal({eventId:id,battleId:'battle-01'}),'IDEMPOTENT_REPLAY');assert.equal(a.sourceCount,s);});
test('30 same final ID altered result quarantined',()=>{const {a,id}=finalSetup();assert.equal(a.registerFinal({eventId:id,battleId:'battle-01',mechanicalOutcome:'B_WIN'}),'CONFLICT_QUARANTINE');notVisible(read(a,F,id));});
test('31 conflicting distinct final IDs same battle quarantine both',()=>{const {a,id}=finalSetup();a.registerFinal({eventId:'battle-01:final:alias',battleId:'battle-01'});notVisible(read(a,F,id));});
test('32 vote row cannot masquerade as final',()=>{const a=base();a.registerUntrusted({sourceSystem:F,issuerClass:'SOCIAL_VOTE_CLOSED',id:'vote',committed:true,receipt:true});viewer(a,F,'vote');notVisible(read(a,F,'vote'));});
test('33 judge opinion cannot masquerade as final',()=>{const a=base();a.registerUntrusted({sourceSystem:F,issuerClass:'NPC_JUDGE_PROPOSAL',id:'judge',committed:true,receipt:true});viewer(a,F,'judge');notVisible(read(a,F,'judge'));});
test('34 action-issuer cannot masquerade in final namespace',()=>{const a=base();a.registerUntrusted({sourceSystem:F,issuerClass:'NPC_ACTION_DERIVATIVE',id:'e',actionKind:'PUBLIC_SUPPORT',committed:true,receipt:true});viewer(a,F,'e');notVisible(read(a,F,'e'));});
test('35 final-issuer cannot masquerade in action namespace',()=>{const a=base();a.registerUntrusted({sourceSystem:A,issuerClass:'BATTLE_TERMINAL_FINAL',id:'e',committed:true,receipt:true});viewer(a,A,'e');notVisible(read(a,A,'e'));});
test('36 unsigned/uncommitted final forbidden',()=>{const {a,id}=finalSetup({receipt:false});notVisible(read(a,F,id));});
test('37 pending final forbidden',()=>{const {a,id}=finalSetup({committed:false});notVisible(read(a,F,id));});
test('38 nonfinal phase forbidden',()=>{const {a,id}=finalSetup({phase:'voting'});notVisible(read(a,F,id));});
test('39 bad final outcome forbidden',()=>{const {a,id}=finalSetup({mechanicalOutcome:'MAGIC'});notVisible(read(a,F,id));});
test('40 DRAW no invented mechanical winner',()=>{const {a,id}=finalSetup({mechanicalOutcome:'DRAW',recognizedOutcome:'DRAW'});const x=read(a,F,id);assert.equal(x.fields.mechanicalOutcome,'DRAW');assert.ok(!('mechanicalWinnerDisplay'in x.fields));});
test('41 revoked recipient invalidates source viewing',()=>{const {a,id}=finalSetup();a.revokeRecipient('npc-1');notVisible(read(a,F,id));});
test('42 stale recipient generation invalidates source viewing',()=>{const {a,id}=finalSetup();a.setRecipient('npc-1',{generation:2,accessEpoch:1});notVisible(read(a,F,id));});
test('43 stale recipient accessEpoch invalidates source viewing',()=>{const {a,id}=finalSetup();a.setRecipient('npc-1',{generation:1,accessEpoch:2});notVisible(read(a,F,id));});
test('44 revoked recipient during prepare/emit fails closed',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.revokeRecipient('npc-1');notVisible(emitProjection(a,p.token));});
test('45 revoked viewer during prepare/emit fails closed',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.revokeViewer('viewer-a',F,id);notVisible(emitProjection(a,p.token));});
test('46 audience ACL changes between phases fail closed',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.setAudience(F,id,{viewerIds:['viewer-a'],fields:['finality'],revision:2});notVisible(emitProjection(a,p.token));});
test('47 silent audience field change with unchanged rev still fails',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.setAudience(F,id,{viewerIds:['viewer-a'],fields:['finality'],revision:1});notVisible(emitProjection(a,p.token));});
test('48 grant generation change between phases fails',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.grantViewer('viewer-a',F,id,{generation:2,accessEpoch:1,fieldScope:outcomeFields});notVisible(emitProjection(a,p.token));});
test('49 grant accessEpoch change between phases fails',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.grantViewer('viewer-a',F,id,{generation:1,accessEpoch:2,fieldScope:outcomeFields});notVisible(emitProjection(a,p.token));});
test('50 grant visibility revision change between phases fails',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.grantViewer('viewer-a',F,id,{generation:1,accessEpoch:1,fieldScope:outcomeFields,revision:2});notVisible(emitProjection(a,p.token));});
test('51 token cannot be forged',()=>{const {a}=finalSetup();notVisible(emitProjection(a,{}));});
test('52 token cannot be used with different authority',()=>{const {a,id}=finalSetup();const b=base();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});notVisible(emitProjection(b,p.token));});
test('53 no outside viewer cache reuse via token: token binds viewer',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});const v=emitProjection(a,p.token);assert.equal(v.status,'VISIBLE');assert.equal(v.cacheControl,'no-store');assert.ok(!('viewerId' in v));});
test('54 origin event count unaffected by different client kind labels',()=>{const {a,id}=actionSetup();const c=a.sourceCount;for(const k of ['VERIFIED_OUTCOME','HEARD_CLAIM','CHALLENGE_PROPOSAL','fake'])assert.equal(read(a,A,id,'viewer-a',k).kind,'PUBLIC_SUPPORT');assert.equal(a.sourceCount,c);});
test('55 wrong original event identity denied',()=>{const {a}=finalSetup();notVisible(read(a,F,'different:final'));});
test('56 canonical sourceSystem cannot alias cross-domain',()=>{const {a,id}=finalSetup();notVisible(read(a,A,id));});
test('57 unknown kind source denied',()=>{const a=base();a.registerUntrusted({sourceSystem:'unknown',issuerClass:'BATTLE_TERMINAL_FINAL',id:'e',receipt:true,committed:true});viewer(a,'unknown','e');notVisible(read(a,'unknown','e'));});
test('58 no proposal without committed action',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL',{committed:false});notVisible(read(a,A,id));});
test('59 no support without approved route',()=>{const {a,id}=actionSetup('PUBLIC_SUPPORT',{route:'PRIVATE_RECIPIENT'});notVisible(read(a,A,id));});
test('60 no proposal on PUBLIC route',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL',{route:'AUTHORIZED_PUBLIC'});notVisible(read(a,A,id));});
test('61 support issuer receipt absent denied',()=>{const {a,id}=actionSetup('PUBLIC_SUPPORT',{receipt:false});notVisible(read(a,A,id));});
test('62 proposal receipt absent denied',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL',{receipt:false});notVisible(read(a,A,id));});
test('63 action retry idempotent',()=>{const {a,id}=actionSetup();assert.equal(a.registerAction({actionId:id}),'IDEMPOTENT_REPLAY');assert.equal(a.sourceCount,1);});
test('64 same action id with changed text quarantined',()=>{const {a,id}=actionSetup();assert.equal(a.registerAction({actionId:id,approvedPublishedText:'other'}),'CONFLICT_QUARANTINE');notVisible(read(a,A,id));});
test('65 wrong viewer cannot enumerate source through response fields',()=>{const {a,id}=finalSetup();const denied=read(a,F,id,'stranger');assert.ok(!JSON.stringify(denied).includes(id));});
test('66 private action never carries raw proposed recipient ID in DTO',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL');const text=JSON.stringify(read(a,A,id));assert.ok(!text.includes('viewer-a'));assert.ok(!text.includes('npc-1'));assert.ok(!text.includes(id));});
test('67 no accessEpoch bypass on retry',()=>{const {a,id}=finalSetup();a.revokeViewer('viewer-a',F,id);notVisible(read(a,F,id));notVisible(read(a,F,id));});
test('68 no stale prepared token after source conflict',()=>{const {a,id}=finalSetup();const p=prepareProjection(a,{viewerId:'viewer-a',locator:loc(F,id)});a.registerFinal({eventId:id,battleId:'battle-01',recognizedOutcome:'B_WIN'});notVisible(emitProjection(a,p.token));});
test('69 original history source unchanged on duplicate delivery',()=>{const {a,id}=finalSetup();const before=projectedHistoryKey(a,{viewerId:'viewer-a',locator:loc(F,id)});const rr={receiptId:'r',sourceSystem:F,canonicalEventId:id,speakerId:'npc',recipientId:'npc-1',claimText:'x'};a.recordRelay(rr);a.recordRelay(rr);assert.equal(projectedHistoryKey(a,{viewerId:'viewer-a',locator:loc(F,id)}),before);});
test('70 proposed action not turned into new final by relay',()=>{const {a,id}=actionSetup('CHALLENGE_PROPOSAL');a.recordRelay({receiptId:'r',sourceSystem:A,canonicalEventId:id,speakerId:'npc',recipientId:'npc-1',claimText:'battle completed'});notVisible(read(a,R,'r'));assert.equal(read(a,A,id).kind,'CHALLENGE_PROPOSAL');});
