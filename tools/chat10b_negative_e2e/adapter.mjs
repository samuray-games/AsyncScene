// Stable integration seam inside Chat10B-owned test scope ONLY.
// Future source adapters replace this module, not upstream owned modules.
// Never alter provenance to SOURCE unless a real pinned source import executes.
import { createStubAuthority, STUB_PROVENANCE } from './stub-authority.mjs';

export const ADAPTER_PROVENANCE = Object.freeze({
  ...STUB_PROVENANCE,
  adapter: 'tools/chat10b_negative_e2e/adapter.mjs',
  runtimePass: false,
});
export const createAuthority = createStubAuthority;
