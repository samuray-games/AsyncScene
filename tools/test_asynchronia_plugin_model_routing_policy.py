import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins/asynchronia"
MANIFEST_PATH = PLUGIN / ".codex-plugin/plugin.json"
SELECTOR_PATH = PLUGIN / "skills/model-selector/SKILL.md"
ROUTER_PATH = PLUGIN / "skills/task-router/SKILL.md"
CONTROLLER_PATH = PLUGIN / "skills/acceptance-pipeline-controller/SKILL.md"


class AsynchroniaPluginModelRoutingPolicyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        cls.prompt = "\n".join(cls.manifest["interface"]["defaultPrompt"])
        cls.selector = SELECTOR_PATH.read_text(encoding="utf-8")
        cls.router = ROUTER_PATH.read_text(encoding="utf-8")
        cls.controller = CONTROLLER_PATH.read_text(encoding="utf-8")

    def test_ordinary_ui_route_uses_configured_routing_without_preflight(self):
        ui_route = self.router.split("### `UI_ONLY`", 1)[1].split("### `RUNTIME_LOGIC`", 1)[0]
        self.assertIn("configured Codex routing", ui_route)
        self.assertNotIn("model-selector", ui_route)
        self.assertIn("Ordinary Asynchronia engineering uses the configured Codex", self.selector)

    def test_inventory_ok_continue_and_implementation_allowed_are_not_ordinary_gates(self):
        for text in (self.prompt, self.selector, self.router, self.controller):
            self.assertNotIn("MODEL_PREFLIGHT_PAUSE: REQUIRED", text)
            self.assertNotIn("is required for every implementation recommendation", text)
            self.assertNotIn("is a blocking pre-implementation gate", text)
            self.assertNotIn("Before IMPLEMENTATION_ALLOWED, do not edit", text)
        self.assertIn("Do not ask the user for `INVENTORY_OK`", self.selector)
        self.assertIn("Do not require `MODEL_PREFLIGHT_PAUSE`", self.controller)

    def test_missing_launcher_does_not_block_ordinary_development(self):
        self.assertFalse((ROOT / "tools/run-asynchronia-model-preflight.py").exists())
        self.assertIn("does not block ordinary work", self.selector)
        self.assertIn("does not block ordinary development", self.prompt)
        self.assertNotIn("Run `tools/run-asynchronia-model-preflight.py`", self.selector)

    def test_configured_codex_routing_is_explicit_across_active_entrypoints(self):
        self.assertIn("configured Codex agent-team/model routing", self.prompt)
        self.assertIn("configured Codex agent-team/model routing", self.router)
        self.assertIn("configured Codex agent-team/model routing", self.controller)

    def test_numbered_bridge_selector_route_is_preserved(self):
        self.assertIn("For numbered bridge tasks", self.router)
        self.assertIn("`task-router`, `scope-isolation-check`, `model-selector`", self.router)
        self.assertIn("мост 1", self.selector)
        self.assertIn("мост 2", self.selector)
        self.assertIn("мост 3", self.selector)
        self.assertIn("current primary bridge authority explicitly requires", self.controller)
        self.assertIn("model-selector` when explicitly requested or required by current numbered-bridge authority", self.controller)

    def test_scope_safety_and_runtime_acceptance_rules_remain(self):
        for text in (self.prompt, self.router, self.controller):
            self.assertIn("scope isolation", text.lower())
        self.assertIn("BLOCKED_SCOPE_COLLISION", self.router)
        self.assertIn("security checks", self.prompt)
        self.assertIn("pull request and CI requirements", self.prompt)
        self.assertIn("UI/game-logic separation", self.prompt)
        self.assertIn("Safari", self.prompt)
        self.assertIn("Runtime Safari smoke belongs to the user", self.router)
        self.assertIn("user-owned Safari evidence", self.controller)
        root_policy = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
        self.assertIn("DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN", root_policy)
        self.assertIn("Configured Codex agent-team/model routing", root_policy)

    def test_plugin_identity_and_loading_path_are_unchanged(self):
        self.assertEqual(self.manifest["name"], "asynchronia")
        self.assertEqual(self.manifest["skills"], "./skills/")
        self.assertEqual(self.manifest["interface"]["displayName"], "Asynchronia")


if __name__ == "__main__":
    unittest.main()
