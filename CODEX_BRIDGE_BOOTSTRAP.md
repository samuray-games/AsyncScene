# One-time Codex bridge bootstrap

BOOTSTRAP_ID: ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V2_1
PURPOSE: Install persistent user-level Codex instructions so the exact commands `мост 1`, `мост 2`, and `мост 3` always resolve to their fixed Asynchronia bridge slots, even when the local checkout is behind remote `main`.

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
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_1_BEGIN -->
## Asynchronia numbered mailbox commands

The exact trimmed commands `мост 1`, `мост 2`, and `мост 3` are reserved for repository `samuray-games/AsyncScene` and must be processed before any other interpretation.

1. Parse the slot number as exactly 1, 2, or 3. The former bare `мост` command and older phrase are superseded.
2. Confirm the current working directory belongs to `samuray-games/AsyncScene` by inspecting `origin`. Otherwise return `BLOCKED_WRONG_REPOSITORY`.
3. Fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge` without switching or rewriting the primary worktree.
4. Read the authoritative entry point with `git show origin/main:BRIDGE.md`.
5. Read mailbox state with `git show origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md`.
6. Follow Bridge Protocol 2.1 exactly and use only the requested fixed slot. Never claim or continue another slot.
7. A new Codex thread claims only the unclaimed lane assigned to its numbered slot. A thread with an existing valid claim continues only that same slot.
8. Claim, preflight, `CONTINUE`, runtime approval and outbox are separate phases. A claim authorizes no primary write.
9. If the lane requests `MODEL_PREFLIGHT_ONLY`, return only the requested preflight and the standalone fenced `CONTINUE` block.
10. After same-thread `CONTINUE`, refetch and verify the same slot, claim, task, baseline, scope and dependencies before execution.
11. Publish only the exact immutable claim or outbox path authorized by the slot, using the fail-closed mailbox branch guard.
12. At completion, tell the user to return to ChatGPT and write the same numbered command. Do not ask the user to paste the report.
13. Follow runtime-safety-gate, parallel-scope-planner, native permission prompts, exact scope and user-owned Safari acceptance. These aliases bypass none of them.
14. If any required source cannot be read, return `BLOCKED_BRIDGE_SOURCE_UNAVAILABLE` with the exact missing source and make no change.
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_1_END -->
```

## Migration from older managed blocks

1. Read the selected instruction file fully.
2. Create a timestamped backup before the first change.
3. Replace exactly one complete V1 or V2 managed block with exactly one V2.1 block.
4. If exactly one complete V2.1 block exists, replace it in place only when contents differ.
5. If no managed block exists, append one blank line and the V2.1 block.
6. If markers are incomplete, duplicated or mixed ambiguously, return `BLOCKED_MALFORMED_EXISTING_ALIAS` and make no change.
7. Do not leave bare `мост`, the older phrase, or previous bridge managed blocks as active aliases.
8. Write atomically where supported and preserve permissions.

## Validation

After writing:

1. re-read the selected instruction file;
2. confirm exactly one V2.1 begin marker and one V2.1 end marker;
3. confirm no active V1 or V2 bridge managed block remains;
4. confirm all three numbered commands are present;
5. confirm bare `мост` is not an active bridge command;
6. confirm all content outside the managed block matches the pre-write file;
7. report Codex home, selected file, created/updated status, backup path, marker counts, changed paths and validation result;
8. do not claim the current Codex thread reloaded the instruction. It takes effect in new Codex threads.

## Final user action

After PASS, instruct the user to open three new Codex threads in the AsyncScene project and write one command in each:

- thread 1: `мост 1`
- thread 2: `мост 2`
- thread 3: `мост 3`

Each thread must claim only its fixed Stage 6 lane and return that lane's requested preflight.
