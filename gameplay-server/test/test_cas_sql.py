"""SQLite integration tests for Chat 03B1's atomic transition statement.

Uses a real SQLite engine, not a mocked D1 API. Live D1 verification remains
a separate gate before integrating a Worker or deploying gameplay storage.
"""
import copy
import json
import sqlite3
import tempfile
import threading
import unittest
from pathlib import Path

MIGRATION = Path(__file__).resolve().parents[1] / "migrations" / "0001_tactical_state.sql"
APPLY = "INSERT INTO gameplay_apply_transition VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"


def genesis(battle_id="b"):
    return {
        "schemaVersion": 1,
        "battleId": battle_id,
        "version": 0,
        "rulesVersion": "tactical_v1",
        "phase": "created",
        "createdAt": 0,
        "deadlineAt": 1000,
        "participants": {
            "A": {"id": "participant-A", "role": "citizen"},
            "B": {"id": "participant-B", "role": "citizen"},
        },
        "commits": {},
        "commandReceipts": {},
        "events": [],
    }


def open_db(path=":memory:"):
    db = sqlite3.connect(path, timeout=15)
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("PRAGMA busy_timeout = 15000")
    return db


def init(db):
    db.executescript(MIGRATION.read_text(encoding="utf-8"))


def create(db, battle_id="b"):
    state = genesis(battle_id)
    db.execute(
        "INSERT INTO gameplay_battles VALUES (?, ?, ?, ?, ?, ?, ?)",
        (battle_id, 0, "tactical_v1", "created", json.dumps(state), 0, 0),
    )
    db.commit()
    return state


def transition(db, original, command_id, event_ids=None, events=None, now=123,
               **state_changes):
    event_ids = [] if event_ids is None else event_ids
    events = [] if events is None else events
    state = copy.deepcopy(original)
    state.update({"version": original["version"] + 1, "phase": "waiting"})
    state.update(state_changes)
    db.execute(APPLY, (
        original["battleId"], original["version"], command_id, "fingerprint:" + command_id,
        "COMMITTED", json.dumps(event_ids), json.dumps(state), json.dumps(events), now,
    ))
    db.commit()
    return state


def event(battle="b", event_id=None, version=1):
    return {
        "eventId": event_id or battle + ":v" + str(version) + ":battle.selection_committed",
        "version": version,
        "type": "battle.selection_committed",
        "payload": {"side": "A"},
    }


class GameplayCasTests(unittest.TestCase):
    def setUp(self):
        self.db = open_db()
        init(self.db)
        self.initial = create(self.db)

    def tearDown(self):
        self.db.close()

    def rows(self, table):
        return self.db.execute("SELECT COUNT(*) FROM " + table).fetchone()[0]

    def state(self):
        return self.db.execute(
            "SELECT version, phase, state_json FROM gameplay_battles WHERE battle_id='b'"
        ).fetchone()

    def test_migration_is_separate_from_telemetry(self):
        tables = {row[0] for row in self.db.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )}
        self.assertEqual(tables, {
            "gameplay_battles", "gameplay_command_receipts", "gameplay_event_outbox"
        })
        self.assertEqual(self.rows("gameplay_battles"), 1)

    def test_atomic_commit_writes_snapshot_receipt_and_outbox(self):
        e = event()
        next_state = transition(self.db, self.initial, "command-a",
                                [e["eventId"]], [e])
        version, phase, snapshot = self.state()
        self.assertEqual((version, phase), (1, "waiting"))
        self.assertEqual(json.loads(snapshot), next_state)
        self.assertEqual(self.rows("gameplay_command_receipts"), 1)
        self.assertEqual(self.rows("gameplay_event_outbox"), 1)
        self.assertEqual(self.db.execute(
            "SELECT event_id FROM gameplay_event_outbox"
        ).fetchone()[0], e["eventId"])

    def test_stale_cas_fails_without_partial_receipt_or_outbox(self):
        transition(self.db, self.initial, "winner")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "VERSION_CONFLICT"):
            transition(self.db, self.initial, "loser",
                       ["b:v1:loser"], [event(event_id="b:v1:loser")])
        self.db.commit()  # a failed statement cannot leave writes to commit
        self.assertEqual(self.state()[0], 1)
        self.assertEqual(self.rows("gameplay_command_receipts"), 1)
        self.assertEqual(self.rows("gameplay_event_outbox"), 0)

    def test_duplicate_command_id_rejected_with_unchanged_version(self):
        state = transition(self.db, self.initial, "same")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "COMMAND_ID_REUSE"):
            transition(self.db, state, "same")
        self.db.commit()
        self.assertEqual(self.state()[0], 1)
        self.assertEqual(self.rows("gameplay_command_receipts"), 1)

    def test_reused_event_id_rolls_back_entire_transition(self):
        e = event()
        state = transition(self.db, self.initial, "a", [e["eventId"]], [e])
        with self.assertRaises(sqlite3.IntegrityError):
            transition(self.db, state, "b", [e["eventId"]], [e])
        self.db.commit()
        self.assertEqual(self.state()[0], 1)
        self.assertEqual(self.rows("gameplay_command_receipts"), 1)
        self.assertEqual(self.rows("gameplay_event_outbox"), 1)

    def test_immutable_participants_deadline_and_rules_are_fenced(self):
        for change in [
            {"participants": {"A": {"id": "attacker"}, "B": {"id": "b"}}},
            {"deadlineAt": 99999},
            {"rulesVersion": "tactical_v2"},
            {"createdAt": 1},
        ]:
            with self.subTest(change=change):
                with self.assertRaises(sqlite3.IntegrityError):
                    transition(self.db, self.initial, "bad" + str(len(change)), **change)
                self.db.commit()
                self.assertEqual(self.state()[0], 0)
                self.assertEqual(self.rows("gameplay_command_receipts"), 0)

    def test_null_cannot_remove_immutable_snapshot_or_version(self):
        for key in ("participants", "deadlineAt", "rulesVersion", "createdAt"):
            with self.subTest(key=key):
                with self.assertRaises(sqlite3.IntegrityError):
                    transition(self.db, self.initial, "null-" + key, **{key: None})
                self.db.commit()
                self.assertEqual(self.state()[0], 0)
                self.assertEqual(self.rows("gameplay_command_receipts"), 0)
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_TRANSITION"):
            transition(self.db, self.initial, "null-version", version=None)
        self.db.commit()
        self.assertEqual(self.state()[0], 0)

    def test_wrong_trusted_time_and_null_event_id_roll_back(self):
        with self.assertRaises(sqlite3.IntegrityError):
            transition(self.db, self.initial, "string-clock", now="fake-client-time")
        self.db.commit()
        self.assertEqual(self.state()[0], 0)
        broken_event = event()
        broken_event["eventId"] = None
        with self.assertRaises(sqlite3.IntegrityError):
            transition(self.db, self.initial, "null-event-id",
                       [None], [broken_event])
        self.db.commit()
        self.assertEqual(self.state()[0], 0)
        self.assertEqual(self.rows("gameplay_command_receipts"), 0)
        self.assertEqual(self.rows("gameplay_event_outbox"), 0)

    def test_receipt_event_set_must_match_transition_outbox(self):
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_TRANSITION"):
            transition(self.db, self.initial, "wrong-events",
                       ["b:missing"], [event(event_id="b:other")])
        self.db.commit()
        self.assertEqual(self.state()[0], 0)
        self.assertEqual(self.rows("gameplay_command_receipts"), 0)

    def test_receipt_only_transition_is_supported(self):
        state = transition(self.db, self.initial, "duplicate-choice")
        self.assertEqual(self.state()[0], 1)
        self.assertEqual(json.loads(self.state()[2]), state)
        self.assertEqual(self.rows("gameplay_command_receipts"), 1)
        self.assertEqual(self.rows("gameplay_event_outbox"), 0)

    def test_versioned_history_and_stable_terminal_event_key(self):
        s1 = transition(self.db, self.initial, "first")
        s2 = transition(self.db, s1, "second", phase="committed")
        e = event(event_id="b:final", version=3)
        transition(self.db, s2, "final", ["b:final"], [e], phase="final")
        self.assertEqual(self.state()[0], 3)
        self.assertEqual(self.db.execute(
            "SELECT event_id FROM gameplay_event_outbox"
        ).fetchone()[0], "b:final")

    def test_concurrent_same_version_has_one_winner(self):
        # Shared file ensures actual SQLite locking/transaction semantics, not mocks.
        with tempfile.TemporaryDirectory() as tmp:
            path = str(Path(tmp) / "gameplay.sqlite3")
            creator = open_db(path)
            init(creator)
            original = create(creator, "race")
            creator.close()
            barrier = threading.Barrier(2)
            outcomes = []
            lock = threading.Lock()

            def contender(command_id):
                db = open_db(path)
                barrier.wait()
                try:
                    transition(db, original, command_id)
                    outcome = "success"
                except sqlite3.IntegrityError as exc:
                    outcome = str(exc)
                finally:
                    db.close()
                with lock:
                    outcomes.append(outcome)

            threads = [threading.Thread(target=contender, args=(str(i),))
                       for i in range(2)]
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join(timeout=20)
            self.assertEqual(len(outcomes), 2, outcomes)
            self.assertEqual(sum(x == "success" for x in outcomes), 1, outcomes)
            self.assertEqual(sum("VERSION_CONFLICT" in x for x in outcomes), 1, outcomes)
            verify = open_db(path)
            self.assertEqual(verify.execute(
                "SELECT version FROM gameplay_battles WHERE battle_id='race'"
            ).fetchone()[0], 1)
            self.assertEqual(verify.execute(
                "SELECT COUNT(*) FROM gameplay_command_receipts"
            ).fetchone()[0], 1)
            verify.close()


if __name__ == "__main__":
    unittest.main()
