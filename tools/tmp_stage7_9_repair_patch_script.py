from pathlib import Path

path = Path("tools/tmp_stage7_9_deny_evidence_patch.py")
text = path.read_text(encoding="utf-8")

old_open = "TEST = r'''from pathlib"
new_open = 'TEST = r"""from pathlib'
old_close = 'print("STAGE7_9_DENY_EVIDENCE_PAYOFF_OK")\n\'\'\'\nPath("tools/test_stage7_9_deny_evidence_payoff.py")'
new_close = 'print("STAGE7_9_DENY_EVIDENCE_PAYOFF_OK")\n"""\nPath("tools/test_stage7_9_deny_evidence_payoff.py")'
old_helper = (
    "def replace_once(text: str, old: str, new: str, label: str) -> str:\n"
    "    count = text.count(old)\n"
    "    if count != 1:\n"
    "        raise SystemExit(f\"{label}: expected one match, found {count}\")\n"
    "    return text.replace(old, new, 1)\n"
)
new_helper = (
    "def replace_once(text: str, old: str, new: str, label: str) -> str:\n"
    "    count = text.count(old)\n"
    "    if label == \"controller active resume payoff\":\n"
    "        if count < 1:\n"
    "            raise SystemExit(f\"{label}: expected at least one match, found {count}\")\n"
    "        return text.replace(old, new, 1)\n"
    "    if count != 1:\n"
    "        raise SystemExit(f\"{label}: expected one match, found {count}\")\n"
    "    return text.replace(old, new, 1)\n"
)
old_harness = (
    "try:\n"
    "    completed = subprocess.run([\"node\", harness_path], check=True, text=True, capture_output=True)\n"
    "    assert \"STAGE7_9_DENY_EVIDENCE_PAYOFF_DYNAMIC_OK\" in completed.stdout\n"
    "finally:\n"
)
new_harness = (
    "try:\n"
    "    completed = subprocess.run([\"node\", harness_path], check=False, text=True, capture_output=True)\n"
    "    if completed.returncode != 0:\n"
    "        raise AssertionError(\"node harness failed\\nSTDOUT:\\n\" + completed.stdout + \"\\nSTDERR:\\n\" + completed.stderr)\n"
    "    assert \"STAGE7_9_DENY_EVIDENCE_PAYOFF_DYNAMIC_OK\" in completed.stdout\n"
    "finally:\n"
)

anchors = [
    ("open", old_open, new_open),
    ("close", old_close, new_close),
    ("helper", old_helper, new_helper),
    ("harness", old_harness, new_harness),
]
for label, old, _ in anchors:
    if text.count(old) != 1:
        raise SystemExit(f"temporary patch repair {label} anchor changed: {text.count(old)}")
for _, old, new in anchors:
    text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
