TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.3
PHASE: CODEX_TASK
STATUS: CORRECTION_REQUIRED
CREATED_AT: 2026-07-13T00:16:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/ai-forensics-autolog-20260712@18daa0ff56c129c850a63aa2e60ce5d0e91957c8
SUPERSEDES: 03-codex-task-r2.md for correction scope only
REVIEW_SOURCE: .ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/04-review-report-r2.md

### Atomic goal

Correct the independently verified privacy, multi-turn, concurrency, publication-order, idempotency, JSONL, GitHub Actions authentication, and index-evidence defects in AI_FORENSICS_V1 without changing the approved product scope.

The same Codex thread, selected model, `29/29` preflight result, and prior `CONTINUE` remain valid. Do not rerun model preflight and do not request another `CONTINUE`.

### Exact baseline

- Repository: `samuray-games/AsyncScene`.
- Branch: `origin/infra/ai-forensics-autolog-20260712`.
- Exact launch SHA is supplied by ChatGPT after this r3 task and `STATE.md` are published.
- Fetch the implementation and forensic refs and prove the implementation ref equals the supplied launch SHA.
- Read this file, `04-review-report-r2.md`, and `STATE.md` with `git show <launch-sha>:<path>` before mutation.
- Create or reuse an isolated clean worktree exactly at the supplied launch SHA.
- The existing synthetic package at `39ab7746d8dbbe7e865a09567e60ad91a61fd1e2` is immutable failed-review evidence. Do not delete or rewrite it.

### Allowed reads

- Current task package and AI Work schema.
- `.codex/hooks.json`.
- `.ai-forensics/**`.
- `.ai-memory/WORKFLOWS.md`.
- `.github/workflows/ai-forensics-evidence.yml`.
- `tools/ai_forensics/**`.
- `tools/test_ai_forensics.py`.
- AI Work validator and its tests for compatibility only.
- Git metadata and refs required by this task.
- Official current Codex hooks documentation only when required to verify payload fields.
- The existing synthetic package and Issue `#224` comments as read-only evidence.

### Allowed writes

Implementation-branch writes are limited to:

- `.codex/hooks.json`
- `.ai-forensics/README.md`
- `.ai-forensics/SCHEMA.md`
- `.ai-memory/WORKFLOWS.md`
- `.github/workflows/ai-forensics-evidence.yml`
- `tools/ai_forensics/__init__.py`
- `tools/ai_forensics/schema.py`
- `tools/ai_forensics/redact.py`
- `tools/ai_forensics/package.py`
- `tools/ai_forensics/git_evidence.py`
- `tools/ai_forensics/codex_hook.py`
- `tools/ai_forensics/publish.py`
- `tools/ai_forensics/github_event.py`
- `tools/ai_forensics/validate.py`
- `tools/test_ai_forensics.py`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/04-review-report.md`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/STATE.md`

Controlled corrected smoke may add one new immutable package path to `forensics/ai-runs` and one new approved Issue `#224` index comment after remote verification.

### Forbidden changes

- Any `.ai-bridge/**` path or bridge ref.
- Bridge reset, Stage 6, game/runtime, economy, persistence, UI, deployment mirrors, or `main`.
- Rewriting or deleting the prior synthetic package or Issue comment.
- Force push, history rewrite, destructive reset, broad stash, or dependency installation.
- Publication of raw or uncertain secrets, private paths, whole transcripts, hidden reasoning, or unbounded tool payloads.
- Enabling `/hooks` before independent acceptance of r3.

### Dependencies

- Python 3 standard library.
- Existing `git` and authenticated `gh` locally.
- `GITHUB_TOKEN` and standard GitHub Actions checkout credentials in Actions.
- No new package or service.

### Implementation requirements

#### 1. Turn-scoped immutable identity

- Keep session metadata for correlation, but allocate a unique run id and package path for every completed turn.
- Use `turn_id` when available; otherwise use a monotonic local turn sequence plus nonce.
- Two Stop events in one session must create two different immutable run directories and package paths.
- Never overwrite or restage an already completed turn package.

#### 2. Correct Stop ordering

- Append and durably close the Stop event.
- Build and atomically stage the complete sanitized turn package.
- Only after the package and metadata are durable, launch the detached publisher.
- `SessionStart` may flush older pending packages but must not be relied upon to publish the current turn.

#### 3. Concurrent spool safety

- Protect session/turn sequence allocation, event append, package staging, and metadata transitions with a standard-library locking strategy suitable for concurrent hook processes on macOS and Linux.
- Write mutable JSON metadata through a temporary file, `fsync` where practical, and `os.replace`.
- A partial or malformed event must not corrupt earlier events.

#### 4. Whole-package fail-closed sanitization

- Sanitize events, summary, git evidence, extras, final response, transcript extracts/pointers, branch/task fields derived from external input, and Issue comment values before package construction.
- Replace absolute user home prefixes with `<HOME>` in every published artifact, including `git worktree list` and repository root output.
- Add explicit standalone patterns for current common OpenAI, GitHub, cloud, bearer/basic, and generic API credential forms in arbitrary prose, not only key-associated values.
- Run a final recursive package-content secret/privacy scan after construction and before any Git operation.
- Any sanitizer uncertainty or blocked result must remain local with state `UPLOAD_BLOCKED_REDACTION_FAIL`.
- A blocked run must never create a remote package, commit, or Issue comment.
- `flush_pending` must skip all blocked states.

#### 5. Valid bounded JSONL

- Write exactly one compact, deterministic JSON object per physical line in `events.jsonl`.
- Every non-empty line must parse independently with `json.loads`.
- Preserve event order.
- Enforce per-file and total package limits for all payload types, including byte extras. Reject binary or non-UTF-8 publication in V1.

#### 6. Idempotent publication state machine

Implement durable states sufficient to distinguish at least:

- local captured/staged;
- redaction blocked;
- upload pending;
- package uploaded and remotely verified but index comment pending;
- fully uploaded and indexed;
- auth blocked;
- retryable failure.

After remote package verification, persist package commit and the uploaded/comment-pending state before calling the Issue API.

On retry after comment failure:

- verify the existing remote package and commit;
- do not recommit or repush the same package path;
- post only the missing index comment;
- persist comment id/URL;
- prevent duplicate comments through marker/run-id lookup or durable local identity.

#### 7. GitHub Actions authentication and recursion safety

- Configure the isolated publication repository to authenticate using the Actions `GITHUB_TOKEN` or a proven equivalent standard checkout credential transfer.
- Never print the token or credential-bearing URL.
- Keep least-privilege permissions and all existing recursion guards.
- Add a deterministic self-test for Actions authentication configuration without contacting a real remote.
- The corrected controlled smoke must include a `workflow_dispatch` or equivalent live Actions run after the corrected workflow is available on a runnable ref, and must verify the resulting GITHUB package and index comment. If GitHub platform rules require default-branch presence for a trigger, report that exact limitation and use the safest supported live trigger without writing to `main`.

#### 8. Accurate manifest and index evidence

- Do not present `UPLOAD_PENDING` as the final status in an uploaded Issue comment.
- The index comment must include actor, run id, task id, capture timestamps, source branch, observed before/after or source/result SHAs, package path, package commit, redaction status, final upload/index state, and concise observed result.
- Keep immutable capture state distinct from mutable publication state if necessary.

#### 9. Regression tests

Add tests that fail against the reviewed implementation and pass after correction for:

- two Stop events in one session produce distinct turn packages;
- stage completes before publisher launch;
- concurrent hook events preserve valid ordered records;
- blocked redaction causes zero publication attempts and zero comments;
- free-text OpenAI/GitHub/cloud token fixtures are removed;
- home paths are removed from summary, git evidence, extras, and final package scan;
- each `events.jsonl` line parses independently;
- byte extras cannot bypass V1 text/per-file limits;
- package-push success plus comment failure retries without a second commit or duplicate comment;
- GitHub Actions auth setup is present and secret-safe;
- final index comment has required SHA and observed-result fields;
- package validator rejects the already published malformed JSONL/privacy-leaking smoke fixture shape.

#### 10. Corrected smoke

- Use synthetic content containing representative fake standalone tokens and fake home paths.
- Prove they do not appear in the new remote package.
- Produce two synthetic turns in one session and prove two unique immutable packages or one specifically documented multi-turn smoke set that verifies turn uniqueness.
- Verify checksums, remote commits, package files, and Issue comments.
- Do not use real credentials or a real full transcript.

### Validation commands

Run and report exit codes for:

```bash
python3 -m py_compile tools/ai_forensics/*.py tools/test_ai_forensics.py
python3 -m unittest tools.test_ai_forensics -v
python3 tools/ai_forensics/validate.py --repo .
python3 tools/ai_forensics/codex_hook.py --self-test
python3 tools/ai_forensics/github_event.py --self-test
python3 tools/ai_forensics/publish.py --self-test --dry-run
python3 -m json.tool .codex/hooks.json >/dev/null
python3 -m py_compile tools/validate_ai_work_pipeline.py tools/test_validate_ai_work_pipeline.py
python3 -m unittest tools.test_validate_ai_work_pipeline -v
python3 tools/validate_ai_work_pipeline.py
git diff --check
```

Also parse the workflow with the existing repository method and run the new focused tests for every r3 finding.

### Required final report

Report:

- exact baseline and final remote head;
- changed files;
- every test and exit code;
- proof of two-turn uniqueness;
- proof that Stop stages before publisher launch;
- concurrency test result;
- blocked-redaction zero-publication proof;
- whole-package scan result;
- standalone-token and home-path fixture results;
- comment-failure retry/idempotency result;
- GitHub Actions auth configuration result and live Actions evidence if safely available;
- new forensic package paths, commits, checksums, and Issue comment ids;
- old failed-review package preserved unchanged;
- remaining limitations;
- task status `READY_FOR_REVIEW` only.

### Stop conditions

Stop and report the exact blocker without publishing if:

- the launch ref differs from the ChatGPT-supplied SHA;
- any forbidden path or ref would change;
- blocked or uncertain content could leave the local spool;
- package content still contains fake secret fixtures or private paths;
- JSONL validation, concurrency, idempotency, auth, or any required test fails;
- publication requires force push or rewriting an existing package;
- a live Actions test would require writing to `main` or weakening repository security.
