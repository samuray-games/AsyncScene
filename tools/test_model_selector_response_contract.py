from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from plugins.asynchronia import model_selector as selector_core  # noqa: E402
from plugins.asynchronia.model_selector import record_inventory_ok, start_preflight  # noqa: E402
from plugins.asynchronia.response_relay_contract import (  # noqa: E402
    PROMPT_REQUIRED_LINES,
    ROUTER_REQUIRED_LINES,
    SKILL_REQUIRED_LINES,
    validate_visible_selector_response,
)


TEST_BRANCH = "test/model-selector-response-contract"


def task() -> dict[str, object]:
    return {
        "taskId": "TASK-TEST-RELAY",
        "taskType": "PLUGIN_POLICY",
        "objective": "validate the visible selector response relay contract",
        "readScope": ["plugins/asynchronia", "tools"],
        "writeScope": ["plugins/asynchronia/.codex-plugin/plugin.json"],
        "affectedSystems": ["selector", "response-relay", "validator"],
        "runtimeSensitivity": "low",
        "architectureImpact": "high",
        "securityImpact": "high",
        "economyImpact": "low",
        "releaseImpact": "medium",
        "validationComplexity": "high",
        "expectedImplementationSize": "large",
        "ambiguityNovelty": "medium",
        "concurrencyBranchRisk": "high",
    }


class ResponseRelayContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.original_current_branch = selector_core.current_branch
        selector_core.current_branch = lambda: TEST_BRANCH

    @classmethod
    def tearDownClass(cls) -> None:
        selector_core.current_branch = cls.original_current_branch

    def test_prompt_and_skill_contracts_require_full_visible_relay(self) -> None:
        manifest = json.loads((ROOT / "plugins/asynchronia/.codex-plugin/plugin.json").read_text(encoding="utf-8"))
        prompt = "\n".join(manifest["interface"]["defaultPrompt"])
        skill = (ROOT / "plugins/asynchronia/skills/model-selector/SKILL.md").read_text(encoding="utf-8")
        router = (ROOT / "plugins/asynchronia/skills/task-router/SKILL.md").read_text(encoding="utf-8")

        for needle in PROMPT_REQUIRED_LINES:
            self.assertIn(needle, prompt)
        for needle in SKILL_REQUIRED_LINES:
            self.assertIn(needle, skill)
        for needle in ROUTER_REQUIRED_LINES:
            self.assertIn(needle, router)

    def test_full_executable_output_is_accepted_at_both_mutation_stops(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            start = start_preflight(task(), "relay-thread", "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            self.assertEqual(validate_visible_selector_response(start.output, start.output), [])

            waiting = record_inventory_ok("relay-thread", task(), "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            self.assertEqual(validate_visible_selector_response(waiting.output, waiting.output), [])

    def test_truncated_or_reconstructed_visible_responses_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state_dir = Path(directory) / "state"
            start = start_preflight(task(), "relay-thread", "baseline", branch=TEST_BRANCH, state_dir=state_dir)
            lines = start.output.splitlines()
            matrix_lines = [line for line in lines if line.startswith("- ")]
            self.assertGreater(len(matrix_lines), 2)

            recommendation_only = "\n".join(
                line for line in lines if line.startswith("status:") or line.startswith("recommended pair:")
            )
            failures = validate_visible_selector_response(start.output, recommendation_only)
            self.assertTrue(any(item.startswith("missing selector line: authorization path:") for item in failures))

            omitted_pair = "\n".join(line for line in lines if line != matrix_lines[1])
            self.assertIn("relay matrix lines differ from selector output", validate_visible_selector_response(start.output, omitted_pair))

            duplicated_pair_lines = list(lines)
            duplicated_pair_lines.insert(duplicated_pair_lines.index(matrix_lines[1]) + 1, matrix_lines[1])
            duplicated_pair = "\n".join(duplicated_pair_lines)
            self.assertIn("relay matrix lines differ from selector output", validate_visible_selector_response(start.output, duplicated_pair))

            expected_count_line = next(line for line in lines if line.startswith("evaluated pair count:"))
            wrong_count = start.output.replace(expected_count_line, "evaluated pair count: 0/0")
            self.assertIn("relay evaluated-pair count differs from selector output", validate_visible_selector_response(start.output, wrong_count))

            without_state = "\n".join(line for line in lines if not line.startswith("status:"))
            self.assertIn("relay omits current state line", validate_visible_selector_response(start.output, without_state))

            without_next = "\n".join(line for line in lines if not line.startswith("exact next response:"))
            self.assertIn("relay omits exact next response line", validate_visible_selector_response(start.output, without_next))

            generated_prose = "status: WAITING_FOR_INVENTORY_CONFIRMATION\nrecommended pair: 5.4 / High\nSwitch the model in the UI and continue."
            failures = validate_visible_selector_response(start.output, generated_prose)
            self.assertIn("selector output is not relayed as an ordered visible subsequence", failures)


if __name__ == "__main__":
    unittest.main()
