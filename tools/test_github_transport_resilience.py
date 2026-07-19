from __future__ import annotations

from pathlib import Path
import tempfile
import unittest

from tools import github_transport_resilience as transport


class FakeRunner:
    def __init__(self, results: list[transport.CommandResult]) -> None:
        self.results = list(results)
        self.calls: list[tuple[str, ...]] = []

    def __call__(self, argv: tuple[str, ...] | list[str], _cwd: Path) -> transport.CommandResult:
        command = tuple(argv)
        self.calls.append(command)
        if not self.results:
            raise AssertionError(f"unexpected command: {command}")
        result = self.results.pop(0)
        return transport.CommandResult(command, result.returncode, result.stdout, result.stderr)


def ok(argv: tuple[str, ...] = ()) -> transport.CommandResult:
    return transport.CommandResult(argv, 0, "", "")


def failed(message: str, argv: tuple[str, ...] = ()) -> transport.CommandResult:
    return transport.CommandResult(argv, 1, "", message)


class TransportClassificationTests(unittest.TestCase):
    def test_connection_reset_and_tls_timeout_are_classified(self) -> None:
        self.assertEqual(
            transport.classify_transport_error("fatal: Recv failure: Connection reset by peer"),
            transport.TRANSPORT_CONNECTION_RESET,
        )
        self.assertEqual(
            transport.classify_transport_error("net/http: TLS handshake timeout"),
            transport.TRANSPORT_TLS_HANDSHAKE_TIMEOUT,
        )


class InventoryTests(unittest.TestCase):
    def test_ladder_uses_http11_then_rest_without_heavy_fetch(self) -> None:
        runner = FakeRunner(
            [
                failed("Recv failure: Connection reset by peer"),
                failed("TLS handshake timeout"),
                transport.CommandResult((), 0, "main\t" + "a" * 40 + "\n", ""),
                transport.CommandResult((), 0, "v1\t" + "b" * 40 + "\n", ""),
            ]
        )
        with tempfile.TemporaryDirectory() as directory:
            result = transport.inventory(
                directory,
                repository="owner/repo",
                runner=runner,
                backoff_seconds=0,
            )
        self.assertEqual(result.state, transport.STATE_INVENTORY_SUCCEEDED)
        self.assertEqual([ref.name for ref in result.refs], ["main", "v1"])
        self.assertEqual(runner.calls[0][1:3], ("ls-remote", "--symref"))
        self.assertIn("http.version=HTTP/1.1", runner.calls[1])
        self.assertTrue(all("fetch" not in call for call in runner.calls))

    def test_distinct_refs_sharing_sha_are_preserved(self) -> None:
        sha = "a" * 40
        runner = FakeRunner([transport.CommandResult((), 0, f"{sha} refs/heads/main\n{sha} refs/tags/v1\n", "")])
        with tempfile.TemporaryDirectory() as directory:
            result = transport.inventory(directory, runner=runner, backoff_seconds=0)
        self.assertEqual([(ref.kind, ref.name, ref.sha) for ref in result.refs], [("branch", "main", sha), ("tag", "v1", sha)])

    def test_rest_failure_exhausts_to_external_verification(self) -> None:
        runner = FakeRunner([
            failed("Recv failure: Connection reset by peer"),
            failed("TLS handshake timeout"),
            failed("net/http: TLS handshake timeout"),
            failed("net/http: TLS handshake timeout"),
        ])
        with tempfile.TemporaryDirectory() as directory:
            result = transport.inventory(directory, repository="owner/repo", runner=runner, backoff_seconds=0)
        self.assertEqual(result.state, transport.STATE_EXTERNAL_VERIFICATION_REQUIRED)
        self.assertEqual(len(result.attempts), 4)


class FetchTests(unittest.TestCase):
    def test_targeted_fetch_retries_http11_and_never_prunes(self) -> None:
        runner = FakeRunner([failed("TLS handshake timeout"), ok()])
        with tempfile.TemporaryDirectory() as directory:
            result = transport.fetch_exact_refs(directory, ["refs/heads/main"], runner=runner, backoff_seconds=0)
        self.assertEqual(result.state, transport.STATE_FETCH_SUCCEEDED)
        self.assertEqual(runner.calls[0][1], "fetch")
        self.assertNotIn("--prune", runner.calls[0])
        self.assertIn("http.version=HTTP/1.1", runner.calls[1])

    def test_verify_ref_retries_http11_after_transport_failure(self) -> None:
        sha = "a" * 40
        runner = FakeRunner([
            failed("Recv failure: Connection reset by peer"),
            transport.CommandResult((), 0, f"{sha} refs/heads/main\n", ""),
        ])
        with tempfile.TemporaryDirectory() as directory:
            observed, result = transport.verify_ref(directory, "refs/heads/main", runner=runner, backoff_seconds=0)
        self.assertEqual(observed, sha)
        self.assertTrue(result.retried)
        self.assertIn("http.version=HTTP/1.1", runner.calls[1])


class PushSafetyTests(unittest.TestCase):
    def test_ambiguous_push_resolves_success_when_remote_is_new_sha(self) -> None:
        old, new = "a" * 40, "b" * 40
        runner = FakeRunner([failed("Recv failure: Connection reset by peer"), transport.CommandResult((), 0, f"{new} refs/heads/main\n", "")])
        with tempfile.TemporaryDirectory() as directory:
            result = transport.push_ref(directory, remote="origin", source="HEAD", ref="refs/heads/main", expected_old_sha=old, expected_new_sha=new, runner=runner, backoff_seconds=0)
        self.assertEqual(result.state, transport.STATE_AMBIGUOUS_PUSH_RESOLVED_SUCCESS)
        self.assertEqual(len([call for call in runner.calls if "push" in call]), 1)

    def test_retry_requires_exact_old_lease_and_preserves_force_with_lease(self) -> None:
        old, new = "a" * 40, "b" * 40
        runner = FakeRunner([
            failed("TLS handshake timeout"),
            transport.CommandResult((), 0, f"{old} refs/heads/main\n", ""),
            ok(),
        ])
        with tempfile.TemporaryDirectory() as directory:
            result = transport.push_ref(directory, remote="origin", source="HEAD", ref="refs/heads/main", expected_old_sha=old, expected_new_sha=new, force_with_lease=True, runner=runner, backoff_seconds=0)
        self.assertEqual(result.state, transport.STATE_PUSH_SUCCEEDED)
        self.assertTrue(result.retried)
        self.assertIn(f"--force-with-lease=refs/heads/main:{old}", runner.calls[0])
        self.assertIn(f"--force-with-lease=refs/heads/main:{old}", runner.calls[2])

    def test_unexpected_remote_movement_blocks_without_retry(self) -> None:
        old, new, moved = "a" * 40, "b" * 40, "c" * 40
        runner = FakeRunner([failed("Recv failure: Connection reset by peer"), transport.CommandResult((), 0, f"{moved} refs/heads/main\n", "")])
        with tempfile.TemporaryDirectory() as directory:
            result = transport.push_ref(directory, remote="origin", source="HEAD", ref="refs/heads/main", expected_old_sha=old, expected_new_sha=new, force_with_lease=True, runner=runner, backoff_seconds=0)
        self.assertEqual(result.state, transport.STATE_BLOCKED_REMOTE_MOVED)
        self.assertEqual(len([call for call in runner.calls if "push" in call]), 1)

    def test_failed_retry_is_not_repeated_blindly(self) -> None:
        old, new = "a" * 40, "b" * 40
        runner = FakeRunner([
            failed("Recv failure: Connection reset by peer"),
            transport.CommandResult((), 0, f"{old} refs/heads/main\n", ""),
            failed("TLS handshake timeout"),
            transport.CommandResult((), 0, f"{old} refs/heads/main\n", ""),
        ])
        with tempfile.TemporaryDirectory() as directory:
            result = transport.push_ref(directory, remote="origin", source="HEAD", ref="refs/heads/main", expected_old_sha=old, expected_new_sha=new, runner=runner, backoff_seconds=0)
        self.assertEqual(result.state, transport.STATE_PUSH_FAILED)
        self.assertEqual(len([call for call in runner.calls if "push" in call]), 2)


if __name__ == "__main__":
    unittest.main()
