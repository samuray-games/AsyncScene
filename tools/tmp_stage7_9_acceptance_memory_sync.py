from pathlib import Path
import re

REV = "2026-08-06-1011-JST"
MAIN_SHA = "89561d9c8cb50d72e6f383ed0dcc214c4ed28318"
NEXT = "IMPLEMENT_STAGE7_10_ACCUSE_KEN_BRANCH_TACTICAL_PAYOFFS_IN_FIRST_REAL_BATTLE"


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    out, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return out

# TASKS.md - prepend accepted runtime state.
tasks_path = "TASKS.md"
tasks = read(tasks_path)
entry = f'''## 2026-08-06 - Stage 7.9 deny evidence payoff Safari acceptance
- User returned explicit `PASS` for both deny-branch paths in iPhone Safari private mode.
- Accepted runtime: PR #295 squash merge `{MAIN_SHA}`.
- Accepted shared path: evidence shown to Настя reveals Райхан's first real-battle attack color automatically.
- Accepted held path: one exactly-once `Показать доказательство` action reveals the color manually; refresh preserves the reveal and does not restore the action.
- Accepted boundary: ordinary battles do not inherit Stage 7 evidence behavior.
- Validation evidence: implementation run `31035128757` PASS; PR forensics `31035185978` PASS; post-merge forensics `31035264535` PASS; Pages build `1134342833` built without error.
- NEXT_ACTION: `{NEXT}`.

'''
if not tasks.startswith(entry):
    tasks = entry + tasks
write(tasks_path, tasks)

# PROJECT_MEMORY.md - replace compact current section and bootstrap summary.
project_path = "PROJECT_MEMORY.md"
project = read(project_path)
prefix = f'''# Current Memory Index

REPO_MEMORY_REV: {REV}
NOTION_MEMORY_REV: {REV}
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MAIN_SHA}
CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MAIN_SHA}
ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MAIN_SHA}
LATEST_MERGED_RUNTIME_HEAD: {MAIN_SHA}
ROOT_STATUS: STAGE7_ACTIVE
CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_9_USER_ACCEPTED / STAGE7_10_SELECTED
STAGE_6: COMPLETE / AUTOMATIC_AND_HUMAN_RUNTIME_ACCEPTANCE_PASS
STAGE_7: ACTIVE / CORE_EXPERIENCE_RECONSTRUCTION_ACCEPTED
STAGE_7_0: COMPLETE / ESSENCE_MODAL_ACCEPTED
STAGE_7_1: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_5: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_6: MERGED / SUPERSEDED_BEFORE_SAFARI_ACCEPTANCE
STAGE_7_7: COMPLETE / LOCKED_THREE_NPC_INTERMISSION_USER_ACCEPTED
STAGE_7_8: COMPLETE / REAL_ARGUMENT_BATTLE_BRIDGE_USER_ACCEPTED
STAGE_7_9: COMPLETE / DENY_EVIDENCE_PAYOFF_USER_ACCEPTED
STAGE7_9_MERGE_SHA: {MAIN_SHA}
STAGE7_9_VALIDATION: implementation 31035128757 PASS / PR 31035185978 PASS / postmerge 31035264535 PASS
STAGE7_9_PAGES_BUILD: 1134342833 / built / no error
STAGE7_9_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_TABS
PRODUCT_FREEZE: NO_NEW_THEME_PROFILE_CURRENCY_NPC_CATEGORY_LOCATION_OR_BROAD_SECONDARY_SUBSYSTEM_BEFORE_CORE_LOOP_USER_EVIDENCE
RUNTIME: PUBLISHED_AND_USER_ACCEPTED
NEXT_ACTION: {NEXT}

## Canonical cross-chat bootstrap

Fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY` in the current response.
Page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`
URL: https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111
Report its exact top-level `MEMORY_REV`, fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF`, then verify current repository primary evidence.
The former Google Drive document is a deprecated migration stub only, not the live authority.

Repository implementation and user acceptance are current through merged runtime `{MAIN_SHA}`. Stage 7.9 is accepted on iPhone Safari: shared evidence auto-reveals the first bridge-battle attack color, held evidence provides one exactly-once manual reveal, refresh preserves the result, and ordinary battles remain isolated.

The next atomic strategic-depth slice is Stage 7.10 for the `accuse_ken` branch. `publicRematchAccepted` must provide one persisted chance to replace the three current defense options with another canonical set before choosing. `witnessRequested` must automatically reveal Райхан's first attack color. Both effects must bind to the exact Stage 7 bridge battle, survive refresh without replay, preserve exactly three canonical defense choices, and leave economy, settlement, ordinary battles and argument canon unchanged.

'''
project = regex_once(
    project,
    r"\A# Current Memory Index\n.*?(?=Archives and backups are historical evidence\.)",
    prefix,
    "PROJECT_MEMORY compact prefix",
    re.S,
)
write(project_path, project)

# CURRENT.md - compact complete replacement.
current_path = ".ai-memory/CURRENT.md"
current = f'''# Current Memory

MEMORY_REV: {REV}
NOTION_MEMORY_REV: {REV}
CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_9_USER_ACCEPTED / STAGE7_10_SELECTED
ACTIVE_TASK: STAGE7_10_ACCUSE_KEN_BRANCH_TACTICAL_PAYOFFS
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MAIN_SHA}
CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MAIN_SHA}
ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MAIN_SHA}
LATEST_MERGED_RUNTIME_HEAD: {MAIN_SHA}
STAGE_6: COMPLETE / AUTOMATIC_AND_HUMAN_RUNTIME_ACCEPTANCE_PASS
STAGE_7: ACTIVE / CORE_EXPERIENCE_RECONSTRUCTION_ACCEPTED
STAGE_7_7: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_8: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_9: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE7_9_PAGES_BUILD: 1134342833 / built / no error
STAGE7_9_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_TABS
PRODUCT_FREEZE: ACTIVE
RUNTIME: PUBLISHED_AND_USER_ACCEPTED
NEXT_ACTION: {NEXT}

Canonical bootstrap: fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY`, page ID `3a0815ae-752f-8139-945e-e38dfefbb111`, URL https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111. Report the exact top-level `MEMORY_REV`, then fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF` and current repository primary evidence. The former Google Drive document remains a deprecated migration stub.

Stage 7.9 is merged and user-accepted at `{MAIN_SHA}`. Shared evidence auto-reveals Райхан's first real-battle attack color. Held evidence exposes one exactly-once manual reveal; refresh preserves the reveal and does not restore the action. The payoff is bound to the stable Stage 7 bridge ID and exact battle ID, so ordinary battles remain unchanged.

The next atomic runtime task is Stage 7.10 for the `accuse_ken` branch. `publicRematchAccepted` gets one persisted pre-defense option refresh while keeping exactly three canonical choices. `witnessRequested` auto-reveals the first attack color. Do not add currency, locations, broad witness systems, non-canonical arguments, settlement changes, or ordinary-battle behavior.
'''
write(current_path, current)

# CANON.md - revision, accepted slice, active next slice.
canon_path = ".ai-memory/CANON.md"
canon = read(canon_path)
canon = regex_once(
    canon,
    r"MEMORY_REVISION: .*?\nEXPECTED_REVISION: .*?\nNOTION_MEMORY_REVISION: .*?\n",
    f"MEMORY_REVISION: {REV}\nEXPECTED_REVISION: {REV}\nNOTION_MEMORY_REVISION: {REV}\n",
    "CANON revisions",
)
accepted_slice = f'''## Accepted Stage 7.9 product slice

- PR #295 is merged and user-accepted at `{MAIN_SHA}`.
- In the deny branch, shared evidence reveals Райхан's first bridge-battle attack color automatically. Held evidence provides one exactly-once manual `Показать доказательство` action.
- Reveal or expiry persists across refresh. Completed battles do not replay the payoff. Ordinary battles cannot inherit it because the effect requires the stable Stage 7 bridge ID and exact bridge battle ID.
- Static evidence: implementation run `31035128757` PASS; PR forensics `31035185978` PASS; post-merge forensics `31035264535` PASS; Pages build `1134342833` built without error.
- User evidence: explicit iPhone Safari private-tab `PASS` for shared auto reveal, held manual reveal, refresh persistence and ordinary-battle isolation.
- Stage 7.10 is selected for the `accuse_ken` branch: public rematch provides one persisted canonical defense-option refresh; witness request auto-reveals the first attack color. Both remain bridge-only and exactly once.

'''
if "## Accepted Stage 7.9 product slice" not in canon:
    canon = replace_once(canon, "## Superseding Stage 7 onboarding flow\n", accepted_slice + "## Superseding Stage 7 onboarding flow\n", "CANON Stage 7.9 insertion")
canon = replace_once(
    canon,
    "- Latest merged and user-accepted runtime implementation head is `49bb6f2802052d6783aaee608891e7c687858806`. PR #293 completed the real-battle bridge and the iPhone Safari private-tab verdict is explicit `PASS`.",
    f"- Latest merged and user-accepted runtime implementation head is `{MAIN_SHA}`. PR #295 completed the deny-branch tactical payoff and the iPhone Safari private-tab verdict is explicit `PASS`.",
    "CANON latest accepted head",
)
canon = replace_once(
    canon,
    "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 and Stage 7.8 complete the superseding onboarding and are user-accepted. The active next slice is Stage 7.9 deny-branch evidence payoff inside the first real battle.",
    "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 and Stage 7.8 complete the superseding onboarding and are user-accepted. Stage 7.9 deny-branch evidence payoff is also user-accepted. The active next slice is Stage 7.10 `accuse_ken` tactical differentiation inside the first real battle.",
    "CANON active slice",
)
canon = regex_once(canon, r"- NEXT_ACTION: `IMPLEMENT_STAGE7_9_DENY_BRANCH_EVIDENCE_PAYOFF_IN_FIRST_REAL_BATTLE`\.\s*$", f"- NEXT_ACTION: `{NEXT}`.\n", "CANON next action")
write(canon_path, canon)

# WORKFLOWS.md - revision, handoff, Stage 7 continuation rule.
workflows_path = ".ai-memory/WORKFLOWS.md"
workflows = read(workflows_path)
workflows = regex_once(
    workflows,
    r"MEMORY_REVISION: .*?\nEXPECTED_REVISION: .*?\nNOTION_MEMORY_REVISION: .*?\n",
    f"MEMORY_REVISION: {REV}\nEXPECTED_REVISION: {REV}\nNOTION_MEMORY_REVISION: {REV}\n",
    "WORKFLOWS revisions",
)
workflows = regex_once(
    workflows,
    r"Current execution handoff: .*?\n\nConversational slot shorthand:",
    f"Current execution handoff: Stage 6 is complete and accepted. Stage 7.9 deny-branch tactical payoff is merged and user-accepted at `{MAIN_SHA}`. Repository memory records the explicit iPhone Safari `PASS`. The exact next action is `{NEXT}`.\n\nConversational slot shorthand:",
    "WORKFLOWS current handoff",
    re.S,
)
workflows = replace_once(
    workflows,
    "13. Stage 7.9 starts with the deny branch: persisted evidence preparation must visibly affect the first real battle exactly once without changing ordinary battles or canonical argument rules.\n14. Expand evidence, witness, receipt, coalition or promise systems only after each narrow payoff is separately accepted.",
    "13. Stage 7.9 starts with the deny branch: persisted evidence preparation must visibly affect the first real battle exactly once without changing ordinary battles or canonical argument rules. Stage 7.9 is now user-accepted.\n14. Stage 7.10 applies the same narrow-payoff discipline to `accuse_ken`: public rematch gets one persisted canonical defense-option refresh and witness request auto-reveals the first attack color.\n15. Expand receipt, coalition, promise or broader witness systems only after each narrow payoff is separately accepted.",
    "WORKFLOWS Stage 7 continuation",
)
workflows = regex_once(workflows, r"NEXT_ACTION: IMPLEMENT_STAGE7_9_DENY_BRANCH_EVIDENCE_PAYOFF_IN_FIRST_REAL_BATTLE\s*$", f"NEXT_ACTION: {NEXT}\n", "WORKFLOWS next action")
write(workflows_path, workflows)

print("STAGE7_9_ACCEPTANCE_MEMORY_SYNC_OK")
