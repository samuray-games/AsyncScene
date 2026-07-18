"""Repository validator for AI forensics surfaces."""

from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path
import json
import sys

REQUIRED_HOOK_EVENTS = {
    "SessionStart",
    "UserPromptSubmit",
    "PostToolUse",
    "SubagentStart",
    "SubagentStop",
    "Stop",
}


def validate_repo(repo_root: Path) -> list[str]:
    errors: list[str] = []
    for path in (
        repo_root / ".codex" / "hooks.json",
        repo_root / ".ai-forensics" / "README.md",
        repo_root / ".ai-forensics" / "SCHEMA.md",
        repo_root / "tools" / "ai_forensics" / "schema.py",
        repo_root / "tools" / "ai_forensics" / "redact.py",
        repo_root / "tools" / "ai_forensics" / "package.py",
        repo_root / "tools" / "ai_forensics" / "git_evidence.py",
        repo_root / "tools" / "ai_forensics" / "codex_hook.py",
        repo_root / "tools" / "ai_forensics" / "publish.py",
        repo_root / "tools" / "ai_forensics" / "github_event.py",
        repo_root / "tools" / "ai_forensics" / "public_surface_audit.py",
        repo_root / "tools" / "test_ai_forensics.py",
        repo_root / ".github" / "workflows" / "ai-forensics-evidence.yml",
    ):
        if not path.exists():
            errors.append(f"missing required file: {path.relative_to(repo_root)}")

    hooks_path = repo_root / ".codex" / "hooks.json"
    if hooks_path.exists():
        hooks = json.loads(hooks_path.read_text(encoding="utf-8"))
        hook_map = hooks.get("hooks", {})
        missing = sorted(REQUIRED_HOOK_EVENTS - set(hook_map))
        if missing:
            errors.append(f"hooks.json missing events: {missing}")

    workflows_text = (repo_root / ".ai-memory" / "WORKFLOWS.md").read_text(encoding="utf-8")
    for required in (
        "## Work journaling workflow",
        "## `лог` review workflow",
        "AI_FORENSICS_RUN_V1",
        "AI_FORENSICS_ANALYSIS_CURSOR_V1",
    ):
        if required not in workflows_text:
            errors.append(f"WORKFLOWS.md missing {required!r}")
    workflow_text = (repo_root / ".github" / "workflows" / "ai-forensics-evidence.yml").read_text(encoding="utf-8")
    if "GITHUB_TOKEN: ${{ github.token }}" not in workflow_text:
        errors.append("ai-forensics-evidence workflow does not expose github.token as GITHUB_TOKEN")
    if "contents: write" not in workflow_text or "issues: write" not in workflow_text:
        errors.append("ai-forensics-evidence workflow missing least required write permissions")

    readme_text = (repo_root / ".ai-forensics" / "README.md").read_text(encoding="utf-8")
    for required in ("foreign-machine", "<HOME>", "retroactively", "R1", "R2", "append-only"):
        if required not in readme_text:
            errors.append(f".ai-forensics/README.md missing {required!r}")
    schema_text = (repo_root / ".ai-forensics" / "SCHEMA.md").read_text(encoding="utf-8")
    for required in ("foreign-machine", "public_surface_audit.py", "explicit authorization", "collaborator coordination"):
        if required not in schema_text:
            errors.append(f".ai-forensics/SCHEMA.md missing {required!r}")
    return errors


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("--repo", default=".")
    args = parser.parse_args()

    repo_root = Path(args.repo).resolve()
    errors = validate_repo(repo_root)
    if errors:
        print("AI_FORENSICS_VALIDATE_FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("AI_FORENSICS_VALIDATE_PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
