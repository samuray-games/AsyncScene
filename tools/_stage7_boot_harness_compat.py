#!/usr/bin/env python3
from pathlib import Path

for path in (Path("AsyncScene/Web/ui/ui-boot.js"), Path("docs/ui/ui-boot.js")):
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

print("PASS_BOOT_HARNESS_COMPAT_WITH_PRODUCTION_90")
