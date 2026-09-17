# Codex Bridge Recovery

RECOVERY_ID: ASYNCHRONIA_BRIDGE_RECOVERY_V2_4
STATUS: OPTIONAL_ALIAS_REPAIR_ONLY
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

Recovery is unnecessary when the installed user-level block already recognizes `мост 1`, `мост 2`, and `мост 3`, fetches current remote policy, and does not contradict same-thread `CONTINUE` safety.

Do not run recovery merely because:

- external loader telemetry is unavailable;
- hidden UI machinery is unavailable;
- a local `.ai-bridge/STATE.md` path is absent;
- an existing mailbox worktree is stale;
- local repository files are dirty.

Current remote bridge policy handles those conditions directly.

Use recovery only when a numbered command is not recognized or the user-level bridge block does not fetch current remote policy.

## Optional repair procedure

1. Verify repository origin is `samuray-games/AsyncScene`.
2. Fetch `origin/main` without changing the worktree.
3. Read current `AGENTS.override.md`, `AGENTS.md`, `BRIDGE.md`, and `CODEX_BRIDGE_BOOTSTRAP.md` with `git show origin/main:...`.
4. Execute the current bootstrap against the active user-level Codex instruction file.
5. Preserve every repository file exactly as found.
6. Do not create a claim, continuation state, outbox, or repository commit during recovery.

Successful status: `PASS_BRIDGE_ALIAS_V2_4_INSTALLED`.

After successful repair, open fresh numbered bridge threads. When an installed V2.2 block is present and remote-first, skip recovery and open fresh threads immediately.

## Bridge 062 closed-loop correction

BRIDGE-20260710-062 uses execution epoch CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST and baseline 32513f02daf5943c41f24328e1ae251d6bc85ccc.
The terminal success action code is exactly OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND.
This lane uses bridge transport: source implementation acceptance and separate canary acceptance are required before closed-loop completion.
Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main; ChatGPT publishes mailbox artifacts after independent PR verification and merge.
