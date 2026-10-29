"""Executable 0001-0006 D1-compatible SQLite lifecycle checks."""
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [ROOT / "migrations" / name for name in (
    "0001_tactical_state.sql", "0002_battle_capabilities.sql",
    "0003_idempotent_battle_creation.sql", "0004_capability_generation.sql",
    "0005_participant_transition_fence.sql", "0006_creation_recovery_lifecycle.sql",
)]
NOW = 1_800_000_000_000
SELECTION = {"attackColor": "y", "defenseColor": "y", "attackType": "N",
             "defenseType": "S", "role": "citizen"}


def digest(n):
    return f"{n:064x}"


def battle_state(battle, version=0, phase="created", deadline=NOW + 60_000):
    return {
        "schemaVersion": 1, "battleId": battle, "version": version,
        "rulesVersion": "tactical_v1", "phase": phase, "createdAt": NOW,
        "deadlineAt": deadline,
        "participants": {"A": {"id": f"{battle}-A", "role": "citizen"},
                         "B": {"id": f"{battle}-B", "role": "citizen"}},
        "commits": {}, "commandReceipts": {}, "events": [],
        "mechanicalOutcome": None, "resolution": None,
        "socialOutcome": None, "recognizedOutcome": None,
    }


class CreationRecoveryLifecycleSQLTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="chat03b2-recovery-0006-")
        self.path = str(Path(self.tmp.name) / "gameplay.sqlite")
        self.db = sqlite3.connect(self.path, timeout=10, isolation_level=None)
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.execute("PRAGMA busy_timeout=10000")
        for migration in MIGRATIONS[:5]:
            self.db.executescript(migration.read_text(encoding="utf-8"))
        self._seed_legacy("legacy-a", 1, 10)
        self._seed_legacy("legacy-b", 2, 20, phase="committed", version=1)
        self.db.execute("INSERT INTO gameplay_command_receipts VALUES (?, ?, ?, ?, ?, ?)",
                        ("legacy-b", "old-receipt", "fingerprint", "COMMITTED", "[]", 1))
        self.db.execute("INSERT INTO gameplay_event_outbox VALUES (?, ?, ?, ?, ?, ?, ?)",
                        ("legacy-b:event", "legacy-b", 1, "battle.committed", "{}", NOW, None))
        self.db.commit()
        self.before = self._protected_snapshot()
        self.db.executescript(MIGRATIONS[5].read_text(encoding="utf-8"))

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def _seed_legacy(self, battle, keyn, capn, phase="created", version=0):
        state = battle_state(battle, version, phase)
        state["commits"] = {"A": {"version": 1, "selection": SELECTION}} if version else {}
        self.db.execute("INSERT INTO gameplay_battles VALUES (?, ?, 'tactical_v1', ?, ?, ?, ?)",
                        (battle, version, phase, json.dumps(state, separators=(",", ":")), NOW, NOW))
        for side, offset in (("A", 0), ("B", 1)):
            self.db.execute("""INSERT INTO gameplay_battle_capabilities
              (battle_id,side,participant_id,token_sha256,created_at_ms) VALUES (?,?,?,?,?)""",
                            (battle, side, f"{battle}-{side}", digest(capn + offset), NOW))
        self.db.execute("INSERT INTO gameplay_battle_creations VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (digest(keyn), digest(keyn + 100), battle, NOW + 60_000,
                         "legacy-key-v1", "AAAAAAAAAAAAAAAA", "c3ludGhldGljLWVuY3J5cHRlZA", NOW))

    def _protected_snapshot(self):
        result = {}
        for table in ("gameplay_battles", "gameplay_battle_capabilities",
                      "gameplay_command_receipts", "gameplay_event_outbox"):
            result[table] = self.db.execute(f"SELECT * FROM {table} ORDER BY 1,2").fetchall()
        return result

    def _creation(self, battle):
        return self.db.execute("SELECT * FROM gameplay_battle_creations WHERE battle_id=?", (battle,)).fetchone()

    def _seed_recoverable(self, battle, keyn, capn):
        state = battle_state(battle)
        self.db.execute("INSERT INTO gameplay_battles VALUES (?, 0, 'tactical_v1', 'created', ?, ?, ?)",
                        (battle, json.dumps(state, separators=(",", ":")), NOW, NOW))
        caps = {"A": digest(capn), "B": digest(capn + 1)}
        for side in ("A", "B"):
            self.db.execute("""INSERT INTO gameplay_battle_capabilities
              (battle_id,side,participant_id,token_sha256,created_at_ms,status,generation)
              VALUES (?,?,?,?,?,'active',1)""", (battle, side, f"{battle}-{side}", caps[side], NOW))
        self.db.execute("""INSERT INTO gameplay_battle_creations (
          idempotency_key_sha256,request_fingerprint_sha256,lifecycle_state,battle_id,
          deadline_at_ms,recovery_key_version,recovery_nonce_base64url,
          capabilities_ciphertext_base64url,original_a_token_sha256,original_a_generation,
          original_b_token_sha256,original_b_generation,created_at_ms)
          VALUES (?,?,'RECOVERABLE',?,?, 'test-v1','AAAAAAAAAAAAAAAA',?, ?,1, ?,1,?)""",
                        (digest(keyn), digest(keyn + 100), battle, NOW + 60_000,
                         "synthetic-ciphertext", caps["A"], caps["B"], NOW))
        return {"key": digest(keyn), "caps": caps}

    def _transition(self, battle, *, command_id, event_id, side=None,
                    token_digest=None, generation=1, expected_version=0,
                    phase="waiting", expected_error=None):
        before = json.loads(self.db.execute("SELECT state_json FROM gameplay_battles WHERE battle_id=?",
                                            (battle,)).fetchone()[0])
        after = dict(before)
        after["version"] = expected_version + 1
        after["phase"] = phase
        if side:
            after["commits"] = dict(before["commits"])
            after["commits"][side] = {"version": expected_version + 1, "selection": SELECTION}
        event = {"eventId": event_id, "battleId": battle, "version": expected_version + 1,
                 "type": "battle.test_transition", "payload": {}}
        after["events"] = [*before["events"], event]
        sql = ("INSERT INTO gameplay_apply_participant_transition "
               "(battle_id,expected_version,command_id,fingerprint,receipt_code,"
               "receipt_event_ids_json,next_state_json,events_json,trusted_now_ms,"
               "capability_side,capability_token_sha256,expected_generation) "
               "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)") if side else (
               "INSERT INTO gameplay_apply_transition "
               "(battle_id,expected_version,command_id,fingerprint,receipt_code,"
               "receipt_event_ids_json,next_state_json,events_json,trusted_now_ms) "
               "VALUES (?,?,?,?,?,?,?,?,?)")
        values = (battle, expected_version, command_id, "synthetic-fingerprint", "COMMITTED",
                  json.dumps([event_id]), json.dumps(after, separators=(",", ":")),
                  json.dumps([event], separators=(",", ":")), NOW + 1)
        if side:
            values += (side, token_digest, generation)
        try:
            self.db.execute(sql, values)
        except sqlite3.IntegrityError as error:
            if expected_error is None:
                raise
            self.assertIn(expected_error, str(error))
            return
        if expected_error:
            self.fail(f"expected {expected_error} but transition succeeded")

    def test_real_migrations_fail_close_legacy_and_preserve_gameplay_snapshots(self):
        rows = self.db.execute("""SELECT idempotency_key_sha256,request_fingerprint_sha256,
          lifecycle_state,battle_id,deadline_at_ms,recovery_key_version,
          recovery_nonce_base64url,capabilities_ciphertext_base64url,
          original_a_token_sha256,original_a_generation,original_b_token_sha256,
          original_b_generation,created_at_ms FROM gameplay_battle_creations ORDER BY battle_id""").fetchall()
        self.assertEqual(len(rows), 2)
        for row, expected_battle in zip(rows, ("legacy-a", "legacy-b")):
            self.assertEqual(row[:5][2:4], ("CLOSED", expected_battle))
            self.assertEqual(row[5:12], (None,) * 7)
            self.assertIsNotNone(row[1])
        self.assertEqual(self._protected_snapshot(), self.before)
        self.assertEqual(self.db.execute("PRAGMA foreign_keys").fetchone()[0], 1)
        self.assertEqual(self.db.execute("PRAGMA foreign_key_check").fetchall(), [])

    def test_fresh_recovery_requires_exact_active_original_digest_pair_and_generations(self):
        proof = self._seed_recoverable("fresh-proof", 30, 300)
        row = self._creation("fresh-proof")
        self.assertEqual(row[2], "RECOVERABLE")
        self.assertEqual((row[8], row[9], row[10], row[11]),
                         (proof["caps"]["A"], 1, proof["caps"]["B"], 1))
        before = row
        with self.assertRaisesRegex(sqlite3.IntegrityError, "RECOVERY_ISSUANCE_PROOF_MISMATCH"):
            self.db.execute("""INSERT INTO gameplay_battle_creations
              (idempotency_key_sha256,request_fingerprint_sha256,lifecycle_state,battle_id,
               deadline_at_ms,recovery_key_version,recovery_nonce_base64url,
               capabilities_ciphertext_base64url,original_a_token_sha256,original_a_generation,
               original_b_token_sha256,original_b_generation,created_at_ms)
              VALUES (?,?,'RECOVERABLE',? ,?,'k','AAAAAAAAAAAAAAAA','cipher',?,1,?,2,?)""",
                            (digest(301), digest(302), "fresh-proof", NOW + 60_000,
                             proof["caps"]["A"], proof["caps"]["B"], NOW))
        self.assertEqual(self._creation("fresh-proof"), before)
        with self.assertRaisesRegex(sqlite3.IntegrityError, "RECOVERY_ORIGINAL_BINDING_MISMATCH"):
            self.db.execute("UPDATE gameplay_battle_creations SET original_a_generation=2 WHERE battle_id='fresh-proof'")

    def test_successful_first_participant_commit_closes_payload_atomically(self):
        proof = self._seed_recoverable("commit-close", 31, 310)
        self._transition("commit-close", command_id="A:cmd-0001",
                         event_id="commit-close:v1:commit", side="A",
                         token_digest=proof["caps"]["A"])
        row = self._creation("commit-close")
        self.assertEqual(row[2], "CLOSED")
        self.assertEqual(row[5:12], (None,) * 7)
        state = json.loads(self.db.execute("SELECT state_json FROM gameplay_battles WHERE battle_id='commit-close'").fetchone()[0])
        self.assertEqual((state["version"], state["phase"]), (1, "waiting"))
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id='commit-close'").fetchone()[0], 1)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id='commit-close'").fetchone()[0], 1)

    def test_failed_authorization_and_cas_leave_recovery_and_all_snapshots_unchanged(self):
        proof = self._seed_recoverable("failed-commit", 32, 320)
        protected = self._protected_snapshot()
        creation = self._creation("failed-commit")
        self._transition("failed-commit", command_id="A:wrong-gen", event_id="e1",
                         side="A", token_digest=proof["caps"]["A"], generation=2,
                         expected_error="INVALID_CAPABILITY")
        self._transition("failed-commit", command_id="A:stale-cas", event_id="e2",
                         side="A", token_digest=proof["caps"]["A"], expected_version=4,
                         expected_error="VERSION_CONFLICT")
        self.assertEqual(self._creation("failed-commit"), creation)
        self.assertEqual(self._protected_snapshot(), protected)

    def test_late_outbox_failure_rolls_back_state_receipt_and_recovery_closure(self):
        proof = self._seed_recoverable("rollback-commit", 33, 330)
        other = battle_state("other-battle")
        self.db.execute("INSERT INTO gameplay_battles VALUES (?,0,'tactical_v1','created',?,?,?)",
                        ("other-battle", json.dumps(other), NOW, NOW))
        self.db.execute("INSERT INTO gameplay_event_outbox VALUES (?, ?, 1, 'collision', '{}', ?, NULL)",
                        ("rollback-commit:v1:collision", "other-battle", NOW))
        before = self._protected_snapshot(), self._creation("rollback-commit")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "UNIQUE constraint failed"):
            self._transition("rollback-commit", command_id="A:late-failure",
                             event_id="rollback-commit:v1:collision", side="A",
                             token_digest=proof["caps"]["A"])
        self.db.rollback()
        self.assertEqual((self._protected_snapshot(), self._creation("rollback-commit")), before)

    def test_rotation_status_revocation_delete_and_rollback_close_atomically(self):
        for index, operation in enumerate(("rotate", "revoke", "delete"), start=1):
            battle = f"credential-{operation}"
            self._seed_recoverable(battle, 40 + index, 400 + index * 2)
            old = self.db.execute("SELECT token_sha256 FROM gameplay_battle_capabilities WHERE battle_id=? AND side='A'", (battle,)).fetchone()[0]
            self.db.execute("BEGIN IMMEDIATE")
            if operation == "rotate":
                self.db.execute("UPDATE gameplay_battle_capabilities SET token_sha256=?,generation=2 WHERE battle_id=? AND side='A'",
                                (digest(800 + index), battle))
            elif operation == "revoke":
                self.db.execute("UPDATE gameplay_battle_capabilities SET status='revoked' WHERE battle_id=? AND side='A'", (battle,))
            else:
                self.db.execute("DELETE FROM gameplay_battle_capabilities WHERE battle_id=? AND side='A'", (battle,))
            self.assertEqual(self._creation(battle)[2], "CLOSED")
            self.db.rollback()
            self.assertEqual(self._creation(battle)[2], "RECOVERABLE")
            self.assertEqual(self.db.execute("SELECT token_sha256 FROM gameplay_battle_capabilities WHERE battle_id=? AND side='A'", (battle,)).fetchone()[0], old)
            if operation == "rotate":
                self.db.execute("UPDATE gameplay_battle_capabilities SET token_sha256=?,generation=2 WHERE battle_id=? AND side='A'",
                                (digest(900 + index), battle))
            elif operation == "revoke":
                self.db.execute("UPDATE gameplay_battle_capabilities SET status='revoked' WHERE battle_id=? AND side='A'", (battle,))
            else:
                self.db.execute("DELETE FROM gameplay_battle_capabilities WHERE battle_id=? AND side='A'", (battle,))
            row = self._creation(battle)
            self.assertEqual(row[2], "CLOSED")
            self.assertEqual(row[5:12], (None,) * 7)

    def test_terminal_scheduler_expiry_receipt_closes_and_failed_expiry_does_not(self):
        self._seed_recoverable("scheduler-expiry", 50, 500)
        self._transition("scheduler-expiry", command_id="system:expire:scheduler-expiry",
                         event_id="scheduler-expiry:v1:expired", phase="expired",
                         expected_version=9, expected_error="VERSION_CONFLICT")
        self.assertEqual(self._creation("scheduler-expiry")[2], "RECOVERABLE")
        self._transition("scheduler-expiry", command_id="system:expire:scheduler-expiry",
                         event_id="scheduler-expiry:v1:expired", phase="expired")
        row = self._creation("scheduler-expiry")
        self.assertEqual(row[2], "CLOSED")
        self.assertEqual(row[5:12], (None,) * 7)
        self.assertEqual(self.db.execute("SELECT phase FROM gameplay_battles WHERE battle_id='scheduler-expiry'").fetchone()[0], "expired")

    def test_closed_then_tombstone_retains_only_digest_without_purging_gameplay(self):
        proof = self._seed_recoverable("tombstone", 60, 600)
        self.db.execute("UPDATE gameplay_battle_capabilities SET status='revoked' WHERE battle_id='tombstone' AND side='A'")
        closed = self._creation("tombstone")
        self.assertEqual(closed[2], "CLOSED")
        self.db.execute("""UPDATE gameplay_battle_creations SET lifecycle_state='TOMBSTONE',
          request_fingerprint_sha256=NULL,battle_id=NULL,deadline_at_ms=NULL,
          recovery_key_version=NULL,recovery_nonce_base64url=NULL,
          capabilities_ciphertext_base64url=NULL,original_a_token_sha256=NULL,
          original_a_generation=NULL,original_b_token_sha256=NULL,
          original_b_generation=NULL,created_at_ms=NULL WHERE idempotency_key_sha256=?""",
                        (proof["key"],))
        row = self.db.execute("SELECT * FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (proof["key"],)).fetchone()
        self.assertEqual(row, (proof["key"], None, "TOMBSTONE", None, None, None, None,
                               None, None, None, None, None, None))
        gameplay = self._protected_snapshot()
        with self.assertRaisesRegex(sqlite3.IntegrityError, "CREATION_DELETE_NOT_AUTHORIZED"):
            self.db.execute("DELETE FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (proof["key"],))
        self.db.rollback()
        self.assertEqual(self._protected_snapshot(), gameplay)
        self.assertEqual(self.db.execute("PRAGMA foreign_key_check").fetchall(), [])
        columns = {row[1] for row in self.db.execute("PRAGMA table_info(gameplay_battle_creations)")}
        self.assertFalse(any("purge" in name or "retention" in name for name in columns))

    def test_closed_rows_cannot_reopen_and_tombstones_cannot_become_closed(self):
        proof = self._seed_recoverable("no-reopen", 70, 700)
        self.db.execute("UPDATE gameplay_battle_capabilities SET generation=2 WHERE battle_id='no-reopen' AND side='A'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_CREATION_STATE_EDGE"):
            self.db.execute("""UPDATE gameplay_battle_creations SET lifecycle_state='RECOVERABLE',
              recovery_key_version='test-v1',recovery_nonce_base64url='AAAAAAAAAAAAAAAA',
              capabilities_ciphertext_base64url='cipher',original_a_token_sha256=?,
              original_a_generation=2,original_b_token_sha256=?,original_b_generation=1
              WHERE idempotency_key_sha256=?""", (proof["caps"]["A"], proof["caps"]["B"], proof["key"]))
        self.db.rollback()
        self.assertEqual(self._creation("no-reopen")[2], "CLOSED")


if __name__ == "__main__":
    unittest.main()
