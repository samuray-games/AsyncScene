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

If one event exceeds the per-file size limit, publish a bounded truncation
record for that event rather than partial JSON. If the total JSONL file exceeds
the limit, publish only complete retained lines plus a final omission record.

Over-limit `.json` artifacts must remain valid JSON by using a truncation
envelope that records the original size and SHA-256.

Before any Git operation, every package file is scanned for standalone credential
patterns and private home-directory paths. The home detector is independent of
the current runner account and covers foreign-machine macOS
`/Users/<user>/...`, Linux `/home/<user>/...`, `/root/...`, and Windows drive
user-home paths. Sanitization replaces the private home root with `<HOME>` while
retaining a safe suffix. Publication fails closed if the scan finds private
content or non-UTF-8 payloads.

The read-only `tools/ai_forensics/public_surface_audit.py` audits reachable text
blobs without checking them out and can explicitly read Issue `#224` comments
through authenticated `gh api`. It reports categories, refs, commit and blob
identifiers, repository-relative paths, safe line numbers, and one-way
fingerprints only.

R1 prevention and debt measurement do not erase already-published Git objects or
Issue content. R2 history remediation is a separate destructive operation that
requires explicit authorization, verified backups, complete remote-ref
inventory, collaborator coordination, and post-rewrite GitHub cache/support
handling. Ordinary package operation remains append-only.

## Turn correlation

Codex turn packages must include explicit session correlation metadata without
republishing the entire historical session. The durable session boundary is
maintained locally and advanced only after successful staging of the current
turn package.

## Publication metadata

Mutable publication transitions for one run are serialized under a run-scoped
file lock.

GitHub evidence comments must keep `packageCommit` distinct from repository
`sourceSha` and `resultSha`, and must document the SHA semantics when the event
does not supply `before` and `after`.
