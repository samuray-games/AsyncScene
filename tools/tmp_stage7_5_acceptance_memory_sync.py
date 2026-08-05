from pathlib import Path
import re

REV = "2026-08-05-1924-JST"
BASELINE = "e43f34900db30294b596608f58e88ff16726bf71"
RUNTIME = "7a75edea6619d9a55bf2eff8a6d1838cb3edc82f"
BRANCH = "chatgpt/stage7-5-acceptance-memory-sync-20260805"


def replace_line(text: str, key: str, value: str, count: int = 1) -> str:
    pattern = rf"(?m)^{re.escape(key)}.*$"
    updated, n = re.subn(pattern, f"{key}{value}", text, count=count)
    if n != count:
        raise RuntimeError(f"expected {count} replacement(s) for {key!r}, got {n}")
    return updated


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


# PROJECT_MEMORY.md
path = "PROJECT_MEMORY.md"
text = Path(path).read_text(encoding="utf-8")
text = replace_line(text, "REPO_MEMORY_REV: ", REV)
text = replace_line(text, "NOTION_MEMORY_REV: ", REV)
text = replace_line(text, "CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: ", BASELINE)
text = replace_line(text, "CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: ", RUNTIME)
text = replace_line(text, "ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: ", RUNTIME)
text = replace_line(text, "CURRENT_STATUS: ", "STAGE7_ACTIVE / STAGE7_5_USER_ACCEPTED_COMPLETE / REPOSITORY_MEMORY_SYNCED / STAGE7_6_VISIBLE_LATER_REACTION_NEXT")
text = replace_line(text, "STAGE_7_5: ", "COMPLETE / USER_SAFARI_ACCEPTANCE_PASS")
text = replace_line(text, "MEMORY_SYNC_BRANCH: ", BRANCH)
text = replace_line(text, "NEXT_ACTION: ", "SELECT_AND_IMPLEMENT_STAGE7_6_VISIBLE_LATER_REACTION_FROM_PERSISTED_FOLLOW_UP_CHOICE", count=1)
text = text.replace(
    "Repository implementation evidence is current through `f00317a022486566293b870f0540db5cbf1ef08c`. Stage 6 remains complete and accepted. Stage 7.0 and Stage 7.1 are complete and user-accepted. The first causal conflict, legacy-save migration, freedom card, and exactly-once foreground/return world advance are live on GitHub Pages.",
    f"Repository implementation evidence is current through runtime `{RUNTIME}` with repository memory baseline `{BASELINE}`. Stage 6 remains complete and accepted. Stage 7.0 through Stage 7.5 are accepted for their tested scopes. The first causal conflict, legacy-save migration, freedom card, exactly-once foreground/return world advance, personalization, and branch-derived follow-up choice are live on GitHub Pages."
)
text = text.replace(
    "Stage 7.2 user-observed evidence is accepted for one foreground sample: first action 22238 ms, complete cycle 64778 ms, comprehension 5/5, exactly-once counts 1/1/1, continuation interest Да. This does not establish population percentages or return-path coverage. Stage 7.3 adds explicit-test-mode evidence that the selected branch and worldAdvanceId remain causally stable through continuation presentation.",
    "Stage 7.2 user-observed evidence is accepted for one foreground sample: first action 22238 ms, complete cycle 64778 ms, comprehension 5/5, exactly-once counts 1/1/1, continuation interest Да. Stage 7.3 accepted the return path and branch/worldAdvanceId continuity. Stage 7.4 accepted nickname personalization and visible names Райхан/Настя. Stage 7.5 accepted a branch-derived follow-up choice that persists in NPC memory, blocks normal-world release until answered, and does not replay after refresh. The next atomic task is one visible later world reaction derived from that persisted follow-up choice."
)
write(path, text)

# .ai-memory/CURRENT.md
path = ".ai-memory/CURRENT.md"
text = Path(path).read_text(encoding="utf-8")
text = replace_line(text, "MEMORY_REV: ", REV)
text = replace_line(text, "NOTION_MEMORY_REV: ", REV)
text = replace_line(text, "CURRENT_STATUS: ", "STAGE7_ACTIVE / STAGE7_5_USER_ACCEPTED_COMPLETE / REPOSITORY_MEMORY_SYNCED / STAGE7_6_VISIBLE_LATER_REACTION_NEXT")
text = replace_line(text, "ACTIVE_TASK: ", "STAGE7_6_VISIBLE_LATER_REACTION_SELECTION")
text = replace_line(text, "CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: ", BASELINE)
text = replace_line(text, "CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: ", RUNTIME)
text = replace_line(text, "ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: ", RUNTIME)
text = replace_line(text, "STAGE_7_5: ", "COMPLETE / USER_SAFARI_ACCEPTANCE_PASS")
text = replace_line(text, "MEMORY_SYNC_BRANCH: ", BRANCH)
text = replace_line(text, "NEXT_ACTION: ", "SELECT_AND_IMPLEMENT_STAGE7_6_VISIBLE_LATER_REACTION_FROM_PERSISTED_FOLLOW_UP_CHOICE", count=1)
text = text.replace(
    "Stage 6 remains complete and accepted. Stage 7 is active as `CORE EXPERIENCE RECONSTRUCTION`. Stage 7.0 and Stage 7.1 are complete and user-accepted through `1333ddda7aceacf0f10cd6b2b3f9baa30fe0a9db`; the Stage 7.2 harness is at `f00317a022486566293b870f0540db5cbf1ef08c` and its foreground sample is user-observed.",
    f"Stage 6 remains complete and accepted. Stage 7 is active as `CORE EXPERIENCE RECONSTRUCTION`. Stage 7.0 through Stage 7.5 are accepted for their tested scopes. The accepted runtime is `{RUNTIME}`; the current repository baseline after memory sync is `{BASELINE}`."
)
text = text.replace(
    "The next atomic runtime task is Stage 7.3 continuation-integrity evidence. Explicit test mode only: verify selected branch and worldAdvanceId stability through continuation presentation while leaving normal-player behavior unchanged.",
    "The next atomic runtime task is Stage 7.6: make the persisted Stage 7.5 follow-up choice cause one visible later world reaction. Primary and secondary choices must produce distinguishable, explainable, exactly-once, refresh-safe reactions without broad subsystem expansion."
)
write(path, text)

# .ai-memory/CANON.md
path = ".ai-memory/CANON.md"
text = Path(path).read_text(encoding="utf-8")
text = replace_line(text, "MEMORY_REVISION: ", REV)
text = replace_line(text, "EXPECTED_REVISION: ", REV)
text = replace_line(text, "NOTION_MEMORY_REVISION: ", REV)
text = text.replace(
    "- GitHub Pages build `30994053777` served the merged entrypoint; Safari acceptance remains pending.",
    "- GitHub Pages build `30994053777` served the merged entrypoint; the dedicated iPhone Safari acceptance run returned explicit `PASS`."
)
text = text.replace(
    "- A single branch-derived follow-up choice is persisted in NPC memory before normal-world release.",
    "- A single branch-derived follow-up choice is persisted in NPC memory before normal-world release. The follow-up matches the original branch, normal-world release waits for the answer, and refresh does not replay the resolved card."
)
text = text.replace(
    "- Current accepted runtime implementation head is `f00317a022486566293b870f0540db5cbf1ef08c`.",
    f"- Current accepted runtime implementation head is `{RUNTIME}`."
)
text = text.replace(
    "- Stage 7.5 is `FIRST REAL ASYNCHRONOUS WORLD ADVANCE`. Closing the app is optional.",
    "- The first real asynchronous world advance remains accepted from the earlier causal slice. Stage 7.5 now names the accepted branch-derived follow-up choice stored in NPC memory before normal-world release."
)
needle = "- Stage 7.3 adds explicit-test-mode evidence that the selected branch and world-advance identity remain causally stable through continuation presentation."
replacement = needle + "\n- Stage 7.4 user acceptance covers the nickname field, nickname usage, visible names `Райхан` and `Настя`, return copy, and the explanation before the six-question gate.\n- Stage 7.5 user acceptance covers the branch-derived follow-up choice, persistence into target NPC memory, release ordering, and no replay after refresh.\n- Stage 7.6 must make the saved primary or secondary follow-up choice cause one visibly different later world reaction, exactly once and refresh-safe, without broad subsystem expansion."
if needle not in text:
    raise RuntimeError("Stage 7.3 canon anchor missing")
text = text.replace(needle, replacement, 1)
text = replace_line(text, "- NEXT_ACTION: `", "SELECT_AND_IMPLEMENT_STAGE7_6_VISIBLE_LATER_REACTION_FROM_PERSISTED_FOLLOW_UP_CHOICE`.", count=1)
write(path, text)

# .ai-memory/WORKFLOWS.md
path = ".ai-memory/WORKFLOWS.md"
text = Path(path).read_text(encoding="utf-8")
text = replace_line(text, "MEMORY_REVISION: ", REV)
text = replace_line(text, "EXPECTED_REVISION: ", REV)
text = replace_line(text, "NOTION_MEMORY_REVISION: ", REV)
old_handoff = "Current execution handoff: Stage 6 is complete and accepted. Stage 7.0 and Stage 7.4 are complete and user-accepted. Stage 7.5 is merged at `7a75edea6619d9a55bf2eff8a6d1838cb3edc82f`; Pages build `30994053777` is built and served. The exact next product action is `USER_RUN_STAGE7_5_BRANCH_DERIVED_FOLLOW_UP_IN_IPHONE_SAFARI_PRIVATE_TAB_AND_RETURN_EXACT_RESULT`."
new_handoff = f"Current execution handoff: Stage 6 is complete and accepted. Stage 7.0 through Stage 7.5 are accepted for their tested scopes. Stage 7.5 runtime `{RUNTIME}` passed the dedicated iPhone Safari gate. Repository memory is synchronized from baseline `{BASELINE}`. The exact next product action is `SELECT_AND_IMPLEMENT_STAGE7_6_VISIBLE_LATER_REACTION_FROM_PERSISTED_FOLLOW_UP_CHOICE`."
if old_handoff not in text:
    raise RuntimeError("workflow handoff anchor missing")
text = text.replace(old_handoff, new_handoff, 1)
old_steps = "2. Stage 7.1 is complete and user-accepted through `main@1333ddda7aceacf0f10cd6b2b3f9baa30fe0a9db`; do not reopen it without a concrete regression.\n3. Stage 7.2 observed-evidence harness is merged and one foreground Safari sample is user-accepted; do not claim population coverage or return-path acceptance.\n4. Implement one atomic Stage 7.3 continuation-integrity evidence slice behind explicit test mode only.\n5. Normal-player behavior must remain byte-for-byte or semantically unchanged outside explicit test mode."
new_steps = "2. Stage 7.1 through Stage 7.5 are complete and user-accepted for their tested scopes; do not reopen them without a concrete regression.\n3. Stage 7.2 evidence remains one foreground sample and must not be misrepresented as population coverage. Stage 7.3 separately accepted the return path and continuity evidence.\n4. Implement one atomic Stage 7.6 slice where the persisted primary or secondary Stage 7.5 follow-up choice causes one visibly different later world reaction.\n5. The reaction must be exactly-once, refresh-safe, causally explainable from NPC memory, and delivered without broad subsystem expansion."
if old_steps not in text:
    raise RuntimeError("Stage 7 workflow anchor missing")
text = text.replace(old_steps, new_steps, 1)
text = replace_line(text, "NEXT_ACTION: ", "SELECT_AND_IMPLEMENT_STAGE7_6_VISIBLE_LATER_REACTION_FROM_PERSISTED_FOLLOW_UP_CHOICE", count=1)
write(path, text)

print("STAGE7_5_ACCEPTANCE_MEMORY_SYNC_OK")
