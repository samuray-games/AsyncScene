TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PHASE: CHAT_BRIEF
STATUS: READY_FOR_WORK
AUTHOR_ROLE: CHATGPT
BASELINE_MAIN: d449d00200e8b40f6448b49892e954b9f4f00f14
WORK_BRANCH: work/model-selector-ui-authority-20260713
IMPLEMENTATION_BRANCH: infra/model-selector-ui-authority-20260713
EXECUTION_CLASS: CHATGPT_WORK

## Goal

Repair the Asynchronia model-selector contract so actual desktop UI selectability is authoritative when the local app-server catalog is stale, schema-incompatible, cached, or otherwise inconsistent with the active picker.

## Proven trigger

The AI Forensics r4 preflight used the normal active profile and stopped before mutation. The active desktop UI exposed 29 selectable model-effort pairs, including the 5.6 family and newer effort labels. The app-server returned only 12 legacy pairs and reported a cache schema incompatibility with a newer effort value.

The current root AGENTS.md and model-selector 1.0.8 incorrectly equate app-server model/list output with the active desktop picker.

## Accepted decisions

- For Codex desktop tasks, the active UI picker is authoritative for actual model and effort selectability.
- App-server model/list remains useful supporting catalog evidence, but is not automatically picker authority.
- A cache error, schema error, or UI mismatch marks app-server inventory as untrusted for selection.
- When no direct UI-reading capability exists, exact user-confirmed UI inventory from the current thread is the per-run fallback authority.
- User-confirmed inventory must be explicit, complete, current, and surface-specific.
- Preserve UI labels exactly. Do not normalize Light to low, Extra High to xhigh, or infer internal identifiers.
- No static repository whitelist and no fixed pair count may be introduced.
- Temporary replacement profile directories remain forbidden for picker discovery.
- When reconciliation is required and no valid UI inventory is available, stop and request it. Do not recommend a model and do not emit CONTINUE.
- Once a valid UI inventory is supplied, evaluate that exact matrix, stop at WAITING_FOR_MODEL_SELECTION, and require exact same-thread CONTINUE before mutation.

## Exact write scope

- AGENTS.md
- plugins/asynchronia/skills/model-selector/SKILL.md
- plugins/asynchronia/.codex-plugin/plugin.json
- .agents/plugins/marketplace.json
- tools/validate-asynchronia-auto-model-preflight.py
- .ai-work/tasks/TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713/STATE.md

## Version

Bump plugin source, marketplace entry, and validator expectation from 1.0.8 to 1.0.9.

## Forbidden

- No main write.
- No AI Forensics implementation change.
- No hooks enablement.
- No bridge path or bridge ref change.
- No Stage 6, runtime, UI runtime, economy, persistence, deployment, or mirror change.
- No static model list copied from the current UI.
- No permanent bootstrap-model exception.

## Acceptance criteria

- Root policy distinguishes desktop UI selectability from app-server catalog evidence.
- The selector has an explicit reconciliation state and fail-closed mismatch path.
- User-confirmed UI inventory is accepted only as current per-run evidence, never as repository memory.
- Exact display labels remain intact.
- App-server cache/schema errors cannot silently downgrade the candidate matrix.
- The validator rejects the old claim that model/list alone proves picker visibility.
- The validator rejects static fallback inventories and fixed denominators.
- Existing same-thread continuation, scope revalidation, and cost-frontier rules remain intact.
- Required validators pass.
- Installed plugin parity is checked after integration; duplicate stale plugin entries are removed or disabled so only the refreshed 1.0.9 instance remains active.

## Next action

Execute the exact Work plan on the implementation branch, validate, push, and return READY_FOR_REVIEW. Do not integrate to main in the same step.
