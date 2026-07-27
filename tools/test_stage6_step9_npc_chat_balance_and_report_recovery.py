import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "AsyncScene" / "Web"
DOCS = ROOT / "docs"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class NpcChatBalanceAndReportRecoveryTests(unittest.TestCase):
    def test_public_chat_cop_sources_are_tagged_and_ambient_budget_is_global(self) -> None:
        for root in (WEB, DOCS):
            npcs = read(root / "npcs.js")
            loops = read(root / "ui" / "ui-loops.js")
            state = read(root / "state.js")
            core = read(root / "ui" / "ui-core.js")
            self.assertIn("State.npc.copBudget", state)
            self.assertIn("lastAmbientPublicChatWasCop", npcs)
            self.assertIn("baseBudget >= 1.0 && !lastAmbientCop", npcs)
            self.assertIn('sourceTag: "ambient_npc_chat"', loops)
            self.assertIn('sourceTag: "player_reaction"', loops)
            self.assertIn('sourceTag: "explicit_cop_public_notice"', state)
            self.assertIn("sourceTag: sourceTag || null", core)

    def test_report_button_derives_cooldown_from_authoritative_cop_state(self) -> None:
        for root in (WEB, DOCS):
            dm = read(root / "ui" / "ui-dm.js")
            state = read(root / "state.js")
            self.assertIn("isCopBusyById,", state)
            self.assertIn("getReportCooldownLeftMsForCop", state)
            self.assertIn("getAuthoritativeReportUiState", dm)
            self.assertIn("Game.__A.isCopBusyById(copId)", dm)
            self.assertIn("status: \"idle\", pendingId: null", dm)
            self.assertIn("scheduleReportWake", dm)
            self.assertIn("clearTimeout(state.reportWakeTimer)", dm)


if __name__ == "__main__":
    unittest.main()
