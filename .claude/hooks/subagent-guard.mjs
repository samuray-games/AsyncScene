#!/usr/bin/env node
// Asynchronia PreToolUse guard for the project Claude subagent roles.
//
// DEFENSE IN DEPTH ONLY. The primary restriction is each agent's explicit
// `tools` allowlist in .claude/agents/*.md. This hook re-checks every tool call
// made inside a guarded role (identified by the hook input `agent_type`) and
// denies anything outside the role allowlist. For `tester` it additionally
// limits Bash to a fixed set of local test command shapes. Pattern matching of
// shell commands is not an isolation boundary: an allowed test still executes
// repository code with the session's own operating-system privileges.
//
// Fail closed for guarded roles: any parse or evaluation error exits 2.
// Calls from the main session or from other agent types pass through unchanged
// (exit 0, no output) to the normal permission flow.
//
// This hook never writes files, never logs and never contacts the network.

import { readFileSync } from "node:fs";

const READ_LOCAL = ["Read", "Grep", "Glob"];

const GITHUB_READ = [
  "mcp__github__get_file_contents",
  "mcp__github__get_commit",
  "mcp__github__list_commits",
  "mcp__github__list_branches",
  "mcp__github__pull_request_read",
  "mcp__github__list_pull_requests",
  "mcp__github__issue_read",
  "mcp__github__list_issues",
  "mcp__github__get_check_run",
  "mcp__github__get_job_logs",
];

// Harness-provided tool a subagent uses to return its final report to the
// caller. It carries no file, shell, network or MCP capability.
export const HARNESS_RETURN_TOOLS = Object.freeze(["SubagentHandback"]);

export const ROLE_TOOLS = Object.freeze({
  explorer: Object.freeze([...READ_LOCAL]),
  researcher: Object.freeze([...READ_LOCAL, "WebFetch", "WebSearch", ...GITHUB_READ]),
  tester: Object.freeze([...READ_LOCAL, "Bash"]),
  reviewer: Object.freeze([...READ_LOCAL, ...GITHUB_READ]),
  "critical-reviewer": Object.freeze([...READ_LOCAL, ...GITHUB_READ]),
});

// Repository-relative path with no traversal, no absolute path, no options.
const REL_PATH = /^(?!-)(?!.*\.\.)[A-Za-z0-9_][A-Za-z0-9_./-]*$/;
const TEST_JS = /^(gameplay-server|telemetry-receiver|tools|scripts|AsyncScene)\/[A-Za-z0-9_./-]+\.(mjs|cjs|js)$/;
const UNITTEST_ARG = /^[A-Za-z0-9_.:/*-]+$/;
const GIT_READ_SUBCOMMANDS = new Set(["status", "diff", "log", "show", "rev-parse", "ls-files"]);
const GIT_FORBIDDEN_ARG = /^(-c|-C|--output|--ext-diff|--textconv|--exec-path|--git-dir|--work-tree|--upload-pack|--paginate)/;
// Shell metacharacters that allow chaining, substitution, redirection,
// expansion of variables, quoting tricks or multi-line commands.
const SHELL_META = /[;&|`$<>(){}\\'"\n\r\t!#~]/;

export function testerBashDecision(command) {
  if (typeof command !== "string" || command.trim() === "") return "empty command";
  if (command.length > 600) return "command too long";
  if (SHELL_META.test(command)) return "shell metacharacters are not allowed for tester";
  const argv = command.trim().split(/ +/);
  const [cmd, ...args] = argv;

  if (cmd === "node") {
    if (args[0] === "--test" || args[0] === "--check") {
      const files = args.slice(1);
      if (files.length === 0) return "node " + args[0] + " needs explicit test files";
      for (const f of files) {
        if (!REL_PATH.test(f) || !TEST_JS.test(f)) return "file not in allowed test locations: " + f;
      }
      return null;
    }
    if (args.length >= 1 && /^gameplay-server\/test\/[A-Za-z0-9_-]+\.mjs$/.test(args[0]) && args.length === 1) {
      return null;
    }
    if (args[0] === "scripts/run-asyncscene-smoke.mjs" && args.slice(1).every((a) => /^[A-Za-z0-9_]+$/.test(a))) {
      return null;
    }
    return "node invocation shape not allowed for tester";
  }

  if (cmd === "python3") {
    if (args[0] === "-m" && args[1] === "unittest" && args.slice(2).every((a) => UNITTEST_ARG.test(a))) {
      return null;
    }
    if (args.length === 1 && args[0] === "tools/validate-orchestration-policy.py") return null;
    return "python3 invocation shape not allowed for tester";
  }

  if (cmd === "git") {
    const sub = args[0];
    if (!GIT_READ_SUBCOMMANDS.has(sub)) return "git subcommand not allowed for tester: " + String(sub);
    for (const a of args.slice(1)) {
      if (GIT_FORBIDDEN_ARG.test(a)) return "git option not allowed for tester: " + a;
    }
    return null;
  }

  return "command not allowed for tester: " + String(cmd);
}

export function decide(input) {
  if (!input || typeof input !== "object") throw new Error("hook input is not an object");
  const role = input.agent_type;
  if (typeof role !== "string" || !Object.prototype.hasOwnProperty.call(ROLE_TOOLS, role)) {
    return { guarded: false };
  }
  const tool = input.tool_name;
  if (typeof tool !== "string" || tool === "") throw new Error("missing tool_name for guarded role");
  if (HARNESS_RETURN_TOOLS.includes(tool)) return { guarded: true, deny: null };
  if (!ROLE_TOOLS[role].includes(tool)) {
    return { guarded: true, deny: `tool ${tool} is outside the ${role} allowlist` };
  }
  if (tool === "Bash") {
    const ti = input.tool_input || {};
    if (ti.dangerouslyDisableSandbox === true) return { guarded: true, deny: "sandbox bypass is not allowed" };
    const reason = testerBashDecision(ti.command);
    if (reason) return { guarded: true, deny: reason };
  }
  return { guarded: true, deny: null };
}

function main() {
  if (process.argv[2] === "--print-role-tools") {
    process.stdout.write(JSON.stringify({ roles: ROLE_TOOLS, harnessReturn: HARNESS_RETURN_TOOLS }));
    return 0;
  }
  let input;
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch (error) {
    process.stderr.write("ASYNCHRONIA_GUARD_DENY: unreadable hook input\n");
    return 2;
  }
  let result;
  try {
    result = decide(input);
  } catch (error) {
    process.stderr.write("ASYNCHRONIA_GUARD_DENY: " + error.message + "\n");
    return 2;
  }
  if (!result.guarded || !result.deny) return 0;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "ASYNCHRONIA_GUARD_DENY: " + result.deny,
    },
  }));
  process.stderr.write("ASYNCHRONIA_GUARD_DENY: " + result.deny + "\n");
  return 2;
}

process.exitCode = main();
