TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.1.0
PHASE: CODEX_TASK
STATUS: CORRECTION_REQUIRED
CREATED_AT: 2026-07-13T16:05:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/ai-forensics-autolog-20260712@b102f3862678cb874b55bfa612c31025a678ecf2
SUPERSEDES: 03-codex-task-r3.md for correction scope only
REVIEWED_IMPLEMENTATION: b102f3862678cb874b55bfa612c31025a678ecf2
REVIEWED_FORENSICS_HEAD: 17e12cbd87fb149c34b16a99ce62de974b9ad4dd
REVIEW_VERDICT: REJECTED_CORRECTION_REQUIRED

### Independent review findings

#### F1 - HIGH - turn packages are not turn-isolated

`tools/ai_forensics/codex_hook.py` appends every event for a session to one persistent `events.raw.jsonl`. On each Stop, `_stage_completed_turn` reloads the complete file from the beginning and stages all historical session events. It also selects the first Stop with `next(...)`, so later turn packages can reuse the first turn final response and transcript pointer.

The r3 test only proves distinct run directories and manifest paths. It does not prove content isolation.

The corrected smoke evidence corroborates the defect:

- first local turn `events.jsonl`: 816 bytes;
- second local turn `events.jsonl`: 1371 bytes;
- both local turn `final-response.txt` files have the same SHA-256 `770b267ecccc0a5c41d6f1e5e0919d1b41c5ee5708b60aa12a48da40a37ca9f3`.

Consequences:

- turn 2 republishes turn 1 content;
- the second final response may be wrong;
- package size grows with the whole session;
- previous prompts/tool payloads are unnecessarily republished;
- this violates turn-scoped evidence and the prohibition on unbounded transcript publication.

#### F2 - HIGH - detached publishers race on mutable run metadata

`SessionStart` and every Stop may launch detached `publish.py --flush-pending` processes. Capture and staging use `SessionLock`, but `flush_pending` and `publish_staged_run` read and mutate the same run `metadata.json` without a run-scoped or spool-scoped publication lock.

Two publishers can read `UPLOAD_PENDING`, race to commit/push/comment, and overwrite newer metadata with stale retry state. A non-fast-forward retry can also encounter an already-present identical package and fail at `git commit` with nothing to commit. The existing test covers sequential retry after comment failure, not concurrent publishers.

This fails the r3 requirement that package staging and metadata transitions use a locking strategy suitable for concurrent hook processes.

#### F3 - MEDIUM - GITHUB index evidence still reports unknown source SHA

`github_event.py` does not populate durable publication metadata with event source/result SHAs. `build_issue_comment` therefore falls back to `sourceSha: UNKNOWN` for live GITHUB packages, even though `git-evidence.json` contains the checked-out HEAD.

Observed live comments for the successful workflow runs contain `sourceSha: UNKNOWN`. The final push package contains HEAD `b102f3862678cb874b55bfa612c31025a678ecf2`, proving the value was available but not indexed.

This fails the r3 accurate-index requirement for observed before/after or source/result SHAs.

#### F4 - MEDIUM - bounded JSON handling can create invalid artifacts or lose blocked state

`truncate_text` slices encoded JSON at an arbitrary byte boundary.

- `events.jsonl` can be cut in the middle of an object and then fail package construction instead of producing bounded valid JSONL.
- `summary.json`, `git-evidence.json`, `redaction-report.json`, and JSON extras can be truncated into invalid JSON because only `events.jsonl` receives a parse check.
- A finding discovered only by the final recursive package scan raises `ValueError` before `metadata.json` is created, instead of preserving a local `UPLOAD_BLOCKED_REDACTION_FAIL` record.

The existing tests do not cover over-limit JSONL, over-limit JSON documents, or conversion of final-scan findings into a durable blocked state.

### Atomic goal

Correct turn isolation, concurrent publication locking, GITHUB SHA evidence, and structure-safe bounded serialization without expanding AI_FORENSICS_V1 product scope.

### Exact baseline

- Repository: `samuray-games/AsyncScene`.
- Implementation branch: `origin/infra/ai-forensics-autolog-20260712`.
- Exact launch SHA is supplied by ChatGPT after this r4 task and STATE are published.
- Fetch implementation and forensic refs and prove the implementation ref equals the supplied launch SHA.
- Read this file, `04-review-report.md`, `04-review-report-r2.md`, `STATE.md`, `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md` through `git show` from the exact launch SHA before mutation.
- Preserve all previous forensic packages and Issue #224 comments as immutable evidence.

### Model gate

This is a new corrected Codex task scope. Follow the current root `AGENTS.md` model-selector gate before mutation.

- Do not use temporary replacement `HOME` or `CODEX_HOME` values for inventory discovery.
- If live `model/list` conflicts with the models actually selectable in the active UI, stop with `BLOCKED_MODEL_INVENTORY_MISMATCH`; do not recommend a model absent from the active UI.
- Stop at `WAITING_FOR_MODEL_SELECTION` and require exact same-thread `CONTINUE` after the user selects the recommendation.
- The historical `5.5 High` selection and prior CONTINUE do not authorize r4 mutation before this fresh gate.

### Allowed writes

- `.ai-forensics/README.md`
- `.ai-forensics/SCHEMA.md`
- `.github/workflows/ai-forensics-evidence.yml`
- `tools/ai_forensics/codex_hook.py`
- `tools/ai_forensics/package.py`
- `tools/ai_forensics/publish.py`
- `tools/ai_forensics/redact.py`
- `tools/ai_forensics/schema.py`
- `tools/ai_forensics/github_event.py`
- `tools/ai_forensics/validate.py`
- `tools/test_ai_forensics.py`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/04-review-report.md`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/STATE.md`

A controlled r4 smoke may append new immutable packages and index comments only after all local regression tests pass.

### Forbidden changes

- Enabling `/hooks`.
- Any `.ai-bridge/**` path or bridge ref.
- Bridge reset, Stage 6, runtime, UI, economy, persistence, deployment mirrors, or `main`.
- Rewriting or deleting any existing forensic package or Issue #224 comment.
- Force push, history rewrite, destructive reset, broad stash, or new dependency.

### Required corrections

#### 1. Durable turn event windows

- Track a durable per-session event boundary, turn-start offset, sequence range, or equivalent checkpoint.
- A completed turn package must contain only events assigned to that turn plus explicitly documented session correlation metadata.
- After a successful stage, advance the durable boundary atomically.
- On failure, do not advance the boundary and do not lose the current turn events.
- Select the current Stop event explicitly, never the first historical Stop.
- Two turns with final messages `one` and `two` must publish corresponding distinct final responses and non-overlapping turn event windows.
- Session history may remain local for recovery, but must not be republished in every later turn.

#### 2. Run-scoped publication lock

- Add a standard-library file lock around every mutable publication transition for one run.
- The lock must cover metadata read, remote-package decision, push/verification result persistence, existing-comment lookup, comment creation, and final state persistence.
- Multiple detached flushers operating simultaneously must converge on exactly one immutable package commit and at most one Issue comment.
- A stale process must not overwrite a newer `packageCommit`, `commentId`, `commentUrl`, or final state.
- If the remote package already exists with identical content, treat it as verified idempotent recovery rather than attempting an empty commit.

#### 3. Accurate GITHUB source/result evidence

- Populate source and result SHA metadata from the GitHub event and checked-out repository.
- For push events, use event `before` and `after` when valid.
- For events without before/after, use an explicit checked-out/event SHA with documented semantics.
- Keep `packageCommit` separate from the observed repository result SHA.
- A successful live GITHUB index comment must not contain `sourceSha: UNKNOWN` or `resultSha: UNKNOWN` when the checkout has a valid HEAD.
- Add task id from approved workflow input/context when available; otherwise retain explicit `N/A` without inventing one.

#### 4. Structure-safe bounded package serialization

- Never truncate JSON or JSONL at an arbitrary byte position.
- Bound `events.jsonl` by complete physical lines only. Every retained line must parse independently.
- If one event exceeds the per-file limit, replace it with a deterministic bounded truncation record rather than emitting partial JSON.
- Keep every `.json` package file valid JSON after bounding. Use field-level bounding or a valid truncation envelope with original size and SHA-256.
- Validate every JSON package file before staging.
- When the final recursive privacy scan detects content missed by earlier sanitization, create durable local metadata with `UPLOAD_BLOCKED_REDACTION_FAIL`; do not throw away the run identity or blocked evidence.

### Required regression tests

Add tests that fail on r3 and pass on r4 for:

1. Two Stop events produce distinct paths and isolated content windows.
2. Turn 1 final response is `one`; turn 2 final response is `two`.
3. Turn 2 events do not contain turn 1 prompt/tool/final-response content.
4. Event boundaries survive restart between turns.
5. Two simultaneous publishers for the same run produce one package commit, at most one comment, and one correct final metadata state.
6. A remote identical package is recovered without an empty commit.
7. A live-style push record produces non-UNKNOWN source/result SHAs and keeps package commit separate.
8. Over-limit JSONL remains line-valid and bounded.
9. Over-limit summary/git-evidence/extras remain valid JSON and bounded.
10. A final-scan-only secret fixture produces durable `UPLOAD_BLOCKED_REDACTION_FAIL` metadata and zero Git/comment operations.
11. Existing r3 privacy, auth, idempotency, JSONL, and failed-smoke regression tests remain passing.

### Corrected smoke

- Produce two synthetic turns with different unique marker strings and different final responses.
- Prove remotely or in an immutable smoke-set package that each turn contains only its own marker and response.
- Prove no historical turn content is duplicated into the later turn package.
- Run a concurrent-publisher smoke or deterministic process-level regression proving one commit/comment outcome.
- Run a live Actions trigger and verify source/result SHA fields in both package evidence and Issue #224 comment.
- Preserve old failed and r3 smoke evidence unchanged.

### Validation

Run the existing r3 validation commands plus every new focused r4 regression. Report exact exit codes and remote readback.

### Stop conditions

Stop without publication if:

- launch ref differs;
- model inventory conflicts with active UI;
- any forbidden path/ref would move;
- turn isolation is not proven;
- concurrent publication can duplicate or clobber state;
- any final index SHA remains unknown despite available HEAD/event evidence;
- any bounded JSON artifact is invalid;
- any final-scan finding lacks durable blocked metadata;
- any required test fails.

### Required final status

Return `READY_FOR_REVIEW` only. ChatGPT independent review is required before `ACCEPTED` or hook enablement.
