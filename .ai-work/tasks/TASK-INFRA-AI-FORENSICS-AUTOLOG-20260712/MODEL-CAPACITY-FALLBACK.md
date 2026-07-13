TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.4
PHASE: MODEL_CAPACITY_FALLBACK
STATUS: CORRECTION_REQUIRED
CREATED_AT: 2026-07-13T10:00:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/ai-forensics-autolog-20260712@c03c05407a22dfb9814a90a21c07834f15d70375

### Trigger

The previously recommended pair `gpt-5.4 high` returned the user-visible capacity error: `Selected model (5.4 High) is at capacity. Please try a different model.`

The user temporarily selected Mini Light. That manual switch is `USER_SELECTED_UNVERIFIED` and does not authorize implementation.

### Authority correction

The r3 instruction not to rerun model preflight applied only while the prior recommendation and selected execution pair remained materially unchanged.

Model capacity failure is a material availability change. Under the repository model-selector state machine, the task returns to `PREFLIGHT_REQUIRED`. The previous recommendation and previous `CONTINUE` do not authorize a different model-effort pair.

### Required read-only action

In the same Codex thread:

1. Do not mutate repository files, create a worktree, validate implementation, publish forensic packages, enable hooks, commit, or push.
2. Resolve the Asynchronia plugin. If the installed attachment is unavailable, use `plugins/asynchronia/skills/model-selector/SKILL.md` from the exact remote launch head.
3. Run a fresh live inventory through `codex app-server` and `model/list`.
4. Analyze the exact r3 task in `03-codex-task-r3.md`.
5. Record `gpt-5.4 high` as unavailable for this execution attempt due to the observed capacity error. Do not silently recommend it again unless the current interface proves availability during the new preflight.
6. Evaluate the full current picker-visible matrix. Do not assume Mini Light is sufficient merely because it can be selected.
7. Recommend the lowest expected total-cost reliable currently available fallback.
8. Stop at `WAITING_FOR_MODEL_SELECTION`.
9. Require a new exact same-thread `CONTINUE` after the user selects the new recommended pair because the prior `CONTINUE` belonged to a materially different recommendation and inventory state.

### Forbidden action

- Do not begin r3 implementation on Mini Light before the fresh recommendation and new same-thread `CONTINUE`.
- Do not invoke or reference the removed `runtime-safety-gate`.
- Do not touch `.ai-bridge/**`, bridge refs, Stage 6, game runtime, UI runtime, economy, persistence, deployment mirrors, or `main`.
- Do not enable `/hooks`.

### Required report

Return the complete model-selector report, including:

- status `WAITING_FOR_MODEL_SELECTION`;
- live inventory timestamp and source;
- complete evaluated pair count `N/N`;
- exact task identity and r3 scope;
- explicit treatment of the capacity failure;
- Mini Light task-fit classification;
- recommended available fallback pair;
- actual active model as `USER_SELECTED_UNVERIFIED`;
- one standalone fenced `CONTINUE` instruction with no text after it.
