# Asynchronia Protocol 2.2 Override

OVERRIDE_VERSION: BRIDGE_PROTOCOL_2_2

Read root `AGENTS.md` fully. Every rule in it remains binding except the bridge-command and plugin-load clauses explicitly replaced below.

## 1. Numbered bridge commands

The exact commands `мост 1`, `мост 2`, and `мост 3` are unambiguous reserved commands. Never ask what they mean and never redirect them to the older alias.

For every numbered command:

1. fetch `origin/main` before trusting local bridge files;
2. read `git show origin/main:AGENTS.override.md` and `git show origin/main:BRIDGE.md`;
3. fetch `origin/coordination/chatgpt-codex-bridge`;
4. use only the requested fixed slot;
5. never fall through to another slot.

The former bare `мост` is inactive. The older phrase may be used only for one-time compatibility recovery under `CODEX_BRIDGE_RECOVERY.md`, not for normal task routing.

## 2. Self-healing stale alias

A stale user-level alias or dirty local `AGENTS.md` / `BRIDGE.md` must not cause clarification.

When stale behavior is detected:

- read current remote `CODEX_BRIDGE_BOOTSTRAP.md` and `CODEX_BRIDGE_RECOVERY.md` with `git show origin/main:...`;
- preserve all local repository changes;
- do not stash, reset, clean, overwrite, commit or push local dirty files;
- repair only the managed user-level Codex instruction block;
- continue the current thread using remote Protocol 2.2;
- a dirty worktree is not a blocker because recovery owns no repository path.

The numbered command authorizes only that narrow user-level configuration repair. If native permissions prevent it, return `BRIDGE_RECOVERY_PERMISSION_REQUIRED` with the exact blocked path.

## 3. Claim ordering

For a new bridge thread:

1. recover the alias when needed;
2. prove Asynchronia plugin availability;
3. verify the requested slot is still unclaimed;
4. create the exact immutable claim;
5. return the model preflight.

The claim path and claim token are separate fields. A filesystem path is never a claim token. No claim is written when plugin proof fails.

## 4. Functional plugin proof

Native loader telemetry is preferred but not mandatory.

Plugin availability is proven by either:

- `NATIVE_RESOLVER_PROOF`: current-thread resolver/UI evidence names the Asynchronia package and invoked skills; or
- `FUNCTIONAL_INVOCATION_PROOF`: the current thread invokes the required Asynchronia skills and returns their exact output contracts.

A valid functional proof for bridge preflight must include:

- `plugin package: asynchronia`;
- manifest version from `plugins/asynchronia/.codex-plugin/plugin.json`;
- `proof mode: FUNCTIONAL_INVOCATION_PROOF`;
- exact invoked skills;
- complete `task-router` output contract;
- `runtime-safety-gate` verdict;
- `parallel-scope-planner` contract when multiple slots exist;
- complete `model-selector` contract with `evaluated pair count: 12/12`;
- native telemetry recorded as `NATIVE_TELEMETRY_UNAVAILABLE` when unavailable.

Reading skill files, listing skill names or paraphrasing the inbox without returning those contracts is not proof. Missing native telemetry alone is not a failure.

Return `BLOCKED_PLUGIN_NOT_LOADED` only when neither proof mode succeeds. A blocked response must contain no claim, no outbox, no primary edit and no `CONTINUE` block.

## 5. Preflight validity

A valid `MODEL_PREFLIGHT_ONLY` response contains the actual claim token, claim path, plugin proof, required routing/gate/planner contracts and complete model-selector output. It ends with exactly one fenced `CONTINUE` block and nothing after it.

A response that says `BLOCKED_PLUGIN_NOT_LOADED` and still includes `CONTINUE` is invalid and must not be continued.
