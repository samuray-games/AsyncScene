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
    def test_target_reference_guard_blocks_nominative_and_plural_forms(self) -> None:
        expected_guard = r"/(?:^|[^\p{L}\p{N}_])(?:цель|цели)(?=$|[^\p{L}\p{N}_])/iu"
        blocked = ("Цель получила +1 ⭐.", "Цель: +1⭐.", "Цели +1⭐.")
        player_deltas = ("Репутация +1 ⭐.", "Репутация -1 ⭐.", "Баланс +1💰.", "Баланс -1💰.")
        for root in (WEB, DOCS):
            profile = read(root / "ui" / "ui-profile-visual-tone-repair.js")
            self.assertIn(expected_guard, profile)
            for text in blocked:
                self.assertRegex(text, r"(?iu)(?:^|[^\w])(?:цель|цели)(?=$|[^\w])")
            for text in player_deltas:
                self.assertNotRegex(text, r"(?iu)(?:^|[^\w])(?:цель|цели)(?=$|[^\w])")

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
            self.assertNotIn("DELTA_TOAST_LIFETIME_MS", profile)
            self.assertNotIn("ACTIVE_MERGE_MS", profile)
            self.assertNotIn("expiryTimer", profile)
            self.assertNotRegex(profile, r"hideTimer\s*=\s*setTimeout")
            self.assertIn('el.onclick = () => {', profile)
            self.assertIn('toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };', profile)

    def test_returning_start_label_is_exact_and_fresh_action_remains_separate(self) -> None:
        for root in (WEB, DOCS):
            data = read(root / "data.js")
            boot = read(root / "ui" / "ui-boot.js")
            profile = read(root / "ui" / "ui-profile-visual-tone-repair.js")
            self.assertGreaterEqual(data.count('start_continue: "Продолжить игру"'), 5)
            self.assertGreaterEqual(boot.count('start_continue: "Продолжить игру"'), 5)
            self.assertGreaterEqual(profile.count('start_continue: "Продолжить игру"'), 5)
            self.assertIn('const resumeMode = getOnboardingSeen(UI);', boot)
            self.assertIn('resumeMode ? resolveStartScreenText(D, "start_continue", activeProfile)', boot)
            self.assertIn('setOnboardingSeen(UI, true);', boot)
            self.assertIn('function restoreFreshStartScreenState(UI)', boot)
            self.assertIn('setOnboardingSeen(UI, false);', boot)

    def test_all_runtime_toasts_are_click_only_and_do_not_clear_unrelated_nodes(self) -> None:
        for root in (WEB, DOCS):
            events = read(root / "ui" / "ui-events.js")
            battles = read(root / "ui" / "ui-battles.js")
            menu = read(root / "ui" / "ui-menu.js")
            profile = read(root / "ui" / "ui-profile-visual-tone-repair.js")
            core = read(root / "ui" / "ui-core.js")
            for source in (events, battles, menu, profile, core):
                for forbidden in ("_lotteryToastTimer", "__voteToastTimer", "__btnToastTimer", "__chipToastTimer", "DELTA_TOAST_LIFETIME_MS", "expiryTimer", "ACTIVE_MERGE_MS"):
                    self.assertNotIn(forbidden, source)
            for source, function_name in ((events, "showVoteBtnToast"), (battles, "showBtnToastRight"), (battles, "showChipToastAbove"), (menu, "showLotteryToast")):
                match = re.search(rf"function {function_name}\b.*?(?=\n  function |\n  const |\n\Z)", source, re.S)
                self.assertIsNotNone(match, function_name)
                body = match.group(0)
                self.assertNotIn("setTimeout", body)
                self.assertRegex(body, r"onclick\s*=|\.onclick\s*=")
            self.assertNotIn("Hide all but newest identical toast", core)
            self.assertNotIn("De-dup stat toasts", core)
            self.assertNotIn("neutralizeLegacyStatToasts();\n    rerenderVisibleToast", profile)

    def test_profile_copy_and_vote_fallbacks_are_routed(self) -> None:
        for root in (WEB, DOCS):
            data = read(root / "data.js")
            events = read(root / "events.js")
            ui_events = read(root / "ui" / "ui-events.js")
            battles = read(root / "ui" / "ui-battles.js")
            self.assertIn('const profiles = ["boomer", "genX", "millennial", "zoomer", "alpha"]', ui_events)
            self.assertIn('resolveProfileCopy("vote.prompt"', ui_events)
            self.assertIn('resolveProfileCopy("vote.prompt"', battles)
            self.assertIn('D.resolveProfileCopy("vote.prompt")', events)
            self.assertNotIn(']. Выбирай, за кого топишь.', events)
            self.assertIn('"vote.prompt": "Имя задаёт сторону."', data)
            self.assertIn('"vote.prompt": "ВЫБЕРИ ИМЯ"', data)
            self.assertIn('"vote.prompt": "Выберите, кого вы поддерживаете."', data)


if __name__ == "__main__":
    unittest.main()
