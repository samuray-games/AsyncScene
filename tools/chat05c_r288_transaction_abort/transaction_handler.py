"""Isolated application transaction seam fixing R287's swallowed-ABORT gap.

The trusted caller MUST submit ALL security-effective work through `run(work)`
and ONLY through the supplied scope. No raw sqlite.Connection is exposed to work.
Not a sandbox against privileged Python that already possesses the raw connection;
not the production Worker handler, native D1, nor an external rollback witness.
"""
from __future__ import annotations

import re
import sqlite3
from typing import Callable, TypeVar

T = TypeVar('T')


class TransactionRejected(RuntimeError):
    """A transaction was denied. Its own previously completed statements were rolled back."""


class TransactionPoisoned(TransactionRejected):
    """A caught statement error permanently poisoned this transaction."""


class TransactionBoundaryError(TransactionRejected):
    """Unsafe transaction control or schema operation was requested inside a scope."""


class _ReadResult:
    """Only row retrieval, no cursor.execute() bypass of the statement monitor."""
    __slots__ = ('__cursor', '__scope')

    def __init__(self, cursor: sqlite3.Cursor, scope):
        self.__cursor = cursor
        self.__scope = scope

    def fetchone(self):
        self.__scope._ensure_open()
        try:
            return self.__cursor.fetchone()
        except BaseException:
            self.__scope._poison()
            raise

    def fetchall(self):
        self.__scope._ensure_open()
        try:
            return self.__cursor.fetchall()
        except BaseException:
            self.__scope._poison()
            raise

    @property
    def rowcount(self):
        return self.__cursor.rowcount


class _ScopedSQL:
    """A deliberately restricted SQLite operation capability for one `run`."""
    __slots__ = ('__connection', '__poisoned', '__closed')
    _ALLOWED = frozenset({'SELECT', 'INSERT', 'UPDATE', 'DELETE'})

    def __init__(self, connection: sqlite3.Connection):
        self.__connection = connection
        self.__poisoned = False
        self.__closed = False

    def _ensure_open(self):
        if self.__closed:
            raise TransactionBoundaryError('SECURITY_TRANSACTION_SCOPE_CLOSED')
        if self.__poisoned:
            raise TransactionPoisoned('SECURITY_TRANSACTION_ALREADY_POISONED')

    def _poison(self):
        self.__poisoned = True

    @property
    def poisoned(self):
        return self.__poisoned

    def require(self, accepted: bool, reason: str = 'SECURITY_CHECK_DENIED'):
        """For preflight issuer/binding checks that fail outside SQLite statements."""
        self._ensure_open()
        if accepted is not True:
            self.__poisoned = True
            raise TransactionPoisoned(reason)

    def execute(self, sql: str, parameters=()):
        self._ensure_open()
        if not isinstance(sql, str):
            self.__poisoned = True
            raise TransactionBoundaryError('SQL_TEXT_REQUIRED')
        command = re.match(r'^\s*([a-zA-Z]+)\b', sql)
        if command is None or command.group(1).upper() not in self._ALLOWED:
            self.__poisoned = True
            raise TransactionBoundaryError('UNAUTHORIZED_SQL_OR_TRANSACTION_CONTROL')
        # Every SQL error, including a trigger's RAISE(ABORT), is latched
        # even when the callback catches the original exception.
        try:
            return _ReadResult(self.__connection.execute(sql, parameters), self)
        except BaseException:
            self.__poisoned = True
            raise

    def executemany(self, sql: str, parameter_sets):
        self._ensure_open()
        last = None
        try:
            for parameters in parameter_sets:
                last = self.execute(sql, parameters)
        except BaseException:
            self._poison()
            raise
        return last

    def commit(self):
        self.__poisoned = True
        raise TransactionBoundaryError('CALLER_COMMIT_FORBIDDEN')

    def rollback(self):
        self._poison()
        raise TransactionBoundaryError('CALLER_TRANSACTION_CONTROL_FORBIDDEN')

    def _close(self):
        self.__closed = True


class SecurityTransactionHandler:
    """One physical connection/BEGIN IMMEDIATE/COMMIT-or-ROLLBACK owner.

    The callback receives only the restricted scope. ALL statement errors poison
    the transaction, regardless of whether the callback catches them. A poisoned
    callback cannot continue DML or commit. This is an application contract:
    the caller must not hold or use a second raw reference to the connection.
    """

    def __init__(self, connection: sqlite3.Connection):
        if not isinstance(connection, sqlite3.Connection):
            raise TransactionBoundaryError('SQLITE_CONNECTION_REQUIRED')
        self.__connection = connection
        self.__running = False

    def run(self, callback: Callable[[_ScopedSQL], T]) -> T:
        if self.__running or self.__connection.in_transaction:
            raise TransactionBoundaryError('UNCONTROLLED_OR_NESTED_TRANSACTION')
        self.__running = True
        scope = _ScopedSQL(self.__connection)
        started = False
        try:
            self.__connection.execute('BEGIN IMMEDIATE')
            started = True
            value = callback(scope)
            if scope.poisoned:
                raise TransactionPoisoned('SECURITY_TRANSACTION_POISONED_BEFORE_COMMIT')
            self.__connection.execute('COMMIT')
            return value
        except BaseException as error:
            if started and self.__connection.in_transaction:
                try:
                    self.__connection.execute('ROLLBACK')
                except BaseException as rollback_error:
                    # Fail hard: never claim an all-or-nothing rollback if it fails.
                    raise TransactionBoundaryError('ROLLBACK_FAILED_NOT_VERIFIED') from rollback_error
            raise
        finally:
            scope._close()
            self.__running = False
