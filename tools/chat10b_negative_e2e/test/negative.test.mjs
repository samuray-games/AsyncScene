import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthority, ADAPTER_PROVENANCE } from '../adapter.mjs';
import { CASES, assertProvenance } from '../provenance.mjs';

const S = p => `session-person-${p}`;
const base = (id, a='A', b='B', opts={}) => ({
  battleId: id, people: [`person-${a}`, `person-${b}`],
  sessions: [S(a), S(b)], nonce: `admission-${id}`, ...opts,
});
const meta = (t, index) => {
  const c = CASES[index];
  assert.equal(c.implementation, 'STUB');
  assert.equal(ADAPTER_PROVENANCE.workerD1Executed, false);
  t.diagnostic(`PROVENANCE case=${c.id} kind=STUB module=${ADAPTER_PROVENANCE.module} runtimePass=false`);
};

test('NEG01 [STUB] revoked session prevents new admission', t => {
  meta(t, 0);
  const h = createAuthority();
  assert.equal(h.revoke(S('A')).code, 'REVOKED');
  const before = h.inspect();
  assert.equal(h.admit(base('E1')).code, 'DENY');
  assert.deepEqual(h.inspect(), before);
});

test('NEG02 [STUB] revoke before SEND creates zero messages/outbox', t => {
  meta(t, 1);
  const h = createAuthority();
  h.revoke(S('A'));
  const before = h.inspect();
  assert.equal(h.send({ sessionId:S('A'), messageId:'msg1', text:'synthetic' }).code, 'DENY');
  assert.deepEqual(h.inspect(), before);
  assert.equal(h.inspect().messages.length, 0);
});

test('NEG03 [STUB] same person cannot join two ACTIVE battles', async t => {
  meta(t, 2);
  const h = createAuthority();
  // Concurrent JS requests to a synchronous stub are NOT 2 Worker/D1 concurrency.
  const results = await Promise.all([
    Promise.resolve().then(() => h.admit(base('E1','A','B'))),
    Promise.resolve().then(() => h.admit(base('E2','A','C'))),
  ]);
  assert.deepEqual(results.map(r=>r.code).sort(), ['CONFLICT','CREATED']);
  assert.equal(h.inspect().battles.length, 1);
  assert.equal(h.inspect().active.filter(([p])=>p==='person-A').length, 1);
});

test('NEG04 [STUB] failure after reserving first participant rolls back ALL', t => {
  meta(t, 3);
  const h = createAuthority();
  const before = h.inspect();
  const r = h.admit(base('E1','A','B',{ injectFailureAfterFirst:true }));
  assert.equal(r.code, 'INJECTED_ROLLBACK');
  assert.deepEqual(h.inspect(), before);
});

test('NEG05 [STUB] final yields immutable single outcome/receipt/outbox', t => {
  meta(t, 4);
  const h = createAuthority();
  assert.equal(h.admit(base('E1')).code,'CREATED');
  const opts = { battleId:'E1', type:'FINAL', outcome:'A_WINS', receiptId:'final-E1' };
  assert.equal(h.terminal(opts).code, 'FINALIZED');
  const before = h.inspect();
  assert.equal(h.terminal(opts).code, 'REUSED');
  assert.deepEqual(h.inspect(), before);
  assert.equal(h.terminal({ ...opts, outcome:'B_WINS' }).code, 'CONFLICT');
  assert.deepEqual(h.inspect(), before);
  assert.equal(before.outbox.filter(([k])=>k==='terminal:E1').length, 1);
  assert.equal(before.rewardCount, 1);
});

test('NEG06 [STUB] final and cancellation mutually exclusive; cancel no reward', t => {
  meta(t, 5);
  for (const first of ['FINAL','CANCEL']) {
    const h = createAuthority();
    h.admit(base('E1'));
    const result = h.terminal({battleId:'E1',type:first,outcome:first==='FINAL'?'A_WINS':null,receiptId:'term-E1'});
    assert.equal(result.code, first==='FINAL'?'FINALIZED':'CANCELLED');
    const before=h.inspect();
    assert.equal(h.terminal({battleId:'E1',type:first==='FINAL'?'CANCEL':'FINAL',outcome:'A_WINS',receiptId:'opposite'}).code,'CONFLICT');
    assert.deepEqual(h.inspect(),before);
    assert.equal(before.rewardCount,first==='FINAL'?1:0);
    assert.equal(before.antiFarmCount,1);
  }
});

test('NEG07 [STUB] revoke/regrant does not resurrect old session or NPC grant', t => {
  meta(t, 6);
  const h=createAuthority();
  h.revoke(S('A'));
  assert.equal(h.issueNewSession('person-A','session-person-A-new').code,'ACTIVE');
  assert.equal(h.admit(base('E1')).code,'DENY');
  assert.equal(h.admit({ ...base('E1'), sessions:['session-person-A-new',S('B')] }).code,'CREATED');
  const f = h.terminal({battleId:'E1',type:'FINAL',outcome:'A_WINS',receiptId:'fin-E1'});
  assert.equal(f.code,'FINALIZED');
  assert.equal(h.revokeNpcGrant().code,'REVOKED');
  assert.equal(h.regrantNpc().code,'GRANTED');
  assert.equal(h.npcAction({battleId:'E1',grantEpoch:1}).code,'DENY');
});

test('NEG08 [STUB] rumor and PUBLIC_SUPPORT cannot certify outcome', t => {
  meta(t, 7);
  const h=createAuthority();
  assert.equal(h.observeNpc({knowledgeKind:'HEARD_CLAIM',battleId:'E1'}).code,'NO_VERIFIED_OUTCOME');
  assert.equal(h.observeNpc({knowledgeKind:'PUBLIC_SUPPORT',battleId:'E1'}).code,'NO_VERIFIED_OUTCOME');
  assert.equal(h.observeNpc({knowledgeKind:'VERIFIED_UTTERANCE',battleId:'E1'}).code,'NO_VERIFIED_OUTCOME');
  assert.equal(h.observeNpc({knowledgeKind:'VERIFIED_OUTCOME',battleId:'E1'}).code,'DENY');
  assert.equal(h.npcAction({battleId:'E1',grantEpoch:1}).code,'DENY');
  assert.equal(h.inspect().knowledge.length,0);
  assert.equal(h.inspect().sourceCaps.length,0);
});

test('NEG09 [STUB] semantic source cap permits at most one NPC action per final', t => {
  meta(t, 8);
  const h=createAuthority();
  h.admit(base('E1'));
  h.terminal({battleId:'E1',type:'FINAL',outcome:'A_WINS',receiptId:'fin-E1'});
  const first=h.npcAction({battleId:'E1',grantEpoch:1,kind:'PUBLIC_SUPPORT',target:'A'});
  assert.equal(first.code,'CREATED');
  const before=h.inspect();
  assert.equal(h.npcAction({battleId:'E1',grantEpoch:1,kind:'PUBLIC_SUPPORT',target:'A'}).code,'REUSED');
  assert.equal(h.npcAction({battleId:'E1',grantEpoch:1,kind:'CHALLENGE_PROPOSAL',target:'B',rulesVersion:'v2'}).code,'CONFLICT');
  h.revokeNpcGrant();
  h.regrantNpc();
  assert.equal(h.npcAction({battleId:'E1',grantEpoch:3,kind:'CHALLENGE_PROPOSAL',target:'C'}).code,'CONFLICT');
  assert.equal(h.inspect().sourceCaps.length,1);
  assert.equal(h.inspect().outbox.filter(([k])=>k.startsWith('npc-action:')).length,1);
  assert.equal(before.sourceCaps[0][1].actionId,first.actionId);
});

test('NEG10 [STUB] stale restore fails closed; witness keeps newer revoke/rewards', t => {
  meta(t, 9);
  const h=createAuthority();
  h.admit(base('E1'));
  const stale=h.snapshot(); // Snapshot before both canonical final and revoke.
  const original=h.terminal({battleId:'E1',type:'FINAL',outcome:'A_WINS',receiptId:'final-E1'});
  assert.equal(original.code,'FINALIZED');
  const externalOriginalReceipt=structuredClone(original.receipt); // test oracle only
  h.revoke(S('A'));
  const newerWitnessRevision=h.witness.revision;
  assert.equal(h.restoreSnapshot(stale).code,'QUARANTINED');
  assert.equal(h.witness.revision,newerWitnessRevision);
  const before=h.inspect();
  assert.equal(h.admit(base('E2','A','C')).code,'QUARANTINED');
  assert.equal(h.send({sessionId:S('A'),messageId:'after-restore',text:'x'}).code,'QUARANTINED');
  assert.equal(h.terminal({battleId:'E1',type:'FINAL',outcome:'A_WINS',receiptId:'final-E1'}).code,'QUARANTINED');
  assert.deepEqual(h.inspect(),before);
  assert.equal(externalOriginalReceipt.id,'final-E1');
  assert.equal(h.inspect().rewardCount,0); // Rolled back snapshot is quarantined, not replayed.
  assert.equal(h.witness.revision > stale.revision,true);
});

test('PROVENANCE [STUB] all ten cases explicitly remain non-runtime', () => {
  assertProvenance();
  assert.equal(CASES.length,10);
  assert.ok(CASES.every(c=>c.implementation==='STUB'));
});
