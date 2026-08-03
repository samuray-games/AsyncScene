import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "AsyncScene" / "Web"
DOCS = ROOT / "docs"


class ProfileBootstrapFindingsTests(unittest.TestCase):
    def test_mirrored_bootstrap_contract_and_exact_copy_surfaces(self) -> None:
        for root in (WEB, DOCS):
            data = (root / "data.js").read_text(encoding="utf-8")
            boot = (root / "ui" / "ui-boot.js").read_text(encoding="utf-8")
            events = (root / "ui" / "ui-events.js").read_text(encoding="utf-8")
            battles = (root / "ui" / "ui-battles.js").read_text(encoding="utf-8")
            dm = (root / "ui" / "ui-dm.js").read_text(encoding="utf-8")

            self.assertIn('const DEFAULT_MILLENNIAL_BIRTH_YEAR = "90";', boot)
            self.assertIn('data-birth-year-value", DEFAULT_MILLENNIAL_BIRTH_YEAR', boot)
            self.assertIn('supportedUiProfileSet = new Set', boot)
            self.assertIn('registry.supported.map(normalizeSupportedProfile)', boot)
            self.assertIn('["default", "boomer", "genX", "millennial", "zoomer", "alpha"]', boot)
            self.assertIn('id="startBirthYearFeelingLabel" class="startFieldLabel" hidden', boot)
            self.assertIn('id="startBirthYearFeelingInput" class="input"', boot)
            self.assertIn('style="display:none;visibility:hidden;opacity:0;"', boot)
            self.assertIn('{ input: "45", year: 1945, profile: "industrial" }', boot)
            self.assertIn('{ input: "46", year: 1946, profile: "boomer" }', boot)
            self.assertIn('{ input: "65", year: 1965, profile: "genX" }', boot)
            self.assertIn('{ input: "81", year: 1981, profile: "millennial" }', boot)
            self.assertIn('{ input: "97", year: 1997, profile: "zoomer" }', boot)
            self.assertIn('{ input: "13", year: 2013, profile: "alpha" }', boot)
            self.assertIn('const currentYearInput = String(currentYear % 100).padStart(2, "0");', boot)
            self.assertIn('applyUiProfileBeforeEnter(UI, "90");', boot)
            self.assertIn('profile: "industrial" }', boot)
            self.assertNotIn('profile: "silent"', boot)

            for exact in (
                '"argument.select": "Выбери аргумент."',
                '"argument.select.defense": "Выбери контраргумент."',
                '"argument.select.player": "Выбери игрока."',
                '"vote.choice": "Твой выбор"',
                '"vote.not_voted": "Ты ещё не проголосовал."',
                '"vote.not_voted": "Голос ещё не отдан."',
                '"vote.prompt": "Выберите, кого вы поддерживаете."',
                '"argument.select": "Выберите аргумент."',
                '"argument.select.defense": "Выберите контраргумент."',
                '"argument.select.player": "Выберите игрока."',
                '"vote.choice": "Ваш выбор"',
                '"vote.not_voted": "Вы ещё не голосовали."',
                '"vote.prompt": "Выбирай, за кого топишь"',
            ):
                self.assertIn(exact, data)
            self.assertIn('start_continue: "Продолжить игру"', data)
            self.assertIn('start_continue: "Продолжить игру"', boot)
            self.assertIn('getOnboardingSeen(UI)', boot)
            self.assertIn('resumeMode ? resolveStartScreenText(D, "start_continue", activeProfile)', boot)
            self.assertIn('resolveProfileCopy("vote.prompt"', events)
            self.assertIn('resolveProfileCopy("vote.not_voted"', events)
            self.assertIn('resolveProfileCopy("argument.select"', battles)
            self.assertIn('resolveProfileCopy("argument.select"', dm)

    def test_profile_copy_and_age_boundaries_use_data_authority(self) -> None:
        script = r'''
const fs = require("fs");
const vm = require("vm");
const game = { System: { say: () => "" } };
const quietConsole = { log() {}, warn() {}, error() {}, info() {} };
const context = {
  window: { Game: game }, Game: game, console: quietConsole,
  Date, Math, Set, Object, Array, Number, String, RegExp, JSON,
  setTimeout: () => 0, clearTimeout: () => {}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("AsyncScene/Web/data.js", "utf8"), context);
const D = context.Game.Data;
const values = ["64", "65", "80", "81", "96", "97", "12", "13", "00", "99"];
const profiles = Object.fromEntries(values.map(value => [value, D.resolveUiProfileFromBirthYearValue(value)]));
const copy = Object.fromEntries(["boomer", "genX", "millennial", "zoomer", "alpha"].map(profile => [profile, {
  normalized: D.normalizeUiProfile(profile),
  prompt: D.resolveProfileCopy("vote.prompt", profile),
  argument: D.resolveProfileCopy("argument.select", profile),
  defense: D.resolveProfileCopy("argument.select.defense", profile),
  player: D.resolveProfileCopy("argument.select.player", profile),
  choice: D.resolveProfileCopy("vote.choice", profile),
  already: D.resolveProfileCopy("vote.already", profile),
  notVoted: D.resolveProfileCopy("vote.not_voted", profile)
}]));
const start = Object.fromEntries(["boomer", "genX", "millennial", "zoomer", "alpha"].map(profile => [profile, D.resolveStartScreenText("start_continue", profile)]));
process.stdout.write(JSON.stringify({ profiles, copy, start }));
'''
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual(
        payload["profiles"],
            {
                "64": "boomer",
                "65": "genX",
                "80": "genX",
                "81": "millennial",
                "96": "millennial",
                "97": "zoomer",
                "12": "zoomer",
                "13": "alpha",
                "00": "zoomer",
                "99": "zoomer",
            },
        )
        self.assertEqual(set(payload["start"].values()), {"Продолжить игру"})
        self.assertEqual(payload["copy"]["boomer"]["defense"], "Выберите контраргумент.")
        self.assertEqual(payload["copy"]["boomer"]["player"], "Выберите игрока.")
        self.assertEqual(payload["copy"]["boomer"]["choice"], "Ваш выбор")
        self.assertEqual(payload["copy"]["boomer"]["already"], "Ваш голос уже был учтён.")
        self.assertEqual(payload["copy"]["alpha"]["prompt"], "ВЫБЕРИ ИМЯ")
        self.assertEqual(payload["copy"]["alpha"]["defense"], "ВЫБЕРИ КОНТРАРГУМЕНТ")
        self.assertEqual(payload["copy"]["alpha"]["player"], "ВЫБЕРИ ИГРОКА")
        self.assertEqual(payload["copy"]["genX"]["prompt"], "Имя задаёт сторону.")
        self.assertEqual(payload["copy"]["millennial"]["argument"], "Выбери аргумент.")
        self.assertEqual(payload["copy"]["millennial"]["notVoted"], "Ты ещё не проголосовал.")
        self.assertEqual(payload["copy"]["genX"]["normalized"], "genX")
        self.assertEqual(payload["copy"]["genX"]["notVoted"], "Голос ещё не отдан.")
        self.assertEqual(payload["copy"]["boomer"]["prompt"], "Выберите, кого вы поддерживаете.")
        self.assertEqual(payload["copy"]["boomer"]["argument"], "Выберите аргумент.")
        self.assertEqual(payload["copy"]["boomer"]["notVoted"], "Вы ещё не голосовали.")
        self.assertEqual(payload["copy"]["zoomer"]["prompt"], "Выбирай, за кого топишь")


if __name__ == "__main__":
    unittest.main()
