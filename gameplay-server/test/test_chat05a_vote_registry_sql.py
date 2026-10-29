import json
import sqlite3
import tempfile
import threading
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [
    ROOT / "migrations" / f"{n:04d}_{name}.sql"
    for n, name in (
        (1, "tactical_state"), (2, "battle_capabilities"),
        (3, "idempotent_battle_creation"), (4, "capability_generation"),
        (5, "participant_transition_fence"), (6, "creation_recovery_lifecycle"),
        (7, "capability_operator_lifecycle"), (8, "chat05a_people_and_votes"),
    )
]
NOW = 1_800_000_000_000


def digest(label):
    import hashlib
    return hashlib.sha256(label.encode()).hexdigest()


def open_db(path=":memory:"):
    db = sqlite3.connect(path, timeout=15, isolation_level=None)
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("PRAGMA busy_timeout=15000")
    for migration in MIGRATIONS:
        db.executescript(migration.read_text(encoding="utf-8"))
    return db


class Chat05ARegistryAndVotesTests(unittest.TestCase):
    def setUp(self):
        self.db = open_db()
        self.seed_battle(self.db, "battle-1", "DRAW")
        for person_id in ("participant-a", "participant-b", "spectator-a", "spectator-b"):
            self.person(self.db, person_id)
        self.bind_participant(self.db, "battle-1", "A", "participant-a")
        self.bind_participant(self.db, "battle-1", "B", "participant-b")
        self.cap(self.db, "battle-1", "spectator-a", "secret-a")
        self.cap(self.db, "battle-1", "spectator-b", "secret-b")
        self.vote(self.db, "battle-1", "vote-battle-1")

    def tearDown(self):
        self.db.close()

    @staticmethod
    def seed_battle(db, battle_id, outcome):
        state = {"battleId": battle_id, "phase": "revealed", "mechanicalOutcome": outcome}
        db.execute(
            "INSERT INTO gameplay_battles VALUES (?,0,'tactical_v1','revealed',?,?,?)",
            (battle_id, json.dumps(state), NOW, NOW),
        )

    @staticmethod
    def person(db, person_id):
        db.execute("INSERT INTO gameplay_persons(person_id,created_at_ms) VALUES (?,?)",
                   (person_id, NOW))

    @staticmethod
    def bind_participant(db, battle_id, side, person_id):
        db.execute("INSERT INTO gameplay_battle_persons VALUES (?,?,?)",
                   (battle_id, side, person_id))

    @staticmethod
    def cap(db, battle_id, person_id, raw_secret, generation=1):
        token_hash = digest(raw_secret)
        db.execute(
            """INSERT INTO gameplay_battle_spectator_capabilities
               (battle_id,person_id,token_sha256,created_at_ms,status,generation)
               VALUES (?,?,?,?,'active',?)""",
            (battle_id, person_id, token_hash, NOW, generation),
        )
        return token_hash

    @staticmethod
    def vote(db, battle_id, vote_id):
        db.execute(
            """INSERT INTO gameplay_social_votes
               (vote_id,battle_id,trigger_reason,status,created_at_ms)
               VALUES (?,?,'DRAW','open',?)""",
            (vote_id, battle_id, NOW),
        )

    @staticmethod
    def cast(db, battle_id, vote_id, raw_secret, generation=1, choice="A", now=NOW):
        return db.execute(
            """INSERT INTO gameplay_cast_social_vote
               (battle_id,vote_id,token_sha256,expected_generation,choice,trusted_now_ms)
               VALUES (?,?,?,?,?,?)""",
            (battle_id, vote_id, digest(raw_secret), generation, choice, now),
        )

    def test_vote_requires_revealed_draw_and_one_vote_per_battle(self):
        self.seed_battle(self.db, "not-draw", "A_WIN")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "SOCIAL_VOTE_TRIGGER_NOT_MET"):
            self.vote(self.db, "not-draw", "vote-not-draw")
        self.seed_battle(self.db, "not-revealed", "DRAW")
        state = {"battleId":"not-revealed","phase":"committed","mechanicalOutcome":"DRAW"}
        self.db.execute(
            "UPDATE gameplay_battles SET phase='committed',state_json=? WHERE battle_id='not-revealed'",
            (json.dumps(state),),
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "SOCIAL_VOTE_TRIGGER_NOT_MET"):
            self.vote(self.db, "not-revealed", "vote-not-revealed")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "UNIQUE constraint failed"):
            self.vote(self.db, "battle-1", "different-vote-id")
        self.assertEqual(self.db.execute(
            "SELECT vote_id FROM gameplay_social_votes WHERE battle_id='battle-1'"
        ).fetchone()[0], "vote-battle-1")

    def test_person_registry_and_battle_binding_are_immutable(self):
        self.person(self.db, "registered-person")
        key = digest("registration-key")
        self.db.execute(
            "INSERT INTO gameplay_person_registration_requests VALUES (?,?,?)",
            (key, "registered-person", NOW),
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "UNIQUE constraint failed"):
            self.db.execute(
                "INSERT INTO gameplay_person_registration_requests VALUES (?,?,?)",
                (key, "spectator-a", NOW),
            )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "PERSON_IDENTITY_IMMUTABLE"):
            self.db.execute(
                "UPDATE gameplay_persons SET person_id='different-id' WHERE person_id='registered-person'"
            )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "BATTLE_PERSON_IDENTITY_IMMUTABLE"):
            self.db.execute(
                "DELETE FROM gameplay_battle_persons WHERE battle_id='battle-1' AND side='A'"
            )

    def test_ballot_identity_comes_from_active_capability_not_request_data(self):
        self.cast(self.db, "battle-1", "vote-battle-1", "secret-a", choice="B")
        self.assertEqual(self.db.execute(
            "SELECT person_id,choice FROM gameplay_social_ballots WHERE vote_id='vote-battle-1'"
        ).fetchone(), ("spectator-a", "B"))

    def test_participants_and_unknown_or_uninvited_spectators_are_rejected(self):
        participant_hash = digest("participant-capability")
        self.db.execute(
            """INSERT INTO gameplay_battle_capabilities
               (battle_id,side,participant_id,token_sha256,created_at_ms,status,generation)
               VALUES ('battle-1','A','legacy-A',?,?,'active',1)""",
            (participant_hash, NOW),
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_SPECTATOR_CAPABILITY"):
            self.cast(self.db, "battle-1", "vote-battle-1", "participant-capability")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_SPECTATOR_CAPABILITY"):
            self.cast(self.db, "battle-1", "vote-battle-1", "not-issued")
        self.cap(self.db, "battle-1", "participant-a", "participant-as-spectator")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "PARTICIPANT_CANNOT_VOTE"):
            self.cast(self.db, "battle-1", "vote-battle-1", "participant-as-spectator")

    def test_ballot_is_one_per_person_and_immutable_even_after_reissue(self):
        self.cast(self.db, "battle-1", "vote-battle-1", "secret-a", choice="A")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "BALLOT_ALREADY_CAST"):
            self.cast(self.db, "battle-1", "vote-battle-1", "secret-a", choice="B")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "SOCIAL_BALLOT_IMMUTABLE"):
            self.db.execute("UPDATE gameplay_social_ballots SET choice='B' WHERE vote_id='vote-battle-1'")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "SOCIAL_BALLOT_IMMUTABLE"):
            self.db.execute("DELETE FROM gameplay_social_ballots WHERE vote_id='vote-battle-1'")
        old_hash = digest("secret-a")
        new_hash = self.reissue(self.db, "battle-1", "spectator-a", old_hash, "secret-a-new", 1, "active")
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_SPECTATOR_CAPABILITY"):
            self.cast(self.db, "battle-1", "vote-battle-1", "secret-a", generation=2)
        with self.assertRaisesRegex(sqlite3.IntegrityError, "BALLOT_ALREADY_CAST"):
            self.db.execute(
                """INSERT INTO gameplay_cast_social_vote
                   VALUES ('battle-1','vote-battle-1',?,2,'B',?)""",
                (new_hash, NOW),
            )

    @staticmethod
    def reissue(db, battle_id, person_id, old_hash, new_secret, old_generation, old_status):
        new_hash = digest(new_secret)
        cursor = db.execute(
            """UPDATE gameplay_battle_spectator_capabilities
               SET status='active',token_sha256=?,generation=generation+1
               WHERE battle_id=? AND person_id=? AND token_sha256=?
                 AND status=? AND generation=?""",
            (new_hash,battle_id,person_id,old_hash,old_status,old_generation),
        )
        if cursor.rowcount != 1:
            raise AssertionError("expected exactly one capability generation transition")
        return new_hash

    def test_revocation_and_reissue_invalidate_old_secret(self):
        old_hash = digest("secret-a")
        self.db.execute(
            """UPDATE gameplay_battle_spectator_capabilities
               SET status='revoked',generation=generation+1
               WHERE battle_id='battle-1' AND person_id='spectator-a' AND generation=1""",
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_SPECTATOR_CAPABILITY"):
            self.cast(self.db, "battle-1", "vote-battle-1", "secret-a", generation=2)
        new_hash = self.reissue(
            self.db, "battle-1", "spectator-a", old_hash, "secret-a-new", 2, "revoked"
        )
        with self.assertRaisesRegex(sqlite3.IntegrityError, "INVALID_SPECTATOR_CAPABILITY"):
            self.cast(self.db, "battle-1", "vote-battle-1", "secret-a", generation=3)
        self.cast(self.db, "battle-1", "vote-battle-1", "secret-a-new", generation=3)
        self.assertEqual(self.db.execute(
            "SELECT token_sha256,status,generation FROM gameplay_battle_spectator_capabilities WHERE battle_id='battle-1' AND person_id='spectator-a'"
        ).fetchone(), (new_hash, "active", 3))

    def test_parallel_duplicate_ballots_have_one_database_winner(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = str(Path(tmp) / "race.sqlite")
            setup = open_db(path)
            self.seed_battle(setup, "race-battle", "DRAW")
            self.person(setup, "race-spectator")
            self.cap(setup, "race-battle", "race-spectator", "race-secret")
            self.vote(setup, "race-battle", "vote-race")
            setup.close()

            barrier = threading.Barrier(2)
            outcomes = []
            lock = threading.Lock()

            def cast(choice):
                conn = sqlite3.connect(path, timeout=15, isolation_level=None)
                conn.execute("PRAGMA foreign_keys=ON")
                conn.execute("PRAGMA busy_timeout=15000")
                barrier.wait()
                try:
                    conn.execute(
                        """INSERT INTO gameplay_cast_social_vote
                           VALUES ('race-battle','vote-race',?,?,?,?)""",
                        (digest("race-secret"), 1, choice, NOW),
                    )
                    result = "inserted"
                except sqlite3.IntegrityError as error:
                    result = str(error)
                with lock:
                    outcomes.append(result)
                conn.close()

            threads = [threading.Thread(target=cast, args=(choice,)) for choice in ("A", "B")]
            for thread in threads: thread.start()
            for thread in threads: thread.join()
            self.assertEqual(outcomes.count("inserted"), 1)
            self.assertTrue(any("BALLOT_ALREADY_CAST" in x or "UNIQUE constraint failed" in x for x in outcomes))
            self.assertEqual(sqlite3.connect(path).execute(
                "SELECT COUNT(*) FROM gameplay_social_ballots WHERE vote_id='vote-race' AND person_id='race-spectator'"
            ).fetchone()[0], 1)


if __name__ == "__main__":
    unittest.main()
