# Чат10Б V125: direct-source negative consumer harness

ATOM: `CHAT10B-V125-SOURCE-ADAPTER-PROVENANCE`

## Truth levels

- `STUB_ONLY`: original V123 executable synthetic in-memory authority, 10 scenarios + 1 provenance test.
- `REAL_SOURCE_OFFLINE`: actual, byte-verified `projectTrustedJudgeFacts()` export from **original private Chat06 V123 V2 ZIP**. Its injected provider is a synthetic local Map, so it does **not** authenticate original 05C or 07B receipts; no real server.
- `REAL_RUNTIME`: **NONE**. No HTTP, Worker, D1, Cloudflare, DB, Safari, real user, deployment or production.
- `Chat09Б`: `BLOCKED_ORIGINAL_CLOUD_CHECKPOINT_NOT_VERIFIED` at creation. Chat09Б V123 Notion reports 14 PASS, but original, durable bytes not recovered from the private cloud folder. The model is **not copied and not executed** in this archive.

## Exact origin

- V123 original ZIP SHA256: `89a23460a513cf059098f9bbcd3ceca845954b003de3119c7addabf7d96ee286`; original V123 file manifest restored byte-identically. The 10 original files remain unchanged in this V125 archive.
- Chat06 original V2 ZIP SHA256: `c88782307a95e5ddbf3fc3a1f63f724844a04816cb8d80d1feb1c6bcb604c6a8`, cloud Drive ID `<owner-private-drive-id>`.
- Chat06 actual source module `source_vendor/chat06/trusted-knowledge-adapter.mjs` SHA256 `d5a3d4b5cb4e4988a3527e7195d3016eef61f9646338c10e4028c0c6032f1e09`; unmodified copy extracted from original ZIP, imported directly.
- Same V2 package test module SHA256 `77a18a4f2c0f3b1f6f4325bd1790ae83999fbf4671b7da89df336c9a354b5b50` and documentation SHA256 `e94d2209b8c11c46387dba946635759d97e32841de6fd81077c3c16333d495d8`.
- PR452 old judge implementation source, pinned Git blob SHA `12ece4f21b9a57004a8c52f67c14c9f4481f7aac`, is NOT in this archive. Therefore one original Chat06 evaluator smoke test stays SKIP.
- Chat09Б V123 Notion-only local ZIP reported SHA256 `faf25936b205d5ad30033f22653842afb2fc90cf7198a1b123a33f58e14a5ece`; no independently verified private original checkpoint as of this task.

## Automated local program (when owner authorizes use)

From repository root after unpacking the verified archive:

`node tools/chat10b_negative_e2e/run-v125.mjs --json`

The runner SHA-checks each original V123 file and all original Chat06 V2 source bytes BEFORE it executes any test, and stops on mismatch. It executes the unchanged original V123 tests, the byte-identical original Chat06 test module and separate Chat10Б-owned negative consumer tests that directly import the original Chat06 function. No package installation needed. Emits precise stage counts and `REAL_RUNTIME=false`.

Expected recorded run: original V123 11 PASS/0 SKIP; Chat06 original 29 PASS/1 SKIP; V125 Chat06 10 PASS/2 SKIP; total 50 PASS, 3 SKIP, 0 FAIL. Current records are not a guarantee of future result.

## Provenance and permissions

Only `tools/chat10b_negative_e2e/**` paths are authored by Chat10Б. `source_vendor/chat06/**` is a byte-identical read-only test copy of Chat06-owned originals and is NEVER edited or published as Chat06 source. The root judge PR452 and Chat09Б code, shared Worker/SQL/boot, live GitHub and other owners are untouched. No local Mac ownership or locks were verified and no branch/PR write claimed.

A real runtime adapter requires a **new** narrow scope and owner permission, authenticated 05C/07A source readback, durable 07Б grant/recipient authority, owner-accepted 04.0/05C/09A topology, independent rollback witness and a genuine independent security reviewer. The fixture's `authority` object is synthetic and not itself proof. No simulated issuer may be promoted to a trusted one. `REAL_RUNTIME_PASS` is always false.

See `SOURCE_MATRIX_V125.md` and `REVIEW_REQUEST_V125.md`.
