# AI Forensics

This directory documents the version 1 automatic Asynchronia forensic logging system for Codex Desktop, ChatGPT Work, and independent GitHub repository evidence.

## Architecture

- Local Codex hooks capture bounded raw session events into a private spool outside the repository.
- Sanitized immutable packages are built per completed turn from the spool and published to `forensics/ai-runs`.
- GitHub Issue `#224` is the append-only public index for every published package.
- GitHub Actions produces independent repository-side evidence for supported events.
- ChatGPT Work uses a protocol-enforced journal rather than a machine-local hidden hook.
- The exact trimmed ChatGPT command `лог` reviews published immutable packages after the newest analysis cursor.

## Privacy boundary

- Raw hook payloads and transcript pointers remain local in the private spool.
- Sanitization runs before hashing any published package content.
- Publication fails closed on uncertain secret handling with `UPLOAD_BLOCKED_REDACTION_FAIL`.
- Published packages must never contain raw credentials, cookies, `.env` values, authorization headers, private keys, or private home-directory paths.
- Home-path handling is generic across foreign-machine macOS `/Users/<user>/...`, Linux `/home/<user>/...`, `/root/...`, and Windows drive-based user homes. Sanitization replaces the private root with `<HOME>` and retains only the non-private suffix.
- Package sanitization protects new packages; it does not retroactively remove already-published Git objects or historical Issue content.

## Local spool

- Default spool root: `$CODEX_HOME/forensics-spool`
- Fallback spool root: `~/.codex/forensics-spool`
- Staged runs are stored under `runs/<run-id>/` in the spool.
- Session-local hook capture metadata is stored under `sessions/<session-id>/`.
- Session capture uses a standard-library file lock for turn allocation, raw event append, package staging, and metadata transitions.
- Session metadata records a durable `nextEventIndex` boundary so each completed Stop packages only its own turn-local event window.
- Completed turn summaries record the session event window and turn sequence for recovery and audit without republishing historical turns.

## Publication flow

1. Capture or build a local run record.
2. Sanitize the full package surface and construct `AI_FORENSICS_V1` package files.
3. Stage the package atomically in the local spool.
4. Serialize every mutable publication transition for one run under a standard-library file lock.
5. Publish through an isolated temporary Git repository using `origin/forensics/ai-runs`.
6. If the immutable package already exists remotely with identical contents, recover idempotently instead of attempting an empty commit.
7. Verify remote readback for every expected file.
8. Persist `PACKAGE_UPLOADED_COMMENT_PENDING`.
9. Add one Issue `#224` comment beginning with `<!-- AI_FORENSICS_RUN_V1 -->`.
10. Persist `UPLOAD_COMPLETE_INDEXED`.

If the package push succeeds but the Issue comment fails, retry verifies the
existing remote package and posts only the missing comment.

## Trust review

- Project-local hook configuration is stored in [`.codex/hooks.json`](../.codex/hooks.json).
- The user must approve the hook configuration through the Codex `/hooks` review flow before live automatic capture can execute.
- Trust review is required for hook activation but is not a blocker for source implementation or static validation.

## Setup and disable

- Setup:
  - approve `.codex/hooks.json` through `/hooks`
  - ensure `gh` is authenticated for Issue `#224` comments and `forensics/ai-runs` publication
  - ensure GitHub Actions can write contents and issues for repository events
- Disable:
  - remove or empty `.codex/hooks.json`
  - stop invoking `tools/ai_forensics/github_event.py` from GitHub Actions
  - preserve already-published immutable packages and Issue index comments

## Known limitations

- ChatGPT Work has no machine-local lifecycle hook, so Work evidence is protocol-enforced rather than automatic in the same way as Codex Desktop.
- Version 1 publishes bounded transcript pointers and bounded final-response extracts, not full transcripts.
- Over-limit JSON artifacts are replaced with valid truncation envelopes, and over-limit `events.jsonl` tails are replaced with bounded omission records rather than partial JSON.
- GitHub event publication records source and result SHA semantics from the live event payload or checked-out repository state.
- Version 1 is append-only. Deletion, compaction, and retention pruning are future tasks.
- R1 prevention work is limited to generic redaction, final-scan enforcement, deterministic public-surface auditing, tests, and debt measurement. It does not rewrite history or mutate Issue `#224`.
- R2 destructive history remediation requires separate explicit authorization, verified backups, complete remote-ref inventory, collaborator coordination, and post-rewrite GitHub cache/support handling. No R1 package may bypass the append-only contract to journal contaminated historical evidence.
- Version 1 does not capture hidden chain-of-thought and does not claim access to unavailable internal OpenAI server logs.
