TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
PIPELINE_VERSION: 1.0.5
PHASE: MODEL_INVENTORY_AUTHORITY_CORRECTION
STATUS: BLOCKED_MODEL_INVENTORY_UI_MISMATCH
CREATED_AT: 2026-07-13T11:35:00+09:00
AUTHOR_ROLE: CHATGPT
SOURCE_REVISION: infra/ai-forensics-autolog-20260712@0a767c959d9f3028ee17db10a4f3f2021aef35d9

### Invalidated preflight

The reported 20/20 preflight is invalid for model selection.

It launched codex app-server with temporary replacement values for HOME and CODEX_HOME. That was not the active user's normal Codex environment. The returned catalog included models that the user confirms are not visible in the active Codex UI.

Therefore the response must not be described as the user's picker-visible inventory and the recommendation gpt-5.3-codex high is void.

### Authority rule

For this task, the active Codex UI picker visible to the user is authoritative for selectable model availability.

model/list may be used only as supporting catalog evidence when it runs in the active user's normal environment and its entries are reconciled against the actual UI picker. Any mismatch must return BLOCKED_MODEL_INVENTORY_UI_MISMATCH.

The app-server catalog, bundled model catalog, cached catalog, API support list, and desktop UI picker are distinct surfaces and must not be conflated.

### Required next action

Do not implement r3 and do not use the previous recommendation.

In the same Codex thread:

1. Mark the previous 20/20 report and gpt-5.3-codex high recommendation invalid.
2. Do not run app-server with temporary HOME or CODEX_HOME.
3. Use the exact model names and effort options visible in the user's active Codex UI.
4. Evaluate only those UI-visible pairs for the exact r3 task.
5. Stop at WAITING_FOR_MODEL_SELECTION with a new recommendation.
6. Require a new same-thread CONTINUE after the user selects that UI-visible recommendation.

### Forbidden action

- Do not recommend any model absent from the user's UI picker.
- Do not call an app-server catalog picker-visible without UI reconciliation.
- Do not implement r3, enable hooks, publish packages, comment on Issue 224, touch bridges, continue Stage 6, or write to main before a valid UI-reconciled recommendation and new CONTINUE.
