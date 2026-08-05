#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS_PATHS = [
    ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js",
    ROOT / "docs/ui/ui-stage7-first-experience.js",
]
INDEX_PATHS = [
    ROOT / "AsyncScene/Web/index.html",
    ROOT / "docs/index.html",
]
TEST_PATH = ROOT / "tools/test_stage7_first_causal_vertical_slice.py"

NEW_CLAIM_RESUME = '''  function claimResume(nextContext) {
    const existing = loadSnapshot();
    if (existing && existing.worldAdvanceSettled) {
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    const migratedLegacySave = !existing;
    snapshot = existing || defaultSnapshot();
    if (snapshot.stateId === "completed") snapshot.stateId = "main_unlocked";
    const dueOnReturn = snapshot.stateId === "main_unlocked"
      && snapshot.awaitingWorldAdvance
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (dueOnReturn) {
      snapshot.worldAdvancePresented = true;
      snapshot.worldAdvancePresentationMode = "return";
    } else if (snapshot.stateId === "main_unlocked" && snapshot.freedomCardShown && !snapshot.freedomCardDismissed) {
      snapshot.freedomCardDismissed = true;
    }
    saveSnapshot();
    attach(nextContext);
    telemetry("first_experience.entry_opened", { mode: migratedLegacySave ? "legacy_resume_migration" : "resume" });
    if (migratedLegacySave) {
      telemetry("first_experience.legacy_save_migrated");
      telemetry("first_experience.prelude_started");
    }
    if (dueOnReturn) telemetry("first_experience.world_advance_presented", { mode: "return", worldAdvanceId: snapshot.worldAdvanceId });
    return {
      claimed: true,
      mode: migratedLegacySave ? "legacy_resume_migration" : "resume",
      stateId: snapshot.stateId,
      releaseNormalWorld: releaseNormalWorldOnce,
    };
  }
'''

for path in JS_PATHS:
    text = path.read_text(encoding="utf-8")
    start = text.index("  function claimResume(nextContext) {")
    end = text.index("\n  function isPending()", start)
    text = text[:start] + NEW_CLAIM_RESUME + text[end:]
    path.write_text(text, encoding="utf-8")

old_ref = "ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805a"
new_ref = "ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805b"
for path in INDEX_PATHS:
    text = path.read_text(encoding="utf-8")
    if text.count(old_ref) != 1:
      raise SystemExit(f"unexpected cache-buster anchor count in {path}: {text.count(old_ref)}")
    path.write_text(text.replace(old_ref, new_ref, 1), encoding="utf-8")

test = TEST_PATH.read_text(encoding="utf-8")
test = test.replace(
    "js_ref = 'ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805a'",
    "js_ref = 'ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805b'",
    1,
)
anchor = 'require(js.count(\'const WORLD_ADVANCE_DELAY_MS = 45_000;\') == 1, "45-second constant must appear once")\n'
assertions = '''\nclaim_resume_start = js.index("  function claimResume(nextContext) {")
claim_resume_end = js.index("\\n  function isPending()", claim_resume_start)
claim_resume = js[claim_resume_start:claim_resume_end]
require('if (existing && existing.worldAdvanceSettled)' in claim_resume, "completed resume gate missing")
require('const migratedLegacySave = !existing;' in claim_resume, "legacy-save migration detection missing")
require('snapshot = existing || defaultSnapshot();' in claim_resume, "legacy save must bootstrap first-experience snapshot")
require('mode: migratedLegacySave ? "legacy_resume_migration" : "resume"' in claim_resume, "legacy migration mode missing")
require('first_experience.legacy_save_migrated' in claim_resume, "legacy migration telemetry missing")
require('if (!existing || existing.worldAdvanceSettled)' not in claim_resume, "legacy saves must not bypass Stage 7 resume")
'''
if assertions.strip() not in test:
    if anchor not in test:
        raise SystemExit("test insertion anchor missing")
    test = test.replace(anchor, anchor + assertions, 1)
TEST_PATH.write_text(test, encoding="utf-8")

print("PASS_STAGE7_LEGACY_RESUME_MIGRATION_PATCH")
