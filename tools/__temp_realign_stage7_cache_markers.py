from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
NEW = "stage7_14_durable_aftermath_dm_contact_20260807a"
PATHS = [
    "tools/test_stage7_7_preunlock_corridor.py",
    "tools/test_stage7_9_deny_evidence_payoff.py",
    "tools/test_stage7_10_accuse_ken_payoffs.py",
    "tools/test_stage7_11_pay_branch_payoffs.py",
    "tools/test_stage7_12_first_real_battle_aftermath.py",
    "tools/test_stage7_13_aftermath_dm_followup.py",
    "tools/test_stage7_first_causal_vertical_slice.py",
    "tools/test_stage7_observed_evidence_harness.py",
]
pattern = re.compile(r"stage7_13_aftermath_dm_followup_20260806[a-c]")
changed = []
for rel in PATHS:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    updated, count = pattern.subn(NEW, text)
    if count:
        path.write_text(updated, encoding="utf-8")
        changed.append((rel, count))
print("STAGE714_CACHE_MARKERS_REALIGNED", changed)
