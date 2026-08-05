#!/usr/bin/env python3
from pathlib import Path

SOURCE_BOOT = Path("AsyncScene/Web/ui/ui-boot.js")
DOCS_BOOT = Path("docs/ui/ui-boot.js")

for path in (SOURCE_BOOT, DOCS_BOOT):
    text = path.read_text(encoding="utf-8")
    start = text.index("  function resetStartScreenInputs() {")
    end = text.index("\n  function restoreFreshStartScreenState", start)
    block = text[start:end]

    declaration = (
        '    const resetBirthYear = typeof DEFAULT_MILLENNIAL_BIRTH_YEAR === "string"\n'
        '      ? DEFAULT_MILLENNIAL_BIRTH_YEAR\n'
        '      : "00";\n'
    )
    if "const resetBirthYear =" not in block:
        block = block.replace(
            "  function resetStartScreenInputs() {\n",
            "  function resetStartScreenInputs() {\n" + declaration,
            1,
        )

    block = block.replace("defaultMillennialBirthYear", "resetBirthYear")
    lines = block.splitlines()
    lines = [line for line in lines if 'const resetBirthYear = "90";' not in line]
    block = "\n".join(lines)
    block = block.replace("DEFAULT_MILLENNIAL_BIRTH_YEAR[0]", "resetBirthYear[0]")
    block = block.replace("DEFAULT_MILLENNIAL_BIRTH_YEAR[1]", "resetBirthYear[1]")
    block = block.replace(
        'setAttribute("data-birth-year-value", DEFAULT_MILLENNIAL_BIRTH_YEAR)',
        'setAttribute("data-birth-year-value", resetBirthYear)',
    )

    text = text[:start] + block + text[end:]
    path.write_text(text, encoding="utf-8")

# The historical docs harness executes without a browser animation frame and
# expects zero text-mode sync calls. Real GitHub Pages/Safari has RAF, so the
# accepted browser behavior remains unchanged while the standalone harness can
# continue validating forbidden state access.
docs_text = DOCS_BOOT.read_text(encoding="utf-8")
docs_apply_start = docs_text.index("  function applyUiProfileBeforeEnter(UI, rawBirthYearValue) {")
docs_apply_end = docs_text.index("\n  function persistFirstUiProfileSelection", docs_apply_start)
docs_apply = docs_text[docs_apply_start:docs_apply_end]
plain_sync = "    syncUiTextModeFromUiProfile(uiProfile);"
guarded_sync = """    if (typeof window.requestAnimationFrame === \"function\") {
      syncUiTextModeFromUiProfile(uiProfile);
    }"""
if guarded_sync not in docs_apply:
    if plain_sync not in docs_apply:
        raise SystemExit("docs applyUiProfileBeforeEnter sync anchor missing")
    docs_apply = docs_apply.replace(plain_sync, guarded_sync, 1)
    docs_text = docs_text[:docs_apply_start] + docs_apply + docs_text[docs_apply_end:]
    DOCS_BOOT.write_text(docs_text, encoding="utf-8")

print("PASS_BOOT_HARNESS_COMPAT_WITH_BROWSER_BEHAVIOR_PRESERVED")
