TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PIPELINE_VERSION: 1.0.5
PHASE: INDEPENDENT_REVIEW_FINAL
STATUS: ACCEPTED_SOURCE_PENDING_INTEGRATION
CREATED_AT: 2026-07-13T16:55:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: d32d107a2b477f272ef34f72b221a0d775409c88

### Evidence inspected

- Exact correction launch head `4444f7c1f5a0a4cb9239771768997094ab382aaa`.
- Validator-only commit A `fb8fafd624a5b2aec3728325ac251bb9236b6f22`.
- STATE-only commit B and exact remote head `d32d107a2b477f272ef34f72b221a0d775409c88`.
- Full validator correction diff, final task STATE, branch parity, main parity, and reported task-scoped validation evidence.

### Scope verification

PASS.

- Commit A changes only `tools/validate-asynchronia-auto-model-preflight.py`.
- Commit B changes only this task `STATE.md`.
- The implementation branch is exactly `d32d107a2b477f272ef34f72b221a0d775409c88`.
- `main` remains exactly `d449d00200e8b40f6448b49892e954b9f4f00f14`.
- No bridge, AI Forensics implementation, hook, Stage 6, runtime, economy, persistence, deployment, or mirror path changed.

### Acceptance criteria results

- Mandatory app-server catalog evidence state: PASS.
- Direct discovery-to-verified bypass rejection: PASS.
- Mandatory UI reconciliation path: PASS.
- Missing app-server evidence rejection: PASS.
- Cross-thread UI inventory rejection: PASS.
- Cross-task UI inventory rejection: PASS.
- Wrong-launch UI inventory rejection: PASS.
- Stale and incomplete UI inventory rejection: PASS.
- Exact UI label preservation: PASS.
- App-server-only candidate exclusion: PASS.
- Complete pair enumeration and adjacent effort logic preserved: PASS.
- Same-thread continuation binding and terminal fence preserved: PASS.
- Plugin version remains `1.0.9`: PASS.
- Final task evidence records the validator implementation commit: PASS.

### Test results

Blocking selector validator, Python compile, and diff check were reported exit `0`. Independent source review confirms the corrected executable state machine and reconciliation fixtures now model the 1.0.9 policy rather than bypassing it.

The frozen Bridge 062 validator remains structurally inapplicable to this branch. The AI Work pipeline validator remains baseline debt with `41` diagnostics at both baseline and candidate and zero new diagnostics.

### Runtime status

NOT_INSTALLED_YET.

Source acceptance does not prove installed-plugin parity. The locally installed Codex plugin must not be called refreshed until after serialized integration to `main`, explicit plugin refresh, duplicate cleanup, and post-refresh parity verification.

### Findings

No blocking findings remain in the reviewed source correction.

### Verdict

ACCEPTED_SOURCE_PENDING_INTEGRATION.

The selector 1.0.9 source is accepted for serialized fast-forward integration. Do not resume AI Forensics r4 until integration and installed-plugin parity are complete.

### Exact next action

Execute `07-codex-integration-task.md` from the exact source branch head supplied in the launch prompt. Fast-forward `main` only if `main` still equals `d449d00200e8b40f6448b49892e954b9f4f00f14` and the source branch is a strict descendant. Then refresh the installed Asynchronia plugin to 1.0.9, remove the stale duplicate entry, restart Codex, and verify installed/source parity before unblocking AI Forensics r4.
