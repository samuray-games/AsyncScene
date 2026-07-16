# Asynchronia model-preflight E2E repair

TASK_ID: TASK-INFRA-MODEL-PREFLIGHT-E2E-REPAIR-20260717
STATUS: INTEGRATED_INSTALLATION_AND_LIVE_CANARY_PENDING
BASELINE: 72081f921906dbf7bb5a3a8f0ab227254be8cc20
INTEGRATED_MAIN_SHA: 47ed2df0908d82da91b14b9cb85ff01f0bf1f12c
PULL_REQUEST: 228
PLUGIN_VERSION: 1.0.14
INSTALLED_PLUGIN_VERSION: 1.0.13
INSTALLATION_STATUS: UPDATE_REQUIRED
LIVE_MUTATION_CANARY_STATUS: PENDING_INSTALLATION_AND_USER_MODEL_SELECTION
RUNTIME_SCOPE: NONE_INFRASTRUCTURE_ONLY
SAFARI_STATUS: N/A_INFRASTRUCTURE_ONLY_NO_RUNTIME_OR_GAME_FILE_CHANGE
STAGE_6_STATUS: PAUSED_BY_USER

## Confirmed failures

1. Exact `мост 1` could return a prose-only `WAITING_FOR_MODEL_SELECTION` response without executable selector evidence, complete recommendation output, or prior `INVENTORY_OK`.
2. Codex selected an unrelated historical Markdown task file even though the selector requires a structured JSON task.
3. The bridge package contained no authoritative structured selector task, which allowed manually invented qualitative risk fields to enter the recommendation input.
4. Selector state defaulted to `~/.asynchronia/model-selector-state`, which the Codex sandbox could not write.
5. `AGENTS.override.md` contradicted the executable selector by skipping `WAITING_FOR_INVENTORY_CONFIRMATION` and exact `INVENTORY_OK`.
6. Existing validation covered the selector core and read-only path but did not execute the numbered bridge mutation path end to end.

## Integrated root-cause repair

- Added a bridge authority adapter that derives the complete structured task from the current mailbox head, slot-local STATE, named inbox, named claim, selected task branch, authorized baseline, and a versioned code-owned profile.
- Registered only the known `NO_MAIN_DELTA_TRANSPORT_CANARY` profile. Unknown claim types fail closed.
- Reserved bridge task types are rejected on the generic task-file CLI so handwritten JSON cannot bypass derivation.
- Mailbox head, task branch, baseline, derived scope, profile version, source artifact hashes, task hash, matrix hash, and recommendation are bound into durable same-thread identity.
- Default durable state resolves under Git-private storage with `git rev-parse --git-path asynchronia/model-selector-state`; the legacy user-home path is not used.
- Active repository policy matches the executable state machine: `WAITING_FOR_INVENTORY_CONFIRMATION` -> exact `INVENTORY_OK` -> `WAITING_FOR_MODEL_SELECTION` -> user model selection -> exact same-thread `CONTINUE` -> `IMPLEMENTATION_ALLOWED`.
- Added bridge-specific CLI commands: `bridge-start`, `bridge-inventory-ok`, and `bridge-continue`.
- Preserved the canonical 586-line selector test byte-for-byte and added separate runtime, bridge E2E and full-regression harness coverage.
- Added CI failure-log artifacts so future validator failures retain complete diagnostics.

## Accepted validation

- 12 new runtime and bridge tests passed.
- The complete canonical 27-test selector battery passed against 1.0.14.
- `python3 tools/validate-asynchronia-auto-model-preflight.py` returned `PASS_AUTO_MODEL_PREFLIGHT`.
- GitHub automatic model preflight run 32 passed.
- GitHub orchestration-policy run 117 passed.
- GitHub ai-forensics-evidence run 136 passed.
- PR #228 was independently verified, marked ready and squash-merged into main.

## Remaining acceptance

- Install Asynchronia 1.0.14 into the local Codex plugin cache.
- Verify exact installed manifest version and SHA parity from filesystem readback.
- Run a fresh Slot 1 mutation canary from exact command `мост 1`; do not reuse 1.0.13 state or threads.
- Accept Slots 2 and 3 only sequentially after the preceding slot passes independent review.

No runtime, gameplay, economy, persistence, Stage 6, deployment mirror, numbered mailbox, or Safari surface changed.
