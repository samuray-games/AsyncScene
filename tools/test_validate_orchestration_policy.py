import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("policy", Path(__file__).with_name("validate-orchestration-policy.py"))
policy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(policy)


class OrchestrationPolicyRetirementTests(unittest.TestCase):
    def test_retired_git_protocol_documents_are_fail_closed(self):
        self.assertIn("GIT_PULL.md", policy.RETIRED_PATHS)
        self.assertIn("GIT_PUSH.md", policy.RETIRED_PATHS)
        self.assertIn("tools/repository_bridge_authority.py", policy.RETIRED_PATHS)

    def test_current_policy_surface_has_no_retired_bridge_aliases(self):
        for path in policy.active_text_files():
            text = path.read_text(encoding="utf-8", errors="replace")
            for alias in policy.RETIRED_ALIASES:
                self.assertNotIn(alias, text, f"{path} still contains {alias}")


if __name__ == "__main__":
    unittest.main()
