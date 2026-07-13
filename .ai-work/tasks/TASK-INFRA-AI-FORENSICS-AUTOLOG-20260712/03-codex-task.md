Use the current supported Asynchronia safety directive.

TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-12T21:20:00+09:00
AUTHOR_ROLE: CHATGPT_ONLY_CONTENT_AUTHORSHIP_WITH_WORK_EVIDENCE
SOURCE_REVISION: work/ai-forensics-autolog-20260712@73d336b265d2bd6075fab92646ab895eea58325f

### Atomic goal

Implement version 1 of the automatic Asynchronia AI forensic logging system for Codex Desktop, ChatGPT Work, independent GitHub evidence, and the exact ChatGPT command `лог`.

The result must automatically produce sanitized, immutable, remotely indexed run evidence without touching bridge, Stage 6, game, runtime, economy, persistence, UI, or deployment-mirror surfaces.

### Exact baseline

- Repository: `samuray-games/AsyncScene`.
- Selected remote implementation branch: `origin/infra/ai-forensics-autolog-20260712`.
- The exact expected implementation-branch head SHA is supplied in the launch prompt by ChatGPT after this task package and `STATE.md` are published.
- Before mutation, fetch `origin/main`, `origin/work/ai-forensics-autolog-20260712`, `origin/infra/ai-forensics-autolog-20260712`, and `origin/forensics/ai-runs`.
- Prove local `HEAD` and fetched `origin/infra/ai-forensics-autolog-20260712` both equal the exact launch SHA.
- Prove the exact launch SHA contains this task file, `01-chat-brief.md`, `02-work-plan.md`, and `STATE.md`.
- If any identity or baseline proof fails, stop with `BLOCKED_BASELINE_MISMATCH` and make no mutation.

### Allowed reads

Read only what is necessary from:

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
- existing validators and tests as style references
- Git metadata and the exact four remote refs named in the baseline section
- official OpenAI Codex Hooks documentation when needed to verify current hook payload and trust behavior
- local Codex session/app-log locations only during controlled smoke and only after redaction boundaries are implemented

### Allowed writes

Implementation branch writes are limited exactly to:

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

Controlled smoke may create only new immutable files under:

- `runs/YYYY/MM/DD/CODEX/<run-id>/...` on `forensics/ai-runs`
- `runs/YYYY/MM/DD/WORK/<run-id>/...` on `forensics/ai-runs`
- `runs/YYYY/MM/DD/GITHUB/<run-id>/...` on `forensics/ai-runs`

Controlled smoke may add only new comments to GitHub Issue `#224` using the approved markers.

Local-only writes are limited to the private spool root selected by the implementation. The default must be outside the repository and inside the current user's Codex home, for example `$CODEX_HOME/forensics-spool` or `~/.codex/forensics-spool`. Never commit the spool.

### Forbidden changes

- Any `.ai-bridge/**` path.
- Any numbered mailbox ref or legacy bridge ref.
- Bridge routing, claims, inboxes, outboxes, receipts, state, canaries, or reset artifacts.
- Stage 6 files or continuation.
- Game/runtime JavaScript, HTML, CSS, data, economy, persistence, battle, NPC, UI, smoke registry, deployment mirror, or cache-bust files.
- `PROJECT_MEMORY.md`, `.ai-memory/CURRENT.md`, `.ai-memory/DECISIONS.md`, `.ai-memory/CANON.md`, or archive files during implementation.
- Direct writes to `main`.
- Force push, history rewriting, destructive reset, repository clean, broad stash, or deletion of historical forensic packages.
- Dependency installation or lockfile changes.
- Raw unredacted transcript, log, prompt, environment, token, credential, cookie, private key, `.env` value, authorization header, or private user path publication.
- Hidden chain-of-thought capture or any claim that unavailable internal reasoning was logged.
- Automatic cause attribution by a producer. Producers record observed facts only.

### Dependencies

- Python 3 standard library.
- Existing `git` command.
- Existing authenticated `gh` CLI for live package publication and Issue `#224` comment publication.
- Existing GitHub Actions token for repository event evidence.
- Official Codex project-local hook support and user trust review through `/hooks`.
- No new package, service, database, token, webhook server, or external dependency.

### Implementation requirements

#### 1. Versioned schema

Implement a single schema authority containing:

- schema version `AI_FORENSICS_V1`;
- exact actors `CODEX`, `WORK`, `GITHUB`, `CHATGPT_ANALYSIS`;
- exact Issue markers from Issue `#224`;
- unique run-id generation;
- required manifest keys and types;
- immutable package path generation;
- 2 MiB per published text file and 8 MiB per package limits;
- truncation metadata containing original byte count and SHA-256;
- status values that distinguish local capture, upload pending, uploaded, blocked by redaction, blocked by auth, and failed publication;
- deterministic JSON serialization with UTF-8 and sorted keys.

#### 2. Fail-closed redaction

Implement deterministic redaction before publication for at least:

- OpenAI, GitHub, cloud, bearer, basic-auth, and generic API tokens;
- authorization and cookie headers;
- private key blocks;
- passwords and secret assignments in JSON, shell, YAML-like, TOML-like, URL query, and environment-style text;
- Git remote URLs containing embedded credentials;
- `.env` values;
- absolute home-directory paths, replacing the user-specific prefix with a stable placeholder;
- suspicious high-entropy values when associated with secret-bearing keys.

A sanitizer uncertainty or malformed sensitive structure must fail closed with `UPLOAD_BLOCKED_REDACTION_FAIL`. The raw source remains local. Do not publish partial uncertain material.

#### 3. Codex hook capture

Add `.codex/hooks.json` for these official events:

- `SessionStart`
- `UserPromptSubmit`
- `PostToolUse`
- `SubagentStart`
- `SubagentStop`
- `Stop`

All hooks call the same repository-owned Python entrypoint with the event name derived from input. The handler must:

- read hook JSON from stdin;
- validate event identity and required fields;
- append one local JSONL event to a session/turn spool using atomic file replacement or append safety;
- record timestamps, session/thread id, turn id when present, cwd, model, permission mode, tool name and bounded tool request/response for `PostToolUse`, subagent identity for subagent events, prompt metadata for `UserPromptSubmit`, transcript path metadata, and final assistant message for `Stop`;
- avoid publishing unredacted source material from the synchronous hook;
- return quickly and successfully after durable local capture;
- on `SessionStart` and `Stop`, launch a detached bounded publisher process for pending complete packages;
- ensure publisher recursion or repeated hooks cannot duplicate one run package or Issue comment;
- never block Codex indefinitely on network operations.

Use the official transcript path as a source pointer. Do not blindly copy the whole transcript. Extract only bounded evidence necessary for reconstruction, preserve event order, and sanitize before publication.

#### 4. Git evidence

Collect read-only observed evidence with command, exit code, bounded stdout/stderr, and timestamp for:

- repository root and cwd;
- current branch and `HEAD`;
- `git status --porcelain=v2 --branch`;
- recent commits;
- relevant worktrees;
- relevant local and remote refs;
- changed paths for the current turn when derivable;
- remotes with credentials removed.

Do not execute destructive Git commands. Distinguish fields declared by the agent from independently observed Git output.

#### 5. Package construction

Each published package must include at least:

- `manifest.json`
- `events.jsonl`
- `summary.json`
- `git-evidence.json`
- `redaction-report.json`
- `checksums.json`

A Codex package also includes bounded sanitized final-response and transcript-event extracts when available.

A Work package includes its received task identity, inspected repository evidence, declared plan/actions, GitHub connector actions and returned SHAs/URLs, final status, and exact next action. The Work protocol must not require hidden reasoning.

A GitHub package includes the sanitized supported event payload, actor, event type, delivery/run identity when available, before/after refs, repository, workflow/job evidence, and package publication result.

#### 6. Immutable publisher

Implement publication using an isolated temporary clone or worktree:

1. Sanitize and validate the complete package locally.
2. Fetch `origin/forensics/ai-runs`.
3. Use a unique never-before-existing package path.
4. Commit only that package path.
5. Push fast-forward without force.
6. On non-fast-forward, refetch, replay the unique package commit, and retry a bounded number of times.
7. Refetch remote and verify every expected file and checksum.
8. Only after remote verification, add one Issue `#224` comment with `<!-- AI_FORENSICS_RUN_V1 -->`, actor, run id, task id if known, timestamps, branch, before/after SHAs, package path, package commit, redaction status, upload status, and concise observed result.
9. Record the Issue comment id or URL locally to make retry idempotent.

A failure at any step remains in the local retry spool and must not produce an uploaded marker.

#### 7. Independent GitHub evidence workflow

Add `.github/workflows/ai-forensics-evidence.yml` with:

- supported triggers for `push`, `pull_request`, `issues`, `issue_comment`, and `workflow_dispatch`;
- branch/path guards that ignore `forensics/**` publication and ignore machine-generated Issue `#224` comments;
- concurrency serialization for the forensic publication branch;
- least-privilege permissions sufficient for contents and Issue comments;
- checkout with full history where required;
- Python standard-library execution only;
- sanitized event processing through the same schema/redactor/package code;
- immutable package publication to `forensics/ai-runs`;
- Issue `#224` comment only after remote verification;
- explicit safe skip for untrusted fork contexts;
- no workflow recursion.

#### 8. Work automatic journal protocol

Update `.ai-memory/WORKFLOWS.md` with a normative section requiring every Asynchronia ChatGPT Work execution, including read-only analysis, to:

1. allocate a unique `WORK` run id at start;
2. record live memory revision, repository, input task, inspected refs/files, observed SHAs, connector actions, returned commits/URLs, validations, failures, final status, and exact next action;
3. sanitize and validate the record;
4. publish one immutable `WORK` package to `forensics/ai-runs`;
5. verify remote readback;
6. add one Issue `#224` index comment only after verification;
7. report a journal failure explicitly and never claim upload success without remote proof.

State clearly that this is protocol-enforced rather than a hidden Work lifecycle hook.

#### 9. Exact `лог` ChatGPT review protocol

Update `.ai-memory/WORKFLOWS.md` with an exact trimmed command alias:

`лог`

The protocol must require ChatGPT to:

1. fetch live Google Drive project memory in the current response and report exact `MEMORY_REV`;
2. fetch current repository primary evidence;
3. read Issue `#224` and find the newest valid `<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->` comment;
4. enumerate all later valid Codex, Work, and GitHub index comments;
5. fetch every referenced immutable package from `forensics/ai-runs`;
6. verify package hashes, schema, marker, actor, run id, task id, branch, commit, time ordering, and remote existence;
7. correlate declared agent actions with independent GitHub evidence;
8. identify the earliest evidence-backed divergence, downstream effects, missing coverage, unresolved ambiguity, and required correction;
9. report findings in Russian with exact evidence citations and without inventing unavailable reasoning;
10. only after completing analysis, add one new `<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->` comment containing analyzed-through Issue comment id/time, package commits, verdict, and analysis timestamp.

If there are no new valid records, report exactly that no new forensic records exist after the latest cursor and do not fabricate an incident.

#### 10. Documentation

Document:

- architecture and threat model;
- local spool and privacy boundary;
- project hook trust review through `/hooks`;
- how automatic capture, retry, publication, Issue indexing, Work protocol, GitHub evidence, and `лог` analysis interact;
- package schema and markers;
- setup and disable procedures;
- known limitations, especially the lack of a machine-local Work lifecycle hook and the absence of hidden reasoning.

#### 11. Tests

Tests must include positive and negative coverage for:

- run-id uniqueness and stable parsing;
- schema rejection of missing, extra, wrong-type, empty, and placeholder values;
- redaction across JSON, URLs, headers, shell, environment-style, multiline private keys, remote URLs, and home paths;
- no over-redaction of ordinary hashes, branch names, commit SHAs, and non-secret text;
- deterministic truncation and checksum metadata;
- package layout and immutable paths;
- hook-event parsing for every configured event;
- malformed hook input fail-safe behavior;
- bounded tool and transcript extraction;
- git credential stripping;
- detached publisher selection and idempotency;
- non-fast-forward retry decisions without force;
- Issue marker generation and parsing;
- recursion guards;
- analysis cursor selection;
- dry-run publication;
- rejection of any package containing known secret fixtures after sanitization.

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
git diff --check
```

Also validate the GitHub Actions workflow syntax using an already available repository method. Do not install a parser.

For controlled publication smoke, use only synthetic secret fixtures and synthetic session content. Never use real credentials or dump an entire real transcript.

### Required final report

Report all fields:

- status;
- active model and effort as `USER_SELECTED_UNVERIFIED` unless externally proven;
- model-selector recommendation and evaluated pair count;
- exact baseline proof;
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

Stop without mutation or stop further mutation and report the exact blocker if:

- baseline identity fails;
- mandatory model inventory discovery or same-thread `CONTINUE` authorization is incomplete;
- required work exceeds the exact write scope;
- any bridge, Stage 6, game, runtime, mirror, economy, persistence, UI, or unrelated path would change;
- a dependency is required;
- redaction cannot be proven fail-closed;
- a raw or uncertain secret would leave the local spool;
- publication requires force push or history rewrite;
- Issue `#224` cannot be safely indexed after remote verification;
- hook behavior would block Codex indefinitely;
- GitHub workflow would recurse;
- tests fail;
- the implementation branch or forensic branch moved in a way that cannot be safely reconciled with a fast-forward or unique-path replay.
