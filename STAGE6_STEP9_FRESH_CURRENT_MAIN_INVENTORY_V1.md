# STAGE 6 STEP 9 - FRESH CURRENT MAIN INVENTORY V1

STATUS: `COMPLETE_CURRENT_MAIN_SOURCE_BOUND_INVENTORY / NOT_FROZEN`

BASELINE_MAIN: `7673f3487b0dd52c0c5cb2c7826f4e3fe5cc570e`

SEED_SNAPSHOT: `e94e4bcb888f4a1e54b2879e3a810118e53a62d9` - historical evidence only.

## 1. Completion meaning

Step 3 is complete as a deterministic, current-main-bound source inventory.

This inventory does **not** relabel the historical `1930 / 853 / 306` seed counts as fresh. Those figures remain historical only.

Freshness is established instead from:

1. exact current-main commit identity;
2. the active runtime entrypoint `AsyncScene/Web/index.html` and its loaded script graph;
3. exact blob SHA identity for every copy-bearing active source family inspected;
4. explicit source/deployed-mirror identity checks;
5. current final presentation authority loaded last by the entrypoint;
6. semantic-family classification rules that cover active player-facing copy, mechanic-locked data, dev-only text, legacy/orphan text and mirror aliases.

The repository-stored `TEXT_INVENTORY_EXPORT/*` remains a supplemental repository-wide candidate universe only. Its stored category hit counts are not promoted to fresh unique/current-authoritative row counts because the export files do not self-bind to a generation commit.

## 2. Deterministic runtime root

Current `AsyncScene/Web/index.html` blob:

`1b97ea0fc63374fe150782796674f9618bf42a90`

It loads the current active runtime graph including:

- `util.js`
- `system.js`
- `state.js`
- `data.js`
- `npcs.js`
- `conflict/conflict-core.js`
- `conflict/conflict-economy.js`
- `conflict/conflict-arguments.js`
- `conflict/conflict-api.js`
- `events.js`
- `ui/ui-core.js`
- `ui/ui-chat.js`
- `ui/ui-dm.js`
- `ui/logger.js`
- `ui/ui-battles.js`
- `ui/ui-events.js`
- `ui/ui-menu.js`
- `ui/ui-console-panel.js`
- `ui/ui-loops.js`
- `ui/ui-boot.js`
- `dev/dev-checks.js`
- `dev/boomer-step4-4b-current-contract-adapter.js`
- `ui/ui-profile-visual-tone-repair.js`

`ui/ui-profile-visual-tone-repair.js` loads after the older dictionaries/runtime surfaces and is therefore the current late presentation authority for the surfaces it wraps or overrides.

## 3. Exact current source identity

| SOURCE | CURRENT BLOB SHA | TEXT/COPY CLASS |
|---|---|---|
| `AsyncScene/Web/index.html` | `1b97ea0fc63374fe150782796674f9618bf42a90` | player-facing HTML fallbacks + runtime wiring |
| `AsyncScene/Web/util.js` | `f37aec4ca6f1831d9e513e54858249f62bc6523e` | utility / inspect only when routed visible |
| `AsyncScene/Web/system.js` | `f165b22fd3ec67d45f7ab15790b3d91db8606305` | system copy + routes |
| `AsyncScene/Web/state.js` | `5bb465e69d9fd513583039c2e0f7e94e732220ca` | state / inspect visible fallbacks only |
| `AsyncScene/Web/data.js` | `1ef08b25f72456f7f4700b62c90d747bf3c71d07` | profile dictionaries, start, cop, arguments, data copy |
| `AsyncScene/Web/npcs.js` | `4b9028974788a6922c13cbe07f7422dcf817785c` | NPC speech/DM/runtime pools |
| `AsyncScene/Web/conflict/conflict-core.js` | `1cf8ac4cba02d736229cb7f3fac3a7891fa6983b` | conflict results/feed/runtime copy |
| `AsyncScene/Web/conflict/conflict-economy.js` | `c65e85a60552ec1f0ace42562f3f43e377e994aa` | economy mechanics + visible outcomes where routed |
| `AsyncScene/Web/conflict/conflict-arguments.js` | `559dc0a8a89d648de241e9d9e8daf07e30798aae` | argument mechanics/presentation |
| `AsyncScene/Web/conflict/conflict-api.js` | `ae6e6e9c823a092999e14bee49b866ea867eacee` | conflict API / visible failures where routed |
| `AsyncScene/Web/events.js` | `447bdc2d362785dc9655c208a20cecb4cdd66aad` | event/crowd/feed runtime |
| `AsyncScene/Web/ui/ui-core.js` | `f9af88596ba1e7f69c4517416cacb1397563d487` | persistent UI + P2P disabled surface + toasts |
| `AsyncScene/Web/ui/ui-chat.js` | `fcf5c14178f896da9a7b8603684c5102a88cd216` | chat UI/system bubbles |
| `AsyncScene/Web/ui/ui-dm.js` | `872d8a416e56b25a975491b187d247d03b4f106a` | DM/report/respect/training UI |
| `AsyncScene/Web/ui/logger.js` | `b177e28df09f6f9b85b685d4f29a8824dea3d439` | logging / non-player-facing by default |
| `AsyncScene/Web/ui/ui-battles.js` | `9b11eeffeff3091c4933130d73d96843301f0b08` | battle cards/actions/results |
| `AsyncScene/Web/ui/ui-events.js` | `ef70753ced6fd1396542098c45b425631a2bf4f2` | events/crowd cards/actions/results |
| `AsyncScene/Web/ui/ui-menu.js` | `b0c698154c66f7b52fd37ca33a75e909b00fb67d` | menu/goal/training/P2P entry surfaces |
| `AsyncScene/Web/ui/ui-console-panel.js` | `c1ceffc7b8505a12c1ab34574bab0bde9cf68d39` | dev-mode surface / excluded from normal player tone |
| `AsyncScene/Web/ui/ui-loops.js` | `576dad3f551925467c46660da3e0c1f7d42fc83c` | loop wiring / inspect visible emitters only |
| `AsyncScene/Web/ui/ui-boot.js` | `cf712490a4f771f2354e39634f73aeef4337bc2f` | boot/start/persistent control wiring |
| `AsyncScene/Web/dev/dev-checks.js` | `1f1b58d232dfa7eb25578836ffebd5206602db50` | dev/smoke only, not normal player copy authority |
| `AsyncScene/Web/dev/boomer-step4-4b-current-contract-adapter.js` | `93840aeaada56bbac392fcf63ad73c887088f795` | dev/smoke compatibility only |
| `AsyncScene/Web/ui/ui-profile-visual-tone-repair.js` | `df69cc0ac3e7e3899955d0144cb06e5d0dfa6347` | **late Stage 6 presentation authority** |
| `AsyncScene/Web/style.css` | `738398815ed6ca310a5e3dee0dbea2cd24729e89` | presentation, no independent semantic copy authority |

## 4. Seed carry-forward result

Historical seed rows may be carried forward only when exact source blob identity still matches.

Confirmed byte-identical seed source candidates:

- `AsyncScene/Web/npcs.js` -> `4b9028974788a6922c13cbe07f7422dcf817785c`
- `AsyncScene/Web/ui/ui-menu.js` -> `b0c698154c66f7b52fd37ca33a75e909b00fb67d`

Changed since seed and therefore freshly rebound here:

- `data.js`
- `system.js`
- `ui-dm.js`
- `ui-events.js`
- `ui-battles.js`

Seed fallback-only sources are now bound to exact current blobs rather than left as unproven fallbacks:

- `index.html`
- `state.js`
- `ui-boot.js`
- `ui-core.js`

New current active scope absent from the old 11-file seed list is explicitly included here, especially:

- `events.js`
- `conflict/conflict-core.js`
- `conflict/conflict-economy.js`
- `conflict/conflict-arguments.js`
- `conflict/conflict-api.js`
- `ui/ui-chat.js`
- `ui/ui-profile-visual-tone-repair.js`

## 5. Source/deployed mirror identity

Verified exact parity:

- `index.html`
- `data.js`
- `system.js`
- `events.js`
- `conflict/conflict-core.js`
- `conflict/conflict-economy.js`
- `conflict/conflict-arguments.js`
- `ui/ui-core.js`
- `ui/ui-chat.js`
- `ui/ui-dm.js`
- `ui/ui-battles.js`
- `ui/ui-events.js`
- `ui/ui-profile-visual-tone-repair.js`
- `util.js`

Verified mirror drift on current main:

| SOURCE | SOURCE SHA | DOCS MIRROR SHA | STATUS |
|---|---|---|---|
| `npcs.js` | `4b9028974788a6922c13cbe07f7422dcf817785c` | `86088ba5c918f65301707280a29e22236e0b90b7` | `MIRROR_DRIFT` |
| `ui/ui-menu.js` | `b0c698154c66f7b52fd37ca33a75e909b00fb67d` | `96a8ea2b1701a411c89ae69128c324e1aa2c2436` | `MIRROR_DRIFT` |
| `ui/ui-boot.js` | `cf712490a4f771f2354e39634f73aeef4337bc2f` | `339470154f9528dccba618782156a2749d4e407e` | `MIRROR_DRIFT` |
| `conflict/conflict-api.js` | `ae6e6e9c823a092999e14bee49b866ea867eacee` | `0bb1b2982af33c3200aa00eaca28eabd1253d877` | `MIRROR_DRIFT` |
| `state.js` | `5bb465e69d9fd513583039c2e0f7e94e732220ca` | `e55871fffb2ced60a0617bdf47e6476542157563` | `MIRROR_DRIFT` |
| `ui/ui-loops.js` | `576dad3f551925467c46660da3e0c1f7d42fc83c` | `bb55a3d1ebe0cc46200cacbc9ebeffa6a5ae01cd` | `MIRROR_DRIFT` |

Mirror drift is an implementation/integration gap, not permission to silently choose whichever copy is convenient. Source code remains implementation authority; deployed docs mirrors must be synchronized in the same serialized ownership lane unless an explicit deterministic transformation is proven.

## 6. Current structural profile resolution

Fresh source inspection proves:

### Gen X

- birth-year band exists: `1965-1980 -> genX`;
- canonical normalization contains `genx -> genX`;
- `UI_PROFILE_REGISTRY.supported` does **not** contain Gen X;
- `resolveUiTextMode()` does not return a Gen X mode;
- final Stage 6 presentation authority declares only `millennial / zoomer / alpha / boomer`;
- therefore Gen X currently resolves/falls through another profile rather than being first-class.

Classification:

`ACTIVE_STRUCTURAL_GAP / GEN_X_NOT_FIRST_CLASS`

### Alpha inheritance

Fresh `data.js` still establishes Zoomer from the old Alpha baseline, then rebuilds Alpha by spreading that baseline and overriding only selected keys. The late presentation layer adds more Alpha overrides, but does not make the underlying inventory independently first-class across every surface.

Classification:

`ACTIVE_HIDDEN_INHERITANCE_GAP / ALPHA_PARTIAL_ZOOMER_BASELINE`

### Cop/CAP families

Fresh source still contains profile families where Zoomer/Alpha/default inherit Millennial content and Gen X has no explicit first-class path.

Classification:

`ACTIVE_PROFILE_COVERAGE_GAP`

## 7. Semantic-family inventory and coverage state

Every active player-facing family is assigned one Step 9 state below. Literal mechanic data and dev-only material are not forced into generational rewrite queues.

| FAMILY | CURRENT SOURCES | STEP 9 STATE |
|---|---|---|
| start/onboarding | `data.js`, `ui-boot.js`, `index.html`, final presentation layer | `MISSING_CREATIVE_DECISION` until user approves current five-profile draft |
| persistent chrome | `index.html`, `ui-core.js`, `ui-boot.js`, final presentation layer | `MISSING_CREATIVE_DECISION` |
| chat | `index.html`, `ui-chat.js`, `ui-core.js`, final presentation layer | `MISSING_CREATIVE_DECISION` |
| DM | `index.html`, `ui-dm.js`, `ui-core.js`, final presentation layer | `MISSING_CREATIVE_DECISION` |
| battle/conflict actions | `data.js`, `conflict/*`, `ui-battles.js`, final presentation layer | `MISSING_CREATIVE_DECISION` |
| argument labels/hints | `data.js`, `conflict-arguments.js`, UI | presentation `MISSING_CREATIVE_DECISION`; canonical argument logic/text semantics `MECHANIC_CANON_LOCKED` |
| vote/crowd | `data.js`, `events.js`, `ui-events.js`, `system.js` | `MISSING_CREATIVE_DECISION` |
| report/cop flow | `data.js`, `system.js`, `ui-dm.js`, NPC cop pools | `MISSING_CREATIVE_DECISION` |
| economy blockers/results | `data.js`, `system.js`, `conflict-economy.js`, UI | `MISSING_CREATIVE_DECISION`; numeric mechanics `MECHANIC_CANON_LOCKED` |
| unified stat toasts | final presentation layer + routed system/economy emitters | `MISSING_CREATIVE_DECISION`; architecture `MECHANIC_CANON_LOCKED` / preserve PR #258 coalescing |
| win/loss/draw | `data.js`, `conflict-core.js`, `ui-battles.js`, `system.js` | `MISSING_CREATIVE_DECISION` |
| cooldown/empty/error/success | `data.js`, `system.js`, UI | `MISSING_CREATIVE_DECISION` |
| system/feed/unlocks | `system.js`, `events.js`, UI | `MISSING_CREATIVE_DECISION` |
| NPC speech/DM/flavour | `npcs.js`, `data.js` cop pools | `MISSING_CREATIVE_DECISION` + `MIRROR_DRIFT` for `npcs.js` |
| accessibility stepper labels | `index.html` / start wiring | `SHARED_INTENTIONALLY / ACCESSIBILITY_CANON` |
| canonical argument pairs/families | `data.js` | `MECHANIC_CANON_LOCKED` |
| dev console/smoke/check copy | `dev/*`, `ui-console-panel.js` | `NON_PLAYER_FACING` for normal Step 9 tone |
| legacy `conflict-old.js` copy | file not loaded by current entrypoint | `LEGACY_SUPERSEDED` |
| `npcArrest*` | `system.js` dictionary only, no confirmed routed active mechanic | `LEGACY_SUPERSEDED_CANDIDATE` / excluded from creative queue |
| disabled P2P backlog reason | `system.js` + `ui-core.js` | `PRODUCT_DECISION_RESOLVED: HIDE_DISABLED_P2P_BLOCK_UNTIL_FEATURE_ENABLED` |
| real P2P transfer copy | `system.js` + transfer mechanics | future active family only when capability enabled; then requires five-profile copy |

## 8. Supplemental raw candidate universe

The repository-stored export reports these stored category hit counts:

- buttons: 547
- errors/warnings: 1267
- HTML text: 937
- labels: 847
- NPC say/DM: 583
- reports/log/feed/timeline/chronicle: 1377
- tables/cards/lists: 1547
- template literals: 4394
- toasts/notifications: 484
- tooltip/title/ARIA/placeholder: 20

Total stored category hits: 12003.

These are grep/category hits and may overlap, include docs/dev/history and duplicate mirror occurrences. They are **not** presented as 12003 unique player-facing strings.

The authoritative Step 9 inventory is the active-source + semantic-family classification above, bound to exact current-main blobs and routing.

## 9. Fresh inventory closure criteria

PASS:

- exact current main bound: yes;
- active entrypoint graph identified: yes;
- old seed treated as historical only: yes;
- byte-identical seed carry-forward constrained by blob identity: yes;
- changed old sources rebound fresh: yes;
- new active source families added: yes;
- late presentation authority included: yes;
- Gen X explicit target/gap recorded: yes;
- hidden inheritance recorded: yes;
- mechanic-locked data separated from creative copy: yes;
- dev/legacy/orphan text separated: yes;
- mirror drift surfaced rather than silently deduplicated: yes;
- no stale historical totals relabeled as current: yes.

RESULT: `FRESH_CURRENT_MAIN_INVENTORY = COMPLETE`

NEXT_ACTION: `STEP9_GAP_CLOSURE_FROM_CURRENT_MAIN_INVENTORY`.
