# Chat10Б V127: source-adapter provenance and negative review

This V127 package is a self-contained test-only overlay within `tools/chat10b_negative_e2e/**`. No shared repository files or upstream owner code were modified.

Run with Node.js 22: `node tools/chat10b_negative_e2e/run-v127.mjs --json` from the extracted archive root. **The command is intentionally expected to return exit code 1**, because three NEGATIVE contract tests reproduce three source-model issues. Do not mark the package as PASS because the older fixtures succeeded.

Truth levels:

- `STUB_ONLY`: unchanged V123 in-memory model tests (regression only).
- `REAL_SOURCE_OFFLINE`: unchanged original Chat06 adapter, unchanged PR452 judge module, original Chat09Б `product-model.mjs` imported as actual source exports with synthetic provider/command assumptions.
- `REAL_RUNTIME`: 0 (no server, no D1, no Worker, no trusted issuer, no real grant, no native CAS).

The V125 three original SKIPs were genuine: no adjacent PR452 judge source, no HTTP lost ACK source, no atomic FINAL/CANCEL server source. V127 adds exact PR452 judge source, resolving only the first. Two remain SKIP.

See `REVIEW_V127.md` for the three reproducible Chat09Б FAILs and formal independent critical reviewer STOP; `evidence/v127-actual-run.json` for per-stage counts; `evidence/v127-targeted-failure-trace.tap` for raw negative trace. `run-v127.mjs` checks exact V125 byte hashes, external Chat09Б original manifest, and PR452 judge Git blob SHA before any test.

No original source_vendor file was edited. The five new Chat09Б files and one exact PR452 `judge.mjs` were added as copies of verified originals. All other V125 files remain byte-for-byte unchanged.
