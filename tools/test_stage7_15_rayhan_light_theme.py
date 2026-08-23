from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/style-base.css"
DOCS = ROOT / "docs/style-base.css"
BATTLES = ROOT / "AsyncScene/Web/ui/ui-battles.js"
PROFILE_SOURCE = ROOT / "AsyncScene/Web/ui-profile-themes.css"
PROFILE_DOCS = ROOT / "docs/ui-profile-themes.css"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(SOURCE.read_bytes() == DOCS.read_bytes(), "style-base mirrors differ")
require(PROFILE_SOURCE.read_bytes() == PROFILE_DOCS.read_bytes(), "profile theme mirrors differ")
style = SOURCE.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
profiles = PROFILE_SOURCE.read_text(encoding="utf-8")

require('return "chip hiddenPower"' in battles, "battle argument hiddenPower element class is missing")
require(".battleCard .chip.hiddenPower" in style, "battle argument styling selector is missing")
require("color:var(--hiddenText) !important;" in style, "hidden argument token does not override inline white text")
require("background:var(--chipHiddenBg);" in style, "hidden argument background token changed or disappeared")
require("border-color:var(--chipHiddenBorder);" in style, "hidden argument border token changed or disappeared")


def parse_color(value):
    value = value.strip()
    if value.startswith("#"):
        raw = value[1:]
        if len(raw) == 3:
            raw = "".join(char * 2 for char in raw)
        return tuple(int(raw[index:index + 2], 16) / 255 for index in (0, 2, 4)) + (1.0,)
    match = re.fullmatch(r"rgba\((\d+),(\d+),(\d+)\.?(\d*)\s*,\s*([0-9.]+)\)", value.replace(" ", ""))
    if not match:
        raise AssertionError(f"unsupported CSS color token: {value}")
    return tuple(int(match.group(index)) / 255 for index in (1, 2, 3)) + (float(match.group(5)),)


def composite(foreground, background):
    alpha = foreground[3]
    return tuple(foreground[index] * alpha + background[index] * (1 - alpha) for index in range(3)) + (1.0,)


def luminance(color):
    channels = []
    for channel in color[:3]:
        channels.append(channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast(first, second):
    high, low = sorted((luminance(first), luminance(second)), reverse=True)
    return (high + 0.05) / (low + 0.05)


light_profiles = {
    "boomer": ("#f7ecd8", "rgba(35,62,92,.09)", "#28231e"),
    "millennial": ("#f4f0f6", "rgba(42,157,145,.08)", "#292734"),
    "alpha": ("#edf9fc", "rgba(120,104,255,.07)", "#17243a"),
}
for profile, (card_bg, chip_bg, hidden_text) in light_profiles.items():
    effective_background = composite(parse_color(chip_bg), parse_color(card_bg))
    effective_text = parse_color(hidden_text)
    require(
        contrast(effective_text, effective_background) >= 4.5,
        f"{profile} hidden argument contrast is below WCAG AA",
    )

dark_profiles = {
    "genX": "#ece8df",
    "zoomer": "#f7f4ff",
}
for profile, expected in dark_profiles.items():
    block = re.search(rf'body\[data-ui-profile="{profile}"\]\{{(.*?)\n\}}', profiles, re.S)
    require(block and f"--hiddenText:{expected};" in block.group(1), f"{profile} hidden text token changed")

for path in (BATTLES,):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

print("PASS_STAGE7_15_RAYHAN_LIGHT_THEME_UI")
