// Isolated synthetic product oracle. NOT an issuer, ledger, reservation service or runtime implementation.
export const clone = x => structuredClone(x);
export function initial() {
  return {battle:{id:'B1',status:'ACTIVE',people:[{id:'P1',generation:7},{id:'P2',generation:4}],receipt:null},
    occupied:{P1:{battleId:'B1',generation:7},P2:{battleId:'B1',generation:4}},
    history:{pairAttempts:['P1:P2:B1'],cooldowns:{P1:'EXISTING',P2:'EXISTING'},newcomer:{P1:'PROTECTED'},antiFarm:['P1:P2'],territory:{P1:'T1'}},
    ledger:{results:[],rewards:[],rep:[],money:[],points:[]},reviewRequests:[],terminalCount:0};
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// A person-wide reservation pair is identified by two DISTINCT actors and their exact
// generations. Array order is presentation only, never an authorization signal.
function sameReservationPair(candidate, original) {
  if(!Array.isArray(candidate) || !Array.isArray(original) || candidate.length!==2 || original.length!==2)return false;
  const toMap = pair => {
    const entries = new Map();
    for(const p of pair) {
      if(!p || typeof p.id!=='string' || !p.id || !Number.isSafeInteger(p.generation) || p.generation<0 || entries.has(p.id))return null;
      entries.set(p.id,p.generation);
    }
    return entries;
  };
  const a=toMap(candidate),b=toMap(original);
  return !!a && !!b && a.size===2 && b.size===2 && [...a].every(([id,generation])=>b.get(id)===generation);
}
function exactActivePair(s,b) {
  if(!sameReservationPair(b.people,b.people))return false;
  const ids=new Set(b.people.map(p=>p.id));
  const occupying=Object.entries(s.occupied).filter(([,entry])=>entry && entry.battleId===b.id);
  if(occupying.length!==2 || occupying.some(([id])=>!ids.has(id)))return false;
  return b.people.every(p=>same(s.occupied[p.id],{battleId:b.id,generation:p.generation}));
}
function boundReceipt(receipt,b,kind) {
  if(!receipt || typeof receipt!=='object' || Array.isArray(receipt))return false;
  if(typeof receipt.id!=='string' || !receipt.id.trim() || receipt.battleId!==b.id || receipt.kind!==kind)return false;
  // If the synthetic issuer supplies an optional embedded reservation pair,
  // it cannot contradict the immutable active pair. V123 had no such field.
  if(Object.hasOwn(receipt,'people') && !sameReservationPair(receipt.people,b.people))return false;
  return true;
}
export function step(state, command) {
  const s=clone(state), b=s.battle;
  if(command.type==='REQUEST_REVIEW') {s.reviewRequests.push({battleId:b.id,by:command.personId});return {state:s,outcome:'REVIEW_REQUESTED'};}
  if(['UI_TIMEOUT','LOGOUT','RELOAD','ZONE_CHANGE','OPPONENT_MISSING','VOTE_CLOSED','PROPOSAL_EXPIRED'].includes(command.type))return {state:s,outcome:'RETAINED'};
  if(command.type==='INVITE') {
    if(s.occupied[command.personId])return {state:s,outcome:'BUSY'};
    return {state:s,outcome:'RECHECK_ADMISSION_REQUIRED'}; // never grants a new battle
  }
  if(command.type==='CANCEL') {
    if(!command.trustedTerminalReceipt) return {state:s,outcome:'DENY_NO_AUTHORITY'};
    if(command.battleId!==b.id)return {state:s,outcome:'CONFLICT_WRONG_BATTLE'};
    if(b.status==='FINAL')return {state:s,outcome:'FINAL_ALREADY_COMMITTED'};
    if(b.status==='CANCELLED')return {state:s,outcome:same(b.receipt,command.trustedTerminalReceipt)?'REUSED':'CONFLICT_TERMINAL'};
    if(b.status!=='ACTIVE')return {state:s,outcome:'CONFLICT_BATTLE_STATE'};
    if(!boundReceipt(command.trustedTerminalReceipt,b,'TERMINAL_CANCELLED'))return {state:s,outcome:'CONFLICT_RECEIPT_BINDING'};
    if(!sameReservationPair(command.expectedPeople,b.people))return {state:s,outcome:'CONFLICT_GENERATION'};
    if(!exactActivePair(s,b))return {state:s,outcome:'CONFLICT_OCCUPANCY'};
    b.status='CANCELLED';b.receipt=clone(command.trustedTerminalReceipt);s.terminalCount++;
    for(const p of b.people)delete s.occupied[p.id];
    return {state:s,outcome:'TERMINAL_CANCELLED'};
  }
  if(command.type==='FINAL') {
    if(!command.trustedFinalReceipt)return {state:s,outcome:'DENY_NO_AUTHORITY'};
    if(command.battleId!==b.id)return {state:s,outcome:'CONFLICT_WRONG_BATTLE'};
    if(b.status==='CANCELLED')return {state:s,outcome:'CANCEL_ALREADY_COMMITTED'};
    if(b.status==='FINAL')return {state:s,outcome:same(b.receipt,command.trustedFinalReceipt)?'REUSED':'CONFLICT_TERMINAL'};
    if(b.status!=='ACTIVE')return {state:s,outcome:'CONFLICT_BATTLE_STATE'};
    if(!boundReceipt(command.trustedFinalReceipt,b,'TERMINAL_FINAL'))return {state:s,outcome:'CONFLICT_RECEIPT_BINDING'};
    if(!sameReservationPair(command.expectedPeople,b.people))return {state:s,outcome:'CONFLICT_GENERATION'};
    if(!exactActivePair(s,b))return {state:s,outcome:'CONFLICT_OCCUPANCY'};
    b.status='FINAL';b.receipt=clone(command.trustedFinalReceipt);s.terminalCount++;
    for(const p of b.people)delete s.occupied[p.id];
    // No settlement simulated. Real finalizer and ledger are separate authorities.
    return {state:s,outcome:'TERMINAL_FINAL_NO_SETTLEMENT_SIMULATED'};
  }
  throw Error('Unknown synthetic command');
}
