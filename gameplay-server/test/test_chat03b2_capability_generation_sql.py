"""D1-compatible SQLite proof for additive capability generation metadata."""
import sqlite3
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "migrations"
NOW = 1_800_000_000_000
SAFE_INTEGER_MAX = 9_007_199_254_740_991


def connect(path):
    db = sqlite3.connect(path, isolation_level=None)
    db.execute("PRAGMA foreign_keys=ON")
    return db


class CapabilityGenerationSqlTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="chat03b2-capability-generation-")
        self.db = connect(str(Path(self.temp.name) / "fixture.sqlite"))
        for name in (
            "0001_tactical_state.sql",
            "0002_battle_capabilities.sql",
            "0003_idempotent_battle_creation.sql",
        ):
            self.db.executescript((MIGRATIONS / name).read_text(encoding="utf-8"))
        self._seed("battle-a", "A", "participant-a", "a" * 64)
        self._seed("battle-a", "B", "participant-b", "b" * 64)
        self._seed("battle-b", "A", "participant-c", "c" * 64)
        self.db.execute(
            """INSERT INTO gameplay_battle_creations
            (idempotency_key_sha256,request_fingerprint_sha256,battle_id,deadline_at_ms,
             recovery_key_version,recovery_nonce_base64url,
             capabilities_ciphertext_base64url,created_at_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            ("d" * 64, "e" * 64, "battle-a", NOW + 60_000,
             "fixture-key-v1", "AAAAAAAAAAAAAAAA", "fixture-ciphertext", NOW),
        )
        self.db.execute(
            "INSERT INTO gameplay_command_receipts VALUES (?, ?, ?, ?, ?, ?)",
            ("battle-a", "fixture-command", "fixture-fingerprint", "COMMITTED", "[]", 1),
        )
        self.db.execute(
            "INSERT INTO gameplay_event_outbox VALUES (?, ?, ?, ?, ?, ?, ?)",
            ("battle-a:fixture-event", "battle-a", 1, "fixture.event", "{}", NOW, None),
        )
        self.db.commit()
        self.rows_before = {
            table: self.db.execute(f"SELECT * FROM {table} ORDER BY rowid").fetchall()
            for table in (
                "gameplay_battles", "gameplay_battle_capabilities",
                "gameplay_battle_creations", "gameplay_command_receipts",
                "gameplay_event_outbox",
            )
        }

    def tearDown(self):
        self.db.close()
        self.temp.cleanup()

    def _seed(self, battle, side, participant, digest):
        self.db.execute(
            """INSERT OR IGNORE INTO gameplay_battles
            VALUES (?, 0, 'tactical_v1', 'created', '{}', ?, ?)""",
            (battle, NOW, NOW),
        )
        self.db.execute(
            "INSERT INTO gameplay_battle_capabilities "
            "(battle_id,side,participant_id,token_sha256,created_at_ms) VALUES (?,?,?,?,?)",
            (battle, side, participant, digest, NOW),
        )

    def _migrate(self):
        self.db.executescript(
            (MIGRATIONS / "0004_capability_generation.sql").read_text(encoding="utf-8")
        )

    def test_migration_backfills_without_changing_existing_rows_or_constraints(self):
        self._migrate()
        for table, before_rows in self.rows_before.items():
            after_rows = self.db.execute(f"SELECT * FROM {table} ORDER BY rowid").fetchall()
            if table == "gameplay_battle_capabilities":
                self.assertEqual([row[:5] for row in after_rows], before_rows)
                self.assertEqual([row[5:] for row in after_rows], [("active", 1)] * len(before_rows))
            else:
                self.assertEqual(after_rows, before_rows, table)
        self.assertEqual(self.db.execute("PRAGMA foreign_key_check").fetchall(), [])
        self.assertEqual(self.db.execute("PRAGMA foreign_keys").fetchone()[0], 1)
        indexes = {row[1] for row in self.db.execute(
            "PRAGMA index_list(gameplay_battle_capabilities)"
        )}
        self.assertIn("idx_gameplay_battle_capabilities_lookup", indexes)
        self.assertEqual(self.db.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' "
            "AND name='gameplay_battle_capabilities'"
        ).fetchone()[0].count("PRIMARY KEY"), 1)

    def test_integral_numeric_bindings_and_safe_integer_boundary(self):
        self._migrate()
        # D1's JS Number bindings arrive as REAL; INTEGER affinity normalizes
        # integral values while fractional REAL values remain rejectable.
        self.assertEqual(self.db.execute("SELECT typeof(?)", (2.0,)).fetchone()[0], "real")
        self.assertEqual(self.db.execute("SELECT typeof(?)", (2,)).fetchone()[0], "integer")
        for value in (2.0, 3):
            self.db.execute(
                "UPDATE gameplay_battle_capabilities SET generation=? "
                "WHERE battle_id='battle-a' AND side='A'", (value,)
            )
        self.db.execute(
            "UPDATE gameplay_battle_capabilities SET generation=? "
            "WHERE battle_id='battle-b' AND side='A'", (SAFE_INTEGER_MAX,)
        )
        self.assertEqual(self.db.execute(
            "SELECT generation,typeof(generation) FROM gameplay_battle_capabilities "
            "WHERE battle_id='battle-b'"
        ).fetchone(), (SAFE_INTEGER_MAX, "integer"))

    def test_rejects_invalid_status_and_generation_values(self):
        self._migrate()
        invalid = (
            ("status", "suspended"), ("generation", 0),
            ("generation", -1), ("generation", 1.5),
            ("generation", SAFE_INTEGER_MAX + 1),
        )
        for column, value in invalid:
            with self.subTest(column=column, value=value):
                with self.assertRaises(sqlite3.IntegrityError):
                    self.db.execute(
                        f"UPDATE gameplay_battle_capabilities SET {column}=? "
                        "WHERE battle_id='battle-a' AND side='A'", (value,)
                    )

    def test_generation_cannot_regress(self):
        self._migrate()
        self.db.execute(
            "UPDATE gameplay_battle_capabilities SET generation=4 "
            "WHERE battle_id='battle-a' AND side='A'"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "CAPABILITY_GENERATION_REGRESSION"):
            self.db.execute(
                "UPDATE gameplay_battle_capabilities SET generation=3 "
                "WHERE battle_id='battle-a' AND side='A'"
            )

    def test_status_and_generation_mutate_atomically_and_rollback_together(self):
        self._migrate()
        self.db.execute("BEGIN")
        self.db.execute(
            "UPDATE gameplay_battle_capabilities SET status='revoked',generation=generation+1 "
            "WHERE battle_id='battle-a' AND side='A'"
        )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "UPDATE gameplay_battle_capabilities SET token_sha256=? "
                "WHERE battle_id='battle-a' AND side='A'", ("b" * 64,)
            )
        self.db.rollback()
        self.assertEqual(self.db.execute(
            "SELECT status,generation,token_sha256 FROM gameplay_battle_capabilities "
            "WHERE battle_id='battle-a' AND side='A'"
        ).fetchone(), ("active", 1, "a" * 64))

    def test_primary_key_digest_uniqueness_and_foreign_key_behavior_remain(self):
        self._migrate()
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO gameplay_battle_capabilities "
                "(battle_id,side,participant_id,token_sha256,created_at_ms) "
                "VALUES ('battle-a','A','duplicate-side',? ,?)", ("f" * 64, NOW)
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO gameplay_battle_capabilities "
                "(battle_id,side,participant_id,token_sha256,created_at_ms) "
                "VALUES ('battle-a','B','duplicate-digest',? ,?)", ("a" * 64, NOW)
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO gameplay_battle_capabilities "
                "(battle_id,side,participant_id,token_sha256,created_at_ms) "
                "VALUES ('missing-battle','A','orphan',? ,?)", ("f" * 64, NOW)
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("DELETE FROM gameplay_battles WHERE battle_id='battle-a'")

    def test_lookup_index_remains_usable(self):
        self._migrate()
        plan = self.db.execute(
            "EXPLAIN QUERY PLAN SELECT * FROM gameplay_battle_capabilities "
            "WHERE token_sha256=? AND battle_id=?", ("a" * 64, "battle-a")
        ).fetchone()[3]
        self.assertIn("USING INDEX", plan)


if __name__ == "__main__":
    unittest.main()
