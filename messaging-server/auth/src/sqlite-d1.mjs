import { DatabaseSync } from 'node:sqlite';

class BoundStatement {
  constructor(database, sql, values = []) { this.database = database; this.sql = sql; this.values = values; }
  bind(...values) { return new BoundStatement(this.database, this.sql, values); }
  async first(columnName) {
    const row = await this.database.enqueue(() => this.database.native.prepare(this.sql).get(...this.values));
    if (columnName && row) return row[columnName];
    return row || null;
  }
  async all() {
    const results = await this.database.enqueue(() => this.database.native.prepare(this.sql).all(...this.values));
    return { success: true, results };
  }
  async run() {
    const result = await this.database.enqueue(() => this.database.native.prepare(this.sql).run(...this.values));
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
  }
}

/** Small D1 API adapter backed by Node's real SQLite engine for local-only tests and dev. */
export class LocalSQLiteD1 {
  constructor(path = ':memory:') {
    this.native = new DatabaseSync(path);
    this.tail = Promise.resolve();
    this.native.exec('PRAGMA foreign_keys = ON');
  }
  enqueue(operation) {
    const result = this.tail.then(operation);
    this.tail = result.catch(() => {});
    return result;
  }
  prepare(sql) { return new BoundStatement(this, sql); }
  async exec(sql) {
    return this.enqueue(() => {
      this.native.exec(sql);
      return { count: 0, duration: 0, success: true };
    });
  }
  async batch(statements) {
    return this.enqueue(() => {
      this.native.exec('BEGIN IMMEDIATE');
      try {
        const results = statements.map((statement) => {
          const result = this.native.prepare(statement.sql).run(...statement.values);
          return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
        });
        this.native.exec('COMMIT');
        return results;
      } catch (error) {
        this.native.exec('ROLLBACK');
        throw error;
      }
    });
  }
  close() { this.native.close(); }
}
