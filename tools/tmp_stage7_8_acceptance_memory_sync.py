from pathlib import Path

REV = "2026-08-06-0259-JST"
MERGE_SHA = "49bb6f2802052d6783aaee608891e7c687858806"
NEXT_ACTION = "IMPLEMENT_STAGE7_9_DENY_BRANCH_EVIDENCE_PAYOFF_IN_FIRST_REAL_BATTLE"

project = f"""# Current Memory Index

REPO_MEMORY_REV: {REV}
NOTION_MEMORY_REV: {REV}
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MERGE_SHA}
CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MERGE_SHA}
ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MERGE_SHA}
LATEST_MERGED_RUNTIME_HEAD: {MERGE_SHA}
ROOT_STATUS: STAGE7_ACTIVE
CURRENT_STATUS: STAGE7_ACTIVE / REDESIGNED_ONBOARDING_USER_ACCEPTED / STRATEGIC_DEPTH_NEXT
STAGE_6: COMPLETE / AUTOMATIC_AND_HUMAN_RUNTIME_ACCEPTANCE_PASS
STAGE_7: ACTIVE / CORE_EXPERIENCE_RECONSTRUCTION_ACCEPTED
STAGE_7_0: COMPLETE / ESSENCE_MODAL_ACCEPTED
STAGE_7_1: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_5: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_6: MERGED / SUPERSEDED_BEFORE_SAFARI_ACCEPTANCE
STAGE_7_7: COMPLETE / LOCKED_THREE_NPC_INTERMISSION_USER_ACCEPTED
STAGE_7_8: COMPLETE / REAL_ARGUMENT_BATTLE_BRIDGE_USER_ACCEPTED
STAGE7_8_MERGE_SHA: {MERGE_SHA}
STAGE7_8_VALIDATION: premerge run 31030967584 PASS / postmerge run 31031221045 PASS
STAGE7_8_PAGES_BUILD: 1134266731 / built / no error
STAGE7_8_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_TAB
PRODUCT_FREEZE: NO_NEW_THEME_PROFILE_CURRENCY_NPC_CATEGORY_LOCATION_OR_BROAD_SECONDARY_SUBSYSTEM_BEFORE_CORE_LOOP_USER_EVIDENCE
RUNTIME: PUBLISHED_AND_USER_ACCEPTED
NEXT_ACTION: {NEXT_ACTION}

## Canonical cross-chat bootstrap

Fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY` in the current response.
Page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`
URL: https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111
Report its exact top-level `MEMORY_REV`, fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF`, then verify current repository primary evidence.
The former Google Drive document is a deprecated migration stub only, not the live authority.

Repository implementation and user acceptance are current through merged runtime `{MERGE_SHA}`. The accepted onboarding sequence is complete: first scripted conflict -> locked intermission with exactly three NPCs -> second scripted round -> six-question gate -> full unlock -> immediate Райхан injection -> first real argument battle through `Game.Conflict.incoming(...)` -> seamless normal play. The iPhone Safari private-tab acceptance verdict is explicit `PASS`.

The next atomic product slice begins strategic depth without broad expansion. The deny branch already persists `evidenceShared` or `evidenceHeld`, but that preparation currently changes copy and metadata rather than the real battle. Stage 7.9 must make that evidence produce a visible, persisted, exactly-once tactical payoff inside the first real argument battle while preserving canonical arguments, conflict economy, ordinary battles, source/docs parity and completed-battle no-replay.

Archives and backups are historical evidence. Provider-side physical unreachable-object purge is not claimed or required for ref-reachability acceptance.
"""
Path("PROJECT_MEMORY.md").write_text(project, encoding="utf-8")

current = f"""# Current Memory

MEMORY_REV: {REV}
NOTION_MEMORY_REV: {REV}
CURRENT_STATUS: STAGE7_ACTIVE / REDESIGNED_ONBOARDING_USER_ACCEPTED / STRATEGIC_DEPTH_NEXT
ACTIVE_TASK: STAGE7_9_DENY_BRANCH_EVIDENCE_PAYOFF
CURRENT_MAIN_REF: origin/main
CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MERGE_SHA}
CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MERGE_SHA}
ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MERGE_SHA}
LATEST_MERGED_RUNTIME_HEAD: {MERGE_SHA}
STAGE_6: COMPLETE / AUTOMATIC_AND_HUMAN_RUNTIME_ACCEPTANCE_PASS
STAGE_7: ACTIVE / CORE_EXPERIENCE_RECONSTRUCTION_ACCEPTED
STAGE_7_7: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE_7_8: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS
STAGE7_8_PAGES_BUILD: 1134266731 / built / no error
STAGE7_8_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_TAB
PRODUCT_FREEZE: ACTIVE
RUNTIME: PUBLISHED_AND_USER_ACCEPTED
NEXT_ACTION: {NEXT_ACTION}

Canonical bootstrap: fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY`, page ID `3a0815ae-752f-8139-945e-e38dfefbb111`, URL https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111. Report the exact top-level `MEMORY_REV`, then fetch the existing `ASYNCHRONIA - ACTIVE HANDOFF` and current repository primary evidence. The former Google Drive document remains a deprecated migration stub.

The complete redesigned onboarding is merged and user-accepted at `{MERGE_SHA}`. After question six the normal world opens, a branch-aware Райхан injection creates one real incoming argument battle, active battle resume is idempotent, and a completed bridge battle does not replay.

The next atomic runtime task is Stage 7.9: for the deny branch only, convert the persisted `evidenceShared` or `evidenceHeld` preparation into a visible tactical payoff in that first real battle. Do not add a parallel scripted battle, new currency, new location, broad evidence subsystem, non-canonical argument, or ordinary-battle behavior change.
"""
Path(".ai-memory/CURRENT.md").write_text(current, encoding="utf-8")

canon_path = Path(".ai-memory/CANON.md")
canon = canon_path.read_text(encoding="utf-8")
canon_replacements = [
    ("MEMORY_REVISION: 2026-08-05-2229-JST", f"MEMORY_REVISION: {REV}"),
    ("EXPECTED_REVISION: 2026-08-05-2229-JST", f"EXPECTED_REVISION: {REV}"),
    ("NOTION_MEMORY_REVISION: 2026-08-05-2229-JST", f"NOTION_MEMORY_REVISION: {REV}"),
    (
        "- Latest merged runtime implementation head is `ec0912fa63c820881498a926676d9f0cbc3c7516`. Latest user-accepted runtime remains `7a75edea6619d9a55bf2eff8a6d1838cb3edc82f` because Stage 7.6 was superseded before its Safari gate.",
        f"- Latest merged and user-accepted runtime implementation head is `{MERGE_SHA}`. PR #293 completed the real-battle bridge and the iPhone Safari private-tab verdict is explicit `PASS`.",
    ),
    (
        "- Stage 7.6 later-reaction implementation is historical merged evidence only and is not the active onboarding contract. The active next slice is the locked three-NPC intermission and exactly-once transition to round two.",
        "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 and Stage 7.8 complete the superseding onboarding and are user-accepted. The active next slice is Stage 7.9 deny-branch evidence payoff inside the first real battle.",
    ),
    (
        "- NEXT_ACTION: `IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER`.",
        f"- NEXT_ACTION: `{NEXT_ACTION}`.",
    ),
]
for old, new in canon_replacements:
    if old not in canon:
        raise SystemExit(f"missing CANON replacement: {old}")
    canon = canon.replace(old, new, 1)
marker = "## Superseding Stage 7 onboarding flow\n"
accepted = f"""## Accepted redesigned onboarding runtime

- PR #292 and PR #293 complete the user-approved sequence through the existing real conflict runtime.
- Accepted runtime head: `{MERGE_SHA}`.
- Static evidence: pre-merge Stage 7 matrix `31030967584` PASS; post-merge forensics `31031221045` PASS; Pages build `1134266731` built without error.
- User evidence: explicit iPhone Safari private-tab `PASS` for the full locked intermission, second round, six-question unlock, immediate Райхан injection, real argument battle, seamless continuation and no replay after completion.
- Strategic-depth boundary: the next work must make an already-persisted preparation matter mechanically in the real battle before introducing broad new systems.

"""
if marker not in canon:
    raise SystemExit("CANON marker missing")
canon_path.write_text(canon.replace(marker, accepted + marker, 1), encoding="utf-8")

workflows_path = Path(".ai-memory/WORKFLOWS.md")
workflows = workflows_path.read_text(encoding="utf-8")
workflow_replacements = [
    ("MEMORY_REVISION: 2026-08-05-2229-JST", f"MEMORY_REVISION: {REV}"),
    ("EXPECTED_REVISION: 2026-08-05-2229-JST", f"EXPECTED_REVISION: {REV}"),
    ("NOTION_MEMORY_REVISION: 2026-08-05-2229-JST", f"NOTION_MEMORY_REVISION: {REV}"),
    (
        "Current execution handoff: Stage 6 is complete and accepted. Stage 7.0 through Stage 7.5 are accepted for their tested scopes. Stage 7.6 merged at `ec0912fa63c820881498a926676d9f0cbc3c7516` but was superseded before Safari acceptance. Repository memory is synchronized from `ec0912fa63c820881498a926676d9f0cbc3c7516`. The exact next action is `IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER`.",
        f"Current execution handoff: Stage 6 is complete and accepted. The redesigned Stage 7 onboarding through the first real argument battle is merged and user-accepted at `{MERGE_SHA}`. Repository memory is synchronized to the explicit iPhone Safari `PASS`. The exact next action is `{NEXT_ACTION}`.",
    ),
    (
        "11. Deliver in atomic GitHub-only PRs with focused regressions, source/docs parity, forensics, Pages verification, and iPhone Safari acceptance.",
        "11. Deliver in atomic GitHub-only PRs with focused regressions, source/docs parity, forensics, Pages verification, and iPhone Safari acceptance.\n12. After the complete redesigned onboarding receives user PASS, begin strategic depth with the smallest branch-specific mechanical payoff.\n13. Stage 7.9 starts with the deny branch: persisted evidence preparation must visibly affect the first real battle exactly once without changing ordinary battles or canonical argument rules.\n14. Expand evidence, witness, receipt, coalition or promise systems only after each narrow payoff is separately accepted.",
    ),
    (
        "NEXT_ACTION: IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER",
        f"NEXT_ACTION: {NEXT_ACTION}",
    ),
]
for old, new in workflow_replacements:
    if old not in workflows:
        raise SystemExit(f"missing WORKFLOWS replacement: {old}")
    workflows = workflows.replace(old, new, 1)
workflows_path.write_text(workflows, encoding="utf-8")

tasks_path = Path("TASKS.md")
tasks = tasks_path.read_text(encoding="utf-8")
entry = f"""## 2026-08-06 - Stage 7.8 full onboarding Safari acceptance
- User returned explicit `PASS` for the complete redesigned onboarding on iPhone Safari private mode.
- Accepted runtime: PR #293 squash merge `{MERGE_SHA}` on top of PR #292.
- Accepted visible sequence: first conflict -> locked three-NPC intermission -> second round -> six questions -> full unlock -> immediate Райхан injection -> real argument battle -> seamless normal play.
- Accepted persistence: active bridge battle resumes without duplication and a completed bridge battle does not replay.
- Validation evidence: pre-merge run `31030967584` PASS; post-merge run `31031221045` PASS; Pages build `1134266731` built without error.
- NEXT_ACTION: `{NEXT_ACTION}`.

"""
tasks_path.write_text(entry + tasks, encoding="utf-8")

for path in [
    "PROJECT_MEMORY.md",
    ".ai-memory/CURRENT.md",
    ".ai-memory/CANON.md",
    ".ai-memory/WORKFLOWS.md",
]:
    text = Path(path).read_text(encoding="utf-8")
    if REV not in text or NEXT_ACTION not in text:
        raise SystemExit(f"validation failed for {path}")
