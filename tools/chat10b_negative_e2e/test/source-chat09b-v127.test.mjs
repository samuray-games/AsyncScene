import test from 'node:test';
import assert from 'node:assert/strict';
// Byte-exact original exported Chat09B V123 model. This is a synthetic product oracle,
// not the real canonical 09A/05C authority, and its 'trusted' inputs are injected assumptions.
import {initial,step} from '../source_vendor/chat09b/product-model.mjs';

function data(){
  const state=initial();
  const final={type:'FINAL',battleId:'B1',expectedPeople:state.battle.people,
    trustedFinalReceipt:{id:'FINAL-1',battleId:'B1',kind:'TERMINAL_FINAL'}};
  const cancel={type:'CANCEL',battleId:'B1',expectedPeople:state.battle.people,
    trustedTerminalReceipt:{id:'CANCEL-1',battleId:'B1',kind:'TERMINAL_CANCELLED'}};
  return {state,final,cancel};
}
const same=(a,b)=>assert.deepEqual(a,b);
const noChanges=(after,before)=>{same(after.history,before.history);same(after.ledger,before.ledger);};

test('V127-09B-01 REAL_SOURCE_OFFLINE: absent final issuer receipt denies with immutable state',()=>{
  const {state,final}=data();const r=step(state,{...final,trustedFinalReceipt:null});
  assert.equal(r.outcome,'DENY_NO_AUTHORITY');same(r.state,state);
});
test('V127-09B-02 REAL_SOURCE_OFFLINE: absent cancellation issuer receipt denies',()=>{
  const {state,cancel}=data();const r=step(state,{...cancel,trustedTerminalReceipt:null});
  assert.equal(r.outcome,'DENY_NO_AUTHORITY');same(r.state,state);
});
test('V127-09B-03 REAL_SOURCE_OFFLINE: final first excludes later cancellation',()=>{
  const {state,final,cancel}=data();const first=step(state,final),second=step(first.state,cancel);
  assert.equal(first.outcome,'TERMINAL_FINAL_NO_SETTLEMENT_SIMULATED');
  assert.equal(second.outcome,'FINAL_ALREADY_COMMITTED');same(second.state,first.state);
});
test('V127-09B-04 REAL_SOURCE_OFFLINE: cancellation first excludes final without results or rewards',()=>{
  const {state,final,cancel}=data();const first=step(state,cancel),second=step(first.state,final);
  assert.equal(first.outcome,'TERMINAL_CANCELLED');assert.equal(second.outcome,'CANCEL_ALREADY_COMMITTED');
  same(second.state,first.state);noChanges(second.state,state);
});
test('V127-09B-05 REAL_SOURCE_OFFLINE: cancellation preserves anti-farm/cooldown/newbie/ledger',()=>{
  const {state,cancel}=data();const result=step(state,cancel);
  assert.equal(result.state.battle.status,'CANCELLED');noChanges(result.state,state);
});
test('V127-09B-06 REAL_SOURCE_OFFLINE: changed person occupancy generation cannot be released',()=>{
  const {state,cancel}=data();state.occupied.P1={battleId:'B2',generation:8};
  const result=step(state,cancel);assert.equal(result.outcome,'CONFLICT_OCCUPANCY');same(result.state,state);
});
test('V127-09B-07 REAL_SOURCE_OFFLINE: same final receipt replay is reused',()=>{
  const {state,final}=data();const a=step(state,final),b=step(a.state,final);
  assert.equal(b.outcome,'REUSED');same(b.state,a.state);
});
test('V127-09B-08 REAL_SOURCE_OFFLINE: altered final receipt conflicts without rewriting state',()=>{
  const {state,final}=data();const a=step(state,final);
  const b=step(a.state,{...final,trustedFinalReceipt:{id:'FINAL-2',battleId:'B1',kind:'TERMINAL_FINAL'}});
  assert.equal(b.outcome,'CONFLICT_TERMINAL');same(b.state,a.state);
});
test('V127-09B-09 REAL_SOURCE_OFFLINE: proposal expiry does not release existing reservations',()=>{
  const {state}=data();const r=step(state,{type:'PROPOSAL_EXPIRED'});
  assert.equal(r.outcome,'RETAINED');same(r.state,state);
});

// These deliberately assert mandatory negative invariants, NOT current behavior.
// Their current FAIL is evidence of a source-model contract gap. Do not edit vendor module here.
test('V127-09B-10 EXPECTED_NEGATIVE: final command for another battle must conflict',()=>{
  const {state,final}=data();const r=step(state,{...final,battleId:'B2'});
  assert.equal(r.outcome,'CONFLICT_WRONG_BATTLE');same(r.state,state);
});
test('V127-09B-11 EXPECTED_NEGATIVE: foreign final receipt battleId must conflict',()=>{
  const {state,final}=data();const r=step(state,{...final,
    trustedFinalReceipt:{id:'FINAL-X',battleId:'B2',kind:'TERMINAL_FINAL'}});
  assert.equal(r.outcome,'CONFLICT_RECEIPT_BINDING');same(r.state,state);
});
test('V127-09B-12 EXPECTED_NEGATIVE: foreign cancellation receipt battleId must conflict',()=>{
  const {state,cancel}=data();const r=step(state,{...cancel,
    trustedTerminalReceipt:{id:'CANCEL-X',battleId:'B2',kind:'TERMINAL_CANCELLED'}});
  assert.equal(r.outcome,'CONFLICT_RECEIPT_BINDING');same(r.state,state);
});
