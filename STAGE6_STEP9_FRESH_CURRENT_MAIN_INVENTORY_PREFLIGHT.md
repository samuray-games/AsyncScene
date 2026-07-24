# STAGE 6 STEP 9 - FRESH CURRENT-MAIN INVENTORY PREFLIGHT

STATUS: `STEP3_IN_PROGRESS / SEED_INVALIDATED_AS_CURRENT_AUTHORITY`

CURRENT_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

SEED_PACKAGE: `FULL_TEXT_INVENTORY_CURRENT_MAIN_PACKAGE.zip`

SEED_SNAPSHOT_COMMIT: `e94e4bcb888f4a1e54b2879e3a810118e53a62d9`

## 1. Result

The supplied inventory package is not a valid current-main Step 9 inventory.

Its own summary proves:

- snapshot commit: `e94e4bcb888f4a1e54b2879e3a810118e53a62d9`;
- generated date: 2026-07-03;
- active records: 1930;
- unique active rendered/source texts: 853;
- dynamic template rows: 306.

Current main is:

`7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

Therefore the package is classified:

`HISTORICAL_SEED_ONLY`

It may seed comparison and reuse exact unchanged source identities, but it may not be relabelled or treated as a fresh current-main rebuild.

## 2. Seed blob identity audit

The seed metadata recorded blob SHAs for seven source files. Those were compared against exact current-main blobs.

| SOURCE | SEED BLOB | CURRENT MAIN BLOB | STATUS |
|---|---|---|---|
| `AsyncScene/Web/data.js` | `03cacc742e82e2d0b7c7772c6f65be95721b264f` | `1ef08b25f72456f7f4700b62c90d747bf3c71d07` | `CHANGED_REBUILD_REQUIRED` |
| `AsyncScene/Web/system.js` | `c39a95821e665dd93ce4722250a9d9e7b3fd57d2` | `f165b22fd3ec67d45f7ab15790b3d91db8606305` | `CHANGED_REBUILD_REQUIRED` |
| `AsyncScene/Web/npcs.js` | `4b9028974788a6922c13cbe07f7422dcf817785c` | `4b9028974788a6922c13cbe07f7422dcf817785c` | `EXACT_BLOB_MATCH_SEED_REUSE_CANDIDATE` |
| `AsyncScene/Web/ui/ui-menu.js` | `b0c698154c66f7b52fd37ca33a75e909b00fb67d` | `b0c698154c66f7b52fd37ca33a75e909b00fb67d` | `EXACT_BLOB_MATCH_SEED_REUSE_CANDIDATE` |
| `AsyncScene/Web/ui/ui-dm.js` | `dcea43df6e0159844bc24ff67893fe74ce9b4bd7` | `872d8a416e56b25a975491b187d247d03b4f106a` | `CHANGED_REBUILD_REQUIRED` |
| `AsyncScene/Web/ui/ui-events.js` | `57d0b6019cb355da5b5aa94cda2f8f1b6a7b24ba` | `ef70753ced6fd1396542098c45b425631a2bf4f2` | `CHANGED_REBUILD_REQUIRED` |
| `AsyncScene/Web/ui/ui-battles.js` | `a4cc8943119aaf8e554f5d729c53dc21c7385d05` | `9b11eeffeff3091c4933130d73d96843301f0b08` | `CHANGED_REBUILD_REQUIRED` |

Important:

An exact source blob match permits reuse of static source-text extraction for that file only. It does not automatically prove current routing/visibility if routing is controlled elsewhere.

## 3. Seed rows without deterministic source blob identity

The seed retained fallback rows for these files without a source blob SHA:

- `AsyncScene/Web/index.html` - 19 rows;
- `AsyncScene/Web/state.js` - 2 rows;
- `AsyncScene/Web/ui/ui-boot.js` - 2 rows;
- `AsyncScene/Web/ui/ui-core.js` - 1 row.

Current main blob identities are now pinned:

| SOURCE | CURRENT MAIN BLOB | STATUS |
|---|---|---|
| `AsyncScene/Web/index.html` | `1b97ea0fc63374fe150782796674f9618bf42a90` | `FRESH_REEXTRACTION_REQUIRED` |
| `AsyncScene/Web/state.js` | `5bb465e69d9fd513583039c2e0f7e94e732220ca` | `FRESH_REEXTRACTION_REQUIRED` |
| `AsyncScene/Web/ui/ui-boot.js` | `cf712490a4f771f2354e39634f73aeef4337bc2f` | `FRESH_REEXTRACTION_REQUIRED` |
| `AsyncScene/Web/ui/ui-core.js` | `f9af88596ba1e7f69c4517416cacb1397563d487` | `FRESH_REEXTRACTION_REQUIRED` |

These fallback rows cannot be carried forward as current authority merely because their historical text still looks plausible.

## 4. Source-scope expansion required

The old 11-file seed list is no longer sufficient as a definition of current player-facing text ownership.

Current main includes routed player-facing/system text outside that old list, including at minimum:

- `AsyncScene/Web/events.js`;
- `AsyncScene/Web/conflict/conflict-core.js`;
- current `systemSay(...)` callsites in UI modules;
- late profile/presentation routing;
- post-PR258 stat-toast formatting/presentation paths;
- current start/profile resolver paths in expanded `data.js` and `ui-boot.js`.

The fresh inventory must therefore be rebuilt from the actual current production graph, not by patching the seed's historical source-file whitelist.

## 5. Current-source findings already confirmed during preflight

Current `system.js` directly confirms active source dictionaries for:

- errors;
- warnings;
- notifications;
- system events;
- P2P validation/sent/received text;
- start-screen shared system copy;
- profile text keys and profile-specific presentation copy.

It also still contains `npcArrest*` copy keys and `p2pBacklogReason`, whose Step 9 classification is already resolved separately in `STAGE6_STEP9_SOURCE_DECISIONS_RESOLVED.md`.

Current source search also confirms `systemSay(...)` routed callsites in production paths including:

- `AsyncScene/Web/events.js`;
- `AsyncScene/Web/conflict/conflict-core.js`;
- `AsyncScene/Web/ui/ui-battles.js`;
- `AsyncScene/Web/ui/ui-core.js`;
- `AsyncScene/Web/ui/ui-events.js`;
- `AsyncScene/Web/ui/ui-dm.js`.

## 6. Reuse boundary from the seed

The seed contains 1930 active rows, but only exact unchanged-source portions may be reused as extraction candidates.

From the seed source counts:

- `AsyncScene/Web/npcs.js`: 395 candidate rows;
- `AsyncScene/Web/ui/ui-menu.js`: 29 candidate rows.

Total exact-blob static reuse candidates:

`424`

These remain subject to fresh route/visibility classification.

All other seed rows require fresh extraction or explicit current-source revalidation.

Do not calculate a fake 'fresh total' by subtracting/replacing counts before the expanded current source graph is fully extracted and deduplicated.

## 7. Step 3 rebuild requirements

The fresh inventory must pin for every row:

- exact current-main commit;
- exact source blob SHA;
- source file;
- source line where available;
- semantic path/key;
- player-facing surface;
- profile/resolver path;
- resolved/current text;
- placeholders;
- inheritance/fallback relation;
- mirror path where applicable;
- ownership class;
- route/visibility evidence;
- Step 9 coverage state.

Allowed Step 9 coverage states remain:

- `APPROVED_FIVE_PROFILE`
- `SHARED_INTENTIONALLY`
- `MISSING_CREATIVE_DECISION`
- `NON_PLAYER_FACING`
- `MECHANIC_CANON_LOCKED`
- `LEGACY_SUPERSEDED`

Gen X must be represented explicitly as `MISSING_NEEDS_AUTHORING` or approved copy where runtime does not yet have first-class plumbing.

## 8. Preflight status

`FRESH_CURRENT_MAIN_INVENTORY_PREFLIGHT = COMPLETE`

`FRESH_CURRENT_MAIN_INVENTORY = IN_PROGRESS`

The stale package has been prevented from silently becoming false current authority, exact reusable blob identities have been separated from changed sources, and the source scope has been expanded to the current production routing graph.

NEXT_ACTION: perform deterministic extraction/deduplication against exact `main 7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`, then assign row-level Step 9 coverage states before gap closure.
