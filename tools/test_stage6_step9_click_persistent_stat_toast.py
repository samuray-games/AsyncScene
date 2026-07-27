import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ClickPersistentStatToastTests(unittest.TestCase):
    def test_unified_toast_is_click_persistent_across_mirrors(self) -> None:
        for path in (
            ROOT / "AsyncScene" / "Web" / "ui" / "ui-profile-visual-tone-repair.js",
            ROOT / "docs" / "ui" / "ui-profile-visual-tone-repair.js",
        ):
            source = path.read_text(encoding="utf-8")
            flush = source[source.index("function flushUnifiedToast") : source.index("function scheduleToastFlush")]
            self.assertIn('el.style.display = "block";', flush)
            self.assertNotIn("setTimeout", flush)
            self.assertNotIn("hideTimer", flush)
            ensure = source[source.index("function ensureUnifiedToast") : source.index("function resolvePendingBurst")]
            self.assertIn("el.onclick", ensure)
            self.assertRegex(ensure, re.escape("toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };"))


if __name__ == "__main__":
    unittest.main()
