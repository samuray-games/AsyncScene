# Asynchronia Protocol 2.4 Override

OVERRIDE_VERSION: BRIDGE_PROTOCOL_2_4

Read root `AGENTS.md` fully. Every rule remains binding except the bridge metadata-precedence, claim recovery, plugin proof, and mailbox checkout clauses explicitly replaced below.

## 1. Numbered bridge commands

The exact commands `мост 1`, `мост 2`, and `мост 3` are unambiguous reserved commands.

For every numbered command:

1. fetch `origin/main` before trusting local bridge files;
2. read `origin/main:AGENTS.override.md`, `origin/main:AGENTS.md`, and `origin/main:BRIDGE.md` with `git show`;
3. fetch `origin/coordination/chatgpt-codex-bridge`;
4. use only the requested fixed slot;
5. never ask what the command means and never fall through to another slot.

Bare `мост` is inactive. Dirty or stale local `AGENTS.md` and `BRIDGE.md` are not bridge sources and must be preserved byte-for-byte.

## 2. Authoritative slot metadata

Mailbox `STATE.md` names one `Current baseline inbox` for each slot. That file is the authoritative mutable slot contract.

Precedence inside a slot is:

1. current `origin/main` policy;
2. mailbox `STATE.md`;
3. the slot's `Current baseline inbox` named by STATE;
4. immutable claim, when present;
5. original task inbox only for the atomic objective and evidence requirements that are not replaced by the current baseline inbox;
6. historical inbox turns for audit only.

A stale baseline, protocol version, plugin requirement, phase, or publication rule in the original task inbox is superseded when STATE and the current baseline inbox agree. Such historical drift must be reported but must not block a claim or execution.

The current baseline inbox may explicitly replace all mutable fields while inheriting the original task objective. Never require two historical baselines to agree.

## 3. Asynchronia skill source

Bridge execution must not depend on hidden plugin-loader telemetry.

Resolve skill contracts in this order:

1. `INSTALLED_PACKAGE`: use the installed cache when its manifest names package `asynchronia`, version `1.0.0`, and the required skill files are readable.
2. `REPOSITORY_FALLBACK`: otherwise read the corresponding skill contracts from `origin/main:plugins/asynchronia/...`.

Either source is sufficient. Record the source, manifest version, and exact skill paths read.

`BLOCKED_PLUGIN_NOT_LOADED`, native resolver proof, functional invocation proof, and loader telemetry are retired as bridge gates.

## 4. Claims

A new bridge thread normally creates its own immutable claim after resolving current metadata.

ChatGPT may create a `COORDINATOR_RECOVERY_CLAIM` when:

- the slot is open and unclaimed;
- Codex already identified the correct logical thread and lane;
- claim publication failed only because Codex lacked Git credentials or hit a stale historical metadata blocker;
- the current baseline and exact claim path are known.

A coordinator recovery claim must contain:

- `CLAIM_ISSUER: CHATGPT_COORDINATOR_RECOVERY`;
- bridge slot, logical thread id, task id, lane id;
- actual high-entropy claim token;
- mailbox parent commit;
- authorized primary baseline;
- exact original task inbox and current baseline inbox;
- expected outbox;
- statement that it authorizes no primary write.

The matching logical Codex thread may adopt that remote claim by reading its token from the immutable claim file. It must not create a second local or remote claim.

The claim path and claim token are separate fields. A path is never a claim token.

## 5. Compact bridge preflight

After a valid claim exists, return:

- bridge slot, logical thread id, lane id, task id;
- actual claim token and claim path;
- Asynchronia skill source and version;
- task classification;
- runtime-safety verdict;
- parallel collision verdict;
- `evaluated pair count: 12/12`;
- recommended model and reasoning;
- why the next cheaper pair is insufficient;
- why the next stronger pair is unnecessary;
- exact read scope, write scope, dependencies and blockers;
- actual active model as `USER_SELECTED_UNVERIFIED` unless externally proven.

The full 12-row model matrix is not required. A valid preflight ends with exactly one fenced `CONTINUE` block and nothing after it. A blocked response contains no `CONTINUE`.

## 6. Resilient mailbox write

An existing stale mailbox worktree must never block a claim or outbox.

Use either:

- a clean existing mailbox checkout already at the freshly fetched parent; or
- a fresh temporary detached worktree at that exact parent.

Detached mode must create a direct-child commit, change exactly one authorized path, push without force to `coordination/chatgpt-codex-bridge`, refetch, verify the remote head, and remove only the temporary worktree.

Never reset, clean, update, delete, or reuse a stale existing mailbox worktree. Retry the same slot up to three times after races.

## 7. Publication-auth fallback

If Codex can execute the lane but cannot publish a claim or outbox solely because Git credentials are unavailable:

- do not alter the primary repository;
- preserve the local detached commit only as diagnostic evidence;
- return `BLOCKED_MAILBOX_AUTH`;
- include the complete intended immutable mailbox payload in the response;
- identify the exact authorized mailbox path;
- instruct the user to return to ChatGPT with the matching numbered bridge command and the report.

ChatGPT may independently validate and publish that exact payload through its repository connector. A local-only commit is never accepted as remote publication.

## 8. Retired blockers

These are not valid blockers:

- unavailable native plugin telemetry;
- inability to invoke hidden plugin UI machinery;
- missing local `.ai-bridge/STATE.md` when remote STATE is readable;
- stale mutable fields in an original task inbox when the current baseline inbox supersedes them;
- a stale existing mailbox worktree;
- unrelated dirty primary-worktree files.

Real blockers remain: wrong repository, unreadable current remote policy/state/baseline inbox, closed slot, claim owned by another logical thread, current primary baseline mismatch, native permission refusal, repeated mailbox race after three retries, or actual scope collision.
