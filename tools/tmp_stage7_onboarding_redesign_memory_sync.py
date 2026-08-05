from pathlib import Path
import re

REV = "2026-08-05-2229-JST"
MAIN = "ec0912fa63c820881498a926676d9f0cbc3c7516"
ACCEPTED = "7a75edea6619d9a55bf2eff8a6d1838cb3edc82f"


def replace_once(text: str, old: str, new: str, path: str) -> str:
    if old not in text:
        raise SystemExit(f"missing replacement in {path}: {old[:120]!r}")
    return text.replace(old, new, 1)


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


path = "PROJECT_MEMORY.md"
text = Path(path).read_text(encoding="utf-8")
text = re.sub(r"REPO_MEMORY_REV: .*", f"REPO_MEMORY_REV: {REV}", text, count=1)
text = re.sub(r"NOTION_MEMORY_REV: .*", f"NOTION_MEMORY_REV: {REV}", text, count=1)
text = re.sub(r"CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: .*", f"CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MAIN}", text, count=1)
text = re.sub(r"CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: .*", f"CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {ACCEPTED}", text, count=1)
text = re.sub(r"ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: .*", f"ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {ACCEPTED}\nLATEST_MERGED_RUNTIME_HEAD: {MAIN}", text, count=1)
text = re.sub(r"CURRENT_STATUS: .*", "CURRENT_STATUS: STAGE7_ACTIVE / ONBOARDING_FLOW_REDESIGN_ACCEPTED / REPOSITORY_MEMORY_SYNCED / LIMITED_THREE_NPC_INTERMISSION_NEXT", text, count=1)
text = replace_once(text, "STAGE_7_5: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS", "STAGE_7_5: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE_7_6: MERGED / SUPERSEDED_BEFORE_SAFARI_ACCEPTANCE", path)
text = re.sub(r"NEXT_ACTION: .*", "NEXT_ACTION: IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER", text, count=1)
start = text.index("Repository implementation evidence is current through runtime")
end = text.index("\n\nArchives and backups", start)
new_summary = f"""Repository implementation evidence is current through merged runtime `{MAIN}`. Stage 6 remains complete and accepted. Stage 7.0 through Stage 7.5 are accepted for their tested scopes. Stage 7.6 merged a later follow-up reaction but was superseded before Safari acceptance by the explicit onboarding redesign below.\n\nThe accepted onboarding sequence is: first scripted conflict -> locked intermission with exactly three NPCs for approximately 45 seconds or leave/return -> second scripted round -> six-question comprehension gate -> full game unlock -> immediate Райхан injection -> first real argument battle through `Game.Conflict.incoming(opponentId, opts)` -> seamless normal play. The full game must not unlock after round one. Existing Stage 7.6 follow-up/later-reaction logic must be removed, repurposed, or migrated rather than layered as duplicate onboarding.\n\nPreserve the accepted first-round branch, persistence, exactly-once semantics, branchId/worldAdvanceId continuity, leave/return behavior, and old-save migration. The next atomic task is the locked three-NPC intermission and exactly-once transition into round two."""
text = text[:start] + new_summary + text[end:]
write(path, text)

path = ".ai-memory/CURRENT.md"
text = Path(path).read_text(encoding="utf-8")
text = re.sub(r"MEMORY_REV: .*", f"MEMORY_REV: {REV}", text, count=1)
text = re.sub(r"NOTION_MEMORY_REV: .*", f"NOTION_MEMORY_REV: {REV}", text, count=1)
text = re.sub(r"CURRENT_STATUS: .*", "CURRENT_STATUS: STAGE7_ACTIVE / ONBOARDING_FLOW_REDESIGN_ACCEPTED / REPOSITORY_MEMORY_SYNCED / LIMITED_THREE_NPC_INTERMISSION_NEXT", text, count=1)
text = re.sub(r"ACTIVE_TASK: .*", "ACTIVE_TASK: STAGE7_7_LOCKED_THREE_NPC_INTERMISSION", text, count=1)
text = re.sub(r"CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: .*", f"CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MAIN}", text, count=1)
text = re.sub(r"CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: .*", f"CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {ACCEPTED}", text, count=1)
text = re.sub(r"ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: .*", f"ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {ACCEPTED}\nLATEST_MERGED_RUNTIME_HEAD: {MAIN}", text, count=1)
text = replace_once(text, "STAGE_7_5: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS", "STAGE_7_5: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE_7_6: MERGED / SUPERSEDED_BEFORE_SAFARI_ACCEPTANCE", path)
text = re.sub(r"NEXT_ACTION: .*", "NEXT_ACTION: IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER", text, count=1)
paragraph_start = text.index("Stage 6 remains complete and accepted.")
new_tail = f"""Stage 6 remains complete and accepted. Stage 7 is active as `CORE EXPERIENCE RECONSTRUCTION`. Stage 7.0 through Stage 7.5 are accepted for their tested scopes. The latest merged runtime is `{MAIN}`; the latest user-accepted runtime remains `{ACCEPTED}`. Stage 7.6 was merged but superseded before Safari acceptance.\n\nThe user-approved onboarding sequence is first scripted conflict, a locked approximately 45-second intermission exposing exactly three NPCs, a second scripted round, the six-question comprehension gate, full unlock, an immediate Райхан injection, and the first real argument battle through the existing conflict API. Normal play continues without another onboarding gate after that battle.\n\nThe next atomic runtime task is Stage 7.7: keep the full game locked after round one, expose exactly three lightweight NPC interactions, support foreground and leave/return timing, and trigger round two exactly once."""
text = text[:paragraph_start] + new_tail + "\n"
write(path, text)

path = ".ai-memory/CANON.md"
text = Path(path).read_text(encoding="utf-8")
text = re.sub(r"MEMORY_REVISION: .*", f"MEMORY_REVISION: {REV}", text, count=1)
text = re.sub(r"EXPECTED_REVISION: .*", f"EXPECTED_REVISION: {REV}", text, count=1)
text = re.sub(r"NOTION_MEMORY_REVISION: .*", f"NOTION_MEMORY_REVISION: {REV}", text, count=1)
insert_at = text.index("## Accepted Stage 7.5 product slice")
superseding = f"""## Superseding Stage 7 onboarding flow\n\n- The user-approved sequence is first scripted conflict -> locked three-NPC intermission -> second scripted round -> six-question gate -> full unlock -> immediate Райхан injection -> first real argument battle -> seamless normal play.\n- The full game must remain locked after round one. Exactly three NPCs are available for lightweight interaction during the existing approximately 45-second foreground or leave/return interval.\n- Round two starts exactly once when the interval expires or the player returns after it is due.\n- The six questions occur only after round two. Full systems unlock only after questionnaire completion.\n- The post-unlock Райхан injection must create a real incoming conflict through `Game.Conflict.incoming(opponentId, opts)` and use the existing argument picker and resolution UI. Another scripted imitation is forbidden.\n- Existing Stage 7.6 follow-up and later-reaction behavior was merged at `{MAIN}` but superseded before Safari acceptance. It must be removed, repurposed, or migrated rather than stacked beside the new onboarding.\n- Preserve accepted first-round branching, persistence, exactly-once behavior, branchId/worldAdvanceId continuity, foreground/return semantics, and old-save migration.\n\n"""
text = text[:insert_at] + superseding + text[insert_at:]
text = replace_once(text, f"- Current accepted runtime implementation head is `{ACCEPTED}`.", f"- Latest merged runtime implementation head is `{MAIN}`. Latest user-accepted runtime remains `{ACCEPTED}` because Stage 7.6 was superseded before its Safari gate.", path)
text = replace_once(text, "- Stage 7.6 must make the saved primary or secondary follow-up choice cause one visibly different later world reaction, exactly once and refresh-safe, without broad subsystem expansion.", "- Stage 7.6 later-reaction implementation is historical merged evidence only and is not the active onboarding contract. The active next slice is the locked three-NPC intermission and exactly-once transition to round two.", path)
text = re.sub(r"- NEXT_ACTION: `[^`]+`\.", "- NEXT_ACTION: `IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER`.", text, count=1)
write(path, text)

path = ".ai-memory/WORKFLOWS.md"
text = Path(path).read_text(encoding="utf-8")
text = re.sub(r"MEMORY_REVISION: .*", f"MEMORY_REVISION: {REV}", text, count=1)
text = re.sub(r"EXPECTED_REVISION: .*", f"EXPECTED_REVISION: {REV}", text, count=1)
text = re.sub(r"NOTION_MEMORY_REVISION: .*", f"NOTION_MEMORY_REVISION: {REV}", text, count=1)
text = re.sub(r"Current execution handoff: .*", f"Current execution handoff: Stage 6 is complete and accepted. Stage 7.0 through Stage 7.5 are accepted for their tested scopes. Stage 7.6 merged at `{MAIN}` but was superseded before Safari acceptance. Repository memory is synchronized from `{MAIN}`. The exact next action is `IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER`.", text, count=1)
section_start = text.index("## Stage 7 execution workflow")
section_end = text.index("\n## Local plugin installation", section_start)
new_section = """## Stage 7 execution workflow\n\n1. Enforce the product freeze until observed user evidence proves the causal core loop.\n2. Preserve accepted Stage 7.1 through Stage 7.5 behavior unless the superseding onboarding sequence explicitly relocates its timing.\n3. Keep the full game locked after the first scripted conflict.\n4. Implement an approximately 45-second intermission with exactly three lightweight NPC interaction surfaces. The player may interact, stay idle, background the app, or leave and return.\n5. Start the second scripted round exactly once when the interval expires or the player returns after it is due.\n6. Present the six-question comprehension gate only after round two. Full systems remain locked until the questionnaire is completed.\n7. After unlock, immediately present a Райхан injection and create the first real incoming argument battle through `Game.Conflict.incoming(opponentId, opts)`. Use the existing conflict UI and argument resolution; do not fake the battle in the Stage 7 controller.\n8. After that real battle, release all remaining onboarding control and continue normal play seamlessly.\n9. Remove, repurpose, or migrate superseded Stage 7.6 follow-up/later-reaction states so duplicate onboarding cannot appear.\n10. Preserve first-round branchId, worldAdvanceId, persistence, exactly-once settlement, foreground/return continuity, and old-save migration.\n11. Deliver in atomic GitHub-only PRs with focused regressions, source/docs parity, forensics, Pages verification, and iPhone Safari acceptance.\n"""
text = text[:section_start] + new_section + text[section_end:]
text = re.sub(r"NEXT_ACTION: .*", "NEXT_ACTION: IMPLEMENT_STAGE7_7_LOCKED_THREE_NPC_INTERMISSION_AND_SECOND_ROUND_TRIGGER", text, count=1)
write(path, text)

expected = {
    "PROJECT_MEMORY.md": REV,
    ".ai-memory/CURRENT.md": REV,
    ".ai-memory/CANON.md": REV,
    ".ai-memory/WORKFLOWS.md": REV,
}
for file, rev in expected.items():
    content = Path(file).read_text(encoding="utf-8")
    if rev not in content:
        raise SystemExit(f"revision missing from {file}")

print("STAGE7_ONBOARDING_REDESIGN_MEMORY_SYNC_OK")
