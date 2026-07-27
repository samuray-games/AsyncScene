import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "AsyncScene" / "Web"
DOCS = ROOT / "docs"


PROFILES = {
    "boomer": (
        "Асинхронная онлайн-игра: играйте тогда, когда вам удобно.",
        "Не нужно собираться одновременно - каждый заходит в игру в своё время.",
    ),
    "genX": (
        "Асинхронная онлайн-игра. Заходи когда удобно.",
        "Не надо ждать остальных онлайн - каждый играет в своё время.",
    ),
    "millennial": (
        "Асинхронная онлайн-игра: заходи когда удобно.",
        "Не нужно совпадать по расписанию - каждый играет в своё время.",
    ),
    "zoomer": (
        "Асинхронная онлайн-игра. Играй когда удобно.",
        "Не надо ждать всех онлайн - каждый заходит когда хочет.",
    ),
    "alpha": (
        "асинхронная игра · играй когда хочешь",
        "все онлайн сразу не нужны",
    ),
}

OBSOLETE = (
    "Соперник определяет уровень риска.",
    "Выбранная ставка списывается из запаса монет 💰.",
    "Результат показывается сразу.",
    "Стоимость действия и его результат показываются сразу.",
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class FiveProfileRuntimeDefectStaticTests(unittest.TestCase):
    def test_start_screen_intro_contract_is_two_lines_without_legacy_copy(self) -> None:
        for root in (WEB, DOCS):
            boot = read(root / "ui" / "ui-boot.js")
            profile = read(root / "ui" / "ui-profile-visual-tone-repair.js")
            for line1, line2 in PROFILES.values():
                self.assertIn(line1, boot + profile)
                self.assertIn(line2, boot + profile)
            for bad in OBSOLETE:
                self.assertNotIn(bad, boot)
                self.assertNotIn(bad, profile)
            self.assertNotIn('resolveStartScreenText(D, "introLines[2]", activeProfile)', boot)
            self.assertIn('"introLines[2]": ""', profile)
            self.assertIn('economyHonestyLine: ""', profile)
            self.assertRegex(boot, r"introLines\.slice\(0,\s*2\)\.forEach")

    def test_topbar_titles_are_words_for_each_profile(self) -> None:
        for root in (WEB, DOCS):
            core = read(root / "ui" / "ui-core.js")
            index = read(root / "index.html")
            self.assertNotIn('title="⭐"', index)
            self.assertNotIn('title="💰"', index)
            for word in ("Репутация", "Баланс", "Репа", "влияние", "репа", "баланс", "победы"):
                self.assertIn(word, core)
            self.assertIn("UI.syncTopbarStatTitles = syncTopbarStatTitles", core)

    def test_unified_stat_toast_has_no_timer_dismissal(self) -> None:
        for root in (WEB, DOCS):
            profile = read(root / "ui" / "ui-profile-visual-tone-repair.js")
            self.assertNotIn("VISIBLE_MS", profile)
            self.assertNotRegex(profile, r"hideTimer\s*=\s*setTimeout")
            self.assertIn('el.onclick = () => {', profile)
            self.assertIn('toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };', profile)


if __name__ == "__main__":
    unittest.main()
