# One-time Codex bridge bootstrap

BOOTSTRAP_ID: ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V2
PURPOSE: Install a persistent user-level Codex instruction so the exact command `мост` always resolves to the current Asynchronia parallel mailbox workflow, even when the local checkout is behind remote `main`.

## Scope

This is a one-time Codex user-configuration task. It is not a product task.

Allowed writes:
- the active user-level Codex instruction file under `${CODEX_HOME:-$HOME/.codex}`;
- one timestamped backup beside that file if it already exists;
- the exact claim or outbox path authorized by an active bootstrap lane.

Forbidden writes:
- product repository files;
- `TASKS.md`, `PROJECT_MEMORY.md`, runtime/UI files, deployed mirrors, locks or dependencies;
- broad approval, sandbox or permission-policy changes.

## Required discovery

1. Determine Codex home as `${CODEX_HOME:-$HOME/.codex}`.
2. Inspect without exposing secrets:
   - `$CODEX_HOME/AGENTS.override.md`;
   - `$CODEX_HOME/AGENTS.md`.
3. Select the active global instruction file exactly as Codex does:
   - use `AGENTS.override.md` if it exists as a regular file;
   - otherwise use `AGENTS.md`, creating it only if absent.
4. Do not create `AGENTS.override.md` merely for this bootstrap.
5. Preserve all existing contents byte-for-byte outside the managed block.

## Managed block

Install or replace exactly one block delimited by these markers:

```markdown
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_BEGIN -->
## Asynchronia mailbox command

When the user's trimmed message is exactly `мост`, this command is reserved for repository `samuray-games/AsyncScene` and must be processed before any other interpretation.

1. Confirm the current working directory belongs to `samuray-games/AsyncScene` by inspecting `origin`. Otherwise return `BLOCKED_WRONG_REPOSITORY`.
2. Fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge` without switching or rewriting the primary worktree.
3. Read the authoritative bridge entry point with `git show origin/main:BRIDGE.md`.
4. Read mailbox state with `git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md`.
5. Follow Bridge Protocol 2.0 exactly. A new Codex thread atomically claims the first eligible unclaimed lane. A thread with an existing valid claim continues only that lane.
6. Never ask the user which lane to choose and never reinterpret `мост` as a mirror audit, file comparison or generic bridge check.
7. Claim, preflight, `CONTINUE`, runtime approval and outbox are separate phases. A claim authorizes no primary write.
8. If the lane requests `MODEL_PREFLIGHT_ONLY`, return only the requested preflight and the standalone fenced `CONTINUE` block.
9. After same-thread `CONTINUE`, refetch and verify the same claim, task, baseline, scope and dependencies before execution.
10. Publish only the exact immutable claim or outbox path authorized by the lane, using the fail-closed mailbox branch guard.
11. Do not ask the user to relay preflight or final reports. ChatGPT reads all lane results when the user writes `мост` there.
12. Follow runtime-safety-gate, parallel-scope-planner, native permission prompts, exact scope and user-owned Safari acceptance. This alias bypasses none of them.
13. If any required source cannot be read, return `BLOCKED_BRIDGE_SOURCE_UNAVAILABLE` with the exact missing source and make no change.
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_END -->
```

## Migration from V1

1. Read the selected instruction file fully.
2. Create a timestamped backup before the first change.
3. If exactly one complete V1 managed block exists, replace it with exactly one V2 block.
4. If exactly one complete V2 block exists, replace it in place only when contents differ.
5. If neither block exists, append one blank line and the V2 block.
6. If markers are incomplete, duplicated or mixed ambiguously, return `BLOCKED_MALFORMED_EXISTING_ALIAS` and make no change.
7. Do not leave the former command as an active alias.
8. Write atomically where supported and preserve permissions.

## Validation

After writing:

1. re-read the selected instruction file;
2. confirm exactly one V2 begin marker and one V2 end marker;
3. confirm no active V1 managed block remains;
4. confirm the full V2 block is present;
5. confirm all content outside the managed block matches the pre-write file;
6. report Codex home, selected file, created/updated status, backup path, marker counts, changed paths and validation result;
7. do not claim the current Codex thread reloaded the instruction. It takes effect in a new Codex thread.

## Final user action

After PASS, instruct the user to open up to three new Codex threads in the AsyncScene project and write only:

`мост`

Each new thread must atomically claim a different open Stage 6 lane and return that lane's requested preflight.
