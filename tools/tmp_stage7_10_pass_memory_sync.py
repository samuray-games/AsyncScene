from pathlib import Path

REV = "2026-08-06-1047-JST"
MERGE_SHA = "58d79c60f852adf0d8f92b1809d793d43ca484bb"
NEXT = "IMPLEMENT_STAGE7_11_PAY_BRANCH_TACTICAL_PAYOFFS_IN_FIRST_REAL_BATTLE"


def write(path: str, text: str) -> None:
    Path(path).write_text(text.rstrip() + "\n", encoding="utf-8")


def replace_once(text: str, old: str, new: str, path: str) -> str:
    if old not in text:
        raise SystemExit(f"missing anchor in {path}: {old[:120]!r}")
    return text.replace(old, new, 1)


def prepend_tasks() -> None:
    path = Path("TASKS.md")
    text = path.read_text(encoding="utf-8")
    marker = "## 2026-08-06 - Stage 7.10 accuse_ken payoff Safari acceptance"
    if marker in text:
        return
    block = f'''{marker}
- User returned explicit `PASS` for both `accuse_ken` paths in iPhone Safari private sessions.
- Accepted runtime: PR #297 squash merge `{MERGE_SHA}`.
- Accepted public-rematch path: one bridge-only `Сменить ответы` action replaces the visible three canonical defenses once; the exact sanitized replacement objects survive refresh, remain selectable and do not restore the action.
- Accepted witness path: Настя's witness reveals Райхан's first bridge-battle attack color exactly once and refresh does not duplicate the reveal.
- Accepted boundary: ordinary battles do not inherit Stage 7.10 behavior.
- Validation evidence: implementation `31062842850` PASS; persistence repair `31063239777` PASS; PR forensics `31063276985` PASS; post-merge forensics `31063319643` PASS; Pages build `1134900395` built without error.
- Stage 7.11 selected: `receiptDemanded` marks the matching canonical defense family; `pressureIgnored` exposes one persisted `Разобрать давление` action that marks one visible wrong-family defense as Олег's pressure line.
- NEXT_ACTION: `{NEXT}`.

'''
    path.write_text(block + text, encoding="utf-8")


def write_project_memory() -> None:
    write("PROJECT_MEMORY.md", f'''# Current Memory Index

REPO_MEMORY_REV: {REV}
NOTION_MEMORY_REV: {REV}
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MERGE_SHA}
CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MERGE_SHA}
ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MERGE_SHA}
LATEST_MERGED_RUNTIME_HEAD: {MERGE_SHA}
ROOT_STATUS: STAGE7_ACTIVE
CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_10_USER_ACCEPTED / STAGE7_11_SELECTED
STAGE_6: COMPLETE / AUTOMATIC_AND_HUMAN_RUNTIME_ACCEPTANCE_PASS
STAGE_7: ACTIVE / CORE_EXPERIENCE_RECONSTRUCTION_ACCEPTED
STAGE_7_0: COMPLETE / ESSENCE_MODAL_ACCEPTED
STAGE_7_1: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_5: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_6: MERGED / SUPERSEDED_BEFORE_SAFARI_ACCEPTANCE
STAGE_7_7: COMPLETE / LOCKED_THREE_NPC_INTERMISSION_USER_ACCEPTED
STAGE_7_8: COMPLETE / REAL_ARGUMENT_BATTLE_BRIDGE_USER_ACCEPTED
STAGE_7_9: COMPLETE / DENY_EVIDENCE_PAYOFF_USER_ACCEPTED
STAGE_7_10: COMPLETE / ACCUSE_KEN_TACTICAL_PAYOFFS_USER_ACCEPTED
STAGE7_10_MERGE_SHA: {MERGE_SHA}
STAGE7_10_VALIDATION: implementation 31062842850 PASS / persistence 31063239777 PASS / PR 31063276985 PASS / postmerge 31063319643 PASS
STAGE7_10_PAGES_BUILD: 1134900395 / built / no error
STAGE7_10_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_SESSIONS
PRODUCT_FREEZE: NO_NEW_THEME_PROFILE_CURRENCY_NPC_CATEGORY_LOCATION_OR_BROAD_SECONDARY_SUBSYSTEM_BEFORE_CORE_LOOP_USER_EVIDENCE
RUNTIME: PUBLISHED_AND_USER_ACCEPTED
NEXT_ACTION: {NEXT}

## Canonical cross-chat bootstrap

Fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY` in the current response.
Page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`
URL: https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111
Report its exact top-level `MEMORY_REV`, fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF`, then verify current repository primary evidence.
The former Google Drive document is a deprecated migration stub only, not the live authority.

Repository implementation and user acceptance are current through merged runtime `{MERGE_SHA}`. Stage 7.10 is accepted on iPhone Safari: public rematch provides one persisted exactly-once replacement of the three canonical defenses, witness request reveals the first bridge-battle attack color, refresh recovery works, restored choices remain selectable and ordinary battles remain isolated.

The next atomic strategic-depth slice is Stage 7.11 for the `pay` branch. `receiptDemanded` must visibly mark the defense whose canonical family matches the incoming attack. `pressureIgnored` must expose one persisted bridge-only `Разобрать давление` action that marks one currently visible wrong-family defense as Олег's pressure line. Both effects must survive refresh without replay, preserve exactly three canonical defenses, bind to the exact Stage 7 bridge battle, and leave economy, settlement, ordinary battles, conflict core/API and argument canon unchanged.

Archives and backups are historical evidence. Provider-side physical unreachable-object purge is not claimed or required for ref-reachability acceptance.''')


def write_current() -> None:
    write(".ai-memory/CURRENT.md", f'''# Current Memory

MEMORY_REV: {REV}
NOTION_MEMORY_REV: {REV}
CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_10_USER_ACCEPTED / STAGE7_11_SELECTED
ACTIVE_TASK: STAGE7_11_PAY_BRANCH_TACTICAL_PAYOFFS
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MERGE_SHA}
CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MERGE_SHA}
ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MERGE_SHA}
LATEST_MERGED_RUNTIME_HEAD: {MERGE_SHA}
STAGE_6: COMPLETE / AUTOMATIC_AND_HUMAN_RUNTIME_ACCEPTANCE_PASS
STAGE_7: ACTIVE / CORE_EXPERIENCE_RECONSTRUCTION_ACCEPTED
STAGE_7_7: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_8: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_9: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_10: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE7_10_PAGES_BUILD: 1134900395 / built / no error
STAGE7_10_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_SESSIONS
PRODUCT_FREEZE: ACTIVE
RUNTIME: PUBLISHED_AND_USER_ACCEPTED
NEXT_ACTION: {NEXT}

Canonical bootstrap: fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY`, page ID `3a0815ae-752f-8139-945e-e38dfefbb111`, URL https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111. Report the exact top-level `MEMORY_REV`, then fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF` and current repository primary evidence. The former Google Drive document remains a deprecated migration stub.

Stage 7.10 is merged and user-accepted at `{MERGE_SHA}`. Public rematch exposes one exactly-once defense replacement, persists full sanitized canonical objects and restores the exact selectable set after refresh. Witness request reveals the first bridge-battle attack color exactly once. Both effects require the stable Stage 7 bridge ID and exact battle ID, so ordinary battles remain unchanged.

The next atomic runtime task is Stage 7.11 for the `pay` branch. `receiptDemanded` marks the visible defense whose canonical family matches the incoming attack. `pressureIgnored` exposes one persisted `Разобрать давление` action that marks one visible wrong-family defense as Олег's pressure line. Do not add currency, locations, broad receipt or pressure systems, non-canonical arguments, settlement changes, conflict-core/API changes or ordinary-battle behavior.''')


def patch_canon() -> None:
    path = ".ai-memory/CANON.md"
    text = Path(path).read_text(encoding="utf-8")
    text = text.replace("MEMORY_REVISION: 2026-08-06-1011-JST", f"MEMORY_REVISION: {REV}", 1)
    text = text.replace("EXPECTED_REVISION: 2026-08-06-1011-JST", f"EXPECTED_REVISION: {REV}", 1)
    text = text.replace("NOTION_MEMORY_REVISION: 2026-08-06-1011-JST", f"NOTION_MEMORY_REVISION: {REV}", 1)
    text = replace_once(text,
        "- Stage 7.10 is selected for the `accuse_ken` branch: public rematch provides one persisted canonical defense-option refresh; witness request auto-reveals the first attack color. Both remain bridge-only and exactly once.\n",
        "- Stage 7.10 is merged and user-accepted; its stable facts are recorded in the next section.\n",
        path)
    section = f'''## Accepted Stage 7.10 product slice

- PR #297 is merged and user-accepted at `{MERGE_SHA}`.
- In the `accuse_ken` branch, public rematch provides one persisted bridge-only `Сменить ответы` action that replaces exactly three canonical defense choices once. Full sanitized canonical defense objects are persisted because generated argument IDs are unstable across refresh.
- The exact replacement set survives refresh, remains selectable through `battle._defenseChoices`, and the action does not return. Witness request reveals Райхан's first bridge-battle attack color exactly once without duplicate system copy.
- Both effects require the stable Stage 7 bridge ID and exact bridge battle ID. Ordinary battles, conflict core/API/economy/data/system, settlement and argument canon remain unchanged.
- Static evidence: implementation `31062842850` PASS; persistence repair `31063239777` PASS; PR forensics `31063276985` PASS; post-merge forensics `31063319643` PASS; Pages build `1134900395` built without error.
- User evidence: explicit iPhone Safari private-session `PASS` for public-rematch replacement, exact post-refresh restoration and selection, witness reveal and ordinary-battle isolation.
- Stage 7.11 is selected for the `pay` branch: receipt marks the matching defense family; ignored pressure exposes one persisted action that marks one wrong-family defense as Олег's pressure line. Both remain bridge-only and exactly once.

'''
    text = replace_once(text, "## Superseding Stage 7 onboarding flow\n", section + "## Superseding Stage 7 onboarding flow\n", path)
    text = replace_once(text,
        "- Latest merged and user-accepted runtime implementation head is `89561d9c8cb50d72e6f383ed0dcc214c4ed28318`. PR #295 completed the deny-branch tactical payoff and the iPhone Safari private-tab verdict is explicit `PASS`.\n",
        f"- Latest merged and user-accepted runtime implementation head is `{MERGE_SHA}`. PR #297 completed the `accuse_ken` tactical payoffs and the iPhone Safari private-session verdict is explicit `PASS`.\n",
        path)
    text = replace_once(text,
        "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 and Stage 7.8 complete the superseding onboarding and are user-accepted. Stage 7.9 deny-branch evidence payoff is also user-accepted. The active next slice is Stage 7.10 `accuse_ken` tactical differentiation inside the first real battle.\n",
        "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 through Stage 7.10 are user-accepted. The active next slice is Stage 7.11 `pay` tactical differentiation inside the first real battle.\n",
        path)
    text = text.replace("NEXT_ACTION: `IMPLEMENT_STAGE7_10_ACCUSE_KEN_BRANCH_TACTICAL_PAYOFFS_IN_FIRST_REAL_BATTLE`", f"NEXT_ACTION: `{NEXT}`")
    Path(path).write_text(text, encoding="utf-8")


def patch_workflows() -> None:
    path = ".ai-memory/WORKFLOWS.md"
    text = Path(path).read_text(encoding="utf-8")
    text = text.replace("MEMORY_REVISION: 2026-08-06-1011-JST", f"MEMORY_REVISION: {REV}", 1)
    text = text.replace("EXPECTED_REVISION: 2026-08-06-1011-JST", f"EXPECTED_REVISION: {REV}", 1)
    text = text.replace("NOTION_MEMORY_REVISION: 2026-08-06-1011-JST", f"NOTION_MEMORY_REVISION: {REV}", 1)
    text = replace_once(text,
        "Current execution handoff: Stage 6 is complete and accepted. Stage 7.9 deny-branch tactical payoff is merged and user-accepted at `89561d9c8cb50d72e6f383ed0dcc214c4ed28318`. Repository memory records the explicit iPhone Safari `PASS`. The exact next action is `IMPLEMENT_STAGE7_10_ACCUSE_KEN_BRANCH_TACTICAL_PAYOFFS_IN_FIRST_REAL_BATTLE`.\n",
        f"Current execution handoff: Stage 6 is complete and accepted. Stage 7.10 `accuse_ken` tactical payoffs are merged and user-accepted at `{MERGE_SHA}`. Repository memory records the explicit iPhone Safari `PASS`. The exact next action is `{NEXT}`.\n",
        path)
    text = replace_once(text,
        "14. Stage 7.10 applies the same narrow-payoff discipline to `accuse_ken`: public rematch gets one persisted canonical defense-option refresh and witness request auto-reveals the first attack color.\n15. Expand receipt, coalition, promise or broader witness systems only after each narrow payoff is separately accepted.\n",
        "14. Stage 7.10 applies the same narrow-payoff discipline to `accuse_ken`: public rematch gets one persisted canonical defense-option refresh and witness request auto-reveals the first attack color. Stage 7.10 is now user-accepted.\n15. Stage 7.11 applies the discipline to `pay`: receipt marks the matching defense family; ignored pressure exposes one persisted action that marks one wrong-family defense as Олег's pressure line. Both effects remain bridge-only, exactly once and presentation-only.\n16. Expand receipt, coalition, promise or broader witness systems only after each narrow payoff is separately accepted.\n",
        path)
    text = text.replace("NEXT_ACTION: IMPLEMENT_STAGE7_10_ACCUSE_KEN_BRANCH_TACTICAL_PAYOFFS_IN_FIRST_REAL_BATTLE", f"NEXT_ACTION: {NEXT}")
    Path(path).write_text(text, encoding="utf-8")


def validate() -> None:
    expected = {
        "PROJECT_MEMORY.md": [f"REPO_MEMORY_REV: {REV}", f"NEXT_ACTION: {NEXT}", MERGE_SHA, "STAGE_7_10: COMPLETE"],
        ".ai-memory/CURRENT.md": [f"MEMORY_REV: {REV}", f"NEXT_ACTION: {NEXT}", MERGE_SHA, "STAGE_7_10: COMPLETE"],
        ".ai-memory/CANON.md": [f"MEMORY_REVISION: {REV}", "## Accepted Stage 7.10 product slice", f"NEXT_ACTION: `{NEXT}`", MERGE_SHA],
        ".ai-memory/WORKFLOWS.md": [f"MEMORY_REVISION: {REV}", "Stage 7.11 applies the discipline to `pay`", f"NEXT_ACTION: {NEXT}", MERGE_SHA],
        "TASKS.md": ["Stage 7.10 accuse_ken payoff Safari acceptance", f"NEXT_ACTION: `{NEXT}`", MERGE_SHA],
    }
    for file, needles in expected.items():
        text = Path(file).read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                raise SystemExit(f"validation failed: {needle!r} missing from {file}")


if __name__ == "__main__":
    prepend_tasks()
    write_project_memory()
    write_current()
    patch_canon()
    patch_workflows()
    validate()
    print("STAGE7_10_PASS_MEMORY_SYNC_OK")
