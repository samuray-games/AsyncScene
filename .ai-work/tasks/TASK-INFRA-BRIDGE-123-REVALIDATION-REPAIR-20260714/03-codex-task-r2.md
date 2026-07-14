Use @asynchronia plugin.

TASK_ID: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714
PIPELINE_VERSION: 1.0.3
PHASE: CODEX_TASK
STATUS: READY_FOR_CODEX
CREATED_AT: 2026-07-14T02:48:00+09:00
AUTHOR_ROLE: WORK
SOURCE_REVISION: MEMORY_REV 2026-07-14-1257-JST / origin-main c8e6b0668f39bbc49055bf3638ac2236c5fd4e15

PLUGIN_AUTO_ROUTING: REQUIRED
MODEL_PREFLIGHT_PAUSE: REQUIRED
WORKTREE_LIFECYCLE: REQUIRED
WORKTREE_DISCLOSURE: IMMEDIATE_AND_CLIENT_INDEPENDENT

### Atomic goal

Harden the repository side of Bridge Protocol 4.0 so the required slot-local publication policy has one canonical source, missing or mismatched policy fails closed, mailbox STATE can be checked against repository snapshots, and a deterministic three-slot repair manifest is ready for independent review.

This task does not publish mailbox artifacts and does not resume Stage 6.

### Exact baseline

- Main baseline: `c8e6b0668f39bbc49055bf3638ac2236c5fd4e15`
- Work branch: `work/bridge-123-revalidation-repair-20260714-r2`
- Implementation branch: `infra/bridge-123-revalidation-repair-20260714-r2`
- Memory revision: `2026-07-14-1257-JST`
- Slot 1 mailbox head: `6727450e193053c8da8162f427404b1473f85d70`
- Slot 2 mailbox head: `7421761f12126e88047fb2e6cd1c89490129a9c9`
- Slot 3 mailbox head: `f9ebb33c7319b498307669c0d240f9eb05db8494`

Before mutation, refetch current main and stop with `BLOCKED_BASELINE_DRIFT` if the implementation branch is not based on the exact baseline or if the task package is missing.

### Allowed reads

- `AGENTS.md`
- `AGENTS.override.md`
- `PROCESS_ROOT_SYNC.md`
- `ORCHESTRATION.md`
- `BRIDGE.md`
- `.ai-work/README.md`
- `.ai-work/SCHEMA.md`
- `tools/bridge_v4_contract.py`
- `tools/test_bridge_v4_contract.py`
- `tools/bridge_v4_authority_check.py`
- `tools/test_bridge_v4_authority_check.py`
- `tools/validate-orchestration-policy.py`
- `.ai-memory/bridges/1.md`
- `.ai-memory/bridges/2.md`
- `.ai-memory/bridges/3.md`
- the three current numbered mailbox STATE files and only the inbox and claim named by each STATE
- current task-branch ancestry and changed-path evidence

Cross-slot reads are authorized only for this explicit three-slot audit and repair task.

### Allowed writes

- `AGENTS.md`
- `AGENTS.override.md`
- `PROCESS_ROOT_SYNC.md`
- `ORCHESTRATION.md`
- `BRIDGE.md`
- `BRIDGE_PUBLICATION_POLICY.md`
- `BRIDGE_REPAIR_MANIFEST_20260714.md`
- `tools/bridge_v4_contract.py`
- `tools/test_bridge_v4_contract.py`
- `tools/bridge_v4_authority_check.py`
- `tools/test_bridge_v4_authority_check.py`
- `tools/validate-orchestration-policy.py`
- `.ai-work/tasks/TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714/STATE.md`

### Forbidden changes

- No numbered mailbox ref writes.
- No `.ai-bridge/**` repository writes.
- No direct `main` writes.
- No game, runtime, UI, economy, persistence, battle, NPC, smoke-registry or deployed-mirror changes.
- No Stage 6 implementation or status promotion.
- No AI Forensics changes.
- No execution, replay, rebase, cherry-pick or integration of `bridge/2/BRIDGE-20260711-091`.
- No deletion or rewriting of historical bridge artifacts.
- No reuse of old bridge-reset acceptance.

### Dependencies

- Installed Asynchronia 1.0.9 was confirmed after Codex restart.
- Current model inventory must be freshly discovered and reconciled with the active Codex UI.
- The user must select the recommended model and effort and send exact same-thread `CONTINUE` before mutation.
- Mailbox publication remains a separate ChatGPT-owned phase after independent review.

### Implementation requirements

1. Add `BRIDGE_PUBLICATION_POLICY.md` as the canonical source for slot-local publication rules.
2. Define deterministic slot rendering so each mailbox policy is bound to exactly one slot and mailbox ref.
3. Reconcile root authority documents so they consistently reference the canonical policy and slot-local rendered copy.
4. Extend `tools/bridge_v4_contract.py` with fail-closed checks for:
   - missing policy;
   - wrong slot or mailbox ref in policy;
   - policy and STATE identity mismatch;
   - forbidden cross-slot references;
   - repository snapshot and STATE mismatch;
   - invalid available-state identity.
5. Add positive and negative unit tests for all new checks.
6. Extend authority and orchestration validation so the missing-policy defect cannot recur silently.
7. Add `BRIDGE_REPAIR_MANIFEST_20260714.md` containing:
   - exact observed main and mailbox heads;
   - stale Slot 1 and rejected Slot 2 identities preserved as history;
   - exact fresh read-only canary identities for generations 2, 15 and 1;
   - exact serialized post-review mailbox publication order;
   - exact final closure rule to `AVAILABLE` only after independent canary review;
   - exact repository snapshot and live-memory synchronization order.
8. Do not modify bridge snapshots yet. The manifest must state that snapshots change only after verified mailbox publication.
9. Update this task `STATE.md` to `READY_FOR_REVIEW` only after every required check passes.

### Validation commands

Run and report exact outputs for:

- `python3 tools/bridge_v4_authority_check.py`
- `python3 -m unittest tools.test_bridge_v4_authority_check`
- `python3 -m unittest tools.test_bridge_v4_contract`
- `python3 tools/validate_ai_work_pipeline.py`
- `python3 tools/validate-orchestration-policy.py`
- every new deterministic command added for publication-policy and snapshot checks
- `git diff --check`

Also prove:

- exact changed paths equal the allowed write list subset;
- no runtime path changed;
- no mailbox ref moved;
- current main and all three mailbox heads were refetched after validation.

### Required final report

Return:

- status;
- selected model and effort with evidence classification;
- inspected files;
- changed files;
- tests and exact results;
- failures;
- missing coverage;
- implementation branch head and parent;
- exact changed paths;
- main and three mailbox heads after final refetch;
- Safari status `N/A`;
- exact next action: independent ChatGPT review before any mailbox publication.

### Stop conditions

Stop without mutation or without status promotion if:

- model inventory reconciliation is incomplete;
- baseline or task package drifted;
- any required write falls outside scope;
- a runtime file would change;
- a mailbox ref write is required during this phase;
- canonical policy rendering is ambiguous;
- any required validator fails;
- exact current remote heads cannot be proven.
