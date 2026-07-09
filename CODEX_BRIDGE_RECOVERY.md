# Codex Bridge Recovery

RECOVERY_ID: ASYNCHRONIA_BRIDGE_RECOVERY_V3_3
STATUS: REQUIRED_FOR_PRE_V3_3_ALIAS
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

## Trigger

Run recovery once when the installed user-level managed block predates V3.3, reports a mailbox head behind `ls-remote`, reuses an old thread/outbox, contains a continuation token, or does not run the canonical resolver.

## Exact recovery

From the Asynchronia repository:

```bash
ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$ROOT" || exit 1
git fetch --no-tags --prune origin \
  +refs/heads/main:refs/remotes/origin/main \
  +refs/heads/coordination/chatgpt-codex-bridge:refs/remotes/origin/coordination/chatgpt-codex-bridge
TMP="$(mktemp)"
git show origin/main:tools/install-codex-bridge-alias.py > "$TMP"
python3 "$TMP"
rm -f "$TMP"
```

This changes only the active user-level Codex instruction file and one backup. It does not modify repository files or mailbox state.

After `PASS_BRIDGE_ALIAS_V3_3_INSTALLED`, open a fresh Codex conversation and use the numbered command. No separate continuation token is used.
