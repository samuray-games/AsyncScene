# S6-ALPHA-FAIL-EVIDENCE

run_id: CODEX-20260717T000000Z-S6-ALPHA-FAIL-EVIDENCE
repo: samuray-games/AsyncScene
branch: main
head: 02ec3adfea4469e932e63e5bc9c8ae600190f1ef
origin_main: 02ec3adfea4469e932e63e5bc9c8ae600190f1ef
plugin_version: 1.0.14
sanitized: true
publication_target: forensics/ai-runs
issue_index_target: #224

## Normalized Evidence Table

| TEXT_ID | ACTION_ID | SURFACE_CATEGORY | EXACT_CURRENT_TEXT | SOURCE_PATH | SOURCE_LINE | MIRROR_PATH | MIRROR_LINE | PLACEHOLDERS | PROTECTED_TOKENS | CLASSIFICATION | STATIC_FAILURE_REASON | RUNTIME_EVIDENCE_REQUIRED | RUNTIME_EVIDENCE_DESCRIPTION | FROZEN_TARGET |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TXT_0042 | escapePaid | button | Свалить за 1💰. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/system.js | 67 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 88 | none | 💰 | ALPHA_STATIC_FAIL | Current text is the older escape phrasing; Alpha target is the action-first form in the mirrored inventory. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0071 | trainingSent | training | Аргумент: {teacher} → {student}. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/system.js | 65 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 86 | {teacher},{student} | none | ALPHA_STATIC_FAIL | Current text keeps the old ordering; Alpha target reorders the action to the end. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0091 | tie_start | menu | ТОЛПА | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 413 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 137 | none | none | STATIC_PASS | Current text matches the authoritative Alpha inventory row. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0092 | tie_call_to_action | menu | ВПИСЫВАЙСЯ | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 414 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 138 | none | none | STATIC_PASS | Current text matches the authoritative Alpha inventory row. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0093 | tie_click_name_hint | menu | ТЫКНИ ИМЯ | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 415 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 139 | none | none | STATIC_PASS | Current text matches the authoritative Alpha inventory row. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0094 | vote_ok | button | ✓ ОК | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 416 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 140 | none | ✓ | STATIC_PASS | Current text matches the authoritative Alpha inventory row. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0095 | vote_already | button | ✓ УЖЕ | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 417 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 141 | none | ✓ | STATIC_PASS | Current text matches the authoritative Alpha inventory row. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0096 | vote_fail | button | ✕ НЕ | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 418 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 142 | none | ✕ | STATIC_PASS | Current text matches the authoritative Alpha inventory row. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0141 | showVoteBtnToast | toast | Ты уже проголосовал. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/ui/ui-events.js | 856 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 187 | none | none | RUNTIME_REQUIRED | The vote button toast is emitted by live UI behavior and must be confirmed on the runtime path. | true | Live vote toast emission and button-lock state must be observed in the running UI. | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0142 | insufficient_points_vote | toast | Не хватает 💰. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/ui/ui-events.js | 898 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 188 | none | 💰 | ALPHA_STATIC_FAIL | Current vote-insufficiency toast still uses the older wording and differs from the Alpha inventory row. | true | Live vote-insufficiency toast emission must be observed in the running UI. | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0037 | reportPending | report | Проверяю. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/system.js | 60 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 83 | none | none | RUNTIME_REQUIRED | Report start behavior is emitted through runtime cop-flow behavior and is not closable from static copy alone. | true | Live report-start emission and handler routing must be observed in the running UI. | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0038 | reportTrueReward | report | Сдать {name}: +2💰. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/system.js | 61 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 84 | {name} | 💰 | ALPHA_STATIC_FAIL | The static reward line still carries the older report phrasing shape. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0039 | reportOk | report | Коп: {name} сдан, +2💰. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/system.js | 62 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 85 | {name} | 💰 | ALPHA_STATIC_FAIL | The static success line still carries the older report phrasing shape. | false | N/A | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0083 | cop_report_ok[0] | cop_flow | Проверка сошлась. Вмешался. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 448 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 129 | none | none | RUNTIME_REQUIRED | This cop-report success surface is part of live runtime messaging and must be confirmed at runtime. | true | Live report success message emission must be observed in the running UI. | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0084 | cop_report_ok[1] | cop_flow | Проверка сошлась. Занялся. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 448 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 130 | none | none | RUNTIME_REQUIRED | This cop-report success surface is part of live runtime messaging and must be confirmed at runtime. | true | Live report success message emission must be observed in the running UI. | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0085 | cop_report_fail[0] | cop_flow | Не подтвердилось. Факты не сошлись. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 449 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 131 | none | none | RUNTIME_REQUIRED | This cop-report failure surface is part of live runtime messaging and must be confirmed at runtime. | true | Live report failure message emission must be observed in the running UI. | NOT_AUTHORIZED_IN_THIS_TASK |
| TXT_0086 | cop_cooldown[0] | cop_flow | Проверка займет время. | /Users/User/Documents/created apps/AsyncScene/AsyncScene/Web/data.js | 450 | /Users/User/Documents/created apps/AsyncScene/docs/UI_PROFILE_ALPHA_WORD_INVENTORY.md | 132 | none | none | RUNTIME_REQUIRED | This cop cooldown surface is resolved through runtime warnings copy and must be confirmed live. | true | Live cooldown/warnings routing must be observed in the running UI. | NOT_AUTHORIZED_IN_THIS_TASK |

## Summary

- total row count: 17
- count by classification:
  - ALPHA_STATIC_FAIL: 5
  - RUNTIME_REQUIRED: 6
  - STATIC_PASS: 6
  - UNMAPPED_REPORT_SURFACE: 0
- list of unmapped surfaces: none

## Validators

- `python3 -m unittest tools.test_model_selector_snapshot tools.test_bridge_model_preflight`
  - output: failed with 4 stale-memory assertion failures in `tools.test_model_selector_snapshot`; `tools.test_bridge_model_preflight` passed.
- `python3 tools/validate-asynchronia-auto-model-preflight.py`
  - output: `PASS_AUTO_MODEL_PREFLIGHT`
- `python3 tools/bridge_v4_contract.py validate-command --slot 3 --mailbox-ref coordination/chatgpt-codex-bridge-3 --task-branch bridge/3/BRIDGE-20260717-S6-ALPHA-EVIDENCE`
  - output: `PASS_BRIDGE_V4_ISOLATION`

## Publication Notes

- actual worktree branch: `main`
- absolute worktree path: `/Users/User/Documents/created apps/AsyncScene`
- HEAD: `02ec3adfea4469e932e63e5bc9c8ae600190f1ef`
- origin/main: `02ec3adfea4469e932e63e5bc9c8ae600190f1ef`
- git status --short: clean
