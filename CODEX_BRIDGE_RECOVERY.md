# Codex Bridge Recovery

RECOVERY_ID: ASYNCHRONIA_BRIDGE_RECOVERY_V2_2
STATUS: USER_LEVEL_CONFIGURATION_ONLY

Use this recovery when a Codex thread:

- says `мост 1`, `мост 2`, or `мост 3` is unknown;
- recognizes only the older bridge phrase;
- asks what a numbered command means;
- blocks because local `AGENTS.md` or `BRIDGE.md` is dirty;
- reports `BLOCKED_PLUGIN_NOT_LOADED` only because native loader telemetry is unavailable.

## Exact recovery procedure

1. Verify the repository origin is `samuray-games/AsyncScene`.
2. Fetch `origin/main` without switching, cleaning or rewriting the worktree.
3. Read:

```bash
git show origin/main:AGENTS.override.md
git show origin/main:AGENTS.md
git show origin/main:BRIDGE.md
git show origin/main:CODEX_BRIDGE_BOOTSTRAP.md
```

4. Execute the current bootstrap contract against the active user-level Codex instruction file.
5. Preserve every repository file exactly as found, including unfinished local `AGENTS.md` and `BRIDGE.md` edits.
6. Do not create a bridge claim or outbox during recovery.
7. Do not run a model preflight during recovery.
8. Validate the V2.2 managed block exactly as required by `CODEX_BRIDGE_BOOTSTRAP.md`.

## Plugin recovery check

After installing the managed block, verify that current remote policy permits either:

- `NATIVE_RESOLVER_PROOF`; or
- `FUNCTIONAL_INVOCATION_PROOF` with complete skill output contracts.

Native loader telemetry being unavailable is not a failure by itself.

## Successful final report

Return:

- `status: PASS_BRIDGE_RECOVERY_INSTALLED`;
- repository root;
- dirty repository paths preserved;
- selected user-level instruction file;
- backup path;
- installed bootstrap id;
- marker counts;
- repository changed files: `None`;
- mailbox changed files: `None`;
- exact next action: close this thread and create three fresh Codex threads for `мост 1`, `мост 2`, and `мост 3`.

## Failure behavior

- Wrong repository: `BLOCKED_WRONG_REPOSITORY`.
- Missing remote policy: `BLOCKED_BRIDGE_SOURCE_UNAVAILABLE`.
- Native permission refusal: `BRIDGE_RECOVERY_PERMISSION_REQUIRED`.
- Malformed existing managed blocks: `BLOCKED_MALFORMED_EXISTING_ALIAS`.

Never repair these failures by modifying repository files.
