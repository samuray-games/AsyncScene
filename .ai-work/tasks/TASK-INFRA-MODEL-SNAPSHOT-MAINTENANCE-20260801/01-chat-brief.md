TASK_ID: TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801
PIPELINE_VERSION: 1.0.16
PHASE: CHAT_BRIEF
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-08-01T14:31:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/model-snapshot-maintenance-20260801@3e9602903ab124658319abd584c480682002feb4

### Goal

Replace stale selector snapshot revision `20260722.1` with the user-confirmed Codex Desktop picker inventory at `2026-08-01T05:31:00Z`, producing six unique models and 29 unique model-effort pairs.

### Non-goals

- Do not continue the blocked security branch.
- Do not use normal executable selector preflight as mutation authorization.
- Do not modify runtime, security, bridge, mailbox, memory, deployment, or plugin-version surfaces.

### Accepted decisions

- The exact baseline is `3e9602903ab124658319abd584c480682002feb4`.
- Seven visible rows and 34 raw row-effort entries are preserved as evidence.
- The duplicate Luna row is deduplicated only in the canonical selector inventory because its visible label and effort set are identical.
- Snapshot generation and canonical hashing use repository code.

### Constraints

- Target branch: `infra/model-snapshot-maintenance-20260801`.
- Exact writes are limited to the paths listed in `03-codex-task.md`.
- Plugin version `1.0.16` remains unchanged.

### Acceptance criteria

- The inventory records all seven raw rows, including both Luna observations, and exactly six canonical lines with 29 pairs.
- The manifest binds the actual Git blob SHA and revision `20260801.1`.
- The generated snapshot validates its canonical hash, counts, identifiers, order, timestamp, source, and supersedes value.
- Required tests and validators pass, and a fresh generic selector start stops at `WAITING_FOR_INVENTORY_CONFIRMATION` without authorization.

### Open questions

- None; the user-confirmed picker evidence is complete for this maintenance task.

### Output required from Work

Review the exact branch diff, commit, remote branch, and draft PR independently before integration planning. Do not merge.
