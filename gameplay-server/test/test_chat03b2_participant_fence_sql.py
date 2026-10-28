"""Atomic participant authorization and gameplay transition SQL fence."""
import json
import sqlite3
import tempfile
import threading
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "migrations"
NOW = 1_800_000_000_000


class ParticipantFenceSqlTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="chat03b2-participant-fence-")
        self.path = str(Path(self.temp.name) / "fixture.sqlite")
        self.db = self._connect()
        for name in (
            "0001_tactical_state.sql", "0002_battle_capabilities.sql",
            "0003_idempotent_battle_creation.sql", "0004_capability_generation.sql",
            "0005_participant_transition_fence.sql",
        ):
            self.db.executescript((MIGRATIONS / name).read_text(encoding="utf-8"))
        self._genesis("battle-a")
        self._cap("battle-a", "A", "participant-a", "a" * 64)
        self._cap("battle-a", "B", "participant-b", "b" * 64)
        self._genesis("battle-b")
        self._cap("battle-b", "A", "participant-c", "c" * 64)

    def tearDown(self):
        self.db.close()
        self.temp.cleanup()

    def _connect(self):
        db = sqlite3.connect(self.path, isolation_level=None, timeout=5)
        db.execute("PRAGMA foreign_keys=ON")
        db.execute("PRAGMA busy_timeout=5000")
        return db

    def _genesis(self, battle):
        state = {
            "battleId": battle, "rulesVersion": "tactical_v1", "version": 0,
            "phase": "created", "createdAt": NOW, "deadlineAt": NOW + 60_000,
            "participants": {
                "A": {"id": "participant-a", "role": "citizen"},
                "B": {"id": "participant-b", "role": "citizen"},
            },
            "events": [],
        }
        event = {"eventId": f"{battle}:v0:battle.created", "battleId": battle,
                 "version": 0, "type": "battle.created", "payload": {}}
        state["events"] = [event]
        self.db.execute(
            "INSERT INTO gameplay_create_battle "
            "(battle_id,initial_state_json,creation_event_json,trusted_now_ms) VALUES (?,?,?,?)",
            (battle, json.dumps(state), json.dumps(event), NOW),
        )

    def _cap(self, battle, side, participant, digest):
        self.db.execute(
            "INSERT INTO gameplay_battle_capabilities "
            "(battle_id,side,participant_id,token_sha256,created_at_ms) VALUES (?,?,?,?,?)",
            (battle, side, participant, digest, NOW),
        )

    def _transition(self, battle="battle-a", side="A", digest="a" * 64,
                    generation=1, command="A:one", version=0):
        old = json.loads(self.db.execute(
            "SELECT state_json FROM gameplay_battles WHERE battle_id=?", (battle,)
        ).fetchone()[0])
        next_state = {**old, "version": version + 1, "phase": "waiting"}
        event = {"eventId": f"{battle}:v{version + 1}:participant.committed",
                 "battleId": battle, "version": version + 1,
                 "type": "participant.committed", "payload": {"side": side}}
        next_state["events"] = old["events"] + [event]
        self.db.execute(
            """INSERT INTO gameplay_apply_participant_transition (
              battle_id,expected_version,command_id,fingerprint,receipt_code,
              receipt_event_ids_json,next_state_json,events_json,trusted_now_ms,
              capability_side,capability_token_sha256,expected_generation)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (battle, version, command, "fingerprint", "COMMITTED", json.dumps([event["eventId"]]),
             json.dumps(next_state), json.dumps([event]), NOW + version + 1,
             side, digest, generation),
        )

    def _snapshot(self, battle="battle-a"):
        state = self.db.execute(
            "SELECT version,state_json FROM gameplay_battles WHERE battle_id=?", (battle,)
        ).fetchone()
        receipts = self.db.execute(
            "SELECT * FROM gameplay_command_receipts WHERE battle_id=? ORDER BY command_id", (battle,)
        ).fetchall()
        outbox = self.db.execute(
            "SELECT * FROM gameplay_event_outbox WHERE battle_id=? ORDER BY event_id", (battle,)
        ).fetchall()
        return state, receipts, outbox

    def test_successful_a_and_b_participant_transitions(self):
        self._transition(command="A:first")
        self._transition(side="B", digest="b" * 64, command="B:first", version=1)
        self.assertEqual(self.db.execute(
            "SELECT version FROM gameplay_battles WHERE battle_id='battle-a'"
        ).fetchone()[0], 2)
        self.assertEqual(self.db.execute(
            "SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id='battle-a'"
        ).fetchone()[0], 2)
        self.assertEqual(self.db.execute(
            "SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id='battle-a'"
        ).fetchone()[0], 3)

    def test_revoked_stale_generation_wrong_digest_battle_and_side_fail_without_writes(self):
        cases = (
            ("revoked", "UPDATE gameplay_battle_capabilities SET status='revoked' WHERE battle_id='battle-a' AND side='A'", "battle-a", "A", "a" * 64, 1),
            ("stale generation", "UPDATE gameplay_battle_capabilities SET generation=2 WHERE battle_id='battle-a' AND side='A'", "battle-a", "A", "a" * 64, 1),
            ("wrong digest", None, "battle-a", "A", "f" * 64, 1),
            ("wrong battle", None, "battle-b", "A", "a" * 64, 1),
            ("wrong side", None, "battle-a", "B", "a" * 64, 1),
        )
        for name, mutation, battle, side, digest, generation in cases:
            with self.subTest(name=name):
                if mutation:
                    self.db.execute(mutation)
                before = self._snapshot("battle-a")
                with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_CAPABILITY"):
                    self._transition(battle, side, digest, generation, command=f"A:{name}")
                self.assertEqual(self._snapshot("battle-a"), before)
                self.assertEqual(self._snapshot("battle-b")[0][0], 0)
                if mutation:
                    if name == "revoked":
                        self.db.execute("UPDATE gameplay_battle_capabilities SET status='active' WHERE battle_id='battle-a' AND side='A'")

    def test_duplicate_receipt_rolls_back_state_and_outbox(self):
        self._transition(command="A:duplicate")
        before = self._snapshot()
        with self.assertRaises(sqlite3.IntegrityError):
            self._transition(command="A:duplicate", version=1)
        self.assertEqual(self._snapshot(), before)

    def test_transition_and_revocation_are_serialized_atomically(self):
        # Start both independent SQLite connections together. SQLite must
        # serialize the writers: either the transition linearizes first, or
        # revocation does and the authorization trigger rejects the write.
        for index in range(12):
            battle = f"battle-race-{index}"
            digest = f"{index + 1:064x}"
            self._genesis(battle)
            self._cap(battle, "A", "participant-a", digest)
            start = threading.Barrier(2)
            result = {}

            def revoke():
                db = self._connect()
                start.wait()
                try:
                    db.execute("BEGIN IMMEDIATE")
                    db.execute("UPDATE gameplay_battle_capabilities SET status='revoked' WHERE battle_id=? AND side='A'", (battle,))
                    db.commit()
                    result["revoked"] = True
                finally:
                    db.close()

            def transition_thread():
                # Keep worker DB connection thread-local for sqlite.
                db = self._connect()
                start.wait()
                try:
                    self._transition_on(db, battle, digest)
                    result["transition"] = True
                except sqlite3.IntegrityError as error:
                    result["transition"] = False
                    result["error"] = str(error)
                db.close()

            threads = [threading.Thread(target=revoke), threading.Thread(target=transition_thread)]
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join(5)
                self.assertFalse(thread.is_alive())
            self.assertTrue(result["revoked"])
            if result["transition"]:
                self.assertTrue(result["transition"])
                self.assertEqual(self._snapshot(battle)[0][0], 1)
                self.assertEqual(len(self._snapshot(battle)[1]), 1)
                self.assertEqual(len(self._snapshot(battle)[2]), 2)
            else:
                self.assertIn("INVALID_CAPABILITY", result["error"])
                self.assertEqual(self._snapshot(battle)[0][0], 0)
                self.assertEqual(len(self._snapshot(battle)[1]), 0)
                self.assertEqual(len(self._snapshot(battle)[2]), 1)

    def _transition_on(self, db, battle, digest):
        old = json.loads(db.execute("SELECT state_json FROM gameplay_battles WHERE battle_id=?", (battle,)).fetchone()[0])
        nxt = {**old, "version": 1, "phase": "waiting"}
        event = {"eventId": f"{battle}:v1:race", "battleId": battle, "version": 1,
                 "type": "participant.committed", "payload": {}}
        nxt["events"] = old["events"] + [event]
        db.execute(
            """INSERT INTO gameplay_apply_participant_transition (
              battle_id,expected_version,command_id,fingerprint,receipt_code,
              receipt_event_ids_json,next_state_json,events_json,trusted_now_ms,
              capability_side,capability_token_sha256,expected_generation)
              VALUES (?,0,'A:race','fingerprint','COMMITTED',?,?,?,?, 'A',?,1)""",
            (battle, json.dumps([event["eventId"]]), json.dumps(nxt), json.dumps([event]), NOW + 1, digest),
        )


if __name__ == "__main__":
    unittest.main()
