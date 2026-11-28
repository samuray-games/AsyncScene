import test from 'node:test';
import assert from 'node:assert/strict';
import { projectTrustedJudgeFacts, TrustedJudgeProofError } from '../source_vendor/chat06/trusted-knowledge-adapter.mjs';

// Direct invocation of verified-original Chat06 export, not a reproduced authorization algorithm.
// Every provider method must remain uncalled: wrong recipient is rejected before dereference.
test('V127-C06-01 REAL_SOURCE_OFFLINE: wrong judge recipient is denied before source read', () => {
  const input = { voteId:'vote-synthetic', battleId:'battle-current', participantIds:['A','B'],
    lines:['A1','B1','A2','B2'].map(lineId=>({lineId, claims:[]})) };
  const snapshot = { judgeId:'judge-A', snapshotAt:'2026-11-11T10:00:00.000Z', knownFacts:[] };
  let providerCalls=0;
  const never=()=>{ providerCalls++; throw Error('Provider must not be called for foreign recipient'); };
  const authority={getSource:never,getKnowledge:never,getGrant:never,getAssertion:never,approvedIssuerFor:never};
  const evidenceRefs=[{
    knowledgeKey:'synthetic-known',knowledgeKind:'VERIFIED_OUTCOME',
    sourceNamespace:'gameplay.battle.finalized/v1',sourceId:'old:final',sourceReceiptId:'receipt',
    sourceDigest:'digest',recipientNpcId:'judge-B',grantId:'g',grantGeneration:1,accessEpoch:1,
    firstLearnedAtServer:'2026-11-11T09:00:00.000Z',knowledgeReceiptDigest:'hash',
  }];
  assert.throws(()=>projectTrustedJudgeFacts({input,snapshot,evidenceRefs},authority),
    e=>e instanceof TrustedJudgeProofError && e.code==='FOREIGN_RECIPIENT');
  assert.equal(providerCalls,0);
});
