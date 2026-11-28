import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtureAuthority } from '../fixture-authority.mjs';
import { createOracle } from '../typed-oracle.mjs';
import { buildKeys, canonical, digest, FIELDS, WIRE_KINDS } from '../wire.mjs';

const id = s => `fixture-v2:${s}`;
const finalRef = () => ({sourceSystem:id('05c-final'),canonicalSourceEventId:id('fight-17'),sourceEventVersion:id('schema-3')});
const actionRef = () => ({sourceSystem:id('08b-action'),canonicalSourceEventId:id('support-17'),sourceEventVersion:id('schema-2')});
const newSource = s => ({sourceSystem:id('05c-final'),canonicalSourceEventId:id(s),sourceEventVersion:id('schema-3')});
const clone=x=>structuredClone(x);

function setup({scopes=['public_outcome','public_utterance','public_claim'],recipient=id('npc-a')}={}) {
  const {issuer,verifier}=createFixtureAuthority();
  const grant=issuer.grant(recipient,scopes);
  const final=issuer.finalize({sourceRef:finalRef(),battleId:id('battle-17'),outcomeCode:id('winner-a'),proofDigest:'d'.repeat(64)});
  const action=issuer.publicAction({sourceRef:actionRef(),actionId:id('support-17'),speakerId:id('speaker-a'),utteranceCode:id('said-a-won'),textDigest:'a'.repeat(64),causalRootRef:finalRef()});
  const oracle=createOracle(verifier);
  return {issuer,verifier,grant,final,action,oracle,recipient};
}
function outcome(c,other={}) {
  const observation=c.issuer.observe({sourceRef:finalRef(),recipientId:c.recipient,fieldScope:'public_outcome'});
  return {npcId:c.recipient,recipientId:c.recipient,knowledgeKind:'VERIFIED_OUTCOME',sourceRef:finalRef(),binding:c.verifier.currentBinding(c.recipient),
    sourceReceiptId:c.final.sourceReceiptId,proofDigest:c.final.proofDigest,observationProofId:observation.proofId,...other};
}
function utterance(c,other={}) {
  const observation=c.issuer.observe({sourceRef:actionRef(),recipientId:c.recipient,fieldScope:'public_utterance'});
  return {npcId:c.recipient,recipientId:c.recipient,knowledgeKind:'VERIFIED_UTTERANCE',sourceRef:actionRef(),binding:c.verifier.currentBinding(c.recipient),
    sourceReceiptId:c.action.committedActionReceiptId,proofDigest:c.action.textDigest,observationProofId:observation.proofId,...other};
}
function claim(c,suffix='one',other={}) {
  const sourceRef=actionRef(), receiptId=id(`relay-${suffix}`);
  const claimCode=id('reported-a-won'),claimDigest=digest({claimCode,claimOrigin:sourceRef,speakerId:id('speaker-b')});
  const receipt=c.issuer.relay({sourceRef,receiptId,recipientId:c.recipient,speakerId:id('speaker-b'),claimCode,claimDigest});
  return {npcId:c.recipient,recipientId:c.recipient,knowledgeKind:'HEARD_CLAIM',sourceRef,binding:c.verifier.currentBinding(c.recipient),
    relayReceiptId:receipt.receiptId,speakerId:receipt.speakerId,claimCode,claimDigest,...other};
}
const status=(response,expected)=>assert.equal(response.status,expected,`${response.status} ${response.reason}`);

// V125 wire compatibility. V125's VERIFIED_FACT is mapped from our explicit VERIFIED_OUTCOME.
test('W01 source origin exact V125 JSON-array wire',()=>{
  const k=buildKeys({npcId:id('npc-a'),recipientId:id('npc-a'),kind:'VERIFIED_OUTCOME',sourceRef:finalRef()});
  assert.equal(k.sourceOriginKey,JSON.stringify(['event-origin/v1',id('05c-final'),id('fight-17')]));
});
test('W02 verified outcome maps to V125 VERIFIED_FACT and effect candidate',()=>{
  const k=buildKeys({npcId:id('npc-a'),recipientId:id('npc-a'),kind:'VERIFIED_OUTCOME',sourceRef:finalRef()});
  assert.equal(k.knowledgeKey,JSON.stringify(['npc-knowledge/v2',id('npc-a'),id('npc-a'),id('05c-final'),id('fight-17'),'VERIFIED_FACT',null]));
  assert.equal(k.effectKey,JSON.stringify(['npc-relationship-effect/v1',id('npc-a'),id('05c-final'),id('fight-17'),'verified_outcome']));
  assert.equal(WIRE_KINDS.VERIFIED_OUTCOME,'VERIFIED_FACT');
});
test('W03 utterance wire is not outcome and carries no effect permission',()=>{
  const k=buildKeys({npcId:id('npc-a'),recipientId:id('npc-a'),kind:'VERIFIED_UTTERANCE',sourceRef:actionRef()});
  assert.equal(k.knowledgeKey,JSON.stringify(['npc-knowledge/v2',id('npc-a'),id('npc-a'),id('08b-action'),id('support-17'),'VERIFIED_UTTERANCE',null]));
  assert.equal(k.effectKey,null);
});
test('W04 two relay receipt IDs create two knowledge identities, not two origins',()=>{
  const input={npcId:id('npc-a'),recipientId:id('npc-a'),kind:'HEARD_CLAIM',sourceRef:actionRef()};
  const a=buildKeys({...input,relayReceiptId:id('relay-a')});
  const b=buildKeys({...input,relayReceiptId:id('relay-b')});
  assert.equal(a.sourceOriginKey,b.sourceOriginKey);assert.notEqual(a.knowledgeKey,b.knowledgeKey);assert.equal(a.effectKey,null);
});
test('W05 no text/speaker/digest in knowledge key',()=>{
  const k=buildKeys({npcId:id('npc-a'),recipientId:id('npc-a'),kind:'HEARD_CLAIM',sourceRef:actionRef(),relayReceiptId:id('relay-a')});
  assert.equal(k.knowledgeKey.includes('claimCode'),false);assert.equal(k.knowledgeKey.includes('speaker'),false);
});
test('W06 wrong recipient binding rejected before keys',()=>assert.throws(()=>buildKeys({npcId:id('npc-a'),recipientId:id('npc-b'),kind:'VERIFIED_OUTCOME',sourceRef:finalRef()}),/BAD_KEY_INPUT/));
test('W07 relay receipt mandatory only for HEARD_CLAIM',()=>{
  assert.throws(()=>buildKeys({npcId:id('npc-a'),recipientId:id('npc-a'),kind:'HEARD_CLAIM',sourceRef:actionRef()}),/BAD_RELAY_KEY/);
  assert.throws(()=>buildKeys({npcId:id('npc-a'),recipientId:id('npc-a'),kind:'VERIFIED_UTTERANCE',sourceRef:actionRef(),relayReceiptId:id('r')}),/BAD_RELAY_KEY/);
});
test('W08 unapproved namespace and malformed event rejected',()=>assert.throws(()=>buildKeys({npcId:id('npc-a'),recipientId:id('npc-a'),kind:'VERIFIED_OUTCOME',sourceRef:{...finalRef(),canonicalSourceEventId:'human:text'}}),/BAD_KEY_INPUT/));

test('P01 genuine finalized 05C + witness + current grant commits VERIFIED_OUTCOME',()=>{
  const c=setup(),r=c.oracle.commit(outcome(c));status(r,'NEW_KNOWLEDGE');assert.equal(r.receipt.kind,'VERIFIED_OUTCOME');assert.ok(r.receipt.effectKey);assert.equal(c.oracle.stats().knowledgeCount,1);
});
test('P02 no 05C final issuer means no VERIFIED_OUTCOME',()=>{
  const c=setup(),i=outcome(c);i.sourceRef=actionRef();status(c.oracle.commit(i),'DENIED');assert.equal(c.oracle.stats().knowledgeCount,0);
});
test('P03 forged 05C sourceReceiptId quarantined',()=>{
  const c=setup(),i=outcome(c);i.sourceReceiptId=id('forged');status(c.oracle.commit(i),'CONFLICT_QUARANTINE');
});
test('P04 tampered final digest quarantined',()=>{
  const c=setup(),i=outcome(c);i.proofDigest='b'.repeat(64);status(c.oracle.commit(i),'CONFLICT_QUARANTINE');
});
test('P05 no genuine observation proof denies final',()=>{
  const c=setup(),i=outcome(c);i.observationProofId=id('fake-observation');status(c.oracle.commit(i),'DENIED');
});
test('P06 a committed 08B public action with authorized observation is VERIFIED_UTTERANCE only',()=>{
  const c=setup(),r=c.oracle.commit(utterance(c));status(r,'NEW_KNOWLEDGE');assert.equal(r.receipt.kind,'VERIFIED_UTTERANCE');assert.equal(r.receipt.effectKey,null);
  const view=c.oracle.readForRecipient({recipientId:c.recipient,knowledgeKey:r.receipt.knowledgeKey,binding:c.verifier.currentBinding(c.recipient)});
  status(view,'AUTHORIZED_READ');assert.equal(view.receipt.effectEligible,false);assert.equal(view.receipt.proactiveEligible,false);assert.deepEqual(Object.keys(view.receipt.authorizedFields).sort(),['speakerId','utteranceCode']);
});
test('P07 action final causalRoot does not verify a new outcome',()=>{
  const c=setup(),i=utterance(c);i.knowledgeKind='VERIFIED_OUTCOME';status(c.oracle.commit(i),'DENIED');
});
test('P08 uncommitted/unknown 08B action is not trusted',()=>{
  const c=setup(),i=utterance(c);i.sourceRef={...i.sourceRef,canonicalSourceEventId:id('made-up')};status(c.oracle.commit(i),'DENIED');
});
test('P09 swapped 08B source receipt quarantined',()=>{
  const c=setup(),i=utterance(c);i.sourceReceiptId=id('fake-action-receipt');status(c.oracle.commit(i),'CONFLICT_QUARANTINE');
});
test('P10 altered action immutable text digest quarantined',()=>{
  const c=setup(),i=utterance(c);i.proofDigest='0'.repeat(64);status(c.oracle.commit(i),'CONFLICT_QUARANTINE');
});
test('P11 unobserved action cannot be learned by public URL alone',()=>{
  const c=setup(),i=utterance(c);i.observationProofId=id('public-url');status(c.oracle.commit(i),'DENIED');
});
test('P12 granted relay is HEARD_CLAIM and never battle outcome',()=>{
  const c=setup(),r=c.oracle.commit(claim(c));status(r,'NEW_KNOWLEDGE');assert.equal(r.receipt.kind,'HEARD_CLAIM');assert.equal(r.receipt.effectKey,null);
  const view=c.oracle.readForRecipient({recipientId:c.recipient,knowledgeKey:r.receipt.knowledgeKey,binding:c.verifier.currentBinding(c.recipient)});
  status(view,'AUTHORIZED_READ');assert.equal(view.receipt.effectEligible,false);assert.equal(view.receipt.proactiveEligible,false);
});
test('P13 two valid distinct relay receipts preserve separate claims, not effects',()=>{
  const c=setup(),a=c.oracle.commit(claim(c,'one')),b=c.oracle.commit(claim(c,'two'));status(a,'NEW_KNOWLEDGE');status(b,'NEW_KNOWLEDGE');
  assert.equal(c.oracle.stats().knowledgeCount,2);assert.equal(c.oracle.stats().receiptCount,2);
  assert.notEqual(a.receipt.knowledgeKey,b.receipt.knowledgeKey);assert.equal(a.receipt.sourceOriginKey,b.receipt.sourceOriginKey);
});
test('P14 altered digest under existing trusted relay quarantined',()=>{
  const c=setup(),i=claim(c);i.claimDigest='e'.repeat(64);status(c.oracle.commit(i),'CONFLICT_QUARANTINE');assert.equal(c.oracle.stats().knowledgeCount,0);
});
test('P15 altered speaker under existing trusted relay quarantined',()=>{
  const c=setup(),i=claim(c);i.speakerId=id('different-speaker');status(c.oracle.commit(i),'CONFLICT_QUARANTINE');
});
test('P16 unknown relay ID denied',()=>{
  const c=setup(),i=claim(c);i.relayReceiptId=id('no-such-receipt');status(c.oracle.commit(i),'DENIED');
});
test('P17 unverified rumor about non-existent 05C source remains HEARD_CLAIM',()=>{
  const c=setup(),s=newSource('nonexistent-final'),g=c.verifier.currentBinding(c.recipient);
  const claimCode=id('rumored'),speakerId=id('speaker-z'),claimDigest='f'.repeat(64),relayReceiptId=id('relay-rumor');
  c.issuer.relay({sourceRef:s,receiptId:relayReceiptId,recipientId:c.recipient,speakerId,claimCode,claimDigest});
  const r=c.oracle.commit({npcId:c.recipient,recipientId:c.recipient,knowledgeKind:'HEARD_CLAIM',sourceRef:s,binding:g,relayReceiptId,speakerId,claimCode,claimDigest});
  status(r,'NEW_KNOWLEDGE');assert.equal(r.receipt.effectKey,null);
  status(c.oracle.commit({npcId:c.recipient,recipientId:c.recipient,knowledgeKind:'VERIFIED_OUTCOME',sourceRef:s,binding:g,sourceReceiptId:id('fake'),proofDigest:'f'.repeat(64)}),'DENIED');
});
test('P18 relay ID reuse with changed canonical digest rejected by issuer',()=>{
  const c=setup();claim(c);assert.throws(()=>c.issuer.relay({sourceRef:actionRef(),receiptId:id('relay-one'),recipientId:c.recipient,speakerId:id('speaker-b'),claimCode:id('reported-a-won'),claimDigest:'f'.repeat(64)}),/IMMUTABLE_RELAY_CONFLICT/);
});

test('A01 recipient mismatch must fail, no cross-NPC leakage',()=>{
  const c=setup(),i=outcome(c);i.recipientId=id('npc-other');status(c.oracle.commit(i),'DENIED');
});
test('A02 mismatched grantId denied',()=>{
  const c=setup(),i=outcome(c);i.binding.grantId=id('wrong-grant');status(c.oracle.commit(i),'DENIED');
});
test('A03 incorrect grantGeneration denied',()=>{
  const c=setup(),i=outcome(c);i.binding.grantGeneration+=1;status(c.oracle.commit(i),'DENIED');
});
test('A04 accessEpoch mismatch denied',()=>{
  const c=setup(),i=outcome(c);i.binding.accessEpoch+=1;status(c.oracle.commit(i),'DENIED');
});
test('A05 fieldScope missing outcome denies before observation',()=>{
  const c=setup({scopes:['public_claim']}),i={npcId:c.recipient,recipientId:c.recipient,knowledgeKind:'VERIFIED_OUTCOME',sourceRef:finalRef(),binding:c.verifier.currentBinding(c.recipient),sourceReceiptId:c.final.sourceReceiptId,proofDigest:c.final.proofDigest,observationProofId:id('fake')};
  status(c.oracle.commit(i),'DENIED');
});
test('A06 fieldScope missing public utterance denies',()=>{
  const c=setup({scopes:['public_claim']}),i={npcId:c.recipient,recipientId:c.recipient,knowledgeKind:'VERIFIED_UTTERANCE',sourceRef:actionRef(),binding:c.verifier.currentBinding(c.recipient),sourceReceiptId:c.action.committedActionReceiptId,proofDigest:c.action.textDigest,observationProofId:id('fake')};
  status(c.oracle.commit(i),'DENIED');
});
test('A07 revoke-before-commit denies knowledge and keeps count zero',()=>{
  const c=setup(),i=outcome(c);c.issuer.revoke(c.recipient);status(c.oracle.commit(i),'DENIED');assert.equal(c.oracle.stats().knowledgeCount,0);
});
test('A08 revoke-before-commit rejects queued utterance intent',()=>{
  const c=setup(),i=utterance(c);c.issuer.revoke(c.recipient);status(c.oracle.commit(i),'DENIED');
});
test('A09 revoke-before-commit rejects queued relay intent',()=>{
  const c=setup(),i=claim(c);c.issuer.revoke(c.recipient);status(c.oracle.commit(i),'DENIED');
});
test('A10 revoke then regrant invalidates old generation and old relay epoch',()=>{
  const c=setup(),i=claim(c);c.issuer.revoke(c.recipient);c.issuer.regrant(c.recipient);
  i.binding=c.verifier.currentBinding(c.recipient);status(c.oracle.commit(i),'DENIED');assert.equal(c.oracle.stats().knowledgeCount,0);
});
test('A11 revoke then regrant old observation still rejected despite fresh binding',()=>{
  const c=setup(),i=utterance(c);c.issuer.revoke(c.recipient);c.issuer.regrant(c.recipient);
  i.binding=c.verifier.currentBinding(c.recipient);status(c.oracle.commit(i),'DENIED');
});
test('A12 no post-revoke delivery of previously lawful knowledge',()=>{
  const c=setup(),r=c.oracle.commit(utterance(c));status(r,'NEW_KNOWLEDGE');const binding=c.verifier.currentBinding(c.recipient);
  status(c.oracle.readForRecipient({recipientId:c.recipient,knowledgeKey:r.receipt.knowledgeKey,binding}),'AUTHORIZED_READ');
  c.issuer.revoke(c.recipient);status(c.oracle.readForRecipient({recipientId:c.recipient,knowledgeKey:r.receipt.knowledgeKey,binding}),'DENIED');assert.equal(c.oracle.stats().knowledgeCount,1);
});
test('A13 visibility revoked before observation is not learnable',()=>{
  const c=setup();c.issuer.setVisibility(actionRef(),false);assert.throws(()=>c.issuer.observe({sourceRef:actionRef(),recipientId:c.recipient,fieldScope:'public_utterance'}),/NOT_AUTHORIZED/);
});
test('A14 visibility changes after observation before commit deny',()=>{
  const c=setup(),i=utterance(c);c.issuer.setVisibility(actionRef(),false);status(c.oracle.commit(i),'DENIED');
});
test('A15 visibility revision changes without becoming new action',()=>{
  const c=setup(),i=utterance(c);c.issuer.setVisibility(actionRef(),true);status(c.oracle.commit(i),'DENIED');assert.equal(c.oracle.stats().knowledgeCount,0);
});
test('A16 visibility revoked after commit suppresses fresh read',()=>{
  const c=setup(),r=c.oracle.commit(utterance(c));c.issuer.setVisibility(actionRef(),false);
  status(c.oracle.readForRecipient({recipientId:c.recipient,knowledgeKey:r.receipt.knowledgeKey,binding:c.verifier.currentBinding(c.recipient)}),'DENIED');
});

test('R01 replay exact outcome is idempotent, firstLearnedAt immutable',()=>{
  const c=setup(),i=outcome(c),first=c.oracle.commit(i),second=c.oracle.commit(i);
  status(first,'NEW_KNOWLEDGE');status(second,'IDEMPOTENT_REPLAY');assert.deepEqual(second.receipt,first.receipt);assert.equal(c.oracle.stats().clock,1);
});
test('R02 repeated action observation receipt idempotent, no effect',()=>{
  const c=setup(),i=utterance(c),a=c.oracle.commit(i),b=c.oracle.commit(i);status(b,'IDEMPOTENT_REPLAY');assert.equal(a.receipt.effectKey,null);assert.equal(c.oracle.stats().knowledgeCount,1);
});
test('R03 different lawful observation receipts same action do not mint second knowledge',()=>{
  const c=setup(),i=utterance(c),a=c.oracle.commit(i);i.observationProofId=c.issuer.observe({sourceRef:actionRef(),recipientId:c.recipient,fieldScope:'public_utterance'}).proofId;
  const b=c.oracle.commit(i);status(b,'IDEMPOTENT_REPLAY');assert.equal(a.receipt.firstLearnedAtServer,b.receipt.firstLearnedAtServer);
});
test('R04 repeated same relay receipt is idempotent',()=>{
  const c=setup(),i=claim(c),a=c.oracle.commit(i),b=c.oracle.commit(i);status(b,'IDEMPOTENT_REPLAY');assert.deepEqual(a.receipt,b.receipt);assert.equal(c.oracle.stats().receiptCount,1);
});
test('R05 same knowledge key with altered immutable final signature quarantined',()=>{
  const c=setup(),i=outcome(c);c.oracle.commit(i);i.proofDigest='b'.repeat(64);status(c.oracle.commit(i),'CONFLICT_QUARANTINE');assert.equal(c.oracle.stats().knowledgeCount,1);
});
test('R06 same relay receipt with altered claim payload quarantined, not a new key',()=>{
  const c=setup(),i=claim(c);c.oracle.commit(i);i.claimCode=id('different');status(c.oracle.commit(i),'CONFLICT_QUARANTINE');assert.equal(c.oracle.stats().knowledgeCount,1);
});
test('R07 serialized restart same trusted authority preserves firstLearnedAt and receipts',()=>{
  const c=setup(),i=outcome(c),a=c.oracle.commit(i),snap=c.oracle.exportCheckpoint();
  const restored=createOracle(c.verifier,snap),b=restored.commit(i);
  status(b,'IDEMPOTENT_REPLAY');assert.equal(b.receipt.firstLearnedAtServer,a.receipt.firstLearnedAtServer);assert.equal(restored.stats().knowledgeCount,1);
});
test('R08 restart with two relay receipts retains distinct record IDs',()=>{
  const c=setup(),a=claim(c,'one'),b=claim(c,'two');c.oracle.commit(a);c.oracle.commit(b);
  const restored=createOracle(c.verifier,c.oracle.exportCheckpoint());status(restored.commit(a),'IDEMPOTENT_REPLAY');status(restored.commit(b),'IDEMPOTENT_REPLAY');assert.equal(restored.stats().receiptCount,2);
});
test('R09 lost success ACK then retry does not repeat commit',()=>{
  const c=setup(),i=utterance(c);c.oracle.commit(i);const r=c.oracle.commit(i);
  status(r,'IDEMPOTENT_REPLAY');assert.equal(c.oracle.stats().knowledgeCount,1);
});
test('R10 tampered stored checkpoint cannot restore',()=>{
  const c=setup(),i=outcome(c);c.oracle.commit(i);const cp=c.oracle.exportCheckpoint();cp.body.clock+=9;
  assert.throws(()=>createOracle(c.verifier,cp),/UNTRUSTED_SNAPSHOT/);
});
test('R11 other fixture authority cannot verify snapshot MAC',()=>{
  const c=setup();c.oracle.commit(outcome(c));const cp=c.oracle.exportCheckpoint();
  const other=createFixtureAuthority();assert.throws(()=>createOracle(other.verifier,cp),/UNTRUSTED_SNAPSHOT/);
});
test('R12 timestamps anchored at knowledge commit and repeat does not advance',()=>{
  const c=setup(),i=claim(c),a=c.oracle.commit(i);assert.equal(a.receipt.firstLearnedAtServer,'2026-11-11T00:00:01.000Z');
  c.oracle.commit(i);assert.equal(c.oracle.stats().clock,1);
});
test('R13 distinct NPC gets separate typed knowledge and bound grant',()=>{
  const c=setup();const other=id('npc-b');c.issuer.grant(other);
  const obs=c.issuer.observe({sourceRef:finalRef(),recipientId:other,fieldScope:'public_outcome'});
  const i={...outcome(c),npcId:other,recipientId:other,binding:c.verifier.currentBinding(other),observationProofId:obs.proofId};
  status(c.oracle.commit(i),'NEW_KNOWLEDGE');assert.equal(c.oracle.stats().knowledgeCount,1);
});
test('R14 forged getter rejected without executing getter',()=>{
  const c=setup(),i=outcome(c);let ran=false;Object.defineProperty(i,'recipientId',{enumerable:true,get(){ran=true;throw Error('EXECUTED')}});
  status(c.oracle.commit(i),'DENIED');assert.equal(ran,false);
});
test('R15 Proxy payload is rejected without running proxy traps',()=>{
  const c=setup(),i=outcome(c);let ran=false;const p=new Proxy(i,{get(){ran=true;throw Error('TRAP')}});
  status(c.oracle.commit(p),'DENIED');assert.equal(ran,false);
});
test('R16 caller cannot relabel a relay as a direct final by claimant-supplied issuerClass',()=>{
  const c=setup(),i=claim(c);i.knowledgeKind='VERIFIED_OUTCOME';i.issuerClass='BATTLE_TERMINAL_FINAL';status(c.oracle.commit(i),'DENIED');
});
test('R17 direct verified action cannot be relabeled to HEARD_CLAIM without relay receipt',()=>{
  const c=setup(),i=utterance(c);i.knowledgeKind='HEARD_CLAIM';status(c.oracle.commit(i),'DENIED');
});
test('R18 two distinct final IDs for same battle denied by synthetic final issuer',()=>{
  const c=setup();assert.throws(()=>c.issuer.finalize({sourceRef:newSource('final-alias'),battleId:id('battle-17'),outcomeCode:id('winner-a'),proofDigest:'d'.repeat(64)}),/DUPLICATE_05C_FINAL/);
});

test('A17 relay for revoked visible action is rejected at issuer',()=>{
  const c=setup();c.issuer.setVisibility(actionRef(),false);
  assert.throws(()=>claim(c),/UNAUTHORIZED_RELAY/);
});
test('A18 delayed claim cannot commit after action visibility revoke',()=>{
  const c=setup(),i=claim(c);c.issuer.setVisibility(actionRef(),false);status(c.oracle.commit(i),'DENIED');
});
test('A19 old lawful claim is not re-delivered after public visibility revoke',()=>{
  const c=setup(),r=c.oracle.commit(claim(c));c.issuer.setVisibility(actionRef(),false);
  status(c.oracle.readForRecipient({recipientId:c.recipient,knowledgeKey:r.receipt.knowledgeKey,binding:c.verifier.currentBinding(c.recipient)}),'DENIED');
});
