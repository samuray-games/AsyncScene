// ISOLATED TEST-ONLY fixture registry. This is NOT a server issuer, D1 store or ACL implementation.
// Fixtures deliberately model the server-side separation of source issuer, audience and viewer grant.
import { createHash } from 'node:crypto';

const copy = x => structuredClone(x);
const encoded = (...x) => JSON.stringify(x);
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const SOURCE = Object.freeze({ FINAL: 'gameplay.battle.finalized/v1', ACTION: 'npc.action/v1', RELAY: 'npc.relay.delivery/v1' });
export const kindOf = s => s?.issuerClass === 'BATTLE_TERMINAL_FINAL' && s?.sourceSystem === SOURCE.FINAL && s?.terminalKind === 'FINAL' ? 'VERIFIED_OUTCOME' : s?.issuerClass === 'NPC_ACTION_DERIVATIVE' && s?.sourceSystem === SOURCE.ACTION && s?.actionKind === 'PUBLIC_SUPPORT' ? 'PUBLIC_SUPPORT' : s?.issuerClass === 'NPC_ACTION_DERIVATIVE' && s?.sourceSystem === SOURCE.ACTION && s?.actionKind === 'CHALLENGE_PROPOSAL' ? 'CHALLENGE_PROPOSAL' : null;

export class FixtureAuthority {
  #sources = new Map(); #sourceConflicts = new Set(); #finalsByBattle = new Map();
  #viewers = new Map(); #audiences = new Map(); #recipients = new Map(); #relays = new Map(); #relayConflicts = new Set();
  #sourceVersion = 0;
  #key(system, id) { return encoded(system,id); }
  get sourceCount() { return this.#sources.size; }
  get deliveryCount() { return this.#relays.size; }
  registerFinal({ eventId, battleId, mechanicalOutcome='A_WIN', recognizedOutcome='A_WIN', socialOutcome='NONE', winnerDisplay='A', summary='finalized', recipientNpcId='npc-1', recipientGeneration=1, recipientEpoch=1, eventVersion=2, committed=true, phase='final', receipt=true, privateData={} }={}) {
    return this.#register({sourceSystem:SOURCE.FINAL,issuerClass:'BATTLE_TERMINAL_FINAL',terminalKind:'FINAL',id:eventId,battleId,eventVersion,phase,committed,receipt,recipientNpcId,recipientGeneration,recipientEpoch, publicData:{finality:'finalized',mechanicalOutcome,recognizedOutcome,socialOutcome,mechanicalWinnerDisplay:winnerDisplay,allowedSummaryKey:summary},privateData});
  }
  registerAction({actionId, actionKind='PUBLIC_SUPPORT', route, speakerDisplay='NPC', approvedPublishedText='I support this fighter', proposalText='Propose a challenge', recipientId='viewer-a', recipientNpcId='npc-1', recipientGeneration=1, recipientEpoch=1, committed=true, receipt=true, actionVersion=1, privateData={}}={}) {
    return this.#register({sourceSystem:SOURCE.ACTION,issuerClass:'NPC_ACTION_DERIVATIVE', id:actionId,actionKind,route:route??(actionKind==='PUBLIC_SUPPORT'?'AUTHORIZED_PUBLIC':'PRIVATE_RECIPIENT'),intendedRecipientId:recipientId,eventVersion:actionVersion,committed,receipt,recipientNpcId,recipientGeneration,recipientEpoch,publicData:actionKind==='PUBLIC_SUPPORT'?{approvedPublishedText,speakerDisplay}:{proposalText,proposerDisplay:speakerDisplay,proposalState:'PROPOSED'},privateData});
  }
  registerUntrusted({sourceSystem,issuerClass,id,battleId='b-1',actionKind,receipt=false,committed=false,route='AUTHORIZED_PUBLIC', publicData={},privateData={}}={}) {
    return this.#register({sourceSystem,issuerClass,id,battleId,actionKind,receipt,committed,route,eventVersion:1,publicData,privateData});
  }
  #register(row) {
    if(typeof row.id!=='string'||!row.id||typeof row.sourceSystem!=='string'||!row.sourceSystem) throw Error('fixture requires source identity');
    const key=this.#key(row.sourceSystem,row.id); const frozen=copy({...row,sourceVersion: ++this.#sourceVersion}); const fingerprint=hash({...row});
    const current=this.#sources.get(key);
    if(current){if(current.fingerprint!==fingerprint){this.#sourceConflicts.add(key);return 'CONFLICT_QUARANTINE';}return 'IDEMPOTENT_REPLAY';}
    this.#sources.set(key,{row:frozen,fingerprint});
    if(row.sourceSystem===SOURCE.FINAL && row.battleId){const set=this.#finalsByBattle.get(row.battleId)??new Set();set.add(key);this.#finalsByBattle.set(row.battleId,set);}
    return 'INSERTED';
  }
  readSource(system,id){const key=this.#key(system,id);const ent=this.#sources.get(key);if(!ent)return null;return {row:copy(ent.row),fingerprint:ent.fingerprint,conflict:this.#sourceConflicts.has(key)|| (ent.row.sourceSystem===SOURCE.FINAL && (this.#finalsByBattle.get(ent.row.battleId)?.size??0)!==1)};}
  setAudience(system,id,{active=true,viewerIds=['viewer-a'],fields=[],revision=1}={}){this.#audiences.set(this.#key(system,id),{active,viewerIds:[...viewerIds],fields:[...fields],revision});}
  grantViewer(viewerId,system,id,{active=true,generation=1,accessEpoch=1,fieldScope=[],revision=1}={}){this.#viewers.set(encoded(viewerId,system,id),{active,generation,accessEpoch,fieldScope:[...fieldScope],revision});}
  setRecipient(npcId,{active=true,generation=1,accessEpoch=1,visibility=true}={}){this.#recipients.set(npcId,{active,generation,accessEpoch,visibility});}
  revokeViewer(viewerId,system,id){const k=encoded(viewerId,system,id);const x=this.#viewers.get(k);if(x)this.#viewers.set(k,{...x,active:false,accessEpoch:x.accessEpoch+1});}
  revokeRecipient(npcId){const x=this.#recipients.get(npcId);if(x)this.#recipients.set(npcId,{...x,active:false,accessEpoch:x.accessEpoch+1});}
  viewerGate(viewerId,source){const row=source.row,key=this.#key(row.sourceSystem,row.id);const acl=this.#audiences.get(key),viewer=this.#viewers.get(encoded(viewerId,row.sourceSystem,row.id)); const recip=row.recipientNpcId?this.#recipients.get(row.recipientNpcId):null;
    if(!acl?.active||!acl.viewerIds.includes(viewerId)||!viewer?.active||!Number.isSafeInteger(viewer.generation)||!Number.isSafeInteger(viewer.accessEpoch)||!Number.isSafeInteger(acl.revision)||!Number.isSafeInteger(viewer.revision))return null;
    if(row.recipientNpcId && (!recip?.active||!recip.visibility||recip.generation!==row.recipientGeneration||recip.accessEpoch!==row.recipientEpoch))return null;
    if(row.actionKind==='CHALLENGE_PROPOSAL' && row.intendedRecipientId!==viewerId)return null;
    return {fields:acl.fields.filter(f=>viewer.fieldScope.includes(f)),viewerGeneration:viewer.generation,viewerEpoch:viewer.accessEpoch,viewerRevision:viewer.revision,aclRevision:acl.revision,recipientGeneration:recip?.generation??null,recipientEpoch:recip?.accessEpoch??null};
  }
  recordRelay({receiptId,sourceSystem,canonicalEventId,speakerId,recipientId,claimText}={}){const contents={sourceSystem,canonicalEventId,speakerId,recipientId,claimText};const signature=hash(contents);const existing=this.#relays.get(receiptId);if(existing){if(existing.signature!==signature){this.#relayConflicts.add(receiptId);return 'CONFLICT_QUARANTINE';}return 'IDEMPOTENT_REPLAY';}this.#relays.set(receiptId,{signature,contents:copy(contents)});return 'RECORDED_DELIVERY_ONLY';}
  isRelayConflicted(receiptId){return this.#relayConflicts.has(receiptId);}
}
