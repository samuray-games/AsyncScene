TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.1
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T21:58:00+09:00
AUTHOR_ROLE: CHATGPT_ONLY_CONTENT_AUTHORSHIP_WITH_WORK_EVIDENCE
SOURCE_REVISION: work/ai-forensics-autolog-20260712@174e3a6bf64622994e3c1cd626c3c329409b4115
SUPERSEDES: 03-codex-task.md
CORRECTION_REASON: Removed obsolete safety directive wording and corrected bootstrap from an arbitrary starting checkout.

### Atomic goal

Implement version 1 of the automatic Asynchronia AI forensic logging system for Codex Desktop, ChatGPT Work, independent GitHub evidence, and the exact ChatGPT command `лог`.

The result must automatically produce sanitized, immutable, remotely indexed run evidence without touching bridge, Stage 6, game, runtime, economy, persistence, UI, or deployment-mirror surfaces.

This r2 task is authoritative. `03-codex-task.md` is historical specification evidence only. Its obsolete safety directive wording and its requirement that the starting checkout already equal the implementation branch are void.

### Exact baseline

- Repository: `samuray-games/AsyncScene`.
- Remote implementation branch: `origin/infra/ai-forensics-autolog-20260712`.
- Exact expected remote implementation head is supplied in the launch prompt.
- The Codex thread may start from any local checkout and any local `HEAD`.
- A mismatch between the starting local `HEAD` and the implementation branch is expected and is not a blocker.

Before model preflight, perform read-only bootstrap only:

1. Fetch exactly:
   - `origin/main`
   - `origin/work/ai-forensics-autolog-20260712`
   - `origin/infra/ai-forensics-autolog-20260712`
   - `origin/forensics/ai-runs`
2. Resolve fetched `origin/infra/ai-forensics-autolog-20260712` and prove that it equals the exact launch SHA.
3. Read this r2 task and the task package directly from that fetched commit using `git show <launch-sha>:<path>` or an equivalent read-only Git operation.
4. Prove that the launch SHA contains:
   - `01-chat-brief.md`
   - `02-work-plan.md`
   - `03-codex-task.md`
   - `03-codex-task-r2.md`
   - `STATE.md`
5. Read current root authority from the same fetched commit where available and compare it with current `origin/main` authority. Stop on an unresolved authority conflict.
6. Run the mandatory current model inventory and model-selector preflight.
7. Make no implementation edit, commit, worktree creation, package publication, or Issue comment before exact same-thread `CONTINUE`.

After exact same-thread `CONTINUE`:

1. Create a new isolated clean worktree at the exact launch SHA. A detached worktree is allowed.
2. Verify the worktree `HEAD` equals the exact launch SHA and has no dirty files.
3. Perform all implementation only inside that worktree.
4. Commit implementation there and push with an explicit refspec to `infra/ai-forensics-autolog-20260712` using fast-forward only.
5. Refetch and prove the remote implementation branch equals the reported implementation commit.

Stop with `BLOCKED_REMOTE_BASELINE_MISMATCH` only if the fetched remote implementation branch does not equal the launch SHA, required package files are absent from that remote commit, or current authority conflicts cannot be resolved. Do not block merely because the original checkout is on `main` or another branch.

### Allowed reads

Read only what is necessary from:

- current `AGENTS.md` and `AGENTS.override.md`;
- `TASKS.md`;
- `PROJECT_MEMORY.md`;
- `.ai-memory/CURRENT.md`;
- `.ai-memory/WORKFLOWS.md`;
- `.ai-work/README.md`;
- `.ai-work/SCHEMA.md`;
- `.ai-work/templates/TASK_PACKAGE.md`;
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/**`;
- `.github/workflows/**`;
- `.gitignore`;
- `plugins/asynchronia/.codex-plugin/plugin.json`;
- current model-selector source required by current authority;
- existing `.codex/**` if present;
- existing validators and tests as style references;
- Git metadata and the exact four remote refs named above;
- official OpenAI Codex Hooks documentation when needed to verify current hook payload and trust behavior;
- local Codex session or app-log locations only during controlled smoke and only after redaction boundaries are implemented.

### Allowed writes

Implementation writes are limited exactly to the paths listed in the `### Allowed writes` section of historical specification `03-codex-task.md`, plus task-local update of:

- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/04-review-report.md`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/STATE.md`

The already-present task-package correction and AI Work pipeline correction at the launch SHA are baseline evidence. Codex must not rewrite them unless this r2 task explicitly lists them above.

Controlled smoke publication remains limited to new immutable package paths under `runs/YYYY/MM/DD/<ACTOR>/<run-id>/...` on `forensics/ai-runs` and new approved-marker comments on Issue `#224`.

### Forbidden changes

- Do not invoke or reference the removed safety directive; it has been removed.
- Do not modify any `.ai-bridge/**` path, numbered mailbox ref, legacy bridge ref, bridge routing, claim, inbox, outbox, receipt, state, canary, or reset artifact.
- Do not continue or modify Stage 6.
- Do not modify game/runtime JavaScript, HTML, CSS, data, economy, persistence, battle, NPC, UI, smoke registry, deployment mirror, or cache-bust files.
- Do not modify `PROJECT_MEMORY.md`, `.ai-memory/CURRENT.md`, `.ai-memory/DECISIONS.md`, `.ai-memory/CANON.md`, or archive files during implementation.
- Do not write directly to `main`.
- Do not force push, rewrite history, destructively reset, clean the repository, broadly stash, or delete historical forensic packages.
- Do not add dependencies or modify lockfiles.
- Do not publish raw transcripts, logs, prompts, environment values, credentials, cookies, private keys, `.env` values, authorization headers, or private user paths.
- Do not capture hidden chain-of-thought or claim unavailable reasoning was logged.
- Do not let a producer attribute causes. Producers record observed facts only.

### Dependencies

Use only dependencies and infrastructure already authorized in historical specification `03-codex-task.md`:

- Python 3 standard library;
- existing `git`;
- existing authenticated `gh` CLI for controlled publication;
- existing GitHub Actions token;
- official Codex project-local hook support;
- no new package, service, database, token, webhook server, or external dependency.

### Implementation requirements

Implement every requirement numbered 1 through 11 in the `### Implementation requirements` section of historical specification `03-codex-task.md`, including:

- versioned `AI_FORENSICS_V1` schema;
- fail-closed redaction;
- Codex hook capture;
- independent Git evidence;
- immutable package construction and publication;
- GitHub event evidence workflow;
- protocol-enforced Work journal;
- exact trimmed ChatGPT command `лог`;
- documentation, privacy boundary, setup, disable, retry, and limitations;
- positive and negative tests.

Precedence rule:

- this r2 file controls bootstrap, baseline, removed-skill handling, worktree creation, and stop conditions;
- historical `03-codex-task.md` controls detailed logging functionality where it does not conflict with r2;
- current repository authority controls model preflight, routing, scope isolation, publication safety, and acceptance.

### Validation commands

Run exactly and report exit codes:

```bash
python3 -m py_compile tools/ai_forensics/*.py tools/test_ai_forensics.py
python3 -m unittest tools.test_ai_forensics
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

Also validate GitHub Actions workflow syntax using an already available repository method. Do not install a parser.

Controlled publication smoke must use synthetic secrets and synthetic session content only. Never dump a real complete transcript.

### Required final report

Report:

- status;
- active model and effort as `USER_SELECTED_UNVERIFIED` unless externally proven;
- model-selector recommendation and evaluated pair count;
- exact remote bootstrap proof;
- original starting checkout and isolated implementation worktree identity;
- inspected files;
- changed files;
- tests and exit codes;
- controlled smoke results;
- local spool path;
- package paths and commits on `forensics/ai-runs`;
- Issue `#224` comment ids or URLs;
- redaction status;
- failures;
- missing coverage;
- buildTag;
- implementation commit;
- smokeVersion;
- Safari smoke status `N/A_INFRASTRUCTURE_NO_RUNTIME_SURFACE`;
- exact next user action, including `/hooks` trust review when implementation is otherwise ready.

Codex may set the task only to `READY_FOR_REVIEW`. Codex may not claim final acceptance.

### Stop conditions

Stop without implementation mutation and report the exact blocker if:

- fetched remote implementation head differs from the exact launch SHA;
- required r2 task package files are absent from that remote commit;
- current repository authority conflicts cannot be resolved;
- mandatory model inventory or same-thread `CONTINUE` is incomplete;
- after `CONTINUE`, the isolated worktree does not equal the launch SHA or is dirty;
- required work exceeds exact write scope;
- any bridge, Stage 6, game, runtime, mirror, economy, persistence, UI, or unrelated path would change;
- a new dependency is required;
- redaction cannot be proven fail-closed;
- a raw or uncertain secret would leave the local spool;
- publication requires force push or history rewriting;
- Issue `#224` cannot be safely indexed after remote verification;
- hook behavior would block Codex indefinitely;
- GitHub workflow would recurse;
- tests fail;
- implementation or forensic branch movement cannot be reconciled through fast-forward or unique-path replay.

The starting checkout being on `main`, the task package being absent from that starting checkout, or the starting local `HEAD` differing from the launch SHA are explicitly not blockers when the fetched remote implementation branch and `git show` proofs pass.
