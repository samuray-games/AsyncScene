TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-18T15:29:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260718@2f418a95e771a8d2a2f7231f27df3940b412b94e

### Goal

Repair the stale Asynchronia selector inventory from the user-confirmed Codex Desktop picker, generate snapshot revision `20260718.1`, correct slash-containing model identifier normalization, route `INVENTORY_CHANGED` to this exact maintenance task, and align active Asynchronia package surfaces at version `1.0.16`.

### Non-goals

- Do not resume the blocked G3 authority reissue.
- Do not run or modify the executable selector state machine for authorization.
- Do not modify bridge refs, mailbox files, runtime, gameplay, economy, persistence, deployment mirrors, Stage 6, installed plugin caches, or historical evidence.
- Do not split `5.6 Terra/Sol` into separate models.
- Do not add models or efforts from any source other than the user-confirmed picker inventory.

### Accepted decisions

- The exact baseline is `2f418a95e771a8d2a2f7231f27df3940b412b94e` with clean tree `e367cab5647c2411f2282a152110f1d6012b92d3`.
- The current picker contains exactly 3 models and 15 model-effort pairs.
- The active inventory source is the new task-local `UI-VISIBLE-MODEL-INVENTORY.md`.
- The selected Codex UI model is reported only as `USER_SELECTED_UNVERIFIED`.
- Snapshot generation and canonical hashing must use repository code.

### Constraints

- Target branch: `infra/model-snapshot-maintenance-20260718`.
- Recovery authorization was triggered by exact same-thread `INVENTORY_CHANGED` from `TASK-INFRA-BRIDGE-SLOT3-G3-REISSUE-20260718`.
- The old historical inventory artifact remains immutable.
- Exact repository writes are limited to the user-authorized paths in `03-codex-task.md`.

### Acceptance criteria

- The new inventory has the required header, exact three model lines, exact 15 pairs, disappearance record, supersedes record, and no unobserved inventory.
- The authority manifest binds the new inventory path and actual Git blob SHA at revision `20260718.1`.
- The generated snapshot validates schema, order, counts, identifiers, canonical hash, timestamp, source, and supersedes value.
- `5.6 Terra/Sol` normalizes to `gpt-5.6-terra-sol` while existing identifiers remain stable.
- `INVENTORY_CHANGED` reports `TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260718`.
- Active package surfaces and direct selector tests agree on version `1.0.16`.
- Required tests, validators, exact-scope checks, and fresh generic CLI proof pass.

### Open questions

None.

### Output required from Work

Review this package and the exact branch diff, then independently verify the Codex implementation, commit, remote branch, and draft PR before integration planning. Do not merge the PR.
