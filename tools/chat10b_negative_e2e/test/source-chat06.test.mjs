import test from 'node:test';
import assert from 'node:assert/strict';
// This is the unchanged original Chat06 V123 V2 source export, NOT a rewritten stub.
import { projectTrustedJudgeFacts, TrustedJudgeProofError } from '../source_vendor/chat06/trusted-knowledge-adapter.mjs';

const ROOT = 'gameplay.battle.finalized/v1';
const ACTION = 'npc.action/v1';
const before = '2026-11-09T10:00:00.000Z';
const learned = '2026-11-09T11:00:00.000Z';
const freeze = '2026-11-09T12:00:00.000Z';
const sourceKey = (ns,id) => JSON.stringify([ns,id]);
const provenance = t => t.diagnostic('PROVENANCE=REAL_SOURCE_OFFLINE original=CHAT06_V123_JUDGE_PROOF_ADAPTER_CHECKPOINT_V2.zip source_sha256=d5a3d4b5cb4e4988a3527e7195d3016eef61f9646338c10e4028c0c6032f1e09 provider=synthetic runtimePass=false');
function setup(){
  const input={voteId:'vote_current',battleId:'battle_current',participantIds:['playerA','playerB'],algorithmVersion:'CHAT06-JUDGE-V1',lines:[
    {lineId:'A1',speakerId:'playerA',aggression:0,factsEmotions:0,humor:0,claims:[{claimId:'historicWin',provenance:'final',availableAt:before,status:'confirmed',supportUnits:999},{claimId:'speech',provenance:'speech',availableAt:before,status:'confirmed',supportUnits:999}]},
    {lineId:'B1',speakerId:'playerB',aggression:0,factsEmotions:0,humor:0,claims:[]},
    {lineId:'A2',speakerId:'playerA',aggression:0,factsEmotions:0,humor:0,claims:[]},
    {lineId:'B2',speakerId:'playerB',aggression:0,factsEmotions:0,humor:0,claims:[]}
  ]};
  const snapshot={judgeId:'judge',snapshotAt:freeze,knownFacts:[{claimId:'speech',provenance:'speech',availableAt:before}]};
  const sources=new Map([
    [sourceKey(ROOT,'battle_old:final'),{id:'battle_old:final',namespace:ROOT,issuerId:'issuerFinal',authorityClass:'BATTLE_TERMINAL_FINAL',eventKind:'battle.finalized',terminalCount:1,canonicalEventId:'battle_old:final',battleId:'battle_old',verifiedFinal:true,outcome:'WIN',participantIds:['p1','p2'],winnerId:'p1',loserId:'p2',receiptId:'receiptFinal',digest:'digestFinal',originKey:'originFinal',occurredAtServer:before}],
    [sourceKey(ACTION,'action1'),{id:'action1',namespace:ACTION,issuerId:'issuerAction',authorityClass:'NPC_ACTION_DERIVATIVE',actionKind:'PUBLIC_SUPPORT',routeClass:'AUTHORIZED_PUBLIC',receiptId:'receiptAction',digest:'digestAction',originKey:'originAction',occurredAtServer:before,publicTextDigest:'textDigest'}]
  ]);
  const knowledge=new Map([
    ['knowledgeFinal',{knowledgeKey:'knowledgeFinal',knowledgeKind:'VERIFIED_OUTCOME',sourceNamespace:ROOT,sourceId:'battle_old:final',sourceReceiptId:'receiptFinal',sourceDigest:'digestFinal',sourceOriginKey:'originFinal',recipientId:'judge',recipientNpcId:'judge',recipientRole:'judge',grantId:'grantFinal',grantGeneration:2,accessEpoch:4,fieldScope:'battle.outcome',firstLearnedAtServer:learned,knowledgeReceiptDigest:'knowledgeDigestFinal',assertionId:'assertionFinal'}],
    ['knowledgeSpeech',{knowledgeKey:'knowledgeSpeech',knowledgeKind:'VERIFIED_UTTERANCE',sourceNamespace:ACTION,sourceId:'action1',sourceReceiptId:'receiptAction',sourceDigest:'digestAction',sourceOriginKey:'originAction',recipientId:'judge',recipientNpcId:'judge',recipientRole:'judge',grantId:'grantSpeech',grantGeneration:2,accessEpoch:4,fieldScope:'npc.public_support',firstLearnedAtServer:learned,knowledgeReceiptDigest:'knowledgeDigestSpeech',observationReceiptId:'observation1',observedAtServer:before}]
  ]);
  const grants=new Map([
    ['grantFinal',{id:'grantFinal',recipientNpcId:'judge',active:true,generation:2,accessEpoch:4,activatedAt:before,revokedAt:null,fieldScope:['battle.outcome']}],
    ['grantSpeech',{id:'grantSpeech',recipientNpcId:'judge',active:true,generation:2,accessEpoch:4,activatedAt:before,revokedAt:null,fieldScope:['npc.public_support']}]
  ]);
  const assertions=new Map([['assertionFinal',{id:'assertionFinal',sourceNamespace:ROOT,sourceId:'battle_old:final',propositionKind:'WINNER',winnerId:'p1',canonicalAssertionId:'battle_old:WINNER:p1',claimId:'historicWin',provenance:'final',status:'confirmed',supportUnits:2,approved:true}]]);
  const issuerMap=new Map([[ROOT,'issuerFinal'],[ACTION,'issuerAction']]);
  const authority={getSource:(ns,id)=>sources.get(sourceKey(ns,id)),getKnowledge:key=>knowledge.get(key),getGrant:id=>grants.get(id),getAssertion:id=>assertions.get(id),approvedIssuerFor:ns=>issuerMap.get(ns)};
  const ref=key=>{const k=knowledge.get(key);return {knowledgeKey:k.knowledgeKey,knowledgeKind:k.knowledgeKind,sourceNamespace:k.sourceNamespace,sourceId:k.sourceId,sourceReceiptId:k.sourceReceiptId,sourceDigest:k.sourceDigest,recipientNpcId:k.recipientNpcId,grantId:k.grantId,grantGeneration:k.grantGeneration,accessEpoch:k.accessEpoch,firstLearnedAtServer:k.firstLearnedAtServer,knowledgeReceiptDigest:k.knowledgeReceiptDigest};};
  const project=(...keys)=>projectTrustedJudgeFacts({input,snapshot,evidenceRefs:keys.map(ref)},authority);
  return {input,snapshot,sources,knowledge,grants,assertions,issuerMap,ref,project};
}
const code=(fn,expected)=>assert.throws(fn,e=>e instanceof TrustedJudgeProofError && e.code===expected);

test('S06-01 REAL_SOURCE_OFFLINE: authentic export projects exactly one historic fact',t=>{
  provenance(t);const x=setup();const r=x.project('knowledgeFinal');
  assert.equal(r.snapshot.knownFacts.length,1);assert.equal(r.snapshot.knownFacts[0].claimId,'historicWin');
  assert.equal(r.snapshot.knownFacts[0].availableAt,learned);
  assert.equal(r.input.lines[0].claims[0].supportUnits,2);
  assert.equal(r.input.lines[0].claims[1].supportUnits,0);
});
test('S06-02 REAL_SOURCE_OFFLINE: unauthorized issuer fails closed',t=>{
  provenance(t);const x=setup();x.sources.get(sourceKey(ROOT,'battle_old:final')).issuerId='forgedIssuer';
  code(()=>x.project('knowledgeFinal'),'ISSUER_UNTRUSTED');
});
test('S06-03 REAL_SOURCE_OFFLINE: revoke before projection blocks knowledge',t=>{
  provenance(t);const x=setup();x.grants.get('grantFinal').revokedAt=before;
  code(()=>x.project('knowledgeFinal'),'GRANT_DENIED');
});
test('S06-04 REAL_SOURCE_OFFLINE: regrant does not rearm stale grant generation',t=>{
  provenance(t);const x=setup();x.grants.get('grantFinal').generation=3;x.grants.get('grantFinal').accessEpoch=5;
  code(()=>x.project('knowledgeFinal'),'GRANT_DENIED');
});
test('S06-05 REAL_SOURCE_OFFLINE: receipt replay yields one known fact',t=>{
  provenance(t);const x=setup();const r=x.project('knowledgeFinal','knowledgeFinal');
  assert.equal(r.snapshot.knownFacts.length,1);assert.equal(r.privateEvidenceManifest.receipts.length,1);
});
test('S06-06 REAL_SOURCE_OFFLINE: altered receipt detected',t=>{
  provenance(t);const x=setup();x.sources.get(sourceKey(ROOT,'battle_old:final')).digest='mismatched';
  code(()=>x.project('knowledgeFinal'),'ALTERED_SOURCE_RECEIPT');
});
test('S06-07 REAL_SOURCE_OFFLINE: false winner assertion not accepted',t=>{
  provenance(t);const x=setup();x.assertions.get('assertionFinal').winnerId='p2';
  code(()=>x.project('knowledgeFinal'),'ASSERTION_OUTCOME_CONFLICT');
});
test('S06-08 REAL_SOURCE_OFFLINE: repeated final origin fails when terminalCount=2',t=>{
  provenance(t);const x=setup();x.sources.get(sourceKey(ROOT,'battle_old:final')).terminalCount=2;
  code(()=>x.project('knowledgeFinal'),'UNTRUSTED_FINAL_ORIGIN');
});
test('S06-09 REAL_SOURCE_OFFLINE: forged cancellation cannot be promoted into finalized source',t=>{
  provenance(t);const x=setup();x.sources.get(sourceKey(ROOT,'battle_old:final')).eventKind='battle.cancelled';
  code(()=>x.project('knowledgeFinal'),'UNTRUSTED_FINAL_ORIGIN');
});
test('S06-10 REAL_SOURCE_OFFLINE: PUBLIC_SUPPORT is non-scoring utterance',t=>{
  provenance(t);const x=setup();const r=x.project('knowledgeSpeech');
  assert.deepEqual(r.snapshot.knownFacts,[]);assert.ok(r.input.lines[0].claims.every(c=>c.supportUnits===0));
});
test('S06-11 UNAVAILABLE: real lost HTTP ACK and readback', {skip:'Pure Chat06 projection has no network ACK/receipt persistence; real service and 07B sink unavailable'},()=>{});
test('S06-12 UNAVAILABLE: final versus cancellation atomic terminal commit', {skip:'Pure Chat06 consumer has no terminal CAS; source 05C/09A integration absent'},()=>{});
