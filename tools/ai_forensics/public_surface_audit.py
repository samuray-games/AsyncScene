"""Read-only audit of reachable public AI forensics text surfaces."""

from __future__ import annotations

from argparse import ArgumentParser
from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from typing import Any, Iterable

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from tools.ai_forensics.redact import iter_private_content  # type: ignore[import-not-found]
else:
    from .redact import iter_private_content

MAX_AUDIT_BLOB_BYTES = 8 * 1024 * 1024
TEXT_SUFFIXES = {
    ".cfg", ".conf", ".css", ".csv", ".env", ".go", ".h", ".html", ".ini", ".js", ".json",
    ".jsonl", ".jsx", ".md", ".mjs", ".plist", ".py", ".rb", ".rs", ".sh", ".sql", ".swift",
    ".toml", ".ts", ".tsx", ".txt", ".xml", ".yaml", ".yml", ".zsh",
}


@dataclass(frozen=True)
class AuditFinding:
    category: str
    ref: str
    commit_sha: str | None
    blob_sha: str | None
    path: str
    line: int | None
    fingerprint: str
    classification: str | None = None

    def as_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "category": self.category,
            "ref": self.ref,
            "commitSha": self.commit_sha,
            "blobSha": self.blob_sha,
            "path": self.path,
            "line": self.line,
            "fingerprint": self.fingerprint,
        }
        if self.classification is not None:
            result["classification"] = self.classification
        return result


def _run(repo: Path, args: list[str]) -> str:
    result = subprocess.run(
        ["git", *args], cwd=repo, text=True, capture_output=True, check=False
    )
    if result.returncode != 0:
        raise RuntimeError(f"git command failed: {' '.join(args)}")
    return result.stdout


def _fingerprint(category: str, value: str) -> str:
    digest = hashlib.sha256(f"{category}\0{value}".encode("utf-8")).hexdigest()
    return f"sha256:{digest}"


def _reachable_commits(repo: Path, ref: str) -> list[str]:
    return _run(repo, ["rev-list", "--topo-order", "--reverse", ref]).splitlines()


def _reachable_objects(repo: Path, ref: str) -> list[tuple[str, str]]:
    output = _run(repo, ["rev-list", "--objects", "--full-history", ref])
    objects: list[tuple[str, str]] = []
    for line in output.splitlines():
        parts = line.split(" ", 1)
        if len(parts) == 2:
            path = parts[1]
            suffix = Path(path).suffix.lower()
            if suffix in TEXT_SUFFIXES or not suffix or path.startswith("forensics/ai-runs/"):
                objects.append((parts[0], path))
    return objects


def _batch_blob_texts(repo: Path, object_ids: list[str]) -> dict[str, str | None]:
    if not object_ids:
        return {}
    metadata = subprocess.run(
        ["git", "cat-file", "--batch-check"],
        cwd=repo,
        input=("\n".join(object_ids) + "\n").encode("ascii"),
        capture_output=True,
        check=False,
    )
    if metadata.returncode != 0:
        raise RuntimeError("git batch object metadata read failed")
    eligible_ids: list[str] = []
    for line in metadata.stdout.decode("ascii", errors="replace").splitlines():
        fields = line.split()
        if len(fields) == 3 and fields[1] == "blob" and int(fields[2]) <= MAX_AUDIT_BLOB_BYTES:
            eligible_ids.append(fields[0])
    object_ids = eligible_ids
    if not object_ids:
        return {}
    result = subprocess.run(
        ["git", "cat-file", "--batch"],
        cwd=repo,
        input=("\n".join(object_ids) + "\n").encode("ascii"),
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError("git batch object read failed")
    output = result.stdout
    cursor = 0
    texts: dict[str, str | None] = {}
    for object_id in object_ids:
        header_end = output.find(b"\n", cursor)
        if header_end < 0:
            break
        header = output[cursor:header_end].decode("ascii", errors="replace").split()
        cursor = header_end + 1
        if len(header) < 3:
            texts[object_id] = None
            continue
        size = int(header[2])
        payload = output[cursor : cursor + size]
        cursor += size
        if cursor < len(output) and output[cursor : cursor + 1] == b"\n":
            cursor += 1
        if header[1] != "blob":
            texts[object_id] = None
            continue
        if b"\0" in payload:
            texts[object_id] = None
            continue
        try:
            texts[object_id] = payload.decode("utf-8")
        except UnicodeDecodeError:
            texts[object_id] = None
    return texts


def _first_reachable_commit(repo: Path, ref: str, blob_sha: str) -> str | None:
    commits = _run(repo, ["log", "--reverse", "--format=%H", f"--find-object={blob_sha}", ref]).splitlines()
    return commits[0] if commits else None


def _finding_for_text(
    *,
    text: str,
    ref: str,
    commit_sha: str | None,
    blob_sha: str | None,
    path: str,
    approved: set[str],
) -> Iterable[AuditFinding]:
    for finding in iter_private_content(text):
        fingerprint = _fingerprint(finding.category, finding.value)
        yield AuditFinding(
            category=finding.category,
            ref=ref,
            commit_sha=commit_sha,
            blob_sha=blob_sha,
            path=path,
            line=finding.line,
            fingerprint=fingerprint,
            classification=("known" if fingerprint in approved else "new") if approved else None,
        )


def audit_refs(
    repo: Path,
    refs: list[str],
    approved: set[str] | None = None,
    path_prefixes: list[str] | None = None,
) -> list[AuditFinding]:
    approved = approved or set()
    findings: list[AuditFinding] = []
    seen: set[tuple[str, str | None, str, str]] = set()
    for ref in refs:
        _run(repo, ["rev-parse", "--verify", ref])
        objects = _reachable_objects(repo, ref)
        if path_prefixes:
            normalized = [prefix.rstrip("/") + "/" for prefix in path_prefixes]
            objects = [(object_id, path) for object_id, path in objects if any(path.startswith(prefix) for prefix in normalized)]
        blob_ids = [object_id for object_id, _path in objects]
        texts = _batch_blob_texts(repo, blob_ids)
        commit_by_blob: dict[str, str | None] = {}
        for blob_sha, path in objects:
            text = texts.get(blob_sha)
            if text is None:
                continue
            if blob_sha not in commit_by_blob:
                commit_by_blob[blob_sha] = _first_reachable_commit(repo, ref, blob_sha)
            for finding in _finding_for_text(
                text=text,
                ref=ref,
                commit_sha=commit_by_blob[blob_sha],
                blob_sha=blob_sha,
                path=path,
                approved=approved,
            ):
                key = (finding.category, finding.blob_sha, finding.path, finding.fingerprint)
                if key in seen:
                    continue
                seen.add(key)
                findings.append(finding)
    return sorted(
        findings,
        key=lambda finding: (
            finding.ref,
            finding.path,
            finding.line if finding.line is not None else 0,
            finding.category,
            finding.fingerprint,
        ),
    )


def audit_issue_comments(
    repo: Path, repository: str, issue_number: int, approved: set[str] | None = None
) -> list[AuditFinding]:
    approved = approved or set()
    result = subprocess.run(
        ["gh", "api", f"repos/{repository}/issues/{issue_number}/comments", "--paginate", "--slurp"],
        cwd=repo,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Issue comment read failed for #{issue_number}")
    pages = json.loads(result.stdout or "[]")
    comments = [comment for page in pages for comment in page] if pages else []
    findings: list[AuditFinding] = []
    seen: set[tuple[str, str, int, str]] = set()
    for comment in comments:
        comment_id = str(comment.get("id", "unknown"))
        body = str(comment.get("body") or "")
        path = f"issues/{issue_number}/comments/{comment_id}"
        for finding in _finding_for_text(
            text=body,
            ref=f"issue-{issue_number}",
            commit_sha=None,
            blob_sha=None,
            path=path,
            approved=approved,
        ):
            key = (finding.category, finding.path, finding.line or 0, finding.fingerprint)
            if key in seen:
                continue
            seen.add(key)
            findings.append(finding)
    return sorted(findings, key=lambda finding: (finding.path, finding.line or 0, finding.category, finding.fingerprint))


def main() -> int:
    parser = ArgumentParser(description="Audit reachable public AI forensics text surfaces without checkout.")
    parser.add_argument("--repo", required=True, type=Path)
    parser.add_argument("--ref", action="append", required=True)
    parser.add_argument("--issue", action="append", type=int, default=[])
    parser.add_argument("--repository", default="samuray-games/AsyncScene")
    parser.add_argument("--approved-fingerprint", action="append", default=[])
    parser.add_argument("--path-prefix", action="append", default=[])
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()

    repo = args.repo.resolve()
    approved = set(args.approved_fingerprint)
    findings = audit_refs(repo, args.ref, approved, args.path_prefix or None)
    for issue_number in args.issue:
        findings.extend(audit_issue_comments(repo, args.repository, issue_number, approved))
    findings = sorted(
        findings,
        key=lambda finding: (finding.ref, finding.path, finding.line or 0, finding.category, finding.fingerprint),
    )
    if args.as_json:
        print(json.dumps([finding.as_dict() for finding in findings], ensure_ascii=True, sort_keys=True, indent=2))
    else:
        for finding in findings:
            fields = finding.as_dict()
            print("finding " + " ".join(f"{key}={fields[key]}" for key in fields))
        print(f"finding_count={len(findings)}")
    return 1 if findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
