TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260722
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-22T15:29:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260722@fb93ef9c5f8eda44fea87ae7cb8eb4ab5b490348

### Goal

Repair the stale Asynchronia selector inventory from the user-confirmed Codex Desktop picker, generate snapshot revision `20260722.1`, restore `5.4 Mini` and `5.4`, preserve `5.5`, preserve `5.6 Luna`, preserve combined `5.6 Terra/Sol`, and align the authoritative selector snapshot artifacts with the user-confirmed 23-pair inventory.

### Non-goals

- Do not resume the blocked Stage 6 legacy smoke realignment.
- Do not run the ordinary executable selector authorization sequence as part of this bootstrap maintenance.
- Do not modify bridge refs, mailbox files, runtime/gameplay, economy, persistence, deployment mirrors, or Stage 6 product files.
- Do not split `5.6 Terra/Sol` into separate models.
- Do not add models or efforts from APIs, documentation, caches, assumptions, or historical inventories.

### Accepted decisions

- The exact baseline is `fb93ef9c5f8eda44fea87ae7cb8eb4ab5b490348`.
- The current picker contains exactly 5 models and 23 model-effort pairs.
- The active inventory source is the new task-local `UI-VISIBLE-MODEL-INVENTORY.md`.
- The selected Codex UI model is reported only as `USER_SELECTED_UNVERIFIED`.
- Snapshot generation and canonical hashing must use repository code.

### Constraints

- Target branch: `infra/model-snapshot-maintenance-20260722`.
- The old historical inventory artifact remains immutable.
- Exact repository writes are limited to the user-authorized paths in `03-codex-task.md`.

### Acceptance criteria

- The new inventory has the required header, exact five model lines, exact 23 pairs, the return of `5.4 Mini` and `5.4`, the combined `5.6 Terra/Sol` label, and no unobserved additions.
- The authority manifest binds the new inventory path and actual Git blob SHA at revision `20260722.1`.
- The generated snapshot validates schema, order, counts, identifiers, canonical hash, timestamp, source, and supersedes value.
- `5.6 Terra/Sol` normalizes to `gpt-5.6-terra-sol` while existing identifiers remain stable.
- Required tests, validators, exact-scope checks, and the temporary generic CLI proof pass.

### Output required from Work

Review this package and the exact branch diff, then independently verify the Codex implementation, commit, remote branch, and draft PR before integration planning. Do not merge the PR.
