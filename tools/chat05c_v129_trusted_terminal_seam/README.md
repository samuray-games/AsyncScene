# CHAT05C V129 - trusted issuer to immutable terminal receipt seam (isolated candidate)

STATUS: EARLY_DRAFT_NOT_REVIEWED. All files task-owned under tools/chat05c_v129_trusted_terminal_seam/**. No shared repo/Worker/migration change.

Physical basis: read-only original bytes 0001..0011 from Chat05C exact-chain private ZIP; separate original 0012 Chat05Б candidate, not owned or modified here; original V128 candidate SQL, not approved. SHA of each embedded upstream file is checked by file manifest in final package.

The sole privileged writer calls injected issuer.verify(), sidecar.verify(), binding.verify(), and witness (no implementation provided for production). Explicitly synthetic HMAC test adapters must never become production issuer. The 0011 sidecar proof is not yet signed or independently reviewed, nor is physical 09A binding authority available; native D1, multi-Worker serialization and externally durable witness remain STOP.

P05-FINAL aims for one FINAL XOR verified CANCEL, immutable exact receipt and event, atomic terminal CAS and one settlement intent, with release of two generation-matched fixture reservations and no reward on cancel. Real economy, auth, 09A occupancy, replay disclosure and independent reviewer remain outside this isolated slice.
