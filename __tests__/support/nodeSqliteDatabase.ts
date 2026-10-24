/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import type {
  Database,
  ExecuteResult,
  Row,
  SqlExecutor,
  SqlValue,
} from '../../src/database';

/**
 * Test-only adapter running the app's SQL on Node's built-in SQLite,
 * so schema and repositories can be verified without a device.
 */
export function createNodeSqliteDatabase(path = ':memory:'): Database & {
  close(): void;
} {
  const connection = new DatabaseSync(path);
  let inTransaction = false;

  const executor: SqlExecutor = {
    async execute(sql, params = []): Promise<ExecuteResult> {
      const result = connection.prepare(sql).run(...toNode(params));
      return {
        changes: Number(result.changes),
        insertId: Number(result.lastInsertRowid),
      };
    },
    async query(sql, params = []): Promise<Row[]> {
      return connection.prepare(sql).all(...toNode(params)) as Row[];
    },
  };

  return {
    ...executor,
    async transaction(work) {
      if (inTransaction) {
        throw new Error('Nested transactions are not supported');
      }
      inTransaction = true;
      connection.exec('BEGIN');
      try {
        const result = await work(executor);
        connection.exec('COMMIT');
        return result;
      } catch (error) {
        connection.exec('ROLLBACK');
        throw error;
      } finally {
        inTransaction = false;
      }
    },
    close() {
      connection.close();
    },
  };
}

function toNode(params: readonly SqlValue[]): Array<string | number | null> {
  return [...params];
}
