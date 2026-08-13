MEMORY_REV: 2026-08-13-2100-JST

## CURRENT_PROJECT_STATE
- Task 1 is CLOSED after user Safari PASS.
- Task 2 is CLOSED after PR #336 and PR #337 merge, live convergence, and user Safari PASS.
- Behavioral telemetry v1 is merged through PR #342 at `main@31edf9f1c0bed7508befbc7140fb15d091ac9ade`.
- Public Pages serves the exact merged telemetry bytes and a live Chromium smoke passed with transport disabled and zero non-GET requests.
- User Safari acceptance for telemetry v1 is pending; parser hardening PR #340 remains separate.

# Current Memory

MEMORY_REV: 2026-08-13-2100-JST
NOTION_MEMORY_REV: 2026-08-13-2100-JST
CURRENT_STATUS: BEHAVIORAL_TELEMETRY_V1_MERGED_DEPLOYED / SAFARI_PENDING_USER
ACTIVE_TASK: BEHAVIORAL_TELEMETRY_V1_SAFARI_ACCEPTANCE
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: 31edf9f1c0bed7508befbc7140fb15d091ac9ade
CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: 31edf9f1c0bed7508befbc7140fb15d091ac9ade
ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: 31edf9f1c0bed7508befbc7140fb15d091ac9ade
LATEST_MERGED_RUNTIME_HEAD: 31edf9f1c0bed7508befbc7140fb15d091ac9ade
STAGE_6: COMPLETE / AUTOMATIC_AND_HUMAN_RUNTIME_ACCEPTANCE_PASS
STAGE_7: CLOSED / ACCEPTED_HISTORICAL_RUNTIME
STAGE_7_7: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_8: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_9: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_10: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_11: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_12: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_13: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE7_13_PAGES_BUILD: 1136872912 / built / no error
STAGE7_13_USER_VERDICT: PASS / IPHONE_SAFARI
STAGE7_13_RUNTIME_MERGE_SHA: 69a1137c6ab4ede2a0d1e420cde477f29b0b2949
STAGE_7_14: COMPLETE / DURABLE_AFTERMATH_DM_CONTACT_USER_SAFARI_ACCEPTED
STAGE7_12_PAGES_BUILD: 1135514616 / built / no error
STAGE7_12_USER_VERDICT: PASS / IPHONE_SAFARI
STAGE7_12_MERGE_SHA: 4e27aa0d690127c7b495c9c690026f7bf58c621a
STAGE7_11_PAGES_BUILD: 1134942356 / built / no error
STAGE7_11_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_SESSIONS
STAGE7_10_PAGES_BUILD: 1134900395 / built / no error
STAGE7_10_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_SESSIONS
PRODUCT_FREEZE: ACTIVE
BEHAVIORAL_TELEMETRY_V1: PR_342_MERGED / PAGES_CURRENT / PUBLIC_CHROMIUM_PASS / SAFARI_PENDING_USER
TELEMETRY_PRIVACY: RANDOM_PSEUDONYMOUS_IDS / NO_PLAYER_TEXT_OR_PROFILE_DATA / NETWORK_OFF_BY_DEFAULT
TELEMETRY_STORAGE: LOCAL_1000_EVENTS_30_DAYS / EXPORT_READBACK_SUMMARY_AVAILABLE
RUNTIME: PUBLISHED / USER_SAFARI_ACCEPTANCE_PENDING_FOR_TELEMETRY_V1
NEXT_ACTION: USER_RUN_BEHAVIORAL_TELEMETRY_V1_SAFARI_ACCEPTANCE

Canonical bootstrap: fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY`, page ID `3a0815ae-752f-8139-945e-e38dfefbb111`, URL https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111. Report the exact top-level `MEMORY_REV`, then fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF` and current repository primary evidence. The former Google Drive document remains a deprecated migration stub.

Current runtime authority is `main@31edf9f1c0bed7508befbc7140fb15d091ac9ade`. PR #342 adds production `Game.Telemetry` schema v1 with privacy-safe ordered events, foreground dwell, bounded local persistence, export/readback, explicit Stage 7 and argument-battle instrumentation, and default-disabled opt-in network transport. GitHub Pages serves byte-identical telemetry runtime and a public Chromium smoke passed. User Safari acceptance remains pending for this exact artifact.

Parser hardening PR #340 is separate defensive parsing work and must not be conflated with real-player behavioral telemetry.
