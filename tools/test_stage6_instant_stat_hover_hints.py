import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "AsyncScene" / "Web"
DOCS = ROOT / "docs"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class InstantStatHoverHintTests(unittest.TestCase):
    def test_01_pointer_entry_shows_hint_without_a_timer(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        install = core.split("function installImmediateHoverHints()", 1)[1].split("function statAnchor", 1)[0]
        self.assertIn('addEventListener("pointerenter"', install)
        self.assertIn('setStatHoverHint(target, \"pointer\")', install)
        self.assertNotIn("setTimeout", install)
        self.assertNotIn("requestAnimationFrame", install)

    def test_02_migrated_native_titles_are_removed(self) -> None:
        index = read(WEB / "index.html")
        core = read(WEB / "ui" / "ui-core.js")
        menu = read(WEB / "ui" / "ui-menu.js")
        for title in ('title="Влияние"', 'title="Репутация"', 'title="Баланс"', 'title="Победы"'):
            self.assertNotIn(title, index)
        self.assertIn('icon.removeAttribute("title")', core)
        self.assertIn('wrap.removeAttribute("title")', core)
        self.assertIn('mneed.removeAttribute("title")', core)
        self.assertIn('lotTop.removeAttribute("title")', menu)

    def test_03_keyboard_focus_uses_the_same_hint(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        install = core.split("function installImmediateHoverHints()", 1)[1].split("function statAnchor", 1)[0]
        self.assertIn('addEventListener("focusin"', install)
        self.assertIn('addEventListener("focusout"', install)
        self.assertIn('setStatHoverHint(target, \"focus\")', install)
        self.assertIn('icon.setAttribute("tabindex", "0")', core)

    def test_04_pointerleave_only_hides_the_temporary_hint(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        install = core.split("function installImmediateHoverHints()", 1)[1].split("function statAnchor", 1)[0]
        hide = core.split("function hideStatHoverHint", 1)[1].split("function installImmediateHoverHints", 1)[0]
        self.assertIn('addEventListener("pointerleave"', install)
        self.assertIn('hideStatHoverHint(from, \"pointer\")', install)
        self.assertIn('hint.hidden = true', hide)
        self.assertNotIn(".statToast", hide)
        self.assertNotIn("lotteryToast", hide)

    def test_05_profile_changes_update_text_for_all_five_profiles(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        for profile in ("millennial", "genX", "zoomer", "alpha", "boomer"):
            self.assertRegex(core, rf"\b{profile}:\s*(?:TOPBAR_STAT_TITLES_DEFAULT|Object\.freeze)")
        self.assertIn('icon.setAttribute("data-stat-hover-hint", hint)', core)
        self.assertIn("setStatHoverHint(activeStatHoverHint)", core)
        self.assertIn("const titles = resolveTopbarStatTitles()", core)
        self.assertIn("attributeFilter: [\"data-ui-profile\"]", core)

    def test_06_two_stat_delta_toasts_keep_independent_identity(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        profile = read(WEB / "ui" / "ui-profile-visual-tone-repair.js")
        self.assertIn('toast.id = `statToast_delta_${kind}_${Date.now()}_${UI.__deltaToastSeq}`', core)
        self.assertIn('activeDeltaToasts[`${kind}:${toast.id}`]', core)
        self.assertIn("deltaToastStates[kind]", profile)

    def test_07_clicking_one_persistent_toast_does_not_dismiss_siblings(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        profile = read(WEB / "ui" / "ui-profile-visual-tone-repair.js")
        self.assertIn('toast.onclick = () => { try { toast.remove(); }', core)
        self.assertIn('el.onclick = () => {', profile)
        self.assertNotIn('querySelectorAll(".statToast").forEach', profile)

    def test_08_persistent_toasts_have_no_automatic_dismissal(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        profile = read(WEB / "ui" / "ui-profile-visual-tone-repair.js")
        menu = read(WEB / "ui" / "ui-menu.js")
        self.assertNotRegex(core, r"(?:statToast|actionToast)[^\n]*setTimeout")
        self.assertNotIn("VISIBLE_MS", profile)
        self.assertNotIn("expiryTimer", profile)
        lottery = menu.split("function showLotteryToast", 1)[1].split("function ensurePointsActions", 1)[0]
        self.assertNotIn("setTimeout", lottery)

    def test_09_repeated_hover_reuses_one_noninteractive_hint_node(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        css = read(WEB / "style-base.css")
        self.assertIn('document.getElementById("statHoverHint")', core)
        self.assertIn('hint.id = "statHoverHint"', core)
        self.assertIn("pointer-events:none", css)
        self.assertIn("transition:none", css)

    def test_10_touch_does_not_intercept_existing_controls(self) -> None:
        core = read(WEB / "ui" / "ui-core.js")
        install = core.split("function installImmediateHoverHints()", 1)[1].split("function statAnchor", 1)[0]
        menu = read(WEB / "ui" / "ui-menu.js")
        self.assertGreaterEqual(install.count('event.pointerType === "touch"'), 2)
        self.assertIn('e.target.closest("#btnLottery, #btnLotteryTop")', menu)
        self.assertIn("UI.lottery()", menu)

    def test_web_docs_copies_are_byte_identical_for_core_surfaces(self) -> None:
        for relative in (Path("index.html"), Path("style-base.css"), Path("ui/ui-core.js")):
            self.assertEqual(read(WEB / relative), read(DOCS / relative), str(relative))
        for root in (WEB, DOCS):
            menu = read(root / "ui" / "ui-menu.js")
            self.assertIn('lotTop.setAttribute("data-toast-hover-hint", unavailableText)', menu)
            self.assertNotIn("lotTop.title = unavailableText", menu)


if __name__ == "__main__":
    unittest.main(verbosity=2)
