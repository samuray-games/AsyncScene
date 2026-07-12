TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: READY_FOR_WORK
CREATED_AT: 2026-07-12T21:07:13+09:00
AUTHOR_ROLE: CHAT
SOURCE_REVISION: 2026-07-12-0029-JST

### Goal

Implement automatic, append-only, sanitized forensic logging for Codex Desktop and ChatGPT Work activity related to Asynchronia, with independent GitHub event evidence and one reserved ChatGPT command: exact trimmed `лог`.

After the system is accepted:

- Codex automatically captures every relevant project turn, tool event, final response, local repository state, and publication result.
- ChatGPT Work automatically publishes one structured journal record for every project execution, including read-only runs.
- GitHub Actions independently records repository-side push, pull request, issue, issue-comment, and workflow evidence.
- The exact trimmed user command `лог` makes ChatGPT load live project memory, inspect all new indexed records since the latest analysis cursor, open referenced run packages, correlate Codex, Work, and GitHub evidence, identify the first observed divergence and downstream effects, report findings, and append a new analysis cursor only after analysis completes.

### Non-goals

- Do not repair, reset, inspect, rotate, or continue any bridge slot.
- Do not edit `.ai-bridge/**`, numbered mailbox refs, bridge routing, Stage 6 files, game runtime, gameplay logic, economy, persistence, UI runtime, or deployment mirrors.
- Do not capture hidden chain-of-thought or claim access to unavailable internal OpenAI server logs.
- Do not publish raw unredacted transcripts, credentials, cookies, authorization headers, `.env` values, personal paths, or unrelated project data.
- Do not write implementation changes directly to `main`.
- Do not make Safari runtime acceptance part of this infrastructure task.

### Accepted decisions

- Repository: `samuray-games/AsyncScene`.
- Task branch: `work/ai-forensics-autolog-20260712`.
- Implementation branch: `infra/ai-forensics-autolog-20260712`.
- Immutable run-package branch: `forensics/ai-runs`.
- Chronological run index: GitHub Issue `#224`, `[AI FORENSICS] Automatic Codex and Work run index`.
- Run packages use unique paths under `runs/YYYY/MM/DD/<actor>/<run-id>/` and are never rewritten after successful publication.
- Actor values are exactly `CODEX`, `WORK`, `GITHUB`, and `CHATGPT_ANALYSIS`.
- Run-index comments start with exactly one versioned marker defined by Issue #224.
- Publication to `forensics/ai-runs` is fast-forward only. Force push and history rewriting are forbidden.
- Raw unredacted Codex source data remains local under a private spool. Only sanitized and size-bounded evidence may leave the machine.
- Codex logging uses official lifecycle hooks when supported. The required events are `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `SubagentStart`, `SubagentStop`, and `Stop`.
- Codex `Stop` captures the final assistant message, transcript path, thread/session id, turn id, model, permission mode, git evidence, and prior hook events, then starts a detached publisher so the UI is not blocked by network publication.
- Failed Codex publication remains in the local retry spool and is retried on the next session start and stop. Upload failure must never be reported as upload success.
- Work logging is protocol-enforced because ChatGPT Work exposes no equivalent machine-local lifecycle hook. Every project Work execution must create a structured immutable run package and Issue #224 index comment before its final report. A failed journal write must be reported explicitly.
- GitHub Actions provides independent evidence so Work and Codex self-reports are never the only source of truth.
- The repository is public. Redaction must fail closed. A run that cannot be sanitized is kept local and indexed only as `UPLOAD_BLOCKED_REDACTION_FAIL` without sensitive content.
- Version 1 limits each published text file to 2 MiB and each run package to 8 MiB. Oversized fields are truncated with original byte count and SHA-256 recorded.
- Version 1 retention is append-only. Deletion and compaction are separate future tasks.

### Constraints

- Use Python standard library only. Add no dependencies.
- Preserve existing repository behavior and infrastructure outside the exact task scope.
- Use deterministic JSON serialization and UTC timestamps plus explicit JST display timestamps.
- Generate cryptographically strong run ids or collision-resistant ids containing actor, UTC timestamp, session/run identity, and a random suffix.
- Redaction must cover common API tokens, bearer/basic authorization, cookies, private keys, GitHub tokens, OpenAI keys, cloud credentials, passwords, `.env` assignments, query-string secrets, and absolute home-directory paths.
- Redaction must operate before hashing published content. The manifest records both local source hashes when safe to retain locally and published sanitized hashes.
- Git evidence must distinguish observed state from declared state and include repository, cwd, branch, HEAD, status porcelain, remotes with credentials removed, recent commits, worktrees, relevant refs, changed paths, and command exit codes.
- Hook scripts must not mutate the current task worktree except their private local spool. Publication must use an isolated temporary clone or worktree.
- GitHub Actions must ignore `forensics/**` publications to prevent recursion.
- Issue #224 comments must contain summaries and package pointers, not full transcripts.
- The `лог` protocol must analyze only records after the newest valid analysis cursor unless the user explicitly requests full history.

### Acceptance criteria

1. Codex project hooks are present, valid, documented, trust-reviewable, and mapped to the required lifecycle events.
2. Codex hook capture is local-first and completes without blocking the agent on network publication.
3. Sanitization is fail-closed and has deterministic positive and negative tests, including secrets embedded in JSON, shell text, URLs, headers, and environment-style lines.
4. Codex publication writes only to `forensics/ai-runs`, uses a unique immutable package path, retries non-fast-forward races without force, and posts an Issue #224 index comment only after remote readback proves the package exists.
5. Work logging protocol is documented in repository workflow authority and defines the exact mandatory fields, publication sequence, failure behavior, and no-false-success rule.
6. GitHub Actions independently captures supported repository events, sanitizes the event payload, writes a unique immutable package to `forensics/ai-runs`, and posts Issue #224.
7. The exact `лог` command contract is documented in repository workflow authority and live Google Drive project memory before final acceptance.
8. Unit tests cover ids, schemas, redaction, truncation, package layout, event parsing, git credential stripping, retry decisions, marker parsing, cursor selection, and dry-run publication.
9. Static validation commands pass. Safari smoke is `N/A_INFRASTRUCTURE_NO_RUNTIME_SURFACE`.
10. Controlled end-to-end smoke proves one Codex run, one Work run, and one independent GitHub event are visible through Issue #224 and their immutable packages can be fetched from `forensics/ai-runs`.
11. A controlled exact `лог` review consumes those test records, reports correlation results, and posts a valid analysis cursor comment.
12. No bridge, Stage 6, game, runtime, mirror, or unrelated file changes occur.

### Open questions

None. The user explicitly selected automatic publication, a unified `лог` review command, and postponement of all bridge work.

### Output required from Work

- Inspect current repository policy, task pipeline, GitHub workflows, plugin/hook conventions, and relevant official Codex hook documentation.
- Produce an atomic Codex implementation task with exact baseline, read scope, write scope, tests, local smoke, publication smoke, and stop conditions.
- Create the dedicated implementation branch from the exact task-package head.
- Do not implement bridge or game changes.
