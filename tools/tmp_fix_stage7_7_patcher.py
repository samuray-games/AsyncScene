from pathlib import Path

path = Path("tools/tmp_stage7_7_preunlock_corridor_patch.py")
text = path.read_text(encoding="utf-8")
needle = '''for forbidden in [
'''
insertion = '''text = replace_between(
    text,
    '  function renderEvidenceReport(panel) {\\n',
    '  function getRoundTwoResult() {\\n',
    '',
    "remove obsolete blocking report",
)

'''
if insertion not in text:
    if needle not in text:
        raise SystemExit("forbidden marker loop missing")
    text = text.replace(needle, insertion + needle, 1)
path.write_text(text, encoding="utf-8")
print("STAGE7_7_PATCHER_REPAIRED")
