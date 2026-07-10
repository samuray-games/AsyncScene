# Codex bridge bootstrap

BOOTSTRAP_ID: ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V2_3
PURPOSE: Keep `мост 1`, `мост 2`, and `мост 3` permanently routed to the current remote bridge protocol.
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

## Forward compatibility

An already installed V2.2 managed block is forward-compatible because it fetches `origin/main:AGENTS.override.md` and `origin/main:BRIDGE.md` before execution. It does not need reinstalling solely for Protocol 2.3.

When a V2.2 block says “Protocol 2.2”, the version declared by current remote `BRIDGE.md` wins. Current remote policy also retires plugin-loader proof as a bridge gate and permits fresh detached mailbox worktrees.
SOURCE_PLUGIN_FALLBACK_BOOTSTRAP

Install or migrate only when the user-level bridge block is absent, malformed, or does not fetch current remote policy.

## Scope

This is user-level configuration only.

Allowed writes:
- the active user-level Codex instruction file under `${CODEX_HOME:-$HOME/.codex}`;
- one timestamped backup beside it.

Forbidden writes:
- every repository file;
- mailbox claims or outboxes;
- runtime, product, task, memory, lock, or dependency files.

Preserve dirty repository files exactly. Do not stash, reset, clean, discard, commit, push, or overwrite them.

## Required discovery

1. Verify `origin` is `samuray-games/AsyncScene`.
2. Fetch `origin/main` without changing the worktree.
3. Read current `AGENTS.override.md`, `AGENTS.md`, `BRIDGE.md`, and this file with `git show origin/main:...`.
4. Determine Codex home as `${CODEX_HOME:-$HOME/.codex}`.
5. Use existing user-level `AGENTS.override.md` when present; otherwise use `AGENTS.md`.
6. Preserve all unrelated content byte-for-byte.

## Managed block

```markdown
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_3_BEGIN -->
## Asynchronia numbered mailbox commands

The exact trimmed commands `мост 1`, `мост 2`, and `мост 3` are reserved for repository `samuray-games/AsyncScene`.

1. Parse the number as exactly 1, 2, or 3. Never ask what it means.
2. Verify repository origin.
3. Fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge` without changing or cleaning the primary worktree.
4. Read current remote `AGENTS.override.md`, `AGENTS.md`, `BRIDGE.md`, and mailbox `STATE.md`.
5. Current remote policy always overrides hardcoded protocol text in older managed blocks.
6. Local dirty or stale bridge files are not sources and do not block the command.
7. Use only the requested slot.
8. Resolve Asynchronia skills from installed cache or repository fallback. Plugin-loader telemetry is never required.
9. Use the resilient detached-worktree mailbox guard when an existing mailbox worktree is stale.
10. Return actual claim token and claim path separately.
11. A blocked response contains no `CONTINUE`.
12. After valid same-thread `CONTINUE`, execute only the claimed lane and publish only its outbox.
13. At completion, tell the user to return to ChatGPT and write the same numbered command.
<!-- ASYNCHRONIA_BRIDGE_ALIAS_V2_3_END -->
```

## Migration

1. Back up the selected user-level file once.
2. Replace exactly one complete older Asynchronia bridge block with the V2.3 block.
3. If no block exists, append the V2.3 block.
4. If markers are incomplete or duplicated, return `BLOCKED_MALFORMED_EXISTING_ALIAS`.
5. Preserve all unrelated instructions and file permissions.

Successful installation status: `PASS_BRIDGE_ALIAS_V2_3_INSTALLED`.

Again: a valid installed V2.2 remote-first block does not require migration before using Protocol 2.3.

## Bridge 062 plugin-independent closed-loop correction

BRIDGE-20260710-062 uses execution epoch CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST and baseline 32513f02daf5943c41f24328e1ae251d6bc85ccc.
The terminal success action code is exactly OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND.
This lane uses plugin-independent bridge transport: source implementation acceptance and separate canary acceptance are required before closed-loop completion; plugin installation and plugin package acceptance are outside this gate.
Active STATE, inbox, claim, outbox, and receipt artifacts remain absent from main; ChatGPT publishes mailbox artifacts after independent PR verification and merge.
