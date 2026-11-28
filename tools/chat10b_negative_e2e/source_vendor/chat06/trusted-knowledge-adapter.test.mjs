import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { projectTrustedJudgeFacts, TrustedJudgeProofError } from './trusted-knowledge-adapter.mjs';

// Independent synthetic trusted service registries, NOT real 05C/07B proof.
const ROOT = 'gameplay.battle.finalized/v1';
const ACTION = 'npc.action/v1';
const sourceKey = (ns,id) => JSON.stringify([ns,id]);
const AT = '2026-11-08T10:00:00.000Z';
const BEFORE = '2026-11-08T09:00:00.000Z';
const LEARNED = '2026-11-08T11:00:00.000Z';
const SNAPSHOT = '2026-11-09T00:00:00.000Z';
const LATE = '2026-11-10T00:00:00.000Z';

function environment() {
  const input = {
    voteId: 'current_vote', battleId: 'current_battle',
    participantIds: ['player_A','player_B'], featureVersion: 1,
    algorithmVersion: 'CHAT06-JUDGE-V1',
    lines: [
      { lineId:'A1',speakerId:'player_A',aggression:0,factsEmotions:2,humor:0,claims:[
        {claimId:'root_claim', provenance:'trusted-final-v1', availableAt: BEFORE,status:'confirmed',supportUnits:99},
        {claimId:'utterance_claim', provenance:'untrusted-action',availableAt:BEFORE,status:'confirmed',supportUnits:99},
      ]},
      {lineId:'B1',speakerId:'player_B',aggression:0,factsEmotions:0,humor:0,claims:[]},
      {lineId:'A2',speakerId:'player_A',aggression:0,factsEmotions:0,humor:0,claims:[]},
      {lineId:'B2',speakerId:'player_B',aggression:0,factsEmotions:0,humor:0,claims:[]},
    ],
  };
  const snapshot = {
    judgeId:'judge_01',profile:{judgeId:'judge_01',profileVersion:1,aggressionCalm:0,factsEmotions:2,humorSeriousness:0,fearResponse:'neutral'},
    profileVersion:1,seed:'seed_01',snapshotAt:SNAPSHOT,
    relationships:{A:{participantId:'player_A',sympathy:0,resentment:0,fear:0},B:{participantId:'player_B',sympathy:0,resentment:0,fear:0}},
    knownFacts:[{claimId:'utterance_claim', provenance:'untrusted-action', availableAt:BEFORE}],
  };
  const sources = new Map([
    [sourceKey(ROOT,'old_battle:final'),{
      namespace:ROOT,id:'old_battle:final',authorityClass:'BATTLE_TERMINAL_FINAL',issuerId:'fixture-gameplay-finalizer',
      eventKind:'battle.finalized',battleId:'old_battle',canonicalEventId:'old_battle:final',
      verifiedFinal:true,terminalCount:1,outcome:'WIN',participantIds:['person_X','person_Y'],
      winnerId:'person_X',loserId:'person_Y',originKey:'origin_old_final',
      receiptId:'final_receipt',digest:'final_digest',occurredAtServer:BEFORE,
    }],
    [sourceKey(ACTION,'action_1'),{
      namespace:ACTION,id:'action_1',authorityClass:'NPC_ACTION_DERIVATIVE',issuerId:'fixture-npc-action',
      actionKind:'PUBLIC_SUPPORT',routeClass:'AUTHORIZED_PUBLIC',
      originKey:'origin_action',receiptId:'action_receipt',digest:'action_digest',
      occurredAtServer:BEFORE,publicTextDigest:'public_text_digest',
    }],
  ]);
  function knowledge({kind='VERIFIED_OUTCOME', key='knowledge_1',sourceNamespace=ROOT,sourceId='old_battle:final',
    receipt='final_receipt',digest='final_digest',origin='origin_old_final',
    grantId='grant_root',scope='battle.outcome',first=LEARNED,assertionId='assertion_1',relayReceiptId,
    observedAtServer,observationReceiptId,deliveryIssuerClass}) {
    return {knowledgeKey:key, knowledgeKind:kind,sourceNamespace,sourceId,sourceReceiptId:receipt,
      sourceDigest:digest, sourceOriginKey:origin,recipientNpcId:'judge_01',recipientId:'judge_01',
      recipientRole:'judge',grantId,grantGeneration:2,accessEpoch:4,fieldScope:scope,
      firstLearnedAtServer:first,knowledgeReceiptDigest:`digest_${key}`,assertionId,
      relayReceiptId,observationReceiptId,observedAtServer,deliveryIssuerClass};
  }
  const knowledgeMap = new Map([
    ['knowledge_1', knowledge({})],
    ['knowledge_action',knowledge({kind:'VERIFIED_UTTERANCE',key:'knowledge_action',sourceNamespace:ACTION,sourceId:'action_1',
      receipt:'action_receipt',digest:'action_digest',origin:'origin_action',grantId:'grant_action',scope:'npc.public_support',
      observedAtServer:AT,observationReceiptId:'actual_observation'})],
    ['knowledge_relay1',knowledge({kind:'HEARD_CLAIM',key:'knowledge_relay1',sourceNamespace:ACTION,sourceId:'action_1',
      receipt:'action_receipt',digest:'action_digest',origin:'origin_action',grantId:'grant_relay',scope:'npc.relay',
      relayReceiptId:'relay_1',deliveryIssuerClass:'SERVER_RELAY_RECEIPT'})],
    ['knowledge_relay2',knowledge({kind:'HEARD_CLAIM',key:'knowledge_relay2',sourceNamespace:ACTION,sourceId:'action_1',
      receipt:'action_receipt',digest:'action_digest',origin:'origin_action',grantId:'grant_relay',scope:'npc.relay',
      relayReceiptId:'relay_2',deliveryIssuerClass:'SERVER_RELAY_RECEIPT'})],
  ]);
  const grants = new Map([
    ['grant_root',{id:'grant_root',recipientNpcId:'judge_01',active:true,generation:2,accessEpoch:4,activatedAt:BEFORE,revokedAt:null,fieldScope:['battle.outcome']}],
    ['grant_action',{id:'grant_action',recipientNpcId:'judge_01',active:true,generation:2,accessEpoch:4,activatedAt:BEFORE,revokedAt:null,fieldScope:['npc.public_support']}],
    ['grant_relay',{id:'grant_relay',recipientNpcId:'judge_01',active:true,generation:2,accessEpoch:4,activatedAt:BEFORE,revokedAt:null,fieldScope:['npc.relay']}],
  ]);
  const assertions = new Map([
    ['assertion_1',{id:'assertion_1',sourceNamespace:ROOT,sourceId:'old_battle:final',propositionKind:'WINNER',
      winnerId:'person_X',canonicalAssertionId:'old_battle:WINNER:person_X',claimId:'root_claim',provenance:'trusted-final-v1',status:'confirmed',supportUnits:2,approved:true}],
  ]);
  const authority = {
    getSource:(ns,id)=>sources.get(sourceKey(ns,id)),
    getKnowledge:key=>knowledgeMap.get(key),
    getGrant:id=>grants.get(id),
    getAssertion:id=>assertions.get(id),
    approvedIssuerFor:ns=>({[ROOT]:'fixture-gameplay-finalizer',[ACTION]:'fixture-npc-action'})[ns],
  };
  const ref = key => {const k=knowledgeMap.get(key);return {
    knowledgeKey:k.knowledgeKey, knowledgeKind:k.knowledgeKind,sourceNamespace:k.sourceNamespace,
    sourceId:k.sourceId,sourceReceiptId:k.sourceReceiptId,sourceDigest:k.sourceDigest,
    recipientNpcId:k.recipientNpcId,grantId:k.grantId,grantGeneration:k.grantGeneration,
    accessEpoch:k.accessEpoch,firstLearnedAtServer:k.firstLearnedAtServer,
    knowledgeReceiptDigest:k.knowledgeReceiptDigest,
    ...(k.relayReceiptId ? {relayReceiptId:k.relayReceiptId} : {}),
  };};
  const project=(keys)=>projectTrustedJudgeFacts({input,snapshot,evidenceRefs:keys.map(k=>typeof k==='string'?ref(k):k)},authority);
  return {input,snapshot,authority,sources,knowledgeMap,grants,assertions,knowledge,ref,project};
}
const expectCode = (call,code)=>assert.throws(call,e=>e instanceof TrustedJudgeProofError && e.code===code);

test('verified historic outcome alone creates one exactly mapped positive knownFact',()=>{
  const e=environment();const r=e.project(['knowledge_1']);
  assert.deepEqual(r.snapshot.knownFacts,[{claimId:'root_claim',provenance:'trusted-final-v1',availableAt:LEARNED}]);
  assert.equal(r.input.lines[0].claims[0].status,'confirmed');
  assert.equal(r.input.lines[0].claims[0].supportUnits,2);
  assert.equal(r.input.lines[0].claims[0].availableAt,LEARNED);
  assert.equal(r.input.lines[0].claims[1].status,'unknown');
  assert.equal(r.input.lines[0].claims[1].supportUnits,0);
  assert.equal(e.input.lines[0].claims[0].supportUnits,99); // no source mutation
  assert.equal(r.privateEvidenceManifest.stage,'OFFLINE_FIXTURE_ONLY');
  assert.ok(Object.isFrozen(r.snapshot));
});

test('without trusted evidence even prefilled positive input and knownFacts are cleared',()=>{
  const r=environment().project([]);
  assert.deepEqual(r.snapshot.knownFacts,[]);
  assert.deepEqual(r.input.lines[0].claims.map(x=>x.supportUnits),[0,0]);
  assert.deepEqual(r.input.lines[0].claims.map(x=>x.status),['unknown','unknown']);
});

test('verified PUBLIC_SUPPORT is utterance only, never proof of its claim',()=>{
  const r=environment().project(['knowledge_action']);
  assert.deepEqual(r.snapshot.knownFacts,[]);
  assert.equal(r.input.lines[0].claims[1].status,'unknown');
  assert.equal(r.privateEvidenceManifest.receipts[0].knowledgeKind,'VERIFIED_UTTERANCE');
  assert.equal(r.input.lines[0].claims[1].supportUnits,0);
});

test('two relay receipts and exact replay cannot increase support',()=>{
  const e=environment();const r=e.project(['knowledge_relay1','knowledge_relay2','knowledge_relay1']);
  assert.deepEqual(r.snapshot.knownFacts,[]);
  assert.equal(r.privateEvidenceManifest.receipts.length,2);
  assert.deepEqual(r.input.lines[0].claims.map(c=>c.supportUnits),[0,0]);
});

test('identical verified outcome replay returns identical result without duplicate facts',()=>{
  const e=environment(),a=e.project(['knowledge_1','knowledge_1']),b=e.project(['knowledge_1']);
  assert.deepEqual(a.snapshot.knownFacts,b.snapshot.knownFacts);
  assert.equal(a.privateEvidenceManifest.receipts.length,1);
});

test('issuer spoofing a derivative as a terminal outcome is rejected',()=>{
  const e=environment();const k=e.knowledgeMap.get('knowledge_1');
  k.sourceNamespace=ACTION;k.sourceId='action_1';k.sourceReceiptId='action_receipt';
  k.sourceDigest='action_digest';k.sourceOriginKey='origin_action';
  expectCode(()=>e.project(['knowledge_1']),'UNTRUSTED_FINAL_ORIGIN');
});

test('altered source receipt or digest is rejected',()=>{
  const e=environment(),ref=e.ref('knowledge_1');ref.sourceDigest='forged_digest';
  expectCode(()=>e.project([ref]),'ALTERED_KNOWLEDGE_RECEIPT');
  const f=environment();f.sources.get(sourceKey(ROOT,'old_battle:final')).digest='modified';
  expectCode(()=>f.project(['knowledge_1']),'ALTERED_SOURCE_RECEIPT');
});

test('revoked grant fails closed',()=>{
  const e=environment();e.grants.get('grant_root').active=false;
  expectCode(()=>e.project(['knowledge_1']),'GRANT_DENIED');
});

test('grant with a stale access epoch is rejected',()=>{
  const e=environment();e.grants.get('grant_root').accessEpoch=5;
  expectCode(()=>e.project(['knowledge_1']),'GRANT_DENIED');
});

test('wrong recipient is rejected even with valid source and grant',()=>{
  const e=environment();let ref=e.ref('knowledge_1');ref.recipientNpcId='judge_other';
  expectCode(()=>e.project([ref]),'FOREIGN_RECIPIENT');
  const f=environment();f.knowledgeMap.get('knowledge_1').recipientId='judge_other';
  expectCode(()=>f.project(['knowledge_1']),'FOREIGN_RECIPIENT');
});

test('knowledge learned after judge freeze is not allowed',()=>{
  const e=environment();e.knowledgeMap.get('knowledge_1').firstLearnedAtServer=LATE;
  expectCode(()=>e.project(['knowledge_1']),'LATE_KNOWLEDGE');
});

test('claim and knownFact availableAt are both derived from first legal learning, not caller timestamp',()=>{
  const e=environment();e.input.lines[0].claims[0].availableAt=BEFORE;
  const r=e.project(['knowledge_1']);
  assert.equal(r.input.lines[0].claims[0].availableAt,r.snapshot.knownFacts[0].availableAt);
  assert.equal(r.snapshot.knownFacts[0].availableAt,LEARNED);
});

test('draw can never be turned into a winner even by an approved claim map',()=>{
  const e=environment(),s=e.sources.get(sourceKey(ROOT,'old_battle:final'));
  s.outcome='DRAW';s.winnerId=null;s.loserId=null;
  expectCode(()=>e.project(['knowledge_1']),'ASSERTION_OUTCOME_CONFLICT');
  const f=environment(),src=f.sources.get(sourceKey(ROOT,'old_battle:final'));
  src.outcome='DRAW';src.winnerId='person_X';
  expectCode(()=>f.project(['knowledge_1']),'DRAW_WINNER_FORBIDDEN');
});

test('unsupported positive assertion mapping fails instead of inventing a winner',()=>{
  const e=environment();e.assertions.get('assertion_1').approved=false;
  expectCode(()=>e.project(['knowledge_1']),'ASSERTION_UNAPPROVED');
});

test('valid DRAW proposition is distinct and can be supported only by an explicit approved DRAW map',()=>{
  const e=environment(),src=e.sources.get(sourceKey(ROOT,'old_battle:final'));
  src.outcome='DRAW';src.winnerId=null;src.loserId=null;
  e.assertions.get('assertion_1').propositionKind='DRAW';
  e.assertions.get('assertion_1').winnerId=null;
  const r=e.project(['knowledge_1']);
  assert.equal(r.snapshot.knownFacts.length,1); // supports the DRAW statement, not a victory
});

test('numeric eventId/actionId collision across namespaces does not merge authority',()=>{
  const e=environment();const src=e.sources.get(sourceKey(ACTION,'action_1'));
  e.sources.delete(sourceKey(ACTION,'action_1'));
  src.id='old_battle:final';e.sources.set(sourceKey(ACTION,'old_battle:final'),src);
  const k=e.knowledgeMap.get('knowledge_action');k.sourceId='old_battle:final';
  const r=e.project(['knowledge_action','knowledge_1']);
  assert.equal(r.snapshot.knownFacts.length,1);
  assert.equal(r.privateEvidenceManifest.receipts.length,2);
});

test('two different canonical final eventIds for one battle are rejected',()=>{
  const e=environment();const src=e.sources.get(sourceKey(ROOT,'old_battle:final'));
  src.terminalCount=2;
  expectCode(()=>e.project(['knowledge_1']),'UNTRUSTED_FINAL_ORIGIN');
});

test('private proposal cannot be laundered into public support',()=>{
  const e=environment();e.sources.get(sourceKey(ACTION,'action_1')).actionKind='CHALLENGE_PROPOSAL';
  expectCode(()=>e.project(['knowledge_action']),'UNTRUSTED_UTTERANCE');
  expectCode(()=>e.project(['knowledge_relay1']),'UNTRUSTED_RELAY');
});

test('altered replay receipt is conflict, not a new source of support',()=>{
  const e=environment(),r=e.ref('knowledge_1');r.knowledgeReceiptDigest='tampered';
  expectCode(()=>e.project([r]),'ALTERED_KNOWLEDGE_RECEIPT');
});

test('foreign scope, unknown grant and missing source deny knowledge',()=>{
  const e=environment();e.grants.get('grant_root').fieldScope=['npc.public_support'];
  expectCode(()=>e.project(['knowledge_1']),'FIELD_SCOPE_DENIED');
  const f=environment();f.grants.delete('grant_root');
  expectCode(()=>f.project(['knowledge_1']),'GRANT_DENIED');
  const g=environment();g.sources.delete(sourceKey(ROOT,'old_battle:final'));
  expectCode(()=>g.project(['knowledge_1']),'SOURCE_UNAVAILABLE');
});

test('provider lookup is mandatory; caller-controlled verified flags have no authority',()=>{
  const e=environment();const ref=e.ref('knowledge_1');ref.verified=true;ref.issuer='trusted';
  expectCode(()=>projectTrustedJudgeFacts({input:e.input,snapshot:e.snapshot,evidenceRefs:[ref]},{}),
    'INVALID_ADAPTER_CONTEXT');
});


test('spoofed trusted issuer identity is rejected against independent allowlist',()=>{
  const e=environment();e.sources.get(sourceKey(ROOT,'old_battle:final')).issuerId='attacker';
  expectCode(()=>e.project(['knowledge_1']),'ISSUER_UNTRUSTED');
});

test('one canonical assertion cannot inflate support using a second claimId',()=>{
  const e=environment(),cl=e.input.lines[2].claims;
  cl.push({claimId:'root_claim_alias',provenance:'alias-provenance',availableAt:BEFORE,status:'confirmed',supportUnits:99});
  const second=e.knowledge({key:'knowledge_alias',assertionId:'assertion_alias'});
  e.knowledgeMap.set('knowledge_alias',second);
  e.assertions.set('assertion_alias',{
    ...e.assertions.get('assertion_1'),id:'assertion_alias',claimId:'root_claim_alias',provenance:'alias-provenance',
  });
  expectCode(()=>e.project(['knowledge_1','knowledge_alias']),'DUPLICATE_SEMANTIC_ASSERTION');
});

test('active flag cannot mask a revocation timestamp at freeze',()=>{
  const e=environment();e.grants.get('grant_root').revokedAt=BEFORE;
  expectCode(()=>e.project(['knowledge_1']),'GRANT_DENIED');
});

test('non-data getters and symbol fields cannot be laundered through structuredClone',()=>{
  const e=environment();Object.defineProperty(e.input,'unsafe',{enumerable:true,get(){return 5;}});
  expectCode(()=>e.project(['knowledge_1']),'INVALID_DATA_OBJECT');
  const f=environment();f.snapshot[Symbol('shadow')]='test';
  expectCode(()=>f.project(['knowledge_1']),'INVALID_DATA_OBJECT');
});

test('private proof manifest does not appear as new evaluator input fields',()=>{
  const r=environment().project(['knowledge_1']);
  assert.deepEqual(Object.keys(r.snapshot).sort(),['judgeId','knownFacts','profile','profileVersion','relationships','seed','snapshotAt']);
  assert.deepEqual(Object.keys(r.snapshot.knownFacts[0]).sort(),['availableAt','claimId','provenance']);
  assert.equal(Object.hasOwn(r.input,'privateEvidenceManifest'),false);
  assert.equal(Object.hasOwn(r.snapshot,'grantId'),false);
  assert.deepEqual(r.privateEvidenceManifest.verifiedPositiveFacts.map(f=>f.claimId),['root_claim']);
});

// When run inside the actual existing PR452 directory, this is an exact runtime
// schema smoke; in the isolated cloud checkpoint scratch it is skipped, not PASS.
const hasJudgeFile=existsSync(fileURLToPath(new URL('./judge.mjs',import.meta.url)));
test('strict output matches the existing PR452 evaluator', {skip:!hasJudgeFile}, async()=>{
  const {evaluateJudge}=await import('./judge.mjs');
  const e=environment();
  const r=e.project(['knowledge_1','knowledge_action','knowledge_relay1']);
  const result=evaluateJudge(r.input,r.snapshot);
  assert.equal(result.judgeId,'judge_01');
  assert.ok(/^[a-f0-9]{64}$/.test(result.fullInputHash));
  assert.equal(r.snapshot.knownFacts.length,1);
});

test('numeric grant generation is mandatory even if all untrusted fields agree',()=>{
  const e=environment(),r=e.ref('knowledge_1');r.grantGeneration=undefined;
  expectCode(()=>e.project([r]),'INVALID_DATA_OBJECT');
});

test('one relay receipt under two different keys cannot appear twice in audit',()=>{
  const e=environment();
  const alias=e.knowledge({kind:'HEARD_CLAIM',key:'knowledge_relay_alias',sourceNamespace:ACTION,
    sourceId:'action_1',receipt:'action_receipt',digest:'action_digest',origin:'origin_action',
    grantId:'grant_relay',scope:'npc.relay',relayReceiptId:'relay_1',
    deliveryIssuerClass:'SERVER_RELAY_RECEIPT'});
  e.knowledgeMap.set('knowledge_relay_alias',alias);
  const r=e.project(['knowledge_relay1','knowledge_relay_alias']);
  assert.equal(r.privateEvidenceManifest.receipts.length,1);
  assert.deepEqual(r.snapshot.knownFacts,[]);
});

test('relay receipt rebound to a different source digest is quarantined',()=>{
  const e=environment();
  const alias=e.knowledge({kind:'HEARD_CLAIM',key:'knowledge_relay_alias',sourceNamespace:ACTION,
    sourceId:'action_1',receipt:'action_receipt',digest:'new_digest',origin:'origin_action',
    grantId:'grant_relay',scope:'npc.relay',relayReceiptId:'relay_1',
    deliveryIssuerClass:'SERVER_RELAY_RECEIPT'});
  e.knowledgeMap.set('knowledge_relay_alias',alias);
  // A changed source digest already mismatches the trusted source record.
  expectCode(()=>e.project(['knowledge_relay1','knowledge_relay_alias']),'ALTERED_SOURCE_RECEIPT');
});
