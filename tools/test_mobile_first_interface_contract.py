#!/usr/bin/env python3
"""Static regressions for the mobile tabs, gestures, layout and mirror contract."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "AsyncScene" / "Web"
DOCS = ROOT / "docs"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class MobileFirstInterfaceContract(unittest.TestCase):
    def test_01_mobile_tablist_has_three_connected_tabs(self):
        html = read(WEB / "index.html")
        self.assertIn('id="mobilePanelTabs" class="mobilePanelTabs" role="tablist"', html)
        expected = {
            "mobileTabDm": ("dm", "dmBlock", "Личка"),
            "mobileTabBattles": ("battles", "battlesBlock", "Баттлы"),
            "mobileTabEvents": ("events", "eventsBlock", "События"),
        }
        for button_id, (key, panel_id, label) in expected.items():
            match = re.search(rf'<button id="{button_id}"([^>]*)>(.*?)</button>', html, re.S)
            self.assertIsNotNone(match, button_id)
            self.assertIn('role="tab"', match.group(1))
            self.assertIn(f'aria-controls="{panel_id}"', match.group(1))
            self.assertIn(f'data-mobile-tab="{key}"', match.group(1))
            self.assertIn(label, match.group(2))
            self.assertIn(f'data-mobile-count="{key}"', match.group(2))

    def test_02_mobile_only_css_keeps_desktop_shell_unmodified(self):
        css = read(WEB / "ui" / "mobile-ui.css")
        block = css.split("/* Mobile-first tabs keep the existing panel DOM mounted", 1)[1]
        self.assertIn("@media (max-width: 860px)", block)
        self.assertIn(".mobilePanelShell{display:contents}", block)
        self.assertIn("#mobilePanelTabs.mobilePanelTabs", block)
        self.assertIn("overflow-y:auto", block)
        self.assertIn("touch-action:pan-y", block)
        self.assertNotIn("touch-action:none", block)
        self.assertIn("env(safe-area-inset-top", block)
        self.assertIn("env(safe-area-inset-bottom", block)
        self.assertIn("100dvh", block)

    def test_03_tab_switch_changes_visibility_without_game_renders(self):
        mobile = read(WEB / "ui" / "ui-mobile.js")
        selector = mobile.split("function selectTab(key, focus)", 1)[1].split("function onTabKeydown", 1)[0]
        self.assertIn("syncA11yAndVisibility()", selector)
        self.assertNotIn("renderAll", selector)
        self.assertNotIn("renderDM", selector)
        self.assertNotIn("renderBattles", selector)
        self.assertNotIn("renderEvents", selector)
        self.assertIn("const panelScroll = new Map()", mobile)
        self.assertIn("savePanelScroll(previousPanel)", selector)
        self.assertIn("restorePanelScroll(panelElement(key))", selector)

    def test_04_tabs_use_existing_rendered_counters_and_never_auto_switch(self):
        mobile = read(WEB / "ui" / "ui-mobile.js")
        self.assertIn('dm: ["dmHeaderCount"]', mobile)
        self.assertIn('battles: ["battleCount"]', mobile)
        self.assertIn('events: ["eventsHeaderCount"]', mobile)
        self.assertIn("new MutationObserver(updateCounters)", mobile)
        self.assertNotIn('selectTab("events"', mobile)
        self.assertNotIn('selectTab("battles"', mobile)

    def test_05_swipes_are_panel_scoped_directional_and_cancelable(self):
        mobile = read(WEB / "ui" / "ui-mobile.js")
        self.assertIn('target.closest(".panelBody")', mobile)
        self.assertIn('event.pointerType !== "touch" && event.pointerType !== "pen"', mobile)
        self.assertIn("Math.abs(dx) < 56", mobile)
        self.assertIn("Math.abs(dx) <= Math.abs(dy) * 1.25", mobile)
        self.assertIn('document.addEventListener("pointercancel", resetSwipe', mobile)
        self.assertIn('document.addEventListener("lostpointercapture", resetSwipe', mobile)
        self.assertIn('button,input,textarea,select,a,[contenteditable', mobile)
        self.assertIn("isHorizontalScroller", mobile)
        self.assertNotIn('document.addEventListener("touchmove"', mobile)

    def test_06_resize_uses_existing_handle_and_keeps_preferences_in_page_memory(self):
        core = read(WEB / "ui" / "ui-core.js")
        self.assertIn('const handle = document.getElementById("chatResizeHandle")', core)
        self.assertIn("root.__mobilePinnedChatController", core)
        controller = core[core.index("function ensureMobilePinnedChatLayout") : core.index("UI.ensureMobilePinnedChatLayout")]
        self.assertIn('document.addEventListener("pointercancel",', controller)
        self.assertIn('handle.addEventListener("lostpointercapture",', controller)
        self.assertIn('event.key === "ArrowUp"', core)
        self.assertIn('event.key === "ArrowDown"', core)
        self.assertIn('event.key === "Home"', core)
        self.assertIn('event.key === "End"', core)
        self.assertNotIn("localStorage", core[core.index("function ensureMobilePinnedChatLayout") : core.index("UI.ensureMobilePinnedChatLayout")])
        self.assertIn("UI.applyMobilePanelDefaults = function(){ return false; }", core)

    def test_07_long_press_targets_help_surfaces_and_preserves_short_taps(self):
        mobile = read(WEB / "ui" / "ui-mobile.js")
        self.assertIn("520", mobile)
        self.assertIn("Math.hypot(event.clientX - longPress.x, event.clientY - longPress.y) > 9", mobile)
        self.assertIn('found.closest(".statToast,.lotteryToast,#statToastHost")', mobile)
        self.assertIn('document.addEventListener("contextmenu"', mobile)
        self.assertIn("if (hintTarget(event.target)) event.preventDefault()", mobile)
        self.assertNotIn('document.addEventListener("pointerleave"', mobile)
        self.assertNotIn("setTimeout(() =>.*statToast", mobile)

    def test_07a_active_stat_cap_hint_precedes_generic_icon_hint(self):
        mobile = read(WEB / "ui" / "ui-mobile.js")
        target = mobile.split("function hintTarget(target)", 1)[1].split("function ensureTooltip", 1)[0]
        self.assertIn('target.closest("[data-stat-cap-hint]")', target)
        self.assertIn("capText && capText.trim()", target)
        self.assertIn("const owner = target.closest", target)
        self.assertIn('return value.trim() ? { element: owner, text: value.trim() }', target)
        harness = read(ROOT / "tools" / "test_mobile_first_interface.html")
        self.assertIn('".pointsWrap .statIcon"', harness)
        self.assertIn("'[data-profile-stat=\"rep\"] .statIcon'", harness)
        self.assertIn("touched stat icon remains the hint's ARIA owner", harness)

    def test_07b_active_tabs_preserve_renderer_hidden_states(self):
        css = read(WEB / "ui" / "mobile-ui.css")
        self.assertIn('#blocks[data-active-tab="dm"] > #dmBlock:not(.hidden)', css)
        self.assertIn('#battlesBody:not(.hidden)', css)
        self.assertIn('#eventsBody:not(.hidden)', css)
        self.assertNotIn('#blocks[data-active-tab="dm"] > #dmBlock{display:flex!important}', css)
        harness = read(ROOT / "tools" / "test_mobile_first_interface.html")
        self.assertIn("fresh DM state must start closed", harness)
        self.assertIn("UI.closeDM must own the closed DM hidden state", harness)
        self.assertIn("selected battle tab must preserve gated/closed hidden state", harness)
        self.assertIn("renderer's collapsed hidden body", harness)

    def test_08_existing_toast_and_desktop_hint_contracts_remain(self):
        core = read(WEB / "ui" / "ui-core.js")
        self.assertIn("COALESCE_MS = 90", read(WEB / "ui" / "ui-profile-visual-tone-repair.js"))
        self.assertIn("UI.showStatToast", core)
        self.assertIn("installImmediateHoverHints", core)
        self.assertIn('addEventListener("focusin"', core)
        self.assertIn('addEventListener("pointerenter"', core)
        self.assertIn("mobileLongPressHint", read(WEB / "ui" / "ui-mobile.js"))
        self.assertIn(".statToast", read(WEB / "ui" / "ui-mobile.js"))

    def test_09_mobile_module_is_wired_after_existing_renderers_and_mirrors_match(self):
        html = read(WEB / "index.html")
        self.assertIn('src="ui/ui-mobile.js?v=mobile_first_interface_20261014a"', html)
        self.assertGreater(html.index('src="ui/ui-stage7-essence.js'), html.index('src="ui/ui-boot.js'))
        for relative in (
            Path("index.html"),
            Path("style-base.css"),
            Path("ui/ui-core.js"),
            Path("ui/ui-battles.js"),
            Path("ui/ui-events.js"),
            Path("ui/ui-dm.js"),
            Path("ui/ui-mobile.js"),
            Path("ui/mobile-ui.css"),
        ):
            self.assertEqual(read(WEB / relative), read(DOCS / relative), str(relative))


if __name__ == "__main__":
    unittest.main(verbosity=2)
