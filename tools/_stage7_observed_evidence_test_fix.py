#!/usr/bin/env python3
from pathlib import Path

path = Path("tools/test_stage7_first_causal_vertical_slice.py")
text = path.read_text(encoding="utf-8")
old = "require('if (existing && existing.worldAdvanceSettled)' in claim_resume, \"completed resume gate missing\")"
new = "require('if (existing && existing.worldAdvanceSettled && !hasPendingEvidenceReport(existing))' in claim_resume, \"completed resume gate with pending-report exception missing\")"
if text.count(old) != 1:
    raise SystemExit(f"resume assertion anchor count: {text.count(old)}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("PASS_STAGE7_RESUME_ASSERTION_ALIGNMENT")
