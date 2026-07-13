# AI Forensics Schema

Schema version: `AI_FORENSICS_V1`

## Actors

- `CODEX`
- `WORK`
- `GITHUB`
- `CHATGPT_ANALYSIS`

## Index markers

- Run index marker: `<!-- AI_FORENSICS_RUN_V1 -->`
- Analysis cursor marker: `<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->`

## Package layout

Every published package contains at least:

- `manifest.json`
- `events.jsonl`
- `summary.json`
- `git-evidence.json`
- `redaction-report.json`
- `checksums.json`

Optional files may include bounded sanitized text such as:

- `final-response.txt`
- `transcript-pointer.txt`
- `event.json`

## Manifest fields

- `schemaVersion`
- `actor`
- `runId`
- `taskId`
- `status`
- `repository`
- `branch`
- `packagePath`
- `createdAtUtc`
- `createdAtJst`

## Size limits

- Maximum published text file size: `2 MiB`
- Maximum package size: `8 MiB`

Truncated files must record:

- `path`
- `originalBytes`
- `publishedBytes`
- `sha256`

## Upload states

- `LOCAL_CAPTURED`
- `UPLOAD_PENDING`
- `PACKAGE_UPLOADED_COMMENT_PENDING`
- `UPLOADED`
- `UPLOAD_COMPLETE_INDEXED`
- `UPLOAD_BLOCKED_REDACTION_FAIL`
- `UPLOAD_BLOCKED_AUTH`
- `UPLOAD_FAILED`
- `UPLOAD_RETRYABLE_FAILURE`

`PACKAGE_UPLOADED_COMMENT_PENDING` means the immutable package was pushed and
verified on `forensics/ai-runs`, and only the Issue `#224` index comment remains.
Retries from this state must verify the existing package and post only the
missing comment.

`UPLOAD_BLOCKED_REDACTION_FAIL` is local-only. Flush operations must skip it and
must not create a remote package, commit, or Issue comment.

## Path convention

Immutable published paths use:

`runs/YYYY/MM/DD/<ACTOR>/<run-id>/`

The path is never rewritten after successful publication.

## JSONL and privacy

`events.jsonl` is one compact JSON object per physical line. Every non-empty line
must parse independently with `json.loads`.

Before any Git operation, every package file is scanned for standalone credential
patterns and private home-directory paths. Publication fails closed if the scan
finds private content or non-UTF-8 payloads.
