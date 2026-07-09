# Codex Remote-First Bootstrap

BOOTSTRAP_VERSION: 2026-07-09-02
BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

## Purpose

Break stale-local-policy and stale-remote-tracking loops without changing the user's primary worktree.

## Exact procedure

```bash
ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$ROOT" || exit 1
git remote get-url origin
git ls-remote --heads origin refs/heads/main refs/heads/coordination/chatgpt-codex-bridge
git fetch --no-tags --prune origin \
  +refs/heads/main:refs/remotes/origin/main \
  +refs/heads/coordination/chatgpt-codex-bridge:refs/remotes/origin/coordination/chatgpt-codex-bridge
git rev-parse refs/remotes/origin/main
git rev-parse refs/remotes/origin/coordination/chatgpt-codex-bridge
TMP="$(mktemp)"
git show origin/main:tools/bridge-slot-envelope.py > "$TMP"
python3 "$TMP" --repo "$ROOT" --slot 1 --mode resolve
rm -f "$TMP"
git status --short --branch
```

Use the requested slot instead of `1`.

## Prohibited fetch form

Do not use a source-only fetch form. It does not prove that the remote-tracking refs later read by the bridge were updated.

## Required result

- the working tree remains byte-for-byte untouched;
- local branch and HEAD remain unchanged;
- remote-tracking refs equal `ls-remote`;
- resolver returns `BRIDGE_CONTRACT_RESOLVED` for the requested slot.

Successful status: `PASS_REMOTE_FIRST_BOOTSTRAPPED`.
