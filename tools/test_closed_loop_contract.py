from __future__ import annotations

import unittest

from tools.closed_loop_contract import (
    CONTRACT_VERSION,
    ClosedLoopState,
    load_state,
    serialize,
    validate_outbox_path,
)


class ClosedLoopContractTest(unittest.TestCase):
    def test_round_trip(self) -> None:
        state = ClosedLoopState(
            bridge_slot=3,
            thread_id="BRIDGE-20260709-048",
            lane_id="PROCESS-CLOSED-LOOP-ORCHESTRATION",
            task_id="TASK-PROCESS-CLOSED-LOOP-IMPLEMENTATION-R2-SLOT3",
            execution_epoch="CLOSED-LOOP-R2-E1-20260709-1955JST",
            baseline_sha="ca2a3f88ac00a7e4fae47459758e7b09099a3f41",
            expected_outbox=".ai-bridge/outbox/BRIDGE-20260709-048-02-codex.md",
            remote_state_sha="deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
            completion_mode="PRIMARY_DELTA",
            result_status="PASS_PUSHED",
            next_action="Open a fresh ChatGPT conversation and send мост 3.",
        )
        payload = serialize(state)
        self.assertEqual(payload["bridge_slot"], 3)
        self.assertEqual(load_state(payload), state)
        validate_outbox_path(payload["expected_outbox"])

    def test_rejects_bad_outbox(self) -> None:
        with self.assertRaises(ValueError):
            validate_outbox_path(".ai-bridge/outbox/BRIDGE-20260709-048-01-chatgpt.md")

    def test_contract_version_present(self) -> None:
        self.assertEqual(CONTRACT_VERSION, "1.0.0")


if __name__ == "__main__":
    unittest.main()

