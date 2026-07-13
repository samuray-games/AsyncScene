TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PIPELINE_VERSION: 1.0.5
PHASE: SERIALIZED_INTEGRATION
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-13T16:57:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: d32d107a2b477f272ef34f72b221a0d775409c88

### Atomic goal

Integrate the accepted selector 1.0.9 branch into `main` by exact fast-forward only.

### Exact baseline

`origin/main` must still equal `d449d00200e8b40f6448b49892e954b9f4f00f14`.
The source branch must equal the exact head supplied in the launch prompt and must be a strict descendant of that main baseline.

### Allowed reads

Repository authority files, this task package, selector source files, validator, manifests, and git ancestry evidence.

### Allowed writes

Only the fast-forward update of `main` to the exact accepted source head.

### Forbidden changes

No source edits, merge commit, rebase, squash, history rewrite, implementation-branch write, plugin installation refresh, bridge change, AI Forensics change, hook enablement, Stage 6 work, runtime change, deployment change, or mirror change.

### Implementation requirements

1. Fetch main and the selector implementation branch.
2. Prove the exact main baseline and exact source head.
3. Prove strict fast-forward ancestry and inspect the complete changed-path set.
4. Run the selector validator, Python compile, and diff check from the exact source head.
5. Update `main` by fast-forward only to the exact source head.
6. Refetch and prove main equals the exact source head and the implementation branch did not move.
7. Return `INTEGRATED_MAIN_PLUGIN_REFRESH_PENDING`.

### Stop conditions

Stop on main drift, source drift, ancestry failure, unexpected changed paths, validation failure, or any operation other than the exact fast-forward.
