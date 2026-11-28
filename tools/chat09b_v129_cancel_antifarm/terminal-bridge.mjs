// Chat09Б V129: proposed offline contract only. Does not issue or authenticate 05C receipts.
// A real server-owned resolver must independently check the unique committed 05C terminal,
// issuer, tenant, same battle, immutable receipt, participant/person mapping and pair attempt.
// Never wire this module to client-provided resolver or client-supplied "verified" objects.
import {clone, initial, step as syntheticV128Step} from './vendor/v128/product-model.mjs';
export {clone, initial};

const fail = (state, outcome) => ({state:clone(state), outcome});
const nonEmpty = v => typeof v === 'string' && v.length > 0 && v === v.trim();
const cleanGeneration = n => Number.isSafeInteger(n) && n >= 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// This is the safe default entry point for Chat10Б consumers. The imported V128
// step in product-model.mjs is a LEGACY SYNTHETIC FIXTURE and grants no authority.
export function step(state, command) {
  if (!command || typeof command !== 'object') return fail(state,'DENY_BAD_COMMAND');
  if (command.type === 'FINAL' || command.type === 'CANCEL')
    return fail(state,'DENY_VERIFIED_05C_REQUIRED');
  return syntheticV128Step(state, command);
}

function normalizedPeople(items, requireParticipant) {
  if (!Array.isArray(items) || items.length !== 2) return null;
  const persons = new Set(), participants = new Set(), normalized = [];
  for (const item of items) {
    if (!item || typeof item !== 'object' || !nonEmpty(item.personId) ||
        !cleanGeneration(item.generation) || persons.has(item.personId)) return null;
    if (requireParticipant && (!nonEmpty(item.participantId) || participants.has(item.participantId))) return null;
    persons.add(item.personId);
    if (requireParticipant) participants.add(item.participantId);
    normalized.push({personId:item.personId, participantId:requireParticipant?item.participantId:null, generation:item.generation});
  }
  normalized.sort((a,b) => a.personId.localeCompare(b.personId));
  return normalized;
}
function sameParticipants(a,b) {
  const x=normalizedPeople(a,true),y=normalizedPeople(b,true);
  return !!x && !!y && same(x,y);
}
function validActiveBinding(state) {
  const b=state?.battle;
  if (!b || !nonEmpty(b.id) || !nonEmpty(b.tenantId) || !nonEmpty(b.pairAttemptId) ||
      !Array.isArray(b.people) || !Array.isArray(b.participants)) return false;
  const p=normalizedPeople(b.participants,true);
  if (!p || b.people.length !== 2) return false;
  const map=new Map(b.people.map(x=>[x?.id,x?.generation]));
  if (map.size !== 2 || p.some(x=>map.get(x.personId)!==x.generation)) return false;
  const attempts=state?.history?.pairAttempts;
  return Array.isArray(attempts) && attempts.filter(x=>x===b.pairAttemptId).length===1;
}
function exactOccupation(state) {
  const b=state.battle;
  if (!state.occupied || typeof state.occupied !== 'object' || Array.isArray(state.occupied))return false;
  const ids=new Set(b.people.map(x=>x.id));
  const matching=Object.entries(state.occupied).filter(([,v])=>v?.battleId===b.id);
  if (matching.length!==2 || matching.some(([id])=>!ids.has(id)))return false;
  return b.people.every(p=>same(state.occupied[p.id],{battleId:b.id,generation:p.generation}));
}
function exactFact(f, request, b) {
  // Fields in 'f' come solely from the private server-owned resolver, not request JSON.
  // Marker strings/fences are consistency checks, NOT a proof that a callback is trusted.
  return !!f && typeof f==='object' && !Array.isArray(f) &&
    f.sourceSystem==='05C' && f.committed===true && f.uniqueTerminal===true &&
    nonEmpty(f.commitFence) && nonEmpty(f.sourceEventId) && nonEmpty(f.issuerId) &&
    f.tenantId===b.tenantId && f.battleId===b.id &&
    f.terminalReceiptId===request.terminalReceiptId &&
    f.terminalKind===request.terminalKind &&
    f.pairAttemptId===b.pairAttemptId && sameParticipants(f.participants,b.participants);
}
function canonicalReceipt(f,b) {
  return {id:f.terminalReceiptId,battleId:b.id,
    kind:f.terminalKind,people:clone(b.people),
    sourceSystem:'05C',tenantId:b.tenantId,pairAttemptId:b.pairAttemptId,
    terminalReceiptId:f.terminalReceiptId,issuerId:f.issuerId,
    sourceEventId:f.sourceEventId,commitFence:f.commitFence,
    participants:normalizedPeople(f.participants,true)};
}

// Private authority resolver contract: ({tenantId,battleId,terminalReceiptId}) =>
// unique committed 05C terminal record, or null. The resolver MUST check the real
// issuer/receipt/terminal XOR/outbox/CAS before returning facts; this code cannot.
export async function applyCommitted05CTerminal(state, request, authority) {
  if (!request || typeof request!=='object' || !state?.battle)return fail(state,'DENY_BAD_COMMAND');
  const b=state.battle;
  if (request.battleId!==b.id)return fail(state,'CONFLICT_WRONG_BATTLE');
  if (!validActiveBinding(state))return fail(state,'DENY_ACTIVE_BINDING_MISSING');
  if (!['TERMINAL_FINAL','TERMINAL_CANCELLED'].includes(request.terminalKind) ||
      !nonEmpty(request.terminalReceiptId))return fail(state,'CONFLICT_RECEIPT_BINDING');
  if (request.pairAttemptId!==b.pairAttemptId)return fail(state,'CONFLICT_PAIR_ATTEMPT');
  if (!sameParticipants(request.participants,b.participants))return fail(state,'CONFLICT_PARTICIPANTS');
  if (!authority || typeof authority.readCommittedTerminal!=='function')
    return fail(state,'DENY_VERIFIED_05C_REQUIRED');

  let fact;
  try {
    fact=await authority.readCommittedTerminal({tenantId:b.tenantId,battleId:b.id,
      terminalReceiptId:request.terminalReceiptId});
  } catch {
    return fail(state,'DENY_05C_UNAVAILABLE');
  }
  if (!fact || fact.committed!==true || fact.uniqueTerminal!==true)
    return fail(state,'DENY_05C_UNVERIFIED');
  if (!exactFact(fact,request,b))return fail(state,'CONFLICT_05C_BINDING');
  if (fact.terminalKind==='TERMINAL_CANCELLED' &&
      (fact.combatResult!=='NO_COMBAT_RESULT' || fact.rewardDisposition!=='NO_REWARD' ||
       fact.settlementIntent!==null))return fail(state,'DENY_CANCEL_ECONOMY_SEMANTICS');

  const receipt=canonicalReceipt(fact,b);
  const status=request.terminalKind==='TERMINAL_CANCELLED'?'CANCELLED':'FINAL';
  if (b.status!== 'ACTIVE') {
    if (b.status!==status)return fail(state,'CONFLICT_TERMINAL');
    return fail(state,same(b.receipt,receipt)?'REUSED':'CONFLICT_TERMINAL');
  }
  if (!exactOccupation(state))return fail(state,'CONFLICT_OCCUPANCY');
  // Only after a fresh server-owned committed 05C readback is the old synthetic
  // state transition reused. No client-supplied trusted* field gets forwarded.
  const command={type:status==='FINAL'?'FINAL':'CANCEL',battleId:b.id,
    expectedPeople:clone(b.people),
    [status==='FINAL'?'trustedFinalReceipt':'trustedTerminalReceipt']:receipt};
  const r=syntheticV128Step(state,command);
  if (r.outcome!== (status==='FINAL'?'TERMINAL_FINAL_NO_SETTLEMENT_SIMULATED':'TERMINAL_CANCELLED'))
    return fail(state,r.outcome);
  if (status==='CANCELLED') {
    r.state.battle.combatResult='NO_COMBAT_RESULT';
    r.state.battle.rewardDisposition='NO_REWARD';
  }
  return r;
}
