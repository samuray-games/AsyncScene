"""SQLite enforcement checks for the 0007 operator credential lifecycle."""
import json
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [ROOT / "migrations" / f"{n:04d}_{name}.sql" for n, name in (
    (1, "tactical_state"), (2, "battle_capabilities"),
    (3, "idempotent_battle_creation"), (4, "capability_generation"),
    (5, "participant_transition_fence"), (6, "creation_recovery_lifecycle"),
    (7, "capability_operator_lifecycle"),
)]
NOW = 1_800_000_000_000


def digest(n):
    return f"{n:064x}"


class CapabilityOperatorLifecycleSQLTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:", isolation_level=None)
        self.db.execute("PRAGMA foreign_keys=ON")
        for migration in MIGRATIONS:
            self.db.executescript(migration.read_text(encoding="utf-8"))

    def tearDown(self):
        self.db.close()

    def seed(self, battle):
        state = {"battleId": battle, "version": 0, "phase": "created"}
        self.db.execute("INSERT INTO gameplay_battles VALUES (?,0,'tactical_v1','created',?,?,?)",
                        (battle, json.dumps(state), NOW, NOW))
        caps = {"A": digest(10_000 + len(battle) * 2),
                "B": digest(10_001 + len(battle) * 2)}
        for side in ("A", "B"):
            self.db.execute("""INSERT INTO gameplay_battle_capabilities
              (battle_id,side,participant_id,token_sha256,created_at_ms,status,generation)
              VALUES (?,?,?,?,?,'active',1)""",
                            (battle, side, f"{battle}-{side}", caps[side], NOW))
        key = digest(20_000 + len(battle))
        self.db.execute("""INSERT INTO gameplay_battle_creations
          (idempotency_key_sha256,request_fingerprint_sha256,lifecycle_state,battle_id,
           deadline_at_ms,recovery_key_version,recovery_nonce_base64url,
           capabilities_ciphertext_base64url,original_a_token_sha256,original_a_generation,
           original_b_token_sha256,original_b_generation,created_at_ms)
          VALUES (?,?,'RECOVERABLE',?,?,'test-v1','AAAAAAAAAAAAAAAA','synthetic-ciphertext',?,1,?,1,?)""",
                        (key, digest(30_000 + len(battle)), battle, NOW + 60_000,
                         caps["A"], caps["B"], NOW))
        return caps, key

    def test_revoke_and_replacement_close_recovery_and_require_atomic_generation_edges(self):
        caps, key = self.seed("operator-a")
        self.db.execute("UPDATE gameplay_battle_capabilities SET status='revoked',generation=2 WHERE battle_id='operator-a' AND side='A'")
        self.assertEqual(self.db.execute("SELECT status,generation,token_sha256 FROM gameplay_battle_capabilities WHERE battle_id='operator-a' AND side='A'").fetchone(),
                         ("revoked", 2, caps["A"]))
        self.assertEqual(self.db.execute("SELECT lifecycle_state,capabilities_ciphertext_base64url FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (key,)).fetchone(),
                         ("CLOSED", None))
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_CAPABILITY_OPERATOR_TRANSITION"):
            self.db.execute("UPDATE gameplay_battle_capabilities SET status='active' WHERE battle_id='operator-a' AND side='A'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_CAPABILITY_OPERATOR_TRANSITION"):
            self.db.execute("UPDATE gameplay_battle_capabilities SET status='active',generation=3 WHERE battle_id='operator-a' AND side='A'")
        self.db.execute("UPDATE gameplay_battle_capabilities SET status='active',token_sha256=?,generation=3 WHERE battle_id='operator-a' AND side='A'",
                        (digest(40_001),))
        self.assertEqual(self.db.execute("SELECT participant_id,status,generation,token_sha256 FROM gameplay_battle_capabilities WHERE battle_id='operator-a' AND side='A'").fetchone(),
                         ("operator-a-A", "active", 3, digest(40_001)))
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_capability_digest_history WHERE token_sha256=?", (digest(40_001),)).fetchone()[0], 1)

    def test_replacement_digest_reuse_and_identity_changes_are_rejected_atomically(self):
        caps, key = self.seed("operator-b")
        before = self.db.execute("SELECT * FROM gameplay_battle_capabilities WHERE battle_id='operator-b' AND side='A'").fetchone()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "CAPABILITY_DIGEST_REUSE"):
            self.db.execute("UPDATE gameplay_battle_capabilities SET status='active',token_sha256=?,generation=2 WHERE battle_id='operator-b' AND side='A'",
                            (caps["B"],))
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_CAPABILITY_OPERATOR_TRANSITION"):
            self.db.execute("UPDATE gameplay_battle_capabilities SET participant_id='changed-A',status='revoked',generation=2 WHERE battle_id='operator-b' AND side='A'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "CAPABILITY_IDENTITY_IMMUTABLE"):
            self.db.execute("UPDATE gameplay_battle_capabilities SET battle_id='moved-battle' WHERE battle_id='operator-b' AND side='A'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "CAPABILITY_DIGEST_HISTORY_IMMUTABLE"):
            self.db.execute("DELETE FROM gameplay_capability_digest_history WHERE token_sha256=?", (caps["A"],))
        with self.assertRaisesRegex(sqlite3.IntegrityError, "CAPABILITY_DIGEST_HISTORY_IMMUTABLE"):
            self.db.execute("INSERT OR REPLACE INTO gameplay_capability_digest_history(token_sha256) VALUES (?)", (caps["A"],))
        after = self.db.execute("SELECT * FROM gameplay_battle_capabilities WHERE battle_id='operator-b' AND side='A'").fetchone()
        self.assertEqual(after, before)
        self.assertEqual(self.db.execute("SELECT lifecycle_state,capabilities_ciphertext_base64url FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (key,)).fetchone(),
                         ("RECOVERABLE", "synthetic-ciphertext"))
        self.assertEqual(self.db.execute("PRAGMA foreign_key_check").fetchall(), [])


if __name__ == "__main__":
    unittest.main()
