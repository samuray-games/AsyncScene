---
name: economy-invariant-audit
description: Audit a proposed, implemented, or tested Asynchronia economy change against canonical economy invariants without editing implementation or approving runtime work.
---

# Economy Invariant Audit (Claude Code wrapper)

Canonical skill: `plugins/asynchronia/skills/economy-invariant-audit/SKILL.md`. Read that file in full before acting and follow it exactly. This wrapper adds no project rules of its own and is not a summary of the canonical skill.

When applying it in Claude Code:

- Repository authority remains `AGENTS.override.md`, `AGENTS.md` and `ORCHESTRATION.md`. If they conflict with the canonical skill, they prevail and the conflict is reported.
- Do not substitute product names mechanically. Read each mention of Codex in context:
  - Rules on what an implementer or evidence producer may claim, own or do bind Claude Code equally whenever it is the implementer, because `AGENTS.md` makes Claude Code and Codex peer implementers under the same scope, safety and review rules.
  - Rules about Codex models, reasoning effort, Codex-credit costs, `.codex/` configuration, Codex sandbox modes or Codex agent-team routing remain Codex-specific. They neither configure nor authorize anything in Claude Code, and Claude Code does not change them.
- Statements in a skill are instructions, not technical permission boundaries. Claude-side model and tool restrictions come only from `.claude/agents/*.md` and `.claude/settings.json` where those exist.
- User-owned evidence (runtime, Safari, owner decisions) stays user-owned; never claim or upgrade it.
