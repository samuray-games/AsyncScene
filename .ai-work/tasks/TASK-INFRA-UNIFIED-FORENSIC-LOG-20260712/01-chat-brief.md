TASK_ID: TASK-INFRA-UNIFIED-FORENSIC-LOG-20260712
PIPELINE_VERSION: 1.0.0
PHASE: CHAT_BRIEF
STATUS: ACCEPTED
CREATED_AT: 2026-07-12T20:35:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: MEMORY_REV 2026-07-12-0029-JST

## Goal

Implement one exact trimmed user command, `лог`, for both Codex and ChatGPT Work in the Asynchronia project.

The command creates a sanitized, append-only forensic run containing observable evidence needed to reconstruct what happened during the current Codex or Work operation. Every run is published only to its own remote branch and is readable through GitHub. The command never repairs, retries, resumes, merges, rebases, resets, stashes, cleans, force-pushes, changes runtime code, changes bridge state, or writes to `main`.

## Non-goals

- Do not execute, repair, revalidate, continue, rotate, inspect, or modify bridge Slots 1, 2, or 3.
- Do not continue Stage 6.
- Do not change game runtime, UI runtime, economy, battle, NPC, persistence, routing, smoke registries, deployed mirrors, or product content.
- Do not expose hidden chain-of-thought or claim access to unavailable internal OpenAI telemetry.
- Do not upload raw credentials, authorization headers, cookies, browser data, keychain data, shell history, `.env` files, private keys, unrelated repositories, or unrelated conversations.
- Do not publish forensic evidence to `main`, task branches, bridge branches, mailbox refs, or one shared mutable forensic branch.
- Do not create a PR automatically.
- Do not make `лог` accept user parameters. The only active alias is the exact trimmed lowercase command `лог`.

## Accepted decisions

- The exact trimmed lowercase command is `лог`.
- Leading and trailing whitespace is ignored. `Лог`, `LOG`, `лог сейчас`, `/лог`, and every other variant are ordinary text and must not trigger forensic capture.
- The command is processed before generic task interpretation.
- Every run uses one immutable run identity with this exact format: `LOG-YYYYMMDDTHHMMSSZ-ACTOR-XXXXXXXX`, where `ACTOR` is exactly `CODEX` or `WORK`, and `XXXXXXXX` is the first eight uppercase hexadecimal characters of SHA-256 over `actor + UTC timestamp + repository full name + baseline SHA`.
- Every run is published to exactly one new branch named `forensics/log/<run-id-lowercase>` created from the freshly fetched current `origin/main` SHA.
- Every run is stored under `.ai-forensics/runs/<RUN_ID>/` on that branch.
- Required run files are exactly `MANIFEST.json`, `SUMMARY.md`, `events.jsonl`, `git-evidence.txt`, `REDACTION_REPORT.md`, and `SHA256SUMS`.
- Codex runs additionally include `codex-session.jsonl` and `codex-app.log` when those sources are uniquely resolvable and readable.
- Missing optional Codex sources are recorded as unavailable. They are not fabricated.
- Work runs never claim local Codex log access. They contain only current conversation facts that may be safely recorded, connector-visible repository evidence, observable GitHub mutations, and explicit unavailable-source declarations.
- Codex resolves the current session by finding a unique current session file whose recent user-message record contains exact trimmed `лог`. Zero or multiple matches return `BLOCKED_LOG_SESSION_UNRESOLVED` without publication.
- Codex app-log capture covers the preceding 60 minutes ending at capture time. Session capture is limited to the final 2,000,000 UTF-8 bytes. The bundle limit is 10,000,000 bytes before Git object overhead.
- Lines longer than 16,384 UTF-8 bytes are truncated and recorded in `REDACTION_REPORT.md`.
- Redaction replaces each secret with `<REDACTED:KIND:HASH8>`, where `HASH8` is the first eight lowercase hexadecimal characters of SHA-256 over the removed value. This preserves correlation without preserving the secret.
- The redactor must cover OpenAI keys, GitHub tokens, bearer tokens, authorization headers, cookie headers, URL userinfo credentials, common environment assignment forms, PEM private-key bodies, and generic high-confidence token assignments.
- After redaction, a second secret scan must run. Any surviving high-confidence secret returns `FAIL_SECRET_SCAN` and forbids publication.
- Git evidence contains repository identity, capture time, current branch, HEAD, `git status --porcelain=v2`, worktree list, refs, recent reflog entries, recent commits, remote branch heads, and current diff summaries. Remote URLs are omitted.
- The command is read-only relative to the investigated checkout until the sanitized bundle is complete and validated in a temporary directory.
- Publication uses a separate clean worktree, creates only the forensic branch, adds only the current run directory, commits once, pushes fast-forward without force, refetches the branch, and proves remote equality.
- The forensic commit message is exactly `forensics: capture <RUN_ID>`.
- The final command result is `PASS_LOG_PUBLISHED` with run ID, branch, remote commit SHA, included sources, omitted sources, redaction counts, truncation counts, bundle byte count, and exact next action.
- Failure statuses are exactly `BLOCKED_LOG_SESSION_UNRESOLVED`, `BLOCKED_LOG_SOURCE_UNREADABLE`, `BLOCKED_LOG_BRANCH_EXISTS`, `FAIL_SECRET_SCAN`, `FAIL_LOG_SCHEMA`, `FAIL_LOG_SIZE_LIMIT`, `BLOCKED_LOG_PUSH_AUTH`, and `FAIL_LOG_REMOTE_READBACK`.
- Plugin source version, marketplace version, and validator expectation move together from `1.0.8` to `1.0.9`.
- Safari runtime smoke is `N/A` because no game or UI runtime surface changes.

## Constraints

- Live baseline is `d449d00200e8b40f6448b49892e954b9f4f00f14`.
- Work branch is `work/unified-forensic-log-20260712`.
- Implementation branch is `infra/unified-forensic-log-20260712`.
- Direct writes to `main` are forbidden.
- Bridge refs and `.ai-bridge/**` are forbidden reads and writes for this task.
- Stage 6 files and runtime files are forbidden reads and writes unless a repository-wide validator reads file names without opening runtime contents.
- No new third-party dependency is allowed. Python standard library and existing repository tooling only.
- The exact implementation write scope is frozen in `02-work-plan.md` and `03-codex-task.md`.
- Any required file outside frozen scope returns `BLOCKED_SCOPE_EXPANSION` before mutation.
- Existing command aliases `мост 1`, `мост 2`, `мост 3`, `запуль`, and `запушь` retain their current behavior.
- Work and Codex must not invent or rewrite user-facing, policy, status, field, branch, path, or command text. Every required literal is specified by ChatGPT in this package.

## Acceptance criteria

- Exact trimmed `лог` is reserved in root policy, override policy, task-router policy, the new forensic skill, and root `LOG.md`.
- All active documents agree on trigger matching, actor behavior, run ID, branch naming, required files, redaction, limits, publication safety, statuses, and final report.
- The Codex collector resolves the current session deterministically, captures only allowed sources, redacts secrets, enforces size and line limits, validates the bundle, publishes one new branch, and proves remote readback.
- The Work protocol produces the same required schema without claiming unavailable local or hidden telemetry.
- A dedicated validator rejects command drift, schema drift, branch drift, missing redaction rules, unsafe publication, writes to protected refs, missing required files, invalid checksums, surviving secret fixtures, and plugin version mismatch.
- Unit tests cover exact alias matching, non-matching variants, run ID generation, session ambiguity, redaction correlation, PEM removal, URL credential removal, line truncation, size failure, manifest validation, checksum validation, actor-specific required sources, branch naming, and protected-ref rejection.
- GitHub Actions validates forensic branches independently without writing to them.
- `python3 tools/validate-asynchronia-auto-model-preflight.py` passes after the version bump.
- `python3 tools/validate-orchestration-policy.py` passes.
- `python3 tools/validate_ai_work_pipeline.py` passes.
- Exact implementation diff contains only the frozen write scope.
- Codex Security reports no unresolved high or critical finding in the collector, redactor, publisher, validator, tests, workflow, or policy changes.

## Open questions

None.

## Output required from Work

Publish this complete ChatGPT-authored package to `work/unified-forensic-log-20260712`, keep `infra/unified-forensic-log-20260712` byte-identical to baseline, validate the package structure, and hand the exact `03-codex-task.md` to Codex. Work must not implement source changes itself and must not begin bridge reset or Stage 6.