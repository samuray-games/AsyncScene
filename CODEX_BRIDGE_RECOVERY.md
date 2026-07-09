# Codex Bridge Recovery

RECOVERY_ID: ASYNCHRONIA_BRIDGE_RECOVERY_V2_3
STATUS: OPTIONAL_ALIAS_REPAIR_ONLY
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

Protocol 2.3 does not require recovery when the installed user-level block already recognizes `мост 1`, `мост 2`, and `мост 3` and fetches current remote policy.
optional alias repair only

Do not run recovery merely because:

- plugin-loader telemetry is unavailable;
- a plugin cannot be invoked through hidden UI machinery;
- a local `.ai-bridge/STATE.md` path is absent;
- an existing mailbox worktree is stale;
- local repository files are dirty.

Current remote Protocol 2.3 handles those conditions directly.

Use recovery only when a numbered command is not recognized or the user-level bridge block does not fetch current remote policy.

## Optional repair procedure

1. Verify repository origin is `samuray-games/AsyncScene`.
2. Fetch `origin/main` without changing the worktree.
3. Read current `AGENTS.override.md`, `AGENTS.md`, `BRIDGE.md`, and `CODEX_BRIDGE_BOOTSTRAP.md` with `git show origin/main:...`.
4. Execute the current bootstrap against the active user-level Codex instruction file.
5. Preserve every repository file exactly as found.
6. Do not create a claim, outbox, model preflight, or repository commit during recovery.

Successful status: `PASS_BRIDGE_ALIAS_V2_3_INSTALLED`.

After successful repair, open fresh numbered bridge threads. When an installed V2.2 block is present and remote-first, skip recovery and open fresh threads immediately.
