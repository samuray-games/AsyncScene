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
- `UPLOADED`
- `UPLOAD_BLOCKED_REDACTION_FAIL`
- `UPLOAD_BLOCKED_AUTH`
- `UPLOAD_FAILED`

## Path convention

Immutable published paths use:

`runs/YYYY/MM/DD/<ACTOR>/<run-id>/`

The path is never rewritten after successful publication.
