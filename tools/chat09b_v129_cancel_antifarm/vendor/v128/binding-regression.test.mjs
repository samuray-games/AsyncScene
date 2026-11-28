import test from 'node:test';
import assert from 'node:assert/strict';
import {initial, step, clone} from './product-model.mjs';

const B1 = 'B1', B2 = 'B2';
const terminal = (type, state=initial(), battleId=state.battle.id) => ({
  type, battleId, expectedPeople:clone(state.battle.people),
  [type==='FINAL'?'trustedFinalReceipt':'trustedTerminalReceipt']: {
    id:type==='FINAL'?'F1':'C1', battleId, kind:type==='FINAL'?'TERMINAL_FINAL':'TERMINAL_CANCELLED'
  }
});
function deniedWithoutMutation(state, command, expected) {
  const before=clone(state), r=step(state, command);
  assert.equal(r.outcome,expected);
  assert.deepEqual(r.state,before,'returned state changed after rejection');
  assert.deepEqual(state,before,'caller-owned input was mutated');
  assert.equal(r.state.terminalCount,before.terminalCount);
  assert.deepEqual(r.state.occupied,before.occupied);
  assert.deepEqual(r.state.history,before.history);
  assert.deepEqual(r.state.ledger,before.ledger);
}
function activeB2() {
  const s=initial();
  s.battle.id=B2;
  s.battle.people=[{id:'P1',generation:8},{id:'P2',generation:5}];
  s.occupied={P1:{battleId:B2,generation:8},P2:{battleId:B2,generation:5}};
  s.history.pairAttempts.push('P1:P2:B2');
  return s;
}

// Exact reproduction of the three previously FAILing V127 Chat10Б cutsets.
test('V127-09B-10: foreign FINAL(B2) command cannot finalize ACTIVE B1',()=>{
  const s=initial(),cmd={...terminal('FINAL',s),battleId:B2};
  deniedWithoutMutation(s,cmd,'CONFLICT_WRONG_BATTLE');
});
test('V127-09B-11: foreign FINAL receipt(B2) cannot finalize ACTIVE B1',()=>{
  const s=initial(),cmd=terminal('FINAL',s);cmd.trustedFinalReceipt.battleId=B2;
  deniedWithoutMutation(s,cmd,'CONFLICT_RECEIPT_BINDING');
});
test('V127-09B-12: foreign CANCEL receipt(B2) cannot release ACTIVE B1',()=>{
  const s=initial(),cmd=terminal('CANCEL',s);cmd.trustedTerminalReceipt.battleId=B2;
  deniedWithoutMutation(s,cmd,'CONFLICT_RECEIPT_BINDING');
});

// Complementary command, receipt, pair and replay protections.
test('B2 CANCEL command cannot touch B1 even with correctly bound B1 receipt',()=>{
  const s=initial();deniedWithoutMutation(s,{...terminal('CANCEL',s),battleId:B2},'CONFLICT_WRONG_BATTLE');
});
test('B1 command plus foreign B2 receipt and B2 reservations fails before release',()=>{
  const s=initial();s.occupied.P2={battleId:B2,generation:5};
  const cmd=terminal('CANCEL',s);cmd.trustedTerminalReceipt.battleId=B2;
  deniedWithoutMutation(s,cmd,'CONFLICT_RECEIPT_BINDING');
});
test('wrong final kind in B1 receipt rejected despite correct battleId',()=>{
  const s=initial(),cmd=terminal('FINAL',s);cmd.trustedFinalReceipt.kind='TERMINAL_CANCELLED';
  deniedWithoutMutation(s,cmd,'CONFLICT_RECEIPT_BINDING');
});
test('wrong cancel kind in B1 receipt rejected despite correct battleId',()=>{
  const s=initial(),cmd=terminal('CANCEL',s);cmd.trustedTerminalReceipt.kind='TERMINAL_FINAL';
  deniedWithoutMutation(s,cmd,'CONFLICT_RECEIPT_BINDING');
});
test('missing battleId or receipt id is not an authorization grant',()=>{
  const s=initial();for(const field of ['battleId','id']){
    const cmd=terminal('FINAL',s);delete cmd.trustedFinalReceipt[field];
    deniedWithoutMutation(s,cmd,'CONFLICT_RECEIPT_BINDING');
  }
});
test('embedded receipt pair cannot contradict active generations',()=>{
  const s=initial(),cmd=terminal('FINAL',s);cmd.trustedFinalReceipt.people=[{id:'P1',generation:8},{id:'P2',generation:4}];
  deniedWithoutMutation(s,cmd,'CONFLICT_RECEIPT_BINDING');
});
test('expected pair duplicate identity, foreign actor and generation are all denied',()=>{
  const s=initial();
  for(const people of [
    [{id:'P1',generation:7},{id:'P1',generation:7}],
    [{id:'P1',generation:7},{id:'P3',generation:4}],
    [{id:'P1',generation:8},{id:'P2',generation:4}],
    [{id:'P1',generation:7}],
  ])deniedWithoutMutation(s,{...terminal('CANCEL',s),expectedPeople:people},'CONFLICT_GENERATION');
});
test('reordered correct expected pair still refers to the SAME two reservations',()=>{
  const s=initial(),cmd=terminal('CANCEL',s);cmd.expectedPeople.reverse();
  const r=step(s,cmd);
  assert.equal(r.outcome,'TERMINAL_CANCELLED');
  assert.deepEqual(r.state.occupied,{});
  assert.deepEqual(r.state.history,s.history);
  assert.deepEqual(r.state.ledger,s.ledger);
});
test('B2 replaced occupancy blocks B1 FINAL and cannot be deleted by B1',()=>{
  const s=initial();s.occupied.P1={battleId:B2,generation:8};
  deniedWithoutMutation(s,terminal('FINAL',s),'CONFLICT_OCCUPANCY');
});
test('unexpected third B1 occupant invalidates exact active reservation pair',()=>{
  const s=initial();s.occupied.P3={battleId:B1,generation:2};
  deniedWithoutMutation(s,terminal('CANCEL',s),'CONFLICT_OCCUPANCY');
});
test('B1 FINAL first, B2 competing FINAL cannot overwrite, true replay reused once',()=>{
  const s=initial(), f=terminal('FINAL',s), r1=step(s,f);
  assert.equal(r1.outcome,'TERMINAL_FINAL_NO_SETTLEMENT_SIMULATED');
  assert.equal(r1.state.terminalCount,1);
  deniedWithoutMutation(r1.state,{...f,battleId:B2},'CONFLICT_WRONG_BATTLE');
  deniedWithoutMutation(r1.state,{...f,trustedFinalReceipt:{...f.trustedFinalReceipt,battleId:B2}},'CONFLICT_TERMINAL');
  const replay=step(r1.state,f);
  assert.equal(replay.outcome,'REUSED');assert.deepEqual(replay.state,r1.state);
});
test('B1 CANCEL first, late B2 FINAL and other cancel cannot affect original',()=>{
  const s=initial(), c=terminal('CANCEL',s), r1=step(s,c);
  assert.equal(r1.outcome,'TERMINAL_CANCELLED');
  const laterFinal={...terminal('FINAL',s),battleId:B2};
  deniedWithoutMutation(r1.state,laterFinal,'CONFLICT_WRONG_BATTLE');
  deniedWithoutMutation(r1.state,{...c,battleId:B2},'CONFLICT_WRONG_BATTLE');
  const replay=step(r1.state,c);assert.equal(replay.outcome,'REUSED');assert.deepEqual(replay.state,r1.state);
});
test('a genuinely active B2 cannot be committed using B1 command or receipt',()=>{
  const s=activeB2();
  deniedWithoutMutation(s,{...terminal('FINAL',s),battleId:B1},'CONFLICT_WRONG_BATTLE');
  const c=terminal('CANCEL',s);c.trustedTerminalReceipt.battleId=B1;
  deniedWithoutMutation(s,c,'CONFLICT_RECEIPT_BINDING');
});
test('a genuinely active B2 can terminate only with its own pair, identity and receipt',()=>{
  const s=activeB2(),c=terminal('CANCEL',s),r=step(s,c);
  assert.equal(r.outcome,'TERMINAL_CANCELLED');
  assert.equal(r.state.battle.id,B2);
  assert.deepEqual(r.state.occupied,{});
  assert.equal(r.state.terminalCount,1);
  assert.deepEqual(r.state.history,s.history);
  assert.deepEqual(r.state.ledger,s.ledger);
});
test('synthetic receipt remains a required input, not proof of real issuer',()=>{
  const s=initial(),f=terminal('FINAL',s),c=terminal('CANCEL',s);
  deniedWithoutMutation(s,{...f,trustedFinalReceipt:null},'DENY_NO_AUTHORITY');
  deniedWithoutMutation(s,{...c,trustedTerminalReceipt:null},'DENY_NO_AUTHORITY');
});
test('invalid battle lifecycle state does not get finalized',()=>{
  const s=initial();s.battle.status='UNKNOWN';
  deniedWithoutMutation(s,terminal('FINAL',s),'CONFLICT_BATTLE_STATE');
});
