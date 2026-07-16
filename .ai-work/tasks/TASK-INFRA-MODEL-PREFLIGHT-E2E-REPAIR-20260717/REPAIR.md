# Asynchronia model-preflight E2E repair

TASK_ID: TASK-INFRA-MODEL-PREFLIGHT-E2E-REPAIR-20260717
STATUS: READY_FOR_REVIEW
BASELINE: 72081f921906dbf7bb5a3a8f0ab227254be8cc20
PLUGIN_VERSION: 1.0.14
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

## Root-cause repair

- Add a bridge authority adapter that derives the complete structured task from the current mailbox head, slot-local STATE, named inbox, named claim, selected task branch, authorized baseline, and a versioned code-owned profile.
- Register only the known `NO_MAIN_DELTA_TRANSPORT_CANARY` profile. Unknown claim types fail closed.
- Reject reserved bridge task types on the generic task-file CLI so handwritten JSON cannot bypass derivation.
- Bind mailbox head, task branch, baseline, derived scope, profile version, source artifact hashes, task hash, matrix hash, and recommendation into durable same-thread identity.
- Resolve default durable state under Git-private storage using `git rev-parse --git-path asynchronia/model-selector-state`. Do not use the legacy user-home path.
- Make active repository policy match the executable state machine: `WAITING_FOR_INVENTORY_CONFIRMATION` -> exact `INVENTORY_OK` -> `WAITING_FOR_MODEL_SELECTION` -> exact same-thread `CONTINUE` -> `IMPLEMENTATION_ALLOWED`.
- Add bridge-specific CLI commands: `bridge-start`, `bridge-inventory-ok`, and `bridge-continue`.

## Validation

- Python syntax compilation for selector, adapter, CLI, tests, and validator.
- `python3 -m unittest tools.test_model_selector_snapshot tools.test_bridge_model_preflight`
- `python3 tools/validate-asynchronia-auto-model-preflight.py`
- Synthetic Git repository bridge E2E covers start, inventory confirmation, continuation, Git-private state, mailbox movement invalidation, unknown profile rejection, branch/baseline identity, and rejection of fabricated generic bridge tasks.

No runtime, gameplay, economy, persistence, Stage 6, deployment mirror, or Safari surface is changed.
