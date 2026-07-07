# One-time Codex bridge bootstrap

BOOTSTRAP_ID: ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V2_2
PURPOSE: Install persistent user-level Codex instructions so `мост 1`, `мост 2`, and `мост 3` always resolve to current remote Protocol 2.2, even when local repository files are stale or dirty.

## Scope

This is a user-configuration recovery task, not a product task.

Allowed writes:
- the active user-level Codex instruction file under `${CODEX_HOME:-$HOME/.codex}`;
- one timestamped backup beside that file.

Forbidden writes:
- every repository file, including dirty local `AGENTS.md` and `BRIDGE.md`;
- mailbox claims or outboxes;
- `TASKS.md`, `PROJECT_MEMORY.md`, runtime/UI files, mirrors, locks, dependencies or permission policy.

A dirty repository worktree does not block this task. Preserve it exactly. Do not stash, reset, clean, discard, commit, push or overwrite repository files.

## Required discovery

1. Verify `origin` belongs to `samuray-games/AsyncScene`.
2. Fetch `origin/main` without switching branches or changing the worktree.
3. Read this exact current file with `git show origin/main:CODEX_BRIDGE_BOOTSTRAP.md`.
4. Determine Codex home as `${CODEX_HOME:-$HOME/.codex}`.
5. Inspect without exposing secrets:
   - `$CODEX_HOME/AGENTS.override.md`;
   - `$CODEX_HOME/AGENTS.md`.
6. Select the active user-level instruction file:
   - use `AGENTS.override.md` when it already exists as a regular file;
   - otherwise use `AGENTS.md`, creating it only if absent.
7. Do not create a user-level `AGENTS.override.md` merely for this bootstrap.
8. Preserve all content outside the managed block byte-for-byte.

## Managed block

Install or replace exactly one block:

```markdown
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_2_BEGIN -->
## Asynchronia numbered mailbox commands

The exact trimmed commands `мост 1`, `мост 2`, and `мост 3` are reserved for repository `samuray-games/AsyncScene` and must be processed before any other interpretation.

1. Parse the number as exactly 1, 2, or 3. Never ask what the command means.
2. Verify the repository origin. Otherwise return `BLOCKED_WRONG_REPOSITORY`.
3. Fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge` without switching, rewriting or cleaning the primary worktree.
4. Read current policy with:
   - `git show origin/main:AGENTS.override.md`
   - `git show origin/main:AGENTS.md`
   - `git show origin/main:BRIDGE.md`
5. Local dirty or stale `AGENTS.md` / `BRIDGE.md` files are not bridge sources and do not block the command. Preserve them exactly.
6. Follow current remote Bridge Protocol 2.2 and use only the requested fixed slot.
7. Prove the Asynchronia plugin by native resolver evidence or functional invocation evidence. Missing hidden telemetry alone is not a blocker.
8. Run alias recovery and plugin proof before creating a new slot claim.
9. Return actual claim token and claim path separately. A path is never a token.
10. A blocked response must not include `CONTINUE`.
11. After a valid preflight and same-thread `CONTINUE`, refetch and verify the same slot, claim, task, baseline, scope and dependencies.
12. Publish only the exact authorized immutable outbox.
13. At completion, tell the user to return to ChatGPT and write the same numbered command. Never ask the user to paste the report.
14. Follow runtime safety, parallel ownership, native permission prompts and user-owned Safari acceptance.
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_2_END -->
```

## Migration

1. Read the selected user-level file fully.
2. Create one timestamped backup before the first change.
3. Replace exactly one complete V1, V2 or V2.1 Asynchronia bridge managed block with the V2.2 block.
4. If exactly one V2.2 block exists, replace it only when contents differ.
5. If no bridge block exists, append one blank line and the V2.2 block.
6. If markers are incomplete, duplicated or ambiguous, return `BLOCKED_MALFORMED_EXISTING_ALIAS` and make no change.
7. Remove older Asynchronia bridge blocks as active aliases, but preserve all unrelated user instructions.
8. Write atomically where supported and preserve permissions.

## Validation

After writing:

1. re-read the selected file;
2. confirm exactly one V2.2 begin marker and one V2.2 end marker;
3. confirm no older Asynchronia bridge managed block remains active;
4. confirm all three numbered commands are present;
5. confirm the block requires remote policy, dirty-worktree preservation and functional plugin proof;
6. confirm all content outside the managed block is unchanged;
7. report selected file, backup path, marker counts, changed paths and validation result.

Successful status: `PASS_BRIDGE_ALIAS_V2_2_INSTALLED`.

The current thread may continue from fetched remote Protocol 2.2, but newly installed user-level instructions are guaranteed to load only in new Codex threads.

## Final user action

Close old bridge threads that produced clarification or `BLOCKED_PLUGIN_NOT_LOADED` with a `CONTINUE` block. Open three fresh Codex threads and write:

- `мост 1`
- `мост 2`
- `мост 3`
