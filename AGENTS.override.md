# Asynchronia Protocol 2.3 Override

OVERRIDE_VERSION: BRIDGE_PROTOCOL_2_3

Read root `AGENTS.md` fully. Every rule remains binding except the bridge preflight, plugin proof, and mailbox checkout clauses explicitly replaced below.

## 1. Numbered bridge commands

The exact commands `мост 1`, `мост 2`, and `мост 3` are unambiguous reserved commands.

For every numbered command:

1. fetch `origin/main` before trusting local bridge files;
2. read `origin/main:AGENTS.override.md`, `origin/main:AGENTS.md`, and `origin/main:BRIDGE.md` with `git show`;
3. fetch `origin/coordination/chatgpt-codex-bridge`;
4. use only the requested fixed slot;
5. never ask what the command means and never fall through to another slot.

Bare `мост` is inactive. Dirty or stale local `AGENTS.md` and `BRIDGE.md` are not bridge sources and must be preserved byte-for-byte.

## 2. Asynchronia skill source

Bridge execution must not depend on hidden plugin-loader telemetry.

Resolve the Asynchronia skill contracts in this order:

1. `INSTALLED_PACKAGE`: use the installed cache when its manifest names package `asynchronia`, version `1.0.0`, and the required skill files are readable.
2. `REPOSITORY_FALLBACK`: otherwise read the corresponding skill contracts from `origin/main:plugins/asynchronia/...`.

Either source is sufficient. Record:

- `ASYNCHRONIA_SKILL_SOURCE: INSTALLED_PACKAGE` or `REPOSITORY_FALLBACK`;
- manifest version;
- exact skill paths read.

`BLOCKED_PLUGIN_NOT_LOADED`, native resolver proof, functional invocation proof, and loader telemetry are retired as bridge gates. Missing plugin telemetry must never block a numbered bridge command.

## 3. Bridge preflight

A new bridge thread must:

1. resolve its Asynchronia skill source;
2. verify the requested slot is open and unclaimed;
3. create the immutable claim;
4. return the compact bridge preflight.

The claim path and claim token are separate fields. A path is never a claim token.

The compact preflight contains:

- bridge slot, thread id, lane id, task id;
- actual claim token and claim path;
- Asynchronia skill source and version;
- task classification;
- runtime-safety verdict;
- parallel collision verdict;
- recommended model and reasoning;
- why the next cheaper option is insufficient;
- why the next stronger option is unnecessary;
- exact read scope, write scope, dependencies and blockers;
- actual active model: `USER_SELECTED_UNVERIFIED` unless externally proven.

A full 12-row model matrix is not required in bridge preflight. The selector must evaluate all 12 pairs internally and report `evaluated pair count: 12/12` plus the relevant cost frontier only.

A valid preflight ends with exactly one fenced `CONTINUE` block and nothing after it. A blocked response contains no `CONTINUE`.

## 4. Resilient mailbox write

An existing stale mailbox worktree must never block a claim or outbox.

Use one of these isolated modes:

### Mode A: clean existing mailbox checkout

Use it only when its `HEAD` already equals the freshly fetched mailbox parent and it has no changes.

### Mode B: fresh detached worktree

Preferred fallback:

1. fetch the mailbox branch and record `MAILBOX_PARENT_COMMIT`;
2. create a temporary detached worktree at that exact commit;
3. write only the authorized claim or outbox path;
4. commit in detached HEAD;
5. prove the new commit has exactly one parent equal to `MAILBOX_PARENT_COMMIT`;
6. prove its diff contains exactly the authorized path;
7. push without force using `git push origin HEAD:refs/heads/coordination/chatgpt-codex-bridge`;
8. refetch and verify the remote head equals the new commit;
9. remove the temporary worktree.

Do not update, reset, clean, delete, or reuse a stale existing mailbox worktree. If the remote head moves before push, discard only the temporary detached worktree, refetch, and retry the same slot up to three times.

Branch checkout identity is not required in detached mode. Exact parent identity, exact diff scope, non-force fast-forward push, and post-push verification are required.

## 5. Retired blockers

The following are not valid blockers for a numbered bridge command:

- unavailable native plugin telemetry;
- inability to invoke a plugin through hidden UI machinery;
- a missing local `.ai-bridge/STATE.md` path when remote STATE is readable;
- a stale existing mailbox worktree;
- unrelated dirty primary-worktree files.

Real blockers remain: wrong repository, unreadable remote policy/state, closed or already-claimed slot, primary baseline mismatch, native permission refusal, repeated mailbox race after three retries, or scope collision.
