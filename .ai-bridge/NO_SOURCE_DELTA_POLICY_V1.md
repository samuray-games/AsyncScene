# Required-Write No-Delta Policy

POLICY_ID: REQUIRED_WRITE_NO_DELTA_V1
STATUS: ACTIVE_WHEN_REFERENCED_BY_STATE

When `PRIMARY_WRITE_REQUIRED: true` and `ALLOW_VERIFIED_NO_DELTA: false`:

- Codex must produce and publish a source delta inside the frozen scope unless a genuine outside-scope or external blocker exists.
- A passing pre-existing validator never proves that requested source expansion is unnecessary.
- Codex must compare current bytes against the explicit objective and acceptance requirements.
- Missing named functions, transitions, routes, controls, workflow commands or tests are direct proof that source work is required.
- `BLOCKED_NO_SOURCE_DELTA`, `NO_DELTA_REQUIRED`, `PASS_VERIFIED_NO_DELTA`, and equivalent outcomes are illegal.
- A blocker must identify the exact external or outside-scope dependency, attempted repairs and why the frozen scope cannot resolve it.
- Otherwise Codex must edit, test, commit and publish.
