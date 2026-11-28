import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,step} from './product-model.mjs';
function cmd(type,s){const isFinal=type==='FINAL';return {type,battleId:'B1',expectedPeople:s.battle.people,[isFinal?'trustedFinalReceipt':'trustedTerminalReceipt']:{id:isFinal?'F1':'C1',battleId:'B1',kind:isFinal?'TERMINAL_FINAL':'TERMINAL_CANCELLED'}};}
test('V127-09B-10 FINAL(B2) command must not finalize B1',()=>{const s=initial();const r=step(s,{...cmd('FINAL',s),battleId:'B2'});assert.equal(r.outcome,'CONFLICT_WRONG_BATTLE');assert.deepEqual(r.state,s);});
test('V127-09B-11 foreign FINAL receipt(B2) must not finalize B1',()=>{const s=initial();const c=cmd('FINAL',s);c.trustedFinalReceipt.battleId='B2';const r=step(s,c);assert.equal(r.outcome,'CONFLICT_RECEIPT_BINDING');assert.deepEqual(r.state,s);});
test('V127-09B-12 foreign CANCEL receipt(B2) must not release B1',()=>{const s=initial();const c=cmd('CANCEL',s);c.trustedTerminalReceipt.battleId='B2';const r=step(s,c);assert.equal(r.outcome,'CONFLICT_RECEIPT_BINDING');assert.deepEqual(r.state,s);});
