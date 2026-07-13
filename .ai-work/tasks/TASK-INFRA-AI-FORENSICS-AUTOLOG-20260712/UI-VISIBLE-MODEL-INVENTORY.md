TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.6
PHASE: UI_VISIBLE_MODEL_INVENTORY
STATUS: PREFLIGHT_REQUIRED
CREATED_AT: 2026-07-13T12:00:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/ai-forensics-autolog-20260712@b2077a417551240bd91ea5b9c401682b50e9e80c

### User-confirmed active Codex UI picker

The user directly reported the following selectable models and effort labels in the active Codex UI.

- 5.4 Mini: Light, Medium, High, Extra High
- 5.4: Light, Medium, High, Extra High
- 5.5: Light, Medium, High, Extra High
- 5.6 Luna: Light, Medium, High, Extra High, Max
- 5.6 Terra: Light, Medium, High, Extra High, Max, Ultra
- 5.6 Sol: Light, Medium, High, Extra High, Max, Ultra

Total authoritative UI-visible model-effort pairs: 29.

### Authority

For this task, the list above is the complete authoritative selectable inventory. Do not run model discovery and do not add models or effort labels from app-server, CLI catalogs, caches, API documentation, repository memory, or previous reports.

### Required preflight

Evaluate all 29 pairs against the exact r3 correction task in `03-codex-task-r3.md`.

The task includes privacy-sensitive sanitization, concurrent hook safety, turn identity, durable state transitions, publication ordering, retry idempotency, GitHub Actions authentication, immutable forensic publication, regression tests, and corrected smoke evidence.

Use official current Codex rate-card and model-family evidence only for relative cost and capability. Do not invent unsupported numeric effort multipliers.

Treat `5.4 High` as unavailable for this execution attempt because the user received a capacity error for that pair.

Stop at `WAITING_FOR_MODEL_SELECTION` and require a new exact same-thread `CONTINUE` after the user selects the recommendation.

### Expected frontier check

The preflight must explicitly compare at minimum:

- 5.6 Luna at its lowest plausibly reliable effort;
- 5.6 Terra at its lowest plausibly reliable effort;
- 5.6 Sol at its lowest plausibly reliable effort;
- 5.5 at its lowest plausibly reliable effort;
- 5.4 fallback options excluding unavailable 5.4 High;
- all 5.4 Mini pairs.

Do not assume the cheapest model is reliable merely because it is selectable.

### Forbidden action

Before the user selects the fresh recommendation and sends exact same-thread `CONTINUE`:

- do not implement r3;
- do not edit repository files;
- do not create or modify worktrees;
- do not commit, push, publish packages, or comment on Issue 224;
- do not enable hooks;
- do not touch bridges, Stage 6, runtime, economy, persistence, deployment mirrors, or main.
