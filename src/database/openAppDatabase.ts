import { open, type DB, type Scalar } from '@op-engineering/op-sqlite';
import type {
  Database,
  ExecuteResult,
  Row,
  SqlExecutor,
  SqlValue,
} from './Database';

const DATABASE_FILE = 'spa-da-costura.db';

type NativeExecutor = Pick<DB, 'execute'>;

/**
 * Opens the on-device SQLite file. Kept out of `index.ts` so code running on
 * Node (tests) never loads the native module; only `src/app` imports it.
 */
export function openAppDatabase(): Database {
  const db = open({ name: DATABASE_FILE });
  return {
    ...wrap(db),
    async transaction(work) {
      let result: Awaited<ReturnType<typeof work>> | undefined;
      await db.transaction(async tx => {
        result = await work(wrap(tx));
      });
      return result as Awaited<ReturnType<typeof work>>;
    },
  };
}

function wrap(native: NativeExecutor): SqlExecutor {
  return {
    async execute(sql, params = []): Promise<ExecuteResult> {
      const result = await native.execute(sql, toScalars(params));
      return { changes: result.rowsAffected, insertId: result.insertId };
    },
    async query(sql, params = []): Promise<Row[]> {
      const result = await native.execute(sql, toScalars(params));
      return result.rows as Row[];
    },
  };
}

function toScalars(params: readonly SqlValue[]): Scalar[] {
  return [...params];
}
