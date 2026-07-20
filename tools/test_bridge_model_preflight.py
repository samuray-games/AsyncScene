from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from plugins.asynchronia.bridge_task_descriptor import (  # noqa: E402
    NO_MAIN_DELTA_PROFILE,
    PROFILE_VERSION,
    derive_bridge_task,
    derive_bridge_task_from_texts,
)
from plugins.asynchronia.model_selector_runtime import AuthorizationError, TaskDescriptionError, task_hash  # noqa: E402


def authority_texts(*, thread: str, branch: str, baseline: str) -> tuple[str, str, str]:
    task_id = "TASK-INFRA-BRIDGE-CONTROL-PLANE-RESET-TEST"
    inbox_path = f".ai-bridge/inbox/{thread}-01-chatgpt.md"
    claim_path = f".ai-bridge/claims/{thread}-claim-v1-codex.md"
    outbox = f".ai-bridge/outbox/{thread}-01-codex.md"
    receipt = f".ai-bridge/receipts/{thread}-01-receipt.md"
    common = f"""TASK_ID: {task_id}
SLOT: 1
THREAD: {thread}
GENERATION: 1
BRANCH_TASK: {branch}
EXECUTION_EPOCH: TEST-EPOCH-1
NONCE: TEST-NONCE-1
AUTHORIZED_BASELINE: {baseline}
STATUS: READY_FOR_MODEL_PREFLIGHT
CONTINUATION_STATUS: SAME_THREAD_CONTINUE_REQUIRED
ALLOW_VERIFIED_NO_DELTA: true
NO_MAIN_WRITE: true
STAGE_6_STATUS: PAUSED_BY_USER
"""
    state = common + f"""PIPELINE_VERSION: 1.0.4
BRIDGE_PROTOCOL: 4.0
TASK: {task_id}
BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-1
INBOX: {inbox_path}
CLAIM: {claim_path}
EXPECTED_OUTBOX: {outbox}
EXPECTED_RECEIPT: {receipt}
MODEL_PREFLIGHT_STATUS: REQUIRED
MAILBOX_OWNERSHIP: SLOT_LOCAL_ONLY
RUNTIME_SCOPE: NONE_INFRASTRUCTURE_ONLY
SAFARI_STATUS: N/A_INFRASTRUCTURE_ONLY_NO_RUNTIME_OR_GAME_FILE_CHANGE
NEXT_ACTION: test
"""
    claim = common + f"""OWNER: TEST_CODEX_THREAD
CLAIM_TYPE: NO_MAIN_DELTA_TRANSPORT_CANARY
INBOX: {inbox_path}
EXPECTED_OUTBOX: {outbox}
EXPECTED_RECEIPT: {receipt}
CANARY_SCOPE: NO_MAIN_DELTA_TRANSPORT
SAFARI_STATUS: N/A_INFRASTRUCTURE_ONLY_NO_RUNTIME_OR_GAME_FILE_CHANGE
"""
    inbox = common + f"""MAILBOX_OWNERSHIP: coordination/chatgpt-codex-bridge-1
SAFARI_STATUS: N/A_INFRASTRUCTURE_ONLY_NO_RUNTIME_OR_GAME_FILE_CHANGE

This slot-local inbox authorizes one fresh no-main-delta transport canary for Slot 1.
Before execution run task-router, scope-isolation-check, and model-selector.
After successful verification publish exactly:
- {outbox}
- {receipt}
No other repository write is authorized.
"""
    return state, claim, inbox


def stage6_authority_texts(*, thread: str, branch: str, baseline: str) -> tuple[str, str, str]:
    task_id = "TASK-STAGE6-TEST"
    inbox_path = f".ai-bridge/inbox/{thread}-01-chatgpt.md"
    claim_path = f".ai-bridge/claims/{thread}-claim-v1-codex.md"
    outbox = f".ai-bridge/outbox/{thread}-01-codex.md"
    receipt = f".ai-bridge/receipts/{thread}-01-receipt.md"
    common = f"""TASK_ID: {task_id}
SLOT: 1
THREAD: {thread}
GENERATION: 1
BRANCH_TASK: {branch}
EXECUTION_EPOCH: STAGE6-TEST-EPOCH
NONCE: STAGE6-TEST-NONCE
AUTHORIZED_BASELINE: {baseline}
STATUS: READY_FOR_MODEL_PREFLIGHT
CONTINUATION_STATUS: SAME_THREAD_CONTINUE_REQUIRED
ALLOW_VERIFIED_NO_DELTA: false
NO_MAIN_WRITE: true
STAGE_6_STATUS: AUTHORIZED_BY_USER
BRIDGE_TASK_PROFILE: STAGE_6_TASK_LANE
OBJECTIVE: Execute one registered Stage 6 lane with the frozen authority-owned scope.
READ_SCOPE: ["AsyncScene/Web", "docs"]
WRITE_SCOPE: ["AsyncScene/Web/Stage6Lane.js"]
RUNTIME_SCOPE: STAGE_6_TASK_LANE
"""
    state = common + f"""PIPELINE_VERSION: 1.0.4
BRIDGE_PROTOCOL: 4.0
TASK: {task_id}
BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-1
INBOX: {inbox_path}
CLAIM: {claim_path}
EXPECTED_OUTBOX: {outbox}
EXPECTED_RECEIPT: {receipt}
MODEL_PREFLIGHT_STATUS: REQUIRED
MAILBOX_OWNERSHIP: SLOT_LOCAL_ONLY
"""
    claim = common + f"""OWNER: TEST_CODEX_THREAD
CLAIM_TYPE: STAGE_6_TASK_LANE
INBOX: {inbox_path}
EXPECTED_OUTBOX: {outbox}
EXPECTED_RECEIPT: {receipt}
"""
    inbox = common + f"""MAILBOX_OWNERSHIP: coordination/chatgpt-codex-bridge-1

The authority-owned scope above is the only project scope for this Stage 6 lane.
Expected completion paths remain slot-local:
- {outbox}
- {receipt}
"""
    return state, claim, inbox


def run(*args: str, cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=cwd, check=check, capture_output=True, text=True)


class BridgeDescriptorTests(unittest.TestCase):
    def test_descriptor_is_deterministic_and_code_owned(self) -> None:
        thread = "BRIDGE-TEST-101"
        branch = f"bridge/1/{thread}"
        baseline = "a" * 40
        state, claim, inbox = authority_texts(thread=thread, branch=branch, baseline=baseline)
        descriptor = derive_bridge_task_from_texts(
            slot=1,
            mailbox_ref="origin/coordination/chatgpt-codex-bridge-1",
            mailbox_head="b" * 40,
            selected_branch=branch,
            baseline=baseline,
            thread_id=thread,
            state_text=state,
            claim_text=claim,
            inbox_text=inbox,
        )
        self.assertEqual(descriptor.evidence["profileVersion"], PROFILE_VERSION)
        for field, value in NO_MAIN_DELTA_PROFILE.items():
            self.assertEqual(descriptor.task[field], value)
        self.assertEqual(len(descriptor.task["writeScope"]), 2)
        self.assertEqual(len(descriptor.task["readScope"]), len(set(descriptor.task["readScope"])))
        self.assertEqual(PROFILE_VERSION, "BRIDGE_TASK_PROFILE_2")
        self.assertIn("classificationReasons", descriptor.evidence)
        self.assertIn("mailbox head", descriptor.render_evidence())
        self.assertTrue(task_hash(descriptor.task).startswith("sha256:"))

    def test_unknown_profile_and_identity_mismatch_fail_closed(self) -> None:
        thread = "BRIDGE-TEST-101"
        branch = f"bridge/1/{thread}"
        baseline = "a" * 40
        state, claim, inbox = authority_texts(thread=thread, branch=branch, baseline=baseline)
        with self.assertRaises(TaskDescriptionError):
            derive_bridge_task_from_texts(
                slot=1,
                mailbox_ref="origin/coordination/chatgpt-codex-bridge-1",
                mailbox_head="b" * 40,
                selected_branch="bridge/1/WRONG",
                baseline=baseline,
                thread_id=thread,
                state_text=state,
                claim_text=claim,
                inbox_text=inbox,
            )
        with self.assertRaises(TaskDescriptionError):
            derive_bridge_task_from_texts(
                slot=1,
                mailbox_ref="origin/coordination/chatgpt-codex-bridge-1",
                mailbox_head="b" * 40,
                selected_branch=branch,
                baseline=baseline,
                thread_id=thread,
                state_text=state,
                claim_text=claim.replace("NO_MAIN_DELTA_TRANSPORT_CANARY", "UNKNOWN_CANARY"),
                inbox_text=inbox,
            )

    def test_registered_non_canary_profile_derives_authority_owned_scope(self) -> None:
        thread = "BRIDGE-STAGE6-101"
        branch = f"bridge/1/{thread}"
        baseline = "a" * 40
        objective = "Execute one registered Stage 6 lane with the frozen authority-owned scope."
        read_scope = '["AsyncScene/Web", "docs"]'
        write_scope = '["AsyncScene/Web/Stage6Lane.js"]'
        state, claim, inbox = stage6_authority_texts(thread=thread, branch=branch, baseline=baseline)
        descriptor = derive_bridge_task_from_texts(
            slot=1,
            mailbox_ref="origin/coordination/chatgpt-codex-bridge-1",
            mailbox_head="b" * 40,
            selected_branch=branch,
            baseline=baseline,
            thread_id=thread,
            state_text=state,
            claim_text=claim,
            inbox_text=inbox,
        )
        self.assertEqual("STAGE_6_TASK_LANE", descriptor.task["taskType"])
        self.assertEqual(["AsyncScene/Web/Stage6Lane.js"], descriptor.task["writeScope"])
        self.assertIn("policy:BRIDGE_TASK_PROFILE_2", descriptor.task["readScope"])
        legacy_task = dict(descriptor.task)
        legacy_task["readScope"] = [
            value.replace("policy:BRIDGE_TASK_PROFILE_2", "policy:BRIDGE_TASK_PROFILE_1")
            for value in descriptor.task["readScope"]
        ]
        self.assertNotEqual(task_hash(descriptor.task), task_hash(legacy_task))
        self.assertIn(objective, descriptor.task["objective"])
        self.assertIn("deterministic task classification:", descriptor.render_evidence())

    def test_empty_real_write_scope_fails_closed_before_selector_authorization(self) -> None:
        thread = "BRIDGE-STAGE6-EMPTY-WRITE"
        branch = f"bridge/1/{thread}"
        baseline = "a" * 40
        state, claim, inbox = stage6_authority_texts(thread=thread, branch=branch, baseline=baseline)
        state = state.replace('WRITE_SCOPE: ["AsyncScene/Web/Stage6Lane.js"]', "WRITE_SCOPE: []")
        claim = claim.replace('WRITE_SCOPE: ["AsyncScene/Web/Stage6Lane.js"]', "WRITE_SCOPE: []")
        inbox = inbox.replace('WRITE_SCOPE: ["AsyncScene/Web/Stage6Lane.js"]', "WRITE_SCOPE: []")
        with self.assertRaisesRegex(TaskDescriptionError, "WRITE_SCOPE must contain at least one path"):
            derive_bridge_task_from_texts(
                slot=1,
                mailbox_ref="origin/coordination/chatgpt-codex-bridge-1",
                mailbox_head="b" * 40,
                selected_branch=branch,
                baseline=baseline,
                thread_id=thread,
                state_text=state,
                claim_text=claim,
                inbox_text=inbox,
            )


class BridgeCliEndToEndTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.repo = Path(self.directory.name) / "repo"
        self.mailbox_repo = Path(self.directory.name) / "mailbox"
        self.repo.mkdir()
        shutil.copytree(ROOT / "plugins", self.repo / "plugins")
        (self.repo / "tools").mkdir()
        shutil.copy2(ROOT / "tools/run-asynchronia-model-preflight.py", self.repo / "tools/run-asynchronia-model-preflight.py")
        shutil.copytree(ROOT / ".ai-work", self.repo / ".ai-work")
        run("git", "init", "-q", cwd=self.repo)
        run("git", "config", "user.name", "Test", cwd=self.repo)
        run("git", "config", "user.email", "test@example.com", cwd=self.repo)
        run("git", "add", ".", cwd=self.repo)
        run("git", "commit", "-qm", "baseline", cwd=self.repo)
        run("git", "branch", "-M", "main", cwd=self.repo)
        self.baseline = run("git", "rev-parse", "HEAD", cwd=self.repo).stdout.strip()
        run("git", "update-ref", "refs/remotes/origin/main", self.baseline, cwd=self.repo)
        self.thread = "BRIDGE-TEST-101"
        self.branch = f"bridge/1/{self.thread}"
        run("git", "checkout", "-qb", self.branch, cwd=self.repo)
        self._publish_mailbox()

    def tearDown(self) -> None:
        self.directory.cleanup()

    def _publish_mailbox(
        self,
        suffix: str = "",
        *,
        artifacts: bool = False,
        profile: str = "canary",
        stage6_write_scope: str | None = None,
    ) -> str:
        if self.mailbox_repo.exists():
            shutil.rmtree(self.mailbox_repo)
        self.mailbox_repo.mkdir()
        run("git", "init", "-q", cwd=self.mailbox_repo)
        run("git", "config", "user.name", "Mailbox", cwd=self.mailbox_repo)
        run("git", "config", "user.email", "mailbox@example.com", cwd=self.mailbox_repo)
        authority_factory = stage6_authority_texts if profile == "stage6" else authority_texts
        state, claim, inbox = authority_factory(thread=self.thread, branch=self.branch, baseline=self.baseline)
        if profile == "stage6" and stage6_write_scope is not None:
            state = state.replace('WRITE_SCOPE: ["AsyncScene/Web/Stage6Lane.js"]', f"WRITE_SCOPE: {stage6_write_scope}")
            claim = claim.replace('WRITE_SCOPE: ["AsyncScene/Web/Stage6Lane.js"]', f"WRITE_SCOPE: {stage6_write_scope}")
            inbox = inbox.replace('WRITE_SCOPE: ["AsyncScene/Web/Stage6Lane.js"]', f"WRITE_SCOPE: {stage6_write_scope}")
        state += suffix
        headers = {}
        for line in state.splitlines():
            if ": " in line:
                key, value = line.split(": ", 1)
                headers[key] = value
        paths = {
            ".ai-bridge/STATE.md": state,
            headers["INBOX"]: inbox,
            headers["CLAIM"]: claim,
            ".ai-bridge/PUBLICATION_POLICY.md": "SLOT: 1\n",
        }
        if artifacts:
            paths[headers["EXPECTED_OUTBOX"]] = "STATUS: PASS_VERIFIED_NO_DELTA\n"
            paths[headers["EXPECTED_RECEIPT"]] = "STATUS: PASS_VERIFIED_NO_DELTA\n"
        for relative, content in paths.items():
            path = self.mailbox_repo / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
        run("git", "add", ".", cwd=self.mailbox_repo)
        run("git", "commit", "-qm", "mailbox", cwd=self.mailbox_repo)
        run(
            "git",
            "fetch",
            str(self.mailbox_repo),
            "+HEAD:refs/remotes/origin/coordination/chatgpt-codex-bridge-1",
            cwd=self.repo,
        )
        return run("git", "rev-parse", "origin/coordination/chatgpt-codex-bridge-1", cwd=self.repo).stdout.strip()

    def _cli(self, command: str, *extra: str) -> subprocess.CompletedProcess[str]:
        args = [
            sys.executable,
            "tools/run-asynchronia-model-preflight.py",
            command,
            "--slot",
            "1",
            "--thread-id",
            self.thread,
            "--baseline",
            self.baseline,
            "--branch",
            self.branch,
            *extra,
        ]
        return run(*args, cwd=self.repo, check=False)

    def test_bridge_cli_reaches_full_authorization_and_uses_git_private_state(self) -> None:
        start = self._cli("bridge-start")
        self.assertEqual(start.returncode, 0, start.stderr)
        self.assertIn("task descriptor source: BRIDGE_AUTHORITY_DERIVED", start.stdout)
        self.assertIn("status: WAITING_FOR_INVENTORY_CONFIRMATION", start.stdout)
        self.assertIn("recommended pair:", start.stdout)
        self.assertIn(str(self.repo / ".git/asynchronia/model-selector-state"), start.stdout)
        ok = self._cli("bridge-inventory-ok")
        self.assertEqual(ok.returncode, 0, ok.stderr)
        self.assertIn("WAITING_FOR_MODEL_SELECTION", ok.stdout)
        cont = self._cli("bridge-continue", "--token", "CONTINUE")
        self.assertEqual(cont.returncode, 0, cont.stderr)
        self.assertIn("IMPLEMENTATION_ALLOWED", cont.stdout)

    def test_registered_non_canary_bridge_reaches_inventory_pause(self) -> None:
        self._publish_mailbox(profile="stage6")
        result = self._cli("bridge-start")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("task descriptor source: BRIDGE_AUTHORITY_DERIVED", result.stdout)
        self.assertIn("status: WAITING_FOR_INVENTORY_CONFIRMATION", result.stdout)
        self.assertIn("recommended pair:", result.stdout)

    def test_empty_stage6_write_scope_cannot_reach_read_only_allowed(self) -> None:
        self._publish_mailbox(profile="stage6", stage6_write_scope="[]")
        result = self._cli("bridge-start")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("WRITE_SCOPE must contain at least one path", result.stderr)
        self.assertNotIn("READ_ONLY_ALLOWED", result.stdout)

    def test_mailbox_movement_invalidates_same_thread_state(self) -> None:
        start = self._cli("bridge-start")
        self.assertEqual(start.returncode, 0, start.stderr)
        self._publish_mailbox("\nREFRESH: 1\n")
        result = self._cli("bridge-inventory-ok")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("stale authorization", result.stderr)

    def test_stale_unstarted_epoch_requires_authority_reissue(self) -> None:
        tree = run("git", "rev-parse", f"{self.baseline}^{{tree}}", cwd=self.repo).stdout.strip()
        advanced = subprocess.run(
            ["git", "commit-tree", tree, "-p", self.baseline],
            cwd=self.repo,
            input="advance main\n",
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
        run("git", "update-ref", "refs/remotes/origin/main", advanced, cwd=self.repo)
        result = self._cli("bridge-start")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("STALE_BRIDGE_AUTHORITY_REISSUE_REQUIRED", result.stderr)

    def test_authorized_continuation_survives_main_movement(self) -> None:
        start = self._cli("bridge-start")
        self.assertEqual(start.returncode, 0, start.stderr)
        tree = run("git", "rev-parse", f"{self.baseline}^{{tree}}", cwd=self.repo).stdout.strip()
        advanced = subprocess.run(
            ["git", "commit-tree", tree, "-p", self.baseline],
            cwd=self.repo,
            input="advance main after authorization\n",
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
        run("git", "update-ref", "refs/remotes/origin/main", advanced, cwd=self.repo)
        result = self._cli("bridge-inventory-ok")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("WAITING_FOR_MODEL_SELECTION", result.stdout)

    def test_completed_epoch_cannot_be_silently_rerun(self) -> None:
        self._publish_mailbox(artifacts=True)
        result = self._cli("bridge-start")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("COMPLETED_BRIDGE_EPOCH_REISSUE_REQUIRED", result.stderr)

    def test_artifact_verification_failure_blocks_rerun(self) -> None:
        state, claim, inbox = authority_texts(thread=self.thread, branch=self.branch, baseline=self.baseline)
        outbox = f".ai-bridge/outbox/{self.thread}-01-codex.md"
        paths = {
            ".ai-bridge/STATE.md": state,
            f".ai-bridge/claims/{self.thread}-claim-v1-codex.md": claim,
            f".ai-bridge/inbox/{self.thread}-01-chatgpt.md": inbox,
        }

        def failing_reader(_ref: str, path: str) -> str:
            if path == outbox:
                raise AuthorizationError("simulated artifact read outage")
            return paths[path]

        with self.assertRaisesRegex(TaskDescriptionError, "BRIDGE_ARTIFACT_VERIFICATION_FAILED"):
            derive_bridge_task(
                slot=1,
                mailbox_ref="origin/coordination/chatgpt-codex-bridge-1",
                selected_branch=self.branch,
                baseline=self.baseline,
                thread_id=self.thread,
                repository_root=self.repo,
                reader=failing_reader,
            )

    def test_generic_cli_rejects_handwritten_reserved_bridge_task(self) -> None:
        task_file = self.repo / "fabricated.json"
        task_file.write_text(
            json.dumps(
                {
                    "taskId": "FABRICATED",
                    "taskType": "STAGE_6_TASK_LANE",
                    "objective": "fabricated",
                    "readScope": ["x"],
                    "writeScope": ["y"],
                    "affectedSystems": ["bridge"],
                    "runtimeSensitivity": "low",
                    "architectureImpact": "low",
                    "securityImpact": "low",
                    "economyImpact": "low",
                    "releaseImpact": "low",
                    "validationComplexity": "low",
                    "expectedImplementationSize": "small",
                    "ambiguityNovelty": "low",
                    "concurrencyBranchRisk": "low",
                }
            ),
            encoding="utf-8",
        )
        result = run(
            sys.executable,
            "tools/run-asynchronia-model-preflight.py",
            "start",
            "--thread-id",
            self.thread,
            "--task-file",
            str(task_file),
            "--baseline",
            self.baseline,
            "--branch",
            self.branch,
            cwd=self.repo,
            check=False,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("reserved bridge tasks must use bridge-start", result.stderr)


if __name__ == "__main__":
    unittest.main()
