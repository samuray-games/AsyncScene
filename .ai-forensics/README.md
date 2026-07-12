# AI Forensics

This directory documents the version 1 automatic Asynchronia forensic logging system for Codex Desktop, ChatGPT Work, and independent GitHub repository evidence.

## Architecture

- Local Codex hooks capture bounded raw session events into a private spool outside the repository.
- Sanitized immutable packages are built from the spool and published to `forensics/ai-runs`.
- GitHub Issue `#224` is the append-only public index for every published package.
- GitHub Actions produces independent repository-side evidence for supported events.
- ChatGPT Work uses a protocol-enforced journal rather than a machine-local hidden hook.
- The exact trimmed ChatGPT command `лог` reviews published immutable packages after the newest analysis cursor.

## Privacy boundary

- Raw hook payloads and transcript pointers remain local in the private spool.
- Sanitization runs before hashing any published package content.
- Publication fails closed on uncertain secret handling with `UPLOAD_BLOCKED_REDACTION_FAIL`.
- Published packages must never contain raw credentials, cookies, `.env` values, authorization headers, private keys, or private home-directory paths.

## Local spool

- Default spool root: `$CODEX_HOME/forensics-spool`
- Fallback spool root: `~/.codex/forensics-spool`
- Staged runs are stored under `runs/<run-id>/` in the spool.
- Session-local hook capture metadata is stored under `sessions/<session-id>/`.

## Publication flow

1. Capture or build a local run record.
2. Sanitize the record and construct `AI_FORENSICS_V1` package files.
3. Stage the package in the local spool.
4. Publish through an isolated temporary Git repository using `origin/forensics/ai-runs`.
5. Verify remote readback for every expected file.
6. Add one Issue `#224` comment beginning with `<!-- AI_FORENSICS_RUN_V1 -->`.

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
- Version 1 is append-only. Deletion, compaction, and retention pruning are future tasks.
- Version 1 does not capture hidden chain-of-thought and does not claim access to unavailable internal OpenAI server logs.
