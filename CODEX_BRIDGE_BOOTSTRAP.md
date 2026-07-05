# One-time Codex bridge bootstrap

BOOTSTRAP_ID: ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V1
PURPOSE: Install a persistent user-level Codex instruction so the exact command `проверь мост` always resolves to the Asynchronia ChatGPT-Codex mailbox workflow, even when the local repository checkout is behind remote `main`.

## Scope

This is a one-time Codex user-configuration task. It is not a product task and must not modify game/runtime files, project status documents, locks, or implementation branches.

Allowed writes:
- the active user-level Codex instruction file under `${CODEX_HOME:-$HOME/.codex}`;
- one timestamped backup of that same file in the same directory if it already exists;
- the exact bridge outbox requested by the active bootstrap mailbox task, if one exists.

Forbidden writes:
- product repository files;
- `TASKS.md`, `PROJECT_MEMORY.md`, game/runtime/UI files, deployed mirrors, locks, dependencies;
- any global Codex configuration other than the selected instruction file;
- broad approval or sandbox policy changes.

## Required discovery

1. Determine Codex home as `${CODEX_HOME:-$HOME/.codex}`.
2. Inspect, without exposing secrets:
   - `$CODEX_HOME/AGENTS.override.md`;
   - `$CODEX_HOME/AGENTS.md`.
3. Select the active global instruction file exactly as Codex does:
   - if `AGENTS.override.md` exists as a regular file, use it;
   - otherwise, use `AGENTS.md`, creating it only if absent.
4. Do not create `AGENTS.override.md` merely for this bootstrap, because it would take precedence over and hide an existing global `AGENTS.md`.
5. Preserve all existing contents byte-for-byte outside the managed block below.

## Managed block

Install or replace exactly one block delimited by these markers:

```markdown
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V1_BEGIN -->
## Asynchronia mailbox command

When the user's trimmed message is exactly `проверь мост`, this command is reserved for the repository `samuray-games/AsyncScene` and must be processed before any other interpretation.

1. Confirm the current working directory belongs to the `samuray-games/AsyncScene` Git repository by inspecting the `origin` remote. If it does not, return `BLOCKED_WRONG_REPOSITORY` and do nothing else.
2. Read the local root `AGENTS.md` if present, but do not rely on it being current.
3. Fetch, without switching or rewriting the primary worktree:
   - `origin/main`;
   - `origin/coordination/chatgpt-codex-bridge`.
4. Read the authoritative bridge entry point with:
   - `git show origin/main:BRIDGE.md`
5. Read mailbox state with:
   - `git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md`
6. Identify the sole thread listed under `Open threads` and the `Latest ChatGPT turn`.
7. Read that inbox turn from the mailbox branch with `git show`.
8. Execute only the current phase requested by that inbox.
9. Ignore every closed or superseded thread.
10. Never reinterpret `проверь мост` as a source/deployed mirror audit, file-pair comparison, runtime bridge check, or request for clarification about which bridge was meant.
11. If the active inbox requests `MODEL_PREFLIGHT_ONLY`, return only that preflight and the standalone `CONTINUE` block. Do not execute the task before same-thread `CONTINUE`.
12. After same-thread `CONTINUE`, re-fetch and re-read the same bridge state and inbox, verify they remain active and unchanged, then execute only the authorized task.
13. Do not ask the user to relay preflight or final reports between Codex and ChatGPT. Publish the required immutable outbox when the active inbox requires it.
14. Follow runtime-safety-gate, native permission prompts, exact write scope, and user-owned Safari acceptance. This alias bypasses none of them.
15. If any required ref/file cannot be read, return `BLOCKED_BRIDGE_SOURCE_UNAVAILABLE` with the exact missing source. Never substitute a nearby audit or guessed task.
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V1_END -->
```

## Installation procedure

1. Read the selected instruction file fully if it exists.
2. Create a timestamped backup beside it before the first modification.
3. If both managed markers exist, replace only the text from the begin marker through the end marker.
4. If neither marker exists, append one blank line and the managed block.
5. If only one marker exists, return `BLOCKED_MALFORMED_EXISTING_ALIAS` and make no change.
6. Write atomically where supported.
7. Do not alter permissions more broadly than necessary.

## Validation

After writing:

1. Re-read the selected global instruction file.
2. Confirm exactly one begin marker and one end marker exist.
3. Confirm the full managed block is present.
4. Confirm content outside the managed block matches the pre-write file.
5. Report:
   - Codex home path;
   - selected instruction file;
   - whether it was created or updated;
   - backup path, or `N/A - newly created`;
   - marker counts;
   - validation result;
   - changed paths.
6. Do not claim that the current Codex thread has reloaded the new global instruction. It takes effect in a new Codex thread.

## Final user action

After PASS, instruct the user to open one new Codex thread in the AsyncScene project and write only:

`проверь мост`

The new thread must then follow the global alias, fetch current remote refs, discover the sole active mailbox task, and return the requested phase.