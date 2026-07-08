# Bridge Publication Policy

POLICY_VERSION: CONNECTOR_ONLY_2026_07_08
STATUS: ACTIVE
DEFAULT_PUBLICATION_MODE: CHATGPT_CONNECTOR_ONLY

## Mandatory rule

All numbered bridge lanes use `CHATGPT_CONNECTOR_ONLY` unless ChatGPT explicitly replaces this policy in both current mailbox STATE and the current baseline inbox.

Codex must not perform GitHub write operations for bridge work.

Codex must not:

- run `git push`;
- run GitHub authentication or credential setup commands;
- ask the user to authenticate or refresh credentials;
- modify remotes, credential helpers or tokens;
- run pull, merge, rebase, reset, cherry-pick or force operations to make publication possible;
- treat a diverged local branch as a publication blocker.

After implementation and validation, Codex returns:

`READY_FOR_CONNECTOR_PUBLICATION`

with a complete publication bundle containing:

- repository and destination ref;
- remote baseline SHA;
- local commit SHA and first parent when available;
- exact changed paths and intended commit message;
- complete validation results and failure arrays;
- full exact UTF-8 content plus blob SHA for every changed text file;
- base64 plus blob SHA for every changed binary file;
- exact immutable mailbox outbox payload when applicable;
- runtime and Safari status;
- one next action: return to ChatGPT and write the matching numbered bridge command.

A SHA-only report is invalid.

Inside Codex, `пуш` means “export the complete connector publication bundle”, not “attempt a network push”.

ChatGPT publishes and verifies authorized files through the GitHub connector.
