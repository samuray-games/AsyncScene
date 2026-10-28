"""Synthetic-only SQLite feasibility probes for the proposed Chat03B2 schema.

This deliberately does not model AES-GCM, Cloudflare D1, Worker's auth boundary,
or a deployable migration. The fixture SQL runs only in disposable SQLite files.
"""
import json
import sqlite3
import tempfile
import threading
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [ROOT / "migrations" / name for name in (
    "0001_tactical_state.sql", "0002_battle_capabilities.sql",
    "0003_idempotent_battle_creation.sql",
)]
PROBE = ROOT / "test" / "fixtures" / "chat03b2_schema_v4_probe.sql"
NOW = 1_800_000_000_000


def connect(path):
    db = sqlite3.connect(path, timeout=10, isolation_level=None)
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("PRAGMA busy_timeout=10000")
    return db


def state(battle, version=0, phase="created"):
    return json.dumps({
        "schemaVersion": 1, "battleId": battle, "version": version,
        "rulesVersion": "tactical_v1", "phase": phase, "createdAt": NOW,
        "deadlineAt": NOW + 60_000, "participants": {"A": {"id": "synthetic-A"},
        "B": {"id": "synthetic-B"}}, "commits": {}, "commandReceipts": {}, "events": [],
    }, separators=(",", ":"))


def digest(n):
    return f"{n:064x}"


class Chat03B2SchemaV4ProbeTests(unittest.TestCase):
    positive_cases = 0
    negative_cases = 0

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="chat03b2-schema-v4-")
        self.path = str(Path(self.tmp.name) / "probe.sqlite")
        self.db = connect(self.path)
        for migration in MIGRATIONS:
            self.db.executescript(migration.read_text(encoding="utf-8"))
        self._seed_battle("eligible", 1, 2)
        self._seed_battle("progressed", 3, 4, version=1, phase="committed")
        self._seed_battle("missing-cap", 5, 6, capabilities=False)
        self._seed_battle("unrelated", 7, 8, creation=False)
        self._seed_battle("altered-current-digest", 9, 10)
        self.db.execute("INSERT INTO gameplay_command_receipts VALUES (?, ?, ?, ?, ?, ?)",
                        ("progressed", "synthetic-receipt", "fp", "COMMITTED", "[]", 1))
        self.db.execute("INSERT INTO gameplay_event_outbox VALUES (?, ?, ?, ?, ?, ?, ?)",
                        ("progressed:event", "progressed", 1, "synthetic.event", "{}", NOW, None))
        self.db.commit()
        self.db.executescript(PROBE.read_text(encoding="utf-8"))
        # This issuance proof belongs only to the new synthetic row. The legacy
        # migrations do not establish that its current capability digests were issued.
        self.synthetic_recovery = {"key": digest(11), "fingerprint": digest(111),
                                   "battle_id": "synthetic-recovery", "generation": 7,
                                   "cap_a": digest(9001), "cap_b": digest(9002)}
        proof = self.synthetic_recovery
        self.db.execute("INSERT INTO gameplay_battles VALUES (?, 0, 'tactical_v1', 'created', ?, ?, ?)",
                        (proof["battle_id"], state(proof["battle_id"]), NOW, NOW))
        for side, token_digest in (("A", proof["cap_a"]), ("B", proof["cap_b"])):
            self.db.execute("INSERT INTO gameplay_battle_capabilities VALUES (?, ?, ?, ?, ?)",
                            (proof["battle_id"], side, f"synthetic-{side}", token_digest, NOW))
        self.db.execute("""INSERT INTO gameplay_battle_creations
          (idempotency_key_sha256,request_fingerprint_sha256,lifecycle_state,battle_id,
           deadline_at_ms,recovery_key_version,recovery_nonce_base64url,
           capabilities_ciphertext_base64url,recovery_generation,created_at_ms)
          VALUES (?,?,'RECOVERABLE',?,?,'test-key-v1','dGVzdC1ub25jZQ',
                  'dGVzdC1jaXBoZXJ0ZXh0',?,?)""",
                        (proof["key"], proof["fingerprint"], proof["battle_id"], NOW + 60_000,
                         proof["generation"], NOW))
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def _seed_battle(self, battle, keyn, capn, version=0, phase="created",
                     capabilities=True, creation=True):
        self.db.execute("INSERT INTO gameplay_battles VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (battle, version, "tactical_v1", phase, state(battle, version, phase), NOW, NOW))
        if capabilities:
            for side, offset in (("A", 0), ("B", 1)):
                self.db.execute("INSERT INTO gameplay_battle_capabilities VALUES (?, ?, ?, ?, ?)",
                                (battle, side, f"synthetic-{battle}-{side}", digest(capn + offset), NOW))
        if creation:
            self.db.execute("INSERT INTO gameplay_battle_creations VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            (digest(keyn), digest(keyn + 100), battle, NOW + 60_000,
                             "key-v1", "AAAAAAAAAAAAAAAA", "c3ludGhldGljLWVuY3J5cHRlZA", NOW))

    def _counts(self):
        return tuple(self.db.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in (
            "gameplay_battles", "gameplay_battle_creations", "gameplay_battle_capabilities",
            "gameplay_command_receipts", "gameplay_event_outbox"))

    def _creation(self, key):
        return self.db.execute("SELECT * FROM gameplay_battle_creations WHERE idempotency_key_sha256=?",
                               (key,)).fetchone()

    def _recover(self, key, request_fingerprint, presented_a, presented_b, generation):
        row = self._creation(key)
        caps = dict(self.db.execute("SELECT side,token_sha256 FROM gameplay_battle_capabilities WHERE battle_id=?", (row[3],)))
        if (row[2] != "RECOVERABLE" or row[1] != request_fingerprint
                or row[8] != generation or caps.get("A") != presented_a
                or caps.get("B") != presented_b):
            raise PermissionError("ORIGINAL_CAPABILITIES_REQUIRED")
        return ("synthetic-original-token-A", "synthetic-original-token-B")

    def _mark(self, positive, count=1):
        cls = type(self)
        setattr(cls, "positive_cases" if positive else "negative_cases",
                getattr(cls, "positive_cases" if positive else "negative_cases") + count)

    def _close(self, key, state_name):
        self.db.execute("""UPDATE gameplay_battle_creations SET lifecycle_state=?,
          recovery_key_version=NULL, recovery_nonce_base64url=NULL,
          capabilities_ciphertext_base64url=NULL, recovery_generation=NULL,
          battle_id=CASE WHEN ?='TOMBSTONE' THEN NULL ELSE battle_id END,
          deadline_at_ms=CASE WHEN ?='TOMBSTONE' THEN NULL ELSE deadline_at_ms END,
          request_fingerprint_sha256=CASE WHEN ?='TOMBSTONE' THEN NULL ELSE request_fingerprint_sha256 END,
          created_at_ms=CASE WHEN ?='TOMBSTONE' THEN NULL ELSE created_at_ms END
          WHERE idempotency_key_sha256=?""", (state_name, state_name, state_name, state_name, state_name, key))

    def _simulate_participant_commit_transaction(self, key, expected_version, receipt_id="new-receipt", actor="A",
                token_digest=None, generation=7):
        """Python-only transaction simulation; not a Worker or SQL auth fence."""
        self.db.execute("BEGIN IMMEDIATE")
        try:
            token_digest = token_digest or (self.synthetic_recovery["cap_a"] if actor == "A" else self.synthetic_recovery["cap_b"])
            stored = self.db.execute("SELECT token_sha256 FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery' AND side=?", (actor,)).fetchone()
            recovery = self._creation(key)
            if stored is None or stored[0] != token_digest or recovery[2] != "RECOVERABLE" or recovery[8] != generation:
                raise PermissionError("CAPABILITY_RECOVERY_BINDING_REJECTED")
            row = self.db.execute("""UPDATE gameplay_battles SET version=version+1,
              phase='committed' WHERE battle_id='synthetic-recovery' AND version=? AND phase='created'""",
                                  (expected_version,))
            if row.rowcount != 1:
                raise ValueError("VERSION_CONFLICT")
            self.db.execute("""UPDATE gameplay_battle_creations SET lifecycle_state='CLOSED',
              recovery_key_version=NULL, recovery_nonce_base64url=NULL,
              capabilities_ciphertext_base64url=NULL, recovery_generation=NULL
              WHERE idempotency_key_sha256=? AND lifecycle_state='RECOVERABLE'""", (key,))
            self.db.execute("INSERT INTO gameplay_command_receipts VALUES (?, ?, ?, ?, ?, ?)",
                            ("synthetic-recovery", receipt_id, "synthetic-fingerprint", "COMMITTED", "[]", expected_version + 1))
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def _simulate_scheduler_terminal_transaction(self, authority, terminal_phase, trusted_now=NOW):
        """Python-only scheduler transaction simulation; no trusted route is modeled."""
        if authority != "scheduler":
            raise PermissionError("SCHEDULER_AUTHORITY_REQUIRED")
        if terminal_phase not in ("revealed", "expired"):
            raise ValueError("TERMINAL_PHASE_REQUIRED")
        self.db.execute("BEGIN IMMEDIATE")
        try:
            snapshot = json.loads(self.db.execute("SELECT state_json FROM gameplay_battles WHERE battle_id='synthetic-recovery'").fetchone()[0])
            if terminal_phase == "revealed" and set(snapshot.get("commits", {})) != {"A", "B"}:
                raise ValueError("REVEAL_REQUIRES_BOTH_COMMITS")
            if terminal_phase == "expired" and snapshot["deadlineAt"] > trusted_now:
                raise ValueError("EXPIRY_NOT_DUE")
            changed = self.db.execute("UPDATE gameplay_battles SET version=version+1,phase=? WHERE battle_id='synthetic-recovery' AND version=0", (terminal_phase,))
            if changed.rowcount != 1:
                raise ValueError("VERSION_CONFLICT")
            self.db.execute("""UPDATE gameplay_battle_creations SET lifecycle_state='CLOSED',
              recovery_key_version=NULL,recovery_nonce_base64url=NULL,
              capabilities_ciphertext_base64url=NULL,recovery_generation=NULL
              WHERE idempotency_key_sha256=? AND lifecycle_state='RECOVERABLE'""", (self.synthetic_recovery["key"],))
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def test_rebuild_preserves_rows_but_fails_closed_for_all_legacy_recovery(self):
        rows = {r[0]: r for r in self.db.execute("SELECT * FROM gameplay_battle_creations")}
        self.assertEqual(len(rows), 5)
        for keyn in (1, 3, 5, 9):
            row = rows[digest(keyn)]
            self.assertEqual(row[2], "CLOSED")
            self.assertEqual(row[5:9], (None, None, None, None))
            self.assertIsNotNone(row[1])
        self.assertEqual(rows[digest(1)][3], "eligible")
        self.assertEqual(rows[digest(3)][3], "progressed")
        self.assertEqual(rows[digest(5)][3], "missing-cap")
        self.assertEqual(rows[digest(9)][3], "altered-current-digest")
        self.assertEqual(rows[self.synthetic_recovery["key"]][2], "RECOVERABLE")
        self.assertEqual(self._counts(), (6, 5, 10, 1, 1))
        self.assertEqual(self.db.execute("PRAGMA foreign_keys").fetchone()[0], 1)
        self.assertEqual(self.db.execute("PRAGMA foreign_key_check").fetchall(), [])
        indexes = {row[1]: row[2] for row in self.db.execute("PRAGMA index_list(gameplay_battle_creations)")}
        self.assertIn("idx_gameplay_battle_creations_battle_state", indexes)
        self.assertIn("idx_gameplay_battle_creations_retention", indexes)
        self.assertEqual(indexes["idx_gameplay_battle_creations_retention"], 0)
        retention_sql = self.db.execute("SELECT sql FROM sqlite_master WHERE name='idx_gameplay_battle_creations_retention'").fetchone()[0]
        self.assertIn("WHERE lifecycle_state = 'TOMBSTONE'", retention_sql)
        self._mark(True, 8)

    def test_recovery_accepts_only_original_digest_pair_and_generation(self):
        key = self.synthetic_recovery["key"]
        original = (self.synthetic_recovery["cap_a"], self.synthetic_recovery["cap_b"], self.synthetic_recovery["generation"])
        row = self._creation(key)
        self.assertEqual(row[2], "RECOVERABLE")
        self.assertEqual(original[2], row[8])
        cap_rows = dict(self.db.execute("SELECT side, token_sha256 FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery'"))
        self.assertEqual((cap_rows["A"], cap_rows["B"], row[8]), original)
        self.assertEqual(self._recover(key, self.synthetic_recovery["fingerprint"], *original),
                         ("synthetic-original-token-A", "synthetic-original-token-B"))
        self._mark(True, 1)
        for replacement in ((digest(20), self.synthetic_recovery["cap_b"], 1), (self.synthetic_recovery["cap_a"], digest(30), 1), (self.synthetic_recovery["cap_a"], self.synthetic_recovery["cap_b"], 2)):
            with self.assertRaisesRegex(PermissionError, "ORIGINAL_CAPABILITIES_REQUIRED"):
                self._recover(key, self.synthetic_recovery["fingerprint"], *replacement)
            self._mark(False)

    def test_recoverable_payload_cannot_be_rebound_or_reencrypted(self):
        before = self._creation(self.synthetic_recovery["key"])
        for sql, params in (
            ("UPDATE gameplay_battle_creations SET capabilities_ciphertext_base64url='replacement' WHERE idempotency_key_sha256=?", (self.synthetic_recovery["key"],)),
            ("UPDATE gameplay_battle_creations SET recovery_generation=2 WHERE idempotency_key_sha256=?", (self.synthetic_recovery["key"],)),
        ):
            with self.assertRaises(sqlite3.IntegrityError):
                self.db.execute(sql, params)
            self.db.rollback()
            self._mark(False)
        self.assertEqual(self._creation(self.synthetic_recovery["key"]), before)
        self._mark(True)

    def test_first_participant_commit_closes_recovery_in_same_transaction(self):
        self._simulate_participant_commit_transaction(self.synthetic_recovery["key"], 0)
        row = self._creation(self.synthetic_recovery["key"])
        self.assertEqual(row[2], "CLOSED")
        self.assertEqual(row[5:9], (None, None, None, None))
        self.assertEqual(self.db.execute("SELECT version FROM gameplay_battles WHERE battle_id='synthetic-recovery'").fetchone()[0], 1)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id='synthetic-recovery'").fetchone()[0], 1)
        self._mark(True, 3)

    def test_failed_participant_transition_preserves_state_receipts_and_outbox(self):
        before = self._counts(), self._creation(self.synthetic_recovery["key"])
        with self.assertRaisesRegex(ValueError, "VERSION_CONFLICT"):
            self._simulate_participant_commit_transaction(self.synthetic_recovery["key"], 99, "rejected")
        self.assertEqual((self._counts(), self._creation(self.synthetic_recovery["key"])), before)
        self._mark(False)
        self._mark(True)

    def test_participant_cas_requires_active_original_digest_and_generation(self):
        before = self._counts(), self._creation(self.synthetic_recovery["key"])
        for token_digest, generation in ((digest(99), 1), (self.synthetic_recovery["cap_a"], 2)):
            with self.assertRaisesRegex(PermissionError, "CAPABILITY_RECOVERY_BINDING_REJECTED"):
                self._simulate_participant_commit_transaction(self.synthetic_recovery["key"], 0, "rejected-capability", token_digest=token_digest, generation=generation)
            self.assertEqual((self._counts(), self._creation(self.synthetic_recovery["key"])), before)
            self._mark(False)
        self._simulate_participant_commit_transaction(self.synthetic_recovery["key"], 0, "accepted-capability", token_digest=self.synthetic_recovery["cap_a"], generation=self.synthetic_recovery["generation"])
        self.assertEqual(self._creation(self.synthetic_recovery["key"])[2], "CLOSED")
        self._mark(True)

    def test_rotation_or_revocation_closes_before_digest_change_atomically(self):
        for operation in ("rotate", "revoke"):
            self.db.execute("BEGIN IMMEDIATE")
            try:
                self._close(self.synthetic_recovery["key"], "CLOSED")
                if operation == "rotate":
                    self.db.execute("UPDATE gameplay_battle_capabilities SET token_sha256=? WHERE battle_id='synthetic-recovery' AND side='A'", (digest(90),))
                else:
                    self.db.execute("DELETE FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery' AND side='A'")
                self.db.commit()
            except Exception:
                self.db.rollback()
                raise
            self.assertEqual(self._creation(self.synthetic_recovery["key"])[2], "CLOSED")
            self.assertEqual(self._creation(self.synthetic_recovery["key"])[5:9], (None, None, None, None))
            self._mark(True, 2)

    def test_capability_change_failure_rolls_back_digest_and_recovery_state(self):
        before = self._creation(self.synthetic_recovery["key"]), self.db.execute("SELECT token_sha256 FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery' AND side='A'").fetchone()
        self.db.execute("BEGIN IMMEDIATE")
        self.db.execute("UPDATE gameplay_battle_capabilities SET token_sha256=? WHERE battle_id='synthetic-recovery' AND side='A'", (digest(90),))
        self.assertEqual(self._creation(self.synthetic_recovery["key"])[2], "CLOSED")
        self.db.rollback()
        after = self._creation(self.synthetic_recovery["key"]), self.db.execute("SELECT token_sha256 FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery' AND side='A'").fetchone()
        self.assertEqual(after, before)
        self._mark(True)

    def test_scheduler_terminal_paths_are_separate_and_close_recovery(self):
        for phase in ("revealed", "expired"):
            if phase == "revealed":
                snapshot = json.loads(self.db.execute("SELECT state_json FROM gameplay_battles WHERE battle_id='synthetic-recovery'").fetchone()[0])
                snapshot["phase"] = "waiting"
                snapshot["commits"] = {"A": {"selection": "synthetic-A"}, "B": {"selection": "synthetic-B"}}
                self.db.execute("UPDATE gameplay_battles SET phase='waiting',state_json=? WHERE battle_id='synthetic-recovery'", (json.dumps(snapshot),))
                self.db.commit()
                self._simulate_scheduler_terminal_transaction("scheduler", phase)
            else:
                deadline = json.loads(self.db.execute("SELECT state_json FROM gameplay_battles WHERE battle_id='synthetic-recovery'").fetchone()[0])["deadlineAt"]
                self._simulate_scheduler_terminal_transaction("scheduler", phase, trusted_now=deadline)
            self.assertEqual(self._creation(self.synthetic_recovery["key"])[2], "CLOSED")
            self.assertEqual(self._creation(self.synthetic_recovery["key"])[5:9], (None, None, None, None))
            self._mark(True, 2)
            # Reset an independent eligible fixture for the other terminal case.
            if phase == "revealed":
                self.tearDown()
                self.setUp()

    def test_only_participant_commit_and_scheduler_terminal_simulations_exist(self):
        before = self._counts(), self._creation(self.synthetic_recovery["key"])
        for authority, phase in (("client", "expired"), ("participant", "revealed"), ("admin", "expired")):
            with self.assertRaisesRegex(PermissionError, "SCHEDULER_AUTHORITY_REQUIRED"):
                self._simulate_scheduler_terminal_transaction(authority, phase)
            self.assertEqual((self._counts(), self._creation(self.synthetic_recovery["key"])), before)
            self._mark(False)
        with self.assertRaisesRegex(ValueError, "TERMINAL_PHASE_REQUIRED"):
            self._simulate_scheduler_terminal_transaction("scheduler", "committed")
        with self.assertRaisesRegex(ValueError, "REVEAL_REQUIRES_BOTH_COMMITS"):
            self._simulate_scheduler_terminal_transaction("scheduler", "revealed")
        with self.assertRaisesRegex(ValueError, "EXPIRY_NOT_DUE"):
            self._simulate_scheduler_terminal_transaction("scheduler", "expired", trusted_now=NOW)
        self.assertEqual(self._creation(self.synthetic_recovery["key"])[2], "RECOVERABLE")
        self._mark(False)

    def test_tombstone_cleanup_order_retention_and_key_reuse(self):
        key = self.synthetic_recovery["key"]
        self._close(key, "TOMBSTONE")
        tombstone = self._creation(key)
        self.assertEqual((tombstone[0], tombstone[2], tombstone[10]), (key, "TOMBSTONE", None))
        self.assertEqual([tombstone[i] for i in range(len(tombstone)) if i not in (0, 2, 10)], [None] * 8)
        self.db.execute("UPDATE gameplay_battle_creations SET purge_after_ms=NULL WHERE idempotency_key_sha256=?", (key,))
        self.db.execute("DELETE FROM gameplay_battle_creations WHERE lifecycle_state='TOMBSTONE' AND purge_after_ms IS NOT NULL AND purge_after_ms<=?", (NOW,))
        self.assertEqual(self.db.execute("SELECT changes()").fetchone()[0], 0)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery'").fetchone()[0], 0)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id='synthetic-recovery'").fetchone()[0], 0)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_event_outbox WHERE battle_id='synthetic-recovery'").fetchone()[0], 0)
        self.assertEqual(self.db.execute("SELECT idempotency_key_sha256,battle_id FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (key,)).fetchone(), (key, None))
        with self.assertRaisesRegex(sqlite3.IntegrityError, "TOMBSTONE_RETENTION_ACTIVE"):
            self.db.execute("DELETE FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (key,))
        self.db.rollback()
        self._mark(False)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("DELETE FROM gameplay_battles WHERE battle_id='progressed'")
        self.db.rollback()
        self._mark(False)
        self.db.execute("UPDATE gameplay_battle_creations SET purge_after_ms=0 WHERE idempotency_key_sha256=?", (key,))
        self.db.execute("DELETE FROM gameplay_battles WHERE battle_id='synthetic-recovery'")
        self.db.execute("DELETE FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (key,))
        self.db.commit()
        self.assertIsNone(self._creation(key))
        self.db.execute("INSERT INTO gameplay_battles VALUES (?, 0, 'tactical_v1', 'created', ?, ?, ?)",
                        ("new-after-purge", state("new-after-purge"), NOW, NOW))
        self.db.execute("""INSERT INTO gameplay_battle_creations
          (idempotency_key_sha256,request_fingerprint_sha256,lifecycle_state,battle_id,
           deadline_at_ms,recovery_key_version,recovery_nonce_base64url,
           capabilities_ciphertext_base64url,recovery_generation,created_at_ms)
          VALUES (?,?,'CLOSED','new-after-purge',?,NULL,NULL,NULL,NULL,?)""",
                        (key, self.synthetic_recovery["fingerprint"], NOW + 60_000, NOW))
        self.db.commit()
        self.assertEqual(self._creation(key)[3], "new-after-purge")
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_battle_capabilities WHERE battle_id='new-after-purge'").fetchone()[0], 0)
        self._mark(True, 4)

    def test_tombstone_retains_digest_blocks_reuse_then_explicit_purge_allows_new_key(self):
        key = self.synthetic_recovery["key"]
        self._close(key, "TOMBSTONE")
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (key,)).fetchone()[0], 1)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("""INSERT INTO gameplay_battle_creations
              (idempotency_key_sha256,lifecycle_state,purge_after_ms)
              VALUES (?,'TOMBSTONE',NULL)""", (key,))
        self.db.rollback()
        self._mark(False)
        self.db.execute("UPDATE gameplay_battle_creations SET purge_after_ms=0 WHERE idempotency_key_sha256=?", (key,))
        self.db.execute("DELETE FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (key,))
        self.db.commit()
        self.assertIsNone(self._creation(key))
        self._mark(True, 2)

    def test_closed_and_tombstone_constraints_reject_recovery_material(self):
        for state_name in ("CLOSED", "TOMBSTONE"):
            with self.assertRaises(sqlite3.IntegrityError):
                self.db.execute("UPDATE gameplay_battle_creations SET lifecycle_state=?, capabilities_ciphertext_base64url='bad' WHERE idempotency_key_sha256=?", (state_name, self.synthetic_recovery["key"]))
            self.db.rollback()
            self._mark(False)
        self._mark(True)

    def test_restore_revokes_capabilities_before_access_and_keeps_tombstone_keys(self):
        key = self.synthetic_recovery["key"]
        # Synthetic restore copies are revoked first, then the old row is closed.
        self.db.execute("BEGIN IMMEDIATE")
        self.db.execute("DELETE FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery'")
        self._close(key, "CLOSED")
        self.db.commit()
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery'").fetchone()[0], 0)
        self.assertEqual(self._creation(key)[2], "CLOSED")
        self.assertIsNone(self.db.execute("SELECT token_sha256 FROM gameplay_battle_capabilities WHERE token_sha256=?", (self.synthetic_recovery["cap_a"],)).fetchone())
        self._close(digest(3), "TOMBSTONE")
        self.assertEqual(self.db.execute("SELECT lifecycle_state FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (digest(3),)).fetchone()[0], "TOMBSTONE")
        self._mark(True, 4)

    def test_two_connections_race_same_participant_cas_exactly_one_wins(self):
        # Use independent SQLite connections to one file, each with FK ON.
        barrier = threading.Barrier(2)
        outcomes = []
        lock = threading.Lock()

        def contender(command_id):
            db = connect(self.path)
            barrier.wait()
            try:
                db.execute("BEGIN IMMEDIATE")
                cursor = db.execute("UPDATE gameplay_battles SET version=version+1,phase='committed' WHERE battle_id='synthetic-recovery' AND version=0 AND phase='created'")
                if cursor.rowcount != 1:
                    raise ValueError("VERSION_CONFLICT")
                db.execute("UPDATE gameplay_battle_creations SET lifecycle_state='CLOSED', recovery_key_version=NULL, recovery_nonce_base64url=NULL, capabilities_ciphertext_base64url=NULL,recovery_generation=NULL WHERE idempotency_key_sha256=?", (self.synthetic_recovery["key"],))
                db.execute("INSERT INTO gameplay_command_receipts VALUES ('synthetic-recovery', ?, 'fp', 'COMMITTED', '[]', 1)", (command_id,))
                db.commit()
                result = "committed"
            except Exception as exc:
                db.rollback()
                result = type(exc).__name__
            finally:
                db.close()
            with lock:
                outcomes.append(result)

        threads = [threading.Thread(target=contender, args=(f"race-{i}",)) for i in range(2)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=10)
        self.assertEqual(outcomes.count("committed"), 1)
        self.assertEqual(self.db.execute("SELECT version FROM gameplay_battles WHERE battle_id='synthetic-recovery'").fetchone()[0], 1)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id='synthetic-recovery'").fetchone()[0], 1)
        self._mark(True, 3)

    def test_duplicate_receipt_race_and_rollback_preserve_state_and_outbox(self):
        before = self._counts(), self.db.execute("SELECT version,phase FROM gameplay_battles WHERE battle_id='progressed'").fetchone()
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO gameplay_command_receipts VALUES ('progressed','synthetic-receipt','new-fp','COMMITTED','[]',2)")
        self.db.rollback()
        self.assertEqual((self._counts(), self.db.execute("SELECT version,phase FROM gameplay_battles WHERE battle_id='progressed'").fetchone()), before)
        self._mark(False)
        self._mark(True)

    def test_revocation_races_participant_command_without_reopening_recovery(self):
        barrier = threading.Barrier(2)
        outcomes = []
        lock = threading.Lock()

        def revoke():
            db = connect(self.path)
            barrier.wait()
            db.execute("BEGIN IMMEDIATE")
            db.execute("DELETE FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery' AND side='A'")
            db.commit()
            db.close()
            with lock:
                outcomes.append("revoked")

        def commit():
            db = connect(self.path)
            barrier.wait()
            try:
                db.execute("BEGIN IMMEDIATE")
                cap = db.execute("SELECT token_sha256 FROM gameplay_battle_capabilities WHERE battle_id='synthetic-recovery' AND side='A'").fetchone()
                recovery = db.execute("SELECT lifecycle_state,recovery_generation FROM gameplay_battle_creations WHERE idempotency_key_sha256=?", (self.synthetic_recovery["key"],)).fetchone()
                if cap is None or cap[0] != self.synthetic_recovery["cap_a"] or recovery != ("RECOVERABLE", 7):
                    raise PermissionError("REVOCATION_WON")
                changed = db.execute("UPDATE gameplay_battles SET version=1,phase='committed' WHERE battle_id='synthetic-recovery' AND version=0")
                if changed.rowcount != 1:
                    raise ValueError("VERSION_CONFLICT")
                db.execute("UPDATE gameplay_battle_creations SET lifecycle_state='CLOSED',recovery_key_version=NULL,recovery_nonce_base64url=NULL,capabilities_ciphertext_base64url=NULL,recovery_generation=NULL WHERE idempotency_key_sha256=?", (self.synthetic_recovery["key"],))
                db.execute("INSERT INTO gameplay_command_receipts VALUES ('synthetic-recovery','race-command','fp','COMMITTED','[]',1)")
                db.commit()
                result = "committed"
            except Exception:
                db.rollback()
                result = "rejected"
            finally:
                db.close()
            with lock:
                outcomes.append(result)

        threads = [threading.Thread(target=revoke), threading.Thread(target=commit)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=10)
        self.assertIn("revoked", outcomes)
        self.assertEqual(outcomes.count("committed") + outcomes.count("rejected"), 1)
        self.assertEqual(self._creation(self.synthetic_recovery["key"])[2], "CLOSED")
        self.assertEqual(self._creation(self.synthetic_recovery["key"])[5:9], (None, None, None, None))
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM gameplay_command_receipts WHERE battle_id='synthetic-recovery'").fetchone()[0], outcomes.count("committed"))
        self.assertEqual(self.db.execute("SELECT version FROM gameplay_battles WHERE battle_id='synthetic-recovery'").fetchone()[0], outcomes.count("committed"))
        self._mark(True, 5)


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(Chat03B2SchemaV4ProbeTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    print(f"SYNTHETIC_SQLITE_CASES positive={Chat03B2SchemaV4ProbeTests.positive_cases} negative={Chat03B2SchemaV4ProbeTests.negative_cases}")
    raise SystemExit(not result.wasSuccessful())
