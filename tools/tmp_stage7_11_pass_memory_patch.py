from pathlib import Path
import re

REV = "2026-08-06-1818-JST"
MERGE_SHA = "974794f45855f4d6c982945f8f59b64e9f36494c"
NEXT = "IMPLEMENT_STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_CONSEQUENCE"


def read(path):
    return Path(path).read_text(encoding="utf-8")


def write(path, text):
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one anchor, found {count}")
    return text.replace(old, new, 1)


def replace_field(text, key, value):
    pattern = rf"(?m)^{re.escape(key)}:.*$"
    new, count = re.subn(pattern, f"{key}: {value}", text, count=1)
    if count != 1:
        raise SystemExit(f"field missing: {key}")
    return new

# TASKS.md
path = "TASKS.md"
text = read(path)
section = f'''## 2026-08-06 - Stage 7.11 pay payoff Safari acceptance
- User returned explicit `PASS` for both `pay` paths in iPhone Safari private sessions.
- Accepted runtime: PR #299 squash merge `{MERGE_SHA}`.
- Accepted receipt path: exactly three canonical defenses persist; the matching-family defense is marked `✓ По расписке`, survives refresh as the same selectable object and does not duplicate.
- Accepted pressure path: one bridge-only `Разобрать давление` action marks one wrong-family defense as `⚠ Давление Олега`; refresh preserves the mark and does not restore the action.
- Accepted boundary: ordinary battles do not inherit Stage 7.11 behavior.
- Validation evidence: implementation `31064685194` PASS; PR forensics `31064904412` PASS; post-merge forensics `31064952276` PASS; Pages build `1134942356` built without error.
- Stage 7.12 selected: persist the actual first bridge-battle outcome into the affected NPC memory and show one non-blocking normal-world aftermath reaction exactly once. Preserve refresh recovery, ordinary battles, economy, settlement, conflict core/API and argument canon.
- NEXT_ACTION: `{NEXT}`.

'''
if not text.startswith("## 2026-08-06 - Stage 7.11 pay payoff Safari acceptance"):
    text = section + text
write(path, text)

# PROJECT_MEMORY.md
path = "PROJECT_MEMORY.md"
text = read(path)
for key, value in {
    "REPO_MEMORY_REV": REV,
    "NOTION_MEMORY_REV": REV,
    "CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE": MERGE_SHA,
    "CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE": MERGE_SHA,
    "ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD": MERGE_SHA,
    "LATEST_MERGED_RUNTIME_HEAD": MERGE_SHA,
    "CURRENT_STATUS": "STAGE7_ACTIVE / STAGE7_11_USER_ACCEPTED / STAGE7_12_SELECTED",
    "NEXT_ACTION": NEXT,
}.items():
    text = replace_field(text, key, value)
text = replace_once(
    text,
    "STAGE_7_10: COMPLETE / ACCUSE_KEN_TACTICAL_PAYOFFS_USER_ACCEPTED\nSTAGE7_10_MERGE_SHA:",
    "STAGE_7_10: COMPLETE / ACCUSE_KEN_TACTICAL_PAYOFFS_USER_ACCEPTED\nSTAGE_7_11: COMPLETE / PAY_TACTICAL_PAYOFFS_USER_ACCEPTED\nSTAGE7_11_MERGE_SHA: " + MERGE_SHA + "\nSTAGE7_11_VALIDATION: implementation 31064685194 PASS / PR 31064904412 PASS / postmerge 31064952276 PASS\nSTAGE7_11_PAGES_BUILD: 1134942356 / built / no error\nSTAGE7_11_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_SESSIONS\nSTAGE7_10_MERGE_SHA:",
    "project memory stage insertion",
)
start = "Repository implementation and user acceptance are current through merged runtime"
end = "Archives and backups are historical evidence."
if start not in text or end not in text:
    raise SystemExit("project memory narrative anchors missing")
prefix, rest = text.split(start, 1)
_, suffix = rest.split(end, 1)
narrative = f'''Repository implementation and user acceptance are current through merged runtime `{MERGE_SHA}`. Stage 7.11 is accepted on iPhone Safari: receipt marks the exact matching-family canonical defense, ignored pressure provides one exactly-once wrong-family analysis mark, both exact three-choice snapshots survive refresh, remain selectable and stay isolated from ordinary battles.

The next atomic causal-depth slice is Stage 7.12. When the first real bridge battle reaches a real terminal outcome, persist one branch-aware aftermath record into the affected existing NPC memory and present one non-blocking normal-world reaction card. The reaction must derive from the actual battle result, survive refresh until acknowledged, acknowledge exactly once, and never affect ordinary battles, economy, settlement, conflict core/API or argument canon.

'''
text = prefix + narrative + end + suffix
write(path, text)

# .ai-memory/CURRENT.md
path = ".ai-memory/CURRENT.md"
text = read(path)
for key, value in {
    "MEMORY_REV": REV,
    "NOTION_MEMORY_REV": REV,
    "CURRENT_STATUS": "STAGE7_ACTIVE / STAGE7_11_USER_ACCEPTED / STAGE7_12_SELECTED",
    "ACTIVE_TASK": "STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_CONSEQUENCE",
    "CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE": MERGE_SHA,
    "CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE": MERGE_SHA,
    "ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD": MERGE_SHA,
    "LATEST_MERGED_RUNTIME_HEAD": MERGE_SHA,
    "NEXT_ACTION": NEXT,
}.items():
    text = replace_field(text, key, value)
text = replace_once(
    text,
    "STAGE_7_10: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE7_10_PAGES_BUILD:",
    "STAGE_7_10: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE_7_11: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE7_11_PAGES_BUILD: 1134942356 / built / no error\nSTAGE7_11_USER_VERDICT: PASS / IPHONE_SAFARI_PRIVATE_SESSIONS\nSTAGE7_10_PAGES_BUILD:",
    "current stage insertion",
)
anchor = "Stage 7.10 is merged and user-accepted"
if anchor not in text:
    raise SystemExit("current narrative anchor missing")
head, _ = text.split(anchor, 1)
text = head + f'''Stage 7.11 is merged and user-accepted at `{MERGE_SHA}`. Receipt marks the matching-family defense among the exact persisted three canonical choices. Ignored pressure provides one exactly-once `Разобрать давление` action that marks one wrong-family defense. Refresh restores the same selectable objects and never restores a consumed action. Both effects require the stable Stage 7 bridge and exact battle ID.

The next atomic runtime task is Stage 7.12. Persist the actual terminal outcome of the first real bridge battle into the affected existing NPC memory and show one branch-aware, non-blocking normal-world aftermath reaction until the player acknowledges it once. Do not add a new relationship subsystem, currency, location, NPC category, settlement change, conflict-core/API change or ordinary-battle behavior.
'''
write(path, text)

# .ai-memory/CANON.md
path = ".ai-memory/CANON.md"
text = read(path)
for key in ("MEMORY_REVISION", "EXPECTED_REVISION", "NOTION_MEMORY_REVISION"):
    text = replace_field(text, key, REV)
text = replace_once(
    text,
    "- Stage 7.11 is selected for the `pay` branch: receipt marks the matching defense family; ignored pressure exposes one persisted action that marks one wrong-family defense as Олег's pressure line. Both remain bridge-only and exactly once.\n\n## Superseding Stage 7 onboarding flow",
    f'''- Stage 7.11 is merged and user-accepted at `{MERGE_SHA}`. Receipt and ignored-pressure preparation each produce one persisted, exactly-once tactical mark over the exact three canonical defenses and remain isolated from ordinary battles.\n\n## Accepted Stage 7.11 product slice\n\n- PR #299 is merged and user-accepted at `{MERGE_SHA}`.\n- In the `pay` branch, `receiptDemanded` stores the exact three sanitized canonical defense objects and automatically marks the one whose normalized family matches the current incoming attack.\n- `pressureIgnored` exposes one bridge-only `Разобрать давление` action that marks one visible wrong-family defense. The action is consumed exactly once and does not return after refresh.\n- Both modes restore the exact selectable defense snapshot through `battle._defenseChoices`, expire unused pending analysis when the bridge battle finishes, and require the stable bridge ID plus exact battle ID.\n- Static evidence: implementation `31064685194` PASS; PR forensics `31064904412` PASS; post-merge forensics `31064952276` PASS; Pages build `1134942356` built without error.\n- User evidence: explicit iPhone Safari private-session `PASS` for receipt mark, pressure action, exact refresh persistence, post-refresh selection and ordinary-battle isolation.\n- Stage 7.12 is selected: persist the actual first bridge-battle terminal outcome into existing NPC memory and present one non-blocking, branch-aware normal-world aftermath reaction exactly once.\n\n## Superseding Stage 7 onboarding flow''',
    "canon Stage 7.11 insertion",
)
text = replace_once(
    text,
    "- Latest merged and user-accepted runtime implementation head is `58d79c60f852adf0d8f92b1809d793d43ca484bb`. PR #297 completed the `accuse_ken` tactical payoffs and the iPhone Safari private-session verdict is explicit `PASS`.",
    f"- Latest merged and user-accepted runtime implementation head is `{MERGE_SHA}`. PR #299 completed the `pay` tactical payoffs and the iPhone Safari private-session verdict is explicit `PASS`.",
    "canon latest head",
)
text = replace_once(
    text,
    "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 through Stage 7.10 are user-accepted. The active next slice is Stage 7.11 `pay` tactical differentiation inside the first real battle.",
    "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 through Stage 7.11 are user-accepted. The active next slice is Stage 7.12: one persisted, branch-aware aftermath consequence from the actual first real battle outcome into the normal world.",
    "canon active slice",
)
write(path, text)

# .ai-memory/WORKFLOWS.md
path = ".ai-memory/WORKFLOWS.md"
text = read(path)
for key in ("MEMORY_REVISION", "EXPECTED_REVISION", "NOTION_MEMORY_REVISION"):
    text = replace_field(text, key, REV)
text = replace_once(
    text,
    "Current execution handoff: Stage 6 is complete and accepted. Stage 7.10 `accuse_ken` tactical payoffs are merged and user-accepted at `58d79c60f852adf0d8f92b1809d793d43ca484bb`. Repository memory records the explicit iPhone Safari `PASS`. The exact next action is `IMPLEMENT_STAGE7_11_PAY_BRANCH_TACTICAL_PAYOFFS_IN_FIRST_REAL_BATTLE`.",
    f"Current execution handoff: Stage 6 is complete and accepted. Stage 7.11 `pay` tactical payoffs are merged and user-accepted at `{MERGE_SHA}`. Repository memory records the explicit iPhone Safari `PASS`. The exact next action is `{NEXT}`.",
    "workflow handoff",
)
text = replace_once(
    text,
    "15. Stage 7.11 applies the discipline to `pay`: receipt marks the matching defense family; ignored pressure exposes one persisted action that marks one wrong-family defense as Олег's pressure line. Both effects remain bridge-only, exactly once and presentation-only.\n16. Expand receipt, coalition, promise or broader witness systems only after each narrow payoff is separately accepted.",
    "15. Stage 7.11 applies the discipline to `pay`: receipt marks the matching defense family; ignored pressure exposes one persisted action that marks one wrong-family defense as Олег's pressure line. Both effects are now user-accepted.\n16. Stage 7.12 persists the actual first bridge-battle terminal outcome into the affected existing NPC memory and presents one branch-aware, non-blocking normal-world aftermath reaction. It must survive refresh until one acknowledgement, never replay after acknowledgement and remain isolated from ordinary battles.\n17. Expand receipt, coalition, promise or broader witness systems only after the aftermath consequence is separately accepted.",
    "workflow Stage 7.12 step",
)
text = replace_field(text, "NEXT_ACTION", NEXT)
write(path, text)

# Final consistency checks.
paths = [
    "TASKS.md",
    "PROJECT_MEMORY.md",
    ".ai-memory/CURRENT.md",
    ".ai-memory/CANON.md",
    ".ai-memory/WORKFLOWS.md",
]
for item in paths:
    data = read(item)
    if REV not in data:
        raise SystemExit(f"missing revision in {item}")
    if NEXT not in data:
        raise SystemExit(f"missing next action in {item}")
print("STAGE7_11_PASS_MEMORY_PATCH_OK", paths)
