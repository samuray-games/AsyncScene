import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,clone,step,applyCommitted05CTerminal} from './product-model.mjs';

function state(battle='B1') {
  const s=initial();
  s.battle.tenantId='TENANT_TEST';
  s.battle.id=battle;
  s.battle.pairAttemptId=`P1:P2:${battle}`;
  const g=battle==='B1'?[7,4]:[8,5];
  s.battle.people=[{id:'P1',generation:g[0]},{id:'P2',generation:g[1]}];
  s.battle.participants=[
    {participantId:`${battle}-A`,personId:'P1',generation:g[0]},
    {participantId:`${battle}-B`,personId:'P2',generation:g[1]}
  ];
  s.occupied={P1:{battleId:battle,generation:g[0]},P2:{battleId:battle,generation:g[1]}};
  if(!s.history.pairAttempts.includes(s.battle.pairAttemptId))s.history.pairAttempts.push(s.battle.pairAttemptId);
  return s;
}
function input(s,kind='TERMINAL_CANCELLED') {
  return {battleId:s.battle.id,terminalReceiptId:kind==='TERMINAL_FINAL'?'F-COMMIT-1':'C-COMMIT-1',
    terminalKind:kind,pairAttemptId:s.battle.pairAttemptId,participants:clone(s.battle.participants)};
}
function fact(s,r) {
  return {sourceSystem:'05C',committed:true,uniqueTerminal:true,issuerId:'05C-ISSUER-FIXTURE',
    sourceEventId:`EVENT-${r.terminalReceiptId}`,commitFence:`FENCE-${r.terminalReceiptId}`,
    tenantId:s.battle.tenantId,battleId:r.battleId,terminalReceiptId:r.terminalReceiptId,
    terminalKind:r.terminalKind,pairAttemptId:r.pairAttemptId,participants:clone(s.battle.participants),
    combatResult:r.terminalKind==='TERMINAL_CANCELLED'?'NO_COMBAT_RESULT':'WIN-TEST-ONLY',
    rewardDisposition:r.terminalKind==='TERMINAL_CANCELLED'?'NO_REWARD':'EXTERNAL_ISSUER_ONLY',
    settlementIntent:null};
}
function provider(f) {return {readCommittedTerminal:async()=>clone(f)};}
async function noMutation(s, r, authority, outcome) {
  const original=clone(s),request=clone(r);
  const result=await applyCommitted05CTerminal(s,r,authority);
  assert.equal(result.outcome,outcome);
  assert.deepEqual(result.state,original);
  assert.deepEqual(s,original);
  assert.deepEqual(r,request);
}
function retainedHistory(before,after) {
  assert.deepEqual(after.history,before.history);
  assert.deepEqual(after.ledger,before.ledger);
}

test('V129-01 direct FINAL through strict step is denied, even with forged legacy trusted receipt',()=>{
  const s=state();const r=step(s,{type:'FINAL',battleId:'B1',trustedFinalReceipt:{id:'F1',battleId:'B1',kind:'TERMINAL_FINAL'}});
  assert.equal(r.outcome,'DENY_VERIFIED_05C_REQUIRED');assert.deepEqual(r.state,s);
});
test('V129-02 direct CANCEL through strict step cannot free occupancy with forged receipt',()=>{
  const s=state();const r=step(s,{type:'CANCEL',battleId:'B1',trustedTerminalReceipt:{id:'C1',battleId:'B1',kind:'TERMINAL_CANCELLED',verified:true}});
  assert.equal(r.outcome,'DENY_VERIFIED_05C_REQUIRED');assert.deepEqual(r.state,s);
});
test('V129-03 missing 05C resolver denies ACTIVE release',async()=>{
  const s=state(),r=input(s);await noMutation(s,r,undefined,'DENY_VERIFIED_05C_REQUIRED');
});
test('V129-04 failed 05C source returns no release',async()=>{
  const s=state(),r=input(s);await noMutation(s,r,provider(null),'DENY_05C_UNVERIFIED');
});
test('V129-05 source error returns no release, not success',async()=>{
  const s=state(),r=input(s);await noMutation(s,r,{readCommittedTerminal(){throw Error('D1 unavailable')}},'DENY_05C_UNAVAILABLE');
});
test('V129-06 uncommitted or duplicate 05C terminal cannot release',async()=>{
  const s=state(),r=input(s);
  for(const key of ['committed','uniqueTerminal']){const f=fact(s,r);f[key]=false;await noMutation(s,r,provider(f),'DENY_05C_UNVERIFIED');}
});
test('V129-07 verified-looking request data alone never proves finality',async()=>{
  const s=state(),r=input(s);r.verified05C=true;r.trustedTerminalReceipt=fact(s,r);
  await noMutation(s,r,undefined,'DENY_VERIFIED_05C_REQUIRED');
});
test('V129-08 wrong command B2 does not even query 05C for B1',async()=>{
  const s=state(),r=input(s);r.battleId='B2';let calls=0;
  await noMutation(s,r,{readCommittedTerminal(){calls++;return fact(s,r)}},'CONFLICT_WRONG_BATTLE');
  assert.equal(calls,0);
});
test('V129-09 wrong pair attempt B2 denied before 05C lookup',async()=>{
  const s=state(),r=input(s);r.pairAttemptId='P1:P2:B2';let calls=0;
  await noMutation(s,r,{readCommittedTerminal(){calls++;return fact(s,r)}},'CONFLICT_PAIR_ATTEMPT');assert.equal(calls,0);
});
test('V129-10 foreign participant cannot use same B1 persons',async()=>{
  const s=state(),r=input(s);r.participants[1].participantId='B2-B';
  await noMutation(s,r,provider(fact(s,r)),'CONFLICT_PARTICIPANTS');
});
test('V129-11 foreign personId or generation in input denied',async()=>{
  const s=state();for(const change of [x=>x[0].personId='P3',x=>x[0].generation=8,x=>x[0].participantId=x[1].participantId]){
    const r=input(s);change(r.participants);await noMutation(s,r,provider(fact(s,r)),'CONFLICT_PARTICIPANTS');
  }
});
test('V129-12 foreign receipt B2 returned by resolver rejected',async()=>{
  const s=state(),r=input(s),f=fact(s,r);f.battleId='B2';await noMutation(s,r,provider(f),'CONFLICT_05C_BINDING');
});
test('V129-13 forged terminalReceiptId or switched terminal kind rejected',async()=>{
  const s=state();for(const key of ['terminalReceiptId','terminalKind']){
    const r=input(s),f=fact(s,r);f[key]=key==='terminalReceiptId'?'C-FOREIGN':'TERMINAL_FINAL';
    await noMutation(s,r,provider(f),'CONFLICT_05C_BINDING');
  }
});
test('V129-14 foreign tenant or 05C issuer marker cannot authorize B1',async()=>{
  const s=state(),r=input(s);
  for(const [key,val] of [['tenantId','OTHER'],['sourceSystem','CLIENT'],['issuerId',''],['commitFence',''],['sourceEventId','']]){
    const f=fact(s,r);f[key]=val;await noMutation(s,r,provider(f),'CONFLICT_05C_BINDING');
  }
});
test('V129-15 wrong authoritative participant, person or reservation generation rejected',async()=>{
  const s=state(),r=input(s);
  for(const change of [x=>x[0].participantId='B2-A',x=>x[1].personId='P3',x=>x[1].generation=5]){
    const f=fact(s,r);change(f.participants);await noMutation(s,r,provider(f),'CONFLICT_05C_BINDING');
  }
});
test('V129-16 cancellation with combat result, reward, settlement intent denied',async()=>{
  const s=state(),r=input(s);
  for(const [key,val] of [['combatResult','WIN'],['rewardDisposition','REWARD'],['settlementIntent',{amount:1}]]){
    const f=fact(s,r);f[key]=val;await noMutation(s,r,provider(f),'DENY_CANCEL_ECONOMY_SEMANTICS');
  }
});
test('V129-17 verified CANCEL releases only original active pair, NO_COMBAT_RESULT/NO_REWARD, preserves anti-farm',async()=>{
  const s=state(),r=input(s),f=fact(s,r);const p=provider(f);
  const out=await applyCommitted05CTerminal(s,r,p);
  assert.equal(out.outcome,'TERMINAL_CANCELLED');assert.deepEqual(out.state.occupied,{});
  assert.equal(out.state.battle.combatResult,'NO_COMBAT_RESULT');assert.equal(out.state.battle.rewardDisposition,'NO_REWARD');
  assert.equal(out.state.terminalCount,1);retainedHistory(s,out.state);
  assert.deepEqual(s.occupied,{P1:{battleId:'B1',generation:7},P2:{battleId:'B1',generation:4}});
});
test('V129-18 confirmed FINAL uses 05C binding, but never writes simulated ledger or settlement',async()=>{
  const s=state(),r=input(s,'TERMINAL_FINAL'),o=await applyCommitted05CTerminal(s,r,provider(fact(s,r)));
  assert.equal(o.outcome,'TERMINAL_FINAL_NO_SETTLEMENT_SIMULATED');assert.deepEqual(o.state.occupied,{});
  assert.equal(o.state.battle.status,'FINAL');retainedHistory(s,o.state);
});
test('V129-19 replay of same committed CANCEL is idempotent and re-reads 05C',async()=>{
  const s=state(),r=input(s),f=fact(s,r);let count=0;
  const p={readCommittedTerminal:()=>{count++;return clone(f)}};
  const first=await applyCommitted05CTerminal(s,r,p);const repeat=await applyCommitted05CTerminal(first.state,r,p);
  assert.equal(first.outcome,'TERMINAL_CANCELLED');assert.equal(repeat.outcome,'REUSED');
  assert.equal(count,2);assert.deepEqual(repeat.state,first.state);assert.equal(repeat.state.terminalCount,1);
});
test('V129-20 replay of same committed FINAL is idempotent, with no extra ledger effect',async()=>{
  const s=state(),r=input(s,'TERMINAL_FINAL'),f=fact(s,r),p=provider(f);
  const first=await applyCommitted05CTerminal(s,r,p),second=await applyCommitted05CTerminal(first.state,r,p);
  assert.equal(second.outcome,'REUSED');assert.deepEqual(second.state,first.state);retainedHistory(s,second.state);
});
test('V129-21 changed receipt after CANCEL is not replay and does not remove more occupancy',async()=>{
  const s=state(),r=input(s),first=await applyCommitted05CTerminal(s,r,provider(fact(s,r)));
  const other={...r,terminalReceiptId:'C2'},f=fact(s,other);
  await noMutation(first.state,other,provider(f),'CONFLICT_TERMINAL');
});
test('V129-22 05C fence changed for same receipt, replay is conflict',async()=>{
  const s=state(),r=input(s),first=await applyCommitted05CTerminal(s,r,provider(fact(s,r)));
  const f=fact(s,r);f.commitFence='OTHER-FENCE';
  await noMutation(first.state,r,provider(f),'CONFLICT_TERMINAL');
});
test('V129-23 CANCEL wins race: subsequent verified FINAL is rejected, reward never minted',async()=>{
  const s=state(),c=input(s),f=input(s,'TERMINAL_FINAL');
  const cancelled=await applyCommitted05CTerminal(s,c,provider(fact(s,c)));
  await noMutation(cancelled.state,f,provider(fact(s,f)),'CONFLICT_TERMINAL');
  assert.deepEqual(cancelled.state.ledger,s.ledger);
});
test('V129-24 FINAL wins race: subsequent committed CANCEL cannot reverse it',async()=>{
  const s=state(),f=input(s,'TERMINAL_FINAL'),c=input(s);
  const done=await applyCommitted05CTerminal(s,f,provider(fact(s,f)));
  await noMutation(done.state,c,provider(fact(s,c)),'CONFLICT_TERMINAL');
});
test('V129-25 cancelled state with unavailable 05C cannot claim cached verified replay',async()=>{
  const s=state(),r=input(s),done=await applyCommitted05CTerminal(s,r,provider(fact(s,r)));
  await noMutation(done.state,r,provider(null),'DENY_05C_UNVERIFIED');
});
test('V129-26 stale person reservation B2 blocks B1 even if 05C proof for B1 exists',async()=>{
  const s=state(),r=input(s);s.occupied.P2={battleId:'B2',generation:5};
  await noMutation(s,r,provider(fact(s,r)),'CONFLICT_OCCUPANCY');
});
test('V129-27 extra third person occupying B1 blocks cancellation',async()=>{
  const s=state(),r=input(s);s.occupied.P3={battleId:'B1',generation:11};
  await noMutation(s,r,provider(fact(s,r)),'CONFLICT_OCCUPANCY');
});
test('V129-28 missing exact active attempt binding stops without querying 05C',async()=>{
  const s=state(),r=input(s);s.history.pairAttempts=[];
  await noMutation(s,r,provider(fact(s,r)),'DENY_ACTIVE_BINDING_MISSING');
});
test('V129-29 duplicate pair-attempt history binding is denied, never cleaned',async()=>{
  const s=state(),r=input(s);s.history.pairAttempts.push(s.battle.pairAttemptId);
  await noMutation(s,r,provider(fact(s,r)),'DENY_ACTIVE_BINDING_MISSING');
});
test('V129-30 forged client timeout/logout/review request cannot auto cancel ACTIVE',()=>{
  const s=state();for(const type of ['UI_TIMEOUT','LOGOUT','RELOAD','ZONE_CHANGE','OPPONENT_MISSING','VOTE_CLOSED','PROPOSAL_EXPIRED']){
    const a=step(s,{type});assert.equal(a.outcome,'RETAINED');assert.deepEqual(a.state,s);
  }
});
test('V129-31 post-CANCEL invite rechecks admission and keeps pair attempts/cooldowns/history',async()=>{
  const s=state(),r=input(s),done=await applyCommitted05CTerminal(s,r,provider(fact(s,r)));
  const invite=step(done.state,{type:'INVITE',personId:'P1',targetId:'NPC_B'});
  assert.equal(invite.outcome,'RECHECK_ADMISSION_REQUIRED');retainedHistory(s,invite.state);
});
test('V129-32 live B2 cannot use B1 receipt and B1 pair attempt, even with same actors',async()=>{
  const s=state('B2'),r=input(s),f=fact(s,r);f.battleId='B1';
  await noMutation(s,r,provider(f),'CONFLICT_05C_BINDING');
  assert.deepEqual(s.occupied,{P1:{battleId:'B2',generation:8},P2:{battleId:'B2',generation:5}});
});
test('V129-33 competing B1/B2 fixture records keep their individual active generations',async()=>{
  const b1=state('B1'),b2=state('B2');const r1=input(b1),r2=input(b2);
  const f1=fact(b1,r1),f2=fact(b2,r2);
  const o1=await applyCommitted05CTerminal(b1,r1,provider(f1));
  assert.equal(o1.outcome,'TERMINAL_CANCELLED');assert.equal(b2.battle.status,'ACTIVE');
  const o2=await applyCommitted05CTerminal(b2,r2,provider(f2));
  assert.equal(o2.outcome,'TERMINAL_CANCELLED');assert.deepEqual(o2.state.history,b2.history);
  // Independent synthetic states, NOT a shared global person-wide database assertion.
});
test('V129-34 05C query must use exact tenant+battle+receipt locator only',async()=>{
  const s=state(),r=input(s);let seen;
  const p={readCommittedTerminal:async q=>(seen=clone(q),fact(s,r))};
  const o=await applyCommitted05CTerminal(s,r,p);assert.equal(o.outcome,'TERMINAL_CANCELLED');
  assert.deepEqual(seen,{tenantId:'TENANT_TEST',battleId:'B1',terminalReceiptId:'C-COMMIT-1'});
});
test('V129-35 shuffled participant order has no authority significance',async()=>{
  const s=state(),r=input(s),f=fact(s,r);r.participants.reverse();f.participants.reverse();
  const o=await applyCommitted05CTerminal(s,r,provider(f));assert.equal(o.outcome,'TERMINAL_CANCELLED');
});
test('V129-36 absent / malformed receipt locator denies release',async()=>{
  const s=state();for(const value of ['',null,' C1 ',undefined]){
    const r=input(s);r.terminalReceiptId=value;
    await noMutation(s,r,provider(fact(s,r)),'CONFLICT_RECEIPT_BINDING');
  }
});
