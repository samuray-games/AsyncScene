"""R288 regression: real byte-verified R287 trigger, original 05C V129 FINAL/CANCEL."""
from __future__ import annotations
import hashlib
import concurrent.futures
import importlib.util
import io
import json
import pathlib
import sqlite3
import sys
import tempfile
import threading
import time
import unittest
import zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from transaction_handler import SecurityTransactionHandler, TransactionBoundaryError, TransactionPoisoned

V129_HASH='29c92ba922d92925a1efdda0e9b747b353e490a68bbf8e060f728e69cb75fa06'
R287_DELTA_HASH='3bbab702f7c65d40df47827e275a4482ab570cc2dc0dd743396255dcd14bd450'
R287_ORIGINAL_HASH='f07f1f60d0043cf33829af3cf5423b967a050af42672a90b834c3753dda57d19'


def verified_zip_bytes(data,sha):
    assert hashlib.sha256(data).hexdigest()==sha,'ORIGINAL_SHA_MISMATCH'
    z=zipfile.ZipFile(io.BytesIO(data))
    assert z.testzip() is None,'ORIGINAL_BAD_CRC'
    for it in z.infolist():
        path=pathlib.PurePosixPath(it.filename)
        assert not path.is_absolute() and '..' not in path.parts and '\\' not in it.filename,'ZIP_TRAVERSAL'
        assert ((it.external_attr>>16)&0o170000) != 0o120000,'SYMLINK_NOT_ALLOWED'
    return z


def verify_originals_to(dest):
    raw_v129=(ROOT/'source_readonly/chat05c_v129_original.zip').read_bytes()
    with verified_zip_bytes(raw_v129,V129_HASH) as v129:
        n=json.loads(v129.read('tools/chat05c_v129_trusted_terminal_seam/FINAL_MANIFEST.json'))
        assert len(n['files'])==25
        for rec in n['files']:
            item=v129.read('tools/chat05c_v129_trusted_terminal_seam/'+rec['path'])
            assert len(item)==rec['bytes'] and hashlib.sha256(item).hexdigest()==rec['sha256']
    with verified_zip_bytes((ROOT/'source_readonly/chat040_r287_delta_original.zip').read_bytes(),R287_DELTA_HASH) as delta:
        manifest=json.loads(delta.read('FINAL_MANIFEST.json'))
        for name,rec in manifest['files'].items():
            raw=delta.read(name)
            assert len(raw)==rec['bytes'] and hashlib.sha256(raw).hexdigest()==rec['sha256']
        orig=delta.read('ORIGINAL_R287_NOT_MODIFIED.zip')
        with verified_zip_bytes(orig,R287_ORIGINAL_HASH) as inner:
            for file in inner.infolist():
                if file.is_dir():continue
                dst=dest/file.filename;dst.parent.mkdir(parents=True,exist_ok=True)
                dst.write_bytes(inner.read(file))
    assert (dest/'test_r287.py').exists()
    return dest


class ExactSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp_sources=tempfile.TemporaryDirectory(prefix='r288-source-')
        src=verify_originals_to(pathlib.Path(cls.tmp_sources.name))
        spec=importlib.util.spec_from_file_location('r288_original_r287_test',src/'test_r287.py')
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        cls.source=module
        cls.H=module.R287ExactOriginalIntegration
        cls.H.setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.H.tearDownClass()
        cls.tmp_sources.cleanup()

    def setUp(self):
        self.o=self.H('test_01_v129_sql_original_unchanged_and_trigger_exists')
        self.o.setUp()
        self.addCleanup(self.o.doCleanups)
        self.boundary=SecurityTransactionHandler(self.o.c)

    def test_01_original_r287_gap_reproduced_only_statement_is_undone(self):
        self.o.commit_terminal('FINAL')
        self.o.c.execute('BEGIN IMMEDIATE')
        self.o.c.execute("INSERT INTO actors VALUES('act:gap-before',1,1)")
        with self.assertRaisesRegex(sqlite3.IntegrityError,'R287_BATTLE_PERSON_BINDING_IMMUTABLE'):
            self.o.c.execute('UPDATE battles SET person_a=? WHERE battle_id=?',('per:forged',self.o.battle))
        self.o.c.execute("INSERT INTO actors VALUES('act:gap-after',1,1)")
        self.o.c.execute('COMMIT')
        self.assertEqual(self.o.c.execute("SELECT COUNT(*) FROM actors WHERE actor_id LIKE 'act:gap-%'").fetchone()[0],2)
        self.assertEqual(self.o.pair(),self.o.physical[:2])

    def _assert_poisoned_rolls_back(self,kind):
        self.o.commit_terminal(kind)
        before=self.o.snapshots()
        observed=[]
        def work(sql):
            sql.execute("INSERT INTO actors VALUES('act:r288-before',1,1)")
            try:
                sql.execute('UPDATE battles SET person_a=? WHERE battle_id=?',('per:forged',self.o.battle))
            except sqlite3.IntegrityError as ex:
                observed.append(str(ex))
            # The application catches the guard error and tries to continue.
            try: sql.execute("INSERT INTO actors VALUES('act:r288-after',1,1)")
            except TransactionPoisoned:observed.append('NO_POST_ABORT_INSERT')
            try:sql.commit()
            except TransactionBoundaryError:observed.append('NO_CALLBACK_COMMIT')
            return 'APP_HANDLED_ERROR_AND_RETURNED_SUCCESS'
        with self.assertRaises(TransactionPoisoned):self.boundary.run(work)
        self.assertEqual(observed,['R287_BATTLE_PERSON_BINDING_IMMUTABLE','NO_POST_ABORT_INSERT','NO_CALLBACK_COMMIT'])
        self.assertFalse(self.o.c.in_transaction)
        self.assertEqual(self.o.snapshots(),before)
        self.assertEqual(self.o.c.execute("SELECT COUNT(*) FROM actors WHERE actor_id LIKE 'act:r288-%'").fetchone()[0],0)
        with sqlite3.connect(self.o.dbpath) as other:
            self.assertEqual(other.execute("SELECT COUNT(*) FROM actors WHERE actor_id LIKE 'act:r288-%'").fetchone()[0],0)
            self.assertEqual(other.execute('SELECT person_a,person_b FROM battles WHERE battle_id=?',(self.o.battle,)).fetchone(),self.o.physical[:2])
        self.assertEqual(self.o.c.execute('SELECT COUNT(*) FROM v129_terminal_receipts').fetchone()[0],1)
        self.assertEqual(self.o.c.execute('SELECT COUNT(*) FROM gameplay_event_outbox').fetchone()[0],1)
        self.assertEqual(self.o.c.execute('SELECT COUNT(*) FROM v128_settlement_intent').fetchone()[0],1 if kind=='FINAL' else 0)

    def test_02_final_caught_abort_rolls_back_entire_managed_transaction(self):
        self._assert_poisoned_rolls_back('FINAL')

    def test_03_cancel_caught_abort_rolls_back_entire_managed_transaction_no_reward(self):
        self._assert_poisoned_rolls_back('CANCEL')

    def test_04_unhandled_abort_rolls_back_all_pending_dml(self):
        before=self.o.snapshots()
        def work(tx):
            tx.execute("INSERT INTO actors VALUES('act:will-rollback',1,1)")
            tx.execute('UPDATE battles SET person_b=? WHERE battle_id=?',('per:forged',self.o.battle))
        with self.assertRaisesRegex(sqlite3.IntegrityError,'R287_BATTLE_PERSON_BINDING_IMMUTABLE'):
            self.boundary.run(work)
        self.assertEqual(self.o.snapshots(),before)

    def test_05_legitimate_managed_transaction_commits_dml(self):
        result=self.boundary.run(lambda tx:(tx.execute("INSERT INTO actors VALUES('act:okay',1,1)"),tx.execute('SELECT 42').fetchone())[1])
        self.assertEqual(result,(42,))
        with sqlite3.connect(self.o.dbpath) as d:
            self.assertEqual(d.execute("SELECT COUNT(*) FROM actors WHERE actor_id='act:okay'").fetchone()[0],1)
        self.assertFalse(self.o.c.in_transaction)

    def test_06_caught_failed_preflight_poisoned_and_rolled_back(self):
        before=self.o.snapshots()
        def work(tx):
            tx.execute("INSERT INTO actors VALUES('act:precheck',1,1)")
            try:tx.require(False,'DENIED_IDENTITY_EPOCH')
            except TransactionPoisoned:pass
            try:tx.execute("INSERT INTO actors VALUES('act:second',1,1)")
            except TransactionPoisoned:pass
        with self.assertRaises(TransactionPoisoned):self.boundary.run(work)
        self.assertEqual(self.o.snapshots(),before)

    def test_07_caught_manual_commit_attempt_is_denied_rollback(self):
        before=self.o.snapshots()
        def work(tx):
            tx.execute("INSERT INTO actors VALUES('act:manual',1,1)")
            try:tx.execute('COMMIT')
            except TransactionBoundaryError:pass
            try:tx.commit()
            except TransactionBoundaryError:pass
        with self.assertRaises(TransactionPoisoned):self.boundary.run(work)
        self.assertEqual(self.o.snapshots(),before)

    def test_08_caught_schema_bypass_attempt_is_denied_rollback(self):
        before=self.o.snapshots()
        def work(tx):
            tx.execute("INSERT INTO actors VALUES('act:ddl',1,1)")
            try:tx.execute('DROP TRIGGER r287_battle_person_binding_immutable')
            except TransactionBoundaryError:pass
        with self.assertRaises(TransactionPoisoned):self.boundary.run(work)
        self.assertEqual(self.o.snapshots(),before)
        self.assertEqual(self.o.c.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='trigger' AND name='r287_battle_person_binding_immutable'").fetchone()[0],1)

    def test_09_existing_unmanaged_or_nested_transaction_fail_closed_before_work(self):
        self.o.c.execute('BEGIN IMMEDIATE')
        try:
            with self.assertRaises(TransactionBoundaryError):
                self.boundary.run(lambda tx:tx.execute("INSERT INTO actors VALUES('act:nested',1,1)"))
            self.assertEqual(self.o.c.execute("SELECT COUNT(*) FROM actors WHERE actor_id='act:nested'").fetchone()[0],0)
        finally:self.o.c.execute('ROLLBACK')

    def test_10_exact_retry_after_guard_failure_no_duplicate_receipt_or_settlement(self):
        request=self.o.signed(self.o.c,battle=self.o.battle,kind='FINAL')
        initial=self.o.seam.commit(request)
        before=self.o.snapshots()
        def bad(tx):
            tx.execute("INSERT INTO actors VALUES('act:retry-poison',1,1)")
            try:tx.execute('UPDATE battles SET person_a=? WHERE battle_id=?',('per:forged',self.o.battle))
            except sqlite3.IntegrityError:pass
        with self.assertRaises(TransactionPoisoned):self.boundary.run(bad)
        second=self.o.seam.commit(request)
        self.assertEqual(second['status'],'SEALED_REPLAY')
        self.assertEqual(second['receipt_sha256'],initial['receipt_sha256'])
        self.assertEqual(self.o.snapshots(),before)
        self.assertEqual(self.o.c.execute('SELECT COUNT(*) FROM v128_settlement_intent').fetchone()[0],1)

    def test_11_second_connection_sees_no_partial_changes_after_rejected_identity(self):
        # Test a separate file-backed reader after the full application abort.
        self.o.commit_terminal('CANCEL')
        before=self.o.snapshots()
        def bad(tx):
            tx.execute("INSERT INTO actors VALUES('act:visible-if-broken',1,1)")
            try:tx.execute('UPDATE battles SET person_b=? WHERE battle_id=?',('per:forged',self.o.battle))
            except sqlite3.IntegrityError:pass
        with self.assertRaises(TransactionPoisoned):self.boundary.run(bad)
        with sqlite3.connect(self.o.dbpath,timeout=3) as reader:
            self.assertEqual(reader.execute("SELECT COUNT(*) FROM actors WHERE actor_id='act:visible-if-broken'").fetchone()[0],0)
            self.assertEqual(reader.execute('SELECT COUNT(*) FROM v129_terminal_receipts').fetchone()[0],1)
        self.assertEqual(self.o.snapshots(),before)

    def test_12_repeat_after_reopen_no_pending_effects(self):
        before=self.o.snapshots()
        def bad(tx):
            tx.execute("INSERT INTO actors VALUES('act:reopen',1,1)")
            try:tx.execute('UPDATE battles SET person_a=? WHERE battle_id=?',('per:forged',self.o.battle))
            except sqlite3.IntegrityError:pass
        with self.assertRaises(TransactionPoisoned):self.boundary.run(bad)
        with sqlite3.connect(self.o.dbpath,timeout=4) as reopened:
            self.assertEqual(reopened.execute("SELECT COUNT(*) FROM actors WHERE actor_id='act:reopen'").fetchone()[0],0)
            self.assertEqual(reopened.execute('SELECT person_a,person_b FROM battles WHERE battle_id=?',(self.o.battle,)).fetchone(),self.o.physical[:2])
        self.assertEqual(self.o.snapshots(),before)

    def test_13_concurrent_second_writer_commits_only_after_poison_rollback(self):
        self.o.commit_terminal('FINAL')
        before=self.o.snapshots()
        ready=threading.Event()
        release=threading.Event()
        def poisoned_writer():
            c=sqlite3.connect(self.o.dbpath,timeout=10,isolation_level=None)
            try:
                h=SecurityTransactionHandler(c)
                def work(tx):
                    tx.execute("INSERT INTO actors VALUES('act:poisoned-thread',1,1)")
                    try:tx.execute('UPDATE battles SET person_b=? WHERE battle_id=?',('per:forged',self.o.battle))
                    except sqlite3.IntegrityError:pass
                    ready.set()
                    self.assertTrue(release.wait(timeout=8))
                with self.assertRaises(TransactionPoisoned):h.run(work)
                return 'ROLLED_BACK'
            finally:c.close()
        def good_writer():
            self.assertTrue(ready.wait(timeout=8))
            c=sqlite3.connect(self.o.dbpath,timeout=10,isolation_level=None)
            try:
                h=SecurityTransactionHandler(c)
                h.run(lambda tx:tx.execute("INSERT INTO actors VALUES('act:good-thread',1,1)"))
                return 'COMMITTED'
            finally:c.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            a=pool.submit(poisoned_writer)
            b=pool.submit(good_writer)
            self.assertTrue(ready.wait(timeout=8))
            time.sleep(0.10)
            release.set()
            self.assertEqual(a.result(timeout=10),'ROLLED_BACK')
            self.assertEqual(b.result(timeout=10),'COMMITTED')
        self.assertEqual(self.o.c.execute("SELECT COUNT(*) FROM actors WHERE actor_id='act:poisoned-thread'").fetchone()[0],0)
        self.assertEqual(self.o.c.execute("SELECT COUNT(*) FROM actors WHERE actor_id='act:good-thread'").fetchone()[0],1)
        for table in ('v129_terminal_receipts','gameplay_event_outbox','v128_settlement_intent'):
            self.assertEqual(self.o.c.execute('SELECT COUNT(*) FROM '+table).fetchone()[0],1)
        self.assertEqual(self.o.pair(),self.o.physical[:2])

    def test_14_caught_lazy_fetch_sql_error_poisoned(self):
        # The first SQL step succeeds, but the error is deferred until fetchall.
        self.o.c.create_function('r288_fail',1,lambda _:(_ for _ in ()).throw(RuntimeError('bad source')))
        before=self.o.snapshots()
        observed=[]
        def work(tx):
            tx.execute("INSERT INTO actors VALUES('act:lazy-error',1,1)")
            cursor=tx.execute('SELECT 1 UNION ALL SELECT r288_fail(1)')
            observed.append('EXECUTE_RETURNED')
            try:cursor.fetchall()
            except sqlite3.OperationalError:observed.append('FETCH_FAILED')
        with self.assertRaises(TransactionPoisoned):self.boundary.run(work)
        self.assertEqual(observed,['EXECUTE_RETURNED','FETCH_FAILED'])
        self.assertEqual(self.o.snapshots(),before)

    def test_15_caught_batch_generator_failure_poisoned(self):
        before=self.o.snapshots()
        def broken_rows():
            yield ('act:batch-first',1,1)
            raise ValueError('synthetic input stream failed')
        def work(tx):
            try:tx.executemany('INSERT INTO actors VALUES(?,?,?)',broken_rows())
            except ValueError:pass
        with self.assertRaises(TransactionPoisoned):self.boundary.run(work)
        self.assertEqual(self.o.snapshots(),before)

    def test_16_callback_general_exception_rolls_back_even_after_dml(self):
        before=self.o.snapshots()
        def work(tx):
            tx.execute("INSERT INTO actors VALUES('act:exception',1,1)")
            raise RuntimeError('application failed after write')
        with self.assertRaisesRegex(RuntimeError,'application failed'):
            self.boundary.run(work)
        self.assertEqual(self.o.snapshots(),before)

    def test_17_early_exception_before_begin_is_not_a_false_rollback_claim(self):
        with self.assertRaisesRegex(TransactionBoundaryError,'UNCONTROLLED_OR_NESTED_TRANSACTION'):
            self.o.c.execute('BEGIN IMMEDIATE')
            try:self.boundary.run(lambda tx:None)
            finally:self.o.c.execute('ROLLBACK')


if __name__=='__main__':
    unittest.main(verbosity=2)
