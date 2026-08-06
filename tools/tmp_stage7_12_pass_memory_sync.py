from pathlib import Path

REV = "2026-08-06-2101-JST"
MERGE = "4e27aa0d690127c7b495c9c690026f7bf58c621a"
NEXT = "AWAIT_EXPLICIT_USER_DIRECTION_FOR_NEXT_STAGE7_PRODUCT_SLICE"


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


# TASKS.md - prepend one accepted-state entry and preserve history.
path = "TASKS.md"
text = read(path)
entry = f'''## 2026-08-06 - Stage 7.12 first real battle aftermath Safari acceptance
- Memory revision: `{REV}`.
- User returned explicit `PASS` for the Stage 7.12 iPhone Safari acceptance gate.
- Accepted runtime: PR #301 squash merge `{MERGE}`.
- Accepted consequence: the actual terminal result of the exact first Stage 7 bridge battle is persisted and normalized for presentation as `win`, `lose`, or `interrupted`.
- Accepted NPC memory: the branch-aware aftermath is written once to Настя for `deny`, Райхан for `accuse_ken`, or Олег for `pay`.
- Accepted presentation: one non-blocking normal-world aftermath card survives refresh until `Понятно`, acknowledges exactly once, and never replays afterward.
- Accepted boundary: the effect requires the stable bridge ID plus exact bridge battle ID; ordinary battles, economy, settlement, conflict core/API, argument canon, data, state, and system remain unchanged.
- Validation evidence: implementation `31090336845` PASS; PR forensics `31090592343` PASS; post-merge forensics `31090666029` PASS; Pages build `1135514616` built without error from the exact merge SHA.
- No next runtime slice is selected by this acceptance-only synchronization.
- NEXT_ACTION: `{NEXT}`.

'''
if entry not in text:
    text = entry + text
write(path, text)


# PROJECT_MEMORY.md - compact current index.
path = "PROJECT_MEMORY.md"
text = read(path)
for old, new, label in [
    ("REPO_MEMORY_REV: 2026-08-06-1818-JST", f"REPO_MEMORY_REV: {REV}", "project repo rev"),
    ("NOTION_MEMORY_REV: 2026-08-06-1818-JST", f"NOTION_MEMORY_REV: {REV}", "project notion rev"),
    ("CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: 974794f45855f4d6c982945f8f59b64e9f36494c", f"CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MERGE}", "project baseline"),
    ("CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: 974794f45855f4d6c982945f8f59b64e9f36494c", f"CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MERGE}", "project acceptance sha"),
    ("ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: 974794f45855f4d6c982945f8f59b64e9f36494c", f"ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MERGE}", "project accepted head"),
    ("LATEST_MERGED_RUNTIME_HEAD: 974794f45855f4d6c982945f8f59b64e9f36494c", f"LATEST_MERGED_RUNTIME_HEAD: {MERGE}", "project latest head"),
    ("CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_11_USER_ACCEPTED / STAGE7_12_SELECTED", "CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_12_USER_ACCEPTED / NO_ACTIVE_RUNTIME_TASK", "project status"),
    ("NEXT_ACTION: IMPLEMENT_STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_CONSEQUENCE", f"NEXT_ACTION: {NEXT}", "project next"),
]:
    text = replace_once(text, old, new, label)
text = replace_once(
    text,
    "STAGE_7_11: COMPLETE / PAY_TACTICAL_PAYOFFS_USER_ACCEPTED\nSTAGE7_11_MERGE_SHA:",
    "STAGE_7_11: COMPLETE / PAY_TACTICAL_PAYOFFS_USER_ACCEPTED\nSTAGE_7_12: COMPLETE / FIRST_REAL_BATTLE_AFTERMATH_USER_ACCEPTED\nSTAGE7_12_MERGE_SHA: " + MERGE + "\nSTAGE7_12_VALIDATION: implementation 31090336845 PASS / PR 31090592343 PASS / postmerge 31090666029 PASS\nSTAGE7_12_PAGES_BUILD: 1135514616 / built / no error\nSTAGE7_12_USER_VERDICT: PASS / IPHONE_SAFARI\nSTAGE7_11_MERGE_SHA:",
    "project stage12 block",
)
old = "Repository implementation and user acceptance are current through merged runtime `974794f45855f4d6c982945f8f59b64e9f36494c`. Stage 7.11 is accepted on iPhone Safari: receipt marks the exact matching-family canonical defense, ignored pressure provides one exactly-once wrong-family analysis mark, both exact three-choice snapshots survive refresh, remain selectable and stay isolated from ordinary battles.\n\nThe next atomic causal-depth slice is Stage 7.12. When the first real bridge battle reaches a real terminal outcome, persist one branch-aware aftermath record into the affected existing NPC memory and present one non-blocking normal-world reaction card. The reaction must derive from the actual battle result, survive refresh until acknowledged, acknowledge exactly once, and never affect ordinary battles, economy, settlement, conflict core/API or argument canon."
new = f"Repository implementation and user acceptance are current through merged runtime `{MERGE}`. Stage 7.12 is accepted on iPhone Safari: the actual terminal result of the exact first bridge battle creates one branch-aware NPC-memory aftermath, one non-blocking card survives refresh until a single acknowledgement, and acknowledged aftermath never replays. Ordinary battles and protected mechanics remain isolated.\n\nNo later runtime slice is active. The next product decision requires a new explicit user instruction; this acceptance-only synchronization does not infer or start Stage 7.13."
text = replace_once(text, old, new, "project narrative")
write(path, text)


# .ai-memory/CURRENT.md - live compact state.
path = ".ai-memory/CURRENT.md"
text = read(path)
for old, new, label in [
    ("MEMORY_REV: 2026-08-06-1818-JST", f"MEMORY_REV: {REV}", "current rev"),
    ("NOTION_MEMORY_REV: 2026-08-06-1818-JST", f"NOTION_MEMORY_REV: {REV}", "current notion rev"),
    ("CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_11_USER_ACCEPTED / STAGE7_12_SELECTED", "CURRENT_STATUS: STAGE7_ACTIVE / STAGE7_12_USER_ACCEPTED / NO_ACTIVE_RUNTIME_TASK", "current status"),
    ("ACTIVE_TASK: STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_CONSEQUENCE", "ACTIVE_TASK: NONE / AWAITING_EXPLICIT_USER_DIRECTION", "current task"),
    ("CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: 974794f45855f4d6c982945f8f59b64e9f36494c", f"CURRENT_MAIN_SHA_AT_MEMORY_SYNC_BASELINE: {MERGE}", "current baseline"),
    ("CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: 974794f45855f4d6c982945f8f59b64e9f36494c", f"CURRENT_MAIN_SHA_AT_RUNTIME_ACCEPTANCE: {MERGE}", "current acceptance sha"),
    ("ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: 974794f45855f4d6c982945f8f59b64e9f36494c", f"ACCEPTED_RUNTIME_IMPLEMENTATION_HEAD: {MERGE}", "current accepted head"),
    ("LATEST_MERGED_RUNTIME_HEAD: 974794f45855f4d6c982945f8f59b64e9f36494c", f"LATEST_MERGED_RUNTIME_HEAD: {MERGE}", "current latest head"),
    ("NEXT_ACTION: IMPLEMENT_STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_CONSEQUENCE", f"NEXT_ACTION: {NEXT}", "current next"),
]:
    text = replace_once(text, old, new, label)
text = replace_once(
    text,
    "STAGE_7_11: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE7_11_PAGES_BUILD:",
    "STAGE_7_11: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE_7_12: COMPLETE / USER_SAFARI_ACCEPTANCE_PASS\nSTAGE7_12_PAGES_BUILD: 1135514616 / built / no error\nSTAGE7_12_USER_VERDICT: PASS / IPHONE_SAFARI\nSTAGE7_12_MERGE_SHA: " + MERGE + "\nSTAGE7_11_PAGES_BUILD:",
    "current stage12 block",
)
old = "Stage 7.11 is merged and user-accepted at `974794f45855f4d6c982945f8f59b64e9f36494c`. Receipt marks the matching-family defense among the exact persisted three canonical choices. Ignored pressure provides one exactly-once `Разобрать давление` action that marks one wrong-family defense. Refresh restores the same selectable objects and never restores a consumed action. Both effects require the stable Stage 7 bridge and exact battle ID.\n\nThe next atomic runtime task is Stage 7.12. Persist the actual terminal outcome of the first real bridge battle into the affected existing NPC memory and show one branch-aware, non-blocking normal-world aftermath reaction until the player acknowledges it once. Do not add a new relationship subsystem, currency, location, NPC category, settlement change, conflict-core/API change or ordinary-battle behavior."
new = f"Stage 7.12 is merged and user-accepted at `{MERGE}`. The actual terminal result of the exact first bridge battle persists one branch-aware aftermath in Настя, Райхан, or Олег memory; one non-blocking reaction survives refresh until a single `Понятно`, and acknowledged aftermath never replays. Exact bridge and battle IDs isolate the effect from ordinary battles.\n\nNo runtime task is active. A later Stage 7 slice may be selected only after a new explicit user instruction."
text = replace_once(text, old, new, "current narrative")
write(path, text)


# .ai-memory/CANON.md - durable accepted product fact, no inferred next slice.
path = ".ai-memory/CANON.md"
text = read(path)
for old, new, label in [
    ("MEMORY_REVISION: 2026-08-06-1818-JST", f"MEMORY_REVISION: {REV}", "canon rev"),
    ("EXPECTED_REVISION: 2026-08-06-1818-JST", f"EXPECTED_REVISION: {REV}", "canon expected"),
    ("NOTION_MEMORY_REVISION: 2026-08-06-1818-JST", f"NOTION_MEMORY_REVISION: {REV}", "canon notion"),
]:
    text = replace_once(text, old, new, label)
text = replace_once(
    text,
    "- Stage 7.12 is selected: persist the actual first bridge-battle terminal outcome into existing NPC memory and present one non-blocking, branch-aware normal-world aftermath reaction exactly once.\n\n## Superseding Stage 7 onboarding flow",
    f'''- Stage 7.12 is merged and user-accepted at `{MERGE}`.\n\n## Accepted Stage 7.12 product slice\n\n- PR #301 is merged and user-accepted at `{MERGE}`.\n- The exact first Stage 7 bridge battle preserves its raw terminal `battle.result` and normalizes presentation to `win`, `lose`, or `interrupted`.\n- One branch-aware aftermath record is written exactly once into existing NPC memory: Настя for `deny`, Райхан for `accuse_ken`, or Олег for `pay`.\n- One normal-world aftermath card is non-blocking, survives refresh while pending, acknowledges once through `Понятно`, and never replays after acknowledgement.\n- Lifecycle and recording require both stable bridge ID `stage7_first_real_argument_battle_v1` and the exact persisted bridge battle ID. Ordinary battles and protected mechanics remain unchanged.\n- Static evidence: implementation `31090336845` PASS; PR forensics `31090592343` PASS; post-merge forensics `31090666029` PASS; Pages build `1135514616` built without error.\n- User evidence: explicit iPhone Safari `PASS` for branch-aware reaction, non-blocking normal-world access, refresh persistence, exactly-once acknowledgement, no replay, and ordinary-battle isolation.\n- No later runtime slice is canonically selected by this acceptance.\n\nCURRENT_NEXT_ACTION: {NEXT}\n\n## Superseding Stage 7 onboarding flow''',
    "canon stage12 section",
)
text = replace_once(
    text,
    "- Latest merged and user-accepted runtime implementation head is `974794f45855f4d6c982945f8f59b64e9f36494c`. PR #299 completed the `pay` tactical payoffs and the iPhone Safari private-session verdict is explicit `PASS`.",
    f"- Latest merged and user-accepted runtime implementation head is `{MERGE}`. PR #301 completed the first-real-battle aftermath consequence and the iPhone Safari verdict is explicit `PASS`.",
    "canon latest accepted",
)
text = replace_once(
    text,
    "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 through Stage 7.11 are user-accepted. The active next slice is Stage 7.12: one persisted, branch-aware aftermath consequence from the actual first real battle outcome into the normal world.",
    "- Stage 7.6 later-reaction implementation is historical merged evidence only. Stage 7.7 through Stage 7.12 are user-accepted. No later runtime slice is active; selection requires a new explicit user instruction.",
    "canon active slice",
)
write(path, text)


# .ai-memory/WORKFLOWS.md - execution handoff and accepted workflow state.
path = ".ai-memory/WORKFLOWS.md"
text = read(path)
for old, new, label in [
    ("MEMORY_REVISION: 2026-08-06-1818-JST", f"MEMORY_REVISION: {REV}", "workflows rev"),
    ("EXPECTED_REVISION: 2026-08-06-1818-JST", f"EXPECTED_REVISION: {REV}", "workflows expected"),
    ("NOTION_MEMORY_REVISION: 2026-08-06-1818-JST", f"NOTION_MEMORY_REVISION: {REV}", "workflows notion"),
]:
    text = replace_once(text, old, new, label)
text = replace_once(
    text,
    "Current execution handoff: Stage 6 is complete and accepted. Stage 7.11 `pay` tactical payoffs are merged and user-accepted at `974794f45855f4d6c982945f8f59b64e9f36494c`. Repository memory records the explicit iPhone Safari `PASS`. The exact next action is `IMPLEMENT_STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_CONSEQUENCE`.",
    f"Current execution handoff: Stage 6 is complete and accepted. Stage 7.12 first-real-battle aftermath is merged and user-accepted at `{MERGE}`. Repository memory records the explicit iPhone Safari `PASS`. No runtime task is active. The exact next action is `{NEXT}`.",
    "workflows handoff",
)
text = replace_once(
    text,
    "16. Stage 7.12 persists the actual first bridge-battle terminal outcome into the affected existing NPC memory and presents one branch-aware, non-blocking normal-world aftermath reaction. It must survive refresh until one acknowledgement, never replay after acknowledgement and remain isolated from ordinary battles.\n17. Expand receipt, coalition, promise or broader witness systems only after the aftermath consequence is separately accepted.",
    "16. Stage 7.12 is user-accepted. The actual exact bridge-battle terminal outcome persists one branch-aware NPC-memory aftermath; the non-blocking reaction survives refresh until one acknowledgement, never replays afterward, and remains isolated from ordinary battles.\n17. Stage 7.12 acceptance permits later product consideration but does not itself select a receipt, coalition, promise, witness, or other expansion. A new explicit user instruction is required before another runtime slice begins.\n18. While no runtime task is active, the exact next action is `" + NEXT + "`.",
    "workflows stage12 accepted",
)
write(path, text)


# Cross-file fail-closed validation.
files = [
    "TASKS.md",
    "PROJECT_MEMORY.md",
    ".ai-memory/CURRENT.md",
    ".ai-memory/CANON.md",
    ".ai-memory/WORKFLOWS.md",
]
for filename in files:
    data = read(filename)
    if REV not in data:
        raise SystemExit(f"missing revision in {filename}")
    if NEXT not in data:
        raise SystemExit(f"missing next action in {filename}")

if read("PROJECT_MEMORY.md").count("STAGE7_12_USER_VERDICT: PASS") != 1:
    raise SystemExit("PROJECT_MEMORY Stage 7.12 verdict count mismatch")
if read(".ai-memory/CURRENT.md").count("STAGE7_12_USER_VERDICT: PASS") != 1:
    raise SystemExit("CURRENT Stage 7.12 verdict count mismatch")
if read(".ai-memory/CANON.md").count("## Accepted Stage 7.12 product slice") != 1:
    raise SystemExit("CANON Stage 7.12 section count mismatch")
if "STAGE7_12_FIRST_REAL_BATTLE_AFTERMATH_CONSEQUENCE" in read(".ai-memory/CURRENT.md"):
    raise SystemExit("CURRENT still claims Stage 7.12 as active task")

print("STAGE7_12_PASS_MEMORY_SYNC_PATCH_OK")
