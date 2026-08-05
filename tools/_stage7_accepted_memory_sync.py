#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
REV = "2026-08-05-1111-JST"
MAIN = "1333ddda7aceacf0f10cd6b2b3f9baa30fe0a9db"
BRANCH = "chatgpt/stage7-accepted-memory-sync-20260805"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, got {count}")
    return text.replace(old, new, 1)


def sub_once(text: str, pattern: str, replacement: str, label: str) -> str:
    text2, count = re.subn(pattern, replacement, text, count=1, flags=re.MULTILINE)
    if count != 1:
        raise SystemExit(f"{label}: expected one regex match, got {count}")
    return text2


# PROJECT_MEMORY.md
path = "PROJECT_MEMORY.md"
text = read(path)
for key, value in {
    "REPO_MEMORY_REV": REV,
    "NOTION_MEMORY_REV": REV,
    "CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE": MAIN,
    "CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE": MAIN,
    "ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD": MAIN,
    "CURRENT_STATUS": "STAGE7_ACTIVE / STAGE7_1_ACCEPTED_COMPLETE / STAGE7_2_OBSERVED_EVIDENCE_HARNESS_NEXT",
    "STAGE_7_1": "COMPLETE / USER_SAFARI_ACCEPTANCE_PASS",
    "STAGE_7_5": "COMPLETE / FOREGROUND_AND_BACKGROUND_EXACTLY_ONCE_ACCEPTED",
    "POST_CONFLICT_FREEDOM_CARD": "IMPLEMENTED / USER_SAFARI_ACCEPTANCE_PASS",
    "RUNTIME": "PUBLISHED_AND_USER_ACCEPTED",
    "SAFARI_RUNTIME_SMOKE": "STAGE7_1_FIRST_CAUSAL_EXPERIENCE_PASS",
    "MEMORY_SYNC_BRANCH": BRANCH,
    "NEXT_ACTION": "IMPLEMENT_STAGE7_2_OBSERVED_CORE_LOOP_EVIDENCE_HARNESS_IN_EXPLICIT_TEST_MODE_ONLY",
}.items():
    text = sub_once(text, rf"^{re.escape(key)}:.*$", f"{key}: {value}", f"PROJECT_MEMORY {key}")

anchor = "PR_278_STAGE7_PRESTART_FIX_MERGE_SHA: e54390fe6164f601caeaf2819e2ea56ed25c8eb0\n"
addition = (
    anchor
    + "PR_280_GITHUB_ONLY_POLICY_MERGE_SHA: 4b6db2b9b540e8c7fe32e51eda60c4cd784797b6\n"
    + "PR_281_STAGE7_1_RUNTIME_MERGE_SHA: 1babc437adbfa39e07d870ae206df1af124aad08\n"
    + f"PR_282_STAGE7_1_LEGACY_RESUME_FIX_MERGE_SHA: {MAIN}\n"
    + "STAGE7_1_PAGES_BUILD: 1132995890 / built / no error\n"
)
if "PR_280_GITHUB_ONLY_POLICY_MERGE_SHA" not in text:
    text = replace_once(text, anchor, addition, "PROJECT_MEMORY PR anchors")

text = replace_once(
    text,
    "Repository implementation evidence is current through `e54390fe6164f601caeaf2819e2ea56ed25c8eb0`. Stage 6 remains complete and accepted. Stage 7 was explicitly started by the user, the five-profile essence modal and its pre-start stacking repair are accepted, and Stage 7 is now product canon as `CORE EXPERIENCE RECONSTRUCTION`.",
    f"Repository implementation evidence is current through `{MAIN}`. Stage 6 remains complete and accepted. Stage 7.0 and Stage 7.1 are complete and user-accepted. The first causal conflict, legacy-save migration, freedom card, and exactly-once foreground/return world advance are live on GitHub Pages.",
    "PROJECT_MEMORY bootstrap paragraph",
)
text = replace_once(
    text,
    "The next product task is not presentation expansion. It is one isolated causal conflict with first meaningful action within 30 seconds, exactly three responses, a 2-3 minute complete cycle, visible Money and Reputation only, branch-derived causal records, NPC memory, and one persisted asynchronous continuation. The player may remain in the app or leave; both paths must resolve the same continuation exactly once. The first unlocked main-world overlay teaches this promise with the accepted `Мир живёт дальше` copy.",
    "The next product task is Stage 7.2 observed core-loop evidence, not world expansion. An explicit test mode must measure first-action time, complete-cycle time, selected branch, foreground/return continuation path, and exactly-once settlement, then collect compact causal-comprehension and continuation-interest answers without changing normal-player behavior.",
    "PROJECT_MEMORY next product paragraph",
)
write(path, text)


# .ai-memory/CURRENT.md
path = ".ai-memory/CURRENT.md"
text = read(path)
for key, value in {
    "MEMORY_REV": REV,
    "NOTION_MEMORY_REV": REV,
    "CURRENT_STATUS": "STAGE7_ACTIVE / STAGE7_1_ACCEPTED_COMPLETE / STAGE7_2_OBSERVED_EVIDENCE_HARNESS_NEXT",
    "ACTIVE_TASK": "STAGE7_ACCEPTED_MEMORY_SYNC_THEN_STAGE7_2_TEST_HARNESS",
    "CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE": MAIN,
    "CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE": MAIN,
    "ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD": MAIN,
    "STAGE_7_1": "COMPLETE / USER_SAFARI_ACCEPTANCE_PASS",
    "STAGE_7_5": "COMPLETE / FOREGROUND_AND_BACKGROUND_EXACTLY_ONCE_ACCEPTED",
    "POST_CONFLICT_FREEDOM_CARD": "IMPLEMENTED / USER_SAFARI_ACCEPTANCE_PASS",
    "RUNTIME": "PUBLISHED_AND_USER_ACCEPTED",
    "MEMORY_SYNC_BRANCH": BRANCH,
    "NEXT_ACTION": "IMPLEMENT_STAGE7_2_OBSERVED_CORE_LOOP_EVIDENCE_HARNESS_IN_EXPLICIT_TEST_MODE_ONLY",
}.items():
    text = sub_once(text, rf"^{re.escape(key)}:.*$", f"{key}: {value}", f"CURRENT {key}")

anchor = "PR278_MERGE_SHA: e54390fe6164f601caeaf2819e2ea56ed25c8eb0\n"
addition = (
    anchor
    + "PR280_MERGE_SHA: 4b6db2b9b540e8c7fe32e51eda60c4cd784797b6\n"
    + "PR281_MERGE_SHA: 1babc437adbfa39e07d870ae206df1af124aad08\n"
    + f"PR282_MERGE_SHA: {MAIN}\n"
    + "STAGE7_1_PAGES_BUILD: 1132995890 / built / no error\n"
    + "STAGE7_1_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_TAB\n"
)
if "PR280_MERGE_SHA" not in text:
    text = replace_once(text, anchor, addition, "CURRENT PR anchors")

text = replace_once(
    text,
    "Stage 6 remains complete and accepted. Stage 7 was explicitly started and is active as `CORE EXPERIENCE RECONSTRUCTION`. The accepted Stage 7 essence modal is integrated through PR #277, and the pre-start overlay repair is integrated and accepted through PR #278.",
    f"Stage 6 remains complete and accepted. Stage 7 is active as `CORE EXPERIENCE RECONSTRUCTION`. Stage 7.0 and Stage 7.1 are complete and user-accepted through `{MAIN}`; GitHub Pages build `1132995890` published the accepted iPhone Safari flow.",
    "CURRENT status paragraph",
)
text = replace_once(
    text,
    "The next atomic runtime task must prove the actual game: one personal accusation, first action within 30 seconds, exactly three responses, a complete 2-3 minute causal cycle, only Money and Reputation visible, distinct consequences, one branch-derived pending world advance, and the accepted `Мир живёт дальше` post-conflict overlay. Leaving the app is optional; foreground and return-after-absence paths must apply the same continuation exactly once.",
    "The next atomic runtime task is Stage 7.2 observed core-loop evidence. Explicit test mode only: measure first-action and cycle timing, branch choice, foreground/return path, exactly-once settlement, causal comprehension, and continuation interest while leaving normal-player behavior unchanged.",
    "CURRENT next task paragraph",
)
write(path, text)


# .ai-memory/CANON.md
path = ".ai-memory/CANON.md"
text = read(path)
for key, value in {
    "MEMORY_REVISION": REV,
    "EXPECTED_REVISION": REV,
    "NOTION_MEMORY_REVISION": REV,
}.items():
    text = sub_once(text, rf"^{re.escape(key)}:.*$", f"{key}: {value}", f"CANON {key}")
text = replace_once(
    text,
    "- Current accepted runtime implementation head is `e54390fe6164f601caeaf2819e2ea56ed25c8eb0`.",
    f"- Current accepted runtime implementation head is `{MAIN}`.",
    "CANON accepted head",
)
text = replace_once(
    text,
    "- Stage 7.1 must implement one isolated personal conflict with first meaningful action within 30 seconds, exactly three responses, a complete 2-3 minute cycle, no pre-action tutorial, and only Money and Reputation visible.",
    "- Stage 7.1 is complete and user-accepted. It delivers one isolated personal conflict with first meaningful action within 30 seconds, exactly three responses, no pre-action tutorial, and only Money and Reputation visible before normal-world release.",
    "CANON Stage 7.1 completion",
)
insert_after = "- User testing must happen before world expansion. Hard criteria include first action and cycle-time targets, causal comprehension, three distinguishable continuations, visible reflection of the earlier choice, and no meaningful event without an explainable cause.\n"
if "Stage 7.2 is the observed core-loop evidence harness" not in text:
    text = replace_once(
        text,
        insert_after,
        insert_after
        + f"- Stage 7.1 user acceptance passed in iPhone Safari after PR #282 merge `{MAIN}` and Pages build `1132995890`; the private-tab retest confirmed the legacy-save migration and repaired cache delivery.\n"
        + "- Stage 7.2 is the observed core-loop evidence harness. It is enabled only by explicit test mode and must not alter normal-player behavior. It measures first-action time, complete-cycle time, branch choice, foreground/return path, and exactly-once continuation settlement, then records compact causal-comprehension and continuation-interest answers.\n",
        "CANON Stage 7.2 insertion",
    )
text = sub_once(
    text,
    r"^- NEXT_ACTION: `.*`\.$",
    "- NEXT_ACTION: `IMPLEMENT_STAGE7_2_OBSERVED_CORE_LOOP_EVIDENCE_HARNESS_IN_EXPLICIT_TEST_MODE_ONLY`.",
    "CANON next action",
)
write(path, text)


# .ai-memory/WORKFLOWS.md
path = ".ai-memory/WORKFLOWS.md"
text = read(path)
for key, value in {
    "MEMORY_REVISION": REV,
    "EXPECTED_REVISION": REV,
    "NOTION_MEMORY_REVISION": REV,
}.items():
    text = sub_once(text, rf"^{re.escape(key)}:.*$", f"{key}: {value}", f"WORKFLOWS {key}")
text = replace_once(
    text,
    "Current execution handoff: Stage 6 is complete and accepted. Stage 7 was explicitly started by the user and is active as `CORE EXPERIENCE RECONSTRUCTION`. Stage 7.0 is complete and accepted through PR #277 merge `bf54de857e20ea7ac838f6c14e17bfa5cd7b69a3` and PR #278 merge `e54390fe6164f601caeaf2819e2ea56ed25c8eb0`. The active documentation-maintenance branch is `chatgpt/stage7-memory-sync-20260805`. The exact next product action is `FREEZE_STAGE7_1_ATOMIC_SCOPE_THEN_IMPLEMENT_ONE_COMPLETE_THREE_MINUTE_CAUSAL_CONFLICT_WITH_EXACTLY_THREE_BRANCHES`.",
    f"Current execution handoff: Stage 6 is complete and accepted. Stage 7 is active as `CORE EXPERIENCE RECONSTRUCTION`. Stage 7.0 and Stage 7.1 are complete and user-accepted through `{MAIN}`. The active documentation-maintenance branch is `{BRANCH}`. The exact next product action is `IMPLEMENT_STAGE7_2_OBSERVED_CORE_LOOP_EVIDENCE_HARNESS_IN_EXPLICIT_TEST_MODE_ONLY`.",
    "WORKFLOWS handoff",
)
old_stage7 = """1. Enforce the product freeze until observed user evidence proves the causal core loop.
2. Finish repository-memory synchronization before treating stale `STAGE_7: HISTORICAL_NON_ACTIVE_DRAFT` text as repaired on `main`.
3. Freeze one atomic Stage 7.1 runtime scope before implementation.
4. The first conflict must begin with a personally relevant accusation and expose the first meaningful action within 30 seconds.
5. One click on `Ответить` reveals exactly `Отрицать`, `Обвинить Кена`, and `Заплатить`.
6. The complete first cycle targets 2-3 minutes and shows only Money and Reputation before unlock.
7. Every branch records a causal chain, NPC memory changes, a distinct consequence, and one pending `awaiting_world_advance` continuation.
8. `completed -> main_unlocked` remains the frozen state order. `post_conflict_freedom_card` is an overlay inside `main_unlocked`, not a ninth state.
9. If the player remains online, the due continuation appears live. If the player leaves, the same continuation appears on return. Both paths must settle exactly once.
10. User-owned Safari acceptance remains required for user-visible runtime completion."""
new_stage7 = """1. Enforce the product freeze until observed user evidence proves the causal core loop.
2. Stage 7.1 is complete and user-accepted through `main@1333ddda7aceacf0f10cd6b2b3f9baa30fe0a9db`; do not reopen it without a concrete regression.
3. Before world expansion, implement one atomic Stage 7.2 observed-evidence harness behind explicit test mode only.
4. Normal-player behavior must remain byte-for-byte or semantically unchanged outside explicit test mode.
5. Measure first meaningful action time, complete-cycle time, selected branch, foreground/return continuation path, and exactly-once settlement.
6. Collect compact causal-comprehension answers covering accusation, chosen action, reaction, resource consequence, and later world change.
7. Collect one continuation-interest answer without forcing a positive response or changing settlement.
8. Produce one deterministic developer report with thresholds, raw answers, pass/fail fields, and no network transmission.
9. Source and deployed mirrors, persistence, settlement traceability, and Safari acceptance remain mandatory.
10. World expansion remains frozen until the evidence harness can produce observed results."""
text = replace_once(text, old_stage7, new_stage7, "WORKFLOWS Stage 7 block")
text = sub_once(
    text,
    r"^NEXT_ACTION: .*$",
    "NEXT_ACTION: IMPLEMENT_STAGE7_2_OBSERVED_CORE_LOOP_EVIDENCE_HARNESS_IN_EXPLICIT_TEST_MODE_ONLY",
    "WORKFLOWS next action",
)
write(path, text)


# Cross-file validation
files = {
    "PROJECT_MEMORY.md": read("PROJECT_MEMORY.md"),
    ".ai-memory/CURRENT.md": read(".ai-memory/CURRENT.md"),
    ".ai-memory/CANON.md": read(".ai-memory/CANON.md"),
    ".ai-memory/WORKFLOWS.md": read(".ai-memory/WORKFLOWS.md"),
}
for name, body in files.items():
    if REV not in body:
        raise SystemExit(f"{name}: revision missing")
    if MAIN not in body:
        raise SystemExit(f"{name}: accepted main missing")
    if "IMPLEMENT_STAGE7_2_OBSERVED_CORE_LOOP_EVIDENCE_HARNESS_IN_EXPLICIT_TEST_MODE_ONLY" not in body:
        raise SystemExit(f"{name}: next action missing")

for stale in (
    "STAGE_7_1: NEXT_ATOMIC_RUNTIME_SCOPE",
    "FREEZE_STAGE7_1_ATOMIC_SCOPE_THEN_IMPLEMENT_ONE_COMPLETE_THREE_MINUTE_CAUSAL_CONFLICT_WITH_EXACTLY_THREE_BRANCHES",
):
    for name, body in files.items():
        if stale in body:
            raise SystemExit(f"{name}: stale marker remains: {stale}")

print("PASS_STAGE7_ACCEPTED_MEMORY_SYNC")
