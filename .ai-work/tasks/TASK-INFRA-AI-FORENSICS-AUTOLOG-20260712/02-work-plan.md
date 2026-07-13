TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.0
PHASE: WORK_PLAN
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T21:16:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: work/ai-forensics-autolog-20260712@11282d1625ece98530fca55c4c8273c262bb67fe

### Repository evidence inspected

- Live Google Drive project memory `MEMORY_REV: 2026-07-12-0029-JST`.
- `AGENTS.md` from current `main`.
- `TASKS.md` from current `main`.
- `PROJECT_MEMORY.md` from current `main`.
- `.ai-memory/CURRENT.md` and `.ai-memory/WORKFLOWS.md` from current `main`.
- `.ai-work/README.md` and `.ai-work/templates/TASK_PACKAGE.md`.
- Existing `.github/workflows/orchestration-policy.yml` conventions.
- Existing repository policy that direct task writes to `main` are forbidden.
- Official OpenAI Codex Hooks documentation for project-local hooks, hook trust review, event payloads, `transcript_path`, `session_id`, `turn_id`, tool payloads, and `Stop.last_assistant_message`.
- Official OpenAI Codex `notify`, local session storage, app logs, and OpenTelemetry documentation as supporting evidence only.
- GitHub Issue `#224`, the append-only run index.
- Existing remote branches `work/ai-forensics-autolog-20260712` and `forensics/ai-runs`.

### Current implementation state

- No project-local `.codex/hooks.json` exists for automatic Asynchronia forensic capture.
- No repository-owned sanitizer, schema, package builder, publisher, retry spool handler, or forensic validator exists.
- No independent GitHub Actions evidence workflow exists.
- No durable Work self-journal contract exists in `.ai-memory/WORKFLOWS.md`.
- The exact `лог` ChatGPT review command is not yet documented in repository workflow authority.
- Issue `#224` and branch `forensics/ai-runs` exist, but no accepted schema or automated writer exists.

### Conflict check

- The implementation is infrastructure-only and has no runtime, gameplay, economy, persistence, UI, deployment-mirror, or bridge ownership.
- `.ai-bridge/**`, numbered mailbox refs, bridge routing, Stage 6, source runtime, deployed runtime, and shared smoke registries are excluded.
- `.github/workflows/**` is a shared infrastructure surface and must be owned only by this serialized task while implementation is active.
- `.ai-memory/WORKFLOWS.md` is a shared workflow-authority surface and must be updated only by this task until review completes.
- No parallel implementation lane is permitted because schema, redaction, hook capture, publisher, workflow event writer, and tests share one contract and one publication branch.
- Result: `SAFE_TO_PROCEED` for one serialized infrastructure lane with the exact write scope below.

### Dependency map

1. `schema.py` defines actor names, run ids, manifest fields, markers, size limits, package paths, and validation rules.
2. `redact.py` provides fail-closed secret and privacy redaction used by every producer.
3. `package.py` builds deterministic immutable packages and truncation metadata.
4. `git_evidence.py` gathers read-only repository evidence with credential stripping.
5. `codex_hook.py` receives official Codex hook JSON and writes the local spool.
6. `publish.py` publishes sanitized packages to `forensics/ai-runs`, verifies remote readback, and posts Issue `#224` only after verification.
7. `github_event.py` converts supported GitHub event payloads into independent evidence packages.
8. `.github/workflows/ai-forensics-evidence.yml` executes the independent GitHub producer with recursion guards and serialized publication.
9. `.ai-memory/WORKFLOWS.md` defines mandatory Work journaling and exact `лог` review behavior.
10. Unit tests and the standalone validator prove the shared contract before any live smoke.

### Atomic task decomposition

One serialized Codex implementation lane:

- Add schema, redaction, package, git-evidence, hook-capture, publication, and GitHub-event modules.
- Add project-local Codex hook configuration.
- Add independent GitHub Actions evidence workflow.
- Add documentation and workflow authority for Codex, Work, GitHub, and exact `лог` behavior.
- Add deterministic tests and validator.
- Run local dry-run and controlled publication smoke without touching bridge or game surfaces.

Do not split this into parallel writers because all components depend on the same versioned schema and immutable publication protocol.

### Read scope

Codex may read only what is necessary from:

- `AGENTS.md`
- `TASKS.md`
- `PROJECT_MEMORY.md`
- `.ai-memory/CURRENT.md`
- `.ai-memory/WORKFLOWS.md`
- `.ai-work/README.md`
- `.ai-work/templates/TASK_PACKAGE.md`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/**`
- `.github/workflows/**`
- `.gitignore`
- `plugins/asynchronia/.codex-plugin/plugin.json`
- existing `.codex/**` if present
- existing repository validators and tests only as style references
- Git metadata and remote refs required to prove baseline, branch, and publication behavior
- local Codex hook/session/app-log locations only for controlled smoke and only after redaction boundaries are active

### Write scope

Implementation writes are limited to:

- `.codex/hooks.json`
- `.ai-forensics/README.md`
- `.ai-forensics/SCHEMA.md`
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
- `.github/workflows/ai-forensics-evidence.yml`
- `.ai-memory/WORKFLOWS.md`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/04-review-report.md`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/STATE.md`

Controlled smoke may create new immutable package paths only on `forensics/ai-runs` and new comments only on Issue `#224`.

### Risk controls

- Python standard library only. No dependency installation.
- Sanitize before publication and fail closed on uncertain secrets.
- Never copy complete raw session directories or app-log directories into the repository.
- Raw hook payloads and transcripts remain in a local private spool outside the repository worktree.
- Never log environment-variable values, process environments, credential helpers, keychains, cookies, authorization headers, `.env` files, private keys, or Git remote credentials.
- Hook handlers must return quickly after durable local capture. Network publication runs detached from the hook process.
- Use an isolated temporary clone or worktree for publication. Do not modify the active implementation worktree.
- Publication uses fetch, unique immutable paths, fast-forward push, bounded retry, remote readback, then Issue comment. No force push.
- A failed or blocked upload remains local and is reported truthfully. Never post a success index comment before remote verification.
- Workflow ignores `forensics/**` branch pushes and its own Issue `#224` comments to prevent recursion.
- GitHub Actions uses least-privilege permissions and rejects untrusted fork write contexts.
- Work self-journal records observations and actions, not hidden reasoning or invented causes.
- Exact `лог` analysis distinguishes declared evidence from independent GitHub evidence and identifies the earliest supported divergence, not merely the final error.

### Validation plan

Run at minimum:

- `python3 -m py_compile tools/ai_forensics/*.py tools/test_ai_forensics.py`
- `python3 -m unittest tools.test_ai_forensics`
- `python3 tools/ai_forensics/validate.py --repo .`
- `python3 tools/ai_forensics/codex_hook.py --self-test`
- `python3 tools/ai_forensics/github_event.py --self-test`
- `python3 tools/ai_forensics/publish.py --self-test --dry-run`
- parse `.codex/hooks.json` as JSON and verify every required event command
- parse `.github/workflows/ai-forensics-evidence.yml` with the repository's available YAML validation method without adding dependencies
- `git diff --check`

Controlled live smoke after static PASS:

- one synthetic Codex hook sequence through the real local spool and publisher;
- one Work-format package written through the documented publication sequence;
- one `workflow_dispatch` GitHub evidence run;
- remote readback of all three immutable packages from `forensics/ai-runs`;
- three valid Issue `#224` index comments;
- one exact `лог` analysis and valid analysis-cursor comment by ChatGPT.

Safari smoke: `N/A_INFRASTRUCTURE_NO_RUNTIME_SURFACE`.

### Codex prompt strategy

- Launch a fresh Codex thread on `infra/ai-forensics-autolog-20260712`.
- The launch prompt must begin with the current supported Asynchronia safety directive.
- Codex must perform mandatory live model inventory preflight and pause for same-thread `CONTINUE` before mutation.
- After `CONTINUE`, Codex performs one serialized implementation lane only.
- Codex must stop if any required write falls outside the exact scope, if redaction cannot be proven fail-closed, if GitHub publication would require force push, or if bridge/runtime files appear in the diff.
- Codex may report `READY_FOR_REVIEW`, never user acceptance.

### Blockers

- Project-local hooks require one user trust review in Codex via `/hooks` before live automatic execution. This is an explicit acceptance action, not an implementation blocker.
- Automatic Work capture cannot rely on a machine-local lifecycle hook because ChatGPT Work does not expose one. Version 1 therefore enforces Work publication through repository workflow authority and completion protocol, backed by independent GitHub evidence.
- Controlled GitHub publication smoke requires the current authenticated GitHub permissions for branch push and Issue `#224` comments.
