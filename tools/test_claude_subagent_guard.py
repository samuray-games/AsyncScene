#!/usr/bin/env python3
"""Static and negative tests for the Claude subagent roles and PreToolUse guard.

These tests only feed synthetic hook JSON to the guard on stdin. Denied
commands are never executed, and nothing contacts a remote resource.
"""

from __future__ import annotations

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AGENTS = ROOT / ".claude" / "agents"
GUARD = ROOT / ".claude" / "hooks" / "subagent-guard.mjs"
SETTINGS = ROOT / ".claude" / "settings.json"

# Owner-approved matrix (Notion R319).
APPROVED = {
    "explorer": ("claude-haiku-5-5", "low"),
    "researcher": ("claude-sonnet-5-5", "medium"),
    "tester": ("claude-sonnet-5-5", "medium"),
    "reviewer": ("claude-opus-5-5", "medium"),
    "critical-reviewer": ("claude-opus-5-5", "high"),
}
READ_ONLY_ROLES = ("explorer", "researcher", "reviewer", "critical-reviewer")
# Tools that write, execute, delegate, load more tools or reach other sessions.
NEVER_FOR_READERS = {
    "Bash", "Write", "Edit", "NotebookEdit", "Agent", "Task", "Skill", "ToolSearch",
    "SendMessage", "TaskCreate", "TaskUpdate", "TaskStop", "CronCreate", "CronDelete",
    "EnterWorktree", "ExitWorktree", "Artifact", "ArtifactData", "ArtifactComments",
    "PushNotification", "SendUserFile", "Monitor",
}
READ_MCP = re.compile(
    r"^mcp__github__(get_[a-z_]+|list_[a-z_]+|pull_request_read|issue_read)$"
)
WRITE_MCP_SAMPLES = [
    "mcp__github__create_pull_request", "mcp__github__merge_pull_request",
    "mcp__github__push_files", "mcp__github__create_or_update_file",
    "mcp__github__delete_file", "mcp__github__actions_run_trigger",
    "mcp__github__add_issue_comment", "mcp__github__pull_request_review_write",
    "mcp__Notion__notion-update-page", "mcp__Notion__notion-create-pages",
    "mcp__claude-code-remote__create_session", "mcp__claude-code-remote__update_environment",
    "mcp__Claude_Docs__update", "mcp__Google_Drive__create_file",
]


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not match:
        raise AssertionError(f"no frontmatter: {path}")
    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        key, _, value = line.partition(":")
        fields[key.strip()] = value.strip()
    return fields


def tool_list(fields: dict[str, str]) -> list[str]:
    return [t.strip() for t in fields.get("tools", "").split(",") if t.strip()]


def run_guard(payload: object | str) -> subprocess.CompletedProcess[str]:
    data = payload if isinstance(payload, str) else json.dumps(payload)
    return subprocess.run(
        ["node", str(GUARD)], input=data, capture_output=True, text=True, timeout=20, check=False
    )


def guard_role_tools() -> dict[str, list[str]]:
    out = subprocess.run(
        ["node", str(GUARD), "--print-role-tools"], capture_output=True, text=True, timeout=20, check=True
    )
    return json.loads(out.stdout)["roles"]


def guard_harness_return_tools() -> list[str]:
    out = subprocess.run(
        ["node", str(GUARD), "--print-role-tools"], capture_output=True, text=True, timeout=20, check=True
    )
    return json.loads(out.stdout)["harnessReturn"]


class AgentDefinitionTests(unittest.TestCase):
    def test_exact_role_set_and_names(self) -> None:
        files = sorted(p.stem for p in AGENTS.glob("*.md"))
        self.assertEqual(files, sorted(APPROVED))
        for role in APPROVED:
            self.assertEqual(frontmatter(AGENTS / f"{role}.md")["name"], role)

    def test_models_and_effort_match_owner_matrix(self) -> None:
        for role, (model, effort) in APPROVED.items():
            fields = frontmatter(AGENTS / f"{role}.md")
            self.assertEqual(fields.get("model"), model, role)
            self.assertEqual(fields.get("effort"), effort, role)

    def test_every_role_has_explicit_allowlist_and_no_escalation_fields(self) -> None:
        for role in APPROVED:
            fields = frontmatter(AGENTS / f"{role}.md")
            self.assertTrue(tool_list(fields), f"{role} must not inherit all tools")
            for forbidden in ("mcpServers", "hooks", "skills", "isolation", "background"):
                self.assertNotIn(forbidden, fields, f"{role} declares {forbidden}")
            self.assertEqual(fields.get("permissionMode"), "dontAsk", role)

    def test_readers_have_no_bash_write_delegation_or_dynamic_tools(self) -> None:
        for role in READ_ONLY_ROLES:
            tools = set(tool_list(frontmatter(AGENTS / f"{role}.md")))
            self.assertFalse(tools & NEVER_FOR_READERS, f"{role}: {tools & NEVER_FOR_READERS}")
            for tool in tools:
                if tool.startswith("mcp__"):
                    self.assertRegex(tool, READ_MCP, f"{role} has non-read MCP tool")

    def test_tester_has_only_local_tools(self) -> None:
        tools = tool_list(frontmatter(AGENTS / "tester.md"))
        self.assertEqual(sorted(tools), sorted(["Read", "Grep", "Glob", "Bash"]))

    def test_guard_allowlists_match_agent_frontmatter(self) -> None:
        roles = guard_role_tools()
        self.assertEqual(sorted(roles), sorted(APPROVED))
        for role, tools in roles.items():
            self.assertEqual(sorted(tools), sorted(tool_list(frontmatter(AGENTS / f"{role}.md"))), role)


class SettingsTests(unittest.TestCase):
    def test_guard_registered_for_every_tool(self) -> None:
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        entries = settings["hooks"]["PreToolUse"]
        commands = [
            (entry.get("matcher"), hook["command"])
            for entry in entries for hook in entry["hooks"] if hook.get("type") == "command"
        ]
        self.assertIn(("*", 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/subagent-guard.mjs"'), commands)

    def test_session_wide_remote_and_publish_denies(self) -> None:
        deny = set(json.loads(SETTINGS.read_text(encoding="utf-8"))["permissions"]["deny"])
        for rule in ("Bash(* --remote *)", "Bash(* --remote)", "Bash(*wrangler deploy*)",
                     "Bash(*wrangler secret*)", "Bash(*wrangler login*)", "Bash(npm publish*)"):
            self.assertIn(rule, deny)
        self.assertNotIn("allow", json.loads(SETTINGS.read_text(encoding="utf-8"))["permissions"])


class GuardNegativeTests(unittest.TestCase):
    def assert_denied(self, payload: object | str) -> None:
        result = run_guard(payload)
        self.assertEqual(result.returncode, 2, f"{payload!r} -> {result.stdout} {result.stderr}")
        self.assertIn("ASYNCHRONIA_GUARD_DENY", result.stderr)

    def assert_allowed(self, payload: object) -> None:
        result = run_guard(payload)
        self.assertEqual(result.returncode, 0, f"{payload!r} -> {result.stderr}")
        self.assertEqual(result.stdout, "")

    def test_main_session_and_other_agents_pass_through(self) -> None:
        self.assert_allowed({"tool_name": "Bash", "tool_input": {"command": "git push"}})
        self.assert_allowed({"agent_type": "general-purpose", "tool_name": "Write", "tool_input": {}})

    def test_readers_denied_everything_outside_allowlist(self) -> None:
        for role in READ_ONLY_ROLES:
            for tool in sorted(NEVER_FOR_READERS) + WRITE_MCP_SAMPLES:
                self.assert_denied({"agent_type": role, "tool_name": tool, "tool_input": {}})

    def test_readers_allowed_their_read_tools(self) -> None:
        for role, tools in guard_role_tools().items():
            for tool in tools:
                if tool != "Bash":
                    self.assert_allowed({"agent_type": role, "tool_name": tool, "tool_input": {}})

    def test_explorer_has_no_network_or_mcp(self) -> None:
        for tool in ("WebFetch", "WebSearch", "mcp__github__get_file_contents", "mcp__Notion__notion-fetch"):
            self.assert_denied({"agent_type": "explorer", "tool_name": tool, "tool_input": {}})

    def test_no_role_has_session_dependent_notion_tools(self) -> None:
        for role in APPROVED:
            self.assert_denied({"agent_type": role, "tool_name": "mcp__Notion__notion-fetch", "tool_input": {}})
            self.assertFalse([t for t in tool_list(frontmatter(AGENTS / f"{role}.md")) if "Notion" in t], role)

    def test_every_role_can_hand_back_its_report(self) -> None:
        # Regression: fresh-session probe showed the guard denied SubagentHandback,
        # so no guarded subagent could return a report.
        self.assertEqual(guard_harness_return_tools(), ["SubagentHandback"])
        for role in APPROVED:
            self.assert_allowed({"agent_type": role, "tool_name": "SubagentHandback", "tool_input": {"report": "x"}})

    def test_tester_denied_write_tools_and_mcp(self) -> None:
        for tool in ["Write", "Edit", "NotebookEdit", "Agent", "Skill", "ToolSearch", "WebFetch"] + WRITE_MCP_SAMPLES:
            self.assert_denied({"agent_type": "tester", "tool_name": tool, "tool_input": {}})

    def test_tester_denied_bash_shapes(self) -> None:
        denied = [
            "git push origin HEAD",
            "git -C . push",
            "git commit -m x",
            "git checkout main",
            "git reset --hard",
            "git diff --output=/tmp/x",
            "git log --ext-diff",
            "git -c core.pager=sh log",
            "node -e 1",
            "node --eval 1",
            "node --test --import=./x.mjs tools/a.mjs",
            "node --test ../outside/test.mjs",
            "node --test /etc/passwd.js",
            "node gameplay-server/test/wrangler_d1_local_test.mjs --remote",
            "npx wrangler d1 execute DB --remote --command x",
            "/opt/asynchronia-tools/node_modules/.bin/wrangler deploy",
            "wrangler d1 migrations apply DB --remote",
            "curl https://example.invalid",
            "rm -rf gameplay-server",
            "python3 -c 1",
            "python3 tools/other.py",
            "python3 -m pip install x",
            "node --test tools/a.mjs; git push",
            "node --test tools/a.mjs && git push",
            "node --test tools/a.mjs | sh",
            "node --test $(git push)",
            "node --test `git push`",
            "git log > /tmp/out",
            "WRANGLER_BIN=x node gameplay-server/test/a.mjs",
            "git log\ngit push",
            "git diff 'x'",
            "",
        ]
        for command in denied:
            self.assert_denied({"agent_type": "tester", "tool_name": "Bash", "tool_input": {"command": command}})

    def test_tester_denied_sandbox_bypass(self) -> None:
        self.assert_denied({"agent_type": "tester", "tool_name": "Bash",
                            "tool_input": {"command": "git status", "dangerouslyDisableSandbox": True}})

    def test_tester_allowed_local_test_shapes(self) -> None:
        allowed = [
            "node --test gameplay-server/test/social_vote_contract_test.mjs",
            "node --test telemetry-receiver/test/worker.test.mjs",
            "node --check gameplay-server/src/worker.js",
            "node gameplay-server/test/wrangler_d1_local_test.mjs",
            "node gameplay-server/test/private_api_local_test.mjs",
            "node scripts/run-asyncscene-smoke.mjs smokeToneProfilesStep37Final",
            "python3 -m unittest tools.test_claude_subagent_guard",
            "python3 -m unittest discover -s gameplay-server/test -p test_*.py -v",
            "python3 tools/validate-orchestration-policy.py",
            "git status --short",
            "git diff origin/main...HEAD --stat",
            "git log --oneline -5",
            "git rev-parse HEAD",
        ]
        for command in allowed:
            self.assert_allowed({"agent_type": "tester", "tool_name": "Bash", "tool_input": {"command": command}})

    def test_fail_closed_on_bad_input_for_guarded_roles(self) -> None:
        self.assert_denied("not json")
        self.assert_denied({"agent_type": "explorer"})
        self.assert_denied({"agent_type": "tester", "tool_name": "Bash", "tool_input": {"command": 7}})
        self.assert_denied({"agent_type": "tester", "tool_name": "Bash"})


if __name__ == "__main__":
    unittest.main()
