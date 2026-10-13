import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "AsyncScene" / "Web"
DOCS = ROOT / "docs"
PROFILES = ("boomer", "genX", "millennial", "zoomer", "alpha")
SCENARIOS = ("ordinary", "npc", "rayhan", "nastya", "oleg")


class Issue423VotePromptTests(unittest.TestCase):
    def test_generic_vote_prompt_has_no_dom_insertion_in_any_profile_or_scenario(self):
        for source_root in (WEB, DOCS):
            events_ui = (source_root / "ui" / "ui-events.js").read_text(encoding="utf-8")
            battle_ui = (source_root / "ui" / "ui-battles.js").read_text(encoding="utf-8")
            events = (source_root / "events.js").read_text(encoding="utf-8")
            dev_checks = (source_root / "dev" / "dev-checks.js").read_text(encoding="utf-8")

            # Each profile resolves to legacy copy data, but no rendered UI or
            # NPC draw announcement may request or insert that generic prompt.
            self.assertIn('const profiles = ["boomer", "genX", "millennial", "zoomer", "alpha"]', events_ui)
            for profile in PROFILES:
                self.assertIn(f'"{profile}"', events_ui)
                self.assertNotIn('resolveProfileCopy("vote.prompt"', events_ui)
                self.assertNotIn('resolveProfileCopy("vote.prompt"', battle_ui)
                self.assertNotIn('D.resolveProfileCopy("vote.prompt")', events)

            for scenario in SCENARIOS:
                with self.subTest(root=source_root.name, scenario=scenario):
                    self.assertNotIn("voteHint", battle_ui)
                    self.assertNotIn('hint.className = "pill"', events_ui)
                    self.assertNotIn('hint.textContent = resolveProfileCopy("vote.prompt"', events_ui)

            # Escape retains its concrete action question and Oleg's explicit
            # choice labels. Training vote lock and counters stay in place.
            self.assertIn("escapeHint.textContent", events_ui)
            self.assertIn("card.appendChild(escapeHint)", events_ui)
            self.assertIn('[["Уйти", votesA], ["Остаться", votesB]]', events_ui)
            self.assertIn("if (tutorialVotingBlocked) btn.disabled = true", events_ui)
            self.assertIn("const capLine = document.createElement(\"div\")", events_ui)
            self.assertIn("timerLine.textContent = showTimer", events_ui)
            self.assertIn("const statusHint", battle_ui)
            self.assertNotIn("voteHint.textContent", dev_checks)
            self.assertIn('statusHint.textContent = "Смотри исход."', battle_ui)

    def test_web_and_docs_mirrors_are_identical_for_vote_surfaces(self):
        for relative in ("events.js", "ui/ui-events.js", "ui/ui-battles.js", "dev/dev-checks.js"):
            with self.subTest(path=relative):
                self.assertEqual(
                    (WEB / relative).read_bytes(),
                    (DOCS / relative).read_bytes(),
                )


if __name__ == "__main__":
    unittest.main()
