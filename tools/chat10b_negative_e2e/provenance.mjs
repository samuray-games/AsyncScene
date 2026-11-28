// Explicitly distinguish source REFERENCE from code ACTUALLY EXECUTED.
export const SOURCE_PINS = Object.freeze({
  baselineMain: 'f256228a2a57e5b8144a42a72a240a7455a76417',
  sourceRefsOnly: [
    { component: 'gameplay', ref: 'main', path: 'gameplay-server/src/worker.js', blob: '33a95d383da23e66f0d5c26cba37167622053c33' },
    { component: 'gameplay-D1', ref: 'main', path: 'gameplay-server/migrations/0001_tactical_state.sql', blob: 'a0d71329c678c060a8225d970f259e800f956771' },
    { component: 'persons', ref: 'main', path: 'gameplay-server/migrations/0008_chat05a_people_and_votes.sql', blob: 'b497397ad477672d13ccf0aa34fbc2ee8129d8be' },
    { component: 'auth', ref: 'PR463@9346f1233b9f25183894aa44c549099bb7243c82', path: 'messaging-server/auth/src/worker.mjs', blob: '54e446848f2d4673c909340c792c6fb87cd73695' },
    { component: 'territory', ref: 'PR455@c954283cc3512e13685793318c4ff4ef36587ed6', path: 'gameplay-server/src/territory-gate.mjs', blob: '9ea1c84c4131ac56f2e08ccc7a38fc364f5f5719' },
    { component: '08A-fixture', ref: 'PR465@2148d35d53a5111f36be428e5fac61b35504d03f', path: 'tools/chat08a_memory_fixtures/memory-model.mjs', blob: 'e96002c752fd43fea4c0c6a4d34cadb6340706a1' },
  ],
  importedSourceModules: [],
  allowedExecution: 'node:test + isolated in-memory stub only',
  forbidden: ['production', 'real-users', 'D1', 'Worker', 'Cloudflare', 'migrations', 'deployment', 'network'],
});

export const CASES = Object.freeze([
  { id: 'NEG01', label: 'Revoked session cannot admit new battle', implementation: 'STUB', owners: ['Chat03', 'Chat04.1B'] },
  { id: 'NEG02', label: 'Revoke before SEND produces no message', implementation: 'STUB', owners: ['Chat04.0', 'Chat04.1B', 'Chat04.2'] },
  { id: 'NEG03', label: 'One person cannot occupy two active battles', implementation: 'STUB', owners: ['Chat09A'] },
  { id: 'NEG04', label: 'Two-person admission failure rolls back both', implementation: 'STUB', owners: ['Chat03', 'Chat09A'] },
  { id: 'NEG05', label: 'Final has one immutable outcome/receipt/outbox', implementation: 'STUB', owners: ['Chat05B', 'Chat05C'] },
  { id: 'NEG06', label: 'Final and cancellation are mutually exclusive', implementation: 'STUB', owners: ['Chat05C', 'Chat09A', 'Chat09B'] },
  { id: 'NEG07', label: 'Revoke/regrant does not revive old grants', implementation: 'STUB', owners: ['Chat03', 'Chat04.1B', 'Chat07B'] },
  { id: 'NEG08', label: 'Rumor and PUBLIC_SUPPORT cannot prove final', implementation: 'STUB', owners: ['Chat07B', 'Chat08A'] },
  { id: 'NEG09', label: 'One NPC source cap per verified final', implementation: 'STUB', owners: ['Chat08B'] },
  { id: 'NEG10', label: 'Restored stale snapshot quarantines without re-grant/reward', implementation: 'STUB', owners: ['Chat03', 'Chat04.1B', 'Chat09B'] },
]);
export function assertProvenance() {
  if (CASES.length !== 10 || new Set(CASES.map(c => c.id)).size !== 10)
    throw new Error('Case count/IDs invalid');
  for (const c of CASES) {
    if (c.implementation !== 'STUB') throw new Error(`Unsafe unverified source claim for ${c.id}`);
    if (!c.owners.length) throw new Error(`No owner for ${c.id}`);
  }
  if (SOURCE_PINS.importedSourceModules.length) throw new Error('Unexpected runtime import claim');
}
