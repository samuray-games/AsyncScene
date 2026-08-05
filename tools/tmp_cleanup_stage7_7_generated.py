from pathlib import Path

paths = [
    Path("AsyncScene/Web/ui/ui-stage7-first-experience.js"),
    Path("docs/ui/ui-stage7-first-experience.js"),
]

suffix = "})();\n})();\n"
for path in paths:
    text = path.read_text(encoding="utf-8")
    if not text.endswith(suffix):
        raise SystemExit(f"expected duplicate closure suffix in {path}")
    path.write_text(text[: -len(suffix)] + "})();\n", encoding="utf-8")

print("STAGE7_7_GENERATED_CLOSURE_CLEANUP_OK")
